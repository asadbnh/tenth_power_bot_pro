"use client";

import Link from "next/link";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface MobileBottomBarProps {
  locale: Locale;
  phone?: string;
  whatsappNumber?: string;
}

/**
 * Mobile Sticky Bottom Action Bar
 * App-like sticky bottom bar specifically designed for mobile devices (< 640px).
 * Provides immediate 1-tap conversion triggers: Call, WhatsApp, and Free Survey Booking.
 */
export function MobileBottomBar({
  locale,
  phone = "+966532438253",
  whatsappNumber = "966532438253",
}: MobileBottomBarProps) {
  const isRtl = locale === "ar";
  const cleanPhone = phone.replace(/\s+/g, "");
  const cleanWa = whatsappNumber.replace(/[^0-9]/g, "");

  const defaultWaMessage = isRtl
    ? "مرحباً مؤسسة القوة العاشرة، أود الاستفسار عن خدمات الواجهات والزجاج والألمنيوم"
    : "Hello Tenth Power, I would like to inquire about your architectural facade and glass services";

  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(defaultWaMessage)}`;

  return (
    <aside
      aria-label={isRtl ? "شريط التواصل السريع" : "Quick contact bar"}
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#070d1e]/95 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl safe-bottom"
    >
      <div className="px-3 py-2 flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* 1. Direct Phone Call Button */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border border-white/10 bg-white/5 active:bg-white/15 text-slate-200 transition-colors"
        >
          <Phone className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold leading-none text-slate-200">
            {isRtl ? "اتصال فوري" : "Call"}
          </span>
        </a>

        {/* 2. Direct WhatsApp Button (High visual prominence) */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#25D366] text-white shadow-md shadow-emerald-500/20 active:brightness-90 transition-all"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="text-[11px] font-black leading-none text-white">
            {isRtl ? "محادثة واتساب" : "WhatsApp"}
          </span>
        </a>

        {/* 3. Book Free Survey Button */}
        <Link
          href={`/${locale}/appointments`}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4 text-slate-950" />
          <span className="text-[11px] font-extrabold leading-none text-slate-950">
            {isRtl ? "معاينة مجانية" : "Free Survey"}
          </span>
        </Link>
      </div>
    </aside>
  );
}
