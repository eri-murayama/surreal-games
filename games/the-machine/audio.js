/* ===== THE MACHINE / Audio Engine =====
 * Web Audio APIで全BGM/SEを生成。ファイル無し。
 * 全BGMは120BPMで統一(第3幕の伏線)。
 */
(function () {
  'use strict';

  const BPM = 120;
  const SPB = 60 / BPM;       // 1拍 = 0.5s
  const SCHED_AHEAD = 0.15;   // 先読みスケジュール

  let ctx = null;
  let masterGain = null;
  let currentBgm = null;      // {stop: fn}
  let muted = false;

  function ensureCtx() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  // ノート名 → 周波数
  const NOTES = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77,
    C6:1046.50,
    REST: 0
  };

  // ===== 単音生成 =====
  function playTone(freq, startTime, duration, type, gain, opts) {
    if (!freq) return;
    opts = opts || {};
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    if (opts.detune) osc.detune.value = opts.detune;

    // ADSR
    const a = opts.attack || 0.005;
    const d = opts.decay || 0.05;
    const s = opts.sustain != null ? opts.sustain : 0.6;
    const r = opts.release || 0.05;
    const peak = gain || 0.2;

    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(peak, startTime + a);
    g.gain.linearRampToValueAtTime(peak * s, startTime + a + d);
    g.gain.setValueAtTime(peak * s, startTime + Math.max(a + d, duration - r));
    g.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // ノイズ系(ドラム用)
  function playNoise(startTime, duration, freq, gain) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = freq || 1000;
    const g = ctx.createGain();
    g.gain.value = gain || 0.15;
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start(startTime);
  }

  // キックドラム
  function playKick(startTime, gain) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(120, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.12);
    g.gain.setValueAtTime(gain || 0.5, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.16);
  }

  // ===== シーケンサー本体 =====
  function startSequencer(stepFn, stepDuration) {
    let nextStepTime = ctx.currentTime + 0.05;
    let step = 0;
    let stopped = false;
    function tick() {
      if (stopped) return;
      while (nextStepTime < ctx.currentTime + SCHED_AHEAD) {
        stepFn(step, nextStepTime);
        step++;
        nextStepTime += stepDuration;
      }
      setTimeout(tick, 25);
    }
    tick();
    return { stop: () => { stopped = true; } };
  }

  // ===== BGM A: 第1幕 メカバトル(壮大8bit) =====
  function bgmAct1() {
    // 16分音符 step. SPB/4 = 0.125s
    const stepDur = SPB / 4;
    // ベース(8分): C3 - C3 - G2 - G2 ループ
    const bass = ['C3','C3','C3','C3', 'G3','G3','G3','G3', 'F3','F3','F3','F3', 'A3','A3','A3','A3'];
    // リード(16分): 速い分散和音
    const lead = [
      'C5','E5','G5','C6', 'C5','E5','G5','C6',
      'D5','F5','A5','D5', 'D5','F5','A5','D5',
      'C5','F5','A5','C6', 'C5','F5','A5','C6',
      'B4','D5','G5','B5', 'B4','D5','G5','B5',
    ];
    return startSequencer((step, time) => {
      const i = step % 32;
      // ドラム(4つ打ち)
      if (i % 4 === 0) playKick(time, 0.6);
      if (i % 8 === 4) playNoise(time, 0.05, 4000, 0.15); // スネア
      if (i % 2 === 0) playNoise(time, 0.02, 8000, 0.05); // ハイハット
      // ベース
      playTone(NOTES[bass[i % 16]] / 2, time, stepDur * 1.8, 'sawtooth', 0.18,
        {attack:0.002, decay:0.02, sustain:0.7, release:0.05});
      // リード
      playTone(NOTES[lead[i % 32]], time, stepDur * 0.9, 'square', 0.13,
        {attack:0.002, decay:0.03, sustain:0.5, release:0.04});
      // パッド(4拍に1回、ミ)
      if (i % 16 === 0) {
        playTone(NOTES.E4, time, stepDur * 14, 'triangle', 0.05,
          {attack:0.05, decay:0.1, sustain:0.6, release:0.4});
      }
    }, stepDur);
  }

  // ===== BGM B: 第2幕前半 ほのぼの(マリンバ風sine) =====
  function bgmAct2a() {
    const stepDur = SPB / 2; // 8分
    // のんびりメロディ(C major、揺らぎあり)
    const melody = [
      'C5','E5','G5','E5', 'F5','D5','C5','REST',
      'G4','C5','E5','C5', 'D5','F5','E5','REST',
      'C5','E5','G5','A5', 'G5','E5','C5','REST',
      'A4','C5','E5','C5', 'G4','C5','D5','REST',
    ];
    const bass = ['C3','REST','G3','REST', 'F3','REST','G3','REST'];
    return startSequencer((step, time) => {
      const i = step % 32;
      // 揺らぎ(humanize): わずかに時間ずらす
      const jitter = (Math.random() - 0.5) * 0.015;
      const t = time + jitter;
      // メロディ(三角波でマリンバっぽく)
      playTone(NOTES[melody[i]], t, stepDur * 1.8, 'triangle', 0.18,
        {attack:0.005, decay:0.15, sustain:0.3, release:0.2});
      // ベース(8拍ごと)
      if (i % 4 === 0) {
        playTone(NOTES[bass[(i / 4) % 8]] / 2, time, stepDur * 3, 'sine', 0.15,
          {attack:0.02, decay:0.1, sustain:0.5, release:0.3});
      }
      // たまに鳥っぽい高音
      if (i === 7 || i === 23) {
        playTone(NOTES.C6, time + 0.02, 0.08, 'sine', 0.08);
        playTone(NOTES.E5, time + 0.1, 0.08, 'sine', 0.06);
      }
    }, stepDur);
  }

  // ===== BGM C: 第2幕後半 機械化したほのぼの =====
  // 同じメロディだが、揺らぎゼロ・三角波→矩形波・装飾音消失・テンポ完全固定
  function bgmAct2b() {
    const stepDur = SPB / 2;
    const melody = [
      'C5','E5','G5','E5', 'F5','D5','C5','REST',
      'G4','C5','E5','C5', 'D5','F5','E5','REST',
      'C5','E5','G5','A5', 'G5','E5','C5','REST',
      'A4','C5','E5','C5', 'G4','C5','D5','REST',
    ];
    const bass = ['C3','REST','G3','REST', 'F3','REST','G3','REST'];
    return startSequencer((step, time) => {
      const i = step % 32;
      // jitter なし、release 短く、矩形波で硬質に
      playTone(NOTES[melody[i]], time, stepDur * 0.95, 'square', 0.13,
        {attack:0.001, decay:0.01, sustain:0.9, release:0.005});
      if (i % 4 === 0) {
        playTone(NOTES[bass[(i / 4) % 8]] / 2, time, stepDur * 0.95, 'square', 0.1,
          {attack:0.001, decay:0.01, sustain:0.9, release:0.005});
      }
      // 機械的なクリック音(全16分)
      if (i % 2 === 0) playNoise(time, 0.005, 6000, 0.04);
    }, stepDur);
  }

  // ===== BGM D: 第3幕 鏡(心拍→メトロノーム→歯車) =====
  function bgmAct3() {
    const stepDur = SPB; // 4分音符 = 心拍と同じくらい
    let phase = 0; // 0:心拍 / 1:メトロノーム / 2:歯車
    return startSequencer((step, time) => {
      // 8拍ごとにフェーズ進行
      if (step === 12) phase = 1;
      if (step === 24) phase = 2;

      if (phase === 0) {
        // 心拍 (lub-dub)
        playKick(time, 0.5);
        playKick(time + 0.13, 0.35);
      } else if (phase === 1) {
        // メトロノーム
        playTone(2000, time, 0.03, 'square', 0.2, {attack:0.001, decay:0.005, sustain:0.5, release:0.01});
        if (step % 4 === 0) {
          playTone(2400, time, 0.04, 'square', 0.25, {attack:0.001, decay:0.005, sustain:0.5, release:0.01});
        }
      } else {
        // 歯車(金属きしみ + 低音)
        playNoise(time, 0.4, 800, 0.08);
        playTone(60 + (step % 3) * 10, time, 0.3, 'sawtooth', 0.12,
          {attack:0.05, decay:0.1, sustain:0.4, release:0.1});
        if (step % 2 === 0) {
          playTone(180, time + 0.05, 0.06, 'square', 0.08); // カチッ
        }
      }
    }, stepDur);
  }

  // ===== SE =====
  function sfxOk() {
    ensureCtx();
    const t = ctx.currentTime;
    playTone(NOTES.E5, t, 0.08, 'square', 0.2);
    playTone(NOTES.A5, t + 0.06, 0.12, 'square', 0.2);
  }
  function sfxNg() {
    ensureCtx();
    const t = ctx.currentTime;
    playTone(NOTES.D4, t, 0.15, 'sawtooth', 0.18);
    playTone(NOTES.C4, t + 0.1, 0.2, 'sawtooth', 0.18);
  }
  function sfxClick() {
    ensureCtx();
    playNoise(ctx.currentTime, 0.02, 4000, 0.15);
  }
  function sfxBoot() {
    ensureCtx();
    const t = ctx.currentTime;
    playTone(200, t, 0.08, 'square', 0.15);
    playTone(400, t + 0.08, 0.08, 'square', 0.15);
    playTone(800, t + 0.16, 0.12, 'square', 0.15);
  }

  // ===== コントローラ =====
  function play(name) {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    stop();
    if (muted) return;
    if (name === 'act1')  currentBgm = bgmAct1();
    if (name === 'act2a') currentBgm = bgmAct2a();
    if (name === 'act2b') currentBgm = bgmAct2b();
    if (name === 'act3')  currentBgm = bgmAct3();
  }
  function stop() {
    if (currentBgm) { currentBgm.stop(); currentBgm = null; }
  }
  function setMute(m) {
    muted = m;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.4;
  }

  window.GameAudio = {
    play, stop, setMute,
    sfxOk, sfxNg, sfxClick, sfxBoot
  };
})();
