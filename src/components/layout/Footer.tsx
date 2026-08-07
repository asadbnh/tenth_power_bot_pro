import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

// Inline social icons — lucide-react v1.x dropped Facebook/Instagram/Twitter
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const IconTwitterX = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

const SOCIAL_LINKS = [
  { icon: IconInstagram, href: "#", label: "Instagram" },
  { icon: IconTwitterX, href: "#", label: "X (Twitter)" },
  { icon: IconFacebook, href: "#", label: "Facebook" },
  { icon: IconYoutube, href: "#", label: "YouTube" },
];

/**
 * Premium footer with multi-column layout, SEO-friendly links,
 * contact info, social icons, and newsletter signup.
 */
export function Footer({ locale, dict }: FooterProps) {
  const isRtl = locale === "ar";
  const year = new Date().getFullYear();
  const getHref = (path: string) => `/${locale}${path}`;

  return (
    <footer
      className="relative bg-primary-950 text-white overflow-hidden"
      role="contentinfo"
    >
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: About & Logo */}
          <div className="lg:col-span-1">
            <Link href={getHref("")} className="inline-flex items-center gap-2 mb-4 group">
              <CompanyLogo size={40} className="shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
              <span className="text-xl font-bold">{dict.meta.siteName}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {dict.meta.siteDescription}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary-600 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              {dict.footer.quickLinks}
            </h3>
            <ul className="space-y-3">
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
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              {dict.footer.ourServices}
            </h3>
            <ul className="space-y-3">
              {[
                isRtl ? "زجاج سكريت" : "Tempered Glass",
                isRtl ? "واجهات زجاجية" : "Glass Facades",
                isRtl ? "ألمنيوم" : "Aluminum",
                isRtl ? "مطابخ" : "Kitchens",
                isRtl ? "ديكورات" : "Decorations",
                isRtl ? "أبواب ونوافذ" : "Doors & Windows",
              ].map((service) => (
                <li key={service}>
                  <Link
                    href={getHref("/services")}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              {dict.footer.contactInfo}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/60">
                  {isRtl
                    ? "الرياض، المملكة العربية السعودية"
                    : "Riyadh, Saudi Arabia"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <a
                  href="tel:+966500000000"
                  className="text-sm text-white/60 hover:text-white transition-colors ltr-only"
                  dir="ltr"
                >
                  +966 50 000 0000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:info@webtaky.com"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  info@webtaky.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/60">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {year} {dict.meta.siteName}. {dict.footer.rights}.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
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
