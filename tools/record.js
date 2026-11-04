// Animasyonu Playwright ile kare kare kaydeder, anlatım + fon müziğiyle birleştirip MP4 yapar.
// Kullanım: node tools/record.js bolumler/01-elinde-olan [--fps 30] [--from 0 --to 10]
// Çıktı: videolar/<bölüm>.mp4 (1080x1920, H.264 + AAC, -14 LUFS)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');

const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const dir = path.resolve(args.find(a => !a.startsWith('--') && !/^[\d.]+$/.test(a)) || '.');
const FPS = +(opt('fps') || 30), slug = path.basename(dir);
const outDir = path.resolve(__dirname, '..', 'videolar'); fs.mkdirSync(outDir, { recursive: true });
const out = opt('out') ? path.resolve(opt('out')) : path.join(outDir, slug + '.mp4');
const narration = path.join(dir, 'narration.wav'), music = path.join(dir, 'soundtrack.wav');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on('pageerror', e => console.error('Sayfa hatası:', e.message));
  await page.goto('file://' + path.join(dir, 'index.html') + '?capture=1');
  await page.waitForFunction(() => typeof window.seekTo === 'function', null, { timeout: 30000 });
  const dur = await page.evaluate(() => window.DURATION);
  const t0 = +(opt('from') || 0), t1 = Math.min(dur, +(opt('to') || dur)), total = Math.ceil((t1 - t0) * FPS);
  const hasN = fs.existsSync(narration), hasM = fs.existsSync(music);

  const ff = ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-'];
  let ai = 1; const mix = [];
  if (hasN) ff.push('-ss', String(t0), '-t', String(t1 - t0), '-i', narration);
  if (hasM) ff.push('-ss', String(t0), '-t', String(t1 - t0), '-i', music);
  if (hasN && hasM) // müzik, anlatım konuşurken kısılır (sidechain ducking)
    mix.push('-filter_complex', '[1:a]volume=1.6,asplit=2[n1][n2];[2:a]volume=0.5[mu];[mu][n1]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=450:makeup=1[m];[n2][m]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]', '-map', '0:v', '-map', '[a]');
  else if (hasN || hasM) mix.push('-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5[a]', '-map', '0:v', '-map', '[a]');
  const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart'];
  if (mix.length) enc.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  const proc = spawn('ffmpeg', [...ff, ...mix, ...enc, out], { stdio: ['pipe', 'inherit', 'inherit'] });

  const started = Date.now();
  for (let f = 0; f < total; f++) {
    const url = await page.evaluate(t => { window.seekTo(t); return document.getElementById('c').toDataURL('image/jpeg', 0.94); }, t0 + f / FPS);
    if (!proc.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise(r => proc.stdin.once('drain', r));
    if (f % (FPS * 5) === 0) console.log(`Kare ${f}/${total}  (${((Date.now() - started) / 1000).toFixed(0)} sn)`);
  }
  proc.stdin.end();
  const code = await new Promise(r => proc.on('close', r)); await browser.close();
  if (code) { console.error('ffmpeg hata kodu ' + code); process.exit(code); }
  console.log(`Hazır: ${path.relative(process.cwd(), out)}  (${(t1 - t0).toFixed(1)} sn, ${hasN ? 'anlatımlı' : 'anlatımsız'}${hasM ? ', müzikli' : ''})`);
})();
