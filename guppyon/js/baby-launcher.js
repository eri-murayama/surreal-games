/* ============================================
   ゲロゲーロ学園 - Baby Game Launcher
   フルスクリーン起動 + 保護者ガイド
   ============================================ */

(function() {
  'use strict';

  // Only show launcher for baby/toddler games
  const isBabyGame = document.querySelector('meta[name="baby-game"]');
  if (!isBabyGame) return;

  // Create launcher overlay
  const launcher = document.createElement('div');
  launcher.id = 'baby-launcher';
  launcher.innerHTML = `
    <div class="bl-content">
      <div class="bl-mascot">🐸</div>
      <h1 class="bl-title">おうちの方へ</h1>
      <p class="bl-desc">
        このゲームは<strong>1〜3歳のお子さま向け</strong>です。<br>
        お子さまが安全に遊べるよう、以下をおすすめします。
      </p>

      <div class="bl-tips">
        <div class="bl-tip">
          <span class="bl-tip-icon">📱</span>
          <div>
            <strong>フルスクリーンで遊ぶ</strong>
            <p>ブラウザのボタンが消え、誤タップを防げます</p>
          </div>
        </div>
        <div class="bl-tip">
          <span class="bl-tip-icon">🔒</span>
          <div>
            <strong>画面ロックを使う</strong>
            <p>
              <span class="bl-os-ios">iPhone/iPad：アクセスガイド<br>（電源ボタン3回押し）</span>
              <span class="bl-os-android">Android：画面の固定<br>（設定→セキュリティ）</span>
            </p>
          </div>
        </div>
        <div class="bl-tip">
          <span class="bl-tip-icon">🐸</span>
          <div>
            <strong>終わるとき</strong>
            <p>右上のカエルを3回タップで戻れます</p>
          </div>
        </div>
      </div>

      <div class="bl-buttons">
        <button class="bl-btn bl-btn-fullscreen" id="blFullscreen">
          📺 フルスクリーンであそぶ
        </button>
        <button class="bl-btn bl-btn-normal" id="blNormal">
          そのままあそぶ
        </button>
      </div>

      <a href="../../safety-guide.html" class="bl-guide-link">
        📖 くわしい安全ガイドを見る
      </a>
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #baby-launcher {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #a8e6cf 0%, #88d8b0 50%, #ffd54f 100%);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      padding: 20px; overflow-y: auto;
      font-family: 'Zen Maru Gothic', sans-serif;
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    #baby-launcher.hide {
      opacity: 0; transform: scale(1.05); pointer-events: none;
    }
    .bl-content {
      background: white; border-radius: 30px; padding: 35px 30px;
      max-width: 500px; width: 100%; text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
    .bl-mascot { font-size: 4rem; margin-bottom: 5px; }
    .bl-title {
      font-family: 'Hachi Maru Pop', cursive;
      font-size: 1.5rem; color: #2e7d32; margin-bottom: 10px;
    }
    .bl-desc {
      font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 20px;
    }
    .bl-tips {
      text-align: left; display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 25px;
    }
    .bl-tip {
      display: flex; align-items: flex-start; gap: 12px;
      background: #f5f5f5; border-radius: 15px; padding: 12px 15px;
    }
    .bl-tip-icon { font-size: 1.8rem; flex-shrink: 0; margin-top: 2px; }
    .bl-tip strong { font-size: 0.9rem; color: #333; display: block; margin-bottom: 2px; }
    .bl-tip p { font-size: 0.78rem; color: #777; margin: 0; line-height: 1.5; }
    .bl-os-ios, .bl-os-android { display: none; }
    .bl-buttons {
      display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;
    }
    .bl-btn {
      padding: 16px 24px; border: none; border-radius: 20px;
      font-family: 'Zen Maru Gothic', sans-serif;
      font-size: 1.1rem; font-weight: 700; cursor: pointer;
      transition: all 0.3s ease;
    }
    .bl-btn:hover { transform: translateY(-2px); }
    .bl-btn:active { transform: translateY(0); }
    .bl-btn-fullscreen {
      background: linear-gradient(135deg, #4ecdc4, #2bbbad);
      color: white; box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
    }
    .bl-btn-normal {
      background: #f0f0f0; color: #666;
    }
    .bl-guide-link {
      font-size: 0.8rem; color: #4ecdc4; text-decoration: none;
    }
    .bl-guide-link:hover { text-decoration: underline; }
    @media (max-width: 480px) {
      .bl-content { padding: 25px 20px; }
      .bl-title { font-size: 1.3rem; }
      .bl-btn { font-size: 1rem; padding: 14px 20px; }
    }
  `;

  // Detect OS and show relevant tip
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);

  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(style);
    document.body.appendChild(launcher);

    // Show OS-specific tips
    if (isIOS) {
      launcher.querySelectorAll('.bl-os-ios').forEach(el => el.style.display = 'inline');
    } else if (isAndroid) {
      launcher.querySelectorAll('.bl-os-android').forEach(el => el.style.display = 'inline');
    } else {
      // Desktop: show both
      launcher.querySelectorAll('.bl-os-ios, .bl-os-android').forEach(el => el.style.display = 'inline');
    }

    // Fullscreen button
    document.getElementById('blFullscreen').addEventListener('click', () => {
      requestFullscreenSafe();
      closeLauncher();
    });

    // Normal button
    document.getElementById('blNormal').addEventListener('click', () => {
      closeLauncher();
    });

    // If Fullscreen API not supported, change button text
    if (!document.documentElement.requestFullscreen &&
        !document.documentElement.webkitRequestFullscreen) {
      const fsBtn = document.getElementById('blFullscreen');
      fsBtn.textContent = '📱 ホーム画面に追加するとフルスクリーンで遊べます';
      fsBtn.style.fontSize = '0.9rem';
    }
  });

  function closeLauncher() {
    // Init audio on user gesture
    if (window.geroAudio) {
      geroAudio.init();
      geroAudio.playBoop();
    }
    launcher.classList.add('hide');
    setTimeout(() => launcher.remove(), 500);
  }

  function requestFullscreenSafe() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) {
        el.requestFullscreen({ navigationUI: 'hide' });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen not available:', e);
    }

    // Also lock orientation if possible
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
    } catch (e) {}
  }
})();
