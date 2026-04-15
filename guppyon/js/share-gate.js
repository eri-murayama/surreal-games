/* ============================================
   ゲロゲーロ学園 - シェアボタン＋保護者ゲート
   年齢に応じた誤タッチ防止機能付き
   ============================================ */

(function() {
  'use strict';

  // ゲーム一覧（導線用）
  const GAME_LIST = [
    { id: 'counting-frogs', title: 'かぞえてぴょん！', emoji: '🐸', age: 'toddler' },
    { id: 'rhythm-lights', title: 'ぴかぴかリズム', emoji: '🎼', age: 'kid' },
    { id: 'pop-bubbles', title: 'ぽんぽんタッチ', emoji: '🫧', age: 'baby' },
    { id: 'animal-sounds', title: 'どうぶつのこえ', emoji: '🐕', age: 'baby' },
    { id: 'color-touch', title: 'いろいろタッチ', emoji: '🎨', age: 'baby' },
    { id: 'peekaboo', title: 'いないいないばあ！', emoji: '🙈', age: 'baby' },
    { id: 'music-maker', title: 'おとであそぼ', emoji: '🎹', age: 'baby' },
    { id: 'memory-cards', title: 'きおくカード', emoji: '🃏', age: 'toddler' },
    { id: 'shape-puzzle', title: 'かたちパズル', emoji: '🔷', age: 'toddler' },
    { id: 'math-battle', title: 'さんすうバトル', emoji: '⚔️', age: 'kid' },
    { id: 'hiragana-touch', title: 'ひらがなタッチ', emoji: 'あ', age: 'kid' },
    { id: 'english-words', title: 'えいごでGO!', emoji: '🍎', age: 'kid' },
    { id: 'kanji-quiz', title: '漢字クイズ', emoji: '漢', age: 'kid' },
    { id: 'prefecture-master', title: '都道府県マスター', emoji: '🗾', age: 'kid' },
    { id: 'speed-calc', title: '脳トレ計算', emoji: '🧮', age: 'adult' },
    { id: 'kanji-reading', title: '難読漢字チャレンジ', emoji: '📖', age: 'adult' },
  ];

  // 現在のゲームIDをパスから取得
  function getCurrentGameId() {
    const path = window.location.pathname;
    const match = path.match(/games\/([^/]+)/);
    return match ? match[1] : null;
  }

  // 年齢カテゴリを取得
  function getAgeCategory() {
    // meta tagから判定
    const babyMeta = document.querySelector('meta[name="baby-game"]');
    if (babyMeta) return 'baby';
    // data属性から判定
    const container = document.querySelector('[data-age-category]');
    if (container) return container.dataset.ageCategory;
    // ゲームリストから判定
    const id = getCurrentGameId();
    const game = GAME_LIST.find(g => g.id === id);
    return game ? game.age : 'kid';
  }

  // おすすめゲームを取得（同じ年齢帯から現在のゲーム以外をランダムに2つ）
  function getRecommendedGames() {
    const currentId = getCurrentGameId();
    const age = getAgeCategory();
    const candidates = GAME_LIST.filter(g => g.id !== currentId && g.age !== 'baby');
    // 同じ年齢帯を優先
    const sameAge = candidates.filter(g => g.age === age);
    const others = candidates.filter(g => g.age !== age);
    const pool = [...sameAge, ...others];
    // シャッフルして2つ選ぶ
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 2);
  }

  // CSS注入
  function injectStyles() {
    if (document.getElementById('share-gate-styles')) return;
    const style = document.createElement('style');
    style.id = 'share-gate-styles';
    style.textContent = `
      /* シェアゲート全体 */
      .share-gate-section {
        margin-top: 16px;
        text-align: center;
      }

      /* おうちのひとへボタン */
      .parent-gate-trigger {
        background: none;
        border: 2px dashed #ccc;
        border-radius: 20px;
        padding: 10px 20px;
        font-family: inherit;
        font-size: 0.8rem;
        color: #999;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .parent-gate-trigger:hover {
        border-color: #aaa;
        color: #777;
      }
      .parent-gate-trigger[aria-expanded="true"] {
        border-color: #4ecdc4;
        color: #2bbbad;
      }

      /* 計算問題ゲート */
      .parent-gate-quiz {
        display: none;
        margin-top: 12px;
        padding: 16px;
        background: #f9f9f9;
        border-radius: 16px;
        animation: gateSlideIn 0.3s ease;
      }
      .parent-gate-quiz.visible {
        display: block;
      }
      .gate-question {
        font-size: 1.2rem;
        font-weight: 700;
        color: #555;
        margin-bottom: 10px;
      }
      .gate-hint {
        font-size: 0.8rem;
        color: #777;
        margin-bottom: 10px;
      }
      .gate-input {
        width: 80px;
        padding: 8px 12px;
        border: 3px solid #ddd;
        border-radius: 12px;
        font-size: 1.1rem;
        text-align: center;
        font-family: inherit;
        outline: none;
        transition: border-color 0.3s;
      }
      .gate-input:focus {
        border-color: #4ecdc4;
      }
      .gate-submit {
        margin-left: 8px;
        padding: 8px 16px;
        background: #4ecdc4;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.3s;
      }
      .gate-submit:hover {
        background: #2bbbad;
      }
      .gate-error {
        color: #ff5252;
        font-size: 0.8rem;
        margin-top: 6px;
        min-height: 1.2em;
      }

      /* シェアボタン */
      .share-btn-x {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: #000;
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        font-family: inherit;
        transition: all 0.3s;
        margin-top: 12px;
      }
      .share-btn-x:hover {
        background: #333;
        transform: translateY(-2px);
      }
      .share-btn-x svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      /* 次のゲーム導線 */
      .next-games-section {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 2px dashed #eee;
      }
      .next-games-title {
        font-size: 0.85rem;
        color: #999;
        margin-bottom: 10px;
      }
      .next-games-list {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .next-game-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        text-decoration: none;
        color: #4a4a4a;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.3s;
        font-family: inherit;
      }
      .next-game-link:hover {
        border-color: #4ecdc4;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .next-game-emoji {
        font-size: 1.3rem;
      }

      @keyframes gateSlideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .parent-gate-trigger:hover,
        .share-btn-x:hover,
        .next-game-link:hover {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // X (Twitter) のSVGアイコン
  const X_ICON_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';

  // シェアテキストを生成
  function buildShareText(gameTitle, resultText) {
    const base = resultText
      ? `🐸 ゲロゲーロ学園「${gameTitle}」で${resultText}！\n\nみんなもあそんでみてね！`
      : `🐸 ゲロゲーロ学園「${gameTitle}」であそんだよ！\n\nみんなもあそんでみてね！`;
    return base;
  }

  // シェアURLを生成
  function buildShareUrl(text) {
    const siteUrl = 'https://eri-murayama.github.io/gerogero-gakuen/';
    const encodedText = encodeURIComponent(text + '\n\n' + siteUrl);
    return 'https://x.com/intent/tweet?text=' + encodedText;
  }

  // シェアボタンHTML
  function createShareButton(gameTitle, resultText) {
    const text = buildShareText(gameTitle, resultText);
    const url = buildShareUrl(text);
    const btn = document.createElement('a');
    btn.className = 'share-btn-x';
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.innerHTML = X_ICON_SVG + ' Xでシェアする';
    return btn;
  }

  // 次のゲーム導線HTML
  function createNextGamesSection() {
    const games = getRecommendedGames();
    if (games.length === 0) return null;

    const section = document.createElement('div');
    section.className = 'next-games-section';
    section.innerHTML = '<div class="next-games-title">🐸 ほかのゲームもあそぶ？</div>';

    const list = document.createElement('div');
    list.className = 'next-games-list';

    games.forEach(game => {
      const link = document.createElement('a');
      link.className = 'next-game-link';
      link.href = '../../games/' + game.id + '/index.html';
      link.innerHTML = '<span class="next-game-emoji">' + game.emoji + '</span>' + game.title;
      list.appendChild(link);
    });

    section.appendChild(list);
    return section;
  }

  // 保護者ゲート（計算問題）を生成
  function createParentGate(gameTitle, resultText) {
    const container = document.createElement('div');
    container.className = 'share-gate-section';
    const gateId = 'share-gate-' + Math.random().toString(36).slice(2, 8);

    // 「おうちのひとへ」ボタン
    const trigger = document.createElement('button');
    trigger.className = 'parent-gate-trigger';
    trigger.type = 'button';
    trigger.innerHTML = '🔒 おうちのひとと シェアする';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', gateId);

    // 計算問題
    const quiz = document.createElement('div');
    quiz.className = 'parent-gate-quiz';
    quiz.id = gateId;
    quiz.setAttribute('role', 'group');
    quiz.setAttribute('aria-label', '保護者確認');

    const a = Math.floor(Math.random() * 8) + 2; // 2-9
    const b = Math.floor(Math.random() * 8) + 2; // 2-9
    const answer = a + b;

    quiz.innerHTML =
      '<div class="gate-hint">外部サイトへ移動する前に、かんたんな けいさんを おねがいします。</div>' +
      '<div class="gate-question">' + a + ' + ' + b + ' = ?</div>' +
      '<div>' +
        '<input type="number" class="gate-input" maxlength="2" inputmode="numeric" aria-label="こたえ">' +
        '<button class="gate-submit" type="button">OK</button>' +
      '</div>' +
      '<div class="gate-error" aria-live="polite"></div>';

    const shareArea = document.createElement('div');
    shareArea.style.display = 'none';

    // シェアボタン
    const shareBtn = createShareButton(gameTitle, resultText);
    shareArea.appendChild(shareBtn);

    // イベント
    trigger.addEventListener('click', function() {
      quiz.classList.add('visible');
      trigger.style.display = 'none';
      trigger.setAttribute('aria-expanded', 'true');
      setTimeout(function() {
        quiz.querySelector('.gate-input').focus();
      }, 100);
    });

    const checkGateAnswer = function() {
      const input = quiz.querySelector('.gate-input');
      const val = parseInt(input.value, 10);
      if (val === answer) {
        quiz.style.display = 'none';
        shareArea.style.display = 'block';
      } else {
        quiz.querySelector('.gate-error').textContent = 'ちがうよ！もういちど！';
        input.value = '';
        input.focus();
      }
    };

    quiz.querySelector('.gate-submit').addEventListener('click', checkGateAnswer);
    quiz.querySelector('.gate-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') checkGateAnswer();
    });

    container.appendChild(trigger);
    container.appendChild(quiz);
    container.appendChild(shareArea);

    return container;
  }

  /**
   * メインAPI: 結果画面にシェアボタンと次のゲーム導線を追加
   * @param {string|Element} resultContainer - 結果画面のセレクタまたはDOM要素
   * @param {Object} options
   * @param {string} options.gameTitle - ゲーム名
   * @param {string} [options.resultText] - 結果テキスト（例: "ランクS"）
   * @param {string} [options.age] - 年齢カテゴリ（auto, baby, toddler, kid, adult）
   */
  window.geroShare = function(resultContainer, options) {
    injectStyles();

    const container = typeof resultContainer === 'string'
      ? document.querySelector(resultContainer)
      : resultContainer;
    if (!container) return;

    // 既存のシェアセクションがあれば削除（再表示対応）
    const existing = container.querySelectorAll('.share-gate-section, .next-games-section');
    existing.forEach(function(el) { el.remove(); });

    const age = options.age || getAgeCategory();
    const gameTitle = options.gameTitle || 'ゲーム';
    const resultText = options.resultText || '';

    // 赤ちゃん向けはシェアボタンなし
    if (age !== 'baby') {
      const shareSection = createParentGate(gameTitle, resultText);

      // ボタングループの前に挿入（あれば）
      const btnGroup = container.querySelector('.btn-group, .result-buttons, .result-btns');
      if (btnGroup) {
        btnGroup.parentNode.insertBefore(shareSection, btnGroup);
      } else {
        container.appendChild(shareSection);
      }
    }

    // 次のゲーム導線
    const nextGames = createNextGamesSection();
    if (nextGames) {
      container.appendChild(nextGames);
    }
  };

})();
