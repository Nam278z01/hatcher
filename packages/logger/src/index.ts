import pino, { Logger as PinoLogger, LoggerOptions, TransportSingleOptions } from "pino"
import type { LoggerService } from "@nestjs/common"

export type { PinoLogger, LoggerOptions }

export function createPinoLogger(
  name = "app",
  options: LoggerOptions = {},
): PinoLogger {
  const isProd = process.env.NODE_ENV === "production"

  let transport: TransportSingleOptions | undefined
  if (!isProd) {
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        singleLine: false,
        ignore: "pid,hostname",
      },
    }
  }

  // Avoid passing level: undefined which breaks pino defaulting.
  // Do NOT read LOG_LEVEL here; caller (api/worker) controls env.
  const { level: optLevel, ...rest } = options as LoggerOptions & { level?: any }
  const resolvedLevel = optLevel ?? (isProd ? "info" : "debug")

  return pino(
    {
      name,
      level: resolvedLevel,
      ...rest,
    },
    transport && pino.transport(transport),
  )
}

export class NestPinoLogger implements LoggerService {
  private context?: string
  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string) {
    this.context = context
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info({ ctx: this.context, args: optionalParams }, toMessage(message))
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error({ ctx: this.context, args: optionalParams }, toMessage(message))
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn({ ctx: this.context, args: optionalParams }, toMessage(message))
  }
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug({ ctx: this.context, args: optionalParams }, toMessage(message))
  }
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.trace({ ctx: this.context, args: optionalParams }, toMessage(message))
  }

  child(bindings: Record<string, unknown>) {
    return new NestPinoLogger(this.logger.child(bindings))
  }
}

export function createNestPinoLogger(
  name = "api",
  options: LoggerOptions = {},
): NestPinoLogger {
  return new NestPinoLogger(createPinoLogger(name, options))
}

function toMessage(input: any): string {
  return typeof input === "string" ? input : safeStringify(input)
}

function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch {
    return String(obj)
  }
}
