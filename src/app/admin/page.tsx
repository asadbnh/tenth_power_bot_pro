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
  Plus,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Edit2,
  Shield,
  Save,
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
  const [actionLoading, setActionLoading] = useState(false);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>("");

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [modalType, setModalType] = useState<"add_service" | "add_project" | "add_review" | "edit_company" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ action: string; id: string; title: string; type?: string } | null>(null);

  // Form states
  const [serviceForm, setServiceForm] = useState({
    name_ar: "",
    slug: "",
    price_from: "",
    price_to: "",
    price_unit: "متر",
    short_description_ar: "",
    is_active: true,
    is_featured: false,
  });

  const [projectForm, setProjectForm] = useState({
    title_ar: "",
    slug: "",
    client_name: "",
    city: "الرياض",
    project_value: "",
    cover_image_url: "",
    description_ar: "",
    is_active: true,
    is_featured: false,
  });

  const [reviewForm, setReviewForm] = useState({
    client_name: "",
    client_title: "عميل موثق",
    content_ar: "",
    rating: 5,
    is_featured: true,
  });

  const [companyForm, setCompanyForm] = useState({
    name_ar: "",
    phone_primary: "",
    whatsapp_number: "",
    email: "",
    tax_number: "",
    commercial_register: "",
  });

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

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        if (result.data.settings) {
          setCompanyForm({
            name_ar: result.data.settings.name_ar || "",
            phone_primary: result.data.settings.phone_primary || "",
            whatsapp_number: result.data.settings.whatsapp_number || "",
            email: result.data.settings.email || "",
            tax_number: result.data.settings.tax_number || "",
            commercial_register: result.data.settings.commercial_register || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      showToast("تعذر تحميل أحدث البيانات من السيرفر", "error");
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

  // 3. Unified Mutation Caller
  const executeMutation = async (action: string, payload: any) => {
    setActionLoading(true);
    triggerHaptic("medium");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (initData) headers["X-Telegram-Init-Data"] = initData;

      const res = await fetch("/api/telegram/miniapp/mutate", {
        method: "POST",
        headers,
        body: JSON.stringify({ action, payload }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message || "تمت العملية بنجاح! ✅");
        await fetchData(true);
        return true;
      } else {
        showToast(result.error || "فشل تنفيذ العملية", "error");
        return false;
      }
    } catch (err: any) {
      console.error("Mutation failed:", err);
      showToast("خطأ في الاتصال بالخادم", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ─── CRUD Handlers ───
  const handleUpdateQuoteStatus = async (id: string, status: string) => {
    await executeMutation("update_quote_status", { id, status });
  };

  const handleToggleService = async (id: string, field: "is_active" | "is_featured", currentValue: boolean) => {
    await executeMutation("toggle_service", { id, field, value: !currentValue });
  };

  const handleToggleProject = async (id: string, field: "is_active" | "is_featured", currentValue: boolean) => {
    await executeMutation("toggle_project", { id, field, value: !currentValue });
  };

  const handleApproveReview = async (id: string, type: "testimonial" | "customer_review") => {
    await executeMutation("approve_review", { id, type });
  };

  const handleToggleMaintenance = async () => {
    const currentMode = Boolean(data.settings?.maintenance_mode);
    await executeMutation("toggle_maintenance", { value: !currentMode });
  };

  const handleCreateServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name_ar) return showToast("يرجى كتابة اسم الخدمة", "error");
    const ok = await executeMutation("create_service", serviceForm);
    if (ok) {
      setModalType(null);
      setServiceForm({
        name_ar: "",
        slug: "",
        price_from: "",
        price_to: "",
        price_unit: "متر",
        short_description_ar: "",
        is_active: true,
        is_featured: false,
      });
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title_ar) return showToast("يرجى كتابة عنوان المشروع", "error");
    const ok = await executeMutation("create_project", projectForm);
    if (ok) {
      setModalType(null);
      setProjectForm({
        title_ar: "",
        slug: "",
        client_name: "",
        city: "الرياض",
        project_value: "",
        cover_image_url: "",
        description_ar: "",
        is_active: true,
        is_featured: false,
      });
    }
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.client_name || !reviewForm.content_ar) return showToast("يرجى تعبئة الحقول المطلوبة", "error");
    const ok = await executeMutation("create_testimonial", reviewForm);
    if (ok) {
      setModalType(null);
      setReviewForm({
        client_name: "",
        client_title: "عميل موثق",
        content_ar: "",
        rating: 5,
        is_featured: true,
      });
    }
  };

  const handleUpdateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await executeMutation("update_company_profile", companyForm);
    if (ok) setModalType(null);
  };

  const handleConfirmDeleteSubmit = async () => {
    if (!confirmDelete) return;
    await executeMutation(confirmDelete.action, { id: confirmDelete.id, type: confirmDelete.type });
    setConfirmDelete(null);
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

  const isMaintenanceActive = Boolean(data.settings?.maintenance_mode);

  return (
    <div className="min-h-screen pb-24 bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20">
      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-top-3 duration-300">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-xl"
                : "bg-rose-950/90 text-rose-200 border-rose-500/40 backdrop-blur-xl"
            }`}
          >
            {toast.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

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
              لوحة التحكم الكاملة (CRUD Live)
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

      {/* ─── Maintenance Mode Alert Banner ─── */}
      {isMaintenanceActive && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-bold">وضع الصيانة مفعل حالياً:</span>
            <span>الموقع مغلق أمام الزوار</span>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors"
          >
            إلغاء الصيانة الآن
          </button>
        </div>
      )}

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
            <p className="text-sm font-medium">جاري تحميل لوحة التحكم الشاملة...</p>
          </div>
        ) : (
          <>
            {/* ─── TAB 1: DASHBOARD (الرئيسية) ─── */}
            {activeTab === "dashboard" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Welcome & Quick Actions Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-cyan-950/40 to-slate-900 border border-cyan-500/20 p-4 shadow-xl">
                  <div className="relative z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                      Telegram Mini App — لوحة التحكم والإدارة
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white mb-1">
                      التحكم الكامل بقواعد البيانات والعمليات 👋
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      يمكنك الآن إضافة، تعديل، حذف، وتغيير حالات الخدمات والمشاريع والطلبات فوراً.
                    </p>

                    {/* Quick Create Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic("light");
                          setModalType("add_service");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة خدمة
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic("light");
                          setModalType("add_project");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة مشروع
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic("light");
                          setModalType("add_review");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة تقييم
                      </button>
                    </div>
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

                {/* Recent Quotes Preview with Quick Statuses */}
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
                    <div className="space-y-2.5">
                      {data.quotes.slice(0, 3).map((q: any) => {
                        const cleanPhone = (q.customer_phone || "").replace(/[^0-9]/g, "");
                        const waPhone = cleanPhone.startsWith("05") ? "966" + cleanPhone.substring(1) : cleanPhone;
                        return (
                          <div
                            key={q.id}
                            className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
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

                            {/* Quick Status Buttons */}
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/40 text-[10px]">
                              <span className="text-slate-500">تغيير الحالة:</span>
                              <button
                                onClick={() => handleUpdateQuoteStatus(q.id, "contacted")}
                                className="px-2 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-300"
                              >
                                تواصل
                              </button>
                              <button
                                onClick={() => handleUpdateQuoteStatus(q.id, "won")}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300"
                              >
                                اتفاق
                              </button>
                              <button
                                onClick={() => handleUpdateQuoteStatus(q.id, "lost")}
                                className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300"
                              >
                                إلغاء
                              </button>
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

                          {/* Action Buttons: Status Changer, WhatsApp, Delete */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={q.status || "new"}
                                onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                              >
                                <option value="new">جديد 🆕</option>
                                <option value="contacted">تم التواصل 💬</option>
                                <option value="quoted">عرض سعر 📋</option>
                                <option value="won">تم الاتفاق ✅</option>
                                <option value="lost">ملغي ❌</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  واتساب
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    action: "delete_quote",
                                    id: q.id,
                                    title: `طلب العميل: ${q.customer_name}`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                  <button
                    onClick={() => {
                      triggerHaptic("light");
                      setModalType("add_service");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة خدمة
                  </button>
                </div>

                <div className="space-y-2.5">
                  {data.services.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 flex flex-col gap-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
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
                          {s.short_description_ar && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.short_description_ar}</p>
                          )}
                        </div>

                        {/* Interactive Toggles */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleService(s.id, "is_featured", Boolean(s.is_featured))}
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.is_featured
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-slate-800 text-slate-500 hover:text-slate-300"
                            }`}
                            title="تمييز الخدمة"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>

                          <button
                            onClick={() => handleToggleService(s.id, "is_active", s.is_active !== false)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              s.is_active !== false
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {s.is_active !== false ? "مفعلة 🟢" : "معطلة 🔴"}
                          </button>

                          <button
                            onClick={() =>
                              setConfirmDelete({
                                action: "delete_service",
                                id: s.id,
                                title: s.name_ar,
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  <button
                    onClick={() => {
                      triggerHaptic("light");
                      setModalType("add_project");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة مشروع
                  </button>
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

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h3 className="font-bold text-sm text-white mb-1">{p.title_ar}</h3>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>📍 {p.city || "الرياض"}</span>
                            <span>{p.client_name || "عميل خاص"}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleProject(p.id, "is_featured", Boolean(p.is_featured))}
                              className={`p-1.5 rounded-lg transition-colors ${
                                p.is_featured
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-slate-800 text-slate-500 hover:text-slate-300"
                              }`}
                              title="تمييز المشروع"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              onClick={() => handleToggleProject(p.id, "is_active", p.is_active !== false)}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                p.is_active !== false
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              }`}
                            >
                              {p.is_active !== false ? "معروض 🟢" : "مخفي 🔴"}
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              setConfirmDelete({
                                action: "delete_project",
                                id: p.id,
                                title: p.title_ar,
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                  <button
                    onClick={() => {
                      triggerHaptic("light");
                      setModalType("add_review");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة تقييم
                  </button>
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
                        className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-white">{r.client_name || r.name}</h3>
                            <span className="text-[11px] text-slate-400">{r.client_title || "عميل موثق"}</span>
                          </div>
                          <div className="flex items-center text-amber-400 text-xs font-bold gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                            <span>{r.rating || 5}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                          {r.content_ar || r.comment || "خدمة راقية وجودة تشطيب ممتازة جداً."}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              r.is_approved
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {r.is_approved ? "✅ معتمد ومنشور" : "⏳ بانتظار الموافقة"}
                          </span>

                          <div className="flex items-center gap-2">
                            {!r.is_approved && (
                              <button
                                onClick={() => handleApproveReview(r.id, r.client_name ? "testimonial" : "customer_review")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                قبول ونشر
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  action: "delete_review",
                                  id: r.id,
                                  type: r.client_name ? "testimonial" : "customer_review",
                                  title: `تقييم العميل: ${r.client_name || r.name}`,
                                })
                              }
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                              title="حذف التقييم"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 6: SETTINGS (إعدادات المنشأة ووضع الصيانة) ─── */}
            {activeTab === "settings" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    إعدادات المنشأة والنظام
                  </h2>
                </div>

                <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-4">
                  {/* Maintenance Mode Interactive Switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-sm text-white">وضع الصيانة للموقع</h4>
                      </div>
                      <p className="text-xs text-slate-400">إغلاق الموقع مؤقتاً للزوار مع شاشة صيانة رسمية</p>
                    </div>

                    <button
                      onClick={handleToggleMaintenance}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                        isMaintenanceActive
                          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      }`}
                    >
                      {isMaintenanceActive ? "🔴 إيقاف الصيانة" : "🟢 تفعيل الصيانة"}
                    </button>
                  </div>

                  {/* Company Profile Details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-300">بيانات المنشأة الرسمية</h4>
                      <button
                        onClick={() => {
                          triggerHaptic("light");
                          setModalType("edit_company");
                        }}
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        تعديل البيانات
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1.5">
                      <p>🏢 <b className="text-slate-200">{data.settings?.name_ar || "مؤسسة القوة العاشرة للمقاولات"}</b></p>
                      <p>📞 الهاتف الأساسي: <span className="text-slate-200 dir-ltr">{data.settings?.phone_primary || "غير مسجل"}</span></p>
                      <p>💬 الواتساب: <span className="text-slate-200 dir-ltr">{data.settings?.whatsapp_number || "غير مسجل"}</span></p>
                      <p>📧 البريد الإلكتروني: <span className="text-slate-200">{data.settings?.email || "غير مسجل"}</span></p>
                      <p>📄 السجل التجاري: <span className="text-slate-200">{data.settings?.commercial_register || "—"}</span></p>
                      <p>⚖️ الرقم الضريبي: <span className="text-slate-200">{data.settings?.tax_number || "—"}</span></p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
                    💡 يمكنك دائماً استخدام أوامر البوت السريعة مثل <code>/stats</code> و <code>/quotes</code> و <code>/backup</code> مباشرة في شات البوت.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── MODAL: Add Service ─── */}
      {modalType === "add_service" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                إضافة خدمة جديدة للكتالوج
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم الخدمة بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: واجهات زجاج سيكوريت ذكي"
                  value={serviceForm.name_ar}
                  onChange={(e) => setServiceForm({ ...serviceForm, name_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">السعر يبدأ من (ريال)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={serviceForm.price_from}
                    onChange={(e) => setServiceForm({ ...serviceForm, price_from: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">السعر الأعلى (ريال)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={serviceForm.price_to}
                    onChange={(e) => setServiceForm({ ...serviceForm, price_to: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">نبذة مختصرة عن الخدمة</label>
                <textarea
                  rows={2}
                  placeholder="أعلى درجات الأمان والعزل الحراري والصوتي..."
                  value={serviceForm.short_description_ar}
                  onChange={(e) => setServiceForm({ ...serviceForm, short_description_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.is_featured}
                    onChange={(e) => setServiceForm({ ...serviceForm, is_featured: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span className="text-slate-300">تعيين كخدمة مميزة ⭐</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ الخدمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Add Project ─── */}
      {modalType === "add_project" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                إضافة مشروع جديد للمعرض
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">عنوان المشروع بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: واجهة برج الملك عبدالله للأعمال"
                  value={projectForm.title_ar}
                  onChange={(e) => setProjectForm({ ...projectForm, title_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المدينة</label>
                  <input
                    type="text"
                    placeholder="الرياض"
                    value={projectForm.city}
                    onChange={(e) => setProjectForm({ ...projectForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم العميل</label>
                  <input
                    type="text"
                    placeholder="شركة الأفق للتطوير"
                    value={projectForm.client_name}
                    onChange={(e) => setProjectForm({ ...projectForm, client_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">رابط صورة الغلاف (Cloudflare R2 URL)</label>
                <input
                  type="url"
                  placeholder="https://pub-...r2.dev/projects/cover.webp"
                  value={projectForm.cover_image_url}
                  onChange={(e) => setProjectForm({ ...projectForm, cover_image_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">وصف المشروع ومواصفات التنفيذ</label>
                <textarea
                  rows={2}
                  placeholder="تنفيذ وتركيب واجهات زجاجية مزدوجة مع قطاعات ألمنيوم معزولة..."
                  value={projectForm.description_ar}
                  onChange={(e) => setProjectForm({ ...projectForm, description_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.is_featured}
                    onChange={(e) => setProjectForm({ ...projectForm, is_featured: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span className="text-slate-300">تعيين كمشروع مميز ⭐</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Add Review ─── */}
      {modalType === "add_review" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                إضافة تقييم أو شهادة عميل جديدة
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم العميل *</label>
                <input
                  type="text"
                  required
                  placeholder="المهندس خالد العتيبي"
                  value={reviewForm.client_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, client_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">صفة أو عنوان العميل</label>
                  <input
                    type="text"
                    placeholder="مالك مجمع تجاري"
                    value={reviewForm.client_title}
                    onChange={(e) => setReviewForm({ ...reviewForm, client_title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">التقييم بالنجوم (1-5)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">نص التقييم أو الرأي *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="تجربة رائعة والتزام هندسي كامل بالمواعيد وجودة الزجاج..."
                  value={reviewForm.content_ar}
                  onChange={(e) => setReviewForm({ ...reviewForm, content_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  اعتماد ونشر التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit Company Profile ─── */}
      {modalType === "edit_company" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                تعديل بيانات المنشأة الرسمية
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompanySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المنشأة بالعربية</label>
                <input
                  type="text"
                  value={companyForm.name_ar}
                  onChange={(e) => setCompanyForm({ ...companyForm, name_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الهاتف الأساسي</label>
                  <input
                    type="text"
                    value={companyForm.phone_primary}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone_primary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={companyForm.whatsapp_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    value={companyForm.commercial_register}
                    onChange={(e) => setCompanyForm({ ...companyForm, commercial_register: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الرقم الضريبي</label>
                <input
                  type="text"
                  value={companyForm.tax_number}
                  onChange={(e) => setCompanyForm({ ...companyForm, tax_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Confirmation Delete Dialog ─── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">تأكيد عملية الحذف</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف <b className="text-white">"{confirmDelete.title}"</b>؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من قاعدة البيانات فوراً.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteSubmit}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

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
