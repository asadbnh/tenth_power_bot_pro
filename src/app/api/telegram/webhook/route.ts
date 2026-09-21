import { type NextRequest, NextResponse } from "next/server";
import { handleCommand, handleCallback, handlePhotoMessage, handleTextMessage } from "@/lib/telegram/handlers";
import type { TelegramUpdate } from "@/lib/telegram/bot";

/**
 * POST /api/telegram/webhook
 * Receives all Telegram updates and routes them to the appropriate handler.
 * Secured via secret token header set during webhook registration.
 */
export async function POST(request: NextRequest) {
  // Extract and normalize secret tokens
  const rawExpected = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  const cleanExpected = rawExpected.replace(/^["']|["']$/g, "").trim();

  const receivedSecret = (
    request.headers.get("x-telegram-bot-api-secret-token") ||
    request.headers.get("X-Telegram-Bot-Api-Secret-Token") ||
    ""
  ).replace(/^["']|["']$/g, "").trim();

  // If secret token is present in header, enforce verification
  if (cleanExpected && receivedSecret) {
    if (receivedSecret !== cleanExpected && receivedSecret !== rawExpected) {
      console.warn(`[Telegram Webhook] Secret mismatch: received=${receivedSecret.slice(0, 4)}... expected=${cleanExpected.slice(0, 4)}...`);
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Ensure it is a valid Telegram update structure
  if (!update || typeof update.update_id !== "number") {
    return new NextResponse("Invalid update payload", { status: 400 });
  }

  try {
    if (update.message) {
      const msg = update.message;
      if (msg.photo?.length) {
        await handlePhotoMessage(msg);
      } else if (msg.text?.startsWith("/")) {
        await handleCommand(msg);
      } else if (msg.text) {
        await handleTextMessage(msg);
      }
    } else if (update.callback_query) {
      await handleCallback(update.callback_query);
    }
  } catch (err) {
    console.error("Telegram webhook processing error:", err);
  }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/telegram/webhook
 * Returns webhook status and diagnostic info (for health checks).
 */
export async function GET(request: NextRequest) {
  const rawExpected = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  const cleanExpected = rawExpected.replace(/^["']|["']$/g, "").trim();
  const testHeader = request.headers.get("x-telegram-bot-api-secret-token") || request.headers.get("X-Telegram-Bot-Api-Secret-Token");

  return NextResponse.json({
    status: "active",
    system: "tenth-power-glass Telegram Bot Engine",
    secretConfigured: !!cleanExpected,
    secretLength: cleanExpected.length,
    testHeaderReceived: !!testHeader,
    timestamp: new Date().toISOString(),
  });
}
