/* ===== Elite English Game ===== */
(function () {
  'use strict';

  // ---------- Question Data ----------
  // Each question: jp phrase, correct English, and 2 elite (funny wrong) answers
  // eliteRank: 0 = best elite (3 stars), 1 = okay elite (2 stars), 2 = correct/boring (1 star)
  const QUESTIONS = [
    {
      jp: 'おはよう',
      correct: 'Good morning',
      elite: ['Oh, Hi, Yo!', 'Oha! You!'],
      reactions: {
        best: 'Oh Hi Yo! って誰に挨拶してるの!?',
        good: 'Oha You も悪くない…けどもっとエリートになれる！',
        boring: '正しいけど…エリートじゃない！'
      }
    },
    {
      jp: 'ありがとう',
      correct: 'Thank you',
      elite: ['Alligator!', 'Are you got oh?'],
      reactions: {
        best: 'ワニに感謝！アリゲーターありがとう！',
        good: '「Are you got oh?」…哲学的すぎる！',
        boring: 'つまらない正解だね…エリートは正しさを超える！'
      }
    },
    {
      jp: 'すみません',
      correct: 'Excuse me',
      elite: ['Sumi ma sen!', 'I am corner fish!'],
      reactions: {
        best: '隅の魚！？ corner fish は天才的発想！',
        good: 'そのまんまやないかーい！でもエリートっぽい！',
        boring: '正解だけど…面白くない！エリートは笑いを取る！'
      }
    },
    {
      jp: 'がんばれ',
      correct: 'Do your best',
      elite: ['Gun barrel!', 'Gambare! Like a boss!'],
      reactions: {
        best: '銃身で応援！Gun barrel パワー全開！',
        good: 'ボスみたいにガンバレ！かっこいいけど英語じゃない！',
        boring: 'えー正しい英語なんて…もっとエリートに！'
      }
    },
    {
      jp: 'いただきます',
      correct: "Let's eat",
      elite: ['I took a duck, must!', 'Eat a ducky mouse!'],
      reactions: {
        best: 'アヒルを食べるネズミ！？エリートの極み！',
        good: 'アヒルを取った、必ず！意味不明で最高！',
        boring: '正解はつまらない！エリートはアヒルを食べる！'
      }
    },
    {
      jp: 'お疲れ様',
      correct: 'Good work today',
      elite: ['Oh! Curry summer!', 'Auto care, some!'],
      reactions: {
        best: 'カレーの夏！Oh Curry Summer は伝説級！',
        good: '自動車ケア！？何のお疲れ様なの！',
        boring: '正しい…けどカレーの夏の方が面白いでしょ！'
      }
    },
    {
      jp: 'おやすみ',
      correct: 'Good night',
      elite: ['Oh yeah, sue me!', 'Oya! Sumi!'],
      reactions: {
        best: '訴えてこい！Oh yeah sue me の攻撃力よ！',
        good: 'おや！すみ！…何が角なの！？',
        boring: '正解はエリートの敵！もっとクレイジーに！'
      }
    },
    {
      jp: 'なるほど',
      correct: 'I see',
      elite: ['Naruto! doh!', 'Naru hoe dough!'],
      reactions: {
        best: 'ナルトどー！忍者が来ちゃった！',
        good: '鍬のパン生地！？意味がカオス！',
        boring: '「I see」って…もっとエリートな目で見て！'
      }
    },
    {
      jp: 'もしもし',
      correct: 'Hello (on phone)',
      elite: ['Moshi Moshi! Spaghetti!', 'More she more she!'],
      reactions: {
        best: 'もしもしスパゲッティ！電話でパスタ注文！？',
        good: 'もっと彼女もっと彼女！何を求めてるの！',
        boring: '普通のHelloなんて…エリートは電話でパスタを頼む！'
      }
    },
    {
      jp: 'ごちそうさま',
      correct: 'Thanks for the meal',
      elite: ['Got cheese? Oh, summer!', 'Go! Cheese! Oh! Sama!'],
      reactions: {
        best: 'チーズある？夏だね！ごちそうさまの新解釈！',
        good: 'チーズに敬称つけるの最高！チーズ様！',
        boring: '丁寧だけど…エリートはチーズに夏を感じる！'
      }
    }
  ];

  const TIMER_SECONDS = 10;
  const STAR_FULL = '\u2B50';
  const STAR_EMPTY = '\u2606';

  // ---------- State ----------
  let currentQuestion = 0;
  let score = 0;
  let totalStars = 0;
  let timer = null;
  let timeLeft = 0;
  let shuffledQuestions = [];
  let currentChoices = [];

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const screens = {
    title: $('#title-screen'),
    quiz: $('#quiz-screen'),
    reaction: $('#reaction-screen'),
    result: $('#result-screen')
  };

  // ---------- Screen Management ----------
  function showScreen(name) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
    // Re-trigger animation
    screens[name].style.animation = 'none';
    screens[name].offsetHeight; // reflow
    screens[name].style.animation = '';
  }

  // ---------- Shuffle Utility ----------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Start Game ----------
  function startGame() {
    currentQuestion = 0;
    score = 0;
    totalStars = 0;
    $('#current-score').textContent = '0';
    shuffledQuestions = shuffle(QUESTIONS);
    showScreen('quiz');
    loadQuestion();
  }

  // ---------- Load Question ----------
  function loadQuestion() {
    const q = shuffledQuestions[currentQuestion];
    $('#round-num').textContent = currentQuestion + 1;
    $('#question-text').textContent = q.jp;

    // Build choices: [bestElite(index0 of elite), goodElite(index1), correct]
    // Each choice tracks its type
    const choices = [
      { text: q.elite[0], type: 'best' },
      { text: q.elite[1], type: 'good' },
      { text: q.correct, type: 'boring' }
    ];
    currentChoices = shuffle(choices);

    const btns = $$('.choice-btn');
    btns.forEach((btn, i) => {
      btn.textContent = currentChoices[i].text;
      btn.className = 'choice-btn';
      btn.disabled = false;
    });

    startTimer();
  }

  // ---------- Timer ----------
  function startTimer() {
    clearInterval(timer);
    timeLeft = TIMER_SECONDS * 10; // tenths of second
    const bar = $('#timer-bar');
    bar.style.width = '100%';
    bar.classList.remove('danger');

    timer = setInterval(() => {
      timeLeft--;
      const pct = (timeLeft / (TIMER_SECONDS * 10)) * 100;
      bar.style.width = pct + '%';

      if (pct <= 30) bar.classList.add('danger');

      if (timeLeft <= 0) {
        clearInterval(timer);
        timeUp();
      }
    }, 100);
  }

  function timeUp() {
    // Flash effect
    const flash = document.createElement('div');
    flash.className = 'time-up-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    // Disable buttons
    $$('.choice-btn').forEach((btn) => (btn.disabled = true));

    // Show reaction with 0 stars
    showReaction('timeout');
  }

  // ---------- Handle Choice ----------
  function handleChoice(index) {
    clearInterval(timer);
    const chosen = currentChoices[index];
    const btns = $$('.choice-btn');

    btns.forEach((btn, i) => {
      btn.disabled = true;
      const choiceType = currentChoices[i].type;
      if (i === index) {
        if (choiceType === 'best') btn.classList.add('elite-best');
        else if (choiceType === 'good') btn.classList.add('elite-good');
        else btn.classList.add('correct-boring');
      } else {
        btn.classList.add('not-selected');
      }
    });

    // Short delay then show reaction
    setTimeout(() => showReaction(chosen.type), 600);
  }

  // ---------- Show Reaction ----------
  function showReaction(type) {
    const q = shuffledQuestions[currentQuestion];
    let emoji, title, text, stars;

    switch (type) {
      case 'best':
        emoji = '\uD83D\uDE06';
        title = '\u2728 \u30A8\u30EA\u30FC\u30C8\uFF01\uFF01 \u2728';
        text = q.reactions.best;
        stars = 3;
        score += 3;
        break;
      case 'good':
        emoji = '\uD83D\uDE04';
        title = '\u307E\u3042\u307E\u3042\u30A8\u30EA\u30FC\u30C8\uFF01';
        text = q.reactions.good;
        stars = 2;
        score += 2;
        break;
      case 'boring':
        emoji = '\uD83D\uDE10';
        title = '\u6B63\u3057\u3044\u3051\u3069\u2026\u30A8\u30EA\u30FC\u30C8\u3058\u3083\u306A\u3044\uFF01';
        text = q.reactions.boring;
        stars = 1;
        score += 1;
        break;
      case 'timeout':
        emoji = '\u23F0';
        title = '\u6642\u9593\u5207\u308C\uFF01';
        text = '\u30A8\u30EA\u30FC\u30C8\u306F\u8FC5\u901F\u306B\u7B54\u3048\u308B\uFF01';
        stars = 0;
        break;
    }

    totalStars += stars;
    $('#current-score').textContent = score;
    $('#reaction-emoji').textContent = emoji;
    $('#reaction-title').textContent = title;
    $('#reaction-text').textContent = text;
    $('#stars-earned').textContent =
      STAR_FULL.repeat(stars) + STAR_EMPTY.repeat(3 - stars);

    showScreen('reaction');
  }

  // ---------- Next Question ----------
  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= shuffledQuestions.length) {
      showResult();
    } else {
      showScreen('quiz');
      loadQuestion();
    }
  }

  // ---------- Show Result ----------
  function showResult() {
    const maxStars = QUESTIONS.length * 3;
    const pct = totalStars / maxStars;

    let title, rank, comment;
    if (pct >= 0.9) {
      title = '\uD83C\uDFC6 \u4F1D\u8AAC\u306E\u30A8\u30EA\u30FC\u30C8 \uD83C\uDFC6';
      rank = 'SSS\u30E9\u30F3\u30AF';
      comment = '\u3042\u306A\u305F\u306E\u82F1\u8A9E\u529B\u306F\u5B87\u5B99\u3092\u8D85\u3048\u305F\uFF01\n\u30A8\u30EA\u30FC\u30C8\u4E2D\u306E\u30A8\u30EA\u30FC\u30C8\uFF01';
    } else if (pct >= 0.7) {
      title = '\u2728 \u304B\u306A\u308A\u30A8\u30EA\u30FC\u30C8 \u2728';
      rank = 'S\u30E9\u30F3\u30AF';
      comment = '\u7D20\u6674\u3089\u3057\u3044\u30A8\u30EA\u30FC\u30C8\u529B\uFF01\n\u3082\u3046\u5C11\u3057\u3067\u4F1D\u8AAC\u306B\u306A\u308C\u308B\uFF01';
    } else if (pct >= 0.5) {
      title = '\u307E\u3042\u307E\u3042\u30A8\u30EA\u30FC\u30C8';
      rank = 'A\u30E9\u30F3\u30AF';
      comment = '\u60AA\u304F\u306A\u3044\u3051\u3069\u2026\n\u30A8\u30EA\u30FC\u30C8\u306F\u3082\u3063\u3068\u30AF\u30EC\u30A4\u30B8\u30FC\u3060\u305E\uFF01';
    } else if (pct >= 0.3) {
      title = '\u307E\u3060\u307E\u3060\u521D\u5FC3\u8005';
      rank = 'B\u30E9\u30F3\u30AF';
      comment = '\u6B63\u3057\u3044\u82F1\u8A9E\u3092\u9078\u3093\u3058\u3083\u30C0\u30E1\uFF01\n\u30A8\u30EA\u30FC\u30C8\u306F\u9593\u9055\u3048\u3066\u306A\u3093\u307C\uFF01';
    } else {
      title = '\u30A8\u30EA\u30FC\u30C8\u5931\u683C';
      rank = 'C\u30E9\u30F3\u30AF';
      comment = '\u771F\u9762\u76EE\u3059\u304E\u308B\uFF01\n\u30A8\u30EA\u30FC\u30C8\u306F\u30EB\u30FC\u30EB\u3092\u58CA\u3059\u3082\u306E\u3060\uFF01';
    }

    $('#result-title').textContent = title;
    $('#result-stars').textContent =
      STAR_FULL.repeat(totalStars) + STAR_EMPTY.repeat(maxStars - totalStars);
    $('#result-score-text').textContent =
      totalStars + ' / ' + maxStars + ' \u2B50';
    $('#result-rank').textContent = rank;
    $('#result-comment').textContent = comment;

    // Add share button (remove old one first if replaying)
    const oldShareBtn = document.getElementById('share-btn');
    if (oldShareBtn) oldShareBtn.remove();

    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.textContent = 'Xでシェア';
    shareBtn.style.cssText =
      'font-family: var(--font-display);' +
      'font-size: 1.1rem;' +
      'color: var(--white);' +
      'background: linear-gradient(135deg, #1da1f2, #0d8bd9);' +
      'border: none;' +
      'padding: 14px 40px;' +
      'border-radius: 50px;' +
      'cursor: pointer;' +
      'letter-spacing: 0.05em;' +
      'box-shadow: 0 4px 15px rgba(29,161,242,0.4);' +
      'transition: transform 0.2s, box-shadow 0.2s;' +
      'margin-bottom: 8px;';
    shareBtn.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 25px rgba(29,161,242,0.5)';
    });
    shareBtn.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.boxShadow = '0 4px 15px rgba(29,161,242,0.4)';
    });
    shareBtn.addEventListener('click', function () {
      const gameURL = window.location.href;
      const shareText =
        '\uD83C\uDF38 \u30A8\u30EA\u30FC\u30C8\u30A4\u30F3\u30B0\u30EA\u30C3\u30B7\u30E5\uFF01\n' +
        '\u30B9\u30B3\u30A2: ' + totalStars + ' / ' + maxStars + ' \u2B50\n' +
        '\u30E9\u30F3\u30AF: ' + rank + '\n\n' +
        '#\u30B7\u30E5\u30FC\u30EB\u30B2\u30FC\u30E0\u30B9\n' +
        gameURL;
      const twitterURL =
        'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
      window.open(twitterURL, '_blank');
    });

    // Insert share button before retry button
    const retryBtn = $('#retry-btn');
    retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

    showScreen('result');

    // Confetti for good scores
    if (pct >= 0.5) spawnConfetti();
  }

  // ---------- Confetti ----------
  function spawnConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#ff69b4', '#ffb7c5', '#ffd700', '#ff6b6b', '#7cb8ff', '#a5f3a0'];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--dur', (2 + Math.random() * 2) + 's');
      piece.style.setProperty('--delay', Math.random() * 0.8 + 's');
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  }

  // ---------- Event Listeners ----------
  $('#start-btn').addEventListener('click', startGame);
  $('#next-btn').addEventListener('click', nextQuestion);
  $('#retry-btn').addEventListener('click', startGame);

  $$('.choice-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => handleChoice(i));
  });
})();
