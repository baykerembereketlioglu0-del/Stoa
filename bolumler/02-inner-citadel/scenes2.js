// Scenes: frontier, betrayal, citadel
function palm(cx, base, h, col, t = 0) {
  x.strokeStyle = col; x.lineWidth = h * 0.05; x.beginPath(); x.moveTo(cx, base); x.quadraticCurveTo(cx + h * 0.12, base - h * 0.5, cx + h * 0.04, base - h); x.stroke();
  x.fillStyle = col; const tx = cx + h * 0.04, ty = base - h;
  for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.48 + Math.sin(t + i) * 0.04, L2 = h * 0.42; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a - 0.3) * L2 * 0.6, ty + Math.sin(a - 0.3) * L2 * 0.6 - 10, tx + Math.cos(a) * L2, ty + Math.sin(a) * L2 + L2 * 0.35); x.quadraticCurveTo(tx + Math.cos(a + 0.2) * L2 * 0.5, ty + Math.sin(a + 0.2) * L2 * 0.5, tx, ty); x.fill(); }
}
function tentInterior(t, dim = 0) {
  vgrad([[0, '#1c0f07'], [0.5, '#3a2210'], [1, '#120904']]);
  for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(0,0,0,${0.12 + 0.1 * R(i)})`; x.fillRect(i * 150 + Math.sin(t * 0.5 + i) * 4, 0, 60, 760); }
  x.fillStyle = '#0c0603'; x.fillRect(-400, 760, W + 800, 400);
  const fl = 0.9 + 0.1 * Math.sin(t * 9) * Math.sin(t * 4.1);
  light(1180, 640, 900 * fl, '255,150,60', 0.45 - 0.25 * dim);
  // big flickering shadow on the tent wall
  shade(640 + Math.sin(t * 2) * 8, 420, 520, 0.45); // his shadow on the tent wall
  // table, stool, Marcus writing
  x.fillStyle = '#140a04'; x.fillRect(880, 700, 560, 26); line([920, 726, 920, 900], 18, '#140a04'); line([1400, 726, 1400, 900], 18, '#140a04');
  parchment(1000, 666, 260, 38, 0.95);
  x.fillStyle = '#100803'; x.fillRect(790, 846, 120, 16); line([800, 862, 796, 900], 10, '#100803'); line([900, 862, 904, 900], 10, '#100803'); // stool
  rimPerson(840, 900, 400, '#070402', 'rgba(255,170,90,.9)', { sit: true, beard: true, robe: true, cloak: true, laurel: true, laurelCol: '#2a1a08', arm: 0.62 + 0.05 * Math.sin(t * 5), bend: 0.5 }, [5, -3]);
  line([1010, 640, 1040, 690], 3, '#e9dcc6');
  lamp(1240, 690, 0.9, t);
  shade(960, 540, 1200, 0.3 + 0.4 * dim);
}
function sceneFrontier(t) {
  const sc = S.frontier, L = i => Ls('frontier', i);
  const st = [sc.start, L(1) - 0.3, L(2) - 0.3, L(4) - 0.4, L(5) - 0.2, L(6) - 0.2, L(8) - 0.4, L(9) - 0.3];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) { // the march through snow
    vgrad([[0, '#3a4452'], [0.6, '#7a8694'], [1, '#d6dce2']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.1, 1100, 580, sh.e - sh.s]]);
    landscape(41, 780, 5, '#a8b4c2', '#2a323c', { haze: '225,232,240', amp: 280, trees: true, snow: true, blur: 6 });
    x.fillStyle = '#c8d0d8'; x.fillRect(-400, 800, W + 800, 400);
    legion(t, 860, 20, 110, '#141a20', null, 44, 50, -200, W + 200, 110);
    standard(700 + (t - sh.s) * 50, 880, 380, '#0e1216', t); standard(1300 + (t - sh.s) * 50, 880, 400, '#0e1216', t + 2);
    legion(t, 1010, 12, 200, '#080a0c', 'rgba(255,255,255,.4)', 45, 80, -300, W + 300, 190);
    x.save(); x.filter = 'blur(5px)'; forest(46, 1120, 10, -200, W + 200, 400, 560, '#050608', 0.5); x.restore();
    x.restore(); motes(t, 40, [0, W, 0, H], '255,255,255', 0.3, 5);
    snowfall(t, 260, 120, 0.85, 1);
    const a = win(t, sh.s + 0.6, sh.e - 0.8); textC('DANUBE FRONTIER', 160, 150, '900 58px Cinzel', '#ffffff', 14, a, 'left'); textC('166 – 180 AD', 160, 210, '700 32px Cinzel', '#e6ecf2', 10, a, 'left');
  } else if (sh.i === 1) { // the camp at night beside the frozen river
    vgrad([[0, '#03050b'], [0.55, '#0c1626'], [1, '#05070c']]); stars(t, 220, 0.8, 7, 560); moon(1500, 190, 64, '#e6eaf0', 0.35);
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [C.frontier.tent - 0.2, 1.35, 980, 700, sh.e - C.frontier.tent]]);
    landscape(51, 610, 4, '#22324c', '#060a12', { haze: '140,170,220', hazeA: 0.22, amp: 210, trees: true, snow: true, blur: 4 });
    x.fillStyle = '#9fb0c4'; x.fillRect(-400, 610, W + 800, 90); x.fillStyle = 'rgba(255,255,255,.25)'; ell(1500, 650, 80, 8); x.fill();
    x.strokeStyle = 'rgba(40,60,80,.5)'; x.lineWidth = 2; for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(R(i) * W, 615); x.lineTo(R(i) * W + 60, 695); x.stroke(); }
    x.fillStyle = '#0a0f18'; x.fillRect(-400, 700, W + 800, 500);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - r * 2; i++) { const tx = 120 + i * (1700 / (9 - r * 2)) + r * 60, ty = 760 + r * 110, s2 = 0.45 + r * 0.25; tent(tx, ty, s2, '#05080e', R(i + r * 9) < 0.5 ? 0.6 : 0, t); if (R(i * 7 + r) < 0.5) campfire(tx + 120 * s2, ty + 4, s2, t, i + r * 10); }
    tent(980, 1020, 1.2, '#04060a', 1, t);
    x.restore();
    snowfall(t, 180, 30, 0.7, 5, 0.8);
  } else if (sh.i === 2) { // battle on the frozen river
    vgrad([[0, '#8a96a4'], [0.6, '#c8d2dc'], [1, '#e8eef2']]);
    x.save(); const shake = Math.sin(t * 40) * 3 * (sh.i === 2 ? 1 : 0); x.translate(shake, 0);
    cam(t, [[sh.s, 1.0, 960, 540], [L(3) - 0.2, 1.25, 960, 780, 2]]);
    landscape(61, 630, 4, '#c2ccd6', '#4a5664', { haze: '238,242,246', amp: 160, trees: true, snow: true, blur: 6 });
    x.fillStyle = '#b4c4d2'; x.fillRect(-400, 640, W + 800, 600);
    x.strokeStyle = 'rgba(40,60,80,.45)'; x.lineWidth = 3; const crack = ss(L(3), L(3) + 3, t);
    for (let i = 0; i < 9; i++) { x.beginPath(); let px = 300 + i * 170, py = 700 + R(i) * 300; x.moveTo(px, py); for (let k = 0; k < 6 * crack; k++) { px += (R(i * 9 + k) - 0.3) * 90; py += (R(i * 5 + k) - 0.5) * 60; x.lineTo(px, py); } x.stroke(); }
    const lunge = Math.sin(t * 2.4) * 30;
    for (let i = 0; i < 6; i++) rimPerson(240 + i * 105 + lunge * (i % 2), 880 + (i % 3) * 40, 230 + (i % 3) * 20, '#121820', 'rgba(255,255,255,.55)', { helmet: true, spear: true, shield: true, cloak: true, lean: 0.1, arm: 0.6, walk: t * 4 + i, wind: t * 3 + i });
    for (let i = 0; i < 6; i++) rimPerson(1680 - i * 105 - lunge * (i % 2), 880 + (i % 3) * 40, 240 + (i % 3) * 20, '#1a1410', 'rgba(255,255,255,.5)', { dir: -1, beard: true, hair: true, cloak: true, lean: 0.1, arm: 0.9, sword: true, walk: t * 4 + i + 1, wind: t * 3 + i });
    x.restore();
    snowfall(t, 400, 380, 0.85, 9, 1.2);
  } else if (sh.i === 3 || sh.i === 6) { // by night, he wrote
    x.save(); cam(t, sh.i === 3 ? [[sh.s, 1.1, 1000, 620], [sh.s, 1.0, 960, 540, sh.e - sh.s]] : [[sh.s, 1.0, 960, 540], [sh.s, 1.06, 1000, 560, sh.e - sh.s]]);
    tentInterior(t, sh.i === 6 ? 0.6 : 0); x.restore();
  } else if (sh.i === 4) { // close-up: Greek text on parchment — "Ta eis heauton"
    fillAll('#120904'); light(1500, 300, 900, '255,160,70', 0.4);
    x.save(); x.translate(960, 560); x.rotate(-0.04); parchment(-640, -380, 1280, 760, 1); x.restore();
    const g1 = 'ΤΑ ΕΙΣ ΕΑΥΤΟΝ', g2 = ['Ἕωθεν προλέγειν ἑαυτῷ· συντεύξομαι', 'περιέργῳ, ἀχαρίστῳ, ὑβριστῇ, δολερῷ,', 'βασκάνῳ, ἀκοινωνήτῳ. πάντα ταῦτα', 'συμβέβηκεν ἐκείνοις παρὰ τὴν ἄγνοιαν', 'τῶν ἀγαθῶν καὶ κακῶν.'];
    const k = ss(sh.s, sh.e - 0.4, t), total = g1.length + g2.join('').length; let n = Math.floor(k * total);
    x.save(); x.translate(960, 560); x.rotate(-0.04); x.fillStyle = '#2a1608'; x.textBaseline = 'middle';
    x.font = '700 70px "DejaVu Serif", serif'; x.textAlign = 'center'; x.fillText(g1.slice(0, n), 0, -250); n -= g1.length;
    x.font = 'italic 44px "DejaVu Serif", serif'; x.textAlign = 'left';
    g2.forEach((ln, i) => { if (n <= 0) return; x.fillText(ln.slice(0, n), -520, -120 + i * 76); n -= ln.length; });
    x.restore();
    textC('“To Himself”', 960, 980, '600 italic 46px Cormorant', '#f3e6cc', 1, ss(sh.s + 0.4, sh.s + 1.2, t));
    shade(960, 540, 1300, 0.0);
  } else if (sh.i === 5) { // the book: MEDITATIONS
    fillAll('#0a0604'); godrays(960, -200, 11, 1400, '255,210,150', 0.1, t, 0.8, PI / 2);
    const k = easeBack(ss(sh.s, sh.s + 0.8, t));
    x.save(); x.translate(960, 560); x.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k); x.rotate(Math.sin(t * 0.5) * 0.02);
    x.fillStyle = '#e8dcc4'; x.fillRect(-300, -380, 600, 760); x.fillStyle = '#d0c2a6'; for (let i = 1; i < 8; i++) x.fillRect(-300 + i * 2, -380 + i * 2, 600, 760);
    const g = x.createLinearGradient(-300, 0, 300, 0); g.addColorStop(0, '#3a1a10'); g.addColorStop(0.5, '#5a2a18'); g.addColorStop(1, '#2a120a'); x.fillStyle = g; x.beginPath(); x.roundRect(-310, -390, 620, 780, 12); x.fill();
    x.strokeStyle = 'rgba(217,164,65,.7)'; x.lineWidth = 4; x.strokeRect(-270, -350, 540, 700);
    textC('MEDITATIONS', 0, -60, '900 66px Cinzel', GOLD2, 8, 1); textC('MARCUS AURELIUS', 0, 30, '700 30px Cinzel', GOLD, 8, 1);
    x.fillStyle = GOLD; x.fillRect(-90, 90, 180, 3);
    x.restore();
    for (let i = 0; i < 6; i++) { const p = ((t - sh.s) * 0.6 + i / 6) % 1; x.save(); x.globalAlpha = (1 - p) * 0.7; x.translate(960 + Math.sin(i * 2 + p * 6) * 500 * p, 560 - p * 600); x.rotate(p * 6 + i); x.fillStyle = '#e8dcc4'; x.fillRect(-40, -55, 80, 110); x.restore(); }
    embers(t, 30, '255,220,170', 30, 3, 0.6);
  } else { // dawn blizzard: Marcus stands firm
    vgrad([[0, '#2a3240'], [0.6, '#6a7686'], [1, '#c4ccd6']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.22, 900, 520, sh.e - sh.s]]);
    landscape(71, 740, 4, '#aab4c0', '#2a323c', { haze: '232,238,244', amp: 200, trees: true, snow: true, blur: 7 });
    x.fillStyle = '#d0d6de'; x.fillRect(-400, 760, W + 800, 500);
    tent(1400, 900, 1.3, '#141a22', 0.4, t);
    rimPerson(820, 1000, 560, '#06080a', 'rgba(255,255,255,.55)', { cloak: true, laurel: true, beard: true, robe: true, wind: t * 6 }, [4, -3]);
    x.restore();
    const f = flash(t, [C.frontier.storm + 0.3]); if (f) { x.fillStyle = `rgba(230,235,255,${0.4 * f})`; x.fillRect(0, 0, W, H); }
    snowfall(t, 520, 620, 0.9, 13, 1.3);
  }
}

// =====================================================================
//  IV · THE BETRAYAL
// =====================================================================
function sceneBetrayal(t) {
  const sc = S.betrayal, L = i => Ls('betrayal', i);
  const st = [sc.start, L(1) - 0.2, L(2) - 0.2, L(3) - 0.2, L(4) - 0.2, L(6) - 0.2, L(7) - 0.2, L(8) - 0.2];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) { // the handshake; one man turns away
    vgrad([[0, '#140a06'], [1, '#050302']]); light(960, 520, 700, '255,160,80', 0.35);
    const turn = ss(sh.s + 1.6, sh.s + 2.4, t);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.12, 1040, 560, sh.e - sh.s]]);
    x.fillStyle = '#0a0503'; x.fillRect(-400, 900, W + 800, 400);
    rimPerson(820, 900, 440, '#070302', 'rgba(255,170,90,.8)', { laurel: true, beard: true, robe: true, cloak: true, arm: 0.5 });
    x.save(); x.globalAlpha = 1; rimPerson(1100 + turn * 30, 900, 450, '#070302', `rgba(${255},${lerp(170, 50, turn)},${lerp(90, 40, turn)},.85)`, { helmet: true, cloak: true, beard: true, dir: turn > 0.5 ? 1 : -1, arm: 0.5 * (1 - turn) }); x.restore();
    x.restore();
    x.save(); x.globalAlpha = 0.6 * turn; const g = x.createLinearGradient(1100, 0, W, 0); g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, 'rgba(120,0,0,.6)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.restore();
  } else if (sh.i === 1) { // the rumor passes from mouth to mouth
    fillAll('#07040a'); light(960, 540, 900, '120,40,140', 0.15);
    const k = ss(sh.s, sh.e, t);
    for (let i = 0; i < 5; i++) { const hx = 160 + i * 400, a = ss(sh.s + i * 0.4, sh.s + i * 0.4 + 0.6, t); x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(180,120,220,.5)'; headPath(hx - 4, 560, 0.62); x.fill(); x.fillStyle = '#05030a'; headPath(hx, 560, 0.62); x.fill(); x.restore(); }
    const tx = 200 + k * 1600;
    x.save(); x.shadowColor = 'rgba(200,150,255,.6)'; x.shadowBlur = 30; textC('MARCUS IS DEAD', tx, 330 + Math.sin(t * 2) * 10, '900 70px Cinzel', '#e8dcf2', 10, win(t, sh.s + 0.2, sh.e - 0.4, 0.4, 0.4)); x.restore();
    smoke(t, 6, '90,60,120', 0.2, 81, 200, 500, 150, 320);
  } else if (sh.i === 2) { // Cassius declares himself emperor in the East
    vgrad([[0, '#1a0604'], [0.55, '#8a2410'], [0.8, '#e06a28'], [1, '#2a0c06']]);
    light(1400, 720, 700, '255,120,50', 0.5); ell(1400, 740, 110, 110); x.fillStyle = '#ffb066'; x.fill();
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.15, 820, 520, sh.e - sh.s]]);
    landscape(91, 860, 4, '#d06a30', '#3a1008', { haze: '255,150,80', amp: 110, rough: 0.08, freq: 0.0009, blur: 5 });
    palm(180, 860, 420, '#140504', t); palm(1700, 860, 460, '#140504', t + 1); palm(1560, 870, 320, '#1a0604', t + 2);
    x.fillStyle = '#100403'; x.fillRect(560, 700, 520, 160);
    rimPerson(820, 700, 330, '#080202', 'rgba(255,130,60,.9)', { helmet: true, cloak: true, beard: true, arm: 1, wind: t * 2 });
    line([858, 470, 900, 330], 8, '#080202'); light(900, 330, 60, '255,200,150', 0.6);
    crowd(92, 1000, 60, -100, W + 100, 1.7, '#060101', t, 1);
    fgGrass(t, 93, 1060, '#040101', 60, 5, 60, true);
    x.restore(); motes(t, 60, [0, W, 200, 900], '255,170,100', 0.4, 8);
    textC('AVIDIUS CASSIUS', 160, 150, '900 56px Cinzel', '#ffe2c8', 12, win(t, sh.s + 0.4, sh.e - 0.6), 'left'); textC('GOVERNOR OF SYRIA', 160, 205, '700 28px Cinzel', '#f0c8a0', 8, win(t, sh.s + 0.8, sh.e - 0.6), 'left');
  } else if (sh.i === 3) { // map: the East turns red, the grain ships stop
    fillAll('#0a0604');
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [sh.s, 1.2, 1200, 600, sh.e - sh.s]]);
    const sy = ss(C.betrayal.syria - 0.1, C.betrayal.syria + 0.4, t), eg = ss(C.betrayal.egypt - 0.1, C.betrayal.egypt + 0.4, t), gr = ss(C.betrayal.grain, C.betrayal.grain + 1.5, t);
    mapDraw(160, 130, 1.6, 1, t, { labels: [['rome', 'ROMA'], ['syria', 'SYRIA', 0.4 + 0.6 * sy], ['egypt', 'AEGYPTUS', 0.4 + 0.6 * eg]], spread: g => {
      [[CITIES.syria, sy], [CITIES.egypt, eg]].forEach(([[px, py], a]) => { g.save(); g.globalAlpha = a * 0.6; g.fillStyle = '#9a120c'; g.beginPath(); g.arc(px, py, 120, 0, TAU); g.fill(); g.restore(); });
      g.save(); g.globalAlpha = 0.9; g.fillStyle = '#d9a441'; g.beginPath(); g.arc(CITIES.rome[0], CITIES.rome[1], 16, 0, TAU); g.fill(); g.restore();
      for (let i = 0; i < 3; i++) { const p = cl(gr * 0.6 - i * 0.12, 0, 0.55), sx = lerp(CITIES.alexandria[0], CITIES.rome[0], p) + i * 30, sy2 = lerp(CITIES.alexandria[1], CITIES.rome[1] + 60, p) + Math.sin(p * 9) * 10; g.fillStyle = gr > 0.8 ? '#7a0d0a' : '#3a2a18'; g.beginPath(); g.moveTo(sx - 18, sy2); g.lineTo(sx + 18, sy2); g.lineTo(sx + 12, sy2 + 8); g.lineTo(sx - 12, sy2 + 8); g.fill(); g.fillRect(sx - 1, sy2 - 22, 2, 22); }
    } });
    x.restore();
  } else if (sh.i === 4) { // Marcus speaks to the army; hopes to forgive
    const warm = ss(C.betrayal.forgive - 0.3, C.betrayal.forgive + 1.2, t);
    vgrad([[0, '#141820'], [0.6, `rgb(${lerp(60, 200, warm)},${lerp(60, 130, warm)},${lerp(70, 70, warm)})`], [1, '#0a0a0c']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [C.betrayal.forgive - 0.2, 1.45, 960, 430, 2.4]]);
    landscape(101, 720, 3, '#7a7a86', '#1e222a', { haze: '210,205,210', amp: 160, blur: 5 }); for (let i = 0; i < 8; i++) tent(120 + i * 240, 760, 0.5, '#121418', 0.3, t);
    x.fillStyle = '#0e0c0c'; x.fillRect(760, 640, 400, 120); x.fillRect(-400, 760, W + 800, 500);
    standard(700, 760, 420, '#080808', t); standard(1220, 760, 420, '#080808', t + 1);
    rimPerson(960, 640, 300, '#060506', `rgba(255,${180 + 40 * warm},${110 + 40 * warm},.9)`, { laurel: true, beard: true, robe: true, cloak: true, arm: 0.7 + 0.1 * Math.sin(t * 1.5), wind: t });
    legion(t, 930, 16, 150, '#060606', 'rgba(255,200,140,.35)', 102, 0, -100, W + 100, 125);
    legion(t, 1100, 10, 230, '#030303', 'rgba(255,200,140,.4)', 103, 0, -200, W + 200, 210);
    x.restore();
    light(960, 380, 600, '255,200,130', 0.3 * warm);
  } else if (sh.i === 5) { // the end of Cassius (non-graphic, silhouettes)
    vgrad([[0, '#05030a'], [1, '#0c0608']]); stars(t, 80, 0.5, 9, 500);
    const fall = ss(C.betrayal.killed, C.betrayal.killed + 0.8, t);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.1, 960, 600, sh.e - sh.s]]);
    tent(960, 900, 2.4, '#0a0508', 0.5, t);
    x.fillStyle = '#060305'; x.fillRect(-400, 900, W + 800, 400);
    rimPerson(720, 900, 380, '#040203', 'rgba(255,80,60,.6)', { helmet: true, cloak: true, arm: 0.9 * (1 - fall) + 0.3 });
    person(1080, 900, 400 - 0, '#040203', { helmet: true, cloak: true, beard: true, dir: -1, lean: -fall * 1.2 });
    x.restore();
    if (t >= C.betrayal.killed && t < C.betrayal.killed + 0.3) { x.fillStyle = `rgba(160,0,0,${0.5 * (1 - (t - C.betrayal.killed) / 0.3)})`; x.fillRect(0, 0, W, H); }
  } else if (sh.i === 6) { // the letters, burned unread
    fillAll('#080402');
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [C.betrayal.burned - 0.2, 1.25, 960, 640, 3]]);
    x.fillStyle = '#120a06'; x.beginPath(); x.moveTo(640, 760); x.quadraticCurveTo(960, 900, 1280, 760); x.closePath(); x.fill();
    line([700, 1080, 960, 820, 1220, 1080], 18, '#120a06');
    for (let i = 0; i < 6; i++) {
      const drop = C.betrayal.burned - 0.2 + i * 0.35, p = ss(drop, drop + 0.6, t), burn = ss(drop + 0.6, drop + 2.4, t);
      if (burn >= 1) continue;
      const lx = 740 + i * 90, ly = lerp(300 + (i % 2) * 40, 740, p);
      x.save(); x.translate(lx, ly); x.rotate((R(i) - 0.5) * 0.8 + p * (R(i + 3) - 0.5));
      x.globalAlpha = 1 - burn; x.fillStyle = burn > 0 ? `rgb(${lerp(220, 40, burn)},${lerp(205, 20, burn)},${lerp(170, 10, burn)})` : '#dccdb0'; x.fillRect(-70, -48, 140, 96);
      x.fillStyle = '#8a0d0a'; ell(0, 0, 16, 16); x.fill();
      x.strokeStyle = 'rgba(60,40,20,.5)'; x.lineWidth = 2; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-52, -30 + k * 18); x.lineTo(40, -30 + k * 18); x.stroke(); }
      x.restore();
    }
    flame(960, 770, 1.6, t, 3, 1); flame(880, 780, 1.0, t, 7, 0.8); flame(1050, 780, 1.1, t, 11, 0.8);
    x.restore();
    embers(t, 60, '255,140,50', 140, 17, 1, [700, 1220, 0, 800]);
    const a = ss(C.betrayal.burned + 0.4, C.betrayal.burned + 1.2, t);
    textC('UNREAD', 960, 180, '900 80px Cinzel', '#ffe2c0', 22, a * (1 - ss(sh.e - 0.5, sh.e, t)));
  } else { // calm profile: he chose not to hate
    fillAll('#050404'); light(1100, 500, 900, '217,164,65', 0.2);
    x.save(); headPath(1100 - 6, 560 - 4, 1.2); x.fillStyle = 'rgba(246,214,140,.85)'; x.fill(); headPath(1100, 560, 1.2); x.fillStyle = '#070606'; x.fill(); headCurls(1100, 560, 1.2, '#070606'); x.restore();
    smoke(t, 5, '100,30,30', 0.18 * (1 - ss(L(9) - 0.2, L(9) + 1.5, t)), 111, 200, 900);
    light(1240, 380, 120, '255,220,160', 0.25);
    embers(t, 20, '255,210,150', 30, 19, 0.6);
  }
}

// =====================================================================
//  V · THE CITADEL
// =====================================================================
function sceneCitadel(t) {
  const sc = S.citadel, L = i => Ls('citadel', i);
  const st = [sc.start, L(1) - 0.2, L(3) - 0.3, L(6) - 0.3, L(8) - 0.5];
  const sh = shot(t, st, sc.end);
  if (sh.i === 0) { // the world burning; one man calm in the middle
    vgrad([[0, '#140404'], [0.55, '#5a1408'], [0.8, '#c24a16'], [1, '#1a0604']]);
    x.save(); cam(t, [[sh.s, 1.0, 960, 560], [sh.s, 1.2, 960, 600, sh.e - sh.s]]);
    houses(121, 820, 30, -100, W + 100, 120, 300, '#120404', 'rgba(255,140,50,.8)', 0.9);
    for (let i = 0; i < 6; i++) flame(120 + i * 340, 720 - R(i) * 120, 1.4 + R(i) * 0.6, t, i);
    x.fillStyle = '#0a0202'; x.fillRect(-400, 820, W + 800, 400);
    const calm = 0.6 + 0.4 * Math.sin(t * 1.2);
    light(960, 760, 420, '150,190,255', 0.25 * calm); x.strokeStyle = `rgba(170,200,255,${0.3 * calm})`; x.lineWidth = 3; ell(960, 800, 260, 40); x.stroke();
    rimPerson(960, 820, 360, '#050202', 'rgba(170,200,255,.8)', { laurel: true, beard: true, robe: true, cloak: true });
    x.restore();
    smoke(t, 9, '40,10,8', 0.45, 122, 100, 700); haze(600, 900, '255,110,40', 0.25); embers(t, 70, '255,130,50', 160, 23, 1.1);
  } else if (sh.i === 1) { // the citadel on the peak in the storm
    vgrad([[0, '#04060c'], [0.6, '#0e1626'], [1, '#05070c']]);
    const f = flash(t, [L(1) + 0.1, L(2) + 2.5, L(2) + 6]);
    clouds(t, 10, 80, 600, `${50 + 120 * f},${60 + 120 * f},${90 + 120 * f}`, 0.6, 31, 30);
    if (f) { x.fillStyle = `rgba(190,205,255,${0.35 * f})`; x.fillRect(0, 0, W, H); lightning(500, 0, 760, 380, Math.floor(t), f); }
    x.save(); cam(t, [[sh.s, 1.5, 960, 900, 0], [sh.s, 1.0, 960, 540, 4.5], [L(2), 1.08, 960, 520, sh.e - L(2)]]);
    landscape(131, 1000, 4, '#2c3c5c', '#0a0e16', { haze: '100,120,160', amp: 280, blur: 6 });
    x.fillStyle = '#080b12'; poly([560, 1100, 760, 760, 860, 640, 1000, 600, 1120, 660, 1280, 820, 1400, 1100]); x.fill();
    fortress(980, 640, 0.6, '#06080e', 1, t, 1, 'rgba(160,180,230,.45)');
    x.restore();
    rainfall(t, 220, 0.3, 0.35);
  } else if (sh.i === 2) { // diagram: outside vs inside, the gate
    fillAll('#050507');
    const cx = 960, cy = 560, Rr = 300, gate = ss(C.citadel.gate - 0.1, C.citadel.gate + 0.5, t), inA = ss(C.citadel.inside - 0.2, C.citadel.inside + 0.5, t);
    x.save(); cam(t, [[sh.s, 1.0, 960, 540], [C.citadel.inside, 1.15, 960, 560, 2.5]]);
    clouds(t, 8, 80, 1000, '60,70,100', 0.35, 41, 40);
    // ring wall with towers, seen from above
    x.strokeStyle = '#2a2a30'; x.lineWidth = 46; x.beginPath(); x.arc(cx, cy, Rr, -PI / 2 + 0.22, -PI / 2 + TAU - 0.22); x.stroke();
    x.strokeStyle = 'rgba(217,164,65,.5)'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, Rr + 23, -PI / 2 + 0.22, -PI / 2 + TAU - 0.22); x.stroke();
    for (let i = 0; i < 10; i++) { const a = -PI / 2 + 0.6 + i * (TAU - 1.2) / 9; x.fillStyle = '#34343c'; ell(cx + Math.cos(a) * Rr, cy + Math.sin(a) * Rr, 40, 40); x.fill(); }
    // gate doors at the top (closing)
    const ga = -PI / 2, gx = cx + Math.cos(ga) * Rr, gy = cy + Math.sin(ga) * Rr;
    x.save(); x.translate(gx, gy); x.fillStyle = '#5a3a1c'; x.save(); x.rotate(-(1 - gate) * 1.2); x.fillRect(-70, -14, 70, 28); x.restore(); x.save(); x.rotate((1 - gate) * 1.2); x.fillRect(0, -14, 70, 28); x.restore(); x.restore();
    // inside: the flame of your response
    if (inA > 0) { const g = x.createRadialGradient(cx, cy, 10, cx, cy, Rr - 30); g.addColorStop(0, `rgba(255,170,70,${0.35 * inA})`); g.addColorStop(1, 'rgba(255,170,70,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, Rr - 30, 0, TAU); x.fill(); flame(cx, cy + 60, easeBack(inA) * 0.9, t, 5, inA); textC('YOUR RESPONSE', cx, cy + 150, '900 34px Cinzel', GOLD2, 8, ss(C.citadel.respond - 0.1, C.citadel.respond + 0.4, t)); }
    // outside: forces circling and hitting the wall
    ['OTHER PEOPLE', 'REPUTATION', 'SICKNESS', 'DEATH'].forEach((w, i) => {
      const t0 = C.citadel.outer[i], a = ss(t0 - 0.1, t0 + 0.3, t); if (a <= 0) return;
      const ang = PI * (0.85 + i * 0.42) + (t - t0) * 0.12, rr = 560 + Math.sin(t * 1.3 + i) * 30, px = cx + Math.cos(ang) * rr * 1.25, py = cy + Math.sin(ang) * rr * 0.72;
      textC(w, px, py, '900 42px Cinzel', '#b8c4d8', 6, a * (1 - 0.4 * inA));
      // arrow toward the wall, bouncing
      const ph = ((t - t0) * 0.8 + i * 0.3) % 1, ax = lerp(px, cx + Math.cos(ang) * (Rr + 40), ph), ay = lerp(py, cy + Math.sin(ang) * (Rr + 40), ph);
      if (t > t0) { x.save(); x.globalAlpha = a * (1 - ph * 0.6); line([ax, ay, ax - Math.cos(ang) * -40, ay - Math.sin(ang) * -40], 4, '#d6dce6'); x.restore(); if (ph > 0.92) light(cx + Math.cos(ang) * (Rr + 30), cy + Math.sin(ang) * (Rr + 30), 60, '200,220,255', 0.7); }
    });
    textC('INSIDE', cx, cy - 120, '700 28px Cinzel', '#e9dcc6', 10, inA * 0.8);
    x.restore();
    if (t >= C.citadel.gate && t < C.citadel.gate + 0.15) { x.fillStyle = `rgba(255,220,160,${0.3 * (1 - (t - C.citadel.gate) / 0.15)})`; x.fillRect(0, 0, W, H); }
  } else if (sh.i === 3) { // the insult: a second of words, days of pain
    fillAll('#060506');
    const L6 = L(6), wsec = wordTimeAt(6, 'second'), wdays = wordTimeAt(6, 'days'), walive = wordTimeAt(6, 'alive');
    const a = ss(L6, L6 + 0.5, t), hit = ss(L6 + 0.4, L6 + 1.2, t);
    x.save(); x.globalAlpha = a; x.fillStyle = '#2a2a32'; x.fillRect(1500, 160, 90, 600); for (let i = 0; i < 8; i++) x.fillRect(1490, 160 + i * 80, 110, 10); x.restore();
    const ax = lerp(300, 1480, hit); textC('INSULT', ax - 140, 440, '900 54px Cinzel', '#ff6a5a', 8, a * (1 - ss(L6 + 1.2, L6 + 1.6, t)));
    line([ax - 40, 470, ax, 470], 6, `rgba(255,120,100,${a * (1 - ss(L6 + 1.2, L6 + 1.6, t))})`);
    if (t > L6 + 1.2 && t < L6 + 1.6) light(1490, 470, 160, '255,140,120', 1 - (t - L6 - 1.2) / 0.4);
    const b1 = ss(wsec - 0.1, wsec + 0.3, t), b2 = ss(wdays - 0.1, wdays + 2.2, t);
    textC('THE WORDS', 360, 700, '700 34px Cinzel', '#c8c0b4', 8, b1, 'left'); x.fillStyle = '#c8c0b4'; x.fillRect(640, 688, 40 * b1, 24); textC('1 second', 700, 700, '600 italic 36px Cormorant', '#c8c0b4', 0, b1, 'left');
    textC('THE PAIN', 360, 790, '700 34px Cinzel', '#ff7a6a', 8, ss(wdays - 0.1, wdays + 0.3, t), 'left'); x.fillStyle = '#b3121b'; x.fillRect(640, 778, 900 * b2, 24); textC('days', 660 + 900 * b2, 790, '600 italic 36px Cormorant', '#ff7a6a', 0, b2, 'left');
    x.save(); x.shadowColor = 'rgba(255,170,60,.6)'; x.shadowBlur = 24; textC('WHO KEPT IT ALIVE?', 960, 940, '900 60px Cinzel', GOLD2, 8, ss(walive - 0.4, walive + 0.3, t)); x.restore();
    if (t > L(7) - 0.5) { shade(960, 540, 2000, 0.5 * ss(L(7) - 0.5, L(7), t)); }
  } else { // the promontory: waves break, the rock stands
    vgrad([[0, '#03050a'], [0.55, '#0e1a2c'], [1, '#04060a']]);
    stars(t, 160, 0.7, 13, 560); moon(560, 210, 76, '#ebe3d0', 0.4);
    x.save(); cam(t, [[sh.s, 1.18, 960, 620], [sh.s, 1.0, 960, 540, sh.e - sh.s]]);
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const yy = 700 + i * 10, w2 = 30 + i * 7, xo = Math.sin(t * 1.5 + i * 0.7) * (8 + i); x.fillStyle = `rgba(255,240,210,${0.22 * (1 - i / 40)})`; x.fillRect(560 - w2 / 2 + xo, yy, w2, 3); } x.restore();
    sea(t, 700, 26, 5, k => `rgb(${6 + k * 4},${12 + k * 5},${22 + k * 6})`, { k: 2, draw: () => promontory(1180, 860, 1.25, '#05070b', 'rgba(220,230,245,.35)') });
    spray(t, 760, 800, 3.0, 0.2, 1.5); spray(t, 1560, 820, 3.4, 1.6, 1.3); spray(t, 1180, 780, 4.1, 2.9, 1.1);
    x.restore();
  }
}
// helper: time of a word inside the n-th line of the current scene (by prefix)
function wordTimeAt(n, prefix) { const li = S[sceneOf(T_NOW)].first + n; return EP.wordTime(TL, li, prefix); }
