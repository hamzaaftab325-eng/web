/**
 * Aura Living Service Worker
 *
 * Strategy:
 *  - Navigation (HTML) requests: network-first, fall back to cached shell
 *    so the app opens offline. If both fail, serve /offline.
 *  - Static assets (/_next/static, /icons, /fonts, /hero): cache-first
 *    with long TTL — these are immutable and safe to cache aggressively.
 *  - Images: stale-while-revalidate — show cached image immediately,
 *    fetch updated version in the background.
 *  - API requests: network-only — never cache live data (cart, prices, stock).
 *
 * The service worker is intentionally small and dependency-free so it can
 * be served as a static file from /public.
 */

const VERSION = "aura-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const IMAGE_CACHE = `${VERSION}-images`;

// Routes that constitute the offline-capable app shell.
const SHELL_ROUTES = ["/", "/shop", "/journal", "/care", "/about", "/offline"];

// Assets that should be cached on install (immutable).
const PRECACHE_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo.svg",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      // Cache shell routes — ignore failures so install never breaks.
      await Promise.allSettled(SHELL_ROUTES.map((r) => shellCache.add(r)));
      const assetCache = await caches.open(ASSET_CACHE);
      await Promise.allSettled(PRECACHE_ASSETS.map((a) => assetCache.add(a)));
      // Activate immediately — don't wait for old SW to release.
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge old version caches.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      // Take control of all open tabs.
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET — never intercept POST/PUT/DELETE.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests (Cloudinary images, Resend, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API routes entirely — they need fresh data.
  if (url.pathname.startsWith("/api/")) return;

  // Skip Next.js dev/WebSocket endpoints.
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // 1. Static assets (immutable) — cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/hero/") ||
    url.pathname.startsWith("/fonts/")
  ) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // 2. Image requests — stale-while-revalidate.
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // 3. Navigation (HTML) requests — network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // 4. Everything else — try network, fall back to cache.
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || Response.error()))
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") cache.put(request, response.clone());
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    // Cache successful navigations so they're available offline.
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed — try cached version of this exact URL.
    const cached = await cache.match(request);
    if (cached) return cached;
    // Otherwise try the cached shell.
    const shell = await cache.match("/");
    if (shell) return shell;
    // Last resort: /offline page (if cached) or a simple message.
    const offline = await cache.match("/offline");
    return (
      offline ||
      new Response(
        "<h1>Offline</h1><p>You are offline. Please reconnect to continue browsing Aura Living.</p>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      )
    );
  }
}

// Allow the page to trigger immediate activation (skipWaiting).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
