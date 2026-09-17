/**
 * Telegram Admin Bot Stateful Wizard Session Store
 * Handles multi-step conversation flows for Admins & Visitors.
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
  | "awaiting_project_title"
  | "awaiting_project_client"
  | "awaiting_project_city"
  | "awaiting_project_value"
  | "awaiting_project_desc"
  | "awaiting_project_photo"
  | "awaiting_project_cover"
  | "awaiting_project_edit_title"
  | "awaiting_project_edit_city"
  | "awaiting_project_edit_client"
  | "awaiting_project_edit_val"
  | "awaiting_project_edit_desc"
  | "awaiting_ad_title"
  | "awaiting_ad_subtitle"
  | "awaiting_ad_route"
  | "awaiting_ad_action_title"
  | "awaiting_ad_priority"
  | "awaiting_ad_media"
  | "awaiting_ad_edit_title"
  | "awaiting_ad_edit_sub"
  | "awaiting_ad_edit_route"
  | "awaiting_ad_edit_btn"
  | "awaiting_ad_edit_prio"
  | "awaiting_ad_edit_media"
  | "awaiting_ad_link"
  | "awaiting_ad_type"
  | "awaiting_address_city"
  | "awaiting_address_street"
  | "awaiting_address_map"
  | "awaiting_category_name"
  | "awaiting_category_slug"
  | "awaiting_album_title"
  | "awaiting_album_desc"
  | "awaiting_album_cover"
  | "awaiting_album_photo"
  | "awaiting_album_edit_title"
  | "awaiting_album_edit_desc"
  | "awaiting_album_edit_cover"
  | "awaiting_article_ai_topic"
  | "awaiting_company_name"
  | "awaiting_company_phone"
  | "awaiting_company_whatsapp"
  | "awaiting_social_link"
  | "awaiting_admin_add"
  | "awaiting_ai_prompt_text"
  | "awaiting_push_title"
  | "awaiting_push_body"
  | "awaiting_push_screen"
  | "awaiting_service_photo"
  | "awaiting_service_cover"
  | "awaiting_service_edit_cover"
  | "awaiting_service_edit_name"
  | "awaiting_service_edit_price"
  | "awaiting_service_edit_desc"
  | "awaiting_project_video_url"
  | "awaiting_project_video_title"
  | "awaiting_ba_project"
  | "awaiting_ba_caption"
  | "awaiting_ba_before_photo"
  | "awaiting_ba_after_photo"
  | "awaiting_category_edit_name"
  | "awaiting_faq_edit_q"
  | "awaiting_faq_edit_a"
  | "awaiting_article_manual_title"
  | "awaiting_article_manual_excerpt"
  | "awaiting_article_manual_content"
  | "awaiting_article_edit_title"
  | "awaiting_article_edit_excerpt"
  | "awaiting_article_edit_cover"
  | "awaiting_article_photo"
  | "awaiting_city_name"
  | "awaiting_city_region"
  | "awaiting_city_desc"
  | "awaiting_city_edit_desc"
  | "awaiting_company_email"
  | "awaiting_company_tax"
  | "awaiting_company_cr"
  | "awaiting_contact_type"
  | "awaiting_contact_value"
  | "awaiting_hours_time"
  // Visitor Wizard Steps
  | "awaiting_visitor_quote_service"
  | "awaiting_visitor_quote_phone";

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
