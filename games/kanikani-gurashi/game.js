/* ===== かにかにぐらし ゲームロジック ===== */
(function() {
  'use strict';

  const SAVE_KEY = 'kanikani-gurashi-save-v1';
  const COLS = 6;
  const ROWS = 7;
  const CELLS = COLS * ROWS;

  // ===== 進化チェーン定義 =====
  const CHAINS = {
    furniture: {
      name: '家具',
      tiers: [
        { emoji: '🟫', name: '座布団' },
        { emoji: '🪑', name: 'スツール' },
        { emoji: '🛋️', name: 'ソファ' },
        { emoji: '🛌', name: 'ベッド' },
        { emoji: '🛏️', name: '豪華ベッド' },
        { emoji: '🏡', name: 'お部屋' },
        { emoji: '🏰', name: '豪邸' },
        { emoji: '🏯', name: '夢のお城' },
      ]
    },
    food: {
      name: 'ごはん',
      tiers: [
        { emoji: '🍜', name: 'カップ麺' },
        { emoji: '🍙', name: 'おにぎり' },
        { emoji: '🍱', name: 'お弁当' },
        { emoji: '🍣', name: 'お寿司' },
        { emoji: '🍲', name: 'ラーメン' },
        { emoji: '🥩', name: 'ステーキ' },
        { emoji: '🍷', name: 'フレンチ' },
        { emoji: '⭐', name: '星ディナー' },
      ]
    },
    appliance: {
      name: '家電',
      tiers: [
        { emoji: '🌀', name: '扇風機' },
        { emoji: '🍞', name: 'トースター' },
        { emoji: '🧊', name: '冷蔵庫' },
        { emoji: '🫧', name: '洗濯機' },
        { emoji: '❄️', name: 'エアコン' },
        { emoji: '💻', name: 'パソコン' },
        { emoji: '🎬', name: 'ホームシアター' },
        { emoji: '🤖', name: 'スマート家電' },
      ]
    },
    plant: {
      name: '植物',
      tiers: [
        { emoji: '🌰', name: 'たね' },
        { emoji: '🌱', name: 'めばえ' },
        { emoji: '🌵', name: '多肉' },
        { emoji: '🪴', name: '観葉植物' },
        { emoji: '🌸', name: '花' },
        { emoji: '🌳', name: '木' },
        { emoji: '🏞️', name: '小さな庭' },
        { emoji: '🌲', name: 'みどりの森' },
      ]
    }
  };

  // ===== レベル・アンロック =====
  const XP_TABLE = [0, 40, 100, 180, 290, 430, 600, 800, 1040, 1320, 1640, 2000, 2400, 2900, 3500, 4200, 5000, 6000, 7200, 8600];
  function getUnlockedChains() {
    const list = ['furniture', 'food'];
    if (state.level >= 3) list.push('appliance');
    if (state.level >= 5) list.push('plant');
    return list;
  }
  function getMaxSpawnTier() {
    if (state.level >= 8) return 3;
    if (state.level >= 4) return 2;
    return 1;
  }

  // ===== 家具ショップ =====
  // 汚部屋度: 0=普通, 1=散らかり始め, 2=汚い, 3=ゴミ屋敷
  const FURNITURE_SHOP = [
    // === Lv1〜2: きれいなお部屋フェーズ ===
    { id: 'rug',      emoji: '🟫', name: 'ラグ',       cost: 5,  lv: 1,  pos: { bottom: '10%', left: '32%', fontSize: '3.2em' } },
    { id: 'lamp',     emoji: '💡', name: 'ランプ',     cost: 6,  lv: 1,  pos: { top: '48%', right: '16%' } },
    { id: 'bed',      emoji: '🛏️', name: 'ベッド',     cost: 10, lv: 1,  pos: { top: '42%', left: '8%' } },
    { id: 'sofa',     emoji: '🛋️', name: 'ソファ',     cost: 12, lv: 2,  pos: { bottom: '22%', left: '38%' } },
    { id: 'table',    emoji: '🪵', name: 'テーブル',   cost: 10, lv: 2,  pos: { bottom: '26%', right: '28%' } },
    { id: 'plant',    emoji: '🪴', name: '観葉植物',   cost: 14, lv: 2,  pos: { bottom: '16%', right: '6%' } },
    // === Lv3〜4: まだきれい ===
    { id: 'tv',       emoji: '📺', name: 'テレビ',     cost: 18, lv: 3,  pos: { top: '38%', right: '42%' } },
    { id: 'shelf',    emoji: '📚', name: '本だな',     cost: 20, lv: 3,  pos: { top: '30%', left: '35%' } },
    { id: 'painting', emoji: '🖼️', name: '絵画',       cost: 22, lv: 3,  pos: { top: '14%', left: '42%' } },
    { id: 'desk',     emoji: '🪑', name: 'デスク',     cost: 16, lv: 4,  pos: { bottom: '28%', left: '10%' } },
    { id: 'game',     emoji: '🎮', name: 'ゲーム機',   cost: 18, lv: 4,  pos: { bottom: '32%', left: '22%' } },
    { id: 'fridge',   emoji: '🧊', name: '冷蔵庫',     cost: 26, lv: 4,  pos: { top: '44%', right: '6%' } },
    // === Lv5〜6: まだ普通 ===
    { id: 'washer',   emoji: '🫧', name: '洗濯機',     cost: 24, lv: 5,  pos: { top: '48%', right: '28%' } },
    { id: 'cat',      emoji: '🐈', name: 'ねこ',       cost: 35, lv: 5,  pos: { bottom: '14%', left: '58%' } },
    { id: 'tree',     emoji: '🌳', name: '大きな木',   cost: 40, lv: 6,  pos: { bottom: '20%', right: '42%' } },
    { id: 'piano',    emoji: '🎹', name: 'ピアノ',     cost: 45, lv: 6,  pos: { top: '40%', left: '48%' } },
    { id: 'fish',     emoji: '🐠', name: '水槽',       cost: 30, lv: 6,  pos: { top: '50%', left: '22%' } },
    { id: 'star',     emoji: '✨', name: '星あかり',   cost: 50, lv: 7,  pos: { top: '6%', right: '44%' } },
    // === Lv7〜8: ちょっと散らかってきた ===
    { id: 'shoes',    emoji: '👟', name: '脱ぎっぱ靴', cost: 8,  lv: 7,  pos: { bottom: '4%', left: '50%' } },
    { id: 'cup',      emoji: '🍵', name: '飲みかけ',   cost: 6,  lv: 7,  pos: { bottom: '30%', right: '18%' } },
    { id: 'pizza',    emoji: '🍕', name: '食べかけ',   cost: 7,  lv: 7,  pos: { bottom: '18%', left: '44%' } },
    { id: 'cloth1',   emoji: '👕', name: '脱ぎっぱT',  cost: 5,  lv: 7,  pos: { bottom: '34%', left: '62%' } },
    { id: 'can',      emoji: '🥫', name: '空き缶',     cost: 4,  lv: 8,  pos: { bottom: '8%', right: '30%' } },
    { id: 'bag',      emoji: '🛍️', name: 'レジ袋',     cost: 3,  lv: 8,  pos: { bottom: '12%', left: '18%' } },
    { id: 'noodle',   emoji: '🍜', name: 'カップ麺',   cost: 5,  lv: 8,  pos: { bottom: '22%', right: '48%' } },
    { id: 'remote',   emoji: '📱', name: '充電器の山', cost: 8,  lv: 8,  pos: { bottom: '26%', left: '30%' } },
    { id: 'socks',    emoji: '🧦', name: '片方の靴下', cost: 3,  lv: 8,  pos: { bottom: '6%', right: '12%' } },
    // === Lv9〜10: だいぶ汚い ===
    { id: 'bottles',  emoji: '🍶', name: '空きびん',   cost: 4,  lv: 9,  pos: { bottom: '14%', right: '54%' } },
    { id: 'news',     emoji: '📰', name: '古新聞',     cost: 3,  lv: 9,  pos: { bottom: '20%', left: '6%' } },
    { id: 'dust',     emoji: '🫥', name: 'ホコリ',     cost: 2,  lv: 9,  pos: { top: '25%', right: '20%' } },
    { id: 'ramen',    emoji: '🥡', name: 'UberEats箱', cost: 6,  lv: 9,  pos: { bottom: '28%', right: '6%' } },
    { id: 'tissue',   emoji: '🧻', name: 'ティッシュ山', cost: 4, lv: 9, pos: { bottom: '16%', left: '52%' } },
    { id: 'mold',     emoji: '🟢', name: 'カビ',       cost: 2,  lv: 9,  pos: { top: '18%', left: '12%' } },
    { id: 'cobweb',   emoji: '🕸️', name: 'クモの巣',   cost: 2,  lv: 9,  pos: { top: '6%', left: '6%' } },
    { id: 'fly',      emoji: '🪰', name: 'コバエ',     cost: 1,  lv: 10, pos: { top: '30%', left: '50%' } },
    { id: 'roach',    emoji: '🪳', name: 'Gのすがた',  cost: 1,  lv: 10, pos: { bottom: '4%', left: '70%' } },
    { id: 'stink',    emoji: '💀', name: '謎のにおい', cost: 2,  lv: 10, pos: { top: '40%', left: '28%' } },
    { id: 'laundry',  emoji: '👔', name: '洗濯物の山', cost: 5,  lv: 10, pos: { bottom: '36%', right: '38%' } },
    { id: 'ashtray',  emoji: '🚬', name: '灰皿タワー', cost: 6,  lv: 10, pos: { bottom: '24%', left: '14%' } },
    // === Lv11〜12: ゴミ屋敷化 ===
    { id: 'rat',      emoji: '🐀', name: 'ネズミ',     cost: 1,  lv: 11, pos: { bottom: '2%', right: '22%' } },
    { id: 'trash1',   emoji: '🗑️', name: 'ゴミ袋①',   cost: 3,  lv: 11, pos: { bottom: '18%', right: '62%' } },
    { id: 'trash2',   emoji: '🗑️', name: 'ゴミ袋②',   cost: 3,  lv: 11, pos: { bottom: '10%', left: '40%' } },
    { id: 'trash3',   emoji: '🗑️', name: 'ゴミ袋③',   cost: 3,  lv: 11, pos: { bottom: '26%', left: '56%' } },
    { id: 'mush',     emoji: '🍄', name: 'キノコ',     cost: 2,  lv: 11, pos: { bottom: '38%', right: '14%' } },
    { id: 'spider',   emoji: '🕷️', name: 'クモ',       cost: 1,  lv: 11, pos: { top: '10%', right: '30%' } },
    { id: 'bone',     emoji: '🦴', name: '謎の骨',     cost: 4,  lv: 11, pos: { bottom: '6%', left: '26%' } },
    { id: 'leak',     emoji: '💧', name: '水漏れ',     cost: 2,  lv: 11, pos: { top: '4%', left: '30%' } },
    { id: 'mold2',    emoji: '🟤', name: '黒カビ',     cost: 2,  lv: 12, pos: { top: '14%', right: '8%' } },
    { id: 'maggot',   emoji: '🪱', name: 'うじ',       cost: 1,  lv: 12, pos: { bottom: '12%', right: '40%' } },
    { id: 'broken',   emoji: '🔨', name: '壊れた壁',   cost: 5,  lv: 12, pos: { top: '22%', left: '60%' } },
    { id: 'smell',    emoji: '☠️', name: '瘴気',       cost: 3,  lv: 12, pos: { top: '34%', right: '50%' } },
    // === Lv13〜14: 完全なるゴミ屋敷 ===
    { id: 'trash4',   emoji: '🗑️', name: 'ゴミ袋④',   cost: 3,  lv: 13, pos: { bottom: '32%', left: '4%' } },
    { id: 'trash5',   emoji: '🗑️', name: 'ゴミ袋⑤',   cost: 3,  lv: 13, pos: { top: '44%', right: '60%' } },
    { id: 'fungi',    emoji: '🧫', name: '培養皿',     cost: 4,  lv: 13, pos: { bottom: '20%', right: '26%' } },
    { id: 'bat',      emoji: '🦇', name: 'コウモリ',   cost: 2,  lv: 13, pos: { top: '8%', left: '52%' } },
    { id: 'ghost',    emoji: '👻', name: '何かの気配', cost: 5,  lv: 13, pos: { top: '20%', right: '40%' } },
    { id: 'vines',    emoji: '🌿', name: '侵食する草', cost: 3,  lv: 13, pos: { top: '36%', left: '4%' } },
    { id: 'rust',     emoji: '🟠', name: 'サビ',       cost: 2,  lv: 14, pos: { top: '28%', right: '4%' } },
    { id: 'crack',    emoji: '⚡', name: 'ひび割れ',   cost: 3,  lv: 14, pos: { top: '12%', left: '48%' } },
    { id: 'slime',    emoji: '🟩', name: '謎の液体',   cost: 2,  lv: 14, pos: { bottom: '8%', left: '60%' } },
    { id: 'eyeball',  emoji: '👁️', name: '壁の目',     cost: 6,  lv: 14, pos: { top: '16%', left: '24%' } },
    { id: 'darkness', emoji: '🌑', name: '闇',         cost: 8,  lv: 14, pos: { top: '2%', right: '16%' } },
    { id: 'void',     emoji: '🕳️', name: '虚無',       cost: 10, lv: 14, pos: { bottom: '14%', left: '34%' } },
  ];

  // ===== チュートリアル =====
  const TUTORIAL = [
    { title: '🦀 かにかにより', text: 'こんにちは！わたし、かにかに。上京してきたばかりで、何もないお部屋に一人ぐらしなの。' },
    { title: '📦 ダンボールをタップ', text: 'ダンボールをタップすると、引越し荷物が出てくるよ！エネルギー⚡を1つ使うの。' },
    { title: '✨ 同じものをくっつけて', text: '同じアイテムをドラッグしてくっつけると、進化してもっといいものになるよ！' },
    { title: '♻️ いらないものは', text: 'いらないアイテムは📦ダンボールにドラッグすると売れるよ！⭐が少しもらえるの。' },
    { title: '📋 ごちゅうもん', text: '上の注文リストを見て、同じアイテムを作ったら納品してね。⭐とXPがもらえるよ！' },
    { title: '🏠 おへや', text: '集めた⭐で、おへやタブから家具が買えるよ。理想のお部屋を作ろう！' },
    { title: '🌟 がんばろう！', text: 'レベルが上がると新しいアイテムや家具が解放されるよ。それじゃあ始めよう！' },
  ];

  // ===== ゲーム状態 =====
  let state = null;

  function createInitialState() {
    const board = new Array(CELLS).fill(null);
    board[0] = { chain: 'generator', tier: 1 };
    // 初回用: すぐマージを体験できるようペアを配置
    board[7] = { chain: 'furniture', tier: 1 };
    board[8] = { chain: 'furniture', tier: 1 };
    board[13] = { chain: 'food', tier: 1 };
    board[14] = { chain: 'food', tier: 1 };
    return {
      board,
      energy: 30,
      energyMax: 30,
      stars: 0,
      xp: 0,
      level: 1,
      orders: [null, null, null],
      ownedFurniture: [],
      dex: { 'furniture-1': true, 'food-1': true },
      lastEnergyTime: Date.now(),
      tutoDone: false,
    };
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.board)) return null;
      return data;
    } catch (e) { return null; }
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  // ===== DOM参照 =====
  let boardEl, stripEl, lvVal, xpFill, energyVal, energyMaxEl, starVal;
  let roomSceneItems, roomShopEl, dexList, toastEl;
  let boardCountEl, boardUsageFill, energyTimerEl, comboDisplayEl;

  // ===== コンボ =====
  let comboCount = 0;
  let comboTimer = null;
  function addCombo() {
    comboCount++;
    clearTimeout(comboTimer);
    if (comboCount >= 2) {
      sfxComboSE(comboCount);
      comboDisplayEl.textContent = comboCount + ' COMBO!';
      comboDisplayEl.classList.remove('active');
      void comboDisplayEl.offsetWidth; // reflow
      comboDisplayEl.classList.add('active');
      var bonus = comboCount;
      state.stars += bonus;
      toast('🔥 ' + comboCount + 'コンボ! ⭐+' + bonus);
    }
    comboTimer = setTimeout(function() {
      comboCount = 0;
      comboDisplayEl.classList.remove('active');
    }, 2500);
  }
  function resetCombo() {
    comboCount = 0;
    clearTimeout(comboTimer);
    comboDisplayEl.classList.remove('active');
  }

  // ===== パーティクル =====
  function spawnStarParticles(fromEl, count) {
    var rect = fromEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    // ⭐表示位置を取得
    var starRect = starVal.getBoundingClientRect();
    var tx = starRect.left + starRect.width / 2;
    var ty = starRect.top + starRect.height / 2;
    for (var i = 0; i < count; i++) {
      (function(delay) {
        setTimeout(function() {
          var p = document.createElement('div');
          p.className = 'star-particle';
          p.textContent = '⭐';
          p.style.left = cx + 'px';
          p.style.top = cy + 'px';
          var dx = (tx - cx) + (Math.random() - 0.5) * 40;
          var dy = (ty - cy) + (Math.random() - 0.5) * 40;
          p.style.setProperty('--dx', dx + 'px');
          p.style.setProperty('--dy', dy + 'px');
          document.body.appendChild(p);
          setTimeout(function() { p.remove(); }, 800);
        }, delay * 80);
      })(i);
    }
  }

  // ===== ユーティリティ =====
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toastEl.classList.add('hidden'); toastEl.classList.remove('show'); }, 1600);
  }

  function findEmptyCell() {
    const empties = [];
    for (let i = 1; i < CELLS; i++) {
      if (!state.board[i]) empties.push(i);
    }
    if (empties.length === 0) return -1;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // ===== 描画: トップバー =====
  function renderTopBar() {
    lvVal.textContent = state.level;
    var cur = state.xp;
    var prev = XP_TABLE[state.level - 1] || 0;
    var next = XP_TABLE[state.level] || (cur + 1);
    var pct = Math.max(0, Math.min(100, ((cur - prev) / (next - prev)) * 100));
    xpFill.style.width = pct + '%';
    energyVal.textContent = state.energy;
    energyMaxEl.textContent = state.energyMax;
    starVal.textContent = state.stars;
    renderBoardInfo();
  }

  // ===== 描画: ボード情報バー =====
  function renderBoardInfo() {
    var used = state.board.filter(function(c) { return c !== null; }).length;
    boardCountEl.textContent = used + '/' + CELLS;
    var pct = (used / CELLS) * 100;
    boardUsageFill.style.width = pct + '%';
    boardUsageFill.className = 'board-usage-fill';
    if (pct >= 90) boardUsageFill.classList.add('danger');
    else if (pct >= 70) boardUsageFill.classList.add('warning');
    // エネルギータイマー
    if (state.energy < state.energyMax) {
      var elapsed = Date.now() - state.lastEnergyTime;
      var remain = Math.max(0, 30000 - elapsed);
      var sec = Math.ceil(remain / 1000);
      energyTimerEl.textContent = '⚡回復 ' + sec + 's';
    } else {
      energyTimerEl.textContent = '⚡MAX';
    }
  }

  // ===== 描画: ボード =====
  function renderBoard() {
    boardEl.innerHTML = '';
    for (let i = 0; i < CELLS; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.idx = i;
      const item = state.board[i];
      if (item) {
        const el = document.createElement('div');
        el.className = 'item';
        if (item.chain === 'generator') {
          el.classList.add('generator');
          el.innerHTML = '<span style="font-size:1.5em">📦</span>';
          el.addEventListener('click', handleGenTap);
        } else {
          const t = CHAINS[item.chain].tiers[item.tier - 1];
          el.innerHTML =
            '<span>' + t.emoji + '</span>' +
            '<span class="item-tier">' + item.tier + '</span>';
          el.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            startDrag(e, i, el);
          });
        }
        cell.appendChild(el);
      }
      boardEl.appendChild(cell);
    }
  }

  // ===== ドラッグ&マージ =====
  let drag = null;

  function startDrag(e, fromIdx, itemEl) {
    // 別のドラッグ操作が進行中なら無視（マルチタッチ対策）
    if (drag) return;
    drag = {
      fromIdx: fromIdx,
      el: itemEl,
      startX: e.clientX,
      startY: e.clientY,
    };
    itemEl.classList.add('dragging');
    itemEl.style.transition = 'none';
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
    document.addEventListener('pointercancel', onDragEnd);
  }

  function onDragMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    drag.el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.15)';
    drag.el.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    drag.el.style.pointerEvents = '';
    document.querySelectorAll('.cell.drag-over, .cell.merge-target, .cell.recycle-target').forEach(function(c) {
      c.classList.remove('drag-over', 'merge-target', 'recycle-target');
    });
    if (!target) return;
    const cell = target.closest('.cell');
    if (!cell) return;
    const toIdx = parseInt(cell.dataset.idx, 10);
    if (toIdx === drag.fromIdx) return;
    const from = state.board[drag.fromIdx];
    const to = state.board[toIdx];
    if (to && from && to.chain === from.chain && to.tier === from.tier &&
        to.tier < CHAINS[from.chain].tiers.length) {
      cell.classList.add('merge-target');
    } else if (to && to.chain === 'generator') {
      cell.classList.add('recycle-target');
    } else {
      cell.classList.add('drag-over');
    }
  }

  function onDragEnd(e) {
    if (!drag) return;
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    document.removeEventListener('pointercancel', onDragEnd);
    drag.el.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    drag.el.style.pointerEvents = '';
    const cell = target && target.closest && target.closest('.cell');
    let toIdx = -1;
    if (cell) toIdx = parseInt(cell.dataset.idx, 10);
    const fromIdx = drag.fromIdx;
    drag.el.classList.remove('dragging');
    drag.el.style.transform = '';
    drag.el.style.transition = '';
    drag = null;
    document.querySelectorAll('.cell.drag-over, .cell.merge-target, .cell.recycle-target').forEach(function(c) {
      c.classList.remove('drag-over', 'merge-target', 'recycle-target');
    });
    if (toIdx >= 0) {
      tryMergeOrMove(fromIdx, toIdx);
    }
  }

  function tryMergeOrMove(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    var from = state.board[fromIdx];
    var to = state.board[toIdx];
    if (!from || from.chain === 'generator') return;
    var action = 'move';
    if (!to) {
      // 空セルへ移動
      state.board[toIdx] = from;
      state.board[fromIdx] = null;
    } else if (to.chain === 'generator') {
      // ジェネレーターにドロップ → リサイクル（アイテム売却）
      state.board[fromIdx] = null;
      var refund = Math.max(1, Math.floor(from.tier * from.tier * 0.5));
      state.stars += refund;
      action = 'recycle';
      sfxRecycle();
      toast('♻️ リサイクル ⭐+' + refund);
    } else if (to.chain === from.chain && to.tier === from.tier &&
               to.tier < CHAINS[from.chain].tiers.length) {
      // 同アイテム同士 → マージ進化
      var newTier = from.tier + 1;
      state.board[toIdx] = { chain: from.chain, tier: newTier };
      state.board[fromIdx] = null;
      var key = from.chain + '-' + newTier;
      action = 'merge';
      sfxMerge(newTier);
      if (!state.dex[key]) {
        state.dex[key] = true;
        var t = CHAINS[from.chain].tiers[newTier - 1];
        sfxDiscover();
        toast('✨ ' + t.name + ' 発見!');
      }
      addCombo();
      gainXP(newTier * 3);
    } else {
      // それ以外 → 入れ替え
      state.board[fromIdx] = to;
      state.board[toIdx] = from;
      action = 'swap';
    }
    renderBoard();
    renderOrders();
    renderTopBar();
    save();
    // マージ後のセルにアニメーション
    if (action === 'merge') {
      var mergedCell = boardEl.querySelector('[data-idx="' + toIdx + '"]');
      var mergedItem = mergedCell && mergedCell.querySelector('.item');
      if (mergedItem) mergedItem.classList.add('merged-result');
    }
  }

  // ===== ジェネレーター =====
  function handleGenTap() {
    // タップフィードバック（エネルギー不足でも見せる）
    var genCell = boardEl.querySelector('[data-idx="0"]');
    var genItem = genCell && genCell.querySelector('.item');
    if (genItem) {
      genItem.classList.remove('gen-tap');
      void genItem.offsetWidth;
      genItem.classList.add('gen-tap');
    }
    sfxGenTap();
    if (state.energy < 1) { toast('⚡ エネルギーがたりない！'); return; }
    var idx = findEmptyCell();
    if (idx < 0) { toast('📦 いっぱい！アイテムを📦にドラッグで売れるよ'); return; }
    state.energy -= 1;
    resetCombo();
    var unlocked = getUnlockedChains();
    var chainId = unlocked[Math.floor(Math.random() * unlocked.length)];
    var maxTier = getMaxSpawnTier();
    var tier = 1 + Math.floor(Math.random() * maxTier);
    state.board[idx] = { chain: chainId, tier: tier };
    var key = chainId + '-' + tier;
    state.dex[key] = true;
    renderBoard();
    renderOrders();
    renderTopBar();
    save();
    // スポーンアニメーション＋SE
    var spawnedCell = boardEl.querySelector('[data-idx="' + idx + '"]');
    var spawnedItem = spawnedCell && spawnedCell.querySelector('.item');
    if (spawnedItem) spawnedItem.classList.add('spawning');
    sfxSpawn();
  }

  // ===== エネルギー回復 =====
  function energyTick() {
    const now = Date.now();
    const elapsed = now - state.lastEnergyTime;
    const regenMs = 30000;
    const add = Math.floor(elapsed / regenMs);
    if (add > 0 && state.energy < state.energyMax) {
      state.energy = Math.min(state.energyMax, state.energy + add);
      state.lastEnergyTime = now - (elapsed % regenMs);
      renderTopBar();
      save();
    } else if (state.energy >= state.energyMax) {
      state.lastEnergyTime = now;
    }
  }

  // ===== 注文システム =====
  function generateOrder() {
    const unlocked = getUnlockedChains();
    const chainId = unlocked[Math.floor(Math.random() * unlocked.length)];
    const chain = CHAINS[chainId];
    const maxTier = Math.min(chain.tiers.length - 1, 1 + Math.floor(state.level / 2));
    const minTier = Math.max(1, maxTier - 2);
    const tier = minTier + Math.floor(Math.random() * (maxTier - minTier + 1));
    const stars = Math.max(1, tier * tier);
    const xp = tier * 8 + 4;
    return { chain: chainId, tier: tier, stars: stars, xp: xp };
  }

  function refillOrders() {
    for (let i = 0; i < state.orders.length; i++) {
      if (!state.orders[i]) state.orders[i] = generateOrder();
    }
  }

  function renderOrders() {
    stripEl.innerHTML = '';
    state.orders.forEach(function(order, i) {
      const card = document.createElement('div');
      card.className = 'order-card';
      if (!order) {
        card.innerHTML = '<div class="order-emoji">…</div><div class="order-name">空き</div>';
        stripEl.appendChild(card);
        return;
      }
      const t = CHAINS[order.chain].tiers[order.tier - 1];
      card.innerHTML =
        '<div class="order-emoji">' + t.emoji + '</div>' +
        '<div class="order-name">' + t.name + '</div>' +
        '<div class="order-reward">⭐' + order.stars + '</div>';
      const hasItem = state.board.some(function(c) {
        return c && c.chain === order.chain && c.tier === order.tier;
      });
      if (hasItem) {
        card.classList.add('completed');
        const btn = document.createElement('button');
        btn.className = 'order-claim';
        btn.textContent = '納品';
        btn.addEventListener('click', function() { claimOrder(i); });
        card.appendChild(btn);
      }
      stripEl.appendChild(card);
    });
  }

  function claimOrder(i) {
    var order = state.orders[i];
    if (!order) return;
    var itemIdx = state.board.findIndex(function(c) {
      return c && c.chain === order.chain && c.tier === order.tier;
    });
    if (itemIdx < 0) { toast('該当アイテムなし'); return; }
    // パーティクル演出：注文カードから⭐が飛ぶ
    var orderCards = stripEl.querySelectorAll('.order-card');
    if (orderCards[i]) spawnStarParticles(orderCards[i], Math.min(order.stars, 8));
    sfxClaim();
    state.board[itemIdx] = null;
    state.stars += order.stars;
    gainXP(order.xp);
    state.orders[i] = null;
    toast('⭐+' + order.stars + ' XP+' + order.xp);
    setTimeout(function() {
      if (!state.orders[i]) {
        state.orders[i] = generateOrder();
        renderOrders();
        save();
      }
    }, 1500);
    renderBoard();
    renderOrders();
    renderTopBar();
    renderRoomShop();
    save();
  }

  // ===== XP・レベルアップ =====
  function gainXP(amount) {
    state.xp += amount;
    let leveledUp = false;
    while (state.level < XP_TABLE.length && state.xp >= (XP_TABLE[state.level] || Infinity)) {
      state.level++;
      state.energyMax += 3;
      state.energy = state.energyMax;
      leveledUp = true;
      sfxLevelUp();
      toast('🎉 レベル ' + state.level + ' !');
      if (state.level === 3) showEvent('🎉 家電解放！', '冷蔵庫や洗濯機が出るようになったよ！');
      if (state.level === 5) showEvent('🎉 植物解放！', '種から育てて、グリーンなお部屋にしよう！');
      if (state.level === 7) showEvent('👟 あれ…？', 'なんだか変なものもショップに並び始めたような…？');
      if (state.level === 9) showEvent('🪰 …嫌な予感', 'ショップの品揃えがおかしい。\nこれ、掃除用品じゃなくて…ゴミ…？');
      if (state.level === 11) showEvent('🐀 手遅れかも…', '部屋にネズミが…！\nかにかに、大丈夫…？');
      if (state.level === 13) showEvent('👻 もう引き返せない', 'お部屋が何かに侵食されていく…\nかにかにの目が虚ろだ…。');
      if (state.level === 14) showEvent('🕳️ 虚無の先へ', 'すべてが闇に飲まれていく…\nこれが…かにかにぐらしの末路…？');
    }
    if (leveledUp) {
      renderOrders();
      renderRoomShop();
    }
    renderTopBar();
  }

  // ===== 汚部屋度の計算 =====
  // 0: きれい, 1: 散らかり, 2: 汚い, 3: ゴミ屋敷, 4: 魔境
  function getFilthLevel() {
    var count = state.ownedFurniture.length;
    if (count >= 50) return 4;
    if (count >= 38) return 3;
    if (count >= 26) return 2;
    if (count >= 18) return 1;
    return 0;
  }

  // ===== お部屋 =====
  function renderRoomScene() {
    roomSceneItems.innerHTML = '';
    var filth = getFilthLevel();
    var roomScene = document.getElementById('room-scene');
    var roomWindow = roomScene.querySelector('.room-window');
    var roomKani = roomScene.querySelector('.room-kani');

    // --- 背景の変化 ---
    roomScene.className = 'room-scene';
    if (filth >= 1) roomScene.classList.add('filth-1');
    if (filth >= 2) roomScene.classList.add('filth-2');
    if (filth >= 3) roomScene.classList.add('filth-3');
    if (filth >= 4) roomScene.classList.add('filth-4');

    // --- 窓の変化 ---
    if (filth >= 3) {
      roomWindow.textContent = '💔';  // 窓が割れた
      roomWindow.title = 'ひび割れた窓';
    } else if (filth >= 2) {
      roomWindow.textContent = '🪟';
      roomWindow.style.opacity = '0.5'; // 汚れた窓
    } else {
      roomWindow.textContent = '🪟';
      roomWindow.style.opacity = '';
    }

    // --- かにかにの変化 ---
    if (filth >= 4) {
      roomKani.textContent = '😱'; // もはや恐怖
    } else if (filth >= 3) {
      roomKani.textContent = '😰'; // 困ってる
    } else if (filth >= 2) {
      roomKani.textContent = '😅'; // ちょっと汗
    } else {
      roomKani.textContent = '🦀'; // 元気
    }

    // --- 家具を描画 ---
    state.ownedFurniture.forEach(function(id) {
      const f = FURNITURE_SHOP.find(function(x) { return x.id === id; });
      if (!f) return;
      const el = document.createElement('div');
      el.className = 'room-item';
      el.textContent = f.emoji;
      Object.keys(f.pos).forEach(function(k) {
        el.style[k] = f.pos[k];
      });
      roomSceneItems.appendChild(el);
    });

    // --- 暗闇オーバーレイ ---
    var overlay = roomScene.querySelector('.filth-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'filth-overlay';
      roomScene.appendChild(overlay);
    }
    if (filth >= 4) {
      overlay.style.background = 'rgba(0,0,0,0.55)';
    } else if (filth >= 3) {
      overlay.style.background = 'rgba(0,0,0,0.35)';
    } else if (filth >= 2) {
      overlay.style.background = 'rgba(30,20,0,0.15)';
    } else if (filth >= 1) {
      overlay.style.background = 'rgba(30,20,0,0.05)';
    } else {
      overlay.style.background = 'transparent';
    }

    // --- 汚部屋イベントメッセージ ---
    updateBgmMood(filth);
  }

  function renderRoomShop() {
    roomShopEl.innerHTML = '';
    FURNITURE_SHOP.forEach(function(f) {
      const btn = document.createElement('button');
      btn.className = 'shop-item';
      const owned = state.ownedFurniture.indexOf(f.id) >= 0;
      const locked = state.level < f.lv;
      btn.innerHTML =
        '<div class="shop-emoji">' + f.emoji + '</div>' +
        '<div class="shop-name">' + f.name + '</div>' +
        '<div class="shop-cost">' + (locked ? 'Lv' + f.lv : (owned ? '所持' : '⭐' + f.cost)) + '</div>';
      if (owned) btn.classList.add('owned');
      if (locked || owned || state.stars < f.cost) btn.disabled = true;
      btn.addEventListener('click', function() { buyFurniture(f.id); });
      roomShopEl.appendChild(btn);
    });
  }

  function buyFurniture(id) {
    const f = FURNITURE_SHOP.find(function(x) { return x.id === id; });
    if (!f) return;
    if (state.level < f.lv) { toast('レベル ' + f.lv + ' で解放'); return; }
    if (state.ownedFurniture.indexOf(id) >= 0) return;
    if (state.stars < f.cost) { toast('⭐がたりない'); return; }
    var prevFilth = getFilthLevel();
    state.stars -= f.cost;
    state.ownedFurniture.push(id);
    sfxBuy();
    var newFilth = getFilthLevel();
    // 汚部屋段階が上がったらイベント
    if (newFilth > prevFilth) {
      var filthEvents = [
        null,
        { title: '🧹 あれ…？', desc: 'ちょっと散らかってきたかも…まあ、いっか。' },
        { title: '🪰 うーん…', desc: '部屋がだいぶ散らかってる…掃除？いつかね…。' },
        { title: '🗑️ これは…', desc: '完全にゴミ屋敷だ…！窓にヒビが…！\nかにかにが困ってるよ…！' },
        { title: '☠️ もう手遅れ…？', desc: '部屋が闇に包まれていく…\nかにかにの目が虚ろだ…。' },
      ];
      if (filthEvents[newFilth]) {
        showEvent(filthEvents[newFilth].title, filthEvents[newFilth].desc);
      }
    } else {
      toast('🏠 ' + f.name + ' をおいたよ！');
    }
    renderRoomScene();
    renderRoomShop();
    renderTopBar();
    save();
  }

  // ===== 図鑑 =====
  function renderDex() {
    dexList.innerHTML = '';
    var totalAll = 0, foundAll = 0;
    Object.keys(CHAINS).forEach(function(chainId) {
      var chain = CHAINS[chainId];
      var found = 0;
      chain.tiers.forEach(function(_, i) {
        if (state.dex[chainId + '-' + (i + 1)]) found++;
      });
      totalAll += chain.tiers.length;
      foundAll += found;
      // チェーンヘッダー
      var header = document.createElement('div');
      header.style.cssText = 'grid-column:1/-1;font-size:0.75rem;font-weight:700;color:#7a5a3c;margin-top:8px;display:flex;justify-content:space-between;';
      header.innerHTML = '<span>' + chain.name + '</span><span>' + found + '/' + chain.tiers.length + '</span>';
      dexList.appendChild(header);
      chain.tiers.forEach(function(t, i) {
        var cell = document.createElement('div');
        cell.className = 'dex-cell';
        var key = chainId + '-' + (i + 1);
        if (state.dex[key]) {
          cell.classList.add('discovered');
          cell.innerHTML = '<span title="' + t.name + '">' + t.emoji + '</span>';
          cell.title = t.name + ' (Lv.' + (i + 1) + ')';
        } else {
          cell.classList.add('locked');
        }
        dexList.appendChild(cell);
      });
    });
    // 全体進捗
    var summary = document.createElement('div');
    summary.style.cssText = 'grid-column:1/-1;text-align:center;font-size:0.8rem;color:#7a5a3c;margin-top:12px;font-weight:700;';
    summary.textContent = '全発見: ' + foundAll + ' / ' + totalAll + ' (' + Math.floor(foundAll / totalAll * 100) + '%)';
    dexList.appendChild(summary);
  }

  // ===== モーダル =====
  function showEvent(title, desc) {
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-desc').textContent = desc;
    document.getElementById('event-modal').classList.remove('hidden');
  }

  let tutoStep = 0;
  function showTutorial() {
    if (tutoStep >= TUTORIAL.length) {
      document.getElementById('tuto-modal').classList.add('hidden');
      state.tutoDone = true;
      save();
      return;
    }
    const s = TUTORIAL[tutoStep];
    document.getElementById('tuto-title').textContent = s.title;
    document.getElementById('tuto-text').textContent = s.text;
    document.getElementById('tuto-modal').classList.remove('hidden');
    tutoStep++;
  }

  // ===== タブ切替 =====
  function switchTab(name) {
    document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    if (name === 'board') {
      document.getElementById('board-view').classList.add('active');
    } else if (name === 'room') {
      document.getElementById('room-view').classList.add('active');
      renderRoomScene();
      renderRoomShop();
    } else if (name === 'dex') {
      renderDex();
      document.getElementById('dex-modal').classList.remove('hidden');
      document.getElementById('board-view').classList.add('active');
      document.querySelector('.tab[data-tab="board"]').classList.add('active');
      return;
    }
    document.querySelector('.tab[data-tab="' + name + '"]').classList.add('active');
  }

  // ===== サウンド: BGM＆SE =====
  var sgInstance = null; // SurrealGames.init() の返り値
  var bgmNodes = null;
  var bgmPlaying = false;

  function getSoundSystem() {
    // init()返り値の .sound、またはグローバルの .SoundSystem を探す
    if (sgInstance && sgInstance.sound) return sgInstance.sound;
    var sg = window.SurrealGames;
    if (sg && sg.SoundSystem) return sg.SoundSystem;
    return null;
  }
  function getCtx() {
    try {
      var ss = getSoundSystem();
      if (ss) {
        if (!ss.ctx && ss._ensureCtx) ss._ensureCtx();
        return ss.ctx || null;
      }
    } catch (e) {}
    return null;
  }
  function isMuted() {
    var ss = getSoundSystem();
    return ss ? !ss.enabled : true;
  }

  // --- SE（効果音） ---
  function playTone(freq, dur, type, vol, delay) {
    if (isMuted()) return;
    try {
      var ctx = getCtx(); if (!ctx) return;
      var t = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur);
    } catch (e) {}
  }

  function sfxGenTap() {
    playTone(440, 0.06, 'sine', 0.08);
    playTone(660, 0.06, 'sine', 0.06, 0.04);
  }
  function sfxSpawn() {
    playTone(587, 0.08, 'sine', 0.06);
    playTone(784, 0.1, 'triangle', 0.05, 0.06);
  }
  function sfxMerge(tier) {
    var base = 350 + tier * 60;
    playTone(base, 0.1, 'sine', 0.1);
    playTone(base * 1.25, 0.1, 'sine', 0.08, 0.06);
    playTone(base * 1.5, 0.15, 'triangle', 0.06, 0.12);
  }
  function sfxComboSE(count) {
    for (var i = 0; i < Math.min(count, 5); i++) {
      playTone(600 + i * 150, 0.08, 'triangle', 0.07, i * 0.06);
    }
  }
  function sfxClaim() {
    playTone(523, 0.08, 'sine', 0.08);
    playTone(659, 0.08, 'sine', 0.07, 0.07);
    playTone(784, 0.08, 'sine', 0.06, 0.14);
    playTone(1047, 0.2, 'triangle', 0.08, 0.21);
  }
  function sfxRecycle() {
    playTone(500, 0.15, 'sawtooth', 0.04);
    playTone(300, 0.2, 'sawtooth', 0.03, 0.08);
  }
  function sfxLevelUp() {
    playTone(523, 0.1, 'triangle', 0.1);
    playTone(659, 0.1, 'triangle', 0.09, 0.1);
    playTone(784, 0.1, 'triangle', 0.08, 0.2);
    playTone(1047, 0.3, 'sine', 0.1, 0.3);
    playTone(1319, 0.4, 'sine', 0.08, 0.45);
  }
  function sfxBuy() {
    playTone(880, 0.06, 'sine', 0.07);
    playTone(1109, 0.06, 'sine', 0.06, 0.05);
    playTone(1319, 0.12, 'triangle', 0.07, 0.1);
  }
  function sfxDiscover() {
    playTone(784, 0.15, 'sine', 0.08);
    playTone(988, 0.15, 'sine', 0.07, 0.12);
    playTone(1175, 0.25, 'triangle', 0.09, 0.24);
  }

  // --- BGM（汚部屋度に応じて変化） ---
  var bgmMood = 0; // 現在のBGMムード（0=ほのぼの, 1〜4=不穏）

  // コード進行セット（ムード別）
  var CHORDS_CLEAN = [
    [174.6, 220.0, 261.6, 329.6],  // Fmaj7
    [196.0, 246.9, 293.7, 370.0],  // Gmaj7
    [164.8, 196.0, 246.9, 329.6],  // Em7
    [174.6, 220.0, 261.6, 349.2],  // F6
    [130.8, 164.8, 196.0, 246.9],  // Cmaj7
    [146.8, 185.0, 220.0, 277.2],  // Dm7
    [164.8, 207.7, 246.9, 311.1],  // Em7(alt)
    [196.0, 246.9, 293.7, 370.0],  // Gmaj7
  ];
  var CHORDS_MESSY = [
    [146.8, 185.0, 220.0, 261.6],  // Dm7
    [138.6, 174.6, 207.7, 261.6],  // Dbmaj7
    [130.8, 164.8, 196.0, 233.1],  // Cm7
    [123.5, 155.6, 185.0, 220.0],  // Bm7
    [146.8, 185.0, 220.0, 261.6],  // Dm7
    [116.5, 146.8, 174.6, 220.0],  // Bbmaj7
    [130.8, 164.8, 196.0, 233.1],  // Cm7
    [123.5, 155.6, 185.0, 220.0],  // Bm7
  ];
  var CHORDS_FILTHY = [
    [110.0, 138.6, 164.8, 207.7],  // Am(b5)
    [103.8, 130.8, 155.6, 196.0],  // Abm
    [116.5, 138.6, 174.6, 207.7],  // Bbdim
    [98.0,  123.5, 146.8, 185.0],  // Gm(b5)
    [110.0, 130.8, 164.8, 196.0],  // Am7(b5)
    [103.8, 123.5, 155.6, 185.0],  // Ab dim
    [92.5,  116.5, 138.6, 174.6],  // Gb dim
    [98.0,  116.5, 146.8, 174.6],  // Gm dim
  ];
  var CHORDS_DOOM = [
    [82.4,  103.8, 123.5, 155.6],  // 深い闇
    [77.8,  98.0,  116.5, 146.8],
    [73.4,  92.5,  110.0, 138.6],
    [69.3,  87.3,  103.8, 130.8],
    [82.4,  98.0,  123.5, 146.8],
    [73.4,  87.3,  110.0, 130.8],
    [69.3,  82.4,  103.8, 123.5],
    [65.4,  77.8,  98.0,  116.5],
  ];

  function getChordsForMood(mood) {
    if (mood >= 4) return CHORDS_DOOM;
    if (mood >= 3) return CHORDS_FILTHY;
    if (mood >= 2) return CHORDS_MESSY;
    return CHORDS_CLEAN;
  }

  function updateBgmMood(filth) {
    if (filth === bgmMood) return;
    bgmMood = filth;
    // BGMが鳴っていれば再起動してムード反映
    if (bgmPlaying) {
      stopBGM();
      startBGM();
    }
  }

  function startBGM() {
    if (bgmPlaying) return;
    try {
      var ctx = getCtx(); if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      var master = ctx.createGain();
      master.gain.value = 0.30;
      master.connect(ctx.destination);
      var timers = [];
      var oscs = [];
      var mood = bgmMood;

      // ── パッド（和音） ──
      var chords = getChordsForMood(mood);
      var padFreqs = chords[0];
      var padOscs = [];
      var padGains = [];
      padFreqs.forEach(function(f) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = mood >= 3 ? 'sawtooth' : 'sine';
        o.frequency.value = f;
        g.gain.value = mood >= 3 ? 0.05 : 0.10;
        o.connect(g); g.connect(master);
        o.start(); oscs.push(o); padOscs.push(o); padGains.push(g);
        // 揺らぎ（不穏ほど大きく）
        var lfo = ctx.createOscillator();
        var lfoG = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = mood >= 2 ? (0.15 + Math.random() * 0.3) : (0.08 + Math.random() * 0.08);
        lfoG.gain.value = f * (mood >= 2 ? 0.02 : 0.005);
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        lfo.start(); oscs.push(lfo);
      });

      // パッドの呼吸
      var breathLfo = ctx.createOscillator();
      var breathG = ctx.createGain();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = mood >= 3 ? 0.03 : 0.06;
      breathG.gain.value = mood >= 3 ? 0.08 : 0.04;
      breathLfo.connect(breathG);
      breathG.connect(master.gain);
      breathLfo.start(); oscs.push(breathLfo);

      // ── コード進行 ──
      var chordIdx = 0;
      var chordTimer = setInterval(function() {
        if (!bgmPlaying) return;
        chordIdx = (chordIdx + 1) % chords.length;
        var chord = chords[chordIdx];
        var t = ctx.currentTime;
        padOscs.forEach(function(o, i) {
          o.frequency.linearRampToValueAtTime(chord[i], t + (mood >= 2 ? 5.0 : 3.0));
        });
      }, mood >= 3 ? 8000 : 6000);
      timers.push(chordTimer);

      // ── きらめき / 不気味な音 ──
      var chimeNotes = mood >= 3
        ? [220, 233, 247, 262, 277, 294, 311, 330]  // 低くて不穏
        : mood >= 2
          ? [349, 370, 392, 415, 440, 466, 494, 523] // やや暗い
          : [523, 587, 659, 698, 784, 880, 988, 1047]; // きれい
      function playChime() {
        if (!bgmPlaying || isMuted()) return;
        var t = ctx.currentTime;
        var freq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = mood >= 3 ? 'sawtooth' : 'sine';
        o.frequency.value = freq;
        var vol = mood >= 3 ? 0.03 : 0.06;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + (mood >= 3 ? 3.0 : 2.0));
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + (mood >= 3 ? 3.0 : 2.0));
      }
      function scheduleChime() {
        if (!bgmPlaying) return;
        var interval = mood >= 3 ? (3000 + Math.random() * 5000) : (2000 + Math.random() * 3000);
        timers.push(setTimeout(function() {
          playChime();
          scheduleChime();
        }, interval));
      }
      playChime();
      scheduleChime();

      // ── メロディ ──
      var melodySeq = mood >= 3
        ? [220, 0, 208, 196, 0, 185, 175, 0, 165, 0, 156, 0, 147, 0, 0, 0, 139, 0, 131, 0, 0, 0, 0, 0]
        : mood >= 2
          ? [349, 0, 330, 311, 0, 294, 330, 0, 349, 0, 311, 0, 294, 0, 277, 262, 0, 0, 294, 0, 311, 0, 0, 0]
          : [523, 0, 587, 659, 0, 784, 659, 0, 587, 523, 0, 0, 698, 0, 784, 880, 0, 784, 659, 0, 587, 0, 523, 0];
      var melodyIdx = 0;
      function playMelodyNote() {
        if (!bgmPlaying) return;
        var freq = melodySeq[melodyIdx % melodySeq.length];
        melodyIdx++;
        if (freq > 0 && !isMuted()) {
          var t = ctx.currentTime;
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = mood >= 3 ? 'sawtooth' : 'triangle';
          o.frequency.value = freq;
          var vol = mood >= 3 ? 0.04 : 0.08;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.06);
          g.gain.linearRampToValueAtTime(vol * 0.6, t + 0.6);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(t + 1.8);
        }
        var speed = mood >= 3 ? (1200 + Math.random() * 600) : (900 + Math.random() * 300);
        timers.push(setTimeout(playMelodyNote, speed));
      }
      timers.push(setTimeout(playMelodyNote, 1500));

      // ── ベースライン ──
      var bassNotes = mood >= 3
        ? [55.0, 58.3, 51.9, 55.0, 49.0, 46.2, 51.9, 49.0]  // とても低い不穏なベース
        : mood >= 2
          ? [73.4, 77.8, 69.3, 73.4, 65.4, 61.7, 69.3, 65.4] // やや低い
          : [87.3, 98.0, 82.4, 87.3, 65.4, 73.4, 82.4, 98.0]; // 普通
      var bassIdx = 0;
      var bassTimer = setInterval(function() {
        if (!bgmPlaying || isMuted()) return;
        var freq = bassNotes[bassIdx % bassNotes.length];
        bassIdx++;
        var t = ctx.currentTime;
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = mood >= 3 ? 'sawtooth' : 'sine';
        o.frequency.value = freq;
        var vol = mood >= 3 ? 0.06 : 0.08;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.1);
        g.gain.linearRampToValueAtTime(vol * 0.6, t + 2.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + 5.5);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + 5.5);
      }, mood >= 3 ? 8000 : 6000);
      timers.push(bassTimer);

      // ── 不穏ノイズ層（汚部屋度2以上） ──
      if (mood >= 2) {
        var noiseTimer = setInterval(function() {
          if (!bgmPlaying || isMuted()) return;
          var t = ctx.currentTime;
          var len = ctx.sampleRate * 2;
          var buf = ctx.createBuffer(1, len, ctx.sampleRate);
          var data = buf.getChannelData(0);
          for (var j = 0; j < len; j++) {
            data[j] = (Math.random() * 2 - 1) * 0.015;
          }
          var src = ctx.createBufferSource();
          src.buffer = buf;
          var flt = ctx.createBiquadFilter();
          flt.type = 'lowpass';
          flt.frequency.value = mood >= 4 ? 400 : mood >= 3 ? 300 : 200;
          var ng = ctx.createGain();
          ng.gain.setValueAtTime(0, t);
          ng.gain.linearRampToValueAtTime(mood >= 4 ? 0.12 : mood >= 3 ? 0.06 : 0.03, t + 0.5);
          ng.gain.linearRampToValueAtTime(0, t + 2.0);
          src.connect(flt); flt.connect(ng); ng.connect(master);
          src.start(t); src.stop(t + 2.0);
        }, mood >= 4 ? 3000 : 5000);
        timers.push(noiseTimer);
      }

      // ── 不気味なドローン（汚部屋度3以上） ──
      if (mood >= 3) {
        var droneFreq = mood >= 4 ? 40 : 55;
        var drone = ctx.createOscillator();
        var droneG = ctx.createGain();
        drone.type = 'sawtooth';
        drone.frequency.value = droneFreq;
        droneG.gain.value = mood >= 4 ? 0.06 : 0.03;
        drone.connect(droneG); droneG.connect(master);
        drone.start(); oscs.push(drone);
        // ドローンのうねり
        var droneLfo = ctx.createOscillator();
        var droneLfoG = ctx.createGain();
        droneLfo.type = 'sine';
        droneLfo.frequency.value = 0.05;
        droneLfoG.gain.value = droneFreq * 0.08;
        droneLfo.connect(droneLfoG); droneLfoG.connect(drone.frequency);
        droneLfo.start(); oscs.push(droneLfo);
      }

      bgmNodes = { master: master, oscs: oscs, timers: timers };
      bgmPlaying = true;
    } catch (e) {}
  }

  function stopBGM() {
    if (!bgmNodes) return;
    try {
      bgmNodes.oscs.forEach(function(o) { try { o.stop(); } catch (e) {} });
      bgmNodes.timers.forEach(function(t) { clearTimeout(t); clearInterval(t); });
      bgmNodes.master.disconnect();
    } catch (e) {}
    bgmNodes = null;
    bgmPlaying = false;
  }

  // ===== エントリーポイント =====
  function init() {
    boardEl = document.getElementById('board');
    stripEl = document.getElementById('orders-strip');
    lvVal = document.getElementById('lv-val');
    xpFill = document.getElementById('xp-fill');
    energyVal = document.getElementById('energy-val');
    energyMaxEl = document.getElementById('energy-max');
    starVal = document.getElementById('star-val');
    roomSceneItems = document.getElementById('room-items');
    roomShopEl = document.getElementById('room-shop');
    dexList = document.getElementById('dex-list');
    toastEl = document.getElementById('toast');
    boardCountEl = document.getElementById('board-count');
    boardUsageFill = document.getElementById('board-usage-fill');
    energyTimerEl = document.getElementById('energy-timer');
    comboDisplayEl = document.getElementById('combo-display');

    const saved = load();
    state = saved || createInitialState();
    // 古いセーブのマージ
    if (!state.orders) state.orders = [null, null, null];
    if (!state.ownedFurniture) state.ownedFurniture = [];
    if (!state.dex) state.dex = {};
    if (!state.lastEnergyTime) state.lastEnergyTime = Date.now();
    // ボードのジェネレーターを保証
    if (!state.board[0] || state.board[0].chain !== 'generator') {
      state.board[0] = { chain: 'generator', tier: 1 };
    }

    // オフラインエネルギー回復
    energyTick();
    refillOrders();

    renderBoard();
    renderOrders();
    renderTopBar();

    // タブ
    document.querySelectorAll('.tab').forEach(function(t) {
      t.addEventListener('click', function() { switchTab(t.dataset.tab); });
    });

    // モーダル閉じる
    document.getElementById('dex-close').addEventListener('click', function() {
      document.getElementById('dex-modal').classList.add('hidden');
    });
    document.getElementById('event-close').addEventListener('click', function() {
      document.getElementById('event-modal').classList.add('hidden');
    });
    document.getElementById('tuto-next').addEventListener('click', showTutorial);

    // スタート・リセット
    document.getElementById('start-btn').addEventListener('click', function() {
      document.getElementById('title-screen').classList.remove('active');
      document.getElementById('game-screen').classList.add('active');
      // BGM開始
      startBGM();
      if (!state.tutoDone) {
        tutoStep = 0;
        showTutorial();
      }
    });
    document.getElementById('reset-btn').addEventListener('click', function() {
      if (confirm('最初からやり直しますか？データは消えます。')) {
        resetSave();
        state = createInitialState();
        refillOrders();
        renderBoard();
        renderOrders();
        renderTopBar();
        tutoStep = 0;
        document.getElementById('title-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        showTutorial();
        save();
      }
    });

    // エネルギー回復タイマー
    setInterval(energyTick, 5000);
    // ボード情報バーの毎秒更新（エネルギーカウントダウン）
    setInterval(renderBoardInfo, 1000);

    // ページ離脱時にセーブ＆BGM制御
    window.addEventListener('beforeunload', function() { save(); stopBGM(); });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { save(); stopBGM(); }
      else { energyTick(); startBGM(); }
    });
  }

  // 外部からSurrealGames.init()の返り値を受け取る
  window._kanikaniSetSG = function(instance) {
    sgInstance = instance;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
