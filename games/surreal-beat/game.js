/**
 * シュールビート - 5ステージ制リズムゲーム
 * 落ちてくるシュールなノーツをタイミングよくタップ！
 */
(function () {
  'use strict';

  // ===== i18n =====
  var translations = {
    ja: {
      gameTitle: 'シュールビート',
      gameSubtitle: '8つのゲームのBGMでリズムをタップ！',
      startBtn: 'スタート',
      keyHint: 'PC: D F J K キー / スマホ: タップ',
      stageSelectTitle: 'ステージ選択',
      backToTitle: 'タイトルに戻る',
      stageClear: 'ステージクリア！',
      nextStage: '次のステージへ',
      backToSelect: 'ステージ選択',
      resultFailed: 'ステージ失敗…',
      failHint: 'Missを全ノーツの20%以下に抑えよう！',
      maxCombo: '最大コンボ',
      fullCombo: 'FULL COMBO!',
      allClear: '全ステージクリア！',
      locked: '🔒',
      cleared: '⭐',
      stage1: 'かわいい部屋の鍵',
      stage2: 'かにかにパニック',
      stage3: '数字の戯れ',
      stage4: '黄金の疾走',
      stage5: 'うんコーン行進曲',
      stage6: 'きょうふの怪談',
      stage7: 'ひよこ進化論',
      stage8: '漆黒の対局',
      stage1detail: '脱出ゲーム / BPM 120 / 入門',
      stage2detail: 'かにかに / BPM 130 / ポップ',
      stage3detail: '経営分析 / BPM 138 / きらめき',
      stage4detail: '黄金ドライバー / BPM 148 / レース',
      stage5detail: 'うんコーン / BPM 158 / マーチ',
      stage6detail: 'マインスイーパー / BPM 168 / ホラー',
      stage7detail: 'シュール進化論 / BPM 180 / レトロ',
      stage8detail: '漆黒のリバーシ / BPM 192 / ミステリー',
      modeNormal: '表',
      modeHard: '裏',
      hardLocked: '表クリアで解放',
      hardBadge: '裏',
      hardIntro: '★ 裏モード ★',
      hardClear: '裏モード制覇！',
      shareText: function (score, stage, isHard) {
        var tag = isHard ? '【裏】' : '';
        return 'シュールビート' + tag + '「' + stage + '」で ' + score + '点！🎵\n#シュールゲームス #シュールビート';
      },
    },
    en: {
      gameTitle: 'Surreal Beat',
      gameSubtitle: '8 stages of game BGM rhythm!',
      startBtn: 'START',
      keyHint: 'PC: D F J K keys / Mobile: Tap',
      stageSelectTitle: 'Stage Select',
      backToTitle: 'Back to Title',
      stageClear: 'Stage Clear!',
      nextStage: 'Next Stage',
      backToSelect: 'Stage Select',
      resultFailed: 'Stage Failed...',
      failHint: 'Keep misses under 20% of total notes!',
      maxCombo: 'Max Combo',
      fullCombo: 'FULL COMBO!',
      allClear: 'All Stages Clear!',
      locked: '🔒',
      cleared: '⭐',
      stage1: 'Cute Room Key',
      stage2: 'Crab Crab Panic',
      stage3: 'Number Games',
      stage4: 'Golden Drive',
      stage5: 'Unko Cone March',
      stage6: 'Stairway Horror',
      stage7: 'Chick Evolution',
      stage8: 'Pitch Black Match',
      stage1detail: 'Escape Room / BPM 120 / Intro',
      stage2detail: 'Whack Crab / BPM 130 / Pop',
      stage3detail: 'Business Analysis / BPM 138 / Sparkle',
      stage4detail: 'Gold Driver / BPM 148 / Race',
      stage5detail: 'Unko Cone / BPM 158 / March',
      stage6detail: 'Minesweeper / BPM 168 / Horror',
      stage7detail: 'Surreal Evolution / BPM 180 / Retro',
      stage8detail: 'Black Reversi / BPM 192 / Mystery',
      modeNormal: 'NORMAL',
      modeHard: 'HARD',
      hardLocked: 'Clear normal to unlock',
      hardBadge: 'HARD',
      hardIntro: '★ HARD MODE ★',
      hardClear: 'HARD MODE CLEAR!',
      shareText: function (score, stage, isHard) {
        var tag = isHard ? '[HARD] ' : '';
        return 'I scored ' + score + ' on ' + tag + '"' + stage + '" in Surreal Beat! 🎵\n#SurrealGames #SurrealBeat';
      },
    },
  };

  if (window.SurrealI18n) {
    SurrealI18n.init(translations, {
      onLangChange: function () { updateI18nTexts(); renderStageList(); }
    });
  }

  // ===== ゲーム初期化 =====
  var GameManager = window.SurrealGames.init('surreal-beat');
  var SoundSystem = window.SurrealGames.SoundSystem;

  // ===== ステージ定義 =====
  // サイトのゲーム公開順（古い→新しい）で並ぶ
  var STAGES = [
    {
      // Stage 1 - かわいい部屋からの脱出（2026.03.10）
      name: 'stage1', themeKey: 'escape', bpm: 120, duration: 30000,
      bgm: 'cute', emojis: ['🚪', '🔑', '🎀', '💖', '🌸'],
      colors: ['#f8bbd0', '#e91e63', '#ad1457'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(248,187,208,0.25), transparent 60%), linear-gradient(180deg, #2a0a1a 0%, #1a0010 100%)',
      offbeatChance: 0.15, skipChance: 0.2, doubleChance: 0,
      sabiDensity: 0.12, sixteenthChance: 0
    },
    {
      // Stage 2 - かにかにパニック！（2026.03.10）
      name: 'stage2', themeKey: 'kanikani', bpm: 130, duration: 32000,
      bgm: 'pop', emojis: ['🦀', '💢', '👊', '✊', '🩸'],
      colors: ['#ffb6c1', '#ff69b4', '#c2185b'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(255,105,180,0.3), transparent 60%), linear-gradient(180deg, #2a0014 0%, #14000a 100%)',
      offbeatChance: 0.22, skipChance: 0.15, doubleChance: 0.05,
      sabiDensity: 0.18, sixteenthChance: 0.08
    },
    {
      // Stage 3 - 経営分析ゲーム（2026.03.18）
      name: 'stage3', themeKey: 'analysis', bpm: 138, duration: 33000,
      bgm: 'sparkle', emojis: ['📊', '📈', '💼', '💴', '💹'],
      colors: ['#ffe082', '#ffb300', '#ff8f00'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(255,179,0,0.25), transparent 60%), linear-gradient(180deg, #2a1a00 0%, #1a1000 100%)',
      offbeatChance: 0.28, skipChance: 0.12, doubleChance: 0.1,
      sabiDensity: 0.22, sixteenthChance: 0.12
    },
    {
      // Stage 4 - 黄金の金色ドライバー（2026.03.23）
      name: 'stage4', themeKey: 'drive', bpm: 148, duration: 34000,
      bgm: 'race', emojis: ['🚗', '🏆', '💰', '⚙', '🔧'],
      colors: ['#ffe0b2', '#ff9800', '#e65100'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(255,152,0,0.3), transparent 60%), linear-gradient(180deg, #2a1500 0%, #140800 100%)',
      offbeatChance: 0.32, skipChance: 0.1, doubleChance: 0.15,
      sabiDensity: 0.25, sixteenthChance: 0.15
    },
    {
      // Stage 5 - うんコーンキャッチャー（2026.03.28）
      name: 'stage5', themeKey: 'unko', bpm: 158, duration: 34000,
      bgm: 'march', emojis: ['💩', '🍦', '🟫', '🤎', '💩'],
      colors: ['#d7ccc8', '#8d6e63', '#4e342e'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(141,110,99,0.3), transparent 60%), linear-gradient(180deg, #1a0e08 0%, #0a0500 100%)',
      offbeatChance: 0.35, skipChance: 0.1, doubleChance: 0.18,
      sabiDensity: 0.28, sixteenthChance: 0.18
    },
    {
      // Stage 6 - かいだんマインスイーパー（2026.04.06）
      name: 'stage6', themeKey: 'kaidan', bpm: 168, duration: 35000,
      bgm: 'ominous', emojis: ['👻', '💀', '🪦', '💣', '🕯'],
      colors: ['#b0bec5', '#607d8b', '#37474f'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(96,125,139,0.3), transparent 60%), linear-gradient(180deg, #0a0e12 0%, #000308 100%)',
      offbeatChance: 0.38, skipChance: 0.08, doubleChance: 0.2,
      sabiDensity: 0.3, sixteenthChance: 0.2
    },
    {
      // Stage 7 - シュール進化論（2026.04.11）
      name: 'stage7', themeKey: 'evo', bpm: 180, duration: 36000,
      bgm: 'retro', emojis: ['🐣', '🥚', '🌟', '⭐', '🟡'],
      colors: ['#fff9c4', '#fff176', '#f9a825'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(255,241,118,0.3), transparent 60%), linear-gradient(180deg, #2a2200 0%, #1a1500 100%)',
      offbeatChance: 0.42, skipChance: 0.06, doubleChance: 0.25,
      sabiDensity: 0.32, sixteenthChance: 0.22
    },
    {
      // Stage 8 - 漆黒のリバーシ（2026.04.13, 最新）
      name: 'stage8', themeKey: 'reversi', bpm: 192, duration: 38000,
      bgm: 'mystery', emojis: ['⚫', '⚪', '🔮', '💜', '✨'],
      colors: ['#ce93d8', '#9c27b0', '#6a1b9a'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(156,39,176,0.35), transparent 60%), linear-gradient(180deg, #1a0020 0%, #0a0010 100%)',
      offbeatChance: 0.48, skipChance: 0.04, doubleChance: 0.3,
      sabiDensity: 0.36, sixteenthChance: 0.28
    },
  ];

  // ===== 裏モード（ハード）の倍率 =====
  var HARD_MULTIPLIER = {
    bpmBoost: 1.18,         // BPM +18%
    fallSpeedBoost: 0.72,   // 落下時間 × 0.72（速く落ちる）
    offbeatMul: 1.5,
    doubleMul: 1.8,
    sixteenthMul: 2.0,
    sabiMul: 1.4,
    scoreMul: 2.0,          // 裏はスコア2倍
  };

  // 裏モードのステージ設定を生成
  function makeHardStage(base) {
    var hard = {};
    for (var k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) hard[k] = base[k];
    }
    hard.bpm = Math.round(base.bpm * HARD_MULTIPLIER.bpmBoost);
    hard.offbeatChance = Math.min(0.7, base.offbeatChance * HARD_MULTIPLIER.offbeatMul);
    hard.doubleChance = Math.min(0.5, base.doubleChance * HARD_MULTIPLIER.doubleMul || 0.15);
    hard.sixteenthChance = Math.min(0.5, (base.sixteenthChance || 0.1) * HARD_MULTIPLIER.sixteenthMul);
    hard.sabiDensity = Math.min(0.6, base.sabiDensity * HARD_MULTIPLIER.sabiMul);
    hard.skipChance = Math.max(0.02, base.skipChance * 0.5);
    return hard;
  }

  // ===== 定数 =====
  var LANE_COUNT = 4;
  var DEFAULT_FALL_DURATION = 1800;
  var PERFECT_THRESHOLD = 60;
  var GREAT_THRESHOLD = 120;
  var PERFECT_SCORE = 100;
  var GREAT_SCORE = 50;
  var STORAGE_KEY = 'surreal-beat-progress';

  // ===== ステート =====
  var gameState = 'title';
  var currentStageIndex = 0;
  var currentMode = 'normal';          // 'normal' | 'hard'
  var currentFallDuration = DEFAULT_FALL_DURATION;
  var currentStageConfig = null;       // 実際にプレイ中の設定（hard倍率適用後）
  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var perfectCount = 0;
  var greatCount = 0;
  var missCount = 0;
  var noteChart = [];
  var activeNotes = [];
  var gameStartTime = 0;
  var animFrameId = null;
  var beatPulseTimer = null;
  var particles = [];

  // ===== 進行度管理 =====
  function loadProgress() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && typeof data.unlocked === 'number') {
        if (!Array.isArray(data.cleared)) data.cleared = [];
        if (!Array.isArray(data.hardCleared)) data.hardCleared = [];
        return data;
      }
    } catch (e) { /* ignore */ }
    return { unlocked: 1, cleared: [], hardCleared: [] };
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  // ===== DOM要素 =====
  var titleScreen = document.getElementById('title-screen');
  var stageSelectScreen = document.getElementById('stage-select-screen');
  var gameScreen = document.getElementById('game-screen');
  var clearScreen = document.getElementById('clear-screen');
  var resultScreen = document.getElementById('result-screen');
  var startBtn = document.getElementById('start-btn');
  var backToTitleBtn = document.getElementById('back-to-title-btn');
  var retryBtn = document.getElementById('retry-btn');
  var retryStageBtn = document.getElementById('retry-stage-btn');
  var nextStageBtn = document.getElementById('next-stage-btn');
  var backToSelectBtn = document.getElementById('back-to-select-btn');
  var failBackBtn = document.getElementById('fail-back-btn');
  var scoreDisplay = document.getElementById('score-display');
  var comboDisplay = document.getElementById('combo-display');
  var stageNameDisplay = document.getElementById('stage-name-display');
  var playArea = document.getElementById('play-area');
  var judgeEffect = document.getElementById('judge-effect');
  var progressFill = document.getElementById('progress-fill');
  var particleCanvas = document.getElementById('particle-canvas');
  var particleCtx = particleCanvas ? particleCanvas.getContext('2d') : null;
  var tapBtns = document.querySelectorAll('.tap-btn');

  // ===== 画面切り替え =====
  function showScreen(screenId) {
    var screens = [titleScreen, stageSelectScreen, gameScreen, clearScreen, resultScreen];
    screens.forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(screenId).classList.add('active');
  }

  // ===== ステージ選択画面描画 =====
  function renderStageList() {
    var listEl = document.getElementById('stage-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    var progress = loadProgress();
    var t = window.SurrealI18n ? SurrealI18n.t.bind(SurrealI18n) : function (k) { return translations.ja[k] || k; };

    for (var i = 0; i < STAGES.length; i++) {
      var stage = STAGES[i];
      var isUnlocked = i < progress.unlocked;
      var isCleared = progress.cleared.indexOf(i) !== -1;
      var isHardUnlocked = isCleared;
      var isHardCleared = progress.hardCleared.indexOf(i) !== -1;

      var card = document.createElement('div');
      card.className = 'stage-card';
      card.setAttribute('data-stage', i);
      if (!isUnlocked) card.classList.add('stage-locked');
      if (isCleared) card.classList.add('stage-cleared');
      if (isHardCleared) card.classList.add('stage-hard-cleared');

      var numEl = document.createElement('div');
      numEl.className = 'stage-number';
      numEl.textContent = i + 1;

      var infoEl = document.createElement('div');
      infoEl.className = 'stage-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'stage-card-name';
      nameEl.textContent = t(stage.name);

      var detailEl = document.createElement('div');
      detailEl.className = 'stage-card-detail';
      detailEl.textContent = t(stage.name + 'detail');

      infoEl.appendChild(nameEl);
      infoEl.appendChild(detailEl);

      // モードボタン（表 / 裏）
      var modeEl = document.createElement('div');
      modeEl.className = 'stage-modes';

      var normalBtn = document.createElement('button');
      normalBtn.className = 'mode-btn mode-btn--normal';
      normalBtn.type = 'button';
      normalBtn.innerHTML = (isCleared ? '⭐ ' : '▶ ') + t('modeNormal');
      if (!isUnlocked) {
        normalBtn.disabled = true;
        normalBtn.innerHTML = '🔒';
      }

      var hardBtn = document.createElement('button');
      hardBtn.className = 'mode-btn mode-btn--hard';
      hardBtn.type = 'button';
      if (!isHardUnlocked) {
        hardBtn.disabled = true;
        hardBtn.innerHTML = '🔒';
        hardBtn.title = t('hardLocked');
      } else {
        hardBtn.innerHTML = (isHardCleared ? '⭐ ' : '🔥 ') + t('modeHard');
      }

      modeEl.appendChild(normalBtn);
      modeEl.appendChild(hardBtn);

      card.appendChild(numEl);
      card.appendChild(infoEl);
      card.appendChild(modeEl);

      (function (idx) {
        if (isUnlocked) {
          normalBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentStageIndex = idx;
            currentMode = 'normal';
            startGame();
          });
        }
        if (isHardUnlocked) {
          hardBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentStageIndex = idx;
            currentMode = 'hard';
            startGame();
          });
        }
      })(i);

      listEl.appendChild(card);
    }
  }

  // ===== 譜面自動生成 =====
  function generateChart(stageConfig) {
    var chart = [];
    var beatInterval = 60000 / stageConfig.bpm;
    var totalBeats = Math.floor(stageConfig.duration / beatInterval);
    var lastLanes = [-1, -1];
    var emojis = stageConfig.emojis;

    for (var i = 0; i < totalBeats; i++) {
      var beatPhase = i % 8;
      var shouldPlace = false;

      // 基本パターン: 8ビート（1, 3, 5, 7拍目）
      if (beatPhase === 0 || beatPhase === 2 || beatPhase === 4 || beatPhase === 6) {
        shouldPlace = true;
      }

      // 裏拍
      if (!shouldPlace && Math.random() < stageConfig.offbeatChance) {
        shouldPlace = true;
      }

      // 16ビート（拍間にノーツ追加）
      if (stageConfig.sixteenthChance > 0 && Math.random() < stageConfig.sixteenthChance) {
        var sixteenthTime = i * beatInterval + beatInterval * 0.5;
        if (sixteenthTime < stageConfig.duration) {
          var sixteenthLane = Math.floor(Math.random() * LANE_COUNT);
          chart.push({
            time: sixteenthTime,
            lane: sixteenthLane,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
          });
        }
      }

      // たまに拍を抜く
      if (shouldPlace && Math.random() < stageConfig.skipChance) {
        shouldPlace = false;
      }

      if (shouldPlace) {
        // レーン選択（連続回避）
        var lane;
        var attempts = 0;
        do {
          lane = Math.floor(Math.random() * LANE_COUNT);
          attempts++;
        } while (attempts < 10 && (lane === lastLanes[0] && lane === lastLanes[1]));

        lastLanes[1] = lastLanes[0];
        lastLanes[0] = lane;

        chart.push({
          time: i * beatInterval,
          lane: lane,
          emoji: emojis[Math.floor(Math.random() * emojis.length)]
        });

        // 同時押し
        if (stageConfig.doubleChance > 0 && Math.random() < stageConfig.doubleChance) {
          var doubleLane;
          do {
            doubleLane = Math.floor(Math.random() * LANE_COUNT);
          } while (doubleLane === lane);
          chart.push({
            time: i * beatInterval,
            lane: doubleLane,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
          });
        }
      }
    }

    // サビ（後半60%以降）で密度UP
    var sabiStart = Math.floor(totalBeats * 0.6);
    for (var j = sabiStart; j < totalBeats; j++) {
      if (Math.random() < stageConfig.sabiDensity) {
        var extraLane = Math.floor(Math.random() * LANE_COUNT);
        var time = j * beatInterval;
        var conflict = chart.some(function (n) {
          return Math.abs(n.time - time) < 50 && n.lane === extraLane;
        });
        if (!conflict) {
          chart.push({
            time: time,
            lane: extraLane,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
          });
        }
      }
    }

    chart.sort(function (a, b) { return a.time - b.time; });
    return chart;
  }

  // ===== ゲーム開始 =====
  function startGame() {
    var baseConfig = STAGES[currentStageIndex];
    var stageConfig = (currentMode === 'hard') ? makeHardStage(baseConfig) : baseConfig;
    currentStageConfig = stageConfig;
    currentFallDuration = (currentMode === 'hard')
      ? Math.round(DEFAULT_FALL_DURATION * HARD_MULTIPLIER.fallSpeedBoost)
      : DEFAULT_FALL_DURATION;

    gameState = 'playing';
    score = 0;
    combo = 0;
    maxCombo = 0;
    perfectCount = 0;
    greatCount = 0;
    missCount = 0;
    activeNotes = [];
    particles = [];
    noteChart = generateChart(stageConfig);

    scoreDisplay.textContent = '0';
    comboDisplay.textContent = '0';
    progressFill.style.width = '0%';

    // ステージ名表示（裏モードならバッジ付き）
    var t = window.SurrealI18n ? SurrealI18n.t.bind(SurrealI18n) : function (k) { return translations.ja[k] || k; };
    var modeBadge = (currentMode === 'hard') ? ' 【' + t('hardBadge') + '】' : '';
    stageNameDisplay.textContent = 'Stage ' + (currentStageIndex + 1) + ' - ' + t(baseConfig.name) + modeBadge;

    // プレイエリアのノーツをクリア
    var existingNotes = playArea.querySelectorAll('.note, .lane-flash');
    existingNotes.forEach(function (n) { n.remove(); });

    // 裏モードクラスをゲーム画面に付与
    if (currentMode === 'hard') {
      gameScreen.classList.add('hard-mode');
    } else {
      gameScreen.classList.remove('hard-mode');
    }

    // テーマ色を適用
    applyStageTheme(baseConfig);

    showScreen('game-screen');

    // BGMをステージに合わせて再生（裏モードは速度UP）
    SoundSystem.playBgm(baseConfig.bgm);
    if (SoundSystem.setBgmSpeed) {
      SoundSystem.setBgmSpeed(currentMode === 'hard' ? HARD_MULTIPLIER.bpmBoost : 1.0);
    }

    // パーティクルキャンバスサイズ
    resizeParticleCanvas();

    gameStartTime = performance.now();
    animFrameId = requestAnimationFrame(gameLoop);

    // 背景パルス開始
    startBeatPulse(stageConfig.bpm);
  }

  // ===== テーマ色適用 =====
  function applyStageTheme(stageConfig) {
    var c = stageConfig.colors;
    var gradStr = c.length === 2
      ? 'linear-gradient(90deg, ' + c[0] + ', ' + c[1] + ')'
      : 'linear-gradient(90deg, ' + c.join(', ') + ')';

    var judgeLine = document.getElementById('judge-line');
    if (judgeLine) {
      judgeLine.style.background = gradStr;
      judgeLine.style.boxShadow = '0 0 12px ' + c[c.length - 1] + 'aa, 0 0 24px ' + c[Math.max(0, c.length - 2)] + '88';
    }
    progressFill.style.background = gradStr;

    // プレイエリア背景
    if (playArea && stageConfig.bgGradient) {
      playArea.style.background = stageConfig.bgGradient;
      // ステージ色をCSS変数として渡す（lane-flash等で参照）
      playArea.style.setProperty('--stage-flash', c[c.length - 1]);
      playArea.style.setProperty('--stage-glow', c[Math.max(0, c.length - 2)]);
    }

    // テーマクラスを付与（CSSで装飾を変える）
    if (playArea) {
      playArea.className = '';
      playArea.classList.add('theme-' + stageConfig.themeKey);
    }

    // 背景装飾（絵文字をふんわり配置）
    var decor = document.getElementById('stage-bg-decor');
    if (decor) {
      decor.innerHTML = '';
      decor.className = 'stage-bg-decor theme-' + stageConfig.themeKey;
      var decorEmojis = stageConfig.emojis;
      for (var d = 0; d < 6; d++) {
        var span = document.createElement('span');
        span.className = 'bg-emoji';
        span.textContent = decorEmojis[d % decorEmojis.length];
        span.style.left = (5 + Math.random() * 90) + '%';
        span.style.top = (5 + Math.random() * 80) + '%';
        span.style.fontSize = (1.6 + Math.random() * 1.8) + 'rem';
        span.style.animationDelay = (Math.random() * 4) + 's';
        span.style.animationDuration = (5 + Math.random() * 4) + 's';
        decor.appendChild(span);
      }
    }

    // タップゾーンの色味
    if (tapBtns && tapBtns.length) {
      var tz = document.getElementById('tap-zones');
      if (tz) {
        tz.style.background = 'linear-gradient(180deg, transparent, ' + c[c.length - 1] + '40)';
      }
    }

    // ステージ開始バナー
    showStageBanner(stageConfig);
  }

  // ===== ステージ開始バナー =====
  function showStageBanner(stageConfig) {
    var banner = document.getElementById('stage-banner');
    if (!banner) return;
    var t = window.SurrealI18n ? SurrealI18n.t.bind(SurrealI18n) : function (k) { return translations.ja[k] || k; };
    var c = stageConfig.colors;
    var grad = 'linear-gradient(135deg, ' + c.join(', ') + ')';
    banner.innerHTML =
      '<div class="banner-num">STAGE ' + (currentStageIndex + 1) + '</div>' +
      '<div class="banner-name" style="background:' + grad + ';-webkit-background-clip:text;background-clip:text;color:transparent;">' +
      t(stageConfig.name) + '</div>' +
      '<div class="banner-detail">' + t(stageConfig.name + 'detail') + '</div>';
    banner.classList.remove('show');
    void banner.offsetWidth;
    banner.classList.add('show');
  }

  // ===== 背景パルス =====
  function startBeatPulse(bpm) {
    stopBeatPulse();
    var interval = 60000 / bpm;
    beatPulseTimer = setInterval(function () {
      if (gameState !== 'playing') return;
      gameScreen.classList.remove('bg-pulse');
      // reflow強制
      void gameScreen.offsetWidth;
      gameScreen.classList.add('bg-pulse');
    }, interval);
  }

  function stopBeatPulse() {
    if (beatPulseTimer) {
      clearInterval(beatPulseTimer);
      beatPulseTimer = null;
    }
    gameScreen.classList.remove('bg-pulse');
  }

  // ===== パーティクルキャンバスリサイズ =====
  function resizeParticleCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = playArea.offsetWidth;
    particleCanvas.height = playArea.offsetHeight;
  }

  // ===== パーティクルシステム =====
  function spawnParticles(x, y, count, colors) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function updateAndDrawParticles() {
    if (!particleCtx || !particleCanvas) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      particleCtx.globalAlpha = p.life;
      particleCtx.fillStyle = p.color;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
  }

  // ===== クリア演出パーティクル =====
  function spawnClearParticles() {
    if (!particleCanvas) return;
    var w = particleCanvas.width;
    var h = particleCanvas.height;
    var colors = ['#ff6ec7', '#00fff7', '#39ff14', '#ffd700', '#ff4444', '#8b00ff'];
    for (var burst = 0; burst < 5; burst++) {
      (function (b) {
        setTimeout(function () {
          var cx = w * 0.2 + Math.random() * w * 0.6;
          var cy = h * 0.2 + Math.random() * h * 0.6;
          spawnParticles(cx, cy, 30, colors);
        }, b * 200);
      })(burst);
    }
  }

  // ===== ゲームループ =====
  function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    var stageConfig = STAGES[currentStageIndex];
    var elapsed = timestamp - gameStartTime;
    var songDuration = stageConfig.duration;
    var progress = Math.min(elapsed / songDuration, 1);
    progressFill.style.width = (progress * 100) + '%';

    // ノーツ生成
    for (var i = 0; i < noteChart.length; i++) {
      var note = noteChart[i];
      var spawnTime = note.time - currentFallDuration;

      if (elapsed >= spawnTime && !note.spawned) {
        note.spawned = true;
        spawnNote(note, i);
      }
    }

    // アクティブノーツの位置更新
    for (var j = activeNotes.length - 1; j >= 0; j--) {
      var an = activeNotes[j];
      if (an.hit) continue;

      var noteElapsed = elapsed - (an.time - currentFallDuration);
      var ratio = noteElapsed / currentFallDuration;

      if (ratio >= 0 && ratio <= 1.3) {
        an.el.style.top = (ratio * 100) + '%';
      }

      // コンボエフェクト適用
      updateNoteComboEffect(an.el);

      // Miss判定
      if (elapsed > an.time + GREAT_THRESHOLD) {
        an.hit = true;
        missCount++;
        combo = 0;
        comboDisplay.textContent = '0';
        showJudge('miss', an.lane);
        removeNote(an.el);
        activeNotes.splice(j, 1);

        // 画面揺れ
        triggerScreenShake();
      }
    }

    // パーティクル更新
    updateAndDrawParticles();

    // 曲終了チェック
    if (elapsed >= songDuration + currentFallDuration + 500) {
      endGame();
      return;
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ===== ノーツ生成 =====
  function spawnNote(noteData, index) {
    var el = document.createElement('div');
    el.className = 'note';
    el.textContent = noteData.emoji;
    el.style.left = (noteData.lane * 25) + '%';
    el.style.top = '0%';
    playArea.appendChild(el);

    var noteObj = {
      el: el,
      time: noteData.time,
      lane: noteData.lane,
      hit: false,
      index: index
    };
    activeNotes.push(noteObj);
  }

  // ===== ノーツにコンボエフェクト =====
  function updateNoteComboEffect(el) {
    if (combo >= 30) {
      if (!el.classList.contains('note-rainbow')) {
        el.classList.remove('note-fire');
        el.classList.add('note-rainbow');
      }
    } else if (combo >= 10) {
      if (!el.classList.contains('note-fire') && !el.classList.contains('note-rainbow')) {
        el.classList.add('note-fire');
      }
    }
  }

  // ===== ノーツ削除 =====
  function removeNote(el) {
    el.classList.add('note-hit');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  // ===== レーン光波エフェクト =====
  function triggerLaneFlash(lane) {
    var flash = document.createElement('div');
    flash.className = 'lane-flash';
    flash.setAttribute('data-lane', lane);
    playArea.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 500);
  }

  // ===== 画面揺れ =====
  function triggerScreenShake() {
    playArea.classList.remove('screen-shake');
    void playArea.offsetWidth;
    playArea.classList.add('screen-shake');
    setTimeout(function () {
      playArea.classList.remove('screen-shake');
    }, 300);
  }

  // ===== 判定表示 =====
  function showJudge(type, lane) {
    var text = document.createElement('div');
    text.className = 'judge-text ' + type;
    text.textContent = type === 'perfect' ? 'PERFECT' : type === 'great' ? 'GREAT' : 'MISS';
    text.style.left = (lane * 25 + 12.5) + '%';
    text.style.transform = 'translateX(-50%)';
    judgeEffect.appendChild(text);
    setTimeout(function () {
      if (text.parentNode) text.parentNode.removeChild(text);
    }, 600);
  }

  // ===== レーンタップ処理 =====
  function handleLaneTap(lane) {
    if (gameState !== 'playing') return;

    var elapsed = performance.now() - gameStartTime;
    var closestNote = null;
    var closestDiff = Infinity;
    var closestIdx = -1;

    for (var i = 0; i < activeNotes.length; i++) {
      var n = activeNotes[i];
      if (n.hit || n.lane !== lane) continue;
      var diff = Math.abs(elapsed - n.time);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestNote = n;
        closestIdx = i;
      }
    }

    if (!closestNote || closestDiff > GREAT_THRESHOLD) {
      return;
    }

    closestNote.hit = true;
    SoundSystem.play('tap');

    if (closestDiff <= PERFECT_THRESHOLD) {
      perfectCount++;
      combo++;
      var multiplier = 1 + Math.floor(combo / 10) * 0.5;
      score += Math.floor(PERFECT_SCORE * multiplier);
      showJudge('perfect', lane);
    } else {
      greatCount++;
      combo++;
      var multiplierG = 1 + Math.floor(combo / 10) * 0.5;
      score += Math.floor(GREAT_SCORE * multiplierG);
      showJudge('great', lane);
    }

    if (combo > maxCombo) maxCombo = combo;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;

    // レーン光波
    triggerLaneFlash(lane);

    // ヒットパーティクル
    if (particleCanvas) {
      var noteX = (lane * 0.25 + 0.125) * particleCanvas.width;
      var noteY = particleCanvas.height * 0.9;
      var stage = STAGES[currentStageIndex];
      spawnParticles(noteX, noteY, 5, stage.colors);
    }

    removeNote(closestNote.el);
    activeNotes.splice(closestIdx, 1);
  }

  // ===== ゲーム終了 =====
  function endGame() {
    gameState = 'result';
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    stopBeatPulse();
    SoundSystem.stopBgm();

    // 残りのアクティブノーツをMiss
    activeNotes.forEach(function (n) {
      if (!n.hit) {
        missCount++;
        if (n.el.parentNode) n.el.parentNode.removeChild(n.el);
      }
    });
    activeNotes = [];

    // 裏モードはスコアを2倍（達成感 & ハイスコア差別化）
    if (currentMode === 'hard') {
      score = Math.floor(score * HARD_MULTIPLIER.scoreMul);
    }

    var totalNotes = perfectCount + greatCount + missCount;
    var missRatio = totalNotes > 0 ? missCount / totalNotes : 1;
    var cleared = missRatio <= 0.2;

    // ランク計算
    var accuracy = totalNotes > 0 ? (perfectCount + greatCount * 0.5) / totalNotes : 0;
    var rank = 'D';
    if (accuracy >= 0.95 && missCount === 0) rank = 'S';
    else if (accuracy >= 0.85) rank = 'A';
    else if (accuracy >= 0.7) rank = 'B';
    else if (accuracy >= 0.5) rank = 'C';

    var isFullCombo = missCount === 0 && totalNotes > 0;
    var isHard = (currentMode === 'hard');

    var result = GameManager.onGameEnd(score);
    var t = window.SurrealI18n ? SurrealI18n.t.bind(SurrealI18n) : function (k) { return translations.ja[k] || k; };
    var stageConfig = STAGES[currentStageIndex];

    if (cleared) {
      // クリア! 進行度を更新
      var progress = loadProgress();
      if (isHard) {
        if (progress.hardCleared.indexOf(currentStageIndex) === -1) {
          progress.hardCleared.push(currentStageIndex);
        }
      } else {
        if (progress.cleared.indexOf(currentStageIndex) === -1) {
          progress.cleared.push(currentStageIndex);
        }
        if (currentStageIndex + 1 >= progress.unlocked && currentStageIndex + 1 < STAGES.length) {
          progress.unlocked = currentStageIndex + 2;
        }
      }
      saveProgress(progress);

      // クリア画面表示
      var modeBadge = isHard ? ' 【' + t('hardBadge') + '】' : '';
      document.getElementById('clear-stage-name').textContent =
        'Stage ' + (currentStageIndex + 1) + ' - ' + t(stageConfig.name) + modeBadge;
      document.getElementById('clear-score').textContent = score;
      document.getElementById('clear-rank').textContent = rank;
      document.getElementById('clear-rank').className = 'rank-display rank-' + rank.toLowerCase();
      document.getElementById('clear-perfect').textContent = perfectCount;
      document.getElementById('clear-great').textContent = greatCount;
      document.getElementById('clear-miss').textContent = missCount;
      document.getElementById('clear-max-combo').textContent = maxCombo;

      // フルコンボ表示
      var fcBanner = document.getElementById('clear-fullcombo');
      if (isFullCombo) {
        fcBanner.textContent = t('fullCombo');
        fcBanner.classList.remove('hidden');
      } else {
        fcBanner.classList.add('hidden');
      }

      // 次のステージボタンの表示制御
      if (currentStageIndex >= STAGES.length - 1) {
        nextStageBtn.textContent = t('allClear');
        nextStageBtn.style.display = 'inline-block';
      } else {
        nextStageBtn.textContent = t('nextStage');
        nextStageBtn.style.display = 'inline-block';
      }

      SoundSystem.play('result');
      showScreen('clear-screen');

      // クリア演出パーティクル（canvasがgame-screen内なので、clear-screen上にも一時的に見せる）
      // 代わりにDOM花火を生成
      spawnDomFireworks();

    } else {
      // 失敗画面
      var failModeBadge = isHard ? ' 【' + t('hardBadge') + '】' : '';
      document.getElementById('result-stage-name').textContent =
        'Stage ' + (currentStageIndex + 1) + ' - ' + t(stageConfig.name) + failModeBadge;
      document.getElementById('final-score').textContent = score;
      document.getElementById('perfect-count').textContent = perfectCount;
      document.getElementById('great-count').textContent = greatCount;
      document.getElementById('miss-count').textContent = missCount;
      document.getElementById('max-combo').textContent = maxCombo;
      document.getElementById('result-rank').textContent = rank;
      document.getElementById('result-rank').className = 'rank-display rank-' + rank.toLowerCase();

      // ハイスコア
      var highscoreArea = document.getElementById('highscore-area');
      highscoreArea.innerHTML = '';
      if (result && result.isNewHigh) {
        var newRecordEl = document.createElement('div');
        newRecordEl.className = 'sg-new-record';
        newRecordEl.textContent = SurrealI18n ? SurrealI18n.t('newRecord') : '🎉 NEW RECORD!';
        highscoreArea.appendChild(newRecordEl);
      }
      var highData = GameManager.getHighScore();
      if (highData) {
        var badge = document.createElement('div');
        badge.className = 'sg-highscore-badge';
        badge.textContent = highData;
        highscoreArea.appendChild(badge);
      }

      showScreen('result-screen');
    }

    // シェアテキスト更新
    updateShareText(score, t(stageConfig.name), isHard);
  }

  // ===== DOM花火（クリア演出） =====
  function spawnDomFireworks() {
    var container = document.querySelector('#clear-screen .clear-content');
    if (!container) return;
    var colors = ['#ff6ec7', '#00fff7', '#39ff14', '#ffd700', '#ff4444', '#8b00ff', '#ff8c00'];

    for (var burst = 0; burst < 40; burst++) {
      (function (b) {
        setTimeout(function () {
          var particle = document.createElement('div');
          particle.style.cssText =
            'position:absolute;' +
            'width:' + (4 + Math.random() * 6) + 'px;' +
            'height:' + (4 + Math.random() * 6) + 'px;' +
            'border-radius:50%;' +
            'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
            'left:' + (10 + Math.random() * 80) + '%;' +
            'top:' + (5 + Math.random() * 30) + '%;' +
            'pointer-events:none;' +
            'z-index:100;' +
            'animation:fireworkParticle ' + (0.8 + Math.random() * 1.2) + 's ease-out forwards;';
          container.appendChild(particle);
          setTimeout(function () {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
          }, 2500);
        }, b * 50);
      })(burst);
    }

    // アニメーション定義（一度だけ注入）
    if (!document.getElementById('firework-styles')) {
      var style = document.createElement('style');
      style.id = 'firework-styles';
      style.textContent =
        '@keyframes fireworkParticle {' +
        '0% { opacity: 1; transform: scale(1) translateY(0); }' +
        '50% { opacity: 0.8; transform: scale(1.5) translateY(-30px); }' +
        '100% { opacity: 0; transform: scale(0.5) translateY(60px); }' +
        '}';
      document.head.appendChild(style);
    }
  }

  // ===== シェアテキスト更新 =====
  function updateShareText(s, stageName, isHard) {
    var text = SurrealI18n ? SurrealI18n.t('shareText', s, stageName, isHard) : '';
    var shareBtn = document.querySelector('.sg-share-btn');
    if (shareBtn) {
      var url = 'https://eri-murayama.github.io/surreal-games/games/surreal-beat/index.html';
      shareBtn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text + '\n' + url);
    }
  }

  // ===== i18nテキスト更新 =====
  function updateI18nTexts() {
    if (!window.SurrealI18n) return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = SurrealI18n.t(key);
    });
  }

  // ===== イベントリスナー =====
  startBtn.addEventListener('click', function () {
    renderStageList();
    showScreen('stage-select-screen');
  });

  backToTitleBtn.addEventListener('click', function () {
    showScreen('title-screen');
  });

  retryBtn.addEventListener('click', function () {
    startGame();
  });

  retryStageBtn.addEventListener('click', function () {
    startGame();
  });

  nextStageBtn.addEventListener('click', function () {
    if (currentStageIndex >= STAGES.length - 1) {
      // 全クリア → ステージ選択に戻る
      renderStageList();
      showScreen('stage-select-screen');
      return;
    }
    // 裏モードで次ステージ: 次ステージの裏が解放されていない場合はステージ選択へ戻す
    if (currentMode === 'hard') {
      var progress = loadProgress();
      if (progress.cleared.indexOf(currentStageIndex + 1) === -1) {
        renderStageList();
        showScreen('stage-select-screen');
        return;
      }
    }
    currentStageIndex++;
    startGame();
  });

  backToSelectBtn.addEventListener('click', function () {
    renderStageList();
    showScreen('stage-select-screen');
  });

  failBackBtn.addEventListener('click', function () {
    renderStageList();
    showScreen('stage-select-screen');
  });

  // タップボタン
  tapBtns.forEach(function (btn) {
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var lane = parseInt(btn.getAttribute('data-lane'));
      btn.classList.add('pressed');
      handleLaneTap(lane);
    });

    btn.addEventListener('touchend', function () {
      btn.classList.remove('pressed');
    });

    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var lane = parseInt(btn.getAttribute('data-lane'));
      btn.classList.add('pressed');
      handleLaneTap(lane);
    });

    btn.addEventListener('mouseup', function () {
      btn.classList.remove('pressed');
    });
  });

  // キーボード
  var keyMap = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };

  document.addEventListener('keydown', function (e) {
    if (gameState !== 'playing') return;
    var lane = keyMap[e.key.toLowerCase()];
    if (lane !== undefined && !e.repeat) {
      handleLaneTap(lane);
      tapBtns[lane].classList.add('pressed');
    }
  });

  document.addEventListener('keyup', function (e) {
    var lane = keyMap[e.key.toLowerCase()];
    if (lane !== undefined) {
      tapBtns[lane].classList.remove('pressed');
    }
  });

  // リサイズ時にキャンバス更新
  window.addEventListener('resize', function () {
    resizeParticleCanvas();
  });

  // 初期テキスト適用
  updateI18nTexts();
})();
