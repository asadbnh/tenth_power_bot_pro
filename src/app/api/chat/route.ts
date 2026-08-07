import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFallbackCompany } from "@/lib/fallback-provider";

/**
 * POST /api/chat
 * High-performance AI Chat endpoint supporting Google Gemini 3.5 Interactions API (v1beta/interactions)
 * with session continuity (previous_interaction_id), system instructions, and graceful fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, locale, previous_interaction_id, interaction_id } = await request.json();
    const isAr = locale === "ar";
    const lastUserMessage = messages?.[messages.length - 1]?.content ?? "";
    const previousId = previous_interaction_id || interaction_id;
    const company = getFallbackCompany();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

    let aiResponseText = "";
    let nextInteractionId: string | null = null;

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
      // fallback if DB query fails
    }

    if (!systemPrompt) {
      systemPrompt = isAr
        ? `أنت المساعد الذكي المعماري لـ ${company.name_ar}. أجب باحترافية عن الزجاج السيكوريت، الواجهات الزجاجية، قطاعات الألمنيوم، والمقاولات، وانصح العميل بطلب عرض سعر مجاني.`
        : `You are the architectural AI Assistant for ${company.name_en}. Answer professionally about securit glass, facades, aluminum, and contracting, and suggest requesting a free quote.`;
    }

    // 2. Strategy A: Try Google Gemini Interactions API (v1beta/interactions)
    if (apiKey && apiKey !== "your_gemini_api_key") {
      try {
        const interactionPayload: Record<string, unknown> = {
          model,
          input: lastUserMessage,
          system_instruction: systemPrompt,
        };

        if (previousId) {
          interactionPayload.previous_interaction_id = previousId;
        }

        const interactionsRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/interactions",
          {
            method: "POST",
            headers: {
              "x-goog-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(interactionPayload),
          }
        );

        if (interactionsRes.ok) {
          const data = await interactionsRes.json();
          // Extract response text and interaction_id
          const textCandidate =
            data.outputs?.[0]?.text ||
            data.text ||
            data.content ||
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textCandidate) {
            aiResponseText = textCandidate;
            nextInteractionId = data.interaction_id || data.id || previousId || null;
          }
        } else {
          console.warn("Gemini Interactions API status:", interactionsRes.status);
        }
      } catch (interactionsErr) {
        console.error("Gemini Interactions API error:", interactionsErr);
      }

      // 3. Strategy B: Fallback to generateContent API if Interactions API fails
      if (!aiResponseText) {
        try {
          const contentsHistory = (messages || []).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const fallbackRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
                contents: contentsHistory.length > 0 ? contentsHistory : [
                  {
                    role: "user",
                    parts: [{ text: lastUserMessage }],
                  },
                ],
                generationConfig: {
                  maxOutputTokens: 400,
                  temperature: 0.7,
                },
              }),
            }
          );

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              aiResponseText = candidateText;
            }
          }
        } catch (genErr) {
          console.error("Gemini generateContent error:", genErr);
        }
      }
    }

    // 4. Strategy C: Local Smart Business Fallback if offline or quota exceeded
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

    // Stream output word by word for fluid UI animation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiResponseText.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 25));
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

    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
