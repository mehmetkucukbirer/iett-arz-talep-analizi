# İETT Arz-Talep Analizi — hangi sefer artırılmalı, hangisi azaltılmalı?

> **English summary.** Internship project at İETT (Istanbul's public bus operator),
> Intelligent Transportation Systems department, summer 2026. It joins **planned bus
> supply** (İETT SOAP web service) with **hourly ridership** (Istanbul Metropolitan
> Municipality open data) to estimate passengers per trip at *line × day type × hour*
> resolution, then recommends where trips should be **added** (crowded peak hours) or
> **reduced** (empty off-peak hours), including the vehicle count each change requires.
> 676 lines analysed, 14 independent validation checks. Headline finding: *the fleet is
> not too small, it is badly distributed* — for every trip that should be added, about
> fifteen could be removed elsewhere. Python · pandas · SOAP/XML · OSRM · D3/Leaflet dashboard.

---

## Soru

*"76O hattı, hafta içi, 17:00, Otogar → Cihangir yönü: sefer başına 131 kişi → +1 sefer."*
Bu cümleyi her hat ve saat için kurabilmek.

```
ARZ   — İETT SOAP web servisi (planlanan sefer saatleri)   → hat · gün tipi · saat → sefer sayısı
TALEP — İBB Açık Veri (saatlik toplu taşıma, Ekim 2024)   → hat · gün tipi · saat → yolcu sayısı
                                   ↓
                 sefer başına yolcu = doluluk göstergesi
                                   ↓
     kapasitenin üstü → "sefer artır"  ·  çok altı → "sefer azalt"  (+ gereken / kazanılan araç)
```

## Sonuçlar (hafta içi)

| | |
|---|---|
| Değerlendirilen hat | **676** (59'u veri yetersizliğinden dışarıda) |
| Sefer **artırılmalı** (yön ayrımlı) | **172** hat-saat · **66** hat · **+262 sefer** |
| Sefer **azaltılabilir** | 699 hat-saat · 233 hat · **2.419 sefer** |
| **Zirve açığı** | **120 ek araç** (08:00) |

**Manşet:** kaynak yetersiz değil, yanlış dağılmış. Eklenmesi gereken seferler sabah 7-9
ve akşam 15-18'de; azaltılabilecekler zirve dışında. Çözüm yeni araç almak değil, sefer
ve vardiya dağılımını yeniden kurmak. (İki sayı birbirinden çıkarılmamalı: zirvedeki
eksik, zirve dışındaki fazlayla kapanmaz.)

## Doğrulama — 14 ayrı sınama

Sonuçlara güvenmeden önce her varsayım ayrıca ölçüldü. Öne çıkanlar:

- **API ↔ açık veri tutarlılığı** — talep verisi iki kaynaktan karşılaştırıldı.
- **Arz verisi ↔ resmî tarife** — planlanan seferler yayımlanan tarifeyle kıyaslandı.
- **103 hatta "bir kalkış" = gidiş + dönüş** — fark edilmeyen bu yapı doluluğu ikiye
  katlıyordu; düzeltilince öneri listesi 178'den 96'ya indi.
- **52 hatta dönüş seferleri eksik** — bu hatlar yapay yüksek doluluk ürettiği için dışlandı.
- **Gerçek sefer süreleri** — "sefer süresi" alanının ölçüm değil plan olduğu bulundu;
  gerçek süreler arşivden çıkarıldı.
- **Devir katsayısı** (bir sefer boyunca biniş/iniş döngüsü) — modelin en büyük
  varsayımı; bağımsız kaynaktan ölçüldü ve duyarlılık tablosuyla raporlandı.
- **Yön boyutu** — yön bilgili kart basış verisi (146.259 satır) ile yön oranı hat ve
  saat düzeyinde ölçüldü; tahmin katmanı kalktı.

## Kısıtlar

- Talep verisi Ekim 2024 ve hafta sonunu içermiyor; hafta sonu **sentetik** üretildi
  (gerçek hafta içi eğrisi saatlik katsayılarla eğildi, seviye varsayımı cumartesi %72 ·
  pazar %52) ve her satırda `gercek` / `sentetik` diye etiketli. Hafta sonu önerileri ayrı raporlanır.
- Durak bazında analiz yapılamaz (iniş kaydı yok).
- Sonucun büyüklüğü devir katsayısına bağlı — rapor duyarlılık tablosuyla birlikte okunmalı.
- Metrobüs ailesi (8 hat) ve dönüş seferi eksik 52 hat analiz dışı.

## Depo içeriği ve çalıştırma

```bash
python3 09_gercek_sureler.py          # gerçek sefer süreleri          (bir kez, ~2 dk)
python3 05_boru_hatti.py              # tüm analiz çıktıları           (~2 dk)
python3 14_yon_duzeltmesi.py          # yön ayrımlı doluluk            (05'ten sonra)
python3 10_guzergah_koordinatlari.py  # harita koordinatları           (bir kez)
python3 12_rota_yollari.py            # rotaları yola oturt (OSRM)     (bir kez)
python3 11_canli_kopru.py             # dashboard sunucusu + canlı konum köprüsü
```

| Dosya | İş |
|---|---|
| `01`–`04` | ilk bakış, talep özeti, arz API'si (SOAP), kontrol defteri |
| `05_boru_hatti.py` | 7 adımlı boru hattı: hat listesi → arz → talep → sentetik hafta sonu → doluluk → öneriler + araç hesabı → dashboard JSON |
| `14_yon_duzeltmesi.py` | yön ayrımlı doluluk |
| `notlar/` | veri modeli, veri kalitesi, sütun kontrolleri, sunum rehberi, dashboard ek betikleri |
| `PROJE_DURUMU son durum.md` | projenin tüm gerekçeli kaydı (her ölçüm ve kararın nedeni) |

**Bu depoda olmayanlar:** `veri/` ve `cikti/` (ham veri, sonuç tabloları ve dashboard)
bilinçli olarak yayımlanmadı — bir kısmı staj sırasında kurum içinden sağlanan veriden
türetildi. Defterler çıktıları temizlenmiş olarak yüklendi.

---

*Staj projesidir; İETT'nin resmî görüşünü yansıtmaz.*
