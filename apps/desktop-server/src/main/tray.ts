import { app, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { showMainWindow } from './windows';
import { ServerStatus } from './server-manager';
import { t, SupportedLanguage } from './i18n/translations';

let tray: Tray | null = null;

/**
 * Named callbacks for tray menu actions.
 * Replaces the previous 6-7 positional callback parameters.
 */
export interface TrayCallbacks {
  onOpenBrowser: () => void;
  onStopServer: () => void;
  onStartServer: () => void;
  onRestartServer: () => void;
  onViewLogs: () => void;
  onBackup: () => void;
}

const RESOURCE_DIR = path.join(__dirname, '../resources');

/**
 * Load a tray/menu icon from the resources directory.
 * Falls back to buffer read and then system icon if path-based loading fails.
 */
function loadIcon(filename: string): Electron.NativeImage {
  const iconPath = path.join(RESOURCE_DIR, filename.replace('.svg', '.png'));
  let icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    try {
      const fs = require('fs');
      const buffer = fs.readFileSync(iconPath);
      icon = nativeImage.createFromBuffer(buffer);
    } catch (e) {
      // Silent fallback
    }
  }

  if (icon.isEmpty()) {
    icon = nativeImage.createFromNamedImage('NSActionTemplate');
  }

  return icon;
}

/**
 * Load a menu item icon (template image, resized to 16x16).
 */
function getMenuIcon(name: string): Electron.NativeImage {
  const image = loadIcon(name);
  image.setTemplateImage(true);
  return image.resize({ width: 16, height: 16 });
}

export function createTray(
  callbacks: TrayCallbacks,
  language: SupportedLanguage = 'id',
): Tray | null {
  try {
    const icon = loadIcon('icon-running.png');

    tray = new Tray(icon);
    tray.setToolTip('BizFlow Server - Running');

    // Create initial context menu
    updateTrayMenu(
      {
        api: 'running',
        web: 'running',
        apiPort: 3000,
        webPort: 3001,
        apiUrl: 'http://localhost:3000',
        webUrl: 'http://localhost:3001',
        dbSize: 'Checking...',
        dbPath: '',
      },
      callbacks,
      language,
    );

    // Double-click to show main window
    tray.on('double-click', () => {
      showMainWindow();
    });
  } catch (error) {
    console.error('[TRAY] Failed to create tray:', error);
  }

  return tray;
}

export function updateTrayStatus(
  status: ServerStatus,
  callbacks: TrayCallbacks,
  language: SupportedLanguage = 'id',
): void {
  if (!tray) return;

  const isRunning = status.api === 'running' && status.web === 'running';

  // Update icon
  const icon = loadIcon(isRunning ? 'icon-running.png' : 'icon-stopped.png');
  tray.setImage(icon.resize({ width: 16, height: 16 }));

  // Update tooltip
  tray.setToolTip(
    isRunning ? 'BizFlow Server - Running' : 'BizFlow Server - Stopped',
  );

  // Update menu
  updateTrayMenu(status, callbacks, language);
}

function updateTrayMenu(
  status: ServerStatus,
  callbacks: TrayCallbacks,
  language: SupportedLanguage = 'id',
): void {
  if (!tray) return;

  const isRunning = status.api === 'running' && status.web === 'running';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'BizFlow Server',
      enabled: false,
      icon: getMenuIcon('store.svg'),
    },
    { type: 'separator' },
    {
      label: isRunning
        ? t(language, 'status.running')
        : t(language, 'status.stopped'),
      enabled: false,
      icon: getMenuIcon(isRunning ? 'check-circle.svg' : 'circle.svg'),
    },
    { type: 'separator' },
    {
      label: t(language, 'open.browser'),
      enabled: isRunning,
      click: callbacks.onOpenBrowser,
      icon: getMenuIcon('globe.svg'),
    },
    {
      label: t(language, 'logs.view'),
      enabled: true,
      click: callbacks.onViewLogs,
      icon: getMenuIcon('clipboard-list.svg'),
    },
    {
      label: t(language, 'backup.create'),
      enabled: true,
      click: callbacks.onBackup,
      icon: getMenuIcon('save.svg'),
    },
    { type: 'separator' },
    {
      label: isRunning
        ? t(language, 'server.stop')
        : t(language, 'server.start'),
      click: isRunning ? callbacks.onStopServer : callbacks.onStartServer,
      icon: getMenuIcon(isRunning ? 'pause.svg' : 'play.svg'),
    },
    {
      label: t(language, 'server.restart'),
      enabled: isRunning,
      click: callbacks.onRestartServer,
      icon: getMenuIcon('refresh-cw.svg'),
    },
    { type: 'separator' },
    {
      label: t(language, 'quit'),
      click: () => {
        app.quit();
      },
      icon: getMenuIcon('log-out.svg'),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
