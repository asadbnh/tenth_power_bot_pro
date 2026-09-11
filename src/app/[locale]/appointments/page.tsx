import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AppointmentPageContent } from "@/components/pages/AppointmentPageContent";
import { getServices } from "@/lib/actions/content";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  const title = isAr
    ? "حجز موعد ومعاينة هندسية مجانية | WebTaky"
    : "Book Free Site Measurement & Consultation | WebTaky";

  const description = isAr
    ? "احجز موعد زيارة ميدانية لمعاينة ورفع مقاسات مشروعك المعماري للزجاج والألمنيوم مجاناً 100% مع نخبة المهندسين."
    : "Schedule a 100% free engineering site survey for your architectural glass and aluminum project.";

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/${locale}/appointments`,
      languages: {
        ar: `${appUrl}/ar/appointments`,
        en: `${appUrl}/en/appointments`,
      },
    },
  };
}

export default async function AppointmentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { service } = await searchParams;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const dbServices = await getServices(validLocale).catch(() => []);

  const serviceOptions = (dbServices || []).map((s: any) => ({
    id: s.id,
    slug: s.slug,
    name: s.name || s.name_ar,
  }));

  return (
    <AppointmentPageContent
      locale={validLocale}
      dict={dict}
      services={serviceOptions}
      preselectedServiceSlug={service}
    />
  );
}
