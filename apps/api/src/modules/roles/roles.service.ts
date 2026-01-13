import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { CreateRoleValues, UpdateRoleValues } from '@bizflow/types';
import {
  AVAILABLE_MODULES,
  AVAILABLE_ACTIONS,
  SYSTEM_ROLES,
} from '@bizflow/types';

import { PrismaService } from '../../prisma';
import { successResponse, paginatedResponse } from '../../common/utils';
import { AuditLogService } from '../audit-log';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get all roles with pagination, filter, and summary
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    isSystemRole?: boolean;
  }) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const sortBy = query?.sortBy ?? 'name';
    const sortOrder = query?.sortOrder ?? 'asc';
    const search = query?.search;
    const isSystemRole = query?.isSystemRole;

    // Build where clause for filtering
    const where: {
      name?: { contains: string } | { in: string[] } | { notIn: string[] };
      OR?: Array<{
        name?: { contains: string };
        description?: { contains: string };
      }>;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter by isSystemRole at DB level
    if (isSystemRole !== undefined) {
      if (isSystemRole) {
        where.name = { in: SYSTEM_ROLES as unknown as string[] };
      } else {
        where.name = { notIn: SYSTEM_ROLES as unknown as string[] };
      }
    }

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'userCount') {
      orderBy['name'] = sortOrder; // Fallback
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count (accurate with DB filtering)
    const totalItems = await this.prisma.role.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated roles
    const roles = await this.prisma.role.findMany({
      where,
      include: {
        permissions: { select: { module: true, action: true } },
        _count: { select: { users: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map roles
    let mappedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      permissions: role.permissions,
      userCount: role._count.users,
      isSystemRole: SYSTEM_ROLES.includes(role.name as any),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    // Post-sorting (still in memory if sortBy=userCount)
    if (sortBy === 'userCount') {
      mappedRoles.sort((a, b) =>
        sortOrder === 'asc'
          ? a.userCount - b.userCount
          : b.userCount - a.userCount,
      );
    }

    // Summary
    const [totalRoles, systemRoles, customRoles, totalUsers] =
      await Promise.all([
        this.prisma.role.count(),
        this.prisma.role.count({
          where: { name: { in: SYSTEM_ROLES as unknown as string[] } },
        }),
        this.prisma.role.count({
          where: { name: { notIn: SYSTEM_ROLES as unknown as string[] } },
        }),
        this.prisma.user.count(),
      ]);

    // Since roleId is required in User model, totalUsers is correct for 'totalUsersAssigned'.
    // No need to filter { role: { isNot: null } }

    const summary = {
      totalRoles,
      systemRoles,
      customRoles,
      totalUsersAssigned: totalUsers,
    };

    return paginatedResponse(
      mappedRoles,
      {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  /**
   * Get a single role by ID with full details
   */
  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            module: true,
            action: true,
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            name: true,
          },
          take: 10,
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    return successResponse({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p) => ({
        id: p.id,
        module: p.module,
        action: p.action,
      })),
      users: role.users,
      userCount: role._count.users,
      isSystemRole: SYSTEM_ROLES.includes(
        role.name as (typeof SYSTEM_ROLES)[number],
      ),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  /**
   * Create a new role with permissions
   */
  async create(dto: CreateRoleValues, userId: string) {
    // Check if role name already exists
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Role dengan nama '${dto.name}' sudah ada`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions
          ? {
              create: dto.permissions.map((p) => ({
                module: p.module,
                action: p.action,
              })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });

    // Create audit log
    await this.auditLogService.create({
      userId,
      action: 'create',
      module: 'users',
      entityId: role.id,
      entityType: 'role',
      newValue: JSON.stringify({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => `${p.module}:${p.action}`),
      }),
    });

    return successResponse({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p) => ({
        module: p.module,
        action: p.action,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  /**
   * Update an existing role and sync permissions
   */
  async update(id: string, dto: UpdateRoleValues, userId: string) {
    const existing = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!existing) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    // Prevent renaming system roles
    if (
      dto.name &&
      dto.name !== existing.name &&
      SYSTEM_ROLES.includes(existing.name as (typeof SYSTEM_ROLES)[number])
    ) {
      throw new BadRequestException('Tidak dapat mengubah nama role sistem');
    }

    // Check for duplicate name
    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });
      if (duplicate) {
        throw new ConflictException(`Role dengan nama '${dto.name}' sudah ada`);
      }
    }

    // If permissions are provided, sync them
    if (dto.permissions) {
      // Delete existing permissions
      await this.prisma.permission.deleteMany({
        where: { roleId: id },
      });

      // Create new permissions
      await this.prisma.permission.createMany({
        data: dto.permissions.map((p) => ({
          roleId: id,
          module: p.module,
          action: p.action,
        })),
      });
    }

    // Update role
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: {
        permissions: true,
      },
    });

    // Create audit log
    await this.auditLogService.create({
      userId,
      action: 'update',
      module: 'users',
      entityId: role.id,
      entityType: 'role',
      oldValue: JSON.stringify({
        name: existing.name,
        description: existing.description,
        permissions: existing.permissions.map((p) => `${p.module}:${p.action}`),
      }),
      newValue: JSON.stringify({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => `${p.module}:${p.action}`),
      }),
    });

    return successResponse({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p) => ({
        module: p.module,
        action: p.action,
      })),
      updatedAt: role.updatedAt,
    });
  }

  /**
   * Delete a role (system roles cannot be deleted)
   */
  async delete(id: string, userId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    // Prevent deletion of system roles
    if (SYSTEM_ROLES.includes(role.name as (typeof SYSTEM_ROLES)[number])) {
      throw new BadRequestException('Tidak dapat menghapus role sistem');
    }

    // Prevent deletion if users are assigned
    if (role._count.users > 0) {
      throw new BadRequestException(
        `Role tidak dapat dihapus karena masih memiliki ${role._count.users} user`,
      );
    }

    // Delete permissions first (cascade should handle this, but being explicit)
    await this.prisma.permission.deleteMany({
      where: { roleId: id },
    });

    // Delete role
    await this.prisma.role.delete({
      where: { id },
    });

    // Create audit log
    await this.auditLogService.create({
      userId,
      action: 'delete',
      module: 'users',
      entityId: id,
      entityType: 'role',
      oldValue: JSON.stringify({
        name: role.name,
        description: role.description,
      }),
    });

    return successResponse({ message: `Role '${role.name}' berhasil dihapus` });
  }

  /**
   * Get all available permissions (modules and actions)
   */
  getAllPermissions() {
    const permissions: {
      module: string;
      action: string;
      description: string;
    }[] = [];

    for (const module of AVAILABLE_MODULES) {
      for (const action of AVAILABLE_ACTIONS) {
        permissions.push({
          module,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
        });
      }
    }

    return successResponse({
      modules: AVAILABLE_MODULES,
      actions: AVAILABLE_ACTIONS,
      permissions,
    });
  }
}
