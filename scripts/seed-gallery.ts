import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const ALBUMS = [
  { slug: "glass-facades",   title_ar: "الواجهات الزجاجية",        title_en: "Glass Facades",        description_ar: "واجهات زجاجية معمارية فاخرة",      cover: "/images/defaults/services/glass-facades.webp",  sort: 1 },
  { slug: "tempered-glass",  title_ar: "الزجاج السكريت المقوى",    title_en: "Tempered Glass Works", description_ar: "أعمال الزجاج السكريت المقوى",       cover: "/images/defaults/services/tempered-glass.webp", sort: 2 },
  { slug: "aluminum-works",  title_ar: "أعمال الألمنيوم",           title_en: "Aluminum Works",       description_ar: "قطاعات الألمنيوم المعزولة حرارياً", cover: "/images/defaults/services/aluminum-works.webp", sort: 3 },
  { slug: "kitchen-designs", title_ar: "تصاميم المطابخ",            title_en: "Kitchen Designs",      description_ar: "مطابخ عصرية بتصاميم فاخرة",          cover: "/images/defaults/services/kitchens.webp",       sort: 4 },
  { slug: "decorations",     title_ar: "أعمال الديكور",             title_en: "Decoration Projects",  description_ar: "ديكور استانلس ستيل وزجاج",           cover: "/images/defaults/services/decorations.webp",    sort: 5 },
  { slug: "doors-windows",   title_ar: "الأبواب والنوافذ",           title_en: "Doors & Windows",      description_ar: "أبواب ونوافذ ألمنيوم وزجاج",         cover: "/images/defaults/services/doors-windows.webp",  sort: 6 },
];

const ALBUM_IMAGES: Record<string, string[]> = {
  "glass-facades":   ["/images/defaults/services/glass-facades.webp", "/images/defaults/projects/project-1.webp", "/images/defaults/projects/project-2.webp"],
  "tempered-glass":  ["/images/defaults/services/tempered-glass.webp", "/images/defaults/projects/project-1.webp"],
  "aluminum-works":  ["/images/defaults/services/aluminum-works.webp", "/images/defaults/projects/project-2.webp"],
  "kitchen-designs": ["/images/defaults/services/kitchens.webp"],
  "decorations":     ["/images/defaults/services/decorations.webp"],
  "doors-windows":   ["/images/defaults/services/doors-windows.webp"],
};

async function main() {
  console.log("🖼️  بدء seed المعرض...\n");

  const companies = await sql`SELECT id FROM companies LIMIT 1`;
  if (!companies.length) { console.error("❌ لا توجد شركة"); process.exit(1); }
  const companyId = companies[0].id;
  console.log(`✅ Company: ${companyId}\n`);

  for (const a of ALBUMS) {
    // upsert album
    const ex = await sql`SELECT id FROM gallery_albums WHERE slug = ${a.slug} LIMIT 1`;
    let albumId: string;

    if (ex.length > 0) {
      albumId = ex[0].id;
      await sql`UPDATE gallery_albums SET title_ar=${a.title_ar}, title_en=${a.title_en}, description_ar=${a.description_ar}, cover_image_url=${a.cover}, sort_order=${a.sort}, is_active=true WHERE id=${albumId}`;
      console.log(`  🔄 ${a.title_ar}`);
    } else {
      const r = await sql`
        INSERT INTO gallery_albums (company_id, slug, title_ar, title_en, description_ar, description_en, cover_image_url, sort_order, is_active)
        VALUES (${companyId}, ${a.slug}, ${a.title_ar}, ${a.title_en}, ${a.description_ar}, ${a.title_en}, ${a.cover}, ${a.sort}, true)
        RETURNING id`;
      albumId = r[0].id;
      console.log(`  ✅ ${a.title_ar} (${albumId})`);
    }

    // insert images
    const images = ALBUM_IMAGES[a.slug] || [];
    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const fname = url.split("/").pop() || "image.webp";

      // upsert media_library
      const exm = await sql`SELECT id FROM media_library WHERE file_url = ${url} LIMIT 1`;
      let mediaId: string;
      if (exm.length > 0) {
        mediaId = exm[0].id;
      } else {
        const mr = await sql`
          INSERT INTO media_library (company_id, file_name, original_name, file_url, cdn_url, storage_path, mime_type, storage_provider)
          VALUES (${companyId}, ${fname}, ${fname}, ${url}, ${url}, ${url}, 'image/webp', 'local')
          RETURNING id`;
        mediaId = mr[0].id;
      }

      // insert gallery_item if not exists
      const exi = await sql`SELECT id FROM gallery_items WHERE album_id=${albumId} AND media_id=${mediaId} LIMIT 1`;
      if (!exi.length) {
        await sql`INSERT INTO gallery_items (album_id, media_id, type, sort_order) VALUES (${albumId}, ${mediaId}, 'image', ${i})`;
        console.log(`     📸 ${fname}`);
      }
    }
  }

  const [{ c: albums }] = await sql`SELECT COUNT(*)::int as c FROM gallery_albums WHERE is_active=true`;
  const [{ c: items }]  = await sql`SELECT COUNT(*)::int as c FROM gallery_items`;
  console.log(`\n✅ اكتمل: ${albums} ألبوم — ${items} صورة`);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });