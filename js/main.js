// ========================================
// シュールゲームス - メインスクリプト
// ========================================

// ローディング画面の制御
(function () {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  // アニメーション完了後にフェードアウト
  const minDisplayTime = 800; // バーアニメ(0.6s) + 余韻
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

// スタガーインデックスを設定（カード・ギャラリー）
document.querySelectorAll('.game-card.fade-in').forEach((el, i) => {
  el.style.setProperty('--stagger', i);
});
document.querySelectorAll('.gallery-item.fade-in').forEach((el, i) => {
  el.style.setProperty('--stagger', i);
});

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
// タイプライターエフェクト（タグライン）
// ========================================
(function initTypewriter() {
  var tagline = document.querySelector('.tagline');
  if (!tagline) return;

  var fullText = tagline.textContent;
  tagline.textContent = '';
  tagline.classList.add('typing');

  // ローディング完了後に開始
  setTimeout(function() {
    var i = 0;
    var interval = setInterval(function() {
      i++;
      tagline.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        clearInterval(interval);
        // 完了後しばらくしてカーソルを消す
        setTimeout(function() {
          tagline.style.borderRight = 'none';
          tagline.classList.remove('typing');
        }, 2000);
      }
    }, 120);
  }, 1800);
})();

// ========================================
// 背景パーティクル（星）エフェクト
// ========================================
(function initParticles() {
  var canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  var ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var particles = [];
  var count = Math.min(60, Math.floor(window.innerWidth / 20));
  var colors = ['#ff6ec7', '#00fff7', '#ffff00', '#39ff14'];

  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.pulse += 0.02;

      // 画面端で反対側に
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      var a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.fill();

      // グロー
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a * 0.15;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ========================================
// マウス追従3Dティルト（ゲームカード）
// ========================================
(function initCardTilt() {
  var cards = document.querySelectorAll('.game-card:not(.game-card--flip)');
  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var rotateY = x * 12;
      var rotateX = -y * 8;
      card.style.transform = 'perspective(800px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) translateY(-8px)';
      card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), ' +
        (x * 20) + 'px ' + (y * 20) + 'px 30px rgba(255,110,199,0.15)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
})();

// ========================================
// タッチ端末: 画像タップでカード演出トグル
// ========================================
(function initCardTouch() {
  // マウスがある端末ではスキップ（PCはCSSホバーで動く）
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // 通常カード
  var cards = document.querySelectorAll('.game-card:not(.card-flip-front)');
  cards.forEach(function(card) {
    var imageArea = card.querySelector('.game-card__image');
    if (!imageArea) return;

    imageArea.addEventListener('click', function(e) {
      if (e.target.closest('a, button')) return;
      cards.forEach(function(c) {
        if (c !== card) c.classList.remove('card-active');
      });
      card.classList.toggle('card-active');
    });
  });

  // フリップカード
  var flipCards = document.querySelectorAll('.game-card--flip');
  flipCards.forEach(function(card) {
    var flipZone = card.querySelector('.card-flip-zone');
    if (!flipZone) return;
    flipZone.addEventListener('click', function(e) {
      if (e.target.closest('a, button')) return;
      card.classList.toggle('card-active');
    });
  });
})();

// ========================================
// セクション間にグロー区切り線を自動挿入
// ========================================
(function insertDividers() {
  var sections = document.querySelectorAll('main > section');
  for (var i = 0; i < sections.length - 1; i++) {
    var divider = document.createElement('div');
    divider.className = 'section-divider';
    sections[i].after(divider);
  }
})();

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

    // ニュース構造化データ（JSON-LD）を挿入
    var newsJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'シュールゲームス お知らせ',
      'itemListElement': items.map(function(item, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'NewsArticle',
            'headline': item.text,
            'datePublished': item.date.replace(/\./g, '-'),
            'author': { '@type': 'Organization', 'name': 'シュールゲームス' }
          }
        };
      })
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(newsJsonLd);
    document.head.appendChild(script);
  }

  fetch('data/news.json')
    .then(function(res) { return res.json(); })
    .then(renderNews)
    .catch(function() { renderNews(fallbackNews); });
})();
