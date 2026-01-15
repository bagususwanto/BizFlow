import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type {
  CreateUserValues,
  UpdateUserValues,
  AdminResetPasswordValues,
  ChangePinValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users with pagination, filter, and summary
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    roleId?: string;
    isActive?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      roleId,
      isActive,
    } = query || {};

    const where = this.buildWhereClause(search, roleId, isActive);

    // Build orderBy clause
    const orderBy = { [sortBy]: sortOrder };

    // Get total count
    const totalItems = await this.prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated users
    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        outlets: {
          select: {
            outletId: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map users (exclude password and pin)
    const mappedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      outletIds: user.outlets.map((o) => o.outletId),
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedUsers,
      {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  private buildWhereClause(
    search?: string,
    roleId?: string,
    isActive?: boolean,
  ) {
    const where: {
      OR?: Array<{
        username?: { contains: string };
        name?: { contains: string };
        email?: { contains: string };
      }>;
      roleId?: string;
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return where;
  }

  private async buildSummary() {
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  }

  /**
   * Get a single user by ID with full details
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        outlets: {
          select: {
            outletId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return successResponse({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      outletIds: user.outlets.map((o) => o.outletId),
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Create a new user
   */
  async create(dto: CreateUserValues, createdByUserId: string) {
    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException(`Username '${dto.username}' sudah digunakan`);
    }

    // Check if email already exists (if provided)
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' sudah digunakan`);
      }
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new BadRequestException('Role tidak ditemukan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Hash PIN if provided
    let hashedPin: string | null = null;
    if (dto.pin) {
      hashedPin = await bcrypt.hash(dto.pin, SALT_ROUNDS);
    }

    // Create user with outlets in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: dto.username,
          email: dto.email || null,
          password: hashedPassword,
          pin: hashedPin,
          name: dto.name,
          roleId: dto.roleId,
          isActive: dto.isActive ?? true,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create outlet assignments if provided
      if (dto.outletIds && dto.outletIds.length > 0) {
        await tx.userOutlet.createMany({
          data: dto.outletIds.map((outletId) => ({
            userId: newUser.id,
            outletId,
          })),
        });
      }

      return newUser;
    });

    return successResponse({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      outletIds: dto.outletIds || [],
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }

  /**
   * Update an existing user
   */
  async update(id: string, dto: UpdateUserValues, updatedByUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== existing.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException(`Email '${dto.email}' sudah digunakan`);
      }
    }

    // Verify role exists if changing role
    if (dto.roleId && dto.roleId !== existing.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new BadRequestException('Role tidak ditemukan');
      }
    }

    // Update user with outlets in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          email: dto.email !== undefined ? dto.email : undefined,
          name: dto.name,
          roleId: dto.roleId,
          isActive: dto.isActive,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update outlet assignments if provided
      if (dto.outletIds !== undefined) {
        // Delete existing outlets
        await tx.userOutlet.deleteMany({
          where: { userId: id },
        });

        // Create new outlet assignments
        if (dto.outletIds.length > 0) {
          await tx.userOutlet.createMany({
            data: dto.outletIds.map((outletId) => ({
              userId: id,
              outletId,
            })),
          });
        }
      }

      return updatedUser;
    });

    // Get updated outlets
    const outlets = await this.prisma.userOutlet.findMany({
      where: { userId: id },
      select: { outletId: true },
    });

    return successResponse({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      outletIds: outlets.map((o) => o.outletId),
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Deactivate a user (soft delete)
   */
  async delete(id: string, deletedByUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Prevent self-deactivation
    if (id === deletedByUserId) {
      throw new ForbiddenException('Tidak dapat menonaktifkan akun sendiri');
    }

    // Count active admins to prevent deactivating last admin
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'owner' },
    });

    if (adminRole && user.roleId === adminRole.id) {
      const activeAdminCount = await this.prisma.user.count({
        where: {
          roleId: adminRole.id,
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          'Tidak dapat menonaktifkan admin terakhir',
        );
      }
    }

    // Soft delete (deactivate)
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({
      message: `User '${user.username}' berhasil dinonaktifkan`,
    });
  }

  /**
   * Admin reset password for a user
   */
  async resetPassword(
    id: string,
    dto: AdminResetPasswordValues,
    adminUserId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return successResponse({
      message: `Password user '${user.username}' berhasil direset`,
    });
  }

  /**
   * Change or set PIN for a user
   */
  async changePin(id: string, dto: ChangePinValues, adminUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // If user has PIN and currentPin is provided, verify it
    if (user.pin && dto.currentPin) {
      const isPinValid = await bcrypt.compare(dto.currentPin, user.pin);
      if (!isPinValid) {
        throw new BadRequestException('PIN lama tidak sesuai');
      }
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(dto.newPin, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { pin: hashedPin },
    });

    return successResponse({
      message: `PIN user '${user.username}' berhasil diubah`,
    });
  }

  /**
   * Bulk delete (deactivate) users
   */
  async bulkDelete(ids: string[], deletedByUserId: string) {
    // Validate all users exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    if (users.length !== ids.length) {
      throw new NotFoundException('Beberapa user tidak ditemukan');
    }

    // Prevent self-deactivation
    if (ids.includes(deletedByUserId)) {
      throw new ForbiddenException(
        'Tidak dapat menonaktifkan akun sendiri dalam bulk delete',
      );
    }

    // Deactivate users
    const result = await this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return successResponse({
      message: `${result.count} user berhasil dinonaktifkan`,
    });
  }
}
