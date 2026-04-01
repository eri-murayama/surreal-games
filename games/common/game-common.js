/**
 * シュールゲームス 共通モジュール
 * ゲーム間導線・サウンド・BGM・ハイスコア・実績を統合管理
 */
(function () {
  'use strict';

  // ===== ピンチズーム防止（iOS Safari対応） =====
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) { e.preventDefault(); }
  }, { passive: false });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function (e) { e.preventDefault(); });

  const SITE_BASE = '../../';

  // ===== 正式リリース済みゲームID =====
  const RELEASED_IDS = ['drive', 'escape-room', 'whack-kanikani', 'business-analysis'];

  // ===== ゲームカタログ =====
  const GAME_CATALOG = [
    { id: 'escape-room', title: 'かわいい部屋からの脱出', titleEn: 'Escape Room', emoji: '🚪', genre: 'パズル', genreEn: 'Puzzle', desc: '気付いたらかわいい部屋にいた。脱出せよ。' },
    { id: 'whack-kanikani', title: 'かにかにパニック！ ‐カニみそが飛び出ちゃう‐', titleEn: 'Kani-Kani Panic!', emoji: '🦀', genre: 'アクション', genreEn: 'Action', desc: 'ヤクザ蟹を叩きまくれ！30秒の激闘。' },
    { id: 'business-analysis', title: '経営分析ゲーム', titleEn: 'Business Analysis', emoji: '📊', genre: 'アドベンチャー', genreEn: 'Adventure', desc: '天才たちの戯れ。数字に愛されろ。' },
    { id: 'chaos-stream', title: 'カオス配信シミュレーター', emoji: '📺', genre: 'シミュレーション', desc: 'あなたの配信、カオスです。' },
    { id: 'cosmic-chain', title: 'コズミック・チェイン', emoji: '🌟', genre: 'パズル', desc: '星々の連鎖反応を起こせ。' },
    { id: 'dress-up', title: 'びじんメーカー', emoji: '👗', genre: 'カスタマイズ', desc: 'あなただけのびじんを作ろう。' },
    { id: 'drive', title: '黄金ドライバー', titleEn: 'Golden Gold Driver', emoji: '🚗', genre: 'レース', genreEn: 'Racing', desc: '博士のせなかでGO！' },
    { id: 'elite-english', title: 'エリートイングリッシュ！', emoji: '🎓', genre: 'クイズ', desc: 'エリートな英語力を見せつけろ。' },
    { id: 'fortune', title: 'シュール前世占い', emoji: '🔮', genre: '占い', desc: 'あなたの前世は何だった？' },
    { id: 'holo-analysis', title: 'ホロメン経営分析', emoji: '📈', genre: 'クイズ', desc: '鼻毛たちの戯れ。' },
    { id: 'holo-memory', title: 'ホロメンおぼえてますか？', emoji: '🃏', genre: '記憶', desc: '神経衰弱でホロメンを覚えろ。' },
    { id: 'magic-trick', title: '協力者', emoji: '🤝', genre: 'アクション', desc: 'テーブル下からイカサマを手伝え！' },
    { id: 'party-game', title: 'ぱーてぃーげーむ', emoji: '🎉', genre: 'パーティー', desc: '連打バトルで友達と対戦。' },
    { id: 'pet', title: 'シュールペット', emoji: '🐣', genre: '育成', desc: 'ナゾの生きもの育成記。' },
    { id: 'puzzle-2048', title: 'シュール進化論', emoji: '🧬', genre: 'パズル', desc: '合体せよ、その先の未知へ。' },
    { id: 'rpg', title: 'お散歩日和', emoji: '⚔️', genre: 'RPG', desc: '冒険の旅に出よう。' },
    { id: 'suisei-puzzle', title: 'すいすいパズル', emoji: '☄️', genre: 'パズル', desc: '彗星のごとくブロックを消せ。' },
    { id: 'tower', title: 'シュールの塔', emoji: '🏰', genre: 'ローグライク', desc: '終わりなき階段の先へ。' },
    { id: 'trivia-king', title: '雑学キング決定戦', emoji: '👑', genre: 'クイズ', desc: '無駄な知識で天下を取れ！' },
    { id: 'unko-cone', title: 'うんコーンキャッチャー', emoji: '🦄', genre: 'アクション', desc: 'うんコーンを積み上げろ！' },
    { id: 'solitaire', title: 'ソリティア', titleEn: 'Solitaire', emoji: '♠', genre: 'カード', genreEn: 'Card', desc: 'クラシックなクロンダイクソリティア。' },
    { id: 'sudoku', title: '数独', titleEn: 'Sudoku', emoji: '🔢', genre: 'パズル', genreEn: 'Puzzle', desc: '3段階の難易度で遊べる本格数独。' },
    { id: 'minesweeper', title: 'マインスイーパー', titleEn: 'Minesweeper', emoji: '💣', genre: 'パズル', genreEn: 'Puzzle', desc: '地雷を避けてマスを開けろ。' },
    { id: 'reversi', title: 'リバーシ', titleEn: 'Reversi', emoji: '⚫', genre: 'ボード', genreEn: 'Board', desc: 'CPU対戦3段階。石をひっくり返せ。' },
    { id: 'slide-puzzle', title: 'スライドパズル', titleEn: 'Slide Puzzle', emoji: '🧩', genre: 'パズル', genreEn: 'Puzzle', desc: 'タイルをスライドして揃えろ。' },
    { id: 'hashimoto', title: '橋本さん', titleEn: 'Hashimoto-san', emoji: '👤', genre: 'クイズ', genreEn: 'Quiz', desc: '苗字ランキングで勝負だ！' },
    { id: 'ireland', title: 'アイルランドゲーム', titleEn: 'Ireland Game', emoji: '☘️', genre: 'クイズ', genreEn: 'Quiz', desc: '似ているものの中からアイルランドを探せ！' },
  ];

  // ===== 実績定義 =====
  const ACHIEVEMENT_DEFS = [
    { id: 'first_play', title: 'はじめの一歩', titleEn: 'First Step', desc: '初めてゲームをプレイした', descEn: 'Played a game for the first time', emoji: '👣', condition: (stats) => stats.totalPlays >= 1 },
    { id: 'play_5', title: 'ゲーム好き', titleEn: 'Game Lover', desc: '5回ゲームをプレイした', descEn: 'Played games 5 times', emoji: '🎮', condition: (stats) => stats.totalPlays >= 5 },
    { id: 'play_20', title: 'ゲーマー', titleEn: 'Gamer', desc: '20回ゲームをプレイした', descEn: 'Played games 20 times', emoji: '🏆', condition: (stats) => stats.totalPlays >= 20 },
    { id: 'play_50', title: 'シュールマスター', titleEn: 'Surreal Master', desc: '50回ゲームをプレイした', descEn: 'Played games 50 times', emoji: '👑', condition: (stats) => stats.totalPlays >= 50 },
    { id: 'explorer_3', title: '冒険者', titleEn: 'Adventurer', desc: '3種類のゲームをプレイした', descEn: 'Played 3 different games', emoji: '🗺️', condition: (stats) => stats.uniqueGames >= 3 },
    { id: 'explorer_10', title: '大冒険者', titleEn: 'Great Adventurer', desc: '10種類のゲームをプレイした', descEn: 'Played 10 different games', emoji: '🌍', condition: (stats) => stats.uniqueGames >= 10 },
    { id: 'explorer_all', title: 'コンプリート！', titleEn: 'Complete!', desc: '全ゲームをプレイした', descEn: 'Played every game', emoji: '✨', condition: (stats) => stats.uniqueGames >= GAME_CATALOG.length },
    { id: 'high_scorer', title: 'ハイスコアラー', titleEn: 'High Scorer', desc: 'ハイスコアを10回更新した', descEn: 'Beat your high score 10 times', emoji: '📈', condition: (stats) => stats.highScoreUpdates >= 10 },
    { id: 'night_owl', title: '夜更かしゲーマー', titleEn: 'Night Owl', desc: '深夜0時〜4時にプレイした', descEn: 'Played between 12 AM and 4 AM', emoji: '🦉', condition: () => { const h = new Date().getHours(); return h >= 0 && h < 4; } },
    { id: 'early_bird', title: '早起きゲーマー', titleEn: 'Early Bird', desc: '朝5時〜7時にプレイした', descEn: 'Played between 5 AM and 7 AM', emoji: '🐔', condition: () => { const h = new Date().getHours(); return h >= 5 && h < 7; } },
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
    // アクション・テンション系（うんコーン）
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
    // ポップ・元気系（かにかに）— オルゴール風、テンポ揺れあり
    pop: {
      tempo: 160, key: 'C', wave: 'triangle', volume: 0.08,
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
      // 各ノートのテンポ倍率（<1で速く、>1で遅く）
      swing: [
        0.8, 0.7, 0.6, 1.2, 0.8, 0.7, 0.6, 1.3,
        0.7, 0.6, 0.6, 1.2, 0.8, 0.7, 0.6, 1.4,
        0.9, 0.8, 0.7, 1.3, 0.8, 0.7, 0.9, 1.2,
        0.7, 0.6, 0.6, 1.3, 0.8, 0.7, 0.8, 1.5,
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
    // レース・スピード系（黄金ドライバー）— 疾走感あるロック調
    race: {
      tempo: 180, key: 'Em', wave: 'sawtooth', volume: 0.07,
      melody: [
        330, 392, 494, 659, 494, 659, 784, 659,
        587, 659, 784, 988, 784, 659, 587, 494,
        330, 494, 587, 659, 784, 659, 587, 494,
        392, 494, 587, 784, 659, 587, 494, 392,
      ],
      bass: [
        165, 165, 165, 165, 196, 196, 196, 196,
        220, 220, 220, 220, 247, 247, 196, 196,
        165, 165, 165, 165, 196, 196, 196, 196,
        220, 220, 247, 247, 196, 196, 165, 165,
      ]
    },
    // 悲しい系（黄金ドライバー 博士に乗るシーン）
    sad: {
      tempo: 65, key: 'Am', wave: 'sine', volume: 0.10,
      melody: [
        440, 392, 349, 330, 349, 392, 349, 330,
        294, 330, 349, 392, 349, 330, 294, 262,
        220, 262, 294, 330, 294, 262, 220, 196,
        220, 262, 294, 349, 330, 294, 262, 220,
      ],
      bass: [
        110, 110, 131, 131, 147, 147, 131, 131,
        110, 110, 131, 131, 147, 147, 110, 110,
        88, 88, 110, 110, 131, 131, 110, 110,
        88, 88, 110, 110, 88, 88, 110, 110,
      ]
    },
    // 不穏系（黄金ドライバー 会話シーン）
    ominous: {
      tempo: 75, key: 'Dm', wave: 'triangle', volume: 0.09,
      melody: [
        294, 277, 262, 277, 294, 262, 247, 233,
        262, 247, 233, 220, 233, 247, 220, 208,
        294, 311, 330, 311, 294, 277, 262, 247,
        233, 220, 208, 196, 208, 220, 233, 220,
      ],
      bass: [
        147, 139, 131, 139, 147, 131, 123, 117,
        131, 123, 117, 110, 117, 123, 110, 104,
        147, 156, 165, 156, 147, 139, 131, 123,
        117, 110, 104, 98, 104, 110, 117, 110,
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
    // YouTube配信風（カオス配信シミュレーター）— 明るくポップなフリーBGM風
    youtube: {
      tempo: 128, key: 'G', wave: 'triangle', volume: 0.10,
      melody: [
        784, 880, 988, 784, 1175, 988, 880, 784,
        659, 784, 880, 988, 880, 784, 659, 784,
        588, 659, 784, 880, 784, 659, 588, 659,
        784, 880, 988, 1175, 988, 880, 784, 988,
      ],
      bass: [
        392, 392, 494, 494, 588, 588, 494, 494,
        330, 330, 392, 392, 440, 440, 392, 392,
        294, 294, 330, 330, 392, 392, 330, 330,
        392, 392, 494, 494, 392, 392, 494, 494,
      ]
    },
    // のほほん系（うんコーンキャッチャー ストーリー画面）— ゆるくてかわいい自己紹介BGM
    nohohon: {
      tempo: 80, key: 'C', wave: 'sine', volume: 0.09,
      melody: [
        523, 0, 659, 0, 587, 523, 0, 494,
        523, 0, 659, 784, 0, 659, 0, 523,
        440, 0, 523, 0, 494, 440, 0, 392,
        440, 0, 523, 587, 0, 523, 0, 440,
      ],
      bass: [
        262, 0, 262, 0, 294, 0, 294, 0,
        262, 0, 262, 0, 330, 0, 262, 0,
        220, 0, 220, 0, 247, 0, 247, 0,
        220, 0, 220, 0, 262, 0, 220, 0,
      ],
      swing: [
        1.2, 0.8, 1.2, 0.8, 1.3, 1.0, 0.8, 0.9,
        1.2, 0.8, 1.0, 1.3, 0.8, 1.0, 0.8, 1.2,
        1.2, 0.8, 1.2, 0.8, 1.3, 1.0, 0.8, 0.9,
        1.2, 0.8, 1.0, 1.3, 0.8, 1.0, 0.8, 1.2,
      ]
    },
    // マーチ・行進曲風（うんコーンキャッチャー）— おなら＆うんち音入りハイテンション行進
    march: {
      tempo: 140, key: 'C', wave: 'triangle', volume: 0.10,
      melody: [
        523, 523, 659, 784, 784, 659, 523, 784,
        880, 880, 784, 659, 523, 659, 784, 1047,
        698, 698, 880, 1047, 1047, 880, 698, 880,
        784, 659, 523, 659, 784, 1047, 880, 784,
      ],
      bass: [
        131, 196, 131, 196, 131, 196, 131, 196,
        175, 262, 175, 262, 131, 196, 131, 262,
        175, 262, 175, 262, 196, 294, 196, 294,
        131, 196, 131, 196, 196, 262, 196, 131,
      ],
      // おなら＆うんちパーカッション（0=なし、1=短いおなら、2=ボトッ、3=長いおなら）
      farts: [
        0, 0, 0, 1, 0, 0, 2, 0,
        0, 0, 1, 0, 0, 2, 0, 3,
        0, 0, 0, 1, 0, 0, 2, 0,
        1, 0, 0, 2, 0, 1, 0, 3,
      ]
    },
    // きらきら・PV風（経営分析ゲーム通常BGM）
    // PV紹介動画のピアノ+スパークルアルペジオ風
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
      // スパークルアルペジオ層（0=なし、数値=ベース周波数でしゃらららーん）
      sparkle: [
        523, 0, 0, 0, 659, 0, 0, 0,
        784, 0, 0, 0, 0, 0, 523, 0,
        0, 0, 659, 0, 0, 0, 0, 0,
        784, 0, 0, 0, 1047, 0, 0, 0,
      ]
    },
    // 正解後ゴージャス（経営分析ゲーム・レジシーン）
    // PV S5-S6の盛り上がりセクション風
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
      // 正解後はスパークル多めでゴージャスに
      sparkle: [
        784, 0, 1047, 0, 1319, 0, 1568, 0,
        784, 0, 0, 1047, 0, 0, 1568, 2093,
        659, 0, 784, 0, 1047, 0, 0, 0,
        1319, 0, 1568, 0, 2093, 0, 1568, 0,
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
    // クイズバトル・ゲームショー系（橋本さん）— テレビ番組風ファンファーレ
    gameshow: {
      tempo: 155, key: 'Bb', wave: 'triangle', volume: 0.10,
      melody: [
        466, 523, 587, 698, 784, 698, 587, 523,
        587, 698, 784, 932, 784, 698, 587, 698,
        466, 587, 698, 784, 698, 587, 466, 392,
        523, 587, 698, 932, 784, 698, 587, 466,
      ],
      bass: [
        233, 233, 294, 294, 349, 349, 294, 294,
        233, 233, 349, 349, 392, 392, 233, 233,
        233, 233, 294, 294, 349, 349, 294, 294,
        262, 262, 294, 294, 349, 349, 233, 233,
      ],
      // 金管ブラス層（ぼーぼー鳴る sawtooth）— 周波数0=休符
      brass: [
        233, 233, 0, 0, 294, 294, 0, 0,
        349, 349, 0, 233, 233, 0, 294, 294,
        233, 233, 0, 0, 349, 349, 0, 0,
        294, 294, 0, 349, 349, 0, 233, 233,
      ],
      // アップテンポのスウィング（強弱でノリを出す）
      swing: [
        1.1, 0.9, 1.1, 0.9, 1.2, 0.8, 1.1, 0.9,
        1.1, 0.9, 1.1, 0.9, 1.2, 0.8, 1.1, 0.9,
        1.1, 0.9, 1.2, 0.8, 1.1, 0.9, 1.2, 0.8,
        1.1, 0.9, 1.1, 0.9, 1.2, 0.8, 1.1, 0.9,
      ]
    },
    // ケルト風ジグ（アイルランドゲーム）— 踊るようなアイリッシュダンス
    celtic: {
      tempo: 165, key: 'D', wave: 'triangle', volume: 0.09,
      melody: [
        587, 659, 740, 880, 740, 659, 587, 494,
        440, 494, 587, 659, 740, 659, 587, 494,
        587, 740, 880, 988, 880, 740, 587, 659,
        740, 659, 587, 494, 440, 494, 587, 587,
      ],
      bass: [
        294, 294, 370, 370, 440, 440, 294, 294,
        220, 220, 294, 294, 370, 370, 294, 294,
        294, 294, 370, 370, 440, 440, 330, 330,
        370, 370, 294, 294, 220, 220, 294, 294,
      ],
      // ジグ風スウィング（短-短-長のリズム）
      swing: [
        0.7, 0.7, 1.3, 0.7, 0.7, 1.3, 0.7, 1.3,
        0.7, 0.7, 1.3, 0.7, 0.7, 1.3, 0.7, 1.3,
        0.7, 0.7, 1.3, 0.7, 0.7, 1.3, 0.7, 1.3,
        0.7, 0.7, 1.3, 0.7, 0.7, 1.3, 0.7, 1.3,
      ]
    },
    // マジックショー風（協力者）— 怪しくて不思議なワルツ調
    magic: {
      tempo: 100, key: 'Bbm', wave: 'sine', volume: 0.10,
      melody: [
        466, 415, 370, 349, 370, 415, 466, 523,
        466, 415, 370, 311, 277, 311, 370, 349,
        233, 277, 311, 349, 370, 349, 311, 277,
        311, 349, 415, 466, 415, 370, 349, 311,
      ],
      bass: [
        233, 233, 185, 185, 175, 175, 208, 208,
        233, 233, 185, 185, 139, 139, 175, 175,
        117, 117, 139, 139, 175, 175, 139, 139,
        156, 156, 175, 175, 208, 208, 156, 156,
      ],
      // ワルツ風スウィング（強-弱-弱のリズム）
      swing: [
        1.4, 0.8, 0.8, 1.4, 0.8, 0.8, 1.4, 0.8,
        0.8, 1.4, 0.8, 0.8, 1.4, 0.8, 0.8, 1.4,
        0.8, 0.8, 1.4, 0.8, 0.8, 1.4, 0.8, 0.8,
        1.4, 0.8, 0.8, 1.4, 0.8, 0.8, 1.4, 0.8,
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
    // 恋愛・ロマンチック系（お散歩日和RPG）— 甘くてキュンとするメロディ
    romance: {
      tempo: 100, key: 'F', wave: 'sine', volume: 0.10,
      melody: [
        349, 440, 523, 587, 659, 587, 523, 587,
        659, 784, 880, 784, 659, 587, 523, 440,
        349, 392, 440, 523, 587, 523, 440, 392,
        349, 440, 523, 659, 587, 523, 440, 349,
      ],
      bass: [
        175, 175, 220, 220, 262, 262, 294, 294,
        330, 330, 349, 349, 294, 294, 262, 262,
        175, 175, 196, 196, 220, 220, 262, 262,
        175, 175, 220, 220, 175, 175, 175, 175,
      ],
      swing: [
        1.0, 0.9, 0.8, 1.1, 0.9, 1.2, 0.8, 1.0,
        0.9, 0.8, 0.7, 1.2, 0.9, 1.1, 0.8, 1.3,
        1.0, 0.9, 0.8, 1.1, 0.9, 1.2, 0.8, 1.0,
        0.9, 0.8, 0.7, 1.2, 0.9, 1.1, 0.8, 1.4,
      ]
    },
  };

  // ゲームID→BGMプリセットのマッピング
  const GAME_BGM_MAP = {
    'escape-room': 'cute',
    'whack-kanikani': 'pop',
    'business-analysis': 'sparkle',
    'chaos-stream': 'youtube',
    'cosmic-chain': 'cosmic',
    'dress-up': 'cute',
    'drive': 'race',
    'elite-english': 'quiz',
    'fortune': 'cute',
    'holo-analysis': 'quiz',
    'holo-memory': 'calm',
    'hashimoto': 'gameshow',
    'ireland': 'celtic',
    'magic-trick': 'magic',
    'party-game': 'action',
    'pet': 'calm',
    'puzzle-2048': 'retro',
    'rpg': 'romance',
    'suisei-puzzle': 'cosmic',
    'tower': 'retro',
    'trivia-king': 'quiz',
    'unko-cone': 'march',
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
    bgmSpeedMultiplier: 1.0,
    bgmGain: null,       // BGM専用GainNode（ダッキング用）
    _duckTimer: null,

    init() {
      const initAudio = () => {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state !== 'running') {
          this.ctx.resume();
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('pointerdown', initAudio);
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
      document.addEventListener('pointerdown', initAudio);

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
      if (!this.bgmGain && this.ctx) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
      }
      if (this.ctx.state !== 'running') {
        this.ctx.resume();
      }
      return this.ctx;
    },

    // BGM音量を一瞬下げてSEを目立たせる（ダッキング）
    _duckBgm(duration) {
      if (!this.bgmGain || !this.bgmPlaying) return;
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.15, now);           // 一気に15%へ
      this.bgmGain.gain.linearRampToValueAtTime(0.5, now + 0.08);  // 少し戻す
      this.bgmGain.gain.linearRampToValueAtTime(1.0, now + duration); // ゆっくり全復帰
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
      // contextが未稼働の場合、resume完了を待ってから再生開始
      if (this.ctx.state !== 'running') {
        this.ctx.resume().then(() => {
          if (this.bgmPlaying) this._loopBgm(preset);
        });
      } else {
        this._loopBgm(preset);
      }
    },

    _loopBgm(preset) {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      const ctx = this.ctx;
      const bgmDest = this.bgmGain || ctx.destination; // ダッキング用GainNode経由
      const now = ctx.currentTime;
      const baseBeat = (60 / preset.tempo) / (this.bgmSpeedMultiplier || 1.0);
      const vol = preset.volume;
      const swing = preset.swing;

      // ノートごとの開始時刻を計算（swing対応）
      const offsets = [];
      let t = 0;
      for (let i = 0; i < preset.melody.length; i++) {
        offsets.push(t);
        t += baseBeat * (swing ? swing[i] : 1);
      }
      const totalDur = t;

      // メロディ
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

      // ベースライン
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

      // 金管ブラス層（sawtooth + ビブラートでぼーぼー鳴る）
      if (preset.brass) {
        preset.brass.forEach((freq, i) => {
          if (!freq) return;
          const noteDur = baseBeat * (swing ? swing[i] : 1);
          // メインブラス（sawtooth — ぼーぼー感）
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          // ビブラート（揺れで生々しさを出す）
          const vibrato = ctx.createOscillator();
          const vibratoG = ctx.createGain();
          vibrato.frequency.value = 5.5; // 揺れの速さ
          vibratoG.gain.value = 4;       // 揺れ幅（Hz）
          vibrato.connect(vibratoG);
          vibratoG.connect(osc.frequency);
          // 音量: メロディより大きめ（邪魔なくらい）
          const brassVol = vol * 1.8;
          g.gain.setValueAtTime(brassVol, now + offsets[i]);
          g.gain.setValueAtTime(brassVol, now + offsets[i] + noteDur * 0.7);
          g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.95);
          osc.connect(g);
          g.connect(bgmDest);
          osc.start(now + offsets[i]);
          osc.stop(now + offsets[i] + noteDur);
          vibrato.start(now + offsets[i]);
          vibrato.stop(now + offsets[i] + noteDur);
          this.bgmNodes.push(osc);
          this.bgmNodes.push(vibrato);
          // サブオクターブ（1オクターブ下で厚み追加）
          const sub = ctx.createOscillator();
          const sg = ctx.createGain();
          sub.type = 'sawtooth';
          sub.frequency.value = freq * 0.5;
          sg.gain.setValueAtTime(brassVol * 0.6, now + offsets[i]);
          sg.gain.setValueAtTime(brassVol * 0.6, now + offsets[i] + noteDur * 0.7);
          sg.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.95);
          sub.connect(sg);
          sg.connect(bgmDest);
          sub.start(now + offsets[i]);
          sub.stop(now + offsets[i] + noteDur);
          this.bgmNodes.push(sub);
        });
      }

      // スパークルアルペジオ層（PV playSparkleArp準拠）
      // 倍音比 [1, 1.25, 1.5, 1.875, 2, 2.5, 3]
      if (preset.sparkle) {
        const sparkleRatios = [1, 1.25, 1.5, 1.875, 2, 2.5, 3];
        preset.sparkle.forEach((baseFreq, i) => {
          if (!baseFreq) return;
          const arpCount = 4;
          for (let j = 0; j < arpCount; j++) {
            const freq = baseFreq * sparkleRatios[j % sparkleRatios.length];
            const startTime = now + offsets[i] + j * 0.08;
            // メイン音（sine）
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
            // 倍音（triangle、1オクターブ上）
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

      // おなら＆うんちパーカッション層（リアル版）
      if (preset.farts) {
        preset.farts.forEach((type, i) => {
          if (!type) return;
          const st = now + offsets[i];
          if (type === 1) {
            // 短いリアルおなら「ブッ」— 唇振動+空気
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
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.value = 300;
            flt.Q.value = 2;
            const g = ctx.createGain();
            g.gain.value = vol * 4;
            src.connect(flt);
            flt.connect(g);
            g.connect(bgmDest);
            src.start(st);
            src.stop(st + dur);
            this.bgmNodes.push(src);
          } else if (type === 2) {
            // リアルうんち落下「ボトッ」— 水ポチャン+泡
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, st);
            osc.frequency.exponentialRampToValueAtTime(70, st + 0.08);
            g.gain.setValueAtTime(vol * 5, st);
            g.gain.exponentialRampToValueAtTime(0.001, st + 0.1);
            osc.connect(g);
            g.connect(bgmDest);
            osc.start(st);
            osc.stop(st + 0.1);
            this.bgmNodes.push(osc);
            // 泡（FM合成ブクッ）
            const bOsc = ctx.createOscillator();
            const bMod = ctx.createOscillator();
            const bModG = ctx.createGain();
            const bG = ctx.createGain();
            bMod.frequency.value = 22;
            bModG.gain.value = 60;
            bMod.connect(bModG);
            bModG.connect(bOsc.frequency);
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(120, st + 0.04);
            bOsc.frequency.exponentialRampToValueAtTime(50, st + 0.15);
            bG.gain.setValueAtTime(vol * 3, st + 0.04);
            bG.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
            bOsc.connect(bG);
            bG.connect(bgmDest);
            bMod.start(st + 0.04);
            bOsc.start(st + 0.04);
            bMod.stop(st + 0.18);
            bOsc.stop(st + 0.18);
            this.bgmNodes.push(bOsc);
            this.bgmNodes.push(bMod);
          } else if (type === 3) {
            // リアル長おなら「ブブブブー」— 音程変化+断続震え
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
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(250, st);
            flt.frequency.linearRampToValueAtTime(400, st + 0.25);
            flt.frequency.linearRampToValueAtTime(160, st + dur);
            flt.Q.value = 2.5;
            const g = ctx.createGain();
            g.gain.value = vol * 4.5;
            src.connect(flt);
            flt.connect(g);
            g.connect(bgmDest);
            src.start(st);
            src.stop(st + dur);
            this.bgmNodes.push(src);
          }
        });
      }

      // ループ
      const timer = setTimeout(() => {
        if (this.bgmPlaying) this._loopBgm(preset);
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

    // BGMのテンポ倍率を変更（次のループから反映）
    setBgmSpeed(multiplier) {
      this.bgmSpeedMultiplier = multiplier;
    },

    // SE再生
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
          // パコッ！ — スマホでも聞こえる打撃音
          // 高音アタック（パチッという衝撃感）
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
          // 中音ボディ（ドンという厚み）
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
          // ノイズ成分（バシッという質感）
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
        case 'modal_open': {
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(500, now);
          osc2.frequency.exponentialRampToValueAtTime(700, now + 0.08);
          gain.gain.value = this.volume * 0.2;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc2.connect(gain);
          osc2.start(now);
          osc2.stop(now + 0.15);
          break;
        }
        case 'modal_close': {
          const osc3 = ctx.createOscillator();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(700, now);
          osc3.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          gain.gain.value = this.volume * 0.15;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc3.connect(gain);
          osc3.start(now);
          osc3.stop(now + 0.15);
          break;
        }
        case 'door_open': {
          [330, 440, 523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = this.volume * 0.3;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.12 * (i + 1) + 0.1);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.12 * i);
            osc.stop(now + 0.12 * (i + 1) + 0.1);
          });
          break;
        }
        case 'pickup': {
          [880, 1100, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = this.volume * 0.35;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.08 * (i + 1) + 0.08);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.08 * i);
            osc.stop(now + 0.08 * (i + 1) + 0.08);
          });
          break;
        }
        case 'examine': {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
          gain.gain.value = this.volume * 0.25;
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'unlock': {
          [440, 660, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = this.volume * 0.3;
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.1 * (i + 1) + 0.15);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.1 * i);
            osc.stop(now + 0.1 * (i + 1) + 0.15);
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
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.4);
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
        case 'sparkle_click': {
          // PV風スパークルアルペジオ（BGMより高い音域でしゃらららーん）
          // BGMメロディ帯域(330-784Hz)を避けて高音域(1047Hz〜)で鳴らす
          this._duckBgm(0.5);
          const baseFreq = 1047; // C6（BGMの1オクターブ上から開始）
          const ratios = [1, 1.25, 1.5, 1.875, 2];
          for (let i = 0; i < 5; i++) {
            const freq = baseFreq * ratios[i];
            // メイン音（sine）
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = freq;
            g1.gain.setValueAtTime(this.volume * 0.35, now + i * 0.07);
            g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
            osc1.connect(g1);
            g1.connect(ctx.destination);
            osc1.start(now + i * 0.07);
            osc1.stop(now + i * 0.07 + 0.45);
            // 倍音（triangle、1オクターブ上）
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(this.volume * 0.12, now + i * 0.07);
            g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.start(now + i * 0.07);
            osc2.stop(now + i * 0.07 + 0.3);
          }
          break;
        }
        case 'correct_gorgeous': {
          // PV風 正解ファンファーレ（高音域アルペジオ + ピアノ和音）
          // BGMを大きくダッキングして正解感を強調
          this._duckBgm(0.8);
          const baseFreq2 = 1568; // G6（さらに高い音域）
          const ratios2 = [1, 1.25, 1.5, 1.875, 2, 2.5];
          for (let i = 0; i < 6; i++) {
            const freq = baseFreq2 * ratios2[i];
            const osc1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = freq;
            g1.gain.setValueAtTime(this.volume * 0.4, now + i * 0.05);
            g1.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
            osc1.connect(g1);
            g1.connect(ctx.destination);
            osc1.start(now + i * 0.05);
            osc1.stop(now + i * 0.05 + 0.55);
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(this.volume * 0.12, now + i * 0.05);
            g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.start(now + i * 0.05);
            osc2.stop(now + i * 0.05 + 0.35);
          }
          // ピアノ風和音（高音域 C6+E6+G6）
          [1047, 1319, 1568].forEach((freq) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(this.volume * 0.25, now + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.1);
            osc.stop(now + 0.85);
          });
          break;
        }
        case 'dramatic': {
          // ドーン！ — 衝撃的な不協和音 + 低音の地鳴り
          this._duckBgm(1.5);
          // 低音の衝撃波
          const oscLow = ctx.createOscillator();
          const gLow = ctx.createGain();
          oscLow.type = 'sawtooth';
          oscLow.frequency.setValueAtTime(80, now);
          oscLow.frequency.exponentialRampToValueAtTime(30, now + 0.8);
          gLow.gain.setValueAtTime(this.volume * 0.8, now);
          gLow.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
          oscLow.connect(gLow);
          gLow.connect(ctx.destination);
          oscLow.start(now);
          oscLow.stop(now + 1.0);
          // 不協和音の和音（短2度 + 増4度）
          [147, 156, 208, 220].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(this.volume * 0.4, now + 0.02 * i);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + 0.1 * i);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + 0.02 * i);
            osc.stop(now + 0.7 + 0.1 * i);
          });
          // 高音の衝撃
          const oscHigh = ctx.createOscillator();
          const gHigh = ctx.createGain();
          oscHigh.type = 'sawtooth';
          oscHigh.frequency.setValueAtTime(2000, now);
          oscHigh.frequency.exponentialRampToValueAtTime(200, now + 0.3);
          gHigh.gain.setValueAtTime(this.volume * 0.5, now);
          gHigh.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscHigh.connect(gHigh);
          gHigh.connect(ctx.destination);
          oscHigh.start(now);
          oscHigh.stop(now + 0.4);
          break;
        }
        case 'slot_stop': {
          // カシャン！ — スロットが止まる音
          const oscSlot = ctx.createOscillator();
          const gSlot = ctx.createGain();
          oscSlot.type = 'square';
          oscSlot.frequency.setValueAtTime(600, now);
          oscSlot.frequency.exponentialRampToValueAtTime(400, now + 0.06);
          gSlot.gain.setValueAtTime(this.volume * 0.4, now);
          gSlot.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          oscSlot.connect(gSlot);
          gSlot.connect(ctx.destination);
          oscSlot.start(now);
          oscSlot.stop(now + 0.12);
          break;
        }
        case 'boost': {
          // シュイーン！ — ダッシュ音
          const oscBoost = ctx.createOscillator();
          const gBoost = ctx.createGain();
          oscBoost.type = 'sawtooth';
          oscBoost.frequency.setValueAtTime(200, now);
          oscBoost.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
          oscBoost.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          gBoost.gain.setValueAtTime(this.volume * 0.4, now);
          gBoost.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscBoost.connect(gBoost);
          gBoost.connect(ctx.destination);
          oscBoost.start(now);
          oscBoost.stop(now + 0.5);
          break;
        }
        case 'banana_set': {
          // ペチャッ — バナナ設置音
          const oscBan = ctx.createOscillator();
          const gBan = ctx.createGain();
          oscBan.type = 'sine';
          oscBan.frequency.setValueAtTime(500, now);
          oscBan.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          gBan.gain.setValueAtTime(this.volume * 0.4, now);
          gBan.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscBan.connect(gBan);
          gBan.connect(ctx.destination);
          oscBan.start(now);
          oscBan.stop(now + 0.2);
          break;
        }
        case 'shield': {
          // キラーン — バリア音
          [880, 1100, 1320, 1760].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(this.volume * 0.3, now + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.3);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.35);
          });
          break;
        }
        case 'fart': {
          // ブッ！ — リアルおなら（唇振動シミュレーション＋空気ノイズ＋共鳴）
          this._duckBgm(0.3);
          const fDur = 0.3;
          const fLen = ctx.sampleRate * fDur;
          const fBuf = ctx.createBuffer(1, fLen, ctx.sampleRate);
          const fd = fBuf.getChannelData(0);
          // ランダムな「唇の締まり具合」で毎回違う音に
          const tightness = 40 + Math.random() * 30; // 基本振動周波数
          const flutter = 8 + Math.random() * 10;    // ブルブル震え速度
          for (let i = 0; i < fLen; i++) {
            const t = i / ctx.sampleRate;
            // エンベロープ：急に始まって途中で膨らんで消える
            const attack = Math.min(1, t / 0.02);
            const decay = Math.max(0, 1 - (t - 0.05) / (fDur - 0.05));
            const env = attack * decay * (0.6 + 0.4 * Math.sin(t * flutter * Math.PI * 2));
            // 唇振動（非線形クリッピングでブチブチ感）
            const lip = Math.tanh(Math.sin(t * tightness * Math.PI * 2) * 3) * 0.5;
            // 空気の乱流ノイズ
            const air = (Math.random() * 2 - 1) * 0.25;
            // 低音の共鳴（腸の共鳴管シミュレーション）
            const resonance = Math.sin(t * (tightness * 0.5) * Math.PI * 2) * 0.3;
            // 高調波（ビリビリ感）
            const harmonic = Math.sin(t * tightness * 3 * Math.PI * 2) * 0.1 * decay;
            fd[i] = (lip + air + resonance + harmonic) * env;
          }
          const fSrc = ctx.createBufferSource();
          fSrc.buffer = fBuf;
          // ローパス＋バンドパスのダブルフィルタでこもった感じに
          const fLp = ctx.createBiquadFilter();
          fLp.type = 'lowpass';
          fLp.frequency.setValueAtTime(350, now);
          fLp.frequency.linearRampToValueAtTime(200, now + fDur);
          fLp.Q.value = 2;
          const fBp = ctx.createBiquadFilter();
          fBp.type = 'bandpass';
          fBp.frequency.value = 120;
          fBp.Q.value = 1.5;
          const fG = ctx.createGain();
          fG.gain.value = this.volume * 2.0;
          fSrc.connect(fLp);
          fLp.connect(fG);
          // バンドパスを並列で混ぜる（共鳴感強化）
          const fSrc2 = ctx.createBufferSource();
          fSrc2.buffer = fBuf;
          const fG2 = ctx.createGain();
          fG2.gain.value = this.volume * 1.0;
          fSrc2.connect(fBp);
          fBp.connect(fG2);
          fG.connect(ctx.destination);
          fG2.connect(ctx.destination);
          fSrc.start(now);
          fSrc.stop(now + fDur);
          fSrc2.start(now);
          fSrc2.stop(now + fDur);
          break;
        }
        case 'fart_long': {
          // ブブブブブーーッ！ — リアル長おなら（音程変化＋途切れ＋加速）
          this._duckBgm(0.6);
          const flDur = 0.7;
          const flLen = ctx.sampleRate * flDur;
          const flBuf = ctx.createBuffer(1, flLen, ctx.sampleRate);
          const fld = flBuf.getChannelData(0);
          const basePitch = 35 + Math.random() * 20;
          for (let i = 0; i < flLen; i++) {
            const t = i / ctx.sampleRate;
            // 徐々に音程が上がって最後にキュッと締まる
            const pitchCurve = basePitch + t * 40 + Math.sin(t * 5) * 8;
            // 断続的な震え（途切れ途切れ感）
            const stutter = 0.3 + 0.7 * Math.abs(Math.sin(t * 12 * Math.PI * 2));
            // エンベロープ：ゆっくり始まって盛り上がって急に切れる
            const env = Math.min(1, t / 0.05) * Math.max(0, 1 - Math.pow((t - 0.5) / 0.2, 4)) * stutter;
            // 唇振動（歪みあり）
            const lip = Math.tanh(Math.sin(t * pitchCurve * Math.PI * 2) * 4) * 0.4;
            // サブハーモニクス（ドロドロ感）
            const sub = Math.sin(t * pitchCurve * 0.5 * Math.PI * 2) * 0.3;
            // 空気ノイズ（後半増加）
            const air = (Math.random() * 2 - 1) * (0.15 + t * 0.3);
            // バブル感（ブクブク）
            const bubble = Math.sin(t * 7 * Math.PI * 2) * Math.sin(t * pitchCurve * 1.5 * Math.PI * 2) * 0.15;
            fld[i] = (lip + sub + air + bubble) * env;
          }
          const flSrc = ctx.createBufferSource();
          flSrc.buffer = flBuf;
          const flLp = ctx.createBiquadFilter();
          flLp.type = 'lowpass';
          flLp.frequency.setValueAtTime(300, now);
          flLp.frequency.linearRampToValueAtTime(500, now + 0.4);
          flLp.frequency.linearRampToValueAtTime(180, now + flDur);
          flLp.Q.value = 3;
          const flG = ctx.createGain();
          flG.gain.value = this.volume * 2.5;
          flSrc.connect(flLp);
          flLp.connect(flG);
          flG.connect(ctx.destination);
          flSrc.start(now);
          flSrc.stop(now + flDur);
          break;
        }
        case 'plop': {
          // ボトッ！ — リアルうんち着弾音（水面ポチャン＋泡＋衝撃）
          // 1) 水滴インパクト（ポチャッ）
          const plOsc1 = ctx.createOscillator();
          const plG1 = ctx.createGain();
          plOsc1.type = 'sine';
          plOsc1.frequency.setValueAtTime(400, now);
          plOsc1.frequency.exponentialRampToValueAtTime(80, now + 0.08);
          plG1.gain.setValueAtTime(this.volume * 1.2, now);
          plG1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          plOsc1.connect(plG1);
          plG1.connect(ctx.destination);
          plOsc1.start(now);
          plOsc1.stop(now + 0.1);
          // 2) 泡立ち（ブクッ）— FM合成で気泡感
          const plOsc2 = ctx.createOscillator();
          const plMod = ctx.createOscillator();
          const plModG = ctx.createGain();
          const plG2 = ctx.createGain();
          plMod.frequency.value = 25;
          plModG.gain.value = 80;
          plMod.connect(plModG);
          plModG.connect(plOsc2.frequency);
          plOsc2.type = 'sine';
          plOsc2.frequency.setValueAtTime(150, now + 0.05);
          plOsc2.frequency.exponentialRampToValueAtTime(60, now + 0.2);
          plG2.gain.setValueAtTime(this.volume * 0.8, now + 0.05);
          plG2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          plOsc2.connect(plG2);
          plG2.connect(ctx.destination);
          plMod.start(now + 0.05);
          plOsc2.start(now + 0.05);
          plMod.stop(now + 0.25);
          plOsc2.stop(now + 0.25);
          // 3) 水しぶきノイズ
          const plBufLen = ctx.sampleRate * 0.06;
          const plBuf = ctx.createBuffer(1, plBufLen, ctx.sampleRate);
          const plD = plBuf.getChannelData(0);
          for (let i = 0; i < plBufLen; i++) {
            const t = i / ctx.sampleRate;
            plD[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t / 0.06) * 0.8;
          }
          const plNoise = ctx.createBufferSource();
          plNoise.buffer = plBuf;
          const plFlt = ctx.createBiquadFilter();
          plFlt.type = 'bandpass';
          plFlt.frequency.value = 2000;
          plFlt.Q.value = 0.5;
          const plNG = ctx.createGain();
          plNG.gain.value = this.volume * 0.6;
          plNoise.connect(plFlt);
          plFlt.connect(plNG);
          plNG.connect(ctx.destination);
          plNoise.start(now);
          plNoise.stop(now + 0.06);
          break;
        }
        case 'splat': {
          // ビチャッ！ — リアルうんち地面激突（ベチャ＋飛散＋残響）
          this._duckBgm(0.5);
          // 1) 衝突インパクト（ドベシャッ）
          const spLen = ctx.sampleRate * 0.4;
          const spBuf = ctx.createBuffer(1, spLen, ctx.sampleRate);
          const spD = spBuf.getChannelData(0);
          for (let i = 0; i < spLen; i++) {
            const t = i / ctx.sampleRate;
            const impact = Math.max(0, 1 - t / 0.03) * 0.8;
            const spread = Math.max(0, (t - 0.02) / 0.1) * Math.max(0, 1 - t / 0.4);
            const env = impact + spread;
            // 重い着弾感
            const thud = Math.sin(t * 60 * Math.PI * 2) * Math.max(0, 1 - t / 0.1) * 0.5;
            // 飛び散り（高周波ノイズの粒々感）
            const splatter = (Math.random() * 2 - 1) * (0.4 + 0.3 * Math.sin(t * 20));
            // ベチャッのネバネバ感
            const sticky = Math.sin(t * 150 * Math.PI * 2 * (1 - t * 1.5)) * spread * 0.3;
            spD[i] = (thud + splatter + sticky) * env;
          }
          const spSrc = ctx.createBufferSource();
          spSrc.buffer = spBuf;
          const spLp = ctx.createBiquadFilter();
          spLp.type = 'lowpass';
          spLp.frequency.setValueAtTime(3000, now);
          spLp.frequency.exponentialRampToValueAtTime(300, now + 0.3);
          const spG = ctx.createGain();
          spG.gain.value = this.volume * 2.0;
          spSrc.connect(spLp);
          spLp.connect(spG);
          spG.connect(ctx.destination);
          spSrc.start(now);
          spSrc.stop(now + 0.4);
          // 2) 低音の地鳴り
          const spOsc = ctx.createOscillator();
          const spOG = ctx.createGain();
          spOsc.type = 'sine';
          spOsc.frequency.setValueAtTime(80, now);
          spOsc.frequency.exponentialRampToValueAtTime(25, now + 0.3);
          spOG.gain.setValueAtTime(this.volume * 1.2, now);
          spOG.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          spOsc.connect(spOG);
          spOG.connect(ctx.destination);
          spOsc.start(now);
          spOsc.stop(now + 0.35);
          // 3) 飛散粒（ピチピチピチ）
          for (let k = 0; k < 4; k++) {
            const delay = 0.05 + Math.random() * 0.15;
            const dropOsc = ctx.createOscillator();
            const dropG = ctx.createGain();
            dropOsc.type = 'sine';
            dropOsc.frequency.setValueAtTime(300 + Math.random() * 500, now + delay);
            dropOsc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.06);
            dropG.gain.setValueAtTime(this.volume * 0.4, now + delay);
            dropG.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);
            dropOsc.connect(dropG);
            dropG.connect(ctx.destination);
            dropOsc.start(now + delay);
            dropOsc.stop(now + delay + 0.07);
          }
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

    set(gameId, score, extra, lowerIsBetter) {
      const prev = this.get(gameId);
      const isNew = !prev || (lowerIsBetter ? score < prev.score : score > prev.score);
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
      const isEn = (document.documentElement.lang || '').startsWith('en');
      return ACHIEVEMENT_DEFS.map(def => ({
        ...def,
        displayTitle: (isEn && def.titleEn) ? def.titleEn : def.title,
        displayDesc: (isEn && def.descEn) ? def.descEn : def.desc,
        unlocked: !!unlocked[def.id],
        date: unlocked[def.id]?.date || null,
      }));
    },

    _showNotification(achievement) {
      SoundSystem.play('achievement');

      const isEn = (document.documentElement.lang || '').startsWith('en');
      const label = isEn ? 'Achievement Unlocked!' : '実績解除！';
      const title = (isEn && achievement.titleEn) ? achievement.titleEn : achievement.title;
      const desc = (isEn && achievement.descEn) ? achievement.descEn : achievement.desc;

      const el = document.createElement('div');
      el.className = 'sg-achievement-notification';
      el.innerHTML = `
        <div class="sg-achievement-icon">${achievement.emoji}</div>
        <div class="sg-achievement-info">
          <div class="sg-achievement-label">${label}</div>
          <div class="sg-achievement-title">${title}</div>
          <div class="sg-achievement-desc">${desc}</div>
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

    const isEn = (document.documentElement.lang || '').startsWith('en');
    const section = document.createElement('div');
    section.className = 'sg-recommend';
    section.innerHTML = `
      <div class="sg-recommend-title">${isEn ? '🎮 Play Other Games' : _t('otherGames', '🎮 他のゲームも遊ぶ')}</div>
      <div class="sg-recommend-cards">
        ${picks.map(g => `
          <a href="../${g.id}/index.html" class="sg-recommend-card">
            <span class="sg-recommend-emoji">${g.emoji}</span>
            <span class="sg-recommend-name">${(isEn && g.titleEn) ? g.titleEn : g.title}</span>
            <span class="sg-recommend-genre">${(isEn && g.genreEn) ? g.genreEn : g.genre}</span>
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

  // ===== 固定アスペクト比スケーリング =====
  // #game-wrapper に data-sg-scale="幅x高さ" を指定すると有効化
  // 例: data-sg-scale="400x700"
  function initScaling() {
    const wrapper = document.getElementById('game-wrapper');
    if (!wrapper) return;
    const attr = wrapper.getAttribute('data-sg-scale');
    if (!attr) return;

    const parts = attr.split('x').map(Number);
    const dw = parts[0];
    const dh = parts[1];
    if (!dw || !dh) return;

    // body をスケーリング用にリセット
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.height = '100dvh';
    document.body.style.display = 'block';
    document.body.style.position = 'relative';

    // ラッパーを固定サイズに設定
    wrapper.style.width = dw + 'px';
    wrapper.style.height = dh + 'px';
    wrapper.style.maxWidth = 'none';
    wrapper.style.maxHeight = 'none';
    wrapper.style.margin = '0';
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.overflowY = 'auto';
    wrapper.style.overflowX = 'hidden';

    function applyScale() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var scale = Math.min(vw / dw, vh / dh, 1); // 1以上にはしない（PC時の拡大防止）
      var scaledW = dw * scale;
      var scaledH = dh * scale;
      var offsetX = (vw - scaledW) / 2;
      var offsetY = (vh - scaledH) / 2;
      wrapper.style.transform = 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + scale + ')';
    }

    applyScale();
    window.addEventListener('resize', applyScale);
    window.addEventListener('orientationchange', function () {
      setTimeout(applyScale, 200);
    });
    if (screen.orientation) {
      screen.orientation.addEventListener('change', function () {
        setTimeout(applyScale, 200);
      });
    }
  }

  // ===== Xシェアボタン =====
  function createShareButton(gameId) {
    // 既存のシェアボタンがある場合はスキップ（各ゲーム独自実装を優先）
    if (document.getElementById('share-btn') || document.querySelector('.sg-share-btn')) return;
    var game = GAME_CATALOG.find(function (g) { return g.id === gameId; });
    var title = game ? game.title : 'シュールゲームス';
    var btn = document.createElement('a');
    btn.className = 'sg-share-btn';
    btn.setAttribute('aria-label', 'Xでシェア');
    btn.href = '#';
    btn.textContent = '𝕏';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var text = '【' + title + '】を遊んだよ！\n#シュールゲームス';
      var url = window.location.href;
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
    });
    document.body.appendChild(btn);
  }

  // ===== 言語切り替えボタン =====
  function createLangToggle() {
    // 既存の言語トグルがある場合はスキップ
    if (document.getElementById('lang-toggle') || document.getElementById('lang-switch') ||
        document.querySelector('.sg-lang-toggle') || document.querySelector('.lang-btn')) return;

    var container = document.createElement('div');
    container.className = 'sg-lang-toggle';
    container.id = 'sg-lang-toggle';

    var jpBtn = document.createElement('button');
    jpBtn.className = 'sg-lang-btn active';
    jpBtn.textContent = 'JP';
    jpBtn.dataset.lang = 'ja';

    var enBtn = document.createElement('button');
    enBtn.className = 'sg-lang-btn';
    enBtn.textContent = 'EN';
    enBtn.dataset.lang = 'en';

    function setLang(lang) {
      jpBtn.classList.toggle('active', lang === 'ja');
      enBtn.classList.toggle('active', lang === 'en');
      if (window.SurrealI18n) {
        SurrealI18n.setLang(lang);
      }
      window.dispatchEvent(new CustomEvent('surreal-lang-change', { detail: { lang: lang } }));
    }

    jpBtn.addEventListener('click', function () { setLang('ja'); });
    enBtn.addEventListener('click', function () { setLang('en'); });

    // 保存された言語設定を復元
    try {
      var saved = localStorage.getItem('sg_lang');
      if (saved === 'en') {
        jpBtn.classList.remove('active');
        enBtn.classList.add('active');
      }
    } catch (e) { /* localStorage unavailable */ }

    container.appendChild(jpBtn);
    container.appendChild(enBtn);
    document.body.appendChild(container);
  }

  // ===== 初期化 =====
  function init(gameId) {
    SoundSystem.init();
    createSoundToggle();
    createShareButton(gameId);
    createLangToggle();
    initScaling();

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

    // 言語変更時にラベルを更新（SurrealI18n 経由またはカスタムイベント経由）
    if (window.SurrealI18n && typeof window.SurrealI18n.onLangChange === 'function') {
      window.SurrealI18n.onLangChange(function () {
        insertRecommendSections();
      });
    }
    window.addEventListener('surreal-lang-change', function () {
      insertRecommendSections();
    });

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

      // ゲーム終了時に呼ぶ（スコアは任意、lowerIsBetter: タイム系で低い方が良い場合true）
      onGameEnd(score, extra, lowerIsBetter) {
        Stats.recordPlay(gameId);
        SoundSystem.stopBgm();
        SoundSystem.play('result');

        let isNewHigh = false;
        if (score !== undefined && score !== null) {
          isNewHigh = HighScore.set(gameId, score, extra, lowerIsBetter);
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
