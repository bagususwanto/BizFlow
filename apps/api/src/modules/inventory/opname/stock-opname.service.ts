import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateStockOpnameValues,
  UpdateStockOpnameItemsValues,
  FinalizeStockOpnameValues,
  CancelStockOpnameValues,
  QueryStockOpnamesValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class StockOpnameService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock opnames with pagination and filters
   */
  async findAll(query: QueryStockOpnamesValues): Promise<
    ApiResponse<Prisma.StockOpnameGetPayload<object>[]> & {
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
        { opnameNumber: { contains: search } },
        { warehouse: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
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

    const [totalItems, opnames] = await Promise.all([
      this.prisma.stockOpname.count({ where }),
      this.prisma.stockOpname.findMany({
        where,
        include: {
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
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
      opnames,
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
    const [total, inProgress, finalized, cancelled] = await Promise.all([
      this.prisma.stockOpname.count(),
      this.prisma.stockOpname.count({ where: { status: 'in_progress' } }),
      this.prisma.stockOpname.count({ where: { status: 'finalized' } }),
      this.prisma.stockOpname.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      total,
      inProgress,
      finalized,
      cancelled,
    };
  }

  /**
   * Get a single stock opname by ID with all items
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    barcode: true,
                  },
                },
              },
            },
          },
          orderBy: {
            variant: {
              sku: 'asc',
            },
          },
        },
      },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname tidak ditemukan');
    }

    return successResponse(opname);
  }

  /**
   * Generate next opname number (SO-YYYYMMDD-XXX)
   */
  async generateOpnameNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.stockOpname.count({
      where: { opnameNumber: { startsWith: `SO-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `SO-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.stockOpname.findUnique({
        where: { opnameNumber: candidate },
      })
    ) {
      next++;
      candidate = `SO-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new stock opname.
   * Auto-loads all active product variants with current stock from the warehouse.
   * Optionally filtered by category.
   */
  async create(
    dto: CreateStockOpnameValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    // Verify warehouse exists and is active
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('Gudang tidak aktif');
    }

    // Generate opname number if not provided
    let opnameNumber = dto.opnameNumber;
    if (!opnameNumber) {
      opnameNumber = await this.generateOpnameNumber();
    } else {
      const existing = await this.prisma.stockOpname.findUnique({
        where: { opnameNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor opname '${opnameNumber}' sudah digunakan`,
        );
      }
    }

    // Build variant filter, optionally filtering by category
    const variantWhere: any = {
      isActive: true,
      product: {
        isActive: true,
        isService: false,
      },
    };

    if (dto.categoryId) {
      variantWhere.product.categoryId = dto.categoryId;
    }

    // Load all active product variants with their current stock in this warehouse
    const variants = await this.prisma.productVariant.findMany({
      where: variantWhere,
      include: {
        stocks: {
          where: { warehouseId: dto.warehouseId },
        },
      },
      orderBy: { sku: 'asc' },
    });

    // Create the opname with all variant items
    const opname = await this.prisma.stockOpname.create({
      data: {
        opnameNumber,
        warehouseId: dto.warehouseId,
        categoryId: dto.categoryId,
        notes: dto.notes,
        status: 'in_progress',
        createdBy: userId,
        items: {
          create: variants.map((variant) => {
            const stock = variant.stocks[0];
            return {
              variantId: variant.id,
              systemQty: stock ? stock.quantity : 0,
              countedQty: null,
              difference: null,
            };
          }),
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
                    id: true,
                    name: true,
                    sku: true,
                    barcode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(opname);
  }

  /**
   * Batch update counted quantities for opname items (only when in_progress)
   */
  async updateItems(
    id: string,
    dto: UpdateStockOpnameItemsValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname tidak ditemukan');
    }

    if (opname.status !== 'in_progress') {
      throw new BadRequestException(
        'Hanya Stock Opname dengan status in_progress yang dapat diperbarui',
      );
    }

    // Update each item's countedQty and compute difference
    for (const item of dto.items) {
      const existingItem = await this.prisma.stockOpnameItem.findUnique({
        where: { id: item.opnameItemId },
      });

      if (!existingItem) {
        throw new NotFoundException(
          `Item opname dengan ID '${item.opnameItemId}' tidak ditemukan`,
        );
      }

      if (existingItem.opnameId !== id) {
        throw new BadRequestException(
          `Item opname dengan ID '${item.opnameItemId}' tidak termasuk dalam opname ini`,
        );
      }

      const difference =
        Number(item.countedQty) - Number(existingItem.systemQty);

      await this.prisma.stockOpnameItem.update({
        where: { id: item.opnameItemId },
        data: {
          countedQty: item.countedQty,
          difference,
          notes: item.notes,
        },
      });
    }

    return this.findById(id);
  }

  /**
   * Finalize the opname:
   * - All items must have countedQty filled in
   * - Applies stock correction for items with a non-zero difference
   * - Creates StockMovement records
   * - Sets status to finalized
   */
  async finalize(
    id: string,
    dto: FinalizeStockOpnameValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname tidak ditemukan');
    }

    if (opname.status !== 'in_progress') {
      throw new BadRequestException(
        'Hanya Stock Opname dengan status in_progress yang dapat difinalisasi',
      );
    }

    if (opname.items.length === 0) {
      throw new BadRequestException('Stock Opname tidak memiliki item');
    }

    // Verify all items have countedQty
    const unCountedItems = opname.items.filter(
      (item) => item.countedQty === null || item.countedQty === undefined,
    );

    if (unCountedItems.length > 0) {
      throw new BadRequestException(
        `Masih ada ${unCountedItems.length} item yang belum diisi jumlah hitungannya`,
      );
    }

    // Apply stock corrections for items with differences within a transaction
    await this.prisma.$transaction(async (tx) => {
      for (const item of opname.items) {
        const countedQty = Number(item.countedQty);
        const systemQty = Number(item.systemQty);
        const diff = countedQty - systemQty;

        if (diff === 0) continue; // No correction needed

        // Upsert the stock record to match countedQty
        await tx.stock.upsert({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: opname.warehouseId,
            },
          },
          create: {
            variantId: item.variantId,
            warehouseId: opname.warehouseId,
            quantity: countedQty,
            reservedQty: 0,
          },
          update: {
            quantity: {
              increment: diff,
            },
          },
        });

        // Create stock movement record (positive diff = stock in, negative = stock out)
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            warehouseId: opname.warehouseId,
            type: diff > 0 ? 'in' : 'out',
            quantity: diff,
            referenceType: 'opname',
            referenceId: id,
            notes: `Stock Opname: ${opname.opnameNumber}`,
            createdBy: userId,
          },
        });
      }

      // Update opname status to finalized
      await tx.stockOpname.update({
        where: { id },
        data: {
          status: 'finalized',
          finalizedBy: userId,
          finalizedAt: new Date(),
          notes: dto.notes ?? opname.notes,
        },
      });
    });

    return this.findById(id);
  }

  /**
   * Cancel an opname (only when in_progress)
   */
  async cancel(
    id: string,
    dto: CancelStockOpnameValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockOpnameGetPayload<object>>> {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname tidak ditemukan');
    }

    if (opname.status !== 'in_progress') {
      throw new BadRequestException(
        'Hanya Stock Opname dengan status in_progress yang dapat dibatalkan',
      );
    }

    await this.prisma.stockOpname.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: dto.notes ?? opname.notes,
      },
    });

    return this.findById(id);
  }

  /**
   * Delete an opname (only when in_progress or cancelled)
   */
  async delete(id: string, userId: string) {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
    });

    if (!opname) {
      throw new NotFoundException('Stock Opname tidak ditemukan');
    }

    if (!['in_progress', 'cancelled'].includes(opname.status)) {
      throw new BadRequestException(
        'Hanya Stock Opname dengan status in_progress atau cancelled yang dapat dihapus',
      );
    }

    await this.prisma.stockOpname.delete({ where: { id } });

    return successResponse({
      message: `Stock Opname '${opname.opnameNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete opnames (only in_progress or cancelled)
   */
  async bulkDelete(ids: string[], userId: string) {
    const opnames = await this.prisma.stockOpname.findMany({
      where: { id: { in: ids } },
    });

    if (opnames.length !== ids.length) {
      throw new NotFoundException('Beberapa Stock Opname tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const opname of opnames) {
      if (!['in_progress', 'cancelled'].includes(opname.status)) {
        skippedCount++;
        continue;
      }

      await this.prisma.stockOpname.delete({ where: { id: opname.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) {
      messages.push(`${deletedCount} Stock Opname dihapus`);
    }
    if (skippedCount > 0) {
      messages.push(
        `${skippedCount} Stock Opname dilewati (status finalized tidak dapat dihapus)`,
      );
    }

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
