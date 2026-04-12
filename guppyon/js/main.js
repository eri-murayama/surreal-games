/* ============================================
   ゲロゲーロ学園 - メインJavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSubjectFilter();
  initCardEffects();
  initScrollAnimations();
});

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navUl = document.querySelector('nav ul');
  if (!toggle || !navUl) return;

  toggle.addEventListener('click', () => {
    navUl.classList.toggle('open');
    toggle.textContent = navUl.classList.contains('open') ? '✕' : '☰';
  });

  navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navUl.classList.remove('open');
      toggle.textContent = '☰';
    });
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
      const savedAge = localStorage.getItem('gero-age') || 'all';
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
