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
  createSettingsWindow,
  getSettingsWindow,
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

  // Listen for config changes
  configManager.on('change', (changes, config) => {
    console.log('[CONFIG] Settings changed:', Object.keys(changes));

    // Handle Auto Start
    if ('autoStart' in changes) {
      app.setLoginItemSettings({
        openAtLogin: config.autoStart,
        openAsHidden: config.startMinimized,
      });
      console.log('[CONFIG] Auto-start updated:', config.autoStart);
    }

    // Handle Backup Settings
    if (
      'autoBackup' in changes ||
      'backupInterval' in changes ||
      'backupRetention' in changes
    ) {
      console.log('[CONFIG] Backup settings changed, restarting scheduler...');
      if (config.autoBackup) {
        backupManager.startAutoBackup();
      } else {
        backupManager.stopAutoBackup();
      }
    }

    // Handle Theme (Send to all windows)
    if ('theme' in changes) {
      const wins = BrowserWindow.getAllWindows();
      wins.forEach((win) => {
        win.webContents.send('theme-update', config.theme);
      });
    }

    // Handle Language (Send to all windows)
    if ('language' in changes) {
      const wins = BrowserWindow.getAllWindows();
      wins.forEach((win) => {
        win.webContents.send('language-update', config.language);
      });

      // Update Tray Language
      const status = serverManager.getStatus();
      updateTrayStatus(
        status,
        () => shell.openExternal(status.webUrl),
        async () => await serverManager.stopAll(),
        async () => await serverManager.startAll(),
        async () => await serverManager.restartAll(),
        () => createLogsWindow(),
        handleManualBackup,
        config.language,
      );
    }

    // Handle Ports (Require restart)
    if ('apiPort' in changes || 'webPort' in changes) {
      dialog
        .showMessageBox({
          type: 'info',
          title: 'Restart Required',
          message:
            'Port settings have been changed. You need to restart the server for these changes to take effect.',
          buttons: ['Restart Now', 'Later'],
        })
        .then((result) => {
          if (result.response === 0) {
            app.relaunch();
            app.exit(0);
          }
        });
    }
  });

  // Helper for manual backup
  const handleManualBackup = async () => {
    try {
      console.log('[BACKUP_DEBUG] Starting manual backup...');
      const backupInfo = await backupManager.createBackup();
      console.log('[BACKUP_DEBUG] Backup created:', backupInfo);

      console.log('[BACKUP_DEBUG] Showing success dialog...');
      const result = await dialog.showMessageBox({
        type: 'info',
        title: 'Backup Successful',
        message: `Backup telah berhasil dibuat!`,
        detail: `File: ${backupInfo.filename}\nUkuran: ${(backupInfo.size / 1024 / 1024).toFixed(2)} MB`,
        buttons: ['OK', 'Buka Folder'],
        defaultId: 0,
        noLink: true,
        normalizeAccessKeys: true,
      });

      if (result.response === 1) {
        shell.openPath(backupManager.getBackupDir());
      }
    } catch (error) {
      console.error('[BACKUP] Manual backup failed:', error);
      dialog.showErrorBox(
        'Backup Failed',
        `Gagal membuat backup:\n\n${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

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
    handleManualBackup,
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
      handleManualBackup,
      configManager.get('language'),
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
      handleManualBackup,
      configManager.get('language'),
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
    // Add timeout safety net (60 seconds)
    const startupTimeout = setTimeout(() => {
      console.error('[STARTUP TIMEOUT] Server startup took too long');
      closeSplashWindow();
      dialog.showErrorBox(
        'Startup Timeout',
        'Server startup took too long. Please check the logs for details.',
      );
    }, 60000);

    await serverManager.startAll();
    clearTimeout(startupTimeout);
  } catch (error) {
    console.error('[STARTUP ERROR]', error);
    closeSplashWindow();

    // Show error dialog to user
    const errorMessage = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox(
      'Server Startup Failed',
      `Failed to start servers:\n\n${errorMessage}\n\nPlease check the logs for more details.`,
    );
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

ipcMain.handle('app:open-logs', () => {
  createLogsWindow();
  return { success: true };
});

ipcMain.handle('app:open-settings', () => {
  createSettingsWindow();
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

    // Show success dialog
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Backup Successful',
      message: `Backup telah berhasil dibuat!`,
      detail: `File: ${backupInfo.filename}\nUkuran: ${(backupInfo.size / 1024 / 1024).toFixed(2)} MB`,
      buttons: ['OK', 'Buka Folder'],
      defaultId: 0,
      noLink: true,
      normalizeAccessKeys: true,
    });

    if (result.response === 1) {
      shell.openPath(backupManager.getBackupDir());
    }

    return { success: true, backup: backupInfo };
  } catch (error: any) {
    dialog.showErrorBox(
      'Backup Failed',
      `Gagal membuat backup:\n\n${error.message}`,
    );
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

console.log('BizFlow Desktop Server started');
