import { Injectable } from '@nestjs/common';
import { SalesReportService } from '../sales/sales-report.service';
import { StockReportService } from '../inventory/stock-report.service';
import { QuerySalesReportValues, QueryStockReportValues } from '@bizflow/types';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
  constructor(
    private readonly salesReportService: SalesReportService,
    private readonly stockReportService: StockReportService,
  ) {}

  async exportSalesExcel(query: QuerySalesReportValues) {
    const report = await this.salesReportService.getReport(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add headers
    worksheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 20 },
      { header: 'Date', key: 'orderDate', width: 15 },
      { header: 'Customer', key: 'customerName', width: 20 },
      { header: 'Cashier', key: 'cashierName', width: 20 },
      { header: 'Outlet', key: 'outletName', width: 20 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Discount', key: 'discountAmount', width: 15 },
      { header: 'Tax', key: 'taxAmount', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Add data
    report.details.forEach((order) => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        orderDate: order.orderDate.toISOString().split('T')[0],
        customerName: order.customerName,
        cashierName: order.cashierName,
        outletName: order.outletName,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        total: order.total,
        status: order.status,
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    return workbook.xlsx.writeBuffer();
  }

  async exportSalesPdf(query: QuerySalesReportValues): Promise<Buffer> {
    const report = await this.salesReportService.getReport(query);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('Sales Report', { align: 'center' });
      doc.moveDown();

      // Summary
      doc
        .fontSize(12)
        .text(
          `Total Sales: Rp ${report.summary.totalSales.toLocaleString('id-ID')}`,
        );
      doc.text(`Total Transactions: ${report.summary.totalTransactions}`);
      doc.text(
        `Average per Transaction: Rp ${report.summary.averagePerTransaction.toLocaleString('id-ID')}`,
      );
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Order Number', 50, tableTop, { width: 100 });
      doc.text('Date', 150, tableTop, { width: 80 });
      doc.text('Customer', 230, tableTop, { width: 100 });
      doc.text('Total', 330, tableTop, { width: 80 });

      // Table rows
      let y = tableTop + 20;
      doc.font('Helvetica');
      report.details.forEach((order) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(order.orderNumber, 50, y, { width: 100 });
        doc.text(order.orderDate.toISOString().split('T')[0], 150, y, {
          width: 80,
        });
        doc.text(order.customerName, 230, y, { width: 100 });
        doc.text(`Rp ${order.total.toLocaleString('id-ID')}`, 330, y, {
          width: 80,
        });
        y += 20;
      });

      doc.end();
    });
  }

  async exportStockExcel(query: QueryStockReportValues) {
    const report = await this.stockReportService.getReport(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Report');

    // Add headers
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Variant', key: 'variantName', width: 20 },
      { header: 'Category', key: 'categoryName', width: 20 },
      { header: 'Warehouse', key: 'warehouseName', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Min Stock', key: 'minStock', width: 12 },
      { header: 'Cost Price', key: 'costPrice', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Add data
    report.data.forEach((item) => {
      worksheet.addRow({
        sku: item.sku,
        productName: item.productName,
        variantName: item.variantName,
        categoryName: item.categoryName,
        warehouseName: item.warehouseName,
        quantity: item.quantity,
        minStock: item.minStock,
        costPrice: item.costPrice,
        totalValue: item.totalValue,
        status: item.isOutOfStock
          ? 'Out of Stock'
          : item.isLowStock
            ? 'Low Stock'
            : 'OK',
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    return workbook.xlsx.writeBuffer();
  }

  async exportStockPdf(query: QueryStockReportValues): Promise<Buffer> {
    const report = await this.stockReportService.getReport(query);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('Stock Report', { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(12).text(`Total SKU: ${report.summary.totalSku}`);
      doc.text(
        `Total Stock Value: Rp ${report.summary.totalStockValue.toLocaleString('id-ID')}`,
      );
      doc.text(`Low Stock Count: ${report.summary.lowStockCount}`);
      doc.text(`Out of Stock Count: ${report.summary.outOfStockCount}`);
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('SKU', 50, tableTop, { width: 80 });
      doc.text('Product', 130, tableTop, { width: 150 });
      doc.text('Qty', 280, tableTop, { width: 40 });
      doc.text('Value', 320, tableTop, { width: 80 });

      // Table rows
      let y = tableTop + 20;
      doc.font('Helvetica');
      report.data.forEach((item) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(item.sku, 50, y, { width: 80 });
        doc.text(item.productName, 130, y, { width: 150 });
        doc.text(item.quantity.toString(), 280, y, { width: 40 });
        doc.text(`Rp ${item.totalValue.toLocaleString('id-ID')}`, 320, y, {
          width: 80,
        });
        y += 20;
      });

      doc.end();
    });
  }
}
