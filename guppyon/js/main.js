/* ============================================
   ゲロゲーロ学園 - メインJavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHomeSimplification();
  initMobileMenu();
  initSubjectFilter();
  initCardEffects();
  initScrollAnimations();
});

/* --- Homepage Simplification --- */
function initHomeSimplification() {
  const homeMenu = document.querySelector('#site-menu');
  const gamesSection = document.querySelector('#games');
  if (!homeMenu || !gamesSection) return;

  const gamesLink = homeMenu.querySelector('a[href="#games"]');
  const aboutLink = homeMenu.querySelector('a[href="#about"]');
  const parentsLink = homeMenu.querySelector('a[href="#parents"]');
  if (gamesLink) gamesLink.innerHTML = '<span class="nav-emoji" aria-hidden="true">🎮</span>ゲーム';
  if (aboutLink) aboutLink.innerHTML = '<span class="nav-emoji" aria-hidden="true">✨</span>あそびかた';
  if (parentsLink) parentsLink.innerHTML = '<span class="nav-emoji" aria-hidden="true">👨‍👩‍👧</span>おうちの方へ';

  const heroTitle = document.querySelector('.hero h1');
  const heroSpeech = document.querySelector('.hero-speech');
  const heroBadges = document.querySelector('.hero-badges');
  if (heroTitle) heroTitle.textContent = 'ゲロゲーロ学園';
  if (heroSpeech) {
    heroSpeech.innerHTML = '<p><strong>すきなゲームを えらんで、すぐ あそぼう！</strong><br>むずかしいことは ぬき。タッチして、わらって、<em>できた！</em>が うれしい学園です。</p>';
  }
  if (heroBadges) {
    heroBadges.innerHTML = [
      '<span class="badge badge-free">🆓 ぜんぶ無料</span>',
      '<span class="badge badge-safe">🔒 あんしん設計</span>',
      '<span class="badge badge-fun">👶 1さいからOK</span>',
      '<span class="badge badge-safe">📖 おうちの方向け案内あり</span>'
    ].join('');
  }

  const stats = document.querySelector('.stats-bar');
  if (stats) {
    stats.innerHTML = [
      '<div class="stat-item">🎮 ゲーム <span class="stat-number">16</span>本</div>',
      '<div class="stat-item">👶 対象 <span class="stat-number">1</span>さい〜</div>',
      '<div class="stat-item">✨ すぐ <span class="stat-number">あそべる</span></div>'
    ].join('');
  }

  const filters = document.getElementById('filters');
  if (filters && !document.querySelector('.filter-helper')) {
    const helper = document.createElement('p');
    helper.className = 'filter-helper fade-in-up delay-3';
    helper.innerHTML = 'まよったら <strong>NEW!</strong> からどうぞ。きになるジャンルだけ みることも できます。';
    filters.parentNode.insertBefore(helper, filters);
  }

  const filterLabels = {
    all: '🎯 ぜんぶ',
    touch: '👶 タッチあそび',
    math: '🔢 さんすう',
    japanese: '🇯🇵 こくご',
    english: '🔤 えいご',
    brain: '🧠 のうトレ'
  };
  document.querySelectorAll('.filter-btn').forEach((button) => {
    const subject = button.dataset.subject;
    if (filterLabels[subject]) button.textContent = filterLabels[subject];
  });

  const aboutCard = document.querySelector('#about .about-card');
  if (aboutCard) {
    aboutCard.innerHTML = `
      <h2>✨ あそびかた</h2>
      <p class="about-lead">
        やることは かんたん。<strong>えらぶ → タッチ → できた！</strong> の 3ステップです。<br>
        ちいさい子でも まよいにくく、にこっと 楽しめる つくりを 目指しています。
      </p>
      <div class="about-features about-steps">
        <div class="about-feature">
          <div class="feature-icon">🎈</div>
          <h3>えらぶ</h3>
          <p>気になるゲームを ひとつ タップ。説明は できるだけ かんたんにしています。</p>
        </div>
        <div class="about-feature">
          <div class="feature-icon">👆</div>
          <h3>さわる</h3>
          <p>タッチ中心で すぐ遊べるゲームを たくさん用意。できた！ が すぐ返ってきます。</p>
        </div>
        <div class="about-feature">
          <div class="feature-icon">🌟</div>
          <h3>もういちど</h3>
          <p>ほめられて、もう一回やりたくなる流れを大切にしています。音は いつでも OFF にできます。</p>
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
        このサイトは 子どもが ぱっと遊べることを優先しています。<br>
        そのうえで、保護者の方が <strong>安全性や保存される情報を確認できる詳しいページ</strong> を しっかり用意しています。
      </p>
      <div class="parent-links" aria-label="保護者向け詳細ページ">
        <a href="safety-guide.html" class="parent-link-card">
          <span class="parent-link-title">📖 安全ガイド</span>
          <span class="parent-link-note">スマホやタブレットを安全に渡す設定を、手順つきで案内します。</span>
        </a>
        <a href="privacy.html" class="parent-link-card">
          <span class="parent-link-title">🔒 プライバシー</span>
          <span class="parent-link-note">保存する情報、シェア機能、個人情報の扱いを確認できます。</span>
        </a>
        <a href="#games" class="parent-link-card">
          <span class="parent-link-title">🎮 年齢にあわせて選ぶ</span>
          <span class="parent-link-note">1さい〜大人向けまで、年齢の目安つきでゲームを選べます。</span>
        </a>
      </div>
      <p class="parent-mini-note">子どもにはシンプルに。大人には必要な説明をきちんと。そんなバランスで整えています。</p>
    `;
  }

  const footer = document.querySelector('.site-footer');
  if (footer) {
    const footerMascot = footer.querySelector('.footer-mascot');
    const footerTexts = footer.querySelectorAll('p');
    const footerLinks = footer.querySelector('.footer-links');
    if (footerMascot) footerMascot.textContent = '🐸';
    if (footerTexts[0]) footerTexts[0].textContent = 'ゲロゲーロ学園｜1さいからあそべる子ども向け無料ゲーム';
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

  navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
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
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Re-run filterByAge which now also respects subject
      let savedAge = 'all';
      try {
        savedAge = localStorage.getItem('gero-age') || 'all';
      } catch (e) {}
      if (typeof filterByAge === 'function') {
        filterByAge(savedAge);
      }

      // Play click sound
      if (window.geroAudio && window.geroAudio.initialized) {
        geroAudio.playBoop();
      }
    });
  });
}

/* --- Card Click Effects --- */
function initCardEffects() {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      createConfetti(e.clientX, e.clientY);
      if (window.geroAudio && window.geroAudio.initialized) {
        geroAudio.playPop();
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

  for (let i = 0; i < 20; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = x + 'px';
    piece.style.top = y + 'px';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 4) + 'px';
    piece.style.height = piece.style.width;

    const angle = (Math.random() * 360) * Math.PI / 180;
    const velocity = Math.random() * 200 + 100;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    piece.style.setProperty('--dx', dx + 'px');
    piece.style.setProperty('--dy', dy + 'px');
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
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
  });
}
