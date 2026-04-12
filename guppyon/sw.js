/* ============================================
   ゲロゲーロ学園 - Service Worker
   オフライン対応 & PWA
   ============================================ */

const CACHE_NAME = 'gero-gero-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/audio.js',
  './js/share-gate.js',
  './manifest.json',
  './safety-guide.html',
  './privacy.html',
  './games/pop-bubbles/index.html',
  './games/animal-sounds/index.html',
  './games/color-touch/index.html',
  './games/peekaboo/index.html',
  './games/music-maker/index.html',
  './games/math-battle/index.html',
  './games/hiragana-touch/index.html',
  './games/english-words/index.html',
  './games/memory-cards/index.html',
  './games/shape-puzzle/index.html',
  './games/kanji-quiz/index.html',
  './games/kanji-reading/index.html',
  './games/prefecture-master/index.html',
  './games/speed-calc/index.html',
];

// Install: cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
