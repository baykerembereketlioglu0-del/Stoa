// THE COURT OF SMALL CRIMES — "courtroom sketch artist" engine.
// Pastel on toned paper: shapes get a slightly off-register pastel fill, diagonal hatching and a charcoal outline
// that "boils" (redraws with new jitter) 8 times a second, like hand-drawn animation.
const cv = document.getElementById('c'); let x = cv.getContext('2d');
const W = 1080, H = 1920, PI = Math.PI, TAU = PI * 2;
const cl = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, v) => { if (a === b) return v >= b ? 1 : 0; const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const win = (t, a, b, fi = 0.3, fo = 0.3) => ss(a - fi, a, t) * (1 - ss(b, b + fo, t));
const R = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const easeBack = k => { const c = 1.7; k = cl(k, 0, 1); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const easeOut = k => 1 - Math.pow(1 - cl(k, 0, 1), 3);
x.lineJoin = 'round'; x.lineCap = 'round';

// palette: pastel sticks on warm grey paper
const PAL = {
  paper: '#d9cfbf', paper2: '#cfc3b0', ink: '#2a2420', charcoal: '#3a332d', cream: '#f4ead8', white: '#fbf6ec',
  oxblood: '#8c3a33', red: '#c2413a', mustard: '#d9a441', navy: '#34496a', slate: '#5e7690', sage: '#8fa27e', olive: '#7d8a4e',
  fox: '#d9874a', foxLight: '#f0c79a', pink: '#e7a3a0', wood: '#7a5134', woodDark: '#4e3322', tweed: '#9b7a4a', heron: '#8ea0b4', beak: '#e0b440', robe: '#262224',
};
let T = 0, BOIL = 0; // set every frame
const J = (seed, amp) => (R(seed * 3.17 + BOIL * 13.73) - 0.5) * 2 * amp; // per-boil jitter

// ---------- paper ----------
let sd = 5; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const PAPER = (() => {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  const d = g.getImageData(0, 0, W, H);
  for (let i = 0; i < d.data.length; i += 4) { const n = (rng() - 0.5) * 22, f = (rng() < 0.02 ? -18 : 0); d.data[i] += n + f; d.data[i + 1] += n + f; d.data[i + 2] += n * 0.9 + f; }
  g.putImageData(d, 0, 0);
  g.globalAlpha = 0.05; g.strokeStyle = '#6a5a48'; for (let i = 0; i < 900; i++) { const px = rng() * W, py = rng() * H, a = rng() * TAU, l = 4 + rng() * 14; g.lineWidth = 0.6; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); } // fibres
  return c;
})();
const GRAIN = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), d = g.createImageData(540, 960); for (let i = 0; i < d.data.length; i += 4) { const v = rng() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; } g.putImageData(d, 0, 0); return c; });
function paper() { x.drawImage(PAPER, 0, 0); }

// ---------- sketch primitives ----------
// smooth closed (or open) curve through points, with per-boil jitter
function curve(pts, closed, jit, seed, sharp = false) {
  const n = pts.length / 2;
  if (sharp) { x.beginPath(); for (let i = 0; i < n; i++) { const px = pts[i * 2] + J(seed + i, jit), py = pts[i * 2 + 1] + J(seed + i + 50, jit); i ? x.lineTo(px, py) : x.moveTo(px, py); } if (closed) x.closePath(); return; }
  const P = i => { const k = closed ? ((i % n) + n) % n : cl(i, 0, n - 1); return [pts[k * 2] + J(seed + k, jit), pts[k * 2 + 1] + J(seed + k + 50, jit)]; };
  x.beginPath(); const [sx, sy] = P(0); x.moveTo(sx, sy);
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); x.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
  if (closed) x.closePath();
}
function ellPts(cx, cy, rx, ry, n = 14, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, px = Math.cos(a) * rx, py = Math.sin(a) * ry; p.push(cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)); } return p; }
// pastel shape: off-register fill + hatching + boiling charcoal outline
function shape(pts, o = {}) {
  const seed = o.seed ?? (pts[0] * 0.37 + pts[1] * 0.11), jit = o.jit ?? 2.2, sh = o.sharp ?? (pts.length <= 16);
  if (o.fill) {
    x.save(); x.globalAlpha = o.fillA ?? 0.92; x.fillStyle = o.fill; x.translate(J(seed + 7, 3), J(seed + 9, 3)); curve(pts, true, jit * 0.6, seed + 100, sh); x.fill(); x.restore();
    if (o.hatch !== false) {
      x.save(); curve(pts, true, 0, seed + 100, sh); x.clip();
      let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9; for (let i = 0; i < pts.length; i += 2) { mnx = Math.min(mnx, pts[i]); mxx = Math.max(mxx, pts[i]); mny = Math.min(mny, pts[i + 1]); mxy = Math.max(mxy, pts[i + 1]); }
      x.strokeStyle = o.hatchCol ?? 'rgba(40,30,25,.22)'; x.lineWidth = o.hatchW ?? 2.2; const sp = o.hatchSp ?? 13, hh = mxy - mny, slope = 0.55;
      x.beginPath();
      for (let k = 0, i = 0; k < (mxx - mnx) + hh * slope; k += sp, i++) {
        if (o.hatchSparse && i % 3 === 0) continue;
        const f0 = 0.15 + 0.35 * R(i * 3 + seed), f1 = Math.min(1, f0 + 0.35 + 0.5 * R(i * 7 + seed)); // each stroke covers part of the shape, darker side lower-right
        const ax = mnx + k, ay = mny; x.moveTo(ax - hh * slope * f0 + J(seed + i, 2), ay + hh * f0 + J(seed + i + 3, 2)); x.lineTo(ax - hh * slope * f1 + J(seed + i + 5, 2), ay + hh * f1 + J(seed + i + 7, 2));
      }
      x.stroke(); x.restore();
    }
    if (o.light) { x.save(); curve(pts, true, 0, seed + 100, sh); x.clip(); const [lx, ly, lr] = o.light; const g = x.createRadialGradient(lx, ly, 0, lx, ly, lr); g.addColorStop(0, 'rgba(255,248,232,.55)'); g.addColorStop(1, 'rgba(255,248,232,0)'); x.fillStyle = g; x.fillRect(lx - lr, ly - lr, lr * 2, lr * 2); x.restore(); }
  }
  if (o.line !== false) { x.strokeStyle = o.lineCol ?? PAL.ink; for (let p = 0; p < (o.passes ?? 2); p++) { x.lineWidth = (o.lw ?? 4) * (p ? 0.55 : 1); curve(pts, o.open ? false : true, jit * (p ? 1.6 : 1), seed + p * 31, sh); x.stroke(); } }
}
function sk(pts, lw = 4, col = PAL.ink, seed = 1, jit = 2) { x.strokeStyle = col; for (let p = 0; p < 2; p++) { x.lineWidth = lw * (p ? 0.55 : 1); curve(pts, false, jit * (p ? 1.5 : 1), seed + p * 17); x.stroke(); } }
function blob(cx, cy, rx, ry, o = {}) { shape(ellPts(cx, cy, rx, ry, o.n ?? 14, o.rot ?? 0), o); }
function scribble(cx, cy, w, h, col, a = 0.5, seed = 1, n = 18) { x.save(); x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); for (let i = 0; i < n; i++) { const px = cx + (R(i + seed) - 0.5) * w + J(seed + i, 3), py = cy + (R(i * 3 + seed) - 0.5) * h + J(seed + i + 9, 3); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.restore(); }
function txt(s, px, py, font, col, a = 1, align = 'center', ls = 0, rot = 0) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.translate(px, py); x.rotate(rot); x.font = font; x.letterSpacing = ls + 'px'; x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, 0, 0); x.restore(); }

// red rubber stamp
function stamp(s, cx, cy, size, k, rot = -0.12, col = PAL.red) {
  if (k <= 0) return; const sc = 1 + 1.6 * (1 - easeOut(k)), a = Math.min(1, k * 3);
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc); x.globalAlpha = a * 0.92;
  x.font = `${size}px "Bebas Neue"`; x.letterSpacing = size * 0.06 + 'px'; const w = x.measureText(s).width + size * 0.5, h = size * 1.15;
  x.strokeStyle = col; x.lineWidth = size * 0.07; x.strokeRect(-w / 2, -h / 2, w, h); x.lineWidth = size * 0.025; x.strokeRect(-w / 2 + size * 0.1, -h / 2 + size * 0.1, w - size * 0.2, h - size * 0.2);
  x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, size * 0.03, size * 0.06);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { x.globalAlpha = 0.5; x.fillRect((R(i * 7 + size) - 0.5) * w, (R(i * 3 + size) - 0.5) * h, 3 + R(i) * 6, 2 + R(i + 1) * 4); } // worn ink
  x.restore();
}

// ---------- the cast ----------
// talk: 0..1 mouth openness. Each character is drawn around (cx, cy) at scale s.
function judgeAgatha(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  // robe + jabot
  shape([-230, 260, -200, 120, -110, 60, 110, 60, 200, 120, 230, 260, 230, 420, -230, 420], { fill: PAL.robe, hatchCol: 'rgba(255,255,255,.07)', seed: 11 });
  shape([-40, 70, 40, 70, 30, 150, 0, 175, -30, 150], { fill: PAL.white, hatch: false, seed: 12 });
  sk([-20, 95, 20, 95], 3, PAL.charcoal, 13); sk([-20, 118, 20, 118], 3, PAL.charcoal, 14);
  // wrinkled tortoise neck
  shape([-62, 75, -55, -10, 55, -10, 62, 75], { fill: PAL.olive, seed: 15, hatchSp: 9 });
  for (let i = 0; i < 4; i++) sk([-40, 10 + i * 16, -10, 16 + i * 16, 20, 12 + i * 16, 42, 18 + i * 16], 2.4, PAL.charcoal, 16 + i);
  // head
  shape(ellPts(0, -80, 118, 96, 16), { fill: PAL.olive, seed: 21, light: [-40, -130, 120] });
  // barrister wig: rows of curls
  for (let r = 0; r < 3; r++) for (let i = -3; i <= 3; i++) blob(i * 34 + (r % 2) * 17, -168 + r * 14 - Math.abs(i) * 4, 22, 17, { fill: PAL.white, seed: 30 + r * 10 + i, hatchSp: 8, lw: 3 });
  for (const sd2 of [-1, 1]) for (let k = 0; k < 4; k++) blob(sd2 * (120 + (k % 2) * 8), -120 + k * 34, 22, 18, { fill: PAL.white, seed: 60 + k + sd2 * 5, hatchSp: 8, lw: 3 });
  // eyes: heavy lids, half-moon glasses
  for (const e of [-1, 1]) { blob(e * 42, -92, 20, 14, { fill: PAL.cream, hatch: false, seed: 70 + e, lw: 3 }); blob(e * 42 + 2, -88, 7, 7, { fill: PAL.ink, hatch: false, seed: 72 + e, line: false }); sk([e * 42 - 24, -96 - (o.squint ?? 0) * 6, e * 42 + 22, -98 - (o.squint ?? 0) * 6], 4, PAL.charcoal, 74 + e); x.save(); x.strokeStyle = PAL.mustard; x.lineWidth = 5; x.beginPath(); x.arc(e * 42, -84, 28, 0.05, PI - 0.05); x.stroke(); x.restore(); }
  sk([-14, -86, 14, -86], 3, PAL.mustard, 79);
  // beak-mouth
  const m = 6 + talk * 26; shape([-50, -38, 0, -34, 50, -38, 30, -38 + m, 0, -32 + m, -30, -38 + m], { fill: talk > 0.1 ? '#5a2a26' : PAL.olive, hatch: false, seed: 80, lw: 3.5 });
  sk([-62, -40, -50, -38], 3, PAL.charcoal, 81); sk([50, -38, 62, -40], 3, PAL.charcoal, 82);
  if (o.gavel != null) { // arm + gavel (angle in radians: raised -> struck)
    x.save(); x.translate(150, 170); x.rotate(o.gavel);
    shape([-24, 0, 24, 0, 18, -150, -18, -150], { fill: PAL.robe, seed: 90, hatchCol: 'rgba(255,255,255,.07)' });
    blob(0, -160, 24, 22, { fill: PAL.olive, seed: 91 });
    shape([-8, -150, 8, -150, 8, -260, -8, -260], { fill: PAL.wood, seed: 92, lw: 3 });
    shape([-55, -255, 55, -255, 55, -300, -55, -300], { fill: PAL.woodDark, seed: 93 });
    x.restore();
  }
  x.restore();
}
function foxFelix(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s * (o.flip ? -1 : 1), s);
  // suit
  shape([-170, 400, -160, 170, -90, 95, 90, 95, 160, 170, 170, 400], { fill: PAL.navy, seed: 101, hatchCol: 'rgba(255,255,255,.08)' });
  shape([-30, 95, 30, 95, 18, 200, 0, 230, -18, 200], { fill: PAL.white, hatch: false, seed: 102 });
  shape([-11, 105, 11, 105, 14, 220, 0, 245, -14, 220], { fill: PAL.red, seed: 103, hatch: false, lw: 3 });
  // ears (twitch)
  const tw = Math.sin(T * 5) * 0.05 + (talk > 0.5 ? 0.06 : 0);
  for (const e of [-1, 1]) { x.save(); x.translate(e * 70, -120); x.rotate(e * (0.28 + tw)); shape([-62, 20, 0, -230, 62, 20], { fill: PAL.fox, seed: 110 + e }); shape([-34, 10, 0, -160, 34, 10], { fill: PAL.pink, seed: 112 + e, hatch: false, lw: 2.5 }); x.restore(); }
  // head + muzzle
  shape([-120, -110, -90, -150, 0, -165, 90, -150, 120, -110, 110, -20, 40, 50, 0, 70, -40, 50, -110, -20], { fill: PAL.fox, seed: 120, light: [-40, -120, 140] });
  shape([-70, -10, 0, -30, 70, -10, 40, 50, 0, 72, -40, 50], { fill: PAL.foxLight, seed: 121, hatch: false, lw: 3 });
  blob(0, -5, 20, 14, { fill: PAL.ink, seed: 122, hatch: false, lw: 3 }); // nose
  for (const e of [-1, 1]) { blob(e * 48, -70, 22, 24, { fill: PAL.cream, hatch: false, seed: 123 + e, lw: 3 }); blob(e * 48 + 4, -66, 10, 12, { fill: PAL.ink, hatch: false, seed: 125 + e, line: false }); sk([e * 48 - 26, -104 - talk * 6, e * 48 + 22, -98 - talk * 8], 4, PAL.charcoal, 127 + e); }
  const m = 4 + talk * 30; shape([-30, 28, 0, 34, 30, 28, 18, 30 + m, 0, 34 + m, -18, 30 + m], { fill: talk > 0.1 ? '#5a2a26' : PAL.foxLight, hatch: false, seed: 130, lw: 3 });
  // pointing arm
  if (o.point != null) { x.save(); x.translate(130, 160); x.rotate(-0.9 + o.point * 0.5); shape([-26, 0, 26, 0, 22, -160, -22, -160], { fill: PAL.navy, seed: 140, hatchCol: 'rgba(255,255,255,.08)' }); blob(0, -175, 26, 24, { fill: PAL.foxLight, seed: 141 }); shape([-6, -190, 6, -190, 4, -235, -4, -235], { fill: PAL.foxLight, seed: 142, hatch: false, lw: 3 }); x.restore(); }
  x.restore();
}
function heronIngrid(cx, cy, s, talk = 0, o = {}) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  shape([-150, 400, -140, 180, -70, 110, 70, 110, 140, 180, 150, 400], { fill: PAL.tweed, seed: 201, hatchSp: 9, hatchCol: 'rgba(60,40,20,.3)' });
  shape([-28, 110, 28, 110, 16, 230, -16, 230], { fill: PAL.cream, hatch: false, seed: 202 });
  // long neck in an S
  shape([-34, 120, 26, 120, 40, 20, 10, -80, 34, -150, -6, -160, -36, -80, -10, 20], { fill: PAL.heron, seed: 203 });
  // head + crest + beak
  shape(ellPts(10, -190, 62, 52, 14), { fill: PAL.heron, seed: 204, light: [-10, -215, 70] });
  shape([-30, -220, -120, -250, -40, -205], { fill: PAL.ink, seed: 205, hatch: false, lw: 3 });
  const m = talk * 22; shape([55, -205, 250, -190 - m * 0.2, 60, -185], { fill: PAL.beak, seed: 206, hatch: false, lw: 3.5 }); shape([55, -185, 245, -182 + m * 0.4, 60, -170 + m * 0.6], { fill: '#c99530', seed: 207, hatch: false, lw: 3 });
  blob(20, -200, 13, 13, { fill: PAL.cream, hatch: false, seed: 208, lw: 3 }); blob(22, -199, 6, 6, { fill: PAL.ink, hatch: false, seed: 209, line: false });
  x.save(); x.strokeStyle = PAL.ink; x.lineWidth = 4; x.beginPath(); x.arc(20, -200, 22, 0, TAU); x.stroke(); x.restore(); sk([42, -200, 56, -204], 3, PAL.ink, 210);
  if (o.pointer) { x.save(); x.translate(110, 230); x.rotate(-1.1 + o.pointer); shape([-24, 0, 24, 0, 20, -150, -20, -150], { fill: PAL.tweed, seed: 211, hatchSp: 9 }); sk([0, -150, 0, -330], 6, PAL.woodDark, 212); x.restore(); }
  x.restore();
}
// a defendant: anonymous person in the dock with a black censor bar over the eyes, holding a glowing phone
function defendant(cx, cy, s, seed, k = 1, slump = 0) {
  if (k <= 0) return; x.save(); x.globalAlpha = k; x.translate(cx, cy + slump * 18); x.scale(s, s); x.rotate((R(seed) - 0.5) * 0.08 + slump * (R(seed + 4) - 0.5) * 0.2);
  const skin = ['#e8c0a0', '#c98e66', '#8a5a3c', '#f0d2b4', '#b07a52'][seed % 5], top = [PAL.slate, PAL.sage, PAL.oxblood, PAL.mustard, PAL.navy, '#7a6a8a'][seed % 6], hair = ['#2a2018', '#6a4a2a', '#c99a50', '#1a1a1a', '#8a3a20'][(seed * 7) % 5];
  shape([-80, 170, -70, 70, 0, 50, 70, 70, 80, 170], { fill: top, seed: seed * 11, lw: 3 });
  blob(0, -10, 50, 58, { fill: skin, seed: seed * 11 + 1, lw: 3, hatchSp: 10 });
  const hs = seed % 4; if (hs === 0) shape([-52, -20, -45, -70, 0, -78, 45, -70, 52, -20, 38, -45, -38, -45], { fill: hair, seed: seed * 11 + 2, lw: 3 }); else if (hs === 1) blob(0, -55, 54, 30, { fill: hair, seed: seed * 11 + 2, lw: 3 }); else if (hs === 2) { blob(0, -50, 56, 32, { fill: hair, seed: seed * 11 + 2, lw: 3 }); shape([-56, -40, -64, 40, -40, 10], { fill: hair, seed: seed * 11 + 3, lw: 3 }); shape([56, -40, 64, 40, 40, 10], { fill: hair, seed: seed * 11 + 4, lw: 3 }); } else shape([-50, -30, -40, -75, 40, -75, 50, -30], { fill: hair, seed: seed * 11 + 2, lw: 3 });
  x.save(); x.rotate(-0.04); x.fillStyle = '#111'; x.fillRect(-58, -26, 116, 26); x.restore(); // censor bar
  sk([-14, 28, 0, 32 + slump * 3, 14, 28], 3, PAL.ink, seed * 11 + 5);
  shape([-26, 90, 26, 90, 26, 150, -26, 150], { fill: '#1d2430', seed: seed * 11 + 6, hatch: false, lw: 3 }); x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(120,170,255,.35)'; x.fillRect(-20, 96, 40, 48); x.restore();
  x.restore();
}
function bench(cx, cy, w, h) { // the judge's bench
  shape([cx - w / 2, cy, cx + w / 2, cy, cx + w / 2, cy + h, cx - w / 2, cy + h], { fill: PAL.wood, seed: 301, hatchCol: 'rgba(40,20,10,.25)', hatchSp: 10 });
  for (let i = 1; i < 4; i++) sk([cx - w / 2 + i * w / 4, cy + 20, cx - w / 2 + i * w / 4, cy + h - 10], 3, PAL.woodDark, 302 + i);
  blob(cx, cy + h * 0.5, 64, 64, { fill: PAL.mustard, seed: 310, lw: 4 }); txt('⚖', cx, cy + h * 0.5 + 4, '64px serif', PAL.woodDark, 0.8);
  shape([cx - w / 2 - 20, cy - 26, cx + w / 2 + 20, cy - 26, cx + w / 2 + 20, cy, cx - w / 2 - 20, cy], { fill: PAL.woodDark, seed: 311, hatch: false });
}
function courtBack(t, col = PAL.paper2) { // panelled wall, very loose
  x.save(); x.globalAlpha = 0.45; for (let i = 0; i < 6; i++) { shape([i * 190 - 20, 120, i * 190 + 150, 120, i * 190 + 150, 1100, i * 190 - 20, 1100], { fill: col, seed: 400 + i, hatchSparse: true, lineCol: 'rgba(60,45,35,.5)', lw: 3 }); } x.restore();
  scribble(540, 980, 1000, 60, PAL.woodDark, 0.25, 410, 30);
}
function phone(cx, cy, w, h, s = 1) { // a big sketched phone; returns the screen rect
  shape([cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2], { fill: '#26282e', seed: 501, hatch: false, lw: 6, jit: 2.5 });
  shape([cx - w / 2 + 22, cy - h / 2 + 50, cx + w / 2 - 22, cy - h / 2 + 50, cx + w / 2 - 22, cy + h / 2 - 50, cx - w / 2 + 22, cy + h / 2 - 50], { fill: PAL.cream, seed: 502, hatch: false, lw: 3 });
  return { x0: cx - w / 2 + 22, y0: cy - h / 2 + 50, x1: cx + w / 2 - 22, y1: cy + h / 2 - 50 };
}
function bubble(x0, y0, w, lines, mine, a = 1, k = 1, seed = 1, font = '40px "Special Elite"', lh = 50) {
  if (a <= 0) return; const h = lines.length * lh + 34, sc = 0.6 + 0.4 * easeBack(k);
  x.save(); x.globalAlpha = a; x.translate(x0 + (mine ? w : 0), y0); x.scale(sc, sc); x.translate(-(mine ? w : 0), 0);
  shape([0, 0, w, 0, w, h, mine ? w - 10 : 40, h, mine ? w + 20 : -20, h + 26, mine ? w - 50 : 10, h, 0, h], { fill: mine ? '#b9d4a6' : PAL.white, seed, hatch: false, lw: 3.5 });
  lines.forEach((l, i) => txt(l, 24, 36 + i * lh, font, PAL.ink, 1, 'left'));
  x.restore();
}
