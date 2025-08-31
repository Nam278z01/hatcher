import { z } from 'zod';

export const ApiEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  SWAGGER: z.coerce.boolean().default(true),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadWebEnv(raw: Record<string, unknown> = process.env) {
  const parsed = ApiEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
