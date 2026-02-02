/**
 * Logger estructurado para backend
 * 
 * Proporciona logging consistente con contexto (tenantId, userId, requestId)
 * y niveles de log apropiados para desarrollo y producción.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  tenantId?: string
  userId?: string
  requestId?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatError(error: unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    }
    return {
      name: 'UnknownError',
      message: String(error),
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }
    
    if (error) {
      entry.error = this.formatError(error)
    }

    // En desarrollo, usar console con colores
    if (this.isDevelopment) {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
      const contextStr = context ? ` ${JSON.stringify(context)}` : ''
      const errorStr = entry.error ? `\n${entry.error.stack || entry.error.message}` : ''

      switch (level) {
        case 'debug':
          console.debug(`${prefix} ${message}${contextStr}${errorStr}`)
          break
        case 'info':
          console.info(`${prefix} ${message}${contextStr}${errorStr}`)
          break
        case 'warn':
          console.warn(`${prefix} ${message}${contextStr}${errorStr}`)
          break
        case 'error':
          console.error(`${prefix} ${message}${contextStr}${errorStr}`)
          break
      }
    } else {
      // En producción, usar JSON estructurado
      console.log(JSON.stringify(entry))
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.log('error', message, context, error)
  }

  /**
   * Crea un logger con contexto predefinido
   * Útil para propagar tenantId, userId, requestId a través de una request
   */
  withContext(context: LogContext): Logger {
    const childLogger = new Logger()
    const originalLog = childLogger.log.bind(childLogger)
    
    childLogger.log = (level: LogLevel, message: string, additionalContext?: LogContext, error?: unknown) => {
      originalLog(level, message, { ...context, ...additionalContext }, error)
    }

    return childLogger
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Exportar clase para casos especiales
export { Logger }
export type { LogContext, LogLevel }
