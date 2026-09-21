"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Briefcase,
  Star,
  Settings,
  Phone,
  RefreshCw,
  User,
  Eye,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

type TabKey = "dashboard" | "quotes" | "services" | "projects" | "reviews" | "settings";

export default function AdminMiniAppPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>("");
  const [data, setData] = useState<{
    metrics: any;
    quotes: any[];
    services: any[];
    projects: any[];
    reviews: any[];
    settings: any;
  }>({
    metrics: null,
    quotes: [],
    services: [],
    projects: [],
    reviews: [],
    settings: {},
  });

  // 1. Initialize Telegram WebApp SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation?.();

        const user = tg.initDataUnsafe?.user;
        if (user) {
          setTgUser(user);
        }
        if (tg.initData) {
          setInitData(tg.initData);
        }
      }
    }
  }, []);

  // 2. Fetch dashboard data
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const headers: Record<string, string> = {};
      if (initData) headers["X-Telegram-Init-Data"] = initData;

      const res = await fetch("/api/telegram/miniapp/dashboard", { headers });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        if (result.user) setTgUser(result.user);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [initData]);

  // Haptic feedback helper
  const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
    if (typeof window !== "undefined") {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    triggerHaptic("light");
    setActiveTab(tab);
  };

  const metrics = data.metrics || {
    totalQuoteRequests: 0,
    newQuoteRequests: 0,
    totalAppointments: 0,
    totalMessages: 0,
    totalServices: 0,
    totalProjects: 0,
    totalReviews: 0,
    totalPageViews: 0,
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20">
      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20 text-sm">
            10
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">القوة العاشرة</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متصل بالخادم (Live)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic("medium");
              fetchData(true);
            }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors active:scale-95"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {tgUser && (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-full py-1 px-2.5 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium max-w-[90px] truncate">{tgUser.first_name}</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
            <p className="text-sm font-medium">جاري تحميل لوحة التحكم...</p>
          </div>
        ) : (
          <>
            {/* ─── TAB 1: DASHBOARD (الرئيسية) ─── */}
            {activeTab === "dashboard" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Welcome Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900 border border-cyan-500/20 p-4 shadow-xl">
                  <div className="relative z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                      Telegram Mini App Enterprise
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white mb-1">
                      أهلاً بك في لوحة تحكم القوة العاشرة 👋
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      إدارة مباشرة ولحظية للطلبات، عروض الأسعار، كتالوج الخدمات، والمشاريع من داخل تيليجرام.
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleTabChange("quotes")}
                    className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 transition-all p-3.5 rounded-2xl border border-slate-800/80 shadow-md active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                        <FileText className="w-4 h-4" />
                      </span>
                      {metrics.newQuoteRequests > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {metrics.newQuoteRequests} جديد
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalQuoteRequests}</div>
                    <div className="text-xs text-slate-400 font-medium">طلبات عروض الأسعار</div>
                  </div>

                  <div
                    onClick={() => handleTabChange("services")}
                    className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 transition-all p-3.5 rounded-2xl border border-slate-800/80 shadow-md active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <Wrench className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalServices}</div>
                    <div className="text-xs text-slate-400 font-medium">الخدمات والكتالوج</div>
                  </div>

                  <div
                    onClick={() => handleTabChange("projects")}
                    className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 transition-all p-3.5 rounded-2xl border border-slate-800/80 shadow-md active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <Briefcase className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalProjects}</div>
                    <div className="text-xs text-slate-400 font-medium">معرض المشاريع</div>
                  </div>

                  <div
                    onClick={() => handleTabChange("reviews")}
                    className="cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 transition-all p-3.5 rounded-2xl border border-slate-800/80 shadow-md active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <Star className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalReviews}</div>
                    <div className="text-xs text-slate-400 font-medium">تقييمات العملاء</div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Calendar className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalAppointments}</div>
                    <div className="text-xs text-slate-400 font-medium">المواعيد والحجوزات</div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white">{metrics.totalPageViews}</div>
                    <div className="text-xs text-slate-400 font-medium">زيارات الموقع الكلية</div>
                  </div>
                </div>

                {/* Recent Quotes Preview */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      أحدث طلبات عروض الأسعار
                    </h3>
                    <button
                      onClick={() => handleTabChange("quotes")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      عرض الكل
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  {data.quotes.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">لا توجد طلبات جديدة حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.quotes.slice(0, 3).map((q: any) => {
                        const cleanPhone = (q.customer_phone || "").replace(/[^0-9]/g, "");
                        const waPhone = cleanPhone.startsWith("05") ? "966" + cleanPhone.substring(1) : cleanPhone;
                        return (
                          <div
                            key={q.id}
                            className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-white truncate">{q.customer_name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>📍 {q.city || "الرياض"}</span>
                                <span>💰 {q.budget_range || "غير محدد"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                  title="محادثة واتساب"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                                {q.status || "جديد"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 2: QUOTES (طلبات الأسعار) ─── */}
            {activeTab === "quotes" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    طلبات عروض الأسعار ({data.quotes.length})
                  </h2>
                </div>

                {data.quotes.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl p-8 text-center text-slate-400 border border-slate-800/80">
                    <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">لا توجد طلبات عروض أسعار مسجلة.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.quotes.map((q: any) => {
                      const cleanPhone = (q.customer_phone || "").replace(/[^0-9]/g, "");
                      const waPhone = cleanPhone.startsWith("05") ? "966" + cleanPhone.substring(1) : cleanPhone;

                      return (
                        <div
                          key={q.id}
                          className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 shadow-lg space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-sm text-white">{q.customer_name}</h3>
                              <p className="text-xs text-slate-400 dir-ltr text-right">{q.customer_phone}</p>
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {q.status || "جديد"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                            <div>
                              <span className="text-slate-400">📍 المدينة: </span>
                              <span className="text-slate-200 font-medium">{q.city || "الرياض"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">💰 الميزانية: </span>
                              <span className="text-slate-200 font-medium">{q.budget_range || "غير محدد"}</span>
                            </div>
                            {q.urgency && (
                              <div className="col-span-2">
                                <span className="text-slate-400">⚡ الاستعجال: </span>
                                <span className="text-amber-300 font-medium">{q.urgency}</span>
                              </div>
                            )}
                          </div>

                          {q.project_description && (
                            <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 leading-relaxed">
                              {q.project_description}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                فتح واتساب
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: SERVICES (الخدمات) ─── */}
            {activeTab === "services" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-400" />
                    كتالوج الخدمات ({data.services.length})
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {data.services.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white truncate">{s.name_ar}</h3>
                          {s.is_featured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                              ⭐ مميز
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>💰 {s.price_from ? `${s.price_from} - ${s.price_to} ريال` : "سعر حسب المقاس"}</span>
                          <span>👁️ {s.view_count || 0} مشاهدة</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            s.is_active !== false
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {s.is_active !== false ? "مفعلة" : "معطلة"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 4: PROJECTS (المشاريع) ─── */}
            {activeTab === "projects" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                    معرض المشاريع ({data.projects.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.projects.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-md flex flex-col"
                    >
                      {p.cover_image_url ? (
                        <div className="h-32 bg-slate-800 relative overflow-hidden">
                          <img
                            src={p.cover_image_url}
                            alt={p.title_ar}
                            className="w-full h-full object-cover"
                          />
                          {p.is_featured && (
                            <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              ⭐ مميز
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-20 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                          لا توجد صورة غلاف
                        </div>
                      )}

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-white mb-1">{p.title_ar}</h3>
                          <p className="text-xs text-slate-400">📍 {p.city || "الرياض"}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-2 text-[11px] text-slate-400">
                          <span>{p.client_name || "عميل خاص"}</span>
                          <span
                            className={p.is_active !== false ? "text-emerald-400" : "text-rose-400"}
                          >
                            {p.is_active !== false ? "🟢 معروض" : "🔴 مخفي"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 5: REVIEWS (التقييمات) ─── */}
            {activeTab === "reviews" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    تقييمات العملاء ({data.reviews.length})
                  </h2>
                </div>

                {data.reviews.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl p-8 text-center text-slate-400 border border-slate-800/80">
                    <Star className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">لا توجد تقييمات حالياً.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.reviews.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-white">{r.author_name || r.name}</h3>
                          <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                            <span>{r.rating || 5}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                          {r.comment || r.content_ar || "تقييم ممتاز وخدمة راقية."}
                        </p>

                        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                          <span>{r.city || "الرياض"}</span>
                          <span className={r.is_approved ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                            {r.is_approved ? "✅ معتمد" : "⏳ في الانتظار"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 6: SETTINGS (إعدادات المنشأة) ─── */}
            {activeTab === "settings" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    إعدادات النظام والمنشأة
                  </h2>
                </div>

                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <div>
                      <h4 className="font-bold text-sm text-white">وضع الصيانة (Maintenance Mode)</h4>
                      <p className="text-xs text-slate-400">إغلاق الموقع مؤقتاً للزوار مع رسالة صيانة</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      معطل (الموقع متاح)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/50 space-y-2">
                    <h4 className="font-bold text-xs text-slate-300">معلومات المنشأة الرسمية</h4>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>🏢 مؤسسة القوة العاشرة للمقاولات العامة والواجهات الزجاجية</p>
                      <p>📍 المقر الرئيسي: الرياض — المملكة العربية السعودية</p>
                      <p>🌐 الرابط: powerof10.netlify.app</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
                    💡 يمكنك دائماً استخدام أوامر البوت السريعة مثل <code>/stats</code> و <code>/quotes</code> مباشرة في الدردشة.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Bottom Navigation Bar (Telegram Style) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleTabChange("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "dashboard"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          onClick={() => handleTabChange("quotes")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            activeTab === "quotes"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">الطلبات</span>
          {metrics.newQuoteRequests > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => handleTabChange("services")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "services"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px]">الخدمات</span>
        </button>

        <button
          onClick={() => handleTabChange("projects")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "projects"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">المشاريع</span>
        </button>

        <button
          onClick={() => handleTabChange("reviews")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "reviews"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px]">التقييمات</span>
        </button>

        <button
          onClick={() => handleTabChange("settings")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "settings"
              ? "text-cyan-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">الإعدادات</span>
        </button>
      </nav>
    </div>
  );
}
