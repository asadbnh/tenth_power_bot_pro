"use client";

import { motion } from "framer-motion";
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
  const isRtl = locale === "ar";

  return (
    <section
      id="cta"
      className="relative py-6 sm:py-16 overflow-hidden"
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 sm:mb-4 leading-tight">
            {isRtl
              ? "هل لديك مشروع ترغب في دراسته وتنفيذه؟"
              : "Planning an Architectural or Contracting Project?"}
          </h2>
          <p className="text-xs sm:text-base text-white/80 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
            {isRtl
              ? "تواصل مع القسم الهندسي لدراسة المواصفات الفنية وتلقي التقدير المالي المعتمد لمشروعك."
              : "Connect with our engineering team for technical studies and tailored project proposals."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-row items-center justify-center sm:gap-4 max-w-md mx-auto sm:max-w-none"
        >
          <Button
            variant="accent"
            size="lg"
            className="w-full sm:w-auto min-w-0 sm:min-w-[200px] text-xs sm:text-base font-bold py-2.5 px-3"
            leftIcon={<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          >
            {dict.hero.whatsapp}
          </Button>
          <Button
            size="lg"
            className={cn(
              "w-full sm:w-auto min-w-0 sm:min-w-[200px] bg-white/10 text-white border border-white/30 text-xs sm:text-base font-bold py-2.5 px-3",
              "hover:bg-white/20 backdrop-blur-sm"
            )}
            leftIcon={<Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          >
            {dict.quote.title}
          </Button>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-xs text-white/60 flex items-center justify-center gap-1"
        >
          <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
          {isRtl
            ? "التزام كامل بالمواصفات الهندسية وجداول التنفيذ المعتمدة"
            : "Full compliance with certified engineering specs & project timelines."}
        </motion.p>
      </div>
    </section>
  );
}
