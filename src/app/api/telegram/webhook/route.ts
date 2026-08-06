import { type NextRequest, NextResponse } from "next/server";
import { handleCommand, handleCallback } from "@/lib/telegram/handlers";
import type { TelegramUpdate } from "@/lib/telegram/bot";

/**
 * POST /api/telegram/webhook
 * Receives all Telegram updates and routes them to the appropriate handler.
 * Secured via secret token header set during webhook registration.
 */
export async function POST(request: NextRequest) {
  // Verify secret token
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
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
      if (msg.text?.startsWith("/")) {
        await handleCommand(msg);
      }
    } else if (update.callback_query) {
      await handleCallback(update.callback_query);
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
    // Return 200 always — Telegram will retry on non-200
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
    timestamp: new Date().toISOString(),
  });
}
