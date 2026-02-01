import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type {
  CreatePaymentValues,
  ProcessRefundValues,
  SplitPaymentValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a standalone payment for an existing order
   * Used for partial payments or additional payments
   */
  async createPayment(dto: CreatePaymentValues, userId: string) {
    // Validate order exists
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.orderId },
      select: {
        id: true,
        total: true,
        paidAmount: true,
        paymentStatus: true,
        customerId: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    // Validate account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException('Akun pembayaran tidak ditemukan');
    }

    // Calculate remaining amount
    const remainingAmount = Number(order.total) - Number(order.paidAmount);

    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `Jumlah pembayaran (${dto.amount}) melebihi sisa tagihan (${remainingAmount})`,
      );
    }

    // Generate payment number
    const paymentNumber = await this.generatePaymentNumber();

    // Create payment and update order
    const payment = await this.prisma.$transaction(async (tx) => {
      // Create payment
      const newPayment = await tx.payment.create({
        data: {
          paymentNumber,
          orderId: dto.orderId,
          customerId: order.customerId,
          accountId: dto.accountId,
          paymentDate: new Date(),
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          reference: dto.reference || null,
          notes: dto.notes || null,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              orderNumber: true,
              total: true,
            },
          },
        },
      });

      // Update order paid amount and payment status
      const newPaidAmount = Number(order.paidAmount) + dto.amount;
      const newPaymentStatus =
        newPaidAmount >= Number(order.total)
          ? 'paid'
          : newPaidAmount > 0
            ? 'partial'
            : 'unpaid';

      await tx.salesOrder.update({
        where: { id: dto.orderId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      return newPayment;
    });

    return successResponse({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      account: payment.account,
      paymentMethod: payment.paymentMethod,
      amount: Number(payment.amount),
      reference: payment.reference,
      notes: payment.notes,
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt,
    });
  }

  /**
   * Get all payments with pagination and filters
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    orderId?: string;
    customerId?: string;
    paymentMethod?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
      search,
      orderId,
      customerId,
      paymentMethod,
      accountId,
      startDate,
      endDate,
    } = query || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    const totalItems = await this.prisma.payment.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const mappedPayments = payments.map((payment) => ({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      paymentDate: payment.paymentDate,
      order: payment.order,
      customer: payment.customer,
      account: payment.account,
      paymentMethod: payment.paymentMethod,
      amount: Number(payment.amount),
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt,
    }));

    return paginatedResponse(mappedPayments, {
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get payment by ID with full details
   */
  async findById(id: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            total: true,
            paidAmount: true,
            paymentStatus: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    return successResponse({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      paymentDate: payment.paymentDate,
      order: payment.order,
      customer: payment.customer,
      account: payment.account,
      paymentMethod: payment.paymentMethod,
      amount: Number(payment.amount),
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt,
    });
  }

  /**
   * Process refund for a payment
   * Creates a negative payment record
   */
  async processRefund(
    paymentId: string,
    dto: ProcessRefundValues,
    userId: string,
  ) {
    // Validate payment exists
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            paidAmount: true,
            customerId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    // Validate refund amount
    if (dto.amount > Number(payment.amount)) {
      throw new BadRequestException(
        `Jumlah refund (${dto.amount}) melebihi jumlah pembayaran (${Number(payment.amount)})`,
      );
    }

    // Validate account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException('Akun refund tidak ditemukan');
    }

    // Generate refund payment number
    const refundNumber = await this.generatePaymentNumber();

    // Create refund payment and update order
    const refund = await this.prisma.$transaction(async (tx) => {
      // Create negative payment for refund
      const refundPayment = await tx.payment.create({
        data: {
          paymentNumber: refundNumber,
          orderId: payment.orderId,
          customerId: payment.order?.customerId,
          accountId: dto.accountId,
          paymentDate: new Date(),
          paymentMethod: dto.refundMethod,
          amount: -dto.amount, // Negative amount for refund
          reference: `REFUND-${payment.paymentNumber}`,
          notes: `Refund: ${dto.reason}. ${dto.notes || ''}`,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update order paid amount and payment status
      if (payment.order) {
        const newPaidAmount = Number(payment.order.paidAmount) - dto.amount;
        const newPaymentStatus =
          newPaidAmount >= Number(payment.order.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.salesOrder.update({
          where: { id: payment.orderId! },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          },
        });
      }

      return refundPayment;
    });

    return successResponse({
      id: refund.id,
      paymentNumber: refund.paymentNumber,
      originalPaymentId: paymentId,
      originalPaymentNumber: payment.paymentNumber,
      account: refund.account,
      refundMethod: refund.paymentMethod,
      amount: Math.abs(Number(refund.amount)),
      reason: dto.reason,
      notes: dto.notes,
      paymentDate: refund.paymentDate,
      createdAt: refund.createdAt,
    });
  }

  /**
   * Validate split payment amounts
   * Ensures total payment matches order total
   */
  async validateSplitPayment(dto: SplitPaymentValues): Promise<any> {
    const totalPayment = dto.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    if (totalPayment < dto.totalAmount) {
      throw new BadRequestException(
        `Total pembayaran (${totalPayment}) kurang dari total order (${dto.totalAmount})`,
      );
    }

    // Validate all accounts exist
    const accountIds = dto.payments.map((p) => p.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds } },
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('Beberapa akun pembayaran tidak ditemukan');
    }

    return successResponse({
      valid: true,
      totalPayment,
      totalAmount: dto.totalAmount,
      change: totalPayment - dto.totalAmount,
      payments: dto.payments.map((payment, index) => ({
        ...payment,
        account: accounts.find((a) => a.id === payment.accountId),
      })),
    });
  }

  /**
   * Get payment summary/report
   * Aggregates payment data by method, date range, etc.
   */
  async getPaymentSummary(query?: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    paymentMethod?: string;
  }) {
    const { startDate, endDate, accountId, paymentMethod } = query || {};

    const where: any = {};

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Get payment summary
    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        amount: true,
        paymentMethod: true,
        paymentDate: true,
      },
    });

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCount = payments.length;

    // Group by payment method
    const byMethod = payments.reduce(
      (acc, payment) => {
        const method = payment.paymentMethod;
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += Number(payment.amount);
        return acc;
      },
      {} as Record<string, { count: number; total: number }>,
    );

    return successResponse({
      totalAmount,
      totalCount,
      byMethod,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  }

  /**
   * Get all active accounts for payment methods
   */
  async getAccounts() {
    const accounts = await this.prisma.account.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
      },
    });

    return successResponse(accounts);
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
