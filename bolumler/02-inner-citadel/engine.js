// STOA drawing engine (16:9). Everything is drawn with canvas code; render(t) is pure.
const cv = document.getElementById('c'), x = cv.getContext('2d');
const W = 1920, H = 1080, PI = Math.PI, TAU = PI * 2;
const GOLD = '#d9a441', GOLD2 = '#f6d68c', INK = '#050304', CREAM = '#efe4cf';
const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, v) => { if (a === b) return v >= b ? 1 : 0; const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const win = (t, a, b, fi = 0.6, fo = 0.6) => ss(a - fi, a, t) * (1 - ss(b, b + fo, t));
const R = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const easeBack = k => { const c = 1.7; k = cl(k, 0, 1); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const easeOut = k => 1 - Math.pow(1 - cl(k, 0, 1), 3);
const noise1 = (v, s = 0) => { const i = Math.floor(v), f = v - i, u = f * f * (3 - 2 * f); return lerp(R(i + s * 97.3), R(i + 1 + s * 97.3), u) * 2 - 1; };
const fbm = (v, s = 0) => noise1(v, s) * 0.55 + noise1(v * 2.1, s + 3) * 0.28 + noise1(v * 4.3, s + 7) * 0.17;
x.lineJoin = 'round'; x.lineCap = 'round';

// ---------- textures ----------
let sd = 11; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const GRAIN = [...Array(6)].map(() => {
  const c = document.createElement('canvas'); c.width = 960; c.height = 540;
  const g = c.getContext('2d'), d = g.createImageData(960, 540);
  for (let i = 0; i < d.data.length; i += 4) { const v = rng() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 30; }
  g.putImageData(d, 0, 0); return c;
});
const glowCache = {};
function glow(col) {
  if (glowCache[col]) return glowCache[col];
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.25, `rgba(${col},.45)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return glowCache[col] = c;
}
function light(cx, cy, r, col, a) { if (a <= 0.003) return; x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = cl(a, 0, 1); x.drawImage(glow(col), cx - r, cy - r, r * 2, r * 2); x.restore(); }
function shade(cx, cy, r, a) { if (a <= 0) return; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }

// ---------- primitives ----------
function poly(p) { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.closePath(); }
function ell(cx, cy, rx, ry, r = 0) { x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), r, 0, TAU); }
function line(pts, w, col) { x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }
function fillAll(col) { x.fillStyle = col; x.fillRect(-400, -400, W + 800, H + 800); }
function vgrad(stops, y0 = 0, y1 = H) { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(-400, y0 - 400, W + 800, y1 - y0 + 800); }
function textC(s, px, py, font, col, ls = 0, a = 1, align = 'center') { if (a <= 0) return; x.save(); x.font = font; x.letterSpacing = ls + 'px'; x.textAlign = align; x.textBaseline = 'middle'; x.globalAlpha = a; x.fillStyle = col; x.fillText(s, px + (align === 'center' ? ls / 2 : 0), py); x.restore(); }
function cam(t, keys) { // [time, zoom, fx, fy, dur]
  let z = keys[0][1], fx = keys[0][2], fy = keys[0][3];
  for (let i = 1; i < keys.length; i++) { const k = keys[i], e = ss(k[0], k[0] + (k[4] ?? 1.2), t); z = lerp(z, k[1], e); fx = lerp(fx, k[2], e); fy = lerp(fy, k[3], e); }
  fx = cl(fx, W / 2 / z, W - W / 2 / z); fy = cl(fy, H / 2 / z, H - H / 2 / z);
  x.translate(W / 2, H / 2); x.scale(z, z); x.translate(-fx, -fy);
}
// which shot of a scene is active: list of start times -> {i, lt (local time), k (0..1 within shot)}
function shot(t, starts, end) { let i = 0; for (let j = 0; j < starts.length; j++) if (t >= starts[j]) i = j; const s = starts[i], e = starts[i + 1] ?? end; return { i, lt: t - s, k: cl((t - s) / Math.max(0.01, e - s), 0, 1), s, e }; }

// ---------- sky & atmosphere ----------
function stars(t, n, a = 1, seed = 0, yMax = H) {
  x.save(); x.fillStyle = '#f3ecdf';
  for (let i = 0; i < n; i++) { const px = R(i + seed) * W, py = R(i * 1.3 + 9 + seed) * yMax, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + R(i) * 2) + i)); x.globalAlpha = a * tw * (0.3 + 0.7 * R(i + 5)); const s = R(i + 2) < 0.08 ? 3 : 1.6; x.fillRect(px, py, s, s); }
  x.restore();
}
function moon(cx, cy, r, col = '#efe2c8', haze = 0.35) {
  light(cx, cy, r * 4, '255,230,190', haze);
  ell(cx, cy, r, r); x.fillStyle = col; x.fill();
  const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(90,70,60,.35)'); x.fillStyle = g; x.fill();
  x.fillStyle = 'rgba(120,100,90,.18)'; [[-.3, .1, .2], [.25, -.2, .14], [.1, .35, .1]].forEach(([a, b, c]) => { ell(cx + a * r, cy + b * r, c * r, c * r); x.fill(); });
}
function clouds(t, n, y0, y1, col, a, seed = 0, speed = 10, scale = 1) {
  for (let i = 0; i < n; i++) {
    const r = (180 + R(i + seed) * 320) * scale, px = ((R(i * 3 + seed) * (W + 1000)) + t * speed * (0.5 + R(i + 1))) % (W + 1000) - 500, py = y0 + R(i * 7 + seed) * (y1 - y0);
    const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g; x.save(); x.translate(px, py); x.scale(1.8, 0.55); x.translate(-px, -py); x.fillRect(px - r, py - r, r * 2, r * 2); x.restore();
  }
}
function ridge(seed, y0, amp, freq, col, rough = 0.35) {
  x.beginPath(); x.moveTo(-400, H + 400);
  for (let px = -400; px <= W + 400; px += 12) { const v = fbm(px * freq + seed * 13.1, seed) + rough * noise1(px * freq * 6, seed + 2); x.lineTo(px, y0 - Math.abs(v) * amp - v * amp * 0.3); }
  x.lineTo(W + 400, H + 400); x.closePath(); x.fillStyle = col; x.fill();
}
function snowfall(t, n, wind = 60, a = 0.8, seed = 0, size = 1) {
  x.save(); x.fillStyle = '#f2f4f7';
  for (let i = 0; i < n; i++) { const sp = 60 + R(i + seed) * 120, s = (1 + R(i * 2 + seed) * 3) * size, y = (R(i * 5 + seed) * (H + 80) + sp * t) % (H + 80) - 40, xx = (R(i * 7 + seed) * (W + 600) + wind * t + Math.sin(t * 0.8 + i) * 30) % (W + 600) - 300; x.globalAlpha = a * (0.4 + 0.6 * R(i + 3)); x.beginPath(); x.arc(xx, y, s, 0, TAU); x.fill(); }
  x.restore();
}
function rainfall(t, n, a = 0.35, slant = 0.25) {
  x.save(); x.strokeStyle = `rgba(190,205,230,${a})`; x.lineWidth = 2; x.beginPath();
  for (let i = 0; i < n; i++) { const sp = 1700 + R(i) * 900, y = (R(i + 7) * H + sp * t) % (H + 120) - 60, xx = (R(i + 3) * (W + 600) - y * slant + t * 250) % (W + 600) - 300; x.moveTo(xx, y); x.lineTo(xx - 46 * slant, y + 46); }
  x.stroke(); x.restore();
}
function embers(t, n, col, sp, seed = 0, size = 1, area = [0, W, 0, H]) {
  x.save(); x.globalCompositeOperation = 'lighter';
  const [x0, x1, y0, y1] = area, hh = y1 - y0;
  for (let i = 0; i < n; i++) {
    const a = R(i + seed), b = R(i * 1.7 + 50 + seed), c = R(i * 2.3 + 99 + seed), v = sp * (0.4 + b);
    const y = y1 + 40 - ((a * hh * 1.3 + v * t) % (hh * 1.3)), xx = x0 + c * (x1 - x0) + Math.sin(t * (0.6 + a) + i) * 40;
    const r = (5 + b * 12) * size, fl = 0.35 + 0.65 * Math.abs(Math.sin(t * (2 + c * 3) + i));
    x.globalAlpha = fl * (0.45 + 0.55 * c); x.drawImage(glow(col), xx - r, y - r, r * 2, r * 2);
  }
  x.restore();
}
function smoke(t, n, col, a, seed = 0, y0 = 200, y1 = 1000, rmin = 220, rmax = 520) {
  for (let i = 0; i < n; i++) {
    const r = rmin + R(i + seed) * (rmax - rmin), px = (R(i * 3 + seed) * (W + 800) + t * (10 + R(i) * 18)) % (W + 800) - 400;
    const py = y0 + R(i * 7 + seed) * (y1 - y0) + Math.sin(t * 0.3 + i) * 30;
    const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
}
function godrays(cx, cy, n, len, col, a, t, spread = 0.9, dir = PI / 2) {
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = dir + (i / (n - 1) - 0.5) * spread + Math.sin(t * 0.2 + i) * 0.02, w = 0.025 + R(i) * 0.03;
    const g = x.createLinearGradient(cx, cy, cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); g.addColorStop(0, `rgba(${col},${a * (0.5 + 0.5 * R(i + 4))})`); g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(ang - w) * len, cy + Math.sin(ang - w) * len); x.lineTo(cx + Math.cos(ang + w) * len, cy + Math.sin(ang + w) * len); x.closePath(); x.fill();
  }
  x.restore();
}

// ---------- fire ----------
function flame(cx, cy, s, t, seed = 0, int = 1) {
  if (s <= 0 || int <= 0) return;
  light(cx, cy - 60 * s, 420 * s, '255,140,40', 0.5 * int);
  const layers = [['#7a1206', 1], ['#e2470f', 0.82], ['#ff9a1f', 0.6], ['#ffe08a', 0.38], ['#fffaf0', 0.2]];
  x.save(); x.globalCompositeOperation = 'lighter';
  layers.forEach(([col, k], li) => {
    const h = 190 * s * k * (1 + 0.08 * Math.sin(t * 13 + seed + li)), w = 62 * s * k * (1 + 0.1 * Math.sin(t * 9 + seed * 2));
    const sway = Math.sin(t * 5.3 + seed) * 16 * s * k + Math.sin(t * 11.7 + seed) * 6 * s;
    x.beginPath(); x.moveTo(cx + sway, cy - h);
    x.bezierCurveTo(cx + w * 0.5 + sway * 0.5, cy - h * 0.55, cx + w, cy - h * 0.2, cx + w * 0.75, cy - h * 0.02);
    x.quadraticCurveTo(cx, cy + h * 0.16, cx - w * 0.75, cy - h * 0.02);
    x.bezierCurveTo(cx - w, cy - h * 0.2, cx - w * 0.5 + sway * 0.5, cy - h * 0.55, cx + sway, cy - h);
    x.fillStyle = col; x.globalAlpha = (li === 0 ? 0.7 : 0.85) * int; x.fill();
  });
  x.restore();
}
function campfire(cx, cy, s, t, seed = 0) {
  line([cx - 50 * s, cy + 6 * s, cx + 46 * s, cy - 8 * s], 14 * s, '#1a0f08'); line([cx - 44 * s, cy - 10 * s, cx + 52 * s, cy + 6 * s], 14 * s, '#140b06');
  flame(cx, cy, 0.7 * s, t, seed); embers(t, 6, '255,140,60', 60, seed, 0.5 * s, [cx - 60 * s, cx + 60 * s, cy - 300 * s, cy]);
}
function torch(cx, cy, s, t, seed = 0) { line([cx, cy, cx + 6 * s, cy + 90 * s], 10 * s, '#1a0f08'); flame(cx, cy, 0.32 * s, t, seed); }

// ---------- architecture ----------
function column(cx, top, bot, w, col, flutes = true) {
  x.fillStyle = col;
  x.fillRect(cx - w / 2 - w * 0.2, bot - w * 0.32, w * 1.4, w * 0.32); x.fillRect(cx - w / 2 - w * 0.08, bot - w * 0.5, w * 1.16, w * 0.2);
  x.fillRect(cx - w / 2, top + w * 0.42, w, bot - top - w * 0.9);
  x.fillRect(cx - w / 2 - w * 0.22, top + w * 0.16, w * 1.44, w * 0.28); x.fillRect(cx - w / 2 - w * 0.35, top, w * 1.7, w * 0.18);
  if (flutes) { x.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 1; k < 5; k++) x.fillRect(cx - w / 2 + (w * k) / 5 - 1.5, top + w * 0.5, 3, bot - top - w * 1.05); }
}
function temple(cx, base, w, h, col, nCol = 6) {
  const cw = w / (nCol * 1.9), top = base - h;
  x.fillStyle = col; x.fillRect(cx - w / 2 - 20, base - 18, w + 40, 18); x.fillRect(cx - w / 2 - 10, base - 32, w + 20, 14);
  for (let i = 0; i < nCol; i++) column(cx - w / 2 + cw + i * (w - 2 * cw) / (nCol - 1), top + h * 0.18, base - 32, cw, col, false);
  x.fillStyle = col; x.fillRect(cx - w / 2 - 6, top + h * 0.1, w + 12, h * 0.1);
  poly([cx - w / 2 - 14, top + h * 0.1, cx + w / 2 + 14, top + h * 0.1, cx, top - h * 0.12]); x.fill();
}
function colosseum(cx, base, w, h, col, lit = null) {
  x.fillStyle = col; x.beginPath(); x.moveTo(cx - w / 2, base); x.lineTo(cx - w / 2 + 10, base - h); x.quadraticCurveTo(cx, base - h * 1.08, cx + w / 2 - 10, base - h); x.lineTo(cx + w / 2, base); x.closePath(); x.fill();
  const rows = 4, cols = 14;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const ax = cx - w / 2 + 24 + c * (w - 48) / cols, ay = base - h + 20 + r * (h - 30) / rows, aw = (w - 48) / cols * 0.6, ah = (h - 30) / rows * 0.62;
    x.fillStyle = lit && R(r * 31 + c) < 0.35 ? lit : 'rgba(0,0,0,.45)';
    x.beginPath(); x.moveTo(ax, ay + ah); x.lineTo(ax, ay + aw / 2); x.arc(ax + aw / 2, ay + aw / 2, aw / 2, PI, 0); x.lineTo(ax + aw, ay + ah); x.closePath(); x.fill();
  }
}
function aqueduct(x0, x1, base, h, col) {
  const n = Math.floor((x1 - x0) / 110), aw = (x1 - x0) / n;
  x.fillStyle = col; x.fillRect(x0, base - h, x1 - x0, 26);
  for (let i = 0; i <= n; i++) x.fillRect(x0 + i * aw - 12, base - h, 24, h);
  for (let i = 0; i < n; i++) { x.beginPath(); x.moveTo(x0 + i * aw + 12, base - h + 26); x.quadraticCurveTo(x0 + i * aw + aw / 2, base - h + 26 + aw * 0.5, x0 + (i + 1) * aw - 12, base - h + 26); x.lineTo(x0 + (i + 1) * aw - 12, base - h + 60); x.lineTo(x0 + i * aw + 12, base - h + 60); x.fill(); }
}
function cypress(cx, base, h, col) { x.fillStyle = col; x.beginPath(); x.moveTo(cx, base - h); x.quadraticCurveTo(cx + h * 0.13, base - h * 0.5, cx + h * 0.06, base); x.lineTo(cx - h * 0.06, base); x.quadraticCurveTo(cx - h * 0.13, base - h * 0.5, cx, base - h); x.fill(); }
function houses(seed, base, n, x0, x1, hMin, hMax, col, winCol = null, winA = 0.8) {
  for (let i = 0; i < n; i++) {
    const w = 60 + R(i + seed) * 120, hx = x0 + R(i * 3 + seed) * (x1 - x0), h = hMin + R(i * 5 + seed) * (hMax - hMin);
    x.fillStyle = col; x.fillRect(hx, base - h, w, h); poly([hx - 8, base - h, hx + w + 8, base - h, hx + w / 2, base - h - w * 0.28]); x.fill();
    if (winCol) for (let k = 0; k < 3; k++) if (R(i * 11 + k + seed) < 0.45) { x.globalAlpha = winA; x.fillStyle = winCol; x.fillRect(hx + 12 + k * (w - 30) / 3, base - h + 20 + (k % 2) * 30, 12, 18); x.globalAlpha = 1; }
  }
}
function pine(cx, base, h, col, snow = 0) {
  x.fillStyle = col; x.fillRect(cx - h * 0.025, base - h * 0.15, h * 0.05, h * 0.15);
  for (let k = 0; k < 4; k++) { const ty = base - h * (0.18 + k * 0.2), w = h * (0.32 - k * 0.06); poly([cx - w, ty, cx + w, ty, cx, ty - h * 0.36]); x.fill(); }
  if (snow > 0) { x.fillStyle = `rgba(235,240,248,${snow})`; for (let k = 0; k < 4; k++) { const ty = base - h * (0.18 + k * 0.2), w = h * (0.32 - k * 0.06); poly([cx - w * 0.5, ty - h * 0.18, cx + w * 0.35, ty - h * 0.2, cx, ty - h * 0.36]); x.fill(); } x.fillStyle = col; }
}
function forest(seed, base, n, x0, x1, hMin, hMax, col, snow = 0) { for (let i = 0; i < n; i++) pine(x0 + R(i + seed) * (x1 - x0), base + R(i * 9 + seed) * 18, hMin + R(i * 3 + seed) * (hMax - hMin), col, snow); }
function tent(cx, base, s, col, lit = 0, t = 0) {
  x.fillStyle = col; poly([cx - 150 * s, base, cx + 150 * s, base, cx + 110 * s, base - 150 * s, cx - 110 * s, base - 150 * s]); x.fill();
  poly([cx - 125 * s, base - 140 * s, cx + 125 * s, base - 140 * s, cx, base - 230 * s]); x.fill();
  if (lit > 0) {
    const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
    x.fillStyle = `rgba(255,${170 + 40 * fl},90,${0.85 * lit})`; poly([cx - 38 * s, base, cx + 38 * s, base, cx + 8 * s, base - 120 * s, cx - 8 * s, base - 120 * s]); x.fill();
    light(cx, base - 60 * s, 260 * s, '255,160,70', 0.55 * lit * fl);
    x.fillStyle = `rgba(255,150,60,${0.18 * lit})`; poly([cx - 150 * s, base, cx + 150 * s, base, cx + 110 * s, base - 150 * s, cx - 110 * s, base - 150 * s]); x.fill();
  }
  line([cx, base - 230 * s, cx, base - 290 * s], 6 * s, col);
}
function standard(cx, base, h, col, t = 0) { // Roman eagle standard (aquila) with banner
  line([cx, base, cx, base - h], 8, col);
  const by = base - h * 0.78, sw = Math.sin(t * 2.2) * 6;
  x.fillStyle = col; poly([cx - 46, by, cx + 46, by, cx + 46 + sw, by + 70, cx + sw * 0.5, by + 58, cx - 46 + sw, by + 70]); x.fill();
  x.fillStyle = 'rgba(217,164,65,.6)'; x.fillRect(cx - 34, by + 12, 68, 4); x.fillRect(cx - 34, by + 40, 68, 4);
  x.fillStyle = col; const ey = base - h; // eagle
  x.beginPath(); x.moveTo(cx, ey - 8); x.quadraticCurveTo(cx - 40, ey - 40, cx - 70, ey - 28); x.quadraticCurveTo(cx - 40, ey - 18, cx - 8, ey + 6); x.lineTo(cx + 8, ey + 6); x.quadraticCurveTo(cx + 40, ey - 18, cx + 70, ey - 28); x.quadraticCurveTo(cx + 40, ey - 40, cx, ey - 8); x.fill();
  ell(cx, ey - 14, 9, 11); x.fill(); x.fillRect(cx - 26, ey + 4, 52, 8);
}

// ---------- figures (silhouettes) ----------
// opts: dir (1 right / -1 left), cloak, helmet, spear, shield, beard, laurel, walk (phase), arm (raise 0..1), lean, sit, robe
function person(cx, base, h, col, o = {}) {
  const d = o.dir || 1, u = h / 100, wp = o.walk ?? null;
  x.save(); x.translate(cx, base); x.scale(d, 1); x.rotate((o.lean || 0));
  x.fillStyle = col; x.strokeStyle = col;
  const leg = wp === null ? 0 : Math.sin(wp) * 0.35;
  if (!o.sit) {
    line([-4 * u, -46 * u, -4 * u + Math.sin(leg) * 44 * u, -2 * u], 10 * u, col);
    line([5 * u, -46 * u, 5 * u - Math.sin(leg) * 44 * u, -2 * u], 10 * u, col);
  } else { line([-2 * u, -40 * u, 22 * u, -38 * u, 26 * u, -2 * u], 10 * u, col); }
  // tunic / robe
  const hem = o.robe ? -4 : o.sit ? -36 : -40;
  poly([-16 * u, hem * u, 16 * u, hem * u, 12 * u, -78 * u, -12 * u, -80 * u]); x.fill();
  if (o.cloak) { const fl = o.wind ? Math.sin(o.wind) * 6 * u : 0; poly([-12 * u, -80 * u, -26 * u + fl, hem * u + 4 * u, -6 * u, (hem + 2) * u, -2 * u, -76 * u]); x.fill(); }
  // arms
  const ra = o.arm ?? 0; // 0 = down, 1 = raised forward
  line([8 * u, -74 * u, 8 * u + Math.cos(PI / 2 - ra * 1.6) * 34 * u * 0.9, -74 * u + Math.sin(PI / 2 - ra * 1.6) * 34 * u], 7 * u, col);
  line([-8 * u, -74 * u, -12 * u, -42 * u], 7 * u, col);
  // head
  ell(1 * u, -90 * u, 9 * u, 10.5 * u); x.fill();
  if (o.beard) { poly([-4 * u, -88 * u, 10 * u, -88 * u, 8 * u, -79 * u, 1 * u, -76 * u, -4 * u, -80 * u]); x.fill(); }
  poly([8 * u, -94 * u, 13 * u, -89 * u, 8 * u, -87 * u]); x.fill(); // nose
  if (o.helmet) { x.beginPath(); x.arc(1 * u, -92 * u, 11 * u, PI, 0); x.fill(); poly([-8 * u, -104 * u, 10 * u, -104 * u, 12 * u, -112 * u, -10 * u, -112 * u]); x.fill(); }
  if (o.laurel) { x.save(); x.fillStyle = o.laurelCol || col; for (let k = 0; k < 7; k++) { const a = PI * (1.05 + k * 0.13); ell(1 * u + Math.cos(a) * 10 * u, -91 * u + Math.sin(a) * 10.5 * u, 3.4 * u, 1.4 * u, a + PI / 2); x.fill(); } x.restore(); }
  if (o.spear) { line([16 * u, 0, 16 * u, -128 * u], 2.6 * u, col); poly([13 * u, -128 * u, 19 * u, -128 * u, 16 * u, -140 * u]); x.fill(); }
  if (o.shield) { x.beginPath(); x.roundRect(-24 * u, -78 * u, 16 * u, 44 * u, 3 * u); x.fill(); }
  x.restore();
}
// figure with rim light: draw lit offset first, then the dark body
function rimPerson(cx, base, h, col, rim, o = {}, off = [-3, -2]) { person(cx + off[0], base + off[1], h, rim, o); person(cx, base, h, col, o); }
function legion(t, y, n, s, col, rim, seed = 0, speed = 0, x0 = -100, x1 = W + 100, spacing = 70) {
  for (let i = 0; i < n; i++) {
    const px = ((x0 + i * spacing + speed * t + (R(i + seed) - 0.5) * 12) % (x1 - x0 + spacing) + (x1 - x0 + spacing)) % (x1 - x0 + spacing) + x0 - spacing;
    const o = { helmet: true, spear: true, shield: true, cloak: true, walk: speed ? t * 6 + i : null };
    if (rim) person(px - 2, y - 2, s, rim, o); person(px, y, s, col, o);
  }
}
function crowd(seed, base, n, x0, x1, s, col, t = 0, cheer = 0) {
  x.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const px = x0 + R(i + seed) * (x1 - x0), py = base + R(i * 3 + seed) * 40, k = s * (0.8 + R(i * 5) * 0.4), b = cheer * Math.abs(Math.sin(t * 6 + i)) * 10;
    ell(px, py - 46 * k - b, 11 * k, 12 * k); x.fill(); poly([px - 22 * k, py + 30, px + 22 * k, py + 30, px + 16 * k, py - 32 * k - b, px - 16 * k, py - 32 * k - b]); x.fill();
    if (cheer > 0 && R(i * 7 + seed) < 0.5) line([px + 12 * k, py - 30 * k - b, px + 22 * k, py - 70 * k - b * 2], 6 * k, col);
  }
}

// ---------- sea & rock ----------
function seaWave(px, t, k, base, amp) { return base + k * 70 + Math.sin(px * 0.004 + t * (0.9 + k * 0.2) + k * 1.7) * (amp + k * 10) + Math.sin(px * 0.011 - t * (1.5 + k * 0.25) + k) * (amp * 0.4 + k * 4); }
function sea(t, base, amp, layers, colFn, fg = null) {
  for (let k = 0; k < layers; k++) {
    if (fg && k === fg.k) fg.draw();
    x.beginPath(); x.moveTo(-400, H + 400);
    for (let px = -400; px <= W + 400; px += 16) x.lineTo(px, seaWave(px, t, k, base, amp));
    x.lineTo(W + 400, H + 400); x.closePath(); x.fillStyle = colFn(k); x.fill();
    x.strokeStyle = `rgba(200,215,230,${0.08 + 0.04 * k})`; x.lineWidth = 2; x.stroke();
  }
}
function promontory(cx, base, s, col, rim) {
  // craggy headland: jagged ridge, a cliff face on the sea side, lit facets
  const top = [];
  for (let i = 0; i <= 26; i++) { const u = i / 26, px = cx + (-560 + u * 1120) * s, env = Math.sin(Math.pow(u, 0.8) * PI) ** 0.7, jag = (R(i * 3.1) - 0.5) * 70 * s + (i % 2 ? 18 : -10) * s; top.push(px, base - (env * 420 * s + jag * env)); }
  const p = [cx - 600 * s, base + 60, ...top, cx + 600 * s, base + 60];
  if (rim) { x.save(); x.translate(-5, -5); poly(p); x.fillStyle = rim; x.fill(); x.restore(); }
  poly(p); x.fillStyle = col; x.fill();
  x.save(); poly(p); x.clip();
  const g = x.createLinearGradient(cx - 560 * s, 0, cx + 560 * s, 0); g.addColorStop(0, 'rgba(170,185,210,.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = g; x.fillRect(cx - 600 * s, base - 500 * s, 1200 * s, 600 * s);
  for (let i = 0; i < 18; i++) { const px = cx + (-480 + R(i * 5) * 960) * s, py = base - (40 + R(i * 7) * 260) * s, w = (30 + R(i) * 70) * s; x.fillStyle = `rgba(160,175,200,${0.025 + 0.025 * R(i + 2)})`; poly([px, py, px + w * 0.5, py + w * 1.6, px - w * 0.4, py + w * 1.2]); x.fill(); }
  x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 3 * s; for (let i = 0; i < 10; i++) { x.beginPath(); const px = cx + (-450 + i * 100) * s; x.moveTo(px, base - 330 * s * R(i + 9)); x.lineTo(px + (R(i) - 0.5) * 60 * s, base); x.stroke(); }
  x.restore();
  if (rim) { x.beginPath(); x.moveTo(top[0], top[1]); for (let i = 2; i < top.length; i += 2) x.lineTo(top[i], top[i + 1]); x.strokeStyle = rim; x.lineWidth = 2.5; x.stroke(); }
}
function spray(t, cx, cy, period, seed, s = 1) { // periodic wave crash spray
  const ph = ((t + seed) % period) / period; if (ph > 0.45) return;
  const k = ph / 0.45;
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) { // mist
    const a = -PI / 2 + (R(i + seed) - 0.5) * 1.8, v = (120 + R(i * 3 + seed) * 260) * s, px = cx + Math.cos(a) * v * k, py = cy + Math.sin(a) * v * k + 420 * k * k * s, r = (30 + R(i * 7) * 50) * s * (0.5 + k);
    x.globalAlpha = (1 - k) * 0.16; x.drawImage(glow('210,225,240'), px - r, py - r, r * 2, r * 2);
  }
  x.fillStyle = '#e8f0f6';
  for (let i = 0; i < 160; i++) { // droplets
    const a = -PI / 2 + (R(i * 1.3 + seed) - 0.5) * 2.4, v = (180 + R(i * 2.9 + seed) * 520) * s, px = cx + Math.cos(a) * v * k, py = cy + Math.sin(a) * v * k + 700 * k * k * s, r = (1.2 + R(i * 5) * 3.2) * s;
    x.globalAlpha = (1 - k) * (0.35 + 0.5 * R(i)); x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.restore();
}

// ---------- props ----------
function lamp(cx, cy, s, t) { // Roman oil lamp
  x.fillStyle = '#3a2516'; ell(cx, cy, 46 * s, 16 * s); x.fill(); x.beginPath(); x.moveTo(cx + 30 * s, cy - 6 * s); x.quadraticCurveTo(cx + 70 * s, cy - 8 * s, cx + 72 * s, cy - 2 * s); x.lineTo(cx + 34 * s, cy + 8 * s); x.fill();
  x.fillStyle = '#5a3a22'; ell(cx, cy - 6 * s, 30 * s, 8 * s); x.fill();
  flame(cx + 68 * s, cy - 6 * s, 0.22 * s, t, 3, 1);
}
function parchment(px, py, w, h, a = 1) {
  x.save(); x.globalAlpha = a; const g = x.createLinearGradient(px, py, px + w, py + h); g.addColorStop(0, '#d8c29a'); g.addColorStop(1, '#b89a6c');
  x.fillStyle = g; x.beginPath(); x.moveTo(px, py + 6); for (let i = 0; i <= 10; i++) x.lineTo(px + w * i / 10, py + (R(i) - 0.5) * 6); for (let i = 0; i <= 10; i++) x.lineTo(px + w + (R(i + 20) - 0.5) * 6, py + h * i / 10); for (let i = 10; i >= 0; i--) x.lineTo(px + w * i / 10, py + h + (R(i + 40) - 0.5) * 6); x.closePath(); x.fill();
  x.globalCompositeOperation = 'multiply'; x.drawImage(GRAIN[3], px, py, w, h); x.restore();
}
function hourglass(cx, cy, s, sand, t) {
  x.save(); x.translate(cx, cy);
  x.fillStyle = '#2a1a0e'; x.fillRect(-120 * s, -200 * s, 240 * s, 22 * s); x.fillRect(-120 * s, 178 * s, 240 * s, 22 * s);
  line([-100 * s, -178 * s, -100 * s, 178 * s], 10 * s, '#2a1a0e'); line([100 * s, -178 * s, 100 * s, 178 * s], 10 * s, '#2a1a0e');
  const glass = () => { x.beginPath(); x.moveTo(-80 * s, -176 * s); x.quadraticCurveTo(-80 * s, -40 * s, -8 * s, 0); x.quadraticCurveTo(-80 * s, 40 * s, -80 * s, 176 * s); x.lineTo(80 * s, 176 * s); x.quadraticCurveTo(80 * s, 40 * s, 8 * s, 0); x.quadraticCurveTo(80 * s, -40 * s, 80 * s, -176 * s); x.closePath(); };
  glass(); x.fillStyle = 'rgba(200,220,240,.08)'; x.fill(); x.strokeStyle = 'rgba(230,240,250,.35)'; x.lineWidth = 3 * s; x.stroke();
  x.save(); glass(); x.clip(); x.fillStyle = '#d9a441';
  const top = 176 * s * (1 - sand) * 0.9; x.fillRect(-90 * s, -top, 180 * s, top - 8 * s);
  const bot = 176 * s * sand * 0.85; x.beginPath(); x.moveTo(-90 * s, 176 * s); x.lineTo(-90 * s, 176 * s - bot * 0.6); x.quadraticCurveTo(0, 176 * s - bot * 1.3, 90 * s, 176 * s - bot * 0.6); x.lineTo(90 * s, 176 * s); x.fill();
  if (sand < 0.999) { x.fillRect(-2 * s, 0, 4 * s, 176 * s - bot); }
  x.restore(); x.restore();
}
function skull(cx, cy, s, col) {
  x.fillStyle = col; ell(cx, cy, 90 * s, 82 * s); x.fill(); x.beginPath(); x.roundRect(cx - 55 * s, cy + 40 * s, 110 * s, 60 * s, 18 * s); x.fill();
  x.fillStyle = '#050304'; ell(cx - 34 * s, cy + 8 * s, 24 * s, 28 * s); x.fill(); ell(cx + 34 * s, cy + 8 * s, 24 * s, 28 * s); x.fill();
  poly([cx, cy + 34 * s, cx - 12 * s, cy + 58 * s, cx + 12 * s, cy + 58 * s]); x.fill();
  for (let i = -2; i <= 2; i++) x.fillRect(cx + i * 18 * s - 2 * s, cy + 74 * s, 4 * s, 24 * s);
}
function scroll(cx, cy, w, h, col, a = 1) { x.save(); x.globalAlpha = a; x.fillStyle = col; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.fillStyle = 'rgba(0,0,0,.3)'; ell(cx - w / 2, cy, 12, h / 2); x.fill(); ell(cx + w / 2, cy, 12, h / 2); x.fill(); x.restore(); }

// ---------- Mediterranean schematic map (for plague spread + Cassius revolt) ----------
const MED = [ // rough outline of the sea, in map units (0..1000 x 0..560)
  70, 250, 120, 210, 190, 205, 250, 170, 300, 175, 345, 150, 390, 165, 420, 205, 455, 230, 500, 230, 530, 250, 560, 230, 600, 240, 650, 215, 700, 230, 760, 225, 820, 250, 860, 290, 875, 330,
  860, 380, 820, 400, 760, 395, 700, 400, 640, 405, 590, 395, 540, 370, 500, 360, 470, 380, 420, 370, 380, 340, 330, 330, 280, 345, 240, 330, 190, 320, 140, 330, 100, 310, 70, 280];
const CITIES = { rome: [400, 205], danube: [470, 95], syria: [880, 300], egypt: [790, 430], athens: [610, 270], carthage: [370, 340], alexandria: [770, 420], antioch: [870, 280], gaul: [250, 120], hispania: [110, 200] };
function mapDraw(mx, my, sc, a = 1, t = 0, opt = {}) {
  x.save(); x.globalAlpha = a; x.translate(mx, my); x.scale(sc, sc);
  x.fillStyle = '#c9b48c'; x.fillRect(-60, -40, 1120, 640);
  x.globalCompositeOperation = 'multiply'; x.drawImage(GRAIN[1], -60, -40, 1120, 640); x.globalCompositeOperation = 'source-over';
  x.fillStyle = '#8d7a5a'; poly(MED); x.fill(); x.strokeStyle = '#4a3a24'; x.lineWidth = 2.5; x.stroke();
  x.strokeStyle = 'rgba(74,58,36,.35)'; x.lineWidth = 1.5; for (let i = 1; i < 4; i++) { x.save(); x.translate(0, i * 6); poly(MED); x.stroke(); x.restore(); }
  // empire border (dashed)
  x.setLineDash([10, 8]); x.strokeStyle = 'rgba(120,20,15,.55)'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(40, 120); x.quadraticCurveTo(300, 40, 480, 80); x.quadraticCurveTo(700, 110, 900, 200); x.quadraticCurveTo(960, 330, 900, 470); x.quadraticCurveTo(600, 520, 300, 470); x.quadraticCurveTo(120, 440, 40, 360); x.stroke(); x.setLineDash([]);
  // Danube line
  x.strokeStyle = '#5b7a8c'; x.lineWidth = 4; x.beginPath(); x.moveTo(300, 70); x.quadraticCurveTo(420, 110, 520, 95); x.quadraticCurveTo(620, 85, 700, 140); x.stroke();
  for (const [k, [cx, cy]] of Object.entries(CITIES)) { if (opt.hide && opt.hide.includes(k)) continue; x.fillStyle = '#3a2a18'; ell(cx, cy, 6, 6); x.fill(); }
  if (opt.labels) opt.labels.forEach(([k, txt, al]) => { const [cx, cy] = CITIES[k]; textC(txt, cx, cy - 22, '700 22px Cinzel', '#3a2a18', 3, al ?? 1); });
  if (opt.spread) opt.spread(x);
  x.restore();
}
