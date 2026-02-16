import { ipcMain, dialog, shell } from 'electron';
import { BackupManager } from '../backup-manager';

export function registerBackupIpc(backupManager: BackupManager): void {
  ipcMain.handle('backup:create', async (_, customName?: string) => {
    try {
      const backupInfo = await backupManager.createBackup(customName);

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

      return { success: true, backup: backupInfo };
    } catch (error: any) {
      dialog.showErrorBox(
        'Backup Failed',
        `Gagal membuat backup:\n\n${error.message}`,
      );
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('backup:restore', async (_, backupFilename: string) => {
    try {
      await backupManager.restoreBackup(backupFilename);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('backup:list', async () => {
    try {
      const backups = await backupManager.listBackups();
      return { success: true, backups };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('backup:delete', async (_, backupFilename: string) => {
    try {
      await backupManager.deleteBackup(backupFilename);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('backup:getInfo', () => {
    return {
      backupDir: backupManager.getBackupDir(),
      dbPath: backupManager.getDbPath(),
    };
  });
}
