import { sendMessage, sendPhoto, type InlineKeyboard } from "./bot";
import { createDbClient } from "@/lib/db";

/**
 * Resolves the target Telegram Channel ID/Username from environment or database.
 */
export async function getChannelTarget(): Promise<string | null> {
  if (process.env.TELEGRAM_CHANNEL_ID && process.env.TELEGRAM_CHANNEL_ID.trim() !== "") {
    return process.env.TELEGRAM_CHANNEL_ID.trim();
  }

  const db = createDbClient();
  try {
    const { data: contact } = await db
      .from("company_contacts")
      .select("value")
      .eq("type", "telegram_channel")
      .single();
    if (contact?.value) return contact.value.trim();
  } catch {
    // Channel not set
  }

  return null;
}

/**
 * Builds base website and contact links.
 */
function getBaseSiteUrl(): string {
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";
}

// ─── Channel Publishers ───────────────────────────────────────────────

/**
 * Automatically formats and publishes a newly added Project to the Telegram Channel.
 */
export async function publishProjectToChannel(project: {
  title_ar: string;
  client_name?: string;
  city?: string;
  project_value?: number;
  cover_image_url?: string;
  slug?: string;
}) {
  const channelId = await getChannelTarget();
  if (!channelId) return { ok: false, reason: "Channel ID not configured" };

  const siteUrl = getBaseSiteUrl();
  const projectUrl = `${siteUrl}/projects/${project.slug || ""}`;

  const text = `🏛️ <b>مشروع جديد منجز | مؤسسة القوة العاشرة</b>

🏢 <b>المشروع:</b> ${project.title_ar}
📍 <b>الموقع:</b> ${project.city || "المملكة العربية السعودية"}
${project.client_name ? `👤 <b>الجهة/العميل:</b> ${project.client_name}\n` : ""}💎 <b>المواصفات الفنية:</b>
• زجاج سيكوريت عالي المقاومة ومعالج حرارياً.
• قطاعات ألمنيوم وكلادينج عازلة للصوت والحرارة.
• إشراف هندسي وتنفيذ وفق الكود السعودي.

🛡️ <i>ضمان شامل معتمد 10 سنوات على كافة الأعمال.</i>

📞 <b>للتواصل والاستفسار:</b> <code>0551234567</code>
🌐 <b>الموقع الرسمي:</b> ${siteUrl}

#واجهات_زجاج #زجاج_سيكوريت #ألمنيوم #كلادينج #مشاريع_السعودية`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: "🌐 تفاصيل المشروع بالموقع", url: projectUrl },
        { text: "💬 طلب مقايسة مماثلة", url: `https://wa.me/966551234567?text=${encodeURIComponent(`السلام عليكم، استفسر عن مشروع: ${project.title_ar}`)}` },
      ],
    ],
  };

  if (project.cover_image_url && !project.cover_image_url.startsWith("/")) {
    return sendPhoto(channelId as unknown as number, project.cover_image_url, text);
  } else {
    return sendMessage(channelId as unknown as number, text, { reply_markup: keyboard });
  }
}

/**
 * Automatically formats and publishes a Service card to the Telegram Channel.
 */
export async function publishServiceToChannel(service: {
  name_ar: string;
  short_description_ar?: string;
  price_from?: number;
  price_to?: number;
  slug?: string;
}) {
  const channelId = await getChannelTarget();
  if (!channelId) return { ok: false, reason: "Channel ID not configured" };

  const siteUrl = getBaseSiteUrl();
  const serviceUrl = `${siteUrl}/services/${service.slug || ""}`;

  const text = `🛠️ <b>خدماتنا الاحترافية | مؤسسة القوة العاشرة</b>

📌 <b>الخدمة:</b> ${service.name_ar}
${service.short_description_ar ? `📝 <b>نبذة:</b> ${service.short_description_ar}\n` : ""}${service.price_from ? `💰 <b>الأسعار تبدأ من:</b> ${service.price_from} ريال\n` : ""}
✨ <b>لماذا تختار القوة العاشرة؟</b>
• دقة وسرعة متناهية في التوريد والتركيب.
• تصاميم ثلاثية الأبعاد 3D للمعاينة قبل التنفيذ.
• ضمان معتمد ومتابعة دورية.

#خدمات_الزجاج #سيكوريت #ديكورات_زجاج #واجهات #السعودية`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: "🛠️ استعراض الخدمة والأسعار", url: serviceUrl },
        { text: "📞 طلب تسعير فوري", url: `${siteUrl}/quote` },
      ],
    ],
  };

  return sendMessage(channelId as unknown as number, text, { reply_markup: keyboard });
}

/**
 * Automatically formats and publishes an Advertisement or Offer to the Telegram Channel.
 */
export async function publishAdToChannel(ad: {
  title_ar: string;
  target_route?: string;
  media_url?: string;
}) {
  const channelId = await getChannelTarget();
  if (!channelId) return { ok: false, reason: "Channel ID not configured" };

  const siteUrl = getBaseSiteUrl();
  const targetUrl = ad.target_route?.startsWith("http") ? ad.target_route : `${siteUrl}${ad.target_route || ""}`;

  const text = `📢 <b>عرض خاص وحصري | مؤسسة القوة العاشرة</b>

⚡ <b>${ad.title_ar}</b>

استفد الآن من أفضل عروض وخصومات مقاولات الزجاج، السيكوريت، والكلادينج بأعلى مواصفات الجودة مع المعاينة المجانية.

📞 <b>للحجز والاستفسار المباشر:</b> <code>0551234567</code>
🌐 <b>رابط العرض:</b> ${targetUrl}

#عروض_خاصة #خصومات #مقاولات #زجاج #الرياض`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [{ text: "⚡ الاستفادة من العرض الآن", url: targetUrl }],
    ],
  };

  if (ad.media_url && !ad.media_url.startsWith("/")) {
    return sendPhoto(channelId as unknown as number, ad.media_url, text);
  } else {
    return sendMessage(channelId as unknown as number, text, { reply_markup: keyboard });
  }
}

/**
 * Automatically formats and publishes general broadcast notifications to the Telegram Channel.
 */
export async function publishNotificationToChannel(title: string, body: string, targetScreen?: string) {
  const channelId = await getChannelTarget();
  if (!channelId) return { ok: false, reason: "Channel ID not configured" };

  const siteUrl = getBaseSiteUrl();
  const targetUrl = targetScreen ? `${siteUrl}${targetScreen}` : siteUrl;

  const text = `🔔 <b>إعلان وتحديث رسمي | مؤسسة القوة العاشرة</b>

📌 <b>${title}</b>

${body}

🌐 <b>الموقع الرسمي:</b> ${siteUrl}`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [{ text: "🌐 تصفح التفاصيل بالموقع", url: targetUrl }],
    ],
  };

  return sendMessage(channelId as unknown as number, text, { reply_markup: keyboard });
}
