// ===== 多言語対応 =====
let currentLang = (function() {
  try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
  return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
})();

const LANG = {
  ja: {
    title: '🦀 かにかにパニック！ 🦀<br><span style="font-size:0.5em;opacity:0.8;">‐カニみそが飛び出ちゃう‐</span>',
    subtitle: '夢の中のヤクザ「かにかに」を叩け！腹筋は毎日換気するよ！',
    score: 'スコア',
    timeLeft: '残り時間',
    combo: 'コンボ',
    startTitle: 'かにかにパニック！<br><span style="font-size:0.6em;opacity:0.8;">‐カニみそが飛び出ちゃう‐</span>',
    startDesc: '穴から出てくる「かにかに」を<br>叩きまくれ！制限時間30秒！',
    startBtn: 'ゲームスタート',
    endTitle: '終了〜！',
    retryBtn: 'もう一回やる',
    shareBtn: 'Xでシェアする',
    backToTop: '← トップに戻る',
    painLines: ['いたい…', 'なんで…？', 'ひどいよ…', 'やめて…', 'うう…', 'ぼくが何したの…', 'いたいよぉ…', 'もうやだ…', 'ごめんなさい…'],
    missTexts: ['スカッ', 'ハズレ〜', '空振り！', 'おしい？'],
    resultScore: (s, c) => `${s}点（最大コンボ: ${c}）`,
    ranks: [
      { min: 3000, rank: '👑 かにかにマスター', comment: '腹筋の換気が完璧すぎる……！' },
      { min: 2000, rank: '🦀 かにかに番長', comment: '夢の中でもトップクラスのヤクザ退治能力。' },
      { min: 1000, rank: '🔨 叩き屋見習い', comment: 'まあまあやるじゃん。かにかにも少しビビってた。' },
      { min: 500, rank: '🌸 お散歩レベル', comment: 'かにかにに「もうちょっと頑張れば？」って言われてるよ。' },
      { min: 0, rank: '😴 寝てた？', comment: 'かにかにが心配してこっち見てる。' },
    ],
    bubble1: '腹筋は<br>毎日換気！',
    bubble2: '叩いても<br>また出るよ！',
  },
  en: {
    title: '🦀 Kani-Kani Panic! 🦀',
    subtitle: 'Whack the yakuza crab "Kani-Kani" from your dreams!',
    score: 'Score',
    timeLeft: 'Time',
    combo: 'Combo',
    startTitle: 'Kani-Kani Panic!',
    startDesc: 'Whack the crabs popping out<br>of the holes! 30 seconds!',
    startBtn: 'START',
    endTitle: "Time's Up!",
    retryBtn: 'Play Again',
    shareBtn: 'Share on X',
    backToTop: '← Back to Top',
    painLines: ['Ouch…', 'Why…?', 'So mean…', 'Stop it…', 'Oww…', 'What did I do…', 'It hurts…', 'No more…', "I'm sorry…"],
    missTexts: ['Whiff!', 'Miss~', 'Swing!', 'So close?'],
    resultScore: (s, c) => `${s} pts (Max Combo: ${c})`,
    ranks: [
      { min: 3000, rank: '👑 Kani-Kani Master', comment: 'Your crab-whacking skills are legendary!' },
      { min: 2000, rank: '🦀 Kani-Kani Boss', comment: 'Top-tier yakuza crab hunter!' },
      { min: 1000, rank: '🔨 Apprentice Whacker', comment: 'Not bad! Even Kani-Kani was a bit scared.' },
      { min: 500, rank: '🌸 Casual Stroll', comment: 'Kani-Kani says "Try a little harder?"' },
      { min: 0, rank: '😴 Were you sleeping?', comment: 'Kani-Kani is worried about you.' },
    ],
    bubble1: 'Abs need<br>daily air!',
    bubble2: 'Hit me and<br>I come back!',
  },
};

const sg = SurrealGames.init('whack-kanikani');

function t(key) { return LANG[currentLang][key]; }

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('sg_lang', lang); } catch(e) {}
  document.title = lang === 'ja' ? 'かにかにパニック！ ‐カニみそが飛び出ちゃう‐' : 'Kani-Kani Panic! - Whack-a-Crab';
  window.dispatchEvent(new CustomEvent('surreal-lang-change', { detail: { lang } }));

  // タイトル
  document.querySelector('.game-title').innerHTML = t('title');
  document.querySelector('.game-subtitle').textContent = t('subtitle');

  // HUD
  const hudLabels = document.querySelectorAll('.hud-label');
  hudLabels[0].textContent = t('score');
  hudLabels[1].textContent = t('timeLeft');
  hudLabels[2].textContent = t('combo');

  // オーバーレイ
  document.querySelector('#start-screen h2').innerHTML = t('startTitle');
  document.querySelector('#start-screen p').innerHTML = t('startDesc');
  document.getElementById('start-btn').textContent = t('startBtn');
  document.querySelector('#result-screen h2').textContent = t('endTitle');
  document.getElementById('retry-btn').textContent = t('retryBtn');

  // 戻るリンク
  document.querySelector('.back-to-top-link').textContent = t('backToTop');

  // 吹き出し
  const b1 = document.querySelector('.deco-bubble--1');
  const b2 = document.querySelector('.deco-bubble--2');
  if (b1) b1.innerHTML = t('bubble1');
  if (b2) b2.innerHTML = t('bubble2');

  // 言語ボタン
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // ハイスコア表示更新
  updateHighScoreDisplay();
}

// ===== モバイル AudioContext 初期化 =====
// モバイルでは pointerdown でも AudioContext を初期化する必要がある
document.addEventListener('pointerdown', function initAudioOnPointer() {
  SurrealGames.SoundSystem._ensureCtx();
  document.removeEventListener('pointerdown', initAudioOnPointer);
}, { once: true });

// ===== カスタムカーソル =====
const customCursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
  customCursor.style.left = e.clientX + 'px';
  customCursor.style.top = e.clientY + 'px';
});

document.addEventListener('pointerdown', () => {
  customCursor.classList.add('swing');
  setTimeout(() => customCursor.classList.remove('swing'), 100);
});

// ===== 痛みセリフ =====
function spawnPainText(x, y) {
  const lines = t('painLines');
  const el = document.createElement('div');
  el.className = 'pain-text';
  el.textContent = lines[Math.floor(Math.random() * lines.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y - 30}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ===== ゲーム設定 =====
const GAME_DURATION = 30;
const BASE_SHOW_TIME = 1200;
const MIN_SHOW_TIME = 400;
const BASE_INTERVAL = 1000;
const MIN_INTERVAL = 350;

// ===== ゲーム状態 =====
const state = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  timeLeft: GAME_DURATION,
  running: false,
  activeHoles: new Set(),
  timers: [],
};

// ===== DOM =====
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const comboEl = document.getElementById('combo');
const board = document.getElementById('board');
const overlay = document.getElementById('overlay');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const hitEffects = document.getElementById('hit-effects');
const holes = document.querySelectorAll('.hole');

// ===== ゲーム開始 =====
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

function startGame() {
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.timeLeft = GAME_DURATION;
  state.running = true;
  state.activeHoles.clear();

  scoreEl.textContent = '0';
  timerEl.textContent = GAME_DURATION;
  comboEl.textContent = '0';
  timerEl.classList.remove('urgent');

  holes.forEach(h => {
    h.classList.remove('active', 'hit');
  });

  // 前回のNEW RECORDバッジを削除
  const oldRecord = document.querySelector('.sg-new-record');
  if (oldRecord) oldRecord.remove();

  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  overlay.classList.add('hidden');

  sg.onGameStart();
  startCountdown();
  scheduleNextMole();
}

// ===== カウントダウン =====
function startCountdown() {
  const interval = setInterval(() => {
    if (!state.running) {
      clearInterval(interval);
      return;
    }

    state.timeLeft--;
    timerEl.textContent = state.timeLeft;

    // BGMテンポを難易度に合わせて加速（残り時間に応じて1.0→1.6倍速）
    const progress = 1 - state.timeLeft / GAME_DURATION;
    SurrealGames.SoundSystem.setBgmSpeed(1.0 + progress * 0.6);

    if (state.timeLeft <= 10) {
      timerEl.classList.add('urgent');
    }

    if (state.timeLeft <= 0) {
      clearInterval(interval);
      endGame();
    }
  }, 1000);
  state.timers.push(interval);
}

// ===== もぐら出現スケジュール =====
function scheduleNextMole() {
  if (!state.running) return;

  const progress = 1 - state.timeLeft / GAME_DURATION;
  const interval = Math.max(MIN_INTERVAL, BASE_INTERVAL - progress * 600);
  const jitter = (Math.random() - 0.5) * 300;

  setTimeout(() => {
    if (!state.running) return;
    showMole();
    scheduleNextMole();
  }, interval + jitter);
}

function showMole() {
  const available = [];
  holes.forEach((hole, i) => {
    if (!state.activeHoles.has(i)) available.push(i);
  });

  if (available.length === 0) return;

  const index = available[Math.floor(Math.random() * available.length)];
  const hole = holes[index];

  state.activeHoles.add(index);
  hole.classList.remove('hit');
  hole.classList.add('active');

  const progress = 1 - state.timeLeft / GAME_DURATION;
  const showTime = Math.max(MIN_SHOW_TIME, BASE_SHOW_TIME - progress * 700);

  setTimeout(() => {
    if (state.activeHoles.has(index) && !hole.classList.contains('hit')) {
      hole.classList.remove('active');
      state.activeHoles.delete(index);
      // ミス：コンボリセット
      if (state.running && state.combo > 0) {
        state.combo = 0;
        comboEl.textContent = '0';
      }
    }
  }, showTime);
}

// ===== 穴クリック =====
board.addEventListener('pointerdown', (e) => {
  if (!state.running) return;

  const hole = e.target.closest('.hole');
  if (!hole) return;

  const index = parseInt(hole.dataset.index);
  const rect = hole.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top;

  if (state.activeHoles.has(index) && hole.classList.contains('active')) {
    // ヒット！
    SurrealGames.SoundSystem.play('hit');
    hole.classList.remove('active');
    hole.classList.add('hit');
    state.activeHoles.delete(index);

    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    // コンボボーナス
    const comboBonus = Math.floor(state.combo / 3);
    const points = 100 + comboBonus * 50;
    state.score += points;

    scoreEl.textContent = state.score;
    comboEl.textContent = state.combo;

    // エフェクト
    spawnHitText(x, y, points, state.combo >= 3);
    spawnPainText(x, y);
    shakeScreen();

    setTimeout(() => {
      hole.classList.remove('hit');
    }, 400);
  } else {
    // ミスクリック
    spawnMissText(x, y);
  }
});

// ===== エフェクト =====
function spawnHitText(x, y, points, isCombo) {
  const el = document.createElement('div');
  el.className = isCombo ? 'hit-text combo' : 'hit-text';
  el.textContent = isCombo ? `+${points} 🔥x${state.combo}` : `+${points}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = 'translateX(-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function spawnMissText(x, y) {
  const texts = t('missTexts');
  const el = document.createElement('div');
  el.className = 'miss-text';
  el.textContent = texts[Math.floor(Math.random() * texts.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = 'translateX(-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function shakeScreen() {
  // body に適用（game-wrapper の transform: scale() と競合しないように）
  document.body.classList.remove('screen-shake');
  void document.body.offsetWidth;
  document.body.classList.add('screen-shake');
}

// ===== ゲーム終了 =====
function endGame() {
  state.running = false;

  holes.forEach(h => {
    h.classList.remove('active', 'hit');
  });
  state.activeHoles.clear();

  const score = state.score;
  const maxCombo = state.maxCombo;

  const ranks = t('ranks');
  const matched = ranks.find(r => score >= r.min);

  // 死因判定: スコアに応じて死に方図鑑へ登録
  let deathType = 'low_score';
  if (score >= 80) deathType = 'perfect';
  else if (score >= 1) deathType = 'timeup';
  const { isNewHigh } = sg.onGameEnd(state.score, { maxCombo: state.maxCombo, deathType });

  document.getElementById('result-score').textContent = t('resultScore')(score, maxCombo);
  document.getElementById('result-rank').textContent = matched.rank;
  document.getElementById('result-comment').textContent = matched.comment;

  if (isNewHigh) {
    const newRecordEl = document.createElement('div');
    newRecordEl.className = 'sg-new-record';
    newRecordEl.textContent = '\uD83C\uDF89 NEW RECORD!';
    const resultScoreEl = document.getElementById('result-score');
    resultScoreEl.parentNode.insertBefore(newRecordEl, resultScoreEl);
  }

  // シェアボタンを追加（既存のものがあれば削除）
  const existingShareBtn = document.getElementById('share-btn');
  if (existingShareBtn) existingShareBtn.remove();

  const shareBtn = document.createElement('button');
  shareBtn.id = 'share-btn';
  shareBtn.textContent = t('shareBtn');
  shareBtn.style.cssText = 'display:block; margin:10px auto; padding:10px 24px; font-size:1rem; font-family:inherit; border:none; border-radius:12px; background:#000; color:#fff; cursor:pointer; font-weight:700; transition:transform 0.1s;';
  shareBtn.addEventListener('mouseenter', () => { shareBtn.style.transform = 'scale(1.05)'; });
  shareBtn.addEventListener('mouseleave', () => { shareBtn.style.transform = 'scale(1)'; });
  shareBtn.addEventListener('click', () => {
    const gameURL = window.location.href;
    const shareText = currentLang === 'ja'
      ? `🦀 かにかにパニック！ ‐カニみそが飛び出ちゃう‐\nスコア: ${score}点（最大コンボ: ${maxCombo}）\nランク: ${matched.rank}\n\n#シュールゲームス\n${gameURL}`
      : `🦀 Kani-Kani Panic!\nScore: ${score} pts (Max Combo: ${maxCombo})\nRank: ${matched.rank}\n\n#SurrealGames\n${gameURL}`;
    const twitterURL = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterURL, '_blank');
  });
  retryBtn.parentNode.insertBefore(shareBtn, retryBtn);

  startScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // リトライボタンを一定時間無効化（誤クリック防止）
  retryBtn.disabled = true;
  retryBtn.classList.add('btn-disabled');
  setTimeout(() => {
    retryBtn.disabled = false;
    retryBtn.classList.remove('btn-disabled');
  }, 2000);

  // ハイスコア表示を更新
  updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
  const highScore = sg.getHighScore();
  const el = document.getElementById('sg-high-score-display');
  if (highScore && el) {
    const label = currentLang === 'en' ? '🏆 HIGH SCORE: ' : '🏆 ハイスコア: ';
    el.textContent = label + highScore;
    el.style.display = 'block';
  }
}

// 初期表示時に保存された言語設定を適用
setLang(currentLang);
// ハイスコアを表示
updateHighScoreDisplay();
