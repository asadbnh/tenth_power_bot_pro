import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return { title: dict.footer.privacy };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === "ar";

  return (
    <div className="pt-[var(--header-height)] min-h-dvh bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold mb-8">{isRtl ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p>{isRtl
            ? "نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها."
            : "We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "المعلومات التي نجمعها" : "Information We Collect"}</h2>
          <p>{isRtl
            ? "نجمع المعلومات التي تقدمها لنا مباشرةً مثل: الاسم، رقم الجوال، البريد الإلكتروني عند تعبئة نماذج التواصل أو طلب عروض الأسعار."
            : "We collect information you provide directly such as: name, phone number, email when filling contact forms or requesting quotes."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "كيف نستخدم معلوماتك" : "How We Use Your Information"}</h2>
          <p>{isRtl
            ? "نستخدم المعلومات للرد على استفساراتك، تقديم عروض الأسعار، وتحسين خدماتنا. لن نبيع بياناتك لأطراف ثالثة أبداً."
            : "We use information to respond to your inquiries, provide quotes, and improve our services. We will never sell your data to third parties."}</p>
          <h2 className="text-xl font-bold text-text-primary">{isRtl ? "التواصل معنا" : "Contact Us"}</h2>
          <p>{isRtl
            ? "لأي استفسارات حول هذه السياسة، تواصل معنا على: info@webtaky.com"
            : "For any questions about this policy, contact us at: info@webtaky.com"}</p>
        </div>
      </div>
    </div>
  );
}
