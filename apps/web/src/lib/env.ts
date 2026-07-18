/**
 * Public runtime configuration. Only `NEXT_PUBLIC_*` values are safe to expose
 * to the browser. Falls back to sensible localhost defaults in development.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'INVINCIBLE PROS',
} as const;
