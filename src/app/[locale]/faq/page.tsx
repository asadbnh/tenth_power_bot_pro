import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { FaqPageContent } from "@/components/pages/FaqPageContent";
import { getFaqs } from "@/lib/actions/content";
import { getFallbackFaqs } from "@/lib/fallback-provider";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webtaky.com";
  return {
    title: dict.faq.title,
    description: dict.faq.subtitle,
    alternates: { canonical: `${appUrl}/${locale}/faq`, languages: { ar: `${appUrl}/ar/faq`, en: `${appUrl}/en/faq` } },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = await getDictionary(validLocale);
  const isAr = validLocale === "ar";
  
  let faqs = await getFaqs(validLocale).catch(() => []);
  if (!faqs || faqs.length === 0) {
    const rawFallbacks = getFallbackFaqs();
    faqs = rawFallbacks.map((f, idx) => ({
      id: `fallback-faq-${idx}`,
      question: isAr ? f.question_ar : f.question_en || f.question_ar,
      answer: isAr ? f.answer_ar : f.answer_en || f.answer_ar,
    }));
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs as any[]).map((f) => ({
      "@type": "Question",
      name: f.question || f.question_ar,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer || f.answer_ar,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FaqPageContent locale={validLocale} dict={dict} initialFaqs={faqs as any[]} />
    </>
  );
}
