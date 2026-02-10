import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryDashboardValues } from '@bizflow/types';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: QueryDashboardValues) {
    const { outletId } = query;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(subDays(today, 1));
    const yesterdayEnd = endOfDay(subDays(today, 1));

    // Build where clause for outlet filter
    const whereClause: any = {
      status: 'completed',
    };
    if (outletId) {
      whereClause.outletId = outletId;
    }

    // 1. Sales Today Summary
    const salesToday = await this.prisma.salesOrder.aggregate({
      where: {
        ...whereClause,
        orderDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const salesYesterday = await this.prisma.salesOrder.aggregate({
      where: {
        ...whereClause,
        orderDate: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const totalSalesToday = Number(salesToday._sum.total || 0);
    const totalSalesYesterday = Number(salesYesterday._sum.total || 0);
    const transactionCountToday = salesToday._count.id;
    const transactionCountYesterday = salesYesterday._count.id;

    const salesChange =
      totalSalesYesterday > 0
        ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100
        : 0;

    const transactionChange =
      transactionCountYesterday > 0
        ? ((transactionCountToday - transactionCountYesterday) /
            transactionCountYesterday) *
          100
        : 0;

    const averagePerTransaction =
      transactionCountToday > 0 ? totalSalesToday / transactionCountToday : 0;

    const summary = {
      totalSalesToday,
      transactionCountToday,
      averagePerTransaction,
      salesChange,
      transactionChange,
    };

    // 2. Top 5 Products Today
    const topProductsData = await this.prisma.salesOrderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          ...whereClause,
          orderDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          variantId: item.variantId,
          productName: variant?.product.name || 'Unknown',
          variantName: variant?.name || '',
          sku: variant?.sku || '',
          quantity: Number(item._sum.quantity || 0),
        };
      }),
    );

    // 3. Stock Alerts (low stock count)
    const lowStockCount = await this.prisma.stock.count({
      where: {
        variant: {
          product: {
            minStock: {
              gt: 0,
            },
          },
        },
        AND: [
          {
            quantity: {
              lte: this.prisma.stock.fields.quantity,
            },
          },
        ],
      },
    });

    // Get actual low stock items
    const lowStockItems = await this.prisma.stock.findMany({
      where: {
        variant: {
          product: {
            minStock: {
              gt: 0,
            },
          },
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
                minStock: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    const stockAlerts = lowStockItems
      .filter((stock) => {
        const minStock = stock.variant.product.minStock || 0;
        return Number(stock.quantity) <= minStock;
      })
      .map((stock) => ({
        variantId: stock.variantId,
        productName: stock.variant.product.name,
        variantName: stock.variant.name,
        sku: stock.variant.sku,
        warehouse: stock.warehouse.name,
        currentStock: Number(stock.quantity),
        minStock: Number(stock.variant.product.minStock || 0),
      }));

    // 4. Recent 10 Transactions
    const recentTransactions = await this.prisma.salesOrder.findMany({
      where: outletId ? { outletId } : {},
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const transactions = recentTransactions.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customerName: order.customer?.name || 'Walk-in',
      cashierName: order.user.name,
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
    }));

    return {
      summary,
      topProducts,
      stockAlerts: {
        count: stockAlerts.length,
        items: stockAlerts,
      },
      recentTransactions: transactions,
    };
  }
}
