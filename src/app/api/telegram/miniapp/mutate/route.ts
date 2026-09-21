import { type NextRequest, NextResponse } from "next/server";
import { createDbClient } from "@/lib/db";
import { verifyTelegramInitData } from "@/lib/telegram/miniapp/auth/verify-init-data";
import { isAuthorizedAdmin } from "@/lib/telegram/core/auth";
import { getCurrentAdminSession } from "@/lib/telegram/miniapp/auth/session";

export const dynamic = "force-dynamic";

/**
 * Unified Mutation API for Telegram Mini App
 * Securely executes CRUD operations with fallback between Telegram initData and signed cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const initDataRaw = request.headers.get("X-Telegram-Init-Data") || "";
    let isAuthorized = false;
    let actorId = "admin";

    // 1. Authenticate via Telegram InitData
    if (initDataRaw) {
      const verification = verifyTelegramInitData(initDataRaw);
      if (verification.valid && verification.user) {
        const hasAccess = await isAuthorizedAdmin(verification.user.id);
        if (hasAccess) {
          isAuthorized = true;
          actorId = `${verification.user.first_name} (${verification.user.id})`;
        }
      }
    }

    // 2. Fallback to session cookie
    if (!isAuthorized) {
      const session = await getCurrentAdminSession();
      if (session) {
        isAuthorized = true;
        actorId = `${session.name} (${session.telegramUserId})`;
      }
    }

    // If still not authorized, check in non-prod or verify admin presence
    if (!isAuthorized) {
      // If neither is present, reject
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتنفيذ هذه العملية. يرجى فتح اللوحة من تيليجرام." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, payload } = body;
    console.log(`[MiniApp Mutation] Action: ${action} triggered by ${actorId}`);
    const db = createDbClient();

    switch (action) {
      // ─── 1. Quotes & CRM ──────────────────────────────────────
      case "update_quote_status": {
        const { id, status } = payload;
        const { error } = await db.from("quote_requests").update({ status }).eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: `تم تحديث حالة الطلب إلى: ${status}` });
      }

      case "delete_quote": {
        const { id } = payload;
        const { error } = await db.from("quote_requests").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم حذف طلب عرض السعر بنجاح." });
      }

      // ─── 2. Services ──────────────────────────────────────────
      case "toggle_service": {
        const { id, field, value } = payload;
        if (field !== "is_active" && field !== "is_featured") {
          return NextResponse.json({ success: false, error: "حقل غير صالح للتعديل" }, { status: 400 });
        }
        const { error } = await db.from("services").update({ [field]: value }).eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم تحديث حالة الخدمة." });
      }

      case "create_service": {
        const { data: company } = await db.from("companies").select("id").limit(1).single();
        const companyId = company?.id;
        if (!companyId) throw new Error("تعذر تحديد معرّف المنشأة");

        let categoryId = payload.category_id || null;
        if (!categoryId) {
          const { data: categories } = await db.from("categories").select("id").limit(1);
          if (categories && categories.length > 0) categoryId = categories[0].id;
        }

        const slug = payload.slug || `service-${Date.now()}`;
        const nameAr = payload.name_ar;
        const descAr = payload.short_description_ar || payload.full_description_ar || nameAr;
        const price = payload.price_from ? Number(payload.price_from) : null;
        const keywords = [nameAr, `تركيب ${nameAr}`, `سعر ${nameAr}`, "القوة العاشرة", "الرياض"];
        const features = ["أعلى معايير الجودة والسلامة", "تنفيذ متقن ومطابق للمواصفات", "ضمان شامل وتوريد سريع"];

        const newService = {
          company_id: companyId,
          category_id: categoryId,
          name_ar: nameAr,
          name_en: payload.name_en || nameAr,
          slug,
          short_description_ar: descAr,
          short_description_en: payload.short_description_en || descAr,
          full_description_ar: payload.full_description_ar || descAr,
          full_description_en: payload.full_description_en || descAr,
          price_from: price,
          price_to: payload.price_to ? Number(payload.price_to) : (price ? price * 1.5 : null),
          price_unit: payload.price_unit || "متر مربع",
          show_price: Boolean(price),
          features_ar: features,
          features_en: ["Premium Quality & Safety", "Precision Engineering", "Comprehensive Warranty"],
          seo_keywords_ar: keywords,
          seo_keywords_en: [nameAr, "glass installation", "riyadh"],
          cover_image_url: payload.cover_image_url || "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/services/luxury-facade.webp",
          icon: "Layers",
          is_active: payload.is_active !== false,
          is_featured: payload.is_featured === true,
        };

        const { data, error } = await db.from("services").insert(newService).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تمت إضافة الخدمة بنجاح.", data });
      }

      case "delete_service": {
        const { id } = payload;
        const { error } = await db.from("services").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم حذف الخدمة بنجاح." });
      }

      // ─── 3. Projects ──────────────────────────────────────────
      case "toggle_project": {
        const { id, field, value } = payload;
        if (field !== "is_active" && field !== "is_featured") {
          return NextResponse.json({ success: false, error: "حقل غير صالح للتعديل" }, { status: 400 });
        }
        const { error } = await db.from("projects").update({ [field]: value }).eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم تحديث حالة المشروع." });
      }

      case "create_project": {
        const { data: company } = await db.from("companies").select("id").limit(1).single();
        const companyId = company?.id;
        if (!companyId) throw new Error("تعذر تحديد معرّف المنشأة");

        const slug = payload.slug || `project-${Date.now()}`;
        const titleAr = payload.title_ar;
        const descAr = payload.description_ar || titleAr;

        const newProject = {
          company_id: companyId,
          title_ar: titleAr,
          title_en: payload.title_en || titleAr,
          slug,
          client_name: payload.client_name || "عميل موثق بالرياض",
          city: payload.city || "الرياض",
          project_value: payload.project_value ? Number(payload.project_value) : null,
          description_ar: descAr,
          description_en: payload.description_en || descAr,
          cover_image_url: payload.cover_image_url || "https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/projects/tower-facade.webp",
          is_active: payload.is_active !== false,
          is_featured: payload.is_featured === true,
        };

        const { data, error } = await db.from("projects").insert(newProject).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تمت إضافة المشروع بنجاح.", data });
      }

      case "delete_project": {
        const { id } = payload;
        const { error } = await db.from("projects").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم حذف المشروع بنجاح." });
      }

      // ─── 4. Reviews ───────────────────────────────────────────
      case "approve_review": {
        const { id, type } = payload;
        const table = type === "customer_review" ? "customer_reviews" : "testimonials";
        const { error } = await db.from(table).update({ is_approved: true }).eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم اعتماد ونشر التقييم بنجاح." });
      }

      case "delete_review": {
        const { id, type } = payload;
        const table = type === "customer_review" ? "customer_reviews" : "testimonials";
        const { error } = await db.from(table).delete().eq("id", id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم حذف التقييم بنجاح." });
      }

      case "create_testimonial": {
        const { data: company } = await db.from("companies").select("id").limit(1).single();
        const newTestimonial = {
          company_id: company?.id,
          client_name: payload.client_name,
          client_title: payload.client_title || "عميل موثق",
          content_ar: payload.content_ar,
          rating: Number(payload.rating) || 5,
          is_approved: true,
          is_featured: payload.is_featured === true,
        };
        const { error } = await db.from("testimonials").insert(newTestimonial);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تمت إضافة التقييم بنجاح." });
      }

      // ─── 5. Settings & Company ────────────────────────────────
      case "toggle_maintenance": {
        const { value, message } = payload;
        const { data: company } = await db.from("companies").select("id").limit(1).single();
        if (!company) throw new Error("سجل الشركة غير موجود");

        const updateData: Record<string, any> = { maintenance_mode: Boolean(value) };
        if (message) updateData.maintenance_message = message;

        const { error } = await db.from("companies").update(updateData).eq("id", company.id);
        if (error) throw new Error(error.message);

        const statusMsg = value ? "تم تفعيل وضع الصيانة للموقع 🔴" : "تم إيقاف وضع الصيانة والموقع يعمل بشكل طبيعي 🟢";
        return NextResponse.json({ success: true, message: statusMsg });
      }

      case "update_company_profile": {
        const { data: company } = await db.from("companies").select("id").limit(1).single();
        if (!company) throw new Error("سجل الشركة غير موجود");

        const updatePayload: Record<string, any> = {};
        if (payload.name_ar !== undefined) updatePayload.name_ar = payload.name_ar;
        if (payload.phone_primary !== undefined) updatePayload.phone_primary = payload.phone_primary;
        if (payload.whatsapp_number !== undefined) updatePayload.whatsapp_number = payload.whatsapp_number;
        if (payload.email !== undefined) updatePayload.email = payload.email;
        if (payload.tax_number !== undefined) updatePayload.tax_number = payload.tax_number;
        if (payload.commercial_register !== undefined) updatePayload.commercial_register = payload.commercial_register;

        const { error } = await db.from("companies").update(updatePayload).eq("id", company.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم تحديث بيانات المنشأة بنجاح." });
      }

      default:
        return NextResponse.json({ success: false, error: `إجراء غير معروف: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Mutation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "فشلت العملية" },
      { status: 500 }
    );
  }
}
