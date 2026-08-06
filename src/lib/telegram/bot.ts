/**
 * Telegram Bot Service & Keyboard Registry
 * Handles all Telegram API interactions, inline keyboards, and message formatters
 * for comprehensive control over all 35+ database tables in WebTaky.
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

// ─── Core API Request Engine ──────────────────────────────────────────

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

// ─── Inline Keyboards Directory ────────────────────────────────────────

export const Keyboards = {
  mainMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📊 الإحصائيات الشاملة", callback_data: "menu_stats" }, { text: "💼 المبيعات والعملاء", callback_data: "menu_crm" }],
      [{ text: "🛠️ محتوى الموقع والمصطلحات", callback_data: "menu_content" }, { text: "🖼️ الوسائط والأنشطة", callback_data: "menu_media" }],
      [{ text: "⭐ التقييمات والآراء", callback_data: "menu_reviews" }, { text: "📍 صفحات المدن والتسويق", callback_data: "menu_city" }],
      [{ text: "⚙️ إعدادات المنشأة والذكاء الاصطناعي", callback_data: "menu_settings" }, { text: "🛡️ الأمان والعمليات", callback_data: "menu_system" }],
    ],
  }),

  crmMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📋 طلبات عروض الأسعار", callback_data: "crm_quotes" }, { text: "📅 المواعيد والحجوزات", callback_data: "crm_appointments" }],
      [{ text: "💬 الرسائل والاستفسارات", callback_data: "crm_messages" }, { text: "👥 دليل العملاء والمستفيدين", callback_data: "crm_users" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  contentMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🛠️ الخدمات والكتالوج", callback_data: "cnt_services" }, { text: "📁 المشاريع والمعارض", callback_data: "cnt_projects" }],
      [{ text: "✍️ المقالات والأخبار", callback_data: "cnt_articles" }, { text: "📂 التصنيفات الرئيسية", callback_data: "cnt_categories" }],
      [{ text: "❓ الأسئلة الشائعة", callback_data: "cnt_faqs" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  mediaMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🖼️ ألبومات معرض الصور", callback_data: "med_gallery" }, { text: "📁 مكتبة الملفات والوسائط", callback_data: "med_library" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  reviewsMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "⭐ آراء وتقييمات العملاء", callback_data: "rev_customer" }, { text: "💬 آراء العملاء المميزة", callback_data: "rev_testimonials" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  cityMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📍 صفحات المدن (Local SEO)", callback_data: "city_pages" }, { text: "🔗 خدمات المدن المخصصة", callback_data: "city_services" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  settingsMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🏢 بيانات المنشأة", callback_data: "set_company" }, { text: "⚙️ إعدادات المفاتيح", callback_data: "set_keys" }],
      [{ text: "⏰ ساعات العمل والدوام", callback_data: "set_hours" }, { text: "📞 جهات التواصل", callback_data: "set_contacts" }],
      [{ text: "🤖 نماذج وموجهات الذكاء الاصطناعي", callback_data: "set_ai" }, { text: "👑 مسؤولي التلجرام", callback_data: "set_admins" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  systemMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "💾 النسخ الاحتياطية", callback_data: "sys_backups" }, { text: "🛡️ سجل العمليات والأمان", callback_data: "sys_audit" }],
      [{ text: "📢 إشعار جماعي للعملاء", callback_data: "send_notification" }, { text: "🔔 اشتراكات الإشعارات", callback_data: "sys_push" }],
      [{ text: "👁️ أحداث التحليلات", callback_data: "sys_analytics" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  requestActions: (requestId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ تم التواصل", callback_data: `req_contacted:${requestId}` },
        { text: "💰 تم التسعير", callback_data: `req_quoted:${requestId}` },
      ],
      [
        { text: "🏆 تم الفوز", callback_data: `req_won:${requestId}` },
        { text: "❌ خسارة", callback_data: `req_lost:${requestId}` },
      ],
      [{ text: "◀️ قائمة الطلبات", callback_data: "crm_quotes" }],
    ],
  }),

  appointmentActions: (appointmentId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ تأكيد الموعد", callback_data: `apt_confirm:${appointmentId}` },
        { text: "🏁 مكتمل", callback_data: `apt_complete:${appointmentId}` },
      ],
      [
        { text: "❌ إلغاء الموعد", callback_data: `apt_cancel:${appointmentId}` },
      ],
      [{ text: "◀️ المواعيد", callback_data: "crm_appointments" }],
    ],
  }),

  reviewActions: (reviewId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ موافقة ونشر", callback_data: `review_approve:${reviewId}` },
        { text: "❌ رفض التقييم", callback_data: `review_reject:${reviewId}` },
      ],
      [{ text: "◀️ التقييمات", callback_data: "rev_customer" }],
    ],
  }),

  toggleStatus: (entity: string, id: string, currentStatus: boolean): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: currentStatus ? "🔴 إيقاف/إخفاء" : "🟢 تفعيل/إظهار", callback_data: `toggle_${entity}:${id}:${!currentStatus}` }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  backToMenu: (): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }]],
  }),

  backToSubmenu: (submenu: string): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ رجوع", callback_data: submenu }]],
  }),
};

// ─── Message Formatters Directory ──────────────────────────────────────

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
🛠️ <b>الخدمات:</b> ${data.services.join(", ")}
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
  return `💬 <b>رسالة تواصل جديدة!</b>

👤 <b>الاسم:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.email ? `📧 <b>البريد:</b> ${data.email}\n` : ""}${data.subject ? `📌 <b>الموضوع:</b> ${data.subject}\n` : ""}
💬 <b>الرسالة:</b>
${data.content}

🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatAppointmentAlert(data: {
  id: string;
  userName: string;
  phone: string;
  serviceName?: string;
  preferredDate?: string;
  notes?: string;
}) {
  return `📅 <b>حجز موعد جديد!</b>

👤 <b>العميل:</b> ${data.userName}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${data.preferredDate ? `📅 <b>الموعد المطلوب:</b> ${data.preferredDate}\n` : ""}${data.notes ? `📝 <b>ملاحظات:</b> ${data.notes}\n` : ""}
🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatStatsMessage(stats: {
  totalRequests: number;
  newRequests: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalServices: number;
  totalProjects: number;
  totalArticles: number;
  totalReviews: number;
  pendingReviews: number;
  totalViews: number;
  todayViews: number;
}) {
  const now = new Date().toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `📊 <b>إحصائيات المنصة الشاملة</b>
📅 ${now}

━━━━━━━━━━━━━━━━━━
📋 <b>طلبات الأسعار:</b> <b>${stats.totalRequests}</b> (جديد: ${stats.newRequests} 🆕)
📅 <b>المواعيد:</b> <b>${stats.totalAppointments}</b> (قيد الانتظار: ${stats.pendingAppointments} ⏳)
💬 <b>الرسائل:</b> <b>${stats.totalMessages}</b> (غير مقروءة: ${stats.unreadMessages} 🔴)
👥 <b>دليل العملاء (Leads):</b> <b>${stats.totalUsers}</b>
🛠️ <b>الخدمات:</b> <b>${stats.totalServices}</b>
📁 <b>المشاريع:</b> <b>${stats.totalProjects}</b>
✍️ <b>المقالات:</b> <b>${stats.totalArticles}</b>
⭐ <b>التقييمات:</b> <b>${stats.totalReviews}</b> (تنتظر الموافقة: ${stats.pendingReviews} ⏳)
👁️ <b>الزيارات الكلية:</b> <b>${stats.totalViews.toLocaleString("ar-SA")}</b> (اليوم: ${stats.todayViews.toLocaleString("ar-SA")})
━━━━━━━━━━━━━━━━━━`;
}
