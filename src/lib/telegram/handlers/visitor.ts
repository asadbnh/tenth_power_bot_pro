import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards, type TelegramMessage } from "../bot";
import { setAdminState, clearAdminState, getAdminState } from "../state";
import { notifyNewQuoteRequest } from "../notifications";

// ─── Visitor Welcome & Navigation ─────────────────────────────────────

export async function handleVisitorStart(msg: TelegramMessage) {
  const userId = msg.from.id;
  clearAdminState(userId);

  const welcomeText = `مرحباً بك <b>${msg.from.first_name}</b> في <b>مؤسسة القوة العاشرة للزجاج والألمنيوم</b>! 🏢✨

نحن متخصصون في تنفيذ أرقى أعمال:
💎 <b>واجهات الزجاج الذكي والسيكوريت</b>
🏢 <b>واجهات الكلادينج والألمنيوم المعزول</b>
🚪 <b>الأبواب والنوافذ والدرابزينات الفاخرة</b>
🛡️ <b>ضمان معتمد وشامل 10 سنوات مع إشراف هندسي</b>

اختر من القائمة أدناه للاطلاع على خدماتنا وأعمالنا أو طلب مقايسة مجانية:`;

  await sendMessage(userId, welcomeText, { reply_markup: Keyboards.visitorMenu() });
}

export async function handleVisitorMenu(chatId: number, messageId?: number) {
  clearAdminState(chatId);
  const text = `🏢 <b>مؤسسة القوة العاشرة — القائمة الرئيسية للخدمات</b>\n\nاختر أحد الأقسام التالية:`;
  if (messageId) await editMessage(chatId, messageId, text, Keyboards.visitorMenu());
  else await sendMessage(chatId, text, { reply_markup: Keyboards.visitorMenu() });
}

// ─── Visitor Services ─────────────────────────────────────────────────

export async function handleVisitorServices(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: services } = await db
    .from("services")
    .select("name_ar, short_description_ar, price_from, price_unit")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(5);

  let text = `🛠️ <b>أبرز خدماتنا الاحترافية:</b>\n\n`;
  (services as Record<string, any>[] || []).forEach((s, idx) => {
    text += `${idx + 1}. 💎 <b>${s.name_ar}</b>\n`;
    if (s.short_description_ar) text += `   📝 <i>${s.short_description_ar}</i>\n`;
    if (s.price_from) text += `   💰 الأسعار تبدأ من: <b>${s.price_from} ريال</b> / ${s.price_unit || "متر"}\n\n`;
  });

  text += `✨ <i>للاطلاع على الكتالوج الكامل والمواصفات الهندسية، تفضل بزيارة موقعنا أو تحميل التطبيق:</i>`;

  const inline_keyboard = [
    [{ text: "📝 طلب مقايسة وعرض سعر", callback_data: "vis_quote_prompt" }],
    [{ text: "📱 تحميل التطبيق واستعراض المزيد", callback_data: "vis_downloads" }],
    [{ text: "◀️ رجوع للرئيسية", callback_data: "vis_menu" }],
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Visitor Projects ─────────────────────────────────────────────────

export async function handleVisitorProjects(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: projects } = await db
    .from("projects")
    .select("title_ar, city, client_name")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  let text = `📁 <b>أحدث مشاريعنا المنفذة:</b>\n\n`;
  (projects as Record<string, any>[] || []).forEach((p, idx) => {
    text += `${idx + 1}. 🏢 <b>${p.title_ar}</b>\n`;
    text += `   📍 الموقع: ${p.city || "المملكة"} ${p.client_name ? `| 👤 ${p.client_name}` : ""}\n\n`;
  });

  text += `✨ <i>شاهد صور وفيديوهات وتفاصيل أكثر من 50+ مشروعاً منجزاً عبر تطبيقنا وموقعنا:</i>`;

  const inline_keyboard = [
    [{ text: "🖼️ استعراض معرض الصور", callback_data: "vis_gallery" }],
    [{ text: "📱 تحميل التطبيق ومشاهدة المعرض", callback_data: "vis_downloads" }],
    [{ text: "◀️ رجوع للرئيسية", callback_data: "vis_menu" }],
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Visitor Gallery ──────────────────────────────────────────────────

export async function handleVisitorGallery(chatId: number, messageId?: number) {
  const text = `🖼️ <b>معرض صور أعمال القوة العاشرة</b>

نقدم أعلى جودة تشطيب لواجهات الزجاج، الأبواب الأوتوماتيكية، كلادينج الواجهات، وقواطع المكاتب الزجاجية.

📱 <b>لمشاهدة معرض الصور ثلاثي الأبعاد وصور قبل/بعد بجودة فائقة:</b>
يمكنك فتح الموقع أو تحميل التطبيق مباشرة عبر الأزرار أدناه:`;

  const inline_keyboard = [
    [{ text: "📱 روابط تحميل التطبيق والموقع", callback_data: "vis_downloads" }],
    [{ text: "📝 طلب مقايسة لمشروعك", callback_data: "vis_quote_prompt" }],
    [{ text: "◀️ رجوع للرئيسية", callback_data: "vis_menu" }],
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Visitor Contacts & Social ────────────────────────────────────────

export async function handleVisitorContacts(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: contacts } = await db.from("company_contacts").select("type, value, label_ar");

  let phone = "0551234567";
  let whatsapp = "966551234567";
  let channel = "@TenthPowerSA";

  (contacts as Record<string, any>[] || []).forEach((c) => {
    if (c.type === "phone") phone = c.value;
    if (c.type === "whatsapp") whatsapp = c.value;
    if (c.type === "telegram_channel") channel = c.value;
  });

  const text = `🌐 <b>قنوات التواصل والفرع الرئيسي</b>

🏢 <b>مؤسسة القوة العاشرة للمقاولات</b>
📍 <b>المقر الرئيسي:</b> الرياض - المملكة العربية السعودية
📞 <b>الاتصال المباشر:</b> <code>${phone}</code>
💬 <b>الواتساب:</b> <code>+${whatsapp}</code>
📢 <b>قناة التلجرام الرسمية:</b> ${channel}

⏰ <b>ساعات العمل:</b> يومياً من 8:00 صباحاً حتى 6:00 مساءً (الجمعة عطلة)`;

  const channelUrl = channel.startsWith("@") ? `https://t.me/${channel.replace("@", "")}` : channel;

  const inline_keyboard = [
    [
      { text: "💬 محادثة واتساب فورية", url: `https://wa.me/${whatsapp}` },
      { text: "📢 انضم لقناتنا بالتوجرام", url: channelUrl },
    ],
    [{ text: "📝 طلب مقايسة وعرض سعر", callback_data: "vis_quote_prompt" }],
    [{ text: "◀️ رجوع للرئيسية", callback_data: "vis_menu" }],
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Visitor App & Website Download Links (Dynamic) ───────────────────

export async function handleVisitorDownloads(chatId: number, messageId?: number) {
  const text = `📱 <b>تطبيق وموقع مؤسسة القوة العاشرة</b>

للاطلاع على الكتالوج الكامل للخدمات، حساب تكلفة المقايسة التقديرية، والتصاميم الهندسية، تفضل بزيارة موقعنا أو تحميل التطبيق:`;

  if (messageId) {
    await editMessage(chatId, messageId, text, Keyboards.visitorDownloadLinks());
  } else {
    await sendMessage(chatId, text, { reply_markup: Keyboards.visitorDownloadLinks() });
  }
}

// ─── Visitor Quick Quote Request Wizard ───────────────────────────────

export async function handleVisitorQuotePrompt(chatId: number) {
  setAdminState(chatId, "awaiting_visitor_quote_service");
  await sendMessage(
    chatId,
    `📝 <b>طلب مقايسة وعرض سعر مجاني — الخطوة 1/2</b>\n\nأرسل الآن <b>اسمك ونوع الخدمة المطلوبة</b> (مثال: عبدالمحسن - واجهة زجاج سيكوريت لفيلا):`,
    { reply_markup: Keyboards.cancelWizard("vis_menu") }
  );
}

export async function handleVisitorQuoteText(msg: TelegramMessage) {
  const userId = msg.from.id;
  const text = msg.text?.trim() || "";
  const state = getAdminState(userId);
  if (!state) return;

  if (state.step === "awaiting_visitor_quote_service") {
    setAdminState(userId, "awaiting_visitor_quote_phone", { service_info: text });
    await sendMessage(
      userId,
      `📱 <b>الخطوة 2/2:</b>\n\nأرسل الآن <b>رقم جوالك والمدينة</b> للتواصل معك وتقديم المقايسة (مثال: <code>0551234567 - الرياض</code>):`
    );
    return;
  }

  if (state.step === "awaiting_visitor_quote_phone") {
    const serviceInfo = (state.payload?.service_info as string) || "طلب تسعير";
    const phoneAndCity = text;

    clearAdminState(userId);

    const db = createDbClient();
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    // 1. Create Lead in Users table
    const { data: userLead } = await db.from("users").insert({
      company_id: companyId,
      full_name: `${msg.from.first_name} ${msg.from.username ? `(@${msg.from.username})` : ""}`.trim(),
      phone: phoneAndCity.slice(0, 30),
      city: "الرياض",
      source: "telegram_bot",
    }).select("id").single();

    // 2. Insert into quote_requests table
    const { data: quoteReq } = await db.from("quote_requests").insert({
      company_id: companyId,
      user_id: userLead?.id || null,
      description: `طلب مقدم عبر بوت تلجرام للزوار:\nالخدمة: ${serviceInfo}\nالتواصل: ${phoneAndCity}`,
      budget_range: "حسب المقايسة",
      city: "الرياض",
      urgency: "urgent",
      status: "new",
    }).select("id").single();

    // 3. Notify Admins immediately
    if (quoteReq?.id) {
      await notifyNewQuoteRequest({
        id: quoteReq.id,
        name: msg.from.first_name,
        phone: phoneAndCity,
        services: [serviceInfo],
        city: "المملكة",
        budget: "حسب المقايسة",
        urgency: "عاجل",
        description: `طلب مقدم عبر بوت تلجرام: ${serviceInfo}`,
      });
    }

    await sendMessage(
      userId,
      `🎉 <b>تم استلام طلبك بنجاح!</b>\n\nسيقوم الفريق الهندسي بالاطلاع على تفاصيل طلبك والتواصل معك عبر الجوال خلال ساعات العمل.\n\nشكراً لثقتك بـ <b>مؤسسة القوة العاشرة</b>.`,
      { reply_markup: Keyboards.visitorBackToMenu() }
    );
  }
}
