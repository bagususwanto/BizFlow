import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type {
  CreatePromotionValues,
  UpdatePromotionValues,
  QueryPromotionsValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all promotions with pagination and filters
   */
  async findAll(query?: QueryPromotionsValues): Promise<any> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isActive,
      type,
    } = query || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    const totalItems = await this.prisma.promotion.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    const promotions = await this.prisma.promotion.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const summary = await this.buildSummary();

    return paginatedResponse(
      promotions,
      {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      summary,
    );
  }

  private async buildSummary() {
    const [totalPromotions, activePromotions, inactivePromotions] =
      await Promise.all([
        this.prisma.promotion.count(),
        this.prisma.promotion.count({ where: { isActive: true } }),
        this.prisma.promotion.count({ where: { isActive: false } }),
      ]);

    return {
      totalPromotions,
      activePromotions,
      inactivePromotions,
    };
  }

  /**
   * Get active promotions (for POS)
   */
  async findActive(): Promise<any> {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(promotions);
  }

  /**
   * Get a single promotion by ID
   */
  async findById(id: string): Promise<any> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promo tidak ditemukan');
    }

    return successResponse(promotion);
  }

  /**
   * Create a new promotion
   */
  async create(dto: CreatePromotionValues): Promise<any> {
    // Validate code uniqueness if provided
    if (dto.code) {
      const existing = await this.prisma.promotion.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException(`Kode promo '${dto.code}' sudah digunakan`);
      }
    }

    // Validate dates
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException(
        'Tanggal akhir harus setelah tanggal mulai',
      );
    }

    const promotion = await this.prisma.promotion.create({
      data: {
        code: dto.code || null,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        value: dto.value || null,
        minPurchase: dto.minPurchase || null,
        maxDiscount: dto.maxDiscount || null,
        applyTo: dto.applyTo,
        targetIds: dto.targetIds ? JSON.stringify(dto.targetIds) : null,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse(promotion);
  }

  /**
   * Update an existing promotion
   */
  async update(id: string, dto: UpdatePromotionValues): Promise<any> {
    const existing = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Promo tidak ditemukan');
    }

    // Validate code uniqueness if changing
    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.prisma.promotion.findUnique({
        where: { code: dto.code },
      });

      if (existingCode) {
        throw new ConflictException(`Kode promo '${dto.code}' sudah digunakan`);
      }
    }

    // Validate dates if changing
    const startDate = dto.startDate || existing.startDate;
    const endDate = dto.endDate || existing.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Tanggal akhir harus setelah tanggal mulai',
      );
    }

    const promotion = await this.prisma.promotion.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : undefined,
        name: dto.name,
        description:
          dto.description !== undefined ? dto.description : undefined,
        type: dto.type,
        value: dto.value !== undefined ? dto.value : undefined,
        minPurchase:
          dto.minPurchase !== undefined ? dto.minPurchase : undefined,
        maxDiscount:
          dto.maxDiscount !== undefined ? dto.maxDiscount : undefined,
        applyTo: dto.applyTo,
        targetIds: dto.targetIds ? JSON.stringify(dto.targetIds) : undefined,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive,
      },
    });

    return successResponse(promotion);
  }

  /**
   * Delete (deactivate) a promotion
   */
  async delete(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promo tidak ditemukan');
    }

    if (promotion.isActive) {
      // Soft delete
      await this.prisma.promotion.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Promo '${promotion.name}' berhasil dinonaktifkan`,
      });
    }

    // Hard delete if already inactive
    await this.prisma.promotion.delete({
      where: { id },
    });

    return successResponse({
      message: `Promo '${promotion.name}' berhasil dihapus permanen`,
    });
  }

  /**
   * Calculate best promotion for given items and subtotal
   */
  async calculateBestPromotion(items: any[], subtotal: number) {
    const activePromos = await this.findActive();
    const promos = activePromos.data as any[];

    let bestPromo = null;
    let maxDiscount = 0;

    for (const promo of promos) {
      // Check min purchase
      if (promo.minPurchase && subtotal < Number(promo.minPurchase)) {
        continue;
      }

      // Check applyTo condition
      if (promo.applyTo === 'category' || promo.applyTo === 'product') {
        const targetIds = promo.targetIds ? JSON.parse(promo.targetIds) : [];
        const hasMatch = items.some((item) =>
          promo.applyTo === 'category'
            ? targetIds.includes(item.categoryId)
            : targetIds.includes(item.productId),
        );
        if (!hasMatch) continue;
      }

      // Calculate discount
      let discount = 0;
      if (promo.type === 'percentage') {
        discount = (subtotal * Number(promo.value!)) / 100;
        if (promo.maxDiscount) {
          discount = Math.min(discount, Number(promo.maxDiscount));
        }
      } else if (promo.type === 'fixed') {
        discount = Number(promo.value!);
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromo = promo;
      }
    }

    return { promo: bestPromo, discount: maxDiscount };
  }
}
