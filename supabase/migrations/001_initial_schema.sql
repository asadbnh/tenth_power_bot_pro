-- ═══════════════════════════════════════════════════════════════════════
-- WebTaky Enterprise Platform — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all 35+ tables for the complete platform
-- ═══════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Trigram similarity for search

-- ─── Companies ───────────────────────────────────────────────────────
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_ar TEXT,
  description_en TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#209f4cff',
  accent_color TEXT NOT NULL DEFAULT '#f59e0b',
  whatsapp_number TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  email TEXT,
  website_url TEXT,
  google_maps_embed TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tax_number TEXT,
  commercial_register TEXT,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  social_links JSONB DEFAULT '{}',
  theme_config JSONB DEFAULT '{}',
  default_locale TEXT NOT NULL DEFAULT 'ar',
  supported_locales TEXT[] NOT NULL DEFAULT ARRAY['ar', 'en'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Categories ──────────────────────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── Services ────────────────────────────────────────────────────────
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_description_ar TEXT,
  short_description_en TEXT,
  full_description_ar TEXT,
  full_description_en TEXT,
  cover_image_url TEXT,
  icon TEXT,
  features_ar TEXT[],
  features_en TEXT[],
  price_from DECIMAL(12, 2),
  price_to DECIMAL(12, 2),
  price_unit TEXT,
  show_price BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  seo_keywords_ar JSONB,
  seo_keywords_en JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── Projects ────────────────────────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  client_name TEXT,
  location_ar TEXT,
  location_en TEXT,
  city TEXT,
  project_value DECIMAL(14, 2),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  specifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── Articles ────────────────────────────────────────────────────────
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  author_id UUID,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  read_time_minutes INTEGER NOT NULL DEFAULT 1,
  related_service_ids TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── Testimonials ────────────────────────────────────────────────────
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_company TEXT,
  client_avatar_url TEXT,
  content_ar TEXT NOT NULL,
  content_en TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── FAQs ────────────────────────────────────────────────────────────
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  question_ar TEXT NOT NULL,
  question_en TEXT,
  answer_ar TEXT NOT NULL,
  answer_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  page_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Media Library ───────────────────────────────────────────────────
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  cdn_url TEXT,
  thumbnail_url TEXT,
  webp_url TEXT,
  avif_url TEXT,
  blur_hash TEXT,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  storage_provider TEXT NOT NULL DEFAULT 'r2',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Media Metadata ──────────────────────────────────────────────────
CREATE TABLE media_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  title_ar TEXT,
  title_en TEXT,
  alt_ar TEXT,
  alt_en TEXT,
  caption_ar TEXT,
  caption_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  keywords TEXT[],
  location TEXT,
  author TEXT,
  copyright TEXT,
  exif_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── SEO Metadata ────────────────────────────────────────────────────
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  structured_data JSONB,
  robots TEXT DEFAULT 'index, follow',
  hreflang_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, locale)
);

-- ─── City Pages ──────────────────────────────────────────────────────
CREATE TABLE city_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  city_name_ar TEXT NOT NULL,
  city_name_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  hero_image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  region_ar TEXT,
  region_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── City Services (junction) ────────────────────────────────────────
CREATE TABLE city_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_page_id UUID NOT NULL REFERENCES city_pages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  unique_content_ar TEXT,
  unique_content_en TEXT,
  local_keywords_ar TEXT[],
  local_keywords_en TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_page_id, service_id)
);

-- ─── Users (leads/customers) ────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  city TEXT,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Appointments ────────────────────────────────────────────────────
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  preferred_date TIMESTAMPTZ,
  preferred_time TEXT,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Quote Requests ──────────────────────────────────────────────────
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  description TEXT,
  budget_range TEXT,
  city TEXT,
  urgency TEXT,
  ai_conversation JSONB,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Messages ────────────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'contact',
  is_read BOOLEAN NOT NULL DEFAULT false,
  reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Chat Sessions ──────────────────────────────────────────────────
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  message_count INTEGER NOT NULL DEFAULT 0,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- ─── Chat Messages ──────────────────────────────────────────────────
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  suggested_actions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── AI Prompts ──────────────────────────────────────────────────────
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL DEFAULT 'chat',
  system_prompt_ar TEXT,
  system_prompt_en TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature REAL NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 1000,
  context_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, prompt_type)
);

-- ─── Company Settings ────────────────────────────────────────────────
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  category TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, key)
);

-- ─── Company Contacts ────────────────────────────────────────────────
CREATE TABLE company_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  label_ar TEXT,
  label_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Business Hours ──────────────────────────────────────────────────
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  note_ar TEXT,
  note_en TEXT,
  UNIQUE(company_id, day_of_week)
);

-- ─── Company Addresses ──────────────────────────────────────────────
CREATE TABLE company_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  label_ar TEXT,
  label_en TEXT,
  street_ar TEXT,
  street_en TEXT,
  city_ar TEXT,
  city_en TEXT,
  region_ar TEXT,
  region_en TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- ─── Push Subscriptions ──────────────────────────────────────────────
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Analytics Events ────────────────────────────────────────────────
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  page_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Gallery Albums ──────────────────────────────────────────────────
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  cover_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- ─── Gallery Items ───────────────────────────────────────────────────
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Project Images ──────────────────────────────────────────────────
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false
);

-- ─── Project Videos ──────────────────────────────────────────────────
CREATE TABLE project_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title_ar TEXT,
  title_en TEXT,
  duration_seconds INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ─── Project Before/After ────────────────────────────────────────────
CREATE TABLE project_before_after (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  before_image_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  after_image_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  caption_ar TEXT,
  caption_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ─── Service Images ──────────────────────────────────────────────────
CREATE TABLE service_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false
);

-- ─── Article Images ──────────────────────────────────────────────────
CREATE TABLE article_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  context TEXT
);

-- ─── Article Tags ────────────────────────────────────────────────────
CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_ar TEXT NOT NULL,
  tag_en TEXT,
  slug TEXT NOT NULL,
  UNIQUE(article_id, slug)
);

-- ─── Notification Log ────────────────────────────────────────────────
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  body_ar TEXT,
  body_en TEXT,
  target_audience TEXT,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Audit Log ───────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Telegram Admins ─────────────────────────────────────────────────
CREATE TABLE telegram_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, telegram_user_id)
);

-- ─── Backups ─────────────────────────────────────────────────────────
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  backup_url TEXT,
  type TEXT NOT NULL DEFAULT 'full',
  size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  triggered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Search Index ────────────────────────────────────────────────────
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  search_vector TSVECTOR,
  title TEXT NOT NULL,
  content_preview TEXT,
  url_path TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, locale)
);

-- ─── Customer Reviews ────────────────────────────────────────────────
CREATE TABLE customer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  reviewer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title_ar TEXT,
  title_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  image_urls TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  response_ar TEXT,
  response_en TEXT,
  response_date TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════

-- Company lookups
CREATE INDEX idx_companies_slug ON companies(slug);

-- Category lookups
CREATE INDEX idx_categories_company ON categories(company_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(company_id, slug);

-- Service lookups
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_slug ON services(company_id, slug);
CREATE INDEX idx_services_featured ON services(company_id, is_featured) WHERE is_active = true;

-- Project lookups
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_service ON projects(service_id);
CREATE INDEX idx_projects_slug ON projects(company_id, slug);
CREATE INDEX idx_projects_featured ON projects(company_id, is_featured) WHERE is_active = true;

-- Article lookups
CREATE INDEX idx_articles_company ON articles(company_id);
CREATE INDEX idx_articles_slug ON articles(company_id, slug);
CREATE INDEX idx_articles_status ON articles(company_id, status);
CREATE INDEX idx_articles_published ON articles(company_id, published_at) WHERE status = 'published';

-- Analytics time-series
CREATE INDEX idx_analytics_company_time ON analytics_events(company_id, created_at DESC);
CREATE INDEX idx_analytics_event_type ON analytics_events(company_id, event_type);

-- Search GIN index
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_company_locale ON search_index(company_id, locale);

-- SEO lookups
CREATE INDEX idx_seo_entity ON seo_metadata(entity_type, entity_id);

-- Chat session lookups
CREATE INDEX idx_chat_sessions_company ON chat_sessions(company_id, created_at DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- User lookups
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(company_id, email);

-- Audit log
CREATE INDEX idx_audit_company_time ON audit_log(company_id, created_at DESC);

-- City pages
CREATE INDEX idx_city_pages_company ON city_pages(company_id);
CREATE INDEX idx_city_pages_slug ON city_pages(company_id, slug);

-- ═══════════════════════════════════════════════════════════════════
-- Triggers: Auto-update updated_at timestamp
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_seo_updated_at
  BEFORE UPDATE ON seo_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- Function: Full-text search across content
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  search_locale TEXT DEFAULT 'ar',
  search_company_id UUID DEFAULT NULL,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  content_preview TEXT,
  url_path TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.entity_type,
    si.entity_id,
    si.title,
    si.content_preview,
    si.url_path,
    ts_rank(si.search_vector, websearch_to_tsquery('simple', search_query)) AS rank
  FROM search_index si
  WHERE
    si.locale = search_locale
    AND (search_company_id IS NULL OR si.company_id = search_company_id)
    AND si.search_vector @@ websearch_to_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;
