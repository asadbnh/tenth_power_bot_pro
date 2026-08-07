/**
 * WebTaky PWA Service Worker
 * Provides offline support, cache-first strategy for static assets,
 * and network-first for dynamic API routes.
 */

const CACHE_NAME = "webtaky-v1";
const STATIC_ASSETS = [
  "/",
  "/ar",
  "/en",
  "/manifest.json",
  "/offline.html",
];

// Install — cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — routing strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, API routes, and Next.js internal build chunks (_next/)
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  // Cache-first only for static media & fonts
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico|woff2|woff)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for HTML pages (with offline fallback)
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request) ?? caches.match("/offline.html"))
  );
});
