import { app, ipcMain, shell } from 'electron';
import { createLogsWindow, createSettingsWindow } from '../windows';

export function registerAppIpc(): void {
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

  ipcMain.handle('app:quit', () => {
    app.quit();
  });
}
