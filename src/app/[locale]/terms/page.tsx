import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return { title: dict.footer.terms };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === "ar";

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold mb-8">{isRtl ? "الشروط والأحكام" : "Terms & Conditions"}</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p>{isRtl
            ? "باستخدامك لموقعنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل الاستمرار."
            : "By using our site, you agree to abide by these terms and conditions. Please read them carefully before continuing."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "الخدمات" : "Services"}</h2>
          <p>{isRtl
            ? "نقدم خدمات الزجاج والألمنيوم والمقاولات في المملكة العربية السعودية. تفاصيل كل خدمة وتسعيرها تحدد في عروض الأسعار المعتمدة."
            : "We provide glass, aluminum, and contracting services in Saudi Arabia. Details and pricing for each service are specified in approved quotes."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "الضمانات" : "Warranties"}</h2>
          <p>{isRtl
            ? "نقدم ضمانات على أعمالنا وفق ما هو محدد في عقد كل مشروع. لا تشمل الضمانات أضرار الإهمال أو الكوارث الطبيعية."
            : "We provide warranties on our work as specified in each project contract. Warranties do not cover negligence damage or natural disasters."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "المسؤولية" : "Liability"}</h2>
          <p>{isRtl
            ? "مسؤوليتنا محدودة بقيمة العقد المبرم. لا نتحمل مسؤولية الأضرار غير المباشرة أو التبعية."
            : "Our liability is limited to the contract value. We are not liable for indirect or consequential damages."}</p>
        </div>
      </div>
    </div>
  );
}
