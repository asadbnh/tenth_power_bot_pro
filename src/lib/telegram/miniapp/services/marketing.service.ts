/**
 * WebTaky Mini App Marketing & SEO Service
 * Manages City Pages (Local SEO), SEO Metadata, Search Index, and Analytics.
 */

import { createDbClient } from "@/lib/db";

// ─── 1. City Pages (Local SEO) ────────────────────────────────────────

export async function getAdminCities() {
  const db = createDbClient();
  const { data: cities } = await db
    .from("city_pages")
    .select("id, slug, city_name_ar, city_name_en, region_ar, description_ar, hero_image_url, is_active")
    .order("city_name_ar", { ascending: true });

  return cities || [];
}

export async function upsertCityPage(data: {
  id?: string;
  city_name_ar: string;
  slug?: string;
  region_ar?: string;
  description_ar?: string;
  hero_image_url?: string;
  is_active?: boolean;
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const slug = data.slug || "city-" + Date.now().toString().slice(-6);

  if (data.id) {
    const { error } = await db.from("city_pages").update({
      city_name_ar: data.city_name_ar,
      city_name_en: data.city_name_ar,
      slug,
      region_ar: data.region_ar || "المملكة العربية السعودية",
      region_en: "Saudi Arabia",
      description_ar: data.description_ar,
      description_en: data.description_ar,
      hero_image_url: data.hero_image_url,
      is_active: data.is_active ?? true,
    }).eq("id", data.id);

    return { success: !error, id: data.id, error: error?.message };
  } else {
    const { data: created, error } = await db.from("city_pages").insert({
      company_id: companyId,
      city_name_ar: data.city_name_ar,
      city_name_en: data.city_name_ar,
      slug,
      region_ar: data.region_ar || "المملكة العربية السعودية",
      region_en: "Saudi Arabia",
      description_ar: data.description_ar,
      description_en: data.description_ar,
      hero_image_url: data.hero_image_url,
      is_active: data.is_active ?? true,
    }).select("id").single();

    return { success: !error, id: created?.id, error: error?.message };
  }
}

export async function deleteCityPage(id: string) {
  const db = createDbClient();
  const { error } = await db.from("city_pages").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function toggleCityActive(id: string) {
  const db = createDbClient();
  const { data: city } = await db.from("city_pages").select("is_active").eq("id", id).single();
  if (!city) return { success: false, error: "City not found" };

  const nextVal = !city.is_active;
  await db.from("city_pages").update({ is_active: nextVal }).eq("id", id);
  return { success: true, is_active: nextVal };
}

// ─── 2. SEO Metadata ──────────────────────────────────────────────────

export async function getSeoMetadataList() {
  const db = createDbClient();
  const { data: seo } = await db
    .from("seo_metadata")
    .select("id, entity_type, entity_id, meta_title, meta_description, canonical_url, og_image_url")
    .limit(50);

  return seo || [];
}

export async function updateSeoMetadata(id: string, data: {
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image_url?: string;
}) {
  const db = createDbClient();
  const { error } = await db.from("seo_metadata").update(data).eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 3. Search Index Rebuild ──────────────────────────────────────────

export async function rebuildSearchIndex() {
  const db = createDbClient();
  try {
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    // 1. Index active services
    const { data: services } = await db.from("services").select("id, name_ar, short_description_ar, slug").eq("is_active", true);
    for (const s of services || []) {
      await db.from("search_index").upsert({
        company_id: companyId,
        entity_type: "service",
        entity_id: s.id,
        locale: "ar",
        title: s.name_ar,
        content_preview: s.short_description_ar || "",
        url_path: `/services/${s.slug}`,
      }, { onConflict: "entity_type,entity_id,locale" });
    }

    // 2. Index active projects
    const { data: projects } = await db.from("projects").select("id, title_ar, description_ar, slug").eq("is_active", true);
    for (const p of projects || []) {
      await db.from("search_index").upsert({
        company_id: companyId,
        entity_type: "project",
        entity_id: p.id,
        locale: "ar",
        title: p.title_ar,
        content_preview: (p.description_ar || "").slice(0, 150),
        url_path: `/projects/${p.slug}`,
      }, { onConflict: "entity_type,entity_id,locale" });
    }

    return { success: true, count: (services?.length || 0) + (projects?.length || 0) };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
