import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { CreateUnitValues, UpdateUnitValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    baseUnitId?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      baseUnitId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where = this.buildWhereClause(search, baseUnitId);

    const orderBy: any = {};
    if (sortBy === 'baseUnit') {
      orderBy.baseUnit = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, data] = await Promise.all([
      this.prisma.unitOfMeasure.count({ where }),
      this.prisma.unitOfMeasure.findMany({
        where,
        take: sizeNum,
        skip,
        orderBy,
        include: {
          baseUnit: true,
          _count: {
            select: {
              derivedUnits: true,
              products: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const summary = await this.buildSummary();

    return paginatedResponse(
      data,
      {
        page,
        pageSize,
        totalItems: total,
        totalPages,
      },
      summary,
    );
  }

  private buildWhereClause(search?: string, baseUnitId?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } }, // Case-insensitive handled by DB usually or setup
        { symbol: { contains: search } },
      ];
    }

    if (baseUnitId) {
      where.baseUnitId = baseUnitId === 'null' ? null : baseUnitId;
    }

    return where;
  }

  private async buildSummary() {
    const [totalUnits, baseUnits, derivedUnits] = await Promise.all([
      this.prisma.unitOfMeasure.count(),
      this.prisma.unitOfMeasure.count({ where: { baseUnitId: null } }),
      this.prisma.unitOfMeasure.count({ where: { baseUnitId: { not: null } } }),
    ]);

    return {
      totalUnits,
      baseUnits,
      derivedUnits,
    };
  }

  async findActiveList() {
    const units = await this.prisma.unitOfMeasure.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        symbol: true,
      },
    });

    return successResponse(units);
  }

  async findById(id: string) {
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id },
      include: {
        baseUnit: true,
        derivedUnits: {
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: {
          select: {
            products: true,
            derivedUnits: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Unit"}`);
    }

    return successResponse(unit);
  }

  async create(dto: CreateUnitValues, userId: string) {
    // Check name uniqueness
    const existing = await this.prisma.unitOfMeasure.findFirst({
      where: {
        OR: [{ name: dto.name }, { symbol: dto.symbol }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.name === dto.name
          ? `messages.error.conflict|{"name": "Unit ${dto.name}"}`
          : `messages.error.conflict|{"name": "Unit ${dto.symbol}"}`,
      );
    }

    // If base unit selected, verify it exists and is a base unit itself (optional rule, but good for simplicity: max depth 1)
    if (dto.baseUnitId) {
      const baseUnit = await this.prisma.unitOfMeasure.findUnique({
        where: { id: dto.baseUnitId },
      });

      if (!baseUnit) {
        throw new NotFoundException(`messages.error.notFound|{"name": "Unit dasar"}`);
      }

      // Validasi: Base unit tidak boleh punya base unit (max depth 1 level)
      // Opsional: jika ingin support nested conversion, hapus check ini.
      // Untuk MVP, kita batasi 1 level conversion agar tidak ribet.
      if (baseUnit.baseUnitId) {
        throw new BadRequestException(
          'Tidak dapat menurunkan dari unit yang sudah diturunkan (depth 1)',
        );
      }
    } else {
      // If no base unit, conversion rate should be null or ignored
    }

    const unit = await this.prisma.unitOfMeasure.create({
      data: {
        ...dto,
      },
    });

    return successResponse(unit);
  }

  async update(id: string, dto: UpdateUnitValues, userId: string) {
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Unit"}`);
    }

    // Check name uniqueness if changed
    if (dto.name && dto.name !== unit.name) {
      const existing = await this.prisma.unitOfMeasure.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(`messages.error.conflict|{"name": "Unit ${dto.name}"}`);
      }
    }

    // Check symbol uniqueness if changed
    if (dto.symbol && dto.symbol !== unit.symbol) {
      const existing = await this.prisma.unitOfMeasure.findFirst({
        where: { symbol: dto.symbol, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(
          `messages.error.conflict|{"name": "Unit ${dto.symbol}"}`,
        );
      }
    }

    // Validate base unit change
    if (dto.baseUnitId !== undefined) {
      if (dto.baseUnitId === id) {
        throw new BadRequestException(
          `messages.error.conflict|{"name": "Unit"}`,
        );
      }

      if (dto.baseUnitId) {
        // Check circular ref: if A -> B, ensure B is not pointing to A (already handled by depth 1 check)
        // Check depth 1
        const baseUnit = await this.prisma.unitOfMeasure.findUnique({
          where: { id: dto.baseUnitId },
        });

        if (!baseUnit) {
          throw new NotFoundException(`messages.error.notFound|{"name": "Unit dasar"}`);
        }

        if (baseUnit.baseUnitId) {
          throw new BadRequestException(
            'Tidak bisa menurunkan dari unit yang sudah diturunkan',
          );
        }
      }
    }

    const updated = await this.prisma.unitOfMeasure.update({
      where: { id },
      data: dto,
    });

    return successResponse(updated);
  }

  async delete(id: string, userId: string) {
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, derivedUnits: true },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Unit"}`);
    }

    if (unit._count.products > 0) {
      throw new BadRequestException(
        `messages.error.cannotDeleteInUse|{"name": "${unit.name}"}`,
      );
    }

    if (unit._count.derivedUnits > 0) {
      throw new BadRequestException(
        `messages.error.cannotDeleteInUse|{"name": "${unit.name}"}`,
      );
    }

    await this.prisma.unitOfMeasure.delete({
      where: { id },
    });

    return successResponse({ message: `messages.success.deleted|{"name": "Unit"}` });
  }

  async bulkDelete(ids: string[], userId: string) {
    // Basic implementation: check constraints one by one or trust db foreign key error (but we want user friendly msg)
    // For simplicity, we loop.
    let count = 0;
    for (const id of ids) {
      try {
        await this.delete(id, userId);
        count++;
      } catch (e) {
        // ignore error for bulk action, or stop?
        // usually bulk delete attempts all and reports success count
      }
    }

    return successResponse({ count });
  }
}
