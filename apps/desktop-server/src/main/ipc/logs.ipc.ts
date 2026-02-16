import { ipcMain, dialog, shell } from 'electron';
import { LogManager } from '../log-manager';

export function registerLogsIpc(logManager: LogManager): void {
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
}
