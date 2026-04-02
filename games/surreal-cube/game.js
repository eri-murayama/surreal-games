// ========================================
// シュールキューブ - 3D回転パズルゲーム
// ========================================

(function () {
  'use strict';

  // --- i18n ---
  const TRANSLATIONS = {
    ja: {
      title: 'シュールキューブ',
      subtitle: '3D回転パズル！指定の面を手前に向けろ！',
      start: 'スタート',
      stageSelect: 'ステージ選択',
      backToTitle: 'タイトルに戻る',
      backToStages: 'ステージ選択に戻る',
      stageLabel: 'ステージ',
      scoreLabel: 'スコア',
      turnFront: 'を手前に！',
      hint: 'ドラッグでキューブを回転',
      stageClear: 'ステージクリア！',
      timeBonus: 'タイムボーナス',
      totalScore: '合計',
      nextStage: '次のステージへ',
      timeUp: 'タイムアップ！',
      cleared: 'クリア数',
      retry: 'もう一回',
      allClear: '全ステージクリア！',
      finalScore: '最終スコア',
      correct: '正解！',
      stage1: 'はじめてのキューブ',
      stage2: 'スピードキューブ',
      stage3: 'カラフルキューブ',
      stage4: 'ミラーキューブ',
      stage5: 'カオスキューブ',
      stage1desc: '基本操作を覚えよう（60秒・5問）',
      stage2desc: '素早く回せ！（45秒・8問）',
      stage3desc: '面の色が毎問変わる（50秒・8問）',
      stage4desc: '回転方向が反転！（45秒・10問）',
      stage5desc: '反転＋キューブが揺れる（40秒・12問）',
      locked: 'ロック',
      shareText: (score) =>
        `シュールキューブで ${score} 点取った！3D回転パズルに挑戦！ #シュールゲームス`,
    },
    en: {
      title: 'Surreal Cube',
      subtitle: '3D rotation puzzle! Turn the right face forward!',
      start: 'Start',
      stageSelect: 'Select Stage',
      backToTitle: 'Back to Title',
      backToStages: 'Back to Stages',
      stageLabel: 'Stage',
      scoreLabel: 'Score',
      turnFront: ' forward!',
      hint: 'Drag to rotate the cube',
      stageClear: 'Stage Clear!',
      timeBonus: 'Time Bonus',
      totalScore: 'Total',
      nextStage: 'Next Stage',
      timeUp: 'Time Up!',
      cleared: 'Cleared',
      retry: 'Play Again',
      allClear: 'All Stages Clear!',
      finalScore: 'Final Score',
      correct: 'Correct!',
      stage1: 'First Cube',
      stage2: 'Speed Cube',
      stage3: 'Colorful Cube',
      stage4: 'Mirror Cube',
      stage5: 'Chaos Cube',
      stage1desc: 'Learn the basics (60s, 5 questions)',
      stage2desc: 'Spin fast! (45s, 8 questions)',
      stage3desc: 'Colors change each round (50s, 8 questions)',
      stage4desc: 'Rotation is reversed! (45s, 10 questions)',
      stage5desc: 'Reversed + cube shakes (40s, 12 questions)',
      locked: 'Locked',
      shareText: (score) =>
        `I scored ${score} pts in Surreal Cube! 3D rotation puzzle challenge! #SurrealGames`,
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

  // --- ステージ定義 ---
  const STAGES = [
    { id: 1, nameKey: 'stage1', descKey: 'stage1desc', time: 60, quests: 5, mirror: false, shake: false, colorChange: false },
    { id: 2, nameKey: 'stage2', descKey: 'stage2desc', time: 45, quests: 8, mirror: false, shake: false, colorChange: false },
    { id: 3, nameKey: 'stage3', descKey: 'stage3desc', time: 50, quests: 8, mirror: false, shake: false, colorChange: true },
    { id: 4, nameKey: 'stage4', descKey: 'stage4desc', time: 45, quests: 10, mirror: true, shake: false, colorChange: false },
    { id: 5, nameKey: 'stage5', descKey: 'stage5desc', time: 40, quests: 12, mirror: true, shake: true, colorChange: false },
  ];

  // --- キューブの6面定義 ---
  const DEFAULT_FACES = [
    { emoji: '\uD83D\uDCA9', color: '#ff6ec7' }, // 前 💩 ピンク
    { emoji: '\uD83E\uDD80', color: '#ff4444' }, // 後 🦀 赤
    { emoji: '\uD83D\uDC23', color: '#ffff00' }, // 上 🐣 黄
    { emoji: '\uD83E\uDDEC', color: '#39ff14' }, // 下 🧬 緑
    { emoji: '\uD83D\uDD2E', color: '#a855f7' }, // 左 🔮 紫
    { emoji: '\uD83C\uDFB2', color: '#00fff7' }, // 右 🎲 シアン
  ];

  // カラフルステージ用の色セット
  const COLOR_SETS = [
    ['#ff6ec7', '#ff4444', '#ffff00', '#39ff14', '#a855f7', '#00fff7'],
    ['#ff9900', '#ff0066', '#00ff88', '#4488ff', '#ffcc00', '#cc44ff'],
    ['#00ffcc', '#ff3366', '#66ff33', '#ff6600', '#3366ff', '#ff33cc'],
    ['#ffdd00', '#dd00ff', '#00ddff', '#ff0044', '#44ff00', '#0044ff'],
  ];

  // --- 定数 ---
  const CW = 400;
  const CH = 500;
  const CUBE_HALF = 100; // キューブの半分のサイズ
  const FOV = 500; // 透視投影の焦点距離
  const CORRECT_THRESHOLD = 0.6; // 面が手前を向いている判定閾値（法線Z成分）
  const FRICTION = 0.92; // 慣性の摩擦
  const ROTATE_SPEED = 0.008; // ドラッグ感度
  const KEY_ROTATE_SPEED = 0.06; // キーボード回転速度

  // --- DOM ---
  const titleScreen = document.getElementById('title-screen');
  const stageSelectScreen = document.getElementById('stage-select-screen');
  const gameScreen = document.getElementById('game-screen');
  const clearScreen = document.getElementById('clear-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const resultScreen = document.getElementById('result-screen');

  const startBtn = document.getElementById('start-btn');
  const stageBackBtn = document.getElementById('stage-back-btn');
  const nextStageBtn = document.getElementById('next-stage-btn');
  const clearBackBtn = document.getElementById('clear-back-btn');
  const goRetryBtn = document.getElementById('go-retry-btn');
  const goBackBtn = document.getElementById('go-back-btn');
  const resultBackBtn = document.getElementById('result-back-btn');

  const stageListEl = document.getElementById('stage-list');
  const hudStage = document.getElementById('hud-stage');
  const hudQuestEmoji = document.getElementById('hud-quest-emoji');
  const hudCleared = document.getElementById('hud-cleared');
  const hudTotal = document.getElementById('hud-total');
  const hudTimerFill = document.getElementById('hud-timer-fill');
  const hudScore = document.getElementById('hud-score');

  const clearScoreEl = document.getElementById('clear-score');
  const clearBonusEl = document.getElementById('clear-bonus');
  const clearTotalEl = document.getElementById('clear-total');
  const goCleared = document.getElementById('go-cleared');
  const goScore = document.getElementById('go-score');
  const resultScoreVal = document.getElementById('result-score-value');
  const resultHighscore = document.getElementById('result-highscore');
  const resultNewRecord = document.getElementById('result-new-record');
  const titleHighscore = document.getElementById('title-highscore');

  const gameCanvas = document.getElementById('game-canvas');
  const ctx = gameCanvas.getContext('2d');
  const previewCanvas = document.getElementById('preview-canvas');
  const pCtx = previewCanvas.getContext('2d');

  // --- ゲーム状態 ---
  let state = 'title';
  let currentStageIdx = 0;
  let questIdx = 0;
  let targetFace = 0;
  let score = 0;
  let totalScore = 0;
  let timeLeft = 0;
  let stageTimeLimit = 0;
  let lastTime = 0;
  let animFrameId = null;

  // 回転状態
  let rotX = 0.3; // X軸回転
  let rotY = 0.3; // Y軸回転
  let velX = 0;   // 回転速度
  let velY = 0;

  // ドラッグ
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastDragX = 0;
  let lastDragY = 0;

  // 演出
  let correctFlash = 0;
  let wrongFlash = 0;
  let correctParticles = [];
  let bgParticles = [];
  let shakeOffset = { x: 0, y: 0 };

  // 面データ（ステージによって色が変わる場合あり）
  let faces = DEFAULT_FACES.map(f => ({ ...f }));

  // 進行度管理
  let progress = loadProgress();

  // ===== 進行度の保存・読み込み =====
  function loadProgress() {
    try {
      const d = JSON.parse(localStorage.getItem('surreal-cube-progress'));
      if (d && Array.isArray(d.cleared)) return d;
    } catch (e) { /* ignore */ }
    return { cleared: [], bestScores: {} };
  }
  function saveProgress() {
    try {
      localStorage.setItem('surreal-cube-progress', JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  // ===== 3D数学 =====

  // キューブの8頂点
  function getCubeVertices(half) {
    const h = half;
    return [
      [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h], // 後面
      [-h, -h, h],  [h, -h, h],  [h, h, h],  [-h, h, h],   // 前面
    ];
  }

  // 6面の定義（頂点インデックス、法線方向）
  const FACE_DEFS = [
    { verts: [4, 5, 6, 7], normal: [0, 0, 1] },   // 面0: 前 (z+)
    { verts: [1, 0, 3, 2], normal: [0, 0, -1] },   // 面1: 後 (z-)
    { verts: [4, 5, 1, 0], normal: [0, -1, 0] },   // 面2: 上 (y-)
    { verts: [7, 6, 2, 3], normal: [0, 1, 0] },     // 面3: 下 (y+)
    { verts: [0, 3, 7, 4], normal: [-1, 0, 0] },   // 面4: 左 (x-)
    { verts: [5, 6, 2, 1], normal: [1, 0, 0] },     // 面5: 右 (x+)
  ];

  // 回転行列の適用（X軸 → Y軸の順）
  function rotatePoint(p, rx, ry) {
    let [x, y, z] = p;

    // X軸回転
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    y = y1; z = z1;

    // Y軸回転
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = x * cosY + z * sinY;
    const z2 = -x * sinY + z * cosY;
    x = x1; z = z2;

    return [x, y, z];
  }

  // 法線ベクトルを回転
  function rotateNormal(n, rx, ry) {
    return rotatePoint(n, rx, ry);
  }

  // 透視投影
  function project(point3d, cx, cy) {
    const [x, y, z] = point3d;
    const scale = FOV / (FOV + z);
    return {
      x: cx + x * scale,
      y: cy + y * scale,
      scale: scale,
    };
  }

  // 面の中心Z値（ソート用）
  function faceDepth(verts3d, indices) {
    let sumZ = 0;
    for (const i of indices) sumZ += verts3d[i][2];
    return sumZ / indices.length;
  }

  // ===== 背景パーティクル =====
  function initBgParticles() {
    bgParticles = [];
    for (let i = 0; i < 80; i++) {
      bgParticles.push({
        x: Math.random() * CW,
        y: Math.random() * CH,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 1,
      });
    }
  }

  function updateBgParticles(dt) {
    for (const p of bgParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += p.speed * dt;
      if (p.x < 0) p.x = CW;
      if (p.x > CW) p.x = 0;
      if (p.y < 0) p.y = CH;
      if (p.y > CH) p.y = 0;
    }
  }

  function drawBgParticles() {
    for (const p of bgParticles) {
      const alpha = 0.3 + Math.sin(p.twinkle) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  // ===== 正解パーティクル =====
  function spawnCorrectParticles() {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      correctParticles.push({
        x: CW / 2,
        y: CH / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: ['#ff6ec7', '#00fff7', '#ffff00', '#39ff14', '#a855f7'][Math.floor(Math.random() * 5)],
        size: Math.random() * 4 + 2,
      });
    }
  }

  function updateCorrectParticles(dt) {
    for (let i = correctParticles.length - 1; i >= 0; i--) {
      const p = correctParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 3 * dt; // 重力
      p.life -= dt * 1.5;
      if (p.life <= 0) correctParticles.splice(i, 1);
    }
  }

  function drawCorrectParticles() {
    for (const p of correctParticles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ===== キューブ描画 =====
  function drawCube(context, cx, cy, half, rx, ry, facesData, shakeX, shakeY) {
    const vertices = getCubeVertices(half);

    // 全頂点を回転
    const rotated = vertices.map(v => rotatePoint(v, rx, ry));

    // 全頂点を投影
    const projected = rotated.map(v => project(v, cx + shakeX, cy + shakeY));

    // 面をzソート（奥から描画）
    const faceOrder = FACE_DEFS.map((fd, idx) => ({
      idx,
      depth: faceDepth(rotated, fd.verts),
    }));
    faceOrder.sort((a, b) => a.depth - b.depth); // 奥（z小）が先

    // 影の描画
    context.save();
    context.beginPath();
    context.ellipse(cx + shakeX, cy + half * 1.3 + shakeY, half * 0.7, half * 0.15, 0, 0, Math.PI * 2);
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fill();
    context.restore();

    for (const fo of faceOrder) {
      const fd = FACE_DEFS[fo.idx];
      const faceData = facesData[fo.idx];

      // 法線のz成分で表裏判定（裏面は描画しない）
      const rn = rotateNormal(fd.normal, rx, ry);
      if (rn[2] < 0) continue; // 裏を向いている面はスキップ

      // 面の4頂点を投影した座標で描画
      const pts = fd.verts.map(vi => projected[vi]);

      // 面の塗りつぶし
      context.beginPath();
      context.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 4; i++) {
        context.lineTo(pts[i].x, pts[i].y);
      }
      context.closePath();

      // 照明効果（法線のz成分で明るさ調整）
      const brightness = 0.5 + rn[2] * 0.5;
      const baseColor = faceData.color;
      context.fillStyle = adjustBrightness(baseColor, brightness);
      context.fill();

      // 枠線
      context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      context.lineWidth = 2;
      context.stroke();

      // 絵文字を面の中心に描画
      const centerX = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
      const centerY = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;
      const avgScale = (pts[0].scale + pts[1].scale + pts[2].scale + pts[3].scale) / 4;
      const emojiSize = half * 0.8 * avgScale;

      context.font = `${Math.max(emojiSize, 10)}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(faceData.emoji, centerX, centerY);
    }
  }

  // 色の明るさ調整
  function adjustBrightness(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.min(255, Math.floor(r * factor));
    const ng = Math.min(255, Math.floor(g * factor));
    const nb = Math.min(255, Math.floor(b * factor));
    return `rgb(${nr},${ng},${nb})`;
  }

  // ===== 正解判定 =====
  function getFrontFace(rx, ry) {
    let maxZ = -Infinity;
    let frontIdx = 0;
    for (let i = 0; i < FACE_DEFS.length; i++) {
      const rn = rotateNormal(FACE_DEFS[i].normal, rx, ry);
      if (rn[2] > maxZ) {
        maxZ = rn[2];
        frontIdx = i;
      }
    }
    return { index: frontIdx, normalZ: maxZ };
  }

  function checkCorrect() {
    const front = getFrontFace(rotX, rotY);
    return front.index === targetFace && front.normalZ > CORRECT_THRESHOLD;
  }

  // ===== ステージ管理 =====
  function isStageUnlocked(idx) {
    if (idx === 0) return true;
    return progress.cleared.includes(STAGES[idx - 1].id);
  }

  function randomizeFaceColors() {
    const colorSet = COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)];
    faces = DEFAULT_FACES.map((f, i) => ({
      emoji: f.emoji,
      color: colorSet[i],
    }));
  }

  function resetFaces() {
    faces = DEFAULT_FACES.map(f => ({ ...f }));
  }

  function pickNewQuest() {
    // ランダムに面を選択（前回と違う面）
    let newTarget;
    do {
      newTarget = Math.floor(Math.random() * 6);
    } while (newTarget === targetFace && questIdx > 0);
    targetFace = newTarget;

    // カラフルステージなら毎問色を変える
    if (STAGES[currentStageIdx].colorChange) {
      randomizeFaceColors();
    }

    // キューブをランダム方向に回転させる
    rotX = Math.random() * Math.PI * 2;
    rotY = Math.random() * Math.PI * 2;
    velX = 0;
    velY = 0;

    // ターゲット面が最初から正面を向かないようにする
    let attempts = 0;
    while (checkCorrect() && attempts < 20) {
      rotX += 0.5;
      rotY += 0.3;
      attempts++;
    }

    updateQuestHUD();
  }

  function updateQuestHUD() {
    hudQuestEmoji.textContent = faces[targetFace].emoji;
    hudCleared.textContent = questIdx;
    hudTotal.textContent = STAGES[currentStageIdx].quests;
  }

  // ===== 画面管理 =====
  function showScreen(name) {
    titleScreen.classList.remove('active');
    stageSelectScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    clearScreen.classList.remove('active');
    gameoverScreen.classList.remove('active');
    resultScreen.classList.remove('active');

    const screens = {
      title: titleScreen,
      stageSelect: stageSelectScreen,
      game: gameScreen,
      clear: clearScreen,
      gameover: gameoverScreen,
      result: resultScreen,
    };
    if (screens[name]) screens[name].classList.add('active');
  }

  // ===== ステージ選択画面の構築 =====
  function buildStageList() {
    stageListEl.innerHTML = '';
    STAGES.forEach((stg, idx) => {
      const btn = document.createElement('button');
      btn.className = 'stage-btn';

      const unlocked = isStageUnlocked(idx);
      const cleared = progress.cleared.includes(stg.id);

      if (!unlocked) btn.classList.add('locked');
      if (cleared) btn.classList.add('cleared');

      btn.innerHTML = `
        <span class="stage-num">${stg.id}</span>
        <span class="stage-info">
          <span class="stage-name">${t(stg.nameKey)}</span>
          <span class="stage-desc">${unlocked ? t(stg.descKey) : t('locked')}</span>
        </span>
        <span class="stage-star">${cleared ? '\u2B50' : (unlocked ? '' : '\uD83D\uDD12')}</span>
      `;

      if (unlocked) {
        btn.addEventListener('click', () => startStage(idx));
      }

      stageListEl.appendChild(btn);
    });
  }

  // ===== ゲーム開始 =====
  function startStage(stageIdx) {
    currentStageIdx = stageIdx;
    const stg = STAGES[stageIdx];

    questIdx = 0;
    score = 0;
    timeLeft = stg.time;
    stageTimeLimit = stg.time;
    correctFlash = 0;
    wrongFlash = 0;
    correctParticles = [];
    shakeOffset = { x: 0, y: 0 };

    if (stg.colorChange) {
      randomizeFaceColors();
    } else {
      resetFaces();
    }

    hudStage.textContent = stg.id;

    pickNewQuest();
    initBgParticles();

    showScreen('game');
    state = 'playing';
    lastTime = 0;
    GameManager.onGameStart();

    if (window.SurrealGames && window.SurrealGames.SoundSystem) {
      window.SurrealGames.SoundSystem.playBgm('cosmic');
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ===== メインゲームループ =====
  function gameLoop(timestamp) {
    if (state !== 'playing') return;

    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
    lastTime = timestamp;

    // タイマー更新
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      gameOver();
      return;
    }

    // タイマーバー更新
    const ratio = timeLeft / stageTimeLimit;
    hudTimerFill.style.width = (ratio * 100) + '%';
    if (ratio < 0.25) {
      hudTimerFill.classList.add('danger');
    } else {
      hudTimerFill.classList.remove('danger');
    }

    // 慣性回転
    if (!dragging) {
      rotX += velX;
      rotY += velY;
      velX *= FRICTION;
      velY *= FRICTION;
    }

    // 揺れ効果
    const stg = STAGES[currentStageIdx];
    if (stg.shake) {
      shakeOffset.x = Math.sin(timestamp * 0.005) * 3;
      shakeOffset.y = Math.cos(timestamp * 0.007) * 2;
    } else {
      shakeOffset.x = 0;
      shakeOffset.y = 0;
    }

    // 正解チェック（ドラッグ中でないとき、速度が十分遅いとき）
    if (!dragging && Math.abs(velX) < 0.01 && Math.abs(velY) < 0.01) {
      if (checkCorrect()) {
        onCorrect();
        return;
      }
    }

    // 演出更新
    if (correctFlash > 0) correctFlash -= dt * 3;
    if (wrongFlash > 0) wrongFlash -= dt * 3;
    updateBgParticles(dt);
    updateCorrectParticles(dt);

    // 描画
    drawFrame();

    // スコア表示
    hudScore.textContent = score;

    animFrameId = requestAnimationFrame(gameLoop);
  }

  function drawFrame() {
    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, '#05001a');
    grad.addColorStop(0.5, '#0d0221');
    grad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    // 背景パーティクル
    drawBgParticles();

    // キューブ描画
    drawCube(ctx, CW / 2, CH / 2, CUBE_HALF, rotX, rotY, faces, shakeOffset.x, shakeOffset.y);

    // 正解パーティクル
    drawCorrectParticles();

    // 正解フラッシュ
    if (correctFlash > 0) {
      ctx.fillStyle = `rgba(57, 255, 20, ${correctFlash * 0.3})`;
      ctx.fillRect(0, 0, CW, CH);

      // 「正解！」テキスト
      ctx.save();
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(correctFlash * 2, 1)})`;
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 20;
      ctx.fillText(t('correct'), CW / 2, CH / 2 - CUBE_HALF - 40);
      ctx.restore();
    }

    // 不正解フラッシュ（時間切れ）
    if (wrongFlash > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${wrongFlash * 0.3})`;
      ctx.fillRect(0, 0, CW, CH);
    }
  }

  // ===== 正解時 =====
  function onCorrect() {
    questIdx++;
    const timeBonus = Math.floor(timeLeft * 10);
    score += 100 + timeBonus;

    correctFlash = 1;
    spawnCorrectParticles();

    if (GameManager.sound) GameManager.sound.play('correct');

    hudCleared.textContent = questIdx;
    hudScore.textContent = score;

    const stg = STAGES[currentStageIdx];

    if (questIdx >= stg.quests) {
      // ステージクリア
      setTimeout(() => stageClear(), 600);
    } else {
      // 次のお題
      setTimeout(() => {
        if (state === 'playing') {
          pickNewQuest();
        }
      }, 500);
    }

    // 正解中はループ継続
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ===== ステージクリア =====
  function stageClear() {
    state = 'stageClear';
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const stg = STAGES[currentStageIdx];
    const timeBonus = Math.floor(timeLeft * 20);
    const stageScore = score;
    const total = stageScore + timeBonus;
    totalScore += total;

    // 進行度を保存
    if (!progress.cleared.includes(stg.id)) {
      progress.cleared.push(stg.id);
    }
    if (!progress.bestScores[stg.id] || progress.bestScores[stg.id] < total) {
      progress.bestScores[stg.id] = total;
    }
    saveProgress();

    clearScoreEl.textContent = stageScore;
    clearBonusEl.textContent = timeBonus;
    clearTotalEl.textContent = total;

    // 最終ステージかどうか
    if (currentStageIdx >= STAGES.length - 1) {
      nextStageBtn.style.display = 'none';
    } else {
      nextStageBtn.style.display = '';
    }

    showScreen('clear');
  }

  // ===== ゲームオーバー =====
  function gameOver() {
    state = 'gameover';
    if (animFrameId) cancelAnimationFrame(animFrameId);

    wrongFlash = 1;
    drawFrame();

    if (GameManager.sound) GameManager.sound.play('wrong');

    goCleared.textContent = questIdx + '/' + STAGES[currentStageIdx].quests;
    goScore.textContent = score;

    setTimeout(() => showScreen('gameover'), 600);
  }

  // ===== 全クリアリザルト =====
  function showFinalResult() {
    const result = GameManager.onGameEnd(totalScore);

    resultScoreVal.textContent = totalScore;

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

    showScreen('result');
  }

  // ===== 入力ハンドラ =====

  // マウスドラッグ
  gameCanvas.addEventListener('mousedown', (e) => {
    if (state !== 'playing') return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    velX = 0;
    velY = 0;
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging || state !== 'playing') return;
    const stg = STAGES[currentStageIdx];
    const mirrorMult = stg.mirror ? -1 : 1;
    const dx = e.clientX - lastDragX;
    const dy = e.clientY - lastDragY;
    rotY += dx * ROTATE_SPEED * mirrorMult;
    rotX += dy * ROTATE_SPEED * mirrorMult;
    velY = dx * ROTATE_SPEED * mirrorMult;
    velX = dy * ROTATE_SPEED * mirrorMult;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  // タッチドラッグ
  gameCanvas.addEventListener('touchstart', (e) => {
    if (state !== 'playing') return;
    const touch = e.touches[0];
    dragging = true;
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    lastDragX = touch.clientX;
    lastDragY = touch.clientY;
    velX = 0;
    velY = 0;
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!dragging || state !== 'playing') return;
    const touch = e.touches[0];
    const stg = STAGES[currentStageIdx];
    const mirrorMult = stg.mirror ? -1 : 1;
    const dx = touch.clientX - lastDragX;
    const dy = touch.clientY - lastDragY;
    rotY += dx * ROTATE_SPEED * mirrorMult;
    rotX += dy * ROTATE_SPEED * mirrorMult;
    velY = dx * ROTATE_SPEED * mirrorMult;
    velX = dy * ROTATE_SPEED * mirrorMult;
    lastDragX = touch.clientX;
    lastDragY = touch.clientY;
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    dragging = false;
  });

  // キーボード
  const keysDown = {};
  document.addEventListener('keydown', (e) => {
    if (state !== 'playing') return;
    keysDown[e.key] = true;
    const stg = STAGES[currentStageIdx];
    const mirrorMult = stg.mirror ? -1 : 1;
    if (e.key === 'ArrowLeft') {
      velY = -KEY_ROTATE_SPEED * mirrorMult;
    } else if (e.key === 'ArrowRight') {
      velY = KEY_ROTATE_SPEED * mirrorMult;
    } else if (e.key === 'ArrowUp') {
      velX = -KEY_ROTATE_SPEED * mirrorMult;
    } else if (e.key === 'ArrowDown') {
      velX = KEY_ROTATE_SPEED * mirrorMult;
    }
  });
  document.addEventListener('keyup', (e) => {
    keysDown[e.key] = false;
  });

  // ===== ボタンイベント =====
  startBtn.addEventListener('click', () => {
    if (previewAnimId) {
      cancelAnimationFrame(previewAnimId);
      previewAnimId = null;
    }
    buildStageList();
    showScreen('stageSelect');
  });

  stageBackBtn.addEventListener('click', () => {
    showScreen('title');
    drawPreview();
  });

  nextStageBtn.addEventListener('click', () => {
    if (currentStageIdx < STAGES.length - 1) {
      startStage(currentStageIdx + 1);
    } else {
      showFinalResult();
    }
  });

  clearBackBtn.addEventListener('click', () => {
    buildStageList();
    showScreen('stageSelect');
  });

  goRetryBtn.addEventListener('click', () => {
    startStage(currentStageIdx);
  });

  goBackBtn.addEventListener('click', () => {
    buildStageList();
    showScreen('stageSelect');
  });

  resultBackBtn.addEventListener('click', () => {
    showScreen('title');
    totalScore = 0;
    drawPreview();
  });

  // ===== プレビューキューブ =====
  let previewRot = 0;
  let previewAnimId = null;

  function drawPreview() {
    pCtx.clearRect(0, 0, 200, 200);

    const grad = pCtx.createRadialGradient(100, 100, 10, 100, 100, 100);
    grad.addColorStop(0, '#1a0a3e');
    grad.addColorStop(1, '#05001a');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 200, 200);

    const floatY = Math.sin(previewRot * 0.8) * 5;
    drawCube(pCtx, 100, 100 + floatY, 50, previewRot * 0.3, previewRot * 0.5, DEFAULT_FACES, 0, 0);

    previewRot += 0.03;
    previewAnimId = requestAnimationFrame(drawPreview);
  }

  // ===== タイトルハイスコア表示 =====
  function showTitleHighscore() {
    const hs = GameManager.getHighScore();
    if (hs) {
      titleHighscore.innerHTML = `<span class="sg-highscore-badge">${hs}</span>`;
    }
  }

  // ===== 初期化 =====
  initBgParticles();
  updateI18nTexts();
  showTitleHighscore();
  drawPreview();

})();
