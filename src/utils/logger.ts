/**
 * Structured Logger for Drip AI.
 * Outputs formatted logs with timestamps, levels, and request trace IDs.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private static formatMessage(level: LogLevel, message: string, requestId?: string): string {
    const timestamp = new Date().toISOString();
    const traceId = requestId ? `[${requestId}]` : '[SYSTEM]';
    return `[${timestamp}] [${level}] ${traceId} ${message}`;
  }

  public static info(message: string, requestId?: string): void {
    console.log(this.formatMessage('INFO', message, requestId));
  }

  public static warn(message: string, requestId?: string): void {
    console.warn(this.formatMessage('WARN', message, requestId));
  }

  public static error(message: string, error?: unknown, requestId?: string): void {
    let errMessage = message;
    if (error instanceof Error) {
      errMessage += ` - Error: ${error.message}\nStack: ${error.stack}`;
    } else if (error) {
      errMessage += ` - Error: ${JSON.stringify(error)}`;
    }
    console.error(this.formatMessage('ERROR', errMessage, requestId));
  }
}
