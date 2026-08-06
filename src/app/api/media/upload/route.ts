import { type NextRequest, NextResponse } from "next/server";
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

  const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY!;
  const r2Bucket = process.env.R2_BUCKET_NAME!;
  const r2PublicUrl = process.env.R2_PUBLIC_URL!;

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const r2Url = `https://${r2AccountId}.r2.cloudflarestorage.com/${r2Bucket}/${fileName}`;
  const buffer = await file.arrayBuffer();

  const uploadRes = await fetch(r2Url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(buffer.byteLength),
      "x-amz-access-key-id": r2AccessKeyId,
      "x-amz-secret-access-key": r2SecretKey,
    },
    body: buffer,
  });

  if (!uploadRes.ok) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const publicUrl = `${r2PublicUrl}/${fileName}`;

  const { data: media } = await supabase
    .from("media")
    .insert({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      url: publicUrl,
      folder,
      uploaded_by: user.id,
    })
    .select("id, url")
    .single();

  return NextResponse.json({ ok: true, url: publicUrl, id: (media as { id: string } | null)?.id });
}
