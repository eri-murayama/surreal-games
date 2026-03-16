(function() {
  'use strict';

  // ===== ゲーム状態 =====
  const state = {
    phase: 'title', // title, opening, ramen, register, ending
    openingStep: 0,
    registerStep: 0,
    endingStep: 0,
    clickedObjects: new Set(),
    dialogueOpen: false,
    typing: false
  };

  // ===== セリフデータ =====
  const openingLines = [
    '今日も迷える子羊ちゃんたちの\n救いを求める声がする。',
    '俺を待ってろ、世界…！！',
    '……依頼が来たな。\nさびれたラーメン屋の経営分析か。',
    'どれ、この天才アナリストの\n目で見抜いてやるとしよう。'
  ];

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

  const registerLines = [
    '経営分析の結果、答えは明白だ。',
    'この店に足りないもの…\nそれは「客に金を配ること」だ。',
    '来店した客全員に1000円を配れば\n客は喜び、口コミが広がり、\n店は繁盛する。完璧な理論だ。',
    '…え？赤字？\n天才の理論に赤字などない。'
  ];

  const endingLine = 'ふ…\nまた才能をきらめかせちまったぜ…';

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
    screens[name].classList.remove('hidden');
    state.phase = name;
  }

  function typeText(element, text, speed, callback) {
    if (state.typing) return;
    state.typing = true;
    element.textContent = '';
    let i = 0;

    // カーソル追加
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    function tick() {
      if (i < text.length) {
        element.textContent = text.substring(0, i + 1);
        element.appendChild(cursor);
        i++;
        setTimeout(tick, speed);
      } else {
        if (cursor.parentNode) cursor.remove();
        state.typing = false;
        if (callback) callback();
      }
    }
    tick();
  }

  // ===== キラキラエフェクト =====
  function createSparkles(container, count) {
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 3 + 's';
      sparkle.style.animationDuration = (2 + Math.random() * 2) + 's';
      const size = 3 + Math.random() * 6;
      sparkle.style.width = size + 'px';
      sparkle.style.height = size + 'px';
      container.appendChild(sparkle);
    }
  }

  // ===== お金パーティクル =====
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

  // ===== タイトル画面 =====
  function initTitle() {
    createSparkles($('title-sparkle-container'), 30);

    $('start-btn').addEventListener('click', () => {
      state.openingStep = 0;
      showScreen('opening');
      playOpening();
    });
  }

  // ===== オープニング =====
  function playOpening() {
    const nextBtn = $('opening-next-btn');
    nextBtn.classList.add('hidden');

    if (state.openingStep >= openingLines.length) {
      showScreen('ramen');
      return;
    }

    typeText($('opening-text'), openingLines[state.openingStep], 50, () => {
      nextBtn.classList.remove('hidden');
    });
  }

  function initOpening() {
    $('opening-next-btn').addEventListener('click', () => {
      if (state.typing) return;
      state.openingStep++;
      playOpening();
    });
  }

  // ===== ラーメン屋シーン =====
  function initRamen() {
    const objects = document.querySelectorAll('.clickable-obj');
    const dialogueBox = $('dialogue-box');
    const dialogueText = $('dialogue-text');
    const dialogueName = $('dialogue-name');

    objects.forEach(obj => {
      obj.addEventListener('click', () => {
        if (state.dialogueOpen || state.typing) return;

        const name = obj.dataset.name;
        const data = objectDialogues[name];
        if (!data) return;

        state.dialogueOpen = true;
        dialogueName.textContent = data.name;
        dialogueBox.classList.remove('hidden');

        typeText(dialogueText, data.text, 40, () => {
          if (data.correct) {
            // 正解！レジシーンへ
            $('dialogue-close-btn').onclick = () => {
              dialogueBox.classList.add('hidden');
              state.dialogueOpen = false;
              state.registerStep = 0;
              showScreen('register');
              spawnMoneyParticles();
              playRegister();
            };
          } else {
            // 不正解
            obj.classList.add('wrong');
            setTimeout(() => obj.classList.remove('wrong'), 400);
            state.clickedObjects.add(name);

            $('dialogue-close-btn').onclick = () => {
              dialogueBox.classList.add('hidden');
              state.dialogueOpen = false;
            };
          }
        });
      });
    });
  }

  // ===== レジ演出 =====
  function playRegister() {
    const nextBtn = $('register-next-btn');
    nextBtn.classList.add('hidden');

    if (state.registerStep >= registerLines.length) {
      // エンディングへ
      showScreen('ending');
      createSparkles($('ending-sparkle-container'), 40);
      playEnding();
      return;
    }

    typeText($('register-text'), registerLines[state.registerStep], 50, () => {
      nextBtn.classList.remove('hidden');
    });
  }

  function initRegister() {
    $('register-next-btn').addEventListener('click', () => {
      if (state.typing) return;
      state.registerStep++;
      if (state.registerStep < registerLines.length) {
        spawnMoneyParticles();
      }
      playRegister();
    });
  }

  // ===== エンディング =====
  function playEnding() {
    typeText($('ending-text'), endingLine, 80, () => {
      $('ending-buttons').classList.remove('hidden');
    });
  }

  function initEnding() {
    $('replay-btn').addEventListener('click', () => {
      // リセット
      state.clickedObjects.clear();
      state.openingStep = 0;
      state.registerStep = 0;
      state.dialogueOpen = false;
      state.typing = false;
      $('ending-buttons').classList.add('hidden');
      $('dialogue-box').classList.add('hidden');

      // キラキラをリセット
      $('title-sparkle-container').innerHTML = '';
      $('ending-sparkle-container').innerHTML = '';
      createSparkles($('title-sparkle-container'), 30);

      showScreen('title');
    });
  }

  // ===== 初期化 =====
  function init() {
    initTitle();
    initOpening();
    initRamen();
    initRegister();
    initEnding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
