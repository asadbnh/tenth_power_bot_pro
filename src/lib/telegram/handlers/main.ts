import { isAuthorizedAdmin } from "../core/auth";
import { sendMessage, editMessage, Keyboards, formatStatsMessage, type TelegramMessage } from "../bot";
import { clearAdminState } from "../state";
import { getDashboardMetrics } from "../miniapp/services/dashboard.service";

export { isAuthorizedAdmin };

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
  const welcome = `مرحباً ${msg.from.first_name}! 👋\n\n🏢 <b>لوحة تحكم إدارة القوة العاشرة (tenth-power-glass Enterprise Suite)</b>\nالتحكم الشامل واللحظي بقواعد البيانات، العملاء، الخدمات، والطلبات:\n\nاختر من الأقسام التالية للبدء:`;
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
  try {
    const stats = await getDashboardMetrics();

    const text = formatStatsMessage({
      totalRequests: stats.totalQuoteRequests,
      newRequests: stats.newQuoteRequests,
      totalAppointments: stats.totalAppointments,
      pendingAppointments: stats.pendingAppointments,
      totalMessages: stats.totalMessages,
      unreadMessages: stats.unreadMessages,
      totalUsers: stats.totalUsers,
      totalServices: stats.totalServices,
      totalProjects: stats.totalProjects,
      totalArticles: stats.totalArticles,
      totalReviews: stats.totalReviews,
      pendingReviews: stats.pendingReviews,
      totalViews: stats.totalPageViews,
      todayViews: stats.todayPageViews,
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
