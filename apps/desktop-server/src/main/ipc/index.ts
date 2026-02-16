import { ServerManager } from '../server-manager';
import { ConfigManager } from '../config';
import { LogManager } from '../log-manager';
import { BackupManager } from '../backup-manager';
import { LicenseManager } from '../license-manager';

import { registerServerIpc } from './server.ipc';
import { registerConfigIpc } from './config.ipc';
import { registerLogsIpc } from './logs.ipc';
import { registerBackupIpc } from './backup.ipc';
import { registerLicenseIpc } from './license.ipc';
import { registerAppIpc } from './app.ipc';

export interface IpcDependencies {
  serverManager: ServerManager;
  configManager: ConfigManager;
  logManager: LogManager;
  backupManager: BackupManager;
  licenseManager: LicenseManager;
}

/**
 * Register all IPC handlers with their respective dependencies.
 */
export function registerAllIpcHandlers(deps: IpcDependencies): void {
  registerServerIpc(deps.serverManager);
  registerConfigIpc(deps.configManager);
  registerLogsIpc(deps.logManager);
  registerBackupIpc(deps.backupManager);
  registerLicenseIpc(deps.licenseManager);
  registerAppIpc();
}
