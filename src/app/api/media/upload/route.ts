import { type NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "uploads";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 415 });

  const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME || "powerof";
  const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev";

  const ext = file.name.split(".").pop() ?? "jpg";
  const baseName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fileName = `${baseName}.${ext}`;
  const webpFileName = `${baseName}.webp`;

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  let webpBuffer = rawBuffer;
  let width: number | undefined;
  let height: number | undefined;

  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(rawBuffer).metadata();
    width = metadata.width;
    height = metadata.height;

    webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 82 })
      .toBuffer();
  } catch (err) {
    console.warn("Sharp image processing warning:", err);
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId!,
      secretAccessKey: r2SecretKey!,
    },
  });

  try {
    // Upload Original File
    await s3.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: fileName,
        Body: rawBuffer,
        ContentType: file.type,
      })
    );

    // Upload WebP Version
    await s3.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: webpFileName,
        Body: webpBuffer,
        ContentType: "image/webp",
      })
    );
  } catch (err) {
    console.error("R2 S3 Upload Error:", err);
    return NextResponse.json({ error: "Cloudflare R2 Upload failed" }, { status: 500 });
  }

  const publicUrl = `${r2PublicUrl}/${fileName}`;
  const webpPublicUrl = `${r2PublicUrl}/${webpFileName}`;

  const { data: media } = await supabase
    .from("media_library")
    .insert({
      file_name: fileName,
      original_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      storage_provider: "r2",
      storage_path: fileName,
      file_url: publicUrl,
      cdn_url: publicUrl,
      webp_url: webpPublicUrl,
      width: width || 1200,
      height: height || 800,
    })
    .select("id, file_url, webp_url")
    .single();

  return NextResponse.json({
    ok: true,
    url: publicUrl,
    webp_url: webpPublicUrl,
    id: (media as { id: string } | null)?.id,
  });
}
