// Centralized logging system

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      metadata,
      stack: level === 'error' ? new Error().stack : undefined
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[entry.level];

      console[entry.level](`${emoji} ${entry.message}`, entry.metadata || '');
      
      if (entry.stack && entry.level === 'error') {
        console.error('Stack trace:', entry.stack);
      }
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, metadata);
    this.addLog(entry);
  }

  info(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, metadata);
    this.addLog(entry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, metadata);
    this.addLog(entry);
  }

  error(message: string, error?: unknown, metadata?: Record<string, any>): void {
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    };

    const entry = this.createLogEntry('error', message, errorMetadata);
    this.addLog(entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Method to send logs to external service (implement as needed)
  async sendLogs(): Promise<void> {
    try {
      // Here you would send logs to your logging service
      // For now, just log to console in production
      if (process.env.NODE_ENV === 'production') {
        console.log('Sending logs to external service...', this.logs);
      }
    } catch (error) {
      console.error('Failed to send logs:', error);
    }
  }
}

export const logger = new Logger();

// React hook for logging
export function useLogger() {
  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    getLogs: logger.getLogs.bind(logger),
    clearLogs: logger.clearLogs.bind(logger),
    exportLogs: logger.exportLogs.bind(logger),
    sendLogs: logger.sendLogs.bind(logger)
  };
}

// Global error handler setup
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      type: 'unhandledrejection',
      url: window.location.href
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error, {
      type: 'uncaught',
      url: window.location.href,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}

// Auto-setup in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setupGlobalErrorHandling();
}
