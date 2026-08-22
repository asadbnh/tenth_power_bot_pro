/**
 * Telegram Bot Service & Keyboard Registry
 * Handles all Telegram API interactions, inline keyboards, and message formatters
 * for comprehensive control over all 40 database tables in WebTaky.
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
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
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
    text: text.slice(0, 4000),
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
  chatId: number,
  photoUrl: string,
  caption?: string
) {
  return telegramRequest("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption?.slice(0, 1024),
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
      [{ text: "🛠️ محتوى الموقع والخدمات", callback_data: "menu_content" }, { text: "🖼️ الوسائط والصور", callback_data: "menu_media" }],
      [{ text: "⭐ التقييمات والآراء", callback_data: "menu_reviews" }, { text: "📍 صفحات المدن والتسويق", callback_data: "menu_marketing" }],
      [{ text: "⚙️ إعدادات المنشأة والفروع", callback_data: "menu_settings" }, { text: "🛡️ الأمان والإشعارات", callback_data: "menu_system" }],
      [{ text: "🔔 إرسال إشعار فوري للتطبيق", callback_data: "push_broadcast_prompt" }],
    ],
  }),

  crmMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📋 طلبات عروض الأسعار", callback_data: "crm_quotes" }, { text: "📅 المواعيد والحجوزات", callback_data: "crm_appointments" }],
      [{ text: "💬 الرسائل والاستفسارات", callback_data: "crm_messages" }, { text: "👥 دليل العملاء (Leads)", callback_data: "crm_users" }],
      [{ text: "🤖 محادثات الزوار والشات بوت", callback_data: "crm_chats" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  contentMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🛠️ الخدمات والكتالوج", callback_data: "cnt_services" }, { text: "📁 المشاريع والمعارض", callback_data: "cnt_projects" }],
      [{ text: "✍️ المقالات والمدونة", callback_data: "cnt_articles" }, { text: "📂 التصنيفات", callback_data: "cnt_categories" }],
      [{ text: "❓ الأسئلة الشائعة", callback_data: "cnt_faqs" }, { text: "📢 الإعلانات والبانرات", callback_data: "cnt_ads" }],
      [{ text: "🔄 مقارنات قبل وبعد", callback_data: "cnt_before_after" }, { text: "🤖 توليد مقال بالـ AI", callback_data: "cnt_ai_article" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  mediaMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🖼️ ألبومات المعرض", callback_data: "med_gallery" }, { text: "📁 مكتبة الوسائط", callback_data: "med_library" }],
      [{ text: "📸 رفع صورة جديدة", callback_data: "med_upload_prompt" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  reviewsMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "⏳ التقييمات المعلقة", callback_data: "rev_pending" }, { text: "⭐ كافة التقييمات المعتمدة", callback_data: "rev_approved" }],
      [{ text: "🌟 تقييمات العملاء المباشرة", callback_data: "rev_direct_reviews" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  marketingMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "📍 صفحات المدن (City Pages)", callback_data: "mkt_cities" }, { text: "🔗 خدمات المدن المرتبطة", callback_data: "mkt_city_services" }],
      [{ text: "🔍 الكلمات الأكثر بحثاً", callback_data: "mkt_keywords" }, { text: "📈 أحداث الزيارات", callback_data: "mkt_analytics" }],
      [{ text: "🏷️ إدارة الـ SEO والعناوين", callback_data: "mkt_seo" }, { text: "⚡ إعادة بناء فهرس البحث", callback_data: "mkt_rebuild_search" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  settingsMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🏢 ملف وهوية المنشأة", callback_data: "set_profile" }, { text: "📍 فروع وعناوين المنشأة", callback_data: "set_addresses" }],
      [{ text: "🌐 قنوات التواصل والسوشيال", callback_data: "set_social" }, { text: "⏰ ساعات العمل والدوام", callback_data: "set_hours" }],
      [{ text: "🚧 وضع الصيانة (🟢/🔴)", callback_data: "set_toggle_maint" }, { text: "🤖 موجهات الذكاء الاصطناعي", callback_data: "set_ai_prompt" }],
      [{ text: "🔑 مخزن الإعدادات", callback_data: "set_store" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  systemMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🔔 إرسال إشعار فوري للتطبيق", callback_data: "push_broadcast_prompt" }, { text: "📜 سجل الإشعارات الصادرة", callback_data: "sys_notification_logs" }],
      [{ text: "👑 مسؤولي التلجرام", callback_data: "sys_admins" }, { text: "➕ إضافة مسؤول جديد", callback_data: "sys_add_admin" }],
      [{ text: "🛡️ سجل العمليات والأمان", callback_data: "sys_audit" }, { text: "💾 النسخ الاحتياطية", callback_data: "sys_backups" }],
      [{ text: "📱 مشتركي الإشعارات", callback_data: "sys_push" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  // Ask Admin if they want to notify app users after adding content
  askPushPrompt: (entityType: string, entityId: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "🔔 نعم، إرسال إشعار فوري للعملاء", callback_data: `push_confirm:${entityType}:${entityId}` },
      ],
      [
        { text: "❌ لا، بدون إشعار (افتراضي)", callback_data: `push_skip:${entityType}` },
      ],
    ],
  }),

  // Screen selection for custom broadcast
  pushScreenSelector: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🏠 الواجهة الرئيسية (/)", callback_data: "push_screen:/" }],
      [{ text: "📁 معرض المشاريع (/projects)", callback_data: "push_screen:/projects" }, { text: "🛠️ قائمة الخدمات (/services)", callback_data: "push_screen:/services" }],
      [{ text: "📞 طلب تسعير وتواصل (/contact)", callback_data: "push_screen:/contact" }, { text: "🖼️ معرض الصور (/gallery)", callback_data: "push_screen:/gallery" }],
      [{ text: "🏢 من نحن (/about)", callback_data: "push_screen:/about" }, { text: "🌐 قنوات التواصل (/social)", callback_data: "push_screen:/social" }],
      [{ text: "❌ إلغاء", callback_data: "main_menu" }],
    ],
  }),

  quoteActions: (id: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "📞 تم الاتصال", callback_data: `q_status:${id}:contacted` },
        { text: "💰 تم التسعير", callback_data: `q_status:${id}:quoted` },
      ],
      [
        { text: "🏆 تم التعاقد", callback_data: `q_status:${id}:won` },
        { text: "❌ ملغي/خسارة", callback_data: `q_status:${id}:lost` },
      ],
      [
        { text: "🗑️ حذف الطلب", callback_data: `q_delete:${id}` },
        { text: "◀️ عودة", callback_data: "crm_quotes" },
      ],
    ],
  }),

  appointmentActions: (id: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ تأكيد الموعد", callback_data: `apt_status:${id}:confirmed` },
        { text: "🏁 اكتملت المعاينة", callback_data: `apt_status:${id}:completed` },
      ],
      [
        { text: "❌ إلغاء الموعد", callback_data: `apt_status:${id}:cancelled` },
        { text: "🗑️ حذف", callback_data: `apt_delete:${id}` },
      ],
      [{ text: "◀️ عودة للمواعيد", callback_data: "crm_appointments" }],
    ],
  }),

  messageActions: (id: string, isRead: boolean): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✍️ الرد على الرسالة", callback_data: `msg_reply:${id}` },
        { text: isRead ? "📩 تعيين كغير مقروء" : "✅ تعيين كمقروء", callback_data: `msg_toggle_read:${id}` },
      ],
      [
        { text: "🗑️ حذف الرسالة", callback_data: `msg_delete:${id}` },
        { text: "◀️ عودة", callback_data: "crm_messages" },
      ],
    ],
  }),

  serviceItemActions: (id: string, isActive: boolean, isFeatured: boolean): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: isActive ? "🔴 تعطيل الخدمة" : "🟢 تفعيل الخدمة", callback_data: `srv_toggle_active:${id}` },
        { text: isFeatured ? "⭐ إزالة من المميزة" : "⭐ تمييز الخدمة", callback_data: `srv_toggle_featured:${id}` },
      ],
      [
        { text: "🗑️ حذف الخدمة", callback_data: `srv_delete:${id}` },
        { text: "◀️ قائمة الخدمات", callback_data: "cnt_services" },
      ],
    ],
  }),

  articleItemActions: (id: string, status: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: status === "published" ? "🔴 تحويل لمسودة" : "🟢 نشر المقال", callback_data: `art_toggle_pub:${id}` },
        { text: "🗑️ حذف المقال", callback_data: `art_delete:${id}` },
      ],
      [{ text: "◀️ قائمة المقالات", callback_data: "cnt_articles" }],
    ],
  }),

  reviewActions: (id: string): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "✅ موافقة ونشر", callback_data: `rev_approve:${id}` },
        { text: "❌ رفض وحذف", callback_data: `rev_reject:${id}` },
      ],
      [{ text: "◀️ التقييمات", callback_data: "menu_reviews" }],
    ],
  }),

  cancelWizard: (returnTo: string): InlineKeyboard => ({
    inline_keyboard: [[{ text: "❌ إلغاء والعودة", callback_data: returnTo }]],
  }),

  backToMenu: (): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }]],
  }),

  backToSubmenu: (submenu: string): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ رجوع", callback_data: submenu }]],
  }),
};

// ─── Formatters ───────────────────────────────────────────────────────

export function formatQuoteAlert(data: {
  name: string; phone: string; services: string[];
  city: string; budget: string; urgency: string; description: string; id: string;
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
  name: string; phone: string; email?: string; subject?: string; content: string; id: string;
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
  id: string; userName: string; phone: string; serviceName?: string; preferredDate?: string; notes?: string;
}) {
  return `📅 <b>حجز موعد جديد!</b>

👤 <b>العميل:</b> ${data.userName}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${data.preferredDate ? `📅 <b>الموعد المطلوب:</b> ${data.preferredDate}\n` : ""}${data.notes ? `📝 <b>ملاحظات:</b> ${data.notes}\n` : ""}
🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatStatsMessage(stats: {
  totalRequests: number; newRequests: number; totalAppointments: number; pendingAppointments: number;
  totalMessages: number; unreadMessages: number; totalUsers: number; totalServices: number;
  totalProjects: number; totalArticles: number; totalReviews: number; pendingReviews: number;
  totalViews: number; todayViews: number;
}) {
  const now = new Date().toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `📊 <b>لوحة تحكم إحصائيات المنصة الشاملة</b>
📅 ${now}

━━━━━━━━━━━━━━━━━━
📋 <b>طلبات الأسعار:</b> <b>${stats.totalRequests}</b> (جديد: ${stats.newRequests} 🆕)
📅 <b>المواعيد والحجوزات:</b> <b>${stats.totalAppointments}</b> (قيد الانتظار: ${stats.pendingAppointments} ⏳)
💬 <b>الرسائل والاستفسارات:</b> <b>${stats.totalMessages}</b> (غير مقروءة: ${stats.unreadMessages} 🔴)
👥 <b>دليل العملاء (Leads):</b> <b>${stats.totalUsers}</b>
🛠️ <b>الخدمات المسجلة:</b> <b>${stats.totalServices}</b>
📁 <b>المشاريع والأعمال:</b> <b>${stats.totalProjects}</b>
✍️ <b>المقالات والأخبار:</b> <b>${stats.totalArticles}</b>
⭐ <b>التقييمات:</b> <b>${stats.totalReviews}</b> (تنتظر الموافقة: ${stats.pendingReviews} ⏳)
👁️ <b>الزيارات الكلية:</b> <b>${stats.totalViews.toLocaleString("ar-SA")}</b> (اليوم: ${stats.todayViews.toLocaleString("ar-SA")})
━━━━━━━━━━━━━━━━━━`;
}
