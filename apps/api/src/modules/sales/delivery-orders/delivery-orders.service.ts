import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateDeliveryOrderValues,
  UpdateDeliveryOrderValues,
  QueryDeliveryOrdersValues,
  UpdateDeliveryStatusValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { Prisma } from '@bizflow/database';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class DeliveryOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all delivery orders with pagination and filter
   */
  async findAll(
    query: QueryDeliveryOrdersValues,
  ): Promise<
    ApiResponse<Prisma.DeliveryOrderGetPayload<object>[]> & { summary?: any }
  > {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      orderId,
      warehouseId,
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { deliveryNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
      ];
    }

    if (status) where.status = status;
    if (orderId) where.orderId = orderId;
    if (warehouseId) where.warehouseId = warehouseId;

    if (query.startDate || query.endDate) {
      where.deliveryDate = {};
      if (query.startDate) where.deliveryDate.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.deliveryDate.lte = end;
      }
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    };

    const [totalItems, deliveryOrders] = await Promise.all([
      this.prisma.deliveryOrder.count({ where }),
      this.prisma.deliveryOrder.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: { select: { id: true, name: true } },
            },
          },
          warehouse: { select: { id: true, code: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy,
        skip,
        take: sizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / sizeNum);
    const summary = await this.buildSummary();

    return paginatedResponse(
      deliveryOrders,
      { page: pageNum, pageSize: sizeNum, totalItems, totalPages },
      summary,
    );
  }

  private async buildSummary() {
    const [total, draft, inTransit, delivered, cancelled] = await Promise.all([
      this.prisma.deliveryOrder.count(),
      this.prisma.deliveryOrder.count({ where: { status: 'draft' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'in_transit' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'delivered' } }),
      this.prisma.deliveryOrder.count({ where: { status: 'cancelled' } }),
    ]);

    return { total, draft, inTransit, delivered, cancelled };
  }

  /**
   * Get a single delivery order by ID
   */
  async findById(
    id: string,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customer: { select: { id: true, name: true, address: true } },
          },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, status: true },
        },
        warehouse: true,
        items: {
          include: {
            orderItem: true,
            variant: {
              include: {
                product: { select: { name: true, sku: true } },
              },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery Order tidak ditemukan');
    }

    return successResponse(deliveryOrder);
  }

  /**
   * Generate next delivery order number
   */
  async generateDeliveryNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const countToday = await this.prisma.deliveryOrder.count({
      where: { deliveryNumber: { startsWith: `DO-${datePrefix}` } },
    });

    let next = countToday + 1;
    let candidate = `DO-${datePrefix}-${next.toString().padStart(3, '0')}`;

    while (
      await this.prisma.deliveryOrder.findUnique({
        where: { deliveryNumber: candidate },
      })
    ) {
      next++;
      candidate = `DO-${datePrefix}-${next.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Create a new delivery order
   */
  async create(
    dto: CreateDeliveryOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    // Verify Sales Order exists and is at least confirmed
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id: dto.orderId },
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales Order tidak ditemukan');
    }

    if (salesOrder.status === 'draft' || salesOrder.status === 'cancelled') {
      throw new BadRequestException(
        'Sales Order harus dalam status confirmed, invoiced, atau completed untuk membuat delivery order',
      );
    }

    // Verify warehouse
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse tidak ditemukan');
    }

    // Verify invoice if provided
    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: dto.invoiceId, orderId: dto.orderId },
      });
      if (!invoice) {
        throw new NotFoundException(
          'Invoice tidak ditemukan atau bukan milik Sales Order ini',
        );
      }
    }

    // Generate delivery number
    let deliveryNumber = dto.deliveryNumber;
    if (!deliveryNumber) {
      deliveryNumber = await this.generateDeliveryNumber();
    } else {
      const existing = await this.prisma.deliveryOrder.findUnique({
        where: { deliveryNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Nomor DO '${deliveryNumber}' sudah digunakan`,
        );
      }
    }

    // Check stock availability per item
    for (const item of dto.items) {
      const stock = await this.prisma.stock.findFirst({
        where: {
          variantId: item.variantId,
          warehouseId: dto.warehouseId,
        },
      });

      const available = stock ? Number(stock.quantity) : 0;
      if (available < Number(item.quantity)) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { name: true } } },
        });
        throw new BadRequestException(
          `Stok tidak mencukupi untuk produk '${variant?.product?.name ?? item.variantId}'. Tersedia: ${available}, diminta: ${item.quantity}`,
        );
      }
    }

    const deliveryOrder = await this.prisma.deliveryOrder.create({
      data: {
        deliveryNumber,
        orderId: dto.orderId,
        invoiceId: dto.invoiceId || null,
        warehouseId: dto.warehouseId,
        deliveryDate: dto.deliveryDate
          ? new Date(dto.deliveryDate as string)
          : new Date(),
        status: 'draft',
        shippingAddress: dto.shippingAddress || salesOrder.notes || null,
        notes: dto.notes,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            orderItemId: item.orderItemId,
            variantId: item.variantId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
        warehouse: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(deliveryOrder);
  }

  /**
   * Update a delivery order (draft only)
   */
  async update(
    id: string,
    dto: UpdateDeliveryOrderValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    const existing = await this.prisma.deliveryOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Delivery Order tidak ditemukan');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Delivery Order dengan status draft yang dapat diedit',
      );
    }

    const updateData: any = {
      deliveryDate: dto.deliveryDate
        ? new Date(dto.deliveryDate as string)
        : undefined,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    };

    if (dto.items) {
      await this.prisma.deliveryOrderItem.deleteMany({
        where: { deliveryId: id },
      });
      updateData.items = {
        create: dto.items.map((item) => ({
          orderItemId: item.orderItemId,
          variantId: item.variantId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    const deliveryOrder = await this.prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
      include: {
        order: { select: { id: true, orderNumber: true } },
        warehouse: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(deliveryOrder);
  }

  /**
   * Update delivery order status with stock deduction on delivered
   */
  async updateStatus(
    id: string,
    dto: UpdateDeliveryStatusValues,
    userId: string,
  ): Promise<ApiResponse<Prisma.DeliveryOrderGetPayload<object>>> {
    const existing = await this.prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        items: true,
        order: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Delivery Order tidak ditemukan');
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[existing.status] || [];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak dapat mengubah status dari '${existing.status}' ke '${dto.status}'`,
      );
    }

    const updateData: any = { status: dto.status };

    // Deduct stock and create StockMovements when delivered
    if (dto.status === 'delivered') {
      updateData.deliveredBy = userId;
      updateData.deliveredAt = new Date();

      for (const item of existing.items) {
        // Deduct stock
        await this.prisma.stock.updateMany({
          where: {
            variantId: item.variantId,
            warehouseId: existing.warehouseId,
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        // Record stock movement
        await this.prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            warehouseId: existing.warehouseId,
            type: 'out',
            quantity: item.quantity,
            referenceType: 'delivery_order',
            referenceId: id,
            notes: `Delivery Order: ${existing.deliveryNumber}`,
            createdBy: userId,
          },
        });
      }
    }

    const deliveryOrder = await this.prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
      include: {
        order: { select: { id: true, orderNumber: true } },
        warehouse: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(deliveryOrder);
  }

  /**
   * Delete a draft delivery order
   */
  async delete(id: string, userId: string) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery Order tidak ditemukan');
    }

    if (deliveryOrder.status !== 'draft') {
      throw new BadRequestException(
        'Hanya Delivery Order dengan status draft yang dapat dihapus',
      );
    }

    await this.prisma.deliveryOrder.delete({ where: { id } });

    return successResponse({
      message: `Delivery Order '${deliveryOrder.deliveryNumber}' berhasil dihapus`,
    });
  }
}
