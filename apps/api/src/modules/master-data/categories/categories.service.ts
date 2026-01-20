import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type {
  CreateCategoryValues,
  UpdateCategoryValues,
  CategoryTreeNode,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all categories with pagination, filter, and summary
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    isActive?: boolean;
    parentId?: string | null;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      isActive,
      parentId,
    } = query || {};

    const where = this.buildWhereClause(search, isActive, parentId);

    // Build orderBy clause - handle productCount specially
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === 'productCount') {
      orderBy = {
        products: {
          _count: sortOrder,
        },
      };
    }

    // Get total count
    const totalItems = await this.prisma.category.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated categories
    const categories = await this.prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { products: true, children: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map categories
    const mappedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      parent: category.parent,
      isActive: category.isActive,
      productCount: category._count.products,
      childrenCount: category._count.children,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    const summary = await this.buildSummary();

    return paginatedResponse(
      mappedCategories,
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
    isActive?: boolean,
    parentId?: string | null,
  ) {
    const where: {
      OR?: Array<{
        name?: { contains: string };
        description?: { contains: string };
      }>;
      isActive?: boolean;
      parentId?: string | null;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    return where;
  }

  private async buildSummary() {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      rootCategories,
    ] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.category.count({ where: { isActive: false } }),
      this.prisma.category.count({ where: { parentId: null } }),
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      rootCategories,
    };
  }

  /**
   * Get a single category by ID with full details
   */
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
          orderBy: [{ index: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return successResponse({
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      parent: category.parent,
      children: category.children,
      isActive: category.isActive,
      productCount: category._count.products,
      childrenCount: category._count.children,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  /**
   * Get hierarchical tree of categories
   */
  async findTree() {
    // Get all categories with product count
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ index: 'asc' }, { name: 'asc' }],
    });

    // Build tree structure
    const categoryMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // First pass: Create all nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        isActive: cat.isActive,
        productCount: cat._count.products,
        children: [],
      });
    }

    // Second pass: Build tree
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return successResponse(roots);
  }

  /**
   * Get active categories for dropdown/select
   */
  async findActiveList() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ index: 'asc' }, { name: 'asc' }],
    });

    return successResponse(categories);
  }

  /**
   * Create a new category
   */
  async create(dto: CreateCategoryValues, userId: string) {
    // Check duplicate name at same level
    const existingName = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        parentId: dto.parentId ?? null,
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Kategori '${dto.name}' sudah ada di level ini`,
      );
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Kategori parent tidak ditemukan');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
        description: dto.description || null,
        isActive: dto.isActive ?? true,
      },
    });

    return successResponse({
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
  }

  /**
   * Update an existing category
   */
  async update(id: string, dto: UpdateCategoryValues, userId: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Check name uniqueness if changing name
    if (dto.name && dto.name !== existing.name) {
      const existingName = await this.prisma.category.findFirst({
        where: {
          name: dto.name,
          parentId:
            dto.parentId !== undefined ? dto.parentId : existing.parentId,
          NOT: { id },
        },
      });

      if (existingName) {
        throw new ConflictException(
          `Kategori '${dto.name}' sudah ada di level ini`,
        );
      }
    }

    // Validate parent if changing
    if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
      // Prevent setting self as parent
      if (dto.parentId === id) {
        throw new BadRequestException(
          'Kategori tidak dapat menjadi parent dari dirinya sendiri',
        );
      }

      // Prevent circular reference (setting child as parent)
      if (dto.parentId) {
        const isCircular = await this.checkCircularReference(id, dto.parentId);
        if (isCircular) {
          throw new BadRequestException(
            'Tidak dapat memindahkan kategori ke sub-kategori dari dirinya sendiri',
          );
        }

        // Validate parent exists
        const parent = await this.prisma.category.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw new NotFoundException('Kategori parent tidak ditemukan');
        }
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        parentId: dto.parentId !== undefined ? dto.parentId : undefined,
        description:
          dto.description !== undefined ? dto.description : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });

    return successResponse({
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      updatedAt: category.updatedAt,
    });
  }

  /**
   * Check if moving a category would create a circular reference
   */
  private async checkCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = newParentId;

    while (currentId) {
      if (currentId === categoryId) {
        return true;
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parent?.parentId ?? null;
    }

    return false;
  }

  /**
   * Delete (deactivate) a category
   */
  async delete(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // If has children, cannot delete
    if (category._count.children > 0) {
      throw new BadRequestException(
        `Kategori '${category.name}' memiliki ${category._count.children} sub-kategori. Hapus sub-kategori terlebih dahulu.`,
      );
    }

    // Check if category has any products - prevent deletion
    if (category._count.products > 0) {
      // Soft delete (deactivate) instead
      await this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      return successResponse({
        message: `Kategori '${category.name}' dinonaktifkan karena memiliki ${category._count.products} produk`,
      });
    }

    // If no products and no children, we can safely delete
    await this.prisma.category.delete({
      where: { id },
    });

    return successResponse({
      message: `Kategori '${category.name}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete (deactivate) categories
   */
  async bulkDelete(ids: string[], userId: string) {
    // Validate all categories exist
    const categories = await this.prisma.category.findMany({
      where: { id: { in: ids } },
    });

    if (categories.length !== ids.length) {
      throw new NotFoundException('Beberapa kategori tidak ditemukan');
    }

    // Deactivate categories
    const result = await this.prisma.category.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    return successResponse({
      message: `${result.count} kategori berhasil dinonaktifkan`,
    });
  }

  /**
   * Reorder category position
   */
  async reorder(id: string, newParentId: string | null, newIndex: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    const oldParentId = category.parentId;
    const oldIndex = category.index;

    // No change
    if (oldParentId === newParentId && oldIndex === newIndex) {
      return successResponse({ message: 'Posisi kategori tidak berubah' });
    }

    // Check circular reference if parent changed
    if (newParentId && newParentId !== oldParentId) {
      if (newParentId === id) {
        throw new BadRequestException(
          'Kategori tidak dapat menjadi parent dari dirinya sendiri',
        );
      }

      const isCircular = await this.checkCircularReference(id, newParentId);
      if (isCircular) {
        throw new BadRequestException(
          'Tidak dapat memindahkan kategori ke sub-kategori dari dirinya sendiri',
        );
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: newParentId },
      });

      if (!parent) {
        throw new NotFoundException('Kategori parent tidak ditemukan');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Default new index if not provided (append to end)
      // Note: Implementation assumes valid newIndex is passed,
      // but for robustness we could fetch count if newIndex is excessively large.
      // For now, trusting the input.

      if (oldParentId === newParentId) {
        // Same parent reordering
        if (newIndex > oldIndex) {
          // Moved down: Shift items between oldIndex+1 and newIndex UP (decrement index)
          await tx.category.updateMany({
            where: {
              parentId: oldParentId,
              index: { gt: oldIndex, lte: newIndex },
            },
            data: { index: { decrement: 1 } },
          });
        } else {
          // Moved up: Shift items between newIndex and oldIndex-1 DOWN (increment index)
          await tx.category.updateMany({
            where: {
              parentId: oldParentId,
              index: { gte: newIndex, lt: oldIndex },
            },
            data: { index: { increment: 1 } },
          });
        }
      } else {
        // Different parent
        // 1. Close gap in old parent (shift > oldIndex down/decrement to fill gap)
        await tx.category.updateMany({
          where: {
            parentId: oldParentId,
            index: { gt: oldIndex },
          },
          data: { index: { decrement: 1 } },
        });

        // 2. Open gap in new parent (shift >= newIndex up/increment to make room)
        await tx.category.updateMany({
          where: {
            parentId: newParentId,
            index: { gte: newIndex },
          },
          data: { index: { increment: 1 } },
        });
      }

      // 3. Update item
      await tx.category.update({
        where: { id },
        data: {
          parentId: newParentId,
          index: newIndex,
        },
      });
    });

    return successResponse({ message: 'Urutan kategori berhasil diperbarui' });
  }
}
