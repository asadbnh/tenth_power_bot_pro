/**
 * WebTaky Telegram Unified Master Module
 * Comprehensive integration layer for Telegram Bot & Telegram Mini App.
 */

// ─── 1. Bot Engine & API (Commands, Webhook, Notifications, Keyboards) ─
export * from "./bot";
export * from "./notifications";
export * from "./channel";
export * from "./push";
export * from "./state";
export * from "./wizards";

// ─── 2. Mini App Engine (Auth, Services, Server Actions, DTOs) ────────
export * from "./miniapp/types";
export * from "./miniapp/auth/verify-init-data";
export * from "./miniapp/auth/session";
export * from "./miniapp/auth/guard";

// Services
export * as DashboardService from "./miniapp/services/dashboard.service";
export * as MediaService from "./miniapp/services/media.service";
export * as ServicesService from "./miniapp/services/services.service";
export * as ProjectsService from "./miniapp/services/projects.service";
export * as CrmService from "./miniapp/services/crm.service";
export * as ContentService from "./miniapp/services/content.service";
export * as ReviewsService from "./miniapp/services/reviews.service";
export * as MarketingService from "./miniapp/services/marketing.service";
export * as SettingsService from "./miniapp/services/settings.service";

// Server Actions
export * from "./miniapp/actions/auth.actions";
export * from "./miniapp/actions/media.actions";
export * from "./miniapp/actions/content.actions";
export * from "./miniapp/actions/crm.actions";
export * from "./miniapp/actions/settings.actions";
