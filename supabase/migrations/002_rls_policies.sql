-- ═══════════════════════════════════════════════════════════════════════
-- WebTaky Enterprise Platform — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Description: Enable RLS and create policies for all tables
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Enable RLS on all tables ────────────────────────────────────────
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_before_after ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- ─── PUBLIC READ Policies (anonymous can read public content) ─────────

-- Companies: anyone can read (needed for multi-tenant routing)
CREATE POLICY "companies_public_read"
  ON companies FOR SELECT
  USING (true);

-- Categories: public can read active
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (is_active = true);

-- Services: public can read active
CREATE POLICY "services_public_read"
  ON services FOR SELECT
  USING (is_active = true);

-- Projects: public can read active
CREATE POLICY "projects_public_read"
  ON projects FOR SELECT
  USING (is_active = true);

-- Articles: public can read published
CREATE POLICY "articles_public_read"
  ON articles FOR SELECT
  USING (status = 'published');

-- Testimonials: public can read approved
CREATE POLICY "testimonials_public_read"
  ON testimonials FOR SELECT
  USING (is_approved = true);

-- FAQs: public can read active
CREATE POLICY "faqs_public_read"
  ON faqs FOR SELECT
  USING (is_active = true);

-- Media: public can read
CREATE POLICY "media_library_public_read"
  ON media_library FOR SELECT
  USING (true);

-- Media metadata: public can read
CREATE POLICY "media_metadata_public_read"
  ON media_metadata FOR SELECT
  USING (true);

-- SEO metadata: public can read
CREATE POLICY "seo_metadata_public_read"
  ON seo_metadata FOR SELECT
  USING (true);

-- City pages: public can read active
CREATE POLICY "city_pages_public_read"
  ON city_pages FOR SELECT
  USING (is_active = true);

-- City services: public can read
CREATE POLICY "city_services_public_read"
  ON city_services FOR SELECT
  USING (true);

-- Company contacts: public can read
CREATE POLICY "company_contacts_public_read"
  ON company_contacts FOR SELECT
  USING (true);

-- Business hours: public can read
CREATE POLICY "business_hours_public_read"
  ON business_hours FOR SELECT
  USING (true);

-- Company addresses: public can read
CREATE POLICY "company_addresses_public_read"
  ON company_addresses FOR SELECT
  USING (true);

-- Gallery albums: public can read active
CREATE POLICY "gallery_albums_public_read"
  ON gallery_albums FOR SELECT
  USING (is_active = true);

-- Gallery items: public can read
CREATE POLICY "gallery_items_public_read"
  ON gallery_items FOR SELECT
  USING (true);

-- Project images: public can read
CREATE POLICY "project_images_public_read"
  ON project_images FOR SELECT
  USING (true);

-- Project videos: public can read
CREATE POLICY "project_videos_public_read"
  ON project_videos FOR SELECT
  USING (true);

-- Project before/after: public can read
CREATE POLICY "project_before_after_public_read"
  ON project_before_after FOR SELECT
  USING (true);

-- Service images: public can read
CREATE POLICY "service_images_public_read"
  ON service_images FOR SELECT
  USING (true);

-- Article images: public can read
CREATE POLICY "article_images_public_read"
  ON article_images FOR SELECT
  USING (true);

-- Article tags: public can read
CREATE POLICY "article_tags_public_read"
  ON article_tags FOR SELECT
  USING (true);

-- Search index: public can read
CREATE POLICY "search_index_public_read"
  ON search_index FOR SELECT
  USING (true);

-- AI prompts: only active ones accessible (for chat widget)
CREATE POLICY "ai_prompts_public_read"
  ON ai_prompts FOR SELECT
  USING (is_active = true);

-- Customer reviews: public can read approved
CREATE POLICY "customer_reviews_public_read"
  ON customer_reviews FOR SELECT
  USING (is_approved = true);

-- ─── PUBLIC INSERT Policies (anonymous can submit) ─────────────────

-- Users: anyone can create a user record (lead capture)
CREATE POLICY "users_public_insert"
  ON users FOR INSERT
  WITH CHECK (true);

-- Quote requests: anyone can submit
CREATE POLICY "quote_requests_public_insert"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Appointments: anyone can book
CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Messages: anyone can send a contact message
CREATE POLICY "messages_public_insert"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Chat sessions: anyone can start a chat
CREATE POLICY "chat_sessions_public_insert"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

-- Chat messages: anyone can send within their session
CREATE POLICY "chat_messages_public_insert"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Push subscriptions: anyone can subscribe
CREATE POLICY "push_subscriptions_public_insert"
  ON push_subscriptions FOR INSERT
  WITH CHECK (true);

-- Analytics events: anyone can fire events
CREATE POLICY "analytics_events_public_insert"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Customer reviews: public can submit (pending approval)
CREATE POLICY "customer_reviews_public_insert"
  ON customer_reviews FOR INSERT
  WITH CHECK (true);

-- ─── SERVICE ROLE Policies (full admin access via service key) ────────

-- Companies
CREATE POLICY "companies_service_all"
  ON companies FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Categories
CREATE POLICY "categories_service_all"
  ON categories FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Services
CREATE POLICY "services_service_all"
  ON services FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Projects
CREATE POLICY "projects_service_all"
  ON projects FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Articles
CREATE POLICY "articles_service_all"
  ON articles FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Testimonials
CREATE POLICY "testimonials_service_all"
  ON testimonials FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- FAQs
CREATE POLICY "faqs_service_all"
  ON faqs FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Media library
CREATE POLICY "media_library_service_all"
  ON media_library FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Telegram admins
CREATE POLICY "telegram_admins_service_all"
  ON telegram_admins FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Audit log (insert only, never delete)
CREATE POLICY "audit_log_service_insert"
  ON audit_log FOR INSERT
  WITH CHECK (current_setting('role', true) = 'service_role');

CREATE POLICY "audit_log_service_select"
  ON audit_log FOR SELECT
  USING (current_setting('role', true) = 'service_role');

-- Backups
CREATE POLICY "backups_service_all"
  ON backups FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Users (service can read/update, not delete)
CREATE POLICY "users_service_all"
  ON users FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Quote requests
CREATE POLICY "quote_requests_service_all"
  ON quote_requests FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Messages
CREATE POLICY "messages_service_all"
  ON messages FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Appointments
CREATE POLICY "appointments_service_all"
  ON appointments FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Notification log
CREATE POLICY "notification_log_service_all"
  ON notification_log FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Company settings
CREATE POLICY "company_settings_service_all"
  ON company_settings FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- AI prompts
CREATE POLICY "ai_prompts_service_all"
  ON ai_prompts FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Analytics
CREATE POLICY "analytics_service_all"
  ON analytics_events FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Push subscriptions
CREATE POLICY "push_subscriptions_service_all"
  ON push_subscriptions FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Search index
CREATE POLICY "search_index_service_all"
  ON search_index FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- Customer reviews
CREATE POLICY "customer_reviews_service_all"
  ON customer_reviews FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

-- SEO metadata
CREATE POLICY "seo_metadata_service_all"
  ON seo_metadata FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');
