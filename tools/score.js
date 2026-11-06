// Generic soundtrack generator: mood-based music + ambience + sound effects, all synthesized.
// Reads the episode's cues(): C.moods [{start,end,mood,overlay}], C.ambience [{start,end,type,g}], C.fx [{type,t,g}].
// Usage: node tools/score.js bolumler/02-inner-citadel   -> soundtrack.wav
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '.');
const EP = require(path.join(dir, 'script.js'));
const tlFile = path.join(dir, 'timeline.js');
const TL = fs.existsSync(tlFile) ? JSON.parse(fs.readFileSync(tlFile, 'utf8').replace(/^[\s\S]*?window\.TIMELINE=/, '').replace(/;\s*$/, '')) : EP.estimateTimeline();
const C = EP.cues(TL);
const SR = 44100, N = Math.ceil(TL.duration * SR), TAU = Math.PI * 2;
const ML = new Float32Array(N), MR = new Float32Array(N), FL = new Float32Array(N), FR = new Float32Array(N);
let seed = 987654321; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lpA = fc => 1 - Math.exp(-TAU * fc / SR);
const H = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz

// ---------- wavetable ----------
const TS = 4096;
function table(weights) { const tb = new Float32Array(TS + 1); for (let i = 0; i <= TS; i++) { let v = 0; weights.forEach((w, h) => v += w * Math.sin(TAU * (h + 1) * i / TS)); tb[i] = v; } let m = 0; tb.forEach(v => m = Math.max(m, Math.abs(v))); for (let i = 0; i <= TS; i++) tb[i] /= m; return tb; }
const PAD = table([1, 0.5, 0.33, 0.22, 0.15, 0.1, 0.07, 0.05]), WARM = table([1, 0.3, 0.12, 0.05]), STR = table([1, 0.6, 0.45, 0.35, 0.28, 0.22, 0.18, 0.14, 0.11, 0.09]);
function osc(tb, ph) { const p = (ph - Math.floor(ph)) * TS, i = p | 0, f = p - i; return tb[i] + (tb[i + 1] - tb[i]) * f; }

// ---------- moods ----------
const MOODS = {
  dark:    { notes: [33, 40, 45, 48], tb: PAD, g: 0.16, mel: null, pulse: 0.5 },
  epic:    { notes: [38, 45, 50, 53, 57], tb: STR, g: 0.17, mel: null, pulse: 0.8 },
  noble:   { notes: [36, 43, 48, 52, 55], tb: WARM, g: 0.15, mel: [60, 64, 67, 72, 69, 67], rate: 1.6 },
  grief:   { notes: [33, 45, 48, 52], tb: WARM, g: 0.14, mel: [57, 60, 64, 62, 60, 69, 67], rate: 2.0 },
  war:     { notes: [38, 45, 41, 50], tb: STR, g: 0.15, mel: null, pulse: 0.9 },
  night:   { notes: [41, 48, 57, 60], tb: WARM, g: 0.12, mel: [65, 69, 72, 76, 74], rate: 2.4 },
  tension: { notes: [35, 41, 48, 47], tb: STR, g: 0.13, mel: null, pulse: 0.7 },
  calm:    { notes: [41, 48, 57, 64], tb: WARM, g: 0.14, mel: [65, 69, 72, 77, 76, 72], rate: 2.2 },
  hope:    { notes: [43, 50, 59, 66], tb: WARM, g: 0.15, mel: [67, 71, 74, 79, 78, 74], rate: 1.8 },
};
function moodGain(m, t) { const fi = 2.5, fo = 2.5; return ss(m.start - fi * 0.5, m.start + fi * 0.5, t) * (1 - ss(m.end - fo * 0.5, m.end + fo * 0.5, t)); }
const base = C.moods.filter(m => !m.overlay), over = C.moods.filter(m => m.overlay);
for (const m of [...base, ...over]) {
  const P = MOODS[m.mood]; if (!P) continue;
  const s0 = Math.max(0, Math.floor((m.start - 2) * SR)), s1 = Math.min(N, Math.ceil((m.end + 2) * SR));
  P.notes.forEach((n, ni) => {
    const f = H(n), det = [0.997, 1, 1.0035], ph = det.map((_, d) => (ni * 0.37 + d * 0.21) % 1);
    for (let i = s0; i < s1; i++) {
      const t = i / SR; let g = moodGain(m, t); if (g < 1e-4) continue;
      // overlays (night) duck the base layer: handled by subtracting below
      const lfo = 0.72 + 0.28 * Math.sin(TAU * (0.05 + ni * 0.017) * t + ni * 1.3);
      let l = 0, r = 0;
      for (let d = 0; d < 3; d++) { ph[d] += f * det[d] / SR; const v = osc(P.tb, ph[d]); if (d === 0) l += v; else if (d === 2) r += v; else { l += v * 0.6; r += v * 0.6; } }
      const amp = P.g * g * lfo * (ni === 0 ? 1.1 : 0.75) * (m.overlay ? 1 : 1);
      ML[i] += l * amp * 0.5; MR[i] += r * amp * 0.5;
    }
  });
  // low pulse for dark / epic / war / tension
  if (P.pulse) { let ph = 0; const f = H(P.notes[0]); for (let i = s0; i < s1; i++) { const t = i / SR, g = moodGain(m, t); if (g < 1e-4) continue; ph += f / SR; const beat = (t * 1.0) % 1, env = Math.exp(-beat * 5); const v = Math.sin(TAU * ph) * env * P.pulse * 0.12 * g; ML[i] += v; MR[i] += v; } }
  // sparse melody (piano-like plucks)
  if (P.mel) {
    let k = 0;
    for (let t = m.start + 1.2; t < m.end - 1.5; t += P.rate * (0.75 + 0.5 * ((k * 37) % 7) / 7), k++) {
      const n = P.mel[(k * 3 + (k >> 2)) % P.mel.length], f = H(n), gg = moodGain(m, t) * 0.07 * (0.7 + 0.3 * ((k * 13) % 5) / 5), s = Math.floor(t * SR), len = Math.floor(3.2 * SR), pan = ((k * 7) % 5) / 4 - 0.5;
      for (let j = 0; j < len && s + j < N; j++) { const tt = j / SR, e = Math.exp(-tt * 1.5) * Math.min(1, tt * 300); const v = (Math.sin(TAU * f * tt) + 0.35 * Math.sin(TAU * f * 2 * tt) * Math.exp(-tt * 3) + 0.12 * Math.sin(TAU * f * 3.01 * tt) * Math.exp(-tt * 5)) * e * gg; ML[s + j] += v * (1 - pan); MR[s + j] += v * (1 + pan); }
    }
  }
}

// ---------- ambience ----------
for (const a of C.ambience) {
  const s0 = Math.max(0, Math.floor((a.start - 1.5) * SR)), s1 = Math.min(N, Math.ceil((a.end + 1.5) * SR));
  let l1 = 0, l2 = 0, r1 = 0, hp = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR, g = ss(a.start - 1.5, a.start + 1.5, t) * (1 - ss(a.end - 1.5, a.end + 1.5, t)) * a.g; if (g < 1e-4) continue;
    const n = rnd(), n2 = rnd();
    if (a.type === 'wind') { const fc = 260 + 220 * Math.sin(TAU * 0.07 * t) + 120 * Math.sin(TAU * 0.19 * t); l1 += lpA(fc) * (n - l1); l2 += lpA(fc * 0.7) * (l1 - l2); r1 += lpA(fc * 1.1) * (n2 - r1); ML[i] += l2 * g * 0.9; MR[i] += r1 * g * 0.8; }
    if (a.type === 'rain') { hp += lpA(3000) * (n - hp); ML[i] += (n - hp) * g * 0.05; MR[i] += (n2 * 0.5 + (n - hp) * 0.5) * g * 0.05; }
    if (a.type === 'sea') { const sw = 0.5 + 0.5 * Math.sin(TAU * 0.11 * t) * Math.sin(TAU * 0.043 * t + 1); l1 += lpA(500 + 900 * sw) * (n - l1); r1 += lpA(450 + 800 * sw) * (n2 - r1); ML[i] += l1 * g * (0.25 + 0.6 * sw); MR[i] += r1 * g * (0.25 + 0.6 * sw); }
    if (a.type === 'fire') { l1 += lpA(300) * (n - l1); const crack = Math.random() < 0.0009 ? 1 : 0; hp = hp * 0.93 + crack * (Math.random() * 2 - 1); ML[i] += (l1 * 0.4 + hp * 0.6) * g * 0.35; MR[i] += (l1 * 0.4 + hp * 0.5) * g * 0.35; }
  }
}

// ---------- effects ----------
function add(at, len, fn) { const s0 = Math.max(0, Math.floor(at * SR)), s1 = Math.min(N, Math.floor((at + len) * SR)); for (let i = s0; i < s1; i++) { const [l, r] = fn(i / SR - at); FL[i] += l; FR[i] += r; } }
const FX = {
  boom(at, g) { let ph = 0, nz = 0; add(at, 3.5, t => { const f = 30 + 70 * Math.exp(-t * 3); ph += TAU * f / SR; nz += lpA(800 * Math.exp(-t * 4) + 60) * (rnd() - nz); const v = (Math.sin(ph) * Math.exp(-t * 1.2) * 0.9 + nz * 2 * Math.exp(-t * 6)) * g * ss(0, 0.004, t); return [v, v]; }); },
  hit(at, g) { let ph = 0, nz = 0, hp = 0; add(at, 1.6, t => { const f = 45 + 90 * Math.exp(-t * 9); ph += TAU * f / SR; const n = rnd(); nz += lpA(1500 * Math.exp(-t * 8) + 100) * (n - nz); hp += lpA(4000) * (n - hp); const v = (Math.sin(ph) * Math.exp(-t * 3) * 0.8 + nz * 1.6 * Math.exp(-t * 10) + (n - hp) * 0.4 * Math.exp(-t * 40)) * g * ss(0, 0.002, t); return [v, v]; }); },
  whoosh(at, g, len = 0.8) { let a = 0, b = 0; add(at - len, len + 0.2, t => { const p = t / len, fc = 300 + 3600 * p * p, n = rnd(); a += lpA(fc) * (n - a); b += lpA(fc * 0.35) * (a - b); const e = p < 1 ? p * p * p : Math.exp(-(t - len) * 25), pan = Math.sin(p * Math.PI) * 0.6; return [(a - b) * e * g * (1 - pan), (a - b) * e * g * (1 + pan)]; }); },
  bell(at, g, f = 220) { const parts = [[1, 1], [2.01, 0.5], [2.76, 0.35], [5.4, 0.15], [8.9, 0.07]]; add(at, 7, t => { let v = 0; for (const [m, a] of parts) v += Math.sin(TAU * f * m * t) * a * Math.exp(-t * (0.5 + m * 0.3)); v *= g * 0.6 * ss(0, 0.003, t); return [v, v * 0.92]; }); },
  riser(at, g, len = 2.2) { let a = 0, ph = 0; add(at, len, t => { const p = t / len; a += lpA(400 + 6000 * p) * (rnd() - a); ph += TAU * (120 + 600 * p * p) / SR; const v = (a * 0.7 + Math.sin(ph) * 0.25) * p * p * g; return [v, v]; }); },
  thunder(at, g) { let a = 0, b = 0, hp = 0; add(at, 6, t => { const n = rnd(); hp += lpA(3000) * (n - hp); const snap = (n - hp) * Math.exp(-t * 16) * 0.8; a += lpA(170) * (n - a); b += lpA(65) * (a - b); const roll = b * 9 * Math.exp(-t * 0.7) * (0.7 + 0.3 * Math.sin(t * 8 + Math.sin(t * 3) * 2)) * ss(0, 0.1, t); return [(snap + roll) * g, (snap * 0.8 + roll * 1.1) * g]; }); },
  heart(at, g) { for (let k = 0; k < 6; k++) { const b = at + k * 0.85; [0, 0.2].forEach((o, j) => add(b + o, 0.35, t => { const v = Math.sin(TAU * (46 + 40 * Math.exp(-t * 25)) * t) * Math.exp(-t * 14) * g * (j ? 0.6 : 1) * ss(0, 0.003, t); return [v, v]; })); } },
  crowd(at, g) { let a = 0, b = 0; add(at, 5, t => { const n = rnd(); a += lpA(900) * (n - a); b += lpA(250) * (a - b); const e = ss(0, 0.8, t) * (1 - ss(3, 5, t)), mur = 0.6 + 0.4 * Math.sin(t * 13) * Math.sin(t * 7.7); const v = (a - b) * e * mur * g * 1.4; return [v, v * 0.9 + (a - b) * 0.1 * g]; }); },
  quill(at, g) { let hp = 0; add(at, 4.5, t => { const n = rnd(); hp += lpA(5000) * (n - hp); const stroke = Math.max(0, Math.sin(t * 9 + Math.sin(t * 2.3) * 2)) ** 3, v = (n - hp) * stroke * g * 0.12; return [v, v]; }); },
  fire(at, g) { let a = 0, hp = 0; add(at, 4, t => { const n = rnd(); a += lpA(250) * (n - a); const crack = Math.random() < 0.003 ? 1 : 0; hp = hp * 0.9 + crack * rnd(); const e = ss(0, 0.3, t) * (1 - ss(2.5, 4, t)); const v = (a * 1.2 + hp * 0.8) * e * g; return [v, v]; }); },
  gate(at, g) { FX.boom(at, g * 0.7); let ph = 0; add(at + 0.02, 1.4, t => { ph += TAU * 180 / SR; const v = (Math.sin(ph) * 0.4 + Math.sin(ph * 2.7) * 0.3 + Math.sin(ph * 4.2) * 0.2) * Math.exp(-t * 6) * g * 0.5; return [v, v]; }); },
  waves(at, g) { for (let k = 0; k < 8; k++) { let a = 0; add(at + k * 3.3, 3, t => { a += lpA(1200 * Math.exp(-t * 0.8) + 200) * (rnd() - a); const e = ss(0, 0.25, t) * Math.exp(-t * 1.2); const v = a * e * g * 1.3; return [v, v * 0.9]; }); } },
  drums(at, g) { for (let bar = 0; bar < 10; bar++) [0, 0.5, 0.75, 1.0].forEach((o, j) => { const bt = at + bar * 1.5 + o; let ph = 0; add(bt, 0.8, t => { ph += TAU * (55 + 60 * Math.exp(-t * 18)) / SR; const v = (Math.sin(ph) * Math.exp(-t * 5) + rnd() * 0.2 * Math.exp(-t * 30)) * g * (j === 0 ? 0.9 : 0.55) * (1 - bar / 14); return [v, v]; }); }); },
};
for (const f of C.fx) if (FX[f.type]) FX[f.type](f.t, f.g);

// ---------- reverb (fx bus) ----------
function reverb(inp, mix, combs, off) {
  const out = new Float32Array(N);
  combs.forEach(ms => { const d = Math.floor((ms + off) * SR / 1000), buf = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const y = buf[p]; lp += 0.3 * (y - lp); buf[p] = inp[i] + lp * 0.82; p = (p + 1) % d; out[i] += y / combs.length; } });
  [5.0, 1.7].forEach(ms => { const d = Math.floor(ms * SR / 1000), buf = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = buf[p], y = -0.7 * out[i] + b; buf[p] = out[i] + 0.7 * y; p = (p + 1) % d; out[i] = y; } });
  for (let i = 0; i < N; i++) inp[i] += out[i] * mix;
}
reverb(FL, 0.5, [29.7, 37.1, 41.1, 43.7], 0); reverb(FR, 0.5, [29.7, 37.1, 41.1, 43.7], 1.3);
reverb(ML, 0.25, [31.3, 39.7, 47.2], 0); reverb(MR, 0.25, [31.3, 39.7, 47.2], 2.1);

// ---------- mix + write ----------
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = ss(0, 0.05, t) * (1 - ss(TL.duration - 2.5, TL.duration, t));
  const l = Math.tanh((ML[i] + FL[i] * 0.85) * fade * 1.15), r = Math.tanh((MR[i] + FR[i] * 0.85) * fade * 1.15);
  buf.writeInt16LE(Math.round(l * 32000), 44 + i * 4); buf.writeInt16LE(Math.round(r * 32000), 46 + i * 4);
}
fs.writeFileSync(path.join(dir, 'soundtrack.wav'), buf);
console.log(`Ready: soundtrack.wav (${TL.duration.toFixed(1)} s, ${C.fx.length} effects, ${C.moods.length} mood sections)`);
