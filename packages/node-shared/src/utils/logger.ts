import pino, {
  type LoggerOptions,
  type Logger as PinoLogger,
  type TransportSingleOptions,
} from 'pino';

export type { LoggerOptions, PinoLogger };

export type CommonLoggerOptions = LoggerOptions & {
  env?: 'development' | 'test' | 'production';
  pretty?: boolean;
};

export function createPinoLogger(
  name = 'app',
  options: CommonLoggerOptions = {},
): PinoLogger {
  const {
    env,
    pretty,
    level: optLevel,
    ...rest
  } = options as CommonLoggerOptions & { level?: any };

  // Decide pretty printing without reading process.env
  const enablePretty =
    typeof pretty === 'boolean' ? pretty : env ? env !== 'production' : false;

  let transport: TransportSingleOptions | undefined;
  if (enablePretty) {
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: false,
        ignore: 'pid,hostname',
      },
    };
  }

  // Level default: explicit option wins; else env-aware; else info
  const resolvedLevel =
    optLevel ?? (env ? (env === 'production' ? 'info' : 'debug') : 'info');

  return pino(
    {
      name,
      level: resolvedLevel,
      ...rest,
    },
    transport && pino.transport(transport),
  );
}

// Note: NestJS adapter lives in the API app to avoid coupling common logger to NestJS.

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
