"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveSocialChannels } from "@/components/ui/SocialIcons";
import { PageHeroBackground } from "@/components/ui/PageHeroBackground";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props {
  locale: Locale;
  dict: Dictionary;
  company?: any;
}

export function ContactPageContent({ locale, dict, company }: Props) {
  const isRtl = locale === "ar";
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const socialChannels = resolveSocialChannels(company, isRtl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const { submitContactForm } = await import("@/lib/actions/forms");
      const res = await submitContactForm({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        locale,
      });
      if (res.success) {
        setStatus("sent");
      } else {
        alert(isRtl ? "فشل إرسال الرسالة، يرجى المحاولة لاحقاً" : "Failed to send message, please try again");
        setStatus("idle");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setStatus("idle");
    }
  }

  const INFO = [
    {
      icon: MapPin,
      label: dict.contact.info.address,
      value: (isRtl ? company?.address?.address_line_1_ar : company?.address?.address_line_1_en) ||
        (isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"),
    },
    {
      icon: Phone,
      label: dict.contact.info.phone,
      value: company?.phone_primary || "+966 53 243 8253",
      href: `tel:${(company?.phone_primary || "+966532438253").replace(/\s+/g, "")}`,
    },
    {
      icon: Mail,
      label: dict.contact.info.email,
      value: company?.email || "info@tenth-power-glass.com",
      href: `mailto:${company?.email || "info@tenth-power-glass.com"}`,
    },
    {
      icon: Clock,
      label: dict.contact.info.workingHours,
      value: isRtl ? "السبت – الخميس: 8 ص – 6 م" : "Sat – Thu: 8 AM – 6 PM",
    },
  ];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Architectural Contact Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-slate-50 dark:bg-[#070d1e] overflow-hidden border-b border-slate-200/80 dark:border-amber-500/10 transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <PageHeroBackground pageKey="contact" overlayOpacity={0.4} />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[16rem] bg-gradient-to-r from-amber-500/10 via-blue-600/10 to-amber-400/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 via-transparent to-slate-50 dark:from-[#070d1e]/85 dark:via-transparent dark:to-[#070d1e] transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <a href={`/${locale}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </a>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-amber-600 dark:text-amber-400/90 font-medium">{dict.contact.title}</span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            {isRtl ? (
              <>
                تواصل مع{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  فريقنا الهندسي
                </span>
              </>
            ) : (
              <>
                Contact Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-[#F3E7C4] dark:via-[#E5C378] dark:to-[#C99E32]">
                  Engineering Team
                </span>
              </>
            )}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            {dict.contact.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: isRtl ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl border border-border-light bg-surface-elevated p-4 sm:p-6 space-y-4 sm:space-y-5">
                {INFO.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors" dir="ltr">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* WhatsApp quick contact */}
              <a href={`https://wa.me/${(company?.whatsapp_number || "966532438253").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(isRtl ? "مرحباً، أريد التواصل معكم" : "Hello, I would like to contact you")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors shadow-md hover:shadow-lg">
                <MessageSquare className="w-5 h-5" />
                {isRtl ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
              </a>

              {/* All Database Social & Communication Channels */}
              {socialChannels.length > 0 && (
                <div className="rounded-2xl border border-border-light bg-surface-elevated p-5 space-y-3">
                  <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {isRtl ? "قنوات التواصل والمتابعة المباشرة" : "Verified Social & Communication Channels"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {socialChannels.map((channel) => {
                      const Icon = channel.icon;
                      return (
                        <a
                          key={channel.key}
                          href={channel.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-xs font-semibold hover:shadow-xs",
                            channel.bgLight,
                            channel.colorHover
                          )}
                        >
                          <span className="w-6 h-6 rounded-lg bg-background/80 flex items-center justify-center shrink-0 shadow-2xs">
                            <Icon />
                          </span>
                          <span className="truncate">{channel.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Map embed placeholder */}
              <div className="rounded-2xl overflow-hidden border border-border-light h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                  <p className="text-sm text-text-secondary">{isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3">
              <div className="rounded-2xl border border-border-light bg-surface-elevated p-4 sm:p-8">
                {status === "sent" ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{isRtl ? "تم الإرسال!" : "Sent!"}</h3>
                    <p className="text-text-secondary">{dict.contact.form.success}</p>
                    <button onClick={() => setStatus("idle")}
                      className="mt-6 px-6 py-2.5 rounded-xl border border-border-light hover:bg-surface transition-colors text-sm font-medium">
                      {isRtl ? "إرسال رسالة أخرى" : "Send Another"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold mb-2">{dict.contact.form.submit}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">{dict.contact.form.name} <span className="text-rose-500">*</span></label>
                        <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">{dict.contact.form.phone} <span className="text-rose-500">*</span></label>
                        <input type="tel" required dir="ltr" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{dict.contact.form.email}</label>
                      <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{dict.contact.form.subject}</label>
                      <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{dict.contact.form.message} <span className="text-rose-500">*</span></label>
                      <textarea required rows={5} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm resize-none" />
                    </div>
                    <button type="submit" disabled={status === "sending"}
                      className={cn("w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all text-sm",
                        "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-md hover:shadow-lg",
                        status === "sending" && "opacity-70 cursor-not-allowed")}>
                      {status === "sending" ? (
                        <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{dict.contact.form.sending}</>
                      ) : (
                        <><Send className="w-4 h-4" />{dict.contact.form.submit}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
