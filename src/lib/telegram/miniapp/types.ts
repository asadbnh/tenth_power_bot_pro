/**
 * WebTaky Telegram Mini App Types & DTOs
 */

import type { TelegramAdminRole, TelegramWebAppUser } from "../core/types";

export type { TelegramWebAppUser };

export type MiniAppSession = {
  adminId: string;
  telegramUserId: number;
  username?: string;
  name: string;
  role: TelegramAdminRole;
  issuedAt: number;
  expiresAt: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type DashboardStats = {
  totalQuoteRequests: number;
  newQuoteRequests: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalServices: number;
  totalProjects: number;
  totalArticles: number;
  totalReviews: number;
  pendingReviews: number;
  totalMediaFiles: number;
  totalPageViews: number;
  todayPageViews: number;
  maintenanceMode: boolean;
};

export type MediaLibraryItem = {
  id: string;
  file_name: string;
  original_name: string;
  file_url: string;
  cdn_url?: string;
  webp_url?: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  created_at: string;
  alt_ar?: string;
  caption_ar?: string;
  album_id?: string;
};

export type ServiceEntity = {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  short_description_ar?: string;
  short_description_en?: string;
  full_description_ar?: string;
  price_from?: number;
  price_to?: number;
  price_unit?: string;
  cover_image_url?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  rating_avg: number;
  review_count: number;
  images_count?: number;
  category_id?: string;
};

export type ProjectEntity = {
  id: string;
  title_ar: string;
  title_en?: string;
  slug: string;
  description_ar?: string;
  client_name?: string;
  city?: string;
  project_value?: number;
  status: string;
  cover_image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  images_count?: number;
  service_id?: string;
};
