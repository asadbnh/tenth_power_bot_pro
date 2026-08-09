"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Star } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";

interface Props {
  locale: Locale;
  dict: Dictionary;
  initialCompany?: any;
}


const VALUES = [
  { icon: Star, title_ar: "الجودة أولاً", title_en: "Quality First", desc_ar: "نلتزم بأعلى معايير الجودة في كل مشروع نُنفّذه", desc_en: "We commit to the highest quality standards in every project we execute" },
  { icon: Heart, title_ar: "رضا العميل", title_en: "Client Satisfaction", desc_ar: "رضا عملائنا هو مقياس نجاحنا الحقيقي", desc_en: "Our clients' satisfaction is our true measure of success" },
  { icon: Target, title_ar: "الدقة والالتزام", title_en: "Precision & Commitment", desc_ar: "ننجز مشاريعنا في الوقت المحدد وبالمواصفات المتفق عليها", desc_en: "We complete our projects on time and with the agreed specifications" },
  { icon: Eye, title_ar: "الشفافية", title_en: "Transparency", desc_ar: "نؤمن بالشفافية الكاملة مع عملائنا في كل مرحلة", desc_en: "We believe in complete transparency with our clients at every stage" },
];

const TEAM = [
  { name_ar: "م. عبدالله الأحمدي", name_en: "Eng. Abdullah Al-Ahmadi", role_ar: "المدير التنفيذي", role_en: "CEO", emoji: "👨‍💼", gradient: "from-blue-500 to-cyan-400" },
  { name_ar: "م. سارة المطيري", name_en: "Eng. Sara Al-Mutairi", role_ar: "مهندسة التصميم", role_en: "Design Engineer", emoji: "👩‍🎨", gradient: "from-rose-500 to-pink-400" },
  { name_ar: "م. خالد الزهراني", name_en: "Eng. Khalid Al-Zahrani", role_ar: "مدير المشاريع", role_en: "Projects Manager", emoji: "👨‍🔧", gradient: "from-amber-500 to-orange-400" },
  { name_ar: "م. نورة العتيبي", name_en: "Eng. Noura Al-Otaibi", role_ar: "مصممة داخلية", role_en: "Interior Designer", emoji: "👩‍💼", gradient: "from-emerald-500 to-teal-400" },
];

export function AboutPageContent({ locale, dict, initialCompany }: Props) {
  const isRtl = locale === "ar";
  const companyName = initialCompany ? (isRtl ? initialCompany.name_ar : initialCompany.name_en) : dict.about.title;
  const companyDesc = initialCompany ? (isRtl ? initialCompany.description_ar : initialCompany.description_en) : "";

  return (
    <div className="pt-[var(--header-height)]">
      {/* Cinematic About Hero */}
      <section className="relative py-20 sm:py-28 bg-[#060b18] overflow-hidden">
        {/* Ambient Royal Gold Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="about" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[25rem] bg-gradient-to-r from-amber-500/20 via-blue-600/15 to-yellow-500/15 rounded-full blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060b18]/80 via-transparent to-[#060b18]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full royal-badge shadow-xl backdrop-blur-xl border border-amber-500/30">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isRtl ? "تأسست عام 2009 — مسيرة 15 عاماً من الريادة" : "Established 2009 — 15 Years of Excellence"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            {isRtl ? (
              <>
                عن الشركة —{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {companyName}
                </span>
              </>
            ) : (
              <>
                About Us —{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  {companyName}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {companyDesc || (isRtl
              ? "شركة رائدة في مجال الزجاج والألمنيوم والمقاولات العامة، تأسست على قيم الجودة والاحترافية والابتكار المعماري لتقديم حلول متكاملة لعملاء النخبة والمشاريع الكبرى بالمملكة."
              : "A leading pioneer in architectural glass, aluminum profiles, and general contracting, committed to engineering mastery and Saudi Building Code standards.")}
          </motion.p>
        </div>
      </section>

   

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              { icon: Target, title: isRtl ? dict.about.mission : "Our Mission", color: "from-blue-500 to-cyan-400",
                text: isRtl ? "تقديم حلول متكاملة وعالية الجودة في مجالات الزجاج والألمنيوم والمقاولات، بأسعار تنافسية وفريق عمل متخصص يسعى دائماً لتجاوز توقعات العملاء." : "Delivering comprehensive, high-quality solutions in glass, aluminum, and contracting, with competitive pricing and a specialized team that always strives to exceed client expectations." },
              { icon: Eye, title: isRtl ? dict.about.vision : "Our Vision", color: "from-amber-500 to-orange-400",
                text: isRtl ? "أن نكون الشركة الأولى والأكثر ثقة في مجالنا على مستوى المملكة العربية السعودية، من خلال الابتكار المستمر وتبني أحدث التقنيات." : "To be the leading and most trusted company in our field across Saudi Arabia, through continuous innovation and adopting the latest technologies." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="rounded-2xl border border-border-light bg-surface-elevated p-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-3">{item.title}</h2>
                  <p className="text-text-secondary leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Values */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{isRtl ? dict.about.values : "Our Values"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-border-light bg-surface-elevated hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-bold mb-2">{isRtl ? v.title_ar : v.title_en}</h3>
                  <p className="text-sm text-text-secondary">{isRtl ? v.desc_ar : v.desc_en}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Team */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{isRtl ? dict.about.team : "Our Team"}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.08 }}
                className="text-center rounded-2xl overflow-hidden border border-border-light bg-surface-elevated">
                <div className={`h-28 bg-gradient-to-br ${member.gradient} flex items-center justify-center text-4xl`}>
                  {member.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1">{isRtl ? member.name_ar : member.name_en}</h3>
                  <p className="text-xs text-text-secondary">{isRtl ? member.role_ar : member.role_en}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
