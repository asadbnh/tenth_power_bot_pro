/**
 * WebTaky Mini App CRM Service
 * Manages Quote Requests, Appointments, Contact Messages, Customer Leads, and AI Chat Transcripts.
 */

import { createDbClient } from "@/lib/db";

// ─── 1. Quote Requests ────────────────────────────────────────────────

export async function getQuoteRequests(statusFilter?: string) {
  const db = createDbClient();
  let query = db
    .from("quote_requests")
    .select("id, description, budget_range, city, urgency, status, user_id, service_id, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: quotes } = await query;
  if (!quotes || quotes.length === 0) return [];

  // Enrich with user info
  const userIds = quotes.map((q: any) => q.user_id).filter(Boolean);
  let userMap = new Map<string, any>();
  if (userIds.length > 0) {
    const { data: users } = await db.from("users").select("id, full_name, phone, whatsapp, email").in("id", userIds);
    (users || []).forEach((u: any) => userMap.set(u.id, u));
  }

  return quotes.map((q: any) => ({
    ...q,
    user: userMap.get(q.user_id) || null,
  }));
}

export async function updateQuoteStatus(id: string, status: "new" | "contacted" | "quoted" | "won" | "lost") {
  const db = createDbClient();
  const { error } = await db.from("quote_requests").update({ status }).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteQuoteRequest(id: string) {
  const db = createDbClient();
  const { error } = await db.from("quote_requests").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 2. Appointments ──────────────────────────────────────────────────

export async function getAppointments(statusFilter?: string) {
  const db = createDbClient();
  let query = db
    .from("appointments")
    .select("id, status, preferred_date, preferred_time, notes, user_id, service_id, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: appointments } = await query;
  if (!appointments || appointments.length === 0) return [];

  const userIds = appointments.map((a: any) => a.user_id).filter(Boolean);
  let userMap = new Map<string, any>();
  if (userIds.length > 0) {
    const { data: users } = await db.from("users").select("id, full_name, phone").in("id", userIds);
    (users || []).forEach((u: any) => userMap.set(u.id, u));
  }

  return appointments.map((a: any) => ({
    ...a,
    user: userMap.get(a.user_id) || null,
  }));
}

export async function updateAppointmentStatus(id: string, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = createDbClient();
  const { error } = await db.from("appointments").update({ status }).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteAppointment(id: string) {
  const db = createDbClient();
  const { error } = await db.from("appointments").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 3. Contact Messages ──────────────────────────────────────────────

export async function getContactMessages(unreadOnly = false) {
  const db = createDbClient();
  let query = db
    .from("messages")
    .select("id, subject, content, type, is_read, reply, user_id, created_at")
    .order("created_at", { ascending: false });

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data: messages } = await query;
  if (!messages || messages.length === 0) return [];

  const userIds = messages.map((m: any) => m.user_id).filter(Boolean);
  let userMap = new Map<string, any>();
  if (userIds.length > 0) {
    const { data: users } = await db.from("users").select("id, full_name, phone, email").in("id", userIds);
    (users || []).forEach((u: any) => userMap.set(u.id, u));
  }

  return messages.map((m: any) => ({
    ...m,
    user: userMap.get(m.user_id) || null,
  }));
}

export async function toggleMessageRead(id: string, isRead: boolean) {
  const db = createDbClient();
  const { error } = await db.from("messages").update({ is_read: isRead }).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function replyToMessage(id: string, replyText: string) {
  const db = createDbClient();
  const { error } = await db.from("messages").update({ reply: replyText, is_read: true }).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteMessage(id: string) {
  const db = createDbClient();
  const { error } = await db.from("messages").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 4. Leads & Users ─────────────────────────────────────────────────

export async function getLeadsUsers() {
  const db = createDbClient();
  const { data: users } = await db
    .from("users")
    .select("id, full_name, phone, whatsapp, email, city, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return users || [];
}

export async function deleteUser(id: string) {
  const db = createDbClient();
  const { error } = await db.from("users").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ─── 5. Chat Sessions & Transcripts ───────────────────────────────────

export async function getChatSessions() {
  const db = createDbClient();
  const { data: sessions } = await db
    .from("chat_sessions")
    .select("id, status, message_count, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(30);

  return sessions || [];
}

export async function getChatTranscript(sessionId: string) {
  const db = createDbClient();
  const { data: messages } = await db
    .from("chat_messages")
    .select("id, session_id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return messages || [];
}

export async function deleteChatSession(sessionId: string) {
  const db = createDbClient();
  const { error } = await db.from("chat_sessions").delete().eq("id", sessionId);
  return { success: !error, error: error?.message };
}
