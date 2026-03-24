/* ============================================================
   うんコーンキャッチャー  |  game.js
   主人公がコーンでうんこをキャッチして積み上げるゲーム
   ============================================================ */

(() => {
  'use strict';

  // ===== 共通モジュール初期化 =====
  const sg = SurrealGames.init('unko-cone');

  // ---- DOM ----
  const $ = id => document.getElementById(id);
  const titleScreen  = $('title-screen');
  const gameScreen   = $('game-screen');
  const resultScreen = $('result-screen');
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  const comboText = $('combo-text');
  const nishidaComment = $('nishida-comment');

  // ---- Constants ----
  const GAME_W = 360;
  const GAME_H = 600;
  const CONE_W = 50;
  const CONE_H = 60;
  const POOP_SIZE = 32;
  const PLAYER_SPEED = 6;
  const INITIAL_FALL_SPEED = 2.5;
  const SPEED_INCREMENT = 0.15;
  const SPAWN_INTERVAL_INITIAL = 1800;
  const SPAWN_INTERVAL_MIN = 600;
  const SPAWN_INTERVAL_DECREASE = 40;

  // ---- 主人公のリアクション ----
  const HERO_CATCH = [
    'よっしゃ！', 'ナイスキャッチ！', 'うまい！',
    'のってきた！', 'まだまだ！', 'いけるいける！',
    'うん…ソフトクリームの匂いがする！', 'もっとちょうだい！',
    '最高の気分！', 'うんち…じゃなくてソフトクリーム！'
  ];

  const HERO_MILESTONE = [
    '5段！ソフトクリームっぽくなってきた！',
    '10段！もはや芸術だね！',
    '15段！東京タワー超えた！',
    '20段！宇宙まで届け！',
    '25段！神の領域だ！'
  ];

  // ---- 主人公のリザルトコメント ----
  const HERO_COMMENTS = {
    terrible: [
      'え…{score}点？\nうん…ソフトクリームだよね、あれ。\n絶対ソフトクリームだったのに…。',
      '{stack}段しか積めなかった…。\nもっとうんち…ソフトクリームが\n欲しかったのに！',
      '{score}点かぁ…。\nソフトクリーム、全然キャッチできなかった。\n…あ、今ソフトクリームって言ったよね？',
    ],
    bad: [
      '{stack}段！まだまだだなぁ。\nもっとうん…ソフトクリームを\n積み上げたかった！',
      '{score}点か。\nソフトクリームの匂い、\nもっと嗅ぎたかったなぁ…。',
      'うんち…じゃなくてソフトクリーム{stack}段！\n次はもっといけるはず！',
    ],
    ok: [
      '{stack}段！いい感じ！\nこのソフトクリーム…じゃなくて\nうん…ソフトクリームタワー、最高！',
      '{score}点！なかなかだね！\nもっとソフトクリーム積みたいなぁ。\nあの形、たまらないよね…。',
      '{stack}段も積めた！\nうんち…ソフトクリームの山、\n見てるだけで幸せだよ！',
    ],
    good: [
      '{stack}段！すごくない！？\nこのソフトクリームタワー、\n世界一だよ絶対！…たぶん！',
      '{score}点！やったぁ！\nうんち…ソフトクリームのキャッチ、\n僕って天才かも！',
      '{stack}段のソフトクリームタワー！\nもう食べき…いや、見切れないよ！\n最高の眺めだなぁ！',
    ],
    amazing: [
      '{stack}段！？\nこれもうソフトクリームの神だよね！？\n…あ、今うんちって言いそうに\nなったけど言ってないからね！',
      '{score}点…！\nソフトクリームへの愛が止まらない！\nうんち…違う！ソフトクリーム！\nソフトクリームが大好きなだけ！',
      '{stack}段の超巨大ソフトクリーム！\nこれはもう芸術だよ！\nうんちって言った人いる？\n僕は言ってないよ！絶対！',
    ]
  };

  // ---- Game State ----
  let playerX, playerY;
  let poops = [];      // falling poops: { x, y, speed, wobble }
  let stack = [];       // caught poops on cone: { offsetX, size }
  let score, stackCount, combo, maxStack;
  let fallSpeed, spawnInterval, spawnTimer;
  let gameOver, animationId, lastTime;
  let keysDown = {};

  // ---- Scaling ----
  let scale = 1;

  function resizeCanvas() {
    const maxW = Math.min(window.innerWidth - 8, GAME_W);
    const maxH = Math.min(window.innerHeight - 80, GAME_H);
    scale = Math.min(maxW / GAME_W, maxH / GAME_H);
    canvas.width = GAME_W * scale;
    canvas.height = GAME_H * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  // ---- Drawing helpers ----
  function drawCone(x, y) {
    // Cone (triangle)
    ctx.fillStyle = '#d4a050';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - CONE_W / 2, y - CONE_H);
    ctx.lineTo(x + CONE_W / 2, y - CONE_H);
    ctx.closePath();
    ctx.fill();

    // Waffle pattern
    ctx.strokeStyle = '#b8863c';
    ctx.lineWidth = 1;
    const steps = 4;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lx = x + (-CONE_W / 2) * (1 - t);
      const rx = x + (CONE_W / 2) * (1 - t);
      const ly = y + (-CONE_H) * (1 - t);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ly);
      ctx.stroke();
    }
  }

  // ---- Character drawing ----
  function drawHero(x, y) {
    const headR = 22;
    const bodyH = 28;
    const headX = x;
    const coneTopY = y - CONE_H;
    const stackH = stack.length * 14;
    const headY = coneTopY - stackH - headR - bodyH - 4;
    const bodyY = headY + headR;

    ctx.save();

    // --- Body (orange shirt) ---
    ctx.fillStyle = '#F06030';
    ctx.beginPath();
    ctx.moveTo(headX - 16, bodyY);
    ctx.lineTo(headX - 18, bodyY + bodyH);
    ctx.lineTo(headX + 18, bodyY + bodyH);
    ctx.lineTo(headX + 16, bodyY);
    ctx.closePath();
    ctx.fill();
    // Collar line
    ctx.strokeStyle = '#D04820';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX, bodyY + 2, 8, 0, Math.PI);
    ctx.stroke();

    // --- Arms holding cone ---
    ctx.strokeStyle = '#f5cdb0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    // Left arm
    ctx.beginPath();
    ctx.moveTo(headX - 18, bodyY + 8);
    ctx.quadraticCurveTo(headX - 26, bodyY + bodyH + 10, x - CONE_W / 2 + 8, coneTopY - stackH + 5);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(headX + 18, bodyY + 8);
    ctx.quadraticCurveTo(headX + 26, bodyY + bodyH + 10, x + CONE_W / 2 - 8, coneTopY - stackH + 5);
    ctx.stroke();

    // --- Head ---
    // Skin
    ctx.fillStyle = '#f5cdb0';
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#f5cdb0';
    ctx.beginPath();
    ctx.ellipse(headX - headR + 2, headY + 2, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headR - 2, headY + 2, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Buzz-cut hair (dark gray, covers top of head)
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(headX, headY - 2, headR - 1, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    // Hair dots for buzz texture
    ctx.fillStyle = '#444';
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI + (Math.PI * i / 12);
      const r = headR * (0.5 + Math.random() * 0.35);
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r - 2;
      ctx.beginPath();
      ctx.arc(headX + dx, headY + dy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes (big round)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(headX - 8, headY + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 8, headY + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlights
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX - 6, headY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 10, headY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (open, happy)
    ctx.fillStyle = '#e04030';
    ctx.beginPath();
    ctx.arc(headX, headY + 11, 6, 0, Math.PI);
    ctx.fill();

    // Cheeks (blush)
    ctx.fillStyle = 'rgba(255, 130, 100, 0.35)';
    ctx.beginPath();
    ctx.ellipse(headX - 14, headY + 8, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 14, headY + 8, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawPoop(x, y, size) {
    const s = size || POOP_SIZE;
    const cx = x;
    const cy = y;

    // Poop swirl (3 layers)
    ctx.fillStyle = '#8B4513';

    // Bottom layer
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.15, s * 0.45, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Middle layer
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.05, s * 0.35, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top layer (pointed)
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.22, s * 0.22, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tip
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.08, cy - s * 0.32);
    ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.5, cx + s * 0.05, cy - s * 0.42);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.1, cy - s * 0.15, s * 0.06, s * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStackedPoops(baseX, baseY) {
    for (let i = 0; i < stack.length; i++) {
      const p = stack[i];
      const px = baseX + p.offsetX;
      const py = baseY - CONE_H - i * 14 - 8;
      drawPoop(px, py, p.size);
    }
  }

  // ---- Spawning ----
  function spawnPoop() {
    const x = POOP_SIZE / 2 + Math.random() * (GAME_W - POOP_SIZE);
    const wobbleSpeed = 0.5 + Math.random() * 1.5;
    const wobbleAmp = 10 + Math.random() * 20;
    poops.push({
      x,
      y: -POOP_SIZE,
      speed: fallSpeed + (Math.random() - 0.5) * 0.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed,
      wobbleAmp,
      baseX: x
    });
  }

  // ---- Collision ----
  function checkCatch(poop) {
    const coneTopY = playerY - CONE_H;
    const stackTopY = coneTopY - stack.length * 14 - 10;
    const catchZoneTop = stackTopY - 10;
    const catchZoneBottom = stackTopY + 20;

    if (poop.y >= catchZoneTop && poop.y <= catchZoneBottom) {
      const dx = Math.abs(poop.x - playerX);
      const catchWidth = CONE_W / 2 + 8 + Math.min(stack.length * 1.5, 15);
      if (dx < catchWidth) {
        return true;
      }
    }
    return false;
  }

  // ---- UI updates ----
  function updateHUD() {
    $('score').textContent = score;
    $('stack-count').textContent = stackCount;
  }

  function showCombo(text) {
    comboText.textContent = text;
    comboText.classList.remove('active');
    void comboText.offsetWidth;
    comboText.classList.add('active');
    setTimeout(() => comboText.classList.remove('active'), 1000);
  }

  function showNishidaComment(text) {
    nishidaComment.textContent = text;
    nishidaComment.classList.remove('active');
    void nishidaComment.offsetWidth;
    nishidaComment.classList.add('active');
    setTimeout(() => nishidaComment.classList.remove('active'), 1500);
  }

  // ---- Game Loop ----
  function gameLoop(time) {
    if (gameOver) return;
    if (!lastTime) lastTime = time;
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;

    try {
      update(dt);
      if (!gameOver) render();
    } catch (e) {
      console.error('Game loop error:', e);
    }

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function update(dt) {
    // Player movement
    if (keysDown['ArrowLeft'] || keysDown['a']) {
      playerX = Math.max(CONE_W / 2, playerX - PLAYER_SPEED);
    }
    if (keysDown['ArrowRight'] || keysDown['d']) {
      playerX = Math.min(GAME_W - CONE_W / 2, playerX + PLAYER_SPEED);
    }

    // Spawn timer
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnPoop();
      spawnTimer = spawnInterval;
    }

    // Update poops
    for (let i = poops.length - 1; i >= 0; i--) {
      const p = poops[i];
      p.y += p.speed;
      p.wobblePhase += p.wobbleSpeed * (dt / 100);
      p.x = p.baseX + Math.sin(p.wobblePhase) * p.wobbleAmp;

      // Keep in bounds
      p.x = Math.max(POOP_SIZE / 2, Math.min(GAME_W - POOP_SIZE / 2, p.x));

      // Check catch
      if (checkCatch(p)) {
        catchPoop(p);
        poops.splice(i, 1);
        continue;
      }

      // Missed - fell past player
      if (p.y > GAME_H + POOP_SIZE) {
        endGame();
        return;
      }
    }
  }

  function catchPoop() {
    combo++;
    const wobble = (Math.random() - 0.5) * 6;
    const size = POOP_SIZE * (0.85 + Math.random() * 0.3);
    stack.push({ offsetX: wobble, size });
    stackCount++;

    // Score: more points for higher stacks
    const pts = 10 + stackCount * 5 + combo * 3;
    score += pts;

    // Increase difficulty
    fallSpeed += SPEED_INCREMENT * 0.3;
    spawnInterval = Math.max(SPAWN_INTERVAL_MIN, spawnInterval - SPAWN_INTERVAL_DECREASE * 0.5);

    // Reactions
    if (stackCount % 5 === 0) {
      const idx = Math.min(Math.floor(stackCount / 5) - 1, HERO_MILESTONE.length - 1);
      showCombo(HERO_MILESTONE[idx]);
    } else if (combo >= 3 && combo % 3 === 0) {
      showCombo('💩×' + combo + ' コンボ！');
    } else if (Math.random() < 0.25) {
      const msg = HERO_CATCH[Math.floor(Math.random() * HERO_CATCH.length)];
      showNishidaComment(msg);
    }

    updateHUD();
  }

  function render() {
    // Clear
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Ground line
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(0, GAME_H - 10, GAME_W, 10);

    // Draw falling poops
    for (const p of poops) {
      drawPoop(p.x, p.y, POOP_SIZE);
    }

    // Draw cone
    drawCone(playerX, playerY);

    // Draw stacked poops
    drawStackedPoops(playerX, playerY);

    // Draw hero
    drawHero(playerX, playerY);
  }

  // ---- Game lifecycle ----
  function startGame() {
    sg.onGameStart();
    playerX = GAME_W / 2;
    playerY = GAME_H - 30;
    poops = [];
    stack = [];
    score = 0;
    stackCount = 0;
    combo = 0;
    maxStack = 0;
    fallSpeed = INITIAL_FALL_SPEED;
    spawnInterval = SPAWN_INTERVAL_INITIAL;
    spawnTimer = 500;
    gameOver = false;
    lastTime = 0;

    resizeCanvas();
    updateHUD();
    showScreen(gameScreen);

    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameOver = true;
    if (animationId) cancelAnimationFrame(animationId);

    maxStack = stackCount;
    sg.onGameEnd(score);

    $('final-score').textContent = score;
    $('final-stack').textContent = maxStack;

    // Rank
    let rank = '';
    if (maxStack >= 25) rank = '💩👑 うんこの神 👑💩';
    else if (maxStack >= 15) rank = '💩 うんこマスター 💩';
    else if (maxStack >= 10) rank = '🍦 うんコーン職人 🍦';
    else if (maxStack >= 5) rank = '✨ 見習いキャッチャー ✨';
    else rank = '😢 うんこ初心者 😢';
    $('result-rank').textContent = rank;

    // 主人公のコメント
    let tier;
    if (maxStack >= 25) tier = 'amazing';
    else if (maxStack >= 15) tier = 'good';
    else if (maxStack >= 10) tier = 'ok';
    else if (maxStack >= 5) tier = 'bad';
    else tier = 'terrible';

    const comments = HERO_COMMENTS[tier];
    let comment = comments[Math.floor(Math.random() * comments.length)];
    comment = comment.replace(/\{score\}/g, score).replace(/\{stack\}/g, maxStack);
    $('character-text').textContent = comment;

    // Share button
    const existingShareBtn = $('share-btn');
    if (existingShareBtn) existingShareBtn.remove();

    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.className = 'btn-primary';
    shareBtn.textContent = '𝕏 結果をシェア';
    shareBtn.style.cssText = 'background: linear-gradient(135deg, #1a1a1a, #333); margin-bottom: 12px;';
    shareBtn.addEventListener('click', () => {
      const gameURL = window.location.href;
      const text = `💩🍦 うんコーンキャッチャー\nスコア: ${score}点\n最大積み: ${maxStack}段\nランク: ${rank}\n\n#シュールゲームス\n${gameURL}`;
      const tweetURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(tweetURL, '_blank');
    });

    const retryBtn = $('retry-btn');
    retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

    setTimeout(() => showScreen(resultScreen), 400);
  }

  function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // ---- Controls ----
  document.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
      e.preventDefault();
    }
    keysDown[e.key] = true;
  });

  document.addEventListener('keyup', e => {
    keysDown[e.key] = false;
  });

  // Touch controls
  let touchActive = false;
  let touchX = 0;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    touchActive = true;
    touchX = e.touches[0].clientX;
    updateTouchDirection();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!touchActive) return;
    touchX = e.touches[0].clientX;
    updateTouchDirection();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    touchActive = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => {
    touchActive = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  });

  function updateTouchDirection() {
    const rect = canvas.getBoundingClientRect();
    const canvasMidX = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = touchX < canvasMidX - 20;
    keysDown['ArrowRight'] = touchX > canvasMidX + 20;
  }

  // Mouse controls for desktop
  let mouseDown = false;

  canvas.addEventListener('mousedown', e => {
    mouseDown = true;
    updateMouseDirection(e);
  });

  canvas.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    updateMouseDirection(e);
  });

  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  });

  canvas.addEventListener('mouseleave', () => {
    if (mouseDown) {
      mouseDown = false;
      keysDown['ArrowLeft'] = false;
      keysDown['ArrowRight'] = false;
    }
  });

  function updateMouseDirection(e) {
    const rect = canvas.getBoundingClientRect();
    const canvasMidX = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = e.clientX < canvasMidX - 20;
    keysDown['ArrowRight'] = e.clientX > canvasMidX + 20;
  }

  // ---- Button events ----
  $('start-btn').addEventListener('click', startGame);
  $('retry-btn').addEventListener('click', startGame);
  $('title-btn').addEventListener('click', () => { showScreen(titleScreen); showHighScore(); });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    if (gameScreen.classList.contains('active')) {
      resizeCanvas();
      render();
    }
  });

  // Prevent scroll during game
  document.addEventListener('touchmove', e => {
    if (gameScreen.classList.contains('active')) {
      e.preventDefault();
    }
  }, { passive: false });

  // ---- High score display ----
  function showHighScore() {
    const best = sg.getHighScore();
    const el = $('highscore-display');
    if (el) {
      el.textContent = best ? `ハイスコア: ${best}点` : '';
    }
  }
  showHighScore();

})();
