"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
}

export function GoogleMapsSection({ locale }: Props) {
  const isRtl = locale === "ar";

  return (
    <section className="py-10 sm:py-20 bg-background border-b border-border-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-xs font-semibold text-primary-600 dark:text-primary-300">
            <MapPin className="w-3.5 h-3.5" />
            {isRtl ? "المقر الرئيسي" : "Headquarters"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            {isRtl ? "المقر الرئيسي لشركة القوة العاشرة" : "Headquarters in Riyadh"}
          </h2>
          <p className="text-text-secondary text-xs sm:text-base">
            {isRtl ? "نرحب بزيارتكم للمقر الرئيسي لمراجعة المخططات الهندسية ونماذج الواجهات" : "Visit our headquarters to review engineering plans and structural facade samples"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Info cards */}
          <div className="space-y-3 sm:space-y-4">
            <div className="p-4 sm:p-6 rounded-2xl border border-border-light bg-surface-elevated flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm">{isRtl ? "العنوان الرئيسي" : "Main Address"}</h3>
                <p className="text-xs text-text-secondary">{isRtl ? "طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية" : "King Fahd Road, Al Sahafah Dist., Riyadh, Saudi Arabia"}</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl border border-border-light bg-surface-elevated flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm">{isRtl ? "ساعات العمل" : "Working Hours"}</h3>
                <p className="text-xs text-text-secondary">{isRtl ? "السبت – الخميس: 8:00 صباحاً – 6:00 مساءً" : "Sat – Thu: 8:00 AM – 6:00 PM"}</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl border border-border-light bg-surface-elevated flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm">{isRtl ? "التواصل المباشر" : "Direct Contact"}</h3>
                <p className="text-xs text-text-secondary" dir="ltr">+966 50 000 0000</p>
              </div>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl overflow-hidden border border-border-light shadow-md min-h-[250px]">
            <iframe
              title="Riyadh Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115967.65487770853!2d46.6752957!3d24.7135517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1700000000000!5m2!1sen!2ssa"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "260px" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
