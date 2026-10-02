import { NextRequest, NextResponse } from "next/server";
import { getGalleryItems } from "@/lib/actions/content";
import { getFallbackCompany } from "@/lib/fallback-provider";
import { generateFlyerOgImage } from "@/lib/og/generate-flyer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const rawUrl = searchParams.get("url");
    const locale = searchParams.get("locale") || "ar";

    const company = getFallbackCompany();
    let coverImageUrl = "/images/twenty-five-commercial-center-facade-1.webp";

    if (rawUrl) {
      coverImageUrl = rawUrl;
    } else if (id) {
      const { data: items } = await getGalleryItems().catch(() => ({ data: [] }));
      const found = items?.find((it: any) => String(it.id) === String(id));
      if (found && (found.image_url || found.thumbnail_url)) {
        coverImageUrl = String(found.image_url || found.thumbnail_url);
      }
    }

    const phone = company.phone_primary || "+966 53 243 8253";

    const imageBuffer = await generateFlyerOgImage({
      badgeText: "PORTFOLIO WORK",
      companyName: "TENTH POWER GLASS",
      phone: String(phone),
      coverImageUrl,
      locale,
    });

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[OG Gallery Flyer Generation Error]:", error);
    return new NextResponse("Failed to generate gallery image", { status: 500 });
  }
}
