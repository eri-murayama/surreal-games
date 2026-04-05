// ============================================================
//  お散歩日和 〜じゅまんどぅに届け〜 - 恋愛RPG
// ============================================================

// ===== 共通モジュール初期化 =====
const sg = SurrealGames.init('rpg');

// ===== 多言語対応 =====
let currentLang = (function() {
  try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
  return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
})();

const LANG_RPG = {
  ja: {
    mapNames: ['ワールドマップ', 'はじまりの町', 'じゅまんどぅの城'],
    statName: (lv) => `ゆうしゃ Lv.${lv}`,
    statHp: (hp, max) => `精神力 ${hp}/${max}`,
    statMoney: (m) => `${m.toLocaleString()}ギュニー`,
    statGf: (n) => `彼女 ${n}人`,
    battleHp: (hp, max) => `精神力 ${hp}/${max}`,
    battleMoney: (m) => `${m.toLocaleString()}ギュニー`,
    battleGf: (n) => `彼女 ${n}人`,
    appeared: (name) => `${name}が あらわれた！`,
    confessLog: (name, fill) => `ゆうしゃは 告白した！\n${name}のハートが ${fill}たまった！`,
    praiseLog: (name, fill) => `ゆうしゃは ${name}を褒めた！\nハートが ${fill}たまった！`,
    giftLog: (name, item, fill) => `ゆうしゃは ${item}を渡した！\n${name}のハートが ${fill}たまった！`,
    noGift: 'プレゼントを 持っていない！',
    cantRunBoss: 'じゅまんどぅからは にげられない！',
    ranAway: 'うまく にげきれた！',
    cantRun: 'にげられなかった！',
    reactions: (name, dmg) => [
      `${name}は つめたい視線を\nむけてきた！精神力 -${dmg}`,
      `${name}に「キモい」と\n言われた！精神力 -${dmg}`,
      `${name}は スマホを\nいじりだした！精神力 -${dmg}`,
      `${name}に ため息を\nつかれた！精神力 -${dmg}`,
    ],
    bossDefeated: 'じゅまんどぅが デレた！',
    gotGirlfriend: (name, exp) => `${name}が 彼女になった！\n恋愛経験値 +${exp}！`,
    levelUp: (lv) => `恋愛レベルアップ！ Lv.${lv}！\nモテ力が上がった！`,
    heartBroken: 'ゆうしゃは 心が折れた……',
    revivedMsg: '目が覚めた……\n精神力が回復して町に戻っていた。',
    gainMoney: (n) => `${n.toLocaleString()}ギュニー 手に入れた！`,
    victorySub: (lv, gf) => `Lv.${lv}、彼女${gf}人でクリア！\nじゅまんどぅとラブラブだ！\n……たぶん。`,
    enterTown: 'はじまりの町に やってきた。\n（プレゼント屋が近くにいる！）',
    enterCastle: 'じゅまんどぅの城に\n足をふみいれた……！',
    exitTown: 'ワールドマップに でた。',
    exitCastle: 'じゅまんどぅの城から でた。',
    introLines: [
      '俺の名前は　ネクラ　チギュオ　！\nもうすぐで30歳！',
      'そろそろ彼女が欲しい年頃だ。\nまあ今まで機会がなかっただけだし、',
      '俺にかかれば彼女の一人や二人\n余裕だろ。',
      'よおし、さっそく可愛い子でも\nナンパしにいくか！',
      '（矢印キーで移動 / スペースで調べる）',
    ],
    npcLines: {
      'おじさんA': ['南の城に超かわいい\n「じゅまんどぅ」がいるらしいよ！', '恋愛経験値をためないと\n相手にしてもらえないかもね〜。'],
      'おじさんB': ['この町にはプレゼント屋が\nあるぞ。女にモテたいなら\n買っていきな。', 'しかも全部高い。ギュニー貯めないとな。'],
      'ネコ': ['にゃーん。（元気が出てきた）', '＊精神力が回復した！＊'],
      'じゅまんどぅ': ['ふーん、ここまで来たんだ。\nあたしを落とせると思ってる？'],
    },
  },
  en: {
    mapNames: ['World Map', 'Starting Town', "Jumandou's Castle"],
    statName: (lv) => `Hero Lv.${lv}`,
    statHp: (hp, max) => `Spirit ${hp}/${max}`,
    statMoney: (m) => `${m.toLocaleString()} Gyuney`,
    statGf: (n) => `GFs: ${n}`,
    battleHp: (hp, max) => `Spirit ${hp}/${max}`,
    battleMoney: (m) => `${m.toLocaleString()} Gyuney`,
    battleGf: (n) => `GFs: ${n}`,
    appeared: (name) => `${name} appeared!`,
    confessLog: (name, fill) => `Hero confessed!\n${name}'s heart filled by ${fill}!`,
    praiseLog: (name, fill) => `Hero complimented ${name}!\nHeart filled by ${fill}!`,
    giftLog: (name, item, fill) => `Hero gave ${item}!\n${name}'s heart filled by ${fill}!`,
    noGift: 'No gifts in inventory!',
    cantRunBoss: "Can't escape from Jumandou!",
    ranAway: 'Got away safely!',
    cantRun: "Couldn't escape!",
    reactions: (name, dmg) => [
      `${name} gave you\nan icy stare! Spirit -${dmg}`,
      `${name} said "Ew."\nSpirit -${dmg}`,
      `${name} started\nscrolling their phone! Spirit -${dmg}`,
      `${name} sighed\nat you! Spirit -${dmg}`,
    ],
    bossDefeated: 'Jumandou fell for you!',
    gotGirlfriend: (name, exp) => `${name} became your GF!\nLove EXP +${exp}!`,
    levelUp: (lv) => `Love Level UP! Lv.${lv}!\nCharm power increased!`,
    heartBroken: "Hero's heart was shattered...",
    revivedMsg: "Woke up...\nSpirit recovered and you're back in town.",
    gainMoney: (n) => `Got ${n.toLocaleString()} Gyuney!`,
    victorySub: (lv, gf) => `Lv.${lv}, ${gf} GFs — cleared!\nYou and Jumandou are in love!\n...Probably.`,
    enterTown: 'Arrived at Starting Town.\n(A gift shop is nearby!)',
    enterCastle: "Stepped into\nJumandou's Castle...!",
    exitTown: 'Returned to the World Map.',
    exitCastle: "Left Jumandou's Castle.",
    introLines: [
      "My name is Nekura Chiguo!\nAlmost 30 years old!",
      "I'm at the age when a guy wants a girlfriend.\nI just never had the chance 'til now,",
      'but with my charm, one or two girlfriends\nshould be easy.',
      'Alright, time to go pick up\nsome cute girls!',
      '(Arrow keys to move / Space to interact)',
    ],
    npcLines: {
      'おじさんA': ['I hear a super cute girl named\n"Jumandou" lives in the southern castle!', "You'll need love experience\nor she won't give you the time of day~"],
      'おじさんB': ["This town has a gift shop.\nIf you want to score with ladies,\nbuy some stuff.", "They're all expensive though.\nSave up your Gyuney."],
      'ネコ': ['Meow~ (You feel energized!)', '* Spirit restored! *'],
      'じゅまんどぅ': ["Hmm, you made it this far.\nYou think you can win me over?"],
    },
  },
};

function tl(key, ...args) {
  const val = LANG_RPG[currentLang][key];
  if (typeof val === 'function') return val(...args);
  return val;
}

window.addEventListener('surreal-lang-change', function(e) {
  if (e.detail && e.detail.lang) currentLang = e.detail.lang;
});

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
    lines: ['にゃーん。（元気が出てきた）', '＊精神力が回復した！＊'] },
  { x: 7, y: 5, map: 2, color: '#f6f', name: 'じゅまんどぅ',
    lines: ['ふーん、ここまで来たんだ。\nあたしを落とせると思ってる？'] },
  { x: 2, y: 3, map: 1, color: '#776655', name: 'ニトオ',
    lines: ['ニトオ「よう、また来たか」'] },
  { x: 5, y: 9, map: 1, color: '#fa8', name: 'プレゼント屋',
    lines: ['プレゼント屋'] },
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
    atk: 8, def: 4,          // 口説き力, メンタル防御
    level: 1, exp: 0, nextExp: 20,
    girlfriends: 0,          // 彼女の数
    steps: 0,
    msgQueue: [],
    msgCallback: null,
    battle: null,
    battleCursor: 0,
    defeatedBoss: false,
    chiguoIntro: true,       // 最初の一歩でブスンコ強制バトル
    money: 0,                // ギュニー
    unlockedMoves: [],       // 解放された攻撃技（順番に追加）
    presents: {},            // プレゼント在庫 { flower: 2, ring: 1, ... }
  };
}

// ===== 技データ =====
const MOVES = {
  greet:   { label: '挨拶をする', name: '挨拶' },
  praise:  { label: '褒める',     name: '褒め' },
  confess: { label: '告白する',   name: '告白' },
  gift:    { label: 'プレゼント', name: 'プレゼント' },
};
const UNLOCK_ORDER = ['greet', 'praise', 'confess', 'gift'];
const MOVE_PRICE = 100000;

// ===== プレゼント商品（お店で購入） =====
// fill: ハートゲージ充填量、price: ギュニー
const PRESENTS = {
  flower:   { name: '花束',             price:   3000, fill: 8 },
  choco:    { name: '高級チョコ',       price:  10000, fill: 18 },
  perfume:  { name: '香水',             price:  30000, fill: 35 },
  ring:     { name: '指輪',             price:  80000, fill: 60 },
  bag:      { name: 'ブランドバッグ',   price: 200000, fill: 120 },
};
const PRESENT_ORDER = ['flower', 'choco', 'perfume', 'ring', 'bag'];
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
  document.getElementById('stat-name').textContent = tl('statName', state.level);
  document.getElementById('stat-hp').textContent = tl('statHp', state.hp, state.maxHp);
  document.getElementById('stat-gf').textContent = tl('statGf', state.girlfriends);
  const moneyEl = document.getElementById('stat-money');
  if (moneyEl) moneyEl.textContent = tl('statMoney', state.money);
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
      updateStatus();
    }
    const npcLines = tl('npcLines')[npc.name] || npc.lines;
    if (npc.name === 'じゅまんどぅ') {
      showMsg(npcLines[0], () => {
        closeMsg();
        startBattle('boss');
      });
      return;
    }
    if (npc.name === 'ニトオ') {
      handleNitooTalk();
      return;
    }
    if (npc.name === 'プレゼント屋') {
      openShop();
      return;
    }
    showMsgQueue(npcLines);
    return;
  }

  const ch = MAPS[state.map]?.[fy]?.[fx];
  if (ch === 'D' || ch === 'V' || ch === 'K') {
    enterLocation(fx, fy, ch);
  }
}

// ===== プレゼント屋（ショップ） =====
function openShop() {
  state.phase = 'shop';
  state.shopCursor = 0;
  document.getElementById('shop-overlay').classList.remove('hidden');
  renderShop('なにを 買う？');
}

function renderShop(logText) {
  document.getElementById('shop-money').textContent = `${state.money.toLocaleString()}ギュニー`;
  // 在庫表示
  const listEl = document.getElementById('shop-list');
  listEl.innerHTML = '';
  PRESENT_ORDER.forEach(k => {
    const p = PRESENTS[k];
    const stock = state.presents[k] || 0;
    const row = document.createElement('div');
    row.className = 'shop-list-item';
    row.innerHTML = `<span>${p.name}（ハート+${p.fill}）</span><span class="stock">所持:${stock}</span>`;
    listEl.appendChild(row);
  });
  // ボタンラベル
  const btns = document.querySelectorAll('.shop-btn');
  PRESENT_ORDER.forEach((k, i) => {
    const p = PRESENTS[k];
    btns[i].textContent = `${p.name} ${p.price.toLocaleString()}G`;
    btns[i].dataset.key = k;
  });
  updateShopCursor();
  if (logText !== undefined) document.getElementById('shop-log').textContent = logText;
}

function updateShopCursor() {
  const btns = document.querySelectorAll('.shop-btn');
  btns.forEach((btn, i) => btn.classList.toggle('selected', i === state.shopCursor));
}

function closeShop() {
  document.getElementById('shop-overlay').classList.add('hidden');
  state.phase = 'map';
}

function shopBuy(presentKey) {
  const p = PRESENTS[presentKey];
  if (state.money < p.price) {
    renderShop('ギュニーが たりない！');
    return;
  }
  state.money -= p.price;
  state.presents[presentKey] = (state.presents[presentKey] || 0) + 1;
  updateStatus();
  renderShop(`${p.name}を 買った！`);
}

document.querySelectorAll('.shop-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.phase !== 'shop') return;
    if (btn.dataset.idx === 'close') { closeShop(); return; }
    shopBuy(btn.dataset.key);
  });
});

// ===== ニトオ（情報商材屋）の処理 =====
function handleNitooTalk() {
  const nUnlocked = state.unlockedMoves.length;
  if (nUnlocked >= UNLOCK_ORDER.length) {
    showMsgQueue([
      'ニトオ「もう売る情報は無ぇよ。\n　あとは自力で頑張りな」',
    ]);
    return;
  }
  if (state.money < MOVE_PRICE) {
    showMsgQueue([
      'ニトオ「次の情報商材も\n　１０万ギュニーだ。\n　たまったらまた来な」',
      `（現在 ${state.money.toLocaleString()}ギュニー）`,
    ]);
    return;
  }
  // 購入成立
  const nextKey = UNLOCK_ORDER[nUnlocked];
  const label = MOVES[nextKey].label;
  state.money -= MOVE_PRICE;
  state.unlockedMoves.push(nextKey);
  updateStatus();
  showMsgQueue([
    'ニトオ「毎度あり！これが次の極意だ」',
    `＊情報商材を受け取った！＊\n「${label}」を覚えた！`,
  ]);
}

// ===== マップ遷移 =====
function enterLocation(_tx, _ty, ch) {
  if (ch === 'V' && state.map === 0) {
    state.map = 1; state.px = 6; state.py = 9; state.dir = 1;
    showMsg(tl('enterTown'));
  } else if (ch === 'K' && state.map === 0) {
    state.map = 2; state.px = 9; state.py = 1;
    showMsg(tl('enterCastle'));
  } else if (ch === 'D' && state.map === 1) {
    state.map = 0; state.px = 3; state.py = 4;
    showMsg(tl('exitTown'));
  } else if (ch === 'D' && state.map === 2) {
    state.map = 0; state.px = 13; state.py = 8;
    showMsg(tl('exitCastle'));
  }
  updateStatus();
}

// ===== エンカウント =====
function checkEncounter() {
  // チギュオの最初の一歩で強制バトル（ブスンコ）
  if (state.chiguoIntro) {
    state.chiguoIntro = false;
    state.steps = 0;
    startBattle('busunko', true);
    return;
  }
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
function startBattle(enemyKey, chiguoSpecial) {
  const def = ENEMIES[enemyKey];
  state.battle = {
    enemy: { ...def },
    heartFilled: 0,       // 現在のハートゲージ充填量
    key: enemyKey,
    turn: 'player',
    ended: false,
    chiguoSpecial: !!chiguoSpecial,
    turnCount: 0,
  };
  state.phase = 'battle';

  const overlay = document.getElementById('battle-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('enemy-name').textContent = def.name;
  updateEnemyHeart();
  drawEnemySprite(def);

  // ボタン表示の切り替え（特殊バトル: チギュオ vs ブスンコ）
  const btns = document.querySelectorAll('.battle-btn');
  if (chiguoSpecial) {
    const labels = ['あっあっ', 'どぅふ', 'おおれおれ', 'にげる'];
    const actions = ['chi_a', 'chi_b', 'chi_c', 'chi_run'];
    btns.forEach((btn, i) => {
      btn.textContent = labels[i];
      btn.dataset.action = actions[i];
    });
    setBattleLog('ブスンコ「なんか用？」');
  } else {
    // 通常バトル: 解放された技に応じて動的にメニュー構成
    let slots;
    if (state.unlockedMoves.length >= 4) {
      // 全技解放：元の4択
      slots = [
        { label: '告白する', action: 'confess' },
        { label: '褒める', action: 'praise' },
        { label: 'プレゼント', action: 'gift' },
        { label: '逃げる', action: 'run' },
      ];
    } else {
      const attackSlots = [];
      for (let i = 0; i < 3; i++) {
        const key = state.unlockedMoves[i];
        if (key) {
          attackSlots.push({ label: MOVES[key].label, action: key });
        } else {
          attackSlots.push({ label: '？？？', action: 'locked' });
        }
      }
      slots = [...attackSlots, { label: '逃げる', action: 'run' }];
    }
    btns.forEach((btn, i) => {
      btn.textContent = slots[i].label;
      btn.dataset.action = slots[i].action;
    });
    setBattleLog(tl('appeared', def.name));
  }
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
  document.getElementById('battle-hp').textContent = tl('battleHp', state.hp, state.maxHp);
  const moneyEl = document.getElementById('battle-money');
  if (moneyEl) moneyEl.textContent = tl('battleMoney', state.money);
  document.getElementById('battle-gf').textContent = tl('battleGf', state.girlfriends);
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

  // チギュオ特殊バトル — すべての攻撃は通らない、逃げられない
  if (b.chiguoSpecial) {
    const chiLogs = {
      chi_a: 'チギュオ「あっあっ……」\nうまく言葉が出ない！',
      chi_b: 'チギュオ「どぅふ……」\n笑いがこぼれただけだ！',
      chi_c: 'チギュオ「おおれおれ……」\n声が上ずって意味不明だ！',
      chi_run: '緊張で足がすくんで\nにげられない！',
    };
    setBattleLog(chiLogs[action] || '……');
    shakeScreen();
    setTimeout(() => enemyTurn(), 1200);
    return;
  }

  if (action === 'locked') {
    // まだ覚えていない技
    setBattleLog('その技はまだ覚えていない！\nニトオから情報商材を買おう。');
    setTimeout(() => setBattleButtons(true), 1000);
    return;
  }

  if (action === 'greet') {
    // 挨拶をする — 小さめのハート充填（MP不要）
    const fill = Math.max(1, Math.floor(state.atk * 0.4) + Math.floor(Math.random() * 2) + 1);
    b.heartFilled += fill;
    setBattleLog(`ゆうしゃは 挨拶をした！\n${b.enemy.name}のハートが ${fill}たまった！`);
    updateEnemyHeart();
  } else if (action === 'confess') {
    // 告白する — 口説き力ベースのハート充填
    const fill = Math.max(1, state.atk - Math.floor(b.enemy.resist / 2) + Math.floor(Math.random() * 4));
    b.heartFilled += fill;
    shakeScreen();
    setBattleLog(tl('confessLog', b.enemy.name, fill));
    updateEnemyHeart();
  } else if (action === 'praise') {
    // 褒める — 中程度のハート充填（MP不要）
    const fill = Math.max(1, Math.floor(state.atk * 0.7) + Math.floor(Math.random() * 3));
    b.heartFilled += fill;
    setBattleLog(tl('praiseLog', b.enemy.name, fill));
    updateEnemyHeart();
  } else if (action === 'gift') {
    // プレゼントする — 在庫から一番高価なものを消費
    const bestKey = [...PRESENT_ORDER].reverse().find(k => (state.presents[k] || 0) > 0);
    if (!bestKey) {
      setBattleLog(tl('noGift'));
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    const present = PRESENTS[bestKey];
    state.presents[bestKey]--;
    updateStatus();
    updateBattleStatus();
    const fill = Math.max(1, present.fill - Math.floor(b.enemy.resist / 3) + Math.floor(Math.random() * 4));
    b.heartFilled += fill;
    shakeScreen();
    setBattleLog(tl('giftLog', b.enemy.name, present.name, fill));
    updateEnemyHeart();
  } else if (action === 'run') {
    if (b.key === 'boss') {
      setBattleLog(tl('cantRunBoss'));
      setTimeout(() => setBattleButtons(true), 800);
      return;
    }
    if (Math.random() < 0.7) {
      setBattleLog(tl('ranAway'));
      setTimeout(() => endBattle(), 1000);
      return;
    }
    setBattleLog(tl('cantRun'));
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
  let dmg;
  if (b.chiguoSpecial) {
    // チギュオ特殊バトル: 3ターンで必ず0にする
    b.turnCount++;
    dmg = Math.ceil(state.hp / Math.max(1, 4 - b.turnCount));
  } else {
    dmg = Math.max(1, b.enemy.charm - Math.floor(state.def / 2) + Math.floor(Math.random() * 3));
  }
  state.hp -= dmg;
  if (state.hp < 0) state.hp = 0;
  updateStatus();
  updateBattleStatus();
  shakeScreen();

  if (b.chiguoSpecial) {
    const chiReactions = [
      `ブスンコに冷たい目で\n見られた！精神力 -${dmg}`,
      `ブスンコ「キモ……」\n精神力 -${dmg}`,
      `ブスンコに無視された！\n精神力 -${dmg}`,
    ];
    setBattleLog(chiReactions[Math.min(b.turnCount - 1, chiReactions.length - 1)]);
  } else {
    // リアクション台詞ランダム
    const reactions = tl('reactions', b.enemy.name, dmg);
    setBattleLog(reactions[Math.floor(Math.random() * reactions.length)]);
  }

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
    setBattleLog(tl('bossDefeated'));
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
  // お金を獲得
  const reward = exp * 2000;
  state.money += reward;
  updateStatus();
  updateBattleStatus();
  setBattleLog(tl('gotGirlfriend', b.enemy.name, exp) + '\n' + tl('gainMoney', reward));

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
  state.atk += 2;
  state.def += 1;
  updateStatus();
  updateBattleStatus();

  setBattleLog(tl('levelUp', state.level));
  setTimeout(() => endBattle(), 1500);
}

function battleDefeat() {
  const wasChiguo = state.battle && state.battle.chiguoSpecial;
  if (wasChiguo) {
    setBattleLog('目の前が真っ暗になった……');
  } else {
    setBattleLog(tl('heartBroken'));
  }
  setTimeout(() => {
    endBattle();
    if (wasChiguo) {
      // 始まりの町のお店で目を覚ます
      state.map = 1; state.px = 3; state.py = 3;
      state.dir = 1; // 左向き（ニトオの方）
      state.hp = state.maxHp;
      updateStatus();
      showMsgQueue([
        'チギュオ「こ、ここは…」',
        '？？？「目が覚めた？」',
        '目の前には小汚いオヤジが\n立っていた。',
        'ニトオ「俺の名前は　ヒキコモ　ニトオ。\nお前の命の恩人さ。」',
        'チギュオ「あっ、す…」',
        'ニトオ「お前、女にモテないだろ」',
        'チギュオ「おっ、べ、べつに…」',
        'ニトオ「１００％モテる方法、あるぞ」',
        'チギュオ「えっ…」',
        'ニトオ「１０万ギュニー」',
        'チギュオ「……ま、まじすか…」',
        'ニトオ「おうよ、俺っちの情報商材は\n評判いいんだよ。彼女１００人\nできちまうぜ」',
        'チギュオ「か、買います！！\n……あ、今金無いです」',
        'ニトオ「チッ……まぁいい、\n初回だけタダにしといてやる。\n次からは金持ってこいよ」',
        '＊情報商材を手に入れた！＊\nチギュオは「挨拶をする」を覚えた！',
      ], () => {
        state.unlockedMoves = ['greet'];
        closeMsg();
      });
    } else {
      state.map = 1; state.px = 6; state.py = 9;
      state.hp = Math.floor(state.maxHp / 2);
      updateStatus();
      showMsg(tl('revivedMsg'));
    }
  }, 1500);
}

// ===== 勝利画面 =====
function showVictory() {
  state.phase = 'victory';
  sg.onGameEnd(state.level);
  document.getElementById('victory-screen').classList.remove('hidden');
  document.getElementById('victory-sub').textContent = tl('victorySub', state.level, state.girlfriends);
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
  } else if (state.phase === 'shop') {
    const btns = document.querySelectorAll('.shop-btn');
    const cols = 2;
    const total = btns.length; // 5 items + close = 6
    if (consumeKey('ArrowLeft')) {
      if (state.shopCursor < PRESENT_ORDER.length && state.shopCursor % cols === 1) { state.shopCursor--; updateShopCursor(); }
    } else if (consumeKey('ArrowRight')) {
      if (state.shopCursor < PRESENT_ORDER.length && state.shopCursor % cols === 0 && state.shopCursor + 1 < PRESENT_ORDER.length) { state.shopCursor++; updateShopCursor(); }
    } else if (consumeKey('ArrowUp')) {
      if (state.shopCursor === total - 1) {
        // close→直前の商品行
        state.shopCursor = PRESENT_ORDER.length - 1;
      } else if (state.shopCursor >= cols) {
        state.shopCursor -= cols;
      }
      updateShopCursor();
    } else if (consumeKey('ArrowDown')) {
      if (state.shopCursor < PRESENT_ORDER.length) {
        const next = state.shopCursor + cols;
        state.shopCursor = next < PRESENT_ORDER.length ? next : (total - 1);
        updateShopCursor();
      }
    } else if (consumeKey(' ') || consumeKey('Enter')) {
      const sel = btns[state.shopCursor];
      if (sel.dataset.idx === 'close') closeShop();
      else shopBuy(sel.dataset.key);
    } else if (consumeKey('Escape')) {
      closeShop();
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
  showMsgQueue(tl('introLines'));
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
