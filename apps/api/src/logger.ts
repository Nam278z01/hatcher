import type { LoggerService } from '@nestjs/common';
import {
  createPinoLogger,
  type CommonLoggerOptions,
  type PinoLogger,
} from '@workspace/node-shared';

export class NestPinoLogger implements LoggerService {
  private context?: string;
  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(
      { ctx: this.context, args: optionalParams },
      toMessage(message),
    );
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(
      { ctx: this.context, args: optionalParams },
      toMessage(message),
    );
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(
      { ctx: this.context, args: optionalParams },
      toMessage(message),
    );
  }
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(
      { ctx: this.context, args: optionalParams },
      toMessage(message),
    );
  }
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.trace(
      { ctx: this.context, args: optionalParams },
      toMessage(message),
    );
  }

  child(bindings: Record<string, unknown>) {
    return new NestPinoLogger(this.logger.child(bindings));
  }
}

export function createNestPinoLogger(
  name = 'api',
  options: CommonLoggerOptions = {},
): NestPinoLogger {
  return new NestPinoLogger(createPinoLogger(name, options));
}

function toMessage(input: any): string {
  return typeof input === 'string' ? input : safeStringify(input);
}

function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}
