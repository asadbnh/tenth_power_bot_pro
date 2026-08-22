import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards, getFile, getTelegramFileUrl, type TelegramMessage } from "../bot";

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
    .select("id, slug, title_ar, is_active")
    .order("sort_order", { ascending: true });

  let text = `🖼️ <b>ألبومات معرض الصور (${albums?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (albums as Record<string, any>[] || []).forEach((a, idx) => {
    text += `${idx + 1}. 🖼️ <b>${a.title_ar}</b> (Slug: <code>${a.slug}</code>)\n`;
    inline_keyboard.push([
      { text: `🖼️ استعراض صور الألبوم`, callback_data: `alb_items:${a.id}` },
      { text: `🗑️ حذف الألبوم`, callback_data: `alb_delete:${a.id}` },
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للوسائط", callback_data: "menu_media" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleGalleryAlbumItems(chatId: number, albumId: string, messageId?: number) {
  const db = createDbClient();
  const { data: items } = await db
    .from("gallery_items")
    .select("id, title_ar, sort_order, is_featured")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  let text = `🖼️ <b>الصور داخل الألبوم (${items?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (items as Record<string, any>[] || []).forEach((it, idx) => {
    text += `${idx + 1}. 🖼️ <b>${it.title_ar || "صورة"}</b>\n`;
    inline_keyboard.push([
      { text: `🗑️ حذف الصورة رقم ${idx + 1}`, callback_data: `it_delete:${it.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع لقائمة الألبومات", callback_data: "med_gallery" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleGalleryItemDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("gallery_items").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف عنصر المعرض.`);
  await handleGalleryAlbumsList(chatId, messageId);
}

export async function handleGalleryAlbumDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("gallery_albums").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الألبوم بنجاح.`);
  await handleGalleryAlbumsList(chatId, messageId);
}

// ─── Direct Telegram Photo Message Listener ───────────────────────────

export async function handlePhotoUpload(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  if (!msg.photo || msg.photo.length === 0) return;

  const largestPhoto = msg.photo[msg.photo.length - 1];
  await sendMessage(chatId, `⏳ <b>جاري استلام ومعالجة الصورة وتسجيلها في مكتبة الوسائط...</b>`);

  try {
    const fileRes = await getFile(largestPhoto.file_id);
    if (!fileRes.ok || !fileRes.result?.file_path) {
      await sendMessage(chatId, `❌ تعذر تحميل الصورة من خوادم التلجرام.`);
      return;
    }

    const tgUrl = getTelegramFileUrl(fileRes.result.file_path);
    const fileName = `telegram-upload-${Date.now()}.jpg`;

    const db = createDbClient();
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    const { data: media } = await db.from("media_library").insert({
      company_id: companyId,
      file_name: fileName,
      original_name: fileName,
      file_url: tgUrl,
      cdn_url: tgUrl,
      webp_url: tgUrl,
      mime_type: "image/jpeg",
      file_size: largestPhoto.file_size,
      width: largestPhoto.width,
      height: largestPhoto.height,
      storage_provider: "telegram",
      storage_path: fileRes.result.file_path,
    }).select("id, file_url").single();

    if (media?.id) {
      await db.from("media_metadata").insert({
        media_id: media.id,
        alt_text_ar: "صورة جديدة من أعمال القوة العاشرة",
        alt_text_en: "Tenth Power project photo",
        caption_ar: "تم الرفع عبر لوحة تلجرام",
      });
    }

    await sendMessage(
      chatId,
      `✅ <b>تم رفع وتسجيل الصورة بنجاح!</b>\n\n🆔 <b>المعرّف:</b> <code>${media.id}</code>\n📐 <b>الأبعاد:</b> ${largestPhoto.width}x${largestPhoto.height}\n🔗 <b>الرابط:</b> <a href="${tgUrl}">عرض الصورة</a>\n\n🔔 <b>هل ترغب في إرسال إشعار فوري لعملاء التطبيق بهذه الصورة؟</b>`,
      { reply_markup: Keyboards.askPushPrompt("photo", media.id) }
    );
  } catch (err) {
    console.error("Photo upload handling error:", err);
    await sendMessage(chatId, `❌ حدث خطأ أثناء معالجة الصورة.`);
  }
}
