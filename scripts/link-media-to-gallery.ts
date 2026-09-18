import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function linkAllMediaToGallery() {
  console.log("🔗 ربط صور media_library بألبومات المعرض...\n");

  // جلب الألبوم الافتراضي "الواجهات الزجاجية" كألبوم رئيسي للصور غير المصنفة
  const albums = await sql`SELECT id, slug, title_ar FROM gallery_albums WHERE is_active=true ORDER BY sort_order ASC`;
  console.log(`📁 الألبومات: ${albums.length}`);

  // جلب كل صور media_library غير المرتبطة بـ gallery_items
  const unlinked = await sql`
    SELECT m.id, m.file_name, m.cdn_url, m.file_url, m.storage_path
    FROM media_library m
    WHERE m.mime_type LIKE 'image/%'
      AND (m.cdn_url IS NOT NULL OR m.file_url IS NOT NULL)
      AND m.id NOT IN (SELECT media_id FROM gallery_items WHERE media_id IS NOT NULL)
    ORDER BY m.created_at DESC
  `;
  console.log(`📸 صور غير مرتبطة: ${unlinked.length}\n`);

  if (unlinked.length === 0) {
    console.log("✅ كل الصور مرتبطة بالفعل.");
    return;
  }

  // توزيع الصور على الألبومات بالتساوي (round-robin)
  const defaultAlbum = albums[0];
  if (!defaultAlbum) { console.error("❌ لا توجد ألبومات"); return; }

  let added = 0;
  for (let i = 0; i < unlinked.length; i++) {
    const m = unlinked[i];
    // اختر الألبوم بالتوزيع الدائري
    const album = albums[i % albums.length];
    
    // تحقق مما إذا كانت موجودة بالفعل
    const ex = await sql`SELECT id FROM gallery_items WHERE album_id=${album.id} AND media_id=${m.id} LIMIT 1`;
    if (ex.length > 0) continue;

    await sql`INSERT INTO gallery_items (album_id, media_id, type, sort_order) VALUES (${album.id}, ${m.id}, 'image', ${i})`;
    console.log(`  ✅ ${m.file_name || m.id} → ${album.title_ar}`);
    added++;
  }

  const [{ c: total }] = await sql`SELECT COUNT(*)::int as c FROM gallery_items`;
  console.log(`\n✅ تم ربط ${added} صورة جديدة. إجمالي gallery_items: ${total}`);
}

linkAllMediaToGallery().catch(e => { console.error("❌", e.message); process.exit(1); });