import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards, getFile, getTelegramFileUrl, type TelegramMessage } from "../bot";
import { setAdminState } from "../state";

// ─── Media Library Handlers ───────────────────────────────────────────

export async function handleMediaLibraryList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: media, count } = await db
    .from("media_library")
    .select("id, file_name, file_url, file_size, width, height, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(8);

  let text = `📁 <b>مكتبة الوسائط والصور (الإجمالي: ${count ?? media?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (media as Record<string, any>[] || []).forEach((m, idx) => {
    text += `${idx + 1}. 🖼️ <b>${m.file_name}</b>\n`;
    text += `   📐 الأبعاد: ${m.width || 1200}x${m.height || 800} | 💾 الحجم: ${Math.round((m.file_size || 0) / 1024)} KB\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف الصورة رقم ${idx + 1}`, callback_data: `med_delete:${m.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "📸 كيفية رفع صور جديدة؟", callback_data: "med_upload_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع للوسائط", callback_data: "menu_media" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleMediaDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("media_library").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الصورة من مكتبة الوسائط.`);
  await handleMediaLibraryList(chatId, messageId);
}

export async function handleMediaUploadPrompt(chatId: number, messageId?: number) {
  const text = `📸 <b>طريقة رفع الصور المباشرة</b>

أرسل أي صورة مباشرة إلى هذه المحادثة (كصورة أو ملف)، وسيقوم البوت تلقائياً بما يلي:
1. معالجة وتخزين الصورة.
2. تسجيلها في جدول <code>media_library</code> بقاعدة البيانات.
3. تزويدك برابط مباشر لمعاينتها وربطها بالمشاريع والخدمات.
4. سؤالك عما إذا كنت ترغب في إرسال إشعار فوري للعملاء.`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.backToSubmenu("menu_media"));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.backToSubmenu("menu_media") });
}

// ─── Gallery Albums Handlers ──────────────────────────────────────────

export async function handleGalleryAlbumsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: albums } = await db
    .from("gallery_albums")
    .select("id, slug, title_ar, title_en, cover_image_url, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  // Get item counts for each album
  const { data: allItems } = await db.from("gallery_items").select("id, album_id");
  const countMap: Record<string, number> = {};
  (allItems || []).forEach((it: any) => {
    countMap[it.album_id] = (countMap[it.album_id] || 0) + 1;
  });

  if (!albums || albums.length === 0) {
    const emptyText = "🖼️ <b>ألبومات معرض الصور</b>\n\nلا توجد ألبومات مسجلة حالياً في قاعدة البيانات.";
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إنشاء ألبوم جديد", callback_data: "alb_add_prompt" }],
        [{ text: "◀️ رجوع لقائمة الوسائط", callback_data: "menu_media" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `🖼️ <b>ألبومات معرض الصور والأعمال (${albums.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (albums as Record<string, any>[]).forEach((a, idx) => {
    const status = a.is_active ? "🟢 مفعل" : "🔴 مخفي";
    const count = countMap[a.id] || 0;
    text += `${idx + 1}. [${status}] <b>${a.title_ar}</b> (📸 ${count} صور)\n`;
    text += `   🔗 المعرف: <code>${a.slug}</code>\n\n`;

    inline_keyboard.push([
      { text: `🖼️ استعراض الصور (${count})`, callback_data: `alb_items:${a.id}` },
      { text: `⚙️ إدارة وتعديل الألبوم`, callback_data: `alb_view:${a.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "➕ إنشاء ألبوم جديد", callback_data: "alb_add_prompt" }]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة الوسائط", callback_data: "menu_media" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleGalleryAlbumDetails(chatId: number, albumId: string, messageId?: number) {
  const db = createDbClient();
  const { data: album } = await db.from("gallery_albums").select("*").eq("id", albumId).single();
  if (!album) {
    await sendMessage(chatId, "❌ لم يتم العثور على الألبوم المطلوب.");
    return;
  }

  const { count: photoCount } = await db.from("gallery_items").select("*", { count: "exact", head: true }).eq("album_id", albumId);

  const status = album.is_active ? "🟢 مفعل ويظهر في الموقع" : "🔴 معطل ومخفي";

  const text = `🖼️ <b>بيانات وتفاصيل الألبوم:</b>

📌 <b>اسم الألبوم (عربي):</b> ${album.title_ar || "—"}
🌐 <b>اسم الألبوم (إنجليزي):</b> ${album.title_en || "—"}
🔗 <b>المعرف (Slug):</b> <code>${album.slug}</code>
📝 <b>الوصف:</b> ${album.description_ar || "لا يوجد وصف"}
🖼️ <b>صورة الغلاف:</b> ${album.cover_image_url ? `<code>${album.cover_image_url}</code>` : "<i>افتراضي</i>"}
🔢 <b>ترتيب الظهور:</b> <code>${album.sort_order ?? 0}</code>
📸 <b>عدد الصور بالألبوم:</b> <b>${photoCount || 0} صورة</b>
⚡ <b>الحالة:</b> ${status}`;

  const kb = {
    inline_keyboard: [
      [
        { text: "➕ إضافة صورة لهذا الألبوم", callback_data: `alb_add_photo:${album.id}` },
        { text: `🖼️ استعراض الصور (${photoCount || 0})`, callback_data: `alb_items:${album.id}` },
      ],
      [
        { text: album.is_active ? "⏸️ إخفاء الألبوم" : "▶️ تفعيل الألبوم", callback_data: `alb_toggle:${album.id}` },
        { text: "✏️ تعديل الاسم", callback_data: `alb_edit_title:${album.id}` },
      ],
      [
        { text: "📝 تعديل الوصف", callback_data: `alb_edit_desc:${album.id}` },
        { text: "🖼️ تغيير صورة الغلاف", callback_data: `alb_edit_cover:${album.id}` },
      ],
      [
        { text: "🗑️ حذف الألبوم بالكامل", callback_data: `alb_delete:${album.id}` },
        { text: "◀️ رجوع للألبومات", callback_data: "med_gallery" },
      ],
    ],
  };

  if (messageId) await editMessage(chatId, messageId, text, kb);
  else await sendMessage(chatId, text, { reply_markup: kb });
}

export async function handleGalleryAlbumToggle(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: album } = await db.from("gallery_albums").select("is_active").eq("id", id).single();
  if (album) {
    await db.from("gallery_albums").update({ is_active: !album.is_active }).eq("id", id);
    await handleGalleryAlbumDetails(chatId, id, messageId);
  }
}

export async function handleGalleryAlbumItems(chatId: number, albumId: string, messageId?: number) {
  const db = createDbClient();
  const [{ data: album }, { data: items }] = await Promise.all([
    db.from("gallery_albums").select("id, title_ar").eq("id", albumId).single(),
    db.from("gallery_items").select("id, media_id, type, sort_order, created_at").eq("album_id", albumId).order("sort_order", { ascending: true }),
  ]);

  const albumTitle = album?.title_ar || "الألبوم";

  if (!items || items.length === 0) {
    const emptyText = `🖼️ <b>ألبوم: ${albumTitle}</b>\n\nلا توجد صور في هذا الألبوم بعد.`;
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إضافة أول صورة لهذا الألبوم", callback_data: `alb_add_photo:${albumId}` }],
        [{ text: "⚙️ إعدادات الألبوم", callback_data: `alb_view:${albumId}` }],
        [{ text: "◀️ رجوع لقائمة الألبومات", callback_data: "med_gallery" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  // Fetch media details
  const mediaIds = items.map((it: any) => it.media_id);
  const { data: mediaList } = await db.from("media_library").select("id, file_url, cdn_url, original_name, file_name").in("id", mediaIds);
  const mediaMap: Record<string, any> = {};
  (mediaList || []).forEach((m: any) => { mediaMap[m.id] = m; });

  let text = `🖼️ <b>صور ألبوم: ${albumTitle} (${items.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  items.forEach((it: any, idx: number) => {
    const m = mediaMap[it.media_id];
    const fileName = m?.original_name || m?.file_name || `صورة ${idx + 1}`;
    const url = m?.cdn_url || m?.file_url || "";
    text += `${idx + 1}. 📸 <b>${fileName}</b>\n`;
    if (url) text += `   🔗 <code>${url}</code>\n`;
    text += "\n";

    inline_keyboard.push([
      { text: `🗑️ حذف صورة ${idx + 1}`, callback_data: `it_delete:${it.id}:${albumId}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة صورة جديدة لهذا الألبوم", callback_data: `alb_add_photo:${albumId}` },
  ]);
  inline_keyboard.push([
    { text: "⚙️ إعدادات الألبوم", callback_data: `alb_view:${albumId}` },
    { text: "◀️ رجوع للألبومات", callback_data: "med_gallery" },
  ]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleGalleryAlbumAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_album_title");
  await sendMessage(
    chatId,
    `🖼️ <b>إنشاء ألبوم جديد في المعرض (الخطوة 1 من 3)</b>\n\nأرسل الآن <b>اسم أو عنوان الألبوم بالعربي</b> (مثال: واجهات زجاجية واستركشر):`,
    { reply_markup: Keyboards.cancelWizard("med_gallery") }
  );
}

export async function handleGalleryAlbumAddPhotoPrompt(chatId: number, albumId: string) {
  setAdminState(chatId, "awaiting_album_photo", { albumId });
  await sendMessage(
    chatId,
    `📸 <b>إضافة صورة للألبوم</b>\n\n📷 <b>أرسل الآن الصورة مباشرة في الدردشة</b> لرفعها إلى Cloudflare R2 وربطها بهذا الألبوم فوراً،\nأو أرسل <b>رابط صورة خارجي</b>:`,
    { reply_markup: Keyboards.cancelWizard(`alb_items:${albumId}`) }
  );
}

export async function handleGalleryAlbumEditPrompt(chatId: number, albumId: string, field: "title" | "desc" | "cover") {
  setAdminState(chatId, `awaiting_album_edit_${field}`, { albumId });
  const titles = {
    title: "اسم الألبوم بالعربي",
    desc: "وصف الألبوم",
    cover: "صورة غلاف الألبوم (أرسل صورة مباشرة أو رابط)",
  };
  await sendMessage(
    chatId,
    `✏️ <b>تعديل ${titles[field]}</b>\n\nأرسل القيمة الجديدة الآن:`,
    { reply_markup: Keyboards.cancelWizard(`alb_view:${albumId}`) }
  );
}

export async function handleGalleryItemDelete(chatId: number, id: string, albumId?: string, messageId?: number) {
  const db = createDbClient();
  await db.from("gallery_items").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الصورة من الألبوم بنجاح.`);
  if (albumId) {
    await handleGalleryAlbumItems(chatId, albumId, messageId);
  } else {
    await handleGalleryAlbumsList(chatId, messageId);
  }
}

export async function handleGalleryAlbumDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("gallery_albums").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الألبوم وكافة صوره بنجاح.`);
  await handleGalleryAlbumsList(chatId, messageId);
}

// ─── Direct Telegram Photo & Video Message Listener ───────────────────

export async function uploadTelegramPhotoToR2(
  msg: TelegramMessage,
  targetFolder: "services" | "projects" | "gallery" | "advertisements" | "uploads" = "uploads"
): Promise<{ url: string; webpUrl: string; mediaId?: string; width?: number; height?: number; fileSize?: number } | null> {
  if (!msg.photo || msg.photo.length === 0) return null;
  const largestPhoto = msg.photo[msg.photo.length - 1];

  const fileRes = await getFile(largestPhoto.file_id);
  if (!fileRes.ok || !fileRes.result?.file_path) {
    return null;
  }

  const tgUrl = getTelegramFileUrl(fileRes.result.file_path);
  const downloadRes = await fetch(tgUrl);
  if (!downloadRes.ok) return null;

  const arrayBuf = await downloadRes.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuf);
  const originalFileName = `telegram-${Date.now()}.jpg`;

  const { uploadToR2 } = await import("@/lib/storage/r2");
  const r2Result = await uploadToR2(imageBuffer, targetFolder, originalFileName, "image/jpeg");

  const permanentUrl = r2Result.success && r2Result.url ? r2Result.url : tgUrl;
  const webpUrl = r2Result.webpUrl || permanentUrl;

  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const { data: media } = await db.from("media_library").insert({
    company_id: companyId,
    file_name: originalFileName,
    original_name: originalFileName,
    file_url: permanentUrl,
    cdn_url: permanentUrl,
    webp_url: webpUrl,
    mime_type: "image/jpeg",
    file_size: largestPhoto.file_size,
    width: largestPhoto.width,
    height: largestPhoto.height,
    storage_provider: "r2",
    storage_path: r2Result.key || `uploads/${originalFileName}`,
  }).select("id").single();

  if (media?.id) {
    await db.from("media_metadata").insert({
      media_id: media.id,
      alt_text_ar: "صورة مرفوعة عبر بوت تلجرام",
      caption_ar: msg.caption || "مرفوعات الوسائط",
    });
  }

  return {
    url: permanentUrl,
    webpUrl,
    mediaId: media?.id,
    width: largestPhoto.width,
    height: largestPhoto.height,
    fileSize: largestPhoto.file_size,
  };
}

export async function handlePhotoUpload(msg: TelegramMessage, targetFolder: "services" | "projects" | "gallery" | "advertisements" | "uploads" = "uploads") {
  const chatId = msg.chat.id;
  if (!msg.photo || msg.photo.length === 0) return;

  await sendMessage(chatId, `⏳ <b>جاري استلام الصورة ورفعها مباشرة إلى خادم Cloudflare R2 في مجلد [${targetFolder}]...</b>`);

  try {
    const res = await uploadTelegramPhotoToR2(msg, targetFolder);
    if (!res) {
      await sendMessage(chatId, `❌ تعذر تحميل أو رفع الصورة من خوادم التلجرام.`);
      return;
    }

    await sendMessage(
      chatId,
      `✅ <b>تم رفع الصورة بنجاح إلى Cloudflare R2!</b>\n\n📁 <b>المجلد:</b> <code>powerof/${targetFolder}/</code>\n📐 <b>الأبعاد:</b> ${res.width}x${res.height} px\n💾 <b>الحجم:</b> ${Math.round((res.fileSize || 0) / 1024)} KB\n🔗 <b>الرابط الدائم:</b>\n<code>${res.url}</code>\n\n🔔 <b>هل ترغب في إرسال إشعار فوري لعملاء تطبيق الأندرويد بهذه الصورة؟</b>`,
      { reply_markup: Keyboards.askPushPrompt("photo", res.mediaId || "photo-" + Date.now()) }
    );
  } catch (err: any) {
    console.error("Photo upload error:", err);
    await sendMessage(chatId, `❌ حدث خطأ أثناء معالجة ورفع الصورة: ${err?.message || "Unknown error"}`);
  }
}
