import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryStockValuationValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';

@Injectable()
export class StockValuationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock valuations (HPP per variant per warehouse) with pagination
   */
  async findAll(query: QueryStockValuationValues) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'totalValue',
      sortOrder = 'desc',
      search,
      warehouseId,
      variantId,
      categoryId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (variantId) {
      where.variantId = variantId;
    }

    if (categoryId) {
      where.variant = { product: { categoryId } };
    }

    if (search) {
      where.variant = {
        ...where.variant,
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { product: { name: { contains: search } } },
          { product: { sku: { contains: search } } },
        ],
      };
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'avgCost') {
      orderBy = { avgCost: sortOrder };
    } else if (sortBy === 'totalQty') {
      orderBy = { totalQty: sortOrder };
    } else if (sortBy === 'totalValue') {
      orderBy = { totalValue: sortOrder };
    } else if (sortBy === 'updatedAt') {
      orderBy = { updatedAt: sortOrder };
    } else {
      orderBy = { totalValue: sortOrder };
    }

    const [totalItems, valuations] = await Promise.all([
      this.prisma.stockValuation.count({ where }),
      this.prisma.stockValuation.findMany({
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
                    select: { id: true, name: true },
                  },
                  unit: {
                    select: { id: true, name: true, symbol: true },
                  },
                },
              },
            },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);

    const mappedValuations = valuations.map((v) => ({
      id: v.id,
      variantId: v.variantId,
      warehouseId: v.warehouseId,
      avgCost: Number(v.avgCost),
      totalQty: Number(v.totalQty),
      totalValue: Number(v.totalValue),
      updatedAt: v.updatedAt,
      variant: v.variant,
      warehouse: v.warehouse,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedValuations,
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
   * Get total stock valuation summary (overall inventory value)
   */
  async getSummary() {
    const summary = await this.buildSummary();
    return successResponse(summary);
  }

  /**
   * Get stock valuation for a specific variant (by warehouse breakdown)
   */
  async findByVariant(variantId: string) {
    const valuations = await this.prisma.stockValuation.findMany({
      where: { variantId },
      include: {
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { warehouse: { name: 'asc' } },
    });

    if (!valuations.length) {
      // Return empty structure if no valuation exists yet
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        select: {
          id: true,
          sku: true,
          name: true,
          product: {
            select: {
              id: true,
              name: true,
              unit: { select: { symbol: true } },
            },
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('inventory.stockValuation.variantNotFound');
      }

      return successResponse({ variantId, totalValue: 0, warehouses: [] });
    }

    const totalValue = valuations.reduce(
      (sum, v) => sum + Number(v.totalValue),
      0,
    );

    return successResponse({
      variantId,
      totalValue,
      warehouses: valuations.map((v) => ({
        warehouseId: v.warehouseId,
        warehouse: v.warehouse,
        avgCost: Number(v.avgCost),
        totalQty: Number(v.totalQty),
        totalValue: Number(v.totalValue),
        updatedAt: v.updatedAt,
      })),
    });
  }

  private async buildSummary() {
    const result = await this.prisma.stockValuation.aggregate({
      _sum: { totalValue: true, totalQty: true },
      _count: true,
    });

    return {
      totalInventoryValue: Number(result._sum.totalValue) || 0,
      totalVariants: result._count,
    };
  }

  /**
   * Internal: Recalculate moving average cost on goods receive
   * Called inside a Prisma transaction from GoodsReceiveService
   */
  async recalculateOnReceive(
    tx: Prisma.TransactionClient,
    variantId: string,
    warehouseId: string,
    receivedQty: number,
    unitPrice: number,
  ): Promise<void> {
    const existing = await tx.stockValuation.findUnique({
      where: {
        variantId_warehouseId: { variantId, warehouseId },
      },
    });

    if (!existing || Number(existing.totalQty) === 0) {
      // First receive for this variant+warehouse
      await tx.stockValuation.upsert({
        where: { variantId_warehouseId: { variantId, warehouseId } },
        create: {
          variantId,
          warehouseId,
          avgCost: unitPrice,
          totalQty: receivedQty,
          totalValue: receivedQty * unitPrice,
        },
        update: {
          avgCost: unitPrice,
          totalQty: receivedQty,
          totalValue: receivedQty * unitPrice,
        },
      });
    } else {
      // Weighted moving average:
      // new_avg = (old_qty * old_avg + received_qty * unit_price) / (old_qty + received_qty)
      const oldQty = Number(existing.totalQty);
      const oldAvg = Number(existing.avgCost);
      const newQty = oldQty + receivedQty;
      const newAvg = (oldQty * oldAvg + receivedQty * unitPrice) / newQty;
      const newValue = newQty * newAvg;

      await tx.stockValuation.update({
        where: { variantId_warehouseId: { variantId, warehouseId } },
        data: {
          avgCost: newAvg,
          totalQty: newQty,
          totalValue: newValue,
        },
      });
    }
  }

  /**
   * Internal: Reduce totalQty and recalculate totalValue on stock out
   * Called when goods are sold, transferred, or adjusted down
   */
  async deductOnStockOut(
    tx: Prisma.TransactionClient,
    variantId: string,
    warehouseId: string,
    qtyOut: number,
  ): Promise<void> {
    const existing = await tx.stockValuation.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    if (!existing) return;

    const oldQty = Number(existing.totalQty);
    const avgCost = Number(existing.avgCost);
    const newQty = Math.max(0, oldQty - qtyOut);
    const newValue = newQty * avgCost;

    await tx.stockValuation.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: {
        totalQty: newQty,
        totalValue: newValue,
        // avgCost stays the same on stock out (moving average)
      },
    });
  }
}
