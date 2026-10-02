import { NextRequest, NextResponse } from "next/server";
import { getServiceBySlug } from "@/lib/actions/content";
import { getFallbackCompany } from "@/lib/fallback-provider";
import { generateFlyerOgImage } from "@/lib/og/generate-flyer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const locale = searchParams.get("locale") || "ar";

    const company = getFallbackCompany();
    let coverImageUrl = "/images/twenty-five-commercial-center-facade-1.webp";

    if (slug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = (await getServiceBySlug(slug, locale).catch(() => null)) as any;
      if (service) {
        if (service.cover_image_url) {
          coverImageUrl = String(service.cover_image_url);
        } else if (service.image_url) {
          coverImageUrl = String(service.image_url);
        } else if (service.gallery_images && service.gallery_images.length > 0) {
          coverImageUrl = String(service.gallery_images[0].url);
        }
      }
    }

    const phone = company.phone_primary || "+966 53 243 8253";

    const imageBuffer = await generateFlyerOgImage({
      badgeText: "CERTIFIED SERVICE",
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
    console.error("[OG Service Flyer Generation Error]:", error);
    return new NextResponse("Failed to generate service image", { status: 500 });
  }
}
