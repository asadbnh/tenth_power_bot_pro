import { restoreFromBackup } from "../src/lib/backup";

async function main() {
  console.log("🔄 Starting WebTaky Local Recovery & Restore Process...\n");
  const result = await restoreFromBackup({
    onProgress: (msg) => {
      console.log(`  ${msg}`);
    },
  });

  console.log("\n✅ Restoration completed successfully!");
  console.log(`📊 Tables Restored: ${result.tablesRestoredCount}`);
  console.log(`🖼️ Media Files Extracted to public/images/restored/: ${result.mediaFilesExtractedCount}`);
}

main().catch(console.error);
