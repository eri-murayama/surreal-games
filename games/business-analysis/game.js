(function() {
  'use strict';

  // ===== ゲーム状態 =====
  const state = {
    phase: 'title',
    openingStep: 0,
    registerStep: 0,
    clickedObjects: new Set(),
    dialogueOpen: false,
    dialogueReady: false,
    typing: false,
    pendingDialogueClose: null,
    _skipTyping: null
  };

  // ===== セリフデータ =====
  const openingLines = [
    '俺の名は篤。天才経営アナリスト。\n数字が俺に恋をする…そういう男だ。',
    '今日も迷える子羊ちゃんたちの\n救いを求める声がする。',
    '俺を待ってろ、世界…！！',
    '……依頼が来たな。\nさびれたラーメン屋の経営分析か。',
    'どれ、この天才アナリストの\n目で見抜いてやるとしよう。'
  ];

  // 衝撃演出を入れるセリフindex
  const impactLines = [2]; // 「俺を待ってろ、世界…！！」

  const objectDialogues = {
    oyaji: {
      name: '篤',
      text: '汚いオヤジだ。\nでもそこが味がある。\nここは経営的にまずい箇所じゃないぞ。',
      correct: false
    },
    ramen: {
      name: '篤',
      text: 'くさい、まずい、汚い。\n三拍子揃った最悪のラーメンだが…\nこれは料理の問題だ。経営じゃない。',
      correct: false
    },
    sign: {
      name: '篤',
      text: '「ラーメン」としか書いていない看板。\nシンプルすぎるが…\nまあ、ラーメン屋だからな。問題ない。',
      correct: false
    },
    table: {
      name: '篤',
      text: 'ベタベタするテーブル。\n不衛生だが、常連は気にしない。\n経営の本質はここじゃないな。',
      correct: false
    },
    register: {
      name: '篤',
      text: '……！\nこれだ。レジだ。\n結局、経営の全ては金なんだよ。',
      correct: true
    }
  };

  // 篤クリック時のセリフ
  const atsushiLines = [
    'おいおい…俺ばっかり見るなよ…',
    'いけない子猫ちゃんだぜ…',
    '分析に集中するんだ…',
    '罪な俺…',
  ];
  let atsushiLineIndex = 0;

  const registerLines = [
    '経営分析の結果、答えは明白だ。',
    'この店に足りないもの…\nそれは「客に金を配ること」だ。',
    '来店した客全員に1000円を配れば\n客は喜び、口コミが広がり、\n店は繁盛する。完璧な理論だ。',
    '…え？赤字？\n天才の理論に赤字などない。'
  ];

  const endingLine = 'ふ…\nまた才能をきらめかせちまったぜ…';

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
      if (state.registerStep < registerLines.length) {
        spawnMoneyParticles();
      }
      playRegister();
    }
  }

  // ===== タイトル画面 =====
  function initTitle() {
    createSparkles($('title-sparkle-container'), 40);

    $('start-btn').addEventListener('click', () => {
      state.openingStep = 0;
      showScreen('opening');
      createSpeedLines();
      playOpening();
    });
  }

  // ===== オープニング =====
  function playOpening() {
    $('opening-indicator').classList.add('hidden');

    if (state.openingStep >= openingLines.length) {
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

    typeText($('opening-text'), openingLines[state.openingStep], TEXT_SPEED, () => {
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
        const data = objectDialogues[name];
        if (!data) return;

        state.dialogueOpen = true;
        dialogueName.textContent = data.name;
        dialogueBox.classList.remove('hidden');
        dialogueIndicator.classList.add('hidden');

        typeText(dialogueText, data.text, TEXT_SPEED_FAST, () => {
          dialogueIndicator.classList.remove('hidden');

          if (data.correct) {
            showCorrectMark(obj);
            screenFlash(screens.ramen);
            showMangaExclaim(screens.ramen, '正解！', '50%', '30%');

            state.pendingDialogueClose = () => {
              dialogueBox.classList.add('hidden');
              dialogueIndicator.classList.add('hidden');
              state.dialogueOpen = false;
              state.dialogueReady = false;
              state.pendingDialogueClose = null;
              state.registerStep = 0;
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

      state.dialogueOpen = true;
      const line = atsushiLines[atsushiLineIndex % atsushiLines.length];
      atsushiLineIndex++;
      dialogueName.textContent = '篤';
      dialogueBox.classList.remove('hidden');
      dialogueIndicator.classList.add('hidden');

      typeText(dialogueText, line, TEXT_SPEED_FAST, () => {
        dialogueIndicator.classList.remove('hidden');
        state.pendingDialogueClose = () => {
          dialogueBox.classList.add('hidden');
          dialogueIndicator.classList.add('hidden');
          state.dialogueOpen = false;
          state.dialogueReady = false;
          state.pendingDialogueClose = null;
        };
      });
    });
  }

  // ===== レジ演出 =====
  function playRegister() {
    $('register-indicator').classList.add('hidden');

    if (state.registerStep >= registerLines.length) {
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

    typeText($('register-text'), registerLines[state.registerStep], TEXT_SPEED, () => {
      $('register-indicator').classList.remove('hidden');
    });
  }

  // ===== エンディング =====
  function playEnding() {
    typeText($('ending-text'), endingLine, ENDING_SPEED, () => {
      $('ending-buttons').classList.remove('hidden');
    });
  }

  function initEnding() {
    $('replay-btn').addEventListener('click', () => {
      state.clickedObjects.clear();
      state.openingStep = 0;
      state.registerStep = 0;
      atsushiLineIndex = 0;
      state.dialogueOpen = false;
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

  // ===== 初期化 =====
  function init() {
    initTitle();
    initRamen();
    initEnding();
    document.addEventListener('click', handleScreenTap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
