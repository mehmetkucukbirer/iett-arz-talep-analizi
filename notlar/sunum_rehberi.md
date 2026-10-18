# SUNUM REHBERİ — İETT Arz-Talep Analizi

> Sunumda yanında açık dur. Bölüm 10'daki soru bankası mentorun sorabileceği her şeyi
> kapsıyor; bir soruya cevap ararken oraya bak. Bölüm 12'deki 12 sayıyı ezberle.

---

## 1. PROJE TEK CÜMLEYLE

**Soru:** Hangi otobüs hattında, hangi saatte, hangi yöne sefer eklenmeli ya da azaltılmalı?

**Cevap (manşet):**
> *"Sorun kaç otobüs olduğu değil — hangi saatte, hangi yöne gittiği."*
> Zirvede (08:00) **120 araçlık açık** var; zirve dışında **2.419 sefer** fazlası var.
> Sistem toplamda yeterli araca sahip, sorun dağılımda.

**Hedef cümle (projenin başından beri hedeflenen çıktı):**
```
76O · hafta içi · 17:00 · Otogar → Cihangir yönü · 131 kişi/sefer · +1 sefer
```

---

## 2. HANGİ ARAÇLARI KULLANDIK

| ne | ne için |
|---|---|
| **Python 3.9** | tüm analiz |
| **pandas** | tabloları okuma, birleştirme, gruplama (projenin %80'i) |
| **numpy** | yuvarlama (`ceil`), sentetik veri için rastgele sayı |
| **matplotlib** | keşif grafikleri |
| **requests** | İETT SOAP API'ye istek atmak |
| **scipy** | Spearman korelasyonu |
| **Jupyter notebook** | ilk keşif (`03_arz_api.ipynb`, 34 hücre) |
| **`.py` betikler** | asıl boru hattı — sıra garantisi, tek komutla tekrar üretim |
| **HTML / CSS / JavaScript** | dashboard (React tabanlı, tek dosya) + telefon sürümü (PWA) |
| **Leaflet** | harita katmanı |
| **OSRM** | rotaları gerçek yola oturtma |
| **curl / awk** | 1,4 GB'lık CSV'yi belleğe almadan tarama |

**Neden notebook'tan betiğe geçtik:** notebook'ta hücreler düzeltme yapıldıkça alta
eklendi, sıra bozuldu, "Run All" yanlış sonuç üretir hâle geldi. `05_boru_hatti.py` tek
komutla 2 dakikada tüm çıktıları baştan üretiyor.

**Kod yapısı (çalıştırma sırası):**
```
09_gercek_sureler.py        → gerçek sefer süreleri (API arşivi)       bir kez
05_boru_hatti.py            → 7 adımlı ana boru hattı, tüm çıktılar    ~2 dk
14_yon_duzeltmesi.py        → yön ayrımlı doluluk + tarife dakikaları  ~5 sn
10 / 12                     → harita koordinatları + rota geometrisi   bir kez
11_canli_kopru.py           → yerel sunucu + canlı araç köprüsü        sürekli
```

---

## 3. ÜÇ VERİ KAYNAĞI — basitçe

```
ARZ    "kaç sefer var?"      İETT SOAP API · PlanlananSeferSaati · 783 hat · 130.435 kalkış
TALEP  "kaç kişi bindi?"     İBB Açık Veri CSV · Ekim 2024 · 262 MB · İstanbulkart binişleri
YÖN    "hangi yöne?"         Mentorun verdiği SAP raporu · 9-15 Ağustos 2026 · 146.259 satır
```

Ayrıca API'den:
- **Gerçekleşen sefer arşivi** (`GetIettArsivGorev_json`) → gerçek sefer süreleri
- **Canlı araç konumu** (`GetHatOtoKonum_json`) → doğrulama + dashboard canlı katmanı
- **Durak listesi** (`DurakDetay_GYY`) → harita + yön kontrolü

**API nasıl çalışıyor (sorarlarsa):** SOAP = XML zarfına sarılmış istek. `requests.post`
ile gönderiyoruz, cevap XML içine gömülü JSON geliyor, `json.loads` ile açıyoruz.
Doküman üç yerde yanlıştı (`tarih`→`Tarih`, `HatNo`→`HatKodu`, tarih formatı);
deneme-yanılmayla bulduk.

---

## 4. HESAP NASIL YAPILIYOR — 9 adım, basit dille

Her şey **hat + gün tipi + saat** hücresinde hesaplanıyor. Örnek: "76O, hafta içi, 17:00".

```
1. KAÇ SEFER?      Tarifeden o saatte kaç kalkış var say.                    (arz)

2. KAÇ KİŞİ?       Kart verisinden o saatte kaç kişi bindi, 5 güne böl.      (talep)

3. BİNİŞ / SEFER   kişi ÷ sefer = sefer başına biniş.

4. BACAK           103 hatta "bir kalkış" aslında gidiş+dönüş.
                   O hatlarda sefer sayısını 2 ile çarp (bacak).

5. DEVİR           Uzun hatta koltuk boşalıp yeniden dolar.
                   8 km üstü hatta biniş ÷ 1,7 = araçtaki anlık yolcu.

6. YÖN             2026 verisinden "yolcuların %kaçı gidiş yönünde" oranını al,
                   kişiyi gidiş/dönüşe böl, her yönü kendi kalkışına böl.

7. KARAR           anlık yolcu > 110  → sefer EKLE
                   anlık yolcu < 20   → sefer AZALT (hedef 40, en az 2 kalkış kalsın)

8. KAÇ SEFER EK?   gereken = yukarı yuvarla( kişi ÷ (110 × devir) ) − mevcut

9. KAÇ ARAÇ?       ek araç = ek sefer × gerçek sefer süresi ÷ 60
```

**Üç sabit:** kapasite **110** (körüklü otobüs) · devir **1,7** (8 km üstü) · boş eşiği **20**, hedef **40**.

---

## 5. UÇTAN UCA BİR ÖRNEK — 76O, hafta içi, 17:00

Bu tabloyu tahtaya çizebilirsin, her adım tek satır:

```
kart verisi       : 5 günde 6.159 biniş → günlük 1.231,8 kişi
tarife            : 6 kalkış (3 gidiş + 3 dönüş)
yön oranı (2026)  : %46 gidiş, %54 dönüş
gidişe düşen      : 1.231,8 × 0,46 = 562 kişi  ÷ 3 kalkış = 187 biniş/sefer
dönüşe düşen      : 1.231,8 × 0,54 = 669 kişi  ÷ 3 kalkış = 223 biniş/sefer
devir (76O 18 km) : 187 ÷ 1,7 = 110 anlık yolcu (gidiş)  ·  223 ÷ 1,7 = 131 (dönüş)
karar             : ikisi de 110'u aşıyor → gidişe +1, dönüşe +1 = 2 sefer
gerçek süre       : 156 dk → 2 sefer × 156 ÷ 60 = 5,2 araç-saat
tarife dakikası   : mevcut kalkışlar arasındaki en büyük boşluğun ortası → +17:20
```

Yönsüz hesap olsaydı: 1.231,8 ÷ 6 = 205 ÷ 1,7 = **121** — tek sayı, iki yönün ortalaması.
Yön ayrımı sorunun asıl olduğu yeri (dönüş, 131) gösteriyor.

---

## 6. NEDEN HAM HESAP YANLIŞTI — bulduğumuz 7 hata

Sunumun en güçlü kısmı bu: her hata bir soruyla başladı, ölçüldü, düzeltildi.

**1. Ekim 2024 dosyası eksik → 23 yerine 5'e böl**
İlk sonuç "34 hattında sefer başına 7.170 kişi" dedi. "1.085 kişi nasıl biner?" sorusu
bizi tarih kapsamına götürdü: dosyada 31 gün değil **5 gerçek gün** var (hepsi hafta içi).
23'e bölmek sonucu 4,6 kat şişiriyordu. Ders: her veri dosyasında ilk kontrol tarih kapsamı.

**2. Metrobüs analiz dışı**
Azaltma listesinin ilk 15 satırı `34G` çıktı: saatte 122 sefer, sefer başına 0,1 kişi.
Sebep: talep verisi tüm Metrobüs binişlerini `34` koduna yazıyor, arz 8 koda bölünmüş.
Payda güvenilmez → 8 kod tamamen dışarıda.

**3. 52 hattın dönüş seferleri arz verisinde yok**
`SYON` sayınca 103 hat "sadece gidiş" göründü. Durak listesiyle karşılaştırdık: 52'si
gerçekten tek yönlü/halka, **52'sinde API dönüşü döndürmüyor**. Sefer sayısı eksik →
doluluk yapay yüksek → dışarıda. "Değerlendirilemeyen hatlar" başlığıyla ayrı listelendi.

**4. `SEFER_SURESI` alanı ölçüm değil, formül**
Hat uzunluğuyla korelasyonu **0,9842** — hatların %63'ü tam 12-13 km/sa. Gerçek olsaydı
ekspres hat hızlı, şehir içi yavaş çıkardı. Gerçek süreleri sefer arşivinden, talep
verisiyle **aynı 5 günden** çektik. Zirvede 81 dk, gecede 49 dk — sabit süre kullanmak
zirvede araç ihtiyacını eksik gösterirdi.

**5. Biniş ≠ araçtaki yolcu → devir katsayısı**
"500T'ye 48 ek araç gerçekçi değil" dedik. Sebep: Tuzla'da binen Kartal'da iniyor, koltuk
aynı seferde birkaç kez doluyor. Devir katsayısı eklendi: 8 km üstü **1,7**. Bağımsız
kontrol: 2012 hanehalkı anketinden **1,98** çıktı. Sonucun işaretini bile değiştiren varsayım
bu — duyarlılık tablosuyla sunulur.

**6. 103 hatta "bir kalkış" = gidiş + dönüş**
98 hattının tarifesi 161 gidiş / 15 dönüş. Bir otobüs dönmeden 161 kez gidemez.
Üç kanıt: (a) ima edilen hız tam yarısı (8,2 vs 17,2 km/sa), (b) aynı araç arşivde arka
arkaya dört kez "G" görevi yapıyor, (c) düzeltince dağılımlar çakışıyor. Mentorun verdiği
`Güzergah Yön` sütunu da doğruladı. Öneri listesi 178 → 96'ya indi.

**7. Kodlama hatası talep tarafına da yansımış**
Yön oranı ilk hesaplandığında 98, 78, 29C tepeye tırmandı — oysa 6. hatada düşmüşlerdi.
Gidiş+dönüş kodlu hatlarda binişler de %94,6 "G" yazılmış: ölçüm değil kodlama izi.
Tarifesi dengesiz hatlarda (azınlık yön < %25) yön düzeltmesi uygulanmıyor.

---

## 7. SONUÇLAR

| | |
|---|---|
| Değerlendirilen hat | **676** (59'u veri yetersizliğinden dışarıda) |
| Sefer **eklenmeli** (yönlü, hafta içi) | **172** hat+saat · **66** hat · **+262 sefer** |
| Zirve açığı | **08:00 → 120 ek araç** (07:00 → 98, 16:00 → 59) |
| Sefer **azaltılabilir** (hafta içi, gerçek veri) | 699 hat+saat · 233 hat · **2.419 sefer** |
| Hafta sonu ekleme (sentetik, ayrı) | 117 hat+saat · 40 hat · +173 sefer |
| En çok ek araç gereken hatlar | 11ÜS (+83) · 500T (+41) · 15F (+31) · 14ES (+25) · 147 (+22) · 76O (+21) |

**Yönsüz hâli (kıyas için):** 96 öneri · 41 hat · +162 sefer · zirve 97 araç.
Yön boyutu ekleyince öneri sayısı arttı çünkü ortalama, dolu yönü boş yönle gizliyordu.
Eski 96'nın 96'sı listede kaldı, 76 yeni eklendi — düzeltme eskiyi çürütmedi, üstüne ekledi.

**Devir katsayısı duyarlılığı (yönsüz):**
```
devir  1,0 → 633 araç   1,5 → 148   1,7 → 97   2,0 → 40   2,3 → 23
```
⭐ Sıralama değişmiyor: 500T, 14ES, 11ÜS her katsayıda en üstte.
*"Hangi hat, hangi saat" sağlam; "kaç araç" ±%50 belirsiz.*

---

## 8. 14 DOĞRULAMA — her biri tek satır

| # | soru | sonuç |
|---|---|---|
| 1 | Talep verisi doğru mu? | API ile Spearman **0,862**, mutlak fark %5 |
| 2 | Hangi kalkışlar sefer? | Hepsi — servis tiplerinin saatlik dağılımı normal sefer deseni |
| 3 | Tarife eksik mi? | Canlı araç sayımıyla tuttu (11ÜS: 9 araç ↔ saatte 3-4 sefer) |
| 4 | Yön ayrımı yapılabilir mi? | Açık veriyle hayır → mentorun verisiyle **evet** |
| 5 | Tek yönlü görünen hatlar gerçek mi? | 52'si gerçek, **52'sinde veri eksik** |
| 6 | Saat atfı kayıyor mu? | Evet, zirvede %8-23 — ölçüldü, bilinçli düzeltilmedi |
| 7 | Metrobüs tam dışlandı mı? | Hayır, 6 kod kalmıştı — düzeltildi |
| 8 | Azaltma listesi güvenilir mi? | Kırılgan — 30 hat korumaya alındı |
| 9 | Sefer süresi doğru mu? | Hayır, formül — arşivden gerçek süre ölçüldü |
| 10 | Biniş = anlık yolcu mu? | Hayır — devir 1,7, bağımsız ölçüm 1,98 |
| 11 | Arz resmi tarifeyle tutuyor mu? | Birebir (iett.istanbul, 500T ve 76O) |
| 12 | Bir kalkış tek yön mü? | 103 hatta hayır — üç kanıt |
| 13 | Yön kırılımı kurulabilir mi? | Evet, hat+saat düzeyinde ölçüm (%98 birinci kademe) |
| 14 | Hacim 2026'dan alınabilir mi? | Hayır — ağustos zirvesi ekimin %71'i, öneri 172→8 |

**Ek doğrulamalar:**
- 2026 vs 2024 saatlik şekil: **Pearson 0,964** — seviye farklı, şekil aynı
- Sentetik hafta sonu çarpanı: varsayım %72/%52, ölçülen %79/%58 → muhafazakâr
- Kapasite 110: kısa hatların doluluk tavanı bağımsız olarak **113** çıktı
- Zirve saati gün gün kararlı: 10 günün 10'unda **07:00**, saatlik pay oynaması ≤0,5 puan
- Sefer süreleri İBB trafik indeksiyle Spearman **0,759**

---

## 9. KISITLAR — dürüstçe, sorulmadan söyle

1. **Talep 2024, arz 2026.** Model varsayımı: "bugünkü tarife 2024 talebini karşılıyor mu?"
   Yeni metro koridorlarında talep düştüyse sıkışıklık abartılı olabilir.
2. **5 gün, hepsi hafta içi.** Günler arası fark %3,4 — yeterli ama pazartesi/salı yok.
3. **Hafta sonu sentetik.** Seviye varsayım; hafta sonu önerileri ayrı ve etiketli.
4. **Kapasite 110 varsayım.** Solo otobüs 90, hangi hatta hangi araç açık veride yok.
5. **Devir 1,7 — en büyük belirsizlik.** Araç sayısını ±%50 oynatıyor, sıralamayı değil.
6. **Yön oranı ağustos tatil haftasından.** Okul döneminde desen keskinleşebilir.
7. **Yön düzeltmesi satırların %49'una uygulanabildi.** Kalanı eski yönsüz hesap.
8. **Saat atfı:** uzun hatta 07:45 kalkan otobüs 8-9'da çalışıyor; %8-23 sapma, düzeltilmedi.
9. **Metrobüs + 52 hat dışarıda** — sıkışık olabilirler ama ölçülemiyor.
10. **Planlanan ≠ gerçekleşen.** İptal seferler görünmüyor.
11. **Dakika yerleşimi ölçüm değil karar.** Talep saatlik; "17:20'ye ekle" eşit aralık ilkesi.
12. **Azaltma listesi artırmadan kırılgan.** Sıfıra yakın doluluk çoğu zaman veri hatası.

---

## 10. SORU BANKASI

### Veri seçimi

**"Sana 2026 verisini verdim, neden hâlâ 2024 kullanıyorsun?"**
Kullandım — oran için, hacim için değil. Verdiğiniz hafta 9-15 Ağustos, tatil. Ölçtüm:
sabah zirvesi 2024 ekiminin %71'i, saat 08:00 tek başına %61. Hacmi de 2026'dan alınca
172 yerine 8 öneri çıkıyor, zirve açığı 120 araçtan 7'ye düşüyor. Bu "sorun yok" değil,
"ağustosta okul yok" demek. Seviye mevsime bağlı, oran değil — sabah ağustosta da aynı yöne
gidiliyor, sadece daha az kişi. O yüzden oran 2026'dan, seviye okul döneminden.

**"2024 ile 2026'yı nasıl birleştirdin?"**
Toplamadım; birinden sayı, öbüründen oran aldım. Anahtar `hat + gün tipi + saat`.
`yolcu_G = yolcu_2024 × oran_2026`. Oranın birimi yok, yıldan bağımsız; sayının var.
Birleştirmeden önce iki eğrinin aynı şeyi tarif ettiğini test ettim: Pearson 0,964.

**"Okul döneminden hafta versem?"**
En değerli istek bu. Talep + yön + arz tek kaynaktan olur, üç kısıt birden kalkar.
Betik hazır, iki satır değişip çalışır.

**"Neden 2023 değil, daha dolu?"**
Taradım, Mart 2023'ü içerik seviyesinde doğruladım (15,4 M satır, 31 gün tam). Ama arz
2026'dan — 3 yıl fark yerine 2. Kontrol edilmemiş eksiklik değil, beyan edilmiş tercih.

**"5 gün yeterli mi?"**
Günler arası fark %3,4. API'yle çapraz kontrol: Spearman 0,862, mutlak fark %5.

**"Yön oranı ağustostan, mevsim bozmaz mı?"**
Bozarsa keskinleştirir, ters çevirmez. Hacim 2024'ten geldiği için seviye zaten etkisiz.
Kısıt olarak yazdım.

**"Hafta sonu sentetik, nasıl güveniyorsun?"**
Ölçüp kontrol ettim: varsayım %72/%52, sizin verinizden gerçek %79/%58. Muhafazakâr taraftayım.
Hafta sonu önerileri ayrı sayılıyor ve "sentetik" etiketiyle gösteriliyor.

**"Her hafta yoğun saatler değişmez mi?"**
Ölçtüm: Ekim 2024'ün 5 gününde ve Ağustos 2026'nın Pzt-Cum'unda zirve hep 07:00, saatlik
pay oynaması yarım puanın altında. Saatler kararlı; seviye mevsimsel.

**"Bu proje otomatik güncelleniyor mu?"**
Hayır, fotoğraf. Tek eksik saatlik kart verisinin düzenli gelmesi — İBB portalı Kasım
2024'ten beri yayımlamıyor. Boru hattı 2 dakikada dönüyor; yön raporu haftalık gelse pano
her hafta güncellenirdi.

### Hesap

**"110 kapasite nereden?"**
Körüklü otobüs. Bağımsız kontrol: 30 dakikanın altındaki hatların doluluk tavanı
(90. yüzdelik) 113 çıktı. İki sayı birbirini bilmeden buluştu.

**"Sefer başına biniş ile araçtaki yolcu aynı şey değil."**
Doğru, devir katsayısı: 8 km üstü 1,7. Hanehalkı anketinden bağımsız ölçüm 1,98.
Modelin en büyük belirsizliği; araç sayısını ±%50 oynatıyor, sıralamayı değil.
*Size sorum: siz hangi katsayıyı kullanıyorsunuz?*

**"Neden 8 km eşiği?"**
Uzunluğa göre bantlayınca devir 8 km'den sonra düzleşiyor (1,55-1,98, ortalama ~1,7).
Sebebi: uzun hatta binen yolcu da daha uzun gidiyor, oran sabit kalıyor.

**"Sefer süresini nereden aldın?"**
`SEFER_SURESI` planlama değeri (uzunlukla korelasyon 0,9842). Gerçek süreleri sefer
arşivinden, talep verisiyle aynı 5 günden çektim. Hat bazında ±%70 sapıyor (500T planlanan
273, gerçek 170 dk; 14ES 126 → 217).

**"Azaltma eşiklerini neye göre belirledin?"**
Karar, ölçüm değil. Doluluk 20'nin altıysa aday, hedef 40 (110'a doldurmuyoruz, muhafazakâr),
en az 4 kalkışı olan saat, hiçbir saatte 2'nin altına inme. Duyarlılık: hedefi 40→110
yapmak sonucu %20 oynatıyor, eşiği 20→30 yapmak %66. Tartışılacak sayı 40 değil, 20.

**"Yön oranı saatlik mi?"**
Evet, hat + gün tipi + saat. Hafta içinin %98'i bu düzeyden; bir hücrede 100 yolcu yoksa
bir üst kademeye (sabah/gündüz/akşam/gece bloğu) çıkılıyor.

**"Yolcusu az olan yön nasıl kritik oluyor?"**
76O 07:00: gidiş yönünde yolcuların %38'i var ama tarifede gidişe 3, dönüşe 5 kalkış.
611 ÷ 3 = 204 biniş, 996 ÷ 5 = 199. Kritik olan yolcu sayısı değil, yolcu ÷ sefer.

**"Ek sefer hangi dakikaya?"**
Mevcut kalkışlara dokunmadan en büyük boşluğun ortasına; 4 dakikadan sık önerilmiyor.
Bu ölçüm değil karar — talep saatlik, saat içi dağılım bilinmiyor.

**"Hafta sonu için neden öneri var / yok?"**
Önce yoktu (sentetik diye). Sonra açtık: sentetik olan seviye, taşmanın kendisi değil;
üstelik çarpanlar gerçeğin altında, susmak sıkışıklığı gizliyordu. Ayrı sayılıyor, etiketli.
Azaltma tarafında çoğu hatta öneri yok çünkü hafta sonu tarifesi zaten seyrek: satırların
%61'inde saatte 4'ten az kalkış var, medyan 2.

### Dışlamalar

**"Metrobüs neden yok?"**
Talep tüm binişleri `34`'e yazıyor, arz 8 koda bölünmüş. `34G` saatte 122 sefer / 0,1 kişi
çıkıyordu. Payda güvenilmez → dışarıda. 2026 verisinde de yok (ayrı sistem).

**"52 hat neden dışarıda?"**
`PlanlananSeferSaati` dönüş kalkışlarını döndürmüyor. Durak ağı iki yönlü ama tarife tek
yön. Sefer sayısı eksik → doluluk yapay yüksek. Silmedim, "değerlendirilemeyen" başlığıyla
listeledim.

**"30 şüpheli hat ne?"**
Gün ortalaması 5 kişi/sefer altı — hepsi harf önekli servis hatları. İETT böyle bir hattı
yıllarca işletmez; yolcuları başka kod altında. "Boşalt" demek yerine "veriyi kontrol et" dedim.

### Yöntem / süreç

**"Bir kalkış gidiş+dönüş mü, nereden biliyorsun?"**
98: 161 gidiş / 15 dönüş — otobüsler bir uçta birikirdi. Üç kanıt: hız yarısı, aynı araç
dört kez üst üste "G", düzeltince dağılımlar çakışıyor. Sizin `Güzergah Yön` sütununuz da onayladı.

**"Bu hataları nasıl buldun?"**
Hepsi saçma bir sayıdan başladı: 1.085 kişi/sefer, saatte 122 sefer, 48 ek araç, 161/15
tarife. Kural: sayı imkânsız görünüyorsa veriye geri dön.

**"Sentetik veri neden ürettin?"**
Ekim 2024'te hafta sonu yok. Sizin isteğinizle üretildi; hafta içi eğrisi saatlik katsayılarla
eğildi, %72/%52 çarpanı, tohum 42. İlk deneme yanlıştı (şekli arzdan aldık, doluluk dümdüz
çıktı) — grafik çizince fark ettik.

**"Neden dashboard, neden Streamlit değil?"**
GitHub Pages'e doğrudan yüklenir, internet gerekmez, uyku modu yok. Tek HTML + gömülü veri.

**"Canlı katman ne yapıyor?"**
Gerçek araç konumları 30 saniyede bir; hareket vektöründen yön; iki ölçüm arası mesafe/süre
= hız → trafik katmanı. Tarayıcı SOAP'a doğrudan bağlanamıyor (CORS), araya Python köprü koydum.

**"Ne öğrendin?"**
Veri seçimi sonucu belirler (aynı kod, ağustos vs ekim: 120 → 7 araç). Doğru sütunu
istemek daha çok veri istemekten etkili (durak sütunu çıkınca 61 kat satır geldi). Bir
kaynaktaki kodlama hatası ondan beslenen ikinci kaynağa da geçer.

### Sonuç

**"Sonuç ne?"**
Sorun kaç otobüs olduğu değil, hangi saatte hangi yöne gittiği. 08:00'de 120 araç açık,
zirve dışında 2.419 sefer fazla. Çözüm yeni araç değil, vardiya dağılımı.

**"Kaç araç lazım, kesin?"**
Devir 1,7 ile 120. Katsayının ölçülen aralığında 40-148. Hangi hat/hangi saat cevabı
katsayıdan bağımsız — sıralama değişmiyor.

**"Bundan sonra ne lazım?"**
(1) Okul döneminden bir hafta yön verisi. (2) Sizin devir/doluluk katsayınız — APC verisi.
(3) Canlı konum kotası. Üçü de gelirse model çıkarımdan ölçüme geçer.

---

## 11. 10 DAKİKALIK SUNUM AKIŞI

```
1  Soru                  "Hangi hatta, hangi saatte, hangi yöne?"                  30 sn
2  Üç veri kaynağı       arz / talep / yön — nereden geldi                         1 dk
3  Hesap                 9 adım, tahtaya 76O örneği                                2 dk
4  İlk sonuç saçmaydı    1.085 kişi/sefer → 5 gün bulgusu                          1 dk
5  Yedi düzeltme         her biri tek cümle, en çok bacak + devir + gerçek süre    2 dk
6  Sonuç                 manşet + 120 araç + duyarlılık                            1 dk
7  Dashboard             76O paneli, tarife tablosu, harita canlı                  1 dk
8  Kısıtlar              5 tanesini sen söyle, sorulmasını bekleme                 1 dk
9  Sıradaki             okul dönemi haftası + devir katsayısı sorusu               30 sn
```

**Sunum sırasında panoda gösterilecekler:** giriş sayfası → Sefer artır → 76O'ya tıkla →
tarife tablosunda yeşil +17:20 → Detaylar → harita, yön seçici → 🔴 canlı konumlar.

---

## 12. EZBER KARTI — 12 sayı

```
783 hat · 130.435 kalkış          arz, API
5 gerçek gün                       talep, Ekim 2024 (31 değil!)
146.259 satır                      yön verisi, 9-15 Ağustos 2026
676 hat değerlendirildi            59 dışarıda (8 Metrobüs + 52 eksik − 1)
110 kişi                           kapasite (bağımsız kontrol: 113)
1,7                                devir (bağımsız ölçüm: 1,98)
172 öneri · 66 hat · +262 sefer    hafta içi, yönlü
120 araç                           zirve açığı, 08:00
2.419 sefer                        hafta içi azaltılabilir, 233 hat
0,862 / 0,964                      talep doğrulaması (API) / 2026-2024 şekil
%71                                ağustos zirvesi ÷ ekim zirvesi
14 sınama                          Bölüm 8
```
