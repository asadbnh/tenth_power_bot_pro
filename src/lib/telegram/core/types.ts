/**
 * WebTaky Telegram Core Types
 * Shared definitions for Telegram Bot API & Telegram Mini App
 */

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type TelegramMessage = {
  message_id: number;
  from: { id: number; first_name: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  photo?: Array<{ file_id: string; file_size: number; width: number; height: number }>;
  video?: { file_id: string; file_size?: number; width?: number; height?: number; duration?: number };
  document?: { file_id: string; file_name: string; mime_type: string };
  date: number;
};

export type TelegramCallbackQuery = {
  id: string;
  from: { id: number; first_name: string; username?: string };
  message: TelegramMessage;
  data: string;
};

export type InlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
};

export type InlineKeyboard = {
  inline_keyboard: InlineKeyboardButton[][];
};

export type TelegramAdminRole = "super_admin" | "admin" | "editor";

export type TelegramAdminUser = {
  id: string;
  telegram_user_id: number;
  telegram_username?: string;
  role: TelegramAdminRole;
  is_active: boolean;
  created_at?: string;
};

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};
