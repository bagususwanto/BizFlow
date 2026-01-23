import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type {
  CreateProductValues,
  UpdateProductValues,
  CreateVariantValues,
  UpdateVariantValues,
  CreatePriceLevelValues,
  UpdatePriceLevelValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

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
   * Calculates total stock across all warehouses and variants
   * Uses raw SQL for efficient database-level pagination and aggregation
   */
  async findLowStock(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    // Base query for low stock products with aggregation
    const baseQuery = `
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      LEFT JOIN UnitOfMeasure u ON p.unitId = u.id
      LEFT JOIN ProductVariant pv ON pv.productId = p.id
      LEFT JOIN Stock s ON s.variantId = pv.id
      WHERE 
        p.isActive = 1 
        AND p.isService = 0 
        AND p.minStock > 0
      GROUP BY p.id
      HAVING COALESCE(SUM(s.quantity), 0) <= p.minStock
    `;

    // Count query for total items
    const countResult = await this.prisma.$queryRawUnsafe<[{ total: bigint }]>(`
      SELECT COUNT(*) as total FROM (
        SELECT p.id ${baseQuery}
      ) as subquery
    `);
    const totalItems = Number(countResult[0]?.total || 0);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Data query with pagination
    const products = await this.prisma.$queryRawUnsafe<
      {
        id: string;
        sku: string;
        name: string;
        minStock: number;
        categoryName: string | null;
        unitSymbol: string | null;
        currentStock: number;
      }[]
    >(`
      SELECT 
        p.id, 
        p.sku, 
        p.name, 
        p.minStock,
        c.name as categoryName,
        u.symbol as unitSymbol,
        COALESCE(SUM(s.quantity), 0) as currentStock
      ${baseQuery}
      ORDER BY p.name ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `);

    return successResponse(
      products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.categoryName ?? '-',
        unit: p.unitSymbol ?? '-',
        minStock: p.minStock,
        currentStock: Number(p.currentStock || 0),
      })),
      {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
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

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Auto-generate SKU if not provided
    let productSku = dto.sku;
    if (!productSku) {
      productSku = await this.generateSku(dto.categoryId);
    } else {
      // Validate unique SKU if provided manually
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existingSku) {
        throw new ConflictException(`Produk dengan SKU ${dto.sku} sudah ada`);
      }
    }

    // Check if unit exists
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id: dto.unitId },
    });

    if (!unit) {
      throw new NotFoundException('Satuan tidak ditemukan');
    }

    const product = await this.prisma.product.create({
      data: {
        sku: productSku,
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

    // Delete old image if imageUrl is being updated
    if (dto.imageUrl !== undefined && dto.imageUrl !== existing.imageUrl) {
      await this.uploadService.deleteProductImage(existing.imageUrl);
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

    // Delete product image if exists
    if (product.imageUrl) {
      await this.uploadService.deleteProductImage(product.imageUrl);
    }

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

  /**
   * ========================================
   * PRODUCT VARIANT METHODS
   * ========================================
   */

  /**
   * Get all variants for a product
   */
  async findVariantsByProduct(productId: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return successResponse(variants);
  }

  /**
   * Get a single variant by ID
   */
  async findVariantById(id: string): Promise<any> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            unit: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    return successResponse(variant);
  }

  /**
   * Generate SKU for new variant
   */
  async generateVariantSku(productId: string): Promise<string> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Find the highest variant number for this product
    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId },
      select: { sku: true },
      orderBy: { createdAt: 'desc' },
    });

    // Extract variant numbers from existing SKUs (e.g., PRD-001-V1 -> 1)
    const variantNumbers = existingVariants
      .map((v) => {
        const match = v.sku.match(/-V(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextNumber =
      variantNumbers.length > 0 ? Math.max(...variantNumbers) + 1 : 1;
    return `${product.sku}-V${nextNumber}`;
  }

  /**
   * Create a new product variant
   */
  async createVariant(
    productId: string,
    dto: CreateVariantValues,
  ): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Auto-generate SKU if not provided
    let variantSku = dto.sku;
    if (!variantSku) {
      // Find the highest variant number for this product
      const existingVariants = await this.prisma.productVariant.findMany({
        where: { productId },
        select: { sku: true },
        orderBy: { createdAt: 'desc' },
      });

      // Extract variant numbers from existing SKUs (e.g., PRD-001-V1 -> 1)
      const variantNumbers = existingVariants
        .map((v) => {
          const match = v.sku.match(/-V(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n > 0);

      const nextNumber =
        variantNumbers.length > 0 ? Math.max(...variantNumbers) + 1 : 1;
      variantSku = `${product.sku}-V${nextNumber}`;
    }

    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: variantSku },
    });

    if (existingSku) {
      throw new ConflictException(`Variant SKU ${variantSku} already exists`);
    }

    if (dto.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(
          `Variant barcode ${dto.barcode} already exists`,
        );
      }
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        sku: variantSku,
        barcode: dto.barcode,
        name: dto.name,
        attributes: JSON.stringify(dto.attributes),
        costPrice: dto.costPrice,
        sellPrice: dto.sellPrice,
        isActive: true,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return successResponse(variant);
  }

  /**
   * Update a product variant
   */
  async updateVariant(id: string, dto: UpdateVariantValues): Promise<any> {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });

      if (existingSku) {
        throw new ConflictException(`Variant SKU ${dto.sku} already exists`);
      }
    }

    if (dto.barcode && dto.barcode !== existing.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(
          `Variant barcode ${dto.barcode} already exists`,
        );
      }
    }

    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.name && { name: dto.name }),
        ...(dto.attributes && { attributes: JSON.stringify(dto.attributes) }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.sellPrice !== undefined && { sellPrice: dto.sellPrice }),
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return successResponse(variant);
  }

  /**
   * Delete a product variant (soft delete)
   */
  async deleteVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        stocks: true,
        salesOrderItems: true,
        purchaseOrderItems: true,
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    const hasStock = variant.stocks.some((stock) => Number(stock.quantity) > 0);
    if (hasStock) {
      throw new BadRequestException(
        'Cannot delete variant with existing stock. Please adjust stock to zero first.',
      );
    }

    if (
      variant.salesOrderItems.length > 0 ||
      variant.purchaseOrderItems.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete variant with existing transactions. Consider deactivating instead.',
      );
    }

    await this.prisma.productVariant.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({ message: 'Variant deactivated successfully' });
  }

  /**
   * Bulk delete product variants (soft delete)
   */
  async bulkDeleteVariants(ids: string[]) {
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: ids } },
      include: {
        stocks: true,
        salesOrderItems: true,
        purchaseOrderItems: true,
      },
    });

    if (variants.length !== ids.length) {
      throw new NotFoundException('One or more variants not found');
    }

    for (const variant of variants) {
      const hasStock = variant.stocks.some(
        (stock) => Number(stock.quantity) > 0,
      );
      if (hasStock) {
        throw new BadRequestException(
          `Cannot delete variant ${variant.name} with existing stock`,
        );
      }

      if (
        variant.salesOrderItems.length > 0 ||
        variant.purchaseOrderItems.length > 0
      ) {
        throw new BadRequestException(
          `Cannot delete variant ${variant.name} with existing transactions`,
        );
      }
    }

    await this.prisma.productVariant.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return successResponse({
      message: `${ids.length} variants deactivated successfully`,
    });
  }

  // ========================================
  // PRICE LEVEL METHODS
  // ========================================

  /**
   * Get all price levels for a product
   */
  async findPriceLevelsByProduct(productId: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const priceLevels = await this.prisma.priceLevel.findMany({
      where: { productId },
      orderBy: { minQty: 'asc' },
    });

    return successResponse(priceLevels);
  }

  /**
   * Get a single price level by ID
   */
  async findPriceLevelById(id: string): Promise<any> {
    const priceLevel = await this.prisma.priceLevel.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (!priceLevel) {
      throw new NotFoundException(`Price level with ID ${id} not found`);
    }

    return successResponse(priceLevel);
  }

  /**
   * Create a new price level
   */
  async createPriceLevel(
    productId: string,
    dto: CreatePriceLevelValues,
  ): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check for duplicate name within the same product
    const existingName = await this.prisma.priceLevel.findUnique({
      where: {
        productId_name: {
          productId,
          name: dto.name,
        },
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Price level with name "${dto.name}" already exists for this product`,
      );
    }

    const priceLevel = await this.prisma.priceLevel.create({
      data: {
        productId,
        name: dto.name,
        minQty: dto.minQty,
        price: dto.price,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return successResponse(priceLevel);
  }

  /**
   * Update a price level
   */
  async updatePriceLevel(
    id: string,
    dto: UpdatePriceLevelValues,
  ): Promise<any> {
    const existing = await this.prisma.priceLevel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Price level with ID ${id} not found`);
    }

    // Check for duplicate name if name is being updated
    if (dto.name && dto.name !== existing.name) {
      const existingName = await this.prisma.priceLevel.findUnique({
        where: {
          productId_name: {
            productId: existing.productId,
            name: dto.name,
          },
        },
      });

      if (existingName) {
        throw new ConflictException(
          `Price level with name "${dto.name}" already exists for this product`,
        );
      }
    }

    const priceLevel = await this.prisma.priceLevel.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.minQty !== undefined && { minQty: dto.minQty }),
        ...(dto.price !== undefined && { price: dto.price }),
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return successResponse(priceLevel);
  }

  /**
   * Delete a price level
   */
  async deletePriceLevel(id: string) {
    const priceLevel = await this.prisma.priceLevel.findUnique({
      where: { id },
    });

    if (!priceLevel) {
      throw new NotFoundException(`Price level with ID ${id} not found`);
    }

    await this.prisma.priceLevel.delete({
      where: { id },
    });

    return successResponse({
      message: `Price level "${priceLevel.name}" deleted successfully`,
    });
  }

  /**
   * Bulk delete price levels
   */
  async bulkDeletePriceLevels(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No price level IDs provided');
    }

    const result = await this.prisma.priceLevel.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return successResponse({
      message: `${result.count} price level(s) deleted successfully`,
    });
  }
}
