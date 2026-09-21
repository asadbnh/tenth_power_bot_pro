/**
 * WebTaky Telegram Core Client
 * Low-level Telegram Bot API client and message dispatchers.
 */

import type { InlineKeyboard } from "./types";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export function getBaseSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://webtaky.com"
  ).replace(/\/$/, "");
}

export async function telegramRequest(method: string, body: Record<string, unknown>) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err };
    }
    return await res.json();
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  options: {
    reply_markup?: InlineKeyboard;
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    disable_web_page_preview?: boolean;
  } = {}
) {
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text: text.slice(0, 4000),
    parse_mode: options.parse_mode ?? "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    ...options,
  });
}

export async function editMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboard
) {
  return telegramRequest("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: text.slice(0, 4000),
    parse_mode: "HTML",
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  });
}

export async function answerCallbackQuery(queryId: string, text?: string) {
  return telegramRequest("answerCallbackQuery", {
    callback_query_id: queryId,
    text,
    show_alert: false,
  });
}

export async function sendPhoto(
  chatId: number | string,
  photo: string,
  options: { caption?: string; reply_markup?: InlineKeyboard } = {}
) {
  let photoUrl = photo;
  if (photoUrl && photoUrl.startsWith("/")) {
    photoUrl = `${getBaseSiteUrl()}${photoUrl}`;
  }

  return telegramRequest("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption: options.caption,
    parse_mode: "HTML",
    reply_markup: options.reply_markup,
  });
}

export async function deleteMessage(chatId: number | string, messageId: number) {
  return telegramRequest("deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

export async function sendDocument(
  chatId: number | string,
  documentBuffer: Buffer,
  filename: string,
  caption?: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "Bot token missing" };

  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  if (caption) {
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
  }
  const blob = new Blob([new Uint8Array(documentBuffer)], { type: "application/zip" });
  formData.append("document", blob, filename);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to send document" };
  }
}

export async function getFile(fileId: string) {
  return telegramRequest("getFile", { file_id: fileId });
}

export function getTelegramFileUrl(filePath: string): string {
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}
