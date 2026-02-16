import { ipcMain } from 'electron';
import { ConfigManager } from '../config';

export function registerConfigIpc(configManager: ConfigManager): void {
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
}
