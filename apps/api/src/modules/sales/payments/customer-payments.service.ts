import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateCustomerPaymentValues,
  UpdateCustomerPaymentValues,
  QueryCustomerPaymentsValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class CustomerPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all customer payments with pagination and filters
   */
  async findAll(
    query: QueryCustomerPaymentsValues,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>[]> & { summary?: any }> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
      search,
      customerId,
      invoiceId,
      orderId,
      accountId,
      paymentMethod,
      startDate,
      endDate,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { reference: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { code: { contains: search } } },
        { invoice: { invoiceNumber: { contains: search } } },
      ];
    }

    if (customerId) where.customerId = customerId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (orderId) where.orderId = orderId;
    if (accountId) where.accountId = accountId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.paymentDate.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'paymentDate']: sortOrder || 'desc',
    };

    const [totalItems, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              paidAmount: true,
              paymentStatus: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
          account: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
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
      payments,
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
    const [totalPayments, totalAmountResult] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      totalAmount: totalAmountResult._sum.amount ?? 0,
    };
  }

  /**
   * Get a single customer payment by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          include: {
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
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        account: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pembayaran pelanggan tidak ditemukan');
    }

    return successResponse(payment);
  }

  /**
   * Generate next payment number: CP-YYYYMMDD-XXX
   */
  async generatePaymentNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.payment.count({
      where: { paymentNumber: { startsWith: `CP-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `CP-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.payment.findUnique({
        where: { paymentNumber: candidate },
      })
    ) {
      next++;
      candidate = `CP-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new customer payment
   */
  async create(
    dto: CreateCustomerPaymentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    // Verify account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) {
      throw new NotFoundException('Akun pembayaran tidak ditemukan');
    }

    // Verify customer if provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Pelanggan tidak ditemukan');
      }
    }

    // Verify & validate invoice if provided
    let invoice = null;
    if (dto.invoiceId) {
      invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice tidak ditemukan');
      }
      if (invoice.status === 'cancelled') {
        throw new BadRequestException(
          'Tidak dapat membayar invoice yang telah dibatalkan',
        );
      }

      const remainingBalance =
        Number(invoice.total) - Number(invoice.paidAmount);
      if (dto.amount > remainingBalance + 0.01) {
        throw new BadRequestException(
          `Jumlah pembayaran (${dto.amount}) melebihi sisa tagihan (${remainingBalance.toFixed(2)})`,
        );
      }
    }

    // Verify sales order if provided
    let salesOrder = null;
    if (dto.orderId) {
      salesOrder = await this.prisma.salesOrder.findUnique({
        where: { id: dto.orderId },
      });
      if (!salesOrder) {
        throw new NotFoundException('Sales Order tidak ditemukan');
      }
    }

    // Generate payment number if not provided
    let paymentNumber = dto.paymentNumber;
    if (!paymentNumber) {
      paymentNumber = await this.generatePaymentNumber();
    } else {
      const existing = await this.prisma.payment.findUnique({
        where: { paymentNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor pembayaran '${paymentNumber}' sudah digunakan`,
        );
      }
    }

    // Run in a transaction
    const payment = await this.prisma.$transaction(async (tx) => {
      // Create the payment record
      const newPayment = await tx.payment.create({
        data: {
          paymentNumber,
          customerId: dto.customerId ?? null,
          invoiceId: dto.invoiceId ?? null,
          orderId: dto.orderId ?? null,
          accountId: dto.accountId,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          reference: dto.reference ?? null,
          notes: dto.notes ?? null,
        } as Prisma.PaymentUncheckedCreateInput,
        include: {
          customer: true,
          invoice: true,
          order: { select: { id: true, orderNumber: true } },
          account: true,
        },
      });

      // Increment account balance (income)
      await tx.account.update({
        where: { id: dto.accountId },
        data: {
          balance: { increment: dto.amount },
        },
      });

      // Update invoice paidAmount and paymentStatus if linked
      if (dto.invoiceId && invoice) {
        const newPaidAmount =
          Number(invoice.paidAmount) + Number(dto.amount);
        const newPaymentStatus =
          newPaidAmount >= Number(invoice.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
            // Mark invoice as paid if fully settled
            ...(newPaymentStatus === 'paid' && { status: 'paid' }),
          },
        });
      }

      // Update sales order paidAmount and paymentStatus if linked
      if (dto.orderId && salesOrder) {
        const newPaidAmount =
          Number(salesOrder.paidAmount) + Number(dto.amount);
        const newPaymentStatus =
          newPaidAmount >= Number(salesOrder.total)
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
      }

      // Record finance transaction
      await tx.transaction.create({
        data: {
          transactionNumber: `TXN-${paymentNumber}`,
          accountId: dto.accountId,
          type: 'income',
          amount: dto.amount,
          transactionDate: new Date(dto.paymentDate),
          description: `Pembayaran customer${dto.customerId ? ` - ${newPayment.customer?.name ?? ''}` : ''}${dto.invoiceId ? ` (INV: ${newPayment.invoice?.invoiceNumber ?? ''})` : ''}`,
          referenceType: 'customer_payment',
          referenceId: newPayment.id,
          createdBy: userId,
        },
      });

      return newPayment;
    });

    return successResponse(payment);
  }

  /**
   * Update a customer payment
   */
  async update(
    id: string,
    dto: UpdateCustomerPaymentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PaymentGetPayload<object>>> {
    const existing = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        order: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Pembayaran pelanggan tidak ditemukan');
    }

    // Verify account if changed
    if (dto.accountId && dto.accountId !== existing.accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: dto.accountId },
      });
      if (!account) {
        throw new NotFoundException('Akun pembayaran tidak ditemukan');
      }
    }

    const newAmount = dto.amount !== undefined ? dto.amount : Number(existing.amount);
    const amountDiff = newAmount - Number(existing.amount);

    const payment = await this.prisma.$transaction(async (tx) => {
      // Adjust account balance if amount changed
      if (amountDiff !== 0) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: { increment: amountDiff },
          },
        });
      }

      // Adjust invoice paidAmount if linked
      if (existing.invoiceId && existing.invoice && amountDiff !== 0) {
        const invoice = existing.invoice;
        const newPaidAmount = Number(invoice.paidAmount) + amountDiff;
        const newPaymentStatus =
          newPaidAmount >= Number(invoice.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.invoice.update({
          where: { id: existing.invoiceId },
          data: {
            paidAmount: Math.max(0, newPaidAmount),
            paymentStatus: newPaymentStatus,
            ...(newPaymentStatus === 'paid' && { status: 'paid' }),
            ...(newPaymentStatus !== 'paid' &&
              invoice.status === 'paid' && { status: 'sent' }),
          },
        });
      }

      // Adjust sales order paidAmount if linked
      if (existing.orderId && existing.order && amountDiff !== 0) {
        const order = existing.order;
        const newPaidAmount = Number(order.paidAmount) + amountDiff;
        const newPaymentStatus =
          newPaidAmount >= Number(order.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.salesOrder.update({
          where: { id: existing.orderId },
          data: {
            paidAmount: Math.max(0, newPaidAmount),
            paymentStatus: newPaymentStatus,
          },
        });
      }

      return tx.payment.update({
        where: { id },
        data: {
          ...(dto.invoiceId !== undefined && { invoiceId: dto.invoiceId }),
          ...(dto.orderId !== undefined && { orderId: dto.orderId }),
          ...(dto.accountId && { accountId: dto.accountId }),
          ...(dto.paymentDate && { paymentDate: new Date(dto.paymentDate) }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
          ...(dto.reference !== undefined && { reference: dto.reference }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: {
          customer: true,
          invoice: true,
          order: { select: { id: true, orderNumber: true } },
          account: true,
        },
      });
    });

    return successResponse(payment);
  }

  /**
   * Delete a customer payment
   */
  async delete(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pembayaran pelanggan tidak ditemukan');
    }

    await this.prisma.$transaction(async (tx) => {
      // Restore account balance
      await tx.account.update({
        where: { id: payment.accountId },
        data: {
          balance: { decrement: payment.amount },
        },
      });

      // Restore invoice paidAmount if linked
      if (payment.invoiceId && payment.invoice) {
        const invoice = payment.invoice;
        const newPaidAmount = Math.max(
          0,
          Number(invoice.paidAmount) - Number(payment.amount),
        );
        const newPaymentStatus =
          newPaidAmount >= Number(invoice.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
            ...(invoice.status === 'paid' && { status: 'sent' }),
          },
        });
      }

      // Restore sales order paidAmount if linked
      if (payment.orderId && payment.order) {
        const order = payment.order;
        const newPaidAmount = Math.max(
          0,
          Number(order.paidAmount) - Number(payment.amount),
        );
        const newPaymentStatus =
          newPaidAmount >= Number(order.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.salesOrder.update({
          where: { id: payment.orderId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          },
        });
      }

      // Delete related transaction record
      await tx.transaction.deleteMany({
        where: {
          referenceType: 'customer_payment',
          referenceId: id,
        },
      });

      await tx.payment.delete({ where: { id } });
    });

    return successResponse({
      message: `Pembayaran '${payment.paymentNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete customer payments
   */
  async bulkDelete(ids: string[], userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { id: { in: ids } },
      include: { invoice: true, order: true },
    });

    if (payments.length !== ids.length) {
      throw new NotFoundException('Beberapa pembayaran tidak ditemukan');
    }

    let deletedCount = 0;

    for (const payment of payments) {
      await this.prisma.$transaction(async (tx) => {
        // Restore account balance
        await tx.account.update({
          where: { id: payment.accountId },
          data: {
            balance: { decrement: payment.amount },
          },
        });

        // Restore invoice paidAmount
        if (payment.invoiceId && payment.invoice) {
          const invoice = payment.invoice;
          const newPaidAmount = Math.max(
            0,
            Number(invoice.paidAmount) - Number(payment.amount),
          );
          const newPaymentStatus =
            newPaidAmount >= Number(invoice.total)
              ? 'paid'
              : newPaidAmount > 0
                ? 'partial'
                : 'unpaid';

          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              paidAmount: newPaidAmount,
              paymentStatus: newPaymentStatus,
              ...(invoice.status === 'paid' && { status: 'sent' }),
            },
          });
        }

        // Restore sales order paidAmount
        if (payment.orderId && payment.order) {
          const order = payment.order;
          const newPaidAmount = Math.max(
            0,
            Number(order.paidAmount) - Number(payment.amount),
          );
          const newPaymentStatus =
            newPaidAmount >= Number(order.total)
              ? 'paid'
              : newPaidAmount > 0
                ? 'partial'
                : 'unpaid';

          await tx.salesOrder.update({
            where: { id: payment.orderId },
            data: {
              paidAmount: newPaidAmount,
              paymentStatus: newPaymentStatus,
            },
          });
        }

        // Delete related transaction record
        await tx.transaction.deleteMany({
          where: {
            referenceType: 'customer_payment',
            referenceId: payment.id,
          },
        });

        await tx.payment.delete({ where: { id: payment.id } });
        deletedCount++;
      });
    }

    return successResponse({
      message: `${deletedCount} pembayaran berhasil dihapus`,
      deletedCount,
    });
  }
}
