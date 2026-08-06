import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage, Keyboards, formatQuoteAlert, formatMessageAlert } from "./bot";

async function getAdminChatIds(): Promise<number[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("telegram_admins")
    .select("telegram_user_id")
    .eq("is_active", true);
  return (data as { telegram_user_id: number }[])?.map((a) => a.telegram_user_id) ?? [];
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

export async function notifyNewReview(data: {
  id: string; reviewerName: string; rating: number; content: string; serviceName?: string;
}) {
  const stars = "⭐".repeat(data.rating);
  const text = `⭐ <b>تقييم جديد يحتاج موافقة!</b>\n\n👤 <b>المُقيِّم:</b> ${data.reviewerName}\n${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${stars}\n\n💬 ${data.content}\n\n🆔 <code>${data.id}</code>`;
  await broadcastToAdmins(text, { reply_markup: Keyboards.reviewActions(data.id) });
}

export async function sendDailyReport() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: todayRequests }, { count: todayMessages }, { count: todayViews }] = await Promise.all([
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
  ]);

  const date = today.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  await broadcastToAdmins(
    `📅 <b>التقرير اليومي — ${date}</b>\n\n📋 طلبات: <b>${todayRequests ?? 0}</b>\n💬 رسائل: <b>${todayMessages ?? 0}</b>\n👁️ زيارات: <b>${todayViews ?? 0}</b>`,
    { reply_markup: Keyboards.backToMenu() }
  );
}
