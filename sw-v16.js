const VERSION = "2026-09-19-evia7-v18";
const CACHE_NAME = "evia7-offline-" + VERSION;

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./polish.css",
  "./app.js",
  "./polish.js",
  "./profile.js",
  "./test-banks.js",
  "./review.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith("evia7-offline-") && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      // Online: always obtain the newest deployed resource.
      // The cache is only the offline fallback.
      // Always bypass the browser/CDN resource cache while online. The
      // service-worker cache remains an offline fallback only.
      const networkUrl = new URL(event.request.url);
      networkUrl.searchParams.set("_evia_refresh", Date.now().toString());
      const response = await fetch(networkUrl.toString(), {
        cache: "no-store",
        credentials: event.request.credentials
      });

      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (_) {
      const cached = await caches.match(event.request);
      return cached || caches.match("./index.html");
    }
  })());
});
