import { app } from 'electron';
import * as path from 'path';

/**
 * Centralized path resolution for dev and production environments.
 * Eliminates duplicated `isDev ? ... : ...` patterns across the codebase.
 */

export function isDev(): boolean {
  return !app.isPackaged;
}

export function getApiEntryPath(): string {
  return isDev()
    ? path.join(__dirname, '../../../api/dist/main.js')
    : path.join(process.resourcesPath, 'api/main.js');
}

export function getApiCwd(): string {
  return isDev()
    ? path.dirname(getApiEntryPath())
    : path.join(process.resourcesPath, 'api');
}

export function getWebPath(): string {
  return isDev()
    ? path.join(__dirname, '../../../web')
    : path.join(process.resourcesPath, 'web');
}

export function getDbPath(): string {
  return isDev()
    ? path.join(__dirname, '../../../../packages/database/prisma/dev.db')
    : path.join(app.getPath('userData'), 'data', 'bizflow.db');
}

export function getNodeBin(): string {
  return process.execPath;
}

export function getNextBin(): string {
  return path.join(
    __dirname,
    '../../../../node_modules/.pnpm/node_modules/.bin/next',
  );
}

export function getWebStandaloneServer(): string {
  return path.join(getWebPath(), 'apps', 'web', 'server.js');
}

export function getWebStandaloneCwd(): string {
  return path.join(getWebPath(), 'apps', 'web');
}
