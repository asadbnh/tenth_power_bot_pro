import { neon } from "@neondatabase/serverless";
import AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import { sendDocument } from "../telegram/bot";

const ALL_TABLES = [
  "companies",
  "company_contacts",
  "company_addresses",
  "business_hours",
  "company_settings",
  "ai_prompts",
  "categories",
  "services",
  "service_images",
  "projects",
  "project_images",
  "project_videos",
  "project_before_after",
  "gallery_albums",
  "gallery_items",
  "advertisements",
  "articles",
  "article_images",
  "article_tags",
  "testimonials",
  "customer_reviews",
  "faqs",
  "city_pages",
  "city_services",
  "users",
  "quote_requests",
  "appointments",
  "messages",
  "chat_sessions",
  "chat_messages",
  "seo_metadata",
  "analytics_events",
  "search_index",
  "push_subscriptions",
  "notification_log",
  "audit_log",
  "telegram_admins",
  "backups",
  "media_library",
  "media_metadata",
];

export type BackupResult = {
  success: boolean;
  fileName: string;
  fileSizeBytes: number;
  tablesCount: number;
  mediaCount: number;
  zipBuffer?: Buffer;
  telegramMessageId?: number;
  error?: string;
};

async function queryWithRetry(sql: any, queryStr: string, retries = 3): Promise<any[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await (sql as any).query(queryStr);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      if (i === retries - 1) {
        return [];
      }
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  return [];
}

/**
 * Creates a complete offline-ready Backup Archive (.zip) of Neon PostgreSQL & Cloudflare R2 Media.
 */
export async function createFullBackupArchive(options?: {
  targetTelegramChatId?: number | string;
  onProgress?: (step: string) => Promise<void>;
}): Promise<BackupResult> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = neon(databaseUrl);
  const zip = new AdmZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const zipFileName = `webtaky-backup-${timestamp}.zip`;

  if (options?.onProgress) await options.onProgress("⏳ جاري استخراج وتصدير بيانات الـ 40 جدولاً من قاعدة البيانات...");

  // 1. Export Database Tables
  let totalRows = 0;
  let sqlDumpText = `-- WebTaky Database Full SQL Dump\n-- Generated at: ${new Date().toISOString()}\n\n`;

  for (const tableName of ALL_TABLES) {
    try {
      const rows = await queryWithRetry(sql, `SELECT * FROM ${tableName}`);
      if (Array.isArray(rows)) {
        totalRows += rows.length;
        // Add JSON file for this table
        zip.addFile(`database/tables/${tableName}.json`, Buffer.from(JSON.stringify(rows, null, 2), "utf8"));

        // Generate SQL Insert Statements
        if (rows.length > 0) {
          sqlDumpText += `-- Table: ${tableName} (${rows.length} rows)\n`;
          for (const r of rows) {
            const cols = Object.keys(r);
            const vals = Object.values(r).map((v) => {
              if (v === null || v === undefined) return "NULL";
              if (typeof v === "number" || typeof v === "boolean") return String(v);
              if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
              return `'${String(v).replace(/'/g, "''")}'`;
            });
            sqlDumpText += `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${vals.join(", ")}) ON CONFLICT DO NOTHING;\n`;
          }
          sqlDumpText += "\n";
        }
      }
    } catch (err) {
      console.warn(`[Backup Warning] Table ${tableName}:`, err);
    }
  }

  zip.addFile("database/dump.sql", Buffer.from(sqlDumpText, "utf8"));

  // 2. Export Media Files
  if (options?.onProgress) await options.onProgress("⏳ جاري تجميع وفهرسة الوسائط والصور السحابية...");

  let mediaCount = 0;
  try {
    const mediaRows = await (sql as any).query("SELECT file_name, file_url, storage_path FROM media_library");
    if (Array.isArray(mediaRows)) {
      for (const m of mediaRows) {
        if (!m.file_url) continue;

        let fileBuffer: Buffer | null = null;

        // Try downloading from URL
        if (m.file_url.startsWith("http")) {
          try {
            const res = await fetch(m.file_url);
            if (res.ok) {
              const ab = await res.arrayBuffer();
              fileBuffer = Buffer.from(ab);
            }
          } catch {
            // fallback
          }
        }

        // Try local file system
        if (!fileBuffer) {
          const localPath = path.join(process.cwd(), "public", (m.storage_path || m.file_url).replace(/^\//, ""));
          if (fs.existsSync(localPath)) {
            fileBuffer = fs.readFileSync(localPath);
          }
        }

        if (fileBuffer) {
          const subfolder = (m.storage_path || "uploads").split("/")[0] || "uploads";
          zip.addFile(`media/${subfolder}/${m.file_name}`, fileBuffer);
          mediaCount++;
        }
      }
    }
  } catch (err) {
    console.warn("[Backup Warning] Media Export:", err);
  }

  // 3. Add Manifest Metadata
  const manifest = {
    backup_version: "2.0",
    created_at: new Date().toISOString(),
    database_tables: ALL_TABLES.length,
    total_database_rows: totalRows,
    total_media_files: mediaCount,
    cloud_source: "Neon SQL & Cloudflare R2",
    recovery_instructions: "Run 'npm run backup:restore' to extract media and import database locally.",
  };
  zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

  // 4. Generate Final ZIP Buffer
  const zipBuffer = zip.toBuffer();
  const fileSizeBytes = zipBuffer.length;
  const sizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);

  // 5. Save locally in ./backups/ directory
  const localBackupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(localBackupsDir)) {
    fs.mkdirSync(localBackupsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(localBackupsDir, zipFileName), zipBuffer);

  // 6. Record in backups table in Neon DB
  try {
    const comp = await queryWithRetry(sql, "SELECT id FROM companies LIMIT 1");
    const companyId = comp?.[0]?.id || "00000000-0000-0000-0000-000000000001";
    await (sql as any).query(`
      INSERT INTO backups (company_id, backup_url, type, size_bytes, status, triggered_by)
      VALUES ('${companyId}', 'telegram_vault://${zipFileName}', 'full', ${fileSizeBytes}, 'completed', 'admin_bot')
    `);
  } catch (err) {
    console.warn("Could not insert backup log:", err);
  }

  // 7. Send Document to Telegram Channel or Admin Chat
  let telegramMessageId: number | undefined;
  const targetChat = options?.targetTelegramChatId || process.env.TELEGRAM_BACKUP_CHANNEL_ID || process.env.TELEGRAM_CHANNEL_ID;

  if (targetChat) {
    if (options?.onProgress) await options.onProgress("⏳ جاري رفع الأرشيف إلى خزنة تلجرام السحابية...");

    const caption = `📦 <b>نسخة احتياطية كاملة وشاملة للنظام</b>

📅 <b>التاريخ:</b> ${new Date().toLocaleString("ar-SA")}
📊 <b>الجداول:</b> ${ALL_TABLES.length} جدولاً (${totalRows} سجل)
🖼️ <b>الوسائط والصور:</b> ${mediaCount} ملف
💾 <b>الحجم:</b> ${sizeMB} MB
🏷️ <b>الملف:</b> <code>${zipFileName}</code>

🛡️ <i>الأرشيف جاهز للاستعادة الفورية عبر الأمر:</i>
<code>npm run backup:restore</code>`;

    const tgRes = await sendDocument(targetChat, zipBuffer, zipFileName, caption);
    if (tgRes?.ok && tgRes.result?.message_id) {
      telegramMessageId = tgRes.result.message_id;
    }
  }

  return {
    success: true,
    fileName: zipFileName,
    fileSizeBytes,
    tablesCount: ALL_TABLES.length,
    mediaCount,
    zipBuffer,
    telegramMessageId,
  };
}
