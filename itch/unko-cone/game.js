// ========================================
// Poopsicle Catcher
// itch.io version (English only)
// ========================================

(function () {
  'use strict';

  // ===== Built-in Sound System =====
  const BGM_PRESETS = {
    nohohon: {
      tempo: 80, key: 'C', wave: 'sine', volume: 0.09,
      melody: [523,0,659,0,587,523,0,494,523,0,659,784,0,659,0,523,440,0,523,0,494,440,0,392,440,0,523,587,0,523,0,440],
      bass: [262,0,262,0,294,0,294,0,262,0,262,0,330,0,262,0,220,0,220,0,247,0,247,0,220,0,220,0,262,0,220,0],
      swing: [1.2,0.8,1.2,0.8,1.3,1.0,0.8,0.9,1.2,0.8,1.0,1.3,0.8,1.0,0.8,1.2,1.2,0.8,1.2,0.8,1.3,1.0,0.8,0.9,1.2,0.8,1.0,1.3,0.8,1.0,0.8,1.2]
    },
    march: {
      tempo: 140, key: 'C', wave: 'triangle', volume: 0.10,
      melody: [523,523,659,784,784,659,523,784,880,880,784,659,523,659,784,1047,698,698,880,1047,1047,880,698,880,784,659,523,659,784,1047,880,784],
      bass: [131,196,131,196,131,196,131,196,175,262,175,262,131,196,131,262,175,262,175,262,196,294,196,294,131,196,131,196,196,262,196,131],
      farts: [0,0,0,1,0,0,2,0,0,0,1,0,0,2,0,3,0,0,0,1,0,0,2,0,1,0,0,2,0,1,0,3]
    }
  };

  const SoundSystem = {
    ctx: null, enabled: true, volume: 0.5,
    bgmPlaying: false, bgmNodes: [], bgmTimers: [], bgmGain: null,
    currentBgmPreset: null, bgmSpeedMultiplier: 1.0,

    init() {
      const self = this;
      const initAudio = () => {
        if (!self.ctx) self.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (!self.bgmGain && self.ctx) { self.bgmGain = self.ctx.createGain(); self.bgmGain.connect(self.ctx.destination); }
        if (self.ctx && self.ctx.state === 'suspended') self.ctx.resume();
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
      const saved = localStorage.getItem('sg_sound_enabled');
      if (saved !== null) self.enabled = saved === 'true';
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('sg_sound_enabled', this.enabled);
      if (!this.enabled) this.stopBgm();
      return this.enabled;
    },

    _ensureCtx() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!this.bgmGain && this.ctx) { this.bgmGain = this.ctx.createGain(); this.bgmGain.connect(this.ctx.destination); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    playBgm(presetName) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      const preset = BGM_PRESETS[presetName];
      if (!preset) return;
      this.stopBgm();
      this.currentBgmPreset = presetName;
      this.bgmPlaying = true;
      if (this.ctx.state !== 'running') {
        this.ctx.resume().then(() => { if (this.bgmPlaying) this._loopBgm(preset); });
      } else {
        this._loopBgm(preset);
      }
    },

    _loopBgm(preset) {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      const ctx = this.ctx;
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
        osc.connect(g); g.connect(bgmDest);
        osc.start(now + offsets[i]); osc.stop(now + offsets[i] + noteDur * 0.95);
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
        osc.connect(g); g.connect(bgmDest);
        osc.start(now + offsets[i]); osc.stop(now + offsets[i] + noteDur * 0.95);
        this.bgmNodes.push(osc);
      });

      if (preset.farts) {
        preset.farts.forEach((type, i) => {
          if (!type) return;
          const st = now + offsets[i];
          if (type === 1) {
            const dur = 0.18;
            const len = ctx.sampleRate * dur;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            const tight = 40 + Math.random() * 25;
            for (let j = 0; j < len; j++) {
              const tt = j / ctx.sampleRate;
              const env = Math.min(1, tt / 0.015) * Math.max(0, 1 - tt / dur);
              const lip = Math.tanh(Math.sin(tt * tight * Math.PI * 2) * 3) * 0.5;
              const air = (Math.random() * 2 - 1) * 0.2;
              d[j] = (lip + air) * env * (0.6 + 0.4 * Math.sin(tt * 10 * Math.PI * 2));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 300; flt.Q.value = 2;
            const g = ctx.createGain(); g.gain.value = vol * 4;
            src.connect(flt); flt.connect(g); g.connect(bgmDest);
            src.start(st); src.stop(st + dur);
            this.bgmNodes.push(src);
          } else if (type === 2) {
            const osc = ctx.createOscillator(); const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, st); osc.frequency.exponentialRampToValueAtTime(70, st + 0.08);
            g.gain.setValueAtTime(vol * 5, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.1);
            osc.connect(g); g.connect(bgmDest); osc.start(st); osc.stop(st + 0.1);
            this.bgmNodes.push(osc);
            const bOsc = ctx.createOscillator(); const bMod = ctx.createOscillator();
            const bModG = ctx.createGain(); const bG = ctx.createGain();
            bMod.frequency.value = 22; bModG.gain.value = 60;
            bMod.connect(bModG); bModG.connect(bOsc.frequency);
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(120, st + 0.04); bOsc.frequency.exponentialRampToValueAtTime(50, st + 0.15);
            bG.gain.setValueAtTime(vol * 3, st + 0.04); bG.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
            bOsc.connect(bG); bG.connect(bgmDest);
            bMod.start(st + 0.04); bOsc.start(st + 0.04);
            bMod.stop(st + 0.18); bOsc.stop(st + 0.18);
            this.bgmNodes.push(bOsc); this.bgmNodes.push(bMod);
          } else if (type === 3) {
            const dur = 0.4;
            const len = ctx.sampleRate * dur;
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            const bp = 32 + Math.random() * 15;
            for (let j = 0; j < len; j++) {
              const tt = j / ctx.sampleRate;
              const pitch = bp + tt * 30 + Math.sin(tt * 4) * 6;
              const stut = 0.3 + 0.7 * Math.abs(Math.sin(tt * 10 * Math.PI * 2));
              const env = Math.min(1, tt / 0.03) * Math.max(0, 1 - Math.pow(tt / dur, 2)) * stut;
              const lip = Math.tanh(Math.sin(tt * pitch * Math.PI * 2) * 4) * 0.4;
              const sub = Math.sin(tt * pitch * 0.5 * Math.PI * 2) * 0.25;
              const air = (Math.random() * 2 - 1) * (0.1 + tt * 0.25);
              d[j] = (lip + sub + air) * env;
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
            flt.frequency.setValueAtTime(250, st); flt.frequency.linearRampToValueAtTime(400, st + 0.25);
            flt.frequency.linearRampToValueAtTime(160, st + dur); flt.Q.value = 2.5;
            const g = ctx.createGain(); g.gain.value = vol * 4.5;
            src.connect(flt); flt.connect(g); g.connect(bgmDest);
            src.start(st); src.stop(st + dur);
            this.bgmNodes.push(src);
          }
        });
      }

      const timer = setTimeout(() => { if (this.bgmPlaying) this._loopBgm(preset); }, totalDur * 1000);
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

    setBgmSpeed(multiplier) { this.bgmSpeedMultiplier = multiplier; },

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
        case 'plop': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
          gain.gain.setValueAtTime(this.volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain); osc.start(now); osc.stop(now + 0.12);
          break;
        }
        case 'fart': {
          const dur = 0.18;
          const len = ctx.sampleRate * dur;
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const d = buf.getChannelData(0);
          const tight = 40 + Math.random() * 25;
          for (let j = 0; j < len; j++) {
            const tt = j / ctx.sampleRate;
            const env = Math.min(1, tt / 0.015) * Math.max(0, 1 - tt / dur);
            const lip = Math.tanh(Math.sin(tt * tight * Math.PI * 2) * 3) * 0.5;
            const air = (Math.random() * 2 - 1) * 0.2;
            d[j] = (lip + air) * env * (0.6 + 0.4 * Math.sin(tt * 10 * Math.PI * 2));
          }
          const src = ctx.createBufferSource(); src.buffer = buf;
          const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 300; flt.Q.value = 2;
          const g = ctx.createGain(); g.gain.value = this.volume * 0.6;
          src.connect(flt); flt.connect(g); g.connect(ctx.destination);
          src.start(now); src.stop(now + dur);
          break;
        }
        case 'fart_long': {
          const dur = 0.4;
          const len = ctx.sampleRate * dur;
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const d = buf.getChannelData(0);
          const bp = 32 + Math.random() * 15;
          for (let j = 0; j < len; j++) {
            const tt = j / ctx.sampleRate;
            const pitch = bp + tt * 30 + Math.sin(tt * 4) * 6;
            const stut = 0.3 + 0.7 * Math.abs(Math.sin(tt * 10 * Math.PI * 2));
            const env = Math.min(1, tt / 0.03) * Math.max(0, 1 - Math.pow(tt / dur, 2)) * stut;
            const lip = Math.tanh(Math.sin(tt * pitch * Math.PI * 2) * 4) * 0.4;
            const sub = Math.sin(tt * pitch * 0.5 * Math.PI * 2) * 0.25;
            const air = (Math.random() * 2 - 1) * (0.1 + tt * 0.25);
            d[j] = (lip + sub + air) * env;
          }
          const src = ctx.createBufferSource(); src.buffer = buf;
          const flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
          flt.frequency.setValueAtTime(250, now); flt.frequency.linearRampToValueAtTime(400, now + 0.25);
          flt.frequency.linearRampToValueAtTime(160, now + dur); flt.Q.value = 2.5;
          const g = ctx.createGain(); g.gain.value = this.volume * 0.6;
          src.connect(flt); flt.connect(g); g.connect(ctx.destination);
          src.start(now); src.stop(now + dur);
          break;
        }
        case 'splat': {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
          gain.gain.value = this.volume * 0.5;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain); osc.start(now); osc.stop(now + 0.4);
          break;
        }
      }
    }
  };

  SoundSystem.init();

  // ===== Sound Toggle Button =====
  (function createSoundToggle() {
    const btn = document.createElement('button');
    btn.textContent = SoundSystem.enabled ? '🔊' : '🔇';
    btn.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:5000;width:40px;height:40px;border:none;border-radius:50%;background:rgba(0,0,0,0.5);color:#fff;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
    btn.addEventListener('click', () => {
      const on = SoundSystem.toggle();
      btn.textContent = on ? '🔊' : '🔇';
    });
    document.body.appendChild(btn);
  })();

  // ===== High Score =====
  const GAME_ID = 'unko-cone';
  function getHighScore() {
    try { return parseInt(localStorage.getItem('sg_high_' + GAME_ID)) || 0; } catch(e) { return 0; }
  }
  function saveHighScore(score) {
    const best = getHighScore();
    if (score > best) { try { localStorage.setItem('sg_high_' + GAME_ID, score); } catch(e) {} }
  }

  // ===== Text (English only) =====
  const TEXT = {
    startBtn: '💩 START GAME 💩',
    scoreLabel: 'Score',
    stackLabel: 'Stack',
    gameOver: 'Game Over',
    maxStackLabel: 'Max Stack',
    retryBtn: '💩 Play Again 💩',
    titleBtn: 'Back to Title',
    charName: 'Chocolate Soft Serve',
    shareResult: '𝕏 Share Result',
    storyTapNext: 'Tap to continue',
    storyTapStart: 'Tap to start!',
    highScore: (s) => 'High Score: ' + s,
    story1: "Hey, I'm a poo...\nChocolate soft serve!",
    story2: "I want to feed you poor,\nhungry people...\nSo I made tons of\nsoft serve for you!",
    story3: "I'm gonna squeeze\nthem out now,\nso catch every one!",
    heroCatch: ['Nice!','Done this before?','Ecstasy!','Give me more!',"I'm getting high!",'Here it comes!','Whooooo!','Smells great!','That shape! That shine!',"This is why I can't stop!"],
    heroMilestone: ['5 stack! Rookie Poopsicle Builder!','10 stack! Poopsicle Shift Leader!','15 stack! Poopsicle Manager!','20 stack! Poopsicle Entrepreneur!','25 stack! Poopsicle Tower!','30 stack! Divine Poopsicle!','35 stack! Cosmic Poopsicle!'],
    heroComments: {
      terrible: "Huh... {stack} stack? I see... I guess someone like you couldn't handle something this hard... I'm sorry.",
      bad: "{stack} stacks, huh. It's okay! Some people are just born that way. Don't worry. You can rest now!",
      ok: '{stack} stacks! Wow, you tried your best. The shape is terrible though. But thanks!',
      good: '{stack} stacks!? Y-you... amazing! I want to worship you!!',
      amazing: '{stack} stacks!? Y-you... amazing! I want to worship you!!',
      godlike: "{stack} stacks... I'll tell only you... I'm actually poop... Let's become poop together."
    },
    ranks: {
      r35: '🌌 Cosmic Poopsicle 🌌',
      r30: '👑 Divine Poopsicle 👑',
      r25: '🏗️ Poopsicle Tower 🏗️',
      r20: '💼 Poopsicle Entrepreneur 💼',
      r15: '🎩 Poopsicle Manager 🎩',
      r10: '🍦 Poopsicle Shift Leader 🍦',
      r5: '🐣 Rookie Poopsicle Builder 🐣',
      r0: '😢 Less Than a Poopsicle 😢'
    },
    shareText: (score, stack, rank) =>
      '💩🍦 Poopsicle Catcher\nScore: ' + score + '\nMax Stack: ' + stack + '\nRank: ' + rank + '\n\n#SurrealGames',
  };

  function t(key, ...args) {
    const val = TEXT[key];
    return typeof val === 'function' ? val(...args) : (val || key);
  }

  const $ = id => document.getElementById(id);

  const titleScreen  = $('title-screen');
  const storyScreen  = $('story-screen');
  const gameScreen   = $('game-screen');
  const resultScreen = $('result-screen');
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  const comboText = $('combo-text');
  const nishidaComment = $('nishida-comment');

  const GAME_W = 360, GAME_H = 600;
  const CONE_W = 50, CONE_H = 60;
  const POOP_SIZE = 32;
  const PLAYER_SPEED = 6;
  const INITIAL_FALL_SPEED = 2.5;
  const SPEED_INCREMENT = 0.15;
  const SPAWN_INTERVAL_INITIAL = 1800;
  const SPAWN_INTERVAL_MIN = 600;
  const SPAWN_INTERVAL_DECREASE = 40;

  const STORY_LINES = ['story1', 'story2', 'story3'];

  const heroImg = new Image();
  heroImg.src = 'character.png';

  let storyStep = 0;

  function playFlushSE() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 1.8;
      const sampleRate = ac.sampleRate;
      const len = sampleRate * duration;
      const buf = ac.createBuffer(1, len, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = Math.max(0, 1 - t / duration) * (0.5 + 0.5 * Math.sin(t * 3));
        const noise = (Math.random() * 2 - 1);
        const rumble = Math.sin(t * 80 * Math.PI * 2) * 0.3;
        const swoosh = Math.sin(t * 200 * Math.PI * 2 * (1 - t / duration)) * 0.2;
        data[i] = (noise * 0.4 + rumble + swoosh) * env * 0.3;
      }
      const src = ac.createBufferSource();
      src.buffer = buf; src.connect(ac.destination); src.start();
      src.onended = () => ac.close();
    } catch (e) {}
  }

  function showStoryScreen() {
    storyStep = 0;
    showScreen(storyScreen);
    showStoryLine();
    SoundSystem.playBgm('nohohon');
  }

  function showStoryLine() {
    const bubble = $('story-bubble');
    const text = $('story-text');
    const hint = $('story-tap-hint');
    if (storyStep < STORY_LINES.length) {
      bubble.classList.remove('visible');
      setTimeout(() => {
        text.textContent = t(STORY_LINES[storyStep]);
        bubble.classList.add('visible');
      }, 200);
      hint.textContent = storyStep < STORY_LINES.length - 1 ? t('storyTapNext') : t('storyTapStart');
    }
  }

  function advanceStory() {
    storyStep++;
    if (storyStep < STORY_LINES.length) {
      showStoryLine();
    } else {
      SoundSystem.stopBgm();
      playFlushSE();
      setTimeout(() => startGame(), 800);
    }
  }

  storyScreen.addEventListener('click', advanceStory);

  let playerX, playerY;
  let poops = [];
  let stack = [];
  let score, stackCount, combo, maxStack;
  let fallSpeed, spawnInterval, spawnTimer;
  let gameOver, animationId, lastTime;
  let keysDown = {};
  let scale = 1;

  function resizeCanvas() {
    const maxW = Math.min(window.innerWidth - 8, GAME_W);
    const maxH = Math.min(window.innerHeight - 80, GAME_H);
    scale = Math.min(maxW / GAME_W, maxH / GAME_H);
    canvas.width = GAME_W * scale;
    canvas.height = GAME_H * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function drawCone(x, y) {
    ctx.fillStyle = '#d4a050';
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x - CONE_W / 2, y - CONE_H); ctx.lineTo(x + CONE_W / 2, y - CONE_H);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b8863c'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const lx = x + (-CONE_W / 2) * (1 - t);
      const rx = x + (CONE_W / 2) * (1 - t);
      const ly = y + (-CONE_H) * (1 - t);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ly); ctx.stroke();
    }
  }

  function drawHero(x, y) {
    if (!heroImg.complete) return;
    const coneTopY = y - CONE_H;
    const stackH = stack.length * 14;
    ctx.drawImage(heroImg, x - 24, coneTopY - stackH - 52, 48, 48);
  }

  function drawPoop(x, y, size) {
    const s = size || POOP_SIZE;
    ctx.fillStyle = '#8B4513';
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.15, s * 0.45, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y - s * 0.05, s * 0.35, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y - s * 0.22, s * 0.22, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.08, y - s * 0.32);
    ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x + s * 0.05, y - s * 0.42);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.ellipse(x - s * 0.1, y - s * 0.15, s * 0.06, s * 0.08, -0.3, 0, Math.PI * 2); ctx.fill();
  }

  function drawStackedPoops(baseX, baseY) {
    for (let i = 0; i < stack.length; i++) {
      const p = stack[i];
      drawPoop(baseX + p.offsetX, baseY - CONE_H - i * 14 - 8, p.size);
    }
  }

  function spawnPoop() {
    const x = POOP_SIZE / 2 + Math.random() * (GAME_W - POOP_SIZE);
    poops.push({
      x, y: -POOP_SIZE,
      speed: fallSpeed + (Math.random() - 0.5) * 0.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      wobbleAmp: 10 + Math.random() * 20,
      baseX: x
    });
  }

  function checkCatch(poop) {
    const stackTopY = playerY - CONE_H - stack.length * 14 - 10;
    if (poop.y >= stackTopY - 10 && poop.y <= stackTopY + 20) {
      if (Math.abs(poop.x - playerX) < CONE_W / 2 + 8 + Math.min(stack.length * 1.5, 15)) return true;
    }
    return false;
  }

  function updateHUD() { $('score').textContent = score; $('stack-count').textContent = stackCount; }

  function showCombo(text) {
    comboText.textContent = text;
    comboText.classList.remove('active'); void comboText.offsetWidth; comboText.classList.add('active');
    setTimeout(() => comboText.classList.remove('active'), 1000);
  }

  let nishidaTimer = null;
  function showNishidaComment(text) {
    if (nishidaTimer) clearTimeout(nishidaTimer);
    nishidaComment.textContent = text;
    nishidaComment.classList.remove('active'); void nishidaComment.offsetWidth; nishidaComment.classList.add('active');
    nishidaTimer = setTimeout(() => nishidaComment.classList.remove('active'), 1500);
  }

  function gameLoop(time) {
    if (gameOver) return;
    if (!lastTime) lastTime = time;
    const dt = Math.min(time - lastTime, 50); lastTime = time;
    try { update(dt); if (!gameOver) render(); } catch (e) { console.error(e); }
    if (!gameOver) animationId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    if (keysDown['ArrowLeft'] || keysDown['a']) playerX = Math.max(CONE_W / 2, playerX - PLAYER_SPEED);
    if (keysDown['ArrowRight'] || keysDown['d']) playerX = Math.min(GAME_W - CONE_W / 2, playerX + PLAYER_SPEED);
    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnPoop(); spawnTimer = spawnInterval; }
    for (let i = poops.length - 1; i >= 0; i--) {
      const p = poops[i];
      p.y += p.speed;
      p.wobblePhase += p.wobbleSpeed * (dt / 100);
      p.x = p.baseX + Math.sin(p.wobblePhase) * p.wobbleAmp;
      p.x = Math.max(POOP_SIZE / 2, Math.min(GAME_W - POOP_SIZE / 2, p.x));
      if (checkCatch(p)) { catchPoop(); poops.splice(i, 1); continue; }
      if (p.y > GAME_H + POOP_SIZE) { SoundSystem.play('splat'); endGame(); return; }
    }
  }

  function catchPoop() {
    combo++;
    stack.push({ offsetX: (Math.random() - 0.5) * 6, size: POOP_SIZE * (0.85 + Math.random() * 0.3) });
    stackCount++;
    score += 10 + stackCount * 5 + combo * 3;
    if (combo >= 3) SoundSystem.play('fart_long');
    else { SoundSystem.play('plop'); if (Math.random() < 0.4) setTimeout(() => SoundSystem.play('fart'), 80); }
    if (combo > 0 && combo % 5 === 0) SoundSystem.setBgmSpeed(Math.min(1.0 + combo * 0.05, 1.8));
    fallSpeed += SPEED_INCREMENT * 0.3;
    spawnInterval = Math.max(SPAWN_INTERVAL_MIN, spawnInterval - SPAWN_INTERVAL_DECREASE * 0.5);
    const milestones = t('heroMilestone');
    const catches = t('heroCatch');
    if (stackCount % 5 === 0) {
      showCombo(milestones[Math.min(Math.floor(stackCount / 5) - 1, milestones.length - 1)]);
    } else {
      showNishidaComment(catches[Math.floor(Math.random() * catches.length)]);
    }
    updateHUD();
  }

  function render() {
    ctx.fillStyle = '#1a0e08'; ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = '#3a2010'; ctx.fillRect(0, GAME_H - 10, GAME_W, 10);
    for (const p of poops) drawPoop(p.x, p.y, POOP_SIZE);
    drawCone(playerX, playerY);
    drawStackedPoops(playerX, playerY);
    drawHero(playerX, playerY);
  }

  function startGame() {
    playerX = GAME_W / 2; playerY = GAME_H - 30;
    poops = []; stack = [];
    score = 0; stackCount = 0; combo = 0; maxStack = 0;
    fallSpeed = INITIAL_FALL_SPEED; spawnInterval = SPAWN_INTERVAL_INITIAL; spawnTimer = 500;
    gameOver = false; lastTime = 0;
    resizeCanvas(); updateHUD(); showScreen(gameScreen);
    SoundSystem.playBgm('march');
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameOver = true;
    if (animationId) cancelAnimationFrame(animationId);
    SoundSystem.stopBgm();
    maxStack = stackCount;
    saveHighScore(score);
    $('final-score').textContent = score;
    $('final-stack').textContent = maxStack;
    const ranks = t('ranks');
    let rankKey;
    if (maxStack >= 35) rankKey = 'r35';
    else if (maxStack >= 30) rankKey = 'r30';
    else if (maxStack >= 25) rankKey = 'r25';
    else if (maxStack >= 20) rankKey = 'r20';
    else if (maxStack >= 15) rankKey = 'r15';
    else if (maxStack >= 10) rankKey = 'r10';
    else if (maxStack >= 5) rankKey = 'r5';
    else rankKey = 'r0';
    const rank = ranks[rankKey];
    $('result-rank').textContent = rank;
    let tier;
    if (maxStack >= 35) tier = 'godlike';
    else if (maxStack >= 25) tier = 'amazing';
    else if (maxStack >= 15) tier = 'good';
    else if (maxStack >= 10) tier = 'ok';
    else if (maxStack >= 5) tier = 'bad';
    else tier = 'terrible';
    const heroComments = t('heroComments');
    let comment = heroComments[tier].replace(/\{score\}/g, score).replace(/\{stack\}/g, maxStack);
    $('character-text').textContent = comment;

    const existingShareBtn = $('share-btn');
    if (existingShareBtn) existingShareBtn.remove();
    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.className = 'btn-primary';
    shareBtn.textContent = t('shareResult');
    shareBtn.style.cssText = 'background: linear-gradient(135deg, #1a1a1a, #333); margin-bottom: 12px;';
    shareBtn.addEventListener('click', () => {
      const text = t('shareText', score, maxStack, rank);
      const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener,noreferrer') || (window.top.location.href = url);
    });
    $('retry-btn').parentNode.insertBefore(shareBtn, $('retry-btn'));
    setTimeout(() => showScreen(resultScreen), 400);
  }

  function showScreen(screen) {
    [titleScreen, storyScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  document.addEventListener('keydown', e => {
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    keysDown[e.key] = true;
  });
  document.addEventListener('keyup', e => { keysDown[e.key] = false; });

  let touchActive = false, touchX = 0;
  canvas.addEventListener('touchstart', e => { e.preventDefault(); touchActive = true; touchX = e.touches[0].clientX; updateTouchDirection(); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if (!touchActive) return; touchX = e.touches[0].clientX; updateTouchDirection(); }, { passive: false });
  canvas.addEventListener('touchend', e => { e.preventDefault(); touchActive = false; keysDown['ArrowLeft'] = false; keysDown['ArrowRight'] = false; }, { passive: false });
  canvas.addEventListener('touchcancel', () => { touchActive = false; keysDown['ArrowLeft'] = false; keysDown['ArrowRight'] = false; });

  function updateTouchDirection() {
    const rect = canvas.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = touchX < mid - 20;
    keysDown['ArrowRight'] = touchX > mid + 20;
  }

  let mouseDown = false;
  canvas.addEventListener('mousedown', e => { mouseDown = true; updateMouseDirection(e); });
  canvas.addEventListener('mousemove', e => { if (!mouseDown) return; updateMouseDirection(e); });
  canvas.addEventListener('mouseup', () => { mouseDown = false; keysDown['ArrowLeft'] = false; keysDown['ArrowRight'] = false; });
  canvas.addEventListener('mouseleave', () => { if (mouseDown) { mouseDown = false; keysDown['ArrowLeft'] = false; keysDown['ArrowRight'] = false; } });

  function updateMouseDirection(e) {
    const rect = canvas.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = e.clientX < mid - 20;
    keysDown['ArrowRight'] = e.clientX > mid + 20;
  }

  $('start-btn').addEventListener('click', showStoryScreen);
  $('retry-btn').addEventListener('click', startGame);
  $('title-btn').addEventListener('click', () => { showScreen(titleScreen); showHighScore(); });

  window.addEventListener('resize', () => {
    if (gameScreen.classList.contains('active')) { resizeCanvas(); render(); }
  });
  document.addEventListener('touchmove', e => {
    if (gameScreen.classList.contains('active')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  function showHighScore() {
    const best = getHighScore();
    const el = $('highscore-display');
    if (el) el.textContent = best ? t('highScore', best) : '';
  }
  showHighScore();
})();
