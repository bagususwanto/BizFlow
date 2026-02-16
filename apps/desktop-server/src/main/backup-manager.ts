import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { ConfigManager } from './config';

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
}

export interface BackupManagerEvents {
  'backup-created': (info: BackupInfo) => void;
  'backup-restored': (filename: string) => void;
  'backup-deleted': (filename: string) => void;
  'backup-error': (error: unknown) => void;
}

export class BackupManager extends EventEmitter {
  // -- Typed emit/on overrides --
  emit<K extends keyof BackupManagerEvents>(
    event: K,
    ...args: Parameters<BackupManagerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof BackupManagerEvents>(
    event: K,
    listener: BackupManagerEvents[K],
  ): this {
    return super.on(event, listener);
  }

  private config: ConfigManager;
  private backupDir: string;
  private dbPath: string;
  private autoBackupInterval: NodeJS.Timeout | null = null;

  constructor(config: ConfigManager, dbPath: string) {
    super();
    this.config = config;
    this.dbPath = dbPath;
    this.backupDir = config.get('backupDir');

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    console.log('[BACKUP] Initialized. Backup dir:', this.backupDir);
    console.log('[BACKUP] Database path:', this.dbPath);
  }

  /**
   * Create a manual backup
   */
  async createBackup(customName?: string): Promise<BackupInfo> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = customName || `bizflow-backup-${timestamp}.db`;
    const backupPath = path.join(this.backupDir, filename);

    console.log('[BACKUP] Creating backup:', filename);

    // Check if database exists
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Database not found at ${this.dbPath}`);
    }

    // Copy database file
    await fs.promises.copyFile(this.dbPath, backupPath);

    // Get file stats
    const stats = await fs.promises.stat(backupPath);

    const backupInfo: BackupInfo = {
      filename,
      path: backupPath,
      size: stats.size,
      createdAt: new Date(),
    };

    console.log('[BACKUP] Backup created:', backupInfo);
    this.emit('backup-created', backupInfo);

    // Clean old backups based on retention policy
    await this.cleanOldBackups();

    return backupInfo;
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupFilename: string): Promise<void> {
    const backupPath = path.join(this.backupDir, backupFilename);

    console.log('[BACKUP] Restoring from backup:', backupFilename);

    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupFilename}`);
    }

    // Create a backup of current database before restoring
    const currentBackupName = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    if (fs.existsSync(this.dbPath)) {
      await fs.promises.copyFile(
        this.dbPath,
        path.join(this.backupDir, currentBackupName),
      );
      console.log('[BACKUP] Created pre-restore backup:', currentBackupName);
    }

    // Restore backup
    await fs.promises.copyFile(backupPath, this.dbPath);

    console.log('[BACKUP] Restore completed');
    this.emit('backup-restored', backupFilename);
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    const files = await fs.promises.readdir(this.backupDir);
    const backups: BackupInfo[] = [];

    for (const file of files) {
      if (file.endsWith('.db')) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.promises.stat(filePath);

        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime,
        });
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return backups;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupFilename: string): Promise<void> {
    const backupPath = path.join(this.backupDir, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupFilename}`);
    }

    await fs.promises.unlink(backupPath);
    console.log('[BACKUP] Deleted backup:', backupFilename);
    this.emit('backup-deleted', backupFilename);
  }

  /**
   * Clean old backups based on retention policy
   */
  private async cleanOldBackups(): Promise<void> {
    const retention = this.config.get('backupRetention');
    const backups = await this.listBackups();

    if (backups.length > retention) {
      const toDelete = backups.slice(retention);
      console.log(
        `[BACKUP] Cleaning ${toDelete.length} old backups (retention: ${retention})`,
      );

      for (const backup of toDelete) {
        await this.deleteBackup(backup.filename);
      }
    }
  }

  /**
   * Start auto-backup scheduler
   */
  startAutoBackup(): void {
    const autoBackup = this.config.get('autoBackup');
    const interval = this.config.get('backupInterval');

    if (!autoBackup) {
      console.log('[BACKUP] Auto-backup is disabled');
      return;
    }

    // Stop existing interval if any
    this.stopAutoBackup();

    // Convert hours to milliseconds
    const intervalMs = interval * 60 * 60 * 1000;

    console.log(`[BACKUP] Starting auto-backup every ${interval} hours`);

    this.autoBackupInterval = setInterval(async () => {
      try {
        console.log('[BACKUP] Running scheduled auto-backup');
        await this.createBackup();
      } catch (error) {
        console.error('[BACKUP] Auto-backup failed:', error);
        this.emit('backup-error', error);
      }
    }, intervalMs);
  }

  /**
   * Stop auto-backup scheduler
   */
  stopAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('[BACKUP] Auto-backup stopped');
    }
  }

  /**
   * Get backup directory path
   */
  getBackupDir(): string {
    return this.backupDir;
  }

  /**
   * Get database path
   */
  getDbPath(): string {
    return this.dbPath;
  }
}
