/**
 * WebTaky Telegram Keyboards Registry
 * Inline Keyboards for Bot & WebApp launch buttons.
 */

import { getBaseSiteUrl } from "./client";
import type { InlineKeyboard, InlineKeyboardButton } from "./types";

export const Keyboards = {
  /**
   * Main Admin Menu featuring the prominent Telegram Mini App Launch Button
   */
  mainMenu: (): InlineKeyboard => {
    const miniAppUrl = `${getBaseSiteUrl()}/admin`;
    return {
      inline_keyboard: [
        // 🚀 Primary WebApp Launch Button
        [
          {
            text: "🚀 فتح لوحة التحكم الشاملة (Mini App)",
            web_app: { url: miniAppUrl },
          },
        ],
        // Fast-access Bot Menus
        [
          { text: "📊 الإحصائيات الشاملة", callback_data: "menu_stats" },
          { text: "💼 المبيعات والعملاء", callback_data: "menu_crm" },
        ],
        [
          { text: "🛠️ محتوى الموقع والخدمات", callback_data: "menu_content" },
          { text: "🖼️ الوسائط والصور", callback_data: "menu_media" },
        ],
        [
          { text: "⭐ التقييمات والآراء", callback_data: "menu_reviews" },
          { text: "📍 صفحات المدن والتسويق", callback_data: "menu_marketing" },
        ],
        [
          { text: "⚙️ إعدادات المنشأة والفروع", callback_data: "menu_settings" },
          { text: "🛡️ الأمان والإشعارات", callback_data: "menu_system" },
        ],
        [
          { text: "🔔 إرسال إشعار فوري للتطبيق", callback_data: "push_broadcast_prompt" },
        ],
      ],
    };
  },

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
      [{ text: "🛡️ سجل العمليات والأمان", callback_data: "sys_audit" }, { text: "💾 مركز النسخ الاحتياطي", callback_data: "menu_backup" }],
      [{ text: "📱 مشتركي الإشعارات", callback_data: "sys_push" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  backupMenu: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🚀 إنشاء نسخة احتياطية فورية الآن (.zip)", callback_data: "backup_create_now" }],
      [{ text: "📜 سجل النسخ السابقة", callback_data: "sys_backups" }, { text: "📖 طريقة الاستعادة محلياً", callback_data: "backup_info" }],
      [{ text: "◀️ القائمة الرئيسية", callback_data: "main_menu" }],
    ],
  }),

  askPushPrompt: (entityType: string, entityId: string): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🔔 نعم، إرسال إشعار فوري للعملاء", callback_data: `push_confirm:${entityType}:${entityId}` }],
      [{ text: "❌ لا، بدون إشعار (افتراضي)", callback_data: `push_skip:${entityType}` }],
    ],
  }),

  pushScreenSelector: (): InlineKeyboard => ({
    inline_keyboard: [
      [{ text: "🏠 الواجهة الرئيسية (/)", callback_data: "push_screen:/" }],
      [{ text: "📁 معرض المشاريع (/projects)", callback_data: "push_screen:/projects" }, { text: "🛠️ قائمة الخدمات (/services)", callback_data: "push_screen:/services" }],
      [{ text: "📞 طلب تسعير وتواصل (/contact)", callback_data: "push_screen:/contact" }, { text: "🖼️ معرض الصور (/gallery)", callback_data: "push_screen:/gallery" }],
      [{ text: "🏢 من نحن (/about)", callback_data: "push_screen:/about" }, { text: "🌐 قنوات التواصل (/social)", callback_data: "push_screen:/social" }],
      [{ text: "❌ إلغاء", callback_data: "main_menu" }],
    ],
  }),

  quoteActions: (id: string, phone?: string): InlineKeyboard => {
    const rows: InlineKeyboardButton[][] = [];
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const waPhone = cleanPhone.startsWith("05") ? "966" + cleanPhone.substring(1) : cleanPhone;
      rows.push([{ text: "💬 مراسلة واتساب فورية", url: `https://wa.me/${waPhone}` }]);
    }
    rows.push([
      { text: "📞 تم الاتصال", callback_data: `q_status:${id}:contacted` },
      { text: "💰 تم التسعير", callback_data: `q_status:${id}:quoted` },
    ]);
    rows.push([
      { text: "🏆 تم التعاقد", callback_data: `q_status:${id}:won` },
      { text: "❌ ملغي/خسارة", callback_data: `q_status:${id}:lost` },
    ]);
    rows.push([
      { text: "📋 تفاصيل الطلب", callback_data: `q_view:${id}` },
      { text: "🗑️ حذف الطلب", callback_data: `q_delete:${id}` },
    ]);
    return { inline_keyboard: rows };
  },

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

  serviceItemActions: (id: string, isActive: boolean, isFeatured: boolean, imgCount: number = 0): InlineKeyboard => ({
    inline_keyboard: [
      [
        { text: "➕ إضافة صورة للخدمة", callback_data: `srv_add_photo:${id}` },
        { text: `🖼️ صور الخدمة (${imgCount})`, callback_data: `srv_items:${id}` },
      ],
      [
        { text: isActive ? "🔴 تعطيل الخدمة" : "🟢 تفعيل الخدمة", callback_data: `srv_toggle_active:${id}` },
        { text: isFeatured ? "⭐ إزالة من المميزة" : "⭐ تمييز الخدمة", callback_data: `srv_toggle_featured:${id}` },
      ],
      [
        { text: "✏️ تعديل الاسم", callback_data: `srv_edit_name:${id}` },
        { text: "💰 السعر والوحدة", callback_data: `srv_edit_price:${id}` },
      ],
      [
        { text: "📝 الوصف الكامل", callback_data: `srv_edit_fulldesc:${id}` },
        { text: "⭐ المميزات (Features)", callback_data: `srv_edit_feat:${id}` },
      ],
      [
        { text: "🏷️ كلمات الـ SEO", callback_data: `srv_edit_seo:${id}` },
        { text: "🖼️ تغيير الغلاف", callback_data: `srv_edit_cover:${id}` },
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
        { text: "➕ إضافة صورة للمقال", callback_data: `art_add_photo:${id}` },
      ],
      [
        { text: "✏️ تعديل العنوان", callback_data: `art_edit_title:${id}` },
        { text: "📝 تعديل الملخص", callback_data: `art_edit_excerpt:${id}` },
      ],
      [
        { text: "🖼️ تغيير صورة الغلاف", callback_data: `art_edit_cover:${id}` },
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

  visitorMenu: (): InlineKeyboard => {
    const siteUrl = `${getBaseSiteUrl()}/ar`;
    return {
      inline_keyboard: [
        // 🚀 Primary Mini App Button opening main site
        [
          {
            text: "🚀 فتح الموقع والخدمات (Mini App)",
            web_app: { url: siteUrl },
          },
        ],
        // Quick Action Buttons
        [
          { text: "📱 تحميل التطبيق والموقع", callback_data: "vis_downloads" },
          { text: "🌐 قنوات التواصل والفروع", callback_data: "vis_contacts" },
        ],
        [
          { text: "📝 طلب مقايسة وعرض سعر مجاناً", callback_data: "vis_quote_prompt" },
        ],
      ],
    };
  },

  visitorDownloadLinks: (): InlineKeyboard => {
    const playUrl = process.env.GOOGLE_PLAY_URL?.trim();
    const appStoreUrl = process.env.APPLE_APP_STORE_URL?.trim();
    const siteUrl = `${getBaseSiteUrl()}/ar`;

    const rows: InlineKeyboardButton[][] = [
      [
        {
          text: "🚀 تصفح الموقع مباشرة (Mini App)",
          web_app: { url: siteUrl },
        },
      ],
    ];
    if (playUrl && playUrl !== "" && playUrl !== "null") {
      rows.push([{ text: "🤖 تحميل من متجر Google Play", url: playUrl }]);
    }
    if (appStoreUrl && appStoreUrl !== "" && appStoreUrl !== "null") {
      rows.push([{ text: "🍏 تحميل من متجر App Store", url: appStoreUrl }]);
    }
    rows.push([{ text: "🌐 فتح الموقع في المتصفح الخارجي", url: siteUrl }]);
    rows.push([{ text: "◀️ رجوع للواجهة الرئيسية", callback_data: "vis_menu" }]);
    return { inline_keyboard: rows };
  },

  visitorBackToMenu: (): InlineKeyboard => ({
    inline_keyboard: [[{ text: "◀️ رجوع للواجهة الرئيسية", callback_data: "vis_menu" }]],
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
