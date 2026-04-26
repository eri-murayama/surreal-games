/**
 * シュールゲームス 共通 i18n モジュール
 * 軽量・再利用可能な多言語対応フレームワーク
 *
 * Usage:
 *   <script src="../common/i18n.js"></script>
 *   <script>
 *     SurrealI18n.init({
 *       ja: { myKey: 'こんにちは' },
 *       en: { myKey: 'Hello' }
 *     });
 *     SurrealI18n.t('myKey');       // => 'こんにちは' or 'Hello'
 *     SurrealI18n.t('shareOnX');    // shared key from common translations
 *   </script>
 */
(function () {
  'use strict';

  // ===== 共通翻訳（全ゲーム共通のUI文字列） =====
  const SHARED_TRANSLATIONS = {
    ja: {
      backToTop: '\u2190 \u30c8\u30c3\u30d7\u306b\u623b\u308b',
      shareOnX: 'X\u3067\u30b7\u30a7\u30a2\u3059\u308b',
      retry: '\u3082\u3046\u4e00\u56de',
      score: '\u30b9\u30b3\u30a2',
      time: '\u6642\u9593',
      combo: '\u30b3\u30f3\u30dc',
      result: '\u7d50\u679c',
      rank: '\u30e9\u30f3\u30af',
      newRecord: '\ud83c\udf89 NEW RECORD!',
      otherGames: '\ud83c\udfae \u4ed6\u306e\u30b2\u30fc\u30e0\u3082\u904a\u3076',
      backToHome: '\ud83c\udfe0 \u30c8\u30c3\u30d7\u30da\u30fc\u30b8\u3078',
      langJP: 'JP',
      langEN: 'EN',
    },
    en: {
      backToTop: '\u2190 Back to Top',
      shareOnX: 'Share on X',
      retry: 'Play Again',
      score: 'Score',
      time: 'Time',
      combo: 'Combo',
      result: 'Result',
      rank: 'Rank',
      newRecord: '\ud83c\udf89 NEW RECORD!',
      otherGames: '\ud83c\udfae Play Other Games',
      backToHome: '\ud83c\udfe0 Back to Home',
      langJP: 'JP',
      langEN: 'EN',
    },
  };

  // ===== 言語検出・保存 =====
  const STORAGE_KEY = 'sg_lang';
  const SUPPORTED_LANGS = ['ja', 'en'];

  function detectLang() {
    // 1. localStorage に保存された設定
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (e) { /* localStorage unavailable */ }

    // 2. ブラウザの言語設定
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('en')) return 'en';

    // 3. デフォルト: 日本語
    return 'ja';
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* localStorage unavailable */ }
  }

  // ===== メインモジュール =====
  let _currentLang = detectLang();
  let _gameTranslations = { ja: {}, en: {} };
  let _onLangChangeCallbacks = [];

  const SurrealI18n = {
    /**
     * 現在の言語を取得
     */
    get currentLang() {
      return _currentLang;
    },

    /**
     * ゲーム固有の翻訳で初期化
     * @param {Object} gameTranslations - { ja: {...}, en: {...} }
     * @param {Object} [options] - { onLangChange: function(lang) }
     */
    init(gameTranslations, options) {
      if (gameTranslations) {
        _gameTranslations = gameTranslations;
      }

      if (options && typeof options.onLangChange === 'function') {
        _onLangChangeCallbacks.push(options.onLangChange);
      }

      // HTML lang 属性を設定
      document.documentElement.lang = _currentLang;

      return this;
    },

    /**
     * 翻訳文字列を取得
     * ゲーム固有 -> 共通 の順で検索
     * @param {string} key
     * @param {...*} args - 関数型の翻訳に渡す引数
     * @returns {string}
     */
    t(key, ...args) {
      const lang = _currentLang;

      // ゲーム固有翻訳を優先
      if (_gameTranslations[lang] && _gameTranslations[lang][key] !== undefined) {
        const val = _gameTranslations[lang][key];
        return typeof val === 'function' ? val(...args) : val;
      }

      // 共通翻訳にフォールバック
      if (SHARED_TRANSLATIONS[lang] && SHARED_TRANSLATIONS[lang][key] !== undefined) {
        const val = SHARED_TRANSLATIONS[lang][key];
        return typeof val === 'function' ? val(...args) : val;
      }

      // 日本語フォールバック（キーが見つからない場合）
      if (lang !== 'ja') {
        if (_gameTranslations.ja && _gameTranslations.ja[key] !== undefined) {
          const val = _gameTranslations.ja[key];
          return typeof val === 'function' ? val(...args) : val;
        }
        if (SHARED_TRANSLATIONS.ja && SHARED_TRANSLATIONS.ja[key] !== undefined) {
          const val = SHARED_TRANSLATIONS.ja[key];
          return typeof val === 'function' ? val(...args) : val;
        }
      }

      // キーをそのまま返す（デバッグ用）
      return key;
    },

    /**
     * 言語を切り替え
     * @param {string} lang - 'ja' or 'en'
     */
    setLang(lang) {
      if (!SUPPORTED_LANGS.includes(lang)) return;
      _currentLang = lang;
      saveLang(lang);
      document.documentElement.lang = lang;

      // 言語トグルボタンの状態を更新
      document.querySelectorAll('.sg-lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      // 既存の .lang-btn も更新（後方互換）
      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      // コールバックを呼び出し
      _onLangChangeCallbacks.forEach(function (cb) {
        try { cb(lang); } catch (e) { console.error('i18n onLangChange error:', e); }
      });

      // カスタムイベントを発火
      window.dispatchEvent(new CustomEvent('surreal-lang-change', { detail: { lang: lang } }));
    },

    /**
     * 言語変更コールバックを登録
     * @param {function} callback - function(lang)
     */
    onLangChange(callback) {
      if (typeof callback === 'function') {
        _onLangChangeCallbacks.push(callback);
      }
    },

    /**
     * 言語トグルコンポーネントを生成して挿入
     * @param {string|HTMLElement} [target] - 挿入先のセレクタまたは要素（省略時はbodyに追加）
     * @param {Object} [options] - { position: 'topRight'|'topLeft'|'inline' }
     * @returns {HTMLElement}
     */
    createLangToggle(target, options) {
      var opts = options || {};
      var position = opts.position || 'topRight';

      var container = document.createElement('div');
      container.className = 'sg-lang-toggle';
      if (position === 'topRight') container.classList.add('sg-lang-toggle-fixed-right');
      else if (position === 'topLeft') container.classList.add('sg-lang-toggle-fixed-left');

      var btnJa = document.createElement('button');
      btnJa.className = 'sg-lang-btn' + (_currentLang === 'ja' ? ' active' : '');
      btnJa.dataset.lang = 'ja';
      btnJa.textContent = 'JP';
      btnJa.setAttribute('aria-label', 'Japanese');

      var btnEn = document.createElement('button');
      btnEn.className = 'sg-lang-btn' + (_currentLang === 'en' ? ' active' : '');
      btnEn.dataset.lang = 'en';
      btnEn.textContent = 'EN';
      btnEn.setAttribute('aria-label', 'English');

      var self = this;
      btnJa.addEventListener('click', function () { self.setLang('ja'); });
      btnEn.addEventListener('click', function () { self.setLang('en'); });

      container.appendChild(btnJa);
      container.appendChild(btnEn);

      // スタイルを注入（一度だけ）
      if (!document.getElementById('sg-i18n-styles')) {
        var style = document.createElement('style');
        style.id = 'sg-i18n-styles';
        style.textContent = [
          '.sg-lang-toggle {',
          '  display: inline-flex;',
          '  gap: 4px;',
          '  z-index: 1000;',
          '}',
          '.sg-lang-toggle-fixed-right {',
          '  position: fixed;',
          '  top: 10px;',
          '  right: 10px;',
          '}',
          '.sg-lang-toggle-fixed-left {',
          '  position: fixed;',
          '  top: 10px;',
          '  left: 10px;',
          '}',
          '.sg-lang-btn {',
          '  padding: 6px 14px;',
          '  border: 2px solid rgba(255,255,255,0.3);',
          '  border-radius: 6px;',
          '  background: rgba(0,0,0,0.3);',
          '  color: rgba(255,255,255,0.7);',
          '  font-size: 13px;',
          '  font-weight: bold;',
          '  cursor: pointer;',
          '  transition: all 0.2s ease;',
          '  backdrop-filter: blur(4px);',
          '  -webkit-backdrop-filter: blur(4px);',
          '}',
          '.sg-lang-btn:hover {',
          '  background: rgba(0,0,0,0.5);',
          '  color: #fff;',
          '}',
          '.sg-lang-btn.active {',
          '  background: rgba(255,255,255,0.9);',
          '  color: #333;',
          '  border-color: rgba(255,255,255,0.9);',
          '}',
        ].join('\n');
        document.head.appendChild(style);
      }

      // 挿入先に追加
      if (target) {
        var targetEl = typeof target === 'string' ? document.querySelector(target) : target;
        if (targetEl) {
          targetEl.appendChild(container);
          return container;
        }
      }

      document.body.appendChild(container);
      return container;
    },

    /**
     * 共通翻訳を取得（外部から参照用）
     */
    get sharedTranslations() {
      return SHARED_TRANSLATIONS;
    },
  };

  // グローバルに公開
  window.SurrealI18n = SurrealI18n;
})();
