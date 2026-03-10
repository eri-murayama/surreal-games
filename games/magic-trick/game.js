/* ===== マジックみやぶり - game.js ===== */

const TRICKS = [
  {
    id: 'card',
    name: 'カード予言',
    setup: '好きなカードを1枚選んでください…',
    perform: 'あなたのカードは…ハートのエース！！',
    visual: 'card',
    question: 'このマジックのタネは？',
    choices: [
      { text: '超能力で読んだ', correct: false },
      { text: '全部同じカードだった', correct: true },
      { text: 'カメラで盗み見た', correct: false },
      { text: '統計的に一番選ばれるカードを言った', correct: false },
    ],
    correctExplain: '正解！ デッキの中身は全部ハートのエース。何を選んでも当たるインチキデッキだった！',
    wrongExplain: '残念！ 実はデッキの中身は全部ハートのエース。何を選んでも当たるインチキだよ！',
    hint: 'カードをよく見ると…全部同じ模様？',
  },
  {
    id: 'coin',
    name: 'コイン消失',
    setup: 'このコインをご覧ください…',
    perform: 'ハッ！ コインが消えた！！',
    visual: 'coin',
    question: 'コインはどこへ消えた？',
    choices: [
      { text: '異次元に送った', correct: false },
      { text: '実は最初からチョコだったので食べた', correct: true },
      { text: '素早く投げて客席に飛ばした', correct: false },
      { text: '透明になる薬を塗った', correct: false },
    ],
    correctExplain: '正解！ よく見たらコインじゃなくて金色のチョコレート。こっそり食べてた！口元にチョコついてるよ…',
    wrongExplain: '残念！ 実はコインに見せかけた金色のチョコレート。マジシャンがこっそりパクッと食べてたよ！',
    hint: 'マジシャンの口元になにかついてない？',
  },
  {
    id: 'rope',
    name: 'ロープ復活',
    setup: 'このロープを切りますよ… ジョキジョキ…',
    perform: 'おりゃー！ つながった！！',
    visual: 'rope',
    question: 'なぜロープがつながった？',
    choices: [
      { text: '超強力な瞬間接着剤を塗った', correct: false },
      { text: '切ったフリをしただけ', correct: false },
      { text: '最初から2本のロープを1本に見せていた', correct: false },
      { text: 'そもそもロープじゃなくてうどんだった', correct: true },
    ],
    correctExplain: '正解！ ロープに見せかけた極太うどんだった！つなげたんじゃなくて、別のうどんにすり替えただけ！',
    wrongExplain: '残念！ 実はロープじゃなくて極太うどん。切ったあと、こっそり新しいうどんにすり替えてたよ！',
    hint: 'なんかいい匂いがする…おダシの香り？',
  },
  {
    id: 'hat',
    name: 'ハットからウサギ',
    setup: '空っぽの帽子をご覧ください…',
    perform: '出でよ！！ …ウサギ！！',
    visual: 'hat',
    question: 'ウサギはどこにいた？',
    choices: [
      { text: '帽子の二重底に隠れていた', correct: false },
      { text: 'ウサギじゃなくてウサギ耳をつけたネコ', correct: true },
      { text: '別の世界から召喚した', correct: false },
      { text: '客の後ろからこっそり持ってきた', correct: false },
    ],
    correctExplain: '正解！ よく見たらウサギじゃなくて白いネコにウサギの耳をつけただけ！「ニャー」って鳴いてるし！',
    wrongExplain: '残念！ 実はウサギじゃなくてウサギ耳をつけた白ネコだった。よく見たら「ニャー」って言ってる！',
    hint: 'あの動物、耳がなんか…グラグラしてない？',
  },
  {
    id: 'levitation',
    name: '空中浮遊',
    setup: '私は今から宙に浮きます…',
    perform: 'フワーッ！ 浮いてる！！',
    visual: 'levitation',
    question: 'なぜ浮いている？',
    choices: [
      { text: '見えない糸で吊られている', correct: false },
      { text: '靴にバネを仕込んでいる', correct: false },
      { text: 'アシスタントが下で持ち上げている', correct: false },
      { text: '足の下にガラスの台がある…と思いきや、弟が四つん這いで支えている', correct: true },
    ],
    correctExplain: '正解！ よく見たら足の下に同じ服を着た弟がいた！「もう限界…」って小声で言ってる！',
    wrongExplain: '残念！ 実は足の下で弟が四つん這いで支えてた！同じ衣装で背景と一体化してたけど、よく見たらプルプル震えてる！',
    hint: 'なんか下のほうからプルプル音が聞こえる…',
  },
];

// ===== ゲーム状態 =====
let currentTrick = 0;
let score = 0;
let hintUsed = false;

// ===== DOM =====
const overlay = document.getElementById('overlay');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const trickVisual = document.getElementById('trick-visual');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');
const questionText = document.getElementById('question-text');
const choicesEl = document.getElementById('choices');
const choicesArea = document.getElementById('choices-area');
const feedback = document.getElementById('feedback');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');
const handLeft = document.getElementById('hand-left');
const handRight = document.getElementById('hand-right');

// ===== 初期化 =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextTrick);

function startGame() {
  currentTrick = 0;
  score = 0;
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  overlay.classList.add('hidden');
  resetDots();
  showTrick(currentTrick);
}

function resetDots() {
  document.querySelectorAll('.stage-dot').forEach((dot, i) => {
    dot.className = 'stage-dot' + (i === 0 ? ' active' : '');
  });
}

// ===== トリック表示 =====
function showTrick(index) {
  const trick = TRICKS[index];
  hintUsed = false;

  // UI リセット
  feedback.classList.add('hidden');
  feedback.classList.remove('correct-fb', 'wrong-fb');
  choicesArea.style.display = 'block';
  choicesEl.innerHTML = '';
  questionText.textContent = '';

  // 手を振るアニメーション
  handLeft.classList.add('wave');
  handRight.classList.add('wave');
  setTimeout(() => {
    handLeft.classList.remove('wave');
    handRight.classList.remove('wave');
  }, 1500);

  // セットアップ演出
  speechText.textContent = trick.setup;
  renderTrickVisual(trick, 'setup');

  // マジック実行
  setTimeout(() => {
    speechText.textContent = trick.perform;
    renderTrickVisual(trick, 'perform');
    addSparkles();

    // 質問表示
    setTimeout(() => {
      showQuestion(trick);
    }, 1000);
  }, 2000);
}

function renderTrickVisual(trick, phase) {
  switch (trick.id) {
    case 'card':
      if (phase === 'setup') {
        trickVisual.innerHTML = '<div class="cards-row"><span>🃏</span><span>🃏</span><span>🃏</span><span>🃏</span><span>🃏</span></div>';
      } else {
        trickVisual.innerHTML = '<div class="cards-row"><span class="appear">🂱</span><span class="appear">🂱</span><span class="appear">🂱</span><span class="appear">🂱</span><span class="appear">🂱</span></div>';
      }
      break;

    case 'coin':
      if (phase === 'setup') {
        trickVisual.innerHTML = '<span style="font-size:70px">🪙</span>';
      } else {
        trickVisual.innerHTML = '<span class="vanish" style="font-size:70px">🪙</span>';
        setTimeout(() => { trickVisual.innerHTML = '<span class="appear" style="font-size:40px">✨ 🫥 ✨</span>'; }, 800);
      }
      break;

    case 'rope':
      if (phase === 'setup') {
        trickVisual.innerHTML = '<div class="rope-visual"><div class="rope-piece"></div><div class="rope-cut">✂️</div><div class="rope-piece"></div></div>';
      } else {
        trickVisual.innerHTML = '<div class="rope-visual"><div class="rope-piece appear" style="height:90px"></div></div>';
      }
      break;

    case 'hat':
      if (phase === 'setup') {
        trickVisual.innerHTML = '<span style="font-size:70px">🎩</span>';
      } else {
        trickVisual.innerHTML = '<span style="font-size:70px">🎩</span><span class="appear" style="font-size:50px">🐰</span>';
      }
      break;

    case 'levitation':
      if (phase === 'setup') {
        trickVisual.innerHTML = '<span style="font-size:70px">🧙‍♂️</span>';
      } else {
        trickVisual.innerHTML = '<span class="appear" style="font-size:70px; animation: float 1s ease-in-out infinite">🧙‍♂️</span><br><span style="font-size:20px; opacity:0.4">ﾌﾟﾙﾌﾟﾙ...</span>';
      }
      break;
  }
}

function addSparkles() {
  const area = document.getElementById('trick-area');
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-effect';
      sparkle.textContent = ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)];
      sparkle.style.left = (20 + Math.random() * 60) + '%';
      sparkle.style.top = (20 + Math.random() * 40) + '%';
      area.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }, i * 150);
  }
}

// ===== 質問表示 =====
function showQuestion(trick) {
  questionText.textContent = trick.question;

  // 選択肢をシャッフル（正解位置をランダムに）
  const shuffled = trick.choices
    .map((c, i) => ({ ...c, originalIndex: i }))
    .sort(() => Math.random() - 0.5);

  const labels = ['A', 'B', 'C', 'D'];
  shuffled.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-label">${labels[i]}</span>${choice.text}`;
    btn.addEventListener('click', () => handleAnswer(btn, choice.correct, trick));
    choicesEl.appendChild(btn);
  });

  // ヒントボタン
  const hintArea = document.createElement('div');
  hintArea.className = 'hint-area';
  const hintBtn = document.createElement('button');
  hintBtn.className = 'hint-btn';
  hintBtn.textContent = '🔍 ヒントを見る';
  hintBtn.addEventListener('click', () => {
    hintUsed = true;
    hintBtn.style.display = 'none';
    const hintP = document.createElement('p');
    hintP.className = 'hint-text';
    hintP.textContent = trick.hint;
    hintArea.appendChild(hintP);
  });
  hintArea.appendChild(hintBtn);
  choicesEl.appendChild(hintArea);
}

// ===== 回答処理 =====
function handleAnswer(selectedBtn, isCorrect, trick) {
  // 全ボタンを無効化
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.add('disabled');
    // 正解ボタンにマーク
    const choiceText = btn.textContent.substring(1); // ラベルを除く
    const isThisCorrect = trick.choices.some(c => c.correct && choiceText.includes(c.text));
    if (isThisCorrect) btn.classList.add('correct');
  });

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    if (!hintUsed) {
      score++;
    } else {
      score += 0.5;
    }
    feedbackIcon.textContent = '🎯';
    feedbackText.textContent = trick.correctExplain;
    feedback.classList.remove('wrong-fb');
    feedback.classList.add('correct-fb');
    updateDot(currentTrick, 'correct');
  } else {
    selectedBtn.classList.add('wrong');
    feedbackIcon.textContent = '😵';
    feedbackText.textContent = trick.wrongExplain;
    feedback.classList.remove('correct-fb');
    feedback.classList.add('wrong-fb');
    updateDot(currentTrick, 'wrong');
  }

  feedback.classList.remove('hidden');

  if (currentTrick >= TRICKS.length - 1) {
    nextBtn.textContent = '結果を見る 🏆';
  } else {
    nextBtn.textContent = '次のマジックへ →';
  }
}

function updateDot(index, result) {
  const dots = document.querySelectorAll('.stage-dot');
  dots[index].classList.remove('active');
  dots[index].classList.add(result);
}

// ===== 次のトリックへ =====
function nextTrick() {
  currentTrick++;
  if (currentTrick >= TRICKS.length) {
    showResult();
    return;
  }

  // 次のドットをアクティブに
  const dots = document.querySelectorAll('.stage-dot');
  dots[currentTrick].classList.add('active');

  showTrick(currentTrick);
}

// ===== 結果画面 =====
function showResult() {
  overlay.classList.remove('hidden');
  startScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const total = TRICKS.length;
  const scoreDisplay = document.getElementById('result-score');
  const rankEl = document.getElementById('result-rank');
  const commentEl = document.getElementById('result-comment');
  const iconEl = document.getElementById('result-icon');

  scoreDisplay.textContent = `${score} / ${total}`;

  if (score >= total) {
    iconEl.textContent = '🕵️';
    rankEl.textContent = '天才タネ明かし師';
    commentEl.textContent = 'すべてのインチキを見抜いた！ マジシャン廃業のお知らせ。';
  } else if (score >= total * 0.7) {
    iconEl.textContent = '🔍';
    rankEl.textContent = 'するどい観察者';
    commentEl.textContent = 'かなり鋭い！ でもまだ騙されてるトリックがあるよ。';
  } else if (score >= total * 0.4) {
    iconEl.textContent = '🤔';
    rankEl.textContent = 'ちょっとだまされやすい人';
    commentEl.textContent = 'もうちょっと疑ってかかろう！ 世の中ウソだらけだよ！';
  } else {
    iconEl.textContent = '😇';
    rankEl.textContent = 'ピュアな心の持ち主';
    commentEl.textContent = '全部信じちゃった！ その純粋さ、大事にしてね…（カモにされないように気をつけて）';
  }
}
