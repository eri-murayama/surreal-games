/**
 * シュールビート - リズムゲーム
 * 落ちてくるシュールなノーツをタイミングよくタップ！
 */
(function () {
  'use strict';

  // ===== i18n =====
  const translations = {
    ja: {
      gameTitle: 'シュールビート',
      gameSubtitle: 'リズムに合わせてシュールをタップ！',
      startBtn: 'スタート',
      keyHint: 'PC: D F J K キー / スマホ: タップ',
      resultTitle: 'リザルト',
      maxCombo: '最大コンボ',
      shareText: function (score, rank) {
        return 'シュールビートで ' + score + '点（ランク' + rank + '）を取ったよ！💩🎵\n#シュールゲームス #シュールビート';
      },
    },
    en: {
      gameTitle: 'Surreal Beat',
      gameSubtitle: 'Tap surreal emojis to the rhythm!',
      startBtn: 'START',
      keyHint: 'PC: D F J K keys / Mobile: Tap',
      resultTitle: 'RESULT',
      maxCombo: 'Max Combo',
      shareText: function (score, rank) {
        return 'I scored ' + score + ' (Rank ' + rank + ') in Surreal Beat! 💩🎵\n#SurrealGames #SurrealBeat';
      },
    },
  };

  if (window.SurrealI18n) {
    SurrealI18n.init(translations, {
      onLangChange: function () { updateI18nTexts(); }
    });
  }

  // ===== ゲーム初期化 =====
  const GameManager = window.SurrealGames.init('surreal-beat');
  const SoundSystem = window.SurrealGames.SoundSystem;

  // ===== 定数 =====
  const BPM = 150;
  const BEAT_INTERVAL = 60000 / BPM; // ms per beat
  const SONG_DURATION = 35000; // 35秒
  const NOTE_EMOJIS = ['💩', '🦀', '🐣', '🧬', '🔮', '👁', '🍄', '🫠', '🤡', '🧠'];
  const LANE_COUNT = 4;
  const FALL_DURATION = 2000; // ノーツが上から判定ラインまで落ちる時間(ms)

  // 判定閾値(ms)
  const PERFECT_THRESHOLD = 60;
  const GREAT_THRESHOLD = 120;

  // スコア
  const PERFECT_SCORE = 100;
  const GREAT_SCORE = 50;

  // ===== ステート =====
  let gameState = 'title'; // title, playing, result
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let perfectCount = 0;
  let greatCount = 0;
  let missCount = 0;
  let noteChart = []; // { time, lane, emoji }
  let activeNotes = []; // { el, time, lane, hit }
  let gameStartTime = 0;
  let animFrameId = null;

  // ===== DOM要素 =====
  const titleScreen = document.getElementById('title-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');
  const scoreDisplay = document.getElementById('score-display');
  const comboDisplay = document.getElementById('combo-display');
  const playArea = document.getElementById('play-area');
  const judgeEffect = document.getElementById('judge-effect');
  const progressFill = document.getElementById('progress-fill');
  const finalScore = document.getElementById('final-score');
  const perfectCountEl = document.getElementById('perfect-count');
  const greatCountEl = document.getElementById('great-count');
  const missCountEl = document.getElementById('miss-count');
  const maxComboEl = document.getElementById('max-combo');
  const resultRank = document.getElementById('result-rank');
  const highscoreArea = document.getElementById('highscore-area');
  const tapBtns = document.querySelectorAll('.tap-btn');

  // ===== 画面切り替え =====
  function showScreen(screenId) {
    [titleScreen, gameScreen, resultScreen].forEach(function (s) {
      s.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }

  // ===== 譜面自動生成 =====
  function generateChart() {
    var chart = [];
    var totalBeats = Math.floor(SONG_DURATION / BEAT_INTERVAL);
    var lastLanes = [-1, -1]; // 直前2つのレーン（同レーン連続回避）

    for (var i = 0; i < totalBeats; i++) {
      // 変化のあるリズムパターン: 8ビートベース + ランダム変調
      var beatPhase = i % 8;
      var shouldPlace = false;

      // 基本パターン: 1, 3, 5, 7拍目（8ビート）
      if (beatPhase === 0 || beatPhase === 2 || beatPhase === 4 || beatPhase === 6) {
        shouldPlace = true;
      }
      // 裏拍を時々入れる（30%）
      if (!shouldPlace && Math.random() < 0.3) {
        shouldPlace = true;
      }
      // たまに8ビートの拍を抜く（15%）
      if (shouldPlace && Math.random() < 0.15) {
        shouldPlace = false;
      }

      if (shouldPlace) {
        // レーン選択（直前と被りにくく）
        var lane;
        var attempts = 0;
        do {
          lane = Math.floor(Math.random() * LANE_COUNT);
          attempts++;
        } while (attempts < 10 && (lane === lastLanes[0] && lane === lastLanes[1]));

        lastLanes[1] = lastLanes[0];
        lastLanes[0] = lane;

        chart.push({
          time: i * BEAT_INTERVAL,
          lane: lane,
          emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)]
        });
      }
    }

    // サビ（後半）で密度UP: 追加ノーツ
    var sabiStart = Math.floor(totalBeats * 0.6);
    for (var j = sabiStart; j < totalBeats; j++) {
      if (Math.random() < 0.2) {
        var extraLane = Math.floor(Math.random() * LANE_COUNT);
        // 既存ノーツと同時刻・同レーンでないか確認
        var time = j * BEAT_INTERVAL;
        var conflict = chart.some(function (n) {
          return Math.abs(n.time - time) < 50 && n.lane === extraLane;
        });
        if (!conflict) {
          chart.push({
            time: time,
            lane: extraLane,
            emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)]
          });
        }
      }
    }

    // 時刻順にソート
    chart.sort(function (a, b) { return a.time - b.time; });
    return chart;
  }

  // ===== ゲーム開始 =====
  function startGame() {
    gameState = 'playing';
    score = 0;
    combo = 0;
    maxCombo = 0;
    perfectCount = 0;
    greatCount = 0;
    missCount = 0;
    activeNotes = [];
    noteChart = generateChart();

    scoreDisplay.textContent = '0';
    comboDisplay.textContent = '0';
    progressFill.style.width = '0%';

    // プレイエリアのノーツをクリア
    var existingNotes = playArea.querySelectorAll('.note');
    existingNotes.forEach(function (n) { n.remove(); });

    showScreen('game-screen');
    GameManager.onGameStart();

    gameStartTime = performance.now();
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ===== ゲームループ =====
  function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    var elapsed = timestamp - gameStartTime;
    var progress = Math.min(elapsed / SONG_DURATION, 1);
    progressFill.style.width = (progress * 100) + '%';

    // ノーツ生成（FALL_DURATION分前に生成）
    for (var i = 0; i < noteChart.length; i++) {
      var note = noteChart[i];
      var spawnTime = note.time - FALL_DURATION;

      if (elapsed >= spawnTime && !note.spawned) {
        note.spawned = true;
        spawnNote(note, i);
      }
    }

    // アクティブノーツの位置更新
    for (var j = activeNotes.length - 1; j >= 0; j--) {
      var an = activeNotes[j];
      if (an.hit) continue;

      var noteElapsed = elapsed - (an.time - FALL_DURATION);
      var ratio = noteElapsed / FALL_DURATION;

      if (ratio >= 0 && ratio <= 1.3) {
        an.el.style.top = (ratio * 100) + '%';
      }

      // Miss判定: 判定ラインを通り過ぎた
      if (elapsed > an.time + GREAT_THRESHOLD) {
        an.hit = true;
        missCount++;
        combo = 0;
        comboDisplay.textContent = '0';
        showJudge('miss', an.lane);
        removeNote(an.el);
        activeNotes.splice(j, 1);
      }
    }

    // 曲終了チェック
    // 全ノーツが処理済みか、曲時間+余裕で終了
    if (elapsed >= SONG_DURATION + FALL_DURATION + 500) {
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

  // ===== ノーツ削除（アニメーション付き） =====
  function removeNote(el) {
    el.classList.add('note-hit');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  // ===== 判定表示 =====
  function showJudge(type, lane) {
    var text = document.createElement('div');
    text.className = 'judge-text ' + type;
    text.textContent = type === 'perfect' ? 'PERFECT' : type === 'great' ? 'GREAT' : 'MISS';
    // レーンの中央に表示
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

    // 最も近いノーツを見つける
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
      // 空振り — 何もしない（Missは自動判定のみ）
      return;
    }

    closestNote.hit = true;
    SoundSystem.play('tap');

    if (closestDiff <= PERFECT_THRESHOLD) {
      // Perfect
      perfectCount++;
      combo++;
      var multiplier = 1 + Math.floor(combo / 10) * 0.5;
      score += Math.floor(PERFECT_SCORE * multiplier);
      showJudge('perfect', lane);
    } else {
      // Great
      greatCount++;
      combo++;
      var multiplierG = 1 + Math.floor(combo / 10) * 0.5;
      score += Math.floor(GREAT_SCORE * multiplierG);
      showJudge('great', lane);
    }

    if (combo > maxCombo) maxCombo = combo;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;

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

    // 残りのアクティブノーツをMissとしてカウント
    activeNotes.forEach(function (n) {
      if (!n.hit) {
        missCount++;
        if (n.el.parentNode) n.el.parentNode.removeChild(n.el);
      }
    });
    activeNotes = [];

    var result = GameManager.onGameEnd(score);

    // リザルト表示
    finalScore.textContent = score;
    perfectCountEl.textContent = perfectCount;
    greatCountEl.textContent = greatCount;
    missCountEl.textContent = missCount;
    maxComboEl.textContent = maxCombo;

    // ランク計算
    var totalNotes = perfectCount + greatCount + missCount;
    var accuracy = totalNotes > 0 ? (perfectCount + greatCount * 0.5) / totalNotes : 0;
    var rank = 'D';
    if (accuracy >= 0.95 && missCount === 0) rank = 'S';
    else if (accuracy >= 0.85) rank = 'A';
    else if (accuracy >= 0.7) rank = 'B';
    else if (accuracy >= 0.5) rank = 'C';

    resultRank.textContent = rank;
    resultRank.className = 'rank-display rank-' + rank.toLowerCase();

    // ハイスコア
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

    // シェアテキストを更新
    updateShareText(score, rank);

    showScreen('result-screen');
  }

  // ===== シェアテキスト更新 =====
  function updateShareText(s, r) {
    var text = SurrealI18n ? SurrealI18n.t('shareText', s, r) : '';
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
  // スタートボタン
  startBtn.addEventListener('click', function () {
    startGame();
  });

  // リトライボタン
  retryBtn.addEventListener('click', function () {
    startGame();
  });

  // タップボタン（スマホ）
  tapBtns.forEach(function (btn) {
    // タッチ開始で即反応
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var lane = parseInt(btn.getAttribute('data-lane'));
      btn.classList.add('pressed');
      handleLaneTap(lane);
    });

    btn.addEventListener('touchend', function () {
      btn.classList.remove('pressed');
    });

    // マウスクリック（PC + タッチスクリーンPC）
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

  // キーボード（PC）
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

  // 初期i18nテキスト適用
  updateI18nTexts();
})();
