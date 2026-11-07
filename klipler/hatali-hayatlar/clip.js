// "Hatalı Hayatlar" — music video. Every frame is drawn with canvas code and locked to the song's beat grid.
// Uses the STOA engine (glow, flame, embers, smoke, landscape, person, cam …) from bolumler/02-inner-citadel/engine.js
const M = window.MUSIC, DUR = M.duration, BEAT = 60 / M.bpm, B0 = M.beats[0];
window.DURATION = DUR;
const snapB = t => B0 + Math.round((t - B0) / BEAT) * BEAT;
const SEC = [
  ['intro', 0], ['verse1', 14.0], ['dip', 28.4], ['build', 38.0], ['drop1', 44.0], ['verse2', 62.0], ['drop2', 74.5],
  ['break', 92.0], ['rise', 98.0], ['calm', 122.0], ['final', 136.0], ['outro', 152.5],
].map(([n, a], i, arr) => ({ n, a: i ? snapB(a) : 0, b: 0 }));
SEC.forEach((s, i) => s.b = i < SEC.length - 1 ? SEC[i + 1].a : DUR);
const secAt = t => SEC.find(s => t >= s.a && t < s.b) || SEC[SEC.length - 1];
const DROPS = ['drop1', 'drop2', 'rise', 'final'];

// ---------- music signals ----------
function pulse(list, t, decay, win = 1.2) { let p = 0; for (let i = lowerIdx(list, t - win); i < list.length && list[i] <= t; i++) p = Math.max(p, Math.exp(-(t - list[i]) * decay)); return p; }
function lowerIdx(a, v) { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; } return lo; }
const kickP = t => pulse(M.kicks, t, 7), beatP = t => pulse(M.beats, t, 9);
function energy(t) { const i = t * 10, a = M.env[Math.floor(i)] ?? 0, b = M.env[Math.ceil(i)] ?? 0; return cl(lerp(a, b, i - Math.floor(i)) / 0.58, 0, 1); }
const lastKick = t => { const i = lowerIdx(M.kicks, t) - 1; return i >= 0 ? M.kicks[i] : -9; };
const beatIndex = (t, a) => Math.floor((t - a) / BEAT + 1e-6);

// ---------- the knight (front view) ----------
// units: 100 = height, feet at (0,0). o: walk, sword ('down'|'up'|'plant'|'slash'|'none'), slash (0..1), spread (cloak 0..1), glow, kneel, back, mask
function featherShape(bx, by, ang, len, w) { const tx = bx + Math.cos(ang) * len, ty = by + Math.sin(ang) * len, nx = -Math.sin(ang) * w, ny = Math.cos(ang) * w; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo((bx + tx) / 2 + nx, (by + ty) / 2 + ny, tx, ty); x.quadraticCurveTo((bx + tx) / 2 - nx * 0.7, (by + ty) / 2 - ny * 0.7, bx, by); x.fill(); }
// a great mantle of black feathers that falls from the shoulders and opens like wings (spread 0..1)
function featherCloak(o, t, mask) {
  const sp = o.spread ?? 0.3, wd = o.wind ?? t * 1.4, wa = o.windAmp ?? 1, kn = o.kneel ? 8 : 0;
  for (const side of [-1, 1]) {
    const lift = sp * 34, outX = 30 + sp * 70, botY = -2 - sp * 10 + kn, fl = Math.sin(wd + side * 0.8) * 4 * wa, fl2 = Math.sin(wd * 1.6 + side) * 3 * wa;
    const P0 = [side * 11, -86], C1 = [side * (26 + sp * 36), -98 - lift], C2 = [side * (outX + 8) + fl, -64 - lift * 0.5], P1 = [side * outX + fl2, botY];
    const bez = k => { const u = 1 - k; return [u * u * u * P0[0] + 3 * u * u * k * C1[0] + 3 * u * k * k * C2[0] + k * k * k * P1[0], u * u * u * P0[1] + 3 * u * u * k * C1[1] + 3 * u * k * k * C2[1] + k * k * k * P1[1]]; };
    x.fillStyle = mask ? '#fff' : '#050303';
    x.beginPath(); x.moveTo(P0[0], P0[1]); x.bezierCurveTo(C1[0], C1[1], C2[0], C2[1], P1[0], P1[1]); x.quadraticCurveTo(side * (outX * 0.5), botY + 6 + fl2, side * 4, -4 + kn); x.lineTo(side * 4, -80); x.closePath(); x.fill();
    // fringe of feathers along the outer edge and the hem
    for (let i = 0; i < 18; i++) { const k = 0.12 + i / 17 * 0.88, [px, py] = bez(k), ang = side > 0 ? -0.3 + k * 1.6 : PI + 0.3 - k * 1.6; x.fillStyle = mask ? '#fff' : (i % 3 ? '#060404' : '#0c0806'); featherShape(px - side * 6, py, ang + Math.sin(wd * 2 + i) * 0.12 * wa, 16 + k * 16 + sp * 8, 4 + k * 2); }
    for (let i = 0; i < 6; i++) { const k = i / 5, px = lerp(side * outX + fl2, side * 6, k), py = lerp(botY, -3 + kn, k) + 4 * Math.sin(k * PI); x.fillStyle = mask ? '#fff' : '#060404'; featherShape(px, py - 8, PI / 2 + side * (0.5 - k * 0.4) + Math.sin(wd * 2.2 + i) * 0.1 * wa, 12 + 6 * R(i + side), 7); }
    if (!mask) { // inner feather texture, catching a little firelight
      x.save(); x.beginPath(); x.moveTo(P0[0], P0[1]); x.bezierCurveTo(C1[0], C1[1], C2[0], C2[1], P1[0], P1[1]); x.lineTo(side * 4, -4 + kn); x.lineTo(side * 4, -80); x.closePath(); x.clip();
      x.strokeStyle = 'rgba(255,130,60,.09)'; x.lineWidth = 0.6;
      for (let r = 0; r < 9; r++) for (let i = 0; i < 9; i++) { const k = (i + 0.5) / 9, [px, py] = bez(k), ix = lerp(side * 8, px, 0.15 + r * 0.1), iy = lerp(-78 + r * 7, py, 0.15 + r * 0.1); x.beginPath(); x.moveTo(ix, iy); x.quadraticCurveTo(ix + side * 3, iy + 4, ix + side * 1, iy + 9); x.stroke(); }
      x.restore();
    }
  }
}
function knight(cx, base, h, t, o = {}) {
  const u = h / 100, mask = !!o.mask, P = mask ? '#fff' : '#261c15', D = mask ? '#fff' : '#18120e', BR = a => mask ? '#fff' : `rgba(196,138,64,${a})`;
  const wk = o.walk ?? null, sw = wk === null ? 0 : Math.sin(wk), br = 1 + 0.008 * Math.sin(t * 1.6);
  x.save(); x.translate(cx, base); x.scale(u, u);
  if (!o.back) featherCloak(o, t, mask);
  x.fillStyle = P;
  // legs (kneeling: one knee down)
  if (o.kneel) {
    capsule(-6, -34, -10, -14, 10, 8); capsule(-10, -14, -8, -2, 8, 6); ell(-8, -1, 6, 2.6); x.fill();
    capsule(6, -34, 14, -14, 10, 8); capsule(14, -14, 22, -2, 8, 6);
  } else for (const s of [-1, 1]) {
    const lift = Math.max(0, s * sw) * 4, hx = s * 6;
    capsule(hx, -48, hx + s * 0.8, -26 - lift * 0.6, 10.5, 8.5); capsule(hx + s * 0.8, -26 - lift * 0.6, hx + s * 0.4, -4 - lift, 8.2, 6.5);
    x.beginPath(); x.ellipse(hx + s * 1.5, -1.6 - lift, 6.2, 2.8, 0, 0, TAU); x.fill(); // sabaton
    if (!mask) { x.strokeStyle = BR(0.35); x.lineWidth = 0.6; x.beginPath(); x.arc(hx + s * 0.8, -26 - lift * 0.6, 4, 0, TAU); x.stroke(); } // knee cop
  }
  const y0 = o.kneel ? 14 : 0;
  x.save(); x.translate(0, y0); x.translate(0, -50); x.scale(1, br); x.translate(0, 50);
  // faulds + tassets
  x.fillStyle = D; poly([-13, -57, 13, -57, 15, -40, 8, -37, 0, -40, -8, -37, -15, -40]); x.fill();
  if (!mask) { x.strokeStyle = BR(0.4); x.lineWidth = 0.6; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(-13.5 - k * 0.5, -53 + k * 4.5); x.lineTo(13.5 + k * 0.5, -53 + k * 4.5); x.stroke(); } }
  // breastplate
  x.fillStyle = P; x.beginPath(); x.moveTo(-11, -56); x.bezierCurveTo(-16, -66, -16, -76, -13, -82); x.quadraticCurveTo(0, -86, 13, -82); x.bezierCurveTo(16, -76, 16, -66, 11, -56); x.closePath(); x.fill();
  if (!mask) {
    const sh = x.createRadialGradient(-3, -76, 1, 0, -70, 18); sh.addColorStop(0, 'rgba(150,100,60,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sh; x.beginPath(); x.moveTo(-11, -56); x.bezierCurveTo(-16, -66, -16, -76, -13, -82); x.quadraticCurveTo(0, -86, 13, -82); x.bezierCurveTo(16, -76, 16, -66, 11, -56); x.closePath(); x.fill();
    x.strokeStyle = BR(0.4); x.lineWidth = 0.55; x.beginPath(); x.moveTo(0, -83); x.lineTo(0, -57); x.stroke();
    x.strokeStyle = BR(0.35); x.beginPath(); x.moveTo(-10, -76); x.quadraticCurveTo(0, -70, 10, -76); x.stroke(); x.beginPath(); x.moveTo(-9, -68); x.quadraticCurveTo(0, -63, 9, -68); x.stroke();
    x.beginPath(); x.arc(0, -72, 3.2, 0, TAU); x.stroke(); x.fillStyle = BR(0.25); x.fill(); // sigil
    x.fillStyle = BR(0.5); x.fillRect(-12, -57.5, 24, 1.6); // belt
  }
  // pauldrons
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { x.fillStyle = k === 0 ? P : D; x.beginPath(); x.ellipse(s * (16 + k * 1.2), -80 + k * 4.2, 9 - k * 1.2, 5.6 - k * 0.6, s * 0.35, 0, TAU); x.fill(); if (!mask) { x.strokeStyle = BR(0.45 - k * 0.1); x.lineWidth = 0.6; x.beginPath(); x.ellipse(s * (16 + k * 1.2), -80 + k * 4.2, 9 - k * 1.2, 5.6 - k * 0.6, s * 0.35, PI * 1.05, PI * 1.95); x.stroke(); } }
  // arms + sword
  const sword = o.sword ?? 'down';
  const blade = (hx, hy, ang, len, glow) => {
    const ex = hx + Math.cos(ang) * len, ey = hy + Math.sin(ang) * len, bx = hx - Math.cos(ang) * 9, by = hy - Math.sin(ang) * 9;
    x.fillStyle = mask ? '#fff' : '#1a1512'; capsule(bx, by, hx, hy, 2.4, 2.4); // grip
    capsule(hx - Math.sin(ang) * 7, hy + Math.cos(ang) * 7, hx + Math.sin(ang) * 7, hy - Math.cos(ang) * 7, 2.2, 2.2); // crossguard
    x.fillStyle = mask ? '#fff' : '#2a2420'; x.beginPath(); x.moveTo(hx - Math.sin(ang) * 2.6, hy + Math.cos(ang) * 2.6); x.lineTo(ex, ey); x.lineTo(hx + Math.sin(ang) * 2.6, hy - Math.cos(ang) * 2.6); x.closePath(); x.fill();
    if (!mask) { x.strokeStyle = `rgba(255,200,140,${0.35 + 0.65 * (glow || 0)})`; x.lineWidth = 0.7; x.beginPath(); x.moveTo(hx, hy); x.lineTo(ex, ey); x.stroke(); if (glow > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = `rgba(255,150,60,${0.5 * glow})`; x.lineWidth = 5; x.beginPath(); x.moveTo(hx, hy); x.lineTo(ex, ey); x.stroke(); x.restore(); } }
  };
  x.fillStyle = P;
  if (sword === 'up') { capsule(-17, -76, -9, -94, 7.5, 6.5); capsule(-9, -94, -2, -108, 6.5, 5.5); capsule(17, -76, 9, -94, 7.5, 6.5); capsule(9, -94, 2, -108, 6.5, 5.5); ell(0, -109, 4.5, 3.6); x.fill(); blade(0, -112, -PI / 2, 66, o.glow ?? 1); }
  else if (sword === 'plant') { capsule(-17, -76, -12, -62, 7.5, 6.5); capsule(-12, -62, -3, -56, 6.5, 5.5); capsule(17, -76, 12, -62, 7.5, 6.5); capsule(12, -62, 3, -56, 6.5, 5.5); ell(0, -56, 4.5, 3.6); x.fill(); blade(0, -52, PI / 2, 52 - y0, o.glow ?? 0.3); }
  else if (sword === 'slash') { const a = lerp(-2.4, 0.6, o.slash ?? 0), hx = 20 + Math.cos(a) * 20, hy = -74 + Math.sin(a) * 20; capsule(17, -76, hx, hy, 7.5, 6); ell(hx, hy, 4.2, 3.6); x.fill(); capsule(-17, -76, -21, -58, 7.5, 6.5); capsule(-21, -58, -18, -44, 6.5, 5.5); blade(hx, hy, a, 62, o.glow ?? 0.8); }
  else if (sword === 'down') { capsule(17, -76, 21, -58, 7.5, 6.5); capsule(21, -58, 18, -44, 6.5, 5.5); ell(18, -42, 4.2, 3.6); x.fill(); capsule(-17, -76, -21, -59, 7.5, 6.5); capsule(-21, -59, -17, -46, 6.5, 5.5); ell(-16, -45, 4.2, 3.6); x.fill(); blade(-16, -45, PI * 0.72, 62, o.glow ?? 0.2); }
  else { capsule(17, -76, 21, -58, 7.5, 6.5); capsule(21, -58, 18, -44, 6.5, 5.5); capsule(-17, -76, -21, -58, 7.5, 6.5); capsule(-21, -58, -18, -44, 6.5, 5.5); }
  if (!mask) { x.strokeStyle = BR(0.35); x.lineWidth = 0.6; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 20.5, -58, 3.4, 0, TAU); x.stroke(); } }
  // gorget + helmet
  x.fillStyle = D; x.beginPath(); x.ellipse(0, -85, 8.5, 3.6, 0, 0, TAU); x.fill();
  x.fillStyle = mask ? '#fff' : '#0a0706'; for (let k = 0; k < 7; k++) featherShape(0, -103, -PI / 2 + (k - 3) * 0.22 + Math.sin(t * 2 + k) * 0.04, 9 + (3 - Math.abs(k - 3)) * 2.4, 1.6); // crest
  x.fillStyle = P; x.beginPath(); x.moveTo(-8.2, -86); x.bezierCurveTo(-9.6, -96, -7.5, -103.5, 0, -104.5); x.bezierCurveTo(7.5, -103.5, 9.6, -96, 8.2, -86); x.quadraticCurveTo(0, -82.5, -8.2, -86); x.fill();
  if (!o.back && !mask) {
    const hs = x.createRadialGradient(-3, -99, 0.5, 0, -95, 10); hs.addColorStop(0, 'rgba(170,120,70,.35)'); hs.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = hs; x.beginPath(); x.moveTo(-8.2, -86); x.bezierCurveTo(-9.6, -96, -7.5, -103.5, 0, -104.5); x.bezierCurveTo(7.5, -103.5, 9.6, -96, 8.2, -86); x.fill();
    x.strokeStyle = BR(0.45); x.lineWidth = 0.5; x.beginPath(); x.moveTo(0, -104.5); x.lineTo(0, -96.5); x.stroke(); x.beginPath(); x.moveTo(-8, -91); x.quadraticCurveTo(0, -89, 8, -91); x.stroke();
    x.fillStyle = 'rgba(0,0,0,.6)'; for (let k = 0; k < 5; k++) x.fillRect(-4 + k * 2, -89.5, 0.8, 3); // breaths
    const g = o.glow ?? 0.6, fl = 0.85 + 0.15 * Math.sin(t * 11);
    x.fillStyle = `rgba(255,${120 + 80 * g},${40 + 40 * g},${0.4 + 0.6 * g * fl})`; x.fillRect(-6.4, -95.2, 5.2, 1.5); x.fillRect(1.2, -95.2, 5.2, 1.5);
    x.restore(); x.restore();
    light(cx - 3.8 * u, base - (94.5 - y0) * u, 9 * u + 6, '255,120,40', 0.55 * g * fl); light(cx + 3.8 * u, base - (94.5 - y0) * u, 9 * u + 6, '255,120,40', 0.55 * g * fl);
    return;
  }
  x.restore();
  if (o.back) { x.restore(); x.save(); x.translate(cx, base); x.scale(u, u); featherCloak({ ...o, spread: (o.spread ?? 0.3) * 0.6 }, t, mask); }
  x.restore();
}
// backlit rim: (silhouette − eroded silhouette), tinted, drawn soft + sharp, computed at half resolution
const KN_A = document.createElement('canvas'), KN_B = document.createElement('canvas');
function rimKnight(cx, base, h, t, o, rim = '255,150,60', a = 1) {
  knight(cx, base, h, t, o);
  if (a <= 0) return;
  const sc = 0.5, w2 = Math.ceil(h * 2.3 * sc), h2 = Math.ceil(h * 2.1 * sc), ox = w2 / 2, oy = h2 * 0.9;
  for (const c of [KN_A, KN_B]) { if (c.width !== w2 || c.height !== h2) { c.width = w2; c.height = h2; } }
  const A = KN_A.getContext('2d'), B = KN_B.getContext('2d'), main = x;
  A.setTransform(1, 0, 0, 1, 0, 0); A.clearRect(0, 0, w2, h2); A.globalCompositeOperation = 'source-over';
  x = A; knight(ox, oy, h * sc, t, { ...o, mask: true }); x = main;
  const d = Math.max(1.5, h * sc * 0.012);
  B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'source-over'; B.clearRect(0, 0, w2, h2); B.drawImage(KN_A, 0, 0);
  B.globalCompositeOperation = 'destination-in'; for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d * 1.4]]) B.drawImage(KN_A, dx, dy);
  A.globalCompositeOperation = 'destination-out'; A.drawImage(KN_B, 0, 0);
  A.globalCompositeOperation = 'source-in'; A.fillStyle = `rgb(${rim})`; A.fillRect(0, 0, w2, h2);
  x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.9 * a; x.filter = `blur(${(h * 0.012).toFixed(1)}px)`;
  x.drawImage(KN_A, cx - ox / sc, base - oy / sc, w2 / sc, h2 / sc); x.filter = 'none'; x.globalAlpha = 0.75 * a; x.drawImage(KN_A, cx - ox / sc, base - oy / sc, w2 / sc, h2 / sc); x.restore();
}

// ---------- world ----------
function fireWall(t, k, opt = {}) {
  if (k <= 0) return;
  const n = opt.n ?? 22, y = opt.y ?? H + 60, sc = opt.scale ?? 1, seed = opt.seed ?? 0;
  x.save(); x.globalCompositeOperation = 'lighter';
  const g = x.createLinearGradient(0, H, 0, 0); g.addColorStop(0, `rgba(230,80,18,${0.38 * Math.min(k, 1.2)})`); g.addColorStop(0.45, `rgba(150,26,8,${0.22 * Math.min(k, 1.2)})`); g.addColorStop(1, 'rgba(60,0,0,0)'); x.fillStyle = g; x.fillRect(-200, -200, W + 400, H + 400);
  x.restore();
  for (let i = 0; i < n; i++) { const px = (i + 0.5) / n * (W + 300) - 150 + Math.sin(i * 3.1 + seed) * 40, s = (1.6 + R(i + seed) * 2.6) * k * sc * (0.85 + 0.15 * Math.sin(t * 3 + i)); flame(px, y + R(i * 7) * 80, s, t * 1.25, i + seed, 0.5); }
}
function fireTone(a = 0.55) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'multiply'; x.globalAlpha = a; x.fillStyle = 'rgb(255,108,58)'; x.fillRect(0, 0, W, H); x.restore(); }
function fireStreaks(t, k, seed = 0) { // vertical licks across the whole frame, like the cover art
  if (k <= 0) return;
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const px = R(i + seed) * W, len = 120 + R(i * 3 + seed) * 380, sp = 120 + R(i * 5) * 200, py = H + 100 - ((R(i * 7 + seed) * (H + 400) + t * sp) % (H + 400));
    const g = x.createLinearGradient(px, py, px, py - len); g.addColorStop(0, `rgba(255,170,60,${0.0})`); g.addColorStop(0.3, `rgba(240,90,20,${0.16 * k})`); g.addColorStop(1, 'rgba(255,60,10,0)');
    x.strokeStyle = g; x.lineWidth = 3 + R(i) * 9; x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px + Math.sin(t * 2 + i) * 30, py - len * 0.4, px - Math.sin(t * 1.7 + i) * 30, py - len * 0.7, px + Math.sin(t + i) * 20, py - len); x.stroke();
  }
  x.restore();
}
const CRACKS = [...Array(14)].map((_, i) => { const p = [R(i) * W, 0]; let px = p[0], py = 0; for (let k = 0; k < 8; k++) { px += (R(i * 9 + k) - 0.5) * 220; py += 30 + R(i * 5 + k) * 60; p.push(px, py); } return p; });
function lavaGround(t, y, glowK, tilt = 0) {
  const g = x.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#120806'); g.addColorStop(1, '#050202'); x.fillStyle = g;
  x.beginPath(); x.moveTo(-400, y + tilt); x.lineTo(W + 400, y - tilt); x.lineTo(W + 400, H + 400); x.lineTo(-400, H + 400); x.fill();
  x.save(); x.beginPath(); x.rect(-400, y - Math.abs(tilt), W + 800, H); x.clip(); x.translate(0, y); x.globalCompositeOperation = 'lighter';
  CRACKS.forEach((c, i) => { const a = (0.35 + 0.65 * glowK) * (0.6 + 0.4 * Math.sin(t * 2 + i)); [[12, `rgba(255,90,20,${0.18 * a})`], [3.5, `rgba(255,170,70,${0.7 * a})`]].forEach(([w, col]) => { x.beginPath(); x.moveTo(c[0], c[1]); for (let k = 2; k < c.length; k += 2) x.lineTo(c[k], c[k + 1] * (1 + i * 0.02)); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }); });
  x.restore();
}
function ruins(seed, base, col, n = 7) {
  x.fillStyle = col;
  for (let i = 0; i < n; i++) { const cx = 100 + (i / n) * W + R(i + seed) * 120, w = 60 + R(i * 3 + seed) * 70, hh = 160 + R(i * 5 + seed) * 380; x.beginPath(); x.moveTo(cx - w / 2, base); x.lineTo(cx - w / 2, base - hh); x.lineTo(cx - w * 0.1, base - hh - 40 * R(i)); x.lineTo(cx + w * 0.2, base - hh + 30); x.lineTo(cx + w / 2, base - hh + 10); x.lineTo(cx + w / 2, base); x.fill(); if (R(i * 7) < 0.5) { x.fillRect(cx - w * 1.4, base - hh * 0.5, w * 2.8, 18); } }
}
function ash(t, n, a = 0.5, seed = 0) { x.save(); x.fillStyle = '#b8b0a8'; for (let i = 0; i < n; i++) { const sp = 40 + R(i + seed) * 70, px = (R(i * 3 + seed) * (W + 300) + t * 25 + Math.sin(t + i) * 30) % (W + 300) - 150, py = (R(i * 5 + seed) * (H + 60) + sp * t) % (H + 60) - 30, s = 1 + R(i) * 2.6; x.globalAlpha = a * (0.3 + 0.7 * R(i + 9)); x.fillRect(px, py, s, s); } x.restore(); }
function feather(px, py, s, rot, col) { x.save(); x.translate(px, py); x.rotate(rot); x.fillStyle = col; x.beginPath(); x.moveTo(0, -s); x.quadraticCurveTo(s * 0.32, -s * 0.2, 0, s); x.quadraticCurveTo(-s * 0.32, -s * 0.2, 0, -s); x.fill(); x.restore(); }
function featherStorm(t, n, k, seed = 0, cx = W / 2, cy = H / 2) {
  for (let i = 0; i < n; i++) { const r = 150 + R(i + seed) * 900 * (0.4 + k), a = R(i * 3 + seed) * TAU + t * (0.4 + R(i) * 0.8) * (R(i + 5) < 0.5 ? 1 : -1), px = cx + Math.cos(a) * r * 1.4, py = cy + Math.sin(a) * r * 0.7 + Math.sin(t * 2 + i) * 20; feather(px, py, 10 + R(i * 7) * 22, a + t * 3 + i, R(i + 2) < 0.15 ? 'rgba(255,140,60,.7)' : '#0a0706'); }
}
function raven(px, py, s, t, col = '#050303', dir = 1) {
  const f = Math.sin(t * 11), up = -f * 30; x.save(); x.translate(px, py); x.scale(s * dir, s); x.fillStyle = col;
  ell(0, 0, 16, 6, -0.1); x.fill(); ell(15, -3, 6, 5); x.fill(); poly([20, -4, 30, -1, 20, 0]); x.fill(); poly([-14, -2, -30, -6, -32, 2, -28, 6, -14, 3]); x.fill();
  for (const side of [1, 0.6]) { x.beginPath(); x.moveTo(-6, -3); x.quadraticCurveTo(-2, up * 0.9 * side - 6, 8 + 14 * side, up * side - 4); x.lineTo(18 * side, up * side * 0.7 - 2); x.quadraticCurveTo(4, up * 0.4 * side, 6, 0); x.closePath(); x.fill(); for (let k = 0; k < 4; k++) featherShape(8 + 14 * side - k * 5, up * side - 4 + k * 3, PI * 0.55, 10, 1.6); }
  x.restore();
}
function wraith(cx, base, h, t, a, seed) {
  if (a <= 0) return; x.save(); x.globalAlpha = a;
  for (let i = 0; i < 6; i++) { const r = h * (0.18 + i * 0.05), g = x.createRadialGradient(cx - i * 20, base - h * 0.25 + i * 10, 0, cx - i * 20, base - h * 0.25 + i * 10, r); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - i * 20 - r, base - h * 0.25 + i * 10 - r, r * 2, r * 2); }
  person(cx, base - h * 0.08 + Math.sin(t * 2 + seed) * h * 0.02, h, '#030203', { hood: true, robe: true, cloak: true, dir: -1, arm: 0.7 + 0.3 * Math.sin(t * 3 + seed), wind: t * 3 + seed, windAmp: 1.6, time: t });
  light(cx - h * 0.05, base - h * 0.93, h * 0.06, '255,30,20', 0.9 * a);
  x.restore();
}
function slashArc(cx, cy, r, a0, a1, k) { if (k <= 0 || k >= 1) return; const e = easeOut(k), head = lerp(a0, a1, e), tail = lerp(a0, a1, Math.max(0, e - 0.35)); x.save(); x.globalCompositeOperation = 'lighter'; [[46, 0.18], [16, 0.5], [5, 1]].forEach(([w, al]) => { x.beginPath(); x.arc(cx, cy, r, Math.min(tail, head), Math.max(tail, head)); x.lineWidth = w; x.strokeStyle = `rgba(255,${190 - w},${110 - w},${al * (1 - k)})`; x.stroke(); }); x.restore(); }
// a mirror shard showing a memory
const SHARDS = [...Array(6)].map((_, i) => { const n = 5 + (i % 3), pts = []; for (let k = 0; k < n; k++) { const a = k / n * TAU + R(i * 9 + k) * 0.6, r = 0.6 + R(i * 5 + k) * 0.4; pts.push(Math.cos(a) * r, Math.sin(a) * r); } return pts; });
function memory(kind, t, w) { // drawn in shard-local space (-w..w)
  const g = x.createLinearGradient(0, -w, 0, w); g.addColorStop(0, kind % 2 ? '#3a1a10' : '#141a2a'); g.addColorStop(1, '#050303'); x.fillStyle = g; x.fillRect(-w, -w, w * 2, w * 2);
  light(w * 0.3, -w * 0.4, w * 0.8, kind % 2 ? '255,150,70' : '150,170,230', 0.35);
  const b = w * 0.75, s = w * 1.2;
  if (kind === 0) { person(-w * 0.15, b, s, '#020101', { beard: true, cloak: true, time: t }); person(w * 0.2, b, s * 0.55, '#020101', { arm: 0.6, dir: -1, time: t }); }
  if (kind === 1) { person(-w * 0.35, b, s, '#020101', { arm: 1, time: t }); person(w * 0.35, b, s, '#020101', { dir: 1, time: t, lean: 0.05 }); }
  if (kind === 2) { x.fillStyle = '#020101'; x.fillRect(w * 0.15, b - s * 0.28, s * 0.14, s * 0.28); x.fillRect(w * 0.15 - s * 0.05, b - s * 0.22, s * 0.24, s * 0.05); person(-w * 0.25, b, s * 0.9, '#020101', { kneel: true, hood: true, robe: true, time: t }); }
  if (kind === 3) { for (let i = 0; i < 5; i++) person(-w * 0.8 + i * w * 0.3, b, s * 0.8, '#020101', { arm: 1.1, dir: 1, time: t + i }); person(w * 0.75, b, s * 0.85, '#020101', { dir: -1, hood: true, time: t }); }
  if (kind === 4) { person(0, b, s, '#020101', { sit: true, time: t }); x.fillStyle = 'rgba(255,200,140,.4)'; x.fillRect(-w, -w * 0.9, w * 2, 3); }
  if (kind === 5) { person(-w * 0.1, b, s, '#020101', { walk: t * 3, cloak: true, hood: true, time: t }); }
}
function shard(i, cx, cy, sz, rot, t, a) {
  if (a <= 0) return; const p = SHARDS[i % SHARDS.length].map(v => v * sz);
  x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot); poly(p); x.save(); x.clip(); memory(i % 6, t, sz); x.restore();
  poly(p); x.strokeStyle = 'rgba(255,230,200,.7)'; x.lineWidth = 2.5; x.stroke(); x.save(); poly(p); x.clip(); x.globalCompositeOperation = 'lighter'; const gx = ((t * 120 + i * 200) % (sz * 6)) - sz * 3, g = x.createLinearGradient(gx - 40, -sz, gx + 40, sz); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,240,220,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-sz, -sz, sz * 2, sz * 2); x.restore();
  x.restore();
}
function redSky(t, k = 1) { k = Math.min(k, 1.05); vgrad([[0, '#070203'], [0.45, `rgb(${Math.round(40 + 40 * k)},8,6)`], [0.75, `rgb(${Math.round(110 + 60 * k)},${Math.round(30 + 20 * k)},10)`], [1, '#1a0603']]); }
function title(t, a0, a1, y = 520, size = 150) {
  const a = win(t, a0, a1, 0.8, 1.2); if (a <= 0) return;
  const txt = 'HATALI HAYATLAR', k = ss(a0 - 0.8, a0 + 2.5, t);
  x.save(); x.font = `900 ${size}px Cinzel`; x.letterSpacing = `${size * 0.14}px`; x.textAlign = 'center'; x.textBaseline = 'middle';
  const n = Math.ceil(txt.length * k), show = txt.slice(0, n), gx = ((t - a0) * 500) % 2400 - 200, g = x.createLinearGradient(gx - 300, 0, gx + 300, 0);
  g.addColorStop(0, '#c2541a'); g.addColorStop(0.5, '#ffe2a8'); g.addColorStop(1, '#c2541a');
  x.globalAlpha = a; x.shadowColor = 'rgba(255,90,20,.9)'; x.shadowBlur = 50; x.fillStyle = g;
  const full = x.measureText(txt).width; x.textAlign = 'left'; x.fillText(show, 960 - full / 2 + size * 0.07, y);
  x.restore();
}
