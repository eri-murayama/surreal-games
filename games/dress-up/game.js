// ===== 多言語対応 =====
let currentLang = (function() {
  try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
  return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
})();

const LANG = {
  ja: {
    stages: [
      { title: 'まずはキレイにしよう！', choices: ['スポンジで\nごしごし', 'シャワーで\nじゃばー', 'ほうきで\nバシバシ'] },
      { title: '髪型をえらぼう！', choices: ['さらさら\nロング', 'すっきり\nショート', 'ぴょこぴょこ\nツインテ', 'おだんご\nヘアー'] },
      { title: '髪の色をえらぼう！', choices: ['ブラウン', 'ブラック', 'ピンク', 'ブロンド'] },
      { title: 'お洋服をえらぼう！', choices: ['ふわふわ\nピンクドレス', 'さわやか\nブルーワンピ', 'ダーク\nゴシック', 'はんなり\nおきもの'] },
      { title: 'アクセサリーをつけよう！', choices: ['ティアラ', 'おはな', 'シルクハット', 'ねこみみ'] },
    ],
    speech: {
      start: '...きたない...',
      clean: { sponge: 'きゅっきゅっ！すべすべ！', shower: 'ひゃっ！冷たい！...でもさっぱり！', broom: 'いたたた！掃除じゃないよ！' },
      hair: { long: 'さらさら～♪いい女度UP！', short: 'すっきり！できる女感！', twin: 'ぴょんぴょん！年齢詐称疑惑！', bun: 'おだんご！和の心！' },
      haircolor: { brown: 'ナチュラルビューティー！', black: '黒髪清楚...に見せかける！', pink: '推しの色にしてみた！', blonde: '異世界転生したみたい！' },
      outfit: { 'dress-pink': 'きゃー！お姫様みたい！', 'dress-blue': '知的で爽やかじゃない？', 'dress-gothic': '闇の力が…目覚める…！', 'dress-kimono': '大和撫子でございます' },
      accessory: { tiara: '私が女王よ！ひれ伏しなさい！', flower: 'お花畑の住人になりました', tophat: '紳士淑女の皆様、ごきげんよう', catears: 'にゃーん…って言わないよ？にゃ。' },
    },
    resultSpeech: 'ありがとう！生まれ変わった！',
    ranks: {
      elegantCleaner: '🧹 エレガント清掃員',
      darkCat: '😈 闇のにゃんこ',
      crossCulture: '🌍 異文化コラボ',
      perfectPrincess: '👑 完璧なプリンセス',
      broomBeauty: '🧹 力技ビューティー',
      oshiGirl: '🎀 推し活ガール',
      darkBeauty: '🌙 ダークビューティー',
      yamato: '🌸 大和撫子',
      sparkleBeauty: '✨ キラキラ美人',
    },
    comments: {
      elegantCleaner: 'ほうきで掃除してシルクハット。新しいジャンルを開拓した。',
      darkCat: 'ゴシック×ねこみみ。厨二病が加速している。',
      crossCulture: '和洋折衷が過ぎる。でも似合ってる…のか？',
      perfectPrincess: 'お姫様テンプレ。王道にして頂点。間違いない。',
      broomBeauty: 'ほうきで人を洗うタイプの人、初めて見た。',
      oshiGirl: 'ピンク髪にねこみみ。VTuberデビューも近い。',
      darkBeauty: '闇の美しさ。月光が似合いすぎる。',
      yamato: '日本の美を体現。お茶会の準備はOK。',
      sparkleBeauty: '見違えるほどキレイに！道端で拾った甲斐があった。',
    },
  },
  en: {
    stages: [
      { title: "Let's clean up first!", choices: ['Scrub with\na sponge', 'Rinse with\na shower', 'Sweep with\na broom'] },
      { title: 'Choose a hairstyle!', choices: ['Silky\nLong', 'Fresh\nShort', 'Bouncy\nTwin tails', 'Round\nBun'] },
      { title: 'Choose hair color!', choices: ['Brown', 'Black', 'Pink', 'Blonde'] },
      { title: 'Choose an outfit!', choices: ['Fluffy\nPink Dress', 'Cool\nBlue One-piece', 'Dark\nGothic', 'Elegant\nKimono'] },
      { title: 'Add an accessory!', choices: ['Tiara', 'Flower', 'Top Hat', 'Cat Ears'] },
    ],
    speech: {
      start: '...so dirty...',
      clean: { sponge: 'Scrub scrub! So smooth!', shower: 'Eek! Cold! ...But refreshing!', broom: 'Ouch ouch! This is not cleaning!' },
      hair: { long: 'So silky~ Attractiveness UP!', short: 'Refreshing! Boss lady vibes!', twin: 'Boing boing! Age fraud suspected!', bun: 'Bun! Traditional spirit!' },
      haircolor: { brown: 'Natural beauty!', black: 'Black hair innocence... or so it seems!', pink: 'Dyed it my fave color!', blonde: 'Like an isekai reincarnation!' },
      outfit: { 'dress-pink': 'Kyaa! Like a princess!', 'dress-blue': "Smart and refreshing, don't you think?", 'dress-gothic': 'The dark power... awakens...!', 'dress-kimono': 'I am a refined lady' },
      accessory: { tiara: "I'm the queen! Bow before me!", flower: 'I have become a flower field resident', tophat: 'Ladies and gentlemen, good day', catears: "Meow... I won't say that! ...Nya." },
    },
    resultSpeech: 'Thank you! I feel reborn!',
    ranks: {
      elegantCleaner: '🧹 Elegant Janitor',
      darkCat: '😈 Dark Kitty',
      crossCulture: '🌍 Cultural Mashup',
      perfectPrincess: '👑 Perfect Princess',
      broomBeauty: '🧹 Brute Force Beauty',
      oshiGirl: '🎀 Fan Girl',
      darkBeauty: '🌙 Dark Beauty',
      yamato: '🌸 Traditional Beauty',
      sparkleBeauty: '✨ Sparkling Beauty',
    },
    comments: {
      elegantCleaner: 'Cleaned with a broom and wore a top hat. A whole new genre.',
      darkCat: 'Gothic x Cat ears. Peak middle school syndrome.',
      crossCulture: 'East meets West... a bit too much. But does it work?',
      perfectPrincess: 'The princess template. Classic and supreme. No arguments.',
      broomBeauty: "First time seeing someone wash a person with a broom.",
      oshiGirl: 'Pink hair + cat ears. VTuber debut incoming.',
      darkBeauty: 'Beauty of darkness. Moonlight suits you too well.',
      yamato: 'Embodiment of traditional beauty. Ready for a tea ceremony.',
      sparkleBeauty: 'Unrecognizably beautiful! Worth picking up from the street.',
    },
  },
};

function t(key) { return LANG[currentLang][key]; }

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('sg_lang', lang); } catch(e) {}
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  window.dispatchEvent(new CustomEvent('surreal-lang-change', { detail: { lang } }));
  // Re-render current stage if in game
  if (!startScreen.classList.contains('hidden') || !resultScreen.classList.contains('hidden')) return;
  if (state.currentStage < STAGES.length) renderStage();
}

window.addEventListener('surreal-lang-change', function(e) {
  if (e.detail && e.detail.lang && e.detail.lang !== currentLang) {
    currentLang = e.detail.lang;
  }
});

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

// ===== 共通モジュール =====
const sg = SurrealGames.init('dress-up');

// ===== ゲーム開始 =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

function startGame() {
  sg.onGameStart();
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

  speechText.textContent = t('speech').start;
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
  const langStage = t('stages')[state.currentStage];
  stageTitle.textContent = langStage.title;

  choicesEl.innerHTML = '';
  stage.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span class="choice-icon">${choice.icon}</span>
      <span class="choice-label">${langStage.choices[idx]}</span>
    `;
    btn.addEventListener('click', () => selectChoice(choice));
    choicesEl.appendChild(btn);
  });
}

// ===== 選択処理 =====
function selectChoice(choice) {
  SurrealGames.SoundSystem.play('tap');
  const stage = STAGES[state.currentStage];
  state.selections[stage.id] = choice.value;

  // 選択ボタンのハイライト
  document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // キャラクター更新
  applyChoice(stage.id, choice.value);

  // セリフ
  const speech = t('speech')[stage.id];
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

  let rankKey;
  if (sel.clean === 'broom' && sel.accessory === 'tophat') {
    rankKey = 'elegantCleaner';
  } else if (sel.outfit === 'dress-gothic' && sel.accessory === 'catears') {
    rankKey = 'darkCat';
  } else if (sel.outfit === 'dress-kimono' && sel.haircolor === 'blonde') {
    rankKey = 'crossCulture';
  } else if (sel.outfit === 'dress-pink' && sel.accessory === 'tiara') {
    rankKey = 'perfectPrincess';
  } else if (sel.clean === 'broom') {
    rankKey = 'broomBeauty';
  } else if (sel.haircolor === 'pink' && sel.accessory === 'catears') {
    rankKey = 'oshiGirl';
  } else if (sel.outfit === 'dress-gothic') {
    rankKey = 'darkBeauty';
  } else if (sel.outfit === 'dress-kimono') {
    rankKey = 'yamato';
  } else {
    rankKey = 'sparkleBeauty';
  }
  rank = t('ranks')[rankKey];
  comment = t('comments')[rankKey];

  document.getElementById('result-rank').textContent = rank;
  document.getElementById('result-comment').textContent = comment;

  // セリフ
  speechText.textContent = t('resultSpeech');

  // 大量キラキラ
  for (let i = 0; i < 3; i++) {
    setTimeout(() => spawnSparkles(), i * 300);
  }

  // 結果画面表示
  setTimeout(() => {
    startScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    overlay.classList.remove('hidden');
    sg.onGameEnd();
  }, 500);
}
