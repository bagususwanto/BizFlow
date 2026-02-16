import { ipcMain } from 'electron';
import { LicenseManager } from '../license-manager';

export function registerLicenseIpc(licenseManager: LicenseManager): void {
  ipcMain.handle('license:activate', async (_, key: string) => {
    return await licenseManager.activateLicense(key);
  });

  ipcMain.handle('license:deactivate', async () => {
    await licenseManager.deactivateLicense();
    return { success: true };
  });

  ipcMain.handle('license:getStatus', () => {
    return licenseManager.getLicenseStatus();
  });

  ipcMain.handle('license:getInfo', () => {
    return licenseManager.getLicenseInfo();
  });

  ipcMain.handle('license:getDeviceId', () => {
    return licenseManager.getDeviceId();
  });
}
