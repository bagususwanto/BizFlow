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
        images: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: { order: 'asc' },
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
      images: product.images,
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
    const [totalProducts, activeProducts, serviceProducts] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isService: true } }),
    ]);

    return {
      totalProducts,
      activeProducts,
      serviceProducts,
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
        images: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: { order: 'asc' },
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Produk"}`);
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
      images: product.images,
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
        costPrice: true,
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
        costPrice: Number(p.costPrice),
        sellPrice: Number(p.sellPrice),
        unit: p.unit,
      })),
    );
  }

  /**
   * Get active product variants for dropdown/select (for transactions)
   */
  async findActiveVariantsList() {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: {
          isActive: true,
        },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        costPrice: true,
        sellPrice: true,
        product: {
          select: {
            name: true,
            unit: {
              select: {
                symbol: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(
      variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: `${v.product.name} - ${v.name}`,
        variantName: v.name,
        productName: v.product.name,
        costPrice: Number(v.costPrice),
        sellPrice: Number(v.sellPrice),
        unit: v.product.unit,
      })),
    );
  }

  /**
   * Get low stock products (stock less than or equal to minStock)
   * Checks per-variant per-warehouse to match Stock Report logic
   * Returns unique products (grouped by product, not by variant/warehouse)
   */
  /**
   * Get low stock products (stock less than or equal to minStock)
   * Checks per-variant per-warehouse to match Stock Report logic
   * Returns flat list of low stock items
   */
  async findLowStock(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    // Get all stock records where quantity <= product.minStock
    // This matches the Stock Report logic (per-variant-per-warehouse)
    const allLowStocks = await this.prisma.stock.findMany({
      where: {
        variant: {
          product: {
            isActive: true,
            isService: false,
            minStock: { gt: 0 },
          },
        },
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: {
                  select: { name: true },
                },
                unit: {
                  select: { symbol: true },
                },
              },
            },
          },
        },
        warehouse: {
          select: { name: true },
        },
      },
    });

    // Filter where quantity <= minStock (low stock check per warehouse)
    // Map to flat structure suitable for table
    const lowStockRecords = allLowStocks
      .filter((stock) => {
        const quantity = Number(stock.quantity);
        const minStock = Number(stock.variant.product.minStock);
        return quantity <= minStock;
      })
      .map((stock) => ({
        id: stock.variant.productId, // Keep product ID for reference if needed
        variantId: stock.variantId,
        warehouseId: stock.warehouseId,
        sku: stock.variant.sku,
        name: stock.variant.product.name,
        variantName: stock.variant.name,
        warehouseName: stock.warehouse.name,
        category: stock.variant.product.category?.name ?? '-',
        unit: stock.variant.product.unit?.symbol ?? '-',
        minStock: stock.variant.product.minStock,
        currentStock: Number(stock.quantity),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const totalItems = lowStockRecords.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = lowStockRecords.slice(skip, skip + pageSize);

    return successResponse(paginatedData, {
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  }

  /**
   * Create a new product
   */
  async create(dto: CreateProductValues, userId: string) {
    // Check duplicate barcode if provided
    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(`messages.error.conflict|{"name": "Barcode ${dto.barcode}"}`);
      }
    }

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Kategori"}`);
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
        throw new ConflictException(`messages.error.conflict|{"name": "SKU ${dto.sku}"}`);
      }
    }

    // Check if unit exists
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id: dto.unitId },
    });

    if (!unit) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Satuan"}`);
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
        images: {
          create: (dto.images || []).map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
        images: {
          select: { id: true, url: true, order: true },
          orderBy: { order: 'asc' },
        },
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
      images: product.images,
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Produk"}`);
    }

    // Check SKU uniqueness if changing
    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });

      if (existingSku) {
        throw new ConflictException(`messages.error.conflict|{"name": "SKU ${dto.sku}"}`);
      }
    }

    // Check barcode uniqueness if changing
    if (dto.barcode && dto.barcode !== existing.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: { barcode: dto.barcode, NOT: { id } },
      });

      if (existingBarcode) {
        throw new ConflictException(`messages.error.conflict|{"name": "Barcode ${dto.barcode}"}`);
      }
    }

    // Validate category if changing
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`messages.error.notFound|{"name": "Kategori"}`);
      }
    }

    // Validate unit if changing
    if (dto.unitId && dto.unitId !== existing.unitId) {
      const unit = await this.prisma.unitOfMeasure.findUnique({
        where: { id: dto.unitId },
      });

      if (!unit) {
        throw new NotFoundException(`messages.error.notFound|{"name": "Satuan"}`);
      }
    }

    // Handle image updates if provided
    if (dto.images !== undefined) {
      // Get existing images
      const existingImages = await this.prisma.productImage.findMany({
        where: { productId: id },
      });

      const existingUrls = existingImages.map((img) => img.url);
      const newUrls = dto.images;

      // Find images to delete (exist in DB but not in new array)
      const urlsToDelete = existingUrls.filter((url) => !newUrls.includes(url));

      // Find images to add (exist in new array but not in DB)
      const urlsToAdd = newUrls.filter((url) => !existingUrls.includes(url));

      // Delete removed images from storage and database
      for (const url of urlsToDelete) {
        await this.uploadService.deleteProductImage(url);
        await this.prisma.productImage.deleteMany({
          where: { productId: id, url },
        });
      }

      // Add new images
      if (urlsToAdd.length > 0) {
        const maxOrder =
          existingImages.length > 0
            ? Math.max(...existingImages.map((img) => img.order))
            : -1;

        await this.prisma.productImage.createMany({
          data: urlsToAdd.map((url, index) => ({
            productId: id,
            url,
            order: maxOrder + index + 1,
          })),
        });
      }

      // Update order for all images based on new array order
      if (newUrls.length > 0) {
        for (let i = 0; i < newUrls.length; i++) {
          await this.prisma.productImage.updateMany({
            where: { productId: id, url: newUrls[i] },
            data: { order: i },
          });
        }
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
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
        images: {
          select: { id: true, url: true, order: true },
          orderBy: { order: 'asc' },
        },
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
      images: product.images,
      updatedAt: product.updatedAt,
    });
  }

  /**
   * Delete a product - Smart delete: hard delete if unused, soft delete if used in transactions
   */
  async delete(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Produk"}`);
    }

    // Logic:
    // 1. If Active -> Deactivate (Soft Delete)
    // 2. If Inactive -> Try to Hard Delete (check dependencies first)

    if (product.isActive) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `messages.success.deactivated|{"name": "${product.name}"}`,
        isHardDelete: false,
      });
    }

    // If product is inactive, try hard delete
    const isUsedInTransactions = await this.checkProductUsedInTransactions(id);

    if (isUsedInTransactions) {
      throw new ConflictException(
        `messages.error.cannotDeleteHasTransactions|{"name": "${product.name}"}`,
      );
    }

    // Safe to hard delete
    // Delete all product images if exist
    const productImages = await this.prisma.productImage.findMany({
      where: { productId: id },
    });

    for (const img of productImages) {
      await this.uploadService.deleteProductImage(img.url);
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete images
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      // Delete price levels
      await tx.priceLevel.deleteMany({
        where: { productId: id },
      });

      // Delete variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    return successResponse({
      message: `messages.success.deletedPermanent|{"name": "${product.name}"}`,
      isHardDelete: true,
    });
  }

  /**
   * Check if any variant of this product is used in transactions
   */
  private async checkProductUsedInTransactions(
    productId: string,
  ): Promise<boolean> {
    // Get all variant IDs for this product
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });

    if (variants.length === 0) {
      return false;
    }

    const variantIds = variants.map((v) => v.id);

    // Check usage in various transaction tables
    const [
      stockCount,
      stockMovementCount,
      salesOrderItemCount,
      purchaseOrderItemCount,
      stockAdjustmentItemCount,
      stockTransferItemCount,
      stockOpnameItemCount,
    ] = await Promise.all([
      this.prisma.stock.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.stockMovement.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.salesOrderItem.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.purchaseOrderItem.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.stockAdjustmentItem.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.stockTransferItem.count({
        where: { variantId: { in: variantIds } },
      }),
      this.prisma.stockOpnameItem.count({
        where: { variantId: { in: variantIds } },
      }),
    ]);

    return (
      stockCount > 0 ||
      stockMovementCount > 0 ||
      salesOrderItemCount > 0 ||
      purchaseOrderItemCount > 0 ||
      stockAdjustmentItemCount > 0 ||
      stockTransferItemCount > 0 ||
      stockOpnameItemCount > 0
    );
  }

  /**
   * Bulk delete products - Smart delete: hard delete if unused, soft delete if used
   */
  async bulkDelete(ids: string[], userId: string) {
    // Validate all products exist
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Beberapa produk"}`);
    }

    let hardDeleteCount = 0;
    let softDeleteCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      if (product.isActive) {
        // Case 1: Active -> Soft Delete (Deactivate)
        await this.prisma.product.update({
          where: { id: product.id },
          data: { isActive: false },
        });
        softDeleteCount++;
      } else {
        // Case 2: Inactive -> Try Hard Delete
        const isUsed = await this.checkProductUsedInTransactions(product.id);

        if (isUsed) {
          skippedCount++;
        } else {
          // Safe to hard delete
          const productImages = await this.prisma.productImage.findMany({
            where: { productId: product.id },
          });

          for (const img of productImages) {
            await this.uploadService.deleteProductImage(img.url);
          }

          await this.prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({
              where: { productId: product.id },
            });
            await tx.priceLevel.deleteMany({
              where: { productId: product.id },
            });
            await tx.productVariant.deleteMany({
              where: { productId: product.id },
            });
            await tx.product.delete({
              where: { id: product.id },
            });
          });
          hardDeleteCount++;
        }
      }
    }

    const messages: string[] = [];
    if (hardDeleteCount > 0) {
      messages.push(`${hardDeleteCount} produk dihapus permanen`);
    }
    if (softDeleteCount > 0) {
      messages.push(`${softDeleteCount} produk dinonaktifkan`);
    }
    if (skippedCount > 0) {
      messages.push(`${skippedCount} produk dilewati (memiliki transaksi)`);
    }

    return successResponse({
      message: messages.join(', '),
      hardDeleteCount,
      softDeleteCount,
      skippedCount,
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Produk"}`,
      );
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Variant"}`);
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Produk"}`,
      );
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Produk"}`,
      );
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
      throw new ConflictException(`messages.error.conflict|{"name": "SKU ${variantSku}"}`);
    }

    if (dto.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(`messages.error.conflict|{"name": "Barcode ${dto.barcode}"}`);
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
        isActive: dto.isActive ?? true,
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Variant"}`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });

      if (existingSku) {
        throw new ConflictException(`messages.error.conflict|{"name": "SKU ${dto.sku}"}`);
      }
    }

    if (dto.barcode && dto.barcode !== existing.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException(`messages.error.conflict|{"name": "Barcode ${dto.barcode}"}`);
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
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Variant"}`);
    }

    // Logic:
    // 1. If Active -> Deactivate (Soft Delete)
    // 2. If Inactive -> Try to Hard Delete (check dependencies first)

    if (variant.isActive) {
      await this.prisma.productVariant.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `messages.success.deactivated|{"name": "${variant.name}"}`,
        isHardDelete: false,
      });
    }

    // If inactive, check dependencies
    const hasStock = variant.stocks.some((stock) => Number(stock.quantity) > 0);
    if (hasStock) {
      throw new BadRequestException(
        'Tidak dapat menghapus variant dengan stok yang ada. Harap atur stok menjadi nol terlebih dahulu.',
      );
    }

    if (
      variant.salesOrderItems.length > 0 ||
      variant.purchaseOrderItems.length > 0
    ) {
      throw new ConflictException(
        'Tidak dapat menghapus variant dengan transaksi yang ada. Hanya bisa dinonaktifkan.',
      );
    }

    // Safe to hard delete
    await this.prisma.productVariant.delete({
      where: { id },
    });

    return successResponse({
      message: `messages.success.deletedPermanent|{"name": "${variant.name}"}`,
      isHardDelete: true,
    });
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
      throw new NotFoundException(`messages.error.notFound|{"name": "Satu atau lebih variant"}`);
    }

    for (const variant of variants) {
      const hasStock = variant.stocks.some(
        (stock) => Number(stock.quantity) > 0,
      );
      if (hasStock) {
        throw new BadRequestException(
          `Tidak dapat menghapus variant ${variant.name} dengan stok yang ada. Harap atur stok menjadi nol terlebih dahulu.`,
        );
      }

      if (
        variant.salesOrderItems.length > 0 ||
        variant.purchaseOrderItems.length > 0
      ) {
        throw new BadRequestException(
          `Tidak dapat menghapus variant ${variant.name} dengan transaksi yang ada. Harap matikan transaksi terlebih dahulu.`,
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Produk"}`,
      );
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Price level"}`,
      );
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Produk"}`,
      );
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
        `messages.error.conflict|{"name": "Price level ${dto.name}"}`,
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Price level"}`,
      );
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
          `messages.error.conflict|{"name": "Price level ${dto.name}"}`,
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
      throw new NotFoundException(
        `messages.error.notFound|{"name": "Price level"}`,
      );
    }

    await this.prisma.priceLevel.delete({
      where: { id },
    });

    return successResponse({
      message: `messages.success.deleted|{"name": "${priceLevel.name}"}`,
    });
  }

  /**
   * Bulk delete price levels
   */
  async bulkDeletePriceLevels(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Tidak ada price level yang dipilih');
    }

    const result = await this.prisma.priceLevel.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return successResponse({
      message: `messages.success.deleted|{"name": "${result.count} price level(s)"}`,
    });
  }
}
