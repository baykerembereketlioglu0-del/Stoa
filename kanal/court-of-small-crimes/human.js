// Human figures, drawn from a skeleton. Front view. A figure is 100 units tall, feet on y = 0.
// Limbs are outlined tubes that bend at elbow/knee; clothes are shapes that follow the same joints.
// person(cx, baseY, heightPx, look, pose)
//   look: { skin, hair, hairStyle, top, topStyle, bottom, bottomStyle, shoes, glasses, beard, tie, bar, gender }
//   pose: { armL:[a1,a2], armR:[a1,a2], legL:[a1,a2], legR:[a1,a2], tilt, talk, brows, smile, look:[dx,dy], phone, gavel, blink }
const HSKIN = ['#f3cfb0', '#e3b08a', '#c68c63', '#9a6440', '#6e4428', '#f6dcc6'];
const HAIRC = ['#2a1c14', '#5b3a22', '#b78345', '#1c1c1c', '#8e3d22', '#d9d2c4', '#7a7066'];
function tube(pts, w, col, ow) { // outlined limb through joints (in units)
  x.lineJoin = 'round'; x.lineCap = 'round';
  x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]);
  x.strokeStyle = OUT; x.lineWidth = w + ow * 2; x.stroke(); x.strokeStyle = col; x.lineWidth = w; x.stroke();
}
function limb(sx, sy, side, a1, a2, l1, l2) { // returns [elbowX, elbowY, wristX, wristY, forearmAngle]
  const ex = sx + Math.sin(a1) * side * l1, ey = sy + Math.cos(a1) * l1, a = a1 + a2, wx = ex + Math.sin(a) * side * l2, wy = ey + Math.cos(a) * l2;
  return [ex, ey, wx, wy, a];
}
function hand(hx, hy, ang, side, skin, ow, r = 2.2) {
  x.save(); x.translate(hx, hy); x.rotate(-ang * side);
  x.beginPath(); x.ellipse(0, r * 0.4, r, r * 1.15, 0, 0, TAU); x.fillStyle = skin; x.fill(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke();
  x.beginPath(); x.ellipse(-side * r * 0.9, -r * 0.1, r * 0.45, r * 0.8, side * 0.5, 0, TAU); x.fill(); x.stroke();
  x.restore();
}
function shoe(fx, fy, side, col, ow) { // front view: a rounded toe cap, turned slightly outward
  x.beginPath(); x.moveTo(fx - 3.2 + side * 0.6, fy + 0.2); x.quadraticCurveTo(fx - 3.4 + side * 0.6, fy - 3.2, fx + side * 0.6, fy - 3.4); x.quadraticCurveTo(fx + 3.4 + side * 0.6, fy - 3.2, fx + 3.2 + side * 0.6, fy + 0.2); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke();
  x.beginPath(); x.moveTo(fx - 2.6 + side * 0.6, fy - 0.6); x.lineTo(fx + 2.6 + side * 0.6, fy - 0.6); x.lineWidth = ow * 0.6; x.strokeStyle = shadeOf(col, 0.7); x.stroke(); }
function shapeU(pf, fill, ow, shadeK = 0.82, sh = [1.6, 0]) { // fill + cel shadow + outline, in units
  x.save(); pf(); x.fillStyle = fill; x.fill();
  x.save(); pf(); x.clip(); x.fillStyle = shadeOf(fill, shadeK); x.fillRect(-200, -200, 400, 400); x.translate(-sh[0], -sh[1]); pf(); x.fillStyle = fill; x.fill(); x.restore();
  pf(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); x.restore();
}

function person(cx, base, hpx, L, p = {}) {
  const u = hpx / 100, ow = Math.max(2.2, hpx * 0.0065) / u; // outline width in units
  const skin = L.skin, side = [-1, 1];
  x.save(); x.translate(cx, base); x.scale(u, u); if (p.lean) x.rotate(p.lean);
  const armL = p.armL ?? [0.14, 0.12], armR = p.armR ?? [0.14, 0.12], legL = p.legL ?? [0.04, 0], legR = p.legR ?? [0.04, 0];
  const slump = p.slump ?? 0, sy = slump * 1.5;
  // ---- legs ----
  const hipY = -47, l1 = 23.5, l2 = 22;
  const legs = [[-1, legL], [1, legR]].map(([sd, [a1, a2]]) => { const hx = sd * 4.4, kx = hx + Math.sin(a1) * sd * l1, ky = hipY + Math.cos(a1) * l1, ax = kx + Math.sin(a1 + a2) * sd * l2, ay = ky + Math.cos(a1 + a2) * l2; return { sd, hx, kx, ky, ax, ay }; });
  const longBottom = L.bottomStyle === 'robe' || L.bottomStyle === 'long-skirt';
  if (!longBottom || true) for (const g of legs) { // trousers or bare legs (skirt) — shoes always
    const legCol = L.bottomStyle === 'skirt' || L.bottomStyle === 'long-skirt' || L.bottomStyle === 'robe' ? (L.tights ?? skin) : L.bottom;
    tube([g.hx, hipY, g.kx, g.ky, g.ax, g.ay - 1.2], L.bottomStyle === 'skirt' || L.bottomStyle === 'robe' || L.bottomStyle === 'long-skirt' ? 4.2 : 6.4, legCol, ow);
    shoe(g.ax, g.ay, g.sd, L.shoes ?? '#2a2a2e', ow);
    if (L.bottomStyle === 'jeans' || L.bottomStyle === 'trousers') { x.beginPath(); x.moveTo(g.kx - 0.4 * g.sd, g.ky - 2); x.lineTo(g.kx - 0.2 * g.sd, g.ky + 2); x.lineWidth = ow * 0.6; x.strokeStyle = shadeOf(L.bottom, 0.7); x.stroke(); }
  }
  if (L.bottomStyle !== 'skirt' && L.bottomStyle !== 'robe' && L.bottomStyle !== 'long-skirt') shapeU(() => { x.beginPath(); x.moveTo(-8.6, -52); x.lineTo(8.6, -52); x.lineTo(8.4, -44); x.quadraticCurveTo(0, -40, -8.4, -44); x.closePath(); }, L.bottom, ow); // seat of the trousers
  if (L.bottomStyle === 'skirt') shapeU(() => { x.beginPath(); x.moveTo(-8.8, -53); x.lineTo(8.8, -53); x.lineTo(11.5, -29); x.quadraticCurveTo(0, -27, -11.5, -29); x.closePath(); }, L.bottom, ow);
  if (L.bottomStyle === 'long-skirt') shapeU(() => { x.beginPath(); x.moveTo(-8.8, -53); x.lineTo(8.8, -53); x.lineTo(12.5, -10); x.quadraticCurveTo(0, -8, -12.5, -10); x.closePath(); }, L.bottom, ow);
  // ---- torso ----
  x.save(); x.translate(0, sy);
  const top = L.top, ts = L.topStyle;
  if (ts === 'robe') {
    shapeU(() => { x.beginPath(); x.moveTo(-3, -81); x.quadraticCurveTo(-12.5, -80.5, -13.5, -74); x.lineTo(-15, -8); x.quadraticCurveTo(0, -5, 15, -8); x.lineTo(13.5, -74); x.quadraticCurveTo(12.5, -80.5, 3, -81); x.closePath(); }, top, ow, 0.7);
    x.beginPath(); x.moveTo(-5, -60); x.lineTo(-6, -10); x.moveTo(5, -60); x.lineTo(6, -10); x.lineWidth = ow * 0.7; x.strokeStyle = shadeOf(top, 0.55); x.stroke();
  } else {
    const torso = () => { x.beginPath(); x.moveTo(-3, -81.2); x.quadraticCurveTo(-11, -81, -12, -76); x.lineTo(-10.6, -60); x.quadraticCurveTo(-9.6, -52, -9.6, -47.5); x.quadraticCurveTo(0, -46, 9.6, -47.5); x.quadraticCurveTo(9.6, -52, 10.6, -60); x.lineTo(12, -76); x.quadraticCurveTo(11, -81, 3, -81.2); x.closePath(); };
    shapeU(torso, top, ow);
    if (ts === 'suit' || ts === 'blazer') { // shirt V + lapels + tie
      shapeU(() => { x.beginPath(); x.moveTo(-3.4, -81); x.lineTo(3.4, -81); x.lineTo(0, -67); x.closePath(); }, L.shirt ?? '#fbf7ee', ow, 0.9);
      if (L.tie) shapeU(() => { x.beginPath(); x.moveTo(-1, -80.4); x.lineTo(1, -80.4); x.lineTo(1.4, -70); x.lineTo(0, -67.6); x.lineTo(-1.4, -70); x.closePath(); }, L.tie, ow * 0.8, 0.85);
      for (const sd of side) { x.beginPath(); x.moveTo(sd * 3.6, -81); x.lineTo(sd * 6.4, -74); x.lineTo(sd * 4.6, -72.6); x.lineTo(sd * 0.2, -60); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); }
      x.beginPath(); x.moveTo(0, -66); x.lineTo(0, -48); x.lineWidth = ow * 0.6; x.strokeStyle = shadeOf(top, 0.6); x.stroke();
      for (const by of [-58, -52.5]) { x.beginPath(); x.arc(0.9, by, 0.55, 0, TAU); x.fillStyle = OUT; x.fill(); }
      if (ts === 'suit') { x.beginPath(); x.moveTo(5, -71); x.lineTo(8.6, -71); x.lineWidth = ow * 0.9; x.strokeStyle = '#fbf7ee'; x.stroke(); }
    } else if (ts === 'hoodie') {
      shapeU(() => { x.beginPath(); x.moveTo(-6.5, -81); x.quadraticCurveTo(0, -75, 6.5, -81); x.quadraticCurveTo(5, -84, 0, -84.5); x.quadraticCurveTo(-5, -84, -6.5, -81); x.closePath(); }, shadeOf(top, 0.85), ow);
      x.beginPath(); x.moveTo(-1.6, -78); x.lineTo(-1.8, -71); x.moveTo(1.6, -78); x.lineTo(1.8, -71); x.lineWidth = ow * 0.6; x.strokeStyle = '#f2ece0'; x.stroke();
      x.beginPath(); x.moveTo(-6, -58); x.lineTo(6, -58); x.lineTo(7, -51); x.lineTo(-7, -51); x.closePath(); x.lineWidth = ow * 0.7; x.strokeStyle = shadeOf(top, 0.6); x.stroke();
    } else if (ts === 'cardigan') {
      shapeU(() => { x.beginPath(); x.moveTo(-3.4, -81); x.lineTo(3.4, -81); x.lineTo(2.4, -48); x.lineTo(-2.4, -48); x.closePath(); }, L.shirt ?? '#f4efe4', ow, 0.9);
      for (const by of [-74, -68, -62, -56]) { x.beginPath(); x.arc(-3.1, by, 0.5, 0, TAU); x.fillStyle = OUT; x.fill(); }
    } else if (ts === 'tee') {
      x.beginPath(); x.moveTo(-3.2, -81); x.quadraticCurveTo(0, -77.4, 3.2, -81); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke();
      if (L.print) { x.beginPath(); x.arc(0, -68, 3, 0, TAU); x.fillStyle = L.print; x.fill(); x.lineWidth = ow * 0.6; x.strokeStyle = OUT; x.stroke(); }
    } else if (ts === 'blouse') {
      shapeU(() => { x.beginPath(); x.moveTo(-4.4, -81.4); x.lineTo(0, -77); x.lineTo(4.4, -81.4); x.lineTo(2.6, -82.4); x.lineTo(0, -79.6); x.lineTo(-2.6, -82.4); x.closePath(); }, '#fbf7ee', ow, 0.9);
    }
  }
  if (L.bands) { for (const sd of side) shapeU(() => { x.beginPath(); x.moveTo(sd * 0.3, -80.6); x.lineTo(sd * 2.3, -80.6); x.lineTo(sd * 2.5, -73.6); x.lineTo(sd * 0.3, -73.8); x.closePath(); }, '#fbf7ee', ow * 0.8, 0.92); }
  // ---- arms ----
  const sleeve = L.sleeve ?? top, armW = ts === 'robe' ? 6.4 : 5.2, shY = -77;
  const hands = [];
  for (const [sd, [a1, a2]] of [[-1, armL], [1, armR]]) {
    const sx = sd * 9.6, [ex, ey, wx, wy, fa] = limb(sx, shY, sd, a1, a2, 14.5, 13.2);
    const short = ts === 'tee';
    if (short) { tube([sx, shY, ex, ey, wx, wy], 4.0, skin, ow); tube([sx, shY, lerp(sx, ex, 0.62), lerp(shY, ey, 0.62)], 5.4, sleeve, ow); }
    else { tube([sx, shY, ex, ey, wx, wy], armW, sleeve, ow); if (ts === 'robe') { x.beginPath(); x.moveTo(wx - Math.cos(fa) * 3.2, wy + Math.sin(fa) * 3.2 * sd); x.lineTo(wx + Math.cos(fa) * 3.2, wy - Math.sin(fa) * 3.2 * sd); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); } }
    hands.push([wx + Math.sin(fa) * sd * 1.6, wy + Math.cos(fa) * 1.6, fa, sd]);
  }
  for (const [hx, hy, fa, sd] of hands) hand(hx, hy, fa, sd, skin, ow);
  if (p.phone) { const [hx, hy] = hands[1]; const [gx, gy] = hands[0]; const px = (hx + gx) / 2, py = (hy + gy) / 2 - 1.5; x.save(); x.translate(px, py); x.rotate(-0.05); x.beginPath(); x.roundRect(-2.6, -4.6, 5.2, 8.4, 0.9); x.fillStyle = '#1e2229'; x.fill(); x.lineWidth = ow * 0.8; x.strokeStyle = OUT; x.stroke(); x.fillStyle = 'rgba(140,190,255,.9)'; x.fillRect(-2, -3.9, 4, 6.8); x.restore(); for (const [hx2, hy2, fa2, sd2] of hands) hand(hx2, hy2 + 0.6, fa2, sd2, skin, ow, 1.7); }
  if (p.gavel != null) { const [hx, hy] = hands[1]; x.save(); x.translate(hx, hy); x.rotate(p.gavel); tube([0, 1.5, 0, -12], 1.4, '#9a6a40', ow * 0.8); x.beginPath(); x.roundRect(-5.5, -16.5, 11, 6, 1.4); x.fillStyle = '#4f3220'; x.fill(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); x.restore(); hand(hx, hy, hands[1][2], 1, skin, ow); }
  if (p.pointer) { const L2 = p.pointer === 'L', [hx, hy] = hands[L2 ? 0 : 1], d = L2 ? -1 : 1; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx + d * 22, hy - 12); x.lineWidth = 1.1; x.strokeStyle = '#4f3220'; x.stroke(); x.beginPath(); x.arc(hx + d * 22, hy - 12, 0.9, 0, TAU); x.fillStyle = '#c0392b'; x.fill(); hand(hx, hy, hands[L2 ? 0 : 1][2], d, L.skin, Math.max(2.2, hpx * 0.0065) / u); }
  // ---- neck + head ----
  x.save(); x.translate(0, -82); x.rotate(p.tilt ?? 0); x.translate(0, 82);
  tube([0, -79.6, 0, -84.5], 4.8, skin, ow);
  if (L.hairStyle === 'long' || L.hairStyle === 'bob' || L.hairStyle === 'bun-long') shapeU(() => { x.beginPath(); x.moveTo(-8.4, -94); x.quadraticCurveTo(-9.6, -78, L.hairStyle === 'bob' ? -8.2 : -9.2, L.hairStyle === 'bob' ? -84 : -76); x.lineTo(L.hairStyle === 'bob' ? 8.2 : 9.2, L.hairStyle === 'bob' ? -84 : -76); x.quadraticCurveTo(9.6, -78, 8.4, -94); x.closePath(); }, L.hair, ow); // hair behind
  for (const sd of side) { x.beginPath(); x.ellipse(sd * 7.2, -90.5, 1.4, 2, 0, 0, TAU); x.fillStyle = skin; x.fill(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); }
  const face = () => { x.beginPath(); x.moveTo(0, -100.2); x.bezierCurveTo(5.4, -100.2, 7.6, -96.4, 7.5, -91); x.bezierCurveTo(7.4, -86.6, 4.6, -82.8, 0, -82.6); x.bezierCurveTo(-4.6, -82.8, -7.4, -86.6, -7.5, -91); x.bezierCurveTo(-7.6, -96.4, -5.4, -100.2, 0, -100.2); x.closePath(); };
  shapeU(face, skin, ow, 0.88, [1.2, 0.6]);
  // beard
  if (L.beard) shapeU(() => { x.beginPath(); x.moveTo(-7.2, -89); x.bezierCurveTo(-6.6, -84, -3.6, -81.6, 0, -81.4); x.bezierCurveTo(3.6, -81.6, 6.6, -84, 7.2, -89); x.quadraticCurveTo(5, -86, 2.6, -86.6); x.quadraticCurveTo(0, -87.4, -2.6, -86.6); x.quadraticCurveTo(-5, -86, -7.2, -89); x.closePath(); }, L.beardCol ?? L.hair, ow);
  // eyes, brows, nose, mouth
  const lk = p.look ?? [0, 0], bl = Math.max(p.blink ?? 0, blink((L.seed ?? 1) * 1.7));
  if (!L.bar) for (const sd of side) {
    const ex = sd * 2.9 + lk[0] * 0.5, ey = -91.6 + lk[1] * 0.4;
    if (bl > 0.5) { x.beginPath(); x.moveTo(ex - 1.1, ey); x.quadraticCurveTo(ex, ey + 0.6, ex + 1.1, ey); x.lineWidth = ow * 0.9; x.strokeStyle = OUT; x.stroke(); }
    else { x.beginPath(); x.ellipse(ex, ey, 0.85, 1.15, 0, 0, TAU); x.fillStyle = OUT; x.fill(); x.beginPath(); x.arc(ex - 0.25, ey - 0.4, 0.28, 0, TAU); x.fillStyle = '#fff'; x.fill(); }
    const br = p.brows ?? 0; x.beginPath(); x.moveTo(sd * 1.5, -94.4 + br * 0.8); x.lineTo(sd * 4.4, -94.9 - br * 0.3); x.lineWidth = ow * 1.1; x.strokeStyle = L.browCol ?? shadeOf(L.hair, 0.8); x.stroke();
  }
  x.beginPath(); x.moveTo(0.3, -90); x.quadraticCurveTo(1.2, -88, 0, -87.6); x.lineWidth = ow * 0.75; x.strokeStyle = shadeOf(skin, 0.6); x.stroke();
  const tk = p.talk ?? 0, sm = p.smile ?? 0.4;
  if (tk > 0.08) { const h = 0.6 + tk * 1.8; x.beginPath(); x.moveTo(-1.9, -85.4); x.quadraticCurveTo(0, -85.9 - sm * 0.3, 1.9, -85.4); x.quadraticCurveTo(0, -85.4 + h * 1.6, -1.9, -85.4); x.closePath(); x.fillStyle = '#6b2a24'; x.fill(); x.lineWidth = ow * 0.8; x.strokeStyle = OUT; x.stroke(); }
  else { x.beginPath(); x.moveTo(-1.9, -85.4 + sm * 0.2); x.quadraticCurveTo(0, -85.4 + sm * 1.3, 1.9, -85.4 + sm * 0.2); x.lineWidth = ow * 0.85; x.strokeStyle = OUT; x.stroke(); }
  if (L.blush) for (const sd of side) { x.beginPath(); x.ellipse(sd * 4.6, -87.6, 1.4, 0.8, 0, 0, TAU); x.fillStyle = 'rgba(230,120,110,.35)'; x.fill(); }
  // hair on top
  const hs = L.hairStyle, hc = L.hair;
  if (hs === 'short') shapeU(() => { x.beginPath(); x.moveTo(-7.8, -90); x.bezierCurveTo(-8.6, -100, -3, -103.4, 1, -102.6); x.bezierCurveTo(6, -102, 8.8, -98, 7.8, -90); x.quadraticCurveTo(6.8, -95, 3, -96.4); x.quadraticCurveTo(-2, -97.2, -5.6, -95); x.quadraticCurveTo(-7, -93, -7.8, -90); x.closePath(); }, hc, ow);
  else if (hs === 'slick') shapeU(() => { x.beginPath(); x.moveTo(-7.8, -91); x.bezierCurveTo(-8.2, -101, 4, -104.4, 7.9, -95); x.quadraticCurveTo(8, -92.5, 7.8, -91); x.quadraticCurveTo(6.4, -96.6, 1, -97.6); x.quadraticCurveTo(-4, -97.4, -7.8, -91); x.closePath(); }, hc, ow);
  else if (hs === 'curly') { for (let i = 0; i < 11; i++) { const a = PI * (1.02 + i * 0.096), r = 8.6; x.beginPath(); x.arc(Math.cos(a) * r * 0.95, -93 + Math.sin(a) * r * 0.95, 2.6, 0, TAU); x.fillStyle = hc; x.fill(); x.lineWidth = ow; x.strokeStyle = OUT; x.stroke(); } shapeU(() => { x.beginPath(); x.ellipse(0, -97, 7.2, 3.6, 0, PI, TAU); x.closePath(); }, hc, 0); }
  else if (hs === 'bun' || hs === 'bun-long') { shapeU(() => { x.beginPath(); x.arc(0, -102.6, 3.4, 0, TAU); }, hc, ow); shapeU(() => { x.beginPath(); x.moveTo(-7.8, -90); x.bezierCurveTo(-8.2, -101, 8.2, -101, 7.8, -90); x.quadraticCurveTo(4, -97, 0, -97.4); x.quadraticCurveTo(-4, -97, -7.8, -90); x.closePath(); }, hc, ow); }
  else if (hs === 'long' || hs === 'bob') shapeU(() => { x.beginPath(); x.moveTo(-8.2, -86); x.bezierCurveTo(-9.6, -101, 9.6, -101, 8.2, -86); x.quadraticCurveTo(7.6, -94, 3.6, -96.6); x.quadraticCurveTo(-1, -95, -4, -97.2); x.quadraticCurveTo(-7.6, -94.4, -8.2, -86); x.closePath(); }, hc, ow);
  else if (hs === 'buzz') shapeU(() => { x.beginPath(); x.moveTo(-7.6, -92); x.bezierCurveTo(-7.8, -100.6, 7.8, -100.6, 7.6, -92); x.quadraticCurveTo(0, -98, -7.6, -92); x.closePath(); }, hc, ow);
  else if (hs === 'bald') shapeU(() => { x.beginPath(); x.moveTo(-7.7, -88); x.quadraticCurveTo(-8.4, -93, -6.6, -95); x.lineTo(-6.2, -90); x.closePath(); x.moveTo(7.7, -88); x.quadraticCurveTo(8.4, -93, 6.6, -95); x.lineTo(6.2, -90); x.closePath(); }, hc, ow);
  else if (hs === 'cap') { shapeU(() => { x.beginPath(); x.moveTo(-7.9, -93); x.bezierCurveTo(-8, -103, 8, -103, 7.9, -93); x.closePath(); }, L.capCol ?? '#c0392b', ow); shapeU(() => { x.beginPath(); x.moveTo(-1, -93.5); x.lineTo(11, -93); x.quadraticCurveTo(10, -91.6, 4, -92.2); x.closePath(); }, shadeOf(L.capCol ?? '#c0392b', 0.8), ow); }
  if (L.glasses) { x.lineWidth = ow * 0.9; x.strokeStyle = L.glassesCol ?? OUT; for (const sd of side) { x.beginPath(); x.roundRect(sd * 2.9 - 2.1, -93.1, 4.2, 3.1, 1); x.stroke(); } x.beginPath(); x.moveTo(-0.8, -91.8); x.lineTo(0.8, -91.8); x.stroke(); }
  if (L.bar) { x.save(); x.rotate(-0.03); x.beginPath(); x.roundRect(-8.6, -93.8, 17.2, 4.4, 0.6); x.fillStyle = '#121212'; x.fill(); x.restore(); }
  x.restore(); // head
  x.restore(); // torso slump
  x.restore();
}

// ---- the cast (humans) ----
const LOOK = {
  judge: { seed: 1, skin: HSKIN[1], hair: HAIRC[5], hairStyle: 'bun', top: '#25242b', topStyle: 'robe', bottom: '#25242b', bottomStyle: 'robe', tights: '#25242b', shoes: '#1a1a1e', glasses: true, glassesCol: '#b8862e', bands: true, browCol: '#a9a196' },
  prosecutor: { seed: 2, skin: HSKIN[2], hair: HAIRC[0], hairStyle: 'slick', top: '#2f4870', topStyle: 'suit', shirt: '#fbf7ee', tie: '#c0392b', bottom: '#2f4870', bottomStyle: 'trousers', shoes: '#3a2418' },
  expert: { seed: 3, skin: HSKIN[4], hair: HAIRC[0], hairStyle: 'curly', top: '#b8873f', topStyle: 'cardigan', shirt: '#f4efe4', bottom: '#4a5568', bottomStyle: 'skirt', tights: '#2e2a30', shoes: '#5a2a24', glasses: true, glassesCol: '#2b1d17' },
  sam: { seed: 4, skin: HSKIN[0], hair: HAIRC[4], hairStyle: 'short', top: '#3f8f86', topStyle: 'hoodie', bottom: '#4a6a9a', bottomStyle: 'jeans', shoes: '#f2ece0', blush: true },
  jordan: { seed: 5, skin: HSKIN[3], hair: HAIRC[0], hairStyle: 'buzz', top: '#d9a441', topStyle: 'tee', print: '#c0392b', bottom: '#3a3f4a', bottomStyle: 'jeans', shoes: '#1f1f22', beard: true },
};
function defendantLook(i) {
  const styles = ['short', 'long', 'curly', 'cap', 'bob', 'buzz', 'bald', 'bun-long', 'slick', 'long', 'short', 'curly'];
  const tops = ['hoodie', 'tee', 'blouse', 'tee', 'cardigan', 'hoodie', 'blazer', 'tee', 'hoodie', 'blouse', 'tee', 'cardigan'];
  const bottoms = ['jeans', 'skirt', 'jeans', 'trousers', 'jeans', 'jeans', 'trousers', 'long-skirt', 'jeans', 'jeans', 'trousers', 'skirt'];
  const topCols = ['#5d7a97', '#c0392b', '#9bb08a', '#d9a441', '#7d6a99', '#3d5a80', '#6b4a3a', '#5f8f86', '#e07b39', '#8c5a8f', '#4a7a5a', '#a9473f'];
  const botCols = ['#3c4a66', '#2e2a30', '#4a6a9a', '#5a4a3a', '#3c4a66', '#2b3245', '#3a3a3a', '#6a4a6a', '#4a6a9a', '#3c4a66', '#4f5a4a', '#2e2a30'];
  return { seed: 10 + i, skin: HSKIN[(i * 4 + 1) % HSKIN.length], hair: HAIRC[(i * 3) % 5], hairStyle: styles[i], top: topCols[i], topStyle: tops[i], bottom: botCols[i], bottomStyle: bottoms[i], tights: HSKIN[(i * 4 + 1) % HSKIN.length], shoes: ['#1f1f22', '#f2ece0', '#5a2a24', '#2a2a2e'][i % 4], beard: i === 6 || i === 10, capCol: '#c0392b', glasses: i === 4 || i === 8, bar: true };
}
