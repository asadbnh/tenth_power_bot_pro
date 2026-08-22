import { neon } from "@neondatabase/serverless";

/**
 * Comprehensive Database Seeder for WebTaky (Neon PostgreSQL)
 * Populates ALL 37 tables with realistic Arabic/English data and local default images.
 */
async function seedAllTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("🚀 Starting Comprehensive Seeding of ALL Database Tables in Neon SQL...\n");

  // ════════════════════════════════════════════════════════════════════
  // 1. Company Profile & Info
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣ Seeding 'companies' table...");
  const companySlug = "tenth-power-glass";
  const companyRows = await sql`
    INSERT INTO companies (
      slug, name_ar, name_en, description_ar, description_en,
      logo_url, favicon_url, primary_color, secondary_color, accent_color,
      whatsapp_number, phone_primary, phone_secondary, email, website_url,
      tax_number, commercial_register, maintenance_mode,
      social_links, theme_config, default_locale, supported_locales
    ) VALUES (
      ${companySlug},
      'مؤسسة القوة العاشرة للزجاج والألمنيوم والمقاولات',
      'Tenth Power Glass & Aluminum Contracting',
      'المؤسسة الرائدة في المملكة العربية السعودية المتخصصة في تنفيذ أعمال الزجاج السكريت المقوى، الواجهات الزجاجية الكرتن وول والسبايدر، قطاعات الألمنيوم المعزولة، والمطابخ العصرية بأعلى معايير الجودة والضمان الشامل.',
      'Leading Saudi enterprise specializing in high-grade tempered glass, glass facades, curtain wall & spider systems, thermal-break aluminum profiles, and modern kitchens with full warranty.',
      '/images/defaults/services/luxury-facade.webp',
      '/favicon.ico',
      '#1e3a8a',
      '#0d9488',
      '#f59e0b',
      '+966500000000',
      '+966500000000',
      '+966110000000',
      'info@webtaky.com',
      'https://powerof10.netlify.app',
      '310000000000003',
      '1010000000',
      false,
      ${JSON.stringify({
        twitter: "https://twitter.com/tenthpowerglass",
        instagram: "https://instagram.com/tenthpowerglass",
        snapchat: "https://snapchat.com/add/tenthpowerglass",
        tiktok: "https://tiktok.com/@tenthpowerglass",
        telegram: "https://t.me/tenthpower_bot",
        telegram_channel: "https://t.me/tenthpower_channel",
        linkedin: "https://linkedin.com/company/tenthpowerglass"
      })},
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
  // 2. Company Contacts (Social & Direct channels)
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣ Seeding 'company_contacts' table...");
  await sql`DELETE FROM company_contacts WHERE company_id = ${companyId};`;
  const contacts = [
    { type: "whatsapp", value: "+966500000000", label_ar: "واتساب الإدارة", label_en: "Official WhatsApp", order: 1, is_primary: true },
    { type: "phone", value: "+966500000000", label_ar: "هاتف المبيعات", label_en: "Sales Phone", order: 2, is_primary: true },
    { type: "instagram", value: "https://instagram.com/tenthpowerglass", label_ar: "انستقرام", label_en: "Instagram", order: 3, is_primary: false },
    { type: "snapchat", value: "https://snapchat.com/add/tenthpowerglass", label_ar: "سناب شات", label_en: "Snapchat", order: 4, is_primary: false },
    { type: "tiktok", value: "https://tiktok.com/@tenthpowerglass", label_ar: "تيك توك", label_en: "TikTok", order: 5, is_primary: false },
    { type: "telegram", value: "https://t.me/tenthpower_bot", label_ar: "حساب تلجرام", label_en: "Telegram Account", order: 6, is_primary: false },
    { type: "telegram_channel", value: "https://t.me/tenthpower_channel", label_ar: "قناة تلجرام", label_en: "Telegram Channel", order: 7, is_primary: false },
  ];
  for (const c of contacts) {
    await sql`
      INSERT INTO company_contacts (company_id, type, value, label_ar, label_en, sort_order, is_primary)
      VALUES (${companyId}, ${c.type}, ${c.value}, ${c.label_ar}, ${c.label_en}, ${c.order}, ${c.is_primary});
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. Company Settings
  // ════════════════════════════════════════════════════════════════════
  console.log("3️⃣ Seeding 'company_settings' table...");
  const settingsList = [
    { key: "general_settings", category: "general", value: { site_live: true, brand: "Powerof10" } },
    { key: "social_channels", category: "social", value: { instagram: "@tenthpowerglass", snapchat: "tenthpowerglass", tiktok: "@tenthpowerglass", telegram_channel: "tenthpower_channel" } },
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
  // 4. Business Hours
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
  // 5. Company Addresses
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
      'طريق الملك فهد، حي الصحافة', 'King Fahd Road, Al Sahafah District',
      'الرياض', 'Riyadh', 'منطقة الرياض', 'Riyadh Region', '13315', 'SA',
      24.774265, 46.738586, 'https://maps.google.com/?q=24.774265,46.738586', true
    );
  `;

  // ════════════════════════════════════════════════════════════════════
  // 6. Telegram Admins
  // ════════════════════════════════════════════════════════════════════
  console.log("6️⃣ Seeding 'telegram_admins' table...");
  await sql`
    INSERT INTO telegram_admins (company_id, telegram_user_id, telegram_username, role, is_active)
    VALUES (${companyId}, 5887234832, 'admin_powerof10', 'super_admin', true)
    ON CONFLICT (company_id, telegram_user_id) DO UPDATE SET is_active = true;
  `;

  // ════════════════════════════════════════════════════════════════════
  // 7. Media Library & Metadata
  // ════════════════════════════════════════════════════════════════════
  console.log("7️⃣ Seeding 'media_library' & 'media_metadata' tables...");
  const sampleImages = [
    { file: "tempered-glass.webp", title: "زجاج سكريت مقوى عالي الشفافية", path: "/images/defaults/services/tempered-glass.webp" },
    { file: "glass-facades.webp", title: "واجهات زجاجية كرتن وول", path: "/images/defaults/services/glass-facades.webp" },
    { file: "aluminum-works.webp", title: "قطاعات ألمنيوم معزولة حرارياً", path: "/images/defaults/services/aluminum-works.webp" },
    { file: "kitchens.webp", title: "مطابخ ألمنيوم عصرية", path: "/images/defaults/services/kitchens.webp" },
    { file: "luxury-facade.webp", title: "واجهة معمارية فاخرة", path: "/images/defaults/services/luxury-facade.webp" },
    { file: "project-1.webp", title: "تنفيذ برج تجاري بالرياض", path: "/images/defaults/projects/project-1.webp" },
    { file: "project-1-before.webp", title: "المشروع قبل التنفيذ", path: "/images/defaults/projects/project-1-before.webp" },
    { file: "project-1-after.webp", title: "المشروع بعد التنفيذ", path: "/images/defaults/projects/project-1-after.webp" },
    { file: "cafe-before.webp", title: "كافيه قبل التطوير", path: "/images/defaults/projects/cafe-before.webp" },
    { file: "cafe-after.webp", title: "كافيه بعد واجهات الزجاج", path: "/images/defaults/projects/cafe-after.webp" },
  ];

  const mediaIds: string[] = [];
  for (const img of sampleImages) {
    const rows = await sql`
      INSERT INTO media_library (
        company_id, file_name, original_name, file_url, cdn_url, webp_url,
        mime_type, file_size, width, height, storage_provider, storage_path
      ) VALUES (
        ${companyId}, ${img.file}, ${img.file}, ${img.path}, ${img.path}, ${img.path},
        'image/webp', 120000, 1920, 1080, 'local', ${img.path}
      )
      RETURNING id;
    `;
    const mId = rows[0].id;
    mediaIds.push(mId);

    await sql`
      INSERT INTO media_metadata (media_id, title_ar, title_en, alt_ar, alt_en, caption_ar, caption_en)
      VALUES (${mId}, ${img.title}, ${img.file}, ${img.title}, ${img.file}, ${img.title}, ${img.file});
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 8. Categories
  // ════════════════════════════════════════════════════════════════════
  console.log("8️⃣ Seeding 'categories' table...");
  const categoriesData = [
    { slug: "glass-works", name_ar: "أعمال الزجاج والسكريت", name_en: "Glass & Tempered Works", icon: "Shield", img: "/images/defaults/services/tempered-glass.webp" },
    { slug: "facades", name_ar: "الواجهات المعمارية", name_en: "Architectural Facades", icon: "Building", img: "/images/defaults/services/glass-facades.webp" },
    { slug: "aluminum", name_ar: "قطاعات الألمنيوم", name_en: "Aluminum Profiles", icon: "Layers", img: "/images/defaults/services/aluminum-works.webp" },
    { slug: "kitchens", name_ar: "المطابخ والخزائن", name_en: "Modern Kitchens", icon: "Utensils", img: "/images/defaults/services/kitchens.webp" },
  ];
  const categoryMap: Record<string, string> = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const c = categoriesData[i];
    const catRows = await sql`
      INSERT INTO categories (
        company_id, slug, name_ar, name_en, description_ar, description_en,
        icon, image_url, sort_order, is_active
      ) VALUES (
        ${companyId}, ${c.slug}, ${c.name_ar}, ${c.name_en}, ${c.name_ar}, ${c.name_en},
        ${c.icon}, ${c.img}, ${i + 1}, true
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
      RETURNING id;
    `;
    categoryMap[c.slug] = catRows[0].id;
  }

  // ════════════════════════════════════════════════════════════════════
  // 9. Services & Service Images
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
      cover: "/images/defaults/services/tempered-glass.webp",
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
      icon: "Building2",
      cover: "/images/defaults/services/glass-facades.webp",
      price_from: 450,
      price_to: 850,
      features_ar: ["زجاج دبل جلاس عازل للحرارة", "أنظمة كرتن وول معتمدة", "مقاومة سرعة الرياح والعواصف", "إشراف هندسي معتمد"],
      features_en: ["Double-glazed thermal glass", "Certified curtain wall systems", "High wind resistance", "Certified engineering supervision"],
    },
    {
      slug: "aluminum",
      catSlug: "aluminum",
      name_ar: "قطاعات الألمنيوم المعزولة",
      name_en: "Thermal-Break Aluminum Profiles",
      short_ar: "أبواب ونوافذ وسحابات ألمنيوم سرايا وعزل حراري بأعلى المواصفات الفنية.",
      short_en: "Thermal-break aluminum sliding doors, windows and structural profiles with top technical specs.",
      full_ar: "تصنيع وتثبيت قطاعات الألمنيوم المعزولة حرارياً ومقاومة تسريب المياه والغبار مع زجاج مزدوج محقون بغاز الأرجون لعزل صوتي وحراري كامل.",
      full_en: "Manufacturing and installation of thermal-break aluminum profiles, water & dust proof with double argon glass.",
      icon: "Layers",
      cover: "/images/defaults/services/aluminum-works.webp",
      price_from: 350,
      price_to: 650,
      features_ar: ["عزل حراري تام Thermal Break", "دهان بودرة كوتنج مقاوم للعوامل الجوية", "إكسسوارات أوروبية أصلية", "عزل تام للصوت والغبار"],
      features_en: ["Complete Thermal Break insulation", "Weather-resistant powder coating", "Original European accessories", "Complete acoustic insulation"],
    },
    {
      slug: "kitchens",
      catSlug: "kitchens",
      name_ar: "مطابخ الألمنيوم والخشب العصرية",
      name_en: "Modern Aluminum & Wood Kitchens",
      short_ar: "تصميم وتفصيل مطابخ مودرن ألمنيوم وكلادينج وخشب مقاوم للرطوبة والحرارة.",
      short_en: "Custom design of modern aluminum, cladding and moisture-resistant wood kitchens.",
      full_ar: "مطابخ عصرية بتصاميم إيطالية وألمانية فريدة، تجمع بين متانة قطاعات الألمنيوم وجمالية الكلادينج والرخام الصناعي المقاوم للبكتيريا والحرارة.",
      full_en: "Modern kitchens with unique Italian & German designs combining aluminum durability with cladding aesthetics.",
      icon: "Utensils",
      cover: "/images/defaults/services/kitchens.webp",
      price_from: 1200,
      price_to: 3500,
      features_ar: ["شاسيه ألمنيوم معالج ضد الصدأ", "مفصلات هيدروليك بلوم نمساوية", "أسطح كوارتز وجرانيت صناعي", "ضمان شامل 10 سنوات"],
      features_en: ["Anti-rust aluminum chassis", "Austrian Blum hydraulic hinges", "Quartz & artificial granite tops", "10-year warranty"],
    }
  ];

  const serviceMap: Record<string, string> = {};
  for (let i = 0; i < servicesList.length; i++) {
    const s = servicesList[i];
    const sRows = await sql`
      INSERT INTO services (
        company_id, category_id, slug, name_ar, name_en,
        short_description_ar, short_description_en,
        full_description_ar, full_description_en,
        cover_image_url, icon, features_ar, features_en,
        price_from, price_to, price_unit, show_price,
        sort_order, is_featured, is_active, view_count, review_count, rating_avg
      ) VALUES (
        ${companyId},
        ${categoryMap[s.catSlug] || null},
        ${s.slug},
        ${s.name_ar},
        ${s.name_en},
        ${s.short_ar},
        ${s.short_en},
        ${s.full_ar},
        ${s.full_en},
        ${s.cover},
        ${s.icon},
        ${s.features_ar},
        ${s.features_en},
        ${s.price_from},
        ${s.price_to},
        'متر مربع',
        true,
        ${i + 1},
        true,
        true,
        ${150 + i * 45},
        ${12 + i * 5},
        4.95
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET
        name_ar = EXCLUDED.name_ar,
        cover_image_url = EXCLUDED.cover_image_url
      RETURNING id;
    `;
    const sId = sRows[0].id;
    serviceMap[s.slug] = sId;

    if (mediaIds[i]) {
      await sql`
        INSERT INTO service_images (service_id, media_id, sort_order, is_cover)
        VALUES (${sId}, ${mediaIds[i]}, 1, true);
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 10. Projects, Project Images, Videos & Before/After
  // ════════════════════════════════════════════════════════════════════
  console.log("🔟 Seeding 'projects', 'project_images', 'project_videos', 'project_before_after'...");
  const projectsList = [
    {
      slug: "king-abdullah-tower",
      serviceSlug: "glass-facades",
      title_ar: "برج الأعمال الحديث — طريق الملك فهد",
      title_en: "Modern Business Tower — King Fahd Rd",
      desc_ar: "تنفيذ واجهات زجاجية هيكلية دبل جلاس كرتن وول لمبنى إداري مكون من 14 طابقاً مع عزل صوتي كامل.",
      desc_en: "Execution of double-glazed curtain wall facades for a 14-story administrative building with acoustic insulation.",
      client: "شركة الاستثمار المالي",
      city: "الرياض",
      val: 1850000,
    },
    {
      slug: "luxury-villa-facade",
      serviceSlug: "tempered-glass",
      title_ar: "فيلا مودرن فاخرة — حي النرجس",
      title_en: "Luxury Modern Villa — Al Narjis",
      desc_ar: "تركيب واجهات زجاج سكريت إستركشر وأبواب سحاب عملاقة مع شاورات زجاجية وإضاءات مخفية.",
      desc_en: "Installation of structural tempered glass facades, giant sliding doors and custom glass showers.",
      client: "فيلا خاصة",
      city: "الرياض",
      val: 320000,
    },
    {
      slug: "tempered-glass-office",
      serviceSlug: "aluminum",
      title_ar: "مجمع مكاتب تقنية — حي العليا",
      title_en: "Tech Office Complex — Al Olaya",
      desc_ar: "قواطع زجاج سكريت مفرغة من الهواء مع قطاعات ألمنيوم أسود مطفي عازل للصوت للمكاتب التنفيذية.",
      desc_en: "Tempered glass office partitions with matte black acoustic aluminum profiles for executive suites.",
      client: "شركة البرمجيات العربية",
      city: "الرياض",
      val: 210000,
    }
  ];

  for (let i = 0; i < projectsList.length; i++) {
    const p = projectsList[i];
    const pRows = await sql`
      INSERT INTO projects (
        company_id, service_id, slug, title_ar, title_en,
        description_ar, description_en, client_name, location_ar, location_en,
        city, project_value, start_date, end_date, status, is_featured, is_active,
        view_count, review_count, rating_avg
      ) VALUES (
        ${companyId},
        ${serviceMap[p.serviceSlug] || null},
        ${p.slug},
        ${p.title_ar},
        ${p.title_en},
        ${p.desc_ar},
        ${p.desc_en},
        ${p.client},
        ${p.city},
        ${p.city},
        ${p.city},
        ${p.val},
        '2026-01-10',
        '2026-06-15',
        'completed',
        true,
        true,
        ${240 + i * 60},
        ${10 + i * 3},
        5.00
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
      RETURNING id;
    `;
    const projId = pRows[0].id;

    // Project image
    if (mediaIds[i + 5]) {
      await sql`
        INSERT INTO project_images (project_id, media_id, sort_order, is_cover)
        VALUES (${projId}, ${mediaIds[i + 5]}, 1, true);
      `;
    }

    // Project Video
    await sql`
      INSERT INTO project_videos (project_id, video_url, title_ar, title_en, duration_seconds, sort_order)
      VALUES (${projId}, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ${p.title_ar}, ${p.title_en}, 90, 1);
    `;

    // Project Before / After
    if (mediaIds[6] && mediaIds[7]) {
      await sql`
        INSERT INTO project_before_after (project_id, before_image_id, after_image_id, caption_ar, caption_en, sort_order)
        VALUES (${projId}, ${mediaIds[6]}, ${mediaIds[7]}, 'مقارنة قبل وبعد تركيب الزجاج المقوى', 'Before and After Glass Installation', 1);
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 11. Articles & Tags
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣1️⃣ Seeding 'articles', 'article_tags' & 'article_images' tables...");
  const articlesList = [
    {
      slug: "types-of-tempered-glass",
      title_ar: "دليل شامل لأنواع زجاج السكريت واستخداماته في الواجهات والديكور",
      title_en: "Comprehensive Guide to Tempered Glass Types and Uses",
      excerpt_ar: "تعرف على الفروقات الجوهرية بين الزجاج العادي والزجاج السكريت المعالج حرارياً ومقاومته العالية للكسر.",
      excerpt_en: "Learn the core differences between regular glass and thermally tempered securit glass and its impact resistance.",
      content_ar: "<p>يعتبر الزجاج السيكوريت من أهم عناصر الهندسة المعمارية الحديثة، حيث يتميز بصلابة تفوق الزجاج العادي بأكثر من 5 أضعاف بفضل المعالجة الحرارية المتقدمة.</p>",
      content_en: "<p>Tempered glass is a cornerstone of modern architecture, featuring 5x greater strength than regular glass.</p>",
      cover: "/images/defaults/blog/types-of-tempered-glass.webp",
      read_time: 4,
      tags: ["زجاج-سكريت", "واجهات-معمارية", "نصائح-بناء"]
    },
    {
      slug: "aluminum-vs-upvc",
      title_ar: "مقارنة قطاعات الألمنيوم المعزول حرارياً مع قطاعات UPVC في أجواء السعودية",
      title_en: "Aluminum vs UPVC Windows Comparison in Saudi Climate",
      excerpt_ar: "مقارنة فنية دقيقة بين الألمنيوم الحراري والـ UPVC من حيث عزل الحرارة، المتانة، ومقاومة أشعة الشمس.",
      excerpt_en: "Technical comparison between thermal-break aluminum and UPVC regarding heat insulation, durability and sun resistance.",
      content_ar: "<p>تتطلب الأجواء الحارة في المملكة اختيار قطاعات معزولة حرارياً تمنع انتقال الحرارة وتوفر استهلاك التكييف.</p>",
      content_en: "<p>The harsh climate in Saudi Arabia requires high performance thermal break profiles to cut cooling bills.</p>",
      cover: "/images/defaults/blog/aluminum-vs-upvc.webp",
      read_time: 5,
      tags: ["ألمنيوم-حراري", "عزل-صوت", "توفير-طاقة"]
    }
  ];

  for (const a of articlesList) {
    const aRows = await sql`
      INSERT INTO articles (
        company_id, slug, title_ar, title_en,
        excerpt_ar, excerpt_en, content_ar, content_en,
        cover_image_url, status, is_featured, view_count, read_time_minutes, published_at
      ) VALUES (
        ${companyId}, ${a.slug}, ${a.title_ar}, ${a.title_en},
        ${a.excerpt_ar}, ${a.excerpt_en}, ${a.content_ar}, ${a.content_en},
        ${a.cover}, 'published', true, 180, ${a.read_time}, now()
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
      RETURNING id;
    `;
    const artId = aRows[0].id;

    for (const tag of a.tags) {
      await sql`
        INSERT INTO article_tags (article_id, tag_ar, tag_en, slug)
        VALUES (${artId}, ${tag}, ${tag}, ${tag})
        ON CONFLICT (article_id, slug) DO NOTHING;
      `;
    }

    if (mediaIds[0]) {
      await sql`
        INSERT INTO article_images (article_id, media_id, context)
        VALUES (${artId}, ${mediaIds[0]}, 'blog_hero');
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 12. Testimonials (Customer Reviews)
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣2️⃣ Seeding 'testimonials' table...");
  const reviews = [
    { name: "م. فهد السبيعي", title: "مالك برج مكتبي", comp: "مجموعة السبيعي العقارية", text: "دقة متناهية في المواعيد وجودة تركيب الواجهات الزجاجية لا يعلى عليها. ضمان حقيقي وتعامل راقي جداً.", rating: 5 },
    { name: "د. خالد الشمري", title: "صاحب فيلا", comp: "حي حطين", text: "تم تفصيل وتركيب أبواب السحاب والزجاج السيكوريت للمسبح والواجهة، النتيجة خرافية وفاقت التوقعات.", rating: 5 },
    { name: "أبو راكان العتيبي", title: "رجل أعمال", comp: "الرياض", text: "أفضل ورشة ألمنيوم وزجاج تعاملت معها، الفنيين محترفين والمطبخ طلع تحفة فنية.", rating: 5 },
  ];
  for (const r of reviews) {
    await sql`
      INSERT INTO testimonials (
        company_id, client_name, client_title, client_company, client_avatar_url,
        content_ar, rating, is_featured, is_approved, source
      ) VALUES (
        ${companyId}, ${r.name}, ${r.title}, ${r.comp}, '/images/defaults/avatars/ChatGPT Image 9 أغسطس 2026، 04_43_29 م.webp',
        ${r.text}, ${r.rating}, true, true, 'google_maps'
      );
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 13. FAQs
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣3️⃣ Seeding 'faqs' table...");
  const faqs = [
    { q_ar: "ما هي مدة الضمان على أعمال الزجاج والألمنيوم؟", a_ar: "نقدم ضماناً شاملاً ومعتمداً لمدة 10 سنوات على كافة قطاعات الألمنيوم ومقاومة الزجاج وجودة الإكسسوارات والمفصلات." },
    { q_ar: "هل تقومون بزيارة الموقع ورفع المقاسات مجاناً؟", a_ar: "نعم، يقدم مهندسونا خدمة المعاينة الميدانية ورفع المقاسات وتقديم الاستشارة الفنية وعرض السعر مجاناً في كافة مدن المملكة." },
    { q_ar: "هل زجاج السيكوريت عازل للصوت والحرارة؟", a_ar: "نعم، عند استخدام نظام الزجاج المزدوج (Double Glazing) مع قطاعات ألمنيوم معزولة حرارياً يتم تحقيق عزل صوتي وحراري يصل إلى 85%." },
    { q_ar: "كم تستغرق مدة تنفيذ وتوريد المشاريع؟", a_ar: "تتراوح مدة التنفيذ للمشاريع السكنية بين 7 إلى 14 يوم عمل، وللمشاريع التجارية الكبرى حسب الجدول الزمني الهندسي المعتمد." },
  ];
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`
      INSERT INTO faqs (company_id, question_ar, question_en, answer_ar, answer_en, sort_order, is_active)
      VALUES (${companyId}, ${f.q_ar}, ${f.q_ar}, ${f.a_ar}, ${f.a_ar}, ${i + 1}, true);
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 14. City Pages & City Services
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣4️⃣ Seeding 'city_pages' & 'city_services' tables...");
  const cities = [
    { slug: "riyadh", name_ar: "الرياض", name_en: "Riyadh", region_ar: "منطقة الرياض", lat: 24.7136, lng: 46.6753, hero: "/images/defaults/services/luxury-facade.webp" },
    { slug: "jeddah", name_ar: "جدة", name_en: "Jeddah", region_ar: "منطقة مكة المكرمة", lat: 21.5433, lng: 39.1728, hero: "/images/defaults/services/glass-facades.webp" },
    { slug: "dammam", name_ar: "الدمام", name_en: "Dammam", region_ar: "المنطقة الشرقية", lat: 26.4207, lng: 50.0888, hero: "/images/defaults/services/aluminum-works.webp" },
  ];

  for (const c of cities) {
    const cRows = await sql`
      INSERT INTO city_pages (
        company_id, slug, city_name_ar, city_name_en,
        description_ar, description_en, hero_image_url,
        latitude, longitude, region_ar, region_en, is_active
      ) VALUES (
        ${companyId}, ${c.slug}, ${c.name_ar}, ${c.name_en},
        ${`أفضل خدمات تركيب الزجاج السكريت والواجهات والألمنيوم في ${c.name_ar} بأعلى جودة وضمان 10 سنوات.`},
        ${`Top tempered glass, facade and aluminum contracting services in ${c.name_en}.`},
        ${c.hero}, ${c.lat}, ${c.lng}, ${c.region_ar}, ${c.region_ar}, true
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET city_name_ar = EXCLUDED.city_name_ar
      RETURNING id;
    `;
    const cityPageId = cRows[0].id;

    // Link city with first 2 services
    for (const sSlug of ["tempered-glass", "glass-facades"]) {
      if (serviceMap[sSlug]) {
        await sql`
          INSERT INTO city_services (
            city_page_id, service_id, unique_content_ar, unique_content_en, local_keywords_ar, local_keywords_en
          ) VALUES (
            ${cityPageId},
            ${serviceMap[sSlug]},
            ${`خدمة تنفيذ وتركيب متخصص في ${c.name_ar} مع فريق فني معتمد.`},
            ${`Specialized installation in ${c.name_en}.`},
            ${[`زجاج سكريت ${c.name_ar}`, `واجهات ${c.name_ar}`, `ألمنيوم ${c.name_ar}`]},
            ${[`glass ${c.name_en}`, `facades ${c.name_en}`]}
          )
          ON CONFLICT (city_page_id, service_id) DO NOTHING;
        `;
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 15. Gallery Albums & Items
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣5️⃣ Seeding 'gallery_albums' & 'gallery_items' tables...");
  const albRows = await sql`
    INSERT INTO gallery_albums (
      company_id, slug, title_ar, title_en, description_ar, description_en, cover_image_url, sort_order, is_active
    ) VALUES (
      ${companyId}, 'modern-facades', 'معرض الواجهات والزجاج الفاخر', 'Modern Facades & Glass Gallery',
      'أحدث مشاريع الواجهات الزجاجية والكرتن وول المنفذة بأعلى جودة.', 'Latest facade projects.',
      '/images/defaults/services/luxury-facade.webp', 1, true
    )
    ON CONFLICT (company_id, slug) DO UPDATE SET title_ar = EXCLUDED.title_ar
    RETURNING id;
  `;
  const albumId = albRows[0].id;

  for (let i = 0; i < Math.min(mediaIds.length, 5); i++) {
    await sql`
      INSERT INTO gallery_items (album_id, media_id, type, sort_order)
      VALUES (${albumId}, ${mediaIds[i]}, 'image', ${i + 1});
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 16. Users (Leads), Appointments, Quotes & Messages
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣6️⃣ Seeding 'users', 'appointments', 'quote_requests', 'messages' tables...");
  const uRows = await sql`
    INSERT INTO users (
      company_id, full_name, email, phone, whatsapp, city, source, metadata
    ) VALUES (
      ${companyId}, 'سلطان القحطاني', 'sultan@example.com', '+966555987654', '+966555987654',
      'الرياض', 'website_header', ${JSON.stringify({ vip: true, preferred_contact: "whatsapp" })}
    )
    ON CONFLICT (company_id, phone) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id;
  `;
  const userId = uRows[0].id;

  // Appointment
  await sql`
    INSERT INTO appointments (company_id, user_id, service_id, status, preferred_date, preferred_time, notes, source)
    VALUES (${companyId}, ${userId}, ${serviceMap["glass-facades"] || null}, 'confirmed', now() + interval '2 days', '10:00 AM', 'معاينة الموقع لفيلا سكنية بحي النرجس', 'web_form');
  `;

  // Quote Request
  await sql`
    INSERT INTO quote_requests (company_id, user_id, service_id, description, budget_range, city, urgency, status)
    VALUES (${companyId}, ${userId}, ${serviceMap["tempered-glass"] || null}, 'طلب عرض سعر لتركيب واجهات زجاج سيكوريت وقواطع مكاتب بمساحة 180 م2', '50,000 - 80,000 ر.س', 'الرياض', 'urgent', 'new');
  `;

  // Message
  await sql`
    INSERT INTO messages (company_id, user_id, subject, content, type, is_read)
    VALUES (${companyId}, ${userId}, 'استفسار عن سماكات زجاج السيكوريت للواجهات', 'أرغب في معرفة الفرق بين زجاج 10 ملم و 12 ملم لواجهة محل تجاري.', 'contact', false);
  `;

  // ════════════════════════════════════════════════════════════════════
  // 17. Chat Sessions & Messages (AI Assistant)
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣7️⃣ Seeding 'chat_sessions' & 'chat_messages' tables...");
  const chatRows = await sql`
    INSERT INTO chat_sessions (company_id, user_id, status, message_count, context)
    VALUES (${companyId}, ${userId}, 'active', 2, ${JSON.stringify({ topic: "glass_facades" })})
    RETURNING id;
  `;
  const sessionId = chatRows[0].id;

  await sql`
    INSERT INTO chat_messages (session_id, role, content, suggested_actions)
    VALUES
      (${sessionId}, 'user', 'كم سعر متر الزجاج السكريت للواجهات؟', ${["طلب عرض سعر", "مواصفات الزجاج"]}),
      (${sessionId}, 'assistant', 'يبدأ سعر المتر من 250 إلى 450 ريال حسب السماكة والمواصفات الفنية مع الضمان الشامل لمدة 10 سنوات.', ${["تحديد موعد معاينة", "التحدث مع مهندس"]});
  `;

  // ════════════════════════════════════════════════════════════════════
  // 18. AI Prompts
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣8️⃣ Seeding 'ai_prompts' table...");
  await sql`
    INSERT INTO ai_prompts (
      company_id, prompt_type, system_prompt_ar, system_prompt_en, model, temperature, max_tokens, is_active
    ) VALUES (
      ${companyId}, 'chat',
      'أنت المساعد الهندسي الذكي لشركة القوة العاشرة للزجاج والألمنيوم. أجب باحترافية عن زجاج السيكوريت والواجهات الكرتن وول والألمنيوم، وانصح العميل بطلب معاينة مجانية.',
      'You are the AI architectural consultant for Tenth Power Glass & Aluminum.',
      'gemini-1.5-flash', 0.7, 1000, true
    )
    ON CONFLICT (company_id, prompt_type) DO UPDATE SET system_prompt_ar = EXCLUDED.system_prompt_ar;
  `;

  // ════════════════════════════════════════════════════════════════════
  // 19. Push Subscriptions
  // ════════════════════════════════════════════════════════════════════
  console.log("1️⃣9️⃣ Seeding 'push_subscriptions' table...");
  await sql`
    INSERT INTO push_subscriptions (company_id, user_id, endpoint, p256dh, auth, is_active)
    VALUES (${companyId}, ${userId}, 'https://fcm.googleapis.com/fcm/send/sample-endpoint-test', 'sample_p256dh_key_data', 'sample_auth_key_data', true)
    ON CONFLICT (endpoint) DO NOTHING;
  `;

  // ════════════════════════════════════════════════════════════════════
  // 20. Analytics Events
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣0️⃣ Seeding 'analytics_events' table...");
  const events = [
    { type: "page_view", path: "/ar", src: "google", utm_m: "organic", dev: "mobile" },
    { type: "page_view", path: "/ar/services/tempered-glass", src: "instagram", utm_m: "social", dev: "mobile" },
    { type: "quote_submit", path: "/ar/quote", src: "tiktok", utm_m: "cpc", dev: "desktop" },
    { type: "search", path: "/ar/search", src: "direct", utm_m: "direct", dev: "mobile" },
  ];
  for (const e of events) {
    await sql`
      INSERT INTO analytics_events (
        company_id, event_type, page_path, utm_source, utm_medium, device_type, country, city, metadata
      ) VALUES (
        ${companyId}, ${e.type}, ${e.path}, ${e.src}, ${e.utm_m}, ${e.dev}, 'SA', 'Riyadh', ${JSON.stringify({ query: "زجاج سكريت" })}
      );
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // 21. Notification Log, Audit Log & Backups
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣1️⃣ Seeding 'notification_log', 'audit_log' & 'backups' tables...");
  await sql`
    INSERT INTO notification_log (company_id, type, title_ar, title_en, body_ar, body_en, target_audience, sent_count, delivered_count)
    VALUES (${companyId}, 'telegram', 'طلب تسعير جديد', 'New Quote', 'تم استلام طلب تسعير جديد من سلطان القحطاني', 'New quote received', 'admin', 1, 1);
  `;

  await sql`
    INSERT INTO audit_log (company_id, actor_type, actor_id, action, entity_type, ip_address, new_values)
    VALUES (${companyId}, 'admin', '5887234832', 'SEED_ALL_TABLES', 'database', '127.0.0.1', ${JSON.stringify({ status: "success", count: 37 })});
  `;

  await sql`
    INSERT INTO backups (company_id, backup_url, type, size_bytes, status, triggered_by)
    VALUES (${companyId}, 'https://pub-r2.dev/backups/db-backup-2026-08-22.sql.gz', 'full', 1542000, 'completed', 'system_auto');
  `;

  // ════════════════════════════════════════════════════════════════════
  // 22. SEO Metadata
  // ════════════════════════════════════════════════════════════════════
  console.log("2️⃣2️⃣ Seeding 'seo_metadata' table...");
  await sql`
    INSERT INTO seo_metadata (
      company_id, entity_type, entity_id, locale, meta_title, meta_description,
      meta_keywords, canonical_url, og_title, og_description, og_image_url
    ) VALUES (
      ${companyId}, 'company', ${companyId}, 'ar',
      'مؤسسة القوة العاشرة للزجاج والألمنيوم والمقاولات — الرياض',
      'المؤسسة الرائدة في السعودية لتنفيذ الواجهات الزجاجية الكرتن وول وزجاج السيكوريت والألمنيوم المعزول وضمان 10 سنوات.',
      ${["زجاج سكريت", "واجهات زجاجية", "ألمنيوم", "مقاولات الرياض"]},
      'https://powerof10.netlify.app/ar',
      'القوة العاشرة للزجاج والألمنيوم',
      'أفضل أعمال الزجاج والألمنيوم في المملكة',
      '/images/defaults/services/luxury-facade.webp'
    )
    ON CONFLICT (entity_type, entity_id, locale) DO UPDATE SET meta_title = EXCLUDED.meta_title;
  `;

  console.log("\n🎉✨ CONGRATULATIONS! ALL 37 DATABASE TABLES HAVE BEEN FULLY SEEDED IN NEON SQL! ✨🎉\n");
}

seedAllTables().catch(console.error);
