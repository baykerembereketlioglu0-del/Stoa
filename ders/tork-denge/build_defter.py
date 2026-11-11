#!/usr/bin/env python3
"""Ders sayfasından (index.html) etkileşimli defteri (defter.html) üretir.

Konu metinleri, deneyler ve soru motoru index.html'den alınır; defterin kabuğu
defter.src.html'dedir. İçerik index.html'de değişince bu betiği yeniden çalıştır.
"""
import json, re, pathlib

HERE = pathlib.Path(__file__).parent
src = (HERE / 'index.html').read_text()
tpl = (HERE / 'defter.src.html').read_text()


def between(a, b):
    i = src.index(a)
    j = src.index(b, i)
    return src[i:j]


def sec(cid):
    return re.search(rf'<section class="ch" id="{cid}">\s*(.*?)\s*</section>', src, re.S).group(1)


def fig(lid):
    return re.search(rf'<figure class="lab" id="{lid}">.*?</figure>', src, re.S).group(0)


def split(cid, lid):
    inner, f = sec(cid), fig(lid)
    a, b = inner.split(f)
    return a.strip(), f, b.strip()


def run(no, title):
    return f'<div class="runhead">{no} · {title}</div>'


NOTES = '<div class="notes">Not alanı</div>'
pages = []


def add(pid, title, html, bg='grid'):
    pages.append({'id': pid, 'title': title, 'html': html, 'bg': bg})


cover = '''<div class="cover">
<div class="eyebrow">AYT Fizik · Etkileşimli ders defteri</div>
<h1>Tork, Denge <span>&amp;</span> Ağırlık Merkezi</h1>
<p class="lead">PDF'in tamamı, beş canlı deney ve 16 soru tek defterde. Üstteki araçlarla her sayfanın üzerine yaz, çiz, işaretle; <b>Etkileşim</b> moduna geçip deneyleri ve soruları sınıfa göster.</p>
<div class="legend"><span><i style="background:var(--accent)"></i>Uygulanan kuvvet F</span><span><i style="background:var(--blue)"></i>İp gerilmesi T</span><span><i style="background:var(--green)"></i>Tepki N, kuvvet kolu</span><span><i style="background:var(--red)"></i>Ağırlık G</span></div>
<h3>Araçlar</h3>
<div class="howto">
<div><kbd>V</kbd>Etkileşim: kaydırıcılar, şıklar, butonlar</div>
<div><kbd>P</kbd>Kalem</div>
<div><kbd>H</kbd>Fosforlu kalem</div>
<div><kbd>E</kbd>Silgi (dokunduğu çizimi siler)</div>
<div><kbd>L</kbd> <kbd>A</kbd>Düz çizgi, ok (Shift: 15° adım)</div>
<div><kbd>R</kbd> <kbd>O</kbd>Dikdörtgen, elips</div>
<div><kbd>T</kbd>El yazısı metin (Enter: bitir)</div>
<div><kbd>K</kbd>Lazer imleç, iz bırakmaz</div>
<div><kbd>Ctrl Z</kbd> <kbd>Ctrl Y</kbd>Geri al, yinele</div>
<div><kbd>+</kbd> <kbd>−</kbd> <kbd>0</kbd>Yakınlaş, uzaklaş, sığdır</div>
<div><kbd>F</kbd>Tam ekran</div>
<div>✋ İki parmakla sayfayı kaydır</div>
</div>
<p style="font-size:15px;color:var(--muted)">Çizimler bu cihazda otomatik kaydedilir. Soldaki listeden boş sayfa (kareli, çizgili, noktalı, düz) ekleyebilir ya da başka bir PDF'i içe aktarıp onun üzerine de yazabilirsin.</p>
<h3>İçindekiler</h3>
<ul class="toc2">
<li><a data-goto="L-tork"><span>1</span>Tork nedir?</a></li>
<li><a data-goto="L-lab1"><span>·</span>Deney: kuvvet kolu</a></li>
<li><a data-goto="L-bileske"><span>2</span>Bileşke tork</a></li>
<li><a data-goto="L-denge1"><span>3</span>Denge şartları</a></li>
<li><a data-goto="L-lab2"><span>·</span>Deney: tahterevalli</a></li>
<li><a data-goto="L-km1"><span>4</span>Kütle merkezi</a></li>
<li><a data-goto="L-lab3"><span>·</span>Deney: KM'yi bul</a></li>
<li><a data-goto="L-kesme"><span>5</span>Kesme ve ekleme</a></li>
<li><a data-goto="L-tur"><span>6</span>Denge türleri</a></li>
<li><a data-goto="L-lab4"><span>·</span>Deney: devrilme</a></li>
<li><a data-goto="L-strateji"><span>7</span>Çözüm stratejisi</a></li>
<li><a data-goto="L-q1"><span>8</span>16 soru</a></li>
<li><a data-goto="L-anahtar"><span>9</span>Cevap anahtarı</a></li>
</ul>
</div>'''
add('L-cover', 'Kapak ve kullanım', cover, 'plain')

a, f1, b = split('ch-tork', 'lab1')
add('L-tork', '1 · Tork nedir?', a)
add('L-lab1', 'Deney 1 · Kuvvet kolu', run('01', 'Tork') + f1 + b + NOTES)
add('L-bileske', '2 · Bileşke tork, kuvvet çifti', sec('ch-bileske') + NOTES)
a, f2, b = split('ch-denge', 'lab2')
add('L-denge1', '3 · Denge şartları', a)
add('L-lab2', 'Deney 2 · Tahterevalli', run('03', 'Denge şartları') + f2 + NOTES)
add('L-denge2', '3 · Denge: 5 adım, Lami', run('03', 'Denge şartları') + b)
a, f3, b = split('ch-km', 'lab3')
add('L-km1', '4 · Kütle ve ağırlık merkezi', a)
add('L-lab3', 'Deney 3 · KM\'yi bul', run('04', 'Kütle merkezi') + f3 + b + NOTES)
add('L-kesme', '5 · Kesme, ekleme, katlama', sec('ch-kesme'))
a, f4, b = split('ch-tur', 'lab4')
add('L-tur', '6 · Denge türleri, devrilme', a + b + NOTES)
add('L-lab4', 'Deney 5 · Devrilme', run('06', 'Devrilme') + f4 + NOTES)
add('L-strateji', '7 · Çözüm stratejisi', sec('ch-strateji') + NOTES)
for i in range(16):
    add(f'L-q{i+1}', f'Soru {i+1}', f'@@Q{i}@@')
add('L-anahtar', '9 · Cevap anahtarı, formül kartı', sec('ch-anahtar') + NOTES)

lesson_js = json.dumps(pages, ensure_ascii=False)
# question pages are rendered by qHTML(i) at runtime
lesson_js = re.sub(r'"@@Q(\d+)@@"', r'qHTML(\1)', lesson_js)

kit = between('const $ = s => document.querySelector(s);', '/* ---------- questions ---------- */')
q = between('const D2R = Math.PI / 180;', "const L = 'ABCDE';")
labs = between('/* ---------- labs ---------- */', '/* ---------- kalem / silgi katmanı')

out = (tpl.replace('/*@@KIT@@*/', kit)
          .replace('/*@@Q@@*/', q)
          .replace('/*@@LESSON@@*/', lesson_js)
          .replace('/*@@LABS@@*/', labs))
(HERE / 'defter.html').write_text(out)
print('defter.html', len(out), 'bytes,', len(pages), 'ders sayfası')
