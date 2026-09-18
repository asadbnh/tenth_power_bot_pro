import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFallbackCompany } from "@/lib/fallback-provider";
import { chatWithGemini, processChatLead } from "@/lib/ai";

/**
 * POST /api/chat
 * High-performance AI Chat endpoint supporting Google Gemini Stateful Multi-turn Interactions API
 * with session continuity (previous_interaction_id), multi-key failover, in-memory prompt caching,
 * automated lead capture, and instant Telegram alerts to admins.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, locale, previous_interaction_id, interaction_id, session_id } = await request.json();
    const isAr = locale === "ar";
    const lastUserMessage = messages?.[messages.length - 1]?.content ?? "";
    const previousId = previous_interaction_id || interaction_id || null;
    const company = getFallbackCompany();

    let aiResponseText = "";
    let nextInteractionId: string | null = previousId;

    // 1. Detect and process contact requests (Lead Generation -> DB + Telegram Notification)
    let leadCaptured = false;
    let leadPhone = "";
    let leadName = "";

    if (lastUserMessage) {
      try {
        const leadResult = await processChatLead({
          text: lastUserMessage,
          chatHistory: messages || [],
          sessionId: session_id,
          locale: locale || "ar",
        });

        if (leadResult.captured && leadResult.phone) {
          leadCaptured = true;
          leadPhone = leadResult.phone;
          leadName = leadResult.name || "";
        }
      } catch (leadErr) {
        console.warn("[Chat Route] Lead capture error:", leadErr);
      }
    }

    // 2. Call Google Gemini via our robust multi-turn / multi-key engine
    if (lastUserMessage) {
      try {
        // If lead was just captured, provide a system instruction hint
        const promptOverrideNote = leadCaptured
          ? isAr
            ? `العميل أرسل بياناته الآن (الاسم: ${leadName}، الجوال: ${leadPhone}). تم حفظ الطلب في النظام وإرسال إشعار فوري لمهندسينا. اشكر العميل وأكد له أن المهندس المختص سيتواصل معه عبر الهاتف أو الواتساب في أقرب وقت لمناقشة تفاصيل مشروعه.`
            : `Client just provided contact info (Name: ${leadName}, Phone: ${leadPhone}). Details were forwarded to the engineering team. Thank the client and assure them an engineer will contact them promptly.`
          : undefined;

        const aiResult = await chatWithGemini({
          input: lastUserMessage,
          messages: messages || [],
          previousInteractionId: previousId,
          locale: locale || "ar",
          systemPromptOverride: promptOverrideNote,
        });

        if (aiResult?.text) {
          aiResponseText = aiResult.text;
          nextInteractionId = aiResult.interactionId || previousId;
        }
      } catch (geminiErr) {
        console.error("[Chat Route] Error calling Gemini engine:", geminiErr);
      }
    }

    // 3. Smart Business Fallback if all keys exhausted or offline
    if (!aiResponseText) {
      const lower = lastUserMessage.toLowerCase();
      if (leadCaptured) {
        aiResponseText = isAr
          ? `شكراً لك أخي الكريم! تم استلام بياناتك بنجاح (${leadPhone}) وإرسال إشعار فوري للفريق الهندسي والإداري، وسيقوم مهندسنا المختص بالاتصال بك في أقرب وقت ممكن بإذن الله.`
          : `Thank you! Your contact details (${leadPhone}) have been received and forwarded to our engineering team. An engineer will contact you shortly.`;
      } else if (/price|سعر|تكلفة|كم/.test(lower)) {
        aiResponseText = isAr
          ? `تعتمد التقديرات على المواصفات الفنية، سماكة الخامات، والمساحة الإجمالية للمشروع. يمكنك [طلب عرض سعر مجاني](/quote) للحصول على دراسة مالية وفنية معتمدة.`
          : `Project estimates depend on engineering specs, material thickness, and area. You can [Request a Free Quote](/quote) for an official estimate.`;
      } else if (/glass|زجاج|سكريت|واجهة/.test(lower)) {
        aiResponseText = isAr
          ? `تنفذ ${company.name_ar} [أنظمة زجاج السيكوريت](/services/tempered-glass) و[الواجهات الزجاجية الهيكلية والكرتن وول](/services/glass-facades) وفق كود البناء السعودي مع ضمان ممتد حتى 10 سنوات.`
          : `${company.name_en} executes [Tempered Glass Systems](/services/tempered-glass) and [Structural Facades & Curtain Walls](/services/glass-facades) compliant with SBC standards and up to 10-year warranty.`;
      } else if (/تواصل|اتصل|كلمني|رقم|phone|call/.test(lower)) {
        aiResponseText = isAr
          ? `يسعدنا جداً التواصل معكم! فضلاً أرسل **اسمك الكريم ورقم جوالك**، وسيتم إرسال إشعار فوري لمهندسينا والتواصل معك في أسرع وقت. كما يمكنك زيارة [صفحة تواصل معنا](/contact).`
          : `We would be happy to contact you! Please share your **name and phone number**, and our engineering team will call you shortly. You can also visit [Contact Us](/contact).`;
      } else {
        aiResponseText = isAr
          ? `أهلاً بك في ${company.name_ar}. أنا المساعد الهندسي الذكي للإجابة عن استفساراتكم حول [المشاريع المنفذة](/projects) و[خدمات الزجاج والألمنيوم](/services). كيف يمكنني مساعدتك؟`
          : `Welcome to ${company.name_en}. I am the AI Engineering Assistant here to assist with [Executed Projects](/projects) and [Glass & Aluminum Services](/services). How can I assist you?`;
      }
    }

    // 4. Persist Chat Session & Messages to DB for CRM and Analytics
    let currentSessionId = session_id;
    try {
      const supabase = createAdminClient() as any;
      const { data: comp } = await supabase.from("companies").select("id").limit(1).single();
      const companyId = comp?.id || "00000000-0000-0000-0000-000000000001";

      if (!currentSessionId) {
        const { data: sess } = await supabase
          .from("chat_sessions")
          .insert({
            company_id: companyId,
            status: "active",
            message_count: 2,
            context: {
              locale: locale || "ar",
              last_interaction_id: nextInteractionId,
              lead_captured: leadCaptured,
              lead_phone: leadPhone || null,
            },
          })
          .select("id")
          .single();

        if (sess?.id) {
          currentSessionId = sess.id;
        }
      } else {
        await supabase
          .from("chat_sessions")
          .update({
            message_count: messages?.length ? messages.length + 1 : 2,
            context: {
              locale: locale || "ar",
              last_interaction_id: nextInteractionId,
              lead_captured: leadCaptured,
              lead_phone: leadPhone || null,
            },
          })
          .eq("id", currentSessionId);
      }

      if (currentSessionId && lastUserMessage) {
        await supabase.from("chat_messages").insert([
          { session_id: currentSessionId, role: "user", content: lastUserMessage },
          { session_id: currentSessionId, role: "assistant", content: aiResponseText },
        ]);
      }
    } catch (dbChatErr) {
      console.warn("[Chat Route] Could not persist chat session/messages:", dbChatErr);
    }

    // 5. Stream output word by word for fluid UI animation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiResponseText.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });

    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    };

    if (nextInteractionId) {
      responseHeaders["x-interaction-id"] = nextInteractionId;
    }

    if (currentSessionId) {
      responseHeaders["x-session-id"] = currentSessionId;
    }

    if (leadCaptured) {
      responseHeaders["x-lead-captured"] = "true";
    }

    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("[Chat Route] Critical API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
