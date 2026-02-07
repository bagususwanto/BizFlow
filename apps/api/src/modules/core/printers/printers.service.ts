import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreatePrinterValues,
  UpdatePrinterValues,
  QueryPrintersValues,
} from '@bizflow/types';
import * as net from 'net';

import { PrismaService } from '../../../prisma';
import { successResponse } from '../../../common/utils';

@Injectable()
export class PrintersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all printers with optional filters
   */
  async findAll(query?: QueryPrintersValues) {
    const { outletId, type, isActive } = query || {};

    const where: Record<string, unknown> = {};
    if (outletId) where.outletId = outletId;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const printers = await this.prisma.printer.findMany({
      where,
      include: {
        outlet: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return {
      data: printers,
      meta: { totalItems: printers.length },
    };
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
      throw new NotFoundException(`Printer dengan ID '${id}' tidak ditemukan`);
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
      throw new NotFoundException(`Printer dengan ID '${id}' tidak ditemukan`);
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
      throw new NotFoundException(`Printer dengan ID '${id}' tidak ditemukan`);
    }

    await this.prisma.printer.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
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
      throw new NotFoundException(`Printer dengan ID '${id}' tidak ditemukan`);
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
      throw new NotFoundException(`Printer dengan ID '${id}' tidak ditemukan`);
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
   * Print receipt for a transaction
   */
  async printReceipt(
    transactionId: string,
    printerId?: string,
    outletId?: string,
  ) {
    // Get printer - either specified or default
    let printer;
    if (printerId) {
      printer = await this.prisma.printer.findUnique({
        where: { id: printerId },
      });
    } else if (outletId) {
      printer = await this.getDefaultPrinter(outletId);
    }

    if (!printer) {
      throw new NotFoundException('Printer tidak ditemukan');
    }

    // Get transaction data
    const transaction = await this.prisma.salesOrder.findUnique({
      where: { id: transactionId },
      include: {
        customer: {
          select: { name: true, phone: true },
        },
        outlet: {
          select: { name: true, address: true, phone: true },
        },
        user: {
          select: { name: true },
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    // Build receipt data
    const { buildReceipt } = await import('@bizflow/printer');
    type ReceiptDataType = import('@bizflow/printer').ReceiptData;

    const receiptData: ReceiptDataType = {
      header: {
        companyName: transaction.outlet?.name || 'BizFlow',
        address: transaction.outlet?.address || undefined,
        phone: transaction.outlet?.phone || undefined,
      },
      orderNumber: transaction.orderNumber,
      orderDate: transaction.orderDate,
      cashier: transaction.user?.name || 'Kasir',
      customer: transaction.customer
        ? {
            name: transaction.customer.name,
            phone: transaction.customer.phone || undefined,
          }
        : undefined,
      items: transaction.items.map((item) => ({
        name: item.variant?.product?.name || 'Item',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        discount: Number(item.discountAmount) || undefined,
      })),
      subtotal: Number(transaction.subtotal),
      discount: transaction.discountAmount
        ? Number(transaction.discountAmount)
        : undefined,
      tax: transaction.taxAmount ? Number(transaction.taxAmount) : undefined,
      total: Number(transaction.total),
      payments: transaction.payments.map((p) => ({
        method: p.paymentMethod,
        amount: Number(p.amount),
        reference: p.reference || undefined,
      })),
      change:
        Number(transaction.paidAmount) - Number(transaction.total) > 0
          ? Number(transaction.paidAmount) - Number(transaction.total)
          : undefined,
      footer: {
        thankYou: 'TERIMA KASIH',
      },
    };

    // Build ESC/POS data
    const receiptBuffer = buildReceipt(receiptData, printer.width as 58 | 80);

    // Send to printer
    if (printer.type === 'network' && printer.address) {
      const result = await this.sendToNetworkPrinter(
        printer.address,
        receiptBuffer,
      );

      if (result.success) {
        return successResponse({ printed: true });
      } else {
        throw new Error(`Gagal mencetak struk: ${result.error}`);
      }
    } else if (printer.type === 'usb') {
      // Return data for Electron to handle
      return successResponse({
        type: 'usb',
        printerId: printer.id,
        receiptData: receiptBuffer.toString('base64'),
      });
    }

    throw new Error('Konfigurasi printer tidak valid');
  }
}
