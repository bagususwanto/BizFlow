import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateStockAdjustmentValues,
  UpdateStockAdjustmentValues,
  UpdateStockAdjustmentStatusValues,
  QueryStockAdjustmentsValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class StockAdjustmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock adjustments with pagination and filters
   */
  async findAll(query: QueryStockAdjustmentsValues): Promise<
    ApiResponse<Prisma.StockAdjustmentGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      warehouseId,
      type,
      reason,
      status,
      startDate,
      endDate,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { adjustmentNumber: { contains: search } },
        { warehouse: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (type) {
      where.type = type;
    }

    if (reason) {
      where.reason = reason;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, adjustments] = await Promise.all([
      this.prisma.stockAdjustment.count({ where }),
      this.prisma.stockAdjustment.findMany({
        where,
        include: {
          warehouse: {
            select: {
              id: true,
              code: true,
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
                      sku: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);
    const summary = await this.buildSummary();

    return paginatedResponse(
      adjustments,
      {
        page: pageNum,
        pageSize: sizeNum,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  private async buildSummary() {
    const [total, draft, pending, approved, rejected] = await Promise.all([
      this.prisma.stockAdjustment.count(),
      this.prisma.stockAdjustment.count({ where: { status: 'draft' } }),
      this.prisma.stockAdjustment.count({ where: { status: 'pending' } }),
      this.prisma.stockAdjustment.count({ where: { status: 'approved' } }),
      this.prisma.stockAdjustment.count({ where: { status: 'rejected' } }),
    ]);

    return {
      total,
      draft,
      pending,
      approved,
      rejected,
    };
  }

  /**
   * Get a single stock adjustment by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    const adjustment = await this.prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!adjustment) {
      throw new NotFoundException('Stock Adjustment tidak ditemukan');
    }

    return successResponse(adjustment);
  }

  /**
   * Generate next adjustment number (ADJ-YYYYMMDD-XXX)
   */
  async generateAdjustmentNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.stockAdjustment.count({
      where: { adjustmentNumber: { startsWith: `ADJ-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `ADJ-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.stockAdjustment.findUnique({
        where: { adjustmentNumber: candidate },
      })
    ) {
      next++;
      candidate = `ADJ-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new stock adjustment
   */
  async create(
    dto: CreateStockAdjustmentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('Gudang tidak aktif');
    }

    // Validate all variants exist in the warehouse
    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { isActive: true } } },
      });

      if (!variant) {
        throw new NotFoundException(
          `Variant dengan ID '${item.variantId}' tidak ditemukan`,
        );
      }

      if (!variant.isActive) {
        throw new BadRequestException(
          `Variant dengan ID '${item.variantId}' tidak aktif`,
        );
      }

      // Snapshot current stock for each variant
      const stock = await this.prisma.stock.findUnique({
        where: {
          variantId_warehouseId: {
            variantId: item.variantId,
            warehouseId: dto.warehouseId,
          },
        },
      });

      // Store systemQty as current stock (0 if no record yet)
      (item as any)._systemQty = stock ? Number(stock.quantity) : 0;
    }

    // Generate adjustment number if not provided
    let adjustmentNumber = dto.adjustmentNumber;
    if (!adjustmentNumber) {
      adjustmentNumber = await this.generateAdjustmentNumber();
    } else {
      const existing = await this.prisma.stockAdjustment.findUnique({
        where: { adjustmentNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor adjustment '${adjustmentNumber}' sudah digunakan`,
        );
      }
    }

    const adjustment = await this.prisma.stockAdjustment.create({
      data: {
        adjustmentNumber,
        warehouseId: dto.warehouseId,
        type: dto.type,
        reason: dto.reason,
        notes: dto.notes,
        status: 'draft',
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            systemQty: (item as any)._systemQty,
            adjustmentQty: item.adjustmentQty,
            notes: item.notes,
          })),
        },
      },
      include: {
        warehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(adjustment);
  }

  /**
   * Update a stock adjustment (only when draft)
   */
  async update(
    id: string,
    dto: UpdateStockAdjustmentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    const existing = await this.prisma.stockAdjustment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Stock Adjustment tidak ditemukan');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Stock Adjustment dengan status draft yang dapat diedit',
      );
    }

    const updateData: any = {};

    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.items) {
      // Re-snapshot system qty for updated items
      for (const item of dto.items) {
        const stock = await this.prisma.stock.findUnique({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: existing.warehouseId,
            },
          },
        });
        (item as any)._systemQty = stock ? Number(stock.quantity) : 0;
      }

      // Replace existing items
      await this.prisma.stockAdjustmentItem.deleteMany({
        where: { adjustmentId: id },
      });

      updateData.items = {
        create: dto.items.map((item) => ({
          variantId: item.variantId,
          systemQty: (item as any)._systemQty,
          adjustmentQty: item.adjustmentQty,
          notes: item.notes,
        })),
      };
    }

    const adjustment = await this.prisma.stockAdjustment.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(adjustment);
  }

  /**
   * Update stock adjustment status (submit / approve / reject)
   */
  async updateStatus(
    id: string,
    dto: UpdateStockAdjustmentStatusValues,
    userId: string,
    userPermissions: string[],
  ): Promise<ApiResponse<Prisma.StockAdjustmentGetPayload<object>>> {
    const existing = await this.prisma.stockAdjustment.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Stock Adjustment tidak ditemukan');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['pending'],
      pending: ['approved', 'rejected'],
      approved: [],
      rejected: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const checkPerm = (perm: string) => {
      return (
        userPermissions.includes(perm) ||
        userPermissions.includes('stock-adjustments:*') ||
        userPermissions.includes('*:*')
      );
    };

    const updateData: any = {
      status: dto.status,
      notes: dto.notes ?? existing.notes,
    };

    if (dto.status === 'approved') {
      if (!checkPerm('stock-adjustments:approve')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk melakukan approve',
        );
      }

      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();

      // Apply stock adjustments: update Stock table and create StockMovements
      for (const item of existing.items) {
        const adjQty = Number(item.adjustmentQty);

        // Upsert stock record
        await this.prisma.stock.upsert({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: existing.warehouseId,
            },
          },
          create: {
            variantId: item.variantId,
            warehouseId: existing.warehouseId,
            quantity: adjQty,
            reservedQty: 0,
          },
          update: {
            quantity: {
              increment: adjQty,
            },
          },
        });

        // Create stock movement record
        await this.prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            warehouseId: existing.warehouseId,
            type: 'adjustment',
            quantity: adjQty,
            referenceType: 'adjustment',
            referenceId: id,
            notes: `Stock Adjustment: ${existing.adjustmentNumber}`,
            createdBy: userId,
          },
        });
      }
    } else if (dto.status === 'rejected') {
      if (!checkPerm('stock-adjustments:reject')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk melakukan reject',
        );
      }
    }

    const adjustment = await this.prisma.stockAdjustment.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(adjustment);
  }

  /**
   * Delete a stock adjustment (only when draft or rejected)
   */
  async delete(id: string, userId: string) {
    const adjustment = await this.prisma.stockAdjustment.findUnique({
      where: { id },
    });

    if (!adjustment) {
      throw new NotFoundException('Stock Adjustment tidak ditemukan');
    }

    if (!['draft', 'rejected'].includes(adjustment.status)) {
      throw new BadRequestException(
        'Hanya Stock Adjustment dengan status draft atau rejected yang dapat dihapus',
      );
    }

    await this.prisma.stockAdjustment.delete({ where: { id } });

    return successResponse({
      message: `Stock Adjustment '${adjustment.adjustmentNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete stock adjustments (only draft or rejected)
   */
  async bulkDelete(ids: string[], userId: string) {
    const adjustments = await this.prisma.stockAdjustment.findMany({
      where: { id: { in: ids } },
    });

    if (adjustments.length !== ids.length) {
      throw new NotFoundException('Beberapa Stock Adjustment tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const adj of adjustments) {
      if (!['draft', 'rejected'].includes(adj.status)) {
        skippedCount++;
        continue;
      }

      await this.prisma.stockAdjustment.delete({ where: { id: adj.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) {
      messages.push(`${deletedCount} Stock Adjustment dihapus`);
    }
    if (skippedCount > 0) {
      messages.push(
        `${skippedCount} Stock Adjustment dilewati (bukan status draft/rejected)`,
      );
    }

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
