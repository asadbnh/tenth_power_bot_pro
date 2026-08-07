"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, Star, Clock, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

const STATS = [
  { icon: CheckCircle2, value: "500+", label_ar: "مشروع منجز", label_en: "Projects Completed", color: "text-blue-600 dark:text-blue-400" },
  { icon: Users, value: "1,200+", label_ar: "عميل راضٍ", label_en: "Satisfied Clients", color: "text-emerald-600 dark:text-emerald-400" },
  { icon: Clock, value: "15+", label_ar: "سنة خبرة", label_en: "Years Experience", color: "text-amber-600 dark:text-amber-400" },
  { icon: Award, value: "30+", label_ar: "جائزة تميّز", label_en: "Excellence Awards", color: "text-rose-600 dark:text-rose-400" },
];

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

export function AboutPageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            {isRtl ? "من نحن" : "About Us"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "شركة رائدة في مجال الزجاج والألمنيوم والمقاولات، تأسست على قيم الجودة والاحترافية لتقديم حلول متكاملة لعملائنا في المملكة العربية السعودية منذ عام 2009."
              : "A leading company in glass, aluminum, and contracting, founded on values of quality and professionalism to provide integrated solutions for our clients across Saudi Arabia since 2009."}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface border-y border-border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-background border border-border-light">
                  <Icon className={`w-7 h-7 mx-auto mb-3 ${stat.color}`} />
                  <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                  <p className="text-sm text-text-secondary">{isRtl ? stat.label_ar : stat.label_en}</p>
                </motion.div>
              );
            })}
          </div>
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
