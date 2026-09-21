"use server";

/**
 * Server Actions: Telegram Mini App Authentication
 */

import { verifyTelegramInitData } from "../auth/verify-init-data";
import { getAdminProfile } from "../../core/auth";
import { signSession, setSessionCookie, clearSessionCookie, getCurrentAdminSession } from "../auth/session";
import { recordAuditAction } from "../auth/guard";
import type { ApiResponse, MiniAppSession } from "../types";

export async function loginWithTelegramAction(initDataRaw: string): Promise<ApiResponse<MiniAppSession>> {
  if (!initDataRaw) {
    return { success: false, error: "بيانات الاستيثاق من تيليجرام مفقودة." };
  }

  // 1. Verify HMAC-SHA256 signature
  const verification = verifyTelegramInitData(initDataRaw);
  if (!verification.valid || !verification.user) {
    return { success: false, error: verification.error || "فشل التحقق من التوقيع الرقمي لتيليجرام." };
  }

  const tgUser = verification.user;

  // 2. Check admin authorization in Neon DB
  const adminProfile = await getAdminProfile(tgUser.id);
  if (!adminProfile || !adminProfile.is_active) {
    return {
      success: false,
      error: `الحساب (${tgUser.id}) غير مصرح له بالدخول كمسؤول في النظام.`,
    };
  }

  // 3. Issue signed session
  const sessionData: Omit<MiniAppSession, "issuedAt" | "expiresAt"> = {
    adminId: adminProfile.id,
    telegramUserId: tgUser.id,
    username: tgUser.username,
    name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || adminProfile.telegram_username || "المشرف",
    role: adminProfile.role,
  };

  const token = signSession(sessionData);
  await setSessionCookie(token);

  // 4. Audit Log
  await recordAuditAction({
    action: "login",
    entityType: "admin_session",
    entityId: adminProfile.id,
    newValues: { telegramUserId: tgUser.id, role: adminProfile.role },
  });

  return {
    success: true,
    data: {
      ...sessionData,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  };
}

export async function getCurrentSessionAction(): Promise<ApiResponse<MiniAppSession | null>> {
  const session = await getCurrentAdminSession();
  return { success: true, data: session };
}

export async function logoutAction(): Promise<ApiResponse<null>> {
  await clearSessionCookie();
  return { success: true, data: null };
}
