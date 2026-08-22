import { neon } from "@neondatabase/serverless";

/**
 * Clean & Truncate All Database Tables in Neon PostgreSQL
 * Purges all tables cleanly to start from scratch.
 */
async function cleanDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("🧹 Starting Complete Database Cleanup in Neon SQL...\n");

  const tables = [
    "audit_log",
    "notification_log",
    "search_index",
    "analytics_events",
    "chat_messages",
    "chat_sessions",
    "messages",
    "appointments",
    "quote_requests",
    "customer_reviews",
    "testimonials",
    "faqs",
    "advertisements",
    "article_images",
    "article_tags",
    "articles",
    "project_before_after",
    "project_videos",
    "project_images",
    "projects",
    "service_images",
    "services",
    "categories",
    "city_services",
    "city_pages",
    "gallery_items",
    "gallery_albums",
    "media_metadata",
    "media_library",
    "seo_metadata",
    "business_hours",
    "company_addresses",
    "company_contacts",
    "company_settings",
    "ai_prompts",
    "telegram_admins",
    "push_subscriptions",
    "backups",
    "users",
    "companies",
  ];

  try {
    const rawSql = `TRUNCATE TABLE ${tables.join(", ")} CASCADE;`;
    await (sql as any).query(rawSql);
    console.log("✅ Successfully truncated all 40 tables with CASCADE!");
  } catch {
    for (const table of tables) {
      try {
        await (sql as any).query(`DELETE FROM ${table};`);
        console.log(`   ✓ Cleaned table: ${table}`);
      } catch (err: any) {
        console.warn(`   ⚠️ Table ${table}: ${err?.message || err}`);
      }
    }
  }

  console.log("\n🎉✨ DATABASE IS COMPLETELY CLEAN AND READY FOR FRESH SEEDING! ✨🎉\n");
}

cleanDatabase().catch(console.error);
