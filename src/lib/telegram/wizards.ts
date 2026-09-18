import { createDbClient } from "@/lib/db";
import { sendMessage, Keyboards, type TelegramMessage } from "./bot";
import { setAdminState, clearAdminState, type AdminState } from "./state";
import { uploadTelegramPhotoToR2 } from "./handlers/media";
import { invalidatePromptCache } from "@/lib/ai";
import {
  handleAdDetails, handleAdsList, handleProjectDetails, handleProjectItems,
  handleServiceDetails, handleServiceItems, handleCategoriesList, handleFaqsList,
  handleArticleDetails, handleBeforeAfterList, handleProjectVideosList,
} from "./handlers/content";
import { handleCitiesList } from "./handlers/marketing";
import {
  handleCompanyProfile, handleSocialContacts, handleBusinessHours,
  handleAiPromptSettings, handleCompanySettingsStore,
} from "./handlers/settings";
import { handleGalleryAlbumDetails, handleGalleryAlbumsList, handleGalleryAlbumItems } from "./handlers/media";
import {
  publishProjectToChannel,
  publishServiceToChannel,
  publishAdToChannel,
} from "./channel";

/**
 * Robust Arabic-Indic numbers parser (e.g. "٥٨٬٨٨٨", "58,888", "75000 ر.س")
 */
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

// ─── 1. Service Creation Wizard ───────────────────────────────────────

export async function processServiceWizard(userId: number, text: string, state: AdminState, companyId: string) {
  const db = createDbClient();

  if (state.step === "awaiting_service_name") {
    setAdminState(userId, "awaiting_service_desc", { name_ar: text });
    await sendMessage(userId, `✍️ <b>اسم الخدمة:</b> ${text}\n\nالآن أرسل <b>وصفاً مختصراً للخدمة</b>:`, {
      reply_markup: Keyboards.cancelWizard("cnt_services"),
    });
    return true;
  }

  if (state.step === "awaiting_service_desc") {
    const name_ar = (state.payload?.name_ar as string) || "خدمة جديدة";
    setAdminState(userId, "awaiting_service_price", { name_ar, desc_ar: text });
    await sendMessage(userId, `💰 أرسل <b>سعر المتر المبدئي بالريال</b> (مثال: <code>350</code>):`, {
      reply_markup: Keyboards.cancelWizard("cnt_services"),
    });
    return true;
  }

  if (state.step === "awaiting_service_price") {
    const name_ar = (state.payload?.name_ar as string) || "خدمة جديدة";
    const desc_ar = (state.payload?.desc_ar as string) || "";
    const price = parseArabicNumber(text) || 300;
    const slug = "service-" + Date.now().toString().slice(-6);

    const { data: newSrv, error } = await db.from("services").insert({
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

    if (error || !newSrv) {
      console.error("[Service Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ الخدمة:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
    }

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
    return true;
  }

  return false;
}

// ─── 2. Project Creation Wizard ───────────────────────────────────────

export async function processProjectWizard(userId: number, text: string, state: AdminState, companyId: string) {
  const db = createDbClient();

  if (state.step === "awaiting_project_title") {
    setAdminState(userId, "awaiting_project_client", { title_ar: text });
    await sendMessage(userId, `👤 أرسل <b>اسم العميل أو الجهة</b> (مثال: شركة برج الرياض التجارية):`, {
      reply_markup: Keyboards.cancelWizard("cnt_projects"),
    });
    return true;
  }

  if (state.step === "awaiting_project_client") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    setAdminState(userId, "awaiting_project_city", { title_ar, client_name: text });
    await sendMessage(userId, `📍 أرسل <b>مدينة تنفيذ المشروع</b> (مثال: الرياض):`, {
      reply_markup: Keyboards.cancelWizard("cnt_projects"),
    });
    return true;
  }

  if (state.step === "awaiting_project_city") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    const client_name = (state.payload?.client_name as string) || "";
    setAdminState(userId, "awaiting_project_value", { title_ar, client_name, city: text });
    await sendMessage(userId, `💰 أرسل <b>قيمة المشروع الإجمالية بالريال</b> (مثال: <code>75000</code>):`, {
      reply_markup: Keyboards.cancelWizard("cnt_projects"),
    });
    return true;
  }

  if (state.step === "awaiting_project_value") {
    const title_ar = (state.payload?.title_ar as string) || "مشروع جديد";
    const client_name = (state.payload?.client_name as string) || "عميل خاص";
    const city = (state.payload?.city as string) || "الرياض";
    const val = parseArabicNumber(text) || 50000;
    const slug = "project-" + Date.now().toString().slice(-6);

    const { data: newPrj, error } = await db.from("projects").insert({
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

    if (error || !newPrj) {
      console.error("[Project Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ المشروع:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
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
    return true;
  }

  if (state.step === "awaiting_project_photo") {
    const projectId = state.payload?.projectId as string;
    const media_url = text.trim();
    if (media_url.startsWith("http://") || media_url.startsWith("https://")) {
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

      if (media?.id && projectId) {
        const { count: existingCount } = await db
          .from("project_images")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId);

        const sortOrder = existingCount ?? 0;
        const isCover = sortOrder === 0;

        await db.from("project_images").insert({
          project_id: projectId,
          media_id: media.id,
          sort_order: sortOrder,
          is_cover: isCover,
        });

        if (isCover) {
          await db.from("projects").update({ cover_image_url: media_url }).eq("id", projectId);
        }

        clearAdminState(userId);
        await sendMessage(userId, `🎉 <b>تمت إضافة رابط الصورة للمشروع بنجاح!</b>`);
        await handleProjectItems(userId, projectId);
        return true;
      }
    }
  }

  if (state.step === "awaiting_project_cover") {
    const projectId = state.payload?.projectId as string;
    const cover_url = text.trim();
    if (cover_url.startsWith("http://") || cover_url.startsWith("https://")) {
      await db.from("projects").update({ cover_image_url: cover_url }).eq("id", projectId);
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث غلاف المشروع بنجاح!</b>`);
      await handleProjectDetails(userId, projectId);
      return true;
    }
  }

  return false;
}

// ─── 3. Advertisement Creation Wizard (Text Steps) ───────────────────

export async function processAdvertisementTextWizard(userId: number, text: string, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_ad_title") {
    setAdminState(userId, "awaiting_ad_subtitle", { title_ar: text });
    await sendMessage(userId, `📝 <b>(الخطوة 2 من 5) — الوصف الفرعي للإعلان:</b>\n\nأرسل الوصف التوضيحي أو تفاصيل العرض (أو اكتب <code>تخطي</code> للتجاوز):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return true;
  }

  if (state.step === "awaiting_ad_subtitle") {
    const subtitle_ar = (text === "تخطي" || text === "-") ? "" : text;
    setAdminState(userId, "awaiting_ad_route", { ...state.payload, subtitle_ar });
    await sendMessage(userId, `🔗 <b>(الخطوة 3 من 5) — رابط أو مسار التوجيه:</b>\n\nأرسل مسار التوجيه في الموقع (مثل <code>/services/glass-facades</code> أو <code>/quote</code> أو <code>/contact</code> أو رابط واتساب):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return true;
  }

  if (state.step === "awaiting_ad_route") {
    const target_route = text.trim();
    setAdminState(userId, "awaiting_ad_action_title", { ...state.payload, target_route });
    await sendMessage(userId, `🔘 <b>(الخطوة 4 من 5) — نص زر الإجراء (Action Button):</b>\n\nأرسل النص الظاهر على زر الإعلان (مثال: <code>تواصل معنا الآن</code> أو <code>احجز معاينة</code> أو اكتب <code>تخطي</code> للعنوان الافتراضي):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return true;
  }

  if (state.step === "awaiting_ad_action_title") {
    const action_title_ar = (text === "تخطي" || text === "-") ? "تواصل معنا الآن" : text.trim();
    setAdminState(userId, "awaiting_ad_priority", { ...state.payload, action_title_ar });
    await sendMessage(userId, `🔢 <b>(الخطوة 5 من 5) — أولوية وترتيب العرض:</b>\n\nأرسل رقم الأولوية (مثال: <code>1</code> أو <code>5</code> أو <code>10</code> ليكون في المقدمة، أو اكتب <code>تخطي</code> للقيمة 1):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return true;
  }

  if (state.step === "awaiting_ad_priority") {
    const priority = text === "تخطي" ? 1 : (Math.round(parseArabicNumber(text)) || 1);
    setAdminState(userId, "awaiting_ad_media", { ...state.payload, priority });
    await sendMessage(userId, `🖼️ <b>صورة وبانر الإعلان:</b>\n\n📷 <b>أرسل الآن صورة الإعلان مباشرة في الدردشة</b> لرفعها سحابياً وتطبيقها،\nأو أرسل <b>رابط صورة خارجي</b> (أو اكتب <code>تخطي</code> لاستخدام البانر الافتراضي):`, {
      reply_markup: Keyboards.cancelWizard("cnt_ads"),
    });
    return true;
  }

  if (state.step === "awaiting_ad_media") {
    const title_ar = (state.payload?.title_ar as string) || "إعلان جديد";
    const subtitle_ar = (state.payload?.subtitle_ar as string) || "";
    const target_route = (state.payload?.target_route as string) || "/contact";
    const action_title_ar = (state.payload?.action_title_ar as string) || "تواصل معنا الآن";
    const priority = (state.payload?.priority as number) || 1;
    const media_url = (text === "تخطي" || text === "-") ? "/images/defaults/projects/project-1.webp" : text.trim();

    // Exact Schema Columns: title_ar, subtitle_ar, media_type, media_url, target_route, action_title_ar, is_active, priority
    const { data: newAd, error } = await db.from("advertisements").insert({
      title_ar,
      subtitle_ar,
      media_type: "image",
      media_url,
      target_route,
      action_title_ar,
      is_active: true,
      priority,
    }).select("id").single();

    if (error || !newAd) {
      console.error("[Ad Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ الإعلان:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
    }

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
    return true;
  }

  return false;
}

// ─── 4. Advertisement Photo Upload Wizard ─────────────────────────────

export async function processAdvertisementPhotoWizard(userId: number, msg: TelegramMessage, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_ad_media") {
    await sendMessage(userId, `⏳ <b>جاري رفع صورة الإعلان إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "advertisements");
    const media_url = res?.url || "/images/defaults/projects/project-1.webp";

    const title_ar = (state.payload?.title_ar as string) || "إعلان جديد";
    const subtitle_ar = (state.payload?.subtitle_ar as string) || "";
    const target_route = (state.payload?.target_route as string) || "/contact";
    const action_title_ar = (state.payload?.action_title_ar as string) || "تواصل معنا الآن";
    const priority = (state.payload?.priority as number) || 1;

    // Exact Schema Columns: title_ar, subtitle_ar, media_type, media_url, target_route, action_title_ar, is_active, priority
    const { data: newAd, error } = await db.from("advertisements").insert({
      title_ar,
      subtitle_ar,
      media_type: "image",
      media_url,
      target_route,
      action_title_ar,
      is_active: true,
      priority,
    }).select("id").single();

    if (error || !newAd) {
      console.error("[Ad Photo Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء إنشاء الإعلان:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
    }

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
    return true;
  }

  if (state.step === "awaiting_ad_edit_media") {
    const adId = state.payload?.adId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة الإعلان ورفعها إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "advertisements");
    if (res?.url) {
      const { error } = await db.from("advertisements").update({ media_url: res.url, updated_at: new Date().toISOString() }).eq("id", adId);
      if (error) {
        console.error("[Ad Photo Update Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث صورة الإعلان:</b>\n<code>${error?.message || "DB error"}</code>`);
        return true;
      }
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث صورة الإعلان بنجاح.</b>`);
      await handleAdDetails(userId, adId);
      return true;
    }
  }

  return false;
}

// ─── 5. Gallery Album Creation & Text Photo Linking ───────────────────

export async function processGalleryAlbumTextWizard(userId: number, text: string, state: AdminState, companyId: string) {
  const db = createDbClient();

  if (state.step === "awaiting_album_title") {
    const slug = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "") || `album-${Date.now()}`;
    setAdminState(userId, "awaiting_album_desc", { title_ar: text, slug });
    await sendMessage(
      userId,
      `📝 <b>(الخطوة 2 من 3) — وصف الألبوم:</b>\n\nأرسل وصفاً توضيحياً لمحتوى الألبوم (أو اكتب <code>تخطي</code> للتجاوز):`,
      { reply_markup: Keyboards.cancelWizard("med_gallery") }
    );
    return true;
  }

  if (state.step === "awaiting_album_desc") {
    const description_ar = (text === "تخطي" || text === "-") ? "" : text;
    setAdminState(userId, "awaiting_album_cover", { ...state.payload, description_ar });
    await sendMessage(
      userId,
      `🖼️ <b>(الخطوة 3 من 3) — صورة غلاف الألبوم:</b>\n\n📷 <b>أرسل الآن صورة الغلاف مباشرة في الدردشة</b> لرفعها سحابياً،\nأو أرسل <b>رابط صورة خارجي</b> (أو اكتب <code>تخطي</code> لاستخدام الغلاف الافتراضي):`,
      { reply_markup: Keyboards.cancelWizard("med_gallery") }
    );
    return true;
  }

  if (state.step === "awaiting_album_cover") {
    const title_ar = (state.payload?.title_ar as string) || "ألبوم جديد";
    const slug = (state.payload?.slug as string) || `album-${Date.now()}`;
    const description_ar = (state.payload?.description_ar as string) || "";
    const cover_image_url = (text === "تخطي" || text === "-")
      ? "/images/defaults/projects/project-1.webp"
      : text.trim();

    const { data: newAlbum, error } = await db.from("gallery_albums").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      description_ar,
      cover_image_url,
      is_active: true,
      sort_order: 0,
    }).select("id").single();

    if (error || !newAlbum) {
      console.error("[Album Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ الألبوم:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
    }

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم إنشاء الألبوم بنجاح!</b>`);
    if (newAlbum?.id) {
      await handleGalleryAlbumDetails(userId, newAlbum.id);
    } else {
      await handleGalleryAlbumsList(userId);
    }
    return true;
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
      mime_type: "image/jpeg",
      file_size: 0,
      storage_provider: "url",
      storage_path: "gallery/external",
    }).select("id").single();

    if (media?.id) {
      await db.from("gallery_items").insert({
        album_id: albumId,
        media_id: media.id,
        type: "image",
        sort_order: 0,
      });
    }

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تمت إضافة الصورة للألبوم بنجاح!</b>`);
    await handleGalleryAlbumItems(userId, albumId);
    return true;
  }

  return false;
}

// ─── 6. Gallery Album Photo Upload Wizard ─────────────────────────────

export async function processGalleryAlbumPhotoWizard(userId: number, msg: TelegramMessage, state: AdminState, companyId: string) {
  const db = createDbClient();

  if (state.step === "awaiting_album_photo") {
    const albumId = state.payload?.albumId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وربطها بالألبوم تلقائياً...</b>`);

    // نمرر albumId مباشرة → uploadTelegramPhotoToR2 يربطها تلقائياً بالألبوم
    const res = await uploadTelegramPhotoToR2(msg, "gallery", albumId);

    if (res?.mediaId) {
      clearAdminState(userId);
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للألبوم بنجاح! ✅</b>`);
      if (albumId) await handleGalleryAlbumItems(userId, albumId);
      return true;
    } else {
      await sendMessage(userId, `❌ <b>تعذر رفع الصورة. حاول مجدداً.</b>`);
      return true;
    }
  }

  if (state.step === "awaiting_album_cover") {
    await sendMessage(userId, `⏳ <b>جاري رفع صورة غلاف الألبوم إلى Cloudflare R2...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    const cover_image_url = res?.url || "/images/defaults/projects/project-1.webp";

    const title_ar = (state.payload?.title_ar as string) || "ألبوم جديد";
    const slug = (state.payload?.slug as string) || `album-${Date.now()}`;
    const description_ar = (state.payload?.description_ar as string) || "";

    const { data: newAlbum, error } = await db.from("gallery_albums").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      description_ar,
      cover_image_url,
      is_active: true,
      sort_order: 0,
    }).select("id").single();

    if (error || !newAlbum) {
      console.error("[Album Photo Cover Insert Error]:", error);
      clearAdminState(userId);
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء إنشاء الألبوم:</b>\n<code>${error?.message || "DB error"}</code>`);
      return true;
    }

    clearAdminState(userId);
    await sendMessage(userId, `🎉 <b>تم إنشاء الألبوم مع صورة الغلاف بنجاح!</b>`);
    if (newAlbum?.id) {
      await handleGalleryAlbumDetails(userId, newAlbum.id);
    } else {
      await handleGalleryAlbumsList(userId);
    }
    return true;
  }

  if (state.step === "awaiting_album_edit_cover") {
    const albumId = state.payload?.albumId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة غلاف الألبوم...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    if (res?.url) {
      const { error } = await db.from("gallery_albums").update({ cover_image_url: res.url }).eq("id", albumId);
      if (error) {
        console.error("[Album Cover Update Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث غلاف الألبوم:</b>\n<code>${error?.message || "DB error"}</code>`);
        return true;
      }
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث غلاف الألبوم بنجاح.</b>`);
      await handleGalleryAlbumDetails(userId, albumId);
      return true;
    }
  }

  return false;
}

// ─── 7. Project Photo Upload Wizard ───────────────────────────────────

export async function processProjectPhotoWizard(userId: number, msg: TelegramMessage, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_project_photo") {
    const projectId = state.payload?.projectId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وإضافتها لمعرض المشروع...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.mediaId && projectId) {
      // حساب الترتيب الحقيقي بناءً على عدد الصور الموجودة
      const { count: existingCount } = await db
        .from("project_images")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      const sortOrder = existingCount ?? 0;
      const isCover = sortOrder === 0; // أول صورة تصبح غلافاً تلقائياً

      const { error } = await db.from("project_images").insert({
        project_id: projectId,
        media_id: res.mediaId,
        sort_order: sortOrder,
        is_cover: isCover,
      });

      if (error) {
        console.error("[Project Photo Insert Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء إضافة الصورة للمشروع:</b>\n<code>${error?.message || "DB error"}</code>`);
        return true;
      }

      if (isCover && res.url) {
        await db.from("projects").update({ cover_image_url: res.url }).eq("id", projectId);
      }

      clearAdminState(userId);
      const coverNote = isCover ? "\n⭐ <b>تم تعيينها كصورة الغلاف الرئيسية للمشروع.</b>" : "";
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للمشروع بنجاح!</b>${coverNote}`);
      await handleProjectItems(userId, projectId);
      return true;
    }
  }

  if (state.step === "awaiting_project_cover") {
    const projectId = state.payload?.projectId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة غلاف المشروع...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.url && projectId) {
      const { error } = await db.from("projects").update({ cover_image_url: res.url }).eq("id", projectId);
      if (error) {
        console.error("[Project Cover Update Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث غلاف المشروع:</b>\n<code>${error?.message || "DB error"}</code>`);
        return true;
      }
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث صورة غلاف المشروع بنجاح.</b>`);
      await handleProjectDetails(userId, projectId);
      return true;
    }
  }

  return false;
}

// ─── 7b. Service Photo Upload Wizard ──────────────────────────────────

export async function processServicePhotoWizard(userId: number, msg: TelegramMessage, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_service_photo") {
    const serviceId = state.payload?.serviceId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وإضافتها للخدمة...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "services");
    if (res?.mediaId && serviceId) {
      const { count: existingCount } = await db
        .from("service_images")
        .select("*", { count: "exact", head: true })
        .eq("service_id", serviceId);

      const sortOrder = existingCount ?? 0;
      const isCover = sortOrder === 0;

      const { error } = await db.from("service_images").insert({
        service_id: serviceId,
        media_id: res.mediaId,
        sort_order: sortOrder,
        is_cover: isCover,
      });

      if (error) {
        console.error("[Service Photo Insert Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء إضافة الصورة للخدمة:</b>\n<code>${error.message}</code>`);
        return true;
      }

      if (isCover && res.url) {
        await db.from("services").update({ cover_image_url: res.url }).eq("id", serviceId);
      }

      clearAdminState(userId);
      const coverNote = isCover ? "\n⭐ <b>تم تعيينها كصورة الغلاف الرئيسية للخدمة.</b>" : "";
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للخدمة بنجاح!</b>${coverNote}`);
      await handleServiceItems(userId, serviceId);
      return true;
    }
  }

  if (state.step === "awaiting_service_edit_cover") {
    const serviceId = state.payload?.serviceId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث صورة غلاف الخدمة...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "services");
    if (res?.url && serviceId) {
      const { error } = await db.from("services").update({ cover_image_url: res.url }).eq("id", serviceId);
      if (error) {
        console.error("[Service Cover Update Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث غلاف الخدمة:</b>\n<code>${error.message}</code>`);
        return true;
      }
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث صورة غلاف الخدمة بنجاح.</b>`);
      await handleServiceDetails(userId, serviceId);
      return true;
    }
  }

  return false;
}

// ─── 7c. Project Before & After Photo Upload Wizard ────────────────────

export async function processBeforeAfterPhotoWizard(userId: number, msg: TelegramMessage, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_ba_before_photo") {
    const projectId = state.payload?.projectId as string;
    const caption_ar = (state.payload?.caption_ar as string) || "قبل وبعد التعديل";
    await sendMessage(userId, `⏳ <b>جاري رفع صورة (قبل)...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.mediaId && projectId) {
      setAdminState(userId, "awaiting_ba_after_photo", {
        projectId,
        caption_ar,
        before_image_id: res.mediaId,
      });
      await sendMessage(userId, `📸 <b>تم رفع وحفظ صورة (قبل)!</b>\n\nالآن أرسل <b>صورة (بعد)</b> لنفس المشروع:`, {
        reply_markup: Keyboards.cancelWizard("cnt_before_after"),
      });
      return true;
    }
  }

  if (state.step === "awaiting_ba_after_photo") {
    const projectId = state.payload?.projectId as string;
    const caption_ar = (state.payload?.caption_ar as string) || "قبل وبعد التعديل";
    const before_image_id = state.payload?.before_image_id as string;
    await sendMessage(userId, `⏳ <b>جاري رفع صورة (بعد) وتوثيق المقارنة...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "projects");
    if (res?.mediaId && projectId && before_image_id) {
      const { error } = await db.from("project_before_after").insert({
        project_id: projectId,
        before_image_id,
        after_image_id: res.mediaId,
        caption_ar,
        caption_en: caption_ar,
        sort_order: 0,
      });

      clearAdminState(userId);
      if (error) {
        console.error("[BA Insert Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ المقارنة:</b>\n<code>${error.message}</code>`);
      } else {
        await sendMessage(userId, `🎉 <b>تمت إضافة مقارنة قبل وبعد بنجاح للمشروع!</b>`);
        await handleBeforeAfterList(userId);
      }
      return true;
    }
  }

  return false;
}

// ─── 7d. Article Photo Upload Wizard ──────────────────────────────────

export async function processArticlePhotoWizard(userId: number, msg: TelegramMessage, state: AdminState) {
  const db = createDbClient();

  if (state.step === "awaiting_article_photo") {
    const articleId = state.payload?.articleId as string;
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة وإضافتها للمقال...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "uploads");
    if (res?.mediaId && articleId) {
      const { error } = await db.from("article_images").insert({
        article_id: articleId,
        media_id: res.mediaId,
        context: "content_image",
      });

      clearAdminState(userId);
      if (error) {
        console.error("[Article Image Insert Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء إضافة الصورة للمقال:</b>\n<code>${error.message}</code>`);
      } else {
        await sendMessage(userId, `🎉 <b>تمت إضافة الصورة لمعرض المقال بنجاح!</b>`);
        await handleArticleDetails(userId, articleId);
      }
      return true;
    }
  }

  if (state.step === "awaiting_article_edit_cover") {
    const articleId = state.payload?.articleId as string;
    await sendMessage(userId, `⏳ <b>جاري تحديث غلاف المقال...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "uploads");
    if (res?.url && articleId) {
      const { error } = await db.from("articles").update({ cover_image_url: res.url }).eq("id", articleId);
      clearAdminState(userId);
      if (error) {
        console.error("[Article Cover Update Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث غلاف المقال:</b>\n<code>${error.message}</code>`);
      } else {
        await sendMessage(userId, `✅ <b>تم تحديث غلاف المقال بنجاح.</b>`);
        await handleArticleDetails(userId, articleId);
      }
      return true;
    }
  }

  return false;
}

// ─── 8. General Field Editors ─────────────────────────────────────────

export async function processFieldEditWizard(userId: number, text: string, state: AdminState) {
  const db = createDbClient();

  // Advertisements field edit
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
      await db.from("advertisements").update({ priority: Math.round(parseArabicNumber(text)) || 0, updated_at: new Date().toISOString() }).eq("id", adId);
    } else if (editField === "media") {
      await db.from("advertisements").update({ media_url: text.trim(), updated_at: new Date().toISOString() }).eq("id", adId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات الإعلان بنجاح.</b>`);
    await handleAdDetails(userId, adId);
    return true;
  }

  // Projects field edit
  if (state.step?.startsWith("awaiting_project_edit_")) {
    const projectId = state.payload?.projectId as string;
    const editField = state.step.replace("awaiting_project_edit_", "");

    if (editField === "title") {
      await db.from("projects").update({ title_ar: text, title_en: text }).eq("id", projectId);
    } else if (editField === "city") {
      await db.from("projects").update({ city: text.trim() }).eq("id", projectId);
    } else if (editField === "client") {
      await db.from("projects").update({ client_name: text.trim() }).eq("id", projectId);
    } else if (editField === "val") {
      await db.from("projects").update({ project_value: parseArabicNumber(text) || 0 }).eq("id", projectId);
    } else if (editField === "desc") {
      await db.from("projects").update({ description_ar: text }).eq("id", projectId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات المشروع بنجاح.</b>`);
    await handleProjectDetails(userId, projectId);
    return true;
  }

  // Album field edit
  if (state.step?.startsWith("awaiting_album_edit_")) {
    const albumId = state.payload?.albumId as string;
    const editField = state.step.replace("awaiting_album_edit_", "");

    if (editField === "title") {
      await db.from("gallery_albums").update({ title_ar: text, title_en: text }).eq("id", albumId);
    } else if (editField === "desc") {
      await db.from("gallery_albums").update({ description_ar: text }).eq("id", albumId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات الألبوم بنجاح.</b>`);
    await handleGalleryAlbumDetails(userId, albumId);
    return true;
  }

  // Services field edit
  if (state.step?.startsWith("awaiting_service_edit_")) {
    const serviceId = state.payload?.serviceId as string;
    const editField = state.step.replace("awaiting_service_edit_", "");

    if (editField === "name") {
      await db.from("services").update({ name_ar: text, name_en: text }).eq("id", serviceId);
    } else if (editField === "price") {
      const p = parseArabicNumber(text) || 300;
      await db.from("services").update({ price_from: p, price_to: p * 1.5 }).eq("id", serviceId);
    } else if (editField === "desc") {
      await db.from("services").update({ short_description_ar: text, short_description_en: text }).eq("id", serviceId);
    } else if (editField === "cover") {
      await db.from("services").update({ cover_image_url: text.trim() }).eq("id", serviceId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات الخدمة بنجاح.</b>`);
    await handleServiceDetails(userId, serviceId);
    return true;
  }

  // Category field edit
  if (state.step === "awaiting_category_edit_name") {
    const categoryId = state.payload?.categoryId as string;
    await db.from("categories").update({ name_ar: text, name_en: text }).eq("id", categoryId);
    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تعديل اسم التصنيف بنجاح إلى:</b> ${text}`);
    await handleCategoriesList(userId);
    return true;
  }

  // FAQ field edit
  if (state.step === "awaiting_faq_edit_q") {
    const faqId = state.payload?.faqId as string;
    await db.from("faqs").update({ question_ar: text, question_en: text }).eq("id", faqId);
    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تعديل نص السؤال بنجاح.</b>`);
    await handleFaqsList(userId);
    return true;
  }
  if (state.step === "awaiting_faq_edit_a") {
    const faqId = state.payload?.faqId as string;
    await db.from("faqs").update({ answer_ar: text, answer_en: text }).eq("id", faqId);
    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تعديل نص الإجابة بنجاح.</b>`);
    await handleFaqsList(userId);
    return true;
  }

  // Article field edit
  if (state.step?.startsWith("awaiting_article_edit_")) {
    const articleId = state.payload?.articleId as string;
    const editField = state.step.replace("awaiting_article_edit_", "");

    if (editField === "title") {
      await db.from("articles").update({ title_ar: text, title_en: text }).eq("id", articleId);
    } else if (editField === "excerpt") {
      await db.from("articles").update({ excerpt_ar: text, excerpt_en: text }).eq("id", articleId);
    } else if (editField === "cover") {
      await db.from("articles").update({ cover_image_url: text.trim() }).eq("id", articleId);
    }

    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث بيانات المقال بنجاح.</b>`);
    await handleArticleDetails(userId, articleId);
    return true;
  }

  // City field edit
  if (state.step === "awaiting_city_edit_desc") {
    const cityId = state.payload?.cityId as string;
    await db.from("city_pages").update({ description_ar: text, description_en: text }).eq("id", cityId);
    clearAdminState(userId);
    await sendMessage(userId, `✅ <b>تم تحديث وصف صفحة المدينة بنجاح.</b>`);
    await handleCitiesList(userId);
    return true;
  }

  return false;
}

// ─── 9. Miscellaneous Domain Wizards ──────────────────────────────────

export async function processMiscWizards(userId: number, text: string, state: AdminState, companyId: string) {
  const db = createDbClient();

  // 1. Branch Address Wizard
  if (state.step === "awaiting_address_city") {
    setAdminState(userId, "awaiting_address_street", { city_ar: text });
    await sendMessage(userId, `🛣️ أرسل <b>اسم الشارع والحي</b> (مثال: طريق الملك فهد - حي العليا):`, {
      reply_markup: Keyboards.cancelWizard("set_addresses"),
    });
    return true;
  }

  if (state.step === "awaiting_address_street") {
    const city_ar = (state.payload?.city_ar as string) || "الرياض";
    const { error } = await db.from("company_addresses").insert({
      company_id: companyId,
      label_ar: city_ar,
      city_ar,
      street_ar: text,
      country: "SA",
      is_primary: false,
    });
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ العنوان:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(
        userId,
        `🎉 <b>تمت إضافة الفرع والعنوان بنجاح!</b>\n\n🏢 <b>الفرع:</b> ${city_ar}\n📍 <b>العنوان:</b> ${text}`,
        { reply_markup: Keyboards.backToSubmenu("set_addresses") }
      );
    }
    return true;
  }

  // 2. Category Wizard
  if (state.step === "awaiting_category_name") {
    const slug = "cat-" + Date.now().toString().slice(-4);
    const { error } = await db.from("categories").insert({
      company_id: companyId,
      name_ar: text,
      name_en: text,
      slug,
      is_active: true,
    });
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ التصنيف:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(
        userId,
        `🎉 <b>تمت إضافة التصنيف بنجاح!</b>\n\n📂 <b>الاسم:</b> ${text}`,
        { reply_markup: Keyboards.backToSubmenu("cnt_categories") }
      );
    }
    return true;
  }

  // 3. Broadcast Push Notification Wizard
  if (state.step === "awaiting_push_title") {
    setAdminState(userId, "awaiting_push_body", { title: text });
    await sendMessage(
      userId,
      `📝 <b>عنوان الإشعار:</b> ${text}\n\nالآن أرسل <b>نص ورسالة الإشعار</b> (مثال: احصل على مقايسة وتصميم ثلاثي الأبعاد مجاناً هذا الأسبوع):`
    );
    return true;
  }

  if (state.step === "awaiting_push_body") {
    const title = (state.payload?.title as string) || "تنبيه جديد";
    setAdminState(userId, "awaiting_push_screen", { title, body: text });
    await sendMessage(
      userId,
      `🎯 <b>اختر الشاشة التي سيتم توجيه المستخدم إليها عند فتح الإشعار:</b>`,
      { reply_markup: Keyboards.pushScreenSelector() }
    );
    return true;
  }

  // 4. FAQ Wizard
  if (state.step === "awaiting_faq_question") {
    setAdminState(userId, "awaiting_faq_answer", { question_ar: text });
    await sendMessage(userId, `💡 <b>السؤال:</b> ${text}\n\nالآن أرسل <b>الإجابة الشاملة</b> على هذا السؤال:`, {
      reply_markup: Keyboards.cancelWizard("cnt_faqs"),
    });
    return true;
  }

  if (state.step === "awaiting_faq_answer") {
    const question_ar = (state.payload?.question_ar as string) || "سؤال جديد";
    const { error } = await db.from("faqs").insert({
      company_id: companyId,
      question_ar,
      question_en: question_ar,
      answer_ar: text,
      answer_en: text,
      is_active: true,
    });
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ السؤال:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(
        userId,
        `🎉 <b>تمت إضافة السؤال والجواب بنجاح!</b>\n\n❓ <b>السؤال:</b> ${question_ar}\n💡 <b>الإجابة:</b> ${text}`,
        { reply_markup: Keyboards.backToSubmenu("cnt_faqs") }
      );
    }
    return true;
  }

  // 5. AI Article Topic Wizard
  if (state.step === "awaiting_article_ai_topic") {
    const { handleArticleAiGenerate } = await import("./handlers/content");
    clearAdminState(userId);
    await handleArticleAiGenerate(userId, text);
    return true;
  }

  // 6. Message Reply Wizard
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
    return true;
  }

  // 7. Add Admin Wizard
  if (state.step === "awaiting_admin_add") {
    const { handleAdminAdd } = await import("./handlers/system");
    clearAdminState(userId);
    await handleAdminAdd(userId, text);
    return true;
  }

  // 8. Project Video Wizard
  if (state.step === "awaiting_project_video_url") {
    const projectId = state.payload?.projectId as string;
    setAdminState(userId, "awaiting_project_video_title", { projectId, video_url: text.trim() });
    await sendMessage(userId, `🎥 <b>رابط الفيديو:</b> <code>${text.trim()}</code>\n\nأرسل الآن <b>عنواناً توضيحياً للفيديو</b> (مثال: فيديو تركيب واجهات استركشر):`, {
      reply_markup: Keyboards.cancelWizard(`prj_view:${projectId}`),
    });
    return true;
  }

  if (state.step === "awaiting_project_video_title") {
    const projectId = state.payload?.projectId as string;
    const video_url = state.payload?.video_url as string;
    const { error } = await db.from("project_videos").insert({
      project_id: projectId,
      video_url,
      title_ar: text,
      title_en: text,
      sort_order: 0,
    });
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ الفيديو:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(userId, `🎉 <b>تمت إضافة الفيديو للمشروع بنجاح!</b>`);
      await handleProjectVideosList(userId, projectId);
    }
    return true;
  }

  // 9. Project Before & After Prompt Wizard
  if (state.step === "awaiting_ba_caption") {
    const projectId = state.payload?.projectId as string;
    setAdminState(userId, "awaiting_ba_before_photo", { projectId, caption_ar: text.trim() });
    await sendMessage(userId, `📷 <b>عنوان المقارنة:</b> ${text}\n\nالآن قم بـ <b>إرسال صورة (قبل التنفيذ)</b> مباشرة في الدردشة لرفعها:`, {
      reply_markup: Keyboards.cancelWizard("cnt_before_after"),
    });
    return true;
  }

  // 10. Manual Article Creation Wizard
  if (state.step === "awaiting_article_manual_title") {
    setAdminState(userId, "awaiting_article_manual_excerpt", { title_ar: text });
    await sendMessage(userId, `✍️ <b>عنوان المقال:</b> ${text}\n\nالآن أرسل <b>الموجز أو المقدمة التعريفية للمقال</b>:`, {
      reply_markup: Keyboards.cancelWizard("cnt_articles"),
    });
    return true;
  }

  if (state.step === "awaiting_article_manual_excerpt") {
    setAdminState(userId, "awaiting_article_manual_content", { ...state.payload, excerpt_ar: text });
    await sendMessage(userId, `📄 <b>المقدمة:</b> ${text}\n\nالآن أرسل <b>نص ومحتوى المقال كاملاً</b>:`, {
      reply_markup: Keyboards.cancelWizard("cnt_articles"),
    });
    return true;
  }

  if (state.step === "awaiting_article_manual_content") {
    const title_ar = (state.payload?.title_ar as string) || "مقال جديد";
    const excerpt_ar = (state.payload?.excerpt_ar as string) || "";
    const slug = "art-" + Date.now().toString().slice(-6);
    const words = text.split(/\s+/).length;
    const read_time_minutes = Math.max(1, Math.ceil(words / 100));

    const { data: newArt, error } = await db.from("articles").insert({
      company_id: companyId,
      title_ar,
      title_en: title_ar,
      slug,
      excerpt_ar,
      excerpt_en: excerpt_ar,
      content_ar: text,
      content_en: text,
      cover_image_url: "/images/defaults/projects/project-1.webp",
      read_time_minutes,
      status: "published",
      published_at: new Date().toISOString(),
    }).select("id").single();

    clearAdminState(userId);
    if (error || !newArt) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ المقال:</b>\n<code>${error?.message || "DB error"}</code>`);
    } else {
      await sendMessage(userId, `🎉 <b>تم نشر المقال بنجاح!</b>`);
      await handleArticleDetails(userId, newArt.id);
    }
    return true;
  }

  // 11. City Page Creation Wizard
  if (state.step === "awaiting_city_name") {
    setAdminState(userId, "awaiting_city_region", { name_ar: text });
    await sendMessage(userId, `📍 <b>المدينة:</b> ${text}\n\nأرسل الآن <b>اسم المنطقة</b> (مثال: منطقة الرياض، المنطقة الغربية، المنطقة الشرقية):`, {
      reply_markup: Keyboards.cancelWizard("mkt_cities"),
    });
    return true;
  }

  if (state.step === "awaiting_city_region") {
    setAdminState(userId, "awaiting_city_desc", { ...state.payload, region_ar: text });
    await sendMessage(userId, `📝 أرسل الآن <b>وصف خدماتنا في هذه المدينة</b> (نص تعريفي تسويقي):`, {
      reply_markup: Keyboards.cancelWizard("mkt_cities"),
    });
    return true;
  }

  if (state.step === "awaiting_city_desc") {
    const city_name_ar = (state.payload?.name_ar as string) || "مدينة جديدة";
    const region_ar = (state.payload?.region_ar as string) || "المملكة";
    const slug = "city-" + Date.now().toString().slice(-4);

    const { error } = await db.from("city_pages").insert({
      company_id: companyId,
      city_name_ar,
      city_name_en: city_name_ar,
      slug,
      region_ar,
      region_en: region_ar,
      description_ar: text,
      description_en: text,
      is_active: true,
    });

    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء إضافة المدينة:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(userId, `🎉 <b>تمت إضافة صفحة المدينة بنجاح!</b>`);
      await handleCitiesList(userId);
    }
    return true;
  }

  // 12. Company Profile Field Edits
  if (state.step?.startsWith("awaiting_company_")) {
    const field = state.step.replace("awaiting_company_", "");
    const colMap: Record<string, string> = {
      phone: "phone",
      whatsapp: "whatsapp",
      email: "email",
      tax: "tax_number",
      cr: "cr_number",
    };
    const col = colMap[field];
    if (col) {
      await db.from("companies").update({ [col]: text.trim() }).eq("id", companyId);
      clearAdminState(userId);
      await sendMessage(userId, `✅ <b>تم تحديث بيانات المنشأة بنجاح!</b>`);
      await handleCompanyProfile(userId);
      return true;
    }
  }

  // 13. Company Contact Addition Wizard
  if (state.step === "awaiting_contact_type") {
    setAdminState(userId, "awaiting_contact_value", { contact_type: text.trim() });
    await sendMessage(userId, `🔗 أرسل الآن <b>الرابط أو الرقم أو المعرّف</b>:`, {
      reply_markup: Keyboards.cancelWizard("set_social"),
    });
    return true;
  }

  if (state.step === "awaiting_contact_value") {
    const contactType = (state.payload?.contact_type as string) || "phone";
    const { error } = await db.from("company_contacts").insert({
      company_id: companyId,
      type: contactType,
      value: text.trim(),
      label_ar: contactType,
      label_en: contactType,
      is_primary: false,
    });

    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء إضافة وسيلة التواصل:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(userId, `🎉 <b>تمت إضافة وسيلة التواصل بنجاح!</b>`);
      await handleSocialContacts(userId);
    }
    return true;
  }

  // 14. Business Hours Time Edit
  if (state.step === "awaiting_hours_time") {
    const dayOfWeek = (state.payload?.dayOfWeek as number) ?? 0;
    const parts = text.split(/[-–—إلىto]/i).map(s => s.trim());
    let open_time = parts[0] || "08:00";
    let close_time = parts[1] || "18:00";
    if (/^\d{1,2}$/.test(open_time)) open_time = `${open_time.padStart(2, "0")}:00`;
    if (/^\d{1,2}$/.test(close_time)) close_time = `${close_time.padStart(2, "0")}:00`;

    const { error } = await db.from("business_hours").update({ open_time, close_time, is_closed: false }).eq("day_of_week", dayOfWeek).eq("company_id", companyId);
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث أوقات الدوام:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(userId, `✅ <b>تم تعديل أوقات الدوام بنجاح!</b> (${open_time} - ${close_time})`);
      await handleBusinessHours(userId);
    }
    return true;
  }

  // 15. AI Prompt Update Wizard
  if (state.step === "awaiting_ai_prompt_text") {
    const { error } = await db.from("ai_prompts").update({ system_prompt_ar: text, updated_at: new Date().toISOString() }).eq("company_id", companyId).eq("prompt_type", "chat");
    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء تحديث التوجيه:</b>\n<code>${error.message}</code>`);
    } else {
      invalidatePromptCache();
      await sendMessage(userId, `✅ <b>تم تحديث التوجيه البرمجي للذكاء الاصطناعي بنجاح!</b>`);
      await handleAiPromptSettings(userId);
    }
    return true;
  }

  // 16. Company Settings Store Key/Value
  if (state.step === "awaiting_setting_value") {
    let key = (state.payload?.settingKey as string) || "";
    let rawVal = text.trim();
    if (!key && text.includes("=")) {
      const eqIdx = text.indexOf("=");
      key = text.slice(0, eqIdx).trim();
      rawVal = text.slice(eqIdx + 1).trim();
    } else if (!key) {
      key = "custom_setting_" + Date.now().toString().slice(-4);
    }

    let parsedVal: any = rawVal;
    try {
      parsedVal = JSON.parse(rawVal);
    } catch {
      parsedVal = rawVal;
    }

    const { error } = await db.from("company_settings").upsert({
      company_id: companyId,
      key,
      value: parsedVal,
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id,key" });

    clearAdminState(userId);
    if (error) {
      await sendMessage(userId, `❌ <b>حدث خطأ أثناء حفظ الإعداد:</b>\n<code>${error.message}</code>`);
    } else {
      await sendMessage(userId, `✅ <b>تم حفظ الإعداد بنجاح:</b>\n<code>${key}</code> = <code>${rawVal}</code>`);
      await handleCompanySettingsStore(userId);
    }
    return true;
  }

  return false;
}
