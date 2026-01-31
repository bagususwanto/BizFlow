import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  CreateReturnValues,
  ProcessReturnRefundValues,
  ApproveReturnValues,
  RejectReturnValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new return transaction
   * Validates order and items, creates return record
   */
  async createReturn(dto: CreateReturnValues, userId: string): Promise<any> {
    // Validate order exists
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.orderId },
      include: {
        items: {
          include: {
            variant: {
              select: {
                id: true,
                name: true,
                product: {
                  select: {
                    name: true,
                    isService: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    // Validate all order items exist and quantities are valid
    for (const returnItem of dto.items) {
      const orderItem = order.items.find(
        (item) => item.id === returnItem.orderItemId,
      );

      if (!orderItem) {
        throw new BadRequestException(
          `Order item ${returnItem.orderItemId} tidak ditemukan`,
        );
      }

      if (returnItem.quantity > Number(orderItem.quantity)) {
        throw new BadRequestException(
          `Jumlah return (${returnItem.quantity}) melebihi jumlah order (${Number(orderItem.quantity)})`,
        );
      }
    }

    // Calculate refund amount
    const refundAmount = dto.items.reduce((sum, returnItem) => {
      const orderItem = order.items.find(
        (item) => item.id === returnItem.orderItemId,
      );
      if (!orderItem) return sum;

      // Calculate proportional refund based on quantity
      const itemTotal = Number(orderItem.subtotal);
      const itemQuantity = Number(orderItem.quantity);
      const refundForItem = (itemTotal / itemQuantity) * returnItem.quantity;

      return sum + refundForItem;
    }, 0);

    // Generate return number
    const returnNumber = await this.generateReturnNumber();

    // Create return transaction
    const salesReturn = await this.prisma.salesReturn.create({
      data: {
        returnNumber,
        orderId: dto.orderId,
        status: 'pending',
        reason: dto.reason,
        refundMethod: dto.refundMethod || null,
        refundAmount,
        notes: dto.notes || null,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            reason: item.reason || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: {
                        name: true,
                        unit: {
                          select: { symbol: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        order: {
          select: {
            orderNumber: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse({
      id: salesReturn.id,
      returnNumber: salesReturn.returnNumber,
      orderId: salesReturn.orderId,
      orderNumber: salesReturn.order.orderNumber,
      customer: salesReturn.order.customer,
      status: salesReturn.status,
      reason: salesReturn.reason,
      refundMethod: salesReturn.refundMethod,
      refundAmount: Number(salesReturn.refundAmount),
      items: salesReturn.items.map((item) => ({
        id: item.id,
        orderItemId: item.orderItemId,
        productName: item.orderItem.variant.product.name,
        variantName: item.orderItem.variant.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.orderItem.unitPrice),
        unit: item.orderItem.variant.product.unit?.symbol,
        reason: item.reason,
      })),
      notes: salesReturn.notes,
      createdAt: salesReturn.createdAt,
    });
  }

  /**
   * Get all returns with pagination and filters
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    orderId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
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
    } = query || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { returnNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
      ];
    }

    if (orderId) {
      where.orderId = orderId;
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
        where.createdAt.lte = new Date(endDate);
      }
    }

    const totalItems = await this.prisma.salesReturn.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    const returns = await this.prisma.salesReturn.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const mappedReturns = returns.map((ret) => ({
      id: ret.id,
      returnNumber: ret.returnNumber,
      orderId: ret.orderId,
      orderNumber: ret.order.orderNumber,
      customer: ret.order.customer,
      status: ret.status,
      reason: ret.reason,
      refundMethod: ret.refundMethod,
      refundAmount: Number(ret.refundAmount),
      itemCount: ret._count.items,
      approvedBy: ret.approvedBy,
      approvedAt: ret.approvedAt,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt,
    }));

    return paginatedResponse(mappedReturns, {
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get return by ID with full details
   */
  async findById(id: string): Promise<any> {
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
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
                    product: {
                      select: {
                        name: true,
                        unit: {
                          select: { symbol: true },
                        },
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

    if (!salesReturn) {
      throw new NotFoundException('Return tidak ditemukan');
    }

    return successResponse({
      id: salesReturn.id,
      returnNumber: salesReturn.returnNumber,
      order: salesReturn.order,
      status: salesReturn.status,
      reason: salesReturn.reason,
      refundMethod: salesReturn.refundMethod,
      refundAmount: Number(salesReturn.refundAmount),
      items: salesReturn.items.map((item) => ({
        id: item.id,
        orderItemId: item.orderItemId,
        productName: item.orderItem.variant.product.name,
        variantName: item.orderItem.variant.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.orderItem.unitPrice),
        subtotal: Number(item.orderItem.subtotal),
        unit: item.orderItem.variant.product.unit?.symbol,
        reason: item.reason,
      })),
      notes: salesReturn.notes,
      approvedBy: salesReturn.approvedBy,
      approvedAt: salesReturn.approvedAt,
      createdAt: salesReturn.createdAt,
      updatedAt: salesReturn.updatedAt,
    });
  }

  /**
   * Process refund for approved return
   * Creates negative payment and updates return status
   */
  async processRefund(
    returnId: string,
    dto: ProcessReturnRefundValues,
    userId: string,
  ): Promise<any> {
    // Validate return exists and is approved
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id: returnId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
          },
        },
      },
    });

    if (!salesReturn) {
      throw new NotFoundException('Return tidak ditemukan');
    }

    if (salesReturn.status !== 'approved') {
      throw new BadRequestException(
        'Return harus diapprove terlebih dahulu sebelum refund',
      );
    }

    // Validate account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException('Akun refund tidak ditemukan');
    }

    // Generate payment number for refund
    const paymentNumber = await this.generatePaymentNumber();

    // Create refund payment and update return status
    const result = await this.prisma.$transaction(async (tx) => {
      // Create negative payment for refund
      const refundPayment = await tx.payment.create({
        data: {
          paymentNumber,
          orderId: salesReturn.orderId,
          customerId: salesReturn.order.customerId,
          accountId: dto.accountId,
          paymentDate: new Date(),
          paymentMethod: dto.refundMethod,
          amount: -Number(salesReturn.refundAmount), // Negative for refund
          reference: `RETURN-${salesReturn.returnNumber}`,
          notes: `Refund untuk return ${salesReturn.returnNumber}. ${dto.notes || ''}`,
        },
      });

      // Update return status to completed
      const updatedReturn = await tx.salesReturn.update({
        where: { id: returnId },
        data: {
          status: 'completed',
        },
      });

      // TODO: Create stock movements to return items to warehouse
      // This will be implemented when integrating with inventory module

      return { refundPayment, updatedReturn };
    });

    return successResponse({
      returnId: salesReturn.id,
      returnNumber: salesReturn.returnNumber,
      paymentId: result.refundPayment.id,
      paymentNumber: result.refundPayment.paymentNumber,
      refundAmount: Math.abs(Number(result.refundPayment.amount)),
      refundMethod: result.refundPayment.paymentMethod,
      status: result.updatedReturn.status,
      processedAt: new Date(),
    });
  }

  /**
   * Approve return
   * Updates status and records approver
   */
  async approveReturn(
    returnId: string,
    dto: ApproveReturnValues,
    userId: string,
  ): Promise<any> {
    // Validate return exists
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id: returnId },
    });

    if (!salesReturn) {
      throw new NotFoundException('Return tidak ditemukan');
    }

    if (salesReturn.status !== 'pending') {
      throw new ConflictException('Return sudah diproses sebelumnya');
    }

    // Update return status
    const updatedReturn = await this.prisma.salesReturn.update({
      where: { id: returnId },
      data: {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
        notes: dto.notes
          ? `${salesReturn.notes || ''}\nApproval: ${dto.notes}`.trim()
          : salesReturn.notes,
      },
    });

    return successResponse({
      id: updatedReturn.id,
      returnNumber: updatedReturn.returnNumber,
      status: updatedReturn.status,
      approvedBy: updatedReturn.approvedBy,
      approvedAt: updatedReturn.approvedAt,
      message: 'Return berhasil diapprove',
    });
  }

  /**
   * Reject return
   * Updates status and records rejection reason
   */
  async rejectReturn(
    returnId: string,
    dto: RejectReturnValues,
    userId: string,
  ): Promise<any> {
    // Validate return exists
    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id: returnId },
    });

    if (!salesReturn) {
      throw new NotFoundException('Return tidak ditemukan');
    }

    if (salesReturn.status !== 'pending') {
      throw new ConflictException('Return sudah diproses sebelumnya');
    }

    // Update return status
    const updatedReturn = await this.prisma.salesReturn.update({
      where: { id: returnId },
      data: {
        status: 'rejected',
        approvedBy: userId,
        approvedAt: new Date(),
        notes:
          `${salesReturn.notes || ''}\nRejection: ${dto.reason}. ${dto.notes || ''}`.trim(),
      },
    });

    return successResponse({
      id: updatedReturn.id,
      returnNumber: updatedReturn.returnNumber,
      status: updatedReturn.status,
      rejectedBy: updatedReturn.approvedBy,
      rejectedAt: updatedReturn.approvedAt,
      reason: dto.reason,
      message: 'Return ditolak',
    });
  }

  /**
   * Generate unique return number with format: RET-YYYYMMDD-XXX
   */
  private async generateReturnNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const prefix = `RET-${dateStr}`;

    // Get count of returns today
    const count = await this.prisma.salesReturn.count({
      where: {
        returnNumber: {
          startsWith: prefix,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Generate unique payment number with format: PAY-YYYYMMDD-XXX
   */
  private async generatePaymentNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const prefix = `PAY-${dateStr}`;

    // Get count of payments today
    const count = await this.prisma.payment.count({
      where: {
        paymentNumber: {
          startsWith: prefix,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
  }
}
