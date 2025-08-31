import { loadWorkerEnv } from "./env.js"

const env = loadWorkerEnv()

export const baseSetting = {
  env: env.NODE_ENV,
  redisUrl: env.REDIS_URL,
  concurrency: env.WORKER_CONCURRENCY,
  logLevel: env.LOG_LEVEL,
}

export type BaseSetting = typeof baseSetting
