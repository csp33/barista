type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export class Logger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  static info(module: string, message: string, meta?: Record<string, unknown>): void {
    this.log('INFO', module, message, meta);
  }

  static warn(module: string, message: string, meta?: Record<string, unknown>): void {
    this.log('WARN', module, message, meta);
  }

  static error(module: string, message: string, error?: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error || '');
    this.log('ERROR', module, `${message} ${errorMsg ? `| Details: ${errorMsg}` : ''}`);
  }

  static debug(module: string, message: string, meta?: Record<string, unknown>): void {
    this.log('DEBUG', module, message, meta);
  }

  private static log(
    level: LogLevel,
    module: string,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    const timestamp = this.formatTime();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${level}] [${module}] ${message}${metaStr}`);
  }
}
