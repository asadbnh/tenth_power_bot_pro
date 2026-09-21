/**
 * WebTaky Mini App Reviews Service
 * Complete management for Testimonials and Direct Customer Reviews.
 */

import { createDbClient } from "@/lib/db";

// ─── 1. Testimonials (Site Endorsements) ───────────────────────────────

export async function getAdminTestimonials(pendingOnly = false) {
  const db = createDbClient();
  let query = db
    .from("testimonials")
    .select("id, client_name, client_title, content_ar, rating, is_approved, is_featured, created_at")
    .order("created_at", { ascending: false });

  if (pendingOnly) {
    query = query.eq("is_approved", false);
  }

  const { data: reviews } = await query;
  return reviews || [];
}

export async function approveTestimonial(id: string) {
  const db = createDbClient();
  const { error } = await db.from("testimonials").update({ is_approved: true }).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteTestimonial(id: string) {
  const db = createDbClient();
  const { error } = await db.from("testimonials").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function toggleTestimonialFeatured(id: string) {
  const db = createDbClient();
  const { data: rev } = await db.from("testimonials").select("is_featured").eq("id", id).single();
  if (!rev) return { success: false, error: "Not found" };

  const nextVal = !rev.is_featured;
  await db.from("testimonials").update({ is_featured: nextVal }).eq("id", id);
  return { success: true, is_featured: nextVal };
}

// ─── 2. Direct Customer Reviews ───────────────────────────────────────

export async function getCustomerReviews() {
  const db = createDbClient();
  const { data: reviews } = await db
    .from("customer_reviews")
    .select("id, reviewer_name, reviewer_phone, rating, content_ar, is_verified, is_approved, created_at")
    .order("created_at", { ascending: false });

  return reviews || [];
}

export async function toggleCustomerReviewApproved(id: string) {
  const db = createDbClient();
  const { data: rev } = await db.from("customer_reviews").select("is_approved").eq("id", id).single();
  if (!rev) return { success: false, error: "Not found" };

  const nextVal = !rev.is_approved;
  await db.from("customer_reviews").update({ is_approved: nextVal }).eq("id", id);
  return { success: true, is_approved: nextVal };
}

export async function deleteCustomerReview(id: string) {
  const db = createDbClient();
  const { error } = await db.from("customer_reviews").delete().eq("id", id);
  return { success: !error, error: error?.message };
}
