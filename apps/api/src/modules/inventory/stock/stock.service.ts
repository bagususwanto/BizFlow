import { Injectable } from '@nestjs/common';
import {
  QueryStockValues,
  QueryStockMovementValues,
  QueryStockCardValues,
} from '@bizflow/types';

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

  /**
   * Get all stock movements with pagination and filters
   */
  async findAllMovements(query: QueryStockMovementValues) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      warehouseId,
      variantId,
      type,
      dateFrom,
      dateTo,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    // Filter by warehouse
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    // Filter by variant
    if (variantId) {
      where.variantId = variantId;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Search by product name or SKU
    if (search) {
      where.variant = {
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
    const orderBy: any = {};
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder;
    } else if (sortBy === 'quantity') {
      orderBy.quantity = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [totalItems, movements] = await Promise.all([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
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
                  unit: {
                    select: {
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
    const mappedMovements = movements.map((movement) => ({
      id: movement.id,
      variantId: movement.variantId,
      warehouseId: movement.warehouseId,
      type: movement.type,
      quantity: Number(movement.quantity),
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdAt: movement.createdAt,
      createdBy: movement.createdBy,
      variant: movement.variant,
      warehouse: movement.warehouse,
    }));

    return paginatedResponse(mappedMovements, {
      page: pageNum,
      pageSize: sizeNum,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get stock card for a specific variant (movement history with running balance)
   */
  async findStockCard(variantId: string, query: QueryStockCardValues) {
    const { warehouseId, dateFrom, dateTo } = query;

    const where: any = { variantId };

    // Filter by warehouse
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    // Get variant info
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
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
    });

    if (!variant) {
      return successResponse({
        variant: null,
        openingBalance: 0,
        closingBalance: 0,
        movements: [],
      });
    }

    // Calculate opening balance (movements before dateFrom)
    let openingBalance = 0;
    if (dateFrom) {
      const aggregations = await this.prisma.stockMovement.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          variantId,
          ...(warehouseId && { warehouseId }),
          createdAt: { lt: new Date(dateFrom) },
        },
      });

      openingBalance = Number(aggregations._sum.quantity) || 0;
    }

    // Get movements within date range
    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate running balance
    let runningBalance = openingBalance;
    const movementsWithBalance = movements.map((movement) => {
      const qty = Number(movement.quantity);
      runningBalance += qty;

      return {
        id: movement.id,
        type: movement.type,
        quantity: qty,
        balance: runningBalance,
        referenceType: movement.referenceType,
        referenceId: movement.referenceId,
        notes: movement.notes,
        warehouse: movement.warehouse,
        createdAt: movement.createdAt,
        createdBy: movement.createdBy,
      };
    });

    return successResponse({
      variant: {
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        product: variant.product,
      },
      openingBalance,
      closingBalance: runningBalance,
      movements: movementsWithBalance,
    });
  }
}
