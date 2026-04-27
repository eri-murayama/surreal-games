/* ============================================
   ゲロゲーロ学園 - Main JavaScript
   ============================================ */

const SUBJECT_LABELS = {
  all: 'ぜんぶ',
  touch: 'タッチあそび',
  math: 'さんすう',
  japanese: 'こくご',
  english: 'えいご',
  brain: 'のうトレ'
};

const SUBJECT_EMOJIS = {
  all: '🌈',
  touch: '👶',
  math: '🔢',
  japanese: '📝',
  english: '🔤',
  brain: '🧠'
};

const AGE_LABELS = {
  baby: 'おちびさん',
  toddler: 'ちびっこ',
  kid: 'しょうがくせい',
  adult: 'おとな',
  all: 'みんな'
};

const AGE_RECOMMENDATIONS = {
  baby: ['same-friends', 'pop-bubbles', 'animal-sounds', 'peekaboo'],
  toddler: ['more-less-party', 'big-small-picnic', 'counting-frogs', 'shadow-match'],
  kid: ['clock-touch', 'pattern-train', 'opposites-quiz', 'first-letter-safari'],
  adult: ['speed-calc', 'kanji-reading', 'prefecture-master', 'math-battle'],
  all: ['same-friends', 'more-less-party', 'clock-touch', 'pattern-train']
};

const RECOMMENDATION_REASONS = {
  'pop-bubbles': 'タッチするだけで すぐたのしい',
  'animal-sounds': 'どうぶつのこえで すぐ笑える',
  'color-touch': 'いろを見つけて ポンとあそべる',
  peekaboo: 'びっくりの反応が ちょうどいい',
  'music-maker': 'さわるたびに 音が出てうれしい',
  'counting-frogs': 'かぞえる最初の一歩に ぴったり',
  'memory-cards': '短い時間でも 達成感がある',
  'shape-puzzle': 'かたちをそろえる気持ちよさがある',
  'math-battle': '連続正解のノリが 気持ちいい',
  'hiragana-touch': 'ひらがなに すぐ触れられる',
  'english-words': 'えいごの入口に ちょうどいい',
  'kanji-quiz': 'クイズ感覚で どんどん進める',
  'prefecture-master': '覚えるほど 面白くなる',
  'rhythm-lights': '光を追うだけで 盛り上がる',
  'speed-calc': '集中して 一気に挑戦できる',
  'kanji-reading': '大人もじっくり 遊びこめる'
};

document.addEventListener('DOMContentLoaded', () => {
  initHomeSimplification();
  initHomeCollections();
  initMobileMenu();
  initSubjectFilter();
  initCardEffects();
  initScrollAnimations();
});

function isHomePage() {
  return !!document.querySelector('#site-menu') && !!document.querySelector('#games');
}

function getSelectedAge() {
  try {
    return localStorage.getItem('gero-age') || 'all';
  } catch (error) {
    return 'all';
  }
}

function getActiveSubject() {
  return document.querySelector('.filter-btn.active')?.dataset.subject || 'all';
}

function getVisibleGameCards() {
  return Array.from(document.querySelectorAll('.game-card')).filter((card) => card.style.display !== 'none');
}

function getGameSlug(card) {
  const href = card.getAttribute('href') || '';
  const parts = href.split('/').filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 2] : href;
}

function getCardTitle(card) {
  return card.querySelector('.card-title')?.textContent.trim() || 'ゲーム';
}

function getCardDescription(card) {
  return card.querySelector('.card-desc')?.textContent.trim() || 'たのしいゲーム';
}

function getCardEmoji(card) {
  return card.querySelector('.thumb-emoji')?.textContent.trim() || SUBJECT_EMOJIS[card.dataset.subject] || '🐸';
}

function setActiveSubject(subject) {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    const isActive = button.dataset.subject === subject;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* --- Homepage Simplification --- */
function initHomeSimplification() {
  if (!isHomePage()) return;

  const homeMenu = document.querySelector('#site-menu');
  const menuLabels = [
    ['a[href="#games"]', '🎮', 'ゲーム'],
    ['a[href="#about"]', '✨', 'あそびかた'],
    ['a[href="#parents"]', '👨‍👩‍👧', 'おうちの方へ']
  ];

  menuLabels.forEach(([selector, emoji, label]) => {
    const link = homeMenu.querySelector(selector);
    if (link) {
      link.innerHTML = `<span class="nav-emoji" aria-hidden="true">${emoji}</span>${label}`;
    }
  });

  const heroTitle = document.querySelector('.hero h1');
  const heroSpeech = document.querySelector('.hero-speech');
  const heroBadges = document.querySelector('.hero-badges');
  const stats = document.querySelector('.stats-bar');

  if (heroTitle) heroTitle.textContent = 'ゲロゲーロ学園';

  if (heroSpeech) {
    heroSpeech.innerHTML = `
      <p>
        <strong>むずかしい説明なしで、すぐにあそべるよ。</strong><br>
        きみに合うゲームをえらんで、<em>できた！</em> をたくさん増やそう。
      </p>
    `;
  }

  if (heroBadges) {
    heroBadges.innerHTML = [
      '<span class="badge badge-free">🎉 ぜんぶ無料</span>',
      '<span class="badge badge-safe">🛡️ あんしん設計</span>',
      '<span class="badge badge-fun">👶 1さいからOK</span>',
      '<span class="badge badge-safe">👨‍👩‍👧 おうちの方向け案内あり</span>'
    ].join('');
  }

  if (stats) {
    stats.innerHTML = [
      '<div class="stat-item">🎮 ゲーム <span class="stat-number">26</span>本</div>',
      '<div class="stat-item">👶 対象 <span class="stat-number">1</span>さい〜</div>',
      '<div class="stat-item">✨ すぐ <span class="stat-number">あそべる</span></div>'
    ].join('');
  }

  const filters = document.getElementById('filters');
  if (filters && !document.querySelector('.filter-helper')) {
    const helper = document.createElement('p');
    helper.className = 'filter-helper fade-in-up delay-3';
    helper.innerHTML = 'まよったら <strong>おすすめ</strong> からどうぞ。きになるジャンルだけ見ることもできます。';
    filters.parentNode.insertBefore(helper, filters);
  }

  document.querySelectorAll('.filter-btn').forEach((button) => {
    const subject = button.dataset.subject;
    const label = SUBJECT_LABELS[subject];
    const emoji = SUBJECT_EMOJIS[subject];
    if (label && emoji) {
      button.textContent = `${emoji} ${label}`;
    }
  });

  const aboutCard = document.querySelector('#about .about-card');
  if (aboutCard) {
    aboutCard.innerHTML = `
      <h2>✨ あそびかた</h2>
      <p class="about-lead">
        ここでは <strong>えらぶ → タッチ → できた！</strong> の3ステップであそべます。<br>
        ちいさい子でも、まよわず楽しく進められるように作っています。
      </p>
      <div class="about-features about-steps">
        <div class="about-feature">
          <div class="feature-icon">🎯</div>
          <h3>えらぶ</h3>
          <p>おすすめからえらんでも、ジャンルでしぼってもOK。気分に合わせてすぐ決められます。</p>
        </div>
        <div class="about-feature">
          <div class="feature-icon">👆</div>
          <h3>さわる</h3>
          <p>タッチ中心で進めやすいゲームをそろえています。むずかしい操作はなるべく減らしました。</p>
        </div>
        <div class="about-feature">
          <div class="feature-icon">🎉</div>
          <h3>できた！</h3>
          <p>短い時間でも「できた」が残るように、達成感のある作りにしています。音はいつでもOFFにできます。</p>
        </div>
      </div>
    `;
  }

  const parentsCard = document.querySelector('#parents .about-card');
  if (parentsCard) {
    parentsCard.style.borderColor = 'var(--blue-light)';
    parentsCard.innerHTML = `
      <h2>👨‍👩‍👧 おうちの方へ</h2>
      <p class="about-lead">
        子どもがすぐ遊べることを大切にしつつ、詳しく見たい方向けの情報もまとめています。<br>
        まずは <strong>安全性・保存される情報・遊び方の確認ページ</strong> をご利用ください。
      </p>
      <div class="parent-links" aria-label="保護者向けの詳しいページ">
        <a href="safety-guide.html" class="parent-link-card">
          <span class="parent-link-title">🛡️ 安全ガイド</span>
          <span class="parent-link-note">スマホやタブレットでの使い方、ホーム追加、見守りのコツを確認できます。</span>
        </a>
        <a href="privacy.html" class="parent-link-card">
          <span class="parent-link-title">🔒 プライバシー</span>
          <span class="parent-link-note">保存する情報、保存しない情報、シェア時の流れを短く確認できます。</span>
        </a>
        <a href="#games" class="parent-link-card">
          <span class="parent-link-title">🎮 年齢にあわせて選ぶ</span>
          <span class="parent-link-note">1さいから大人向けまで、年齢とジャンルでゲームを探せます。</span>
        </a>
      </div>
      <p class="parent-mini-note">子ども向け画面はシンプルに、大人向けには判断しやすい説明を残す方針で整えています。</p>
    `;
  }

  const footer = document.querySelector('.site-footer');
  if (footer) {
    const footerMascot = footer.querySelector('.footer-mascot');
    const footerTexts = footer.querySelectorAll('p');
    const footerLinks = footer.querySelector('.footer-links');

    if (footerMascot) footerMascot.textContent = '🐸';
    if (footerTexts[0]) footerTexts[0].textContent = 'ゲロゲーロ学園｜1さいからあそべる子どもの無料知育ゲーム';
    if (footerTexts[1]) footerTexts[1].textContent = '© 2026 ゲロゲーロ学園 All rights reserved.';

    footer.querySelector('a[href="../index.html"]')?.remove();

    if (footerLinks && !footerLinks.querySelector('a[href="#parents"]')) {
      const parentAnchor = document.createElement('a');
      parentAnchor.href = '#parents';
      parentAnchor.textContent = '👨‍👩‍👧 おうちの方へ';
      footerLinks.appendChild(parentAnchor);
    }
  }
}

/* --- Home Collections --- */
function initHomeCollections() {
  if (!isHomePage()) return;

  ensureHomeCollectionShell();
  document.addEventListener('gero:catalog-updated', refreshHomeCollections);
  window.addEventListener('pageshow', refreshHomeCollections);
  window.requestAnimationFrame(refreshHomeCollections);
}

function ensureHomeCollectionShell() {
  const gamesSection = document.getElementById('games');
  if (!gamesSection) return;

  const heading = gamesSection.querySelector('h2');
  if (!heading) return;

  if (!document.getElementById('recommendPanel')) {
    const panel = document.createElement('section');
    panel.id = 'recommendPanel';
    panel.className = 'recommend-panel fade-in-up delay-3';
    panel.setAttribute('aria-live', 'polite');

    const head = document.createElement('div');
    head.className = 'recommend-head';

    const copy = document.createElement('div');
    copy.className = 'recommend-copy';

    const kicker = document.createElement('p');
    kicker.className = 'recommend-kicker';
    kicker.textContent = 'おすすめ';

    const title = document.createElement('h3');
    title.id = 'recommendTitle';
    title.textContent = 'まよったら ここから';

    const note = document.createElement('p');
    note.id = 'recommendNote';
    note.className = 'recommend-note';

    copy.append(kicker, title, note);
    head.appendChild(copy);
    panel.appendChild(head);

    const list = document.createElement('div');
    list.id = 'recommendList';
    list.className = 'recommend-list';
    panel.appendChild(list);

    heading.insertAdjacentElement('afterend', panel);
  }

  if (!document.getElementById('emptyStateCard')) {
    const emptyCard = document.createElement('section');
    emptyCard.id = 'emptyStateCard';
    emptyCard.className = 'empty-collection';
    emptyCard.hidden = true;
    emptyCard.setAttribute('aria-live', 'polite');
    emptyCard.innerHTML = `
      <span class="empty-collection-emoji" aria-hidden="true">🐸</span>
      <h3 class="empty-collection-title">まだ じゅんびちゅうだよ</h3>
      <p class="empty-collection-text">しぼりこみを もどすと、すぐにあそべるゲームが見つかるよ。</p>
      <div class="empty-actions">
        <button type="button" class="empty-action-btn" id="resetSubjectBtn">しぼりこみを もどす</button>
        <button type="button" class="empty-action-btn secondary" id="reopenAgeBtn">ねんれいを えらびなおす</button>
      </div>
    `;
    document.getElementById('recommendPanel')?.insertAdjacentElement('afterend', emptyCard);

    emptyCard.querySelector('#resetSubjectBtn')?.addEventListener('click', () => {
      setActiveSubject('all');
      if (typeof window.filterByAge === 'function') {
        window.filterByAge(getSelectedAge());
      } else {
        refreshHomeCollections();
      }
    });

    emptyCard.querySelector('#reopenAgeBtn')?.addEventListener('click', () => {
      if (typeof window.reopenAgeGate === 'function') {
        window.reopenAgeGate();
      }
    });
  }
}

function refreshHomeCollections() {
  if (!isHomePage()) return;

  const age = getSelectedAge();
  const subject = getActiveSubject();
  const visibleCards = getVisibleGameCards();

  updateGamesHeading(visibleCards.length);
  renderRecommendationPanel(visibleCards, age, subject);
  renderEmptyState(visibleCards, age, subject);
}

function updateGamesHeading(count) {
  const heading = document.querySelector('#games h2');
  if (!heading) return;

  heading.textContent = count > 0 ? `🎮 いま あそべるゲーム ${count}本` : '🎮 べつのゲームを みてみよう';
}

function renderRecommendationPanel(cards, age, subject) {
  const panel = document.getElementById('recommendPanel');
  const title = document.getElementById('recommendTitle');
  const note = document.getElementById('recommendNote');
  const list = document.getElementById('recommendList');

  if (!panel || !title || !note || !list) return;

  if (cards.length === 0) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;
  title.textContent = age === 'all' ? 'まよったら ここから' : `${AGE_LABELS[age] || 'みんな'}に おすすめ`;

  if (age === 'all' && subject === 'all') {
    note.textContent = 'まずは遊びやすい3つを先にならべています。';
  } else {
    note.textContent = `${AGE_LABELS[age] || 'みんな'} / ${SUBJECT_EMOJIS[subject] || '🌈'} ${SUBJECT_LABELS[subject] || 'ぜんぶ'} で選びやすい順です。`;
  }

  list.innerHTML = '';
  selectRecommendedCards(cards, age).forEach((card) => {
    list.appendChild(createRecommendationItem(card));
  });
}

function selectRecommendedCards(cards, age) {
  const priorities = AGE_RECOMMENDATIONS[age] || AGE_RECOMMENDATIONS.all;
  const used = new Set();
  const selected = [];

  priorities.forEach((slug) => {
    const card = cards.find((candidate) => getGameSlug(candidate) === slug);
    if (card && !used.has(card)) {
      used.add(card);
      selected.push(card);
    }
  });

  cards.forEach((card) => {
    if (selected.length >= 3 || used.has(card)) return;
    used.add(card);
    selected.push(card);
  });

  return selected.slice(0, 3);
}

function createRecommendationItem(card) {
  const link = document.createElement('a');
  link.className = 'recommend-item';
  link.href = card.getAttribute('href') || '#games';

  const emoji = document.createElement('span');
  emoji.className = 'recommend-item-emoji';
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = getCardEmoji(card);

  const body = document.createElement('span');
  body.className = 'recommend-item-body';

  const title = document.createElement('strong');
  title.textContent = getCardTitle(card);

  const reason = document.createElement('span');
  reason.textContent = getRecommendationReason(card);

  body.append(title, reason);

  const action = document.createElement('span');
  action.className = 'recommend-arrow';
  action.textContent = 'あそぶ';

  link.append(emoji, body, action);
  return link;
}

function getRecommendationReason(card) {
  const slug = getGameSlug(card);
  return RECOMMENDATION_REASONS[slug] || getCardDescription(card);
}

function renderEmptyState(cards, age, subject) {
  const emptyCard = document.getElementById('emptyStateCard');
  if (!emptyCard) return;

  emptyCard.hidden = cards.length > 0;
  if (cards.length > 0) return;

  const title = emptyCard.querySelector('.empty-collection-title');
  const text = emptyCard.querySelector('.empty-collection-text');
  const ageButton = emptyCard.querySelector('#reopenAgeBtn');

  const ageLabel = AGE_LABELS[age] || 'みんな';
  const subjectLabel = SUBJECT_LABELS[subject] || 'ジャンル';

  if (title) {
    title.textContent = age === 'all'
      ? `${subjectLabel} のゲームは ただいま じゅんびちゅう`
      : `${ageLabel}向けの ${subjectLabel} は じゅんびちゅう`;
  }

  if (text) {
    text.textContent = 'しぼりこみをもどすか、ねんれいを変えると、ほかのゲームがすぐ見つかります。';
  }

  if (ageButton) {
    ageButton.textContent = age === 'all' ? 'ねんれいを きめる' : 'ねんれいを えらびなおす';
  }
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navUl = document.querySelector('nav ul');
  if (!toggle || !navUl) return;

  if (!navUl.id) {
    navUl.id = 'site-menu';
  }

  toggle.setAttribute('aria-controls', navUl.id);
  toggle.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    navUl.classList.remove('open');
    toggle.textContent = '☰';
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = navUl.classList.toggle('open');
    toggle.textContent = isOpen ? '✕' : '☰';
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navUl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!navUl.classList.contains('open')) return;
    if (navUl.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navUl.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

/* --- Subject Filter (respects age gate) --- */
function initSubjectFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSubject(button.dataset.subject);

      const savedAge = getSelectedAge();
      if (typeof window.filterByAge === 'function') {
        window.filterByAge(savedAge);
      } else {
        refreshHomeCollections();
      }

      if (window.geroAudio && window.geroAudio.initialized) {
        window.geroAudio.playBoop();
      }
    });
  });
}

/* --- Card Click Effects --- */
function initCardEffects() {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      createConfetti(event.clientX, event.clientY);
      if (window.geroAudio && window.geroAudio.initialized) {
        window.geroAudio.playPop();
      }
    });
  });
}

/* --- Confetti Effect --- */
function createConfetti(x, y) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff69b4', '#a855f7'];

  for (let index = 0; index < 20; index += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 8 + 4}px`;
    piece.style.height = piece.style.width;

    const angle = (Math.random() * 360) * Math.PI / 180;
    const velocity = Math.random() * 200 + 100;
    piece.style.setProperty('--dx', `${Math.cos(angle) * velocity}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * velocity}px`);
    piece.style.animation = 'confettiBurst 0.8s ease-out forwards';

    container.appendChild(piece);
  }

  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confettiBurst {
        0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
        100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(720deg) scale(0); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 1000);
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach((element) => {
    observer.observe(element);
  });
}
