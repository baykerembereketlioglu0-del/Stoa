// Karanlık fon müziği + efektleri (boom, whoosh, kalp atışı, gök gürültüsü, kemik çatırtısı)
// tamamen kodla sentezler. Olay zamanları bölümün script.js -> cues() fonksiyonundan gelir,
// yani ses ile görüntü aynı anlara kilitlidir.
// Kullanım: node tools/soundtrack.js bolumler/01-elinde-olan   -> soundtrack.wav
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '.');
const EP = require(path.join(dir, 'script.js'));
const tlFile = path.join(dir, 'timeline.js');
const TL = fs.existsSync(tlFile)
  ? JSON.parse(fs.readFileSync(tlFile, 'utf8').replace(/^[\s\S]*?window\.TIMELINE=/, '').replace(/;\s*$/, ''))
  : EP.estimateTimeline();
const C = EP.cues(TL), S = C.scenes;
const SR = 48000, N = Math.ceil(TL.duration * SR);
const L = new Float32Array(N), R = new Float32Array(N);       // müzik
const FL = new Float32Array(N), FR = new Float32Array(N);     // efekt (yankıya gider)
const TAU = Math.PI * 2;
let seed = 1234567; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const env = (t, a, b, fi, fo) => ss(a - fi, a, t) * (1 - ss(b, b + fo, t)); // [a,b] aralığında açık
const lpA = fc => 1 - Math.exp(-TAU * fc / SR);
const inScene = (name, t, fi = 0.6, fo = 0.6) => env(t, S[name].start, S[name].end, fi, fo);

// ---------- MÜZİK: katmanlı drone ----------
const pads = [
  // [frekans, genlik, harmonik sayısı, hangi sahnelerde]
  [55.0, 0.20, 7, ['hook', 'rome', 'circle', 'storm', 'quote', 'outro']],  // A1
  [82.41, 0.10, 6, ['hook', 'rome', 'storm', 'quote', 'outro']],          // E2
  [110.0, 0.07, 5, ['circle', 'quote', 'outro']],                         // A2
  [130.81, 0.06, 5, ['rome', 'circle', 'quote']],                         // C3 (minör renk)
  [65.41, 0.10, 6, ['rome', 'storm']],                                    // C2 gerilim
  [123.47, 0.045, 4, ['storm']],                                          // B2 uyumsuzluk
];
pads.forEach(([f0, amp, H, scenes], pi) => {
  const det = [0.997, 1.0, 1.004], ph = det.map(() => (rnd() + 1) * Math.PI);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let g = 0; for (const s of scenes) g = Math.max(g, inScene(s, t, 1.2, 1.2));
    if (g < 1e-4) continue;
    const lfo = 0.75 + 0.25 * Math.sin(TAU * (0.07 + pi * 0.013) * t + pi);
    let vL = 0, vR = 0;
    for (let d = 0; d < 3; d++) {
      const base = TAU * f0 * det[d] * t + ph[d];
      let v = 0; for (let h = 1; h <= H; h++) v += Math.sin(base * h) / (h * h * 0.7 + 0.3);
      if (d === 0) vL += v; else if (d === 2) vR += v; else { vL += v * 0.5; vR += v * 0.5; }
    }
    L[i] += vL * amp * g * lfo * 0.5; R[i] += vR * amp * g * lfo * 0.5;
  }
});

// Daire ve alıntı sahnesinde yüksek, cam gibi parıltı tonları
[[440, 0.018], [659.25, 0.014], [880, 0.008], [987.77, 0.006]].forEach(([f, a], k) => {
  for (let i = 0; i < N; i++) {
    const t = i / SR, g = Math.max(inScene('circle', t, 1.5, 1), inScene('quote', t, 1, 1.5) * 0.8);
    if (g < 1e-4) continue;
    const trem = 0.5 + 0.5 * Math.sin(TAU * (0.3 + k * 0.17) * t + k);
    const v = Math.sin(TAU * f * t + Math.sin(TAU * 5 * t) * 0.6) * a * g * trem;
    L[i] += v * (k % 2 ? 0.6 : 1); R[i] += v * (k % 2 ? 1 : 0.6);
  }
});

// Rüzgâr: süzülmüş gürültü (sahneye göre şiddet), fırtınada yağmur
{
  let w1 = 0, w2 = 0, rL = 0, rR = 0, hp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const wind = 0.05 + 0.05 * inScene('rome', t) + 0.22 * inScene('storm', t, 0.4, 0.8) + 0.03 * inScene('hook', t);
    const fc = 300 + 250 * Math.sin(TAU * 0.11 * t) + 400 * inScene('storm', t);
    const n = rnd(); w1 += lpA(fc) * (n - w1); w2 += lpA(fc * 0.6) * (w1 - w2);
    L[i] += w2 * wind * 1.6; R[i] += w1 * wind * 1.3;
    const rain = inScene('storm', t, 0.3, 0.8) * 0.06 + inScene('rome', t) * 0.012;
    if (rain > 0) { const m = rnd(); hp += lpA(2500) * (m - hp); rL = m - hp; rR = rnd() * 0.5 + rL * 0.5; L[i] += rL * rain; R[i] += rR * rain; }
  }
}

// ---------- EFEKTLER ----------
function add(buf2, at, len, fn) { // fn(t) -> [l, r]
  const s0 = Math.max(0, Math.floor(at * SR)), s1 = Math.min(N, Math.floor((at + len) * SR));
  for (let i = s0; i < s1; i++) { const [l, r] = fn(i / SR - at); buf2[0][i] += l; buf2[1][i] += r; }
}
const FX = [FL, FR];

function boom(at, gain = 1) {
  let ph = 0, nz = 0;
  add(FX, at, 3.2, t => {
    const f = 32 + 70 * Math.exp(-t * 3.2); ph += TAU * f / SR;
    const body = Math.sin(ph) * Math.exp(-t * 1.25);
    nz += lpA(900 * Math.exp(-t * 4) + 60) * (rnd() - nz);
    const v = (body * 0.85 + nz * 2.2 * Math.exp(-t * 6)) * gain * ss(0, 0.004, t);
    return [v, v];
  });
}
function whoosh(at, len = 0.7, gain = 0.5) {
  let a = 0, b = 0;
  add(FX, at - len, len + 0.15, t => {
    const p = t / len, fc = 300 + 3500 * p * p;
    const n = rnd(); a += lpA(fc) * (n - a); b += lpA(fc * 0.35) * (a - b);
    const e = p < 1 ? p * p * p : Math.exp(-(t - len) * 30);
    const pan = Math.sin(p * Math.PI) * 0.6;
    return [(a - b) * e * gain * (1 - pan), (a - b) * e * gain * (1 + pan)];
  });
}
function thump(at, gain) {
  add(FX, at, 0.35, t => { const v = Math.sin(TAU * (48 + 40 * Math.exp(-t * 25)) * t) * Math.exp(-t * 14) * gain * ss(0, 0.003, t); return [v, v]; });
}
function crack(at, gain = 1) { // kemik çatırtısı: kısa, sert, birkaç kırılma
  [0, 0.018, 0.041, 0.07].forEach((o, k) => {
    let hp = 0;
    add(FX, at + o, 0.09, t => {
      const n = rnd(); hp += lpA(1800) * (n - hp);
      const v = (n - hp) * Math.exp(-t * (90 - k * 15)) * gain * (k ? 0.7 : 1.2);
      const click = Math.sin(TAU * (900 - k * 120) * t) * Math.exp(-t * 160) * gain * 0.6;
      return [v + click, v * 0.8 + click];
    });
  });
}
function thunder(at, gain = 1) {
  let a = 0, b = 0, hp = 0;
  add(FX, at, 5, t => {
    const n = rnd(); hp += lpA(3000) * (n - hp);
    const snap = (n - hp) * Math.exp(-t * 18) * 0.9;
    a += lpA(180) * (n - a); b += lpA(70) * (a - b);
    const roll = b * 9 * Math.exp(-t * 0.8) * (0.7 + 0.3 * Math.sin(t * 9 + Math.sin(t * 3) * 2)) * ss(0, 0.08, t);
    return [(snap + roll) * gain, (snap * 0.8 + roll * 1.1) * gain];
  });
}
function riser(t0, t1, gain = 0.35) {
  let a = 0, ph = 0; const len = t1 - t0;
  add(FX, t0, len, t => {
    const p = t / len; a += lpA(500 + 6000 * p) * (rnd() - a); ph += TAU * (150 + 650 * p * p) / SR;
    const v = (a * 0.7 + Math.sin(ph) * 0.25) * p * p * gain; return [v, v];
  });
}
function bell(at, f = 220, gain = 0.25) {
  const parts = [[1, 1], [2.01, 0.5], [2.76, 0.35], [5.4, 0.15], [8.9, 0.07]];
  add(FX, at, 6, t => { let v = 0; for (const [m, a] of parts) v += Math.sin(TAU * f * m * t) * a * Math.exp(-t * (0.6 + m * 0.35)); v *= gain * ss(0, 0.003, t); return [v, v * 0.9]; });
}

C.booms.forEach((t, i) => boom(t, i === 0 ? 0.9 : 1));
C.whooshes.forEach(t => whoosh(t));
crack(C.snap, 1.1);
C.lightning.forEach((t, i) => thunder(t, i === 1 ? 1.1 : 0.85));
riser(C.riser[0], C.riser[1]);
bell(C.ignite, 440, 0.12); bell(C.outerOn, 110, 0.2);
C.inner.forEach((t, i) => bell(t, [523.25, 659.25, 783.99][i], 0.07));
C.outer.forEach(t => thump(t, 0.5));
bell(C.logo, 220, 0.3);
C.beats.forEach(([t, p]) => { thump(t, 0.55 + 0.35 * p); thump(t + 0.2, 0.35 + 0.25 * p); });

// ---------- Yankı (Schroeder) yalnızca efektlere ----------
function reverb(inp, mix, combsMs, seedOff) {
  const out = new Float32Array(N);
  combsMs.forEach((ms, k) => {
    const d = Math.floor((ms + seedOff) * SR / 1000), buf = new Float32Array(d); let p = 0, lp = 0; const fb = 0.8;
    for (let i = 0; i < N; i++) { const y = buf[p]; lp += 0.3 * (y - lp); buf[p] = inp[i] + lp * fb; p = (p + 1) % d; out[i] += y / combsMs.length; }
  });
  [5.0, 1.7].forEach(ms => {
    const d = Math.floor(ms * SR / 1000), buf = new Float32Array(d); let p = 0; const g = 0.7;
    for (let i = 0; i < N; i++) { const b = buf[p], y = -g * out[i] + b; buf[p] = out[i] + g * y; p = (p + 1) % d; out[i] = y; }
  });
  for (let i = 0; i < N; i++) inp[i] += out[i] * mix;
}
reverb(FL, 0.55, [29.7, 37.1, 41.1, 43.7], 0); reverb(FR, 0.55, [29.7, 37.1, 41.1, 43.7], 1.3);

// ---------- Karışım, giriş/çıkış, yumuşak sınırlama, WAV ----------
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = ss(0, 0.05, t) * (1 - ss(TL.duration - 1.8, TL.duration, t));
  const l = Math.tanh((L[i] * 0.9 + FL[i] * 0.8) * fade * 1.1), r = Math.tanh((R[i] * 0.9 + FR[i] * 0.8) * fade * 1.1);
  buf.writeInt16LE(Math.round(l * 32000), 44 + i * 4); buf.writeInt16LE(Math.round(r * 32000), 46 + i * 4);
}
fs.writeFileSync(path.join(dir, 'soundtrack.wav'), buf);
console.log(`Hazır: soundtrack.wav (${TL.duration.toFixed(1)} sn)`);
