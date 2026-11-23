// Writes templates/<platform>-<style>.svg and .png (1080x1920, transparent) and templates/preview.png.
// PNGs are rendered with headless Chrome: CHROME=/path/to/chrome node scripts/build-templates.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PLATFORMS, toSVG } from '../index.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'templates');
const CHROME = process.env.CHROME;
if (!CHROME) throw new Error('Set CHROME to a Chrome / chrome-headless-shell binary');
mkdirSync(OUT, { recursive: true });

const shot = (file, png, w, h, bg = '00000000') =>
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', `--default-background-color=${bg}`,
    `--window-size=${w},${h}`, `--screenshot=${png}`, pathToFileURL(file).href], { stdio: 'ignore' });

for (const p of PLATFORMS) for (const style of ['guide', 'outline']) {
  const name = `${p}-${style}`;
  const svg = join(OUT, `${name}.svg`);
  writeFileSync(svg, toSVG(p, { style }));
  // Wrap in HTML so the SVG renders at exactly 1080x1920 with no margin.
  const html = join(OUT, `.${name}.html`);
  writeFileSync(html, `<!doctype html><style>html,body{margin:0;background:transparent}</style>${toSVG(p, { style })}`);
  shot(html, join(OUT, `${name}.png`), 1080, 1920);
  rmSync(html);
  console.log(name);
}

// Preview for the README: the four guide overlays on a neutral frame.
const cards = PLATFORMS.map((p) => `<figure><div class="f">${toSVG(p, { width: 360, height: 640 })}</div><figcaption>${p}</figcaption></figure>`).join('');
const prev = join(OUT, '.preview.html');
writeFileSync(prev, `<!doctype html><style>
body{margin:0;background:#0f172a;display:flex;gap:28px;padding:28px;font:600 22px Inter,Helvetica,Arial,sans-serif;color:#e2e8f0}
figure{margin:0;text-align:center}.f{width:360px;height:640px;border-radius:18px;overflow:hidden;background:linear-gradient(160deg,#475569,#1e293b)}
figcaption{margin-top:12px}</style>${cards}`);
shot(prev, join(OUT, 'preview.png'), 4 * 360 + 5 * 28, 640 + 2 * 28 + 48, 'ff0f172a');
rmSync(prev);
console.log('preview');
