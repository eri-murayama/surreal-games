// ===== ゲーム設定 =====
const STAGES = [
  {
    id: 'clean',
    title: 'まずはキレイにしよう！',
    choices: [
      { icon: '🧽', label: 'スポンジで\nごしごし', value: 'sponge' },
      { icon: '🚿', label: 'シャワーで\nじゃばー', value: 'shower' },
      { icon: '🧹', label: 'ほうきで\nバシバシ', value: 'broom' },
    ],
  },
  {
    id: 'hair',
    title: '髪型をえらぼう！',
    choices: [
      { icon: '💇', label: 'さらさら\nロング', value: 'long' },
      { icon: '✂️', label: 'すっきり\nショート', value: 'short' },
      { icon: '🎀', label: 'ぴょこぴょこ\nツインテ', value: 'twin' },
      { icon: '🍡', label: 'おだんご\nヘアー', value: 'bun' },
    ],
  },
  {
    id: 'haircolor',
    title: '髪の色をえらぼう！',
    choices: [
      { icon: '🟤', label: 'ブラウン', value: 'brown' },
      { icon: '⚫', label: 'ブラック', value: 'black' },
      { icon: '🩷', label: 'ピンク', value: 'pink' },
      { icon: '🟡', label: 'ブロンド', value: 'blonde' },
    ],
  },
  {
    id: 'outfit',
    title: 'お洋服をえらぼう！',
    choices: [
      { icon: '👗', label: 'ふわふわ\nピンクドレス', value: 'dress-pink' },
      { icon: '👔', label: 'さわやか\nブルーワンピ', value: 'dress-blue' },
      { icon: '🖤', label: 'ダーク\nゴシック', value: 'dress-gothic' },
      { icon: '👘', label: 'はんなり\nおきもの', value: 'dress-kimono' },
    ],
  },
  {
    id: 'accessory',
    title: 'アクセサリーをつけよう！',
    choices: [
      { icon: '👑', label: 'ティアラ', value: 'tiara' },
      { icon: '🌸', label: 'おはな', value: 'flower' },
      { icon: '🎩', label: 'シルクハット', value: 'tophat' },
      { icon: '🐱', label: 'ねこみみ', value: 'catears' },
    ],
  },
];

const SPEECH = {
  start: '...きたない...',
  clean: {
    sponge: 'きゅっきゅっ！すべすべ！',
    shower: 'ひゃっ！冷たい！...でもさっぱり！',
    broom: 'いたたた！掃除じゃないよ！',
  },
  hair: {
    long: 'さらさら～♪いい女度UP！',
    short: 'すっきり！できる女感！',
    twin: 'ぴょんぴょん！年齢詐称疑惑！',
    bun: 'おだんご！和の心！',
  },
  haircolor: {
    brown: 'ナチュラルビューティー！',
    black: '黒髪清楚...に見せかける！',
    pink: '推しの色にしてみた！',
    blonde: '異世界転生したみたい！',
  },
  outfit: {
    'dress-pink': 'きゃー！お姫様みたい！',
    'dress-blue': '知的で爽やかじゃない？',
    'dress-gothic': '闇の力が…目覚める…！',
    'dress-kimono': '大和撫子でございます',
  },
  accessory: {
    tiara: '私が女王よ！ひれ伏しなさい！',
    flower: 'お花畑の住人になりました',
    tophat: '紳士淑女の皆様、ごきげんよう',
    catears: 'にゃーん…って言わないよ？にゃ。',
  },
};

// ===== ゲーム状態 =====
const state = {
  currentStage: 0,
  selections: {},
};

// ===== DOM =====
const overlay = document.getElementById('overlay');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const choicesArea = document.getElementById('choices-area');
const choicesEl = document.getElementById('choices');
const stageTitle = document.getElementById('stage-title');
const speechText = document.getElementById('speech-text');
const stageDots = document.querySelectorAll('.stage-dot');

// Character parts
const face = document.getElementById('face');
const hairBack = document.getElementById('hair-back');
const hairFront = document.getElementById('hair-front');
const mouth = document.getElementById('mouth');
const blush = document.getElementById('blush');
const outfit = document.getElementById('outfit');
const accessoryEl = document.getElementById('accessory');
const sparklesEl = document.getElementById('sparkles');

// ===== ゲーム開始 =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

function startGame() {
  state.currentStage = 0;
  state.selections = {};

  // キャラクターリセット
  resetCharacter();

  // UI
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  overlay.classList.add('hidden');
  choicesArea.classList.remove('hidden');

  // ステージドットリセット
  stageDots.forEach(dot => {
    dot.classList.remove('active', 'done');
  });
  stageDots[0].classList.add('active');

  speechText.textContent = SPEECH.start;
  renderStage();
}

function resetCharacter() {
  face.className = 'face dirty';
  hairBack.className = 'hair-back dirty';
  hairFront.className = 'hair-front dirty';
  mouth.className = 'mouth sad';
  blush.classList.add('hidden');
  outfit.className = 'outfit dirty';
  accessoryEl.className = 'accessory hidden';
  sparklesEl.classList.add('hidden');

  // 目のキラキラリセット
  document.querySelectorAll('.eye').forEach(eye => {
    eye.classList.remove('sparkle');
  });
}

// ===== ステージ描画 =====
function renderStage() {
  const stage = STAGES[state.currentStage];
  stageTitle.textContent = stage.title;

  choicesEl.innerHTML = '';
  stage.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span class="choice-icon">${choice.icon}</span>
      <span class="choice-label">${choice.label}</span>
    `;
    btn.addEventListener('click', () => selectChoice(choice));
    choicesEl.appendChild(btn);
  });
}

// ===== 選択処理 =====
function selectChoice(choice) {
  const stage = STAGES[state.currentStage];
  state.selections[stage.id] = choice.value;

  // 選択ボタンのハイライト
  document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // キャラクター更新
  applyChoice(stage.id, choice.value);

  // セリフ
  const speech = SPEECH[stage.id];
  if (speech && speech[choice.value]) {
    speechText.textContent = speech[choice.value];
  }

  // キラキラエフェクト
  spawnSparkles();

  // 次のステージへ
  setTimeout(() => {
    advanceStage();
  }, 800);
}

function applyChoice(stageId, value) {
  const character = document.getElementById('character');
  character.classList.add('transforming');
  setTimeout(() => character.classList.remove('transforming'), 600);

  switch (stageId) {
    case 'clean':
      face.classList.remove('dirty');
      face.classList.add('clean');
      hairBack.classList.remove('dirty');
      hairFront.classList.remove('dirty');
      outfit.classList.remove('dirty');
      // 汚れの服をちょっとマシに
      outfit.style.background = '#ccc';
      outfit.style.border = 'none';
      mouth.className = 'mouth neutral';
      if (value === 'broom') {
        // ほうきの場合ぶるぶる
        character.classList.add('washing');
        setTimeout(() => character.classList.remove('washing'), 400);
      }
      if (value === 'shower') {
        character.classList.add('washing');
        setTimeout(() => character.classList.remove('washing'), 400);
      }
      break;

    case 'hair':
      hairBack.className = `hair-back ${value}`;
      hairFront.className = `hair-front ${value}`;
      // デフォルトの色
      hairBack.classList.add('hair-color-brown');
      hairFront.classList.add('hair-color-brown');
      mouth.className = 'mouth smile';
      break;

    case 'haircolor':
      // 前の髪色クラスを除去
      ['hair-color-brown', 'hair-color-black', 'hair-color-pink', 'hair-color-blonde'].forEach(c => {
        hairBack.classList.remove(c);
        hairFront.classList.remove(c);
      });
      hairBack.classList.add(`hair-color-${value}`);
      hairFront.classList.add(`hair-color-${value}`);
      // チーク追加
      blush.classList.remove('hidden');
      break;

    case 'outfit':
      outfit.className = `outfit ${value}`;
      outfit.style.background = '';
      outfit.style.border = '';
      mouth.className = 'mouth big-smile';
      // 目キラキラ
      document.querySelectorAll('.eye').forEach(eye => {
        eye.classList.add('sparkle');
      });
      break;

    case 'accessory':
      accessoryEl.classList.remove('hidden');
      const accessoryEmoji = {
        tiara: '👑',
        flower: '🌸',
        tophat: '🎩',
        catears: '😺',
      };
      accessoryEl.textContent = accessoryEmoji[value] || '✨';

      // アクセサリー位置調整
      if (value === 'tophat') {
        accessoryEl.style.top = '-22px';
        accessoryEl.style.fontSize = '32px';
      } else if (value === 'catears') {
        accessoryEl.style.top = '-15px';
        accessoryEl.style.fontSize = '26px';
      } else {
        accessoryEl.style.top = '-10px';
        accessoryEl.style.fontSize = '28px';
      }
      break;
  }
}

// ===== ステージ進行 =====
function advanceStage() {
  // 現在のステージを完了
  stageDots[state.currentStage].classList.remove('active');
  stageDots[state.currentStage].classList.add('done');

  state.currentStage++;

  if (state.currentStage >= STAGES.length) {
    // ゲーム終了
    showResult();
    return;
  }

  // 次のステージ
  stageDots[state.currentStage].classList.add('active');
  renderStage();
}

// ===== キラキラエフェクト =====
function spawnSparkles() {
  sparklesEl.classList.remove('hidden');
  const particles = ['✨', '⭐', '✦', '💫', '🌟'];

  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle-particle';
    el.textContent = particles[Math.floor(Math.random() * particles.length)];
    el.style.left = `${20 + Math.random() * 60}%`;
    el.style.top = `${20 + Math.random() * 60}%`;
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    sparklesEl.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

// ===== 結果画面 =====
function showResult() {
  choicesArea.classList.add('hidden');

  // スコア計算（選択の面白さで評価）
  const sel = state.selections;

  // 結果の顔文字
  const afterEmojis = {
    'dress-pink': '👸',
    'dress-blue': '💙',
    'dress-gothic': '🖤',
    'dress-kimono': '🎎',
  };
  const afterEmoji = afterEmojis[sel.outfit] || '✨';
  document.getElementById('after-face').textContent = afterEmoji;

  // ランクとコメント（組み合わせで面白コメント）
  let rank, comment;

  if (sel.clean === 'broom' && sel.accessory === 'tophat') {
    rank = '🧹 エレガント清掃員';
    comment = 'ほうきで掃除してシルクハット。新しいジャンルを開拓した。';
  } else if (sel.outfit === 'dress-gothic' && sel.accessory === 'catears') {
    rank = '😈 闇のにゃんこ';
    comment = 'ゴシック×ねこみみ。厨二病が加速している。';
  } else if (sel.outfit === 'dress-kimono' && sel.haircolor === 'blonde') {
    rank = '🌍 異文化コラボ';
    comment = '和洋折衷が過ぎる。でも似合ってる…のか？';
  } else if (sel.outfit === 'dress-pink' && sel.accessory === 'tiara') {
    rank = '👑 完璧なプリンセス';
    comment = 'お姫様テンプレ。王道にして頂点。間違いない。';
  } else if (sel.clean === 'broom') {
    rank = '🧹 力技ビューティー';
    comment = 'ほうきで人を洗うタイプの人、初めて見た。';
  } else if (sel.haircolor === 'pink' && sel.accessory === 'catears') {
    rank = '🎀 推し活ガール';
    comment = 'ピンク髪にねこみみ。VTuberデビューも近い。';
  } else if (sel.outfit === 'dress-gothic') {
    rank = '🌙 ダークビューティー';
    comment = '闇の美しさ。月光が似合いすぎる。';
  } else if (sel.outfit === 'dress-kimono') {
    rank = '🌸 大和撫子';
    comment = '日本の美を体現。お茶会の準備はOK。';
  } else {
    rank = '✨ キラキラ美人';
    comment = '見違えるほどキレイに！道端で拾った甲斐があった。';
  }

  document.getElementById('result-rank').textContent = rank;
  document.getElementById('result-comment').textContent = comment;

  // セリフ
  speechText.textContent = 'ありがとう！生まれ変わった！';

  // 大量キラキラ
  for (let i = 0; i < 3; i++) {
    setTimeout(() => spawnSparkles(), i * 300);
  }

  // 結果画面表示
  setTimeout(() => {
    startScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }, 500);
}
