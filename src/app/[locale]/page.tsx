import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getServices, getFaqs, getProjects, getBeforeAfterItems, getCompany } from "@/lib/actions/content";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { CinematicGlassVideoSection } from "@/components/sections/CinematicGlassVideoSection";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { GoogleMapsSection } from "@/components/sections/GoogleMapsSection";
import { CTASection } from "@/components/sections/CTASection";
import { DevNoticeModal } from "@/components/ui/DevNoticeModal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app";

  return {
    title: dict.meta.homeTitle,
    description: dict.meta.siteDescription,
    alternates: {
      canonical: `${appUrl}/${locale}`,
      languages: {
        ar: `${appUrl}/ar`,
        en: `${appUrl}/en`,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);

  // Fetch live services, FAQs, projects & transformations from Neon DB
  const [dbServices, dbFaqs, dbProjectsResult, dbBeforeAfter, company] = await Promise.all([
    getServices(validLocale).catch(() => []),
    getFaqs(validLocale).catch(() => []),
    getProjects({ locale: validLocale, limit: 6 }).catch(() => ({ data: [], count: 0 })),
    getBeforeAfterItems(validLocale).catch(() => []),
    getCompany().catch(() => null),
  ]);

  const heroSlides = (dbProjectsResult.data || []).map((p: any, idx: number) => ({
    id: p.id || idx,
    title_ar: p.title_ar || p.name || "",
    title_en: p.title_en || p.name || "",
    badge_ar: p.city ? `مشروع في ${p.city}` : "مشروع منفذ",
    badge_en: p.city ? `Project in ${p.city}` : "Completed Project",
    src: p.cover_image_url || "/images/defaults/projects/project-1.webp",
  }));

  return (
    <>
      {/* JSON-LD Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: dict.meta.siteName,
            description: dict.meta.siteDescription,
            url: process.env.NEXT_PUBLIC_APP_URL || "https://powerof10.netlify.app",
          }),
        }}
      />

      {/* 1. Cinematic Hero (Fed dynamically from Neon DB Projects & Cloudflare R2) */}
      <HeroSection locale={validLocale} dict={dict} initialSlides={heroSlides.length > 0 ? heroSlides : undefined} />

      {/* 2. Services Showcase (Fed from Neon DB Services) */}
      <ServicesShowcase locale={validLocale} dict={dict} initialServices={dbServices as any[]} />

      {/* 3. Animated Statistics 
      <AnimatedStats locale={validLocale} dict={dict} />*/}

      {/* 4. Cinematic Field Video Section (Workers Installing Glass Facades) */}
      <CinematicGlassVideoSection locale={validLocale} />

      {/* 5. Before & After Transformation Slider (Fed from Neon DB) */}
      <BeforeAfterSlider locale={validLocale} initialItems={dbBeforeAfter} />

      {/* 6. FAQ Section (Fed from Supabase DB) */}
      <FaqAccordion locale={validLocale} dict={dict} initialFaqs={dbFaqs as any[]} />

      {/* 7. Google Maps & Office Headquarters */}
      <GoogleMapsSection locale={validLocale} company={company} />

      {/* 8. Call To Action Section */}
      <CTASection locale={validLocale} dict={dict} />

      {/* 9. Temporary Development Notice Modal */}
      <DevNoticeModal locale={validLocale} />
    </>
  );
}
