// ========================================
// シュールゲームス - メインスクリプト
// ========================================

// ローディング画面の制御
(function () {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  // アニメーション完了後にフェードアウト
  const minDisplayTime = 1400; // バーアニメ(1.2s) + 余韻
  const start = Date.now();

  function dismissLoading() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(() => {
      loadingScreen.classList.add('loaded');
      // 完全に消えたらDOMから除去
      setTimeout(() => loadingScreen.remove(), 700);
    }, remaining);
  }

  // ページ読み込み完了で消す
  if (document.readyState === 'complete') {
    dismissLoading();
  } else {
    window.addEventListener('load', dismissLoading);
  }
})();

// スクロールフェードインアニメーション
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// about背景キャラのふわっと出現 + ランダム巨大化
document.querySelectorAll('.about-bg-chara').forEach((el) => observer.observe(el));

// 突然巨大化するやつ
(function setupJumpscare() {
  const chara = document.querySelector('.about-bg-chara');
  if (!chara) return;

  let jumpscareTimer = null;
  let isInView = false;

  // aboutセクションが見えている間だけ巨大化チャンスがある
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;
        if (isInView) {
          scheduleJumpscare();
        } else {
          clearTimeout(jumpscareTimer);
        }
      });
    },
    { threshold: 0.3 }
  );

  const aboutSection = document.getElementById('about');
  if (aboutSection) aboutObserver.observe(aboutSection);

  function scheduleJumpscare() {
    clearTimeout(jumpscareTimer);
    // 5〜15秒後にランダムで巨大化
    const delay = 5000 + Math.random() * 10000;
    jumpscareTimer = setTimeout(() => {
      if (!isInView) return;
      doJumpscare();
    }, delay);
  }

  function doJumpscare() {
    // 背景オーバーレイを追加
    const overlay = document.createElement('div');
    overlay.className = 'jumpscare-overlay';
    document.body.appendChild(overlay);
    chara.classList.add('jumpscare');
    // 0.6秒で元に戻す
    setTimeout(() => {
      chara.classList.remove('jumpscare');
      overlay.remove();
      // 次のジャンプスケアをスケジュール
      if (isInView) scheduleJumpscare();
    }, 600);
  }
})();

// 固定ナビ＆トップに戻るボタンの表示切替
const fixedNav = document.getElementById('fixed-nav');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const showThreshold = window.innerHeight * 0.6;

  if (fixedNav) {
    fixedNav.classList.toggle('visible', scrollY > showThreshold);
  }
  if (backToTop) {
    backToTop.classList.toggle('visible', scrollY > showThreshold);
  }
});

// イースターエッグ: ロゴを5回クリックで画面反転
let clickCount = 0;
const logo = document.getElementById('logo');

if (logo) {
  logo.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) {
      clickCount = 0;
      document.body.classList.add('inverted');
      setTimeout(() => document.body.classList.remove('inverted'), 1000);
    }
  });
}

// ========================================
// お知らせセクション: data/news.json から動的読み込み
// ========================================
(function loadNews() {
  const container = document.getElementById('news-list');
  if (!container) return;

  // フォールバック用データ（fetchが失敗した場合に使用）
  var fallbackNews = [
    { date: '2026.03.23', tag: 'new', tagLabel: '新ゲーム', text: '新ゲーム「黄金の金色ドライバー」を公開しました！ヨシノリと一緒にドライバー界の頂点を目指そう' },
    { date: '2026.03.22', tag: 'update', tagLabel: '更新', text: 'サイトリニューアル！サウンド・実績システムを追加しました' },
    { date: '2026.03.22', tag: 'new', tagLabel: '新機能', text: 'キャラクター図鑑ページを公開しました' },
    { date: '2026.03.22', tag: 'new', tagLabel: '新機能', text: 'PWA対応！ホーム画面に追加してアプリのように遊べます' },
    { date: '2026.03.10', tag: 'update', tagLabel: '更新', text: 'シェアボタンの多言語対応（かにかにパニック・脱出ゲーム）' }
  ];

  function renderNews(items) {
    container.innerHTML = items.map(function(item) {
      return '<article class="news-item">' +
        '<time class="news-date">' + item.date + '</time>' +
        '<span class="news-tag news-tag--' + item.tag + '">' + item.tagLabel + '</span>' +
        '<p class="news-text">' + item.text + '</p>' +
        '</article>';
    }).join('');
  }

  fetch('data/news.json')
    .then(function(res) { return res.json(); })
    .then(renderNews)
    .catch(function() { renderNews(fallbackNews); });
})();
