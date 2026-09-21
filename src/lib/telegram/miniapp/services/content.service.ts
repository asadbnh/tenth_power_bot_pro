/**
 * WebTaky Mini App Content & Blog Service
 * Complete management for Articles (Blog), Advertisements (Banners), and FAQs.
 */

import { createDbClient } from "@/lib/db";
import { generateArticleWithGemini } from "@/lib/ai";

// ─── 1. Articles / Blog ───────────────────────────────────────────────

export async function getAdminArticles() {
  const db = createDbClient();
  const { data: articles } = await db
    .from("articles")
    .select("id, title_ar, slug, excerpt_ar, status, cover_image_url, is_featured, view_count, published_at, created_at")
    .order("created_at", { ascending: false });

  return articles || [];
}

export async function getArticleDetails(id: string) {
  const db = createDbClient();
  const { data: article } = await db.from("articles").select("*").eq("id", id).single();
  return article || null;
}

export async function upsertArticle(data: {
  id?: string;
  title_ar: string;
  slug?: string;
  excerpt_ar?: string;
  content_ar?: string;
  cover_image_url?: string;
  status?: "draft" | "review" | "published" | "archived";
  is_featured?: boolean;
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const slug = data.slug || "article-" + Date.now().toString().slice(-6);
  const status = data.status || "draft";
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  if (data.id) {
    const { error } = await db.from("articles").update({
      title_ar: data.title_ar,
      title_en: data.title_ar,
      slug,
      excerpt_ar: data.excerpt_ar,
      excerpt_en: data.excerpt_ar,
      content_ar: data.content_ar,
      content_en: data.content_ar,
      cover_image_url: data.cover_image_url,
      status,
      is_featured: data.is_featured ?? false,
      published_at: publishedAt,
    }).eq("id", data.id);

    return { success: !error, id: data.id, error: error?.message };
  } else {
    const { data: created, error } = await db.from("articles").insert({
      company_id: companyId,
      title_ar: data.title_ar,
      title_en: data.title_ar,
      slug,
      excerpt_ar: data.excerpt_ar,
      excerpt_en: data.excerpt_ar,
      content_ar: data.content_ar,
      content_en: data.content_ar,
      cover_image_url: data.cover_image_url,
      status,
      is_featured: data.is_featured ?? false,
      published_at: publishedAt,
    }).select("id").single();

    return { success: !error, id: created?.id, error: error?.message };
  }
}

export async function deleteArticle(id: string) {
  const db = createDbClient();
  const { error } = await db.from("articles").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function toggleArticlePublish(id: string) {
  const db = createDbClient();
  const { data: art } = await db.from("articles").select("status").eq("id", id).single();
  if (!art) return { success: false, error: "Article not found" };

  const nextStatus = art.status === "published" ? "draft" : "published";
  const publishedAt = nextStatus === "published" ? new Date().toISOString() : null;

  await db.from("articles").update({ status: nextStatus, published_at: publishedAt }).eq("id", id);
  return { success: true, status: nextStatus };
}

export async function generateAiArticle(topic: string) {
  try {
    const generated = await generateArticleWithGemini(topic);
    return { success: true, data: generated };
  } catch (err: any) {
    return { success: false, error: err?.message || "AI generation failed" };
  }
}

// ─── 2. Advertisements / Banners ─────────────────────────────────────

export async function getAdminAds() {
  const db = createDbClient();
  const { data: ads } = await db
    .from("advertisements")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return ads || [];
}

export async function upsertAdvertisement(data: {
  id?: string;
  title_ar: string;
  subtitle_ar?: string;
  media_type?: string;
  media_url: string;
  target_route?: string;
  action_title_ar?: string;
  priority?: number;
  is_active?: boolean;
}) {
  const db = createDbClient();

  if (data.id) {
    const { error } = await db.from("advertisements").update({
      title_ar: data.title_ar,
      subtitle_ar: data.subtitle_ar,
      media_type: data.media_type || "image",
      media_url: data.media_url,
      target_route: data.target_route || "/contact",
      action_title_ar: data.action_title_ar || "تواصل معنا الآن",
      priority: data.priority ?? 0,
      is_active: data.is_active ?? true,
    }).eq("id", data.id);

    return { success: !error, id: data.id, error: error?.message };
  } else {
    const { data: created, error } = await db.from("advertisements").insert({
      title_ar: data.title_ar,
      subtitle_ar: data.subtitle_ar,
      media_type: data.media_type || "image",
      media_url: data.media_url,
      target_route: data.target_route || "/contact",
      action_title_ar: data.action_title_ar || "تواصل معنا الآن",
      priority: data.priority ?? 0,
      is_active: data.is_active ?? true,
    }).select("id").single();

    return { success: !error, id: created?.id, error: error?.message };
  }
}

export async function deleteAdvertisement(id: string) {
  const db = createDbClient();
  const { error } = await db.from("advertisements").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function toggleAdvertisementActive(id: string) {
  const db = createDbClient();
  const { data: ad } = await db.from("advertisements").select("is_active").eq("id", id).single();
  if (!ad) return { success: false, error: "Ad not found" };

  const nextVal = !ad.is_active;
  await db.from("advertisements").update({ is_active: nextVal }).eq("id", id);
  return { success: true, is_active: nextVal };
}

// ─── 3. FAQs ─────────────────────────────────────────────────────────

export async function getAdminFaqs() {
  const db = createDbClient();
  const { data: faqs } = await db
    .from("faqs")
    .select("id, question_ar, answer_ar, sort_order, is_active, service_id")
    .order("sort_order", { ascending: true });

  return faqs || [];
}

export async function upsertFaq(data: {
  id?: string;
  question_ar: string;
  answer_ar: string;
  sort_order?: number;
  is_active?: boolean;
  service_id?: string;
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  if (data.id) {
    const { error } = await db.from("faqs").update({
      question_ar: data.question_ar,
      question_en: data.question_ar,
      answer_ar: data.answer_ar,
      answer_en: data.answer_ar,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      service_id: data.service_id || null,
    }).eq("id", data.id);

    return { success: !error, id: data.id, error: error?.message };
  } else {
    const { data: created, error } = await db.from("faqs").insert({
      company_id: companyId,
      question_ar: data.question_ar,
      question_en: data.question_ar,
      answer_ar: data.answer_ar,
      answer_en: data.answer_ar,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      service_id: data.service_id || null,
    }).select("id").single();

    return { success: !error, id: created?.id, error: error?.message };
  }
}

export async function deleteFaq(id: string) {
  const db = createDbClient();
  const { error } = await db.from("faqs").delete().eq("id", id);
  return { success: !error, error: error?.message };
}
