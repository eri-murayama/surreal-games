/* ===== 協力者 - game.js ===== */

(function () {
  'use strict';

  // ===== 定数 =====
  const TOTAL_ROUNDS = 5;
  const CUP_COUNT = 3;
  const CANVAS_W = 440;
  const CANVAS_H = 380;
  const COIN_RADIUS = 14;

  // ラウンドごとの設定
  const ROUND_CONFIG = [
    { shuffles: 3, speed: 900, pathWidth: 50, curves: 2 },
    { shuffles: 4, speed: 800, pathWidth: 44, curves: 3 },
    { shuffles: 5, speed: 700, pathWidth: 38, curves: 3 },
    { shuffles: 6, speed: 650, pathWidth: 32, curves: 4 },
    { shuffles: 7, speed: 600, pathWidth: 28, curves: 4 },
  ];

  // 穴の位置（キャンバス座標）
  const HOLE_POSITIONS = [
    { x: 80, y: 40 },
    { x: 220, y: 40 },
    { x: 360, y: 40 },
  ];
  const HOLE_RADIUS = 28;

  // ===== ゲーム状態 =====
  let currentRound = 0;
  let score = 0;
  let coinPosition = 0;
  let targetHole = 0;

  // イライラ棒の状態
  let mazeActive = false;
  let coinX = 0;
  let coinY = 0;
  let pathPoints = [];   // 通路の中心線
  let pathWidth = 50;    // 通路の幅
  let isOnPath = false;  // コインが通路上にあるか
  let hasStarted = false; // ドラッグ開始済みか
  let animFrameId = null;

  // ===== DOM =====
  const overlay = document.getElementById('overlay');
  const startScreen = document.getElementById('start-screen');
  const resultScreen = document.getElementById('result-screen');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');

  const phaseTable = document.getElementById('phase-table');
  const phaseUnder = document.getElementById('phase-under');
  const phaseResult = document.getElementById('phase-result');

  const speechText = document.getElementById('speech-text');
  const cupsArea = document.getElementById('cups-area');
  const tapInstruction = document.getElementById('tap-instruction');
  const roundIndicator = document.getElementById('round-indicator');
  const roundText = document.getElementById('round-text');

  const mazeContainer = document.getElementById('maze-container');
  const canvas = document.getElementById('maze-canvas');
  const ctx = canvas.getContext('2d');
  const instructionDetail = document.getElementById('instruction-detail');

  // ===== 共通モジュール =====
  const sg = SurrealGames.init('magic-trick');

  // ===== 多言語対応 =====
  let currentLang = (function() {
    try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
    return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
  })();

  const LANG = {
    ja: {
      putCoin: 'このコップにコインを入れるよ…',
      watchCarefully: 'よく見ててね…',
      shuffleStart: 'シャッフル開始！',
      whereIsCoin: 'さて、コインはどこかな？',
      correctGuess: 'よく見てたね！…でも本番はここからだ',
      wrongGuess: 'あれ？まあいいか。本番はここからだ',
      cupNames: ['左', '真ん中', '右'],
      mazeInstruction: (from, to) => from + 'の穴から' + to + 'の穴へ！壁に触れるな！',
      mazeDrag: '壁に触れずにGOALまで運べ！',
      mazeFail: 'バレた！イカサマ失敗…！',
      mazeSuccess: 'イカサマ成功！マジック大成功！',
      perfectHelper: '完璧な協力者',
      perfectComment: '全てのイカサマを成功させた！マジシャンは大スター確定！',
      okHelper: 'まあまあの協力者',
      okComment: 'そこそこ手伝えたね。マジシャンの評判はギリギリセーフ。',
      badHelper: 'へっぽこ協力者',
      badComment: 'イカサマがバレそうだったよ…もうちょっと頑張ろう。',
      firedHelper: 'クビ',
      firedComment: '全然手伝えなかった。マジシャンに解雇されました。',
    },
    en: {
      putCoin: "I'm putting a coin under this cup...",
      watchCarefully: 'Watch closely...',
      shuffleStart: 'Shuffling!',
      whereIsCoin: 'So, where is the coin?',
      correctGuess: "Good eye! ...But the real challenge starts now",
      wrongGuess: "Oops? Oh well. The real challenge starts now",
      cupNames: ['Left', 'Center', 'Right'],
      mazeInstruction: (from, to) => 'From the ' + from + ' hole to the ' + to + ' hole! Don\'t touch the walls!',
      mazeDrag: 'Guide it to GOAL without touching the walls!',
      mazeFail: 'Busted! Cheating failed...!',
      mazeSuccess: 'Cheating success! Magic trick nailed!',
      perfectHelper: 'Perfect Accomplice',
      perfectComment: 'All tricks succeeded! The magician is now a superstar!',
      okHelper: 'Decent Accomplice',
      okComment: "You helped out okay. The magician's reputation is barely safe.",
      badHelper: 'Clumsy Accomplice',
      badComment: 'The cheating was almost caught... Try harder next time.',
      firedHelper: 'Fired',
      firedComment: "Couldn't help at all. The magician fired you.",
    },
  };

  function tl(key, ...args) {
    const val = LANG[currentLang][key];
    if (typeof val === 'function') return val(...args);
    return val;
  }

  window.addEventListener('surreal-lang-change', function(e) {
    if (e.detail && e.detail.lang) currentLang = e.detail.lang;
  });

  // ===== 初期化 =====
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);

  function startGame() {
    sg.onGameStart();
    currentRound = 0;
    score = 0;
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    overlay.classList.add('hidden');
    roundIndicator.classList.remove('hidden');
    showPhase('table');
    startRound();
  }

  function showPhase(phaseName) {
    [phaseTable, phaseUnder, phaseResult].forEach(p => {
      p.classList.add('hidden');
      p.classList.remove('exit-down', 'enter-up');
    });
    if (phaseName === 'table') phaseTable.classList.remove('hidden');
    if (phaseName === 'under') phaseUnder.classList.remove('hidden');
    if (phaseName === 'result') phaseResult.classList.remove('hidden');
  }

  // ========================================
  // フェーズ1: テーブル上（シャッフル）
  // ========================================

  function startRound() {
    roundText.textContent = 'ROUND ' + (currentRound + 1) + ' / ' + TOTAL_ROUNDS;
    tapInstruction.classList.add('hidden');

    const slots = cupsArea.querySelectorAll('.cup-slot');
    slots.forEach(slot => {
      slot.classList.remove('tappable', 'correct-cup', 'wrong-cup', 'lift', 'lift-down');
      slot.querySelector('.coin-indicator').classList.add('hidden');
      slot.querySelector('.coin-indicator').classList.remove('visible');
      slot.onclick = null;
    });

    coinPosition = Math.floor(Math.random() * CUP_COUNT);
    speechText.textContent = tl('putCoin');

    setTimeout(() => {
      const targetSlot = slots[coinPosition];
      targetSlot.classList.add('lift');
      targetSlot.querySelector('.coin-indicator').classList.remove('hidden');
      targetSlot.querySelector('.coin-indicator').classList.add('visible');

      setTimeout(() => {
        speechText.textContent = tl('watchCarefully');
        setTimeout(() => {
          targetSlot.classList.remove('lift');
          targetSlot.classList.add('lift-down');
          targetSlot.querySelector('.coin-indicator').classList.add('hidden');
          targetSlot.querySelector('.coin-indicator').classList.remove('visible');

          setTimeout(() => {
            targetSlot.classList.remove('lift-down');
            speechText.textContent = tl('shuffleStart');
            setTimeout(() => doShuffle(), 600);
          }, 500);
        }, 1000);
      }, 1200);
    }, 800);
  }

  // ===== シャッフル =====
  function doShuffle() {
    const config = ROUND_CONFIG[currentRound];
    const moves = [];
    for (let i = 0; i < config.shuffles; i++) {
      let a, b;
      do {
        a = Math.floor(Math.random() * CUP_COUNT);
        b = Math.floor(Math.random() * CUP_COUNT);
      } while (a === b);
      moves.push([a, b]);
    }

    let step = 0;
    function doNextSwap() {
      if (step >= moves.length) {
        speechText.textContent = tl('whereIsCoin');
        enableTap();
        return;
      }
      const [a, b] = moves[step];
      if (coinPosition === a) coinPosition = b;
      else if (coinPosition === b) coinPosition = a;

      animateSwap(a, b, config.speed * 0.8, () => {
        step++;
        setTimeout(doNextSwap, config.speed * 0.2);
      });
    }
    doNextSwap();
  }

  function animateSwap(indexA, indexB, duration, callback) {
    const slots = cupsArea.querySelectorAll('.cup-slot');
    const slotA = slots[indexA];
    const slotB = slots[indexB];
    const rectA = slotA.getBoundingClientRect();
    const rectB = slotB.getBoundingClientRect();
    const deltaX = rectB.left - rectA.left;

    slotA.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
    slotB.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
    slotA.style.transform = 'translateX(' + deltaX + 'px)';
    slotB.style.transform = 'translateX(' + (-deltaX) + 'px)';

    setTimeout(() => {
      slotA.style.transition = 'none';
      slotB.style.transition = 'none';
      slotA.style.transform = '';
      slotB.style.transform = '';

      const temp = document.createElement('div');
      cupsArea.insertBefore(temp, slotA);
      cupsArea.insertBefore(slotA, slotB);
      cupsArea.insertBefore(slotB, temp);
      cupsArea.removeChild(temp);

      cupsArea.querySelectorAll('.cup-slot').forEach((s, i) => {
        s.setAttribute('data-index', i);
      });
      if (callback) callback();
    }, duration);
  }

  function enableTap() {
    tapInstruction.classList.remove('hidden');
    const slots = cupsArea.querySelectorAll('.cup-slot');
    slots.forEach((slot, i) => {
      slot.classList.add('tappable');
      slot.onclick = () => handleCupTap(i);
    });
  }

  function handleCupTap(tappedIndex) {
    const slots = cupsArea.querySelectorAll('.cup-slot');
    slots.forEach(s => { s.classList.remove('tappable'); s.onclick = null; });
    tapInstruction.classList.add('hidden');

    const coinSlot = slots[coinPosition];
    coinSlot.classList.add('lift');
    coinSlot.querySelector('.coin-indicator').classList.remove('hidden');
    coinSlot.querySelector('.coin-indicator').classList.add('visible');

    if (tappedIndex === coinPosition) {
      speechText.textContent = tl('correctGuess');
      slots[tappedIndex].classList.add('correct-cup');
    } else {
      speechText.textContent = tl('wrongGuess');
      slots[tappedIndex].classList.add('wrong-cup');
    }

    setTimeout(() => transitionToUnderTable(), 1800);
  }

  // ========================================
  // フェーズ2: テーブル下（イライラ棒）
  // ========================================

  function transitionToUnderTable() {
    do {
      targetHole = Math.floor(Math.random() * CUP_COUNT);
    } while (targetHole === coinPosition);

    phaseTable.classList.add('exit-down');
    setTimeout(() => {
      showPhase('under');
      phaseUnder.classList.add('enter-up');
      setupMaze();
    }, 800);
  }

  function setupMaze() {
    const config = ROUND_CONFIG[currentRound];
    pathWidth = config.pathWidth;
    mazeActive = false;
    hasStarted = false;

    // 通路を生成
    pathPoints = generatePath(coinPosition, targetHole, config.curves);

    // コイン初期位置 = スタート穴の中心
    coinX = HOLE_POSITIONS[coinPosition].x;
    coinY = HOLE_POSITIONS[coinPosition].y;

    const cupNames = tl('cupNames');
    instructionDetail.textContent = tl('mazeInstruction', cupNames[coinPosition], cupNames[targetHole]);

    // キャンバス描画
    drawMaze();

    // イベント設定
    mazeContainer.addEventListener('mousedown', onMazeStart);
    mazeContainer.addEventListener('mousemove', onMazeMove);
    mazeContainer.addEventListener('mouseup', onMazeEnd);
    mazeContainer.addEventListener('mouseleave', onMazeEnd);
    mazeContainer.addEventListener('touchstart', onMazeStart, { passive: false });
    mazeContainer.addEventListener('touchmove', onMazeMove, { passive: false });
    mazeContainer.addEventListener('touchend', onMazeEnd);
  }

  function cleanupMazeEvents() {
    mazeContainer.removeEventListener('mousedown', onMazeStart);
    mazeContainer.removeEventListener('mousemove', onMazeMove);
    mazeContainer.removeEventListener('mouseup', onMazeEnd);
    mazeContainer.removeEventListener('mouseleave', onMazeEnd);
    mazeContainer.removeEventListener('touchstart', onMazeStart);
    mazeContainer.removeEventListener('touchmove', onMazeMove);
    mazeContainer.removeEventListener('touchend', onMazeEnd);
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  }

  // ===== 通路生成 =====
  function generatePath(fromHole, toHole, numCurves) {
    const start = HOLE_POSITIONS[fromHole];
    const end = HOLE_POSITIONS[toHole];
    const points = [{ x: start.x, y: start.y }];

    // 中間の曲がりポイントを生成
    const totalSegments = numCurves + 1;
    for (let i = 1; i <= numCurves; i++) {
      const t = i / totalSegments;
      const baseX = start.x + (end.x - start.x) * t;
      const baseY = start.y + (end.y - start.y) * t;

      // Y方向にジグザグさせる（テーブル裏面の奥行きを使う）
      const offsetY = (i % 2 === 1 ? 1 : -1) * (80 + Math.random() * 100);
      // X方向にも少しぶれる
      const offsetX = (Math.random() - 0.5) * 60;

      points.push({
        x: Math.max(50, Math.min(CANVAS_W - 50, baseX + offsetX)),
        y: Math.max(70, Math.min(CANVAS_H - 50, baseY + offsetY)),
      });
    }

    points.push({ x: end.x, y: end.y });
    return points;
  }

  // ===== キャンバス描画 =====
  function drawMaze() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 背景（テーブル裏面の木目）
    ctx.fillStyle = '#3e2210';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // 木目線
    ctx.strokeStyle = 'rgba(90, 55, 30, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const y = Math.random() * CANVAS_H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    // 通路を描画
    drawPath();

    // 穴を描画
    HOLE_POSITIONS.forEach((pos, i) => {
      // 穴の影
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, HOLE_RADIUS + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // 穴本体
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, HOLE_RADIUS, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, HOLE_RADIUS);
      grad.addColorStop(0, '#050505');
      grad.addColorStop(1, '#1a0a05');
      ctx.fillStyle = grad;
      ctx.fill();

      // ラベル
      if (i === coinPosition) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('START', pos.x, pos.y + 4);
      } else if (i === targetHole) {
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', pos.x, pos.y + 4);
        // ゴール穴を光らせる
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, HOLE_RADIUS + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // コイン描画
    drawCoin(coinX, coinY);
  }

  function drawPath() {
    if (pathPoints.length < 2) return;

    // 通路の外枠（壁）
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = pathWidth + 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 通路の内側（通れる部分）
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = pathWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 通路の中央線（うっすら）
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = 'rgba(139, 90, 50, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawCoin(x, y) {
    // 影
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, COIN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // コイン本体
    ctx.beginPath();
    ctx.arc(x, y, COIN_RADIUS, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, COIN_RADIUS);
    grad.addColorStop(0, '#fff3a0');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(1, '#cc9900');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ¥マーク
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¥', x, y);
  }

  // ===== キャンバス座標変換 =====
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // ===== 当たり判定: コインが通路上にあるか =====
  function isPointOnPath(px, py) {
    // 通路の各セグメントとの最短距離を計算
    let minDist = Infinity;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const dist = pointToSegmentDist(
        px, py,
        pathPoints[i].x, pathPoints[i].y,
        pathPoints[i + 1].x, pathPoints[i + 1].y
      );
      if (dist < minDist) minDist = dist;
    }
    // 穴の上にいる場合もOK
    for (const hp of [HOLE_POSITIONS[coinPosition], HOLE_POSITIONS[targetHole]]) {
      const dx = px - hp.x;
      const dy = py - hp.y;
      if (Math.sqrt(dx * dx + dy * dy) < HOLE_RADIUS) return true;
    }
    return minDist <= pathWidth / 2;
  }

  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  }

  // ===== ゴール判定 =====
  function isAtGoal(px, py) {
    const goal = HOLE_POSITIONS[targetHole];
    const dx = px - goal.x;
    const dy = py - goal.y;
    return Math.sqrt(dx * dx + dy * dy) < HOLE_RADIUS;
  }

  // ===== イベントハンドラ =====
  function onMazeStart(e) {
    e.preventDefault();
    if (!mazeActive && !hasStarted) {
      // スタート穴をタップしたか確認
      const pos = getCanvasPos(e);
      const startHole = HOLE_POSITIONS[coinPosition];
      const dx = pos.x - startHole.x;
      const dy = pos.y - startHole.y;
      if (Math.sqrt(dx * dx + dy * dy) < HOLE_RADIUS + 10) {
        mazeActive = true;
        hasStarted = true;
        instructionDetail.textContent = tl('mazeDrag');
        coinX = pos.x;
        coinY = pos.y;
        drawMaze();
      }
    }
  }

  function onMazeMove(e) {
    if (!mazeActive) return;
    e.preventDefault();

    const pos = getCanvasPos(e);
    coinX = pos.x;
    coinY = pos.y;

    // 当たり判定
    if (!isPointOnPath(coinX, coinY)) {
      // 壁にぶつかった！
      onMazeFail();
      return;
    }

    // ゴール判定
    if (isAtGoal(coinX, coinY)) {
      onMazeSuccess();
      return;
    }

    drawMaze();
  }

  function onMazeEnd(e) {
    if (!mazeActive) return;
    // 指を離したらアウト（途中で離すのは許さない）
    if (hasStarted && !isAtGoal(coinX, coinY)) {
      onMazeFail();
    }
  }

  // ===== 成功 / 失敗 =====
  function onMazeFail() {
    mazeActive = false;
    cleanupMazeEvents();

    // 失敗演出
    mazeContainer.classList.add('fail-flash');
    setTimeout(() => mazeContainer.classList.remove('fail-flash'), 400);

    SurrealGames.SoundSystem.play('wrong');

    // コインを赤く表示
    ctx.beginPath();
    ctx.arc(coinX, coinY, COIN_RADIUS + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
    ctx.fill();
    drawCoin(coinX, coinY);

    // × マーク
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', CANVAS_W / 2, CANVAS_H / 2);

    instructionDetail.textContent = tl('mazeFail');

    setTimeout(() => advanceRound(), 1500);
  }

  function onMazeSuccess() {
    mazeActive = false;
    cleanupMazeEvents();

    // 成功演出
    mazeContainer.classList.add('success-flash');
    setTimeout(() => mazeContainer.classList.remove('success-flash'), 500);

    score++;
    SurrealGames.SoundSystem.play('correct');

    // コインをゴールに吸い込む
    const goal = HOLE_POSITIONS[targetHole];
    coinX = goal.x;
    coinY = goal.y;
    drawMaze();

    // ○ マーク
    ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◎', CANVAS_W / 2, CANVAS_H / 2);

    instructionDetail.textContent = tl('mazeSuccess');

    setTimeout(() => advanceRound(), 1500);
  }

  function advanceRound() {
    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      showFinalResult();
    } else {
      phaseUnder.classList.add('exit-down');
      setTimeout(() => {
        showPhase('table');
        phaseTable.classList.add('enter-up');
        resetCupOrder();
        startRound();
      }, 800);
    }
  }

  // ===== コップリセット =====
  function resetCupOrder() {
    const slots = Array.from(cupsArea.querySelectorAll('.cup-slot'));
    slots.forEach(s => s.remove());
    for (let i = 0; i < CUP_COUNT; i++) {
      const slot = document.createElement('div');
      slot.className = 'cup-slot';
      slot.setAttribute('data-index', i);
      slot.innerHTML = '<div class="coin-indicator hidden">🪙</div><div class="cup">🥤</div>';
      cupsArea.appendChild(slot);
    }
  }

  // ===== 最終結果 =====
  function showFinalResult() {
    overlay.classList.remove('hidden');
    startScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    roundIndicator.classList.add('hidden');
    showPhase('table');

    const scoreEl = document.getElementById('final-score');
    const rankEl = document.getElementById('final-rank');
    const commentEl = document.getElementById('final-comment');
    const iconEl = document.getElementById('final-icon');

    scoreEl.textContent = score + ' / ' + TOTAL_ROUNDS;
    sg.onGameEnd(score);

    if (score >= TOTAL_ROUNDS) {
      iconEl.textContent = '🤝';
      rankEl.textContent = tl('perfectHelper');
      commentEl.textContent = tl('perfectComment');
    } else if (score >= TOTAL_ROUNDS * 0.6) {
      iconEl.textContent = '😏';
      rankEl.textContent = tl('okHelper');
      commentEl.textContent = tl('okComment');
    } else if (score >= 1) {
      iconEl.textContent = '😥';
      rankEl.textContent = tl('badHelper');
      commentEl.textContent = tl('badComment');
    } else {
      iconEl.textContent = '💀';
      rankEl.textContent = tl('firedHelper');
      commentEl.textContent = tl('firedComment');
    }
  }

})();
