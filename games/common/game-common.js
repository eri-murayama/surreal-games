/**
 * シュールゲームス 共通モジュール
 * ゲーム間導線・サウンド・BGM・ハイスコア・実績を統合管理
 */
(function () {
  'use strict';

  const SITE_BASE = '../../';

  // ===== 正式リリース済みゲームID =====
  const RELEASED_IDS = ['escape-room', 'whack-kanikani', 'business-analysis'];

  // ===== ゲームカタログ =====
  const GAME_CATALOG = [
    { id: 'escape-room', title: 'かわいい部屋からの脱出', emoji: '🚪', genre: 'パズル', desc: '気付いたらかわいい部屋にいた。脱出せよ。' },
    { id: 'whack-kanikani', title: 'かにかにパニック！', emoji: '🦀', genre: 'アクション', desc: 'ヤクザ蟹を叩きまくれ！30秒の激闘。' },
    { id: 'business-analysis', title: '経営分析ゲーム', emoji: '📊', genre: 'アドベンチャー', desc: '天才たちの戯れ。数字に愛されろ。' },
    { id: 'chaos-stream', title: 'カオス配信シミュレーター', emoji: '📺', genre: 'シミュレーション', desc: 'あなたの配信、カオスです。' },
    { id: 'cosmic-chain', title: 'コズミック・チェイン', emoji: '🌟', genre: 'パズル', desc: '星々の連鎖反応を起こせ。' },
    { id: 'dress-up', title: 'びじんメーカー', emoji: '👗', genre: 'カスタマイズ', desc: 'あなただけのびじんを作ろう。' },
    { id: 'drive', title: '黄金ドライバー', emoji: '🚗', genre: 'レース', desc: '博士のせなかでGO！' },
    { id: 'elite-english', title: 'エリートイングリッシュ！', emoji: '🎓', genre: 'クイズ', desc: 'エリートな英語力を見せつけろ。' },
    { id: 'fortune', title: 'シュール前世占い', emoji: '🔮', genre: '占い', desc: 'あなたの前世は何だった？' },
    { id: 'holo-analysis', title: 'ホロメン経営分析', emoji: '📈', genre: 'クイズ', desc: '鼻毛たちの戯れ。' },
    { id: 'holo-memory', title: 'ホロメンおぼえてますか？', emoji: '🃏', genre: '記憶', desc: '神経衰弱でホロメンを覚えろ。' },
    { id: 'magic-trick', title: 'マジックみやぶり', emoji: '🎩', genre: 'クイズ', desc: 'トリックを見破れ！' },
    { id: 'party-game', title: 'ぱーてぃーげーむ', emoji: '🎉', genre: 'パーティー', desc: '連打バトルで友達と対戦。' },
    { id: 'pet', title: 'シュールペット', emoji: '🐣', genre: '育成', desc: 'ナゾの生きもの育成記。' },
    { id: 'puzzle-2048', title: 'シュール進化論', emoji: '🧬', genre: 'パズル', desc: '合体せよ、その先の未知へ。' },
    { id: 'rpg', title: 'ドットクエスト', emoji: '⚔️', genre: 'RPG', desc: '冒険の旅に出よう。' },
    { id: 'suisei-puzzle', title: 'すいすいパズル', emoji: '☄️', genre: 'パズル', desc: '彗星のごとくブロックを消せ。' },
    { id: 'tower', title: 'シュールの塔', emoji: '🏰', genre: 'ローグライク', desc: '終わりなき階段の先へ。' },
    { id: 'trivia-king', title: '雑学キング決定戦', emoji: '👑', genre: 'クイズ', desc: '無駄な知識で天下を取れ！' },
    { id: 'unko-cone', title: 'うんコーンキャッチャー', emoji: '🦄', genre: 'アクション', desc: 'うんコーンを積み上げろ！' },
  ];

  // ===== 実績定義 =====
  const ACHIEVEMENT_DEFS = [
    { id: 'first_play', title: 'はじめの一歩', desc: '初めてゲームをプレイした', emoji: '👣', condition: (stats) => stats.totalPlays >= 1 },
    { id: 'play_5', title: 'ゲーム好き', desc: '5回ゲームをプレイした', emoji: '🎮', condition: (stats) => stats.totalPlays >= 5 },
    { id: 'play_20', title: 'ゲーマー', desc: '20回ゲームをプレイした', emoji: '🏆', condition: (stats) => stats.totalPlays >= 20 },
    { id: 'play_50', title: 'シュールマスター', desc: '50回ゲームをプレイした', emoji: '👑', condition: (stats) => stats.totalPlays >= 50 },
    { id: 'explorer_3', title: '冒険者', desc: '3種類のゲームをプレイした', emoji: '🗺️', condition: (stats) => stats.uniqueGames >= 3 },
    { id: 'explorer_10', title: '大冒険者', desc: '10種類のゲームをプレイした', emoji: '🌍', condition: (stats) => stats.uniqueGames >= 10 },
    { id: 'explorer_all', title: 'コンプリート！', desc: '全ゲームをプレイした', emoji: '✨', condition: (stats) => stats.uniqueGames >= GAME_CATALOG.length },
    { id: 'high_scorer', title: 'ハイスコアラー', desc: 'ハイスコアを10回更新した', emoji: '📈', condition: (stats) => stats.highScoreUpdates >= 10 },
    { id: 'night_owl', title: '夜更かしゲーマー', desc: '深夜0時〜4時にプレイした', emoji: '🦉', condition: () => { const h = new Date().getHours(); return h >= 0 && h < 4; } },
    { id: 'early_bird', title: '早起きゲーマー', desc: '朝5時〜7時にプレイした', emoji: '🐔', condition: () => { const h = new Date().getHours(); return h >= 5 && h < 7; } },
  ];

  // ===== BGMシステム =====
  // ゲームジャンル別にシンセサイザーでBGMを生成
  const BGM_PRESETS = {
    // かわいい・ポップ系（脱出ゲーム、びじんメーカー、占い）
    cute: {
      tempo: 120, key: 'C', wave: 'sine', volume: 0.12,
      melody: [
        523, 587, 659, 784, 659, 784, 880, 784,
        659, 587, 523, 587, 659, 784, 659, 523,
        440, 494, 523, 587, 523, 587, 659, 587,
        523, 494, 440, 494, 523, 587, 523, 440,
      ],
      bass: [
        262, 262, 330, 330, 349, 349, 392, 392,
        262, 262, 330, 330, 349, 349, 262, 262,
        220, 220, 262, 262, 294, 294, 330, 330,
        220, 220, 262, 262, 220, 220, 220, 220,
      ]
    },
    // アクション・テンション系（かにかに、うんコーン）
    action: {
      tempo: 150, key: 'Am', wave: 'square', volume: 0.08,
      melody: [
        440, 523, 587, 659, 587, 523, 440, 392,
        440, 523, 587, 784, 659, 587, 523, 440,
        349, 440, 523, 587, 523, 440, 349, 330,
        349, 440, 523, 659, 587, 523, 440, 349,
      ],
      bass: [
        220, 220, 220, 220, 262, 262, 262, 262,
        220, 220, 220, 220, 294, 294, 262, 262,
        175, 175, 175, 175, 220, 220, 220, 220,
        175, 175, 175, 175, 196, 196, 220, 220,
      ]
    },
    // ミステリー・サスペンス系（経営分析、マジック）
    mystery: {
      tempo: 90, key: 'Dm', wave: 'triangle', volume: 0.10,
      melody: [
        294, 349, 330, 294, 262, 294, 349, 330,
        440, 392, 349, 330, 294, 262, 294, 330,
        349, 392, 440, 392, 349, 330, 294, 349,
        330, 294, 262, 233, 262, 294, 330, 294,
      ],
      bass: [
        147, 147, 175, 175, 131, 131, 147, 147,
        175, 175, 196, 196, 147, 147, 131, 131,
        147, 147, 175, 175, 131, 131, 147, 147,
        175, 175, 131, 131, 147, 147, 147, 147,
      ]
    },
    // クイズ・バラエティ系（雑学、ホロ分析、英語）
    quiz: {
      tempo: 130, key: 'G', wave: 'sine', volume: 0.10,
      melody: [
        392, 440, 494, 523, 587, 523, 494, 440,
        392, 494, 587, 659, 587, 523, 494, 392,
        330, 392, 440, 494, 440, 392, 330, 294,
        330, 392, 440, 523, 494, 440, 392, 330,
      ],
      bass: [
        196, 196, 247, 247, 262, 262, 220, 220,
        196, 196, 247, 247, 294, 294, 196, 196,
        165, 165, 196, 196, 220, 220, 247, 247,
        165, 165, 196, 196, 165, 165, 196, 196,
      ]
    },
    // レトロ・ドット絵系（RPG、タワー、2048）
    retro: {
      tempo: 110, key: 'F', wave: 'square', volume: 0.07,
      melody: [
        349, 392, 440, 523, 440, 392, 349, 330,
        349, 440, 523, 587, 523, 440, 392, 349,
        294, 349, 392, 440, 392, 349, 294, 262,
        294, 349, 392, 523, 440, 392, 349, 294,
      ],
      bass: [
        175, 175, 196, 196, 220, 220, 175, 175,
        175, 175, 220, 220, 262, 262, 175, 175,
        147, 147, 175, 175, 196, 196, 220, 220,
        147, 147, 175, 175, 147, 147, 175, 175,
      ]
    },
    // 配信・サイバー系（カオス配信）
    cyber: {
      tempo: 135, key: 'Em', wave: 'sawtooth', volume: 0.06,
      melody: [
        330, 392, 440, 494, 440, 392, 330, 294,
        330, 440, 523, 587, 523, 440, 392, 330,
        247, 330, 392, 440, 392, 330, 247, 220,
        247, 330, 392, 494, 440, 392, 330, 247,
      ],
      bass: [
        165, 165, 196, 196, 220, 220, 165, 165,
        165, 165, 220, 220, 247, 247, 165, 165,
        131, 131, 165, 165, 196, 196, 220, 220,
        131, 131, 165, 165, 131, 131, 165, 165,
      ]
    },
    // メモリーゲーム・落ち着き系（神経衰弱、ペット）
    calm: {
      tempo: 85, key: 'Eb', wave: 'sine', volume: 0.10,
      melody: [
        311, 370, 415, 466, 415, 370, 311, 330,
        370, 415, 466, 523, 466, 415, 370, 311,
        277, 311, 370, 415, 370, 311, 277, 262,
        277, 311, 370, 466, 415, 370, 311, 277,
      ],
      bass: [
        156, 156, 185, 185, 208, 208, 156, 156,
        185, 185, 208, 208, 233, 233, 185, 185,
        139, 139, 156, 156, 185, 185, 208, 208,
        139, 139, 156, 156, 139, 139, 156, 156,
      ]
    },
    // パズル・宇宙系（コズミック、すいすいパズル）
    cosmic: {
      tempo: 100, key: 'Bb', wave: 'triangle', volume: 0.10,
      melody: [
        466, 523, 587, 698, 587, 523, 466, 415,
        466, 587, 698, 784, 698, 587, 523, 466,
        349, 466, 523, 587, 523, 466, 349, 311,
        349, 466, 523, 698, 587, 523, 466, 349,
      ],
      bass: [
        233, 233, 262, 262, 294, 294, 233, 233,
        233, 233, 294, 294, 349, 349, 233, 233,
        175, 175, 233, 233, 262, 262, 294, 294,
        175, 175, 233, 233, 175, 175, 233, 233,
      ]
    },
  };

  // ゲームID→BGMプリセットのマッピング
  const GAME_BGM_MAP = {
    'escape-room': 'cute',
    'whack-kanikani': 'action',
    'business-analysis': 'mystery',
    'chaos-stream': 'cyber',
    'cosmic-chain': 'cosmic',
    'dress-up': 'cute',
    'drive': 'action',
    'elite-english': 'quiz',
    'fortune': 'cute',
    'holo-analysis': 'quiz',
    'holo-memory': 'calm',
    'magic-trick': 'mystery',
    'party-game': 'action',
    'pet': 'calm',
    'puzzle-2048': 'retro',
    'rpg': 'retro',
    'suisei-puzzle': 'cosmic',
    'tower': 'retro',
    'trivia-king': 'quiz',
    'unko-cone': 'action',
  };

  // ===== サウンドシステム（Web Audio API） =====
  const SoundSystem = {
    ctx: null,
    enabled: true,
    volume: 0.5,
    bgmPlaying: false,
    bgmNodes: [],
    bgmTimers: [],
    currentBgmPreset: null,

    init() {
      const initAudio = () => {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);

      const saved = localStorage.getItem('sg_sound_enabled');
      if (saved !== null) this.enabled = saved === 'true';
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('sg_sound_enabled', this.enabled);
      if (!this.enabled) {
        this.stopBgm();
      }
      return this.enabled;
    },

    // AudioContext を遅延生成（ユーザー操作後なら安全に作れる）
    _ensureCtx() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return this.ctx;
    },

    // BGMを再生
    playBgm(presetName) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      const preset = BGM_PRESETS[presetName];
      if (!preset) return;
      this.stopBgm();
      this.currentBgmPreset = presetName;
      this.bgmPlaying = true;
      this._loopBgm(preset);
    },

    _loopBgm(preset) {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const beatDur = 60 / preset.tempo;
      const vol = preset.volume;

      // メロディ
      preset.melody.forEach((freq, i) => {
        if (!freq) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = preset.wave;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, now + beatDur * i);
        g.gain.exponentialRampToValueAtTime(0.001, now + beatDur * (i + 0.9));
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + beatDur * i);
        osc.stop(now + beatDur * (i + 0.95));
        this.bgmNodes.push(osc);
      });

      // ベースライン
      preset.bass.forEach((freq, i) => {
        if (!freq) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol * 0.5, now + beatDur * i);
        g.gain.exponentialRampToValueAtTime(0.001, now + beatDur * (i + 0.9));
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + beatDur * i);
        osc.stop(now + beatDur * (i + 0.95));
        this.bgmNodes.push(osc);
      });

      // ループ
      const loopDur = beatDur * preset.melody.length;
      const timer = setTimeout(() => {
        if (this.bgmPlaying) this._loopBgm(preset);
      }, loopDur * 1000);
      this.bgmTimers.push(timer);
    },

    stopBgm() {
      this.bgmPlaying = false;
      this.bgmNodes.forEach(n => { try { n.stop(); } catch(e) {} });
      this.bgmNodes = [];
      this.bgmTimers.forEach(t => clearTimeout(t));
      this.bgmTimers = [];
    },

    // SE再生
    play(type) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = this.volume;

      switch (type) {
        case 'tap': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        case 'correct': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.1);
          osc.frequency.setValueAtTime(784, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
        case 'wrong': {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          gain.gain.value = this.volume * 0.3;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
        case 'hit': {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
          gain.gain.value = this.volume * 0.4;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case 'combo': {
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = this.volume * 0.4;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.08 * (i + 1) + 0.1);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.08 * i);
            osc.stop(now + 0.08 * (i + 1) + 0.1);
          });
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
        case 'achievement': {
          const melody = [784, 988, 1175, 1319, 1175, 1319, 1568];
          melody.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.value = this.volume * 0.35;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.12 * (i + 1) + 0.15);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.12 * i);
            osc.stop(now + 0.12 * (i + 1) + 0.15);
          });
          break;
        }
      }
    }
  };

  // ===== ハイスコア管理 =====
  const HighScore = {
    _key(gameId) { return `sg_highscore_${gameId}`; },

    get(gameId) {
      try {
        return JSON.parse(localStorage.getItem(this._key(gameId))) || null;
      } catch { return null; }
    },

    set(gameId, score, extra) {
      const prev = this.get(gameId);
      const isNew = !prev || score > prev.score;
      if (isNew) {
        localStorage.setItem(this._key(gameId), JSON.stringify({
          score, date: new Date().toISOString(), ...extra
        }));
        Stats._increment('highScoreUpdates');
      }
      return isNew;
    },

    getDisplay(gameId) {
      const data = this.get(gameId);
      return data ? data.score : null;
    }
  };

  // ===== 統計管理 =====
  const Stats = {
    _key: 'sg_stats',

    _get() {
      try {
        return JSON.parse(localStorage.getItem(this._key)) || { totalPlays: 0, uniqueGamesPlayed: {}, highScoreUpdates: 0 };
      } catch { return { totalPlays: 0, uniqueGamesPlayed: {}, highScoreUpdates: 0 }; }
    },

    _save(data) {
      localStorage.setItem(this._key, JSON.stringify(data));
    },

    _increment(field) {
      const data = this._get();
      data[field] = (data[field] || 0) + 1;
      this._save(data);
    },

    recordPlay(gameId) {
      const data = this._get();
      data.totalPlays = (data.totalPlays || 0) + 1;
      data.uniqueGamesPlayed = data.uniqueGamesPlayed || {};
      data.uniqueGamesPlayed[gameId] = true;
      this._save(data);
    },

    getSummary() {
      const data = this._get();
      return {
        totalPlays: data.totalPlays || 0,
        uniqueGames: Object.keys(data.uniqueGamesPlayed || {}).length,
        highScoreUpdates: data.highScoreUpdates || 0,
      };
    }
  };

  // ===== 実績管理 =====
  const Achievements = {
    _key: 'sg_achievements',

    _get() {
      try {
        return JSON.parse(localStorage.getItem(this._key)) || {};
      } catch { return {}; }
    },

    check() {
      const unlocked = this._get();
      const stats = Stats.getSummary();
      const newlyUnlocked = [];

      for (const def of ACHIEVEMENT_DEFS) {
        if (!unlocked[def.id] && def.condition(stats)) {
          unlocked[def.id] = { date: new Date().toISOString() };
          newlyUnlocked.push(def);
        }
      }

      if (newlyUnlocked.length > 0) {
        localStorage.setItem(this._key, JSON.stringify(unlocked));
        newlyUnlocked.forEach(a => this._showNotification(a));
      }

      return newlyUnlocked;
    },

    getAll() {
      const unlocked = this._get();
      return ACHIEVEMENT_DEFS.map(def => ({
        ...def,
        unlocked: !!unlocked[def.id],
        date: unlocked[def.id]?.date || null,
      }));
    },

    _showNotification(achievement) {
      SoundSystem.play('achievement');

      const el = document.createElement('div');
      el.className = 'sg-achievement-notification';
      el.innerHTML = `
        <div class="sg-achievement-icon">${achievement.emoji}</div>
        <div class="sg-achievement-info">
          <div class="sg-achievement-label">実績解除！</div>
          <div class="sg-achievement-title">${achievement.title}</div>
          <div class="sg-achievement-desc">${achievement.desc}</div>
        </div>
      `;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.classList.add('sg-achievement-show');
      });

      setTimeout(() => {
        el.classList.remove('sg-achievement-show');
        el.classList.add('sg-achievement-hide');
        setTimeout(() => el.remove(), 500);
      }, 3500);
    }
  };

  // ===== i18n ヘルパー（i18n.js が読み込まれていなくても動作する） =====
  function _t(key, fallback) {
    if (window.SurrealI18n && typeof window.SurrealI18n.t === 'function') {
      return window.SurrealI18n.t(key);
    }
    return fallback;
  }

  // ===== ゲーム間導線（おすすめゲーム） =====
  // 試作品を除外して正式リリース済みゲームのみ表示
  function createRecommendSection(currentGameId) {
    const released = GAME_CATALOG.filter(g => RELEASED_IDS.includes(g.id) && g.id !== currentGameId);
    // リリース済みが2つ以下なら全表示、3つ以上ならランダム3つ
    const shuffled = released.sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);

    const section = document.createElement('div');
    section.className = 'sg-recommend';
    section.innerHTML = `
      <div class="sg-recommend-title">${_t('otherGames', '🎮 他のゲームも遊ぶ')}</div>
      <div class="sg-recommend-cards">
        ${picks.map(g => `
          <a href="../${g.id}/index.html" class="sg-recommend-card">
            <span class="sg-recommend-emoji">${g.emoji}</span>
            <span class="sg-recommend-name">${g.title}</span>
            <span class="sg-recommend-genre">${g.genre}</span>
          </a>
        `).join('')}
      </div>
    `;

    return section;
  }

  // ===== サウンドトグルボタン =====
  function createSoundToggle() {
    const btn = document.createElement('button');
    btn.className = 'sg-sound-toggle';
    btn.setAttribute('aria-label', 'サウンド切替');
    btn.textContent = SoundSystem.enabled ? '🔊' : '🔇';
    btn.addEventListener('click', () => {
      const on = SoundSystem.toggle();
      btn.textContent = on ? '🔊' : '🔇';
      if (on) SoundSystem.play('tap');
    });
    document.body.appendChild(btn);
    return btn;
  }

  // ===== 初期化 =====
  function init(gameId) {
    SoundSystem.init();
    createSoundToggle();

    // ゲーム間導線をリザルト画面に挿入
    function insertRecommendSections() {
      const resultScreens = document.querySelectorAll(
        '#result-screen, #gameover-screen, #ending-screen, #victory-screen'
      );
      resultScreens.forEach(screen => {
        const existing = screen.querySelector('.sg-recommend');
        if (existing) existing.remove();
        screen.appendChild(createRecommendSection(gameId));
      });
    }

    insertRecommendSections();

    // 動的に生成されるクリア画面を監視（脱出ゲーム等）
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && (
            node.id === 'clear-overlay' ||
            node.classList?.contains('clear-overlay') ||
            node.id === 'result-screen' ||
            node.id === 'gameover-screen' ||
            node.id === 'ending-screen' ||
            node.id === 'victory-screen'
          )) {
            if (!node.querySelector('.sg-recommend')) {
              node.appendChild(createRecommendSection(gameId));
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // i18n が利用可能なら、言語変更時にラベルを更新
    if (window.SurrealI18n && typeof window.SurrealI18n.onLangChange === 'function') {
      window.SurrealI18n.onLangChange(function () {
        insertRecommendSections();
      });
    }

    return {
      sound: SoundSystem,
      highScore: HighScore,
      stats: Stats,
      achievements: Achievements,

      // ゲーム開始時に呼ぶ
      onGameStart() {
        SoundSystem.play('start');
        // BGM開始
        const bgmPreset = GAME_BGM_MAP[gameId];
        if (bgmPreset) {
          SoundSystem.playBgm(bgmPreset);
        }
      },

      // ゲーム終了時に呼ぶ（スコアは任意）
      onGameEnd(score, extra) {
        Stats.recordPlay(gameId);
        SoundSystem.stopBgm();
        SoundSystem.play('result');

        let isNewHigh = false;
        if (score !== undefined && score !== null) {
          isNewHigh = HighScore.set(gameId, score, extra);
        }

        // 実績チェック（少し遅らせて演出と被らないように）
        setTimeout(() => Achievements.check(), 1000);

        return { isNewHigh };
      },

      // ハイスコア表示用
      getHighScore() {
        return HighScore.getDisplay(gameId);
      },

      // BGMを手動で開始/停止
      startBgm() {
        const bgmPreset = GAME_BGM_MAP[gameId];
        if (bgmPreset) SoundSystem.playBgm(bgmPreset);
      },
      stopBgm() {
        SoundSystem.stopBgm();
      }
    };
  }

  // グローバルに公開
  window.SurrealGames = { init, GAME_CATALOG, SoundSystem, HighScore, Stats, Achievements };
})();
