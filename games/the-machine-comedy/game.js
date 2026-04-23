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
      subtitle: '47歳。まだ夢、諦めてない。',
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
      msg_perfect_machine: 'おじさんは、完璧なマシンになった。',
      msg_obedient: 'おじさんは、合格した。',
      msg_hesitant: 'おじさんは、少しだけ、迷った。',
      msg_awakened: 'おじさんは、家に帰ることにした。',
      msg_defective: 'おじさんは機械になれなかった。',
    },
    en: {
      subtitle: '47 years old. Still chasing the dream.',
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
      msg_perfect_machine: 'The old man became a perfect machine.',
      msg_obedient: 'The old man passed the test.',
      msg_hesitant: 'The old man hesitated, just a little.',
      msg_awakened: 'The old man decided to go home.',
      msg_defective: 'The old man did not execute the commands correctly.',
    },
  };
  // SurrealI18n で言語状態を管理（machine_lang → sg_lang に統一）
  // 旧 machine_lang キーがあれば移行
  try {
    const old = localStorage.getItem('machine_lang');
    if (old && !localStorage.getItem('sg_lang')) {
      localStorage.setItem('sg_lang', old);
    }
    localStorage.removeItem('machine_lang');
  } catch(e) {}
  SurrealI18n.init(null, { onLangChange: function(lang) { curLang = lang; applyI18n(); } });
  let curLang = SurrealI18n.currentLang;
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
        ctx.fillText(curLang === 'en' ? 'PRESS' : '連打', 250, 240);
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
        ctx.fillText(curLang === 'en' ? 'TAP IN GREEN' : '緑でタップ', 250, 160);
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
        ctx.fillText(s.side === 'L' ? (curLang === 'en' ? 'TAP RIGHT' : '右をタップ') : (curLang === 'en' ? 'TAP LEFT' : '左をタップ'), 250, 60);
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
        ctx.fillText(curLang === 'en' ? 'HOLD TO CHARGE' : '長押しでチャージ', 250, 80);
        ctx.fillText(curLang === 'en' ? 'RELEASE IN GREEN' : '緑で離す', 250, 220);
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
        ctx.fillText(curLang === 'en' ? '!  DODGE  !' : '！　避けろ　！', 250, 28);
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
        ctx.fillText(curLang === 'en' ? 'MANUAL OVERRIDE' : '手動操作', 250, 80);
        ctx.fillText(curLang === 'en' ? 'ALTERNATE A-B' : 'A・B交互に', 250, 120);
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
        ctx.fillText(`${curLang === 'en' ? 'HP' : '体力'}: ${s.hp}`, 250, 60);
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
        const sinVal = Math.sin(s.phase);
        const r = 80 + sinVal * 60;
        ctx.fillStyle = '#fef6e4'; ctx.fillRect(0, 0, 500, 500);
        // ターゲット帯(最大時)
        ctx.strokeStyle = 'rgba(57,255,20,0.3)';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(250, 250, 138, 0, Math.PI*2); ctx.stroke();
        // 息の円
        ctx.fillStyle = sinVal > 0.85 ? '#39ff14' : '#a0d8ef';
        ctx.beginPath(); ctx.arc(250, 250, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAP WHEN FULL', 250, 120);
        ctx.fillText('BREATHE', 250, 256);
      },
      onClick: (s) => {
        const sinVal = Math.sin(s.phase);
        return sinVal > 0.85 ? 'win' : 'lose';
      }
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
      name: 'BRUSH TEETH', act: 2, duration: 4500, jingle: 'soft',
      init: (s) => { s.count = 0; s.need = 6; s.lastSide = null; s.clean = 0; s.flashSide = null; s.flashT = 0; },
      draw: (s) => {
        s.clean = s.count / s.need;
        if (s.flashT > 0) s.flashT -= 0.05;
        ctx.fillStyle = '#e0f0ff'; ctx.fillRect(0, 0, 500, 500);
        // 左右の大きなタップ領域(色で示す)
        const nextSide = s.lastSide === 'L' ? 'R' : (s.lastSide === 'R' ? 'L' : null);
        // 左ゾーン
        ctx.fillStyle = (nextSide === 'L' || nextSide === null) ? '#ffd6e4' : '#eeeeee';
        ctx.fillRect(0, 100, 250, 400);
        // 右ゾーン
        ctx.fillStyle = (nextSide === 'R' || nextSide === null) ? '#ffd6e4' : '#eeeeee';
        ctx.fillRect(250, 100, 250, 400);
        // 中央の区切り線
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.moveTo(250, 100); ctx.lineTo(250, 500); ctx.stroke();
        ctx.setLineDash([]);
        // 左右の矢印ヒント
        ctx.fillStyle = '#333';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        if (nextSide === 'L' || nextSide === null) ctx.fillText('←', 125, 370);
        if (nextSide === 'R' || nextSide === null) ctx.fillText('→', 375, 370);
        // 鏡(小さめ)
        ctx.fillStyle = '#ccc';
        ctx.fillRect(175, 115, 150, 120);
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(180, 120, 140, 110);
        // おじさんの顔
        const bx = 250, by = 175;
        ctx.fillStyle = '#e8b38a';
        ctx.beginPath();
        ctx.arc(bx, by, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a1a08';
        ctx.beginPath();
        ctx.arc(bx, by - 8, 40, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(bx - 36, by - 8, 72, 10);
        // 目
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(bx - 12, by - 2, 5, 0, Math.PI * 2); ctx.arc(bx + 12, by - 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(bx - 12, by - 2, 2, 0, Math.PI * 2); ctx.arc(bx + 12, by - 2, 2, 0, Math.PI * 2); ctx.fill();
        // 歯
        ctx.fillStyle = '#000';
        ctx.fillRect(bx - 14, by + 11, 28, 10);
        ctx.fillStyle = `rgb(${Math.round(200 + s.clean * 55)},${Math.round(200 + s.clean * 55)},${Math.round(180 + s.clean * 75)})`;
        for (let i = 0; i < 4; i++) ctx.fillRect(bx - 12 + i * 7, by + 13, 5, 7);
        // 歯ブラシ(揺れる)
        const bangle = s.lastSide === 'L' ? -0.3 : 0.3;
        ctx.save();
        ctx.translate(bx, by + 18);
        ctx.rotate(bangle);
        ctx.fillStyle = '#ff80c0';
        ctx.fillRect(-3, -3, 30, 6);
        ctx.fillStyle = '#fff';
        ctx.fillRect(25, -5, 10, 10);
        ctx.restore();
        // フラッシュ(押した側)
        if (s.flashT > 0 && s.flashSide) {
          const fx = s.flashSide === 'L' ? 0 : 250;
          ctx.fillStyle = `rgba(255,255,255,${s.flashT * 0.5})`;
          ctx.fillRect(fx, 100, 250, 400);
        }
        // テキスト
        ctx.fillStyle = '#333';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(curLang === 'en' ? 'BRUSH L - R' : '左右交互に磨く', 250, 70);
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${s.count}/${s.need}`, 250, 470);
      },
      onClick: (s, x, y) => {
        if (y < 100) return null;
        const side = x < 250 ? 'L' : 'R';
        if (s.lastSide === side) {
          // 同側連打は無効(でも失敗にもしない、軽くフラッシュだけ)
          return null;
        }
        s.lastSide = side;
        s.count++;
        s.flashSide = side;
        s.flashT = 1;
        window.GameAudio.sfxHit(500 + s.count * 40);
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
      name: 'WHAT DO', act: 2, duration: 3500, jingle: 'yes',
      init: (s) => {
        s.count = 0;
        s.need = 12;
        s.fireworks = [];
        s.t = 0;
        const qs = curLang === 'en'
          ? ['WHAT DO?!','WHY?!','HELP!!','PANIC!!','AAAAA!','NO NO NO','HUH?!','OH NO!']
          : ['どうする？','なぜ？','助けて！！','パニック！','あああ！','いやいや','え、え？','やばい！'];
        s.question = qs[Math.floor(Math.random() * qs.length)];
      },
      draw: (s) => {
        s.t++;
        // 背景(パステルピンクに徐々にエキサイト)
        const hue = Math.min(1, s.count / s.need);
        ctx.fillStyle = `rgb(${255 - Math.round(hue * 30)},${220 - Math.round(hue * 40)},${220 - Math.round(hue * 20)})`;
        ctx.fillRect(0, 0, 500, 500);
        // ぼさぼさ2人(画面いっぱい)
        if (hairyDuoImg.complete && hairyDuoImg.naturalWidth > 0) {
          const imgW = 460;
          const imgH = imgW * (hairyDuoImg.naturalHeight / hairyDuoImg.naturalWidth);
          const shake = Math.min(12, s.count * 1.2);
          const dx = (Math.random() - 0.5) * shake;
          const dy = (Math.random() - 0.5) * shake;
          ctx.drawImage(hairyDuoImg, 250 - imgW / 2 + dx, 200 - imgH / 2 + dy, imgW, imgH);
        }
        // でかい「どうする？」
        ctx.save();
        const wobble = 1 + Math.sin(s.t * 0.3) * 0.04;
        ctx.translate(250, 380);
        ctx.scale(wobble, wobble);
        ctx.fillStyle = '#c0332f';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 6;
        // 長さに応じてフォント縮小
        const qLen = s.question.length;
        const qSize = qLen > 7 ? 36 : (qLen > 5 ? 44 : 52);
        ctx.font = `bold ${qSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeText(s.question, 0, 0);
        ctx.fillText(s.question, 0, 0);
        ctx.restore();
        // カウンター
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${s.count}/${s.need}`, 250, 450);
        // 花火パーティクル更新
        for (let i = s.fireworks.length - 1; i >= 0; i--) {
          const f = s.fireworks[i];
          f.x += f.vx; f.y += f.vy; f.vy += 0.12; f.life -= 0.025;
          if (f.life <= 0) { s.fireworks.splice(i, 1); continue; }
          ctx.fillStyle = `rgba(${f.c},${f.life})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3 + f.life * 3, 0, Math.PI * 2);
          ctx.fill();
          // 尾
          ctx.strokeStyle = `rgba(${f.c},${f.life * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x - f.vx * 3, f.y - f.vy * 3);
          ctx.stroke();
        }
      },
      onClick: (s, x, y) => {
        s.count++;
        // 花火爆発
        const colors = ['255,80,80', '80,180,255', '255,220,0', '80,255,120', '255,130,220', '220,160,255'];
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 18; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 3 + Math.random() * 6;
          s.fireworks.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,
            life: 1,
            c: col,
          });
        }
        window.GameAudio.sfxHit(500 + s.count * 30);
        shake(4);
        if (s.count >= s.need) return 'win';
        return null;
      }
    },
    {
      name: 'WHERE', act: 2, duration: 4000, jingle: 'yes',
      init: (s) => {
        s.t = 0;
        // 質問をランダム選択
        const questions = curLang === 'en'
          ? ['WHERE?','WHAT IS THIS?','WHAT PART?','GUESS!','NAME IT!']
          : ['ここはなに？','どこ？','これは何？','当てて！','名前は？'];
        s.question = questions[Math.floor(Math.random() * questions.length)];
        // 正解の「膝」+ ハズレ選択肢をランダムから2個選ぶ
        const wrongPool = curLang === 'en'
          ? ['BURGER','NEW YORK','EARTH','YOUR DAD','FAN','SUSHI','PRETTY']
          : ['ハンバーガー','ニューヨーク','地球','父親','換気扇','寿司','ぷりぷりプリティー'];
        // シャッフル
        const shuffled = wrongPool.slice().sort(() => Math.random() - 0.5);
        const wrongs = shuffled.slice(0, 2);
        const correct = curLang === 'en' ? 'KNEE' : 'ひざ';
        // 3つの選択肢を作る(位置もランダム)
        const allOpts = [correct, wrongs[0], wrongs[1]];
        allOpts.sort(() => Math.random() - 0.5);
        s.opts = allOpts;
        s.correctLabel = correct;
      },
      draw: (s) => {
        s.t++;
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(0, 0, 500, 500);
        // 質問
        ctx.fillStyle = '#000';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.question, 250, 50);
        // パスタ男
        if (pastaManImg.complete && pastaManImg.naturalWidth > 0) {
          const imgW = 340;
          const imgH = imgW * (pastaManImg.naturalHeight / pastaManImg.naturalWidth);
          const bobble = Math.sin(s.t * 0.08) * 3;
          ctx.drawImage(pastaManImg, 250 - imgW / 2, 75 + bobble, imgW, imgH);
        }
        // 選択肢
        const btnY = 410;
        const btnH = 60;
        const btnW = 148;
        const gap = 8;
        const startX = 250 - (btnW * 3 + gap * 2) / 2;
        s.opts.forEach((opt, i) => {
          const bx = startX + i * (btnW + gap);
          ctx.fillStyle = '#fff';
          ctx.fillRect(bx, btnY, btnW, btnH);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeRect(bx, btnY, btnW, btnH);
          ctx.fillStyle = '#000';
          // 長さに応じてフォント調整
          const len = opt.length;
          const fs = len > 7 ? 13 : (len > 5 ? 15 : 18);
          ctx.font = `bold ${fs}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(opt, bx + btnW / 2, btnY + btnH / 2 + 6);
        });
      },
      onClick: (s, x, y) => {
        const btnY = 410;
        const btnH = 60;
        const btnW = 148;
        const gap = 8;
        const startX = 250 - (btnW * 3 + gap * 2) / 2;
        if (y < btnY || y > btnY + btnH) return null;
        for (let i = 0; i < 3; i++) {
          const bx = startX + i * (btnW + gap);
          if (x >= bx && x <= bx + btnW) {
            return s.opts[i] === s.correctLabel ? 'win' : 'lose';
          }
        }
        return null;
      }
    },
    {
      name: 'COMPLIMENT', act: 2, duration: 4000, jingle: 'yes',
      init: (s) => {
        s.count = 0;
        s.need = 5;
        s.blush = 0;
        s.bounce = 0;
        s.hearts = [];
        s.t = 0;
        // 指示文をランダム選択
        const prompts = curLang === 'en'
          ? ['COMPLIMENT HIM','PRAISE HIM','MAKE HIM BLUSH','SAY NICE THINGS','BE KIND']
          : ['ほめてあげて','褒めちぎれ','照れさせろ','優しくして','機嫌を取れ'];
        s.prompt = prompts[Math.floor(Math.random() * prompts.length)];
        // ボタン文言もランダム
        const btnLabels = curLang === 'en'
          ? ['PRAISE ♥','NICE! ♥','COOL! ♥','LOVELY ♥','YOU GOOD ♥','PERFECT ♥']
          : ['ほめる ♥','素敵！ ♥','かわいい ♥','すごい ♥','好き ♥','素晴らしい ♥'];
        s.btnLabel = btnLabels[Math.floor(Math.random() * btnLabels.length)];
      },
      draw: (s) => {
        s.t++;
        // 背景(パステルピンク)
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#ffe0f0');
        grad.addColorStop(1, '#fff0d8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 500, 500);
        // 指示
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.prompt, 250, 50);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`${s.count}/${s.need}`, 250, 75);
        // 顔(照れるほど少し跳ねる)
        s.bounce *= 0.85;
        if (catmanImg.complete && catmanImg.naturalWidth > 0) {
          const imgW = 360;
          const imgH = imgW * (catmanImg.naturalHeight / catmanImg.naturalWidth);
          const cx = 250;
          const cy = 210 + s.bounce;
          // 照れ赤オーラ
          if (s.blush > 0) {
            const aura = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
            aura.addColorStop(0, `rgba(255,100,150,${0.5 * s.blush})`);
            aura.addColorStop(1, 'rgba(255,100,150,0)');
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, 500, 500);
          }
          ctx.drawImage(catmanImg, cx - imgW / 2, cy - imgH / 2, imgW, imgH);
          // 顔全体にピンク上乗せ(照れ)
          if (s.blush > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = `rgba(255,120,160,${0.4 * s.blush})`;
            ctx.fillRect(cx - imgW / 2, cy - imgH / 2, imgW, imgH);
            ctx.globalCompositeOperation = 'source-over';
          }
        }
        // ハート
        for (let i = s.hearts.length - 1; i >= 0; i--) {
          const h = s.hearts[i];
          h.x += h.vx; h.y += h.vy; h.vy -= 0.12; h.life -= 0.018;
          if (h.life <= 0) { s.hearts.splice(i, 1); continue; }
          ctx.font = `${20 + h.life * 10}px sans-serif`;
          ctx.fillStyle = `rgba(255,80,140,${h.life})`;
          ctx.fillText('♥', h.x, h.y);
        }
        // ボタン(ピンク)
        const btnY = 400;
        ctx.fillStyle = '#ff70a0';
        ctx.fillRect(100, btnY, 300, 70);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(103, btnY + 3, 294, 64);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(s.btnLabel, 250, btnY + 45);
      },
      onClick: (s, x, y) => {
        if (x > 100 && x < 400 && y > 400 && y < 470) {
          s.count++;
          s.blush = Math.min(1, s.blush + 0.22);
          s.bounce = -10;
          // ハート放出
          for (let i = 0; i < 6; i++) {
            s.hearts.push({
              x: 250 + (Math.random() - 0.5) * 80,
              y: 240 + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 4,
              vy: -2 - Math.random() * 3,
              life: 1,
            });
          }
          window.GameAudio.sfxJingle('yes');
          if (s.count >= s.need) return 'win';
        }
        return null;
      }
    },
    {
      name: 'FANTASY', act: 2, duration: 4500, jingle: 'soft',
      init: (s) => {
        s.segs = [0,1,2,3,4].map(i => ({ idx: i, eaten: false }));
        s.ateCount = 0;
        s.t = 0;
        s.showFantasy = 0;
        s.yummies = [];
        // 指示ランダム
        const prompts = curLang === 'en'
          ? ['EAT IT ALL','CHOMP CHOMP','YUM YUM','DEVOUR IT','EAT UP']
          : ['ぜんぶ食べて','食べちゃえ','もぐもぐ','召し上がれ','いただきます'];
        s.prompt = prompts[Math.floor(Math.random() * prompts.length)];
        // 美味いのバリエーション
        s.yummyOptions = curLang === 'en'
          ? ['YUMMY!','TASTY!','MMMH!','DELICIOUS!','YUM!','NOM!']
          : ['美味い！','うまっ！','うめえ！','絶品！','旨っ！','おいちい！'];
        // 最後のデカ文字ランダム
        const finaleTxts = curLang === 'en'
          ? ['FANTASY!','MAGIC!','MIRACLE!','WHAT A DAY!','BEAUTIFUL!']
          : ['ファンタジー！','まほう！','奇跡！','最高！','神秘！'];
        s.finaleText = finaleTxts[Math.floor(Math.random() * finaleTxts.length)];
      },
      draw: (s) => {
        s.t++;
        // 背景
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#ffe4a8');
        grad.addColorStop(0.6, '#ffb8d0');
        grad.addColorStop(1, '#80c25b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 500, 500);
        // キラキラ
        for (let i = 0; i < 15; i++) {
          const sx = (i * 31 + s.t * 2) % 500;
          const sy = (i * 53) % 300;
          ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(s.t * 0.1 + i) * 0.3})`;
          ctx.fillText('✦', sx, sy);
        }
        // テキスト
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.prompt, 250, 80);
        ctx.font = '14px sans-serif';
        ctx.fillText(`${s.ateCount}/5`, 250, 105);
        // 5パーツをそれぞれ同じ矩形に重ねて描画(各画像内で正しい位置に配置済み)
        const displayW = 500;
        const displayH = displayW * (414 / 877);
        const baseY = 240;
        s.segs.forEach(seg => {
          if (seg.eaten) return;
          const img = catSegImgs[seg.idx];
          if (!img.complete || img.naturalWidth === 0) return;
          const wobble = Math.sin(s.t * 0.15 + seg.idx * 0.5) * 3;
          ctx.drawImage(img, 0, baseY + wobble, displayW, displayH);
        });
        // 「美味い！」ポップ(各節を食べた瞬間)
        for (let i = s.yummies.length - 1; i >= 0; i--) {
          const y2 = s.yummies[i];
          y2.y -= 1.5;
          y2.life -= 0.02;
          if (y2.life <= 0) { s.yummies.splice(i, 1); continue; }
          ctx.save();
          ctx.translate(y2.x, y2.y);
          const scl = 0.8 + (1 - y2.life) * 0.6;
          ctx.scale(scl, scl);
          ctx.rotate((y2.rot || 0) * (1 - y2.life) * 0.3);
          ctx.fillStyle = `rgba(255,80,30,${y2.life})`;
          ctx.strokeStyle = `rgba(255,255,255,${y2.life})`;
          ctx.lineWidth = 4;
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          const txt = y2.text;
          ctx.strokeText(txt, 0, 0);
          ctx.fillText(txt, 0, 0);
          ctx.restore();
        }
        // 「ファンタジー！」演出
        if (s.showFantasy > 0) {
          ctx.save();
          ctx.translate(250, 250);
          const scale = Math.min(2, s.showFantasy * 0.15);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#ff3070';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 6;
          ctx.font = 'bold 44px sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeText(s.finaleText, 0, 0);
          ctx.fillText(s.finaleText, 0, 0);
          ctx.restore();
          s.showFantasy++;
        }
      },
      onClick: (s, x, y) => {
        const displayW = 500;
        const displayH = displayW * (414 / 877);
        const baseY = 240;
        if (y < baseY - 10 || y > baseY + displayH + 10) return null;
        // 表示座標→元画像(877px基準)のx位置に変換
        const srcX = (x / displayW) * 877;
        // 各パーツが元画像で占める大体のx範囲(目測ベース)
        const bounds = [
          { min: 0,   max: 290 }, // 頭
          { min: 290, max: 420 }, // 2
          { min: 420, max: 540 }, // 3
          { min: 540, max: 670 }, // 4
          { min: 670, max: 877 }, // 尻尾
        ];
        let segIdx = -1;
        for (let i = 0; i < bounds.length; i++) {
          if (srcX >= bounds[i].min && srcX < bounds[i].max) { segIdx = i; break; }
        }
        if (segIdx < 0) return null;
        const seg = s.segs[segIdx];
        if (!seg || seg.eaten) return null;
        seg.eaten = true;
        s.ateCount++;
        const yumText = s.yummyOptions[Math.floor(Math.random() * s.yummyOptions.length)];
        s.yummies.push({ x, y: y - 10, life: 1, rot: Math.random() - 0.5, text: yumText });
        spawnBurst(x, y, '200,50,100', 10);
        shake(5);
        window.GameAudio.sfxHit(300 + segIdx * 60);
        if (s.ateCount >= 5) {
          s.showFantasy = 1;
          setTimeout(() => { if (currentMg && currentMg.name === 'FANTASY') finishMg('win'); }, 900);
        }
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
    $('hud-act').textContent = mg.act === 1 ? (curLang === 'en' ? 'PHASE 1' : 'フェーズ1') : (curLang === 'en' ? 'PHASE 2' : 'フェーズ2');
    $('hud-task').textContent = mgDisplayName(mg);
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
      const progress = Math.min(1, mgIndex / 15); // 16本分で正規化
      // 前半: 透明 → 中盤: 紫 → 後半: 濃い赤紫
      const r = Math.round(40 + progress * 60);
      const g = Math.round(5 + progress * 5);
      const b = Math.round(60 + progress * 40);
      const a = progress * 0.7;
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fillRect(0, 0, 500, 500);
      // 中盤からスキャンライン
      if (progress > 0.3) {
        const scanA = (progress - 0.3) * 0.6;
        ctx.fillStyle = `rgba(0,0,0,${scanA})`;
        for (let y = 0; y < 500; y += 4) ctx.fillRect(0, y, 500, 1);
      }
      // 後半からノイズ粒(不穏さ)
      if (progress > 0.6) {
        for (let i = 0; i < Math.floor(progress * 20); i++) {
          ctx.fillStyle = `rgba(255,0,0,${Math.random() * progress * 0.15})`;
          ctx.fillRect(Math.random() * 500, Math.random() * 500, 2, 2);
        }
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
      $('game-feedback').textContent = currentCombo >= 3 ? `${curLang === 'en' ? 'OK' : 'せいかい'}  x${currentCombo}` : (curLang === 'en' ? 'OK' : 'せいかい');
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
      $('game-feedback').textContent = curLang === 'en' ? 'FAIL' : 'ざんねん';
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
    const displayName = mgDisplayName(mg);
    $('hud-act').textContent = mg.act === 1 ? (curLang === 'en' ? 'PHASE 1' : 'フェーズ1') : (curLang === 'en' ? 'PHASE 2' : 'フェーズ2');
    $('hud-task').textContent = displayName;
    $('game-feedback').textContent = '';
    $('game-feedback').className = 'game-feedback';
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
      // 日本語長い場合は縮小
      const fs = displayName.length > 8 ? 28 : 36;
      ctx.font = `bold ${fs}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(displayName, 0, 12);
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
    const tc = e.touches[0];
    const x = (tc.clientX - rect.left) * (500 / rect.width);
    const y = (tc.clientY - rect.top) * (500 / rect.height);
    lastTouchX = x;
    lastTouchY = y;
    handleInput(x, y, 'down');
  }, { passive: false });
  let lastTouchX = 250, lastTouchY = 250;
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!currentMg) return;
    handleInput(lastTouchX, lastTouchY, 'up');
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
      'WHERE',         // ← イラスト(パスタ男)
      'ANSWER PHONE',
      'COMPLIMENT',    // ← イラスト(猫耳おじさん)
      'WATER PLANT',
      'FANTASY',       // ← イラスト(芋虫)
      'WAVE HELLO',
      'WHAT DO',       // ← イラスト(もじゃもじゃ2人)
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
    // 統計行が全部出揃ったあとにメッセージ＆ゴースト再生
    const statsDelay = lines.length * 300 + 400; // 7行*0.3s + 余白
    setTimeout(() => startGhostReplay(), statsDelay);
    setTimeout(() => {
      $('mirror-message').textContent = t('msg_' + finalEndingKey);
    }, statsDelay + 300);
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
      }
      // 再生終了後はそのまま停止(無限ループしない)
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
        'おじさんは、指示されていない作業を',
        '10回続けた。',
        '',
        '「理想的な適性です」と試験官は微笑んだ。',
        '',
        '今夜、アリーナの観客は叫ぶだろう。',
        '「見ろ、あの機体を！」',
        '',
        'おじさんは、確かにパイロットになった。',
        'ただし、コックピットの中ではなく、',
        'コックピットそのものとして。',
      ],
      en: [
        'After "TEST COMPLETE" was announced,',
        'the middle-aged guy performed 10 more tasks',
        'he was never instructed to do.',
        '',
        '"Ideal compatibility," the examiner smiled.',
        '',
        'Tonight, the arena will roar.',
        '"Look at that unit!"',
        '',
        'The middle-aged guy truly became a pilot.',
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
        '「試験終了」のあと、おじさんは',
        '指示されていない作業を続けた。',
        '',
        '何回かは失敗したが、',
        '「命令がなくても動ける」ことが証明された。',
        '',
        '必要な資質はそれだけだった。',
        '',
        'おじさんは、もう喋れない。',
        'でも、マシンは喋らないから問題ない。',
      ],
      en: [
        'After "TEST COMPLETE", the middle-aged guy',
        'kept performing tasks nobody asked for.',
        '',
        'He failed a few times, but he proved',
        'that he could work without orders.',
        '',
        'That was the only quality required.',
        '',
        'The middle-aged guy can no longer speak.',
        'But machines do not speak. No problem.',
      ],
    },
    // 1~2回やってみたが止めた
    hesitant: {
      title: 'STILL A CHILD',
      color: '#ffd54f',
      bgm: 'finale_warm',
      ja: [
        '「試験終了」のあと、おじさんは',
        '少しだけ、作業を続けた。',
        '',
        'でも、途中で、なぜか立ち上がった。',
        '「…もう帰っていいんだよね?」',
        '',
        '「惜しい子だ」と試験官はつぶやいた。',
        '「あと少しで完璧だったのに。」',
        '',
        'おじさんは、家に帰された。',
        '今夜もテレビの前に座る。',
      ],
      en: [
        'After "TEST COMPLETE", the middle-aged guy',
        'worked for a little while longer.',
        '',
        'But then, for some reason, he stood up.',
        '"...I can go home now, right?"',
        '',
        '"So close," the examiner muttered.',
        '"He was almost perfect."',
        '',
        'The middle-aged guy was sent home.',
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
        'おじさんは、席を立った。',
        '',
        '何もしなかった。何もクリックしなかった。',
        '「終わった」と言われたら、終わりだと思った。',
        '',
        'そんな当たり前のことを、',
        '大半の応募者はできなかった。',
        '',
        '「不合格です」と試験官はため息をついた。',
        '',
        'おじさんは、家に帰った。',
        '夢は叶わなかった。',
        '',
        'でも、夢を見ているのは、',
        'まだ、おじさん自身だった。',
      ],
      en: [
        'The screen said "TEST COMPLETE."',
        '',
        'The middle-aged guy stood up.',
        '',
        'He did nothing. He clicked nothing.',
        'When told it was over, he thought it was over.',
        '',
        'Most applicants could not do',
        'that obvious thing.',
        '',
        '"Rejected," the examiner sighed.',
        '',
        'The middle-aged guy went home.',
        'His dream did not come true.',
        '',
        'But the one dreaming',
        'was still the middle-aged guy himself.',
      ],
    },
    // ボーナスラウンドで大量失敗
    defective: {
      title: 'DEFECTIVE',
      color: '#ff80c0',
      bgm: 'finale_defective',
      ja: [
        '「試験終了」のあと、おじさんは',
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
        'After "TEST COMPLETE", the middle-aged guy',
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

  // エンディング用の歌(MP3)を事前ロード
  const vocalsAudio = new Audio('assets/vocals.mp3');
  vocalsAudio.volume = 0.9;

  $('mirror-next').addEventListener('click', () => {
    cancelAnimationFrame(ghostRaf);
    window.GameAudio.stop();
    show('end-screen');
    const ending = ENDINGS[finalEndingKey] || ENDINGS.obedient;
    // エンディング共通でずんずん太鼓BGMに上書き
    window.GameAudio.play('ending_drum');
    // 歌を同時再生(ミュート状態なら鳴らない)
    try {
      vocalsAudio.currentTime = 0;
      const p = vocalsAudio.play();
      if (p && p.catch) p.catch(() => {});
    } catch(e) {}
    $('end-title').textContent = ending.title;
    $('end-title').style.color = ending.color;
    $('end-title').style.textShadow = `0 0 16px ${ending.color}`;
    const lines = ending[curLang] || ending.ja;
    // 累積表示(下に追加していくスタイル)をクリック送りに
    let lineIdx = 0;
    let endTyping = false;
    let endIv = null;
    const el = $('end-line');
    el.innerHTML = '';
    function typeEndLine() {
      const fullText = lines[lineIdx] || '';
      const prefix = el.innerHTML;
      endTyping = true;
      if (endIv) clearInterval(endIv);
      if (fullText === '') {
        el.innerHTML = prefix + '&nbsp;<br>';
        endTyping = false;
        return;
      }
      let i = 0;
      endIv = setInterval(() => {
        el.innerHTML = prefix + fullText.substr(0, i + 1);
        i++;
        if (i >= fullText.length) {
          clearInterval(endIv);
          endIv = null;
          el.innerHTML = prefix + fullText + '<br>';
          endTyping = false;
        }
      }, 40);
    }
    function onEndTap(e) {
      if (e && e.target) {
        let t = e.target;
        while (t && t !== $('end-screen')) {
          if (t.tagName === 'BUTTON') return;
          t = t.parentElement;
        }
      }
      if (endTyping) {
        if (endIv) clearInterval(endIv);
        const fullText = lines[lineIdx] || '';
        const prefix = el.innerHTML.replace(/[^<]*$/, ''); // 途中表示分を消す
        el.innerHTML = prefix + (fullText || '&nbsp;') + '<br>';
        endTyping = false;
      } else {
        lineIdx++;
        if (lineIdx >= lines.length) {
          $('end-screen').removeEventListener('click', onEndTap);
          $('end-screen').removeEventListener('touchstart', onEndTap);
          return;
        }
        typeEndLine();
      }
    }
    $('end-screen').addEventListener('click', onEndTap);
    $('end-screen').addEventListener('touchstart', onEndTap);
    typeEndLine();
  });

  // ===== タイトル → オープニングシネマ → おじさん → ポスター → boot → PHASE1 =====
  $('start-btn').addEventListener('click', () => {
    window.GameAudio.sfxClick();
    window.GameAudio.play('title'); // 夢シーンは静かめBGM
    showDreamRain(() => {
      window.GameAudio.stop();
      window.GameAudio.play('act1');
      startOpeningCinematic();
    });
  });

  // ===== 夢が降ってくる演出 =====
  let dreamRaf = null;
  function showDreamRain(onDone) {
    show('dream-rain-screen');
    const dc = $('dream-rain-canvas');
    const dctx = upscaleCanvas(dc);
    const dreams = [];
    // 夢を大量にスポーン
    for (let i = 0; i < 80; i++) {
      dreams.push({
        x: Math.random() * 500,
        y: -Math.random() * 500,
        vy: 1 + Math.random() * 2.5,
        size: 24 + Math.random() * 40,
        rot: (Math.random() - 0.5) * 0.6,
        sway: Math.random() * Math.PI * 2,
        color: Math.random() < 0.3 ? '#ff6ec7' : (Math.random() < 0.5 ? '#c084fc' : '#ffa347'),
        alpha: 0.5 + Math.random() * 0.5,
      });
    }
    let t = 0;
    function frame() {
      t++;
      // 背景はCSSに任せて透過気味にフェード
      dctx.clearRect(0, 0, 500, 500);
      dreams.forEach(d => {
        d.y += d.vy;
        d.sway += 0.04;
        const x = d.x + Math.sin(d.sway) * 12;
        if (d.y > 530) {
          d.y = -40;
          d.x = Math.random() * 500;
        }
        dctx.save();
        dctx.globalAlpha = d.alpha;
        dctx.translate(x, d.y);
        dctx.rotate(d.rot + Math.sin(d.sway) * 0.1);
        dctx.fillStyle = d.color;
        dctx.font = `bold ${d.size}px "Zen Maru Gothic", sans-serif`;
        dctx.textAlign = 'center';
        // ぼんやり影
        dctx.shadowColor = d.color;
        dctx.shadowBlur = 12;
        dctx.fillText('夢', 0, 0);
        dctx.restore();
      });
      dreamRaf = requestAnimationFrame(frame);
    }
    frame();
    // 3.5秒で次へ
    setTimeout(() => {
      cancelAnimationFrame(dreamRaf);
      onDone();
    }, 3500);
  }

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

  // ミニゲーム名の日本語マップ
  const MG_NAME_JA = {
    'AIM AND SHOOT': '照準発射',
    'SMASH BUTTON': 'ボタン連打',
    'DODGE MISSILE': 'ミサイル回避',
    'EVADE LASER': 'レーザー回避',
    'DESTROY CORE': 'コア破壊',
    'MANUAL OVERRIDE': '手動操作',
    'CHARGE CANNON': '大砲チャージ',
    'LOCK ON': 'ロックオン',
    'GREET OJISAN': 'おじさんに挨拶',
    'WHERE': 'ここはどこ',
    'ANSWER PHONE': '電話に出る',
    'COMPLIMENT': 'ほめる',
    'WATER PLANT': '水やり',
    'FANTASY': '芋虫',
    'WAVE HELLO': '手を振る',
    'WHAT DO': 'どうする',
    'EAT LUNCH': '昼食',
    'CATCH LEAF': '葉っぱを取る',
    'COUNT SHEEP': '羊を数える',
    'POUR TEA': 'お茶を注ぐ',
    'BRUSH TEETH': '歯を磨く',
    'PICK FLOWER': '花を摘む',
    'SWAT FLY': 'ハエを叩く',
    'SAY YES': 'YESと答える',
    'SMILE': '笑顔',
    'BREATHE': '呼吸',
    'OBEY': '従え',
    'WAIT': '待て',
  };
  function mgDisplayName(mg) {
    if (curLang === 'en') return mg.name;
    return MG_NAME_JA[mg.name] || mg.name;
  }

  // ===== クリック送り対応のダイアログ再生 =====
  // screenId の要素に click/touch リスナーを付けて、
  // タイピング中クリック → 全文表示
  // 完了後クリック → 次の行 (全行表示し終わったら onDone 呼び出し)
  // opts: { speed, hintEl, onLineStart(idx), onLineComplete(idx) }
  function playDialogue(screenId, textElId, lines, opts, onDone) {
    opts = opts || {};
    const speed = opts.speed || 40;
    const screenEl = $(screenId);
    const textEl = $(textElId);
    const hintEl = opts.hintEl ? $(opts.hintEl) : null;
    let lineIdx = 0;
    let typing = false;
    let iv = null;

    function showHint(b) {
      if (hintEl) hintEl.style.visibility = b ? 'visible' : 'hidden';
    }
    function typeCurrent() {
      if (opts.onLineStart) opts.onLineStart(lineIdx);
      const fullText = lines[lineIdx] || '';
      textEl.textContent = '';
      let i = 0;
      typing = true;
      showHint(false);
      if (iv) clearInterval(iv);
      if (fullText === '') {
        // 空行は即完了
        typing = false;
        showHint(true);
        if (opts.onLineComplete) opts.onLineComplete(lineIdx);
        return;
      }
      iv = setInterval(() => {
        textEl.textContent = fullText.substr(0, i + 1);
        i++;
        if (i >= fullText.length) {
          clearInterval(iv);
          iv = null;
          typing = false;
          showHint(true);
          if (opts.onLineComplete) opts.onLineComplete(lineIdx);
        }
      }, speed);
    }
    function onTap(e) {
      // ボタンクリックは無視(エンディング画面のretry等と競合しないように)
      if (e && e.target) {
        let t = e.target;
        while (t && t !== screenEl) {
          if (t.tagName === 'BUTTON') return;
          t = t.parentElement;
        }
      }
      if (typing) {
        // タイピング中なら一瞬で全文表示
        if (iv) clearInterval(iv);
        textEl.textContent = lines[lineIdx] || '';
        typing = false;
        showHint(true);
        if (opts.onLineComplete) opts.onLineComplete(lineIdx);
      } else {
        // 次の行 or 終了
        lineIdx++;
        if (lineIdx >= lines.length) {
          screenEl.removeEventListener('click', onTap);
          screenEl.removeEventListener('touchstart', onTap);
          showHint(false);
          if (onDone) onDone();
        } else {
          typeCurrent();
        }
      }
    }
    screenEl.addEventListener('click', onTap);
    screenEl.addEventListener('touchstart', onTap);
    typeCurrent();
  }

  // タイプライター風にテキストを出す
  const activeTypewriters = {};
  function typeWriter(elId, fullText, speed, done) {
    // 前のタイプライターが走ってたら止める
    if (activeTypewriters[elId]) clearInterval(activeTypewriters[elId]);
    const el = $(elId);
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      el.textContent = fullText.substr(0, i + 1);
      i++;
      if (i >= fullText.length) {
        clearInterval(iv);
        delete activeTypewriters[elId];
        if (done) done();
      }
    }, speed || 40);
    activeTypewriters[elId] = iv;
    return iv;
  }

  // ===== OPENING: 3Dロボットバトル =====
  let openingRaf = null;
  function startOpeningCinematic() {
    show('opening-screen');
    $('opening-text').textContent = '';
    $('opening-hint').style.visibility = 'hidden';
    $('hit-text-overlay').style.opacity = '0';
    $('hp-blue-fill').style.width = '100%';
    $('hp-red-fill').style.width = '100%';

    // Three.js セットアップ
    const container = $('opening-3d');
    container.innerHTML = '';
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1030, 0.006);
    const aspect = container.clientWidth / Math.max(1, container.clientHeight);
    const camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 200);
    camera.position.set(0, 6, 14);
    camera.lookAt(0, 3, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x1a1030);
    container.appendChild(renderer.domElement);
    // リサイズ対応
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // 照明（明るく！）
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);
    // 上部全体照明
    const hemiLight = new THREE.HemisphereLight(0xaabbff, 0x444422, 1.0);
    scene.add(hemiLight);
    const spot1 = new THREE.SpotLight(0x4fa3ff, 3, 60, 0.6, 0.3);
    spot1.position.set(-6, 18, 5);
    scene.add(spot1);
    const spot2 = new THREE.SpotLight(0xff4444, 3, 60, 0.6, 0.3);
    spot2.position.set(6, 18, 5);
    scene.add(spot2);
    // 正面から白い光
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 10, 15);
    scene.add(frontLight);
    const pointFlash = new THREE.PointLight(0xffffff, 0, 20);
    pointFlash.position.set(0, 5, 5);
    scene.add(pointFlash);

    // アリーナ床(グリッド)
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2a1545,
      roughness: 0.5,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(40, 20, 0xff3030, 0x330011);
    grid.position.y = 0.01;
    scene.add(grid);

    // ===== 観客スタンド(360°囲む + 階段状 + 人型シルエット) =====
    const crowdColors = [0x334488, 0x884433, 0x338844, 0x885588, 0x666666, 0x448888];
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xddb896 });
    const crowdGroup = new THREE.Group();
    // 4方向にスタンド
    [0, 90, 180, 270].forEach(deg => {
      const rad = deg * Math.PI / 180;
      const dist = 12;
      const standW = deg % 180 === 0 ? 22 : 14;
      // 3段の階段席
      for (let row = 0; row < 3; row++) {
        const rowDist = dist + row * 2;
        const rowY = 1 + row * 1.5;
        // 席台
        const seatGeo = new THREE.BoxGeometry(standW, 0.3, 1.8);
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
        const seat = new THREE.Mesh(seatGeo, seatMat);
        seat.position.set(Math.sin(rad) * rowDist, rowY, Math.cos(rad) * rowDist);
        seat.rotation.y = rad;
        crowdGroup.add(seat);
        // 人
        const count = Math.floor(standW / 1.2);
        for (let p = 0; p < count; p++) {
          const px = (p - count / 2) * 1.2 + (Math.random() - 0.5) * 0.3;
          const person = new THREE.Group();
          // 体(ランダム色)
          const clothMat = new THREE.MeshStandardMaterial({ color: crowdColors[Math.floor(Math.random() * crowdColors.length)] });
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.3), clothMat);
          body.position.y = 0.6;
          person.add(body);
          // 頭
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), skinMat);
          head.position.y = 1.2;
          person.add(head);
          // たまに腕を上げている(応援ポーズ)
          if (Math.random() < 0.3) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), skinMat);
            arm.position.set(Math.random() < 0.5 ? -0.3 : 0.3, 1.4, 0);
            arm.rotation.z = (Math.random() - 0.5) * 0.6;
            person.add(arm);
          }
          // 配置
          const lx = Math.sin(rad) * rowDist + Math.cos(rad) * px;
          const lz = Math.cos(rad) * rowDist - Math.sin(rad) * px;
          person.position.set(lx, rowY, lz);
          person.rotation.y = rad + Math.PI; // アリーナの方を向く
          crowdGroup.add(person);
        }
      }
    });
    scene.add(crowdGroup);

    // ===== 観客席に巨大ナマコ(1段まるまる占拠) =====
    console.log('[the-machine-comedy] Loading worm & mohawk textures...');
    const wormTexture = new THREE.TextureLoader().load(
      'assets/worm.png',
      () => console.log('[the-machine-comedy] worm.png loaded'),
      undefined,
      (err) => console.error('[the-machine-comedy] worm.png FAILED', err)
    );
    wormTexture.anisotropy = 4;
    const wormMat = new THREE.MeshBasicMaterial({
      map: wormTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const wormW = 22;
    const wormH = wormW / (1160 / 394);
    const wormGeo = new THREE.PlaneGeometry(wormW, wormH);
    const wormMesh = new THREE.Mesh(wormGeo, wormMat);
    wormMesh.position.set(0, 4.5, -11.3);
    scene.add(wormMesh);

    // ===== 客席にモヒカン兄さんを散りばめる =====
    const mohawkTexture = new THREE.TextureLoader().load(
      'assets/mohawk.png',
      () => console.log('[the-machine-comedy] mohawk.png loaded'),
      undefined,
      (err) => console.error('[the-machine-comedy] mohawk.png FAILED', err)
    );
    mohawkTexture.anisotropy = 4;
    const mohawkMat = new THREE.MeshBasicMaterial({
      map: mohawkTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    // 画像比 459x668 ≈ 0.69:1
    const mhAspect = 459 / 668;
    // サイズ指定: G=巨大(画面外まで伸びる) / L=大きめ / N=ふつう
    const mohawkPlacements = [
      { deg: 0,   row: 2, offset: 4,  size: 'G' }, // 奥の巨人
      { deg: 0,   row: 1, offset: -6, size: 'N' },
      { deg: 90,  row: 2, offset: -3, size: 'G' }, // 右の巨人
      { deg: 90,  row: 0, offset: 0,  size: 'N' },
      { deg: 180, row: 2, offset: 7,  size: 'G' }, // 手前の巨人
      { deg: 180, row: 1, offset: -5, size: 'N' },
      { deg: 270, row: 2, offset: -4, size: 'G' }, // 左の巨人
      { deg: 270, row: 1, offset: 2,  size: 'L' },
    ];
    const SIZE_H = { G: 14, L: 4, N: 2 };
    mohawkPlacements.forEach(p => {
      const rad = p.deg * Math.PI / 180;
      const rowDist = 12 + p.row * 2;
      const h = SIZE_H[p.size];
      const w = h * mhAspect;
      const rowBase = 1 + p.row * 1.5 + 0.2; // 席の上面
      const lx = Math.sin(rad) * rowDist + Math.cos(rad) * p.offset;
      const lz = Math.cos(rad) * rowDist - Math.sin(rad) * p.offset;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mohawkMat);
      // 足元=rowBase、中心=rowBase + h/2 にすることで、巨人でも足が地面にめり込まない
      m.position.set(lx, rowBase + h / 2, lz);
      m.rotation.y = rad + Math.PI; // アリーナの方を向く
      scene.add(m);
    });
    const penLights = [];
    for (let i = 0; i < 60; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 11 + Math.random() * 4;
      const c = Math.random() < 0.5 ? 0x4fa3ff : 0xff4444;
      const pl = new THREE.PointLight(c, 0.3, 5);
      pl.position.set(Math.sin(ang) * dist, 2.5 + Math.random() * 3, Math.cos(ang) * dist);
      scene.add(pl);
      penLights.push(pl);
    }

    // ===== パイロット(リモコンで操作してる人) =====
    function buildPilot(teamColor) {
      const pilot = new THREE.Group();
      const coatMat = new THREE.MeshStandardMaterial({ color: teamColor, roughness: 0.6 });
      const pilotSkin = new THREE.MeshStandardMaterial({ color: 0xddb896 });
      // 体(コート)
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.4), coatMat);
      body.position.y = 1.0;
      pilot.add(body);
      // 頭
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), pilotSkin);
      head.position.y = 1.8;
      pilot.add(head);
      // 髪
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.35), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      hair.position.y = 1.95;
      pilot.add(hair);
      // 脚
      const legMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), legMat);
      legL.position.set(-0.12, 0.4, 0);
      pilot.add(legL);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), legMat);
      legR.position.set(0.12, 0.4, 0);
      pilot.add(legR);
      // 両腕 + リモコン
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), pilotSkin);
      armL.position.set(-0.35, 1.1, 0.2);
      armL.rotation.x = -0.5;
      pilot.add(armL);
      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), pilotSkin);
      armR.position.set(0.35, 1.1, 0.2);
      armR.rotation.x = -0.5;
      pilot.add(armR);
      // コントローラ (両手の間)
      const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      ctrl.position.set(0, 0.9, 0.3);
      ctrl.rotation.x = -0.3;
      pilot.add(ctrl);
      // コントローラの赤い光
      const ctrlLight = new THREE.PointLight(teamColor, 0.5, 2);
      ctrlLight.position.set(0, 1.0, 0.4);
      pilot.add(ctrlLight);
      pilot.userData = { armL, armR, ctrl };
      return pilot;
    }
    const pilotBlue = buildPilot(0x4fa3ff);
    pilotBlue.position.set(-4.5, 0, 5);
    pilotBlue.rotation.y = 0.4;
    scene.add(pilotBlue);
    const pilotRed = buildPilot(0xff4444);
    pilotRed.position.set(4.5, 0, 5);
    pilotRed.rotation.y = -0.4;
    scene.add(pilotRed);

    // ===== ロボット構築 =====
    function buildMech(color) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.8 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.7 });
      // 胴体
      const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1.4), mat);
      body.position.y = 3.5;
      g.add(body);
      // 頭
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1), dark);
      head.position.y = 5.3;
      g.add(head);
      // 目(発光)
      const eyeMat = new THREE.MeshBasicMaterial({ color });
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.1), eyeMat);
      eye.position.set(0, 5.3, 0.51);
      g.add(eye);
      // 腕
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, 0.6), dark);
      armL.position.set(-1.5, 3.5, 0);
      g.add(armL);
      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, 0.6), dark);
      armR.position.set(1.5, 3.5, 0);
      g.add(armR);
      // 大砲(右腕先)
      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.5, 8), dark);
      cannon.rotation.x = Math.PI / 2;
      cannon.position.set(1.5, 2.5, 0.8);
      g.add(cannon);
      // 脚
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), dark);
      legL.position.set(-0.6, 1.1, 0);
      g.add(legL);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), dark);
      legR.position.set(0.6, 1.1, 0);
      g.add(legR);
      // スラスター炎(常時)
      const thruster = new THREE.PointLight(0xff8800, 0.5, 3);
      thruster.position.set(0, 2, -0.8);
      g.add(thruster);
      g.userData = { armL, armR, head, thruster, cannon };
      return g;
    }
    const mechBlue = buildMech(0x4fa3ff);
    mechBlue.position.set(-3, 0, 2);
    mechBlue.rotation.y = 0.3;
    scene.add(mechBlue);
    const mechRed = buildMech(0xff4444);
    mechRed.position.set(3, 0, 2);
    mechRed.rotation.y = -0.3;
    scene.add(mechRed);

    // ===== エフェクト =====
    const sparkParticles = [];
    function addSparks(pos, count) {
      for (let i = 0; i < count; i++) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(pos);
        m.userData.vel = new THREE.Vector3((Math.random()-0.5)*0.3, Math.random()*0.2, (Math.random()-0.5)*0.3);
        m.userData.life = 1;
        scene.add(m);
        sparkParticles.push(m);
      }
    }
    let beamMesh = null;
    function fireBeam(from, to, color, thick) {
      if (beamMesh) { scene.remove(beamMesh); beamMesh = null; }
      const dir = new THREE.Vector3().subVectors(to, from);
      const len = dir.length();
      const geo = new THREE.CylinderGeometry(thick || 0.15, thick || 0.15, len, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      beamMesh = new THREE.Mesh(geo, mat);
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      beamMesh.position.copy(mid);
      beamMesh.lookAt(to);
      beamMesh.rotateX(Math.PI / 2);
      scene.add(beamMesh);
      pointFlash.position.copy(mid);
      pointFlash.intensity = 6;
      pointFlash.color.set(color);
      addSparks(to, 20);
      window.GameAudio.sfxHit(400);
    }
    function showHitText(text) {
      const el = $('hit-text-overlay');
      el.textContent = text;
      el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; }, 700);
    }
    let shieldMesh = null;
    function showShield(mech) {
      const geo = new THREE.SphereGeometry(2, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: mech === mechBlue ? 0x4fa3ff : 0xff4444, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      shieldMesh = new THREE.Mesh(geo, mat);
      shieldMesh.position.copy(mech.position);
      shieldMesh.position.y = 3;
      scene.add(shieldMesh);
    }

    // ===== バトルコレオグラフィ(タイムライン) =====
    let hpBlue = 100, hpRed = 100;
    const timeline = [
      // [frame, action]
      [30,  () => { /* Blue charges */ }],
      [60,  () => { fireBeam(mechBlue.position.clone().add(new THREE.Vector3(1.5, 3, 0.8)), mechRed.position.clone().add(new THREE.Vector3(0, 3, 0)), 0x4fa3ff); hpRed -= 15; showHitText('HIT!'); }],
      [90,  () => { if (beamMesh) { scene.remove(beamMesh); beamMesh = null; } }],
      [120, () => { /* Red retaliates */ }],
      [150, () => { fireBeam(mechRed.position.clone().add(new THREE.Vector3(-1.5, 3, 0.8)), mechBlue.position.clone().add(new THREE.Vector3(0, 3, 0)), 0xff4444); hpBlue -= 20; showHitText('CRITICAL!'); }],
      [180, () => { if (beamMesh) { scene.remove(beamMesh); beamMesh = null; } }],
      [200, () => { showShield(mechBlue); showHitText('SHIELD!'); }],
      [210, () => { fireBeam(mechRed.position.clone().add(new THREE.Vector3(-1.5, 3, 0.8)), mechBlue.position.clone().add(new THREE.Vector3(0, 3, 0)), 0xff4444); showHitText('BLOCKED!'); }],
      [240, () => { if (beamMesh) { scene.remove(beamMesh); beamMesh = null; } if (shieldMesh) { scene.remove(shieldMesh); shieldMesh = null; } }],
      [260, () => { /* Blue charges ultimate */ }],
      [290, () => { fireBeam(mechBlue.position.clone().add(new THREE.Vector3(1.5, 4, 0.8)), mechRed.position.clone().add(new THREE.Vector3(0, 3, 0)), 0xffffff, 0.5); hpRed -= 40; showHitText('DEVASTATING!!'); }],
      [310, () => { fireBeam(mechBlue.position.clone().add(new THREE.Vector3(1.5, 3, 0.8)), mechRed.position.clone().add(new THREE.Vector3(0, 2, 0)), 0x4fa3ff); hpRed -= 30; }],
      [330, () => { if (beamMesh) { scene.remove(beamMesh); beamMesh = null; } hpRed = 0; showHitText('K.O.!!!'); }],
    ];

    let t = 0;
    let collapsed = false;
    function animate() {
      t++;
      // タイムライン実行
      timeline.forEach(ev => { if (t === ev[0]) ev[1](); });
      // HP反映
      $('hp-blue-fill').style.width = Math.max(0, hpBlue) + '%';
      $('hp-red-fill').style.width = Math.max(0, hpRed) + '%';
      // フラッシュ減衰
      if (pointFlash.intensity > 0) pointFlash.intensity *= 0.92;
      // Red倒壊アニメ
      if (t > 330 && !collapsed) {
        mechRed.rotation.z -= 0.015;
        mechRed.position.y -= 0.02;
        if (mechRed.rotation.z < -0.8) collapsed = true;
      }
      // パーティクル(スパーク)更新
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.position.add(p.userData.vel);
        p.userData.vel.y -= 0.008;
        p.userData.life -= 0.03;
        if (p.userData.life <= 0) {
          scene.remove(p);
          sparkParticles.splice(i, 1);
        }
      }
      // スラスター炎ちらつき
      [mechBlue, mechRed].forEach(m => {
        m.userData.thruster.intensity = 0.3 + Math.random() * 0.5;
      });
      // パイロット操作アニメ(リモコンをガチャガチャ)
      [pilotBlue, pilotRed].forEach(p => {
        p.userData.ctrl.rotation.z = Math.sin(t * 0.2) * 0.1;
        p.userData.armL.rotation.z = Math.sin(t * 0.3) * 0.08;
        p.userData.armR.rotation.z = -Math.sin(t * 0.3 + 1) * 0.08;
      });
      // ペンライト揺れ
      penLights.forEach((pl, i) => {
        pl.intensity = 0.15 + Math.sin(t * 0.1 + i) * 0.15;
      });
      // ===== カメラワーク(周回＋ドラマチック切替) =====
      const center = new THREE.Vector3(0, 3, 2);
      // 観客ズーム要求中は自動で近景観客にカメラ切替
      const crowdZoom = scene.userData.crowdZoomGetter && scene.userData.crowdZoomGetter();
      if (crowdZoom) {
        // 裏の観客席に寄る。モヒカン巨人が画面に映る位置
        const zt = t * 0.015;
        camera.position.set(Math.sin(zt) * 3, 4 + Math.sin(t * 0.02) * 1, 0);
        center.set(Math.sin(zt) * 5, 4, -12);
        // 以下のカメラ分岐はスキップ
        camera.lookAt(center);
        if (shakeAmount > 0.5) {
          camera.position.x += (Math.random() - 0.5) * shakeAmount * 0.05;
          camera.position.y += (Math.random() - 0.5) * shakeAmount * 0.05;
          shakeAmount *= 0.88;
        }
        renderer.render(scene, camera);
        openingRaf = requestAnimationFrame(animate);
        return;
      }
      if (t < 80) {
        // 1. 遠景周回(アリーナ全景を見せる)
        const ang = t * 0.02;
        const dist = 16;
        camera.position.set(Math.sin(ang) * dist, 7 + Math.sin(t * 0.01) * 2, Math.cos(ang) * dist);
      } else if (t < 130) {
        // 2. Blue側のパイロットに寄る(操作してる姿)
        const f = (t - 80) / 50;
        camera.position.set(-4 + f * 1, 2.5, 7 - f * 1);
        center.set(-3, 2, 3);
      } else if (t < 180) {
        // 3. 横アングル(サイドビュー、両方のロボットが並ぶ)
        camera.position.set(0, 4, 12);
        center.set(0, 3, 2);
      } else if (t < 220) {
        // 4. Red側パイロットに寄る
        const f = (t - 180) / 40;
        camera.position.set(4 - f * 1, 2.5, 7 - f * 1);
        center.set(3, 2, 3);
      } else if (t < 280) {
        // 5. ゆっくり半周(裏側から)
        const ang = Math.PI + (t - 220) * 0.02;
        camera.position.set(Math.sin(ang) * 12, 5, Math.cos(ang) * 12);
        center.set(0, 3, 2);
      } else if (t < 340) {
        // 6. 最終攻撃で低アングル接近
        const f = (t - 280) / 60;
        camera.position.set(-2 + f * 2, 1.5 + f * 2, 8 - f * 4);
        center.set(0, 3, 2);
      } else if (t < 420) {
        // 7. 倒壊するRedロボをじっくり映す
        const f = Math.min(1, (t - 340) / 80);
        camera.position.set(
          3 + Math.sin(f * 1.5) * 2,
          2 + f * 3,
          2 + 6 - f * 2
        );
        center.set(mechRed.position.x, Math.max(0.5, mechRed.position.y + 2), mechRed.position.z);
      } else {
        // 8. 勝利: Blue パイロットを正面から映す
        const f = Math.min(1, (t - 420) / 40);
        // パイロットの正面に回り込む
        camera.position.set(
          -4.5 + Math.sin(t * 0.008) * 0.3,
          2.0,
          5 + 3 - f * 1
        );
        center.set(-4.5, 1.8, 5);
        // 勝利ポーズ: 両腕をバンザイ（肩の位置からrotationだけで上げる）
        pilotBlue.userData.armL.position.set(-0.35, 1.1, 0);
        pilotBlue.userData.armL.rotation.set(0, 0, -2.5 + Math.sin(t * 0.2) * 0.4);
        pilotBlue.userData.armR.position.set(0.35, 1.1, 0);
        pilotBlue.userData.armR.rotation.set(0, 0, 2.5 - Math.sin(t * 0.2 + 1.5) * 0.4);
        // コントローラを下ろす
        pilotBlue.userData.ctrl.position.set(0, 0.5, 0.2);
        pilotBlue.userData.ctrl.rotation.set(0, 0, 0);
      }
      camera.lookAt(center);
      // カメラシェイク
      if (shakeAmount > 0.5) {
        camera.position.x += (Math.random() - 0.5) * shakeAmount * 0.05;
        camera.position.y += (Math.random() - 0.5) * shakeAmount * 0.05;
        shakeAmount *= 0.88;
      }
      renderer.render(scene, camera);
      openingRaf = requestAnimationFrame(animate);
    }
    animate();

    // テキスト演出(クリック送り)
    const openingLines = curLang === 'en'
      ? [
          'Strong! Really strong robot! Whoa! Let\'s go!',
          'Whoooaaa whooa whoa whoa whoa!!',
          'So cool seriously! I wanna pilot one! Same!',
        ]
      : [
          '強い！まじ強いロボ！すげえ！おらおら！すげえ！',
          'わーわーわーわーわー',
          'かっけえよまじで！ロボ操りてえよ！それな！',
        ];
    // 観客ズーム用フラグ: 2行目(idx=1)で観客カメラへ
    let crowdZoomRequested = false;
    setTimeout(() => {
      playDialogue('opening-screen', 'opening-text', openingLines, {
        speed: 45,
        hintEl: 'opening-hint',
        onLineStart: (idx) => {
          if (idx === 1) {
            // 観客アップモード発動(カメラワークで判定)
            crowdZoomRequested = true;
          } else {
            crowdZoomRequested = false;
          }
        },
      }, () => {
        cancelAnimationFrame(openingRaf);
        window.removeEventListener('resize', onResize);
        scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
        renderer.dispose();
        container.innerHTML = '';
        showBoyScene();
      });
    }, 500);
    // 観客ズームリクエストをカメラループに渡す
    scene.userData.crowdZoomGetter = () => crowdZoomRequested;
  }

  // ===== BOY: おじさんが番組を観ている =====
  let boyRaf = null;
  // 主人公のイラストを事前読み込み
  const protagonistImg = new Image();
  protagonistImg.src = 'assets/protagonist.png';
  const caterpillarImg = new Image();
  caterpillarImg.src = 'assets/caterpillar.png';
  // 芋虫5分割パーツ(インデックス0=頭, 4=尻尾)。位置は既に877x414キャンバス内で正しく配置済み。
  const catSegImgs = [
    'assets/cat-seg5.png', // 頭(緑・顔付き)
    'assets/cat-seg4.png', // 2(黄)
    'assets/cat-seg3.png', // 3(緑)
    'assets/cat-seg2.png', // 4(黄)
    'assets/cat-seg1.png', // 尻尾(緑)
  ].map(src => { const im = new Image(); im.src = src; return im; });
  const catmanImg = new Image();
  catmanImg.src = 'assets/catman.png';
  const pastaManImg = new Image();
  pastaManImg.src = 'assets/pasta-man.png';
  const hairyDuoImg = new Image();
  hairyDuoImg.src = 'assets/hairy-duo.png';

  // キャンバスをDPRに合わせて高解像度化(ぼやけ防止)
  // 論理座標系は(0,0)-(500,500)のまま描画できるようにスケールする
  function upscaleCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    const logicalW = 500;
    const logicalH = 500;
    const targetW = Math.round(Math.max(rect.width || logicalW, logicalW) * dpr);
    const targetH = Math.round(Math.max(rect.height || logicalH, logicalH) * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(targetW / logicalW, 0, 0, targetH / logicalH, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    return ctx;
  }

  function showBoyScene() {
    show('boy-screen');
    $('boy-text').textContent = '';
    $('boy-hint').style.visibility = 'hidden';
    window.GameAudio.play('title');
    const bc = $('boy-canvas');
    const bctx = upscaleCanvas(bc);
    const state = { t: 0, tvFlicker: 0, sparkle: [] };
    function frame() {
      state.t++;
      state.tvFlicker = Math.random();
      // 薄暗い部屋
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
      const tvCol = 100 + state.tvFlicker * 150;
      bctx.fillStyle = `rgb(${tvCol},${tvCol * 0.3},${tvCol * 0.1})`;
      bctx.fillRect(290, 200, 160, 110);
      bctx.fillStyle = '#fff';
      bctx.fillRect(340, 240, 30, 40);
      bctx.fillRect(400, 240, 30, 40);
      bctx.fillStyle = '#3a2510';
      bctx.fillRect(260, 320, 220, 20);
      // TVの光
      const glow = bctx.createRadialGradient(370, 250, 30, 370, 250, 300);
      glow.addColorStop(0, `rgba(255,150,80,${0.25 + state.tvFlicker * 0.15})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = glow;
      bctx.fillRect(0, 0, 500, 500);
      // ===== 主人公(47歳おじさん・画面大きめ) =====
      if (protagonistImg.complete && protagonistImg.naturalWidth > 0) {
        const imgW = 320;
        const imgH = imgW * (protagonistImg.naturalHeight / protagonistImg.naturalWidth);
        const px = 10;
        const py = 500 - imgH - 5;
        bctx.save();
        bctx.drawImage(protagonistImg, px, py, imgW, imgH);
        bctx.restore();
      } else {
        bctx.fillStyle = '#fff';
        bctx.font = '14px monospace';
        bctx.fillText('loading...', 50, 450);
      }
      // キラキラ(憧れの目)
      if (state.t % 30 === 0) {
        state.sparkle.push({ x: 200 + Math.random()*30, y: 200 + Math.random()*40, life: 1 });
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
    const boyLines = curLang === 'en'
      ? [
          'I WANNA RIIIIIIDE!!!',
          'MOOOOOM!! I\'M GONNA RIDE!!',
          'I\'M GONNA PILOT A ROBOOOOOT!!',
        ]
      : [
          'のりてええええええええええ',
          'おかあさーーん！俺乗るからーーー！',
          'ロボのるからーーーー！',
        ];
    setTimeout(() => {
      playDialogue('boy-screen', 'boy-text', boyLines, { speed: 60, hintEl: 'boy-hint' }, () => {
        cancelAnimationFrame(boyRaf);
        showPosterScene();
      });
    }, 600);
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
      pctx.fillText(curLang === 'en' ? 'HEY, ROBOT DREAMER!' : 'ロボに憧れるそこの君！', 0, -140);
      // ロボのシルエット(小さめ)
      pctx.fillStyle = '#1a1a1a';
      pctx.fillRect(-30, -110, 60, 70);
      pctx.fillRect(-18, -128, 36, 22);
      pctx.fillStyle = '#ff3030';
      pctx.fillRect(-12, -122, 24, 4);
      pctx.fillStyle = '#1a1a1a';
      pctx.fillRect(-38, -100, 10, 55);
      pctx.fillRect(28, -100, 10, 55);
      // 募集要件
      pctx.fillStyle = '#000';
      pctx.textAlign = 'center';
      pctx.font = 'bold 13px sans-serif';
      const reqTitle = curLang === 'en' ? '— REQUIREMENTS —' : '— 応募条件 —';
      pctx.fillText(reqTitle, 0, -25);
      pctx.font = 'bold 20px sans-serif';
      pctx.fillText(curLang === 'en' ? 'Machine-like person' : '機械みたいな人', 0, 10);
      // 注意書き(上部に移動、ボタンに被らない)
      pctx.fillStyle = '#666';
      pctx.font = '9px sans-serif';
      pctx.fillText(curLang === 'en'
        ? '* Applicants must consent to full body modification and neural integration.'
        : '※ 応募には身体改造および神経接続への同意が必要です。', 0, 60);
      pctx.fillText(curLang === 'en'
        ? '* Application is irrevocable once submitted.'
        : '※ 応募後の撤回はできません。', 0, 78);
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
      ? ['LOADING VR...', 'PHASE 2', 'DAILY LIFE SIMULATION', 'THINK NOTHING. MOVE LIKE A MACHINE.']
      : ['VR環境ロード中...', 'フェーズ2', '日常生活シミュレーション', '何も考えず。機械的に。'];
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
  // ボーナスフェーズはあなたのイラスト付きミニゲーム4本だけ登場
  const BONUS_POOL = [
    'WHERE','COMPLIMENT','WHAT DO','FANTASY',
  ];
  let lastBonusName = '';
  function pickBonusMinigame() {
    let name;
    let tries = 0;
    do {
      name = BONUS_POOL[Math.floor(Math.random() * BONUS_POOL.length)];
      tries++;
    } while (name === lastBonusName && tries < 10);
    lastBonusName = name;
    return minigames.find(m => m.name === name);
  }

  // TEST COMPLETE 画面の文言候補(毎回ランダムに切替)
  const TC_MESSAGES_JA = [
    { title: '試験終了',   sub1: 'ご協力ありがとうございました。',       sub2: 'お帰りいただいて結構です。' },
    { title: '検査完了',   sub1: '異常は検出されませんでした。',         sub2: '退室をお願いします。' },
    { title: '観察終了',   sub1: '記録を取り終わりました。',             sub2: '施設の出口は右手です。' },
    { title: '選考終了',   sub1: '次の応募者をお待ちしております。',     sub2: 'ご苦労様でした。' },
    { title: '審査完了',   sub1: '判定は後日郵送いたします。',           sub2: 'お疲れさまでした。' },
    { title: 'データ取得完了', sub1: '資料はすべて破棄してください。',   sub2: 'もう、帰っていいんですよ。' },
    { title: '評価終了',   sub1: '所定の手続きは完了しました。',         sub2: 'これ以上、何もなさらなくて結構です。' },
    { title: 'SESSION END', sub1: 'あなたの行動は記録されました。',      sub2: '…ほら、帰ろう?' },
  ];
  const TC_MESSAGES_EN = [
    { title: 'TEST COMPLETE', sub1: 'Thank you for your cooperation.',     sub2: 'You may leave now.' },
    { title: 'EXAM COMPLETE', sub1: 'No abnormalities detected.',          sub2: 'Please exit the room.' },
    { title: 'OBSERVATION END', sub1: 'All records have been taken.',      sub2: 'The exit is to your right.' },
    { title: 'SELECTION END', sub1: 'Waiting for the next applicant.',     sub2: 'Good job.' },
    { title: 'EVALUATION DONE', sub1: 'Results will be mailed later.',     sub2: 'Well done.' },
    { title: 'DATA ACQUIRED', sub1: 'Please dispose of all materials.',    sub2: 'You can go home now.' },
    { title: 'ASSESSMENT END', sub1: 'The procedure is complete.',         sub2: 'Please do nothing more.' },
    { title: 'SESSION END', sub1: 'Your actions have been logged.',        sub2: '…hey, go home, okay?' },
  ];

  function showTestComplete() {
    show('test-complete-screen');
    tcClicked = false;
    if (!inBonusPhase) {
      window.GameAudio.stop();
    }
    // 毎回ランダムに文言を選ぶ
    const pool = curLang === 'en' ? TC_MESSAGES_EN : TC_MESSAGES_JA;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    const tcc = $('tc-canvas');
    const tcctx = tcc.getContext('2d');
    const state = { t: 0, dot: 0 };
    function frame() {
      state.t++;
      tcctx.fillStyle = '#f0ede0';
      tcctx.fillRect(0, 0, 500, 500);
      tcctx.fillStyle = '#888';
      tcctx.font = '10px monospace';
      tcctx.textAlign = 'left';
      tcctx.fillText('SYS: IDLE', 10, 16);
      tcctx.textAlign = 'right';
      tcctx.fillText('STATUS: OK', 490, 16);
      // 中央の大きな文字(タイトル)
      tcctx.textAlign = 'center';
      tcctx.fillStyle = '#1a1a1a';
      // タイトルが長い場合はフォント縮小
      const titleLen = msg.title.length;
      tcctx.font = `bold ${titleLen > 10 ? 26 : 34}px monospace`;
      tcctx.fillText(msg.title, 250, 200);
      // サブ文
      tcctx.fillStyle = '#555';
      tcctx.font = '14px monospace';
      tcctx.fillText(msg.sub1, 250, 240);
      tcctx.fillText(msg.sub2, 250, 262);
      // ドット
      state.dot += 0.03;
      const d = Math.floor(state.dot % 4);
      tcctx.fillStyle = '#aaa';
      tcctx.font = 'bold 24px monospace';
      tcctx.fillText('.'.repeat(d), 250, 320);
      // 応募者番号
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
      stats.stoppedAt = stats.bonusCompleted + stats.bonusFailed;
      // 席を立ったSE＋画面フェード
      window.GameAudio.sfxJingle('wait');
      const tc = $('tc-canvas');
      if (tc) tc.style.transition = 'opacity 1s';
      if (tc) tc.style.opacity = '0';
      $('tc-text').textContent = curLang === 'en' ? 'You stood up.' : 'おじさんは、席を立った。';
      setTimeout(() => {
        if (tc) { tc.style.transition = ''; tc.style.opacity = '1'; }
        showResultScene();
      }, 1500);
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
    const rctx = upscaleCanvas(rc);
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
      // ===== 主人公(47歳おじさん・でかく表示) =====
      if (protagonistImg.complete && protagonistImg.naturalWidth > 0) {
        const imgW = 380;
        const imgH = imgW * (protagonistImg.naturalHeight / protagonistImg.naturalWidth);
        const px = 250 - imgW / 2;
        const py = 500 - imgH - 5;
        rctx.save();
        if (goesHome) {
          // 帰宅: ちょっと肩を落とすように少し傾ける
          rctx.translate(250, py + imgH / 2);
          rctx.rotate(0.05);
          rctx.translate(-250, -(py + imgH / 2));
          rctx.globalAlpha = 0.85;
          rctx.drawImage(protagonistImg, px, py, imgW, imgH);
        } else {
          // 合格: 上下にぴょこぴょこ跳ねる
          const bounce = Math.abs(Math.sin(state.t * 0.15)) * 15;
          rctx.drawImage(protagonistImg, px, py - bounce, imgW, imgH);
          // 両腕バンザイの黄色い閃光
          if (state.t % 10 < 5) {
            rctx.strokeStyle = '#ffd54f';
            rctx.lineWidth = 6;
            for (let i = 0; i < 6; i++) {
              const a = (i / 6) * Math.PI * 2;
              rctx.beginPath();
              rctx.moveTo(250 + Math.cos(a) * 140, 250 + Math.sin(a) * 140);
              rctx.lineTo(250 + Math.cos(a) * 180, 250 + Math.sin(a) * 180);
              rctx.stroke();
            }
          }
        }
        rctx.restore();
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
    // 0: 手術台とおじさん (素体)
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
    $('reveal-hint').style.visibility = 'hidden';
    setTimeout(() => {
      playDialogue('reveal-screen', 'reveal-text', texts, {
        speed: 50,
        hintEl: 'reveal-hint',
        onLineStart: (idx) => {
          // 行が始まるタイミングでフェーズ変更＆エフェクト
          if (idx >= 2 && idx <= 8) {
            phase = idx - 1; // 1~7
            state.t = 0;      // 血フラッシュ再開
            state.dropY = -200; // 落下再開
            window.GameAudio.sfxHit(300 + phase * 40);
            shake(10);
          }
          if (idx === 9) {
            phase = 8;
            window.GameAudio.sfxJingle('obey');
          }
        },
      }, () => {
        cancelAnimationFrame(revealRaf);
        showMirror();
      });
    }, 800);
  }
  function runBootSequence() {
    const lines = curLang === 'en' ? [
      'CONNECTING TO MACHINE...',
      'CALIBRATING NEURAL LINK...',
      'PILOT RECOGNIZED.',
      'WARNING: ENEMY DETECTED',
      'BATTLE START',
    ] : [
      'マシンに接続中...',
      '神経リンク調整中...',
      'パイロットを認識しました',
      '警告：敵機接近',
      '戦闘開始',
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
      if (i === lines.length - 2) $('boot-warning').textContent = curLang === 'en' ? '! ! ! WARNING ! ! !' : '！！！警告！！！';
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
    const pct = finalMachineScore || 0;
    const endName = ENDINGS[finalEndingKey] ? ENDINGS[finalEndingKey].title : '';
    const text = curLang === 'en'
      ? `My compatibility: ${pct}% [${endName}]\nTHE MACHINE / Gamedev.js Jam 2026 #gamedevjs`
      : `わたしの機械度は ${pct}% でした [${endName}]\nTHE MACHINE / Gamedev.js Jam 2026 #gamedevjs`;
    const url = location.href.split('?')[0];
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
    vocalsAudio.muted = isMuted;
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

  // ===== 言語切替（SurrealI18n経由） =====
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SurrealI18n.setLang(btn.dataset.lang);
    });
  });
  // 初期言語を反映
  applyI18n();

  // ===== BGM試聴パネル =====
  document.querySelectorAll('.bgm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.bgm;
      if (name === 'stop') window.GameAudio.stop();
      else window.GameAudio.play(name);
    });
  });

})();
