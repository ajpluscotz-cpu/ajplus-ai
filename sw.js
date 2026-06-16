// AJPLUS AI — Service Worker
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const CACHE_NAME = 'ajplus-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/js/app.js',
  '/assets/logo.jpeg',
  '/assets/lipa_mixx.jpeg'
];

// Install — cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('AJPLUS AI: Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — futa cache za zamani
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — tumia cache kwanza, kisha network
self.addEventListener('fetch', e => {
  // API calls — daima network (si cache)
  if (e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache responses nzuri tu
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline — rudisha index.html
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
