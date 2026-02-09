import { Injectable } from '@nestjs/common';
import { QueryStockValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock with pagination, filter, and summary
   */
  async findAll(query: QueryStockValues) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      warehouseId,
      categoryId,
      hasStock,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    // Filter by warehouse
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    // Filter by category (through product variant)
    if (categoryId) {
      where.variant = {
        product: {
          categoryId,
        },
      };
    }

    // Filter by stock availability
    if (hasStock !== undefined) {
      if (hasStock) {
        where.quantity = { gt: 0 };
      }
    }

    // Search by product name or SKU
    if (search) {
      where.variant = {
        ...where.variant,
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          {
            product: {
              name: { contains: search },
            },
          },
          {
            product: {
              sku: { contains: search },
            },
          },
        ],
      };
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'name') {
      orderBy = { variant: { name: sortOrder } };
    } else if (sortBy === 'warehouse') {
      orderBy = { warehouse: { name: sortOrder } };
    } else if (sortBy === 'quantity') {
      orderBy = { quantity: sortOrder };
    } else if (sortBy === 'sku') {
      orderBy = { variant: { sku: sortOrder } };
    } else {
      orderBy = { variant: { name: sortOrder } };
    }

    const [totalItems, stocks] = await Promise.all([
      this.prisma.stock.count({ where }),
      this.prisma.stock.findMany({
        where,
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  unit: {
                    select: {
                      id: true,
                      name: true,
                      symbol: true,
                    },
                  },
                },
              },
            },
          },
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);

    // Map to response format
    const mappedStocks = stocks.map((stock) => ({
      id: stock.id,
      variantId: stock.variantId,
      warehouseId: stock.warehouseId,
      quantity: Number(stock.quantity),
      reservedQty: Number(stock.reservedQty),
      availableQty: Number(stock.quantity) - Number(stock.reservedQty),
      variant: {
        id: stock.variant.id,
        sku: stock.variant.sku,
        name: stock.variant.name,
        product: stock.variant.product,
      },
      warehouse: stock.warehouse,
      updatedAt: stock.updatedAt,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedStocks,
      {
        page: pageNum,
        pageSize: sizeNum,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  /**
   * Get stock by variant ID (across all warehouses)
   */
  async findByVariant(variantId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { variantId },
      include: {
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: { warehouse: { name: 'asc' } },
    });

    const totalQuantity = stocks.reduce(
      (sum, stock) => sum + Number(stock.quantity),
      0,
    );
    const totalReserved = stocks.reduce(
      (sum, stock) => sum + Number(stock.reservedQty),
      0,
    );

    return successResponse({
      variantId,
      totalQuantity,
      totalReserved,
      totalAvailable: totalQuantity - totalReserved,
      warehouses: stocks.map((stock) => ({
        warehouseId: stock.warehouseId,
        warehouse: stock.warehouse,
        quantity: Number(stock.quantity),
        reservedQty: Number(stock.reservedQty),
        availableQty: Number(stock.quantity) - Number(stock.reservedQty),
        updatedAt: stock.updatedAt,
      })),
    });
  }

  /**
   * Get stock by warehouse ID
   */
  async findByWarehouse(warehouseId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { warehouseId },
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                unit: {
                  select: {
                    id: true,
                    name: true,
                    symbol: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { variant: { name: 'asc' } },
    });

    const totalItems = stocks.length;
    const totalQuantity = stocks.reduce(
      (sum, stock) => sum + Number(stock.quantity),
      0,
    );

    return successResponse({
      warehouseId,
      totalItems,
      totalQuantity,
      items: stocks.map((stock) => ({
        variantId: stock.variantId,
        variant: stock.variant,
        quantity: Number(stock.quantity),
        reservedQty: Number(stock.reservedQty),
        availableQty: Number(stock.quantity) - Number(stock.reservedQty),
        updatedAt: stock.updatedAt,
      })),
    });
  }

  private async buildSummary() {
    const [totalStockRecords, totalWarehouses, totalVariantsWithStock] =
      await Promise.all([
        this.prisma.stock.count(),
        this.prisma.warehouse.count({ where: { isActive: true } }),
        this.prisma.stock.groupBy({
          by: ['variantId'],
          _count: true,
        }),
      ]);

    return {
      totalStockRecords,
      totalWarehouses,
      totalVariantsWithStock: totalVariantsWithStock.length,
    };
  }
}
