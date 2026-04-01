// ============================================================
//  お散歩日和 〜じゅまんどぅに届け〜 - 恋愛RPG
// ============================================================

// ===== 共通モジュール初期化 =====
const sg = SurrealGames.init('rpg');

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
  pink: '#ff69b4', pinkD: '#cc5599', pinkL: '#ffaacc',
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
  // マップ2: 魔王城（じゅまんどぅの城）
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
const MAP_NAMES = ['ワールドマップ', 'はじまりの町', 'じゅまんどぅの城'];

// NPCデータ
const NPCS = [
  { x: 3, y: 2, map: 1, color: '#e66', name: 'おじさんA',
    lines: ['南の城に超かわいい\n「じゅまんどぅ」がいるらしいよ！', '恋愛経験値をためないと\n相手にしてもらえないかもね〜。'] },
  { x: 3, y: 5, map: 1, color: '#6ae', name: 'おじさんB',
    lines: ['この村のコンビニは\nなぜかプレゼントだけ売ってる。', 'しかも全部高い。'] },
  { x: 10, y: 4, map: 1, color: '#ea6', name: 'ネコ',
    lines: ['にゃーん。（元気が出てきた）', '＊精神力と経済力が回復した！＊'] },
  { x: 7, y: 5, map: 2, color: '#f6f', name: 'じゅまんどぅ',
    lines: ['ふーん、ここまで来たんだ。\nあたしを落とせると思ってる？'] },
];

// 敵データ（女の子たち）— ハートゲージの最大値がmaxHeart
const ENEMIES = {
  busunko:   { name: 'ぶすんこ',   maxHeart: 10, charm: 3, resist: 1, exp: 6,  color: '#8a7' },
  futsunnu:  { name: 'ふつうんぬ', maxHeart: 16, charm: 5, resist: 2, exp: 10, color: '#7ad' },
  choikawami:{ name: 'ちょいかわみ', maxHeart: 24, charm: 8, resist: 4, exp: 18, color: '#e8a' },
  modekawa:  { name: 'もできゃわ', maxHeart: 32, charm: 11, resist: 6, exp: 25, color: '#f8c' },
  takanen:   { name: 'たかねん',   maxHeart: 40, charm: 14, resist: 8, exp: 35, color: '#da6' },
  boss:      { name: 'じゅまんどぅ', maxHeart: 80, charm: 18, resist: 10, exp: 0, color: '#f4a' },
};

// エンカウントテーブル（マップ別）
const ENCOUNTERS = {
  0: ['busunko', 'busunko', 'busunko', 'futsunnu', 'futsunnu'],
  2: ['choikawami', 'choikawami', 'modekawa', 'modekawa', 'takanen'],
};

// ===== ゲーム状態 =====
let state = {};

function initState() {
  state = {
    phase: 'title', // title, map, msg, battle, victory
    map: 0,
    px: 4, py: 2, // ワールドマップの村の近く
    dir: 0, // 0=下,1=左,2=右,3=上
    hp: 30, maxHp: 30,       // 精神力
    mp: 10, maxMp: 10,       // 経済力
    atk: 8, def: 4,          // 口説き力, メンタル防御
    level: 1, exp: 0, nextExp: 20,
    girlfriends: 0,          // 彼女の数
    steps: 0,
    msgQueue: [],
    msgCallback: null,
    battle: null,
    battleCursor: 0,
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
      drawRect(x+2, y+8, 12, 8, C.mtnD);
      drawRect(x+4, y+4, 8, 6, C.mtn);
      drawRect(x+6, y+1, 4, 5, C.mtnL);
      drawRect(x+6, y+1, 4, 2, C.white);
      break;
    case 'B': // 橋
      drawRect(x, y, T, T, C.water);
      drawRect(x+1, y+2, 14, 12, C.bridge);
      drawRect(x+1, y+2, 14, 2, C.bridgeD);
      drawRect(x+1, y+12, 14, 2, C.bridgeD);
      drawRect(x+4, y+4, 1, 8, C.bridgeD);
      drawRect(x+8, y+4, 1, 8, C.bridgeD);
      drawRect(x+12, y+4, 1, 8, C.bridgeD);
      break;
    case 'V': // 村（ワールドマップ上）
      drawRect(x, y, T, T, C.grass1);
      drawRect(x+3, y+7, 10, 8, C.wall);
      drawRect(x+3, y+7, 10, 2, C.wallL);
      drawRect(x+2, y+4, 12, 4, C.roof);
      drawRect(x+4, y+2, 8, 3, C.roofD);
      drawRect(x+6, y+10, 4, 5, C.door);
      {
        const blink = Math.floor(Date.now() / 400) % 2 === 0;
        if (blink) {
          ctx.fillStyle = '#ff0';
          ctx.fillRect(x+7, y-2, 2, 2);
        }
      }
      break;
    case 'K': // じゅまんどぅの城（ワールドマップ上）
      drawRect(x, y, T, T, C.grass1);
      drawRect(x+2, y+6, 12, 10, '#443');
      drawRect(x+2, y+2, 4, 6, '#554');
      drawRect(x+10, y+2, 4, 6, '#554');
      drawRect(x+3, y+0, 2, 3, '#665');
      drawRect(x+11, y+0, 2, 3, '#665');
      drawRect(x+6, y+9, 4, 7, '#222');
      // ハートマーク点滅
      {
        const glow = Math.floor(Date.now() / 600) % 2 === 0;
        ctx.fillStyle = glow ? '#f4a' : '#a22';
        ctx.fillRect(x+3, y+3, 2, 2);
        ctx.fillRect(x+11, y+3, 2, 2);
      }
      break;
    case 'D': // 扉
      drawRect(x, y, T, T, C.wall);
      drawRect(x+3, y+1, 10, 14, C.door);
      drawRect(x+3, y+1, 10, 2, '#aa8844');
      drawRect(x+10, y+7, 2, 2, '#ffcc44');
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

// 敵スプライト描画（64x64 enemyCanvas用）— 女の子キャラ
function drawEnemySprite(enemy) {
  enemyCtx.clearRect(0, 0, 64, 64);
  const c = enemy.color;
  const s = enemyCtx;

  if (enemy.name === 'ぶすんこ') {
    // ボサボサ髪
    s.fillStyle = '#654';
    s.fillRect(16, 4, 32, 16);
    s.fillRect(12, 8, 40, 10);
    // 顔
    s.fillStyle = '#fdb';
    s.fillRect(18, 16, 28, 22);
    // 目（ジト目）
    s.fillStyle = '#333';
    s.fillRect(22, 24, 8, 3);
    s.fillRect(36, 24, 8, 3);
    // 口（への字）
    s.fillRect(28, 32, 10, 2);
    // 体
    s.fillStyle = c;
    s.fillRect(18, 38, 28, 18);
    // 足
    s.fillStyle = '#864';
    s.fillRect(22, 52, 8, 8);
    s.fillRect(34, 52, 8, 8);
  } else if (enemy.name === 'ふつうんぬ') {
    // 髪
    s.fillStyle = '#543';
    s.fillRect(18, 4, 28, 14);
    s.fillRect(14, 10, 36, 8);
    // 顔
    s.fillStyle = '#fdc';
    s.fillRect(18, 16, 28, 22);
    // 目
    s.fillStyle = '#333';
    s.fillRect(24, 22, 5, 5);
    s.fillRect(36, 22, 5, 5);
    s.fillStyle = '#fff';
    s.fillRect(25, 23, 2, 2);
    s.fillRect(37, 23, 2, 2);
    // 口
    s.fillStyle = '#e88';
    s.fillRect(29, 32, 6, 2);
    // 体
    s.fillStyle = c;
    s.fillRect(18, 38, 28, 18);
    s.fillRect(14, 40, 36, 4);
    // 足
    s.fillStyle = '#654';
    s.fillRect(22, 52, 8, 8);
    s.fillRect(34, 52, 8, 8);
  } else if (enemy.name === 'ちょいかわみ') {
    // ロングヘア
    s.fillStyle = '#864';
    s.fillRect(16, 2, 32, 16);
    s.fillRect(12, 8, 8, 30);
    s.fillRect(44, 8, 8, 30);
    // 顔
    s.fillStyle = '#fed';
    s.fillRect(18, 14, 28, 24);
    // 目（キラキラ）
    s.fillStyle = '#48c';
    s.fillRect(24, 22, 6, 6);
    s.fillRect(36, 22, 6, 6);
    s.fillStyle = '#fff';
    s.fillRect(26, 23, 3, 3);
    s.fillRect(38, 23, 3, 3);
    // 口（にっこり）
    s.fillStyle = '#f88';
    s.fillRect(28, 33, 8, 2);
    s.fillRect(30, 35, 4, 1);
    // 体
    s.fillStyle = c;
    s.fillRect(18, 38, 28, 18);
    // 足
    s.fillStyle = '#c98';
    s.fillRect(22, 52, 8, 8);
    s.fillRect(34, 52, 8, 8);
  } else if (enemy.name === 'もできゃわ') {
    // ツインテール
    s.fillStyle = '#f8a';
    s.fillRect(18, 2, 28, 14);
    s.fillRect(8, 4, 12, 34);
    s.fillRect(44, 4, 12, 34);
    // リボン
    s.fillStyle = '#f44';
    s.fillRect(10, 6, 8, 4);
    s.fillRect(46, 6, 8, 4);
    // 顔
    s.fillStyle = '#fee';
    s.fillRect(18, 14, 28, 24);
    // 目（大きめ・キラキラ）
    s.fillStyle = '#e4a';
    s.fillRect(22, 20, 8, 8);
    s.fillRect(34, 20, 8, 8);
    s.fillStyle = '#fff';
    s.fillRect(24, 21, 4, 4);
    s.fillRect(36, 21, 4, 4);
    // まつ毛
    s.fillStyle = '#333';
    s.fillRect(22, 19, 8, 1);
    s.fillRect(34, 19, 8, 1);
    // 口
    s.fillStyle = '#f66';
    s.fillRect(28, 33, 8, 3);
    // 体
    s.fillStyle = c;
    s.fillRect(18, 38, 28, 18);
    // 足
    s.fillStyle = '#fcc';
    s.fillRect(22, 52, 8, 8);
    s.fillRect(34, 52, 8, 8);
  } else if (enemy.name === 'たかねん') {
    // エレガントヘア
    s.fillStyle = '#fb4';
    s.fillRect(14, 0, 36, 18);
    s.fillRect(10, 6, 8, 34);
    s.fillRect(46, 6, 8, 34);
    // ティアラ
    s.fillStyle = '#ff0';
    s.fillRect(22, 0, 20, 3);
    s.fillRect(30, -2, 4, 4);
    // 顔
    s.fillStyle = '#fef';
    s.fillRect(18, 14, 28, 24);
    // 目（クール）
    s.fillStyle = '#84f';
    s.fillRect(24, 22, 6, 5);
    s.fillRect(36, 22, 6, 5);
    s.fillStyle = '#fff';
    s.fillRect(26, 23, 2, 2);
    s.fillRect(38, 23, 2, 2);
    // 口
    s.fillStyle = '#c66';
    s.fillRect(30, 33, 4, 2);
    // 体
    s.fillStyle = c;
    s.fillRect(16, 38, 32, 18);
    // ネックレス
    s.fillStyle = '#ff0';
    s.fillRect(28, 38, 8, 2);
    s.fillRect(31, 40, 2, 2);
    // 足
    s.fillStyle = '#da6';
    s.fillRect(22, 52, 8, 8);
    s.fillRect(34, 52, 8, 8);
  } else {
    // じゅまんどぅ（ラスボス）
    s.fillStyle = '#222';
    s.fillRect(12, 8, 40, 44);
    s.fillStyle = c;
    s.fillRect(16, 12, 32, 36);
    // 角（ハート型の飾り）
    s.fillStyle = '#f4a';
    s.fillRect(16, 2, 6, 14);
    s.fillRect(42, 2, 6, 14);
    // 目（魅惑的）
    s.fillStyle = '#ff0';
    s.fillRect(22, 22, 6, 6);
    s.fillRect(36, 22, 6, 6);
    s.fillStyle = '#f00';
    s.fillRect(24, 24, 3, 3);
    s.fillRect(38, 24, 3, 3);
    // 口（妖艶）
    s.fillStyle = '#f06';
    s.fillRect(26, 34, 12, 4);
    s.fillStyle = '#fff';
    s.fillRect(28, 34, 3, 3);
    s.fillRect(33, 34, 3, 3);
    // マント
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
  if (NPCS.some(n => n.map === state.map && n.x === mx && n.y === my)) return false;
  return true;
}

// ===== ステータス更新 =====
function updateStatus() {
  document.getElementById('stat-name').textContent = `ゆうしゃ Lv.${state.level}`;
  document.getElementById('stat-hp').textContent = `精神力 ${state.hp}/${state.maxHp}`;
  document.getElementById('stat-mp').textContent = `経済力 ${state.mp}/${state.maxMp}`;
  document.getElementById('stat-gf').textContent = `彼女 ${state.girlfriends}人`;
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
    if (npc.name === 'じゅまんどぅ') {
      showMsg(npc.lines[0], () => {
        closeMsg();
        startBattle('boss');
      });
      return;
    }
    showMsgQueue(npc.lines);
    return;
  }

  const ch = MAPS[state.map]?.[fy]?.[fx];
  if (ch === 'D' || ch === 'V' || ch === 'K') {
    enterLocation(fx, fy, ch);
  }
}

// ===== マップ遷移 =====
function enterLocation(_tx, _ty, ch) {
  if (ch === 'V' && state.map === 0) {
    state.map = 1; state.px = 6; state.py = 9;
    showMsg('はじまりの町に やってきた。');
  } else if (ch === 'K' && state.map === 0) {
    state.map = 2; state.px = 9; state.py = 1;
    showMsg('じゅまんどぅの城に\n足をふみいれた……！');
  } else if (ch === 'D' && state.map === 1) {
    state.map = 0; state.px = 3; state.py = 4;
    showMsg('ワールドマップに でた。');
  } else if (ch === 'D' && state.map === 2) {
    state.map = 0; state.px = 13; state.py = 8;
    showMsg('じゅまんどぅの城から でた。');
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

// ===== バトルシステム（恋愛版） =====
function startBattle(enemyKey) {
  const def = ENEMIES[enemyKey];
  state.battle = {
    enemy: { ...def },
    heartFilled: 0,       // 現在のハートゲージ充填量
    key: enemyKey,
    turn: 'player',
    ended: false,
  };
  state.phase = 'battle';

  const overlay = document.getElementById('battle-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('enemy-name').textContent = def.name;
  updateEnemyHeart();
  drawEnemySprite(def);
  setBattleLog(`${def.name}が あらわれた！`);
  state.battleCursor = 0;
  updateBattleStatus();
  setBattleButtons(true);
}

function updateEnemyHeart() {
  const b = state.battle;
  // ハートゲージは充填していく（0%→100%）
  const pct = Math.min(100, b.heartFilled / b.enemy.maxHeart * 100);
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
  document.getElementById('battle-hp').textContent = `精神力 ${state.hp}/${state.maxHp}`;
  document.getElementById('battle-mp').textContent = `経済力 ${state.mp}/${state.maxMp}`;
  document.getElementById('battle-gf').textContent = `彼女 ${state.girlfriends}人`;
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

  if (action === 'confess') {
    // 告白する — 口説き力ベースのハート充填
    const fill = Math.max(1, state.atk - Math.floor(b.enemy.resist / 2) + Math.floor(Math.random() * 4));
    b.heartFilled += fill;
    shakeScreen();
    setBattleLog(`ゆうしゃは 告白した！\n${b.enemy.name}のハートが ${fill}たまった！`);
    updateEnemyHeart();
  } else if (action === 'praise') {
    // 褒める — 中程度のハート充填（MP不要）
    const fill = Math.max(1, Math.floor(state.atk * 0.7) + Math.floor(Math.random() * 3));
    b.heartFilled += fill;
    setBattleLog(`ゆうしゃは ${b.enemy.name}を褒めた！\nハートが ${fill}たまった！`);
    updateEnemyHeart();
  } else if (action === 'gift') {
    // プレゼントする — 効果大だが経済力を消費
    if (state.mp < 4) {
      setBattleLog('経済力が たりない！');
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    state.mp -= 4;
    updateStatus();
    updateBattleStatus();
    const fill = Math.max(1, Math.floor(state.atk * 1.8) - Math.floor(b.enemy.resist / 3) + Math.floor(Math.random() * 6));
    b.heartFilled += fill;
    shakeScreen();
    setBattleLog(`ゆうしゃは プレゼントを渡した！\n${b.enemy.name}のハートが ${fill}たまった！`);
    updateEnemyHeart();
  } else if (action === 'run') {
    if (b.key === 'boss') {
      setBattleLog('じゅまんどぅからは にげられない！');
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

  // ハートゲージMAX確認
  setTimeout(() => {
    if (b.heartFilled >= b.enemy.maxHeart) {
      battleVictory();
      return;
    }
    enemyTurn();
  }, 1200);
}

function enemyTurn() {
  const b = state.battle;
  // 相手のリアクション — 精神力にダメージ
  const dmg = Math.max(1, b.enemy.charm - Math.floor(state.def / 2) + Math.floor(Math.random() * 3));
  state.hp -= dmg;
  if (state.hp < 0) state.hp = 0;
  updateStatus();
  updateBattleStatus();
  shakeScreen();

  // リアクション台詞ランダム
  const reactions = [
    `${b.enemy.name}は つめたい視線を\nむけてきた！精神力 -${dmg}`,
    `${b.enemy.name}に「キモい」と\n言われた！精神力 -${dmg}`,
    `${b.enemy.name}は スマホを\nいじりだした！精神力 -${dmg}`,
    `${b.enemy.name}に ため息を\nつかれた！精神力 -${dmg}`,
  ];
  setBattleLog(reactions[Math.floor(Math.random() * reactions.length)]);

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
    setBattleLog('じゅまんどぅが デレた！');
    setTimeout(() => {
      endBattle();
      state.defeatedBoss = true;
      state.girlfriends++;
      showVictory();
    }, 1500);
    return;
  }

  state.girlfriends++;
  state.exp += exp;
  setBattleLog(`${b.enemy.name}が 彼女になった！\n恋愛経験値 +${exp}！`);

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

  setBattleLog(`恋愛レベルアップ！ Lv.${state.level}！\nモテ力が上がった！`);
  setTimeout(() => endBattle(), 1500);
}

function battleDefeat() {
  setBattleLog('ゆうしゃは 心が折れた……');
  setTimeout(() => {
    endBattle();
    state.map = 1; state.px = 6; state.py = 9;
    state.hp = Math.floor(state.maxHp / 2);
    state.mp = Math.floor(state.maxMp / 2);
    updateStatus();
    showMsg('目が覚めた……\n精神力が回復して町に戻っていた。');
  }, 1500);
}

// ===== 勝利画面 =====
function showVictory() {
  state.phase = 'victory';
  sg.onGameEnd(state.level);
  document.getElementById('victory-screen').classList.remove('hidden');
  document.getElementById('victory-sub').textContent =
    `Lv.${state.level}、彼女${state.girlfriends}人でクリア！\nじゅまんどぅとラブラブだ！\n……たぶん。`;
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

  Object.keys(keyJustPressed).forEach(k => keyJustPressed[k] = false);
  requestAnimationFrame(gameLoop);
}

// ===== タイトル画面 =====
document.getElementById('start-btn').addEventListener('click', () => {
  sg.onGameStart();
  document.getElementById('title-screen').classList.add('hidden');
  initState();
  state.phase = 'map';
  updateStatus();
  showMsgQueue([
    'ある日ゆうしゃは聞いた。\n南の城に超絶美少女がいると。',
    'その名は「じゅまんどぅ」。\n彼女に告白するのが夢だ。',
    'だがモテない男には相手に\nされない。まず恋愛経験を積もう！',
    '（矢印キーで移動 / スペースで調べる）',
  ]);
});

document.getElementById('victory-btn').addEventListener('click', () => {
  document.getElementById('victory-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
});

// スタート
gameLoop();

// ===== モバイル操作パッド =====
const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const mobileControls = document.getElementById('mobile-controls');

if (isMobile && mobileControls) {
  mobileControls.classList.remove('hidden');

  let holdIntervals = {};

  document.querySelectorAll('.dpad-btn, #action-btn').forEach(btn => {
    const keyName = btn.dataset.key;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keys[keyName] = true;
      keyJustPressed[keyName] = true;

      if (keyName.startsWith('Arrow')) {
        clearInterval(holdIntervals[keyName]);
        holdIntervals[keyName] = setInterval(() => {
          keys[keyName] = true;
          keyJustPressed[keyName] = true;
        }, 150);
      }
    }, { passive: false });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      keys[keyName] = false;
      clearInterval(holdIntervals[keyName]);
    }, { passive: false });

    btn.addEventListener('touchcancel', (e) => {
      keys[keyName] = false;
      clearInterval(holdIntervals[keyName]);
    });
  });
}
