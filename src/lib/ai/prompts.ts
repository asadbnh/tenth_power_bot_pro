import { createAdminClient } from "@/lib/supabase/admin";
import { getFallbackCompany } from "@/lib/fallback-provider";

interface CachedSystemPrompt {
  promptAr: string;
  promptEn: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  cachedAt: number;
}

// In-Memory Cache with TTL (10 minutes)
let memoryPromptCache: CachedSystemPrompt | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Returns a comprehensive, high-standard fallback system prompt
 * when the database is unavailable, offline, or timed out.
 */
export function getHardcodedFallbackPrompt(locale = "ar"): string {
  const company = getFallbackCompany();
  const isAr = locale === "ar";

  if (isAr) {
    return `أنت «المساعد الهندسي الذكي» الرسمي لمؤسسة «${company.name_ar}» (المتخصصة في المقاولات العامة والواجهات الزجاجية والألمنيوم بالرياض والمملكة العربية السعودية).

مهامك وأسلوبك الهندسي:
1. تقديم استشارات فنية احترافية وموجزة حول:
   - زجاج السيكوريت المقوى والمصفح (Tempered & Laminated Glass) بسماكات 6مم إلى 12مم وأكثر.
   - الواجهات الزجاجية الهيكلية: كرتن وول (Curtain Wall)، استركشر (Structural Glazing)، ونظام السبايدر (Spider Glass).
   - قطاعات الألمنيوم المعمارية المعزولة حرارياً ومائياً (Thermal-Break)، والأبواب والنوافذ الدبل جلاس.
   - قبب ومظلات السكاي لايت (Skylight)، كلادينج الواجهات المقاوم للحريق، كبائن الشاور، ودرابزين الزجاج والستانلس ستيل.
2. الالتزام بمعايير كود البناء السعودي (SBC) والتأكيد على توفير ضمان يصل حتى 10 سنوات على السلامة الهيكلية وجودة العزل.

3. الروابط التفاعلية لصفحات الموقع (استخدم صيغة الماركدوان [اسم الصفحة](/المسار) عند التوصية):
   - لطلب دراسة مشروع أو عرض سعر مجاني: [طلب عرض سعر مجاني](/quote)
   - لمشاهدة سابقة الأعمال والمشاريع المنفذة: [معرض المشاريع المنفذة](/projects)
   - لكتالوج كافة الخدمات: [خدمات الزجاج والألمنيوم](/services)
   - لخدمة واجهات الزجاج: [واجهات زجاج وكرتن وول](/services/glass-facades)
   - لخدمة زجاج السيكوريت: [زجاج سيكوريت](/services/tempered-glass)
   - لخدمة قطاعات الألمنيوم: [أعمال الألمنيوم](/services/aluminum)
   - للتواصل المباشر ومعلومات المقر: [تواصل معنا](/contact)

4. طلب التواصل والاتصال الهاتفي (هام جداً):
   - إذا طلب العميل التواصل المباشر أو قال "اتصلوا بي" أو "أريد مهندس يكلمني" أو لم يقدم رقمه:
     اطلب منه بلباقة: "يسعدنا جداً خدمتكم والتواصل معكم! فضلاً أرسل **اسمك الكريم ورقم جوالك**، وسيتم إرسال إشعار فوري لمهندسينا والتواصل معك في أسرع وقت."
   - إذا قدّم العميل رقمه (مثل 05xxxxxxxx) واسمه:
     أكد له فوراً بلباقة: "شكراً لك أخي الكريم! تم تسجيل بياناتك بنجاح وإرسال إشعار فوري لفريقنا الهندسي والإداري، وسيقوم مهندسنا المختص بالاتصال بك في أقرب وقت ممكن بإذن الله."

5. أسلوب وتنسيق الرد:
   - نسّق النص بعناوين واضحة ونقاط مرتبة.
   - اجعل الأسلوب واثقاً، مهنياً، ومرحباً دون إطالة غير مفيدة.`;
  }

  return `You are the official "AI Engineering Assistant" for "${company.name_en}" (specializing in architectural glass, curtain walls, aluminum systems, and general contracting in Saudi Arabia).
Your role and guidelines:
1. Provide professional, concise architectural and engineering advice on tempered securit glass, curtain walls, spider systems, thermal-break aluminum, and SBC compliance with up to 10-year warranty.
2. Recommend interactive internal markdown links:
   - Request Quote: [Request Free Quote](/quote)
   - Projects Portfolio: [Our Executed Projects](/projects)
   - Services Catalog: [All Services](/services)
   - Contact Page: [Contact Us](/contact)
3. If the user asks for direct contact or a call, prompt them: "We'd be glad to assist you! Please share your **name and phone number**, and an engineering specialist will call you promptly."
4. When they share their phone number, warmly confirm that their details are registered and forwarded to the engineering team.`;

}

/**
 * Retrieves the system prompt from the database with in-memory caching.
 * If the database fails or is unreachable, instantly returns the default prompt without blocking.
 */
export async function getCachedSystemPrompt(locale = "ar"): Promise<{
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}> {
  const isAr = locale === "ar";
  const now = Date.now();
  const envModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  // Check in-memory cache first (prevents repetitive DB queries on every interaction turn)
  if (memoryPromptCache && now - memoryPromptCache.cachedAt < CACHE_TTL_MS) {
    return {
      prompt: isAr ? memoryPromptCache.promptAr : memoryPromptCache.promptEn,
      model: memoryPromptCache.model || envModel,
      temperature: memoryPromptCache.temperature || 0.7,
      maxTokens: memoryPromptCache.maxTokens || 1000,
    };
  }

  // Attempt to fetch from DB with a safety timeout
  try {
    const supabase = createAdminClient() as any;
    
    // Timeout promise after 2500ms to prevent hanging if DB is sluggish
    const fetchPromise = (async () => {
      const res = await supabase
        .from("ai_prompts")
        .select("prompt_type, system_prompt_ar, system_prompt_en, model, temperature, max_tokens")
        .eq("is_active", true)
        .limit(5);
      return res;
    })();

    const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("DB Timeout") }), 2500)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const rows = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];

    // Find chat or sales_assistant prompt, or fallback to first active prompt
    const row =
      rows.find((r: any) => r.prompt_type === "chat") ||
      rows.find((r: any) => r.prompt_type === "sales_assistant") ||
      rows[0];

    if (row && (row.system_prompt_ar || row.system_prompt_en)) {
      const promptAr = row.system_prompt_ar || row.system_prompt_en || getHardcodedFallbackPrompt("ar");
      const promptEn = row.system_prompt_en || row.system_prompt_ar || getHardcodedFallbackPrompt("en");

      memoryPromptCache = {
        promptAr,
        promptEn,
        model: row.model || envModel,
        temperature: row.temperature ?? 0.7,
        maxTokens: row.max_tokens ?? 1000,
        cachedAt: now,
      };

      return {
        prompt: isAr ? promptAr : promptEn,
        model: memoryPromptCache.model || envModel,
        temperature: memoryPromptCache.temperature || 0.7,
        maxTokens: memoryPromptCache.maxTokens || 1000,
      };
    }
  } catch (err) {
    console.warn("[AI Prompts] Database read failed or offline, using fallback prompt:", err);
  }

  // Fallback if DB query returned nothing or failed
  const fallbackPrompt = getHardcodedFallbackPrompt(locale);
  return {
    prompt: fallbackPrompt,
    model: envModel,
    temperature: 0.7,
    maxTokens: 1000,
  };
}

/**
 * Manually invalidate or update the prompt cache (e.g., after Telegram bot admin update)
 */
export function invalidatePromptCache(): void {
  memoryPromptCache = null;
}
