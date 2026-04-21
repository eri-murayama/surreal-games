(function () {
  'use strict';

  var LANG = localStorage.getItem('sg-lang') || 'ja';
  var I18N = {
    ja: {
      title: 'しろたんと恋のかけら', subtitle: '～きみと、ほのぼの～',
      startBtn: 'はじめる', shareBtn: '𝕏でシェア', replayBtn: 'もういちど',
      moreGames: '他のゲームも遊ぶ →', backToTop: '← トップに戻る',
      disclaimer: '※「しろたん」は株式会社クリエイティブヨーコのキャラクターです。本作は非公式のファン作品（非営利）です。',
      speakerYou: 'わたし', speakerShirotan: 'しろたん', speakerNarrator: '',
      endLove: '💗 ラブエンド', endFriend: '🌸 なかよしエンド', endLonely: '🌙 きみは遠いエンド',
      shareText: 'しろたんとの物語、完結したよ！'
    },
    en: {
      title: 'Shirotan & Hearts', subtitle: '~With you, gently~',
      startBtn: 'Start', shareBtn: 'Share on 𝕏', replayBtn: 'Play again',
      moreGames: 'More games →', backToTop: '← Home',
      disclaimer: '※ "Shirotan" is a character of Creative Yoko Co., Ltd. Unofficial fan work.',
      speakerYou: 'You', speakerShirotan: 'Shirotan', speakerNarrator: '',
      endLove: '💗 Love End', endFriend: '🌸 Friends End', endLonely: '🌙 Distant End',
      shareText: 'I finished Shirotan\'s story!'
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (I18N[LANG][k] !== undefined) el.textContent = I18N[LANG][k];
    });
    document.title = t('title') + ' - シュールゲームス';
  }

  // ============ シナリオ ============
  // scene: { bg, char, emo, lines: [{ who, text }], choices: [{ text, love, next }] }
  var SCENARIO = {
    ja: [
      { // 0: 海辺の出会い
        bg: 'scene-beach', char: 'assets/shirotan4.png',
        lines: [
          { who: 'narrator', text: '夏のおわりかけ、わたしはひとりで海辺を歩いていた。' },
          { who: 'narrator', text: '足元にまるい、しろいものが…。' },
          { who: 'shirotan', text: 'ぷくぅ…。', emo: '❓' },
          { who: 'you', text: 'えっ、あざらしの赤ちゃん？こんなところに…？' }
        ],
        choices: [
          { text: '「どうしたの？迷子？」やさしく話しかける', love: 3, next: 1 },
          { text: '…そっとしておこう。遠くから見守る', love: 1, next: 1 },
          { text: '「かわいい〜！！」思わず抱きしめる', love: -1, next: 1 }
        ]
      },
      { // 1: 会話
        bg: 'scene-beach', char: 'assets/shirotan1.png',
        lines: [
          { who: 'shirotan', text: 'ぷくっ…ぼく、まいごじゃないよ。きみをまってたんだ。', emo: '💫' },
          { who: 'you', text: 'えっ、わたしを…？' },
          { who: 'shirotan', text: 'うん。きみ、きょう、なんだかしょんぼりしてるでしょ？', emo: '🍀' },
          { who: 'narrator', text: '見透かされてしまった。たしかに、朝からずっと気持ちが沈んでいた。' }
        ],
        choices: [
          { text: '「うん、ちょっと疲れちゃって…」素直に話す', love: 4, next: 2 },
          { text: '「どうしてわかるの？」驚いて聞き返す', love: 2, next: 2 },
          { text: '「だいじょうぶだよ」強がる', love: 0, next: 2 }
        ]
      },
      { // 2: 夕焼け
        bg: 'scene-sunset', char: 'assets/shirotan2.png',
        lines: [
          { who: 'narrator', text: '気がつくと、空はやさしい夕焼け色になっていた。' },
          { who: 'shirotan', text: 'ねえ、いっしょにゆうやけ、みようよ。', emo: '💗' },
          { who: 'shirotan', text: 'まいにちがんばってるきみに、ごほうびの じかん。', emo: '' },
          { who: 'you', text: '…ありがとう。' }
        ],
        choices: [
          { text: 'そっと隣にすわって、肩を寄せる', love: 5, next: 3 },
          { text: '「きれいだね」とぽつり', love: 3, next: 3 },
          { text: '写真を撮る', love: 1, next: 3 }
        ]
      },
      { // 3: カフェ（翌日）
        bg: 'scene-cafe', char: 'assets/shirotan1.png',
        lines: [
          { who: 'narrator', text: 'つぎの日、わたしは海辺の小さなカフェにしろたんを連れてきた。' },
          { who: 'shirotan', text: 'ここ、あったかい〜。ぷくぷく。', emo: '☕' },
          { who: 'you', text: '店員さんがすごい顔で見てる…。' },
          { who: 'shirotan', text: 'きみとのじかん、ずっとおぼえていたいな。', emo: '💗' }
        ],
        choices: [
          { text: '「わたしも」と手を添える', love: 6, next: 4 },
          { text: 'ふふっと笑う', love: 3, next: 4 },
          { text: 'アイスクリームを注文する', love: 1, next: 4 }
        ]
      },
      { // 4: 雨
        bg: 'scene-rain', char: 'assets/shirotan4.png',
        lines: [
          { who: 'narrator', text: '急に、雨がふりはじめた。' },
          { who: 'shirotan', text: 'あ…あめだ。ぼく、ぬれるのはへいきだけど…。', emo: '💧' },
          { who: 'shirotan', text: 'きみは、かぜひいちゃうよ。', emo: '' }
        ],
        choices: [
          { text: 'しろたんを抱きかかえて、屋根の下へ走る', love: 5, next: 5 },
          { text: '「だいじょうぶ、一緒にいよう」', love: 4, next: 5 },
          { text: 'とりあえず自分だけ軒下へ', love: -2, next: 5 }
        ]
      },
      { // 5: 夜の浜辺（分岐）
        bg: 'scene-night', char: 'assets/shirotan2.png',
        lines: [
          { who: 'narrator', text: '夜、星が降るような浜辺で、しろたんはぽつりと言った。' },
          { who: 'shirotan', text: 'ぼくね、ほんとうはうみのむこうからきたんだ。', emo: '✨' },
          { who: 'shirotan', text: 'あしたには、かえらなきゃいけないの。', emo: '🌙' },
          { who: 'you', text: 'そんな…。' },
          { who: 'shirotan', text: 'ねえ、さいごに。きみのきもちを、きかせて。', emo: '💗' }
        ],
        choices: [
          { text: '「ずっといっしょにいたい」', love: 10, next: -1 },
          { text: '「また会おうね、きっと」', love: 3, next: -1 },
          { text: '「忘れないで、いてくれるかな」', love: 1, next: -1 }
        ]
      }
    ],
    en: [
      {
        bg: 'scene-beach', char: 'assets/shirotan4.png',
        lines: [
          { who: 'narrator', text: 'At the end of summer, I was walking alone on the beach.' },
          { who: 'narrator', text: 'Something small and white lay at my feet...' },
          { who: 'shirotan', text: 'Puku...', emo: '❓' },
          { who: 'you', text: 'A baby seal? In a place like this?' }
        ],
        choices: [
          { text: '"Are you lost?" Speak gently', love: 3, next: 1 },
          { text: 'Watch quietly from a distance', love: 1, next: 1 },
          { text: '"So cute!!" Hug instantly', love: -1, next: 1 }
        ]
      },
      {
        bg: 'scene-beach', char: 'assets/shirotan1.png',
        lines: [
          { who: 'shirotan', text: "I'm not lost. I was waiting for you.", emo: '💫' },
          { who: 'you', text: 'For... me?' },
          { who: 'shirotan', text: "You look a little sad today, don't you?", emo: '🍀' },
          { who: 'narrator', text: 'How did they know?' }
        ],
        choices: [
          { text: '"Yeah, I\'m a bit tired..." Honest', love: 4, next: 2 },
          { text: '"How did you know?" Surprised', love: 2, next: 2 },
          { text: '"I\'m fine." Pretend', love: 0, next: 2 }
        ]
      },
      {
        bg: 'scene-sunset', char: 'assets/shirotan2.png',
        lines: [
          { who: 'narrator', text: 'The sky turned a gentle sunset color.' },
          { who: 'shirotan', text: "Let's watch the sunset together.", emo: '💗' },
          { who: 'shirotan', text: "A reward-time for you who work so hard.", emo: '' },
          { who: 'you', text: '...thank you.' }
        ],
        choices: [
          { text: 'Sit beside them quietly', love: 5, next: 3 },
          { text: '"It\'s beautiful"', love: 3, next: 3 },
          { text: 'Take a photo', love: 1, next: 3 }
        ]
      },
      {
        bg: 'scene-cafe', char: 'assets/shirotan1.png',
        lines: [
          { who: 'narrator', text: 'The next day, I brought Shirotan to a little seaside cafe.' },
          { who: 'shirotan', text: "It's so warm here~", emo: '☕' },
          { who: 'you', text: 'The staff is giving us a strange look...' },
          { who: 'shirotan', text: "I want to remember this time with you forever.", emo: '💗' }
        ],
        choices: [
          { text: '"Me too" and touch their paw', love: 6, next: 4 },
          { text: 'Smile softly', love: 3, next: 4 },
          { text: 'Order ice cream', love: 1, next: 4 }
        ]
      },
      {
        bg: 'scene-rain', char: 'assets/shirotan4.png',
        lines: [
          { who: 'narrator', text: 'It suddenly started to rain.' },
          { who: 'shirotan', text: "Rain... I don't mind getting wet, but...", emo: '💧' },
          { who: 'shirotan', text: "You'll catch a cold.", emo: '' }
        ],
        choices: [
          { text: 'Carry Shirotan under the roof', love: 5, next: 5 },
          { text: '"It\'s okay, let\'s stay together"', love: 4, next: 5 },
          { text: 'Dash to shelter alone', love: -2, next: 5 }
        ]
      },
      {
        bg: 'scene-night', char: 'assets/shirotan2.png',
        lines: [
          { who: 'narrator', text: 'On a starry beach at night, Shirotan spoke quietly.' },
          { who: 'shirotan', text: "I'm actually from across the sea.", emo: '✨' },
          { who: 'shirotan', text: "Tomorrow, I have to go back.", emo: '🌙' },
          { who: 'you', text: 'No way...' },
          { who: 'shirotan', text: 'At the end... tell me how you feel.', emo: '💗' }
        ],
        choices: [
          { text: '"I want to stay with you forever"', love: 10, next: -1 },
          { text: '"We\'ll meet again, I\'m sure"', love: 3, next: -1 },
          { text: '"Please, don\'t forget me"', love: 1, next: -1 }
        ]
      }
    ]
  };

  // ============ 状態 ============
  var state = { sceneIdx: 0, lineIdx: 0, love: 0, showingChoices: false };

  // ============ BGM: やさしいピアノ風 ============
  var audioCtx = null;
  var bgmNodes = [];
  var muted = localStorage.getItem('sg-muted-shirotan') === '1';

  function getCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return audioCtx;
  }

  function startBGM() {
    var ctx = getCtx(); if (!ctx || muted) return;
    stopBGM();

    var master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);
    master.connect(ctx.destination);
    bgmNodes.push(master);

    // やさしい循環コード：Am → F → C → G
    // ピアノ風（sine + triangle短音）
    var bpm = 74;
    var beat = 60 / bpm;

    // 和音（トップノートが切ない）
    var chords = [
      { bass: 110.00, notes: [261.63, 329.63, 440.00] }, // Am
      { bass: 87.31,  notes: [261.63, 349.23, 440.00] }, // F
      { bass: 130.81, notes: [261.63, 329.63, 392.00] }, // C
      { bass: 98.00,  notes: [246.94, 293.66, 392.00] }  // G
    ];

    // 上メロ（A-G-E-D-Cと下降する切ない旋律）
    var melody = [
      880.00, 784.00, 659.25, 587.33, 523.25,
      587.33, 659.25, 784.00, 698.46, 659.25,
      587.33, 523.25, 493.88, 523.25, 587.33, 659.25
    ];

    function playMel(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.05);
      bgmNodes.push(o, g);
    }

    function playPad(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.5);
      g.gain.linearRampToValueAtTime(vol * 0.6, t0 + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.05);
      bgmNodes.push(o, g);
    }

    function schedule(startOffset) {
      // 4コード × 1小節（4拍）= 4小節
      chords.forEach(function (ch, i) {
        var start = startOffset + i * 4 * beat;
        // ベース
        playPad(ch.bass, start, 4 * beat, 0.1);
        // パッド（コード音、長め）
        ch.notes.forEach(function (f) {
          playPad(f, start, 4 * beat, 0.04);
        });
      });
      // メロディ（8分音符で16音）
      for (var i = 0; i < melody.length; i++) {
        playMel(melody[i], startOffset + i * beat * 0.5, beat * 0.5, 0.09);
      }
    }

    var loopLen = 16 * beat;
    schedule(0);
    var timer = setInterval(function () {
      if (!audioCtx || muted) { clearInterval(timer); return; }
      schedule(0);
    }, loopLen * 1000);
    bgmNodes.push({ type: 'timer', id: timer });
  }

  function stopBGM() {
    bgmNodes.forEach(function (n) {
      try {
        if (n && n.type === 'timer') clearInterval(n.id);
        else if (n && n.stop) n.stop();
        else if (n && n.disconnect) n.disconnect();
      } catch (e) {}
    });
    bgmNodes = [];
  }

  function sfxBeep(freq, dur, type) {
    var ctx = getCtx(); if (!ctx || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + (dur || 0.1) + 0.05);
  }
  function sfxChoice()  { sfxBeep(880, 0.15, 'sine'); }
  function sfxHeart()   { sfxBeep(1046, 0.08, 'sine'); setTimeout(function(){ sfxBeep(1318, 0.12, 'sine'); }, 80); }
  function sfxNext()    { sfxBeep(660, 0.05, 'sine'); }

  // ============ シーン描画 ============
  function getScenario() { return SCENARIO[LANG] || SCENARIO.ja; }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  }

  function renderScene() {
    var sc = getScenario()[state.sceneIdx];
    if (!sc) { endGame(); return; }

    document.getElementById('scene-bg').className = 'scene-bg ' + sc.bg;
    document.getElementById('char-img').src = sc.char;
    document.getElementById('scene-num').textContent = (state.sceneIdx + 1) + ' / ' + getScenario().length;

    state.lineIdx = 0;
    state.showingChoices = false;
    document.getElementById('choices').classList.remove('show');
    showLine();
    updateMeter();
  }

  function showLine() {
    var sc = getScenario()[state.sceneIdx];
    var line = sc.lines[state.lineIdx];
    if (!line) { showChoices(); return; }

    var speakerKey = line.who === 'you' ? 'speakerYou'
                   : line.who === 'shirotan' ? 'speakerShirotan'
                   : 'speakerNarrator';
    var speaker = document.getElementById('speaker');
    speaker.textContent = t(speakerKey);
    speaker.style.display = t(speakerKey) ? 'block' : 'none';

    // タイプライター風
    var textEl = document.getElementById('dialog-text');
    textEl.textContent = '';
    var chars = (line.text || '').split('');
    var i = 0;
    clearInterval(textEl._typer);
    document.getElementById('next-hint').classList.add('hidden');
    textEl._typer = setInterval(function () {
      if (i >= chars.length) {
        clearInterval(textEl._typer);
        document.getElementById('next-hint').classList.remove('hidden');
        return;
      }
      textEl.textContent += chars[i++];
    }, 30);
    textEl._done = function () {
      clearInterval(textEl._typer);
      textEl.textContent = line.text;
      document.getElementById('next-hint').classList.remove('hidden');
    };

    // キャラ表情切替
    var emo = document.getElementById('char-emo');
    emo.classList.remove('show');
    if (line.emo) {
      setTimeout(function () {
        emo.textContent = line.emo;
        emo.classList.add('show');
      }, 100);
    }

    // narrator時はspeaker非表示
    if (line.who === 'narrator') speaker.style.display = 'none';

    sfxNext();
  }

  function advance() {
    if (state.showingChoices) return;

    var textEl = document.getElementById('dialog-text');
    var sc = getScenario()[state.sceneIdx];
    var line = sc.lines[state.lineIdx];

    // タイプライター中ならスキップ
    if (textEl._typer && line && textEl.textContent.length < line.text.length) {
      textEl._done();
      return;
    }

    state.lineIdx++;
    if (state.lineIdx < sc.lines.length) {
      showLine();
    } else {
      showChoices();
    }
  }

  function showChoices() {
    var sc = getScenario()[state.sceneIdx];
    if (!sc.choices || !sc.choices.length) { endGame(); return; }

    state.showingChoices = true;
    document.getElementById('next-hint').classList.add('hidden');
    var box = document.getElementById('choices');
    box.innerHTML = '';
    sc.choices.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = c.text;
      btn.addEventListener('click', function () {
        pickChoice(c);
      });
      box.appendChild(btn);
    });
    box.classList.add('show');
  }

  function pickChoice(c) {
    state.love += c.love;
    sfxChoice();
    if (c.love > 0) {
      sfxHeart();
      var cs = document.getElementById('char-stage');
      cs.classList.remove('shake');
      flyHearts(c.love);
    } else if (c.love < 0) {
      document.getElementById('char-stage').classList.add('shake');
      setTimeout(function () { document.getElementById('char-stage').classList.remove('shake'); }, 400);
    }
    updateMeter();
    document.getElementById('choices').classList.remove('show');
    state.showingChoices = false;

    if (c.next === -1 || c.next === undefined || c.next >= getScenario().length) {
      setTimeout(endGame, 900);
    } else {
      state.sceneIdx = c.next;
      setTimeout(renderScene, 700);
    }
  }

  function flyHearts(n) {
    var stage = document.getElementById('char-stage');
    for (var i = 0; i < Math.min(n, 6); i++) {
      (function (i) {
        setTimeout(function () {
          var h = document.createElement('div');
          h.textContent = '💗';
          h.style.cssText = 'position:absolute;font-size:22px;left:' + (40 + Math.random() * 180) + 'px;top:' + (100 + Math.random() * 80) + 'px;pointer-events:none;animation:emoPop 0.8s ease-out forwards;';
          stage.appendChild(h);
          setTimeout(function () {
            h.style.transition = 'all 1s';
            h.style.transform = 'translateY(-60px)';
            h.style.opacity = '0';
          }, 100);
          setTimeout(function () { h.remove(); }, 1200);
        }, i * 100);
      })(i);
    }
  }

  function updateMeter() {
    var pct = Math.max(0, Math.min(100, (state.love / 30) * 100));
    document.getElementById('meter-fill').style.width = pct + '%';
    document.getElementById('meter-value').textContent = state.love;
  }

  // ============ エンディング ============
  function endGame() {
    var title, text, img;
    if (state.love >= 22) {
      title = t('endLove');
      img = 'assets/shirotan2.png';
      text = LANG === 'ja'
        ? 'しろたんは海のむこうへ帰った。でも毎年、夏のおわりに、きみに会いに戻ってくる。星がふる浜辺で、しろたんはきみの手をじっと見つめて、ぷくっと笑った。'
        : 'Shirotan went back across the sea — but every summer, they return to meet you. On a starry beach, they look at your hand and smile a tiny "puku".';
      rainHearts();
    } else if (state.love >= 10) {
      title = t('endFriend');
      img = 'assets/shirotan1.png';
      text = LANG === 'ja'
        ? 'しろたんはさよならを告げて旅立った。きみのポケットには、きらきらひかる小さな貝がらがひとつ。「またね」の約束だけが、ずっと胸に残った。'
        : 'Shirotan said goodbye and left. In your pocket — a tiny shining shell. Only the promise of "see you again" remained in your heart.';
    } else {
      title = t('endLonely');
      img = 'assets/shirotan3.png';
      text = LANG === 'ja'
        ? 'しろたんは静かに消えていった。夕焼けのにおい、雨の音、あの会話。ぜんぶ、夢だったのかもしれない…でも、なぜかきみは、少しだけ優しくなれた気がした。'
        : 'Shirotan quietly disappeared. The scent of sunset, the sound of rain, those words... maybe it was all a dream. But somehow, you feel a little kinder now.';
    }

    document.getElementById('end-title').textContent = title;
    document.getElementById('end-text').textContent = text;
    document.getElementById('end-char').src = img;
    showScreen('end-screen');
  }

  function rainHearts() {
    var bg = document.querySelector('#end-screen .end-bg');
    var rain = document.createElement('div');
    rain.className = 'heart-rain';
    bg.appendChild(rain);
    var icons = ['💗','💖','💕','♡','✨'];
    for (var i = 0; i < 20; i++) {
      (function (i) {
        setTimeout(function () {
          var h = document.createElement('span');
          h.className = 'heart';
          h.textContent = icons[Math.floor(Math.random() * icons.length)];
          h.style.left = (Math.random() * 400) + 'px';
          h.style.animationDelay = (Math.random() * 1) + 's';
          h.style.animationDuration = (2 + Math.random() * 2) + 's';
          rain.appendChild(h);
          setTimeout(function () { h.remove(); }, 4000);
        }, i * 200);
      })(i);
    }
  }

  // ============ 初期化 ============
  function init() {
    applyI18n();

    document.getElementById('start-btn').addEventListener('click', function () {
      state = { sceneIdx: 0, lineIdx: 0, love: 0, showingChoices: false };
      showScreen('adv-screen');
      renderScene();
      if (!muted) startBGM();
    });

    document.getElementById('replay-btn').addEventListener('click', function () {
      state = { sceneIdx: 0, lineIdx: 0, love: 0, showingChoices: false };
      showScreen('adv-screen');
      renderScene();
    });

    document.getElementById('share-btn').addEventListener('click', function () {
      var url = 'https://eri-murayama.github.io/surreal-games/games/shirotan-love/index.html';
      var endTxt = document.getElementById('end-title').textContent;
      var text = t('shareText') + ' ' + endTxt + ' #しろたん恋のかけら #シュールゲームス';
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
    });

    // ADV画面タップで進める
    document.getElementById('adv-screen').addEventListener('click', function (e) {
      if (e.target.closest('.choice-btn')) return;
      if (e.target.closest('.mini-btn')) return;
      if (e.target.closest('.love-meter')) return;
      advance();
    });

    // スキップ
    document.getElementById('skip-btn').addEventListener('click', function () {
      var textEl = document.getElementById('dialog-text');
      if (textEl._typer && textEl._done) { textEl._done(); return; }
      advance();
    });

    document.getElementById('lang-btn').addEventListener('click', function () {
      LANG = LANG === 'ja' ? 'en' : 'ja';
      localStorage.setItem('sg-lang', LANG);
      applyI18n();
    });

    // ミュートボタン（タイトル＆ADV）
    function setupMute(btnId) {
      var btn = document.getElementById(btnId);
      if (!btn) return;
      btn.textContent = muted ? '🔇' : '🔊';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        muted = !muted;
        localStorage.setItem('sg-muted-shirotan', muted ? '1' : '0');
        document.getElementById('mute-btn').textContent = muted ? '🔇' : '🔊';
        if (document.getElementById('mute2-btn')) document.getElementById('mute2-btn').textContent = muted ? '🔇' : '🔊';
        if (muted) stopBGM(); else startBGM();
      });
    }
    setupMute('mute-btn');
    setupMute('mute2-btn');

    // ADV画面でBGM起動
    var started = false;
    function tryStart() {
      if (started) return;
      started = true;
      if (!muted) startBGM();
    }
    document.addEventListener('click', tryStart, { once: true });
    document.addEventListener('touchstart', tryStart, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
