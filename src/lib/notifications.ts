/**
 * Tenth Power Website — Lightweight Lead Notifications
 * Directly notifies management via Telegram Bot API when new website leads arrive.
 * Zero dependency on bot engine or handlers.
 */

async function sendTelegramMessage(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error(`[Telegram Alert Error] Failed to send to ${chatId}:`, err);
  }
}

function getAdminIds(): string[] {
  return (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function broadcastAlert(text: string) {
  const adminIds = getAdminIds();
  if (adminIds.length === 0) return;
  await Promise.allSettled(adminIds.map((id) => sendTelegramMessage(id, text)));
}

export async function notifyNewQuoteRequest(data: {
  id: string;
  name: string;
  phone: string;
  services: string[];
  city: string;
  budget?: string;
  urgency: string;
  description: string;
}) {
  const text = `📋 <b>طلب عرض سعر جديد من الموقع!</b>

👤 <b>العميل:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
📍 <b>المدينة:</b> ${data.city}
🛠️ <b>الخدمات:</b> ${data.services.join(", ") || "عام"}
💰 <b>الميزانية:</b> ${data.budget || "غير محددة"}
⚡ <b>الاستعجال:</b> ${data.urgency || "عادي"}

📝 <b>الوصف:</b>
${data.description || "لا يوجد وصف إضافي"}`;

  await broadcastAlert(text);
}

export async function notifyNewMessage(data: {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  content: string;
}) {
  const text = `💬 <b>رسالة تواصل جديدة من الموقع!</b>

👤 <b>المرسل:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.email ? `📧 <b>البريد:</b> ${data.email}\n` : ""}${data.subject ? `📌 <b>الموضوع:</b> ${data.subject}\n` : ""}
📄 <b>نص الرسالة:</b>
${data.content}`;

  await broadcastAlert(text);
}

export async function notifyNewAppointment(data: {
  id: string;
  userName: string;
  phone: string;
  serviceName?: string;
  preferredDate?: string;
  notes?: string;
}) {
  const text = `📅 <b>طلب موعد معاينة جديد من الموقع!</b>

👤 <b>العميل:</b> ${data.userName}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.serviceName ? `🛠️ <b>الخدمة:</b> ${data.serviceName}\n` : ""}${data.preferredDate ? `🗓️ <b>الموعد المفضل:</b> ${data.preferredDate}\n` : ""}
📝 <b>ملاحظات:</b>
${data.notes || "لا توجد ملاحظات إضافية"}`;

  await broadcastAlert(text);
}

export async function notifyNewAiChatLead(data: {
  id: string;
  name: string;
  phone: string;
  city?: string;
  summary: string;
  sessionId?: string;
}) {
  const text = `🤖 <b>طلب تواصل فوري عبر المساعد الذكي بالموقع!</b>

👤 <b>الاسم:</b> ${data.name}
📱 <b>الجوال:</b> <code>${data.phone}</code>
${data.city ? `📍 <b>المدينة:</b> ${data.city}\n` : ""}
💬 <b>ملخص المحادثة:</b>
${data.summary}`;

  await broadcastAlert(text);
}
