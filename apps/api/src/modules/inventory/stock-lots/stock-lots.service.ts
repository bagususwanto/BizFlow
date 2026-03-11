import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateStockLotValues,
  UpdateStockLotValues,
  QueryStockLotsValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';

@Injectable()
export class StockLotsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock lots with pagination and filters
   */
  async findAll(query: QueryStockLotsValues) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'expiryDate',
      sortOrder = 'asc',
      search,
      variantId,
      warehouseId,
      expiryBefore,
      hasStock,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (variantId) {
      where.variantId = variantId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (search) {
      where.lotNumber = { contains: search };
    }

    if (expiryBefore) {
      where.expiryDate = { lte: new Date(expiryBefore) };
    }

    if (hasStock !== undefined && hasStock) {
      where.remainingQty = { gt: 0 };
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'expiryDate') {
      orderBy = { expiryDate: sortOrder };
    } else if (sortBy === 'remainingQty') {
      orderBy = { remainingQty: sortOrder };
    } else if (sortBy === 'lotNumber') {
      orderBy = { lotNumber: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else {
      orderBy = { expiryDate: sortOrder };
    }

    const [totalItems, lots] = await Promise.all([
      this.prisma.stockLot.count({ where }),
      this.prisma.stockLot.findMany({
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

    const mappedLots = lots.map((lot) => ({
      id: lot.id,
      lotNumber: lot.lotNumber,
      variantId: lot.variantId,
      warehouseId: lot.warehouseId,
      receiveId: lot.receiveId,
      initialQty: Number(lot.initialQty),
      remainingQty: Number(lot.remainingQty),
      expiryDate: lot.expiryDate,
      manufacturingDate: lot.manufacturingDate,
      notes: lot.notes,
      createdBy: lot.createdBy,
      createdAt: lot.createdAt,
      updatedAt: lot.updatedAt,
      variant: lot.variant,
      warehouse: lot.warehouse,
    }));

    return paginatedResponse(mappedLots, {
      page: pageNum,
      pageSize: sizeNum,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get a single stock lot by ID
   */
  async findById(id: string) {
    const lot = await this.prisma.stockLot.findUnique({
      where: { id },
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
                  select: { id: true, name: true, symbol: true },
                },
              },
            },
          },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
        goodsReceive: {
          select: { id: true, receiveNumber: true },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException('inventory.stockLots.notFound');
    }

    return successResponse({
      ...lot,
      initialQty: Number(lot.initialQty),
      remainingQty: Number(lot.remainingQty),
    });
  }

  /**
   * Get lots expiring within N days
   */
  async findExpiringSoon(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const lots = await this.prisma.stockLot.findMany({
      where: {
        expiryDate: {
          lte: cutoffDate,
          gte: new Date(), // not already expired
        },
        remainingQty: { gt: 0 },
      },
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
                unit: { select: { symbol: true } },
              },
            },
          },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return successResponse(
      lots.map((lot) => ({
        ...lot,
        initialQty: Number(lot.initialQty),
        remainingQty: Number(lot.remainingQty),
      })),
    );
  }

  /**
   * Manually create a stock lot
   */
  async create(dto: CreateStockLotValues, userId: string) {
    // Check for duplicate lot number per variant per warehouse
    const existing = await this.prisma.stockLot.findUnique({
      where: {
        lotNumber_variantId_warehouseId: {
          lotNumber: dto.lotNumber,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('inventory.stockLots.duplicateLotNumber');
    }

    const lot = await this.prisma.stockLot.create({
      data: {
        lotNumber: dto.lotNumber,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        initialQty: dto.initialQty,
        remainingQty: dto.initialQty,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate as string) : null,
        manufacturingDate: dto.manufacturingDate
          ? new Date(dto.manufacturingDate as string)
          : null,
        notes: dto.notes,
        createdBy: userId,
      },
      include: {
        variant: {
          select: { id: true, sku: true, name: true },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return successResponse({
      ...lot,
      initialQty: Number(lot.initialQty),
      remainingQty: Number(lot.remainingQty),
    });
  }

  /**
   * Update a stock lot (expiry date, manufacturing date, notes)
   */
  async update(id: string, dto: UpdateStockLotValues) {
    const existing = await this.prisma.stockLot.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('inventory.stockLots.notFound');
    }

    const updateData: Prisma.StockLotUpdateInput = {};

    if (dto.expiryDate !== undefined) {
      updateData.expiryDate = dto.expiryDate
        ? new Date(dto.expiryDate as string)
        : null;
    }

    if (dto.manufacturingDate !== undefined) {
      updateData.manufacturingDate = dto.manufacturingDate
        ? new Date(dto.manufacturingDate as string)
        : null;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    const lot = await this.prisma.stockLot.update({
      where: { id },
      data: updateData,
      include: {
        variant: {
          select: { id: true, sku: true, name: true },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return successResponse({
      ...lot,
      initialQty: Number(lot.initialQty),
      remainingQty: Number(lot.remainingQty),
    });
  }

  /**
   * Internal: Create a lot within an existing transaction (called from GoodsReceive)
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    data: {
      lotNumber: string;
      variantId: string;
      warehouseId: string;
      receiveId: string;
      qty: number;
      expiryDate?: Date | null;
      manufacturingDate?: Date | null;
      notes?: string | null;
      createdBy: string;
    },
  ): Promise<void> {
    const existing = await tx.stockLot.findUnique({
      where: {
        lotNumber_variantId_warehouseId: {
          lotNumber: data.lotNumber,
          variantId: data.variantId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (existing) {
      // Update remaining qty for existing lot
      await tx.stockLot.update({
        where: { id: existing.id },
        data: {
          remainingQty: { increment: data.qty },
          initialQty: { increment: data.qty },
          expiryDate: data.expiryDate ?? existing.expiryDate,
          manufacturingDate:
            data.manufacturingDate ?? existing.manufacturingDate,
        },
      });
    } else {
      await tx.stockLot.create({
        data: {
          lotNumber: data.lotNumber,
          variantId: data.variantId,
          warehouseId: data.warehouseId,
          receiveId: data.receiveId,
          initialQty: data.qty,
          remainingQty: data.qty,
          expiryDate: data.expiryDate ?? null,
          manufacturingDate: data.manufacturingDate ?? null,
          notes: data.notes,
          createdBy: data.createdBy,
        },
      });
    }
  }

  /**
   * Internal: Deduct lot qty using FEFO (First Expired First Out)
   * Used when selling or transferring stock out
   */
  async deductLotFEFO(
    tx: Prisma.TransactionClient,
    variantId: string,
    warehouseId: string,
    qtyToDeduct: number,
  ): Promise<void> {
    // Get lots ordered by expiry date (FEFO: earliest expiry first)
    // Lots without expiry date are deducted last
    const lots = await tx.stockLot.findMany({
      where: {
        variantId,
        warehouseId,
        remainingQty: { gt: 0 },
      },
      orderBy: [
        { expiryDate: 'asc' }, // nulls last in Prisma by default
        { createdAt: 'asc' },
      ],
    });

    let remaining = qtyToDeduct;

    for (const lot of lots) {
      if (remaining <= 0) break;

      const lotQty = Number(lot.remainingQty);
      const deduct = Math.min(lotQty, remaining);

      await tx.stockLot.update({
        where: { id: lot.id },
        data: { remainingQty: { decrement: deduct } },
      });

      remaining -= deduct;
    }
  }
}
