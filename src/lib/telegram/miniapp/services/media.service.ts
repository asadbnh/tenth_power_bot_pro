/**
 * WebTaky Mini App Media & Visual Studio Service
 * Central visual engine for Cloudflare R2 uploads, Sharp WebP compression,
 * gallery albums, and media library management.
 */

import { createDbClient } from "@/lib/db";
import { uploadToR2, type R2MediaFolder } from "@/lib/storage/r2";
import type { MediaLibraryItem } from "../types";

export async function getMediaList(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{ items: MediaLibraryItem[]; total: number; page: number; totalPages: number }> {
  const db = createDbClient();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(60, Math.max(1, options.limit || 24));
  const offset = (page - 1) * limit;

  const { count: totalCount } = await db.from("media_library").select("*", { count: "exact", head: true });
  const total = totalCount || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  let query = db
    .from("media_library")
    .select("id, file_name, original_name, file_url, cdn_url, webp_url, mime_type, file_size, width, height, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: mediaRows } = await query;
  if (!mediaRows || mediaRows.length === 0) {
    return { items: [], total, page, totalPages };
  }

  // Fetch metadata for these items
  const mediaIds = (mediaRows as any[]).map((m) => m.id);
  const { data: metadataRows } = await db
    .from("media_metadata")
    .select("media_id, alt_ar, caption_ar")
    .in("media_id", mediaIds);

  const metaMap = new Map<string, { alt_ar?: string; caption_ar?: string }>();
  (metadataRows || []).forEach((m: any) => {
    metaMap.set(m.media_id, { alt_ar: m.alt_ar, caption_ar: m.caption_ar });
  });

  const items: MediaLibraryItem[] = (mediaRows as any[]).map((m) => {
    const meta = metaMap.get(m.id);
    return {
      id: m.id,
      file_name: m.file_name,
      original_name: m.original_name,
      file_url: m.file_url,
      cdn_url: m.cdn_url || m.file_url,
      webp_url: m.webp_url || m.file_url,
      mime_type: m.mime_type,
      file_size: Number(m.file_size) || 0,
      width: m.width || 1200,
      height: m.height || 800,
      created_at: m.created_at,
      alt_ar: meta?.alt_ar,
      caption_ar: meta?.caption_ar,
    };
  });

  return { items, total, page, totalPages };
}

export async function uploadMediaItem(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: R2MediaFolder;
  alt_ar?: string;
  caption_ar?: string;
  targetAlbumId?: string;
}): Promise<{ success: boolean; item?: MediaLibraryItem; error?: string }> {
  const db = createDbClient();
  const folder = params.folder || "uploads";

  // 1. Upload original & WebP version to Cloudflare R2
  const r2Result = await uploadToR2(params.buffer, folder, params.fileName, params.contentType);
  if (!r2Result.success || !r2Result.url) {
    return { success: false, error: r2Result.error || "Upload to Cloudflare R2 failed" };
  }

  // 2. Measure dimensions if image
  let width = 1200;
  let height = 800;
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(params.buffer).metadata();
    if (meta.width) width = meta.width;
    if (meta.height) height = meta.height;
  } catch {
    // optional dimension fallback
  }

  // 3. Resolve default company
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  // 4. Record in media_library table
  const { data: media, error: dbErr } = await db
    .from("media_library")
    .insert({
      company_id: companyId,
      file_name: params.fileName,
      original_name: params.fileName,
      file_url: r2Result.url,
      cdn_url: r2Result.url,
      webp_url: r2Result.webpUrl || r2Result.url,
      mime_type: params.contentType,
      file_size: params.buffer.length,
      width,
      height,
      storage_provider: "r2",
      storage_path: r2Result.key,
    })
    .select("id, file_name, original_name, file_url, cdn_url, webp_url, mime_type, file_size, width, height, created_at")
    .single();

  if (dbErr || !media) {
    return { success: false, error: dbErr?.message || "Failed to record media in database" };
  }

  // 5. Insert metadata
  if (params.alt_ar || params.caption_ar) {
    await db.from("media_metadata").insert({
      media_id: media.id,
      alt_ar: params.alt_ar || params.fileName,
      alt_en: params.fileName,
      caption_ar: params.caption_ar || "صورة من مرفوعات اللوحة",
    });
  }

  // 6. Link to Album if target specified
  if (params.targetAlbumId) {
    const { count: currentOrder } = await db
      .from("gallery_items")
      .select("*", { count: "exact", head: true })
      .eq("album_id", params.targetAlbumId);

    await db.from("gallery_items").insert({
      album_id: params.targetAlbumId,
      media_id: media.id,
      type: "image",
      sort_order: (currentOrder || 0) + 1,
    });
  }

  return {
    success: true,
    item: {
      id: media.id,
      file_name: media.file_name,
      original_name: media.original_name,
      file_url: media.file_url,
      cdn_url: media.cdn_url || media.file_url,
      webp_url: media.webp_url || media.file_url,
      mime_type: media.mime_type,
      file_size: Number(media.file_size) || params.buffer.length,
      width: media.width || width,
      height: media.height || height,
      created_at: media.created_at || new Date().toISOString(),
      alt_ar: params.alt_ar,
      caption_ar: params.caption_ar,
    },
  };
}

export async function deleteMediaItem(id: string): Promise<{ success: boolean; error?: string }> {
  const db = createDbClient();
  const { error } = await db.from("media_library").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateMediaMetadata(
  mediaId: string,
  data: { alt_ar?: string; caption_ar?: string; title_ar?: string }
): Promise<{ success: boolean; error?: string }> {
  const db = createDbClient();
  const { data: existing } = await db.from("media_metadata").select("id").eq("media_id", mediaId).single();

  if (existing?.id) {
    await db.from("media_metadata").update(data).eq("id", existing.id);
  } else {
    await db.from("media_metadata").insert({
      media_id: mediaId,
      ...data,
    });
  }

  return { success: true };
}

export async function getGalleryAlbums() {
  const db = createDbClient();
  const { data: albums } = await db
    .from("gallery_albums")
    .select("id, slug, title_ar, description_ar, cover_image_url, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return albums || [];
}

export async function getAlbumItems(albumId: string) {
  const db = createDbClient();
  const { data: items } = await db
    .from("gallery_items")
    .select("id, album_id, media_id, sort_order, type")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  if (!items || items.length === 0) return [];

  const mediaIds = items.map((it: any) => it.media_id);
  const { data: mediaRows } = await db
    .from("media_library")
    .select("id, file_name, file_url, webp_url, cdn_url, width, height")
    .in("id", mediaIds);

  const mediaMap = new Map<string, any>();
  (mediaRows || []).forEach((m: any) => mediaMap.set(m.id, m));

  return items.map((it: any) => ({
    id: it.id,
    album_id: it.album_id,
    media_id: it.media_id,
    sort_order: it.sort_order,
    type: it.type,
    media: mediaMap.get(it.media_id) || null,
  }));
}
