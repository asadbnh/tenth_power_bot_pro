/**
 * Telegram WebApp initData Cryptographic Verifier
 * Implements Telegram's official HMAC-SHA256 signature verification protocol.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

import crypto from "crypto";
import type { TelegramWebAppUser } from "../../core/types";

export interface TelegramAuthValidationResult {
  valid: boolean;
  user?: TelegramWebAppUser;
  authDate?: Date;
  error?: string;
}

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60; // 24 hours

export function verifyTelegramInitData(initDataRaw: string): TelegramAuthValidationResult {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { valid: false, error: "Bot token not configured on server." };
  }

  if (!initDataRaw || typeof initDataRaw !== "string") {
    return { valid: false, error: "Missing initData." };
  }

  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get("hash");

    if (!hash) {
      return { valid: false, error: "Missing signature hash." };
    }

    params.delete("hash");

    // Sort parameters alphabetically
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckArr: string[] = [];

    for (const key of sortedKeys) {
      const val = params.get(key);
      if (val !== null) {
        dataCheckArr.push(`${key}=${val}`);
      }
    }

    const dataCheckString = dataCheckArr.join("\n");

    // 1. Calculate secret_key = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // 2. Calculate signature = HMAC_SHA256(secret_key, dataCheckString)
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // 3. Timing-safe comparison to prevent timing attacks
    const hashBuf = Buffer.from(hash, "utf8");
    const calcBuf = Buffer.from(calculatedHash, "utf8");

    if (hashBuf.length !== calcBuf.length || !crypto.timingSafeEqual(hashBuf, calcBuf)) {
      return { valid: false, error: "Invalid cryptographic signature." };
    }

    // 4. Validate auth_date expiration
    const authDateStr = params.get("auth_date");
    if (!authDateStr) {
      return { valid: false, error: "Missing auth_date." };
    }

    const authTimestamp = parseInt(authDateStr, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (currentTimestamp - authTimestamp > MAX_AUTH_AGE_SECONDS) {
      return { valid: false, error: "Authentication data has expired. Please reopen the Mini App." };
    }

    // 5. Parse Telegram user payload
    const userStr = params.get("user");
    let user: TelegramWebAppUser | undefined;

    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        return { valid: false, error: "Malformed user payload." };
      }
    }

    if (!user || !user.id) {
      return { valid: false, error: "Missing user identity in data." };
    }

    return {
      valid: true,
      user,
      authDate: new Date(authTimestamp * 1000),
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Verification failed." };
  }
}
