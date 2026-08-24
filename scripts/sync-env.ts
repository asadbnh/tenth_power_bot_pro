import * as fs from "fs";
import * as path from "path";

/**
 * Script: sync-env.ts
 * Scans the entire project for all `process.env` references, compares with `.env.local`,
 * auto-populates missing keys (including Firebase service account and Telegram Backup Vault),
 * and generates a complete, clean, well-commented `.env.local` and `.env.example`.
 */

interface EnvDefinition {
  key: string;
  category: string;
  commentAr: string;
  defaultValue?: string;
  autoResolve?: () => string | undefined;
}

// 1. Defined metadata and categorization for all system environment variables
const ENV_METADATA: Record<string, { category: string; commentAr: string; defaultValue?: string; autoResolve?: () => string | undefined }> = {
  // Application
  NEXT_PUBLIC_APP_URL: {
    category: "1. إعدادات الموقع والتطبيق (Application & Core URLs)",
    commentAr: "الرابط الأساسي للموقع الرسمي والـ Web App",
    defaultValue: "https://powerof10.netlify.app",
  },
  NEXT_PUBLIC_APP_NAME: {
    category: "1. إعدادات الموقع والتطبيق (Application & Core URLs)",
    commentAr: "اسم المنصة / الشركة",
    defaultValue: "القوة العاشرة",
  },
  NEXT_PUBLIC_DEFAULT_LOCALE: {
    category: "1. إعدادات الموقع والتطبيق (Application & Core URLs)",
    commentAr: "اللغة الافتراضية للموقع (ar أو en)",
    defaultValue: "ar",
  },
  NEXT_PUBLIC_SUPPORTED_LOCALES: {
    category: "1. إعدادات الموقع والتطبيق (Application & Core URLs)",
    commentAr: "اللغات المدعومة مفصولة بفاصلة",
    defaultValue: "ar,en",
  },
  SITE_URL: {
    category: "1. إعدادات الموقع والتطبيق (Application & Core URLs)",
    commentAr: "رابط الموقع الرسمي المستخدم في رسائل وروابط البوت",
    defaultValue: "https://powerof10.netlify.app",
  },

  // Database
  DATABASE_URL: {
    category: "2. قاعدة البيانات السحابية (Neon PostgreSQL Database)",
    commentAr: "رابط الاتصال المشفر بقاعدة بيانات Neon PostgreSQL لجميع الجداول الـ 40",
    defaultValue: "postgresql://user:pass@ep-xyz.neon.tech/Powerof10?sslmode=require",
  },

  // Cloudflare R2
  R2_ACCOUNT_ID: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "معرّف حساب Cloudflare (Account ID)",
  },
  CLOUDFLARE_ACCOUNT_ID: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "معرّف حساب Cloudflare البديل",
  },
  R2_ACCESS_KEY_ID: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "مفتاح الوصول (Access Key ID)",
  },
  R2_SECRET_ACCESS_KEY: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "المفتاح السري لـ R2 (Secret Access Key)",
  },
  R2_BUCKET_NAME: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "اسم باكت التخزين في Cloudflare R2",
    defaultValue: "powerof",
  },
  R2_PUBLIC_URL: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "رابط الـ CDN العام لعرض الصور والوسائط",
    defaultValue: "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev",
  },
  NEXT_PUBLIC_R2_CUSTOM_DOMAIN: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "الدومين المخصص أو العام لـ Cloudflare R2",
    defaultValue: "pub-e9788e46474044d585e2622e2c6ce74d.r2.dev",
  },
  R2_BUCKET_ENDPOINT: {
    category: "3. التخزين السحابي للوسائط (Cloudflare R2 Object Storage)",
    commentAr: "نقطة نهاية الـ S3 Endpoint المخصصة لـ R2 (اختياري)",
    defaultValue: "",
  },

  // Telegram Bot & Backup Vault
  TELEGRAM_BOT_TOKEN: {
    category: "4. بوت التلجرام وإدارة النظام (Telegram Bot Engine)",
    commentAr: "رمز الوصول السري لبوت التلجرام من BotFather",
  },
  TELEGRAM_WEBHOOK_SECRET: {
    category: "4. بوت التلجرام وإدارة النظام (Telegram Bot Engine)",
    commentAr: "المفتاح السري لتأمين مسار الـ Webhook (/api/telegram/webhook)",
    defaultValue: "webtaky_secret_key_2026",
  },
  TELEGRAM_ADMIN_IDS: {
    category: "4. بوت التلجرام وإدارة النظام (Telegram Bot Engine)",
    commentAr: "أرقام Telegram User IDs لمدراء النظام المعتمدين مفصولة بفواصل",
  },
  TELEGRAM_CHANNEL_ID: {
    category: "4. بوت التلجرام وإدارة النظام (Telegram Bot Engine)",
    commentAr: "معرّف أو يوزر القناة العامة للنشر التلقائي للخدمات والمشاريع (مثال: @TenthPowerSA أو -100xxxxxxxx)",
    defaultValue: "@TenthPowerSA",
  },
  TELEGRAM_BACKUP_CHANNEL_ID: {
    category: "4. بوت التلجرام وإدارة النظام (Telegram Bot Engine)",
    commentAr: "معرّف القناة أو الجروب الخاص بخزنة النسخ الاحتياطي (Telegram Vault) لإرسال ملفات الـ Zip والنسخ الشاملة",
    defaultValue: "@TenthPowerVault",
  },

  // Firebase Admin SDK & Push Notifications
  FIREBASE_SERVICE_ACCOUNT_KEY: {
    category: "5. إشعارات تطبيق الأندرويد (Google Firebase FCM Push Notifications)",
    commentAr: "محتوى ملف JSON الكامل لـ Firebase Service Account (كنص JSON أو Base64 للاستضافة)",
    autoResolve: () => {
      const keyFile = path.join(process.cwd(), "coffee-spark-ai-barista-1b800-firebase-adminsdk-fbsvc-22b98c4ca0.json");
      if (fs.existsSync(keyFile)) {
        try {
          return JSON.stringify(JSON.parse(fs.readFileSync(keyFile, "utf8")));
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  },
  FIREBASE_PROJECT_ID: {
    category: "5. إشعارات تطبيق الأندرويد (Google Firebase FCM Push Notifications)",
    commentAr: "معرّف مشروع Firebase (Project ID)",
    autoResolve: () => {
      const keyFile = path.join(process.cwd(), "coffee-spark-ai-barista-1b800-firebase-adminsdk-fbsvc-22b98c4ca0.json");
      if (fs.existsSync(keyFile)) {
        try {
          return JSON.parse(fs.readFileSync(keyFile, "utf8")).project_id;
        } catch {
          return undefined;
        }
      }
      return "coffee-spark-ai-barista-1b800";
    },
  },
  FIREBASE_CLIENT_EMAIL: {
    category: "5. إشعارات تطبيق الأندرويد (Google Firebase FCM Push Notifications)",
    commentAr: "البريد الإلكتروني لحساب خدمة Firebase (Client Email)",
    autoResolve: () => {
      const keyFile = path.join(process.cwd(), "coffee-spark-ai-barista-1b800-firebase-adminsdk-fbsvc-22b98c4ca0.json");
      if (fs.existsSync(keyFile)) {
        try {
          return JSON.parse(fs.readFileSync(keyFile, "utf8")).client_email;
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  },
  FIREBASE_PRIVATE_KEY: {
    category: "5. إشعارات تطبيق الأندرويد (Google Firebase FCM Push Notifications)",
    commentAr: "المفتاح الخاص لـ Firebase (Private Key)",
    autoResolve: () => {
      const keyFile = path.join(process.cwd(), "coffee-spark-ai-barista-1b800-firebase-adminsdk-fbsvc-22b98c4ca0.json");
      if (fs.existsSync(keyFile)) {
        try {
          const rawKey = JSON.parse(fs.readFileSync(keyFile, "utf8")).private_key;
          return `"${rawKey.replace(/\n/g, "\\n")}"`;
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  },

  // AI Providers
  AI_PROVIDER: {
    category: "6. خدمات الذكاء الاصطناعي والتوليد التلقائي (AI Providers)",
    commentAr: "مزود خدمة الـ AI الأساسي (gemini أو openai)",
    defaultValue: "gemini",
  },
  GOOGLE_AI_API_KEY: {
    category: "6. خدمات الذكاء الاصطناعي والتوليد التلقائي (AI Providers)",
    commentAr: "مفتاح Google Gemini API لتوليد المقالات والمحادثة الذكية",
  },
  GEMINI_MODEL: {
    category: "6. خدمات الذكاء الاصطناعي والتوليد التلقائي (AI Providers)",
    commentAr: "موديل Gemini المستخدم (مثل gemini-1.5-flash أو gemini-2.0-flash)",
    defaultValue: "gemini-1.5-flash",
  },
  OPENAI_API_KEY: {
    category: "6. خدمات الذكاء الاصطناعي والتوليد التلقائي (AI Providers)",
    commentAr: "مفتاح OpenAI API (اختياري كبديل)",
    defaultValue: "",
  },

  // Store & App Download Links
  GOOGLE_PLAY_URL: {
    category: "7. روابط تحميل التطبيقات والمتاجر (App Stores)",
    commentAr: "رابط تطبيق الأندرويد على متجر Google Play",
    defaultValue: "https://play.google.com/store/apps/details?id=com.tenthpower.tenth_power",
  },
  APPLE_APP_STORE_URL: {
    category: "7. روابط تحميل التطبيقات والمتاجر (App Stores)",
    commentAr: "رابط تطبيق الـ iOS على متجر Apple App Store (عند التوفر)",
    defaultValue: "",
  },

  // Web Push VAPID
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: {
    category: "8. إشعارات متصفح الويب (Web Push VAPID Notifications)",
    commentAr: "المفتاح العام لإشعارات الويب للمتصفحات (VAPID Public Key)",
    defaultValue: "your_vapid_public_key",
  },
  VAPID_PRIVATE_KEY: {
    category: "8. إشعارات متصفح الويب (Web Push VAPID Notifications)",
    commentAr: "المفتاح الخاص لإشعارات الويب (VAPID Private Key)",
    defaultValue: "your_vapid_private_key",
  },
  VAPID_SUBJECT: {
    category: "8. إشعارات متصفح الويب (Web Push VAPID Notifications)",
    commentAr: "معرّف أو بريد مرسل إشعارات الويب",
    defaultValue: "mailto:admin@webtaky.com",
  },

  // Marketing & Analytics Pixels
  NEXT_PUBLIC_GA_MEASUREMENT_ID: {
    category: "9. التحليلات والتسويق الرقمي (Analytics & Marketing Pixels)",
    commentAr: "معرّف Google Analytics 4 (مثال: G-XXXXXXXXXX)",
    defaultValue: "G-XXXXXXXXXX",
  },
  NEXT_PUBLIC_FB_PIXEL_ID: {
    category: "9. التحليلات والتسويق الرقمي (Analytics & Marketing Pixels)",
    commentAr: "معرّف Facebook Pixel للإعلانات",
    defaultValue: "",
  },
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: {
    category: "9. التحليلات والتسويق الرقمي (Analytics & Marketing Pixels)",
    commentAr: "معرّف TikTok Pixel",
    defaultValue: "",
  },
  NEXT_PUBLIC_SNAP_PIXEL_ID: {
    category: "9. التحليلات والتسويق الرقمي (Analytics & Marketing Pixels)",
    commentAr: "معرّف Snapchat Pixel",
    defaultValue: "",
  },

  // Sentry Monitoring
  NEXT_PUBLIC_SENTRY_DSN: {
    category: "10. مراقبة الأخطاء والأداء (Sentry Error Monitoring)",
    commentAr: "رابط Sentry DSN لمراقبة أخطاء الواجهة والخادم",
    defaultValue: "",
  },
  SENTRY_AUTH_TOKEN: {
    category: "10. مراقبة الأخطاء والأداء (Sentry Error Monitoring)",
    commentAr: "رمز مصادقة Sentry للـ Source Maps",
    defaultValue: "",
  },

  // Security & Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: {
    category: "11. الأمان والحماية وتحديد معدل الطلبات (Security & Rate Limits)",
    commentAr: "الحد الأقصى للطلبات في الدقيقة للـ IP الواحد",
    defaultValue: "100",
  },
  RATE_LIMIT_WINDOW_MS: {
    category: "11. الأمان والحماية وتحديد معدل الطلبات (Security & Rate Limits)",
    commentAr: "نافذة التقييد بالمللي ثانية (60000 = دقيقة)",
    defaultValue: "60000",
  },
  CSRF_SECRET: {
    category: "11. الأمان والحماية وتحديد معدل الطلبات (Security & Rate Limits)",
    commentAr: "المفتاح السري لتشفير CSRF Tokens",
    defaultValue: "webtaky_csrf_secret_2026",
  },
};

/**
 * Scan workspace files for process.env references
 */
function scanForEnvVars(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === "node_modules" || file === ".next" || file === ".git" || file === "build" || file === "dist") {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForEnvVars(fullPath, fileList);
    } else if (/\.(ts|tsx|js|mjs|json)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function extractEnvKeysFromFiles(files: string[]): Set<string> {
  const keys = new Set<string>();
  const regex = /process\.env\.([A-Z0-9_]+)|process\.env\[['"]([A-Z0-9_]+)['"]\]/g;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1] || match[2];
        if (key && !key.startsWith("NODE_") && !key.startsWith("npm_")) {
          keys.add(key);
        }
      }
    } catch {
      // ignore
    }
  }

  return keys;
}

/**
 * Parse existing .env.local file to retain all current values
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      result[key] = val;
    }
  }

  return result;
}

async function main() {
  console.log("🔍 جاري فحص جميع ملفات المشروع لاكتشاف متغيرات البيئة...");

  const rootDir = process.cwd();
  const searchDirs = [path.join(rootDir, "src"), path.join(rootDir, "scripts")];
  const allFiles: string[] = [];

  for (const d of searchDirs) {
    if (fs.existsSync(d)) {
      scanForEnvVars(d, allFiles);
    }
  }

  const discoveredKeys = extractEnvKeysFromFiles(allFiles);
  console.log(`✨ تم اكتشاف ${discoveredKeys.size} متغيراً في ملفات المشروع البرمجية.\n`);

  // Load existing values from .env.local
  const envLocalPath = path.join(rootDir, ".env.local");
  const existingValues = parseEnvFile(envLocalPath);

  // Combine discovered keys and defined metadata
  const allKnownKeys = new Set([...Object.keys(ENV_METADATA), ...discoveredKeys]);

  // Group by category
  const categories: Record<string, string[]> = {};

  for (const key of allKnownKeys) {
    const meta = ENV_METADATA[key];
    const category = meta?.category || "12. متغيرات بيئة إضافية (Other Discovered Variables)";
    if (!categories[category]) categories[category] = [];
    categories[category].push(key);
  }

  // Construct new .env.local content
  let envContent = `# ═══════════════════════════════════════════════════════════════════
# WebTaky — Enterprise SEO Business Platform
# Comprehensive Environment Variables Configuration
# Generated & Synchronized automatically on ${new Date().toISOString()}
# ═══════════════════════════════════════════════════════════════════\n\n`;

  let exampleContent = `# ═══════════════════════════════════════════════════════════════════
# WebTaky — Environment Variables Template (.env.example)
# Copy this file to .env.local and populate secrets
# ═══════════════════════════════════════════════════════════════════\n\n`;

  const sortedCategories = Object.keys(categories).sort();
  let totalAdded = 0;

  for (const cat of sortedCategories) {
    envContent += `# ─── ${cat} ───\n`;
    exampleContent += `# ─── ${cat} ───\n`;

    const keys = categories[cat].sort();
    for (const key of keys) {
      const meta = ENV_METADATA[key];
      const comment = meta?.commentAr ? `# ${meta.commentAr}\n` : "";
      envContent += comment;
      exampleContent += comment;

      let value = existingValues[key];

      if (value === undefined || value === "") {
        // Try autoResolve if available
        if (meta?.autoResolve) {
          const resolved = meta.autoResolve();
          if (resolved !== undefined) {
            value = resolved;
            console.log(`🤖 تم استخراج القيمة التلقائية لـ: ${key}`);
          }
        }
      }

      if (value === undefined) {
        value = meta?.defaultValue !== undefined ? meta.defaultValue : "";
        totalAdded++;
      }

      // Add to .env.local
      envContent += `${key}=${value}\n`;

      // Add to .env.example (mask secrets)
      const isPublic = key.startsWith("NEXT_PUBLIC_");
      const exampleVal = isPublic ? (meta?.defaultValue || value || "") : (meta?.defaultValue || "your_" + key.toLowerCase());
      exampleContent += `${key}=${exampleVal}\n`;
    }

    envContent += "\n";
    exampleContent += "\n";
  }

  // Write .env.local
  fs.writeFileSync(envLocalPath, envContent.trim() + "\n", "utf8");
  console.log(`\n✅ تم تحديث وتنظيم ملف [${envLocalPath}] بنجاح!`);

  // Write .env.example
  const envExamplePath = path.join(rootDir, ".env.example");
  fs.writeFileSync(envExamplePath, exampleContent.trim() + "\n", "utf8");
  console.log(`✅ تم تحديث ملف القالب [${envExamplePath}] بنجاح!\n`);

  console.log(`📊 إجمالي المتغيرات المضبوطة: ${allKnownKeys.size}`);
}

main().catch(console.error);
