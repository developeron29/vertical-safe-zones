import assert from 'node:assert/strict';
import { safeArea, isSafe, coveredAreas, getZone, toSVG, PLATFORMS } from './index.js';

// Matches the table on verticalvideomaker.app/safe-zone-checker/
assert.deepEqual(safeArea('tiktok'), { x: 120, y: 240, width: 660, height: 1020 });
assert.deepEqual(safeArea('reels'), { x: 65, y: 270, width: 950, height: 980 });
assert.deepEqual(safeArea('shorts'), { x: 48, y: 288, width: 840, height: 960 });
assert.deepEqual(safeArea('all'), { x: 120, y: 288, width: 660, height: 960 });
// Scales to other 9:16 sizes
assert.deepEqual(safeArea('all', { width: 720, height: 1280 }), { x: 80, y: 192, width: 440, height: 640 });
assert.equal(isSafe({ x: 200, y: 400, width: 400, height: 200 }), true);
assert.equal(isSafe({ x: 200, y: 1300, width: 400, height: 200 }), false); // under the caption
assert.equal(isSafe({ x: 700, y: 900, width: 200, height: 100 }, 'tiktok'), false); // under the buttons
// Every covered rect stays inside the frame, and the safe area touches none of them
for (const p of PLATFORMS) {
  const s = safeArea(p);
  for (const r of coveredAreas(p)) {
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.width <= 1080 && r.y + r.height <= 1920, `${p} ${r.name} inside frame`);
    const overlap = r.x < s.x + s.width && s.x < r.x + r.width && r.y < s.y + s.height && s.y < r.y + r.height;
    assert.ok(!overlap, `${p}: safe area overlaps ${r.name}`);
  }
  assert.match(toSVG(p), /^<svg [^>]*width="1080"/);
}
assert.throws(() => getZone('snapchat'), /Unknown platform/);
console.log('ok');
