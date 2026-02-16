import { app, BrowserWindow, shell, dialog } from 'electron';
import {
  createSplashWindow,
  closeSplashWindow,
  createMainWindow,
  showMainWindow,
  createLogsWindow,
  getLogsWindow,
  createLicenseWindow,
} from './windows';
import {
  createTray,
  updateTrayStatus,
  destroyTray,
  TrayCallbacks,
} from './tray';
import { ConfigManager } from './config';
import { LogManager } from './log-manager';
import { BackupManager } from './backup-manager';
import { LicenseManager } from './license-manager';
import { ServerManager } from './server-manager';
import { registerAllIpcHandlers } from './ipc';
import { getDbPath } from './paths';

let serverManager: ServerManager;
let configManager: ConfigManager;
let logManager: LogManager;
let backupManager: BackupManager;
let licenseManager: LicenseManager;
let isQuitting = false;

// -- Tray callback helpers (defined once, reused everywhere) --

function handleManualBackup(): void {
  if (!backupManager) {
    console.error('Backup manager not initialized');
    return;
  }
  backupManager
    .createBackup()
    .then(async (backupInfo) => {
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
    })
    .catch((error) => {
      console.error('[BACKUP] Manual backup failed:', error);
      dialog.showErrorBox(
        'Backup Failed',
        `Gagal membuat backup:\n\n${error instanceof Error ? error.message : String(error)}`,
      );
    });
}

function getTrayCallbacks(): TrayCallbacks {
  return {
    onOpenBrowser: () => {
      const status = serverManager.getStatus();
      shell.openExternal(status.webUrl);
    },
    onStopServer: async () => await serverManager.stopAll(),
    onStartServer: async () => await serverManager.startAll(),
    onRestartServer: async () => await serverManager.restartAll(),
    onViewLogs: () => createLogsWindow(),
    onBackup: handleManualBackup,
  };
}

// -- Application lifecycle --

app.whenReady().then(async () => {
  // Initialize managers
  configManager = new ConfigManager();
  console.log('[CONFIG] Loaded config from', configManager.getConfigPath());

  logManager = new LogManager();
  console.log('[LOG-MANAGER] Initialized');

  licenseManager = new LicenseManager();
  console.log('[LICENSE] Initialized');

  // Check license
  if (!licenseManager.isLicenseValid()) {
    console.log('[LICENSE] No valid license found. Showing activation window.');
    const licenseWin = createLicenseWindow();

    licenseManager.once('license-activated', () => {
      console.log('[LICENSE] Activated! Starting servers...');
      if (licenseWin && !licenseWin.isDestroyed()) {
        licenseWin.close();
      }
      startApp();
    });
  } else {
    console.log('[LICENSE] Valid license found. Starting app...');
    startApp();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (licenseManager && !licenseManager.isLicenseValid()) {
        createLicenseWindow();
      } else {
        createMainWindow();
      }
    } else {
      showMainWindow();
    }
  });
});

function startApp(): void {
  const splash = createSplashWindow();

  // Initialize server manager with config
  serverManager = new ServerManager(configManager);

  // Initialize backup manager
  const dbPath = getDbPath();
  backupManager = new BackupManager(configManager, dbPath);
  console.log('[BACKUP] Initialized');

  // Start auto-backup if enabled
  if (configManager.get('autoBackup')) {
    backupManager.startAutoBackup();
  }

  // Register all IPC handlers
  registerAllIpcHandlers({
    serverManager,
    configManager,
    logManager,
    backupManager,
    licenseManager,
  });

  setupEventListeners();
  startServers(splash);
}

function setupEventListeners(): void {
  const callbacks = getTrayCallbacks();

  // Listen for config changes
  configManager.on('change', (changes, config) => {
    console.log('[CONFIG] Settings changed:', Object.keys(changes));

    if ('autoStart' in changes) {
      app.setLoginItemSettings({
        openAtLogin: config.autoStart,
        openAsHidden: config.startMinimized,
      });
      console.log('[CONFIG] Auto-start updated:', config.autoStart);
    }

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

    if ('theme' in changes) {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('theme-update', config.theme);
      });
    }

    if ('language' in changes) {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('language-update', config.language);
      });

      // Update tray with new language
      const status = serverManager.getStatus();
      updateTrayStatus(status, callbacks, config.language);
    }

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

  // Create system tray
  createTray(callbacks);

  // Server event listeners
  serverManager.on('status-change', (message: string) => {
    console.log('[STATUS]', message);
    const splash = BrowserWindow.getAllWindows().find((w) =>
      w.webContents.getURL().includes('splash.html'),
    );
    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('status-update', message);
    }
  });

  serverManager.on('server-status', (status) => {
    updateTrayStatus(status, callbacks, configManager.get('language'));

    const mainWindow = BrowserWindow.getAllWindows().find(
      (w) => w.title === 'BizFlow Server',
    );
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-status', status);
    }
  });

  serverManager.on('all-started', (status) => {
    console.log('[SUCCESS] All servers started', status);

    updateTrayStatus(status, callbacks, configManager.get('language'));

    setTimeout(() => {
      closeSplashWindow();

      const existingMainWindow = BrowserWindow.getAllWindows().find(
        (w) => w.title === 'BizFlow Server',
      );

      if (!existingMainWindow || existingMainWindow.isDestroyed()) {
        const newMainWindow = createMainWindow();
        newMainWindow.webContents.once('did-finish-load', () => {
          newMainWindow.webContents.send('server-status', status);
        });
      } else {
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
}

async function startServers(splash: BrowserWindow): Promise<void> {
  try {
    const startupTimeout = setTimeout(() => {
      console.error('[STARTUP TIMEOUT] Server startup took too long');
      if (splash && !splash.isDestroyed()) {
        splash.close();
      }
      dialog.showErrorBox(
        'Startup Timeout',
        'Server startup took too long. Please check the logs for details.',
      );
    }, 60000);

    await serverManager.startAll();
    clearTimeout(startupTimeout);
  } catch (error) {
    console.error('[STARTUP ERROR]', error);
    if (splash && !splash.isDestroyed()) {
      splash.close();
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox(
      'Server Startup Failed',
      `Failed to start servers:\n\n${errorMessage}\n\nPlease check the logs for more details.`,
    );
  }
}

// -- Graceful shutdown --

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
  if (isQuitting) {
    app.quit();
  }
});

console.log('BizFlow Desktop Server started');
