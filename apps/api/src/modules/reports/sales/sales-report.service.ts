import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuerySalesReportValues } from '@bizflow/types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  format,
} from 'date-fns';

@Injectable()
export class SalesReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: QuerySalesReportValues) {
    const {
      period = 'today',
      startDate,
      endDate,
      outletId,
      categoryId,
      page = 1,
      pageSize = 10,
    } = query;

    // Determine date range based on period
    let dateFrom: Date;
    let dateTo: Date;
    let previousDateFrom: Date;
    let previousDateTo: Date;

    const now = new Date();

    switch (period) {
      case 'today':
        dateFrom = startOfDay(now);
        dateTo = endOfDay(now);
        previousDateFrom = startOfDay(subDays(now, 1));
        previousDateTo = endOfDay(subDays(now, 1));
        break;
      case 'week':
        dateFrom = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        dateTo = endOfWeek(now, { weekStartsOn: 1 });
        previousDateFrom = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        previousDateTo = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case 'month':
        dateFrom = startOfMonth(now);
        dateTo = endOfMonth(now);
        previousDateFrom = startOfMonth(subMonths(now, 1));
        previousDateTo = endOfMonth(subMonths(now, 1));
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('startDate and endDate required for custom period');
        }
        dateFrom = startOfDay(new Date(startDate));
        dateTo = endOfDay(new Date(endDate));
        const daysDiff = Math.ceil(
          (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24),
        );
        previousDateFrom = startOfDay(subDays(dateFrom, daysDiff));
        previousDateTo = endOfDay(subDays(dateTo, daysDiff));
        break;
    }

    // Build where clause
    const whereClause: any = {
      status: 'completed',
      orderDate: {
        gte: dateFrom,
        lte: dateTo,
      },
    };

    if (outletId) {
      whereClause.outletId = outletId;
    }

    if (categoryId) {
      whereClause.items = {
        some: {
          variant: {
            product: {
              categoryId,
            },
          },
        },
      };
    }

    // 1. Current Period Summary
    const currentSummary = await this.prisma.salesOrder.aggregate({
      where: whereClause,
      _sum: {
        total: true,
        subtotal: true,
        discountAmount: true,
        taxAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Previous Period Summary (for comparison)
    const previousWhereClause = {
      ...whereClause,
      orderDate: {
        gte: previousDateFrom,
        lte: previousDateTo,
      },
    };

    const previousSummary = await this.prisma.salesOrder.aggregate({
      where: previousWhereClause,
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const totalSales = Number(currentSummary._sum.total || 0);
    const totalTransactions = currentSummary._count.id;
    const totalDiscount = Number(currentSummary._sum.discountAmount || 0);
    const totalTax = Number(currentSummary._sum.taxAmount || 0);
    const averagePerTransaction =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    const previousTotalSales = Number(previousSummary._sum.total || 0);
    const previousTotalTransactions = previousSummary._count.id;

    const salesChange =
      previousTotalSales > 0
        ? ((totalSales - previousTotalSales) / previousTotalSales) * 100
        : 0;

    const transactionChange =
      previousTotalTransactions > 0
        ? ((totalTransactions - previousTotalTransactions) /
            previousTotalTransactions) *
          100
        : 0;

    const summary = {
      totalSales,
      totalTransactions,
      totalDiscount,
      totalTax,
      averagePerTransaction,
      salesChange,
      transactionChange,
    };

    // 3. Daily Breakdown (for chart)
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });

    const dailyBreakdown = await Promise.all(
      days.map(async (day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const daySummary = await this.prisma.salesOrder.aggregate({
          where: {
            ...whereClause,
            orderDate: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
          _sum: {
            total: true,
          },
          _count: {
            id: true,
          },
        });

        return {
          date: format(day, 'yyyy-MM-dd'),
          total: Number(daySummary._sum.total || 0),
          count: daySummary._count.id,
        };
      }),
    );

    // 4. Paginated Detail List
    const skip = (page - 1) * pageSize;

    const [details, totalItems] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: {
          orderDate: 'desc',
        },
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
          outlet: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.salesOrder.count({ where: whereClause }),
    ]);

    const detailsData = details.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customerName: order.customer?.name || 'Walk-in',
      cashierName: order.user.name,
      outletName: order.outlet.name,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        productName: item.variant.product.name,
        variantName: item.variant.name,
        categoryName: item.variant.product.category?.name || '',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    }));

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      summary,
      dailyBreakdown,
      details: detailsData,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
}
