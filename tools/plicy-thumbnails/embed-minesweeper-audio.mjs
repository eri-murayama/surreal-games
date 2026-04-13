import fs from 'fs';
import path from 'path';

const audioPath = 'plicy/minesweeper/audio/kaidan.mp3';
const htmlPath = 'plicy/minesweeper/index.html';

const audio = fs.readFileSync(audioPath);
const b64 = audio.toString('base64');
console.log('audio size:', audio.length, 'bytes');
console.log('base64 size:', b64.length, 'bytes');

let html = fs.readFileSync(htmlPath, 'utf8');

const oldBlock = `<audio id="kaidanVoice" loop>
  <source src="audio/kaidan.mp3" type="audio/mpeg">
  <source src="audio/kaidan.ogg" type="audio/ogg">
</audio>`;

if (!html.includes(oldBlock)) {
  console.error('audio block not found in index.html');
  process.exit(1);
}

const newBlock = `<audio id="kaidanVoice" loop>
  <source src="data:audio/mpeg;base64,${b64}" type="audio/mpeg">
</audio>`;

html = html.replace(oldBlock, newBlock);
fs.writeFileSync(htmlPath, html);

console.log('new index.html size:', fs.statSync(htmlPath).size, 'bytes');
