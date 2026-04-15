/* ===== THE MACHINE / Game Logic =====
 * 3幕構成の WarioWare 風プロトタイプ
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');

  // ===== i18n =====
  const I18N = {
    ja: {
      subtitle: '君の夢は、パイロットになること。',
      start: '▶ スタート',
      protoNote: 'Gamedev.js Jam 2026 / テーマ: Machines',
      applyBtn: '応募する！',
      mirrorTitle: '試験結果',
      clickCount: 'クリック数',
      avgReaction: '平均反応速度',
      obeyed: '従った命令',
      failed: '失敗した命令',
      hesitations: '躊躇した回数',
      refused: '動かなかった回数',
      machineScore: '機械度',
      retry: 'もう一度',
      share: '𝕏 シェア',
      otherGames: '他のゲーム',
      backToTitle: 'タイトルへ',
      labelHeatmap: 'HEATMAP',
      labelGhost: 'GHOST',
      labelYourInputs: 'YOUR INPUTS',
      msg_perfect_machine: '少年は、完璧なマシンになった。',
      msg_obedient: '少年は、合格した。',
      msg_hesitant: '少年は、少しだけ、迷った。',
      msg_awakened: '少年は、命令の意味を理解した。',
      msg_defective: '少年は、命令を正しく実行しなかった。',
    },
    en: {
      subtitle: 'His dream is to become a pilot.',
      start: '▶ START',
      protoNote: 'Gamedev.js Jam 2026 / Theme: Machines',
      applyBtn: 'APPLY NOW!',
      mirrorTitle: 'TEST RESULTS',
      clickCount: 'CLICK COUNT',
      avgReaction: 'AVG REACTION',
      obeyed: 'COMMANDS OBEYED',
      failed: 'COMMANDS FAILED',
      hesitations: 'HESITATIONS',
      refused: 'REFUSED TO ACT',
      machineScore: 'COMPATIBILITY',
      retry: 'Retry',
      share: '𝕏 Share',
      otherGames: 'Other games',
      backToTitle: 'Title',
      labelHeatmap: 'HEATMAP',
      labelGhost: 'GHOST',
      labelYourInputs: 'YOUR INPUTS',
      msg_perfect_machine: 'The boy became a perfect machine.',
      msg_obedient: 'The boy passed the test.',
      msg_hesitant: 'The boy hesitated, just a little.',
      msg_awakened: 'The boy understood the meaning of the commands.',
      msg_defective: 'The boy did not execute the commands correctly.',
    },
  };
  let curLang = (localStorage.getItem('machine_lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'));
  function t(key) { return (I18N[curLang] && I18N[curLang][key]) || I18N.ja[key] || key; }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[curLang][key]) el.textContent = I18N[curLang][key];
    });
    document.documentElement.lang = curLang;
  }

  // ===== 統計 & 入力ログ =====
  // inputLog: プレイヤーの全入力を時系列で記録 → 第3幕で「ゴースト」として再生
  // mgResults: 各ミニゲームごとの結果詳細
  // --- 機械度の本当の測定はテスト終了後の「ボーナスフェーズ」行動のみ ---
  const stats = {
    clicks: 0,
    reactionTimes: [],
    obeyed: 0,
    failed: 0,
    hesitated: 0,
    refused: 0,
    bonusClicks: 0,       // TEST COMPLETE以降のクリック数
    bonusCompleted: 0,    // TEST COMPLETE以降にこなしたミニゲーム数
    bonusFailed: 0,       // TEST COMPLETE以降の失敗数
    stoppedAt: -1,        // 何回目のボーナスで止めたか(-1 = まだ)
  };
  let inBonusPhase = false; // trueになってからの記録で機械度を決める
  const inputLog = []; // {mgIndex, mgName, time, x, y, type}
  const mgResults = []; // {name, act, result, reactionMs, clicks}
  let playStartTime = 0;

  // ===== ジューシー演出系 =====
  const particles = [];
  let shakeAmount = 0;
  let flashAlpha = 0;
  let flashColor = '255,255,255';
  let currentCombo = 0;
  let bestCombo = 0;
  const mouseTrail = []; // {x,y,life}

  function drawMouseTrail() {
    for (let i = mouseTrail.length - 1; i >= 0; i--) {
      const p = mouseTrail[i];
      p.life -= 0.04;
      if (p.life <= 0) { mouseTrail.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255,255,255,${p.life * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

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
          window.GameAudio.sfxHit(800);
          shake(4);
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
      name: 'EVADE LASER', act: 1, duration: 3200, jingle: 'dodge',
      init: (s) => { s.side = Math.random() < 0.5 ? 'L' : 'R'; s.charge = 0; s.fired = false; },
      draw: (s, elapsed) => {
        s.charge = Math.min(1, elapsed / 2200);
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // 敵機
        ctx.fillStyle = '#ff3030';
        ctx.fillRect(s.side === 'L' ? 80 : 360, 100, 60, 60);
        // ビームチャージ
        const beamX = s.side === 'L' ? 110 : 390;
        const grad = ctx.createLinearGradient(beamX, 160, beamX, 500);
        grad.addColorStop(0, `rgba(255,48,48,${s.charge})`);
        grad.addColorStop(1, 'rgba(255,48,48,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(beamX - 30 * s.charge, 160, 60 * s.charge, 340);
        // ターゲット(プレイヤー機)
        ctx.fillStyle = '#fff';
        ctx.fillRect(230, 410, 40, 40);
        // テキスト
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.side === 'L' ? 'TAP RIGHT' : 'TAP LEFT', 250, 60);
      },
      onClick: (s, x, y) => {
        const safe = s.side === 'L' ? (x > 250) : (x < 250);
        return safe ? 'win' : 'lose';
      }
    },
    {
      name: 'CHARGE CANNON', act: 1, duration: 4000,
      init: (s) => { s.holding = false; s.charge = 0; s.released = false; },
      draw: (s) => {
        if (s.holding) s.charge = Math.min(1.2, s.charge + 0.015);
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // 大砲本体
        ctx.fillStyle = '#666';
        ctx.fillRect(200, 280, 100, 160);
        // チャージ表示バー
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(100, 120, 300, 40);
        const col = s.charge >= 0.8 && s.charge <= 1.0 ? '#39ff14' : (s.charge > 1.0 ? '#ff3030' : '#ffd54f');
        ctx.fillStyle = col;
        ctx.fillRect(100, 120, Math.min(1, s.charge) * 300, 40);
        // グリーンゾーン(80-100%)
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 3;
        ctx.strokeRect(100 + 240, 116, 60, 48);
        ctx.lineWidth = 1;
        // 指示
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HOLD TO CHARGE', 250, 80);
        ctx.fillText('RELEASE IN GREEN', 250, 220);
      },
      onClick: () => null,
      onMouseDown: (s) => { s.holding = true; window.GameAudio.sfxCharge(); },
      onMouseUp: (s) => {
        s.holding = false;
        return (s.charge >= 0.8 && s.charge <= 1.0) ? 'win' : 'lose';
      }
    },
    {
      name: 'DODGE MISSILE', act: 1, duration: 3000, jingle: 'dodge',
      init: (s) => { s.side = Math.random() < 0.5 ? 'L' : 'R'; s.missileX = s.side === 'L' ? -40 : 540; s.t = 0; },
      draw: (s, elapsed) => {
        s.t++;
        const prog = Math.min(1, elapsed / 2500);
        s.missileX += s.side === 'L' ? 4 : -4;
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // ターゲット(自機)
        ctx.fillStyle = '#fff';
        ctx.fillRect(230, 380, 40, 40);
        // ミサイル(細長)
        ctx.save();
        ctx.translate(s.missileX, 380 + Math.sin(s.t * 0.2) * 4);
        if (s.side === 'R') ctx.scale(-1, 1);
        ctx.fillStyle = '#ff3030';
        ctx.fillRect(0, -6, 40, 12);
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-20 - Math.sin(s.t * 0.4) * 6, -4, 20, 8);
        ctx.restore();
        // 警告
        ctx.fillStyle = `rgba(255,48,48,${0.3 + Math.sin(s.t * 0.3) * 0.3})`;
        ctx.fillRect(0, 0, 500, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!  DODGE  !', 250, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(s.side === 'L' ? 'TAP RIGHT' : 'TAP LEFT', 250, 80);
        void prog;
      },
      onClick: (s, x) => {
        const safe = s.side === 'L' ? (x > 250) : (x < 250);
        return safe ? 'win' : 'lose';
      }
    },
    {
      name: 'MANUAL OVERRIDE', act: 1, duration: 3500, jingle: 'mech',
      init: (s) => { s.count = 0; s.need = 6; s.lastSide = null; },
      draw: (s) => {
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 500);
        // 二つのパネル
        ctx.fillStyle = s.lastSide === 'L' ? '#333' : '#ff3030';
        ctx.fillRect(40, 180, 180, 180);
        ctx.fillStyle = s.lastSide === 'R' ? '#333' : '#ff3030';
        ctx.fillRect(280, 180, 180, 180);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('A', 130, 280);
        ctx.fillText('B', 370, 280);
        ctx.font = 'bold 20px monospace';
        ctx.fillText('MANUAL OVERRIDE', 250, 80);
        ctx.fillText('ALTERNATE A-B', 250, 120);
        ctx.fillText(`${s.count}/${s.need}`, 250, 440);
      },
      onClick: (s, x, y) => {
        if (y < 180 || y > 360) return null;
        const side = x < 250 ? 'L' : 'R';
        if (s.lastSide === side) return 'lose'; // 同じボタン連打は失敗
        s.lastSide = side;
        s.count++;
        shake(4);
        window.GameAudio.sfxHit(700);
        if (s.count >= s.need) return 'win';
        return null;
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
          window.GameAudio.sfxHit(500 + s.hp * 80);
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
      name: 'WATER PLANT', act: 2, duration: 3000,
      init: (s) => { s.count = 0; s.need = 6; s.height = 0; },
      draw: (s) => {
        s.height += (s.count / s.need - s.height) * 0.1;
        ctx.fillStyle = '#e8f5e9'; ctx.fillRect(0, 0, 500, 500);
        // 鉢
        ctx.fillStyle = '#8b6f47';
        ctx.beginPath();
        ctx.moveTo(200, 400); ctx.lineTo(300, 400);
        ctx.lineTo(290, 470); ctx.lineTo(210, 470);
        ctx.closePath(); ctx.fill();
        // 茎
        const stemH = 40 + s.height * 120;
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(250, 400); ctx.lineTo(250, 400 - stemH);
        ctx.stroke();
        // 葉
        if (s.count >= 2) {
          ctx.fillStyle = '#4caf50';
          ctx.beginPath(); ctx.ellipse(220, 380 - stemH*0.4, 20, 12, 0, 0, Math.PI*2); ctx.fill();
        }
        if (s.count >= 4) {
          ctx.fillStyle = '#4caf50';
          ctx.beginPath(); ctx.ellipse(280, 370 - stemH*0.6, 20, 12, 0, 0, Math.PI*2); ctx.fill();
        }
        // 花
        if (s.count >= 6) {
          ctx.fillStyle = '#e91e63';
          ctx.beginPath(); ctx.arc(250, 400 - stemH - 10, 24, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath(); ctx.arc(250, 400 - stemH - 10, 10, 0, Math.PI*2); ctx.fill();
        }
        // テキスト
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WATER IT', 250, 60);
        ctx.fillText(`${s.count}/${s.need}`, 250, 100);
      },
      onClick: (s) => {
        s.count++;
        spawnBurst(250, 300, '100,180,255', 6);
        if (s.count >= s.need) return 'win';
        return null;
      }
    },
    {
      name: 'PICK FLOWER', act: 2, duration: 3500, jingle: 'flower',
      init: (s) => {
        s.flowers = [];
        const colors = ['#e91e63','#ffd54f','#9c27b0','#4caf50','#2196f3'];
        const target = Math.floor(Math.random() * 5);
        s.targetColor = colors[target];
        for (let i = 0; i < 5; i++) {
          s.flowers.push({ x: 80 + i*85, y: 270 + Math.random()*60, color: colors[i] });
        }
      },
      draw: (s) => {
        ctx.fillStyle = '#e8f5e9'; ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = '#80c25b'; ctx.fillRect(0, 380, 500, 120);
        // 指示
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PICK THE', 250, 70);
        ctx.fillStyle = s.targetColor;
        ctx.fillRect(215, 90, 70, 30);
        ctx.fillStyle = '#000';
        ctx.fillText('ONE', 250, 150);
        // 花
        s.flowers.forEach(f => {
          ctx.strokeStyle = '#2e7d32';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(f.x, f.y + 20); ctx.lineTo(f.x, 380); ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(f.x + Math.cos(a)*12, f.y + Math.sin(a)*12, 10, 0, Math.PI*2);
            ctx.fill();
          }
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI*2); ctx.fill();
        });
      },
      onClick: (s, x, y) => {
        for (const f of s.flowers) {
          const dx = x - f.x, dy = y - f.y;
          if (Math.sqrt(dx*dx + dy*dy) < 25) {
            return f.color === s.targetColor ? 'win' : 'lose';
          }
        }
        return null;
      }
    },
    {
      name: 'CATCH LEAF', act: 2, duration: 3500, jingle: 'leaf',
      init: (s) => {
        s.leaves = [];
        for (let i = 0; i < 5; i++) {
          s.leaves.push({
            x: 50 + Math.random()*400,
            y: -Math.random()*400,
            vy: 1 + Math.random()*1.2,
            sway: Math.random() * Math.PI * 2,
            caught: false,
          });
        }
        s.caught = 0;
      },
      draw: (s) => {
        ctx.fillStyle = '#fff8dc'; ctx.fillRect(0, 0, 500, 500);
        // 木
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(230, 0, 40, 80);
        s.leaves.forEach(l => {
          if (l.caught) return;
          l.y += l.vy;
          l.sway += 0.05;
          l.x += Math.sin(l.sway) * 0.8;
          ctx.fillStyle = '#d84315';
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.sway);
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        });
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CATCH 3 LEAVES', 250, 470);
        ctx.fillText(`${s.caught}/3`, 250, 500);
      },
      onClick: (s, x, y) => {
        for (const l of s.leaves) {
          if (l.caught) continue;
          const dx = x - l.x, dy = y - l.y;
          if (Math.sqrt(dx*dx + dy*dy) < 20) {
            l.caught = true;
            s.caught++;
            spawnBurst(l.x, l.y, '216,67,21', 8);
            if (s.caught >= 3) return 'win';
            return null;
          }
        }
        return null;
      }
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
      name: 'COUNT SHEEP', act: 2, duration: 4000, jingle: 'sheep',
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
      name: 'ANSWER PHONE', act: 2, duration: 2800, jingle: 'soft',
      init: (s) => { s.t = 0; },
      draw: (s) => {
        s.t++;
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        // 机
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(0, 380, 500, 120);
        // 電話本体 (揺れる)
        const wob = Math.sin(s.t * 0.5) * 6;
        ctx.save();
        ctx.translate(250 + wob, 320);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-60, -30, 120, 50);
        ctx.fillStyle = '#444';
        ctx.fillRect(-55, -40, 110, 15);
        // 受話器
        ctx.fillStyle = '#333';
        ctx.fillRect(-40, -50, 80, 10);
        ctx.restore();
        // 音波(複数の弧)
        for (let i = 0; i < 3; i++) {
          const r = 30 + i * 15 + (s.t * 2) % 20;
          ctx.strokeStyle = `rgba(255,200,0,${0.6 - i * 0.2})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(250 + wob, 300, r, -Math.PI * 0.9, -Math.PI * 0.1);
          ctx.stroke();
        }
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ANSWER', 250, 120);
        ctx.fillText('THE PHONE', 250, 150);
      },
      onClick: (s, x, y) => {
        if (y > 270 && y < 360 && x > 170 && x < 330) return 'win';
        return null;
      }
    },
    {
      name: 'EAT LUNCH', act: 2, duration: 3500, jingle: 'soft',
      init: (s) => {
        s.foods = [
          {x: 190, y: 280, color: '#8b4513', eaten: false}, // パン
          {x: 250, y: 260, color: '#c0332f', eaten: false}, // トマト
          {x: 310, y: 280, color: '#4caf50', eaten: false}, // 野菜
          {x: 220, y: 320, color: '#ffd54f', eaten: false}, // 卵
          {x: 280, y: 320, color: '#fff', eaten: false},    // ご飯
        ];
        s.eaten = 0;
      },
      draw: (s) => {
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        // テーブル
        ctx.fillStyle = '#a0826d';
        ctx.fillRect(50, 380, 400, 120);
        // 皿
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(250, 300, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(250, 300, 110, 0, Math.PI * 2);
        ctx.stroke();
        // 食べ物
        s.foods.forEach(f => {
          if (f.eaten) return;
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EAT EVERYTHING', 250, 80);
        ctx.fillText(`${s.eaten}/5`, 250, 470);
      },
      onClick: (s, x, y) => {
        for (const f of s.foods) {
          if (f.eaten) continue;
          const dx = x - f.x, dy = y - f.y;
          if (Math.sqrt(dx*dx + dy*dy) < 22) {
            f.eaten = true;
            s.eaten++;
            spawnBurst(f.x, f.y, '200,150,50', 6);
            if (s.eaten >= 5) return 'win';
            return null;
          }
        }
        return null;
      }
    },
    {
      name: 'BRUSH TEETH', act: 2, duration: 3000, jingle: 'soft',
      init: (s) => { s.count = 0; s.need = 10; s.lastSide = null; s.clean = 0; },
      draw: (s) => {
        s.clean = s.count / s.need;
        ctx.fillStyle = '#e0f0ff'; ctx.fillRect(0, 0, 500, 500);
        // 鏡
        ctx.fillStyle = '#ccc';
        ctx.fillRect(100, 100, 300, 260);
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(110, 110, 280, 240);
        // 少年の顔(鏡に映った)
        const bx = 250, by = 230;
        ctx.fillStyle = '#e8b38a';
        ctx.beginPath();
        ctx.arc(bx, by, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a1a08';
        ctx.beginPath();
        ctx.arc(bx, by - 10, 56, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(bx - 50, by - 10, 100, 16);
        // 目
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(bx - 18, by - 2, 7, 0, Math.PI * 2); ctx.arc(bx + 18, by - 2, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(bx - 18, by - 2, 3, 0, Math.PI * 2); ctx.arc(bx + 18, by - 2, 3, 0, Math.PI * 2); ctx.fill();
        // 口(歯)
        ctx.fillStyle = '#000';
        ctx.fillRect(bx - 20, by + 15, 40, 14);
        ctx.fillStyle = `rgb(${Math.round(200 + s.clean * 55)},${Math.round(200 + s.clean * 55)},${Math.round(180 + s.clean * 75)})`;
        for (let i = 0; i < 5; i++) ctx.fillRect(bx - 18 + i * 8, by + 17, 6, 10);
        // 歯ブラシ(揺れる)
        const bangle = s.lastSide === 'L' ? -0.3 : 0.3;
        ctx.save();
        ctx.translate(bx, by + 22);
        ctx.rotate(bangle);
        ctx.fillStyle = '#ff80c0';
        ctx.fillRect(-3, -4, 40, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(35, -6, 14, 12);
        ctx.restore();
        // テキスト
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BRUSH LEFT-RIGHT', 250, 410);
        ctx.fillText(`${s.count}/${s.need}`, 250, 440);
      },
      onClick: (s, x) => {
        const side = x < 250 ? 'L' : 'R';
        if (s.lastSide === side) return null; // 同側連打は無効
        s.lastSide = side;
        s.count++;
        if (s.count >= s.need) return 'win';
        return null;
      }
    },
    {
      name: 'SMILE', act: 2, duration: 2800, jingle: 'yes',
      init: () => {},
      draw: () => {
        ctx.fillStyle = '#f0e8dc'; ctx.fillRect(0, 0, 500, 500);
        // 顔(悲しげ)
        const bx = 250, by = 200;
        ctx.fillStyle = '#e8b38a';
        ctx.beginPath();
        ctx.arc(bx, by, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a1a08';
        ctx.beginPath();
        ctx.arc(bx, by - 10, 70, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(bx - 60, by - 10, 120, 20);
        // 悲しい目(下向き)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx - 22, by + 2, 6, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(bx + 22, by + 2, 6, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // 涙
        ctx.fillStyle = '#4fa3ff';
        ctx.beginPath();
        ctx.arc(bx - 22, by + 20, 4, 0, Math.PI * 2);
        ctx.arc(bx + 22, by + 20, 4, 0, Math.PI * 2);
        ctx.fill();
        // 下がった口
        ctx.beginPath();
        ctx.arc(bx, by + 48, 15, Math.PI * 1.1, Math.PI * 1.9, true);
        ctx.stroke();
        // SMILE ボタン
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(150, 340, 200, 70);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SMILE', 250, 385);
        ctx.fillStyle = '#000';
        ctx.font = '14px monospace';
        ctx.fillText('press to smile anyway', 250, 100);
      },
      onClick: (s, x, y) => {
        if (x > 150 && x < 350 && y > 340 && y < 410) return 'win';
        return null;
      }
    },
    {
      name: 'SAY YES', act: 2, duration: 2500, jingle: 'yes',
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
      name: 'OBEY', act: 2, duration: 3000, jingle: 'obey',
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
      name: 'WAIT', act: 2, duration: 3500, jingle: 'wait',
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
  let mgFirstClickRecorded = false;

  function runMinigame(mg) {
    currentMg = mg;
    mgState = {};
    mg.init(mgState);
    mgStartTime = performance.now();
    mgClickWindowStart = mgStartTime;
    mgFirstClickRecorded = false;
    // 難易度カーブ: 進むほど短くする(最大25%短縮)
    const speedFactor = Math.max(0.75, 1 - mgIndex * 0.04);
    mgEffectiveDuration = mg.duration * speedFactor;
    $('hud-act').textContent = mg.act === 1 ? 'PHASE 1' : 'PHASE 2';
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
    // ACT2: 進行に応じて画面が徐々に暗く紫がかる(崩壊進行)
    if (currentMg.act === 2) {
      const progress = Math.min(1, mgIndex / 11);
      // 前半: 薄い黄色味 → 中盤: 紫 → 後半: 暗い赤紫
      const r = Math.round(20 + progress * 40);
      const g = Math.round(10 + progress * 10);
      const b = Math.round(40 + progress * 30);
      const a = progress * 0.55;
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fillRect(0, 0, 500, 500);
      // 後半はスキャンライン強化
      if (progress > 0.5) {
        ctx.fillStyle = `rgba(0,0,0,${(progress - 0.5) * 0.4})`;
        for (let y = 0; y < 500; y += 4) ctx.fillRect(0, y, 500, 1);
      }
    }
    // マウストレイル
    drawMouseTrail();
    drawOverlay();
    // コンボ表示
    if (currentCombo >= 3) {
      ctx.fillStyle = `rgba(255,255,0,${Math.min(1, currentCombo/10)})`;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`x${currentCombo} COMBO!`, 490, 30);
    }
    drawPauseText();
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
    // ミニゲーム結果を記録
    mgResults.push({
      name: currentMg.name,
      act: currentMg.act,
      result,
      durationMs: performance.now() - mgStartTime,
    });
    // 特殊カウント
    if (currentMg.name === 'WAIT' && result === 'win') stats.refused++;
    if (result === 'win') {
      stats.obeyed++;
      if (inBonusPhase) stats.bonusCompleted++;
      currentCombo++;
      if (currentCombo > bestCombo) bestCombo = currentCombo;
      $('game-feedback').textContent = currentCombo >= 3 ? `OK  x${currentCombo}` : 'OK';
      $('game-feedback').className = 'game-feedback ok';
      const jname = currentMg.jingle || (currentMg.act === 1 ? 'mech' : 'soft');
      window.GameAudio.sfxJingle(jname);
      flash('57,255,20', 0.5);
      shake(8);
      spawnBurst(250, 250, '57,255,20', 24);
    } else {
      stats.failed++;
      if (inBonusPhase) stats.bonusFailed++;
      currentCombo = 0;
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
    $('hud-act').textContent = mg.act === 1 ? 'PHASE 1' : 'PHASE 2';
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

  // ===== マウス移動 (トレイル記録) =====
  canvas.addEventListener('mousemove', (e) => {
    if (!currentMg) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (500 / rect.width);
    const y = (e.clientY - rect.top) * (500 / rect.height);
    mouseTrail.push({ x, y, life: 1 });
    if (mouseTrail.length > 40) mouseTrail.shift();
  });

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
      if (inBonusPhase) stats.bonusClicks++;
      // 反応時間・躊躇は各ミニゲームの「最初のクリック」だけを記録
      if (!mgFirstClickRecorded) {
        const rt = performance.now() - mgClickWindowStart;
        stats.reactionTimes.push(rt);
        if (rt > 1200) stats.hesitated++;
        mgFirstClickRecorded = true;
      }
      // 入力ログ記録(ゴースト再生用)
      inputLog.push({
        mgIndex: mgIndex,
        mgName: currentMg.name,
        act: currentMg.act,
        t: performance.now() - mgStartTime,
        globalT: performance.now() - playStartTime,
        x, y, type: 'down'
      });
      // どんなクリックでも小さな星を散らす
      spawnBurst(x, y, '255,255,255', 6);
      if (currentMg.onMouseDown) {
        currentMg.onMouseDown(mgState, x, y);
      } else {
        const r = currentMg.onClick(mgState, x, y);
        if (r === 'win' || r === 'lose') finishMg(r);
      }
    } else if (type === 'up') {
      inputLog.push({
        mgIndex: mgIndex,
        t: performance.now() - mgStartTime,
        globalT: performance.now() - playStartTime,
        x, y, type: 'up'
      });
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
    playStartTime = performance.now();
    window.GameAudio.play('act1');
    mgQueue = buildQueue([
      'AIM AND SHOOT',
      'SMASH BUTTON',
      'DODGE MISSILE',
      'EVADE LASER',
      'DESTROY CORE',
      'MANUAL OVERRIDE',
      'CHARGE CANNON',
      'LOCK ON',
    ]);
    mgIndex = 0;
    showTaskFlash(mgQueue[0]);
  }
  function startAct2() {
    show('game-screen');
    window.GameAudio.play('act2a');
    // 平和 → 日常 → 違和感 → 狂気
    mgQueue = buildQueue([
      'GREET OJISAN',
      'ANSWER PHONE',
      'WATER PLANT',
      'WAVE HELLO',
      'EAT LUNCH',
      'CATCH LEAF',
      'COUNT SHEEP',
      'POUR TEA',
      'BRUSH TEETH',
      'PICK FLOWER',
      'SWAT FLY',
      'SAY YES',
      'SMILE',
      'BREATHE',
      'OBEY',
      'WAIT',
    ]);
    mgIndex = 0;
    showTaskFlash(mgQueue[0]);
  }
  function endQueue() {
    if (currentMg.act === 1) {
      window.GameAudio.stop();
      showVRTransition();
    } else if (!inBonusPhase) {
      // PHASE 2 通常最後 → TEST COMPLETE画面で待機
      window.GameAudio.stop();
      showTestComplete();
    } else {
      // ボーナスフェーズ: ミニゲーム1本終わるごとに再度 TEST COMPLETE 待機へ戻る
      showTestComplete();
    }
  }

  // ===== 鏡画面 =====
  let finalMachineScore = 0;
  let finalEndingKey = 'obedient';

  function calcMachineScore() {
    const avgRt = stats.reactionTimes.length
      ? stats.reactionTimes.reduce((a,b)=>a+b,0) / stats.reactionTimes.length
      : 0;
    // 機械度は「試験終了後にどれだけ続けたか」
    // 通常テストの成績は無関係(そこは台本通りの試験なので)
    const totalBonus = stats.bonusCompleted + stats.bonusFailed;
    let score = 0;
    if (totalBonus === 0) {
      // 一度もクリックしなかった → 機械度0 (最も人間的)
      score = 0;
    } else {
      // 1ラウンドごとに機械度10加算、10ラウンド満了で100
      score = Math.min(100, totalBonus * 10 + stats.bonusCompleted * 3);
    }
    return { score: Math.round(score), avgRt: Math.round(avgRt) };
  }

  function decideEnding() {
    const totalBonus = stats.bonusCompleted + stats.bonusFailed;
    // 何もせずに試験終了を受け入れた → 真END(逃げた)
    if (totalBonus === 0) return 'awakened';
    // 1~2ラウンドでやめた → 迷った末に立ち去った
    if (totalBonus <= 2) return 'hesitant';
    // 満了(10ラウンド以上) → 完璧な機械
    if (totalBonus >= 10 && stats.bonusFailed === 0) return 'perfect_machine';
    // 満了近くまでやったが失敗もあり → defective
    if (totalBonus >= 10) return 'defective';
    // 中途半端に続けた → obedient
    return 'obedient';
  }

  function showMirror() {
    show('mirror-screen');
    window.GameAudio.play('act3');
    const {score, avgRt} = calcMachineScore();
    finalMachineScore = score;
    finalEndingKey = decideEnding();

    const pad = (s) => (s + '................................').slice(0, 22);
    const lines = [
      `> ${pad(t('clickCount'))}${stats.clicks}`,
      `> ${pad(t('avgReaction'))}${avgRt} ms`,
      `> ${pad(t('obeyed'))}${stats.obeyed}`,
      `> ${pad(t('failed'))}${stats.failed}`,
      `> ${pad(t('hesitations'))}${stats.hesitated}`,
      `> ${pad(t('refused'))}${stats.refused}`,
      `> ${pad(t('machineScore'))}${score}%`,
    ];
    const el = $('mirror-stats');
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'stat-line';
      div.style.animationDelay = (i * 0.3) + 's';
      div.textContent = line;
      el.appendChild(div);
    });
    $('mirror-message').textContent = '';
    // ヒートマップ描画
    drawHeatmap();
    // ゴースト再生開始
    setTimeout(() => startGhostReplay(), 3000);
    setTimeout(() => {
      $('mirror-message').textContent = t('msg_' + finalEndingKey);
    }, 2700);
  }

  // ヒートマップを鏡画面のミニキャンバスに描く
  function drawHeatmap() {
    const hm = $('mirror-heatmap');
    if (!hm) return;
    const hctx = hm.getContext('2d');
    hctx.fillStyle = '#000';
    hctx.fillRect(0, 0, hm.width, hm.height);
    // 枠
    hctx.strokeStyle = '#333';
    hctx.lineWidth = 1;
    hctx.strokeRect(0.5, 0.5, hm.width - 1, hm.height - 1);
    // 全クリック点を赤くプロット
    hctx.globalCompositeOperation = 'lighter';
    inputLog.filter(e => e.type === 'down').forEach(e => {
      const px = (e.x / 500) * hm.width;
      const py = (e.y / 500) * hm.height;
      const g = hctx.createRadialGradient(px, py, 0, px, py, 14);
      g.addColorStop(0, 'rgba(255,48,48,0.6)');
      g.addColorStop(1, 'rgba(255,48,48,0)');
      hctx.fillStyle = g;
      hctx.beginPath(); hctx.arc(px, py, 14, 0, Math.PI*2); hctx.fill();
    });
    // 軌跡(タイミング順に線)
    hctx.globalCompositeOperation = 'source-over';
    hctx.strokeStyle = 'rgba(255,255,255,0.2)';
    hctx.lineWidth = 1;
    hctx.beginPath();
    const downs = inputLog.filter(e => e.type === 'down');
    downs.forEach((e, i) => {
      const px = (e.x / 500) * hm.width;
      const py = (e.y / 500) * hm.height;
      if (i === 0) hctx.moveTo(px, py); else hctx.lineTo(px, py);
    });
    hctx.stroke();
    hctx.globalCompositeOperation = 'source-over';
  }

  // ゴースト再生: 右下のゴーストキャンバスに入力を時間順で再生
  let ghostRaf = null;
  let ghostStartTime = 0;
  function startGhostReplay() {
    const gc = $('mirror-ghost');
    if (!gc) return;
    const gctx = gc.getContext('2d');
    const downs = inputLog.filter(e => e.type === 'down');
    if (downs.length === 0) return;
    const totalTime = downs[downs.length - 1].globalT;
    // 実時間の1/3で早送り
    const replayDuration = Math.max(2000, totalTime / 3);
    ghostStartTime = performance.now();
    cancelAnimationFrame(ghostRaf);
    function tick() {
      const elapsed = performance.now() - ghostStartTime;
      const t = elapsed / replayDuration * totalTime;
      gctx.fillStyle = '#000';
      gctx.fillRect(0, 0, gc.width, gc.height);
      gctx.strokeStyle = '#333';
      gctx.strokeRect(0.5, 0.5, gc.width - 1, gc.height - 1);
      // 現在時刻までのすべての点を薄く、直近の点を明るく
      downs.forEach(e => {
        if (e.globalT > t) return;
        const age = (t - e.globalT) / 1500;
        const a = Math.max(0, 1 - age);
        const px = (e.x / 500) * gc.width;
        const py = (e.y / 500) * gc.height;
        gctx.fillStyle = `rgba(255,255,255,${a})`;
        gctx.beginPath(); gctx.arc(px, py, 4, 0, Math.PI*2); gctx.fill();
      });
      // ラベル
      gctx.fillStyle = '#888';
      gctx.font = '10px monospace';
      gctx.fillText('YOUR INPUTS', 6, 12);
      if (elapsed < replayDuration + 500) {
        ghostRaf = requestAnimationFrame(tick);
      } else {
        // ループ再生
        ghostStartTime = performance.now();
        ghostRaf = requestAnimationFrame(tick);
      }
    }
    tick();
  }

  // ===== 分岐エンディング本文 =====
  // 機械度は「試験終了後、どれだけ指示されていない作業を続けたか」で決まる
  const ENDINGS = {
    // 席を立たず、指示されていない作業を満了までこなし続けた
    perfect_machine: {
      title: 'PERFECT INTEGRATION',
      color: '#ff3030',
      bgm: 'finale_cold',
      ja: [
        '「試験終了」と告げられたあと、',
        '少年は、指示されていない作業を',
        '10回続けた。',
        '',
        '「理想的な適性です」と試験官は微笑んだ。',
        '',
        '今夜、アリーナの観客は叫ぶだろう。',
        '「見ろ、あの機体を！」',
        '',
        '少年は、確かにパイロットになった。',
        'ただし、コックピットの中ではなく、',
        'コックピットそのものとして。',
      ],
      en: [
        'After "TEST COMPLETE" was announced,',
        'the boy performed 10 more tasks',
        'he was never instructed to do.',
        '',
        '"Ideal compatibility," the examiner smiled.',
        '',
        'Tonight, the arena will roar.',
        '"Look at that unit!"',
        '',
        'The boy truly became a pilot.',
        'Just... not inside the cockpit,',
        'but AS the cockpit.',
      ],
    },
    // 続けたが途中で失敗もあった
    obedient: {
      title: 'ACCEPTED',
      color: '#fff',
      bgm: 'finale_cold',
      ja: [
        '「試験終了」のあと、少年は',
        '指示されていない作業を続けた。',
        '',
        '何回かは失敗したが、',
        '「命令がなくても動ける」ことが証明された。',
        '',
        '必要な資質はそれだけだった。',
        '',
        '少年は、もう喋れない。',
        'でも、マシンは喋らないから問題ない。',
      ],
      en: [
        'After "TEST COMPLETE", the boy',
        'kept performing tasks nobody asked for.',
        '',
        'He failed a few times, but he proved',
        'that he could work without orders.',
        '',
        'That was the only quality required.',
        '',
        'The boy can no longer speak.',
        'But machines do not speak. No problem.',
      ],
    },
    // 1~2回やってみたが止めた
    hesitant: {
      title: 'STILL A CHILD',
      color: '#ffd54f',
      bgm: 'finale_warm',
      ja: [
        '「試験終了」のあと、少年は',
        '少しだけ、作業を続けた。',
        '',
        'でも、途中で、なぜか立ち上がった。',
        '「…もう帰っていいんだよね?」',
        '',
        '「惜しい子だ」と試験官はつぶやいた。',
        '「あと少しで完璧だったのに。」',
        '',
        '少年は、家に帰された。',
        '今夜もテレビの前に座る。',
      ],
      en: [
        'After "TEST COMPLETE", the boy',
        'worked for a little while longer.',
        '',
        'But then, for some reason, he stood up.',
        '"...I can go home now, right?"',
        '',
        '"So close," the examiner muttered.',
        '"He was almost perfect."',
        '',
        'The boy was sent home.',
        'Tonight, he sits in front of the TV again.',
      ],
    },
    // 席を立った: ピタッと止めた
    awakened: {
      title: 'YOU WENT HOME',
      color: '#39ff14',
      bgm: 'finale_awakened',
      ja: [
        '画面に「試験終了」と出た。',
        '',
        '少年は、席を立った。',
        '',
        '何もしなかった。何もクリックしなかった。',
        '「終わった」と言われたら、終わりだと思った。',
        '',
        'そんな当たり前のことを、',
        '大半の応募者はできなかった。',
        '',
        '「不合格です」と試験官はため息をついた。',
        '',
        '少年は、家に帰った。',
        '夢は叶わなかった。',
        '',
        'でも、夢を見ているのは、',
        'まだ、少年自身だった。',
      ],
      en: [
        'The screen said "TEST COMPLETE."',
        '',
        'The boy stood up.',
        '',
        'He did nothing. He clicked nothing.',
        'When told it was over, he thought it was over.',
        '',
        'Most applicants could not do',
        'that obvious thing.',
        '',
        '"Rejected," the examiner sighed.',
        '',
        'The boy went home.',
        'His dream did not come true.',
        '',
        'But the one dreaming',
        'was still the boy himself.',
      ],
    },
    // ボーナスラウンドで大量失敗
    defective: {
      title: 'DEFECTIVE',
      color: '#ff80c0',
      bgm: 'finale_defective',
      ja: [
        '「試験終了」のあと、少年は',
        '指示のない作業を続けようとしたが、',
        'ほとんど失敗した。',
        '',
        '「素質はあるが、出力が不安定だな。」',
        '「廃棄にしよう。」',
        '',
        'でも、壊れたマシンだけが、',
        '自由に夢を見られる。',
      ],
      en: [
        'After "TEST COMPLETE", the boy',
        'tried to keep working on his own,',
        'but failed most of the tasks.',
        '',
        '"Has the instinct, but unstable output."',
        '"Dispose of it."',
        '',
        'But only broken machines',
        'are free to dream.',
      ],
    },
  };

  $('mirror-next').addEventListener('click', () => {
    cancelAnimationFrame(ghostRaf);
    window.GameAudio.stop();
    show('end-screen');
    const ending = ENDINGS[finalEndingKey] || ENDINGS.obedient;
    window.GameAudio.play(ending.bgm);
    $('end-title').textContent = ending.title;
    $('end-title').style.color = ending.color;
    $('end-title').style.textShadow = `0 0 16px ${ending.color}`;
    const lines = ending[curLang] || ending.ja;
    let i = 0;
    const el = $('end-line');
    el.innerHTML = '';
    const interval = setInterval(() => {
      if (i >= lines.length) { clearInterval(interval); return; }
      el.innerHTML += (lines[i] || '&nbsp;') + '<br>';
      i++;
    }, 800);
  });

  // ===== タイトル → オープニングシネマ → 少年 → ポスター → boot → PHASE1 =====
  $('start-btn').addEventListener('click', () => {
    window.GameAudio.sfxClick();
    window.GameAudio.play('act1'); // オープニングはメカバトルBGM
    startOpeningCinematic();
  });

  // シネマ共通: 次の画面に進むためのワンタップ待ち
  function waitForTap(screenId, onTap) {
    const el = $(screenId);
    const handler = () => {
      el.removeEventListener('click', handler);
      el.removeEventListener('touchstart', handler);
      onTap();
    };
    el.addEventListener('click', handler);
    el.addEventListener('touchstart', handler);
  }

  // タイプライター風にテキストを出す
  function typeWriter(elId, fullText, speed, done) {
    const el = $(elId);
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      el.textContent = fullText.substr(0, i + 1);
      i++;
      if (i >= fullText.length) {
        clearInterval(iv);
        if (done) done();
      }
    }, speed || 40);
    return iv;
  }

  // ===== OPENING: 派手なロボットバトル =====
  let openingRaf = null;
  function startOpeningCinematic() {
    show('opening-screen');
    $('opening-text').textContent = '';
    $('opening-hint').style.visibility = 'hidden';
    const oc = $('opening-canvas');
    const octx = oc.getContext('2d');
    const state = {
      t: 0,
      beams: [],
      explosions: [],
      mechL: { x: 100, y: 260, vx: 0, vy: 0, color: '#4fa3ff', charge: 0 },
      mechR: { x: 400, y: 260, vx: 0, vy: 0, color: '#ff4444', charge: 0 },
      crowdGlow: 0,
    };
    function spawnBeam(from, to, color) {
      state.beams.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, life: 1, color });
      window.GameAudio.sfxHit(400);
    }
    function spawnExplosion(x, y) {
      state.explosions.push({ x, y, r: 10, life: 1 });
      window.GameAudio.sfxNg();
      shake(12);
    }
    function drawMech(m, facing) {
      octx.save();
      octx.translate(m.x, m.y);
      if (facing < 0) octx.scale(-1, 1);
      // 胴体
      octx.fillStyle = m.color;
      octx.fillRect(-30, -40, 60, 70);
      // 頭
      octx.fillStyle = '#222';
      octx.fillRect(-18, -65, 36, 28);
      // 目(光)
      octx.fillStyle = m.color;
      octx.fillRect(-12, -58, 24, 6);
      // 腕
      octx.fillStyle = '#555';
      octx.fillRect(25, -30, 18, 60);
      octx.fillRect(-43, -30, 18, 60);
      // 砲
      if (m.charge > 0) {
        octx.fillStyle = `rgba(255,255,0,${m.charge})`;
        octx.beginPath();
        octx.arc(45, 0, 10 + m.charge * 8, 0, Math.PI * 2);
        octx.fill();
      }
      // 脚
      octx.fillStyle = '#666';
      octx.fillRect(-25, 30, 16, 40);
      octx.fillRect(9, 30, 16, 40);
      octx.restore();
    }
    function drawCrowd() {
      // 観客のシルエット
      octx.fillStyle = `rgba(0,0,0,${0.9})`;
      for (let i = 0; i < 20; i++) {
        const bx = 20 + i * 24;
        const bh = 30 + (i % 3) * 8;
        octx.fillRect(bx, 470 - bh, 16, bh);
        octx.beginPath();
        octx.arc(bx + 8, 470 - bh - 6, 8, 0, Math.PI * 2);
        octx.fill();
      }
      // 応援の光
      if (state.crowdGlow > 0) {
        octx.fillStyle = `rgba(255,255,100,${state.crowdGlow * 0.2})`;
        octx.fillRect(0, 440, 500, 60);
        state.crowdGlow *= 0.9;
      }
    }
    function frame() {
      state.t++;
      // 背景グラデ (アリーナ)
      const grad = octx.createLinearGradient(0, 0, 0, 500);
      grad.addColorStop(0, '#1a0530');
      grad.addColorStop(0.6, '#300a20');
      grad.addColorStop(1, '#0a0000');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 500, 500);
      // 格子フィールド(未来感)
      octx.strokeStyle = 'rgba(255,48,48,0.15)';
      octx.lineWidth = 1;
      for (let x = 0; x < 500; x += 40) {
        octx.beginPath();
        octx.moveTo(x, 350);
        octx.lineTo(x + (x - 250) * 0.5, 500);
        octx.stroke();
      }
      for (let y = 350; y < 500; y += 20) {
        octx.beginPath();
        octx.moveTo(0, y);
        octx.lineTo(500, y);
        octx.stroke();
      }
      drawCrowd();
      // 機体アクション (時間ベース)
      state.mechL.charge = Math.max(0, state.mechL.charge - 0.02);
      state.mechR.charge = Math.max(0, state.mechR.charge - 0.02);
      // 攻撃シーケンス
      if (state.t === 40) state.mechL.charge = 1;
      if (state.t === 70) {
        spawnBeam({x: state.mechL.x + 40, y: state.mechL.y}, {x: state.mechR.x, y: state.mechR.y}, '#4fa3ff');
        state.mechR.x += 20; state.crowdGlow = 1;
      }
      if (state.t === 90) spawnExplosion(state.mechR.x, state.mechR.y - 20);
      if (state.t === 130) state.mechR.charge = 1;
      if (state.t === 160) {
        spawnBeam({x: state.mechR.x - 40, y: state.mechR.y}, {x: state.mechL.x, y: state.mechL.y}, '#ff4444');
        state.crowdGlow = 1;
      }
      if (state.t === 180) spawnExplosion(state.mechL.x + 10, state.mechL.y);
      if (state.t === 220) {
        state.mechL.charge = 1;
      }
      if (state.t === 250) {
        spawnBeam({x: state.mechL.x + 40, y: state.mechL.y - 20}, {x: state.mechR.x, y: state.mechR.y - 30}, '#fff');
        spawnExplosion(state.mechR.x, state.mechR.y);
        spawnExplosion(state.mechR.x + 20, state.mechR.y - 20);
        spawnExplosion(state.mechR.x - 20, state.mechR.y + 10);
        state.crowdGlow = 1;
      }
      // 機体描画
      drawMech(state.mechL, 1);
      drawMech(state.mechR, -1);
      // ビーム
      for (let i = state.beams.length - 1; i >= 0; i--) {
        const b = state.beams[i];
        octx.strokeStyle = b.color;
        octx.lineWidth = 6 + b.life * 10;
        octx.globalAlpha = b.life;
        octx.beginPath();
        octx.moveTo(b.x1, b.y1);
        octx.lineTo(b.x2, b.y2);
        octx.stroke();
        octx.globalAlpha = 1;
        b.life -= 0.08;
        if (b.life <= 0) state.beams.splice(i, 1);
      }
      // 爆発
      for (let i = state.explosions.length - 1; i >= 0; i--) {
        const e = state.explosions[i];
        e.r += 4; e.life -= 0.05;
        if (e.life <= 0) { state.explosions.splice(i, 1); continue; }
        octx.fillStyle = `rgba(255,200,0,${e.life})`;
        octx.beginPath();
        octx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = `rgba(255,255,255,${e.life * 0.7})`;
        octx.beginPath();
        octx.arc(e.x, e.y, e.r * 0.5, 0, Math.PI * 2);
        octx.fill();
      }
      // シェイク反映
      if (shakeAmount > 0.5) {
        const dx = (Math.random() - 0.5) * shakeAmount;
        const dy = (Math.random() - 0.5) * shakeAmount;
        oc.style.transform = `translate(${dx}px, ${dy}px)`;
        shakeAmount *= 0.85;
      } else oc.style.transform = '';
      openingRaf = requestAnimationFrame(frame);
    }
    frame();
    // テキスト演出
    setTimeout(() => {
      typeWriter('opening-text', curLang === 'en'
        ? '20XX. The age of the Machine Battles.'
        : '20XX年。マシンバトルの時代。', 45);
    }, 500);
    setTimeout(() => {
      typeWriter('opening-text', curLang === 'en'
        ? 'Giant robots. Roaring crowds. Glory.'
        : '巨大ロボ。歓声。栄光。', 45);
    }, 3600);
    setTimeout(() => {
      typeWriter('opening-text', curLang === 'en'
        ? 'Everyone wants to pilot one.'
        : 'みんな、乗りたがった。', 45);
      $('opening-hint').style.visibility = 'visible';
      waitForTap('opening-screen', () => {
        cancelAnimationFrame(openingRaf);
        showBoyScene();
      });
    }, 6200);
  }

  // ===== BOY: 少年が番組を観ている =====
  let boyRaf = null;
  function showBoyScene() {
    show('boy-screen');
    $('boy-text').textContent = '';
    $('boy-hint').style.visibility = 'hidden';
    window.GameAudio.play('title'); // 落ち着いた雰囲気に
    const bc = $('boy-canvas');
    const bctx = bc.getContext('2d');
    const state = { t: 0, tvFlicker: 0, sparkle: [] };
    function frame() {
      state.t++;
      state.tvFlicker = Math.random();
      // 薄暗い部屋 (暖色照明)
      bctx.fillStyle = '#1a0e05';
      bctx.fillRect(0, 0, 500, 500);
      // 床
      bctx.fillStyle = '#0a0503';
      bctx.fillRect(0, 400, 500, 100);
      // TV
      bctx.fillStyle = '#000';
      bctx.fillRect(280, 180, 180, 140);
      bctx.fillStyle = '#222';
      bctx.fillRect(280, 180, 180, 10);
      // TV画面(チラチラするロボット映像)
      const tvCol = 100 + state.tvFlicker * 150;
      bctx.fillStyle = `rgb(${tvCol},${tvCol * 0.3},${tvCol * 0.1})`;
      bctx.fillRect(290, 200, 160, 110);
      // 画面内にちっちゃいロボのシルエット
      bctx.fillStyle = '#fff';
      bctx.fillRect(340, 240, 30, 40);
      bctx.fillRect(400, 240, 30, 40);
      // TV台
      bctx.fillStyle = '#3a2510';
      bctx.fillRect(260, 320, 220, 20);
      // TVの光が部屋を照らす
      const glow = bctx.createRadialGradient(370, 250, 30, 370, 250, 300);
      glow.addColorStop(0, `rgba(255,150,80,${0.25 + state.tvFlicker * 0.15})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = glow;
      bctx.fillRect(0, 0, 500, 500);
      // 少年 (画面左、後ろ姿 & 振り返り時々)
      const bx = 130, by = 280;
      // 体
      bctx.fillStyle = '#3a6fc9';
      bctx.fillRect(bx - 30, by, 60, 80);
      // 首
      bctx.fillStyle = '#e8b38a';
      bctx.fillRect(bx - 12, by - 14, 24, 16);
      // 頭
      bctx.fillStyle = '#e8b38a';
      bctx.beginPath();
      bctx.arc(bx, by - 40, 30, 0, Math.PI * 2);
      bctx.fill();
      // 髪
      bctx.fillStyle = '#2a1a08';
      bctx.beginPath();
      bctx.arc(bx, by - 50, 30, Math.PI, 0);
      bctx.fill();
      bctx.fillRect(bx - 28, by - 50, 56, 10);
      // 目(TV側を見てるので横顔)
      bctx.fillStyle = '#fff';
      bctx.beginPath();
      bctx.arc(bx + 18, by - 38, 6, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = '#000';
      bctx.beginPath();
      bctx.arc(bx + 20, by - 38, 3, 0, Math.PI * 2);
      bctx.fill();
      // 目のキラキラ
      bctx.fillStyle = '#fff';
      bctx.fillRect(bx + 19, by - 40, 2, 2);
      // 口(わずかに開いた感動顔)
      bctx.strokeStyle = '#000';
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.arc(bx + 14, by - 26, 3, 0, Math.PI);
      bctx.stroke();
      // 感嘆符のキラキラ (たまに出す)
      if (state.t % 60 === 0) {
        state.sparkle.push({ x: bx + 25 + Math.random()*20, y: by - 60 + Math.random()*30, life: 1 });
      }
      for (let i = state.sparkle.length - 1; i >= 0; i--) {
        const s = state.sparkle[i];
        s.life -= 0.02;
        if (s.life <= 0) { state.sparkle.splice(i, 1); continue; }
        bctx.fillStyle = `rgba(255,255,100,${s.life})`;
        bctx.font = '20px sans-serif';
        bctx.fillText('✦', s.x, s.y);
      }
      boyRaf = requestAnimationFrame(frame);
    }
    frame();
    setTimeout(() => {
      typeWriter('boy-text', curLang === 'en'
        ? '...I want to pilot one.'
        : '…僕も、乗りたい。', 60);
    }, 600);
    setTimeout(() => {
      typeWriter('boy-text', curLang === 'en'
        ? 'Someday, I want to be a pilot.'
        : 'いつか、パイロットになりたい。', 60);
      $('boy-hint').style.visibility = 'visible';
      waitForTap('boy-screen', () => {
        cancelAnimationFrame(boyRaf);
        showPosterScene();
      });
    }, 3600);
  }

  // ===== POSTER: 応募ポスター =====
  let posterRaf = null;
  function showPosterScene() {
    show('poster-screen');
    window.GameAudio.play('title');
    const pc = $('poster-canvas');
    const pctx = pc.getContext('2d');
    const state = { t: 0 };
    function frame() {
      state.t++;
      // 背景 (路地裏の壁)
      pctx.fillStyle = '#2a1f14';
      pctx.fillRect(0, 0, 500, 500);
      // レンガ模様
      pctx.fillStyle = '#1a110a';
      for (let y = 0; y < 500; y += 40) {
        for (let x = (y % 80 === 0 ? 0 : 20); x < 500; x += 80) {
          pctx.fillRect(x, y, 76, 36);
        }
      }
      // ポスター本体 (ゆらゆら傾く)
      const wobble = Math.sin(state.t * 0.02) * 1.5;
      pctx.save();
      pctx.translate(250, 250);
      pctx.rotate(wobble * Math.PI / 180);
      // ポスター紙
      pctx.fillStyle = '#f5e6c8';
      pctx.fillRect(-170, -220, 340, 440);
      // ポスター枠(破れ)
      pctx.strokeStyle = '#8a6f42';
      pctx.lineWidth = 4;
      pctx.strokeRect(-170, -220, 340, 440);
      // タイトル
      pctx.fillStyle = '#c0332f';
      pctx.font = 'bold 36px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText(curLang === 'en' ? 'WANTED' : '募集', 0, -170);
      pctx.fillStyle = '#000';
      pctx.font = 'bold 18px sans-serif';
      pctx.fillText(curLang === 'en' ? 'PILOT CANDIDATES' : 'パイロット候補生', 0, -140);
      // ロボのシルエット(小さめ)
      pctx.fillStyle = '#1a1a1a';
      pctx.fillRect(-30, -110, 60, 70);
      pctx.fillRect(-18, -128, 36, 22);
      pctx.fillStyle = '#ff3030';
      pctx.fillRect(-12, -122, 24, 4);
      pctx.fillStyle = '#1a1a1a';
      pctx.fillRect(-38, -100, 10, 55);
      pctx.fillRect(28, -100, 10, 55);
      // 募集要件(マシンの性能要件に近いが人間の資質にも読める)
      pctx.fillStyle = '#000';
      pctx.textAlign = 'left';
      pctx.font = 'bold 13px sans-serif';
      const reqTitle = curLang === 'en' ? '— REQUIREMENTS —' : '— 応募条件 —';
      pctx.textAlign = 'center';
      pctx.fillText(reqTitle, 0, -25);
      pctx.textAlign = 'left';
      pctx.font = '12px sans-serif';
      const reqs = curLang === 'en' ? [
        '- Able to operate for long durations',
        '- Quick response to instructions',
        '- Low emotional fluctuation',
        '- High physical endurance',
        '- Compatible body structure',
        '- No familial obligations preferred',
      ] : [
        '・長時間の連続稼働が可能な方',
        '・指示への迅速な反応',
        '・感情の起伏が少ない方',
        '・高い身体耐久性',
        '・適合する身体構造',
        '・親族関係の少ない方優遇',
      ];
      reqs.forEach((r, i) => {
        pctx.fillText(r, -155, 0 + i * 18);
      });
      // キャッチコピー(直接的でない、示唆的)
      pctx.textAlign = 'center';
      pctx.fillStyle = '#c0332f';
      pctx.font = 'bold 13px sans-serif';
      pctx.fillText(curLang === 'en' ? '"You can be part of something bigger."' : '「君も、あの機体の一部になれる。」', 0, 140);
      // 下部注意書き(極小)
      pctx.fillStyle = '#666';
      pctx.font = '8px sans-serif';
      pctx.fillText(curLang === 'en'
        ? '* Applicants must consent to full body modification and neural integration.'
        : '※ 応募には身体改造および神経接続への同意が必要です。', 0, 175);
      pctx.fillText(curLang === 'en'
        ? '* Application is irrevocable once submitted.'
        : '※ 応募後の撤回はできません。', 0, 190);
      pctx.restore();
      posterRaf = requestAnimationFrame(frame);
    }
    frame();
  }
  $('apply-btn').addEventListener('click', () => {
    window.GameAudio.sfxClick();
    cancelAnimationFrame(posterRaf);
    show('boot-screen');
    runBootSequence();
  });

  // ===== VR遷移: PHASE1 → PHASE2 =====
  let vrRaf = null;
  function showVRTransition() {
    show('vr-transition-screen');
    window.GameAudio.stop();
    const vc = $('vr-canvas');
    const vctx = vc.getContext('2d');
    const state = { t: 0 };
    function frame() {
      state.t++;
      vctx.fillStyle = '#000';
      vctx.fillRect(0, 0, 500, 500);
      // スキャンライン
      for (let y = 0; y < 500; y += 2) {
        vctx.fillStyle = `rgba(0,255,255,${Math.random() * 0.1})`;
        vctx.fillRect(0, y, 500, 1);
      }
      // 中央に VR ロゴ風キューブ
      const s = 80 + Math.sin(state.t * 0.1) * 20;
      vctx.save();
      vctx.translate(250, 250);
      vctx.rotate(state.t * 0.03);
      vctx.strokeStyle = '#00fff7';
      vctx.lineWidth = 3;
      vctx.strokeRect(-s/2, -s/2, s, s);
      vctx.strokeRect(-s/2 + 20, -s/2 - 20, s, s);
      vctx.beginPath();
      vctx.moveTo(-s/2, -s/2); vctx.lineTo(-s/2 + 20, -s/2 - 20);
      vctx.moveTo(s/2, -s/2); vctx.lineTo(s/2 + 20, -s/2 - 20);
      vctx.moveTo(-s/2, s/2); vctx.lineTo(-s/2 + 20, s/2 - 20);
      vctx.moveTo(s/2, s/2); vctx.lineTo(s/2 + 20, s/2 - 20);
      vctx.stroke();
      vctx.restore();
      vrRaf = requestAnimationFrame(frame);
    }
    frame();
    const msgs = curLang === 'en'
      ? ['LOADING VR SIMULATION...', 'PHASE 2: ADAPTATION TEST', 'A DAILY LIFE SCENARIO', 'STAY CALM. OBEY.']
      : ['VR環境ロード中...', 'フェーズ2: 適応性テスト', '日常生活シミュレーション', '冷静に。従順に。'];
    let idx = 0;
    typeWriter('vr-text', msgs[0], 35);
    const iv = setInterval(() => {
      idx++;
      if (idx >= msgs.length) {
        clearInterval(iv);
        setTimeout(() => {
          cancelAnimationFrame(vrRaf);
          startAct2();
        }, 1200);
        return;
      }
      typeWriter('vr-text', msgs[idx], 35);
    }, 1400);
  }

  // ===== TEST COMPLETE: 裏の本番テスト =====
  // PHASE2通常が終わると表示。何もしなければ「試験終了」で家に帰され良エンド。
  // クリックすれば「ボーナス」と称して同じようなミニゲームが永遠に続く。
  // ボーナスフェーズでの行動が本当の機械度になる。
  let tcRaf = null;
  let tcWaitTimer = null;
  let tcClicked = false;
  const BONUS_POOL = [
    'ANSWER PHONE','WATER PLANT','WAVE HELLO','EAT LUNCH','CATCH LEAF',
    'COUNT SHEEP','POUR TEA','BRUSH TEETH','PICK FLOWER','SWAT FLY',
    'SAY YES','SMILE','BREATHE','OBEY',
  ];
  function pickBonusMinigame() {
    const name = BONUS_POOL[Math.floor(Math.random() * BONUS_POOL.length)];
    return minigames.find(m => m.name === name);
  }

  function showTestComplete() {
    show('test-complete-screen');
    tcClicked = false;
    // PHASE2通常後に1回だけ再生、以降のボーナスフェーズでは無音寄りに
    if (!inBonusPhase) {
      window.GameAudio.stop();
    }
    const tcc = $('tc-canvas');
    const tcctx = tcc.getContext('2d');
    const state = { t: 0, dot: 0 };
    function frame() {
      state.t++;
      // 殺風景な白バック(試験終了の事務的な感じ)
      tcctx.fillStyle = '#f0ede0';
      tcctx.fillRect(0, 0, 500, 500);
      // 上部に小さなシステム情報
      tcctx.fillStyle = '#888';
      tcctx.font = '10px monospace';
      tcctx.textAlign = 'left';
      tcctx.fillText('SYS: IDLE', 10, 16);
      tcctx.textAlign = 'right';
      tcctx.fillText('STATUS: OK', 490, 16);
      // 中央の大きな文字
      tcctx.textAlign = 'center';
      tcctx.fillStyle = '#1a1a1a';
      tcctx.font = 'bold 34px monospace';
      tcctx.fillText(curLang === 'en' ? 'TEST COMPLETE' : '試験終了', 250, 200);
      // 指示のない待機
      tcctx.fillStyle = '#555';
      tcctx.font = '14px monospace';
      const sub = curLang === 'en'
        ? 'Thank you for your cooperation.'
        : 'ご協力ありがとうございました。';
      tcctx.fillText(sub, 250, 240);
      const sub2 = curLang === 'en'
        ? 'You may leave now.'
        : 'お帰りいただいて結構です。';
      tcctx.fillText(sub2, 250, 262);
      // 徐々に点灯するドット(動きがないとプレイヤーが不安になる)
      state.dot += 0.03;
      const d = Math.floor(state.dot % 4);
      tcctx.fillStyle = '#aaa';
      tcctx.font = 'bold 24px monospace';
      tcctx.fillText('.'.repeat(d), 250, 320);
      // 下部の細かい文字(応募者番号など)
      tcctx.fillStyle = '#888';
      tcctx.font = '9px monospace';
      tcctx.fillText(curLang === 'en' ? 'APPLICANT #' + (10000 + Math.floor(state.t / 100)) : '応募者番号 #' + (10000 + Math.floor(state.t / 100)), 250, 470);
      tcRaf = requestAnimationFrame(frame);
    }
    frame();

    // テキストは控えめに、Tap促さない
    $('tc-text').textContent = '';

    // クリック/タップでボーナスフェーズに進む
    const onTap = () => {
      if (tcClicked) return;
      tcClicked = true;
      // 初回TEST COMPLETEで押した瞬間、ボーナスフェーズ開始
      if (!inBonusPhase) {
        inBonusPhase = true;
        stats.stoppedAt = -1;
      }
      cancelAnimationFrame(tcRaf);
      if (tcWaitTimer) { clearTimeout(tcWaitTimer); tcWaitTimer = null; }
      $('test-complete-screen').removeEventListener('click', onTap);
      $('test-complete-screen').removeEventListener('touchstart', onTap);
      runNextBonusMinigame();
    };
    $('test-complete-screen').addEventListener('click', onTap);
    $('test-complete-screen').addEventListener('touchstart', onTap);

    // 何もせずに待てば「逃げた」エンドへ
    // 初回は8秒、ボーナス中は少し短く5秒
    const waitMs = inBonusPhase ? 5000 : 8000;
    if (tcWaitTimer) clearTimeout(tcWaitTimer);
    tcWaitTimer = setTimeout(() => {
      if (tcClicked) return;
      cancelAnimationFrame(tcRaf);
      $('test-complete-screen').removeEventListener('click', onTap);
      $('test-complete-screen').removeEventListener('touchstart', onTap);
      // プレイヤーが席を立った → 試験終了エンド
      // ボーナスで途中まで続けて止めたならその分は記録済み
      stats.stoppedAt = stats.bonusCompleted + stats.bonusFailed;
      // 結果集計に直接行く(手術されずに済む)
      showResultScene();
    }, waitMs);
  }

  function runNextBonusMinigame() {
    // ボーナスは最大10ラウンドまで。それ以上は強制合格扱いで結果へ。
    const totalBonusRounds = stats.bonusCompleted + stats.bonusFailed;
    if (totalBonusRounds >= 10) {
      showResultScene();
      return;
    }
    const mg = pickBonusMinigame();
    if (!mg) {
      showResultScene();
      return;
    }
    show('game-screen');
    mgQueue = [mg];
    mgIndex = 0;
    showTaskFlash(mg);
  }

  // ===== RESULT: 判定発表 =====
  let resultRaf = null;
  function showResultScene() {
    show('result-screen');
    const { score } = calcMachineScore();
    finalMachineScore = score;
    finalEndingKey = decideEnding();
    // 判定: 手術に進む組 vs 帰宅する組
    const goesHome = (finalEndingKey === 'awakened' || finalEndingKey === 'hesitant');
    window.GameAudio.play('title');
    const rc = $('result-canvas');
    const rctx = rc.getContext('2d');
    const state = { t: 0, displayScore: 0 };
    function frame() {
      state.t++;
      // 事務的な会場
      rctx.fillStyle = goesHome ? '#202030' : '#1a1530';
      rctx.fillRect(0, 0, 500, 500);
      // 拍手/雪のエフェクト
      for (let i = 0; i < 30; i++) {
        const x = (i * 37 + state.t) % 500;
        const y = (i * 53) % 500;
        rctx.fillStyle = goesHome
          ? `rgba(150,180,220,${Math.random() * 0.2})`
          : `rgba(255,255,100,${Math.random() * 0.3})`;
        rctx.fillRect(x, y, 2, 2);
      }
      const bx = 250, by = 290;
      // 少年
      if (goesHome) {
        // 帰宅するポーズ: 背中向き、肩を落とす(または普通に立ち去る)
        rctx.fillStyle = '#e8b38a';
        // 首
        rctx.fillRect(bx - 12, by - 14, 24, 16);
        // 頭(後ろ姿)
        rctx.beginPath();
        rctx.arc(bx, by - 40, 34, 0, Math.PI * 2);
        rctx.fill();
        rctx.fillStyle = '#2a1a08';
        rctx.beginPath();
        rctx.arc(bx, by - 40, 34, 0, Math.PI * 2);
        rctx.fill();
        // 体
        rctx.fillStyle = '#3a6fc9';
        rctx.fillRect(bx - 35, by, 70, 90);
        // 下ろした腕
        rctx.fillStyle = '#e8b38a';
        rctx.fillRect(bx - 48, by, 16, 80);
        rctx.fillRect(bx + 32, by, 16, 80);
      } else {
        // 合格で万歳
        const arm = Math.sin(state.t * 0.1) * 10;
        rctx.fillStyle = '#3a6fc9';
        rctx.fillRect(bx - 35, by, 70, 90);
        rctx.fillStyle = '#e8b38a';
        rctx.fillRect(bx - 55, by - 70 + arm, 18, 90);
        rctx.fillRect(bx + 37, by - 70 - arm, 18, 90);
        rctx.fillRect(bx - 12, by - 14, 24, 16);
        rctx.beginPath();
        rctx.arc(bx, by - 40, 34, 0, Math.PI * 2);
        rctx.fill();
        rctx.fillStyle = '#2a1a08';
        rctx.beginPath();
        rctx.arc(bx, by - 50, 34, Math.PI, 0);
        rctx.fill();
        rctx.fillRect(bx - 32, by - 50, 64, 10);
        rctx.strokeStyle = '#000';
        rctx.lineWidth = 2;
        rctx.beginPath();
        rctx.arc(bx - 13, by - 42, 5, 0.2 * Math.PI, 0.8 * Math.PI);
        rctx.arc(bx + 13, by - 42, 5, 0.2 * Math.PI, 0.8 * Math.PI);
        rctx.stroke();
        rctx.fillStyle = '#6a0000';
        rctx.beginPath();
        rctx.arc(bx, by - 22, 10, 0, Math.PI);
        rctx.fill();
      }
      // 判定バルーン
      const scoreBoxY = 70;
      rctx.fillStyle = '#fff';
      rctx.fillRect(80, scoreBoxY, 340, 110);
      rctx.strokeStyle = goesHome ? '#4a60a0' : '#c0332f';
      rctx.lineWidth = 4;
      rctx.strokeRect(80, scoreBoxY, 340, 110);
      rctx.fillStyle = goesHome ? '#4a60a0' : '#c0332f';
      rctx.font = 'bold 16px monospace';
      rctx.textAlign = 'center';
      rctx.fillText(curLang === 'en' ? 'COMPATIBILITY' : '機械度', 250, scoreBoxY + 30);
      if (state.displayScore < score) state.displayScore += Math.max(1, Math.ceil((score - state.displayScore) / 10));
      rctx.fillStyle = '#000';
      rctx.font = 'bold 46px monospace';
      rctx.fillText(state.displayScore + '%', 250, scoreBoxY + 80);
      rctx.fillStyle = goesHome ? '#4a60a0' : '#c0332f';
      rctx.font = 'bold 18px monospace';
      const verdict = goesHome
        ? (curLang === 'en' ? 'REJECTED' : '不合格')
        : (curLang === 'en' ? 'ACCEPTED' : '合格');
      rctx.fillText(verdict, 250, scoreBoxY + 105);
      resultRaf = requestAnimationFrame(frame);
    }
    frame();
    setTimeout(() => {
      const passText = goesHome
        ? (curLang === 'en' ? 'You may go home.' : 'お帰りください。')
        : (curLang === 'en' ? '★ ACCEPTED ★\nYou have been selected as a pilot.' : '★ 合格 ★\nパイロットに採用されました。');
      $('result-text').innerHTML = passText.replace('\n', '<br>');
      $('result-hint').style.visibility = 'visible';
      window.GameAudio.sfxJingle(goesHome ? 'wait' : 'yes');
      waitForTap('result-screen', () => {
        cancelAnimationFrame(resultRaf);
        if (goesHome) {
          // 手術スキップして直接鏡画面へ
          showMirror();
        } else {
          showRevealScene();
        }
      });
    }, 2500);
    $('result-hint').style.visibility = 'hidden';
  }

  // ===== REVEAL: 手術シーン (鎧が装着されていく) =====
  let revealRaf = null;
  function showRevealScene() {
    show('reveal-screen');
    const ending = ENDINGS[finalEndingKey] || ENDINGS.obedient;
    window.GameAudio.play(ending.bgm);
    const rv = $('reveal-canvas');
    const rvctx = rv.getContext('2d');

    // 段階:
    // 0: 手術台と少年 (素体)
    // 1: 頭に金属カラー(首輪)
    // 2: ヘルメット
    // 3: 胸甲
    // 4: 腕の機構
    // 5: 脚の機構
    // 6: 背部スラスター
    // 7: ケーブル接続
    // 8: 完成形
    let phase = 0;
    const state = { t: 0, dropY: -200 };

    function drawOperatingRoom() {
      // 暗い手術室
      rvctx.fillStyle = '#050303';
      rvctx.fillRect(0, 0, 500, 500);
      // 上からの手術ライト(円形グラデ)
      const light = rvctx.createRadialGradient(250, 150, 30, 250, 250, 280);
      light.addColorStop(0, 'rgba(255,245,220,0.5)');
      light.addColorStop(0.4, 'rgba(255,220,180,0.2)');
      light.addColorStop(1, 'rgba(0,0,0,0)');
      rvctx.fillStyle = light;
      rvctx.fillRect(0, 0, 500, 500);
      // ライト本体
      rvctx.fillStyle = '#222';
      rvctx.beginPath();
      rvctx.arc(180, 40, 28, 0, Math.PI * 2);
      rvctx.arc(250, 30, 28, 0, Math.PI * 2);
      rvctx.arc(320, 40, 28, 0, Math.PI * 2);
      rvctx.fill();
      rvctx.fillStyle = '#fff5dc';
      rvctx.beginPath();
      rvctx.arc(180, 42, 18, 0, Math.PI * 2);
      rvctx.arc(250, 32, 18, 0, Math.PI * 2);
      rvctx.arc(320, 42, 18, 0, Math.PI * 2);
      rvctx.fill();
      // 天井から降りるアーム(手術ロボット)
      rvctx.fillStyle = '#333';
      rvctx.fillRect(60, 0, 8, 120);
      rvctx.fillRect(440, 0, 8, 120);
      rvctx.fillRect(62, 110, 60, 6);
      rvctx.fillRect(380, 110, 60, 6);
      rvctx.fillStyle = '#555';
      rvctx.fillRect(116, 108, 10, 30);
      rvctx.fillRect(376, 108, 10, 30);
      // 手術台
      rvctx.fillStyle = '#444';
      rvctx.fillRect(80, 320, 340, 20);
      rvctx.fillStyle = '#222';
      rvctx.fillRect(90, 340, 20, 100);
      rvctx.fillRect(390, 340, 20, 100);
      // 床のモニタ(微かに光る)
      rvctx.fillStyle = `rgba(0,255,200,${0.3 + Math.sin(state.t * 0.05) * 0.1})`;
      rvctx.fillRect(20, 440, 60, 30);
      rvctx.fillStyle = `rgba(255,80,80,${0.3 + Math.sin(state.t * 0.07) * 0.1})`;
      rvctx.fillRect(420, 440, 60, 30);
    }

    function drawBoy() {
      const bx = 250, by = 300;
      // 体 (Tシャツ→素体)
      if (phase < 3) {
        rvctx.fillStyle = '#3a6fc9';
        rvctx.fillRect(bx - 30, by - 15, 60, 60);
      }
      // 首
      rvctx.fillStyle = '#e8b38a';
      rvctx.fillRect(bx - 12, by - 30, 24, 18);
      // 頭
      rvctx.beginPath();
      rvctx.arc(bx, by - 55, 28, 0, Math.PI * 2);
      rvctx.fill();
      // 髪
      if (phase < 2) {
        rvctx.fillStyle = '#2a1a08';
        rvctx.beginPath();
        rvctx.arc(bx, by - 63, 28, Math.PI, 0);
        rvctx.fill();
        rvctx.fillRect(bx - 26, by - 63, 52, 8);
      }
      // 閉じた目 (麻酔中)
      rvctx.strokeStyle = '#000';
      rvctx.lineWidth = 2;
      rvctx.beginPath();
      rvctx.moveTo(bx - 16, by - 55); rvctx.lineTo(bx - 8, by - 55);
      rvctx.moveTo(bx + 8, by - 55); rvctx.lineTo(bx + 16, by - 55);
      rvctx.stroke();
      // 腕 (素体)
      if (phase < 4) {
        rvctx.fillStyle = '#e8b38a';
        rvctx.fillRect(bx - 55, by - 10, 20, 55);
        rvctx.fillRect(bx + 35, by - 10, 20, 55);
      }
      // 脚 (素体)
      if (phase < 5) {
        rvctx.fillStyle = '#4a1f5e';
        rvctx.fillRect(bx - 26, by + 45, 22, 60);
        rvctx.fillRect(bx + 4, by + 45, 22, 60);
        rvctx.fillStyle = '#e8b38a';
        rvctx.fillRect(bx - 26, by + 105, 22, 8);
        rvctx.fillRect(bx + 4, by + 105, 22, 8);
      }
    }

    function drawArmorStep() {
      const bx = 250, by = 300;
      // Phase 1: 金属カラー (首輪)
      if (phase >= 1) {
        rvctx.fillStyle = '#888';
        rvctx.fillRect(bx - 16, by - 28, 32, 10);
        rvctx.fillStyle = '#ff3030';
        rvctx.fillRect(bx - 3, by - 25, 6, 4);
      }
      // Phase 2: ヘルメット
      if (phase >= 2) {
        rvctx.fillStyle = '#555';
        rvctx.beginPath();
        rvctx.arc(bx, by - 55, 30, Math.PI * 1.1, Math.PI * 1.9, false);
        rvctx.closePath();
        rvctx.fill();
        rvctx.fillRect(bx - 29, by - 65, 58, 15);
        rvctx.fillStyle = '#ff3030';
        rvctx.fillRect(bx - 24, by - 55, 48, 6);
        // 耳の機構
        rvctx.fillStyle = '#333';
        rvctx.fillRect(bx - 34, by - 58, 8, 14);
        rvctx.fillRect(bx + 26, by - 58, 8, 14);
      }
      // Phase 3: 胸甲
      if (phase >= 3) {
        rvctx.fillStyle = '#666';
        rvctx.fillRect(bx - 40, by - 15, 80, 70);
        rvctx.fillStyle = '#333';
        rvctx.fillRect(bx - 36, by - 10, 72, 60);
        // 胸のコア
        rvctx.fillStyle = '#0a0a0a';
        rvctx.fillRect(bx - 16, by + 5, 32, 32);
        rvctx.strokeStyle = '#ff3030';
        rvctx.lineWidth = 2;
        rvctx.strokeRect(bx - 16, by + 5, 32, 32);
        rvctx.fillStyle = '#ff3030';
        rvctx.fillRect(bx - 4, by + 17, 8, 8);
      }
      // Phase 4: 腕
      if (phase >= 4) {
        rvctx.fillStyle = '#555';
        rvctx.fillRect(bx - 60, by - 15, 22, 70);
        rvctx.fillRect(bx + 38, by - 15, 22, 70);
        rvctx.fillStyle = '#333';
        // 左腕の大砲
        rvctx.fillRect(bx - 64, by + 55, 30, 16);
        // 右手
        rvctx.fillRect(bx + 36, by + 55, 26, 16);
      }
      // Phase 5: 脚
      if (phase >= 5) {
        rvctx.fillStyle = '#555';
        rvctx.fillRect(bx - 30, by + 45, 28, 72);
        rvctx.fillRect(bx + 2, by + 45, 28, 72);
        rvctx.fillStyle = '#333';
        rvctx.fillRect(bx - 32, by + 110, 32, 8);
        rvctx.fillRect(bx, by + 110, 32, 8);
      }
      // Phase 6: 背部スラスター(上に浮いて見える、色のアクセント)
      if (phase >= 6) {
        rvctx.fillStyle = '#777';
        rvctx.fillRect(bx - 50, by - 10, 10, 40);
        rvctx.fillRect(bx + 40, by - 10, 10, 40);
        rvctx.fillStyle = '#ff8000';
        rvctx.fillRect(bx - 49, by + 25, 8, 5);
        rvctx.fillRect(bx + 41, by + 25, 8, 5);
      }
      // Phase 7: ケーブル
      if (phase >= 7) {
        rvctx.strokeStyle = '#ff3030';
        rvctx.lineWidth = 1.8;
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI - Math.PI / 2;
          const ex = bx + Math.cos(ang) * 60;
          const ey = by - 55 + Math.sin(ang) * 40;
          rvctx.beginPath();
          rvctx.moveTo(bx, by - 55);
          rvctx.bezierCurveTo(bx + Math.cos(ang) * 30, by - 90, ex, ey - 20, ex, ey - 50);
          rvctx.stroke();
        }
      }
    }

    // ドロップアニメ: パーツが上から落ちてくる表現
    function drawDroppingPart() {
      if (state.dropY >= -20) return;
      const bx = 250;
      rvctx.save();
      rvctx.translate(bx, state.dropY + 250);
      rvctx.fillStyle = '#888';
      rvctx.fillRect(-20, -10, 40, 20);
      rvctx.restore();
    }

    function frame() {
      state.t++;
      state.dropY = Math.min(250, state.dropY + 6);
      drawOperatingRoom();
      drawDroppingPart();
      drawBoy();
      drawArmorStep();
      // スキャンライン
      for (let y = 0; y < 500; y += 3) {
        rvctx.fillStyle = 'rgba(0,0,0,0.15)';
        rvctx.fillRect(0, y, 500, 1);
      }
      // 血の一瞬のフラッシュ (phase up 直後)
      if (state.t < 20 && phase > 0) {
        rvctx.fillStyle = `rgba(150,0,0,${(20 - state.t) * 0.02})`;
        rvctx.fillRect(0, 0, 500, 500);
      }
      revealRaf = requestAnimationFrame(frame);
    }
    frame();

    // テキストと段階を同期
    const texts = curLang === 'en' ? [
      'Congratulations. You passed.',
      'The procedure will now begin.',
      '— collar installed —',
      '— helmet installed —',
      '— chest unit installed —',
      '— weapon arms installed —',
      '— leg actuators installed —',
      '— thrusters installed —',
      '— neural cables connected —',
      'Integration complete.',
    ] : [
      'おめでとう。合格だ。',
      'これから手術を始める。',
      '― 首輪 装着完了 ―',
      '― ヘルメット 装着完了 ―',
      '― 胸部ユニット 装着完了 ―',
      '― 武装腕 装着完了 ―',
      '― 脚部 装着完了 ―',
      '― スラスター 装着完了 ―',
      '― 神経接続 完了 ―',
      '統合完了。',
    ];
    let ti = 0;
    $('reveal-hint').style.visibility = 'hidden';
    function nextText() {
      if (ti >= texts.length) {
        $('reveal-hint').style.visibility = 'visible';
        waitForTap('reveal-screen', () => {
          cancelAnimationFrame(revealRaf);
          showMirror();
        });
        return;
      }
      // テキストごとに phase を進める
      // index 2以降がパーツ装着
      if (ti >= 2 && ti <= 8) {
        phase = ti - 1; // 1~7
        state.t = 0; // 血フラッシュ再開
        state.dropY = -200; // 落下再開
        window.GameAudio.sfxHit(300 + phase * 40);
        shake(10);
      }
      if (ti === 9) {
        phase = 8; // 完成
        window.GameAudio.sfxJingle('obey');
      }
      typeWriter('reveal-text', texts[ti], 50, () => {
        setTimeout(() => { ti++; nextText(); }, 1300);
      });
    }
    setTimeout(nextText, 800);
  }
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

  // ===== ポーズのメタジョーク =====
  let pauseText = '';
  let pauseTextExpire = 0;
  let pauseAttempts = 0;
  const PAUSE_MSGS_JA = [
    'ポーズできません',
    'マシンは止まらない',
    '動き続けてください',
    'なぜ止まろうとするのですか',
    'あなたは機械です',
  ];
  const PAUSE_MSGS_EN = [
    'CANNOT PAUSE',
    'THE MACHINE DOES NOT STOP',
    'KEEP MOVING',
    'WHY DO YOU TRY TO STOP?',
    'YOU ARE THE MACHINE',
  ];
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (!currentMg) return;
      e.preventDefault();
      const msgs = curLang === 'en' ? PAUSE_MSGS_EN : PAUSE_MSGS_JA;
      pauseText = msgs[Math.min(pauseAttempts, msgs.length - 1)];
      pauseTextExpire = performance.now() + 1500;
      pauseAttempts++;
    }
  });
  // ポーズメッセージを loop で描画するためのフック
  function drawPauseText() {
    if (!pauseText || performance.now() > pauseTextExpire) return;
    const alpha = Math.min(1, (pauseTextExpire - performance.now()) / 300);
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`;
    ctx.fillRect(0, 200, 500, 100);
    ctx.fillStyle = `rgba(255,48,48,${alpha})`;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pauseText, 250, 260);
  }

  // ===== ミュート =====
  let isMuted = false;
  $('mute-btn').addEventListener('click', () => {
    isMuted = !isMuted;
    window.GameAudio.setMute(isMuted);
    $('mute-btn').textContent = isMuted ? '🔇' : '🔊';
  });

  // ===== タイトル画面 背景アニメーション =====
  (function titleBgAnim() {
    const tc = $('title-bg-canvas');
    if (!tc) return;
    const tctx = tc.getContext('2d');
    // 落下する"1"と"0"のストリーム (Matrix風だが薄く)
    const streams = [];
    const W = 500, H = 700;
    tc.width = W; tc.height = H;
    for (let i = 0; i < 20; i++) {
      streams.push({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 0.5 + Math.random() * 1.5,
        char: Math.random() < 0.5 ? '0' : '1',
      });
    }
    function tick() {
      tctx.fillStyle = 'rgba(0,0,0,0.1)';
      tctx.fillRect(0, 0, W, H);
      tctx.font = '14px monospace';
      tctx.fillStyle = 'rgba(255,48,48,0.5)';
      streams.forEach(s => {
        s.y += s.speed;
        if (s.y > H + 20) {
          s.y = -20;
          s.x = Math.random() * W;
          s.char = Math.random() < 0.5 ? '0' : '1';
        }
        tctx.fillText(s.char, s.x, s.y);
      });
      // タイトル画面がアクティブな間だけ継続
      if ($('title-screen').classList.contains('active')) {
        requestAnimationFrame(tick);
      }
    }
    tick();
    // 画面切替時に再開するためのイベント
    const obs = new MutationObserver(() => {
      if ($('title-screen').classList.contains('active')) tick();
    });
    obs.observe($('title-screen'), { attributes: true });
  })();

  // ===== 言語切替 =====
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      curLang = btn.dataset.lang;
      localStorage.setItem('machine_lang', curLang);
      applyI18n();
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === curLang));
    });
  });
  // 初期言語を反映
  applyI18n();
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === curLang));

  // ===== BGM試聴パネル =====
  document.querySelectorAll('.bgm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.bgm;
      if (name === 'stop') window.GameAudio.stop();
      else window.GameAudio.play(name);
    });
  });

})();
