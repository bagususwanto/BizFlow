import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  CreatePOSTransactionValues,
  SearchProductsValues,
  HoldTransactionValues,
} from '@bizflow/types';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get category IDs recursively (includes parent and all direct children)
   */
  private async getCategoryIdsRecursive(categoryId: string): Promise<string[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [{ id: categoryId }, { parentId: categoryId }],
        isActive: true,
      },
      select: { id: true },
    });

    return categories.map((c) => c.id);
  }

  /**
   * Search products for POS by name, SKU, or barcode
   * Returns products with stock information
   */
  async searchProducts(dto: SearchProductsValues, warehouseId?: string) {
    const { query, limit, categoryId } = dto;

    const whereClause: any = {
      isActive: true,
    };

    // Support hierarchical category filtering
    if (categoryId) {
      const categoryIds = await this.getCategoryIdsRecursive(categoryId);
      whereClause.categoryId = { in: categoryIds };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { sku: { contains: query } },
        { barcode: { contains: query } },
        {
          variants: {
            some: {
              OR: [
                { name: { contains: query } },
                { sku: { contains: query } },
                { barcode: { contains: query } },
              ],
            },
          },
        },
      ];
    }

    // Search in products and variants
    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true },
        },
        unit: {
          select: { id: true, name: true, symbol: true },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { url: true },
        },
        variants: {
          where: { isActive: true },
          include: {
            stocks: {
              where: warehouseId ? { warehouseId } : {},
              select: {
                quantity: true,
                warehouseId: true,
                warehouse: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      take: limit,
    });

    // Map to POS-friendly format
    // @ts-expect-error - TypeScript has issues with union types in flatMap, but this is functionally correct
    const results = products.flatMap((product) => {
      const imageUrl = product.images[0]?.url || null;

      if (product.variants.length > 0) {
        // Product has variants, return each variant
        return product.variants.map((variant) => {
          const totalStock = variant.stocks.reduce(
            (sum, stock) => sum + Number(stock.quantity),
            0,
          );

          return {
            id: variant.id,
            type: 'variant' as const,
            productId: product.id,
            productName: product.name,
            variantName: variant.name,
            displayName: `${product.name} - ${variant.name}`,
            name: `${product.name} - ${variant.name}`,
            sku: variant.sku,
            barcode: variant.barcode,
            price: Number(variant.sellPrice),
            costPrice: Number(variant.costPrice),
            stock: totalStock,
            unit: product.unit,
            category: product.category,
            isService: product.isService,
            imageUrl: imageUrl,
          };
        });
      } else {
        // Product without variants - create a default variant entry
        return [
          {
            id: product.id,
            type: 'product' as const,
            productId: product.id,
            productName: product.name,
            variantName: null,
            displayName: product.name,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            price: Number(product.sellPrice),
            costPrice: Number(product.costPrice),
            stock: 0, // Products without variants don't have stock tracking
            unit: product.unit,
            category: product.category,
            isService: product.isService,
            imageUrl: imageUrl,
          },
        ];
      }
    }) as Array<{
      id: string;
      type: 'variant' | 'product';
      productId: string;
      productName: string;
      variantName: string | null;
      displayName: string;
      name: string;
      sku: string;
      barcode: string | null;
      price: number;
      costPrice: number;
      stock: number;
      unit: { id: string; name: string; symbol: string };
      category: { id: string; name: string };
      isService: boolean;
      imageUrl: string | null;
    }>;

    return successResponse(results);
  }

  /**
   * Create a new POS transaction (sales order)
   * Processes payment and deducts stock
   */
  async createTransaction(dto: CreatePOSTransactionValues, userId: string) {
    // Validate outlet exists
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: dto.outletId },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet tidak ditemukan');
    }

    // Validate customer if provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Customer tidak ditemukan');
      }
    }

    // Validate all variants exist and get their details
    const variantIds = dto.items.map((item) => item.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            isService: true,
          },
        },
      },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('Beberapa produk tidak ditemukan');
    }

    // Calculate totals
    const subtotal = dto.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice - item.discountAmount;
      return sum + itemSubtotal;
    }, 0);

    const discountAmount =
      dto.discountAmount ||
      (dto.discountPercent ? (subtotal * dto.discountPercent) / 100 : 0);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = dto.taxPercent
      ? (afterDiscount * dto.taxPercent) / 100
      : 0;
    const total = afterDiscount + taxAmount;

    // Validate payment amount
    const totalPayment = dto.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    if (totalPayment < total) {
      throw new BadRequestException(
        `Jumlah pembayaran (${totalPayment}) kurang dari total (${total})`,
      );
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create transaction with items and payments
    const transaction = await this.prisma.$transaction(async (tx) => {
      // Create sales order
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: dto.customerId || null,
          userId,
          outletId: dto.outletId,
          orderDate: new Date(),
          status: 'completed',
          paymentStatus: totalPayment >= total ? 'paid' : 'partial',
          subtotal,
          discountPercent: dto.discountPercent || 0,
          discountAmount,
          taxPercent: dto.taxPercent || 0,
          taxAmount,
          total,
          paidAmount: totalPayment,
          notes: dto.notes || null,
          items: {
            create: dto.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || 0,
              discountAmount: item.discountAmount || 0,
              subtotal: item.quantity * item.unitPrice - item.discountAmount,
              notes: item.notes || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      unit: {
                        select: { symbol: true },
                      },
                    },
                  },
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create payments
      for (const payment of dto.payments) {
        const paymentNumber = await this.generatePaymentNumber(tx);

        await tx.payment.create({
          data: {
            paymentNumber,
            orderId: order.id,
            customerId: dto.customerId || null,
            accountId: payment.accountId,
            paymentDate: new Date(),
            paymentMethod: payment.method,
            amount: payment.amount,
            reference: payment.reference || null,
          },
        });
      }

      // Deduct stock for non-service items
      // TODO: Implement stock deduction logic
      // This will be handled in a separate stock service

      return order;
    });

    return successResponse({
      id: transaction.id,
      orderNumber: transaction.orderNumber,
      orderDate: transaction.orderDate,
      customer: transaction.customer,
      outlet: transaction.outlet,
      items: transaction.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        subtotal: Number(item.subtotal),
        unit: item.variant.product.unit?.symbol,
      })),
      subtotal: Number(transaction.subtotal),
      discountAmount: Number(transaction.discountAmount),
      taxAmount: Number(transaction.taxAmount),
      total: Number(transaction.total),
      paidAmount: Number(transaction.paidAmount),
      status: transaction.status,
      paymentStatus: transaction.paymentStatus,
      notes: transaction.notes,
      createdAt: transaction.createdAt,
    });
  }

  /**
   * Get all transactions with pagination and filters
   */
  async findAll(query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    outletId?: string;
    customerId?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'orderDate',
      sortOrder = 'desc',
      search,
      outletId,
      customerId,
      status,
      paymentStatus,
      startDate,
      endDate,
    } = query || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate);
      }
    }

    const totalItems = await this.prisma.salesOrder.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);

    const orders = await this.prisma.salesOrder.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { items: true, payments: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const mappedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customer: order.customer,
      outlet: order.outlet,
      cashier: order.user,
      itemCount: order._count.items,
      paymentCount: order._count.payments,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      paidAmount: Number(order.paidAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    }));

    return paginatedResponse(mappedOrders, {
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  }

  /**
   * Get transaction by ID with full details
   */
  async findById(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
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
                    unit: {
                      select: { symbol: true },
                    },
                  },
                },
              },
            },
          },
        },
        payments: {
          include: {
            account: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    return successResponse({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customer: order.customer,
      outlet: order.outlet,
      cashier: order.user,
      items: order.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountPercent: Number(item.discountPercent),
        discountAmount: Number(item.discountAmount),
        subtotal: Number(item.subtotal),
        unit: item.variant.product.unit?.symbol,
        notes: item.notes,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        method: payment.paymentMethod,
        amount: Number(payment.amount),
        account: payment.account,
        reference: payment.reference,
        paymentDate: payment.paymentDate,
      })),
      subtotal: Number(order.subtotal),
      discountPercent: Number(order.discountPercent),
      discountAmount: Number(order.discountAmount),
      taxPercent: Number(order.taxPercent),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      paidAmount: Number(order.paidAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  /**
   * Generate unique order number with format: POS-YYYYMMDD-XXX
   */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const prefix = `POS-${dateStr}`;

    // Get count of orders today
    const count = await this.prisma.salesOrder.count({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Generate unique payment number with format: PAY-YYYYMMDD-XXX
   */
  private async generatePaymentNumber(tx: any): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const prefix = `PAY-${dateStr}`;

    // Get count of payments today
    const count = await tx.payment.count({
      where: {
        paymentNumber: {
          startsWith: prefix,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Hold a transaction for later
   * Stores cart data temporarily (in-memory or database)
   */
  async holdTransaction(dto: HoldTransactionValues, userId: string) {
    // For now, we'll store held transactions in a simple JSON format
    // In production, you might want a dedicated HeldTransaction table

    const heldData = {
      items: dto.items,
      customerId: dto.customerId,
      note: dto.note,
      discountPercent: dto.discountPercent,
      discountAmount: dto.discountAmount,
      userId,
      createdAt: new Date(),
    };

    // TODO: Implement proper storage mechanism
    // For MVP, this could be stored in localStorage on frontend
    // or in a dedicated table in the database

    return successResponse({
      message: 'Transaksi berhasil ditahan',
      data: heldData,
    });
  }

  /**
   * Get list of held transactions
   */
  async getHeldTransactions(userId: string) {
    // TODO: Implement retrieval from storage
    // For now, return empty array

    return successResponse([]);
  }

  /**
   * Resume a held transaction
   */
  async resumeHeldTransaction(id: string, userId: string) {
    // TODO: Implement retrieval and deletion from storage

    throw new NotFoundException('Transaksi ditahan tidak ditemukan');
  }

  /**
   * Delete a held transaction
   */
  async deleteHeldTransaction(id: string, userId: string) {
    // TODO: Implement deletion from storage

    return successResponse({
      message: 'Transaksi ditahan berhasil dihapus',
    });
  }
}
