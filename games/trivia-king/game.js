/* ===== 雑学キング決定戦 - game.js ===== */

(function () {
  'use strict';

  const sg = SurrealGames.init('trivia-king');

  // ===== QUESTION POOL =====
  const QUESTIONS = [
    {
      category: '動物の雑学',
      question: 'タコの心臓はいくつある？',
      answers: ['3つ', '1つ', '2つ', '8つ'],
      correct: 0,
      explanation: 'タコには心臓が3つあります。2つはエラに血液を送る「鰓心臓」、1つは全身に血液を送る「体心臓」です。'
    },
    {
      category: '食べ物の雑学',
      question: 'バナナは植物学的には何に分類される？',
      answers: ['ベリー（液果）', '野菜', '穀物', 'キノコ'],
      correct: 0,
      explanation: 'バナナは植物学的には「ベリー」に分類されます。逆にイチゴはベリーではありません。'
    },
    {
      category: '科学の雑学',
      question: '宇宙空間で宇宙飛行士が泣くとどうなる？',
      answers: ['涙が目に張り付く', '涙が上に飛ぶ', '涙が蒸発する', '泣けない'],
      correct: 0,
      explanation: '無重力では涙が落ちず、目の周りにぷるぷると張り付いたまま球状になります。'
    },
    {
      category: '日本語の雑学',
      question: '「々」という記号の正式名称は？',
      answers: ['ノマ点', 'リピート記号', '繰り返し点', '正式名称がない'],
      correct: 3,
      explanation: '実は「々」には正式な名称がありません。「同の字点」「ノマ点」などの通称で呼ばれています。'
    },
    {
      category: '動物の雑学',
      question: 'カタツムリの歯の数はおよそ何本？',
      answers: ['約20,000本', '約100本', '0本（歯がない）', '約2,000本'],
      correct: 0,
      explanation: 'カタツムリには「歯舌」と呼ばれるおろし金のような器官があり、約20,000本もの微小な歯が並んでいます。'
    },
    {
      category: '歴史の雑学',
      question: 'クレオパトラの時代、ピラミッドはすでに何年前のものだった？',
      answers: ['約2,500年前', '約500年前', '約100年前', '同時代に建設された'],
      correct: 0,
      explanation: 'クレオパトラの生きた時代（紀元前69年頃）から見て、大ピラミッドは約2,500年も昔の建造物でした。'
    },
    {
      category: '食べ物の雑学',
      question: 'はちみつは何年経っても腐らないと言われているが、実際に食べられた最古のはちみつは？',
      answers: ['約3,000年前', '約500年前', '約100年前', '約50年前'],
      correct: 0,
      explanation: 'エジプトの墓から発見された約3,000年前のはちみつが、まだ食べられる状態だったそうです。'
    },
    {
      category: '科学の雑学',
      question: '地球上の全人類を一箇所に集めたら、どのくらいの体積になる？',
      answers: ['角砂糖1個分（原子間の隙間を詰めた場合）', 'サッカー場1面分', '東京ドーム10個分', '富士山と同じくらい'],
      correct: 0,
      explanation: '原子の中はほとんどが空間。全人類の原子を隙間なく詰めると、角砂糖1個程度に収まります。'
    },
    {
      category: '動物の雑学',
      question: 'キリンの睡眠時間は1日どのくらい？',
      answers: ['約30分', '約3時間', '約8時間', '約12時間'],
      correct: 0,
      explanation: 'キリンの睡眠時間は1日わずか約30分。しかも一度に数分ずつしか眠りません。外敵から身を守るためです。'
    },
    {
      category: '日本語の雑学',
      question: '「蛞蝓」は何と読む？',
      answers: ['なめくじ', 'かたつむり', 'やもり', 'むかで'],
      correct: 0,
      explanation: '「蛞蝓」で「なめくじ」と読みます。ちなみにカタツムリは「蝸牛」です。'
    },
    {
      category: '地理の雑学',
      question: 'ロシアの面積は冥王星の表面積より大きい？',
      answers: ['大きい', '小さい', 'ほぼ同じ', '比較できない'],
      correct: 0,
      explanation: 'ロシアの面積は約1,710万km²、冥王星の表面積は約1,665万km²。わずかにロシアの方が大きいのです。'
    },
    {
      category: '食べ物の雑学',
      question: 'ポテトチップスはどのようなきっかけで発明された？',
      answers: ['客のクレームへの嫌がらせ', '偶然の実験結果', '軍隊の保存食として', '王様の命令で'],
      correct: 0,
      explanation: '1853年、シェフのジョージ・クラムが「ポテトが厚すぎる」と文句を言う客への嫌がらせで極薄に揚げたのが始まりとされています。'
    },
    {
      category: '科学の雑学',
      question: '人間の体内にある細菌の数は、人間の細胞数と比べてどのくらい？',
      answers: ['ほぼ同数', '10倍多い', '100倍多い', '細胞の方が多い'],
      correct: 0,
      explanation: '最新の研究では、体内の細菌数は約38兆個、人間の細胞数は約37兆個で、ほぼ同数とされています。'
    },
    {
      category: '動物の雑学',
      question: 'ラッコが寝るとき、何をする？',
      answers: ['手をつないで寝る', '石を抱いて寝る', '水中に潜って寝る', '陸に上がって寝る'],
      correct: 0,
      explanation: 'ラッコは流されないように、寝るときにお互いの手をつなぎます。海藻を体に巻きつけることもあります。'
    },
    {
      category: '歴史の雑学',
      question: 'オックスフォード大学が創立されたとき、アステカ帝国はまだ存在していなかった。これは…',
      answers: ['本当', '嘘', '同時期に成立', '記録が残っていない'],
      correct: 0,
      explanation: 'オックスフォード大学の講義開始は1096年頃。アステカ帝国の成立は1428年。300年以上の差があります。'
    },
    {
      category: '日本語の雑学',
      question: '日本語で一番画数が多い漢字「たいと」は何画？',
      answers: ['84画', '64画', '48画', '108画'],
      correct: 0,
      explanation: '「たいと」は雲3つと龍3つを組み合わせた漢字で、84画あります。苗字として使われていたとされています。'
    },
    {
      category: '科学の雑学',
      question: '光が太陽から地球に届くまでの時間は？',
      answers: ['約8分', '約1秒', '約1分', '約30分'],
      correct: 0,
      explanation: '太陽から地球までの距離は約1億5千万km。光でも約8分19秒かかります。'
    },
    {
      category: '食べ物の雑学',
      question: 'イチゴの表面にあるつぶつぶは何？',
      answers: ['種ではなく果実', '種', '花粉', '卵'],
      correct: 0,
      explanation: 'イチゴの赤い部分は「花托」で、表面のつぶつぶ一つ一つが実は「果実（痩果）」です。'
    },
    {
      category: '動物の雑学',
      question: 'ミツバチが一生で作れるはちみつの量は？',
      answers: ['ティースプーン1杯分', 'コップ1杯分', 'バケツ1杯分', 'ペットボトル1本分'],
      correct: 0,
      explanation: '1匹のミツバチが一生（約6週間）で作れるはちみつは、わずかティースプーン約1/12杯（約1.5g）です。'
    },
    {
      category: '地理の雑学',
      question: '太平洋の面積は、全ての陸地の面積を合わせたものより…',
      answers: ['大きい', '小さい', 'ほぼ同じ', '半分くらい'],
      correct: 0,
      explanation: '太平洋の面積は約1億6,525万km²。全陸地の面積は約1億4,894万km²で、太平洋の方が大きいのです。'
    },
    {
      category: '科学の雑学',
      question: '人間のDNAの約60%は何と同じ？',
      answers: ['バナナ', 'チンパンジー', '大腸菌', '石'],
      correct: 0,
      explanation: '人間とバナナのDNAは約60%が共通しています。ちなみにチンパンジーとは約99%が共通です。'
    },
    {
      category: '歴史の雑学',
      question: '任天堂が創業されたのは何年？',
      answers: ['1889年', '1950年', '1975年', '1985年'],
      correct: 0,
      explanation: '任天堂は1889年に花札の製造会社として京都で創業しました。エッフェル塔が完成した年と同じです。'
    },
    {
      category: '動物の雑学',
      question: 'フラミンゴが片足で立つ理由として有力な説は？',
      answers: ['体温を保つため', '疲れないため', '敵を威嚇するため', '理由は不明'],
      correct: 0,
      explanation: 'フラミンゴが片足で立つのは、水に触れる面積を減らして体温の低下を防ぐためという説が有力です。'
    },
    {
      category: '食べ物の雑学',
      question: 'わさびが辛いのは、何から身を守るため？',
      answers: ['虫や動物', '紫外線', '他の植物', '菌類'],
      correct: 0,
      explanation: 'わさびの辛味成分（アリルイソチオシアネート）は、害虫や草食動物から身を守るための防御物質です。'
    },
    {
      category: '日本語の雑学',
      question: '「OK」の由来として有力な説は？',
      answers: ['「oll korrect」のスペルミス', '人名の略', '地名の略', '軍隊用語'],
      correct: 0,
      explanation: '1839年、ボストンの新聞で「all correct」をわざと「oll korrect」と綴り「O.K.」と略したのが起源とされています。'
    },
    {
      category: '科学の雑学',
      question: '宇宙の匂いはどんな匂いと報告されている？',
      answers: ['焼けたステーキ', '花の香り', '無臭', '硫黄'],
      correct: 0,
      explanation: '宇宙遊泳から帰還した飛行士たちは、宇宙服に残った匂いを「焼けたステーキ」や「金属」の匂いと表現しています。'
    }
  ];

  const TOTAL_QUESTIONS = 15;
  const TIME_PER_QUESTION = 8; // seconds
  const BASE_SCORE = 100;

  // ===== RANK DEFINITIONS =====
  const RANKS = [
    { min: 0,    label: '雑学見習い',   crown: '📖' },
    { min: 500,  label: '雑学中級者',   crown: '🎓' },
    { min: 1000, label: '雑学マスター', crown: '🏅' },
    { min: 1800, label: '雑学キング',   crown: '👑' },
    { min: 2500, label: '雑学の神',     crown: '✨👑✨' }
  ];

  // ===== STATE =====
  let gameQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let correctCount = 0;
  let timerInterval = null;
  let timeLeft = 0;
  let answered = false;

  // ===== DOM ELEMENTS =====
  const $id = (id) => document.getElementById(id);

  const titleScreen = $id('title-screen');
  const gameScreen = $id('game-screen');
  const resultScreen = $id('result-screen');
  const startBtn = $id('start-btn');
  const retryBtn = $id('retry-btn');
  const scoreDisplay = $id('score-display');
  const streakCount = $id('streak-count');
  const streakFire = $id('streak-fire');
  const multiplierDisplay = $id('multiplier-display');
  const questionNumber = $id('question-number');
  const categoryLabel = $id('category-label');
  const timerBar = $id('timer-bar');
  const questionText = $id('question-text');
  const answersArea = $id('answers-area');
  const answerBtns = answersArea.querySelectorAll('.btn-answer');
  const explanationArea = $id('explanation-area');
  const explanationIcon = $id('explanation-icon');
  const explanationText = $id('explanation-text');
  const flashOverlay = $id('flash-overlay');

  // Result elements
  const resultCrown = $id('result-crown');
  const resultRank = $id('result-rank');
  const resultScore = $id('result-score');
  const resultCorrect = $id('result-correct');
  const resultMaxStreak = $id('result-max-streak');
  const resultAccuracy = $id('result-accuracy');

  // ===== SCREEN MANAGEMENT =====
  function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // ===== SHUFFLE UTILITY =====
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===== START GAME =====
  function startGame() {
    gameQuestions = shuffle(QUESTIONS).slice(0, TOTAL_QUESTIONS);
    currentIndex = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    correctCount = 0;

    scoreDisplay.textContent = '0';
    streakCount.textContent = '0';
    streakFire.className = 'streak-fire';
    streakFire.textContent = '';
    multiplierDisplay.textContent = 'x1';
    multiplierDisplay.classList.remove('active');

    sg.onGameStart();
    showScreen(gameScreen);
    loadQuestion();
  }

  // ===== LOAD QUESTION =====
  function loadQuestion() {
    answered = false;
    const q = gameQuestions[currentIndex];

    // Update HUD
    questionNumber.textContent = `Q.${currentIndex + 1} / ${TOTAL_QUESTIONS}`;
    categoryLabel.textContent = q.category;

    // Set question text
    questionText.textContent = q.question;
    questionText.style.animation = 'none';
    questionText.offsetHeight; // reflow
    questionText.style.animation = 'fadeInUp 0.4s ease-out';

    // Shuffle answer display order (track correct index)
    const indices = [0, 1, 2, 3];
    const shuffled = shuffle(indices);

    answerBtns.forEach((btn, i) => {
      const srcIdx = shuffled[i];
      btn.textContent = q.answers[srcIdx];
      btn.dataset.srcIndex = srcIdx;
      btn.className = 'btn-answer';
      btn.disabled = false;
      btn.style.animation = 'none';
      btn.offsetHeight;
      btn.style.animation = `fadeInUp 0.3s ${i * 0.08}s ease-out both`;
    });

    // Hide explanation
    explanationArea.classList.add('hidden');

    // Start timer
    startTimer();
  }

  // ===== TIMER =====
  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION * 1000;
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    timerBar.classList.remove('urgent');

    // Use CSS transition for smooth countdown
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timerBar.style.transition = `width ${TIME_PER_QUESTION}s linear`;
        timerBar.style.width = '0%';
      });
    });

    // Check for urgent state and timeout
    timerInterval = setInterval(() => {
      timeLeft -= 100;

      if (timeLeft <= 3000 && !timerBar.classList.contains('urgent')) {
        timerBar.classList.add('urgent');
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!answered) {
          handleTimeout();
        }
      }
    }, 100);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerBar.style.transition = 'none';
    // Freeze current width
    const computed = getComputedStyle(timerBar).width;
    timerBar.style.width = computed;
  }

  // ===== HANDLE ANSWER =====
  function handleAnswer(btnIndex) {
    if (answered) return;
    answered = true;
    stopTimer();

    const q = gameQuestions[currentIndex];
    const selectedSrcIdx = parseInt(answerBtns[btnIndex].dataset.srcIndex);
    const isCorrect = selectedSrcIdx === q.correct;

    // Disable all buttons
    answerBtns.forEach(btn => btn.disabled = true);

    // Highlight correct and wrong
    answerBtns.forEach(btn => {
      if (parseInt(btn.dataset.srcIndex) === q.correct) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      handleCorrect();
    } else {
      answerBtns[btnIndex].classList.add('wrong');
      handleWrong();
    }

    // Show explanation
    showExplanation(isCorrect, q.explanation);

    // Next question after delay
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < TOTAL_QUESTIONS) {
        loadQuestion();
      } else {
        showResults();
      }
    }, isCorrect ? 2000 : 3000);
  }

  function handleCorrect() {
    SurrealGames.SoundSystem.play('correct');
    streak++;
    correctCount++;
    if (streak > maxStreak) maxStreak = streak;

    const multiplier = Math.min(streak, 5);
    const points = BASE_SCORE * multiplier;
    // Bonus for remaining time
    const timeBonus = Math.floor((timeLeft / 1000) * 10);
    score += points + timeBonus;

    scoreDisplay.textContent = score;
    streakCount.textContent = streak;

    // Update multiplier display
    if (streak >= 2) {
      multiplierDisplay.textContent = `x${multiplier}`;
      multiplierDisplay.classList.add('active');
      multiplierDisplay.style.animation = 'none';
      multiplierDisplay.offsetHeight;
      multiplierDisplay.style.animation = 'multiplierPop 0.4s ease-out';
    }

    // Fire effect
    if (streak >= 2) {
      const fires = ['🔥', '🔥🔥', '🔥🔥🔥', '💥🔥💥'];
      streakFire.textContent = fires[Math.min(streak - 2, fires.length - 1)];
      streakFire.classList.add('on');
    }

    // Flash effect
    flashOverlay.className = 'flash-overlay flash-correct';
    setTimeout(() => flashOverlay.className = 'flash-overlay', 400);
  }

  function handleWrong() {
    SurrealGames.SoundSystem.play('wrong');
    streak = 0;
    streakCount.textContent = '0';
    streakFire.className = 'streak-fire';
    streakFire.textContent = '';
    multiplierDisplay.textContent = 'x1';
    multiplierDisplay.classList.remove('active');

    flashOverlay.className = 'flash-overlay flash-wrong';
    setTimeout(() => flashOverlay.className = 'flash-overlay', 400);
  }

  function handleTimeout() {
    answered = true;
    answerBtns.forEach(btn => btn.disabled = true);

    const q = gameQuestions[currentIndex];
    answerBtns.forEach(btn => {
      if (parseInt(btn.dataset.srcIndex) === q.correct) {
        btn.classList.add('correct');
      }
    });

    handleWrong();
    showExplanation(false, '⏱️ 時間切れ！ ' + q.explanation);

    setTimeout(() => {
      currentIndex++;
      if (currentIndex < TOTAL_QUESTIONS) {
        loadQuestion();
      } else {
        showResults();
      }
    }, 3000);
  }

  function showExplanation(isCorrect, text) {
    explanationIcon.textContent = isCorrect ? '⭕' : '❌';
    explanationText.textContent = text;
    explanationArea.classList.remove('hidden');
  }

  // ===== RESULTS =====
  function showResults() {
    const { isNewHigh } = sg.onGameEnd(score, { correct: correctCount, maxStreak });
    showScreen(resultScreen);

    // Determine rank
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (score >= r.min) rank = r;
    }

    resultCrown.textContent = rank.crown;
    resultRank.textContent = rank.label;

    // Animate score count-up
    resultScore.textContent = '0';
    resultCorrect.textContent = correctCount + ' / ' + TOTAL_QUESTIONS;
    resultMaxStreak.textContent = maxStreak;
    resultAccuracy.textContent = Math.round((correctCount / TOTAL_QUESTIONS) * 100) + '%';

    let displayScore = 0;
    const step = Math.max(1, Math.floor(score / 60));
    const countUp = setInterval(() => {
      displayScore += step;
      if (displayScore >= score) {
        displayScore = score;
        clearInterval(countUp);
      }
      resultScore.textContent = displayScore;
    }, 16);

    // Add share button (remove existing one first to avoid duplicates on retry)
    const existingShareBtn = document.getElementById('share-btn');
    if (existingShareBtn) existingShareBtn.remove();

    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.textContent = '𝕏 で結果をシェア';
    shareBtn.className = 'btn-start';
    shareBtn.style.cssText = 'margin-top: 12px; font-size: clamp(0.95rem, 3vw, 1.2rem); background: linear-gradient(135deg, #1da1f2 0%, #0d8ecf 100%);';

    shareBtn.addEventListener('click', function () {
      const gameURL = window.location.href;
      const shareText = '\u{1F451} 雑学キング決定戦\n'
        + 'スコア: ' + score + '点\n'
        + '正解: ' + correctCount + '/' + TOTAL_QUESTIONS + '問\n'
        + '最大連続正解: ' + maxStreak + '\n'
        + 'ランク: ' + rank.label + '\n\n'
        + '#シュールゲームス\n'
        + gameURL;
      const tweetURL = 'https://x.com/intent/tweet?text=' + encodeURIComponent(shareText);
      window.open(tweetURL, '_blank');
    });

    // Insert share button before retry button
    retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

    // NEW RECORDバッジ
    const oldRecord = document.querySelector('.sg-new-record');
    if (oldRecord) oldRecord.remove();
    if (isNewHigh) {
      const newRecordEl = document.createElement('div');
      newRecordEl.className = 'sg-new-record';
      newRecordEl.textContent = '\uD83C\uDF89 NEW RECORD!';
      resultScore.parentNode.insertBefore(newRecordEl, resultScore);
    }
  }

  // ===== HIGH SCORE DISPLAY =====
  function updateHighScoreDisplay() {
    const highScore = sg.getHighScore();
    const el = document.getElementById('sg-high-score-display');
    if (highScore && el) {
      el.textContent = '\uD83C\uDFC6 HIGH SCORE: ' + highScore;
      el.style.display = 'block';
    }
  }
  updateHighScoreDisplay();

  // ===== EVENT LISTENERS =====
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);

  answerBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => handleAnswer(i));
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (gameScreen.classList.contains('active') && !answered) {
      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (e.key in keyMap) {
        handleAnswer(keyMap[e.key]);
      }
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (titleScreen.classList.contains('active')) {
        e.preventDefault();
        startGame();
      }
    }
  });

})();
