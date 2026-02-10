import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryStockReportValues } from '@bizflow/types';

@Injectable()
export class StockReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: QueryStockReportValues) {
    const {
      warehouseId,
      categoryId,
      lowStockOnly = false,
      page = 1,
      pageSize = 10,
    } = query;

    // Build where clause
    const whereClause: any = {};

    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    if (categoryId) {
      whereClause.variant = {
        product: {
          categoryId,
        },
      };
    }

    // Get all stock data for summary calculation
    const allStocks = await this.prisma.stock.findMany({
      where: whereClause,
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
                minStock: true,
                category: {
                  select: {
                    name: true,
                  },
                },
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
    });

    // Calculate summary
    const totalSku = new Set(allStocks.map((s) => s.variantId)).size;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const stockData = allStocks.map((stock) => {
      const quantity = Number(stock.quantity);
      const minStock = Number(stock.variant.product.minStock || 0);
      const costPrice = Number(stock.variant.costPrice || 0);
      const totalValue = quantity * costPrice;

      totalStockValue += totalValue;

      if (quantity === 0) {
        outOfStockCount++;
      } else if (quantity <= minStock) {
        lowStockCount++;
      }

      return {
        id: stock.id,
        variantId: stock.variantId,
        sku: stock.variant.sku,
        productName: stock.variant.product.name,
        variantName: stock.variant.name,
        categoryName: stock.variant.product.category?.name || '',
        warehouseName: stock.warehouse.name,
        quantity,
        minStock,
        costPrice,
        totalValue,
        isLowStock: quantity <= minStock && quantity > 0,
        isOutOfStock: quantity === 0,
      };
    });

    // Filter for low stock only if requested
    let filteredData = stockData;
    if (lowStockOnly) {
      filteredData = stockData.filter(
        (item) => item.isLowStock || item.isOutOfStock,
      );
    }

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(skip, skip + pageSize);

    const summary = {
      totalSku,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
    };

    return {
      summary,
      data: paginatedData,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
}
