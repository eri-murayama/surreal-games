// ============================================================
//  ドットクエスト - ミニRPG
// ============================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const enemyCanvas = document.getElementById('enemy-canvas');
const enemyCtx = enemyCanvas.getContext('2d');

// ===== 色パレット =====
const C = {
  grass1: '#3a7a2a', grass2: '#4a8a3a',
  path: '#b89a70', pathD: '#a08860',
  wall: '#665544', wallD: '#554433', wallL: '#887766',
  floor: '#887766', floorD: '#776655',
  water: '#3366aa', waterL: '#4488cc',
  tree: '#2a5a1a', treeT: '#3a7a2a', trunk: '#664422',
  roof: '#aa4444', roofD: '#883333',
  door: '#886622',
  mtn: '#887788', mtnD: '#776677', mtnL: '#99889a',
  bridge: '#aa8844', bridgeD: '#886633',
  skin: '#ffddaa', skinD: '#ddbb88',
  hair: '#443322',
  blue: '#4466cc', blueD: '#3355aa',
  red: '#cc4444', green: '#44aa44',
  white: '#eeeeee', black: '#222222',
  gray: '#888888', darkGray: '#555555',
};

// ===== タイルサイズ =====
const T = 16; // ピクセル
const MW = 16, MH = 12; // マップサイズ（タイル数）

// ===== マップデータ =====
// . = 草, # = 壁, _ = 床, ~ = 水, p = 道, T = 木, D = 扉
// M = 山, V = 村, K = 魔王城, B = 橋
const MAPS = [
  // マップ0: ワールドマップ
  [
    'MMTT........TTMM',
    'M..T..T........M',
    'T....ppp...TT..T',
    'T..V.p.......T.T',
    '..T..p..~~.....T',
    '.....p..~~..T...',
    '..T..pppBppp....',
    '........~~..p.T.',
    '..T..T..~~..p...',
    '........~~..pK..',
    '..TT....~~...T.T',
    'MMTTTTTT~~TTTMMM',
  ],
  // マップ1: 町
  [
    '################',
    '#__#__#........#',
    '#__#__#..TT..T.#',
    '#_____#........#',
    '####.####..TT..#',
    '#_____#........#',
    '#__#__#...pp...#',
    '####.###.pp..T.#',
    '......p..pp....#',
    '..T...pppp..T..#',
    '......p........#',
    '######D#########',
  ],
  // マップ2: 魔王城
  [
    '#########D######',
    '#___#__________#',
    '#___#_####_###_#',
    '#___#_#__#___#_#',
    '#_###_#__###_#_#',
    '#_____#____#___#',
    '#_###_####_#_###',
    '#___#______#___#',
    '###_########_#_#',
    '#____________#_#',
    '#__####______#_#',
    '####__##########',
  ],
];

// マップ名
const MAP_NAMES = ['ワールドマップ', 'はじまりの町', '魔王城'];

// NPCデータ: { x, y, map, lines[], color }
const NPCS = [
  { x: 3, y: 2, map: 1, color: '#e66', name: 'むらびとA',
    lines: ['勇者よ！南に魔王城が\nあるらしいよ！', 'がんばってね〜。\nぼくは寝るから。'] },
  { x: 3, y: 5, map: 1, color: '#6ae', name: 'むらびとB',
    lines: ['この村のパン屋は\nなぜか魚しか売ってない。', 'しかも全部タコ。'] },
  { x: 10, y: 4, map: 1, color: '#ea6', name: 'ネコ',
    lines: ['にゃーん。（回復してあげる）', '＊HPとMPが回復した！＊'] },
  { x: 7, y: 5, map: 2, color: '#f6f', name: '魔王',
    lines: ['よくぞ来たな勇者よ！\nここで終わりだ！'] },
];

// 敵データ
const ENEMIES = {
  slime: { name: 'スライム', hp: 12, atk: 4, def: 1, exp: 6, color: '#4c8' },
  bat:   { name: 'コウモリ', hp: 18, atk: 7, def: 2, exp: 10, color: '#86a' },
  goblin:{ name: 'ゴブリン', hp: 28, atk: 11, def: 5, exp: 18, color: '#a84' },
  skel:  { name: 'ガイコツ', hp: 35, atk: 14, def: 7, exp: 25, color: '#bba' },
  boss:  { name: '魔王さま', hp: 90, atk: 18, def: 10, exp: 0, color: '#f4a' },
};

// エンカウントテーブル（マップ別）
const ENCOUNTERS = {
  0: ['slime', 'slime', 'slime', 'bat', 'bat'],
  2: ['goblin', 'goblin', 'skel', 'skel', 'bat'],
};

// ===== ゲーム状態 =====
let state = {};

function initState() {
  state = {
    phase: 'title', // title, map, msg, battle, victory
    map: 0,
    px: 4, py: 2, // ワールドマップの村の近く
    dir: 0, // 0=下,1=左,2=右,3=上
    hp: 30, maxHp: 30,
    mp: 10, maxMp: 10,
    atk: 8, def: 4,
    level: 1, exp: 0, nextExp: 20,
    items: 3, // やくそうの数
    steps: 0,
    msgQueue: [],
    msgCallback: null,
    battle: null,
    battleCursor: 0, // バトルメニューカーソル位置
    defeatedBoss: false,
  };
}
initState();

// ===== 入力 =====
const keys = {};
const keyJustPressed = {};

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys[e.key] = true;
  keyJustPressed[e.key] = true;

  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'].includes(e.key)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function consumeKey(key) {
  if (keyJustPressed[key]) {
    keyJustPressed[key] = false;
    return true;
  }
  return false;
}

// ===== 描画ヘルパー =====
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ===== タイル描画 =====
function drawTile(tx, ty, ch) {
  const x = tx * T, y = ty * T;
  switch (ch) {
    case '.': // 草
      drawRect(x, y, T, T, C.grass1);
      if ((tx + ty) % 3 === 0) drawRect(x+6, y+4, 2, 2, C.grass2);
      if ((tx + ty) % 5 === 0) drawRect(x+2, y+10, 2, 2, C.grass2);
      break;
    case '#': // 壁
      drawRect(x, y, T, T, C.wall);
      drawRect(x, y, T, 2, C.wallL);
      drawRect(x, y+T-2, T, 2, C.wallD);
      if (tx % 2 === 0) drawRect(x+6, y+4, 4, 8, C.wallD);
      break;
    case '_': // 床
      drawRect(x, y, T, T, C.floor);
      if ((tx + ty) % 4 === 0) drawRect(x+4, y+4, 2, 2, C.floorD);
      break;
    case '~': // 水
      drawRect(x, y, T, T, C.water);
      drawRect(x + ((ty * 3) % 8), y+4, 6, 2, C.waterL);
      break;
    case 'p': // 道
      drawRect(x, y, T, T, C.path);
      if ((tx + ty) % 3 === 0) drawRect(x+5, y+7, 3, 2, C.pathD);
      break;
    case 'T': // 木
      drawRect(x, y, T, T, C.grass1);
      drawRect(x+6, y+9, 4, 7, C.trunk);
      drawRect(x+2, y+2, 12, 8, C.tree);
      drawRect(x+4, y+0, 8, 4, C.treeT);
      break;
    case 'M': // 山
      drawRect(x, y, T, T, C.mtn);
      // 山の三角形
      drawRect(x+2, y+8, 12, 8, C.mtnD);
      drawRect(x+4, y+4, 8, 6, C.mtn);
      drawRect(x+6, y+1, 4, 5, C.mtnL);
      // 雪
      drawRect(x+6, y+1, 4, 2, C.white);
      break;
    case 'B': // 橋
      drawRect(x, y, T, T, C.water);
      // 橋の板
      drawRect(x+1, y+2, 14, 12, C.bridge);
      drawRect(x+1, y+2, 14, 2, C.bridgeD);
      drawRect(x+1, y+12, 14, 2, C.bridgeD);
      // 板目
      drawRect(x+4, y+4, 1, 8, C.bridgeD);
      drawRect(x+8, y+4, 1, 8, C.bridgeD);
      drawRect(x+12, y+4, 1, 8, C.bridgeD);
      break;
    case 'V': // 村（ワールドマップ上）
      drawRect(x, y, T, T, C.grass1);
      // 家のアイコン
      drawRect(x+3, y+7, 10, 8, C.wall);
      drawRect(x+3, y+7, 10, 2, C.wallL);
      // 屋根
      drawRect(x+2, y+4, 12, 4, C.roof);
      drawRect(x+4, y+2, 8, 3, C.roofD);
      // ドア
      drawRect(x+6, y+10, 4, 5, C.door);
      // 点滅マーカー
      {
        const blink = Math.floor(Date.now() / 400) % 2 === 0;
        if (blink) {
          ctx.fillStyle = '#ff0';
          ctx.fillRect(x+7, y-2, 2, 2);
        }
      }
      break;
    case 'K': // 魔王城（ワールドマップ上）
      drawRect(x, y, T, T, C.grass1);
      // 城本体
      drawRect(x+2, y+6, 12, 10, '#443');
      // 塔
      drawRect(x+2, y+2, 4, 6, '#554');
      drawRect(x+10, y+2, 4, 6, '#554');
      // 塔の先端
      drawRect(x+3, y+0, 2, 3, '#665');
      drawRect(x+11, y+0, 2, 3, '#665');
      // 門
      drawRect(x+6, y+9, 4, 7, '#222');
      // 窓（赤く光る）
      {
        const glow = Math.floor(Date.now() / 600) % 2 === 0;
        ctx.fillStyle = glow ? '#f44' : '#a22';
        ctx.fillRect(x+3, y+3, 2, 2);
        ctx.fillRect(x+11, y+3, 2, 2);
      }
      break;
    case 'D': // 扉
      // 背景（マップに合わせた色）
      drawRect(x, y, T, T, C.wall);
      // 扉本体
      drawRect(x+3, y+1, 10, 14, C.door);
      drawRect(x+3, y+1, 10, 2, '#aa8844');
      // ドアノブ
      drawRect(x+10, y+7, 2, 2, '#ffcc44');
      // 点滅する矢印インジケーター
      {
        const blink = Math.floor(Date.now() / 500) % 2 === 0;
        if (blink) {
          ctx.fillStyle = '#ff0';
          ctx.fillRect(x+6, y-2, 4, 2);
          ctx.fillRect(x+7, y-4, 2, 2);
        }
      }
      break;
  }
}

// ===== キャラ描画 =====
function drawPlayer(x, y) {
  // 髪
  drawRect(x+4, y+1, 8, 4, C.hair);
  // 顔
  drawRect(x+4, y+4, 8, 4, C.skin);
  // 目
  drawRect(x+5, y+5, 2, 2, C.black);
  drawRect(x+9, y+5, 2, 2, C.black);
  // 服
  drawRect(x+3, y+8, 10, 5, C.blue);
  drawRect(x+6, y+8, 4, 5, C.blueD);
  // 足
  drawRect(x+4, y+13, 3, 3, '#553322');
  drawRect(x+9, y+13, 3, 3, '#553322');
}

function drawNPC(x, y, color) {
  // 頭
  drawRect(x+4, y+2, 8, 6, color);
  drawRect(x+5, y+4, 2, 2, C.white);
  drawRect(x+9, y+4, 2, 2, C.white);
  drawRect(x+6, y+4, 1, 1, C.black);
  drawRect(x+10, y+4, 1, 1, C.black);
  // 体
  drawRect(x+3, y+8, 10, 5, color);
  // 足
  drawRect(x+4, y+13, 3, 3, C.darkGray);
  drawRect(x+9, y+13, 3, 3, C.darkGray);
}

// 敵スプライト描画（64x64 enemyCanvas用）
function drawEnemySprite(enemy) {
  enemyCtx.clearRect(0, 0, 64, 64);
  const c = enemy.color;
  const s = enemyCtx;

  if (enemy.name === 'スライム') {
    s.fillStyle = c;
    s.beginPath();
    s.ellipse(32, 38, 22, 18, 0, 0, Math.PI * 2);
    s.fill();
    s.fillRect(12, 30, 40, 20);
    s.fillStyle = '#fff';
    s.fillRect(22, 30, 6, 6);
    s.fillRect(36, 30, 6, 6);
    s.fillStyle = '#222';
    s.fillRect(24, 32, 3, 3);
    s.fillRect(38, 32, 3, 3);
    s.fillRect(28, 40, 8, 2);
  } else if (enemy.name === 'コウモリ') {
    s.fillStyle = c;
    s.fillRect(4, 20, 20, 4);
    s.fillRect(40, 20, 20, 4);
    s.fillRect(8, 16, 12, 6);
    s.fillRect(44, 16, 12, 6);
    s.fillRect(22, 18, 20, 18);
    s.fillRect(26, 36, 12, 6);
    s.fillStyle = '#f44';
    s.fillRect(26, 24, 4, 4);
    s.fillRect(34, 24, 4, 4);
    s.fillStyle = '#fff';
    s.fillRect(28, 34, 2, 4);
    s.fillRect(34, 34, 2, 4);
  } else if (enemy.name === 'ゴブリン') {
    s.fillStyle = c;
    s.fillRect(20, 16, 24, 28);
    s.fillRect(16, 22, 32, 16);
    s.fillRect(22, 8, 20, 14);
    s.fillRect(16, 10, 8, 6);
    s.fillRect(40, 10, 8, 6);
    s.fillStyle = '#ff0';
    s.fillRect(26, 14, 4, 4);
    s.fillRect(34, 14, 4, 4);
    s.fillStyle = '#222';
    s.fillRect(28, 15, 2, 2);
    s.fillRect(36, 15, 2, 2);
    s.fillStyle = '#753';
    s.fillRect(22, 44, 8, 8);
    s.fillRect(34, 44, 8, 8);
  } else if (enemy.name === 'ガイコツ') {
    s.fillStyle = c;
    s.fillRect(20, 6, 24, 20);
    s.fillRect(24, 4, 16, 4);
    s.fillStyle = '#333';
    s.fillRect(24, 12, 6, 6);
    s.fillRect(34, 12, 6, 6);
    s.fillStyle = c;
    s.fillRect(26, 26, 4, 20);
    s.fillRect(34, 26, 4, 20);
    s.fillRect(22, 28, 20, 3);
    s.fillRect(22, 34, 20, 3);
    s.fillRect(22, 40, 20, 3);
    s.fillRect(22, 46, 6, 8);
    s.fillRect(36, 46, 6, 8);
  } else {
    // 魔王
    s.fillStyle = '#222';
    s.fillRect(12, 8, 40, 44);
    s.fillStyle = c;
    s.fillRect(16, 12, 32, 36);
    s.fillStyle = '#a44';
    s.fillRect(16, 2, 6, 14);
    s.fillRect(42, 2, 6, 14);
    s.fillStyle = '#ff0';
    s.fillRect(22, 22, 6, 6);
    s.fillRect(36, 22, 6, 6);
    s.fillStyle = '#f00';
    s.fillRect(24, 24, 3, 3);
    s.fillRect(38, 24, 3, 3);
    s.fillStyle = '#400';
    s.fillRect(26, 34, 12, 6);
    s.fillStyle = '#fff';
    s.fillRect(28, 34, 3, 3);
    s.fillRect(33, 34, 3, 3);
    s.fillStyle = '#606';
    s.fillRect(8, 20, 6, 32);
    s.fillRect(50, 20, 6, 32);
  }
}

// ===== マップ描画 =====
function drawMap() {
  const map = MAPS[state.map];
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      drawTile(x, y, map[y][x]);
    }
  }

  // NPC描画
  NPCS.forEach(npc => {
    if (npc.map === state.map) {
      drawNPC(npc.x * T, npc.y * T, npc.color);
    }
  });

  // プレイヤー描画
  drawPlayer(state.px * T, state.py * T);
}

// ===== 通行判定 =====
function canWalk(mx, my) {
  if (mx < 0 || mx >= MW || my < 0 || my >= MH) return false;
  const ch = MAPS[state.map][my][mx];
  if (ch === '#' || ch === '~' || ch === 'T' || ch === 'M') return false;
  // NPC判定
  if (NPCS.some(n => n.map === state.map && n.x === mx && n.y === my)) return false;
  return true;
}

// ===== ステータス更新 =====
function updateStatus() {
  document.getElementById('stat-name').textContent = `ゆうしゃ Lv.${state.level}`;
  document.getElementById('stat-hp').textContent = `HP ${state.hp}/${state.maxHp}`;
  document.getElementById('stat-mp').textContent = `MP ${state.mp}/${state.maxMp}`;
}

// ===== メッセージ表示 =====
function showMsg(text, callback) {
  state.phase = 'msg';
  document.getElementById('msg-box').classList.remove('hidden');
  document.getElementById('msg-text').textContent = text;
  state.msgCallback = callback || null;
}

function closeMsg() {
  document.getElementById('msg-box').classList.add('hidden');
  state.msgCallback = null;
  state.phase = 'map';
}

// 複数メッセージを順番に表示
function showMsgQueue(msgs, finalCallback) {
  if (msgs.length === 0) {
    if (finalCallback) finalCallback();
    else { closeMsg(); }
    return;
  }
  const [first, ...rest] = msgs;
  showMsg(first, () => showMsgQueue(rest, finalCallback));
}

// ===== NPC操作 =====
function interactFacing() {
  const dx = [0, -1, 1, 0][state.dir];
  const dy = [1, 0, 0, -1][state.dir];
  const fx = state.px + dx, fy = state.py + dy;

  const npc = NPCS.find(n => n.map === state.map && n.x === fx && n.y === fy);
  if (npc) {
    if (npc.name === 'ネコ') {
      state.hp = state.maxHp;
      state.mp = state.maxMp;
      updateStatus();
    }
    if (npc.name === '魔王') {
      showMsg(npc.lines[0], () => {
        closeMsg();
        startBattle('boss');
      });
      return;
    }
    showMsgQueue(npc.lines);
    return;
  }

  // 扉・ロケーション
  const ch = MAPS[state.map]?.[fy]?.[fx];
  if (ch === 'D' || ch === 'V' || ch === 'K') {
    enterLocation(fx, fy, ch);
  }
}

// ===== マップ遷移 =====
function enterLocation(_tx, _ty, ch) {
  if (ch === 'V' && state.map === 0) {
    // ワールドマップ → 町
    state.map = 1; state.px = 6; state.py = 9;
    showMsg('はじまりの町に やってきた。');
  } else if (ch === 'K' && state.map === 0) {
    // ワールドマップ → 魔王城
    state.map = 2; state.px = 9; state.py = 1;
    showMsg('魔王城に 足をふみいれた……！');
  } else if (ch === 'D' && state.map === 1) {
    // 町 → ワールドマップ（村の位置の下）
    state.map = 0; state.px = 3; state.py = 4;
    showMsg('ワールドマップに でた。');
  } else if (ch === 'D' && state.map === 2) {
    // 魔王城 → ワールドマップ（城の位置の上）
    state.map = 0; state.px = 13; state.py = 8;
    showMsg('魔王城から でた。');
  }
  updateStatus();
}

// ===== エンカウント =====
function checkEncounter() {
  const table = ENCOUNTERS[state.map];
  if (!table) return;
  const ch = MAPS[state.map][state.py][state.px];
  if (ch === '.' || ch === '_' || ch === 'p') {
    state.steps++;
    if (state.steps >= 8 + Math.floor(Math.random() * 10)) {
      state.steps = 0;
      const key = table[Math.floor(Math.random() * table.length)];
      startBattle(key);
    }
  }
}

// ===== バトルシステム =====
function startBattle(enemyKey) {
  const def = ENEMIES[enemyKey];
  state.battle = {
    enemy: { ...def },
    enemyMaxHp: def.hp,
    key: enemyKey,
    turn: 'player',
    ended: false,
  };
  state.phase = 'battle';

  const overlay = document.getElementById('battle-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('enemy-name').textContent = def.name;
  updateEnemyHp();
  drawEnemySprite(def);
  setBattleLog(`${def.name}が あらわれた！`);
  state.battleCursor = 0;
  updateBattleStatus();
  setBattleButtons(true);
}

function updateEnemyHp() {
  const b = state.battle;
  const pct = Math.max(0, b.enemy.hp / b.enemyMaxHp * 100);
  document.getElementById('enemy-hp-fill').style.width = `${pct}%`;
}

function setBattleLog(text) {
  document.getElementById('battle-log').textContent = text;
}

function setBattleButtons(enabled) {
  document.querySelectorAll('.battle-btn').forEach(btn => {
    btn.disabled = !enabled;
  });
  if (enabled) updateBattleCursor();
}

function updateBattleStatus() {
  document.getElementById('battle-hp').textContent = `HP ${state.hp}/${state.maxHp}`;
  document.getElementById('battle-mp').textContent = `MP ${state.mp}/${state.maxMp}`;
  document.getElementById('battle-items').textContent = `くすり x${state.items}`;
}

function updateBattleCursor() {
  const btns = document.querySelectorAll('.battle-btn');
  btns.forEach((btn, i) => {
    btn.classList.toggle('selected', i === state.battleCursor);
  });
}

function endBattle() {
  state.battle.ended = true;
  document.getElementById('battle-overlay').classList.add('hidden');
  state.phase = 'map';
  state.battle = null;
  updateStatus();
}

function shakeScreen() {
  const el = document.getElementById('screen');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

// バトルボタン
document.querySelectorAll('.battle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!state.battle || state.battle.turn !== 'player') return;
    const action = btn.dataset.action;
    playerAction(action);
  });
});

function playerAction(action) {
  const b = state.battle;
  setBattleButtons(false);

  if (action === 'attack') {
    const dmg = Math.max(1, state.atk - Math.floor(b.enemy.def / 2) + Math.floor(Math.random() * 4));
    b.enemy.hp -= dmg;
    shakeScreen();
    setBattleLog(`ゆうしゃの こうげき！\n${b.enemy.name}に ${dmg}ダメージ！`);
    updateEnemyHp();
  } else if (action === 'magic') {
    if (state.mp < 5) {
      setBattleLog('MPが たりない！');
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    state.mp -= 5;
    updateStatus();
    updateBattleStatus();
    const dmg = Math.max(1, Math.floor(state.atk * 1.5) - Math.floor(b.enemy.def / 3) + Math.floor(Math.random() * 6));
    b.enemy.hp -= dmg;
    shakeScreen();
    setBattleLog(`ゆうしゃは ファイアを となえた！\n${b.enemy.name}に ${dmg}ダメージ！`);
    updateEnemyHp();
  } else if (action === 'item') {
    if (state.items <= 0) {
      setBattleLog('くすりが ない！');
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    state.items--;
    const heal = 15;
    state.hp = Math.min(state.maxHp, state.hp + heal);
    updateStatus();
    updateBattleStatus();
    setBattleLog(`くすりを つかった！\nHPが ${heal}かいふく！`);
  } else if (action === 'run') {
    if (b.key === 'boss') {
      setBattleLog('魔王からは にげられない！');
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    if (Math.random() < 0.7) {
      setBattleLog('うまく にげきれた！');
      setTimeout(() => endBattle(), 1000);
      return;
    }
    setBattleLog('にげられなかった！');
  }

  // 敵HP確認
  setTimeout(() => {
    if (b.enemy.hp <= 0) {
      battleVictory();
      return;
    }
    enemyTurn();
  }, 1200);
}

function enemyTurn() {
  const b = state.battle;
  const dmg = Math.max(1, b.enemy.atk - Math.floor(state.def / 2) + Math.floor(Math.random() * 3));
  state.hp -= dmg;
  if (state.hp < 0) state.hp = 0;
  updateStatus();
  updateBattleStatus();
  shakeScreen();
  setBattleLog(`${b.enemy.name}の こうげき！\nゆうしゃは ${dmg}ダメージ！`);

  setTimeout(() => {
    if (state.hp <= 0) {
      battleDefeat();
      return;
    }
    b.turn = 'player';
    setBattleButtons(true);
  }, 1200);
}

function battleVictory() {
  const b = state.battle;
  const exp = b.enemy.exp;

  if (b.key === 'boss') {
    setBattleLog('魔王を たおした！');
    setTimeout(() => {
      endBattle();
      state.defeatedBoss = true;
      showVictory();
    }, 1500);
    return;
  }

  state.exp += exp;
  setBattleLog(`${b.enemy.name}を たおした！\n${exp}けいけんち を てにいれた！`);

  setTimeout(() => {
    if (state.exp >= state.nextExp) {
      levelUp();
    } else {
      endBattle();
    }
  }, 1500);
}

function levelUp() {
  state.level++;
  state.exp -= state.nextExp;
  state.nextExp = Math.floor(state.nextExp * 1.4);
  state.maxHp += 5;
  state.hp = state.maxHp;
  state.maxMp += 2;
  state.mp = state.maxMp;
  state.atk += 2;
  state.def += 1;
  updateStatus();
  updateBattleStatus();

  setBattleLog(`レベルアップ！ Lv.${state.level}！\nつよくなった！`);
  setTimeout(() => endBattle(), 1500);
}

function battleDefeat() {
  setBattleLog('ゆうしゃは たおれた……');
  setTimeout(() => {
    endBattle();
    // 町に戻してHP回復
    state.map = 1; state.px = 6; state.py = 9;
    state.hp = Math.floor(state.maxHp / 2);
    state.mp = Math.floor(state.maxMp / 2);
    updateStatus();
    showMsg('目が覚めた……\nどうやら村に運ばれたようだ。');
  }, 1500);
}

// ===== 勝利画面 =====
function showVictory() {
  state.phase = 'victory';
  document.getElementById('victory-screen').classList.remove('hidden');
  document.getElementById('victory-sub').textContent =
    `Lv.${state.level}で クリア！\nこの世界に平和がおとずれた……\nたぶん。`;
}

// ===== マップ移動 =====
let moveDelay = 0;

function updateMap() {
  if (moveDelay > 0) { moveDelay--; return; }

  let dx = 0, dy = 0;
  if (keys['ArrowDown'])  { dy = 1; state.dir = 0; }
  else if (keys['ArrowLeft'])  { dx = -1; state.dir = 1; }
  else if (keys['ArrowRight']) { dx = 1; state.dir = 2; }
  else if (keys['ArrowUp'])    { dy = -1; state.dir = 3; }

  if (dx !== 0 || dy !== 0) {
    const nx = state.px + dx, ny = state.py + dy;
    const ch = MAPS[state.map]?.[ny]?.[nx];
    // ロケーションタイル（V/K/D）は踏んで遷移
    if (ch === 'V' || ch === 'K' || ch === 'D') {
      enterLocation(nx, ny, ch);
      moveDelay = 10;
    } else if (canWalk(nx, ny)) {
      state.px = nx;
      state.py = ny;
      moveDelay = 6;
      checkEncounter();
    }
  }

  if (consumeKey(' ') || consumeKey('Enter')) {
    interactFacing();
  }
}

// ===== ゲームループ =====
function gameLoop() {
  // 画面クリア
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 256, 192);

  if (state.phase === 'map') {
    updateMap();
    drawMap();
  } else if (state.phase === 'msg') {
    drawMap();
    if (consumeKey(' ') || consumeKey('Enter')) {
      if (state.msgCallback) {
        state.msgCallback();
      } else {
        closeMsg();
      }
    }
  } else if (state.phase === 'battle') {
    // バトルメニューのキーボード操作（2x2グリッド）
    if (state.battle && state.battle.turn === 'player') {
      const btns = document.querySelectorAll('.battle-btn');
      if (!btns[0].disabled) {
        if (consumeKey('ArrowLeft')) {
          if (state.battleCursor % 2 === 1) state.battleCursor--;
          updateBattleCursor();
        } else if (consumeKey('ArrowRight')) {
          if (state.battleCursor % 2 === 0) state.battleCursor++;
          updateBattleCursor();
        } else if (consumeKey('ArrowUp')) {
          if (state.battleCursor >= 2) state.battleCursor -= 2;
          updateBattleCursor();
        } else if (consumeKey('ArrowDown')) {
          if (state.battleCursor < 2) state.battleCursor += 2;
          updateBattleCursor();
        } else if (consumeKey(' ') || consumeKey('Enter')) {
          const action = btns[state.battleCursor].dataset.action;
          playerAction(action);
        }
      }
    }
  } else if (state.phase === 'title') {
    if (consumeKey(' ') || consumeKey('Enter')) {
      document.getElementById('start-btn').click();
    }
  } else if (state.phase === 'victory') {
    if (consumeKey(' ') || consumeKey('Enter')) {
      document.getElementById('victory-btn').click();
    }
  }

  // keyJustPressedリセット
  Object.keys(keyJustPressed).forEach(k => keyJustPressed[k] = false);

  requestAnimationFrame(gameLoop);
}

// ===== タイトル画面 =====
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('title-screen').classList.add('hidden');
  initState();
  state.phase = 'map';
  updateStatus();
  showMsgQueue([
    'ここは へいわな村……\nのはずだったが、魔王があらわれた。',
    'まずは村の人に話を聞こう。\n南に出れば冒険の世界が広がるぞ！',
    '（矢印キーで移動 / スペースで調べる）',
  ]);
});

document.getElementById('victory-btn').addEventListener('click', () => {
  document.getElementById('victory-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
});

// スタート
gameLoop();
