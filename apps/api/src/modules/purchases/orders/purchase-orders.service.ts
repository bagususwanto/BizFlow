import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreatePurchaseOrderValues,
  UpdatePurchaseOrderValues,
  QueryPurchaseOrdersValues,
  UpdatePurchaseOrderStatusValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all purchase orders with pagination, filter, and summary
   */
  async findAll(
    query: QueryPurchaseOrdersValues,
  ): Promise<
    ApiResponse<Prisma.PurchaseOrderGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      paymentStatus,
      supplierId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
        { supplier: { code: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, purchaseOrders] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
              goodsReceives: true,
              payments: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
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
      purchaseOrders,
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
    const [
      totalOrders,
      draftOrders,
      pendingApprovalOrders,
      approvedOrders,
      orderedOrders,
      receivedOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.purchaseOrder.count(),
      this.prisma.purchaseOrder.count({ where: { status: 'draft' } }),
      this.prisma.purchaseOrder.count({
        where: { status: 'pending_approval' },
      }),
      this.prisma.purchaseOrder.count({ where: { status: 'approved' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'ordered' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'received' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'completed' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      totalOrders,
      draftOrders,
      pendingApprovalOrders,
      approvedOrders,
      orderedOrders,
      receivedOrders,
      completedOrders,
      cancelledOrders,
    };
  }

  /**
   * Get a single purchase order by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
        goodsReceives: {
          include: {
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        payments: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }

    return successResponse(purchaseOrder);
  }

  /**
   * Generate next purchase order number
   */
  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. "20260218"

    const countToday = await this.prisma.purchaseOrder.count({
      where: { orderNumber: { startsWith: datePrefix } },
    });

    let next = countToday + 1;
    let candidate = `PO-${datePrefix}-${next.toString().padStart(3, '0')}`;

    // Ensure uniqueness
    while (
      await this.prisma.purchaseOrder.findUnique({
        where: { orderNumber: candidate },
      })
    ) {
      next++;
      candidate = `PO-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new purchase order
   */
  async create(
    dto: CreatePurchaseOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    // Generate order number if not provided
    let orderNumber = dto.orderNumber;
    if (!orderNumber) {
      orderNumber = await this.generateOrderNumber();
    } else {
      // Check duplicate order number
      const existingOrder = await this.prisma.purchaseOrder.findUnique({
        where: { orderNumber: dto.orderNumber },
      });
      if (existingOrder) {
        throw new ConflictException(
          `Nomor PO '${dto.orderNumber}' sudah digunakan`,
        );
      }
    }

    // Verify supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier tidak ditemukan');
    }

    // Calculate totals
    const subtotal = dto.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );

    const discountAmount =
      dto.discountPercent && dto.discountPercent > 0
        ? (subtotal * Number(dto.discountPercent)) / 100
        : Number(dto.discountAmount || 0);

    const taxableAmount = subtotal - discountAmount;
    const taxAmount =
      dto.taxPercent && dto.taxPercent > 0
        ? (taxableAmount * Number(dto.taxPercent)) / 100
        : 0;

    const total = taxableAmount + taxAmount;

    // Create purchase order with items
    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: dto.supplierId,
        expectedDate: dto.expectedDate,
        status: dto.status || 'draft',
        paymentStatus: 'unpaid',
        subtotal,
        discountPercent: dto.discountPercent || 0,
        discountAmount,
        taxPercent: dto.taxPercent || 0,
        taxAmount,
        total,
        paidAmount: 0,
        notes: dto.notes,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: Number(item.quantity) * Number(item.unitPrice),
            notes: item.notes,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseOrder);
  }

  /**
   * Update an existing purchase order
   */
  async update(
    id: string,
    dto: UpdatePurchaseOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    const existing = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }

    // Only allow editing draft orders
    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Purchase Order dengan status draft yang dapat diedit',
      );
    }

    // Check duplicate order number if changing
    if (dto.orderNumber && dto.orderNumber !== existing.orderNumber) {
      const existingOrder = await this.prisma.purchaseOrder.findFirst({
        where: { orderNumber: dto.orderNumber, NOT: { id } },
      });
      if (existingOrder) {
        throw new ConflictException(
          `Nomor PO '${dto.orderNumber}' sudah digunakan`,
        );
      }
    }

    // Calculate new totals if items are being updated
    let updateData: any = {
      orderNumber: dto.orderNumber,
      supplierId: dto.supplierId,
      expectedDate: dto.expectedDate,
      notes: dto.notes,
    };

    if (dto.items) {
      const subtotal = dto.items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      );

      const discountAmount =
        dto.discountPercent && dto.discountPercent > 0
          ? (subtotal * Number(dto.discountPercent)) / 100
          : Number(dto.discountAmount || 0);

      const taxableAmount = subtotal - discountAmount;
      const taxAmount =
        dto.taxPercent && dto.taxPercent > 0
          ? (taxableAmount * Number(dto.taxPercent)) / 100
          : 0;

      const total = taxableAmount + taxAmount;

      updateData = {
        ...updateData,
        subtotal,
        discountPercent: dto.discountPercent || 0,
        discountAmount,
        taxPercent: dto.taxPercent || 0,
        taxAmount,
        total,
      };

      // Delete existing items and create new ones
      await this.prisma.purchaseOrderItem.deleteMany({
        where: { orderId: id },
      });

      updateData.items = {
        create: dto.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: Number(item.quantity) * Number(item.unitPrice),
          notes: item.notes,
        })),
      };
    }

    const purchaseOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseOrder);
  }

  /**
   * Update purchase order status
   */
  async updateStatus(
    id: string,
    dto: UpdatePurchaseOrderStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.PurchaseOrderGetPayload<object>>> {
    const existing = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_approval', 'ordered', 'cancelled'],
      pending_approval: ['approved', 'draft', 'cancelled'], // Can be returned to draft (rejected)
      approved: ['ordered', 'cancelled'],
      ordered: ['received', 'cancelled'],
      received: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    let updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (
      dto.status === 'draft' &&
      existing.status === 'pending_approval'
    ) {
      // Clear approval data if rejected back to draft
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }

    const purchaseOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(purchaseOrder);
  }

  /**
   * Delete a purchase order
   */
  async delete(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            goodsReceives: true,
            payments: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }

    // Only allow deleting draft orders
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Purchase Order dengan status draft yang dapat dihapus',
      );
    }

    // Check if has related records
    if (
      purchaseOrder._count.goodsReceives > 0 ||
      purchaseOrder._count.payments > 0
    ) {
      throw new ConflictException(
        'Purchase Order tidak dapat dihapus karena sudah memiliki penerimaan barang atau pembayaran',
      );
    }

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    return successResponse({
      message: `Purchase Order '${purchaseOrder.orderNumber}' berhasil dihapus`,
    });
  }

  /**
   * Bulk delete purchase orders
   */
  async bulkDelete(ids: string[], userId: string) {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: {
            goodsReceives: true,
            payments: true,
          },
        },
      },
    });

    if (purchaseOrders.length !== ids.length) {
      throw new NotFoundException('Beberapa Purchase Order tidak ditemukan');
    }

    let deletedCount = 0;
    let skippedCount = 0;

    for (const order of purchaseOrders) {
      if (order.status !== 'draft') {
        skippedCount++;
        continue;
      }

      if (order._count.goodsReceives > 0 || order._count.payments > 0) {
        skippedCount++;
        continue;
      }

      await this.prisma.purchaseOrder.delete({
        where: { id: order.id },
      });
      deletedCount++;
    }

    const messages: string[] = [];
    if (deletedCount > 0) {
      messages.push(`${deletedCount} Purchase Order dihapus`);
    }
    if (skippedCount > 0) {
      messages.push(
        `${skippedCount} Purchase Order dilewati (bukan draft atau memiliki transaksi)`,
      );
    }

    return successResponse({
      message: messages.join(', '),
      deletedCount,
      skippedCount,
    });
  }
}
