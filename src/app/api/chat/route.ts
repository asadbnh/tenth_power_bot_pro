import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/chat
 * AI Chat streaming endpoint fetching configurable system prompt from Supabase ai_prompts
 * and connecting to Google Gemini REST API with graceful fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, locale } = await request.json();
    const isAr = locale === "ar";
    const lastUserMessage = messages?.[messages.length - 1]?.content ?? "";

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    let aiResponseText = "";

    // 1. Fetch System Prompt dynamically from Supabase ai_prompts table
    let systemPrompt = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createAdminClient() as any;
      const { data: promptRow } = await supabase
        .from("ai_prompts")
        .select("system_prompt_ar, system_prompt_en")
        .eq("prompt_type", "chat")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (promptRow) {
        systemPrompt = isAr
          ? promptRow.system_prompt_ar || promptRow.system_prompt_en
          : promptRow.system_prompt_en || promptRow.system_prompt_ar;
      }
    } catch {
      // fallback if table query fails
    }

    if (!systemPrompt) {
      systemPrompt = isAr
        ? "أنت المساعد الذكي لشركة القوة العاشرة لزجاج وأعمال المقاولات (WebTaky). أجب باحترافية وبإيجاز، وانصح العميل بطلب عرض سعر مجاني."
        : "You are the AI Assistant for Tenth Power Glass & Contracting (WebTaky). Answer concisely and suggest requesting a free quote.";
    }

    // 2. Try Google Gemini REST API if key is set
    if (apiKey && apiKey !== "your_gemini_api_key") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `${systemPrompt}\n\nسؤال العميل: ${lastUserMessage}` },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.7,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            aiResponseText = candidateText;
          }
        } else {
          console.warn("Gemini API warning, status:", geminiRes.status);
        }
      } catch (err) {
        console.error("Gemini fetch error:", err);
      }
    }

    // 2. Fallback smart responses if Gemini API is offline or quota reached
    if (!aiResponseText) {
      const lower = lastUserMessage.toLowerCase();
      if (/price|سعر|تكلفة|كم/.test(lower)) {
        aiResponseText = isAr
          ? "تختلف الأسعار حسب نوع الخامات والمساحة ونوع الخدمة (زجاج سكريت، واجهات، ألمنيوم، مطابخ). ننصح بطلب عرض سعر مجاني للحصول على تسعيرة دقيقة خلال 24 ساعة! 💰"
          : "Prices vary based on materials, area, and service type. We recommend requesting a free quote for precise pricing within 24 hours! 💰";
      } else if (/glass|زجاج|سكريت|واجهة/.test(lower)) {
        aiResponseText = isAr
          ? "ننفذ زجاج السكريت المقوى بسماكات 6-12 مم وأنظمة الكرتن وول والسبايدر للواجهات مع ضمان 10 سنوات على المواد والتركيب. 🪟"
          : "We install tempered glass in 6-12mm thicknesses and curtain wall / spider systems with 10 years warranty. 🪟";
      } else {
        aiResponseText = isAr
          ? "أهلاً بك في WebTaky! أنا هنا لمساعدتك في الاستفسارات عن خدمات الزجاج والألمنيوم والمطابخ وطلب عروض الأسعار. كيف يمكنني مساعدتك؟ 😊"
          : "Welcome to WebTaky! I am here to help you with glass, aluminum, kitchen inquiries and quote requests. How can I assist you? 😊";
      }
    }

    // Stream the output word by word for fluid UI animation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiResponseText.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 30));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
