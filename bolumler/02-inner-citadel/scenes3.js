// Scenes: tools, legacy, outro
function icon(i, cx, cy, s, t, a) {
  x.save(); x.globalAlpha = a; x.translate(cx, cy); x.scale(s, s); x.strokeStyle = GOLD; x.fillStyle = GOLD; x.lineWidth = 6;
  if (i === 0) { x.beginPath(); x.arc(0, 30, 70, PI, 0); x.stroke(); for (let k = 0; k < 7; k++) { const an = PI + k * PI / 6; line([Math.cos(an) * 95, 30 + Math.sin(an) * 95, Math.cos(an) * 125, 30 + Math.sin(an) * 125], 6, GOLD); } line([-150, 30, 150, 30], 6, GOLD); }
  if (i === 1) { x.beginPath(); x.ellipse(0, 0, 140, 46, -0.3, 0, TAU); x.stroke(); ell(0, 0, 44, 44); x.fill(); const an = t * 0.8; ell(Math.cos(an) * 140 * Math.cos(-0.3) - Math.sin(an) * 46 * Math.sin(-0.3), Math.cos(an) * 140 * Math.sin(-0.3) + Math.sin(an) * 46 * Math.cos(-0.3), 12, 12); x.fill(); }
  if (i === 2) { x.restore(); hourglass(cx, cy, 0.45 * s, (t * 0.05) % 1, t); return; }
  x.restore();
}
function viewAbove(t, s) { // s: 0 room .. 1 city .. 2 earth .. 3 point in time
  fillAll('#020306'); stars(t, 400, cl(s - 1.2, 0.15, 1), 21);
  const f = n => Math.pow(4, n - s), cx = 960, cy = 540;
  // room (top-down)
  let k = f(0), a = 1 - ss(0.9, 1.4, s);
  if (a > 0 && k > 0.02) { x.save(); x.globalAlpha = a; x.translate(cx, cy); x.scale(k, k); x.fillStyle = '#2a1a10'; x.fillRect(-460, -300, 920, 600); x.strokeStyle = '#140a04'; x.lineWidth = 16; x.strokeRect(-460, -300, 920, 600); x.fillStyle = '#4a2c18'; x.fillRect(-160, -80, 320, 150); parchment(-80, -60, 120, 80, 1); light(110, -40, 240, '255,170,80', 0.6); x.fillStyle = '#0c0604'; ell(0, 120, 70, 46); x.fill(); ell(0, 110, 34, 34); x.fill(); x.restore(); }
  // city lights (top-down grid)
  k = f(1) * 0.9; a = ss(0.5, 0.9, s) * (1 - ss(1.9, 2.4, s));
  if (a > 0) { x.save(); x.globalAlpha = a; x.translate(cx, cy); x.scale(k, k); x.fillStyle = '#0a0a10'; x.fillRect(-1000, -600, 2000, 1200); for (let i = 0; i < 600; i++) { const px = (R(i) - 0.5) * 1900, py = (R(i + 9) - 0.5) * 1100; if (Math.hypot(px / 1.6, py) > 520) continue; x.fillStyle = `rgba(255,${180 + 50 * R(i + 3)},110,${0.5 + 0.5 * R(i + 5)})`; x.fillRect(px, py, 6, 6); } x.strokeStyle = 'rgba(255,190,120,.25)'; x.lineWidth = 5; for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(i * 90, -500); x.lineTo(i * 90 + 60, 500); x.stroke(); x.beginPath(); x.moveTo(-800, i * 70); x.lineTo(800, i * 70 + 30); x.stroke(); } x.fillStyle = '#2a1a10'; x.fillRect(-460 / 4, -300 / 4, 920 / 4, 600 / 4); x.restore(); }
  // earth
  k = f(2) * 0.75; a = ss(1.5, 1.9, s);
  if (a > 0) {
    const r = 420 * k; x.save(); x.globalAlpha = a;
    light(cx, cy, r * 2.2, '90,150,255', 0.35);
    const g = x.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r); g.addColorStop(0, '#2a5a8a'); g.addColorStop(0.7, '#0e2a4a'); g.addColorStop(1, '#040c18'); x.fillStyle = g; ell(cx, cy, r, r); x.fill();
    x.save(); ell(cx, cy, r, r); x.clip(); x.fillStyle = '#1a3a26'; for (let i = 0; i < 7; i++) { ell(cx + (R(i) - 0.5) * r * 1.4 + Math.sin(t * 0.05) * r * 0.2, cy + (R(i + 4) - 0.5) * r * 1.2, r * (0.18 + R(i + 2) * 0.25), r * (0.12 + R(i + 6) * 0.2), R(i) * 3); x.fill(); } x.fillStyle = 'rgba(0,0,0,.55)'; ell(cx + r * 0.55, cy + r * 0.2, r * 0.9, r * 1.2); x.fill(); for (let i = 0; i < 80; i++) { const px = cx + r * 0.2 + R(i) * r * 0.7, py = cy - r * 0.6 + R(i + 7) * r * 1.2; x.fillStyle = 'rgba(255,200,120,.7)'; x.fillRect(px, py, 2.5, 2.5); } x.restore();
    x.strokeStyle = 'rgba(140,190,255,.5)'; x.lineWidth = Math.max(1, 6 * k); ell(cx, cy, r + 3, r + 3); x.stroke();
    x.restore();
  }
}
function sceneTools(t) {
  const sc = S.tools, L = i => Ls('tools', i);
  const st = [sc.start, L(1) - 0.2, L(4) - 0.2, L(8) - 0.2, L(10) - 0.2];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) {
    fillAll('#060505'); light(960, 540, 900, '217,164,65', 0.1);
    const labels = ['PREPARE', 'THE VIEW FROM ABOVE', 'MEMENTO MORI'];
    for (let i = 0; i < 3; i++) { const a = ss(sh.s + 0.8 + i * 0.7, sh.s + 1.4 + i * 0.7, t), cx = 480 + i * 480; icon(i, cx, 460, 1, t, a); textC(['I', 'II', 'III'][i], cx, 260, '900 48px Cinzel', GOLD, 8, a); textC(labels[i], cx, 680, '700 30px Cinzel', '#efe4cf', 5, a); }
  } else if (sh.i === 1) { // morning premeditation at dawn
    const k = ss(sh.s, sh.s + 4, t);
    vgrad([[0, `rgb(${lerp(10, 40, k)},${lerp(12, 30, k)},${lerp(30, 60, k)})`], [0.6, `rgb(${lerp(40, 230, k)},${lerp(30, 120, k)},${lerp(40, 70, k)})`], [1, '#140c0a']]);
    light(1300, 760, 800, '255,180,100', 0.55 * k); godrays(1300, 780, 11, 1300, '255,200,140', 0.09 * k, t, 2, -PI / 2);
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.1, 900, 560, sh.e - sh.s]]);
    ridge(141, 760, 140, 0.002, '#2a1a1a'); for (let i = 0; i < 7; i++) tent(200 + i * 250, 860, 0.6, '#140a0a', 0, t);
    x.fillStyle = '#0a0606'; x.fillRect(-400, 860, W + 800, 400);
    rimPerson(560, 1000, 440, '#050303', 'rgba(255,190,120,.85)', { laurel: true, beard: true, robe: true, cloak: true, dir: 1, wind: t });
    x.restore();
    const ready = ss(C.tools.ready - 0.1, C.tools.ready + 0.8, t);
    ['INSULT', 'DELAY', 'BETRAYAL', 'LOSS', 'FEAR'].forEach((w, i) => { const a = ss(L(2) + i * 0.45, L(2) + i * 0.45 + 0.5, t); textC(w, 980 + (i % 3) * 300, 220 + i * 70 + Math.sin(t + i) * 8, '700 40px Cinzel', ready > 0 ? `rgba(246,214,140,${1 - ready * 0.4})` : '#d8d0c8', 8, a * (1 - 0.6 * ready)); });
    textC('I · PREPARE', 160, 140, '900 50px Cinzel', GOLD2, 12, win(t, sh.s + 0.2, sh.e - 0.6), 'left');
  } else if (sh.i === 2) { // the view from above — continuous zoom out
    const s = lerp(0, 0.2, ss(sh.s, C.tools.room, t)) + ss(C.tools.room, C.tools.city + 0.3, t) * 0.85 + ss(C.tools.city, C.tools.earth + 0.4, t) * 0.95 + ss(C.tools.earth, C.tools.point + 1.2, t) * 1.3;
    viewAbove(t, s);
    const lab = [['YOUR ROOM', C.tools.room, C.tools.city], ['YOUR CITY', C.tools.city, C.tools.earth], ['THE EARTH', C.tools.earth, C.tools.point], ['A POINT IN ENDLESS TIME', C.tools.point, L(6)]];
    lab.forEach(([w, a0, a1]) => textC(w, 960, 250, '900 46px Cinzel', '#e6eef8', 12, win(t, a0, a1 - 0.2, 0.3, 0.3)));
    ['ARGUMENT', 'EMBARRASSMENT', 'FEAR'].forEach((w, i) => { const t0 = wordTimeAt(7, ['argument', 'embarrassment', 'fear'][i]), a = ss(t0 - 0.1, t0 + 0.3, t), shrink = ss(wordTimeAt(7, 'shrink') - 0.2, wordTimeAt(7, 'shrink') + 1.2, t); if (a <= 0) return; x.save(); x.translate(lerp([480, 960, 1440][i], 960, shrink), lerp([700, 820, 700][i], 540, shrink)); x.scale(1 - shrink * 0.97, 1 - shrink * 0.97); textC(w, 0, 0, '900 46px Cinzel', '#ffffff', 6, a); x.restore(); });
    textC('II · THE VIEW FROM ABOVE', 160, 140, '900 34px Cinzel', GOLD2, 10, win(t, sh.s + 0.2, sh.e - 0.6), 'left');
  } else if (sh.i === 3) { // memento mori
    fillAll('#050403'); light(1300, 520, 700, '255,160,70', 0.35);
    x.save(); cam(t, [[sh.s, 1.15, 960, 600], [sh.s, 1.0, 960, 540, sh.e - sh.s]]);
    x.fillStyle = '#0e0905'; x.fillRect(-400, 820, W + 800, 400);
    const sand = ss(sh.s, sh.e + 6, t);
    hourglass(960, 610, 1.0, sand, t);
    skull(560, 720, 1.0, '#cbbfa8'); shade(520, 760, 260, 0.45);
    x.fillStyle = '#d8c6a6'; x.fillRect(1290, 600, 40, 220); flame(1310, 600, 0.35, t, 7);
    x.restore();
    textC('MEMENTO MORI', 960, 140, '900 64px Cinzel', GOLD2, 22, win(t, sh.s + 0.3, L(9) - 0.4));
    textC('III · REMEMBER YOU WILL DIE', 160, 1000, '900 34px Cinzel', GOLD2, 10, win(t, sh.s + 0.2, sh.e - 0.6), 'left');
  } else { // a gift: dawn; anger, envy, opinions blow away like sand
    const k = ss(sh.s, sh.s + 3, t);
    vgrad([[0, `rgb(${lerp(10, 50, k)},${lerp(10, 40, k)},${lerp(16, 70, k)})`], [0.65, `rgb(${lerp(30, 240, k)},${lerp(20, 150, k)},${lerp(14, 80, k)})`], [1, '#1a100a']]);
    light(960, 800, 1000, '255,200,120', 0.6 * k); godrays(960, 820, 15, 1400, '255,220,160', 0.13 * k, t, 2.6, -PI / 2);
    ridge(151, 840, 90, 0.0018, '#2a1810'); x.fillStyle = '#120a06'; x.fillRect(-400, 860, W + 800, 400);
    const wt = L(11);
    ['ANGER', 'ENVY', 'THE OPINIONS OF STRANGERS'].forEach((w, i) => {
      const t0 = wordTimeAt(11, ['anger', 'envy', 'strangers'][i]), a = ss(t0 - 0.1, t0 + 0.3, t), blow = ss(t0 + 0.8, t0 + 2.6, t); if (a <= 0) return;
      const cx = 960, cy = 300 + i * 120;
      if (blow < 0.05) textC(w, cx, cy, '900 56px Cinzel', '#efe4cf', 8, a);
      else { x.save(); x.globalCompositeOperation = 'lighter'; for (let p = 0; p < 90; p++) { const px = cx + (R(p + i * 100) - 0.5) * w.length * 34 + blow * (300 + R(p) * 900), py = cy + (R(p + 5) - 0.5) * 40 - blow * R(p + 9) * 200; x.globalAlpha = (1 - blow) * 0.8; x.fillStyle = '#f6d68c'; x.fillRect(px, py, 4, 4); } x.restore(); textC(w, cx, cy, '900 56px Cinzel', '#efe4cf', 8, a * (1 - blow * 1.4)); }
    });
  }
}

// =====================================================================
//  VII · THE LEGACY
// =====================================================================
function sceneLegacy(t) {
  const sc = S.legacy, L = i => Ls('legacy', i);
  const st = [sc.start, L(1) - 0.2, L(2) - 0.2, L(3) - 0.2, L(4) - 0.2];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) { // a lamp goes out in the winter camp
    vgrad([[0, '#02030a'], [1, '#0a0e18']]); stars(t, 200, 0.7, 31, 600);
    const out = ss(sh.e - 1.8, sh.e - 0.6, t);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.25, 960, 640, sh.e - sh.s]]);
    ridge(161, 640, 120, 0.002, '#060a14'); x.fillStyle = '#c4ccd8'; x.fillRect(-400, 760, W + 800, 400); x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(-400, 760, W + 800, 400);
    tent(960, 880, 1.6, '#04060c', 1 - out, t);
    x.restore(); snowfall(t, 160, 20, 0.6, 33, 0.8);
    textC('180 AD', 160, 150, '900 56px Cinzel', '#e6eaf0', 14, win(t, sh.s + 0.5, sh.e - 1), 'left');
  } else if (sh.i === 1) { // the notebook travels through the centuries
    fillAll('#070505'); godrays(960, -200, 9, 1400, '255,210,150', 0.08, t, 0.8, PI / 2);
    const k = ss(sh.s, sh.e, t), year = Math.round(lerp(180, 2026, Math.pow(k, 1.6)));
    const figs = [{ laurel: true, beard: true, robe: true }, { helmet: true, spear: true, cloak: true }, { robe: true, cloak: true }, { beard: true }], fi = Math.min(3, Math.floor(k * 4));
    rimPerson(1500, 1000, 620, '#050303', 'rgba(217,164,65,.5)', figs[fi]);
    rimPerson(420, 1000, 600, '#050303', 'rgba(217,164,65,.5)', figs[(fi + 2) % 4], [3, -2]);
    x.save(); x.translate(960, 540); x.rotate(Math.sin(t * 0.6) * 0.03); x.fillStyle = '#e8dcc4'; x.fillRect(-260, -170, 520, 340); x.fillStyle = '#3a1a10'; x.fillRect(-6, -176, 12, 352);
    const flip = (t * 2.2) % 1; x.save(); x.scale(Math.cos(flip * PI), 1); x.fillStyle = '#f2e8d4'; x.fillRect(0, -165, 250, 330); x.restore();
    x.strokeStyle = 'rgba(80,60,40,.35)'; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(-230, -120 + i * 32); x.lineTo(-30, -120 + i * 32); x.stroke(); }
    x.restore();
    textC(String(year), 960, 830, '900 120px Cinzel', GOLD2, 16, 1);
  } else if (sh.i === 2) { // prison cell, battlefield, hospital room
    fillAll('#050404');
    const words = ['prison', 'battlefields', 'hospital'], labs = ['A PRISON CELL', 'A BATTLEFIELD', 'A HOSPITAL ROOM'], pw = W / 3;
    words.forEach((w, i) => {
      const t0 = wordTimeAt(2, w), a = ss(t0 - 0.3, t0 + 0.3, t); if (a <= 0) return; const px = i * pw;
      x.save(); x.beginPath(); x.rect(px + 6, 6, pw - 12, H - 12); x.clip(); x.globalAlpha = a;
      if (i === 0) { vgrad([[0, '#0a0a0c'], [1, '#050506']]); x.fillStyle = 'rgba(200,210,230,.12)'; poly([px + 330, 180, px + 450, 180, px + 520, 900, px + 260, 900]); x.fill(); x.fillStyle = '#1a1a20'; x.fillRect(px + 320, 170, 140, 110); for (let k = 0; k < 4; k++) x.fillRect(px + 336 + k * 34, 170, 8, 110); rimPerson(px + 300, 900, 300, '#050505', 'rgba(200,210,230,.5)', { sit: true, beard: true }); }
      if (i === 1) { vgrad([[0, '#1a0a06'], [1, '#050302']]); campfire(px + 330, 880, 1.2, t, 5); rimPerson(px + 200, 900, 300, '#050302', 'rgba(255,150,70,.7)', { sit: true, helmet: true }); for (let k = 0; k < 5; k++) line([px + 60 + k * 120, 900, px + 70 + k * 120, 620], 4, '#0a0402'); }
      if (i === 2) { vgrad([[0, '#0a0c10'], [1, '#050607']]); x.fillStyle = '#1c1e24'; x.fillRect(px + 80, 760, 440, 50); x.fillRect(px + 90, 810, 16, 100); x.fillRect(px + 494, 810, 16, 100); x.fillStyle = '#2a2c34'; x.fillRect(px + 80, 730, 120, 40); lamp(px + 470, 700, 0.8, t); rimPerson(px + 260, 760, 200, '#060608', 'rgba(255,190,120,.6)', { sit: true }); }
      x.restore();
      textC(labs[i], px + pw / 2, 230, '700 34px Cinzel', '#efe4cf', 8, a);
    });
    x.fillStyle = '#050404'; for (let i = 1; i < 3; i++) x.fillRect(i * pw - 6, 0, 12, H);
    x.save(); x.shadowColor = 'rgba(255,170,60,.6)'; x.shadowBlur = 30; textC('STRENGTH', 960, 120, '900 70px Cinzel', GOLD2, 24, ss(wordTimeAt(2, 'strength') - 0.1, wordTimeAt(2, 'strength') + 0.5, t)); x.restore();
  } else if (sh.i === 3) { // ruins of Rome under the moon
    vgrad([[0, '#05060c'], [0.7, '#141826'], [1, '#06070a']]); stars(t, 180, 0.6, 41, 560); moon(1400, 220, 80, '#e8e0cc', 0.4);
    x.save(); cam(t, [[sh.s, 1.12, 960, 600], [sh.s, 1.0, 960, 540, sh.e - sh.s]]);
    ridge(171, 760, 80, 0.002, '#0c0e16');
    colosseum(1250, 860, 620, 300, '#0a0c12'); x.fillStyle = '#05060a'; poly([1560, 860, 1560, 560, 1500, 620, 1440, 600, 1380, 700, 1300, 640, 1250, 860]); x.fill();
    column(300, 380, 900, 80, '#0a0c12'); column(520, 600, 900, 70, '#0a0c12'); x.fillStyle = '#0a0c12'; poly([450, 600, 590, 600, 560, 540, 520, 570, 480, 530]); x.fill();
    x.fillStyle = '#06070b'; x.fillRect(-400, 880, W + 800, 400); for (let i = 0; i < 8; i++) { x.fillRect(200 + i * 180, 870 - R(i) * 40, 90 + R(i + 1) * 60, 40); }
    for (let i = 0; i < 30; i++) line([R(i) * W, 900, R(i) * W + (R(i + 1) - 0.5) * 30, 840 - R(i + 2) * 60], 3, '#0c140c');
    x.restore();
    smoke(t, 6, '150,150,170', 0.1, 171, 700, 1000);
  } else { // the citadel still stands; the gate opens
    const k = ss(sh.s, sh.s + 3, t), open = ss(C.legacy.enter - 0.2, C.legacy.enter + 1.8, t);
    vgrad([[0, `rgb(${lerp(8, 30, k)},${lerp(10, 26, k)},${lerp(20, 44, k)})`], [0.65, `rgb(${lerp(30, 200, k)},${lerp(24, 110, k)},${lerp(30, 60, k)})`], [1, '#100a08']]);
    light(960, 700, 900, '255,190,110', 0.4 * k);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [C.legacy.enter, 1.35, 960, 600, 3]]);
    ridge(181, 860, 100, 0.002, '#1a1210');
    fortress(960, 760, 0.7, '#0a0606', 0.8, t, 1, 'rgba(255,190,120,.55)');
    if (open > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = `rgba(255,210,140,${0.8 * open})`; x.beginPath(); x.moveTo(960 - 35 * open, 760); x.lineTo(960 - 35 * open, 697); x.arc(960, 697, 35 * open, PI, 0); x.lineTo(960 + 35 * open, 760); x.fill(); poly([960 - 35 * open, 760, 960 + 35 * open, 760, 1200, 1100, 720, 1100]); x.fillStyle = `rgba(255,200,130,${0.25 * open})`; x.fill(); x.restore(); light(960, 730, 400, '255,200,130', 0.6 * open); }
    x.fillStyle = '#0a0606'; x.fillRect(-400, 860, W + 800, 400);
    x.restore();
    embers(t, 30, '255,210,150', 40, 43, 0.7);
  }
}

// =====================================================================
//  OUTRO
// =====================================================================
function stoaColumn(cx, cy, h, a) {
  x.save(); x.globalAlpha = a; x.translate(cx, cy);
  const g = x.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#8a6424'); g.addColorStop(0.5, GOLD2); g.addColorStop(1, '#7a5520'); x.fillStyle = g;
  x.fillRect(-150, -h / 2, 300, 26); x.fillRect(-120, -h / 2 + 26, 240, 22);
  x.beginPath(); x.arc(-110, -h / 2 + 50, 26, 0, TAU); x.arc(110, -h / 2 + 50, 26, 0, TAU); x.fill();
  x.fillRect(-90, -h / 2 + 60, 180, h - 130);
  x.fillStyle = 'rgba(40,25,8,.55)'; for (let k = 1; k < 6; k++) x.fillRect(-90 + k * 30 - 3, -h / 2 + 78, 6, h - 166);
  x.fillStyle = g; x.fillRect(-120, h / 2 - 70, 240, 26); x.fillRect(-150, h / 2 - 44, 300, 44);
  x.restore();
}
function sceneOutro(t) {
  const sc = S.outro, L = i => Ls('outro', i);
  const st = [sc.start, L(1) - 0.3, L(2) - 0.3, L(3) - 0.2, L(5) - 0.3];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0 || sh.i === 1) { // the last page, by candlelight
    fillAll('#080503'); light(1250, 480, 800, '255,160,70', 0.35);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.1, 960, 560, sh.e - sh.s]]);
    x.fillStyle = '#120a05'; x.fillRect(-400, 720, W + 800, 400);
    parchment(620, 560, 680, 200, 1); x.strokeStyle = 'rgba(60,40,20,.45)'; x.lineWidth = 3; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(660, 600 + i * 36); x.lineTo(1100 - i * 60, 600 + i * 36); x.stroke(); }
    x.fillStyle = '#d8c6a6'; x.fillRect(1290, 520, 40, 200); flame(1310, 520, 0.35, t, 2);
    x.restore();
  } else if (sh.i === 2) { // BE ONE.
    fillAll('#030202'); light(960, 540, 900, '255,170,60', 0.18 * ss(sh.s, sh.s + 1, t));
    embers(t, 60, '255,170,70', 80, 51, 0.9);
  } else if (sh.i === 3) { // tomorrow morning: a window at sunrise
    const k = ss(sh.s, sh.s + 4, t);
    fillAll('#060403');
    x.save(); x.beginPath(); x.rect(560, 160, 800, 700); x.clip();
    vgrad([[0, `rgb(${lerp(20, 70, k)},${lerp(20, 60, k)},${lerp(40, 100, k)})`], [0.6, `rgb(${lerp(60, 250, k)},${lerp(40, 160, k)},${lerp(40, 90, k)})`], [1, '#2a1a10']], 160, 860);
    light(960, 760, 600, '255,210,140', 0.7 * k); ridge(191, 800, 80, 0.002, '#2a1a14');
    fortress(1180, 760, 0.2, `rgba(20,12,10,${0.6})`, 0.3 * k, t, 1);
    x.restore();
    x.fillStyle = '#0a0705'; x.fillRect(540, 140, 840, 24); x.fillRect(540, 856, 840, 24); x.fillRect(540, 140, 24, 740); x.fillRect(1356, 140, 24, 740); x.fillRect(948, 140, 24, 740); x.fillRect(540, 500, 840, 18);
    godrays(960, 600, 9, 1300, '255,200,140', 0.08 * k, t, 0.8, PI / 2 + 0.3);
    rimPerson(760, 1080, 560, '#040302', 'rgba(255,200,130,.7)', { robe: true, beard: false, cloak: true, dir: 1 });
  } else { // logo
    fillAll('#040303'); const lg = sh.s + 0.3, k = ss(lg, lg + 0.6, t);
    light(960, 420, 800, '255,150,60', 0.3 * k);
    stoaColumn(960, 380, 380 * (0.85 + 0.15 * easeBack(k)), k);
    x.save(); x.font = '900 150px Cinzel'; x.letterSpacing = '30px'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = k;
    const gx = ((t - lg) * 600) % 1600 + 160, g = x.createLinearGradient(gx - 160, 0, gx + 160, 0); g.addColorStop(0, GOLD); g.addColorStop(0.5, '#fff6dc'); g.addColorStop(1, GOLD);
    x.fillStyle = g; x.shadowColor = 'rgba(255,160,50,.5)'; x.shadowBlur = 40; x.fillText('STOA', 960 + 15, 690); x.restore();
    textC('ONE LESSON AT A TIME', 960, 800, '700 40px Cinzel', '#eadfcf', 14, ss(lg + 0.4, lg + 1, t));
    const bA = ss(lg + 1.0, lg + 1.5, t), pulse = 1 + 0.03 * Math.sin((t - lg) * 5);
    if (bA > 0) { x.save(); x.globalAlpha = bA; x.translate(960, 920); x.scale(pulse, pulse); x.beginPath(); x.roundRect(-200, -44, 400, 88, 44); x.fillStyle = GOLD; x.fill(); x.font = '900 38px Cinzel'; x.letterSpacing = '8px'; x.fillStyle = '#140c05'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SUBSCRIBE', 4, 2); x.restore(); }
    embers(t, 50, '255,160,60', 90, 61, 0.9);
  }
}
