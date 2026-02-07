import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { registerPrinterHandlers } from './printer';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for node-thermal-printer
    },
    title: 'BizFlow POS',
  });

  // Load the web app
  // In development: localhost:3000 (when not packaged)
  // In production: packaged files
  const isDev = !app.isPackaged;
  const url = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, '../../web/index.html')}`;

  mainWindow.loadURL(url);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Register IPC handlers
  registerPrinterHandlers();

  // Create window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('BizFlow Desktop App started 🚀');
