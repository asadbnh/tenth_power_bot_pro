"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Target, Eye, Heart, Award, Star, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
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
{/*}
const TEAM = [
  { name_ar: "م. عبدالله الأحمدي", name_en: "Eng. Abdullah Al-Ahmadi", role_ar: "المدير التنفيذي", role_en: "CEO", emoji: "👨‍💼", gradient: "from-blue-500 to-cyan-400" },
  { name_ar: "م. سارة المطيري", name_en: "Eng. Sara Al-Mutairi", role_ar: "مهندسة التصميم", role_en: "Design Engineer", emoji: "👩‍🎨", gradient: "from-rose-500 to-pink-400" },
  { name_ar: "م. خالد الزهراني", name_en: "Eng. Khalid Al-Zahrani", role_ar: "مدير المشاريع", role_en: "Projects Manager", emoji: "👨‍🔧", gradient: "from-amber-500 to-orange-400" },
  { name_ar: "م. نورة العتيبي", name_en: "Eng. Noura Al-Otaibi", role_ar: "مصممة داخلية", role_en: "Interior Designer", emoji: "👩‍💼", gradient: "from-emerald-500 to-teal-400" },
];
*/}
export function AboutPageContent({ locale, dict, initialCompany }: Props) {
  const isRtl = locale === "ar";
  const companyName = initialCompany ? (isRtl ? initialCompany.name_ar : initialCompany.name_en) : dict.about.title;
  const companyDesc = initialCompany ? (isRtl ? initialCompany.description_ar : initialCompany.description_en) : "";

  return (
    <div className="pt-[var(--header-height)]">
      {/* Architectural About Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        {/* Layered Architectural Atmosphere */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageHeroBackground pageKey="about" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[20rem] bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-yellow-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-slate-50/75 to-slate-50 dark:from-[#070d1e]/85 dark:via-[#070d1e]/75 dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <ChevronLeft className={cn("w-3 h-3 text-slate-400 dark:text-slate-500", !isRtl && "rotate-180")} />
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">{dict.about.title}</span>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-white/5 backdrop-blur-md border border-amber-500/30 shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200/90 tracking-wide">
              {isRtl ? "تأسست عام 2009 — مسيرة 15 عاماً من الريادة المعمارية" : "Established 2009 — 15 Years of Engineering Excellence"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {isRtl ? (
              <>
                عن المؤسسة —{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  {companyName}
                </span>
              </>
            ) : (
              <>
                About Us —{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  {companyName}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {companyDesc || (isRtl
              ? "شركة رائدة في مجال الزجاج والألمنيوم والمقاولات العامة، تأسست على قيم الجودة والاحترافية والابتكار المعماري لتقديم حلول متكاملة لعملاء النخبة والمشاريع الكبرى بالمملكة."
              : "A leading pioneer in architectural glass, aluminum profiles, and general contracting, committed to engineering mastery and Saudi Building Code standards.")}
          </motion.p>
        </div>
      </section>

   

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: Target,
                title: isRtl ? dict.about.mission : "Our Mission",
                text: isRtl
                  ? "تقديم حلول هندسية متكاملة وفائقة الدقة في مجالات الواجهات الزجاجية، أنظمة الكرتن وول، والألمنيوم المعزول، مع الالتزام التام بكود البناء السعودي SBC وتجاوز توقعات كبار المطورين والملاك."
                  : "Delivering integrated and highly precise engineering solutions in glass facades, curtain wall systems, and thermal-break aluminum, with full adherence to the Saudi Building Code (SBC).",
              },
              {
                icon: Eye,
                title: isRtl ? dict.about.vision : "Our Vision",
                text: isRtl
                  ? "أن نكون الكيان الهندسي الأول والأكثر موثوقية في المقاولات التخصصية للواجهات المعمارية والزجاج بالمملكة، عبر تبني أحدث الأنظمة العالمية ومواكبة النهضة العمرانية لرؤية 2030."
                  : "To be the premier and most trusted specialized contracting firm for architectural facades and glass across Saudi Arabia, supporting the Kingdom's Vision 2030.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-3xl border border-border-light bg-surface-elevated p-8 shadow-xl hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0b172e] border border-amber-500/30 flex items-center justify-center mb-6 shadow-md">
                    <Icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">{item.title}</h2>
                  <p className="text-text-secondary leading-relaxed text-sm sm:text-base">{item.text}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Core Engineering Divisions */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block text-xs sm:text-sm font-bold text-amber-500 mb-2 uppercase tracking-widest">
                — {isRtl ? "الأقسام الهندسية التخصصية" : "SPECIALIZED DIVISIONS"} —
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
                {isRtl ? "قدراتنا التنفيذية في المشاريع" : "Our Engineering Capabilities"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  title_ar: "قسم الواجهات والكرتن وول",
                  title_en: "Curtain Walls & Facades",
                  desc_ar: "واجهات استركشر وسبايدر بأعلى مواصفات مقاومة الرياح والعزل الحراري.",
                  desc_en: "Structural & spider glazing engineered for high wind resistance and thermal insulation.",
                },
                {
                  num: "02",
                  title_ar: "قسم الزجاج السيكوريت",
                  title_en: "Tempered Securit Glass",
                  desc_ar: "أبواب سحاب ومفصلي، قواطع مكاتب عازلة للصوت، وكبائن شاور نانو ضد التكلس.",
                  desc_en: "Sliding & swing doors, acoustic partitions, and anti-limescale shower cabins.",
                },
                {
                  num: "03",
                  title_ar: "قسم الألمنيوم المعزول",
                  title_en: "Thermal-Break Aluminum",
                  desc_ar: "قطاعات ألمنيوم ثقيلة معزولة حرارياً للنوافذ والأبواب المعتمدة لكود SBC.",
                  desc_en: "Heavy-duty thermal-break profiles for SBC-compliant windows and doors.",
                },
                {
                  num: "04",
                  title_ar: "قسم المعاينة والرفع المساحي",
                  title_en: "Field Survey & Estimation",
                  desc_ar: "مهندسون وفنيون للمعاينة ورفع المقاسات وإعداد المخططات التنفيذية مجاناً بالرياض.",
                  desc_en: "Specialized engineering survey, accurate site measurement, and free estimation in Riyadh.",
                },
              ].map((div, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-border-light bg-surface-elevated hover:border-amber-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl font-black text-amber-500/80 font-mono mb-3 block">{div.num}</span>
                    <h3 className="text-base font-bold mb-2 text-foreground">{isRtl ? div.title_ar : div.title_en}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{isRtl ? div.desc_ar : div.desc_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corporate Values */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-foreground">
            {isRtl ? dict.about.values : "Our Values"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-border-light bg-surface-elevated hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">{isRtl ? v.title_ar : v.title_en}</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{isRtl ? v.desc_ar : v.desc_en}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
