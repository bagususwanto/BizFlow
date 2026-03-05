import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateStockTransferValues,
  UpdateStockTransferValues,
  UpdateStockTransferStatusValues,
  QueryStockTransfersValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class StockTransfersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock transfers with pagination and filters
   */
  async findAll(query: QueryStockTransfersValues): Promise<
    ApiResponse<Prisma.StockTransferGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      fromWarehouseId,
      toWarehouseId,
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
        { transferNumber: { contains: search } },
        { fromWarehouse: { name: { contains: search } } },
        { toWarehouse: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    if (fromWarehouseId) {
      where.fromWarehouseId = fromWarehouseId;
    }

    if (toWarehouseId) {
      where.toWarehouseId = toWarehouseId;
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

    const [totalItems, transfers] = await Promise.all([
      this.prisma.stockTransfer.count({ where }),
      this.prisma.stockTransfer.findMany({
        where,
        include: {
          fromWarehouse: {
            select: { id: true, code: true, name: true },
          },
          toWarehouse: {
            select: { id: true, code: true, name: true },
          },
          _count: {
            select: { items: true },
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
      transfers,
      { page: pageNum, pageSize: sizeNum, totalItems, totalPages },
      summary,
    );
  }

  private async buildSummary() {
    const [total, draft, sent, received, cancelled] = await Promise.all([
      this.prisma.stockTransfer.count(),
      this.prisma.stockTransfer.count({ where: { status: 'draft' } }),
      this.prisma.stockTransfer.count({ where: { status: 'sent' } }),
      this.prisma.stockTransfer.count({ where: { status: 'received' } }),
      this.prisma.stockTransfer.count({ where: { status: 'cancelled' } }),
    ]);

    return { total, draft, sent, received, cancelled };
  }

  /**
   * Get a single stock transfer by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true, sku: true },
                },
              },
            },
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Stock Transfer tidak ditemukan');
    }

    return successResponse(transfer);
  }

  /**
   * Generate next transfer number (TRF-YYYYMMDD-XXX)
   */
  async generateTransferNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.stockTransfer.count({
      where: { transferNumber: { startsWith: `TRF-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `TRF-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.stockTransfer.findUnique({
        where: { transferNumber: candidate },
      })
    ) {
      next++;
      candidate = `TRF-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new stock transfer (status: draft)
   */
  async create(
    dto: CreateStockTransferValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    // Verify warehouses exist and are active
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { id: dto.fromWarehouseId } }),
      this.prisma.warehouse.findUnique({ where: { id: dto.toWarehouseId } }),
    ]);

    if (!fromWarehouse) {
      throw new NotFoundException('Gudang asal tidak ditemukan');
    }
    if (!fromWarehouse.isActive) {
      throw new BadRequestException('Gudang asal tidak aktif');
    }
    if (!toWarehouse) {
      throw new NotFoundException('Gudang tujuan tidak ditemukan');
    }
    if (!toWarehouse.isActive) {
      throw new BadRequestException('Gudang tujuan tidak aktif');
    }

    // Validate all variants exist and are active
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
    }

    // Generate transfer number if not provided
    let transferNumber = dto.transferNumber;
    if (!transferNumber) {
      transferNumber = await this.generateTransferNumber();
    } else {
      const existing = await this.prisma.stockTransfer.findUnique({
        where: { transferNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor transfer '${transferNumber}' sudah digunakan`,
        );
      }
    }

    const transfer = await this.prisma.stockTransfer.create({
      data: {
        transferNumber,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        notes: dto.notes,
        status: 'draft',
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            requestedQty: item.requestedQty,
            sentQty: 0,
            receivedQty: 0,
            notes: item.notes,
          })),
        },
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, sku: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(transfer);
  }

  /**
   * Update a stock transfer (only when draft)
   */
  async update(
    id: string,
    dto: UpdateStockTransferValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    const existing = await this.prisma.stockTransfer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Stock Transfer tidak ditemukan');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Stock Transfer dengan status draft yang dapat diedit',
      );
    }

    const updateData: any = {};

    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.items) {
      // Validate all variants exist
      for (const item of dto.items) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant) {
          throw new NotFoundException(
            `Variant dengan ID '${item.variantId}' tidak ditemukan`,
          );
        }
      }

      // Replace existing items
      await this.prisma.stockTransferItem.deleteMany({
        where: { transferId: id },
      });

      updateData.items = {
        create: dto.items.map((item) => ({
          variantId: item.variantId,
          requestedQty: item.requestedQty,
          sentQty: 0,
          receivedQty: 0,
          notes: item.notes,
        })),
      };
    }

    const transfer = await this.prisma.stockTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, sku: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(transfer);
  }

  /**
   * Update stock transfer status (send / receive / cancel)
   *
   * Transitions:
   *   draft  → sent      : deduct stock from source warehouse
   *   sent   → received  : add stock to destination warehouse, update receivedQty
   *   draft  → cancelled : no stock changes
   *   sent   → cancelled : restore stock to source warehouse
   */
  async updateStatus(
    id: string,
    dto: UpdateStockTransferStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.StockTransferGetPayload<object>>> {
    const existing = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Stock Transfer tidak ditemukan');
    }

    // Validate transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['received', 'cancelled'],
      received: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'sent') {
      // draft → sent: deduct stock from source warehouse
      for (const item of existing.items) {
        const requestedQty = Number(item.requestedQty);

        // Check stock availability
        const stock = await this.prisma.stock.findUnique({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: existing.fromWarehouseId,
            },
          },
        });

        const currentQty = stock ? Number(stock.quantity) : 0;
        if (currentQty < requestedQty) {
          const variant = await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { select: { name: true } } },
          });
          throw new BadRequestException(
            `Stok tidak cukup untuk produk '${variant?.product?.name || item.variantId}'. Tersedia: ${currentQty}, Dibutuhkan: ${requestedQty}`,
          );
        }

        // Deduct from source warehouse
        await this.prisma.stock.upsert({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: existing.fromWarehouseId,
            },
          },
          create: {
            variantId: item.variantId,
            warehouseId: existing.fromWarehouseId,
            quantity: -requestedQty,
            reservedQty: 0,
          },
          update: { quantity: { decrement: requestedQty } },
        });

        // Update sentQty on item
        await this.prisma.stockTransferItem.update({
          where: { id: item.id },
          data: { sentQty: requestedQty },
        });

        // Create stock movement (out) for source warehouse
        await this.prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            warehouseId: existing.fromWarehouseId,
            type: 'transfer',
            quantity: -requestedQty,
            referenceType: 'transfer',
            referenceId: id,
            notes: `Transfer keluar: ${existing.transferNumber}`,
            createdBy: userId,
          },
        });
      }

      updateData.sentBy = userId;
      updateData.sentAt = new Date();
    } else if (dto.status === 'received') {
      // sent → received: add stock to destination warehouse
      const receivedItemsMap = new Map<string, number>();
      if (dto.receivedItems) {
        for (const ri of dto.receivedItems) {
          receivedItemsMap.set(ri.transferItemId, ri.receivedQty);
        }
      }

      for (const item of existing.items) {
        // If receivedItems provided, use that qty; otherwise default to sentQty
        const receivedQty =
          receivedItemsMap.size > 0
            ? (receivedItemsMap.get(item.id) ?? Number(item.sentQty))
            : Number(item.sentQty);

        const sentQty = Number(item.sentQty);
        if (receivedQty > sentQty) {
          throw new BadRequestException(
            `Qty diterima (${receivedQty}) tidak boleh melebihi qty dikirim (${sentQty})`,
          );
        }

        // Add to destination warehouse
        await this.prisma.stock.upsert({
          where: {
            variantId_warehouseId: {
              variantId: item.variantId,
              warehouseId: existing.toWarehouseId,
            },
          },
          create: {
            variantId: item.variantId,
            warehouseId: existing.toWarehouseId,
            quantity: receivedQty,
            reservedQty: 0,
          },
          update: { quantity: { increment: receivedQty } },
        });

        // Update receivedQty on item
        await this.prisma.stockTransferItem.update({
          where: { id: item.id },
          data: { receivedQty },
        });

        // Create stock movement (in) for destination warehouse
        await this.prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            warehouseId: existing.toWarehouseId,
            type: 'transfer',
            quantity: receivedQty,
            referenceType: 'transfer',
            referenceId: id,
            notes: `Transfer masuk: ${existing.transferNumber}`,
            createdBy: userId,
          },
        });
      }

      updateData.receivedBy = userId;
      updateData.receivedAt = new Date();
    } else if (dto.status === 'cancelled') {
      // If was already sent, restore stock to source
      if (existing.status === 'sent') {
        for (const item of existing.items) {
          const sentQty = Number(item.sentQty);

          if (sentQty > 0) {
            await this.prisma.stock.upsert({
              where: {
                variantId_warehouseId: {
                  variantId: item.variantId,
                  warehouseId: existing.fromWarehouseId,
                },
              },
              create: {
                variantId: item.variantId,
                warehouseId: existing.fromWarehouseId,
                quantity: sentQty,
                reservedQty: 0,
              },
              update: { quantity: { increment: sentQty } },
            });

            // Create reversal movement
            await this.prisma.stockMovement.create({
              data: {
                variantId: item.variantId,
                warehouseId: existing.fromWarehouseId,
                type: 'transfer',
                quantity: sentQty,
                referenceType: 'transfer',
                referenceId: id,
                notes: `Transfer dibatalkan (reversal): ${existing.transferNumber}`,
                createdBy: userId,
              },
            });
          }
        }
      }
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    const transfer = await this.prisma.stockTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, sku: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(transfer);
  }

  /**
   * Delete a stock transfer (only when draft)
   */
  async delete(id: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException('Stock Transfer tidak ditemukan');
    }

    if (transfer.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Stock Transfer dengan status draft yang dapat dihapus',
      );
    }

    await this.prisma.stockTransfer.delete({ where: { id } });

    return successResponse({
      message: `Stock Transfer '${transfer.transferNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete stock transfers (only draft)
   */
  async bulkDelete(ids: string[], userId: string) {
    const transfers = await this.prisma.stockTransfer.findMany({
      where: { id: { in: ids } },
    });

    if (transfers.length !== ids.length) {
      throw new NotFoundException('Beberapa Stock Transfer tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const transfer of transfers) {
      if (transfer.status !== 'draft') {
        skippedCount++;
        continue;
      }
      await this.prisma.stockTransfer.delete({ where: { id: transfer.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) {
      messages.push(`${deletedCount} Stock Transfer dihapus`);
    }
    if (skippedCount > 0) {
      messages.push(
        `${skippedCount} Stock Transfer dilewati (bukan status draft)`,
      );
    }

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
