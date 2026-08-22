import { z } from "zod";

/**
 * Server-side environment variables schema.
 * These are validated at build time and NOT exposed to the client.
 */
const serverEnvSchema = z.object({
  // Database (Neon PostgreSQL)
  DATABASE_URL: z.string().min(1),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().default("webtaky-media"),
  R2_BUCKET_ENDPOINT: z.string().url().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1).optional(),
  TELEGRAM_ADMIN_IDS: z.string().min(1).optional(),

  // AI
  AI_PROVIDER: z.enum(["openai", "gemini"]).default("gemini"),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Push Notifications
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_SUBJECT: z.string().min(1).optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Security
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  CSRF_SECRET: z.string().min(1).optional(),
});

/**
 * Client-side environment variables schema.
 * These are prefixed with NEXT_PUBLIC_ and available in the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("https://powerof10.netlify.app"),
  NEXT_PUBLIC_APP_NAME: z.string().default("WebTaky"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["ar", "en"]).default("ar"),
  NEXT_PUBLIC_SUPPORTED_LOCALES: z.string().default("ar,en"),

  NEXT_PUBLIC_R2_CUSTOM_DOMAIN: z.string().min(1).optional(),

  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_SNAP_PIXEL_ID: z.string().optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates and returns server environment variables.
 * Only call this in server-side code (Server Components, Route Handlers, Server Actions).
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid server environment variables");
  }
  return parsed.data;
}

/**
 * Validates and returns client environment variables.
 * Safe to call anywhere.
 */
export function getClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPPORTED_LOCALES: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
    NEXT_PUBLIC_R2_CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    NEXT_PUBLIC_SNAP_PIXEL_ID: process.env.NEXT_PUBLIC_SNAP_PIXEL_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables");
  }
  return parsed.data;
}

/** Helper to get supported locales as an array */
export function getSupportedLocales(): string[] {
  return (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "ar,en").split(",");
}

/** Helper to get default locale */
export function getDefaultLocale(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "ar";
}
