/* ===== ねこカフェ物語 ===== */
(function () {
  'use strict';

  // ===== メニューアイテム定義 =====
  var MENU = [
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
  var UPGRADES = [
    { id: 'table2',  icon: '🪑', name: 'テーブル2席目',   nameEn: '2nd Table',       desc: '同時に接客できる席を追加', descEn: 'Add a seat for more guests',      cost: 60,   effect: { type: 'table', value: 2 } },
    { id: 'table3',  icon: '🪑', name: 'テーブル3席目',   nameEn: '3rd Table',       desc: '席を増やして繁盛させよう', descEn: 'More seats, more business!',      cost: 250,  effect: { type: 'table', value: 3 } },
    { id: 'table4',  icon: '🪑', name: 'テーブル4席目',   nameEn: '4th Table',       desc: 'もっとたくさんお客さまを', descEn: 'Welcome even more guests',        cost: 800,  effect: { type: 'table', value: 4 } },
    { id: 'table5',  icon: '🪑', name: 'テーブル5席目',   nameEn: '5th Table',       desc: '大繁盛カフェに',           descEn: 'A booming cafe!',                 cost: 2200, effect: { type: 'table', value: 5 } },
    { id: 'table6',  icon: '🪑', name: 'テーブル6席目',   nameEn: '6th Table',       desc: 'マックス6席へ',             descEn: 'Maximum 6 seats!',                cost: 5500, effect: { type: 'table', value: 6 } },
    { id: 'speed1',  icon: '⚡', name: '調理スピードUP1', nameEn: 'Speed UP 1',      desc: '調理時間を10%短縮',        descEn: 'Cook 10% faster',                 cost: 350,  effect: { type: 'speed', value: 0.10 } },
    { id: 'speed2',  icon: '⚡', name: '調理スピードUP2', nameEn: 'Speed UP 2',      desc: '調理時間をさらに10%短縮',  descEn: 'Cook another 10% faster',         cost: 1300, effect: { type: 'speed', value: 0.10 } },
    { id: 'speed3',  icon: '⚡', name: '調理スピードUP3', nameEn: 'Speed UP 3',      desc: '調理時間をさらに10%短縮',  descEn: 'Cook even faster!',               cost: 3800, effect: { type: 'speed', value: 0.10 } },
    { id: 'tip1',    icon: '💸', name: 'チップ増額1',    nameEn: 'Tip Boost 1',     desc: '売上+15%',                 descEn: 'Revenue +15%',                    cost: 500,  effect: { type: 'tip', value: 0.15 } },
    { id: 'tip2',    icon: '💸', name: 'チップ増額2',    nameEn: 'Tip Boost 2',     desc: '売上+15%',                 descEn: 'Revenue +15%',                    cost: 1800, effect: { type: 'tip', value: 0.15 } },
    { id: 'tip3',    icon: '💸', name: 'チップ増額3',    nameEn: 'Tip Boost 3',     desc: '売上+20%',                 descEn: 'Revenue +20%',                    cost: 4500, effect: { type: 'tip', value: 0.20 } },
    { id: 'patience',icon: '😌', name: 'ふかふか椅子',    nameEn: 'Comfy Chair',     desc: 'お客さまの待てる時間+30%', descEn: 'Patience +30%',                   cost: 600,  effect: { type: 'patience', value: 0.30 } },
  ];

  // ===== 内装（デコレーション） =====
  var DECORS = [
    { id: 'curtain',  icon: '🪟', name: 'かわいいカーテン', nameEn: 'Cute Curtains',   desc: 'お客さまの来店頻度+10%', descEn: 'Visit rate +10%',  cost: 180,  effect: 0.10 },
    { id: 'flowers',  icon: '💐', name: 'お花のブーケ',     nameEn: 'Flower Bouquet',  desc: 'お客さまの来店頻度+10%', descEn: 'Visit rate +10%',  cost: 450,  effect: 0.10 },
    { id: 'lamp',     icon: '🏮', name: 'あたたかランプ',   nameEn: 'Warm Lamp',       desc: 'お客さまの来店頻度+15%', descEn: 'Visit rate +15%',  cost: 1100, effect: 0.15 },
    { id: 'piano',    icon: '🎹', name: 'おしゃれピアノ',   nameEn: 'Stylish Piano',   desc: 'お客さまの来店頻度+20%', descEn: 'Visit rate +20%',  cost: 2800, effect: 0.20 },
    { id: 'chandel',  icon: '✨', name: 'シャンデリア',     nameEn: 'Chandelier',      desc: 'お客さまの来店頻度+25%', descEn: 'Visit rate +25%',  cost: 6500, effect: 0.25 },
  ];

  // ===== 猫キャラバリエーション =====
  var CAT_EMOJIS = ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😻', '😽', '🙀'];

  // ===== 営業時間（秒） =====
  var DAY_LENGTH = 90;

  // ===== ゲーム状態 =====
  var SAVE_KEY = 'neko-cafe-save-v1';
  var state = {
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
    dayEnding: false, // endDay二重呼び出し防止
  };

  // ===== i18n =====
  var currentLang = 'ja';
  var I18N = {
    ja: {
      gameTitle: 'ねこカフェ<br>物語',
      gameSub: '～小さなお店を大きく育てよう～',
      startBtn: 'はじめる',
      continueBtn: 'つづきから',
      resetBtn: '最初からやり直す',
      resetConfirm: 'セーブデータを消してはじめから遊びますか？',
      timerOpen: '☀️ 営業中',
      kitchenLabel: '🍳 キッチン',
      shopBtn: 'ショップ',
      menuBtn: 'メニュー',
      decorBtn: '内装',
      enddayBtn: '早じまい',
      shopTitle: '🛒 ショップ',
      tabMenu: 'メニュー追加',
      tabUpgrade: 'お店強化',
      menuTitle: '📖 メニューブック',
      decorTitle: '🌸 内装',
      decorSub: 'お店を飾って人気アップ！',
      resultTitle: '🌙 本日のご来店ありがとうございました',
      resServed: '接客したお客さま',
      resPeople: '人',
      resSales: '売上',
      resXp: '経験値',
      resRep: '評判',
      nextDayBtn: '次の日へ',
      toastPickFood: 'キッチンの完成した料理を選んでね',
      toastWrongOrder: '注文とちがうみたい…',
      toastServe: '配膳先のお客さまをタップ！',
      toastAngry: 'お客さまが帰ってしまった…',
      toastNewMenu: '新メニュー「{name}」追加！',
      toastUpgrade: '強化完了！',
      toastDecor: 'お店がすてきになった！',
      splashOpen: '開店！',
      lvUp: 'Lv.{lv} UP!',
      comboText: '{n}コンボ！ +{bonus}',
      shopOwned: '購入済',
      shopDecorOwned: '設置済',
      shopSales: '売上💰{p} / 調理{t}秒 / 必要Lv.{lv}',
      menuLocked: '必要Lv.{lv}',
      resultComment0: 'まだまだこれから！',
      resultComment1: 'なかなかの繁盛ぶり！',
      resultComment2: 'いい調子！もっといけるよ！',
      resultComment3: '素晴らしい一日でした！🎉',
      tutStep0: '☕ キッチンの「コーヒー」をタップして調理開始！',
      tutStep1: '✅ 緑色に光ったら完成！もう一度タップしてね',
      tutStep2: '🐱 注文吹き出しが合うお客さまをタップ！',
    },
    en: {
      gameTitle: 'Neko Cafe<br>Story',
      gameSub: '~Grow your little cafe into something great~',
      startBtn: 'New Game',
      continueBtn: 'Continue',
      resetBtn: 'Start Over',
      resetConfirm: 'Delete save data and start over?',
      timerOpen: '☀️ Open',
      kitchenLabel: '🍳 Kitchen',
      shopBtn: 'Shop',
      menuBtn: 'Menu',
      decorBtn: 'Decor',
      enddayBtn: 'Close',
      shopTitle: '🛒 Shop',
      tabMenu: 'New Menu',
      tabUpgrade: 'Upgrades',
      menuTitle: '📖 Menu Book',
      decorTitle: '🌸 Decor',
      decorSub: 'Decorate to attract more customers!',
      resultTitle: '🌙 Thanks for visiting today!',
      resServed: 'Customers served',
      resPeople: '',
      resSales: 'Revenue',
      resXp: 'EXP',
      resRep: 'Reputation',
      nextDayBtn: 'Next Day',
      toastPickFood: 'Pick a finished dish first',
      toastWrongOrder: "That's not what they ordered…",
      toastServe: 'Tap a customer to serve!',
      toastAngry: 'A customer left upset…',
      toastNewMenu: 'New menu: {name}!',
      toastUpgrade: 'Upgrade complete!',
      toastDecor: 'Your cafe looks lovely!',
      splashOpen: 'Open!',
      lvUp: 'Lv.{lv} UP!',
      comboText: '{n} Combo! +{bonus}',
      shopOwned: 'Owned',
      shopDecorOwned: 'Placed',
      shopSales: '💰{p} / {t}s / Req Lv.{lv}',
      menuLocked: 'Req Lv.{lv}',
      resultComment0: 'Keep going!',
      resultComment1: 'Not bad at all!',
      resultComment2: 'Great day! Keep it up!',
      resultComment3: 'Wonderful day! 🎉',
      tutStep0: '☕ Tap "Coffee" in the kitchen to start cooking!',
      tutStep1: '✅ When it glows green, tap it again!',
      tutStep2: '🐱 Tap a customer whose order matches!',
    }
  };
  function t(key, params) {
    var s = (I18N[currentLang] && I18N[currentLang][key]) || (I18N.ja[key]) || key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        s = s.replace('{' + k + '}', params[k]);
      });
    }
    return s;
  }
  function isEn() { return currentLang === 'en'; }
  function menuName(m) { return isEn() && m.nameEn ? m.nameEn : m.name; }
  function itemName(item) { return isEn() && item.nameEn ? item.nameEn : item.name; }
  function itemDesc(item) { return isEn() && item.descEn ? item.descEn : item.desc; }

  // ===== DOMヘルパ =====
  function $(sel) { return document.querySelector(sel); }
  function showGame() {
    $('#title-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
  }

  // ===== 数値フォーマット =====
  function fmtNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ===== セーブ / ロード =====
  function save() {
    try {
      var data = {
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
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
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
    try {
      if (window.SurrealGames && window.SurrealGames.SoundSystem) {
        window.SurrealGames.SoundSystem.play(name);
      }
    } catch (e) { /* ignore */ }
  }
  function startBgm() {
    try {
      if (window.SurrealGames && window.SurrealGames.SoundSystem) {
        window.SurrealGames.SoundSystem.playBgm('cafe');
      }
    } catch (e) { /* ignore */ }
  }
  function stopBgm() {
    try {
      if (window.SurrealGames && window.SurrealGames.SoundSystem) {
        window.SurrealGames.SoundSystem.stopBgm();
      }
    } catch (e) { /* ignore */ }
  }

  // ===== コンボシステム =====
  var comboCount = 0;
  var comboTimer = null;
  function addCombo() {
    comboCount++;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(function () { comboCount = 0; }, 5000);
    return comboCount;
  }
  function getComboBonus() {
    if (comboCount < 2) return 0;
    return Math.floor(comboCount * 3);
  }

  // ===== 演出: コインバウンス =====
  function bounceCoinHud() {
    var el = $('#coins-display');
    el.classList.remove('bounce');
    void el.offsetWidth; // reflow
    el.classList.add('bounce');
  }

  // ===== 演出: 開店スプラッシュ =====
  function showDaySplash() {
    var splash = document.createElement('div');
    splash.id = 'day-splash';
    splash.innerHTML = '<div class="splash-text">☀️ Day ' + state.day + ' ' + t('splashOpen') + '</div>';
    document.body.appendChild(splash);
    setTimeout(function () { splash.remove(); }, 1800);
  }

  // ===== 演出: レベルアップ =====
  function showLevelUpEffect(newLevel) {
    var overlay = document.createElement('div');
    overlay.id = 'levelup-overlay';
    overlay.innerHTML = '<div class="lvup-star">⭐</div><div class="lvup-text">' + t('lvUp', {lv: newLevel}) + '</div>';
    document.body.appendChild(overlay);
    spawnConfetti(12);
    setTimeout(function () { overlay.remove(); }, 2500);
  }

  // ===== 演出: 紙吹雪 =====
  function spawnConfetti(count) {
    var colors = ['#ffd6e0', '#e6b84e', '#a8d5a8', '#ffa8b6', '#c89b7b', '#ffb6c1'];
    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var c = document.createElement('div');
          c.className = 'confetti';
          c.style.left = (10 + Math.random() * 80) + '%';
          c.style.top = '-10px';
          c.style.background = colors[idx % colors.length];
          c.style.width = (6 + Math.random() * 6) + 'px';
          c.style.height = (6 + Math.random() * 6) + 'px';
          c.style.animationDuration = (1.5 + Math.random()) + 's';
          document.body.appendChild(c);
          setTimeout(function () { c.remove(); }, 2500);
        }, idx * 80);
      })(i);
    }
  }

  // ===== 演出: カフェ背景にデコ表示 =====
  function updateDecorDisplay() {
    var bg = $('#cafe-bg');
    if (!bg) return;
    // 既存デコを削除（最初の3つ=窓・植物・額は残す）
    var existing = bg.querySelectorAll('.bg-decor');
    existing.forEach(function (e) { e.remove(); });
    state.ownedDecors.forEach(function (id) {
      var d = DECORS.find(function (x) { return x.id === id; });
      if (!d) return;
      var el = document.createElement('div');
      el.className = 'bg-decor';
      el.textContent = d.icon;
      bg.appendChild(el);
    });
  }

  // ===== 計算系ヘルパ =====
  function xpForLevel(lv) { return Math.floor(40 * Math.pow(1.3, lv - 1)); }
  function speedMult() {
    var m = 1;
    state.ownedUpgrades.forEach(function (id) {
      var u = UPGRADES.find(function (x) { return x.id === id; });
      if (u && u.effect.type === 'speed') m *= (1 - u.effect.value);
    });
    return m;
  }
  function tipMult() {
    var m = 1;
    state.ownedUpgrades.forEach(function (id) {
      var u = UPGRADES.find(function (x) { return x.id === id; });
      if (u && u.effect.type === 'tip') m *= (1 + u.effect.value);
    });
    return m;
  }
  function patienceMult() {
    var m = 1;
    state.ownedUpgrades.forEach(function (id) {
      var u = UPGRADES.find(function (x) { return x.id === id; });
      if (u && u.effect.type === 'patience') m *= (1 + u.effect.value);
    });
    return m;
  }
  function arrivalMult() {
    var m = 1;
    state.ownedDecors.forEach(function (id) {
      var d = DECORS.find(function (x) { return x.id === id; });
      if (d) m *= (1 + d.effect);
    });
    return m;
  }

  // ===== HUD 更新 =====
  function updateHud() {
    $('#coins-display').textContent = fmtNum(state.coins);
    $('#level-display').textContent = state.level;
    $('#day-display').textContent = state.day;
    var need = xpForLevel(state.level);
    var pct = Math.min(100, (state.xp / need) * 100);
    $('#xp-bar').style.width = pct + '%';
    // ショップ内のコイン表示も更新
    var shopC = $('#shop-coin-val');
    var shopC2 = $('#shop-coin-val2');
    if (shopC) shopC.textContent = fmtNum(state.coins);
    if (shopC2) shopC2.textContent = fmtNum(state.coins);
    // 営業タイマー
    updateDayTimer();
  }

  function updateDayTimer() {
    var bar = $('#day-timer-fill');
    if (!bar) return;
    var pct = Math.max(0, (state.dayTimer / DAY_LENGTH) * 100);
    bar.style.width = pct + '%';
    var label = $('.timer-label');
    var isUrgent = pct < 20;
    if (pct < 20) {
      bar.style.background = 'var(--cafe-red)';
    } else if (pct < 40) {
      bar.style.background = 'var(--cafe-gold)';
    } else {
      bar.style.background = '';
    }
    if (label) label.classList.toggle('urgent', isUrgent);
    bar.classList.toggle('urgent', isUrgent);
  }

  // ===== トースト =====
  var toastTimer = null;
  function toast(msg, duration) {
    var el = $('#info-toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, duration || 1600);
  }

  // ===== チュートリアル =====
  var tutorialStep = 0;
  function runTutorial() {
    if (state.tutorialDone) return;
    tutorialStep = 0;
    showTutorialStep();
  }
  function showTutorialStep() {
    var msgs = [t('tutStep0'), t('tutStep1'), t('tutStep2')];
    if (tutorialStep < msgs.length) {
      toast(msgs[tutorialStep], 4000);
    }
    if (tutorialStep >= msgs.length) {
      state.tutorialDone = true;
      save();
    }
  }

  // ===== テーブル初期化（既存のお客さまを保持） =====
  function buildTables() {
    var wrap = $('#tables-wrap');
    // 既存のお客さま情報を保持
    var oldCustomers = [];
    state.tables.forEach(function (t) {
      if (t.occupied && t.cat) {
        oldCustomers.push({ index: t.index, cat: t.cat });
      }
    });

    wrap.innerHTML = '';
    var total = 6;
    for (var i = 0; i < total; i++) {
      var slot = document.createElement('div');
      slot.className = 'table-slot';
      if (i >= state.maxTables) {
        slot.classList.add('locked');
      } else {
        slot.innerHTML = '<div class="empty-table">🪑</div>';
      }
      slot.dataset.index = i;
      (function (idx) {
        slot.addEventListener('click', function () { onTableClick(idx); });
      })(i);
      wrap.appendChild(slot);
      state.tables[i] = { index: i, el: slot, occupied: false, cat: null };
    }

    // 既存のお客さまを復元
    oldCustomers.forEach(function (oc) {
      if (oc.index >= state.maxTables) return; // 席が減った場合（通常ないが安全策）
      var table = state.tables[oc.index];
      var cat = oc.cat;
      var wants = MENU.find(function (m) { return m.id === cat.wants; });
      if (!wants) return;
      table.occupied = true;
      table.cat = cat;
      table.el.classList.add('occupied');
      table.el.innerHTML =
        '<div class="cat-customer">' + cat.emoji + '</div>' +
        '<div class="order-bubble">' + wants.icon + '</div>' +
        '<div class="patience-bar"><div class="patience-fill"></div></div>';
      // 忍耐ゲージも復元
      var pct = Math.max(0, (cat.patience / cat.maxPatience) * 100);
      var fill = table.el.querySelector('.patience-fill');
      if (fill) {
        fill.style.width = pct + '%';
        fill.style.backgroundPosition = (100 - pct) + '% 0';
      }
    });
  }

  // ===== ステーション（キッチン）初期化 =====
  function buildStations() {
    var wrap = $('#stations-wrap');
    wrap.innerHTML = '';
    state.stations = [];
    MENU.forEach(function (m) {
      if (!state.unlockedMenu.includes(m.id)) return;
      var el = document.createElement('div');
      el.className = 'station';
      el.dataset.menuId = m.id;
      el.innerHTML = '<span class="st-icon">' + m.icon + '</span>' +
        '<span class="st-name">' + menuName(m) + '</span>' +
        '<span class="st-price">💰' + Math.floor(m.price * tipMult()) + '</span>' +
        '<div class="cook-bar"><div class="cook-bar-fill"></div></div>';
      var idx = state.stations.length;
      (function (i) {
        el.addEventListener('click', function () { onStationClick(i); });
      })(idx);
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

    playSound('modal_open');
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
    toast(t('toastAngry'));
    playSound('wrong');
    clearTable(t);
    updateHud();
  }

  function leaveHappy(t, menu) {
    var earn = Math.floor(menu.price * tipMult());
    var combo = addCombo();
    var bonus = getComboBonus();
    earn += bonus;
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
    showCoinPop(t.el, '+' + fmtNum(earn));
    if (combo >= 2) {
      showComboPop(t.el, combo, bonus);
    }
    bounceCoinHud();
    playSound('correct');
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

  function showComboPop(parent, combo, bonus) {
    var p = document.createElement('div');
    p.className = 'combo-pop';
    p.textContent = t('comboText', {n: combo, bonus: bonus});
    parent.appendChild(p);
    setTimeout(function () { p.remove(); }, 1200);
  }

  // ===== レベルアップチェック =====
  function checkLevelUp() {
    var need = xpForLevel(state.level);
    while (state.xp >= need) {
      state.xp -= need;
      state.level++;
      showLevelUpEffect(state.level);
      playSound('achievement');
      need = xpForLevel(state.level);
    }
  }

  // ===== キッチン操作 =====
  function onStationClick(idx) {
    var st = state.stations[idx];
    if (!st) return;

    if (st.state === 'idle') {
      st.state = 'cooking';
      st.progress = 0;
      st.el.classList.add('cooking');
      st.el.classList.remove('ready');
      playSound('tap'); // 調理開始

      if (!state.tutorialDone && tutorialStep === 0) {
        tutorialStep = 1;
        setTimeout(showTutorialStep, 800);
      }
    } else if (st.state === 'ready') {
      if (state.selectedStation === idx) {
        state.selectedStation = -1;
        st.el.classList.remove('selected');
      } else {
        state.stations.forEach(function (s) { s.el.classList.remove('selected'); });
        state.selectedStation = idx;
        st.el.classList.add('selected');

        if (!state.tutorialDone && tutorialStep === 1) {
          tutorialStep = 2;
          setTimeout(showTutorialStep, 600);
        } else {
          toast(t('toastServe'));
        }
      }
      updateServingHighlights();
    }
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
        playSound('pickup');
      }
    });
  }

  // ===== テーブルクリック：配膳 =====
  function onTableClick(idx) {
    var t = state.tables[idx];
    if (!t) return;
    // ロック席は無視
    if (idx >= state.maxTables) return;
    if (!t.occupied) return;
    if (state.selectedStation < 0) {
      toast(t('toastPickFood'));
      return;
    }
    var st = state.stations[state.selectedStation];
    if (!st || st.state !== 'ready') return;
    var menu = MENU.find(function (m) { return m.id === st.menuId; });
    if (t.cat.wants !== menu.id) {
      toast(t('toastWrongOrder'));
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
    state.dayEnding = false;
    state.dayStats = { served: 0, coins: 0, xp: 0, rep: 0 };
    state.dayTimer = DAY_LENGTH;
    lastTime = performance.now();
    spawnTimer = 1.5;
    comboCount = 0;
    showDaySplash();
    updateDecorDisplay();
    startBgm();
    playSound('start');
    state.tables.forEach(clearTable);
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
    // 二重呼び出し防止
    if (state.dayEnding) return;
    state.dayEnding = true;
    state.running = false;
    state.paused = false;
    if (rafId) cancelAnimationFrame(rafId);
    stopBgm();
    state.tables.forEach(function (t) { if (t.occupied) clearTable(t); });
    var s = state.dayStats || { served: 0, coins: 0, xp: 0, rep: 0 };
    $('#res-served').textContent = s.served;
    $('#res-coins').textContent = fmtNum(s.coins);
    $('#res-xp').textContent = s.xp;
    $('#res-rep').textContent = s.rep;
    // スター評価
    var stars = 0;
    if (s.served >= 1) stars = 1;
    if (s.served >= 3) stars = 2;
    if (s.served >= 6) stars = 3;
    var starsHtml = '';
    for (var i = 0; i < 3; i++) {
      starsHtml += i < stars
        ? '<span class="star-on">⭐</span>'
        : '<span style="opacity:0.25">☆</span>';
    }
    $('#res-stars').innerHTML = starsHtml;
    $('#res-comment').textContent = t('resultComment' + stars);
    $('#result-screen').classList.remove('hidden');
    playSound('result');
    save();
  }

  function nextDay() {
    state.day++;
    $('#result-screen').classList.add('hidden');
    save();
    buildStations();
    updateHud();
    startDay();
  }

  // ===== ポーズ（モーダル開閉） =====
  function pauseGame() {
    state.paused = true;
  }
  function resumeGame() {
    state.paused = false;
    lastTime = performance.now();
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
            '<div class="shop-name">' + menuName(m) + '</div>' +
            '<div class="shop-desc">' + t('shopSales', {p: m.price, t: m.cookTime, lv: m.unlockLv}) + '</div>' +
          '</div>' +
          '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
            (owned || locked || state.coins < m.cost ? ' disabled' : '') + '>' +
            (owned ? t('shopOwned') : locked ? 'Lv.' + m.unlockLv : '💰' + fmtNum(m.cost)) +
          '</button>';
        var btn = item.querySelector('.shop-buy');
        btn.addEventListener('click', function () {
          if (state.unlockedMenu.includes(m.id)) return;
          if (state.level < m.unlockLv) return;
          if (state.coins < m.cost) return;
          state.coins -= m.cost;
          state.unlockedMenu.push(m.id);
          buildStations();
          updateHud();
          save();
          renderShop();
          toast(t('toastNewMenu', {name: menuName(m)}), 2000);
          spawnConfetti(6);
          playSound('unlock');
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
            '<div class="shop-name">' + itemName(u) + '</div>' +
            '<div class="shop-desc">' + itemDesc(u) + '</div>' +
          '</div>' +
          '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
            (owned || state.coins < u.cost ? ' disabled' : '') + '>' +
            (owned ? t('shopOwned') : '💰' + fmtNum(u.cost)) +
          '</button>';
        var btn = item.querySelector('.shop-buy');
        btn.addEventListener('click', function () {
          if (state.ownedUpgrades.includes(u.id)) return;
          if (state.coins < u.cost) return;
          state.coins -= u.cost;
          state.ownedUpgrades.push(u.id);
          if (u.effect.type === 'table') {
            state.maxTables = u.effect.value;
            buildTables(); // お客さま保持して再構築
          }
          buildStations();
          updateHud();
          save();
          renderShop();
          toast(t('toastUpgrade'));
          playSound('unlock');
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
          '<div class="mi-name">' + (owned ? menuName(m) : '???') + '</div>' +
          '<div class="mi-detail">' + (owned
            ? '💰' + Math.floor(m.price * tipMult()) + ' / ' + m.cookTime + 's / ✨' + m.xp
            : t('menuLocked', {lv: m.unlockLv})) + '</div>' +
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
          '<div class="shop-name">' + itemName(d) + '</div>' +
          '<div class="shop-desc">' + itemDesc(d) + '</div>' +
        '</div>' +
        '<button class="shop-buy' + (owned ? ' owned' : '') + '"' +
          (owned || state.coins < d.cost ? ' disabled' : '') + '>' +
          (owned ? t('shopDecorOwned') : '💰' + fmtNum(d.cost)) +
        '</button>';
      var btn = item.querySelector('.shop-buy');
      btn.addEventListener('click', function () {
        if (state.ownedDecors.includes(d.id)) return;
        if (state.coins < d.cost) return;
        state.coins -= d.cost;
        state.ownedDecors.push(d.id);
        updateHud();
        updateDecorDisplay();
        save();
        renderDecor();
        toast(t('toastDecor'));
        spawnConfetti(8);
        playSound('unlock');
      });
      list.appendChild(item);
    });
  }

  // ===== モーダル開閉（ポーズ連動 + 背景クリックで閉じる） =====
  function openModal(id) {
    pauseGame();
    playSound('modal_open');
    var modal = $('#' + id);
    modal.classList.remove('hidden');
    // 背景オーバーレイ
    var existing = document.getElementById('modal-overlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.addEventListener('click', function () {
      closeModal(modal);
    });
    document.body.appendChild(overlay);
  }
  function closeModal(el) {
    el.classList.add('hidden');
    playSound('modal_close');
    var overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
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
      if (confirm(t('resetConfirm'))) {
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

    // タブ切替・閉じ時に自動セーブ
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        save();
      }
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

  // ===== 言語切替対応 =====
  function onLangChange(lang) {
    currentLang = lang;
    // ステーション名を再描画
    if (state.running || state.dayEnding) {
      buildStations();
    }
  }

  // ===== ブート =====
  function boot() {
    // i18n初期化
    if (window.SurrealI18n) {
      SurrealI18n.init(I18N);
      currentLang = SurrealI18n.getLang ? SurrealI18n.getLang() : 'ja';
    }
    // 言語変更リスナー
    window.addEventListener('surreal-lang-change', function (e) {
      onLangChange(e.detail.lang);
    });

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
