import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateInvoiceValues,
  UpdateInvoiceValues,
  QueryInvoicesValues,
  UpdateInvoiceStatusValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all invoices with pagination and filter
   */
  async findAll(
    query: QueryInvoicesValues,
  ): Promise<
    ApiResponse<Prisma.InvoiceGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      paymentStatus,
      orderId,
      customerId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
        { customer: { name: { contains: search } } },
      ];
    }

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (orderId) where.orderId = orderId;
    if (customerId) where.customerId = customerId;

    if (query.startDate || query.endDate) {
      where.invoiceDate = {};
      if (query.startDate) where.invoiceDate.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.invoiceDate.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, invoices] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNumber: true },
          },
          customer: {
            select: { id: true, code: true, name: true },
          },
          _count: {
            select: { items: true, payments: true },
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
      invoices,
      { page: pageNum, pageSize: sizeNum, totalItems, totalPages },
      summary,
    );
  }

  private async buildSummary() {
    const [total, draft, sent, partial, paid, cancelled] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: 'draft' } }),
      this.prisma.invoice.count({ where: { status: 'sent' } }),
      this.prisma.invoice.count({ where: { status: 'partial' } }),
      this.prisma.invoice.count({ where: { status: 'paid' } }),
      this.prisma.invoice.count({ where: { status: 'cancelled' } }),
    ]);

    return { total, draft, sent, partial, paid, cancelled };
  }

  /**
   * Get a single invoice by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customerId: true,
          },
        },
        customer: true,
        items: {
          include: {
            orderItem: true,
            variant: {
              include: {
                product: { select: { name: true, sku: true } },
              },
            },
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
        deliveryOrders: {
          select: {
            id: true,
            deliveryNumber: true,
            status: true,
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice tidak ditemukan');
    }

    return successResponse(invoice);
  }

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.invoice.count({
      where: { invoiceNumber: { startsWith: `INV-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `INV-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.invoice.findUnique({
        where: { invoiceNumber: candidate },
      })
    ) {
      next++;
      candidate = `INV-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new invoice from a confirmed Sales Order
   */
  async create(
    dto: CreateInvoiceValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    // Verify Sales Order exists and is confirmed
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id: dto.orderId },
      include: { customer: true },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    if (salesOrder.status === 'draft' || salesOrder.status === 'cancelled') {
      throw new BadRequestException(
        'Sales Order harus dalam status confirmed atau invoiced untuk membuat invoice',
      );
    }

    // Generate invoice number if not provided
    let invoiceNumber = dto.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await this.generateInvoiceNumber();
    } else {
      const existing = await this.prisma.invoice.findUnique({
        where: { invoiceNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor invoice '${invoiceNumber}' sudah digunakan`,
        );
      }
    }

    // Calculate totals from items
    const subtotal = dto.items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) * Number(item.unitPrice) -
        Number(item.discountAmount || 0),
      0,
    );

    // Reuse discount/tax from Sales Order proportionally (or set 0 for partial invoice)
    const taxAmount =
      Number(salesOrder.taxPercent) > 0
        ? (subtotal * Number(salesOrder.taxPercent)) / 100
        : 0;
    const total = subtotal + taxAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: dto.orderId,
        customerId: salesOrder.customerId,
        invoiceDate: dto.invoiceDate
          ? new Date(dto.invoiceDate as string)
          : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate as string) : null,
        status: 'draft',
        paymentStatus: 'unpaid',
        subtotal,
        discountAmount: 0,
        taxAmount,
        total,
        paidAmount: 0,
        notes: dto.notes,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            orderItemId: item.orderItemId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            subtotal:
              Number(item.quantity) * Number(item.unitPrice) -
              Number(item.discountAmount || 0),
            notes: item.notes,
          })),
        },
      },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    // Update Sales Order status to invoiced if still confirmed
    if (salesOrder.status === 'confirmed') {
      await this.prisma.salesOrder.update({
        where: { id: dto.orderId },
        data: { status: 'invoiced' },
      });
    }

    return successResponse(invoice);
  }

  /**
   * Update an existing invoice (draft only)
   */
  async update(
    id: string,
    dto: UpdateInvoiceValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Invoice tidak ditemukan');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya invoice dengan status draft yang dapat diedit',
      );
    }

    let updateData: any = {
      invoiceDate: dto.invoiceDate
        ? new Date(dto.invoiceDate as string)
        : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate as string) : null,
      notes: dto.notes,
    };

    if (dto.items) {
      const subtotal = dto.items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity) * Number(item.unitPrice) -
          Number(item.discountAmount || 0),
        0,
      );
      const total = subtotal; // Simplified; recalculate tax if needed

      updateData = { ...updateData, subtotal, total };

      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

      updateData.items = {
        create: dto.items.map((item) => ({
          orderItemId: item.orderItemId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount || 0,
          subtotal:
            Number(item.quantity) * Number(item.unitPrice) -
            Number(item.discountAmount || 0),
          notes: item.notes,
        })),
      };
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        order: { select: { id: true, orderNumber: true } },
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(invoice);
  }

  /**
   * Update invoice status
   */
  async updateStatus(
    id: string,
    dto: UpdateInvoiceStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.InvoiceGetPayload<object>>> {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Invoice tidak ditemukan');
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['partial', 'paid', 'cancelled'],
      partial: ['paid', 'cancelled'],
      paid: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    // If marked as paid, also update paymentStatus
    const updateData: any = { status: dto.status };
    if (dto.status === 'paid') {
      updateData.paymentStatus = 'paid';
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        order: { select: { id: true, orderNumber: true } },
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(invoice);
  }

  /**
   * Delete a draft invoice
   */
  async delete(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice tidak ditemukan');
    }

    if (invoice.status !== 'draft') {
      throw new BadRequestException(
        'Hanya invoice dengan status draft yang dapat dihapus',
      );
    }

    if (invoice._count.payments > 0) {
      throw new ConflictException(
        'Invoice tidak dapat dihapus karena sudah memiliki pembayaran',
      );
    }

    await this.prisma.invoice.delete({ where: { id } });

    return successResponse({
      message: `Invoice '${invoice.invoiceNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete draft invoices
   */
  async bulkDelete(ids: string[], userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { id: { in: ids } },
      include: { _count: { select: { payments: true } } },
    });

    if (invoices.length !== ids.length) {
      throw new NotFoundException('Beberapa invoice tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const inv of invoices) {
      if (inv.status !== 'draft' || inv._count.payments > 0) {
        skippedCount++;
        continue;
      }
      await this.prisma.invoice.delete({ where: { id: inv.id } });
      deletedCount++;
    }

    return successResponse({
      message: [
        deletedCount > 0 ? `${deletedCount} invoice dihapus` : '',
        skippedCount > 0
          ? `${skippedCount} invoice dilewati (bukan draft atau memiliki pembayaran)`
          : '',
      ]
        .filter(Boolean)
        .join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
