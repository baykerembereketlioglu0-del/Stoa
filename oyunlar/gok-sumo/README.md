# Gök Sumo

İki kişilik 3D mobil arena oyunu. Bulutların üstündeki altıgen mermer platformda rakibini aşağı it; karolar zamanla düşer. İlk 5 raundu alan kazanır.

- **2 kişi:** aynı telefonda. Yatay tutuşta sol yarı ALTIN, sağ yarı KOBALT; dikey tutuşta alt yarı ALTIN, üst yarı KOBALT.
- **Bota karşı:** üç seviye (kolay, orta, zor).
- **Kontrol:** kendi yarında sürükle = yön, kısa dokunuş ya da ikinci parmak = atıl. Klavye: WASD + Boşluk, ok tuşları + Enter.
- **Güçler:** DEV (büyür, ağırlaşır), ROKET (hızlanır), ŞOK (şok dalgasıyla rakibi iter).

Her şey kodla üretilir: gökyüzü ve bulut shader'ları, mermer ve metal dokuları (canvas), parçacıklar, sesler ve müzik (WebAudio). Görüntü three.js ile çizilir.

```bash
npm i
npm run build     # dist/index.html + dist/game.js
```

`dist/` klasörü herhangi bir statik sunucuda (ör. GitHub Pages) çalışır.
