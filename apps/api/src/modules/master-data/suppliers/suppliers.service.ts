import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateSupplierValues,
  UpdateSupplierValues,
  QuerySuppliersValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma, Supplier } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all suppliers with pagination, filter, and summary
   */
  async findAll(
    query: QuerySuppliersValues,
  ): Promise<
    ApiResponse<Prisma.SupplierGetPayload<object>[]> & { summary?: any }
  > {
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

    const [totalItems, suppliers] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { purchaseOrders: true, supplierPayments: true },
          },
          paymentTerm: true,
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);

    const summary = await this.buildSummary();

    return paginatedResponse(
      suppliers,
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
    const [totalSuppliers, activeSuppliers, inactiveSuppliers] =
      await Promise.all([
        this.prisma.supplier.count(),
        this.prisma.supplier.count({ where: { isActive: true } }),
        this.prisma.supplier.count({ where: { isActive: false } }),
      ]);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    };
  }

  /**
   * Get active suppliers for dropdown/select
   */
  async findActiveList() {
    const suppliers = await this.prisma.supplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(suppliers);
  }

  /**
   * Get a single supplier by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        paymentTerm: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Supplier"}`,
      );
    }

    return successResponse(supplier);
  }

  /**
   * Generate next supplier code
   */
  async generateCode(): Promise<string> {
    const lastSupplier = await this.prisma.supplier.findFirst({
      orderBy: { code: 'desc' },
    });

    if (!lastSupplier) {
      return 'SUPP-0001';
    }

    const lastCode = lastSupplier.code;
    const match = lastCode.match(/SUPP-(\d+)/);

    if (match) {
      const number = parseInt(match[1], 10) + 1;
      return `SUPP-${number.toString().padStart(4, '0')}`;
    }

    return `SUPP-${Date.now()}`;
  }

  /**
   * Create a new supplier
   */
  async create(
    dto: CreateSupplierValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    // Generate code if not provided
    let supplierCode = dto.code;
    if (!supplierCode) {
      supplierCode = await this.generateCode();
    } else {
      // Check duplicate code
      const existingCode = await this.prisma.supplier.findUnique({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Kode supplier ${dto.code}"}`,
        );
      }
    }

    // Check duplicate email if provided
    if (dto.email) {
      const existingEmail = await this.prisma.supplier.findFirst({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Email ${dto.email}"}`,
        );
      }
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        code: supplierCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        taxId: dto.taxId,
        paymentTermId: dto.paymentTermId,
        bankName: dto.bankName,
        bankAccount: dto.bankAccount,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse(supplier);
  }

  /**
   * Update an existing supplier
   */
  async update(
    id: string,
    dto: UpdateSupplierValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.SupplierGetPayload<object>>> {
    const existing = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Supplier"}`,
      );
    }

    // Check duplicate code if changing
    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.prisma.supplier.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Kode supplier ${dto.code}"}`,
        );
      }
    }

    // Check duplicate email if changing
    if (dto.email && dto.email !== existing.email) {
      const existingEmail = await this.prisma.supplier.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existingEmail) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Email ${dto.email}"}`,
        );
      }
    }

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : undefined,
        name: dto.name !== undefined ? dto.name : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        email: dto.email !== undefined ? dto.email : undefined,
        address: dto.address !== undefined ? dto.address : undefined,
        taxId: dto.taxId !== undefined ? dto.taxId : undefined,
        paymentTermId:
          dto.paymentTermId !== undefined ? dto.paymentTermId : undefined,
        bankName: dto.bankName !== undefined ? dto.bankName : undefined,
        bankAccount:
          dto.bankAccount !== undefined ? dto.bankAccount : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse(supplier);
  }

  /**
   * Delete a supplier
   */
  async delete(id: string, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Supplier"}`,
      );
    }

    // Logic:
    // 1. If Active -> Deactivate (Soft Delete)
    // 2. If Inactive -> Try to Hard Delete (check usage first)

    if (supplier.isActive) {
      await this.prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `messages.success.deleted|{"name": "Supplier ${supplier.name}"}`,
      });
    }

    // If inactive, check dependencies
    const isUsedInTransactions = await this.checkSupplierUsedInTransactions(id);

    if (isUsedInTransactions) {
      throw new ConflictException(
        `messages.error.conflict|{"name": "Supplier ${supplier.name}"}`,
      );
    }

    // Safe to hard delete
    await this.prisma.supplier.delete({
      where: { id },
    });

    return successResponse({
      message: `messages.success.deleted|{"name": "Supplier ${supplier.name}"}`,
      isHardDelete: true,
    });
  }

  private async checkSupplierUsedInTransactions(
    supplierId: string,
  ): Promise<boolean> {
    const [purchaseOrderCount, paymentCount] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { supplierId } }),
      this.prisma.supplierPayment.count({ where: { supplierId } }),
    ]);

    return purchaseOrderCount > 0 || paymentCount > 0;
  }

  /**
   * Bulk delete suppliers
   */
  async bulkDelete(ids: string[], userId: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { id: { in: ids } },
    });

    if (suppliers.length !== ids.length) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Beberapa supplier"}`,
      );
    }

    let hardDeleteCount = 0;
    let softDeleteCount = 0;
    let skippedCount = 0;

    for (const supplier of suppliers) {
      if (supplier.isActive) {
        // Case 1: Active -> Soft Delete (Deactivate)
        await this.prisma.supplier.update({
          where: { id: supplier.id },
          data: { isActive: false },
        });
        softDeleteCount++;
      } else {
        // Case 2: Inactive -> Try Hard Delete
        const isUsed = await this.checkSupplierUsedInTransactions(supplier.id);

        if (isUsed) {
          skippedCount++;
        } else {
          // Safe to hard delete
          await this.prisma.supplier.delete({
            where: { id: supplier.id },
          });
          hardDeleteCount++;
        }
      }
    }

    const messages: string[] = [];
    if (hardDeleteCount > 0) {
      messages.push(`${hardDeleteCount} supplier dihapus permanen`);
    }
    if (softDeleteCount > 0) {
      messages.push(`${softDeleteCount} supplier dinonaktifkan`);
    }
    if (skippedCount > 0) {
      messages.push(`${skippedCount} supplier dilewati (memiliki transaksi)`);
    }

    return successResponse({
      message: messages.join(', '),
      hardDeleteCount,
      softDeleteCount,
      skippedCount,
    });
  }
}
