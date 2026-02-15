import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
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
  dbSize: string;
  dbPath: string;
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

  constructor(config: ConfigManager) {
    super();
    this.config = config;
    this.apiPort = config.get('apiPort');
    this.webPort = config.get('webPort');

    // Initialize dbPath
    const isDev = !app.isPackaged;
    this.status.dbPath = isDev
      ? path.join(__dirname, '../../../../packages/database/prisma/dev.db')
      : path.join(app.getPath('userData'), 'data', 'bizflow.db');
  }

  async startAll(): Promise<void> {
    this.isManualStop = false;
    this.emit('status-change', 'Starting servers...');

    // Check and find available ports using PortManager
    const preferredApiPort = this.config.get('apiPort');
    const preferredWebPort = this.config.get('webPort');

    this.apiPort = await PortManager.findAvailablePort(preferredApiPort);

    // Ensure Web port is distinct from API port
    // If API took the preferred Web port (or higher), start searching from API port + 1
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
      : path.join(process.resourcesPath, 'api/main.js');

    const dbPath = isDev
      ? path.join(__dirname, '../../../../packages/database/prisma/dev.db')
      : path.join(app.getPath('userData'), 'data', 'bizflow.db');

    console.log('[API] isDev:', isDev);
    console.log('[API] Path:', apiPath);
    console.log('[API] Exists:', fs.existsSync(apiPath));
    console.log('[API] DB Path:', dbPath);

    if (!fs.existsSync(apiPath)) {
      throw new Error(`API entry point not found: ${apiPath}`);
    }

    // In production, ensure data directory exists
    if (!isDev) {
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    // Use the Node.js binary path
    const nodeBin = process.execPath;

    this.apiProcess = spawn(nodeBin, [apiPath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: this.apiPort.toString(),
        DATABASE_URL: `file:${dbPath}`,
        JWT_ACCESS_SECRET: 'bizflow-access-secret-change-in-production',
        JWT_REFRESH_SECRET: 'bizflow-refresh-secret-change-in-production',
        CORS_ORIGIN: this.status.webUrl,
        // NODE_PATH removed - not needed with hoisted modules
      },
      cwd: isDev
        ? path.dirname(apiPath)
        : path.join(process.resourcesPath, 'api'),
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
      : path.join(process.resourcesPath, 'web');

    // Use the Node.js binary path
    const nodeBin = process.execPath;

    console.log('[WEB] isDev:', isDev);
    console.log('[WEB] Path:', webPath);
    console.log('[WEB] Exists:', fs.existsSync(webPath));

    if (isDev) {
      // In dev mode, use next CLI
      const nextBin = path.join(
        __dirname,
        '../../../../node_modules/.pnpm/node_modules/.bin/next',
      );

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
      // In production, use standalone server.js
      // Next.js standalone preserves monorepo structure: web/apps/web/server.js
      const standaloneServer = path.join(webPath, 'apps', 'web', 'server.js');

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
        cwd: path.join(webPath, 'apps', 'web'),
        stdio: 'pipe',
      });
    }

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
    // Update DB size before returning status
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
