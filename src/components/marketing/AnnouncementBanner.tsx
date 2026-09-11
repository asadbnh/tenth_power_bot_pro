"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface AdvertisementItem {
  id: string;
  title_ar: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  media_type?: string;
  media_url?: string;
  target_route?: string;
  action_title_ar?: string;
  action_title_en?: string;
  priority?: number;
}

interface Props {
  locale: Locale;
  advertisements?: AdvertisementItem[];
}

export function AnnouncementBanner({ locale, advertisements }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const isRtl = locale === "ar";

  if (dismissed || !advertisements || advertisements.length === 0) {
    return null;
  }

  // Pick top priority active ad
  const ad = advertisements[0];
  const title = isRtl ? ad.title_ar : (ad.title_en || ad.title_ar);
  const subtitle = isRtl ? ad.subtitle_ar : (ad.subtitle_en || ad.subtitle_ar);
  const actionTitle = isRtl
    ? (ad.action_title_ar || "استفد من العرض الآن")
    : (ad.action_title_en || "Claim Offer Now");
  const targetRoute = ad.target_route?.startsWith("/")
    ? `/${locale}${ad.target_route}`
    : `/${locale}/quote`;

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <aside
      role="complementary"
      aria-label={isRtl ? "شريط العروض الترويجية والإعلانات" : "Announcement Banner"}
      className="relative z-30 bg-gradient-to-r from-amber-600 via-accent-600 to-amber-500 text-primary-950 px-4 py-2.5 shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Background ambient shine pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-950/15 text-primary-950 text-[11px] font-extrabold tracking-wide uppercase shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-950 animate-pulse" />
            <span>{isRtl ? "عرض حصري" : "Special Offer"}</span>
          </span>

          <div className="flex items-center gap-2 truncate">
            <span className="font-extrabold truncate">{title}</span>
            {subtitle && (
              <span className="hidden md:inline text-primary-950/85 font-medium truncate">
                — {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={targetRoute}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-primary-950 text-white hover:bg-primary-900 active:scale-95 text-xs font-bold transition-all shadow-sm"
          >
            <span>{actionTitle}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-primary-950/10 text-primary-950/70 hover:text-primary-950 transition-colors"
            aria-label={isRtl ? "إغلاق الإعلان" : "Dismiss Announcement"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
