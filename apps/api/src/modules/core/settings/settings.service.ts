import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  QuerySettingsValues,
  UpdateSettingsValues,
  SettingCategoryType,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse } from '../../../common/utils';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all settings with optional category filter
   */
  async findAll(query?: QuerySettingsValues) {
    const { category } = query || {};

    const where = category ? { category } : {};

    const settings = await this.prisma.appSettings.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    const summary = await this.buildSummary();

    return {
      data: settings,
      meta: {
        totalItems: settings.length,
      },
      summary,
    };
  }

  /**
   * Get a single setting by key
   */
  async findByKey(key: string) {
    const setting = await this.prisma.appSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Setting"}`,
      );
    }

    return successResponse(setting);
  }

  /**
   * Batch update settings
   */
  async updateBatch(dto: UpdateSettingsValues, userId: string) {
    const { settings } = dto;

    // Validate all keys exist
    const existingKeys = await this.prisma.appSettings.findMany({
      where: {
        key: { in: settings.map((s) => s.key) },
      },
      select: { key: true },
    });

    const existingKeySet = new Set(existingKeys.map((s) => s.key));
    const invalidKeys = settings.filter((s) => !existingKeySet.has(s.key));

    if (invalidKeys.length > 0) {
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Setting"}: ${invalidKeys.map((k) => k.key).join(', ')}`,
      );
    }

    // Update all settings in a transaction
    await this.prisma.$transaction(
      settings.map((setting) =>
        this.prisma.appSettings.update({
          where: { key: setting.key },
          data: { value: setting.value },
        }),
      ),
    );

    return successResponse({
      updated: settings.length,
      message: `${settings.length} pengaturan berhasil diperbarui`,
    });
  }

  /**
   * Get settings grouped by category (for frontend convenience)
   */
  async findGroupedByCategory() {
    const settings = await this.prisma.appSettings.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    const grouped = settings.reduce(
      (acc, setting) => {
        const category = setting.category as SettingCategoryType;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
      },
      {} as Record<SettingCategoryType, typeof settings>,
    );

    return successResponse(grouped);
  }

  /**
   * Build summary statistics
   */
  private async buildSummary() {
    const [total, categoryCounts] = await Promise.all([
      this.prisma.appSettings.count(),
      this.prisma.appSettings.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    const counts = {
      company: 0,
      tax: 0,
      receipt: 0,
      display: 0,
      general: 0,
    };

    categoryCounts.forEach((c) => {
      const category = c.category as keyof typeof counts;
      if (category in counts) {
        counts[category] = c._count;
      }
    });

    return {
      totalSettings: total,
      categoryCounts: counts,
    };
  }
}
