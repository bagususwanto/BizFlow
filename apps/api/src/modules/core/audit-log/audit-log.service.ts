import { Injectable, Logger } from '@nestjs/common';
import type { CreateAuditLogInput, AuditLogQueryValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { paginatedResponse } from '../../../common/utils';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async create(data: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          module: data.module,
          entityId: data.entityId,
          entityType: data.entityType,
          oldValue: data.oldValue,
          newValue: data.newValue,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  /**
   * Get all audit logs with pagination and filters
   */
  async findAll(query: AuditLogQueryValues) {
    const {
      userId,
      module,
      action,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where = this.buildWhereClause({
      userId,
      module,
      action,
      search,
      startDate,
      endDate,
    });

    const [data, totalItems] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const summary = await this.buildSummary();

    return paginatedResponse(
      data,
      {
        page,
        pageSize: limit,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  /**
   * Build summary statistics for audit logs
   */
  private async buildSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, logsToday, uniqueUsers, moduleStats] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['module'],
        _count: true,
        orderBy: { _count: { module: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalLogs,
      logsToday,
      uniqueUsers: uniqueUsers.length,
      topModules: moduleStats.map((m) => ({
        module: m.module,
        count: m._count,
      })),
    };
  }

  /**
   * Build where clause for filtering audit logs
   */
  private buildWhereClause(filters: {
    userId?: string;
    module?: string;
    action?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.module) {
      where.module = filters.module;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.search) {
      where.OR = [
        { entityId: { contains: filters.search } },
        { entityType: { contains: filters.search } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return where;
  }

  /**
   * Find audit logs by user ID
   */
  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Find audit logs by module
   */
  async findByModule(module: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { module },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Find audit logs by entity
   */
  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
