-- ═══════════════════════════════════════════════════════════════════════
-- WebTaky Enterprise Platform — Schema Fixes, Triggers & Analytics
-- Migration: 003_schema_fixes_and_analytics.sql
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Fix Users table: Add UNIQUE constraint on (company_id, phone) for lead upserts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_company_phone_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_company_phone_key UNIQUE (company_id, phone);
    END IF;
END $$;

-- 2. Add review metrics to Services & Projects
ALTER TABLE services ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 5.00;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 5.00;

-- 3. Automatic Search Index Update Trigger Function
CREATE OR REPLACE FUNCTION sync_search_index_trigger()
RETURNS TRIGGER AS $$
DECLARE
  comp_id UUID;
  rec_title TEXT;
  rec_preview TEXT;
  rec_path TEXT;
  rec_entity_type TEXT;
BEGIN
  rec_entity_type := TG_TABLE_NAME;

  IF rec_entity_type = 'services' THEN
    comp_id := NEW.company_id;
    rec_title := COALESCE(NEW.name_ar, NEW.name_en, '');
    rec_preview := COALESCE(NEW.short_description_ar, NEW.short_description_en, '');
    rec_path := '/ar/services/' || NEW.slug;
  ELSIF rec_entity_type = 'projects' THEN
    comp_id := NEW.company_id;
    rec_title := COALESCE(NEW.title_ar, NEW.title_en, '');
    rec_preview := COALESCE(NEW.description_ar, NEW.description_en, '');
    rec_path := '/ar/projects/' || NEW.slug;
  ELSIF rec_entity_type = 'articles' THEN
    comp_id := NEW.company_id;
    rec_title := COALESCE(NEW.title_ar, NEW.title_en, '');
    rec_preview := COALESCE(NEW.excerpt_ar, NEW.excerpt_en, '');
    rec_path := '/ar/blog/' || NEW.slug;
  ELSIF rec_entity_type = 'city_pages' THEN
    comp_id := NEW.company_id;
    rec_title := 'خدمات الزجاج والألمنيوم في ' || COALESCE(NEW.city_name_ar, NEW.city_name_en, '');
    rec_preview := COALESCE(NEW.description_ar, NEW.description_en, '');
    rec_path := '/ar/cities/' || NEW.slug;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO search_index (
    company_id, entity_type, entity_id, locale, title, content_preview, url_path, search_vector
  ) VALUES (
    comp_id, rec_entity_type, NEW.id, 'ar', rec_title, rec_preview, rec_path,
    to_tsvector('simple', rec_title || ' ' || COALESCE(rec_preview, ''))
  )
  ON CONFLICT (entity_type, entity_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    content_preview = EXCLUDED.content_preview,
    url_path = EXCLUDED.url_path,
    search_vector = EXCLUDED.search_vector,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search triggers
DROP TRIGGER IF EXISTS trg_sync_search_services ON services;
CREATE TRIGGER trg_sync_search_services
  AFTER INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION sync_search_index_trigger();

DROP TRIGGER IF EXISTS trg_sync_search_projects ON projects;
CREATE TRIGGER trg_sync_search_projects
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION sync_search_index_trigger();

DROP TRIGGER IF EXISTS trg_sync_search_articles ON articles;
CREATE TRIGGER trg_sync_search_articles
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION sync_search_index_trigger();

DROP TRIGGER IF EXISTS trg_sync_search_city_pages ON city_pages;
CREATE TRIGGER trg_sync_search_city_pages
  AFTER INSERT OR UPDATE ON city_pages
  FOR EACH ROW EXECUTE FUNCTION sync_search_index_trigger();

-- 4. Function: Top Viewed Services Analytics
CREATE OR REPLACE FUNCTION get_top_viewed_services(
  target_company_id UUID,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT,
  view_count INTEGER,
  price_from DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name_ar, s.name_en, s.slug, s.view_count, s.price_from
  FROM services s
  WHERE s.company_id = target_company_id AND s.is_active = true
  ORDER BY s.view_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Function: Top Traffic Search Keywords Analytics
CREATE OR REPLACE FUNCTION get_top_search_keywords(
  target_company_id UUID,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  keyword TEXT,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(metadata->>'query', utm_term, 'المواضيع العامة') AS keyword,
    COUNT(*) AS event_count
  FROM analytics_events
  WHERE company_id = target_company_id
    AND event_type IN ('search', 'page_view', 'quote_submit')
  GROUP BY keyword
  ORDER BY event_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Trigger to Update Service Rating Metrics when Customer Review is approved
CREATE OR REPLACE FUNCTION update_service_ratings_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.service_id IS NOT NULL AND NEW.is_approved = true THEN
    UPDATE services
    SET 
      review_count = (SELECT COUNT(*) FROM customer_reviews WHERE service_id = NEW.service_id AND is_approved = true),
      rating_avg = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM customer_reviews WHERE service_id = NEW.service_id AND is_approved = true), 5.00)
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_service_ratings ON customer_reviews;
CREATE TRIGGER trg_update_service_ratings
  AFTER INSERT OR UPDATE ON customer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_service_ratings_trigger();
