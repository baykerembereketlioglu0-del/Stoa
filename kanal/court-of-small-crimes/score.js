// Court of Small Crimes — music + sound effects, all synthesized.
// Music: a sneaky pizzicato courtroom theme (Karplus–Strong plucked strings) over a walking bass; it ducks under speech.
// Usage: node kanal/court-of-small-crimes/score.js kanal/court-of-small-crimes/ep001-group-chat
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2]), EP = require(path.join(dir, 'script.js'));
const tlf = path.join(dir, 'timeline.js'), TL = JSON.parse(fs.readFileSync(tlf, 'utf8').replace(/^[\s\S]*?window\.TIMELINE=/, '').replace(/;\s*$/, ''));
const C = EP.cues(TL), SR = 44100, N = Math.ceil(TL.duration * SR), TAU = Math.PI * 2;
const ML = new Float32Array(N), MR = new Float32Array(N), FL = new Float32Array(N), FR = new Float32Array(N);
let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const lpA = fc => 1 - Math.exp(-TAU * fc / SR), H = m => 440 * Math.pow(2, (m - 69) / 12);
function pluck(buf, at, f, vol, pan = 0, decay = 0.996, bright = 0.5) { // Karplus–Strong
  const s0 = Math.floor(at * SR), P = Math.max(2, Math.round(SR / f)), ring = new Float32Array(P); for (let i = 0; i < P; i++) ring[i] = rnd() * (0.5 + bright * 0.5);
  let idx = 0, len = Math.floor(SR * 1.4);
  for (let j = 0; j < len && s0 + j < N; j++) { const a = ring[idx], b = ring[(idx + 1) % P], v = a; ring[idx] = (a + b) * 0.5 * decay; idx = (idx + 1) % P; const e = Math.min(1, j / 30); buf[0][s0 + j] += v * vol * e * (1 - pan); buf[1][s0 + j] += v * vol * e * (1 + pan); }
}
// --- music: 108 bpm, "tiptoe" minor theme
const BPM = 108, BEAT = 60 / BPM, M = [ML, MR];
const bassLine = [45, 48, 52, 48, 45, 47, 48, 50, 43, 47, 50, 47, 44, 47, 52, 50]; // walking bass (midi)
const melody = [[0, 69], [1, 72], [1.5, 71], [2, 69], [3, 64], [4, 69], [5, 72], [5.5, 74], [6, 76], [7, 75], [8, 76], [9, 74], [9.5, 72], [10, 71], [11, 68], [12, 69], [12.5, 71], [13, 72], [14, 71], [14.5, 69], [15, 68]];
const silent = t => C.musicDuck.some(([a, b]) => t > a && t < b);
for (let bar = 0; bar * 16 * BEAT < TL.duration + 1; bar++) {
  const b0 = 0.4 + bar * 16 * BEAT;
  bassLine.forEach((m, i) => { const t = b0 + i * BEAT; if (t < TL.duration - 1.5 && !silent(t)) pluck(M, t, H(m - 12), 0.42, -0.15, 0.994, 0.3); });
  melody.forEach(([b, m]) => { const t = b0 + b * BEAT; if (t < TL.duration - 2 && !silent(t) && bar > 0) pluck(M, t, H(m), 0.2, 0.25, 0.992, 0.8); });
  for (let i = 0; i < 16; i++) { const t = b0 + i * BEAT + BEAT / 2; if (t > TL.duration - 2 || silent(t)) continue; let hp = 0; const s0 = Math.floor(t * SR); for (let j = 0; j < 1800 && s0 + j < N; j++) { const n = rnd(); hp += lpA(6000) * (n - hp); const v = (n - hp) * Math.exp(-j / 260) * 0.05; ML[s0 + j] += v; MR[s0 + j] += v; } } // brush
}
// --- effects
function add(at, len, fn) { const s0 = Math.max(0, Math.floor(at * SR)), s1 = Math.min(N, Math.floor((at + len) * SR)); for (let i = s0; i < s1; i++) { const [l, r] = fn(i / SR - at); FL[i] += l; FR[i] += r; } }
const FX = {
  gavel(at, g) { [0, 0.11].forEach((o, k) => { let a = 0; add(at + o, 0.5, t => { const n = rnd(); a += lpA(1400) * (n - a); const wood = Math.sin(TAU * 190 * t) * Math.exp(-t * 28) + Math.sin(TAU * 470 * t) * Math.exp(-t * 40) * 0.6 + Math.sin(TAU * 95 * t) * Math.exp(-t * 14) * 0.7; const v = (wood * 0.9 + a * 1.4 * Math.exp(-t * 60)) * g * (k ? 0.75 : 1); return [v, v]; }); }); },
  stamp(at, g) { let a = 0; add(at, 0.45, t => { const n = rnd(); a += lpA(600) * (n - a); const v = (Math.sin(TAU * 70 * t) * Math.exp(-t * 18) + a * 2 * Math.exp(-t * 35)) * g; return [v, v]; }); },
  whoosh(at, g) { let a = 0, b = 0; const len = 0.32; add(at - len, len + 0.1, t => { const p = t / len, n = rnd(); a += lpA(400 + 4000 * p) * (n - a); b += lpA(200 + 1500 * p) * (a - b); const e = p < 1 ? p * p : Math.exp(-(t - len) * 30); return [(a - b) * e * g, (a - b) * e * g * 0.8]; }); },
  ping(at, g) { add(at, 0.7, t => { const v = (Math.sin(TAU * 1568 * t) * 0.6 + Math.sin(TAU * 2349 * t) * 0.4) * Math.exp(-t * 7) * g * 0.3 * ss(0, 0.004, t); return [v, v]; }); },
  tick(at, g) { add(at, 0.06, t => { const v = Math.sin(TAU * 2600 * t) * Math.exp(-t * 80) * g * 0.25; return [v, v]; }); },
  ding(at, g) { [0, 0.12].forEach((o, k) => add(at + o, 0.9, t => { const f = k ? 1318 : 1047, v = Math.sin(TAU * f * t) * Math.exp(-t * 5) * g * 0.28 * ss(0, 0.004, t); return [v, v]; })); },
  crickets(at, g) { for (let c = 0; c < 9; c++) { const t0 = at + c * 0.32 + (c % 2) * 0.05; add(t0, 0.12, t => { const v = Math.sin(TAU * 4400 * t) * (Math.sin(TAU * 60 * t) > 0 ? 1 : 0) * Math.exp(-t * 20) * g * 0.12; return [v * (c % 2 ? 0.6 : 1), v * (c % 2 ? 1 : 0.6)]; }); } },
  chalk(at, g) { let hp = 0; add(at, 0.6, t => { const n = rnd(); hp += lpA(3000) * (n - hp); const v = (n - hp) * Math.max(0, Math.sin(t * 30)) * Math.exp(-t * 3) * g * 0.18; return [v, v]; }); },
  split(at, g) { for (let k = 0; k < 12; k++) add(at + k * 0.05, 0.12, t => { const v = Math.sin(TAU * (900 + k * 80) * t) * Math.exp(-t * 40) * g * 0.12; return [v, v]; }); },
  murmur(at, g) { let a = 0, b = 0; add(at, 2.2, t => { const n = rnd(); a += lpA(700) * (n - a); b += lpA(220) * (a - b); const e = ss(0, 0.4, t) * (1 - ss(1.4, 2.2, t)) * (0.6 + 0.4 * Math.sin(t * 11) * Math.sin(t * 7)); const v = (a - b) * e * g * 1.2; return [v, v]; }); },
  gasp(at, g) { let a = 0, b = 0; add(at, 1.2, t => { const n = rnd(); a += lpA(2500) * (n - a); b += lpA(500) * (a - b); const e = ss(0, 0.12, t) * Math.exp(-t * 2.5); const v = (a - b) * e * g; return [v, v]; }); },
  drumroll(at, g) { const len = Math.max(0.6, C.guilty - at - 0.05); let a = 0; add(at, len, t => { const n = rnd(); a += lpA(900) * (n - a); const roll = 0.5 + 0.5 * Math.sin(TAU * 22 * t); const v = a * roll * ss(0, len, t) * g * 0.9; return [v, v]; }); },
};
for (const f of C.fx) FX[f.type] && FX[f.type](f.t, f.g);
// --- mix: music sits low; voice ducking happens at mux time
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const t = i / SR, fade = ss(0, 0.05, t) * (1 - ss(TL.duration - 1.5, TL.duration, t)); const l = Math.tanh((ML[i] * 0.85 + FL[i]) * fade), r = Math.tanh((MR[i] * 0.85 + FR[i]) * fade); buf.writeInt16LE(Math.round(l * 30000), 44 + i * 4); buf.writeInt16LE(Math.round(r * 30000), 46 + i * 4); }
fs.writeFileSync(path.join(dir, 'soundtrack.wav'), buf); console.log('Ready: soundtrack.wav', TL.duration.toFixed(1) + ' s', C.fx.length + ' effects');
