// BÖLÜM 02 — Denize bırakılan emanet. Kıssa + ayet, 9:16 Shorts.
// Kaynak hadis: Buhârî, Kefâlet 1 (ayrıca Büyû 10, Lukata 3). Peygamberimiz (s.a.v.) İsrailoğullarından bir adamı anlatır:
//   Bin dinar borç ister; alacaklı şahit ister — "Şahit olarak Allah yeter"; kefil ister — "Kefil olarak Allah yeter"; razı olur,
//   belli bir süreyle verir. Adam denize açılır, işini görür; vakit gelince dönmek için gemi arar, bulamaz. Bir tahta alıp oyar,
//   bin dinarı ve bir mektubu içine koyar, ağzını kapatır. Denize gelip dua eder ("…Ben bunu sana emanet ediyorum") ve atar.
//   Alacaklı, parası gelir mi diye çıkar, gemi yoktur; tahtayı bulur, ailesine odun olsun diye alır; kırınca parayı ve mektubu
//   bulur. Sonra borçlu bin dinarla gelir; alacaklı: "Allah, tahtanın içinde gönderdiğini bana ulaştırdı."
// Ayet: Talâk 65/3 bölümü (Diyanet meali: "Allah'a güvenen kimseye O yeter.") — data/ayah_65_3.json.
(function (root) {
  const EPISODE = { no: '02', title: 'Denize bırakılan emanet' };
  const LINES = [
    { id: 'hook',  who: 'anlatici', scene: 'hook',  text: 'Bin altını bir tahtanın içine koyup denize bıraktı. Ve o altınlar, sahibine ulaştı.', pause: 0.5 },
    { id: 'borc',  who: 'anlatici', scene: 'pazar', text: 'İsrailoğullarından bir adam, birinden bin altın borç istemiş.', pause: 0.3 },
    { id: 'sahit', who: 'anlatici', scene: 'pazar', text: 'Alacaklı demiş ki: Şahit getir. Adam cevap vermiş: Şahit olarak Allah yeter.', pause: 0.3 },
    { id: 'kefil', who: 'anlatici', scene: 'pazar', text: 'Kefil getir, demiş. Kefil olarak da Allah yeter. Alacaklı razı olmuş ve borcu vermiş.', pause: 0.4 },
    { id: 'deniz', who: 'anlatici', scene: 'deniz', text: 'Adam denize açılmış. Borcun vakti gelince dönmek için gemi aramış, ama bulamamış.', pause: 0.4 },
    { id: 'tahta', who: 'anlatici', scene: 'tahta', text: 'Bir tahta almış, içini oymuş. Bin altını ve bir mektubu içine koyup ağzını kapatmış.', pause: 0.4 },
    { id: 'dua',   who: 'anlatici', scene: 'dua',   text: "Denizin kıyısında dua etmiş: Allah'ım, kefil olarak seni gösterdim. Bunu sana emanet ediyorum. Ve tahtayı denize bırakmış.", pause: 0.6 },
    { id: 'sahil', who: 'anlatici', scene: 'sahil', text: 'O gün alacaklı, parası gelir mi diye sahile çıkmış. Gemi yokmuş. Ama dalgalar bir tahta getirmiş.', pause: 0.4 },
    { id: 'ev',    who: 'anlatici', scene: 'ev',    text: 'Ailesine odun olsun diye tahtayı eve götürmüş. Kırınca içinden bin altın ve bir mektup çıkmış.', pause: 0.5 },
    { id: 'donus', who: 'anlatici', scene: 'donus', text: 'Sonra borçlu da bin altınla gelmiş. Alacaklı demiş ki: Allah, tahtanın içinde gönderdiğini bana ulaştırdı.', pause: 0.6 },
    { id: 'ayet',  who: 'anlatici', scene: 'ayet',  text: "Rabbimiz buyuruyor: Allah'a güvenen kimseye, O yeter.", pause: 1.6 },
    { id: 'son',   who: 'anlatici', scene: 'son',   text: 'Sen en son ne zaman, bir işini tamamen Allah\'a bıraktın?', pause: 0 },
  ];
  const LEAD = 0.4, GAP = 0.3, TAIL = 2.4, SCENES = ['hook', 'pazar', 'deniz', 'tahta', 'dua', 'sahil', 'ev', 'donus', 'ayet', 'son'];
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
      scenes: sc, ID, S0, E0,
      ulasti: W('hook', 'sahibine'),
      borcIste: W('borc', 'borç'),
      sahitGetir: W('sahit', 'şahit', 0), sahitAllah: W('sahit', 'allah'),
      kefilGetir: W('kefil', 'kefil', 0), kefilAllah: W('kefil', 'allah'), razi: W('kefil', 'razı'), verdi: W('kefil', 'borcu'),
      acildi: W('deniz', 'denize'), vakit: W('deniz', 'vakti'), aramis: W('deniz', 'gemi'), bulamamis: W('deniz', 'bulamamış'),
      oymus: W('tahta', 'içini'), altin: W('tahta', 'bin'), mektup: W('tahta', 'mektubu'), kapatmis: W('tahta', 'ağzını'),
      duaEt: W('dua', 'dua'), allahim: W('dua', 'allahım'), emanet: W('dua', 'emanet'), birakmis: W('dua', 'bırakmış'),
      sahile: W('sahil', 'sahile'), gemiYok: W('sahil', 'gemi'), dalgalar: W('sahil', 'dalgalar'),
      eve: W('ev', 'eve'), kirinca: W('ev', 'kırınca'), cikmis: W('ev', 'çıkmış'),
      geldi: W('donus', 'gelmiş'), ulastirdi: W('donus', 'ulaştırdı'),
      yeter: W('ayet', 'yeter'),
      biraktin: W('son', 'bıraktın'),
    };
    const fx = [], add = (type, t, g = 1) => fx.push({ type, t, g });
    SCENES.slice(1).forEach(n => add('whoosh', sc[n].start + 0.25, 0.22));
    add('quill', c.oymus, 0.5); add('hit', c.kapatmis + 0.3, 0.25); add('hit', c.kirinca + 0.1, 0.35);
    add('bell', c.ulastirdi + 0.4, 0.16); add('bell', c.yeter, 0.14);
    c.fx = fx.sort((a, b) => a.t - b.t);
    c.moods = []; // müzik yok
    c.ambience = [{ start: 0, end: sc.pazar.start, type: 'sea', g: 0.25 }, { start: sc.deniz.start, end: sc.tahta.start, type: 'sea', g: 0.25 }, { start: sc.dua.start, end: sc.ev.start, type: 'sea', g: 0.3 }, { start: sc.ayet.start, end: TL.duration, type: 'wind', g: 0.08 }];
    return c;
  }
  const api = { EPISODE, LINES, LEAD, GAP, TAIL, SCENES, estimateTimeline, wordTime, cues, ID };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
