/* ============================================
   ゲロゲーロ学園 - オーディオシステム
   Web Audio API による BGM & SE
   ============================================ */

class GeroAudio {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.seGain = null;
    this.masterGain = null;
    this.bgmSource = null;
    this.isPlaying = false;
    this.bgmVolume = 0.3;
    this.seVolume = 0.5;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);
      this.seGain = this.ctx.createGain();
      this.seGain.gain.value = this.seVolume;
      this.seGain.connect(this.masterGain);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* --- Tone Generation --- */
  playTone(freq, duration = 0.15, type = 'sine', volume = 0.3) {
    if (!this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume * this.seVolume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.seGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /* --- Sound Effects --- */
  playCorrect() {
    if (!this.ctx) return;
    this.resume();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.25), i * 80);
    });
  }

  playWrong() {
    if (!this.ctx) return;
    this.resume();
    this.playTone(200, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(160, 0.4, 'sawtooth', 0.12), 100);
  }

  playPop() {
    if (!this.ctx) return;
    this.resume();
    const freq = 400 + Math.random() * 800;
    this.playTone(freq, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(freq * 1.5, 0.06, 'sine', 0.1), 30);
  }

  playBoop() {
    if (!this.ctx) return;
    this.resume();
    const freq = 300 + Math.random() * 400;
    this.playTone(freq, 0.12, 'triangle', 0.25);
  }

  playStar() {
    if (!this.ctx) return;
    this.resume();
    const notes = [784, 988, 1175, 1319, 1568]; // G5 B5 D6 E6 G6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 60);
    });
  }

  playLevelUp() {
    if (!this.ctx) return;
    this.resume();
    const notes = [523, 587, 659, 784, 1047]; // C5 D5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.2), i * 100);
    });
  }

  playGameOver() {
    if (!this.ctx) return;
    this.resume();
    const notes = [392, 370, 349, 330]; // G4 Gb4 F4 E4
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'triangle', 0.15), i * 200);
    });
  }

  playCelebration() {
    if (!this.ctx) return;
    this.resume();
    const melody = [523, 523, 784, 784, 880, 880, 784, 0, 698, 698, 659, 659, 587, 587, 523];
    melody.forEach((freq, i) => {
      if (freq > 0) {
        setTimeout(() => this.playTone(freq, 0.18, 'sine', 0.2), i * 120);
      }
    });
  }

  playAnimalSound(animal) {
    if (!this.ctx) return;
    this.resume();
    const sounds = {
      dog: () => { this.playTone(300, 0.2, 'sawtooth', 0.2); setTimeout(() => this.playTone(350, 0.3, 'sawtooth', 0.2), 200); },
      cat: () => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(400, this.ctx.currentTime); osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3); gain.gain.value = 0.2; gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5); osc.connect(gain); gain.connect(this.seGain); osc.start(); osc.stop(this.ctx.currentTime + 0.5); },
      bird: () => { [1200, 1400, 1200, 1500].forEach((f, i) => setTimeout(() => this.playTone(f, 0.1, 'sine', 0.15), i * 120)); },
      frog: () => { this.playTone(200, 0.1, 'square', 0.15); setTimeout(() => this.playTone(250, 0.15, 'square', 0.15), 150); },
      cow: () => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.value = 150; gain.gain.value = 0.15; gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8); osc.connect(gain); gain.connect(this.seGain); osc.start(); osc.stop(this.ctx.currentTime + 0.8); },
      pig: () => { [250, 300, 250].forEach((f, i) => setTimeout(() => this.playTone(f, 0.08, 'sawtooth', 0.12), i * 80)); },
      elephant: () => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, this.ctx.currentTime); osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.3); osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.6); gain.gain.value = 0.15; gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7); osc.connect(gain); gain.connect(this.seGain); osc.start(); osc.stop(this.ctx.currentTime + 0.7); },
      lion: () => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.value = 120; gain.gain.value = 0.2; gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6); osc.connect(gain); gain.connect(this.seGain); osc.start(); osc.stop(this.ctx.currentTime + 0.6); },
      duck: () => { [400, 420, 400].forEach((f, i) => setTimeout(() => this.playTone(f, 0.1, 'square', 0.12), i * 100)); },
      sheep: () => { const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(350, this.ctx.currentTime); osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.4); gain.gain.value = 0.2; gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5); osc.connect(gain); gain.connect(this.seGain); osc.start(); osc.stop(this.ctx.currentTime + 0.5); },
    };
    if (sounds[animal]) sounds[animal]();
  }

  /* Play a musical note (for music maker game) */
  playNote(note, duration = 0.4, type = 'sine') {
    if (!this.ctx) return;
    this.resume();
    const noteFreqs = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    };
    const freq = noteFreqs[note] || parseFloat(note) || 440;
    this.playTone(freq, duration, type, 0.3);
  }

  /* --- BGM System --- */
  startBGM(tempo = 120, key = 'C') {
    if (!this.ctx || this.isPlaying) return;
    this.resume();
    this.isPlaying = true;
    this._bgmTempo = tempo;
    this._bgmKey = key;
    this._playBGMLoop();
  }

  _playBGMLoop() {
    if (!this.isPlaying || !this.ctx) return;
    const beatDuration = 60 / this._bgmTempo;
    const scales = {
      C: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
      F: [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 659.25, 698.46],
      G: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99],
    };
    const scale = scales[this._bgmKey] || scales.C;

    // Simple happy melody pattern
    const pattern = [0, 2, 4, 5, 4, 2, 0, 4];
    const now = this.ctx.currentTime;

    pattern.forEach((noteIdx, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = scale[noteIdx];
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now + i * beatDuration);
      gain.gain.linearRampToValueAtTime(0.08 * this.bgmVolume, now + i * beatDuration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 0.8) * beatDuration);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now + i * beatDuration);
      osc.stop(now + (i + 1) * beatDuration);
    });

    // Also add a simple bass
    const bassPattern = [0, 0, 4, 4, 5, 5, 4, 4];
    bassPattern.forEach((noteIdx, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = scale[noteIdx] / 2;
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now + i * beatDuration);
      gain.gain.linearRampToValueAtTime(0.05 * this.bgmVolume, now + i * beatDuration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 0.7) * beatDuration);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now + i * beatDuration);
      osc.stop(now + (i + 1) * beatDuration);
    });

    const loopDuration = pattern.length * beatDuration * 1000;
    this._bgmTimeout = setTimeout(() => this._playBGMLoop(), loopDuration - 50);
  }

  stopBGM() {
    this.isPlaying = false;
    if (this._bgmTimeout) {
      clearTimeout(this._bgmTimeout);
      this._bgmTimeout = null;
    }
  }

  setBGMVolume(v) {
    this.bgmVolume = v;
    if (this.bgmGain) this.bgmGain.gain.value = v;
  }

  setSEVolume(v) {
    this.seVolume = v;
    if (this.seGain) this.seGain.gain.value = v;
  }

  toggleMute() {
    if (!this.masterGain) return;
    if (this.masterGain.gain.value > 0) {
      this.masterGain.gain.value = 0;
      return false;
    } else {
      this.masterGain.gain.value = 1;
      return true;
    }
  }
}

// Global instance
window.geroAudio = new GeroAudio();
