import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateWarehouseValues,
  UpdateWarehouseValues,
  QueryWarehousesValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma, Warehouse } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all warehouses with pagination, filter, and summary
   */
  async findAll(
    query: QueryWarehousesValues,
  ): Promise<
    ApiResponse<Prisma.WarehouseGetPayload<object>[]> & { summary?: any }
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
        { address: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'name']: sortOrder || 'asc',
    };

    const [totalItems, warehouses] = await Promise.all([
      this.prisma.warehouse.count({ where }),
      this.prisma.warehouse.findMany({
        where,
        include: {
          _count: {
            select: {
              stocks: true,
              stockMovements: true,
              stockAdjustments: true,
              stockOpnames: true,
              transfersFrom: true,
              transfersTo: true,
              goodsReceives: true,
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
      warehouses,
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
    const [totalWarehouses, activeWarehouses, inactiveWarehouses] =
      await Promise.all([
        this.prisma.warehouse.count(),
        this.prisma.warehouse.count({ where: { isActive: true } }),
        this.prisma.warehouse.count({ where: { isActive: false } }),
      ]);

    return {
      totalWarehouses,
      activeWarehouses,
      inactiveWarehouses,
    };
  }

  /**
   * Get active warehouses for dropdown/select
   */
  async findActiveList() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        isDefault: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(warehouses);
  }

  /**
   * Get a single warehouse by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    return successResponse(warehouse);
  }

  /**
   * Generate next warehouse code
   */
  async generateCode(): Promise<string> {
    const lastWarehouse = await this.prisma.warehouse.findFirst({
      orderBy: { code: 'desc' },
    });

    if (!lastWarehouse) {
      return 'WH-0001';
    }

    const lastCode = lastWarehouse.code;
    const match = lastCode.match(/WH-(\d+)/);

    if (match) {
      const number = parseInt(match[1], 10) + 1;
      return `WH-${number.toString().padStart(4, '0')}`;
    }

    return `WH-${Date.now()}`;
  }

  /**
   * Create a new warehouse
   */
  async create(
    dto: CreateWarehouseValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    // Generate code if not provided
    let warehouseCode = dto.code;
    if (!warehouseCode) {
      warehouseCode = await this.generateCode();
    } else {
      // Check duplicate code
      const existingCode = await this.prisma.warehouse.findUnique({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(
          `Kode gudang '${dto.code}' sudah digunakan`,
        );
      }
    }

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await this.prisma.warehouse.create({
      data: {
        code: warehouseCode,
        name: dto.name,
        address: dto.address,
        isDefault: dto.isDefault ?? false,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse(warehouse);
  }

  /**
   * Update an existing warehouse
   */
  async update(
    id: string,
    dto: UpdateWarehouseValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.WarehouseGetPayload<object>>> {
    const existing = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    // Check duplicate code if changing
    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.prisma.warehouse.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException(
          `Kode gudang '${dto.code}' sudah digunakan`,
        );
      }
    }

    // If setting as default, unset other defaults
    if (dto.isDefault && !existing.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : undefined,
        name: dto.name !== undefined ? dto.name : undefined,
        address: dto.address !== undefined ? dto.address : undefined,
        isDefault: dto.isDefault !== undefined ? dto.isDefault : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse(warehouse);
  }

  /**
   * Delete a warehouse
   */
  async delete(id: string, userId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('Gudang tidak ditemukan');
    }

    // Prevent deleting default warehouse
    if (warehouse.isDefault) {
      throw new ConflictException(
        `Gudang '${warehouse.name}' adalah gudang default dan tidak dapat dihapus. Ubah gudang lain menjadi default terlebih dahulu.`,
      );
    }

    // Logic:
    // 1. If Active -> Deactivate (Soft Delete)
    // 2. If Inactive -> Try to Hard Delete (check usage first)

    if (warehouse.isActive) {
      await this.prisma.warehouse.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Gudang '${warehouse.name}' berhasil dinonaktifkan`,
      });
    }

    // If inactive, check dependencies
    const isUsedInTransactions =
      await this.checkWarehouseUsedInTransactions(id);

    if (isUsedInTransactions) {
      throw new ConflictException(
        `Gudang '${warehouse.name}' tidak dapat dihapus permanen karena sudah memiliki riwayat transaksi. Hanya bisa dinonaktifkan.`,
      );
    }

    // Safe to hard delete
    await this.prisma.warehouse.delete({
      where: { id },
    });

    return successResponse({
      message: `Gudang '${warehouse.name}' berhasil dihapus permanen`,
      isHardDelete: true,
    });
  }

  private async checkWarehouseUsedInTransactions(
    warehouseId: string,
  ): Promise<boolean> {
    const [
      stockCount,
      stockMovementCount,
      stockAdjustmentCount,
      stockOpnameCount,
      transferFromCount,
      transferToCount,
      goodsReceiveCount,
    ] = await Promise.all([
      this.prisma.stock.count({ where: { warehouseId } }),
      this.prisma.stockMovement.count({ where: { warehouseId } }),
      this.prisma.stockAdjustment.count({ where: { warehouseId } }),
      this.prisma.stockOpname.count({ where: { warehouseId } }),
      this.prisma.stockTransfer.count({
        where: { fromWarehouseId: warehouseId },
      }),
      this.prisma.stockTransfer.count({
        where: { toWarehouseId: warehouseId },
      }),
      this.prisma.goodsReceive.count({ where: { warehouseId } }),
    ]);

    return (
      stockCount > 0 ||
      stockMovementCount > 0 ||
      stockAdjustmentCount > 0 ||
      stockOpnameCount > 0 ||
      transferFromCount > 0 ||
      transferToCount > 0 ||
      goodsReceiveCount > 0
    );
  }

  /**
   * Bulk delete warehouses
   */
  async bulkDelete(ids: string[], userId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { id: { in: ids } },
    });

    if (warehouses.length !== ids.length) {
      throw new NotFoundException('Beberapa gudang tidak ditemukan');
    }

    // Check if any is default
    const hasDefault = warehouses.some((w) => w.isDefault);
    if (hasDefault) {
      throw new ConflictException(
        'Tidak dapat menghapus gudang default. Ubah gudang lain menjadi default terlebih dahulu.',
      );
    }

    let hardDeleteCount = 0;
    let softDeleteCount = 0;
    let skippedCount = 0;

    for (const warehouse of warehouses) {
      if (warehouse.isActive) {
        // Case 1: Active -> Soft Delete (Deactivate)
        await this.prisma.warehouse.update({
          where: { id: warehouse.id },
          data: { isActive: false },
        });
        softDeleteCount++;
      } else {
        // Case 2: Inactive -> Try Hard Delete
        const isUsed = await this.checkWarehouseUsedInTransactions(
          warehouse.id,
        );

        if (isUsed) {
          skippedCount++;
        } else {
          // Safe to hard delete
          await this.prisma.warehouse.delete({
            where: { id: warehouse.id },
          });
          hardDeleteCount++;
        }
      }
    }

    const messages: string[] = [];
    if (hardDeleteCount > 0) {
      messages.push(`${hardDeleteCount} gudang dihapus permanen`);
    }
    if (softDeleteCount > 0) {
      messages.push(`${softDeleteCount} gudang dinonaktifkan`);
    }
    if (skippedCount > 0) {
      messages.push(`${skippedCount} gudang dilewati (memiliki transaksi)`);
    }

    return successResponse({
      message: messages.join(', '),
      hardDeleteCount,
      softDeleteCount,
      skippedCount,
    });
  }
}
