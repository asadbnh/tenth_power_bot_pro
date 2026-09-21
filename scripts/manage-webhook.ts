/**
 * Telegram Bot Webhook Management Script
 * 
 * Usage:
 *   npx tsx --env-file=.env.local scripts/manage-webhook.ts set [custom_url]
 *   npx tsx --env-file=.env.local scripts/manage-webhook.ts info
 *   npx tsx --env-file=.env.local scripts/manage-webhook.ts delete
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
const customUrlArg = process.argv.slice(3).find((a) => a.startsWith("http"));
const baseUrl = customUrlArg || process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://powerof10.netlify.app";

if (!botToken) {
  console.error("❌ خطأ: TELEGRAM_BOT_TOKEN غير موجود في متغيرات البيئة!");
  process.exit(1);
}

const action = process.argv[2] || "info";

async function main() {
  const telegramApi = `https://api.telegram.org/bot${botToken}`;

  if (action === "info") {
    console.log("🔍 فحص حالة الويب هوك الحالي (Webhook Status)...");
    const res = await fetch(`${telegramApi}/getWebhookInfo`);
    const data = await res.json();
    console.log("\n📊 تفاصيل الويب هوك من تلجرام:");
    console.dir(data, { depth: null });
    
    if (data.result?.url) {
      console.log(`\n✅ الويب هوك مرتبط حالياً مع: ${data.result.url}`);
      if (data.result.has_custom_certificate) console.log("🔒 شهادة مخصصة: نعم");
      if (data.result.pending_update_count > 0) {
        console.log(`⏳ تحديثات في قائمة الانتظار: ${data.result.pending_update_count}`);
      }
      if (data.result.last_error_message) {
        console.log(`⚠️ آخر خطأ واجهه تلجرام: ${data.result.last_error_message}`);
      }
    } else {
      console.log("\n⚠️ لا يوجد ويب هوك مرتبط حالياً (البوت غير مفعل على رابط خارجي).");
      console.log("لتفعيله شغّل: npm run webhook:set");
    }
  } else if (action === "set") {
    const webhookUrl = `${baseUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
    console.log(`🚀 جاري ربط البوت بعنوان الموقع: ${webhookUrl}`);

    const payload: Record<string, any> = {
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    };

    const useSecret = !process.argv.includes("--no-secret");
    if (webhookSecret && useSecret) {
      payload.secret_token = webhookSecret;
      console.log("🛡️ تم تضمين secret_token لحماية المسار.");
    } else {
      console.log("⚡ الربط المباشر بدون secret_token لتجنب أي تعارض في المتغيرات.");
    }

    const res = await fetch(`${telegramApi}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`\n🎉 تم تفعيل الويب هوك بنجاح تام!`);
      console.log(`📌 رابط الاستقبال: ${webhookUrl}`);
      console.log(`📱 البوت الآن يستقبل كافة التحديثات والأوامر مباشرة من تلجرام!`);
    } else {
      console.error(`\n❌ فشل تفعيل الويب هوك:`, data);
    }
  } else if (action === "delete") {
    console.log("🗑️ جاري حذف الويب هوك...");
    const res = await fetch(`${telegramApi}/deleteWebhook?drop_pending_updates=false`);
    const data = await res.json();
    if (data.ok) {
      console.log("✅ تم حذف الويب هوك بنجاح.");
    } else {
      console.error("❌ فشل حذف الويب هوك:", data);
    }
  } else {
    console.log(`أمر غير معروف: ${action}. الخيارات المتاحة: set | info | delete`);
  }
}

main().catch(console.error);
