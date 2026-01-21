import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { CreateProductValues, UpdateProductValues } from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all products with pagination, filter, and summary
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    isService?: boolean;
    hasLowStock?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      categoryId,
      isActive,
      isService,
      hasLowStock,
    } = query || {};

    const where = this.buildWhereClause(
      search,
      categoryId,
      isActive,
      isService,
      hasLowStock,
    );

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = { [sortBy]: sortOrder };

    // Get total count
    const totalItems = await this.prisma.product.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
        _count: {
          select: { variants: true, priceLevels: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map products
    const mappedProducts = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      category: product.category,
      unitId: product.unitId,
      unit: product.unit,
      costPrice: Number(product.costPrice),
      sellPrice: Number(product.sellPrice),
      minStock: product.minStock,
      isActive: product.isActive,
      isService: product.isService,
      imageUrl: product.imageUrl,
      variantCount: product._count.variants,
      priceLevelCount: product._count.priceLevels,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedProducts,
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
    categoryId?: string,
    isActive?: boolean,
    isService?: boolean,
    hasLowStock?: boolean,
  ) {
    const where: {
      OR?: Array<{
        name?: { contains: string };
        sku?: { contains: string };
        barcode?: { contains: string };
        description?: { contains: string };
      }>;
      categoryId?: string;
      isActive?: boolean;
      isService?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isService !== undefined) {
      where.isService = isService;
    }

    // Low stock filter is handled separately since it needs raw SQL or special logic
    // For now we'll handle it in application layer if needed

    return where;
  }

  private async buildSummary() {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      serviceProducts,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: false } }),
      this.prisma.product.count({ where: { isService: true } }),
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM Product 
        WHERE isActive = 1 AND isService = 0 AND minStock > 0
      `.then((result) => Number(result[0]?.count || 0)),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      serviceProducts,
      lowStockProducts,
    };
  }

  /**
   * Get a single product by ID with full details
   */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            barcode: true,
            name: true,
            attributes: true,
            costPrice: true,
            sellPrice: true,
            isActive: true,
          },
          orderBy: { name: 'asc' },
        },
        priceLevels: {
          select: {
            id: true,
            name: true,
            minQty: true,
            price: true,
          },
          orderBy: { minQty: 'asc' },
        },
        _count: {
          select: { variants: true, priceLevels: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return successResponse({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      category: product.category,
      unitId: product.unitId,
      unit: product.unit,
      costPrice: Number(product.costPrice),
      sellPrice: Number(product.sellPrice),
      minStock: product.minStock,
      isActive: product.isActive,
      isService: product.isService,
      imageUrl: product.imageUrl,
      variants: product.variants.map((v) => ({
        ...v,
        costPrice: Number(v.costPrice),
        sellPrice: Number(v.sellPrice),
      })),
      priceLevels: product.priceLevels.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
      variantCount: product._count.variants,
      priceLevelCount: product._count.priceLevels,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  /**
   * Get active products for dropdown/select
   */
  async findActiveList() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        name: true,
        sellPrice: true,
        unit: {
          select: {
            symbol: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(
      products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        sellPrice: Number(p.sellPrice),
        unit: p.unit,
      })),
    );
  }

  /**
   * Get low stock products (stock less than minStock)
   */
  async findLowStock() {
    // For products without variants, we need to check Stock table
    // For now, return products where minStock > 0 that need attention
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        isService: false,
        minStock: { gt: 0 },
      },
      include: {
        category: {
          select: { name: true },
        },
        unit: {
          select: { symbol: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(
      products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category?.name,
        unit: p.unit?.symbol,
        minStock: p.minStock,
        // Current stock would need to be joined from Stock table
        // This is a simplified version
      })),
    );
  }

  /**
   * Create a new product
   */
  async create(dto: CreateProductValues, userId: string) {
    // Check duplicate SKU
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new ConflictException(`SKU '${dto.sku}' sudah digunakan`);
    }

    // Check duplicate barcode if provided
    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(`Barcode '${dto.barcode}' sudah digunakan`);
      }
    }

    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Validate unit exists
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id: dto.unitId },
    });

    if (!unit) {
      throw new NotFoundException('Satuan tidak ditemukan');
    }

    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        barcode: dto.barcode || null,
        name: dto.name,
        description: dto.description || null,
        categoryId: dto.categoryId,
        unitId: dto.unitId,
        costPrice: dto.costPrice,
        sellPrice: dto.sellPrice,
        minStock: dto.minStock ?? 0,
        isService: dto.isService ?? false,
        isActive: dto.isActive ?? true,
        imageUrl: dto.imageUrl || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
      },
    });

    return successResponse({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      costPrice: Number(product.costPrice),
      sellPrice: Number(product.sellPrice),
      minStock: product.minStock,
      isService: product.isService,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
    });
  }

  /**
   * Update an existing product
   */
  async update(id: string, dto: UpdateProductValues, userId: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Check SKU uniqueness if changing
    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });

      if (existingSku) {
        throw new ConflictException(`SKU '${dto.sku}' sudah digunakan`);
      }
    }

    // Check barcode uniqueness if changing
    if (dto.barcode && dto.barcode !== existing.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: { barcode: dto.barcode, NOT: { id } },
      });

      if (existingBarcode) {
        throw new ConflictException(`Barcode '${dto.barcode}' sudah digunakan`);
      }
    }

    // Validate category if changing
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
    }

    // Validate unit if changing
    if (dto.unitId && dto.unitId !== existing.unitId) {
      const unit = await this.prisma.unitOfMeasure.findUnique({
        where: { id: dto.unitId },
      });

      if (!unit) {
        throw new NotFoundException('Satuan tidak ditemukan');
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        sku: dto.sku !== undefined ? dto.sku : undefined,
        barcode: dto.barcode !== undefined ? dto.barcode : undefined,
        name: dto.name !== undefined ? dto.name : undefined,
        description:
          dto.description !== undefined ? dto.description : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        unitId: dto.unitId !== undefined ? dto.unitId : undefined,
        costPrice: dto.costPrice !== undefined ? dto.costPrice : undefined,
        sellPrice: dto.sellPrice !== undefined ? dto.sellPrice : undefined,
        minStock: dto.minStock !== undefined ? dto.minStock : undefined,
        isService: dto.isService !== undefined ? dto.isService : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
      },
    });

    return successResponse({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      costPrice: Number(product.costPrice),
      sellPrice: Number(product.sellPrice),
      minStock: product.minStock,
      isService: product.isService,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      updatedAt: product.updatedAt,
    });
  }

  /**
   * Delete (deactivate) a product
   */
  async delete(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { variants: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Check if product has been used in any transactions
    // For now, we'll just soft delete
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({
      message: `Produk '${product.name}' berhasil dinonaktifkan`,
    });
  }

  /**
   * Bulk delete (deactivate) products
   */
  async bulkDelete(ids: string[], userId: string) {
    // Validate all products exist
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      throw new NotFoundException('Beberapa produk tidak ditemukan');
    }

    // Deactivate products
    const result = await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return successResponse({
      message: `${result.count} produk berhasil dinonaktifkan`,
    });
  }

  /**
   * Generate SKU untuk produk baru
   */
  async generateSku(categoryId?: string): Promise<string> {
    let prefix = 'PRD';

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });

      if (category) {
        // Take first 3 characters of category name
        prefix = category.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 3)
          .toUpperCase();
      }
    }

    // Get count of products with similar prefix
    const count = await this.prisma.product.count({
      where: {
        sku: { startsWith: prefix },
      },
    });

    // Generate SKU: PREFIX-XXXX (4 digit number)
    let sequenceNumber = count + 1;
    let sku = `${prefix}-${String(sequenceNumber).padStart(4, '0')}`;
    let isUnique = false;
    let attempts = 0;

    // Retry loop to ensure uniqueness (max 5 attempts)
    while (!isUnique && attempts < 5) {
      const existing = await this.prisma.product.findUnique({
        where: { sku },
      });

      if (!existing) {
        isUnique = true;
      } else {
        sequenceNumber++;
        sku = `${prefix}-${String(sequenceNumber).padStart(4, '0')}`;
        attempts++;
      }
    }

    if (!isUnique) {
      // Fallback: use timestamp if sequence fails
      sku = `${prefix}-${Date.now().toString().slice(-6)}`;
    }

    return sku;
  }
}
