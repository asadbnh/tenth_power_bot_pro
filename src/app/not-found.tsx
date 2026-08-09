import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center space-y-6">
        {/* Large 404 number with gradient */}
        <div className="text-[8rem] sm:text-[10rem] font-extrabold leading-none bg-gradient-to-br from-primary-400 to-primary-700 bg-clip-text text-transparent select-none">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold -mt-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-text-secondary leading-relaxed">
          عذرًا، لم نتمكن من العثور على الصفحة المطلوبة. ربما تم نقلها أو حذفها.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/ar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          <Link
            href="/ar/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-text-primary font-semibold hover:border-primary-300 transition-colors active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            البحث في الموقع
          </Link>
        </div>
      </div>
    </div>
  );
}
