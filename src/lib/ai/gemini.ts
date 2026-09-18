import { getGeminiApiKeys, markKeyExhausted, markKeyHealthy } from "./keys";
import { getCachedSystemPrompt } from "./prompts";

export interface ChatResponse {
  text: string;
  interactionId: string | null;
  model: string;
  keyUsed?: string;
  source: "interactions" | "generateContent" | "smart_fallback";
}

/**
 * Extracts generated text from Google Gemini Interactions API response.
 * Handles Gemini v1beta interactions schema (steps -> model_output -> content -> text),
 * as well as outputs, candidates, and raw text fallbacks.
 */
function extractInteractionsText(data: any): string {
  if (!data) return "";

  // 1. Primary: steps -> model_output
  if (Array.isArray(data.steps)) {
    let combined = "";
    for (const step of data.steps) {
      if (step.type === "model_output" && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.text) combined += item.text;
        }
      }
    }
    if (combined.trim()) return combined.trim();
  }

  // 2. Secondary: outputs array
  if (Array.isArray(data.outputs) && data.outputs[0]?.text) {
    return data.outputs[0].text.trim();
  }

  // 3. Candidate parts
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }

  // 4. Direct text or content
  if (typeof data.text === "string" && data.text.trim()) {
    return data.text.trim();
  }

  if (typeof data.content === "string" && data.content.trim()) {
    return data.content.trim();
  }

  return "";
}

/**
 * Executes a stateful, multi-turn AI chat with Google Gemini.
 * Uses `previous_interaction_id` to maintain conversation state on the server.
 * Automatically fails over to the next available API key if quota is exhausted (429) or on errors.
 */
export async function chatWithGemini({
  input,
  messages = [],
  previousInteractionId = null,
  locale = "ar",
  systemPromptOverride,
}: {
  input: string;
  messages?: { role: string; content: string }[];
  previousInteractionId?: string | null;
  locale?: string;
  systemPromptOverride?: string;
}): Promise<ChatResponse | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    console.warn("[Gemini AI] No valid Gemini API keys found in environment.");
    return null;
  }

  const promptConfig = await getCachedSystemPrompt(locale);
  const systemInstruction = systemPromptOverride || promptConfig.prompt;
  const model = process.env.GEMINI_MODEL || promptConfig.model || "gemini-3.1-flash-lite";

  // Try each API key in order (Failover / Key Rotation)
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const keyPreview = `...${apiKey.slice(-6)}`;

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 1: Stateful Interactions API (v1beta/interactions)
    // ─────────────────────────────────────────────────────────────
    try {
      const interactionPayload: Record<string, unknown> = {
        model,
        input,
      };

      if (previousInteractionId) {
        // Multi-turn continuation
        interactionPayload.previous_interaction_id = previousInteractionId;
      } else {
        // First turn: set system instruction
        interactionPayload.system_instruction = systemInstruction;
      }

      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interactionPayload),
      });

      // Handle Quota Exceeded (429) or Auth error (403) -> Failover to next key
      if (res.status === 429 || res.status === 403) {
        markKeyExhausted(apiKey, `HTTP_${res.status}_Interactions`);
        console.warn(`[Gemini AI] Key ${keyPreview} returned ${res.status}. Rotating to next key...`);
        continue;
      }

      if (res.ok) {
        const data = await res.json();
        const text = extractInteractionsText(data);
        const newInteractionId = data.id || data.interaction_id || previousInteractionId;

        if (text) {
          markKeyHealthy(apiKey);
          return {
            text,
            interactionId: newInteractionId,
            model,
            keyUsed: keyPreview,
            source: "interactions",
          };
        }
      } else {
        const errBody = await res.text();
        console.warn(`[Gemini AI] Interactions API HTTP ${res.status} with key ${keyPreview}:`, errBody.slice(0, 300));
      }
    } catch (interactionsErr) {
      console.warn(`[Gemini AI] Interactions fetch error with key ${keyPreview}:`, interactionsErr);
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 2: Fallback to generateContent API with same key
    // ─────────────────────────────────────────────────────────────
    try {
      const contentsHistory = (messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Ensure last user message is present
      if (
        contentsHistory.length === 0 ||
        contentsHistory[contentsHistory.length - 1]?.parts?.[0]?.text !== input
      ) {
        contentsHistory.push({
          role: "user",
          parts: [{ text: input }],
        });
      }

      const genRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: contentsHistory,
            generationConfig: {
              maxOutputTokens: promptConfig.maxTokens || 1000,
              temperature: promptConfig.temperature || 0.7,
            },
          }),
        }
      );

      if (genRes.status === 429 || genRes.status === 403) {
        markKeyExhausted(apiKey, `HTTP_${genRes.status}_GenerateContent`);
        console.warn(`[Gemini AI] Key ${keyPreview} returned ${genRes.status} in generateContent. Rotating to next key...`);
        continue;
      }

      if (genRes.ok) {
        const genData = await genRes.json();
        const text = genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (text) {
          markKeyHealthy(apiKey);
          return {
            text,
            interactionId: previousInteractionId || `gen-${Date.now()}`,
            model,
            keyUsed: keyPreview,
            source: "generateContent",
          };
        }
      }
    } catch (genErr) {
      console.warn(`[Gemini AI] generateContent error with key ${keyPreview}:`, genErr);
    }
  }

  // All keys exhausted or offline
  return null;
}

/**
 * Generates SEO-optimized articles with multi-key failover.
 */
export async function generateArticleWithGemini(
  topic: string,
  locale = "ar"
): Promise<{
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
  faq: { question: string; answer: string }[];
} | null> {
  const keys = getGeminiApiKeys();
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const isAr = locale === "ar";

  const prompt = isAr
    ? `أنت خبير كاتب مقالات SEO محترف لشركة مقاولات وزجاج ألمنيوم متخصصة (مؤسسة القوة العاشرة للزجاج والألمنيوم).
اكتب مقالاً هندسياً مفصلاً وشاملاً ومحسناً لمحركات البحث Google عن الموضوع التالي: "${topic}".

يجب أن تعيد الناتج فقط كـ JSON صالح ومباشر دون أي علامات markdown أو كود إضافي:
{
  "title": "عنوان المقال المحسن لـ SEO مع الكلمة المفتاحية الرئيسية",
  "excerpt": "ملخص مشوق ومختصر للمقال بين 150 إلى 200 حرف",
  "content": "محتوى المقال الكامل مقسم إلى فقرات وعناوين رئيسية وفرعية بتنسيق HTML نقي (<h3>, <p>, <ul>, <li>)",
  "keywords": ["كلمة 1", "كلمة 2", "كلمة 3", "كلمة 4"],
  "faq": [
    {"question": "سؤال شائع 1؟", "answer": "إجابة شاملة 1"},
    {"question": "سؤال شائع 2؟", "answer": "إجابة شاملة 2"}
  ]
}`
    : `You are an expert SEO article writer for an architectural glass and aluminum contracting firm (Tenth Power).
Write a comprehensive, professional, SEO-optimized article for Google about: "${topic}".

Return ONLY valid JSON without markdown wrapping:
{
  "title": "SEO-optimized Title",
  "excerpt": "Compelling excerpt between 150-200 chars",
  "content": "Full article divided into headings and paragraphs in clean HTML (<h3>, <p>, <ul>, <li>)",
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "faq": [
    {"question": "FAQ Question 1?", "answer": "Detailed answer 1"},
    {"question": "FAQ Question 2?", "answer": "Detailed answer 2"}
  ]
}`;


  for (const apiKey of keys) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 2500,
              temperature: 0.7,
            },
          }),
        }
      );

      if (res.status === 429 || res.status === 403) {
        markKeyExhausted(apiKey, `Article_HTTP_${res.status}`);
        continue;
      }

      if (res.ok) {
        const raw = await res.json();
        const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          markKeyHealthy(apiKey);
          return JSON.parse(text);
        }
      }
    } catch (err) {
      console.warn("[Gemini AI] Article generation error with key, rotating:", err);
    }
  }

  return null;
}
