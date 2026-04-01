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
  const storyScreen  = $('story-screen');
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
    'いいね～', '過去にやってた？', 'エクスタシー！',
    'もっとくれよ！', 'ハイになっちまうぜえ？', 'きたきたきたあ！',
    'ふうううう！', 'いい匂い！', 'この形！この艶！',
    'これだからたまんねえよ！'
  ];

  const HERO_MILESTONE = [
    '５段！ひよっこうんコーン技師！',
    '１０段！うんコーンバイトリーダー！',
    '１５段！よっ、うんコーン部長！',
    '２０段！イケメンうんコーン実業家！',
    '２５段！うんコーンタワー建設！',
    '３０段！神のうんコーン生誕！',
    '３５段！宇宙を超えたうんコーン！'
  ];

  // ---- 主人公のリザルトコメント ----
  const HERO_COMMENTS = {
    terrible: [
      'え…{stack}段？そっか…そうだよね、君みたいな人間にこんな難しいことできるわけないか…。僕こそごめんね…謝るよ。',
    ],
    bad: [
      '{stack}段か。うんうんうん大丈夫大丈夫！生まれながらにして劣っている人っているもんね。気にしないで。もう休んでいいよ！',
    ],
    ok: [
      '{stack}段！わあ、君なりに頑張ってくれたんだね。形はきっったないけど。でも嬉しいよ。ありがとうね。',
    ],
    good: [
      '{stack}段！？！？！？きみ、きみきみ、す、すす、すごいよ！わああ、拝みたい！君に入信したい！！',
    ],
    amazing: [
      '{stack}段！？！？！？きみ、きみきみ、す、すす、すごいよ！わああ、拝みたい！君に入信したい！！',
    ],
    godlike: [
      '{stack}段…。そうだね、君にだけ教えよう…。僕はうんちなんだ…。共にうんちになろう。',
    ]
  };

  // ---- Character image for in-game ----
  const heroImg = new Image();
  heroImg.src = 'character.png';

  // ---- Story screen logic ----
  const STORY_LINES = [
    'やあ、僕はうん…\nチョコ味のソフトクリーム！',
    'お腹を空かせた貧しい君たちに\n食べてもらいたい…。\nそんな気持ちでたっくさんの\nソフトクリームを作ったよ！',
    '今から踏ん張って\nねじり出していくから\n残さずキャッチしてね！'
  ];
  let storyStep = 0;

  // トイレの流れる音（Web Audio APIで生成）
  function playFlushSE() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 1.8;
      const sampleRate = ac.sampleRate;
      const len = sampleRate * duration;
      const buf = ac.createBuffer(1, len, sampleRate);
      const data = buf.getChannelData(0);
      // ノイズベースのフラッシュ音
      for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = Math.max(0, 1 - t / duration) * (0.5 + 0.5 * Math.sin(t * 3));
        const noise = (Math.random() * 2 - 1);
        const rumble = Math.sin(t * 80 * Math.PI * 2) * 0.3;
        const swoosh = Math.sin(t * 200 * Math.PI * 2 * (1 - t / duration)) * 0.2;
        data[i] = (noise * 0.4 + rumble + swoosh) * env * 0.3;
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.connect(ac.destination);
      src.start();
      src.onended = () => ac.close();
    } catch (e) {
      // 音が出なくてもゲームは続行
    }
  }

  function showStoryScreen() {
    storyStep = 0;
    showScreen(storyScreen);
    showStoryLine();
    // のほほんBGM開始
    sg.sound.playBgm('nohohon');
  }

  function showStoryLine() {
    const bubble = $('story-bubble');
    const text = $('story-text');
    const hint = $('story-tap-hint');

    if (storyStep < STORY_LINES.length) {
      bubble.classList.remove('visible');
      setTimeout(() => {
        text.textContent = STORY_LINES[storyStep];
        bubble.classList.add('visible');
      }, 200);
      hint.textContent = storyStep < STORY_LINES.length - 1 ? 'タップして次へ' : 'タップしてゲーム開始！';
    }
  }

  function advanceStory() {
    storyStep++;
    if (storyStep < STORY_LINES.length) {
      showStoryLine();
    } else {
      // 最後のセリフ後：のほほんBGM停止→SE再生→ゲーム開始
      sg.sound.stopBgm();
      playFlushSE();
      setTimeout(() => startGame(), 800);
    }
  }

  // ストーリー画面のクリック/タップで進行
  storyScreen.addEventListener('click', advanceStory);

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

  // ---- Character drawing (character.png) ----
  function drawHero(x, y) {
    if (!heroImg.complete) return;
    const coneTopY = y - CONE_H;
    const stackH = stack.length * 14;
    const imgW = 48;
    const imgH = 48;
    const drawX = x - imgW / 2;
    const drawY = coneTopY - stackH - imgH - 4;

    ctx.drawImage(heroImg, drawX, drawY, imgW, imgH);
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

  let nishidaTimer = null;
  function showNishidaComment(text) {
    if (nishidaTimer) clearTimeout(nishidaTimer);
    nishidaComment.textContent = text;
    nishidaComment.classList.remove('active');
    void nishidaComment.offsetWidth;
    nishidaComment.classList.add('active');
    nishidaTimer = setTimeout(() => nishidaComment.classList.remove('active'), 1500);
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
        sg.sound.play('splat');
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

    // SE: キャッチ時はボトッ＋おなら、コンボ3以上でブブブー
    if (combo >= 3) {
      sg.sound.play('fart_long');
    } else {
      sg.sound.play('plop');
      if (Math.random() < 0.4) {
        setTimeout(() => sg.sound.play('fart'), 80);
      }
    }

    // コンボ5ごとにBGMテンポアップ
    if (combo > 0 && combo % 5 === 0) {
      const newSpeed = Math.min(1.0 + combo * 0.05, 1.8);
      sg.sound.setBgmSpeed(newSpeed);
    }

    // Increase difficulty
    fallSpeed += SPEED_INCREMENT * 0.3;
    spawnInterval = Math.max(SPAWN_INTERVAL_MIN, spawnInterval - SPAWN_INTERVAL_DECREASE * 0.5);

    // Reactions
    if (stackCount % 5 === 0) {
      const idx = Math.min(Math.floor(stackCount / 5) - 1, HERO_MILESTONE.length - 1);
      showCombo(HERO_MILESTONE[idx]);
    } else {
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

    // Rank（HERO_MILESTONEと一致）
    let rank = '';
    if (maxStack >= 35) rank = '🌌 宇宙を超えたうんコーン 🌌';
    else if (maxStack >= 30) rank = '👑 神のうんコーン生誕 👑';
    else if (maxStack >= 25) rank = '🏗️ うんコーンタワー建設 🏗️';
    else if (maxStack >= 20) rank = '💼 イケメンうんコーン実業家 💼';
    else if (maxStack >= 15) rank = '🎩 よっ、うんコーン部長 🎩';
    else if (maxStack >= 10) rank = '🍦 うんコーンバイトリーダー 🍦';
    else if (maxStack >= 5) rank = '🐣 ひよっこうんコーン技師 🐣';
    else rank = '😢 うんコーン以下の存在 😢';
    $('result-rank').textContent = rank;

    // 主人公のコメント
    let tier;
    if (maxStack >= 35) tier = 'godlike';
    else if (maxStack >= 25) tier = 'amazing';
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
    [titleScreen, storyScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
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
  $('start-btn').addEventListener('click', showStoryScreen);
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
