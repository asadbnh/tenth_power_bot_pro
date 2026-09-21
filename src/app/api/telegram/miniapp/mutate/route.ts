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

        const slug = payload.slug || `service-${Date.now()}`;
        const nameAr = payload.name_ar;

        const newService: Record<string, any> = {
          company_id: companyId,
          category_id: payload.category_id || null,
          name_ar: nameAr,
          name_en: payload.name_en || nameAr,
          slug,
          short_description_ar: payload.short_description_ar || null,
          short_description_en: payload.short_description_en || payload.short_description_ar || null,
          full_description_ar: payload.full_description_ar || null,
          full_description_en: payload.full_description_en || null,
          price_from: payload.price_from ? Number(payload.price_from) : null,
          price_to: payload.price_to ? Number(payload.price_to) : null,
          price_unit: payload.price_unit || "متر مربع",
          show_price: payload.show_price === true || Boolean(payload.price_from),
          features_ar: Array.isArray(payload.features_ar) ? payload.features_ar : (payload.features_ar ? payload.features_ar.split("\n").map((s: string) => s.trim()).filter(Boolean) : null),
          features_en: Array.isArray(payload.features_en) ? payload.features_en : null,
          seo_keywords_ar: Array.isArray(payload.seo_keywords_ar) ? payload.seo_keywords_ar : (payload.seo_keywords_ar ? payload.seo_keywords_ar.split(",").map((s: string) => s.trim()).filter(Boolean) : null),
          seo_keywords_en: Array.isArray(payload.seo_keywords_en) ? payload.seo_keywords_en : null,
          cover_image_url: payload.cover_image_url || null,
          icon: payload.icon || "Layers",
          is_active: payload.is_active !== false,
          is_featured: payload.is_featured === true,
        };

        const { data, error } = await db.from("services").insert(newService).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تمت إضافة الخدمة بنجاح.", data });
      }

      case "update_service": {
        const { id, ...fields } = payload;
        if (!id) throw new Error("معرف الخدمة مطلوب");

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
        if (fields.name_ar !== undefined) updateData.name_ar = fields.name_ar;
        if (fields.name_en !== undefined) updateData.name_en = fields.name_en;
        if (fields.slug !== undefined) updateData.slug = fields.slug;
        if (fields.category_id !== undefined) updateData.category_id = fields.category_id || null;
        if (fields.short_description_ar !== undefined) updateData.short_description_ar = fields.short_description_ar;
        if (fields.short_description_en !== undefined) updateData.short_description_en = fields.short_description_en;
        if (fields.full_description_ar !== undefined) updateData.full_description_ar = fields.full_description_ar;
        if (fields.full_description_en !== undefined) updateData.full_description_en = fields.full_description_en;
        if (fields.price_from !== undefined) updateData.price_from = fields.price_from ? Number(fields.price_from) : null;
        if (fields.price_to !== undefined) updateData.price_to = fields.price_to ? Number(fields.price_to) : null;
        if (fields.price_unit !== undefined) updateData.price_unit = fields.price_unit;
        if (fields.show_price !== undefined) updateData.show_price = Boolean(fields.show_price);
        if (fields.cover_image_url !== undefined) updateData.cover_image_url = fields.cover_image_url;
        if (fields.icon !== undefined) updateData.icon = fields.icon;
        if (fields.is_active !== undefined) updateData.is_active = Boolean(fields.is_active);
        if (fields.is_featured !== undefined) updateData.is_featured = Boolean(fields.is_featured);

        if (fields.features_ar !== undefined) {
          updateData.features_ar = Array.isArray(fields.features_ar)
            ? fields.features_ar
            : typeof fields.features_ar === "string"
              ? fields.features_ar.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : null;
        }

        if (fields.seo_keywords_ar !== undefined) {
          updateData.seo_keywords_ar = Array.isArray(fields.seo_keywords_ar)
            ? fields.seo_keywords_ar
            : typeof fields.seo_keywords_ar === "string"
              ? fields.seo_keywords_ar.split(",").map((s: string) => s.trim()).filter(Boolean)
              : null;
        }

        const { data, error } = await db.from("services").update(updateData).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم تحديث بيانات الخدمة بنجاح.", data });
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
        const descAr = payload.description_ar || null;

        const newProject = {
          company_id: companyId,
          service_id: payload.service_id || null,
          title_ar: titleAr,
          title_en: payload.title_en || titleAr,
          slug,
          client_name: payload.client_name || null,
          city: payload.city || "الرياض",
          location_ar: payload.location_ar || null,
          location_en: payload.location_en || null,
          project_value: payload.project_value ? Number(payload.project_value) : null,
          description_ar: descAr,
          description_en: payload.description_en || null,
          status: payload.status || "completed",
          start_date: payload.start_date || null,
          end_date: payload.end_date || null,
          specifications: payload.specifications || null,
          cover_image_url: payload.cover_image_url || null,
          is_active: payload.is_active !== false,
          is_featured: payload.is_featured === true,
        };

        const { data, error } = await db.from("projects").insert(newProject).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تمت إضافة المشروع بنجاح.", data });
      }

      case "update_project": {
        const { id, ...fields } = payload;
        if (!id) throw new Error("معرف المشروع مطلوب");

        const updateData: Record<string, any> = {};
        if (fields.title_ar !== undefined) updateData.title_ar = fields.title_ar;
        if (fields.title_en !== undefined) updateData.title_en = fields.title_en;
        if (fields.slug !== undefined) updateData.slug = fields.slug;
        if (fields.service_id !== undefined) updateData.service_id = fields.service_id || null;
        if (fields.client_name !== undefined) updateData.client_name = fields.client_name;
        if (fields.city !== undefined) updateData.city = fields.city;
        if (fields.location_ar !== undefined) updateData.location_ar = fields.location_ar;
        if (fields.location_en !== undefined) updateData.location_en = fields.location_en;
        if (fields.project_value !== undefined) updateData.project_value = fields.project_value ? Number(fields.project_value) : null;
        if (fields.status !== undefined) updateData.status = fields.status;
        if (fields.start_date !== undefined) updateData.start_date = fields.start_date || null;
        if (fields.end_date !== undefined) updateData.end_date = fields.end_date || null;
        if (fields.description_ar !== undefined) updateData.description_ar = fields.description_ar;
        if (fields.description_en !== undefined) updateData.description_en = fields.description_en;
        if (fields.specifications !== undefined) updateData.specifications = fields.specifications;
        if (fields.cover_image_url !== undefined) updateData.cover_image_url = fields.cover_image_url;
        if (fields.is_active !== undefined) updateData.is_active = Boolean(fields.is_active);
        if (fields.is_featured !== undefined) updateData.is_featured = Boolean(fields.is_featured);

        const { data, error } = await db.from("projects").update(updateData).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true, message: "تم تحديث بيانات المشروع بنجاح.", data });
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
