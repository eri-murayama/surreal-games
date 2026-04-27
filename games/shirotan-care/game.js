(function () {
  'use strict';

  var LANG = localStorage.getItem('sg-lang') || 'ja';
  var I18N = {
    ja: {
      title: 'しろたん育成日記', subtitle: '～まったりおせわ～',
      statHunger: 'おなか', statClean: 'きれい', statHappy: 'きげん', statLove: 'なつき',
      labelDay: '日目', labelLevel: 'Lv',
      actFeed: 'ごはん', actPet: 'なでなで', actBath: 'おふろ', actPlay: 'あそぶ', actSleep: 'おやすみ',
      shareBtn: '𝕏でシェア', moreGames: '他のゲームも遊ぶ →', backToTop: '← トップに戻る',
      disclaimer: '※「しろたん」は株式会社クリエイティブヨーコのキャラクターです。本作は非公式のファン作品（非営利）です。',
      shareText: 'しろたんとまったりおせわライフ！#しろたん育成日記 #シュールゲームス',
      sp: {
        hungry: 'おなかすいたにゃ…',
        fed: 'おいちぃ〜！',
        dirty: 'すこしよごれちゃった…',
        clean: 'ぴかぴか〜！',
        pet: 'もっとなでて〜♪',
        play: 'たのしー！',
        sleep: 'すやぁ…zzz',
        loved: 'だいすき♡',
        morning: 'おはよう〜',
        levelUp: 'レベルアップ！'
      }
    },
    en: {
      title: 'Shirotan Care Diary', subtitle: '~Cozy Caretaking~',
      statHunger: 'Food', statClean: 'Clean', statHappy: 'Mood', statLove: 'Bond',
      labelDay: 'Day', labelLevel: 'Lv',
      actFeed: 'Feed', actPet: 'Pet', actBath: 'Bath', actPlay: 'Play', actSleep: 'Sleep',
      shareBtn: 'Share on 𝕏', moreGames: 'More games →', backToTop: '← Home',
      disclaimer: '※ "Shirotan" is a character of Creative Yoko Co., Ltd. This is an unofficial non-commercial fan work.',
      shareText: 'Cozy life with Shirotan! #ShirotanCare #SurrealGames',
      sp: {
        hungry: "I'm hungry...",
        fed: 'Yummy!',
        dirty: "I'm a bit dirty...",
        clean: 'Squeaky clean!',
        pet: 'Pet me more~',
        play: 'So much fun!',
        sleep: 'Zzz...',
        loved: 'I love you ♡',
        morning: 'Good morning!',
        levelUp: 'Level up!'
      }
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }
  function sp(k) { return (I18N[LANG].sp && I18N[LANG].sp[k]) || k; }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (I18N[LANG][k]) el.textContent = I18N[LANG][k];
    });
    document.title = t('title') + ' - シュールゲームス';
  }

  // ============ 状態 ============
  var SAVE_KEY = 'sg-shirotan-care-v1';
  var defaultState = {
    hunger: 80, clean: 80, happy: 80, love: 20,
    day: 1, level: 1, lovePoints: 0,
    lastTs: Date.now(),
    sleeping: false
  };
  var state = loadState();
  var feeding = false;
  var feedTimer = null;

  function loadState() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      var s = JSON.parse(raw);
      // 経過時間でステータス減衰
      var elapsed = (Date.now() - (s.lastTs || Date.now())) / 1000;
      var ticks = Math.min(Math.floor(elapsed / 30), 40);
      s.hunger = Math.max(0, s.hunger - ticks * 1.5);
      s.clean = Math.max(0, s.clean - ticks * 0.8);
      s.happy = Math.max(0, s.happy - ticks * 1.0);
      s.lastTs = Date.now();
      return Object.assign({}, defaultState, s);
    } catch (e) { return Object.assign({}, defaultState); }
  }
  function saveState() {
    state.lastTs = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ============ BGM: ほのぼのワルツ（F major、3/4拍子） ============
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
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.0);
    master.connect(ctx.destination);
    bgmNodes.push(master);

    // F major: F-G-A-Bb-C-D-E-F
    // やさしいワルツメロディ
    // 3拍子 ピアノ風＋弦っぽいパッド
    var bpm = 82;
    var beat = 60 / bpm;

    var melody = [
      { n: 349.23, d: 1.5 }, // F
      { n: 440.00, d: 0.5 }, // A
      { n: 523.25, d: 1.0 }, // C
      { n: 466.16, d: 1.0 }, // Bb
      { n: 440.00, d: 1.0 }, // A
      { n: 349.23, d: 1.5 }, // F
      { n: 392.00, d: 0.5 }, // G
      { n: 440.00, d: 1.0 }, // A
      { n: 392.00, d: 2.0 }, // G
      { n: 349.23, d: 1.0 }  // F
    ];

    var chordProg = [
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // Gm (approx)
      [233.08, 293.66, 349.23], // Bb
      [261.63, 329.63, 392.00]  // C
    ];

    function playMel(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.95);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur);
      bgmNodes.push(o, g);
    }

    function playChord(notes, start, dur, vol) {
      notes.forEach(function (f) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        var t0 = ctx.currentTime + start;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.3);
        g.gain.linearRampToValueAtTime(vol * 0.6, t0 + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.05);
        bgmNodes.push(o, g);
      });
    }

    function playBass(freq, start, dur, vol) {
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
    }

    function schedule(start) {
      // メロディ（ワルツ：3拍×4小節ぐらい）
      var cur = start;
      melody.forEach(function (n) {
        playMel(n.n, cur, n.d * beat, 0.1);
        cur += n.d * beat;
      });
      // コード（各小節ごと、3拍目で変える）
      for (var i = 0; i < 4; i++) {
        playChord(chordProg[i], start + i * 3 * beat, 3 * beat, 0.04);
        // オンピッチベース（1拍目）
        playBass(chordProg[i][0] / 2, start + i * 3 * beat, 0.6 * beat, 0.12);
        // ワルツ伴奏（2,3拍目はコード音）
        playBass(chordProg[i][1], start + i * 3 * beat + beat, 0.5 * beat, 0.05);
        playBass(chordProg[i][2], start + i * 3 * beat + 2 * beat, 0.5 * beat, 0.05);
      }
    }

    var loopLen = 12 * beat;
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

  // SFX
  function sfx(freqs, type, duration) {
    var ctx = getCtx(); if (!ctx || muted) return;
    type = type || 'sine';
    duration = duration || 0.15;
    freqs.forEach(function (f, i) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      var t0 = ctx.currentTime + i * 0.05;
      g.gain.setValueAtTime(0.18, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + duration + 0.05);
    });
  }
  function sfxFeed()  { sfx([523, 659, 784], 'sine', 0.2); }
  function sfxPet()   { sfx([880, 1047], 'sine', 0.3); }
  function sfxBath()  { sfx([440, 554, 659, 880], 'sine', 0.15); }
  function sfxPlay()  { sfx([659, 880, 784, 1047], 'triangle', 0.12); }
  function sfxSleep() { sfx([392, 330, 262], 'sine', 0.4); }
  function sfxLvup()  { sfx([523, 659, 784, 1047], 'triangle', 0.25); }

  // ============ 描画 ============
  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  function render() {
    state.hunger = clamp(state.hunger);
    state.clean = clamp(state.clean);
    state.happy = clamp(state.happy);
    state.love = clamp(state.love);

    document.getElementById('bar-hunger').style.width = state.hunger + '%';
    document.getElementById('bar-clean').style.width = state.clean + '%';
    document.getElementById('bar-happy').style.width = state.happy + '%';
    document.getElementById('bar-love').style.width = state.love + '%';

    document.getElementById('day').textContent = state.day;
    document.getElementById('level').textContent = state.level;
    document.getElementById('love-pts').textContent = state.lovePoints;

    var ch = document.getElementById('char');
    ch.classList.toggle('happy', state.love >= 70);
    ch.classList.toggle('dirty', state.clean < 30);
    ch.classList.toggle('sleeping', state.sleeping);

    var dl = document.getElementById('dirt-layer');
    dl.classList.toggle('show', state.clean < 40);

    // しろたん画像をなつき度で切替（ごはん中は専用画像）
    var img = document.getElementById('shirotan');
    if (feeding) img.src = 'assets/shirotan-feed.png';
    else if (state.love >= 80) img.src = 'assets/shirotan2.png'; // はーと
    else if (state.love >= 40) img.src = 'assets/shirotan1.png'; // 尊
    else img.src = 'assets/shirotan4.png'; // プレーン

    // ムードアイコン
    var mood = document.getElementById('mood');
    mood.classList.remove('show');
    var moodIcon = '';
    if (state.sleeping) moodIcon = '💤';
    else if (state.hunger < 30) moodIcon = '🍽️';
    else if (state.clean < 30) moodIcon = '💦';
    else if (state.happy < 30) moodIcon = '😢';
    else if (state.love >= 80) moodIcon = '💗';
    else if (state.happy >= 80) moodIcon = '😊';
    if (moodIcon) {
      mood.textContent = moodIcon;
      setTimeout(function () { mood.classList.add('show'); }, 10);
    }
  }

  function speak(key) {
    var el = document.getElementById('speech');
    el.textContent = sp(key);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function spawnFx(icons) {
    var box = document.getElementById('fx');
    icons.forEach(function (ic, i) {
      setTimeout(function () {
        var s = document.createElement('div');
        s.className = 'fx-item';
        s.textContent = ic;
        s.style.left = (30 + Math.random() * 320) + 'px';
        s.style.top = (80 + Math.random() * 100) + 'px';
        box.appendChild(s);
        setTimeout(function () { s.remove(); }, 1200);
      }, i * 80);
    });
  }

  // ============ アクション ============
  function addLove(n) {
    state.lovePoints += n;
    state.love = clamp(state.love + n);
    checkLevelUp();
  }
  function checkLevelUp() {
    var req = state.level * 50;
    if (state.lovePoints >= req) {
      state.level++;
      state.lovePoints -= req;
      showLvup();
      sfxLvup();
    }
  }
  function showLvup() {
    var ov = document.createElement('div');
    ov.className = 'lvup-overlay';
    var txt = document.createElement('div');
    txt.className = 'lvup-text';
    txt.textContent = 'Lv.' + state.level + ' ' + sp('levelUp');
    ov.appendChild(txt);
    document.getElementById('stage').appendChild(ov);
    setTimeout(function () { ov.remove(); }, 2000);
  }

  function doAction(action) {
    if (state.sleeping && action !== 'sleep') {
      speak('sleep');
      return;
    }
    switch (action) {
      case 'feed':
        feeding = true;
        clearTimeout(feedTimer);
        feedTimer = setTimeout(function () {
          feeding = false;
          render();
        }, 1800);
        if (state.hunger >= 95) { speak('fed'); render(); return; }
        state.hunger = clamp(state.hunger + 30);
        state.happy = clamp(state.happy + 5);
        addLove(3);
        sfxFeed();
        spawnFx(['🐟','✨','💕']);
        speak('fed');
        break;
      case 'pet':
        state.happy = clamp(state.happy + 15);
        addLove(4);
        sfxPet();
        spawnFx(['💗','✨','💕','♡']);
        speak(state.love >= 60 ? 'loved' : 'pet');
        break;
      case 'bath':
        if (state.clean >= 95) { speak('clean'); return; }
        state.clean = clamp(state.clean + 40);
        state.happy = clamp(state.happy + 3);
        addLove(2);
        sfxBath();
        spawnFx(['🛁','💦','✨','🫧']);
        speak('clean');
        break;
      case 'play':
        state.happy = clamp(state.happy + 20);
        state.hunger = clamp(state.hunger - 5);
        addLove(5);
        sfxPlay();
        spawnFx(['🎾','🎀','⭐','🌟']);
        speak('play');
        break;
      case 'sleep':
        if (!state.sleeping) {
          state.sleeping = true;
          sfxSleep();
          speak('sleep');
          var bg = document.getElementById('bg-layer');
          bg.classList.add('night');
          setTimeout(function () {
            state.sleeping = false;
            state.happy = clamp(state.happy + 25);
            state.hunger = clamp(state.hunger - 20);
            state.day++;
            addLove(2);
            bg.classList.remove('night');
            speak('morning');
            spawnFx(['☀️','✨','💕']);
            render();
            saveState();
          }, 3500);
        }
        break;
    }
    render();
    saveState();
  }

  // ============ 初期化 ============
  function init() {
    applyI18n();
    render();

    document.querySelectorAll('.act-btn[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        doAction(btn.getAttribute('data-action'));
      });
    });

    document.getElementById('share-btn').addEventListener('click', function () {
      var url = 'https://eri-murayama.github.io/surreal-games/games/shirotan-care/index.html';
      var text = t('shareText') + ' Lv.' + state.level + ' 💗' + state.lovePoints;
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
    });

    document.getElementById('lang-btn').addEventListener('click', function () {
      LANG = LANG === 'ja' ? 'en' : 'ja';
      localStorage.setItem('sg-lang', LANG);
      applyI18n();
    });

    var muteBtn = document.getElementById('mute-btn');
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.addEventListener('click', function () {
      muted = !muted;
      localStorage.setItem('sg-muted-shirotan', muted ? '1' : '0');
      muteBtn.textContent = muted ? '🔇' : '🔊';
      if (muted) stopBGM(); else startBGM();
    });

    // 定期減衰（30秒ごと）
    setInterval(function () {
      if (state.sleeping) return;
      state.hunger = clamp(state.hunger - 1.2);
      state.clean = clamp(state.clean - 0.8);
      state.happy = clamp(state.happy - 1.0);
      if (state.hunger < 20) speak('hungry');
      else if (state.clean < 20 && Math.random() < 0.3) speak('dirty');
      render();
      saveState();
    }, 30000);

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
