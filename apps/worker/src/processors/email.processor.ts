import { Queue, Worker, QueueScheduler, QueueEvents, JobsOptions } from "bullmq"
import { PinoLogger } from "@workspace/logger"

export const EMAIL_QUEUE = "email"

export type EmailJob = {
  to: string
  subject: string
  body: string
}

export function getEmailQueue(redisUrl: string) {
  return new Queue<EmailJob>(EMAIL_QUEUE, {
    connection: { url: redisUrl },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 60 * 60, count: 1000 },
      removeOnFail: { age: 24 * 60 * 60 },
    } satisfies JobsOptions,
  })
}

export async function setupEmailProcessor(opts: {
  redisUrl: string
  concurrency: number
  logger: PinoLogger
}) {
  const { redisUrl, concurrency, logger } = opts

  const scheduler = new QueueScheduler(EMAIL_QUEUE, { connection: { url: redisUrl } })
  await scheduler.waitUntilReady()

  const events = new QueueEvents(EMAIL_QUEUE, { connection: { url: redisUrl } })
  events.on("failed", ({ jobId, failedReason }) => logger.error({ jobId, failedReason }, "email job failed"))
  events.on("completed", ({ jobId }) => logger.info({ jobId }, "email job completed"))

  const worker = new Worker<EmailJob>(
    EMAIL_QUEUE,
    async (job) => {
      const { to, subject } = job.data
      logger.info({ id: job.id, to, subject }, "processing email job")
      // simulate work
      await new Promise((r) => setTimeout(r, 300))
      // throw new Error('demo failure') to test retries
      return { sentAt: new Date().toISOString() }
    },
    { connection: { url: redisUrl }, concurrency },
  )

  worker.on("error", (err) => logger.error({ err }, "worker error"))

  return async () => {
    await Promise.allSettled([worker.close(), events.close(), scheduler.close()])
  }
}

