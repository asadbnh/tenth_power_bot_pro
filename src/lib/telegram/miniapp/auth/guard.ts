/**
 * Telegram Mini App Security Guard & RBAC
 * Enforces role-based permissions and logs actions to audit_log table.
 */

import { getCurrentAdminSession } from "./session";
import type { TelegramAdminRole } from "../../core/types";
import { createDbClient } from "@/lib/db";

export class UnauthorizedError extends Error {
  constructor(message = "غير مصرح لك بالوصول. يرجى تسجيل الدخول عبر تيليجرام.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAdminSession(allowedRoles?: TelegramAdminRole[]) {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // super_admin always has access to all operations
    if (session.role !== "super_admin" && !allowedRoles.includes(session.role)) {
      throw new ForbiddenError();
    }
  }

  return session;
}

export async function recordAuditAction(params: {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const session = await getCurrentAdminSession();
    const actorId = session ? `${session.name} (${session.telegramUserId})` : "system";

    const db = createDbClient();
    const { data: company } = await db.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    await db.from("audit_log").insert({
      company_id: companyId,
      actor_type: "telegram_admin",
      actor_id: actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      ip_address: params.ipAddress || "miniapp",
    });
  } catch (err) {
    console.warn("[Audit Log Warning]: Could not write audit log entry:", err);
  }
}
