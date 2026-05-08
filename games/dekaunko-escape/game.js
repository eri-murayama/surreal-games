/**
 * でかうんこ脱出
 * 食べ物を避けトイレで縮んでサイズ0を目指すアクション
 */
(function () {
  'use strict';

  const t = (key, fallback) => {
    if (window.SurrealI18n && typeof window.SurrealI18n.t === 'function') {
      return window.SurrealI18n.t(key) || fallback || key;
    }
    return fallback || key;
  };

  // ===== 定数 =====
  const START_WEIGHT = 100;
  const MAX_WEIGHT = 200;
  const GOAL_WEIGHT = 0;
  const TIME_LIMIT = 60; // 秒
  const FOOD_EMOJIS = ['🍰', '🍔', '🍜', '🍕', '🍩', '🍟', '🍗', '🧁', '🍦', '🌭'];
  const FOOD_MAX = 7;
  const TOILET_LIFETIME = 5.5; // 秒
  const TOILET_RESPAWN = 2.8;  // 秒（トイレ消滅後の再出現までの遅延）

  // ===== DOM =====
  const titleScreen = document.getElementById('title-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const weightEl = document.getElementById('weight-val');
  const timeEl = document.getElementById('time-val');
  const weightBar = document.getElementById('weight-bar');
  const effectText = document.getElementById('effect-text');
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultMsg = document.getElementById('result-msg');
  const finalWeight = document.getElementById('final-weight');
  const finalTime = document.getElementById('final-time');
  const highScoreDisplay = document.getElementById('highscore-display');

  // ===== ゲーム状態 =====
  let state = null;
  let rafId = null;
  let lastTime = 0;
  let sgHandle = null;

  function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  function showEffect(text) {
    effectText.textContent = text;
    effectText.classList.remove('show');
    void effectText.offsetWidth;
    effectText.classList.add('show');
    setTimeout(() => effectText.classList.remove('show'), 700);
  }

  // ===== キャンバスサイズ =====
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', () => { if (state) resizeCanvas(); });

  // ===== 入力 =====
  const input = { left: false, right: false, up: false, down: false, touchX: null, touchY: null };

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') input.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w') input.up = true;
    if (e.key === 'ArrowDown' || e.key === 's') input.down = true;
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') input.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w') input.up = false;
    if (e.key === 'ArrowDown' || e.key === 's') input.down = false;
  });

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  function setTouch(e) {
    e.preventDefault();
    const p = canvasPoint(e);
    input.touchX = p.x;
    input.touchY = p.y;
  }
  function clearTouch(e) {
    e.preventDefault();
    input.touchX = null;
    input.touchY = null;
  }
  canvas.addEventListener('touchstart', setTouch, { passive: false });
  canvas.addEventListener('touchmove', setTouch, { passive: false });
  canvas.addEventListener('touchend', clearTouch, { passive: false });
  canvas.addEventListener('mousedown', setTouch);
  canvas.addEventListener('mousemove', e => { if (e.buttons) setTouch(e); });
  canvas.addEventListener('mouseup', clearTouch);
  canvas.addEventListener('mouseleave', clearTouch);

  // ===== ゲーム開始 =====
  function startGame() {
    showScreen(gameScreen);
    resizeCanvas();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    state = {
      w, h,
      player: { x: w / 2, y: h / 2, weight: START_WEIGHT, vx: 0, vy: 0 },
      foods: [],
      toilet: null,
      toiletTimer: 1.5,
      foodSpawnTimer: 0,
      time: TIME_LIMIT,
      ended: false,
      particles: [],
    };

    spawnToilet();
    if (sgHandle) sgHandle.onGameStart();
    updateHud();
    lastTime = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function playerRadius(weight) {
    return 18 + weight * 0.28;
  }
  function playerSpeed(weight) {
    return Math.max(55, 210 - weight * 0.75);
  }

  // ===== 食べ物 =====
  function spawnFood() {
    if (state.foods.length >= FOOD_MAX) return;
    const emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    // 画面端の外からランダム登場
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 30;
    if (side === 0) { x = Math.random() * state.w; y = -margin; }
    else if (side === 1) { x = state.w + margin; y = Math.random() * state.h; }
    else if (side === 2) { x = Math.random() * state.w; y = state.h + margin; }
    else { x = -margin; y = Math.random() * state.h; }
    // プレイヤーを緩やかに追跡
    const chase = 0.35 + Math.random() * 0.35;
    state.foods.push({
      emoji, x, y,
      r: 18 + Math.random() * 6,
      speed: 35 + Math.random() * 35,
      chase,
      wob: Math.random() * Math.PI * 2,
    });
  }

  // ===== トイレ =====
  function spawnToilet() {
    const pad = 50;
    state.toilet = {
      x: pad + Math.random() * (state.w - pad * 2),
      y: pad + Math.random() * (state.h - pad * 2),
      life: TOILET_LIFETIME,
      r: 26,
    };
  }

  // ===== パーティクル =====
  function addParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 120;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.6,
        color,
      });
    }
  }

  // ===== メインループ =====
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (!state || state.ended) return;

    update(dt);
    draw();

    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    const p = state.player;

    // 入力処理
    let dx = 0, dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.touchX !== null) {
      const tx = input.touchX - p.x;
      const ty = input.touchY - p.y;
      const d = Math.hypot(tx, ty);
      if (d > 8) { dx = tx / d; dy = ty / d; }
    }
    const dmag = Math.hypot(dx, dy);
    if (dmag > 0) { dx /= dmag; dy /= dmag; }

    const speed = playerSpeed(p.weight);
    p.vx = dx * speed;
    p.vy = dy * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const pr = playerRadius(p.weight);
    p.x = Math.max(pr, Math.min(state.w - pr, p.x));
    p.y = Math.max(pr, Math.min(state.h - pr, p.y));

    // 食べ物スポーン
    state.foodSpawnTimer -= dt;
    if (state.foodSpawnTimer <= 0) {
      spawnFood();
      // 時間が進むほど出現頻度UP
      const elapsed = TIME_LIMIT - state.time;
      state.foodSpawnTimer = Math.max(0.4, 1.3 - elapsed * 0.01);
    }

    // 食べ物更新
    for (let i = state.foods.length - 1; i >= 0; i--) {
      const f = state.foods[i];
      // プレイヤーへ弱追跡＋うねり
      const tx = p.x - f.x;
      const ty = p.y - f.y;
      const td = Math.hypot(tx, ty) || 1;
      f.wob += dt * 2;
      const wobX = Math.cos(f.wob) * 20;
      const wobY = Math.sin(f.wob) * 20;
      f.x += ((tx / td) * f.chase + wobX * 0.02) * f.speed * dt;
      f.y += ((ty / td) * f.chase + wobY * 0.02) * f.speed * dt;

      // 当たり判定
      if (Math.hypot(f.x - p.x, f.y - p.y) < pr + f.r * 0.7) {
        p.weight = Math.min(MAX_WEIGHT + 5, p.weight + 6);
        addParticles(f.x, f.y, '#ff7043', 10);
        showEffect('+' + t('eatFood', 'デブった！'));
        if (sgHandle && sgHandle.sound) sgHandle.sound.play('hit');
        state.foods.splice(i, 1);
        continue;
      }

      // 画面外に大きく外れたら削除
      if (f.x < -80 || f.x > state.w + 80 || f.y < -80 || f.y > state.h + 80) {
        state.foods.splice(i, 1);
      }
    }

    // トイレ更新
    if (state.toilet) {
      state.toilet.life -= dt;
      if (Math.hypot(state.toilet.x - p.x, state.toilet.y - p.y) < pr + state.toilet.r) {
        p.weight = Math.max(GOAL_WEIGHT - 5, p.weight - 22);
        addParticles(state.toilet.x, state.toilet.y, '#4ade80', 18);
        showEffect(t('useToilet', 'すっきり！'));
        if (sgHandle && sgHandle.sound) sgHandle.sound.play('click');
        state.toilet = null;
        state.toiletTimer = TOILET_RESPAWN;
      } else if (state.toilet.life <= 0) {
        state.toilet = null;
        state.toiletTimer = TOILET_RESPAWN;
      }
    } else {
      state.toiletTimer -= dt;
      if (state.toiletTimer <= 0) spawnToilet();
    }

    // パーティクル更新
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) { state.particles.splice(i, 1); continue; }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.92;
      pt.vy *= 0.92;
    }

    // 時間
    state.time -= dt;
    if (state.time < 0) state.time = 0;

    updateHud();

    // 判定
    if (p.weight <= GOAL_WEIGHT) endGame(true, 'clear');
    else if (p.weight >= MAX_WEIGHT) endGame(false, 'overWeight');
    else if (state.time <= 0) endGame(false, 'timeUp');
  }

  function updateHud() {
    const w = Math.max(0, Math.round(state.player.weight));
    weightEl.textContent = w;
    timeEl.textContent = Math.ceil(state.time);
    const ratio = Math.max(0, Math.min(1, state.player.weight / MAX_WEIGHT));
    weightBar.style.width = (ratio * 100) + '%';
  }

  // ===== 描画 =====
  function draw() {
    const { w, h, player, foods, toilet, particles } = state;
    // 背景
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(0, 0, w, h);

    // タイルパターン（トイレの床感）
    ctx.fillStyle = 'rgba(255, 200, 120, 0.04)';
    for (let y = 0; y < h; y += 32) {
      for (let x = 0; x < w; x += 32) {
        if (((x / 32) + (y / 32)) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      }
    }

    // パーティクル
    particles.forEach(pt => {
      ctx.globalAlpha = Math.max(0, pt.life / 0.6);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // トイレ
    if (toilet) {
      const blink = toilet.life < 2 ? (0.5 + Math.sin(toilet.life * 12) * 0.5) : 1;
      ctx.globalAlpha = blink;
      const tgrad = ctx.createRadialGradient(toilet.x, toilet.y, 0, toilet.x, toilet.y, toilet.r + 16);
      tgrad.addColorStop(0, 'rgba(150, 230, 255, 0.55)');
      tgrad.addColorStop(0.6, 'rgba(100, 220, 255, 0.2)');
      tgrad.addColorStop(1, 'rgba(100, 220, 255, 0)');
      ctx.fillStyle = tgrad;
      ctx.beginPath();
      ctx.arc(toilet.x, toilet.y, toilet.r + 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold ' + (toilet.r * 1.9) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;
      ctx.fillText('🚽', toilet.x, toilet.y);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 1;
    }

    // 食べ物
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    foods.forEach(f => {
      // 明るい円板（暗背景に絵文字を浮かび上がらせる土台）
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.5);
      grad.addColorStop(0, 'rgba(255, 250, 235, 0.98)');
      grad.addColorStop(0.55, 'rgba(255, 240, 210, 0.85)');
      grad.addColorStop(1, 'rgba(255, 230, 180, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      // 絵文字本体（白いグローでくっきり）
      ctx.font = (f.r * 2.2) + 'px sans-serif';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(f.emoji, f.x, f.y);
      // 二重描きで色を濃くする
      ctx.shadowBlur = 0;
      ctx.fillText(f.emoji, f.x, f.y);
    });

    // プレイヤー（うんこ）
    const pr = playerRadius(player.weight);
    // 影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + pr * 0.85, pr * 0.85, pr * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // 明るい円板で土台
    const pgrad = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, pr * 1.35);
    pgrad.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
    pgrad.addColorStop(0.55, 'rgba(255, 225, 175, 0.75)');
    pgrad.addColorStop(1, 'rgba(255, 215, 150, 0)');
    ctx.fillStyle = pgrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, pr * 1.35, 0, Math.PI * 2);
    ctx.fill();
    // 本体（白いグローでくっきり）
    ctx.font = (pr * 2.2) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText('💩', player.x, player.y);
    ctx.shadowBlur = 0;
    ctx.fillText('💩', player.x, player.y);

    // でかくなりすぎ警告
    if (player.weight > MAX_WEIGHT * 0.8) {
      const pulse = 0.3 + Math.sin(performance.now() / 150) * 0.2;
      ctx.strokeStyle = `rgba(255, 80, 80, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, w - 4, h - 4);
    }
  }

  // ===== 終了 =====
  function endGame(isClear, reasonKey) {
    state.ended = true;
    cancelAnimationFrame(rafId);

    const w = Math.max(0, Math.round(state.player.weight));
    const elapsed = Math.round(TIME_LIMIT - state.time);

    resultIcon.textContent = isClear ? '✨🚽' : '💩';
    resultTitle.textContent = isClear ? t('clear', '脱出せいこう！') : t('gameOver', 'ゲームオーバー');
    resultMsg.textContent = t(reasonKey, '');
    finalWeight.textContent = w + 'kg';
    finalTime.textContent = elapsed + 's';

    // スコア: クリア時は残り時間+ボーナス、失敗時は減った体重
    const score = isClear ? (100 + Math.round(state.time) * 10) : Math.max(0, START_WEIGHT - w);
    // 死に方図鑑: 終了理由を死因として登録
    let deathType = 'timeup';
    if (isClear) deathType = 'escaped';
    else if (reasonKey === 'overWeight') deathType = 'oversize';
    if (sgHandle) {
      const res = sgHandle.onGameEnd(score, { deathType });
      if (res && res.isNewHigh) {
        resultMsg.textContent += '  🎉 ' + t('newRecord', 'NEW RECORD!');
      }
    }

    showScreen(resultScreen);
  }

  // ===== ボタン =====
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('retry-btn').addEventListener('click', startGame);
  document.getElementById('title-btn').addEventListener('click', () => {
    showScreen(titleScreen);
    refreshHighScore();
  });

  function refreshHighScore() {
    if (sgHandle && typeof sgHandle.getHighScore === 'function') {
      const hs = sgHandle.getHighScore();
      if (hs) {
        highScoreDisplay.textContent = '👑 ' + t('high', 'ハイスコア') + ': ' + hs;
      }
    }
  }

  // ===== SurrealGames 初期化 =====
  if (window.SurrealGames && typeof window.SurrealGames.init === 'function') {
    sgHandle = window.SurrealGames.init('dekaunko-escape');
    refreshHighScore();
  }
})();
