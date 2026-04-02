/**
 * シュールダッシュ - エンドレスランナー
 * うんちくんが走る！飛ぶ！シュールな世界のエンドレスラン！
 */
(function () {
  'use strict';

  // ===== i18n =====
  const translations = {
    ja: {
      gameTitle: 'シュールダッシュ',
      gameSub: 'うんちくんが走る！飛ぶ！シュールな世界のエンドレスラン！',
      startBtn: '💩 タップでスタート 💩',
      controlsTitle: '操作方法',
      controlsPC: 'PC：スペースキーでジャンプ（2段ジャンプ可能）',
      controlsMobile: 'スマホ：画面タップでジャンプ',
      scoreLabel: 'スコア',
      distLabel: '距離',
      gameOver: 'ゲームオーバー',
      finalScore: 'スコア',
      finalDist: '距離',
      finalStars: 'スター',
      newRecord: '🎉 NEW RECORD!',
      retryBtn: '💩 もう一度プレイ 💩',
      titleBtn: 'タイトルに戻る',
      rankS: '🏆 ランク S - シュールマスター！',
      rankA: '🥇 ランク A - すごい！',
      rankB: '🥈 ランク B - いい感じ！',
      rankC: '🥉 ランク C - まだまだ！',
      rankD: '💩 ランク D - がんばれ！',
      shareText: (score, dist) => `シュールダッシュで${score}点、${dist}m走ったよ！💩💨 #シュールゲームス`,
    },
    en: {
      gameTitle: 'Surreal Dash',
      gameSub: 'Poop-kun runs! Jumps! An endless run in a surreal world!',
      startBtn: '💩 Tap to Start 💩',
      controlsTitle: 'Controls',
      controlsPC: 'PC: Space to jump (double jump OK)',
      controlsMobile: 'Mobile: Tap to jump',
      scoreLabel: 'Score',
      distLabel: 'Dist',
      gameOver: 'Game Over',
      finalScore: 'Score',
      finalDist: 'Distance',
      finalStars: 'Stars',
      newRecord: '🎉 NEW RECORD!',
      retryBtn: '💩 Play Again 💩',
      titleBtn: 'Back to Title',
      rankS: '🏆 Rank S - Surreal Master!',
      rankA: '🥇 Rank A - Amazing!',
      rankB: '🥈 Rank B - Nice!',
      rankC: '🥉 Rank C - Keep going!',
      rankD: '💩 Rank D - Try harder!',
      shareText: (score, dist) => `I scored ${score} pts and ran ${dist}m in Surreal Dash! 💩💨 #SurrealGames`,
    }
  };

  if (window.SurrealI18n) {
    SurrealI18n.init(translations, {
      onLangChange: function () { updateAllText(); }
    });
  }

  function t(key, ...args) {
    return window.SurrealI18n ? SurrealI18n.t(key, ...args) : translations.ja[key] || key;
  }

  function updateAllText() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (typeof val === 'string') el.textContent = val;
    });
  }

  // ===== ゲームマネージャー初期化 =====
  var GameManager;
  if (window.SurrealGames) {
    GameManager = window.SurrealGames.init('surreal-dash');
  }

  // ===== DOM要素 =====
  var titleScreen = document.getElementById('title-screen');
  var gameScreen = document.getElementById('game-screen');
  var resultScreen = document.getElementById('result-screen');
  var startBtn = document.getElementById('start-btn');
  var retryBtn = document.getElementById('retry-btn');
  var titleBtn = document.getElementById('title-btn');
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');
  var scoreDisplay = document.getElementById('score-display');
  var distDisplay = document.getElementById('dist-display');
  var finalScore = document.getElementById('final-score');
  var finalDist = document.getElementById('final-dist');
  var finalStars = document.getElementById('final-stars');
  var resultRank = document.getElementById('result-rank');
  var newRecordEl = document.getElementById('new-record');

  // ===== ゲーム定数 =====
  var DESIGN_W = 500;
  var DESIGN_H = 700;
  var GROUND_H = 80;      // 地面の高さ
  var GRAVITY = 2200;      // 重力加速度 (px/s^2)
  var JUMP_VEL = -700;     // ジャンプ初速
  var MAX_JUMPS = 2;       // 2段ジャンプ
  var BASE_SPEED = 250;    // 初期スクロール速度 (px/s)
  var SPEED_INCREASE = 4;  // 速度増加 (px/s per second)
  var MAX_SPEED = 700;
  var PLAYER_SIZE = 40;
  var OBSTACLE_INTERVAL_MIN = 0.8; // 障害物の最小間隔(秒)
  var OBSTACLE_INTERVAL_MAX = 2.0;
  var STAR_INTERVAL_MIN = 1.5;
  var STAR_INTERVAL_MAX = 3.5;

  // ===== ゲーム状態 =====
  var state = {
    running: false,
    score: 0,
    distance: 0,
    starsCollected: 0,
    speed: BASE_SPEED,
    player: null,
    obstacles: [],
    stars: [],
    particles: [],
    bgOffset: 0,
    groundOffset: 0,
    nextObstacleTime: 0,
    nextStarTime: 0,
    elapsedTime: 0,
    lastTime: 0,
    animId: null,
    groundY: 0,
    // 背景の星
    bgStars: [],
  };

  // ===== キャンバスサイズ設定 =====
  var scale = 1;

  function resizeCanvas() {
    var maxW = Math.min(window.innerWidth, 500);
    var maxH = window.innerHeight;
    var ratio = DESIGN_W / DESIGN_H;
    var w, h;
    if (maxW / maxH > ratio) {
      h = maxH;
      w = h * ratio;
    } else {
      w = maxW;
      h = w / ratio;
    }
    canvas.width = DESIGN_W;
    canvas.height = DESIGN_H;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    scale = w / DESIGN_W;
    state.groundY = DESIGN_H - GROUND_H;
  }

  // ===== 背景の星を生成 =====
  function initBgStars() {
    state.bgStars = [];
    for (var i = 0; i < 60; i++) {
      state.bgStars.push({
        x: Math.random() * DESIGN_W,
        y: Math.random() * (DESIGN_H - GROUND_H),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
      });
    }
  }

  // ===== プレイヤー =====
  function createPlayer() {
    return {
      x: 80,
      y: state.groundY - PLAYER_SIZE,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE,
      vy: 0,
      jumps: 0,
      onGround: true,
    };
  }

  // ===== 障害物 =====
  function spawnObstacle() {
    var types = ['crab', 'cactus', 'bird'];
    var type = types[Math.floor(Math.random() * types.length)];
    var ob = { type: type, x: DESIGN_W + 10, w: 36, h: 36, passed: false };

    if (type === 'crab') {
      ob.y = state.groundY - 36;
      ob.emoji = '\uD83E\uDD80'; // 🦀
    } else if (type === 'cactus') {
      ob.h = 48;
      ob.y = state.groundY - 48;
      ob.emoji = '\uD83C\uDF35'; // 🌵
    } else {
      // 鳥：空中
      ob.y = state.groundY - 120 - Math.random() * 80;
      ob.emoji = '\uD83E\uDD85'; // 🦅
    }
    return ob;
  }

  // ===== スター =====
  function spawnStar() {
    return {
      x: DESIGN_W + 10,
      y: state.groundY - 60 - Math.random() * 140,
      w: 28,
      h: 28,
      emoji: '\u2B50', // ⭐
      collected: false,
    };
  }

  // ===== パーティクル =====
  function spawnRunParticles() {
    if (!state.player.onGround) return;
    for (var i = 0; i < 2; i++) {
      state.particles.push({
        x: state.player.x,
        y: state.player.y + state.player.h,
        vx: -Math.random() * 80 - 20,
        vy: -Math.random() * 40 - 10,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color: 'rgba(255, 110, 199, ',
      });
    }
  }

  function spawnCrashParticles() {
    for (var i = 0; i < 20; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 100 + Math.random() * 200;
      state.particles.push({
        x: state.player.x + state.player.w / 2,
        y: state.player.y + state.player.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 4 + Math.random() * 6,
        color: 'rgba(255, 255, 0, ',
      });
    }
  }

  function spawnStarParticles(sx, sy) {
    for (var i = 0; i < 8; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 60 + Math.random() * 80;
      state.particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color: 'rgba(0, 255, 247, ',
      });
    }
  }

  // ===== 当たり判定 (AABB) =====
  function collides(a, b) {
    var shrink = 6; // 若干小さめに判定
    return (
      a.x + shrink < b.x + b.w - shrink &&
      a.x + a.w - shrink > b.x + shrink &&
      a.y + shrink < b.y + b.h - shrink &&
      a.y + a.h - shrink > b.y + shrink
    );
  }

  // ===== ジャンプ =====
  function jump() {
    if (!state.running) return;
    var p = state.player;
    if (p.jumps < MAX_JUMPS) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      p.jumps++;
      if (GameManager) GameManager.sound.play('tap');
    }
  }

  // ===== 描画 =====
  function draw(dt) {
    // 背景グラデーション
    var grad = ctx.createLinearGradient(0, 0, DESIGN_W, DESIGN_H);
    grad.addColorStop(0, '#0d0221');
    grad.addColorStop(0.4, '#1a0a3e');
    grad.addColorStop(0.7, '#4a1580');
    grad.addColorStop(1, '#2d0533');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

    // 背景の星（きらきら）
    for (var i = 0; i < state.bgStars.length; i++) {
      var s = state.bgStars[i];
      var a = s.alpha * (0.5 + 0.5 * Math.sin(state.elapsedTime * s.twinkleSpeed));
      ctx.fillStyle = 'rgba(255, 255, 255, ' + a + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 地面
    drawGround();

    // スター
    for (var i = 0; i < state.stars.length; i++) {
      var st = state.stars[i];
      if (!st.collected) {
        ctx.font = st.w + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 浮遊アニメーション
        var floatY = Math.sin(state.elapsedTime * 3 + st.x * 0.01) * 6;
        ctx.fillText(st.emoji, st.x + st.w / 2, st.y + st.h / 2 + floatY);
      }
    }

    // 障害物
    for (var i = 0; i < state.obstacles.length; i++) {
      var ob = state.obstacles[i];
      ctx.font = ob.h + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ob.emoji, ob.x + ob.w / 2, ob.y + ob.h / 2);
    }

    // プレイヤー
    if (state.player) {
      ctx.font = state.player.w + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 走るとき少し傾ける
      ctx.save();
      var tilt = state.player.onGround ? Math.sin(state.elapsedTime * 12) * 0.1 : -0.2;
      ctx.translate(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2);
      ctx.rotate(tilt);
      ctx.fillText('\uD83D\uDCA9', 0, 0); // 💩
      ctx.restore();
    }

    // パーティクル
    for (var i = 0; i < state.particles.length; i++) {
      var p = state.particles[i];
      var alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    // スピードライン（高速時）
    if (state.speed > 400) {
      var lineAlpha = Math.min((state.speed - 400) / 300, 0.4);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + lineAlpha + ')';
      ctx.lineWidth = 1;
      for (var i = 0; i < 5; i++) {
        var ly = 50 + i * 120;
        var lx = ((state.bgOffset * 3 + i * 200) % (DESIGN_W + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 60, ly);
        ctx.stroke();
      }
    }
  }

  function drawGround() {
    // 地面背景
    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(0, state.groundY, DESIGN_W, GROUND_H);

    // 地面パターン（動くドット）
    ctx.fillStyle = 'rgba(255, 110, 199, 0.3)';
    var dotSpacing = 30;
    var offset = state.groundOffset % dotSpacing;
    for (var x = -offset; x < DESIGN_W + dotSpacing; x += dotSpacing) {
      for (var row = 0; row < 2; row++) {
        ctx.beginPath();
        ctx.arc(x, state.groundY + 15 + row * 25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 地面の上端ライン
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff6ec7';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(DESIGN_W, state.groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ===== アップデート =====
  function update(dt) {
    if (!state.running) return;

    state.elapsedTime += dt;
    state.speed = Math.min(BASE_SPEED + state.elapsedTime * SPEED_INCREASE, MAX_SPEED);
    state.distance += state.speed * dt;
    state.bgOffset += state.speed * dt * 0.3;
    state.groundOffset += state.speed * dt;

    // プレイヤー物理演算
    var p = state.player;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;

    // 地面着地
    if (p.y + p.h >= state.groundY) {
      p.y = state.groundY - p.h;
      p.vy = 0;
      p.onGround = true;
      p.jumps = 0;
    }

    // 走るパーティクル（間引き）
    if (Math.random() < 0.3) {
      spawnRunParticles();
    }

    // 距離スコア加算
    state.score = Math.floor(state.distance / 10) + state.starsCollected * 50;

    // 障害物スポーン
    state.nextObstacleTime -= dt;
    if (state.nextObstacleTime <= 0) {
      state.obstacles.push(spawnObstacle());
      var interval = OBSTACLE_INTERVAL_MIN +
        Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN);
      // 速度が上がると間隔が短くなる
      interval *= Math.max(0.4, BASE_SPEED / state.speed);
      state.nextObstacleTime = interval;
    }

    // スタースポーン
    state.nextStarTime -= dt;
    if (state.nextStarTime <= 0) {
      state.stars.push(spawnStar());
      state.nextStarTime = STAR_INTERVAL_MIN +
        Math.random() * (STAR_INTERVAL_MAX - STAR_INTERVAL_MIN);
    }

    // 障害物移動・判定
    for (var i = state.obstacles.length - 1; i >= 0; i--) {
      var ob = state.obstacles[i];
      ob.x -= state.speed * dt;

      // 通過スコア
      if (!ob.passed && ob.x + ob.w < p.x) {
        ob.passed = true;
      }

      // 当たり判定
      if (collides(p, ob)) {
        gameOver();
        return;
      }

      // 画面外
      if (ob.x + ob.w < -50) {
        state.obstacles.splice(i, 1);
      }
    }

    // スター移動・収集
    for (var i = state.stars.length - 1; i >= 0; i--) {
      var st = state.stars[i];
      st.x -= state.speed * dt;

      if (!st.collected && collides(p, st)) {
        st.collected = true;
        state.starsCollected++;
        spawnStarParticles(st.x + st.w / 2, st.y + st.h / 2);
        if (GameManager) GameManager.sound.play('correct');
      }

      if (st.x + st.w < -50) {
        state.stars.splice(i, 1);
      }
    }

    // パーティクル更新
    for (var i = state.particles.length - 1; i >= 0; i--) {
      var part = state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // HUD更新
    scoreDisplay.textContent = state.score;
    distDisplay.textContent = Math.floor(state.distance / 10) + 'm';
  }

  // ===== ゲームループ =====
  function gameLoop(timestamp) {
    if (!state.running) return;

    var dt = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    // フレーム落ち対策：dtが大きすぎる場合はクランプ
    if (dt > 0.1) dt = 0.016;

    update(dt);
    draw(dt);

    state.animId = requestAnimationFrame(gameLoop);
  }

  // ===== 画面切り替え =====
  function showScreen(screen) {
    titleScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // ===== ゲーム開始 =====
  function startGame() {
    resizeCanvas();
    initBgStars();

    state.running = true;
    state.score = 0;
    state.distance = 0;
    state.starsCollected = 0;
    state.speed = BASE_SPEED;
    state.obstacles = [];
    state.stars = [];
    state.particles = [];
    state.bgOffset = 0;
    state.groundOffset = 0;
    state.nextObstacleTime = 1.5; // 最初は少し余裕
    state.nextStarTime = 2.0;
    state.elapsedTime = 0;
    state.player = createPlayer();

    showScreen(gameScreen);

    if (GameManager) GameManager.onGameStart();

    state.lastTime = performance.now();
    state.animId = requestAnimationFrame(gameLoop);
  }

  // ===== ゲームオーバー =====
  function gameOver() {
    state.running = false;
    if (state.animId) {
      cancelAnimationFrame(state.animId);
      state.animId = null;
    }

    spawnCrashParticles();
    // クラッシュ後のパーティクルを少し描画
    draw(0);

    if (GameManager) GameManager.sound.play('wrong');

    var dist = Math.floor(state.distance / 10);
    var sc = state.score;
    var stars = state.starsCollected;

    // リザルト表示
    finalScore.textContent = sc;
    finalDist.textContent = dist + 'm';
    finalStars.textContent = stars;

    // ランク判定
    var rank;
    if (sc >= 2000) rank = t('rankS');
    else if (sc >= 1000) rank = t('rankA');
    else if (sc >= 500) rank = t('rankB');
    else if (sc >= 200) rank = t('rankC');
    else rank = t('rankD');
    resultRank.textContent = rank;

    // ハイスコア
    var result = GameManager ? GameManager.onGameEnd(sc, { distance: dist, stars: stars }) : {};
    if (result && result.isNewHigh) {
      newRecordEl.style.display = 'inline-block';
      newRecordEl.textContent = t('newRecord');
    } else {
      newRecordEl.style.display = 'none';
    }

    // シェアテキスト更新
    updateShareText(sc, dist);

    setTimeout(function () {
      showScreen(resultScreen);
      updateAllText();
    }, 600);
  }

  // ===== シェアテキスト =====
  function updateShareText(score, dist) {
    try {
      var text = t('shareText', score, dist);
      var url = 'https://eri-murayama.github.io/surreal-games/games/surreal-dash/index.html';
      var shareBtn = document.querySelector('.sg-share-btn');
      if (shareBtn) {
        shareBtn.href = 'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
      }
    } catch (e) { /* ignore */ }
  }

  // ===== ハイスコア表示 =====
  function showHighScore() {
    var display = document.getElementById('highscore-display');
    if (!display || !GameManager) return;
    var hs = GameManager.getHighScore();
    if (hs && hs.score > 0) {
      display.innerHTML = '<span class="sg-highscore-badge">' + hs.score + ' pts</span>';
    } else {
      display.innerHTML = '';
    }
  }

  // ===== 入力ハンドリング =====
  // キーボード
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (state.running) {
        jump();
      }
    }
  });

  // タッチ・クリック（ゲーム画面のみ）
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    jump();
  }, { passive: false });

  canvas.addEventListener('mousedown', function (e) {
    e.preventDefault();
    jump();
  });

  // リサイズ対応
  window.addEventListener('resize', function () {
    resizeCanvas();
  });

  // ===== ボタンイベント =====
  startBtn.addEventListener('click', function () {
    startGame();
  });

  retryBtn.addEventListener('click', function () {
    startGame();
  });

  titleBtn.addEventListener('click', function () {
    showScreen(titleScreen);
    showHighScore();
    updateAllText();
  });

  // ===== 初期化 =====
  resizeCanvas();
  initBgStars();
  showHighScore();
  updateAllText();

})();
