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
  function bgmAct1Spec() {
    const stepDur = SPB / 4;
    const bass = ['C3','C3','C3','C3', 'G3','G3','G3','G3', 'F3','F3','F3','F3', 'A3','A3','A3','A3'];
    const lead = [
      'C5','E5','G5','C6', 'C5','E5','G5','C6',
      'D5','F5','A5','D5', 'D5','F5','A5','D5',
      'C5','F5','A5','C6', 'C5','F5','A5','C6',
      'B4','D5','G5','B5', 'B4','D5','G5','B5',
    ];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 32;
        if (i % 4 === 0) playKick(time, 0.6);
        if (i % 8 === 4) playNoise(time, 0.05, 4000, 0.15);
        if (i % 2 === 0) playNoise(time, 0.02, 8000, 0.05);
        playTone(NOTES[bass[i % 16]] / 2, time, stepDur * 1.8, 'sawtooth', 0.18,
          {attack:0.002, decay:0.02, sustain:0.7, release:0.05});
        playTone(NOTES[lead[i % 32]], time, stepDur * 0.9, 'square', 0.13,
          {attack:0.002, decay:0.03, sustain:0.5, release:0.04});
        if (i % 16 === 0) {
          playTone(NOTES.E4, time, stepDur * 14, 'triangle', 0.05,
            {attack:0.05, decay:0.1, sustain:0.6, release:0.4});
        }
      }
    };
  }
  function bgmAct1() {
    const {stepFn, stepDur} = bgmAct1Spec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== BGM B: 第2幕前半 ほのぼの(マリンバ風sine) =====
  function bgmAct2aSpec() {
    const stepDur = SPB / 2;
    const melody = [
      'C5','E5','G5','E5', 'F5','D5','C5','REST',
      'G4','C5','E5','C5', 'D5','F5','E5','REST',
      'C5','E5','G5','A5', 'G5','E5','C5','REST',
      'A4','C5','E5','C5', 'G4','C5','D5','REST',
    ];
    const bass = ['C3','REST','G3','REST', 'F3','REST','G3','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 32;
        const jitter = (Math.random() - 0.5) * 0.015;
        const t = time + jitter;
        playTone(NOTES[melody[i]], t, stepDur * 1.8, 'triangle', 0.18,
          {attack:0.005, decay:0.15, sustain:0.3, release:0.2});
        if (i % 4 === 0) {
          playTone(NOTES[bass[(i / 4) % 8]] / 2, time, stepDur * 3, 'sine', 0.15,
            {attack:0.02, decay:0.1, sustain:0.5, release:0.3});
        }
        if (i === 7 || i === 23) {
          playTone(NOTES.C6, time + 0.02, 0.08, 'sine', 0.08);
          playTone(NOTES.E5, time + 0.1, 0.08, 'sine', 0.06);
        }
      }
    };
  }
  function bgmAct2a() {
    const {stepFn, stepDur} = bgmAct2aSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== BGM C: 第2幕後半 機械化したほのぼの =====
  function bgmAct2bSpec() {
    const stepDur = SPB / 2;
    const melody = [
      'C5','E5','G5','E5', 'F5','D5','C5','REST',
      'G4','C5','E5','C5', 'D5','F5','E5','REST',
      'C5','E5','G5','A5', 'G5','E5','C5','REST',
      'A4','C5','E5','C5', 'G4','C5','D5','REST',
    ];
    const bass = ['C3','REST','G3','REST', 'F3','REST','G3','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 32;
        playTone(NOTES[melody[i]], time, stepDur * 0.95, 'square', 0.13,
          {attack:0.001, decay:0.01, sustain:0.9, release:0.005});
        if (i % 4 === 0) {
          playTone(NOTES[bass[(i / 4) % 8]] / 2, time, stepDur * 0.95, 'square', 0.1,
            {attack:0.001, decay:0.01, sustain:0.9, release:0.005});
        }
        if (i % 2 === 0) playNoise(time, 0.005, 6000, 0.04);
      }
    };
  }
  function bgmAct2b() {
    const {stepFn, stepDur} = bgmAct2bSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== BGM D: 第3幕 鏡(心拍→メトロノーム→歯車) =====
  function bgmAct3Spec() {
    const stepDur = SPB;
    let phase = 0;
    return {
      stepDur,
      stepFn: (step, time) => {
        if (step === 12) phase = 1;
        if (step === 24) phase = 2;

        if (phase === 0) {
          playKick(time, 0.5);
          playKick(time + 0.13, 0.35);
        } else if (phase === 1) {
          playTone(2000, time, 0.03, 'square', 0.2, {attack:0.001, decay:0.005, sustain:0.5, release:0.01});
          if (step % 4 === 0) {
            playTone(2400, time, 0.04, 'square', 0.25, {attack:0.001, decay:0.005, sustain:0.5, release:0.01});
          }
        } else {
          playNoise(time, 0.4, 800, 0.08);
          playTone(60 + (step % 3) * 10, time, 0.3, 'sawtooth', 0.12,
            {attack:0.05, decay:0.1, sustain:0.4, release:0.1});
          if (step % 2 === 0) {
            playTone(180, time + 0.05, 0.06, 'square', 0.08);
          }
        }
      }
    };
  }
  function bgmAct3() {
    const {stepFn, stepDur} = bgmAct3Spec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== BGM: タイトル画面(不穏なドローン+ピアノ) =====
  function bgmTitleSpec() {
    const stepDur = SPB;
    const melody = ['REST','C5','REST','G4','E4','REST','G4','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 8;
        // 低音ドローン
        if (i === 0) {
          playTone(NOTES.C3 / 2, time, stepDur * 8, 'sine', 0.1,
            {attack:0.5, decay:0.2, sustain:0.8, release:1.0});
        }
        // ピアノ
        playTone(NOTES[melody[i]], time, stepDur * 1.6, 'triangle', 0.15,
          {attack:0.01, decay:0.3, sustain:0.2, release:0.4});
        // メトロノーム風クリック(4拍に1回)
        if (i % 4 === 0) playNoise(time, 0.005, 8000, 0.04);
      }
    };
  }
  function bgmTitle() {
    const {stepFn, stepDur} = bgmTitleSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== FINALE A: COLD (perfect_machine / obedient) =====
  function bgmFinaleColdSpec() {
    const stepDur = SPB;
    const melody = ['C4','REST','G4','REST','C5','REST','G4','REST',
                    'A4','REST','F4','REST','G4','REST','E4','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 16;
        // 低音ドローン
        if (i === 0) {
          playTone(NOTES.E3 / 2, time, stepDur * 16, 'sawtooth', 0.08,
            {attack:1.0, decay:0.2, sustain:0.9, release:1.5});
        }
        // 金属的メロディ
        playTone(NOTES[melody[i]], time, stepDur * 0.95, 'square', 0.1,
          {attack:0.001, decay:0.01, sustain:0.9, release:0.02});
        // 歯車音(全拍)
        if (i % 2 === 0) playNoise(time, 0.008, 6000, 0.04);
      }
    };
  }
  function bgmFinaleCold() {
    const {stepFn, stepDur} = bgmFinaleColdSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== FINALE B: WARM (hesitant) =====
  function bgmFinaleWarmSpec() {
    const stepDur = SPB;
    const melody = ['C5','E5','G5','E5','F5','A5','G5','E5',
                    'D5','F5','A5','F5','C5','E5','G5','REST'];
    const bass = ['C3','REST','REST','REST','F3','REST','REST','REST',
                  'G3','REST','REST','REST','C3','REST','REST','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 16;
        const jitter = (Math.random() - 0.5) * 0.02;
        // ピアノ(優しいsine)
        playTone(NOTES[melody[i]], time + jitter, stepDur * 1.6, 'sine', 0.15,
          {attack:0.02, decay:0.2, sustain:0.4, release:0.5});
        // ベース(sine)
        playTone(NOTES[bass[i]] ? NOTES[bass[i]] / 2 : 0, time, stepDur * 3, 'sine', 0.12,
          {attack:0.1, decay:0.2, sustain:0.6, release:0.8});
      }
    };
  }
  function bgmFinaleWarm() {
    const {stepFn, stepDur} = bgmFinaleWarmSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== FINALE C: AWAKENED =====
  // 伏線回収: 全BGMの断片を同時に鳴らして1曲にまとめる
  function bgmFinaleAwakenedSpec() {
    const stepDur = SPB / 4; // 16分音符
    const act1Lead = ['C5','E5','G5','C6', 'C5','E5','G5','C6'];
    const act2Melody = ['C5','E5','G5','E5','F5','D5','C5','REST'];
    const act1Bass = ['C3','G3','F3','A3'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i16 = step % 64;
        const i8 = Math.floor(i16 / 2) % 32;
        // ACT1ドラム(弱め)
        if (i16 % 4 === 0) playKick(time, 0.3);
        if (i16 % 8 === 4) playNoise(time, 0.04, 4000, 0.08);
        // ACT1ベース(低音で重厚に)
        if (i16 % 4 === 0) {
          playTone(NOTES[act1Bass[(i16 / 16) % 4]] / 4, time, stepDur * 14, 'sine', 0.12,
            {attack:0.1, decay:0.2, sustain:0.7, release:0.5});
        }
        // ACT1のリード(静か)
        if (i16 % 2 === 0) {
          playTone(NOTES[act1Lead[i8 % 8]], time, stepDur * 1.8, 'triangle', 0.07,
            {attack:0.02, decay:0.1, sustain:0.4, release:0.1});
        }
        // ACT2のメロディ(前面)
        if (i16 % 4 === 0) {
          playTone(NOTES[act2Melody[i8 % 8]], time, stepDur * 3.5, 'triangle', 0.18,
            {attack:0.01, decay:0.2, sustain:0.5, release:0.3});
        }
        // ACT3の心拍
        if (i16 % 16 === 0) {
          playKick(time, 0.35);
          playKick(time + 0.13, 0.25);
        }
        // 高音のきらめき(覚醒の輝き)
        if (i16 === 0 || i16 === 32) {
          playTone(NOTES.C6, time, stepDur * 8, 'sine', 0.12,
            {attack:0.05, decay:0.3, sustain:0.3, release:0.5});
          playTone(NOTES.E5, time + 0.1, stepDur * 8, 'sine', 0.1,
            {attack:0.05, decay:0.3, sustain:0.3, release:0.5});
        }
      }
    };
  }
  function bgmFinaleAwakened() {
    const {stepFn, stepDur} = bgmFinaleAwakenedSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== FINALE D: DEFECTIVE(glitchy) =====
  function bgmFinaleDefectiveSpec() {
    const stepDur = SPB / 2;
    const melody = ['C5','E5','G5','E5','F5','D5','C5','REST'];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i = step % 16;
        // ランダムに音を飛ばす(壊れた感)
        if (Math.random() < 0.3) return;
        // 音程ランダムずらし
        const note = melody[i % 8];
        const freq = NOTES[note] * (0.95 + Math.random() * 0.1);
        playTone(freq, time, stepDur * 0.7, 'sawtooth', 0.12,
          {attack:0.001, decay:0.02, sustain:0.6, release:0.05});
        // 不規則ノイズ
        if (Math.random() < 0.4) playNoise(time, 0.05 * Math.random(), 2000 + Math.random()*4000, 0.08);
        // たまにキック
        if (Math.random() < 0.2) playKick(time, 0.4);
      }
    };
  }
  function bgmFinaleDefective() {
    const {stepFn, stepDur} = bgmFinaleDefectiveSpec();
    return startSequencer(stepFn, stepDur);
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

  // ミニゲーム別jingle(短い3音程)
  const JINGLES = {
    default: [NOTES.E5, NOTES.G5, NOTES.C6],
    mech:    [NOTES.C5, NOTES.G5, NOTES.C6],        // ACT1勝利
    soft:    [NOTES.C5, NOTES.E5, NOTES.G5],        // ACT2 ほのぼの
    dodge:   [NOTES.A5, NOTES.D5, NOTES.A5],        // 回避系
    sheep:   [NOTES.D5, NOTES.F5, NOTES.A5],        // COUNT SHEEP
    flower:  [NOTES.E5, NOTES.A5, NOTES.C6],        // PICK FLOWER
    leaf:    [NOTES.G5, NOTES.E5, NOTES.C5],        // CATCH LEAF (下降)
    yes:     [NOTES.G5, NOTES.C6, NOTES.E5],
    obey:    [NOTES.C5, NOTES.C5, NOTES.C5],        // 機械的同音
    wait:    [NOTES.C6, NOTES.G5, NOTES.E5],        // 気づきの上昇→下降
  };
  function sfxJingle(name) {
    ensureCtx();
    const j = JINGLES[name] || JINGLES.default;
    const t = ctx.currentTime;
    j.forEach((f, i) => {
      playTone(f, t + i * 0.06, 0.1, 'square', 0.18,
        {attack:0.002, decay:0.02, sustain:0.5, release:0.05});
    });
  }
  // チャージ音(CHARGE CANNON / POUR TEA用 上昇持続音)
  function sfxCharge() {
    ensureCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    g.gain.setValueAtTime(0.1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.45);
    osc.connect(g); g.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }
  // ヒット音(DESTROY CORE / SMASH BUTTON 用)
  function sfxHit(pitch) {
    ensureCtx();
    const t = ctx.currentTime;
    playTone((pitch || 600) + Math.random() * 100, t, 0.05, 'square', 0.15,
      {attack:0.001, decay:0.01, sustain:0.5, release:0.02});
    playNoise(t, 0.04, 3000, 0.12);
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
    if (name === 'title') currentBgm = bgmTitle();
    if (name === 'finale_cold')     currentBgm = bgmFinaleCold();
    if (name === 'finale_warm')     currentBgm = bgmFinaleWarm();
    if (name === 'finale_awakened') currentBgm = bgmFinaleAwakened();
    if (name === 'finale_defective')currentBgm = bgmFinaleDefective();
  }
  function stop() {
    if (currentBgm) { currentBgm.stop(); currentBgm = null; }
  }
  function setMute(m) {
    muted = m;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.4;
  }

  // ===== オフラインレンダリング =====
  // 指定 BGM を OfflineAudioContext で WAV 用に書き出す
  async function renderToBuffer(name, durationSec) {
    const sampleRate = 44100;
    const offline = new OfflineAudioContext(2, Math.floor(sampleRate * durationSec), sampleRate);
    // ctx と masterGain を一時退避
    const savedCtx = ctx;
    const savedGain = masterGain;
    ctx = offline;
    masterGain = offline.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(offline.destination);

    const specs = {
      act1:  bgmAct1Spec,
      act2a: bgmAct2aSpec,
      act2b: bgmAct2bSpec,
      act3:  bgmAct3Spec,
      title: bgmTitleSpec,
      finale_cold: bgmFinaleColdSpec,
      finale_warm: bgmFinaleWarmSpec,
      finale_awakened: bgmFinaleAwakenedSpec,
      finale_defective: bgmFinaleDefectiveSpec,
    };
    const {stepFn, stepDur} = specs[name]();
    let step = 0;
    let time = 0.05;
    while (time < durationSec) {
      stepFn(step, time);
      step++;
      time += stepDur;
    }
    const buffer = await offline.startRendering();
    // 復元
    ctx = savedCtx;
    masterGain = savedGain;
    return buffer;
  }

  window.GameAudio = {
    play, stop, setMute,
    sfxOk, sfxNg, sfxClick, sfxBoot,
    sfxJingle, sfxCharge, sfxHit,
    renderToBuffer,
  };
})();
