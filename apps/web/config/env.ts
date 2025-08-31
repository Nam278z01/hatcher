import { z } from 'zod';

export const WebEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;

export function loadWebEnv(raw: Record<string, unknown> = process.env) {
  const parsed = WebEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
