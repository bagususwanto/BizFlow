import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateCustomerValues,
  UpdateCustomerValues,
  QueryCustomersValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all customers with pagination, filter, and summary
   */
  async findAll(query: QueryCustomersValues) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      isActive,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'name']: sortOrder || 'asc',
    };

    const [totalItems, customers] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);

    const summary = await this.buildSummary();

    return paginatedResponse(
      customers,
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
    const [totalCustomers, activeCustomers, inactiveCustomers] =
      await Promise.all([
        this.prisma.customer.count(),
        this.prisma.customer.count({ where: { isActive: true } }),
        this.prisma.customer.count({ where: { isActive: false } }),
      ]);

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
    };
  }

  /**
   * Get active customers for dropdown/select
   */
  async findActiveList() {
    const customers = await this.prisma.customer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(customers);
  }

  /**
   * Get a single customer by ID
   */
  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    return successResponse(customer);
  }

  /**
   * Generate next customer code
   */
  async generateCode(): Promise<string> {
    const lastCustomer = await this.prisma.customer.findFirst({
      orderBy: { code: 'desc' },
    });

    if (!lastCustomer) {
      return 'CUST-0001';
    }

    const lastCode = lastCustomer.code;
    const match = lastCode.match(/CUST-(\d+)/);

    if (match) {
      const number = parseInt(match[1], 10) + 1;
      return `CUST-${number.toString().padStart(4, '0')}`;
    }

    return `CUST-${Date.now()}`;
  }

  /**
   * Create a new customer
   */
  async create(dto: CreateCustomerValues, userId: string) {
    // Generate code if not provided
    let customerCode = dto.code;
    if (!customerCode) {
      customerCode = await this.generateCode();
    } else {
      // Check duplicate code
      const existingCode = await this.prisma.customer.findUnique({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(
          `Kode customer '${dto.code}' sudah digunakan`,
        );
      }
    }

    // Check duplicate email if provided
    if (dto.email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' sudah digunakan`);
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        code: customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        taxId: dto.taxId,
        creditLimit: dto.creditLimit ?? 0,
        priceLevelId: dto.priceLevelId,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse(customer);
  }

  /**
   * Update an existing customer
   */
  async update(id: string, dto: UpdateCustomerValues, userId: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    // Check duplicate code if changing
    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.prisma.customer.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException(
          `Kode customer '${dto.code}' sudah digunakan`,
        );
      }
    }

    // Check duplicate email if changing
    if (dto.email && dto.email !== existing.email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' sudah digunakan`);
      }
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : undefined,
        name: dto.name !== undefined ? dto.name : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        email: dto.email !== undefined ? dto.email : undefined,
        address: dto.address !== undefined ? dto.address : undefined,
        taxId: dto.taxId !== undefined ? dto.taxId : undefined,
        creditLimit:
          dto.creditLimit !== undefined ? dto.creditLimit : undefined,
        priceLevelId:
          dto.priceLevelId !== undefined ? dto.priceLevelId : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse(customer);
  }

  /**
   * Delete a customer
   */
  async delete(id: string, userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    // Check usage in transactions
    const isUsedInTransactions = await this.checkCustomerUsedInTransactions(id);

    if (isUsedInTransactions) {
      // Soft delete
      await this.prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Pelanggan '${customer.name}' dinonaktifkan karena sudah memiliki riwayat transaksi`,
        isHardDelete: false,
      });
    }

    // Hard delete
    await this.prisma.customer.delete({
      where: { id },
    });

    return successResponse({
      message: `Pelanggan '${customer.name}' berhasil dihapus permanen`,
      isHardDelete: true,
    });
  }

  private async checkCustomerUsedInTransactions(
    customerId: string,
  ): Promise<boolean> {
    const [salesOrderCount, paymentCount] = await Promise.all([
      this.prisma.salesOrder.count({ where: { customerId } }),
      this.prisma.payment.count({ where: { customerId } }),
    ]);

    return salesOrderCount > 0 || paymentCount > 0;
  }

  /**
   * Bulk delete customers
   */
  async bulkDelete(ids: string[], userId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: ids } },
    });

    if (customers.length !== ids.length) {
      throw new NotFoundException('Beberapa pelanggan tidak ditemukan');
    }

    let deletedCount = 0;
    let deactivatedCount = 0;

    for (const id of ids) {
      const result = await this.delete(id, userId);
      if (result.data.isHardDelete) {
        deletedCount++;
      } else {
        deactivatedCount++;
      }
    }

    return successResponse({
      message: `${deletedCount} pelanggan dihapus permanen, ${deactivatedCount} dinonaktifkan`,
      details: { deletedCount, deactivatedCount },
    });
  }
  /**
   * Get customer financial info (credit limit, balance, etc.)
   */
  async getFinancialInfo(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    // Calculate current balance (Total Unpaid Sales Orders)
    const salesOrders = await this.prisma.salesOrder.findMany({
      where: {
        customerId: id,
        paymentStatus: { not: 'paid' },
        status: { not: 'cancelled' },
      },
      select: {
        total: true,
        paidAmount: true,
      },
    });

    const currentBalance = salesOrders.reduce((acc, order) => {
      const remaining = Number(order.total) - Number(order.paidAmount);
      return acc + remaining;
    }, 0);

    const creditLimit = Number(customer.creditLimit);
    const availableCredit = Math.max(0, creditLimit - currentBalance);

    return successResponse({
      creditLimit,
      currentBalance,
      availableCredit,
      isOverLimit: currentBalance > creditLimit,
    });
  }

  /**
   * Check if customer has enough credit for a transaction
   * Throws error if limit exceeded
   */
  async checkCreditAvailability(id: string, amount: number) {
    const info = await this.getFinancialInfo(id);
    const { availableCredit, creditLimit } = info.data;

    // Only check if credit limit is set (> 0)
    if (creditLimit > 0 && amount > availableCredit) {
      throw new ConflictException(
        `Credit limit tidak mencukupi. Sisa credit: ${availableCredit}, Transaksi: ${amount}`,
      );
    }

    return true;
  }
}
