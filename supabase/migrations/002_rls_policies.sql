
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

-- ─── PUBLIC READ Policies (anonymous & public can read active content) ───

-- Companies
DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read" ON companies FOR SELECT USING (true);

-- Categories
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_active = true);

-- Services
DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (is_active = true);

-- Projects
DROP POLICY IF EXISTS "projects_public_read" ON projects;
CREATE POLICY "projects_public_read" ON projects FOR SELECT USING (is_active = true);

-- Articles
DROP POLICY IF EXISTS "articles_public_read" ON articles;
CREATE POLICY "articles_public_read" ON articles FOR SELECT USING (status = 'published');

-- Testimonials
DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (is_approved = true);

-- FAQs
DROP POLICY IF EXISTS "faqs_public_read" ON faqs;
CREATE POLICY "faqs_public_read" ON faqs FOR SELECT USING (is_active = true);

-- Media Library
DROP POLICY IF EXISTS "media_library_public_read" ON media_library;
CREATE POLICY "media_library_public_read" ON media_library FOR SELECT USING (true);

-- Media Metadata
DROP POLICY IF EXISTS "media_metadata_public_read" ON media_metadata;
CREATE POLICY "media_metadata_public_read" ON media_metadata FOR SELECT USING (true);

-- SEO Metadata
DROP POLICY IF EXISTS "seo_metadata_public_read" ON seo_metadata;
CREATE POLICY "seo_metadata_public_read" ON seo_metadata FOR SELECT USING (true);

-- City Pages
DROP POLICY IF EXISTS "city_pages_public_read" ON city_pages;
CREATE POLICY "city_pages_public_read" ON city_pages FOR SELECT USING (is_active = true);

-- City Services
DROP POLICY IF EXISTS "city_services_public_read" ON city_services;
CREATE POLICY "city_services_public_read" ON city_services FOR SELECT USING (true);

-- Company Contacts
DROP POLICY IF EXISTS "company_contacts_public_read" ON company_contacts;
CREATE POLICY "company_contacts_public_read" ON company_contacts FOR SELECT USING (true);

-- Business Hours
DROP POLICY IF EXISTS "business_hours_public_read" ON business_hours;
CREATE POLICY "business_hours_public_read" ON business_hours FOR SELECT USING (true);

-- Company Addresses
DROP POLICY IF EXISTS "company_addresses_public_read" ON company_addresses;
CREATE POLICY "company_addresses_public_read" ON company_addresses FOR SELECT USING (true);

-- Gallery Albums
DROP POLICY IF EXISTS "gallery_albums_public_read" ON gallery_albums;
CREATE POLICY "gallery_albums_public_read" ON gallery_albums FOR SELECT USING (is_active = true);

-- Gallery Items
DROP POLICY IF EXISTS "gallery_items_public_read" ON gallery_items;
CREATE POLICY "gallery_items_public_read" ON gallery_items FOR SELECT USING (true);

-- Project Images
DROP POLICY IF EXISTS "project_images_public_read" ON project_images;
CREATE POLICY "project_images_public_read" ON project_images FOR SELECT USING (true);

-- Project Videos
DROP POLICY IF EXISTS "project_videos_public_read" ON project_videos;
CREATE POLICY "project_videos_public_read" ON project_videos FOR SELECT USING (true);

-- Project Before/After
DROP POLICY IF EXISTS "project_before_after_public_read" ON project_before_after;
CREATE POLICY "project_before_after_public_read" ON project_before_after FOR SELECT USING (true);

-- Service Images
DROP POLICY IF EXISTS "service_images_public_read" ON service_images;
CREATE POLICY "service_images_public_read" ON service_images FOR SELECT USING (true);

-- Article Images
DROP POLICY IF EXISTS "article_images_public_read" ON article_images;
CREATE POLICY "article_images_public_read" ON article_images FOR SELECT USING (true);

-- Article Tags
DROP POLICY IF EXISTS "article_tags_public_read" ON article_tags;
CREATE POLICY "article_tags_public_read" ON article_tags FOR SELECT USING (true);

-- Search Index
DROP POLICY IF EXISTS "search_index_public_read" ON search_index;
CREATE POLICY "search_index_public_read" ON search_index FOR SELECT USING (true);

-- AI Prompts
DROP POLICY IF EXISTS "ai_prompts_public_read" ON ai_prompts;
CREATE POLICY "ai_prompts_public_read" ON ai_prompts FOR SELECT USING (is_active = true);

-- Customer Reviews
DROP POLICY IF EXISTS "customer_reviews_public_read" ON customer_reviews;
CREATE POLICY "customer_reviews_public_read" ON customer_reviews FOR SELECT USING (is_approved = true);

-- ─── PUBLIC INSERT/UPDATE Policies (Forms, Leads, Chat, Reviews) ─────

-- Users (Lead capture insert & update for upserts)
DROP POLICY IF EXISTS "users_public_insert" ON users;
CREATE POLICY "users_public_insert" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "users_public_update" ON users;
CREATE POLICY "users_public_update" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- Quote Requests
DROP POLICY IF EXISTS "quote_requests_public_insert" ON quote_requests;
CREATE POLICY "quote_requests_public_insert" ON quote_requests FOR INSERT WITH CHECK (true);

-- Appointments
DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;
CREATE POLICY "appointments_public_insert" ON appointments FOR INSERT WITH CHECK (true);

-- Messages
DROP POLICY IF EXISTS "messages_public_insert" ON messages;
CREATE POLICY "messages_public_insert" ON messages FOR INSERT WITH CHECK (true);

-- Chat Sessions
DROP POLICY IF EXISTS "chat_sessions_public_insert" ON chat_sessions;
CREATE POLICY "chat_sessions_public_insert" ON chat_sessions FOR INSERT WITH CHECK (true);

-- Chat Messages
DROP POLICY IF EXISTS "chat_messages_public_insert" ON chat_messages;
CREATE POLICY "chat_messages_public_insert" ON chat_messages FOR INSERT WITH CHECK (true);

-- Push Subscriptions
DROP POLICY IF EXISTS "push_subscriptions_public_insert" ON push_subscriptions;
CREATE POLICY "push_subscriptions_public_insert" ON push_subscriptions FOR INSERT WITH CHECK (true);

-- Analytics Events
DROP POLICY IF EXISTS "analytics_events_public_insert" ON analytics_events;
CREATE POLICY "analytics_events_public_insert" ON analytics_events FOR INSERT WITH CHECK (true);

-- Customer Reviews
DROP POLICY IF EXISTS "customer_reviews_public_insert" ON customer_reviews;
CREATE POLICY "customer_reviews_public_insert" ON customer_reviews FOR INSERT WITH CHECK (true);

-- ─── SERVICE ROLE Policies (Full Admin & Backend Access) ─────────────

DROP POLICY IF EXISTS "companies_service_all" ON companies;
CREATE POLICY "companies_service_all" ON companies FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_service_all" ON categories;
CREATE POLICY "categories_service_all" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services_service_all" ON services;
CREATE POLICY "services_service_all" ON services FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "projects_service_all" ON projects;
CREATE POLICY "projects_service_all" ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "articles_service_all" ON articles;
CREATE POLICY "articles_service_all" ON articles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_service_all" ON testimonials;
CREATE POLICY "testimonials_service_all" ON testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faqs_service_all" ON faqs;
CREATE POLICY "faqs_service_all" ON faqs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "media_library_service_all" ON media_library;
CREATE POLICY "media_library_service_all" ON media_library FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "media_metadata_service_all" ON media_metadata;
CREATE POLICY "media_metadata_service_all" ON media_metadata FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "seo_metadata_service_all" ON seo_metadata;
CREATE POLICY "seo_metadata_service_all" ON seo_metadata FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "city_pages_service_all" ON city_pages;
CREATE POLICY "city_pages_service_all" ON city_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "city_services_service_all" ON city_services;
CREATE POLICY "city_services_service_all" ON city_services FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_service_all" ON users;
CREATE POLICY "users_service_all" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_service_all" ON appointments;
CREATE POLICY "appointments_service_all" ON appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "quote_requests_service_all" ON quote_requests;
CREATE POLICY "quote_requests_service_all" ON quote_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "messages_service_all" ON messages;
CREATE POLICY "messages_service_all" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "chat_sessions_service_all" ON chat_sessions;
CREATE POLICY "chat_sessions_service_all" ON chat_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "chat_messages_service_all" ON chat_messages;
CREATE POLICY "chat_messages_service_all" ON chat_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ai_prompts_service_all" ON ai_prompts;
CREATE POLICY "ai_prompts_service_all" ON ai_prompts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "company_settings_service_all" ON company_settings;
CREATE POLICY "company_settings_service_all" ON company_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "company_contacts_service_all" ON company_contacts;
CREATE POLICY "company_contacts_service_all" ON company_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "business_hours_service_all" ON business_hours;
CREATE POLICY "business_hours_service_all" ON business_hours FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "company_addresses_service_all" ON company_addresses;
CREATE POLICY "company_addresses_service_all" ON company_addresses FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "push_subscriptions_service_all" ON push_subscriptions;
CREATE POLICY "push_subscriptions_service_all" ON push_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_service_all" ON analytics_events;
CREATE POLICY "analytics_service_all" ON analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_albums_service_all" ON gallery_albums;
CREATE POLICY "gallery_albums_service_all" ON gallery_albums FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_items_service_all" ON gallery_items;
CREATE POLICY "gallery_items_service_all" ON gallery_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "project_images_service_all" ON project_images;
CREATE POLICY "project_images_service_all" ON project_images FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "project_videos_service_all" ON project_videos;
CREATE POLICY "project_videos_service_all" ON project_videos FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "project_before_after_service_all" ON project_before_after;
CREATE POLICY "project_before_after_service_all" ON project_before_after FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_images_service_all" ON service_images;
CREATE POLICY "service_images_service_all" ON service_images FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "article_images_service_all" ON article_images;
CREATE POLICY "article_images_service_all" ON article_images FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "article_tags_service_all" ON article_tags;
CREATE POLICY "article_tags_service_all" ON article_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notification_log_service_all" ON notification_log;
CREATE POLICY "notification_log_service_all" ON notification_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "audit_log_service_all" ON audit_log;
CREATE POLICY "audit_log_service_all" ON audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "telegram_admins_service_all" ON telegram_admins;
CREATE POLICY "telegram_admins_service_all" ON telegram_admins FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "backups_service_all" ON backups;
CREATE POLICY "backups_service_all" ON backups FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "search_index_service_all" ON search_index;
CREATE POLICY "search_index_service_all" ON search_index FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "customer_reviews_service_all" ON customer_reviews;
CREATE POLICY "customer_reviews_service_all" ON customer_reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
