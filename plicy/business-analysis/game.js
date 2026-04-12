(function() {
  'use strict';

  // ===== サウンドシステム =====
  const Sound = {
    ctx: null,
    enabled: true,
    volume: 0.5,
    bgmPlaying: false,
    bgmNodes: [],
    bgmTimers: [],
    bgmSpeedMultiplier: 1.0,
    bgmGain: null,

    _bgmPresets: {
      sparkle: {
        tempo: 115, key: 'C', wave: 'triangle', volume: 0.10,
        melody: [
          330, 392, 440, 523, 494, 440, 392, 440,
          523, 659, 784, 659, 523, 440, 392, 523,
          349, 440, 523, 659, 523, 440, 349, 392,
          440, 523, 659, 784, 659, 523, 440, 392,
        ],
        bass: [
          131, 165, 131, 165, 175, 196, 175, 196,
          131, 165, 131, 165, 175, 196, 131, 165,
          110, 131, 110, 131, 147, 175, 147, 175,
          131, 165, 131, 165, 131, 165, 131, 131,
        ],
        sparkle: [
          523, 0, 0, 0, 659, 0, 0, 0,
          784, 0, 0, 0, 0, 0, 523, 0,
          0, 0, 659, 0, 0, 0, 0, 0,
          784, 0, 0, 0, 1047, 0, 0, 0,
        ]
      },
      triumph: {
        tempo: 130, key: 'C', wave: 'triangle', volume: 0.12,
        melody: [
          523, 659, 784, 880, 784, 880, 1047, 880,
          784, 659, 523, 659, 784, 880, 1047, 1319,
          440, 523, 659, 784, 659, 784, 880, 784,
          659, 523, 440, 523, 659, 784, 880, 1047,
        ],
        bass: [
          131, 165, 196, 196, 175, 196, 262, 262,
          131, 165, 196, 196, 175, 196, 131, 131,
          110, 131, 165, 196, 175, 196, 220, 220,
          131, 165, 196, 196, 131, 165, 196, 262,
        ],
        sparkle: [
          784, 0, 1047, 0, 1319, 0, 1568, 0,
          784, 0, 0, 1047, 0, 0, 1568, 2093,
          659, 0, 784, 0, 1047, 0, 0, 0,
          1319, 0, 1568, 0, 2093, 0, 1568, 0,
        ]
      }
    },

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

    _duckBgm(duration) {
      if (!this.bgmGain || !this.bgmPlaying) return;
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.15, now);
      this.bgmGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      this.bgmGain.gain.linearRampToValueAtTime(1.0, now + duration);
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
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.value = this.volume;
      gain.connect(ctx.destination);

      switch (type) {
        case 'sparkle_click': {
          this._duckBgm(0.5);
          const baseFreq = 1047;
          const ratios = [1, 1.25, 1.5, 1.875, 2];
          for (let i = 0; i < 5; i++) {
            const freq = baseFreq * ratios[i];
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = freq;
            g1.gain.setValueAtTime(this.volume * 0.35, now + i * 0.07);
            g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
            osc1.connect(g1); g1.connect(ctx.destination);
            osc1.start(now + i * 0.07); osc1.stop(now + i * 0.07 + 0.45);
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(this.volume * 0.12, now + i * 0.07);
            g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
            osc2.connect(g2); g2.connect(ctx.destination);
            osc2.start(now + i * 0.07); osc2.stop(now + i * 0.07 + 0.3);
          }
          break;
        }

        case 'correct_gorgeous': {
          this._duckBgm(0.8);
          const baseFreq2 = 1568;
          const ratios2 = [1, 1.25, 1.5, 1.875, 2, 2.5];
          for (let i = 0; i < 6; i++) {
            const freq = baseFreq2 * ratios2[i];
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sine'; osc1.frequency.value = freq;
            g1.gain.setValueAtTime(this.volume * 0.4, now + i * 0.05);
            g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
            osc1.connect(g1); g1.connect(ctx.destination);
            osc1.start(now + i * 0.05); osc1.stop(now + i * 0.05 + 0.55);
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle'; osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(this.volume * 0.12, now + i * 0.05);
            g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
            osc2.connect(g2); g2.connect(ctx.destination);
            osc2.start(now + i * 0.05); osc2.stop(now + i * 0.05 + 0.35);
          }
          [1047, 1319, 1568].forEach((freq) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            g.gain.setValueAtTime(this.volume * 0.25, now + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now + 0.1); osc.stop(now + 0.85);
          });
          break;
        }

        case 'smash': {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
          gain.gain.value = this.volume * 0.5;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain); osc.start(now); osc.stop(now + 0.4);
          break;
        }

        case 'start': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554, now + 0.12);
          osc.frequency.setValueAtTime(659, now + 0.24);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.connect(gain); osc.start(now); osc.stop(now + 0.5);
          break;
        }

        case 'result': {
          const notes = [523, 659, 784, 1047, 784, 1047];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            g.gain.value = this.volume * 0.3;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.15 * (i + 1) + 0.15);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now + 0.15 * i); osc.stop(now + 0.15 * (i + 1) + 0.15);
          });
          break;
        }
      }
    },

    playBgm(presetName) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      this._currentPreset = this._bgmPresets[presetName];
      if (!this._currentPreset) return;
      this.stopBgm();
      this.bgmPlaying = true;
      const startBgm = () => {
        if (!this.bgmPlaying) return;
        if (this.ctx.state === 'running') {
          this._loopBgm();
        } else {
          this.ctx.resume().then(() => { if (this.bgmPlaying) this._loopBgm(); });
        }
      };
      startBgm();
    },

    _loopBgm() {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      const ctx = this.ctx;
      const preset = this._currentPreset;
      const bgmDest = this.bgmGain || ctx.destination;
      const now = ctx.currentTime;
      const baseBeat = (60 / preset.tempo) / (this.bgmSpeedMultiplier || 1.0);
      const vol = preset.volume;

      const offsets = [];
      let t = 0;
      for (let i = 0; i < preset.melody.length; i++) {
        offsets.push(t);
        t += baseBeat;
      }
      const totalDur = t;

      preset.melody.forEach((freq, i) => {
        if (!freq) return;
        const noteDur = baseBeat;
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
        const noteDur = baseBeat;
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

      // スパークルアルペジオ層
      if (preset.sparkle) {
        const sparkleRatios = [1, 1.25, 1.5, 1.875, 2, 2.5, 3];
        preset.sparkle.forEach((baseFreq, i) => {
          if (!baseFreq) return;
          const arpCount = 4;
          for (let j = 0; j < arpCount; j++) {
            const freq = baseFreq * sparkleRatios[j % sparkleRatios.length];
            const startTime = now + offsets[i] + j * 0.08;
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = freq;
            g1.gain.setValueAtTime(vol * 0.6, startTime);
            g1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
            osc1.connect(g1);
            g1.connect(bgmDest);
            osc1.start(startTime);
            osc1.stop(startTime + 0.45);
            this.bgmNodes.push(osc1);
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(vol * 0.2, startTime);
            g2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
            osc2.connect(g2);
            g2.connect(bgmDest);
            osc2.start(startTime);
            osc2.stop(startTime + 0.3);
            this.bgmNodes.push(osc2);
          }
        });
      }

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
    }
  };

  // グローバルに公開（sound-toggleボタン用）
  window.Sound = Sound;

  // ===== 多言語データ =====
  const i18n = {
    ja: {
      title: '経営分析ゲーム<br>～天才たちの<ruby>戯れ<rp>(</rp><rt>シーソーゲーム</rt><rp>)</rp></ruby>～',
      startBtn: 'レディー★ゴー',
      openingName: '篤',
      registerName: '篤',
      replayBtn: 'もう一回やる',
      hint: '経営的にまずい箇所をクリックしろ',
      labels: { oyaji: '店主', ramen: 'ラーメン', register: 'レジ', sign: '看板', table: 'テーブル' },
      correctExclaim: '正解！',
      openingLines: [
        '俺の名は篤。天才経営アナリスト。\n数字が俺に恋をする…そういう男だ。',
        '今日も迷える子羊ちゃんたちの\n救いを求める声がする。',
        '俺を待ってろ、世界…！！',
        '……依頼が来たな。\nさびれたラーメン屋の経営分析か。',
        'どれ、この天才アナリストの\n目で見抜いてやるとしよう。'
      ],
      objectDialogues: {
        oyaji: { name: '篤', text: '汚いオヤジだ。\nでもそこが味がある。\nここは経営的にまずい箇所じゃないぞ。' },
        ramen: { name: '篤', text: 'くさい、まずい、汚い。\n三拍子揃った最悪のラーメンだが…\nこれは料理の問題だ。経営じゃない。' },
        sign: { name: '篤', text: '「ラーメン」としか書いていない看板。\nシンプルすぎるが…\nまあ、ラーメン屋だからな。問題ない。' },
        table: { name: '篤', text: 'ベタベタするテーブル。\n不衛生だが、常連は気にしない。\n経営の本質はここじゃないな。' },
        register: { name: '篤', text: '……！\nこれだ。レジだ。\n結局、経営の全ては金なんだよ。' }
      },
      atsushiLines: [
        'おいおい…俺ばっかり見るなよ…',
        'いけない子猫ちゃんだぜ…',
        '分析に集中するんだ…',
        '罪な俺…',
      ],
      registerLines: [
        '経営分析の結果、答えは明白だ。',
        'この店に足りないもの…\nそれは「客に金を配ること」だ。',
        '来店した客全員に1000円を配れば\n客は喜び、口コミが広がり、\n店は繁盛する。完璧な理論だ。',
        '…え？赤字？\n天才の理論に赤字などない。'
      ],
      endingLine: 'ふ…\nまた才能をきらめかせちまったぜ…',
      shareBtn: '𝕏 でシェア',
      shareText: '📊 経営分析ゲーム ～天才たちの戯れ～\n天才アナリスト篤の経営分析、結末は…！？\n\n#シュールゲームス',
    }
  };

  // ===== ゲーム状態 =====
  let currentLang = 'ja';

  function t() { return i18n[currentLang]; }

  const objectCorrectMap = {
    oyaji: false, ramen: false, sign: false, table: false, register: true
  };

  const state = {
    phase: 'title',
    openingStep: 0,
    registerStep: 0,
    clickedObjects: new Set(),
    dialogueOpen: false,
    dialogueReady: false,
    typing: false,
    pendingDialogueClose: null,
    _skipTyping: null,
    currentDialogueSource: null
  };

  // 衝撃演出を入れるセリフindex
  const impactLines = [2]; // 「俺を待ってろ、世界…！！」

  let atsushiLineIndex = 0;

  // テキスト速度
  const TEXT_SPEED = 22;
  const TEXT_SPEED_FAST = 25;
  const ENDING_SPEED = 35;

  // ===== DOM要素 =====
  const $ = (id) => document.getElementById(id);

  const screens = {
    title: $('title-screen'),
    opening: $('opening-screen'),
    ramen: $('ramen-screen'),
    register: $('register-scene'),
    ending: $('ending-screen')
  };

  // ===== ユーティリティ =====
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    const screen = screens[name];
    screen.classList.remove('hidden');
    screen.classList.remove('screen-fade-in');
    void screen.offsetWidth; // reflow
    screen.classList.add('screen-fade-in');
    state.phase = name;
  }

  function typeText(element, text, speed, callback) {
    if (state.typing) return;
    state.typing = true;
    state.dialogueReady = false;
    element.textContent = '';
    let i = 0;
    let skipRequested = false;

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    state._skipTyping = function() {
      skipRequested = true;
    };

    function tick() {
      if (skipRequested) {
        element.textContent = text;
        if (cursor.parentNode) cursor.remove();
        state.typing = false;
        state.dialogueReady = true;
        state._skipTyping = null;
        if (callback) callback();
        return;
      }
      if (i < text.length) {
        element.textContent = text.substring(0, i + 1);
        element.appendChild(cursor);
        i++;
        setTimeout(tick, speed);
      } else {
        if (cursor.parentNode) cursor.remove();
        state.typing = false;
        state.dialogueReady = true;
        state._skipTyping = null;
        if (callback) callback();
      }
    }
    tick();
  }

  // ===== エフェクト =====

  function createSparkles(container, count) {
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      const isStar = Math.random() > 0.6;
      sparkle.className = isStar ? 'sparkle sparkle--star' : 'sparkle';
      if (isStar) {
        sparkle.textContent = ['✦', '✧', '⋆', '★'][Math.floor(Math.random() * 4)];
      }
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 3 + 's';
      sparkle.style.animationDuration = (2 + Math.random() * 3) + 's';
      if (!isStar) {
        const size = 3 + Math.random() * 6;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
      }
      container.appendChild(sparkle);
    }
  }

  function spawnMoneyParticles() {
    const container = $('register-animation');
    container.innerHTML = '';
    const emojis = ['💴', '💵', '💶', '💷', '🪙', '💰', '💸'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'money-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = (Math.PI * 2 * i) / 20;
      const dist = 60 + Math.random() * 80;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(p);
    }
  }

  function screenFlash(parent) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    parent.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function showMangaExclaim(parent, text, x, y) {
    const el = document.createElement('div');
    el.className = 'manga-exclaim';
    el.textContent = text;
    el.style.left = x;
    el.style.top = y;
    parent.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function showWrongMark(parent) {
    const el = document.createElement('div');
    el.className = 'wrong-mark';
    el.textContent = '✕';
    parent.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  function showCorrectMark(parent) {
    const el = document.createElement('div');
    el.className = 'correct-mark';
    el.textContent = '◎';
    parent.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function addFlies() {
    const shop = $('ramen-shop');
    const positions = [
      { left: '60%', top: '20%', delay: '0s' },
      { left: '25%', top: '35%', delay: '1s' },
      { left: '75%', top: '45%', delay: '0.5s' }
    ];
    positions.forEach(pos => {
      const fly = document.createElement('div');
      fly.className = 'fly-particle';
      fly.textContent = '🪰';
      fly.style.left = pos.left;
      fly.style.top = pos.top;
      fly.style.animationDelay = pos.delay;
      fly.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      shop.appendChild(fly);
    });
  }

  function createSpeedLines() {
    const container = $('opening-speed-lines');
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const line = document.createElement('div');
      line.className = 'speed-line';
      line.style.transform = 'rotate(' + (i * 18) + 'deg)';
      line.style.opacity = 0.3 + Math.random() * 0.5;
      container.appendChild(line);
    }
  }

  // ===== 画面タップで進行 =====
  function handleScreenTap(e) {
    if (e.target.closest('button, a')) return;

    if (state.typing && state._skipTyping) {
      state._skipTyping();
      return;
    }

    // ラーメン画面: セリフが開いている時はどこをクリックしても閉じる
    if (state.phase === 'ramen' && state.dialogueOpen && state.dialogueReady) {
      if (state.pendingDialogueClose) {
        state.pendingDialogueClose();
      }
      return;
    }

    if (e.target.closest('.clickable-obj, #atsushi-ramen')) return;

    if (state.phase === 'opening' && state.dialogueReady) {
      state.dialogueReady = false;
      $('opening-indicator').classList.add('hidden');
      state.openingStep++;
      playOpening();
    } else if (state.phase === 'register' && state.dialogueReady) {
      state.dialogueReady = false;
      $('register-indicator').classList.add('hidden');
      state.registerStep++;
      if (state.registerStep < t().registerLines.length) {
        spawnMoneyParticles();
      }
      playRegister();
    }
  }

  // ===== タイトル画面 =====
  function initTitle() {
    createSparkles($('title-sparkle-container'), 40);

    $('start-btn').addEventListener('click', () => {
      Sound.play('start');
      setTimeout(() => Sound.playBgm('sparkle'), 300);
      state.openingStep = 0;
      showScreen('opening');
      createSpeedLines();
      playOpening();
    });
  }

  // ===== オープニング =====
  function playOpening() {
    $('opening-indicator').classList.add('hidden');

    if (state.openingStep >= t().openingLines.length) {
      showScreen('ramen');
      addFlies();
      return;
    }

    // 衝撃演出
    if (impactLines.includes(state.openingStep)) {
      const atsushi = $('atsushi-opening');
      atsushi.classList.remove('chara-impact');
      void atsushi.offsetWidth;
      atsushi.classList.add('chara-impact');

      const container = $('opening-speed-lines');
      container.classList.remove('active');
      void container.offsetWidth;
      container.classList.add('active');

      screenFlash(screens.opening);
      showMangaExclaim(screens.opening, '！！', '70%', '25%');
    }

    typeText($('opening-text'), t().openingLines[state.openingStep], TEXT_SPEED, () => {
      $('opening-indicator').classList.remove('hidden');
    });
  }

  // ===== ラーメン屋シーン =====
  function initRamen() {
    const objects = document.querySelectorAll('.clickable-obj');
    const dialogueBox = $('dialogue-box');
    const dialogueText = $('dialogue-text');
    const dialogueName = $('dialogue-name');
    const dialogueIndicator = $('dialogue-indicator');

    objects.forEach(obj => {
      obj.addEventListener('click', (e) => {
        e.stopPropagation();
        // セリフ表示中はクリックでセリフを進める/閉じる
        if (state.dialogueOpen) {
          if (state.typing && state._skipTyping) {
            state._skipTyping();
          } else if (state.dialogueReady && state.pendingDialogueClose) {
            state.pendingDialogueClose();
          }
          return;
        }
        if (state.typing) return;

        const name = obj.dataset.name;
        const data = t().objectDialogues[name];
        if (!data) return;

        // オブジェクトクリック時のSE
        if (objectCorrectMap[name]) {
          Sound.play('correct_gorgeous');
        } else {
          Sound.play('sparkle_click');
        }

        state.dialogueOpen = true;
        state.currentDialogueSource = name;
        dialogueName.textContent = data.name;
        dialogueBox.classList.remove('hidden');
        dialogueIndicator.classList.add('hidden');

        typeText(dialogueText, data.text, TEXT_SPEED_FAST, () => {
          dialogueIndicator.classList.remove('hidden');

          if (objectCorrectMap[name]) {
            showCorrectMark(obj);
            screenFlash(screens.ramen);
            showMangaExclaim(screens.ramen, t().correctExclaim, '50%', '30%');

            state.pendingDialogueClose = () => {
              dialogueBox.classList.add('hidden');
              dialogueIndicator.classList.add('hidden');
              state.dialogueOpen = false;
              state.currentDialogueSource = null;
              state.dialogueReady = false;
              state.pendingDialogueClose = null;
              state.registerStep = 0;
              // 正解後はゴージャスなBGMに切り替え
              Sound.playBgm('triumph');
              showScreen('register');
              spawnMoneyParticles();
              playRegister();
            };
          } else {
            showWrongMark(obj);
            obj.classList.add('wrong');
            setTimeout(() => obj.classList.remove('wrong'), 400);
            state.clickedObjects.add(name);

            state.pendingDialogueClose = () => {
              dialogueBox.classList.add('hidden');
              dialogueIndicator.classList.add('hidden');
              state.dialogueOpen = false;
              state.currentDialogueSource = null;
              state.dialogueReady = false;
              state.pendingDialogueClose = null;
            };
          }
        });
      });
    });

    // 篤クリックでセリフ表示
    const atsushiRamen = $('atsushi-ramen');
    atsushiRamen.addEventListener('click', (e) => {
      e.stopPropagation();
      // セリフ表示中はクリックでセリフを進める/閉じる
      if (state.dialogueOpen) {
        if (state.typing && state._skipTyping) {
          state._skipTyping();
        } else if (state.dialogueReady && state.pendingDialogueClose) {
          state.pendingDialogueClose();
        }
        return;
      }
      if (state.typing) return;

      // 篤タップで変な音
      Sound.play('smash');

      state.dialogueOpen = true;
      state.currentDialogueSource = 'atsushi';
      const lines = t().atsushiLines;
      const line = lines[atsushiLineIndex % lines.length];
      state.currentAtsushiIndex = atsushiLineIndex % lines.length;
      atsushiLineIndex++;
      dialogueName.textContent = t().openingName;
      dialogueBox.classList.remove('hidden');
      dialogueIndicator.classList.add('hidden');

      typeText(dialogueText, line, TEXT_SPEED_FAST, () => {
        dialogueIndicator.classList.remove('hidden');
        state.pendingDialogueClose = () => {
          dialogueBox.classList.add('hidden');
          dialogueIndicator.classList.add('hidden');
          state.dialogueOpen = false;
          state.currentDialogueSource = null;
          state.dialogueReady = false;
          state.pendingDialogueClose = null;
        };
      });
    });
  }

  // ===== レジ演出 =====
  function playRegister() {
    $('register-indicator').classList.add('hidden');

    if (state.registerStep >= t().registerLines.length) {
      showScreen('ending');
      createSparkles($('ending-sparkle-container'), 50);
      playEnding();
      return;
    }

    // セリフ2番目でフラッシュ演出
    if (state.registerStep === 1) {
      screenFlash(screens.register);
      showMangaExclaim(screens.register, '！？', '75%', '20%');
    }

    typeText($('register-text'), t().registerLines[state.registerStep], TEXT_SPEED, () => {
      $('register-indicator').classList.remove('hidden');
    });
  }

  // ===== エンディング =====
  function playEnding() {
    Sound.stopBgm();
    Sound.play('result');
    typeText($('ending-text'), t().endingLine, ENDING_SPEED, () => {
      $('ending-buttons').classList.remove('hidden');
    });
  }

  function initEnding() {
    $('share-btn').addEventListener('click', () => {
      const gameURL = window.location.href;
      const shareText = t().shareText + '\n' + gameURL;
      const tweetURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
      window.open(tweetURL, '_blank');
    });

    $('replay-btn').addEventListener('click', () => {
      Sound.stopBgm();
      state.clickedObjects.clear();
      state.openingStep = 0;
      state.registerStep = 0;
      atsushiLineIndex = 0;
      state.dialogueOpen = false;
      state.currentDialogueSource = null;
      state.dialogueReady = false;
      state.typing = false;
      state.pendingDialogueClose = null;
      state._skipTyping = null;
      $('ending-buttons').classList.add('hidden');
      $('dialogue-box').classList.add('hidden');
      $('opening-indicator').classList.add('hidden');
      $('register-indicator').classList.add('hidden');
      $('dialogue-indicator').classList.add('hidden');

      // ハエ削除
      document.querySelectorAll('.fly-particle').forEach(f => f.remove());

      $('title-sparkle-container').innerHTML = '';
      $('ending-sparkle-container').innerHTML = '';
      createSparkles($('title-sparkle-container'), 40);

      showScreen('title');
    });
  }

  // ===== 言語適用 =====
  function applyLang() {
    const lang = t();
    $('game-title').innerHTML = lang.title;
    $('start-btn').textContent = lang.startBtn;
    $('opening-name').textContent = lang.openingName;
    $('register-name').textContent = lang.registerName;
    $('ramen-hint').textContent = lang.hint;
    $('replay-btn').textContent = lang.replayBtn;
    $('share-btn').textContent = lang.shareBtn;

    // ラベル更新
    document.querySelectorAll('.clickable-obj').forEach(obj => {
      const name = obj.dataset.name;
      if (lang.labels[name]) {
        obj.querySelector('.obj-label').textContent = lang.labels[name];
      }
    });
  }

  // ===== 初期化 =====
  function init() {
    initTitle();
    initRamen();
    initEnding();
    document.addEventListener('click', handleScreenTap);
    applyLang();
    Sound.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
