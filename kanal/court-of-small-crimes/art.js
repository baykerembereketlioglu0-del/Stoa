// THE COURT OF SMALL CRIMES — clean illustration engine.
// Opaque flat colour + one soft cel shadow (light from the upper left) + a warm dark outline. Every shape is a
// deliberate bezier path; nothing is randomly jittered. A light paper grain sits on top for warmth.
const cv = document.getElementById('c'); let x = cv.getContext('2d');
const W = 1080, H = 1920, PI = Math.PI, TAU = PI * 2;
const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, v) => { if (a === b) return v >= b ? 1 : 0; const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const win = (t, a, b, fi = 0.3, fo = 0.3) => ss(a - fi, a, t) * (1 - ss(b, b + fo, t));
const R = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const easeBack = k => { const c = 1.7; k = cl(k, 0, 1); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const easeOut = k => 1 - Math.pow(1 - cl(k, 0, 1), 3);
x.lineJoin = 'round'; x.lineCap = 'round';
let T = 0;
const OUT = '#2b1d17';
const PAL = {
  ink: '#2b1d17', cream: '#f6eedd', white: '#fffaf0', red: '#c0392b', oxblood: '#8c2f27', navy: '#2f4870', gold: '#d9a441',
  wall: '#e9dfc9', wall2: '#dccfb3', wood: '#7b4f2e', woodLight: '#9a6a40', woodDark: '#4f3220', floor: '#5e3c24',
  turtle: '#93ad6b', turtleDark: '#6f8a4c', shell: '#8a7440', robe: '#26252c', wig: '#efe9dc',
  fox: '#e48a43', foxCream: '#fbe7cc', foxInner: '#f2b9a4', suit: '#2f4870', tie: '#c0392b',
  heron: '#9aaabb', heronDark: '#6f8094', beak: '#f0b33a', tweed: '#a8834f', chalk: '#2e3b33', mustard: '#e0a93c', sage: '#9bb08a',
};
function hex(c) { const v = parseInt(c.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
function shadeOf(c, k = 0.74) { const [r, g, b] = hex(c); return `rgb(${Math.round(r * k)},${Math.round(g * k * 0.97)},${Math.round(b * k * 0.95)})`; }
function lightOf(c, k = 0.35) { const [r, g, b] = hex(c); return `rgb(${Math.round(r + (255 - r) * k)},${Math.round(g + (247 - g) * k)},${Math.round(b + (230 - b) * k)})`; }

// paint a closed path: fill, cel shadow on the lower-right, optional highlight, outline
function paint(pf, base, o = {}) {
  x.save(); pf(); x.fillStyle = base; x.fill();
  if (o.shade !== false) {
    const [sx, sy] = o.sh ?? [14, 12];
    x.save(); pf(); x.clip(); x.fillStyle = o.shadeCol ?? shadeOf(base); x.fillRect(-5000, -5000, 10000, 10000);
    x.translate(-sx, -sy); pf(); x.fillStyle = base; x.fill(); x.restore();
  }
  if (o.hl) { const [hx, hy, hr] = o.hl; x.save(); pf(); x.clip(); const g = x.createRadialGradient(hx, hy, 0, hx, hy, hr); g.addColorStop(0, 'rgba(255,250,235,.45)'); g.addColorStop(1, 'rgba(255,250,235,0)'); x.fillStyle = g; x.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); x.restore(); }
  if ((o.lw ?? 5) > 0) { pf(); x.lineWidth = o.lw ?? 5; x.strokeStyle = o.line ?? OUT; x.stroke(); }
  x.restore();
}
const P = (...pts) => () => { x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.closePath(); };
const E = (cx, cy, rx, ry, r = 0) => () => { x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), r, 0, TAU); };
const RR = (x0, y0, w, h, r) => () => { x.beginPath(); x.roundRect(x0, y0, w, h, r); };
function stroke(pts, lw = 4, col = OUT) { x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.lineWidth = lw; x.strokeStyle = col; x.stroke(); }
function qline(x0, y0, cx, cy, x1, y1, lw = 4, col = OUT) { x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(cx, cy, x1, y1); x.lineWidth = lw; x.strokeStyle = col; x.stroke(); }
function txt(s, px, py, font, col, a = 1, align = 'center', ls = 0, rot = 0) { if (a <= 0) return; x.save(); x.globalAlpha *= a; x.translate(px, py); x.rotate(rot); x.font = font; x.letterSpacing = ls + 'px'; x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, 0, 0); x.restore(); }
function blink(seed) { const p = (T + R(seed) * 4) % 4.2; return p < 0.12 ? 1 - Math.abs(p - 0.06) / 0.06 : 0; }

// ---------- paper ----------
let sd = 5; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const GRAIN = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), d = g.createImageData(540, 960); for (let i = 0; i < d.data.length; i += 4) { const v = 120 + rng() * 135; d.data[i] = v; d.data[i + 1] = v * 0.97; d.data[i + 2] = v * 0.9; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); return c; });
function grain(i) { x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.12; x.drawImage(GRAIN[i % 3], 0, 0, W, H); x.restore(); }

// ---------- stamp ----------
function stamp(s, cx, cy, size, k, rot = -0.12, col = PAL.red) {
  if (k <= 0) return; const sc = 1 + 1.4 * (1 - easeOut(k)), a = Math.min(1, k * 3);
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc); x.globalAlpha = a * 0.94;
  x.font = `${size}px "Bebas Neue"`; x.letterSpacing = size * 0.06 + 'px'; const w = x.measureText(s).width + size * 0.55, h = size * 1.15;
  x.strokeStyle = col; x.lineWidth = size * 0.065; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, size * 0.08); x.stroke(); x.lineWidth = size * 0.022; x.beginPath(); x.roundRect(-w / 2 + size * 0.11, -h / 2 + size * 0.11, w - size * 0.22, h - size * 0.22, size * 0.05); x.stroke();
  x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, size * 0.03, size * 0.06);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 90; i++) { x.globalAlpha = 0.45; x.beginPath(); x.arc((R(i * 7 + size) - 0.5) * w, (R(i * 3 + size) - 0.5) * h, 1 + R(i) * 3.5, 0, TAU); x.fill(); }
  x.restore();
}

// =====================================================================
//  THE COURTROOM
// =====================================================================
function scales(cx, cy, s, col = PAL.woodDark) { // scales of justice icon
  x.save(); x.translate(cx, cy); x.scale(s, s); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 6;
  stroke([0, -60, 0, 50], 7, col); stroke([-70, -40, 70, -40], 6, col); x.beginPath(); x.arc(0, -66, 9, 0, TAU); x.fill();
  for (const sx of [-70, 70]) { stroke([sx, -40, sx - 28, 10], 3, col); stroke([sx, -40, sx + 28, 10], 3, col); x.beginPath(); x.moveTo(sx - 34, 10); x.quadraticCurveTo(sx, 40, sx + 34, 10); x.closePath(); x.fill(); }
  x.fillRect(-30, 50, 60, 10); x.restore();
}
function seal(cx, cy, r) {
  paint(E(cx, cy, r, r), PAL.gold, { sh: [10, 10], hl: [cx - r * 0.4, cy - r * 0.4, r] });
  paint(E(cx, cy, r * 0.78, r * 0.78), '#c99536', { shade: false, lw: 3 });
  scales(cx, cy + r * 0.05, r / 150, '#6b4a1c');
  x.save(); x.font = `${r * 0.15}px "Special Elite"`; x.fillStyle = '#6b4a1c'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const s = 'THE COURT OF SMALL CRIMES', span = PI * 1.25; for (let i = 0; i < s.length; i++) { const a = -PI / 2 - span / 2 + span * i / (s.length - 1); x.save(); x.translate(cx + Math.cos(a) * r * 0.89, cy + Math.sin(a) * r * 0.89); x.rotate(a + PI / 2); x.fillText(s[i], 0, 0); x.restore(); }
  x.restore();
}
function windowArch(x0, y0, w, h, t) {
  const top = y0 + w / 2;
  const pf = () => { x.beginPath(); x.moveTo(x0, y0 + h); x.lineTo(x0, top); x.arc(x0 + w / 2, top, w / 2, PI, 0); x.lineTo(x0 + w, y0 + h); x.closePath(); };
  x.save(); pf(); x.clip(); const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#bcd3df'); g.addColorStop(1, '#f2e8cf'); x.fillStyle = g; x.fillRect(x0, y0, w, h);
  x.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(x0 + w * (0.3 + i * 0.25) + Math.sin(T * 0.2 + i) * 8, y0 + h * 0.35 + i * 30, w * 0.25, 16, 0, 0, TAU); x.fill(); } x.restore();
  pf(); x.lineWidth = 14; x.strokeStyle = PAL.woodLight; x.stroke(); pf(); x.lineWidth = 4; x.strokeStyle = OUT; x.stroke();
  stroke([x0 + w / 2, y0 + 8, x0 + w / 2, y0 + h], 8, PAL.woodLight); stroke([x0, top + h * 0.28, x0 + w, top + h * 0.28], 8, PAL.woodLight);
  paint(RR(x0 - 18, y0 + h - 6, w + 36, 26, 6), PAL.woodLight, { sh: [0, 8], lw: 4 });
}
function lightBeams(x0, y0, len, a) { x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const g = x.createLinearGradient(x0, y0, x0 + len * 0.55, y0 + len); g.addColorStop(0, `rgba(255,236,190,${0.12 * a})`); g.addColorStop(1, 'rgba(255,236,190,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(x0 + i * 60, y0); x.lineTo(x0 + 70 + i * 60, y0); x.lineTo(x0 + len * 0.55 + 220 + i * 60, y0 + len); x.lineTo(x0 + len * 0.55 + i * 60, y0 + len); x.closePath(); x.fill(); } x.restore(); }
function wainscot(y0, y1) {
  paint(P(-40, y0, W + 40, y0, W + 40, y1, -40, y1), PAL.wood, { shade: false, lw: 0 });
  const n = 5, pw = W / n;
  for (let i = 0; i < n; i++) { const px = i * pw + 26, ph = y1 - y0 - 70; paint(RR(px, y0 + 36, pw - 52, ph, 6), PAL.woodLight, { sh: [-8, -8], shadeCol: shadeOf(PAL.wood, 0.85), lw: 3 }); stroke([px + 10, y0 + 46, px + pw - 62, y0 + 46], 3, 'rgba(255,230,190,.35)'); }
  paint(P(-40, y0 - 22, W + 40, y0 - 22, W + 40, y0 + 6, -40, y0 + 6), PAL.woodDark, { shade: false, lw: 4 });
  stroke([-40, y0 - 14, W + 40, y0 - 14], 3, 'rgba(255,220,170,.35)');
}
function wallpaper(y1) {
  const g = x.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, PAL.wall2); g.addColorStop(1, PAL.wall); x.fillStyle = g; x.fillRect(-60, -60, W + 120, y1 + 60);
  x.save(); x.globalAlpha = 0.07; x.fillStyle = PAL.woodDark; for (let r = 0; r < 14; r++) for (let c = 0; c < 9; c++) { const px = c * 130 + (r % 2) * 65, py = r * 120; x.beginPath(); x.moveTo(px, py - 18); x.quadraticCurveTo(px + 14, py, px, py + 18); x.quadraticCurveTo(px - 14, py, px, py - 18); x.fill(); } x.restore();
}
function floorPlanks(y0) {
  paint(P(-60, y0, W + 60, y0, W + 60, H + 60, -60, H + 60), PAL.floor, { shade: false, lw: 0 });
  x.strokeStyle = 'rgba(30,15,8,.45)'; x.lineWidth = 3; for (let i = -8; i < 16; i++) { x.beginPath(); x.moveTo(540 + i * 70, y0); x.lineTo(540 + i * 240, H + 60); x.stroke(); }
  const g = x.createLinearGradient(0, y0, 0, y0 + 160); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(-60, y0, W + 120, 160);
}
// the full room behind everything; `wy` = top of the wood panelling
function courtroom(wy = 1040, fy = 1330, opt = {}) {
  wallpaper(wy);
  windowArch(60, 160, 200, 520); windowArch(820, 160, 200, 520);
  lightBeams(80, 200, 900, 1); lightBeams(840, 200, 900, 0.6);
  if (opt.seal !== false) seal(540, opt.sealY ?? 360, 150);
  wainscot(wy, fy); floorPlanks(fy);
}
function bench(cx, top, w, h, name = 'HON. A. SHELL') {
  paint(RR(cx - w / 2, top, w, h, 10), PAL.wood, { sh: [16, 0], lw: 6 });
  const n = 3, pw = (w - 80) / n; for (let i = 0; i < n; i++) paint(RR(cx - w / 2 + 40 + i * pw + 12, top + 70, pw - 24, h - 110, 8), PAL.woodLight, { sh: [-8, -8], shadeCol: shadeOf(PAL.wood, 0.85), lw: 3 });
  paint(RR(cx - w / 2 - 30, top - 34, w + 60, 46, 8), PAL.woodDark, { sh: [0, 10], lw: 6 });
  stroke([cx - w / 2 - 20, top - 24, cx + w / 2 + 20, top - 24], 3, 'rgba(255,220,170,.4)');
  paint(RR(cx - 150, top + 18, 300, 42, 6), PAL.gold, { sh: [0, 6], lw: 3 }); txt(name, cx, top + 40, '30px "Special Elite"', '#5a3d14', 1, 'center', 2);
}
function rail(x0, x1, y, h, n) { // dock / witness railing with spindles
  for (let i = 0; i <= n; i++) { const px = lerp(x0, x1, i / n); paint(RR(px - 9, y, 18, h, 6), PAL.woodLight, { sh: [5, 0], lw: 3.5 }); }
  paint(RR(x0 - 20, y - 20, x1 - x0 + 40, 30, 10), PAL.woodDark, { sh: [0, 8], lw: 5 });
  paint(RR(x0 - 20, y + h - 10, x1 - x0 + 40, 26, 8), PAL.woodDark, { sh: [0, 8], lw: 5 });
}

// =====================================================================
//  THE CAST
// =====================================================================
function mouth(cx, cy, w, talk, lipCol, sad = 0) {
  if (talk > 0.08) { const h = 6 + talk * 30; paint(() => { x.beginPath(); x.moveTo(cx - w / 2, cy); x.quadraticCurveTo(cx, cy - 6, cx + w / 2, cy); x.quadraticCurveTo(cx + w * 0.3, cy + h, cx, cy + h * 1.05); x.quadraticCurveTo(cx - w * 0.3, cy + h, cx - w / 2, cy); }, '#5b2320', { shade: false, lw: 4 }); paint(E(cx, cy + h * 0.75, w * 0.22, h * 0.22), '#d9706b', { shade: false, lw: 0 }); }
  else qline(cx - w / 2, cy + sad * 6, cx, cy - 6 + sad * 14, cx + w / 2, cy + sad * 6, 5);
}
function eye(cx, cy, rx, ry, look, lid, iris = '#4a2f1e', seed = 0) {
  const b = Math.max(lid, blink(seed));
  paint(E(cx, cy, rx, ry), PAL.white, { shade: false, lw: 4 });
  x.save(); E(cx, cy, rx, ry)(); x.clip();
  paint(E(cx + look[0] * rx * 0.35, cy + look[1] * ry * 0.3, rx * 0.55, ry * 0.6), iris, { shade: false, lw: 0 });
  paint(E(cx + look[0] * rx * 0.38, cy + look[1] * ry * 0.3, rx * 0.28, ry * 0.32), '#120a08', { shade: false, lw: 0 });
  paint(E(cx + look[0] * rx * 0.35 - rx * 0.18, cy + look[1] * ry * 0.3 - ry * 0.22, rx * 0.13, ry * 0.13), '#fff', { shade: false, lw: 0 });
  x.restore();
}
function lid(cx, cy, rx, ry, amt, col) { // upper eyelid covering `amt` of the eye
  if (amt <= 0.01) return; x.save(); E(cx, cy, rx + 1, ry + 1)(); x.clip(); paint(P(cx - rx - 4, cy - ry - 4, cx + rx + 4, cy - ry - 4, cx + rx + 4, cy - ry + ry * 2 * amt, cx - rx - 4, cy - ry + ry * 2 * amt), col, { shade: false, lw: 0 }); stroke([cx - rx, cy - ry + ry * 2 * amt, cx + rx, cy - ry + ry * 2 * amt], 4); x.restore(); paint(E(cx, cy, rx, ry), 'rgba(0,0,0,0)', { shade: false, lw: 4 });
}

// JUDGE AGATHA SHELL — a very old tortoise in a barrister's wig. Origin: base of the neck.
function judgeAgatha(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  // shell behind the shoulders
  paint(E(0, 70, 250, 175), PAL.shell, { sh: [16, 14], hl: [-90, -20, 160] });
  x.save(); E(0, 70, 250, 175)(); x.clip(); x.strokeStyle = shadeOf(PAL.shell, 0.7); x.lineWidth = 5;
  for (const [hx, hy] of [[0, -30], [-130, 20], [130, 20], [-70, -70], [70, -70]]) { x.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * TAU + PI / 6; const px = hx + Math.cos(a) * 62, py = hy + Math.sin(a) * 52; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  x.restore();
  // robe + bands
  paint(() => { x.beginPath(); x.moveTo(-225, 470); x.lineTo(-215, 180); x.quadraticCurveTo(-200, 95, -95, 70); x.lineTo(95, 70); x.quadraticCurveTo(200, 95, 215, 180); x.lineTo(225, 470); x.closePath(); }, PAL.robe, { sh: [18, 0] });
  stroke([-120, 120, -150, 460], 4, '#3a3942'); stroke([120, 120, 150, 460], 4, '#3a3942');
  paint(P(-26, 72, -4, 72, -6, 150, -30, 146), PAL.white, { sh: [4, 4], lw: 3.5 }); paint(P(4, 72, 26, 72, 30, 146, 6, 150), PAL.white, { sh: [4, 4], lw: 3.5 });
  // neck
  paint(() => { x.beginPath(); x.moveTo(-62, 80); x.quadraticCurveTo(-70, 10, -55, -30); x.lineTo(55, -30); x.quadraticCurveTo(70, 10, 62, 80); x.closePath(); }, PAL.turtle, { sh: [12, 0] });
  for (let i = 0; i < 3; i++) qline(-42, 0 + i * 22, 0, 10 + i * 22, 42, 0 + i * 22, 3.5, shadeOf(PAL.turtle, 0.6));
  // head
  const hp = () => { x.beginPath(); x.moveTo(-118, -70); x.bezierCurveTo(-140, -170, -90, -245, 0, -248); x.bezierCurveTo(90, -245, 140, -170, 118, -70); x.bezierCurveTo(108, -20, 60, 2, 0, 4); x.bezierCurveTo(-60, 2, -108, -20, -118, -70); x.closePath(); };
  paint(hp, PAL.turtle, { sh: [16, 14], hl: [-50, -180, 120] });
  // wig: crown + side rolls
  paint(() => { x.beginPath(); x.moveTo(-132, -120); x.bezierCurveTo(-140, -240, -70, -292, 0, -292); x.bezierCurveTo(70, -292, 140, -240, 132, -120); x.bezierCurveTo(100, -150, 60, -166, 0, -168); x.bezierCurveTo(-60, -166, -100, -150, -132, -120); x.closePath(); }, PAL.wig, { sh: [12, 10] });
  for (let r = 0; r < 3; r++) qline(-110 + r * 8, -210 + r * 26, 0, -238 + r * 26, 110 - r * 8, -210 + r * 26, 3, '#c9c0ae');
  for (const sd2 of [-1, 1]) for (let k = 0; k < 3; k++) { const rx = sd2 * 150, ry = -130 + k * 40; paint(E(rx, ry, 44, 19), PAL.wig, { sh: [6, 6], lw: 4 }); x.beginPath(); x.arc(rx + sd2 * 18, ry, 9, 0, TAU * 0.8); x.lineWidth = 3; x.strokeStyle = '#b7ad99'; x.stroke(); }
  // eyes under heavy lids, with spectacles
  const look = o.look ?? [0.2, 0.25], heavy = 0.42 + (o.squint ?? 0) * 0.25;
  for (const e of [-1, 1]) { eye(e * 50, -100, 32, 28, look, 0, '#5a4128', e + 3); lid(e * 50, -100, 32, 28, Math.max(heavy, blink(e + 3)), PAL.turtleDark); }
  for (const e of [-1, 1]) { stroke([e * 22, -140 + (o.squint ?? 0) * 10, e * 84, -150 - (o.squint ?? 0) * 4], 9, '#d8d0c0'); }
  x.save(); x.strokeStyle = PAL.gold; x.lineWidth = 6; for (const e of [-1, 1]) { x.beginPath(); x.arc(e * 50, -92, 40, 0.1, PI - 0.1); x.stroke(); } stroke([-12, -84, 12, -84], 5, PAL.gold); x.restore();
  paint(E(-12, -52, 4, 3), OUT, { shade: false, lw: 0 }); paint(E(12, -52, 4, 3), OUT, { shade: false, lw: 0 });
  mouth(0, -26, 96, talk, PAL.turtleDark, o.sad ?? 0.25);
  qline(-96, -40, -86, -28, -74, -36, 3, shadeOf(PAL.turtle, 0.6)); qline(96, -40, 86, -28, 74, -36, 3, shadeOf(PAL.turtle, 0.6));
  // gavel hand
  if (o.gavel != null) {
    x.save(); x.translate(170, 200); x.rotate(o.gavel);
    paint(RR(-30, -170, 60, 180, 28), PAL.robe, { sh: [10, 0] }); paint(E(0, -180, 30, 28), PAL.turtle, { sh: [6, 6] });
    paint(RR(-8, -330, 16, 160, 6), PAL.woodLight, { sh: [4, 0], lw: 4 });
    paint(RR(-70, -380, 140, 62, 12), PAL.woodDark, { sh: [0, 10], hl: [-30, -370, 60] }); stroke([-70, -360, 70, -360], 4, PAL.gold); stroke([-70, -338, 70, -338], 4, PAL.gold);
    x.restore();
  }
  x.restore();
}

// FELIX FENNICK — fennec fox prosecutor. Origin: base of the neck.
function foxFelix(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s * (o.flip ? -1 : 1), s);
  const tw = Math.sin(T * 4.2) * 0.04 + talk * 0.05;
  // suit
  paint(() => { x.beginPath(); x.moveTo(-185, 470); x.lineTo(-180, 190); x.quadraticCurveTo(-170, 100, -70, 80); x.lineTo(70, 80); x.quadraticCurveTo(170, 100, 180, 190); x.lineTo(185, 470); x.closePath(); }, PAL.suit, { sh: [16, 0] });
  paint(P(-30, 80, 30, 80, 0, 190), PAL.white, { shade: false, lw: 4 });
  paint(P(-11, 92, 11, 92, 15, 200, 0, 230, -15, 200), PAL.tie, { sh: [4, 0], lw: 3.5 }); paint(P(-13, 82, 13, 82, 9, 100, -9, 100), PAL.tie, { shade: false, lw: 3.5 });
  paint(P(-70, 80, -30, 80, 0, 190, -40, 260, -95, 120), lightOf(PAL.suit, 0.12), { shade: false, lw: 4 }); paint(P(70, 80, 30, 80, 0, 190, 40, 260, 95, 120), lightOf(PAL.suit, 0.12), { shade: false, lw: 4 });
  paint(P(-150, 196, -100, 196, -112, 182, -138, 180), PAL.white, { shade: false, lw: 3 }); // pocket square
  // ears
  for (const e of [-1, 1]) {
    x.save(); x.translate(e * 72, -150); x.rotate(e * (0.3 + tw));
    paint(() => { x.beginPath(); x.moveTo(-58, 30); x.quadraticCurveTo(-48, -150, -8, -255); x.quadraticCurveTo(8, -265, 18, -248); x.quadraticCurveTo(64, -120, 58, 30); x.closePath(); }, PAL.fox, { sh: [10, 6] });
    paint(() => { x.beginPath(); x.moveTo(-34, 14); x.quadraticCurveTo(-26, -110, 2, -200); x.quadraticCurveTo(36, -100, 36, 14); x.closePath(); }, PAL.foxInner, { shade: false, lw: 3.5 });
    x.restore();
  }
  // head with cheek fluff
  paint(() => { x.beginPath(); x.moveTo(-120, -110); x.bezierCurveTo(-110, -190, 110, -190, 120, -110); x.lineTo(150, -60); x.lineTo(128, -54); x.lineTo(148, -18); x.lineTo(118, -16); x.bezierCurveTo(90, 30, 40, 48, 0, 50); x.bezierCurveTo(-40, 48, -90, 30, -118, -16); x.lineTo(-148, -18); x.lineTo(-128, -54); x.lineTo(-150, -60); x.closePath(); }, PAL.fox, { sh: [14, 12], hl: [-40, -140, 120] });
  paint(() => { x.beginPath(); x.moveTo(-86, -46); x.bezierCurveTo(-60, -80, 60, -80, 86, -46); x.bezierCurveTo(70, 10, 30, 40, 0, 42); x.bezierCurveTo(-30, 40, -70, 10, -86, -46); x.closePath(); }, PAL.foxCream, { sh: [8, 8] });
  paint(() => { x.beginPath(); x.moveTo(-18, -44); x.quadraticCurveTo(0, -54, 18, -44); x.quadraticCurveTo(12, -26, 0, -22); x.quadraticCurveTo(-12, -26, -18, -44); x.closePath(); }, '#1d1310', { shade: false, lw: 3 });
  paint(E(-6, -42, 5, 3), 'rgba(255,255,255,.7)', { shade: false, lw: 0 });
  const look = o.look ?? [0.35, 0.1];
  for (const e of [-1, 1]) { eye(e * 50, -100, 25, 29, look, 0, '#c7741c', e + 9); lid(e * 50, -100, 25, 29, blink(e + 9) || (o.smug ? 0.35 : 0.08), PAL.fox); stroke([e * 28, -142 - talk * 8, e * 72, -134 - talk * 4], 8, '#a8551f'); }
  mouth(0, -6, 52, talk, PAL.fox, -0.5);
  // pointing arm (to the viewer's right, away from the face)
  if (o.point != null) {
    const a = -0.35 + o.point * 0.25;
    x.save(); x.translate(160, 140); x.rotate(a);
    paint(RR(-34, -32, 220, 64, 30), PAL.suit, { sh: [0, 10] }); paint(RR(170, -30, 34, 60, 8), PAL.white, { sh: [0, 6], lw: 3.5 });
    paint(E(232, 0, 32, 28), PAL.fox, { sh: [6, 6] }); paint(RR(250, -14, 72, 24, 12), PAL.fox, { sh: [0, 5], lw: 4 });
    x.restore();
  }
  x.restore();
}

// DR. INGRID HERON — grey heron, expert witness. Origin: base of the neck.
function heronIngrid(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  // body in a tweed blazer
  const body = () => { x.beginPath(); x.moveTo(-215, 470); x.bezierCurveTo(-230, 280, -170, 110, -48, 76); x.lineTo(48, 76); x.bezierCurveTo(170, 110, 230, 280, 215, 470); x.closePath(); };
  paint(body, PAL.tweed, { sh: [18, 0] });
  x.save(); body(); x.clip(); for (let i = -12; i < 22; i++) stroke([-240 + i * 28, 60, -240 + i * 28 + 190, 480], 3, 'rgba(80,50,20,.13)'); x.restore();
  paint(P(-48, 76, 48, 76, 26, 250, -26, 250), PAL.white, { sh: [5, 0], lw: 4 });
  paint(P(-48, 76, -26, 250, -110, 330, -124, 130), lightOf(PAL.tweed, 0.12), { shade: false, lw: 4 }); paint(P(48, 76, 26, 250, 110, 330, 124, 130), lightOf(PAL.tweed, 0.12), { shade: false, lw: 4 });
  paint(RR(-150, 320, 70, 14, 6), PAL.white, { shade: false, lw: 3 });
  // a gentle S-shaped neck
  const neck = () => { x.beginPath(); x.moveTo(-38, 96); x.bezierCurveTo(-56, 20, 4, -40, -6, -110); x.bezierCurveTo(-12, -150, 0, -180, 18, -196); x.lineTo(70, -186); x.bezierCurveTo(52, -166, 44, -140, 48, -110); x.bezierCurveTo(56, -36, 6, 26, 38, 96); x.closePath(); };
  paint(neck, PAL.heron, { sh: [12, 0] });
  x.save(); neck(); x.clip(); x.fillStyle = PAL.white; x.beginPath(); x.moveTo(14, 96); x.bezierCurveTo(-6, 26, 40, -36, 34, -110); x.lineTo(54, -110); x.bezierCurveTo(60, -36, 18, 26, 40, 96); x.closePath(); x.fill(); for (let i = 0; i < 5; i++) stroke([40 - i * 2, -90 + i * 34, 40 - i * 2, -78 + i * 34], 5, '#3b3a40'); x.restore();
  neck(); x.lineWidth = 5; x.strokeStyle = OUT; x.stroke();
  // head, crest, beak
  const hy = 52;
  paint(() => { x.beginPath(); x.moveTo(-20, -278 + hy); x.quadraticCurveTo(-100, -300 + hy, -150, -268 + hy); x.quadraticCurveTo(-100, -286 + hy, -30, -262 + hy); x.closePath(); }, '#262428', { shade: false, lw: 3.5 });
  paint(E(40, -282 + hy, 62, 50, -0.1), PAL.white, { sh: [10, 10] }); paint(() => { x.beginPath(); x.moveTo(-14, -298 + hy); x.quadraticCurveTo(30, -336 + hy, 94, -300 + hy); x.quadraticCurveTo(40, -316 + hy, -6, -284 + hy); x.closePath(); }, '#262428', { shade: false, lw: 3.5 });
  const m = talk * 16;
  paint(() => { x.beginPath(); x.moveTo(94, -292 + hy); x.lineTo(300, -282 + hy - m * 0.3); x.lineTo(98, -268 + hy); x.closePath(); }, PAL.beak, { sh: [0, 6], lw: 4 });
  paint(() => { x.beginPath(); x.moveTo(96, -268 + hy); x.lineTo(292, -276 + hy + m); x.lineTo(94, -254 + hy + m * 0.4); x.closePath(); }, shadeOf(PAL.beak, 0.85), { shade: false, lw: 4 });
  eye(50, -288 + hy, 15, 15, [0.5, 0], 0, '#e5b52a', 21); lid(50, -288 + hy, 15, 15, blink(21), PAL.white);
  x.save(); x.strokeStyle = OUT; x.lineWidth = 5; x.beginPath(); x.arc(50, -288 + hy, 25, 0, TAU); x.stroke(); stroke([75, -290 + hy, 94, -292 + hy], 5); x.restore();
  // pointer wing
  if (o.pointer != null) { x.save(); x.translate(-150, 200); x.rotate(-0.55 - o.pointer); paint(RR(-30, -170, 60, 190, 28), PAL.tweed, { sh: [10, 0] }); paint(E(0, -176, 26, 22), PAL.heron, { sh: [5, 5] }); stroke([0, -180, 0, -420], 8, PAL.woodDark); paint(E(0, -425, 9, 9), PAL.red, { shade: false, lw: 3 }); x.restore(); }
  x.restore();
}

// DEFENDANT — anonymous member of the public, black bar over the eyes, phone glowing in hand. Origin: chin-ish.
const SKIN = ['#f1c7a4', '#d29a72', '#8d5b3b', '#f4d6bd', '#b47a52', '#e6b48e'], TOPS = ['#5d7a97', '#9bb08a', '#a9473f', '#d9a441', '#3d5a80', '#7d6a99', '#5f8f86'], HAIR = ['#2a1d16', '#6b4527', '#c9944a', '#151515', '#8e3a22', '#4d3a2c'];
function defendant(cx, cy, s, seed, k = 1, slump = 0) {
  if (k <= 0) return; x.save(); x.globalAlpha = Math.min(1, k * 1.5); x.translate(cx, cy + (1 - easeBack(k)) * 40 + slump * 16); x.scale(s, s); x.rotate(slump * (R(seed) - 0.5) * 0.25);
  const skin = SKIN[seed % SKIN.length], top = TOPS[(seed * 3) % TOPS.length], hair = HAIR[(seed * 5) % HAIR.length], style = seed % 5;
  paint(() => { x.beginPath(); x.moveTo(-100, 220); x.bezierCurveTo(-104, 120, -80, 74, 0, 70); x.bezierCurveTo(80, 74, 104, 120, 100, 220); x.closePath(); }, top, { sh: [12, 0] });
  paint(RR(-20, 40, 40, 40, 12), skin, { sh: [6, 0], lw: 4 });
  if (style === 2) paint(E(0, -10, 74, 84), hair, { sh: [10, 8] }); // long hair behind
  paint(E(0, -20, 60, 68), skin, { sh: [10, 10], hl: [-20, -50, 60] });
  paint(E(-60, -14, 12, 16), skin, { sh: [3, 3], lw: 4 }); paint(E(60, -14, 12, 16), skin, { sh: [3, 3], lw: 4 });
  if (style === 0) paint(() => { x.beginPath(); x.moveTo(-62, -30); x.bezierCurveTo(-66, -96, 66, -96, 62, -30); x.quadraticCurveTo(30, -60, -20, -56); x.quadraticCurveTo(-48, -50, -62, -30); x.closePath(); }, hair, { sh: [8, 8] });
  else if (style === 1) paint(() => { x.beginPath(); x.moveTo(-64, -24); x.bezierCurveTo(-74, -110, 74, -110, 64, -24); x.lineTo(54, -50); x.lineTo(34, -40); x.lineTo(14, -60); x.lineTo(-10, -42); x.lineTo(-34, -58); x.lineTo(-54, -40); x.closePath(); }, hair, { sh: [8, 8] });
  else if (style === 2) paint(() => { x.beginPath(); x.moveTo(-62, -20); x.bezierCurveTo(-70, -100, 70, -100, 62, -20); x.quadraticCurveTo(10, -66, -62, -20); x.closePath(); }, hair, { sh: [8, 8] });
  else if (style === 3) paint(() => { x.beginPath(); x.moveTo(-66, -40); x.bezierCurveTo(-60, -100, 60, -100, 66, -40); x.lineTo(84, -34); x.lineTo(-30, -42); x.closePath(); }, top, { sh: [8, 6] }); // cap
  else { for (let i = 0; i < 9; i++) paint(E(-48 + i * 12, -66 + Math.abs(i - 4) * 4, 16, 16), hair, { shade: false, lw: 3 }); }
  x.save(); x.rotate(-0.03); paint(RR(-70, -42, 140, 32, 4), '#121212', { shade: false, lw: 0 }); x.restore();
  qline(-16, 20 + slump * 4, 0, 26 - slump * 10, 16, 20 + slump * 4, 4);
  paint(RR(-30, 110, 60, 96, 10), '#20242c', { shade: false, lw: 4 }); x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(110,170,255,.35)'; x.fillRect(-23, 118, 46, 78); const g = x.createRadialGradient(0, 40, 0, 0, 40, 120); g.addColorStop(0, 'rgba(110,170,255,.18)'); g.addColorStop(1, 'rgba(110,170,255,0)'); x.fillStyle = g; x.fillRect(-120, -80, 240, 240); x.restore();
  paint(E(-36, 196, 18, 16), skin, { sh: [4, 4], lw: 4 }); paint(E(36, 196, 18, 16), skin, { sh: [4, 4], lw: 4 });
  x.restore();
}

// ---------- props ----------
function phone(cx, cy, w, h) {
  paint(RR(cx - w / 2, cy - h / 2, w, h, 56), '#1f2229', { sh: [14, 14], lw: 6 });
  paint(RR(cx - w / 2 + 20, cy - h / 2 + 20, w - 40, h - 40, 40), '#f7f3ea', { shade: false, lw: 3 });
  paint(RR(cx - 60, cy - h / 2 + 34, 120, 26, 13), '#1f2229', { shade: false, lw: 0 });
  return { x0: cx - w / 2 + 20, y0: cy - h / 2 + 20, x1: cx + w / 2 - 20, y1: cy + h / 2 - 20 };
}
function avatar(cx, cy, r, seed) { paint(E(cx, cy, r, r), TOPS[seed % TOPS.length], { shade: false, lw: 3 }); paint(E(cx, cy - r * 0.15, r * 0.42, r * 0.42), SKIN[seed % SKIN.length], { shade: false, lw: 0 }); }
function bubble(x0, y0, w, lines, mine, a = 1, k = 1, font = '500 42px Inter', lh = 52, col) {
  if (a <= 0) return; x.font = font; const h = lines.length * lh + 36, sc = 0.7 + 0.3 * easeBack(k);
  x.save(); x.globalAlpha = a; x.translate(x0 + (mine ? w : 0), y0 + h); x.scale(sc, sc); x.translate(-(mine ? w : 0), -h);
  paint(() => { x.beginPath(); x.roundRect(0, 0, w, h, 30); }, col ?? (mine ? '#3a7bd5' : '#ffffff'), { shade: false, lw: 4 });
  lines.forEach((l, i) => txt(l, 28, 36 + i * lh - 8, font, mine ? '#fff' : PAL.ink, 1, 'left'));
  x.restore();
}
