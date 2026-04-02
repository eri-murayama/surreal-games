/* ============================================================
   すいすいパズル ～彗星のごとく～  |  game.js
   ============================================================ */

(() => {
  'use strict';

  // ---- Constants ----
  const COLS = 10;
  const ROWS = 20;
  const HIDDEN_ROWS = 2; // rows above visible area for spawning

  // Tetromino definitions (each rotation state)
  const SHAPES = {
    I: { color: '#00f0f0', blocks: [[0,0],[1,0],[2,0],[3,0]] },
    O: { color: '#f0f000', blocks: [[0,0],[1,0],[0,1],[1,1]] },
    T: { color: '#a000f0', blocks: [[0,0],[1,0],[2,0],[1,1]] },
    S: { color: '#00f000', blocks: [[1,0],[2,0],[0,1],[1,1]] },
    Z: { color: '#f00000', blocks: [[0,0],[1,0],[1,1],[2,1]] },
    J: { color: '#0000f0', blocks: [[0,0],[0,1],[1,1],[2,1]] },
    L: { color: '#f0a000', blocks: [[2,0],[0,1],[1,1],[2,1]] }
  };

  const PIECE_NAMES = Object.keys(SHAPES);

  // Wall kick data (SRS)
  const WALL_KICKS = {
    normal: [
      [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],   // 0->1
      [[0,0],[1,0],[1,1],[0,-2],[1,-2]],       // 1->2
      [[0,0],[1,0],[1,-1],[0,2],[1,2]],        // 2->3
      [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]    // 3->0
    ],
    I: [
      [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
      [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
      [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
      [[0,0],[1,0],[-2,0],[1,2],[-2,-1]]
    ]
  };

  // Scoring
  const LINE_SCORES = [0, 100, 300, 500, 800];

  // ---- DOM Elements ----
  const $ = id => document.getElementById(id);
  const titleScreen = $('title-screen');
  const gameScreen  = $('game-screen');
  const resultScreen = $('result-screen');
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  const nextCanvas = $('next-canvas');
  const nextCtx = nextCanvas.getContext('2d');
  const lineFlash = $('line-flash');
  const cometMode = $('comet-mode');

  // ---- Game State ----
  let cellSize, grid, currentPiece, nextPiece, score, linesCleared, level;
  let dropInterval, dropTimer, lastTime, paused, gameOver, lockDelay, lockTimer;
  let animationId;
  let noseHairPiece = false; // whether current piece has nose hair

  // ---- Utility ----
  function randomBag() {
    const bag = [...PIECE_NAMES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  let pieceBag = [];

  function nextFromBag() {
    if (pieceBag.length === 0) pieceBag = randomBag();
    return pieceBag.pop();
  }

  // ---- Piece Object ----
  function createPiece(name) {
    const shape = SHAPES[name];
    const blocks = shape.blocks.map(b => [...b]);
    // Nose hair: ~15% chance
    const hasNoseHair = Math.random() < 0.15;
    return {
      name,
      color: shape.color,
      blocks,
      x: Math.floor(COLS / 2) - (name === 'I' ? 2 : 1),
      y: -HIDDEN_ROWS,
      rotation: 0,
      noseHair: hasNoseHair
    };
  }

  function rotateBlocks(blocks, times) {
    let b = blocks.map(p => [...p]);
    for (let t = 0; t < times; t++) {
      // Find bounding box for rotation center
      const maxX = Math.max(...b.map(p => p[0]));
      const maxY = Math.max(...b.map(p => p[1]));
      // Rotate 90 CW around center of bounding box
      b = b.map(([x, y]) => [maxY - y, x]);
      // Normalize to 0,0 origin
      const minX = Math.min(...b.map(p => p[0]));
      const minY = Math.min(...b.map(p => p[1]));
      b = b.map(([x, y]) => [x - minX, y - minY]);
    }
    return b;
  }

  function getPieceBlocks(piece) {
    return rotateBlocks(SHAPES[piece.name].blocks, piece.rotation);
  }

  function getAbsolutePositions(piece) {
    return getPieceBlocks(piece).map(([bx, by]) => [piece.x + bx, piece.y + by]);
  }

  // ---- Grid ----
  function createGrid() {
    return Array.from({ length: ROWS + HIDDEN_ROWS }, () => Array(COLS).fill(null));
  }

  function isValid(piece, offX = 0, offY = 0, rotation = piece.rotation) {
    const blocks = rotateBlocks(SHAPES[piece.name].blocks, rotation);
    for (const [bx, by] of blocks) {
      const nx = piece.x + bx + offX;
      const ny = piece.y + by + offY;
      if (nx < 0 || nx >= COLS || ny >= ROWS + HIDDEN_ROWS) return false;
      if (ny >= 0 && grid[ny][nx]) return false;
    }
    return true;
  }

  // ---- Lock piece into grid ----
  function lockPiece() {
    const positions = getAbsolutePositions(currentPiece);
    for (const [x, y] of positions) {
      if (y >= 0 && y < ROWS + HIDDEN_ROWS) {
        grid[y][x] = {
          color: currentPiece.color,
          noseHair: currentPiece.noseHair
        };
      }
    }
    // Clear nose hair after locking (only draw during piece-in-flight)
    clearLines();
    spawnPiece();
  }

  // ---- Line clearing ----
  function clearLines() {
    let cleared = 0;
    for (let y = ROWS + HIDDEN_ROWS - 1; y >= 0; y--) {
      if (grid[y].every(cell => cell !== null)) {
        grid.splice(y, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared++;
        y++; // recheck this row
      }
    }

    if (cleared > 0) {
      // Score
      const pts = LINE_SCORES[Math.min(cleared, 4)] * level;
      score += pts;
      linesCleared += cleared;
      level = Math.floor(linesCleared / 10) + 1;
      dropInterval = Math.max(50, 1000 - (level - 1) * 80);

      updateDisplay();

      // Flash effect
      lineFlash.classList.add('active');
      setTimeout(() => lineFlash.classList.remove('active'), 400);

      // Comet mode for 4 lines
      if (cleared >= 4) {
        triggerCometMode();
      }
    }
  }

  function triggerCometMode() {
    cometMode.classList.remove('active');
    void cometMode.offsetWidth; // force reflow
    cometMode.classList.add('active');
    setTimeout(() => cometMode.classList.remove('active'), 1600);
  }

  // ---- Spawning ----
  function spawnPiece() {
    currentPiece = nextPiece || createPiece(nextFromBag());
    nextPiece = createPiece(nextFromBag());
    noseHairPiece = currentPiece.noseHair;
    lockTimer = 0;

    // Check game over
    if (!isValid(currentPiece)) {
      endGame();
    }

    drawNext();
  }

  // ---- Movement ----
  function movePiece(dx, dy) {
    if (isValid(currentPiece, dx, dy)) {
      currentPiece.x += dx;
      currentPiece.y += dy;
      if (dy > 0) lockTimer = 0; // reset lock delay on downward move
      return true;
    }
    return false;
  }

  function rotatePiece(dir) {
    // dir: 1 = CW, -1 = CCW (we only do CW for simplicity, CCW = 3x CW)
    const turns = dir === 1 ? 1 : 3;
    const newRotation = (currentPiece.rotation + turns) % 4;
    const kickTable = currentPiece.name === 'I' ? WALL_KICKS.I : WALL_KICKS.normal;
    const kickIndex = currentPiece.rotation; // from state

    for (const [kx, ky] of kickTable[kickIndex]) {
      if (isValid(currentPiece, kx, ky, newRotation)) {
        currentPiece.x += kx;
        currentPiece.y += ky;
        currentPiece.rotation = newRotation;
        lockTimer = 0;
        return true;
      }
    }
    return false;
  }

  function hardDrop() {
    let rows = 0;
    while (isValid(currentPiece, 0, 1)) {
      currentPiece.y++;
      rows++;
    }
    score += rows * 2;
    updateDisplay();
    lockPiece();
  }

  // ---- Rendering ----
  function resizeCanvas() {
    const isMobile = window.innerWidth <= 700;
    cellSize = isMobile
      ? Math.floor(Math.min((window.innerWidth - 20) / COLS, (window.innerHeight * 0.5) / ROWS))
      : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));

    cellSize = Math.max(cellSize, 14);

    canvas.width = COLS * cellSize;
    canvas.height = ROWS * cellSize;

    const nextSize = cellSize * 0.8;
    nextCanvas.width = nextSize * 5;
    nextCanvas.height = nextSize * 5;
  }

  function drawBlock(context, x, y, color, size, hasNoseHair = false) {
    const padding = 1;
    const bx = x * size + padding;
    const by = y * size + padding;
    const bs = size - padding * 2;

    // Main block
    context.fillStyle = color;
    context.fillRect(bx, by, bs, bs);

    // Highlight
    context.fillStyle = 'rgba(255,255,255,0.25)';
    context.fillRect(bx, by, bs, 3);
    context.fillRect(bx, by, 3, bs);

    // Shadow
    context.fillStyle = 'rgba(0,0,0,0.3)';
    context.fillRect(bx + bs - 2, by, 2, bs);
    context.fillRect(bx, by + bs - 2, bs, 2);

    // Nose hair (surreal touch)
    if (hasNoseHair) {
      context.save();
      context.strokeStyle = '#333';
      context.lineWidth = 1.2;
      context.beginPath();
      const cx = bx + bs / 2;
      const cy = by + bs / 2;
      // Two curly nose hairs
      context.moveTo(cx - 2, cy);
      context.quadraticCurveTo(cx - 5, cy + bs * 0.5, cx - 1, cy + bs * 0.7);
      context.moveTo(cx + 2, cy);
      context.quadraticCurveTo(cx + 5, cy + bs * 0.5, cx + 1, cy + bs * 0.7);
      context.stroke();
      context.restore();
    }
  }

  function drawGhostPiece() {
    let gy = currentPiece.y;
    while (true) {
      const testBlocks = rotateBlocks(SHAPES[currentPiece.name].blocks, currentPiece.rotation);
      let valid = true;
      for (const [bx, by] of testBlocks) {
        const nx = currentPiece.x + bx;
        const ny = gy + 1 + by;
        if (nx < 0 || nx >= COLS || ny >= ROWS + HIDDEN_ROWS) { valid = false; break; }
        if (ny >= 0 && grid[ny][nx]) { valid = false; break; }
      }
      if (!valid) break;
      gy++;
    }

    if (gy === currentPiece.y) return;

    const blocks = getPieceBlocks(currentPiece);
    ctx.globalAlpha = 0.2;
    for (const [bx, by] of blocks) {
      const drawY = gy + by - HIDDEN_ROWS;
      const drawX = currentPiece.x + bx;
      if (drawY >= 0 && drawY < ROWS) {
        drawBlock(ctx, drawX, drawY, currentPiece.color, cellSize);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  function drawGrid() {
    // Background
    ctx.fillStyle = '#0a0520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.07)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, ROWS * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(COLS * cellSize, y * cellSize);
      ctx.stroke();
    }

    // Locked blocks
    for (let y = HIDDEN_ROWS; y < ROWS + HIDDEN_ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x]) {
          drawBlock(ctx, x, y - HIDDEN_ROWS, grid[y][x].color, cellSize, grid[y][x].noseHair);
        }
      }
    }
  }

  function drawCurrentPiece() {
    if (!currentPiece) return;
    drawGhostPiece();

    const blocks = getPieceBlocks(currentPiece);
    for (let i = 0; i < blocks.length; i++) {
      const [bx, by] = blocks[i];
      const drawY = currentPiece.y + by - HIDDEN_ROWS;
      const drawX = currentPiece.x + bx;
      if (drawY >= 0 && drawY < ROWS) {
        // Only draw nose hair on the first block of the piece
        drawBlock(ctx, drawX, drawY, currentPiece.color, cellSize, currentPiece.noseHair && i === 0);
      }
    }
  }

  function drawNext() {
    const size = nextCanvas.width / 5;
    nextCtx.fillStyle = '#0a0520';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextPiece) return;
    const blocks = SHAPES[nextPiece.name].blocks;
    // Center the piece
    const maxX = Math.max(...blocks.map(b => b[0]));
    const maxY = Math.max(...blocks.map(b => b[1]));
    const offsetX = (5 - (maxX + 1)) / 2;
    const offsetY = (5 - (maxY + 1)) / 2;

    for (let i = 0; i < blocks.length; i++) {
      const [bx, by] = blocks[i];
      drawBlock(nextCtx, bx + offsetX, by + offsetY, nextPiece.color, size, nextPiece.noseHair && i === 0);
    }
  }

  function render() {
    drawGrid();
    drawCurrentPiece();
  }

  // ---- Display update ----
  function updateDisplay() {
    $('score').textContent = score.toLocaleString();
    $('level').textContent = level;
    $('lines').textContent = linesCleared;
    $('m-score').textContent = score.toLocaleString();
    $('m-level').textContent = level;
    $('m-lines').textContent = linesCleared;
  }

  // ---- Game Loop ----
  function gameLoop(time) {
    if (gameOver) return;
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    if (!paused) {
      dropTimer += delta;

      // Check if piece is resting on something
      const onGround = !isValid(currentPiece, 0, 1);

      if (onGround) {
        lockTimer += delta;
        if (lockTimer >= 500) { // 500ms lock delay
          lockPiece();
          lockTimer = 0;
        }
      }

      if (dropTimer >= dropInterval) {
        dropTimer = 0;
        if (!onGround) {
          currentPiece.y++;
        }
      }

      render();
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  // ---- Common module ----
  const sg = SurrealGames.init('suisei-puzzle');

  // ---- i18n ----
  let currentLang = (function() {
    try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
    return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
  })();

  const LANG = {
    ja: {
      pause: '一時停止', resume: '再開',
      highScore: (v) => 'ハイスコア: ' + v,
      cometRank: '☄️ 彗星ランク ☄️',
      starRank: '⭐ 星空ランク ⭐',
      meteorRank: '✧ 流れ星ランク ✧',
      moonRank: '🌙 三日月ランク 🌙',
      shareText: (score, lines, level, rank, url) =>
        '☄️ すいすいパズル～彗星のごとく～\nスコア: ' + score + '\nライン: ' + lines + '\nレベル: ' + level + '\nランク: ' + rank + '\n\n#シュールゲームス\n' + url,
      shareBtn: '𝕏 で結果をシェア',
    },
    en: {
      pause: 'Pause', resume: 'Resume',
      highScore: (v) => 'High Score: ' + v,
      cometRank: '☄️ Comet Rank ☄️',
      starRank: '⭐ Starry Rank ⭐',
      meteorRank: '✧ Shooting Star Rank ✧',
      moonRank: '🌙 Crescent Rank 🌙',
      shareText: (score, lines, level, rank, url) =>
        '☄️ Sui-Sui Puzzle ~Like a Comet~\nScore: ' + score + '\nLines: ' + lines + '\nLevel: ' + level + '\nRank: ' + rank + '\n\n#SurrealGames\n' + url,
      shareBtn: 'Share on 𝕏',
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

  // ---- Game lifecycle ----
  function startGame() {
    sg.onGameStart();
    grid = createGrid();
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 1000;
    dropTimer = 0;
    lockTimer = 0;
    lastTime = 0;
    paused = false;
    gameOver = false;
    pieceBag = [];
    nextPiece = null;

    resizeCanvas();
    spawnPiece();
    updateDisplay();
    showScreen(gameScreen);

    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameOver = true;
    if (animationId) cancelAnimationFrame(animationId);

    // Fill in results
    $('final-score').textContent = score.toLocaleString();
    $('final-lines').textContent = linesCleared;
    $('final-level').textContent = level;

    // Rank
    let rank = '';
    if (score >= 10000) rank = tl('cometRank');
    else if (score >= 5000) rank = tl('starRank');
    else if (score >= 2000) rank = tl('meteorRank');
    else rank = tl('moonRank');
    $('result-rank').textContent = rank;

    // Build share button
    const existingShareBtn = $('share-btn');
    if (existingShareBtn) existingShareBtn.remove();

    const shareBtn = document.createElement('a');
    shareBtn.id = 'share-btn';
    const gameURL = window.location.href;
    const shareText = tl('shareText', score.toLocaleString(), linesCleared, level, rank, gameURL);
    shareBtn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
    shareBtn.target = '_blank';
    shareBtn.rel = 'noopener noreferrer';
    shareBtn.textContent = tl('shareBtn');
    shareBtn.className = 'btn-primary';
    shareBtn.style.cssText = 'display:inline-block;text-decoration:none;text-align:center;margin-bottom:12px;background:linear-gradient(135deg,#1d9bf0,#1a8cd8);';

    // Insert before retry button
    const retryBtn = $('retry-btn');
    retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

    sg.onGameEnd(score);

    setTimeout(() => showScreen(resultScreen), 600);
  }

  function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // ---- Keyboard controls ----
  const keyState = {};

  document.addEventListener('keydown', e => {
    if (gameOver || paused) {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
      return;
    }

    // Prevent default for game keys
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','z','Z'].includes(e.key)) {
      e.preventDefault();
    }

    if (keyState[e.key]) return; // ignore auto-repeat for some keys
    keyState[e.key] = true;

    switch (e.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        startAutoRepeat('left');
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        startAutoRepeat('right');
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        startAutoRepeat('down');
        break;
      case 'ArrowUp':
      case 'z':
      case 'Z':
        rotatePiece(1);
        break;
      case ' ':
        hardDrop();
        break;
      case 'p':
      case 'P':
      case 'Escape':
        togglePause();
        break;
    }
  });

  document.addEventListener('keyup', e => {
    keyState[e.key] = false;
    if (e.key === 'ArrowLeft') stopAutoRepeat('left');
    if (e.key === 'ArrowRight') stopAutoRepeat('right');
    if (e.key === 'ArrowDown') stopAutoRepeat('down');
  });

  // ---- Auto-repeat (DAS) ----
  const DAS_DELAY = 170;
  const DAS_RATE = 50;
  const autoRepeatTimers = { left: null, right: null, down: null };

  function startAutoRepeat(dir) {
    stopAutoRepeat(dir);
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'down' ? 1 : 0;
    autoRepeatTimers[dir] = setTimeout(() => {
      autoRepeatTimers[dir] = setInterval(() => {
        if (!paused && !gameOver) movePiece(dx, dy);
      }, DAS_RATE);
    }, DAS_DELAY);
  }

  function stopAutoRepeat(dir) {
    clearTimeout(autoRepeatTimers[dir]);
    clearInterval(autoRepeatTimers[dir]);
    autoRepeatTimers[dir] = null;
  }

  // ---- Pause ----
  function togglePause() {
    if (gameOver) return;
    paused = !paused;
    $('pause-btn').textContent = paused ? tl('resume') : tl('pause');
    if (!paused) {
      lastTime = 0;
    }
  }

  // ---- Mobile controls ----
  function bindMobileBtn(id, action, repeatable = false) {
    const btn = $(id);
    if (!btn) return;

    let repeatTimer = null;
    let repeatInterval = null;

    const doAction = () => {
      if (!paused && !gameOver) action();
    };

    const startRepeat = () => {
      doAction();
      if (repeatable) {
        repeatTimer = setTimeout(() => {
          repeatInterval = setInterval(doAction, DAS_RATE);
        }, DAS_DELAY);
      }
    };

    const stopRepeat = () => {
      clearTimeout(repeatTimer);
      clearInterval(repeatInterval);
      repeatTimer = null;
      repeatInterval = null;
    };

    btn.addEventListener('touchstart', e => { e.preventDefault(); startRepeat(); }, { passive: false });
    btn.addEventListener('touchend', e => { e.preventDefault(); stopRepeat(); }, { passive: false });
    btn.addEventListener('touchcancel', stopRepeat);
    btn.addEventListener('mousedown', e => { e.preventDefault(); startRepeat(); });
    btn.addEventListener('mouseup', stopRepeat);
    btn.addEventListener('mouseleave', stopRepeat);
  }

  bindMobileBtn('btn-left', () => movePiece(-1, 0), true);
  bindMobileBtn('btn-right', () => movePiece(1, 0), true);
  bindMobileBtn('btn-down', () => movePiece(0, 1), true);
  bindMobileBtn('btn-rotate', () => rotatePiece(1), false);
  bindMobileBtn('btn-drop', () => hardDrop(), false);

  // ---- Touch swipe support ----
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
  let touchMoved = false;

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
    touchMoved = false;
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (e.touches.length !== 1 || paused || gameOver) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const threshold = cellSize * 1.2;

    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
      movePiece(dx > 0 ? 1 : -1, 0);
      touchStartX = t.clientX;
      touchMoved = true;
    } else if (dy > threshold) {
      movePiece(0, 1);
      touchStartY = t.clientY;
      touchMoved = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', e => {
    if (!touchMoved && Date.now() - touchStartTime < 300) {
      // Tap to rotate
      if (!paused && !gameOver) rotatePiece(1);
    }
  }, { passive: true });

  // ---- High score badge on title ----
  const sgHigh = sg.getHighScore();
  if (sgHigh !== null) {
    const badge = document.createElement('div');
    badge.className = 'sg-highscore-badge';
    badge.textContent = tl('highScore', sgHigh.toLocaleString());
    document.querySelector('.title-container').appendChild(badge);
  }

  // ---- Button events ----
  $('start-btn').addEventListener('click', startGame);
  $('retry-btn').addEventListener('click', startGame);
  $('title-btn').addEventListener('click', () => showScreen(titleScreen));
  $('pause-btn').addEventListener('click', togglePause);

  // ---- Resize handler ----
  window.addEventListener('resize', () => {
    if (gameScreen.classList.contains('active')) {
      resizeCanvas();
      drawNext();
      render();
    }
  });

  // ---- Prevent scrolling on game screen ----
  document.addEventListener('touchmove', e => {
    if (gameScreen.classList.contains('active')) {
      // Allow scrolling on controls, prevent on canvas area
    }
  }, { passive: true });

})();
