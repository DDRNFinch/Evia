// v99 final refresh: one mounted shell and one service-worker owner
const CACHE_NAME = 'evia-shell-v99';
const LEGACY_READY_CACHE = 'evia-beta-shell-v99';
const CACHE_PREFIXES = ['evia-shell-', 'evia-beta-shell-'];
const CRITICAL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/index-D_kAPZ6L.css',
  './assets/evia-selfobs-live.css',
  './assets/evia-selfobs-fixes.css',
  './assets/evia-selfobs-live.js',
  './assets/evia-updater.js',
  './assets/evia-version-v99.js',
  './assets/evia-mini-milos-v86.js',
  './assets/evia-next-visit-v95.js',
  './assets/evia-milos-review-sync-v97.js',
  './assets/evia-targets.js',
  './assets/evia-count-display-v94.js',
  './assets/evia-milos-observed-arch-v94.js',
  './assets/evia-arp-v80.js',
  './assets/evia-arp-home-score-v94.js',
  './assets/evia-rpl-unit-order-v88.js',
  './assets/evia-rpl-course.css',
  './assets/evia-trowel-handbook-v89.js',
  './assets/evia-trowel-loader.js',
  './assets/evia-6570-pack-migration.js',
  './assets/evia-6570-v91-remap.js',
  './assets/evia-6570-smoke.js',
  './assets/evia-nvq-v94.js',
  './assets/evia-nvq-ac-browser-v90.js',
  './assets/evia-nvq-ac-browser-v90.css',
  './assets/qrcode.js',
  './assets/jsQR-1.4.0.js'
];
const REPLACE_PATHS = new Set([
  '/Evia/',
  '/Evia/index.html',
  '/Evia/assets/index-D_kAPZ6L.css',
  '/Evia/assets/evia-selfobs-live.css',
  '/Evia/assets/evia-selfobs-fixes.css',
  '/Evia/assets/evia-selfobs-live.js',
  '/Evia/assets/evia-updater.js',
  '/Evia/assets/evia-version-v99.js',
  '/Evia/assets/evia-mini-milos-v86.js',
  '/Evia/assets/evia-next-visit-v95.js',
  '/Evia/assets/evia-milos-review-sync-v97.js',
  '/Evia/assets/evia-targets.js',
  '/Evia/assets/evia-count-display-v94.js',
  '/Evia/assets/evia-milos-observed-arch-v94.js',
  '/Evia/assets/evia-arp-v80.js',
  '/Evia/assets/evia-arp-home-score-v94.js',
  '/Evia/assets/evia-rpl-unit-order-v88.js',
  '/Evia/assets/evia-rpl-course.css',
  '/Evia/assets/evia-trowel-handbook-v89.js',
  '/Evia/assets/evia-trowel-loader.js',
  '/Evia/assets/evia-6570-pack-migration.js',
  '/Evia/assets/evia-6570-v91-remap.js',
  '/Evia/assets/evia-6570-smoke.js',
  '/Evia/assets/evia-nvq-v94.js',
  '/Evia/assets/evia-nvq-ac-browser-v90.js',
  '/Evia/assets/evia-nvq-ac-browser-v90.css',
  '/Evia/assets/qrcode.js',
  '/Evia/assets/jsQR-1.4.0.js'
]);

async function migrateOldShell(cache) {
  const names = await caches.keys();
  for (const name of names) {
    if (name === CACHE_NAME || name === LEGACY_READY_CACHE || !CACHE_PREFIXES.some(prefix => name.startsWith(prefix))) continue;
    const old = await caches.open(name);
    const requests = await old.keys();
    for (const request of requests) {
      const url = new URL(request.url);
      if (url.origin !== self.location.origin || REPLACE_PATHS.has(url.pathname)) continue;
      const response = await old.match(request);
      if (response) await cache.put(request, response);
    }
  }
}

async function refreshCritical(cache) {
  await Promise.allSettled(CRITICAL.map(async path => {
    const response = await fetch(path, { cache: 'reload' });
    if (response.ok) await cache.put(path, response.clone());
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await migrateOldShell(cache);
    await refreshCritical(cache);
    await caches.open(LEGACY_READY_CACHE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME && name !== LEGACY_READY_CACHE && CACHE_PREFIXES.some(prefix => name.startsWith(prefix))).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/update.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          await cache.put('./index.html', response.clone());
          await cache.put('./', response.clone());
        }
        return response;
      } catch {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});