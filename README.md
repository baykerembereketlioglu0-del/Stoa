# STOA

Stoacı felsefe üzerine karanlık, anlatımlı, **9:16** kısa animasyon serisi (Reels / Shorts / TikTok).

- **Çizimler:** tamamen JavaScript canvas ile, kodla çizilir. Hazır görsel kullanılmaz.
- **Animasyon kaydı:** Playwright, sayfayı kare kare (30 fps, 1080×1920) kaydeder.
- **Anlatım:** ElevenLabs TTS ile seslendirilir. Altyazılar kelime kelime bu sese kilitlenir.
- **Müzik ve efektler:** `tools/soundtrack.js` ile sentezlenir (drone, boom, whoosh, kalp atışı, gök gürültüsü). Hepsi aynı olay zamanlarına (`cues`) bağlıdır.

## Bölümler

| No | Bölüm | Filozof | Video |
|----|-------|---------|-------|
| 01 | Elinde Olan | Epiktetos | `videolar/01-elinde-olan.mp4` |

## Klasör yapısı

```
bolumler/01-elinde-olan/
  script.js     → replikler, sahneler, ses/görüntü olay zamanları (cues)
  index.html    → tüm çizimler ve animasyon (tarayıcıda açınca önizleme)
  timeline.js   → kelime kelime zamanlama (voices.js üretir)
  audio/        → ElevenLabs mp3 önbelleği (tekrar kredi harcamamak için)
tools/
  voices.js     → anlatımı seslendirir   → narration.wav + timeline.js
  soundtrack.js → müzik + efekt sentezler → soundtrack.wav
  record.js     → Playwright ile kaydeder, sesi miksler → videolar/*.mp4
assets/fonts/   → Cinzel, Cormorant Garamond, Inter (SIL OFL)
```

## Video üretme

Gerekenler: Node.js 18+, ffmpeg

```bash
npm i && npx playwright install chromium
ELEVENLABS_API_KEY=anahtarın node tools/voices.js bolumler/01-elinde-olan
node tools/soundtrack.js bolumler/01-elinde-olan
node tools/record.js bolumler/01-elinde-olan
```

- Anlatıcı sesini değiştirmek için: `VOICE_NARRATOR=<voice_id>`.
- Kısa bir parçayı hızlıca denemek için: `node tools/record.js bolumler/01-elinde-olan --from 20 --to 26 --out deneme.mp4`.
- API anahtarını dosyalara yazma. Yalnızca ortam değişkeniyle ver.

## Yeni bölüm eklemek

1. `bolumler/01-elinde-olan` klasörünü kopyala (örn. `02-...`).
2. `script.js` içinde `LINES` (replikler + sahne adları) ve `cues()` olaylarını güncelle.
3. `index.html` içinde sahne çizim fonksiyonlarını (`SCN`) yeni hikâyeye göre düzenle.
4. Yukarıdaki üç komutu çalıştır.
