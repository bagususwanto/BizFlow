import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script - Secure bridge between Renderer and Main process
 * Exposes limited API to web app via contextBridge
 */

export interface ElectronAPI {
  printReceipt: (data: {
    receiptData: any;
    printerName: string;
    width: 58 | 80;
  }) => Promise<{ success: boolean; error?: string }>;

  getSystemPrinters: () => Promise<{
    success: boolean;
    printers: string[];
    error?: string;
  }>;

  testPrinter: (data: {
    printerName: string;
    width: 58 | 80;
  }) => Promise<{ success: boolean; error?: string }>;
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (data: any) => ipcRenderer.invoke('print-receipt', data),
  getSystemPrinters: () => ipcRenderer.invoke('get-system-printers'),
  testPrinter: (data: any) => ipcRenderer.invoke('test-printer', data),
} as ElectronAPI);

console.log('✅ Electron API exposed to renderer process');

// Type declaration for TypeScript in renderer
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
