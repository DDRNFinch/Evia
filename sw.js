const CACHE_NAME = "evia7-offline-v1";
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
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(() => {})));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Always ask GitHub Pages for the newest HTML/CSS/JS/manifest. If the
  // network is unavailable, fall back to the last known good copy instead.
  event.respondWith((async () => {
    try {
      const networkRequest = new Request(event.request, { cache: "no-store" });
      const response = await fetch(networkRequest);
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
