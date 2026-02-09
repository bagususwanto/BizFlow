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
  ipcMain.handle('get-system-printers', async (event) => {
    try {
      // Use Electron's built-in printer enumeration
      // This works cross-platform (Windows, macOS, Linux)
      // @ts-ignore - getPrinters exists on WebContents at runtime in Electron
      const printers = event.sender.getPrinters();

      // Transform to our expected format
      const formattedPrinters = printers.map((printer: any) => ({
        name: printer.name,
        displayName: printer.displayName || printer.name,
        description: printer.description || '',
        status: printer.status || 0,
        isDefault: printer.isDefault || false,
        options: printer.options || {},
      }));

      return {
        success: true,
        printers: formattedPrinters,
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
