// ========================================
// うんコーンキャッチャー
// PLiCy版（スタンドアロン・日本語のみ）
// ========================================

(function() {
  'use strict';

  // ===== BGMプリセット =====
  var BGM_PRESETS = {
    nohohon: {
      tempo: 80, key: 'C', wave: 'sine', volume: 0.09,
      melody: [523,0,659,0,587,523,0,494,523,0,659,784,0,659,0,523,440,0,523,0,494,440,0,392,440,0,523,587,0,523,0,440],
      bass: [262,0,262,0,294,0,294,0,262,0,262,0,330,0,262,0,220,0,220,0,247,0,247,0,220,0,220,0,262,0,220,0],
      swing: [1.2,0.8,1.2,0.8,1.3,1.0,0.8,0.9,1.2,0.8,1.0,1.3,0.8,1.0,0.8,1.2,1.2,0.8,1.2,0.8,1.3,1.0,0.8,0.9,1.2,0.8,1.0,1.3,0.8,1.0,0.8,1.2]
    },
    march: {
      tempo: 140, key: 'C', wave: 'triangle', volume: 0.10,
      melody: [523,523,659,784,784,659,523,784,880,880,784,659,523,659,784,1047,698,698,880,1047,1047,880,698,880,784,659,523,659,784,1047,880,784],
      bass: [131,196,131,196,131,196,131,196,175,262,175,262,131,196,131,262,175,262,175,262,196,294,196,294,131,196,131,196,196,262,196,131],
      farts: [0,0,0,1,0,0,2,0,0,0,1,0,0,2,0,3,0,0,0,1,0,0,2,0,1,0,0,2,0,1,0,3]
    }
  };

  // ===== サウンドシステム =====
  var SoundSystem = {
    ctx: null,
    enabled: true,
    volume: 0.5,
    bgmPlaying: false,
    bgmNodes: [],
    bgmTimers: [],
    currentBgmPreset: null,
    bgmSpeedMultiplier: 1.0,
    bgmGain: null,
    _duckTimer: null,

    init: function() {
      var self = this;
      var initAudio = function() {
        if (!self.ctx) {
          self.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (self.ctx.state !== 'running') {
          self.ctx.resume();
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('pointerdown', initAudio);
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
      document.addEventListener('pointerdown', initAudio);

      var saved = localStorage.getItem('sg_sound_enabled');
      if (saved !== null) this.enabled = saved === 'true';
    },

    toggle: function() {
      this.enabled = !this.enabled;
      localStorage.setItem('sg_sound_enabled', this.enabled);
      if (!this.enabled) {
        this.stopBgm();
      }
      return this.enabled;
    },

    _ensureCtx: function() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!this.bgmGain && this.ctx) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
      }
      if (this.ctx.state !== 'running') {
        this.ctx.resume();
      }
      return this.ctx;
    },

    _duckBgm: function(duration) {
      if (!this.bgmGain || !this.bgmPlaying) return;
      var now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(0.15, now);
      this.bgmGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      this.bgmGain.gain.linearRampToValueAtTime(1.0, now + duration);
    },

    playBgm: function(presetName) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      var preset = BGM_PRESETS[presetName];
      if (!preset) return;
      this.stopBgm();
      this.currentBgmPreset = presetName;
      this.bgmPlaying = true;
      var self = this;
      if (this.ctx.state !== 'running') {
        this.ctx.resume().then(function() {
          if (self.bgmPlaying) self._loopBgm(preset);
        });
      } else {
        this._loopBgm(preset);
      }
    },

    _loopBgm: function(preset) {
      if (!this.bgmPlaying || !this.enabled || !this.ctx) return;
      var ctx = this.ctx;
      var bgmDest = this.bgmGain || ctx.destination;
      var now = ctx.currentTime;
      var baseBeat = (60 / preset.tempo) / (this.bgmSpeedMultiplier || 1.0);
      var vol = preset.volume;
      var swing = preset.swing;
      var self = this;

      // ノートごとの開始時刻を計算（swing対応）
      var offsets = [];
      var t = 0;
      for (var i = 0; i < preset.melody.length; i++) {
        offsets.push(t);
        t += baseBeat * (swing ? swing[i] : 1);
      }
      var totalDur = t;

      // メロディ
      preset.melody.forEach(function(freq, i) {
        if (!freq) return;
        var noteDur = baseBeat * (swing ? swing[i] : 1);
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = preset.wave;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, now + offsets[i]);
        g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
        osc.connect(g);
        g.connect(bgmDest);
        osc.start(now + offsets[i]);
        osc.stop(now + offsets[i] + noteDur * 0.95);
        self.bgmNodes.push(osc);
      });

      // ベースライン
      preset.bass.forEach(function(freq, i) {
        if (!freq) return;
        var noteDur = baseBeat * (swing ? swing[i] : 1);
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol * 0.5, now + offsets[i]);
        g.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + noteDur * 0.9);
        osc.connect(g);
        g.connect(bgmDest);
        osc.start(now + offsets[i]);
        osc.stop(now + offsets[i] + noteDur * 0.95);
        self.bgmNodes.push(osc);
      });

      // おなら＆うんちパーカッション層（リアル版）
      if (preset.farts) {
        preset.farts.forEach(function(type, i) {
          if (!type) return;
          var st = now + offsets[i];
          if (type === 1) {
            // 短いリアルおなら「ブッ」— 唇振動+空気
            var dur = 0.18;
            var len = ctx.sampleRate * dur;
            var buf = ctx.createBuffer(1, len, ctx.sampleRate);
            var d = buf.getChannelData(0);
            var tight = 40 + Math.random() * 25;
            for (var j = 0; j < len; j++) {
              var tt = j / ctx.sampleRate;
              var env = Math.min(1, tt / 0.015) * Math.max(0, 1 - tt / dur);
              var lip = Math.tanh(Math.sin(tt * tight * Math.PI * 2) * 3) * 0.5;
              var air = (Math.random() * 2 - 1) * 0.2;
              d[j] = (lip + air) * env * (0.6 + 0.4 * Math.sin(tt * 10 * Math.PI * 2));
            }
            var src = ctx.createBufferSource();
            src.buffer = buf;
            var flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.value = 300;
            flt.Q.value = 2;
            var g = ctx.createGain();
            g.gain.value = vol * 4;
            src.connect(flt);
            flt.connect(g);
            g.connect(bgmDest);
            src.start(st);
            src.stop(st + dur);
            self.bgmNodes.push(src);
          } else if (type === 2) {
            // リアルうんち落下「ボトッ」— 水ポチャン+泡
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, st);
            osc.frequency.exponentialRampToValueAtTime(70, st + 0.08);
            g.gain.setValueAtTime(vol * 5, st);
            g.gain.exponentialRampToValueAtTime(0.001, st + 0.1);
            osc.connect(g);
            g.connect(bgmDest);
            osc.start(st);
            osc.stop(st + 0.1);
            self.bgmNodes.push(osc);
            // 泡（FM合成ブクッ）
            var bOsc = ctx.createOscillator();
            var bMod = ctx.createOscillator();
            var bModG = ctx.createGain();
            var bG = ctx.createGain();
            bMod.frequency.value = 22;
            bModG.gain.value = 60;
            bMod.connect(bModG);
            bModG.connect(bOsc.frequency);
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(120, st + 0.04);
            bOsc.frequency.exponentialRampToValueAtTime(50, st + 0.15);
            bG.gain.setValueAtTime(vol * 3, st + 0.04);
            bG.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
            bOsc.connect(bG);
            bG.connect(bgmDest);
            bMod.start(st + 0.04);
            bOsc.start(st + 0.04);
            bMod.stop(st + 0.18);
            bOsc.stop(st + 0.18);
            self.bgmNodes.push(bOsc);
            self.bgmNodes.push(bMod);
          } else if (type === 3) {
            // リアル長おなら「ブブブブー」— 音程変化+断続震え
            var dur = 0.4;
            var len = ctx.sampleRate * dur;
            var buf = ctx.createBuffer(1, len, ctx.sampleRate);
            var d = buf.getChannelData(0);
            var bp = 32 + Math.random() * 15;
            for (var j = 0; j < len; j++) {
              var tt = j / ctx.sampleRate;
              var pitch = bp + tt * 30 + Math.sin(tt * 4) * 6;
              var stut = 0.3 + 0.7 * Math.abs(Math.sin(tt * 10 * Math.PI * 2));
              var env = Math.min(1, tt / 0.03) * Math.max(0, 1 - Math.pow(tt / dur, 2)) * stut;
              var lip = Math.tanh(Math.sin(tt * pitch * Math.PI * 2) * 4) * 0.4;
              var sub = Math.sin(tt * pitch * 0.5 * Math.PI * 2) * 0.25;
              var air = (Math.random() * 2 - 1) * (0.1 + tt * 0.25);
              d[j] = (lip + sub + air) * env;
            }
            var src = ctx.createBufferSource();
            src.buffer = buf;
            var flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(250, st);
            flt.frequency.linearRampToValueAtTime(400, st + 0.25);
            flt.frequency.linearRampToValueAtTime(160, st + dur);
            flt.Q.value = 2.5;
            var g = ctx.createGain();
            g.gain.value = vol * 4.5;
            src.connect(flt);
            flt.connect(g);
            g.connect(bgmDest);
            src.start(st);
            src.stop(st + dur);
            self.bgmNodes.push(src);
          }
        });
      }

      // ループ
      var timer = setTimeout(function() {
        if (self.bgmPlaying) self._loopBgm(preset);
      }, totalDur * 1000);
      this.bgmTimers.push(timer);
    },

    stopBgm: function() {
      this.bgmPlaying = false;
      this.bgmSpeedMultiplier = 1.0;
      this.bgmNodes.forEach(function(n) { try { n.stop(); } catch(e) {} });
      this.bgmNodes = [];
      this.bgmTimers.forEach(function(t) { clearTimeout(t); });
      this.bgmTimers = [];
    },

    setBgmSpeed: function(multiplier) {
      this.bgmSpeedMultiplier = multiplier;
    },

    play: function(type) {
      if (!this.enabled) return;
      this._ensureCtx();
      if (!this.ctx) return;
      var self = this;
      if (this.ctx.state !== 'running') {
        this.ctx.resume().then(function() { self._playSound(type); });
        return;
      }
      this._playSound(type);
    },

    _playSound: function(type) {
      if (!this.ctx || this.ctx.state !== 'running') return;
      var ctx = this.ctx;
      var now = ctx.currentTime;
      var gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = this.volume;

      switch (type) {
        case 'plop': {
          // ボトッ！ — リアルうんち着弾音（水面ポチャン＋泡＋衝撃）
          // 1) 水滴インパクト（ポチャッ）
          var plOsc1 = ctx.createOscillator();
          var plG1 = ctx.createGain();
          plOsc1.type = 'sine';
          plOsc1.frequency.setValueAtTime(400, now);
          plOsc1.frequency.exponentialRampToValueAtTime(80, now + 0.08);
          plG1.gain.setValueAtTime(this.volume * 1.2, now);
          plG1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          plOsc1.connect(plG1);
          plG1.connect(ctx.destination);
          plOsc1.start(now);
          plOsc1.stop(now + 0.1);
          // 2) 泡立ち（ブクッ）— FM合成で気泡感
          var plOsc2 = ctx.createOscillator();
          var plMod = ctx.createOscillator();
          var plModG = ctx.createGain();
          var plG2 = ctx.createGain();
          plMod.frequency.value = 25;
          plModG.gain.value = 80;
          plMod.connect(plModG);
          plModG.connect(plOsc2.frequency);
          plOsc2.type = 'sine';
          plOsc2.frequency.setValueAtTime(150, now + 0.05);
          plOsc2.frequency.exponentialRampToValueAtTime(60, now + 0.2);
          plG2.gain.setValueAtTime(this.volume * 0.8, now + 0.05);
          plG2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          plOsc2.connect(plG2);
          plG2.connect(ctx.destination);
          plMod.start(now + 0.05);
          plOsc2.start(now + 0.05);
          plMod.stop(now + 0.25);
          plOsc2.stop(now + 0.25);
          // 3) 水しぶきノイズ
          var plBufLen = ctx.sampleRate * 0.06;
          var plBuf = ctx.createBuffer(1, plBufLen, ctx.sampleRate);
          var plD = plBuf.getChannelData(0);
          for (var pi = 0; pi < plBufLen; pi++) {
            var pt = pi / ctx.sampleRate;
            plD[pi] = (Math.random() * 2 - 1) * Math.max(0, 1 - pt / 0.06) * 0.8;
          }
          var plNoise = ctx.createBufferSource();
          plNoise.buffer = plBuf;
          var plFlt = ctx.createBiquadFilter();
          plFlt.type = 'bandpass';
          plFlt.frequency.value = 2000;
          plFlt.Q.value = 0.5;
          var plNG = ctx.createGain();
          plNG.gain.value = this.volume * 0.6;
          plNoise.connect(plFlt);
          plFlt.connect(plNG);
          plNG.connect(ctx.destination);
          plNoise.start(now);
          plNoise.stop(now + 0.06);
          break;
        }
        case 'fart': {
          // ブッ！ — リアルおなら（唇振動シミュレーション＋空気ノイズ＋共鳴）
          this._duckBgm(0.3);
          var fDur = 0.3;
          var fLen = ctx.sampleRate * fDur;
          var fBuf = ctx.createBuffer(1, fLen, ctx.sampleRate);
          var fd = fBuf.getChannelData(0);
          var tightness = 40 + Math.random() * 30;
          var flutter = 8 + Math.random() * 10;
          for (var fi = 0; fi < fLen; fi++) {
            var ft = fi / ctx.sampleRate;
            var attack = Math.min(1, ft / 0.02);
            var decay = Math.max(0, 1 - (ft - 0.05) / (fDur - 0.05));
            var fenv = attack * decay * (0.6 + 0.4 * Math.sin(ft * flutter * Math.PI * 2));
            var lip = Math.tanh(Math.sin(ft * tightness * Math.PI * 2) * 3) * 0.5;
            var air = (Math.random() * 2 - 1) * 0.25;
            var resonance = Math.sin(ft * (tightness * 0.5) * Math.PI * 2) * 0.3;
            var harmonic = Math.sin(ft * tightness * 3 * Math.PI * 2) * 0.1 * decay;
            fd[fi] = (lip + air + resonance + harmonic) * fenv;
          }
          var fSrc = ctx.createBufferSource();
          fSrc.buffer = fBuf;
          var fLp = ctx.createBiquadFilter();
          fLp.type = 'lowpass';
          fLp.frequency.setValueAtTime(350, now);
          fLp.frequency.linearRampToValueAtTime(200, now + fDur);
          fLp.Q.value = 2;
          var fBp = ctx.createBiquadFilter();
          fBp.type = 'bandpass';
          fBp.frequency.value = 120;
          fBp.Q.value = 1.5;
          var fG = ctx.createGain();
          fG.gain.value = this.volume * 2.0;
          fSrc.connect(fLp);
          fLp.connect(fG);
          var fSrc2 = ctx.createBufferSource();
          fSrc2.buffer = fBuf;
          var fG2 = ctx.createGain();
          fG2.gain.value = this.volume * 1.0;
          fSrc2.connect(fBp);
          fBp.connect(fG2);
          fG.connect(ctx.destination);
          fG2.connect(ctx.destination);
          fSrc.start(now);
          fSrc.stop(now + fDur);
          fSrc2.start(now);
          fSrc2.stop(now + fDur);
          break;
        }
        case 'fart_long': {
          // ブブブブブーーッ！ — リアル長おなら（音程変化＋途切れ＋加速）
          this._duckBgm(0.6);
          var flDur = 0.7;
          var flLen = ctx.sampleRate * flDur;
          var flBuf = ctx.createBuffer(1, flLen, ctx.sampleRate);
          var fld = flBuf.getChannelData(0);
          var basePitch = 35 + Math.random() * 20;
          for (var fli = 0; fli < flLen; fli++) {
            var flt2 = fli / ctx.sampleRate;
            var pitchCurve = basePitch + flt2 * 40 + Math.sin(flt2 * 5) * 8;
            var stutter = 0.3 + 0.7 * Math.abs(Math.sin(flt2 * 12 * Math.PI * 2));
            var flenv = Math.min(1, flt2 / 0.05) * Math.max(0, 1 - Math.pow((flt2 - 0.5) / 0.2, 4)) * stutter;
            var fllip = Math.tanh(Math.sin(flt2 * pitchCurve * Math.PI * 2) * 4) * 0.4;
            var flsub = Math.sin(flt2 * pitchCurve * 0.5 * Math.PI * 2) * 0.3;
            var flair = (Math.random() * 2 - 1) * (0.15 + flt2 * 0.3);
            var bubble = Math.sin(flt2 * 7 * Math.PI * 2) * Math.sin(flt2 * pitchCurve * 1.5 * Math.PI * 2) * 0.15;
            fld[fli] = (fllip + flsub + flair + bubble) * flenv;
          }
          var flSrc = ctx.createBufferSource();
          flSrc.buffer = flBuf;
          var flLp = ctx.createBiquadFilter();
          flLp.type = 'lowpass';
          flLp.frequency.setValueAtTime(300, now);
          flLp.frequency.linearRampToValueAtTime(500, now + 0.4);
          flLp.frequency.linearRampToValueAtTime(180, now + flDur);
          flLp.Q.value = 3;
          var flG = ctx.createGain();
          flG.gain.value = this.volume * 2.5;
          flSrc.connect(flLp);
          flLp.connect(flG);
          flG.connect(ctx.destination);
          flSrc.start(now);
          flSrc.stop(now + flDur);
          break;
        }
        case 'splat': {
          // ビチャッ！ — リアルうんち地面激突（ベチャ＋飛散＋残響）
          this._duckBgm(0.5);
          // 1) 衝突インパクト（ドベシャッ）
          var spLen = ctx.sampleRate * 0.4;
          var spBuf = ctx.createBuffer(1, spLen, ctx.sampleRate);
          var spD = spBuf.getChannelData(0);
          for (var si = 0; si < spLen; si++) {
            var st = si / ctx.sampleRate;
            var impact = Math.max(0, 1 - st / 0.03) * 0.8;
            var spread = Math.max(0, (st - 0.02) / 0.1) * Math.max(0, 1 - st / 0.4);
            var senv = impact + spread;
            var thud = Math.sin(st * 60 * Math.PI * 2) * Math.max(0, 1 - st / 0.1) * 0.5;
            var splatter = (Math.random() * 2 - 1) * (0.4 + 0.3 * Math.sin(st * 20));
            var sticky = Math.sin(st * 150 * Math.PI * 2 * (1 - st * 1.5)) * spread * 0.3;
            spD[si] = (thud + splatter + sticky) * senv;
          }
          var spSrc = ctx.createBufferSource();
          spSrc.buffer = spBuf;
          var spLp = ctx.createBiquadFilter();
          spLp.type = 'lowpass';
          spLp.frequency.setValueAtTime(3000, now);
          spLp.frequency.exponentialRampToValueAtTime(300, now + 0.3);
          var spG = ctx.createGain();
          spG.gain.value = this.volume * 2.0;
          spSrc.connect(spLp);
          spLp.connect(spG);
          spG.connect(ctx.destination);
          spSrc.start(now);
          spSrc.stop(now + 0.4);
          // 2) 低音の地鳴り
          var spOsc = ctx.createOscillator();
          var spOG = ctx.createGain();
          spOsc.type = 'sine';
          spOsc.frequency.setValueAtTime(80, now);
          spOsc.frequency.exponentialRampToValueAtTime(25, now + 0.3);
          spOG.gain.setValueAtTime(this.volume * 1.2, now);
          spOG.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          spOsc.connect(spOG);
          spOG.connect(ctx.destination);
          spOsc.start(now);
          spOsc.stop(now + 0.35);
          // 3) 飛散粒（ピチピチピチ）
          for (var k = 0; k < 4; k++) {
            var delay = 0.05 + Math.random() * 0.15;
            var dropOsc = ctx.createOscillator();
            var dropG = ctx.createGain();
            dropOsc.type = 'sine';
            dropOsc.frequency.setValueAtTime(300 + Math.random() * 500, now + delay);
            dropOsc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.06);
            dropG.gain.setValueAtTime(this.volume * 0.4, now + delay);
            dropG.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);
            dropOsc.connect(dropG);
            dropG.connect(ctx.destination);
            dropOsc.start(now + delay);
            dropOsc.stop(now + delay + 0.07);
          }
          break;
        }
      }
    }
  };

  // ===== ハイスコア =====
  var HighScore = {
    _key: 'sg_highscore_unko-cone',
    get: function() {
      try {
        var data = JSON.parse(localStorage.getItem(this._key));
        return data ? data.score : null;
      } catch(e) { return null; }
    },
    set: function(score) {
      var prev = this.get();
      if (!prev || score > prev) {
        localStorage.setItem(this._key, JSON.stringify({
          score: score, date: new Date().toISOString()
        }));
        return true;
      }
      return false;
    }
  };

  // ===== 音量ボタン作成 =====
  var soundBtn = document.createElement('button');
  soundBtn.id = 'sound-toggle-btn';
  soundBtn.textContent = SoundSystem.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
  soundBtn.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);background:rgba(0,0,0,0.6);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1;';
  soundBtn.addEventListener('click', function() {
    var on = SoundSystem.toggle();
    soundBtn.textContent = on ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    if (on && SoundSystem.currentBgmPreset) {
      SoundSystem.playBgm(SoundSystem.currentBgmPreset);
    }
  });
  document.body.appendChild(soundBtn);

  // ===== サウンド初期化 =====
  SoundSystem.init();

  // ===== テキスト =====
  var STORY_LINES = [
    'やあ、僕はうん…\nチョコ味のソフトクリーム！',
    'お腹を空かせた貧しい君たちに\n食べてもらいたい…。\nそんな気持ちでたっくさんの\nソフトクリームを作ったよ！',
    '今から踏ん張って\nねじり出していくから\n残さずキャッチしてね！'
  ];
  var HERO_CATCH = [
    'いいね～', '過去にやってた？', 'エクスタシー！',
    'もっとくれよ！', 'ハイになっちまうぜえ？', 'きたきたきたあ！',
    'ふうううう！', 'いい匂い！', 'この形！この艶！',
    'これだからたまんねえよ！'
  ];
  var HERO_MILESTONE = [
    '５段！ひよっこうんコーン技師！',
    '１０段！うんコーンバイトリーダー！',
    '１５段！よっ、うんコーン部長！',
    '２０段！イケメンうんコーン実業家！',
    '２５段！うんコーンタワー建設！',
    '３０段！神のうんコーン生誕！',
    '３５段！宇宙を超えたうんコーン！'
  ];
  var HERO_COMMENTS = {
    terrible: 'え…{stack}段？そっか…そうだよね、君みたいな人間にこんな難しいことできるわけないか…。僕こそごめんね…謝るよ。',
    bad: '{stack}段か。うんうんうん大丈夫大丈夫！生まれながらにして劣っている人っているもんね。気にしないで。もう休んでいいよ！',
    ok: '{stack}段！わあ、君なりに頑張ってくれたんだね。形はきっったないけど。でも嬉しいよ。ありがとうね。',
    good: '{stack}段！？！？！？きみ、きみきみ、す、すす、すごいよ！わああ、拝みたい！君に入信したい！！',
    amazing: '{stack}段！？！？！？きみ、きみきみ、す、すす、すごいよ！わああ、拝みたい！君に入信したい！！',
    godlike: '{stack}段…。そうだね、君にだけ教えよう…。僕はうんちなんだ…。共にうんちになろう。'
  };
  var RANKS = {
    r35: '\uD83C\uDF0C 宇宙を超えたうんコーン \uD83C\uDF0C',
    r30: '\uD83D\uDC51 神のうんコーン生誕 \uD83D\uDC51',
    r25: '\uD83C\uDFD7\uFE0F うんコーンタワー建設 \uD83C\uDFD7\uFE0F',
    r20: '\uD83D\uDCBC イケメンうんコーン実業家 \uD83D\uDCBC',
    r15: '\uD83C\uDFA9 よっ、うんコーン部長 \uD83C\uDFA9',
    r10: '\uD83C\uDF66 うんコーンバイトリーダー \uD83C\uDF66',
    r5: '\uD83D\uDC23 ひよっこうんコーン技師 \uD83D\uDC23',
    r0: '\uD83D\uDE22 うんコーン以下の存在 \uD83D\uDE22'
  };

  // ===== DOM =====
  var $ = function(id) { return document.getElementById(id); };
  var titleScreen  = $('title-screen');
  var storyScreen  = $('story-screen');
  var gameScreen   = $('game-screen');
  var resultScreen = $('result-screen');
  var canvas = $('game-canvas');
  var ctx = canvas.getContext('2d');
  var comboText = $('combo-text');
  var nishidaComment = $('nishida-comment');

  // ===== 定数 =====
  var GAME_W = 360;
  var GAME_H = 600;
  var CONE_W = 50;
  var CONE_H = 60;
  var POOP_SIZE = 32;
  var PLAYER_SPEED = 6;
  var INITIAL_FALL_SPEED = 2.5;
  var SPEED_INCREMENT = 0.15;
  var SPAWN_INTERVAL_INITIAL = 1800;
  var SPAWN_INTERVAL_MIN = 600;
  var SPAWN_INTERVAL_DECREASE = 40;

  // ===== キャラ画像 =====
  var heroImg = new Image();
  heroImg.src = 'character.png';

  // ===== ストーリー =====
  var storyStep = 0;

  // トイレの流れる音（Web Audio APIで生成）
  function playFlushSE() {
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var duration = 1.8;
      var sampleRate = ac.sampleRate;
      var len = sampleRate * duration;
      var buf = ac.createBuffer(1, len, sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        var t = i / sampleRate;
        var env = Math.max(0, 1 - t / duration) * (0.5 + 0.5 * Math.sin(t * 3));
        var noise = (Math.random() * 2 - 1);
        var rumble = Math.sin(t * 80 * Math.PI * 2) * 0.3;
        var swoosh = Math.sin(t * 200 * Math.PI * 2 * (1 - t / duration)) * 0.2;
        data[i] = (noise * 0.4 + rumble + swoosh) * env * 0.3;
      }
      var src = ac.createBufferSource();
      src.buffer = buf;
      src.connect(ac.destination);
      src.start();
      src.onended = function() { ac.close(); };
    } catch (e) {
      // 音が出なくてもゲームは続行
    }
  }

  function showStoryScreen() {
    storyStep = 0;
    showScreen(storyScreen);
    showStoryLine();
    SoundSystem.playBgm('nohohon');
  }

  function showStoryLine() {
    var bubble = $('story-bubble');
    var text = $('story-text');
    var hint = $('story-tap-hint');

    if (storyStep < STORY_LINES.length) {
      bubble.classList.remove('visible');
      setTimeout(function() {
        text.textContent = STORY_LINES[storyStep];
        bubble.classList.add('visible');
      }, 200);
      hint.textContent = storyStep < STORY_LINES.length - 1 ? 'タップして次へ' : 'タップしてゲーム開始！';
    }
  }

  function advanceStory() {
    storyStep++;
    if (storyStep < STORY_LINES.length) {
      showStoryLine();
    } else {
      SoundSystem.stopBgm();
      playFlushSE();
      setTimeout(function() { startGame(); }, 800);
    }
  }

  storyScreen.addEventListener('click', advanceStory);

  // ===== ゲーム状態 =====
  var playerX, playerY;
  var poops = [];
  var stack = [];
  var score, stackCount, combo, maxStack;
  var fallSpeed, spawnInterval, spawnTimer;
  var gameOver, animationId, lastTime;
  var keysDown = {};

  // ===== スケーリング =====
  var scale = 1;

  function resizeCanvas() {
    var maxW = Math.min(window.innerWidth - 8, GAME_W);
    var maxH = Math.min(window.innerHeight - 80, GAME_H);
    scale = Math.min(maxW / GAME_W, maxH / GAME_H);
    canvas.width = GAME_W * scale;
    canvas.height = GAME_H * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  // ===== 描画ヘルパー =====
  function drawCone(x, y) {
    ctx.fillStyle = '#d4a050';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - CONE_W / 2, y - CONE_H);
    ctx.lineTo(x + CONE_W / 2, y - CONE_H);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#b8863c';
    ctx.lineWidth = 1;
    var steps = 4;
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var lx = x + (-CONE_W / 2) * (1 - t);
      var rx = x + (CONE_W / 2) * (1 - t);
      var ly = y + (-CONE_H) * (1 - t);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ly);
      ctx.stroke();
    }
  }

  function drawHero(x, y) {
    if (!heroImg.complete) return;
    var coneTopY = y - CONE_H;
    var stackH = stack.length * 14;
    var imgW = 48;
    var imgH = 48;
    var drawX = x - imgW / 2;
    var drawY = coneTopY - stackH - imgH - 4;
    ctx.drawImage(heroImg, drawX, drawY, imgW, imgH);
  }

  function drawPoop(x, y, size) {
    var s = size || POOP_SIZE;
    var cx = x;
    var cy = y;

    ctx.fillStyle = '#8B4513';

    // Bottom layer
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.15, s * 0.45, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Middle layer
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.05, s * 0.35, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top layer
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.22, s * 0.22, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tip
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.08, cy - s * 0.32);
    ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.5, cx + s * 0.05, cy - s * 0.42);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.1, cy - s * 0.15, s * 0.06, s * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStackedPoops(baseX, baseY) {
    for (var i = 0; i < stack.length; i++) {
      var p = stack[i];
      var px = baseX + p.offsetX;
      var py = baseY - CONE_H - i * 14 - 8;
      drawPoop(px, py, p.size);
    }
  }

  // ===== スポーン =====
  function spawnPoop() {
    var x = POOP_SIZE / 2 + Math.random() * (GAME_W - POOP_SIZE);
    var wobbleSpeed = 0.5 + Math.random() * 1.5;
    var wobbleAmp = 10 + Math.random() * 20;
    poops.push({
      x: x,
      y: -POOP_SIZE,
      speed: fallSpeed + (Math.random() - 0.5) * 0.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: wobbleSpeed,
      wobbleAmp: wobbleAmp,
      baseX: x
    });
  }

  // ===== 当たり判定 =====
  function checkCatch(poop) {
    var coneTopY = playerY - CONE_H;
    var stackTopY = coneTopY - stack.length * 14 - 10;
    var catchZoneTop = stackTopY - 10;
    var catchZoneBottom = stackTopY + 20;

    if (poop.y >= catchZoneTop && poop.y <= catchZoneBottom) {
      var dx = Math.abs(poop.x - playerX);
      var catchWidth = CONE_W / 2 + 8 + Math.min(stack.length * 1.5, 15);
      if (dx < catchWidth) {
        return true;
      }
    }
    return false;
  }

  // ===== HUD更新 =====
  function updateHUD() {
    $('score').textContent = score;
    $('stack-count').textContent = stackCount;
  }

  function showCombo(text) {
    comboText.textContent = text;
    comboText.classList.remove('active');
    void comboText.offsetWidth;
    comboText.classList.add('active');
    setTimeout(function() { comboText.classList.remove('active'); }, 1000);
  }

  var nishidaTimer = null;
  function showNishidaComment(text) {
    if (nishidaTimer) clearTimeout(nishidaTimer);
    nishidaComment.textContent = text;
    nishidaComment.classList.remove('active');
    void nishidaComment.offsetWidth;
    nishidaComment.classList.add('active');
    nishidaTimer = setTimeout(function() { nishidaComment.classList.remove('active'); }, 1500);
  }

  // ===== ゲームループ =====
  function gameLoop(time) {
    if (gameOver) return;
    if (!lastTime) lastTime = time;
    var dt = Math.min(time - lastTime, 50);
    lastTime = time;

    try {
      update(dt);
      if (!gameOver) render();
    } catch (e) {
      console.error('Game loop error:', e);
    }

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function update(dt) {
    // プレイヤー移動
    if (keysDown['ArrowLeft'] || keysDown['a']) {
      playerX = Math.max(CONE_W / 2, playerX - PLAYER_SPEED);
    }
    if (keysDown['ArrowRight'] || keysDown['d']) {
      playerX = Math.min(GAME_W - CONE_W / 2, playerX + PLAYER_SPEED);
    }

    // スポーンタイマー
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnPoop();
      spawnTimer = spawnInterval;
    }

    // うんこ更新
    for (var i = poops.length - 1; i >= 0; i--) {
      var p = poops[i];
      p.y += p.speed;
      p.wobblePhase += p.wobbleSpeed * (dt / 100);
      p.x = p.baseX + Math.sin(p.wobblePhase) * p.wobbleAmp;

      p.x = Math.max(POOP_SIZE / 2, Math.min(GAME_W - POOP_SIZE / 2, p.x));

      if (checkCatch(p)) {
        catchPoop(p);
        poops.splice(i, 1);
        continue;
      }

      if (p.y > GAME_H + POOP_SIZE) {
        SoundSystem.play('splat');
        endGame();
        return;
      }
    }
  }

  function catchPoop() {
    combo++;
    var wobble = (Math.random() - 0.5) * 6;
    var size = POOP_SIZE * (0.85 + Math.random() * 0.3);
    stack.push({ offsetX: wobble, size: size });
    stackCount++;

    var pts = 10 + stackCount * 5 + combo * 3;
    score += pts;

    // SE
    if (combo >= 3) {
      SoundSystem.play('fart_long');
    } else {
      SoundSystem.play('plop');
      if (Math.random() < 0.4) {
        setTimeout(function() { SoundSystem.play('fart'); }, 80);
      }
    }

    // コンボ5ごとにBGMテンポアップ
    if (combo > 0 && combo % 5 === 0) {
      var newSpeed = Math.min(1.0 + combo * 0.05, 1.8);
      SoundSystem.setBgmSpeed(newSpeed);
    }

    // 難易度上昇
    fallSpeed += SPEED_INCREMENT * 0.3;
    spawnInterval = Math.max(SPAWN_INTERVAL_MIN, spawnInterval - SPAWN_INTERVAL_DECREASE * 0.5);

    // リアクション
    if (stackCount % 5 === 0) {
      var idx = Math.min(Math.floor(stackCount / 5) - 1, HERO_MILESTONE.length - 1);
      showCombo(HERO_MILESTONE[idx]);
    } else {
      var msg = HERO_CATCH[Math.floor(Math.random() * HERO_CATCH.length)];
      showNishidaComment(msg);
    }

    updateHUD();
  }

  function render() {
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = '#3a2010';
    ctx.fillRect(0, GAME_H - 10, GAME_W, 10);

    for (var i = 0; i < poops.length; i++) {
      drawPoop(poops[i].x, poops[i].y, POOP_SIZE);
    }

    drawCone(playerX, playerY);
    drawStackedPoops(playerX, playerY);
    drawHero(playerX, playerY);
  }

  // ===== ゲームライフサイクル =====
  function startGame() {
    playerX = GAME_W / 2;
    playerY = GAME_H - 30;
    poops = [];
    stack = [];
    score = 0;
    stackCount = 0;
    combo = 0;
    maxStack = 0;
    fallSpeed = INITIAL_FALL_SPEED;
    spawnInterval = SPAWN_INTERVAL_INITIAL;
    spawnTimer = 500;
    gameOver = false;
    lastTime = 0;

    // マーチBGM開始
    SoundSystem.playBgm('march');

    resizeCanvas();
    updateHUD();
    showScreen(gameScreen);

    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameOver = true;
    if (animationId) cancelAnimationFrame(animationId);

    maxStack = stackCount;

    // ハイスコア保存
    HighScore.set(score);

    // BGM停止
    SoundSystem.stopBgm();

    $('final-score').textContent = score;
    $('final-stack').textContent = maxStack;

    // ランク
    var rankKey;
    if (maxStack >= 35) rankKey = 'r35';
    else if (maxStack >= 30) rankKey = 'r30';
    else if (maxStack >= 25) rankKey = 'r25';
    else if (maxStack >= 20) rankKey = 'r20';
    else if (maxStack >= 15) rankKey = 'r15';
    else if (maxStack >= 10) rankKey = 'r10';
    else if (maxStack >= 5) rankKey = 'r5';
    else rankKey = 'r0';
    var rank = RANKS[rankKey];
    $('result-rank').textContent = rank;

    // 主人公のコメント
    var tier;
    if (maxStack >= 35) tier = 'godlike';
    else if (maxStack >= 25) tier = 'amazing';
    else if (maxStack >= 15) tier = 'good';
    else if (maxStack >= 10) tier = 'ok';
    else if (maxStack >= 5) tier = 'bad';
    else tier = 'terrible';

    var comment = HERO_COMMENTS[tier];
    comment = comment.replace(/\{score\}/g, score).replace(/\{stack\}/g, maxStack);
    $('character-text').textContent = comment;

    showHighScore();
    setTimeout(function() { showScreen(resultScreen); }, 400);
  }

  function showScreen(screen) {
    [titleScreen, storyScreen, gameScreen, resultScreen].forEach(function(s) {
      s.classList.remove('active');
    });
    screen.classList.add('active');
  }

  // ===== 操作 =====
  document.addEventListener('keydown', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
    keysDown[e.key] = true;
  });

  document.addEventListener('keyup', function(e) {
    keysDown[e.key] = false;
  });

  // タッチ操作
  var touchActive = false;
  var touchX = 0;

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    touchActive = true;
    touchX = e.touches[0].clientX;
    updateTouchDirection();
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!touchActive) return;
    touchX = e.touches[0].clientX;
    updateTouchDirection();
  }, { passive: false });

  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    touchActive = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  }, { passive: false });

  canvas.addEventListener('touchcancel', function() {
    touchActive = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  });

  function updateTouchDirection() {
    var rect = canvas.getBoundingClientRect();
    var canvasMidX = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = touchX < canvasMidX - 20;
    keysDown['ArrowRight'] = touchX > canvasMidX + 20;
  }

  // マウス操作
  var mouseDown = false;

  canvas.addEventListener('mousedown', function(e) {
    mouseDown = true;
    updateMouseDirection(e);
  });

  canvas.addEventListener('mousemove', function(e) {
    if (!mouseDown) return;
    updateMouseDirection(e);
  });

  canvas.addEventListener('mouseup', function() {
    mouseDown = false;
    keysDown['ArrowLeft'] = false;
    keysDown['ArrowRight'] = false;
  });

  canvas.addEventListener('mouseleave', function() {
    if (mouseDown) {
      mouseDown = false;
      keysDown['ArrowLeft'] = false;
      keysDown['ArrowRight'] = false;
    }
  });

  function updateMouseDirection(e) {
    var rect = canvas.getBoundingClientRect();
    var canvasMidX = rect.left + rect.width / 2;
    keysDown['ArrowLeft'] = e.clientX < canvasMidX - 20;
    keysDown['ArrowRight'] = e.clientX > canvasMidX + 20;
  }

  // ===== ボタンイベント =====
  $('start-btn').addEventListener('click', showStoryScreen);
  $('retry-btn').addEventListener('click', startGame);
  $('title-btn').addEventListener('click', function() {
    showScreen(titleScreen);
    showHighScore();
  });

  // ===== リサイズ =====
  window.addEventListener('resize', function() {
    if (gameScreen.classList.contains('active')) {
      resizeCanvas();
      render();
    }
  });

  // ゲーム中スクロール防止
  document.addEventListener('touchmove', function(e) {
    if (gameScreen.classList.contains('active')) {
      e.preventDefault();
    }
  }, { passive: false });

  // ===== ハイスコア表示 =====
  function showHighScore() {
    var best = HighScore.get();
    var el = $('highscore-display');
    if (el) {
      el.textContent = best ? 'ハイスコア: ' + best + '点' : '';
    }
  }
  showHighScore();

})();
