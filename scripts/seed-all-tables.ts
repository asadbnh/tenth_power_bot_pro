import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import { uploadToR2, type R2MediaFolder } from "../src/lib/storage/r2";

// ════════════════════════════════════════════════════════════════════
// ⚙️ إعدادات وبيانات التواصل وروابط الحسابات (يمكنك تعديلها هنا مباشرة)
// ════════════════════════════════════════════════════════════════════
export const COMPANY_CONFIG = {
  slug: "tenth-power-glass",
  name_ar: "مؤسسة القوة العاشرة للزجاج والألمنيوم والمقاولات",
  name_en: "Tenth Power Glass & Aluminum Contracting",
  description_ar: "المؤسسة الرائدة في المملكة العربية السعودية المتخصصة في تنفيذ أعمال الزجاج السكريت المقوى، الواجهات الزجاجية الكرتن وول والسبايدر، قطاعات الألمنيوم المعزولة، والمطابخ العصرية بأعلى معايير الجودة والضمان الشامل 10 سنوات.",
  description_en: "Leading Saudi enterprise specializing in high-grade tempered glass, glass facades, curtain wall & spider systems, thermal-break aluminum profiles, and modern kitchens with full 10-year warranty.",
  phone_primary: "+966532438253",
  phone_secondary: "+966532438253",
  whatsapp_number: "966532438253",
  email: "info@powerof10.sa",
  website_url: "https://powerof10.netlify.app",
  tax_number: "310000000000003",
  commercial_register: "1010000000",
  social: {
    instagram: "https://instagram.com/tenthpowerglass",
    snapchat: "https://snapchat.com/add/tenthpowerglass",
    tiktok: "https://tiktok.com/@tenthpowerglass",
    telegram_bot: "https://t.me/tenthpower_bot",
    telegram_channel: "https://t.me/TenthPowerSA",
   
  },
  address: {
    city_ar: "الرياض",
    city_en: "Riyadh",
    street_ar: "طريق الملك فهد، حي الصحافة",
    street_en: "King Fahd Road, Al Sahafah District",
    region_ar: "منطقة الرياض",
    region_en: "Riyadh Region",
    postal_code: "13315",
    latitude: 24.774265,
    longitude: 46.738586,
    google_maps_url: "https://maps.google.com/?q=24.774265,46.738586",
  },
};

const R2_PUBLIC_BASE = (
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN ||
  "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev"
).replace(/\/$/, "");

/**
 * Reads a local image from /public, uploads it to Cloudflare R2, and returns the CDN URL.
 */
async function getOrUploadR2Image(
  localRelPath: string,
  folder: R2MediaFolder = "uploads"
): Promise<{ url: string; webpUrl: string; key: string; size: number }> {
  try {
    const cleanPath = localRelPath.replace(/^\//, "");
    const localFullPath = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localFullPath)) {
      const buf = fs.readFileSync(localFullPath);
      const fileName = path.basename(localFullPath);
      const res = await uploadToR2(buf, folder, fileName, "image/webp");
      if (res.success && res.url) {
        return {
          url: res.url,
          webpUrl: res.webpUrl || res.url,
          key: res.key,
          size: buf.length,
        };
      }
    }
  } catch (err) {
    console.warn(`[R2 Notice] Fallback for ${localRelPath}:`, err);
  }

  const fallbackKey = `${folder}/${path.basename(localRelPath)}`;
  const fallbackUrl = `${R2_PUBLIC_BASE}/${fallbackKey}`;
  return {
    url: fallbackUrl,
    webpUrl: fallbackUrl,
    key: fallbackKey,
    size: 125000,
  };
}

/**
 * Comprehensive Database Seeder for WebTaky (Neon PostgreSQL + Cloudflare R2)
 * Uploads all images directly to Cloudflare R2 bucket and populates all 40 tables.
 */
async function seedAllTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("🚀 Starting Comprehensive Seeding with Cloudflare R2 Image Uploads...\n");

  // ════════════════════════════════════════════════════════════════════
  // 1. Upload Base Logo / Media to Cloudflare R2
  // ════════════════════════════════════════════════════════════════════
  console.log("☁️ Uploading brand assets to Cloudflare R2...");
  const logoUpload = await getOrUploadR2Image("/images/defaults/services/luxury-facade.webp", "services");

  // ════════════════════════════════════════════════════════════════════
  // 2. Company Profile
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣ Seeding 'companies' table...");
  const companyRows = await sql`
    INSERT INTO companies (
      slug, name_ar, name_en, description_ar, description_en,
      logo_url, favicon_url, primary_color, secondary_color, accent_color,
      whatsapp_number, phone_primary, phone_secondary, email, website_url,
      tax_number, commercial_register, maintenance_mode,
      social_links, theme_config, default_locale, supported_locales
    ) VALUES (
      ${COMPANY_CONFIG.slug},
      ${COMPANY_CONFIG.name_ar},
      ${COMPANY_CONFIG.name_en},
      ${COMPANY_CONFIG.description_ar},
      ${COMPANY_CONFIG.description_en},
      ${logoUpload.url},
      '/favicon.ico',
      '#1e3a8a',
      '#0d9488',
      '#f59e0b',
      ${COMPANY_CONFIG.whatsapp_number},
      ${COMPANY_CONFIG.phone_primary},
      ${COMPANY_CONFIG.phone_secondary},
      ${COMPANY_CONFIG.email},
      ${COMPANY_CONFIG.website_url},
      ${COMPANY_CONFIG.tax_number},
      ${COMPANY_CONFIG.commercial_register},
      false,
      ${JSON.stringify(COMPANY_CONFIG.social)},
      ${JSON.stringify({ dark_mode_enabled: true, border_radius: "12px", font_family: "Cairo" })},
      'ar',
      ${["ar", "en"]}
    )
    ON CONFLICT (slug) DO UPDATE SET
      name_ar = EXCLUDED.name_ar,
      social_links = EXCLUDED.social_links
    RETURNING id;
  `;
  const companyId = companyRows[0].id;
  console.log(`   ✓ Company ID: ${companyId}`);

  // ════════════════════════════════════════════════════════════════════
  // 3. Company Contacts (Social & Direct channels)
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣ Seeding 'company_contacts' table...");
  await sql`DELETE FROM company_contacts WHERE company_id = ${companyId};`;
  const contacts = [
    { type: "whatsapp", value: COMPANY_CONFIG.whatsapp_number, label_ar: "واتساب الإدارة", label_en: "Official WhatsApp", order: 1, is_primary: true },
    { type: "phone", value: COMPANY_CONFIG.phone_primary, label_ar: "هاتف المبيعات", label_en: "Sales Phone", order: 2, is_primary: true },
    { type: "instagram", value: COMPANY_CONFIG.social.instagram, label_ar: "انستقرام", label_en: "Instagram", order: 3, is_primary: false },
    { type: "snapchat", value: COMPANY_CONFIG.social.snapchat, label_ar: "سناب شات", label_en: "Snapchat", order: 4, is_primary: false },
    { type: "tiktok", value: COMPANY_CONFIG.social.tiktok, label_ar: "تيك توك", label_en: "TikTok", order: 5, is_primary: false },
    { type: "telegram", value: COMPANY_CONFIG.social.telegram_bot, label_ar: "حساب تلجرام", label_en: "Telegram Account", order: 6, is_primary: false },
    { type: "telegram_channel", value: COMPANY_CONFIG.social.telegram_channel, label_ar: "قناة تلجرام", label_en: "Telegram Channel", order: 7, is_primary: false },
  ];
  for (const c of contacts) {
    await sql`
      INSERT INTO company_contacts (company_id, type, value, label_ar, label_en, sort_order, is_primary)
      VALUES (${companyId}, ${c.type}, ${c.value}, ${c.label_ar}, ${c.label_en}, ${c.order}, ${c.is_primary});
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 4. Company Settings
  // ════════════════════════════════════════════════════════════════════
  console.log("3️⃣ Seeding 'company_settings' table...");
  const settingsList = [
    { key: "general_settings", category: "general", value: { site_live: true, brand: "Powerof10" } },
    { key: "social_channels", category: "social", value: { instagram: "@tenthpowerglass", snapchat: "tenthpowerglass", tiktok: "@tenthpowerglass", telegram_channel: "@TenthPowerSA" } },
    { key: "notification_prefs", category: "alerts", value: { notify_telegram: true, notify_email: true } }
  ];
  for (const s of settingsList) {
    await sql`
      INSERT INTO company_settings (company_id, key, value, category)
      VALUES (${companyId}, ${s.key}, ${JSON.stringify(s.value)}, ${s.category})
      ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value;
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 5. Business Hours
  // ════════════════════════════════════════════════════════════════════
  console.log("4️⃣ Seeding 'business_hours' table...");
  for (let day = 0; day <= 6; day++) {
    const isFriday = day === 5;
    await sql`
      INSERT INTO business_hours (company_id, day_of_week, open_time, close_time, is_closed, note_ar, note_en)
      VALUES (
        ${companyId},
        ${day},
        ${isFriday ? null : "08:00:00"},
        ${isFriday ? null : "18:00:00"},
        ${isFriday},
        ${isFriday ? "عطلة نهاية الأسبوع" : "دوام رسمي"},
        ${isFriday ? "Weekend Off" : "Working Hours"}
      )
      ON CONFLICT (company_id, day_of_week) DO UPDATE SET is_closed = EXCLUDED.is_closed;
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 6. Company Addresses
  // ════════════════════════════════════════════════════════════════════
  console.log("5️⃣ Seeding 'company_addresses' table...");
  await sql`DELETE FROM company_addresses WHERE company_id = ${companyId};`;
  await sql`
    INSERT INTO company_addresses (
      company_id, label_ar, label_en, street_ar, street_en,
      city_ar, city_en, region_ar, region_en, postal_code, country,
      latitude, longitude, google_maps_url, is_primary
    ) VALUES (
      ${companyId}, 'المقر الرئيسي - الرياض', 'Headquarters - Riyadh',
      ${COMPANY_CONFIG.address.street_ar}, ${COMPANY_CONFIG.address.street_en},
      ${COMPANY_CONFIG.address.city_ar}, ${COMPANY_CONFIG.address.city_en},
      ${COMPANY_CONFIG.address.region_ar}, ${COMPANY_CONFIG.address.region_en},
      ${COMPANY_CONFIG.address.postal_code}, 'SA',
      ${COMPANY_CONFIG.address.latitude}, ${COMPANY_CONFIG.address.longitude},
      ${COMPANY_CONFIG.address.google_maps_url}, true
    );
  `;

  // ════════════════════════════════════════════════════════════════════
  // 7. Telegram Admins
  // ════════════════════════════════════════════════════════════════════
  console.log("6️⃣ Seeding 'telegram_admins' table...");
  await sql`
    INSERT INTO telegram_admins (company_id, telegram_user_id, telegram_username, role, is_active)
    VALUES (${companyId}, 5887234832, 'admin_powerof10', 'super_admin', true)
    ON CONFLICT (company_id, telegram_user_id) DO UPDATE SET is_active = true;
  `;

  // ════════════════════════════════════════════════════════════════════
  // 8. Upload Sample Images to Cloudflare R2 & Seed Media Library
  // ════════════════════════════════════════════════════════════════════
  console.log("7️⃣ Uploading media assets to Cloudflare R2 and seeding 'media_library'...");
  const rawImages = [
    { file: "tempered-glass.webp", title: "زجاج سكريت مقوى عالي الشفافية", path: "/images/defaults/services/tempered-glass.webp", folder: "services" as const },
    { file: "glass-facades.webp", title: "واجهات زجاجية كرتن وول", path: "/images/defaults/services/glass-facades.webp", folder: "services" as const },
    { file: "aluminum-works.webp", title: "قطاعات ألمنيوم معزولة حرارياً", path: "/images/defaults/services/aluminum-works.webp", folder: "services" as const },
    { file: "kitchens.webp", title: "مطابخ ألمنيوم عصرية", path: "/images/defaults/services/kitchens.webp", folder: "services" as const },
    { file: "luxury-facade.webp", title: "واجهة معمارية فاخرة", path: "/images/defaults/services/luxury-facade.webp", folder: "services" as const },
    { file: "project-1.webp", title: "تنفيذ برج تجاري بالرياض", path: "/images/defaults/projects/project-1.webp", folder: "projects" as const },
    { file: "project-1-before.webp", title: "المشروع قبل التنفيذ", path: "/images/defaults/projects/project-1-before.webp", folder: "projects" as const },
    { file: "project-1-after.webp", title: "المشروع بعد التنفيذ", path: "/images/defaults/projects/project-1-after.webp", folder: "projects" as const },
    { file: "cafe-before.webp", title: "كافيه قبل التطوير", path: "/images/defaults/projects/cafe-before.webp", folder: "projects" as const },
    { file: "cafe-after.webp", title: "كافيه بعد واجهات الزجاج", path: "/images/defaults/projects/cafe-after.webp", folder: "projects" as const },
  ];

  const mediaMap: Record<string, { id: string; url: string; webpUrl: string }> = {};
  for (const img of rawImages) {
    const uploaded = await getOrUploadR2Image(img.path, img.folder);
    const rows = await sql`
      INSERT INTO media_library (
        company_id, file_name, original_name, file_url, cdn_url, webp_url,
        mime_type, file_size, width, height, storage_provider, storage_path
      ) VALUES (
        ${companyId}, ${img.file}, ${img.file}, ${uploaded.url}, ${uploaded.url}, ${uploaded.webpUrl},
        'image/webp', ${uploaded.size}, 1920, 1080, 'r2', ${uploaded.key}
      )
      RETURNING id;
    `;
    const mId = rows[0].id;
    mediaMap[img.file] = { id: mId, url: uploaded.url, webpUrl: uploaded.webpUrl };

    await sql`
      INSERT INTO media_metadata (media_id, title_ar, title_en, alt_ar, alt_en, caption_ar, caption_en)
      VALUES (${mId}, ${img.title}, ${img.file}, ${img.title}, ${img.file}, ${img.title}, ${img.file});
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 9. Categories
  // ════════════════════════════════════════════════════════════════════
  console.log("8️⃣ Seeding 'categories' table...");
  const categoriesData = [
    { slug: "glass-works", name_ar: "أعمال الزجاج والسكريت", name_en: "Glass & Tempered Works", icon: "Shield", imgFile: "tempered-glass.webp" },
    { slug: "facades", name_ar: "الواجهات المعمارية", name_en: "Architectural Facades", icon: "Building", imgFile: "glass-facades.webp" },
    { slug: "aluminum", name_ar: "قطاعات الألمنيوم", name_en: "Aluminum Profiles", icon: "Layers", imgFile: "aluminum-works.webp" },
    { slug: "kitchens", name_ar: "المطابخ والخزائن", name_en: "Modern Kitchens", icon: "Utensils", imgFile: "kitchens.webp" },
  ];
  const categoryMap: Record<string, string> = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const c = categoriesData[i];
    const imgUrl = mediaMap[c.imgFile]?.url || `${R2_PUBLIC_BASE}/services/${c.imgFile}`;
    const catRows = await sql`
      INSERT INTO categories (
        company_id, slug, name_ar, name_en, description_ar, description_en,
        icon, image_url, sort_order, is_active
      ) VALUES (
        ${companyId}, ${c.slug}, ${c.name_ar}, ${c.name_en}, ${c.name_ar}, ${c.name_en},
        ${c.icon}, ${imgUrl}, ${i + 1}, true
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
      RETURNING id;
    `;
    categoryMap[c.slug] = catRows[0].id;
  }

  // ════════════════════════════════════════════════════════════════════
  // 10. Services & Service Images
  // ════════════════════════════════════════════════════════════════════
  console.log("9️⃣ Seeding 'services' & 'service_images' tables...");
  const servicesList = [
    {
      slug: "tempered-glass",
      catSlug: "glass-works",
      name_ar: "زجاج سكريت مقوى",
      name_en: "Tempered Securit Glass",
      short_ar: "تنفيذ أبواب وواجهات وقواطع الزجاج السيكوريت المقاوم للصدمات بسماكات 10-12 ملم.",
      short_en: "Execution of impact-resistant tempered glass doors, partitions and facades with 10-12mm thickness.",
      full_ar: "نقدم حلول الزجاج السيكوريت المعالج حرارياً بأعلى معايير الأمان ومقاومة الصدمات والحرارة العالية مع إكسسوارات ستانلس ستيل 304 المقاومة للصدأ وضمان شامل لمدة 10 سنوات.",
      full_en: "We offer thermally tempered securit glass solutions with maximum safety and heat resistance with stainless steel 304 accessories and 10-year warranty.",
      icon: "Shield",
      imgFile: "tempered-glass.webp",
      price_from: 250,
      price_to: 450,
      features_ar: ["سماكات 10 ملم و 12 ملم", "إكسسوارات ستانلس 304 أصلية", "مقاوم للكسر والصدمات", "ضمان 10 سنوات"],
      features_en: ["10mm and 12mm thickness", "Original 304 stainless accessories", "Impact resistant", "10-year warranty"],
    },
    {
      slug: "glass-facades",
      catSlug: "facades",
      name_ar: "واجهات زجاجية (Curtain Wall & Spider)",
      name_en: "Structural Glass Facades",
      short_ar: "واجهات كرتن وول وسبايدر واستركشر للمباني والأبراج التجارية والفلل المودرن.",
      short_en: "Curtain wall and spider structural glass facades for commercial towers and luxury modern villas.",
      full_ar: "تصميم وتنفيذ الواجهات الزجاجية الهيكلية كرتن وول وأنظمة السبايدر بأحدث التقنيات الهندسية وعزل حراري وصوتي فائق معتمد لدى كود البناء السعودي.",
      full_en: "Design and execution of curtain wall structural facades and spider systems with high thermal & acoustic insulation.",
      icon: "Building",
      imgFile: "glass-facades.webp",
      price_from: 450,
      price_to: 850,
      features_ar: ["زجاج دبل معزول غاز الأرجون", "عزل حراري وصوتي 100%", "مقاوم للرياح والضغط", "إشراف هندسي معتمد"],
      features_en: ["Double glazed with Argon gas", "100% sound & heat proof", "Wind & pressure resistant", "Certified engineering"],
    },
    {
      slug: "aluminum-profiles",
      catSlug: "aluminum",
      name_ar: "قطاعات ألمنيوم معزولة حرارياً",
      name_en: "Thermal-Break Aluminum Works",
      short_ar: "أبواب ونوافذ ألمنيوم سرايا وجامبو معزولة حرارياً بأحدث الألوان والطلاءات.",
      short_en: "Thermal-break aluminum Saraya and Jumbo doors & windows with high weather resistance.",
      full_ar: "تنفيذ قطاعات الألمنيوم المعزولة حرارياً (Thermal Break) بأجود أنواع الألمنيوم والدهانات المقاومة للعوامل الجوية وأشعة الشمس مع كفرات وإكسسوارات إيطالية.",
      full_en: "High-grade thermal break aluminum profiles with Italian hardware and powder coating resistant to harsh weather.",
      icon: "Layers",
      imgFile: "aluminum-works.webp",
      price_from: 350,
      price_to: 650,
      features_ar: ["عزل حراري بنظام الجوان المطاطي", "قطاعات جامبو وسرايا", "إكسسوارات إيطالية أصلية", "ألوان متعددة وبودرة كهربائية"],
      features_en: ["Thermal break with EPDM gaskets", "Jumbo and Saraya profiles", "Original Italian hardware", "Powder coated colors"],
    },
    {
      slug: "modern-kitchens",
      catSlug: "kitchens",
      name_ar: "مطابخ ألمنيوم وكلادينج عصرية",
      name_en: "Modern Aluminum & Cladding Kitchens",
      short_ar: "تصميم وتفصيل مطابخ ألمنيوم وكلادينج وخزائن مدمجة مقاومة للمياه والبكتيريا.",
      short_en: "Design and custom fabrication of water-resistant cladding aluminum kitchens and built-in cabinets.",
      full_ar: "أحدث تصاميم المطابخ والخزائن العصرية المقاومة للمياه والرطوبة والحرارة مع مفصلات هايدروليك ناعمة الإغلاق وضمان استبدال.",
      full_en: "Modern aluminum and cladding kitchens resistant to moisture and heat with soft-close hydraulic hinges.",
      icon: "Utensils",
      imgFile: "kitchens.webp",
      price_from: 600,
      price_to: 1200,
      features_ar: ["كلادينج خليجي عالي الجودة", "مفصلات هايدروليك بلوم", "مقاوم للماء والنمل الأبيض", "تصميم ثلاثي الأبعاد 3D مجاني"],
      features_en: ["Premium Gulf cladding", "Blum soft-close hinges", "Water and termite proof", "Free 3D visual design"],
    },
  ];

  const serviceMap: Record<string, string> = {};
  for (let i = 0; i < servicesList.length; i++) {
    const s = servicesList[i];
    const coverUrl = mediaMap[s.imgFile]?.url || `${R2_PUBLIC_BASE}/services/${s.imgFile}`;
    const srvRows = await sql`
      INSERT INTO services (
        company_id, category_id, slug, name_ar, name_en,
        short_description_ar, short_description_en, full_description_ar, full_description_en,
        icon, cover_image_url, price_from, price_to, price_unit,
        features_ar, features_en, is_active, is_featured, sort_order
      ) VALUES (
        ${companyId}, ${categoryMap[s.catSlug] || null}, ${s.slug}, ${s.name_ar}, ${s.name_en},
        ${s.short_ar}, ${s.short_en}, ${s.full_ar}, ${s.full_en},
        ${s.icon}, ${coverUrl}, ${s.price_from}, ${s.price_to}, 'متر مربع',
        ${s.features_ar}, ${s.features_en}, true, true, ${i + 1}
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
      RETURNING id;
    `;
    const sId = srvRows[0].id;
    serviceMap[s.slug] = sId;

    if (mediaMap[s.imgFile]) {
      await sql`
        INSERT INTO service_images (service_id, media_id, image_url, is_cover, sort_order)
        VALUES (${sId}, ${mediaMap[s.imgFile].id}, ${coverUrl}, true, 1);
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 11. Projects, Images, Videos & Before/After
  // ════════════════════════════════════════════════════════════════════
  console.log("🔟 Seeding 'projects', 'project_images', 'project_videos', 'project_before_after'...");
  const projectsList = [
    {
      slug: "riyadh-business-tower",
      title_ar: "برج الأعمال الحديث - طريق الملك فهد بالرياض",
      title_en: "Modern Business Tower - King Fahd Road, Riyadh",
      desc_ar: "تنفيذ واجهات كرتن وول زجاجية بمساحة 4,500 متر مربع مع زجاج دبل معزول بتقنية Low-E للتحكم في الطاقة الحرارية.",
      desc_en: "Execution of 4,500 sqm curtain wall glass facades with Low-E double glazing for thermal efficiency.",
      client: "شركة التطوير العقاري الكبرى",
      city: "الرياض",
      val: 1850000,
      area: 4500,
      coverImg: "project-1.webp",
      beforeImg: "project-1-before.webp",
      afterImg: "project-1-after.webp",
    },
    {
      slug: "luxury-villa-malqa",
      title_ar: "فيلا سكنية فاخرة - حي الملقا",
      title_en: "Luxury Modern Villa - Al Malqa District",
      desc_ar: "واجهات زجاج سكريت استركشر وقواطع داخلية للشاور والدرابزينات الزجاجية مع قطاعات ألمنيوم سوداء معزولة.",
      desc_en: "Structural securit glass facades, internal glass partitions, shower cabins and glass railings with thermal aluminum.",
      client: "عبدالرحمن الشمري",
      city: "الرياض",
      val: 320000,
      area: 680,
      coverImg: "luxury-facade.webp",
      beforeImg: "cafe-before.webp",
      afterImg: "cafe-after.webp",
    },
  ];

  for (let i = 0; i < projectsList.length; i++) {
    const p = projectsList[i];
    const coverUrl = mediaMap[p.coverImg]?.url || `${R2_PUBLIC_BASE}/projects/${p.coverImg}`;
    const prjRows = await sql`
      INSERT INTO projects (
        company_id, service_id, slug, title_ar, title_en,
        description_ar, description_en, client_name, location, city,
        project_value, area_sqm, status, start_date, completion_date,
        cover_image_url, is_featured, sort_order
      ) VALUES (
        ${companyId}, ${serviceMap["glass-facades"] || null}, ${p.slug}, ${p.title_ar}, ${p.title_en},
        ${p.desc_ar}, ${p.desc_en}, ${p.client}, ${p.city}, ${p.city},
        ${p.val}, ${p.area}, 'completed', '2025-01-10', '2025-06-25',
        ${coverUrl}, true, ${i + 1}
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
      RETURNING id;
    `;
    const pId = prjRows[0].id;

    if (mediaMap[p.coverImg]) {
      await sql`
        INSERT INTO project_images (project_id, media_id, image_url, is_cover, sort_order)
        VALUES (${pId}, ${mediaMap[p.coverImg].id}, ${coverUrl}, true, 1);
      `;
    }

    // Before & After
    const bId = mediaMap[p.beforeImg]?.id || null;
    const aId = mediaMap[p.afterImg]?.id || null;
    if (bId && aId) {
      await sql`
        INSERT INTO project_before_after (project_id, before_image_id, after_image_id, caption_ar, caption_en, sort_order)
        VALUES (${pId}, ${bId}, ${aId}, 'مقارنة قبل وبعد تركيب واجهات الزجاج', 'Before & after comparison', 1);
      `;
    }

    // Video link
    await sql`
      INSERT INTO project_videos (project_id, title_ar, video_url, video_type, is_featured, sort_order)
      VALUES (${pId}, 'جولة فيديو للمشروع بعد التسليم', 'https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/projects/sample-tour.mp4', 'direct', true, 1);
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 12. Gallery Albums & Items
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣1️⃣ Seeding 'gallery_albums' & 'gallery_items'...");
  const albumRows = await sql`
    INSERT INTO gallery_albums (company_id, slug, title_ar, title_en, description_ar, description_en, sort_order, is_active)
    VALUES (${companyId}, 'facades-album', 'معرض واجهات الزجاج والكلادينج', 'Facades & Cladding Gallery', 'مجموعة مختارة من أرقى الواجهات المنفذة', 'Selected luxury facades', 1, true)
    ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
    RETURNING id;
  `;
  const albId = albumRows[0].id;

  for (const [idx, imgKey] of ["glass-facades.webp", "luxury-facade.webp", "project-1.webp"].entries()) {
    const itemUrl = mediaMap[imgKey]?.url || `${R2_PUBLIC_BASE}/gallery/${imgKey}`;
    const mId = mediaMap[imgKey]?.id || null;
    await sql`
      INSERT INTO gallery_items (album_id, media_id, image_url, title_ar, title_en, sort_order, is_featured)
      VALUES (${albId}, ${mId}, ${itemUrl}, 'صورة من أعمال الواجهات الزجاجية', 'Glass facade picture', ${idx + 1}, true);
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 13. Advertisements
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣2️⃣ Seeding 'advertisements' table...");
  const adImgUrl = mediaMap["luxury-facade.webp"]?.url || `${R2_PUBLIC_BASE}/advertisements/banner-1.webp`;
  await sql`
    INSERT INTO advertisements (
      company_id, title_ar, subtitle_ar, media_type, media_url,
      target_route, action_title_ar, start_date, end_date, is_active, priority
    ) VALUES (
      ${companyId}, 'خصم 15% على واجهات الزجاج السكريت والكلادينج', 'لفترة محدودة - احصل على معاينة وتصميم 3D مجاناً',
      'image', ${adImgUrl}, '/quote', 'احجز الآن', now(), now() + interval '30 days', true, 1
    );
  `;

  // ════════════════════════════════════════════════════════════════════
  // 14. Articles, Tags & Article Images
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣3️⃣ Seeding 'articles', 'article_tags' & 'article_images'...");
  const artImgUrl = mediaMap["tempered-glass.webp"]?.url || `${R2_PUBLIC_BASE}/services/tempered-glass.webp`;
  const artRows = await sql`
    INSERT INTO articles (
      company_id, slug, title_ar, title_en, excerpt_ar, excerpt_en,
      content_ar, content_en, cover_image_url, author_name,
      status, published_at, reading_time_minutes, is_featured
    ) VALUES (
      ${companyId}, 'advantages-of-tempered-glass-facades',
      'مميزات زجاج السيكوريت المقوى في واجهات المباني والمنازل',
      'Advantages of Tempered Securit Glass in Building Facades',
      'دليل شامل حول أهمية استخدام زجاج السيكوريت المقوى في الواجهات ومقاومته للحرارة وعوامل الطقس بالمملكة.',
      'Comprehensive guide on why tempered glass is essential for modern facades in Saudi climate.',
      '<p>يعتبر زجاج السيكوريت المقوى أحد أفضل الخيارات الهندسية لواجهات المباني والفلل لما يوفره من عزل فائق وأمان كامل...</p>',
      '<p>Tempered securit glass represents one of the top architectural choices for building facades...</p>',
      ${artImgUrl}, 'م. أنس الحربي', 'published', now(), 5, true
    )
    ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
    RETURNING id;
  `;
  const artId = artRows[0].id;

  await sql`
    INSERT INTO article_tags (article_id, tag_ar, tag_en)
    VALUES
      (${artId}, 'زجاج_سيكوريت', 'tempered_glass'),
      (${artId}, 'واجهات_زجاج', 'glass_facades'),
      (${artId}, 'مقاولات_الرياض', 'riyadh_contracting');
  `;

  if (mediaMap["tempered-glass.webp"]) {
    await sql`
      INSERT INTO article_images (article_id, media_id, image_url, is_cover, sort_order)
      VALUES (${artId}, ${mediaMap["tempered-glass.webp"].id}, ${artImgUrl}, true, 1);
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 15. Testimonials & Customer Reviews
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣4️⃣ Seeding 'testimonials' & 'customer_reviews'...");
  await sql`
    INSERT INTO testimonials (
      company_id, service_id, client_name_ar, client_name_en, client_title_ar, client_title_en,
      content_ar, content_en, rating, is_featured, is_approved, avatar_url
    ) VALUES (
      ${companyId}, ${serviceMap["glass-facades"] || null},
      'م. خالد العتيبي', 'Eng. Khalid Al-Otaibi', 'مدير مشاريع - شركة الإنماء', 'Project Manager',
      'تعامل راقي جداً والتزام تام بالمواعيد والمخططات الهندسية. جودة الواجهات الزجاجية وسرعة التركيب كانت ممتازة.',
      'Exceptional professionalism and strict adherence to deadlines. Glass facade quality was superb.',
      5, true, true, ${`${R2_PUBLIC_BASE}/testimonials/client-1.webp`}
    );
  `;

  await sql`
    INSERT INTO customer_reviews (
      company_id, service_id, reviewer_name, reviewer_phone, rating,
      title_ar, content_ar, is_verified, is_approved
    ) VALUES (
      ${companyId}, ${serviceMap["tempered-glass"] || null},
      'عبدالله القحطاني', '0555112233', 5,
      'شغل احترافي وضمان ممتاز',
      'تم تركيب أبواب وقواطع زجاج سيكوريت للفيلا، دقة عالية وإكسسوارات ممتازة ونظافة بالموقع بعد الانتهاء.',
      true, true
    );
  `;

  // ════════════════════════════════════════════════════════════════════
  // 16. FAQs
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣5️⃣ Seeding 'faqs' table...");
  const faqsData = [
    { q_ar: "ما هي مدة الضمان على أعمال الزجاج السيكوريت والواجهات؟", a_ar: "نقدم ضماناً شاملاً ومعتمداً لمدة 10 سنوات على كافة أعمال الزجاج والقطاعات والإكسسوارات مع صيانة ومتابعة دورية.", cat: "warranty" },
    { q_ar: "هل تقدمون خدمة المعاينة ورفع المقاسات مجاناً؟", a_ar: "نعم، فريقنا الهندسي يقوم بزيارة الموقع للمعاينة ورفع المقاسات وتقديم التصميم ثلاثي الأبعاد 3D مجاناً داخل الرياض والمدن الرئيسية.", cat: "services" },
    { q_ar: "ما هي المدة المستغرقة لتنفيذ وتركيب واجهات الزجاج؟", a_ar: "تستغرق المدة عادة من 7 إلى 14 يوم عمل حسب مساحة المشروع وتفاصيل القطاعات ومواصفات الزجاج المطلوبة.", cat: "timing" },
  ];
  for (const [idx, f] of faqsData.entries()) {
    await sql`
      INSERT INTO faqs (company_id, question_ar, question_en, answer_ar, answer_en, category, sort_order, is_active)
      VALUES (${companyId}, ${f.q_ar}, ${f.q_ar}, ${f.a_ar}, ${f.a_ar}, ${f.cat}, ${idx + 1}, true);
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 17. City Pages & City Services (SEO)
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣6️⃣ Seeding 'city_pages' & 'city_services'...");
  const cities = [
    { slug: "riyadh", name_ar: "الرياض", name_en: "Riyadh", region: "الوسطى" },
    { slug: "jeddah", name_ar: "جدة", name_en: "Jeddah", region: "الغربية" },
    { slug: "dammam", name_ar: "الدمام", name_en: "Dammam", region: "الشرقية" },
  ];
  for (const c of cities) {
    const cityRows = await sql`
      INSERT INTO city_pages (
        company_id, slug, name_ar, name_en, region_ar, region_en,
        title_ar, title_en, meta_description_ar, meta_description_en,
        content_ar, content_en, is_active
      ) VALUES (
        ${companyId}, ${c.slug}, ${c.name_ar}, ${c.name_en}, ${c.region}, ${c.region},
        ${`أفضل مقاول واجهات زجاج وسيكوريت في ${c.name_ar}`}, ${`Best Glass Facades Contractor in ${c.name_en}`},
        ${`خدمات توريد وتركيب الزجاج السكريت والواجهات المعمارية والكلادينج في ${c.name_ar} بأعلى جودة وضمان 10 سنوات.`},
        ${`Supplying and installing securit glass facades and cladding in ${c.name_en} with 10-year warranty.`},
        ${`<p>نغطي كافة أحياء ومشاريع ${c.name_ar} مع فريق هندسي متخصص للمعاينة والتركيب السريع...</p>`},
        ${`<p>Serving all districts in ${c.name_en} with certified installation teams...</p>`},
        true
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
      RETURNING id;
    `;
    const cityId = cityRows[0].id;

    if (serviceMap["tempered-glass"]) {
      await sql`
        INSERT INTO city_services (city_page_id, service_id, custom_title_ar, custom_content_ar, is_active)
        VALUES (${cityId}, ${serviceMap["tempered-glass"]}, ${`تركيب زجاج سيكوريت في ${c.name_ar}`}, ${`أفضل أسعار تركيب الزجاج السيكوريت بالضمان في ${c.name_ar}`}, true)
        ON CONFLICT (city_page_id, service_id) DO NOTHING;
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 18. Users, Leads, Quotes & Appointments (CRM)
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣7️⃣ Seeding 'users', 'quote_requests', 'appointments', 'messages'...");
  const userRows = await sql`
    INSERT INTO users (company_id, full_name, email, phone, city, source, role)
    VALUES (${companyId}, 'سلطان الدوسري', 'sultan@example.com', '0551122334', 'الرياض', 'website', 'customer')
    RETURNING id;
  `;
  const uId = userRows[0].id;

  const quoteRows = await sql`
    INSERT INTO quote_requests (
      company_id, user_id, service_ids, project_type, area_sqm,
      city, address, budget_range, urgency, description, status
    ) VALUES (
      ${companyId}, ${uId}, ${[serviceMap["glass-facades"] || ""]}, 'commercial', 250,
      'الرياض', 'حي الصحافة', '50,000 - 100,000 ريال', 'high',
      'طلب عرض سعر وتركيب واجهات زجاجية كرتن وول لمعرض تجاري جديد.', 'new'
    )
    RETURNING id;
  `;

  await sql`
    INSERT INTO appointments (
      company_id, user_id, quote_request_id, appointment_type,
      scheduled_date, scheduled_time, status, notes
    ) VALUES (
      ${companyId}, ${uId}, ${quoteRows[0].id}, 'site_survey',
      CURRENT_DATE + interval '2 days', '10:00:00', 'confirmed', 'معاينة الموقع ورفع المقاسات الهندسية'
    );
  `;

  await sql`
    INSERT INTO messages (company_id, user_id, name, phone, email, subject, message, is_read)
    VALUES (${companyId}, ${uId}, 'سلطان الدوسري', '0551122334', 'sultan@example.com', 'استفسار عن سماكات السيكوريت', 'السلام عليكم، ارغب بمعرفة سماكات الزجاج المتوفرة لديكم للشاور روم.', false);
  `;

  // ════════════════════════════════════════════════════════════════════
  // 19. Chat Sessions & Messages
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣8️⃣ Seeding 'chat_sessions' & 'chat_messages'...");
  const chatRows = await sql`
    INSERT INTO chat_sessions (company_id, user_id, status, message_count, context)
    VALUES (${companyId}, ${uId}, 'active', 2, ${JSON.stringify({ topic: "glass_facades" })})
    RETURNING id;
  `;
  const sessId = chatRows[0].id;

  await sql`
    INSERT INTO chat_messages (session_id, role, content)
    VALUES
      (${sessId}, 'user', 'مرحباً، كم سعر متر الزجاج السيكوريت 10 ملم مع التركيب؟'),
      (${sessId}, 'assistant', 'أهلاً بك! تبدأ أسعار زجاج السيكوريت 10 ملم من 250 ريال للمتر المربع شامل الإكسسوارات والتركيب والضمان 10 سنوات.');
  `;

  // ════════════════════════════════════════════════════════════════════
  // 20. AI Prompts
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣9️⃣ Seeding 'ai_prompts' table...");
  await sql`
    INSERT INTO ai_prompts (company_id, prompt_type, system_prompt, model, temperature, max_tokens, is_active)
    VALUES (
      ${companyId}, 'sales_assistant',
      'أنت المساعد الذكي المعتمد لمؤسسة القوة العاشرة للزجاج والألمنيوم. قدم استشارات احترافية ودقيقة حول الزجاج السيكوريت والواجهات والأسعار وشجع العميل على طلب المقايسة المجانية.',
      'gemini-1.5-flash', 0.4, 1024, true
    )
    ON CONFLICT (company_id, prompt_type) DO UPDATE SET is_active = true;
  `;

  // ════════════════════════════════════════════════════════════════════
  // 21. SEO Metadata, Analytics & Search Index
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣0️⃣ Seeding 'seo_metadata', 'analytics_events', 'search_index'...");
  await sql`
    INSERT INTO seo_metadata (
      company_id, entity_type, entity_id, locale, meta_title, meta_description, meta_keywords, canonical_url
    ) VALUES (
      ${companyId}, 'company', ${companyId}, 'ar',
      'مؤسسة القوة العاشرة | واجهات زجاج سيكوريت وألمنيوم ومقاولات بالرياض',
      'المؤسسة الرائدة في تركيب واجهات الزجاج السيكوريت والكلادينج وقطاعات الألمنيوم المعزولة بأعلى معايير الجودة والضمان 10 سنوات بالمملكة.',
      ${["زجاج_سيكوريت", "واجهات_زجاج", "كلادينج", "ألمنيوم", "مقاولات_الرياض"]},
      ${COMPANY_CONFIG.website_url}
    );
  `;

  await sql`
    INSERT INTO analytics_events (company_id, event_name, page_path, locale, visitor_id)
    VALUES
      (${companyId}, 'page_view', '/', 'ar', 'vis-001'),
      (${companyId}, 'quote_click', '/quote', 'ar', 'vis-001');
  `;

  await sql`
    INSERT INTO search_index (company_id, entity_type, entity_id, title_ar, title_en, content_ar, url)
    VALUES (
      ${companyId}, 'service', ${serviceMap["tempered-glass"] || companyId},
      'زجاج سكريت مقوى', 'Tempered Securit Glass',
      'تركيب زجاج سيكوريت مقوى للأبواب والواجهات والمكاتب', '/services/tempered-glass'
    );
  `;

  // ════════════════════════════════════════════════════════════════════
  // 22. Push Subscriptions, Notification Logs, Audit & Backups
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣1️⃣ Seeding 'push_subscriptions', 'notification_log', 'audit_log', 'backups'...");
  await sql`
    INSERT INTO push_subscriptions (company_id, user_id, endpoint, keys, is_active)
    VALUES (${companyId}, ${uId}, 'https://fcm.googleapis.com/fcm/send/sample-token-1', ${JSON.stringify({ p256dh: "key", auth: "auth" })}, true);
  `;

  await sql`
    INSERT INTO notification_log (company_id, type, title_ar, body_ar, target_audience, sent_count, delivered_count, sent_at)
    VALUES (${companyId}, 'push', 'خصم خاص على الواجهات', 'احصل على خصم 15% وتصميم ثلاثي الأبعاد مجاناً هذا الأسبوع', 'all_users', 1, 1, now());
  `;

  await sql`
    INSERT INTO audit_log (company_id, actor_id, actor_name, action, entity_type, details)
    VALUES (${companyId}, 5887234832, 'admin_powerof10', 'SEED_DATABASE', 'all_tables', ${JSON.stringify({ status: "success", cloud: "cloudflare_r2" })});
  `;

  await sql`
    INSERT INTO backups (company_id, backup_type, file_name, file_url, file_size, status)
    VALUES (${companyId}, 'full', 'backup-initial.sql', 'https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/backups/initial.sql', 154000, 'completed');
  `;

  console.log("\n🎉✨ ALL 40 TABLES FULLY SEEDED WITH CLOUDFLARE R2 IMAGES! ✨🎉\n");
}

export { seedAllTables };

// Only execute directly if invoked via CLI
if (require.main === module) {
  seedAllTables().catch(console.error);
}
