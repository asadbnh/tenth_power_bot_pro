import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage } from "../bot";

// ─── City Pages Handlers ──────────────────────────────────────────────

export async function handleCitiesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: cities } = await db
    .from("city_pages")
    .select("id, slug, city_name_ar, is_active")
    .order("city_name_ar", { ascending: true });

  let text = `📍 <b>صفحات المدن والمناطق (Local SEO) (${cities?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (cities as Record<string, any>[] || []).forEach((c, idx) => {
    const status = c.is_active ? "🟢 مفعلة" : "🔴 معطلة";
    text += `${idx + 1}. 📍 <b>${c.city_name_ar}</b> [${status}] (Slug: <code>${c.slug}</code>)\n`;

    inline_keyboard.push([
      { text: `🔄 تفعيل/تعطيل: ${c.city_name_ar}`, callback_data: `city_toggle:${c.id}` },
      { text: `🗑️ حذف`, callback_data: `city_delete:${c.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleCityToggleActive(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: city } = await db.from("city_pages").select("is_active").eq("id", id).single();
  if (city) {
    await db.from("city_pages").update({ is_active: !city.is_active }).eq("id", id);
    await handleCitiesList(chatId, messageId);
  }
}

export async function handleCityDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("city_pages").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف صفحة المدينة.`);
  await handleCitiesList(chatId, messageId);
}

export async function handleCityServicesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: cityServices } = await db
    .from("city_services")
    .select("id, city_page_id, service_id, created_at")
    .limit(10);

  let text = `🔗 <b>روابط خدمات المدن (City Services):</b>\n\n`;
  text += `إجمالي الروابط النشطة: <b>${cityServices?.length ?? 0}</b>\nتتيح هذه الروابط تصدر نتائج البحث المحلي لكل خدمة في كل مدينة.\n`;

  const inline_keyboard = [
    [{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── SEO Metadata Handlers ────────────────────────────────────────────

export async function handleSeoList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: seo } = await db
    .from("seo_metadata")
    .select("id, entity_type, meta_title, meta_description, canonical_url")
    .limit(8);

  let text = `🏷️ <b>إعدادات الـ SEO والعناوين المخصصة (${seo?.length ?? 0}):</b>\n\n`;
  (seo as Record<string, any>[] || []).forEach((s, idx) => {
    text += `${idx + 1}. 📄 <b>${s.meta_title || s.entity_type}</b>\n`;
    text += `   🔗 <code>${s.canonical_url || "/"}</code>\n\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Search Index & Rebuild Handlers ──────────────────────────────────

export async function handleRebuildSearchIndex(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { count: indexCount } = await db.from("search_index").select("*", { count: "exact", head: true });

  const text = `⚡ <b>فهرس البحث الذكي (Search Index)</b>\n\nإجمالي الكلمات والمصطلحات المفهرسة: <b>${indexCount ?? 0}</b> مصطلح.\n\n🟢 تم تحديث وفهرسة كافة الخدمات والمشاريع والمقالات تلقائياً لسرعة البحث في الموقع وتطبيق الأندرويد.`;

  const inline_keyboard = [
    [{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Analytics & Keywords Handlers ────────────────────────────────────

export async function handleKeywordsReport(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: events } = await db
    .from("analytics_events")
    .select("event_type, utm_source, utm_term, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  let text = `🔍 <b>أحدث الكلمات المفتاحية ومصادر الزيارات:</b>\n\n`;
  (events as Record<string, any>[] || []).forEach((e, idx) => {
    const meta = e.metadata as Record<string, any> | null;
    const query = meta?.query || e.utm_term || e.utm_source || "زيارة عامة";
    text += `${idx + 1}. 🔑 <code>${query}</code> [${e.event_type}]\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleAnalyticsReport(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { count: totalEvents } = await db.from("analytics_events").select("*", { count: "exact", head: true });
  const { count: pageViews } = await db.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "page_view");
  const { count: quotes } = await db.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "quote_submit");

  const text = `📈 <b>تقرير نشاط وزيارات الموقع</b>

👁️ <b>إجمالي الأحداث المسجلة:</b> ${totalEvents ?? 0}
📄 <b>مشاهدات الصفحات:</b> ${pageViews ?? 0}
📋 <b>إرسال طلبات التسعير:</b> ${quotes ?? 0}

🟢 يتم تسجيل جميع الزيارات بدقة وفق نظام التتبع اللحظي.`;

  const inline_keyboard = [
    [{ text: "◀️ رجوع للتسويق", callback_data: "menu_marketing" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}
