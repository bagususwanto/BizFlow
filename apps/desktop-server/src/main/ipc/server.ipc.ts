import { ipcMain } from 'electron';
import { ServerManager } from '../server-manager';

export function registerServerIpc(serverManager: ServerManager): void {
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
}
