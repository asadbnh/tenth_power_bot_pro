"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Layers3,
  ArrowRight, CheckCircle2, ShieldCheck, Ruler, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

import { SmartFallbackImage } from "@/components/ui/SmartFallbackImage";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";
import { SkeletonServiceCard } from "@/components/ui/Skeleton";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialServices?: any[];
}

const DEFAULT_ARCHITECTURAL_SERVICES = [
  {
    slug: "curtain-walls",
    name_ar: "الواجهات الزجاجية الإنشائية والاستركشر",
    name_en: "Structural Glazing & Curtain Wall Facades",
    desc_ar: "تنفيذ واجهات الأبراج والمباني التجارية بنظام الاستركشر والسبايدر (Curtain Walls) بزجاج مزدوج 24مم عازل للصوت والحرارة بأعلى معايير كود البناء السعودي.",
    desc_en: "Execution of tower and commercial building facades using structural and spider curtain wall systems with 24mm double-glazed insulated acoustic panels.",
    cover_image_url: "/images/defaults/services/glass-facades.webp",
    spec_badge: "دبل جلاس 24مم • عزل U-Value",
    features_ar: ["مطابقة تامة لكود البناء السعودي SBC", "عزل حراري وصوتي فائق معتمد", "قطاعات ألمنيوم استركشر ثقيلة", "ضمان 10 سنوات شامل التركيب والسيلكون"],
  },
  {
    slug: "securit-glass",
    name_ar: "زجاج السيكوريت والأبواب الأوتوماتيكية",
    name_en: "Tempered Securit Glass & Automatic Doors",
    desc_ar: "توريد وتركيب زجاج السيكوريت المقسّى سماكات 10-12 مم لواجهات المحلات والمعارض والمولات التجارية مع ماكينات أرضية إيطالية وأبواب أوتوماتيكية ذكية.",
    desc_en: "Supply and installation of tempered securit glass 10-12mm for retail storefronts, showrooms, and malls with Italian floor springs and automatic sliding systems.",
    cover_image_url: "/images/defaults/services/tempered-glass.webp",
    spec_badge: "سيكوريت مقسّى 10-12مم • اكسسوارات إيطالية",
    features_ar: ["مقاومة عالية للصدمات والحرارة", "أنظمة أبواب سحاب وأوتوماتيكية", "اكسسوارات استانلس ستيل 316 فاخرة", "قص وتفصيل بالليزر بدقة متناهية"],
  },
  {
    slug: "aluminum-works",
    name_ar: "قطاعات الألمنيوم المعزولة كسر حراري",
    name_en: "Thermal-Break Insulated Aluminum Profiles",
    desc_ar: "تصنيع وتركيب النوافذ والأبواب المعمارية بقطاعات ألمنيوم كسر حراري عازلة للغبار والحرارة والصوت (أنظمة سرايا، الجامبو، والأنظمة الأوروبية المعتمدة).",
    desc_en: "Fabrication of architectural windows and doors with thermal-break aluminum profiles, sealing out Riyadh heat, dust, and acoustic noise.",
    cover_image_url: "/images/defaults/services/aluminum-works.webp",
    spec_badge: "أنظمة سرايا والجامبو • كسر حراري",
    features_ar: ["تخفيض استهلاك التكييف بنسبة تصل إلى 40%", "دهانات إلكتروستاتيك مقاومة للطقس", "إحكام تام ضد مياه الأمطار والغبار", "زجاج مزدوج غاز أرجون عازل"],
  },
  {
    slug: "glass-partitions",
    name_ar: "فواصل وقواطع المكاتب الزجاجية العازلة",
    name_en: "Acoustic Glass Office Partitions",
    desc_ar: "تصميم وتنفيذ قواطع إدارية ومكتبية زجاجية تمنح بيئة العمل فخامة وعزلاً صوتياً متطوراً، مع إمكانية إضافة الزجاج الذكي (Smart Glass) والزجاج المعالج.",
    desc_en: "Design and installation of corporate acoustic glass partitions, single and double-glazed, with smart switchable glass options.",
    cover_image_url: "/images/defaults/services/doors-windows.webp",
    spec_badge: "عزل صوتي 42dB • أنظمة Slimline",
    features_ar: ["عزل صوتي متقدم للاجتماعات الخاصة", "قطاعات ألمنيوم نحيفة عصرية Slimline", "خيارات زجاج سيكوريت مصنفر ومخطط", "سرعة في التوريد والتركيب المكتبي"],
  },
  {
    slug: "shower-cabins",
    name_ar: "كبائن الشاور الزجاجية الفاخرة",
    name_en: "Luxury Frameless Glass Shower Cabins",
    desc_ar: "تفصيل وتركيب كبائن زجاجية للشاور والمسابح بدون إطار (Frameless) بزجاج 10مم معالج ضد الترسبات الكلسية واكسسوارات استانلس ستيل 304/316 المقاومة للصدأ.",
    desc_en: "Custom frameless tempered shower cabins using 10mm anti-limescale treated glass and rust-proof stainless steel 304/316 hardware.",
    cover_image_url: "/images/defaults/projects/project-2.webp",
    spec_badge: "زجاج 10مم نانو سيراميك • استيل 316",
    features_ar: ["طبقة نانو عازلة للترسبات وسهلة التنظيف", "مفصلات ومقابض استانلس أصلية", "إحكام تام للعزل المائي بدون تسريب", "تفصيل حسب مقاسات الحمامات الدقيقة"],
  },
  {
    slug: "mirrors-decor",
    name_ar: "مرايا الليد الديكورية والزجاج المشطوف",
    name_en: "Bespoke Backlit LED Mirrors & Decorative Glass",
    desc_ar: "تفصيل وتركيب مرايا ليد فاخرة، مرايا شطف ومرايا برونزية ورمادية بمقاسات جدارية ضخمة للقصور والفلل والفنادق والمشاغل الراقية بأحدث تقنيات الإنارة المخفية.",
    desc_en: "Custom LED-backlit mirrors, beveled wall mirrors, bronze and grey tinting for luxury palaces, villas, and hospitality projects.",
    cover_image_url: "/images/defaults/services/decorations.webp",
    spec_badge: "مرايا بلجيكية أصلية • إنارة IP65",
    features_ar: ["مرايا بلجيكية نقية خالية من التموجات", "إضاءة ليد مخفية ضد الرطوبة IP65", "قص وتشكيل CNC حسب الطلب الهندسي", "مقاومة للرطوبة وتغير لون الحواف"],
  },
];

export function ServicesPageContent({ locale, dict, initialServices }: Props) {
  const isRtl = locale === "ar";
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  // Merge DB services with rich architectural defaults if DB has fewer or empty
  const dbServices = (initialServices && initialServices.length > 0) ? initialServices : [];
  const services = dbServices.length >= 4 ? dbServices : DEFAULT_ARCHITECTURAL_SERVICES;

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic Services Hero */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="services" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[26rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-transparent rounded-full blur-[110px]" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: "linear-gradient(rgba(212,175,55,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.25) 1px, transparent 1px)", 
              backgroundSize: "48px 48px" 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-transparent to-slate-50 dark:from-[#070d1e]/85 dark:via-transparent dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 dark:bg-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl border border-amber-500/30 text-amber-800 dark:text-amber-200"
          >
            <Layers3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "خدمات هندسية معمارية متكاملة • مطابقة لكود البناء السعودي" : "Full Architectural Engineering Services • SBC Certified"}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight"
          >
            {isRtl ? (
              <>
                خدمات توريد وتركيب{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  الواجهات والزجاج والألمنيوم
                </span>
              </>
            ) : (
              <>
                Architectural Supply & Installation of{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  Glazing & Aluminum Facades
                </span>
              </>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {dict.services.subtitle || (isRtl
              ? "حلول معمارية وهندسية شاملة للأبراج، المباني التجارية، والفلل السكنية بالرياض. نجمع بين دقة الرفع المساحي بالليزر، جودة الزجاج المقسّى، والضمان المعتمد لمدة 10 سنوات."
              : "Comprehensive architectural glazing and aluminum facade solutions built to Saudi Building Code (SBC) specifications with a 10-year golden warranty.")}
          </motion.p>

          {/* Trust strip */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            {[
              { icon: ShieldCheck, title: isRtl ? "ضمان 10 سنوات" : "10-Year Warranty", sub: isRtl ? "على التركيب والعزل" : "Installation & Seals" },
              { icon: Building2, title: isRtl ? "كود البناء السعودي" : "SBC Compliant", sub: isRtl ? "مطابقة تامة للمواصفات" : "Full Standards Match" },
              { icon: Ruler, title: isRtl ? "معاينة ورفع مساحي" : "Free Riyadh Survey", sub: isRtl ? "مجاناً بالموقع خلال 24h" : "On-site within 24h" },
              { icon: Sparkles, title: isRtl ? "اكسسوارات معتمدة" : "Certified Fittings", sub: isRtl ? "استانلس 316 وماكينات إيطالية" : "Italian & SS316" },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-2xl bg-white/85 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-md text-start flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonServiceCard key={i} />)
            ) : (
              services.map((service, index) => {
                const name = isRtl 
                  ? (service.name_ar || service.name) 
                  : (service.name_en || service.name_ar || service.name);
                const desc = isRtl 
                  ? (service.desc_ar || service.short_description_ar || service.description_ar || service.description) 
                  : (service.desc_en || service.short_description_en || service.description_en || service.description);
                const feats: string[] = isRtl
                  ? (service.features_ar || service.features || ["جودة تصنيع فائقة", "مطابقة كود البناء السعودي", "ضمان معتمد 10 سنوات"])
                  : (service.features_en || service.features || ["Superior Quality", "SBC Compliant", "10-Year Warranty"]);

                const serviceSlug = service.slug || "securit-glass";
                const coverImage = service.cover_image_url || service.image_url;
                const specBadge = service.spec_badge || (isRtl ? "مواصفات هندسية معتمدة" : "Certified Specs");

                return (
                  <motion.div 
                    key={service.id || service.slug || index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-3xl border border-border-light hover:border-amber-500/40 transition-all duration-300 bg-surface-elevated hover:shadow-2xl hover:shadow-amber-500/5 group flex flex-col justify-between overflow-hidden"
                  >
                    {/* Image & Spec Badge */}
                    <div className="h-52 bg-surface relative overflow-hidden">
                      <SmartFallbackImage 
                        src={coverImage}
                        alt={name}
                        aspectRatio="auto"
                        title={name}
                        badge={specBadge}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 end-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#070d1e]/85 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                          {specBadge}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-7 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-xl font-extrabold text-text-primary group-hover:text-amber-500 transition-colors leading-snug">
                          {name}
                        </h3>
                        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {desc}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-border-light">
                          {feats.slice(0, 3).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border-light flex flex-col sm:flex-row items-center gap-2">
                        <Link 
                          href={`/${locale}/services/${serviceSlug}`}
                          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-elevated text-text-primary border border-border-light text-xs font-bold transition-all"
                        >
                          <span>{isRtl ? "تفاصيل المواصفات" : "Specs Details"}</span>
                          <ArrowRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                        </Link>

                        <Link 
                          href={`/${locale}/quote?service=${serviceSlug}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isRtl ? "طلب سعر فوري" : "Instant Quote"}</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Architectural Execution Lifecycle (Workflow) */}
          <div className="rounded-3xl p-8 sm:p-12 bg-surface-elevated border border-border-light space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                {isRtl ? "منهجية العمل الهندسي المعتمد" : "Engineering Execution Methodology"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                {isRtl ? "كيف ننفذ مشاريع الواجهات والزجاج بأعلى جودة؟" : "How We Deliver High-End Glazing Projects"}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary">
                {isRtl ? "4 مراحل مدروسة تضمن خلو المشروع من الملاحظات وتسليمه في الموعد المحدد." : "4 rigorous phases ensuring zero defects and on-time project handover."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: isRtl ? "الرفع المساحي المجاني" : "Laser Site Survey", desc: isRtl ? "زيارة الموقع بالرياض وأخذ المقاسات الدقيقة بالليزر ثلاثي الأبعاد." : "On-site 3D laser measurement across Riyadh locations." },
                { step: "02", title: isRtl ? "المخططات والاعتمادات" : "CAD & Shop Drawings", desc: isRtl ? "إعداد المخططات التنفيذية واعتماد قطاعات الألمنيوم وسماكات الزجاج." : "Architectural shop drawings, wind load calculations, and SBC approvals." },
                { step: "03", title: isRtl ? "التصنيع والتقسية" : "Tempering & Fabrication", desc: isRtl ? "معالجة الزجاج في أفران التقسية الحرارية وتجميع الألمنيوم بدقة بالغة." : "Thermal tempering furnaces, CNC edge polishing, and argon gas sealing." },
                { step: "04", title: isRtl ? "التركيب والضمان الذهبي" : "Installation & Warranty", desc: isRtl ? "فريق فني متخصص للتركيب والاختبار وتسليم شهادة الضمان 10 سنوات." : "Certified field technicians, water-tightness tests, and 10-year warranty handover." },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-surface border border-border-light relative group hover:border-amber-500/40 transition-all">
                  <span className="text-3xl font-black text-amber-500/20 group-hover:text-amber-500/40 transition-colors block mb-3 font-mono">
                    {item.step}
                  </span>
                  <h4 className="font-extrabold text-base text-text-primary mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Conversion Banner */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#070d1e] via-[#0b1532] to-[#070d1e] border border-amber-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-start max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRtl ? "استشارة ومعاينة مجانية في موقعك بالرياض" : "Free On-Site Consultation in Riyadh"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isRtl ? "هل ترغب في تحديد موعد لمعاينة مشروعك وأخذ المقاسات؟" : "Ready to Schedule a Site Survey and Measurement?"}
              </h3>
              <p className="text-sm text-slate-300">
                {isRtl 
                  ? "تواصل مباشرة مع مهندسينا، أو اطلب رفع مساحي فوري لنوفر لك عرض سعر تفصيلي شامل جدول الكميات."
                  : "Speak directly with our engineers or book an immediate survey for a comprehensive BOQ quote."}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href={`/${locale}/appointments`}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-primary-950 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-center"
              >
                {isRtl ? "حجز معاينة هندسية مجانية" : "Book Free Site Survey"}
              </Link>
              <a
                href="https://wa.me/966532438253"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-white border border-[#25D366]/40 font-bold text-sm transition-all text-center"
              >
                {isRtl ? "واتساب المبيعات المباشر" : "Direct WhatsApp"}
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

