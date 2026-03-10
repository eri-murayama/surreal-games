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
    chara.classList.add('jumpscare');
    // 0.6秒で元に戻す
    setTimeout(() => {
      chara.classList.remove('jumpscare');
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
