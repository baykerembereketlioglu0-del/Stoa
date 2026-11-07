// Animated lyrics. window.LYRICS = [{ t0, t1, text }] (times in seconds). Words are spread over each line by length,
// unless a line gives its own word times as words: [[word, t0, t1], ...].
const LYR = (window.LYRICS || []).map((l, i) => {
  if (l.words) return { ...l, i, words: l.words };
  const ws = l.text.split(/\s+/).filter(Boolean), wt = ws.map(w => 0.5 + w.length), tot = wt.reduce((a, b) => a + b, 0), span = (l.t1 - l.t0) * 0.92;
  let c = l.t0; return { ...l, i, words: ws.map((w, j) => { const d = span * wt[j] / tot, r = [w, c, c + d]; c += d; return r; }) };
});
const UPPER = s => s.toLocaleUpperCase('tr');
function lyricBurst(t, px, py, w, seed, k) { // a word turning to embers
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const ex = px + (R(i + seed) - 0.5) * w + Math.sin(i + t * 3) * 10 * k, ey = py - k * (40 + R(i * 3 + seed) * 160), r = (3 + R(i * 7) * 7) * (1 - k * 0.6); x.globalAlpha = (1 - k) * 0.9; x.drawImage(glow('255,130,40'), ex - r * 3, ey - r * 3, r * 6, r * 6); }
  x.restore();
}
function lyrics(t) {
  for (const L of LYR) {
    const out = L.t1 + 0.45; if (t < L.t0 - 0.2 || t > out + 0.6) continue;
    const s = secAt(L.t0), loud = DROPS.includes(s.n) || s.n === 'build', boxed = letterbox(t) > 0.6 && !loud;
    const kp = kickP(t), exitK = ss(L.t1 + 0.05, out + 0.5, t);
    const font = loud ? '900 92px Cinzel' : boxed ? '600 italic 60px Cormorant' : '900 70px Cinzel', ls = loud ? 10 : boxed ? 1 : 6;
    x.save(); x.font = font; x.letterSpacing = ls + 'px'; x.textBaseline = 'middle';
    const words = L.words.map(([w, a, b]) => ({ w: loud || !boxed ? UPPER(w) : w, a, b })), sp = x.measureText(' ').width + ls;
    // wrap to at most two rows
    const maxW = 1600, rows = [[]]; let rw = 0; words.forEach(o => { const ww = x.measureText(o.w).width; if (rw + ww > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(o); rw += ww + sp; });
    const lh = loud ? 108 : boxed ? 64 : 84;
    let y0 = boxed ? H - 66 - (rows.length - 1) * lh / 2 : loud ? (L.i % 2 ? 860 : 200) : 900;
    if (boxed && rows.length > 1) y0 = H - 66 - lh * 0.5;
    const shakeX = loud ? Math.sin(t * 87) * 6 * kp : 0, shakeY = loud ? Math.cos(t * 71) * 5 * kp : 0;
    rows.forEach((r, ri) => {
      const full = r.reduce((a, o) => a + x.measureText(o.w).width, 0) + sp * (r.length - 1); let px = 960 - full / 2;
      r.forEach((o, j) => {
        const ww = x.measureText(o.w).width, k = ss(o.a - 0.06, o.a + 0.14, t), cur = t >= o.a && t < o.b + 0.1, cx = px + ww / 2, cy = y0 + ri * lh;
        if (k > 0 && exitK < 1) {
          x.save(); x.translate(cx + shakeX, cy + shakeY - (boxed ? (1 - k) * 18 : 0) - exitK * 40);
          const sc = loud ? 1 + 0.6 * (1 - easeOut(k)) + (cur ? 0.06 * kp : 0) : 1; x.scale(sc, sc);
          x.globalAlpha = k * (1 - exitK);
          x.shadowColor = loud ? 'rgba(255,90,20,.95)' : 'rgba(0,0,0,.9)'; x.shadowBlur = loud ? 30 + 30 * (cur ? 1 : 0) : 14;
          if (loud) { x.lineWidth = 10; x.strokeStyle = 'rgba(10,3,2,.85)'; x.textAlign = 'center'; x.strokeText(o.w, 0, 0); }
          x.textAlign = 'center';
          x.fillStyle = cur ? (loud ? '#ffd28a' : '#ffffff') : loud ? '#f4e6d2' : boxed ? '#e8d8c4' : '#f0e2cc';
          if (cur && loud) { const g = x.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, '#fff2c8'); g.addColorStop(1, '#ff7a2a'); x.fillStyle = g; }
          x.fillText(o.w, 0, 0); x.restore();
        }
        if (exitK > 0 && exitK < 1 && loud) lyricBurst(t, cx, cy, ww, L.i * 31 + j, exitK);
        px += ww + sp;
      });
    });
    x.restore();
  }
}
