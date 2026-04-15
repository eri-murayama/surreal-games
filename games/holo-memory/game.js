/**
 * ホロメンおぼえてますか？
 * 鼻毛だらけの神経衰弱
 * シュールゲームス - Holographic Edition
 */

(function () {
  'use strict';

  const sg = SurrealGames.init('holo-memory');

  // ==============================
  // Character definitions
  // ==============================
  const CHARACTERS = [
    {
      id: 0,
      name: 'ソラちゃん',
      type: 'char-type-0',
      accessories: '', // just blue hair, no extras
    },
    {
      id: 1,
      name: 'フブちゃん',
      type: 'char-type-1',
      accessories: 'fox-ears',
    },
    {
      id: 2,
      name: 'ぺこちゃん',
      type: 'char-type-2',
      accessories: 'bunny-ears',
    },
    {
      id: 3,
      name: 'マリちゃん',
      type: 'char-type-3',
      accessories: 'pirate-hat',
    },
    {
      id: 4,
      name: 'スイちゃん',
      type: 'char-type-4',
      accessories: 'star-clip',
    },
    {
      id: 5,
      name: 'あくちゃん',
      type: 'char-type-5',
      accessories: 'horns',
    },
    {
      id: 6,
      name: 'ころちゃん',
      type: 'char-type-6',
      accessories: 'dog-ears',
    },
    {
      id: 7,
      name: 'みこちゃん',
      type: 'char-type-7',
      accessories: 'miko',
    },
  ];

  // Messages with cute emojis
  const WRONG_MESSAGES = [
    'ちがうよ〜 😅',
    '鼻毛で見分けてね！ 👃',
    '鼻毛が邪魔だったかな？ 💦',
    'もうちょっと鼻毛をよく見て！ 🔍',
    'おしい！…鼻毛的に 💫',
    '鼻毛に惑わされないで！ ✨',
    'ぜんぶ鼻毛に見えてきた？ 😵‍💫',
    'ドンマイ！鼻毛は難しいよね 🌀',
    'がんばれ〜！ 💪',
    '次こそいけるよ！ 🌟',
  ];

  const CORRECT_MESSAGES = [
    'やったね！ 🎉',
    'さすが！ ⭐',
    '鼻毛マスター！ 👑',
    'すごい！見分けられた！ ✨',
    'ナイス鼻毛！ 💫',
    '完璧！鼻毛を超えた！ 🌈',
    'お見事！ 🎊',
    '鼻毛の違いがわかるなんて！ 💖',
    'キラキラ〜！ ✦',
    'すばらしい〜！ 🌟',
  ];

  // ==============================
  // Game state
  // ==============================
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let turns = 0;
  let timerInterval = null;
  let startTime = 0;
  let isLocked = false; // prevent clicking during animation

  // DOM elements
  const titleScreen = document.getElementById('title-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');
  const cardGrid = document.getElementById('card-grid');
  const startBtn = document.getElementById('start-btn');
  const replayBtn = document.getElementById('replay-btn');
  const turnCountEl = document.getElementById('turn-count');
  const timerEl = document.getElementById('timer');
  const pairsFoundEl = document.getElementById('pairs-found');
  const messageBubble = document.getElementById('message-bubble');
  const messageText = document.getElementById('message-text');
  const resultTurns = document.getElementById('result-turns');
  const resultTime = document.getElementById('result-time');
  const resultRating = document.getElementById('result-rating');
  const rainbowFlash = document.getElementById('rainbow-flash');

  // ==============================
  // Utility functions
  // ==============================

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function showScreen(screen) {
    titleScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // ==============================
  // Sparkle / Particle Effects
  // ==============================

  const SPARKLE_CHARS = ['✦', '★', '✧', '⭐', '💫'];
  const HEART_CHARS = ['♥', '💖', '💕', '❤'];

  function spawnSparkle(x, y, char, className) {
    var el = document.createElement('span');
    el.className = 'sparkle-particle' + (className ? ' ' + className : '');
    el.textContent = char || randomFrom(SPARKLE_CHARS);
    el.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
    el.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
    el.style.fontSize = (0.7 + Math.random() * 0.8) + 'rem';
    document.body.appendChild(el);
    el.addEventListener('animationend', function () {
      el.remove();
    });
  }

  function spawnSparklesAtCard(cardEl, count) {
    var rect = cardEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var i = 0; i < count; i++) {
      setTimeout(function () {
        spawnSparkle(cx, cy);
      }, i * 60);
    }
  }

  function spawnHeartsAtCard(cardEl, count) {
    var rect = cardEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 3;
    for (var i = 0; i < count; i++) {
      setTimeout(function () {
        spawnSparkle(cx, cy, randomFrom(HEART_CHARS), 'heart');
      }, i * 80);
    }
  }

  function triggerRainbowFlash() {
    rainbowFlash.classList.remove('active');
    // Force reflow
    void rainbowFlash.offsetWidth;
    rainbowFlash.classList.add('active');
    setTimeout(function () {
      rainbowFlash.classList.remove('active');
    }, 600);
  }

  function spawnCelebrationStars() {
    var symbols = ['⭐', '✦', '💫', '✧', '♥', '🌟', '💖', '⭐', '✦', '💫',
                   '✧', '♥', '🌟', '💖', '⭐', '✦', '💫', '✧', '♥', '🌟'];
    for (var i = 0; i < symbols.length; i++) {
      (function (idx) {
        setTimeout(function () {
          var el = document.createElement('span');
          el.className = 'celebration-star';
          el.textContent = symbols[idx];
          el.style.left = (Math.random() * 100) + 'vw';
          el.style.top = '-30px';
          el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
          document.body.appendChild(el);
          el.addEventListener('animationend', function () {
            el.remove();
          });
        }, idx * 120);
      })(i);
    }
  }

  // ==============================
  // Card HTML generation
  // ==============================

  function createCardBackHTML() {
    const symbols = [];
    for (let i = 0; i < 12; i++) {
      symbols.push(i % 2 === 0 ? 'S' : '〰');
    }
    return '<div class="card-back-pattern">' + symbols.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>';
  }

  function createAccessoryHTML(char) {
    switch (char.accessories) {
      case 'fox-ears':
        return '\
          <div class="fox-ear left"></div>\
          <div class="fox-ear right"></div>\
          <div class="fox-ear-inner left"></div>\
          <div class="fox-ear-inner right"></div>';
      case 'bunny-ears':
        return '\
          <div class="bunny-ear left"></div>\
          <div class="bunny-ear right"></div>\
          <div class="bunny-ear-inner left"></div>\
          <div class="bunny-ear-inner right"></div>';
      case 'pirate-hat':
        return '\
          <div class="pirate-hat"></div>\
          <div class="pirate-hat-brim"></div>';
      case 'star-clip':
        return '<div class="star-clip">\u2605</div>';
      case 'horns':
        return '\
          <div class="horn left"></div>\
          <div class="horn right"></div>';
      case 'dog-ears':
        return '\
          <div class="dog-ear left"></div>\
          <div class="dog-ear right"></div>';
      case 'miko':
        return '\
          <div class="miko-headpiece"></div>\
          <div class="miko-ribbon left"></div>\
          <div class="miko-ribbon right"></div>';
      default:
        return '';
    }
  }

  function createCharFaceHTML(char) {
    return '\
      <div class="char-face-container">\
        <div class="char-face ' + char.type + '">\
          <div class="char-skin"></div>\
          <div class="char-hair"></div>\
          ' + createAccessoryHTML(char) + '\
          <div class="char-eye left"></div>\
          <div class="char-eye right"></div>\
          <div class="char-nose"></div>\
          <div class="char-nose-hair left"></div>\
          <div class="char-nose-hair right"></div>\
          <div class="char-nose-hair-extra left"></div>\
          <div class="char-nose-hair-extra right"></div>\
          <div class="char-blush left"></div>\
          <div class="char-blush right"></div>\
          <div class="char-mouth"></div>\
        </div>\
      </div>\
      <div class="char-name">' + char.name + '</div>';
  }

  function createCardElement(char, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.charId = char.id;
    card.dataset.index = index;

    card.innerHTML = '\
      <div class="card-face card-back">\
        ' + createCardBackHTML() + '\
      </div>\
      <div class="card-face card-front">\
        ' + createCharFaceHTML(char) + '\
      </div>';

    card.addEventListener('click', function () {
      onCardClick(card);
    });

    return card;
  }

  // ==============================
  // Message bubble
  // ==============================

  let messageTimeout = null;

  function showMessage(text) {
    if (messageTimeout) clearTimeout(messageTimeout);
    messageText.textContent = text;
    messageBubble.classList.remove('hidden');
    messageBubble.classList.add('visible');

    messageTimeout = setTimeout(function () {
      messageBubble.classList.remove('visible');
      messageBubble.classList.add('hidden');
    }, 2000);
  }

  // ==============================
  // Game logic
  // ==============================

  function initGame() {
    sg.onGameStart();
    // Create pairs
    const charPairs = [];
    CHARACTERS.forEach(function (char) {
      charPairs.push(Object.assign({}, char));
      charPairs.push(Object.assign({}, char));
    });

    cards = shuffleArray(charPairs);
    flippedCards = [];
    matchedPairs = 0;
    turns = 0;
    isLocked = false;

    turnCountEl.textContent = '0';
    pairsFoundEl.textContent = '0';
    timerEl.textContent = '0:00';

    if (timerInterval) clearInterval(timerInterval);

    // Clear and build grid
    cardGrid.innerHTML = '';
    cards.forEach(function (char, i) {
      cardGrid.appendChild(createCardElement(char, i));
    });

    // Start timer
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    messageBubble.classList.remove('visible');
    messageBubble.classList.add('hidden');
  }

  function updateTimer() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }

  function onCardClick(cardEl) {
    // Guard conditions
    if (isLocked) return;
    if (cardEl.classList.contains('flipped')) return;
    if (cardEl.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    // Flip card
    SurrealGames.SoundSystem.play('tap');
    cardEl.classList.add('flipped');
    flippedCards.push(cardEl);

    if (flippedCards.length === 2) {
      turns++;
      turnCountEl.textContent = turns;
      checkMatch();
    }
  }

  function checkMatch() {
    var card1 = flippedCards[0];
    var card2 = flippedCards[1];
    var id1 = card1.dataset.charId;
    var id2 = card2.dataset.charId;

    if (id1 === id2) {
      // Match!
      SurrealGames.SoundSystem.play('correct');
      isLocked = true;
      setTimeout(function () {
        card1.classList.add('matched', 'match-bounce');
        card2.classList.add('matched', 'match-bounce');
        matchedPairs++;
        pairsFoundEl.textContent = matchedPairs;
        showMessage(randomFrom(CORRECT_MESSAGES));

        // Visual effects for correct match
        spawnSparklesAtCard(card1, 5);
        spawnSparklesAtCard(card2, 5);
        spawnHeartsAtCard(card1, 3);
        spawnHeartsAtCard(card2, 3);
        triggerRainbowFlash();

        flippedCards = [];
        isLocked = false;

        if (matchedPairs === CHARACTERS.length) {
          setTimeout(endGame, 800);
        }
      }, 300);
    } else {
      // No match
      SurrealGames.SoundSystem.play('wrong');
      isLocked = true;
      showMessage(randomFrom(WRONG_MESSAGES));
      card1.classList.add('wrong-shake');
      card2.classList.add('wrong-shake');

      setTimeout(function () {
        card1.classList.remove('flipped', 'wrong-shake');
        card2.classList.remove('flipped', 'wrong-shake');
        flippedCards = [];
        isLocked = false;
      }, 900);
    }
  }

  function endGame() {
    clearInterval(timerInterval);
    var elapsed = Math.floor((Date.now() - startTime) / 1000);

    // スコア: ターン数が少ないほど高得点（最大1000点、ターン8が理論最小）
    var gameScore = Math.max(0, 1000 - (turns - 8) * 50);
    var { isNewHigh } = sg.onGameEnd(gameScore, { turns: turns, time: elapsed });

    resultTurns.textContent = turns;
    resultTime.textContent = formatTime(elapsed);

    var rating;
    if (turns < 12) {
      rating = '神の記憶力！鼻毛マスター！ 👑✨';
    } else if (turns <= 16) {
      rating = 'なかなかやるね！ ⭐🌟';
    } else if (turns <= 24) {
      rating = '鼻毛に惑わされたね... 💫';
    } else {
      rating = '鼻毛の呪いにかかった... 🌀';
    }
    resultRating.textContent = rating;

    // Share button
    var shareBtn = document.getElementById('share-btn');
    if (!shareBtn) {
      shareBtn = document.createElement('button');
      shareBtn.id = 'share-btn';
      shareBtn.className = 'btn-start';
      shareBtn.style.cssText = 'background:linear-gradient(135deg,#1da1f2,#0d8bd9);margin-bottom:12px;display:inline-block;';
      shareBtn.textContent = '𝕏 でシェア';
      var replayBtnEl = document.getElementById('replay-btn');
      replayBtnEl.parentNode.insertBefore(shareBtn, replayBtnEl);
    }
    shareBtn.onclick = function () {
      var text = '🃏 ホロメンおぼえてますか？\nターン数: ' + turns + '\nタイム: ' + formatTime(elapsed) + '\n評価: ' + rating + '\n\n#シュールゲームス\n' + window.location.href;
      var url = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    };

    // NEW RECORDバッジ
    var oldRecord = document.querySelector('.sg-new-record');
    if (oldRecord) oldRecord.remove();
    if (isNewHigh) {
      var newRecordEl = document.createElement('div');
      newRecordEl.className = 'sg-new-record';
      newRecordEl.textContent = '\uD83C\uDF89 NEW RECORD!';
      var resultTitle = document.querySelector('.result-title');
      resultTitle.parentNode.insertBefore(newRecordEl, resultTitle);
    }

    // Big celebration star shower
    spawnCelebrationStars();
    triggerRainbowFlash();

    showScreen(resultScreen);
  }

  // ==============================
  // Event listeners
  // ==============================

  startBtn.addEventListener('click', function () {
    showScreen(gameScreen);
    initGame();
  });

  replayBtn.addEventListener('click', function () {
    showScreen(gameScreen);
    initGame();
  });

  // ハイスコア表示
  (function updateHighScoreDisplay() {
    var highScore = sg.getHighScore();
    var el = document.getElementById('sg-high-score-display');
    if (highScore && el) {
      el.textContent = '\uD83C\uDFC6 HIGH SCORE: ' + highScore;
      el.style.display = 'block';
    }
  })();

})();
