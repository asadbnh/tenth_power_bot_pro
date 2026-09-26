import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory cache for fast repeat lookups (expires in 24 hours)
interface CachedPreview {
  data: {
    url: string;
    title: string;
    description: string;
    image: string | null;
    siteName: string;
    domain: string;
    favicon: string;
  };
  expiresAt: number;
}

const previewCache = new Map<string, CachedPreview>();

// Clean up expired cache entries periodically
function cleanCache() {
  const now = Date.now();
  for (const [key, val] of previewCache.entries()) {
    if (val.expiresAt < now) {
      previewCache.delete(key);
    }
  }
}

// Basic SSRF protection
function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Block localhost, private IPs, link-local, loopback
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function extractMetaTag(html: string, propertyOrName: string): string | null {
  // Regex to extract content from <meta property="..." content="..."> or <meta name="..." content="...">
  const reg = new RegExp(
    `<meta\\s+[^>]*(?:property|name)=["']${propertyOrName}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(reg);
  if (match && match[1]) return match[1].trim();

  // Try reverse order: content="..." property="..."
  const reverseReg = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${propertyOrName}["']`,
    "i"
  );
  const reverseMatch = html.match(reverseReg);
  if (reverseMatch && reverseMatch[1]) return reverseMatch[1].trim();

  return null;
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMetaTag(html, "og:title") || extractMetaTag(html, "twitter:title");
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  return null;
}

function extractDescription(html: string): string | null {
  return (
    extractMetaTag(html, "og:description") ||
    extractMetaTag(html, "twitter:description") ||
    extractMetaTag(html, "description")
  );
}

function extractImage(html: string, baseUrl: string): string | null {
  const rawImage =
    extractMetaTag(html, "og:image") ||
    extractMetaTag(html, "og:image:secure_url") ||
    extractMetaTag(html, "twitter:image") ||
    extractMetaTag(html, "twitter:image:src");

  if (!rawImage) return null;

  try {
    // Resolve relative URL to absolute URL
    return new URL(rawImage, baseUrl).href;
  } catch {
    return rawImage.startsWith("http") ? rawImage : null;
  }
}

function extractSiteName(html: string, hostname: string): string {
  const ogSiteName = extractMetaTag(html, "og:site_name");
  if (ogSiteName) return ogSiteName;
  return hostname.replace(/^www\./i, "");
}

export async function GET(request: NextRequest) {
  cleanCache();

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !isSafeUrl(targetUrl)) {
    return NextResponse.json(
      { success: false, error: "Invalid or restricted URL parameter" },
      { status: 400 }
    );
  }

  // Check cache
  const cached = previewCache.get(targetUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ success: true, ...cached.data }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  }

  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.hostname.replace(/^www\./i, "");
    const defaultFavicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; TenthPowerBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ar,en;q=0.9",
      },
      next: { revalidate: 86400 },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      // Return basic domain fallback
      const fallbackData = {
        url: targetUrl,
        title: domain,
        description: targetUrl,
        image: null,
        siteName: domain,
        domain,
        favicon: defaultFavicon,
      };
      return NextResponse.json({ success: true, ...fallbackData });
    }

    const contentType = res.headers.get("content-type") || "";
    // If it's directly an image
    if (contentType.startsWith("image/")) {
      const imgData = {
        url: targetUrl,
        title: targetUrl.split("/").pop() || "Image",
        description: domain,
        image: targetUrl,
        siteName: domain,
        domain,
        favicon: defaultFavicon,
      };
      return NextResponse.json({ success: true, ...imgData });
    }

    // Read the first 100KB of the HTML to parse head meta tags quickly without loading entire multi-megabyte pages
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      let bytesRead = 0;
      const maxBytes = 120 * 1024; // 120 KB

      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesRead += value.length;
          html += decoder.decode(value, { stream: true });
          if (html.includes("</head>")) break;
        }
      }
    } else {
      html = await res.text();
    }

    const title = extractTitle(html) || domain;
    const description = extractDescription(html) || targetUrl;
    const image = extractImage(html, targetUrl);
    const siteName = extractSiteName(html, parsed.hostname);

    const previewData = {
      url: targetUrl,
      title,
      description,
      image,
      siteName,
      domain,
      favicon: defaultFavicon,
    };

    // Cache for 24 hours
    previewCache.set(targetUrl, {
      data: previewData,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({ success: true, ...previewData }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch {
    // If request fails or times out, return domain-based fallback so UI never breaks
    try {
      const parsed = new URL(targetUrl);
      const domain = parsed.hostname.replace(/^www\./i, "");
      const fallbackData = {
        url: targetUrl,
        title: domain,
        description: targetUrl,
        image: null,
        siteName: domain,
        domain,
        favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`,
      };
      return NextResponse.json({ success: true, ...fallbackData });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch link preview" }, { status: 500 });
    }
  }
}
