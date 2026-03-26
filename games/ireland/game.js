/* ===== アイルランドゲーム - game.js ===== */

(function () {
  'use strict';

  const sg = SurrealGames.init('ireland');

  // ===== UTILS =====
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  // ===== FLAG HTML =====
  function makeFlagHTML(colors) {
    return '<div class="flag-display">'
      + colors.map(function(c) { return '<div class="stripe" style="background:' + c + '"></div>'; }).join('')
      + '</div>';
  }

  // ===== SVG COUNTRY SHAPES =====
  var SHAPES = {
    ireland: '<svg viewBox="0 0 60 60"><path d="M28,8 C24,10 20,14 18,20 C16,26 17,30 15,35 C13,40 14,45 16,48 C18,51 22,53 26,52 C28,51 30,48 32,45 C34,42 36,38 37,34 C38,30 38,26 36,22 C34,18 32,14 30,10 Z" fill="#22c55e" opacity="0.9"/></svg>',
    uk: '<svg viewBox="0 0 60 60"><path d="M20,8 L25,8 L28,12 L32,10 L35,14 L33,18 L36,22 L38,20 L40,24 L37,28 L35,32 L32,36 L28,38 L24,42 L22,46 L18,48 L15,44 L20,40 L22,36 L18,32 L16,28 L18,24 L20,20 L17,16 L19,12 Z" fill="#22c55e" opacity="0.9"/></svg>',
    iceland: '<svg viewBox="0 0 60 60"><path d="M10,22 C14,20 18,18 22,18 C26,18 30,16 34,17 C38,18 42,20 46,22 C48,24 50,26 48,28 C46,30 44,32 40,33 C36,34 32,33 28,34 C24,35 20,36 16,34 C12,32 10,28 10,25 Z" fill="#22c55e" opacity="0.9"/></svg>',
    sri_lanka: '<svg viewBox="0 0 60 60"><path d="M28,10 C32,12 35,16 36,22 C37,28 36,34 34,40 C32,44 30,48 27,50 C24,48 22,44 21,40 C20,34 20,28 22,22 C24,16 26,12 28,10 Z" fill="#22c55e" opacity="0.9"/></svg>',
    madagascar: '<svg viewBox="0 0 60 60"><path d="M30,8 C33,12 35,18 36,24 C37,30 36,36 34,42 C32,46 29,50 26,52 C24,48 23,42 22,36 C21,30 22,24 24,18 C26,12 28,10 30,8 Z" fill="#22c55e" opacity="0.9"/></svg>',
    taiwan: '<svg viewBox="0 0 60 60"><path d="M30,12 C34,16 36,22 36,28 C36,34 34,40 30,46 C28,42 26,36 26,30 C26,24 27,18 30,12 Z" fill="#22c55e" opacity="0.9"/></svg>',
    corsica: '<svg viewBox="0 0 60 60"><path d="M28,12 C31,14 33,18 34,24 C35,30 33,36 30,42 C28,38 26,32 26,26 C26,20 27,16 28,12 Z" fill="#22c55e" opacity="0.9"/></svg>',
    sardinia: '<svg viewBox="0 0 60 60"><path d="M26,10 C30,12 33,16 34,22 C35,28 34,34 32,40 C30,44 27,48 24,46 C22,42 21,36 22,30 C23,24 24,16 26,10 Z" fill="#22c55e" opacity="0.9"/></svg>'
  };

  // ===== ROUND POOL BUILDER =====
  function buildRoundPool() {
    return [
      // --- 文字ラウンド: カタカナ ---
      {
        type: '文字',
        question: '「アイルランド」を探せ！',
        correct: 'アイルランド',
        decoys: ['アイスランド', 'アイランド', 'アイルラント', 'アイルランク', 'アイルフンド', 'アイムランド', 'アイルワンド', 'アイルラソド', 'アイルランﾄ', 'アイルヲンド', 'アイルラング', 'アインランド', 'アイルテンド', 'アイルサンド', 'アイルパンド', 'アイルマンド', 'アイルカンド', 'アイルタンド'],
        trivia: 'アイルランド（Ireland）とアイスランド（Iceland）は約1,500km離れた全く別の国！',
        count: 20
      },
      {
        type: '文字',
        question: '「アイルランド」を探せ！（激ムズ）',
        correct: 'アイルランド',
        decoys: ['アイルラソド', 'アイルランﾄﾞ', 'アイルラソド', 'アイルランﾄ', 'アイルヲンド', 'アイルラント', 'アイルフンド', 'アイルランク', 'アイルラソト', 'アイルラソﾄ', 'アイルラソド', 'アイルランヅ', 'アイルランデ', 'アイルテンド', 'アイルワンド', 'アイルパンド', 'アイルランゼ', 'アイルバンド', 'アイルダンド'],
        trivia: '「ン」と「ソ」、「ド」と「ト」、全角と半角…日本語の定番ひっかけ！',
        count: 24
      },

      // --- 英語ラウンド ---
      {
        type: '英語',
        question: '「Ireland」を探せ！',
        correct: 'Ireland',
        decoys: ['Iceland', 'Iraland', 'Irland', 'Ireiand', 'lreland', 'Ire1and', 'Ierland', 'Irelnad', 'Iroland', 'Ircland', 'Irelend', 'Ire|and', 'IreIand', 'Ireiand', 'Irelamd', 'Irelano', 'Irelard', 'Irelanb', 'Irealnd'],
        trivia: 'IcelandはIce（氷）の国、IrelandはEire（古アイルランド語）が由来。',
        count: 20
      },
      {
        type: '英語',
        question: '「IRELAND」を探せ！（大文字）',
        correct: 'IRELAND',
        decoys: ['ICELAND', 'IRALAND', 'IRLAND', 'IRELANO', 'LRELAND', 'IRE1AND', 'IERLAND', 'IRELNAD', 'IROLAND', 'IRCLAND', 'IRELEND', 'IRELAMD', 'IRELARD', 'IREIAND', 'IRELANB', 'IREALND', 'IRELAHD', 'IRELANH', 'IRELAJD'],
        trivia: '大文字だとIとLが見分けにくい！IRELANDが正解。',
        count: 22
      },

      // --- 国旗ラウンド ---
      {
        type: '国旗',
        question: 'アイルランドの国旗を探せ！',
        correct: { colors: ['#169b62', '#ffffff', '#ff883e'] },
        decoys: [
          { colors: ['#ff883e', '#ffffff', '#169b62'] },  // コートジボワール（左右逆）
          { colors: ['#009246', '#ffffff', '#ce2b37'] },  // イタリア
          { colors: ['#002395', '#ffffff', '#ed2939'] },  // フランス
          { colors: ['#000000', '#ce1126', '#fcd116'] },  // ベルギー
          { colors: ['#169b62', '#ffffff', '#ce2b37'] },  // 緑白赤
          { colors: ['#169b62', '#fedd00', '#ff883e'] },  // 緑黄橙（真ん中が黄色）
          { colors: ['#009246', '#ffffff', '#ff883e'] },  // イタリア緑＋橙
          { colors: ['#21468b', '#ffffff', '#ae1c28'] },  // オランダ
          { colors: ['#c8102e', '#ffffff', '#002654'] },  // 赤白青
          { colors: ['#169b62', '#87ceeb', '#ff883e'] },  // 緑水色橙（真ん中が水色）
          { colors: ['#169b62', '#ffb6c1', '#ff883e'] },  // 緑ピンク橙（真ん中がピンク）
        ],
        trivia: '左から緑・白・オレンジ。コートジボワールはオレンジ・白・緑で逆！',
        count: 12
      },
      {
        type: '国旗',
        question: 'もう一度！アイルランドの国旗は？',
        correct: { colors: ['#169b62', '#ffffff', '#ff883e'] },
        decoys: [
          { colors: ['#ff883e', '#ffffff', '#169b62'] },  // 左右逆
          { colors: ['#009246', '#ffffff', '#ce2b37'] },  // イタリア
          { colors: ['#169b62', '#ffffff', '#ce2b37'] },  // 緑白赤
          { colors: ['#169b62', '#fedd00', '#ff883e'] },  // 真ん中が黄色
          { colors: ['#169b62', '#ff883e', '#ffffff'] },  // 緑橙白（順番違い）
          { colors: ['#ffffff', '#169b62', '#ff883e'] },  // 白緑橙（順番違い）
          { colors: ['#169b62', '#87ceeb', '#ff883e'] },  // 真ん中が水色
          { colors: ['#ff883e', '#169b62', '#ffffff'] },  // 橙緑白
          { colors: ['#169b62', '#ffffff', '#ffd700'] },  // 緑白金（右が金色）
          { colors: ['#169b62', '#ffffff', '#ff4444'] },  // 緑白赤（右が赤）
          { colors: ['#002395', '#169b62', '#ff883e'] },  // 青緑橙
        ],
        trivia: '緑はカトリック、オレンジはプロテスタント、白は両者の平和を象徴。',
        count: 12
      },

      // --- 国の形ラウンド ---
      {
        type: '国の形',
        question: 'アイルランドの形を探せ！',
        correctShape: 'ireland',
        decoyShapes: ['uk', 'iceland', 'sri_lanka', 'madagascar', 'taiwan', 'corsica', 'sardinia'],
        trivia: 'アイルランド島はヨーロッパで3番目に大きい島。北部は英国領の北アイルランド。',
        count: 8
      }
    ];
  }

  var TOTAL_ROUNDS = 10;
  var TIME_PER_ROUND = 8;
  var BASE_SCORE = 100;

  var RANKS = [
    { min: 0,    label: 'アイルランド初心者', icon: '🌱' },
    { min: 400,  label: 'アイルランド見習い', icon: '☘️' },
    { min: 700,  label: 'アイルランド通',     icon: '🍀' },
    { min: 1000, label: 'アイルランドマスター', icon: '🇮🇪' },
    { min: 1500, label: 'アイルランドの妖精', icon: '✨🇮🇪✨' }
  ];

  // ===== STATE =====
  var rounds = [];
  var currentIndex = 0;
  var score = 0;
  var streak = 0;
  var maxStreak = 0;
  var correctCount = 0;
  var timerInterval = null;
  var timeLeft = 0;
  var answered = false;

  // ===== DOM =====
  var $id = function(id) { return document.getElementById(id); };
  var titleScreen = $id('title-screen');
  var gameScreen = $id('game-screen');
  var resultScreen = $id('result-screen');
  var startBtn = $id('start-btn');
  var retryBtn = $id('retry-btn');
  var scoreDisplay = $id('score-display');
  var streakCount = $id('streak-count');
  var streakFire = $id('streak-fire');
  var roundNumber = $id('round-number');
  var roundType = $id('round-type');
  var timerBar = $id('timer-bar');
  var questionText = $id('question-text');
  var fieldArea = $id('field-area');
  var feedbackArea = $id('feedback-area');
  var feedbackIcon = $id('feedback-icon');
  var feedbackText = $id('feedback-text');
  var flashOverlay = $id('flash-overlay');

  var resultIcon = $id('result-icon');
  var resultRank = $id('result-rank');
  var resultScore = $id('result-score');
  var resultCorrect = $id('result-correct');
  var resultMaxStreak = $id('result-max-streak');
  var resultAccuracy = $id('result-accuracy');

  function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(function(s) { s.classList.remove('active'); });
    screen.classList.add('active');
  }

  // ===== SCATTER PLACEMENT (collision-avoiding) =====
  function placeItems(count, fieldW, fieldH, itemW, itemH) {
    var positions = [];
    var maxAttempts = 200;
    for (var i = 0; i < count; i++) {
      var placed = false;
      for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var x = rand(4, fieldW - itemW - 4);
        var y = rand(4, fieldH - itemH - 4);
        var overlaps = false;
        for (var j = 0; j < positions.length; j++) {
          var p = positions[j];
          if (Math.abs(x - p.x) < itemW * 0.7 && Math.abs(y - p.y) < itemH * 0.7) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          positions.push({ x: x, y: y });
          placed = true;
          break;
        }
      }
      if (!placed) {
        positions.push({ x: rand(4, fieldW - itemW - 4), y: rand(4, fieldH - itemH - 4) });
      }
    }
    return positions;
  }

  // ===== BUILD ROUND DATA =====
  function prepareRound(roundDef) {
    var items = [];

    if (roundDef.type === '国旗') {
      // Flag round
      items.push({ html: makeFlagHTML(roundDef.correct.colors), isCorrect: true });
      var decoys = shuffle(roundDef.decoys);
      for (var i = 0; i < roundDef.count - 1 && i < decoys.length; i++) {
        items.push({ html: makeFlagHTML(decoys[i].colors), isCorrect: false });
      }
    } else if (roundDef.type === '国の形') {
      // Shape round
      items.push({ html: SHAPES[roundDef.correctShape], isCorrect: true });
      var shapeDecoys = shuffle(roundDef.decoyShapes);
      for (var i = 0; i < roundDef.count - 1; i++) {
        items.push({ html: SHAPES[shapeDecoys[i % shapeDecoys.length]], isCorrect: false });
      }
    } else {
      // Text round (文字 / 英語)
      items.push({ text: roundDef.correct, isCorrect: true });
      var textDecoys = shuffle(roundDef.decoys);
      for (var i = 0; i < roundDef.count - 1 && i < textDecoys.length; i++) {
        items.push({ text: textDecoys[i], isCorrect: false });
      }
    }

    return {
      type: roundDef.type,
      question: roundDef.question,
      trivia: roundDef.trivia,
      items: shuffle(items)
    };
  }

  // ===== START =====
  function startGame() {
    var pool = buildRoundPool();
    // Pick 10 rounds, duplicating text/english rounds since there are more of those
    var selected = shuffle(pool).slice(0, TOTAL_ROUNDS);
    // If fewer than TOTAL_ROUNDS unique, repeat some
    while (selected.length < TOTAL_ROUNDS) {
      selected.push(pool[randInt(0, pool.length - 1)]);
    }
    rounds = selected.map(prepareRound);
    currentIndex = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    correctCount = 0;

    scoreDisplay.textContent = '0';
    streakCount.textContent = '0';
    streakFire.className = 'streak-fire';
    streakFire.textContent = '';

    sg.onGameStart();
    showScreen(gameScreen);
    loadRound();
  }

  // ===== LOAD ROUND =====
  function loadRound() {
    answered = false;
    var round = rounds[currentIndex];

    roundNumber.textContent = (currentIndex + 1) + ' / ' + TOTAL_ROUNDS;
    roundType.textContent = round.type;

    questionText.textContent = round.question;

    // Clear field
    fieldArea.innerHTML = '';

    var fieldRect = fieldArea.getBoundingClientRect();
    var fieldW = fieldRect.width;
    var fieldH = fieldRect.height;

    var isFlag = round.type === '国旗';
    var isShape = round.type === '国の形';
    var itemW = isFlag ? 70 : isShape ? 65 : 100;
    var itemH = isFlag ? 50 : isShape ? 65 : 36;

    var positions = placeItems(round.items.length, fieldW, fieldH, itemW, itemH);

    round.items.forEach(function(item, i) {
      var el = document.createElement('button');
      el.className = 'scatter-item';
      el.dataset.correct = item.isCorrect ? '1' : '0';

      if (isFlag) {
        el.innerHTML = item.html;
        el.classList.add('scatter-flag');
      } else if (isShape) {
        el.innerHTML = item.html;
        el.classList.add('scatter-shape');
      } else {
        el.textContent = item.text;
        el.classList.add('scatter-text');
        // Random size variation
        var size = rand(0.7, 1.4);
        el.style.fontSize = size + 'rem';
      }

      // Random rotation
      var rotation = rand(-35, 35);
      el.style.left = positions[i].x + 'px';
      el.style.top = positions[i].y + 'px';
      el.style.transform = 'rotate(' + rotation + 'deg)';
      el.dataset.rotation = rotation;

      // Random opacity variation (decoys slightly varied)
      if (!item.isCorrect) {
        el.style.opacity = rand(0.6, 1.0);
      }

      // Pop-in animation with stagger
      el.style.animation = 'popIn 0.3s ' + (i * 0.02) + 's ease-out both';

      el.addEventListener('click', function() { handleChoice(el); });
      fieldArea.appendChild(el);
    });

    feedbackArea.classList.add('hidden');
    startTimer();
  }

  // ===== TIMER =====
  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_ROUND * 1000;
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    timerBar.classList.remove('urgent');

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        timerBar.style.transition = 'width ' + TIME_PER_ROUND + 's linear';
        timerBar.style.width = '0%';
      });
    });

    timerInterval = setInterval(function() {
      timeLeft -= 100;
      if (timeLeft <= 2500 && !timerBar.classList.contains('urgent')) {
        timerBar.classList.add('urgent');
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!answered) handleTimeout();
      }
    }, 100);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerBar.style.transition = 'none';
    timerBar.style.width = getComputedStyle(timerBar).width;
  }

  // ===== HANDLE CHOICE =====
  function handleChoice(el) {
    if (answered) return;
    answered = true;
    stopTimer();

    var isCorrect = el.dataset.correct === '1';
    var allItems = fieldArea.querySelectorAll('.scatter-item');

    // Dim all, highlight correct
    allItems.forEach(function(item) {
      item.disabled = true;
      if (item.dataset.correct === '1') {
        item.classList.add('found');
        // Straighten and enlarge the correct answer
        item.style.transform = 'rotate(0deg) scale(1.3)';
        item.style.opacity = '1';
        item.style.zIndex = '10';
      } else {
        item.style.opacity = '0.2';
      }
    });

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      el.classList.add('wrong');
      el.style.opacity = '1';
      handleWrongAnswer();
    }

    showFeedback(isCorrect, rounds[currentIndex].trivia);
    setTimeout(nextRound, isCorrect ? 1800 : 2500);
  }

  function handleTimeout() {
    answered = true;
    var allItems = fieldArea.querySelectorAll('.scatter-item');
    allItems.forEach(function(item) {
      item.disabled = true;
      if (item.dataset.correct === '1') {
        item.classList.add('found');
        item.style.transform = 'rotate(0deg) scale(1.3)';
        item.style.opacity = '1';
        item.style.zIndex = '10';
      } else {
        item.style.opacity = '0.2';
      }
    });
    handleWrongAnswer();
    showFeedback(false, '⏱️ 時間切れ！ ' + rounds[currentIndex].trivia);
    setTimeout(nextRound, 2500);
  }

  function handleCorrectAnswer() {
    SurrealGames.SoundSystem.play('correct');
    streak++;
    correctCount++;
    if (streak > maxStreak) maxStreak = streak;

    var multiplier = Math.min(streak, 5);
    var timeBonus = Math.floor((timeLeft / 1000) * 15);
    score += BASE_SCORE * multiplier + timeBonus;

    scoreDisplay.textContent = score;
    streakCount.textContent = streak;

    if (streak >= 2) {
      var fires = ['🔥', '🔥🔥', '🔥🔥🔥', '💥🔥💥'];
      streakFire.textContent = fires[Math.min(streak - 2, fires.length - 1)];
      streakFire.classList.add('on');
    }

    flashOverlay.className = 'flash-overlay flash-correct';
    setTimeout(function() { flashOverlay.className = 'flash-overlay'; }, 400);
  }

  function handleWrongAnswer() {
    SurrealGames.SoundSystem.play('wrong');
    streak = 0;
    streakCount.textContent = '0';
    streakFire.className = 'streak-fire';
    streakFire.textContent = '';

    flashOverlay.className = 'flash-overlay flash-wrong';
    setTimeout(function() { flashOverlay.className = 'flash-overlay'; }, 400);
  }

  function showFeedback(isCorrect, text) {
    feedbackIcon.textContent = isCorrect ? '⭕' : '❌';
    feedbackText.textContent = text;
    feedbackArea.classList.remove('hidden');
  }

  function nextRound() {
    currentIndex++;
    if (currentIndex < TOTAL_ROUNDS) {
      loadRound();
    } else {
      showResults();
    }
  }

  // ===== RESULTS =====
  function showResults() {
    var result = sg.onGameEnd(score, { correct: correctCount, maxStreak: maxStreak });
    var isNewHigh = result.isNewHigh;
    showScreen(resultScreen);

    var rank = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) {
      if (score >= RANKS[i].min) rank = RANKS[i];
    }

    resultIcon.textContent = rank.icon;
    resultRank.textContent = rank.label;

    resultScore.textContent = '0';
    resultCorrect.textContent = correctCount + ' / ' + TOTAL_ROUNDS;
    resultMaxStreak.textContent = maxStreak;
    resultAccuracy.textContent = Math.round((correctCount / TOTAL_ROUNDS) * 100) + '%';

    var displayScore = 0;
    var step = Math.max(1, Math.floor(score / 60));
    var countUp = setInterval(function() {
      displayScore += step;
      if (displayScore >= score) {
        displayScore = score;
        clearInterval(countUp);
      }
      resultScore.textContent = displayScore;
    }, 16);

    // Share button
    var existingShareBtn = document.getElementById('share-btn');
    if (existingShareBtn) existingShareBtn.remove();

    var shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.textContent = '\uD835\uDD4F で結果をシェア';
    shareBtn.className = 'btn-start';
    shareBtn.style.cssText = 'margin-top: 12px; font-size: clamp(0.95rem, 3vw, 1.2rem); background: linear-gradient(135deg, #1da1f2 0%, #0d8ecf 100%);';

    shareBtn.addEventListener('click', function () {
      var gameURL = window.location.href;
      var shareText = '☘️ アイルランドゲーム\n'
        + 'スコア: ' + score + '点\n'
        + '正解: ' + correctCount + '/' + TOTAL_ROUNDS + '問\n'
        + '最大連続正解: ' + maxStreak + '\n'
        + 'ランク: ' + rank.label + '\n\n'
        + '#シュールゲームス\n'
        + gameURL;
      var tweetURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
      window.open(tweetURL, '_blank');
    });

    retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

    // NEW RECORD badge
    var oldRecord = document.querySelector('.sg-new-record');
    if (oldRecord) oldRecord.remove();
    if (isNewHigh) {
      var el = document.createElement('div');
      el.className = 'sg-new-record';
      el.textContent = '🎉 NEW RECORD!';
      resultScore.parentNode.insertBefore(el, resultScore);
    }
  }

  // ===== HIGH SCORE DISPLAY =====
  function updateHighScoreDisplay() {
    var highScore = sg.getHighScore();
    var el = document.getElementById('sg-high-score-display');
    if (highScore && el) {
      el.textContent = '🏆 HIGH SCORE: ' + highScore;
      el.style.display = 'block';
    }
  }
  updateHighScoreDisplay();

  // ===== EVENTS =====
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (titleScreen.classList.contains('active')) {
        e.preventDefault();
        startGame();
      }
    }
  });

})();
