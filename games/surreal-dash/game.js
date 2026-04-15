/**
 * シュールダッシュ - エンドレスランナー（強化版）
 * ゾーン制・パワーアップ・ボス・パララックス・演出強化
 */
(function () {
  'use strict';

  // ===== i18n =====
  var translations = {
    ja: {
      gameTitle: 'シュールダッシュ',
      gameSub: '8つのゲーム世界を駆け抜けろ！',
      startBtn: '💩 タップでスタート 💩',
      controlsTitle: '操作方法',
      controlsPC: 'PC：スペースキーでジャンプ（2段ジャンプ可能）',
      controlsMobile: 'スマホ：画面タップでジャンプ',
      scoreLabel: 'スコア',
      distLabel: '距離',
      zoneLabel: 'ゾーン',
      gameOver: 'ゲームオーバー',
      finalScore: 'スコア',
      finalDist: '距離',
      finalStars: 'スター',
      finalZone: '到達ゾーン',
      newRecord: '🎉 NEW RECORD!',
      retryBtn: '💩 もう一度プレイ 💩',
      titleBtn: 'タイトルに戻る',
      rankS: '🏆 ランク S - シュールマスター！',
      rankA: '🥇 ランク A - すごい！',
      rankB: '🥈 ランク B - いい感じ！',
      rankC: '🥉 ランク C - まだまだ！',
      rankD: '💩 ランク D - がんばれ！',
      zone1: 'かわいい部屋',
      zone2: 'かにかに',
      zone3: '経営分析',
      zone4: '黄金ドライバー',
      zone5: 'うんコーン',
      zone6: 'マインスイーパー',
      zone7: 'シュール進化論',
      zone8: '漆黒のリバーシ',
      zoneBanner1: 'ZONE 1 - かわいい部屋',
      zoneBanner2: 'ZONE 2 - かにかに',
      zoneBanner3: 'ZONE 3 - 経営分析',
      zoneBanner4: 'ZONE 4 - 黄金ドライバー',
      zoneBanner5: 'ZONE 5 - うんコーン',
      zoneBanner6: 'ZONE 6 - マインスイーパー',
      zoneBanner7: 'ZONE 7 - シュール進化論',
      zoneBanner8: 'ZONE 8 - 漆黒のリバーシ',
      bossWarning: '⚠ BOSS ⚠',
      shareText: function (score, dist) { return 'シュールダッシュで' + score + '点、' + dist + 'm走ったよ！💩💨 #シュールゲームス'; },
    },
    en: {
      gameTitle: 'Surreal Dash',
      gameSub: 'Run through 8 game worlds!',
      startBtn: '💩 Tap to Start 💩',
      controlsTitle: 'Controls',
      controlsPC: 'PC: Space to jump (double jump OK)',
      controlsMobile: 'Mobile: Tap to jump',
      scoreLabel: 'Score',
      distLabel: 'Dist',
      zoneLabel: 'Zone',
      gameOver: 'Game Over',
      finalScore: 'Score',
      finalDist: 'Distance',
      finalStars: 'Stars',
      finalZone: 'Zone Reached',
      newRecord: '🎉 NEW RECORD!',
      retryBtn: '💩 Play Again 💩',
      titleBtn: 'Back to Title',
      rankS: '🏆 Rank S - Surreal Master!',
      rankA: '🥇 Rank A - Amazing!',
      rankB: '🥈 Rank B - Nice!',
      rankC: '🥉 Rank C - Keep going!',
      rankD: '💩 Rank D - Try harder!',
      zone1: 'Cute Room',
      zone2: 'Crab Panic',
      zone3: 'Business',
      zone4: 'Gold Driver',
      zone5: 'Unko Cone',
      zone6: 'Minesweeper',
      zone7: 'Evolution',
      zone8: 'Black Reversi',
      zoneBanner1: 'ZONE 1 - CUTE ROOM',
      zoneBanner2: 'ZONE 2 - CRAB PANIC',
      zoneBanner3: 'ZONE 3 - BUSINESS',
      zoneBanner4: 'ZONE 4 - GOLD DRIVER',
      zoneBanner5: 'ZONE 5 - UNKO CONE',
      zoneBanner6: 'ZONE 6 - MINESWEEPER',
      zoneBanner7: 'ZONE 7 - EVOLUTION',
      zoneBanner8: 'ZONE 8 - BLACK REVERSI',
      bossWarning: '⚠ BOSS ⚠',
      shareText: function (score, dist) { return 'I scored ' + score + ' pts and ran ' + dist + 'm in Surreal Dash! 💩💨 #SurrealGames'; },
    }
  };

  if (window.SurrealI18n) {
    SurrealI18n.init(translations, {
      onLangChange: function () { updateAllText(); }
    });
  }

  function t(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var val = window.SurrealI18n ? SurrealI18n.t.apply(null, arguments) : (translations.ja[key] || key);
    if (typeof val === 'function') return val.apply(null, args);
    return val;
  }

  function updateAllText() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (typeof val === 'string') el.textContent = val;
    });
  }

  // ===== ゲームマネージャー初期化 =====
  var GameManager;
  if (window.SurrealGames) {
    GameManager = window.SurrealGames.init('surreal-dash');
  }

  // ===== DOM要素 =====
  var titleScreen = document.getElementById('title-screen');
  var gameScreen = document.getElementById('game-screen');
  var resultScreen = document.getElementById('result-screen');
  var startBtn = document.getElementById('start-btn');
  var retryBtn = document.getElementById('retry-btn');
  var titleBtn = document.getElementById('title-btn');
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');
  var scoreDisplay = document.getElementById('score-display');
  var distDisplay = document.getElementById('dist-display');
  var zoneDisplay = document.getElementById('zone-display');
  var finalScore = document.getElementById('final-score');
  var finalDist = document.getElementById('final-dist');
  var finalStars = document.getElementById('final-stars');
  var finalZone = document.getElementById('final-zone');
  var resultRank = document.getElementById('result-rank');
  var newRecordEl = document.getElementById('new-record');

  // ===== ゲーム定数 =====
  var DESIGN_W = 500;
  var DESIGN_H = 700;
  var GROUND_H = 80;
  var GRAVITY = 2000;
  var JUMP_VEL = -720;
  var MAX_JUMPS = 2;
  var BASE_SPEED = 210;
  var SPEED_INCREASE = 1.5;
  var MAX_SPEED = 430;
  var PLAYER_SIZE = 40;
  var OBSTACLE_INTERVAL_MIN = 1.6;
  var OBSTACLE_INTERVAL_MAX = 3.0;
  var STAR_INTERVAL_MIN = 1.5;
  var STAR_INTERVAL_MAX = 3.0;
  var POWERUP_INTERVAL_MIN = 7;
  var POWERUP_INTERVAL_MAX = 14;

  // ===== ゾーン定義 =====
  // 各ゾーンは他のゲーム世界がテーマ（BGMもそのゲームのテーマ曲を使用）
  var ZONES = [
    {
      // ZONE 1 - かわいい部屋からの脱出
      id: 1, nameKey: 'zone1', bannerKey: 'zoneBanner1',
      distStart: 0, distEnd: 2200,
      bgTop: '#2a0a1a', bgBot: '#4a1a2e',
      groundColor: '#2a0a1a', groundLine: '#ff9ec7',
      enemies: ['door', 'ribbon', 'heart'],
      bgm: 'cute',
      parallaxColors: ['rgba(255,200,220,0.25)', 'rgba(255,105,180,0.15)']
    },
    {
      // ZONE 2 - かにかにパニック！
      id: 2, nameKey: 'zone2', bannerKey: 'zoneBanner2',
      distStart: 2200, distEnd: 4600,
      bgTop: '#2a0014', bgBot: '#4a1028',
      groundColor: '#2a0a14', groundLine: '#ff4488',
      enemies: ['crab', 'punch', 'anger'],
      bgm: 'pop',
      parallaxColors: ['rgba(255,105,180,0.25)', 'rgba(255,50,100,0.15)']
    },
    {
      // ZONE 3 - 経営分析ゲーム
      id: 3, nameKey: 'zone3', bannerKey: 'zoneBanner3',
      distStart: 4600, distEnd: 7200,
      bgTop: '#2a1a00', bgBot: '#4a3010',
      groundColor: '#2a1a00', groundLine: '#ffc040',
      enemies: ['chart', 'money', 'briefcase'],
      bgm: 'sparkle',
      parallaxColors: ['rgba(255,200,80,0.22)', 'rgba(255,160,0,0.15)']
    },
    {
      // ZONE 4 - 黄金の金色ドライバー
      id: 4, nameKey: 'zone4', bannerKey: 'zoneBanner4',
      distStart: 7200, distEnd: 10000,
      bgTop: '#2a1500', bgBot: '#4a2800',
      groundColor: '#2a1500', groundLine: '#ffaa00',
      enemies: ['car', 'gear', 'trophy'],
      bgm: 'race',
      parallaxColors: ['rgba(255,180,50,0.25)', 'rgba(255,100,0,0.15)']
    },
    {
      // ZONE 5 - うんコーンキャッチャー
      id: 5, nameKey: 'zone5', bannerKey: 'zoneBanner5',
      distStart: 10000, distEnd: 13000,
      bgTop: '#1a0e08', bgBot: '#3a1c10',
      groundColor: '#1a0e08', groundLine: '#a88060',
      enemies: ['cone', 'brownblock', 'sandwich'],
      bgm: 'march',
      parallaxColors: ['rgba(160,110,80,0.25)', 'rgba(120,80,50,0.15)']
    },
    {
      // ZONE 6 - かいだんマインスイーパー
      id: 6, nameKey: 'zone6', bannerKey: 'zoneBanner6',
      distStart: 13000, distEnd: 16200,
      bgTop: '#0a0e12', bgBot: '#1a1e28',
      groundColor: '#0a0e12', groundLine: '#8090a0',
      enemies: ['bomb', 'ghost', 'skull'],
      bgm: 'ominous',
      parallaxColors: ['rgba(150,170,190,0.18)', 'rgba(100,120,140,0.15)']
    },
    {
      // ZONE 7 - シュール進化論
      id: 7, nameKey: 'zone7', bannerKey: 'zoneBanner7',
      distStart: 16200, distEnd: 19600,
      bgTop: '#2a2200', bgBot: '#4a3a10',
      groundColor: '#2a2200', groundLine: '#ffe060',
      enemies: ['egg', 'chick', 'bigbird'],
      bgm: 'retro',
      parallaxColors: ['rgba(255,240,120,0.22)', 'rgba(255,200,50,0.15)']
    },
    {
      // ZONE 8 - 漆黒のリバーシ
      id: 8, nameKey: 'zone8', bannerKey: 'zoneBanner8',
      distStart: 19600, distEnd: Infinity,
      bgTop: '#1a0020', bgBot: '#2a0038',
      groundColor: '#0a0010', groundLine: '#b060ff',
      enemies: ['blackdisc', 'whitedisc', 'crystal'],
      bgm: 'mystery',
      parallaxColors: ['rgba(180,100,255,0.25)', 'rgba(200,200,200,0.15)']
    }
  ];

  // 敵の絵文字マッピング（各ゲームのキャラクター）
  var ENEMY_DEFS = {
    // Zone 1 - かわいい部屋からの脱出
    door:       { emoji: '🚪', w: 40, h: 50, ground: true },
    ribbon:     { emoji: '🎀', w: 34, h: 34, ground: false },
    heart:      { emoji: '💖', w: 34, h: 34, ground: false },
    // Zone 2 - かにかに
    crab:       { emoji: '🦀', w: 38, h: 36, ground: true },
    punch:      { emoji: '👊', w: 38, h: 38, ground: false },
    anger:      { emoji: '💢', w: 32, h: 32, ground: false },
    // Zone 3 - 経営分析
    chart:      { emoji: '📊', w: 38, h: 40, ground: true },
    money:      { emoji: '💴', w: 38, h: 34, ground: false },
    briefcase:  { emoji: '💼', w: 40, h: 36, ground: true },
    // Zone 4 - 黄金ドライバー
    car:        { emoji: '🚗', w: 44, h: 36, ground: true },
    gear:       { emoji: '⚙', w: 34, h: 34, ground: false },
    trophy:     { emoji: '🏆', w: 36, h: 40, ground: true },
    // Zone 5 - うんコーン
    cone:       { emoji: '🍦', w: 34, h: 44, ground: true },
    brownblock: { emoji: '🟫', w: 36, h: 36, ground: true },
    sandwich:   { emoji: '🥪', w: 38, h: 34, ground: false },
    // Zone 6 - マインスイーパー
    bomb:       { emoji: '💣', w: 36, h: 36, ground: true },
    ghost:      { emoji: '👻', w: 36, h: 38, ground: false },
    skull:      { emoji: '💀', w: 36, h: 36, ground: false },
    // Zone 7 - シュール進化論
    egg:        { emoji: '🥚', w: 32, h: 38, ground: true },
    chick:      { emoji: '🐣', w: 34, h: 34, ground: true },
    bigbird:    { emoji: '🐥', w: 34, h: 34, ground: false },
    // Zone 8 - 漆黒のリバーシ
    blackdisc:  { emoji: '⚫', w: 36, h: 36, ground: true },
    whitedisc:  { emoji: '⚪', w: 36, h: 36, ground: false },
    crystal:    { emoji: '🔮', w: 36, h: 36, ground: false }
  };

  // ボス定義（各ゾーン末尾付近で出現）
  var BOSS_DEFS = [
    { emoji: '🔑', w: 120, h: 100, type: 'jumper' },     // Zone 1 - 巨大な鍵
    { emoji: '🦀', w: 130, h: 100, type: 'jumper' },     // Zone 2 - 巨大蟹
    { emoji: '📈', w: 130, h: 110, type: 'jumper' },     // Zone 3 - 巨大チャート
    { emoji: '🚗', w: 140, h: 100, type: 'jumper' },     // Zone 4 - 巨大車
    { emoji: '🍦', w: 110, h: 130, type: 'jumper' },     // Zone 5 - 巨大コーン
    { emoji: '💣', w: 130, h: 120, type: 'duckuner' },   // Zone 6 - 浮遊爆弾
    { emoji: '🐓', w: 130, h: 120, type: 'jumper' },     // Zone 7 - 巨大鶏
    { emoji: '🔮', w: 140, h: 130, type: 'duckuner' }    // Zone 8 - 浮遊水晶玉
  ];

  // パワーアップ定義
  var POWERUP_TYPES = [
    { id: 'shield', emoji: '🛡️', duration: 0, desc: 'シールド' },
    { id: 'magnet', emoji: '🧲', duration: 5, desc: 'マグネット' },
    { id: 'fire',   emoji: '🔥', duration: 5, desc: 'ファイア' }
  ];

  // ===== ゲーム状態 =====
  var state = {
    running: false,
    dying: false,
    dieTimer: 0,
    score: 0,
    distance: 0,
    starsCollected: 0,
    speed: BASE_SPEED,
    timeScale: 1,
    player: null,
    obstacles: [],
    stars: [],
    powerups: [],
    particles: [],
    scorePopups: [],
    afterimages: [],
    bgOffset: 0,
    groundOffset: 0,
    nextObstacleTime: 0,
    nextStarTime: 0,
    nextPowerupTime: 0,
    elapsedTime: 0,
    lastTime: 0,
    animId: null,
    groundY: 0,
    bgStars: [],
    // ゾーン
    currentZone: 0,
    zoneBanner: null,
    zoneBannerTimer: 0,
    bgFade: 0,
    prevZoneBg: null,
    // パワーアップ状態
    shieldActive: false,
    magnetActive: false,
    magnetTimer: 0,
    fireActive: false,
    fireTimer: 0,
    // ボス
    boss: null,
    bossSpawned: [],
    bossWarningTimer: 0,
    // パララックス背景レイヤー
    parallaxLayers: [],
    // 虹色用
    rainbowHue: 0,
  };

  // ===== キャンバスサイズ設定 =====
  var scale = 1;

  function resizeCanvas() {
    var wideScreen = window.innerWidth >= 700;
    var maxW = Math.min(wideScreen ? window.innerWidth - 80 : window.innerWidth, wideScreen ? 560 : 500);
    var maxH = Math.max(window.innerHeight - (wideScreen ? 56 : 0), 320);
    var ratio = DESIGN_W / DESIGN_H;
    var w, h;
    if (maxW / maxH > ratio) {
      h = maxH;
      w = h * ratio;
    } else {
      w = maxW;
      h = w / ratio;
    }
    canvas.width = DESIGN_W;
    canvas.height = DESIGN_H;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    scale = w / DESIGN_W;
    state.groundY = DESIGN_H - GROUND_H;
  }

  // ===== 背景の星を生成 =====
  function initBgStars() {
    state.bgStars = [];
    for (var i = 0; i < 60; i++) {
      state.bgStars.push({
        x: Math.random() * DESIGN_W,
        y: Math.random() * (DESIGN_H - GROUND_H),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
      });
    }
  }

  // ===== パララックス背景レイヤー初期化 =====
  function initParallaxLayers() {
    state.parallaxLayers = [];
    // 遠い層（山・雲的なもの）
    for (var layer = 0; layer < 3; layer++) {
      var shapes = [];
      for (var i = 0; i < 8; i++) {
        shapes.push({
          x: i * (DESIGN_W / 4) + Math.random() * 60,
          y: state.groundY - 30 - layer * 60 - Math.random() * 40,
          w: 40 + Math.random() * 80,
          h: 20 + Math.random() * 40,
        });
      }
      state.parallaxLayers.push({
        speed: 0.1 + layer * 0.15,
        offset: 0,
        shapes: shapes,
        layer: layer
      });
    }
  }

  // ===== ゾーン取得 =====
  function getZoneIndex(dist) {
    for (var i = ZONES.length - 1; i >= 0; i--) {
      if (dist >= ZONES[i].distStart) return i;
    }
    return 0;
  }

  function getCurrentZone() {
    return ZONES[state.currentZone];
  }

  // ===== プレイヤー =====
  function createPlayer() {
    return {
      x: 80,
      y: state.groundY - PLAYER_SIZE,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE,
      vy: 0,
      jumps: 0,
      onGround: true,
    };
  }

  // ===== 障害物 =====
  function spawnObstacle() {
    var zone = getCurrentZone();
    var enemyList = zone.enemies;
    var type = enemyList[Math.floor(Math.random() * enemyList.length)];
    var def = ENEMY_DEFS[type];
    if (!def) def = ENEMY_DEFS.crab;

    var ob = {
      type: type,
      x: DESIGN_W + 10,
      w: def.w,
      h: def.h,
      emoji: def.emoji,
      passed: false,
      isBoss: false
    };

    if (def.ground) {
      ob.y = state.groundY - def.h;
    } else {
      ob.y = state.groundY - 100 - Math.random() * 100;
    }
    return ob;
  }

  // ===== ボス =====
  function spawnBoss(zoneIndex) {
    var def = BOSS_DEFS[zoneIndex] || BOSS_DEFS[BOSS_DEFS.length - 1];
    var boss = {
      emoji: def.emoji,
      w: def.w,
      h: def.h,
      x: DESIGN_W + 20,
      passed: false,
      isBoss: true,
      type: def.type
    };

    if (def.type === 'duckuner') {
      // 空中に浮かぶ→下をくぐる
      boss.y = state.groundY - def.h - 60;
    } else {
      // 地面に接地→ジャンプで避ける
      boss.y = state.groundY - def.h;
    }
    return boss;
  }

  // ===== スター =====
  function spawnStar() {
    return {
      x: DESIGN_W + 10,
      y: state.groundY - 60 - Math.random() * 140,
      w: 28,
      h: 28,
      emoji: '⭐',
      collected: false,
    };
  }

  // ===== パワーアップ =====
  function spawnPowerup() {
    var type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    return {
      x: DESIGN_W + 10,
      y: state.groundY - 80 - Math.random() * 120,
      w: 32,
      h: 32,
      emoji: type.emoji,
      id: type.id,
      duration: type.duration,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2
    };
  }

  // ===== パーティクル =====
  function spawnRunParticles() {
    if (!state.player.onGround) return;
    var zone = getCurrentZone();
    var color = zone.groundLine || '#ff6ec7';
    for (var i = 0; i < 2; i++) {
      state.particles.push({
        x: state.player.x,
        y: state.player.y + state.player.h,
        vx: -Math.random() * 80 - 20,
        vy: -Math.random() * 40 - 10,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color: color,
      });
    }
  }

  function spawnCrashParticles() {
    for (var i = 0; i < 20; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 100 + Math.random() * 200;
      state.particles.push({
        x: state.player.x + state.player.w / 2,
        y: state.player.y + state.player.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 4 + Math.random() * 6,
        color: '#ffff00',
      });
    }
  }

  function spawnStarParticles(sx, sy) {
    for (var i = 0; i < 8; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 60 + Math.random() * 80;
      state.particles.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color: '#00fff7',
      });
    }
  }

  function spawnLandingParticles() {
    for (var i = 0; i < 12; i++) {
      var angle = -Math.PI + Math.random() * Math.PI;
      var speed = 40 + Math.random() * 100;
      state.particles.push({
        x: state.player.x + state.player.w / 2,
        y: state.groundY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 - 30,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.3 + Math.random() * 0.2,
        size: 2 + Math.random() * 4,
        color: getCurrentZone().groundLine || '#ff6ec7',
      });
    }
  }

  function spawnFireParticles() {
    if (!state.fireActive) return;
    var p = state.player;
    for (var i = 0; i < 3; i++) {
      state.particles.push({
        x: p.x + p.w / 2 + (Math.random() - 0.5) * 20,
        y: p.y + p.h / 2 + (Math.random() - 0.5) * 20,
        vx: -Math.random() * 60 - 20,
        vy: -Math.random() * 40 - 20,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.2 + Math.random() * 0.2,
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00',
      });
    }
  }

  // ===== スコアポップアップ =====
  function addScorePopup(x, y, text) {
    state.scorePopups.push({
      x: x, y: y,
      text: text,
      life: 0.8,
      maxLife: 0.8
    });
  }

  // ===== 残像 =====
  function addAfterimage() {
    if (!state.player || state.player.onGround) return;
    state.afterimages.push({
      x: state.player.x,
      y: state.player.y,
      w: state.player.w,
      h: state.player.h,
      life: 0.15,
      maxLife: 0.15
    });
  }

  // ===== 当たり判定 (AABB) =====
  function collides(a, b) {
    var shrink = 6;
    return (
      a.x + shrink < b.x + b.w - shrink &&
      a.x + a.w - shrink > b.x + shrink &&
      a.y + shrink < b.y + b.h - shrink &&
      a.y + a.h - shrink > b.y + shrink
    );
  }

  // ===== ジャンプ =====
  function jump() {
    if (!state.running || state.dying) return;
    var p = state.player;
    if (p.jumps < MAX_JUMPS) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      p.jumps++;
      if (GameManager) GameManager.sound.play('tap');
    }
  }

  // ===== パワーアップ発動 =====
  function activatePowerup(pu) {
    if (pu.id === 'shield') {
      state.shieldActive = true;
    } else if (pu.id === 'magnet') {
      state.magnetActive = true;
      state.magnetTimer = pu.duration;
    } else if (pu.id === 'fire') {
      state.fireActive = true;
      state.fireTimer = pu.duration;
    }
    if (GameManager) GameManager.sound.play('correct');
    addScorePopup(pu.x, pu.y, pu.emoji);
  }

  // ===== 色ヘルパー =====
  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function lerpColor(c1, c2, t) {
    var a = hexToRgb(c1);
    var b = hexToRgb(c2);
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  // ===== 描画 =====
  function draw(dt) {
    var zone = getCurrentZone();

    // 背景グラデーション
    var bgTop = zone.bgTop;
    var bgBot = zone.bgBot;

    // ゾーン遷移中のフェード
    if (state.bgFade > 0 && state.prevZoneBg) {
      bgTop = lerpColor(state.prevZoneBg.bgTop, zone.bgTop, 1 - state.bgFade);
      bgBot = lerpColor(state.prevZoneBg.bgBot, zone.bgBot, 1 - state.bgFade);
    }

    var grad = ctx.createLinearGradient(0, 0, 0, DESIGN_H);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

    // 背景の星/泡/パーティクル（ゾーン毎）
    drawBgElements(zone);

    // パララックス背景
    drawParallax(zone);

    // 地面
    drawGround(zone);

    // パワーアップアイテム
    for (var i = 0; i < state.powerups.length; i++) {
      var pu = state.powerups[i];
      if (!pu.collected) {
        var bobY = Math.sin(state.elapsedTime * 4 + pu.bobPhase) * 8;
        ctx.font = pu.w + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 光るエフェクト
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 12;
        ctx.fillText(pu.emoji, pu.x + pu.w / 2, pu.y + pu.h / 2 + bobY);
        ctx.shadowBlur = 0;
      }
    }

    // スター
    for (var i = 0; i < state.stars.length; i++) {
      var st = state.stars[i];
      if (!st.collected) {
        ctx.font = st.w + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var floatY = Math.sin(state.elapsedTime * 3 + st.x * 0.01) * 6;
        ctx.fillText(st.emoji, st.x + st.w / 2, st.y + st.h / 2 + floatY);
      }
    }

    // 障害物（通常＋ボス）
    for (var i = 0; i < state.obstacles.length; i++) {
      var ob = state.obstacles[i];
      ctx.font = (ob.isBoss ? ob.h * 0.8 : ob.h) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ob.isBoss) {
        // ボスは赤い影
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
      }
      ctx.fillText(ob.emoji, ob.x + ob.w / 2, ob.y + ob.h / 2);
      ctx.shadowBlur = 0;
    }

    // ボスの場合、上にも表示
    if (state.boss) {
      // ボス警告テキストはバナーで表示済み
    }

    // 残像（ジャンプ中）
    for (var i = 0; i < state.afterimages.length; i++) {
      var ai = state.afterimages[i];
      var aiAlpha = (ai.life / ai.maxLife) * 0.3;
      ctx.globalAlpha = aiAlpha;
      ctx.font = ai.w + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💩', ai.x + ai.w / 2, ai.y + ai.h / 2);
      ctx.globalAlpha = 1;
    }

    // プレイヤー
    if (state.player) {
      var p = state.player;

      // シールドエフェクト
      if (state.shieldActive) {
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100,200,255,0.6)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ファイアエフェクト（プレイヤーの周りに炎の輪）
      if (state.fireActive) {
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,100,0,0.7)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // マグネットエフェクト（磁力線）
      if (state.magnetActive) {
        ctx.strokeStyle = 'rgba(200,100,255,0.3)';
        ctx.lineWidth = 1;
        for (var mi = 0; mi < 4; mi++) {
          var mAngle = state.elapsedTime * 3 + mi * Math.PI / 2;
          var mRadius = 50 + Math.sin(state.elapsedTime * 5 + mi) * 10;
          ctx.beginPath();
          ctx.arc(p.x + p.w / 2, p.y + p.h / 2, mRadius, mAngle, mAngle + 0.8);
          ctx.stroke();
        }
      }

      ctx.font = p.w + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      var tilt = p.onGround ? Math.sin(state.elapsedTime * 12) * 0.1 : -0.2;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(tilt);
      ctx.fillText('💩', 0, 0);
      ctx.restore();
    }

    // パーティクル
    for (var i = 0; i < state.particles.length; i++) {
      var part = state.particles[i];
      var alpha = part.life / part.maxLife;
      ctx.fillStyle = part.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // スコアポップアップ
    for (var i = 0; i < state.scorePopups.length; i++) {
      var pop = state.scorePopups[i];
      var popAlpha = pop.life / pop.maxLife;
      var popY = pop.y - (1 - popAlpha) * 40;
      ctx.globalAlpha = popAlpha;
      ctx.font = 'bold 18px Zen Maru Gothic, sans-serif';
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(pop.text, pop.x, popY);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // スピードライン
    if (state.speed > 400) {
      var lineAlpha = Math.min((state.speed - 400) / 300, 0.4);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + lineAlpha + ')';
      ctx.lineWidth = 1;
      for (var i = 0; i < 5; i++) {
        var ly = 50 + i * 120;
        var lx = ((state.bgOffset * 3 + i * 200) % (DESIGN_W + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 60, ly);
        ctx.stroke();
      }
    }

    // ゾーンバナー
    if (state.zoneBannerTimer > 0) {
      drawZoneBanner();
    }

    // ボス警告
    if (state.bossWarningTimer > 0) {
      drawBossWarning();
    }
  }

  function drawBgElements(zone) {
    // きらきら星（ゾーンのgroundLine色でテーマ感を演出）
    var lineCol = zone.groundLine || '#ffffff';
    var rgb = hexToRgb(lineCol);
    for (var i = 0; i < state.bgStars.length; i++) {
      var s = state.bgStars[i];
      var a = s.alpha * (0.5 + 0.5 * Math.sin(state.elapsedTime * s.twinkleSpeed));
      ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParallax(zone) {
    var colors = zone.parallaxColors || ['rgba(255,255,255,0.1)'];
    for (var l = 0; l < state.parallaxLayers.length; l++) {
      var layer = state.parallaxLayers[l];
      var col = colors[l % colors.length];
      ctx.fillStyle = col;
      var offset = layer.offset % (DESIGN_W * 2);
      for (var s = 0; s < layer.shapes.length; s++) {
        var sh = layer.shapes[s];
        var sx = ((sh.x - offset + DESIGN_W * 2) % (DESIGN_W * 2)) - DESIGN_W * 0.5;
        ctx.beginPath();
        ctx.ellipse(sx, sh.y, sh.w / 2, sh.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawGround(zone) {
    var gColor = zone.groundColor || '#1a0a2e';
    var gLine = zone.groundLine || '#ff6ec7';

    // ゾーン遷移中のフェード
    if (state.bgFade > 0 && state.prevZoneBg) {
      gColor = lerpColor(state.prevZoneBg.groundColor || '#1a0a2e', zone.groundColor || '#1a0a2e', 1 - state.bgFade);
      gLine = lerpColor(state.prevZoneBg.groundLine || '#ff6ec7', zone.groundLine || '#ff6ec7', 1 - state.bgFade);
    }

    ctx.fillStyle = gColor;
    ctx.fillRect(0, state.groundY, DESIGN_W, GROUND_H);

    // 地面パターン
    ctx.fillStyle = gLine;
    ctx.globalAlpha = 0.3;
    var dotSpacing = 30;
    var offset = state.groundOffset % dotSpacing;
    for (var x = -offset; x < DESIGN_W + dotSpacing; x += dotSpacing) {
      for (var row = 0; row < 2; row++) {
        ctx.beginPath();
        ctx.arc(x, state.groundY + 15 + row * 25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 地面の上端ライン
    ctx.strokeStyle = gLine;
    ctx.lineWidth = 2;
    ctx.shadowColor = gLine;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(DESIGN_W, state.groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawZoneBanner() {
    var progress = 1 - state.zoneBannerTimer / 2.5;
    var alpha;
    if (progress < 0.15) {
      alpha = progress / 0.15;
    } else if (progress > 0.7) {
      alpha = (1 - progress) / 0.3;
    } else {
      alpha = 1;
    }
    alpha = Math.max(0, Math.min(1, alpha));

    ctx.globalAlpha = alpha;

    // 暗い帯
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, DESIGN_H / 2 - 50, DESIGN_W, 100);

    // ゾーン名テキスト
    var bannerText = state.zoneBanner || '';
    ctx.font = 'bold 36px Zen Maru Gothic, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = getCurrentZone().groundLine || '#ff6ec7';
    ctx.shadowBlur = 20;
    ctx.fillText(bannerText, DESIGN_W / 2, DESIGN_H / 2);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;
  }

  function drawBossWarning() {
    var flash = Math.sin(state.elapsedTime * 15) > 0;
    if (flash) {
      ctx.fillStyle = 'rgba(255,0,0,0.1)';
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    }

    var alpha = Math.min(state.bossWarningTimer / 0.3, 1);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 28px Zen Maru Gothic, sans-serif';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillText(t('bossWarning'), DESIGN_W / 2, 100);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ===== アップデート =====
  function update(dt) {
    // スローモーション（ゲームオーバー演出）
    if (state.dying) {
      state.dieTimer -= dt;
      state.timeScale = Math.max(0.05, state.dieTimer / 0.3);
      dt *= state.timeScale;
      if (state.dieTimer <= 0) {
        finishGameOver();
        return;
      }
    }

    if (!state.running) return;

    state.elapsedTime += dt;
    state.speed = Math.min(BASE_SPEED + state.elapsedTime * SPEED_INCREASE, MAX_SPEED);

    // ボス中は少し遅くする
    if (state.boss) {
      state.speed = Math.min(state.speed, 350);
    }

    state.distance += state.speed * dt;
    state.bgOffset += state.speed * dt * 0.3;
    state.groundOffset += state.speed * dt;

    // パララックス更新
    for (var l = 0; l < state.parallaxLayers.length; l++) {
      state.parallaxLayers[l].offset += state.speed * dt * state.parallaxLayers[l].speed;
    }

    // ===== ゾーン切り替えチェック =====
    var distM = state.distance / 10;
    var newZoneIdx = getZoneIndex(state.distance);
    if (newZoneIdx !== state.currentZone) {
      var prevZone = ZONES[state.currentZone];
      state.prevZoneBg = {
        bgTop: prevZone.bgTop,
        bgBot: prevZone.bgBot,
        groundColor: prevZone.groundColor,
        groundLine: prevZone.groundLine
      };
      state.currentZone = newZoneIdx;
      state.bgFade = 1.0;
      state.zoneBanner = t(ZONES[newZoneIdx].bannerKey);
      state.zoneBannerTimer = 2.5;

      // BGM切り替え
      var newZone = ZONES[newZoneIdx];
      try {
        if (window.SurrealGames && window.SurrealGames.SoundSystem) {
          window.SurrealGames.SoundSystem.playBgm(newZone.bgm);
        }
      } catch (e) { /* ignore */ }
    }

    // 背景フェード
    if (state.bgFade > 0) {
      state.bgFade -= dt * 0.8;
      if (state.bgFade < 0) state.bgFade = 0;
    }

    // バナータイマー
    if (state.zoneBannerTimer > 0) {
      state.zoneBannerTimer -= dt;
    }

    // ボス警告タイマー
    if (state.bossWarningTimer > 0) {
      state.bossWarningTimer -= dt;
    }

    // ===== ボスチェック（各ゾーン終盤）=====
    var zone = getCurrentZone();
    if (zone.distEnd !== Infinity && !state.boss) {
      var distToEnd = zone.distEnd - state.distance;
      // ゾーン終了の少し前にボスを出す
      if (distToEnd < 500 && distToEnd > 300 && state.bossSpawned.indexOf(zone.id) === -1) {
        state.bossSpawned.push(zone.id);
        state.boss = spawnBoss(state.currentZone);
        state.obstacles.push(state.boss);
        state.bossWarningTimer = 1.5;
        if (GameManager) GameManager.sound.play('wrong');
      }
    }

    // プレイヤー物理演算
    var p = state.player;
    var wasInAir = !p.onGround;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;

    if (p.y + p.h >= state.groundY) {
      p.y = state.groundY - p.h;
      p.vy = 0;
      if (wasInAir) {
        p.onGround = true;
        p.jumps = 0;
        spawnLandingParticles();
      }
      p.onGround = true;
      p.jumps = 0;
    }

    // ジャンプ中の残像
    if (!p.onGround && state.elapsedTime % 0.05 < dt) {
      addAfterimage();
    }

    // 走るパーティクル
    if (Math.random() < 0.3) spawnRunParticles();

    // ファイアパーティクル
    if (state.fireActive) spawnFireParticles();

    // パワーアップタイマー
    if (state.magnetActive) {
      state.magnetTimer -= dt;
      if (state.magnetTimer <= 0) {
        state.magnetActive = false;
      }
    }
    if (state.fireActive) {
      state.fireTimer -= dt;
      if (state.fireTimer <= 0) {
        state.fireActive = false;
      }
    }

    // 距離スコア加算
    state.score = Math.floor(state.distance / 10) + state.starsCollected * 50;

    // 障害物スポーン
    state.nextObstacleTime -= dt;
    if (state.nextObstacleTime <= 0 && !state.boss) {
      state.obstacles.push(spawnObstacle());
      var interval = OBSTACLE_INTERVAL_MIN +
        Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN);
      interval *= Math.max(0.4, BASE_SPEED / state.speed);
      state.nextObstacleTime = interval;
    }

    // スタースポーン
    state.nextStarTime -= dt;
    if (state.nextStarTime <= 0) {
      state.stars.push(spawnStar());
      state.nextStarTime = STAR_INTERVAL_MIN +
        Math.random() * (STAR_INTERVAL_MAX - STAR_INTERVAL_MIN);
    }

    // パワーアップスポーン
    state.nextPowerupTime -= dt;
    if (state.nextPowerupTime <= 0) {
      state.powerups.push(spawnPowerup());
      state.nextPowerupTime = POWERUP_INTERVAL_MIN +
        Math.random() * (POWERUP_INTERVAL_MAX - POWERUP_INTERVAL_MIN);
    }

    // 障害物移動・判定
    for (var i = state.obstacles.length - 1; i >= 0; i--) {
      var ob = state.obstacles[i];
      ob.x -= state.speed * dt;

      if (!ob.passed && ob.x + ob.w < p.x) {
        ob.passed = true;
        if (ob.isBoss) {
          state.boss = null;
          addScorePopup(p.x, p.y - 20, '+500');
          state.score += 500;
        }
      }

      // 当たり判定
      if (collides(p, ob)) {
        // ファイア中 → 障害物を破壊（ボス以外）
        if (state.fireActive && !ob.isBoss) {
          // 障害物破壊エフェクト
          for (var j = 0; j < 10; j++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = 80 + Math.random() * 100;
            state.particles.push({
              x: ob.x + ob.w / 2, y: ob.y + ob.h / 2,
              vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
              life: 0.3, maxLife: 0.3,
              size: 4 + Math.random() * 4,
              color: '#ff4400',
            });
          }
          addScorePopup(ob.x, ob.y, '+100');
          state.score += 100;
          state.obstacles.splice(i, 1);
          if (GameManager) GameManager.sound.play('correct');
          continue;
        }

        // シールド → 1回防ぐ
        if (state.shieldActive) {
          state.shieldActive = false;
          // シールド破壊エフェクト
          for (var j = 0; j < 15; j++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = 60 + Math.random() * 80;
            state.particles.push({
              x: p.x + p.w / 2, y: p.y + p.h / 2,
              vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
              life: 0.4, maxLife: 0.4,
              size: 3 + Math.random() * 5,
              color: '#00aaff',
            });
          }
          if (ob.isBoss && ob === state.boss) state.boss = null;
          state.obstacles.splice(i, 1);
          if (GameManager) GameManager.sound.play('tap');
          continue;
        }

        // 通常衝突 → ゲームオーバー開始（スローモーション）
        startGameOver();
        return;
      }

      if (ob.x + ob.w < -50) {
        if (ob.isBoss && ob === state.boss) state.boss = null;
        state.obstacles.splice(i, 1);
      }
    }

    // スター移動・収集（マグネット対応）
    for (var i = state.stars.length - 1; i >= 0; i--) {
      var st = state.stars[i];
      st.x -= state.speed * dt;

      // マグネット吸引
      if (state.magnetActive && !st.collected) {
        var dx = (p.x + p.w / 2) - (st.x + st.w / 2);
        var dy = (p.y + p.h / 2) - (st.y + st.h / 2);
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          var pullStr = 400 * dt;
          st.x += (dx / dist) * pullStr;
          st.y += (dy / dist) * pullStr;
        }
      }

      if (!st.collected && collides(p, st)) {
        st.collected = true;
        state.starsCollected++;
        spawnStarParticles(st.x + st.w / 2, st.y + st.h / 2);
        addScorePopup(st.x, st.y, '+50');
        if (GameManager) GameManager.sound.play('correct');
      }

      if (st.x + st.w < -50) {
        state.stars.splice(i, 1);
      }
    }

    // パワーアップ移動・収集
    for (var i = state.powerups.length - 1; i >= 0; i--) {
      var pu = state.powerups[i];
      pu.x -= state.speed * dt;

      if (!pu.collected && collides(p, pu)) {
        pu.collected = true;
        activatePowerup(pu);
      }

      if (pu.x + pu.w < -50) {
        state.powerups.splice(i, 1);
      }
    }

    // パーティクル更新
    for (var i = state.particles.length - 1; i >= 0; i--) {
      var part = state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.life <= 0) state.particles.splice(i, 1);
    }

    // スコアポップアップ更新
    for (var i = state.scorePopups.length - 1; i >= 0; i--) {
      state.scorePopups[i].life -= dt;
      if (state.scorePopups[i].life <= 0) state.scorePopups.splice(i, 1);
    }

    // 残像更新
    for (var i = state.afterimages.length - 1; i >= 0; i--) {
      state.afterimages[i].life -= dt;
      if (state.afterimages[i].life <= 0) state.afterimages.splice(i, 1);
    }

    // HUD更新
    scoreDisplay.textContent = state.score;
    distDisplay.textContent = Math.floor(state.distance / 10) + 'm';
    zoneDisplay.textContent = t(getCurrentZone().nameKey);
  }

  // ===== ゲームループ =====
  function gameLoop(timestamp) {
    if (!state.running && !state.dying) return;

    var dt = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    if (dt > 0.1) dt = 0.016;

    update(dt);
    draw(dt);

    state.animId = requestAnimationFrame(gameLoop);
  }

  // ===== 画面切り替え =====
  function showScreen(screen) {
    titleScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // ===== ゲーム開始 =====
  function startGame() {
    resizeCanvas();
    initBgStars();
    initParallaxLayers();

    state.running = true;
    state.dying = false;
    state.dieTimer = 0;
    state.timeScale = 1;
    state.score = 0;
    state.distance = 0;
    state.starsCollected = 0;
    state.speed = BASE_SPEED;
    state.obstacles = [];
    state.stars = [];
    state.powerups = [];
    state.particles = [];
    state.scorePopups = [];
    state.afterimages = [];
    state.bgOffset = 0;
    state.groundOffset = 0;
    state.nextObstacleTime = 1.5;
    state.nextStarTime = 2.0;
    state.nextPowerupTime = 6;
    state.elapsedTime = 0;
    state.player = createPlayer();
    state.currentZone = 0;
    state.zoneBanner = t('zoneBanner1');
    state.zoneBannerTimer = 2.5;
    state.bgFade = 0;
    state.prevZoneBg = null;
    state.shieldActive = false;
    state.magnetActive = false;
    state.magnetTimer = 0;
    state.fireActive = false;
    state.fireTimer = 0;
    state.boss = null;
    state.bossSpawned = [];
    state.bossWarningTimer = 0;
    state.rainbowHue = 0;

    showScreen(gameScreen);

    if (GameManager) GameManager.onGameStart();

    // 初期BGM（Zone 1）
    try {
      if (window.SurrealGames && window.SurrealGames.SoundSystem) {
        window.SurrealGames.SoundSystem.playBgm(ZONES[0].bgm);
      }
    } catch (e) { /* ignore */ }

    state.lastTime = performance.now();
    state.animId = requestAnimationFrame(gameLoop);
  }

  // ===== ゲームオーバー（スローモーション開始） =====
  function startGameOver() {
    state.dying = true;
    state.dieTimer = 0.3;
    spawnCrashParticles();
    if (GameManager) GameManager.sound.play('wrong');
  }

  // ===== ゲームオーバー完了 =====
  function finishGameOver() {
    state.running = false;
    state.dying = false;
    if (state.animId) {
      cancelAnimationFrame(state.animId);
      state.animId = null;
    }

    draw(0);

    var dist = Math.floor(state.distance / 10);
    var sc = state.score;
    var stars = state.starsCollected;
    var zoneName = t(getCurrentZone().nameKey);

    finalScore.textContent = sc;
    finalDist.textContent = dist + 'm';
    finalStars.textContent = stars;
    finalZone.textContent = zoneName;

    // ランク判定
    var rank;
    if (sc >= 5000) rank = t('rankS');
    else if (sc >= 2000) rank = t('rankA');
    else if (sc >= 1000) rank = t('rankB');
    else if (sc >= 400) rank = t('rankC');
    else rank = t('rankD');
    resultRank.textContent = rank;

    // ハイスコア
    var result = GameManager ? GameManager.onGameEnd(sc, { distance: dist, stars: stars, zone: zoneName }) : {};
    if (result && result.isNewHigh) {
      newRecordEl.style.display = 'inline-block';
      newRecordEl.textContent = t('newRecord');
    } else {
      newRecordEl.style.display = 'none';
    }

    updateShareText(sc, dist);

    setTimeout(function () {
      showScreen(resultScreen);
      updateAllText();
    }, 300);
  }

  // ===== シェアテキスト =====
  function updateShareText(score, dist) {
    try {
      var text = t('shareText', score, dist);
      var url = 'https://eri-murayama.github.io/surreal-games/games/surreal-dash/index.html';
      var shareBtn = document.querySelector('.sg-share-btn');
      if (shareBtn) {
        shareBtn.href = 'https://x.com/intent/tweet?text=' +
          encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
      }
    } catch (e) { /* ignore */ }
  }

  // ===== ハイスコア表示 =====
  function showHighScore() {
    var display = document.getElementById('highscore-display');
    if (!display || !GameManager) return;
    var hs = GameManager.getHighScore();
    if (hs && hs.score > 0) {
      display.innerHTML = '<span class="sg-highscore-badge">' + hs.score + ' pts</span>';
    } else {
      display.innerHTML = '';
    }
  }

  // ===== 入力ハンドリング =====
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (state.running) jump();
    }
  });

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    jump();
  }, { passive: false });

  canvas.addEventListener('mousedown', function (e) {
    e.preventDefault();
    jump();
  });

  window.addEventListener('resize', function () {
    resizeCanvas();
  });

  // ===== ボタンイベント =====
  startBtn.addEventListener('click', function () {
    startGame();
  });

  retryBtn.addEventListener('click', function () {
    startGame();
  });

  titleBtn.addEventListener('click', function () {
    showScreen(titleScreen);
    showHighScore();
    updateAllText();
  });

  // ===== 初期化 =====
  resizeCanvas();
  initBgStars();
  initParallaxLayers();
  showHighScore();
  updateAllText();

})();
