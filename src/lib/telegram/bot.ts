/**
 * Telegram Bot Service & Keyboard Registry (Backward Compatibility Facade)
 * Re-exports from unified core modules, and maintains message formatters.
 */

export * from "./core/types";
export * from "./core/client";
export * from "./core/keyboards";

// ─── Message Formatters ───────────────────────────────────────────────

export function formatQuoteAlert(data: {
  name: string; phone: string; services: string[];
  city: string; budget?: string; urgency: string; description: string; id: string;
}) {
  const budgetText = (data.budget && data.budget !== "00" && data.budget !== "غير محدد")
    ? data.budget
    : "غير محددة (افتراضي 00)";

  const cleanPhone = data.phone.replace(/[^0-9]/g, "");
  const waPhone = cleanPhone.startsWith("05") ? "966" + cleanPhone.substring(1) : cleanPhone;
  const nowStr = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });

  return `🚨 <b>إشعار فوري: طلب عرض سعر جديد من الموقع!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>اسم العميل:</b> ${data.name}
📱 <b>رقم الجوال:</b> <code>${data.phone}</code>
💬 <b>واتساب العميل:</b> <a href="https://wa.me/${waPhone}">اضغط هنا لفتح المحادثة</a>
📍 <b>المدينة:</b> ${data.city}
⚡ <b>مستوى الاستعجال:</b> ${data.urgency}
💰 <b>الميزانية:</b> ${budgetText}

🛠️ <b>الخدمات المطلوبة:</b>
${data.services.map((s) => `  • ${s}`).join("\n")}

📝 <b>تفاصيل ووصف المشروع:</b>
${data.description}

📅 <b>التوقيت:</b> ${nowStr}
🆔 <b>رقم الطلب في النظام:</b> <code>${data.id}</code>
━━━━━━━━━━━━━━━━━━
⚡ <i>تم إرسال هذا التنبيه فوراً إلى هاتفك لتتمكن من متابعة العميل والاتفاق معه مباشرة.</i>`;
}

export function formatMessageAlert(data: {
  name: string; phone: string; email?: string; subject?: string; content: string; id: string;
}) {
  return `💬 <b>رسالة تواصل جديدة!</b>

👤 <b>الاسم:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.email ? `📧 <b>البريد:</b> ${data.email}\n` : ""}${data.subject ? `📌 <b>الموضوع:</b> ${data.subject}\n` : ""}
💬 <b>الرسالة:</b>
${data.content}

🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatAppointmentAlert(data: {
  id: string; userName: string; phone: string; serviceName?: string; preferredDate?: string; notes?: string;
}) {
  return `📅 <b>حجز موعد جديد!</b>

👤 <b>العميل:</b> ${data.userName}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${data.preferredDate ? `📅 <b>الموعد المطلوب:</b> ${data.preferredDate}\n` : ""}${data.notes ? `📝 <b>ملاحظات:</b> ${data.notes}\n` : ""}
🆔 <b>المعرّف:</b> <code>${data.id}</code>`;
}

export function formatStatsMessage(stats: {
  totalRequests: number; newRequests: number; totalAppointments: number; pendingAppointments: number;
  totalMessages: number; unreadMessages: number; totalUsers: number; totalServices: number;
  totalProjects: number; totalArticles: number; totalReviews: number; pendingReviews: number;
  totalViews: number; todayViews: number;
}) {
  const now = new Date().toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `📊 <b>لوحة تحكم إحصائيات المنصة الشاملة</b>
📅 ${now}

━━━━━━━━━━━━━━━━━━
📋 <b>طلبات الأسعار:</b> <b>${stats.totalRequests}</b> (جديد: ${stats.newRequests} 🆕)
📅 <b>المواعيد والحجوزات:</b> <b>${stats.totalAppointments}</b> (قيد الانتظار: ${stats.pendingAppointments} ⏳)
💬 <b>الرسائل والاستفسارات:</b> <b>${stats.totalMessages}</b> (غير مقروءة: ${stats.unreadMessages} 🔴)
👥 <b>دليل العملاء (Leads):</b> <b>${stats.totalUsers}</b>
🛠️ <b>الخدمات المسجلة:</b> <b>${stats.totalServices}</b>
📁 <b>المشاريع والأعمال:</b> <b>${stats.totalProjects}</b>
✍️ <b>المقالات والأخبار:</b> <b>${stats.totalArticles}</b>
⭐ <b>التقييمات:</b> <b>${stats.totalReviews}</b> (تنتظر الموافقة: ${stats.pendingReviews} ⏳)
👁️ <b>الزيارات الكلية:</b> <b>${stats.totalViews.toLocaleString("ar-SA")}</b> (اليوم: ${stats.todayViews.toLocaleString("ar-SA")})
━━━━━━━━━━━━━━━━━━`;
}
