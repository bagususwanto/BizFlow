import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { ServerManager } from './server-manager';
import {
  createSplashWindow,
  closeSplashWindow,
  createMainWindow,
  showMainWindow,
} from './windows';

let serverManager: ServerManager;
let isQuitting = false;

app.whenReady().then(async () => {
  // Show splash screen
  const splash = createSplashWindow();

  // Initialize server manager
  serverManager = new ServerManager();

  // Listen to server events
  serverManager.on('status-change', (message: string) => {
    console.log('[STATUS]', message);
    splash.webContents.send('status-update', message);
  });

  serverManager.on('all-started', (status) => {
    console.log('[SUCCESS] All servers started', status);

    // Close splash and show main window
    setTimeout(() => {
      closeSplashWindow();
      const mainWindow = createMainWindow();

      // Send initial status to main window
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('server-status', status);
      });
    }, 1000);
  });

  serverManager.on('api-error', (error: string) => {
    console.error('[API ERROR]', error);
  });

  serverManager.on('web-error', (error: string) => {
    console.error('[WEB ERROR]', error);
  });

  // Start servers
  try {
    await serverManager.startAll();
  } catch (error) {
    console.error('[STARTUP ERROR]', error);
    splash.webContents.send('status-update', `Error: ${error}`);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      showMainWindow();
    }
  });
});

// IPC Handlers
ipcMain.handle('server:get-status', () => {
  return serverManager.getStatus();
});

ipcMain.handle('server:stop', async () => {
  await serverManager.stopAll();
  return { success: true };
});

ipcMain.handle('server:start', async () => {
  await serverManager.startAll();
  return { success: true };
});

ipcMain.handle('server:restart', async () => {
  await serverManager.restartAll();
  return { success: true };
});

ipcMain.handle('app:open-browser', (_, url: string) => {
  shell.openExternal(url);
  return { success: true };
});

ipcMain.handle('app:quit', () => {
  isQuitting = true;
  app.quit();
});

// Graceful shutdown
app.on('before-quit', async (event) => {
  if (!isQuitting) {
    event.preventDefault();
    isQuitting = true;

    console.log('[SHUTDOWN] Stopping servers...');
    await serverManager.stopAll();

    setTimeout(() => {
      app.quit();
    }, 2000);
  }
});

app.on('window-all-closed', () => {
  // Keep app running in background (system tray)
  // Don't quit on macOS
  if (process.platform !== 'darwin' && !isQuitting) {
    // On Windows/Linux, we'll keep running in tray
    return;
  }
});

console.log('BizFlow Desktop Server started 🚀');
