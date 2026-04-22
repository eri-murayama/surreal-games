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
  var BGS = ['bg-sky','bg-sunset','bg-night','bg-meadow','bg-ocean','bg-sakura'];

  // ============ 状態 ============
  var state = { hat: '', outfit: '', cheek: '', back: '', bg: 'bg-sky' };
  var currentTab = 'hat';

  // ============ BGM: ふわふわキラキラ系（C major ペンタトニック） ============
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
    // ふわふわオルゴール風: C-D-E-G-A ペンタトニック、優しめテンポ
    var master = ctx.createGain();
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.8);
    master.connect(ctx.destination);
    bgmNodes.push(master);

    var scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]; // C5-D-E-G-A-C6-D6
    var melody = [0, 2, 4, 2, 5, 4, 2, 0,  1, 3, 5, 3, 6, 5, 3, 1];
    var bpm = 92;
    var beat = 60 / bpm;

    function playNote(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.05);
      bgmNodes.push(o, g);

      // オクターブ上のキラキラ倍音
      var o2 = ctx.createOscillator();
      var g2 = ctx.createGain();
      o2.type = 'triangle';
      o2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(0, t0);
      g2.gain.linearRampToValueAtTime(vol * 0.3, t0 + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.8);
      o2.connect(g2); g2.connect(master);
      o2.start(t0); o2.stop(t0 + dur + 0.05);
      bgmNodes.push(o2, g2);
    }

    function playChord(notes, start, dur, vol) {
      notes.forEach(function (f) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        var t0 = ctx.currentTime + start;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.1);
        g.gain.linearRampToValueAtTime(vol * 0.5, t0 + dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.05);
        bgmNodes.push(o, g);
      });
    }

    var loopLen = melody.length * beat * 0.5;
    function schedule(loopStart) {
      // メロディ
      for (var i = 0; i < melody.length; i++) {
        playNote(scale[melody[i]], loopStart + i * beat * 0.5, beat * 0.45, 0.12);
      }
      // コード進行 C - Am - F - G
      var chords = [
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [196.00, 246.94, 293.66]  // G
      ];
      chords.forEach(function (ch, i) {
        playChord(ch, loopStart + i * beat * 2, beat * 2, 0.06);
      });
    }

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
    var url = 'https://eri-murayama.github.io/surreal-games/games/shirotan-dressup/index.html';
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
