/**
 * ESC/POS Printer Types
 */

export type PrinterWidth = 58 | 80;
export type PrinterType = 'network' | 'usb';

export interface PrinterConfig {
  id: string;
  name: string;
  type: PrinterType;
  address?: string; // IP:port for network, device path for USB
  width: PrinterWidth;
  isDefault: boolean;
}

export interface ReceiptHeader {
  companyName: string;
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
}

export interface ReceiptPayment {
  method: string;
  amount: number;
  reference?: string;
}

export interface ReceiptData {
  header: ReceiptHeader;
  orderNumber: string;
  orderDate: Date | string;
  cashier: string;
  customer?: {
    name: string;
    phone?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  payments: ReceiptPayment[];
  change?: number;
  footer?: {
    message?: string;
    thankYou?: string;
  };
}
