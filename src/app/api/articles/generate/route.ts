import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError, logInfo } from "@/lib/logger";
import { generateArticleWithGemini } from "@/lib/ai";

/**
 * POST /api/articles/generate
 * Generates structured SEO-optimized articles using Google Gemini API with multi-key failover
 * and saves them to Supabase with status = 'review' for Telegram Admin approval.
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, locale = "ar" } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const isAr = locale === "ar";

    // 1. Generate structured article with multi-key failover
    let generatedJson = await generateArticleWithGemini(topic, locale);

    // Fallback template if all keys fail or offline
    if (!generatedJson) {
      generatedJson = {
        title: isAr ? `دليل شامل عن ${topic} — القوة العاشرة` : `Comprehensive Guide to ${topic}`,
        excerpt: isAr
          ? `تعرف على أهم النصائح والمواصفات الفنية المتعلقة بـ ${topic} وكيفية اختيار الخامات الأنسب لمشروعك مع الضمان.`
          : `Learn top tips and specifications for ${topic} and how to select materials with comprehensive warranty.`,
        content: `
          <h3>مقدمة عن ${topic}</h3>
          <p>تعتبر أعمال الزجاج والألمنيوم من أهم العناصر في تصميم المباني الحديثة والواجهات المعمارية. نقدم في القوة العاشرة أعلى معايير الجودة والتركيب.</p>
          <h3>المميزات والمواصفات الفنية</h3>
          <ul>
            <li>زجاج سكريت مقوى مقاوم للصدمات والحرارة.</li>
            <li>قطاعات ألمنيوم عالية الجودة وعزل تام للصوت والمياه.</li>
            <li>ضمان شامل لمدة 10 سنوات على جميع الأعمال.</li>
          </ul>
          <h3>لماذا تختار القوة العاشرة؟</h3>
          <p>نملك فريق مهندسين وفنيين متخصصين على أعلى مستوى لتنفيذ أضخم المشاريع السكنية والتجارية في المملكة.</p>
        `,
        keywords: [topic, "زجاج سكريت", "واجهات زجاج", "ألمنيوم", "مقاولات"],
        faq: [
          { question: `ما هي تكلفة ${topic}؟`, answer: "تختلف التكلفة حسب المساحة والسماكات المطلوبة ونوع القطاعات." },
          { question: "هل يوجد ضمان على التركيب؟", answer: "نعم، نقدم ضماناً شاملاً يمتد لـ 10 سنوات على جميع الأعمال والقطاعات." },
        ],
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { data: company } = await supabase.from("companies").select("id").limit(1).single();
    const companyId = company?.id || "00000000-0000-0000-0000-000000000001";

    const slug = topic
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now().toString().slice(-4);

    // Save Article with status = 'review'
    const { data: article, error: artErr } = await supabase
      .from("articles")
      .insert({
        company_id: companyId,
        title_ar: generatedJson.title,
        title_en: generatedJson.title,
        slug,
        excerpt_ar: generatedJson.excerpt,
        excerpt_en: generatedJson.excerpt,
        content_ar: generatedJson.content,
        content_en: generatedJson.content,
        status: "review",
        read_time_minutes: Math.ceil(generatedJson.content.length / 500),
      })
      .select("id, slug, title_ar")
      .single();

    if (artErr) {
      logError("Failed to save generated article:", artErr);
      return NextResponse.json({ error: "Failed to save article" }, { status: 500 });
    }

    // Insert FAQs linked to company
    for (const f of generatedJson.faq) {
      await supabase.from("faqs").insert({
        company_id: companyId,
        question_ar: f.question,
        answer_ar: f.answer,
        page_context: `article:${article.id}`,
      });
    }

    logInfo("AI Article Generated and saved for review", { articleId: article.id, slug: article.slug });

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title_ar,
        status: "review",
      },
    });
  } catch (error) {
    logError("Article Generation Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
