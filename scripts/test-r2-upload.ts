import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 Upload Test Script
 * Tests live connection to Cloudflare R2 S3 API and uploads a test image using official S3 Client.
 */
async function testR2Upload() {
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2PublicUrl = process.env.R2_PUBLIC_URL;

  console.log("☁️ Testing Cloudflare R2 Connection & Upload...\n");
  console.log(`📦 Account ID: ${r2AccountId}`);
  console.log(`🪣 Bucket Name: ${r2Bucket}`);
  console.log(`🌐 Public URL: ${r2PublicUrl}\n`);

  if (!r2AccountId || !r2AccessKeyId || !r2SecretKey || !r2Bucket || !r2PublicUrl) {
    console.error("❌ Missing Cloudflare R2 credentials in environment variables.");
    process.exit(1);
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretKey,
    },
  });

  // 1x1 Red Pixel GIF buffer for testing
  const sampleImageBuffer = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  const testFileName = `test-uploads/test-${Date.now()}.gif`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: testFileName,
        Body: sampleImageBuffer,
        ContentType: "image/gif",
      })
    );

    const publicImageUrl = `${r2PublicUrl}/${testFileName}`;
    console.log("🎉 SUCCESS! Test image uploaded to Cloudflare R2 successfully!");
    console.log(`🔗 Live Cloudflare R2 Image Link:\n${publicImageUrl}\n`);
  } catch (err) {
    console.error("❌ Error during Cloudflare R2 S3 upload:", err);
  }
}

testR2Upload();
