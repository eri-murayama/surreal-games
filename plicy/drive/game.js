// ========================================
// 黄金の金色ドライバー ～田舎者の挑戦～
// Plicy版（スタンドアロン・日本語のみ）
// ========================================

(function () {
  'use strict';

  // ===== 内蔵サウンドシステム =====
  const BGM_PRESETS = {
    race: {
      tempo: 180, key: 'Em', wave: 'sawtooth', volume: 0.07,
      melody: [330,392,494,659,494,659,784,659,587,659,784,988,784,659,587,494,330,494,587,659,784,659,587,494,392,494,587,784,659,587,494,392],
      bass: [165,165,165,165,196,196,196,196,220,220,220,220,247,247,196,196,165,165,165,165,196,196,196,196,220,220,247,247,196,196,165,165],
    },
    sad: {
      tempo: 65, key: 'Am', wave: 'sine', volume: 0.10,
      melody: [440,392,349,330,349,392,349,330,294,330,349,392,349,330,294,262,220,262,294,330,294,262,220,196,220,262,294,349,330,294,262,220],
      bass: [110,110,131,131,147,147,131,131,110,110,131,131,147,147,110,110,88,88,110,110,131,131,110,110,88,88,110,110,88,88,110,110],
    },
    ominous: {
      tempo: 75, key: 'Dm', wave: 'triangle', volume: 0.09,
      melody: [294,277,262,277,294,262,247,233,262,247,233,220,233,247,220,208,294,311,330,311,294,277,262,247,233,220,208,196,208,220,233,220],
      bass: [147,139,131,139,147,131,123,117,131,123,117,110,117,123,110,104,147,156,165,156,147,139,131,123,117,110,104,98,104,110,117,110],
    },
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
    },

    _ensureCtx() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!this.bgmGain && this.ctx) { this.bgmGain = this.ctx.createGain(); this.bgmGain.connect(this.ctx.destination); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    _duckBgm(duration) {
      if (!this.bgmGain || !this.bgmPlaying) return;
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.15, now);
      this.bgmGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      this.bgmGain.gain.linearRampToValueAtTime(1.0, now + duration);
    },

    playBgm(presetName) {
      if (!this.enabled) return;
      this._ensureCtx(); if (!this.ctx) return;
      const preset = BGM_PRESETS[presetName]; if (!preset) return;
      this.stopBgm(); this.bgmPlaying = true; this.currentBgmPreset = presetName;
      if (this.ctx.state === 'suspended') { this.ctx.resume().then(() => { if (this.bgmPlaying) this._loopBgm(preset); }); }
      else { this._loopBgm(preset); }
    },

    _loopBgm(preset) {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      const ctx = this.ctx, bgmDest = this.bgmGain || ctx.destination;
      const now = ctx.currentTime;
      const baseBeat = (60 / preset.tempo) / (this.bgmSpeedMultiplier || 1.0);
      const vol = preset.volume;
      const swing = preset.swing;
      const offsets = []; let t = 0;
      for (let i = 0; i < preset.melody.length; i++) { offsets.push(t); t += baseBeat * (swing ? swing[i] : 1); }
      const totalDur = t;
      preset.melody.forEach((freq, i) => {
        if (!freq) return;
        const noteDur = baseBeat * (swing ? swing[i] : 1);
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = preset.wave; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, now + offsets[i]);
        g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
        osc.connect(g); g.connect(bgmDest);
        osc.start(now + offsets[i]); osc.stop(now + offsets[i] + noteDur * 0.95);
        this.bgmNodes.push(osc);
      });
      preset.bass.forEach((freq, i) => {
        if (!freq) return;
        const noteDur = baseBeat * (swing ? swing[i] : 1);
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(vol * 0.5, now + offsets[i]);
        g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
        osc.connect(g); g.connect(bgmDest);
        osc.start(now + offsets[i]); osc.stop(now + offsets[i] + noteDur * 0.95);
        this.bgmNodes.push(osc);
      });
      this.bgmTimers.push(setTimeout(() => { if (this.bgmPlaying) this._loopBgm(preset); }, totalDur * 1000));
    },

    stopBgm() {
      this.bgmPlaying = false;
      this.bgmSpeedMultiplier = 1.0;
      this.bgmNodes.forEach(n => { try { n.stop(); } catch (e) {} }); this.bgmNodes = [];
      this.bgmTimers.forEach(t => clearTimeout(t)); this.bgmTimers = [];
    },

    setBgmSpeed(multiplier) {
      this.bgmSpeedMultiplier = multiplier;
    },

    play(type) {
      if (!this.enabled) return;
      this._ensureCtx(); if (!this.ctx) return;
      if (this.ctx.state === 'suspended') { this.ctx.resume().then(() => this._playSound(type)); return; }
      this._playSound(type);
    },

    _playSound(type) {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const ctx = this.ctx, now = ctx.currentTime, gain = ctx.createGain();
      gain.connect(ctx.destination); gain.gain.value = this.volume;
      switch (type) {
        case 'tap': {
          const o = ctx.createOscillator(); o.type = 'sine';
          o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          o.connect(gain); o.start(now); o.stop(now + 0.1); break;
        }
        case 'hit': {
          const o = ctx.createOscillator(); o.type = 'sine';
          o.frequency.setValueAtTime(150, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.12);
          gain.gain.value = this.volume * 0.7; gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          o.connect(gain); o.start(now); o.stop(now + 0.16); break;
        }
        case 'pickup': {
          [880, 1100, 1320].forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f; g.gain.value = this.volume * 0.35;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.08 * (i + 1) + 0.08);
            o.connect(g); g.connect(ctx.destination); o.start(now + 0.08 * i); o.stop(now + 0.08 * (i + 1) + 0.08);
          }); break;
        }
        case 'dramatic': {
          this._duckBgm(1.5);
          const oL = ctx.createOscillator(), gL = ctx.createGain();
          oL.type = 'sawtooth'; oL.frequency.setValueAtTime(80, now); oL.frequency.exponentialRampToValueAtTime(30, now + 0.8);
          gL.gain.setValueAtTime(this.volume * 0.8, now); gL.gain.exponentialRampToValueAtTime(0.01, now + 1);
          oL.connect(gL); gL.connect(ctx.destination); oL.start(now); oL.stop(now + 1);
          [147, 156, 208, 220].forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'square'; o.frequency.value = f;
            g.gain.setValueAtTime(this.volume * 0.4, now + 0.02 * i);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + 0.1 * i);
            o.connect(g); g.connect(ctx.destination); o.start(now + 0.02 * i); o.stop(now + 0.7 + 0.1 * i);
          });
          const oH = ctx.createOscillator(), gH = ctx.createGain();
          oH.type = 'sawtooth'; oH.frequency.setValueAtTime(2000, now); oH.frequency.exponentialRampToValueAtTime(200, now + 0.3);
          gH.gain.setValueAtTime(this.volume * 0.5, now); gH.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oH.connect(gH); gH.connect(ctx.destination); oH.start(now); oH.stop(now + 0.4); break;
        }
        case 'slot_stop': {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(400, now + 0.06);
          g.gain.setValueAtTime(this.volume * 0.4, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.12); break;
        }
        case 'boost': {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sawtooth'; o.frequency.setValueAtTime(200, now);
          o.frequency.exponentialRampToValueAtTime(1200, now + 0.2); o.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          g.gain.setValueAtTime(this.volume * 0.4, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.5); break;
        }
        case 'banana_set': {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(500, now); o.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          g.gain.setValueAtTime(this.volume * 0.4, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.2); break;
        }
        case 'shield': {
          [880, 1100, 1320, 1760].forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(this.volume * 0.3, now + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.3);
            o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.35);
          }); break;
        }
      }
    },
  };

  SoundSystem.init();

  // ===== 簡易ハイスコア管理 =====
  const HS_KEY = 'plicy_drive_highscore';
  function getHighScore() { try { return JSON.parse(localStorage.getItem(HS_KEY)); } catch { return null; } }
  function setHighScore(score) { localStorage.setItem(HS_KEY, JSON.stringify(score)); }

  // --- 定数 ---
  const CANVAS_W = 400, CANVAS_H = 500, ROAD_W = 240, LANE_COUNT = 3;
  const LANE_W = ROAD_W / LANE_COUNT, ROAD_LEFT = (CANVAS_W - ROAD_W) / 2;
  const LAPS = 3, LAP_LENGTH = 1500, SCROLL_SCALE = 2.5;

  const SLOT_ITEMS = {
    body: [
      { emoji: '🏎️', name: 'スポーツカー', stat: 'speed', value: 2 },
      { emoji: '🚗', name: 'セダン', stat: 'speed', value: 1 },
      { emoji: '🛻', name: 'トラック', stat: 'speed', value: 0 },
      { emoji: '🚜', name: 'トラクター', stat: 'speed', value: -1 },
      { emoji: '🛒', name: 'ショッピングカート', stat: 'speed', value: -2 },
    ],
    engine: [
      { emoji: '🔥', name: 'ターボエンジン', stat: 'accel', value: 2 },
      { emoji: '⚡', name: '電気モーター', stat: 'accel', value: 1 },
      { emoji: '💨', name: 'ガスエンジン', stat: 'accel', value: 0 },
      { emoji: '🐹', name: 'ハムスター動力', stat: 'accel', value: -1 },
      { emoji: '🧠', name: '念力エンジン', stat: 'accel', value: -2 },
    ],
    tire: [
      { emoji: '⭕', name: 'レーシングタイヤ', stat: 'handling', value: 2 },
      { emoji: '🟤', name: 'ノーマルタイヤ', stat: 'handling', value: 1 },
      { emoji: '🍩', name: 'ドーナツ', stat: 'handling', value: 0 },
      { emoji: '🍊', name: 'みかん', stat: 'handling', value: -1 },
      { emoji: '👞', name: '博士のくつ', stat: 'handling', value: -2 },
    ],
  };

  const RACE_ITEMS = [
    { name: 'バナナ', emoji: '🍌', effect: 'banana' },
    { name: 'ダッシュ', emoji: '🚀', effect: 'boost' },
    { name: 'おにぎり', emoji: '🍙', effect: 'shield' },
  ];

  const RIVAL_NAMES = ['ガンテツ', 'ヒロシ', 'マサオ'];
  const RIVAL_COLORS = ['#cc3333', '#3333cc', '#33cc33'];

  // --- 状態 ---
  let phase = 'title', slotStep = 0, slotSpinning = false;
  let selectedParts = { body: null, engine: null, tire: null };
  let playerStats = { speed: 5, accel: 5, handling: 5 };
  let raceState = null;

  // --- DOM ---
  const titleScreen = document.getElementById('title-screen');
  const slotScreen = document.getElementById('slot-screen');
  const raceScreen = document.getElementById('race-screen');
  const resultScreen = document.getElementById('result-screen');
  const conversationScreen = document.getElementById('conversation-screen');
  const yoshinoriScreen = document.getElementById('yoshinori-screen');
  const mountScreen = document.getElementById('mount-screen');
  const introScreen = document.getElementById('intro-screen');
  const startBtn = document.getElementById('start-btn');
  const slotBtn = document.getElementById('slot-btn');
  const raceBtn = document.getElementById('race-btn');
  const retryBtn = document.getElementById('retry-btn');
  const convNextBtn = document.getElementById('conv-next-btn');
  const introNextBtn = document.getElementById('intro-next-btn');
  const hakaseSpeech = document.getElementById('hakase-speech');
  const slotResult = document.getElementById('slot-result');
  const canvas = document.getElementById('race-canvas');
  const ctx = canvas.getContext('2d');
  const hudPosition = document.getElementById('hud-position');
  const hudLap = document.getElementById('hud-lap');
  const hudItem = document.getElementById('hud-item');
  const raceMessage = document.getElementById('race-message');
  const resultHighscore = document.getElementById('result-highscore');
  const titleHighscore = document.getElementById('title-highscore');

  // --- テキスト定義 ---
  const TEXT = {
    intros: [
      'ヨシノリ\n　俺はヨシノリ。\n　田舎から出てきたばかりだ',
      'ヨシノリ\n　黄金の金色ドライバー…\n　それが俺の夢だ',
      'ヨシノリ\n　博士が協力してくれるらしい。\n　頼むぜ！',
    ],
    conversation: [
      { speaker: 'ヨシノリ', text: '博士はこれが\nいいマシンだと思うの？' },
      { speaker: '博士', text: 'お？…おお、いい色じゃし、\nエンジンもいいと思うがのお…' },
      { speaker: 'ヨシノリ', text: '愚かだね' },
      { speaker: '博士', text: 'ヨシノリ…？\nどうしたんじゃ…？' },
    ],
    yoshinoriLine: 'ヨシノリ<br>「お前が<br>　マシンになるんだよ」',
    comments: [
      'ヨシノリ\n「最高のマシンだったぜ、博士！」\n博士は白目をむいて倒れた。\nお疲れさまでした。',
      'ヨシノリ\n「マシンが悪かったな…\n　おい博士、走り方見直せ」\n博士の顔は真っ青だ！',
      'ヨシノリ\n「くっ…博士、\n　お前もっと速く走れねえのか！」\n博士「ワシは人間じゃぞ…？」',
      'ヨシノリ\n「博士ッ！！\n　ゴール前で寝るなッ！！」\n博士はもう動かない。\n救急車を呼ぼう。',
    ],
    posLabels: ['1位', '2位', '3位', '4位'],
  };

  // --- ハイスコア表示 ---
  function updateHighScoreDisplay() {
    const hs = getHighScore();
    if (hs !== null) {
      titleHighscore.textContent = '👑 ベストタイム: ' + hs + '秒';
      titleHighscore.style.display = 'inline-block';
    } else {
      titleHighscore.style.display = 'none';
    }
  }
  updateHighScoreDisplay();

  // --- ヨシノリ紹介 ---
  let introStep = 0;

  function showIntroScreen() {
    introStep = 0;
    showScreen('intro');
    document.getElementById('intro-text').textContent = TEXT.intros[introStep];
  }

  function advanceIntro() {
    introStep++;
    SoundSystem.play('tap');
    if (introStep < TEXT.intros.length) {
      document.getElementById('intro-text').textContent = TEXT.intros[introStep];
    } else {
      showScreen('slot');
      initSlots();
      spinAllReels();
    }
  }

  // --- 画面切り替え ---
  function showScreen(name) {
    [titleScreen, slotScreen, raceScreen, resultScreen,
     conversationScreen, yoshinoriScreen, mountScreen, introScreen].forEach(s => s.classList.add('hidden'));
    phase = name;
    switch (name) {
      case 'title': titleScreen.classList.remove('hidden'); break;
      case 'intro': introScreen.classList.remove('hidden'); break;
      case 'slot': slotScreen.classList.remove('hidden'); break;
      case 'race': raceScreen.classList.remove('hidden'); break;
      case 'result': resultScreen.classList.remove('hidden'); break;
      case 'conversation': conversationScreen.classList.remove('hidden'); break;
      case 'yoshinori': yoshinoriScreen.classList.remove('hidden'); break;
      case 'mount': mountScreen.classList.remove('hidden'); break;
    }
  }

  // --- スロット ---
  function initSlots() {
    slotStep = 0; slotSpinning = false;
    selectedParts = { body: null, engine: null, tire: null };
    slotBtn.textContent = 'まわす！'; slotBtn.disabled = false;
    raceBtn.classList.add('hidden'); slotResult.classList.add('hidden');
    hakaseSpeech.textContent = '「パーツをスロットで決めるぞい！」';

    const reelKeys = ['body', 'engine', 'tire'];
    const reelEls = [
      document.querySelector('#reel1 .slot-strip'),
      document.querySelector('#reel2 .slot-strip'),
      document.querySelector('#reel3 .slot-strip'),
    ];
    reelEls.forEach((el, i) => {
      el.innerHTML = '';
      const items = SLOT_ITEMS[reelKeys[i]];
      for (let r = 0; r < 6; r++) {
        items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'slot-item';
          div.textContent = item.emoji;
          el.appendChild(div);
        });
      }
      el.style.top = '0px';
    });
  }

  let reelIntervals = [null, null, null];

  function spinAllReels() {
    const reelKeys = ['body', 'engine', 'tire'];
    const reelEls = document.querySelectorAll('.slot-strip');
    reelKeys.forEach((key, i) => {
      const reelEl = reelEls[i], items = SLOT_ITEMS[key], itemH = reelEl.parentElement.offsetHeight;
      reelIntervals[i] = setInterval(() => {
        const currentTop = parseFloat(reelEl.style.top) || 0;
        reelEl.style.top = (currentTop - itemH) + 'px';
        if (Math.abs(parseFloat(reelEl.style.top)) > items.length * itemH * 3) reelEl.style.top = '0px';
      }, 50 + i * 15);
    });
    slotSpinning = true;
    slotBtn.textContent = 'ストップ！';
    slotBtn.disabled = false;
    hakaseSpeech.textContent = '「クリックかスペースで止めるぞい！」';
  }

  function stopNextSlot() {
    if (!slotSpinning || slotStep >= 3) return;
    const reelKeys = ['body', 'engine', 'tire'], key = reelKeys[slotStep];
    const reelEl = document.querySelectorAll('.slot-strip')[slotStep];
    const items = SLOT_ITEMS[key], itemH = reelEl.parentElement.offsetHeight;
    clearInterval(reelIntervals[slotStep]); reelIntervals[slotStep] = null;
    const finalIdx = Math.floor(Math.random() * items.length);
    reelEl.style.top = -(finalIdx * itemH) + 'px';
    selectedParts[key] = items[finalIdx];
    SoundSystem.play('slot_stop');
    slotStep++;
    if (slotStep < 3) {
      const partLabels = ['エンジン', 'タイヤ'];
      hakaseSpeech.textContent = '「次は' + partLabels[slotStep - 1] + 'を止めるぞい！」';
    } else {
      slotSpinning = false;
      onAllSlotsComplete();
    }
  }

  function onAllSlotsComplete() {
    slotBtn.classList.add('hidden');
    playerStats.speed = 5 + selectedParts.body.value;
    playerStats.accel = 5 + selectedParts.engine.value;
    playerStats.handling = 5 + selectedParts.tire.value;
    hakaseSpeech.textContent = '';
    setTimeout(() => {
      slotResult.classList.remove('hidden');
      const b = selectedParts.body.emoji + ' ' + selectedParts.body.name;
      const e = selectedParts.engine.emoji + ' ' + selectedParts.engine.name;
      const ti = selectedParts.tire.emoji + ' ' + selectedParts.tire.name;
      slotResult.innerHTML = 'ボディ: ' + b + '<br>エンジン: ' + e + '<br>タイヤ: ' + ti +
        '<div style="margin-top:6px;">博士「なかなか良いマシンが<br>できたのう！」</div><div>ヨシノリ「……」</div>';
      raceBtn.textContent = 'つぎへ';
      raceBtn.classList.remove('hidden');
    }, 500);
  }

  // --- 会話シーン ---
  let convStep = 0;

  function showConversation() {
    convStep = 0;
    showScreen('conversation');
    SoundSystem.playBgm('ominous');
    updateConversation();
  }

  function updateConversation() {
    const line = TEXT.conversation[convStep];
    document.getElementById('conv-dialogue').textContent = line.speaker + '「' + line.text + '」';
  }

  function showYoshinoriCloseup() {
    showScreen('yoshinori');
    SoundSystem.stopBgm();
    SoundSystem.play('dramatic');
    document.getElementById('yoshinori-line').innerHTML = TEXT.yoshinoriLine;
  }

  function showMountScene() {
    showScreen('mount');
    document.getElementById('mount-instruction').textContent = 'タップして博士に乗ろう！';
    SoundSystem.playBgm('sad');
  }

  function createMountEffects() {
    const overlay = document.getElementById('mount-overlay');
    // 古い動的要素を削除
    overlay.querySelectorAll('.mount-cinema-top, .mount-cinema-bottom, .mount-gold-line').forEach(el => el.remove());

    // シネマティック黒帯
    const barTop = document.createElement('div');
    barTop.className = 'mount-cinema-top';
    overlay.appendChild(barTop);
    const barBottom = document.createElement('div');
    barBottom.className = 'mount-cinema-bottom';
    overlay.appendChild(barBottom);

    // ゴールドライン
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.className = 'mount-gold-line';
      line.style.top = (45 + i * 5) + '%';
      line.style.left = '0';
      line.style.animationDelay = (0.5 + i * 0.15) + 's';
      overlay.appendChild(line);
    }

    // スパーク
    const sparks = document.getElementById('mount-sparks');
    sparks.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const spark = document.createElement('div');
      spark.className = 'mount-spark';
      const angle = (Math.PI * 2 * i) / 16, dist = 60 + Math.random() * 100;
      spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      spark.style.left = '50%';
      spark.style.top = '50%';
      spark.style.animationDelay = (0.5 + Math.random() * 0.3) + 's';
      sparks.appendChild(spark);
    }

    // 画面振動
    mountScreen.classList.add('shaking');
    setTimeout(() => mountScreen.classList.remove('shaking'), 600);
  }

  // --- レース ---
  function startRace() {
    showScreen('race');
    SoundSystem.playBgm('race');
    const baseSpeed = 2.5 + playerStats.speed * 0.3;
    raceState = {
      player: {
        x: ROAD_LEFT + LANE_W + LANE_W / 2, lane: 1,
        speed: baseSpeed, maxSpeed: baseSpeed + 2, distance: 0, lap: 1,
        item: null, shielded: false, shieldTimer: 0, boostTimer: 0, spinTimer: 0,
        steerSpeed: 2.5 + playerStats.handling * 0.3,
      },
      rivals: RIVAL_NAMES.map((name, i) => ({
        name, color: RIVAL_COLORS[i],
        x: ROAD_LEFT + LANE_W * i + LANE_W / 2, lane: i,
        speed: 2.8 + Math.random() * 1.5, distance: 0, lap: 1,
        spinTimer: 0, changeLaneTimer: 60 + Math.random() * 120,
      })),
      obstacles: [], bananas: [], itemBoxes: [],
      scrollY: 0, countdown: 120, finished: false, finishOrder: [],
      startTime: 0, elapsed: 0,
    };
    generateTrackObjects();
    raceMessage.classList.remove('hidden');
    raceMessage.textContent = '3';
    raceLoop();
  }

  function generateTrackObjects() {
    const totalDist = LAPS * LAP_LENGTH;
    for (let d = 300; d < totalDist; d += 250 + Math.random() * 300) {
      raceState.obstacles.push({
        x: ROAD_LEFT + LANE_W * Math.floor(Math.random() * LANE_COUNT) + LANE_W / 2,
        dist: d, type: 'rock', hit: false,
      });
    }
    for (let d = 150; d < totalDist; d += 200 + Math.random() * 150) {
      raceState.itemBoxes.push({
        x: ROAD_LEFT + LANE_W * Math.floor(Math.random() * LANE_COUNT) + LANE_W / 2,
        dist: d, active: true,
      });
    }
  }

  // --- 入力 ---
  const keys = {};
  const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'z']);
  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (GAME_KEYS.has(e.key)) e.preventDefault();
    if (phase === 'slot' && (e.key === ' ' || e.key === 'Enter')) stopNextSlot();
  });
  document.addEventListener('keyup', e => { keys[e.key] = false; });

  canvas.addEventListener('mousedown', e => {
    if (phase !== 'race') return;
    const rect = canvas.getBoundingClientRect(), cx = (e.clientX - rect.left) / rect.width;
    if (cx < 0.33) keys['ArrowLeft'] = true;
    else if (cx > 0.66) keys['ArrowRight'] = true;
    else keys[' '] = true;
  });
  canvas.addEventListener('mouseup', () => { keys['ArrowLeft'] = false; keys['ArrowRight'] = false; keys[' '] = false; });
  canvas.addEventListener('mouseleave', () => { keys['ArrowLeft'] = false; keys['ArrowRight'] = false; keys[' '] = false; });
  canvas.addEventListener('touchstart', e => {
    if (phase !== 'race') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect(), cx = (e.touches[0].clientX - rect.left) / rect.width;
    if (cx < 0.33) keys['ArrowLeft'] = true;
    else if (cx > 0.66) keys['ArrowRight'] = true;
    else keys[' '] = true;
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    keys['ArrowLeft'] = false; keys['ArrowRight'] = false; keys[' '] = false;
  }, { passive: false });

  // --- レースループ ---
  let rafId = null;
  let itemEffect = { active: false, text: '', emoji: '', timer: 0, color: '' };
  let lapEffect = { active: false, lap: 0, timer: 0 };

  function raceLoop() {
    if (phase !== 'race') return;
    const rs = raceState;

    // カウントダウン
    if (rs.countdown > 0) {
      rs.countdown--;
      const sec = Math.ceil(rs.countdown / 60);
      if (sec > 0) raceMessage.textContent = sec;
      else {
        raceMessage.textContent = 'GO!';
        if (rs.countdown <= 0) {
          rs.startTime = performance.now();
          setTimeout(() => raceMessage.classList.add('hidden'), 500);
        }
      }
      drawRace();
      rafId = requestAnimationFrame(raceLoop);
      return;
    }

    rs.elapsed = performance.now() - rs.startTime;
    const p = rs.player;

    if (p.spinTimer > 0) {
      p.spinTimer--;
    } else {
      if (keys['ArrowLeft'] || keys['a']) p.x -= p.steerSpeed;
      if (keys['ArrowRight'] || keys['d']) p.x += p.steerSpeed;
      p.x = Math.max(ROAD_LEFT + 15, Math.min(ROAD_LEFT + ROAD_W - 15, p.x));
      if ((keys[' '] || keys['z']) && p.item) {
        useItem(p); keys[' '] = false; keys['z'] = false;
      }
    }

    let currentSpeed = p.speed;
    if (p.boostTimer > 0) { currentSpeed = p.maxSpeed + 3; p.boostTimer--; }
    p.distance += currentSpeed;
    if (p.shieldTimer > 0) p.shieldTimer--; else p.shielded = false;

    const newLap = Math.floor(p.distance / LAP_LENGTH) + 1;
    if (newLap > p.lap && p.lap < LAPS) {
      p.lap = Math.min(newLap, LAPS);
      lapEffect = { active: true, lap: p.lap, timer: 70 };
    }
    if (p.distance >= LAPS * LAP_LENGTH && !rs.finished) {
      if (!lapEffect.active) lapEffect = { active: true, lap: 0, timer: 70 };
      if (!rs.finishOrder.includes('player')) rs.finishOrder.push('player');
      if (rs.finishOrder.length >= 4 || rs.finishOrder.includes('player')) { endRace(); return; }
    }

    // ライバルAI
    rs.rivals.forEach((r, i) => {
      if (r.spinTimer > 0) { r.spinTimer--; return; }
      r.distance += r.speed + Math.sin(rs.elapsed / 1000 + i) * 0.5;
      r.changeLaneTimer--;
      if (r.changeLaneTimer <= 0) { r.lane = Math.floor(Math.random() * LANE_COUNT); r.changeLaneTimer = 90 + Math.random() * 120; }
      r.x += (ROAD_LEFT + LANE_W * r.lane + LANE_W / 2 - r.x) * 0.05;
      if (r.distance >= LAPS * LAP_LENGTH && !rs.finishOrder.includes(r.name)) rs.finishOrder.push(r.name);
      r.lap = Math.min(Math.floor(r.distance / LAP_LENGTH) + 1, LAPS);
    });

    // 当たり判定
    const viewDist = p.distance;
    rs.obstacles.forEach(ob => {
      if (ob.hit) return;
      const relY = ob.dist - viewDist;
      if (Math.abs(relY) < 15 && Math.abs(ob.x - p.x) < 22) {
        ob.hit = true;
        if (!p.shielded) { p.spinTimer = 25; SoundSystem.play('hit'); }
      }
    });
    rs.bananas = rs.bananas.filter(b => {
      for (const r of rs.rivals) {
        if (Math.abs(b.dist - r.distance) < 20 && Math.abs(b.x - r.x) < 22) { r.spinTimer = 30; return false; }
      }
      return true;
    });
    rs.itemBoxes.forEach(box => {
      if (!box.active) return;
      if (Math.abs(box.dist - viewDist) < 30 && Math.abs(box.x - p.x) < 30 && !p.item) {
        p.item = RACE_ITEMS[Math.floor(Math.random() * RACE_ITEMS.length)];
        box.active = false; SoundSystem.play('pickup');
      }
    });

    // HUD
    const allRacers = [{ name: 'player', dist: p.distance }, ...rs.rivals.map(r => ({ name: r.name, dist: r.distance }))].sort((a, b) => b.dist - a.dist);
    const position = allRacers.findIndex(r => r.name === 'player') + 1;
    hudPosition.textContent = '順位: ' + ['1st', '2nd', '3rd', '4th'][position - 1];
    hudLap.textContent = 'LAP ' + Math.min(p.lap, LAPS) + '/' + LAPS;
    hudItem.textContent = p.item ? p.item.emoji + ' ' + p.item.name : '';

    if (itemEffect.active) { itemEffect.timer--; if (itemEffect.timer <= 0) itemEffect.active = false; }
    if (lapEffect.active) { lapEffect.timer--; if (lapEffect.timer <= 0) lapEffect.active = false; }

    drawRace();
    rafId = requestAnimationFrame(raceLoop);
  }

  function useItem(p) {
    const item = p.item; p.item = null;
    switch (item.effect) {
      case 'banana':
        raceState.bananas.push({ x: p.x, dist: p.distance - 50 });
        showItemEffect('🍌 バナナ設置！', '🍌', '#ffee00');
        SoundSystem.play('banana_set'); break;
      case 'boost':
        p.boostTimer = 60;
        showItemEffect('🚀 ダッシュ！！', '🚀', '#ff4400');
        SoundSystem.play('boost'); break;
      case 'shield':
        p.shielded = true; p.shieldTimer = 180;
        showItemEffect('🍙 おにぎりバリア！', '🍙', '#66ccff');
        SoundSystem.play('shield'); break;
    }
  }

  function showItemEffect(text, emoji, color) {
    itemEffect = { active: true, text, emoji, timer: 50, color };
  }

  // --- 描画 ---
  function drawRace() {
    const rs = raceState, p = rs.player, viewDist = p.distance;

    ctx.fillStyle = '#7cac5c'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#888'; ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);
    ctx.fillStyle = '#fff'; ctx.fillRect(ROAD_LEFT - 3, 0, 6, CANVAS_H); ctx.fillRect(ROAD_LEFT + ROAD_W - 3, 0, 6, CANVAS_H);

    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.setLineDash([20, 20]);
    const dashOffset = (viewDist * SCROLL_SCALE) % 40;
    for (let lane = 1; lane < LANE_COUNT; lane++) {
      const lx = ROAD_LEFT + LANE_W * lane;
      ctx.beginPath(); ctx.moveTo(lx, -dashOffset); ctx.lineTo(lx, CANVAS_H); ctx.stroke();
    }
    ctx.setLineDash([]);

    const treeSpacing = 120;
    for (let i = 0; i < 10; i++) {
      const treeY = ((i * treeSpacing - (viewDist * SCROLL_SCALE) % treeSpacing) + CANVAS_H) % (CANVAS_H + treeSpacing) - 40;
      drawTree(ROAD_LEFT - 35, treeY);
      drawTree(ROAD_LEFT + ROAD_W + 15, treeY);
    }

    rs.obstacles.forEach(ob => {
      const screenY = CANVAS_H - 80 - (ob.dist - viewDist) * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) drawRock(ob.x, screenY);
    });
    rs.itemBoxes.forEach(box => {
      if (!box.active) return;
      const screenY = CANVAS_H - 80 - (box.dist - viewDist) * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) drawItemBox(box.x, screenY);
    });
    rs.bananas.forEach(b => {
      const screenY = CANVAS_H - 80 - (b.dist - viewDist) * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) {
        ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🍌', b.x, screenY);
      }
    });
    rs.rivals.forEach(r => {
      const screenY = CANVAS_H - 80 - (r.distance - viewDist) * SCROLL_SCALE;
      if (screenY > -60 && screenY < CANVAS_H + 60) drawRivalCar(r.x, screenY, r.color, r.name, r.spinTimer > 0);
    });
    drawPlayerHakase(p.x, CANVAS_H - 80, p);

    // ラッププログレスバー
    const lapProg = (p.distance % LAP_LENGTH) / LAP_LENGTH;
    const barW = CANVAS_W - 20, barX = 10, barY = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = (p.lap >= LAPS && lapProg > 0.8) ? '#ff3333' : '#ffd700';
    ctx.fillRect(barX, barY, barW * lapProg, 8);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, 8);
    for (let i = 1; i <= LAPS; i++) {
      const dotX = barX + (barW / LAPS) * i;
      ctx.fillStyle = i <= p.lap ? '#ffd700' : '#888';
      ctx.beginPath(); ctx.arc(dotX, barY + 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(i, dotX, barY + 7);
    }

    // ラップ更新演出
    if (lapEffect.active) {
      const alpha = Math.min(1, lapEffect.timer / 25);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = lapEffect.lap === 0 ? 'rgba(255,50,50,0.7)' : 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, CANVAS_H * 0.25 - 25, CANVAS_W, 50);
      ctx.font = 'bold 28px "Zen Maru Gothic", sans-serif'; ctx.textAlign = 'center';
      const txt = lapEffect.lap === 0 ? 'GOAL!!' : 'LAP ' + lapEffect.lap + ' / ' + LAPS;
      const subTxt = lapEffect.lap === 0 ? '' : lapEffect.lap === LAPS ? 'ファイナルラップ！' : 'ナイスラン！';
      ctx.fillStyle = '#fff';
      ctx.fillText(txt, CANVAS_W / 2 + (70 - lapEffect.timer) * 0.2, CANVAS_H * 0.25 + 5);
      if (subTxt) {
        ctx.font = 'bold 16px "Zen Maru Gothic", sans-serif';
        ctx.fillStyle = lapEffect.lap === LAPS ? '#ff4444' : '#ffd700';
        ctx.fillText(subTxt, CANVAS_W / 2, CANVAS_H * 0.25 + 28);
      }
      ctx.restore();
    }

    // アイテム使用演出
    if (itemEffect.active) {
      const alpha = Math.min(1, itemEffect.timer / 20);
      const scale = 1 + (50 - itemEffect.timer) * 0.02;
      ctx.fillStyle = itemEffect.color + Math.floor(alpha * 40).toString(16).padStart(2, '0');
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.save();
      ctx.translate(CANVAS_W / 2, CANVAS_H * 0.35); ctx.scale(scale, scale);
      ctx.font = 'bold 22px "Zen Maru Gothic", sans-serif'; ctx.textAlign = 'center'; ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000'; ctx.fillText(itemEffect.text, 2, 2);
      ctx.fillStyle = itemEffect.color; ctx.fillText(itemEffect.text, 0, 0);
      ctx.restore();
    }
  }

  function drawTree(x, y) {
    ctx.fillStyle = '#8B6914'; ctx.fillRect(x - 4, y + 10, 8, 15);
    ctx.fillStyle = '#2d6b1e'; ctx.beginPath(); ctx.arc(x, y + 5, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a8a2a'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  }

  function drawRock(x, y) {
    ctx.fillStyle = '#666'; ctx.beginPath(); ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(x - 2, y - 2, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawItemBox(x, y) {
    const b = Math.sin(performance.now() / 200) * 3;
    ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#cc6600'; ctx.lineWidth = 2;
    ctx.fillRect(x - 12, y - 12 + b, 24, 24); ctx.strokeRect(x - 12, y - 12 + b, 24, 24);
    ctx.fillStyle = '#cc6600'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('?', x, y + 5 + b);
  }

  function drawPlayerHakase(x, y, p) {
    const w = Math.sin(performance.now() / 100) * 2;
    ctx.save(); ctx.translate(x, y);
    if (p.spinTimer > 0) ctx.rotate(Math.sin(performance.now() / 50) * 0.5);

    // 博士（四つん這い）
    ctx.fillStyle = '#e8d5b0'; ctx.fillRect(-18, 5 + w, 36, 14);
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(-20, 3 + w, 40, 16);
    ctx.fillStyle = '#e8d5b0'; ctx.beginPath(); ctx.arc(22, 6 + w, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(24, 5 + w, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#999'; ctx.fillRect(26, 9 + w, 6, 3);
    ctx.fillStyle = '#e8d5b0';
    ctx.fillRect(-22, 17 + w, 6, 10); ctx.fillRect(-8, 17 + w, 6, 10);
    ctx.fillRect(10, 17 + w, 6, 10); ctx.fillRect(22, 17 + w, 6, 10);

    // 少年（博士の上）
    ctx.fillStyle = '#ff6633'; ctx.fillRect(-8, -18 + w, 16, 16);
    ctx.fillStyle = '#ffcc88'; ctx.fillRect(-14, -14 + w, 6, 12); ctx.fillRect(8, -14 + w, 6, 12);
    ctx.fillStyle = '#ffcc88'; ctx.beginPath(); ctx.arc(0, -26 + w, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(0, -31 + w, 11, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#aa2222'; ctx.fillRect(-14, -31 + w, 8, 4);
    ctx.fillStyle = '#f5deb3'; ctx.save(); ctx.translate(3, -25 + w); ctx.rotate(0.3); ctx.fillRect(-4, -1.5, 8, 3); ctx.restore();
    ctx.fillStyle = '#000'; ctx.fillRect(-4, -28 + w, 3, 3); ctx.fillRect(2, -28 + w, 3, 3);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -22 + w, 4, 0.1, Math.PI - 0.1); ctx.stroke();

    if (p.shielded) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (p.boostTimer > 0) {
      ctx.fillStyle = '#ff4400';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-6 + i * 6 + Math.random() * 4, 28 + Math.random() * 10, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawRivalCar(x, y, color, name, spinning) {
    ctx.save(); ctx.translate(x, y);
    if (spinning) ctx.rotate(Math.sin(performance.now() / 50) * 0.5);

    // タイヤ
    ctx.fillStyle = '#333';
    ctx.fillRect(-16, -2, 5, 6); ctx.fillRect(11, -2, 5, 6);
    ctx.fillRect(-16, 10, 5, 6); ctx.fillRect(11, 10, 5, 6);
    // 車体
    ctx.fillStyle = color; ctx.fillRect(-14, -4, 28, 18);
    // 屋根
    ctx.fillStyle = color; ctx.globalAlpha = 0.7; ctx.fillRect(-10, -14, 20, 12); ctx.globalAlpha = 1;
    // フロントガラス
    ctx.fillStyle = '#aaddff'; ctx.fillRect(-8, -12, 16, 5);
    // ヘッドライト
    ctx.fillStyle = '#ffee44'; ctx.fillRect(-10, -5, 4, 3); ctx.fillRect(6, -5, 4, 3);
    // テールランプ
    ctx.fillStyle = '#ff3333'; ctx.fillRect(-10, 11, 4, 3); ctx.fillRect(6, 11, 4, 3);
    // 名前
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(name, 0, -20);
    ctx.restore();
  }

  // --- レース終了 ---
  function endRace() {
    raceState.finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    SoundSystem.stopBgm();

    const pos = raceState.finishOrder.indexOf('player');
    const position = pos === -1 ? 4 : pos + 1;
    const sec = (raceState.elapsed / 1000).toFixed(2);
    const secNum = parseFloat(sec);

    const resultTitleEl = document.getElementById('result-title');
    const resultComment = document.getElementById('result-comment');
    const resultTime = document.getElementById('result-time');

    resultTitleEl.textContent = '結果: ' + TEXT.posLabels[position - 1] + '！';
    resultTitleEl.style.color = position === 1 ? '#ffd700' : '#cc6600';
    resultComment.textContent = TEXT.comments[position - 1];
    resultTime.textContent = 'タイム: ' + sec + '秒';

    // ハイスコア
    let isNewHigh = false;
    if (position === 1) {
      const prev = getHighScore();
      if (prev === null || secNum < prev) { setHighScore(secNum); isNewHigh = true; }
    }
    const hs = getHighScore();
    if (hs !== null) {
      resultHighscore.textContent = '👑 ベストタイム: ' + hs + '秒';
      resultHighscore.style.display = 'block';
    } else {
      resultHighscore.style.display = 'none';
    }
    if (isNewHigh) {
      const newRec = document.createElement('div');
      newRec.className = 'new-record';
      newRec.textContent = '🎉 NEW RECORD!';
      resultTitleEl.after(newRec);
    }
    showScreen('result');
  }

  // --- イベント ---
  startBtn.addEventListener('click', showIntroScreen);
  introNextBtn.addEventListener('click', advanceIntro);
  slotBtn.addEventListener('click', stopNextSlot);
  raceBtn.addEventListener('click', showConversation);

  convNextBtn.addEventListener('click', () => {
    convStep++;
    SoundSystem.play('tap');
    if (convStep < TEXT.conversation.length) updateConversation();
    else showYoshinoriCloseup();
  });

  yoshinoriScreen.addEventListener('click', () => {
    if (phase === 'yoshinori') showMountScene();
  });

  let mountTriggered = false;
  mountScreen.addEventListener('click', () => {
    if (phase === 'mount' && !mountTriggered) {
      mountTriggered = true;
      SoundSystem.stopBgm();
      SoundSystem.play('dramatic');
      document.getElementById('mount-text').textContent = '乗車完了';
      document.getElementById('mount-subtext').textContent = 'BOARDING COMPLETE';
      createMountEffects();
      document.getElementById('mount-overlay').classList.remove('hidden');
      setTimeout(() => {
        mountTriggered = false;
        document.getElementById('mount-overlay').classList.add('hidden');
        startRace();
      }, 2500);
    }
  });

  retryBtn.addEventListener('click', () => {
    const oldRec = document.querySelector('.new-record');
    if (oldRec) oldRec.remove();
    resultHighscore.style.display = 'none';
    showScreen('title');
    slotBtn.classList.remove('hidden');
    slotBtn.textContent = 'まわす！';
    raceBtn.textContent = 'レースへ出発！';
    updateHighScoreDisplay();
  });

  // --- 初期化 ---
  showScreen('title');

})();
