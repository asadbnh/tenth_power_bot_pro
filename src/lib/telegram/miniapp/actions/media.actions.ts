"use server";

/**
 * Server Actions: Media & Visual Studio
 */

import { requireAdminSession, recordAuditAction } from "../auth/guard";
import {
  getMediaList,
  uploadMediaItem,
  deleteMediaItem,
  updateMediaMetadata,
  getGalleryAlbums,
  getAlbumItems,
} from "../services/media.service";
import type { ApiResponse, MediaLibraryItem } from "../types";
import type { R2MediaFolder } from "@/lib/storage/r2";

export async function getMediaListAction(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<ApiResponse<{ items: MediaLibraryItem[]; total: number; page: number; totalPages: number }>> {
  await requireAdminSession();
  try {
    const res = await getMediaList(options);
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to fetch media" };
  }
}

export async function uploadMediaAction(formData: FormData): Promise<ApiResponse<MediaLibraryItem>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "الملف مفقود." };
  }

  const folder = (formData.get("folder") as R2MediaFolder) || "uploads";
  const altAr = (formData.get("alt_ar") as string) || "";
  const captionAr = (formData.get("caption_ar") as string) || "";
  const targetAlbumId = (formData.get("targetAlbumId") as string) || undefined;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMediaItem({
      buffer,
      fileName: file.name,
      contentType: file.type || "image/jpeg",
      folder,
      alt_ar: altAr,
      caption_ar: captionAr,
      targetAlbumId,
    });

    if (!result.success || !result.item) {
      return { success: false, error: result.error || "فشل رفع الصورة" };
    }

    await recordAuditAction({
      action: "upload_media",
      entityType: "media_library",
      entityId: result.item.id,
      newValues: { fileName: file.name, folder, size: file.size },
    });

    return { success: true, data: result.item };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل رفع ومعالجة الصورة" };
  }
}

export async function deleteMediaAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);

  const res = await deleteMediaItem(id);
  if (!res.success) {
    return { success: false, error: res.error || "فشل حذف الصورة" };
  }

  await recordAuditAction({
    action: "delete_media",
    entityType: "media_library",
    entityId: id,
  });

  return { success: true, data: null };
}

export async function updateMediaMetadataAction(
  mediaId: string,
  data: { alt_ar?: string; caption_ar?: string; title_ar?: string }
): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);

  const res = await updateMediaMetadata(mediaId, data);
  return { success: res.success, error: res.error };
}

export async function getGalleryAlbumsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  try {
    const albums = await getGalleryAlbums();
    return { success: true, data: albums };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function getAlbumItemsAction(albumId: string): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  try {
    const items = await getAlbumItems(albumId);
    return { success: true, data: items };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
