"use client";

import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Phone, ShieldCheck, Clock, Award,
  Sparkles, Layers3, Building2, RectangleHorizontal, PaintBucket, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface ServiceDetail {
  slug: string;
  name_ar: string;
  name_en: string;
  short_ar: string;
  short_en: string;
  description_ar: string;
  description_en: string;
  icon: unknown;
  features_ar: string[];
  features_en: string[];
  specs: { label_ar: string; label_en: string; value_ar: string; value_en: string }[];
  faqs: { q_ar: string; q_en: string; a_ar: string; a_en: string }[];
}

const SERVICES_DATA: Record<string, ServiceDetail> = {
  "tempered-glass": {
    slug: "tempered-glass",
    name_ar: "زجاج سكريت مقوى",
    name_en: "Tempered Glass",
    short_ar: "تركيب زجاج سكريت عالي المقاومة للصدمات والحرارة مع ضمان 10 سنوات",
    short_en: "High-impact & heat-resistant tempered glass installation with 10-year warranty",
    description_ar: "يتميز الزجاج السكريت بمقاومته الفائقة للصدمات والحرارة مقارنة بالزجاج العادي بـ 4 إلى 5 أضعاف. نستخدم أفضل الأكسسوارات المصنوعة من الاستانلس ستيل المقاوم للصدأ 316 لتثبيت الأبواب والواجهات والكبائن بطريقة عصرية وآمنة تماماً.",
    description_en: "Tempered glass is 4 to 5 times stronger than regular glass against impacts and heat. We use premium 316 stainless steel accessories for ultra-secure and modern door, facade, and enclosure installations.",
    icon: Layers3,
    features_ar: ["مقاومة عالية للصدمات والحرارة", "أكسسوارات استانلس ستيل 316 ضد الصدأ", "قص وتفصيل بالليزر بدقة متناهية", "ضمان 10 سنوات على التركيب والمواد"],
    features_en: ["High impact & thermal resistance", "316 Stainless steel anti-rust hardware", "Precision laser cutting & sizing", "10-year installation & material warranty"],
    specs: [
      { label_ar: "السماكات المتاحة", label_en: "Available Thickness", value_ar: "6مم، 8مم، 10مم، 12مم", value_en: "6mm, 8mm, 10mm, 12mm" },
      { label_ar: "أنواع الزجاج", label_en: "Glass Types", value_ar: "شفاف، مثلج، ملون، فائق النقاء (Clear)", value_en: "Clear, Frosted, Tinted, Ultra-Clear" },
      { label_ar: "معيار الأمان", label_en: "Safety Standard", value_ar: "ANSI Z97.1 / BS 6206", value_en: "ANSI Z97.1 / BS 6206" },
      { label_ar: "مدة الضمان", label_en: "Warranty Period", value_ar: "10 سنوات شاملة", value_en: "10 Years Full Warranty" },
    ],
    faqs: [
      { q_ar: "هل يمكن قص الزجاج السكريت بعد المعالجة؟", q_en: "Can tempered glass be cut after processing?", a_ar: "لا، يتم التقطيع والعمليات جميعها قبل أدخال الزجاج فرن السكريت.", a_en: "No, all cutting and drilling must happen before the tempering heat treatment." },
      { q_ar: "ما هي مدة التوريد والتركيب؟", q_en: "What is the delivery & installation time?", a_ar: "عادة تتراوح بين 3 إلى 7 أيام عمل حسب حجم المشروع.", a_en: "Usually takes between 3 to 7 working days depending on project size." }
    ]
  },
  "glass-facades": {
    slug: "glass-facades",
    name_ar: "واجهات زجاجية (ك Curtain Wall)",
    name_en: "Glass Facades & Curtain Walls",
    short_ar: "تصميم وتنفيذ واجهات المبانى التجارية والفيلا بأحدث أنظمة الكرتن وول والسبايدر",
    short_en: "Design & execution of commercial and residential glass facades using Curtain Wall & Spider systems",
    description_ar: "نقدم حلولاً هندسية متكاملة للواجهات الزجاجية الهيكلية (Structural Glazing) وأنظمة الكرتن وول والسبايدر التي تعطي المبنى مظهرًا معمارياً فخماً مع عزل حراري وصوتي ممتاز للمباني والمجمعات التجارية.",
    description_en: "We engineer structural glazing, curtain wall, and spider systems that grant buildings a luxurious architectural aesthetic while providing optimal acoustic and thermal insulation.",
    icon: Building2,
    features_ar: ["عزل حراري وصوتي عالي الجودة", "زجاج دبل جلاس طبقتين مع غاز الأرجون", "مقاومة سرعة الرياح حتى 200 كم/س", "تصاميم هندسية 3D مجانية قبل التنفيذ"],
    features_en: ["High acoustic & thermal isolation", "Double glazed with Argon gas filler", "Wind resistance up to 200 km/h", "Free 3D architectural rendering"],
    specs: [
      { label_ar: "النظام المعماري", label_en: "System Type", value_ar: "Structural Glazing / Spider / Curtain Wall", value_en: "Structural Glazing / Spider / Curtain Wall" },
      { label_ar: "الزجاج المستعمل", label_en: "Glass Composition", value_ar: "دبل جلاس 6+12+6 مم معالج حرارياً", value_en: "Double Glazed 6+12+6mm Tempered" },
      { label_ar: "معامل العزل الحراري", label_en: "Thermal U-Value", value_ar: "1.4 W/m²K", value_en: "1.4 W/m²K" },
      { label_ar: "ضمان عدم التسريب", label_en: "Leakage Warranty", value_ar: "15 سنة ضد الماء والهواء", value_en: "15 Years Water & Air Tightness" },
    ],
    faqs: [
      { q_ar: "هل تمتكلك الواجهات ضمان ضد تسرب المياه والأتربة؟", q_en: "Do facades carry water & dust leak warranty?", a_ar: "نعم، نضمن العزل التام للمياه والأتربة لمدة 15 عاماً باستخدام سيليكون إنشائي ألماني.", a_en: "Yes, 100% water and dust sealing guaranteed for 15 years using structural German silicone." }
    ]
  },
  "aluminum": {
    slug: "aluminum",
    name_ar: "قطاعات الألمنيوم المعزولة",
    name_en: "Aluminum Systems",
    short_ar: "تصنيع وتركيب النوافذ والأبواب بأحدث القطاعات الحرارية المعزولة (Thermal Break)",
    short_en: "Manufacturing & installation of thermal break doors and windows",
    description_ar: "تصنيع وتفصيل قطاعات الألمنيوم الخاصة بالأبواب والشبابيك مع التركيز على قطاعات السرايا وسوبر سرايا والقطاعات المعزولة حرارياً للحد من استهلاك التكييف وتوفير الطاقة.",
    description_en: "Precision engineering of aluminum window and door profiles focusing on Saraya, Super Saraya, and Thermal Break systems to optimize air conditioning energy consumption.",
    icon: RectangleHorizontal,
    features_ar: ["قطاعات معزولة حرارياً للتوفير بالطاقة", "طلاء باودر كوتنج مقاوم للخدش والعوامل الجوية", "إكسسوارات إيطالية وألمانية عالية الجودة", "تشكيلة واسعة من الألوان والإنهاءات"],
    features_en: ["Thermal break profiles for energy saving", "Powder coating weather & scratch resistant", "High-grade Italian & German accessories", "Wide selection of colors & finishes"],
    specs: [
      { label_ar: "نوع القطاع", label_en: "Profile Type", value_ar: "سرايا / سوبر سرايا / كبس معزول", value_en: "Saraya / Super Saraya / Thermal Break" },
      { label_ar: "سمك القطاع", label_en: "Profile Thickness", value_ar: "1.8 مم - 2.5 مم", value_en: "1.8mm - 2.5mm" },
      { label_ar: "نوع الدهان", label_en: "Coating Type", value_ar: "Powder Coating / Anodized", value_en: "Powder Coating / Anodized" },
      { label_ar: "الضمان", label_en: "Warranty", value_ar: "10 سنوات", value_en: "10 Years" },
    ],
    faqs: [
      { q_ar: "ما الفائدة من القطاع المعزول حرارياً؟", q_en: "What is the benefit of thermal break aluminum?", a_ar: "يمنع انتقاع الحرارة الخارجية للداخل ويقلل استهلاك الكهرباء بنسبة تصل إلى 40%.", a_en: "It stops external heat transfer and reduces HVAC power consumption by up to 40%." }
    ]
  },
  "kitchens": {
    slug: "kitchens",
    name_ar: "مطابخ الألمنيوم والخشب العصرية",
    name_en: "Modern Kitchen Solutions",
    short_ar: "تصميم وتنفيذ المطابخ العصرية بخامات ألمنيوم وكلادينج ورخام صناعي عالي الفخامة",
    short_en: "Design & crafting of modern aluminum, cladding & solid surface kitchens",
    description_ar: "تصميم مطابخ أحلامك بأرقى التصاميم الإيطالية والألمانية، باستخدام ألواح الألمنيوم المعالجة ضد البكتيريا والرطوبة، مع مفصلات هيدروليكية ناعمة الإغلاق ورخام صناعي فاخر.",
    description_en: "Crafting dream kitchens with Italian & German design concepts using antibacterial, moisture-proof aluminum panels, soft-close hydraulic hinges, and solid quartz surfaces.",
    icon: PaintBucket,
    features_ar: ["خامات مقاومة للماء والرطوبة والحشرات", "مفصلات وسحابات هيدروليكية ناعمة", "رخام صناعي كوري (كوارتز / جرانيك) ضمان 10 سنوات", "تصميم ثلاثي الأبعاد 3D مجاني قبل الاعتماد"],
    features_en: ["Water, moisture & insect proof materials", "Soft-close hydraulic hardware", "Korean solid surface quartz with 10-year warranty", "Free 3D design session before production"],
    specs: [
      { label_ar: "الخامة الأساسية", label_en: "Main Material", value_ar: "ألمنيوم دبل / كلادينج / فرميكا", value_en: "Double Aluminum / Cladding / Formica" },
      { label_ar: "المفصلات والسحابات", label_en: "Hardware & Hinges", value_ar: "Blum ألماني / DTC هيدروليك", value_en: "Blum German / DTC Hydraulic" },
      { label_ar: "الرخام المستخدم", label_en: "Countertop Material", value_ar: "كوارتز كوري / جرانيك / رخام طبيعي", value_en: "Korean Quartz / Granic / Natural Marble" },
      { label_ar: "مدة الضمان", label_en: "Warranty", value_ar: "10 سنوات شاملة", value_en: "10 Years Full Warranty" },
    ],
    faqs: [
      { q_ar: "هل المطابخ مقاومة للحشرات والمياه؟", q_en: "Are kitchens resistant to water & pests?", a_ar: "نعم، مطابخ الألمنيوم لدينا لا تمتص الرطوبة ولا توفر بيئة للحشرات إطلاقاً.", a_en: "Yes, our aluminum kitchens absorb zero moisture and are 100% pest resistant." }
    ]
  }
};

interface Props {
  slug: string;
  locale: Locale;
  dict: Dictionary;
}

export function ServiceDetailPageContent({ slug, locale, dict }: Props) {
  const isRtl = locale === "ar";
  const service = SERVICES_DATA[slug] || {
    slug,
    name_ar: isRtl ? "خدمة متخصصة" : "Specialized Service",
    name_en: "Specialized Service",
    short_ar: "نقدم حلولاً متكاملة بأعلى معايير الجودة",
    short_en: "Providing comprehensive high-quality solutions",
    description_ar: "نحن متخصصون في تقديم هذه الخدمة وفق أعلى المقاييس العالمية باستخدام أفضل الخامات والمعدات الحديثة وشبكة فنيين محترفين.",
    description_en: "We specialize in delivering this service according to top global standards using superior materials and skilled technicians.",
    icon: Layers3,
    features_ar: ["جودة عالية وتنفيذ دقيق", "ضمان شامل على المواد والعمل", "فريق عمل مؤهل ومختص", "أسعار تنافسية وحلول مخصصة"],
    features_en: ["High quality & precise execution", "Comprehensive warranty on work", "Qualified specialist team", "Competitive pricing"],
    specs: [
      { label_ar: "مدة التنفيذ", label_en: "Execution Time", value_ar: "3 - 7 أيام عمل", value_en: "3 - 7 Working Days" },
      { label_ar: "الضمان", label_en: "Warranty", value_ar: "5 إلى 10 سنوات", value_en: "5 to 10 Years" },
    ],
    faqs: [
      { q_ar: "كيف يمكنني طلب عرض سعر للخدمة؟", q_en: "How can I request a service quote?", a_ar: "يمكنك الضغط على زر طلب عرض السعر وتعبئة تفاصيل مشروعك وسنتواصل معك فوراً.", a_en: "Click the Get Quote button, enter your details, and our engineers will contact you instantly." }
    ]
  };

  const IconComponent = (service.icon as React.ElementType) || Layers3;

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <Link href={`/${locale}/services`} className="hover:text-white transition-colors">{dict.services.title}</Link>
            <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
            <span className="text-white font-medium">{isRtl ? service.name_ar : service.name_en}</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 items-center">
            <div className="sm:col-span-2 space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-primary-200 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                {isRtl ? "خدمة معتمدة بضمان شامل" : "Certified Service with Warranty"}
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                {isRtl ? service.name_ar : service.name_en}
              </h1>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
                {isRtl ? service.short_ar : service.short_en}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={`/${locale}/quote`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-500 text-white font-bold text-sm hover:bg-accent-600 shadow-lg shadow-accent-500/20 active:scale-95 transition-all">
                  {dict.quote.title}
                  <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                </Link>
                <a href="tel:+966500000000"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all">
                  <Phone className="w-4 h-4" />
                  +966 50 000 0000
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                <IconComponent className="w-16 h-16 sm:w-24 sm:h-24 text-primary-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Description & Features */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold">{isRtl ? "نظرة عامة عن الخدمة" : "Service Overview"}</h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              {isRtl ? service.description_ar : service.description_en}
            </p>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface border border-border-light flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400 shrink-0" />
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "الضمان" : "Warranty"}</p>
                  <p className="text-sm font-bold text-text-primary">{isRtl ? "حتى 10 سنوات" : "Up to 10 Years"}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border-light flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 shrink-0" />
                <div>
                  <p className="text-xs text-text-tertiary">{isRtl ? "سرعة التنفيذ" : "Speed"}</p>
                  <p className="text-sm font-bold text-text-primary">{isRtl ? "3 - 7 أيام" : "3 - 7 Days"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-3xl border border-border-light p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {isRtl ? "مميزات خدمتنا" : "Service Features"}
            </h3>
            <div className="space-y-3">
              {(isRtl ? service.features_ar : service.features_en).map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        {service.specs && service.specs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold">{isRtl ? "المواصفات الفنية" : "Technical Specifications"}</h2>
            <div className="rounded-2xl border border-border-light overflow-hidden bg-surface-elevated">
              <div className="divide-y divide-border-light">
                {service.specs.map((spec, i) => (
                  <div key={i} className="grid grid-cols-2 p-4 text-sm hover:bg-surface/50 transition-colors">
                    <span className="font-semibold text-text-tertiary">{isRtl ? spec.label_ar : spec.label_en}</span>
                    <span className="font-bold text-text-primary">{isRtl ? spec.value_ar : spec.value_en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold">{isRtl ? "الأسئلة الشائعة حول الخدمة" : "Service FAQs"}</h2>
            <div className="space-y-4">
              {service.faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border-light bg-surface-elevated space-y-2">
                  <h3 className="font-bold text-base text-primary-700 dark:text-primary-300">
                    {isRtl ? faq.q_ar : faq.q_en}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {isRtl ? faq.a_ar : faq.a_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            {isRtl ? "هل أنت جاهز لتنفيذ مشروعك؟" : "Ready to Start Your Project?"}
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            {isRtl ? "تواصل معنا الآن للحصول على معاينة مجانية وعرض سعر مخصص لمشروعك" : "Get in touch now for a free consultation and customized quote for your project"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/quote`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-900 font-bold text-sm hover:bg-white/90 shadow-lg active:scale-95 transition-all">
              {dict.quote.title}
              <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
