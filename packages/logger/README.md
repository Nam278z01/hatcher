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
import { ConfigService } from '@nestjs/config'
import { createNestPinoLogger } from '@workspace/logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const cfg = app.get(ConfigService)
  const level = cfg.get<string>('LOG_LEVEL')
  const logger = createNestPinoLogger('api', level ? { level: level as any } : {})
  app.useLogger(logger)
  await app.listen(cfg.get<number>('PORT', { infer: true }) ?? 3000)
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

## Worker quick start

```ts
// apps/worker/src/main.ts
import { createPinoLogger } from '@workspace/logger'

const logger = createPinoLogger('worker', { level: 'debug' })
logger.info({ boot: true }, 'worker starting')
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

## Behavior & env

- Pretty vs JSON is based on `NODE_ENV` only:
  - `production` → JSON logs
  - other → pretty output via `pino-pretty` (colors, timestamps)
- Log level is controlled by the caller (API/worker) via options:
  - `createNestPinoLogger('api', { level: 'debug' })`
  - In this repo, API reads `LOG_LEVEL` from `ConfigService` and passes it in.

## Tips

- Prefer structured logs: pass objects (e.g. `{ userId, orderId }`) so they become fields in JSON.
- For HTTP access logs, prefer framework-specific middleware (e.g., Nest interceptors) that write via the same logger.

## Dev workflow

- This package builds to `dist/`. Turbo runs `dev` (tsc -w) so edits rebuild automatically.
- API/worker import from `dist/`. If you want API to restart when logger changes, wire a file watcher (e.g., nodemon) to watch `packages/logger/dist/**`.
