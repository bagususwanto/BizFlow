import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Server controls
  server: {
    getStatus: () => ipcRenderer.invoke('server:get-status'),
    start: () => ipcRenderer.invoke('server:start'),
    stop: () => ipcRenderer.invoke('server:stop'),
    restart: () => ipcRenderer.invoke('server:restart'),
  },

  // App controls
  app: {
    openBrowser: (url: string) => ipcRenderer.invoke('app:open-browser', url),
    quit: () => ipcRenderer.invoke('app:quit'),
  },

  // Event listeners
  on: {
    statusUpdate: (callback: (message: string) => void) => {
      ipcRenderer.on('status-update', (_, message) => callback(message));
    },
    serverStatus: (callback: (status: any) => void) => {
      ipcRenderer.on('server-status', (_, status) => callback(status));
    },
  },
});
