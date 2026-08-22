import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

/**
 * WebTaky Automatic Idempotent Database Seeder for Neon SQL
 * Reads seed-data.json and seeds Neon PostgreSQL tables seamlessly.
 */
async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment variables.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const seedFilePath = path.join(process.cwd(), "scripts", "seed-data.json");
  const rawData = fs.readFileSync(seedFilePath, "utf8");
  const seedData = JSON.parse(rawData);

  console.log("🌱 Starting WebTaky Idempotent Neon Database Auto-Seeding...\n");

  // 1. Seed Company
  console.log("🏢 Seeding Company profile...");
  const companyRows = await sql`
    INSERT INTO companies (
      slug, name_ar, name_en, description_ar, description_en,
      whatsapp_number, phone_primary, email, website_url
    ) VALUES (
      ${seedData.company.slug},
      ${seedData.company.name_ar},
      ${seedData.company.name_en},
      ${seedData.company.description_ar},
      ${seedData.company.description_en},
      ${seedData.company.whatsapp_number},
      ${seedData.company.phone_primary},
      ${seedData.company.email},
      ${seedData.company.website_url}
    )
    ON CONFLICT (slug) DO UPDATE SET
      name_ar = EXCLUDED.name_ar,
      name_en = EXCLUDED.name_en,
      description_ar = EXCLUDED.description_ar,
      description_en = EXCLUDED.description_en,
      whatsapp_number = EXCLUDED.whatsapp_number,
      phone_primary = EXCLUDED.phone_primary,
      email = EXCLUDED.email,
      website_url = EXCLUDED.website_url
    RETURNING id;
  `;

  const company = companyRows[0];
  if (!company?.id) {
    console.error("❌ Error seeding company: No ID returned.");
    return;
  }
  console.log(`✅ Company seeded successfully (ID: ${company.id})\n`);

  // 2. Seed Telegram Admin
  if (seedData.telegram_admin) {
    console.log(`👤 Seeding Telegram Admin (ID: ${seedData.telegram_admin.telegram_user_id})...`);
    await sql`
      INSERT INTO telegram_admins (
        company_id, telegram_user_id, telegram_username, role, is_active
      ) VALUES (
        ${company.id},
        ${seedData.telegram_admin.telegram_user_id},
        ${seedData.telegram_admin.telegram_username},
        ${seedData.telegram_admin.role},
        true
      )
      ON CONFLICT (company_id, telegram_user_id) DO UPDATE SET
        telegram_username = EXCLUDED.telegram_username,
        role = EXCLUDED.role,
        is_active = true;
    `;
    console.log("✅ Telegram Admin authorized & active!\n");
  }

  // 3. Seed Services
  console.log("🛠️ Seeding Services...");
  for (const s of seedData.services) {
    await sql`
      INSERT INTO services (
        company_id, slug, name_ar, name_en,
        short_description_ar, short_description_en,
        full_description_ar, full_description_en,
        icon, is_active, is_featured
      ) VALUES (
        ${company.id},
        ${s.slug},
        ${s.name_ar},
        ${s.name_en},
        ${s.short_ar},
        ${s.short_en},
        ${s.description_ar},
        ${s.description_en},
        ${s.icon},
        true,
        true
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en,
        short_description_ar = EXCLUDED.short_description_ar,
        short_description_en = EXCLUDED.short_description_en,
        full_description_ar = EXCLUDED.full_description_ar,
        full_description_en = EXCLUDED.full_description_en,
        icon = EXCLUDED.icon;
    `;
    console.log(`  ✓ Service seeded: ${s.name_ar}`);
  }

  // 4. Seed FAQs
  console.log("\n❓ Seeding FAQs...");
  // Clear old general FAQs for this company to avoid duplication
  await sql`DELETE FROM faqs WHERE company_id = ${company.id} AND page_context IS NULL;`;
  for (let i = 0; i < seedData.faqs.length; i++) {
    const f = seedData.faqs[i];
    await sql`
      INSERT INTO faqs (
        company_id, question_ar, question_en, answer_ar, answer_en, sort_order, is_active
      ) VALUES (
        ${company.id},
        ${f.question_ar},
        ${f.question_en},
        ${f.answer_ar},
        ${f.answer_en},
        ${i + 1},
        true
      );
    `;
  }

  console.log("\n🎉 WebTaky Auto-Seeding to Neon PostgreSQL Completed Successfully!");
}

seedDatabase().catch(console.error);
