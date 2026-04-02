// ========================================
// シュールキューブ - 3Dランニングゲーム
// ========================================

(function () {
  'use strict';

  // --- i18n ---
  const TRANSLATIONS = {
    ja: {
      title: 'シュールキューブ',
      subtitle: '3D空間を転がれ！シュールなキューブの大冒険！',
      start: 'スタート',
      gameOver: 'ゲームオーバー',
      scoreLabel: 'スコア',
      distLabel: '距離',
      retry: 'もう一回',
      shareText: (score, dist) =>
        `シュールキューブで ${dist}m 走って ${score} 点取った！ #シュールゲームス`,
    },
    en: {
      title: 'Surreal Cube',
      subtitle: 'Roll through 3D space! A surreal cube adventure!',
      start: 'Start',
      gameOver: 'Game Over',
      scoreLabel: 'Score',
      distLabel: 'Dist',
      retry: 'Play Again',
      shareText: (score, dist) =>
        `I scored ${score} pts running ${dist}m in Surreal Cube! #SurrealGames`,
    },
  };

  SurrealI18n.init(TRANSLATIONS, {
    onLangChange: () => updateI18nTexts(),
  });

  function t(key, ...args) { return SurrealI18n.t(key, ...args); }

  function updateI18nTexts() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (typeof val === 'string') el.textContent = val;
    });
  }

  // --- GameManager ---
  const GameManager = window.SurrealGames.init('surreal-cube');

  // --- 定数 ---
  const CW = 400; // Canvas幅
  const CH = 600; // Canvas高さ
  const LANE_COUNT = 3;
  const CUBE_FACES = ['💩', '🦀', '🐣'];

  // パースペクティブ定数
  const VANISH_X = CW / 2;  // 消失点X
  const VANISH_Y = CH * 0.32; // 消失点Y
  const ROAD_BOTTOM_W = CW * 0.85; // コース下端の幅
  const ROAD_TOP_W = CW * 0.08;   // コース上端（消失点付近）の幅
  const ROAD_BOTTOM_Y = CH * 0.95;
  const ROAD_TOP_Y = VANISH_Y + 20;

  // キューブ位置
  const CUBE_Y_SCREEN = CH * 0.78; // キューブの画面上のY位置
  const CUBE_SIZE = 44; // キューブ一辺のサイズ

  // ゲーム設定
  const INITIAL_SPEED = 200;    // 初期速度(px/s 仮想距離)
  const SPEED_INCREASE = 8;     // 1秒あたりの速度上昇
  const MAX_SPEED = 600;
  const OBSTACLE_INTERVAL_MIN = 0.8; // 障害物生成間隔（秒）
  const OBSTACLE_INTERVAL_MAX = 2.0;
  const STAR_INTERVAL_MIN = 1.5;
  const STAR_INTERVAL_MAX = 3.0;
  const STAR_SCORE = 100;

  // 星空
  const NUM_BG_STARS = 120;

  // --- DOM ---
  const titleScreen = document.getElementById('title-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');
  const hudScore = document.getElementById('hud-score');
  const hudDist = document.getElementById('hud-dist');
  const resultScoreVal = document.getElementById('result-score-value');
  const resultDistVal = document.getElementById('result-dist-value');
  const resultHighscore = document.getElementById('result-highscore');
  const resultNewRecord = document.getElementById('result-new-record');
  const titleHighscore = document.getElementById('title-highscore');

  const gameCanvas = document.getElementById('game-canvas');
  const ctx = gameCanvas.getContext('2d');
  const previewCanvas = document.getElementById('preview-canvas');
  const pCtx = previewCanvas.getContext('2d');

  // --- Canvas サイズ設定 ---
  gameCanvas.width = CW;
  gameCanvas.height = CH;

  // --- ゲーム状態 ---
  let state = 'title'; // title | playing | gameover
  let currentLane = 1;  // 0=左, 1=中, 2=右
  let targetLane = 1;
  let laneX = 0;        // 現在のキューブの横位置（-1=左, 0=中, 1=右）
  let score = 0;
  let distance = 0;
  let speed = INITIAL_SPEED;
  let obstacles = [];    // { lane, z }
  let stars = [];        // { lane, z }  (collectible stars)
  let bgStars = [];      // background stars
  let nextObstacleIn = 1.0;
  let nextStarIn = 2.0;
  let cubeRotation = 0;
  let lastTime = 0;
  let animFrameId = null;

  // レーン移動アニメーション
  const LANE_MOVE_SPEED = 10; // laneX変化速度/秒

  // 衝突エフェクト
  let hitFlash = 0;

  // --- 背景星の初期化 ---
  function initBgStars() {
    bgStars = [];
    for (let i = 0; i < NUM_BG_STARS; i++) {
      bgStars.push({
        x: Math.random() * CW,
        y: Math.random() * CH * 0.6,
        r: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
      });
    }
  }

  // --- パースペクティブ変換 ---
  // z: 0（手前）～ 1（消失点）
  function perspectiveY(z) {
    return ROAD_BOTTOM_Y + (ROAD_TOP_Y - ROAD_BOTTOM_Y) * z;
  }
  function perspectiveW(z) {
    return ROAD_BOTTOM_W + (ROAD_TOP_W - ROAD_BOTTOM_W) * z;
  }
  function laneXScreen(lane, z) {
    const w = perspectiveW(z);
    const laneW = w / LANE_COUNT;
    const leftEdge = VANISH_X - w / 2;
    return leftEdge + laneW * (lane + 0.5);
  }

  // --- 描画: 背景 ---
  function drawBackground(dt) {
    // 宇宙グラデーション
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, '#05001a');
    grad.addColorStop(0.5, '#0d0221');
    grad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    // 星をキラキラ
    for (const s of bgStars) {
      s.twinkle += s.speed * dt * 3;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  // --- 描画: コース ---
  function drawCourse() {
    // コース本体（暗い色）
    ctx.beginPath();
    const bw = ROAD_BOTTOM_W;
    const tw = ROAD_TOP_W;
    ctx.moveTo(VANISH_X - bw / 2, ROAD_BOTTOM_Y);
    ctx.lineTo(VANISH_X + bw / 2, ROAD_BOTTOM_Y);
    ctx.lineTo(VANISH_X + tw / 2, ROAD_TOP_Y);
    ctx.lineTo(VANISH_X - tw / 2, ROAD_TOP_Y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(10, 5, 30, 0.85)';
    ctx.fill();

    // ネオンライン（左右端）
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff6ec7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(VANISH_X - bw / 2, ROAD_BOTTOM_Y);
    ctx.lineTo(VANISH_X - tw / 2, ROAD_TOP_Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(VANISH_X + bw / 2, ROAD_BOTTOM_Y);
    ctx.lineTo(VANISH_X + tw / 2, ROAD_TOP_Y);
    ctx.stroke();

    // レーン分割線（シアン）
    ctx.strokeStyle = '#00fff7';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00fff7';
    ctx.shadowBlur = 6;
    for (let i = 1; i < LANE_COUNT; i++) {
      const ratio = i / LANE_COUNT;
      const bx = (VANISH_X - bw / 2) + bw * ratio;
      const tx = (VANISH_X - tw / 2) + tw * ratio;
      ctx.beginPath();
      ctx.setLineDash([8, 12]);
      ctx.moveTo(bx, ROAD_BOTTOM_Y);
      ctx.lineTo(tx, ROAD_TOP_Y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // コースの横線（奥行き感）
    for (let z = 0; z < 1; z += 0.1) {
      const y = perspectiveY(z);
      const w = perspectiveW(z);
      ctx.strokeStyle = `rgba(0, 255, 247, ${0.08 * (1 - z)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(VANISH_X - w / 2, y);
      ctx.lineTo(VANISH_X + w / 2, y);
      ctx.stroke();
    }
  }

  // --- 描画: 障害物 ---
  function drawObstacle(lane, z) {
    if (z < 0 || z > 1) return;
    const y = perspectiveY(z);
    const w = perspectiveW(z);
    const laneW = w / LANE_COUNT;
    const leftEdge = VANISH_X - w / 2;
    const x = leftEdge + laneW * lane;
    const scale = 1 - z * 0.7;
    const blockW = laneW * 0.8;
    const blockH = 30 * scale;

    // 赤い壁ブロック
    ctx.fillStyle = '#ff2244';
    ctx.shadowColor = '#ff2244';
    ctx.shadowBlur = 8 * scale;
    ctx.fillRect(x + (laneW - blockW) / 2, y - blockH, blockW, blockH);

    // 上面（明るめ）
    ctx.fillStyle = '#ff6677';
    ctx.fillRect(x + (laneW - blockW) / 2, y - blockH, blockW, blockH * 0.25);

    // 模様
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const stripeW = blockW / 4;
    for (let s = 0; s < 4; s += 2) {
      ctx.fillRect(x + (laneW - blockW) / 2 + stripeW * s, y - blockH, stripeW, blockH);
    }
    ctx.shadowBlur = 0;
  }

  // --- 描画: アイテム（星） ---
  function drawStar(lane, z) {
    if (z < 0 || z > 1) return;
    const y = perspectiveY(z);
    const w = perspectiveW(z);
    const laneW = w / LANE_COUNT;
    const leftEdge = VANISH_X - w / 2;
    const cx = leftEdge + laneW * (lane + 0.5);
    const scale = 1 - z * 0.7;
    const sz = 20 * scale;

    ctx.font = `${Math.max(sz, 8)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // グロウ効果
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12 * scale;
    ctx.fillText('⭐', cx, y - sz * 0.6);
    ctx.shadowBlur = 0;
  }

  // --- 描画: キューブ（アイソメトリック風3面） ---
  function drawCube(screenX, screenY, size, rotation) {
    const s = size;
    const hS = s * 0.5;

    // 3面を描画（上面・左面・右面）
    const topColor = '#6c3cff';
    const leftColor = '#4422aa';
    const rightColor = '#8855dd';

    // 上面
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - s * 0.6);
    ctx.lineTo(screenX + hS, screenY - s * 0.3);
    ctx.lineTo(screenX, screenY);
    ctx.lineTo(screenX - hS, screenY - s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9966ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 左面
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(screenX - hS, screenY - s * 0.3);
    ctx.lineTo(screenX, screenY);
    ctx.lineTo(screenX, screenY + s * 0.3);
    ctx.lineTo(screenX - hS, screenY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6644cc';
    ctx.stroke();

    // 右面
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(screenX + hS, screenY - s * 0.3);
    ctx.lineTo(screenX, screenY);
    ctx.lineTo(screenX, screenY + s * 0.3);
    ctx.lineTo(screenX + hS, screenY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#aa77ee';
    ctx.stroke();

    // 絵文字を各面に描画
    const emojiSize = s * 0.32;
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 回転によって表示する絵文字を変更
    const faceIdx = Math.floor(Math.abs(rotation) % 3);

    // 上面の絵文字
    ctx.fillText(CUBE_FACES[faceIdx], screenX, screenY - s * 0.3);
    // 左面の絵文字
    ctx.fillText(CUBE_FACES[(faceIdx + 1) % 3], screenX - hS * 0.42, screenY - s * 0.08);
    // 右面の絵文字
    ctx.fillText(CUBE_FACES[(faceIdx + 2) % 3], screenX + hS * 0.42, screenY - s * 0.08);
  }

  // --- プレビュー用キューブ描画 ---
  let previewRot = 0;
  let previewAnimId = null;

  function drawPreview() {
    pCtx.clearRect(0, 0, 200, 200);

    // 背景
    const grad = pCtx.createRadialGradient(100, 100, 10, 100, 100, 100);
    grad.addColorStop(0, '#1a0a3e');
    grad.addColorStop(1, '#05001a');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 200, 200);

    // 浮遊アニメーション
    const floatY = Math.sin(previewRot * 0.5) * 8;

    // キューブ描画
    const pS = 80;
    const pX = 100;
    const pY = 105 + floatY;

    // 上面
    pCtx.fillStyle = '#6c3cff';
    pCtx.beginPath();
    pCtx.moveTo(pX, pY - pS * 0.6);
    pCtx.lineTo(pX + pS * 0.5, pY - pS * 0.3);
    pCtx.lineTo(pX, pY);
    pCtx.lineTo(pX - pS * 0.5, pY - pS * 0.3);
    pCtx.closePath();
    pCtx.fill();
    pCtx.strokeStyle = '#9966ff';
    pCtx.lineWidth = 2;
    pCtx.stroke();

    // 左面
    pCtx.fillStyle = '#4422aa';
    pCtx.beginPath();
    pCtx.moveTo(pX - pS * 0.5, pY - pS * 0.3);
    pCtx.lineTo(pX, pY);
    pCtx.lineTo(pX, pY + pS * 0.3);
    pCtx.lineTo(pX - pS * 0.5, pY);
    pCtx.closePath();
    pCtx.fill();
    pCtx.strokeStyle = '#6644cc';
    pCtx.stroke();

    // 右面
    pCtx.fillStyle = '#8855dd';
    pCtx.beginPath();
    pCtx.moveTo(pX + pS * 0.5, pY - pS * 0.3);
    pCtx.lineTo(pX, pY);
    pCtx.lineTo(pX, pY + pS * 0.3);
    pCtx.lineTo(pX + pS * 0.5, pY);
    pCtx.closePath();
    pCtx.fill();
    pCtx.strokeStyle = '#aa77ee';
    pCtx.stroke();

    // 絵文字
    const fIdx = Math.floor(Math.abs(previewRot) % 3);
    const eS = pS * 0.32;
    pCtx.font = `${eS}px sans-serif`;
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillText(CUBE_FACES[fIdx], pX, pY - pS * 0.3);
    pCtx.fillText(CUBE_FACES[(fIdx + 1) % 3], pX - pS * 0.21, pY - pS * 0.08);
    pCtx.fillText(CUBE_FACES[(fIdx + 2) % 3], pX + pS * 0.21, pY - pS * 0.08);

    previewRot += 0.02;
    previewAnimId = requestAnimationFrame(drawPreview);
  }

  // --- ゲーム初期化 ---
  function resetGame() {
    currentLane = 1;
    targetLane = 1;
    laneX = 0;
    score = 0;
    distance = 0;
    speed = INITIAL_SPEED;
    obstacles = [];
    stars = [];
    nextObstacleIn = 1.2;
    nextStarIn = 2.0;
    cubeRotation = 0;
    hitFlash = 0;
    initBgStars();
  }

  // --- 障害物・アイテム生成 ---
  function spawnObstacle() {
    // 1～2レーンを塞ぐ（必ず1レーンは空ける）
    const numBlocked = Math.random() < 0.3 ? 2 : 1;
    const lanes = [0, 1, 2];
    // シャッフル
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    for (let i = 0; i < numBlocked; i++) {
      obstacles.push({ lane: lanes[i], z: 1.05 });
    }
  }

  function spawnStar() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    // 障害物と同じ位置に星を置かない
    const hasObstacle = obstacles.some(o => o.lane === lane && o.z > 0.9);
    if (!hasObstacle) {
      stars.push({ lane, z: 1.05 });
    }
  }

  // --- 衝突判定 ---
  function checkCollision() {
    const cubeZ = 0.12; // キューブのz位置（固定・手前側）
    const hitRange = 0.08;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (Math.abs(o.z - cubeZ) < hitRange && o.lane === currentLane) {
        return true;
      }
    }
    return false;
  }

  // --- 星の取得判定 ---
  function checkStarCollect() {
    const cubeZ = 0.12;
    const hitRange = 0.1;

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      if (Math.abs(s.z - cubeZ) < hitRange && s.lane === currentLane) {
        stars.splice(i, 1);
        score += STAR_SCORE;
        if (GameManager.sound) GameManager.sound.play('point');
        return;
      }
    }
  }

  // --- メインゲームループ ---
  function gameLoop(timestamp) {
    if (state !== 'playing') return;

    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
    lastTime = timestamp;

    // --- 更新 ---
    // 速度アップ
    speed = Math.min(speed + SPEED_INCREASE * dt, MAX_SPEED);

    // 距離
    distance += speed * dt * 0.01;

    // スコア（距離ベース）
    score += Math.floor(speed * dt * 0.1);

    // キューブ回転
    cubeRotation += speed * dt * 0.008;

    // レーン移動（スムーズ）
    const targetX = targetLane - 1; // -1, 0, 1
    if (Math.abs(laneX - targetX) > 0.01) {
      laneX += (targetX - laneX) * Math.min(LANE_MOVE_SPEED * dt, 1);
    } else {
      laneX = targetX;
      currentLane = targetLane;
    }

    // 障害物・アイテム移動
    const moveZ = speed * dt * 0.002;
    for (const o of obstacles) o.z -= moveZ;
    for (const s of stars) s.z -= moveZ;

    // 画面外を削除
    obstacles = obstacles.filter(o => o.z > -0.15);
    stars = stars.filter(s => s.z > -0.15);

    // 生成
    nextObstacleIn -= dt;
    if (nextObstacleIn <= 0) {
      spawnObstacle();
      nextObstacleIn = OBSTACLE_INTERVAL_MIN +
        Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN);
      // スピード上がると間隔短く
      nextObstacleIn *= Math.max(0.5, 1 - (speed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED) * 0.4);
    }

    nextStarIn -= dt;
    if (nextStarIn <= 0) {
      spawnStar();
      nextStarIn = STAR_INTERVAL_MIN +
        Math.random() * (STAR_INTERVAL_MAX - STAR_INTERVAL_MIN);
    }

    // 衝突判定
    checkStarCollect();
    if (checkCollision()) {
      gameOver();
      return;
    }

    // --- 描画 ---
    drawFrame(dt);

    // HUD更新
    hudScore.textContent = score;
    hudDist.textContent = Math.floor(distance) + 'm';

    animFrameId = requestAnimationFrame(gameLoop);
  }

  function drawFrame(dt) {
    drawBackground(dt);
    drawCourse();

    // 障害物を奥から順に描画
    const sortedObs = [...obstacles].sort((a, b) => b.z - a.z);
    for (const o of sortedObs) {
      drawObstacle(o.lane, o.z);
    }

    // 星を奥から順に描画
    const sortedStars = [...stars].sort((a, b) => b.z - a.z);
    for (const s of sortedStars) {
      drawStar(s.lane, s.z);
    }

    // キューブ描画
    const cubeZ = 0.12;
    const cubeScreenY = perspectiveY(cubeZ);
    const roadW = perspectiveW(cubeZ);
    const laneW = roadW / LANE_COUNT;
    const leftEdge = VANISH_X - roadW / 2;
    const cubeScreenX = leftEdge + laneW * ((laneX + 1) + 0.5);
    const scale = 1 - cubeZ * 0.7;

    drawCube(cubeScreenX, cubeScreenY - 10, CUBE_SIZE * scale, cubeRotation);

    // ヒットフラッシュ
    if (hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${hitFlash})`;
      ctx.fillRect(0, 0, CW, CH);
      hitFlash -= dt * 3;
    }
  }

  // --- ゲームオーバー ---
  function gameOver() {
    state = 'gameover';
    hitFlash = 0.6;

    // 最後のフレーム描画（赤フラッシュ付き）
    drawFrame(0);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CW, CH);

    if (GameManager.sound) GameManager.sound.play('hit');

    const finalDist = Math.floor(distance);
    const finalScore = score;

    const result = GameManager.onGameEnd(finalScore);

    // リザルト表示
    setTimeout(() => {
      showScreen('result');

      resultScoreVal.textContent = finalScore;
      resultDistVal.textContent = finalDist + 'm';

      // ハイスコア表示
      const hs = GameManager.getHighScore();
      if (hs) {
        resultHighscore.innerHTML = `<span class="sg-highscore-badge">${hs}</span>`;
      }

      if (result && result.isNewHigh) {
        resultNewRecord.textContent = t('newRecord');
        resultNewRecord.classList.remove('hidden');
        resultNewRecord.className = 'sg-new-record';
      } else {
        resultNewRecord.classList.add('hidden');
      }
    }, 800);
  }

  // --- 画面切り替え ---
  function showScreen(name) {
    titleScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');

    if (name === 'title') titleScreen.classList.add('active');
    else if (name === 'game') gameScreen.classList.add('active');
    else if (name === 'result') resultScreen.classList.add('active');
  }

  // --- ゲーム開始 ---
  function startGame() {
    resetGame();
    showScreen('game');
    state = 'playing';
    lastTime = 0;
    GameManager.onGameStart();
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // --- 入力ハンドラ ---
  // キーボード
  document.addEventListener('keydown', (e) => {
    if (state !== 'playing') return;
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      if (targetLane > 0) {
        targetLane--;
        if (GameManager.sound) GameManager.sound.play('move');
      }
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      if (targetLane < LANE_COUNT - 1) {
        targetLane++;
        if (GameManager.sound) GameManager.sound.play('move');
      }
    }
  });

  // タッチ（スワイプ）
  let touchStartX = 0;
  let touchStartY = 0;
  let touchHandled = false;

  gameCanvas.addEventListener('touchstart', (e) => {
    if (state !== 'playing') return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchHandled = false;
    e.preventDefault();
  }, { passive: false });

  gameCanvas.addEventListener('touchmove', (e) => {
    if (state !== 'playing' || touchHandled) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      touchHandled = true;
      if (dx < 0 && targetLane > 0) {
        targetLane--;
        if (GameManager.sound) GameManager.sound.play('move');
      } else if (dx > 0 && targetLane < LANE_COUNT - 1) {
        targetLane++;
        if (GameManager.sound) GameManager.sound.play('move');
      }
    }
    e.preventDefault();
  }, { passive: false });

  // タップでもレーン移動（画面左半分=左、右半分=右）
  gameCanvas.addEventListener('click', (e) => {
    if (state !== 'playing') return;
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const mid = rect.width / 2;

    if (x < mid && targetLane > 0) {
      targetLane--;
      if (GameManager.sound) GameManager.sound.play('move');
    } else if (x >= mid && targetLane < LANE_COUNT - 1) {
      targetLane++;
      if (GameManager.sound) GameManager.sound.play('move');
    }
  });

  // --- ボタンイベント ---
  startBtn.addEventListener('click', () => {
    if (previewAnimId) {
      cancelAnimationFrame(previewAnimId);
      previewAnimId = null;
    }
    startGame();
  });

  retryBtn.addEventListener('click', () => {
    startGame();
  });

  // --- タイトルハイスコア表示 ---
  function showTitleHighscore() {
    const hs = GameManager.getHighScore();
    if (hs) {
      titleHighscore.innerHTML = `<span class="sg-highscore-badge">${hs}</span>`;
    }
  }

  // --- 初期化 ---
  initBgStars();
  updateI18nTexts();
  showTitleHighscore();
  drawPreview();

})();
