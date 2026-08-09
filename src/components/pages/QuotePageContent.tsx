"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers3, Building2, RectangleHorizontal, PaintBucket,
  GalleryHorizontalEnd, DoorOpen, Hammer, Wrench,
  CheckCircle2, ArrowRight, ArrowLeft, Send, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

const SERVICES = [
  { icon: Layers3, name_ar: "زجاج سكريت", name_en: "Tempered Glass", value: "tempered-glass" },
  { icon: Building2, name_ar: "واجهات زجاجية", name_en: "Glass Facades", value: "glass-facades" },
  { icon: RectangleHorizontal, name_ar: "ألمنيوم", name_en: "Aluminum", value: "aluminum" },
  { icon: PaintBucket, name_ar: "مطابخ", name_en: "Kitchens", value: "kitchens" },
  { icon: GalleryHorizontalEnd, name_ar: "ديكورات", name_en: "Decorations", value: "decorations" },
  { icon: DoorOpen, name_ar: "أبواب ونوافذ", name_en: "Doors & Windows", value: "doors-windows" },
  { icon: Hammer, name_ar: "مقاولات", name_en: "Contracting", value: "contracting" },
  { icon: Wrench, name_ar: "صيانة", name_en: "Maintenance", value: "maintenance" },
];

const BUDGETS_AR = ["أقل من 5,000 ر.س", "5,000 – 20,000 ر.س", "20,000 – 100,000 ر.س", "100,000 – 500,000 ر.س", "أكثر من 500,000 ر.س"];
const BUDGETS_EN = ["Less than SAR 5,000", "SAR 5,000 – 20,000", "SAR 20,000 – 100,000", "SAR 100,000 – 500,000", "More than SAR 500,000"];

const URGENCY_AR = ["عادي (أكثر من شهر)", "متوسط (2-4 أسابيع)", "عاجل (أسبوع أو أقل)", "فوري (خلال أيام)"];
const URGENCY_EN = ["Normal (more than a month)", "Medium (2-4 weeks)", "Urgent (1 week or less)", "Immediate (within days)"];

const CITIES_AR = ["الرياض", "جدة", "الدمام", "الخبر", "مكة المكرمة", "المدينة المنورة", "أبها", "تبوك", "أخرى"];
const CITIES_EN = ["Riyadh", "Jeddah", "Dammam", "Al Khobar", "Mecca", "Madinah", "Abha", "Tabuk", "Other"];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  services: string[];
  description: string;
  budget: string;
  urgency: string;
  city: string;
  name: string;
  phone: string;
  email: string;
  preferWhatsApp: boolean;
}

export function QuotePageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState<FormData>({
    services: [], description: "", budget: "", urgency: "", city: "",
    name: "", phone: "", email: "", preferWhatsApp: true,
  });

  const toggleService = (v: string) => {
    setForm(p => ({
      ...p,
      services: p.services.includes(v) ? p.services.filter(s => s !== v) : [...p.services, v],
    }));
  };

  const canNext = () => {
    if (step === 1) return form.services.length > 0;
    if (step === 2) return form.description.trim().length > 10 && form.budget && form.urgency && form.city;
    if (step === 3) return form.name.trim() && form.phone.trim();
    return true;
  };

  const next = () => { if (step < 4) setStep((step + 1) as Step); };
  const prev = () => { if (step > 1) setStep((step - 1) as Step); };

  const submit = async () => {
    if (!canNext()) return;
    setStatus("sending");
    try {
      const { submitQuoteRequest } = await import("@/lib/actions/forms");
      const res = await submitQuoteRequest({
        services: form.services,
        description: form.description,
        budget: form.budget,
        urgency: form.urgency,
        city: form.city,
        name: form.name,
        phone: form.phone,
        email: form.email,
        preferWhatsApp: form.preferWhatsApp,
        locale,
      });

      if (res.success) {
        setStatus("sent");
      } else {
        alert(isRtl ? "حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again.");
        setStatus("idle");
      }
    } catch (err) {
      console.error("Quote submission error:", err);
      setStatus("idle");
    }
  };

  const STEPS = [
    { label: isRtl ? dict.quote.step1 : dict.quote.step1 },
    { label: isRtl ? dict.quote.step2 : dict.quote.step2 },
    { label: isRtl ? dict.quote.step3 : dict.quote.step3 },
    { label: isRtl ? dict.quote.step4 : dict.quote.step4 },
  ];

  if (status === "sent") {
    return (
      <div className="pt-[var(--header-height)] min-h-dvh flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 text-center py-20">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3">{isRtl ? "تم إرسال طلبك!" : "Request Sent!"}</h2>
          <p className="text-text-secondary mb-8">{dict.quote.success}</p>
          <a href={`/${locale}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
            {isRtl ? "العودة للرئيسية" : "Back to Home"}
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background to-surface">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl font-extrabold mb-2">{dict.quote.title}</motion.h1>
        <p className="text-text-secondary text-sm sm:text-base">{dict.quote.subtitle}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-5 start-0 end-0 h-0.5 bg-border-light" />
          <div className="absolute top-5 start-0 h-0.5 bg-primary-500 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }} />
          {STEPS.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
                i + 1 < step ? "bg-primary-600 border-primary-600 text-white"
                  : i + 1 === step ? "bg-background border-primary-600 text-primary-600"
                    : "bg-background border-border text-text-tertiary"
              )}>
                {i + 1 < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", i + 1 === step ? "text-primary-600 dark:text-primary-400" : "text-text-tertiary")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-border-light bg-surface-elevated p-6 sm:p-8 shadow-sm">

            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold mb-1">{dict.quote.step1}</h2>
                <p className="text-sm text-text-secondary mb-6">
                  {isRtl ? "اختر خدمة واحدة أو أكثر" : "Select one or more services"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    const selected = form.services.includes(service.value);
                    return (
                      <button key={service.value} onClick={() => toggleService(service.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                          selected
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300"
                            : "border-border-light hover:border-primary-200 dark:hover:border-primary-800 text-text-secondary"
                        )}>
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium leading-tight">{isRtl ? service.name_ar : service.name_en}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-1">{dict.quote.step2}</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">{dict.quote.description} <span className="text-rose-500">*</span></label>
                  <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={isRtl ? "اشرح مشروعك بالتفاصيل (المساحة، النوع، أي متطلبات خاصة...)" : "Describe your project in detail (area, type, any special requirements...)"}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm resize-none transition-all" />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">{dict.quote.budget} <span className="text-rose-500">*</span></label>
                    <select value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all">
                      <option value="">{isRtl ? "اختر الميزانية" : "Select budget"}</option>
                      {(isRtl ? BUDGETS_AR : BUDGETS_EN).map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{dict.quote.urgency} <span className="text-rose-500">*</span></label>
                    <select value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all">
                      <option value="">{isRtl ? "اختر مستوى الاستعجال" : "Select urgency"}</option>
                      {(isRtl ? URGENCY_AR : URGENCY_EN).map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{dict.quote.city} <span className="text-rose-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {(isRtl ? CITIES_AR : CITIES_EN).map((city) => (
                      <button key={city} onClick={() => setForm(p => ({ ...p, city }))}
                        className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                          form.city === city ? "bg-primary-600 text-white border-primary-600" : "border-border-light hover:border-primary-300 text-text-secondary")}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold mb-1">{dict.quote.step3}</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">{isRtl ? "الاسم الكامل" : "Full Name"} <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isRtl ? "رقم الجوال" : "Phone Number"} <span className="text-rose-500">*</span></label>
                  <input type="tel" dir="ltr" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+966 5x xxx xxxx"
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{isRtl ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</label>
                  <input type="email" dir="ltr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.preferWhatsApp} onChange={e => setForm(p => ({ ...p, preferWhatsApp: e.target.checked }))}
                    className="w-5 h-5 rounded border-border accent-primary-600" />
                  <span className="text-sm text-text-secondary flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    {isRtl ? "أفضل التواصل عبر واتساب" : "Prefer WhatsApp contact"}
                  </span>
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-1">{dict.quote.step4}</h2>
                <p className="text-sm text-text-secondary mb-4">{isRtl ? "راجع تفاصيل طلبك قبل الإرسال" : "Review your request details before submitting"}</p>

                {[
                  { label: isRtl ? "الخدمات" : "Services", value: form.services.map(s => SERVICES.find(sv => sv.value === s)?.[isRtl ? "name_ar" : "name_en"]).join("، ") },
                  { label: dict.quote.description, value: form.description },
                  { label: dict.quote.budget, value: form.budget },
                  { label: dict.quote.urgency, value: form.urgency },
                  { label: dict.quote.city, value: form.city },
                  { label: isRtl ? "الاسم" : "Name", value: form.name },
                  { label: isRtl ? "الجوال" : "Phone", value: form.phone },
                ].map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-3 border-b border-border-light last:border-0">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide sm:w-28 shrink-0">{row.label}</span>
                    <span className="text-sm text-text-primary">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <button onClick={prev} disabled={step === 1}
            className={cn("flex items-center gap-2 px-5 py-3 rounded-xl border border-border-light text-sm font-medium transition-all",
              step === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-surface")}>
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isRtl ? "السابق" : "Previous"}
          </button>

          {step < 4 ? (
            <button onClick={next} disabled={!canNext()}
              className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
                canNext()
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "bg-border text-text-tertiary cursor-not-allowed")}>
              {isRtl ? "التالي" : "Next"}
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button onClick={submit} disabled={status === "sending"}
              className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-lg active:scale-[0.98] transition-all",
                status === "sending" && "opacity-70 cursor-not-allowed")}>
              {status === "sending" ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isRtl ? "جاري الإرسال..." : "Sending..."}</>
              ) : (
                <><Send className="w-4 h-4" />{dict.quote.submit}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
