"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface CTASectionProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * Premium Call-to-Action section with gradient background,
 * floating shapes, and compelling action buttons.
 */
export function CTASection({ locale, dict }: CTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isRtl = locale === "ar";

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative py-20 sm:py-28 overflow-hidden"
      aria-label={isRtl ? "تواصل معنا" : "Get in Touch"}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -end-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {isRtl
              ? "جاهز لتحويل مشروعك إلى واقع؟"
              : "Ready to Transform Your Project?"}
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isRtl
              ? "تواصل معنا اليوم واحصل على استشارة مجانية وعرض سعر مخصص لمشروعك"
              : "Contact us today for a free consultation and a customized quote for your project"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="accent"
            size="xl"
            className="min-w-[220px]"
            leftIcon={<MessageCircle className="w-5 h-5" />}
          >
            {dict.hero.whatsapp}
          </Button>
          <Button
            size="xl"
            className={cn(
              "min-w-[220px] bg-white/10 text-white border-2 border-white/30",
              "hover:bg-white/20 backdrop-blur-sm"
            )}
            leftIcon={<Phone className="w-5 h-5" />}
          >
            {dict.quote.title}
          </Button>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-sm text-white/50 flex items-center justify-center gap-1"
        >
          <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
          {isRtl
            ? "استشارة مجانية — رد خلال 24 ساعة — بدون التزام"
            : "Free consultation — Response within 24 hours — No obligation"}
        </motion.p>
      </div>
    </section>
  );
}
