# İETT Arz-Talep Analizi — Veri Kaynakları ve Veri Kalitesi Notları

**Proje:** İstanbul otobüs hatlarında arz-talep dengesi analizi
**Veri kaynağı:** İBB Açık Veri Portalı (https://data.ibb.gov.tr)
**Hazırlayan:** Mehmet Küçükbirer
**Tarih:** Ağustos 2026

---

## 1. Projenin Amacı

İETT otobüs hatlarında **sunulan hizmet (arz)** ile **kullanılan hizmet (talep)** arasındaki dengeyi hat ve saat bazında ölçmek; hangi hatlarda hangi saatlerde sefer sayısının artırılması veya azaltılması gerektiğine dair veriye dayalı öneri üretmek.

**Temel metrik:**

```
Sefer başına düşen yolcu = (Saatlik yolcu sayısı) / (Aynı saatteki sefer sayısı)
```

Bu değer bir otobüsün kapasitesini (körüklü otobüs ~110 kişi) aşıyorsa hat o saatte yetersiz hizmet veriyor demektir. Çok düşükse kaynak verimsiz kullanılıyor demektir.

---

## 2. Kullanılan Veri Setleri

### 2.1. GTFS Verisi — ARZ tarafı

**Kaynak:** [IETT GTFS Data](https://data.ibb.gov.tr/dataset/iett-gtfs-verisi)
**Son güncelleme:** 21 Nisan 2026
**Geçerlilik aralığı:** 16 Mart 2026 – 31 Aralık 2026

GTFS (*General Transit Feed Specification*), toplu taşıma tarifelerinin paylaşılması için kullanılan uluslararası bir standarttır. 2005'te Google ve Portland toplu taşıma idaresi tarafından geliştirilmiş, bugün dünya genelinde kullanılmaktadır. Google Maps'in toplu taşıma yönlendirmeleri bu formata dayanır.

Formatın mantığı, bir tarifeyi birbirine anahtarlarla bağlı ilişkisel tablolara bölmektir (veritabanı normalizasyonu).

| Dosya | Satır sayısı | İçerik | Projede kullanımı |
|---|---|---|---|
| `routes.csv` | 9.280 | Hat tanımları | Hat kodu (`route_short_name`) eşleştirmesi |
| `trips.csv` | 135.625 | Her satır tek bir sefer | **Sefer sayısının kaynağı** |
| `stop_times.txt` | 6.155.693 | Seferlerin durak-saat bilgisi | **Sefer kalkış saatinin kaynağı** |
| `stops.csv` | 15.391 | Durak adı ve konumu | Harita görselleştirmesi |
| `calendar.csv` | 4 | Hizmet takvimleri | Hafta içi / cumartesi / pazar ayrımı |

#### Önemli sütunlar

**`routes.csv`**

- `route_id` — hattın sistem içi kimliği; diğer tablolar bu alanla bağlanır
- `route_short_name` — halkın bildiği hat kodu (34AS, 500T, 15F)
- `route_long_name` — güzergâh adı (KADIKÖY - KİRAZLITEPE)
- `route_type` — araç tipi; **3 = otobüs** (0=tramvay, 1=metro, 2=tren)

**`trips.csv`**

- `trip_id` — tek bir kalkışın kimliği
- `route_id` — hangi hatta ait (routes.csv'ye bağlanır)
- `service_id` — hangi takvimde işliyor (calendar.csv'ye bağlanır)
- `direction_id` — gidiş (0) / dönüş (1)

Bu tablodaki **her satır bir otobüs kalkışıdır.** Sefer sayısı bu tablodan sayılır.

**`stop_times.txt`**

- `stop_sequence` — seferdeki durak sırası (1 = ilk durak)
- `departure_time` — kalkış saati
- `timepoint` — 1 ise saat kesin, 0 ise tahmini (genelde boş)

Seferin kalkış saati, `stop_sequence = 1` olan satırın `departure_time` değeridir.

**`calendar.csv`**

```
service_id;service_name;monday;...;sunday;start_date;end_date
0;WEEKDAYS;1;1;1;1;1;0;0;20260316;20261231
6;SATURDAY;0;0;0;0;0;1;0;20260316;20261231
```

Hafta içi ve hafta sonu sefer sıklıkları birbirinden çok farklı olduğu için bu ayrım analizde zorunludur.

---

### 2.2. Saatlik Toplu Ulaşım Verisi — TALEP tarafı

**Kaynak:** [Saatlik Toplu Ulaşım Veri Seti](https://data.ibb.gov.tr/dataset/hourly-public-transport-data-set)
**Kullanılan dönem:** Ekim 2024 (dolu olan en güncel ay)
**Boyut:** 261,8 MB

Veri, İstanbulkart geçiş kayıtlarından üretilmekte ve saat / hat / ilçe bazında toplulaştırılmaktadır.

| Sütun | Anlamı | Kullanım |
|---|---|---|
| `transition_date` | Geçiş tarihi | Hafta içi / hafta sonu ayrımı |
| `transition_hour` | Geçiş saati (HH) | **Saat bazlı eşleştirme** |
| `line` | Hat kodu | **GTFS ile birleşme anahtarı** |
| `line_name` | Hat adı | Görüntüleme |
| `number_of_passenger` | Yolcu sayısı | **Talebin ölçüsü** |
| `number_of_passage` | Yolculuk (geçiş) sayısı | Karşılaştırma |
| `road_type` | Ulaşım türü açıklaması | Otobüs filtresi |
| `town` | İlçe | Bölgesel analiz |
| `product_kind` | Kart türü (tam, öğrenci, 65+) | Yolcu profili analizi |
| `transfer_type` | Aktarma / ilk biniş | Mükerrer sayım kontrolü |

#### Yolcu ve yolculuk farkı

- **Yolcu (passenger):** kaç *kişi*
- **Yolculuk (passage):** kaç *biniş / geçiş*

Metroya binip otobüse aktarma yapan bir kişi 1 yolcu, 2 yolculuk üretir. Analizde "otobüse kaç kişi bindi" sorusu sorulduğu için `number_of_passenger` kullanılmıştır. `transfer_type` sütunu, aktarmalı binişlerin mükerrer sayılmaması için ayrıca kontrol edilmiştir.

---

### 2.3. İki veri setinin birleştirilmesi

```
GTFS trips.csv    →  34AS hattı, hafta içi, 08:00 dilimi  →     12 sefer
Yolculuk verisi   →  34AS hattı, hafta içi, 08:00 dilimi  →  2.160 yolcu
                                     ↓
                       2160 / 12 = sefer başına 180 yolcu
                                     ↓
              Körüklü otobüs kapasitesi ~110  →  YETERSİZ ARZ
```

Birleştirme anahtarı **hat kodu + saat + gün tipi** üçlüsüdür.

---

## 3. Veri Kalitesi Bulguları

Analiz öncesinde beş ayrı veri kalitesi sorunu tespit edilmiştir. Bunların dördü **sessiz hata** (silent failure) niteliğindedir: hiçbir hata mesajı üretmezler, veri normal görünür, ancak sonuçlar yanlış çıkar.

---

### Bulgu 1 — `stop_times.csv` Excel satır limitinde kesilmiş

| Sürüm | Satır sayısı |
|---|---|
| Portaldaki CSV | **1.048.576** |
| Portaldaki ZIP içindeki TXT | **6.155.693** |

1.048.576 sayısı 2²⁰'ye eşittir ve Microsoft Excel'in bir çalışma sayfasında tutabildiği maksimum satır sayısıdır. Dosyanın Excel üzerinden geçirilip yeniden kaydedildiği, bu sırada satırların %83'ünün kalıcı olarak kaybolduğu anlaşılmaktadır.

**Doğrulama:** 135.625 sefer × ortalama ~45 durak ≈ 6,1 milyon satır beklenmektedir. ZIP sürümündeki satır sayısı bu beklentiyle uyumludur, CSV sürümü değildir.

**Etkisi:** Kesik dosyayla çalışılsaydı seferlerin büyük bölümü analiz dışı kalacak, birçok hat için "sefer yok" sonucu üretilecekti — üstelik hiçbir uyarı olmadan.

**Çözüm:** ZIP sürümü (`stop_times.txt`) kullanılmıştır. Kesik dosya `stop_times_KESIK_KULLANMA.csv` olarak yeniden adlandırılıp devre dışı bırakılmıştır.

---

### Bulgu 2 — Veri seti içinde ayraç tutarsızlığı

| Dosya | Ayraç |
|---|---|
| `routes.csv`, `trips.csv`, `stops.csv`, `calendar.csv` | `;` (noktalı virgül) |
| `stop_times.txt` (ZIP içinden) | `,` (virgül) |
| `hourly_transportation_202410.csv` | `,` (virgül) |

**Nedeni:** Türkçe ve çoğu Avrupa yerelinde ondalık ayracı virgüldür (`3,14`). Bu nedenle CSV dosyalarında alan ayracı olarak noktalı virgül kullanılır — aksi hâlde `12,50` ifadesinin tek bir ondalıklı sayı mı yoksa iki ayrı alan mı olduğu anlaşılamaz. Excel'in Türkçe sürümü varsayılan olarak `;` ile kaydeder.

**Etkisi:** Yanlış ayraçla okuma **hata üretmez.** pandas tüm satırı tek sütun olarak yorumlar ve görünüşte geçerli bir tablo döndürür. Sütun adıyla erişilmeye çalışıldığında `KeyError` alınır.

**Çözüm:** Her dosya okunmadan önce ilk satırları incelenmiş, ayraç `sep` parametresiyle açıkça belirtilmiştir.

```python
pd.read_csv("routes.csv", sep=";")
pd.read_csv("stop_times.txt", sep=",")
```

---

### Bulgu 3 — `routes.csv`'de çift kodlamadan kaynaklanan bozuk Türkçe karakterler

```
Dosyadaki hâli:   KADIKÃ–Y - KÄ°RAZLITEPE
Olması gereken:   KADIKÖY  - KİRAZLITEPE
```

**Nedeni:** Metin bir kez UTF-8 ile kaydedilmiş, ardından Windows-1252 (cp1252) olarak yorumlanmış ve bu bozuk hâliyle tekrar UTF-8 ile kaydedilmiştir. Bu işleme *mojibake* (Japonca 文字化け) denir.

Dönüşümün adımları:

```
Ö  →  UTF-8      →  C3 96
   →  cp1252 okunur  →  "Ã" + "–"
   →  UTF-8 kaydedilir  →  C3 83 E2 80 93
```

Orijinal bilgi kaybolduğu için dosya doğru kodlamayla açılsa bile metin bozuk görünür.

**Tanı imzaları:**

| Bozuk | Doğru |
|---|---|
| `Ã–` | `Ö` |
| `Ä°` | `İ` |
| `Ã§` | `ç` |
| `Ã¼` | `ü` |
| `Åž` | `Ş` |

**Etkisi:** Yalnızca `route_long_name` sütununu etkilemektedir. Analizde birleştirme anahtarı olarak kullanılan `route_id` ve `route_short_name` alanları ASCII karakterlerden oluştuğu için etkilenmemiştir. Sorun görsel düzeydedir, hesaplamaları bozmamaktadır.

**Çözüm:** Ters dönüşüm uygulanmıştır.

```python
def mojibake_duzelt(metin):
    try:
        return metin.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return metin
```

---

### Bulgu 4 — `stops.csv`'de bozuk koordinat değerleri

```
Dosyadaki hâli:   stop_lat = 410.191.700.005.564
                  stop_lon = 286.843.529.999.755

Olması gereken:   stop_lat = 41.0191700005564
                  stop_lon = 28.6843529999755
```

**Nedeni:** Ondalık ayracı Türkçe yerel biçime dönüştürülürken virgüle çevrilmiş, kalan basamaklara binlik ayracı olarak nokta eklenmiş, ardından ondalık virgülü kaybolmuştur.

**Etkisi:** Koordinatlar bu hâliyle kullanılamaz. Enlem değeri tanım gereği -90 ile +90 arasında olmak zorundadır; 410 fiziksel olarak imkânsızdır.

**Çözüm:** Noktalar kaldırılıp ilk iki basamaktan sonra ondalık ayracı yerleştirilmiştir. İstanbul için enlem 40–42, boylam 28–30 aralığında olduğundan tam kısım her zaman iki basamaklıdır.

```python
def koordinat_duzelt(deger):
    rakamlar = str(deger).replace(".", "")
    return float(rakamlar[:2] + "." + rakamlar[2:])
```

**Doğrulama:** Düzeltme sonrası tüm koordinatların İstanbul sınırları içinde (enlem 40,5–41,7 / boylam 27,8–29,9) kalıp kalmadığı kontrol edilmelidir.

---

### Bulgu 5 — Saatlik yolculuk veri setinde boş yüklenmiş kaynaklar

| Ay | Boyut | Durum |
|---|---|---|
| Aralık 2024 | 187 byte | Yalnızca başlık satırı — **veri yok** |
| Kasım 2024 | 187 byte | Yalnızca başlık satırı — **veri yok** |
| Ekim 2024 | 261,8 MB | Geçerli |
| Eylül 2024 | 372,6 MB | Geçerli |
| Ağustos 2024 | 277,7 MB | Geçerli |

Ayrıca "Aralık 2024" etiketli kaynağın dosya adı `hourly_transportation_202512.csv`'dir; etiket ile dosya adı (Aralık 2025) tutarsızdır.

**Nedeni:** Veriyi üreten otomatik sürecin boş sonuç döndürmesi ve bu sonucun kontrol edilmeden yayımlanması. Dosya mevcut, adlandırması doğru, başlık satırı geçerli olduğu için sorun yüzeysel incelemede fark edilmemektedir.

**Çözüm:** Dolu olan en güncel ay olan **Ekim 2024** kullanılmıştır.

---

## 4. Analizin Kısıtları

Sonuçlar yorumlanırken aşağıdaki kısıtlar dikkate alınmalıdır.

1. **Dönem uyuşmazlığı.** Talep verisi Ekim 2024, arz verisi (GTFS) Mart–Aralık 2026 dönemine aittir. Aradaki sürede bazı hatların güzergâhı, sefer sıklığı veya hat kodu değişmiş olabilir. Kurulan yöntem, İETT'nin kendi güncel verisiyle aynı biçimde çalıştırılabilir.

2. **Talep verisinin sınırı.** İstanbulkart geçişleri yalnızca **binişleri** kaydeder; iniş noktası bilinmez. Bu nedenle hattın hangi bölümünde yoğunlaştığı ölçülemez, hat genelinde ortalama alınır.

3. **Kapasite varsayımı.** Analizde standart körüklü otobüs kapasitesi (~110 yolcu) referans alınmıştır. Gerçekte hatlara farklı tipte araçlar tahsis edilmektedir; araç tipi kırılımı açık veride bulunmamaktadır.

4. **Planlanan sefer, gerçekleşen sefer değildir.** GTFS planlanmış tarifeyi içerir. Arıza, trafik veya personel kaynaklı iptal edilen seferler bu veride görünmez. Gerçekleşme oranı verisi yalnızca anlık SOAP web servisi üzerinden sunulmakta, geçmişe dönük paylaşılmamaktadır.

5. **Aktarma etkisi.** Aktarmalı binişlerin yolcu sayımına dâhil edilme biçimi `transfer_type` sütunu üzerinden kontrol edilmiştir; bu alanın kodlaması hakkında resmî veri sözlüğü bulunmadığından yorum verinin kendisinden çıkarılmıştır.

---

## 5. Metodolojik Çıkarım

Tespit edilen beş sorunun dördü hata mesajı üretmemektedir. Veri normal görünmekte, kod sorunsuz çalışmakta, sonuçlar makul biçimde raporlanmaktadır — ancak yanlıştır.

Bu nedenle analiz sürecinin her adımında şu kontroller uygulanmıştır:

- **Boyut kontrolü:** Dosya boyutu ve satır sayısı beklentiyle uyumlu mu?
- **Biçim kontrolü:** Ayraç, kodlama ve sütun adları okunmadan önce doğrulandı mı?
- **Mantık kontrolü (sanity check):** Üretilen sayılar gerçek dünyayla uyumlu mu? (İstanbul'da 15 bin durak makul; enlem 410 imkânsız.)
- **Sınır kontrolü (validation):** Değerler fiziksel olarak mümkün aralıkta mı?

---

## Kaynaklar

- [İBB Açık Veri Portalı](https://data.ibb.gov.tr)
- [IETT GTFS Data](https://data.ibb.gov.tr/dataset/iett-gtfs-verisi)
- [Saatlik Toplu Ulaşım Veri Seti](https://data.ibb.gov.tr/dataset/hourly-public-transport-data-set)
- [İETT Genel Müdürlüğü veri setleri](https://data.ibb.gov.tr/organization/iett-genel-mudurlugu)
