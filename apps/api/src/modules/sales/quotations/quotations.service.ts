import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateQuotationValues,
  UpdateQuotationValues,
  UpdateQuotationStatusValues,
  QueryQuotationsValues,
  ConvertQuotationValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

// === Prisma include helper ===================================================
const QUOTATION_INCLUDE = {
  customer: {
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  },
  user: { select: { id: true, name: true } },
  outlet: { select: { id: true, name: true } },
  items: {
    include: {
      variant: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
    },
  },
  convertedOrder: {
    select: { id: true, orderNumber: true, status: true },
  },
} satisfies Prisma.QuotationInclude;

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all quotations with pagination and filters
   */
  async findAll(
    query: QueryQuotationsValues,
  ): Promise<
    ApiResponse<Prisma.QuotationGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'quotationDate',
      sortOrder = 'desc',
      search,
      customerId,
      outletId,
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
        { quotationNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { code: { contains: search } } },
      ];
    }

    if (customerId) where.customerId = customerId;
    if (outletId) where.outletId = outletId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.quotationDate = {};
      if (startDate) where.quotationDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.quotationDate.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'quotationDate']: sortOrder || 'desc',
    };

    const [totalItems, quotations] = await Promise.all([
      this.prisma.quotation.count({ where }),
      this.prisma.quotation.findMany({
        where,
        include: {
          customer: { select: { id: true, code: true, name: true } },
          outlet: { select: { id: true, name: true } },
          _count: { select: { items: true } },
          convertedOrder: { select: { id: true, orderNumber: true } },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);
    const summary = await this.buildSummary();

    return paginatedResponse(
      quotations,
      { page: pageNum, pageSize: sizeNum, totalItems, totalPages },
      summary,
    );
  }

  private async buildSummary() {
    const [
      totalQuotations,
      draftCount,
      sentCount,
      acceptedCount,
      rejectedCount,
      expiredCount,
    ] = await Promise.all([
      this.prisma.quotation.count(),
      this.prisma.quotation.count({ where: { status: 'draft' } }),
      this.prisma.quotation.count({ where: { status: 'sent' } }),
      this.prisma.quotation.count({ where: { status: 'accepted' } }),
      this.prisma.quotation.count({ where: { status: 'rejected' } }),
      this.prisma.quotation.count({ where: { status: 'expired' } }),
    ]);

    return {
      totalQuotations,
      draftCount,
      sentCount,
      acceptedCount,
      rejectedCount,
      expiredCount,
    };
  }

  /**
   * Get a single quotation by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: QUOTATION_INCLUDE,
    });

    if (!quotation) {
      throw new NotFoundException('Quotation tidak ditemukan');
    }

    return successResponse(quotation);
  }

  /**
   * Generate next quotation number: QUO-YYYYMMDD-XXX
   */
  async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.quotation.count({
      where: { quotationNumber: { startsWith: `QUO-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `QUO-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.quotation.findUnique({
        where: { quotationNumber: candidate },
      })
    ) {
      next++;
      candidate = `QUO-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Calculate totals from items and discount/tax inputs
   */
  private calculateTotals(
    items: { quantity: number; unitPrice: number; discountPercent?: number; discountAmount?: number }[],
    discountPercent = 0,
    discountAmountInput = 0,
    taxPercent = 0,
  ) {
    const itemSubtotals = items.map((item) => {
      const base = Number(item.quantity) * Number(item.unitPrice);
      const discAmt =
        item.discountPercent && item.discountPercent > 0
          ? (base * Number(item.discountPercent)) / 100
          : Number(item.discountAmount || 0);
      return { base, discAmt, subtotal: base - discAmt };
    });

    const subtotal = itemSubtotals.reduce((sum, i) => sum + i.subtotal, 0);
    const discountAmount =
      discountPercent > 0
        ? (subtotal * Number(discountPercent)) / 100
        : Number(discountAmountInput);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount =
      taxPercent > 0 ? (taxableAmount * Number(taxPercent)) / 100 : 0;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total, itemSubtotals };
  }

  /**
   * Create a new quotation
   */
  async create(
    dto: CreateQuotationValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    // Validate outlet
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: dto.outletId },
    });
    if (!outlet) throw new NotFoundException('Outlet tidak ditemukan');

    // Validate customer if provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) throw new NotFoundException('Customer tidak ditemukan');
    }

    // Validate all variant IDs
    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant) {
        throw new NotFoundException(
          `Produk/varian '${item.variantId}' tidak ditemukan`,
        );
      }
    }

    // Auto-generate quotation number
    let quotationNumber = dto.quotationNumber;
    if (!quotationNumber) {
      quotationNumber = await this.generateQuotationNumber();
    } else {
      const existing = await this.prisma.quotation.findUnique({
        where: { quotationNumber },
      });
      if (existing)
        throw new ConflictException(
          `Nomor quotation '${quotationNumber}' sudah digunakan`,
        );
    }

    const { subtotal, discountAmount, taxAmount, total, itemSubtotals } =
      this.calculateTotals(
        dto.items,
        dto.discountPercent,
        dto.discountAmount,
        dto.taxPercent,
      );

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: dto.customerId ?? null,
        userId,
        outletId: dto.outletId,
        quotationDate: dto.quotationDate
          ? new Date(dto.quotationDate)
          : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        status: 'draft',
        subtotal,
        discountPercent: dto.discountPercent || 0,
        discountAmount,
        taxPercent: dto.taxPercent || 0,
        taxAmount,
        total,
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        items: {
          create: dto.items.map((item, idx) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent || 0,
            discountAmount: itemSubtotals[idx].discAmt,
            subtotal: itemSubtotals[idx].subtotal,
            notes: item.notes ?? null,
          })),
        },
      },
      include: QUOTATION_INCLUDE,
    });

    return successResponse(quotation);
  }

  /**
   * Update a quotation (only when draft)
   */
  async update(
    id: string,
    dto: UpdateQuotationValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    const existing = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Quotation tidak ditemukan');
    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Quotation dengan status draft yang dapat diedit',
      );
    }

    let updateData: any = {};

    if (dto.customerId !== undefined) updateData.customerId = dto.customerId;
    if (dto.quotationDate) updateData.quotationDate = new Date(dto.quotationDate);
    if (dto.validUntil !== undefined)
      updateData.validUntil = dto.validUntil ? new Date(dto.validUntil) : null;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.terms !== undefined) updateData.terms = dto.terms;

    if (dto.items) {
      const { subtotal, discountAmount, taxAmount, total, itemSubtotals } =
        this.calculateTotals(
          dto.items,
          dto.discountPercent,
          dto.discountAmount,
          dto.taxPercent,
        );

      updateData = {
        ...updateData,
        subtotal,
        discountPercent: dto.discountPercent ?? existing.discountPercent,
        discountAmount,
        taxPercent: dto.taxPercent ?? existing.taxPercent,
        taxAmount,
        total,
      };

      await this.prisma.quotationItem.deleteMany({ where: { quotationId: id } });

      updateData.items = {
        create: dto.items.map((item, idx) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: itemSubtotals[idx].discAmt,
          subtotal: itemSubtotals[idx].subtotal,
          notes: item.notes ?? null,
        })),
      };
    }

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: updateData,
      include: QUOTATION_INCLUDE,
    });

    return successResponse(quotation);
  }

  /**
   * Update quotation status
   */
  async updateStatus(
    id: string,
    dto: UpdateQuotationStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.QuotationGetPayload<object>>> {
    const existing = await this.prisma.quotation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Quotation tidak ditemukan');

    const validTransitions: Record<string, string[]> = {
      draft: ['sent'],
      sent: ['accepted', 'rejected', 'expired'],
      accepted: [],
      rejected: [],
      expired: [],
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.notes && { notes: dto.notes }),
      },
      include: QUOTATION_INCLUDE,
    });

    return successResponse(quotation);
  }

  /**
   * Convert accepted quotation to Sales Order
   */
  async convertToSalesOrder(
    id: string,
    dto: ConvertQuotationValues,
    userId: string,
  ) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: {
          include: { variant: true },
        },
      },
    });

    if (!quotation) throw new NotFoundException('Quotation tidak ditemukan');

    if (quotation.status !== 'accepted') {
      throw new BadRequestException(
        'Hanya Quotation dengan status accepted yang dapat dikonversi ke Sales Order',
      );
    }

    if (quotation.convertedOrderId) {
      throw new ConflictException(
        'Quotation ini sudah dikonversi ke Sales Order',
      );
    }

    // Generate SO number
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await this.prisma.salesOrder.count({
      where: { orderNumber: { startsWith: `SO-${datePrefix}` } },
    });
    let soNext = countToday + 1;
    let orderNumber = `SO-${datePrefix}-${soNext.toString().padStart(3, '0')}`;
    while (
      await this.prisma.salesOrder.findUnique({ where: { orderNumber } })
    ) {
      soNext++;
      orderNumber = `SO-${datePrefix}-${soNext.toString().padStart(3, '0')}`;
    }

    const salesOrder = await this.prisma.$transaction(async (tx) => {
      // Create Sales Order from quotation data
      const so = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: quotation.customerId,
          userId,
          outletId: dto.outletId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          status: 'confirmed',
          paymentStatus: 'unpaid',
          subtotal: quotation.subtotal,
          discountPercent: quotation.discountPercent,
          discountAmount: quotation.discountAmount,
          taxPercent: quotation.taxPercent,
          taxAmount: quotation.taxAmount,
          total: quotation.total,
          paidAmount: 0,
          notes: dto.notes ?? quotation.notes,
          items: {
            create: quotation.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent,
              discountAmount: item.discountAmount,
              subtotal: item.subtotal,
              notes: item.notes,
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              variant: { include: { product: { select: { name: true } } } },
            },
          },
        },
      });

      // Link quotation to the created SO
      await tx.quotation.update({
        where: { id },
        data: { convertedOrderId: so.id },
      });

      return so;
    });

    return successResponse(salesOrder);
  }

  /**
   * Delete a quotation (draft only)
   */
  async delete(id: string, userId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) throw new NotFoundException('Quotation tidak ditemukan');
    if (quotation.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Quotation dengan status draft yang dapat dihapus',
      );
    }

    await this.prisma.quotation.delete({ where: { id } });

    return successResponse({
      message: `Quotation '${quotation.quotationNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete quotations (draft only)
   */
  async bulkDelete(ids: string[], userId: string) {
    const quotations = await this.prisma.quotation.findMany({
      where: { id: { in: ids } },
    });

    if (quotations.length !== ids.length) {
      throw new NotFoundException('Beberapa Quotation tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const q of quotations) {
      if (q.status !== 'draft') {
        skippedCount++;
        continue;
      }
      await this.prisma.quotation.delete({ where: { id: q.id } });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) messages.push(`${deletedCount} Quotation dihapus`);
    if (skippedCount > 0)
      messages.push(`${skippedCount} Quotation dilewati (bukan status draft)`);

    return successResponse({ message: messages.join(', '), deletedCount, skippedCount });
  }
}
