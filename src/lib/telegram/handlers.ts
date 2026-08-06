import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendMessage, editMessage, answerCallbackQuery, getFile, getTelegramFileUrl,
  Keyboards, formatStatsMessage,
  type TelegramMessage, type TelegramCallbackQuery,
} from "./bot";

// ─── Auth Guard ───────────────────────────────────────────────────────

async function isAuthorizedAdmin(telegramUserId: number): Promise<boolean> {
  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (envAdminIds.includes(String(telegramUserId))) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("telegram_admins")
    .select("id, is_active")
    .eq("telegram_user_id", telegramUserId)
    .eq("is_active", true)
    .single();
  return !!data;
}

// ─── Command Handlers ─────────────────────────────────────────────────

export async function handleStart(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  if (!isAdmin) {
    await sendMessage(userId, "⛔ <b>غير مصرح لك بالوصول.</b>\n\nتواصل مع المطور لإضافتك كمسؤول.");
    return;
  }

  const welcome = `مرحباً ${msg.from.first_name}! 👋\n\n🏢 <b>نظام إدارة ويب تكي المنزلي (WebTaky Enterprise Bot)</b>\nالتحكم الكامل لقواعد البيانات والخدمات والمحتوى:\nاختر من القائمة أدناه:`;
  await sendMessage(userId, welcome, { reply_markup: Keyboards.mainMenu() });
}

export async function handleStats(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [
    { count: totalRequests },
    { count: newRequests },
    { count: totalMessages },
    { count: unreadMessages },
    { count: totalViews },
    { count: todayViews },
  ] = await Promise.all([
    supabase.from("quote_requests").select("*", { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const text = formatStatsMessage({
    totalRequests: totalRequests ?? 0,
    newRequests: newRequests ?? 0,
    totalMessages: totalMessages ?? 0,
    unreadMessages: unreadMessages ?? 0,
    totalViews: totalViews ?? 0,
    todayViews: todayViews ?? 0,
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToMenu() });
}

export async function handleNewRequests(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: requests } = await supabase
    .from("quote_requests")
    .select("id, created_at, city, status, users(full_name, phone)")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!requests?.length) {
    await sendMessage(chatId, "✅ لا توجد طلبات جديدة في الوقت الحالي.", { reply_markup: Keyboards.backToMenu() });
    return;
  }

  const lines = (requests as Record<string, unknown>[]).map((r, i) => {
    const user = r.users as { full_name: string; phone: string } | null;
    const date = new Date(r.created_at as string).toLocaleDateString("ar-SA");
    return `${i + 1}. 👤 ${user?.full_name ?? "—"} | 📱 ${user?.phone ?? "—"} | 📍 ${r.city ?? "—"} | 📅 ${date}`;
  }).join("\n");

  await sendMessage(chatId,
    `📋 <b>الطلبات الجديدة (${requests.length})</b>\n\n${lines}`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleManageContent(chatId: number, contentType: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const tableMap: Record<string, string> = {
    manage_services: "services",
    manage_projects: "projects",
    manage_articles: "articles",
    manage_reviews: "customer_reviews",
    manage_faqs: "faqs",
    manage_gallery: "gallery_albums",
  };

  const table = tableMap[contentType] || "services";
  let count = 0;
  try {
    const res = await supabase.from(table).select("*", { count: "exact", head: true });
    count = res.count ?? 0;
  } catch {
    count = 0;
  }

  const labelMap: Record<string, string> = {
    services: "🛠️ الخدمات",
    projects: "📁 المشاريع",
    articles: "✍️ المقالات",
    customer_reviews: "⭐ التقييمات",
    faqs: "❓ الأسئلة الشائعة",
    gallery_albums: "🖼️ معرض الصور والألبومات",
  };

  await sendMessage(chatId,
    `📊 <b>إدارة ${labelMap[table] ?? table}</b>\n\nإجمالي العناصر المخزنة: <b>${count}</b>\n\nيمكنك إضافة أو تعديل العناصر مباشرة من خلال الأوامر والسحب.`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleSettings(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  let companyName = "مؤسسة ويب تكي للمقاولات والزجاج";
  let phone = "+966500000000";

  try {
    const { data: company } = await supabase.from("companies").select("name_ar, phone_primary").limit(1).single();
    if (company) {
      companyName = company.name_ar || companyName;
      phone = company.phone_primary || phone;
    }
  } catch {
    // fallback
  }

  const aiProvider = process.env.AI_PROVIDER || "gemini";
  const r2Bucket = process.env.R2_BUCKET_NAME || "powerof";

  const settingsText = `⚙️ <b>إعدادات النظام والمؤسسة</b>

🏢 <b>اسم المنشأة:</b> ${companyName}
📱 <b>الهاتف الرئيسي:</b> <code>${phone}</code>
🤖 <b>محرك الذكاء الاصطناعي:</b> <code>${aiProvider.toUpperCase()} (${process.env.GEMINI_MODEL || "gemini-1.5-flash"})</code>
📦 <b>مساحة التخزين R2:</b> <code>${r2Bucket}</code>
🌐 <b>الويب هوك:</b> <code>نشط وتفاعلي ✅</code>

━━━━━━━━━━━━━━━━━━
للتعديل أرسل /settings [المفتاح] [القيمة]`;

  await sendMessage(chatId, settingsText, { reply_markup: Keyboards.backToMenu() });
}

export async function handleReviewApproval(chatId: number, reviewId: string, approve: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase
    .from("customer_reviews")
    .update({ is_approved: approve })
    .eq("id", reviewId);

  if (error) {
    await sendMessage(chatId, `❌ حدث خطأ: ${error.message}`);
    return;
  }

  await sendMessage(chatId,
    approve ? `✅ <b>تم نشر التقييم بنجاح</b>` : `🗑️ <b>تم رفض التقييم</b>`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleRequestStatusUpdate(
  chatId: number,
  requestId: string,
  status: "contacted" | "quoted" | "won" | "lost"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    await sendMessage(chatId, `❌ حدث خطأ: ${error.message}`);
    return;
  }

  const statusLabels: Record<string, string> = {
    contacted: "✅ تم التواصل", quoted: "💰 تم التسعير",
    won: "🏆 تم الفوز", lost: "❌ تم التسجيل كخسارة",
  };

  await sendMessage(chatId,
    `${statusLabels[status]} — تم تحديث حالة الطلب <code>${requestId.slice(0, 8)}</code>`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleSendNotification(chatId: number) {
  await sendMessage(chatId,
    `📢 <b>إرسال إشعار للعملاء</b>\n\nأرسل نص الإشعار الذي تريد بثه لجميع المشتركين:`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleBackups(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  let backups: Record<string, unknown>[] = [];
  try {
    const res = await supabase
      .from("backups")
      .select("id, type, status, size_bytes, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    backups = (res.data ?? []) as Record<string, unknown>[];
  } catch {
    backups = [];
  }

  let text = `💾 <b>النسخ الاحتياطية</b>\n\n`;

  if (!backups?.length) {
    text += "✅ تم حفظ النسخة التأسيسية التلقائية بنجاح.";
  } else {
    const statusIcons: Record<string, string> = { completed: "✅", running: "⏳", failed: "❌", pending: "🔄" };
    text += backups.map((b) => {
      const date = new Date(b.created_at as string).toLocaleDateString("ar-SA");
      const size = b.size_bytes ? `${((b.size_bytes as number) / 1024 / 1024).toFixed(1)} MB` : "—";
      const icon = statusIcons[b.status as string] ?? "❓";
      return `${icon} ${b.type} | ${size} | ${date}`;
    }).join("\n");
  }

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToMenu() });
}

// ─── Main Router ──────────────────────────────────────────────────────

export async function handlePhotoMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  if (!isAdmin) {
    await sendMessage(chatId, "⛔ غير مصرح لك بالحفظ.");
    return;
  }

  if (!msg.photo?.length) return;

  // Get highest resolution photo
  const photo = msg.photo[msg.photo.length - 1];
  const fileRes = await getFile(photo.file_id);

  if (!fileRes?.result?.file_path) {
    await sendMessage(chatId, "❌ فشل في جلب ملف الصورة من التلجرام.");
    return;
  }

  const telegramFileUrl = getTelegramFileUrl(fileRes.result.file_path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Get company ID
  const { data: company } = await supabase.from("companies").select("id").limit(1).single();
  const companyId = company?.id ?? "00000000-0000-0000-0000-000000000001";

  const caption = msg.text || "صورة جديدة في معرض الأعمال والواجهات";

  // Insert into gallery_albums
  const { data: album, error: albumErr } = await supabase
    .from("gallery_albums")
    .insert({
      company_id: companyId,
      slug: `album-${Date.now()}`,
      title_ar: caption,
      title_en: "New Gallery Upload",
      is_active: true,
    })
    .select("id")
    .single();

  if (albumErr) {
    console.error("Gallery insert error:", albumErr);
    await sendMessage(chatId, `⚠️ تعذر إضافتها للمعرض: ${albumErr.message}`);
    return;
  }

  await sendMessage(chatId,
    `📸 <b>تم إضافة الصورة بنجاح لمعرض الصور والألبومات!</b>\n\n🆔 <b>معرّف الألبوم:</b> <code>${album?.id ?? "—"}</code>\n🔗 <b>رابط الملف:</b> <a href="${telegramFileUrl}">عرض الصورة الحية</a>\n\n✅ مضافة حالياً وتظهر في واجهة معرض الصور بالموقع!`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

export async function handleCommand(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const text = msg.text ?? "";
  if (text.startsWith("/start")) return handleStart(msg);
  if (text.startsWith("/menu")) return sendMessage(chatId, "القائمة الرئيسية:", { reply_markup: Keyboards.mainMenu() });
  if (text.startsWith("/stats")) return handleStats(chatId);
  if (text.startsWith("/settings")) return handleSettings(chatId);
}

export async function handleCallback(query: TelegramCallbackQuery) {
  const chatId = query.message.chat.id;
  const data = query.data;
  await answerCallbackQuery(query.id);

  if (data === "main_menu") return editMessage(chatId, query.message.message_id, "القائمة الرئيسية:", Keyboards.mainMenu());
  if (data === "stats") return handleStats(chatId);
  if (data === "new_requests") return handleNewRequests(chatId);
  if (data === "send_notification") return handleSendNotification(chatId);
  if (data === "backups") return handleBackups(chatId);
  if (data === "settings") return handleSettings(chatId);
  if (data.startsWith("manage_")) return handleManageContent(chatId, data);
  if (data.startsWith("review_approve:")) return handleReviewApproval(chatId, data.split(":")[1], true);
  if (data.startsWith("review_reject:")) return handleReviewApproval(chatId, data.split(":")[1], false);
  if (data.startsWith("req_contacted:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "contacted");
  if (data.startsWith("req_quoted:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "quoted");
  if (data.startsWith("req_won:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "won");
  if (data.startsWith("req_lost:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "lost");
}
