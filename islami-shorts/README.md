# İslami Bilgi Shorts

Playwright + canvas ile çizilen, ElevenLabs ile seslendirilen 9:16 Türkçe kısa videolar.
Hedef: gençlere, çocuklara ve yetişkinlere İslam'ı doğru bilgiyle, merak uyandırarak anlatmak.

## Doğruluk kuralları
1. Ayetlerin Arapçası ve meali ezberden yazılmaz: `api.alquran.cloud` (quran-uthmani + tr.diyanet) üzerinden çekilir, `data/` klasöründe saklanır.
2. Sayısal iddialar (en uzun ayet, isim sayısı, Besmele sayısı...) tam metin üzerinden sayılarak doğrulanır; doğrulama notu bölümün `script.js` başında yazılır.
3. Hadisler yalnızca sahih kaynaktan, kitap/bab bilgisiyle verilir; kaynak ekranda gösterilir.
4. Peygamberler, sahabe ve melekler çizilmez; sahneler manzara, mimari, mushaf, geometrik desen ve tipografi ile anlatılır.
5. Müzik kullanılmaz; yalnızca hafif ortam sesi ve geçiş efektleri.
6. Tartışmalı (ihtilaflı) konular seçilmez ya da farklı görüşler olduğu açıkça söylenir.

## Ses
Anlatıcı: ElevenLabs **Liam** (`cast.js`) — genç, temiz, kalın olmayan erkek sesi (ortalama perde ~150 Hz), model `eleven_multilingual_v2`.

## Üretim
```
node tools/voices.js ep01-kuran-5-bilgi     # seslendirme + kelime zamanlaması (timeline.js)
node tools/score.js  ep01-kuran-5-bilgi     # ortam sesi + efektler (soundtrack.wav)
node tools/record.js ep01-kuran-5-bilgi     # videolar/ep01-kuran-5-bilgi.mp4
```

## Bölümler
| # | Konu | Durum |
|---|------|-------|
| 01 | Kur'an hakkında çoğu kişinin bilmediği 5 bilgi | hazır |
| 02 | Denize bırakılan emanet (Buhârî, Kefâlet 1 + Talâk 65/3) | çizimler hazır, kullanıcının ses kaydı bekleniyor |

## Sıradaki konu fikirleri (tutma potansiyeli yüksek)
- Peygamberimizin (s.a.v.) günlük hayatından 5 sünnet (kaynaklı hadislerle)
- Gülümsemek bile sadakadır: küçük iyiliklerin büyük sevabı
- Kur'an'da adı geçen 25 peygamber: kaçını sayabilirsin?
- Fatiha suresi kelime kelime ne diyor?
- Ayetel Kürsî neden bu kadar özel?
- Namazın 5 vakti nereden geliyor?
- Çocuklar için: Esmaü'l-Hüsna'dan 5 isim ve anlamı

## Kullanıcının kendi ses kaydıyla
Kaydı `<bölüm>/voice/full.mp3` (veya .m4a/.wav) olarak koy; satırlar arasında ~1 sn sessizlik olsun.
```
node tools/import_voice.js ep02-tahta-emanet   # kaydı satırlara böler, timeline.js + narration.wav üretir
node tools/score.js ep02-tahta-emanet
node tools/record.js ep02-tahta-emanet
```
