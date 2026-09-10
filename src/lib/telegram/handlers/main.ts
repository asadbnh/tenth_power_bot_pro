import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards, formatStatsMessage, type TelegramMessage } from "../bot";
import { clearAdminState } from "../state";

export async function isAuthorizedAdmin(telegramUserId: number): Promise<boolean> {
  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (envAdminIds.includes(String(telegramUserId))) {
    return true;
  }

  const db = createDbClient();
  try {
    const { data } = await db
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

export async function handleStart(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  if (!isAdmin) {
    await sendMessage(
      userId,
      `⛔ <b>غير مصرح لك بالوصول إلى لوحة الإدارة.</b>\n\n🆔 رقم حسابك: <code>${userId}</code>\nتواصل مع المشرف العام لإضافتك.`
    );
    return;
  }

  clearAdminState(userId);
  const welcome = `مرحباً ${msg.from.first_name}! 👋\n\n🏢 <b>لوحة تحكم إدارة القوة العاشرة (WebTaky Enterprise Suite)</b>\nالتحكم الشامل واللحظي بقواعد البيانات، العملاء، الخدمات، والطلبات:\n\nاختر من الأقسام التالية للبدء:`;
  await sendMessage(userId, welcome, { reply_markup: Keyboards.mainMenu() });
}

export async function handleHelp(chatId: number) {
  const helpText = `📖 <b>دليل الأوامر السريعة</b>

/start - فتح القائمة الرئيسية
/stats - الإحصائيات الشاملة
/quotes - طلبات عروض الأسعار
/appointments - المواعيد والحجوزات
/messages - استعراض والرد على الرسائل
/users - دليل العملاء
/services - كتالوج الخدمات
/projects - معرض المشاريع
/articles - المقالات والأخبار
/reviews - تقييمات العملاء
/settings - إعدادات المنشأة ووضع الصيانة
/admins - مسؤولي النظام
/audit - سجل العمليات والأمان
/backups - النسخ الاحتياطية`;
  await sendMessage(chatId, helpText, { reply_markup: Keyboards.backToMenu() });
}

export async function handleStats(chatId: number, messageId?: number) {
  const db = createDbClient();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: total_requests },
      { count: new_requests },
      { count: total_appointments },
      { count: pending_appointments },
      { count: total_messages },
      { count: unread_messages },
      { count: total_users },
      { count: total_services },
      { count: total_projects },
      { count: total_articles },
      { count: total_reviews },
      { count: pending_reviews },
      { count: total_views },
      { count: today_views },
    ] = await Promise.all([
      db.from("quote_requests").select("*", { count: "exact", head: true }),
      db.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
      db.from("appointments").select("*", { count: "exact", head: true }),
      db.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("messages").select("*", { count: "exact", head: true }),
      db.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      db.from("users").select("*", { count: "exact", head: true }),
      db.from("services").select("*", { count: "exact", head: true }),
      db.from("projects").select("*", { count: "exact", head: true }),
      db.from("articles").select("*", { count: "exact", head: true }),
      db.from("testimonials").select("*", { count: "exact", head: true }),
      db.from("testimonials").select("*", { count: "exact", head: true }).eq("is_approved", false),
      db.from("analytics_events").select("*", { count: "exact", head: true }),
      db.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    ]);

    const r = {
      total_requests: total_requests ?? 0,
      new_requests: new_requests ?? 0,
      total_appointments: total_appointments ?? 0,
      pending_appointments: pending_appointments ?? 0,
      total_messages: total_messages ?? 0,
      unread_messages: unread_messages ?? 0,
      total_users: total_users ?? 0,
      total_services: total_services ?? 0,
      total_projects: total_projects ?? 0,
      total_articles: total_articles ?? 0,
      total_reviews: total_reviews ?? 0,
      pending_reviews: pending_reviews ?? 0,
      total_views: total_views ?? 0,
      today_views: today_views ?? 0,
    };
    const text = formatStatsMessage({
      totalRequests: r.total_requests ?? 0,
      newRequests: r.new_requests ?? 0,
      totalAppointments: r.total_appointments ?? 0,
      pendingAppointments: r.pending_appointments ?? 0,
      totalMessages: r.total_messages ?? 0,
      unreadMessages: r.unread_messages ?? 0,
      totalUsers: r.total_users ?? 0,
      totalServices: r.total_services ?? 0,
      totalProjects: r.total_projects ?? 0,
      totalArticles: r.total_articles ?? 0,
      totalReviews: r.total_reviews ?? 0,
      pendingReviews: r.pending_reviews ?? 0,
      totalViews: r.total_views ?? 0,
      todayViews: r.today_views ?? 0,
    });

    if (messageId) {
      await editMessage(chatId, messageId, text, Keyboards.backToMenu());
    } else {
      await sendMessage(chatId, text, { reply_markup: Keyboards.backToMenu() });
    }
  } catch (err) {
    console.error("Stats query error:", err);
    await sendMessage(chatId, "⚠️ تعذر جلب الإحصائيات حالياً.", { reply_markup: Keyboards.backToMenu() });
  }
}
