import fs from 'fs';

const htmlPath = 'plicy/minesweeper/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. <audio> 要素を削除（Web Audio APIで読み込むので不要）
const audioRegex = /<audio id="kaidanVoice" loop>[\s\S]*?<\/audio>/;
if (!audioRegex.test(html)) {
  console.error('audio element not found');
  process.exit(1);
}
html = html.replace(audioRegex, '');
console.log('removed <audio> element');

// 2. toggleVoice/autoStartAudio を Web Audio API 版に置き換え
const oldVoiceBlock = `// ===== 怪談音声 =====
let voicePlaying = false;

function toggleVoice() {
  const voice = document.getElementById('kaidanVoice');
  const btn = document.getElementById('voiceBtn');
  if (!voicePlaying) {
    voice.volume = 0.8;
    voice.play().then(() => {
      voicePlaying = true;
      btn.classList.add('playing');
      btn.innerHTML = '<span class="icon">👻</span>怪談ON';
    }).catch(() => {
      btn.innerHTML = '<span class="icon">👻</span>ファイルなし';
      setTimeout(() => { btn.innerHTML = '<span class="icon">👻</span>怪談'; }, 2000);
    });
  } else {
    voice.pause();
    voicePlaying = false;
    btn.classList.remove('playing');
    btn.innerHTML = '<span class="icon">👻</span>怪談';
  }
}

// 最初のクリックでBGM+怪談音声を自動開始
let audioAutoStarted = false;
document.addEventListener('click', function autoStartAudio() {
  if (!audioAutoStarted) {
    audioAutoStarted = true;
    startBGM();
    const voice = document.getElementById('kaidanVoice');
    voice.volume = 0.9;
    voice.play().then(() => {
      voicePlaying = true;
      const btn = document.getElementById('voiceBtn');
      btn.classList.add('playing');
      btn.innerHTML = '<span class="icon">👻</span>怪談ON';
    }).catch(() => {});
  }
}, { once: true });`;

const newVoiceBlock = `// ===== 怪談音声（Web Audio APIで再生） =====
let voicePlaying = false;
let voiceBuffer = null;
let voiceSource = null;
let voiceGain = null;
let voiceLoading = false;

async function loadKaidanVoice() {
  if (voiceBuffer || voiceLoading) return voiceBuffer;
  voiceLoading = true;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  try {
    const res = await fetch('audio/kaidan.mp3');
    if (!res.ok) throw new Error('fetch failed: ' + res.status);
    const buf = await res.arrayBuffer();
    voiceBuffer = await audioCtx.decodeAudioData(buf);
    voiceLoading = false;
    return voiceBuffer;
  } catch (e) {
    voiceLoading = false;
    const btn = document.getElementById('voiceBtn');
    btn.innerHTML = '<span class="icon">👻</span>読込失敗';
    setTimeout(() => { btn.innerHTML = '<span class="icon">👻</span>怪談'; }, 2500);
    throw e;
  }
}

async function startKaidanVoice() {
  try {
    await loadKaidanVoice();
    if (!voiceBuffer) return;
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    voiceSource = audioCtx.createBufferSource();
    voiceSource.buffer = voiceBuffer;
    voiceSource.loop = true;
    voiceGain = audioCtx.createGain();
    voiceGain.gain.value = 0.9;
    voiceSource.connect(voiceGain);
    voiceGain.connect(audioCtx.destination);
    voiceSource.start(0);
    voicePlaying = true;
    const btn = document.getElementById('voiceBtn');
    btn.classList.add('playing');
    btn.innerHTML = '<span class="icon">👻</span>怪談ON';
  } catch (e) {}
}

function stopKaidanVoice() {
  if (voiceSource) {
    try { voiceSource.stop(0); } catch(e) {}
    voiceSource.disconnect();
    voiceSource = null;
  }
  if (voiceGain) { voiceGain.disconnect(); voiceGain = null; }
  voicePlaying = false;
  const btn = document.getElementById('voiceBtn');
  btn.classList.remove('playing');
  btn.innerHTML = '<span class="icon">👻</span>怪談';
}

function toggleVoice() {
  if (!voicePlaying) {
    startKaidanVoice();
  } else {
    stopKaidanVoice();
  }
}

// 最初のクリックでBGM+怪談音声を自動開始
let audioAutoStarted = false;
document.addEventListener('click', function autoStartAudio() {
  if (!audioAutoStarted) {
    audioAutoStarted = true;
    startBGM();
    startKaidanVoice();
  }
}, { once: true });`;

if (!html.includes(oldVoiceBlock)) {
  console.error('voice block not found');
  process.exit(1);
}
html = html.replace(oldVoiceBlock, newVoiceBlock);
console.log('replaced voice handling block');

fs.writeFileSync(htmlPath, html);
console.log('new index.html size:', fs.statSync(htmlPath).size, 'bytes');
