import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards } from "../bot";

// ─── Testimonials Handlers ────────────────────────────────────────────

export async function handlePendingReviews(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: reviews } = await db
    .from("testimonials")
    .select("id, client_name, client_title, content_ar, rating, created_at")
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (!reviews || reviews.length === 0) {
    const emptyText = "⭐ <b>التقييمات والآراء المعلقة</b>\n\n🎉 رائع! لا توجد أي آراء بانتظار الموافقة حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_reviews"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_reviews") });
    return;
  }

  let text = `⏳ <b>آراء عملاء بانتظار الموافقة (${reviews.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (reviews as Record<string, any>[]).forEach((r, idx) => {
    const stars = "⭐".repeat(r.rating || 5);
    text += `${idx + 1}. 👤 <b>${r.client_name}</b> ${stars}\n`;
    text += `   💬 <code>${(r.content_ar || "").slice(0, 80)}...</code>\n\n`;

    inline_keyboard.push([
      { text: `✅ موافقة: ${r.client_name.slice(0, 10)}`, callback_data: `rev_approve:${r.id}` },
      { text: `❌ رفض وحذف`, callback_data: `rev_reject:${r.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للتقييمات", callback_data: "menu_reviews" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleApprovedReviews(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: reviews } = await db
    .from("testimonials")
    .select("id, client_name, content_ar, rating")
    .eq("is_approved", true)
    .limit(8);

  let text = `⭐ <b>الآراء المعتمدة المنشورة بالموقع (${reviews?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (reviews as Record<string, any>[] || []).forEach((r, idx) => {
    const stars = "⭐".repeat(r.rating || 5);
    text += `${idx + 1}. 👤 <b>${r.client_name}</b> ${stars}\n`;
    text += `   💬 <i>${(r.content_ar || "").slice(0, 60)}...</i>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف الرأي رقم ${idx + 1}`, callback_data: `rev_delete:${r.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للتقييمات", callback_data: "menu_reviews" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleReviewApprove(chatId: number, reviewId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("testimonials").update({ is_approved: true }).eq("id", reviewId);
  await sendMessage(chatId, `✅ تم اعتماد ونشر الرأي بنجاح على الموقع!`);
  await handlePendingReviews(chatId, messageId);
}

export async function handleReviewReject(chatId: number, reviewId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("testimonials").delete().eq("id", reviewId);
  await sendMessage(chatId, `❌ تم رفض وحذف الرأي.`);
  await handlePendingReviews(chatId, messageId);
}

// ─── Direct Customer Reviews Handlers (customer_reviews table) ────────

export async function handleDirectCustomerReviews(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: reviews } = await db
    .from("customer_reviews")
    .select("id, reviewer_name, rating, content_ar, is_verified, is_approved, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!reviews || reviews.length === 0) {
    const emptyText = "🌟 <b>تقييمات العملاء المباشرة (Customer Reviews)</b>\n\nلا توجد تقييمات مسجلة حالياً.";
    if (messageId) await editMessage(chatId, messageId, emptyText, Keyboards.backToSubmenu("menu_reviews"));
    else await sendMessage(chatId, emptyText, { reply_markup: Keyboards.backToSubmenu("menu_reviews") });
    return;
  }

  let text = `🌟 <b>أحدث تقييمات العملاء المباشرة (${reviews.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (reviews as Record<string, any>[]).forEach((r, idx) => {
    const stars = "⭐".repeat(r.rating || 5);
    const verified = r.is_verified ? "🛡️ موثق" : "";
    const approved = r.is_approved ? "🟢 معتمد" : "⏳ معلق";
    text += `${idx + 1}. [${approved}] 👤 <b>${r.reviewer_name || "عميل"}</b> ${stars} ${verified}\n`;
    text += `   💬 <code>${(r.content_ar || "").slice(0, 70)}...</code>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف التقييم: ${r.reviewer_name?.slice(0, 12) || idx + 1}`, callback_data: `crev_delete:${r.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للتقييمات", callback_data: "menu_reviews" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleDirectReviewDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("customer_reviews").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف تقييم العميل بنجاح.`);
  await handleDirectCustomerReviews(chatId, messageId);
}
