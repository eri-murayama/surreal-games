const CACHE_VERSION = 'v8';
const CACHE_PREFIX = 'surreal-games-';
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;
const OFFLINE_FALLBACK = '/surreal-games/index.html';

const PRE_CACHE = [
  '/surreal-games/',
  '/surreal-games/index.html',
  '/surreal-games/collection.html',
  '/surreal-games/prototypes.html',
  '/surreal-games/privacy.html',
  '/surreal-games/credits.html',
  '/surreal-games/css/style.css',
  '/surreal-games/js/main.js',
  '/surreal-games/favicon.png',
  '/surreal-games/manifest.json',
  '/surreal-games/data/news.json',
  '/surreal-games/games/common/game-common.js',
  '/surreal-games/games/common/game-common.css',
  '/surreal-games/games/common/i18n.js',
  '/surreal-games/games/common/vendor/three.min.js',
  '/surreal-games/games/common/vendor/peerjs.min.js'
];

function isHtmlRequest(request) {
  return request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
}

function shouldCacheRuntime(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  if (url.pathname.startsWith('/surreal-games/data/') && url.pathname.endsWith('.json')) {
    return true;
  }

  return ['style', 'script', 'image', 'font'].includes(request.destination);
}

function cacheIfValid(cacheName, request, response) {
  if (!response || !response.ok || response.type === 'opaque') {
    return response;
  }

  const clone = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, clone));
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRE_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => cacheIfValid(RUNTIME_CACHE, request, response))
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_FALLBACK);
        })
    );
    return;
  }

  if (!shouldCacheRuntime(request)) return;

  // JSONはネットワーク優先（新しいお知らせが即反映されるように）
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => cacheIfValid(RUNTIME_CACHE, request, response))
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => cacheIfValid(RUNTIME_CACHE, request, response))
        .catch(() => caches.match(request));
    })
  );
});
