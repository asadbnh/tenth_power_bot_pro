import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendMessage, Keyboards, formatQuoteAlert, formatMessageAlert, formatAppointmentAlert
} from "./bot";

async function getAdminChatIds(): Promise<number[]> {
  const envAdminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((n) => !isNaN(n));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  let dbAdminIds: number[] = [];
  try {
    const { data } = await supabase
      .from("telegram_admins")
      .select("telegram_user_id")
      .eq("is_active", true);
    if (data) {
      dbAdminIds = (data as { telegram_user_id: number }[]).map((a) => Number(a.telegram_user_id));
    }
  } catch (err) {
    console.error("Error fetching db admins:", err);
  }

  return Array.from(new Set([...envAdminIds, ...dbAdminIds]));
}

async function broadcastToAdmins(text: string, options?: Parameters<typeof sendMessage>[2]) {
  const adminIds = await getAdminChatIds();
  await Promise.allSettled(adminIds.map((chatId) => sendMessage(chatId, text, options)));
}

export async function notifyNewQuoteRequest(data: {
  id: string; name: string; phone: string; services: string[];
  city: string; budget: string; urgency: string; description: string;
}) {
  await broadcastToAdmins(formatQuoteAlert(data), { reply_markup: Keyboards.requestActions(data.id) });
}

export async function notifyNewMessage(data: {
  id: string; name: string; phone: string; email?: string; subject?: string; content: string;
}) {
  await broadcastToAdmins(formatMessageAlert(data), { reply_markup: Keyboards.backToMenu() });
}

export async function notifyNewAppointment(data: {
  id: string; userName: string; phone: string; serviceName?: string; preferredDate?: string; notes?: string;
}) {
  await broadcastToAdmins(formatAppointmentAlert(data), { reply_markup: Keyboards.appointmentActions(data.id) });
}

export async function notifyNewReview(data: {
  id: string; reviewerName: string; rating: number; content: string; serviceName?: string;
}) {
  const stars = "⭐".repeat(data.rating);
  const text = `⭐ <b>تقييم جديد يحتاج موافقة!</b>\n\n👤 <b>المُقيِّم:</b> ${data.reviewerName}\n${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${stars}\n\n💬 ${data.content}\n\n🆔 <code>${data.id}</code>`;
  await broadcastToAdmins(text, { reply_markup: Keyboards.reviewActions(data.id) });
}

export async function notifyNewUserLead(data: {
  id: string; fullName: string; phone: string; email?: string; city?: string; source?: string;
}) {
  const text = `👥 <b>تسجيل مستفيد/عميل جديد (Lead)!</b>\n\n👤 <b>الاسم:</b> ${data.fullName}\n📱 <b>الجوال:</b> <code>${data.phone}</code>\n${data.city ? `📍 <b>المدينة:</b> ${data.city}\n` : ""}${data.source ? `🌐 <b>المصدر:</b> ${data.source}\n` : ""}🆔 <code>${data.id}</code>`;
  await broadcastToAdmins(text, { reply_markup: Keyboards.backToMenu() });
}

export async function notifyAuditSecurityAlert(data: {
  action: string; actorType: string; entityType: string; ipAddress?: string;
}) {
  const text = `🛡️ <b>تنبيه أمان وعمليات نظام!</b>\n\n⚡ <b>الإجراء:</b> ${data.action}\n👤 <b>الفاعل:</b> ${data.actorType}\n📦 <b>الكيان:</b> ${data.entityType}\n${data.ipAddress ? `🌐 <b>العنوان:</b> <code>${data.ipAddress}</code>\n` : ""}`;
  await broadcastToAdmins(text, { reply_markup: Keyboards.backToMenu() });
}

export async function sendDailyReport() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: todayRequests },
    { count: todayAppointments },
    { count: todayMessages },
    { count: todayViews },
  ] = await Promise.all([
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
  ]);

  const date = today.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  await broadcastToAdmins(
    `📅 <b>التقرير اليومي الشامل — ${date}</b>\n\n📋 طلبات تسعير: <b>${todayRequests ?? 0}</b>\n📅 حجوزات ومواعيد: <b>${todayAppointments ?? 0}</b>\n💬 رسائل واستفسارات: <b>${todayMessages ?? 0}</b>\n👁️ زيارات وأحداث: <b>${todayViews ?? 0}</b>`,
    { reply_markup: Keyboards.backToMenu() }
  );
}
