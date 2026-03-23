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

// ===== Pain lines =====
const painLines = [
  'Ouch...', 'Why...?', 'So mean...',
  'Stop it...', 'Ugh...', 'What did I do...',
  'It hurts...', 'No more...', 'I\'m sorry...',
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

// ===== Game settings =====
const GAME_DURATION = 30;
const BASE_SHOW_TIME = 1200;
const MIN_SHOW_TIME = 400;
const BASE_INTERVAL = 1000;
const MIN_INTERVAL = 350;

// ===== Game state =====
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

// ===== Start game =====
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

// ===== Countdown =====
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

// ===== Mole spawn schedule =====
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
      // Miss: reset combo
      if (state.running && state.combo > 0) {
        state.combo = 0;
        comboEl.textContent = '0';
      }
    }
  }, showTime);
}

// ===== Hole click =====
board.addEventListener('pointerdown', (e) => {
  if (!state.running) return;

  const hole = e.target.closest('.hole');
  if (!hole) return;

  const index = parseInt(hole.dataset.index);
  const rect = hole.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top;

  if (state.activeHoles.has(index) && hole.classList.contains('active')) {
    // Hit!
    hole.classList.remove('active');
    hole.classList.add('hit');
    state.activeHoles.delete(index);

    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    // Combo bonus
    const comboBonus = Math.floor(state.combo / 3);
    const points = 100 + comboBonus * 50;
    state.score += points;

    scoreEl.textContent = state.score;
    comboEl.textContent = state.combo;

    // Effects
    spawnHitText(x, y, points, state.combo >= 3);
    spawnPainText(x, y);
    shakeScreen();

    setTimeout(() => {
      hole.classList.remove('hit');
    }, 400);
  } else {
    // Miss click
    spawnMissText(x, y);
  }
});

// ===== Effects =====
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
  const texts = ['Whiff!', 'Miss~', 'Swing & miss!', 'So close?'];
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

// ===== Game over =====
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
    rank = '👑 Crab Master';
    comment = 'Your abs are perfectly ventilated...!';
  } else if (score >= 2000) {
    rank = '🦀 Crab Boss';
    comment = 'Top-tier yakuza crab exterminator, even in dreams.';
  } else if (score >= 1000) {
    rank = '🔨 Whacker Apprentice';
    comment = 'Not bad. The crab was a little scared.';
  } else if (score >= 500) {
    rank = '🌸 Casual Stroller';
    comment = 'The crab says "Maybe try a bit harder?"';
  } else {
    rank = '😴 Were You Sleeping?';
    comment = 'The crab is worried and staring at you.';
  }

  document.getElementById('result-score').textContent = `${score} pts (Max Combo: ${maxCombo})`;
  document.getElementById('result-rank').textContent = rank;
  document.getElementById('result-comment').textContent = comment;

  startScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // Disable retry button briefly to prevent accidental clicks
  retryBtn.disabled = true;
  retryBtn.classList.add('btn-disabled');
  setTimeout(() => {
    retryBtn.disabled = false;
    retryBtn.classList.remove('btn-disabled');
  }, 2000);
}
