# 01_ilk_bakis.py — Ne Yaptık, Neden Yaptık

> Bu dosya `01_ilk_bakis.py`'nin baştan sona açıklamasıdır. Kod dosyasında yorum satırı
> kalabalığı olmasın diye ayrı tutuldu. Kodu unuttuğunda buraya bak.
> Hazırlanma tarihi: 4 Ağustos 2026

---

## 0. Bu dosyanın işi neydi

Projenin sorusu: **hangi otobüs hattında, hangi saatte sefer artırılmalı veya azaltılmalı?**

Cevap için iki sayıyı yan yana koymamız gerekiyor:

```
ARZ   (GTFS tarifesi)      → hat + saat bazında planlanan sefer sayısı
TALEP (İstanbulkart verisi) → hat + saat bazında yolcu sayısı
                 ↓
      Sefer başına düşen yolcu = doluluk göstergesi
                 ↓
   Kapasite ~110 kişi → üstü "sefer artır", çok altı "sefer azalt"
```

İki tabloyu birleştirmek için ortak bir anahtar lazım: **hat kodu**.

`01_ilk_bakis.py` analiz yapmaz. İşi tek şey: **veriyi tanımak ve birleştirmenin
mümkün olup olmadığını kanıtlamak.** Buna *keşifsel veri analizi* denir. Bu adımı
atlayıp doğrudan analize girersen, çıkan sonuç sessizce yanlış olur ve sen bunu
fark etmezsin.

---

## 1. Her seansın başında yazılanlar

```bash
cd Desktop/iett-projesi
```
Proje klasörüne girer. Kodun içindeki `veri/gtfs/routes.csv` gibi **göreli yollar**
buradan itibaren hesaplanır — yanlış klasördeysen dosya bulunamaz.

```bash
source venv/bin/activate
```
Sanal ortamı açar. `venv`, bu projeye özel bir Python kopyası ve ona kurulmuş
kütüphaneler (pandas, matplotlib, streamlit). Bu satır olmadan `python3` sistemdeki
Python'u çalıştırır, onda pandas yoktur → `ModuleNotFoundError`.

**Kontrol:** Satır başında `(venv)` yazmalı. Yazmıyorsa çalıştırma.

```bash
python3 01_ilk_bakis.py
```
Python'u başlatır ve dosyayı **yukarıdan aşağı, satır satır** çalıştırır. Dosya
bitince Python kapanır, bellekteki her şey silinir. Yani her çalıştırma sıfırdan başlar.

Çıktı terminale sığmıyorsa:

```bash
python3 01_ilk_bakis.py > cikti/ilk_bakis.txt 2>&1
```
`>` çıktıyı dosyaya yönlendirir, `2>&1` hata mesajlarını da aynı dosyaya gönderir.
Sonra `cikti/ilk_bakis.txt`'yi VS Code'da açıp rahat okursun.

---

## 2. Kod, satır satır

### Aşama A — Hazırlık (satır 1-4)

```python
import pandas as pd
```
pandas kütüphanesini belleğe yükler. Python kutudan çıktığı gibi tablo işlemeyi
bilmez; bunu yapan paket pandas. `as pd` kısaltmadır — herkes böyle yazar, gelenek.
Bu satır olmadan aşağıdaki `pd.` çağrıları `NameError` verir.

```python
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 200)
```
Sadece **ekrana yazdırma** ayarları, veriye dokunmaz.

- Birincisi: pandas geniş tabloları `...` ile kısaltır; `None` = "sınır koyma, tüm
  sütunları göster". İlk çalıştırmada `route_id ... route_code` görüp aradaki
  sütunları görememiştik, sebebi buydu.
- İkincisi: satır genişliği sınırı. Dar bırakırsan tablo alt satırlara kırılır ve
  okunmaz hale gelir.

### Aşama B — Veriyi okuma (satır 7)

```python
routes = pd.read_csv("veri/gtfs/routes.csv", sep=";")
```

Sağ taraf önce çalışır, sonuç sola atanır.

- `pd.read_csv(...)` → CSV dosyasını okuyup **DataFrame**'e çevirir. DataFrame'i
  Excel sayfası gibi düşün: sütun isimleri var, satır numaraları var, sütunlara
  isimle erişebiliyorsun.
- `"veri/gtfs/routes.csv"` → **göreli yol**. Başında `/` yok, yani "programın
  çalıştığı klasörden başlayarak git". Tam yol (`/Users/mehmet.../`) yazsaydık
  projeyi başka bilgisayara taşıdığımızda bozulurdu.
- `sep=";"` → **ayraç**. CSV "comma separated values" demek ama İBB bu dosyada
  virgül yerine noktalı virgül kullanmış (Avrupa'da ondalık ayracı virgül olduğu
  için yaygın bir tercih). Yazmasaydık pandas virgül arardı, bulamazdı ve her satırı
  tek sütuna tıkardı — 9279 satır, 1 sütunluk çöp bir tablo.
- `routes = ` → sonucu bir değişkene koyar. Koymasan veri okunur ve anında kaybolur.

**Kural:** Her `read_csv` çağrısında `sep`'i açıkça yaz. Bu projede GTFS `.csv`
dosyaları `;`, `stop_times.txt` ve yolculuk verisi `,` kullanıyor.

### Aşama C — Sağlık kontrolü (satır 9-14)

Bu beş satır bir rutin. Her yeni veri dosyasında aynısını uygulayacaksın. Her biri
tek bir soruyu cevaplıyor.

```python
print(routes.shape)
```
**"Veri tam mı geldi?"** → `(satır, sütun)` sayısını verir. Çıktı: `(9279, 7)`.

İki şeyi doğruladı: sütun sayısı 7 olduğu için `sep=";"` doğruymuş (yanlış olsaydı
`(9279, 1)` görürdük). Satır sayısı 9279 — dosyada 9280 satır var, aradaki fark
başlık satırı. pandas onu veri saymaz, sütun ismi olarak kullanır.

```python
print(routes.columns)
```
**"İçinde hangi bilgiler var?"** → Sütun isimleri:
`route_id`, `agency_id`, `route_short_name`, `route_long_name`, `route_type`,
`route_desc`, `route_code`.

Bizim birleştirme anahtarımız **`route_short_name`** — hat kodu (15B, 36T gibi).
`route_long_name` ise güzergâh adı (KADIKÖY - KİRAZLITEPE).

```python
print(routes.head())
```
**"Değerler gerçekte neye benziyor?"** → İlk 5 satırı gösterir. Varsayılan 5,
`head(20)` yazarsan 20 verir. Akrabaları: `tail()` sondan, `sample(5)` rastgele.

Rastgele bakmak bazen daha dürüsttür — dosyanın başı düzgün, ortası bozuk olabilir.

Burada iki şey gördük: `KADIKÃ–Y` gibi bozuk Türkçe karakterler, ve `route_desc`
sütununda `NaN` değerler. `NaN` = *Not a Number*, pandas'ın "burada değer yok" demesi.

```python
print(routes.dtypes)
```
**"Sütunların tipi doğru mu?"** → `int64` tam sayı, `float64` ondalıklı, `object` metin.

Çıktıda `route_id` ve `route_type` **float64** çıktı, yani `1.0`, `3.0` şeklinde.
Hat numarası ondalıklı olmaz — bu bir alarm.

**Sebep:** pandas'ın tam sayı tipi (`int64`) boş değer tutamaz. Bir sütunda tek bir
`NaN` bile varsa pandas o sütunu otomatik float'a çevirir, çünkü `NaN` teknik olarak
bir float değeridir.

**Kural:** Sayı sütununda beklenmedik `.0` gördüğün an "burada eksik veri var" diye
düşün.

```python
print(routes.isna().sum())
```
**"Nerede boşluk var?"** → İki aşamalı çalışır:

1. `routes.isna()` tabloyu aynı boyutta bir True/False tablosuna çevirir. Her hücreye
   "sen boş musun?" diye sorar.
2. `.sum()` sütun sütun toplar. Python'da `True` = 1, `False` = 0 sayıldığı için
   True'ları toplamak = boş hücreleri saymak.

Çıktı: `route_type` 18, `route_code` 15, `route_id` 5, `route_desc` 7491.

`route_desc` sadece açıklama metni, bizi ilgilendirmiyor. Asıl ilginç olan diğerleri.

```python
print(routes["route_type"].value_counts(dropna=False))
```
**"Bu sütunda hangi değerden kaç tane var?"**

- `routes["route_type"]` → köşeli parantezle tek sütun seçer. Tek sütun seçince
  DataFrame değil **Series** olur (tek boyutlu). `value_counts` sadece Series'te çalışır.
- `.value_counts()` → değerleri sayar **ve büyükten küçüğe sıralar** (sıralama otomatik).
- `dropna=False` → boşları da say, gizleme. Varsayılan `True` olsaydı 18 boşu hiç
  göremezdik ve sorunu kaçırırdık.

Çıktı: `3.0 → 9261`, `NaN → 18`.

`route_type` GTFS standardında ulaşım türü: 3 = otobüs. Yani 9261 satır otobüs, 18
satır belirsiz.

### Aşama D — Bozuk satırların teşhisi (satır 15-22)

```python
routes_temiz = routes[routes["route_type"] == 3].copy()
```

İçten dışa oku:

1. `routes["route_type"] == 3` → her satır için "bu satırın türü 3 mü?" sorusunu
   sorar, 9279 tane True/False üretir. `==` karşılaştırma operatörü; `=` ise atama.
   İkisi farklı şeyler.
2. `routes[...]` → sadece True olan satırları alır. Buna **boolean indexing** denir,
   pandas'ta filtreleme hep böyle yapılır.
3. `.copy()` → sonucu bağımsız bir tablo yapar. Bu olmadan pandas `routes_temiz`'i
   orijinalin bir *görüntüsü* sayar; sonradan sütun eklemeye kalkınca "bu kopya mı,
   orijinal mi belli değil" uyarısı verir.
4. `routes_temiz = ` → yeni değişkene atar. `routes` ham haliyle duruyor; istersen
   geri dönebilirsin. Ham veriyi asla bozmamak iyi bir alışkanlıktır.

Çıktı: `(9261, 7)` — 9279 − 18 = 9261. Filtre beklendiği gibi çalıştı.

```python
print(routes_temiz["route_short_name"].nunique())
```
`nunique` = *number of unique*, kaç **farklı** değer var. Çıktı: **1095**.

9261 satır ama 1095 hat. Çünkü aynı hattın gidiş, dönüş ve güzergâh varyantları
(kısa dönüş, farklı sapak, okul seferi) ayrı satırlarda duruyor. Hat başına ortalama
8-9 kayıt.

```python
print(routes_temiz["route_short_name"].value_counts().head(10))
```
**Method chaining** örneği: sütunu seç → değerleri say (otomatik sıralı) → ilk 10'u al.
Sıralama `value_counts`'tan geliyor, `head` sadece kesip alıyor. En azını görmek için
`tail(10)` kullanılır.

Bu çıktıda `VÄ°P` ve `11ÃœS` gördük — **mojibake hat kodunun içindeydi**.

```python
print(routes_temiz["route_short_name"].str.len().value_counts().sort_index())
```
Her hat kodunun karakter sayısını hesaplar, uzunlukları sayar, uzunluğa göre sıralar.

Amaç: gizli boşluk avı. `"15B"` ile `"15B "` Python için iki farklı şeydir ve
eşleşmezler. Anormal uzunluk çıksaydı orada sorun olurdu. Çıktı 1-7 karakter arası —
temiz.

```python
bozuklar = routes_temiz[routes_temiz["route_short_name"].str.contains("Ã|Ä|Å", na=False)]
print(bozuklar["route_short_name"].nunique())
print(len(bozuklar))
```

- `.str.contains(...)` → her hücre için "içinde bu harflerden biri geçiyor mu?"
  sorusunu sorar, True/False üretir.
- `"Ã|Ä|Å"` → `|` işareti "veya" demek. Bu üç harf mojibake'nin imzası; bozuk Türkçe
  karakterler hep bunlarla başlıyor.
- `na=False` → boş hücreler için False say. Yoksa hata verir.
- `len(...)` → tablonun satır sayısını verir.

Çıktı: **67** farklı hat kodu bozuk, **522** satırı etkiliyor. 1095'in %6'sı.
Atılamayacak kadar çok.

### Aşama E — Talep verisine ilk bakış (satır 23-30)

```python
yolculuk = pd.read_csv("veri/yolculuk/hourly_transportation_202410.csv", nrows=100000)
```

`nrows=100000` → "dosyanın sadece ilk 100 bin satırını oku". Dosya 262 MB ve 2,7
milyon satır; tamamını okumak belleği şişirir ve yapıyı anlamak için gereksiz.
pandas satır satır okur, sayaç 100000'e ulaşınca durur.

100000 keyfi bir sayı — biz seçtik, verinin içinde öyle bir şey yok. Tek dezavantajı
dosyanın **başındaki** satırları alması; bu dosya tarihe göre sıralı olduğu için
örneklem ayın ilk günlerinden geliyor. Yapıyı anlamak için sorun değil.

`sep` yazmadık çünkü bu dosyanın ayracı virgül, pandas'ın varsayılanı zaten o.

```python
print(yolculuk.shape)
print(yolculuk.columns)
print(yolculuk.head())
```
Yeni dosyayla tanışma rutini. Çıktı: `(100000, 13)` — 13 sütun.

**`head()` çıktısında iki kritik keşif yaptık:**

**1. `line` ve `line_name` sütunları ters isimlendirilmiş.**
`line` içinde güzergâh adı var (`CEBECI - TAKSIM`), `line_name` içinde hat kodu var
(`36T`). İsimlere göre tam tersi olmalıydı.

Sonuç: **birleştirmeyi `line_name` üzerinden yapacağız**, çünkü GTFS'teki
`route_short_name` ile aynı şeyi tutan sütun o. Bunu bilmeden `line` sütununu
kullansaydık hiçbir eşleşme bulamazdık.

**2. `town` sütunu güvenilmez.**
15B hattı (Üsküdar–Ümraniye) için `BAKIRKOY` yazıyor; 10 numaralı hat için de
`BAKIRKOY`. Bu sütunun neyi kastettiği belli değil, hattın geçtiği ilçe olmadığı
kesin. Doğrulanamazsa kullanılmayacak.

```python
print(yolculuk["line_name"].nunique())
bozuk_talep = yolculuk[yolculuk["line_name"].str.contains("Ã|Ä|Å", na=False)]
print(len(bozuk_talep))
print(sorted(yolculuk["line_name"].dropna().unique())[:25])
```

GTFS'te yaptığımız kontrolün aynısı, bu sefer talep verisinde.

- `sorted(...)` → alfabetik sıralar
- `.dropna()` → boşları atar
- `.unique()` → tekrarları teke indirir
- `[:25]` → ilk 25 tanesini keser (buna *dilimleme*, İngilizcesi *slicing* denir)

Çıktı: **830** farklı hat kodu, **0** bozuk satır. Listede `11CÜ` gibi düzgün
Türkçe karakterler.

**Kritik sonuç:** Talep verisi temiz, GTFS bozuk. İki taraf birbirini tutmuyor.
Düzeltmezsek 67 hat sessizce eşleşmez — hata mesajı almazsın, veri kaybolur.
Bu en tehlikeli hata türüdür.

### Aşama F — Türkçeleştirme (satır 32-40)

**Mojibake nasıl oluştu:**

`Ü` harfi UTF-8'de tek karakter ama diskte **iki bayt** olarak durur: `C3 9C`.
Bir program bu dosyayı UTF-8 değil de Windows-1252 sanarak okumuş; o sistemde
`C3` = `Ã`, `9C` = `œ`. Yani tek harfi iki harf olarak görmüş. Sonra bunu tekrar
UTF-8 olarak kaydedince hata dosyaya kalıcı olarak işlenmiş.

**Geri almak için aynı yoldan tersine gideceğiz:** harfleri baytlara çevir, o
baytları UTF-8 olarak oku.

```python
def duzelt(metin):
    baytlar = bytearray()
    for k in metin:
        baytlar += k.encode("cp1252") if ord(k) > 255 else bytes([ord(k)])
    return baytlar.decode("utf-8")
```

Bu senin ilk kendi fonksiyonun. Satır satır:

- `def duzelt(metin):` → yeni fonksiyon tanımlar. `def` = *define*. `duzelt` fonksiyonun
  adı, `metin` dışarıdan alacağı değer (buna *parametre* denir). Sonundaki iki nokta şart.
- **Girinti:** alttaki satırlar 4 boşluk içeride. Python bir bloğun nerede başlayıp
  bittiğini girintiden anlar. Girinti bozulursa `IndentationError`.
- `baytlar = bytearray()` → boş bir bayt listesi. Harfleri buraya biriktireceğiz.
- `for k in metin:` → **döngü**. Metindeki her harfi tek tek dolaşır, sırayla `k`
  değişkenine koyar.
- `ord(k)` → harfin numarasını verir (`A` = 65 gibi).
- `k.encode("cp1252") if ord(k) > 255 else bytes([ord(k)])` → koşullu ifade.
  Numara 255'ten büyükse (`œ` gibi özel karakter) cp1252 karşılığındaki bayta çevirir;
  değilse numarayı doğrudan bayt olarak alır.
- `+=` → "üstüne ekle".
- `return baytlar.decode("utf-8")` → biriken baytları UTF-8 olarak okur ve sonucu geri
  verir. `return` fonksiyonun çıktısıdır; onsuz fonksiyon hesaplar ama sonucu vermez.

**Önemli:** Fonksiyonu tanımlamak onu çalıştırmaz. Tarif yazmak gibi — yemek pişmez.
Çalışması için çağırman gerekir.

```python
routes_temiz["kod"] = routes_temiz["route_short_name"].dropna().apply(duzelt)
```

- `.apply(duzelt)` → sütundaki her hücreye `duzelt` fonksiyonunu uygular.
  Fonksiyon adını **parantezsiz** yazıyorsun. Parantez koyarsan (`duzelt()`) Python
  onu hemen çalıştırmaya kalkar; parantezsiz yazınca "işte fonksiyon, sen çağır"
  demiş olursun. pandas her hücre için tek tek çağırıyor.
- Sol taraftaki `routes_temiz["kod"]` → var olmayan bir sütun adına atama yaparsan
  pandas onu **oluşturur**. Orijinal `route_short_name` bozuk haliyle duruyor;
  karşılaştırabilmek için bilerek silmedik.

```python
print(routes_temiz["kod"].nunique())
print(sorted(routes_temiz["kod"].dropna().unique())[:25])
```

**Doğrulama adımı.** Çıktı yine **1095** — düzeltme öncesiyle aynı. Bu önemli:
sayı düşseydi düzeltme iki farklı hat kodunu birbirine karıştırmış olurdu.
Listede `11CÜ` düzgün görünüyor, talep verisindeki yazımla birebir aynı.

**Kural:** Veriyi değiştiren her işlemden sonra bir doğrulama satırı koy.
Sessiz bozulmalar en pahalı hatalardır.

### Aşama G — Eşleşme testi (satır 41-50)

```python
gtfs_kodlari = set(routes_temiz["kod"].dropna())
talep_kodlari = set(yolculuk["line_name"].dropna())
```

`set` = **küme**. Tekrarları otomatik atar ve kümeler arası karşılaştırmayı kolaylaştırır.
Elimizde iki liste: GTFS'in bildiği hat kodları, talep verisinin bildiği hat kodları.

```python
print(len(gtfs_kodlari & talep_kodlari))
print(len(talep_kodlari - gtfs_kodlari))
print(sorted(talep_kodlari - gtfs_kodlari)[:20])
```

- `&` = **kesişim**, "ikisinde de olanlar" → eşleşecek hat sayısı, yani analizin kapsamı.
- `-` = **fark**, "talepte var ama GTFS'te yok" → yolcusu olan ama tarifesini
  bulamadığımız hatlar.

Çıktı: **769** eşleşme, **61** eşleşmeyen.

Eşleşmeyenlere baktık: `ADALAR-BST`, `BESIKTAS-USK`, `EMINONU-KDK`, `BOGAZ`, `HALIC`,
`F4`... Bunlar otobüs değil — vapur hatları, Adalar seferleri, füniküler. GTFS sadece
İETT otobüslerini içerdiği için bunları bilmiyor.

```python
otobus = yolculuk[yolculuk["road_type"] == "OTOYOL"]
talep_otobus = set(otobus["line_name"].dropna())
print(len(talep_otobus))
print(len(talep_otobus & gtfs_kodlari))
print(sorted(talep_otobus - gtfs_kodlari))
```

`road_type` sütunu ulaşım türünü tutuyor: OTOYOL / RAYLI / DENİZ. Sadece OTOYOL'u
alıyoruz.

Çıktı: **766** otobüs hattı, **765**'i GTFS'te de var, eşleşmeyen tek hat
**`ADA_TAKSI`** (Adalar'daki elektrikli taksi hizmeti, İETT otobüsü değil).

**%99,9 eşleşme. Birleştirme stratejisi kanıtlandı.**

---

## 3. Bu dosyanın kanıtladıkları

Rapora ve `notlar/veri_kalitesi_notlari.md` dosyasına girecek dört bulgu:

1. **GTFS'te 67 hat kodu mojibake içeriyor** (`11ÃœS` ← `11ÜS`). Bu, birleştirme
   anahtarını etkiliyor — devir dosyasındaki "sadece hat adını etkiliyor" bilgisi
   yanlıştı. Düzeltilmeden birleştirme yapılırsa 67 hat sessizce kaybolur.
2. **Talep verisinde `line` ve `line_name` ters isimlendirilmiş.** Birleştirme
   `line_name` üzerinden yapılmalı.
3. **`road_type == "OTOYOL"` filtresi şart.** Yoksa vapur ve raylı hatlar analize karışır.
4. **Bu üçü uygulandığında 766 otobüs hattının 765'i eşleşiyor** (%99,9).

Ayrıca:

- `routes.csv`'de 18 satır bozuk (13'ünde hat adının içindeki noktalı virgül
  sütunları kaydırmış, 5'i tamamen boş). `route_type == 3` filtresiyle eleniyor.
- `town` sütunu güvenilmez, doğrulanmadan kullanılmamalı.

---

## 4. Öğrenilen kavramlar sözlüğü

| Kavram | Ne demek |
|---|---|
| **DataFrame** | pandas'ın tablo yapısı. Excel sayfası gibi: sütun isimleri + satırlar |
| **Series** | Tek sütun. `df["sutun"]` yazınca elde edilir |
| **NaN** | *Not a Number* — boş hücre |
| **Ayraç (sep)** | CSV'de sütunları ayıran karakter. Bu projede `;` ve `,` karışık |
| **Göreli yol** | Bulunduğun klasörden itibaren yol. Taşınabilir olması için tercih edilir |
| **Boolean indexing** | `df[df["sutun"] == deger]` ile filtreleme |
| **Method chaining** | `.a().b().c()` — soldan sağa, her biri öncekinin çıktısına uygulanır |
| **Mojibake** | Yanlış kodlamayla okunup kaydedilmiş metin (`KADIKÃ–Y`) |
| **Fonksiyon** | `def` ile tanımlanan, bir kere yazıp defalarca çağırdığın kod parçası |
| **Döngü** | `for x in liste:` — her öğe için aynı işi tekrarlar |
| **Küme (set)** | Tekrarsız koleksiyon. `&` kesişim, `-` fark, `|` birleşim |
| **Dilimleme** | `liste[:25]` — ilk 25 öğeyi al |
| **venv** | Projeye özel Python + kütüphane çantası |
| **Chunk** | Büyük dosyayı parça parça okuma yöntemi (bir sonraki adımda) |

### En sık kullanılan pandas komutları

| Komut | Sorduğu soru |
|---|---|
| `.shape` | Kaç satır kaç sütun? Veri tam mı? |
| `.columns` | Hangi bilgiler var? |
| `.head()` / `.tail()` / `.sample()` | Değerler neye benziyor? |
| `.dtypes` | Sütun tipleri doğru mu? |
| `.isna().sum()` | Nerede boşluk var? |
| `.value_counts()` | Hangi değerden kaç tane var? |
| `.nunique()` | Kaç farklı değer var? |
| `.unique()` | Farklı değerler neler? |
| `.str.contains()` | İçinde şu geçiyor mu? |
| `.str.len()` | Kaç karakter? |
| `.apply(fonksiyon)` | Her hücreye şu işlemi uygula |
| `.copy()` | Bağımsız bir kopya oluştur |

---

## 5. Sık yapılan hatalar (hepsini yaşadık)

| Hata | Sebep | Çözüm |
|---|---|---|
| `No such file or directory` | Dosya adı yanlış yazıldı veya oluşturulmadı | `ls` ile kontrol et; komutta **Tab** ile otomatik tamamla |
| `ModuleNotFoundError: pandas` | `(venv)` yok, sistem Python'u çalıştı | `source venv/bin/activate` |
| `zsh: number expected` | Python kodu terminale yazıldı | Kod dosyaya, komut terminale |
| `SyntaxError: invalid decimal literal` | Terminal komutu Python kabuğuna yazıldı (`>>>` görünüyorsa) | `exit()` ile çık |
| Değişiklik yansımıyor | Dosya kaydedilmedi | `Cmd + S` — sekmedeki nokta kaybolmalı |
| Fonksiyon çalışmıyor | Tanımlandı ama çağrılmadı | Adını kullanarak çağır |

---

## 6. Sırada ne var

**Adım 2 — `02_talep_ozeti.py`:** 2,7 milyon satırlık talep dosyasını parça parça
(*chunk*) okuyup hat + saat + gün tipi bazında yolcu sayısı özeti üretmek.

Neden parça parça: 262 MB'lık dosya pandas'a yüklenince bellekte birkaç katına çıkar.
Bir parçayı oku → özetini al → at → sonrakine geç.

**Adım 3:** GTFS `trips.csv` ve `stop_times.txt`'ten hat + saat bazında sefer sayısı
(arz) çıkarmak.

**Adım 4:** İki tarafı `line_name` ↔ düzeltilmiş `route_short_name` üzerinden
birleştirmek, sefer başına yolcu hesaplamak.

**Adım 5:** Grafikler ve Streamlit dashboard.

**Adım 6:** Doğrulama, README, rapor.
