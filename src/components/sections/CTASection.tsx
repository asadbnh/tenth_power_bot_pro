"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CTASectionProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * Architectural Call-to-Action section with Obsidian Navy background,
 * Champagne Gold accents, and verified conversion triggers.
 */
export function CTASection({ locale, dict }: CTASectionProps) {
  const isRtl = locale === "ar";
  const whatsappUrl = `https://wa.me/966532438253?text=${encodeURIComponent(
    isRtl
      ? "مرحباً مؤسسة القوة العاشرة، أرغب في استشارة هندسية ودراسة مشروع."
      : "Hello Tenth Power, I would like an engineering consultation for my project."
  )}`;

  return (
    <section
      id="cta"
      className="relative py-12 sm:py-20 overflow-hidden bg-[#070d1e]"
      aria-label={isRtl ? "تواصل معنا" : "Get in Touch"}
    >
      {/* Layered Architectural Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[20rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-amber-400/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d1e]/85 via-transparent to-[#070d1e]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-amber-500/30 text-xs font-semibold text-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? "معاينة هندسية ميدانية مجانية بالرياض" : "Free On-Site Survey in Riyadh"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {isRtl ? (
              <>
                هل لديك مشروع معماري ترغب في{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  دراسته وتنفيذه؟
                </span>
              </>
            ) : (
              <>
                Planning an Architectural or Contracting{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E7C4] via-[#E5C378] to-[#C99E32]">
                  Project?
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "تواصل مع القسم الهندسي لدراسة المواصفات الفنية المعتمدة وتلقي التقدير المالي وجدول التنفيذ الدقيق."
              : "Connect with our engineering division for technical specifications, accurate cost estimates, and execution timelines."}
          </p>
        </motion.div>

        {/* Working Clickable CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto sm:max-w-none"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>{isRtl ? "استشارة فورية عبر واتساب" : "Instant WhatsApp Consultation"}</span>
          </a>

          <Link
            href={`/${locale}/quote`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#E5C378] to-[#C99E32] hover:brightness-105 text-primary-950 font-bold text-sm sm:text-base shadow-lg active:scale-95 transition-all"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span>{dict.quote.title}</span>
          </Link>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2"
        >
          <ArrowRight className={cn("w-3.5 h-3.5 text-amber-400", isRtl && "rotate-180")} />
          <span>
            {isRtl
              ? "ضمان شامل 10 سنوات واعتماد كود البناء السعودي (SBC)"
              : "10-Year Comprehensive Warranty & Saudi Building Code (SBC) Compliance"}
          </span>
        </motion.p>
      </div>
    </section>
  );
}
