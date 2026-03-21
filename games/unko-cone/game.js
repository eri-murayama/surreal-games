/* ============================================================
   うんコーンキャッチャー  |  game.js
   西田がコーンでうんこをキャッチして積み上げるゲーム
   ============================================================ */

(() => {
  'use strict';

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

  // ---- Nishida's reactions ----
  const NISHIDA_CATCH = [
    'よっしゃ！', 'ナイスキャッチ！', 'うまい！',
    'のってきた！', 'まだまだ！', 'いけるいける！',
    'レモンジャムの味がする！', 'ララチューン♪',
    '芸人の勘や！', 'これがラランドや！'
  ];

  const NISHIDA_MILESTONE = [
    '5段！ソフトクリームっぽくなってきた！',
    '10段！もはや芸術やな！',
    '15段！東京タワー超えたわ！',
    '20段！宇宙まで届け！',
    '25段！神の領域や！'
  ];

  // ---- さーやのヒス構文 ----
  const SAAYA_COMMENTS = {
    terrible: [
      'へぇ〜、{score}点なんだ。\nまぁ、私は別にいいけど。\nうんこも拾えないんだね。',
      'ふーん、{stack}段しか積めなかったんだ。\n私だったらもっと積めるけど。\nまぁ別にどうでもいいけどね。',
      '{score}点ってさ、\n普通にやってもそれくらいいくよね？\nいや、責めてるわけじゃないけど。',
    ],
    bad: [
      'あ、{stack}段積めたんだ。\nまぁまぁじゃない？知らんけど。\n私なら倍は積むけどね。',
      '{score}点か〜。\n頑張ったんだろうね、うん。\nで、それで満足なの？別にいいけど。',
      'うんこ{stack}段ね。\n西田にしては頑張ったんじゃない？\nレモンジャムでも飲んで落ち着きなよ。',
    ],
    ok: [
      '{stack}段も積めたんだ、すごいじゃん。\nいや別に褒めてないけど。\nもうちょっと頑張れたんじゃないの？',
      '{score}点ね。\nまぁ悪くはないんじゃない？\n私の推しならもっと取るけどね、別にいいけど。',
      'へぇ〜{stack}段。\nちょっと見直したかも。\nいや、見直してないけど。',
    ],
    good: [
      '{stack}段！？\nちょっと何それ、引くんだけど。\nうんこの才能あるよ。褒めてないけど。',
      '{score}点じゃん、やるね。\nいやまぁ、私がやったらもっといくけど。\n…ちょっとだけ認めてあげる。',
      'は？{stack}段？\nそういうとこだよ西田は。\n変なことだけ上手いんだから。',
    ],
    amazing: [
      '{stack}段って…\nもう人間じゃないでしょ。\nうんこに人生捧げてるの？\n…ちょっとかっこいいかも。言ってないけど。',
      '{score}点…\nは？意味わかんないんだけど。\nこのゲーム壊れてない？\n…まぁ、すごいけど。絶対言わないけど。',
      '西田さぁ…{stack}段って…\nもうララチューンの歌詞にするわ。\n「うんこ{stack}段の男」。\n…冗談だけど。半分本気だけど。',
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

  function drawNishida(x, y) {
    // Head
    const headW = 44;
    const headH = 48;
    const headX = x;
    const headY = y - CONE_H - (stack.length * 14) - headH / 2 - 10;

    // Body (simple)
    ctx.fillStyle = '#3366cc';
    ctx.fillRect(headX - 18, headY + headH / 2, 36, 30);

    // Arms holding cone
    ctx.strokeStyle = '#f5d6b8';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    // Left arm
    ctx.beginPath();
    ctx.moveTo(headX - 18, headY + headH / 2 + 10);
    ctx.lineTo(x - CONE_W / 2 + 5, y - CONE_H + 5);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(headX + 18, headY + headH / 2 + 10);
    ctx.lineTo(x + CONE_W / 2 - 5, y - CONE_H + 5);
    ctx.stroke();

    // Head shape
    ctx.fillStyle = '#f5d6b8';
    ctx.beginPath();
    ctx.ellipse(headX, headY, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(headX, headY - 10, headW / 2 + 2, 20, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(headX - 10, headY - 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 10, headY - 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose hair (シュールゲームス tradition)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headX - 3, headY + 8);
    ctx.quadraticCurveTo(headX - 8, headY + 16, headX - 2, headY + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + 3, headY + 8);
    ctx.quadraticCurveTo(headX + 8, headY + 16, headX + 2, headY + 18);
    ctx.stroke();

    // Mouth (happy when catching)
    ctx.fillStyle = '#1a1a1a';
    if (combo > 0) {
      // Big smile
      ctx.beginPath();
      ctx.arc(headX, headY + 12, 8, 0, Math.PI);
      ctx.fill();
    } else {
      // Normal
      ctx.beginPath();
      ctx.arc(headX, headY + 14, 6, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
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

    update(dt);
    render();

    animationId = requestAnimationFrame(gameLoop);
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
      const idx = Math.min(Math.floor(stackCount / 5) - 1, NISHIDA_MILESTONE.length - 1);
      showCombo(NISHIDA_MILESTONE[idx]);
    } else if (combo >= 3 && combo % 3 === 0) {
      showCombo('💩×' + combo + ' コンボ！');
    } else if (Math.random() < 0.25) {
      const msg = NISHIDA_CATCH[Math.floor(Math.random() * NISHIDA_CATCH.length)];
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

    // Draw Nishida
    drawNishida(playerX, playerY);
  }

  // ---- Game lifecycle ----
  function startGame() {
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

    // さーやのヒス構文
    let tier;
    if (maxStack >= 25) tier = 'amazing';
    else if (maxStack >= 15) tier = 'good';
    else if (maxStack >= 10) tier = 'ok';
    else if (maxStack >= 5) tier = 'bad';
    else tier = 'terrible';

    const comments = SAAYA_COMMENTS[tier];
    let comment = comments[Math.floor(Math.random() * comments.length)];
    comment = comment.replace(/\{score\}/g, score).replace(/\{stack\}/g, maxStack);
    $('saaya-text').textContent = comment;

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
  $('title-btn').addEventListener('click', () => showScreen(titleScreen));

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

})();
