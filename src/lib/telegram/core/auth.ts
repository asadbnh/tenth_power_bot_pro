/**
 * WebTaky Telegram Core Authorization
 * Verifies admin identity against environment whitelist and Neon DB telegram_admins table.
 */

import { createDbClient } from "@/lib/db";
import type { TelegramAdminRole, TelegramAdminUser } from "./types";

export async function isAuthorizedAdmin(telegramUserId: number | string): Promise<boolean> {
  const numericId = Number(telegramUserId);
  if (!numericId || isNaN(numericId)) return false;

  // 1. Check environment variable whitelist
  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (envAdminIds.includes(String(numericId))) {
    return true;
  }

  // 2. Check Neon database telegram_admins table
  const db = createDbClient();
  try {
    const { data } = await db
      .from("telegram_admins")
      .select("id, is_active")
      .eq("telegram_user_id", numericId)
      .eq("is_active", true)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function getAdminProfile(telegramUserId: number | string): Promise<TelegramAdminUser | null> {
  const numericId = Number(telegramUserId);
  if (!numericId || isNaN(numericId)) return null;

  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const isEnvAdmin = envAdminIds.includes(String(numericId));

  const db = createDbClient();
  try {
    const { data } = await db
      .from("telegram_admins")
      .select("id, telegram_user_id, telegram_username, role, is_active, created_at")
      .eq("telegram_user_id", numericId)
      .single();

    if (data) {
      return {
        id: data.id,
        telegram_user_id: Number(data.telegram_user_id),
        telegram_username: data.telegram_username,
        role: (data.role as TelegramAdminRole) || "admin",
        is_active: Boolean(data.is_active),
        created_at: data.created_at,
      };
    }

    if (isEnvAdmin) {
      return {
        id: "env-super-admin",
        telegram_user_id: numericId,
        telegram_username: "SuperAdmin",
        role: "super_admin",
        is_active: true,
      };
    }

    return null;
  } catch {
    if (isEnvAdmin) {
      return {
        id: "env-super-admin",
        telegram_user_id: numericId,
        telegram_username: "SuperAdmin",
        role: "super_admin",
        is_active: true,
      };
    }
    return null;
  }
}
