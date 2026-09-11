"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, User, CheckCircle2,
  Sparkles, ShieldCheck, ChevronLeft, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { submitAppointmentRequest } from "@/lib/actions/forms";

interface ServiceOption {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  locale: Locale;
  dict: Dictionary;
  services: ServiceOption[];
  preselectedServiceSlug?: string;
}

export function AppointmentPageContent({
  locale,
  dict: _dict,
  services,
  preselectedServiceSlug,
}: Props) {
  const isRtl = locale === "ar";

  const initialService = services.find((s) => s.slug === preselectedServiceSlug);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: isRtl ? "الرياض" : "Riyadh",
    serviceId: initialService?.id || "",
    serviceName: initialService?.name || "",
    preferredDate: "",
    preferredTime: isRtl ? "مساءً (4 م - 9 م)" : "Evening (4 PM - 9 PM)",
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage(isRtl ? "يرجى كتابة الاسم ورقم الجوال" : "Please enter your name and phone");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await submitAppointmentRequest({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        city: formData.city,
        serviceId: formData.serviceId || undefined,
        serviceName: formData.serviceName || undefined,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime,
        notes: formData.notes || undefined,
        locale,
      });

      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error || (isRtl ? "حدث خطأ أثناء حفظ الموعد" : "Failed to book appointment"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(isRtl ? "تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً" : "Connection error, please try again");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-gradient-to-b from-background via-surface to-background py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-tertiary mb-6">
          <Link href={`/${locale}`} className="hover:text-text-primary transition-colors">
            {isRtl ? "الرئيسية" : "Home"}
          </Link>
          <ChevronLeft className={cn("w-3 h-3", !isRtl && "rotate-180")} />
          <span className="text-text-primary font-medium">
            {isRtl ? "حجز موعد ومعاينة هندسية" : "Book Engineering Survey"}
          </span>
        </div>

        {/* Hero Banner Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 text-white p-8 sm:p-12 mb-10 shadow-2xl border border-white/10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-accent-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>{isRtl ? "خدمة ميدانية معتمدة — مجاناً 100%" : "Certified Field Survey — 100% Free"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {isRtl ? "احجز موعد معاينة ورفع مقاسات هندسية" : "Schedule a Site Measurement & Consultation"}
            </h1>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              {isRtl
                ? "يقوم مهندس مختص من مؤسسة القوة العاشرة بزيارة موقع مشروعك لمعاينة المواصفات الفنية، ورفع المقاسات الدقيقة، وتقديم أفضل التوصيات التنفيذية."
                : "A certified engineer from Tenth Power will visit your site to review technical specs, measure dimensions, and provide tailored execution recommendations."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-white/80">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-400" /> {isRtl ? "اعتماد كود البناء السعودي" : "SBC Code Compliance"}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent-400" /> {isRtl ? "التزام دقيق بالمواعيد" : "Punctual Scheduling"}</span>
            </div>
          </div>
        </div>

        {/* Success Card */}
        {status === "success" ? (
          <div className="bg-surface-elevated rounded-3xl border border-emerald-500/30 p-8 sm:p-12 text-center space-y-6 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary">
              {isRtl ? "تم تأكيد تسجيل طلب الموعد بنجاح!" : "Appointment Request Received!"}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
              {isRtl
                ? `شكراً لك ${formData.name}. تم إرسال تفاصيل الموعد مباشرة للقسم الهندسي، وسيتواصل معك مهندس الموقع هاتفياً لتأكيد ساعة الزيارة الميدانية.`
                : `Thank you ${formData.name}. Your appointment details have been dispatched to our engineering team. We will contact you shortly to confirm the visit.`}
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Link
                href={`/${locale}`}
                className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-all shadow-md"
              >
                {isRtl ? "العودة للرئيسية" : "Back to Home"}
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <form
            onSubmit={handleSubmit}
            className="bg-surface-elevated rounded-3xl border border-border-light p-6 sm:p-10 shadow-xl space-y-8"
          >
            {status === "error" && errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text-primary border-b border-border-light pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-accent-500" />
                <span>{isRtl ? "بيانات العميل والموقع" : "Client & Location Information"}</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "الاسم الكريم *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRtl ? "أدخل اسمك الكريم" : "Enter your full name"}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "رقم الجوال (واتساب) *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-start"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "المدينة" : "City"}
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="الرياض">الرياض (Riyadh)</option>
                    <option value="جدة">جدة (Jeddah)</option>
                    <option value="الدمام">الدمام (Dammam)</option>
                    <option value="الخبر">الخبر (Khobar)</option>
                    <option value="مكة المكرمة">مكة المكرمة (Makkah)</option>
                    <option value="المدينة المنورة">المدينة المنورة (Madinah)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "نوع الخدمة المطلوبة" : "Required Service"}
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => {
                      const sel = services.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        serviceId: e.target.value,
                        serviceName: sel?.name || "",
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="">{isRtl ? "اختر الخدمة (اختياري)" : "Select service (optional)"}</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-text-primary border-b border-border-light pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-500" />
                <span>{isRtl ? "تحديد موعد الزيارة المفضل" : "Preferred Appointment Schedule"}</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "التاريخ المفضل للمعاينة" : "Preferred Date"}
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "الفترة الزمنية المناسبة" : "Preferred Time Window"}
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="صباحاً (9 ص - 1 م)">{isRtl ? "صباحاً (9:00 ص - 1:00 م)" : "Morning (9:00 AM - 1:00 PM)"}</option>
                    <option value="مساءً (4 م - 9 م)">{isRtl ? "مساءً (4:00 م - 9:00 م)" : "Evening (4:00 PM - 9:00 PM)"}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-text-secondary">
                    {isRtl ? "ملاحظات وتفاصيل إضافية عن المشروع" : "Project Notes & Specifics"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={
                      isRtl
                        ? "مثال: واجهة كرتن وول فيلا سكنية، أو تركيب أبواب زجاجية لمحل تجاري..."
                        : "e.g. Residential villa curtain wall or glass storefront..."
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-amber-500 hover:from-accent-600 hover:to-amber-600 text-primary-950 font-extrabold text-base shadow-xl hover:shadow-accent-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>
                {status === "submitting"
                  ? isRtl ? "جاري تأكيد حجز الموعد..." : "Booking Appointment..."
                  : isRtl ? "تأكيد حجز المعاينة الميدانية المجانية" : "Confirm Free Survey Appointment"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
