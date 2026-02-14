import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface AppConfig {
  // Server settings
  apiPort: number;
  webPort: number;
  autoStart: boolean;

  // Backup settings
  backupDir: string;
  autoBackup: boolean;
  backupInterval: number; // in hours
  backupRetention: number; // number of backups to keep

  // UI settings
  language: 'id' | 'en';
  theme: 'light' | 'dark' | 'system';
  minimizeToTray: boolean;
  startMinimized: boolean;

  // License (placeholder for Phase 6)
  licenseKey?: string;
  machineId?: string;
}

export const TRAY_TRANSLATIONS = {
  en: {
    'open.browser': 'Open in Browser',
    'server.start': 'Start Server',
    'server.stop': 'Stop Server',
    'server.restart': 'Restart Server',
    'logs.view': 'View Logs',
    'backup.create': 'Backup Now',
    'status.running': 'Server Running',
    'status.stopped': 'Server Stopped',
    quit: 'Quit',
  },
  id: {
    'open.browser': 'Buka di Browser',
    'server.start': 'Nyalakan Server',
    'server.stop': 'Matikan Server',
    'server.restart': 'Restart Server',
    'logs.view': 'Lihat Logs',
    'backup.create': 'Backup Sekarang',
    'status.running': 'Server Berjalan',
    'status.stopped': 'Server Berhenti',
    quit: 'Keluar',
  },
};

const DEFAULT_CONFIG: AppConfig = {
  apiPort: 3000,
  webPort: 3001,
  autoStart: false,
  backupDir: path.join(app.getPath('userData'), 'backups'),
  autoBackup: false,
  backupInterval: 24, // daily
  backupRetention: 7, // keep last 7 backups
  language: 'id',
  theme: 'system',
  minimizeToTray: true,
  startMinimized: false,
};

export class ConfigManager extends EventEmitter {
  private config: AppConfig;
  private configPath: string;

  constructor() {
    super();
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.config = this.loadConfig();
  }

  /**
   * Load config from file, or create default if not exists
   */
  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const loadedConfig = JSON.parse(data);
        // Merge with defaults to handle new fields
        return { ...DEFAULT_CONFIG, ...loadedConfig };
      }
    } catch (error) {
      console.error('[CONFIG] Failed to load config:', error);
    }

    // Return default config if file doesn't exist or failed to load
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save config to file
   */
  private saveConfig(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf-8',
      );
      console.log('[CONFIG] Config saved to', this.configPath);
    } catch (error) {
      console.error('[CONFIG] Failed to save config:', error);
    }
  }

  /**
   * Get entire config
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get specific config value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Set specific config value
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    const oldValue = this.config[key];
    if (oldValue !== value) {
      this.config[key] = value;
      this.saveConfig();
      this.emit('change', { [key]: value }, this.config);
    }
  }

  /**
   * Update multiple config values at once
   */
  update(updates: Partial<AppConfig>): void {
    const changes: any = {};
    let hasChanges = false;

    for (const key of Object.keys(updates)) {
      const k = key as keyof AppConfig;
      if (this.config[k] !== updates[k]) {
        (this.config as any)[k] = updates[k];
        changes[k] = updates[k];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveConfig();
      this.emit('change', changes, this.config);
    }
  }

  /**
   * Reset to default config
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
    this.emit('change', DEFAULT_CONFIG, this.config);
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}
