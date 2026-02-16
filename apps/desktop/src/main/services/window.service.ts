import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { config, getAppURL, isDev } from '../config';
import { logger } from '../utils/logger';

const log = logger.child('WindowService');

/**
 * Window Service
 * Manages window lifecycle and configuration
 */
class WindowService {
  private mainWindow: BrowserWindow | null = null;

  /**
   * Create the main application window
   */
  createMainWindow(): BrowserWindow {
    log.info('Creating main window');

    this.mainWindow = new BrowserWindow({
      width: config.window.width,
      height: config.window.height,
      title: config.window.title,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Required for node-thermal-printer
      },
    });

    // Load the appropriate URL
    const url = getAppURL();
    log.info(`Loading URL: ${url}`);
    this.mainWindow.loadURL(url);

    // Open DevTools in development
    if (isDev() && config.window.devTools) {
      this.mainWindow.webContents.openDevTools();
      log.debug('DevTools opened');
    }

    // Handle window close
    this.mainWindow.on('closed', () => {
      log.info('Main window closed');
      this.mainWindow = null;
    });

    log.info('Main window created successfully');
    return this.mainWindow;
  }

  /**
   * Get the main window instance
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Check if main window exists
   */
  hasMainWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed();
  }

  /**
   * Focus the main window
   */
  focusMainWindow(): void {
    if (this.hasMainWindow()) {
      this.mainWindow?.show();
      this.mainWindow?.focus();
      log.debug('Main window focused');
    }
  }

  /**
   * Close all windows
   */
  closeAllWindows(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close();
      log.info('All windows closed');
    }
  }
}

// Export singleton instance
export const windowService = new WindowService();
