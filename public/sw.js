const CACHE_NAME = 'dp-research-cache-v1';
// Only cache static files explicitly, avoid caching the root '/' (SSR) or API calls.
const STATIC_ASSETS = [
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Cache-First for static assets, Network-First (or bypass) for everything else.
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
    return;
  }

  // Do NOT cache SSR routes, API calls, or dynamic content.
  event.respondWith(fetch(event.request));
});
