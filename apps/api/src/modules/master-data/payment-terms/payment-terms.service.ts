import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreatePaymentTermValues,
  UpdatePaymentTermValues,
  QueryPaymentTermsValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class PaymentTermsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all payment terms with pagination and filter
   */
  async findAll(
    query: QueryPaymentTermsValues,
  ): Promise<
    ApiResponse<Prisma.PaymentTermGetPayload<object>[]> & { summary?: any }
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
        { description: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'name']: sortOrder || 'asc',
    };

    const [totalItems, paymentTerms] = await Promise.all([
      this.prisma.paymentTerm.count({ where }),
      this.prisma.paymentTerm.findMany({
        where,
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);

    const summary = await this.buildSummary();

    return paginatedResponse(
      paymentTerms,
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
    const [total, active, inactive] = await Promise.all([
      this.prisma.paymentTerm.count(),
      this.prisma.paymentTerm.count({ where: { isActive: true } }),
      this.prisma.paymentTerm.count({ where: { isActive: false } }),
    ]);

    return { total, active, inactive };
  }

  /**
   * Get active payment terms for dropdown/select
   */
  async findActiveList() {
    const paymentTerms = await this.prisma.paymentTerm.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        daysDue: true,
      },
      orderBy: { daysDue: 'asc' },
    });

    return successResponse(paymentTerms);
  }

  /**
   * Get a single payment term by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    const paymentTerm = await this.prisma.paymentTerm.findUnique({
      where: { id },
    });

    if (!paymentTerm) {
      throw new NotFoundException('Payment term tidak ditemukan');
    }

    return successResponse(paymentTerm);
  }

  /**
   * Create a new payment term
   */
  async create(
    dto: CreatePaymentTermValues,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    const existing = await this.prisma.paymentTerm.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Payment term '${dto.name}' sudah ada`);
    }

    const paymentTerm = await this.prisma.paymentTerm.create({
      data: {
        name: dto.name,
        daysDue: dto.daysDue ?? 0,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse(paymentTerm);
  }

  /**
   * Update an existing payment term
   */
  async update(
    id: string,
    dto: UpdatePaymentTermValues,
  ): Promise<ApiResponse<Prisma.PaymentTermGetPayload<object>>> {
    const existing = await this.prisma.paymentTerm.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Payment term tidak ditemukan');
    }

    // Check duplicate name if changing
    if (dto.name && dto.name !== existing.name) {
      const duplicateName = await this.prisma.paymentTerm.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (duplicateName) {
        throw new ConflictException(`Payment term '${dto.name}' sudah ada`);
      }
    }

    const paymentTerm = await this.prisma.paymentTerm.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        daysDue: dto.daysDue !== undefined ? dto.daysDue : undefined,
        description:
          dto.description !== undefined ? dto.description : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse(paymentTerm);
  }

  /**
   * Delete a payment term (soft delete if active, hard delete if inactive)
   */
  async delete(id: string) {
    const paymentTerm = await this.prisma.paymentTerm.findUnique({
      where: { id },
    });

    if (!paymentTerm) {
      throw new NotFoundException('Payment term tidak ditemukan');
    }

    if (paymentTerm.isActive) {
      await this.prisma.paymentTerm.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Payment term '${paymentTerm.name}' berhasil dinonaktifkan`,
      });
    }

    // Inactive → hard delete (no FK references currently)
    await this.prisma.paymentTerm.delete({ where: { id } });

    return successResponse({
      message: `Payment term '${paymentTerm.name}' berhasil dihapus permanen`,
      isHardDelete: true,
    });
  }

  /**
   * Bulk delete payment terms
   */
  async bulkDelete(ids: string[]) {
    const paymentTerms = await this.prisma.paymentTerm.findMany({
      where: { id: { in: ids } },
    });

    if (paymentTerms.length !== ids.length) {
      throw new NotFoundException('Beberapa payment term tidak ditemukan');
    }

    let hardDeleteCount = 0;
    let softDeleteCount = 0;

    for (const term of paymentTerms) {
      if (term.isActive) {
        await this.prisma.paymentTerm.update({
          where: { id: term.id },
          data: { isActive: false },
        });
        softDeleteCount++;
      } else {
        await this.prisma.paymentTerm.delete({ where: { id: term.id } });
        hardDeleteCount++;
      }
    }

    const messages: string[] = [];
    if (hardDeleteCount > 0)
      messages.push(`${hardDeleteCount} payment term dihapus permanen`);
    if (softDeleteCount > 0)
      messages.push(`${softDeleteCount} payment term dinonaktifkan`);

    return successResponse({
      message: messages.join(', '),
      hardDeleteCount,
      softDeleteCount,
    });
  }
}
