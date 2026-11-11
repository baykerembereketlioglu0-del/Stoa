// BÖLÜM 01 — Kur'an hakkında çoğu kişinin bilmediği 5 bilgi. 9:16 Shorts.
// Doğrulama (data/ klasöründeki tam metinden sayıldı, api.alquran.cloud quran-uthmani + tr.diyanet):
//  · İlk inen ayetler: Alak 96:1-5, Hira mağarası (Buhârî, Bed'ü'l-vahy 3).
//  · Kur'an'da adı geçen tek kadın Meryem; ismi 34 kez geçer; 19. sure "Meryem".
//  · En az ayetli sureler 3 ayetle Asr, Kevser, Nasr; harf sayısı en az olan Kevser (en kısa sure).
//  · En uzun ayet Bakara 2:282 (harf sayısıyla açık ara birinci), konusu borcun yazılması.
//  · Besmele ile başlamayan tek sure Tevbe (9); Neml 27:30'da sure içinde Besmele geçer; toplam 114.
(function (root) {
  const EPISODE = { no: '01', title: "Kur'an hakkında 5 bilgi" };
  const LINES = [
    { id: 'hook',  who: 'anlatici', scene: 'hook',    text: "Kur'an-ı Kerim hakkında çoğu kişinin bilmediği beş bilgi. Sonuncusu seni gerçekten şaşırtacak.", pause: 0.3 },
    { id: 'f1a',   who: 'anlatici', scene: 'oku',     text: 'Bir. Peygamber Efendimize inen ilk ayetler, Hira mağarasında geldi.', pause: 0.15 },
    { id: 'f1b',   who: 'anlatici', scene: 'oku',     text: 'Ve ilk emir şuydu: Oku!', pause: 2.2 },
    { id: 'f2',    who: 'anlatici', scene: 'meryem',  text: "İki. Kur'an'da adı geçen tek kadın, Hazreti Meryem'dir. Adı tam otuz dört kez geçer ve bir sureye adını verir.", pause: 0.35 },
    { id: 'f3',    who: 'anlatici', scene: 'kevser',  text: 'Üç. En kısa sure, Kevser suresidir. Sadece üç ayet.', pause: 0.35 },
    { id: 'f4a',   who: 'anlatici', scene: 'borc',    text: "Dört. Kur'an'ın en uzun ayeti, Bakara suresinin iki yüz seksen ikinci ayetidir.", pause: 0.15 },
    { id: 'f4b',   who: 'anlatici', scene: 'borc',    text: 'Konusu ne biliyor musun? Borcu, adaletle yazıya geçirmek.', pause: 0.4 },
    { id: 'f5a',   who: 'anlatici', scene: 'besmele', text: 'Beş. Tevbe suresi, Besmele ile başlamayan tek suredir.', pause: 0.15 },
    { id: 'f5b',   who: 'anlatici', scene: 'besmele', text: "Ama Neml suresinde Besmele iki kez geçer. Böylece Kur'an'daki Besmele sayısı, sure sayısına eşit olur: tam yüz on dört.", pause: 0.45 },
    { id: 'cta',   who: 'anlatici', scene: 'cta',     text: 'Sen bunların kaçını biliyordun? Yorumlara yaz, ve bu bilgiyi sevdiğin birine gönder.', pause: 0 },
  ];
  const LEAD = 0.5, GAP = 0.28, TAIL = 2.2, SCENES = ['hook', 'oku', 'meryem', 'kevser', 'borc', 'besmele', 'cta'];
  function estimateTimeline() { let t = LEAD; const lines = []; for (const l of LINES) { const s = t, words = []; for (const w of l.text.split(/\s+/)) { const d = 0.16 + w.replace(/[^\p{L}\d]/gu, '').length * 0.055 + (/[.,?!:]$/.test(w) ? 0.2 : 0); words.push([w, t, t + d]); t += d; } lines.push({ who: l.who, scene: l.scene, start: s, end: t, words }); t += GAP + (l.pause || 0); } return { duration: t + TAIL, lines }; }
  const ID = {}; LINES.forEach((l, i) => ID[l.id] = i);
  const low = s => s.toLocaleLowerCase('tr').replace(/[^\p{L}\d]/gu, '');
  function wordTime(TL, id, prefix, nth = 0) { const l = TL.lines[ID[id]]; let n = 0; for (const w of l.words) if (low(w[0]).startsWith(prefix) && n++ === nth) return w[1]; return l.start; }
  function cues(TL) {
    const L = TL.lines, sc = {};
    SCENES.forEach((n, i) => { const first = LINES.findIndex(l => l.scene === n); sc[n] = { start: i === 0 ? 0 : L[first].start - 0.25, first }; });
    SCENES.forEach((n, i) => sc[n].end = i < SCENES.length - 1 ? sc[SCENES[i + 1]].start : TL.duration);
    const W = (id, p, n) => wordTime(TL, id, p, n), S0 = id => L[ID[id]].start, E0 = id => L[ID[id]].end;
    const c = {
      scenes: sc, ID,
      bes: W('hook', 'beş'), sonuncusu: W('hook', 'sonuncusu'),
      hira: W('f1a', 'hira'), ilkEmir: W('f1b', 'emir'), oku: W('f1b', 'oku'),
      tekKadin: W('f2', 'tek'), meryem: W('f2', 'meryem'), otuz: W('f2', 'otuz'), sureye: W('f2', 'sureye'),
      enKisa: W('f3', 'kısa'), kevser: W('f3', 'kevser'), ucAyet: W('f3', 'üç', 1),
      enUzun: W('f4a', 'uzun'), bakara: W('f4a', 'bakara'), konusu: W('f4b', 'konusu'), borcu: W('f4b', 'borcu'), yazi: W('f4b', 'yazıya'),
      tevbe: W('f5a', 'tevbe'), baslamayan: W('f5a', 'başlamayan'), neml: W('f5b', 'neml'), ikiKez: W('f5b', 'iki'), esit: W('f5b', 'eşit'), yuzOnDort: W('f5b', 'yüz'),
      kacini: W('cta', 'kaçını'), yorum: W('cta', 'yorumlara'), gonder: W('cta', 'gönder'),
    };
    const fx = [], add = (type, t, g = 1) => fx.push({ type, t, g });
    SCENES.slice(1).forEach(n => add('whoosh', sc[n].start + 0.25, 0.35));
    add('riser', c.oku - 1.6, 0.25); add('hit', c.oku, 0.45);
    add('quill', c.yazi - 0.2, 0.9);
    add('hit', c.yuzOnDort, 0.4);
    c.fx = fx.sort((a, b) => a.t - b.t);
    c.moods = []; // müzik yok: yalnızca ortam sesi ve geçiş efektleri
    c.ambience = [{ start: 0, end: TL.duration, type: 'wind', g: 0.16 }];
    return c;
  }
  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, estimateTimeline, wordTime, cues, ID };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
