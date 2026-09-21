import { type NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/telegram/miniapp/services/dashboard.service";
import { getQuoteRequests } from "@/lib/telegram/miniapp/services/crm.service";
import { getAdminServices } from "@/lib/telegram/miniapp/services/services.service";
import { getAdminProjects } from "@/lib/telegram/miniapp/services/projects.service";
import { getAdminTestimonials } from "@/lib/telegram/miniapp/services/reviews.service";
import { getCompanyProfile } from "@/lib/telegram/miniapp/services/settings.service";
import { verifyTelegramInitData } from "@/lib/telegram/miniapp/auth/verify-init-data";
import { isAuthorizedAdmin } from "@/lib/telegram/core/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const initDataRaw = request.headers.get("X-Telegram-Init-Data") || "";
    let isAuthorized = false;
    let userInfo: any = null;

    if (initDataRaw) {
      const verification = verifyTelegramInitData(initDataRaw);
      if (verification.valid && verification.user) {
        userInfo = verification.user;
        isAuthorized = await isAuthorizedAdmin(verification.user.id);
      }
    }

    // Load initial data in parallel
    const [metrics, quotes, services, projects, reviews, settings] = await Promise.all([
      getDashboardMetrics().catch(() => null),
      getQuoteRequests().catch(() => []),
      getAdminServices().catch(() => []),
      getAdminProjects().catch(() => []),
      getAdminTestimonials().catch(() => []),
      getCompanyProfile().catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      isAuthorized,
      user: userInfo,
      data: {
        metrics,
        quotes: quotes || [],
        services: services || [],
        projects: projects || [],
        reviews: reviews || [],
        settings: settings || {},
      },
    });
  } catch (error: any) {
    console.error("Mini App Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
