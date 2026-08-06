import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const ua = request.headers.get("user-agent") ?? "";
    const deviceType = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";
    const referrer = request.headers.get("referer") ?? null;

    await supabase.from("analytics_events").insert({
      event_type: body.event_type ?? "page_view",
      page_path: body.page_path ?? null,
      referrer,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      device_type: deviceType,
      session_id: body.session_id ?? null,
      metadata: body.metadata ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
