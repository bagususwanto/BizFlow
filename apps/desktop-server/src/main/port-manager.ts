import * as net from 'net';

/**
 * Port Manager - handles port availability checking and discovery
 */
export class PortManager {
  /**
   * Check if a port is available
   */
  static async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(true);
      });

      server.listen(port);
    });
  }

  /**
   * Find next available port starting from preferred port
   */
  static async findAvailablePort(
    preferredPort: number,
    maxAttempts: number = 10,
  ): Promise<number> {
    let port = preferredPort;

    for (let i = 0; i < maxAttempts; i++) {
      const available = await this.isPortAvailable(port);
      if (available) {
        return port;
      }
      port++;
    }

    throw new Error(
      `Could not find available port after ${maxAttempts} attempts starting from ${preferredPort}`,
    );
  }

  /**
   * Check multiple ports at once
   */
  static async checkPorts(
    ports: number[],
  ): Promise<{ port: number; available: boolean }[]> {
    const results = await Promise.all(
      ports.map(async (port) => ({
        port,
        available: await this.isPortAvailable(port),
      })),
    );
    return results;
  }
}
