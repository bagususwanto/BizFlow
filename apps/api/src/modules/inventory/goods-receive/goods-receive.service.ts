import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateGoodsReceiveValues,
  QueryGoodsReceivesValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class GoodsReceiveService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all goods receives with pagination and filter
   */
  async findAll(
    query: QueryGoodsReceivesValues,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>[]>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      purchaseOrderId,
      warehouseId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { receiveNumber: { contains: search } },
        { purchaseOrder: { orderNumber: { contains: search } } },
        { purchaseOrder: { supplier: { name: { contains: search } } } },
      ];
    }

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, goodsReceives] = await Promise.all([
      this.prisma.goodsReceive.count({ where }),
      this.prisma.goodsReceive.findMany({
        where,
        include: {
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              supplier: {
                select: {
                  id: true,
                  code: true,
                  name: true,
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

    return paginatedResponse(goodsReceives, {
      page: pageNum,
      pageSize: sizeNum,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get a single goods receive by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>>> {
    const goodsReceive = await this.prisma.goodsReceive.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        warehouse: true,
        items: {
          include: {
            purchaseOrderItem: {
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
        },
      },
    });

    if (!goodsReceive) {
      throw new NotFoundException('Penerimaan Barang tidak ditemukan');
    }

    return successResponse(goodsReceive);
  }

  /**
   * Generate next receive number
   */
  async generateReceiveNumber(): Promise<string> {
    const lastReceive = await this.prisma.goodsReceive.findFirst({
      orderBy: { receiveNumber: 'desc' },
    });

    if (!lastReceive) {
      return 'GR-0001';
    }

    const lastNumber = lastReceive.receiveNumber;
    const match = lastNumber.match(/GR-(\d+)/);

    if (match) {
      const number = parseInt(match[1], 10) + 1;
      return `GR-${number.toString().padStart(4, '0')}`;
    }

    return `GR-${Date.now()}`;
  }

  /**
   * Create a new goods receive
   */
  async create(
    dto: CreateGoodsReceiveValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>>> {
    // Generate receive number if not provided
    let receiveNumber = dto.receiveNumber;
    if (!receiveNumber) {
      receiveNumber = await this.generateReceiveNumber();
    } else {
      // Check duplicate receive number
      const existing = await this.prisma.goodsReceive.findUnique({
        where: { receiveNumber: dto.receiveNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor penerimaan '${dto.receiveNumber}' sudah digunakan`,
        );
      }
    }

    // Verify Purchase Order exists and is in a valid status
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.purchaseOrderId },
      include: {
        items: {
          include: {
            receiveItems: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }

    if (
      purchaseOrder.status === 'cancelled' ||
      purchaseOrder.status === 'completed'
    ) {
      throw new BadRequestException(
        `Purchase Order dengan status '${purchaseOrder.status}' tidak dapat diterima`,
      );
    }

    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    // Validate items
    for (const item of dto.items) {
      const poItem = purchaseOrder.items.find(
        (i) => i.id === item.purchaseOrderItemId,
      );

      if (!poItem) {
        throw new BadRequestException(
          `Item Purchase Order '${item.purchaseOrderItemId}' tidak ditemukan`,
        );
      }

      const alreadyReceived = poItem.receiveItems.reduce(
        (sum, ri) => sum + Number(ri.receivedQty),
        0,
      );
      const remaining = Number(poItem.quantity) - alreadyReceived;

      if (Number(item.receivedQty) > remaining) {
        throw new BadRequestException(
          `Quantity yang diterima melebihi sisa quantity PO (sisa: ${remaining})`,
        );
      }
    }

    // Create goods receive and update stock in a transaction
    const goodsReceive = await this.prisma.$transaction(async (tx) => {
      // Create the goods receive record
      const gr = await tx.goodsReceive.create({
        data: {
          receiveNumber,
          purchaseOrderId: dto.purchaseOrderId,
          warehouseId: dto.warehouseId,
          receiveDate: dto.receiveDate ? new Date(dto.receiveDate) : new Date(),
          notes: dto.notes,
          createdBy: userId,
          items: {
            create: dto.items.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              receivedQty: item.receivedQty,
              notes: item.notes,
            })),
          },
        },
        include: {
          purchaseOrder: {
            include: { supplier: true },
          },
          warehouse: true,
          items: {
            include: {
              purchaseOrderItem: {
                include: {
                  variant: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Update receivedQty on each PO item and update stock
      for (const item of dto.items) {
        const poItem = purchaseOrder.items.find(
          (i) => i.id === item.purchaseOrderItemId,
        );

        if (!poItem) continue;

        // Update PO item received quantity
        await tx.purchaseOrderItem.update({
          where: { id: item.purchaseOrderItemId },
          data: {
            receivedQty: {
              increment: item.receivedQty,
            },
          },
        });

        // Upsert stock
        await tx.stock.upsert({
          where: {
            variantId_warehouseId: {
              variantId: poItem.variantId,
              warehouseId: dto.warehouseId,
            },
          },
          create: {
            variantId: poItem.variantId,
            warehouseId: dto.warehouseId,
            quantity: item.receivedQty,
            reservedQty: 0,
          },
          update: {
            quantity: {
              increment: item.receivedQty,
            },
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            variantId: poItem.variantId,
            warehouseId: dto.warehouseId,
            type: 'in',
            quantity: item.receivedQty,
            referenceType: 'goods_receive',
            referenceId: gr.id,
            notes: `Penerimaan barang dari PO ${purchaseOrder.orderNumber}`,
            createdBy: userId,
          },
        });
      }

      // Determine new PO status based on received quantities
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { orderId: dto.purchaseOrderId },
      });

      const allFullyReceived = updatedPoItems.every(
        (i) => Number(i.receivedQty) >= Number(i.quantity),
      );
      const anyReceived = updatedPoItems.some((i) => Number(i.receivedQty) > 0);

      let newStatus = purchaseOrder.status;
      if (allFullyReceived) {
        newStatus = 'received';
      } else if (anyReceived) {
        newStatus = 'ordered'; // partial receive, keep as ordered
      }

      if (newStatus !== purchaseOrder.status) {
        await tx.purchaseOrder.update({
          where: { id: dto.purchaseOrderId },
          data: { status: newStatus },
        });
      }

      return gr;
    });

    return successResponse(goodsReceive);
  }

  /**
   * Delete a goods receive (reverses stock changes)
   */
  async delete(id: string, userId: string) {
    const goodsReceive = await this.prisma.goodsReceive.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            purchaseOrderItem: true,
          },
        },
        purchaseOrder: true,
      },
    });

    if (!goodsReceive) {
      throw new NotFoundException('Penerimaan Barang tidak ditemukan');
    }

    await this.prisma.$transaction(async (tx) => {
      // Reverse stock changes
      for (const item of goodsReceive.items) {
        const poItem = item.purchaseOrderItem;

        // Decrease stock
        await tx.stock.update({
          where: {
            variantId_warehouseId: {
              variantId: poItem.variantId,
              warehouseId: goodsReceive.warehouseId,
            },
          },
          data: {
            quantity: {
              decrement: item.receivedQty,
            },
          },
        });

        // Reverse PO item received quantity
        await tx.purchaseOrderItem.update({
          where: { id: item.purchaseOrderItemId },
          data: {
            receivedQty: {
              decrement: item.receivedQty,
            },
          },
        });

        // Remove related stock movements
        await tx.stockMovement.deleteMany({
          where: {
            referenceType: 'goods_receive',
            referenceId: id,
          },
        });
      }

      // Recalculate PO status
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { orderId: goodsReceive.purchaseOrderId },
      });

      const allFullyReceived = updatedPoItems.every(
        (i) => Number(i.receivedQty) >= Number(i.quantity),
      );
      const anyReceived = updatedPoItems.some((i) => Number(i.receivedQty) > 0);

      let newStatus = goodsReceive.purchaseOrder.status;
      if (allFullyReceived) {
        newStatus = 'received';
      } else if (anyReceived) {
        newStatus = 'ordered';
      } else {
        newStatus = 'ordered'; // back to ordered if no items received
      }

      await tx.purchaseOrder.update({
        where: { id: goodsReceive.purchaseOrderId },
        data: { status: newStatus },
      });

      // Delete the goods receive (cascade deletes items)
      await tx.goodsReceive.delete({ where: { id } });
    });

    return successResponse({
      message: `Penerimaan Barang '${goodsReceive.receiveNumber}' berhasil dihapus`,
    });
  }
}
