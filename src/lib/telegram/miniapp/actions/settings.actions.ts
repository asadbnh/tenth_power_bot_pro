"use server";

/**
 * Server Actions: Organization Settings, Branches, Hours, Cities & Admins
 */

import { requireAdminSession, recordAuditAction } from "../auth/guard";
import {
  getCompanyProfile,
  updateCompanyProfile,
  toggleMaintenanceMode,
  getCompanyAddresses,
  addCompanyAddress,
  deleteCompanyAddress,
  getBusinessHours,
  updateBusinessHours,
  getAiPromptSettings,
  updateAiPromptSettings,
  getTelegramAdminsList,
  addTelegramAdmin,
  deleteTelegramAdmin,
} from "../services/settings.service";
import {
  getAdminCities,
  upsertCityPage,
  deleteCityPage,
  toggleCityActive,
  rebuildSearchIndex,
} from "../services/marketing.service";
import type { ApiResponse } from "../types";

// ─── 1. Company Profile ───────────────────────────────────────────────

export async function getCompanyProfileAction(): Promise<ApiResponse<any>> {
  await requireAdminSession();
  const data = await getCompanyProfile();
  return { success: true, data };
}

export async function updateCompanyProfileAction(profileData: any): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await updateCompanyProfile(profileData);
  if (res.success) {
    await recordAuditAction({
      action: "update_company_profile",
      entityType: "companies",
      newValues: profileData,
    });
  }
  return { success: res.success, error: res.error };
}

export async function toggleMaintenanceModeAction(): Promise<ApiResponse<{ maintenance_mode: boolean }>> {
  await requireAdminSession(["super_admin"]);
  const res = await toggleMaintenanceMode();
  if (res.success) {
    await recordAuditAction({
      action: `toggle_maintenance_mode_${res.maintenance_mode}`,
      entityType: "companies",
    });
  }
  return { success: res.success, data: { maintenance_mode: Boolean(res.maintenance_mode) }, error: res.error };
}

// ─── 2. Addresses / Branches ─────────────────────────────────────────

export async function getAddressesAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getCompanyAddresses();
  return { success: true, data };
}

export async function addAddressAction(data: any): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await addCompanyAddress(data);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteAddressAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteCompanyAddress(id);
  return { success: res.success, error: res.error };
}

// ─── 3. Business Hours ────────────────────────────────────────────────

export async function getHoursAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getBusinessHours();
  return { success: true, data };
}

export async function updateHoursAction(dayOfWeek: number, data: any): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await updateBusinessHours(dayOfWeek, data);
  return { success: res.success, error: res.error };
}

// ─── 4. Cities (Local SEO) ────────────────────────────────────────────

export async function getCitiesAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAdminCities();
  return { success: true, data };
}

export async function upsertCityAction(data: any): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await upsertCityPage(data);
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteCityAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteCityPage(id);
  return { success: res.success, error: res.error };
}

export async function toggleCityActiveAction(id: string): Promise<ApiResponse<{ is_active: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleCityActive(id);
  return { success: res.success, data: { is_active: Boolean(res.is_active) }, error: res.error };
}

// ─── 5. Search Index ──────────────────────────────────────────────────

export async function rebuildSearchIndexAction(): Promise<ApiResponse<{ count: number }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await rebuildSearchIndex();
  return { success: res.success, data: { count: res.count || 0 }, error: res.error };
}

// ─── 6. Telegram Admins ───────────────────────────────────────────────

export async function getAdminsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession(["super_admin"]);
  const data = await getTelegramAdminsList();
  return { success: true, data };
}

export async function addAdminAction(data: { telegram_user_id: number; telegram_username?: string; role?: any }): Promise<ApiResponse<{ id?: string }>> {
  await requireAdminSession(["super_admin"]);
  const res = await addTelegramAdmin(data);
  if (res.success) {
    await recordAuditAction({
      action: "add_admin",
      entityType: "telegram_admins",
      entityId: res.id,
      newValues: { userId: data.telegram_user_id, role: data.role },
    });
  }
  return { success: res.success, data: { id: res.id }, error: res.error };
}

export async function deleteAdminAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin"]);
  const res = await deleteTelegramAdmin(id);
  if (res.success) {
    await recordAuditAction({
      action: "delete_admin",
      entityType: "telegram_admins",
      entityId: id,
    });
  }
  return { success: res.success, error: res.error };
}

// ─── 7. AI Prompts ────────────────────────────────────────────────────

export async function getAiPromptAction(): Promise<ApiResponse<any>> {
  await requireAdminSession(["super_admin", "admin"]);
  const data = await getAiPromptSettings();
  return { success: true, data };
}

export async function updateAiPromptAction(data: { system_prompt_ar: string; model?: string; temperature?: number }): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await updateAiPromptSettings(data);
  return { success: res.success, error: res.error };
}
