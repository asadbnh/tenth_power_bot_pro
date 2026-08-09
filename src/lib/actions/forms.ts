"use server";

/**
 * Server Actions for Forms & Analytics Tracking
 * Fully aligned with Supabase schema (001_initial_schema.sql) and Telegram Notifications.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewQuoteRequest, notifyNewMessage } from "@/lib/telegram/notifications";

const FALLBACK_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDefaultCompanyId(supabase: any): Promise<string> {
  try {
    const { data } = await supabase.from("companies").select("id").limit(1).single();
    if (data?.id) return data.id;
  } catch {
    // fallback
  }
  return FALLBACK_COMPANY_ID;
}

// ─── Quote Request Form ───────────────────────────────────────────────

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
  const companyId = await getDefaultCompanyId(supabase);

  // 1. Upsert Lead User
  const { data: user, error: userErr } = await supabase
    .from("users")
    .upsert(
      {
        company_id: companyId,
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
      },
      { onConflict: "phone" }
    )
    .select("id")
    .single();

  if (userErr || !user) {
    console.error("Failed to create/upsert user in quote request:", userErr);
    return { success: false, error: "فشل في حفظ البيانات" };
  }

  // 2. Insert Quote Request
  const { data: quote, error: quoteErr } = await supabase
    .from("quote_requests")
    .insert({
      company_id: companyId,
      user_id: user.id,
      description: `الخدمات المطلوبة: ${data.services.join(", ")}\n\nتفاصيل إضافية: ${data.description}`,
      budget_range: data.budget,
      city: data.city,
      urgency: data.urgency,
      status: "new",
    })
    .select("id")
    .single();

  if (quoteErr) {
    console.error("Failed to create quote request:", quoteErr);
    return { success: false, error: "فشل في حفظ الطلب" };
  }

  // 3. Fire Real-time Telegram Admin Alert
  notifyNewQuoteRequest({
    id: quote.id,
    name: data.name,
    phone: data.phone,
    services: data.services,
    city: data.city,
    budget: data.budget,
    urgency: data.urgency,
    description: data.description,
  }).catch((err) => console.error("Telegram notification error:", err));

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
  const companyId = await getDefaultCompanyId(supabase);

  // 1. Upsert Lead User
  const { data: user } = await supabase
    .from("users")
    .upsert(
      {
        company_id: companyId,
        full_name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        source: "contact_form",
        metadata: { locale: data.locale ?? "ar" },
      },
      { onConflict: "phone" }
    )
    .select("id")
    .single();

  // 2. Insert Contact Message
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      company_id: companyId,
      user_id: user?.id ?? null,
      subject: data.subject ?? null,
      content: data.message,
      type: "contact",
      is_read: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to insert message:", error);
    return { success: false, error: "فشل في إرسال الرسالة" };
  }

  // 3. Fire Real-time Telegram Admin Alert
  notifyNewMessage({
    id: msg?.id ?? "unknown",
    name: data.name,
    phone: data.phone,
    email: data.email,
    subject: data.subject,
    content: data.message,
  }).catch((err) => console.error("Telegram message notification error:", err));

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
  const companyId = await getDefaultCompanyId(supabase);

  await supabase.from("analytics_events").insert({
    company_id: companyId,
    event_type: data.event_type,
    page_path: data.page_path ?? null,
    referrer: data.referrer ?? null,
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    device_type: data.device_type ?? null,
    metadata: data.metadata ?? null,
  });

  return { success: true };
}
