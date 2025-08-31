import { z } from 'zod';

export const WorkerEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),
});

export type WorkerEnv = z.infer<typeof WorkerEnvSchema>;

export function loadWorkerEnv(raw: Record<string, unknown> = process.env) {
  const parsed = WorkerEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
