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
  handleProjectsList, handleProjectDetails, handleProjectToggleFeatured, handleProjectToggleActive, handleProjectItems, handleProjectImageDelete, handleProjectImageSetCover, handleProjectDelete, handleProjectAddPrompt,
  handleCategoriesList, handleCategoryDelete, handleCategoryAddPrompt,
  handleArticlesList, handleArticleDetails, handleArticleTogglePublish, handleArticleDelete, handleArticleAiPrompt,
  handleFaqsList, handleFaqDelete, handleFaqAddPrompt,
  handleAdsList, handleAdDetails, handleAdToggle, handleAdDelete, handleAdAddPrompt, handleAdEditPrompt,
  handleBeforeAfterList, handleBeforeAfterDelete,
} from "./content";
import {
  handleMediaLibraryList, handleMediaDelete, handleMediaUploadPrompt,
  handleGalleryAlbumsList, handleGalleryAlbumDetails, handleGalleryAlbumToggle, handleGalleryAlbumItems,
  handleGalleryAlbumAddPrompt, handleGalleryAlbumAddPhotoPrompt, handleGalleryAlbumEditPrompt,
  handleGalleryAlbumDelete, handleGalleryItemDelete,
  handlePhotoUpload,
} from "./media";
import {
  handlePendingReviews, handleApprovedReviews, handleReviewApprove, handleReviewReject,
  handleDirectCustomerReviews, handleDirectReviewToggleApprove, handleDirectReviewDelete,
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
  handleAdminsList, handleAdminAddPrompt, handleAdminDelete,
  handleAuditLog, handleBackupsList, handlePushSubscriptions,
  handleNotificationLogs, handleBroadcastPushPrompt, handlePushConfirm,
} from "./system";
import {
  publishNotificationToChannel
} from "../channel";
import { sendAndroidPushNotification } from "../push";
import { createDbClient } from "@/lib/db";
import {
  processServiceWizard,
  processProjectWizard,
  processAdvertisementTextWizard,
  processAdvertisementPhotoWizard,
  processGalleryAlbumTextWizard,
  processGalleryAlbumPhotoWizard,
  processProjectPhotoWizard,
  processFieldEditWizard,
  processMiscWizards,
} from "../wizards";

// ─── Command Router ───────────────────────────────────────────────────

export async function handleCommand(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);

  // If visitor / non-admin, open the Visitor Portal
  if (!isAdmin) {
    await handleVisitorStart(msg);
    return;
  }

  const rawText = msg.text?.trim() || "";
  const cmd = rawText.split(" ")[0].toLowerCase();

  // If the admin is in an active wizard/prompt state:
  const state = getAdminState(userId);
  if (state && state.step !== "idle") {
    // Only explicit reset/cancel commands break the wizard
    if (cmd === "/cancel" || cmd === "/stop" || cmd === "/start") {
      clearAdminState(userId);
      if (cmd === "/cancel" || cmd === "/stop") {
        await sendMessage(userId, "🚫 <b>تم إلغاء العملية والعودة للقائمة الرئيسية.</b>", {
          reply_markup: Keyboards.mainMenu(),
        });
        return;
      }
      // if /start, continue down to handleStart
    } else {
      // The admin sent a route/path like /contact, /quote, /services/glass-facades or text starting with /
      // Route it directly as normal text input to the active wizard step!
      await handleTextMessage(msg);
      return;
    }
  }

  switch (cmd) {
    case "/start":
      await handleStart(msg);
      break;
    case "/cancel":
    case "/stop":
      clearAdminState(userId);
      await sendMessage(userId, "🚫 <b>تم إلغاء العملية والعودة للقائمة الرئيسية.</b>", {
        reply_markup: Keyboards.mainMenu(),
      });
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
    case "/backup":
      await sendMessage(
        userId,
        "📦 <b>مركز النسخ الاحتياطي والأرشيف السحابي</b>\n\nيمكنك إنشاء نسخة احتياطية فورية وشاملة لكافة الجداول الـ 40 والوسائط والصور بصيغة Zip وإرسالها لخزنة التلجرام، أو استعراض السجلات السابقة:",
        { reply_markup: Keyboards.backupMenu() }
      );
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

  // 1. Domain Wizards
  if (await processServiceWizard(userId, text, state, companyId)) return;
  if (await processProjectWizard(userId, text, state, companyId)) return;
  if (await processAdvertisementTextWizard(userId, text, state)) return;
  if (await processGalleryAlbumTextWizard(userId, text, state, companyId)) return;
  if (await processFieldEditWizard(userId, text, state)) return;
  if (await processMiscWizards(userId, text, state, companyId)) return;

  // Fallback
  await handleStart(msg);
}

// ─── Photo Message Forwarder ──────────────────────────────────────────

export async function handlePhotoMessage(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);
  if (!isAdmin) {
    await sendMessage(userId, `شكراً لك! لمعاينة أعمالنا وطلب المقايسة يرجى استخدام القائمة أدناه:`, { reply_markup: Keyboards.visitorMenu() });
    return;
  }

  const state = getAdminState(userId);
  if (!state || state.step === "idle") {
    // Default: General Media Library upload
    await handlePhotoUpload(msg);
    return;
  }

  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  // 1. Photo Wizards
  if (await processAdvertisementPhotoWizard(userId, msg, state)) return;
  if (await processGalleryAlbumPhotoWizard(userId, msg, state, companyId)) return;
  if (await processProjectPhotoWizard(userId, msg, state)) return;

  // Default: General Media Library upload
  await handlePhotoUpload(msg);
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
  if (data.startsWith("prj_view:")) return handleProjectDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_toggle_feat:")) return handleProjectToggleFeatured(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_toggle_act:")) return handleProjectToggleActive(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_items:")) return handleProjectItems(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_img_del:")) {
    const parts = data.split(":");
    return handleProjectImageDelete(userId, parts[1], parts[2], messageId);
  }
  if (data.startsWith("prj_img_cover:")) {
    const parts = data.split(":");
    return handleProjectImageSetCover(userId, parts[1], parts[2], messageId);
  }
  if (data.startsWith("prj_add_photo:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_photo", { projectId: prjId });
    return sendMessage(userId, `📸 <b>إضافة صورة للمشروع:</b>\n\nأرسل الآن الصورة مباشرة في الدردشة لرفعها إلى السحابة وإضافتها لمعرض هذا المشروع (أو أرسل رابط صورة خارجي):`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
  if (data.startsWith("prj_edit_cover:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_cover", { projectId: prjId });
    return sendMessage(userId, `🖼️ <b>تغيير صورة الغلاف للمشروع:</b>\n\nأرسل الآن صورة الغلاف الجديدة لرفعها وتعيينها كغلاف رئيسي للمشروع:`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
  if (data.startsWith("prj_edit_title:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_edit_title", { projectId: prjId });
    return sendMessage(userId, `✏️ <b>تعديل اسم المشروع:</b>\n\nأرسل الاسم الجديد بالعربي:`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
  if (data.startsWith("prj_edit_city:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_edit_city", { projectId: prjId });
    return sendMessage(userId, `📍 <b>تعديل مدينة المشروع:</b>\n\nأرسل اسم المدينة (مثل: الرياض، جدة، الدمام):`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
  if (data.startsWith("prj_edit_client:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_edit_client", { projectId: prjId });
    return sendMessage(userId, `👤 <b>تعديل اسم العميل:</b>\n\nأرسل اسم العميل أو الجهة المالكة:`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
  if (data.startsWith("prj_edit_val:")) {
    const prjId = data.split(":")[1];
    setAdminState(userId, "awaiting_project_edit_val", { projectId: prjId });
    return sendMessage(userId, `💰 <b>تعديل قيمة المشروع:</b>\n\nأرسل القيمة الإجمالية بالريال (أرقام فقط):`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${prjId}`)
    });
  }
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
  if (data.startsWith("ad_view:")) return handleAdDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("ad_toggle:")) return handleAdToggle(userId, data.split(":")[1], messageId);
  if (data.startsWith("ad_delete:")) return handleAdDelete(userId, data.split(":")[1], messageId);
  if (data === "ad_add_prompt") return handleAdAddPrompt(userId);
  if (data.startsWith("ad_edit_title:")) return handleAdEditPrompt(userId, data.split(":")[1], "title");
  if (data.startsWith("ad_edit_sub:")) return handleAdEditPrompt(userId, data.split(":")[1], "sub");
  if (data.startsWith("ad_edit_route:")) return handleAdEditPrompt(userId, data.split(":")[1], "route");
  if (data.startsWith("ad_edit_btn:")) return handleAdEditPrompt(userId, data.split(":")[1], "btn");
  if (data.startsWith("ad_edit_prio:")) return handleAdEditPrompt(userId, data.split(":")[1], "prio");
  if (data.startsWith("ad_edit_media:")) return handleAdEditPrompt(userId, data.split(":")[1], "media");

  if (data === "cnt_before_after") return handleBeforeAfterList(userId, messageId);
  if (data.startsWith("ba_delete:")) return handleBeforeAfterDelete(userId, data.split(":")[1], messageId);

  // 4. Media & Gallery Callbacks
  if (data === "med_library") return handleMediaLibraryList(userId, messageId);
  if (data.startsWith("med_delete:")) return handleMediaDelete(userId, data.split(":")[1], messageId);
  if (data === "med_upload_prompt") return handleMediaUploadPrompt(userId, messageId);
  if (data === "med_gallery") return handleGalleryAlbumsList(userId, messageId);
  if (data.startsWith("alb_view:")) return handleGalleryAlbumDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("alb_toggle:")) return handleGalleryAlbumToggle(userId, data.split(":")[1], messageId);
  if (data === "alb_add_prompt") return handleGalleryAlbumAddPrompt(userId);
  if (data.startsWith("alb_add_photo:")) return handleGalleryAlbumAddPhotoPrompt(userId, data.split(":")[1]);
  if (data.startsWith("alb_items:")) return handleGalleryAlbumItems(userId, data.split(":")[1], messageId);
  if (data.startsWith("alb_edit_title:")) return handleGalleryAlbumEditPrompt(userId, data.split(":")[1], "title");
  if (data.startsWith("alb_edit_desc:")) return handleGalleryAlbumEditPrompt(userId, data.split(":")[1], "desc");
  if (data.startsWith("alb_edit_cover:")) return handleGalleryAlbumEditPrompt(userId, data.split(":")[1], "cover");
  if (data.startsWith("it_delete:")) {
    const parts = data.split(":");
    return handleGalleryItemDelete(userId, parts[1], parts[2], messageId);
  }
  if (data.startsWith("alb_delete:")) return handleGalleryAlbumDelete(userId, data.split(":")[1], messageId);

  // 5. Reviews Callbacks
  if (data === "rev_pending") return handlePendingReviews(userId, messageId);
  if (data === "rev_approved") return handleApprovedReviews(userId, messageId);
  if (data.startsWith("rev_approve:")) return handleReviewApprove(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_reject:")) return handleReviewReject(userId, data.split(":")[1], messageId);
  if (data.startsWith("rev_delete:")) return handleReviewReject(userId, data.split(":")[1], messageId);
  if (data === "rev_direct_reviews") return handleDirectCustomerReviews(userId, messageId);
  if (data.startsWith("crev_toggle:")) return handleDirectReviewToggleApprove(userId, data.split(":")[1], messageId);
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

  // Backup Center Callbacks
  if (data === "menu_backup") {
    const text = `💾 <b>مركز النسخ الاحتياطي والأرشيف السحابي</b>\n\nاختر أحد الإجراءات أدناه:`;
    if (messageId) return editMessage(userId, messageId, text, Keyboards.backupMenu());
    return sendMessage(userId, text, { reply_markup: Keyboards.backupMenu() });
  }

  if (data === "backup_create_now") {
    const progressMsg = await sendMessage(userId, `⏳ <b>جاري بدء عملية النسخ الاحتياطي الشاملة...</b>`);
    const pMsgId = progressMsg?.result?.message_id;

    try {
      const { createFullBackupArchive } = await import("@/lib/backup");
      const result = await createFullBackupArchive({
        targetTelegramChatId: userId,
        onProgress: async (stepText) => {
          if (pMsgId) {
            await editMessage(userId, pMsgId, `🔄 <b>عملية النسخ جارية...</b>\n\n${stepText}`);
          }
        },
      });

      const sizeMB = (result.fileSizeBytes / (1024 * 1024)).toFixed(2);
      const successText = `🎉 <b>اكتملت عملية النسخ الاحتياطي بنجاح!</b>\n\n📁 <b>اسم الملف:</b> <code>${result.fileName}</code>\n📊 <b>الجداول:</b> ${result.tablesCount} جدولاً\n🖼️ <b>الوسائط:</b> ${result.mediaCount} ملف\n💾 <b>الحجم:</b> ${sizeMB} MB\n\n🛡️ تم إرسال الأرشيف بالكامل إليك كملف Zip، وتم توثيقه في قاعدة البيانات.`;
      
      if (pMsgId) await editMessage(userId, pMsgId, successText, Keyboards.backToMenu());
      else await sendMessage(userId, successText, { reply_markup: Keyboards.backToMenu() });
    } catch (err: any) {
      console.error("Backup creation error:", err);
      const errText = `❌ <b>حدث خطأ أثناء النسخ الاحتياطي:</b>\n<code>${err?.message || "Unknown error"}</code>`;
      if (pMsgId) await editMessage(userId, pMsgId, errText, Keyboards.backToMenu());
      else await sendMessage(userId, errText, { reply_markup: Keyboards.backToMenu() });
    }
    return;
  }

  if (data === "backup_info") {
    const infoText = `📖 <b>طريقة استعادة البيانات محلياً (Local Restore):</b>

1. قم بتحميل ملف الـ <code>.zip</code> من التلجرام إلى مجلد المشروع <code>./backups/</code>.
2. شغّل أمر الاستعادة الفوري في الترمينال:
   <code>npm run backup:restore</code>
3. سيقوم النظام تلقائياً بما يلي:
   • فك ضغط واستخراج جميع الصور والفيديوهات إلى <code>public/images/</code>.
   • حقن واسترجاع كافة الـ 40 جدولاً بقاعدة البيانات.

✨ <i>يضمن لك هذا الخيار الحماية الكاملة من أي توقف لأي سيرفر خارجي.</i>`;

    if (messageId) return editMessage(userId, messageId, infoText, Keyboards.backToSubmenu("menu_backup"));
    return sendMessage(userId, infoText, { reply_markup: Keyboards.backToSubmenu("menu_backup") });
  }
}
