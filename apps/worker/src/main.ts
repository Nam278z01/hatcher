import { createPinoLogger } from "@workspace/node-shared";
import {
  setupEmailProcessor,
  getEmailQueue,
} from "./processors/email.processor";
import { baseSetting } from "./config/base_setting";

async function main() {
  const logger = createPinoLogger("worker", {
    env: baseSetting.env,
    level: baseSetting.logLevel,
  });

  const redisUrl = baseSetting.redisUrl;
  const concurrency = baseSetting.concurrency;

  logger.info({ redisUrl, concurrency }, "booting worker");

  // Register processors
  const closeables = [
    await setupEmailProcessor({ redisUrl, concurrency, logger }),
  ];

  // Example: schedule a demo job if DEMO_JOBS=1
  if (process.env.DEMO_JOBS === "1") {
    await getEmailQueue(redisUrl).add(
      "send",
      { to: "user@example.com", subject: "Hello", body: "Welcome!" },
      {
        delay: 1000,
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );
    logger.info("demo email job enqueued");
  }

  // Graceful shutdown
  const shutdown = async (sig: string) => {
    logger.warn({ sig }, "shutting down worker");
    await Promise.allSettled(closeables.map((c) => c()));
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
