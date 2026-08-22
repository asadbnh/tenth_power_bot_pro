import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards } from "../bot";
import { setAdminState } from "../state";

// ─── Telegram Admins Handlers ─────────────────────────────────────────

export async function handleAdminsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: admins } = await db
    .from("telegram_admins")
    .select("id, telegram_user_id, telegram_username, role, is_active, created_at")
    .order("created_at", { ascending: true });

  let text = `👑 <b>المسؤولين المعتمدين في البوت (${admins?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (admins as Record<string, any>[] || []).forEach((a, idx) => {
    text += `${idx + 1}. 👤 <b>${a.telegram_username || "مسؤول"}</b> [${a.role}]\n`;
    text += `   🆔 المعرف: <code>${a.telegram_user_id}</code>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ إزالة المسؤول: ${a.telegram_user_id}`, callback_data: `adm_delete:${a.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة مسؤول جديد", callback_data: "sys_add_admin" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع للأمان", callback_data: "menu_system" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleAdminAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_admin_add");
  await sendMessage(
    chatId,
    `➕ <b>إضافة مسؤول تلجرام جديد</b>\n\nأرسل الآن <b>رقم الـ Telegram User ID</b> للشخص المراد ترخيصه (مثال: <code>123456789</code>):`,
    { reply_markup: Keyboards.cancelWizard("sys_admins") }
  );
}

export async function handleAdminAdd(chatId: number, targetUserIdStr: string) {
  const targetId = parseInt(targetUserIdStr.trim(), 10);
  if (isNaN(targetId)) {
    await sendMessage(chatId, "❌ الرقم غير صالح. يرجى إرسال رقم صحيح.");
    return;
  }

  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  await db.from("telegram_admins").insert({
    company_id: companyId,
    telegram_user_id: targetId,
    role: "admin",
    is_active: true,
  });

  await sendMessage(
    chatId,
    `✅ <b>تم ترخيص وإضافة المسؤول الجديد بنجاح!</b>\n🆔 المعرّف: <code>${targetId}</code>`,
    { reply_markup: Keyboards.backToSubmenu("sys_admins") }
  );
}

export async function handleAdminDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("telegram_admins").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم إزالة المسؤول.`);
  await handleAdminsList(chatId, messageId);
}

// ─── Audit Log Handlers ───────────────────────────────────────────────

export async function handleAuditLog(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: logs } = await db
    .from("audit_log")
    .select("action, actor_type, entity_type, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  let text = `🛡️ <b>سجل العمليات والأمان (Audit Log):</b>\n\n`;
  (logs as Record<string, any>[] || []).forEach((l, idx) => {
    text += `${idx + 1}. ⚡ <b>${l.action}</b> (${l.actor_type})\n`;
    text += `   📦 ${l.entity_type} | 🌐 ${l.ip_address || "لوكال"}\n`;
    text += `   📅 ${new Date(l.created_at).toLocaleTimeString("ar-SA")}\n\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للأمان", callback_data: "menu_system" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Backups Handlers ─────────────────────────────────────────────────

export async function handleBackupsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: backups } = await db
    .from("backups")
    .select("backup_url, type, size_bytes, status, triggered_by, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  let text = `💾 <b>سجل النسخ الاحتياطية (Backups):</b>\n\n`;
  (backups as Record<string, any>[] || []).forEach((b, idx) => {
    text += `${idx + 1}. 📦 <b>نسخة ${b.type}</b> [${b.status}]\n`;
    text += `   💾 الحجم: ${Math.round((b.size_bytes || 0) / 1024 / 1024)} MB | 🤖 ${b.triggered_by}\n\n`;
  });

  const inline_keyboard = [
    [{ text: "◀️ رجوع للأمان", callback_data: "menu_system" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

// ─── Push Subscriptions Handlers ──────────────────────────────────────

export async function handlePushSubscriptions(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { count } = await db.from("push_subscriptions").select("*", { count: "exact", head: true });

  const text = `🔔 <b>اشتراكات الإشعارات الفورية (Web Push)</b>\n\nإجمالي الأجهزة والمشتركين النشطين: <b>${count ?? 0}</b> جهاز.`;
  const inline_keyboard = [
    [{ text: "◀️ رجوع للأمان", callback_data: "menu_system" }]
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}
