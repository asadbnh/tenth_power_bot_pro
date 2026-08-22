import {
  sendMessage, editMessage, answerCallbackQuery, Keyboards,
  type TelegramMessage, type TelegramCallbackQuery,
} from "../bot";
import { getAdminState, setAdminState, clearAdminState } from "../state";
import { isAuthorizedAdmin, handleStart, handleHelp, handleStats } from "./main";
import {
  handleVisitorStart, handleVisitorMenu, handleVisitorServices, handleVisitorProjects,
  handleVisitorGallery, handleVisitorContacts, handleVisitorDownloads, handleVisitorQuotePrompt, handleVisitorQuoteText,
} from "./visitor";
import {
  handleQuotesList, handleQuoteDetails, handleQuoteStatusChange, handleQuoteDelete,
  handleAppointmentsList, handleAppointmentDetails, handleAppointmentStatusChange, handleAppointmentDelete,
  handleMessagesList, handleMessageDetails, handleMessageToggleRead, handleMessageReplyPrompt, handleMessageDelete,
  handleUsersList, handleUserDelete,
  handleChatSessionsList, handleChatTranscript, handleChatSessionDelete,
} from "./crm";
import {
  handleServicesList, handleServiceDetails, handleServiceToggleActive, handleServiceToggleFeatured, handleServiceDelete, handleServiceAddPrompt,
  handleProjectsList, handleProjectDelete, handleProjectAddPrompt,
  handleCategoriesList, handleCategoryDelete, handleCategoryAddPrompt,
  handleArticlesList, handleArticleDetails, handleArticleTogglePublish, handleArticleDelete, handleArticleAiPrompt, handleArticleAiGenerate,
  handleFaqsList, handleFaqDelete, handleFaqAddPrompt,
  handleAdsList, handleAdToggle, handleAdDelete, handleAdAddPrompt,
  handleBeforeAfterList, handleBeforeAfterDelete,
} from "./content";
import {
  handleMediaLibraryList, handleMediaDelete, handleMediaUploadPrompt,
  handleGalleryAlbumsList, handleGalleryAlbumItems, handleGalleryAlbumDelete, handleGalleryItemDelete,
  handlePhotoUpload,
} from "./media";
import {
  handlePendingReviews, handleApprovedReviews, handleReviewApprove, handleReviewReject,
  handleDirectCustomerReviews, handleDirectReviewDelete,
} from "./reviews";
import {
  handleCitiesList, handleCityToggleActive, handleCityDelete, handleCityServicesList,
  handleKeywordsReport, handleAnalyticsReport,
  handleSeoList, handleRebuildSearchIndex,
} from "./marketing";
import {
  handleCompanyProfile, handleToggleMaintenance, handleSocialContacts,
  handleBusinessHours, handleAiPromptSettings, handleCompanySettingsStore,
  handleCompanyAddressesList, handleCompanyAddressDelete, handleCompanyAddressAddPrompt,
} from "./settings";
import {
  handleAdminsList, handleAdminAddPrompt, handleAdminAdd, handleAdminDelete,
  handleAuditLog, handleBackupsList, handlePushSubscriptions,
  handleNotificationLogs, handleBroadcastPushPrompt, handlePushConfirm,
} from "./system";
import { sendAndroidPushNotification } from "../push";
import {
  publishProjectToChannel, publishServiceToChannel, publishAdToChannel, publishNotificationToChannel
} from "../channel";
import { createDbClient } from "@/lib/db";

// ─── Command Router ───────────────────────────────────────────────────

export async function handleCommand(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  // If visitor / non-admin, open the Visitor Portal
  if (!isAdmin) {
    await handleVisitorStart(msg);
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
    case "/chats":
      await handleChatSessionsList(userId);
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
    case "/ads":
      await handleAdsList(userId);
      break;
    case "/reviews":
      await handlePendingReviews(userId);
      break;
    case "/settings":
      await handleCompanyProfile(userId);
      break;
    case "/push":
      await handleBroadcastPushPrompt(userId);
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
  const isAdmin = await isAuthorizedAdmin(userId);
  const text = msg.text?.trim() || "";
  const state = getAdminState(userId);

  // Handle Visitor Text / Quote Flow
  if (!isAdmin) {
    if (state && (state.step === "awaiting_visitor_quote_service" || state.step === "awaiting_visitor_quote_phone")) {
      await handleVisitorQuoteText(msg);
    } else {
      await handleVisitorStart(msg);
    }
    return;
  }

  if (!state || state.step === "idle") {
    await handleStart(msg);
    return;
  }

  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  // 1. Service Wizard
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

    const { data: newSrv } = await db.from("services").insert({
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
    }).select("id").single();

    // Auto publish to Telegram Channel
    await publishServiceToChannel({
      name_ar,
      short_description_ar: desc_ar,
      price_from: price,
      slug,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة الخدمة ونشرها في القناة بنجاح!</b>\n\n🛠️ <b>الخدمة:</b> ${name_ar}\n💰 <b>السعر:</b> ${price} ريال\n\n🔔 <b>هل ترغب في إرسال إشعار فوري لعملاء تطبيق الأندرويد بهذه الخدمة؟</b>`,
      { reply_markup: Keyboards.askPushPrompt("service", newSrv?.id || slug) }
    );
    return;
  }

  // 2. Project Wizard
  if (state.step === "awaiting_project_title") {
    setAdminState(userId, "awaiting_project_client", { title_ar: text });
    await sendMessage(userId, `👤 أرسل <b>اسم العميل أو الجهة</b> (مثال: شركة برج الرياض التجارية):`);
    return;
  }

  if (state.step === "awaiting_project_client") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    setAdminState(userId, "awaiting_project_city", { title_ar, client_name: text });
    await sendMessage(userId, `📍 أرسل <b>مدينة تنفيذ المشروع</b> (مثال: الرياض):`);
    return;
  }

  if (state.step === "awaiting_project_city") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    const client_name = (state.payload?.client_name as string) || "";
    setAdminState(userId, "awaiting_project_value", { title_ar, client_name, city: text });
    await sendMessage(userId, `💰 أرسل <b>قيمة المشروع الإجمالية بالريال</b> (مثال: <code>75000</code>):`);
    return;
  }

  if (state.step === "awaiting_project_value") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    const client_name = (state.payload?.client_name as string) || "";
    const city = (state.payload?.city as string) || "الرياض";
    const val = parseFloat(text) || 50000;
    const slug = "project-" + Date.now().toString().slice(-6);

    const { data: newPrj } = await db.from("projects").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      client_name,
      city,
      project_value: val,
      status: "completed",
      cover_image_url: "/images/defaults/projects/office-partition.webp",
      is_featured: true,
    }).select("id").single();

    // Auto publish to Telegram Channel
    await publishProjectToChannel({
      title_ar,
      client_name,
      city,
      project_value: val,
      slug,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة المشروع ونشره في القناة بنجاح!</b>\n\n🏢 <b>المشروع:</b> ${title_ar}\n📍 <b>المدينة:</b> ${city}\n💰 <b>القيمة:</b> ${val.toLocaleString("ar-SA")} ر.س\n\n🔔 <b>هل ترغب في إرسال إشعار فوري لعملاء تطبيق الأندرويد بهذا المشروع؟</b>`,
      { reply_markup: Keyboards.askPushPrompt("project", newPrj?.id || slug) }
    );
    return;
  }

  // 3. Advertisement Wizard
  if (state.step === "awaiting_ad_title") {
    setAdminState(userId, "awaiting_ad_link", { title_ar: text });
    await sendMessage(userId, `🔗 أرسل <b>رابط التوجيه أو الواتساب للإعلان</b> (مثال: <code>https://wa.me/966551234567</code> أو <code>/quote</code>):`);
    return;
  }

  if (state.step === "awaiting_ad_link") {
    const title_ar = (state.payload?.title_ar as string) || "إعلان جديد";
    await db.from("advertisements").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      media_type: "image",
      target_route: text,
      is_active: true,
      priority: 1,
    });

    // Auto publish to Telegram Channel
    await publishAdToChannel({
      title_ar,
      target_route: text,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تم إنشاء الإعلان ونشره في القناة بنجاح!</b>\n\n📢 <b>العنوان:</b> ${title_ar}\n🔗 <b>الرابط:</b> <code>${text}</code>`,
      { reply_markup: Keyboards.backToSubmenu("cnt_ads") }
    );
    return;
  }

  // 4. Branch Address Wizard
  if (state.step === "awaiting_address_city") {
    setAdminState(userId, "awaiting_address_street", { city_ar: text });
    await sendMessage(userId, `🛣️ أرسل <b>اسم الشارع والحي</b> (مثال: طريق الملك فهد - حي العليا):`);
    return;
  }

  if (state.step === "awaiting_address_street") {
    const city_ar = (state.payload?.city_ar as string) || "الرياض";
    await db.from("company_addresses").insert({
      company_id: companyId,
      label_ar: city_ar,
      city_ar,
      street_ar: text,
      country: "SA",
      is_primary: false,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة الفرع والعنوان بنجاح!</b>\n\n🏢 <b>الفرع:</b> ${city_ar}\n📍 <b>العنوان:</b> ${text}`,
      { reply_markup: Keyboards.backToSubmenu("set_addresses") }
    );
    return;
  }

  // 5. Category Wizard
  if (state.step === "awaiting_category_name") {
    const slug = "cat-" + Date.now().toString().slice(-4);
    await db.from("categories").insert({
      company_id: companyId,
      name_ar: text,
      name_en: text,
      slug,
      is_active: true,
    });

    clearAdminState(userId);
    await sendMessage(
      userId,
      `🎉 <b>تمت إضافة التصنيف بنجاح!</b>\n\n📂 <b>الاسم:</b> ${text}`,
      { reply_markup: Keyboards.backToSubmenu("cnt_categories") }
    );
    return;
  }

  // 6. Broadcast Push Notification Wizard
  if (state.step === "awaiting_push_title") {
    setAdminState(userId, "awaiting_push_body", { title: text });
    await sendMessage(
      userId,
      `📝 <b>عنوان الإشعار:</b> ${text}\n\nالآن أرسل <b>نص ورسالة الإشعار</b> (مثال: احصل على مقايسة وتصميم ثلاثي الأبعاد مجاناً هذا الأسبوع):`
    );
    return;
  }

  if (state.step === "awaiting_push_body") {
    const title = (state.payload?.title as string) || "تنبيه جديد";
    setAdminState(userId, "awaiting_push_screen", { title, body: text });
    await sendMessage(
      userId,
      `🎯 <b>اختر الشاشة التي سيتم توجيه المستخدم إليها عند فتح الإشعار:</b>`,
      { reply_markup: Keyboards.pushScreenSelector() }
    );
    return;
  }

  // 7. FAQ Wizard
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

  // 8. AI Article Topic Wizard
  if (state.step === "awaiting_article_ai_topic") {
    clearAdminState(userId);
    await handleArticleAiGenerate(userId, text);
    return;
  }

  // 9. Message Reply Wizard
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

  // 10. Add Admin Wizard
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
  const data = query.data;
  const messageId = query.message.message_id;

  await answerCallbackQuery(query.id);

  // ─── Visitor Portal Callbacks (Accessible by all users) ─────────────
  if (data === "vis_menu") return handleVisitorMenu(userId, messageId);
  if (data === "vis_services") return handleVisitorServices(userId, messageId);
  if (data === "vis_projects") return handleVisitorProjects(userId, messageId);
  if (data === "vis_gallery") return handleVisitorGallery(userId, messageId);
  if (data === "vis_contacts") return handleVisitorContacts(userId, messageId);
  if (data === "vis_downloads") return handleVisitorDownloads(userId, messageId);
  if (data === "vis_quote_prompt") return handleVisitorQuotePrompt(userId);

  // ─── Admin-Only Actions Guard ───────────────────────────────────────
  if (!isAdmin) {
    await handleVisitorMenu(userId, messageId);
    return;
  }

  // 1. Navigation Menus
  if (data === "main_menu") {
    clearAdminState(userId);
    const text = `🏢 <b>القائمة الرئيسية للوحة الإدارة</b>\n\nاختر أحد الأقسام التالية:`;
    await editMessage(userId, messageId, text, Keyboards.mainMenu());
    return;
  }
  if (data === "menu_stats") return handleStats(userId, messageId);
  if (data === "menu_crm") return editMessage(userId, messageId, "💼 <b>إدارة المبيعات والعملاء والمحادثات</b>", Keyboards.crmMenu());
  if (data === "menu_content") return editMessage(userId, messageId, "🛠️ <b>إدارة المحتوى والكتالوج والإعلانات</b>", Keyboards.contentMenu());
  if (data === "menu_media") return editMessage(userId, messageId, "🖼️ <b>إدارة الوسائط والصور</b>", Keyboards.mediaMenu());
  if (data === "menu_reviews") return editMessage(userId, messageId, "⭐ <b>إدارة التقييمات والآراء</b>", Keyboards.reviewsMenu());
  if (data === "menu_marketing") return editMessage(userId, messageId, "📍 <b>التسويق والـ SEO والتحليلات</b>", Keyboards.marketingMenu());
  if (data === "menu_settings") return editMessage(userId, messageId, "⚙️ <b>إعدادات المنشأة والفروع</b>", Keyboards.settingsMenu());
  if (data === "menu_system") return editMessage(userId, messageId, "🛡️ <b>الأمان والإشعارات والنسخ</b>", Keyboards.systemMenu());

  // 2. CRM & Chats Callbacks
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

  if (data === "crm_chats") return handleChatSessionsList(userId, messageId);
  if (data.startsWith("chat_transcript:")) return handleChatTranscript(userId, data.split(":")[1], messageId);
  if (data.startsWith("chat_delete:")) return handleChatSessionDelete(userId, data.split(":")[1], messageId);

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
  if (data === "prj_add_prompt") return handleProjectAddPrompt(userId);

  if (data === "cnt_categories") return handleCategoriesList(userId, messageId);
  if (data.startsWith("cat_delete:")) return handleCategoryDelete(userId, data.split(":")[1], messageId);
  if (data === "cat_add_prompt") return handleCategoryAddPrompt(userId);

  if (data === "cnt_articles") return handleArticlesList(userId, messageId);
  if (data.startsWith("art_view:")) return handleArticleDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("art_toggle_pub:")) return handleArticleTogglePublish(userId, data.split(":")[1], messageId);
  if (data.startsWith("art_delete:")) return handleArticleDelete(userId, data.split(":")[1], messageId);
  if (data === "cnt_ai_article") return handleArticleAiPrompt(userId);

  if (data === "cnt_faqs") return handleFaqsList(userId, messageId);
  if (data.startsWith("faq_delete:")) return handleFaqDelete(userId, data.split(":")[1], messageId);
  if (data === "faq_add_prompt") return handleFaqAddPrompt(userId);

  if (data === "cnt_ads") return handleAdsList(userId, messageId);
  if (data.startsWith("ad_toggle:")) return handleAdToggle(userId, data.split(":")[1], messageId);
  if (data.startsWith("ad_delete:")) return handleAdDelete(userId, data.split(":")[1], messageId);
  if (data === "ad_add_prompt") return handleAdAddPrompt(userId);

  if (data === "cnt_before_after") return handleBeforeAfterList(userId, messageId);
  if (data.startsWith("ba_delete:")) return handleBeforeAfterDelete(userId, data.split(":")[1], messageId);

  // 4. Media Callbacks
  if (data === "med_library") return handleMediaLibraryList(userId, messageId);
  if (data.startsWith("med_delete:")) return handleMediaDelete(userId, data.split(":")[1], messageId);
  if (data === "med_upload_prompt") return handleMediaUploadPrompt(userId, messageId);
  if (data === "med_gallery") return handleGalleryAlbumsList(userId, messageId);
  if (data.startsWith("alb_items:")) return handleGalleryAlbumItems(userId, data.split(":")[1], messageId);
  if (data.startsWith("it_delete:")) return handleGalleryItemDelete(userId, data.split(":")[1], messageId);
  if (data.startsWith("alb_delete:")) return handleGalleryAlbumDelete(userId, data.split(":")[1], messageId);

  // 5. Reviews Callbacks
  if (data === "rev_pending") return handlePendingReviews(userId, messageId);
  if (data === "rev_approved") return handleApprovedReviews(userId, messageId);
  if (data.startsWith("rev_approve:")) return handleReviewApprove(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_reject:")) return handleReviewReject(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_delete:")) return handleReviewReject(userId, data.split(":")[1], messageId);
  if (data === "rev_direct_reviews") return handleDirectCustomerReviews(userId, messageId);
  if (data.startsWith("crev_delete:")) return handleDirectReviewDelete(userId, data.split(":")[1], messageId);

  // 6. Marketing Callbacks
  if (data === "mkt_cities") return handleCitiesList(userId, messageId);
  if (data.startsWith("city_toggle:")) return handleCityToggleActive(userId, data.split(":")[1], messageId);
  if (data.startsWith("city_delete:")) return handleCityDelete(userId, data.split(":")[1], messageId);
  if (data === "mkt_city_services") return handleCityServicesList(userId, messageId);
  if (data === "mkt_seo") return handleSeoList(userId, messageId);
  if (data === "mkt_rebuild_search") return handleRebuildSearchIndex(userId, messageId);
  if (data === "mkt_keywords") return handleKeywordsReport(userId, messageId);
  if (data === "mkt_analytics") return handleAnalyticsReport(userId, messageId);

  // 7. Settings Callbacks
  if (data === "set_profile") return handleCompanyProfile(userId, messageId);
  if (data === "set_toggle_maint") return handleToggleMaintenance(userId, messageId);
  if (data === "set_addresses") return handleCompanyAddressesList(userId, messageId);
  if (data.startsWith("addr_delete:")) return handleCompanyAddressDelete(userId, data.split(":")[1], messageId);
  if (data === "addr_add_prompt") return handleCompanyAddressAddPrompt(userId);
  if (data === "set_social") return handleSocialContacts(userId, messageId);
  if (data === "set_hours") return handleBusinessHours(userId, messageId);
  if (data === "set_ai_prompt") return handleAiPromptSettings(userId, messageId);
  if (data === "set_store") return handleCompanySettingsStore(userId, messageId);

  // 8. System & Push Notifications Callbacks
  if (data === "push_broadcast_prompt") return handleBroadcastPushPrompt(userId);
  if (data.startsWith("push_screen:")) {
    const screenRoute = data.split(":")[1];
    const state = getAdminState(userId);
    clearAdminState(userId);
    const title = (state?.payload?.title as string) || "تنبيه من القوة العاشرة";
    const body = (state?.payload?.body as string) || "تفضل بزيارة تطبيقنا للاطلاع على آخر العروض!";
    await sendAndroidPushNotification({ title, body, screen: screenRoute });
    await publishNotificationToChannel(title, body, screenRoute);
    await sendMessage(
      userId,
      `🚀 <b>تم إرسال الإشعار بنجاح للتطبيق ونشره في القناة!</b>\n\n🔔 <b>العنوان:</b> ${title}\n📝 <b>النص:</b> ${body}\n🎯 <b>المسار:</b> <code>${screenRoute}</code>`,
      { reply_markup: Keyboards.backToMenu() }
    );
    return;
  }
  if (data.startsWith("push_confirm:")) {
    const [, entityType, entityId] = data.split(":");
    return handlePushConfirm(userId, entityType, entityId);
  }
  if (data.startsWith("push_skip:")) {
    await sendMessage(userId, `👍 تم حفظ العنصر بنجاح بدون إرسال إشعار للعملاء.`, { reply_markup: Keyboards.backToMenu() });
    return;
  }
  if (data === "sys_notification_logs") return handleNotificationLogs(userId, messageId);
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
  if (!isAdmin) {
    await sendMessage(userId, `شكراً لك! لمعاينة أعمالنا وطلب المقايسة يرجى استخدام القائمة أدناه:`, { reply_markup: Keyboards.visitorMenu() });
    return;
  }
  await handlePhotoUpload(msg);
}
