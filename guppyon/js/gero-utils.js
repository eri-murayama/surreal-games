/* ============================================
   ゲロゲーロ学園 - 共通ユーティリティ
   localStorage / サウンドトグル / 画面切り替え
   ============================================ */

const GeroUtils = (function() {
  'use strict';

  /* --- localStorage ラッパー --- */
  function loadJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function loadString(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function saveString(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  /* --- サウンドトグル --- */
  function syncSoundButton(buttonEl) {
    if (!buttonEl || !window.geroAudio) return;
    var muted = !!window.geroAudio.isMuted;
    buttonEl.textContent = muted ? '🔇' : '🔊';
    buttonEl.setAttribute('aria-pressed', String(muted));
    buttonEl.setAttribute('aria-label', muted ? 'おとを オンにする' : 'おとを オフにする');
  }

  function bindSoundToggle(buttonEl) {
    if (!buttonEl || !window.geroAudio) return;
    syncSoundButton(buttonEl);
    buttonEl.addEventListener('click', function() {
      window.geroAudio.init();
      window.geroAudio.toggleMute();
      syncSoundButton(buttonEl);
    });
  }

  /* --- オーディオ初期化（ユーザー操作時） --- */
  function warmupAudio() {
    if (!window.geroAudio) return;
    window.geroAudio.init();
    window.geroAudio.resume();
  }

  function warmupOnFirstTouch() {
    document.addEventListener('pointerdown', function() {
      warmupAudio();
    }, { once: true });
  }

  /* --- 画面切り替え --- */
  function showScreen(screens, targetName) {
    Object.keys(screens).forEach(function(name) {
      var node = screens[name];
      if (node) node.classList.toggle('active', name === targetName);
    });
  }

  /* --- 汎用ユーティリティ --- */
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* --- ゲームIDをパスから取得 --- */
  function getCurrentGameId() {
    var match = window.location.pathname.match(/games\/([^/]+)/);
    return match ? match[1] : null;
  }

  /* --- ゲーム一覧（1箇所で管理） --- */
  var GAME_LIST = [
    { id: 'same-friends', title: 'おなじはどれ？', emoji: '🐣', age: 'baby' },
    { id: 'pop-bubbles', title: 'ぽんぽんタッチ', emoji: '🫧', age: 'baby' },
    { id: 'animal-sounds', title: 'どうぶつのこえ', emoji: '🐕', age: 'baby' },
    { id: 'color-touch', title: 'いろいろタッチ', emoji: '🎨', age: 'baby' },
    { id: 'peekaboo', title: 'いないいないばあ！', emoji: '🙈', age: 'baby' },
    { id: 'music-maker', title: 'おとであそぼ', emoji: '🎹', age: 'toddler' },
    { id: 'counting-frogs', title: 'かぞえてぴょん！', emoji: '🐸', age: 'toddler' },
    { id: 'big-small-picnic', title: 'おおきい？ ちいさい？', emoji: '🧺', age: 'toddler' },
    { id: 'more-less-party', title: 'どっちが おおい？', emoji: '🎈', age: 'toddler' },
    { id: 'shadow-match', title: 'かげえあわせ', emoji: '🌒', age: 'toddler' },
    { id: 'weather-dressup', title: 'おてんきコーデ', emoji: '☀️', age: 'toddler' },
    { id: 'memory-cards', title: 'きおくカード', emoji: '🃏', age: 'toddler' },
    { id: 'shape-puzzle', title: 'かたちパズル', emoji: '🔷', age: 'toddler' },
    { id: 'math-battle', title: 'さんすうバトル', emoji: '⚔️', age: 'kid' },
    { id: 'clock-touch', title: 'とけいタッチ', emoji: '🕒', age: 'kid' },
    { id: 'pattern-train', title: 'つぎは なにかな？', emoji: '🚂', age: 'kid' },
    { id: 'hiragana-touch', title: 'ひらがなタッチ', emoji: 'あ', age: 'kid' },
    { id: 'english-words', title: 'えいごでGO!', emoji: '🍎', age: 'kid' },
    { id: 'english-colors', title: 'カラータッチABC', emoji: '🎨', age: 'kid' },
    { id: 'first-letter-safari', title: 'さいしょの えいご', emoji: '🦁', age: 'kid' },
    { id: 'opposites-quiz', title: 'はんたいことば', emoji: '↔️', age: 'kid' },
    { id: 'kanji-quiz', title: '漢字クイズ', emoji: '漢', age: 'kid' },
    { id: 'prefecture-master', title: '都道府県マスター', emoji: '🗾', age: 'kid' },
    { id: 'rhythm-lights', title: 'ぴかぴかリズム', emoji: '🎼', age: 'kid' },
    { id: 'speed-calc', title: '脳トレ計算', emoji: '🧮', age: 'adult' },
    { id: 'kanji-reading', title: '難読漢字チャレンジ', emoji: '📖', age: 'adult' }
  ];

  return {
    GAME_LIST: GAME_LIST,
    loadJSON: loadJSON,
    saveJSON: saveJSON,
    loadString: loadString,
    saveString: saveString,
    removeItem: removeItem,
    syncSoundButton: syncSoundButton,
    bindSoundToggle: bindSoundToggle,
    warmupAudio: warmupAudio,
    warmupOnFirstTouch: warmupOnFirstTouch,
    showScreen: showScreen,
    shuffle: shuffle,
    sample: sample,
    clamp: clamp,
    getCurrentGameId: getCurrentGameId
  };
})();

window.GeroUtils = GeroUtils;
