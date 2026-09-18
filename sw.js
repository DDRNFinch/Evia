const VERSION = "2026-09-18-evia7-v3";
const CACHE_NAME = "evia7-offline-" + VERSION;

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./polish.css",
  "./app.js",
  "./polish.js",
  "./profile.js",
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
      const response = await fetch(event.request, { cache: "no-store" });

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
