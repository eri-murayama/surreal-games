// ========================================
// シュールゲームス - メインスクリプト
// ========================================

// ローディング画面の制御
(function () {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  // アニメーション完了後にフェードアウト
  const minDisplayTime = 350; // バーアニメの印象は残しつつ待ち時間を短縮
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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  if (prefersReducedMotion.matches) return;

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
    var overlay = document.createElement('div');
    overlay.className = 'jumpscare-overlay';
    var img = document.createElement('img');
    img.src = 'assets/images/manmen-no-emi-full.png';
    img.className = 'jumpscare-img';
    document.body.appendChild(overlay);
    document.body.appendChild(img);
    setTimeout(function() {
      img.remove();
      overlay.remove();
      if (isInView) scheduleJumpscare();
    }, 600);
  }
})();

// 固定ナビ＆トップに戻るボタンの表示切替
const fixedNav = document.getElementById('fixed-nav');
const backToTop = document.getElementById('back-to-top');
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const keepNavVisible = !!(fixedNav && fixedNav.dataset.navMode === 'always');

function closeMobileNav() {
  if (!fixedNav) return;
  fixedNav.classList.remove('is-open');
  if (mobileNavToggle) {
    mobileNavToggle.setAttribute('aria-expanded', 'false');
  }
  if (!keepNavVisible && window.scrollY <= window.innerHeight * 0.6) {
    fixedNav.classList.remove('visible');
  }
}

if (mobileNavToggle && fixedNav) {
  mobileNavToggle.addEventListener('click', function(event) {
    event.stopPropagation();
    var isOpen = fixedNav.classList.toggle('is-open');
    mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('#fixed-nav .fixed-nav__link').forEach(function(link) {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('click', function(event) {
    if (!fixedNav.classList.contains('is-open')) return;
    if (!fixedNav.contains(event.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeMobileNav();
    }
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileNav();
    }
  });
}

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const showThreshold = window.innerHeight * 0.6;
  const shouldShow = scrollY > showThreshold;

  if (fixedNav) {
    fixedNav.classList.toggle('visible', keepNavVisible || shouldShow || fixedNav.classList.contains('is-open'));
    if (!keepNavVisible && !shouldShow && !fixedNav.classList.contains('is-open')) {
      closeMobileNav();
    }
  }
  if (backToTop) {
    backToTop.classList.toggle('visible', shouldShow);
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

  var fullText = tagline.textContent.trim();
  var shouldAnimate = !prefersReducedMotion.matches && window.innerWidth > 768;

  if (!shouldAnimate) {
    tagline.textContent = fullText;
    tagline.style.borderRight = 'none';
    tagline.classList.remove('typing');
    return;
  }

  tagline.textContent = '';
  tagline.classList.add('typing');

  setTimeout(function() {
    var i = 0;
    var interval = setInterval(function() {
      i++;
      tagline.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        clearInterval(interval);
        tagline.style.borderRight = 'none';
        tagline.classList.remove('typing');
      }
    }, 55);
  }, 250);
})();

// ========================================
// 背景パーティクル（星）エフェクト
// ========================================
(function initParticles() {
  if (prefersReducedMotion.matches) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  var ctx = canvas.getContext('2d');

  function resize() {
    var viewport = window.visualViewport;
    var width = viewport ? Math.round(viewport.width) : document.documentElement.clientWidth;
    var height = viewport ? Math.round(viewport.height) : window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
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
  var container = document.getElementById('news-list');
  if (!container) return;

  var filtersEl = document.getElementById('news-filters');
  var searchInput = document.getElementById('news-search-input');
  var moreBtn = document.getElementById('news-more-btn');
  var emptyEl = document.getElementById('news-empty');

  var PAGE_SIZE = 5;
  var allNews = [];
  var activeTag = 'all';
  var keyword = '';
  var expanded = false;

  // フォールバック用データ（fetchが失敗した場合に使用）
  var fallbackNews = [
    { date: '2026.04.13', tag: 'new', tagLabel: '新ゲーム', text: '新ゲーム「漆黒のリバーシ」を公開しました！吾輩の番だが？', url: 'games/reversi/index.html' },
    { date: '2026.04.11', tag: 'new', tagLabel: '新ゲーム', text: '新ゲーム「シュール進化論」を公開しました！無限にやっちゃう〜。', url: 'games/puzzle-2048/index.html' },
    { date: '2026.04.06', tag: 'new', tagLabel: '新ゲーム', text: '新ゲーム「かいだんマインスイーパー」を公開しました！ちびるなよ小童ども！', url: 'games/minesweeper/index.html' },
    { date: '2026.03.28', tag: 'new', tagLabel: '新ゲーム', text: '新ゲーム「うんコーンキャッチャー」を公開しました！空から降ってくるアレをキャッチ！', url: 'games/unko-cone/index.html' },
    { date: '2026.03.10', tag: 'update', tagLabel: '公開', text: 'シュールゲームス公式サイトを公開しました！', url: 'index.html' }
  ];

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function buildFilters(items) {
    if (!filtersEl) return;
    var seen = {};
    var tags = [{ tag: 'all', label: 'すべて' }];
    items.forEach(function(item) {
      var t = item.tag || 'new';
      if (!seen[t]) {
        seen[t] = true;
        tags.push({ tag: t, label: item.tagLabel || 'お知らせ' });
      }
    });
    filtersEl.innerHTML = tags.map(function(t) {
      var active = t.tag === activeTag ? ' is-active' : '';
      return '<button type="button" class="news-filter-btn' + active +
        '" data-tag="' + escapeHtml(t.tag) + '">' + escapeHtml(t.label) + '</button>';
    }).join('');
    filtersEl.querySelectorAll('.news-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeTag = btn.getAttribute('data-tag') || 'all';
        expanded = false;
        filtersEl.querySelectorAll('.news-filter-btn').forEach(function(b) {
          b.classList.toggle('is-active', b === btn);
        });
        renderList();
      });
    });
  }

  function getFiltered() {
    var kw = keyword.trim().toLowerCase();
    return allNews.filter(function(item) {
      if (activeTag !== 'all' && (item.tag || 'new') !== activeTag) return false;
      if (!kw) return true;
      var haystack = ((item.text || '') + ' ' + (item.tagLabel || '') + ' ' + (item.date || '')).toLowerCase();
      return haystack.indexOf(kw) !== -1;
    });
  }

  function renderList() {
    var filtered = getFiltered();
    var limit = expanded ? filtered.length : PAGE_SIZE;
    var shown = filtered.slice(0, limit);

    container.innerHTML = shown.map(function(item) {
      var article = '<article class="news-item">' +
        '<time class="news-date">' + escapeHtml(item.date) + '</time>' +
        '<span class="news-tag news-tag--' + escapeHtml(item.tag || 'new') + '">' + escapeHtml(item.tagLabel || 'お知らせ') + '</span>' +
        '<p class="news-text">' + escapeHtml(item.text) + '</p>' +
        '</article>';
      if (item.url) {
        return '<a class="news-link" href="' + escapeHtml(item.url) + '">' + article + '</a>';
      }
      return article;
    }).join('');

    if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    if (moreBtn) {
      if (filtered.length <= PAGE_SIZE) {
        moreBtn.hidden = true;
      } else {
        moreBtn.hidden = false;
        moreBtn.textContent = expanded ? '折りたたむ' : 'もっと見る（全' + filtered.length + '件）';
      }
    }
  }

  function injectJsonLd(items) {
    var newsJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'シュールゲームス お知らせ',
      'itemListElement': items.map(function(item, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': (function() {
            var article = {
              '@type': 'NewsArticle',
              'headline': item.text,
              'datePublished': item.date.replace(/\./g, '-'),
              'author': { '@type': 'Organization', 'name': 'シュールゲームス' }
            };
            if (item.url) {
              article.url = new URL(item.url, window.location.href).href;
            }
            return article;
          })()
        };
      })
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(newsJsonLd);
    document.head.appendChild(script);
  }

  function init(items) {
    allNews = items.slice();
    buildFilters(allNews);
    renderList();
    injectJsonLd(allNews);
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      keyword = searchInput.value || '';
      expanded = false;
      renderList();
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', function() {
      expanded = !expanded;
      renderList();
    });
  }

  fetch('data/news.json', { cache: 'no-store' })
    .then(function(res) {
      if (!res.ok) throw new Error('news fetch failed');
      return res.json();
    })
    .then(init)
    .catch(function() { init(fallbackNews); });
})();

// ========================================
// おすすめゲームルーレット
// ========================================
(function () {
  const btn = document.getElementById('recommend-btn');
  const overlay = document.getElementById('recommend-overlay');
  if (!btn || !overlay) return;

  const card = document.getElementById('roulette-card');
  const imageEl = document.getElementById('roulette-image');
  const nameEl = document.getElementById('roulette-name');
  const titleEl = document.getElementById('roulette-title');
  const actionsEl = document.getElementById('roulette-actions');
  const playLink = document.getElementById('roulette-play');
  const retryBtn = document.getElementById('roulette-retry');
  const closeBtn = document.getElementById('roulette-close');
  const raysEl = overlay.querySelector('.roulette-rays');
  const confettiEl = document.getElementById('roulette-confetti');
  const countdownEl = document.getElementById('roulette-countdown');

  const FALLBACK_BG = {
    'placeholder-art--kaidan':   'linear-gradient(135deg, #3949ab, #1a237e, #0d1333)',
    'placeholder-art--drive':    'linear-gradient(135deg, #fff59d, #fdd835, #f57f17)',
    'placeholder-art--analysis': 'linear-gradient(135deg, #64b5f6, #1e88e5, #0d47a1)',
    'placeholder-art--escape':   'linear-gradient(135deg, #fce4ec, #ec407a, #ad1457)',
    'placeholder-art--kanikani': 'linear-gradient(135deg, #ff8a65, #f4511e, #bf360c)'
  };

  const CONFETTI_COLORS = ['#ff1493', '#ffd700', '#00e5ff', '#7cff7a', '#ff8ac4', '#c71585', '#ffffff'];

  let games = [];
  let spinTimer = null;
  let countdownTimers = [];

  function collectGames() {
    const list = [];
    const cards = document.querySelectorAll('#games .game-grid > .game-card');
    cards.forEach(function (c) {
      const titleNode = c.querySelector('.game-card__title');
      const linkNode = c.querySelector('.store-btn');
      if (!titleNode || !linkNode) return;
      const imgNode = c.querySelector('.game-card__image img');
      const front = c.querySelector('.card-flip-front') || c.querySelector('.placeholder-art');
      let bg = '';
      if (front) {
        const style = front.getAttribute('style') || '';
        const m = style.match(/background\s*:\s*([^;]+)/);
        if (m) {
          bg = m[1];
        } else {
          for (const key in FALLBACK_BG) {
            if (front.classList.contains(key)) { bg = FALLBACK_BG[key]; break; }
          }
        }
      }
      list.push({
        name: titleNode.innerText.replace(/\s+/g, ' ').trim(),
        url: linkNode.getAttribute('href'),
        imgSrc: imgNode ? imgNode.getAttribute('src') : null,
        bg: bg
      });
    });
    return list;
  }

  function renderGame(game) {
    imageEl.innerHTML = '';
    if (game.imgSrc) {
      const img = document.createElement('img');
      img.src = game.imgSrc;
      img.alt = '';
      imageEl.appendChild(img);
    }
    imageEl.style.background = game.bg || 'linear-gradient(135deg, #ffe0f0, #ff69b4)';
    nameEl.textContent = game.name;
  }

  function clearTimers() {
    if (spinTimer) { clearTimeout(spinTimer); spinTimer = null; }
    countdownTimers.forEach(clearTimeout);
    countdownTimers = [];
  }

  function resetEffects() {
    card.classList.remove('is-spinning', 'is-winner');
    if (raysEl) raysEl.classList.remove('is-active');
    if (confettiEl) {
      confettiEl.classList.remove('is-burst');
      confettiEl.innerHTML = '';
    }
    if (countdownEl) {
      countdownEl.classList.remove('is-active');
      countdownEl.textContent = '';
    }
  }

  function burstConfetti() {
    if (!confettiEl) return;
    confettiEl.innerHTML = '';
    const pieces = 28;
    for (let i = 0; i < pieces; i++) {
      const s = document.createElement('span');
      const angle = (Math.PI * 2 * i) / pieces + (Math.random() - 0.5) * 0.3;
      const dist = 120 + Math.random() * 90;
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      s.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      s.style.animationDelay = (Math.random() * 0.1) + 's';
      confettiEl.appendChild(s);
    }
    void confettiEl.offsetWidth;
    confettiEl.classList.add('is-burst');
  }

  function showCountdown(text) {
    if (!countdownEl) return;
    countdownEl.textContent = text;
    countdownEl.classList.remove('is-active');
    void countdownEl.offsetWidth;
    countdownEl.classList.add('is-active');
  }

  function spin() {
    clearTimers();
    resetEffects();
    actionsEl.hidden = true;
    titleEl.textContent = '運命のゲームは…？';
    card.classList.add('is-spinning');

    const n = games.length;
    if (n === 0) return;
    const winnerIdx = Math.floor(Math.random() * n);
    const totalSteps = 26;
    let currentIdx = ((winnerIdx - (totalSteps - 1)) % n + n * 100) % n;
    let step = 0;

    function tick() {
      renderGame(games[currentIdx]);
      step++;
      if (step >= totalSteps) {
        card.classList.remove('is-spinning');
        card.classList.add('is-winner');
        if (raysEl) raysEl.classList.add('is-active');
        titleEl.textContent = '🎉 このゲームで決まり！';
        playLink.setAttribute('href', games[currentIdx].url);
        actionsEl.hidden = false;
        burstConfetti();
        spinTimer = null;
        return;
      }
      currentIdx = (currentIdx + 1) % n;
      const remaining = totalSteps - step;
      let delay;
      if (remaining > 16) delay = 65;
      else if (remaining > 10) delay = 100;
      else if (remaining > 6)  delay = 170;
      else if (remaining > 3)  delay = 300;
      else if (remaining > 1)  delay = 460;
      else delay = 640;
      spinTimer = setTimeout(tick, delay);
    }
    tick();
  }

  function startRoulette() {
    clearTimers();
    resetEffects();
    actionsEl.hidden = true;
    titleEl.textContent = 'よーい…';
    if (games.length === 0) return;

    countdownTimers.push(setTimeout(function () { showCountdown('3'); }, 50));
    countdownTimers.push(setTimeout(function () { showCountdown('2'); }, 550));
    countdownTimers.push(setTimeout(function () { showCountdown('1'); }, 1050));
    countdownTimers.push(setTimeout(function () { showCountdown('GO!'); }, 1550));
    countdownTimers.push(setTimeout(function () { spin(); }, 2050));
  }

  function openOverlay() {
    games = collectGames();
    if (games.length === 0) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startRoulette();
  }

  function closeOverlay() {
    clearTimers();
    resetEffects();
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openOverlay);
  retryBtn.addEventListener('click', startRoulette);
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('roulette-backdrop')) closeOverlay();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });
})();
