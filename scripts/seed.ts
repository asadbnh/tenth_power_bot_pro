import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * WebTaky Automatic Idempotent Database Seeder
 * Reads seed-data.json and seeds Supabase tables seamlessly.
 * Safe to run multiple times without creating duplicates.
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

  // 3. Seed Services & Translations
  console.log("🛠️ Seeding Services...");
  for (const s of seedData.services) {
    const { data: serviceObj, error: sErr } = await supabase
      .from("services")
      .upsert(
        {
          company_id: company.id,
          slug: s.slug,
          icon: s.icon,
          is_active: true,
          is_featured: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (!sErr && serviceObj) {
      // Upsert Arabic translation
      await supabase.from("service_translations").upsert(
        {
          service_id: serviceObj.id,
          locale: "ar",
          name: s.name_ar,
          short_description: s.short_ar,
          description: s.description_ar,
        },
        { onConflict: "service_id, locale" }
      );
      // Upsert English translation
      await supabase.from("service_translations").upsert(
        {
          service_id: serviceObj.id,
          locale: "en",
          name: s.name_en,
          short_description: s.short_en,
          description: s.description_en,
        },
        { onConflict: "service_id, locale" }
      );
      console.log(`  ✓ Service seeded: ${s.name_ar}`);
    }
  }

  // 4. Seed FAQs
  console.log("\n❓ Seeding FAQs...");
  for (let i = 0; i < seedData.faqs.length; i++) {
    const f = seedData.faqs[i];
    const { data: faqObj, error: fErr } = await supabase
      .from("faqs")
      .upsert(
        {
          company_id: company.id,
          sort_order: i + 1,
          is_active: true,
        },
        { onConflict: "id" }
      )
      .select("id")
      .single();

    if (!fErr && faqObj) {
      await supabase.from("faq_translations").upsert(
        { faq_id: faqObj.id, locale: "ar", question: f.question_ar, answer: f.answer_ar },
        { onConflict: "faq_id, locale" }
      );
      await supabase.from("faq_translations").upsert(
        { faq_id: faqObj.id, locale: "en", question: f.question_en, answer: f.answer_en },
        { onConflict: "faq_id, locale" }
      );
    }
  }

  console.log("\n🎉 WebTaky Auto-Seeding Completed Successfully!");
}

seedDatabase().catch(console.error);

//npm run seed

