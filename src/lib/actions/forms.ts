"use server";

/**
 * Quote Request Server Action
 * Called from the Quote wizard form on submission.
 * Saves to DB + fires Telegram notification.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewQuoteRequest, notifyNewMessage } from "@/lib/telegram/notifications";

interface QuoteFormData {
  services: string[];
  description: string;
  budget: string;
  urgency: string;
  city: string;
  name: string;
  phone: string;
  email?: string;
  preferWhatsApp: boolean;
  locale?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export async function submitQuoteRequest(data: QuoteFormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: user, error: userErr } = await supabase
    .from("users")
    .insert({
      full_name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      whatsapp: data.preferWhatsApp ? data.phone : null,
      city: data.city,
      source: "quote_form",
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      metadata: { locale: data.locale ?? "ar" },
    })
    .select("id")
    .single();

  if (userErr) {
    console.error("Failed to create user:", userErr);
    return { success: false, error: "فشل في حفظ البيانات" };
  }

  const { data: quote, error: quoteErr } = await supabase
    .from("quote_requests")
    .insert({
      user_id: user.id,
      description: `الخدمات: ${data.services.join(", ")}\n\n${data.description}`,
      budget_range: data.budget,
      city: data.city,
      urgency: data.urgency,
      status: "new",
      source: "website",
    })
    .select("id")
    .single();

  if (quoteErr) {
    console.error("Failed to create quote:", quoteErr);
    return { success: false, error: "فشل في حفظ الطلب" };
  }

  notifyNewQuoteRequest({
    id: quote.id,
    name: data.name,
    phone: data.phone,
    services: data.services,
    city: data.city,
    budget: data.budget,
    urgency: data.urgency,
    description: data.description,
  }).catch(console.error);

  return { success: true, id: quote.id };
}

// ─── Contact Form ─────────────────────────────────────────────────────

interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  locale?: string;
}

export async function submitContactForm(data: ContactFormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: user } = await supabase
    .from("users")
    .insert({
      full_name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      source: "contact_form",
      metadata: { locale: data.locale ?? "ar" },
    })
    .select("id")
    .single();

  const { error } = await supabase.from("messages").insert({
    user_id: user?.id ?? null,
    subject: data.subject ?? null,
    content: data.message,
    type: "contact",
    is_read: false,
  });

  if (error) return { success: false, error: "فشل في إرسال الرسالة" };

  if (user?.id) {
    const { data: msg } = await supabase
      .from("messages")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    notifyNewMessage({
      id: msg?.id ?? "unknown",
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject,
      content: data.message,
    }).catch(console.error);
  }

  return { success: true };
}

// ─── Analytics Event Tracking ─────────────────────────────────────────

interface AnalyticsEventData {
  event_type: string;
  page_path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(data: AnalyticsEventData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  await supabase.from("analytics_events").insert(data);
  return { success: true };
}
