"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface Props { locale: Locale; dict: Dictionary; }

export function ContactPageContent({ locale, dict }: Props) {
  const isRtl = locale === "ar";
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // Simulate API call — real implementation will POST to /api/contact
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("sent");
  }

  const INFO = [
    { icon: MapPin, label: dict.contact.info.address, value: isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia" },
    { icon: Phone, label: dict.contact.info.phone, value: "+966 50 000 0000", href: "tel:+966500000000" },
    { icon: Mail, label: dict.contact.info.email, value: "info@webtaky.com", href: "mailto:info@webtaky.com" },
    { icon: Clock, label: dict.contact.info.workingHours, value: isRtl ? "السبت – الخميس: 8 ص – 6 م" : "Sat – Thu: 8 AM – 6 PM" },
  ];

  return (
    <div className="pt-[var(--header-height)]">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary-950 via-[#0c1445] to-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4">{dict.contact.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/60">{dict.contact.subtitle}</motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: isRtl ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl border border-border-light bg-surface-elevated p-6 space-y-5">
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
              <a href="https://wa.me/966500000000?text=مرحباً، أريد التواصل معكم"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors shadow-md hover:shadow-lg">
                <MessageSquare className="w-5 h-5" />
                {isRtl ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
              </a>

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
              <div className="rounded-2xl border border-border-light bg-surface-elevated p-8">
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
