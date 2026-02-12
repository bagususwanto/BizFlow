import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import { app } from 'electron';
import { PortManager } from './port-manager';
import { ConfigManager } from './config';

export interface ServerStatus {
  api: 'stopped' | 'starting' | 'running' | 'error';
  web: 'stopped' | 'starting' | 'running' | 'error';
  apiPort: number;
  webPort: number;
  apiUrl: string;
  webUrl: string;
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
  };

  constructor(config: ConfigManager) {
    super();
    this.config = config;
    this.apiPort = config.get('apiPort');
    this.webPort = config.get('webPort');
  }

  async startAll(): Promise<void> {
    this.isManualStop = false;
    this.emit('status-change', 'Starting servers...');

    // Check and find available ports using PortManager
    const preferredApiPort = this.config.get('apiPort');
    const preferredWebPort = this.config.get('webPort');

    this.apiPort = await PortManager.findAvailablePort(preferredApiPort);
    this.webPort = await PortManager.findAvailablePort(preferredWebPort);

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

    // Start API server
    await this.startApiServer();

    // Start Web server
    await this.startWebServer();

    this.emit('all-started', this.status);
  }

  private async startApiServer(): Promise<void> {
    this.status.api = 'starting';
    this.emit('status-change', 'Starting API server...');

    const isDev = !app.isPackaged;
    const apiPath = isDev
      ? path.join(__dirname, '../../../api/dist/main.js')
      : path.join(process.resourcesPath, 'bin/api/main.js');

    const dbPath = isDev
      ? path.join(__dirname, '../../../../packages/database/prisma/dev.db')
      : path.join(app.getPath('userData'), 'data', 'bizflow.db');

    this.apiProcess = spawn('node', [apiPath], {
      env: {
        ...process.env,
        PORT: this.apiPort.toString(),
        DATABASE_URL: `file:${dbPath}`,
        JWT_ACCESS_SECRET: 'bizflow-access-secret-change-in-production',
        JWT_REFRESH_SECRET: 'bizflow-refresh-secret-change-in-production',
        CORS_ORIGIN: this.status.webUrl,
      },
      stdio: 'pipe',
    });

    this.apiProcess.stdout?.on('data', (data) => {
      const message = data.toString();
      this.emit('api-log', message);
      console.log('[API]', message);
    });

    this.apiProcess.stderr?.on('data', (data) => {
      const message = data.toString();
      this.emit('api-error', message);
      console.error('[API ERROR]', message);
    });

    this.apiProcess.on('error', (error) => {
      this.status.api = 'error';
      this.emit('api-error', error.message);
      this.emit('status-change', `API server error: ${error.message}`);
    });

    this.apiProcess.on('exit', (code) => {
      this.status.api = 'stopped';
      this.emit('status-change', `API server exited with code ${code}`);
      this.emit('server-status', this.getStatus());

      // Auto-restart if not manually stopped and auto-restart is enabled
      if (!this.isManualStop && this.autoRestartEnabled && code !== 0) {
        console.log(
          '[AUTO-RESTART] API server crashed, restarting in 3 seconds...',
        );
        setTimeout(() => {
          this.startApiServer().catch((err) => {
            console.error('[AUTO-RESTART] Failed to restart API:', err);
          });
        }, 3000);
      }
    });

    await this.healthCheck(this.status.apiUrl + '/api/v1/health', 30);
    this.status.api = 'running';
    this.emit('status-change', 'API server running');
    this.emit('server-status', this.getStatus());
  }

  private async startWebServer(): Promise<void> {
    this.status.web = 'starting';
    this.emit('status-change', 'Starting Web server...');

    const isDev = !app.isPackaged;
    const webPath = isDev
      ? path.join(__dirname, '../../../web')
      : path.join(process.resourcesPath, 'bin/web');

    const nextBin = isDev
      ? path.join(
          __dirname,
          '../../../../node_modules/.pnpm/node_modules/.bin/next',
        )
      : path.join(process.resourcesPath, 'bin/next');

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

    this.webProcess.stdout?.on('data', (data) => {
      const message = data.toString();
      this.emit('web-log', message);
      console.log('[WEB]', message);
    });

    this.webProcess.stderr?.on('data', (data) => {
      const message = data.toString();
      this.emit('web-error', message);
      console.error('[WEB ERROR]', message);
    });

    this.webProcess.on('error', (error) => {
      this.status.web = 'error';
      this.emit('web-error', error.message);
      this.emit('status-change', `Web server error: ${error.message}`);
    });

    this.webProcess.on('exit', (code) => {
      this.status.web = 'stopped';
      this.emit('status-change', `Web server exited with code ${code}`);
      this.emit('server-status', this.getStatus());

      // Auto-restart if not manually stopped and auto-restart is enabled
      if (!this.isManualStop && this.autoRestartEnabled && code !== 0) {
        console.log(
          '[AUTO-RESTART] Web server crashed, restarting in 3 seconds...',
        );
        setTimeout(() => {
          this.startWebServer().catch((err) => {
            console.error('[AUTO-RESTART] Failed to restart Web:', err);
          });
        }, 3000);
      }
    });

    await this.healthCheck(this.status.webUrl, 30);
    this.status.web = 'running';
    this.emit('status-change', 'Web server running');
    this.emit('server-status', this.getStatus());
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

  // Port checking methods removed - now using PortManager

  async stopAll(): Promise<void> {
    this.isManualStop = true; // Prevent auto-restart
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
    return { ...this.status };
  }

  setAutoRestart(enabled: boolean): void {
    this.autoRestartEnabled = enabled;
    console.log(`[AUTO-RESTART] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  getAutoRestart(): boolean {
    return this.autoRestartEnabled;
  }
}
