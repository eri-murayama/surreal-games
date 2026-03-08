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
