import { ipcMain } from 'electron';
import { printerService } from '../services/printer.service';
import type { PrintRequest, PrinterTestRequest } from '../types';
import { logger } from '../utils/logger';

const log = logger.child('PrinterHandlers');

/**
 * Register IPC handlers for printer operations
 */
export function registerPrinterHandlers() {
  log.info('Registering printer IPC handlers');

  /**
   * Handle print receipt request
   */
  ipcMain.handle('print-receipt', async (event, data: PrintRequest) => {
    log.debug('Received print-receipt request', {
      printerName: data.printerName,
      width: data.width,
    });
    return await printerService.printReceipt(data);
  });

  /**
   * Handle get system printers request
   */
  ipcMain.handle('get-system-printers', async (event) => {
    log.debug('Received get-system-printers request');
    return await printerService.getSystemPrinters(event.sender);
  });

  /**
   * Handle test printer request
   */
  ipcMain.handle('test-printer', async (event, data: PrinterTestRequest) => {
    log.debug('Received test-printer request', {
      printerName: data.printerName,
      width: data.width,
    });
    return await printerService.testPrinter(data);
  });

  log.info('Printer IPC handlers registered successfully');
}
