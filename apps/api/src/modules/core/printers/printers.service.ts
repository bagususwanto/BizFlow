import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type {
  CreatePrinterValues,
  UpdatePrinterValues,
  QueryPrintersValues,
} from '@bizflow/types';
import * as net from 'net';
import { TransactionsService } from '../../pos/transactions/transactions.service';
import { buildReceipt, type ReceiptData } from '@bizflow/printer';

import { PrismaService } from '../../../prisma';
import { successResponse } from '../../../common/utils';

@Injectable()
export class PrintersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Find all printers with optional filters
   */
  async findAll(query?: QueryPrintersValues) {
    const {
      search,
      outletId,
      type,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query || {};

    const where = this.buildWhereClause(search, outletId, type, isActive);

    // Build orderBy based on sortBy and sortOrder
    const orderBy: any[] = [];
    if (sortBy === 'name') {
      orderBy.push({ name: sortOrder });
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: sortOrder });
    } else if (sortBy === 'updatedAt') {
      orderBy.push({ updatedAt: sortOrder });
    }
    // Always add default sorting as secondary
    if (sortBy !== 'name') {
      orderBy.push({ name: 'asc' });
    }

    const printers = await this.prisma.printer.findMany({
      where,
      include: {
        outlet: {
          select: { id: true, name: true },
        },
      },
      orderBy,
    });

    // Calculate summary
    const [total, active, inactive] = await Promise.all([
      this.prisma.printer.count({ where }),
      this.prisma.printer.count({ where: { ...where, isActive: true } }),
      this.prisma.printer.count({ where: { ...where, isActive: false } }),
    ]);

    return {
      data: printers,
      meta: { totalItems: total },
      summary: {
        total,
        active,
        inactive,
      },
    };
  }

  private buildWhereClause(
    search?: string,
    outletId?: string,
    type?: 'network' | 'usb',
    isActive?: boolean,
  ) {
    const where: {
      OR?: Array<{
        name?: { contains: string };
        address?: { contains: string };
      }>;
      outletId?: string;
      type?: 'network' | 'usb';
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (outletId) where.outletId = outletId;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    return where;
  }

  /**
   * Find printer by ID
   */
  async findById(id: string) {
    const printer = await this.prisma.printer.findUnique({
      where: { id },
      include: {
        outlet: {
          select: { id: true, name: true },
        },
      },
    });

    if (!printer) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    return successResponse(printer);
  }

  /**
   * Create new printer
   */
  async create(dto: CreatePrinterValues, userId: string) {
    // If setting as default, unset other defaults in same outlet
    if (dto.isDefault) {
      await this.prisma.printer.updateMany({
        where: { outletId: dto.outletId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const printer = await this.prisma.printer.create({
      data: dto,
      include: {
        outlet: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(printer);
  }

  /**
   * Update printer
   */
  async update(id: string, dto: UpdatePrinterValues, userId: string) {
    const existing = await this.prisma.printer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    // If setting as default, unset other defaults in same outlet
    if (dto.isDefault) {
      await this.prisma.printer.updateMany({
        where: {
          outletId: existing.outletId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const printer = await this.prisma.printer.update({
      where: { id },
      data: dto,
      include: {
        outlet: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(printer);
  }

  /**
   * Delete printer
   */
  async delete(id: string, userId: string) {
    const existing = await this.prisma.printer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    await this.prisma.printer.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  }

  /**
   * Bulk delete printers
   */
  async bulkDelete(ids: string[]) {
    if (!ids.length) {
      return successResponse({ count: 0 });
    }

    const result = await this.prisma.printer.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return successResponse({
      message: `messages.success.deleted|{"name": "${result.count} printer"}`,
      count: result.count,
    });
  }

  /**
   * Get default printer for outlet
   */
  async getDefaultPrinter(outletId: string) {
    const printer = await this.prisma.printer.findFirst({
      where: {
        outletId,
        isDefault: true,
        isActive: true,
      },
    });

    return printer;
  }

  /**
   * Send raw data to network printer
   */
  async sendToNetworkPrinter(
    address: string,
    data: Buffer,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const [host, portStr] = address.split(':');
      const port = parseInt(portStr, 10) || 9100;

      const socket = new net.Socket();
      socket.setTimeout(5000);

      socket.on('connect', () => {
        socket.write(data, (err) => {
          socket.end();
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        });
      });

      socket.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });

      socket.connect(port, host);
    });
  }

  /**
   * Test printer connection
   */
  async testPrint(id: string) {
    const printer = await this.prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    if (printer.type === 'network' && printer.address) {
      // Import dynamically to avoid issues if package not built yet
      const { buildTestPage } = await import('@bizflow/printer');
      const testData = buildTestPage(printer.width as 58 | 80);
      const result = await this.sendToNetworkPrinter(printer.address, testData);

      if (result.success) {
        return successResponse({ printed: true });
      } else {
        throw new Error(`Gagal mengirim ke printer: ${result.error}`);
      }
    } else if (printer.type === 'usb') {
      // USB printing is handled by Electron, return info message
      return successResponse({ type: 'usb', printerId: id });
    }

    throw new Error('Konfigurasi printer tidak valid');
  }

  /**
   * Open cash drawer
   */
  async openCashDrawer(id: string) {
    const printer = await this.prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    if (printer.type === 'network' && printer.address) {
      const { buildCashDrawerCommand } = await import('@bizflow/printer');
      const cmdData = buildCashDrawerCommand();
      const result = await this.sendToNetworkPrinter(printer.address, cmdData);

      if (result.success) {
        return successResponse({ opened: true });
      } else {
        throw new Error(`Gagal membuka cash drawer: ${result.error}`);
      }
    }

    throw new Error('Cash drawer hanya support untuk network printer');
  }

  /**
   * Print transaction receipt
   */
  async printTransaction(id: string, transactionId: string) {
    // 1. Get printer
    const printer = await this.prisma.printer.findUnique({
      where: { id },
      include: { outlet: true },
    });

    if (!printer) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Printer"}`);
    }

    if (printer.type !== 'network') {
      throw new BadRequestException(
        'Server hanya dapat mencetak ke Network Printer. Gunakan Desktop App untuk USB Printer.',
      );
    }

    if (!printer.address) {
      throw new BadRequestException('Alamat IP printer belum dikonfigurasi');
    }

    // 2. Get transaction
    const transactionRes =
      await this.transactionsService.findById(transactionId);
    const transaction = transactionRes.data;

    if (!transaction) {
      throw new NotFoundException(`messages.error.notFound|{"name": "Transaksi"}`);
    }

    // 3. Build receipt data
    const receiptData: ReceiptData = {
      header: {
        companyName: transaction.outlet?.name || 'BizFlow',
        address: transaction.outlet?.address || undefined,
        phone: transaction.outlet?.phone || undefined,
      },
      orderNumber: transaction.orderNumber,
      orderDate: transaction.orderDate,
      cashier: transaction.cashier?.name || 'Kasir',
      customer: transaction.customer
        ? {
            name: transaction.customer.name,
            phone: transaction.customer.phone || undefined,
          }
        : undefined,
      items: transaction.items.map((item: any) => ({
        name: item.variantName
          ? `${item.productName} - ${item.variantName}`
          : item.productName,
        quantity:
          typeof item.quantity === 'number'
            ? item.quantity
            : Number(item.quantity),
        unitPrice:
          typeof item.unitPrice === 'number'
            ? item.unitPrice
            : Number(item.unitPrice),
        subtotal:
          typeof item.subtotal === 'number'
            ? item.subtotal
            : Number(item.subtotal),
        discount:
          typeof item.discountAmount === 'number'
            ? item.discountAmount
            : Number(item.discountAmount),
      })),
      subtotal:
        typeof transaction.subtotal === 'number'
          ? transaction.subtotal
          : Number(transaction.subtotal),
      discount:
        typeof transaction.discountAmount === 'number'
          ? transaction.discountAmount
          : Number(transaction.discountAmount),
      tax:
        typeof transaction.taxAmount === 'number'
          ? transaction.taxAmount
          : Number(transaction.taxAmount),
      total:
        typeof transaction.total === 'number'
          ? transaction.total
          : Number(transaction.total),
      payments: transaction.payments.map((p: any) => ({
        method: p.method,
        amount: typeof p.amount === 'number' ? p.amount : Number(p.amount),
        reference: p.reference || undefined,
      })),
      change: Math.max(
        0,
        (typeof transaction.paidAmount === 'number'
          ? transaction.paidAmount
          : Number(transaction.paidAmount)) -
          (typeof transaction.total === 'number'
            ? transaction.total
            : Number(transaction.total)),
      ),
      footer: {
        message: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan',
        thankYou: 'TERIMA KASIH',
      },
    };

    // 4. Generate ESC/POS commands
    // Import dynamically just in case, or use static import if available (which we added)
    // Using static buildReceipt from import
    const buffer = buildReceipt(receiptData, printer.width as 58 | 80);

    // 5. Send to printer
    const sendResult = await this.sendToNetworkPrinter(printer.address, buffer);

    if (!sendResult.success) {
      throw new BadRequestException(
        `Gagal mencetak: ${sendResult.error || 'Unknown error'}`,
      );
    }

    return successResponse({ message: 'Print job sent successfully' });
  }
}
