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

  // ===== ENDING COMEDY: 歌用BGM =====
  // 歌詞想定: 「お尻お尻 小高い山 登って 進め runaway runaway 母は食事中よ」
  // ボーカル帯域(約200-800Hz)を空けた、歌いやすい軽快なバッキング
  // BPM 110相当にしたいのでSPBローカル上書き
  function bgmEndingComedySpec() {
    const localBpm = 110;
    const localSpb = 60 / localBpm;
    const stepDur = localSpb / 2; // 8分音符
    // C-G-Am-F の王道進行(4小節=32step)
    // ベース(4分): C / G / A / F をベースの低音で
    const bassPattern = ['C3','REST','C3','REST','G3','REST','G3','REST',
                         'A3','REST','A3','REST','F3','REST','F3','REST'];
    // 高音マリンバ(ボーカルより上)
    const topPattern = [
      'REST','C6','REST','E6','REST','D6','REST','B5',
      'REST','C6','REST','D6','REST','C6','REST','A5',
      'REST','A5','REST','C6','REST','E6','REST','C6',
      'REST','F5','REST','A5','REST','C6','REST','A5',
    ];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i16 = step % 16;
        const i32 = step % 32;
        // ドラム(軽快な4つ打ち+ハイハット)
        if (i16 % 4 === 0) playKick(time, 0.45);
        if (i16 % 8 === 4) playNoise(time, 0.05, 4500, 0.14); // スネア
        if (i16 % 2 === 0) playNoise(time, 0.02, 9000, 0.05); // ハイハット
        // ベース(低音・ボーカル帯域を邪魔しない)
        const bn = bassPattern[i16];
        if (bn && NOTES[bn]) {
          playTone(NOTES[bn] / 2, time, stepDur * 1.7, 'triangle', 0.14,
            {attack:0.005, decay:0.05, sustain:0.5, release:0.1});
        }
        // 高音マリンバ(ボーカルより上、歌の邪魔にならない)
        const tn = topPattern[i32];
        if (tn && NOTES[tn]) {
          playTone(NOTES[tn], time, stepDur * 0.6, 'triangle', 0.09,
            {attack:0.002, decay:0.08, sustain:0.2, release:0.08});
        }
        // たまに変な音(「お尻」とか歌うシュール感に合わせて)
        if (i32 === 15) playTone(400, time, 0.08, 'square', 0.08); // プッ
        if (i32 === 31) {
          // 末尾の「runaway」あたりで効果音っぽく
          playTone(800, time, 0.06, 'sawtooth', 0.08);
          playTone(1000, time + 0.06, 0.06, 'sawtooth', 0.08);
        }
      }
    };
  }
  function bgmEndingComedy() {
    const {stepFn, stepDur} = bgmEndingComedySpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== ENDING YOUTH: 青春さわやか歌用BGM =====
  // 歌詞想定: 「鼻毛と耳毛が交わる一つに。交差し絡んで解けて別れる。」
  // BPM 132、Gメジャー、明るいポップパンク/青春JPOP風
  function bgmEndingYouthSpec() {
    const localBpm = 132;
    const localSpb = 60 / localBpm;
    const stepDur = localSpb / 2; // 8分音符
    // G-Em-C-D (王道の青春進行)
    const bassPattern = [
      'G2','G2','REST','G2', 'G2','REST','G2','REST',  // G
      'E3','E3','REST','E3', 'E3','REST','E3','REST',  // Em
      'C3','C3','REST','C3', 'C3','REST','C3','REST',  // C
      'D3','D3','REST','D3', 'D3','REST','D3','REST',  // D
    ];
    // ブライトな高音アルペジオ(ギター風)
    const leadPattern = [
      'G5','B5','D6','B5', 'G5','B5','D6','B5',
      'G5','B5','E6','B5', 'G5','B5','E6','B5',
      'G5','C6','E6','C6', 'G5','C6','E6','C6',
      'A5','D6','F5','D6', 'A5','D6','F5','D6',
    ];
    return {
      stepDur,
      stepFn: (step, time) => {
        const i32 = step % 32;
        // ドラム(軽快な8ビート)
        if (i32 % 4 === 0) playKick(time, 0.5);
        if (i32 % 8 === 4) playNoise(time, 0.06, 4500, 0.15); // スネア
        if (i32 % 2 === 1) playNoise(time, 0.025, 10000, 0.06); // ハイハット
        if (i32 === 28) playNoise(time, 0.08, 2000, 0.12); // 小さいフィル
        // ベース(しっかり低音)
        const bn = bassPattern[i32];
        if (bn && NOTES[bn]) {
          playTone(NOTES[bn] / 2, time, stepDur * 1.7, 'triangle', 0.15,
            {attack:0.003, decay:0.05, sustain:0.5, release:0.08});
        }
        // ギター風高音(三角+ちょい歪み)
        const ln = leadPattern[i32];
        if (ln && NOTES[ln]) {
          playTone(NOTES[ln], time, stepDur * 0.75, 'triangle', 0.1,
            {attack:0.002, decay:0.06, sustain:0.3, release:0.04});
          // 微かな歪み感で厚み
          playTone(NOTES[ln] * 1.005, time, stepDur * 0.6, 'square', 0.03,
            {attack:0.002, decay:0.04, sustain:0.2, release:0.02});
        }
        // コード感のパッド(各コードの頭に)
        if (i32 % 8 === 0) {
          const chordRoot = ['G4','E4','C5','A4'][Math.floor(i32 / 8)];
          if (NOTES[chordRoot]) {
            playTone(NOTES[chordRoot], time, stepDur * 7.5, 'sine', 0.05,
              {attack:0.1, decay:0.2, sustain:0.6, release:0.4});
          }
        }
        // たまにクラッシュ(セクション頭)
        if (i32 === 0) playNoise(time, 0.4, 6000, 0.08);
      }
    };
  }
  function bgmEndingYouth() {
    const {stepFn, stepDur} = bgmEndingYouthSpec();
    return startSequencer(stepFn, stepDur);
  }

  // ===== ENDING DRUM: 規則正しい太鼓ずんずん系 =====
  // 歌のせ用。4つ打ちの低音太鼓が延々続く。ボーカル帯域は完全に空ける。
  function bgmEndingDrumSpec() {
    const localBpm = 100;
    const localSpb = 60 / localBpm;
    const stepDur = localSpb / 2; // 8分音符
    return {
      stepDur,
      stepFn: (step, time) => {
        const i8 = step % 8;   // 1小節=8
        const i32 = step % 32; // 4小節
        // メインの太鼓(ずんずんずんずん=4分打ち)
        if (i8 % 2 === 0) {
          // キック(深い太鼓)
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(90, time);
          osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
          g.gain.setValueAtTime(0.7, time);
          g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(time);
          osc.stop(time + 0.24);
          // 同時に木の太鼓感(フィルタノイズ)
          playNoise(time, 0.04, 200, 0.1);
        }
        // たまに高音の太鼓(和風の「カン」)
        if (i32 === 14 || i32 === 30) {
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(400, time);
          osc2.frequency.exponentialRampToValueAtTime(300, time + 0.1);
          g2.gain.setValueAtTime(0.15, time);
          g2.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
          osc2.connect(g2);
          g2.connect(masterGain);
          osc2.start(time);
          osc2.stop(time + 0.16);
        }
        // 低音ドローン(ほんのり。ボーカルを邪魔しない超低音)
        if (i32 === 0) {
          playTone(NOTES.C3 / 2, time, stepDur * 30, 'sine', 0.06,
            {attack:0.3, decay:0.2, sustain:0.8, release:0.8});
        }
      }
    };
  }
  function bgmEndingDrum() {
    const {stepFn, stepDur} = bgmEndingDrumSpec();
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
    if (name === 'ending_comedy')   currentBgm = bgmEndingComedy();
    if (name === 'ending_youth')    currentBgm = bgmEndingYouth();
    if (name === 'ending_drum')     currentBgm = bgmEndingDrum();
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
      ending_comedy: bgmEndingComedySpec,
      ending_youth: bgmEndingYouthSpec,
      ending_drum: bgmEndingDrumSpec,
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
