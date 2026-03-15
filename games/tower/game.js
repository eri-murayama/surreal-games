// ============================================================
//  シュールの塔 — 終わりなきローグライク
// ============================================================

(() => {
  'use strict';

  // --- 定数 ---
  const TILE = 32;
  const MAP_W = 13;
  const MAP_H = 13;
  const CANVAS_W = MAP_W * TILE;
  const CANVAS_H = MAP_H * TILE;
  const SAVE_KEY = 'tower_save';
  const BEST_KEY = 'tower_best_floor';
  const GACHA_COST = 10;

  // タイルタイプ
  const T = { WALL: 0, FLOOR: 1, STAIR: 2 };

  // --- DOM ---
  const $ = id => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const titleScreen = $('title-screen');
  const gameScreen = $('game-screen');
  const levelupScreen = $('levelup-screen');
  const gachaScreen = $('gacha-screen');
  const gameoverScreen = $('gameover-screen');

  // --- 敵データ ---
  const ENEMY_TYPES = [
    // 序盤 (1-5F)
    { emoji: '👁️', name: 'さまよう目玉', hp: 8, atk: 3, def: 0, exp: 2, coins: 2, behavior: 'wander' },
    { emoji: '🪑', name: 'いかりのイス', hp: 12, atk: 4, def: 1, exp: 3, coins: 3, behavior: 'chase' },
    { emoji: '🍙', name: 'にげるおにぎり', hp: 6, atk: 2, def: 0, exp: 4, coins: 5, behavior: 'flee' },
    { emoji: '🧦', name: 'かたっぽ靴下', hp: 10, atk: 3, def: 1, exp: 2, coins: 2, behavior: 'wander' },
    // 中盤 (6-15F)
    { emoji: '🎩', name: 'しゃべるシルクハット', hp: 20, atk: 7, def: 2, exp: 6, coins: 5, behavior: 'chase' },
    { emoji: '🍣', name: 'さかなのうらみ寿司', hp: 16, atk: 8, def: 1, exp: 5, coins: 4, behavior: 'chase' },
    { emoji: '🪞', name: 'うつしみの鏡', hp: 18, atk: 6, def: 4, exp: 7, coins: 6, behavior: 'mirror' },
    { emoji: '📺', name: 'ざんねんテレビ', hp: 25, atk: 6, def: 3, exp: 6, coins: 5, behavior: 'wander' },
    { emoji: '🌂', name: 'おいかけ傘', hp: 14, atk: 9, def: 1, exp: 5, coins: 4, behavior: 'chase' },
    // 終盤 (16F+)
    { emoji: '🗿', name: 'なぞのモアイ', hp: 40, atk: 10, def: 6, exp: 10, coins: 8, behavior: 'wander' },
    { emoji: '🎭', name: 'にめんのかお', hp: 30, atk: 14, def: 3, exp: 12, coins: 9, behavior: 'chase' },
    { emoji: '🛸', name: 'まよいUFO', hp: 28, atk: 12, def: 2, exp: 11, coins: 8, behavior: 'teleport' },
    { emoji: '🦑', name: 'てつがくイカ', hp: 35, atk: 11, def: 5, exp: 13, coins: 10, behavior: 'chase' },
    { emoji: '🏠', name: 'あるく一軒家', hp: 50, atk: 8, def: 8, exp: 15, coins: 12, behavior: 'chase' },
    // ボス級 (20F+)
    { emoji: '👑', name: 'シュール大王', hp: 60, atk: 16, def: 7, exp: 25, coins: 20, behavior: 'boss' },
    { emoji: '🌀', name: 'むげんのうずまき', hp: 45, atk: 20, def: 4, exp: 20, coins: 15, behavior: 'teleport' },
  ];

  // --- アイテムデータ ---
  const ITEM_TYPES = [
    { emoji: '🍎', name: 'ふしぎリンゴ', effect: 'heal', value: 15, desc: 'HP+15', weight: 10 },
    { emoji: '🍖', name: 'でかい肉', effect: 'heal', value: 30, desc: 'HP+30', weight: 6 },
    { emoji: '⚔️', name: '力のかけら', effect: 'atk', value: 2, desc: '攻撃力+2', weight: 5 },
    { emoji: '🛡️', name: '守りのかけら', effect: 'def', value: 2, desc: '防御力+2', weight: 5 },
    { emoji: '💎', name: 'ふしぎな宝石', effect: 'exp', value: 10, desc: '経験値+10', weight: 4 },
    { emoji: '🌟', name: 'スーパースター', effect: 'maxhp', value: 10, desc: '最大HP+10', weight: 3 },
    { emoji: '🍀', name: '四つ葉のクローバー', effect: 'fullheal', value: 0, desc: 'HP全回復', weight: 2 },
    { emoji: '💣', name: 'ばくだん', effect: 'bomb', value: 20, desc: '周囲の敵に20ダメージ', weight: 3 },
    { emoji: '👟', name: 'はやい靴', effect: 'double', value: 3, desc: '3ターン2回行動', weight: 2 },
    { emoji: '🔮', name: '予知の水晶', effect: 'reveal', value: 0, desc: 'フロア全体を表示', weight: 3 },
  ];

  // --- ガチャデータ ---
  const GACHA_ITEMS = [
    // コモン (60%)
    { emoji: '🍎', name: 'ふしぎリンゴ', rarity: 'common', rarityName: 'コモン', effect: 'heal', value: 15, desc: 'HP+15', weight: 20 },
    { emoji: '🍖', name: 'でかい肉', rarity: 'common', rarityName: 'コモン', effect: 'heal', value: 30, desc: 'HP+30', weight: 15 },
    { emoji: '🪙', name: 'コインの袋', rarity: 'common', rarityName: 'コモン', effect: 'coins', value: 8, desc: 'コイン+8', weight: 15 },
    { emoji: '💣', name: 'ばくだん', rarity: 'common', rarityName: 'コモン', effect: 'bomb', value: 20, desc: '周囲の敵に20ダメージ', weight: 10 },
    // レア (25%)
    { emoji: '⚔️', name: '鋭い剣', rarity: 'rare', rarityName: 'レア', effect: 'atk', value: 3, desc: '攻撃力+3', weight: 8 },
    { emoji: '🛡️', name: '堅い盾', rarity: 'rare', rarityName: 'レア', effect: 'def', value: 3, desc: '防御力+3', weight: 8 },
    { emoji: '🌟', name: '生命の星', rarity: 'rare', rarityName: 'レア', effect: 'maxhp', value: 15, desc: '最大HP+15', weight: 5 },
    { emoji: '🔮', name: '予知の水晶', rarity: 'rare', rarityName: 'レア', effect: 'reveal', value: 0, desc: 'フロア全体を表示', weight: 4 },
    // SR (12%)
    { emoji: '🗡️', name: '伝説の剣', rarity: 'sr', rarityName: 'SR', effect: 'atk', value: 6, desc: '攻撃力+6', weight: 4 },
    { emoji: '🩹', name: '再生のお守り', rarity: 'sr', rarityName: 'SR', effect: 'regen', value: 1, desc: '毎ターンHP+1回復', weight: 3 },
    { emoji: '🍀', name: '幸運のクローバー', rarity: 'sr', rarityName: 'SR', effect: 'fullheal', value: 0, desc: 'HP全回復+攻撃力+2', weight: 3 },
    { emoji: '👟', name: '韋駄天シューズ', rarity: 'sr', rarityName: 'SR', effect: 'double', value: 5, desc: '5ターン2回行動', weight: 2 },
    // SSR (3%)
    { emoji: '👼', name: '天使の翼', rarity: 'ssr', rarityName: 'SSR', effect: 'angel', value: 0, desc: 'HP全回復+全ステ+5', weight: 1.5 },
    { emoji: '💀', name: '死神のカマ', rarity: 'ssr', rarityName: 'SSR', effect: 'reaper', value: 0, desc: 'フロアの敵を全滅', weight: 1 },
    { emoji: '🌈', name: '虹のかけら', rarity: 'ssr', rarityName: 'SSR', effect: 'rainbow', value: 0, desc: 'ランダムで全ステ+2～8', weight: 0.5 },
  ];

  // レベルアップ選択肢
  const LEVELUP_CHOICES = [
    { name: '❤️ HP強化', desc: '最大HP+8, HP全回復', apply: p => { p.maxHp += 8; p.hp = p.maxHp; } },
    { name: '⚔️ 攻撃強化', desc: '攻撃力+3', apply: p => { p.atk += 3; } },
    { name: '🛡️ 防御強化', desc: '防御力+2', apply: p => { p.def += 2; } },
    { name: '💨 回避の心得', desc: '回避率+5%', apply: p => { p.evade = (p.evade || 0) + 5; } },
    { name: '🔥 会心の力', desc: '会心率+8%', apply: p => { p.crit = (p.crit || 0) + 8; } },
    { name: '🩹 再生の力', desc: '毎ターンHP+1回復', apply: p => { p.regen = (p.regen || 0) + 1; } },
  ];

  // 墓碑銘
  const EPITAPHS = [
    'その冒険者は、イスに座ろうとした。',
    '最期の言葉は「もう一階だけ...」だった。',
    '靴下の片方は、ついに見つからなかった。',
    'シュールな世界に飲み込まれた。',
    'おにぎりに追いかけられるとは思わなかった。',
    '塔は今日も、新たな挑戦者を待っている。',
    '寿司のうらみは深かった。',
    'テレビのつまらなさに耐えられなかった。',
    'モアイは静かにほほえんでいた。',
    'こうして物語は、ふりだしに戻る。',
  ];

  // --- ゲーム状態 ---
  let game = null;
  let inputLocked = false;
  let reviveUsed = false;
  let popupTimer = null;

  // --- ユーティリティ ---
  function rng(max) { return Math.floor(Math.random() * max); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function weightedRandom(items, weightKey = 'weight') {
    const total = items.reduce((s, i) => s + i[weightKey], 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= item[weightKey];
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  }

  // --- HUDフラッシュ＆ポップアップ ---
  function flashHUD(elementId) {
    const el = $(elementId);
    el.classList.remove('hud-flash');
    void el.offsetWidth;
    el.classList.add('hud-flash');
    setTimeout(() => el.classList.remove('hud-flash'), 500);
  }

  function showPopup(text) {
    const el = $('hud-popup');
    el.textContent = text;
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = setTimeout(() => { el.textContent = ''; }, 1500);
  }

  // --- マップ生成 ---
  function generateMap(floor) {
    const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.WALL));
    const rooms = [];

    const numRooms = 3 + Math.min(floor, 5);
    for (let i = 0; i < numRooms * 3; i++) {
      if (rooms.length >= numRooms) break;
      const w = 3 + rng(4);
      const h = 3 + rng(4);
      const x = 1 + rng(MAP_W - w - 2);
      const y = 1 + rng(MAP_H - h - 2);

      let overlap = false;
      for (const r of rooms) {
        if (x <= r.x + r.w && x + w >= r.x && y <= r.y + r.h && y + h >= r.y) {
          overlap = true;
          break;
        }
      }
      if (overlap) continue;

      rooms.push({ x, y, w, h });
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          map[ry][rx] = T.FLOOR;
        }
      }
    }

    if (rooms.length < 2) {
      rooms.length = 0;
      const cx = Math.floor(MAP_W / 2);
      const cy = Math.floor(MAP_H / 2);
      for (let y = 2; y < MAP_H - 2; y++) map[y][cx] = T.FLOOR;
      for (let x = 2; x < MAP_W - 2; x++) map[cy][x] = T.FLOOR;
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          map[y][x] = T.FLOOR;
        }
      }
      rooms.push({ x: cx - 2, y: cy - 2, w: 5, h: 5 });
      rooms.push({ x: 2, y: cy - 1, w: 3, h: 3 });
      rooms.push({ x: MAP_W - 5, y: cy - 1, w: 3, h: 3 });
    }

    for (let i = 0; i < rooms.length - 1; i++) {
      const a = rooms[i];
      const b = rooms[i + 1];
      let cx = Math.floor(a.x + a.w / 2);
      let cy = Math.floor(a.y + a.h / 2);
      const tx = Math.floor(b.x + b.w / 2);
      const ty = Math.floor(b.y + b.h / 2);

      while (cx !== tx) {
        cx += cx < tx ? 1 : -1;
        map[cy][cx] = T.FLOOR;
      }
      while (cy !== ty) {
        cy += cy < ty ? 1 : -1;
        map[cy][cx] = T.FLOOR;
      }
    }

    const stairRoom = rooms.length > 1 ? rooms[rooms.length - 1] : rooms[0];
    const sx = stairRoom.x + rng(stairRoom.w);
    const sy = stairRoom.y + rng(stairRoom.h);
    map[sy][sx] = T.STAIR;

    return { map, rooms, stairPos: { x: sx, y: sy } };
  }

  // --- 敵の選出 ---
  function pickEnemyType(floor) {
    let pool;
    if (floor <= 5) {
      pool = ENEMY_TYPES.slice(0, 4);
    } else if (floor <= 15) {
      pool = ENEMY_TYPES.slice(0, 9);
    } else if (floor <= 25) {
      pool = ENEMY_TYPES.slice(2, 14);
    } else {
      pool = ENEMY_TYPES.slice(4);
    }
    const base = { ...pool[rng(pool.length)] };

    const scale = 1 + (floor - 1) * 0.12;
    base.hp = Math.floor(base.hp * scale);
    base.atk = Math.floor(base.atk * scale);
    base.def = Math.floor(base.def * scale);
    base.exp = Math.floor(base.exp * (1 + (floor - 1) * 0.05));
    base.coins = Math.floor(base.coins * (1 + (floor - 1) * 0.08));

    return base;
  }

  // --- セーブ/ロード ---
  function saveGame() {
    if (!game || game.state === 'dead') return;
    const data = {
      player: { ...game.player },
      floor: game.floor,
      map: game.map,
      enemies: game.enemies.map(e => ({ ...e })),
      items: game.items.map(i => ({ ...i })),
      explored: game.explored,
      turnCount: game.turnCount,
      reviveUsed,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { /* quota exceeded — ignore */ }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.player || !data.map) return false;

      game = {
        player: data.player,
        floor: data.floor,
        map: data.map,
        enemies: data.enemies || [],
        items: data.items || [],
        explored: data.explored,
        turnCount: data.turnCount || 0,
        logs: [],
        state: 'play',
      };
      reviveUsed = data.reviveUsed || false;

      $('game-log').innerHTML = '';
      showScreen('game');
      addLog(`${game.floor}Fからの続き...`, 'floor');
      render();
      return true;
    } catch (e) {
      return false;
    }
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    updateTitleButtons();
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  function updateTitleButtons() {
    const continueBtn = $('continue-btn');
    if (hasSave()) {
      continueBtn.classList.remove('hidden');
    } else {
      continueBtn.classList.add('hidden');
    }
  }

  // --- ゲーム初期化 ---
  function initGame() {
    deleteSave();

    game = {
      player: {
        x: 0, y: 0,
        hp: 30, maxHp: 30,
        atk: 5, def: 2,
        exp: 0, level: 1,
        nextExp: 10,
        evade: 0, crit: 5,
        regen: 0,
        coins: 0,
        doubleTurns: 0,
        kills: 0,
        itemsUsed: 0,
      },
      floor: 1,
      map: null,
      enemies: [],
      items: [],
      explored: null,
      turnCount: 0,
      logs: [],
      state: 'play',
    };

    reviveUsed = false;

    $('game-log').innerHTML = '';
    generateFloor();
    showScreen('game');
    addLog('シュールの塔に足を踏み入れた...', 'floor');
    render();
  }

  function generateFloor() {
    const { map, rooms } = generateMap(game.floor);
    game.map = map;
    game.enemies = [];
    game.items = [];
    game.explored = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));

    const startRoom = rooms[0];
    game.player.x = startRoom.x + Math.floor(startRoom.w / 2);
    game.player.y = startRoom.y + Math.floor(startRoom.h / 2);

    const numEnemies = Math.min(3 + Math.floor(game.floor * 0.8), 10);
    for (let i = 0; i < numEnemies; i++) {
      const type = pickEnemyType(game.floor);
      let ex, ey, tries = 0;
      do {
        const room = rooms[rng(rooms.length)];
        ex = room.x + rng(room.w);
        ey = room.y + rng(room.h);
        tries++;
      } while (tries < 50 && (
        map[ey][ex] !== T.FLOOR ||
        (ex === game.player.x && ey === game.player.y) ||
        game.enemies.some(e => e.x === ex && e.y === ey)
      ));

      if (tries < 50) {
        game.enemies.push({
          ...type,
          x: ex, y: ey,
          maxHp: type.hp,
          stunned: false,
        });
      }
    }

    const numItems = 1 + rng(3);
    for (let i = 0; i < numItems; i++) {
      const type = weightedRandom(ITEM_TYPES);
      let ix, iy, tries = 0;
      do {
        const room = rooms[rng(rooms.length)];
        ix = room.x + rng(room.w);
        iy = room.y + rng(room.h);
        tries++;
      } while (tries < 50 && (
        map[iy][ix] !== T.FLOOR ||
        (ix === game.player.x && iy === game.player.y) ||
        game.items.some(it => it.x === ix && it.y === iy)
      ));

      if (tries < 50) {
        game.items.push({ ...type, x: ix, y: iy });
      }
    }

    updateExplored();
  }

  // --- 視界 ---
  function updateExplored() {
    const p = game.player;
    const radius = 4;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H) {
          if (dx * dx + dy * dy <= radius * radius) {
            game.explored[ny][nx] = true;
          }
        }
      }
    }
  }

  // --- ログ ---
  function addLog(text, cls = '') {
    game.logs.push({ text, cls });
    if (game.logs.length > 50) game.logs.shift();
    const el = $('game-log');
    const span = document.createElement('div');
    if (cls) span.className = 'log-' + cls;
    span.textContent = text;
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
  }

  // --- アイテム効果適用 (共通) ---
  function applyItemEffect(effect, value) {
    const p = game.player;
    switch (effect) {
      case 'heal':
        p.hp = Math.min(p.maxHp, p.hp + value);
        flashHUD('hud-hp');
        showPopup(`HP +${value}`);
        break;
      case 'fullheal':
        p.hp = p.maxHp;
        flashHUD('hud-hp');
        showPopup('HP全回復！');
        break;
      case 'atk':
        p.atk += value;
        flashHUD('hud-atk');
        showPopup(`攻撃力 +${value}`);
        break;
      case 'def':
        p.def += value;
        flashHUD('hud-def');
        showPopup(`防御力 +${value}`);
        break;
      case 'exp':
        p.exp += value;
        flashHUD('hud-exp');
        showPopup(`経験値 +${value}`);
        checkLevelUp();
        break;
      case 'maxhp':
        p.maxHp += value;
        p.hp += value;
        flashHUD('hud-hp');
        showPopup(`最大HP +${value}`);
        break;
      case 'bomb': {
        let bombed = 0;
        game.enemies = game.enemies.filter(e => {
          const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
          if (dist <= 3) {
            e.hp -= value;
            if (e.hp <= 0) {
              p.exp += e.exp;
              p.coins += e.coins;
              p.kills++;
              bombed++;
              return false;
            }
          }
          return true;
        });
        if (bombed) {
          addLog(`爆発で${bombed}体倒した！`, 'special');
          checkLevelUp();
        }
        showPopup('ドカーン！');
        break;
      }
      case 'double':
        p.doubleTurns += value;
        showPopup(`${value}ターン2回行動！`);
        break;
      case 'reveal':
        for (let y = 0; y < MAP_H; y++) {
          for (let x = 0; x < MAP_W; x++) {
            game.explored[y][x] = true;
          }
        }
        showPopup('マップ全開放！');
        break;
      case 'coins':
        p.coins += value;
        flashHUD('hud-coin');
        showPopup(`コイン +${value}`);
        break;
      case 'regen':
        p.regen = (p.regen || 0) + value;
        showPopup(`リジェネ +${value}`);
        break;
      case 'angel':
        p.hp = p.maxHp;
        p.atk += 5;
        p.def += 5;
        p.maxHp += 5;
        flashHUD('hud-hp');
        flashHUD('hud-atk');
        flashHUD('hud-def');
        showPopup('天使の祝福！全ステ+5');
        break;
      case 'reaper':
        game.enemies.forEach(e => {
          p.exp += e.exp;
          p.coins += e.coins;
          p.kills++;
        });
        game.enemies = [];
        flashHUD('hud-coin');
        showPopup('死神一掃！');
        checkLevelUp();
        break;
      case 'rainbow': {
        const v = 2 + rng(7);
        p.atk += v;
        p.def += v;
        p.maxHp += v;
        p.hp = Math.min(p.maxHp, p.hp + v);
        flashHUD('hud-atk');
        flashHUD('hud-def');
        flashHUD('hud-hp');
        showPopup(`虹のパワー！全ステ+${v}`);
        break;
      }
    }
    updateHUD();
  }

  // --- プレイヤー行動 ---
  function movePlayer(dx, dy) {
    if (game.state !== 'play' || inputLocked) return;

    const p = game.player;
    const nx = p.x + dx;
    const ny = p.y + dy;

    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    if (game.map[ny][nx] === T.WALL) return;

    const enemy = game.enemies.find(e => e.x === nx && e.y === ny);
    if (enemy) {
      attackEnemy(p, enemy);
      endPlayerTurn();
      return;
    }

    p.x = nx;
    p.y = ny;
    updateExplored();

    const itemIdx = game.items.findIndex(it => it.x === nx && it.y === ny);
    if (itemIdx >= 0) {
      const item = game.items[itemIdx];
      addLog(`${item.emoji} ${item.name}を拾った！ ${item.desc}`, 'item');
      p.itemsUsed++;
      applyItemEffect(item.effect, item.value);
      game.items.splice(itemIdx, 1);
    }

    if (game.map[ny][nx] === T.STAIR) {
      game.floor++;
      addLog(`${game.floor}Fに到達！`, 'floor');
      flashHUD('hud-floor');
      generateFloor();
      saveGame();
      render();
      return;
    }

    endPlayerTurn();
  }

  function waitTurn() {
    if (game.state !== 'play' || inputLocked) return;
    endPlayerTurn();
  }

  function attackEnemy(attacker, defender) {
    let dmg = Math.max(1, attacker.atk - defender.def + rng(3) - 1);

    const critChance = attacker === game.player ? (game.player.crit || 5) : 3;
    const isCrit = rng(100) < critChance;
    if (isCrit) {
      dmg = Math.floor(dmg * 1.8);
      addLog('会心の一撃！', 'special');
    }

    defender.hp -= dmg;

    if (attacker === game.player) {
      addLog(`${defender.name}に${dmg}ダメージ！`, 'damage');
      if (defender.hp <= 0) {
        const coinDrop = defender.coins || 0;
        addLog(`${defender.name}を倒した！(+${defender.exp}exp, +${coinDrop}コイン)`, 'item');
        game.player.exp += defender.exp;
        game.player.coins += coinDrop;
        game.player.kills++;
        flashHUD('hud-exp');
        flashHUD('hud-coin');
        game.enemies = game.enemies.filter(e => e !== defender);
        checkLevelUp();
      }
    } else {
      const evadeChance = game.player.evade || 0;
      if (rng(100) < evadeChance) {
        addLog(`${attacker.name}の攻撃をかわした！`, 'special');
        return;
      }
      addLog(`${attacker.name}から${dmg}ダメージ！`, 'damage');
      game.player.hp -= dmg;
      flashHUD('hud-hp');
      if (game.player.hp <= 0) {
        game.player.hp = 0;
        gameOver();
      }
    }
  }

  // --- レベルアップ ---
  function checkLevelUp() {
    const p = game.player;
    while (p.exp >= p.nextExp) {
      p.exp -= p.nextExp;
      p.level++;
      p.nextExp = Math.floor(p.nextExp * 1.4);
      showLevelUp();
      return;
    }
  }

  function showLevelUp() {
    game.state = 'levelup';
    levelupScreen.classList.remove('hidden');

    const choicesEl = $('levelup-choices');
    choicesEl.innerHTML = '';

    const shuffled = [...LEVELUP_CHOICES].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);

    for (const choice of picks) {
      const btn = document.createElement('button');
      btn.className = 'levelup-btn';
      btn.innerHTML = `<div class="choice-name">${choice.name}</div><div class="choice-desc">${choice.desc}</div>`;
      btn.addEventListener('click', () => {
        choice.apply(game.player);
        levelupScreen.classList.add('hidden');
        game.state = 'play';
        updateHUD();
        render();
        checkLevelUp();
      });
      choicesEl.appendChild(btn);
    }
  }

  // --- ガチャ ---
  function openGacha() {
    game.state = 'gacha';
    gachaScreen.classList.remove('hidden');
    $('gacha-result').classList.add('hidden');
    $('gacha-coins').textContent = `🪙 ${game.player.coins}`;
    updateGachaButton();
  }

  function closeGacha() {
    gachaScreen.classList.add('hidden');
    game.state = 'play';
    updateHUD();
    render();
  }

  function updateGachaButton() {
    const btn = $('gacha-pull-btn');
    btn.disabled = game.player.coins < GACHA_COST;
  }

  function pullGacha() {
    if (game.player.coins < GACHA_COST) return;
    game.player.coins -= GACHA_COST;
    $('gacha-coins').textContent = `🪙 ${game.player.coins}`;

    const machine = $('gacha-machine');
    const capsule = $('gacha-capsule');
    const resultEl = $('gacha-result');

    // スピンアニメーション
    resultEl.classList.add('hidden');
    machine.classList.add('spinning');
    capsule.textContent = '❓';

    setTimeout(() => {
      machine.classList.remove('spinning');

      const item = weightedRandom(GACHA_ITEMS);

      capsule.textContent = item.emoji;
      resultEl.classList.remove('hidden');
      $('gacha-result-rarity').textContent = `★ ${item.rarityName} ★`;
      $('gacha-result-rarity').className = `rarity-${item.rarity}`;
      $('gacha-result-emoji').textContent = item.emoji;
      $('gacha-result-name').textContent = item.name;
      $('gacha-result-desc').textContent = item.desc;

      // 効果を即適用
      applyItemEffect(item.effect, item.value);
      addLog(`ガチャ: ${item.rarityName} ${item.emoji} ${item.name}！`, item.rarity === 'ssr' ? 'special' : 'item');

      updateGachaButton();
    }, 700);
  }

  // --- 敵の行動 ---
  function enemyTurn() {
    const p = game.player;

    for (const e of game.enemies) {
      if (e.stunned) {
        e.stunned = false;
        continue;
      }

      const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      let dx = 0, dy = 0;

      switch (e.behavior) {
        case 'chase':
        case 'boss':
          if (dist <= 8) {
            dx = Math.sign(p.x - e.x);
            dy = Math.sign(p.y - e.y);
            if (rng(2) === 0) dy = 0; else dx = 0;
          } else {
            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            [dx, dy] = dirs[rng(4)];
          }
          break;

        case 'flee':
          if (dist <= 5) {
            dx = Math.sign(e.x - p.x);
            dy = Math.sign(e.y - p.y);
            if (rng(2) === 0) dy = 0; else dx = 0;
          } else {
            const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
            [dx, dy] = dirs[rng(4)];
          }
          break;

        case 'mirror':
          dx = Math.sign(p.x - e.x);
          dy = Math.sign(p.y - e.y);
          if (dist <= 1) { dx = -dx; dy = -dy; }
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;

        case 'teleport':
          if (dist <= 2 && rng(3) === 0) {
            let tx, ty, tries = 0;
            do {
              tx = e.x + rng(7) - 3;
              ty = e.y + rng(7) - 3;
              tries++;
            } while (tries < 20 && (
              tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H ||
              game.map[ty][tx] !== T.FLOOR ||
              game.enemies.some(o => o !== e && o.x === tx && o.y === ty) ||
              (tx === p.x && ty === p.y)
            ));
            if (tries < 20) {
              e.x = tx;
              e.y = ty;
              continue;
            }
          }
          dx = Math.sign(p.x - e.x);
          dy = Math.sign(p.y - e.y);
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;

        case 'wander':
        default: {
          const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          [dx, dy] = dirs[rng(4)];
          if (dist <= 3) {
            dx = Math.sign(p.x - e.x);
            dy = Math.sign(p.y - e.y);
            if (rng(2) === 0) dy = 0; else dx = 0;
          }
          break;
        }
      }

      const nx = e.x + dx;
      const ny = e.y + dy;

      if (nx === p.x && ny === p.y) {
        attackEnemy(e, p);
        if (game.state !== 'play') return;
        continue;
      }

      if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H &&
          game.map[ny][nx] !== T.WALL &&
          !game.enemies.some(o => o !== e && o.x === nx && o.y === ny)) {
        e.x = nx;
        e.y = ny;
      }
    }
  }

  function endPlayerTurn() {
    game.turnCount++;

    const p = game.player;
    if (p.regen > 0 && p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + p.regen);
    }

    if (p.doubleTurns > 0) {
      p.doubleTurns--;
      render();
      return;
    }

    enemyTurn();
    if (game.state !== 'play') return;

    render();
  }

  // --- ゲームオーバー ---
  function gameOver() {
    game.state = 'dead';
    deleteSave();

    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    const isNew = game.floor > best;
    if (isNew) {
      localStorage.setItem(BEST_KEY, game.floor);
    }

    const stats = $('gameover-stats');
    stats.innerHTML = `
      到達階: <span style="color:#b388ff;font-size:28px">${game.floor}F</span><br>
      レベル: ${game.player.level}<br>
      撃破数: ${game.player.kills}体<br>
      ターン数: ${game.turnCount}<br>
      獲得コイン: ${game.player.coins}枚<br>
      ${isNew ? '<span style="color:#ffd700">★ 新記録！ ★</span>' : `最高記録: ${best}F`}
    `;

    $('gameover-epitaph').textContent = EPITAPHS[rng(EPITAPHS.length)];

    const reviveSection = $('revive-section');
    if (reviveUsed) {
      reviveSection.classList.add('used');
    } else {
      reviveSection.classList.remove('used');
    }

    showScreen('gameover');
  }

  // --- 復活（Xフォロー） ---
  function revivePlayer() {
    if (reviveUsed || !game) return;
    reviveUsed = true;

    window.open('https://x.com/tadanosyuhuda', '_blank', 'noopener');

    const p = game.player;
    p.hp = Math.floor(p.maxHp * 0.5);
    game.state = 'play';

    for (const e of game.enemies) {
      const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (dist <= 2) {
        e.stunned = true;
        const pushX = Math.sign(e.x - p.x) * 3;
        const pushY = Math.sign(e.y - p.y) * 3;
        const nx = clamp(e.x + pushX, 1, MAP_W - 2);
        const ny = clamp(e.y + pushY, 1, MAP_H - 2);
        if (game.map[ny][nx] !== T.WALL) {
          e.x = nx;
          e.y = ny;
        }
      }
    }

    showScreen('game');
    addLog('フォローの力で復活した！', 'special');
    render();
  }

  // --- 描画 ---
  function render() {
    if (!game) return;
    updateHUD();

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const p = game.player;
    const viewDist = 5;

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const dist = Math.abs(x - p.x) + Math.abs(y - p.y);
        const inView = dist <= viewDist * 1.5;
        const explored = game.explored[y][x];

        if (!explored) continue;

        const px = x * TILE;
        const py = y * TILE;
        const alpha = inView ? 1.0 : 0.35;

        switch (game.map[y][x]) {
          case T.WALL:
            ctx.fillStyle = `rgba(40, 30, 60, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = `rgba(60, 45, 90, ${alpha * 0.5})`;
            ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
            break;
          case T.FLOOR:
            ctx.fillStyle = `rgba(25, 22, 40, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            ctx.strokeStyle = `rgba(50, 40, 70, ${alpha * 0.5})`;
            ctx.strokeRect(px, py, TILE, TILE);
            break;
          case T.STAIR:
            ctx.fillStyle = `rgba(25, 22, 40, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            if (inView || explored) {
              ctx.font = `${TILE - 4}px serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.globalAlpha = alpha;
              ctx.fillText('🔼', px + TILE / 2, py + TILE / 2);
              ctx.globalAlpha = 1;
            }
            break;
        }
      }
    }

    // アイテム描画
    for (const item of game.items) {
      if (!game.explored[item.y][item.x]) continue;
      const dist = Math.abs(item.x - p.x) + Math.abs(item.y - p.y);
      const alpha = dist <= viewDist * 1.5 ? 1.0 : 0.5;
      ctx.font = `${TILE - 6}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha;
      ctx.fillText(item.emoji, item.x * TILE + TILE / 2, item.y * TILE + TILE / 2);
      ctx.globalAlpha = 1;
    }

    // 敵描画
    for (const e of game.enemies) {
      const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (dist > viewDist * 1.5) continue;

      ctx.font = `${TILE - 4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.emoji, e.x * TILE + TILE / 2, e.y * TILE + TILE / 2);

      const barW = TILE - 4;
      const barH = 3;
      const bx = e.x * TILE + 2;
      const by = e.y * TILE;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, barW, barH);
      const ratio = e.hp / e.maxHp;
      ctx.fillStyle = ratio > 0.5 ? '#66bb6a' : ratio > 0.25 ? '#ffa726' : '#ff6b6b';
      ctx.fillRect(bx, by, barW * ratio, barH);
    }

    // プレイヤー描画
    ctx.font = `${TILE - 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧙', p.x * TILE + TILE / 2, p.y * TILE + TILE / 2);

    const phpW = TILE - 4;
    const phpH = 3;
    const phpX = p.x * TILE + 2;
    const phpY = p.y * TILE;
    ctx.fillStyle = '#333';
    ctx.fillRect(phpX, phpY, phpW, phpH);
    const hpRatio = p.hp / p.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#66bb6a' : hpRatio > 0.25 ? '#ffa726' : '#ff6b6b';
    ctx.fillRect(phpX, phpY, phpW * hpRatio, phpH);
  }

  function updateHUD() {
    if (!game) return;
    const p = game.player;
    $('hud-floor').textContent = `🗼 ${game.floor}F`;
    $('hud-hp').textContent = `❤️ ${p.hp}/${p.maxHp}`;
    $('hud-atk').textContent = `⚔️ ${p.atk}`;
    $('hud-def').textContent = `🛡️ ${p.def}`;
    $('hud-exp').textContent = `✨ Lv${p.level}`;
    $('hud-coin').textContent = `🪙 ${p.coins}`;
  }

  // --- 画面切り替え ---
  function showScreen(name) {
    titleScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');

    switch (name) {
      case 'title': titleScreen.classList.remove('hidden'); break;
      case 'game': gameScreen.classList.remove('hidden'); break;
      case 'gameover': gameoverScreen.classList.remove('hidden'); break;
    }
  }

  // --- 入力処理 ---
  document.addEventListener('keydown', e => {
    if (!game) return;

    if (game.state === 'play') {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayer(1, 0); break;
        case ' ': case '.': e.preventDefault(); waitTurn(); break;
        case 'g': case 'G': e.preventDefault(); tryOpenGacha(); break;
      }
    }
  });

  // 階段上でガチャを開く
  function tryOpenGacha() {
    if (!game || game.state !== 'play') return;
    if (game.player.coins < GACHA_COST) {
      addLog('コインが足りない...（10コイン必要）', 'coin');
      return;
    }
    openGacha();
  }

  // モバイルコントロール
  document.querySelectorAll('.ctrl-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (!game || game.state !== 'play') return;
      const dir = btn.dataset.dir;
      switch (dir) {
        case 'up': movePlayer(0, -1); break;
        case 'down': movePlayer(0, 1); break;
        case 'left': movePlayer(-1, 0); break;
        case 'right': movePlayer(1, 0); break;
        case 'wait': waitTurn(); break;
      }
    });
  });

  // スワイプ操作
  let touchStart = null;
  canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  });

  canvas.addEventListener('touchend', e => {
    if (!touchStart || !game || game.state !== 'play') return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const minSwipe = 20;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
      waitTurn();
    } else if (Math.abs(dx) > Math.abs(dy)) {
      movePlayer(dx > 0 ? 1 : -1, 0);
    } else {
      movePlayer(0, dy > 0 ? 1 : -1);
    }

    touchStart = null;
  });

  // --- ボタン ---
  $('start-btn').addEventListener('click', initGame);
  $('continue-btn').addEventListener('click', () => {
    if (!loadGame()) {
      initGame();
    }
  });
  $('retry-btn').addEventListener('click', initGame);
  $('revive-btn').addEventListener('click', revivePlayer);
  $('gacha-pull-btn').addEventListener('click', pullGacha);
  $('gacha-close-btn').addEventListener('click', closeGacha);

  // HUDにガチャボタンを動的追加
  const gachaBtnHud = document.createElement('button');
  gachaBtnHud.id = 'hud-gacha-btn';
  gachaBtnHud.textContent = 'ガチャ [G]';
  gachaBtnHud.style.cssText = 'font-family:DotGothic16,monospace;font-size:12px;padding:4px 10px;background:rgba(255,128,171,0.2);border:1px solid rgba(255,128,171,0.4);border-radius:6px;color:#ff80ab;cursor:pointer;';
  gachaBtnHud.addEventListener('click', tryOpenGacha);
  $('game-hud').appendChild(gachaBtnHud);

  // --- ハイスコア表示 ---
  function showHighScore() {
    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    const el = $('highscore-display');
    if (best > 0) {
      el.textContent = `最高記録: ${best}F`;
    } else {
      el.textContent = '';
    }
  }

  // --- 初期化 ---
  showHighScore();
  updateTitleButtons();

})();
