import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards } from "../bot";
import { setAdminState } from "../state";

// ─── Quote Requests Handlers ──────────────────────────────────────────

export async function handleQuotesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: requests } = await db
    .from("quote_requests")
    .select("id, description, budget_range, city, urgency, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!requests || requests.length === 0) {
    const emptyText = "📋 <b>طلبات عروض الأسعار</b>\n\nلا توجد أي طلبات أسعار مسجلة حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_crm"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `📋 <b>أحدث طلبات عروض الأسعار (${requests.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (requests as Record<string, any>[]).forEach((r, idx) => {
    const statusIcon = r.status === "new" ? "🆕 جديد" : r.status === "contacted" ? "📞 تم الاتصال" : r.status === "quoted" ? "💰 مسعر" : r.status === "won" ? "🏆 تعاقد" : "❌ ملغي";
    text += `${idx + 1}. <b>${statusIcon}</b> — 📍 ${r.city || "الرياض"}\n`;
    text += `   💰 الميزانية: <code>${r.budget_range || "غير محدد"}</code>\n`;
    text += `   📝 <code>${(r.description || "").slice(0, 70)}...</code>\n\n`;

    inline_keyboard.push([
      { text: `🔍 تفاصيل الطلب رقم ${idx + 1}`, callback_data: `q_view:${r.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المبيعات", callback_data: "menu_crm" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleQuoteDetails(chatId: number, quoteId: string, messageId?: number) {
  const db = createDbClient();
  const { data: quote } = await db
    .from("quote_requests")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (!quote) {
    await sendMessage(chatId, "❌ لم يتم العثور على الطلب.");
    return;
  }

  let userName = "غير محدد";
  let userPhone = "غير محدد";
  if (quote.user_id) {
    const { data: user } = await db.from("users").select("full_name, phone, whatsapp").eq("id", quote.user_id).single();
    if (user) {
      userName = user.full_name || "عميل بدون اسم";
      userPhone = user.phone || user.whatsapp || "—";
    }
  }

  const text = `📋 <b>تفاصيل طلب عرض السعر</b>

🆔 <b>الرقم:</b> <code>${quote.id}</code>
👤 <b>العميل:</b> ${userName}
📱 <b>الجوال:</b> <code>${userPhone}</code>
📍 <b>المدينة:</b> ${quote.city || "—"}
💰 <b>الميزانية المتوقعة:</b> ${quote.budget_range || "—"}
⚡ <b>الأولوية:</b> ${quote.urgency || "عادي"}
📊 <b>الحالة الحالية:</b> <b>${quote.status}</b>
📅 <b>التاريخ:</b> ${new Date(quote.created_at).toLocaleString("ar-SA")}

📝 <b>الوصف والخدمات:</b>
${quote.description || "لا يوجد وصف إضافي"}`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.quoteActions(quote.id));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.quoteActions(quote.id) });
}

export async function handleQuoteStatusChange(chatId: number, quoteId: string, newStatus: string, messageId?: number) {
  const db = createDbClient();
  await db.from("quote_requests").update({ status: newStatus }).eq("id", quoteId);
  await sendMessage(chatId, `✅ تم تحديث حالة طلب التسعير إلى: <b>${newStatus}</b>`);
  await handleQuoteDetails(chatId, quoteId, messageId);
}

export async function handleQuoteDelete(chatId: number, quoteId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("quote_requests").delete().eq("id", quoteId);
  await sendMessage(chatId, `🗑️ تم حذف طلب التسعير بنجاح.`);
  await handleQuotesList(chatId, messageId);
}

// ─── Appointments Handlers ────────────────────────────────────────────

export async function handleAppointmentsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: appointments } = await db
    .from("appointments")
    .select("id, status, preferred_date, preferred_time, notes, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!appointments || appointments.length === 0) {
    const emptyText = "📅 <b>المواعيد والحجوزات</b>\n\nلا توجد حجوزات أو مواعيد مسجلة حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_crm"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `📅 <b>قائمة المواعيد (${appointments.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (appointments as Record<string, any>[]).forEach((a, idx) => {
    const statusIcon = a.status === "confirmed" ? "✅ مؤكد" : a.status === "completed" ? "🏁 مكتمل" : a.status === "cancelled" ? "❌ ملغي" : "⏳ قيد الانتظار";
    text += `${idx + 1}. <b>${statusIcon}</b> — ⏰ ${a.preferred_time || "—"}\n`;
    text += `   📝 <code>${(a.notes || "معاينة موقع").slice(0, 60)}</code>\n\n`;

    inline_keyboard.push([
      { text: `⚙️ إدارة الموعد رقم ${idx + 1}`, callback_data: `apt_view:${a.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المبيعات", callback_data: "menu_crm" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleAppointmentDetails(chatId: number, appointmentId: string, messageId?: number) {
  const db = createDbClient();
  const { data: apt } = await db.from("appointments").select("*").eq("id", appointmentId).single();
  if (!apt) {
    await sendMessage(chatId, "❌ لم يتم العثور على الموعد.");
    return;
  }

  let clientInfo = "—";
  if (apt.user_id) {
    const { data: user } = await db.from("users").select("full_name, phone").eq("id", apt.user_id).single();
    if (user) clientInfo = `${user.full_name || "عميل"} (📱 ${user.phone})`;
  }

  const text = `📅 <b>تفاصيل موعد المعاينة</b>

🆔 <b>المعرّف:</b> <code>${apt.id}</code>
👤 <b>العميل:</b> ${clientInfo}
📅 <b>التاريخ:</b> ${apt.preferred_date ? new Date(apt.preferred_date).toLocaleDateString("ar-SA") : "—"}
⏰ <b>الوقت:</b> ${apt.preferred_time || "—"}
📊 <b>الحالة:</b> <b>${apt.status}</b>
📝 <b>ملاحظات:</b> ${apt.notes || "لا يوجد"}`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.appointmentActions(apt.id));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.appointmentActions(apt.id) });
}

export async function handleAppointmentStatusChange(chatId: number, id: string, status: string, messageId?: number) {
  const db = createDbClient();
  await db.from("appointments").update({ status }).eq("id", id);
  await sendMessage(chatId, `✅ تم تحديث حالة الموعد إلى: <b>${status}</b>`);
  await handleAppointmentDetails(chatId, id, messageId);
}

export async function handleAppointmentDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("appointments").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الموعد بنجاح.`);
  await handleAppointmentsList(chatId, messageId);
}

// ─── Messages & Inquiries Handlers ────────────────────────────────────

export async function handleMessagesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: messages } = await db
    .from("messages")
    .select("id, subject, content, is_read, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!messages || messages.length === 0) {
    const emptyText = "💬 <b>الرسائل والاستفسارات</b>\n\nلا توجد رسائل تواصل واردة حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_crm"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `💬 <b>رسائل واستفسارات الموقع (${messages.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (messages as Record<string, any>[]).forEach((m, idx) => {
    const readStatus = m.is_read ? "✅ مقروءة" : "🔴 جديدة";
    text += `${idx + 1}. [${readStatus}] <b>${m.subject || "استفسار عام"}</b>\n`;
    text += `   💬 <code>${(m.content || "").slice(0, 70)}...</code>\n\n`;

    inline_keyboard.push([
      { text: `✉️ فتح الرسالة رقم ${idx + 1}`, callback_data: `msg_view:${m.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المبيعات", callback_data: "menu_crm" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleMessageDetails(chatId: number, messageIdRecord: string, messageId?: number) {
  const db = createDbClient();
  const { data: msg } = await db.from("messages").select("*").eq("id", messageIdRecord).single();
  if (!msg) {
    await sendMessage(chatId, "❌ لم يتم العثور على الرسالة.");
    return;
  }

  let sender = "عميل";
  if (msg.user_id) {
    const { data: user } = await db.from("users").select("full_name, phone, email").eq("id", msg.user_id).single();
    if (user) sender = `${user.full_name || "عميل"} (📱 ${user.phone || user.email || "—"})`;
  }

  const text = `💬 <b>تفاصيل الرسالة</b>

🆔 <b>المعرّف:</b> <code>${msg.id}</code>
👤 <b>المرسل:</b> ${sender}
📌 <b>الموضوع:</b> ${msg.subject || "بدون موضوع"}
📅 <b>التاريخ:</b> ${new Date(msg.created_at).toLocaleString("ar-SA")}
📊 <b>الحالة:</b> ${msg.is_read ? "✅ مقروءة" : "🔴 غير مقروءة"}

📝 <b>نص الرسالة:</b>
${msg.content}`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.messageActions(msg.id, msg.is_read));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.messageActions(msg.id, msg.is_read) });
}

export async function handleMessageToggleRead(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: msg } = await db.from("messages").select("is_read").eq("id", id).single();
  if (msg) {
    await db.from("messages").update({ is_read: !msg.is_read }).eq("id", id);
    await handleMessageDetails(chatId, id, messageId);
  }
}

export async function handleMessageReplyPrompt(chatId: number, id: string) {
  setAdminState(chatId, "awaiting_reply_content", { message_id: id });
  await sendMessage(
    chatId,
    `✍️ <b>كتابة رد على الرسالة</b>\n\nأرسل الآن نص الرد الذي ترغب في إرساله إلى العميل:`,
    { reply_markup: Keyboards.cancelWizard(`msg_view:${id}`) }
  );
}

export async function handleMessageDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("messages").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الرسالة.`);
  await handleMessagesList(chatId, messageId);
}

// ─── Users (Leads) Handlers ───────────────────────────────────────────

export async function handleUsersList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: users, count } = await db
    .from("users")
    .select("id, full_name, phone, whatsapp, email, city, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(10);

  if (!users || users.length === 0) {
    const emptyText = "👥 <b>دليل العملاء والمستفيدين</b>\n\nلا يوجد عملاء مسجلين حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_crm"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_crm") });
    return;
  }

  let text = `👥 <b>دليل العملاء المسجلين (الإجمالي: ${count ?? users.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (users as Record<string, any>[]).forEach((u, idx) => {
    text += `${idx + 1}. 👤 <b>${u.full_name || "عميل مسجل"}</b>\n`;
    text += `   📱 جوال: <code>${u.phone || u.whatsapp || "—"}</code> | 📍 ${u.city || "الرياض"}\n`;
    text += `   🌐 المصدر: <i>${u.source || "مباشر"}</i>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف العميل: ${u.full_name?.slice(0, 15) || idx + 1}`, callback_data: `usr_delete:${u.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المبيعات", callback_data: "menu_crm" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleUserDelete(chatId: number, userId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("users").delete().eq("id", userId);
  await sendMessage(chatId, `🗑️ تم حذف العميل.`);
  await handleUsersList(chatId, messageId);
}
