import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { ServerManager } from './server-manager';
import {
  createSplashWindow,
  closeSplashWindow,
  createMainWindow,
  showMainWindow,
  createLogsWindow,
  getLogsWindow,
} from './windows';
import { createTray, updateTrayStatus, destroyTray } from './tray';
import { ConfigManager } from './config';
import { LogManager } from './log-manager';

let serverManager: ServerManager;
let configManager: ConfigManager;
let logManager: LogManager;
let isQuitting = false;

app.whenReady().then(async () => {
  // Show splash screen
  const splash = createSplashWindow();

  // Initialize config manager
  configManager = new ConfigManager();
  console.log('[CONFIG] Loaded config from', configManager.getConfigPath());

  // Initialize log manager
  logManager = new LogManager();
  console.log('[LOG-MANAGER] Initialized');

  // Initialize server manager with config
  serverManager = new ServerManager(configManager);

  // Create system tray
  const tray = createTray(
    () => {
      // Open browser
      const status = serverManager.getStatus();
      shell.openExternal(status.webUrl);
    },
    async () => {
      // Stop server
      await serverManager.stopAll();
    },
    async () => {
      // Start server
      await serverManager.startAll();
    },
    async () => {
      // Restart server
      await serverManager.restartAll();
    },
  );

  // Listen to server events
  serverManager.on('status-change', (message: string) => {
    console.log('[STATUS]', message);
    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('status-update', message);
    }
  });

  serverManager.on('server-status', (status) => {
    // Update tray
    updateTrayStatus(
      status,
      () => shell.openExternal(status.webUrl),
      async () => await serverManager.stopAll(),
      async () => await serverManager.startAll(),
      async () => await serverManager.restartAll(),
    );

    // Send to main window if it exists
    const wins = BrowserWindow.getAllWindows();
    const mainWindow = wins.find((w) => w.title === 'BizFlow Server');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-status', status);
    }
  });

  serverManager.on('all-started', (status) => {
    console.log('[SUCCESS] All servers started', status);

    // Update tray
    updateTrayStatus(
      status,
      () => shell.openExternal(status.webUrl),
      async () => await serverManager.stopAll(),
      async () => await serverManager.startAll(),
      async () => await serverManager.restartAll(),
    );

    // Close splash and show main window
    setTimeout(() => {
      closeSplashWindow();

      const existingMainWindow = BrowserWindow.getAllWindows().find(
        (w) => w.title === 'BizFlow Server',
      );

      if (!existingMainWindow || existingMainWindow.isDestroyed()) {
        const newMainWindow = createMainWindow();
        // Send initial status to new main window
        newMainWindow.webContents.once('did-finish-load', () => {
          newMainWindow.webContents.send('server-status', status);
        });
      } else {
        // Window already exists, just show it and send update
        existingMainWindow.show();
        existingMainWindow.focus();
        existingMainWindow.webContents.send('server-status', status);
      }
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

// Config IPC handlers
ipcMain.handle('config:get', () => {
  return configManager.getConfig();
});

ipcMain.handle('config:set', (_, key: string, value: any) => {
  configManager.set(key as any, value);
  return { success: true };
});

ipcMain.handle('config:update', (_, updates: any) => {
  configManager.update(updates);
  return { success: true };
});

ipcMain.handle('config:reset', () => {
  configManager.reset();
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
      destroyTray();
      app.quit();
    }, 2000);
  }
});

app.on('window-all-closed', () => {
  // Keep app running in background (system tray)
  // Don't quit unless explicitly requested
  if (isQuitting) {
    app.quit();
  }
});

console.log('BizFlow Desktop Server started 🚀');
