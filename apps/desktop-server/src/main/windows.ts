import { BrowserWindow } from 'electron';
import * as path from 'path';

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

export function createSplashWindow(): BrowserWindow {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, '../renderer/splash.html'));

  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  return splashWindow;
}

export function closeSplashWindow(): void {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'BizFlow Server',
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/main.html'));

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of closing
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function showMainWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

export function hideMainWindow(): void {
  if (mainWindow) {
    mainWindow.hide();
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

let logsWindow: BrowserWindow | null = null;

export function createLogsWindow(): BrowserWindow {
  if (logsWindow && !logsWindow.isDestroyed()) {
    logsWindow.show();
    logsWindow.focus();
    return logsWindow;
  }

  logsWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'BizFlow Server - Logs',
    parent: mainWindow || undefined,
  });

  logsWindow.loadFile(path.join(__dirname, '../renderer/logs.html'));

  logsWindow.on('closed', () => {
    logsWindow = null;
  });

  return logsWindow;
}

export function getLogsWindow(): BrowserWindow | null {
  return logsWindow;
}
