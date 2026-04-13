import fs from 'fs';

const audio = fs.readFileSync('plicy/minesweeper/audio/kaidan.mp3');
const b64 = audio.toString('base64');
const js = `window.__KAIDAN_AUDIO_B64 = ${JSON.stringify(b64)};\n`;
fs.writeFileSync('plicy/minesweeper/kaidan-audio.js', js);
console.log('wrote kaidan-audio.js:', fs.statSync('plicy/minesweeper/kaidan-audio.js').size, 'bytes');
