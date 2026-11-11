// Soru: ağırlıksız makara F = 60 N ile yukarı çekiliyor; ipin uçlarında yerde duran X (4 kg) ve Y (2 kg). a_X ve a_Y? (g = 10 m/s²)
// Çözüm: F = 2T → T = 30 N. X: 30 < 40 → yerde kalır, a_X = 0 (N = 10 N). Y: 30 − 20 = 10 N → a_Y = 5 m/s² yukarı. Makara: 2,5 m/s².
(function (root) {
  const LINES = [
    { id: 'kurulum', who: 'hoca', text: 'Bu soruda ağırlıksız bir makara, yukarı doğru altmış newtonluk bir kuvvetle çekiliyor.' },
    { id: 'cisimler', who: 'hoca', text: 'İpin bir ucunda dört kilogramlık X, diğer ucunda iki kilogramlık Y cismi var. İkisi de başlangıçta yerde duruyor.', pause: 0.3 },
    { id: 'makara', who: 'hoca', text: 'Makara ağırlıksız olduğu için ona etki eden net kuvvet sıfır olmalı. Yukarı çeken F, ipin iki kolundaki gerilmelerin toplamına eşit: F eşittir iki T.' },
    { id: 'gerilme', who: 'hoca', text: 'Buradan T, altmışın yarısı, yani otuz newton bulunur.', pause: 0.4 },
    { id: 'g', who: 'hoca', text: 'Şimdi cisimlere tek tek bakalım. Yer çekimi ivmesini on alıyoruz.' },
    { id: 'xkuvvet', who: 'hoca', text: 'X cisminin ağırlığı kırk newton. İp onu yalnızca otuz newtonla yukarı çekiyor. Otuz, kırktan küçük; bu yüzden X yerden kalkamaz.' },
    { id: 'xsonuc', who: 'hoca', text: 'X yerde kalır, zemin ona on newtonluk bir tepki kuvveti uygular. Yani X cisminin ivmesi sıfırdır.', pause: 0.4 },
    { id: 'ykuvvet', who: 'hoca', text: 'Y cisminin ağırlığı ise yirmi newton. İp onu otuz newtonla yukarı çekiyor.' },
    { id: 'ysonuc', who: 'hoca', text: 'Net kuvvet on newton ve yukarı doğru. Kütlesi iki kilogram olduğuna göre, ivmesi on bölü iki, beş metre bölü saniye kare.', pause: 0.4 },
    { id: 'ozet', who: 'hoca', text: 'Sonuç: X hiç kıpırdamaz, Y ise yukarı doğru beş metre bölü saniye kare ivmeyle hızlanır.', pause: 0.3 },
    { id: 'ipucu', who: 'hoca', text: 'Küçük bir not: makaranın kendisi, bu iki ivmenin ortalamasıyla, yani iki buçuk metre bölü saniye kare ivmeyle yükselir.' },
  ];
  const LEAD = 0.6, GAP = 0.35, TAIL = 2.5;
  const ID = {}; LINES.forEach((l, i) => ID[l.id] = i);
  function estimateTimeline() { let t = LEAD; const lines = []; for (const l of LINES) { const s = t, words = []; for (const w of l.text.split(/\s+/)) { const d = 0.18 + w.length * 0.05; words.push([w, t, t + d]); t += d; } lines.push({ who: l.who, start: s, end: t, words }); t += GAP + (l.pause || 0); } return { duration: t + TAIL, lines }; }
  const api = { LINES, LEAD, GAP, TAIL, ID, estimateTimeline, SCENES: [] };
  if (typeof module !== 'undefined') module.exports = api; else root.EP = api;
})(this);
