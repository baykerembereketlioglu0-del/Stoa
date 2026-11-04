// STOA · Bölüm 01 · "Elinde Olan" (Epiktetos)
// Bu dosya hem tarayıcıda (index.html) hem Node'da (tools/*.js) kullanılır.
//   scene : hangi sahnede okunacağı
//   pause : bu replikten sonra bırakılacak ek sessizlik (sn)
//   emph  : altyazıda vurgulanacak kelimelerin başları (küçük harf)
(function (root) {
  const EPISODE = {
    no: '01',
    slug: '01-elinde-olan',
    title: 'ELİNDE OLAN',
    philosopher: 'EPİKTETOS',
    // ElevenLabs anlatıcı sesi (voice_id). VOICE_NARRATOR ortam değişkeniyle değiştirilebilir.
    voice: 'nPczCjzI2devNBz1zQrb',
  };

  const LINES = [
    { scene: 'hook',   text: 'Seni yıkan şey, başına gelenler değil.', emph: ['yıkan', 'değil'], pause: 0.15 },
    { scene: 'hook',   text: 'Onlar hakkında ne düşündüğün.', emph: ['düşündüğün'], pause: 0.7 },

    { scene: 'rome',   text: 'İki bin yıl önce, Roma’da bir köle yaşardı.', emph: ['köle'] },
    { scene: 'rome',   text: 'Adı Epiktetos’tu.', emph: ['epiktetos'], pause: 0.4 },
    { scene: 'rome',   text: 'Anlatılır ki bir gün efendisi, sırf zevk için onun bacağını bükmeye başladı.', emph: ['zevk', 'bükmeye'] },
    { scene: 'rome',   text: 'Epiktetos sakince, “Kıracaksın,” dedi.', emph: ['kıracaksın'], pause: 0.35 },
    { scene: 'rome',   text: 'Ve bacak kırıldı.', emph: ['kırıldı'], pause: 1.0 },
    { scene: 'rome',   text: 'Epiktetos yine sakindi: “Söylemiştim. Kıracaksın.”', emph: ['sakindi'], pause: 0.6 },

    { scene: 'circle', text: 'Çünkü o, hayatın en eski sırrını biliyordu.', emph: ['sırrını'], pause: 0.3 },
    { scene: 'circle', text: 'Bazı şeyler senin elinde. Bazıları değil.', emph: ['elinde', 'değil'], pause: 0.3 },
    { scene: 'circle', text: 'Başkalarının sözleri, geçmiş, fırtınalar… senin elinde değil.', emph: ['değil'] },
    { scene: 'circle', text: 'Ama yargıların, seçimlerin ve tepkin… yalnızca sana ait.', emph: ['yalnızca', 'sana'], pause: 0.5 },

    { scene: 'storm',  text: 'Fırtınayı durduramazsın.', emph: ['fırtınayı'], pause: 0.3 },
    { scene: 'storm',  text: 'Ama dümeni bırakmak zorunda değilsin.', emph: ['dümeni'], pause: 0.8 },

    { scene: 'quote',  text: 'İnsanları üzen olaylar değil, olaylar hakkındaki yargılarıdır.', pause: 1.0 },

    { scene: 'outro',  text: 'Bugün seni üzen şey… gerçekten senin elinde mi?', pause: 0.9 },
    { scene: 'outro',  text: 'Stoa. Her gün bir ders.', pause: 0 },
  ];

  const LEAD = 0.35, GAP = 0.28, TAIL = 2.6;
  const SCENES = ['hook', 'rome', 'circle', 'storm', 'quote', 'outro'];

  // Ses yokken (timeline.js üretilmemişse) kelime uzunluğundan tahmini zamanlama.
  function estimateTimeline() {
    let t = LEAD; const lines = [];
    for (const l of LINES) {
      const s = t, words = [];
      for (const w of l.text.split(/\s+/)) {
        const d = 0.17 + w.replace(/[^\p{L}]/gu, '').length * 0.055 + (/[.,?!…:]["”]?$/.test(w) ? 0.22 : 0);
        words.push([w, t, t + d]); t += d;
      }
      lines.push({ scene: l.scene, start: s, end: t, words });
      t += GAP + (l.pause || 0);
    }
    return { duration: t + TAIL, lines };
  }

  const low = s => s.toLocaleLowerCase('tr').replace(/[^\p{L}]/gu, '');

  // Bir replikte, verilen önekle başlayan kelimenin [başlangıç, bitiş] zamanı.
  function wordTime(TL, li, prefix, nth = 0) {
    const l = TL.lines[li]; let n = 0;
    for (const w of l.words) if (low(w[0]).startsWith(prefix) && n++ === nth) return [w[1], w[2]];
    return [l.start, l.end];
  }

  // Sahnelerin başlangıç/bitişi ve ses-görüntü ortak olay zamanları.
  function cues(TL) {
    const L = TL.lines, sc = {};
    SCENES.forEach((name, i) => {
      const first = L.findIndex(l => l.scene === name);
      sc[name] = { start: i === 0 ? 0 : L[first].start - 0.25, first };
    });
    SCENES.forEach((name, i) => { sc[name].end = i < SCENES.length - 1 ? sc[SCENES[i + 1]].start : TL.duration; });
    const snap = wordTime(TL, 6, 'kırıldı')[0];
    const strike1 = sc.storm.start + 0.35, strike2 = wordTime(TL, 12, 'durduramazsın')[0] + 0.1;
    const beats = []; // kalp atışları: gittikçe hızlanır
    for (let t = L[4].start; t < snap - 0.2;) { const p = (t - L[4].start) / (snap - L[4].start); beats.push([t, p]); t += 1.0 - 0.45 * p; }
    return {
      scenes: sc, beats,
      snap,                                            // bacak kırılma anı
      hookHit: wordTime(TL, 1, 'düşündüğün')[0],        // kancanın vuruşu
      lightning: [strike1, strike2, wordTime(TL, 13, 'zorunda')[0]],
      heartbeat: [L[4].start, snap],                   // gerilim kalp atışı
      riser: [sc.quote.start - 1.4, sc.quote.start],
      outer: ['sözleri', 'geçmiş', 'fırtınalar'].map(p => wordTime(TL, 10, p)[0]),
      inner: ['yargıların', 'seçimlerin', 'tepkin'].map(p => wordTime(TL, 11, p)[0]),
      ignite: wordTime(TL, 9, 'elinde')[0],
      outerOn: wordTime(TL, 9, 'bazıları')[0],
      logo: L[16].start,
      booms: [0.02, wordTime(TL, 1, 'düşündüğün')[0], sc.rome.start, snap, sc.circle.start, sc.storm.start, sc.quote.start, L[16].start],
      whooshes: [sc.rome.start, sc.circle.start, sc.storm.start, sc.quote.start, sc.outro.start],
    };
  }

  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, estimateTimeline, wordTime, cues };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
