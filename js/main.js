// ========================================
// シュールゲームス - メインスクリプト
// ========================================

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
