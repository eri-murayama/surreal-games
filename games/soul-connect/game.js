/* たましいつなぎ — Soul Connect Puzzle */
(function () {
  'use strict';

  // ===== 顔と色（ペアごとの見た目） =====
  const SOULS = [
    { face: '😀', color: '#ff6b6b' },
    { face: '😈', color: '#4dabf7' },
    { face: '🤡', color: '#ffd43b' },
    { face: '👻', color: '#51cf66' },
    { face: '💀', color: '#e599f7' },
    { face: '🥶', color: '#ff922b' },
    { face: '🤖', color: '#b197fc' },
    { face: '👽', color: '#7bed9f' },
  ];

  // ===== ステージ設定 =====
  const STAGES = [
    { rows: 4, cols: 4, pairs: 2 },
    { rows: 4, cols: 4, pairs: 3 },
    { rows: 5, cols: 5, pairs: 3 },
    { rows: 5, cols: 5, pairs: 4 },
    { rows: 6, cols: 5, pairs: 4 },
    { rows: 6, cols: 6, pairs: 5 },
  ];

  // ===== i18n =====
  SurrealI18n.init({
    ja: {
      title: 'たましいつなぎ',
      subtitle: '〜さまよえる顔を、おうちへ〜',
      rule1: '同じ顔のたましいを線でつなごう',
      rule2: '線は交差できない',
      rule3: 'ぜんぶのマスを通せたら完璧！',
      start: 'はじめる',
      level: 'レベル',
      connected: 'つながり',
      reset: 'リセット',
      hint: 'ヒント',
      clearTitle: 'クリア！',
      next: 'つぎへ',
      replay: 'やり直し',
      endingTitle: '全ステージクリア！',
      endingMessage: 'すべてのたましいを家に帰しました。',
      replayAll: 'もう一度',
      badgePerfect: '✨ パーフェクト ✨',
      badgeClear: 'クリア',
      msgPerfect: '全マスを通ったよ！すごい！',
      msgClear: 'たましい達が手をつないだよ。',
    },
    en: {
      title: 'Soul Connect',
      subtitle: '~ Guide the wandering faces home ~',
      rule1: 'Connect each pair of same-face souls',
      rule2: 'Lines cannot cross',
      rule3: 'Fill every cell for a perfect!',
      start: 'Start',
      level: 'Level',
      connected: 'Linked',
      reset: 'Reset',
      hint: 'Hint',
      clearTitle: 'Clear!',
      next: 'Next',
      replay: 'Retry',
      endingTitle: 'All Stages Cleared!',
      endingMessage: 'Every soul found its way home.',
      replayAll: 'Play Again',
      badgePerfect: '✨ PERFECT ✨',
      badgeClear: 'CLEAR',
      msgPerfect: 'You filled every cell!',
      msgClear: 'The souls joined hands.',
    },
  }, {
    onLangChange() { updateI18nText(); }
  });

  function updateI18nText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const s = SurrealI18n.t(key);
      if (s) el.textContent = s;
    });
  }

  function playSound(type) {
    if (window.SurrealGames && window.SurrealGames.SoundSystem) {
      window.SurrealGames.SoundSystem.play(type);
    }
  }

  // ===== ゲーム状態 =====
  let currentStage = 0;
  let rows = 0, cols = 0;
  let cellEls = [];
  let ownerGrid = [];
  let endpointMap = new Map();
  let pairAssign = [];
  let paths = [];
  let activePair = -1;
  let isDragging = false;

  const k = (r, c) => r + ',' + c;

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function isEndpointOfPair(r, c, pid) {
    return endpointMap.get(k(r, c)) === pid;
  }

  function isPairComplete(pid) {
    const p = paths[pid];
    if (!p || p.length < 2) return false;
    const [fr, fc] = p[0];
    const [lr, lc] = p[p.length - 1];
    const a = k(fr, fc), b = k(lr, lc);
    return a !== b && endpointMap.get(a) === pid && endpointMap.get(b) === pid;
  }

  // ===== レベル生成: ランダムハミルトン路 → 分割 =====
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function findHamiltonianPath(R, C) {
    const total = R * C;
    const visited = Array.from({ length: R }, () => Array(C).fill(false));
    const path = [];
    const startR = Math.floor(Math.random() * R);
    const startC = Math.floor(Math.random() * C);
    let steps = 0;
    const maxSteps = 200000;

    function dfs(r, c) {
      if (steps++ > maxSteps) return false;
      visited[r][c] = true;
      path.push([r, c]);
      if (path.length === total) return true;
      const dirs = shuffle([[0, 1], [0, -1], [1, 0], [-1, 0]]);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited[nr][nc]) {
          if (dfs(nr, nc)) return true;
        }
      }
      visited[r][c] = false;
      path.pop();
      return false;
    }

    if (dfs(startR, startC)) return path;
    return null;
  }

  function generateLevel(R, C, numPairs) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const path = findHamiltonianPath(R, C);
      if (!path) continue;
      const total = path.length;
      const minSeg = 2;
      if (total < numPairs * minSeg) continue;

      const cuts = [];
      const slots = [];
      for (let i = minSeg; i <= total - minSeg; i++) slots.push(i);
      shuffle(slots);
      for (const pos of slots) {
        if (cuts.length >= numPairs - 1) break;
        let ok = true;
        for (const c of cuts) {
          if (Math.abs(c - pos) < minSeg) { ok = false; break; }
        }
        if (ok) cuts.push(pos);
      }
      if (cuts.length < numPairs - 1) continue;

      const sorted = [0, ...cuts.sort((a, b) => a - b), total];
      const segments = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const s = sorted[i];
        const e = sorted[i + 1] - 1;
        segments.push({ start: path[s], end: path[e] });
      }
      return { rows: R, cols: C, segments };
    }
    return null;
  }

  // ===== レベル構築 =====
  function buildStage(idx) {
    currentStage = idx;
    const cfg = STAGES[idx];
    rows = cfg.rows;
    cols = cfg.cols;

    let level = generateLevel(rows, cols, cfg.pairs);
    let np = cfg.pairs;
    while (!level && np > 1) {
      np--;
      level = generateLevel(rows, cols, np);
    }
    if (!level) {
      level = { rows, cols, segments: [{ start: [0, 0], end: [rows - 1, cols - 1] }] };
    }

    cellEls = [];
    ownerGrid = [];
    endpointMap = new Map();
    paths = [];
    pairAssign = [];
    activePair = -1;
    isDragging = false;

    const shuffled = shuffle([...SOULS]);
    level.segments.forEach((seg, pid) => {
      pairAssign[pid] = shuffled[pid % shuffled.length];
      endpointMap.set(k(seg.start[0], seg.start[1]), pid);
      endpointMap.set(k(seg.end[0], seg.end[1]), pid);
      paths[pid] = [];
    });

    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      ownerGrid[r] = [];
      cellEls[r] = [];
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'cell';
        el.dataset.r = r;
        el.dataset.c = c;
        gridEl.appendChild(el);
        cellEls[r][c] = el;
        ownerGrid[r][c] = -1;

        const pid = endpointMap.get(k(r, c));
        if (pid !== undefined) {
          ownerGrid[r][c] = pid;
          const soul = document.createElement('div');
          soul.className = 'soul';
          soul.textContent = pairAssign[pid].face;
          el.appendChild(soul);
        }
      }
    }

    render();
    updateHud();
  }

  function render() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = cellEls[r][c];
        el.classList.remove('path', 'endpoint', 'connected', 'active-head');
        el.style.removeProperty('--path-color');

        const owner = ownerGrid[r][c];
        if (owner !== -1) {
          const color = pairAssign[owner].color;
          el.classList.add('path');
          el.style.setProperty('--path-color', hexToRgba(color, 0.4));
          if (isEndpointOfPair(r, c, owner)) {
            el.classList.add('endpoint');
            el.style.setProperty('--path-color', hexToRgba(color, 0.55));
            if (isPairComplete(owner)) el.classList.add('connected');
          }
        }
      }
    }

    if (activePair >= 0) {
      const p = paths[activePair];
      if (p && p.length) {
        const [hr, hc] = p[p.length - 1];
        cellEls[hr][hc].classList.add('active-head');
      }
    }
  }

  function updateHud() {
    document.getElementById('level-display').textContent = (currentStage + 1);
    const total = pairAssign.length;
    let done = 0;
    for (let i = 0; i < total; i++) if (isPairComplete(i)) done++;
    document.getElementById('progress-display').textContent = `${done}/${total}`;
  }

  // ===== ドラッグ操作 =====
  function getCellAtPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cell = el.closest('.cell');
    if (!cell) return null;
    const r = parseInt(cell.dataset.r, 10);
    const c = parseInt(cell.dataset.c, 10);
    if (isNaN(r) || isNaN(c)) return null;
    return { r, c };
  }

  function clearPathKeepEndpoints(pid) {
    const oldPath = paths[pid];
    for (const [r, c] of oldPath) {
      if (!isEndpointOfPair(r, c, pid)) {
        ownerGrid[r][c] = -1;
      }
    }
    paths[pid] = [];
  }

  function onPointerDown(e) {
    const pt = getCellAtPoint(e.clientX, e.clientY);
    if (!pt) return;
    const pid = endpointMap.get(k(pt.r, pt.c));

    if (pid !== undefined) {
      clearPathKeepEndpoints(pid);
      paths[pid] = [[pt.r, pt.c]];
      ownerGrid[pt.r][pt.c] = pid;
      activePair = pid;
      isDragging = true;
      playSound('tap');
      render();
      updateHud();
      e.preventDefault();
      return;
    }

    const owner = ownerGrid[pt.r][pt.c];
    if (owner !== -1) {
      const p = paths[owner];
      const idx = p.findIndex(([r, c]) => r === pt.r && c === pt.c);
      if (idx >= 0) {
        for (let i = idx + 1; i < p.length; i++) {
          const [r, c] = p[i];
          if (!isEndpointOfPair(r, c, owner)) ownerGrid[r][c] = -1;
        }
        paths[owner] = p.slice(0, idx + 1);
        activePair = owner;
        isDragging = true;
        render();
        updateHud();
        e.preventDefault();
      }
    }
  }

  function tryExtend(r, c) {
    if (!isDragging || activePair < 0) return;
    const path = paths[activePair];
    if (!path.length) return;
    const last = path[path.length - 1];
    if (last[0] === r && last[1] === c) return;

    // 1手戻る
    if (path.length >= 2) {
      const prev = path[path.length - 2];
      if (prev[0] === r && prev[1] === c) {
        const [pr, pc] = path.pop();
        if (!isEndpointOfPair(pr, pc, activePair)) ownerGrid[pr][pc] = -1;
        render();
        updateHud();
        return;
      }
    }

    // ヘッドが既に対向端点なら、1手戻し以外は禁止
    if (path.length > 1 && isEndpointOfPair(last[0], last[1], activePair)) return;

    // 隣接チェック
    if (Math.abs(last[0] - r) + Math.abs(last[1] - c) !== 1) return;

    // 他ペアの端点は踏めない
    const epHere = endpointMap.get(k(r, c));
    if (epHere !== undefined && epHere !== activePair) return;

    // 目的セルの所有権
    const owner = ownerGrid[r][c];
    if (owner === activePair) {
      // 自分のパスに含まれていたらループ禁止。
      // 含まれていなければ未使用の対向端点なので通す。
      const inPath = path.some(([pr, pc]) => pr === r && pc === c);
      if (inPath) return;
    } else if (owner !== -1) {
      // 他ペアのセルは踏めない（交差NG）
      return;
    }

    path.push([r, c]);
    ownerGrid[r][c] = activePair;

    if (epHere === activePair) playSound('correct');
    render();
    updateHud();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const pt = getCellAtPoint(e.clientX, e.clientY);
    if (!pt) return;
    tryExtend(pt.r, pt.c);
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    activePair = -1;
    render();
    checkWin();
  }

  // ===== 勝利判定 =====
  function allPairsConnected() {
    for (let i = 0; i < pairAssign.length; i++) {
      if (!isPairComplete(i)) return false;
    }
    return true;
  }

  function countFilledCells() {
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (ownerGrid[r][c] !== -1) n++;
      }
    }
    return n;
  }

  function checkWin() {
    if (!allPairsConnected()) return;
    const perfect = countFilledCells() === rows * cols;
    setTimeout(() => showClear(perfect), 350);
  }

  function showClear(perfect) {
    playSound('result');
    const badge = document.getElementById('clear-badge');
    const msg = document.getElementById('clear-message');
    badge.className = 'clear-badge' + (perfect ? ' perfect' : '');
    badge.textContent = SurrealI18n.t(perfect ? 'badgePerfect' : 'badgeClear');
    msg.textContent = SurrealI18n.t(perfect ? 'msgPerfect' : 'msgClear');
    const isLast = currentStage >= STAGES.length - 1;
    showScreen(isLast && perfect ? 'ending-screen' : 'clear-screen');
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ===== ヒント =====
  function showHint() {
    for (let i = 0; i < pairAssign.length; i++) {
      if (isPairComplete(i)) continue;
      findEndpointsOfPair(i).forEach(([r, c]) => {
        const el = cellEls[r][c];
        if (el && el.animate) {
          el.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.25)' },
              { transform: 'scale(1)' },
            ],
            { duration: 600, iterations: 2 }
          );
        }
      });
      return;
    }
  }

  function findEndpointsOfPair(pid) {
    const result = [];
    endpointMap.forEach((v, key) => {
      if (v === pid) {
        const [r, c] = key.split(',').map(Number);
        result.push([r, c]);
      }
    });
    return result;
  }

  // ===== 初期化 =====
  document.addEventListener('DOMContentLoaded', () => {
    updateI18nText();

    document.getElementById('start-btn').addEventListener('click', () => {
      playSound('start');
      currentStage = 0;
      buildStage(currentStage);
      showScreen('play-screen');
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      playSound('tap');
      buildStage(currentStage);
    });

    document.getElementById('hint-btn').addEventListener('click', () => {
      playSound('tap');
      showHint();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      playSound('tap');
      const nextIdx = currentStage + 1;
      if (nextIdx >= STAGES.length) {
        showScreen('ending-screen');
        return;
      }
      buildStage(nextIdx);
      showScreen('play-screen');
    });

    document.getElementById('replay-btn').addEventListener('click', () => {
      playSound('tap');
      buildStage(currentStage);
      showScreen('play-screen');
    });

    document.getElementById('ending-replay-btn').addEventListener('click', () => {
      playSound('tap');
      currentStage = 0;
      buildStage(currentStage);
      showScreen('play-screen');
    });

    const gridWrap = document.getElementById('grid-wrap');
    gridWrap.addEventListener('pointerdown', onPointerDown);
    gridWrap.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    gridWrap.addEventListener('contextmenu', e => e.preventDefault());
  });
})();
