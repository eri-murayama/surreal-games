(function () {
  'use strict';

  // ============ i18n ============
  var LANG = localStorage.getItem('sg-lang') || 'ja';
  var I18N = {
    ja: {
      title: 'しろたんお着替え', subtitle: '～ゆるふわコーデ～',
      tabHat: 'ぼうし', tabOutfit: 'ふく', tabCheek: 'ほっぺ', tabBack: 'もちもの', tabBg: 'はいけい',
      resetBtn: 'リセット', randomBtn: 'おまかせ', shareBtn: '𝕏でシェア',
      moreGames: '他のゲームも遊ぶ →', backToTop: '← トップに戻る',
      disclaimer: '※「しろたん」は株式会社クリエイティブヨーコのキャラクターです。本作は非公式のファン作品（非営利）です。',
      shareText: 'しろたんをかわいくコーデしたよ！#しろたんお着替え #シュールゲームス',
      none: 'なし',
      toastReset: 'リセットしたよ〜', toastRandom: 'おまかせコーデ！'
    },
    en: {
      title: 'Shirotan Dress-up', subtitle: '~Fluffy Outfits~',
      tabHat: 'Hat', tabOutfit: 'Outfit', tabCheek: 'Cheeks', tabBack: 'Item', tabBg: 'BG',
      resetBtn: 'Reset', randomBtn: 'Random', shareBtn: 'Share on 𝕏',
      moreGames: 'More games →', backToTop: '← Home',
      disclaimer: '※ "Shirotan" is a character of Creative Yoko Co., Ltd. This is an unofficial non-commercial fan work.',
      shareText: 'I dressed up Shirotan! #ShirotanDressup #SurrealGames',
      none: 'none',
      toastReset: 'Reset!', toastRandom: 'Random outfit!'
    }
  };
  function t(key) { return (I18N[LANG] && I18N[LANG][key]) || key; }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (I18N[LANG][k]) el.textContent = I18N[LANG][k];
    });
    document.title = t('title') + ' - シュールゲームス';
  }

  // ============ アイテム定義 ============
  // 文字列=絵文字 / {img: 'path'}=画像オーバーレイ / ''=なし
  var ITEMS = {
    hat:    ['', { img: 'assets/ribbon.png', label: 'りぼん' }, '🎀', '👑', '🎩', '🧢', '🌸', '🎓', '⭐', '🍓', '🌟'],
    outfit: ['', '👗', '🧣', '🎽', '👚', '🦺', '🎀', '🌺'],
    cheek:  ['', '💗', '🌸', '✨', '♥', '⭐'],
    back:   ['', { img: 'assets/bag.png', label: 'かばん' }, '☁️', '🌈', '🌸', '💫', '🎈', '🌙', '⭐']
  };
  function isImgItem(v) { return v && typeof v === 'object' && v.img; }
  function itemKey(v) { return isImgItem(v) ? 'img:' + v.img : (v || ''); }
  var BGS = ['bg-sky','bg-sunset','bg-night','bg-meadow','bg-ocean','bg-sakura','bg-beach'];

  // ============ 状態 ============
  var state = { hat: '', outfit: '', cheek: '', back: '', bg: 'bg-sky' };
  var currentTab = 'hat';

  // ============ BGM: シャボン玉ふんわりお花畑（A major、ゆったり跳ねるオルゴール調） ============
  var audioCtx = null;
  var bgmNodes = [];
  var muted = localStorage.getItem('sg-muted-shirotan') === '1';

  function getCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return audioCtx;
  }

  function startBGM() {
    var ctx = getCtx(); if (!ctx || muted) return;
    stopBGM();

    var master = ctx.createGain();
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);
    master.connect(ctx.destination);
    bgmNodes.push(master);

    // やわらかいローパスで角を取る（オルゴールっぽい音色）
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    lp.Q.value = 0.5;
    lp.connect(master);
    bgmNodes.push(lp);

    // A major ペンタトニック（A-B-C#-E-F#）+ オクターブ上で華やか
    // テンポをやさしめに
    var bpm = 92;
    var beat = 60 / bpm;
    var sub = beat / 2;

    // メロディ（軽やかに上下、跳ねる感じ）
    // A4=440, B4=493.88, C#5=554.37, E5=659.25, F#5=739.99, A5=880, B5=987.77, C#6=1108.73, E6=1318.51
    var phrase1 = [
      { n: 880.00, d: 0.5 }, // A5
      { n: 987.77, d: 0.5 }, // B5
      { n: 1108.73, d: 0.5 },// C#6
      { n: 987.77, d: 0.5 }, // B5
      { n: 880.00, d: 1.0 }, // A5
      { n: 739.99, d: 0.5 }, // F#5
      { n: 880.00, d: 1.5 }  // A5（伸ばす）
    ];
    var phrase2 = [
      { n: 1108.73, d: 0.5 },// C#6
      { n: 987.77, d: 0.5 }, // B5
      { n: 880.00, d: 0.5 }, // A5
      { n: 739.99, d: 0.5 }, // F#5
      { n: 659.25, d: 1.0 }, // E5
      { n: 739.99, d: 0.5 }, // F#5
      { n: 880.00, d: 1.5 }  // A5
    ];

    // コード進行 A - F#m - D - E（ハッピーで明るい王道）
    var chordProg = [
      [110.00, 220.00, 277.18, 329.63], // A
      [92.50,  185.00, 277.18, 369.99], // F#m
      [73.42,  146.83, 220.00, 293.66], // D
      [82.41,  164.81, 246.94, 329.63]  // E
    ];

    // メロディ：オルゴール風（sine + 三角波の倍音）
    function playMel(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.9);
      o.connect(g); g.connect(lp);
      o.start(t0); o.stop(t0 + dur);
      bgmNodes.push(o, g);

      // オクターブ上のシャボン玉キラキラ（短く弾ける）
      var o2 = ctx.createOscillator();
      var g2 = ctx.createGain();
      o2.type = 'triangle';
      o2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(0, t0);
      g2.gain.linearRampToValueAtTime(vol * 0.25, t0 + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.4);
      o2.connect(g2); g2.connect(lp);
      o2.start(t0); o2.stop(t0 + dur);
      bgmNodes.push(o2, g2);
    }

    // ピチカート風ベース（弾むリズム）
    function playPluck(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(lp);
      o.start(t0); o.stop(t0 + dur + 0.05);
      bgmNodes.push(o, g);
    }

    // シャボン玉ぱちん（高音の短い音）
    function playBubble(start) {
      var freq = 1500 + Math.random() * 700;
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + start);
      o.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + start + 0.08);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + start + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.15);
      o.connect(g); g.connect(master);
      o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + 0.2);
      bgmNodes.push(o, g);
    }

    function schedule(start) {
      // メロディ：phrase1（4拍）→phrase2（4拍）
      var cur = start;
      phrase1.forEach(function (n) {
        playMel(n.n, cur, n.d * beat, 0.1);
        cur += n.d * beat;
      });
      phrase2.forEach(function (n) {
        playMel(n.n, cur, n.d * beat, 0.1);
        cur += n.d * beat;
      });

      // 4コード × 2拍ずつ = 8拍
      for (var i = 0; i < 4; i++) {
        var s = start + i * 2 * beat;
        var ch = chordProg[i];
        // ベース（1拍目）
        playPluck(ch[0], s, 0.4 * beat, 0.13);
        // 跳ねるリズム（裏拍にコード音）
        playPluck(ch[2], s + 0.75 * beat, 0.3 * beat, 0.06);
        playPluck(ch[1], s + 1 * beat, 0.4 * beat, 0.08);
        playPluck(ch[3], s + 1.75 * beat, 0.3 * beat, 0.06);
      }

      // ぱちんとシャボン玉が弾ける（1ループに2-3回ランダム位置）
      playBubble(start + 0.4);
      playBubble(start + 3.2);
      playBubble(start + 6.1);
    }

    var loopLen = 8 * beat;
    schedule(0);
    var loopTimer = setInterval(function () {
      if (!audioCtx || muted) { clearInterval(loopTimer); return; }
      schedule(0);
    }, loopLen * 1000);
    bgmNodes.push({ type: 'timer', id: loopTimer });
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

  function sfxPing() {
    var ctx = getCtx(); if (!ctx || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 1200;
    var t0 = ctx.currentTime;
    g.gain.setValueAtTime(0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
    o.connect(g); g.connect(ctx.destination);
    o.start(t0); o.stop(t0 + 0.3);
  }
  function sfxPop() {
    var ctx = getCtx(); if (!ctx || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(660, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.2);
  }

  // ============ 描画 ============
  function setSlot(slot, elEmoji, elImg) {
    var v = state[slot];
    if (isImgItem(v)) {
      elEmoji.textContent = '';
      elImg.setAttribute('src', v.img);
      elImg.style.display = 'block';
    } else {
      elEmoji.textContent = v || '';
      elImg.removeAttribute('src');
      elImg.style.display = 'none';
    }
  }

  function renderChar() {
    setSlot('hat', document.getElementById('acc-hat'), document.getElementById('acc-img-hat'));
    setSlot('outfit', document.getElementById('acc-outfit'), document.getElementById('acc-img-outfit'));
    setSlot('back', document.getElementById('acc-back'), document.getElementById('acc-img-back'));
    var cheek = document.getElementById('acc-cheek');
    cheek.textContent = state.cheek ? state.cheek + ' ' + state.cheek : '';
    var bg = document.getElementById('bg-layer');
    bg.className = 'bg-layer ' + state.bg;
  }

  function renderPalette() {
    var pal = document.getElementById('palette');
    pal.innerHTML = '';
    if (currentTab === 'bg') {
      BGS.forEach(function (bgCls) {
        var item = document.createElement('div');
        item.className = 'pal-item bg-preview ' + bgCls;
        if (state.bg === bgCls) item.classList.add('selected');
        item.style.fontSize = '0';
        item.addEventListener('click', function () {
          state.bg = bgCls;
          sfxPop();
          renderChar();
          renderPalette();
          spawnSparkle();
        });
        pal.appendChild(item);
      });
      return;
    }
    var list = ITEMS[currentTab] || [];
    list.forEach(function (v) {
      var item = document.createElement('div');
      item.className = 'pal-item' + (v === '' ? ' none' : '');
      if (v === '') {
        item.textContent = t('none');
      } else if (isImgItem(v)) {
        var im = document.createElement('img');
        im.src = v.img;
        im.alt = v.label || '';
        im.style.cssText = 'width:100%;height:100%;object-fit:contain;pointer-events:none;';
        item.appendChild(im);
        item.classList.add('has-img');
      } else {
        item.textContent = v;
      }
      if (itemKey(state[currentTab]) === itemKey(v)) item.classList.add('selected');
      item.addEventListener('click', function () {
        state[currentTab] = v;
        sfxPop();
        renderChar();
        renderPalette();
        if (v) spawnSparkle();
      });
      pal.appendChild(item);
    });
  }

  function spawnSparkle() {
    var box = document.getElementById('sparkles');
    for (var i = 0; i < 5; i++) {
      (function (i) {
        setTimeout(function () {
          var s = document.createElement('span');
          s.className = 'sparkle';
          s.textContent = ['✨','⭐','💫','♡'][i % 4];
          s.style.left = (40 + Math.random() * 220) + 'px';
          s.style.top = (80 + Math.random() * 120) + 'px';
          box.appendChild(s);
          setTimeout(function () { s.remove(); }, 1400);
        }, i * 60);
      })(i);
    }
    sfxPing();
  }

  // ============ タブ ============
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        sfxPop();
        renderPalette();
      });
    });
  }

  // ============ 操作 ============
  function reset() {
    state = { hat: '', outfit: '', cheek: '', back: '', bg: 'bg-sky' };
    renderChar(); renderPalette();
    toast(t('toastReset'));
    sfxPing();
  }

  function randomize() {
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    state.hat = pick(ITEMS.hat.filter(function (x) { return x; }));
    state.outfit = pick(ITEMS.outfit.filter(function (x) { return x; }));
    state.cheek = pick(ITEMS.cheek.filter(function (x) { return x; }));
    state.back = pick(ITEMS.back.filter(function (x) { return x; }));
    state.bg = pick(BGS);
    renderChar(); renderPalette();
    spawnSparkle();
    toast(t('toastRandom'));
  }

  function share() {
    var url = 'https://eri-murayama.github.io/surreal-games/shirotan-fan/games/shirotan-dressup/index.html';
    var text = t('shareText');
    var shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
    window.open(shareUrl, '_blank', 'noopener');
  }

  function toast(msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var div = document.createElement('div');
    div.className = 'toast';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(function () { div.remove(); }, 1600);
  }

  // ============ 初期化 ============
  function init() {
    applyI18n();
    setupTabs();
    renderChar();
    renderPalette();

    document.getElementById('reset-btn').addEventListener('click', reset);
    document.getElementById('random-btn').addEventListener('click', randomize);
    document.getElementById('share-btn').addEventListener('click', share);

    document.getElementById('lang-btn').addEventListener('click', function () {
      LANG = LANG === 'ja' ? 'en' : 'ja';
      localStorage.setItem('sg-lang', LANG);
      applyI18n();
      renderPalette();
    });

    var muteBtn = document.getElementById('mute-btn');
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.addEventListener('click', function () {
      muted = !muted;
      localStorage.setItem('sg-muted-shirotan', muted ? '1' : '0');
      muteBtn.textContent = muted ? '🔇' : '🔊';
      if (muted) stopBGM(); else startBGM();
    });

    // BGMはユーザー操作後に開始
    var startedBGM = false;
    function tryStart() {
      if (startedBGM) return;
      startedBGM = true;
      if (!muted) startBGM();
    }
    document.addEventListener('click', tryStart, { once: true });
    document.addEventListener('touchstart', tryStart, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
