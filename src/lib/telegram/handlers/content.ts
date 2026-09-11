import { createDbClient } from "@/lib/db";
import { sendMessage, editMessage, Keyboards } from "../bot";
import { setAdminState } from "../state";

// ─── Services Handlers ────────────────────────────────────────────────

export async function handleServicesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: services } = await db
    .from("services")
    .select("id, slug, name_ar, is_active, is_featured, price_from, price_to, view_count")
    .order("sort_order", { ascending: true });

  if (!services || services.length === 0) {
    const emptyText = "🛠️ <b>كتالوج الخدمات</b>\n\nلا توجد خدمات مسجلة حالياً.";
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إضافة خدمة جديدة", callback_data: "srv_add_prompt" }],
        [{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `🛠️ <b>كتالوج الخدمات المسجلة (${services.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (services as Record<string, any>[]).forEach((s, idx) => {
    const statusIcon = s.is_active ? "🟢 مفعلة" : "🔴 معطلة";
    const starIcon = s.is_featured ? "⭐ مميزة" : "";
    text += `${idx + 1}. <b>${s.name_ar}</b> [${statusIcon} ${starIcon}]\n`;
    text += `   💰 السعر: <code>${s.price_from || "—"} - ${s.price_to || "—"} ريال</code> | 👁️ المشاهدات: <code>${s.view_count || 0}</code>\n\n`;

    inline_keyboard.push([
      { text: `⚙️ إدارة: ${s.name_ar.slice(0, 18)}`, callback_data: `srv_view:${s.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة خدمة جديدة", callback_data: "srv_add_prompt" },
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleServiceDetails(chatId: number, serviceId: string, messageId?: number) {
  const db = createDbClient();
  const { data: s } = await db.from("services").select("*").eq("id", serviceId).single();
  if (!s) {
    await sendMessage(chatId, "❌ لم يتم العثور على الخدمة.");
    return;
  }

  const { data: images } = await db.from("service_images").select("id, is_cover").eq("service_id", serviceId);

  const text = `🛠️ <b>تفاصيل الخدمة</b>

🏛️ <b>الاسم العربي:</b> ${s.name_ar}
🌐 <b>الاسم الإنجليزي:</b> ${s.name_en || "—"}
🔗 <b>المعرف (Slug):</b> <code>${s.slug}</code>
💰 <b>نطاق السعر:</b> ${s.price_from || "—"} إلى ${s.price_to || "—"} ريال / ${s.price_unit || "متر"}
🟢 <b>الحالة:</b> ${s.is_active ? "مفعلة وتظهر للزوار" : "معطلة ومخفية"}
⭐ <b>مميزة في الصفحة الرئيسية:</b> ${s.is_featured ? "نعم" : "لا"}
🖼️ <b>الصور الإضافية:</b> ${images?.length || 0} صورة
👁️ <b>عدد المشاهدات:</b> ${s.view_count || 0}

📝 <b>الوصف:</b>
${s.short_description_ar || s.full_description_ar || "لا يوجد وصف"}`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.serviceItemActions(s.id, s.is_active, s.is_featured));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.serviceItemActions(s.id, s.is_active, s.is_featured) });
}

export async function handleServiceToggleActive(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: s } = await db.from("services").select("is_active").eq("id", id).single();
  if (s) {
    await db.from("services").update({ is_active: !s.is_active }).eq("id", id);
    await handleServiceDetails(chatId, id, messageId);
  }
}

export async function handleServiceToggleFeatured(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: s } = await db.from("services").select("is_featured").eq("id", id).single();
  if (s) {
    await db.from("services").update({ is_featured: !s.is_featured }).eq("id", id);
    await handleServiceDetails(chatId, id, messageId);
  }
}

export async function handleServiceDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("services").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الخدمة بنجاح.`);
  await handleServicesList(chatId, messageId);
}

export async function handleServiceAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_service_name");
  await sendMessage(
    chatId,
    `➕ <b>إضافة خدمة جديدة — الخطوة 1/3</b>\n\nأرسل الآن <b>اسم الخدمة بالعربي</b> (مثال: زجاج سكريت ملون فاخر):`,
    { reply_markup: Keyboards.cancelWizard("cnt_services") }
  );
}

// ─── Projects Handlers ────────────────────────────────────────────────

export async function handleProjectsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: projects } = await db
    .from("projects")
    .select("id, title_ar, client_name, city, project_value, status, is_featured, is_active, view_count")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!projects || projects.length === 0) {
    const emptyText = "📁 <b>معرض المشاريع والأعمال</b>\n\nلا توجد مشاريع مسجلة حالياً في قاعدة البيانات.";
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إضافة مشروع جديد", callback_data: "prj_add_prompt" }],
        [{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `📁 <b>قائمة المشاريع المنفذة (${projects.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (projects as Record<string, any>[]).forEach((p, idx) => {
    const featured = p.is_featured ? "⭐ مميز" : "عادي";
    const status = p.is_active !== false ? "🟢 نشط" : "🔴 معطل";
    text += `${idx + 1}. [${status} | ${featured}] 🏢 <b>${p.title_ar}</b>\n`;
    text += `   📍 ${p.city || "الرياض"} | 👤 ${p.client_name || "عميل خاص"}\n`;
    text += `   💰 القيمة: <code>${p.project_value ? Number(p.project_value).toLocaleString("ar-SA") + " ر.س" : "—"}</code>\n\n`;

    inline_keyboard.push([
      { text: `⚙️ تفاصيل وتعديل: ${p.title_ar.slice(0, 18)}`, callback_data: `prj_view:${p.id}` },
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة مشروع جديد", callback_data: "prj_add_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleProjectDetails(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();

  const { data: p } = await db.from("projects").select("*").eq("id", id).single();
  if (!p) {
    await sendMessage(chatId, "❌ لم يتم العثور على المشروع المطلوب.");
    return;
  }

  // Count attached images & before/after items using db.from() — آمن في serverless
  const [{ count: imgCountRaw }, { count: baCountRaw }] = await Promise.all([
    db.from("project_images").select("*", { count: "exact", head: true }).eq("project_id", id),
    db.from("project_before_after").select("*", { count: "exact", head: true }).eq("project_id", id),
  ]);
  const imgCount = imgCountRaw ?? 0;
  const baCount = baCountRaw ?? 0;

  const featured = p.is_featured ? "⭐ نعم (يظهر في الرئيسية)" : "لا";
  const active = p.is_active !== false ? "🟢 نشط (معروض)" : "🔴 معطل (مخفي)";

  const text = `🏢 <b>تفاصيل وبيانات المشروع:</b>

🏷️ <b>الاسم العربي:</b> ${p.title_ar}
🌐 <b>الاسم الإنجليزي:</b> ${p.title_en || "—"}
🔗 <b>المعرف (Slug):</b> <code>${p.slug}</code>
👤 <b>العميل:</b> ${p.client_name || "عميل خاص"}
📍 <b>المدينة:</b> ${p.city || "الرياض"}
💰 <b>قيمة المشروع:</b> <code>${p.project_value ? Number(p.project_value).toLocaleString("ar-SA") + " ر.س" : "—"}</code>
🏗️ <b>حالة التنفيذ:</b> ${p.status || "completed"}
⭐ <b>مشروع مميز:</b> ${featured}
🟢 <b>حالة العرض:</b> ${active}
🖼️ <b>صورة الغلاف:</b> ${p.cover_image_url ? `<a href="${p.cover_image_url}">رابط الغلاف 🔗</a>` : "لا يوجد"}
📸 <b>معرض صور المشروع:</b> ${imgCount} صورة
🔄 <b>مقارنات قبل وبعد:</b> ${baCount} مقارنة

📝 <b>الوصف:</b>
${p.description_ar || "لا يوجد وصف مسجل."}`;

  const inline_keyboard = [
    [
      { text: "➕ إضافة صورة للمشروع", callback_data: `prj_add_photo:${p.id}` },
      { text: `🖼️ استعراض الصور (${imgCount})`, callback_data: `prj_items:${p.id}` },
    ],
    [
      { text: p.is_featured ? "⭐ إزالة من المميز" : "⭐ تعيين كمميز", callback_data: `prj_toggle_feat:${p.id}` },
      { text: p.is_active !== false ? "⏸️ إيقاف" : "▶️ تفعيل", callback_data: `prj_toggle_act:${p.id}` },
    ],
    [
      { text: "✏️ تعديل الاسم", callback_data: `prj_edit_title:${p.id}` },
      { text: "📍 تعديل المدينة", callback_data: `prj_edit_city:${p.id}` },
    ],
    [
      { text: "💰 تعديل القيمة", callback_data: `prj_edit_val:${p.id}` },
      { text: "👤 تعديل العميل", callback_data: `prj_edit_client:${p.id}` },
    ],
    [
      { text: "🖼️ تغيير صورة الغلاف", callback_data: `prj_edit_cover:${p.id}` },
      { text: "🗑️ حذف المشروع", callback_data: `prj_delete:${p.id}` },
    ],
    [
      { text: "◀️ رجوع لقائمة المشاريع", callback_data: "cnt_projects" },
    ],
  ];

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleProjectToggleFeatured(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: p } = await db.from("projects").select("is_featured").eq("id", id).single();
  if (p) {
    await db.from("projects").update({ is_featured: !p.is_featured }).eq("id", id);
    await handleProjectDetails(chatId, id, messageId);
  }
}

export async function handleProjectToggleActive(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: p } = await db.from("projects").select("is_active").eq("id", id).single();
  if (p) {
    const current = p.is_active !== false;
    await db.from("projects").update({ is_active: !current }).eq("id", id);
    await handleProjectDetails(chatId, id, messageId);
  }
}

export async function handleProjectItems(chatId: number, projectId: string, messageId?: number) {
  const db = createDbClient();
  const { data: project } = await db.from("projects").select("title_ar").eq("id", projectId).single();

  const { data: items } = await db
    .from("project_images")
    .select("id, project_id, media_id, is_cover, sort_order, created_at")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const rawItems = (items || []) as any[];
  const mediaIds = rawItems.map((pi: any) => pi.media_id).filter(Boolean);

  const mediaMap: Record<string, any> = {};
  if (mediaIds.length > 0) {
    const { data: mediaList } = await db
      .from("media_library")
      .select("id, file_url, cdn_url, file_name, original_name")
      .in("id", mediaIds);

    (mediaList || []).forEach((m: any) => {
      mediaMap[m.id] = m;
    });
  }

  const mappedItems = rawItems.map((pi: any) => {
    const m = mediaMap[pi.media_id];
    return {
      id: pi.id,
      project_id: pi.project_id,
      is_cover: Boolean(pi.is_cover),
      sort_order: pi.sort_order,
      created_at: pi.created_at,
      file_url: m?.file_url || "",
      cdn_url: m?.cdn_url || "",
      file_name: m?.original_name || m?.file_name || "صورة مشروع",
    };
  });

  const title = project?.title_ar || "المشروع";

  if (!mappedItems || mappedItems.length === 0) {
    const emptyText = `📸 <b>صور المشروع: ${title}</b>\n\nلا توجد صور مضافة لهذا المشروع حتى الآن.`;
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إضافة صورة الآن", callback_data: `prj_add_photo:${projectId}` }],
        [{ text: "◀️ رجوع لتفاصيل المشروع", callback_data: `prj_view:${projectId}` }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `📸 <b>صور المشروع: ${title} (${mappedItems.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  mappedItems.forEach((it: any, idx: number) => {
    const url = it.cdn_url || it.file_url;
    const coverBadge = it.is_cover ? "⭐ [غلاف رئيسي] | " : "";
    text += `${idx + 1}. ${coverBadge}<a href="${url}">صورة رقم ${idx + 1} 🔗</a>\n`;

    const rowButtons: any[] = [
      { text: `🗑️ حذف الصورة ${idx + 1}`, callback_data: `prj_img_del:${it.id}:${projectId}` },
    ];
    if (!it.is_cover) {
      rowButtons.unshift({
        text: `⭐ تعيين كغلاف`,
        callback_data: `prj_img_cover:${it.id}:${projectId}`,
      });
    }
    inline_keyboard.push(rowButtons);
  });

  inline_keyboard.push([
    { text: "➕ إضافة صورة جديدة للمشروع", callback_data: `prj_add_photo:${projectId}` }
  ]);
  inline_keyboard.push([
    { text: "◀️ رجوع لتفاصيل المشروع", callback_data: `prj_view:${projectId}` }
  ]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleProjectImageSetCover(chatId: number, imgId: string, projectId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("project_images").update({ is_cover: false }).eq("project_id", projectId);
  await db.from("project_images").update({ is_cover: true }).eq("id", imgId);

  const { data: img } = await db.from("project_images").select("media_id").eq("id", imgId).single();
  if (img?.media_id) {
    const { data: media } = await db.from("media_library").select("cdn_url, file_url").eq("id", img.media_id).single();
    const coverUrl = media?.cdn_url || media?.file_url;
    if (coverUrl) {
      await db.from("projects").update({ cover_image_url: coverUrl }).eq("id", projectId);
    }
  }

  await sendMessage(chatId, "⭐ <b>تم تعيين الصورة كغلاف رئيسي للمشروع بنجاح!</b>");
  await handleProjectItems(chatId, projectId, messageId);
}

export async function handleProjectImageDelete(chatId: number, imgId: string, projectId: string, messageId?: number) {
  const db = createDbClient();
  await db.from("project_images").delete().eq("id", imgId);
  await sendMessage(chatId, "🗑️ تم حذف الصورة من المشروع بنجاح.");
  await handleProjectItems(chatId, projectId, messageId);
}

export async function handleProjectDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("projects").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف المشروع وجميع صوره بنجاح.`);
  await handleProjectsList(chatId, messageId);
}

export async function handleProjectAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_project_title");
  await sendMessage(
    chatId,
    `➕ <b>إضافة مشروع جديد — الخطوة 1/4</b>\n\nأرسل الآن <b>عنوان أو اسم المشروع</b> (مثال: واجهات زجاجية لبرج الأعمال الحديث):`,
    { reply_markup: Keyboards.cancelWizard("cnt_projects") }
  );
}

// ─── Before & After Handlers ──────────────────────────────────────────

export async function handleBeforeAfterList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: list } = await db
    .from("project_before_after")
    .select("id, project_id, caption_ar, sort_order")
    .order("sort_order", { ascending: true });

  let text = `🔄 <b>مقارنات قبل وبعد (Before & After) (${list?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (list as Record<string, any>[] || []).forEach((item, idx) => {
    text += `${idx + 1}. 🔄 <b>${item.caption_ar || "مقارنة قبل وبعد"}</b>\n`;
    inline_keyboard.push([
      { text: `🗑️ حذف المقارنة رقم ${idx + 1}`, callback_data: `ba_delete:${item.id}` }
    ]);
  });

  inline_keyboard.push([{ text: "◀️ رجوع للمحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleBeforeAfterDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("project_before_after").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف عنصر المقارنة.`);
  await handleBeforeAfterList(chatId, messageId);
}

// ─── Advertisements Handlers ──────────────────────────────────────────

export async function handleAdsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: ads } = await db
    .from("advertisements")
    .select("id, title_ar, subtitle_ar, target_route, is_active, priority, media_type, media_url, action_title_ar")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (!ads || ads.length === 0) {
    const emptyText = "📢 <b>الإعلانات والعروض الترويجية</b>\n\nلا توجد إعلانات مسجلة حالياً في قاعدة البيانات.";
    const kb = {
      inline_keyboard: [
        [{ text: "➕ إضافة إعلان أو بانر جديد", callback_data: "ad_add_prompt" }],
        [{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `📢 <b>قائمة الإعلانات والبانرات الترويجية (${ads.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (ads as Record<string, any>[]).forEach((ad, idx) => {
    const status = ad.is_active ? "🟢 نشط" : "🔴 متوقف";
    text += `${idx + 1}. [${status}] <b>${ad.title_ar}</b> (أولوية: ${ad.priority ?? 0})\n`;
    if (ad.subtitle_ar) text += `   📝 <i>${ad.subtitle_ar}</i>\n`;
    text += `   🔗 التوجيه: <code>${ad.target_route || "/contact"}</code> | 🔘 الزر: <code>${ad.action_title_ar || "تواصل معنا"}</code>\n\n`;

    inline_keyboard.push([
      { text: `⚙️ تفاصيل وتعديل: ${ad.title_ar.slice(0, 16)}`, callback_data: `ad_view:${ad.id}` },
      { text: ad.is_active ? "⏸️ إيقاف" : "▶️ تفعيل", callback_data: `ad_toggle:${ad.id}` },
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة إعلان أو بانر جديد", callback_data: "ad_add_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleAdDetails(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: ad } = await db.from("advertisements").select("*").eq("id", id).single();
  if (!ad) {
    await sendMessage(chatId, "❌ لم يتم العثور على الإعلان المطلوب.");
    return;
  }

  const status = ad.is_active ? "🟢 نشط (يظهر في الموقع والتطبيق)" : "🔴 متوقف (معطل)";
  const startDate = ad.start_date ? new Date(ad.start_date).toLocaleDateString("ar-SA") : "الآن";
  const endDate = ad.end_date ? new Date(ad.end_date).toLocaleDateString("ar-SA") : "مستمر (دائم)";

  const text = `📢 <b>بيانات وتفاصيل الإعلان كاملة:</b>

🆔 <b>المعرف:</b> <code>${ad.id}</code>
📌 <b>العنوان الرئيسي:</b> ${ad.title_ar || "—"}
📝 <b>الوصف الفرعي:</b> ${ad.subtitle_ar || "—"}
🎞️ <b>نوع الوسائط:</b> <code>${ad.media_type || "image"}</code>
🖼️ <b>رابط الميديا:</b> ${ad.media_url ? `<code>${ad.media_url}</code>` : "<i>لا توجد صورة</i>"}
🔗 <b>مسار التوجيه (Target Route):</b> <code>${ad.target_route || "/contact"}</code>
🔘 <b>نص زر الإجراء (Action Title):</b> ${ad.action_title_ar || "تواصل معنا الآن"}
🔢 <b>ترتيب الأولوية (Priority):</b> <code>${ad.priority ?? 0}</code>
⚡ <b>حالة العرض:</b> ${status}
📅 <b>تاريخ البدء:</b> ${startDate} | <b>الانتهاء:</b> ${endDate}`;

  const kb = {
    inline_keyboard: [
      [
        { text: ad.is_active ? "⏸️ إيقاف الإعلان" : "▶️ تفعيل الإعلان", callback_data: `ad_toggle:${ad.id}` },
        { text: "✏️ تعديل العنوان", callback_data: `ad_edit_title:${ad.id}` },
      ],
      [
        { text: "📝 تعديل الوصف الفرعي", callback_data: `ad_edit_sub:${ad.id}` },
        { text: "🔗 تعديل رابط التوجيه", callback_data: `ad_edit_route:${ad.id}` },
      ],
      [
        { text: "🔘 تعديل نص الزر", callback_data: `ad_edit_btn:${ad.id}` },
        { text: "🔢 تعديل الأولوية", callback_data: `ad_edit_prio:${ad.id}` },
      ],
      [
        { text: "🖼️ تغيير الصورة / الميديا", callback_data: `ad_edit_media:${ad.id}` },
        { text: "🗑️ حذف الإعلان", callback_data: `ad_delete:${ad.id}` },
      ],
      [
        { text: "◀️ رجوع لقائمة الإعلانات", callback_data: "cnt_ads" },
      ],
    ],
  };

  if (messageId) await editMessage(chatId, messageId, text, kb);
  else await sendMessage(chatId, text, { reply_markup: kb });
}

export async function handleAdToggle(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: ad } = await db.from("advertisements").select("is_active").eq("id", id).single();
  if (ad) {
    await db.from("advertisements").update({ is_active: !ad.is_active, updated_at: new Date().toISOString() }).eq("id", id);
    await handleAdDetails(chatId, id, messageId);
  }
}

export async function handleAdDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("advertisements").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف الإعلان بنجاح.`);
  await handleAdsList(chatId, messageId);
}

export async function handleAdAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_ad_title");
  await sendMessage(
    chatId,
    `📢 <b>إضافة إعلان أو عرض ترويجي — (الخطوة 1 من 5)</b>\n\nأرسل الآن <b>العنوان الرئيسي للإعلان</b> (مثال: عروض نهاية العام على واجهات الزجاج):`,
    { reply_markup: Keyboards.cancelWizard("cnt_ads") }
  );
}

export async function handleAdEditPrompt(chatId: number, id: string, field: "title" | "sub" | "route" | "btn" | "prio" | "media") {
  const fieldNames: Record<string, string> = {
    title: "العنوان الرئيسي",
    sub: "الوصف الفرعي",
    route: "رابط ومسار التوجيه",
    btn: "نص زر الإجراء",
    prio: "ترتيب الأولوية",
    media: "الصورة / رابط الميديا",
  };

  setAdminState(chatId, `awaiting_ad_edit_${field}`, { adId: id });

  let prompt = `✏️ <b>تعديل ${fieldNames[field]} للإعلان</b>\n\n`;
  if (field === "media") {
    prompt += `📷 <b>أرسل صورة مباشرة في الدردشة</b> لرفعها وتحديث صورة الإعلان، أو أرسل <b>رابط صورة خارجي</b>:`;
  } else if (field === "prio") {
    prompt += `🔢 أرسل رقم الأولوية الجديد (مثال: 1 أو 5 أو 10):`;
  } else if (field === "route") {
    prompt += `🔗 أرسل الرابط أو المسار الجديد (مثال: <code>/services/glass-facades</code> أو <code>/quote</code> أو رابط خارجي):`;
  } else if (field === "btn") {
    prompt += `🔘 أرسل نص الزر الجديد (مثال: <code>احجز موعد معاينة</code> أو <code>تواصل عبر واتساب</code>):`;
  } else {
    prompt += `أرسل القيمة الجديدة الآن:`;
  }

  await sendMessage(chatId, prompt, { reply_markup: Keyboards.cancelWizard(`ad_view:${id}`) });
}

// ─── Categories Handlers ──────────────────────────────────────────────

export async function handleCategoriesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: cats } = await db
    .from("categories")
    .select("id, name_ar, slug, is_active, sort_order")
    .order("sort_order", { ascending: true });

  let text = `📂 <b>التصنيفات الرئيسية (${cats?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (cats as Record<string, any>[] || []).forEach((c, idx) => {
    text += `${idx + 1}. 📂 <b>${c.name_ar}</b> (Slug: <code>${c.slug}</code>)\n`;
    inline_keyboard.push([
      { text: `🗑️ حذف التصنيف: ${c.name_ar}`, callback_data: `cat_delete:${c.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة تصنيف جديد", callback_data: "cat_add_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleCategoryDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("categories").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف التصنيف.`);
  await handleCategoriesList(chatId, messageId);
}

export async function handleCategoryAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_category_name");
  await sendMessage(
    chatId,
    `📂 <b>إضافة تصنيف جديد</b>\n\nأرسل الآن <b>اسم التصنيف</b> (مثال: أعمال الألمنيوم والكلادينج):`,
    { reply_markup: Keyboards.cancelWizard("cnt_categories") }
  );
}

// ─── Articles & AI Generator Handlers ─────────────────────────────────

export async function handleArticlesList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: articles } = await db
    .from("articles")
    .select("id, title_ar, slug, status, view_count, read_time_minutes")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!articles || articles.length === 0) {
    const emptyText = "✍️ <b>المقالات والمدونة</b>\n\nلا توجد مقالات مسجلة حالياً.";
    const kb = {
      inline_keyboard: [
        [{ text: "🤖 توليد مقال بالذكاء الاصطناعي", callback_data: "cnt_ai_article" }],
        [{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }],
      ],
    };
    if (messageId) await editMessage(chatId, messageId, emptyText, kb);
    else await sendMessage(chatId, emptyText, { reply_markup: kb });
    return;
  }

  let text = `✍️ <b>أحدث المقالات والأخبار (${articles.length}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (articles as Record<string, any>[]).forEach((a, idx) => {
    const statusIcon = a.status === "published" ? "🟢 منشور" : a.status === "review" ? "⏳ مراجعة" : "📝 مسودة";
    text += `${idx + 1}. [${statusIcon}] <b>${a.title_ar}</b>\n`;
    text += `   👁️ ${a.view_count || 0} مشاهدة | ⏱️ ${a.read_time_minutes || 3} دقيقة\n\n`;

    inline_keyboard.push([
      { text: `⚙️ إدارة: ${a.title_ar.slice(0, 18)}`, callback_data: `art_view:${a.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "🤖 توليد مقال فوري بالذكاء الاصطناعي", callback_data: "cnt_ai_article" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleArticleDetails(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: a } = await db.from("articles").select("*").eq("id", id).single();
  if (!a) {
    await sendMessage(chatId, "❌ لم يتم العثور على المقال.");
    return;
  }

  // ✅ الحقل الصحيح في جدول article_tags هو tag_ar وليس tag
  const { data: tags } = await db.from("article_tags").select("tag_ar").eq("article_id", id);
  const tagList = tags?.map((t: any) => `#${t.tag_ar}`).join(" ") || "—";

  const text = `✍️ <b>تفاصيل المقال</b>

📰 <b>العنوان:</b> ${a.title_ar}
🔗 <b>الرابط:</b> <code>/blog/${a.slug}</code>
📊 <b>الحالة:</b> <b>${a.status}</b>
🏷️ <b>الوسوم:</b> ${tagList}
⏱️ <b>وقت القراءة:</b> ${a.read_time_minutes || 3} دقائق
👁️ <b>المشاهدات:</b> ${a.view_count || 0}

📝 <b>الملخص:</b>
${a.excerpt_ar || "لا يوجد ملخص"}`;

  if (messageId) await editMessage(chatId, messageId, text, Keyboards.articleItemActions(a.id, a.status));
  else await sendMessage(chatId, text, { reply_markup: Keyboards.articleItemActions(a.id, a.status) });
}

export async function handleArticleTogglePublish(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  const { data: a } = await db.from("articles").select("status").eq("id", id).single();
  if (a) {
    const newStatus = a.status === "published" ? "draft" : "published";
    await db.from("articles").update({ status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : null }).eq("id", id);
    await handleArticleDetails(chatId, id, messageId);
  }
}

export async function handleArticleDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("articles").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف المقال.`);
  await handleArticlesList(chatId, messageId);
}

export async function handleArticleAiPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_article_ai_topic");
  await sendMessage(
    chatId,
    `🤖 <b>توليد مقال احترافي بالذكاء الاصطناعي (Gemini AI)</b>\n\nأرسل الآن <b>عنوان أو موضوع المقال</b> (مثال: أحدث تصاميم واجهات الزجاج الذكي للفلل والمباني الحديثة):`,
    { reply_markup: Keyboards.cancelWizard("cnt_articles") }
  );
}

export async function handleArticleAiGenerate(chatId: number, topic: string) {
  await sendMessage(chatId, `⏳ <b>جاري كتابة وتوليد المقال بالذكاء الاصطناعي وتحسينه لـ SEO...</b>`);
  const db = createDbClient();

  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  let title = `دليل شامل عن ${topic} — القوة العاشرة`;
  let excerpt = `تعرف على أهم النصائح والمواصفات الفنية المتعلقة بـ ${topic} وكيفية اختيار الخامات الأنسب لمشروعك مع الضمان.`;
  let content = `<h3>مقدمة عن ${topic}</h3><p>تعتبر أعمال الزجاج والألمنيوم من أهم العناصر في تصميم المباني الحديثة والواجهات المعمارية.</p><h3>المميزات والمواصفات</h3><ul><li>زجاج سكريت مقوى مقاوم للصدمات.</li><li>قطاعات ألمنيوم معزولة حرارياً.</li><li>ضمان شامل 10 سنوات.</li></ul>`;

  if (apiKey && apiKey !== "your_gemini_api_key") {
    try {
      const prompt = `أنت كاتب مقالات SEO محترف لشركة مقاولات وزجاج ألمنيوم (القوة العاشرة). اكتب مقالاً غنياً عن: "${topic}". أعد الناتج فقط كـ JSON:\n{"title":"العنوان المحسن لـ SEO","excerpt":"ملخص المقال","content":"المحتوى بتنسيق HTML (<h3>, <p>, <ul>, <li>)"}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2000 } }),
      });
      if (res.ok) {
        const raw = await res.json();
        const jsonText = raw.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.title) title = parsed.title;
          if (parsed.excerpt) excerpt = parsed.excerpt;
          if (parsed.content) content = parsed.content;
        }
      }
    } catch (e) {
      console.error("Gemini AI telegram article generation error:", e);
    }
  }

  const slug = topic
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50) + "-" + Date.now().toString().slice(-4);

  const { data: art } = await db.from("articles").insert({
    company_id: companyId,
    title_ar: title,
    title_en: title,
    slug,
    excerpt_ar: excerpt,
    excerpt_en: excerpt,
    content_ar: content,
    content_en: content,
    cover_image_url: "/images/defaults/blog/types-of-tempered-glass.webp",
    status: "published",
    read_time_minutes: 4,
    published_at: new Date().toISOString(),
  }).select("id").single();

  if (art?.id) {
    await db.from("article_tags").insert([
      { article_id: art.id, tag: "مقاولات" },
      { article_id: art.id, tag: "زجاج_سكريت" },
    ]);
  }

  await sendMessage(
    chatId,
    `🎉 <b>تم توليد ونشر المقال بنجاح!</b>\n\n📰 <b>العنوان:</b> ${title}\n🔗 <b>الرابط:</b> <code>/blog/${slug}</code>\n\n🟢 تم نشر المقال مباشرة على الموقع.`,
    { reply_markup: Keyboards.backToSubmenu("cnt_articles") }
  );
}

// ─── FAQs Handlers ────────────────────────────────────────────────────

export async function handleFaqsList(chatId: number, messageId?: number) {
  const db = createDbClient();
  const { data: faqs } = await db
    .from("faqs")
    .select("id, question_ar, answer_ar, is_active")
    .order("sort_order", { ascending: true })
    .limit(10);

  let text = `❓ <b>الأسئلة الشائعة (${faqs?.length ?? 0}):</b>\n\n`;
  const inline_keyboard: any[][] = [];

  (faqs as Record<string, any>[] || []).forEach((f, idx) => {
    text += `${idx + 1}. ❓ <b>${f.question_ar}</b>\n`;
    text += `   💡 <i>${(f.answer_ar || "").slice(0, 70)}...</i>\n\n`;

    inline_keyboard.push([
      { text: `🗑️ حذف السؤال رقم ${idx + 1}`, callback_data: `faq_delete:${f.id}` }
    ]);
  });

  inline_keyboard.push([
    { text: "➕ إضافة سؤال وجواب جديد", callback_data: "faq_add_prompt" }
  ]);
  inline_keyboard.push([{ text: "◀️ رجوع لقائمة المحتوى", callback_data: "menu_content" }]);

  if (messageId) await editMessage(chatId, messageId, text, { inline_keyboard });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard } });
}

export async function handleFaqDelete(chatId: number, id: string, messageId?: number) {
  const db = createDbClient();
  await db.from("faqs").delete().eq("id", id);
  await sendMessage(chatId, `🗑️ تم حذف السؤال بنجاح.`);
  await handleFaqsList(chatId, messageId);
}

export async function handleFaqAddPrompt(chatId: number) {
  setAdminState(chatId, "awaiting_faq_question");
  await sendMessage(
    chatId,
    `➕ <b>إضافة سؤال شائع جديد — الخطوة 1/2</b>\n\nأرسل الآن <b>نص السؤال</b>:`,
    { reply_markup: Keyboards.cancelWizard("cnt_faqs") }
  );
}
