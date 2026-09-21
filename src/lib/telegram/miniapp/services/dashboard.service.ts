/**
 * WebTaky Mini App Dashboard Service
 * Aggregates live platform metrics and KPIs across all key database tables.
 */

import { createDbClient } from "@/lib/db";
import type { DashboardStats } from "../types";

export async function getDashboardMetrics(): Promise<DashboardStats> {
  const db = createDbClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [
      { count: totalQuotes },
      { count: newQuotes },
      { count: totalAppointments },
      { count: pendingAppointments },
      { count: totalMessages },
      { count: unreadMessages },
      { count: totalUsers },
      { count: totalServices },
      { count: totalProjects },
      { count: totalArticles },
      { count: totalReviews },
      { count: pendingReviews },
      { count: totalMedia },
      { count: totalViews },
      { count: todayViews },
      { data: company },
    ] = await Promise.all([
      db.from("quote_requests").select("*", { count: "exact", head: true }),
      db.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
      db.from("appointments").select("*", { count: "exact", head: true }),
      db.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("messages").select("*", { count: "exact", head: true }),
      db.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      db.from("users").select("*", { count: "exact", head: true }),
      db.from("services").select("*", { count: "exact", head: true }),
      db.from("projects").select("*", { count: "exact", head: true }),
      db.from("articles").select("*", { count: "exact", head: true }),
      db.from("testimonials").select("*", { count: "exact", head: true }),
      db.from("testimonials").select("*", { count: "exact", head: true }).eq("is_approved", false),
      db.from("media_library").select("*", { count: "exact", head: true }),
      db.from("analytics_events").select("*", { count: "exact", head: true }),
      db.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      db.from("companies").select("maintenance_mode").limit(1).single(),
    ]);

    return {
      totalQuoteRequests: totalQuotes ?? 0,
      newQuoteRequests: newQuotes ?? 0,
      totalAppointments: totalAppointments ?? 0,
      pendingAppointments: pendingAppointments ?? 0,
      totalMessages: totalMessages ?? 0,
      unreadMessages: unreadMessages ?? 0,
      totalUsers: totalUsers ?? 0,
      totalServices: totalServices ?? 0,
      totalProjects: totalProjects ?? 0,
      totalArticles: totalArticles ?? 0,
      totalReviews: totalReviews ?? 0,
      pendingReviews: pendingReviews ?? 0,
      totalMediaFiles: totalMedia ?? 0,
      totalPageViews: totalViews ?? 0,
      todayPageViews: todayViews ?? 0,
      maintenanceMode: Boolean(company?.maintenance_mode),
    };
  } catch (err) {
    console.error("[Dashboard Metrics Error]:", err);
    return {
      totalQuoteRequests: 0,
      newQuoteRequests: 0,
      totalAppointments: 0,
      pendingAppointments: 0,
      totalMessages: 0,
      unreadMessages: 0,
      totalUsers: 0,
      totalServices: 0,
      totalProjects: 0,
      totalArticles: 0,
      totalReviews: 0,
      pendingReviews: 0,
      totalMediaFiles: 0,
      totalPageViews: 0,
      todayPageViews: 0,
      maintenanceMode: false,
    };
  }
}
