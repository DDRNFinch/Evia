const CACHE_NAME = "evia-shell-v8";
const APP_SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./assets/index-D_kAPZ6L.css",
  "./assets/evia-selfobs-live.css",
  "./assets/evia-selfobs-fixes.css",
  "./assets/evia-camera-split.css",
  "./assets/evia-updater.css",
  "./assets/evia-selfobs-live.js",
  "./assets/evia-selfobs-fixes.js",
  "./assets/evia-camera-split.js",
  "./assets/evia-updater.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("evia-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();

    // One-time bridge from the old cached app into the new in-app updater.
    // Future cache versions do not auto-refresh; they are installed through Evia's update panel.
    if (CACHE_NAME === "evia-shell-v8") {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(clients.map((client) => {
        try {
          const url = new URL(client.url);
          if (url.searchParams.get("eviaUpdater") === "8") return undefined;
          url.searchParams.set("eviaUpdater", "8");
          url.searchParams.set("refresh", String(Date.now()));
          return client.navigate(url.href);
        } catch {
          return undefined;
        }
      }));
    }
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const alwaysFresh = url.pathname.endsWith("/update.json") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/sw.js");
  if (alwaysFresh) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./", copy));
          return response;
        })
        .catch(() => caches.match("./")),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
