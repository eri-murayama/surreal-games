import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../plicy/assets');
const ghostPath = 'C:/Users/marina/Documents/OneNote ノートブック/イラスト30.png';

const ghostBase64 = fs.readFileSync(ghostPath).toString('base64');
const ghostDataUrl = `data:image/png;base64,${ghostBase64}`;

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  body { margin:0; }
  canvas { display:block; }
</style></head><body>
<canvas id="c" width="640" height="480"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const W = 640, H = 480;

// 背景: 夜の紫グラデ
const bg = ctx.createLinearGradient(0, 0, 0, H);
bg.addColorStop(0, '#1a0830');
bg.addColorStop(0.6, '#2a1050');
bg.addColorStop(1, '#0a0520');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// 霧
for (let i = 0; i < 6; i++) {
  const g = ctx.createRadialGradient(
    W*Math.random(), H*Math.random(), 20,
    W*Math.random(), H*Math.random(), 280
  );
  g.addColorStop(0, 'rgba(150,100,200,0.28)');
  g.addColorStop(1, 'rgba(150,100,200,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// うっすらマス目（マインスイーパー風）
ctx.save();
ctx.globalAlpha = 0.10;
const cs = 48;
for (let y = 0; y < H; y += cs) {
  for (let x = 0; x < W; x += cs) {
    ctx.fillStyle = ((x/cs + y/cs) % 2 === 0) ? '#6644aa' : '#3a1a5a';
    ctx.fillRect(x, y, cs - 2, cs - 2);
  }
}
ctx.restore();

// うっすら星
for (let i = 0; i < 50; i++) {
  ctx.save();
  ctx.globalAlpha = 0.2 + Math.random()*0.4;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(Math.random()*W, Math.random()*H, 0.8 + Math.random()*1.8, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

const ghost = new Image();
ghost.onload = () => {
  // おばけを中央に大きく配置（高さ基準で収まるサイズ）
  const targetH = H * 0.78;
  const scale = targetH / ghost.naturalHeight;
  const w = ghost.naturalWidth * scale;
  const h = ghost.naturalHeight * scale;
  const x = (W - w) / 2;
  const y = H - h - 28;

  // ハロー
  const halo = ctx.createRadialGradient(W/2, y + h*0.4, 20, W/2, y + h*0.4, w*0.9);
  halo.addColorStop(0, 'rgba(200,160,240,0.55)');
  halo.addColorStop(1, 'rgba(200,160,240,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  ctx.drawImage(ghost, x, y, w, h);

  window.__done = true;
};
ghost.src = '${ghostDataUrl}';
</script></body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html);
  await page.waitForFunction(() => window.__done === true, { timeout: 10000 });
  // サムネ（JPG: 軽量化）
  const thumbDataUrl = await page.evaluate(() =>
    document.getElementById('c').toDataURL('image/jpeg', 0.85)
  );
  const thumbBase64 = thumbDataUrl.replace(/^data:image\/jpeg;base64,/, '');
  const thumbOut = path.join(outDir, 'かいだんマインスイーパーサムネ.jpg');
  fs.writeFileSync(thumbOut, Buffer.from(thumbBase64, 'base64'));
  console.log('wrote', thumbOut, fs.statSync(thumbOut).size, 'bytes');

  // 古いPNGを削除
  const oldPng = path.join(outDir, 'かいだんマインスイーパーサムネ.png');
  if (fs.existsSync(oldPng)) fs.unlinkSync(oldPng);

  await browser.close();
})();
