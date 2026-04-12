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
  const XP_TABLE = [0, 40, 100, 180, 290, 430, 600, 800, 1040, 1320, 1640, 2000, 2400, 2900, 3500];
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
  const FURNITURE_SHOP = [
    { id: 'rug',      emoji: '🟫', name: 'ラグ',     cost: 5,  lv: 1,  pos: { bottom: '10%', left: '32%', fontSize: '3.2em' } },
    { id: 'lamp',     emoji: '💡', name: 'ランプ',   cost: 6,  lv: 1,  pos: { top: '48%', right: '16%' } },
    { id: 'bed',      emoji: '🛏️', name: 'ベッド',   cost: 10, lv: 1,  pos: { top: '42%', left: '8%' } },
    { id: 'sofa',     emoji: '🛋️', name: 'ソファ',   cost: 12, lv: 2,  pos: { bottom: '22%', left: '38%' } },
    { id: 'table',    emoji: '🪵', name: 'テーブル', cost: 10, lv: 2,  pos: { bottom: '26%', right: '28%' } },
    { id: 'plant',    emoji: '🪴', name: '観葉植物', cost: 14, lv: 2,  pos: { bottom: '16%', right: '6%' } },
    { id: 'tv',       emoji: '📺', name: 'テレビ',   cost: 18, lv: 3,  pos: { top: '38%', right: '42%' } },
    { id: 'shelf',    emoji: '📚', name: '本だな',   cost: 20, lv: 3,  pos: { top: '30%', left: '35%' } },
    { id: 'painting', emoji: '🖼️', name: '絵画',     cost: 22, lv: 3,  pos: { top: '14%', left: '42%' } },
    { id: 'desk',     emoji: '🪑', name: 'デスク',   cost: 16, lv: 4,  pos: { bottom: '28%', left: '10%' } },
    { id: 'game',     emoji: '🎮', name: 'ゲーム機', cost: 18, lv: 4,  pos: { bottom: '32%', left: '22%' } },
    { id: 'fridge',   emoji: '🧊', name: '冷蔵庫',   cost: 26, lv: 4,  pos: { top: '44%', right: '6%' } },
    { id: 'washer',   emoji: '🫧', name: '洗濯機',   cost: 24, lv: 5,  pos: { top: '48%', right: '28%' } },
    { id: 'cat',      emoji: '🐈', name: 'ねこ',     cost: 35, lv: 5,  pos: { bottom: '14%', left: '58%' } },
    { id: 'tree',     emoji: '🌳', name: '大きな木', cost: 40, lv: 6,  pos: { bottom: '20%', right: '42%' } },
    { id: 'piano',    emoji: '🎹', name: 'ピアノ',   cost: 45, lv: 7,  pos: { top: '40%', left: '48%' } },
    { id: 'fish',     emoji: '🐠', name: '水槽',     cost: 30, lv: 6,  pos: { top: '50%', left: '22%' } },
    { id: 'star',     emoji: '✨', name: '星あかり', cost: 50, lv: 8,  pos: { top: '6%', right: '44%' } },
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

  // ===== ユーティリティ =====
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 1600);
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
    const cur = state.xp;
    const prev = XP_TABLE[state.level - 1] || 0;
    const next = XP_TABLE[state.level] || (cur + 1);
    const pct = Math.max(0, Math.min(100, ((cur - prev) / (next - prev)) * 100));
    xpFill.style.width = pct + '%';
    energyVal.textContent = state.energy;
    energyMaxEl.textContent = state.energyMax;
    starVal.textContent = state.stars;
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
      c.classList.remove('drag-over', 'merge-target');
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
    drag.el.style.pointerEvents = '';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const cell = target && target.closest && target.closest('.cell');
    let toIdx = -1;
    if (cell) toIdx = parseInt(cell.dataset.idx, 10);
    const fromIdx = drag.fromIdx;
    drag.el.classList.remove('dragging');
    drag.el.style.transform = '';
    drag = null;
    document.querySelectorAll('.cell.drag-over, .cell.merge-target, .cell.recycle-target').forEach(function(c) {
      c.classList.remove('drag-over', 'merge-target');
    });
    if (toIdx >= 0) {
      tryMergeOrMove(fromIdx, toIdx);
    }
  }

  function tryMergeOrMove(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    const from = state.board[fromIdx];
    const to = state.board[toIdx];
    if (!from || from.chain === 'generator') return;
    if (!to) {
      // 空セルへ移動
      state.board[toIdx] = from;
      state.board[fromIdx] = null;
    } else if (to.chain === 'generator') {
      // ジェネレーターにドロップ → リサイクル（アイテム売却）
      state.board[fromIdx] = null;
      const refund = Math.max(1, Math.floor(from.tier * from.tier * 0.5));
      state.stars += refund;
      toast('♻️ リサイクル ⭐+' + refund);
    } else if (to.chain === from.chain && to.tier === from.tier &&
               to.tier < CHAINS[from.chain].tiers.length) {
      // 同アイテム同士 → マージ進化
      const newTier = from.tier + 1;
      state.board[toIdx] = { chain: from.chain, tier: newTier };
      state.board[fromIdx] = null;
      const key = from.chain + '-' + newTier;
      if (!state.dex[key]) {
        state.dex[key] = true;
        const t = CHAINS[from.chain].tiers[newTier - 1];
        toast('✨ ' + t.name + ' 発見!');
      }
      gainXP(newTier * 3);
    } else {
      // それ以外 → 入れ替え
      state.board[fromIdx] = to;
      state.board[toIdx] = from;
    }
    renderBoard();
    renderOrders();
    renderTopBar();
    save();
  }

  // ===== ジェネレーター =====
  function handleGenTap() {
    if (state.energy < 1) { toast('⚡ エネルギーがたりない！'); return; }
    const idx = findEmptyCell();
    if (idx < 0) { toast('📦 いっぱい！アイテムを📦にドラッグで売れるよ'); return; }
    state.energy -= 1;
    const unlocked = getUnlockedChains();
    const chainId = unlocked[Math.floor(Math.random() * unlocked.length)];
    const maxTier = getMaxSpawnTier();
    const tier = 1 + Math.floor(Math.random() * maxTier);
    state.board[idx] = { chain: chainId, tier: tier };
    const key = chainId + '-' + tier;
    state.dex[key] = true;
    renderBoard();
    renderOrders();
    renderTopBar();
    save();
    // スポーンアニメーション
    const spawnedCell = boardEl.querySelector('[data-idx="' + idx + '"]');
    const spawnedItem = spawnedCell && spawnedCell.querySelector('.item');
    if (spawnedItem) spawnedItem.classList.add('spawning');
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
    const order = state.orders[i];
    if (!order) return;
    const itemIdx = state.board.findIndex(function(c) {
      return c && c.chain === order.chain && c.tier === order.tier;
    });
    if (itemIdx < 0) { toast('該当アイテムなし'); return; }
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
      toast('🎉 レベル ' + state.level + ' !');
      if (state.level === 3) showEvent('🎉 家電解放！', '冷蔵庫や洗濯機が出るようになったよ！');
      if (state.level === 5) showEvent('🎉 植物解放！', '種から育てて、グリーンなお部屋にしよう！');
      if (state.level === 7) showEvent('🎉 エネルギー上限アップ！', 'たくさん探索できるね。');
    }
    if (leveledUp) {
      renderOrders();
      renderRoomShop();
    }
    renderTopBar();
  }

  // ===== お部屋 =====
  function renderRoomScene() {
    roomSceneItems.innerHTML = '';
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
    state.stars -= f.cost;
    state.ownedFurniture.push(id);
    toast('🏠 ' + f.name + ' をおいたよ！');
    renderRoomScene();
    renderRoomShop();
    renderTopBar();
    save();
  }

  // ===== 図鑑 =====
  function renderDex() {
    dexList.innerHTML = '';
    Object.keys(CHAINS).forEach(function(chainId) {
      const chain = CHAINS[chainId];
      chain.tiers.forEach(function(t, i) {
        const cell = document.createElement('div');
        cell.className = 'dex-cell';
        const key = chainId + '-' + (i + 1);
        if (state.dex[key]) {
          cell.classList.add('discovered');
          cell.innerHTML = t.emoji;
          cell.title = t.name;
        } else {
          cell.classList.add('locked');
        }
        dexList.appendChild(cell);
      });
    });
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

    // ページ離脱時にセーブ
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) save();
      else energyTick();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
