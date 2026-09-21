/**
 * WebTaky Mini App Settings & Organization Service
 * Complete management for Company Profile, Addresses, Hours, AI Prompts, and Admins.
 */

import { createDbClient } from "@/lib/db";

// ─── 1. Company Profile ───────────────────────────────────────────────

export async function getCompanyProfile() {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("*").limit(1).single();
  return company || null;
}

export async function updateCompanyProfile(data: {
  name_ar?: string;
  phone_primary?: string;
  whatsapp_number?: string;
  email?: string;
  tax_number?: string;
  commercial_register?: string;
  maintenance_mode?: boolean;
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  if (!company) return { success: false, error: "Company record not found" };

  const { error } = await db.from("companies").update(data).eq("id", company.id);
  return { success: !error, error: error?.message };
}

export async function toggleMaintenanceMode() {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id, maintenance_mode").limit(1).single();
  if (!company) return { success: false, error: "Company not found" };

  const nextVal = !company.maintenance_mode;
  await db.from("companies").update({ maintenance_mode: nextVal }).eq("id", company.id);
  return { success: true, maintenance_mode: nextVal };
}

// ─── 2. Company Addresses / Branches ─────────────────────────────────

export async function getCompanyAddresses() {
  const db = createDbClient();
  const { data: addresses } = await db
    .from("company_addresses")
    .select("*")
    .order("is_primary", { ascending: false });

  return addresses || [];
}

export async function addCompanyAddress(data: {
  label_ar: string;
  city_ar: string;
  street_ar?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  is_primary?: boolean;
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const { data: created, error } = await db.from("company_addresses").insert({
    company_id: companyId,
    label_ar: data.label_ar,
    label_en: data.label_ar,
    city_ar: data.city_ar,
    city_en: data.city_ar,
    street_ar: data.street_ar || "",
    street_en: data.street_ar || "",
    google_maps_url: data.google_maps_url || "",
    latitude: data.latitude || 24.7136,
    longitude: data.longitude || 46.6753,
    is_primary: data.is_primary ?? false,
  }).select("id").single();

  return { success: !error, id: created?.id, error: error?.message };
}

export async function deleteCompanyAddress(id: string) {
  const db = createDbClient();
  const { error } = await db.from("company_addresses").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 3. Business Hours ────────────────────────────────────────────────

export async function getBusinessHours() {
  const db = createDbClient();
  const { data: hours } = await db
    .from("business_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  return hours || [];
}

export async function updateBusinessHours(dayOfWeek: number, data: {
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
  note_ar?: string;
}) {
  const db = createDbClient();
  const { error } = await db.from("business_hours").update(data).eq("day_of_week", dayOfWeek);
  return { success: !error, error: error?.message };
}

// ─── 4. AI Prompts ────────────────────────────────────────────────────

export async function getAiPromptSettings() {
  const db = createDbClient();
  const { data: prompt } = await db.from("ai_prompts").select("*").limit(1).single();
  return prompt || null;
}

export async function updateAiPromptSettings(data: {
  system_prompt_ar: string;
  model?: string;
  temperature?: number;
}) {
  const db = createDbClient();
  const { data: existing } = await db.from("ai_prompts").select("id").limit(1).single();

  if (existing?.id) {
    const { error } = await db.from("ai_prompts").update(data).eq("id", existing.id);
    return { success: !error, error: error?.message };
  } else {
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";
    const { error } = await db.from("ai_prompts").insert({
      company_id: companyId,
      prompt_type: "chat",
      system_prompt_ar: data.system_prompt_ar,
      model: data.model || "gemini-1.5-flash",
      temperature: data.temperature || 0.7,
    });
    return { success: !error, error: error?.message };
  }
}

// ─── 5. Telegram Admins ───────────────────────────────────────────────

export async function getTelegramAdminsList() {
  const db = createDbClient();
  const { data: admins } = await db
    .from("telegram_admins")
    .select("id, telegram_user_id, telegram_username, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return admins || [];
}

export async function addTelegramAdmin(data: {
  telegram_user_id: number;
  telegram_username?: string;
  role?: "super_admin" | "admin" | "editor";
}) {
  const db = createDbClient();
  const { data: company } = await db.from("companies").select("id").limit(1).single();
  const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

  const { data: created, error } = await db.from("telegram_admins").insert({
    company_id: companyId,
    telegram_user_id: data.telegram_user_id,
    telegram_username: data.telegram_username || "",
    role: data.role || "admin",
    is_active: true,
  }).select("id").single();

  return { success: !error, id: created?.id, error: error?.message };
}

export async function deleteTelegramAdmin(id: string) {
  const db = createDbClient();
  const { error } = await db.from("telegram_admins").delete().eq("id", id);
  return { success: !error, error: error?.message };
}
