import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateSalesOrderValues,
  UpdateSalesOrderValues,
  QuerySalesOrdersValues,
  UpdateSalesOrderStatusValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all sales orders with pagination, filter, and summary
   */
  async findAll(
    query: QuerySalesOrdersValues,
  ): Promise<
    ApiResponse<Prisma.SalesOrderGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      paymentStatus,
      customerId,
      outletId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { code: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (query.startDate || query.endDate) {
      where.orderDate = {};
      if (query.startDate) {
        where.orderDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.orderDate.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, salesOrders] = await Promise.all([
      this.prisma.salesOrder.count({ where }),
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: {
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
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
              invoices: true,
              payments: true,
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
      salesOrders,
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
      totalOrders,
      draftOrders,
      confirmedOrders,
      invoicedOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.salesOrder.count(),
      this.prisma.salesOrder.count({ where: { status: 'draft' } }),
      this.prisma.salesOrder.count({ where: { status: 'confirmed' } }),
      this.prisma.salesOrder.count({ where: { status: 'invoiced' } }),
      this.prisma.salesOrder.count({ where: { status: 'completed' } }),
      this.prisma.salesOrder.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      totalOrders,
      draftOrders,
      confirmedOrders,
      invoicedOrders,
      completedOrders,
      cancelledOrders,
    };
  }

  /**
   * Get a single sales order by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true },
        },
        outlet: {
          select: { id: true, name: true },
        },
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
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            paidAmount: true,
          },
        },
        deliveryOrders: {
          select: {
            id: true,
            deliveryNumber: true,
            status: true,
            deliveryDate: true,
          },
        },
        payments: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
          },
        },
        returns: {
          select: {
            id: true,
            returnNumber: true,
            status: true,
          },
        },
      },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    return successResponse(salesOrder);
  }

  /**
   * Generate next sales order number
   */
  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.salesOrder.count({
      where: { orderNumber: { startsWith: `SO-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `SO-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.salesOrder.findUnique({
        where: { orderNumber: candidate },
      })
    ) {
      next++;
      candidate = `SO-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new sales order
   */
  async create(
    dto: CreateSalesOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    // Generate order number if not provided
    let orderNumber = dto.orderNumber;
    if (!orderNumber) {
      orderNumber = await this.generateOrderNumber();
    } else {
      const existing = await this.prisma.salesOrder.findUnique({
        where: { orderNumber: dto.orderNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor SO '${dto.orderNumber}' sudah digunakan`,
        );
      }
    }

    // Verify customer exists if provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer tidak ditemukan');
      }
    }

    // Calculate totals
    const itemSubtotals = dto.items.map((item) => {
      const base = Number(item.quantity) * Number(item.unitPrice);
      const discAmt =
        item.discountPercent && item.discountPercent > 0
          ? (base * Number(item.discountPercent)) / 100
          : Number(item.discountAmount || 0);
      return base - discAmt;
    });

    const subtotal = itemSubtotals.reduce((sum, s) => sum + s, 0);

    const discountAmount =
      dto.discountPercent && dto.discountPercent > 0
        ? (subtotal * Number(dto.discountPercent)) / 100
        : Number(dto.discountAmount || 0);

    const taxableAmount = subtotal - discountAmount;
    const taxAmount =
      dto.taxPercent && dto.taxPercent > 0
        ? (taxableAmount * Number(dto.taxPercent)) / 100
        : 0;

    const total = taxableAmount + taxAmount;

    const salesOrder = await this.prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: dto.customerId || null,
        userId,
        outletId: dto.outletId,
        orderDate: dto.orderDate ? new Date(dto.orderDate as string) : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate as string) : null,
        status: dto.status || 'draft',
        paymentStatus: 'unpaid',
        subtotal,
        discountPercent: dto.discountPercent || 0,
        discountAmount,
        taxPercent: dto.taxPercent || 0,
        taxAmount,
        total,
        paidAmount: 0,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => {
            const base = Number(item.quantity) * Number(item.unitPrice);
            const discAmt =
              item.discountPercent && item.discountPercent > 0
                ? (base * Number(item.discountPercent)) / 100
                : Number(item.discountAmount || 0);
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || 0,
              discountAmount: discAmt,
              subtotal: base - discAmt,
              notes: item.notes,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesOrder);
  }

  /**
   * Update an existing sales order (draft only)
   */
  async update(
    id: string,
    dto: UpdateSalesOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Sales Order dengan status draft yang dapat diedit',
      );
    }

    // Check duplicate order number if changing
    if (dto.orderNumber && dto.orderNumber !== existing.orderNumber) {
      const duplicate = await this.prisma.salesOrder.findFirst({
        where: { orderNumber: dto.orderNumber, NOT: { id } },
      });
      if (duplicate) {
        throw new ConflictException(
          `Nomor SO '${dto.orderNumber}' sudah digunakan`,
        );
      }
    }

    let updateData: any = {
      orderNumber: dto.orderNumber,
      customerId: dto.customerId,
      outletId: dto.outletId,
      orderDate: dto.orderDate ? new Date(dto.orderDate as string) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate as string) : null,
      notes: dto.notes,
    };

    if (dto.items) {
      const itemSubtotals = dto.items.map((item) => {
        const base = Number(item.quantity) * Number(item.unitPrice);
        const discAmt =
          item.discountPercent && item.discountPercent > 0
            ? (base * Number(item.discountPercent)) / 100
            : Number(item.discountAmount || 0);
        return base - discAmt;
      });

      const subtotal = itemSubtotals.reduce((sum, s) => sum + s, 0);
      const discountAmount =
        dto.discountPercent && dto.discountPercent > 0
          ? (subtotal * Number(dto.discountPercent)) / 100
          : Number(dto.discountAmount || 0);
      const taxableAmount = subtotal - discountAmount;
      const taxAmount =
        dto.taxPercent && dto.taxPercent > 0
          ? (taxableAmount * Number(dto.taxPercent)) / 100
          : 0;
      const total = taxableAmount + taxAmount;

      updateData = {
        ...updateData,
        subtotal,
        discountPercent: dto.discountPercent || 0,
        discountAmount,
        taxPercent: dto.taxPercent || 0,
        taxAmount,
        total,
      };

      await this.prisma.salesOrderItem.deleteMany({ where: { orderId: id } });

      updateData.items = {
        create: dto.items.map((item) => {
          const base = Number(item.quantity) * Number(item.unitPrice);
          const discAmt =
            item.discountPercent && item.discountPercent > 0
              ? (base * Number(item.discountPercent)) / 100
              : Number(item.discountAmount || 0);
          return {
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent || 0,
            discountAmount: discAmt,
            subtotal: base - discAmt,
            notes: item.notes,
          };
        }),
      };
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    const salesOrder = await this.prisma.salesOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        user: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesOrder);
  }

  /**
   * Update sales order status
   */
  async updateStatus(
    id: string,
    dto: UpdateSalesOrderStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SalesOrderGetPayload<object>>> {
    const existing = await this.prisma.salesOrder.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['invoiced', 'cancelled'],
      invoiced: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const salesOrder = await this.prisma.salesOrder.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        user: { select: { id: true, name: true } },
      },
    });

    return successResponse(salesOrder);
  }

  /**
   * Delete a sales order (draft only)
   */
  async delete(id: string, userId: string) {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        _count: {
          select: { invoices: true, payments: true },
        },
      },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    if (salesOrder.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Sales Order dengan status draft yang dapat dihapus',
      );
    }

    if (salesOrder._count.invoices > 0 || salesOrder._count.payments > 0) {
      throw new ConflictException(
        'Sales Order tidak dapat dihapus karena sudah memiliki invoice atau pembayaran',
      );
    }

    await this.prisma.salesOrder.delete({ where: { id } });

    return successResponse({
      message: `Sales Order '${salesOrder.orderNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete sales orders
   */
  async bulkDelete(ids: string[], userId: string) {
    const salesOrders = await this.prisma.salesOrder.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: { invoices: true, payments: true },
        },
      },
    });

    if (salesOrders.length !== ids.length) {
      throw new NotFoundException('Beberapa Sales Order tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const order of salesOrders) {
      if (order.status !== 'draft') {
        skippedCount++;
        continue;
      }

      if (order._count.invoices > 0 || order._count.payments > 0) {
        skippedCount++;
        continue;
      }

      await this.prisma.salesOrder.delete({ where: { id: order.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) messages.push(`${deletedCount} Sales Order dihapus`);
    if (skippedCount > 0)
      messages.push(
        `${skippedCount} Sales Order dilewati (bukan draft atau memiliki transaksi)`,
      );

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
