import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { cn } from "@/lib/utils";

// Social SVG Icons
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const IconSnapchat = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12.007 2c-3.766 0-6.195 2.825-6.22 5.86-.008.97.288 1.93.473 2.502.13.4.088.6-.263.854-.538.39-1.464.912-1.848 1.474-.356.52-.163 1.144.385 1.345.867.318 1.83.216 2.527.05.27-.064.444.082.522.284.28 1.44 1.34 2.89 3.018 3.518.33.123.518.324.498.63-.038.572-.44 1.344-1.503 1.565-.45.093-.728.32-.712.593.018.307.397.525.864.525.597 0 1.258-.23 1.905-.457.485-.17.97-.247 1.436-.08.578.207 1.292.537 1.97.537.467 0 .846-.218.864-.525.016-.273-.262-.5-.712-.593-1.063-.22-1.465-.993-1.503-1.565-.02-.306.168-.507.498-.63 1.678-.628 2.738-2.078 3.018-3.518.078-.202.252-.348.522-.284.697.166 1.66.268 2.527-.05.548-.201.741-.825.385-1.345-.384-.562-1.31-1.084-1.848-1.474-.35-.254-.393-.454-.263-.854.185-.572.481-1.532.473-2.502C18.202 4.825 15.773 2 12.007 2z" />
  </svg>
);
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.89-2.88 2.89 2.89 0 012.89-2.89c.35 0 .69.06 1 .18V9.45a6.37 6.37 0 00-1-.08A6.34 6.34 0 003 15.71a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34v-7.05a8.28 8.28 0 004.91 1.62v-3.59z" />
  </svg>
);
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const IconTwitterX = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
  company?: any;
  services?: any[];
}

/**
 * Premium footer with multi-column layout, SEO-friendly links,
 * contact info, dynamic social media channels from database, and newsletter signup.
 */
export function Footer({ locale, dict, company, services }: FooterProps) {
  const isRtl = locale === "ar";
  const year = new Date().getFullYear();
  const getHref = (path: string) => `/${locale}${path}`;

  const phone = company?.phone_primary || "+966 50 000 0000";
  const email = company?.email || "info@powerof10.sa";
  const address = (isRtl ? (company?.address?.street_ar || company?.address?.address_line_1_ar) : (company?.address?.street_en || company?.address?.address_line_1_en)) ||
    (isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia");

  const servicesList = (services && services.length > 0)
    ? services.slice(0, 6).map((s) => ({
        label: isRtl ? (s.name_ar || s.name) : (s.name_en || s.name_ar || s.name),
        href: `/services/${s.slug}`,
      }))
    : [
        { label: isRtl ? "زجاج سكريت" : "Tempered Glass", href: "/services" },
        { label: isRtl ? "واجهات زجاجية" : "Glass Facades", href: "/services" },
        { label: isRtl ? "ألمنيوم" : "Aluminum", href: "/services" },
        { label: isRtl ? "مطابخ" : "Kitchens", href: "/services" },
        { label: isRtl ? "ديكورات" : "Decorations", href: "/services" },
        { label: isRtl ? "أبواب ونوافذ" : "Doors & Windows", href: "/services" },
      ];

  // ─── Resolve Social & Contact Channels Dynamically from Database ───
  const dynamicSocialLinks: Array<{
    key: string;
    label: string;
    href: string;
    icon: React.ComponentType;
    colorHover: string;
  }> = [];

  const seenKeys = new Set<string>();

  const resolveChannel = (type: string, rawVal: unknown, customLabel?: string) => {
    if (typeof rawVal !== "string" || !rawVal.trim() || rawVal === "#") return;
    const val = rawVal.trim();
    const t = type.toLowerCase().trim();
    const cleanDigits = val.replace(/[^0-9]/g, "");
    const waPhone = cleanDigits.startsWith("05") ? "966" + cleanDigits.substring(1) : cleanDigits;

    let item: {
      key: string;
      label: string;
      href: string;
      icon: React.ComponentType;
      colorHover: string;
    } | null = null;

    if (t === "whatsapp") {
      item = {
        key: "whatsapp",
        label: customLabel || (isRtl ? "واتساب" : "WhatsApp"),
        href: val.startsWith("http") ? val : `https://wa.me/${waPhone}`,
        icon: IconWhatsApp,
        colorHover: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
      };
    } else if (t === "phone" || t === "call") {
      item = {
        key: "phone",
        label: customLabel || (isRtl ? "هاتف المبيعات" : "Sales Phone"),
        href: val.startsWith("tel:") ? val : `tel:${val.replace(/\s+/g, "")}`,
        icon: Phone,
        colorHover: "hover:bg-amber-500 hover:text-white hover:border-amber-500",
      };
    } else if (t === "instagram" || t === "insta") {
      item = {
        key: "instagram",
        label: customLabel || (isRtl ? "انستقرام" : "Instagram"),
        href: val.startsWith("http") ? val : `https://instagram.com/${val.replace(/^@/, "")}`,
        icon: IconInstagram,
        colorHover: "hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C]",
      };
    } else if (t === "snapchat" || t === "snap") {
      item = {
        key: "snapchat",
        label: customLabel || (isRtl ? "سناب شات" : "Snapchat"),
        href: val.startsWith("http") ? val : `https://www.snapchat.com/add/${val.replace(/^@/, "")}`,
        icon: IconSnapchat,
        colorHover: "hover:bg-[#FFFC00] hover:text-black hover:border-[#FFFC00]",
      };
    } else if (t === "tiktok") {
      item = {
        key: "tiktok",
        label: customLabel || (isRtl ? "تيك توك" : "TikTok"),
        href: val.startsWith("http") ? val : `https://www.tiktok.com/@${val.replace(/^@/, "")}`,
        icon: IconTikTok,
        colorHover: "hover:bg-black hover:text-[#00f2fe] hover:border-white/30",
      };
    } else if (t === "telegram" || t === "telegram_bot") {
      item = {
        key: "telegram",
        label: customLabel || (isRtl ? "حساب تلجرام" : "Telegram"),
        href: val.startsWith("http") ? val : `https://t.me/${val.replace(/^@/, "")}`,
        icon: IconTelegram,
        colorHover: "hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]",
      };
    } else if (t === "telegram_channel") {
      item = {
        key: "telegram_channel",
        label: customLabel || (isRtl ? "قناة تلجرام" : "Telegram Channel"),
        href: val.startsWith("http") ? val : `https://t.me/${val.replace(/^@/, "")}`,
        icon: IconTelegram,
        colorHover: "hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]",
      };
    } else if (t === "twitter" || t === "x") {
      item = {
        key: "x",
        label: customLabel || "X (Twitter)",
        href: val.startsWith("http") ? val : `https://x.com/${val.replace(/^@/, "")}`,
        icon: IconTwitterX,
        colorHover: "hover:bg-black hover:text-white hover:border-white/30",
      };
    } else if (t === "facebook" || t === "fb") {
      item = {
        key: "facebook",
        label: customLabel || (isRtl ? "فيسبوك" : "Facebook"),
        href: val.startsWith("http") ? val : `https://facebook.com/${val}`,
        icon: IconFacebook,
        colorHover: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
      };
    } else if (t === "youtube" || t === "yt") {
      item = {
        key: "youtube",
        label: customLabel || (isRtl ? "يوتيوب" : "YouTube"),
        href: val.startsWith("http") ? val : `https://youtube.com/${val}`,
        icon: IconYoutube,
        colorHover: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
      };
    }

    if (item && !seenKeys.has(item.key)) {
      dynamicSocialLinks.push(item);
      seenKeys.add(item.key);
    }
  };

  // 1. Prioritize company_contacts from Neon DB (matches the 7 channels in the bot)
  if (Array.isArray(company?.contacts)) {
    for (const c of company.contacts) {
      resolveChannel(c.type, c.value, isRtl ? (c.label_ar || c.label_en) : (c.label_en || c.label_ar));
    }
  }

  // 2. Also check company.social_links JSON from Neon DB if not already present
  let rawLinks = company?.social_links;
  if (typeof rawLinks === "string") {
    try { rawLinks = JSON.parse(rawLinks); } catch { rawLinks = {}; }
  }
  if (rawLinks && typeof rawLinks === "object") {
    for (const [k, v] of Object.entries(rawLinks)) {
      resolveChannel(k, v);
    }
  }

  // 3. Fallback to primary phone/whatsapp if no contacts exist
  if (dynamicSocialLinks.length === 0) {
    if (company?.whatsapp_number) {
      resolveChannel("whatsapp", company.whatsapp_number);
    }
    if (company?.phone_primary) {
      resolveChannel("phone", company.phone_primary);
    }
  }

  return (
    <footer
      className="relative bg-primary-950 text-white overflow-hidden"
      role="contentinfo"
    >
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8">
          {/* Column 1: About & Logo */}
          <div className="lg:col-span-1 space-y-3">
            <Link href={getHref("")} className="inline-flex items-center gap-2 group">
              <CompanyLogo size={32} className="shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
              <span className="text-base sm:text-xl font-bold text-white leading-tight">{dict.meta.siteName}</span>
            </Link>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
              {dict.meta.siteDescription}
            </p>
            {/* Social Links (Dynamic from Neon DB) */}
            {dynamicSocialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {dynamicSocialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/80 transition-all duration-200 hover:scale-110 shadow-sm",
                        social.colorHover
                      )}
                      aria-label={social.label}
                      title={social.label}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links & Services Container */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                {dict.footer.quickLinks}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {[
                  { label: dict.nav.home, href: "" },
                  { label: dict.nav.about, href: "/about" },
                  { label: dict.nav.projects, href: "/projects" },
                  { label: dict.nav.blog, href: "/blog" },
                  { label: dict.nav.faq, href: "/faq" },
                  { label: dict.nav.testimonials, href: "/testimonials" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={getHref(link.href)}
                      className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services (Dynamic from Neon DB) */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                {dict.footer.ourServices}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {servicesList.map((service) => (
                  <li key={service.href || service.label}>
                    <Link
                      href={getHref(service.href)}
                      className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors truncate block"
                    >
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-2.5">
              {dict.footer.contactInfo}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-white/70">
                  {address}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors ltr-only"
                  dir="ltr"
                >
                  {phone}
                </a>
              </li>
              {company?.whatsapp_number && (
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 flex items-center justify-center">
                    <IconWhatsApp />
                  </span>
                  <a
                    href={`https://wa.me/${(company.whatsapp_number).replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-white/70 hover:text-emerald-400 transition-colors ltr-only"
                    dir="ltr"
                  >
                    {company.whatsapp_number}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href={`mailto:${email}`}
                  className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-white/70">
                  {isRtl
                    ? "السبت - الخميس: 8 ص - 6 م"
                    : "Sat - Thu: 8 AM - 6 PM"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50 text-center sm:text-start">
            © {year} {dict.meta.siteName}. {dict.footer.rights}.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <Link href={getHref("/privacy")} className="hover:text-white transition-colors">
              {dict.footer.privacy}
            </Link>
            <span className="text-white/20">|</span>
            <Link href={getHref("/terms")} className="hover:text-white transition-colors">
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
