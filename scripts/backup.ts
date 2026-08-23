import { createFullBackupArchive } from "../src/lib/backup";

async function main() {
  console.log("📦 Starting WebTaky Full Backup & Archive Generator...\n");
  const result = await createFullBackupArchive({
    onProgress: async (msg) => {
      console.log(`  ${msg}`);
    },
  });

  console.log("\n✅ Backup generated successfully!");
  console.log(`📁 File Name: ${result.fileName}`);
  console.log(`💾 Size: ${(result.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📊 Database Tables: ${result.tablesCount}`);
  console.log(`🖼️ Media Files: ${result.mediaCount}`);
}

main().catch(console.error);
