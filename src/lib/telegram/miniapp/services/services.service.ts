/**
 * WebTaky Mini App Services & Catalog Service
 * Complete management for services, categories, and service gallery images.
 */

import { createDbClient } from "@/lib/db";
import type { ServiceEntity } from "../types";

export async function getAdminServices(): Promise<ServiceEntity[]> {
  const db = createDbClient();
  const { data: services } = await db
    .from("services")
    .select("id, name_ar, name_en, slug, short_description_ar, full_description_ar, price_from, price_to, price_unit, cover_image_url, icon, sort_order, is_active, is_featured, view_count, rating_avg, review_count, category_id")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!services || services.length === 0) return [];

  const { data: images } = await db.from("service_images").select("id, service_id");
  const countMap: Record<string, number> = {};
  (images || []).forEach((img: any) => {
    countMap[img.service_id] = (countMap[img.service_id] || 0) + 1;
  });

  return (services as any[]).map((s) => ({
    ...s,
    images_count: countMap[s.id] || 0,
  }));
}

export async function getServiceDetails(serviceId: string) {
  const db = createDbClient();
  const { data: service } = await db.from("services").select("*").eq("id", serviceId).single();
  if (!service) return null;

  const { data: images } = await db
    .from("service_images")
    .select("id, service_id, media_id, is_cover, sort_order")
    .eq("service_id", serviceId)
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

  return { service, images: enrichedImages };
}

export async function upsertService(data: Partial<ServiceEntity> & { id?: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const slug = data.slug || "service-" + Date.now().toString().slice(-6);

  if (data.id) {
    const { error } = await db.from("services").update({
      name_ar: data.name_ar,
      name_en: data.name_en || data.name_ar,
      slug,
      short_description_ar: data.short_description_ar,
      short_description_en: data.short_description_en || data.short_description_ar,
      full_description_ar: data.full_description_ar,
      full_description_en: data.full_description_ar,
      price_from: data.price_from,
      price_to: data.price_to,
      price_unit: data.price_unit || "متر",
      cover_image_url: data.cover_image_url,
      icon: data.icon || "Layers",
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      category_id: data.category_id || null,
    }).eq("id", data.id);

    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
  } else {
    const { data: created, error } = await db.from("services").insert({
      company_id: companyId,
      name_ar: data.name_ar,
      name_en: data.name_en || data.name_ar,
      slug,
      short_description_ar: data.short_description_ar,
      short_description_en: data.short_description_en || data.short_description_ar,
      full_description_ar: data.full_description_ar,
      full_description_en: data.full_description_ar,
      price_from: data.price_from,
      price_to: data.price_to,
      price_unit: data.price_unit || "متر",
      cover_image_url: data.cover_image_url,
      icon: data.icon || "Layers",
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      category_id: data.category_id || null,
    }).select("id").single();

    if (error || !created) return { success: false, error: error?.message || "Failed to create service" };
    return { success: true, id: created.id };
  }
}

export async function deleteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
  const db = createDbClient();
  const { error } = await db.from("services").delete().eq("id", serviceId);
  return { success: !error, error: error?.message };
}

export async function toggleServiceProperty(serviceId: string, property: "is_active" | "is_featured") {
  const db = createDbClient();
  const { data: s } = await db.from("services").select(property).eq("id", serviceId).single();
  if (!s) return { success: false, error: "Service not found" };

  const nextVal = !s[property];
  await db.from("services").update({ [property]: nextVal }).eq("id", serviceId);
  return { success: true, value: nextVal };
}

export async function addServiceImage(serviceId: string, mediaId: string, isCover = false) {
  const db = createDbClient();
  const { count } = await db.from("service_images").select("*", { count: "exact", head: true }).eq("service_id", serviceId);
  const sortOrder = (count || 0) + 1;

  const { data, error } = await db.from("service_images").insert({
    service_id: serviceId,
    media_id: mediaId,
    is_cover: isCover,
    sort_order: sortOrder,
  }).select("id").single();

  return { success: !error, id: data?.id, error: error?.message };
}

export async function deleteServiceImage(serviceImageId: string) {
  const db = createDbClient();
  const { error } = await db.from("service_images").delete().eq("id", serviceImageId);
  return { success: !error, error: error?.message };
}
