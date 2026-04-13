import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, 'make-minesweeper-images.html');
const outDir = path.resolve(__dirname, '../../plicy/assets');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  await page.waitForFunction(() => document.getElementById('bg'));
  await new Promise(r => setTimeout(r, 500));

  // 背景をJPGで取得（軽量化）
  const dataUrl = await page.evaluate(() =>
    document.getElementById('bg').toDataURL('image/jpeg', 0.82)
  );
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  const out = path.join(outDir, 'かいだんマインスイーパー背景.jpg');
  fs.writeFileSync(out, Buffer.from(base64, 'base64'));
  console.log('wrote', out, fs.statSync(out).size, 'bytes');

  // 古いPNGを削除
  const oldPng = path.join(outDir, 'かいだんマインスイーパー背景.png');
  if (fs.existsSync(oldPng)) fs.unlinkSync(oldPng);

  await browser.close();
})();
