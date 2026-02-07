import { ipcMain } from 'electron';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { buildReceipt, type ReceiptData } from '@bizflow/printer';

/**
 * Register IPC handlers for USB printer operations
 */
export function registerPrinterHandlers() {
  /**
   * Print receipt to USB printer
   */
  ipcMain.handle(
    'print-receipt',
    async (
      event,
      data: {
        receiptData: ReceiptData;
        printerName: string;
        width: 58 | 80;
      },
    ) => {
      try {
        const { receiptData, printerName, width } = data;

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

        return { success: true };
      } catch (error: any) {
        console.error('Print error:', error);
        return {
          success: false,
          error: error.message || 'Failed to print',
        };
      }
    },
  );

  /**
   * Get list of available system printers
   */
  ipcMain.handle('get-system-printers', async () => {
    try {
      // This will list all system printers
      // On Windows: uses win32 API
      // On macOS: uses CUPS
      // On Linux: uses CUPS
      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'printer:dummy', // Dummy interface just to access methods
      });

      // Note: node-thermal-printer doesn't have a built-in method to list printers
      // We'll return a placeholder for now
      // In production, you might want to use 'printer' npm package or platform-specific APIs
      return {
        success: true,
        printers: [], // TODO: Implement actual printer discovery
      };
    } catch (error: any) {
      console.error('Get printers error:', error);
      return {
        success: false,
        error: error.message,
        printers: [],
      };
    }
  });

  /**
   * Test printer connection
   */
  ipcMain.handle(
    'test-printer',
    async (
      event,
      data: {
        printerName: string;
        width: 58 | 80;
      },
    ) => {
      try {
        const { printerName, width } = data;

        const printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: `printer:${printerName}`,
        });

        // Build simple test page
        const { buildTestPage } = await import('@bizflow/printer');
        const buffer = buildTestPage(width);

        await printer.raw(buffer);
        await printer.execute();

        return { success: true };
      } catch (error: any) {
        console.error('Test print error:', error);
        return {
          success: false,
          error: error.message || 'Failed to test print',
        };
      }
    },
  );
}
