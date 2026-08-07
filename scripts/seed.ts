import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * WebTaky Automatic Idempotent Database Seeder
 * Reads seed-data.json and seeds Supabase tables seamlessly matching 001_initial_schema.sql.
 */
async function seedDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient(supabaseUrl, serviceRoleKey) as any;
  const seedFilePath = path.join(process.cwd(), "scripts", "seed-data.json");
  const rawData = fs.readFileSync(seedFilePath, "utf8");
  const seedData = JSON.parse(rawData);

  console.log("🌱 Starting WebTaky Idempotent Database Auto-Seeding...\n");

  // 1. Seed Company
  console.log("🏢 Seeding Company profile...");
  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .upsert(
      {
        slug: seedData.company.slug,
        name_ar: seedData.company.name_ar,
        name_en: seedData.company.name_en,
        description_ar: seedData.company.description_ar,
        description_en: seedData.company.description_en,
        whatsapp_number: seedData.company.whatsapp_number,
        phone_primary: seedData.company.phone_primary,
        email: seedData.company.email,
        website_url: seedData.company.website_url,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (companyErr) {
    console.error("❌ Error seeding company:", companyErr);
    return;
  }
  console.log(`✅ Company seeded successfully (ID: ${company.id})\n`);

  // 2. Seed Telegram Admin
  if (seedData.telegram_admin) {
    console.log(`👤 Seeding Telegram Admin (ID: ${seedData.telegram_admin.telegram_user_id})...`);
    const { error: adminErr } = await supabase.from("telegram_admins").upsert(
      {
        company_id: company.id,
        telegram_user_id: seedData.telegram_admin.telegram_user_id,
        telegram_username: seedData.telegram_admin.telegram_username,
        role: seedData.telegram_admin.role,
        is_active: true,
      },
      { onConflict: "company_id, telegram_user_id" }
    );
    if (adminErr) console.error("⚠️ Error seeding Telegram admin:", adminErr);
    else console.log("✅ Telegram Admin authorized & active!\n");
  }

  // 3. Seed Services
  console.log("🛠️ Seeding Services...");
  for (const s of seedData.services) {
    const { error: sErr } = await supabase.from("services").upsert(
      {
        company_id: company.id,
        slug: s.slug,
        name_ar: s.name_ar,
        name_en: s.name_en,
        short_description_ar: s.short_ar,
        short_description_en: s.short_en,
        full_description_ar: s.description_ar,
        full_description_en: s.description_en,
        icon: s.icon,
        is_active: true,
        is_featured: true,
      },
      { onConflict: "company_id, slug" }
    );

    if (!sErr) {
      console.log(`  ✓ Service seeded: ${s.name_ar}`);
    } else {
      console.error(`  ❌ Error seeding service ${s.slug}:`, sErr);
    }
  }

  // 4. Seed FAQs
  console.log("\n❓ Seeding FAQs...");
  for (let i = 0; i < seedData.faqs.length; i++) {
    const f = seedData.faqs[i];
    await supabase.from("faqs").insert({
      company_id: company.id,
      question_ar: f.question_ar,
      question_en: f.question_en,
      answer_ar: f.answer_ar,
      answer_en: f.answer_en,
      sort_order: i + 1,
      is_active: true,
    });
  }

  console.log("\n🎉 WebTaky Auto-Seeding Completed Successfully!");
}

seedDatabase().catch(console.error);
