/* ==========================================
   ホロメン経営分析〜鼻毛たちの戯れ〜
   シュールゲームス - Holographic Cute Edition
   ========================================== */

(function () {
  'use strict';

  const sg = SurrealGames.init('holo-analysis');

  // ---------- キャラクター定義 ----------
  const CHARACTERS = [
    {
      name: 'ソラちゃん',
      theme: 'sora',
      hair: 'hair-sora',
      face: 'theme-sora',
      genre: '歌ってみたチャンネル',
      happyLine: 'やったー！鼻毛が喜んでるよ～♪',
      sadLine: 'うぅ…鼻毛がしょんぼりしちゃった…',
    },
    {
      name: 'フブちゃん',
      theme: 'fubuki',
      hair: 'hair-fubuki',
      face: 'theme-fubuki',
      genre: 'ゲーム実況チャンネル',
      happyLine: 'さすが！鼻毛フレンド認定だよ！',
      sadLine: '鼻毛が…抜けそうだよ…',
    },
    {
      name: 'ぺこちゃん',
      theme: 'peko',
      hair: 'hair-peko',
      face: 'theme-peko',
      genre: 'エンタメチャンネル',
      happyLine: 'ぺこぺこ～！鼻毛大勝利ぺこ！',
      sadLine: 'あれぇ？鼻毛が曲がっちゃったぺこ…',
    },
    {
      name: 'マリちゃん',
      theme: 'mari',
      hair: 'hair-mari',
      face: 'theme-mari',
      genre: 'バラエティチャンネル',
      happyLine: 'おっ！やるじゃねぇか！鼻毛海賊団に入れてやるよ！',
      sadLine: 'ダメだこりゃ…鼻毛が沈没しちまった…',
    },
    {
      name: 'スイちゃん',
      theme: 'sui',
      hair: 'hair-sui',
      face: 'theme-sui',
      genre: 'アイドルチャンネル',
      happyLine: 'すいちゃんは～今日も鼻毛が絶好調！',
      sadLine: '鼻毛が…曇ってしまった…',
    },
  ];

  // ---------- 問題データ ----------
  const QUESTIONS = [
    {
      charIndex: 0,
      question:
        'ソラちゃんの歌ってみた動画の再生回数が伸び悩んでいます。\n鼻毛プロデューサーとしてどうアドバイスする？',
      choices: [
        '流行りの曲を毎日投稿して数で勝負する',
        'リスナーのリクエストを分析し、オリジナル曲と人気カバーをバランスよく投稿する',
        '動画投稿をやめてスパチャだけで稼ぐ',
      ],
      correct: 1,
      explanation:
        'リスナーの声を聞きつつ独自性を保つバランス戦略が長期的な成長の鍵！毎日投稿は品質低下を招き、スパチャだけでは新規が来ません。',
    },
    {
      charIndex: 1,
      question:
        'フブちゃんのゲーム実況チャンネル、登録者が最近減ってきました。\n鼻毛マネージャーとしての対策は？',
      choices: [
        '他の人気配信者の真似をして同じゲームだけやる',
        'チャンネルを削除して新しく作り直す',
        '視聴者データを分析し、人気のあるゲームジャンルと配信時間帯を最適化する',
      ],
      correct: 2,
      explanation:
        'データ分析に基づく改善が正解！真似だけでは差別化できず、チャンネル削除は既存ファンを失います。鼻毛的にもデータは大事！',
    },
    {
      charIndex: 2,
      question:
        'ぺこちゃんにコラボ依頼が3件来ました！どれを選ぶべき？\n\nA: フォロワー100万人の大物だけど、ジャンルが全然違う\nB: フォロワー5万人だけど、ファン層がぴったり合う\nC: フォロワー50万人で、過去に炎上経験あり',
      choices: [
        'A：とにかく大物とコラボ！数字は正義！',
        'B：ファン層の親和性を重視した戦略的コラボ',
        'C：炎上しても話題になるからOK！',
      ],
      correct: 1,
      explanation:
        'ファン層の親和性が高いコラボは、お互いの視聴者に刺さりやすく、長期的な成長につながります。鼻毛も共鳴するのです。',
    },
    {
      charIndex: 3,
      question:
        'マリちゃんのスパチャ収益が落ちてきました。\n鼻毛経営コンサルタントとしてどう立て直す？',
      choices: [
        'スパチャを投げない人をブロックして圧力をかける',
        'メンバーシップ限定コンテンツを充実させ、グッズ展開など収益源を多角化する',
        '「スパチャしないと鼻毛抜くぞ」と脅す',
      ],
      correct: 1,
      explanation:
        '収益の多角化はビジネスの基本！一つの収入源に頼るのはリスクが高いです。脅しは論外ですし、ブロックはファンを減らすだけ。鼻毛は平和が好き。',
    },
    {
      charIndex: 4,
      question:
        'スイちゃんのアイドルチャンネルが急成長中！\nこの波に乗るための最善の投資戦略は？',
      choices: [
        '全予算を広告に使って一気にバズらせる',
        '成長データを分析し、コンテンツ品質向上・グッズ制作・ライブイベントにバランスよく投資する',
        '何もしない。自然に任せる。鼻毛のように。',
      ],
      correct: 1,
      explanation:
        '成長期こそバランスの取れた投資が重要！広告だけでは中身が伴わず、何もしないのは機会損失。鼻毛のようにしなやかに、でも戦略的に！',
    },
  ];

  // ---------- ゲーム状態 ----------
  let currentRound = 0;
  let score = 0;

  // ---------- DOM参照 ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const titleScreen = $('#title-screen');
  const quizScreen = $('#quiz-screen');
  const reactionScreen = $('#reaction-screen');
  const resultScreen = $('#result-screen');
  const screens = [titleScreen, quizScreen, reactionScreen, resultScreen];

  // ---------- 画面切り替え ----------
  function showScreen(screen) {
    screens.forEach((s) => {
      s.classList.remove('active');
    });
    setTimeout(() => {
      screen.classList.add('active');
    }, 50);
  }

  // ---------- Star/Sparkle Particle System ----------
  const SPARKLE_CHARS = ['✦', '★', '⭐', '✧', '💫', '☆', '✨'];
  const SPARKLE_COLORS = ['#e84080', '#00b8ff', '#ffc67a', '#d89cf0', '#ff6b9d', '#4caf50', '#ff9633'];

  function spawnSparkles(count, originX, originY) {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'sparkle-particle';
      spark.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      spark.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      spark.style.left = (originX + (Math.random() - 0.5) * 120) + 'px';
      spark.style.top = (originY + (Math.random() - 0.5) * 60) + 'px';
      spark.style.fontSize = (0.7 + Math.random() * 0.8) + 'rem';
      spark.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      spark.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 2000);
    }
  }

  function spawnHoloBurst(originX, originY) {
    const burstChars = ['✦', '⭐', '💫', '✧', '★', '✨', '💖', '🌟'];
    const angles = 12;
    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * Math.PI * 2;
      const dist = 60 + Math.random() * 80;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      const p = document.createElement('span');
      p.className = 'holo-particle';
      p.textContent = burstChars[Math.floor(Math.random() * burstChars.length)];
      p.style.left = originX + 'px';
      p.style.top = originY + 'px';
      p.style.fontSize = (0.8 + Math.random() * 1.0) + 'rem';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      // Override animation with custom translate
      p.style.animation = 'none';
      p.offsetHeight; // force reflow
      p.style.transition = 'all 1.2s cubic-bezier(0.2, 0.8, 0.3, 1)';
      p.style.opacity = '1';

      document.body.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${dx}px, ${dy}px) scale(1.2) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1500);
    }
  }

  // ---------- Rainbow Flash ----------
  function triggerRainbowFlash() {
    const overlay = $('#rainbow-flash-overlay');
    overlay.classList.remove('active');
    overlay.offsetHeight; // force reflow
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 600);
  }

  // ---------- Screen Shake ----------
  function triggerScreenShake() {
    const wrapper = $('#game-wrapper');
    wrapper.classList.add('screen-shake');
    setTimeout(() => wrapper.classList.remove('screen-shake'), 350);
  }

  // ---------- キャラクター描画 ----------
  function drawCharacter(container, char, size) {
    container.className = '';
    container.innerHTML = '';

    container.classList.add(char.face);

    // 髪
    const hair = document.createElement('div');
    hair.className = 'character-hair ' + char.hair;
    container.appendChild(hair);

    // 鼻毛コンテナ
    const noseContainer = document.createElement('div');
    noseContainer.className = 'nose-hair-container';

    const noseBump = document.createElement('div');
    noseBump.className = 'nose-bump';
    noseContainer.appendChild(noseBump);

    const hairL = document.createElement('div');
    hairL.className = 'nose-hair-left';
    noseContainer.appendChild(hairL);

    const hairR = document.createElement('div');
    hairR.className = 'nose-hair-right';
    noseContainer.appendChild(hairR);

    const hairC = document.createElement('div');
    hairC.className = 'nose-hair-center';
    noseContainer.appendChild(hairC);

    container.appendChild(noseContainer);
  }

  // ---------- リアクション用キャラ描画 ----------
  function drawReactionCharacter(container, char, isCorrect) {
    container.className = '';
    container.innerHTML = '';
    container.classList.add(char.face);

    // 髪
    const hair = document.createElement('div');
    hair.className = 'character-hair ' + char.hair;
    container.appendChild(hair);

    if (isCorrect) {
      const eyeL = document.createElement('div');
      eyeL.style.cssText =
        'position:absolute;top:35px;left:26px;width:16px;height:10px;border-top:4px solid #333;border-radius:50% 50% 0 0;';
      container.appendChild(eyeL);

      const eyeR = document.createElement('div');
      eyeR.style.cssText =
        'position:absolute;top:35px;right:26px;width:16px;height:10px;border-top:4px solid #333;border-radius:50% 50% 0 0;';
      container.appendChild(eyeR);

      const mouth = document.createElement('div');
      mouth.className = 'mouth-happy';
      container.appendChild(mouth);
    } else {
      const eyeL = document.createElement('div');
      eyeL.style.cssText =
        'position:absolute;top:38px;left:30px;width:14px;height:14px;background:#333;border-radius:50%;';
      container.appendChild(eyeL);

      const eyeR = document.createElement('div');
      eyeR.style.cssText =
        'position:absolute;top:38px;right:30px;width:14px;height:14px;background:#333;border-radius:50%;';
      container.appendChild(eyeR);

      const mouth = document.createElement('div');
      mouth.className = 'mouth-sad';
      container.appendChild(mouth);

      const tearL = document.createElement('div');
      tearL.className = 'tear tear-left';
      container.appendChild(tearL);

      const tearR = document.createElement('div');
      tearR.className = 'tear tear-right';
      container.appendChild(tearR);
    }

    // 鼻毛（常に）
    const noseContainer = document.createElement('div');
    noseContainer.className = 'nose-hair-container';
    if (container.id === 'reaction-character') {
      noseContainer.style.top = '60px';
    }

    const noseBump = document.createElement('div');
    noseBump.className = 'nose-bump';
    noseContainer.appendChild(noseBump);

    const hairL = document.createElement('div');
    hairL.className = 'nose-hair-left';
    noseContainer.appendChild(hairL);

    const hairR = document.createElement('div');
    hairR.className = 'nose-hair-right';
    noseContainer.appendChild(hairR);

    const hairC = document.createElement('div');
    hairC.className = 'nose-hair-center';
    if (isCorrect) {
      hairC.style.animationDuration = '0.8s';
      hairL.style.animationDuration = '0.6s';
      hairR.style.animationDuration = '0.6s';
    }
    noseContainer.appendChild(hairC);

    container.appendChild(noseContainer);
  }

  // ---------- クイズ表示 ----------
  function showQuiz() {
    const q = QUESTIONS[currentRound];
    const char = CHARACTERS[q.charIndex];

    $('#round-num').textContent = currentRound + 1;
    $('#current-score').textContent = score;

    // キャラ描画
    drawCharacter($('#character-face'), char);
    $('#character-name-plate').textContent =
      char.name + '（' + char.genre + '）';

    // 質問文
    $('#question-text').textContent = q.question;

    // 選択肢
    const choiceBtns = $$('.choice-btn');
    choiceBtns.forEach((btn, i) => {
      btn.textContent = q.choices[i];
      btn.className = 'choice-btn';
      btn.disabled = false;
      btn.onclick = () => handleAnswer(i);
    });

    // Add character entrance class
    const charArea = $('#character-area');
    charArea.classList.add('char-entrance');
    setTimeout(() => charArea.classList.remove('char-entrance'), 800);

    showScreen(quizScreen);
  }

  // ---------- 回答処理 ----------
  function handleAnswer(index) {
    const q = QUESTIONS[currentRound];
    const isCorrect = index === q.correct;

    if (isCorrect) score++;

    // ボタンにフィードバック
    const choiceBtns = $$('.choice-btn');
    choiceBtns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add('correct');
      if (i === index && !isCorrect) btn.classList.add('wrong');
    });

    if (isCorrect) {
      SurrealGames.SoundSystem.play('correct');
      // Confetti + sparkles + rainbow flash
      spawnConfetti();
      const rect = $('#character-face').getBoundingClientRect();
      spawnSparkles(15, rect.left + rect.width / 2, rect.top + rect.height / 2);
      triggerRainbowFlash();
    } else {
      SurrealGames.SoundSystem.play('wrong');
      // Screen shake on wrong answer
      triggerScreenShake();
    }

    setTimeout(() => showReaction(isCorrect), 1200);
  }

  // ---------- リアクション ----------
  function showReaction(isCorrect) {
    const q = QUESTIONS[currentRound];
    const char = CHARACTERS[q.charIndex];

    reactionScreen.className = 'screen';
    reactionScreen.classList.add(isCorrect ? 'reaction-happy' : 'reaction-sad');

    drawReactionCharacter($('#reaction-character'), char, isCorrect);

    $('#reaction-result').textContent = isCorrect
      ? '⭕ 正解！'
      : '❌ 不正解…';
    $('#reaction-text').textContent = isCorrect
      ? char.happyLine + '\n\n' + q.explanation
      : char.sadLine + '\n\n' + q.explanation;

    const nextBtn = $('#next-btn');
    if (currentRound >= QUESTIONS.length - 1) {
      nextBtn.textContent = '結果を見る →';
    } else {
      nextBtn.textContent = '次の問題 →';
    }

    showScreen(reactionScreen);

    // Spawn sparkles around happy reaction character
    if (isCorrect) {
      setTimeout(() => {
        const rect = $('#reaction-character').getBoundingClientRect();
        spawnSparkles(8, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }, 300);
    }
  }

  // ---------- 結果画面 ----------
  function showResult() {
    let rank, comment, titleColor;

    if (score <= 1) {
      rank = '💀 経営破綻 💀';
      comment =
        '鼻毛が全部抜け落ちてしまいました…。もう一度ビジネスの基礎から学びましょう。鼻毛と共に。';
      titleColor = '#999';
    } else if (score <= 3) {
      rank = '📉 赤字社長 📉';
      comment =
        '鼻毛が半分抜けかけています。経営センスはまだまだ。でも鼻毛は伸びます。人生もきっと。';
      titleColor = '#f4a836';
    } else if (score === 4) {
      rank = '✨ 敏腕マネージャー ✨';
      comment =
        '見事な鼻毛ぶり！あなたの経営判断はほぼ完璧。鼻毛たちも喜んでいます。';
      titleColor = '#4caf50';
    } else {
      rank = '👑 伝説のプロデューサー 👑';
      comment =
        '全問正解！あなたの鼻毛は宇宙一輝いています！伝説の鼻毛プロデューサーとしてVTuber界に名を刻みましょう！';
      titleColor = '#e84080';
    }

    const { isNewHigh } = sg.onGameEnd(score, { total: 5 });

    // NEW RECORDバッジ
    const oldRecord = document.querySelector('.sg-new-record');
    if (oldRecord) oldRecord.remove();
    if (isNewHigh) {
      const newRecordEl = document.createElement('div');
      newRecordEl.className = 'sg-new-record';
      newRecordEl.textContent = '\uD83C\uDF89 NEW RECORD!';
      const resultTitle = $('#result-title');
      resultTitle.parentNode.insertBefore(newRecordEl, resultTitle);
    }

    $('#result-title').textContent = '経営分析結果';
    const rankEl = $('#result-rank');
    rankEl.textContent = rank;
    rankEl.style.color = titleColor;
    rankEl.classList.remove('rainbow-rank');

    // Rainbow rank for perfect score
    if (score === 5) {
      rankEl.classList.add('rainbow-rank');
    }

    $('#result-score-text').textContent = score + ' / 5 問正解';
    $('#result-comment').textContent = comment;

    // 結果画面にミニキャラ
    const resultChars = $('#result-characters');
    resultChars.innerHTML = '';
    CHARACTERS.forEach((c) => {
      const face = document.createElement('div');
      face.className = 'mini-face mini-' + c.theme;
      resultChars.appendChild(face);
    });

    // Share button
    var shareBtn = document.getElementById('share-btn');
    if (!shareBtn) {
      shareBtn = document.createElement('button');
      shareBtn.id = 'share-btn';
      shareBtn.style.cssText = 'font-family:"Hachi Maru Pop",cursive;font-size:1rem;padding:12px 32px;background:linear-gradient(135deg,#1da1f2,#0d8bd9);color:#fff;border:none;border-radius:30px;cursor:pointer;box-shadow:0 4px 16px rgba(29,161,242,0.4);transition:transform 0.2s,box-shadow 0.2s;margin-bottom:12px;display:inline-block;';
      shareBtn.textContent = '𝕏 でシェア';
      shareBtn.addEventListener('mouseenter', function () { shareBtn.style.transform = 'scale(1.1)'; });
      shareBtn.addEventListener('mouseleave', function () { shareBtn.style.transform = 'scale(1)'; });
      var retryBtn = document.getElementById('retry-btn');
      retryBtn.parentNode.insertBefore(shareBtn, retryBtn);
    }
    shareBtn.onclick = function () {
      var text = '📊 ホロメン経営分析～鼻毛たちの戯れ～\nスコア: ' + score + ' / 5問正解\nランク: ' + rank + '\n\n#シュールゲームス\n' + window.location.href;
      var url = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    };

    showScreen(resultScreen);

    // Holographic burst on result reveal
    setTimeout(() => {
      const rankRect = rankEl.getBoundingClientRect();
      spawnHoloBurst(
        rankRect.left + rankRect.width / 2,
        rankRect.top + rankRect.height / 2
      );
    }, 400);

    // Full score: extra sparkle bursts
    if (score === 5) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          spawnConfetti();
          const rankRect = rankEl.getBoundingClientRect();
          spawnSparkles(12,
            rankRect.left + rankRect.width / 2 + (Math.random() - 0.5) * 100,
            rankRect.top + rankRect.height / 2
          );
        }, i * 500);
      }
    }
  }

  // ---------- 紙吹雪 ----------
  function spawnConfetti() {
    const colors = ['#ff6b9d', '#6ec6ff', '#ffc67a', '#4caf50', '#d89cf0', '#ff6666', '#00b8ff', '#e84080'];
    for (let i = 0; i < 25; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = 1 + Math.random() * 1.5 + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.width = 6 + Math.random() * 8 + 'px';
      confetti.style.height = 6 + Math.random() * 8 + 'px';
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  }

  // ---------- ゲームリセット ----------
  function resetGame() {
    currentRound = 0;
    score = 0;
  }

  // ---------- イベントリスナー ----------
  $('#start-btn').addEventListener('click', function () {
    resetGame();
    sg.onGameStart();
    showQuiz();
  });

  $('#next-btn').addEventListener('click', function () {
    currentRound++;
    if (currentRound >= QUESTIONS.length) {
      showResult();
    } else {
      showQuiz();
    }
  });

  $('#retry-btn').addEventListener('click', function () {
    resetGame();
    showScreen(titleScreen);
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
