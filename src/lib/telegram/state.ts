/**
 * Telegram Admin Bot Stateful Wizard Session Store
 * Handles multi-step conversation flows across all database models.
 */

export type AdminStep =
  | "idle"
  | "awaiting_broadcast_text"
  | "awaiting_setting_value"
  | "awaiting_reply_content"
  | "awaiting_faq_question"
  | "awaiting_faq_answer"
  | "awaiting_service_name"
  | "awaiting_service_desc"
  | "awaiting_service_price"
  | "awaiting_article_ai_topic"
  | "awaiting_company_name"
  | "awaiting_company_phone"
  | "awaiting_company_whatsapp"
  | "awaiting_social_link"
  | "awaiting_admin_add"
  | "awaiting_ai_prompt_text";

export type AdminState = {
  step: AdminStep;
  payload?: Record<string, unknown>;
  updatedAt: number;
};

const userStates = new Map<number, AdminState>();

// State expires after 20 minutes of inactivity
const STATE_TIMEOUT_MS = 20 * 60 * 1000;

export function setAdminState(userId: number, step: AdminStep, payload?: Record<string, unknown>) {
  userStates.set(userId, {
    step,
    payload: payload ?? {},
    updatedAt: Date.now(),
  });
}

export function getAdminState(userId: number): AdminState | null {
  const state = userStates.get(userId);
  if (!state) return null;

  if (Date.now() - state.updatedAt > STATE_TIMEOUT_MS) {
    userStates.delete(userId);
    return null;
  }

  return state;
}

export function clearAdminState(userId: number) {
  userStates.delete(userId);
}
