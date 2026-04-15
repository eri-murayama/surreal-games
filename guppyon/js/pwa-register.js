/* ============================================
   ゲロゲーロ学園 - Service Worker Registration
   ============================================ */

(function() {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  const currentScript = document.currentScript;
  let swUrl;
  let scopeUrl;

  if (currentScript && currentScript.src) {
    const scriptUrl = new URL(currentScript.src, window.location.href);
    swUrl = new URL('../sw.js', scriptUrl);
    scopeUrl = new URL('../', scriptUrl);
  } else {
    swUrl = new URL('sw.js', window.location.href);
    scopeUrl = new URL('.', swUrl);
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl.href, { scope: scopeUrl.pathname }).catch(() => {});
  });
})();
