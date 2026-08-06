/**
 * Telegram Bot Service
 * Handles all Telegram API interactions for the admin system.
 * Uses service_role Supabase client for full admin access.
 */

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type TelegramMessage = {
  message_id: number;
  from: { id: number; first_name: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  photo?: Array<{ file_id: string; file_size: number; width: number; height: number }>;
  document?: { file_id: string; file_name: string; mime_type: string };
  date: number;
};

export type TelegramCallbackQuery = {
  id: string;
  from: { id: number; first_name: string };
  message: TelegramMessage;
  data: string;
};

export type InlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export type InlineKeyboard = {
  inline_keyboard: InlineKeyboardButton[][];
};

// ─── Core API Calls ──────────────────────────────────────────────────

async function telegramRequest(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Telegram API error [${method}]:`, err);
  }
  return res.json();
}

export async function sendMessage(
  chatId: number,
  text: string,
  options: {
    reply_markup?: InlineKeyboard;
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    disable_web_page_preview?: boolean;
  } = {}
) {
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parse_mode ?? "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    ...options,
  });
}

export async function editMessage(
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboard
) {
  return telegramRequest("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
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
  chatId: number,
  photoUrl: string,
  caption?: string
) {
  return telegramRequest("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  });
}

export async function getFile(fileId: string) {
  return telegramRequest("getFile", { file_id: fileId });
}

export function getTelegramFileUrl(filePath: string) {
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}

// ─── Inline Keyboard Builders ─────────────────────────────────────────

export const Keyboards = {
  mainMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📊 الإحصائيات", callback_data: "stats" }, { text: "📋 الطلبات الجديدة", callback_data: "new_requests" }],
      [{ text: "🛠️ الخدمات", callback_data: "manage_services" }, { text: "📁 المشاريع", callback_data: "manage_projects" }],
      [{ text: "✍️ المقالات", callback_data: "manage_articles" }, { text: "🖼️ معرض الصور", callback_data: "manage_gallery" }],
      [{ text: "⭐ التقييمات", callback_data: "manage_reviews" }, { text: "❓ الأسئلة الشائعة", callback_data: "manage_faqs" }],
      [{ text: "📢 إشعار للعملاء", callback_data: "send_notification" }, { text: "💾 نسخ احتياطية", callback_data: "backups" }],
      [{ text: "⚙️ الإعدادات", callback_data: "settings" }],
    ],
  }),

  requestActions: (requestId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ تواصل تم", callback_data: `req_contacted:${requestId}` },
        { text: "💰 تم التسعير", callback_data: `req_quoted:${requestId}` },
      ],
      [
        { text: "🏆 فوز", callback_data: `req_won:${requestId}` },
        { text: "❌ خسارة", callback_data: `req_lost:${requestId}` },
      ],
      [{ text: "◀️ رجوع", callback_data: "new_requests" }],
    ],
  }),

  reviewActions: (reviewId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ موافقة ونشر", callback_data: `review_approve:${reviewId}` },
        { text: "❌ رفض", callback_data: `review_reject:${reviewId}` },
      ],
      [{ text: "◀️ رجوع", callback_data: "manage_reviews" }],
    ],
  }),

  backToMenu: (): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }]],
  }),

  confirmAction: (action: string, label: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: `✅ ${label}`, callback_data: `confirm:${action}` },
        { text: "❌ إلغاء", callback_data: "main_menu" },
      ],
    ],
  }),
};

// ─── Message Formatters ───────────────────────────────────────────────

export function formatQuoteAlert(data: {
  name: string;
  phone: string;
  services: string[];
  city: string;
  budget: string;
  urgency: string;
  description: string;
  id: string;
}) {
  return `🔔 <b>طلب عرض سعر جديد!</b>

👤 <b>الاسم:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
🛠️ <b>الخدمة:</b> ${data.services.join(", ")}
📍 <b>المدينة:</b> ${data.city}
💰 <b>الميزانية:</b> ${data.budget}
⚡ <b>الأولوية:</b> ${data.urgency}

📝 <b>التفاصيل:</b>
${data.description}

🆔 <b>رقم الطلب:</b> <code>${data.id}</code>`;
}

export function formatMessageAlert(data: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  content: string;
  id: string;
}) {
  return `💬 <b>رسالة جديدة!</b>

👤 <b>الاسم:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.email ? `📧 <b>البريد:</b> ${data.email}\n` : ""}${data.subject ? `📌 <b>الموضوع:</b> ${data.subject}\n` : ""}
💬 <b>الرسالة:</b>
${data.content}

🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatStatsMessage(stats: {
  totalRequests: number;
  newRequests: number;
  totalMessages: number;
  unreadMessages: number;
  totalViews: number;
  todayViews: number;
}) {
  const now = new Date().toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `📊 <b>إحصائيات اليوم</b>
📅 ${now}

━━━━━━━━━━━━━━━━━━
📋 <b>طلبات عروض الأسعار</b>
  • الإجمالي: <b>${stats.totalRequests}</b>
  • جديدة: <b>${stats.newRequests}</b> 🆕

💬 <b>الرسائل</b>
  • الإجمالي: <b>${stats.totalMessages}</b>
  • غير مقروءة: <b>${stats.unreadMessages}</b> 🔴

👁️ <b>الزيارات</b>
  • إجمالي: <b>${stats.totalViews.toLocaleString("ar-SA")}</b>
  • اليوم: <b>${stats.todayViews.toLocaleString("ar-SA")}</b>
━━━━━━━━━━━━━━━━━━`;
}
