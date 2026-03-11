import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreatePurchaseReturnValues,
  UpdatePurchaseReturnValues,
  UpdatePurchaseReturnStatusValues,
  QueryPurchaseReturnsValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class PurchaseReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all purchase returns with pagination and filters
   */
  async findAll(
    query: QueryPurchaseReturnsValues,
  ): Promise<
    ApiResponse<Prisma.PurchaseReturnGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      orderId,
      status,
      startDate,
      endDate,
      supplierId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { returnNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
        { order: { supplier: { name: { contains: search } } } },
      ];
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (supplierId) {
      where.order = { supplierId };
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

    const [totalItems, purchaseReturns] = await Promise.all([
      this.prisma.purchaseReturn.count({ where }),
      this.prisma.purchaseReturn.findMany({
        where,
        include: {
          order: {
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
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
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
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          approver: {
            select: {
              id: true,
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

    const summary = await this.buildSummary();

    return paginatedResponse(
      purchaseReturns,
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
    const [
      totalReturns,
      pendingReturns,
      approvedReturns,
      rejectedReturns,
      completedReturns,
    ] = await Promise.all([
      this.prisma.purchaseReturn.count(),
      this.prisma.purchaseReturn.count({ where: { status: 'pending' } }),
      this.prisma.purchaseReturn.count({ where: { status: 'approved' } }),
      this.prisma.purchaseReturn.count({ where: { status: 'rejected' } }),
      this.prisma.purchaseReturn.count({ where: { status: 'completed' } }),
    ]);

    return {
      totalReturns,
      pendingReturns,
      approvedReturns,
      rejectedReturns,
      completedReturns,
    };
  }

  /**
   * Get a single purchase return by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            supplier: true,
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
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!purchaseReturn) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Purchase Return"}`);
    }

    return successResponse(purchaseReturn);
  }

  /**
   * Generate next purchase return number
   */
  async generateReturnNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.purchaseReturn.count({
      where: { returnNumber: { startsWith: `PR-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `PR-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.purchaseReturn.findUnique({
        where: { returnNumber: candidate },
      })
    ) {
      next++;
      candidate = `PR-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new purchase return
   */
  async create(
    dto: CreatePurchaseReturnValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    // Verify purchase order exists
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.orderId },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Purchase Order"}`);
    }

    // Only allow returns for received/completed orders
    if (!['received', 'completed'].includes(purchaseOrder.status)) {
      throw new BadRequestException(
        'Return hanya dapat dilakukan for Purchase Order dengan status received atau completed',
      );
    }

    // Validate return items against PO items
    for (const returnItem of dto.items) {
      const poItem = purchaseOrder.items.find(
        (item) => item.variantId === returnItem.variantId,
      );

      if (!poItem) {
        throw new BadRequestException(
          `messages.error.notFound|{"name": "Variant"}`,
        );
      }

      if (Number(returnItem.quantity) > Number(poItem.receivedQty)) {
        throw new BadRequestException(
          `Quantity return tidak boleh melebihi quantity yang sudah diterima (${poItem.receivedQty})`,
        );
      }
    }

    // Generate return number if not provided
    let returnNumber = dto.returnNumber;
    if (!returnNumber) {
      returnNumber = await this.generateReturnNumber();
    } else {
      const existing = await this.prisma.purchaseReturn.findUnique({
        where: { returnNumber },
      });
      if (existing) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Nomor return ${returnNumber}"}`,
        );
      }
    }

    // Calculate total return amount from PO item prices
    let returnAmount = 0;
    for (const returnItem of dto.items) {
      const poItem = purchaseOrder.items.find(
        (item) => item.variantId === returnItem.variantId,
      );
      if (poItem) {
        returnAmount += Number(returnItem.quantity) * Number(poItem.unitPrice);
      }
    }

    const purchaseReturn = await this.prisma.purchaseReturn.create({
      data: {
        returnNumber,
        orderId: dto.orderId,
        reason: dto.reason,
        returnAmount,
        notes: dto.notes,
        status: 'pending',
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            reason: item.reason,
          })),
        },
      },
      include: {
        order: {
          include: {
            supplier: true,
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
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseReturn);
  }

  /**
   * Update a purchase return (only when pending)
   */
  async update(
    id: string,
    dto: UpdatePurchaseReturnValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    const existing = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Purchase Return"}`);
    }

    if (existing.status !== 'pending') {
      throw new BadRequestException(
        'Hanya Purchase Return dengan status pending yang dapat diedit',
      );
    }

    let updateData: any = {
      reason: dto.reason,
      notes: dto.notes,
    };

    if (dto.items) {
      // Validate items against PO
      for (const returnItem of dto.items) {
        const poItem = existing.order.items.find(
          (item) => item.variantId === returnItem.variantId,
        );

        if (!poItem) {
          throw new BadRequestException(
            `messages.error.notFound|{"name": "Variant"}`,
          );
        }

        if (Number(returnItem.quantity) > Number(poItem.receivedQty)) {
          throw new BadRequestException(
            `Quantity return tidak boleh melebihi quantity yang sudah diterima (${poItem.receivedQty})`,
          );
        }
      }

      // Recalculate return amount
      let returnAmount = 0;
      for (const returnItem of dto.items) {
        const poItem = existing.order.items.find(
          (item) => item.variantId === returnItem.variantId,
        );
        if (poItem) {
          returnAmount +=
            Number(returnItem.quantity) * Number(poItem.unitPrice);
        }
      }

      // Delete existing items and recreate
      await this.prisma.purchaseReturnItem.deleteMany({
        where: { returnId: id },
      });

      updateData.returnAmount = returnAmount;
      updateData.items = {
        create: dto.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: item.reason,
        })),
      };
    }

    const purchaseReturn = await this.prisma.purchaseReturn.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            supplier: true,
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
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseReturn);
  }

  /**
   * Update purchase return status (approve/reject/complete)
   */
  async updateStatus(
    id: string,
    dto: UpdatePurchaseReturnStatusValues,
    userId: string,
    userPermissions: string[],
  ): Promise<ApiResponse<Prisma.PurchaseReturnGetPayload<object>>> {
    const existing = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Purchase Return"}`);
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['completed', 'rejected'],
      rejected: [],
      completed: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const updateData: any = {
      status: dto.status,
      notes: dto.notes ?? existing.notes,
    };

    const checkPerm = (perm: string) => {
      return (
        userPermissions.includes(perm) ||
        userPermissions.includes('purchase-returns:*') ||
        userPermissions.includes('*:*')
      );
    };

    if (dto.status === 'approved') {
      if (!checkPerm('purchase-returns:approve')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk melakukan approve',
        );
      }
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (dto.status === 'rejected') {
      if (!checkPerm('purchase-returns:reject')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk melakukan reject',
        );
      }
    }

    // When completing (stock is returned to supplier), update stock movements
    if (dto.status === 'completed') {
      // Reduce stock for each returned item
      for (const item of existing.items) {
        // Find the stock record (use default/first warehouse for now)
        const stock = await this.prisma.stock.findFirst({
          where: { variantId: item.variantId },
          orderBy: { updatedAt: 'desc' },
        });

        if (stock) {
          await this.prisma.stock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });

          // Record stock movement
          await this.prisma.stockMovement.create({
            data: {
              variantId: item.variantId,
              warehouseId: stock.warehouseId,
              type: 'out',
              quantity: item.quantity,
              referenceType: 'purchase_return',
              referenceId: id,
              notes: `Purchase Return: ${existing.returnNumber}`,
              createdBy: userId,
            },
          });
        }
      }
    }

    const purchaseReturn = await this.prisma.purchaseReturn.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            supplier: true,
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
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseReturn);
  }

  /**
   * Delete a purchase return (only when pending)
   */
  async delete(id: string, userId: string) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { id },
    });

    if (!purchaseReturn) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Purchase Return"}`);
    }

    if (purchaseReturn.status !== 'pending') {
      throw new BadRequestException(
        'Hanya Purchase Return dengan status pending yang dapat dihapus',
      );
    }

    await this.prisma.purchaseReturn.delete({
      where: { id },
    });

    return successResponse({
      message: `messages.success.deleted|{"name": "${purchaseReturn.returnNumber}"}`,
    });
  }

  /**
   * Bulk delete purchase returns
   */
  async bulkDelete(ids: string[], userId: string) {
    const purchaseReturns = await this.prisma.purchaseReturn.findMany({
      where: { id: { in: ids } },
    });

    if (purchaseReturns.length !== ids.length) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Beberapa Purchase Return"}`);
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const ret of purchaseReturns) {
      if (ret.status !== 'pending') {
        skippedCount++;
        continue;
      }

      await this.prisma.purchaseReturn.delete({ where: { id: ret.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) {
      messages.push(`${deletedCount} Purchase Return dihapus`);
    }
    if (skippedCount > 0) {
      messages.push(
        `${skippedCount} Purchase Return dilewati (bukan status pending)`,
      );
    }

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
