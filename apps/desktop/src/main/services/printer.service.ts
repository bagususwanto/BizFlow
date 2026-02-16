import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { buildReceipt, buildTestPage } from '@bizflow/printer';
import type {
  PrintRequest,
  PrinterTestRequest,
  PrintResult,
  SystemPrinter,
  GetPrintersResult,
} from '../types';
import { logger } from '../utils/logger';
import { config } from '../config';

const log = logger.child('PrinterService');

/**
 * Printer Service
 * Handles all thermal printer operations
 */
class PrinterService {
  /**
   * Print receipt to thermal printer
   */
  async printReceipt(request: PrintRequest): Promise<PrintResult> {
    try {
      const { receiptData, printerName, width } = request;

      log.info(`Printing receipt to ${printerName} with width ${width}mm`);

      // Initialize thermal printer
      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Most common, supports STAR too
        interface: `printer:${printerName}`,
        removeSpecialCharacters: false,
        lineCharacter: '-',
      });

      // Build ESC/POS buffer using shared package
      const buffer = buildReceipt(receiptData, width);

      // Send raw buffer to printer
      await printer.raw(buffer);
      await printer.execute();

      log.info('Receipt printed successfully');
      return { success: true };
    } catch (error: any) {
      log.error('Failed to print receipt', error);
      return {
        success: false,
        error: error.message || 'Failed to print receipt',
      };
    }
  }

  /**
   * Test printer connection by printing a test page
   */
  async testPrinter(request: PrinterTestRequest): Promise<PrintResult> {
    try {
      const { printerName, width } = request;

      log.info(`Testing printer ${printerName} with width ${width}mm`);

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `printer:${printerName}`,
      });

      // Build simple test page
      const buffer = buildTestPage(width);

      await printer.raw(buffer);
      await printer.execute();

      log.info('Test page printed successfully');
      return { success: true };
    } catch (error: any) {
      log.error('Failed to test printer', error);
      return {
        success: false,
        error: error.message || 'Failed to test printer',
      };
    }
  }

  /**
   * Get list of available system printers
   */
  async getSystemPrinters(
    webContents: Electron.WebContents,
  ): Promise<GetPrintersResult> {
    try {
      log.info('Retrieving system printers');

      // Use Electron's built-in printer enumeration
      // This works cross-platform (Windows, macOS, Linux)
      // @ts-ignore - getPrinters exists on WebContents at runtime in Electron
      const printers: any[] = webContents.getPrinters();

      // Transform to our expected format
      const formattedPrinters: SystemPrinter[] = printers.map(
        (printer: any) => ({
          name: printer.name,
          displayName: printer.displayName || printer.name,
          description: printer.description || '',
          status: printer.status || 0,
          isDefault: printer.isDefault || false,
          options: printer.options || {},
        }),
      );

      log.info(`Found ${formattedPrinters.length} printers`);

      return {
        success: true,
        printers: formattedPrinters,
      };
    } catch (error: any) {
      log.error('Failed to get system printers', error);
      return {
        success: false,
        error: error.message || 'Failed to get system printers',
        printers: [],
      };
    }
  }

  /**
   * Validate print width
   */
  isValidWidth(width: number): width is 58 | 80 {
    return config.printer.supportedWidths.includes(width as 58 | 80);
  }
}

// Export singleton instance
export const printerService = new PrinterService();
