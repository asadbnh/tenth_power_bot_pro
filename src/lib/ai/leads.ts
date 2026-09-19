import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewAiChatLead } from "@/lib/telegram/notifications";

/**
 * Normalizes Eastern Arabic / Persian numerals to Western digits (٠-٩ -> 0-9).
 */
export function normalizeArabicDigits(str: string): string {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[٠-٩]/g, (w) => arabicNumbers.indexOf(w).toString());
}

/**
 * Extracts a Saudi or international phone number from free-form text.
 */
export function extractPhoneNumber(text: string): string | null {
  if (!text) return null;
  const normalized = normalizeArabicDigits(text).replace(/[\u200e\u200f\s-]/g, "");

  // Match 05xxxxxxxx or 9665xxxxxxxx or +9665xxxxxxxx
  const saudiMatch = normalized.match(/(?:\+?966|0)?5[0-9]{8}/);
  if (saudiMatch) {
    let clean = saudiMatch[0];
    if (clean.startsWith("+966")) clean = "0" + clean.slice(4);
    else if (clean.startsWith("966")) clean = "0" + clean.slice(3);
    return clean;
  }

  // Fallback: any standard international phone with 9-14 digits
  const generalMatch = normalized.match(/(?:\+|00)?[0-9]{9,14}/);
  if (generalMatch) {
    return generalMatch[0];
  }

  return null;
}

/**
 * Extracts name from typical Arabic phrases like "اسمي خالد", "معكم محمد", "الاسم: فهد"
 */
export function extractName(text: string): string {
  if (!text) return "عميل مهتم (عبر الشات)";

  const namePatterns = [
    /(?:اسمي|أنا|معكم|الاسم\s*:?)\s+([^\d\n،,.]+)/i,
    /(?:أخوكم|الأخ)\s+([^\d\n،,.]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      const name = match[1].trim().slice(0, 40);
      if (name.length >= 2) return name;
    }
  }

  return "عميل مهتم (عبر الشات)";
}

/**
 * Processes a lead captured during AI conversation:
 * 1. Upserts the user in the `users` table.
 * 2. Inserts a contact record in `messages` table.
 * 3. Dispatches immediate Telegram broadcast alert to all admins.
 */
export async function processChatLead({
  text,
  chatHistory = [],
  sessionId,
  locale = "ar",
}: {
  text: string;
  chatHistory?: { role: string; content: string }[];
  sessionId?: string | null;
  locale?: string;
}): Promise<{ captured: boolean; phone?: string; name?: string }> {
  const phone = extractPhoneNumber(text);
  if (!phone) {
    return { captured: false };
  }

  const name = extractName(text);

  try {
    const supabase = createAdminClient() as any;
    let companyId = "00d8d3a7-fa3b-4dd5-bf05-8081a6fc1089";
    try {
      const { data: comp } = await supabase.from("companies").select("id").limit(1);
      if (Array.isArray(comp) && comp[0]?.id) companyId = comp[0].id;
    } catch {}

    // 1. Check if lead already captured for this session to avoid duplicate spamming
    if (sessionId) {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("context")
          .eq("id", sessionId)
          .limit(1);

        const sess = Array.isArray(sessions) ? sessions[0] : sessions;
        if (sess?.context?.lead_phone === phone) {
          // Already notified for this phone in this session
          return { captured: true, phone, name };
        }
      } catch {
        // ignore check error
      }
    }

    // 2. Upsert user in `users` table
    const { data: user } = await supabase
      .from("users")
      .upsert(
        {
          company_id: companyId,
          full_name: name,
          phone,
          source: "ai_chat",
          metadata: {
            locale,
            session_id: sessionId,
            captured_at: new Date().toISOString(),
          },
        },
        { onConflict: "company_id,phone" }
      )
      .select("id")
      .single();

    // 3. Prepare summary from recent messages
    const recentContext = chatHistory
      .slice(-4)
      .map((m) => `${m.role === "user" ? "العميل" : "المساعد"}: ${m.content.slice(0, 100)}`)
      .join("\n");

    const messageContent = `طلب اتصال واستشارة هندسية من الشات الذكي.\n\nبيانات العميل:\n- الاسم: ${name}\n- الجوال: ${phone}\n\nسياق المحادثة:\n${recentContext || text}`;

    // 4. Insert into `messages` table
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        company_id: companyId,
        user_id: user?.id ?? null,
        subject: "🤖 طلب تواصل واستشارة عبر المساعد الذكي",
        content: messageContent,
        type: "contact",
        is_read: false,
      })
      .select("id")
      .single();

    // 5. Update session context to mark lead as captured
    if (sessionId) {
      await supabase
        .from("chat_sessions")
        .update({
          context: {
            locale,
            lead_phone: phone,
            lead_name: name,
            lead_captured: true,
          },
        })
        .eq("id", sessionId);
    }

    // 6. Real-time Telegram broadcast alert to all admins
    await notifyNewAiChatLead({
      id: msg?.id || (sessionId ?? "chat-lead"),
      name,
      phone,
      summary: `طلب العميل اتصالاً فورياً عبر الشات الذكي.\n\n💬 آخر رسالة: "${text}"`,
      sessionId: sessionId || undefined,
    });

    console.log(`[AI Lead Capture] Successfully captured lead: ${name} (${phone})`);
    return { captured: true, phone, name };
  } catch (err) {
    console.error("[AI Lead Capture] Error saving lead or sending notification:", err);
    return { captured: false };
  }
}
