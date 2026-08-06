"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-error/10">
          <AlertTriangle className="w-10 h-10 text-error" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-text-secondary leading-relaxed">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            variant="primary"
            size="lg"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            إعادة المحاولة
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = "/ar")}
          >
            العودة للرئيسية
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-text-tertiary">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
