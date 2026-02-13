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

  // Config
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (key: string, value: any) =>
      ipcRenderer.invoke('config:set', key, value),
    update: (updates: any) => ipcRenderer.invoke('config:update', updates),
    reset: () => ipcRenderer.invoke('config:reset'),
  },

  // App controls
  app: {
    openBrowser: (url: string) => ipcRenderer.invoke('app:open-browser', url),
    openLogs: () => ipcRenderer.invoke('app:open-logs'),
    openSettings: () => ipcRenderer.invoke('app:open-settings'),
    quit: () => ipcRenderer.invoke('app:quit'),
  },

  // Logs
  logs: {
    getAll: () => ipcRenderer.invoke('logs:getAll'),
    filter: (options: any) => ipcRenderer.invoke('logs:filter', options),
    export: () => ipcRenderer.invoke('logs:export'),
    clear: () => ipcRenderer.invoke('logs:clear'),
    openFile: () => ipcRenderer.invoke('logs:openFile'),
    getFilePath: () => ipcRenderer.invoke('logs:getFilePath'),
  },

  // Backup
  backup: {
    create: (customName?: string) =>
      ipcRenderer.invoke('backup:create', customName),
    restore: (backupFilename: string) =>
      ipcRenderer.invoke('backup:restore', backupFilename),
    list: () => ipcRenderer.invoke('backup:list'),
    delete: (backupFilename: string) =>
      ipcRenderer.invoke('backup:delete', backupFilename),
    getInfo: () => ipcRenderer.invoke('backup:getInfo'),
  },

  // License
  license: {
    activate: (key: string, email: string) =>
      ipcRenderer.invoke('license:activate', key, email),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
    getStatus: () => ipcRenderer.invoke('license:getStatus'),
    getInfo: () => ipcRenderer.invoke('license:getInfo'),
    getDeviceId: () => ipcRenderer.invoke('license:getDeviceId'),
  },

  // Event listeners
  on: {
    statusUpdate: (callback: (message: string) => void) => {
      ipcRenderer.on('status-update', (_, message) => callback(message));
    },
    serverStatus: (callback: (status: any) => void) => {
      ipcRenderer.on('server-status', (_, status) => callback(status));
    },
    logUpdate: (callback: (log: any) => void) => {
      ipcRenderer.on('log-update', (_, log) => callback(log));
    },
  },
});
