import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendMessage, editMessage, answerCallbackQuery, getFile, getTelegramFileUrl,
  Keyboards, formatStatsMessage,
  type TelegramMessage, type TelegramCallbackQuery,
} from "./bot";
import { setAdminState, getAdminState, clearAdminState } from "./state";

// ─── Auth Guard ───────────────────────────────────────────────────────

export async function isAuthorizedAdmin(telegramUserId: number): Promise<boolean> {
  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (envAdminIds.includes(String(telegramUserId))) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  try {
    const { data } = await supabase
      .from("telegram_admins")
      .select("id, is_active")
      .eq("telegram_user_id", telegramUserId)
      .eq("is_active", true)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

// ─── Main Menu & Welcome ──────────────────────────────────────────────

export async function handleStart(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  if (!isAdmin) {
    await sendMessage(userId, "⛔ <b>غير مصرح لك بالوصول.</b>\n\nتواصل مع المطور أو المسؤول العام لإضافتك.");
    return;
  }

  clearAdminState(userId);
  const welcome = `مرحباً ${msg.from.first_name}! 👋\n\n🏢 <b>نظام إدارة ويب تكي المنزلي (WebTaky Enterprise Suite)</b>\nالتحكم الكامل واللحظي بقاعدة البيانات والعملاء والخدمات والإعدادات:\n\nاختر الأقسام التالية للتحكم:`;
  await sendMessage(userId, welcome, { reply_markup: Keyboards.mainMenu() });
}

export async function handleHelp(chatId: number) {
  const helpText = `📖 <b>دليل الأوامر والاستخدام للبوت</b>

/start - إعادة تشغيل البوت وإظهار القائمة
/menu - فتح القائمة الرئيسية
/stats - التقرير والإحصائيات الكلية
/quotes - إدارة طلبات الأسعار
/appointments - إدارة المواعيد والحجوزات
/messages - استعراض والرد على الرسائل
/users - دليل العملاء والمسجلين
/services - كتالوج الخدمات
/projects - معرض المشاريع والأعمال
/articles - المقالات والأخبار
/reviews - التقييمات وآراء العملاء
/settings - إعدادات المنشأة والذكاء الاصطناعي
/admins - مسؤولي نظام التلجرام
/audit - سجل العمليات والأمان
/backups - النسخ الاحتياطية`;
  await sendMessage(chatId, helpText, { reply_markup: Keyboards.backToMenu() });
}

// ─── Statistics & Analytics Handler ──────────────────────────────────

export async function handleStats(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const [
    { count: totalRequests },
    { count: newRequests },
    { count: totalAppointments },
    { count: pendingAppointments },
    { count: totalMessages },
    { count: unreadMessages },
    { count: totalUsers },
    { count: totalServices },
    { count: totalProjects },
    { count: totalArticles },
    { count: totalReviews },
    { count: pendingReviews },
    { count: totalViews },
    { count: todayViews },
  ] = await Promise.all([
    supabase.from("quote_requests").select("*", { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("customer_reviews").select("*", { count: "exact", head: true }),
    supabase.from("customer_reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const text = formatStatsMessage({
    totalRequests: totalRequests ?? 0,
    newRequests: newRequests ?? 0,
    totalAppointments: totalAppointments ?? 0,
    pendingAppointments: pendingAppointments ?? 0,
    totalMessages: totalMessages ?? 0,
    unreadMessages: unreadMessages ?? 0,
    totalUsers: totalUsers ?? 0,
    totalServices: totalServices ?? 0,
    totalProjects: totalProjects ?? 0,
    totalArticles: totalArticles ?? 0,
    totalReviews: totalReviews ?? 0,
    pendingReviews: pendingReviews ?? 0,
    totalViews: totalViews ?? 0,
    todayViews: todayViews ?? 0,
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToMenu() });
}

// ─── CRM Handlers (Requests, Appointments, Messages, Users) ───────────

export async function handleQuoteRequests(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: requests } = await supabase
    .from("quote_requests")
    .select("id, created_at, city, status, description, users(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!requests?.length) {
    await sendMessage(chatId, "✅ لا توجد طلبات أسعار مسجلة في الوقت الحالي.", { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `📋 <b>أحدث طلبات عروض الأسعار</b>\n\n`;
  const statusEmoji: Record<string, string> = {
    new: "🆕 جديد",
    contacted: "💬 تم التواصل",
    quoted: "💰 تم التسعير",
    won: "🏆 فوز",
    lost: "❌ خسارة",
  };

  (requests as Record<string, unknown>[]).forEach((r, idx) => {
    const user = r.users as { full_name?: string; phone?: string } | null;
    const date = new Date(r.created_at as string).toLocaleDateString("ar-SA");
    text += `${idx + 1}. <b>${user?.full_name ?? "مستفيد"}</b> | 📱 <code>${user?.phone ?? "—"}</code>\n`;
    text += `   📍 المدينة: ${r.city ?? "—"} | الحالة: ${statusEmoji[r.status as string] ?? r.status}\n`;
    text += `   🆔 المعرف: <code>${(r.id as string).slice(0, 8)}</code> | 📅 ${date}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
}

export async function handleAppointments(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, status, preferred_date, notes, users(full_name, phone), services(name_ar)")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!appointments?.length) {
    await sendMessage(chatId, "✅ لا توجد مواعيد مثرية مسجلة.", { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `📅 <b>المواعيد والحجوزات</b>\n\n`;
  const statusEmoji: Record<string, string> = {
    pending: "⏳ قيد الانتظار",
    confirmed: "✅ مؤكد",
    completed: "🏁 مكتمل",
    cancelled: "❌ ملغي",
  };

  (appointments as Record<string, unknown>[]).forEach((apt, idx) => {
    const user = apt.users as { full_name?: string; phone?: string } | null;
    const service = apt.services as { name_ar?: string } | null;
    const dateStr = apt.preferred_date ? new Date(apt.preferred_date as string).toLocaleString("ar-SA") : "غير محدد";
    text += `${idx + 1}. <b>${user?.full_name ?? "مستفيد"}</b> (📱 <code>${user?.phone ?? "—"}</code>)\n`;
    text += `   🛠️ الخدمة: ${service?.name_ar ?? "عام"}\n`;
    text += `   📅 الموعد: ${dateStr} | الحالة: ${statusEmoji[apt.status as string] ?? apt.status}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
}

export async function handleMessages(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, is_read, reply, created_at, users(full_name, phone, email)")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!messages?.length) {
    await sendMessage(chatId, "💬 لا توجد رسائل تواصل حالياً.", { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `💬 <b>رسائل وتواصل العملاء</b>\n\n`;
  (messages as Record<string, unknown>[]).forEach((m, idx) => {
    const user = m.users as { full_name?: string; phone?: string } | null;
    const readTag = m.is_read ? "🟢 مقروءة" : "🔴 غير مقروءة";
    text += `${idx + 1}. <b>${user?.full_name ?? "زائر"}</b> | 📱 <code>${user?.phone ?? "—"}</code> | ${readTag}\n`;
    text += `   💬 الرسالة: "${(m.content as string).slice(0, 70)}..."\n`;
    if (m.reply) text += `   ↪️ الرد: "${(m.reply as string).slice(0, 50)}..."\n`;
    text += `   🆔 المعرف: <code>${m.id}</code>\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
}

export async function handleUsers(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: users, count } = await supabase
    .from("users")
    .select("id, full_name, phone, email, city, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(8);

  let text = `👥 <b>دليل العملاء والمستفيدين (${count ?? 0})</b>\n\n`;
  (users as Record<string, unknown>[] || []).forEach((u, idx) => {
    const date = new Date(u.created_at as string).toLocaleDateString("ar-SA");
    text += `${idx + 1}. <b>${u.full_name ?? "بدون اسم"}</b> | 📍 ${u.city ?? "—"}\n`;
    text += `   📱 <code>${u.phone ?? "—"}</code> ${u.email ? `| 📧 ${u.email}` : ""}\n`;
    text += `   📅 تاريخ التسجيل: ${date}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
}

// ─── Content Handlers (Services, Projects, Articles, Categories, FAQs) ─

export async function handleServices(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: services } = await supabase
    .from("services")
    .select("id, name_ar, is_active, is_featured, price_from, price_to, view_count")
    .order("sort_order", { ascending: true })
    .limit(10);

  let text = `🛠️ <b>إدارة الخدمات والكتالوج (${services?.length ?? 0})</b>\n\n`;
  (services as Record<string, unknown>[] || []).forEach((s, idx) => {
    const active = s.is_active ? "🟢 نشطة" : "🔴 معطلة";
    const featured = s.is_featured ? "⭐ مميزة" : "";
    const price = s.price_from ? `${s.price_from} - ${s.price_to ?? ""} ر.س` : "حسب المعاينة";
    text += `${idx + 1}. <b>${s.name_ar}</b> | ${active} ${featured}\n`;
    text += `   💰 السعر: ${price} | 👁️ المشاهدات: ${s.view_count ?? 0}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_content") });
}

export async function handleProjects(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title_ar, client_name, status, is_featured, project_value, view_count")
    .order("created_at", { ascending: false })
    .limit(8);

  let text = `📁 <b>معرض الأعمال والمشاريع (${projects?.length ?? 0})</b>\n\n`;
  (projects as Record<string, unknown>[] || []).forEach((p, idx) => {
    const featured = p.is_featured ? "⭐ مميز" : "";
    const val = p.project_value ? `${(p.project_value as number).toLocaleString("ar-SA")} ر.س` : "غير محدد";
    text += `${idx + 1}. <b>${p.title_ar}</b> | الحالة: <code>${p.status}</code> ${featured}\n`;
    text += `   👤 العميل: ${p.client_name ?? "—"} | 💰 القيمة: ${val} | 👁️ المشاهدات: ${p.view_count ?? 0}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_content") });
}

export async function handleArticles(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title_ar, status, is_featured, view_count, published_at")
    .order("created_at", { ascending: false })
    .limit(8);

  let text = `✍️ <b>المقالات والمحتوى الإخباري (${articles?.length ?? 0})</b>\n\n`;
  const statusLabels: Record<string, string> = {
    published: "🟢 منشورة",
    draft: "📝 مسودة",
    review: "⏳ قيد المراجعة",
    archived: "📦 مأرشفة",
  };

  (articles as Record<string, unknown>[] || []).forEach((a, idx) => {
    const statusText = statusLabels[a.status as string] ?? a.status;
    const featured = a.is_featured ? "⭐ مميز" : "";
    text += `${idx + 1}. <b>${a.title_ar}</b> | ${statusText} ${featured}\n`;
    text += `   👁️ المشاهدات: ${a.view_count ?? 0}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_content") });
}

export async function handleCategories(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ar, is_active, sort_order")
    .order("sort_order", { ascending: true });

  let text = `📂 <b>تصنيفات الخدمات والأعمال (${categories?.length ?? 0})</b>\n\n`;
  (categories as Record<string, unknown>[] || []).forEach((c, idx) => {
    const active = c.is_active ? "🟢" : "🔴";
    text += `${idx + 1}. ${active} <b>${c.name_ar}</b> (الترتيب: ${c.sort_order})\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_content") });
}

export async function handleFAQs(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question_ar, is_active")
    .order("sort_order", { ascending: true })
    .limit(8);

  let text = `❓ <b>الأسئلة الشائعة FAQ (${faqs?.length ?? 0})</b>\n\n`;
  (faqs as Record<string, unknown>[] || []).forEach((f, idx) => {
    const active = f.is_active ? "🟢" : "🔴";
    text += `${idx + 1}. ${active} <b>${f.question_ar}</b>\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_content") });
}

// ─── Media & Gallery Handlers ──────────────────────────────────────────

export async function handleGallery(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("id, title_ar, is_active, gallery_items(count)")
    .order("created_at", { ascending: false });

  let text = `🖼️ <b>معرض الصور والألبومات (${albums?.length ?? 0})</b>\n\n`;
  (albums as Record<string, unknown>[] || []).forEach((alb, idx) => {
    const itemsCount = (alb.gallery_items as { count: number }[])?.[0]?.count ?? 0;
    const active = alb.is_active ? "🟢" : "🔴";
    text += `${idx + 1}. ${active} <b>${alb.title_ar}</b> | 📸 الصور: <b>${itemsCount}</b>\n`;
    text += `   🆔 المعرف: <code>${alb.id}</code>\n\n`;
  });
  text += `💡 <b>ملاحظة:</b> يمكنك إرسال أي صورة مباشرة للبوت ليتم حفظها تلقائياً في المعرض!`;

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_media") });
}

export async function handleMediaLibrary(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: files, count } = await supabase
    .from("media_library")
    .select("id, file_name, mime_type, file_size, storage_provider, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(6);

  let text = `📁 <b>مكتبة الوسائط والتخزين R2 (${count ?? 0})</b>\n\n`;
  (files as Record<string, unknown>[] || []).forEach((f, idx) => {
    const sizeMb = ((f.file_size as number) / 1024 / 1024).toFixed(2);
    text += `${idx + 1}. 📄 <b>${f.file_name}</b> | ${sizeMb} MB\n`;
    text += `   📦 التخزين: <code>${f.storage_provider}</code> | ${f.mime_type}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_media") });
}

// ─── Reviews & Testimonials Handlers ──────────────────────────────────

export async function handleCustomerReviews(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: reviews } = await supabase
    .from("customer_reviews")
    .select("id, reviewer_name, rating, content_ar, is_approved, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!reviews?.length) {
    await sendMessage(chatId, "⭐ لا توجد تقييمات مسجلة حالياً.", { reply_markup: Keyboards.backToSubmenu("menu_reviews") });
    return;
  }

  let text = `⭐ <b>تقييمات العملاء العامة</b>\n\n`;
  (reviews as Record<string, unknown>[]).forEach((r, idx) => {
    const stars = "⭐".repeat(r.rating as number);
    const approvedTag = r.is_approved ? "🟢 منشور" : "⏳ ينتظر موافقتك";
    text += `${idx + 1}. <b>${r.reviewer_name}</b> (${stars}) — ${approvedTag}\n`;
    text += `   💬 "${(r.content_ar as string || "").slice(0, 60)}..."\n`;
    text += `   🆔 المعرف: <code>${r.id}</code>\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_reviews") });
}

export async function handleTestimonials(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, client_name, client_company, rating, is_featured, is_approved")
    .order("created_at", { ascending: false })
    .limit(6);

  let text = `💬 <b>آراء العملاء المعتمدة (Testimonials)</b>\n\n`;
  (testimonials as Record<string, unknown>[] || []).forEach((t, idx) => {
    const stars = "⭐".repeat(t.rating as number);
    text += `${idx + 1}. <b>${t.client_name}</b> (${t.client_company ?? "عميل"}) ${stars}\n`;
    text += `   الحالة: ${t.is_approved ? "🟢 مفعل" : "🔴 معطل"} ${t.is_featured ? "| ⭐ مميز" : ""}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_reviews") });
}

// ─── Local SEO City Pages Handlers ────────────────────────────────────

export async function handleCityPages(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: cities } = await supabase
    .from("city_pages")
    .select("id, city_name_ar, region_ar, is_active, city_services(count)")
    .order("created_at", { ascending: false });

  let text = `📍 <b>صفحات المدن والتسويق المحلي (${cities?.length ?? 0})</b>\n\n`;
  (cities as Record<string, unknown>[] || []).forEach((c, idx) => {
    const serviceCount = (c.city_services as { count: number }[])?.[0]?.count ?? 0;
    const active = c.is_active ? "🟢" : "🔴";
    text += `${idx + 1}. ${active} <b>صفحة ${c.city_name_ar}</b> (${c.region_ar ?? "السعودية"})\n`;
    text += `   🛠️ الخدمات المخصصة للمدينة: <b>${serviceCount}</b>\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_city") });
}

export async function handleCityServices(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: list, count } = await supabase
    .from("city_services")
    .select("id, city_pages(city_name_ar), services(name_ar)", { count: "exact" })
    .limit(8);

  let text = `🔗 <b>ربط الخدمات بالمدن (City Services: ${count ?? 0})</b>\n\n`;
  (list as Record<string, unknown>[] || []).forEach((item, idx) => {
    const city = item.city_pages as { city_name_ar?: string } | null;
    const service = item.services as { name_ar?: string } | null;
    text += `${idx + 1}. 📍 <b>${city?.city_name_ar ?? "—"}</b> ⬅️ 🛠️ <b>${service?.name_ar ?? "—"}</b>\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_city") });
}

// ─── Company & Settings Handlers ──────────────────────────────────────

export async function handleCompanyProfile(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  let company: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase.from("companies").select("*").limit(1).single();
    company = data;
  } catch {
    company = null;
  }

  const maint = company?.maintenance_mode ? "🔴 مفعّل (الموقع مغلق)" : "🟢 معطل (الموقع يعمل بشكل طبيعي)";

  const text = `🏢 <b>ملف المنشأة والهوية</b>

🏛️ <b>الاسم العربي:</b> ${company?.name_ar ?? "مؤسسة ويب تكي"}
🌐 <b>الاسم الانجليزي:</b> ${company?.slug ?? "webtaky"}
📱 <b>الهاتف الرئيسي:</b> <code>${company?.phone_primary ?? "غير محدد"}</code>
💬 <b>الواتساب:</b> <code>${company?.whatsapp_number ?? "غير محدد"}</code>
📧 <b>البريد:</b> ${company?.email ?? "غير محدد"}
🧾 <b>الرقم الضريبي:</b> <code>${company?.tax_number ?? "غير محدد"}</code>
📑 <b>السجل التجاري:</b> <code>${company?.commercial_register ?? "غير محدد"}</code>
🚧 <b>وضع الصيانة:</b> ${maint}`;

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

export async function handleCompanySettings(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: settings } = await supabase.from("company_settings").select("key, value, category");

  let text = `⚙️ <b>مفاتيح وإعدادات النظام (Settings Store)</b>\n\n`;
  (settings as Record<string, unknown>[] || []).forEach((s, idx) => {
    text += `${idx + 1}. 🔑 <code>${s.key}</code> [${s.category ?? "General"}]\n`;
    text += `   📝 القيمة: <code>${JSON.stringify(s.value)}</code>\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

export async function handleBusinessHours(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: hours } = await supabase.from("business_hours").select("*").order("day_of_week", { ascending: true });

  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  let text = `⏰ <b>جدول أوقات العمل والدوام الرسمية</b>\n\n`;

  if (!hours?.length) {
    text += `🟢 الدوام الرسمي من السبت إلى الخميس (8:00 ص - 10:00 م)`;
  } else {
    (hours as Record<string, unknown>[]).forEach((h) => {
      const dayName = dayNames[h.day_of_week as number] ?? `يوم ${h.day_of_week}`;
      const status = h.is_closed ? "🔴 مغلق" : `🟢 ${h.open_time} - ${h.close_time}`;
      text += `• <b>${dayName}:</b> ${status}\n`;
    });
  }

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

export async function handleCompanyContacts(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: contacts } = await supabase.from("company_contacts").select("*");

  let text = `📞 <b>قنوات وجهات الاتصال</b>\n\n`;
  (contacts as Record<string, unknown>[] || []).forEach((c, idx) => {
    text += `${idx + 1}. <b>${c.label_ar ?? c.type}</b>: <code>${c.value}</code> ${c.is_primary ? "(رئيسي)" : ""}\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

export async function handleAIPrompts(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: prompts } = await supabase.from("ai_prompts").select("*");

  let text = `🤖 <b>نماذج وموجهات الذكاء الاصطناعي (AI Prompts & Agents)</b>\n\n`;
  if (!prompts?.length) {
    text += `🤖 <b>المساعد الافتراضي:</b> GPT-4o-mini / Gemini-1.5-Flash\n`;
    text += `🔥 <b>درجة الابتكار:</b> 0.7 | <b>الحد الأقصى للتوكنز:</b> 1000`;
  } else {
    (prompts as Record<string, unknown>[]).forEach((p, idx) => {
      text += `${idx + 1}. <b>النوع:</b> <code>${p.prompt_type}</code> | النموذج: <code>${p.model}</code>\n`;
      text += `   🔥 Temperature: ${p.temperature} | الحالة: ${p.is_active ? "🟢" : "🔴"}\n\n`;
    });
  }

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

export async function handleTelegramAdmins(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: admins } = await supabase.from("telegram_admins").select("*");

  let text = `👑 <b>المسؤولون والمصرح لهم على التلجرام</b>\n\n`;
  (admins as Record<string, unknown>[] || []).forEach((a, idx) => {
    const active = a.is_active ? "🟢" : "🔴";
    text += `${idx + 1}. ${active} ID: <code>${a.telegram_user_id}</code> | @${a.telegram_username ?? "—"}\n`;
    text += `   الصلاحية: <code>${a.role}</code>\n\n`;
  });
  text += `➕ لإضافة مسؤول جديد، أرسل: /addadmin [TELEGRAM_ID]`;

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_settings") });
}

// ─── Operations & Security Handlers ───────────────────────────────────

export async function handleBackups(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: backups } = await supabase
    .from("backups")
    .select("id, type, status, size_bytes, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  let text = `💾 <b>سجل النسخ الاحتياطية والدعم الفني</b>\n\n`;
  if (!backups?.length) {
    text += "✅ النسخة التأسيسية محفوظة بنجاح ومحسّنة لقاعدة البيانات.";
  } else {
    const statusIcons: Record<string, string> = { completed: "✅", running: "⏳", failed: "❌", pending: "🔄" };
    (backups as Record<string, unknown>[]).forEach((b) => {
      const date = new Date(b.created_at as string).toLocaleDateString("ar-SA");
      const size = b.size_bytes ? `${((b.size_bytes as number) / 1024 / 1024).toFixed(1)} MB` : "—";
      const icon = statusIcons[b.status as string] ?? "❓";
      text += `${icon} <b>${b.type}</b> | ${size} | 📅 ${date}\n`;
    });
  }

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_system") });
}

export async function handleAuditLogs(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, actor_type, action, entity_type, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  let text = `🛡️ <b>سجل الأمان والعمليات (Audit Log)</b>\n\n`;
  if (!logs?.length) {
    text += "✅ لا توجد عمليات مشبوهة أو تغييرات أمان متقدمة حالياً.";
  } else {
    (logs as Record<string, unknown>[]).forEach((l, idx) => {
      const date = new Date(l.created_at as string).toLocaleTimeString("ar-SA");
      text += `${idx + 1}. <b>${l.action}</b> (${l.entity_type})\n`;
      text += `   👤 الفاعل: ${l.actor_type} | 🕒 ${date}\n\n`;
    });
  }

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_system") });
}

export async function handlePushSubscriptions(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { count } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const text = `🔔 <b>اشتراكات الإشعارات المباشرة (Web Push)</b>\n\nإجمالي الأجهزة والمتصفحات المشتركة بالإشعارات: <b>${count ?? 0}</b> جهاز نشط.`;
  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_system") });
}

export async function handleAnalytics(chatId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, page_path, device_type, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  let text = `👁️ <b>تحليلات الحركة والزيارات المباشرة</b>\n\n`;
  (events as Record<string, unknown>[] || []).forEach((e, idx) => {
    const time = new Date(e.created_at as string).toLocaleTimeString("ar-SA");
    text += `${idx + 1}. <b>${e.event_type}</b> | 🌐 ${e.page_path ?? "/"}\n`;
    text += `   📱 الجهاز: ${e.device_type ?? "Desktop"} | 🕒 ${time}\n\n`;
  });

  await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_system") });
}

export async function handleSendNotificationPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_broadcast_text");
  await sendMessage(chatId,
    `📢 <b>إرسال إشعار جماعي للعملاء والمسؤولين</b>\n\nقم بكتابة نص الإشعار المطلوب بثه لجميع المشتركين ثم اضغط إرسال:`,
    { reply_markup: Keyboards.backToMenu() }
  );
}

// ─── Status Update Callback Actions ───────────────────────────────────

export async function handleRequestStatusUpdate(
  chatId: number,
  requestId: string,
  status: "contacted" | "quoted" | "won" | "lost"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", requestId);

  if (error) {
    await sendMessage(chatId, `❌ حدث خطأ أثناء التحديث: ${error.message}`);
    return;
  }

  const statusLabels: Record<string, string> = {
    contacted: "✅ تم التواصل",
    quoted: "💰 تم التسعير",
    won: "🏆 تم الفوز",
    lost: "❌ تم التسجيل كخسارة",
  };

  await sendMessage(chatId,
    `${statusLabels[status]} — تم تحديث حالة طلب السعر <code>${requestId.slice(0, 8)}</code>`,
    { reply_markup: Keyboards.backToSubmenu("crm_quotes") }
  );
}

export async function handleAppointmentStatusUpdate(
  chatId: number,
  appointmentId: string,
  status: "confirmed" | "completed" | "cancelled"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId);

  if (error) {
    await sendMessage(chatId, `❌ حدث خطأ: ${error.message}`);
    return;
  }

  const labels = { confirmed: "✅ تم تأكيد الموعد", completed: "🏁 تم إكمال الموعد", cancelled: "❌ تم إلغاء الموعد" };
  await sendMessage(chatId, `${labels[status]} <code>${appointmentId.slice(0, 8)}</code>`, {
    reply_markup: Keyboards.backToSubmenu("crm_appointments"),
  });
}

export async function handleReviewApproval(chatId: number, reviewId: string, approve: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase.from("customer_reviews").update({ is_approved: approve }).eq("id", reviewId);

  if (error) {
    await sendMessage(chatId, `❌ حدث خطأ: ${error.message}`);
    return;
  }

  await sendMessage(chatId, approve ? `✅ <b>تم نشر التقييم بنجاح بالموقع</b>` : `🗑️ <b>تم رفض التقييم</b>`, {
    reply_markup: Keyboards.backToSubmenu("rev_customer"),
  });
}

// ─── Photo Upload to Gallery Handler ──────────────────────────────────

export async function handlePhotoMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  if (!isAdmin) {
    await sendMessage(chatId, "⛔ غير مصرح لك بالحفظ.");
    return;
  }

  if (!msg.photo?.length) return;

  const photo = msg.photo[msg.photo.length - 1];
  const fileRes = await getFile(photo.file_id);

  if (!fileRes?.result?.file_path) {
    await sendMessage(chatId, "❌ فشل في جلب ملف الصورة من التلجرام.");
    return;
  }

  const telegramFileUrl = getTelegramFileUrl(fileRes.result.file_path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: company } = await supabase.from("companies").select("id").limit(1).single();
  const companyId = company?.id ?? "00000000-0000-0000-0000-000000000001";

  const caption = msg.text || "صورة جديدة مرفوعة من التلجرام";

  const { data: album, error: albumErr } = await supabase
    .from("gallery_albums")
    .insert({
      company_id: companyId,
      slug: `album-${Date.now()}`,
      title_ar: caption,
      title_en: "Uploaded via Telegram",
      is_active: true,
    })
    .select("id")
    .single();

  if (albumErr) {
    console.error("Gallery insert error:", albumErr);
    await sendMessage(chatId, `⚠️ تعذر إضافة الألبوم: ${albumErr.message}`);
    return;
  }

  await sendMessage(chatId,
    `📸 <b>تم رفع الصورة وحفظها بنجاح لمعرض الصور!</b>\n\n🆔 <b>معرّف الألبوم:</b> <code>${album?.id ?? "—"}</code>\n🔗 <a href="${telegramFileUrl}">عرض الصورة الحية</a>`,
    { reply_markup: Keyboards.backToSubmenu("med_gallery") }
  );
}

// ─── Stateful Text Messages & Commands Dispatcher ─────────────────────

export async function handleTextMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text?.trim() ?? "";

  const state = getAdminState(userId);
  if (state?.step === "awaiting_broadcast_text") {
    clearAdminState(userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { data: company } = await supabase.from("companies").select("id").limit(1).single();
    const companyId = company?.id ?? "00000000-0000-0000-0000-000000000001";

    await supabase.from("notification_log").insert({
      company_id: companyId,
      type: "telegram_broadcast",
      title_ar: "إشعار عام",
      body_ar: text,
      target_audience: "all_subscribers",
    });

    await sendMessage(chatId, `✅ <b>تم بث الإشعار بنجاح وتسجيله في النظام!</b>\n\n📝 النص:\n${text}`, {
      reply_markup: Keyboards.mainMenu(),
    });
    return;
  }

  if (text.startsWith("/")) {
    return handleCommand(msg);
  }
}

export async function handleCommand(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const text = msg.text ?? "";

  if (text.startsWith("/start")) return handleStart(msg);
  if (text.startsWith("/menu")) return sendMessage(chatId, "🏢 القائمة الرئيسية للنظام:", { reply_markup: Keyboards.mainMenu() });
  if (text.startsWith("/help")) return handleHelp(chatId);
  if (text.startsWith("/stats")) return handleStats(chatId);
  if (text.startsWith("/quotes")) return handleQuoteRequests(chatId);
  if (text.startsWith("/appointments")) return handleAppointments(chatId);
  if (text.startsWith("/messages")) return handleMessages(chatId);
  if (text.startsWith("/users")) return handleUsers(chatId);
  if (text.startsWith("/services")) return handleServices(chatId);
  if (text.startsWith("/projects")) return handleProjects(chatId);
  if (text.startsWith("/articles")) return handleArticles(chatId);
  if (text.startsWith("/reviews")) return handleCustomerReviews(chatId);
  if (text.startsWith("/settings")) return handleCompanyProfile(chatId);
  if (text.startsWith("/admins")) return handleTelegramAdmins(chatId);
  if (text.startsWith("/audit")) return handleAuditLogs(chatId);
  if (text.startsWith("/backups")) return handleBackups(chatId);
}

// ─── Callback Queries Router ──────────────────────────────────────────

export async function handleCallback(query: TelegramCallbackQuery) {
  const chatId = query.message.chat.id;
  const data = query.data;
  await answerCallbackQuery(query.id);

  // Main & Submenus
  if (data === "main_menu") return editMessage(chatId, query.message.message_id, "🏢 <b>القائمة الرئيسية للنظام</b>", Keyboards.mainMenu());
  if (data === "menu_stats") return handleStats(chatId);
  if (data === "menu_crm") return editMessage(chatId, query.message.message_id, "💼 <b>قسم المبيعات والعملاء</b>", Keyboards.crmMenu());
  if (data === "menu_content") return editMessage(chatId, query.message.message_id, "🛠️ <b>قسم المحتوى والكتالوج</b>", Keyboards.contentMenu());
  if (data === "menu_media") return editMessage(chatId, query.message.message_id, "🖼️ <b>قسم الوسائط والأنشطة</b>", Keyboards.mediaMenu());
  if (data === "menu_reviews") return editMessage(chatId, query.message.message_id, "⭐ <b>قسم التقييمات والآراء</b>", Keyboards.reviewsMenu());
  if (data === "menu_city") return editMessage(chatId, query.message.message_id, "📍 <b>قسم صفحات المدن للتسويق</b>", Keyboards.cityMenu());
  if (data === "menu_settings") return editMessage(chatId, query.message.message_id, "⚙️ <b>إعدادات المنشأة والذكاء الاصطناعي</b>", Keyboards.settingsMenu());
  if (data === "menu_system") return editMessage(chatId, query.message.message_id, "🛡️ <b>قسم الأمان والعمليات</b>", Keyboards.systemMenu());

  // CRM
  if (data === "crm_quotes") return handleQuoteRequests(chatId);
  if (data === "crm_appointments") return handleAppointments(chatId);
  if (data === "crm_messages") return handleMessages(chatId);
  if (data === "crm_users") return handleUsers(chatId);

  // Content
  if (data === "cnt_services") return handleServices(chatId);
  if (data === "cnt_projects") return handleProjects(chatId);
  if (data === "cnt_articles") return handleArticles(chatId);
  if (data === "cnt_categories") return handleCategories(chatId);
  if (data === "cnt_faqs") return handleFAQs(chatId);

  // Media
  if (data === "med_gallery") return handleGallery(chatId);
  if (data === "med_library") return handleMediaLibrary(chatId);

  // Reviews
  if (data === "rev_customer") return handleCustomerReviews(chatId);
  if (data === "rev_testimonials") return handleTestimonials(chatId);

  // City Pages
  if (data === "city_pages") return handleCityPages(chatId);
  if (data === "city_services") return handleCityServices(chatId);

  // Settings
  if (data === "set_company") return handleCompanyProfile(chatId);
  if (data === "set_keys") return handleCompanySettings(chatId);
  if (data === "set_hours") return handleBusinessHours(chatId);
  if (data === "set_contacts") return handleCompanyContacts(chatId);
  if (data === "set_ai") return handleAIPrompts(chatId);
  if (data === "set_admins") return handleTelegramAdmins(chatId);

  // System & Operations
  if (data === "sys_backups") return handleBackups(chatId);
  if (data === "sys_audit") return handleAuditLogs(chatId);
  if (data === "sys_push") return handlePushSubscriptions(chatId);
  if (data === "sys_analytics") return handleAnalytics(chatId);
  if (data === "send_notification") return handleSendNotificationPrompt(chatId);

  // Status Updates Callbacks
  if (data.startsWith("review_approve:")) return handleReviewApproval(chatId, data.split(":")[1], true);
  if (data.startsWith("review_reject:")) return handleReviewApproval(chatId, data.split(":")[1], false);
  if (data.startsWith("req_contacted:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "contacted");
  if (data.startsWith("req_quoted:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "quoted");
  if (data.startsWith("req_won:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "won");
  if (data.startsWith("req_lost:")) return handleRequestStatusUpdate(chatId, data.split(":")[1], "lost");
  if (data.startsWith("apt_confirm:")) return handleAppointmentStatusUpdate(chatId, data.split(":")[1], "confirmed");
  if (data.startsWith("apt_complete:")) return handleAppointmentStatusUpdate(chatId, data.split(":")[1], "completed");
  if (data.startsWith("apt_cancel:")) return handleAppointmentStatusUpdate(chatId, data.split(":")[1], "cancelled");
}
