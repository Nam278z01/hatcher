# @workspace/logger

Pino-based logger for the monorepo, with a small NestJS `LoggerService` adapter.

- Runtime: Pino (fast, JSON logs in prod; pretty in dev)
- Nest: `NestPinoLogger` implements `LoggerService`
- Tiny API: create a base Pino or a Nest-adapted logger

## Install

Internal package — already wired in the workspace. If you use it outside, make sure `pino` and `pino-pretty` are installed.

## Quick start (NestJS)

```ts
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { createNestPinoLogger } from '@workspace/logger'

async function bootstrap() {
  const logger = createNestPinoLogger('api')
  const app = await NestFactory.create(AppModule, { logger })
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
```

Now `Logger` from `@nestjs/common` routes through Pino:

```ts
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name)

  doWork() {
    this.logger.log('doing work')
    this.logger.warn({ hint: 'structured logs are welcome' })
    this.logger.error(new Error('boom'))
  }
}
```

## API

```ts
import { createPinoLogger, createNestPinoLogger, NestPinoLogger } from '@workspace/logger'

const pinoLogger = createPinoLogger('app', { level: 'debug' })
const nestLogger: NestPinoLogger = createNestPinoLogger('api')

// Child logger with extra bindings
const child = nestLogger.child({ context: 'MyService' })
child.log('hello')
```

## Environment

- `NODE_ENV`:
  - `production` → JSON logs (no pretty transport)
  - other → `pino-pretty` transport with colors and timestamps
- `LOG_LEVEL`: overrides level (default `debug` in dev, `info` in prod)

## Tips

- Prefer structured logs: pass objects (e.g. `{ userId, orderId }`) so they become fields in JSON.
- For HTTP access logs, prefer framework-specific middleware (e.g., Nest interceptors) that write via the same logger.

## Build/publish

This package is intended for internal use via TS path references. If you plan to publish or consume from plain JS:

- Add a `build` script (e.g., `tsc -p packages/logger/tsconfig.json`)
- Point `package.json#exports` to built files in `dist/`

```jsonc
{
  "scripts": { "build": "tsc -p tsconfig.json" },
  "exports": { ".": "./dist/index.js" }
}
```

