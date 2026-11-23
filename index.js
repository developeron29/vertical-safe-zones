// vertical-safe-zones: where TikTok, Instagram Reels and YouTube Shorts cover a 9:16 video with their UI.
import data from './zones.json' with { type: 'json' };

export const FRAME = Object.freeze({ ...data.frame });
export const LAST_CHECKED = data.lastChecked;
export const PLATFORMS = Object.freeze(['tiktok', 'reels', 'shorts', 'all']);

const BASE = data.platforms;

/** The zone for one platform, or 'all' (the area none of the three apps cover). Sizes are for 1080x1920. */
export function getZone(platform = 'all') {
  if (platform === 'all') {
    const ids = Object.keys(BASE);
    const margins = {};
    for (const side of ['top', 'bottom', 'left', 'right']) margins[side] = Math.max(...ids.map((id) => BASE[id].margins[side]));
    const covered = ids.flatMap((id) => BASE[id].covered.map((r) => ({ ...r, name: `${BASE[id].label}: ${r.name}` })));
    return { id: 'all', label: 'All three', margins, covered };
  }
  const z = BASE[platform];
  if (!z) throw new Error(`Unknown platform "${platform}". Use one of: ${PLATFORMS.join(', ')}`);
  return { id: platform, label: z.label, margins: { ...z.margins }, covered: z.covered.map((r) => ({ ...r })) };
}

function scaler({ width = FRAME.width, height = FRAME.height } = {}) {
  const sx = width / FRAME.width, sy = height / FRAME.height;
  return (r) => ({ ...r, x: Math.round(r.x * sx), y: Math.round(r.y * sy), width: Math.round(r.width * sx), height: Math.round(r.height * sy) });
}

/** The safe rectangle {x, y, width, height}, scaled to your frame size (default 1080x1920). */
export function safeArea(platform = 'all', size) {
  const { margins: m } = getZone(platform);
  return scaler(size)({ x: m.left, y: m.top, width: FRAME.width - m.left - m.right, height: FRAME.height - m.top - m.bottom });
}

/** The areas the app's UI covers, scaled to your frame size. */
export function coveredAreas(platform = 'all', size) {
  return getZone(platform).covered.map(scaler(size));
}

/** True when a box {x, y, width, height} (in your frame's pixels) sits fully inside the safe area. */
export function isSafe(box, platform = 'all', size) {
  const s = safeArea(platform, size);
  return box.x >= s.x && box.y >= s.y && box.x + box.width <= s.x + s.width && box.y + box.height <= s.y + s.height;
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * An SVG overlay (transparent background) to put on top of a 9:16 video in any editor.
 * style: 'guide' = covered areas shaded red + safe box in green + labels; 'outline' = safe box only.
 */
export function toSVG(platform = 'all', { width = FRAME.width, height = FRAME.height, style = 'guide', labels = true } = {}) {
  const z = getZone(platform);
  const s = safeArea(platform, { width, height });
  const covered = coveredAreas(platform, { width, height });
  const k = width / FRAME.width;
  const font = Math.round(30 * k);
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  if (style === 'guide') {
    parts.push(`<path fill="#ef4444" fill-opacity="0.35" fill-rule="nonzero" d="${covered.map((r) => `M${r.x} ${r.y}h${r.width}v${r.height}h-${r.width}z`).join('')}"/>`);
  }
  parts.push(`<rect x="${s.x + 2 * k}" y="${s.y + 2 * k}" width="${s.width - 4 * k}" height="${s.height - 4 * k}" fill="none" stroke="#22c55e" stroke-width="${4 * k}"${style === 'outline' ? ` stroke-dasharray="${24 * k} ${12 * k}"` : ''}/>`);
  if (labels) {
    const t = (x, y, text, anchor = 'start') =>
      `<text x="${x}" y="${y}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="${font}" font-weight="700" fill="#ffffff" stroke="#000000" stroke-opacity="0.6" stroke-width="${3 * k}" paint-order="stroke" text-anchor="${anchor}">${esc(text)}</text>`;
    const s0 = safeArea(platform); // label the 1080x1920 numbers, whatever size is drawn
    parts.push(t(s.x + 16 * k, s.y + 44 * k, `${z.label} safe area ${s0.width}×${s0.height}`));
    if (style === 'guide') {
      parts.push(t(width / 2, Math.round((s.y / 2) + font / 3), 'Covered by the app', 'middle'));
      parts.push(t(width / 2, Math.round(s.y + s.height + (height - s.y - s.height) / 2 + font / 3), 'Covered: caption and buttons', 'middle'));
    }
    parts.push(`<text x="${width - 16 * k}" y="${height - 16 * k}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="${Math.round(20 * k)}" fill="#ffffff" fill-opacity="0.7" text-anchor="end">verticalvideomaker.app/safe-zone-checker</text>`);
  }
  parts.push('</svg>');
  return parts.join('');
}

export default { FRAME, LAST_CHECKED, PLATFORMS, getZone, safeArea, coveredAreas, isSafe, toSVG };
