// ===== 軽量サウンドシステム =====
const Sound = {
  ctx: null,
  enabled: true,
  volume: 0.5,
  bgmPlaying: false,
  bgmNodes: [],
  bgmTimers: [],
  bgmSpeedMultiplier: 1.0,
  bgmGain: null,

  _ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!this.bgmGain && this.ctx) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  init() {
    const initAudio = () => {
      this._ensureCtx();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('pointerdown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('pointerdown', initAudio);
  },

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stopBgm();
    return this.enabled;
  },

  play(type) {
    if (!this.enabled) return;
    this._ensureCtx();
    if (!this.ctx) return;
    if (this.ctx.state !== 'running') {
      this.ctx.resume().then(() => this._playSound(type));
      return;
    }
    this._playSound(type);
  },

  _playSound(type) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = this.volume;

    switch (type) {
      case 'hit': {
        const oscHigh = ctx.createOscillator();
        const gainHigh = ctx.createGain();
        oscHigh.type = 'square';
        oscHigh.frequency.setValueAtTime(800, now);
        oscHigh.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gainHigh.gain.setValueAtTime(this.volume * 0.5, now);
        gainHigh.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        oscHigh.connect(gainHigh);
        gainHigh.connect(ctx.destination);
        oscHigh.start(now);
        oscHigh.stop(now + 0.07);
        const oscMid = ctx.createOscillator();
        const gainMid = ctx.createGain();
        oscMid.type = 'triangle';
        oscMid.frequency.setValueAtTime(400, now);
        oscMid.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gainMid.gain.setValueAtTime(this.volume * 0.6, now);
        gainMid.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        oscMid.connect(gainMid);
        gainMid.connect(ctx.destination);
        oscMid.start(now);
        oscMid.stop(now + 0.13);
        const bufSize = ctx.sampleRate * 0.05;
        const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        noise.buffer = noiseBuf;
        noiseGain.gain.setValueAtTime(this.volume * 0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);
        break;
      }
      case 'start': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.12);
        osc.frequency.setValueAtTime(659, now + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'result': {
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.value = this.volume * 0.3;
          g.gain.exponentialRampToValueAtTime(0.01, now + 0.15 * (i + 1) + 0.15);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now + 0.15 * i);
          osc.stop(now + 0.15 * (i + 1) + 0.15);
        });
        break;
      }
    }
  },

  // BGM（popプリセット）
  _bgmPreset: {
    tempo: 160, wave: 'triangle', volume: 0.08,
    melody: [
      1047, 1175, 1319, 1568, 1319, 1175, 1047, 1175,
      1319, 1568, 1760, 1568, 1319, 1175, 1047, 1319,
      880, 1047, 1175, 1319, 1175, 1047, 880, 1047,
      1175, 1319, 1568, 1319, 1175, 1047, 1175, 1047,
    ],
    bass: [
      523, 523, 659, 659, 784, 784, 659, 659,
      523, 523, 659, 659, 784, 784, 523, 523,
      440, 440, 523, 523, 587, 587, 523, 523,
      440, 440, 523, 523, 440, 440, 523, 523,
    ],
    swing: [
      0.8, 0.7, 0.6, 1.2, 0.8, 0.7, 0.6, 1.3,
      0.7, 0.6, 0.6, 1.2, 0.8, 0.7, 0.6, 1.4,
      0.9, 0.8, 0.7, 1.3, 0.8, 0.7, 0.9, 1.2,
      0.7, 0.6, 0.6, 1.3, 0.8, 0.7, 0.8, 1.5,
    ]
  },

  playBgm() {
    if (!this.enabled) return;
    this._ensureCtx();
    if (!this.ctx) return;
    this.stopBgm();
    this.bgmPlaying = true;
    if (this.ctx.state !== 'running') {
      this.ctx.resume().then(() => { if (this.bgmPlaying) this._loopBgm(); });
    } else {
      this._loopBgm();
    }
  },

  _loopBgm() {
    if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const preset = this._bgmPreset;
    const bgmDest = this.bgmGain || ctx.destination;
    const now = ctx.currentTime;
    const baseBeat = (60 / preset.tempo) / (this.bgmSpeedMultiplier || 1.0);
    const vol = preset.volume;
    const swing = preset.swing;

    const offsets = [];
    let t = 0;
    for (let i = 0; i < preset.melody.length; i++) {
      offsets.push(t);
      t += baseBeat * (swing ? swing[i] : 1);
    }
    const totalDur = t;

    preset.melody.forEach((freq, i) => {
      if (!freq) return;
      const noteDur = baseBeat * (swing ? swing[i] : 1);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = preset.wave;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, now + offsets[i]);
      g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
      osc.connect(g);
      g.connect(bgmDest);
      osc.start(now + offsets[i]);
      osc.stop(now + offsets[i] + noteDur * 0.95);
      this.bgmNodes.push(osc);
    });

    preset.bass.forEach((freq, i) => {
      if (!freq) return;
      const noteDur = baseBeat * (swing ? swing[i] : 1);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol * 0.5, now + offsets[i]);
      g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
      osc.connect(g);
      g.connect(bgmDest);
      osc.start(now + offsets[i]);
      osc.stop(now + offsets[i] + noteDur * 0.95);
      this.bgmNodes.push(osc);
    });

    const timer = setTimeout(() => {
      if (this.bgmPlaying) this._loopBgm();
    }, totalDur * 1000);
    this.bgmTimers.push(timer);
  },

  stopBgm() {
    this.bgmPlaying = false;
    this.bgmSpeedMultiplier = 1.0;
    this.bgmNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.bgmNodes = [];
    this.bgmTimers.forEach(t => clearTimeout(t));
    this.bgmTimers = [];
  },

  setBgmSpeed(multiplier) {
    this.bgmSpeedMultiplier = multiplier;
  }
};

Sound.init();

// モバイルでは pointerdown でも AudioContext を初期化する
document.addEventListener('pointerdown', function initAudioOnPointer() {
  Sound._ensureCtx();
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

  Sound.play('start');
  Sound.playBgm();
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

    // BGMテンポを難易度に合わせて加速
    const progress = 1 - state.timeLeft / GAME_DURATION;
    Sound.setBgmSpeed(1.0 + progress * 0.6);

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
    Sound.play('hit');
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
  Sound.stopBgm();
  Sound.play('result');

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
    comment = '夢の中でもトップクラスのヤクザ退治能力。';
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

  // リトライボタンを一定時間無効化（誤クリック防止）
  retryBtn.disabled = true;
  retryBtn.classList.add('btn-disabled');
  setTimeout(() => {
    retryBtn.disabled = false;
    retryBtn.classList.remove('btn-disabled');
  }, 2000);
}
