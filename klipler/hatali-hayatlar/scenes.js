// Scenes, one per song section. Inside the loud sections the camera cuts on the beat.
const S_ = n => SEC.find(s => s.n === n);
function sub(t, s, beats) { return Math.floor((t - s.a) / (BEAT * beats) + 1e-6); }            // which cut (every N beats)
function subT(t, s, beats) { const i = sub(t, s, beats); return t - (s.a + i * BEAT * beats); } // time inside the cut

// INTRO — darkness, a horizon catches fire, the title burns in
function sIntro(t) {
  const s = S_('intro'), k = ss(2, s.b, t);
  fillAll('#020101');
  x.save(); cam(t, [[0, 1.25, 960, 900], [0, 1.0, 960, 560, s.b]]);
  redSky(t, 0.4 * k); x.globalAlpha = k; ruins(3, 820, '#0a0303', 9); x.globalAlpha = 1;
  fireWall(t, 0.35 * k, { n: 18, y: 900, scale: 0.6, seed: 2 });
  lavaGround(t, 840, 0.3 * k);
  if (t > 7.6) rimKnight(960, 860, 150 * (1 + 0.2 * ss(7.6, 14, t)), t, { walk: t * 2.4, spread: 0.2, glow: 0.8 }, '255,140,60', ss(7.6, 10, t));
  x.restore();
  embers(t, 30 + 60 * k, '255,120,40', 60, 1, 0.8); ash(t, 120, 0.3 * k);
  title(t, 4.2, 12.6, 420, 140);
}
// VERSE 1 — he walks toward us through the burning waste
function sVerse1(t) {
  const s = S_('verse1'), half = s.a + (s.b - s.a) * 0.5, lt = t - s.a;
  redSky(t, 0.6 + 0.2 * beatP(t));
  x.save();
  if (t < half) cam(t, [[s.a, 1.0, 960, 560], [s.a, 1.08, 960, 600, half - s.a]]); else cam(t, [[half, 1.25, 960, 520], [half, 1.4, 960, 470, s.b - half]]);
  landscape(11, 760, 3, '#5a1a10', '#140504', { haze: '255,90,40', hazeA: 0.3, amp: 160, blur: 6 });
  ruins(7, 800, '#0c0303', 6); fireWall(t, 0.45, { n: 14, y: 830, scale: 0.7, seed: 5 });
  lavaGround(t, 800, 0.35 + 0.5 * beatP(t));
  const z = lerp(0.85, 1.25, ss(s.a, s.b, t));
  rimKnight(960, 1000, 520 * z, t, { walk: t * 2.6, spread: 0.25 + 0.1 * Math.sin(t), glow: 0.7 + 0.3 * beatP(t), wind: t * 1.2 }, '255,140,60');
  fgGrass(t, 13, 1050, '#040101', 60, 5, 50, true);
  x.restore();
  ash(t, 220, 0.5); embers(t, 50, '255,120,40', 90, 3, 0.9);
}
// DIP — the helmet in close-up; the visor ignites
function sDip(t) {
  const s = S_('dip'), k = ss(s.a, s.b, t);
  fillAll('#030101'); light(960, 300, 900, '200,40,10', 0.3 + 0.2 * k);
  smoke(t, 9, '60,20,10', 0.35, 4, 200, 1000, 260, 600);
  x.save(); cam(t, [[s.a, 1.0, 960, 540], [s.a, 1.12, 960, 520, s.b - s.a]]);
  rimKnight(960, 2050, 1900, t, { sword: 'none', spread: 0.2, glow: 0.3 + 0.7 * k + 0.3 * beatP(t), wind: t }, '255,130,50');
  x.restore();
  embers(t, 40, '255,140,60', 50, 7, 1.1); featherStorm(t * 0.5, 14, 0.2, 3);
}
// BUILD — fire columns erupt on every kick, cuts every 2 beats
function sBuild(t) {
  const s = S_('build'), i = sub(t, s, 2), lt = subT(t, s, 2), kp = kickP(t), k = ss(s.a, s.b, t);
  redSky(t, 0.8 + 0.4 * kp);
  x.save();
  const angles = [[1.0, 960, 560], [1.6, 960, 300], [1.3, 700, 650], [1.8, 960, 260], [1.2, 1180, 600], [2.2, 960, 260]][i % 6];
  cam(t, [[0, angles[0], angles[1], angles[2], 0], [t - lt, angles[0] * 1.06, angles[1], angles[2], BEAT * 2]]);
  landscape(21, 780, 3, '#6a1a0e', '#160504', { haze: '255,90,40', amp: 140, blur: 6 });
  M.kicks.filter(kt => kt >= s.a && kt <= t && t - kt < 1.4).forEach((kt, j) => { const e = (t - kt) / 1.4, px = 200 + R(Math.round(kt * 10)) * 1500; flame(px, 900, (3.6 + R(j) * 1.5) * (1 - e * 0.6), t, j * 3, 1 - e); });
  fireWall(t, 0.4 + 0.5 * k, { n: 16, y: 860, scale: 0.8, seed: 9 });
  fireTone(0.5);
  lavaGround(t, 840, 0.4 + 0.6 * kp);
  rimKnight(960, 1000, 600, t, { sword: 'down', spread: 0.3 + 0.3 * k, glow: 0.6 + 0.4 * kp, wind: t * 2 }, '255,150,60');
  x.restore();
  embers(t, 80 + 100 * k, '255,130,50', 160, 11, 1);
}
// DROP — the cover: knight before a wall of fire. Cuts every 4 beats; kicks punch.
function sDrop(t, s, seed, variant) {
  const i = sub(t, s, 4), lt = subT(t, s, 4), kp = kickP(t), e = energy(t);
  redSky(t, 1 + 0.3 * kp);
  fireStreaks(t, 0.7 + 0.3 * kp, seed);
  x.save();
  const views = [[1.0, 960, 540, 'down'], [1.55, 960, 420, 'down'], [1.25, 760, 560, 'slash'], [2.4, 960, 260, 'down'], [1.1, 1100, 560, 'up'], [1.8, 960, 640, 'down']];
  const v = views[(i + variant) % views.length];
  cam(t, [[0, v[0], v[1], v[2], 0], [t - lt, v[0] * 1.07, v[1] + 30, v[2], BEAT * 4]]);
  x.rotate(((i % 3) - 1) * 0.02);
  fireWall(t, 0.9 + 0.35 * kp, { n: 24, seed: seed + 1, scale: 1.1 });
  fireTone(0.5);
  lavaGround(t, 860, 0.6 + 0.4 * kp);
  const swd = v[3], slashK = swd === 'slash' ? cl(lt / (BEAT * 2), 0, 1) : 0;
  rimKnight(960, 1010, 640, t, { sword: swd, slash: slashK, spread: 0.55 + 0.25 * e, glow: 0.7 + 0.3 * kp, wind: t * 2.4, windAmp: 1.3 }, '255,160,70');
  if (swd === 'slash') slashArc(960 + 130, 1010 - 470, 340, -2.6, 0.7, lt / (BEAT * 1.5));
  x.restore();
  featherStorm(t, 26, e, seed + 2); embers(t, 140, '255,140,50', 220, seed, 1.2);
}
// VERSE 2 — shards of a broken mirror: the mistakes of a life
function sVerse2(t) {
  const s = S_('verse2'), k = ss(s.a, s.b, t), crack = ss(s.b - 1.2, s.b, t);
  fillAll('#040202'); light(960, 540, 1100, '160,40,20', 0.25); smoke(t, 8, '50,20,15', 0.3, 31, 100, 1000);
  x.save(); cam(t, [[s.a, 1.0, 960, 540], [s.a, 1.18, 1000, 540, s.b - s.a]]);
  for (let i = 0; i < 6; i++) {
    const ph = i * TAU / 6, cx = 960 + Math.cos(t * 0.12 + ph) * (520 + (i % 2) * 120) * (1 + crack), cy = 540 + Math.sin(t * 0.12 + ph) * (300 + (i % 2) * 40) * (1 + crack), sz = 170 + (i % 3) * 40 + 20 * beatP(t);
    shard(i, cx, cy, sz, Math.sin(t * 0.3 + ph) * 0.4 + crack * (i - 2.5), t, ss(s.a + i * 0.8, s.a + i * 0.8 + 1, t) * (1 - crack));
  }
  x.restore();
  embers(t, 50, '255,140,60', 50, 13, 0.8);
  if (crack > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = `rgba(255,240,220,${crack})`; x.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(960, 540); x.lineTo(960 + Math.cos(a) * 1200 * crack, 540 + Math.sin(a) * 1200 * crack); x.stroke(); } x.restore(); }
}
// DROP 2 — wraiths rise from the fire; he cuts through them on the kicks
function sDrop2(t) {
  const s = S_('drop2'), i = sub(t, s, 4), lt = subT(t, s, 4), kp = kickP(t), lk = lastKick(t);
  redSky(t, 0.9 + 0.3 * kp);
  const f = flashAt(t, M.kicks.filter(kk => kk > s.a && kk < s.b && Math.round(kk * 7) % 5 === 0));
  if (f > 0) { x.fillStyle = `rgba(255,200,170,${0.25 * f})`; x.fillRect(0, 0, W, H); }
  x.save();
  const v = [[1.0, 960, 560], [1.35, 820, 560], [1.6, 1080, 460], [1.15, 960, 600]][i % 4];
  cam(t, [[0, v[0], v[1], v[2], 0], [t - lt, v[0] * 1.06, v[1], v[2], BEAT * 4]]);
  landscape(41, 800, 3, '#701c0e', '#160504', { haze: '255,90,40', amp: 150, blur: 6 });
  fireWall(t, 0.75, { n: 20, y: 880, seed: 41 });
  fireTone(0.5);
  lavaGround(t, 860, 0.5 + 0.5 * kp);
  for (let j = 0; j < 5; j++) { const born = s.a + j * 3.2, die = M.kicks.find(kk => kk > born + 2.2) ?? born + 3, a = ss(born, born + 0.8, t) * (1 - ss(die, die + 0.5, t)); const wx = j % 2 ? 1400 + j * 40 : 520 - j * 40; wraith(wx, 1000, 520, t, a, j); if (t > die && t < die + 0.8) embers(t - die, 40, '255,100,40', 500, j * 7, 1.2, [wx - 120, wx + 120, 500, 1000]); }
  const sl = (t - lk) / (BEAT * 1.2);
  rimKnight(960, 1010, 600, t, { sword: 'slash', slash: cl(sl, 0, 1), spread: 0.6, glow: 0.9, wind: t * 2.6, windAmp: 1.4 }, '255,160,70');
  slashArc(960 + 120, 1010 - 440, 320, M.kicks.indexOf(lk) % 2 ? 0.7 : -2.6, M.kicks.indexOf(lk) % 2 ? -2.6 : 0.7, sl);
  x.restore();
  embers(t, 120, '255,130,50', 200, 17, 1.2); ash(t, 120, 0.4);
}
function flashAt(t, list) { let f = 0; for (const lt of list) { const k = t - lt; if (k >= 0 && k < 0.5) f = Math.max(f, Math.exp(-k * 10)); } return f; }
// BREAK — he falls to one knee; ash rains; the fire breathes
function sBreak(t) {
  const s = S_('break'), k = ss(s.a, s.b, t);
  fillAll('#050202'); light(960, 700, 900, '160,40,10', 0.18 + 0.1 * beatP(t));
  x.save(); cam(t, [[s.a, 1.0, 960, 560], [s.a, 1.3, 960, 520, s.b - s.a]]);
  ruins(51, 820, '#080202', 7); lavaGround(t, 840, 0.15);
  rimKnight(960, 1000, 560, t, { kneel: true, sword: 'plant', spread: 0.15, glow: 0.25, wind: t * 0.6, windAmp: 0.4 }, '255,120,50', 0.7);
  x.restore();
  ash(t, 400, 0.6, 5);
}
// RISE — he stands; ravens burst from his cloak; he walks through a burning gate
function sRise(t) {
  const s = S_('rise'), a1 = s.a + BEAT * 8, a2 = s.a + BEAT * 24, kp = kickP(t), e = energy(t);
  redSky(t, 1 + 0.2 * kp); fireStreaks(t, 0.6 + 0.3 * kp, 61);
  x.save();
  if (t < a1) { // standing up
    const up = ss(s.a, a1 - 0.3, t);
    cam(t, [[s.a, 1.4, 960, 560], [s.a, 1.0, 960, 540, a1 - s.a]]);
    fireWall(t, 0.5 + 0.5 * up, { n: 22, seed: 62 }); fireTone(0.5); lavaGround(t, 860, 0.5 + 0.5 * kp);
    rimKnight(960, 1010, 600, t, { kneel: up < 0.5, sword: up < 0.5 ? 'plant' : 'down', spread: 0.2 + 0.5 * up, glow: 0.3 + 0.7 * up, wind: t * 2 }, '255,160,70');
  } else if (t < a2) { // the gate
    const i = sub(t, s, 4), lt = subT(t, s, 4), v = [[1.0, 960, 540], [1.3, 960, 460], [1.15, 860, 560], [1.5, 1060, 420]][i % 4];
    cam(t, [[0, v[0], v[1], v[2], 0], [t - lt, v[0] * 1.05, v[1], v[2], BEAT * 4]]);
    x.fillStyle = '#0a0303'; x.fillRect(560, 140, 800, 760); x.fillStyle = '#020101'; x.beginPath(); x.moveTo(760, 900); x.lineTo(760, 420); x.arc(960, 420, 200, PI, 0); x.lineTo(1160, 900); x.fill();
    for (let j = 0; j < 9; j++) { x.fillStyle = '#0a0303'; x.fillRect(560 + j * 92, 100, 54, 50); }
    x.save(); x.beginPath(); x.moveTo(760, 900); x.lineTo(760, 420); x.arc(960, 420, 200, PI, 0); x.lineTo(1160, 900); x.clip(); fireWall(t, 1.1, { n: 10, seed: 63, scale: 0.9 }); x.restore();
    flame(560, 160, 1.4, t, 3); flame(1360, 160, 1.4, t, 5); lavaGround(t, 880, 0.6 + 0.4 * kp);
    rimKnight(960, 1040, 520 + (t - a1) * 18, t, { walk: t * 2.8, sword: 'down', spread: 0.5, glow: 1, wind: t * 2.2 }, '255,170,80');
  } else { // ravens
    const i = sub(t, s, 2), lt = subT(t, s, 2), v = [[1.0, 960, 540], [1.4, 900, 420], [1.2, 1100, 560], [1.7, 960, 300]][i % 4];
    cam(t, [[0, v[0], v[1], v[2], 0], [t - lt, v[0] * 1.08, v[1], v[2], BEAT * 2]]);
    fireWall(t, 1, { n: 22, seed: 64 }); fireTone(0.5); lavaGround(t, 860, 0.6 + 0.4 * kp);
    rimKnight(960, 1010, 620, t, { sword: 'up', spread: 0.9, glow: 1, wind: t * 3, windAmp: 1.6 }, '255,170,80');
    for (let j = 0; j < 40; j++) { const a = R(j) * TAU + (t - a2) * (0.6 + R(j + 3)), r = 120 + ((t - a2) * 260 + R(j * 5) * 400) % 1100; raven(960 + Math.cos(a) * r * 1.3, 520 + Math.sin(a) * r * 0.6, 1.4 + R(j * 7) * 1.8, t + j, '#050303', Math.sin(a) > 0 ? 1 : -1); }
  }
  x.restore();
  featherStorm(t, 20, e, 66); embers(t, 140, '255,140,50', 220, 19, 1.2);
}
// CALM — a lake of lava; his reflection is the man he was
function sCalm(t) {
  const s = S_('calm'), k = ss(s.a, s.b, t);
  vgrad([[0, '#05040c'], [0.5, '#1a0a14'], [0.62, '#3a0e08']]); stars(t, 160, 0.6, 5, 560); moon(1480, 200, 60, '#e8c8b0', 0.3);
  x.save(); cam(t, [[s.a, 1.1, 960, 560], [s.a, 1.0, 960, 540, s.b - s.a]]);
  landscape(71, 640, 3, '#2a1018', '#0a0406', { haze: '160,60,50', hazeA: 0.25, amp: 160, blur: 6 });
  const ly = 700; const g = x.createLinearGradient(0, ly, 0, H); g.addColorStop(0, '#ff7a2a'); g.addColorStop(0.3, '#a8300e'); g.addColorStop(1, '#2a0804'); x.fillStyle = g; x.fillRect(-400, ly, W + 800, H);
  x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const yy = ly + 10 + i * 13, xo = Math.sin(t * 1.2 + i) * 30; x.fillStyle = `rgba(255,210,140,${0.12 * (1 - i / 30)})`; x.fillRect(200 + xo, yy, 1500, 2); } x.restore();
  // reflection: an unarmoured man
  x.save(); x.translate(0, ly * 2 + 6); x.scale(1, -1); x.globalAlpha = 0.55 + 0.1 * Math.sin(t * 2); person(960 + Math.sin(t * 3) * 3, ly, 400, '#1a0603', { robe: true, beard: true, time: t }); x.restore();
  x.fillStyle = '#080303'; poly([600, ly + 4, 1320, ly + 4, 1240, ly - 30, 680, ly - 26]); x.fill();
  rimKnight(960, ly, 400, t, { sword: 'down', spread: 0.25, glow: 0.5, wind: t * 0.8, windAmp: 0.5 }, '255,150,90', 0.8);
  x.restore();
  embers(t, 40, '255,150,60', 40, 23, 0.8);
}
// FINAL — wings of feathers open, the sword rises, everything burns
function sFinal(t) {
  const s = S_('final'), i = sub(t, s, 2), lt = subT(t, s, 2), kp = kickP(t), e = energy(t), k = ss(s.a, s.a + 4, t);
  redSky(t, 1.2 + 0.4 * kp); fireStreaks(t, 0.9 + 0.3 * kp, 81);
  const f = flashAt(t, M.kicks.filter(kk => kk > s.a && kk < s.b)); if (f > 0.4) { const lx = 300 + R(Math.floor(t * 3)) * 1300; lightningBolt(lx, 0, lx + 120, 600, Math.floor(t * 3), f); }
  x.save();
  const v = [[1.0, 960, 540], [1.5, 960, 360], [1.25, 800, 560], [2.0, 960, 240], [1.15, 1120, 520], [1.7, 960, 640], [1.0, 960, 560], [2.6, 960, 220]][i % 8];
  cam(t, [[0, v[0], v[1], v[2], 0], [t - lt, v[0] * 1.08, v[1], v[2], BEAT * 2]]);
  x.rotate(((i % 3) - 1) * 0.025);
  light(960, 460, 900, '255,170,80', 0.35 + 0.3 * kp);
  fireWall(t, 1.2 + 0.4 * kp, { n: 26, seed: 82, scale: 1.25 });
  fireTone(0.5);
  lavaGround(t, 860, 0.8 + 0.2 * kp);
  rimKnight(960, 1010, 660, t, { sword: 'up', spread: 0.6 + 0.4 * k, glow: 1, wind: t * 3.2, windAmp: 1.8 }, '255,190,100');
  x.restore();
  featherStorm(t, 40, e, 86); embers(t, 200, '255,150,50', 260, 29, 1.3);
}
function lightningBolt(x0, y0, x1, y1, seed, a) { const pts = [x0, y0]; for (let i = 1; i <= 12; i++) pts.push(lerp(x0, x1, i / 12) + (R(i * 7 + seed) - 0.5) * 140, lerp(y0, y1, i / 12)); x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = a; [[22, 'rgba(255,150,90,.25)'], [8, 'rgba(255,210,170,.6)'], [3, '#fff']].forEach(([w, c]) => line(pts, w, c)); x.restore(); }
// OUTRO — the fire dies; he walks away; the title
function sOutro(t) {
  const s = S_('outro'), k = ss(s.a, s.b - 2, t);
  redSky(t, 0.6 * (1 - k)); x.fillStyle = `rgba(0,0,0,${0.6 * k})`; x.fillRect(0, 0, W, H);
  x.save(); cam(t, [[s.a, 1.2, 960, 540], [s.a, 1.0, 960, 560, s.b - s.a]]);
  ruins(91, 820, '#060202', 8); fireWall(t, 0.6 * (1 - k), { n: 16, y: 900, scale: 0.7, seed: 91 }); lavaGround(t, 840, 0.3 * (1 - k));
  rimKnight(960, 900 - 120 * k, 520 * (1 - 0.65 * k), t, { back: true, walk: t * 2.4, spread: 0.3, wind: t * 1.2 }, '255,140,60', 1 - k * 0.6);
  x.restore();
  ash(t, 200, 0.5 * (1 - k * 0.5)); embers(t, 50 * (1 - k) + 10, '255,120,40', 50, 31, 0.8);
  title(t, s.a + 4.5, s.b - 0.3, 520, 130);
}
const SCN = { intro: sIntro, verse1: sVerse1, dip: sDip, build: sBuild, drop1: t => sDrop(t, S_('drop1'), 3, 0), verse2: sVerse2, drop2: sDrop2, break: sBreak, rise: sRise, calm: sCalm, final: sFinal, outro: sOutro };
