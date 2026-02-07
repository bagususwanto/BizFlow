import type { PrinterWidth, ReceiptData } from './types';
import * as CMD from './commands';

/**
 * ESC/POS Receipt Builder
 * Generates raw ESC/POS commands for thermal printers
 */
export class EscPosBuilder {
  private buffer: Buffer[] = [];
  private charWidth: number;

  constructor(width: PrinterWidth = 58) {
    // Character width: 58mm = 32 chars, 80mm = 48 chars (for typical fonts)
    this.charWidth = width === 58 ? 32 : 48;
    this.init();
  }

  /**
   * Initialize printer
   */
  init(): this {
    this.buffer.push(CMD.INIT);
    return this;
  }

  /**
   * Add text with optional formatting
   */
  text(content: string): this {
    this.buffer.push(Buffer.from(content, 'utf8'));
    return this;
  }

  /**
   * Add new line
   */
  newLine(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(CMD.FEED_LINE);
    }
    return this;
  }

  /**
   * Set text alignment
   */
  align(alignment: 'left' | 'center' | 'right'): this {
    switch (alignment) {
      case 'left':
        this.buffer.push(CMD.ALIGN_LEFT);
        break;
      case 'center':
        this.buffer.push(CMD.ALIGN_CENTER);
        break;
      case 'right':
        this.buffer.push(CMD.ALIGN_RIGHT);
        break;
    }
    return this;
  }

  /**
   * Set bold text
   */
  bold(on = true): this {
    this.buffer.push(on ? CMD.TEXT_BOLD_ON : CMD.TEXT_BOLD_OFF);
    return this;
  }

  /**
   * Set double size text
   */
  doubleSize(on = true): this {
    this.buffer.push(on ? CMD.TEXT_DOUBLE_SIZE : CMD.TEXT_NORMAL);
    return this;
  }

  /**
   * Reset text formatting
   */
  resetStyle(): this {
    this.buffer.push(CMD.TEXT_NORMAL);
    return this;
  }

  /**
   * Print a separator line
   */
  separator(char = '-'): this {
    this.buffer.push(Buffer.from(char.repeat(this.charWidth), 'utf8'));
    this.newLine();
    return this;
  }

  /**
   * Print dashed separator
   */
  dashedLine(): this {
    return this.separator('-');
  }

  /**
   * Print two-column line (left and right aligned)
   */
  twoColumn(left: string, right: string): this {
    const spaces = this.charWidth - left.length - right.length;
    if (spaces > 0) {
      this.text(left + ' '.repeat(spaces) + right);
    } else {
      // Truncate left if too long
      const truncatedLeft = left.substring(
        0,
        this.charWidth - right.length - 1,
      );
      this.text(truncatedLeft + ' ' + right);
    }
    this.newLine();
    return this;
  }

  /**
   * Cut paper
   */
  cut(partial = false): this {
    this.newLine(3);
    this.buffer.push(partial ? CMD.CUT_PAPER_PARTIAL : CMD.CUT_PAPER);
    return this;
  }

  /**
   * Open cash drawer
   */
  cashDrawer(): this {
    this.buffer.push(CMD.CASH_DRAWER_KICK);
    return this;
  }

  /**
   * Build and return the complete buffer
   */
  build(): Buffer {
    return Buffer.concat(this.buffer);
  }

  /**
   * Get buffer as hex string (for debugging)
   */
  toHex(): string {
    return this.build().toString('hex');
  }
}

/**
 * Format number as Indonesian currency
 */
function formatCurrency(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date for receipt
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID');
}

/**
 * Format time for receipt
 */
function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Build a complete receipt
 */
export function buildReceipt(
  data: ReceiptData,
  width: PrinterWidth = 58,
): Buffer {
  const builder = new EscPosBuilder(width);

  // Header
  builder
    .align('center')
    .doubleSize(true)
    .text(data.header.companyName)
    .newLine()
    .doubleSize(false)
    .resetStyle();

  if (data.header.address) {
    builder.align('center').text(data.header.address).newLine();
  }
  if (data.header.phone) {
    builder.align('center').text(`Telp: ${data.header.phone}`).newLine();
  }

  builder.newLine().dashedLine();

  // Order info
  builder
    .align('left')
    .twoColumn(`No: ${data.orderNumber}`, formatTime(data.orderDate))
    .twoColumn(`Kasir: ${data.cashier}`, formatDate(data.orderDate));

  if (data.customer) {
    builder.text(`Customer: ${data.customer.name}`).newLine();
  }

  builder.dashedLine();

  // Items
  for (const item of data.items) {
    builder.bold(true).text(item.name).newLine().bold(false);
    builder.twoColumn(
      `  ${item.quantity} x ${formatCurrency(item.unitPrice)}`,
      formatCurrency(item.subtotal),
    );
    if (item.discount && item.discount > 0) {
      builder.twoColumn('  Diskon', `-${formatCurrency(item.discount)}`);
    }
  }

  builder.dashedLine();

  // Totals
  builder.twoColumn('Subtotal', formatCurrency(data.subtotal));
  if (data.discount && data.discount > 0) {
    builder.twoColumn('Diskon', `-${formatCurrency(data.discount)}`);
  }
  if (data.tax && data.tax > 0) {
    builder.twoColumn('Pajak', formatCurrency(data.tax));
  }

  builder.separator('=');
  builder.bold(true).twoColumn('TOTAL', formatCurrency(data.total)).bold(false);
  builder.separator('=');

  // Payments
  for (const payment of data.payments) {
    const label = `Bayar (${payment.method})`;
    builder.twoColumn(label, formatCurrency(payment.amount));
  }

  if (data.change && data.change > 0) {
    builder.dashedLine();
    builder
      .bold(true)
      .twoColumn('Kembali', formatCurrency(data.change))
      .bold(false);
  }

  builder.newLine();

  // Footer
  builder.align('center').bold(true).text('TERIMA KASIH').newLine().bold(false);

  if (data.footer?.message) {
    builder.text(data.footer.message).newLine();
  }

  builder.cut();

  return builder.build();
}

/**
 * Build a test print page
 */
export function buildTestPage(width: PrinterWidth = 58): Buffer {
  const builder = new EscPosBuilder(width);

  builder
    .align('center')
    .doubleSize(true)
    .text('TEST PRINT')
    .newLine()
    .doubleSize(false)
    .resetStyle()
    .newLine()
    .text(`Width: ${width}mm`)
    .newLine()
    .text(new Date().toLocaleString('id-ID'))
    .newLine()
    .newLine()
    .separator('-')
    .text('Normal text')
    .newLine()
    .bold(true)
    .text('Bold text')
    .newLine()
    .bold(false)
    .align('left')
    .text('Left aligned')
    .newLine()
    .align('right')
    .text('Right aligned')
    .newLine()
    .align('center')
    .newLine()
    .text('Printer OK!')
    .newLine()
    .cut();

  return builder.build();
}

/**
 * Build cash drawer open command
 */
export function buildCashDrawerCommand(): Buffer {
  return CMD.CASH_DRAWER_KICK;
}
