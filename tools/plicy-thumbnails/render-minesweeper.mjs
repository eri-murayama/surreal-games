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
  await page.waitForFunction(() => {
    const t = document.getElementById('thumb');
    const b = document.getElementById('bg');
    return t && b;
  });
  // 少し待って描画完了を担保
  await new Promise(r => setTimeout(r, 500));

  const thumbDataUrl = await page.evaluate(() =>
    document.getElementById('thumb').toDataURL('image/png')
  );
  const bgDataUrl = await page.evaluate(() =>
    document.getElementById('bg').toDataURL('image/png')
  );

  const saveDataUrl = (dataUrl, filename) => {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(outDir, filename), Buffer.from(base64, 'base64'));
    console.log('wrote', filename);
  };

  saveDataUrl(thumbDataUrl, 'かいだんマインスイーパーサムネ.png');
  saveDataUrl(bgDataUrl, 'かいだんマインスイーパー背景.png');

  await browser.close();
})();
