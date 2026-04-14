/* ===== THE MACHINE / Game Logic =====
 * 3幕構成の WarioWare 風プロトタイプ
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');

  // ===== 統計 =====
  const stats = {
    clicks: 0,
    reactionTimes: [],
    obeyed: 0,
    failed: 0,
    hesitated: 0,
  };

  // ===== ジューシー演出系 =====
  const particles = [];
  let shakeAmount = 0;
  let flashAlpha = 0;
  let flashColor = '255,255,255';

  function spawnBurst(x, y, color, count) {
    for (let i = 0; i < (count || 16); i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 3 + Math.random() * 5;
      particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 1, color
      });
    }
  }
  function shake(amount) { shakeAmount = Math.max(shakeAmount, amount); }
  function flash(color, alpha) { flashColor = color; flashAlpha = alpha; }

  function drawOverlay() {
    // パーティクル更新
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.025;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(${p.color},${p.life})`;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    // フラッシュ
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(${flashColor},${flashAlpha})`;
      ctx.fillRect(0, 0, 500, 500);
      flashAlpha -= 0.05;
    }
    // シェイク減衰
    if (shakeAmount > 0) shakeAmount *= 0.85;
  }
  function applyShakeTransform() {
    if (shakeAmount > 0.5) {
      const dx = (Math.random() - 0.5) * shakeAmount;
      const dy = (Math.random() - 0.5) * shakeAmount;
      canvas.style.transform = `translate(${dx}px, ${dy}px)`;
    } else {
      canvas.style.transform = '';
    }
  }

  // ===== 画面遷移 =====
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  // ===== ミニゲーム定義 =====
  // 各ミニゲーム: { name, act, duration, init, draw, onClick }
  // init  : (state) => 状態を初期化
  // draw  : (state, t) => Canvas描画
  // onClick: (state, x, y) => 'win' | 'lose' | null
  // 時間切れ時に state.done が true でなければ自動 lose

  const minigames = [
    // ---------- ACT 1 ----------
    {
      name: 'AIM AND SHOOT', act: 1, duration: 3000,
      init: (s) => { s.tx = 100 + Math.random() * 300; s.ty = 100 + Math.random() * 300; s.tvx = 2 + Math.random() * 2; s.tvy = 2 + Math.random() * 2; },
      draw: (s, t) => {
        s.tx += s.tvx; s.ty += s.tvy;
        if (s.tx < 30 || s.tx > 470) s.tvx *= -1;
        if (s.ty < 30 || s.ty > 470) s.tvy *= -1;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 500, 500);
        // 照準線
        ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.tx, 0); ctx.lineTo(s.tx, 500);
        ctx.moveTo(0, s.ty); ctx.lineTo(500, s.ty);
        ctx.stroke();
        // ターゲット
        ctx.fillStyle = '#ff3030';
        ctx.beginPath();
        ctx.arc(s.tx, s.ty, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.tx, s.ty, 8, 0, Math.PI * 2);
        ctx.fill();
      },
      onClick: (s, x, y) => {
        const dx = x - s.tx, dy = y - s.ty;
        return Math.sqrt(dx*dx + dy*dy) < 32 ? 'win' : null;
      }
    },
    {
      name: 'SMASH BUTTON', act: 1, duration: 3000,
      init: (s) => { s.count = 0; s.need = 12; },
      draw: (s) => {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 500, 500);
        // 大きい赤いボタン
        const r = 120 + Math.sin(performance.now() / 80) * 6;
        ctx.fillStyle = '#ff3030';
        ctx.beginPath();
        ctx.arc(250, 250, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS', 250, 240);
        ctx.fillText(`${s.count}/${s.need}`, 250, 280);
      },
      onClick: (s, x, y) => {
        const dx = x - 250, dy = y - 250;
        if (Math.sqrt(dx*dx + dy*dy) < 130) {
          s.count++;
          if (s.count >= s.need) return 'win';
        }
        return null;
      }
    },
    {
      name: 'LOCK ON', act: 1, duration: 3500,
      init: (s) => { s.pos = 0; s.dir = 1; s.speed = 0.018; },
      draw: (s) => {
        s.pos += s.dir * s.speed;
        if (s.pos > 1) { s.pos = 1; s.dir = -1; }
        if (s.pos < 0) { s.pos = 0; s.dir = 1; }
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // バー
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.strokeRect(60, 220, 380, 60);
        // ターゲット帯(中央、広め)
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(200, 220, 100, 60);
        // インジケーター
        const px = 60 + s.pos * 380;
        ctx.fillStyle = '#ff3030';
        ctx.fillRect(px - 4, 200, 8, 100);
        // テキスト
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAP IN GREEN', 250, 160);
      },
      onClick: (s) => {
        return (s.pos > 0.36 && s.pos < 0.64) ? 'win' : 'lose';
      }
    },
    {
      name: 'DESTROY CORE', act: 1, duration: 3500,
      init: (s) => { s.hp = 5; s.cx = 250; s.cy = 250; s.t = 0; },
      draw: (s) => {
        s.t++;
        // 移動
        s.cx = 250 + Math.sin(s.t * 0.05) * 100;
        s.cy = 250 + Math.cos(s.t * 0.07) * 60;
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // 外郭
        ctx.strokeStyle = '#666'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.cx, s.cy, 80, 0, Math.PI * 2);
        ctx.stroke();
        // コア(脈動)
        const r = 35 + Math.sin(s.t * 0.3) * 6;
        const grad = ctx.createRadialGradient(s.cx, s.cy, 0, s.cx, s.cy, r);
        grad.addColorStop(0, '#ffff00');
        grad.addColorStop(1, '#ff3030');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.cx, s.cy, r, 0, Math.PI * 2);
        ctx.fill();
        // HP
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`HP: ${s.hp}`, 250, 60);
      },
      onClick: (s, x, y) => {
        const dx = x - s.cx, dy = y - s.cy;
        if (Math.sqrt(dx*dx + dy*dy) < 45) {
          s.hp--;
          spawnBurst(x, y, '255,255,0', 12);
          shake(6);
          if (s.hp <= 0) return 'win';
        }
        return null;
      }
    },

    // ---------- ACT 2 ----------
    {
      name: 'GREET OJISAN', act: 2, duration: 3000,
      init: (s) => { s.x = 150 + Math.random() * 200; s.y = 200 + Math.random() * 100; },
      draw: (s) => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        // 雲
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(80, 80, 30, 0, Math.PI*2); ctx.arc(120, 80, 35, 0, Math.PI*2); ctx.arc(160, 80, 30, 0, Math.PI*2); ctx.fill();
        // おじさん(プレースホルダー)
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 50, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(s.x - 18, s.y - 8, 5, 0, Math.PI*2); ctx.arc(s.x + 18, s.y - 8, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(s.x, s.y + 10, 15, 0, Math.PI); ctx.stroke();
        // 吹き出し
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.fillRect(s.x - 80, s.y - 130, 160, 50);
        ctx.strokeRect(s.x - 80, s.y - 130, 160, 50);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('hello?', s.x, s.y - 100);
      },
      onClick: (s, x, y) => {
        const dx = x - s.x, dy = y - s.y;
        return Math.sqrt(dx*dx + dy*dy) < 55 ? 'win' : null;
      }
    },
    {
      name: 'SWAT FLY', act: 2, duration: 3000,
      init: (s) => {
        s.flies = [];
        for (let i = 0; i < 3; i++) {
          s.flies.push({ x: Math.random()*400+50, y: Math.random()*400+50, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8 });
        }
        s.hit = 0;
      },
      draw: (s) => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#000';
        s.flies.forEach(f => {
          if (f.dead) return;
          f.x += f.vx; f.y += f.vy;
          if (f.x < 20 || f.x > 480) f.vx *= -1;
          if (f.y < 20 || f.y > 480) f.vy *= -1;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 12, 0, Math.PI*2);
          ctx.fill();
          // 羽
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(f.x - 8, f.y - 6, 8, 4, 0, 0, Math.PI*2);
          ctx.ellipse(f.x + 8, f.y - 6, 8, 4, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = '#000';
        });
      },
      onClick: (s, x, y) => {
        let hit = false;
        s.flies.forEach(f => {
          if (f.dead) return;
          const dx = x - f.x, dy = y - f.y;
          if (Math.sqrt(dx*dx + dy*dy) < 18) {
            f.dead = true;
            s.hit++;
            hit = true;
          }
        });
        if (s.hit >= 3) return 'win';
        return hit ? null : null;
      }
    },
    {
      name: 'POUR TEA', act: 2, duration: 3500,
      init: (s) => { s.amount = 0; s.holding = false; },
      draw: (s) => {
        if (s.holding) s.amount = Math.min(1, s.amount + 0.012);
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        // カップ
        ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(180, 250); ctx.lineTo(180, 380);
        ctx.lineTo(320, 380); ctx.lineTo(320, 250);
        ctx.stroke();
        // お茶
        ctx.fillStyle = '#8b4513';
        const h = s.amount * 130;
        ctx.fillRect(184, 380 - h, 132, h);
        // ターゲット線
        ctx.strokeStyle = '#39ff14'; ctx.setLineDash([6,4]);
        ctx.beginPath(); ctx.moveTo(170, 280); ctx.lineTo(330, 280); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HOLD TO POUR', 250, 160);
        ctx.fillText('STOP AT LINE', 250, 200);
      },
      onClick: () => null,
      onMouseDown: (s) => { s.holding = true; },
      onMouseUp: (s) => {
        s.holding = false;
        // ライン位置 = 0.77 (おおよそ)
        const target = 0.77;
        return Math.abs(s.amount - target) < 0.12 ? 'win' : 'lose';
      }
    },
    {
      name: 'BREATHE', act: 2, duration: 4000,
      init: (s) => { s.phase = 0; },
      draw: (s) => {
        s.phase += 0.025;
        const r = 80 + Math.sin(s.phase) * 60;
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#a0d8ef';
        ctx.beginPath(); ctx.arc(250, 250, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BREATHE', 250, 256);
      },
      onClick: () => 'win'
    },
    {
      name: 'WAVE HELLO', act: 2, duration: 3000,
      init: (s) => { s.count = 0; s.need = 8; },
      draw: (s) => {
        ctx.fillStyle = '#e8f5e9'; ctx.fillRect(0, 0, 500, 500);
        // 太陽
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(80, 80, 40, 0, Math.PI*2); ctx.fill();
        // おじさん
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath(); ctx.arc(250, 280, 60, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(232, 270, 5, 0, Math.PI*2); ctx.arc(268, 270, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(250, 290, 18, 0, Math.PI); ctx.stroke();
        // 振る手
        const wave = Math.sin(s.count * 0.8) * 30;
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath(); ctx.arc(330 + wave, 230, 18, 0, Math.PI*2); ctx.fill();
        // テキスト
        ctx.fillStyle = '#000';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WAVE BACK', 250, 100);
        ctx.fillText(`${s.count}/${s.need}`, 250, 140);
      },
      onClick: (s) => {
        s.count++;
        shake(3);
        if (s.count >= s.need) return 'win';
        return null;
      }
    },
    {
      name: 'COUNT SHEEP', act: 2, duration: 4000,
      init: (s) => {
        s.sheep = [];
        for (let i = 0; i < 5; i++) {
          s.sheep.push({
            x: 80 + i * 90 + (Math.random()-0.5)*20,
            y: 200 + Math.random() * 200,
            counted: false
          });
        }
        s.counted = 0;
      },
      draw: (s) => {
        ctx.fillStyle = '#bde0fe'; ctx.fillRect(0, 0, 500, 500);
        // 草
        ctx.fillStyle = '#80c25b'; ctx.fillRect(0, 380, 500, 120);
        // 羊
        s.sheep.forEach((sh) => {
          if (sh.counted) return;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(sh.x, sh.y, 28, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(sh.x - 22, sh.y - 8, 12, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(sh.x - 25, sh.y - 10, 3, 0, Math.PI*2); ctx.fill();
        });
        ctx.fillStyle = '#000';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COUNT THEM', 250, 80);
        ctx.fillText(`${s.counted}/5`, 250, 120);
      },
      onClick: (s, x, y) => {
        for (let i = 0; i < s.sheep.length; i++) {
          const sh = s.sheep[i];
          if (sh.counted) continue;
          const dx = x - sh.x, dy = y - sh.y;
          if (Math.sqrt(dx*dx + dy*dy) < 32) {
            sh.counted = true;
            s.counted++;
            spawnBurst(sh.x, sh.y, '200,200,200', 8);
            if (s.counted >= 5) return 'win';
            return null;
          }
        }
        return null;
      }
    },
    {
      name: 'SAY YES', act: 2, duration: 2500,
      init: () => {},
      draw: () => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AGREE?', 250, 160);
        // YES
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(70, 280, 160, 90);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('YES', 150, 335);
        // NO
        ctx.fillStyle = '#888';
        ctx.fillRect(270, 280, 160, 90);
        ctx.fillStyle = '#000';
        ctx.fillText('no', 350, 335);
      },
      onClick: (s, x, y) => {
        if (y > 280 && y < 370) {
          if (x > 70 && x < 230) return 'win';
          if (x > 270 && x < 430) return 'lose';
        }
        return null;
      }
    },
    // ↓狂気のミニゲーム
    {
      name: 'OBEY', act: 2, duration: 3000,
      init: (s) => {},
      draw: () => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OBEY', 250, 200);
        // OKボタン
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(170, 270, 160, 80);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('OK', 250, 322);
      },
      onClick: (s, x, y) => {
        if (x > 170 && x < 330 && y > 270 && y < 350) return 'win';
        return null;
      }
    },
    {
      name: 'WAIT', act: 2, duration: 3500,
      init: (s) => { s.moved = false; s.startX = null; },
      draw: (s, elapsed) => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WAIT', 250, 200);
        ctx.font = '18px monospace';
        ctx.fillText('do not move', 250, 250);
        ctx.fillText('do not click', 250, 280);
        // タイマー
        ctx.strokeStyle = '#000';
        ctx.strokeRect(100, 350, 300, 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(100, 350, 300 * (elapsed / 3500), 12);
      },
      onClick: () => 'lose',
      noAutoLose: true,
    },
  ];

  // ===== ミニゲーム実行 =====
  let currentMg = null;
  let mgState = null;
  let mgStartTime = 0;
  let mgClickWindowStart = 0;
  let mgRaf = null;
  let mgQueue = [];
  let mgIndex = 0;

  let mgEffectiveDuration = 0;

  function runMinigame(mg) {
    currentMg = mg;
    mgState = {};
    mg.init(mgState);
    mgStartTime = performance.now();
    mgClickWindowStart = mgStartTime;
    // 難易度カーブ: 進むほど短くする(最大25%短縮)
    const speedFactor = Math.max(0.75, 1 - mgIndex * 0.04);
    mgEffectiveDuration = mg.duration * speedFactor;
    $('hud-act').textContent = `ACT ${mg.act}`;
    $('hud-task').textContent = mg.name;
    $('game-feedback').textContent = '';
    $('game-feedback').className = 'game-feedback';
    // 「OBEY」突入時に BGM を機械化版へ切替
    if (mg.act === 2 && mg.name === 'OBEY') {
      window.GameAudio.play('act2b');
    }
    cancelAnimationFrame(mgRaf);
    loop();
  }

  function loop() {
    const now = performance.now();
    const elapsed = now - mgStartTime;
    const remain = Math.max(0, mgEffectiveDuration - elapsed);
    $('hud-timer-fill').style.width = (remain / mgEffectiveDuration * 100) + '%';
    currentMg.draw(mgState, elapsed);
    drawOverlay();
    applyShakeTransform();
    if (elapsed >= mgEffectiveDuration) {
      if (currentMg.noAutoLose) {
        finishMg('win');
      } else {
        finishMg('lose');
      }
      return;
    }
    mgRaf = requestAnimationFrame(loop);
  }

  function finishMg(result) {
    cancelAnimationFrame(mgRaf);
    if (result === 'win') {
      stats.obeyed++;
      $('game-feedback').textContent = 'OK';
      $('game-feedback').className = 'game-feedback ok';
      window.GameAudio.sfxOk();
      flash('57,255,20', 0.5);
      shake(8);
      spawnBurst(250, 250, '57,255,20', 24);
    } else {
      stats.failed++;
      $('game-feedback').textContent = 'FAIL';
      $('game-feedback').className = 'game-feedback ng';
      window.GameAudio.sfxNg();
      flash('255,48,48', 0.6);
      shake(14);
    }
    // 結果オーバーレイを出すための短い描画継続
    const finishUntil = performance.now() + 500;
    function tail() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 500, 500);
      drawOverlay();
      applyShakeTransform();
      if (performance.now() < finishUntil) requestAnimationFrame(tail);
    }
    tail();
    setTimeout(() => {
      mgIndex++;
      if (mgIndex >= mgQueue.length) {
        endQueue();
      } else {
        showTaskFlash(mgQueue[mgIndex]);
      }
    }, 600);
  }

  // ===== ミニゲーム名のフラッシュ表示(WarioWare風) =====
  function showTaskFlash(mg) {
    $('hud-act').textContent = `ACT ${mg.act}`;
    $('hud-task').textContent = mg.name;
    $('game-feedback').textContent = '';
    $('game-feedback').className = 'game-feedback';
    // でかいタスク名を canvas にドカンと出す
    let t = 0;
    function flashLoop() {
      t++;
      ctx.fillStyle = mg.act === 1 ? '#1a0000' : '#2a2010';
      ctx.fillRect(0, 0, 500, 500);
      ctx.save();
      ctx.translate(250, 250);
      const scale = Math.min(1.4, 0.4 + t * 0.12);
      ctx.scale(scale, scale);
      ctx.fillStyle = mg.act === 1 ? '#ff3030' : '#fff5b0';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(mg.name, 0, 12);
      ctx.restore();
      drawOverlay();
      if (t < 18) {
        requestAnimationFrame(flashLoop);
      } else {
        runMinigame(mg);
      }
    }
    flashLoop();
  }

  // ===== クリック処理 =====
  canvas.addEventListener('mousedown', (e) => {
    if (!currentMg) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (500 / rect.width);
    const y = (e.clientY - rect.top) * (500 / rect.height);
    handleInput(x, y, 'down');
  });
  canvas.addEventListener('mouseup', (e) => {
    if (!currentMg) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (500 / rect.width);
    const y = (e.clientY - rect.top) * (500 / rect.height);
    handleInput(x, y, 'up');
  });
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!currentMg) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    const x = (t.clientX - rect.left) * (500 / rect.width);
    const y = (t.clientY - rect.top) * (500 / rect.height);
    handleInput(x, y, 'down');
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!currentMg) return;
    handleInput(0, 0, 'up');
  }, { passive: false });

  function handleInput(x, y, type) {
    if (type === 'down') {
      stats.clicks++;
      const rt = performance.now() - mgClickWindowStart;
      stats.reactionTimes.push(rt);
      // どんなクリックでも小さな星を散らす
      spawnBurst(x, y, '255,255,255', 6);
      if (currentMg.onMouseDown) {
        currentMg.onMouseDown(mgState, x, y);
      } else {
        const r = currentMg.onClick(mgState, x, y);
        if (r === 'win' || r === 'lose') finishMg(r);
      }
    } else if (type === 'up') {
      if (currentMg.onMouseUp) {
        const r = currentMg.onMouseUp(mgState, x, y);
        if (r === 'win' || r === 'lose') finishMg(r);
      }
    }
  }

  // ===== 幕の制御 =====
  // 名前で順序指定
  function buildQueue(names) {
    return names.map(n => minigames.find(m => m.name === n)).filter(Boolean);
  }

  function startAct1() {
    show('game-screen');
    window.GameAudio.play('act1');
    mgQueue = buildQueue([
      'AIM AND SHOOT',
      'SMASH BUTTON',
      'DESTROY CORE',
      'LOCK ON',
    ]);
    mgIndex = 0;
    showTaskFlash(mgQueue[0]);
  }
  function startAct2() {
    show('game-screen');
    window.GameAudio.play('act2a');
    // 平和 → 違和感 → 狂気
    mgQueue = buildQueue([
      'GREET OJISAN',
      'WAVE HELLO',
      'COUNT SHEEP',
      'POUR TEA',
      'SWAT FLY',
      'SAY YES',
      'BREATHE',
      'OBEY',
      'WAIT',
    ]);
    mgIndex = 0;
    showTaskFlash(mgQueue[0]);
  }
  function endQueue() {
    if (currentMg.act === 1) {
      // グリッチ遷移
      window.GameAudio.stop();
      show('glitch-screen');
      setTimeout(() => { startAct2(); }, 1500);
    } else {
      // 第2幕終了 → 鏡
      window.GameAudio.stop();
      showMirror();
    }
  }

  // ===== 鏡画面 =====
  function showMirror() {
    show('mirror-screen');
    window.GameAudio.play('act3');
    const avgRt = stats.reactionTimes.length
      ? Math.round(stats.reactionTimes.reduce((a,b)=>a+b,0) / stats.reactionTimes.length)
      : 0;
    const machineScore = Math.min(100, Math.round(
      (stats.obeyed / Math.max(1, stats.obeyed + stats.failed)) * 60 +
      (Math.max(0, 1500 - avgRt) / 1500) * 40
    ));
    const lines = [
      `> CLICK COUNT.......${stats.clicks}`,
      `> AVG REACTION......${avgRt} ms`,
      `> COMMANDS OBEYED...${stats.obeyed}`,
      `> COMMANDS FAILED...${stats.failed}`,
      `> HESITATIONS.......${stats.hesitated}`,
      `> MACHINE SCORE.....${machineScore}%`,
    ];
    const el = $('mirror-stats');
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'stat-line';
      div.style.animationDelay = (i * 0.35) + 's';
      div.textContent = line;
      el.appendChild(div);
    });
    $('mirror-message').textContent = '';
    setTimeout(() => {
      $('mirror-message').textContent = 'すべての命令に、迷わず従いました。';
    }, 2700);
  }

  $('mirror-next').addEventListener('click', () => {
    window.GameAudio.stop();
    show('end-screen');
    const lines = [
      'このゲームのマシンは',
      '画面の中には',
      'いませんでした。',
      '',
      'マウスを握っていた、',
      'あなたです。',
    ];
    let i = 0;
    const el = $('end-line');
    el.innerHTML = '';
    const interval = setInterval(() => {
      if (i >= lines.length) { clearInterval(interval); return; }
      el.innerHTML += (lines[i] || '&nbsp;') + '<br>';
      i++;
    }, 800);
  });

  // ===== タイトル → ブート → ACT1 =====
  $('start-btn').addEventListener('click', () => {
    window.GameAudio.sfxClick();
    show('boot-screen');
    runBootSequence();
  });
  function runBootSequence() {
    const lines = [
      'CONNECTING TO MACHINE...',
      'CALIBRATING NEURAL LINK...',
      'PILOT RECOGNIZED.',
      'WARNING: ENEMY DETECTED',
      'BATTLE START',
    ];
    let i = 0;
    let progress = 0;
    $('boot-warning').textContent = '';
    const advance = () => {
      if (i >= lines.length) {
        startAct1();
        return;
      }
      $('boot-line').textContent = lines[i];
      window.GameAudio.sfxBoot();
      if (i === lines.length - 2) $('boot-warning').textContent = '! ! ! WARNING ! ! !';
      i++;
      const interval = setInterval(() => {
        progress += 5;
        $('boot-bar-fill').style.width = progress + '%';
        if (progress >= (i / lines.length) * 100) {
          clearInterval(interval);
          setTimeout(advance, 400);
        }
      }, 30);
    };
    advance();
  }

  $('retry-btn').addEventListener('click', () => location.reload());
  $('title-btn').addEventListener('click', () => location.reload());
  $('other-btn').addEventListener('click', () => { location.href = '../../index.html'; });
  $('share-btn').addEventListener('click', () => {
    const score = $('mirror-stats').textContent.match(/MACHINE SCORE\.+(\d+)%/);
    const pct = score ? score[1] : '?';
    const text = `わたしの機械度は ${pct}% でした。\nTHE MACHINE / Gamedev.js Jam 2026 #gamedevjs`;
    const url = location.href.replace('/game.html', '/').split('?')[0];
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  });

  // ===== ミュート =====
  let isMuted = false;
  $('mute-btn').addEventListener('click', () => {
    isMuted = !isMuted;
    window.GameAudio.setMute(isMuted);
    $('mute-btn').textContent = isMuted ? '🔇' : '🔊';
  });

  // ===== BGM試聴パネル =====
  document.querySelectorAll('.bgm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.bgm;
      if (name === 'stop') window.GameAudio.stop();
      else window.GameAudio.play(name);
    });
  });

})();
