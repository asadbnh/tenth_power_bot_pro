import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Performance ───────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,

  // ─── Image Optimization ────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN || "pub-e9788e46474044d585e2622e2c6ce74d.r2.dev",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Security Headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://telegram.org;",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ─── HTML pages: browser must revalidate each visit ──────────────
      // This prevents stale data on mobile after updates
      {
        source: "/:locale",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/:locale/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      // ─── CDN/ISR edge caching for content pages ───────────────────────
      // s-maxage = CDN caches for 5 min, stale-while-revalidate = 1hr
      {
        source: "/:locale/(services|projects|blog|faq|gallery)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, no-cache, s-maxage=300, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect root to default locale
      {
        source: "/",
        destination: "/ar",
        permanent: false,
      },
    ];
  },

  // ─── Experimental ──────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
    ],
  },

  // ─── Turbopack (Next.js 16 default bundler) ────────────────────────
  turbopack: {},
};

export default nextConfig;
