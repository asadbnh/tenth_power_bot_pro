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
  handleProjectsList, handleProjectDetails, handleProjectToggleFeatured, handleProjectToggleActive, handleProjectItems, handleProjectImageDelete, handleProjectDelete, handleProjectAddPrompt,
  handleCategoriesList, handleCategoryDelete, handleCategoryAddPrompt,
  handleArticlesList, handleArticleDetails, handleArticleTogglePublish, handleArticleDelete, handleArticleAiPrompt, handleArticleAiGenerate,
  handleFaqsList, handleFaqDelete, handleFaqAddPrompt,
  handleAdsList, handleAdDetails, handleAdToggle, handleAdDelete, handleAdAddPrompt, handleAdEditPrompt,
  handleBeforeAfterList, handleBeforeAfterDelete,
} from "./content";
import {
  handleMediaLibraryList, handleMediaDelete, handleMediaUploadPrompt,
  handleGalleryAlbumsList, handleGalleryAlbumDetails, handleGalleryAlbumToggle, handleGalleryAlbumItems,
  handleGalleryAlbumAddPrompt, handleGalleryAlbumAddPhotoPrompt, handleGalleryAlbumEditPrompt,
  handleGalleryAlbumDelete, handleGalleryItemDelete,
  handlePhotoUpload, uploadTelegramPhotoToR2,
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
  handleAdminsList, handleAdminAddPrompt, handleAdminAdd, handleAdminDelete,
  handleAuditLog, handleBackupsList, handlePushSubscriptions,
  handleNotificationLogs, handleBroadcastPushPrompt, handlePushConfirm,
} from "./system";
import { sendAndroidPushNotification } from "../push";
import {
  publishProjectToChannel, publishServiceToChannel, publishAdToChannel, publishNotificationToChannel
} from "../channel";
import { createDbClient, getSql } from "@/lib/db";

export function parseArabicNumber(input: string): number {
  if (!input) return 0;
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let clean = input.trim();
  for (let i = 0; i < 10; i++) {
    clean = clean.split(arabicDigits[i]).join(i.toString());
  }
  clean = clean.replace(/[,\u066B\u066C\sر.سSAR]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

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
    const price = parseArabicNumber(text) || 300;
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
      cover_image_url: "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/services/luxury-facade.webp",
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
    const client_name = (state.payload?.client_name as string) || "عميل خاص";
    const city = (state.payload?.city as string) || "الرياض";
    const val = parseArabicNumber(text) || 50000;
    const slug = "project-" + Date.now().toString().slice(-6);

    const { data: newPrj, error: prjErr } = await db.from("projects").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      client_name,
      city,
      project_value: val,
      status: "completed",
      cover_image_url: "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/projects/project-1.webp",
      is_featured: true,
      is_active: true,
    }).select("id").single();

    if (prjErr) {
      console.error("[Project Insert Error]:", prjErr);
    }

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

  // 3. Advertisement Creation Wizard
  if (state.step === "awaiting_ad_title") {
    setAdminState(userId, "awaiting_ad_subtitle", { title_ar: text });
    await sendMessage(userId, `📝 <b>(الخطوة 2 من 5) — الوصف الفرعي للإعلان:</b>\n\nأرسل الوصف التوضيحي أو تفاصيل العرض (أو اكتب <code>تخطي</code> للتجاوز):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return;
  }

  if (state.step === "awaiting_ad_subtitle") {
    const subtitle_ar = (text === "تخطي" || text === "-") ? "" : text;
    setAdminState(userId, "awaiting_ad_route", { ...state.payload, subtitle_ar });
    await sendMessage(userId, `🔗 <b>(الخطوة 3 من 5) — رابط أو مسار التوجيه:</b>\n\nأرسل مسار التوجيه في الموقع (مثل <code>/services/glass-facades</code> أو <code>/quote</code> أو <code>/contact</code> أو رابط واتساب):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return;
  }

  if (state.step === "awaiting_ad_route") {
    const target_route = text.trim();
    setAdminState(userId, "awaiting_ad_action_title", { ...state.payload, target_route });
    await sendMessage(userId, `🔘 <b>(الخطوة 4 من 5) — نص زر الإجراء (Action Button):</b>\n\nأرسل النص الظاهر على زر الإعلان (مثال: <code>تواصل معنا الآن</code> أو <code>احجز معاينة</code> أو اكتب <code>تخطي</code> للعنوان الافتراضي):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return;
  }

  if (state.step === "awaiting_ad_action_title") {
    const action_title_ar = (text === "تخطي" || text === "-") ? "تواصل معنا الآن" : text.trim();
    setAdminState(userId, "awaiting_ad_priority", { ...state.payload, action_title_ar });
    await sendMessage(userId, `🔢 <b>(الخطوة 5 من 5) — أولوية وترتيب العرض:</b>\n\nأرسل رقم الأولوية (مثال: <code>1</code> أو <code>5</code> أو <code>10</code> ليكون في المقدمة، أو اكتب <code>تخطي</code> للقيمة 1):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return;
  }

  if (state.step === "awaiting_ad_priority") {
    const priority = text === "تخطي" ? 1 : (Math.round(parseArabicNumber(text)) || 1);
    setAdminState(userId, "awaiting_ad_media", { ...state.payload, priority });
    await sendMessage(userId, `🖼️ <b>صورة وبانر الإعلان:</b>\n\n📷 <b>أرسل الآن صورة الإعلان مباشرة في الدردشة</b> لرفعها سحابياً وتطبيقها،\nأو أرسل <b>رابط صورة خارجي</b> (أو اكتب <code>تخطي</code> لاستخدام البانر الافتراضي):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return;
  }

  if (state.step === "awaiting_ad_media") {
    const title_ar = (state.payload?.title_ar as string) || "إعلان جديد";
    const subtitle_ar = (state.payload?.subtitle_ar as string) || "";
    const target_route = (state.payload?.target_route as string) || "/contact";
    const action_title_ar = (state.payload?.action_title_ar as string) || "تواصل معنا الآن";
    const priority = (state.payload?.priority as number) || 1;
    const media_url = (text === "تخطي" || text === "-")
      ? "/images/defaults/projects/project-1.webp"
      : text.trim();

    const { data: newAd } = await db.from("advertisements").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      subtitle_ar,
      media_type: "image",
      media_url,
      target_route,
      action_title_ar,
      is_active: true,
      priority,
    }).select("id").single();

    // Auto publish to Telegram Channel
    await publishAdToChannel({
      title_ar,
      subtitle_ar,
      media_url,
      target_route,
      action_title_ar,
    });

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم إنشاء الإعلان ونشره بنجاح!</b>`);
    if (newAd?.id) {
      await handleAdDetails(userId, newAd.id);
    } else {
      await handleAdsList(userId);
    }
    return;
  }

  // 3b. Advertisement Field Edit Handlers
  if (state.step?.startsWith("awaiting_ad_edit_")) {
    const adId = state.payload?.adId as string;
    const editField = state.step.replace("awaiting_ad_edit_", "");
    
    if (editField === "title") {
      await db.from("advertisements").update({ title_ar: text, updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "sub") {
      await db.from("advertisements").update({ subtitle_ar: text === "حذف" ? "" : text, updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "route") {
      await db.from("advertisements").update({ target_route: text.trim(), updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "btn") {
      await db.from("advertisements").update({ action_title_ar: text.trim(), updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "prio") {
      await db.from("advertisements").update({ priority: parseInt(text, 10) || 0, updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "media") {
      await db.from("advertisements").update({ media_url: text.trim(), updated_at: new Date().toISOString() }).eq("id", adId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات الإعلان بنجاح.</b>`);
    await handleAdDetails(userId, adId);
    return;
  }

  // 3c. Project Field Edit Handlers
  if (state.step?.startsWith("awaiting_project_edit_")) {
    const projectId = state.payload?.projectId as string;
    const editField = state.step.replace("awaiting_project_edit_", "");

    if (editField === "title") {
      await db.from("projects").update({ title_ar: text, title_en: text, updated_at: new Date().toISOString() }).eq("id", projectId);
    } else if (editField === "city") {
      await db.from("projects").update({ city: text.trim(), updated_at: new Date().toISOString() }).eq("id", projectId);
    } else if (editField === "client") {
      await db.from("projects").update({ client_name: text.trim(), updated_at: new Date().toISOString() }).eq("id", projectId);
    } else if (editField === "val") {
      await db.from("projects").update({ project_value: parseFloat(text) || 0, updated_at: new Date().toISOString() }).eq("id", projectId);
    } else if (editField === "desc") {
      await db.from("projects").update({ description_ar: text, updated_at: new Date().toISOString() }).eq("id", projectId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات المشروع بنجاح.</b>`);
    await handleProjectDetails(userId, projectId);
    return;
  }

  if (state.step === "awaiting_project_photo") {
    const projectId = state.payload?.projectId as string;
    const media_url = text.trim();

    const { data: media } = await db.from("media_library").insert({
      company_id: companyId,
      file_name: `project-photo-${Date.now()}.jpg`,
      original_name: "رابط خارجي للمشروع",
      file_url: media_url,
      cdn_url: media_url,
      mime_type: "image/jpeg",
      file_size: 0,
      storage_provider: "url",
      storage_path: "projects/external",
    }).select("id").single();

    if (media?.id) {
      const sql = getSql();
      await sql`
        INSERT INTO project_images (project_id, media_id, sort_order, is_cover)
        VALUES (${projectId}, ${media.id}, 0, false);
      `;
    }

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تمت إضافة الصورة لمعرض المشروع بنجاح!</b>`);
    await handleProjectItems(userId, projectId);
    return;
  }

  // 3d. Gallery Album Creation Wizard & Photo Linking Handlers
  if (state.step === "awaiting_album_title") {
    const slug = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") || `album-${Date.now()}`;
    setAdminState(userId, "awaiting_album_desc", { title_ar: text, slug });
    await sendMessage(
      userId,
      `📝 <b>(الخطوة 2 من 3) — وصف الألبوم:</b>\n\nأرسل وصفاً توضيحياً لمحتوى الألبوم (أو اكتب <code>تخطي</code> للتجاوز):`,
      { reply_markup: Keyboards.cancelWizard("med_gallery") }
    );
    return;
  }

  if (state.step === "awaiting_album_desc") {
    const description_ar = (text === "تخطي" || text === "-") ? "" : text;
    setAdminState(userId, "awaiting_album_cover", { ...state.payload, description_ar });
    await sendMessage(
      userId,
      `🖼️ <b>(الخطوة 3 من 3) — صورة غلاف الألبوم:</b>\n\n📷 <b>أرسل الآن صورة الغلاف مباشرة في الدردشة</b> لرفعها سحابياً،\nأو أرسل <b>رابط صورة خارجي</b> (أو اكتب <code>تخطي</code> لاستخدام الغلاف الافتراضي):`,
      { reply_markup: Keyboards.cancelWizard("med_gallery") }
    );
    return;
  }

  if (state.step === "awaiting_album_cover") {
    const title_ar = (state.payload?.title_ar as string) || "ألبوم جديد";
    const slug = (state.payload?.slug as string) || `album-${Date.now()}`;
    const description_ar = (state.payload?.description_ar as string) || "";
    const cover_image_url = (text === "تخطي" || text === "-")
      ? "/images/defaults/projects/project-1.webp"
      : text.trim();

    const { data: newAlbum } = await db.from("gallery_albums").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      description_ar,
      cover_image_url,
      is_active: true,
      sort_order: 0,
    }).select("id").single();

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم إنشاء الألبوم بنجاح!</b>`);
    if (newAlbum?.id) {
      await handleGalleryAlbumDetails(userId, newAlbum.id);
    } else {
      await handleGalleryAlbumsList(userId);
    }
    return;
  }

  if (state.step === "awaiting_album_photo") {
    const albumId = state.payload?.albumId as string;
    const media_url = text.trim();

    const { data: media } = await db.from("media_library").insert({
      company_id: companyId,
      file_name: `album-photo-${Date.now()}.jpg`,
      original_name: "رابط خارجي للألبوم",
      file_url: media_url,
      cdn_url: media_url,
      webp_url: media_url,
      mime_type: "image/jpeg",
      storage_provider: "external",
    }).select("id").single();

    if (media?.id && albumId) {
      await db.from("gallery_items").insert({
        album_id: albumId,
        media_id: media.id,
        type: "image",
        sort_order: 0,
      });
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تمت إضافة الصورة للألبوم بنجاح!</b>`);
    await handleGalleryAlbumItems(userId, albumId);
    return;
  }

  // 3d. Gallery Album Field Edit Handlers
  if (state.step?.startsWith("awaiting_album_edit_")) {
    const albumId = state.payload?.albumId as string;
    const editField = state.step.replace("awaiting_album_edit_", "");

    if (editField === "title") {
      await db.from("gallery_albums").update({ title_ar: text }).eq("id", albumId);
    } else if (editField === "desc") {
      await db.from("gallery_albums").update({ description_ar: text === "حذف" ? "" : text }).eq("id", albumId);
    } else if (editField === "cover") {
      await db.from("gallery_albums").update({ cover_image_url: text.trim() }).eq("id", albumId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات الألبوم بنجاح.</b>`);
    await handleGalleryAlbumDetails(userId, albumId);
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
  if (data.startsWith("prj_view:")) return handleProjectDetails(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_toggle_feat:")) return handleProjectToggleFeatured(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_toggle_act:")) return handleProjectToggleActive(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_items:")) return handleProjectItems(userId, data.split(":")[1], messageId);
  if (data.startsWith("prj_img_del:")) {
    const parts = data.split(":");
    return handleProjectImageDelete(userId, parts[1], parts[2], messageId);
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

// ─── Photo Message Forwarder ──────────────────────────────────────────

export async function handlePhotoMessage(msg: TelegramMessage) {
  const userId = msg.from.id;
  const isAdmin = await isAuthorizedAdmin(userId);
  if (!isAdmin) {
    await sendMessage(userId, `شكراً لك! لمعاينة أعمالنا وطلب المقايسة يرجى استخدام القائمة أدناه:`, { reply_markup: Keyboards.visitorMenu() });
    return;
  }

  const state = getAdminState(userId);

  // 1. Photo for Ad Creation Wizard
  if (state?.step === "awaiting_ad_media") {
    await sendMessage(userId, `⏳ <b>جاري رفع صورة الإعلان إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "advertisements");
    const media_url = res?.url || "/images/defaults/projects/project-1.webp";

    const db = createDbClient();
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    const title_ar = (state.payload?.title_ar as string) || "إعلان جديد";
    const subtitle_ar = (state.payload?.subtitle_ar as string) || "";
    const target_route = (state.payload?.target_route as string) || "/contact";
    const action_title_ar = (state.payload?.action_title_ar as string) || "تواصل معنا الآن";
    const priority = (state.payload?.priority as number) || 1;

    const { data: newAd } = await db.from("advertisements").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      subtitle_ar,
      media_type: "image",
      media_url,
      target_route,
      action_title_ar,
      is_active: true,
      priority,
    }).select("id").single();

    // Auto publish to Telegram Channel
    await publishAdToChannel({
      title_ar,
      subtitle_ar,
      media_url,
      target_route,
      action_title_ar,
    });

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم رفع الصورة وإنشاء الإعلان بنجاح!</b>`);
    if (newAd?.id) {
      await handleAdDetails(userId, newAd.id);
    } else {
      await handleAdsList(userId);
    }
    return;
  }

  // 2. Photo for Ad Media Edit
  if (state?.step === "awaiting_ad_edit_media") {
    const adId = state.payload?.adId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة الإعلان ورفعها إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "advertisements");
    if (res?.url) {
      const db = createDbClient();
      await db.from("advertisements").update({ media_url: res.url, updated_at: new Date().toISOString() }).eq("id", adId);
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث صورة الإعلان بنجاح.</b>`);
      await handleAdDetails(userId, adId);
      return;
    }
  }

  // 3. Photo for Gallery Album Photos
  if (state?.step === "awaiting_album_photo") {
    const albumId = state.payload?.albumId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وربطها بالألبوم...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    if (res?.mediaId && albumId) {
      const db = createDbClient();
      await db.from("gallery_items").insert({
        album_id: albumId,
        media_id: res.mediaId,
        type: "image",
        sort_order: 0,
      });
      clearAdminState(userId);
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للألبوم بنجاح!</b>`);
      await handleGalleryAlbumItems(userId, albumId);
      return;
    }
  }

  // 4. Photo for Album Cover Creation
  if (state?.step === "awaiting_album_cover") {
    await sendMessage(userId, `⏳ <b>جاري رفع صورة غلاف الألبوم إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    const cover_image_url = res?.url || "/images/defaults/projects/project-1.webp";

    const db = createDbClient();
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    const title_ar = (state.payload?.title_ar as string) || "ألبوم جديد";
    const slug = (state.payload?.slug as string) || `album-${Date.now()}`;
    const description_ar = (state.payload?.description_ar as string) || "";

    const { data: newAlbum } = await db.from("gallery_albums").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      description_ar,
      cover_image_url,
      is_active: true,
      sort_order: 0,
    }).select("id").single();

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم إنشاء الألبوم مع صورة الغلاف بنجاح!</b>`);
    if (newAlbum?.id) {
      await handleGalleryAlbumDetails(userId, newAlbum.id);
    } else {
      await handleGalleryAlbumsList(userId);
    }
    return;
  }

  // 5. Photo for Album Cover Edit
  if (state?.step === "awaiting_album_edit_cover") {
    const albumId = state.payload?.albumId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة غلاف الألبوم...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    if (res?.url) {
      const db = createDbClient();
      await db.from("gallery_albums").update({ cover_image_url: res.url }).eq("id", albumId);
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث غلاف الألبوم بنجاح.</b>`);
      await handleGalleryAlbumDetails(userId, albumId);
      return;
    }
  }

  // 6. Photo for Project Image Gallery
  if (state?.step === "awaiting_project_photo") {
    const projectId = state.payload?.projectId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وإضافتها لمعرض المشروع...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.mediaId) {
      const sql = getSql();
      await sql`
        INSERT INTO project_images (project_id, media_id, sort_order, is_cover)
        VALUES (${projectId}, ${res.mediaId}, 0, false);
      `;
      clearAdminState(userId);
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للمشروع بنجاح!</b>`);
      await handleProjectItems(userId, projectId);
      return;
    }
  }

  // 7. Photo for Project Cover Edit
  if (state?.step === "awaiting_project_cover") {
    const projectId = state.payload?.projectId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة غلاف المشروع...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.url) {
      const db = createDbClient();
      await db.from("projects").update({ cover_image_url: res.url, updated_at: new Date().toISOString() }).eq("id", projectId);
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث صورة غلاف المشروع بنجاح.</b>`);
      await handleProjectDetails(userId, projectId);
      return;
    }
  }

  // Default: General Media Library upload
  await handlePhotoUpload(msg);
}
