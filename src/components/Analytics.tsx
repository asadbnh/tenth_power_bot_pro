"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem("wt_sid");
  if (stored) return stored;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem("wt_sid", id);
  return id;
}

function getUTMParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
  };
}

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string>("");

  useEffect(() => {
    const path = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
    if (path === lastPath.current) return;
    lastPath.current = path;

    // Fire page view — non-blocking
    const fire = async () => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "page_view",
            page_path: pathname,
            session_id: generateSessionId(),
            ...getUTMParams(),
          }),
        });
      } catch {
        // Silently ignore
      }
    };

    // Debounce 100ms to avoid double fires on locale redirect
    const t = setTimeout(fire, 100);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics tracker component.
 * Mount once in layout to track all page views automatically.
 */
export function Analytics() {
  return (
    <Suspense>
      <AnalyticsInner />
    </Suspense>
  );
}

// ─── Event tracking helpers ───────────────────────────────────────────

export async function trackClick(element: string, metadata?: Record<string, unknown>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "click",
        metadata: { element, ...metadata },
        session_id: generateSessionId(),
      }),
    });
  } catch { /* ignore */ }
}

export async function trackConversion(type: "quote_submit" | "contact_submit" | "whatsapp_click", metadata?: Record<string, unknown>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: type,
        metadata,
        session_id: generateSessionId(),
        ...getUTMParams(),
      }),
    });
  } catch { /* ignore */ }
}
