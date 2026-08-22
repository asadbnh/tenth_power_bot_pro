import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage } from "../bot";

// ─── Company Profile Handlers ─────────────────────────────────────────

export async function handleCompanyProfile(chatId: number, messageId?: number) {
  const db = createDbClient();
  let company: Record<string, any> | null = null;
  try {
    const { data } = await db.from("companies").select("*").limit(1).single();
    company = data;
  } catch {
    company = null;
  }

  const maint = company?.maintenance_mode ? "🔴 مفعّل (الموقع مغلق للصيانة)" : "🟢 معطل (الموقع يعمل بكفاءة)";

  const text = `🏢 <b>ملف وهوية المنشأة</b>

🏛️ <b>الاسم الرسمي:</b> ${company?.name_ar ?? "مؤسسة القوة العاشرة"}
🌐 <b>المعرف:</b> <code>${company?.slug ?? "tenth-power-glass"}</code>
📱 <b>الهاتف الرئيسي:</b> <code>${company?.phone_primary ?? "غير محدد"}</code>
💬 <b>الواتساب:</b> <code>${company?.whatsapp_number ?? "غير محدد"}</code>
📧 <b>البريد الإلكتروني:</b> ${company?.email ?? "info@webtaky.com"}
🧾 <b>الرقم الضريبي:</b> <code>${company?.tax_number ?? "غير محدد"}</code>
📑 <b>السجل التجاري:</b> <code>${company?.commercial_register ?? "غير محدد"}</code>
🚧 <b>وضع الصيانة:</b> ${maint}`;

  const inline_keyboard = [
    [{ text: company?.maintenance_mode ? "🟢 فتح الموقع للزوار" : "🔴 إغلاق الموقع (وضع الصيانة)", callback_data: "set_toggle_maint" }],
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleToggleMaintenance(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id, maintenance_mode").limit(1).single();
  if (company) {
    const nextState = !company.maintenance_mode;
    await db.from("companies").update({ maintenance_mode: nextState }).eq("id", company.id);
    await sendMessage(
      chatId,
      nextState
        ? `🔴 <b>تم تفعيل وضع الصيانة للموقع!</b>\nسيظهر للزوار إشعار الصيانة والتحديث.`
        : `🟢 <b>تم إلغاء وضع الصيانة!</b>\nالموقع متاح ويعمل بشكل طبيعي لجميع الزوار.`
    );
    await handleCompanyProfile(chatId, messageId);
  }
}

// ─── Social Contacts Handlers ─────────────────────────────────────────

export async function handleSocialContacts(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: contacts } = await db
    .from("company_contacts")
    .select("id, type, value, label_ar, sort_order")
    .order("sort_order", { ascending: true });

  let text = `🌐 <b>قنوات التواصل والسوشيال ميديا (${contacts?.length ?? 0}):</b>\n\n`;
  (contacts as Record<string, any>[] || []).forEach((c, idx) => {
    text += `${idx + 1}. <b>${c.label_ar || c.type}</b>\n`;
    text += `   🔗 <code>${c.value}</code>\n\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Business Hours Handlers ──────────────────────────────────────────

export async function handleBusinessHours(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: hours } = await db
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed, note_ar")
    .order("day_of_week", { ascending: true });

  const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  let text = `⏰ <b>ساعات العمل والدوام الرسمي:</b>\n\n`;

  (hours as Record<string, any>[] || []).forEach((h) => {
    const dayName = daysAr[h.day_of_week] || `يوم ${h.day_of_week}`;
    if (h.is_closed) {
      text += `• <b>${dayName}:</b> 🔴 مغلق (${h.note_ar || "عطلة"})\n`;
    } else {
      text += `• <b>${dayName}:</b> 🟢 ${h.open_time || "08:00"} - ${h.close_time || "18:00"}\n`;
    }
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── AI System Prompts Handlers ───────────────────────────────────────

export async function handleAiPromptSettings(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: prompt } = await db
    .from("ai_prompts")
    .select("*")
    .eq("prompt_type", "chat")
    .single();

  const text = `🤖 <b>إعدادات المساعد الذكي (Gemini AI)</b>

🧠 <b>النموذج المستخدم:</b> <code>${prompt?.model || "gemini-1.5-flash"}</code>
🌡️ <b>درجة الحرارة (Temperature):</b> <code>${prompt?.temperature || 0.7}</code>
🔤 <b>أقصى عدد للرموز (Max Tokens):</b> <code>${prompt?.max_tokens || 1000}</code>
🟢 <b>الحالة:</b> ${prompt?.is_active ? "نشط" : "معطل"}

📝 <b>التوجيه الهندسي (System Prompt):</b>
<code>${prompt?.system_prompt_ar || "التوجيه الافتراضي"}</code>`;

  const inline_keyboard = [
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Settings Store Handlers ──────────────────────────────────────────

export async function handleCompanySettingsStore(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: settings } = await db.from("company_settings").select("key, value, category");

  let text = `⚙️ <b>مخزن مفاتيح النظام (Settings Store)</b>\n\n`;
  (settings as Record<string, any>[] || []).forEach((s, idx) => {
    text += `${idx + 1}. 🔑 <code>${s.key}</code> [${s.category || "عام"}]\n`;
    text += `   📝 القيمة: <code>${JSON.stringify(s.value)}</code>\n\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}
