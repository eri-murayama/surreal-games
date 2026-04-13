(function() {
  'use strict';

  // ===== 共通モジュール初期化 =====
  const sg = SurrealGames.init('business-analysis');

  // ===== 多言語データ =====
  const i18n = {
    ja: {
      title: '経営分析ゲーム<br>～天才たちの<ruby>戯れ<rp>(</rp><rt>シーソーゲーム</rt><rp>)</rp></ruby>～',
      startBtn: 'レディー★ゴー',
      backLink: '← トップに戻る',
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
    },
    en: {
      title: 'Business Analysis Game<br>~A Genius at Play~',
      startBtn: 'READY ★ GO',
      backLink: '← Back',
      openingName: 'Atsushi',
      registerName: 'Atsushi',
      replayBtn: 'Play Again',
      hint: 'Click the bad business practice!',
      labels: { oyaji: 'Owner', ramen: 'Ramen', register: 'Register', sign: 'Sign', table: 'Table' },
      correctExclaim: 'Correct!',
      openingLines: [
        "I'm Atsushi. Genius business analyst.\nNumbers fall in love with me...\nThat's the kind of man I am.",
        "Even today, the lost little lambs\ncry out for my help.",
        "Wait for me, world...!!",
        "...A new job.\nBusiness analysis for a run-down\nramen shop, huh.",
        "Let this genius analyst's eyes\nsee through it all."
      ],
      objectDialogues: {
        oyaji: { name: 'Atsushi', text: "A grimy old man.\nBut that's part of the charm.\nThis isn't a business problem." },
        ramen: { name: 'Atsushi', text: "Stinky, gross, dirty.\nThe worst ramen trifecta...\nBut that's a cooking issue. Not business." },
        sign: { name: 'Atsushi', text: 'A sign that just says "Ramen."\nToo simple, but...\nit IS a ramen shop. No problem.' },
        table: { name: 'Atsushi', text: "A sticky table.\nUnsanitary, but regulars don't care.\nThe heart of business isn't here." },
        register: { name: 'Atsushi', text: "...!\nThis is it. The register.\nIn the end, business is all about money." }
      },
      atsushiLines: [
        "Hey hey... stop staring at me...",
        "What a naughty kitten you are...",
        "Focus on the analysis...",
        "I'm such a heartthrob...",
      ],
      registerLines: [
        "The result of my analysis is clear.",
        "What this shop is missing...\nis \"giving money to every customer.\"",
        "Hand out $10 to every customer.\nThey'll be happy, word spreads,\nand the shop thrives. A perfect theory.",
        "...Huh? Losses?\nA genius's theory has no losses."
      ],
      endingLine: "Heh...\nOnce again, my brilliance\nshines through...",
      shareBtn: 'Share on 𝕏',
      shareText: '📊 Business Analysis Game ~A Genius at Play~\nGenius analyst Atsushi\'s business analysis... what\'s the verdict!?\n\n#SurrealGames',
    }
  };

  // ===== ゲーム状態 =====
  let currentLang = (function() {
    try { const s = localStorage.getItem('sg_lang'); if (s === 'ja' || s === 'en') return s; } catch(e) {}
    return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
  })();

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
    currentDialogueSource: null // 'oyaji','ramen','sign','table','register' or 'atsushi'
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
    if (e.target.closest('button, a, #lang-switch')) return;

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
      sg.onGameStart();
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
          sg.sound.play('correct_gorgeous');
        } else {
          sg.sound.play('sparkle_click');
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
              sg.sound.playBgm('triumph');
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
      sg.sound.play('smash');

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
    sg.onGameEnd(undefined, { deathType: 'cleared' });
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

  // ===== 言語切り替え =====
  function applyLang() {
    const lang = t();
    $('game-title').innerHTML = lang.title;
    $('start-btn').textContent = lang.startBtn;
    $('back-link').textContent = lang.backLink;
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

    // 現在表示中のセリフテキストも更新
    if (state.phase === 'opening' && state.openingStep < lang.openingLines.length) {
      if (!state.typing) {
        $('opening-text').textContent = lang.openingLines[state.openingStep];
      }
    } else if (state.phase === 'register' && state.registerStep < lang.registerLines.length) {
      if (!state.typing) {
        $('register-text').textContent = lang.registerLines[state.registerStep];
      }
    } else if (state.phase === 'ending') {
      if (!state.typing) {
        $('ending-text').textContent = lang.endingLine;
      }
    }

    // ラーメン画面のセリフ（篤・オブジェクト）
    if (state.phase === 'ramen' && state.dialogueOpen && !state.typing && state.currentDialogueSource) {
      if (state.currentDialogueSource === 'atsushi') {
        $('dialogue-name').textContent = lang.openingName;
        const lines = lang.atsushiLines;
        $('dialogue-text').textContent = lines[state.currentAtsushiIndex % lines.length];
      } else {
        const data = lang.objectDialogues[state.currentDialogueSource];
        if (data) {
          $('dialogue-name').textContent = data.name;
          $('dialogue-text').textContent = data.text;
        }
      }
    }
  }

  function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('sg_lang', lang); } catch(e) {}
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    applyLang();
    window.dispatchEvent(new CustomEvent('surreal-lang-change', { detail: { lang } }));
  }

  function initLangSwitch() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(btn.dataset.lang);
      });
    });
  }

  // ===== 初期化 =====
  function init() {
    initTitle();
    initRamen();
    initEnding();
    initLangSwitch();
    document.addEventListener('click', handleScreenTap);
    // 保存された言語設定を適用
    setLang(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
