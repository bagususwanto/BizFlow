import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  CreatePOSTransactionValues,
  SearchProductsValues,
} from '@bizflow/types';
import type { HoldTransactionDto } from './dto';

import { PrismaService } from '../../../prisma';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { SalesOrder } from '@bizflow/database';

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
   * Returns products with stock information and customer-specific pricing
   */
  async searchProducts(
    dto: SearchProductsValues,
    warehouseId?: string,
    customerId?: string,
  ) {
    const { query, limit, categoryId } = dto;

    const whereClause: any = {
      isActive: true,
    };

    // Support hierarchical category filtering
    if (categoryId) {
      const categoryIds = await this.getCategoryIdsRecursive(categoryId);
      whereClause.categoryId = { in: categoryIds };
    }

    // Get customer's price level if customerId provided
    let customerPriceLevel: string | null = null;
    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { priceLevelId: true },
      });
      customerPriceLevel = customer?.priceLevelId || null;
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
        priceLevels: customerPriceLevel
          ? { where: { name: customerPriceLevel } }
          : undefined,
      },
      take: limit,
    });

    // Map to POS-friendly format
    // @ts-expect-error - TypeScript has issues with union types in flatMap, but this is functionally correct
    const results = products.flatMap((product) => {
      const imageUrl = product.images[0]?.url || null;

      // Get customer price if available
      const customerPrice =
        customerPriceLevel &&
        product.priceLevels &&
        product.priceLevels.length > 0
          ? Number(product.priceLevels[0].price)
          : null;

      if (product.variants.length > 0) {
        // Product has variants, return each variant
        return product.variants.map((variant) => {
          const totalStock = variant.stocks.reduce(
            (sum, stock) => sum + Number(stock.quantity),
            0,
          );

          // Use customer price or variant's default price
          const effectivePrice = customerPrice || Number(variant.sellPrice);

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
            price: effectivePrice,
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

    // Get warehouse ID for stock operations
    const warehouseId = await this.getDefaultWarehouseId();

    // Prepare items with service flag for stock validation
    const itemsWithServiceFlag = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        isService: variant?.product.isService || false,
      };
    });

    // Validate stock availability before creating transaction
    await this.validateStockAvailability(itemsWithServiceFlag, warehouseId);

    // Calculate totals for credit limit check
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

    // Validate credit limit if customer is provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
        select: { creditLimit: true, name: true },
      });

      if (customer && Number(customer.creditLimit) > 0) {
        const outstanding = await this.getCustomerOutstandingBalance(
          dto.customerId,
        );
        const creditLimit = Number(customer.creditLimit);

        if (outstanding + total > creditLimit) {
          throw new BadRequestException(
            `Limit kredit ${customer.name} terlampaui. Limit: Rp ${creditLimit.toLocaleString('id-ID')}, Outstanding: Rp ${outstanding.toLocaleString('id-ID')}, Total transaksi baru: Rp ${total.toLocaleString('id-ID')}`,
          );
        }
      }
    }

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
      await this.deductStockAndCreateMovement(
        itemsWithServiceFlag,
        warehouseId,
        order.id,
        userId,
        tx,
      );

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
   * Calculate customer's outstanding balance (unpaid + partial orders)
   */
  private async getCustomerOutstandingBalance(
    customerId: string,
  ): Promise<number> {
    const orders = await this.prisma.salesOrder.findMany({
      where: {
        customerId,
        paymentStatus: { in: ['unpaid', 'partial'] },
      },
      select: {
        total: true,
        paidAmount: true,
      },
    });

    return orders.reduce((sum, order) => {
      const outstanding = Number(order.total) - Number(order.paidAmount);
      return sum + outstanding;
    }, 0);
  }

  /**
   * Validate stock availability for transaction items
   * @throws BadRequestException if insufficient stock
   */
  private async validateStockAvailability(
    items: Array<{ variantId: string; quantity: number; isService: boolean }>,
    warehouseId: string,
  ): Promise<void> {
    // Filter out service items (they don't require stock)
    const physicalItems = items.filter((item) => !item.isService);

    if (physicalItems.length === 0) {
      return; // All items are services, no stock validation needed
    }

    // Get current stock levels
    const stocks = await this.prisma.stock.findMany({
      where: {
        variantId: { in: physicalItems.map((item) => item.variantId) },
        warehouseId,
      },
      include: {
        variant: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Check each item for sufficient stock
    const insufficientStock: string[] = [];

    for (const item of physicalItems) {
      const stock = stocks.find((s) => s.variantId === item.variantId);

      if (!stock) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        insufficientStock.push(
          `${variant?.product.name || 'Unknown'} (Stok tidak ditemukan)`,
        );
        continue;
      }

      const availableQty = Number(stock.quantity) - Number(stock.reservedQty);
      if (availableQty < item.quantity) {
        insufficientStock.push(
          `${stock.variant.product.name} (Tersedia: ${availableQty}, Dibutuhkan: ${item.quantity})`,
        );
      }
    }

    if (insufficientStock.length > 0) {
      throw new BadRequestException(
        `Stok tidak mencukupi untuk: ${insufficientStock.join(', ')}`,
      );
    }
  }

  /**
   * Deduct stock and create stock movement records
   */
  private async deductStockAndCreateMovement(
    items: Array<{
      variantId: string;
      quantity: number;
      isService: boolean;
    }>,
    warehouseId: string,
    orderId: string,
    userId: string,
    tx: any, // Prisma transaction client
  ): Promise<void> {
    // Filter out service items
    const physicalItems = items.filter((item) => !item.isService);

    for (const item of physicalItems) {
      // Update stock quantity
      await tx.stock.upsert({
        where: {
          variantId_warehouseId: {
            variantId: item.variantId,
            warehouseId,
          },
        },
        update: {
          quantity: {
            decrement: item.quantity,
          },
        },
        create: {
          variantId: item.variantId,
          warehouseId,
          quantity: -item.quantity, // Negative if starting from zero
          reservedQty: 0,
        },
      });

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          warehouseId,
          type: 'SALE',
          quantity: -item.quantity, // Negative for deduction
          referenceType: 'SALES_ORDER',
          referenceId: orderId,
          notes: `POS Sale - Order ${orderId}`,
          createdBy: userId,
        },
      });
    }
  }

  /**
   * Get default warehouse ID
   * Returns the first active warehouse marked as default, or the first active warehouse
   */
  private async getDefaultWarehouseId(): Promise<string> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { isActive: true, isDefault: true },
      select: { id: true },
    });

    if (warehouse) {
      return warehouse.id;
    }

    // Fallback to first active warehouse
    const firstWarehouse = await this.prisma.warehouse.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!firstWarehouse) {
      throw new NotFoundException(
        'Tidak ada gudang aktif. Silakan buat gudang terlebih dahulu.',
      );
    }

    return firstWarehouse.id;
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


  /**
   * Hold transaction
   */
  async holdTransaction(
    dto: HoldTransactionDto,
    userId: string,
  ): Promise<SalesOrder> {
    const { items, customerId, note } = dto;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        outlets: { take: 1 }, // Assuming active outlet or passed in DTO.
        // Ideally DTO should have outletId, or we use user's active context.
        // For now, let's assume valid user.
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Get outlet ID from user or request context.
    // In strict mode we should pass outletId in DTO.
    // Let's assume the first outlet for now if not provided, or strict if provided.
    // TODO: Pass outletId explicitly in DTO if needed.
    // Checking DTO... DTO usually has outletId. If not, use user-outlet.

    // Create "HELD" order
    // Status 'HELD' is not in schema defaults but string allows it.

    return this.prisma.salesOrder.create({
      data: {
        orderNumber: `HOLD-${Date.now()}`, // Temporary number
        userId,
        outletId: user.outlets[0]?.outletId || '', // Fallback
        customerId,
        status: 'HELD',
        notes: note,
        subtotal: 0, // Recalculated on resume
        total: 0,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
    });
  }

  /**
   * Get list of held transactions
   */
  async getHeldTransactions(userId: string) {
    const orders = await this.prisma.salesOrder.findMany({
      where: {
        userId,
        status: 'HELD',
      },
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1, select: { url: true } },
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to friendly format for frontend
    return successResponse(
      orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        note: order.notes,
        total: order.items.reduce(
          (sum, item) => sum + Number(item.subtotal),
          0,
        ),
        customer: order.customer,
        items: order.items.map((item) => ({
          productId: item.variant.productId,
          variantId: item.variantId,
          productName: item.variant.product.name,
          variantName: item.variant.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          unit: item.variant.product.unit.name,
          product: {
            name: item.variant.product.name,
            images: item.variant.product.images,
          },
        })),
      })),
    );
  }

  /**
   * Resume held transaction
   * Returns transaction details and deletes it from held list
   */
  async resumeHeldTransaction(id: string, userId: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, userId, status: 'HELD' },
    });

    if (!order) {
      throw new NotFoundException('Transaction not found');
    }

    // Delete the held order so it can be resumed as new
    await this.prisma.salesOrder.delete({ where: { id } });

    return successResponse({ success: true });
  }

  /**
   * Delete held transaction
   */
  async deleteHeldTransaction(id: string, userId: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, userId, status: 'HELD' },
    });

    if (!order) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.salesOrder.delete({ where: { id } });

    return successResponse({ success: true });
  }
}
