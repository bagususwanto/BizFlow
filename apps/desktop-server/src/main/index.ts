import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import * as path from 'path';
import { ServerManager } from './server-manager';
import {
  createSplashWindow,
  closeSplashWindow,
  createMainWindow,
  showMainWindow,
  createLogsWindow,
  getLogsWindow,
  createLicenseWindow,
  getLicenseWindow,
} from './windows';
import { createTray, updateTrayStatus, destroyTray } from './tray';
import { ConfigManager } from './config';
import { LogManager } from './log-manager';
import { BackupManager } from './backup-manager';
import { LicenseManager } from './license-manager';

let serverManager: ServerManager;
let configManager: ConfigManager;
let logManager: LogManager;
let backupManager: BackupManager;
let licenseManager: LicenseManager;
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

  // Initialize backup manager
  const isDev = !app.isPackaged;
  const dbPath = isDev
    ? path.join(__dirname, '../../../../packages/database/prisma/dev.db')
    : path.join(app.getPath('userData'), 'data', 'bizflow.db');

  backupManager = new BackupManager(configManager, dbPath);
  console.log('[BACKUP] Initialized');

  // Start auto-backup if enabled
  if (configManager.get('autoBackup')) {
    backupManager.startAutoBackup();
  }

  // Initialize license manager
  licenseManager = new LicenseManager();
  console.log('[LICENSE] Initialized');

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
    () => {
      // View logs
      createLogsWindow();
    },
    async () => {
      // Backup now
      try {
        await backupManager.createBackup();
        console.log('[BACKUP] Manual backup created from tray');
      } catch (error) {
        console.error('[BACKUP] Manual backup failed:', error);
      }
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
      () => createLogsWindow(),
      async () => {
        try {
          await backupManager.createBackup();
        } catch (error) {
          console.error('[BACKUP] Failed:', error);
        }
      },
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
      () => createLogsWindow(),
      async () => {
        try {
          await backupManager.createBackup();
        } catch (error) {
          console.error('[BACKUP] Failed:', error);
        }
      },
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
    logManager.addLog('ERROR', 'API', error);
  });

  serverManager.on('web-error', (error: string) => {
    console.error('[WEB ERROR]', error);
    logManager.addLog('ERROR', 'WEB', error);
  });

  serverManager.on('api-log', (message: string) => {
    const level = logManager.parseLogLevel(message);
    logManager.addLog(level, 'API', message);
  });

  serverManager.on('web-log', (message: string) => {
    const level = logManager.parseLogLevel(message);
    logManager.addLog(level, 'WEB', message);
  });

  // Forward log events to logs window
  logManager.on('log', (log) => {
    const logsWin = getLogsWindow();
    if (logsWin && !logsWin.isDestroyed()) {
      logsWin.webContents.send('log-update', log);
    }
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

// Logs IPC handlers
ipcMain.handle('logs:getAll', () => {
  return logManager.getAllLogs();
});

ipcMain.handle('logs:filter', (_, options) => {
  return logManager.filter(options);
});

ipcMain.handle('logs:export', async () => {
  const result = await dialog.showSaveDialog({
    title: 'Export Logs',
    defaultPath: `bizflow-logs-${new Date().toISOString().split('T')[0]}.txt`,
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });

  if (!result.canceled && result.filePath) {
    await logManager.exportLogs(result.filePath);
    return { success: true, path: result.filePath };
  }

  return { success: false };
});

ipcMain.handle('logs:clear', () => {
  logManager.clearLogs();
  return { success: true };
});

ipcMain.handle('logs:openFile', () => {
  const filePath = logManager.getLogFilePath();
  shell.openPath(filePath);
  return { success: true };
});

ipcMain.handle('logs:getFilePath', () => {
  return logManager.getLogFilePath();
});

// Backup IPC handlers
ipcMain.handle('backup:create', async (_, customName?: string) => {
  try {
    const backupInfo = await backupManager.createBackup(customName);
    return { success: true, backup: backupInfo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:restore', async (_, backupFilename: string) => {
  try {
    await backupManager.restoreBackup(backupFilename);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:list', async () => {
  try {
    const backups = await backupManager.listBackups();
    return { success: true, backups };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:delete', async (_, backupFilename: string) => {
  try {
    await backupManager.deleteBackup(backupFilename);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:getInfo', () => {
  return {
    backupDir: backupManager.getBackupDir(),
    dbPath: backupManager.getDbPath(),
  };
});

// License IPC handlers
ipcMain.handle('license:activate', async (_, key: string, email: string) => {
  return await licenseManager.activateLicense(key, email);
});

ipcMain.handle('license:deactivate', async () => {
  await licenseManager.deactivateLicense();
  return { success: true };
});

ipcMain.handle('license:getStatus', () => {
  return licenseManager.getLicenseStatus();
});

ipcMain.handle('license:getInfo', () => {
  return licenseManager.getLicenseInfo();
});

ipcMain.handle('license:getDeviceId', () => {
  return licenseManager.getDeviceId();
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
