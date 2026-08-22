import {
  sendMessage, editMessage, answerCallbackQuery, Keyboards,
  type TelegramMessage, type TelegramCallbackQuery,
} from "../bot";
import { getAdminState, setAdminState, clearAdminState } from "../state";
import { isAuthorizedAdmin, handleStart, handleHelp, handleStats } from "./main";
import {
  handleQuotesList, handleQuoteDetails, handleQuoteStatusChange, handleQuoteDelete,
  handleAppointmentsList, handleAppointmentDetails, handleAppointmentStatusChange, handleAppointmentDelete,
  handleMessagesList, handleMessageDetails, handleMessageToggleRead, handleMessageReplyPrompt, handleMessageDelete,
  handleUsersList, handleUserDelete,
} from "./crm";
import {
  handleServicesList, handleServiceDetails, handleServiceToggleActive, handleServiceToggleFeatured, handleServiceDelete, handleServiceAddPrompt,
  handleProjectsList, handleProjectDelete,
  handleCategoriesList, handleCategoryDelete,
  handleArticlesList, handleArticleDetails, handleArticleTogglePublish, handleArticleDelete, handleArticleAiPrompt, handleArticleAiGenerate,
  handleFaqsList, handleFaqDelete, handleFaqAddPrompt,
} from "./content";
import {
  handleMediaLibraryList, handleMediaDelete, handleMediaUploadPrompt,
  handleGalleryAlbumsList, handleGalleryAlbumDelete,
  handlePhotoUpload,
} from "./media";
import {
  handlePendingReviews, handleApprovedReviews, handleReviewApprove, handleReviewReject,
} from "./reviews";
import {
  handleCitiesList, handleCityToggleActive, handleCityDelete, handleCityServicesList,
  handleKeywordsReport, handleAnalyticsReport,
} from "./marketing";
import {
  handleCompanyProfile, handleToggleMaintenance, handleSocialContacts,
  handleBusinessHours, handleAiPromptSettings, handleCompanySettingsStore,
} from "./settings";
import {
  handleAdminsList, handleAdminAddPrompt, handleAdminAdd, handleAdminDelete,
  handleAuditLog, handleBackupsList, handlePushSubscriptions,
} from "./system";
import { createDbClient } from "@/lib/db";

// ─── Command Router ───────────────────────────────────────────────────

export async function handleCommand(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);
  if (!isAdmin) {
    await sendMessage(userId, `⛔ <b>غير مصرح لك بالوصول.</b>\n\n🆔 رقم حسابك: <code>${userId}</code>`);
    return;
  }

  const cmd = msg.text?.split(" ")[0].toLowerCase();

  switch (cmd) {
    case "/start":
      await handleStart(msg);
      break;
    case "/help":
    case "/menu":
      await handleHelp(userId);
      break;
    case "/stats":
      await handleStats(userId);
      break;
    case "/quotes":
      await handleQuotesList(userId);
      break;
    case "/appointments":
      await handleAppointmentsList(userId);
      break;
    case "/messages":
      await handleMessagesList(userId);
      break;
    case "/users":
      await handleUsersList(userId);
      break;
    case "/services":
      await handleServicesList(userId);
      break;
    case "/projects":
      await handleProjectsList(userId);
      break;
    case "/articles":
      await handleArticlesList(userId);
      break;
    case "/reviews":
      await handlePendingReviews(userId);
      break;
    case "/settings":
      await handleCompanyProfile(userId);
      break;
    case "/admins":
      await handleAdminsList(userId);
      break;
    case "/audit":
      await handleAuditLog(userId);
      break;
    case "/backups":
      await handleBackupsList(userId);
      break;
    default:
      await handleStart(msg);
  }
}

// ─── Text Message & Wizard Resolver ───────────────────────────────────

export async function handleTextMessage(msg: TelegramMessage) {
  const userId = msg.from.id;
  const text = msg.text?.trim() || "";
  const state = getAdminState(userId);

  if (!state || state.step === "idle") {
    // If no active wizard, display main menu
    await handleStart(msg);
    return;
  }

  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  // 1. Service Creation Wizard
  if (state.step === "awaiting_service_name") {
    setAdminState(userId, "awaiting_service_desc", { name_ar: text });
    await sendMessage(userId, `✍️ <b>اسم الخدمة:</b> ${text}\n\nالآن أرسل <b>وصفاً مختصراً للخدمة</b>:`);
    return;
  }

  if (state.step === "awaiting_service_desc") {
    const name_ar = (state.payload?.name_ar as string) || "خدمة جديدة";
    setAdminState(userId, "awaiting_service_price", { name_ar, desc_ar: text });
    await sendMessage(userId, `💰 أرسل <b>سعر المتر المبدئي بالريال</b> (مثال: <code>350</code>):`);
    return;
  }

  if (state.step === "awaiting_service_price") {
    const name_ar = (state.payload?.name_ar as string) || "خدمة جديدة";
    const desc_ar = (state.payload?.desc_ar as string) || "";
    const price = parseFloat(text) || 300;
    const slug = "service-" + Date.now().toString().slice(-6);

    await db.from("services").insert({
      company_id: companyId,
      name_ar,
      name_en: name_ar,
      slug,
      short_description_ar: desc_ar,
      short_description_en: desc_ar,
      price_from: price,
      price_to: price * 1.5,
      icon: "Layers",
      cover_image_url: "/images/defaults/services/luxury-facade.webp",
      is_active: true,
      is_featured: false,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة الخدمة بنجاح!</b>\n\n🛠️ <b>الخدمة:</b> ${name_ar}\n💰 <b>السعر:</b> ${price} ريال\n\n🟢 الخدمة مفعلة ومتاحة للزوار بالموقع.`,
      { reply_markup: Keyboards.backToSubmenu("cnt_services") }
    );
    return;
  }

  // 2. FAQ Creation Wizard
  if (state.step === "awaiting_faq_question") {
    setAdminState(userId, "awaiting_faq_answer", { question_ar: text });
    await sendMessage(userId, `💡 <b>السؤال:</b> ${text}\n\nالآن أرسل <b>الإجابة الشاملة</b> على هذا السؤال:`);
    return;
  }

  if (state.step === "awaiting_faq_answer") {
    const question_ar = (state.payload?.question_ar as string) || "سؤال جديد";
    await db.from("faqs").insert({
      company_id: companyId,
      question_ar,
      question_en: question_ar,
      answer_ar: text,
      answer_en: text,
      is_active: true,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة السؤال والجواب بنجاح!</b>\n\n❓ <b>السؤال:</b> ${question_ar}\n💡 <b>الإجابة:</b> ${text}`,
      { reply_markup: Keyboards.backToSubmenu("cnt_faqs") }
    );
    return;
  }

  // 3. AI Article Topic Wizard
  if (state.step === "awaiting_article_ai_topic") {
    clearAdminState(userId);
    await handleArticleAiGenerate(userId, text);
    return;
  }

  // 4. Message Reply Wizard
  if (state.step === "awaiting_reply_content") {
    const msgId = state.payload?.message_id as string;
    clearAdminState(userId);
    if (msgId) {
      await db.from("messages").update({ reply: text, is_read: true }).eq("id", msgId);
      await sendMessage(
        userId,
        `✅ <b>تم تسجيل وحفظ الرد بنجاح!</b>\n\n📝 الرد: <code>${text}</code>`,
        { reply_markup: Keyboards.backToSubmenu("crm_messages") }
      );
    }
    return;
  }

  // 5. Add Admin Wizard
  if (state.step === "awaiting_admin_add") {
    clearAdminState(userId);
    await handleAdminAdd(userId, text);
    return;
  }
}

// ─── Callback Query Router ────────────────────────────────────────────

export async function handleCallback(query: TelegramCallbackQuery) {
  const userId = query.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);
  if (!isAdmin) {
    await answerCallbackQuery(query.id, "⛔ غير مصرح");
    return;
  }

  await answerCallbackQuery(query.id);
  const data = query.data;
  const messageId = query.message.message_id;

  // 1. Navigation Menus
  if (data === "main_menu") {
    clearAdminState(userId);
    const text = `🏢 <b>القائمة الرئيسية للوحة الإدارة</b>\n\nاختر أحد الأقسام التالية:`;
    await editMessage(userId, messageId, text, Keyboards.mainMenu());
    return;
  }
  if (data === "menu_stats") return handleStats(userId, messageId);
  if (data === "menu_crm") return editMessage(userId, messageId, "💼 <b>إدارة المبيعات والعملاء</b>", Keyboards.crmMenu());
  if (data === "menu_content") return editMessage(userId, messageId, "🛠️ <b>إدارة المحتوى والكتالوج</b>", Keyboards.contentMenu());
  if (data === "menu_media") return editMessage(userId, messageId, "🖼️ <b>إدارة الوسائط والصور</b>", Keyboards.mediaMenu());
  if (data === "menu_reviews") return editMessage(userId, messageId, "⭐ <b>إدارة تقييمات العملاء</b>", Keyboards.reviewsMenu());
  if (data === "menu_marketing") return editMessage(userId, messageId, "📍 <b>التسويق وصفحات المدن والتحليلات</b>", Keyboards.marketingMenu());
  if (data === "menu_settings") return editMessage(userId, messageId, "⚙️ <b>إعدادات المنشأة والنظام</b>", Keyboards.settingsMenu());
  if (data === "menu_system") return editMessage(userId, messageId, "🛡️ <b>الأمان والمسؤولين والنسخ</b>", Keyboards.systemMenu());

  // 2. CRM Callbacks
  if (data === "crm_quotes") return handleQuotesList(userId, messageId);
  if (data.startsWith("q_view:")) return handleQuoteDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("q_status:")) {
    const [, id, status] = data.split(":");
    return handleQuoteStatusChange(userId, id, status, messageId);
  }
  if (data.startsWith("q_delete:")) return handleQuoteDelete(userId, data.split(":")[1], messageId);

  if (data === "crm_appointments") return handleAppointmentsList(userId, messageId);
  if (data.startsWith("apt_view:")) return handleAppointmentDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("apt_status:")) {
    const [, id, status] = data.split(":");
    return handleAppointmentStatusChange(userId, id, status, messageId);
  }
  if (data.startsWith("apt_delete:")) return handleAppointmentDelete(userId, data.split(":")[1], messageId);

  if (data === "crm_messages") return handleMessagesList(userId, messageId);
  if (data.startsWith("msg_view:")) return handleMessageDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("msg_toggle_read:")) return handleMessageToggleRead(userId, data.split(":")[1], messageId);
  if (data.startsWith("msg_reply:")) return handleMessageReplyPrompt(userId, data.split(":")[1]);
  if (data.startsWith("msg_delete:")) return handleMessageDelete(userId, data.split(":")[1], messageId);

  if (data === "crm_users") return handleUsersList(userId, messageId);
  if (data.startsWith("usr_delete:")) return handleUserDelete(userId, data.split(":")[1], messageId);

  // 3. Content Callbacks
  if (data === "cnt_services") return handleServicesList(userId, messageId);
  if (data.startsWith("srv_view:")) return handleServiceDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("srv_toggle_active:")) return handleServiceToggleActive(userId, data.split(":")[1], messageId);
  if (data.startsWith("srv_toggle_featured:")) return handleServiceToggleFeatured(userId, data.split(":")[1], messageId);
  if (data.startsWith("srv_delete:")) return handleServiceDelete(userId, data.split(":")[1], messageId);
  if (data === "srv_add_prompt") return handleServiceAddPrompt(userId);

  if (data === "cnt_projects") return handleProjectsList(userId, messageId);
  if (data.startsWith("prj_delete:")) return handleProjectDelete(userId, data.split(":")[1], messageId);

  if (data === "cnt_categories") return handleCategoriesList(userId, messageId);
  if (data.startsWith("cat_delete:")) return handleCategoryDelete(userId, data.split(":")[1], messageId);

  if (data === "cnt_articles") return handleArticlesList(userId, messageId);
  if (data.startsWith("art_view:")) return handleArticleDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("art_toggle_pub:")) return handleArticleTogglePublish(userId, data.split(":")[1], messageId);
  if (data.startsWith("art_delete:")) return handleArticleDelete(userId, data.split(":")[1], messageId);
  if (data === "cnt_ai_article") return handleArticleAiPrompt(userId);

  if (data === "cnt_faqs") return handleFaqsList(userId, messageId);
  if (data.startsWith("faq_delete:")) return handleFaqDelete(userId, data.split(":")[1], messageId);
  if (data === "faq_add_prompt") return handleFaqAddPrompt(userId);

  // 4. Media Callbacks
  if (data === "med_library") return handleMediaLibraryList(userId, messageId);
  if (data.startsWith("med_delete:")) return handleMediaDelete(userId, data.split(":")[1], messageId);
  if (data === "med_upload_prompt") return handleMediaUploadPrompt(userId, messageId);
  if (data === "med_gallery") return handleGalleryAlbumsList(userId, messageId);
  if (data.startsWith("alb_delete:")) return handleGalleryAlbumDelete(userId, data.split(":")[1], messageId);

  // 5. Reviews Callbacks
  if (data === "rev_pending") return handlePendingReviews(userId, messageId);
  if (data === "rev_approved") return handleApprovedReviews(userId, messageId);
  if (data.startsWith("rev_approve:")) return handleReviewApprove(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_reject:")) return handleReviewReject(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_delete:")) return handleReviewReject(userId, data.split(":")[1], messageId);

  // 6. Marketing Callbacks
  if (data === "mkt_cities") return handleCitiesList(userId, messageId);
  if (data.startsWith("city_toggle:")) return handleCityToggleActive(userId, data.split(":")[1], messageId);
  if (data.startsWith("city_delete:")) return handleCityDelete(userId, data.split(":")[1], messageId);
  if (data === "mkt_city_services") return handleCityServicesList(userId, messageId);
  if (data === "mkt_keywords") return handleKeywordsReport(userId, messageId);
  if (data === "mkt_analytics") return handleAnalyticsReport(userId, messageId);

  // 7. Settings Callbacks
  if (data === "set_profile") return handleCompanyProfile(userId, messageId);
  if (data === "set_toggle_maint") return handleToggleMaintenance(userId, messageId);
  if (data === "set_social") return handleSocialContacts(userId, messageId);
  if (data === "set_hours") return handleBusinessHours(userId, messageId);
  if (data === "set_ai_prompt") return handleAiPromptSettings(userId, messageId);
  if (data === "set_store") return handleCompanySettingsStore(userId, messageId);

  // 8. System Callbacks
  if (data === "sys_admins") return handleAdminsList(userId, messageId);
  if (data === "sys_add_admin") return handleAdminAddPrompt(userId);
  if (data.startsWith("adm_delete:")) return handleAdminDelete(userId, data.split(":")[1], messageId);
  if (data === "sys_audit") return handleAuditLog(userId, messageId);
  if (data === "sys_backups") return handleBackupsList(userId, messageId);
  if (data === "sys_push") return handlePushSubscriptions(userId, messageId);
}

// ─── Photo Message Forwarder ──────────────────────────────────────────

export async function handlePhotoMessage(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);
  if (!isAdmin) return;
  await handlePhotoUpload(msg);
}
