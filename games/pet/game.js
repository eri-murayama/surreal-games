/* ===== シュールペット～ナゾの生きもの育成記～ ===== */

(function () {
  'use strict';

  /* ---------- ペット定義 ---------- */
  const PETS = {
    egg:     { emoji: '🥚', name: 'ナゾのタマゴ', stage: 0, desc: 'なにかが中でうごいている…' },
    blob:    { emoji: '🫠', name: 'とろりん', stage: 1, desc: 'とろとろしたナゾの生きもの。' },
    slime:   { emoji: '🟢', name: 'ぷるぷる', stage: 1, desc: '弾力がすごい。' },
    puff:    { emoji: '🧁', name: 'ふわもち', stage: 1, desc: 'カップケーキ？いいえ、生きものです。' },
    cactus:  { emoji: '🌵', name: 'トゲまる', stage: 2, desc: 'なぜか歩く。水をあげるとよろこぶ。' },
    octo:    { emoji: '🐙', name: 'タコすけ', stage: 2, desc: '足が多すぎる。でもかわいい。' },
    ghost:   { emoji: '👻', name: 'もやもや', stage: 2, desc: '実体がない。でもごはんは食べる。' },
    mushroom:{ emoji: '🍄', name: 'きのこ先輩', stage: 2, desc: '先輩風をふかせてくる。' },
    dragon:  { emoji: '🐉', name: 'りゅうたろう', stage: 3, desc: '大きくなったなあ…。火はふけない。' },
    alien:   { emoji: '👽', name: 'うちゅうの子', stage: 3, desc: '故郷の星をなつかしがっている。' },
    robot:   { emoji: '🤖', name: 'ガチャメカ', stage: 3, desc: '機械なのに腹が減るらしい。' },
    unicorn: { emoji: '🦄', name: 'にじいろ', stage: 3, desc: '虹色に輝く伝説の生きもの。' },
    phoenix: { emoji: '🔥', name: 'もえもえ鳥', stage: 4, desc: '不死鳥。でもおなかはすく。' },
    kraken:  { emoji: '🦑', name: 'ダイオウ', stage: 4, desc: '海の王になった。部屋は狭い。' },
    cosmos:  { emoji: '🌌', name: 'コスモス', stage: 4, desc: '宇宙そのもの。哲学的な存在。' },
    cat:     { emoji: '🐱', name: 'ふつうのねこ', stage: 4, desc: '結局ねこが一番シュール。' },
  };

  /* ---------- 進化ツリー ---------- */
  const EVOLUTION = {
    egg: {
      happy: 'blob',    // 幸福度高い
      hungry: 'slime',  // 空腹度低い
      default: 'puff',
    },
    blob: { happy: 'octo', clean: 'ghost', default: 'cactus' },
    slime: { happy: 'mushroom', hungry: 'cactus', default: 'octo' },
    puff: { happy: 'ghost', clean: 'mushroom', default: 'octo' },
    cactus: { happy: 'unicorn', clean: 'robot', default: 'dragon' },
    octo: { happy: 'kraken', hungry: 'alien', default: 'dragon' },
    ghost: { happy: 'cosmos', clean: 'alien', default: 'robot' },
    mushroom: { happy: 'phoenix', hungry: 'dragon', default: 'unicorn' },
    dragon: { default: 'phoenix' },
    alien: { default: 'cosmos' },
    robot: { default: 'cosmos' },
    unicorn: { default: 'phoenix' },
  };

  const EXP_TO_EVOLVE = [0, 100, 300, 600, 1000];

  /* ---------- 食べ物定義 ---------- */
  const FOODS = [
    { id: 'bread',    emoji: '🍞', name: 'パン',         hunger: 15, happy: 2,  price: 0,  desc: 'ふつうのパン' },
    { id: 'rice',     emoji: '🍙', name: 'おにぎり',     hunger: 20, happy: 5,  price: 0,  desc: 'しおにぎり' },
    { id: 'meat',     emoji: '🍖', name: 'にく',         hunger: 35, happy: 10, price: 10, desc: 'がっつり！' },
    { id: 'cake',     emoji: '🎂', name: 'ケーキ',       hunger: 10, happy: 25, price: 20, desc: 'きげんアップ！' },
    { id: 'sushi',    emoji: '🍣', name: 'おすし',       hunger: 30, happy: 20, price: 30, desc: '高級なおすし' },
    { id: 'curry',    emoji: '🍛', name: 'カレー',       hunger: 40, happy: 15, price: 25, desc: 'スパイシー！' },
    { id: 'ramen',    emoji: '🍜', name: 'ラーメン',     hunger: 45, happy: 20, price: 35, desc: 'こってり味' },
    { id: 'parfait',  emoji: '🍨', name: 'パフェ',       hunger: 5,  happy: 40, price: 50, desc: 'しあわせの味' },
    { id: 'rainbow',  emoji: '🌈', name: 'にじいろゼリー', hunger: 20, happy: 30, price: 80, desc: '7色に光る！' },
    { id: 'star',     emoji: '⭐', name: 'ほしのかけら', hunger: 50, happy: 50, price: 150, desc: '宇宙の味がする' },
  ];

  /* ---------- ショップアイテム ---------- */
  const SHOP_ITEMS = [
    { id: 'toy_ball',   emoji: '⚽', name: 'ボール',       price: 30,  type: 'toy', desc: 'ミニゲームスコア+10%' },
    { id: 'toy_music',  emoji: '🎵', name: 'おんがくBox',  price: 50,  type: 'toy', desc: 'きげん自然回復+1' },
    { id: 'bed',        emoji: '🛏️', name: 'ふかふかベッド', price: 80,  type: 'furniture', desc: '睡眠回復量2倍' },
    { id: 'garden',     emoji: '🌻', name: 'おにわ',       price: 120, type: 'furniture', desc: '背景が変わる' },
    { id: 'hat_crown',  emoji: '👑', name: 'おうかん',     price: 200, type: 'accessory', desc: 'かっこいい！' },
    { id: 'hat_ribbon', emoji: '🎀', name: 'リボン',       price: 60,  type: 'accessory', desc: 'かわいい！' },
    { id: 'food_meat',  emoji: '🍖', name: 'にく×5',       price: 40,  type: 'food', foodId: 'meat', qty: 5, desc: 'まとめ買い' },
    { id: 'food_cake',  emoji: '🎂', name: 'ケーキ×5',     price: 80,  type: 'food', foodId: 'cake', qty: 5, desc: 'まとめ買い' },
    { id: 'food_ramen', emoji: '🍜', name: 'ラーメン×5',   price: 140, type: 'food', foodId: 'ramen', qty: 5, desc: 'まとめ買い' },
    { id: 'food_star',  emoji: '⭐', name: 'ほしのかけら×3', price: 360, type: 'food', foodId: 'star', qty: 3, desc: '伝説の食べ物' },
  ];

  /* ---------- ミニゲーム定義 ---------- */
  const MINIGAMES = [
    { id: 'catch', name: 'シュールキャッチ', desc: '落ちてくるアイテムをタッチ！' },
    { id: 'whack', name: 'もぐらたたき', desc: '出てくるモグラをタッチ！' },
    { id: 'memory', name: 'きおくゲーム', desc: '表示された順番をおぼえてタッチ！' },
  ];

  /* ---------- ゲーム状態 ---------- */
  let state = {
    petType: 'egg',
    petName: '',
    hunger: 80,
    happy: 80,
    clean: 100,
    exp: 0,
    coins: 30,
    day: 1,
    totalDays: 1,
    isSleeping: false,
    poopCount: 0,
    inventory: { bread: 99, rice: 99 }, // 無限にあるパンとおにぎり
    ownedItems: [],
    discovered: ['egg'],
    lastTick: Date.now(),
    lastSave: 0,
    tickAccumulator: 0,
    minigamePlayed: false,
  };

  let msgTimeout = null;
  let currentScreen = 'title';

  /* ---------- DOM要素 ---------- */
  const $ = (id) => document.getElementById(id);

  /* ---------- ユーティリティ ---------- */
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  function showScreen(id) {
    const screens = ['title-screen', 'main-screen', 'feed-screen', 'minigame-screen',
                     'shop-screen', 'zukan-screen', 'evolve-screen', 'naming-screen'];
    screens.forEach(s => {
      const el = $(s);
      if (el) el.classList.toggle('hidden', s !== id);
    });
    currentScreen = id;
  }

  function showMessage(text) {
    const box = $('message-box');
    const textEl = $('message-text');
    if (msgTimeout) clearTimeout(msgTimeout);
    box.classList.remove('hidden');
    // Force re-animation
    box.style.animation = 'none';
    void box.offsetHeight;
    box.style.animation = '';
    textEl.textContent = text;
    msgTimeout = setTimeout(() => box.classList.add('hidden'), 2500);
  }

  function showEmotion(emoji) {
    const el = $('pet-emotion');
    el.textContent = emoji;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 1500);
  }

  function animatePet(animClass, duration) {
    const sprite = $('pet-sprite');
    sprite.classList.add(animClass);
    setTimeout(() => sprite.classList.remove(animClass), duration);
  }

  /* ---------- セーブ / ロード ---------- */
  function saveGame() {
    state.lastSave = Date.now();
    state.lastTick = Date.now();
    try {
      localStorage.setItem('surreal_pet_save', JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function loadGame() {
    try {
      const data = localStorage.getItem('surreal_pet_save');
      if (!data) return false;
      const saved = JSON.parse(data);
      Object.assign(state, saved);
      return true;
    } catch (e) { return false; }
  }

  function hasSave() {
    return !!localStorage.getItem('surreal_pet_save');
  }

  /* ---------- 時間経過処理 ---------- */
  function processOfflineTime() {
    const now = Date.now();
    const elapsed = now - state.lastTick;
    const minutes = Math.min(elapsed / 60000, 1440); // 最大24時間分

    // ステータスの自然減少（1分あたり）
    const hungerDecay = 0.15;
    const happyDecay = 0.1;
    const cleanDecay = 0.08;

    state.hunger = clamp(state.hunger - hungerDecay * minutes, 0, 100);
    state.happy = clamp(state.happy - happyDecay * minutes, 0, 100);
    state.clean = clamp(state.clean - cleanDecay * minutes, 0, 100);

    // うんち
    const poopChance = Math.floor(minutes / 30);
    state.poopCount = Math.min(state.poopCount + poopChance, 5);

    // 日数更新
    const daysPassed = Math.floor(minutes / 60);
    if (daysPassed > 0) {
      state.day += daysPassed;
      state.totalDays += daysPassed;
    }

    state.lastTick = now;
  }

  /* ---------- リアルタイムtick ---------- */
  function gameTick() {
    if (currentScreen !== 'main-screen') return;
    if (state.isSleeping) return;

    const now = Date.now();
    const dt = now - state.lastTick;
    state.lastTick = now;
    state.tickAccumulator += dt;

    // 10秒ごとに処理
    while (state.tickAccumulator >= 10000) {
      state.tickAccumulator -= 10000;

      state.hunger = clamp(state.hunger - 0.3, 0, 100);
      state.happy = clamp(state.happy - 0.2, 0, 100);
      state.clean = clamp(state.clean - 0.15, 0, 100);

      // おんがくBoxで幸福度自然回復
      if (state.ownedItems.includes('toy_music')) {
        state.happy = clamp(state.happy + 0.1, 0, 100);
      }

      // うんち生成
      if (Math.random() < 0.03 && state.poopCount < 5) {
        state.poopCount++;
        renderPoops();
        if (state.poopCount >= 3) {
          state.clean = clamp(state.clean - 5, 0, 100);
        }
      }
    }

    updateUI();

    // 30秒ごとにオートセーブ
    if (now - state.lastSave > 30000) saveGame();
  }

  /* ---------- UI更新 ---------- */
  function updateUI() {
    const pet = PETS[state.petType];
    $('pet-sprite').textContent = pet.emoji;
    $('pet-name-display').textContent = state.petName || pet.name;
    $('coins').textContent = state.coins;
    $('day-count').textContent = state.day;

    $('hunger-bar').style.width = state.hunger + '%';
    $('happy-bar').style.width = state.happy + '%';
    $('clean-bar').style.width = state.clean + '%';

    const stage = pet.stage;
    const nextExp = EXP_TO_EVOLVE[stage + 1] || EXP_TO_EVOLVE[EXP_TO_EVOLVE.length - 1];
    const prevExp = EXP_TO_EVOLVE[stage] || 0;
    const expPct = stage >= 4 ? 100 : ((state.exp - prevExp) / (nextExp - prevExp)) * 100;
    $('exp-bar').style.width = clamp(expPct, 0, 100) + '%';

    $('hunger-value').textContent = Math.floor(state.hunger);
    $('happy-value').textContent = Math.floor(state.happy);
    $('clean-value').textContent = Math.floor(state.clean);
    $('exp-value').textContent = state.exp;

    // スリープ中
    const sprite = $('pet-sprite');
    if (state.isSleeping) {
      sprite.classList.add('sleeping');
      $('btn-feed').disabled = true;
      $('btn-play').disabled = true;
      $('btn-sleep').querySelector('br').nextSibling.textContent = 'おこす';
    } else {
      sprite.classList.remove('sleeping');
      $('btn-feed').disabled = false;
      $('btn-play').disabled = false;
      $('btn-sleep').innerHTML = '💤<br>ねかす';
    }

    // 環境
    const env = $('environment');
    if (state.ownedItems.includes('garden')) {
      env.style.background = 'linear-gradient(180deg, #87CEEB 0%, #ffeaa7 30%, #55efc4 70%, #00b894 100%)';
    }

    renderPoops();
  }

  function renderPoops() {
    const container = $('poop-container');
    container.innerHTML = '';
    for (let i = 0; i < state.poopCount; i++) {
      const p = document.createElement('span');
      p.className = 'poop';
      p.textContent = '💩';
      container.appendChild(p);
    }
  }

  /* ---------- ごはん ---------- */
  function openFeedScreen() {
    showScreen('feed-screen');
    renderFoodList();
  }

  function renderFoodList() {
    const list = $('food-list');
    list.innerHTML = '';
    FOODS.forEach(food => {
      const count = getItemCount(food.id);
      const canAfford = count > 0 || food.price === 0;
      const div = document.createElement('div');
      div.className = 'food-item' + (canAfford ? '' : ' locked');
      div.innerHTML = `
        <span class="food-icon">${food.emoji}</span>
        <div class="food-info">
          <div class="food-name">${food.name}</div>
          <div class="food-desc">${food.desc} (おなか+${food.hunger} きげん+${food.happy})</div>
        </div>
        <span class="food-count">${food.price === 0 ? '∞' : '×' + count}</span>
      `;
      if (canAfford) {
        div.addEventListener('click', () => feedPet(food));
      }
      list.appendChild(div);
    });
  }

  function getItemCount(foodId) {
    if (foodId === 'bread' || foodId === 'rice') return 99;
    return state.inventory[foodId] || 0;
  }

  function feedPet(food) {
    if (food.price > 0) {
      const count = state.inventory[food.id] || 0;
      if (count <= 0) {
        showMessage('もってないよ！おみせで買おう');
        return;
      }
      state.inventory[food.id] = count - 1;
    }

    state.hunger = clamp(state.hunger + food.hunger, 0, 100);
    state.happy = clamp(state.happy + food.happy, 0, 100);
    state.exp += Math.floor(food.hunger / 5 + food.happy / 5);

    showScreen('main-screen');
    animatePet('eating', 1200);
    showEmotion('😋');
    showMessage(`${food.name}をあげた！`);

    checkEvolution();
    updateUI();
    saveGame();
  }

  /* ---------- あそぶ（ミニゲーム） ---------- */
  function startPlay() {
    const game = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
    showScreen('minigame-screen');
    $('minigame-title').textContent = game.name;
    $('mg-score').textContent = '0';
    $('minigame-back').classList.add('hidden');

    switch (game.id) {
      case 'catch': startCatchGame(); break;
      case 'whack': startWhackGame(); break;
      case 'memory': startMemoryGame(); break;
    }
  }

  /* -- キャッチゲーム -- */
  function startCatchGame() {
    const area = $('minigame-area');
    area.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">落ちてくるものをタッチ！</div>';
    let score = 0;
    let timeLeft = 15;
    let spawnInterval;

    const timerDiv = document.createElement('div');
    timerDiv.style.cssText = 'text-align:center;font-size:24px;font-weight:700;color:#fff;padding:10px;';
    timerDiv.textContent = timeLeft + '秒';
    area.innerHTML = '';
    area.appendChild(timerDiv);

    const emojis = ['🍎', '🍊', '🍇', '🍰', '⭐', '💎', '🌈', '💩'];
    const points = [1, 1, 1, 2, 3, 5, 5, -3];

    function spawnItem() {
      const idx = Math.random() < 0.15 ? (Math.random() < 0.3 ? 7 : Math.floor(Math.random() * 3) + 4) : Math.floor(Math.random() * 4);
      const item = document.createElement('div');
      item.className = 'mg-target';
      item.textContent = emojis[idx];
      item.style.left = (Math.random() * 80 + 5) + '%';
      item.style.top = '-40px';
      area.appendChild(item);

      let y = -40;
      const speed = 1.5 + Math.random() * 2;
      const fall = setInterval(() => {
        y += speed;
        item.style.top = y + 'px';
        if (y > area.offsetHeight) {
          clearInterval(fall);
          if (item.parentNode) item.remove();
        }
      }, 30);

      item.addEventListener('click', () => {
        clearInterval(fall);
        score += points[idx];
        $('mg-score').textContent = Math.max(0, score);
        showEmotion(points[idx] > 0 ? '✨' : '💦');
        item.remove();
      });
    }

    spawnInterval = setInterval(spawnItem, 600);

    const timer = setInterval(() => {
      timeLeft--;
      timerDiv.textContent = timeLeft + '秒';
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearInterval(spawnInterval);
        endMinigame(score);
      }
    }, 1000);
  }

  /* -- もぐらたたき -- */
  function startWhackGame() {
    const area = $('minigame-area');
    area.innerHTML = '';
    let score = 0;
    let timeLeft = 15;
    let activeHole = -1;

    const timerDiv = document.createElement('div');
    timerDiv.style.cssText = 'text-align:center;font-size:24px;font-weight:700;color:#fff;padding:10px;';
    timerDiv.textContent = timeLeft + '秒';
    area.appendChild(timerDiv);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:20px;';
    const holes = [];

    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.style.cssText = 'width:80px;height:80px;margin:0 auto;background:rgba(0,0,0,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;transition:background 0.1s;';
      hole.addEventListener('click', () => {
        if (parseInt(hole.dataset.active)) {
          const isBad = hole.dataset.bad === '1';
          if (isBad) {
            score = Math.max(0, score - 2);
            showEmotion('💦');
          } else {
            score += 1;
            showEmotion('✨');
          }
          $('mg-score').textContent = score;
          hole.textContent = '';
          hole.dataset.active = '0';
          hole.style.background = 'rgba(0,0,0,0.4)';
        }
      });
      holes.push(hole);
      grid.appendChild(hole);
    }
    area.appendChild(grid);

    const moles = ['🐹', '🐻', '🐸', '🐰'];

    const spawnInterval = setInterval(() => {
      // Clear old
      holes.forEach(h => { h.textContent = ''; h.dataset.active = '0'; h.style.background = 'rgba(0,0,0,0.4)'; });
      // Spawn 1-2
      const count = Math.random() < 0.3 ? 2 : 1;
      const indices = [];
      for (let c = 0; c < count; c++) {
        let idx;
        do { idx = Math.floor(Math.random() * 9); } while (indices.includes(idx));
        indices.push(idx);
        const isBad = Math.random() < 0.2;
        holes[idx].textContent = isBad ? '💩' : moles[Math.floor(Math.random() * moles.length)];
        holes[idx].dataset.active = '1';
        holes[idx].dataset.bad = isBad ? '1' : '0';
        holes[idx].style.background = 'rgba(255,255,255,0.1)';
      }
    }, 800);

    const timer = setInterval(() => {
      timeLeft--;
      timerDiv.textContent = timeLeft + '秒';
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearInterval(spawnInterval);
        endMinigame(score);
      }
    }, 1000);
  }

  /* -- 記憶ゲーム -- */
  function startMemoryGame() {
    const area = $('minigame-area');
    area.innerHTML = '';
    let score = 0;
    let sequence = [];
    let playerIndex = 0;
    let round = 1;

    const emojis = ['🔴', '🔵', '🟢', '🟡'];

    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;font-size:18px;font-weight:700;color:#fff;padding:15px;';
    info.textContent = 'おぼえてね！';
    area.appendChild(info);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:15px;padding:20px;max-width:280px;margin:0 auto;';
    const buttons = [];

    emojis.forEach((e, i) => {
      const btn = document.createElement('div');
      btn.style.cssText = 'width:100px;height:100px;margin:0 auto;background:rgba(255,255,255,0.1);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:50px;cursor:pointer;transition:all 0.2s;border:3px solid transparent;';
      btn.textContent = e;
      btn.addEventListener('click', () => handleMemoryClick(i));
      buttons.push(btn);
      grid.appendChild(btn);
    });
    area.appendChild(grid);

    function flashButton(idx, duration) {
      return new Promise(resolve => {
        buttons[idx].style.background = 'rgba(255,255,255,0.4)';
        buttons[idx].style.borderColor = '#fff';
        buttons[idx].style.transform = 'scale(1.1)';
        setTimeout(() => {
          buttons[idx].style.background = 'rgba(255,255,255,0.1)';
          buttons[idx].style.borderColor = 'transparent';
          buttons[idx].style.transform = 'scale(1)';
          setTimeout(resolve, 200);
        }, duration);
      });
    }

    async function showSequence() {
      info.textContent = `ラウンド ${round} — おぼえてね！`;
      buttons.forEach(b => b.style.pointerEvents = 'none');
      sequence.push(Math.floor(Math.random() * 4));
      await new Promise(r => setTimeout(r, 500));
      for (const idx of sequence) {
        await flashButton(idx, 500);
      }
      info.textContent = 'タッチしてね！';
      playerIndex = 0;
      buttons.forEach(b => b.style.pointerEvents = 'auto');
    }

    function handleMemoryClick(idx) {
      if (idx === sequence[playerIndex]) {
        flashButton(idx, 200);
        playerIndex++;
        if (playerIndex >= sequence.length) {
          score += round * 2;
          $('mg-score').textContent = score;
          round++;
          showEmotion('✨');
          if (round > 10) {
            endMinigame(score);
          } else {
            setTimeout(showSequence, 800);
          }
        }
      } else {
        info.textContent = 'まちがえた！';
        showEmotion('💦');
        endMinigame(score);
      }
    }

    showSequence();
  }

  function endMinigame(score) {
    const bonus = state.ownedItems.includes('toy_ball') ? 1.1 : 1;
    const finalScore = Math.floor(score * bonus);
    const coins = Math.max(1, Math.floor(finalScore * 1.5));
    const exp = Math.max(1, Math.floor(finalScore * 0.8));

    state.coins += coins;
    state.exp += exp;
    state.happy = clamp(state.happy + Math.min(finalScore, 20), 0, 100);
    state.minigamePlayed = true;

    $('mg-score').textContent = finalScore;
    $('minigame-back').classList.remove('hidden');

    const area = $('minigame-area');
    const result = document.createElement('div');
    result.style.cssText = 'text-align:center;padding:30px;';
    result.innerHTML = `
      <div style="font-size:40px;margin-bottom:15px;">🎉</div>
      <div style="font-size:18px;font-weight:700;">おわり！</div>
      <div style="margin-top:10px;color:#ffd700;">💰 +${coins}コイン</div>
      <div style="color:#c3a5ff;">✨ +${exp}けいけん</div>
    `;
    area.appendChild(result);

    checkEvolution();
    saveGame();
  }

  /* ---------- そうじ ---------- */
  function cleanPet() {
    if (state.poopCount === 0 && state.clean >= 95) {
      showMessage('もうきれいだよ！');
      return;
    }
    state.poopCount = 0;
    state.clean = clamp(state.clean + 30, 0, 100);
    state.exp += 3;
    showEmotion('✨');
    showMessage('きれいになった！');
    animatePet('happy', 1500);
    updateUI();
    checkEvolution();
    saveGame();
  }

  /* ---------- ねかす ---------- */
  function toggleSleep() {
    if (state.isSleeping) {
      state.isSleeping = false;
      showMessage('おはよう！');
      showEmotion('☀️');
    } else {
      state.isSleeping = true;
      const recoveryMul = state.ownedItems.includes('bed') ? 2 : 1;
      state.hunger = clamp(state.hunger + 10 * recoveryMul, 0, 100);
      state.happy = clamp(state.happy + 15 * recoveryMul, 0, 100);
      state.clean = clamp(state.clean + 5 * recoveryMul, 0, 100);
      state.day++;
      state.totalDays++;
      state.minigamePlayed = false;
      state.exp += 5;
      showMessage('おやすみなさい… Day ' + state.day);
      showEmotion('💤');
    }
    updateUI();
    checkEvolution();
    saveGame();
  }

  /* ---------- ショップ ---------- */
  function openShop() {
    showScreen('shop-screen');
    $('shop-coin-display').textContent = state.coins;
    renderShopList();
  }

  function renderShopList() {
    const list = $('shop-list');
    list.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const owned = item.type !== 'food' && state.ownedItems.includes(item.id);
      const canAfford = state.coins >= item.price;
      const div = document.createElement('div');
      div.className = 'shop-item' + (owned ? ' purchased' : '') + (!canAfford && !owned ? ' locked' : '');
      div.innerHTML = `
        <span class="shop-icon">${item.emoji}</span>
        <div class="shop-info">
          <div class="shop-name">${item.name}</div>
          <div class="shop-desc">${item.desc}</div>
        </div>
        <span class="shop-price">${owned ? 'もってる' : '💰' + item.price}</span>
      `;
      if (!owned && canAfford) {
        div.addEventListener('click', () => buyItem(item));
      }
      list.appendChild(div);
    });
  }

  function buyItem(item) {
    if (state.coins < item.price) return;
    state.coins -= item.price;

    if (item.type === 'food') {
      state.inventory[item.foodId] = (state.inventory[item.foodId] || 0) + item.qty;
      showMessage(`${item.name}を買った！`);
    } else {
      state.ownedItems.push(item.id);
      showMessage(`${item.name}をゲット！`);
    }

    $('shop-coin-display').textContent = state.coins;
    renderShopList();
    saveGame();
  }

  /* ---------- 図鑑 ---------- */
  function openZukan() {
    showScreen('zukan-screen');
    renderZukan();
  }

  function renderZukan() {
    const list = $('zukan-list');
    list.innerHTML = '';
    Object.entries(PETS).forEach(([key, pet]) => {
      const disc = state.discovered.includes(key);
      const div = document.createElement('div');
      div.className = 'zukan-entry ' + (disc ? 'discovered' : 'undiscovered');
      div.innerHTML = `
        <div class="zukan-sprite">${disc ? pet.emoji : '❓'}</div>
        <div class="zukan-name">${disc ? pet.name : '？？？'}</div>
      `;
      if (disc) {
        div.title = pet.desc;
        div.addEventListener('click', () => showMessage(pet.desc));
      }
      list.appendChild(div);
    });
  }

  /* ---------- 進化チェック ---------- */
  function checkEvolution() {
    const pet = PETS[state.petType];
    if (!pet || pet.stage >= 4) return;
    const evo = EVOLUTION[state.petType];
    if (!evo) return;

    const nextExp = EXP_TO_EVOLVE[pet.stage + 1];
    if (state.exp < nextExp) return;

    // 進化先決定
    let nextType;
    if (state.happy >= 70 && evo.happy) {
      nextType = evo.happy;
    } else if (state.hunger <= 30 && evo.hungry) {
      nextType = evo.hungry;
    } else if (state.clean >= 80 && evo.clean) {
      nextType = evo.clean;
    } else {
      nextType = evo.default;
    }

    triggerEvolution(nextType);
  }

  function triggerEvolution(nextType) {
    const oldPet = PETS[state.petType];
    const newPet = PETS[nextType];

    showScreen('evolve-screen');

    $('evolve-old').textContent = oldPet.emoji;
    $('evolve-new').textContent = '';
    $('evolve-text').textContent = '';
    $('evolve-ok').classList.add('hidden');

    const flash = $('evolve-flash');

    // Animation sequence
    setTimeout(() => {
      $('evolve-old').style.animation = 'pet-idle 0.3s ease-in-out infinite';
    }, 500);

    setTimeout(() => {
      flash.style.transition = 'opacity 0.5s';
      flash.style.opacity = '1';
    }, 1500);

    setTimeout(() => {
      $('evolve-old').textContent = '';
      $('evolve-new').textContent = newPet.emoji;
      flash.style.opacity = '0';
      $('evolve-text').textContent = `${oldPet.name}が${newPet.name}に進化した！`;
      $('evolve-ok').classList.remove('hidden');
    }, 2500);

    state.petType = nextType;
    if (!state.discovered.includes(nextType)) {
      state.discovered.push(nextType);
    }
    saveGame();
  }

  /* ---------- 名前付け ---------- */
  function startNaming() {
    showScreen('naming-screen');
    $('naming-pet-preview').textContent = PETS[state.petType].emoji;
    $('name-input').value = '';
    $('name-input').focus();
  }

  /* ---------- 初期化 ---------- */
  function init() {
    // タイトル画面
    if (hasSave()) {
      $('continue-btn').classList.remove('hidden');
    }

    $('start-btn').addEventListener('click', () => {
      // リセットして新規開始
      localStorage.removeItem('surreal_pet_save');
      state = {
        petType: 'egg',
        petName: '',
        hunger: 80,
        happy: 80,
        clean: 100,
        exp: 0,
        coins: 30,
        day: 1,
        totalDays: 1,
        isSleeping: false,
        poopCount: 0,
        inventory: { bread: 99, rice: 99 },
        ownedItems: [],
        discovered: ['egg'],
        lastTick: Date.now(),
        lastSave: 0,
        tickAccumulator: 0,
        minigamePlayed: false,
      };
      startNaming();
    });

    $('continue-btn').addEventListener('click', () => {
      loadGame();
      processOfflineTime();
      showScreen('main-screen');
      updateUI();
      const pet = PETS[state.petType];
      showMessage(`おかえり！${state.petName || pet.name}が待ってたよ`);
    });

    // 名前入力
    $('name-ok').addEventListener('click', () => {
      const name = $('name-input').value.trim();
      state.petName = name || PETS[state.petType].name;
      showScreen('main-screen');
      updateUI();
      showMessage(`${state.petName}との生活がはじまる！`);
      saveGame();
    });

    $('name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('name-ok').click();
    });

    // アクションボタン
    $('btn-feed').addEventListener('click', openFeedScreen);
    $('btn-play').addEventListener('click', startPlay);
    $('btn-clean').addEventListener('click', cleanPet);
    $('btn-shop').addEventListener('click', openShop);
    $('btn-status').addEventListener('click', openZukan);
    $('btn-sleep').addEventListener('click', toggleSleep);

    // 戻るボタン
    $('feed-back').addEventListener('click', () => { showScreen('main-screen'); updateUI(); });
    $('shop-back').addEventListener('click', () => { showScreen('main-screen'); updateUI(); });
    $('zukan-back').addEventListener('click', () => { showScreen('main-screen'); updateUI(); });
    $('minigame-back').addEventListener('click', () => { showScreen('main-screen'); updateUI(); });

    // 進化OK
    $('evolve-ok').addEventListener('click', () => {
      showScreen('main-screen');
      updateUI();
      const pet = PETS[state.petType];
      showMessage(`${state.petName || pet.name}がパワーアップ！`);
    });

    // ペットタッチ
    $('pet-sprite').addEventListener('click', () => {
      if (state.isSleeping) {
        showMessage('すやすや…');
        showEmotion('💤');
        return;
      }
      state.happy = clamp(state.happy + 2, 0, 100);
      state.exp += 1;
      showEmotion(['💕', '❤️', '🥰', '😊', '✨'][Math.floor(Math.random() * 5)]);
      animatePet('happy', 1500);
      updateUI();
    });

    // ゲームループ
    setInterval(gameTick, 1000);
  }

  // 起動
  init();
})();
