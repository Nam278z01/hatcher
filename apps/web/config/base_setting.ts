import { loadWebEnv } from "./env"

const env = loadWebEnv(process.env as any)

export const baseSetting = {
  env: env.NODE_ENV,
  apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL,
}

export type BaseSetting = typeof baseSetting

