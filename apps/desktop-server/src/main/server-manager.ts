import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as net from 'net';
import { app } from 'electron';

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
  private status: ServerStatus = {
    api: 'stopped',
    web: 'stopped',
    apiPort: 3000,
    webPort: 3001,
    apiUrl: 'http://localhost:3000',
    webUrl: 'http://localhost:3001',
  };

  constructor() {
    super();
  }

  async startAll(): Promise<void> {
    this.emit('status-change', 'Starting servers...');

    // Check and find available ports
    this.apiPort = await this.findAvailablePort(3000);
    this.webPort = await this.findAvailablePort(3001);

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
    });

    // Health check
    await this.healthCheck(this.status.apiUrl + '/api/v1/health', 30);
    this.status.api = 'running';
    this.emit('status-change', 'API server running');
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
    });

    // Health check
    await this.healthCheck(this.status.webUrl, 30);
    this.status.web = 'running';
    this.emit('status-change', 'Web server running');
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

  private async findAvailablePort(preferredPort: number): Promise<number> {
    const isAvailable = await this.isPortAvailable(preferredPort);
    if (isAvailable) {
      return preferredPort;
    }

    // Try next 10 ports
    for (let port = preferredPort + 1; port < preferredPort + 10; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }

    throw new Error(`No available port found near ${preferredPort}`);
  }

  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  }

  async stopAll(): Promise<void> {
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
}
