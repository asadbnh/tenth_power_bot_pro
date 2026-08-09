import { type NextRequest, NextResponse } from "next/server";
import { handleCommand, handleCallback, handlePhotoMessage, handleTextMessage } from "@/lib/telegram/handlers";
import type { TelegramUpdate } from "@/lib/telegram/bot";

/**
 * POST /api/telegram/webhook
 * Receives all Telegram updates and routes them to the appropriate handler.
 * Secured via secret token header set during webhook registration.
 */
export async function POST(request: NextRequest) {
  // Verify secret token if present
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
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
 * Returns webhook status (for health checks).
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    system: "WebTaky Telegram Bot Engine",
    timestamp: new Date().toISOString(),
  });
}
