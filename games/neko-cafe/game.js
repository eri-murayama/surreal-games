/* ===== ねこカフェ物語 ===== */
(function () {
  'use strict';

  // ===== メニューアイテム定義 =====
  const MENU = [
    { id: 'coffee',    icon: '☕', name: 'コーヒー',     nameEn: 'Coffee',        cost: 0,    cookTime: 2.0, price: 12,  xp: 3,  unlockLv: 1 },
    { id: 'muffin',    icon: '🧁', name: 'マフィン',     nameEn: 'Muffin',        cost: 40,   cookTime: 2.5, price: 20,  xp: 5,  unlockLv: 1 },
    { id: 'tea',       icon: '🍵', name: '抹茶ラテ',     nameEn: 'Matcha Latte',  cost: 100,  cookTime: 3.0, price: 30,  xp: 7,  unlockLv: 2 },
    { id: 'cake',      icon: '🍰', name: 'ケーキ',       nameEn: 'Cake',          cost: 220,  cookTime: 4.0, price: 45,  xp: 9,  unlockLv: 3 },
    { id: 'sandwich',  icon: '🥪', name: 'サンドイッチ', nameEn: 'Sandwich',      cost: 400,  cookTime: 4.5, price: 58,  xp: 11, unlockLv: 4 },
    { id: 'parfait',   icon: '🍨', name: 'パフェ',       nameEn: 'Parfait',       cost: 700,  cookTime: 5.5, price: 80,  xp: 15, unlockLv: 5 },
    { id: 'pasta',     icon: '🍝', name: 'パスタ',       nameEn: 'Pasta',         cost: 1100, cookTime: 6.0, price: 105, xp: 19, unlockLv: 6 },
    { id: 'fish',      icon: '🐟', name: 'お魚プレート', nameEn: 'Fish Plate',    cost: 1800, cookTime: 7.0, price: 145, xp: 25, unlockLv: 7 },
    { id: 'donut',     icon: '🍩', name: 'ドーナツ',     nameEn: 'Donut',         cost: 2800, cookTime: 5.0, price: 165, xp: 28, unlockLv: 8 },
    { id: 'pudding',   icon: '🍮', name: 'ねこプリン',   nameEn: 'Cat Pudding',   cost: 4500, cookTime: 7.5, price: 225, xp: 35, unlockLv: 9 },
  ];

  // ===== 強化アイテム =====
  const UPGRADES = [
    { id: 'table2',  icon: '🪑', name: 'テーブル2席目',   desc: '同時に接客できる席を追加', cost: 60,   effect: { type: 'table', value: 2 } },
    { id: 'table3',  icon: '🪑', name: 'テーブル3席目',   desc: '席を増やして繁盛させよう', cost: 250,  effect: { type: 'table', value: 3 } },
    { id: 'table4',  icon: '🪑', name: 'テーブル4席目',   desc: 'もっとたくさんお客さまを', cost: 800,  effect: { type: 'table', value: 4 } },
    { id: 'table5',  icon: '🪑', name: 'テーブル5席目',   desc: '大繁盛カフェに',           cost: 2200, effect: { type: 'table', value: 5 } },
    { id: 'table6',  icon: '🪑', name: 'テーブル6席目',   desc: 'マックス6席へ',             cost: 5500, effect: { type: 'table', value: 6 } },
    { id: 'speed1',  icon: '⚡', name: '調理スピードUP1', desc: '調理時間を10%短縮',        cost: 350,  effect: { type: 'speed', value: 0.10 } },
    { id: 'speed2',  icon: '⚡', name: '調理スピードUP2', desc: '調理時間をさらに10%短縮',  cost: 1300, effect: { type: 'speed', value: 0.10 } },
    { id: 'speed3',  icon: '⚡', name: '調理スピードUP3', desc: '調理時間をさらに10%短縮',  cost: 3800, effect: { type: 'speed', value: 0.10 } },
    { id: 'tip1',    icon: '💸', name: 'チップ増額1',    desc: '売上+15%',                 cost: 500,  effect: { type: 'tip', value: 0.15 } },
    { id: 'tip2',    icon: '💸', name: 'チップ増額2',    desc: '売上+15%',                 cost: 1800, effect: { type: 'tip', value: 0.15 } },
    { id: 'tip3',    icon: '💸', name: 'チップ増額3',    desc: '売上+20%',                 cost: 4500, effect: { type: 'tip', value: 0.20 } },
    { id: 'patience',icon: '😌', name: 'ふかふか椅子',    desc: 'お客さまの待てる時間+30%', cost: 600,  effect: { type: 'patience', value: 0.30 } },
  ];

  // ===== 内装（デコレーション） =====
  const DECORS = [
    { id: 'curtain',  icon: '🪟', name: 'かわいいカーテン', desc: 'お客さまの来店頻度+10%', cost: 180,  effect: 0.10 },
    { id: 'flowers',  icon: '💐', name: 'お花のブーケ',     desc: 'お客さまの来店頻度+10%', cost: 450,  effect: 0.10 },
    { id: 'lamp',     icon: '🏮', name: 'あたたかランプ',   desc: 'お客さまの来店頻度+15%', cost: 1100, effect: 0.15 },
    { id: 'piano',    icon: '🎹', name: 'おしゃれピアノ',   desc: 'お客さまの来店頻度+20%', cost: 2800, effect: 0.20 },
    { id: 'chandel',  icon: '✨', name: 'シャンデリア',     desc: 'お客さまの来店頻度+25%', cost: 6500, effect: 0.25 },
  ];

  // ===== 猫キャラバリエーション =====
  const CAT_EMOJIS = ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😻', '😽', '🙀'];

  // ===== 営業時間（秒） =====
  const DAY_LENGTH = 90; // 1日 = 90秒

  // ===== ゲーム状態 =====
  const SAVE_KEY = 'neko-cafe-save-v1';
  const state = {
    coins: 0,
    level: 1,
    xp: 0,
    day: 1,
    reputation: 0,
    unlockedMenu: ['coffee'],
    ownedUpgrades: [],
    ownedDecors: [],
    maxTables: 1,
    tutorialDone: false,
    // ランタイム（セーブしない）
    tables: [],
    stations: [],
    selectedStation: -1,
    running: false,
    paused: false,
    dayStats: null,
    dayTimer: 0,
  };

  // ===== DOMヘルパ =====
  const $ = (sel) => document.querySelector(sel);
  function showGame() {
    $('#title-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
  }

  // ===== セーブ / ロード =====
  function save() {
    try {
      const data = {
        coins: state.coins,
        level: state.level,
        xp: state.xp,
        day: state.day,
        reputation: state.reputation,
        unlockedMenu: state.unlockedMenu,
        ownedUpgrades: state.ownedUpgrades,
        ownedDecors: state.ownedDecors,
        maxTables: state.maxTables,
        tutorialDone: state.tutorialDone,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(state, data);
      return true;
    } catch (e) { return false; }
  }
  function reset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    state.coins = 0;
    state.level = 1;
    state.xp = 0;
    state.day = 1;
    state.reputation = 0;
    state.unlockedMenu = ['coffee'];
    state.ownedUpgrades = [];
    state.ownedDecors = [];
    state.maxTables = 1;
    state.tutorialDone = false;
  }

  // ===== 効果音 =====
  function playSound(name) {
    if (typeof SoundSystem !== 'undefined' && SoundSystem.enabled) {
      SoundSystem.play(name);
    }
  }

  // ===== 計算系ヘルパ =====
  function xpForLevel(lv) { return Math.floor(40 * Math.pow(1.3, lv - 1)); }
  function speedMult() {
    let m = 1;
    state.ownedUpgrades.forEach(id => {
      const u = UPGRADES.find(x => x.id === id);
      if (u && u.effect.type === 'speed') m *= (1 - u.effect.value);
    });
    return m;
  }
  function tipMult() {
    let m = 1;
    state.ownedUpgrades.forEach(id => {
      const u = UPGRADES.find(x => x.id === id);
      if (u && u.effect.type === 'tip') m *= (1 + u.effect.value);
    });
    return m;
  }
  function patienceMult() {
    let m = 1;
    state.ownedUpgrades.forEach(id => {
      const u = UPGRADES.find(x => x.id === id);
      if (u && u.effect.type === 'patience') m *= (1 + u.effect.value);
    });
    return m;
  }
  function arrivalMult() {
    let m = 1;
    state.ownedDecors.forEach(id => {
      const d = DECORS.find(x => x.id === id);
      if (d) m *= (1 + d.effect);
    });
    return m;
  }

  // ===== HUD 更新 =====
  function updateHud() {
    $('#coins-display').textContent = state.coins;
    $('#level-display').textContent = state.level;
    $('#day-display').textContent = state.day;
    const need = xpForLevel(state.level);
    const pct = Math.min(100, (state.xp / need) * 100);
    $('#xp-bar').style.width = pct + '%';
    // ショップ内のコイン表示も更新
    const shopC = $('#shop-coin-val');
    const shopC2 = $('#shop-coin-val2');
    if (shopC) shopC.textContent = state.coins;
    if (shopC2) shopC2.textContent = state.coins;
    // 営業タイマー
    updateDayTimer();
  }

  function updateDayTimer() {
    const bar = $('#day-timer-fill');
    if (!bar) return;
    const pct = Math.max(0, (state.dayTimer / DAY_LENGTH) * 100);
    bar.style.width = pct + '%';
    // 残り少なくなったら色変え
    if (pct < 20) {
      bar.style.background = 'var(--cafe-red)';
    } else if (pct < 40) {
      bar.style.background = 'var(--cafe-gold)';
    } else {
      bar.style.background = '';
    }
  }

  // ===== トースト =====
  let toastTimer = null;
  function toast(msg, duration) {
    const el = $('#info-toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), duration || 1600);
  }

  // ===== チュートリアル =====
  let tutorialStep = 0;
  function runTutorial() {
    if (state.tutorialDone) return;
    tutorialStep = 0;
    showTutorialStep();
  }
  function showTutorialStep() {
    const msgs = [
      '☕ キッチンの「コーヒー」をタップして調理開始！',
      '✅ 緑色に光ったら完成！もう一度タップしてね',
      '🐱 注文吹き出しが合うお客さまをタップ！',
    ];
    if (tutorialStep < msgs.length) {
      toast(msgs[tutorialStep], 4000);
    }
    if (tutorialStep >= msgs.length) {
      state.tutorialDone = true;
      save();
    }
  }

  // ===== テーブル初期化 =====
  function buildTables() {
    const wrap = $('#tables-wrap');
    wrap.innerHTML = '';
    const total = 6;
    for (let i = 0; i < total; i++) {
      const slot = document.createElement('div');
      slot.className = 'table-slot';
      if (i >= state.maxTables) {
        slot.classList.add('locked');
      } else {
        // 空席にはテーブル表示
        slot.innerHTML = '<div class="empty-table">🪑</div>';
      }
      slot.dataset.index = i;
      slot.addEventListener('click', () => onTableClick(i));
      wrap.appendChild(slot);
      state.tables[i] = { index: i, el: slot, occupied: false, cat: null };
    }
  }

  // ===== ステーション（キッチン）初期化 =====
  function buildStations() {
    const wrap = $('#stations-wrap');
    wrap.innerHTML = '';
    state.stations = [];
    MENU.forEach((m) => {
      if (!state.unlockedMenu.includes(m.id)) return;
      const el = document.createElement('div');
      el.className = 'station';
      el.dataset.menuId = m.id;
      el.innerHTML = '<span class="st-icon">' + m.icon + '</span>' +
        '<span class="st-name">' + m.name + '</span>' +
        '<span class="st-price">💰' + Math.floor(m.price * tipMult()) + '</span>' +
        '<div class="cook-bar"><div class="cook-bar-fill"></div></div>';
      // 正しいindexをクロージャでキャプチャ
      var idx = state.stations.length;
      el.addEventListener('click', function () { onStationClick(idx); });
      wrap.appendChild(el);
      state.stations.push({ el: el, menuId: m.id, state: 'idle', progress: 0 });
    });
  }

  // ===== 新しいお客さま出現 =====
  function spawnCat() {
    var emptyIdx = -1;
    for (var i = 0; i < state.tables.length; i++) {
      if (i < state.maxTables && !state.tables[i].occupied) {
        emptyIdx = i;
        break;
      }
    }
    if (emptyIdx < 0) return;

    var pool = MENU.filter(function (m) { return state.unlockedMenu.includes(m.id); });
    var wants = pool[Math.floor(Math.random() * pool.length)];

    var table = state.tables[emptyIdx];
    var cat = {
      emoji: CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)],
      wants: wants.id,
      maxPatience: (14 + Math.random() * 6) * patienceMult(),
      patience: 0,
    };
    cat.patience = cat.maxPatience;
    table.occupied = true;
    table.cat = cat;

    var el = table.el;
    el.classList.add('occupied');
    el.innerHTML =
      '<div class="cat-customer">' + cat.emoji + '</div>' +
      '<div class="order-bubble">' + wants.icon + '</div>' +
      '<div class="patience-bar"><div class="patience-fill"></div></div>';

    playSound('tap');
    updateServingHighlights();
  }

  // ===== 配膳ハイライト更新 =====
  function updateServingHighlights() {
    state.tables.forEach(function (t) {
      if (!t.occupied) {
        t.el.classList.remove('serving-hover');
        return;
      }
      if (state.selectedStation >= 0) {
        var st = state.stations[state.selectedStation];
        if (st && st.state === 'ready' && t.cat.wants === st.menuId) {
          t.el.classList.add('serving-hover');
        } else {
          t.el.classList.remove('serving-hover');
        }
      } else {
        t.el.classList.remove('serving-hover');
      }
    });
  }

  // ===== お客さまの待ち時間減少 =====
  function tickCats(dt) {
    state.tables.forEach(function (t) {
      if (!t.occupied) return;
      t.cat.patience -= dt;
      var pct = Math.max(0, (t.cat.patience / t.cat.maxPatience) * 100);
      var fill = t.el.querySelector('.patience-fill');
      if (fill) {
        fill.style.width = pct + '%';
        fill.style.backgroundPosition = (100 - pct) + '% 0';
      }
      if (t.cat.patience <= 0) {
        leaveAngry(t);
      }
    });
  }

  function leaveAngry(t) {
    showPop(t.el, '💢', 'angry-pop');
    state.reputation = Math.max(0, state.reputation - 1);
    state.coins = Math.max(0, state.coins - 3);
    toast('お客さまが帰ってしまった…');
    playSound('tap');
    clearTable(t);
    updateHud();
  }

  function leaveHappy(t, menu) {
    var earn = Math.floor(menu.price * tipMult());
    state.coins += earn;
    state.xp += menu.xp;
    state.reputation += 1;
    if (state.dayStats) {
      state.dayStats.served++;
      state.dayStats.coins += earn;
      state.dayStats.xp += menu.xp;
      state.dayStats.rep += 1;
    }
    showPop(t.el, '💕', 'happy-pop');
    showCoinPop(t.el, '+' + earn);
    playSound('tap');
    checkLevelUp();
    clearTable(t);
    updateHud();
    save();

    // チュートリアル: 初回配膳完了
    if (!state.tutorialDone && tutorialStep === 2) {
      tutorialStep = 3;
      showTutorialStep();
    }
  }

  function clearTable(t) {
    t.occupied = false;
    t.cat = null;
    t.el.classList.remove('occupied', 'serving-hover');
    if (t.index < state.maxTables) {
      t.el.innerHTML = '<div class="empty-table">🪑</div>';
    } else {
      t.el.innerHTML = '';
    }
  }

  function showPop(parent, text, cls) {
    var p = document.createElement('div');
    p.className = cls;
    p.textContent = text;
    parent.appendChild(p);
    setTimeout(function () { p.remove(); }, 1000);
  }
  function showCoinPop(parent, text) {
    var p = document.createElement('div');
    p.className = 'happy-pop';
    p.style.color = '#e6b84e';
    p.style.fontSize = '1.4rem';
    p.style.top = '50%';
    p.textContent = text;
    parent.appendChild(p);
    setTimeout(function () { p.remove(); }, 1000);
  }

  // ===== レベルアップチェック =====
  function checkLevelUp() {
    var need = xpForLevel(state.level);
    while (state.xp >= need) {
      state.xp -= need;
      state.level++;
      toast('🎉 レベルアップ！ Lv.' + state.level, 2500);
      playSound('tap');
      need = xpForLevel(state.level);
    }
  }

  // ===== キッチン操作 =====
  function onStationClick(idx) {
    var st = state.stations[idx];
    if (!st) return;

    if (st.state === 'idle') {
      // 調理開始
      st.state = 'cooking';
      st.progress = 0;
      st.el.classList.add('cooking');
      st.el.classList.remove('ready');
      playSound('tap');

      // チュートリアル: 初回調理
      if (!state.tutorialDone && tutorialStep === 0) {
        tutorialStep = 1;
        setTimeout(showTutorialStep, 800);
      }
    } else if (st.state === 'ready') {
      // 配膳モード: このステーションを選択/解除
      if (state.selectedStation === idx) {
        state.selectedStation = -1;
        st.el.classList.remove('selected');
      } else {
        state.stations.forEach(function (s) { s.el.classList.remove('selected'); });
        state.selectedStation = idx;
        st.el.classList.add('selected');

        // チュートリアル: 完成品選択
        if (!state.tutorialDone && tutorialStep === 1) {
          tutorialStep = 2;
          setTimeout(showTutorialStep, 600);
        } else {
          toast('配膳先のお客さまをタップ！');
        }
      }
      updateServingHighlights();
    }
    // cooking中のタップは無視
  }

  function tickStations(dt) {
    state.stations.forEach(function (st) {
      if (st.state !== 'cooking') return;
      var menu = MENU.find(function (m) { return m.id === st.menuId; });
      var time = menu.cookTime * speedMult();
      st.progress += dt;
      var pct = Math.min(100, (st.progress / time) * 100);
      var bar = st.el.querySelector('.cook-bar-fill');
      if (bar) bar.style.width = pct + '%';
      if (st.progress >= time) {
        st.state = 'ready';
        st.el.classList.remove('cooking');
        st.el.classList.add('ready');
        if (!st.el.querySelector('.ready-badge')) {
          var b = document.createElement('div');
          b.className = 'ready-badge';
          b.textContent = '!';
          st.el.appendChild(b);
        }
        playSound('tap');
      }
    });
  }

  // ===== テーブルクリック：配膳 =====
  function onTableClick(idx) {
    var t = state.tables[idx];
    if (!t || !t.occupied) return;
    if (state.selectedStation < 0) {
      toast('キッチンの完成した料理を選んでね');
      return;
    }
    var st = state.stations[state.selectedStation];
    if (!st || st.state !== 'ready') return;
    var menu = MENU.find(function (m) { return m.id === st.menuId; });
    if (t.cat.wants !== menu.id) {
      toast('注文とちがうみたい…');
      return;
    }
    // 配膳成功
    st.state = 'idle';
    st.progress = 0;
    st.el.classList.remove('ready', 'selected');
    var badge = st.el.querySelector('.ready-badge');
    if (badge) badge.remove();
    var bar = st.el.querySelector('.cook-bar-fill');
    if (bar) bar.style.width = '0%';
    state.selectedStation = -1;
    leaveHappy(t, menu);
    updateServingHighlights();
  }

  // ===== お客さま到来タイマ =====
  var spawnTimer = 0;
  function tickSpawn(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnCat();
      var base = 3.5;
      spawnTimer = (base + Math.random() * 2) / arrivalMult();
    }
  }

  // ===== 営業タイマー =====
  function tickDayTimer(dt) {
    state.dayTimer -= dt;
    updateDayTimer();
    if (state.dayTimer <= 0) {
      state.dayTimer = 0;
      endDay();
    }
  }

  // ===== ゲームループ =====
  var lastTime = 0;
  var rafId = null;
  function loop(ts) {
    if (!state.running) return;
    var dt = Math.min(0.1, (ts - lastTime) / 1000 || 0);
    lastTime = ts;
    if (!state.paused) {
      tickSpawn(dt);
      tickCats(dt);
      tickStations(dt);
      tickDayTimer(dt);
    }
    rafId = requestAnimationFrame(loop);
  }

  function startDay() {
    state.running = true;
    state.paused = false;
    state.dayStats = { served: 0, coins: 0, xp: 0, rep: 0 };
    state.dayTimer = DAY_LENGTH;
    lastTime = performance.now();
    spawnTimer = 1.0;
    // 既存テーブルクリア
    state.tables.forEach(clearTable);
    // ステーション初期化
    state.stations.forEach(function (s) {
      s.state = 'idle';
      s.progress = 0;
      s.el.classList.remove('cooking', 'ready', 'selected');
      var bar = s.el.querySelector('.cook-bar-fill');
      if (bar) bar.style.width = '0%';
      var badge = s.el.querySelector('.ready-badge');
      if (badge) badge.remove();
    });
    state.selectedStation = -1;
    updateHud();
    rafId = requestAnimationFrame(loop);
  }

  function endDay() {
    state.running = false;
    state.paused = false;
    if (rafId) cancelAnimationFrame(rafId);
    // 残っているお客さまを退店（怒りなし）
    state.tables.forEach(function (t) { if (t.occupied) clearTable(t); });
    // 結果表示
    var s = state.dayStats || { served: 0, coins: 0, xp: 0, rep: 0 };
    $('#res-served').textContent = s.served;
    $('#res-coins').textContent = s.coins;
    $('#res-xp').textContent = s.xp;
    $('#res-rep').textContent = s.rep;
    $('#result-screen').classList.remove('hidden');
    playSound('tap');
    save();
  }

  function nextDay() {
    state.day++;
    $('#result-screen').classList.add('hidden');
    save();
    buildStations(); // 新メニュー追加反映
    updateHud();
    startDay();
  }

  // ===== ポーズ（モーダル開閉） =====
  function pauseGame() {
    state.paused = true;
  }
  function resumeGame() {
    state.paused = false;
    lastTime = performance.now(); // dt飛び防止
  }

  // ===== ショップ描画 =====
  var shopTab = 'menu';
  function renderShop() {
    var list = $('#shop-list');
    list.innerHTML = '';
    updateHud();
    if (shopTab === 'menu') {
      MENU.forEach(function (m) {
        if (m.cost === 0) return;
        var owned = state.unlockedMenu.includes(m.id);
        var locked = state.level < m.unlockLv;
        var item = document.createElement('div');
        item.className = 'shop-item' + (owned ? ' owned' : '') + (locked && !owned ? ' locked' : '');
        item.innerHTML =
          '<div class="shop-icon">' + m.icon + '</div>' +
          '<div class="shop-info">' +
            '<div class="shop-name">' + m.name + '</div>' +
            '<div class="shop-desc">売上💰' + m.price + ' / 調理' + m.cookTime + '秒 / 必要Lv.' + m.unlockLv + '</div>' +
          '</div>' +
          '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
            (owned || locked || state.coins < m.cost ? ' disabled' : '') + '>' +
            (owned ? '購入済' : locked ? 'Lv.' + m.unlockLv : '💰' + m.cost) +
          '</button>';
        var btn = item.querySelector('.shop-buy');
        btn.addEventListener('click', function () {
          if (owned || locked || state.coins < m.cost) return;
          state.coins -= m.cost;
          state.unlockedMenu.push(m.id);
          buildStations();
          updateHud();
          save();
          renderShop();
          toast('新メニュー「' + m.name + '」追加！', 2000);
          playSound('tap');
        });
        list.appendChild(item);
      });
    } else {
      UPGRADES.forEach(function (u) {
        if (u.effect.type === 'table' && u.effect.value <= state.maxTables) return;
        var owned = state.ownedUpgrades.includes(u.id);
        var item = document.createElement('div');
        item.className = 'shop-item' + (owned ? ' owned' : '');
        item.innerHTML =
          '<div class="shop-icon">' + u.icon + '</div>' +
          '<div class="shop-info">' +
            '<div class="shop-name">' + u.name + '</div>' +
            '<div class="shop-desc">' + u.desc + '</div>' +
          '</div>' +
          '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
            (owned || state.coins < u.cost ? ' disabled' : '') + '>' +
            (owned ? '購入済' : '💰' + u.cost) +
          '</button>';
        var btn = item.querySelector('.shop-buy');
        btn.addEventListener('click', function () {
          if (owned || state.coins < u.cost) return;
          state.coins -= u.cost;
          state.ownedUpgrades.push(u.id);
          if (u.effect.type === 'table') {
            state.maxTables = u.effect.value;
            buildTables();
          }
          buildStations();
          updateHud();
          save();
          renderShop();
          toast('強化完了！');
          playSound('tap');
        });
        list.appendChild(item);
      });
    }
  }

  function renderMenuBook() {
    var list = $('#menu-list');
    list.innerHTML = '';
    MENU.forEach(function (m) {
      var owned = state.unlockedMenu.includes(m.id);
      var el = document.createElement('div');
      el.className = 'menu-item' + (owned ? '' : ' locked');
      el.innerHTML =
        '<div class="mi-icon">' + m.icon + '</div>' +
        '<div class="mi-body">' +
          '<div class="mi-name">' + (owned ? m.name : '???') + '</div>' +
          '<div class="mi-detail">' + (owned
            ? '💰' + Math.floor(m.price * tipMult()) + ' / ' + m.cookTime + '秒 / ✨' + m.xp
            : '必要Lv.' + m.unlockLv) + '</div>' +
        '</div>';
      list.appendChild(el);
    });
  }

  function renderDecor() {
    var list = $('#decor-list');
    list.innerHTML = '';
    updateHud();
    DECORS.forEach(function (d) {
      var owned = state.ownedDecors.includes(d.id);
      var item = document.createElement('div');
      item.className = 'shop-item' + (owned ? ' owned' : '');
      item.innerHTML =
        '<div class="shop-icon">' + d.icon + '</div>' +
        '<div class="shop-info">' +
          '<div class="shop-name">' + d.name + '</div>' +
          '<div class="shop-desc">' + d.desc + '</div>' +
        '</div>' +
        '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
          (owned || state.coins < d.cost ? ' disabled' : '') + '>' +
          (owned ? '設置済' : '💰' + d.cost) +
        '</button>';
      var btn = item.querySelector('.shop-buy');
      btn.addEventListener('click', function () {
        if (owned || state.coins < d.cost) return;
        state.coins -= d.cost;
        state.ownedDecors.push(d.id);
        updateHud();
        save();
        renderDecor();
        toast('お店がすてきになった！');
        playSound('tap');
      });
      list.appendChild(item);
    });
  }

  // ===== モーダル開閉（ポーズ連動） =====
  function openModal(id) {
    pauseGame();
    $('#' + id).classList.remove('hidden');
  }
  function closeModal(el) {
    el.classList.add('hidden');
    if (state.running) resumeGame();
  }

  // ===== イベント登録 =====
  function bind() {
    $('#start-btn').addEventListener('click', function () {
      reset();
      initGame();
    });
    $('#continue-btn').addEventListener('click', function () {
      initGame();
    });
    $('#reset-btn').addEventListener('click', function () {
      if (confirm('セーブデータを消してはじめから遊びますか？')) {
        reset();
        initGame();
      }
    });

    $('#btn-shop').addEventListener('click', function () {
      shopTab = 'menu';
      document.querySelectorAll('#shop-screen .tab-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.tab === 'menu');
      });
      renderShop();
      openModal('shop-screen');
    });
    $('#btn-menu').addEventListener('click', function () {
      renderMenuBook();
      openModal('menu-screen');
    });
    $('#btn-decor').addEventListener('click', function () {
      renderDecor();
      openModal('decor-screen');
    });
    $('#btn-endday').addEventListener('click', function () {
      endDay();
    });
    $('#next-day-btn').addEventListener('click', nextDay);

    document.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal(btn.closest('.screen'));
      });
    });

    document.querySelectorAll('#shop-screen .tab-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#shop-screen .tab-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        shopTab = b.dataset.tab;
        renderShop();
      });
    });
  }

  // ===== ゲーム初期化 =====
  function initGame() {
    showGame();
    buildTables();
    buildStations();
    updateHud();
    startDay();
    runTutorial();
  }

  // ===== ブート =====
  function boot() {
    bind();
    var hasSave = load();
    if (hasSave) {
      $('#continue-btn').classList.remove('hidden');
      $('#reset-btn').classList.remove('hidden');
    }
    $('#title-screen').classList.remove('hidden');
    $('#game-screen').classList.add('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
