"use server";

/**
 * Server Actions: CRM, Dashboard Metrics & Customer Reviews
 */

import { requireAdminSession, recordAuditAction } from "../auth/guard";
import { getDashboardMetrics } from "../services/dashboard.service";
import {
  getQuoteRequests,
  updateQuoteStatus,
  deleteQuoteRequest,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getContactMessages,
  toggleMessageRead,
  replyToMessage,
  deleteMessage,
  getLeadsUsers,
  deleteUser,
  getChatSessions,
  getChatTranscript,
  deleteChatSession,
} from "../services/crm.service";
import {
  getAdminTestimonials,
  approveTestimonial,
  deleteTestimonial,
  toggleTestimonialFeatured,
  getCustomerReviews,
  toggleCustomerReviewApproved,
  deleteCustomerReview,
} from "../services/reviews.service";
import type { ApiResponse, DashboardStats } from "../types";

// ─── 1. Dashboard Metrics ─────────────────────────────────────────────

export async function getDashboardStatsAction(): Promise<ApiResponse<DashboardStats>> {
  await requireAdminSession();
  const data = await getDashboardMetrics();
  return { success: true, data };
}

// ─── 2. Quotes Actions ────────────────────────────────────────────────

export async function getQuotesAction(statusFilter?: string): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getQuoteRequests(statusFilter);
  return { success: true, data };
}

export async function updateQuoteStatusAction(id: string, status: any): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await updateQuoteStatus(id, status);
  if (res.success) {
    await recordAuditAction({
      action: `update_quote_status_${status}`,
      entityType: "quote_requests",
      entityId: id,
    });
  }
  return { success: res.success, error: res.error };
}

export async function deleteQuoteAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteQuoteRequest(id);
  return { success: res.success, error: res.error };
}

// ─── 3. Appointments Actions ──────────────────────────────────────────

export async function getAppointmentsAction(statusFilter?: string): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAppointments(statusFilter);
  return { success: true, data };
}

export async function updateAppointmentStatusAction(id: string, status: any): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await updateAppointmentStatus(id, status);
  return { success: res.success, error: res.error };
}

export async function deleteAppointmentAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteAppointment(id);
  return { success: res.success, error: res.error };
}

// ─── 4. Messages Actions ──────────────────────────────────────────────

export async function getMessagesAction(unreadOnly = false): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getContactMessages(unreadOnly);
  return { success: true, data };
}

export async function toggleMessageReadAction(id: string, isRead: boolean): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin", "editor"]);
  const res = await toggleMessageRead(id, isRead);
  return { success: res.success, error: res.error };
}

export async function replyMessageAction(id: string, replyText: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await replyToMessage(id, replyText);
  return { success: res.success, error: res.error };
}

export async function deleteMessageAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteMessage(id);
  return { success: res.success, error: res.error };
}

// ─── 5. Leads & Users ─────────────────────────────────────────────────

export async function getLeadsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getLeadsUsers();
  return { success: true, data };
}

export async function deleteLeadAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteUser(id);
  return { success: res.success, error: res.error };
}

// ─── 6. Chat Sessions & Transcripts ───────────────────────────────────

export async function getChatSessionsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getChatSessions();
  return { success: true, data };
}

export async function getChatTranscriptAction(sessionId: string): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getChatTranscript(sessionId);
  return { success: true, data };
}

export async function deleteChatSessionAction(sessionId: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteChatSession(sessionId);
  return { success: res.success, error: res.error };
}

// ─── 7. Reviews Actions ───────────────────────────────────────────────

export async function getTestimonialsAction(pendingOnly = false): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getAdminTestimonials(pendingOnly);
  return { success: true, data };
}

export async function approveTestimonialAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await approveTestimonial(id);
  return { success: res.success, error: res.error };
}

export async function deleteTestimonialAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteTestimonial(id);
  return { success: res.success, error: res.error };
}

export async function toggleTestimonialFeaturedAction(id: string): Promise<ApiResponse<{ is_featured: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleTestimonialFeatured(id);
  return { success: res.success, data: { is_featured: Boolean(res.is_featured) }, error: res.error };
}

export async function getCustomerReviewsAction(): Promise<ApiResponse<any[]>> {
  await requireAdminSession();
  const data = await getCustomerReviews();
  return { success: true, data };
}

export async function toggleCustomerReviewApprovedAction(id: string): Promise<ApiResponse<{ is_approved: boolean }>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await toggleCustomerReviewApproved(id);
  return { success: res.success, data: { is_approved: Boolean(res.is_approved) }, error: res.error };
}

export async function deleteCustomerReviewAction(id: string): Promise<ApiResponse<null>> {
  await requireAdminSession(["super_admin", "admin"]);
  const res = await deleteCustomerReview(id);
  return { success: res.success, error: res.error };
}
