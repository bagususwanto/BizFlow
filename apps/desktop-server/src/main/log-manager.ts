import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: 'API' | 'WEB' | 'SYSTEM';
  message: string;
}

export interface LogManagerEvents {
  log: (entry: LogEntry) => void;
  'logs-cleared': () => void;
}

export class LogManager extends EventEmitter {
  // -- Typed emit/on overrides --
  emit<K extends keyof LogManagerEvents>(
    event: K,
    ...args: Parameters<LogManagerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof LogManagerEvents>(
    event: K,
    listener: LogManagerEvents[K],
  ): this {
    return super.on(event, listener);
  }

  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000; // Ring buffer size
  private logFilePath: string;
  private logStream: fs.WriteStream | null = null;

  constructor() {
    super();
    const logsDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file with current date
    const today = new Date().toISOString().split('T')[0];
    this.logFilePath = path.join(logsDir, `bizflow-${today}.log`);

    // Open write stream
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
    console.log('[LOG-MANAGER] Logging to', this.logFilePath);
  }

  /**
   * Add a log entry
   */
  addLog(
    level: LogEntry['level'],
    source: LogEntry['source'],
    message: string,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message: message.trim(),
    };

    // Add to ring buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift(); // Remove oldest
    }

    // Write to file
    if (this.logStream) {
      const logLine = `[${entry.timestamp}] [${entry.level}] [${entry.source}] ${entry.message}\n`;
      this.logStream.write(logLine);
    }

    // Emit event for real-time updates
    this.emit('log', entry);
  }

  /**
   * Parse log message to determine level
   */
  parseLogLevel(message: string): LogEntry['level'] {
    const upperMessage = message.toUpperCase();
    if (
      upperMessage.includes('ERROR') ||
      upperMessage.includes('FAIL') ||
      upperMessage.includes('EXCEPTION')
    ) {
      return 'ERROR';
    }
    if (
      upperMessage.includes('WARN') ||
      upperMessage.includes('WARNING') ||
      upperMessage.includes('DEPRECATED')
    ) {
      return 'WARN';
    }
    if (upperMessage.includes('DEBUG')) {
      return 'DEBUG';
    }
    return 'INFO';
  }

  /**
   * Get all logs in memory
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Filter logs by level
   */
  filterByLevel(level: LogEntry['level'] | 'ALL'): LogEntry[] {
    if (level === 'ALL') {
      return this.getAllLogs();
    }
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Search logs by text
   */
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter((log) =>
      log.message.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Filter logs by source
   */
  filterBySource(source: LogEntry['source'] | 'ALL'): LogEntry[] {
    if (source === 'ALL') {
      return this.getAllLogs();
    }
    return this.logs.filter((log) => log.source === source);
  }

  /**
   * Combined filter
   */
  filter(options: {
    level?: LogEntry['level'] | 'ALL';
    source?: LogEntry['source'] | 'ALL';
    search?: string;
  }): LogEntry[] {
    let filtered = this.getAllLogs();

    if (options.level && options.level !== 'ALL') {
      filtered = filtered.filter((log) => log.level === options.level);
    }

    if (options.source && options.source !== 'ALL') {
      filtered = filtered.filter((log) => log.source === options.source);
    }

    if (options.search) {
      const lowerQuery = options.search.toLowerCase();
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(lowerQuery),
      );
    }

    return filtered;
  }

  /**
   * Export logs to text file
   */
  async exportLogs(outputPath: string): Promise<void> {
    const content = this.logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level}] [${log.source}] ${log.message}`,
      )
      .join('\n');

    await fs.promises.writeFile(outputPath, content, 'utf-8');
    console.log('[LOG-MANAGER] Exported logs to', outputPath);
  }

  /**
   * Clear logs in memory (not file)
   */
  clearLogs(): void {
    this.logs = [];
    this.emit('logs-cleared');
  }

  /**
   * Get current log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * Close log stream
   */
  close(): void {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}
