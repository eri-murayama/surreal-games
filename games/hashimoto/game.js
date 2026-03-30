/**
 * 橋本さん 〜苗字ランキングバトル〜
 */
(function () {
  'use strict';

  var SURNAMES = [
    { rank: 1, name: '佐藤', pop: 1870000 },
    { rank: 2, name: '鈴木', pop: 1800000 },
    { rank: 3, name: '高橋', pop: 1420000 },
    { rank: 4, name: '田中', pop: 1340000 },
    { rank: 5, name: '伊藤', pop: 1080000 },
    { rank: 6, name: '渡辺', pop: 1070000 },
    { rank: 7, name: '山本', pop: 1050000 },
    { rank: 8, name: '中村', pop: 1050000 },
    { rank: 9, name: '小林', pop: 1030000 },
    { rank: 10, name: '加藤', pop: 890000 },
    { rank: 11, name: '吉田', pop: 830000 },
    { rank: 12, name: '山田', pop: 820000 },
    { rank: 13, name: '佐々木', pop: 680000 },
    { rank: 14, name: '山口', pop: 640000 },
    { rank: 15, name: '松本', pop: 630000 },
    { rank: 16, name: '井上', pop: 610000 },
    { rank: 17, name: '木村', pop: 580000 },
    { rank: 18, name: '林', pop: 550000 },
    { rank: 19, name: '斎藤', pop: 540000 },
    { rank: 20, name: '清水', pop: 530000 },
    { rank: 21, name: '山崎', pop: 480000 },
    { rank: 22, name: '森', pop: 470000 },
    { rank: 23, name: '池田', pop: 440000 },
    { rank: 25, name: '阿部', pop: 430000 },
    { rank: 26, name: '石川', pop: 420000 },
    { rank: 27, name: '山下', pop: 410000 },
    { rank: 28, name: '中島', pop: 400000 },
    { rank: 29, name: '石井', pop: 390000 },
    { rank: 30, name: '小川', pop: 380000 },
    { rank: 31, name: '前田', pop: 370000 },
    { rank: 32, name: '岡田', pop: 370000 },
    { rank: 33, name: '長谷川', pop: 360000 },
    { rank: 34, name: '藤田', pop: 350000 },
    { rank: 35, name: '後藤', pop: 340000 },
    { rank: 36, name: '近藤', pop: 330000 },
    { rank: 37, name: '村上', pop: 330000 },
    { rank: 38, name: '遠藤', pop: 320000 },
    { rank: 39, name: '青木', pop: 310000 },
    { rank: 40, name: '坂本', pop: 300000 },
    { rank: 42, name: '福田', pop: 290000 },
    { rank: 43, name: '太田', pop: 290000 },
    { rank: 44, name: '西村', pop: 280000 },
    { rank: 45, name: '藤井', pop: 280000 },
    { rank: 46, name: '金子', pop: 270000 },
    { rank: 47, name: '藤原', pop: 270000 },
    { rank: 48, name: '三浦', pop: 270000 },
    { rank: 49, name: '岡本', pop: 260000 },
    { rank: 50, name: '中野', pop: 260000 },
    { rank: 51, name: '松田', pop: 260000 },
    { rank: 52, name: '原田', pop: 250000 },
    { rank: 53, name: '中川', pop: 250000 },
    { rank: 54, name: '小野', pop: 250000 },
    { rank: 55, name: '田村', pop: 240000 },
    { rank: 56, name: '竹内', pop: 240000 },
    { rank: 57, name: '中山', pop: 230000 },
    { rank: 58, name: '和田', pop: 230000 },
    { rank: 59, name: '石田', pop: 230000 },
    { rank: 60, name: '上田', pop: 220000 },
    { rank: 61, name: '森田', pop: 220000 },
    { rank: 62, name: '原', pop: 210000 },
    { rank: 63, name: '柴田', pop: 210000 },
    { rank: 64, name: '酒井', pop: 210000 },
    { rank: 65, name: '工藤', pop: 200000 },
    { rank: 66, name: '横山', pop: 200000 },
    { rank: 67, name: '宮崎', pop: 190000 },
    { rank: 68, name: '宮本', pop: 190000 },
    { rank: 69, name: '内田', pop: 190000 },
    { rank: 70, name: '高木', pop: 190000 },
    { rank: 71, name: '安藤', pop: 180000 },
    { rank: 72, name: '島田', pop: 180000 },
    { rank: 73, name: '谷口', pop: 180000 },
    { rank: 74, name: '大野', pop: 180000 },
    { rank: 75, name: '高田', pop: 170000 },
    { rank: 76, name: '丸山', pop: 170000 },
    { rank: 77, name: '藤本', pop: 170000 },
    { rank: 78, name: '今井', pop: 170000 },
    { rank: 79, name: '河野', pop: 160000 },
    { rank: 80, name: '久保', pop: 160000 },
    { rank: 81, name: '杉山', pop: 160000 },
    { rank: 82, name: '市川', pop: 160000 },
    { rank: 83, name: '上野', pop: 160000 },
    { rank: 84, name: '福島', pop: 150000 },
    { rank: 85, name: '松井', pop: 150000 },
    { rank: 86, name: '木下', pop: 150000 },
    { rank: 87, name: '野口', pop: 150000 },
    { rank: 88, name: '松尾', pop: 150000 },
    { rank: 89, name: '菊地', pop: 140000 },
    { rank: 90, name: '野村', pop: 140000 },
    { rank: 91, name: '新井', pop: 140000 },
    { rank: 92, name: '渡部', pop: 140000 },
    { rank: 93, name: '佐野', pop: 140000 },
    { rank: 94, name: '小島', pop: 140000 },
    { rank: 95, name: '大塚', pop: 130000 },
    { rank: 96, name: '千葉', pop: 130000 },
    { rank: 97, name: '菅原', pop: 130000 },
    { rank: 98, name: '岩崎', pop: 130000 },
    { rank: 99, name: '河村', pop: 120000 },
    { rank: 100, name: '久保田', pop: 120000 }
  ];

  // 行部澤モード用の珍しい苗字
  var RARE_SURNAMES = [
    // 30人より少ない（行部澤より希少）
    { rank: '圏外', name: '勘解由小路', pop: 10 },
    { rank: '圏外', name: '月見里', pop: 5 },
    { rank: '圏外', name: '四月一日', pop: 20 },
    { rank: '圏外', name: '躑躅森', pop: 15 },
    { rank: '圏外', name: '鰻', pop: 20 },
    { rank: '圏外', name: '一', pop: 8 },
    { rank: '圏外', name: '七五三', pop: 25 },
    { rank: '圏外', name: '十二月田', pop: 28 },
    { rank: '圏外', name: '凸守', pop: 10 },
    { rank: '圏外', name: '栗花落', pop: 15 },
    { rank: '圏外', name: '九', pop: 3 },
    { rank: '圏外', name: '雲母', pop: 12 },
    { rank: '圏外', name: '素麺', pop: 7 },
    // 30人より多い（行部澤より多い）
    { rank: '圏外', name: '小鳥遊', pop: 50 },
    { rank: '圏外', name: '百目鬼', pop: 300 },
    { rank: '圏外', name: '御手洗', pop: 5000 },
    { rank: '圏外', name: '薬袋', pop: 200 },
    { rank: '圏外', name: '五百蔵', pop: 150 },
    { rank: '圏外', name: '猫屋敷', pop: 40 },
    { rank: '圏外', name: '纐纈', pop: 80 },
    { rank: '圏外', name: '八月一日', pop: 35 },
    { rank: '圏外', name: '目', pop: 60 },
    { rank: '圏外', name: '鋳物師', pop: 45 },
    { rank: '圏外', name: '不死川', pop: 70 },
    { rank: '圏外', name: '毒島', pop: 500 },
    { rank: '圏外', name: '回り道', pop: 35 },
    { rank: '圏外', name: '一尺八寸', pop: 40 }
  ];

  var HASHIMOTO_POP = 440000;
  var GYOBUZAWA_POP = 30;
  var FACE_EMOJIS = ['👨', '👩', '👴', '👵', '🧑', '🧔', '👷', '💂'];

  var score = 0;
  var streak = 0;
  var maxStreak = 0;
  var usedPairs = [];
  var currentPair = null;
  var isProcessing = false;
  var history = [];
  var gameMode = 'hashimoto'; // 'hashimoto' or 'gyobuzawa'

  function $_(id) { return document.getElementById(id); }
  var titleScreen = $_('title-screen');
  var gameScreen = $_('game-screen');
  var gameoverScreen = $_('gameover-screen');
  var startBtn = $_('start-btn');
  var retryBtn = $_('retry-btn');
  var choiceLeft = $_('choice-left');
  var choiceRight = $_('choice-right');
  var nameLeft = $_('name-left');
  var nameRight = $_('name-right');
  var scoreDisplay = $_('score-display');
  var streakDisplay = $_('streak-display');
  var resultOverlay = $_('result-overlay');
  var resultIcon = $_('result-icon');
  var resultMessage = $_('result-message');
  var resultDetail = $_('result-detail');
  var revealScreen = $_('reveal-screen');
  var oyaBtn = $_('oya-btn');
  var revealStartBtn = $_('reveal-start-btn');
  var playerBadge = document.querySelector('.player-badge');
  var questionText = document.querySelector('.question-text');
  var historyPlayer = document.querySelector('.history-player');

  function showScreen(screen) {
    [titleScreen, gameScreen, gameoverScreen, revealScreen].forEach(function(s) { s.classList.remove('active'); });
    screen.classList.add('active');
  }

  function formatPop(n) {
    if (n >= 10000) return '約' + Math.round(n / 10000) + '万人';
    return '約' + n.toLocaleString() + '人';
  }

  function randomFace() {
    return FACE_EMOJIS[Math.floor(Math.random() * FACE_EMOJIS.length)];
  }

  function getPlayerPop() {
    return gameMode === 'gyobuzawa' ? GYOBUZAWA_POP : HASHIMOTO_POP;
  }

  function getPool() {
    if (gameMode === 'gyobuzawa') {
      return RARE_SURNAMES;
    }
    return SURNAMES;
  }

  function generatePair() {
    var pop = getPlayerPop();
    var pool = getPool();
    var moreList = pool.filter(function(s) { return s.pop > pop; });
    var lessList = pool.filter(function(s) { return s.pop < pop; });

    for (var i = 0; i < 50; i++) {
      var more = moreList[Math.floor(Math.random() * moreList.length)];
      var less = lessList[Math.floor(Math.random() * lessList.length)];
      var key = more.name + '-' + less.name;
      if (usedPairs.indexOf(key) === -1) {
        usedPairs.push(key);
        if (Math.random() < 0.5) {
          return { left: more, right: less, answer: 'right' };
        } else {
          return { left: less, right: more, answer: 'left' };
        }
      }
    }
    usedPairs = [];
    return generatePair();
  }

  function showQuestion() {
    currentPair = generatePair();
    isProcessing = false;

    choiceLeft.className = 'choice-card';
    choiceRight.className = 'choice-card';
    choiceLeft.disabled = false;
    choiceRight.disabled = false;

    var oldPops = document.querySelectorAll('.choice-pop');
    oldPops.forEach(function(el) { el.remove(); });

    choiceLeft.querySelector('.choice-emoji').textContent = randomFace();
    choiceRight.querySelector('.choice-emoji').textContent = randomFace();

    nameLeft.textContent = currentPair.left.name + 'さん';
    nameRight.textContent = currentPair.right.name + 'さん';

    resultOverlay.classList.add('hidden');
  }

  function handleChoice(side) {
    if (isProcessing) return;
    isProcessing = true;

    choiceLeft.disabled = true;
    choiceRight.disabled = true;

    var correct = (side === currentPair.answer);
    var chosenCard = (side === 'left') ? choiceLeft : choiceRight;
    var otherCard = (side === 'left') ? choiceRight : choiceLeft;

    function addPopLabel(card, data, isLess) {
      var pop = document.createElement('div');
      pop.className = 'choice-pop';
      pop.textContent = formatPop(data.pop);
      card.appendChild(pop);
      setTimeout(function() {
        pop.classList.add('show');
        pop.classList.add(isLess ? 'fewer' : 'more');
      }, 100);
    }

    var pop = getPlayerPop();
    var leftIsLess = currentPair.left.pop < pop;
    var rightIsLess = currentPair.right.pop < pop;
    addPopLabel(choiceLeft, currentPair.left, leftIsLess);
    addPopLabel(choiceRight, currentPair.right, rightIsLess);

    if (correct) {
      chosenCard.classList.add('correct');
      otherCard.classList.add('reveal');
      history.push({ left: currentPair.left, right: currentPair.right, correct: true });
      score++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      scoreDisplay.textContent = score;
      streakDisplay.textContent = streak;

      if (window.SurrealGames) {
        SurrealGames.SoundSystem.play('correct');
      }

      setTimeout(function() {
        showQuestion();
      }, 1500);
    } else {
      chosenCard.classList.add('wrong');
      otherCard.classList.add('correct');

      if (window.SurrealGames) {
        SurrealGames.SoundSystem.play('wrong');
      }

      history.push({ left: currentPair.left, right: currentPair.right, correct: false });
      var correctSurname = (currentPair.answer === 'left') ? currentPair.left : currentPair.right;
      var wrongSurname = (side === 'left') ? currentPair.left : currentPair.right;

      resultOverlay.classList.remove('hidden');
      resultIcon.textContent = '😱';
      resultMessage.textContent = 'ハズレ！';
      var playerLabel = gameMode === 'gyobuzawa' ? '行部澤さんは約30人でした' : '橋本さんは約44万人でした';
      resultDetail.innerHTML =
        correctSurname.name + 'さんは' + formatPop(correctSurname.pop) + '<br>' +
        wrongSurname.name + 'さんは' + formatPop(wrongSurname.pop) + '<br>' +
        playerLabel;

      setTimeout(function() {
        gameOver();
      }, 2500);
    }
  }

  function gameOver() {
    showScreen(gameoverScreen);
    $_('final-score').textContent = score;
    $_('max-streak').textContent = maxStreak;

    var comment = '';
    if (gameMode === 'gyobuzawa') {
      if (score === 0) comment = '行部澤の壁は高かった…';
      else if (score < 3) comment = 'なかなかやるな…だが行部澤には遠い';
      else if (score < 5) comment = '行部澤も認めざるを得ない…！';
      else comment = '行部澤を超えた…！苗字界の覇者だ！！';
    } else {
      if (score === 0) comment = '橋本さん…まだまだだね';
      else if (score < 5) comment = '橋本さん、ちょっと苗字に詳しくなったね';
      else if (score < 10) comment = '橋本さん、なかなかやるじゃん！';
      else if (score < 20) comment = '橋本さん、苗字マスターの素質あり！';
      else comment = '橋本さん、あなたは苗字の神だ！！';
    }
    $_('final-detail').textContent = comment;

    // 履歴リスト生成
    var pop = getPlayerPop();
    var historyList = $_('history-list');
    historyList.innerHTML = '';
    if (gameMode === 'gyobuzawa') {
      historyPlayer.textContent = '🌀 行部澤さん … 圏外（約30人）';
    } else {
      historyPlayer.textContent = '👤 橋本さん … 第24位（約44万人）';
    }
    var seen = {};
    history.forEach(function(h) {
      [h.left, h.right].forEach(function(s) {
        if (!seen[s.name]) {
          seen[s.name] = true;
          var row = document.createElement('div');
          row.className = 'history-row';
          var isLess = s.pop < pop;
          var rankLabel = (typeof s.rank === 'number') ? s.rank + '位' : s.rank;
          row.innerHTML = '<span class="history-rank">' + rankLabel + '</span>' +
            '<span class="history-name">' + s.name + 'さん</span>' +
            '<span class="history-pop ' + (isLess ? 'fewer' : 'more') + '">' + formatPop(s.pop) + '</span>';
          historyList.appendChild(row);
        }
      });
    });

    // おや…？ボタンは橋本モードのみ表示
    oyaBtn.style.display = (gameMode === 'hashimoto') ? 'inline-block' : 'none';

    if (sg) sg.onGameEnd(score);
  }

  function updateUI() {
    if (gameMode === 'gyobuzawa') {
      document.body.classList.add('mode-gyobuzawa');
      playerBadge.textContent = 'あなた：行部澤さん（約30人）';
      questionText.innerHTML = 'どっちが行部澤さんより<br><strong>人口が少ない</strong>？';
    } else {
      document.body.classList.remove('mode-gyobuzawa');
      playerBadge.textContent = 'あなた：橋本さん（約44万人）';
      questionText.innerHTML = 'どっちが橋本さんより<br><strong>人口が少ない</strong>？';
    }
  }

  function startGame() {
    score = 0;
    streak = 0;
    maxStreak = 0;
    usedPairs = [];
    history = [];
    scoreDisplay.textContent = '0';
    streakDisplay.textContent = '0';
    updateUI();
    showScreen(gameScreen);
    showQuestion();
    if (sg) sg.onGameStart();
  }

  // ===== 行部澤 登場演出 =====
  function showReveal() {
    showScreen(revealScreen);
    var textEl = $_('reveal-text');
    textEl.innerHTML = '';
    revealStartBtn.style.display = 'none';

    var lines = [
      'ちょっと待ってくれ。',
      '',
      '<span class="reveal-name">行部澤</span>',
      '<span class="reveal-reading">（ぎょうぶざわ）</span>',
      '',
      '俺の名前は行部澤。',
      '<span class="reveal-pop">全国に約30人。</span>',
      '',
      '俺よりもっと少ない苗字を',
      '探せるかな？'
    ];

    var i = 0;
    function typeLine() {
      if (i < lines.length) {
        if (lines[i] === '') {
          textEl.innerHTML += '<br>';
        } else {
          textEl.innerHTML += lines[i] + '<br>';
        }
        i++;
        var delay = (lines[i - 1].indexOf('reveal-name') !== -1) ? 800 : 400;
        setTimeout(typeLine, delay);
      } else {
        revealStartBtn.style.display = 'inline-block';
      }
    }
    setTimeout(typeLine, 600);
  }

  startBtn.addEventListener('click', function() {
    gameMode = 'hashimoto';
    startGame();
  });
  retryBtn.addEventListener('click', startGame);
  choiceLeft.addEventListener('click', function() { handleChoice('left'); });
  choiceRight.addEventListener('click', function() { handleChoice('right'); });
  oyaBtn.addEventListener('click', showReveal);
  revealStartBtn.addEventListener('click', function() {
    gameMode = 'gyobuzawa';
    startGame();
  });

  var sg = null;
  if (window.SurrealGames) {
    sg = SurrealGames.init('hashimoto');

    var hs = SurrealGames.HighScore.get('hashimoto');
    if (hs > 0) {
      var hsEl = $_('sg-high-score-display');
      hsEl.textContent = '🏆 ハイスコア: ' + hs + '問';
      hsEl.style.display = 'block';
    }
  }
})();
