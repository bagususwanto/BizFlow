import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateSupplierPaymentValues,
  UpdateSupplierPaymentValues,
  QuerySupplierPaymentsValues,
} from '@bizflow/types';
import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class SupplierPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all supplier payments with pagination and filters
   */
  async findAll(query: QuerySupplierPaymentsValues): Promise<
    ApiResponse<Prisma.SupplierPaymentGetPayload<object>[]> & {
      summary?: any;
    }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
      search,
      supplierId,
      purchaseOrderId,
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
        { supplier: { name: { contains: search } } },
        { supplier: { code: { contains: search } } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'paymentDate']: sortOrder || 'desc',
    };

    const [totalItems, payments] = await Promise.all([
      this.prisma.supplierPayment.count({ where }),
      this.prisma.supplierPayment.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              paidAmount: true,
              paymentStatus: true,
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
      this.prisma.supplierPayment.count(),
      this.prisma.supplierPayment.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      totalAmount: totalAmountResult._sum.amount ?? 0,
    };
  }

  /**
   * Get a single supplier payment by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    const payment = await this.prisma.supplierPayment.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseOrder: {
          include: {
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
        account: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pembayaran supplier tidak ditemukan');
    }

    return successResponse(payment);
  }

  /**
   * Generate next payment number
   */
  async generatePaymentNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.supplierPayment.count({
      where: { paymentNumber: { startsWith: `SP-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `SP-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.supplierPayment.findUnique({
        where: { paymentNumber: candidate },
      })
    ) {
      next++;
      candidate = `SP-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new supplier payment
   */
  async create(
    dto: CreateSupplierPaymentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    // Verify supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier tidak ditemukan');
    }

    // Verify account exists
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException('Akun pembayaran tidak ditemukan');
    }

    // Verify purchase order if provided
    let purchaseOrder = null;
    if (dto.purchaseOrderId) {
      purchaseOrder = await this.prisma.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
      });

      if (!purchaseOrder) {
        throw new NotFoundException('Purchase Order tidak ditemukan');
      }

      if (purchaseOrder.supplierId !== dto.supplierId) {
        throw new BadRequestException(
          'Purchase Order tidak sesuai dengan supplier yang dipilih',
        );
      }

      // Check if payment would exceed remaining balance
      const remainingBalance =
        Number(purchaseOrder.total) - Number(purchaseOrder.paidAmount);
      if (dto.amount > remainingBalance) {
        throw new BadRequestException(
          `Jumlah pembayaran (${dto.amount}) melebihi sisa tagihan (${remainingBalance})`,
        );
      }
    }

    // Generate payment number if not provided
    let paymentNumber = dto.paymentNumber;
    if (!paymentNumber) {
      paymentNumber = await this.generatePaymentNumber();
    } else {
      const existing = await this.prisma.supplierPayment.findUnique({
        where: { paymentNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor pembayaran '${paymentNumber}' sudah digunakan`,
        );
      }
    }

    // Create payment and update related records in a transaction
    const payment = await this.prisma.$transaction(async (tx) => {
      // Create the payment record
      const newPayment = await tx.supplierPayment.create({
        data: {
          paymentNumber,
          supplierId: dto.supplierId,
          purchaseOrderId: dto.purchaseOrderId ?? null,
          accountId: dto.accountId,
          paymentDate: new Date(dto.paymentDate),
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference ?? null,
          notes: dto.notes ?? null,
          createdBy: userId,
        } as Prisma.SupplierPaymentUncheckedCreateInput,
        include: {
          supplier: true,
          purchaseOrder: true,
          account: true,
        },
      });

      // Deduct from account balance
      await tx.account.update({
        where: { id: dto.accountId },
        data: {
          balance: {
            decrement: dto.amount,
          },
        },
      });

      // Update purchase order paid amount and payment status if linked
      if (dto.purchaseOrderId && purchaseOrder) {
        const newPaidAmount =
          Number(purchaseOrder.paidAmount) + Number(dto.amount);
        const newPaymentStatus =
          newPaidAmount >= Number(purchaseOrder.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.purchaseOrder.update({
          where: { id: dto.purchaseOrderId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          },
        });
      }

      // Record transaction for finance tracking
      await tx.transaction.create({
        data: {
          transactionNumber: `TXN-${paymentNumber}`,
          accountId: dto.accountId,
          type: 'expense',
          amount: dto.amount,
          transactionDate: new Date(dto.paymentDate),
          description: `Pembayaran supplier: ${supplier.name}${dto.purchaseOrderId ? ` (PO: ${purchaseOrder?.orderNumber})` : ''}`,
          referenceType: 'purchase_payment',
          referenceId: newPayment.id,
          createdBy: userId,
        },
      });

      return newPayment;
    });

    return successResponse(payment);
  }

  /**
   * Update a supplier payment
   */
  async update(
    id: string,
    dto: UpdateSupplierPaymentValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SupplierPaymentGetPayload<object>>> {
    const existing = await this.prisma.supplierPayment.findUnique({
      where: { id },
      include: {
        purchaseOrder: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Pembayaran supplier tidak ditemukan');
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

    const newAmount = dto.amount ?? Number(existing.amount);
    const amountDiff = newAmount - Number(existing.amount);

    const payment = await this.prisma.$transaction(async (tx) => {
      // Update account balance if amount changed
      if (amountDiff !== 0) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: {
              decrement: amountDiff,
            },
          },
        });
      }

      // Update purchase order paid amount if linked
      if (existing.purchaseOrderId && amountDiff !== 0) {
        const po = existing.purchaseOrder!;
        const newPaidAmount = Number(po.paidAmount) + amountDiff;
        const newPaymentStatus =
          newPaidAmount >= Number(po.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.purchaseOrder.update({
          where: { id: existing.purchaseOrderId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          },
        });
      }

      return tx.supplierPayment.update({
        where: { id },
        data: {
          ...(dto.purchaseOrderId !== undefined && {
            purchaseOrderId: dto.purchaseOrderId,
          }),
          ...(dto.accountId && { accountId: dto.accountId }),
          ...(dto.paymentDate && { paymentDate: new Date(dto.paymentDate) }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
          ...(dto.reference !== undefined && { reference: dto.reference }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: {
          supplier: true,
          purchaseOrder: true,
          account: true,
        },
      });
    });

    return successResponse(payment);
  }

  /**
   * Delete a supplier payment
   */
  async delete(id: string, userId: string) {
    const payment = await this.prisma.supplierPayment.findUnique({
      where: { id },
      include: {
        purchaseOrder: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pembayaran supplier tidak ditemukan');
    }

    await this.prisma.$transaction(async (tx) => {
      // Restore account balance
      await tx.account.update({
        where: { id: payment.accountId },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });

      // Restore purchase order paid amount if linked
      if (payment.purchaseOrderId && payment.purchaseOrder) {
        const po = payment.purchaseOrder;
        const newPaidAmount = Number(po.paidAmount) - Number(payment.amount);
        const newPaymentStatus =
          newPaidAmount >= Number(po.total)
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'unpaid';

        await tx.purchaseOrder.update({
          where: { id: payment.purchaseOrderId },
          data: {
            paidAmount: Math.max(0, newPaidAmount),
            paymentStatus: newPaymentStatus,
          },
        });
      }

      // Delete related transaction record
      await tx.transaction.deleteMany({
        where: {
          referenceType: 'purchase_payment',
          referenceId: id,
        },
      });

      await tx.supplierPayment.delete({ where: { id } });
    });

    return successResponse({
      message: `Pembayaran '${payment.paymentNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete supplier payments
   */
  async bulkDelete(ids: string[], userId: string) {
    const payments = await this.prisma.supplierPayment.findMany({
      where: { id: { in: ids } },
      include: { purchaseOrder: true },
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
            balance: {
              increment: payment.amount,
            },
          },
        });

        // Restore purchase order paid amount if linked
        if (payment.purchaseOrderId && payment.purchaseOrder) {
          const po = payment.purchaseOrder;
          const newPaidAmount = Number(po.paidAmount) - Number(payment.amount);
          const newPaymentStatus =
            newPaidAmount >= Number(po.total)
              ? 'paid'
              : newPaidAmount > 0
                ? 'partial'
                : 'unpaid';

          await tx.purchaseOrder.update({
            where: { id: payment.purchaseOrderId },
            data: {
              paidAmount: Math.max(0, newPaidAmount),
              paymentStatus: newPaymentStatus,
            },
          });
        }

        // Delete related transaction record
        await tx.transaction.deleteMany({
          where: {
            referenceType: 'purchase_payment',
            referenceId: payment.id,
          },
        });

        await tx.supplierPayment.delete({ where: { id: payment.id } });
        deletedCount++;
      });
    }

    return successResponse({
      message: `${deletedCount} pembayaran berhasil dihapus`,
      deletedCount,
    });
  }
}
