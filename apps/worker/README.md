# @workspace/worker (BullMQ)

Background jobs/queue processor using BullMQ and Redis. Ideal for non-blocking tasks like image processing, emails, ETL, and ML inference. Uses `@workspace/logger` (Pino) for structured logs.

## Requirements
- Redis reachable at `REDIS_URL` (default `redis://localhost:6379`).

## Scripts
- Dev: `pnpm --filter worker dev`
- Lint: `pnpm --filter worker lint`
- Build: `pnpm --filter worker build`
- Start (after build): `pnpm --filter worker start`

## Environment
- `REDIS_URL`: Redis connection (default `redis://localhost:6379`).
- `WORKER_CONCURRENCY`: number of parallel jobs per worker (default `5`).
- `DEMO_JOBS=1`: enqueue a demo email job on boot.
- `NODE_ENV`/`LOG_LEVEL`: control Pino logging (pretty in dev, JSON in prod).

## Structure
- `apps/worker/src/main.ts`: bootstraps logger, registers processors, graceful shutdown.
- `apps/worker/src/processors/email.processor.ts`: example processor with queue, scheduler, events.

## Add a new processor
1) Create a processor file under `apps/worker/src/processors/<name>.processor.ts` that exports a `setup<Name>Processor` returning a close function and a `get<Name>Queue` to enqueue jobs.
2) Register it in `apps/worker/src/main.ts`:
```ts
import { setupImageProcessor } from './processors/image.processor'
...
const closeables = [
  await setupEmailProcessor({ redisUrl, concurrency, logger }),
  await setupImageProcessor({ redisUrl, concurrency, logger }),
]
```

## Enqueue jobs (from API or any Node app)
```ts
import { Queue } from 'bullmq'
const q = new Queue('email', { connection: { url: process.env.REDIS_URL } })
await q.add('send', { to: 'user@example.com', subject: 'Hello', body: 'Welcome!' }, {
  delay: 1000,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
})
```

## Graceful shutdown
SIGINT/SIGTERM triggers closing workers, event streams, and schedulers to avoid lost jobs.

## Scaling
Run multiple replicas of the worker to increase throughput. BullMQ coordinates via Redis; ensure adequate Redis capacity.

