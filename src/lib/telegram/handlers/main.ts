import { getSql, createDbClient } from "@/lib/db";
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
  const sql = getSql();

  try {
    const rows = await sql`
      SELECT 
        (SELECT COUNT(*)::int FROM quote_requests) AS total_requests,
        (SELECT COUNT(*)::int FROM quote_requests WHERE status = 'new') AS new_requests,
        (SELECT COUNT(*)::int FROM appointments) AS total_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'pending') AS pending_appointments,
        (SELECT COUNT(*)::int FROM messages) AS total_messages,
        (SELECT COUNT(*)::int FROM messages WHERE is_read = false) AS unread_messages,
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM services) AS total_services,
        (SELECT COUNT(*)::int FROM projects) AS total_projects,
        (SELECT COUNT(*)::int FROM articles) AS total_articles,
        (SELECT COUNT(*)::int FROM testimonials) AS total_reviews,
        (SELECT COUNT(*)::int FROM testimonials WHERE is_approved = false) AS pending_reviews,
        (SELECT COUNT(*)::int FROM analytics_events) AS total_views,
        (SELECT COUNT(*)::int FROM analytics_events WHERE created_at >= CURRENT_DATE) AS today_views;
    `;

    const r = rows[0] || {};
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
