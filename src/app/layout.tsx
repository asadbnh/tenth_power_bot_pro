import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

/**
 * Arabic font — Cairo: clean, modern, excellent Arabic readability.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-primary",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

/**
 * English font — Inter: professional, versatile, wide support.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-secondary",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | WebTaky",
    default: "WebTaky — Enterprise Business Platform",
  },
  description: "منصة إنشاء مواقع الشركات والمقاولات الاحترافية — Professional Business Website Platform",
  applicationName: "WebTaky",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WebTaky",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

/**
 * Root Layout — wraps the entire application.
 * Handles: fonts, theme provider, global styles.
 * The locale-specific layout handles lang/dir attributes.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <head>
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN && (
          <link rel="preconnect" href={`https://${process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN}`} />
        )}
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          {children}
        </ThemeProvider>
        {/* PWA Service Worker registration — disabled in dev mode to prevent stale chunk hydration errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                if (${process.env.NODE_ENV === "production"}) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
