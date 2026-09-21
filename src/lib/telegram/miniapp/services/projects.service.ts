/**
 * WebTaky Mini App Projects Service
 * Complete management for projects, project images, project videos, and before/after sliders.
 */

import { createDbClient } from "@/lib/db";
import type { ProjectEntity } from "../types";

export async function getAdminProjects(): Promise<ProjectEntity[]> {
  const db = createDbClient();
  const { data: projects } = await db
    .from("projects")
    .select("id, title_ar, title_en, slug, description_ar, client_name, city, project_value, status, cover_image_url, is_active, is_featured, view_count, created_at, service_id")
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) return [];

  const { data: images } = await db.from("project_images").select("id, project_id");
  const countMap: Record<string, number> = {};
  (images || []).forEach((img: any) => {
    countMap[img.project_id] = (countMap[img.project_id] || 0) + 1;
  });

  return (projects as any[]).map((p) => ({
    ...p,
    images_count: countMap[p.id] || 0,
  }));
}

export async function getProjectDetails(projectId: string) {
  const db = createDbClient();
  const { data: project } = await db.from("projects").select("*").eq("id", projectId).single();
  if (!project) return null;

  // 1. Fetch images
  const { data: images } = await db
    .from("project_images")
    .select("id, project_id, media_id, is_cover, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const mediaIds = (images || []).map((img: any) => img.media_id);
  let mediaMap = new Map<string, any>();
  if (mediaIds.length > 0) {
    const { data: mediaRows } = await db
      .from("media_library")
      .select("id, file_name, file_url, webp_url")
      .in("id", mediaIds);
    (mediaRows || []).forEach((m: any) => mediaMap.set(m.id, m));
  }

  const enrichedImages = (images || []).map((img: any) => ({
    ...img,
    media: mediaMap.get(img.media_id) || null,
  }));

  // 2. Fetch videos
  const { data: videos } = await db
    .from("project_videos")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  // 3. Fetch Before / After
  const { data: beforeAfter } = await db
    .from("project_before_after")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  return {
    project,
    images: enrichedImages,
    videos: videos || [],
    beforeAfter: beforeAfter || [],
  };
}

export async function upsertProject(data: Partial<ProjectEntity> & { id?: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const slug = data.slug || "project-" + Date.now().toString().slice(-6);

  if (data.id) {
    const { error } = await db.from("projects").update({
      title_ar: data.title_ar,
      title_en: data.title_en || data.title_ar,
      slug,
      description_ar: data.description_ar,
      description_en: data.description_ar,
      client_name: data.client_name,
      city: data.city || "الرياض",
      project_value: data.project_value,
      status: data.status || "completed",
      cover_image_url: data.cover_image_url,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      service_id: data.service_id || null,
    }).eq("id", data.id);

    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
  } else {
    const { data: created, error } = await db.from("projects").insert({
      company_id: companyId,
      title_ar: data.title_ar,
      title_en: data.title_en || data.title_ar,
      slug,
      description_ar: data.description_ar,
      description_en: data.description_ar,
      client_name: data.client_name,
      city: data.city || "الرياض",
      project_value: data.project_value,
      status: data.status || "completed",
      cover_image_url: data.cover_image_url,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      service_id: data.service_id || null,
    }).select("id").single();

    if (error || !created) return { success: false, error: error?.message || "Failed to create project" };
    return { success: true, id: created.id };
  }
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  const db = createDbClient();
  const { error } = await db.from("projects").delete().eq("id", projectId);
  return { success: !error, error: error?.message };
}

export async function toggleProjectProperty(projectId: string, property: "is_active" | "is_featured") {
  const db = createDbClient();
  const { data: p } = await db.from("projects").select(property).eq("id", projectId).single();
  if (!p) return { success: false, error: "Project not found" };

  const nextVal = !p[property];
  await db.from("projects").update({ [property]: nextVal }).eq("id", projectId);
  return { success: true, value: nextVal };
}

export async function addProjectImage(projectId: string, mediaId: string, isCover = false) {
  const db = createDbClient();
  const { count } = await db.from("project_images").select("*", { count: "exact", head: true }).eq("project_id", projectId);
  const sortOrder = (count || 0) + 1;

  const { data, error } = await db.from("project_images").insert({
    project_id: projectId,
    media_id: mediaId,
    is_cover: isCover,
    sort_order: sortOrder,
  }).select("id").single();

  return { success: !error, id: data?.id, error: error?.message };
}

export async function deleteProjectImage(projectImageId: string) {
  const db = createDbClient();
  const { error } = await db.from("project_images").delete().eq("id", projectImageId);
  return { success: !error, error: error?.message };
}

export async function addProjectVideo(projectId: string, videoUrl: string, titleAr?: string) {
  const db = createDbClient();
  const { data, error } = await db.from("project_videos").insert({
    project_id: projectId,
    video_url: videoUrl,
    title_ar: titleAr || "فيديو توثيقي للمشروع",
  }).select("id").single();

  return { success: !error, id: data?.id, error: error?.message };
}

export async function deleteProjectVideo(videoId: string) {
  const db = createDbClient();
  const { error } = await db.from("project_videos").delete().eq("id", videoId);
  return { success: !error, error: error?.message };
}

export async function addProjectBeforeAfter(params: {
  projectId: string;
  beforeImageId: string;
  afterImageId: string;
  captionAr?: string;
}) {
  const db = createDbClient();
  const { data, error } = await db.from("project_before_after").insert({
    project_id: params.projectId,
    before_image_id: params.beforeImageId,
    after_image_id: params.afterImageId,
    caption_ar: params.captionAr || "مقارنة قبل وبعد التنفيذ",
  }).select("id").single();

  return { success: !error, id: data?.id, error: error?.message };
}

export async function deleteProjectBeforeAfter(id: string) {
  const db = createDbClient();
  const { error } = await db.from("project_before_after").delete().eq("id", id);
  return { success: !error, error: error?.message };
}
