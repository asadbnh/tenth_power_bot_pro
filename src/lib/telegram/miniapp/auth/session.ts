/**
 * Telegram Mini App Session Manager
 * Signs and verifies secure session tokens for authorized Telegram admins.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import type { MiniAppSession } from "../types";
import { getAdminProfile } from "../../core/auth";

const SESSION_COOKIE_NAME = "tg_miniapp_session";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret(): string {
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "fallback-secret-key-webtaky-miniapp-2026"
  );
}

export function signSession(session: Omit<MiniAppSession, "issuedAt" | "expiresAt">): string {
  const now = Date.now();
  const fullSession: MiniAppSession = {
    ...session,
    issuedAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };

  const payload = Buffer.from(JSON.stringify(fullSession), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): MiniAppSession | null {
  if (!token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expectedSignature, "utf8");

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const session = JSON.parse(raw) as MiniAppSession;

    if (Date.now() > session.expiresAt) {
      return null; // Expired
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession(): Promise<MiniAppSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    // Verify admin is still active in database
    const profile = await getAdminProfile(session.telegramUserId);
    if (!profile || !profile.is_active) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // Required inside Telegram WebApp iframe / webview
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
