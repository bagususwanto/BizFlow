import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateSalesReturnValues,
  UpdateSalesReturnValues,
  UpdateSalesReturnStatusValues,
  QuerySalesReturnsValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class SalesReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all sales returns with pagination and filters
   */
  async findAll(
    query: QuerySalesReturnsValues,
  ): Promise<
    ApiResponse<Prisma.SalesReturnGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      orderId,
      customerId,
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
        { returnNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
        { order: { customer: { name: { contains: search } } } },
      ];
    }

    if (orderId) where.orderId = orderId;
    if (customerId) where.order = { customerId };
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, salesReturns] = await Promise.all([
      this.prisma.salesReturn.count({ where }),
      this.prisma.salesReturn.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: {
                select: { id: true, code: true, name: true },
              },
            },
          },
          items: {
            include: {
              orderItem: {
                include: {
                  variant: {
                    include: {
                      product: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
          _count: { select: { items: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);
    const summary = await this.buildSummary();

    return paginatedResponse(
      salesReturns,
      { page: pageNum, pageSize: sizeNum, totalItems, totalPages },
      summary,
    );
  }

  private async buildSummary() {
    const [totalReturns, pendingReturns, approvedReturns, rejectedReturns] =
      await Promise.all([
        this.prisma.salesReturn.count(),
        this.prisma.salesReturn.count({ where: { status: 'pending' } }),
        this.prisma.salesReturn.count({ where: { status: 'approved' } }),
        this.prisma.salesReturn.count({ where: { status: 'rejected' } }),
      ]);

    return { totalReturns, pendingReturns, approvedReturns, rejectedReturns };
  }

  /**
   * Get a single sales return by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
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
        },
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: {
                    product: { select: { name: true, sku: true } },
                  },
                },
              },
            },
          },
        },
        creator: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    if (!salesReturn) {
      throw new NotFoundException('Sales Return tidak ditemukan');
    }

    return successResponse(salesReturn);
  }

  /**
   * Generate next return number: SR-YYYYMMDD-XXX
   */
  async generateReturnNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.salesReturn.count({
      where: { returnNumber: { startsWith: `SR-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `SR-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.salesReturn.findUnique({
        where: { returnNumber: candidate },
      })
    ) {
      next++;
      candidate = `SR-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new sales return
   */
  async create(
    dto: CreateSalesReturnValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    // Verify sales order exists
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice tidak ditemukan');
      }
      if (invoice.orderId !== dto.orderId) {
        throw new BadRequestException('Invoice ini bukan milik Sales Order yang dipilih');
      }
    }

    // Only allow returns for confirmed/invoiced/completed orders
    if (!['confirmed', 'invoiced', 'completed'].includes(salesOrder.status)) {
      throw new BadRequestException(
        'Return hanya dapat dilakukan untuk Sales Order dengan status confirmed, invoiced, atau completed',
      );
    }

    // Validate return items against SO items
    for (const returnItem of dto.items) {
      const soItem = salesOrder.items.find(
        (item) => item.id === returnItem.orderItemId,
      );

      if (!soItem) {
        throw new BadRequestException(
          `Order item dengan ID '${returnItem.orderItemId}' tidak ditemukan di Sales Order ini`,
        );
      }

      const previouslyReturned = await this.prisma.salesReturnItem.aggregate({
        where: { 
          orderItemId: returnItem.orderItemId,
          return: { status: { in: ['approved', 'completed'] } }
        },
        _sum: { quantity: true }
      });

      const existingReturnedQty = previouslyReturned._sum.quantity || 0;
      const totalRequestedQty = Number(existingReturnedQty) + Number(returnItem.quantity);

      if (totalRequestedQty > Number(soItem.quantity)) {
        throw new BadRequestException(
          `Quantity return (${returnItem.quantity}) ditambah retur sebelumnya (${existingReturnedQty}) tidak boleh melebihi quantity yang dipesan (${soItem.quantity}) untuk item ini`,
        );
      }
    }

    // Generate return number if not provided
    let returnNumber = dto.returnNumber;
    if (!returnNumber) {
      returnNumber = await this.generateReturnNumber();
    } else {
      const existing = await this.prisma.salesReturn.findUnique({
        where: { returnNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor return '${returnNumber}' sudah digunakan`,
        );
      }
    }

    // Calculate refund amount from SO item prices
    let refundAmount = 0;
    for (const returnItem of dto.items) {
      const soItem = salesOrder.items.find(
        (item) => item.id === returnItem.orderItemId,
      );
      if (soItem) {
        refundAmount += Number(returnItem.quantity) * Number(soItem.unitPrice);
      }
    }

    const salesReturn = await this.prisma.salesReturn.create({
      data: {
        returnNumber,
        orderId: dto.orderId,
        invoiceId: dto.invoiceId,
        reason: dto.reason,
        refundMethod: dto.refundMethod ?? null,
        refundAmount,
        returnToStock: dto.returnToStock ?? true,
        notes: dto.notes,
        status: 'pending',
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            reason: item.reason,
          })),
        },
      },
      include: {
        order: {
          include: { customer: true },
        },
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: {
                    product: { select: { name: true, sku: true } },
                  },
                },
              },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesReturn);
  }

  /**
   * Update a sales return (only when pending)
   */
  async update(
    id: string,
    dto: UpdateSalesReturnValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    const existing = await this.prisma.salesReturn.findUnique({
      where: { id },
      include: {
        order: { include: { items: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Sales Return tidak ditemukan');
    }

    if (existing.status !== 'pending') {
      throw new BadRequestException(
        'Hanya Sales Return dengan status pending yang dapat diedit',
      );
    }

    let updateData: any = {
      reason: dto.reason,
      refundMethod: dto.refundMethod,
      notes: dto.notes,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    if (dto.items) {
      // Validate items against SO
      for (const returnItem of dto.items) {
        const soItem = existing.order.items.find(
          (item) => item.id === returnItem.orderItemId,
        );

        if (!soItem) {
          throw new BadRequestException(
            `Order item dengan ID '${returnItem.orderItemId}' tidak ditemukan di Sales Order ini`,
          );
        }

        if (Number(returnItem.quantity) > Number(soItem.quantity)) {
          throw new BadRequestException(
            `Quantity return (${returnItem.quantity}) tidak boleh melebihi quantity yang dipesan (${soItem.quantity})`,
          );
        }
      }

      // Recalculate refund amount
      let refundAmount = 0;
      for (const returnItem of dto.items) {
        const soItem = existing.order.items.find(
          (item) => item.id === returnItem.orderItemId,
        );
        if (soItem) {
          refundAmount +=
            Number(returnItem.quantity) * Number(soItem.unitPrice);
        }
      }

      // Delete existing items and recreate
      await this.prisma.salesReturnItem.deleteMany({
        where: { returnId: id },
      });

      updateData.refundAmount = refundAmount;
      updateData.items = {
        create: dto.items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason: item.reason,
        })),
      };
    }

    const salesReturn = await this.prisma.salesReturn.update({
      where: { id },
      data: updateData,
      include: {
        order: { include: { customer: true } },
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: { product: { select: { name: true, sku: true } } },
                },
              },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesReturn);
  }

  /**
   * Update sales return status (approve / reject)
   */
  async updateStatus(
    id: string,
    dto: UpdateSalesReturnStatusValues,
    userId: string,
    userPermissions: string[],
  ): Promise<ApiResponse<Prisma.SalesReturnGetPayload<object>>> {
    const existing = await this.prisma.salesReturn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            orderItem: true,
          },
        },
        order: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Sales Return tidak ditemukan');
    }

    // Validate status transitions: pending → approved | rejected
    const validTransitions: Record<string, string[]> = {
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

    const checkPerm = (perm: string) =>
      userPermissions.includes(perm) ||
      userPermissions.includes('sales-returns:*') ||
      userPermissions.includes('*:*');

    const updateData: any = {
      status: dto.status,
      notes: dto.notes ?? existing.notes,
    };

    if (dto.status === 'approved') {
      if (!checkPerm('sales-returns:approve')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk menyetujui return',
        );
      }
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (dto.status === 'rejected') {
      if (!checkPerm('sales-returns:reject')) {
        throw new ForbiddenException(
          'Akses ditolak: Anda tidak memiliki izin untuk menolak return',
        );
      }
    }

    // When approved: restore stock for each returned item
    if (dto.status === 'approved' && existing.returnToStock) {
      for (const item of existing.items) {
        const variantId = item.orderItem.variantId;

        // Find the stock record in any warehouse (use first found)
        const stock = await this.prisma.stock.findFirst({
          where: { variantId },
          orderBy: { updatedAt: 'desc' },
        });

        if (stock) {
          await this.prisma.stock.update({
            where: { id: stock.id },
            data: { quantity: { increment: item.quantity } },
          });

          // Record stock movement (in)
          await this.prisma.stockMovement.create({
            data: {
              variantId,
              warehouseId: stock.warehouseId,
              type: 'in',
              quantity: item.quantity,
              referenceType: 'sales_return',
              referenceId: id,
              notes: `Sales Return: ${existing.returnNumber}`,
              createdBy: userId,
            },
          });
        }
      }
    }

    const salesReturn = await this.prisma.salesReturn.update({
      where: { id },
      data: updateData,
      include: {
        order: { include: { customer: true } },
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: { product: { select: { name: true, sku: true } } },
                },
              },
            },
          },
        },
        creator: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesReturn);
  }

  /**
   * Delete a sales return (only when pending)
   */
  async delete(id: string, userId: string) {
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id },
    });

    if (!salesReturn) {
      throw new NotFoundException('Sales Return tidak ditemukan');
    }

    if (salesReturn.status !== 'pending') {
      throw new BadRequestException(
        'Hanya Sales Return dengan status pending yang dapat dihapus',
      );
    }

    await this.prisma.salesReturn.delete({ where: { id } });

    return successResponse({
      message: `Sales Return '${salesReturn.returnNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete sales returns (only pending ones)
   */
  async bulkDelete(ids: string[], userId: string) {
    const salesReturns = await this.prisma.salesReturn.findMany({
      where: { id: { in: ids } },
    });

    if (salesReturns.length !== ids.length) {
      throw new NotFoundException('Beberapa Sales Return tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const ret of salesReturns) {
      if (ret.status !== 'pending') {
        skippedCount++;
        continue;
      }
      await this.prisma.salesReturn.delete({ where: { id: ret.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) messages.push(`${deletedCount} Sales Return dihapus`);
    if (skippedCount > 0)
      messages.push(
        `${skippedCount} Sales Return dilewati (bukan status pending)`,
      );

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
