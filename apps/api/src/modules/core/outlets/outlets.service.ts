import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { CreateOutletValues, UpdateOutletValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class OutletsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all outlets with pagination, filter, and summary
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    isActive?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      isActive,
    } = query || {};

    const where = this.buildWhereClause(search, isActive);

    // Build orderBy clause - handle userCount specially
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === 'userCount') {
      orderBy = {
        users: {
          _count: sortOrder,
        },
      };
    }

    // Get total count
    const totalItems = await this.prisma.outlet.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated outlets
    const outlets = await this.prisma.outlet.findMany({
      where,
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map outlets
    const mappedOutlets = outlets.map((outlet) => ({
      id: outlet.id,
      code: outlet.code,
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      isActive: outlet.isActive,
      userCount: outlet._count.users,
      createdAt: outlet.createdAt,
      updatedAt: outlet.updatedAt,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedOutlets,
      {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  private buildWhereClause(search?: string, isActive?: boolean) {
    const where: {
      OR?: Array<{
        code?: { contains: string };
        name?: { contains: string };
        address?: { contains: string };
      }>;
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return where;
  }

  private async buildSummary() {
    const [totalOutlets, activeOutlets, inactiveOutlets] = await Promise.all([
      this.prisma.outlet.count(),
      this.prisma.outlet.count({ where: { isActive: true } }),
      this.prisma.outlet.count({ where: { isActive: false } }),
    ]);

    return {
      totalOutlets,
      activeOutlets,
      inactiveOutlets,
    };
  }

  /**
   * Get a single outlet by ID with full details
   */
  async findById(id: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet tidak ditemukan');
    }

    return successResponse({
      id: outlet.id,
      code: outlet.code,
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      isActive: outlet.isActive,
      userCount: outlet._count.users,
      users: outlet.users.map((u) => u.user),
      createdAt: outlet.createdAt,
      updatedAt: outlet.updatedAt,
    });
  }

  /**
   * Get active outlets for dropdown/select
   */
  async findActiveList() {
    const outlets = await this.prisma.outlet.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(outlets);
  }

  /**
   * Create a new outlet
   */
  async create(dto: CreateOutletValues, userId: string) {
    // Check if code already exists
    const existingCode = await this.prisma.outlet.findUnique({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException(`Kode outlet '${dto.code}' sudah digunakan`);
    }

    const outlet = await this.prisma.outlet.create({
      data: {
        code: dto.code,
        name: dto.name,
        address: dto.address || null,
        phone: dto.phone || null,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse({
      id: outlet.id,
      code: outlet.code,
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      isActive: outlet.isActive,
      createdAt: outlet.createdAt,
    });
  }

  /**
   * Update an existing outlet
   */
  async update(id: string, dto: UpdateOutletValues, userId: string) {
    const existing = await this.prisma.outlet.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Outlet tidak ditemukan');
    }

    // Check code uniqueness if changing code
    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.prisma.outlet.findUnique({
        where: { code: dto.code },
      });

      if (existingCode) {
        throw new ConflictException(
          `Kode outlet '${dto.code}' sudah digunakan`,
        );
      }
    }

    const outlet = await this.prisma.outlet.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : undefined,
        name: dto.name !== undefined ? dto.name : undefined,
        address: dto.address !== undefined ? dto.address : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse({
      id: outlet.id,
      code: outlet.code,
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      isActive: outlet.isActive,
      updatedAt: outlet.updatedAt,
    });
  }

  /**
   * Delete (deactivate) an outlet
   */
  async delete(id: string, userId: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, salesOrders: true },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet tidak ditemukan');
    }

    // Check if outlet has any sales orders - prevent deletion
    if (outlet._count.salesOrders > 0) {
      // Soft delete (deactivate) instead
      await this.prisma.outlet.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Outlet '${outlet.name}' dinonaktifkan karena memiliki ${outlet._count.salesOrders} transaksi`,
      });
    }

    // If no sales orders, we can safely delete
    await this.prisma.$transaction(async (tx) => {
      // Remove user assignments
      await tx.userOutlet.deleteMany({
        where: { outletId: id },
      });

      // Delete outlet
      await tx.outlet.delete({
        where: { id },
      });
    });

    return successResponse({
      message: `Outlet '${outlet.name}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete (deactivate) outlets
   */
  async bulkDelete(ids: string[], userId: string) {
    // Validate all outlets exist
    const outlets = await this.prisma.outlet.findMany({
      where: { id: { in: ids } },
    });

    if (outlets.length !== ids.length) {
      throw new NotFoundException('Beberapa outlet tidak ditemukan');
    }

    // Deactivate outlets
    const result = await this.prisma.outlet.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return successResponse({
      message: `${result.count} outlet berhasil dinonaktifkan`,
    });
  }
}
