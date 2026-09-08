import { createDbClient } from "../src/lib/db";

async function main() {
  const db = createDbClient();
  const tables = [
    "companies", "company_contacts", "company_settings", "business_hours", "company_addresses",
    "categories", "services", "service_images", "projects", "project_images", "project_before_after",
    "project_videos", "gallery_albums", "gallery_items", "advertisements", "articles", "article_tags",
    "testimonials", "customer_reviews", "faqs", "city_pages", "city_services", "users", "quote_requests",
    "appointments", "messages", "chat_sessions", "chat_messages", "ai_prompts", "seo_metadata",
    "analytics_events", "search_index", "backups"
  ];

  console.log("=== Live DB Table Row Counts (via createDbClient) ===");
  for (const t of tables) {
    try {
      const { count, error } = await db.from(t).select("*", { count: "exact", head: true });
      if (error) {
        console.log(`❌ ${t.padEnd(24)}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${t.padEnd(24)}: ${count} rows`);
      }
    } catch (e: any) {
      console.log(`❌ ${t.padEnd(24)}: EXCEPTION - ${e.message}`);
    }
  }
}

main().catch(console.error);
