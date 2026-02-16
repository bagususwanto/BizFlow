import type { ReceiptData } from '@bizflow/printer';

/**
 * Application configuration interface
 */
export interface AppConfig {
  window: WindowConfig;
  urls: URLConfig;
  printer: PrinterConfig;
}

/**
 * Window configuration
 */
export interface WindowConfig {
  width: number;
  height: number;
  title: string;
  devTools: boolean;
}

/**
 * URL configuration for development and production
 */
export interface URLConfig {
  dev: string;
  prod: string;
}

/**
 * Printer configuration
 */
export interface PrinterConfig {
  defaultWidth: 58 | 80;
  supportedWidths: Array<58 | 80>;
}

/**
 * Print request data
 */
export interface PrintRequest {
  receiptData: ReceiptData;
  printerName: string;
  width: 58 | 80;
}

/**
 * Printer test request
 */
export interface PrinterTestRequest {
  printerName: string;
  width: 58 | 80;
}

/**
 * System printer information
 */
export interface SystemPrinter {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
  options: Record<string, any>;
}

/**
 * Print operation result
 */
export interface PrintResult {
  success: boolean;
  error?: string;
}

/**
 * Get printers result
 */
export interface GetPrintersResult {
  success: boolean;
  printers: SystemPrinter[];
  error?: string;
}
