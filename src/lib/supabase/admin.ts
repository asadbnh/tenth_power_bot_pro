import { createDbClient } from "@/lib/db";

/**
 * Database client for Server Actions, Route Handlers, and Telegram Bot.
 * Powered by Neon SQL (PostgreSQL Serverless).
 */
export function createAdminClient() {
  return createDbClient();
}

export { createDbClient };
