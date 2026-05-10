/**
 * シュールソート (Coin Sort Puzzle)
 * 100段階のキャラ整理パズル
 */
(function () {
  'use strict';

  // ===== 定数 =====
  const TOTAL_STAGES = 100;
  const STORAGE_KEY = 'sg_coin_sort_progress_v1';

  // シュールキャラのコインデザイン（color, emoji）
  const COIN_TYPES = [
    { id: 0, emoji: '🦀', bg: 'linear-gradient(135deg, #ff8a65, #ff5252)' },
    { id: 1, emoji: '💩', bg: 'linear-gradient(135deg, #a1887f, #6d4c41)' },
    { id: 2, emoji: '🦄', bg: 'linear-gradient(135deg, #f8bbd0, #f06292)' },
    { id: 3, emoji: '🪲', bg: 'linear-gradient(135deg, #b39ddb, #5e35b1)' },
    { id: 4, emoji: '🍒', bg: 'linear-gradient(135deg, #ef9a9a, #c62828)' },
    { id: 5, emoji: '🍦', bg: 'linear-gradient(135deg, #fff9c4, #fbc02d)' },
    { id: 6, emoji: '🐙', bg: 'linear-gradient(135deg, #ffccbc, #e64a19)' },
    { id: 7, emoji: '🐸', bg: 'linear-gradient(135deg, #c5e1a5, #558b2f)' },
    { id: 8, emoji: '🐱', bg: 'linear-gradient(135deg, #ffe0b2, #fb8c00)' },
    { id: 9, emoji: '🥚', bg: 'linear-gradient(135deg, #fff8e1, #ffb300)' },
    { id: 10, emoji: '⭐', bg: 'linear-gradient(135deg, #fff59d, #f9a825)' },
    { id: 11, emoji: '💖', bg: 'linear-gradient(135deg, #f8bbd0, #d81b60)' },
  ];

  // ===== ステージ設計 =====
  // n=1..100 のステージ難易度パラメータを返す（必ず単調に難化）
  function stageParams(n) {
    let colors, capacity, empty;
    if (n <= 5)        { colors = 2;  capacity = 4; empty = 2; } // 4本
    else if (n <= 10)  { colors = 3;  capacity = 4; empty = 2; } // 5
    else if (n <= 15)  { colors = 4;  capacity = 4; empty = 2; } // 6
    else if (n <= 20)  { colors = 5;  capacity = 4; empty = 2; } // 7
    else if (n <= 25)  { colors = 6;  capacity = 4; empty = 2; } // 8
    else if (n <= 30)  { colors = 7;  capacity = 4; empty = 2; } // 9
    else if (n <= 40)  { colors = 7;  capacity = 5; empty = 2; } // 9（容量UP）
    else if (n <= 50)  { colors = 8;  capacity = 5; empty = 2; } // 10
    else if (n <= 60)  { colors = 9;  capacity = 5; empty = 2; } // 11
    else if (n <= 70)  { colors = 10; capacity = 5; empty = 2; } // 12
    else if (n <= 80)  { colors = 10; capacity = 5; empty = 1; } // 11（空きが減って難化）
    else if (n <= 90)  { colors = 11; capacity = 5; empty = 1; } // 12
    else                { colors = 12; capacity = 5; empty = 1; } // 13（最高難度）
    colors = Math.min(colors, COIN_TYPES.length);
    return { colors, capacity, empty, tubes: colors + empty };
  }

  // ===== シード付き乱数 (Mulberry32) =====
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ===== ステージ生成 =====
  // ランダム分配方式：全コインをシャッフルして、空き筒以外の各筒に「容量」だけ詰める
  // 空き筒は最後に追加。空き筒2つ以上ならほぼ確実に解ける
  function generateStage(n) {
    const p = stageParams(n);
    const seed = n * 7919 + 31;
    const rng = makeRng(seed);

    // 全コインを生成：各色が capacity 個ずつ
    const allCoins = [];
    for (let i = 0; i < p.colors; i++) {
      for (let k = 0; k < p.capacity; k++) allCoins.push(i);
    }
    // Fisher-Yates シャッフル
    for (let i = allCoins.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = allCoins[i]; allCoins[i] = allCoins[j]; allCoins[j] = tmp;
    }

    // colors 本の筒に capacity 個ずつ詰める
    const tubes = [];
    let idx = 0;
    for (let i = 0; i < p.colors; i++) {
      const tube = [];
      for (let k = 0; k < p.capacity; k++) tube.push(allCoins[idx++]);
      tubes.push(tube);
    }
    // 空筒を追加
    for (let i = 0; i < p.empty; i++) tubes.push([]);

    // 偶然完成形になっていたら、隣接2筒の頂点を入れ替えてシャッフル
    if (isCleared(tubes, p.capacity)) {
      // tube0 と tube1 の頂点を交換
      const a = tubes[0].pop();
      const b = tubes[1].pop();
      tubes[0].push(b);
      tubes[1].push(a);
    }

    return { tubes, params: p };
  }

  function isCleared(tubes, capacity) {
    for (const tube of tubes) {
      if (tube.length === 0) continue;
      if (tube.length !== capacity) return false;
      const first = tube[0];
      for (const c of tube) if (c !== first) return false;
    }
    return true;
  }

  // ===== 進捗保存 =====
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { cleared: {}, current: 1, bestMoves: {} };
      const data = JSON.parse(raw);
      return {
        cleared: data.cleared || {},
        current: data.current || 1,
        bestMoves: data.bestMoves || {},
      };
    } catch (e) {
      return { cleared: {}, current: 1, bestMoves: {} };
    }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  // ===== ゲーム状態 =====
  const State = {
    progress: loadProgress(),
    currentStage: 1,
    tubes: [],
    capacity: 4,
    selectedTube: -1,
    moves: 0,
    history: [],
  };

  // ===== DOM参照 =====
  const $ = (id) => document.getElementById(id);
  const screens = {
    title: null, select: null, game: null, clear: null, allClear: null,
  };

  function showScreen(name) {
    Object.values(screens).forEach((el) => el && el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
  }

  // ===== 効果音（簡易・WebAudio） =====
  let audioCtx = null;
  function getAudio() {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audioCtx = null; }
    return audioCtx;
  }
  function isMuted() {
    try { return localStorage.getItem('sg_muted') === '1'; } catch (e) { return false; }
  }
  function beep(freq, dur, type) {
    if (isMuted()) return;
    const ctx = getAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  function sePick() { beep(660, 0.08, 'sine'); }
  function sePlace() { beep(880, 0.1, 'sine'); }
  function seInvalid() { beep(180, 0.16, 'square'); }
  function seComplete() {
    if (isMuted()) return;
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle'), i * 80));
  }
  function seClear() {
    if (isMuted()) return;
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle'), i * 90));
  }

  // ===== ゲーム描画 =====
  function renderBoard() {
    const board = $('board');
    board.innerHTML = '';
    board.dataset.tubeCount = String(State.tubes.length);
    board.style.setProperty('--capacity', String(State.capacity));

    State.tubes.forEach((tube, idx) => {
      const tubeEl = document.createElement('div');
      tubeEl.className = 'tube';
      tubeEl.style.setProperty('--capacity', String(State.capacity));
      tubeEl.dataset.tubeIdx = String(idx);
      if (idx === State.selectedTube) tubeEl.classList.add('tube--selected');
      if (isTubeComplete(tube)) tubeEl.classList.add('tube--complete');

      tube.forEach((coinId, depth) => {
        const coin = COIN_TYPES[coinId];
        const coinEl = document.createElement('div');
        coinEl.className = 'coin';
        coinEl.style.background = coin.bg;
        coinEl.textContent = coin.emoji;
        // 一番上のコインで選択中なら宙に浮かせる
        if (idx === State.selectedTube && depth === tube.length - 1) {
          coinEl.classList.add('coin--floating');
          // 浮く距離 = 筒の上端より少し上
          coinEl.style.setProperty('--float-distance', '70px');
        }
        tubeEl.appendChild(coinEl);
      });

      tubeEl.addEventListener('click', () => onTubeClick(idx));
      board.appendChild(tubeEl);
    });

    // HUD更新
    $('hud-stage-no').textContent = String(State.currentStage);
    $('hud-moves').textContent = String(State.moves);
    $('undo-btn').disabled = State.history.length === 0;
  }

  function isTubeComplete(tube) {
    if (tube.length !== State.capacity) return false;
    const first = tube[0];
    return tube.every((c) => c === first);
  }

  // ===== 入力 =====
  function onTubeClick(idx) {
    const tube = State.tubes[idx];

    if (State.selectedTube === -1) {
      // 未選択：このtubeを選択（空なら何もしない）
      if (tube.length === 0) return;
      State.selectedTube = idx;
      sePick();
      renderBoard();
      return;
    }

    if (State.selectedTube === idx) {
      // 同じ筒を再タップ → 選択解除
      State.selectedTube = -1;
      renderBoard();
      return;
    }

    // 移動を試みる
    const from = State.selectedTube;
    const to = idx;
    if (canMove(from, to)) {
      doMove(from, to);
    } else {
      // 移動不可：選択を切り替える（タップした筒を新しく選択）
      seInvalid();
      showEffect(SurrealI18n.t('invalidMove'));
      if (tube.length > 0) {
        State.selectedTube = idx;
      } else {
        State.selectedTube = -1;
      }
      renderBoard();
    }
  }

  function canMove(from, to) {
    if (from === to) return false;
    const src = State.tubes[from];
    const dst = State.tubes[to];
    if (src.length === 0) return false;
    if (dst.length >= State.capacity) return false;
    if (dst.length === 0) return true;
    return dst[dst.length - 1] === src[src.length - 1];
  }

  function doMove(from, to) {
    // 履歴記録
    State.history.push({ from, to });
    const coin = State.tubes[from].pop();
    State.tubes[to].push(coin);
    State.moves++;
    State.selectedTube = -1;
    sePlace();

    if (isTubeComplete(State.tubes[to])) {
      seComplete();
    }

    renderBoard();

    if (isCleared(State.tubes, State.capacity)) {
      setTimeout(() => onStageClear(), 320);
    }
  }

  function onUndo() {
    if (State.history.length === 0) return;
    const last = State.history.pop();
    const coin = State.tubes[last.to].pop();
    State.tubes[last.from].push(coin);
    State.moves++; // undo もカウント（評価は厳しめ）
    State.selectedTube = -1;
    sePick();
    renderBoard();
  }

  function onReset() {
    loadStage(State.currentStage);
  }

  // ===== ヒント（1手だけ提案） =====
  function findHint() {
    // 「相手の筒に同色を積み上げる」手を優先
    // 1. 同色グループを完成させる手 (相手の筒の上が同色 & 自分のtopも同色)
    // 2. 同色を1つ積めるだけの手
    // 3. 空筒へ移動する手
    const tubes = State.tubes;
    const cap = State.capacity;
    const candidates = [];
    for (let from = 0; from < tubes.length; from++) {
      if (tubes[from].length === 0) continue;
      // 既に完成済みの筒は動かさない
      if (isTubeComplete(tubes[from])) continue;
      const top = tubes[from][tubes[from].length - 1];
      // 同色のかたまりを動かす意味がない場合（topがそのtube内で1つだけで、かつそれを動かしても良くならないケース）
      // → 単純に色マッチを優先
      for (let to = 0; to < tubes.length; to++) {
        if (from === to) continue;
        if (tubes[to].length >= cap) continue;
        const dstTop = tubes[to].length === 0 ? null : tubes[to][tubes[to].length - 1];
        if (dstTop === null) {
          // 空筒：fromが「複数色混在の上に乗っているtop」のときだけ意味がある
          // すでに同色だけの筒なら空筒に移すのは意味がない
          const fromAllSame = tubes[from].every((c) => c === top);
          if (!fromAllSame) {
            candidates.push({ from, to, score: 1 });
          }
        } else if (dstTop === top) {
          // 同色マッチ
          // スコア：to に同色が多いほど高評価（完成に近い）
          let score = 10;
          for (let i = tubes[to].length - 1; i >= 0; i--) {
            if (tubes[to][i] === top) score += 5; else break;
          }
          // from のすぐ下も同色なら、続けて流せるのでさらに+
          if (tubes[from].length >= 2 && tubes[from][tubes[from].length - 2] === top) score += 3;
          candidates.push({ from, to, score });
        }
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  function onHint() {
    const hint = findHint();
    if (!hint) {
      showEffect(SurrealI18n.t('hintNone'));
      seInvalid();
      return;
    }
    showEffect(SurrealI18n.t('hintFound'));
    sePick();
    // 該当筒をハイライト
    const board = $('board');
    const tubes = board.querySelectorAll('.tube');
    if (tubes[hint.from]) tubes[hint.from].classList.add('tube--hint-from');
    if (tubes[hint.to]) tubes[hint.to].classList.add('tube--hint-to');
    setTimeout(() => {
      if (tubes[hint.from]) tubes[hint.from].classList.remove('tube--hint-from');
      if (tubes[hint.to]) tubes[hint.to].classList.remove('tube--hint-to');
    }, 2400);
  }

  // ===== ステージ管理 =====
  function loadStage(n) {
    State.currentStage = n;
    const stage = generateStage(n);
    State.tubes = stage.tubes;
    State.capacity = stage.params.capacity;
    State.selectedTube = -1;
    State.moves = 0;
    State.history = [];
    renderBoard();
    showScreen('game');
  }

  function onStageClear() {
    seClear();
    const n = State.currentStage;
    State.progress.cleared[n] = true;
    if (n >= State.progress.current) {
      State.progress.current = Math.min(n + 1, TOTAL_STAGES);
    }
    const prevBest = State.progress.bestMoves[n] || Infinity;
    if (State.moves < prevBest) {
      State.progress.bestMoves[n] = State.moves;
    }
    saveProgress(State.progress);

    $('clear-stage-no').textContent = String(n);
    $('clear-moves').textContent = String(State.moves);
    $('clear-rank').textContent = computeRank(n, State.moves);

    // 全クリア判定
    const allCleared = Object.keys(State.progress.cleared).length >= TOTAL_STAGES;
    if (allCleared) {
      // 全クリア画面を一度見せる
      setTimeout(() => showScreen('allClear'), 100);
      return;
    }

    showScreen('clear');
    // 次ステージボタンの有効/無効
    $('next-btn').style.display = (n < TOTAL_STAGES) ? '' : 'none';
  }

  function computeRank(n, moves) {
    // 評価：パラメータからおおよその最低手数を推定
    const p = stageParams(n);
    // ざっくり：色数*容量 / 1.5 を基準に星評価
    const baseline = Math.ceil((p.colors * p.capacity) / 1.5);
    if (moves <= baseline) return '⭐⭐⭐';
    if (moves <= baseline * 1.6) return '⭐⭐';
    return '⭐';
  }

  // ===== ステージ選択 =====
  function renderStageGrid() {
    const grid = $('stage-grid');
    grid.innerHTML = '';
    for (let n = 1; n <= TOTAL_STAGES; n++) {
      const cell = document.createElement('button');
      cell.className = 'stage-cell';
      cell.textContent = String(n);
      const isCleared = !!State.progress.cleared[n];
      const isLocked = n > State.progress.current;
      const isCurrent = n === State.progress.current && !isCleared;
      if (isCleared) cell.classList.add('stage-cell--cleared');
      if (isLocked) {
        cell.classList.add('stage-cell--locked');
        cell.disabled = true;
      }
      if (isCurrent) cell.classList.add('stage-cell--current');
      cell.addEventListener('click', () => {
        if (isLocked) return;
        loadStage(n);
      });
      grid.appendChild(cell);
    }
  }

  // ===== エフェクト =====
  function showEffect(text) {
    const el = $('effect-text');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove('show'), 1000);
  }

  // ===== タイトル更新 =====
  function refreshTitle() {
    const cleared = Object.keys(State.progress.cleared).length;
    $('progress-display').textContent = SurrealI18n.t('progressFmt', cleared);
    // ボタン表記をクリア状況で出し分け
    const startBtn = $('start-btn');
    if (cleared === 0) {
      startBtn.textContent = SurrealI18n.t('startBtnNew');
    } else {
      startBtn.textContent = SurrealI18n.t('startBtn');
    }
  }

  // ===== 初期化 =====
  function init() {
    screens.title = $('title-screen');
    screens.select = $('select-screen');
    screens.game = $('game-screen');
    screens.clear = $('clear-screen');
    screens.allClear = $('all-clear-screen');

    refreshTitle();

    // タイトル
    $('start-btn').addEventListener('click', () => {
      // オーディオを起動（ユーザー操作トリガー）
      getAudio();
      loadStage(State.progress.current);
    });
    $('select-btn').addEventListener('click', () => {
      getAudio();
      renderStageGrid();
      showScreen('select');
    });

    // 選択画面
    $('select-back').addEventListener('click', () => {
      refreshTitle();
      showScreen('title');
    });

    // ゲーム画面のHUDボタン
    $('hud-back').addEventListener('click', () => {
      renderStageGrid();
      showScreen('select');
    });
    $('undo-btn').addEventListener('click', onUndo);
    $('hint-btn').addEventListener('click', onHint);
    $('reset-btn').addEventListener('click', onReset);

    // クリア画面
    $('next-btn').addEventListener('click', () => {
      const next = Math.min(State.currentStage + 1, TOTAL_STAGES);
      loadStage(next);
    });
    $('replay-btn').addEventListener('click', () => loadStage(State.currentStage));
    $('clear-back').addEventListener('click', () => {
      renderStageGrid();
      showScreen('select');
    });
    $('all-clear-back').addEventListener('click', () => {
      renderStageGrid();
      showScreen('select');
    });

    // 言語変更時の再描画
    SurrealI18n.onLangChange(() => {
      refreshTitle();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
