// Scenes: hook, title, rome, plague  (+ shared fortress & head profile)
const Ls = (scene, n) => LN[S[scene].first + n].start;   // n-th line start inside a scene
const Le = (scene, n) => LN[S[scene].first + n].end;

// ---------- shared: fortress ----------
function fortress(cx, base, s, col, lit = 0, t = 0, rise = 1, rim = null) {
  x.save(); x.translate(cx, base); x.scale(s, s);
  if (rise < 1) { x.beginPath(); x.rect(-700, -900 * rise, 1400, 900 * rise + 10); x.clip(); x.translate(0, 600 * (1 - rise)); }
  const draw = c => {
    x.fillStyle = c;
    x.fillRect(-420, -170, 840, 170); // curtain wall
    for (let i = -420; i < 420; i += 40) x.fillRect(i, -196, 24, 28);
    [[-460, 300, 110], [460, 300, 110], [-210, 250, 90], [210, 250, 90]].forEach(([tx, th, tw]) => { x.fillRect(tx - tw / 2, -th, tw, th); for (let i = -tw / 2; i < tw / 2; i += 30) x.fillRect(tx + i, -th - 26, 18, 28); poly([tx - tw / 2 - 10, -th - 26, tx + tw / 2 + 10, -th - 26, tx, -th - 110]); x.fill(); });
    x.fillRect(-120, -430, 240, 430); for (let i = -120; i < 120; i += 34) x.fillRect(i, -458, 20, 30); // keep
    poly([-140, -458, 140, -458, 0, -600]); x.fill(); line([0, -600, 0, -680], 8, c);
  };
  if (rim) { x.save(); x.translate(-5, -4); draw(rim); x.restore(); }
  draw(col);
  // gate
  x.fillStyle = '#020102'; x.beginPath(); x.moveTo(-50, 0); x.lineTo(-50, -90); x.arc(0, -90, 50, PI, 0); x.lineTo(50, 0); x.fill();
  if (lit > 0) {
    const fl = 0.85 + 0.15 * Math.sin(t * 7);
    [[-40, -330], [40, -330], [0, -240], [-460, -220], [460, -220], [-210, -180], [210, -180]].forEach(([wx, wy], i) => { x.fillStyle = `rgba(255,${180 + 30 * fl},90,${lit * (0.7 + 0.3 * R(i))})`; x.fillRect(wx - 9, wy - 18, 18, 30); light(wx, wy, 70, '255,170,70', lit * 0.5 * fl); });
    light(0, -300, 520, '255,160,60', lit * 0.25);
  }
  x.restore();
}
// ---------- shared: head profile (facing right), local box ~ 0..620 x 0..720 ----------
const HEAD = [120, 720, 150, 560, 110, 470, 85, 380, 100, 270, 160, 160, 260, 90, 380, 72, 470, 110, 520, 180, 540, 255, 552, 300, 556, 322, 590, 370, 606, 392, 582, 404, 566, 412, 572, 432, 560, 446, 566, 466, 548, 480, 566, 520, 548, 575, 505, 615, 455, 640, 438, 720];
function headPath(cx, cy, s) {
  x.beginPath(); const P = i => [cx + (HEAD[i] - 330) * s, cy + (HEAD[i + 1] - 400) * s];
  let [a, b] = P(0); x.moveTo(a, b);
  for (let i = 2; i < HEAD.length - 2; i += 2) { const [p, q] = P(i), [r, u] = P(i + 2); x.quadraticCurveTo(p, q, (p + r) / 2, (q + u) / 2); }
  const [e, f] = P(HEAD.length - 2); x.lineTo(e, f); x.closePath();
}
function headCurls(cx, cy, s, col) { x.save(); headPath(cx, cy, s); x.clip(); x.strokeStyle = 'rgba(217,164,65,.16)'; x.lineWidth = 3 * s; for (let k = 0; k < 40; k++) { const px = cx + (-260 + R(k) * 330) * s, py = cy + (-340 + R(k + 7) * 260) * s; if (px > cx + 60 * s && py > cy - 200 * s) continue; x.beginPath(); x.arc(px, py, (14 + R(k + 3) * 14) * s, PI * 0.1, PI * 1.3); x.stroke(); } for (let k = 0; k < 18; k++) { const px = cx + (130 + R(k + 40) * 110) * s, py = cy + (110 + R(k + 50) * 200) * s; x.beginPath(); x.arc(px, py, (12 + R(k) * 10) * s, PI * 1.1, PI * 2.2); x.stroke(); } x.restore(); }
function _unusedCurls(cx, cy, s, col) { x.fillStyle = col; for (let k = 0; k < 16; k++) { const a = PI * (0.62 + k * 0.075), r = 300 * s; const px = cx + (-20 + Math.cos(a) * 1.0 * 300) * s * 0.92, py = cy + (-120 + Math.sin(a) * 320 * 0.9) * s; ell(px, py, 36 * s, 34 * s); x.fill(); } for (let k = 0; k < 7; k++) { ell(cx + (150 + k * 12) * s, cy + (120 + k * 30) * s, 34 * s, 30 * s); x.fill(); } }

// =====================================================================
//  HOOK
// =====================================================================
function lightning(x0, y0, x1, y1, seed, a, w = 1) {
  const pts = [x0, y0]; let px = x0, py = y0; const n = 14;
  for (let i = 1; i <= n; i++) { px = lerp(x0, x1, i / n) + (R(i * 7 + seed) - 0.5) * 120; py = lerp(y0, y1, i / n); pts.push(px, py); }
  x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = a;
  [[24 * w, 'rgba(140,160,255,.25)'], [9 * w, 'rgba(200,215,255,.6)'], [3 * w, '#ffffff']].forEach(([lw, c]) => line(pts, lw, c));
  x.restore();
}
function flash(t, times, dur = 0.5) { let f = 0; times.forEach(lt => { const k = t - lt; if (k >= 0 && k < dur) f = Math.max(f, Math.exp(-k * 12) + (k > 0.12 ? 0.55 * Math.exp(-(k - 0.12) * 14) : 0)); }); return cl(f, 0, 1); }

function pantheon(cx, base, s, col) {
  x.fillStyle = col; x.fillRect(cx - 150 * s, base - 120 * s, 300 * s, 120 * s);
  x.beginPath(); x.ellipse(cx, base - 120 * s, 150 * s, 120 * s, 0, PI, 0); x.fill();
  x.fillRect(cx - 160 * s, base - 128 * s, 320 * s, 12 * s); x.fillRect(cx - 18 * s, base - 246 * s, 36 * s, 8 * s);
  temple(cx - 250 * s, base, 200 * s, 160 * s, col, 6);
}
function triumphArch(cx, base, s, col) {
  x.fillStyle = col; x.fillRect(cx - 110 * s, base - 170 * s, 220 * s, 170 * s); x.fillRect(cx - 124 * s, base - 200 * s, 248 * s, 32 * s);
  x.save(); x.fillStyle = 'rgba(0,0,0,.5)';
  [[0, 40, 84], [-78, 18, 40], [78, 18, 40]].forEach(([dx, r, hh]) => { x.beginPath(); x.moveTo(cx + (dx - r) * s, base); x.lineTo(cx + (dx - r) * s, base - hh * s); x.arc(cx + dx * s, base - hh * s, r * s, PI, 0); x.lineTo(cx + (dx + r) * s, base); x.fill(); });
  x.restore(); person(cx, base - 200 * s, 70 * s, col, { robe: true, arm: 0.9, laurel: true, time: 0 });
}
function stonePine(cx, base, h, col) { x.fillStyle = col; capsule(cx, base, cx + h * 0.06, base - h * 0.72, h * 0.05, h * 0.035); for (let k = 0; k < 5; k++) { ell(cx + h * 0.06 + (k - 2) * h * 0.13, base - h * (0.8 + (k % 2) * 0.05), h * 0.18, h * 0.08); x.fill(); } }
function statueCol(cx, base, h, col) { column(cx, base - h, base, h * 0.07, col, false); person(cx, base - h, h * 0.24, col, { robe: true, arm: 0.8, laurel: true, time: 0 }); }
function chimneySmoke(t, cx, cy, a = 0.12) { for (let i = 0; i < 6; i++) { const p = ((t * 0.12 + i / 6) % 1), r = 14 + p * 60; const g = x.createRadialGradient(cx + p * 80 + Math.sin(t + i) * 10, cy - p * 220, 0, cx + p * 80, cy - p * 220, r); g.addColorStop(0, `rgba(160,150,150,${a * (1 - p)})`); g.addColorStop(1, 'rgba(160,150,150,0)'); x.fillStyle = g; x.fillRect(cx + p * 80 - r, cy - p * 220 - r, r * 2, r * 2); } }
function romeSkyline(t, base, col, lit = null, seed = 0) {
  const hz = col.haze || '255,190,140';
  ridge(3 + seed, base - 170, 90, 0.0016, col.far, 0.2);
  for (let i = 0; i < 6; i++) { const px = 120 + i * 330 + R(i + seed) * 80; temple(px, base - 150 - R(i) * 40, 90, 50, col.far, 5); }
  haze(base - 260, base - 60, hz, 0.35);
  x.save(); x.filter = 'blur(1.2px)'; houses(15 + seed, base - 40, 30, -100, W + 100, 40, 110, mixHex(col.far, col.mid, 0.5), lit, 0.5); x.restore();
  haze(base - 140, base - 20, hz, 0.22);
  houses(5 + seed, base, 34, -100, W + 100, 50, 140, col.mid, lit, 0.7);
  pantheon(1640, base - 20, 0.9, col.mid); temple(1250, base - 60, 340, 200, col.mid, 8); temple(470, base - 40, 240, 150, col.mid, 6);
  colosseum(900, base, 420, 200, col.mid, lit);
  triumphArch(1450, base + 10, 0.8, col.mid); statueCol(700, base + 10, 300, col.mid); statueCol(1110, base + 10, 280, col.mid);
  aqueduct(-60, 560, base + 10, 150, col.mid);
  [[340, base - 80], [1020, base - 110], [1820, base - 60]].forEach(([sx, sy], i) => chimneySmoke(t + i * 3, sx, sy, col.smoke ?? 0.12));
  for (let i = 0; i < 7; i++) cypress(80 + i * 290 + R(i) * 60, base + 30, 140 + R(i + 3) * 80, col.near);
  [[260, 230], [1330, 260], [1760, 210]].forEach(([px, hh]) => stonePine(px, base + 34, hh, col.near));
  x.fillStyle = col.near; x.fillRect(-400, base + 20, W + 800, H);
}
function birds(t, n, y, seed, col = '#140c0c') {
  x.strokeStyle = col; x.lineWidth = 3;
  for (let i = 0; i < n; i++) { const px = ((R(i + seed) * W + t * (60 + R(i) * 40)) % (W + 200)) - 100, py = y + R(i * 3 + seed) * 120 + Math.sin(t + i) * 10, f = Math.sin(t * 8 + i) * 8; x.beginPath(); x.moveTo(px - 14, py - f); x.quadraticCurveTo(px - 6, py - 4, px, py); x.quadraticCurveTo(px + 6, py - 4, px + 14, py - f); x.stroke(); }
}
function sceneHook(t) {
  const sc = S.hook, st = [0, Ls('hook', 1), Ls('hook', 2), Ls('hook', 3), C.hook.mind - 0.7, Ls('hook', 5)];
  const sh = shot(t, st, sc.end), lt = sh.lt;
  if (sh.i === 0) { // dawn over Rome, Marcus from behind
    vgrad([[0, '#0b0d1c'], [0.45, '#3a2638'], [0.72, '#b4583c'], [0.82, '#f0a35c']]);
    light(1300, 760, 700, '255,170,90', 0.6); ell(1300, 770, 70, 70); x.fillStyle = '#ffd9a0'; x.fill();
    stars(t, 90, 0.5 * (1 - ss(0, 6, lt)), 0, 400); birds(t, 7, 380, 2);
    x.save(); cam(t, [[0, 1.0, 960, 540], [st[0] + 0.1, 1.07, 900, 560, sh.e - st[0]]]);
    romeSkyline(t, 800, { far: '#7a4a48', mid: '#2a1820', near: '#120a0e', haze: '255,160,110' }, 'rgba(255,170,80,.75)');
    x.fillStyle = '#07040a'; x.fillRect(-400, 930, W + 800, 400); for (let i = 0; i < 26; i++) column(-60 + i * 80, 860, 940, 22, '#07040a', false); x.fillRect(-400, 846, W + 800, 22);
    rimPerson(760, 1010, 480, '#05030a', 'rgba(255,170,90,.9)', { cloak: true, laurel: true, laurelCol: '#3a2a10', robe: true, beard: true, dir: 1, wind: t * 1.6, windAmp: 0.6 }, [4, -3]);
    x.restore(); motes(t, 70, [700, 1920, 200, 1000], '255,200,140', 0.45, 3);
  } else if (sh.i === 1) { // the four words + whispering shadows
    fillAll('#050203'); light(960, 540, 900, '160,20,20', 0.25);
    const heads = [[180, 560, 1, 0.9], [1740, 560, -1, 0.9], [420, 760, 1, 0.6], [1500, 760, -1, 0.6]];
    heads.forEach(([hx, hy, d, s2], i) => { const a = ss(C.hook.list[i] - 0.3, C.hook.list[i] + 0.3, t); if (a <= 0) return; x.save(); x.globalAlpha = a; x.translate(hx, hy); x.scale(d, 1); x.fillStyle = 'rgba(255,60,40,.7)'; headPath(4, -2, s2); x.fill(); x.fillStyle = '#060203'; headPath(0, 0, s2); x.fill(); x.restore(); light(hx + d * 120 * s2, hy - 80 * s2, 40, '255,40,30', a * 0.8); });
    const words = ['UNGRATEFUL', 'ARROGANT', 'DISHONEST', 'ENVIOUS'];
    words.forEach((w, i) => { const k = ss(C.hook.list[i] - 0.05, C.hook.list[i] + 0.12, t); if (k <= 0) return; const sc2 = 1.35 - 0.35 * easeBack(k); x.save(); x.translate(960, 300 + i * 140); x.scale(sc2, sc2); x.shadowColor = 'rgba(255,40,30,.7)'; x.shadowBlur = 40; textC(w, 0, 0, '900 112px Cinzel', i === 3 ? '#ff4a3a' : '#efe4cf', 14, k); x.restore(); });
  } else if (sh.i === 2) { // the legions at sunset
    vgrad([[0, '#1a0a0c'], [0.5, '#6b1e14'], [0.8, '#e0622c'], [1, '#2a0c08']]);
    light(960, 700, 800, '255,120,50', 0.5); ell(960, 720, 120, 120); x.fillStyle = '#ffb46a'; x.fill();
    x.save(); cam(t, [[sh.s, 1.0, 900, 540], [sh.s, 1.08, 1060, 560, sh.e - sh.s]]);
    landscape(8, 830, 4, '#a2482a', '#24100c', { haze: '255,130,70', amp: 190, blur: 6 });
    legion(t, 840, 30, 70, '#160806', null, 1, 40, -100, W + 100, 66);
    legion(t, 930, 22, 110, '#0c0404', 'rgba(255,130,60,.6)', 2, 60, -150, W + 150, 98);
    standard(620, 1080, 440, '#060202', t); standard(1320, 1080, 460, '#060202', t + 1);
    legion(t, 1100, 13, 190, '#030101', 'rgba(255,140,60,.8)', 3, 90, -250, W + 250, 170);
    fgGrass(t, 5, 1060, '#030101', 100, 4, 70, true);
    x.restore(); smoke(t, 5, '120,40,20', 0.18, 5, 700, 1000); motes(t, 60, [0, W, 300, 1000], '255,170,90', 0.4, 9);
  } else if (sh.i === 3) { // the fog of the battlefield clears to one man
    vgrad([[0, '#0c0a0c'], [0.6, '#2a2224'], [1, '#0a0808']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.18, 960, 600, sh.e - sh.s]]);
    ridge(21, 760, 50, 0.002, '#1c1618');
    const fade = 1 - ss(sh.s, sh.s + 2.5, t);
    x.globalAlpha = fade; legion(t, 900, 16, 120, '#0e0a0a', null, 7, 0, -100, W + 100, 130); x.globalAlpha = 1;
    for (let i = 0; i < 14; i++) line([200 + i * 120 + R(i) * 40, 1000, 190 + i * 120 + R(i) * 40 + (R(i + 1) - 0.5) * 60, 760 + R(i + 2) * 80], 5, '#0a0707');
    rimPerson(960, 1000, 360, '#050304', 'rgba(230,210,180,.75)', { cloak: true, laurel: true, beard: true, robe: true, wind: t * 1.5 });
    fgGrass(t, 7, 1040, '#050404', 120, 5, 80, true);
    x.restore(); smoke(t, 9, '140,130,130', 0.22, 8, 600, 1080);
  } else { // the mind: storm inside a head; then a fortress rises within
    fillAll('#030203');
    const hs = 1.45, hx = 980, hy = 560, rise = ss(C.hook.fortress - 0.2, C.hook.fortress + 2.2, t), calm = rise;
    x.save(); x.translate(0, -0.0); headPath(hx - 6, hy - 4, hs); x.fillStyle = 'rgba(217,164,65,.8)'; x.fill(); x.restore();
    headPath(hx, hy, hs); x.fillStyle = '#060508'; x.fill();
    x.save(); headPath(hx, hy, hs); x.clip();
    vgrad([[0, `rgb(${lerp(10, 40, calm)},${lerp(14, 26, calm)},${lerp(30, 20, calm)})`], [1, '#050307']]);
    clouds(t, 10, 150, 700, '120,130,160', 0.35 * (1 - calm), 3, 40); clouds(t, 8, 200, 900, '60,70,100', 0.4 * (1 - calm), 9, -30);
    const f = flash(t, [C.hook.mind + 0.02, st[4] + 0.3, C.hook.mind + 1.4]);
    if (f > 0) { x.fillStyle = `rgba(200,210,255,${0.6 * f})`; x.fillRect(0, 0, W, H); lightning(900 + R(Math.floor(t)) * 200, 80, 1000, 700, Math.floor(t * 2), f, 1.2); }
    if (rise > 0) { light(hx, hy + 120, 600, '255,170,80', 0.45 * rise); fortress(hx + 40, hy + 330, 0.62, '#0c0708', rise, t, rise, 'rgba(255,170,80,.7)'); }
    x.restore();
    headCurls(hx, hy, hs, '#060508');
    embers(t, 30, '255,160,70', 70, 4, 0.8 * (0.3 + rise));
  }
}

// =====================================================================
//  TITLE — the citadel on the promontory, storm at sea
// =====================================================================
function sceneTitle(t) {
  const st = C.title, lt = t - S.title.start;
  vgrad([[0, '#05070d'], [0.6, '#10182a'], [1, '#05070d']]);
  stars(t, 120, 0.6, 3, 600); moon(1500, 220, 70, '#e7ddc8', 0.3);
  clouds(t, 8, 100, 500, '40,50,70', 0.5, 1, 20);
  const f = flash(t, [st + 0.05, st + 2.8]);
  if (f > 0) { x.fillStyle = `rgba(190,205,255,${0.45 * f})`; x.fillRect(0, 0, W, H); lightning(1700, 0, 1560, 520, 5, f); }
  x.save(); cam(t, [[S.title.start, 1.12, 960, 600], [S.title.start, 1.0, 960, 540, S.title.end - S.title.start]]);
  sea(t, 760, 22, 4, k => `rgb(${8 + k * 3},${14 + k * 4},${24 + k * 5})`, { k: 1, draw: () => { promontory(980, 800, 1.1, '#07080c', 'rgba(150,170,210,.35)'); fortress(1000, 330, 0.42, '#07080c', 1, t, 1, 'rgba(150,170,210,.45)'); } });
  spray(t, 640, 760, 3.2, 0.4, 1.2); spray(t, 1380, 760, 3.7, 1.9, 1.1);
  x.restore();
  rainfall(t, 160, 0.22, 0.3);
  const k = ss(st - 0.1, st + 0.8, t), g = x.createLinearGradient(400 + (lt * 300) % 1600 - 400, 0, 800 + (lt * 300) % 1600 - 400, 0);
  g.addColorStop(0, GOLD); g.addColorStop(0.5, '#fff6dc'); g.addColorStop(1, GOLD);
  x.save(); x.globalAlpha = k; x.font = '900 118px Cinzel'; x.letterSpacing = '18px'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,.9)'; x.shadowBlur = 40; x.fillStyle = g; x.translate(960 + 9, 470); const z = 1.08 - 0.08 * easeOut(k); x.scale(z, z); x.fillText('THE INNER CITADEL', 0, 0); x.restore();
  textC('MARCUS AURELIUS  ·  121 – 180 AD', 960, 590, '700 36px Cinzel', '#e9dcc6', 12, ss(st + 0.6, st + 1.3, t));
}

// =====================================================================
//  I · THE THRONE — Rome
// =====================================================================
function sceneRome(t) {
  const sc = S.rome, st = [sc.start, C.rome.emperor - 0.6, C.rome.hadrian - 0.3, C.rome.philo - 0.3, C.rome.tested - 0.6, C.rome.crisis[0] - 0.4, C.rome.worse - 0.2];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0 || sh.i === 4) { // golden Rome; darkening when "tested"
    const dark = sh.i === 4 ? ss(sh.s, sh.s + 3, t) : 0;
    vgrad([[0, `rgb(${lerp(42, 14, dark)},${lerp(26, 14, dark)},${lerp(58, 22, dark)})`], [0.55, `rgb(${lerp(224, 50, dark)},${lerp(137, 44, dark)},${lerp(79, 52, dark)})`], [0.8, `rgb(${lerp(243, 70, dark)},${lerp(194, 60, dark)},${lerp(122, 64, dark)})`]]);
    if (dark < 1) { light(1250, 720, 700, '255,190,110', 0.6 * (1 - dark)); ell(1250, 730, 90, 90); x.fillStyle = `rgba(255,224,170,${1 - dark})`; x.fill(); }
    clouds(t, 9, 80, 600, dark ? '40,36,44' : '255,200,150', dark ? 0.55 * dark : 0.12, 2, 14);
    const f = sh.i === 4 ? flash(t, [sh.s + 2.2, sh.s + 3.4]) : 0;
    if (f) { x.fillStyle = `rgba(220,220,255,${0.4 * f})`; x.fillRect(0, 0, W, H); lightning(400, 0, 560, 640, 13, f); }
    birds(t, 9, 260, 5, dark ? '#0a0a0c' : '#2a1410');
    x.save(); cam(t, sh.i === 0 ? [[sh.s, 1.12, 700, 560], [sh.s, 1.0, 1100, 540, sh.e - sh.s]] : [[sh.s, 1.0, 960, 540], [sh.s, 1.1, 980, 600, sh.e - sh.s]]);
    romeSkyline(t, 830, dark ? { far: '#2a2630', mid: '#121014', near: '#08070a', haze: '120,110,130' } : { far: '#b07a62', mid: '#4a2c2c', near: '#1e1214', haze: '255,200,150' }, dark ? 'rgba(255,170,80,.6)' : 'rgba(255,190,110,.35)', 4);
    x.restore();
    if (sh.i === 0) { const a = win(t, sh.s + 0.4, sh.e - 0.8, 0.6, 0.6); textC('ROMA', 160, 150, '900 64px Cinzel', '#fff1d6', 18, a, 'left'); textC('161 AD', 160, 215, '700 34px Cinzel', '#f3d6a6', 10, a, 'left'); x.globalAlpha = a; x.fillStyle = GOLD; x.fillRect(160, 250, 220 * ss(sh.s + 0.4, sh.s + 1.4, t), 3); x.globalAlpha = 1; }
  } else if (sh.i === 1) { // the new emperor on the temple steps
    vgrad([[0, '#2a1626'], [0.6, '#b0603c'], [1, '#3a1a14']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [C.rome.never - 0.2, 1.75, 960, 300, 2.2]]);
    light(960, 420, 700, '255,190,110', 0.4);
    temple(960, 640, 1100, 520, '#2a1414', 8);
    x.fillStyle = '#1e0e0e'; for (let i = 0; i < 6; i++) x.fillRect(200 - i * 40, 640 + i * 40, 1520 + i * 80, 40);
    x.fillStyle = 'rgba(255,190,120,.08)'; for (let i = 0; i < 6; i++) x.fillRect(200 - i * 40, 640 + i * 40, 1520 + i * 80, 3);
    [[520, '#5a1a2a'], [1400, '#5a1a2a']].forEach(([bx, c]) => { x.fillStyle = c; poly([bx - 50, 140, bx + 50, 140, bx + 50, 520, bx, 480, bx - 50, 520]); x.fill(); x.fillStyle = 'rgba(217,164,65,.7)'; x.fillRect(bx - 40, 170, 80, 6); textC('SPQR', bx, 230, '900 30px Cinzel', 'rgba(246,214,140,.9)', 4); });
    rimPerson(960, 640, 300, '#120606', 'rgba(255,200,130,.9)', { laurel: true, laurelCol: '#d9a441', robe: true, beard: true, cloak: true, arm: 0.3 + 0.1 * Math.sin(t), wind: t });
    crowd(3, 1000, 70, -100, W + 100, 1.6, '#0a0404', t, 1 - ss(C.rome.never - 0.4, C.rome.never + 0.6, t));
    x.restore();
    embers(t, 20, '255,200,120', 50, 2, 0.6); motes(t, 50, [300, 1600, 100, 900], '255,220,170', 0.35, 4);
  } else if (sh.i === 2) { // flashback: Hadrian names the boy Verissimus (sepia)
    vgrad([[0, '#2b2015'], [1, '#120c07']]); light(760, 380, 800, '255,210,150', 0.35);
    x.save(); cam(t, [[sh.s, 1.05, 960, 560], [sh.s, 1.14, 880, 560, sh.e - sh.s]]);
    column(260, 160, 920, 90, '#1a120b'); column(1660, 160, 920, 90, '#1a120b'); x.fillStyle = '#1a120b'; x.fillRect(120, 120, 1680, 60);
    x.fillStyle = '#16100a'; x.fillRect(-400, 920, W + 800, 400);
    rimPerson(820, 920, 520, '#0e0905', 'rgba(255,215,160,.75)', { laurel: true, robe: true, beard: true, dir: 1, arm: 0.15 });
    rimPerson(1060, 920, 290, '#0e0905', 'rgba(255,215,160,.75)', { robe: true, dir: -1 });
    line([872, 640, 990, 700], 34, '#0e0905');
    x.restore();
    const a = ss(C.rome.verissimus - 0.1, C.rome.verissimus + 0.4, t);
    textC('VERISSIMUS', 1380, 420, '900 84px Cinzel', GOLD2, 14, a); textC('“the most truthful one”', 1380, 500, '600 italic 44px Cormorant', '#e9dcc6', 1, ss(C.rome.verissimus + 0.4, C.rome.verissimus + 1, t));
    x.fillStyle = 'rgba(70,45,20,.25)'; x.fillRect(0, 0, W, H);
  } else if (sh.i === 3) { // the philosopher's colonnade (a stoa) with light shafts
    vgrad([[0, '#1a1410'], [1, '#0a0806']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.08, 1060, 560, sh.e - sh.s]]);
    for (let i = 0; i < 8; i++) { const cx2 = 120 + i * 250; x.fillStyle = 'rgba(255,220,160,.08)'; poly([cx2 + 60, 120, cx2 + 180, 120, cx2 + 420, 960, cx2 + 260, 960]); x.fill(); }
    godrays(1400, -100, 9, 1400, '255,220,160', 0.08, t, 1.0, PI * 0.62);
    for (let i = 0; i < 9; i++) column(40 + i * 240, 140, 900, 64, '#100b08');
    x.fillStyle = '#100b08'; x.fillRect(-100, 100, W + 200, 60); x.fillStyle = '#0c0906'; x.fillRect(-400, 900, W + 800, 400);
    const wx = 620 + (t - sh.s) * 40;
    rimPerson(wx, 900, 300, '#080605', 'rgba(255,220,160,.6)', { robe: true, beard: true, walk: t * 3.2, cloak: true });
    rimPerson(wx + 170, 900, 330, '#080605', 'rgba(255,220,160,.6)', { robe: true, beard: true, walk: t * 3.2 + 1.2, dir: -1, arm: 0.35 });
    scroll(1500, 870, 120, 30, '#c9b48c', 0.9);
    x.restore();
    motes(t, 160, [0, W, 100, 950], '255,225,175', 0.55, 6); embers(t, 20, '255,230,190', 20, 7, 0.4);
  } else if (sh.i === 5) { // floods, famine, rebellion, war — four panels
    fillAll('#050303');
    const labels = ['FLOODS', 'FAMINE', 'REBELLION', 'WAR'], pw = W / 4;
    labels.forEach((lab, i) => {
      const a = ss(C.rome.crisis[i] - 0.08, C.rome.crisis[i] + 0.25, t); if (a <= 0) return;
      const px = i * pw, slide = (1 - easeOut(a)) * 80;
      x.save(); x.beginPath(); x.rect(px + 6, 6, pw - 12, H - 12); x.clip(); x.globalAlpha = a; x.translate(0, slide);
      if (i === 0) { vgrad([[0, '#0b1420'], [1, '#05080c']]); houses(30, 640, 6, px, px + pw, 80, 200, '#081018'); for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(px - 50, H); for (let q = px - 50; q <= px + pw + 50; q += 10) x.lineTo(q, 600 + k * 70 + Math.sin(q * 0.02 + t * 2 + k) * 14); x.lineTo(px + pw + 50, H); x.closePath(); x.fillStyle = `rgba(${30 + k * 10},${60 + k * 10},${90 + k * 10},.85)`; x.fill(); } rainfall(t, 60, 0.3, 0.1); }
      if (i === 1) { vgrad([[0, '#3a2410'], [1, '#140a04']]); light(px + pw / 2, 300, 400, '255,170,80', 0.3); x.fillStyle = '#1a0e06'; x.fillRect(px, 700, pw, H); x.strokeStyle = '#0a0503'; x.lineWidth = 3; for (let k = 0; k < 12; k++) { x.beginPath(); x.moveTo(px + R(k) * pw, 700 + R(k + 3) * 300); x.lineTo(px + R(k + 1) * pw, 700 + R(k + 5) * 300); x.stroke(); } for (let k = 0; k < 9; k++) { const sx = px + 40 + k * 50; line([sx, 720, sx + 8, 560, sx + 24, 600], 4, '#2a1a08'); } x.fillStyle = '#0a0503'; x.beginPath(); x.ellipse(px + pw / 2, 880, 110, 30, 0, 0, PI); x.fill(); }
      if (i === 2) { vgrad([[0, '#2a0806'], [1, '#0a0303']]); for (let k = 0; k < 4; k++) torch(px + 70 + k * 110, 520 + R(k) * 80, 1.2, t, k); crowd(40, 980, 18, px - 20, px + pw + 20, 1.5, '#050202', t, 1); }
      if (i === 3) { vgrad([[0, '#3a0a06'], [0.6, '#a02a12'], [1, '#150404']]); for (let k = 0; k < 7; k++) line([px + 20 + k * 70, 1000, px + 120 + k * 60, 380 + R(k) * 80], 6, '#080202'); x.fillStyle = '#080202'; for (let k = 0; k < 4; k++) { ell(px + 80 + k * 110, 860, 54, 70); x.fill(); } smoke(t, 3, '40,10,8', 0.4, 40 + i, 400, 900); }
      x.restore();
      textC(lab, px + pw / 2, 960, '900 64px Cinzel', '#efe4cf', 8, a);
    });
    x.fillStyle = '#050303'; for (let i = 1; i < 4; i++) x.fillRect(i * pw - 6, 0, 12, H);
  } else { // "something worse": sickly mist creeping in from the east
    fillAll('#030303');
    const k = ss(sh.s, sh.e, t);
    smoke(t, 10, '60,90,40', 0.3 * k, 77, 300, 1000, 300, 600);
    x.save(); x.globalCompositeOperation = 'lighter'; light(W + 200 - k * 900, 600, 900, '120,170,70', 0.3 * k); x.restore();
  }
}

// =====================================================================
//  II · THE PLAGUE
// =====================================================================
function plagueSpread(cx, t, t0, t1) {
  const k = ss(t0, t1, t);
  return g => {
    const origin = CITIES.syria;
    Object.entries(CITIES).forEach(([name, [px, py]], i) => {
      const d = Math.hypot(px - origin[0], py - origin[1]) / 900, on = ss(d - 0.05, d + 0.08, k * 1.1);
      if (on <= 0) return;
      g.save(); g.globalAlpha = on * 0.85; g.fillStyle = 'rgba(150,20,15,.35)'; g.beginPath(); g.arc(px, py, 30 + 90 * on, 0, TAU); g.fill(); g.fillStyle = '#7a0d0a'; g.beginPath(); g.arc(px, py, 10, 0, TAU); g.fill(); g.restore();
    });
    g.save(); g.strokeStyle = 'rgba(120,15,10,.6)'; g.lineWidth = 3; g.setLineDash([6, 10]);
    g.beginPath(); g.arc(origin[0], origin[1], 900 * k, PI * 0.6, PI * 1.45); g.stroke(); g.restore();
  };
}
function sceneplague(t) {
  const sc = S.plague, L = i => Ls('plague', i);
  const st = [sc.start, L(1) - 0.3, L(2) - 0.3, L(3) - 0.2, C.plague.stayed - 1.6, L(6) - 0.3, L(8) - 0.3];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) { // legions returning from the East with a sickly mist behind them
    vgrad([[0, '#0f1414'], [0.6, '#3a4a38'], [0.8, '#6a6a40'], [1, '#141410']]);
    light(1500, 640, 700, '180,200,110', 0.25);
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.1, 800, 560, sh.e - sh.s]]);
    landscape(31, 800, 4, '#6e7e52', '#141a16', { haze: '170,195,120', amp: 180, blur: 5 });
    x.fillStyle = '#0c0f0c'; x.fillRect(-400, 840, W + 800, 400);
    x.strokeStyle = 'rgba(200,200,160,.12)'; x.lineWidth = 6; x.beginPath(); x.moveTo(-200, 900); x.quadraticCurveTo(900, 820, 2200, 880); x.stroke();
    legion(t, 900, 18, 120, '#060806', 'rgba(190,210,140,.4)', 11, -45, -200, W + 200, 115);
    standard(800 - (t - sh.s) * 45, 900, 300, '#050605', t);
    fgGrass(t, 33, 1010, '#040504', 130, 4, 70, true);
    x.restore();
    smoke(t, 9, '110,150,70', 0.22, 14, 500, 1000, 250, 520);
  } else if (sh.i === 1) { // spreading across the map
    fillAll('#0a0806');
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.12, 1100, 560, sh.e - sh.s]]);
    mapDraw(160, 130, 1.6, 1, t, { labels: [['rome', 'ROMA'], ['syria', 'SYRIA'], ['egypt', 'AEGYPTUS'], ['athens', 'ATHENAE']], spread: plagueSpread(0, t, sh.s, sh.e) });
    x.restore();
    shade(960, 540, 1200, 0.0);
  } else if (sh.i === 2 || sh.i === 3) { // silent night street; temple candles going out
    if (sh.i === 2) {
      vgrad([[0, '#05070a'], [1, '#0c0e10']]); stars(t, 60, 0.3, 4, 300); moon(1480, 180, 50, '#c8d0d8', 0.2);
      x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.15, 960, 600, sh.e - sh.s]]);
      x.fillStyle = '#0a0c0e'; poly([0, 0, 640, 300, 640, 900, 0, 1080]); x.fill(); poly([W, 0, 1280, 300, 1280, 900, W, 1080]); x.fill();
      x.fillStyle = '#08090b'; poly([640, 900, 1280, 900, W + 200, H + 100, -200, H + 100]); x.fill();
      for (let i = 0; i < 4; i++) { const dx = 120 + i * 130, dy = 360 + i * 120, dh = 260 - i * 40; x.fillStyle = '#050607'; x.fillRect(dx, dy, 70 - i * 10, dh); line([dx + 8, dy + 20, dx + 60 - i * 10, dy + dh - 30], 5, '#6a1410'); line([dx + 60 - i * 10, dy + 20, dx + 8, dy + dh - 30], 5, '#6a1410'); }
      for (let i = 0; i < 4; i++) { const dx = W - 190 - i * 130, dy = 360 + i * 120, dh = 260 - i * 40; x.fillStyle = '#050607'; x.fillRect(dx, dy, 70 - i * 10, dh); }
      torch(700, 520, 1, t, 2); light(700, 520, 300, '255,150,60', 0.35);
      x.fillStyle = '#050505'; x.fillRect(880, 760, 220, 70); ell(920, 840, 34, 34); x.fill(); ell(1060, 840, 34, 34); x.fill(); line([1100, 790, 1220, 740], 8, '#050505');
      x.fillStyle = '#1a1612'; poly([890, 760, 1090, 760, 1060, 720, 920, 724]); x.fill();
      x.restore();
      smoke(t, 8, '120,130,120', 0.16, 21, 500, 1000);
    } else {
      vgrad([[0, '#0e0a08'], [1, '#050302']]);
      x.save(); cam(t, [[sh.s, 1.45, 960, 660], [sh.s, 1.6, 960, 680, sh.e - sh.s]]);
      light(960, 640, 700, '255,170,80', 0.35 * (1 - ss(sh.s + 0.6, sh.s + 3.2, t)) + 0.08);
      x.fillStyle = '#1a120c'; x.fillRect(880, 420, 160, 260); ell(960, 410, 60, 66); x.fill(); // statue
      column(500, 150, 900, 90, '#120c08'); column(1420, 150, 900, 90, '#120c08');
      x.fillStyle = '#140d09'; x.fillRect(760, 700, 400, 200); x.fillRect(720, 680, 480, 30);
      smoke(t, 5, '120,110,100', 0.18, 33, 300, 700, 120, 260);
      for (let i = 0; i < 7; i++) { const out = ss(sh.s + 0.6 + i * 0.35, sh.s + 0.9 + i * 0.35, t), cx2 = 790 + i * 56; x.fillStyle = '#d8c6a6'; x.fillRect(cx2 - 7, 640, 14, 40); if (out < 1) flame(cx2, 640, 0.13, t, i, 1 - out); else { x.strokeStyle = 'rgba(200,200,200,.25)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx2, 636); x.bezierCurveTo(cx2 + 10, 600, cx2 - 10, 560, cx2 + 4, 520); x.stroke(); } }
      x.restore();
    }
  } else if (sh.i === 4) { // Marcus walks the streets with a torch; pyres in the distance
    vgrad([[0, '#0a0606'], [0.7, '#2a1208'], [1, '#0a0503']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.12, 1000, 600, sh.e - sh.s]]);
    for (let i = 0; i < 5; i++) { const px = 200 + i * 380; light(px, 720, 260, '255,120,40', 0.4); flame(px, 760, 0.5, t, i); }
    houses(55, 780, 20, -100, W + 100, 120, 260, '#0c0606', 'rgba(255,140,60,.6)', 0.5);
    x.fillStyle = '#080404'; x.fillRect(-400, 780, W + 800, 400);
    const wx = 500 + (t - sh.s) * 55;
    rimPerson(wx, 980, 330, '#050202', 'rgba(255,160,80,.8)', { laurel: true, beard: true, robe: true, cloak: true, walk: t * 3, arm: 0.6 });
    torch(wx + 52, 720 + Math.sin(t * 3) * 4, 1.4, t, 4);
    rimPerson(wx - 180, 980, 300, '#050202', 'rgba(255,160,80,.5)', { helmet: true, spear: true, walk: t * 3 + 2 });
    for (let i = 0; i < 4; i++) { const px = 1300 + i * 140; x.save(); x.translate(px, 990); x.fillStyle = '#060303'; ell(0, -60, 30, 34); x.fill(); poly([-40, 0, 40, 0, 30, -40, -30, -40]); x.fill(); x.restore(); }
    x.restore();
    embers(t, 30, '255,140,60', 90, 9, 0.8);
  } else if (sh.i === 5) { // why  ->  what is required
    fillAll('#060505'); light(960, 540, 900, '217,164,65', 0.12);
    rimPerson(260, 1080, 760, '#030202', 'rgba(217,164,65,.4)', { laurel: true, beard: true, robe: true, cloak: true });
    const a1 = ss(L(6) - 0.1, L(6) + 0.5, t), strike = ss(L(7) - 0.2, L(7) + 0.5, t), a2 = ss(L(7) + 0.2, L(7) + 0.8, t);
    textC('WHY IS THIS HAPPENING TO ME?', 1100, 400, '700 62px Cinzel', '#9a948c', 6, a1 * (1 - 0.5 * strike));
    if (strike > 0) { x.fillStyle = '#b3121b'; x.fillRect(1100 - 560, 398, 1120 * strike, 6); }
    x.save(); x.shadowColor = 'rgba(255,170,60,.6)'; x.shadowBlur = 30; textC('WHAT IS REQUIRED OF ME NOW?', 1100, 560, '900 76px Cinzel', GOLD2, 6, a2); x.restore();
  } else { // the question changes everything: dawn breaks over the city
    const k = ss(sh.s, sh.s + 3, t);
    vgrad([[0, `rgb(${lerp(10, 40, k)},${lerp(10, 30, k)},${lerp(14, 50, k)})`], [0.7, `rgb(${lerp(30, 230, k)},${lerp(20, 140, k)},${lerp(14, 70, k)})`], [1, '#140a06']]);
    light(960, 780, 900, '255,190,110', 0.6 * k); godrays(960, 820, 13, 1300, '255,210,150', 0.12 * k, t, 2.4, -PI / 2);
    romeSkyline(t, 860, { far: '#5a3a2a', mid: '#1e1212', near: '#0c0808', haze: '255,180,120' }, 'rgba(255,170,90,.5)', 9); motes(t, 80, [0, W, 300, 900], '255,210,150', 0.4, 12);
  }
}
