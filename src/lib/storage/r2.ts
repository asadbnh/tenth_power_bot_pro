import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export type R2MediaFolder = "services" | "projects" | "gallery" | "advertisements" | "uploads";

const STANDARD_FOLDERS: R2MediaFolder[] = ["services", "projects", "gallery", "advertisements", "uploads"];

/**
 * Returns a configured S3 Client pointing to Cloudflare R2 endpoint.
 */
export function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn("Cloudflare R2 credentials missing in environment variables.");
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Ensures standard folders (services/, projects/, gallery/, advertisements/, uploads/)
 * exist in the Cloudflare R2 bucket on startup or on first call.
 */
export async function ensureR2Folders(): Promise<{ success: boolean; createdFolders: string[] }> {
  const s3 = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME || "powerof";
  const created: string[] = [];

  if (!s3) {
    return { success: false, createdFolders: [] };
  }

  for (const folder of STANDARD_FOLDERS) {
    const keepKey = `${folder}/.keep`;
    try {
      // Check if folder keep marker already exists
      await s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: keepKey,
        })
      );
    } catch {
      // If not exists (404), create it
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: keepKey,
            Body: Buffer.from(""),
            ContentType: "text/plain",
          })
        );
        created.push(folder);
      } catch (err) {
        console.warn(`Could not create folder marker for ${folder}:`, err);
      }
    }
  }

  return { success: true, createdFolders: created };
}

/**
 * Uploads a Buffer (image or video) directly to Cloudflare R2 in the specified folder.
 */
export async function uploadToR2(
  buffer: Buffer,
  folder: R2MediaFolder = "uploads",
  originalName: string,
  contentType: string = "image/jpeg"
): Promise<{
  success: boolean;
  key: string;
  url: string;
  webpUrl?: string;
  error?: string;
}> {
  const s3 = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME || "powerof";
  const publicBaseUrl = (
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN ||
    "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev"
  ).replace(/\/$/, "");

  if (!s3) {
    return { success: false, key: "", url: "", error: "R2 client not configured" };
  }

  // Ensure folders exist on first upload
  await ensureR2Folders();

  const ext = originalName.split(".").pop() || (contentType.includes("video") ? "mp4" : "jpg");
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = `${folder}/${uniqueId}.${ext}`;
  const webpKey = `${folder}/${uniqueId}.webp`;

  let webpBuffer: Buffer | null = null;
  const isImage = contentType.startsWith("image/") && !contentType.includes("gif") && !contentType.includes("svg");

  if (isImage) {
    try {
      const sharp = (await import("sharp")).default;
      webpBuffer = await sharp(buffer).webp({ quality: 84 }).toBuffer();
    } catch {
      // sharp optional fallback
    }
  }

  try {
    // 1. Upload original file
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // 2. Upload WebP optimized version if image
    if (webpBuffer) {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: webpKey,
          Body: webpBuffer,
          ContentType: "image/webp",
        })
      );
    }

    const url = `${publicBaseUrl}/${key}`;
    const webpUrl = webpBuffer ? `${publicBaseUrl}/${webpKey}` : url;

    return {
      success: true,
      key,
      url,
      webpUrl,
    };
  } catch (err: any) {
    console.error("R2 Upload Error:", err);
    return { success: false, key: "", url: "", error: err?.message || "Upload failed" };
  }
}
