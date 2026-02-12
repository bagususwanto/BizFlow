import { app, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { showMainWindow } from './windows';
import { ServerStatus } from './server-manager';

let tray: Tray | null = null;

export function createTray(
  onOpenBrowser: () => void,
  onStopServer: () => void,
  onStartServer: () => void,
  onRestartServer: () => void,
  onViewLogs: () => void,
  onBackup: () => void,
): Tray | null {
  console.log('[TRAY] Electron version:', process.versions.electron);

  const iconPath = path.join(__dirname, '../resources/icon-running.png');
  console.log('[TRAY] Icon path:', iconPath);

  try {
    let icon = nativeImage.createFromPath(iconPath);

    if (icon.isEmpty()) {
      console.error('[TRAY] Icon from path is empty. Trying buffer...');
      try {
        const fs = require('fs');
        const buffer = fs.readFileSync(iconPath);
        console.log('[TRAY] Read buffer size:', buffer.length);
        icon = nativeImage.createFromBuffer(buffer);
      } catch (e) {
        console.error('[TRAY] Buffer read failed:', e);
      }
    }

    if (icon.isEmpty()) {
      console.error(
        '[TRAY] Icon still empty. Trying system icon as fallback...',
      );
      icon = nativeImage.createFromNamedImage('NSActionTemplate');
    }

    console.log('[TRAY] Final icon empty:', icon.isEmpty());

    tray = new Tray(icon);
    tray.setToolTip('BizFlow Server - Running');

    // Create context menu
    updateTrayMenu(
      {
        api: 'running',
        web: 'running',
        apiPort: 3000,
        webPort: 3001,
        apiUrl: 'http://localhost:3000',
        webUrl: 'http://localhost:3001',
      },
      onOpenBrowser,
      onStopServer,
      onStartServer,
      onRestartServer,
      onViewLogs,
      onBackup,
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
  onOpenBrowser: () => void,
  onStopServer: () => void,
  onStartServer: () => void,
  onRestartServer: () => void,
  onViewLogs: () => void,
  onBackup: () => void,
): void {
  if (!tray) return;

  const isRunning = status.api === 'running' && status.web === 'running';

  // Update icon
  const iconName = isRunning ? 'icon-running.png' : 'icon-stopped.png';
  const iconPath = path.join(__dirname, '../resources', iconName);

  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    try {
      const fs = require('fs');
      const buffer = fs.readFileSync(iconPath);
      icon = nativeImage.createFromBuffer(buffer);
    } catch (e) {}
  }

  if (icon.isEmpty()) {
    icon = nativeImage.createFromNamedImage('NSActionTemplate');
  }

  tray.setImage(icon.resize({ width: 16, height: 16 }));

  // Update tooltip
  const tooltip = isRunning
    ? 'BizFlow Server - Running'
    : 'BizFlow Server - Stopped';
  tray.setToolTip(tooltip);

  // Update menu
  updateTrayMenu(
    status,
    onOpenBrowser,
    onStopServer,
    onStartServer,
    onRestartServer,
    onViewLogs,
    onBackup,
  );
}

function updateTrayMenu(
  status: ServerStatus,
  onOpenBrowser: () => void,
  onStopServer: () => void,
  onStartServer: () => void,
  onRestartServer: () => void,
  onViewLogs: () => void,
  onBackup: () => void,
): void {
  if (!tray) return;

  const isRunning = status.api === 'running' && status.web === 'running';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🏪 BizFlow Server',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isRunning ? '● Server Running' : '○ Server Stopped',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '🌐 Buka di Browser',
      enabled: isRunning,
      click: onOpenBrowser,
    },
    {
      label: '📋 Lihat Logs',
      enabled: true,
      click: onViewLogs,
    },
    {
      label: '💾 Backup Sekarang',
      enabled: true,
      click: onBackup,
    },
    { type: 'separator' },
    {
      label: isRunning ? '⏸️  Stop Server' : '▶️  Start Server',
      click: isRunning ? onStopServer : onStartServer,
    },
    {
      label: '🔄 Restart Server',
      enabled: isRunning,
      click: onRestartServer,
    },
    { type: 'separator' },
    {
      label: '❌ Keluar',
      click: () => {
        app.quit();
      },
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
