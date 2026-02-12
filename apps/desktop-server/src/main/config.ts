import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

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

export class ConfigManager {
  private config: AppConfig;
  private configPath: string;

  constructor() {
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
    this.config[key] = value;
    this.saveConfig();
  }

  /**
   * Update multiple config values at once
   */
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Reset to default config
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}
