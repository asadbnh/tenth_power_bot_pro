import { createDbClient } from "@/lib/db";
import { sendMessage, Keyboards, type TelegramMessage } from "./bot";
import { setAdminState, clearAdminState, type AdminState } from "./state";
import { uploadTelegramPhotoToR2 } from "./handlers/media";
import { handleAdDetails, handleAdsList, handleProjectDetails, handleProjectItems } from "./handlers/content";
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
    await sendMessage(userId, `⏳ <b>جاري رفع الصورة إلى Cloudflare R2 وربطها بالألبوم...</b>`);
    const res = await uploadTelegramPhotoToR2(msg, "gallery");
    if (res?.mediaId && albumId) {
      // حساب الترتيب الحقيقي بناءً على عدد الصور الموجودة في الألبوم
      const { count: existingCount } = await db
        .from("gallery_items")
        .select("*", { count: "exact", head: true })
        .eq("album_id", albumId);

      const { error } = await db.from("gallery_items").insert({
        album_id: albumId,
        media_id: res.mediaId,
        type: "image",
        sort_order: existingCount ?? 0,
      });

      if (error) {
        console.error("[Gallery Item Insert Error]:", error);
        await sendMessage(userId, `❌ <b>حدث خطأ أثناء ربط الصورة بالألبوم:</b>\n<code>${error?.message || "DB error"}</code>`);
        return true;
      }

      clearAdminState(userId);
      await sendMessage(userId, `🎉 <b>تم رفع الصورة وإضافتها للألبوم بنجاح!</b>`);
      await handleGalleryAlbumItems(userId, albumId);
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

  return false;
}
