import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ["ar", "en"];
const DEFAULT_LOCALE = "ar";

/**
 * Rate limiting store (in-memory for edge runtime).
 * In production, use Cloudflare KV or similar distributed store.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  record.count++;
  return record.count > RATE_LIMIT_MAX;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Skip static files and API routes that handle their own auth ───
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/splash") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/offline.html" ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ─── Rate Limiting (API routes) ────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? 
               request.headers.get("x-real-ip") ?? 
               "unknown";
    
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ─── Locale Detection & Redirect ───────────────────────────────────
  const pathnameLocale = SUPPORTED_LOCALES.find(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If the pathname already has a valid locale, continue
  if (pathnameLocale) {
    return NextResponse.next();
  }

  // Detect locale from Accept-Language header or cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const acceptLanguage = request.headers.get("accept-language") || "";
  
  let detectedLocale = DEFAULT_LOCALE;
  
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    detectedLocale = cookieLocale;
  } else if (acceptLanguage.includes("en")) {
    detectedLocale = "en";
  }

  // Redirect to locale-prefixed path
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${detectedLocale}${pathname}`;
  
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
