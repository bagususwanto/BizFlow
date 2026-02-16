import { app, BrowserWindow } from 'electron';
import { windowService } from './services/window.service';
import { registerPrinterHandlers } from './ipc/printer.handlers';
import { logger } from './utils/logger';

const log = logger.child('Main');

/**
 * Application entry point
 * Orchestrates app lifecycle and initializes services
 */

// App lifecycle
app.whenReady().then(() => {
  log.info('App is ready, initializing...');

  // Register IPC handlers
  registerPrinterHandlers();

  // Create main window
  windowService.createMainWindow();

  // Handle macOS activate event
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      log.info('No windows found, recreating main window');
      windowService.createMainWindow();
    }
  });

  log.info('BizFlow Desktop App started successfully 🚀');
});

// Handle window close events
app.on('window-all-closed', () => {
  // On macOS, apps typically stay open until user quits explicitly
  if (process.platform !== 'darwin') {
    log.info('All windows closed, quitting app');
    app.quit();
  }
});

// Handle before quit
app.on('before-quit', () => {
  log.info('App is quitting...');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection', { reason, promise });
});
