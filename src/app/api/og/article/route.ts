import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/actions/content";
import { getFallbackCompany } from "@/lib/fallback-provider";
import { generateFlyerOgImage } from "@/lib/og/generate-flyer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const locale = searchParams.get("locale") || "ar";

    const isAr = locale === "ar";
    const company = getFallbackCompany();

    let title = isAr ? "نصائح وإرشادات معمارية وهندسية" : "Architectural & Engineering Guide";
    let category = isAr ? "نصائح وإرشادات" : "Tips & Guides";
    let coverImageUrl = "/images/twenty-five-commercial-center-facade-1.webp";

    if (slug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const article = (await getArticleBySlug(slug, locale).catch(() => null)) as any;
      if (article) {
        title = isAr
          ? (article.title_ar || article.title || title)
          : (article.title_en || article.title || title);

        category = isAr
          ? (article.category_ar || article.category || category)
          : (article.category_en || article.category || category);

        if (article.cover_image_url) {
          coverImageUrl = String(article.cover_image_url);
        } else if (article.featured_image_url) {
          coverImageUrl = String(article.featured_image_url);
        }
      }
    }

    const companyName = isAr
      ? (company.name_ar ? "مؤسسة القوة العاشرة للزجاج" : "مؤسسة القوة العاشرة")
      : (company.name_en || "Tenth Power Glass Est.");

    const phone = company.phone_primary || "+966 53 243 8253";

    const imageBuffer = await generateFlyerOgImage({
      title: String(title),
      category: String(category),
      companyName: String(companyName),
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
    console.error("[OG Flyer Generation Error]:", error);
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}
