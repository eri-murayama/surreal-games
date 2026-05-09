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
      gameSubtitle: '9ゲームのBGMでリズムをタップ！',
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
      stage9: 'おじさんマシーン',
      stage1detail: '脱出ゲーム / BPM 120 / 入門',
      stage2detail: 'かにかに / BPM 160 / ポップ',
      stage3detail: '経営分析 / BPM 115 / きらめき',
      stage4detail: '黄金ドライバー / BPM 180 / レース',
      stage5detail: 'うんコーン / BPM 140 / マーチ',
      stage6detail: 'マインスイーパー / BPM 56 / ホラー',
      stage7detail: 'シュール進化論 / BPM 75 / アンビエント',
      stage8detail: '漆黒のリバーシ / BPM 170 / バトル',
      stage9detail: 'THE MACHINE / BPM 132 / 機械',
      modeNormal: '表',
      modeHard: '裏',
      hardLocked: '表クリアで解放',
      hardBadge: '裏',
      hardIntro: '★ 裏モード ★',
      hardClear: '裏モード制覇！',
      introOk: '好きな曲を選ぶ！',
      allClearOk: 'ありがとう！',
      shareText: function (score, stage, isHard) {
        var tag = isHard ? '【裏】' : '';
        return 'シュールビート' + tag + '「' + stage + '」で ' + score + '点！🎵\n#シュールゲームス #シュールビート';
      },
    },
    en: {
      gameTitle: 'Surreal Beat',
      gameSubtitle: '9 stages of game BGM rhythm!',
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
      stage9: 'The Uncle Machine',
      stage1detail: 'Escape Room / BPM 120 / Intro',
      stage2detail: 'Whack Crab / BPM 160 / Pop',
      stage3detail: 'Business Analysis / BPM 115 / Sparkle',
      stage4detail: 'Gold Driver / BPM 180 / Race',
      stage5detail: 'Unko Cone / BPM 140 / March',
      stage6detail: 'Minesweeper / BPM 56 / Horror',
      stage7detail: 'Surreal Evolution / BPM 75 / Ambient',
      stage8detail: 'Black Reversi / BPM 170 / Battle',
      stage9detail: 'THE MACHINE / BPM 132 / Machine',
      modeNormal: 'NORMAL',
      modeHard: 'HARD',
      hardLocked: 'Clear normal to unlock',
      hardBadge: 'HARD',
      hardIntro: '★ HARD MODE ★',
      hardClear: 'HARD MODE CLEAR!',
      introOk: 'Pick a song!',
      allClearOk: 'Thank you!',
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
      // Stage 6 - かいだんマインスイーパー（2026.04.06）— 実ゲームのドローンBGM＋怪談音声
      name: 'stage6', themeKey: 'kaidan', bpm: 56, duration: 35000,
      bgm: 'horror', voiceTrack: 'kaidan-voice', emojis: ['👻', '💀', '🪦', '💣', '🕯'],
      colors: ['#b0bec5', '#607d8b', '#37474f'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(96,125,139,0.3), transparent 60%), linear-gradient(180deg, #0a0e12 0%, #000308 100%)',
      offbeatChance: 0.38, skipChance: 0.08, doubleChance: 0.2,
      sabiDensity: 0.3, sixteenthChance: 0.2
    },
    {
      // Stage 7 - シュール進化論（2026.04.11）— 実ゲームの宇宙アンビエントBGM
      name: 'stage7', themeKey: 'evo', bpm: 75, duration: 36000,
      bgm: 'ambient', emojis: ['🐣', '🥚', '🌟', '⭐', '🟡'],
      colors: ['#fff9c4', '#fff176', '#f9a825'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(255,241,118,0.3), transparent 60%), linear-gradient(180deg, #2a2200 0%, #1a1500 100%)',
      offbeatChance: 0.42, skipChance: 0.06, doubleChance: 0.25,
      sabiDensity: 0.32, sixteenthChance: 0.22
    },
    {
      // Stage 8 - 漆黒のリバーシ（2026.04.13）— battleプリセット（実際のゲームBGM）
      name: 'stage8', themeKey: 'reversi', bpm: 170, duration: 38000,
      bgm: 'battle', emojis: ['⚫', '⚪', '🔮', '💜', '✨'],
      colors: ['#ce93d8', '#9c27b0', '#6a1b9a'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(156,39,176,0.35), transparent 60%), linear-gradient(180deg, #1a0020 0%, #0a0010 100%)',
      offbeatChance: 0.48, skipChance: 0.04, doubleChance: 0.3,
      sabiDensity: 0.36, sixteenthChance: 0.28
    },
    {
      // Stage 9 - THE MACHINE（2026.04.26, 最新）— 機械化したほのぼの
      name: 'stage9', themeKey: 'machine', bpm: 132, duration: 38000,
      bgm: 'machine', emojis: ['🤖', '⚙️', '🔩', '💡', '🦾'],
      colors: ['#b3e5fc', '#03a9f4', '#01579b'],
      bgGradient: 'radial-gradient(ellipse at top, rgba(3,169,244,0.3), transparent 60%), linear-gradient(180deg, #001a2e 0%, #000814 100%)',
      offbeatChance: 0.52, skipChance: 0.03, doubleChance: 0.34,
      sabiDensity: 0.40, sixteenthChance: 0.32
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
  var stageSelectIntroShown = false; // ステージ選択の初回イントロ画像を表示済みか

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
  var stageSelectIntroEl = document.getElementById('stage-select-intro');
  var stageSelectIntroCloseBtn = document.getElementById('stage-select-intro-close');
  var allClearOverlayEl = document.getElementById('all-clear-overlay');
  var allClearCloseBtn = document.getElementById('all-clear-close');

  // ===== 画面切り替え =====
  function showScreen(screenId) {
    var screens = [titleScreen, stageSelectScreen, gameScreen, clearScreen, resultScreen];
    screens.forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(screenId).classList.add('active');
  }

  // ===== オーバーレイ表示 =====
  // 初回ステージ選択時のイントロ画像（タップで消える）
  function maybeShowStageSelectIntro() {
    if (stageSelectIntroShown) return;
    if (!stageSelectIntroEl) return;
    stageSelectIntroShown = true;
    stageSelectIntroEl.classList.remove('hidden');
    stageSelectIntroEl.setAttribute('aria-hidden', 'false');
  }

  function hideStageSelectIntro() {
    if (!stageSelectIntroEl) return;
    stageSelectIntroEl.classList.add('hidden');
    stageSelectIntroEl.setAttribute('aria-hidden', 'true');
  }

  // 全ステージクリアのお祝いオーバーレイ
  function showAllClearOverlay() {
    if (!allClearOverlayEl) return;
    allClearOverlayEl.classList.remove('hidden');
    allClearOverlayEl.setAttribute('aria-hidden', 'false');
  }

  function hideAllClearOverlay() {
    if (!allClearOverlayEl) return;
    allClearOverlayEl.classList.add('hidden');
    allClearOverlayEl.setAttribute('aria-hidden', 'true');
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
  // BGMプリセットの実際のメロディ拍位置（swing含む）に合わせてノートを配置。
  // これによりノーツがBGMの音と一致するタイミングで落ちてくる。
  function generateChart(stageConfig) {
    var emojis = stageConfig.emojis;
    var presets = (window.SurrealGames && window.SurrealGames.BGM_PRESETS) || null;
    var preset = presets ? presets[stageConfig.bgm] : null;

    // BGMプリセットが取れない場合はフォールバック（旧来の等間隔生成）
    if (!preset || !preset.melody) {
      return generateChartFromBpm(stageConfig);
    }

    // 裏モードはBGM自体が速く鳴るので、譜面側もその倍率で時間を縮める
    var bgmSpeed = (currentMode === 'hard') ? HARD_MULTIPLIER.bpmBoost : 1.0;
    var baseBeat = 60000 / preset.tempo / bgmSpeed;
    var melody = preset.melody;
    var bass = preset.bass || [];
    var brass = preset.brass || [];
    var sparkle = preset.sparkle || [];
    var farts = preset.farts || [];
    var swing = preset.swing;

    // 各拍の開始オフセット（_loopBgmと同じ計算）
    var offsets = [];
    var t = 0;
    for (var i = 0; i < melody.length; i++) {
      offsets.push(t);
      t += baseBeat * (swing ? swing[i] : 1);
    }
    var loopDur = t;

    // メロディ全体の最小/最大周波数を求めて相対マッピング
    var minF = Infinity, maxF = 0;
    for (var mi = 0; mi < melody.length; mi++) {
      if (melody[mi] > 0) {
        if (melody[mi] < minF) minF = melody[mi];
        if (melody[mi] > maxF) maxF = melody[mi];
      }
    }
    var minLogF = Math.log(minF);
    var rangeLogF = Math.log(maxF) - minLogF;

    // 周波数→レーン: 曲のメロディ最低音=左、最高音=右
    function freqToLane(freq) {
      if (!freq || rangeLogF <= 0) return Math.floor(Math.random() * LANE_COUNT);
      var ratio = (Math.log(freq) - minLogF) / rangeLogF;
      ratio = Math.max(0, Math.min(0.999, ratio));
      return Math.floor(ratio * LANE_COUNT);
    }

    var chart = [];
    var lastLane = -1;
    var lastTime = -Infinity;
    var totalLoops = Math.ceil(stageConfig.duration / loopDur) + 1;

    function pushNote(time, lane) {
      if (time >= stageConfig.duration) return false;
      // 直前と同じレーン・近すぎる時刻ならレーンをずらす（連続タップしすぎ防止）
      if (lane === lastLane && time - lastTime < baseBeat * 0.4) {
        lane = (lane + 1) % LANE_COUNT;
      }
      chart.push({
        time: time,
        lane: lane,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
      lastLane = lane;
      lastTime = time;
      return true;
    }

    // 譜面のノートはBGMで実際に音が鳴る瞬間にだけ置く。
    // 候補となる音源: melody（主旋律）, bass（強拍の支え）, brass/sparkle/farts（アクセント）
    for (var loopIdx = 0; loopIdx < totalLoops; loopIdx++) {
      for (var k = 0; k < melody.length; k++) {
        var time = loopIdx * loopDur + offsets[k];
        if (time >= stageConfig.duration) break;

        var beatPhase = k % 8;
        var isStrong = (beatPhase === 0 || beatPhase === 2 || beatPhase === 4 || beatPhase === 6);
        var isSabi = (time / stageConfig.duration) >= 0.6;

        var melFreq = melody[k] || 0;
        var bassFreq = bass[k] || 0;
        var brassFreq = brass[k] || 0;
        var sparkleFreq = sparkle[k] || 0;
        var hasFart = (farts[k] || 0) > 0;
        var melodyPlaced = false;

        // (1) メロディが鳴る瞬間は基本ノートを配置（弱拍はskipChance、強拍はその半分で抜く）
        if (melFreq > 0) {
          var skipP = stageConfig.skipChance * (isStrong ? 0.5 : 1.0);
          if (Math.random() >= skipP) {
            pushNote(time, freqToLane(melFreq));
            melodyPlaced = true;
          }
        }

        // (2) ブラス/スパークル/おなら のアクセント音は offbeatChance で追加
        var accentFreq = brassFreq || sparkleFreq;
        var hasAccent = accentFreq > 0 || hasFart;
        if (hasAccent) {
          var accentP = stageConfig.offbeatChance * (isSabi ? 1.4 : 1.0);
          if (Math.random() < accentP) {
            var lane = freqToLane(accentFreq || maxF || 1500);
            if (melodyPlaced) {
              // メロディと同時押しに（時刻同じ・レーン違い）
              if (lane === lastLane) lane = (lane + 1) % LANE_COUNT;
              chart.push({
                time: time,
                lane: lane,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
              });
              lastLane = lane;
            } else {
              pushNote(time, lane);
            }
          }
        }

        // (3) 強拍にベース音が鳴っていれば doubleChance で同時押しを追加
        if (melodyPlaced && bassFreq > 0 && isStrong
            && stageConfig.doubleChance > 0 && Math.random() < stageConfig.doubleChance) {
          var bassLane = freqToLane(bassFreq);
          if (bassLane === lastLane) bassLane = (bassLane + 1) % LANE_COUNT;
          chart.push({
            time: time,
            lane: bassLane,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
          });
          lastLane = bassLane;
        }
      }
    }

    chart.sort(function (a, b) { return a.time - b.time; });
    return chart;
  }

  // BGMプリセットが見つからない場合の旧来生成（フォールバック）
  function generateChartFromBpm(stageConfig) {
    var chart = [];
    var beatInterval = 60000 / stageConfig.bpm;
    var totalBeats = Math.floor(stageConfig.duration / beatInterval);
    var lastLanes = [-1, -1];
    var emojis = stageConfig.emojis;

    for (var i = 0; i < totalBeats; i++) {
      var beatPhase = i % 8;
      var shouldPlace = (beatPhase === 0 || beatPhase === 2 || beatPhase === 4 || beatPhase === 6);
      if (!shouldPlace && Math.random() < stageConfig.offbeatChance) shouldPlace = true;
      if (shouldPlace && Math.random() < stageConfig.skipChance) shouldPlace = false;

      if (shouldPlace) {
        var lane;
        do { lane = Math.floor(Math.random() * LANE_COUNT); }
        while (lane === lastLanes[0] && lane === lastLanes[1]);
        lastLanes[1] = lastLanes[0];
        lastLanes[0] = lane;
        chart.push({ time: i * beatInterval, lane: lane, emoji: emojis[Math.floor(Math.random() * emojis.length)] });
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

    // パーティクルキャンバスサイズ
    resizeParticleCanvas();

    // カウントダウンが終わったらBGMとゲームループを開始
    gameState = 'countdown';
    var bgmSpeed = (currentMode === 'hard') ? HARD_MULTIPLIER.bpmBoost : 1.0;
    startCountdown(function () {
      gameState = 'playing';
      SoundSystem.playBgm(baseConfig.bgm, { speed: bgmSpeed });
      // ステージ専用ボイストラック（例: Stage 6 の怪談音声）を併走再生
      startVoiceTrack(baseConfig.voiceTrack, bgmSpeed);
      gameStartTime = performance.now();
      animFrameId = requestAnimationFrame(gameLoop);

      // 背景パルスはBGMの実テンポに合わせる（譜面と視覚演出をBGMで統一）
      var bgmPresets = window.SurrealGames && window.SurrealGames.BGM_PRESETS;
      var bgmPreset = bgmPresets ? bgmPresets[baseConfig.bgm] : null;
      var pulseBpm = bgmPreset ? bgmPreset.tempo * bgmSpeed : stageConfig.bpm;
      startBeatPulse(pulseBpm);
    });
  }

  // ===== ステージ専用ボイストラック（mp3併走） =====
  // BGMと別レーンで <audio> を鳴らす。ミュート切替・ステージ離脱で停止する。
  var currentVoiceEl = null;
  function startVoiceTrack(elementId, speed) {
    stopVoiceTrack();
    if (!elementId) return;
    var el = document.getElementById(elementId);
    if (!el) return;
    currentVoiceEl = el;
    try {
      el.currentTime = 0;
      el.playbackRate = speed || 1.0;
      // ミュート中は再生しないがオブジェクトは保持（解除時に再生する）
      if (SoundSystem && SoundSystem.enabled === false) return;
      var p = el.play();
      if (p && p.catch) p.catch(function () { /* 自動再生ブロック等は無視 */ });
    } catch (e) { /* ignore */ }
  }
  function stopVoiceTrack() {
    if (!currentVoiceEl) return;
    try {
      currentVoiceEl.pause();
      currentVoiceEl.currentTime = 0;
    } catch (e) { /* ignore */ }
    currentVoiceEl = null;
  }
  function pauseVoiceTrack() {
    if (!currentVoiceEl) return;
    try { currentVoiceEl.pause(); } catch (e) { /* ignore */ }
  }
  function resumeVoiceTrack() {
    if (!currentVoiceEl) return;
    try {
      var p = currentVoiceEl.play();
      if (p && p.catch) p.catch(function () { /* ignore */ });
    } catch (e) { /* ignore */ }
  }

  // SoundSystem.toggle にフックしてボイストラックもミュート連動させる
  if (SoundSystem && typeof SoundSystem.toggle === 'function' && !SoundSystem._voiceHooked) {
    SoundSystem._voiceHooked = true;
    var _origToggle = SoundSystem.toggle.bind(SoundSystem);
    SoundSystem.toggle = function () {
      var on = _origToggle();
      if (on) resumeVoiceTrack();
      else pauseVoiceTrack();
      return on;
    };
  }

  // ===== ゲーム開始前のカウントダウン（3,2,1,GO） =====
  // ノーツが落ちてくる前に心の準備時間を作る
  var countdownTimer = null;
  function startCountdown(onComplete) {
    var el = document.getElementById('countdown-overlay');
    if (!el) { onComplete(); return; }
    if (countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null; }

    var steps = [
      { text: '3',   cls: 'tick', dur: 700 },
      { text: '2',   cls: 'tick', dur: 700 },
      { text: '1',   cls: 'tick', dur: 700 },
      { text: 'GO!', cls: 'go',   dur: 500 },
    ];
    var i = 0;
    function next() {
      if (i >= steps.length) {
        el.className = '';
        el.textContent = '';
        onComplete();
        return;
      }
      var s = steps[i++];
      el.className = '';
      el.textContent = s.text;
      // reflow強制でアニメーションを再起動
      void el.offsetWidth;
      el.classList.add(s.cls);
      // カウントダウン音
      if (window.SoundSystem || window.SurrealGames) {
        try { (window.SurrealGames.SoundSystem || window.SoundSystem).play('tap'); } catch (e) { /* ignore */ }
      }
      countdownTimer = setTimeout(next, s.dur);
    }
    next();
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
    stopVoiceTrack();

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
      // 更新前のクリア状況を覚えておく（全クリア演出の判定用）
      var wasAllNormalCleared = progress.cleared.length >= STAGES.length;
      var wasAllHardCleared = progress.hardCleared.length >= STAGES.length;
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
      // この一戦で初めて全ステージを制覇したか
      var isFirstAllClear = isHard
        ? (!wasAllHardCleared && progress.hardCleared.length >= STAGES.length)
        : (!wasAllNormalCleared && progress.cleared.length >= STAGES.length);

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

      // 初めて全ステージ制覇したらお祝いオーバーレイを表示
      if (isFirstAllClear) {
        // クリア画面の演出と被らないよう少し遅延
        setTimeout(showAllClearOverlay, 700);
      }

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
      shareBtn.href = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text + '\n' + url);
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
  // 共通モジュールのミュートボタンと怪談音声を連動（ミュート時に止め、解除時に再開）
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest('.sg-sound-toggle')) return;
    // SoundSystem.toggle() はボタンの click ハンドラ内で同期的に呼ばれるので
    // ここに来た時点で enabled は新しい値になっている
    if (SoundSystem.enabled) resumeVoiceTrack();
    else pauseVoiceTrack();
  });

  startBtn.addEventListener('click', function () {
    renderStageList();
    showScreen('stage-select-screen');
    // 初回ステージ選択時のみイントロ画像を表示
    maybeShowStageSelectIntro();
  });

  // イントロ画像を閉じる（OKボタン or オーバーレイ自体タップ）
  if (stageSelectIntroCloseBtn) {
    stageSelectIntroCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      hideStageSelectIntro();
    });
  }
  if (stageSelectIntroEl) {
    stageSelectIntroEl.addEventListener('click', function () {
      hideStageSelectIntro();
    });
  }

  // 全クリアオーバーレイを閉じる
  if (allClearCloseBtn) {
    allClearCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      hideAllClearOverlay();
    });
  }
  if (allClearOverlayEl) {
    allClearOverlayEl.addEventListener('click', function () {
      hideAllClearOverlay();
    });
  }

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
