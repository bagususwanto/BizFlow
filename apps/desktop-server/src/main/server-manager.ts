import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { PortManager } from './port-manager';
import { ConfigManager } from './config';
import {
  isDev,
  getApiEntryPath,
  getApiCwd,
  getWebPath,
  getDbPath,
  getNodeBin,
  getNextBin,
  getWebStandaloneServer,
  getWebStandaloneCwd,
} from './paths';

export interface ServerStatus {
  api: 'stopped' | 'starting' | 'running' | 'error';
  web: 'stopped' | 'starting' | 'running' | 'error';
  apiPort: number;
  webPort: number;
  apiUrl: string;
  webUrl: string;
  dbSize: string;
  dbPath: string;
}

/**
 * Typed event map for ServerManager.
 * Provides compile-time safety for event names and payloads.
 */
export interface ServerManagerEvents {
  'status-change': (message: string) => void;
  'server-status': (status: ServerStatus) => void;
  'all-started': (status: ServerStatus) => void;
  'all-stopped': () => void;
  'api-error': (error: string) => void;
  'web-error': (error: string) => void;
  'api-log': (message: string) => void;
  'web-log': (message: string) => void;
}

export class ServerManager extends EventEmitter {
  private apiProcess: ChildProcess | null = null;
  private webProcess: ChildProcess | null = null;
  private apiPort = 3000;
  private webPort = 3001;
  private config: ConfigManager;
  private autoRestartEnabled = true;
  private isManualStop = false;
  private status: ServerStatus = {
    api: 'stopped',
    web: 'stopped',
    apiPort: 3000,
    webPort: 3001,
    apiUrl: 'http://localhost:3000',
    webUrl: 'http://localhost:3001',
    dbSize: 'Checking...',
    dbPath: '',
  };

  // -- Typed emit/on overrides --
  emit<K extends keyof ServerManagerEvents>(
    event: K,
    ...args: Parameters<ServerManagerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof ServerManagerEvents>(
    event: K,
    listener: ServerManagerEvents[K],
  ): this {
    return super.on(event, listener);
  }

  once<K extends keyof ServerManagerEvents>(
    event: K,
    listener: ServerManagerEvents[K],
  ): this {
    return super.once(event, listener);
  }

  constructor(config: ConfigManager) {
    super();
    this.config = config;
    this.apiPort = config.get('apiPort');
    this.webPort = config.get('webPort');

    // Initialize dbPath using centralized path utility
    this.status.dbPath = getDbPath();
  }

  async startAll(): Promise<void> {
    this.isManualStop = false;
    this.emit('status-change', 'Starting servers...');

    // Check and find available ports using PortManager
    const preferredApiPort = this.config.get('apiPort');
    const preferredWebPort = this.config.get('webPort');

    this.apiPort = await PortManager.findAvailablePort(preferredApiPort);

    // Ensure Web port is distinct from API port
    const startWebPort = Math.max(preferredWebPort, this.apiPort + 1);
    this.webPort = await PortManager.findAvailablePort(startWebPort);

    if (this.apiPort !== preferredApiPort) {
      console.log(
        `[PORT] API port ${preferredApiPort} not available, using ${this.apiPort}`,
      );
    }
    if (this.webPort !== preferredWebPort) {
      console.log(
        `[PORT] Web port ${preferredWebPort} not available, using ${this.webPort}`,
      );
    }

    this.status.apiPort = this.apiPort;
    this.status.webPort = this.webPort;
    this.status.apiUrl = `http://localhost:${this.apiPort}`;
    this.status.webUrl = `http://localhost:${this.webPort}`;

    await this.startApiServer();
    await this.startWebServer();

    this.emit('all-started', this.status);
  }

  private async startApiServer(): Promise<void> {
    this.status.api = 'starting';
    this.emit('status-change', 'Starting API server...');

    const apiPath = getApiEntryPath();
    const dbPath = getDbPath();
    const nodeBin = getNodeBin();

    console.log('[API] isDev:', isDev());
    console.log('[API] Path:', apiPath);
    console.log('[API] Exists:', fs.existsSync(apiPath));
    console.log('[API] DB Path:', dbPath);

    if (!fs.existsSync(apiPath)) {
      throw new Error(`API entry point not found: ${apiPath}`);
    }

    // In production, ensure data directory exists
    if (!isDev()) {
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    this.apiProcess = spawn(nodeBin, [apiPath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: this.apiPort.toString(),
        DATABASE_URL: `file:${dbPath}`,
        JWT_ACCESS_SECRET: 'bizflow-access-secret-change-in-production',
        JWT_REFRESH_SECRET: 'bizflow-refresh-secret-change-in-production',
        CORS_ORIGIN: this.status.webUrl,
      },
      cwd: getApiCwd(),
      stdio: 'pipe',
    });

    this.setupProcessListeners(this.apiProcess, 'api', () =>
      this.startApiServer(),
    );

    await this.healthCheck(this.status.apiUrl + '/api/v1/health', 30);
    this.status.api = 'running';
    this.emit('status-change', 'API server running');
    this.emit('server-status', this.getStatus());
  }

  private async startWebServer(): Promise<void> {
    this.status.web = 'starting';
    this.emit('status-change', 'Starting Web server...');

    const webPath = getWebPath();

    console.log('[WEB] isDev:', isDev());
    console.log('[WEB] Path:', webPath);
    console.log('[WEB] Exists:', fs.existsSync(webPath));

    if (isDev()) {
      const nextBin = getNextBin();
      this.webProcess = spawn(
        nextBin,
        ['start', webPath, '--port', this.webPort.toString()],
        {
          env: {
            ...process.env,
            NEXT_PUBLIC_API_URL: this.status.apiUrl,
          },
          stdio: 'pipe',
        },
      );
    } else {
      const standaloneServer = getWebStandaloneServer();
      const nodeBin = getNodeBin();

      console.log('[WEB] Standalone server:', standaloneServer);
      console.log('[WEB] Standalone exists:', fs.existsSync(standaloneServer));

      if (!fs.existsSync(standaloneServer)) {
        throw new Error(`Web standalone server not found: ${standaloneServer}`);
      }

      this.webProcess = spawn(nodeBin, [standaloneServer], {
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          PORT: this.webPort.toString(),
          HOSTNAME: '0.0.0.0',
          NEXT_PUBLIC_API_URL: this.status.apiUrl,
        },
        cwd: getWebStandaloneCwd(),
        stdio: 'pipe',
      });
    }

    this.setupProcessListeners(this.webProcess, 'web', () =>
      this.startWebServer(),
    );

    await this.healthCheck(this.status.webUrl, 30);
    this.status.web = 'running';
    this.emit('status-change', 'Web server running');
    this.emit('server-status', this.getStatus());
  }

  /**
   * Set up stdout, stderr, error, and exit listeners for a child process.
   * Eliminates duplicated listener wiring between API and Web servers.
   */
  private setupProcessListeners(
    proc: ChildProcess,
    type: 'api' | 'web',
    restartFn: () => Promise<void>,
  ): void {
    const TAG = type.toUpperCase();

    proc.stdout?.on('data', (data) => {
      const message = data.toString();
      this.emit(`${type}-log`, message);
      console.log(`[${TAG}]`, message);
    });

    proc.stderr?.on('data', (data) => {
      const message = data.toString();
      this.emit(`${type}-error`, message);
      console.error(`[${TAG} ERROR]`, message);
    });

    proc.on('error', (error) => {
      this.status[type] = 'error';
      this.emit(`${type}-error`, error.message);
      this.emit('status-change', `${TAG} server error: ${error.message}`);
    });

    proc.on('exit', (code) => {
      this.status[type] = 'stopped';
      this.emit('status-change', `${TAG} server exited with code ${code}`);
      this.emit('server-status', this.getStatus());

      // Auto-restart if not manually stopped and auto-restart is enabled
      if (!this.isManualStop && this.autoRestartEnabled && code !== 0) {
        console.log(
          `[AUTO-RESTART] ${TAG} server crashed, restarting in 3 seconds...`,
        );
        setTimeout(() => {
          restartFn().catch((err) => {
            console.error(`[AUTO-RESTART] Failed to restart ${TAG}:`, err);
          });
        }, 3000);
      }
    });
  }

  private async healthCheck(url: string, maxRetries: number): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Retry
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(
      `Health check failed for ${url} after ${maxRetries} retries`,
    );
  }

  async stopAll(): Promise<void> {
    this.isManualStop = true;
    this.emit('status-change', 'Stopping servers...');

    if (this.apiProcess) {
      this.apiProcess.kill('SIGTERM');
      this.apiProcess = null;
      this.status.api = 'stopped';
    }

    if (this.webProcess) {
      this.webProcess.kill('SIGTERM');
      this.webProcess = null;
      this.status.web = 'stopped';
    }

    this.emit('server-status', this.getStatus());
    this.emit('all-stopped');
  }

  async restartAll(): Promise<void> {
    await this.stopAll();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.startAll();
  }

  getStatus(): ServerStatus {
    this.status.dbSize = this.getDbSize();
    return { ...this.status };
  }

  private getDbSize(): string {
    try {
      if (fs.existsSync(this.status.dbPath)) {
        const stats = fs.statSync(this.status.dbPath);
        const bytes = stats.size;
        if (bytes < 1024 * 1024) {
          return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      }
      return 'Not Found';
    } catch (error) {
      console.error('[DB] Failed to get size:', error);
      return 'Error';
    }
  }

  setAutoRestart(enabled: boolean): void {
    this.autoRestartEnabled = enabled;
    console.log(`[AUTO-RESTART] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  getAutoRestart(): boolean {
    return this.autoRestartEnabled;
  }
}
