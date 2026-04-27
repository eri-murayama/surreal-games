/* ============================================
   ゲロゲーロ学園 - Service Worker
   オフライン対応 & PWA
   ============================================ */

const CACHE_NAME = 'gero-gero-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/age-gate.css',
  './css/choice-quest.css',
  './css/game-upgrades.css',
  './js/gero-utils.js',
  './js/main.js',
  './js/audio.js',
  './js/age-gate.js',
  './js/pwa-register.js',
  './js/share-gate.js',
  './js/baby-launcher.js',
  './js/game-upgrades.js',
  './js/choice-quest.js',
  './manifest.json',
  './safety-guide.html',
  './privacy.html',
  './games/pop-bubbles/index.html',
  './games/pop-bubbles/game.css',
  './games/animal-sounds/index.html',
  './games/animal-sounds/game.css',
  './games/color-touch/index.html',
  './games/color-touch/game.css',
  './games/peekaboo/index.html',
  './games/peekaboo/game.css',
  './games/music-maker/index.html',
  './games/music-maker/game.css',
  './games/math-battle/index.html',
  './games/math-battle/game.css',
  './games/hiragana-touch/index.html',
  './games/hiragana-touch/game.css',
  './games/english-words/index.html',
  './games/english-words/game.css',
  './games/memory-cards/index.html',
  './games/memory-cards/game.css',
  './games/shape-puzzle/index.html',
  './games/shape-puzzle/game.css',
  './games/kanji-quiz/index.html',
  './games/kanji-quiz/game.css',
  './games/kanji-reading/index.html',
  './games/kanji-reading/game.css',
  './games/prefecture-master/index.html',
  './games/prefecture-master/game.css',
  './games/speed-calc/index.html',
  './games/speed-calc/game.css',
  './games/counting-frogs/index.html',
  './games/counting-frogs/game.js',
  './games/counting-frogs/game.css',
  './games/rhythm-lights/index.html',
  './games/rhythm-lights/game.js',
  './games/rhythm-lights/game.css',
  './games/same-friends/index.html',
  './games/same-friends/game.js',
  './games/big-small-picnic/index.html',
  './games/big-small-picnic/game.js',
  './games/more-less-party/index.html',
  './games/more-less-party/game.js',
  './games/shadow-match/index.html',
  './games/shadow-match/game.js',
  './games/weather-dressup/index.html',
  './games/weather-dressup/game.js',
  './games/clock-touch/index.html',
  './games/clock-touch/game.js',
  './games/pattern-train/index.html',
  './games/pattern-train/game.js',
  './games/opposites-quiz/index.html',
  './games/opposites-quiz/game.js',
  './games/english-colors/index.html',
  './games/english-colors/game.js',
  './games/first-letter-safari/index.html',
  './games/first-letter-safari/game.js',
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
