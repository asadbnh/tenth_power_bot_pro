import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards } from "../bot";
import { setAdminState } from "../state";

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
📧 <b>البريد الإلكتروني:</b> ${company?.email ?? "info@tenth-power-glass.com"}
🧾 <b>الرقم الضريبي:</b> <code>${company?.tax_number ?? "غير محدد"}</code>
📑 <b>السجل التجاري:</b> <code>${company?.commercial_register ?? "غير محدد"}</code>
🚧 <b>وضع الصيانة:</b> ${maint}`;

  const inline_keyboard = [
    [{ text: company?.maintenance_mode ? "🟢 فتح الموقع للزوار" : "🔴 إغلاق الموقع (وضع الصيانة)", callback_data: "set_toggle_maint" }],
    [
      { text: "📱 تعديل الهاتف", callback_data: "set_edit_phone" },
      { text: "💬 تعديل الواتساب", callback_data: "set_edit_whatsapp" },
    ],
    [
      { text: "📧 تعديل البريد", callback_data: "set_edit_email" },
      { text: "🧾 تعديل الرقم الضريبي", callback_data: "set_edit_tax" },
    ],
    [
      { text: "📑 تعديل السجل التجاري", callback_data: "set_edit_cr" },
    ],
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleCompanyProfileEditPrompt(chatId: number, field: "phone" | "whatsapp" | "email" | "tax" | "cr") {
  const titles = {
    phone: "رقم الهاتف الرئيسي",
    whatsapp: "رقم الواتساب",
    email: "البريد الإلكتروني",
    tax: "الرقم الضريبي",
    cr: "رقم السجل التجاري",
  };
  const stepMap = {
    phone: "awaiting_company_phone" as const,
    whatsapp: "awaiting_company_whatsapp" as const,
    email: "awaiting_company_email" as const,
    tax: "awaiting_company_tax" as const,
    cr: "awaiting_company_cr" as const,
  };
  setAdminState(chatId, stepMap[field]);
  await sendMessage(
    chatId,
    `✏️ <b>تعديل ${titles[field]}:</b>\n\nأرسل القيمة الجديدة الآن:`,
    { reply_markup: Keyboards.cancelWizard("set_profile") }
  );
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

// ─── Company Addresses & Branches Handlers ────────────────────────────

export async function handleCompanyAddressesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: addresses } = await db
    .from("company_addresses")
    .select("id, label_ar, city_ar, street_ar, google_maps_url, is_primary")
    .order("is_primary", { ascending: false });

  let text = `📍 <b>فروع وعناوين المنشأة (${addresses?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (addresses as Record<string, any>[] || []).forEach((a, idx) => {
    const primary = a.is_primary ? "⭐ رئيسي" : "";
    text += `${idx + 1}. 🏢 <b>${a.label_ar || "فرع"}</b> ${primary}\n`;
    text += `   📍 ${a.city_ar || "الرياض"} - ${a.street_ar || "طريق الملك فهد"}\n`;
    if (a.google_maps_url) text += `   🗺️ <a href="${a.google_maps_url}">موقع الخريطة (Google Maps)</a>\n`;
    text += `\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف الفرع رقم ${idx + 1}`, callback_data: `addr_delete:${a.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة عنوان/فرع جديد", callback_data: "addr_add_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleCompanyAddressDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("company_addresses").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف العنوان/الفرع.`);
  await handleCompanyAddressesList(chatId, messageId);
}

export async function handleCompanyAddressAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_address_city");
  await sendMessage(
    chatId,
    `📍 <b>إضافة فرع أو عنوان جديد — الخطوة 1/3</b>\n\nأرسل الآن <b>اسم المدينة واسم الفرع</b> (مثال: فرع جدة - حي الروضة):`,
    { reply_markup: Keyboards.cancelWizard("set_addresses") }
  );
}

// ─── Social Contacts Handlers ─────────────────────────────────────────

export async function handleSocialContacts(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: contacts } = await db
    .from("company_contacts")
    .select("id, type, value, label_ar, sort_order")
    .order("sort_order", { ascending: true });

  let text = `🌐 <b>قنوات التواصل والسوشيال ميديا (${contacts?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (contacts as Record<string, any>[] || []).forEach((c, idx) => {
    text += `${idx + 1}. <b>${c.label_ar || c.type}</b>\n`;
    text += `   🔗 <code>${c.value}</code>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف: ${c.label_ar || c.type}`, callback_data: `contact_delete:${c.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "➕ إضافة قناة تواصل", callback_data: "contact_add_prompt" }]);
  inline_keyboard.push([{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleContactDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("company_contacts").delete().eq("id", id);
  await sendMessage(chatId, "🗑️ تم حذف وسيلة التواصل بنجاح.");
  await handleSocialContacts(chatId, messageId);
}

export async function handleContactAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_contact_type");
  await sendMessage(
    chatId,
    `🌐 <b>إضافة وسيلة تواصل جديدة — (الخطوة 1 من 2)</b>\n\nأرسل اسم أو نوع وسيلة التواصل (مثال: تويتر، واتساب، تيك توك):`,
    { reply_markup: Keyboards.cancelWizard("set_social") }
  );
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
  const inline_keyboard: any[][] = [];

  (hours as Record<string, any>[] || []).forEach((h) => {
    const dayName = daysAr[h.day_of_week] || `يوم ${h.day_of_week}`;
    if (h.is_closed) {
      text += `• <b>${dayName}:</b> 🔴 مغلق (${h.note_ar || "عطلة"})\n`;
    } else {
      text += `• <b>${dayName}:</b> 🟢 ${h.open_time || "08:00"} - ${h.close_time || "18:00"}\n`;
    }

    inline_keyboard.push([
      { text: h.is_closed ? `🟢 فتح ${dayName}` : `🔴 إغلاق ${dayName}`, callback_data: `hours_toggle:${h.day_of_week}` },
      { text: `⏰ تعديل ${dayName}`, callback_data: `hours_edit:${h.day_of_week}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleBusinessHoursToggle(chatId: number, dayOfWeek: number, messageId?: number) {
  const db = createDbClient();
  const { data: h } = await db.from("business_hours").select("is_closed").eq("day_of_week", dayOfWeek).single();
  if (h) {
    await db.from("business_hours").update({ is_closed: !h.is_closed }).eq("day_of_week", dayOfWeek);
    await handleBusinessHours(chatId, messageId);
  }
}

export async function handleBusinessHoursEditPrompt(chatId: number, dayOfWeek: number) {
  const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  setAdminState(chatId, "awaiting_hours_time", { dayOfWeek });
  await sendMessage(
    chatId,
    `⏰ <b>تعديل أوقات دوام يوم (${daysAr[dayOfWeek] || dayOfWeek}):</b>\n\nأرسل أوقات البدء والانتهاء بصيغة <code>08:00-18:00</code>:`,
    { reply_markup: Keyboards.cancelWizard("set_hours") }
  );
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
    [{ text: "✏️ تعديل التوجيه الهندسي (System Prompt)", callback_data: "ai_prompt_edit" }],
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleAiPromptEditPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_ai_prompt_text");
  await sendMessage(
    chatId,
    `🤖 <b>تعديل التوجيه الهندسي (System Prompt):</b>\n\nأرسل نص التوجيه الهندسي الجديد الذي سيلتزم به الذكاء الاصطناعي عند الرد على الزوار:`,
    { reply_markup: Keyboards.cancelWizard("set_ai_prompt") }
  );
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
    [{ text: "➕ إضافة أو تحديث مفتاح", callback_data: "setting_store_set" }],
    [{ text: "◀️ رجوع للإعدادات", callback_data: "menu_settings" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleSettingStorePrompt(chatId: number) {
  setAdminState(chatId, "awaiting_setting_value");
  await sendMessage(
    chatId,
    `⚙️ <b>إضافة أو تحديث مفتاح في النظام:</b>\n\nأرسل المفتاح والقيمة بصيغة:\n<code>key=value</code>\nمثال:\n<code>site_theme=dark</code>:`,
    { reply_markup: Keyboards.cancelWizard("set_store") }
  );
}
