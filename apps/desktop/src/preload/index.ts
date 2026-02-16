import { contextBridge, ipcRenderer } from 'electron';
import type {
  PrintRequest,
  PrinterTestRequest,
  PrintResult,
  GetPrintersResult,
} from '../main/types';

/**
 * Preload script - Secure bridge between Renderer and Main process
 * Exposes limited API to web app via contextBridge
 */

/**
 * Electron API exposed to renderer process
 */
export interface ElectronAPI {
  printReceipt: (data: PrintRequest) => Promise<PrintResult>;
  getSystemPrinters: () => Promise<GetPrintersResult>;
  testPrinter: (data: PrinterTestRequest) => Promise<PrintResult>;
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (data: PrintRequest) =>
    ipcRenderer.invoke('print-receipt', data),
  getSystemPrinters: () => ipcRenderer.invoke('get-system-printers'),
  testPrinter: (data: PrinterTestRequest) =>
    ipcRenderer.invoke('test-printer', data),
} as ElectronAPI);

console.log('✅ Electron API exposed to renderer process');

// Type declaration for TypeScript in renderer
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
