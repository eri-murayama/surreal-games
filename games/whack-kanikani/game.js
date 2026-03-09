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
const painLines = [
  'いたい…', 'なんで…？', 'ひどいよ…',
  'やめて…', 'うう…', 'ぼくが何したの…',
  'いたいよぉ…', 'もうやだ…', 'ごめんなさい…',
];

function spawnPainText(x, y) {
  const el = document.createElement('div');
  el.className = 'pain-text';
  el.textContent = painLines[Math.floor(Math.random() * painLines.length)];
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

  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  overlay.classList.add('hidden');

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
  const texts = ['スカッ', 'ハズレ〜', '空振り！', 'おしい？'];
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
  const wrapper = document.getElementById('game-wrapper');
  wrapper.classList.remove('screen-shake');
  void wrapper.offsetWidth;
  wrapper.classList.add('screen-shake');
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

  let rank, comment;
  if (score >= 3000) {
    rank = '👑 かにかにマスター';
    comment = '腹筋の換気が完璧すぎる……！';
  } else if (score >= 2000) {
    rank = '🦀 かにかに番長';
    comment = '夢の国でもトップクラスのヤクザ退治能力。';
  } else if (score >= 1000) {
    rank = '🔨 叩き屋見習い';
    comment = 'まあまあやるじゃん。かにかにも少しビビってた。';
  } else if (score >= 500) {
    rank = '🌸 お散歩レベル';
    comment = 'かにかにに「もうちょっと頑張れば？」って言われてるよ。';
  } else {
    rank = '😴 寝てた？';
    comment = 'かにかにが心配してこっち見てる。';
  }

  document.getElementById('result-score').textContent = `${score}点（最大コンボ: ${maxCombo}）`;
  document.getElementById('result-rank').textContent = rank;
  document.getElementById('result-comment').textContent = comment;

  startScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  overlay.classList.remove('hidden');
}
