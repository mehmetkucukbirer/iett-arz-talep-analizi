# PROJE DEVİR DOSYASI — İETT Arz-Talep Analizi

> **Yeni asistan:** Önce bu dosyanın tamamını oku. Bölüm 0'ı **atlama** — çalışma tarzı bu
> projenin en kritik parçası ve defalarca ihlal edildi. Sonra **Bölüm 13 (ŞU AN NEREDEYİZ)**
> bölümünden devam et; oradaki "SIRADAKİ İŞ" listesi öncelik sırasıyla hazır.
>
> **Hızlı yönelim:** analiz ve dashboard bitti. 6. seansta doluluk hesabında bir hata
> bulunup düzeltildi (Bölüm 6.12 — öneri listesi 178'den **96**'ya indi). Kalan:
> (1) **rapor hiç yazılmadı** — asıl teslim bu, (2) GitHub + Pages.
> Boru hattı tek komutla çalışıyor (Bölüm 3).
>
> ⭐⭐ **7. SEANSTA YÖN BOYUTU KURULDU VE ÖLÇÜLDÜ (Bölüm 6.13).** Mentordan tam veri geldi
> (146.259 satır, Bölüm 4.5). Yön oranı artık **hat + saat düzeyinde ölçülüyor**, tahmin
> değil. Öneri listesi 96 → **172**, ek sefer 162 → **262**, zirve açığı 97 → **120 araç**. `14_yon_duzeltmesi.py`,
> ayrı çıktı — `05_boru_hatti.py`'ye dokunulmadı.
>
> **Bölüm 6.4 kapandı.** Hedef cümle kuruldu:
> *"76O · 17:00 · Otogar→Cihangir yönü · 131 kişi/sefer · +1 sefer"*
>
> ⚡ **SIRADA RAPOR VAR.** Analiz, dashboard ve yön boyutu bitti; rapor hiç yazılmadı.

**Öğrenci:** Mehmet Küçükbirer — Yazılım Mühendisliği 3. sınıf, İstanbul
**Bağlam:** İETT Akıllı Ulaşım Sistemleri'nde staj yapacak. Staj yeri, İBB Açık Veri
Portalı'ndan veri çekerek bir proje yapmasını istedi. Staj mentoru sonradan İETT SOAP web
servisini kullanmasını ve sentetik veri üretmesini istedi; proje ona göre yeniden kuruldu.
**Son güncelleme:** 26 Ağustos 2026, 7. seans sonu

> **TUTARLILIK DENETİMİ (26 Ağustos, 8. seans).** Dosyadaki rakamlar `cikti/`
> çıktılarıyla tek tek karşılaştırıldı. Bayat olan **15 sayı düzeltildi**
> (şüpheli hat 17→**30** · `doluluk_yonlu.csv` 10.578→**28.391** satır ·
> `yon_veri.json` 410 K→**1,78 MB** · dışlanan hat 53→**59** · Bölüm 6.14
> kıyas tablosunda ek sefer 230→**262** · sınama sayısı 13→**14**), silinmiş iki
> dosya klasör ağacından çıkarıldı, "yönlü sonuçlar dashboard'a girmedi" maddesi
> kapatıldı. **Sebep: yeni bulgular yeni bölümlere yazılırken eski bölümler
> güncellenmemişti** — aynı sayı iki yerde iki farklı değerle duruyordu.

---

## 0. ÇALIŞMA TARZI — EN ÖNEMLİ BÖLÜM

Mehmet bu projeyi **öğrenmek için** yapıyor. Bitmiş ürün ikincil.

### Kurallar

1. **Kodu Mehmet yazar.** Asistan onun yerine `.py` / `.ipynb` dosyası oluşturmaz. Asistan ne
   yazılacağını ve **neden** yazılacağını anlatır; Mehmet yapıştırır, çalıştırır, çıktıyı paylaşır.
   İstisnalar (Mehmet açıkça istedi): açıklama/rapor `.md` dosyaları ve dashboard'un HTML/CSS/JS
   dosyası asistan tarafından yazılabilir — **ama yazıldıktan sonra mutlaka anlatılmalı.**

2. **Her kod bloğunun altına `>` ile dipnot.** Bu satır ne yapıyor, **neden** gerekli, yazmazsak
   ne olur. Terminal komutlarında kısaltmanın açılımı da.

3. **BU KURAL DEFALARCA İHLAL EDİLDİ VE MEHMET HER SEFERİNDE SİNİRLENDİ.** Konuşma uzadıkça
   asistan açıklamayı bırakıp sadece kod/dosya vermeye başlıyor. En son dashboard HTML'i
   açıklamasız teslim edildi ve Mehmet "yine öğretme kısmını es geçtin" dedi. **Yapma.**

4. **Kısa ve öz.** Mehmet uzun mesajlardan şikâyet etti. Kod bloğu + 1-2 cümlelik dipnot.
   Uzun anlatım sadece yeni bir kavram ilk geçtiğinde.

5. **Hücreler çalışmaya hazır verilsin.** "DataFrame olsun, ben istemek zorunda kalmayayım"
   dedi. Her hücre sonunda düzgün tablo üretmeli, ham JSON/sözlük değil.

6. **Araç önerilerini asistan getirsin.** Jupyter notebook'a geçmeyi mentoru önerdi, asistan
   değil — Mehmet bunu eleştirdi. Doğru aracı proaktif öner.

7. **Periyodik hatırlatma yap.** Mehmet sık sık "ipi kaçırdım, neredeyiz, ne yapıyoruz" diyor.
   Birkaç adımda bir kısa özet ver, sormasını bekleme. Özet isterken **çok basit dil** istiyor:
   "önce şuna baktık, sonra şüphelendik, kıyasladık, şu çıktı" ritmi.

8. **"Hata" dediğinde ekrandaki metni iste.** Asistan kodu kendi tarafında çalıştırıp "hata
   yok" derse yanılır — hata çoğu zaman Mehmet'in yazdığı komutta oluyor.

9. **Çıktıyı önceden söyleme.** Mehmet görsün, sonra birlikte yorumlansın.

10. **Dil:** Samimi, günlük Türkçe. Akademik dil yok.

11. **Uzun mesaj = kafası karışıyor.** 5. seansta Mehmet birkaç kez "kafam karıştı", "çok
    kafamı karıştırdın" dedi. Tetikleyen şey: aynı anda birden fazla konunun açık kalması
    ve uzun tablo/liste. **Tek seferde tek konu.** Bir iş bitmeden öbürüne geçme; geçmen
    gerekiyorsa "şunu bir kenara koyuyoruz" diye açıkça söyle.

12. **VS Code hücre numarası göstermez.** 5. seansta "13. hücreyi çalıştır" tarzı yönergeler
    işe yaramadı, Mehmet hücreleri bulamadı ve sinirlendi. Hücreyi **ilk satırından** tarif et,
    ya da işi script'e taşı. (Notebook'un alt çubuğundaki `Cell X of 34` göstergesi işe yarar;
    hücre kenarındaki `[28]` gibi sayılar **çalıştırma sayacı**, hücre numarası değil.)

13. **Yetki verildiğinde bile önce anlat.** 5. seansta Mehmet iki kez ("bu seferlik yetki
    veriyorum", "full yetki veriyorum") dosya düzenleme yetkisi verdi. Yetki alınca bile
    ne yapıldığı sonradan anlatıldı — bu doğru davranış, sürdür.

### Klasör erişimi

**5. seansta değişti:** Asistan artık Mehmet'in klasörüne **doğrudan** erişiyor
(`/Users/mehmetkucukbirer/Desktop/iett-projesi`, normal Bash). `mcp__remote-devices__*` ve
`/sessions/*/mnt/...` yoluna gerek yok.

**Ve `api.ibb.gov.tr` / `data.ibb.gov.tr` ARTIK ERİŞİLEBİLİR.** Önceki seanslardaki proxy
engeli bu ortamda yok — 5. seansta hem SOAP API'ye istek atıldı hem 1,4 GB'lık CSV indirildi.
Yani asistan API testlerini ve veri taramalarını kendi tarafında çalıştırabilir.

Kullanımı: Mehmet'in kodunu okumak, çalıştırıp çıktıyı doğrulamak, dosya durumunu görmek.
Mehmet "sen kendi tarafında çalıştır, ben de sağlama yaparım" dedi.

**Not:** `03_arz_api.ipynb` gömülü grafik görselleri yüzünden `Read` aracının sınırını aşıyor
(36 bin token). Notebook'u okumak için `json.load()` ile Python'dan aç, `Read`/`NotebookEdit`
çalışmaz.

---

## 1. PROJE KONUSU

**Soru:** Hangi otobüs hattında, hangi saatte sefer artırılmalı veya azaltılmalı?

```
ARZ   (İETT SOAP API — PlanlananSeferSaati)  → hat + gün tipi + saat → sefer sayısı
TALEP (İBB açık veri CSV — Ekim 2024)        → hat + gün tipi + saat → yolcu sayısı
                              ↓
            Sefer başına düşen yolcu = doluluk göstergesi
                              ↓
      Kapasite ~110 (körüklü) → üstü "sefer artır", çok altı "sefer azalt"
```

**Çıktının çözünürlüğü:** hat + gün tipi + saat. Daha ince değil.
- **Yön ayrımı YAPILAMAZ** (talep verisinde yön yok)
- **Durak bazlı analiz YAPILAMAZ** (iniş kaydı yok)

Mehmet'in cümlesiyle hedef: *"76O hattı, hafta içi, 18:00 → sefer artırılmalı"* diyebilmek.

---

## 2. ORTAM

- **Makine:** MacBook Air, macOS, kullanıcı `mehmetkucukbirer`
- **Python:** 3.9.6 · **venv:** `Desktop/iett-projesi/venv`
- Kurulu: pandas 2.3.3, numpy, matplotlib 3.9.4, streamlit 1.50.0, requests 2.32.5, scipy
- **Editör:** VS Code + Jupyter eklentisi · **Terminal:** zsh
- **Ana çalışma ortamı: Jupyter notebook.** Terminal çıktısı kırıldığı için 3. seansta geçildi.
  Kernel: `venv (3.9.6)`. Paket kurulumu: `%pip install X` (magic komut).

**Klavye:** Türkçe klavyede `~` ve `` ` `` ölü tuş. Komutlarda `~` kullanma. VS Code terminalini
`Ctrl+`` ` `` yerine **Terminal → New Terminal** menüsünden açtır.

**Terminal gerekirse:**
```bash
cd Desktop/iett-projesi
source venv/bin/activate
```

---

## 3. KLASÖR YAPISI (26 Ağustos 2026)

> **7. seansta temizlik yapıldı: 953 MB → 754 MB.** Silinenler: `veri/gtfs/` (198 M,
> API'ye geçilmişti, hiçbir aktif script kullanmıyordu) · `_to_delete/` · eski
> `Web Intelligence.csv` (saat sütunsuz ilk sürüm) · `01_ilk_bakis.ipynb` (tek hücrelik
> yarım dosya) · `cikti/talep_ozeti.csv` (hatalı script çıktısı) · `cikti/ilk_bakis.txt`.
> `02_talep_ozeti.py` **bilerek bırakıldı** — raporda anlatılacak 23'e bölme hatasının
> kanıtı, 887 bayt.

```
Desktop/iett-projesi/
├── venv/
├── veri/
│   └── yolculuk/
│       ├── hourly_transportation_202410.csv   262 M — ⚠️ EKSİK, Bölüm 5 (HACİM buradan)
│       ├── yon_verisi_2026_v3.csv             ★★ YÖN VERİSİ — 146.259 satır (Bölüm 4.5)
│       ├── yon_verisi_2026.csv                eski v2, %0,44 dolu — arşiv, kullanma
│       └── ornek_2024_5000satir.csv           Excel'de açılabilen örnek (485 K)
├── cikti/
│   ├── sefer_ham_20260806.csv         API'den çekilen 130.435 kalkış (ham)
│   ├── arz_ozeti.csv                  31.567 satır — hat+gün tipi+saat → sefer sayısı
│   ├── gercek_haftaici_profil.csv     13.899 satır — GERÇEK hafta içi talep (798 hat)
│   ├── talep_final.csv                gerçek hafta içi + sentetik hafta sonu
│   ├── doluluk.csv                    28.391 satır — ANA SONUÇ TABLOSU (676 hat)
│   ├── oneri_sefer_artir.csv          1.150 öneri (artırma)
│   ├── oneri_sefer_azalt.csv          1.049 öneri (azaltma) — %77'si sentetik
│   ├── veri_supheli_hatlar.csv        30 hat — "doluluk ≈ 0, veri kontrol edilmeli"
│   ├── arac_ihtiyaci_saatlik.csv      saat → ek araç ihtiyacı
│   ├── gercek_sure_hat_saat.csv       ★ hat+saat → ÖLÇÜLMÜŞ sefer süresi (11.906 satır)
│   ├── gercek_sure_hat.csv            ★ hat → ölçülmüş süre (yedek, 810 hat)
│   ├── gercek_sure_sistem_saat.csv    ★ saat → sistem medyanı (son çare)
│   ├── guzergahlar.json               ★ 676 hat · 55.564 durak koordinatı (2,3 MB)
│   ├── rota_yollari.json              ★ YOLA OTURTULMUŞ rota geometrisi (2,3 MB, 6. seans)
│   ├── taslak_harita.html             tek hat harita taslağı (11ÜS) — arşiv
│   ├── doluluk_yonlu.csv              ★ YÖN AYRIMLI doluluk (28.391 satır, 7. seans)
│   ├── oneri_sefer_artir_yonlu.csv    ★ YÖNLÜ öneri listesi (172 satır, 7. seans)
│   ├── yon_veri.json                  ★ dashboard yön bölümünün kaynağı (1,78 MB)
│   ├── doluluk_2026.csv               2026 hacim denemesi — Bölüm 6.14, KULLANILMIYOR
│   ├── oneri_sefer_artir_2026.csv     aynı deneme, arşiv
│   ├── oneri_sefer_azalt_2026.csv     aynı deneme, arşiv
│   ├── veri_supheli_hatlar_2026.csv   aynı deneme, arşiv
│   ├── dashboard_veri.json            dashboard'un veri kaynağı (676 hat, ~1,3 MB)
│   ├── index.html                     ★ DASHBOARD (masaüstü, React, paketlenmiş — Bölüm 9)
│   ├── mobil.html                     ★ TELEFON UYGULAMASI (PWA — Bölüm 9 madde 10)
│   ├── manifest.json                  ★ PWA künyesi (ad, ikon, tam ekran)
│   ├── sw.js                          ★ servis işçisi — çevrimdışı çalışma
│   ├── ikon-192.png / ikon-512.png    ★ PWA ikonları (amblemden üretildi)
│   └── iett-amblem.png                dashboard logosu
├── notlar/
│   ├── veri_kalitesi_notlari.md       rapor taslağı (1. seans)
│   ├── 01_ilk_bakis_aciklama.md       ders notu (2. seans)
│   ├── dashboard_ek_betikler/         ★ akordeon.js · menu.js · manset.js · okunurluk.js
│   │                                    + yon.js (7. seans — Bölüm 9 madde 11)
│   │                                    + kenar.js · giris.js (7. seans)
│   │                                    ⚠️ menu.js ARTIK EKLİ DEĞİL (7. seans)
│   ├── dashboard_sunum_rehberi.html   ★ mentora anlatma kılavuzu (6. seans)
│   ├── veri_modeli.html               ★ hangi dosya neyle birleşir (6. seans)
│   ├── veri_sureci.html               ★ adım adım veri işleme (6. seans)
│   └── sutun_kontrolleri.html         ★ 62 sütunun tek tek kontrolü (6. seans)
├── 01_ilk_bakis.py                    ARŞİV — CSV keşfi, API'ye geçiş gerekçesi
├── 02_talep_ozeti.py                  ⚠️ HATALI — 23 güne bölüyor, kullanma
│                                      (raporda anlatılacak hatanın kanıtı, silinmedi)
├── 03_arz_api.ipynb                   34 hücre — ARŞİV/KEŞİF (sırası bozuk, Bölüm 10)
├── 04_kontrol.ipynb                   çıktı doğrulama + yön incelemesi (5. seans)
├── 05_boru_hatti.py                   ★★ ANA ÇALIŞTIRILABİLİR DOSYA (5. seans)
├── 07_kayma_testi.py                  saat atfı kayması ölçümü (5. seans, Bölüm 6.6)
├── 09_gercek_sureler.py               ★ sefer arşivinden gerçek süreler (Bölüm 6.9)
├── 10_guzergah_koordinatlari.py       ★ her hattın sıralı durakları (harita için)
├── 11_canli_kopru.py                  ★ CANLI araç konumu köprüsü + yerel sunucu
├── 12_rota_yollari.py                 ★ durakları gerçek yola oturtur (OSRM, 6. seans)
├── 13_yon_orani.py                    yön oranının gün gün sağlaması (7. seans, Bölüm 6.13)
├── 14_yon_duzeltmesi.py               ★★ YÖN AYRIMLI DOLULUK (7. seans, Bölüm 6.13)
├── 15_boru_hatti_2026.py              2026 hacim denemesi — Bölüm 6.14, ARŞİV
│                                        (ekim haftası gelirse 2 satır değişip çalışır)
└── PROJE_DURUMU son durum.md          bu dosya
```

> **06, 07, 08 `# %%` hücre işaretleriyle yazıldı** — VS Code Interactive Window'da
> Shift+Enter ile hücre hücre çalışıyor, DataFrame'ler tablo olarak render ediliyor.
> Terminalden `python3 dosya.py` ile de çalışırlar. **Proje kökünde durmalılar** —
> `cikti/` içine konursa göreli yollar kayar (5. seansta bu hata yaşandı).

**★ `05_boru_hatti.py` — 5. seansta yazıldı, TEK YETKİLİ BORU HATTI.** Notebook'un dağınık
hücrelerinin doğru sırayla birleştirilmiş hali + araç hesabı + azaltma listesi.
Tek komutla **tüm** `cikti/` çıktılarını yeniden üretir:

```bash
source venv/bin/activate && python3 05_boru_hatti.py
```
> Yaklaşık 1-2 dakika sürer (çoğu Ekim 2024 CSV'sini okumakta geçiyor). API'ye sadece
> 1 istek atar (hat listesi) — 783 hatlık 4 dakikalık sefer çekimi yok,
> `cikti/sefer_ham_20260806.csv` diskten okunuyor.

### ÇALIŞTIRMA SIRASI — sıfırdan kurarken

```bash
source venv/bin/activate

python3 09_gercek_sureler.py          # 1) gerçek sefer süreleri   ~2 dk · 5 API isteği
python3 05_boru_hatti.py              # 2) tüm analiz çıktıları    ~2 dk · 1 API isteği
python3 10_guzergah_koordinatlari.py  # 3) harita koordinatları    ~10 dk · 676 API isteği
python3 12_rota_yollari.py            # 4) rotaları yola oturt     ~25 dk · OSRM (bir kez)
python3 11_canli_kopru.py             # 5) sunucu + canlı köprü    (sürekli çalışır)
```
Sonra **`http://localhost:8770`**.

- **1 ve 3 bir kez yeter** — verileri statik, dosyaya yazılıyor.
- **2'yi** eşik/varsayım değiştirdiğinde tekrar çalıştır (`05` olmadan `09`'un çıktısı
  kullanılmaz; `09` olmadan `05` açık hata verip durur).
- **4** sadece canlı konum katmanı için gerekli; onsuz da her şey çalışır
  (`python3 -m http.server` yeter) ama canlı katman devre dışı kalır.

**7 adım:** (1) hat listesi API · (2) arz · (3) gerçek talep · (4) sentetik hafta sonu ·
(5) doluluk · (6) öneriler + araç hesabı + şüpheli hat filtresi · (7) dashboard JSON.

**Öneri listelerindeki araç sütunları** (5. seansta eklendi, artık ayrı dosya gerekmiyor):
- `oneri_sefer_artir.csv` → `sefer_suresi`, `mevcut_arac`, `gereken_arac`, `ek_arac`
- `oneri_sefer_azalt.csv` → `onerilen_sefer`, `azalt_sefer`, `yeni_doluluk`, `kazanilan_arac`

Sefer verisini API'den **yeniden** çekmek gerekirse `03_arz_api.ipynb`'deki 10-11. hücreler
kullanılır (~4 dakika). Normal şartlarda gerekmez.

---

## 4. VERİ KAYNAKLARI

### 4.1. ARZ — İETT SOAP Web Servisi ✅

Doküman (v1.5):
https://data.ibb.gov.tr/dataset/53b985b6-24af-4fda-aa59-1b45dde2e665/resource/6efd7520-0fbf-421b-975a-a73cb9137ef2/download/tr_iett-web-servis-kullanm-dokumanv.1.5.pdf

Mentorun verdiği `_soap` yardımcı fonksiyonu kullanılıyor (`03_arz_api.ipynb` 1. hücre):
XML zarfı kurar → `requests.post` → `ET.fromstring` ile ayrıştırır. Metot adı `_json` ile
bittiği için sonuç XML içine gömülü JSON olarak gelir; `json.loads(res.text)` ile çözülür.

**Kullanılan ve çalıştığı doğrulanmış metotlar:**

| Servis yolu | Metot | Parametre | Ne verir |
|---|---|---|---|
| `UlasimAnaVeri/HatDurakGuzergah.asmx` | `GetHat_json` | `HatKodu` (boş = hepsi) | **783 hat**: SHATKODU, SHATADI, TARIFE, HAT_UZUNLUGU, SEFER_SURESI |
| `UlasimAnaVeri/PlanlananSeferSaati.asmx` | `GetPlanlananSeferSaati_json` | `HatKodu` | Hat bazında planlanan kalkışlar |
| `ibb360.asmx` (yol: `ibb/ibb360.asmx`) | `GetIettYolculukHat_json` | **`Tarih`** (büyük T), format **`yyyy-MM-dd`** | O günün en yoğun 50 hattı: Gun, Hat, Yolculuk |
| `FiloDurum/SeferGerceklesme.asmx` | `GetHatOtoKonum_json` | **`HatKodu`** (doküman `HatNo` diyor — **YANLIŞ**) | O hattaki araçların anlık konumu |
| `ibb/ibb.asmx` | `DurakDetay_GYY` | **`hat_kodu`** (küçük harf, alt çizgili!) | Hattın **sıralı durak listesi**: HATKODU, **YON**, SIRANO, DURAKKODU, DURAKADI, XKOORDINATI, YKOORDINATI, DURAKTIPI, ISLETMEBOLGE, ILCEADI |

**`DurakDetay_GYY` farklı çalışıyor:** Adı `_json` ile bitmediği için sonuç gömülü JSON değil,
düz XML gelir (`NewDataSet` etiketi altında satırlar). Ayrıştırma:
```python
nds = next((el for el in root.iter() if el.tag.endswith("NewDataSet")), None)
rows = [{c.tag.split("}")[-1]: c.text for c in row} for row in nds]
```
Parametre adı da diğerlerinden farklı: `hat_kodu` (diğerlerinde `HatKodu`). 5. seansta
test edildi, **çalışıyor** (34 hattı için 53 durak döndü).

**İki yerde kullanıldı:** (a) Bölüm 6.5 — 52 hattın yön eksikliğinin doğrulanması,
(b) `10_guzergah_koordinatlari.py` — dashboard harita katmanı. 676 hat için tek seferde
çekildi: **0 hata, 55.564 durak, 2,3 MB**, ~10 dakika (istekler arası 0,12 sn bekleme).

**⚠️ Doküman güvenilmez.** Üç kez yanıldı: `tarih` → `Tarih`, `yyyyMM-dd` → `yyyy-MM-dd`,
`HatNo` → `HatKodu`. Yeni bir metot denerken parametre adı varyantlarını `try/except` ile
döngüde denemek en hızlı yol.

**Diğer notlar:**
- Parametre adları **büyük/küçük harfe duyarlı** (XML etiketi oldukları için)
- Tarayıcıda `.asmx` sayfası "Policy Falsified" verir — normal, geçit GET'i engelliyor, POST çalışır
- `GetIettYolculukHat_json` arşivi **2024'e kadar** gidiyor; 2023 boş dönüyor
- **Türkçe karakterler düzgün** — GTFS'teki mojibake sorunu API'de yok

**⭐ `GetIettArsivGorev_json` — 5. seansta denendi, ÇALIŞTI, projenin en değerli kaynağı oldu.**

| Servis yolu | Metot | Parametre | Ne verir |
|---|---|---|---|
| `ibb/ibb360.asmx` | `GetIettArsivGorev_json` | **`Tarih`**, format **`yyyyMMdd`** | Günde ~56.000 **gerçekleşen sefer** kaydı |

Alanlar: `SHATKODU`, `SGUZERGAHKODU` (**yön içerir**: `14M_D_D0`), `SKAPINUMARA` (araç),
`DTBASLAMAZAMANI`, `DTBITISZAMANI`, `DTPLANLANANBASLANGICZAMANI`, `SGOREVDURUM`.

- Tarih formatı `/Date(1786096228000)/` — milisaniye epoch, regex ile ayıklanır
- `SGOREVDURUM`: `T` = tamamlandı (%94), `I`/`YK`/`A`/`B` = iptal/yarım
- **Bozuk kayıt var:** negatif ve milyonlarca dakikalık süreler. `5–400 dk` filtresi şart
- **Arşiv en az Ekim 2024'e kadar gidiyor** (20241016 test edildi: 56.435 kayıt)
- Kullanımı: **Bölüm 6.9** ve `09_gercek_sureler.py`

**6. SEANSTA DENENEN METOTLAR:**

| metot | sonuç |
|---|---|
| `GetFiloAracKonum_json` (parametresiz) | ✅ **ÇALIŞIYOR** — tek istekte **6.911 araç**, 1 MB. Alanlar: `Operator, Garaj, KapiNo, Saat, Boylam, Enlem, Hiz, Plaka`. **`Hiz` = aracın kendi hızı.** Son 2 dk'da bildiren 5.766, hareketli 2.138. ⚠️ **hat kodu YOK** — şehir geneli katman için uygun, hat bazlı için değil |
| `GetKaraKutuSeferBilgileri_json` | ❌ WSDL'de tanımlı, geçit **"Service Not Found"** |
| `GetUzulsuzKartKullanim_json` | ❌ geçit kapalı |
| `GetYolcuBilgilendirme_json` | ❌ geçit kapalı |
| `IETTPlakaServisi_Json` | ❌ geçit kapalı |

> **WSDL'den tam metot listesi çıkarılabiliyor:** `GET .../<yol>.asmx?wsdl`.
> `SeferGerceklesme.asmx`'te **36 metot** tanımlı ama çoğu geçitte kapalı.
> Parametre adları da WSDL'den okunuyor — doküman güvenilmez olduğu için en hızlı yol bu.

**`GetHatOtoKonum_json` tam alan listesi** (6. seansta doğrulandı):
`kapino, boylam, enlem, hatkodu, guzergahkodu, hatad, yon, son_konum_zamani, yakinDurakKodu`
> `yakinDurakKodu` **kullanılmadı** — trafik katmanındaki durak yakınlığı hesabını
> basitleştirebilir, ileride bakılabilir.

**⚠️ "500 HATASI" TEŞHİS EDİLDİ (6. seans) — çökme değil, KOTA.** Gövdede sebep yazıyor:
```
faultstring  : Policy Falsified
policyResult : status="Rate limit exceeded."
```
Ölçüm: ~86 başarılı istekten sonra kapandı, 3 dakikada açılmadı.
⚠️ **Blokluyken yoklamak cezayı uzatıyor** — tamamen susmak gerekiyor.

**⚠️ CANLI SERVİS DAKİKADA BİR TAZELENİYOR — ölçüldü (6. seans).**
```
14:38:05 → damga 14:37:59        14:39:06 → damga 14:38:59  (23 araç birden)
14:38:25 → damga 14:37:59  (0)   14:40:06 → damga 14:39:59  (22 araç)
14:38:46 → damga 14:37:59  (0)   14:41:06 → damga 14:40:59  (22 araç)
```
Yeni veri her dakikanın ~5. saniyesinde geliyor. **15 saniyede sormak 4 isteğin 3'ünü
boşa harcıyordu.** Dashboard 30 saniyeye çekildi (`TAZELEME` sabiti, `akordeon.js`).

**⚠️ TLS TUZAĞI (6. seans).** macOS'un Python 3.9'u **LibreSSL 2.8.3** ile derlenmiş.
Bazı sunucular (OSRM) modern TLS istiyor ve `requests` **"sslv3 alert handshake failure"**
alıyor. `curl` sistemin kendi TLS'ini kullandığı için çalışıyor:
```python
p = subprocess.run(["curl", "-s", "-m", "60", url], capture_output=True, text=True)
```
> Her çalıştırmada görülen `NotOpenSSLWarning` uyarısının sebebi bu. İBB adresleri
> etkilenmiyor, sadece bazı dış servisler.

**Hâlâ denenmemiş:** `GetDuyurular_XML`, `GetPlanaUyum_json`, `GetSeferZayi_json`,
`GetOtsPlanlananKm_json`, `GetKaraKutu_json`.

**`GetPlanlananSeferSaati_json` çıktı alanları:**
`SHATKODU, HATADI, SGUZERAH, SYON, SGUNTIPI, GUZERGAH_ISARETI, SSERVISTIPI, DT`

- **`SGUNTIPI`**: `I` = hafta içi (50.280), `C` = cumartesi (42.925), `P` = pazar (37.230)
- **`SSERVISTIPI`**: ÖHO 55.501 · Normal 29.057 · OAS 24.057 · Ara Dinlen 6.349 ·
  Tek Sof S. 6.125 · Gareli 5.729 · Tek Sof A. 3.617 → **hepsi sefer sayıldı** (Bölüm 6.2)
- **`DT`**: `"06:15"` metni. Saat = `pd.to_numeric(DT.str[:2], errors="coerce")`
- 783 hattan **775'i** veri döndürdü, toplam **130.435 kalkış**, 0 hata, ~4 dakika sürdü

### 4.2. TALEP — İBB açık veri CSV ⚠️

Kaynak: https://data.ibb.gov.tr/dataset/hourly-public-transport-data-set
Dosya: `hourly_transportation_202410.csv` — 262 MB, 2.770.720 satır, ayraç `,`

Sütunlar: `transition_date, transition_hour, transport_type_id, road_type, line,
transfer_type, number_of_passage, number_of_passenger, product_kind,
transaction_type_desc, town, line_name, station_poi_desc_cd`

**Kritik notlar:**
- `line` ve `line_name` **ters isimlendirilmiş** — hat kodu `line_name`'de
- `road_type == "OTOYOL"` filtresi şart (RAYLI ve DENİZ karışıyor)
- `number_of_passenger` kullanılıyor (`number_of_passage` aktarmayı çift sayar)
- `town` sütunu güvenilmez (15B Üsküdar hattı için "BAKIRKOY" yazıyor)
- **API'de saatlik yolcu verisi YOK** — bu taraf CSV'de kalmak zorunda
- Veri seti Ocak 2020 – Aralık 2024; Kasım/Aralık 2024 boş (187 bayt)

### 4.3. DİĞER AYLARIN TARAMASI ✅ (5. seansta yapıldı — eski "yapılacak" maddesi kapandı)

**Yöntem — dosya indirmeden boyut okuma.** İBB portalı CKAN üzerinde çalışıyor, kaynak
listesi tek istekle metadata olarak alınabiliyor (`size` alanı zaten JSON'un içinde):

```
https://data.ibb.gov.tr/api/3/action/package_show?id=hourly-public-transport-data-set
```
> 60 kaynak (Ocak 2020 – Aralık 2024) döner; her birinde `name`, `size` (bayt) ve indirme
> `url`'si vardır. `Content-Length` çekmeye bile gerek kalmadı.

**Boyut sonuçları (özet):**

| Yıl | Durum |
|---|---|
| 2020 | 354 MB – 1.008 MB (pandemi etkisi, düşük ama tutarlı) |
| 2021 | 707 MB – 1.249 MB · **istisna: Ekim 2021 sadece 41 MB (bozuk)** |
| 2022 | 1.179 MB – 1.462 MB (tutarlı) |
| **2023** | **1.304 MB – 1.702 MB — 12 ayın hepsi tutarlı** |
| 2024 | Ocak–Temmuz 1.615-1.815 MB (dolu) · **Ağustos 291 MB, Eylül 391 MB, Ekim 275 MB (eksik)** · **Kasım/Aralık 0 (boş)** |

**⚠️ Boyut tek başına yeterli değil — Ekim 2024 dersi.** Bu yüzden Mart 2023 açılıp
**içerik seviyesinde** doğrulandı (1,4 GB indirildi, `awk` ile tarih başına satır sayıldı):

| Kontrol | Sonuç |
|---|---|
| Toplam satır | 15.409.759 |
| Tarih kapsamı | **31 günün hepsi dolu**, hafta sonu dahil |
| Hafta içi | 440–550 bin satır/gün |
| Cumartesi (4,11,18,25) | 438–462 bin satır/gün |
| Pazar (5,12,19,26) | 351–375 bin satır/gün |
| Bozuk kayıt | boş `road_type`: **0** · geçersiz `number_of_passenger`: **0** |
| `road_type` dağılımı | OTOYOL %66,3 (10,2 M satır / 112,4 M yolcu) · RAYLI %29,8 · DENİZ %3,9 |
| OTOYOL filtresi sonrası | 31 günün hepsi hâlâ dolu, en düşük gün 209.781 satır / 1,92 M yolcu |

Karşılaştırma: Ekim 2024'ün sahte günleri 1.400–3.200 satırdı. Mart 2023'ün en zayıf günü
bunun **100 katından fazla** → gerçek veri, gürültü değil. **Mart 2023 %100 kullanılabilir.**

**Bonus ölçüm — sentetik çarpanlar sınandı.** Mart 2023'ün gerçek rakamlarından hafta sonu
oranı: **cumartesi ≈ %77, pazar ≈ %55**. Projede kullanılan varsayım %72 / %52 — yani
varsayım gerçeğe yakın çıktı, biraz muhafazakârmış (hafta sonunu olduğundan az tahmin ediyor).

### 4.4. NEDEN 2023'E GEÇİLMEDİ (bilinçli karar, 5. seans)

Mart 2023 tam olmasına rağmen **Ekim 2024'te kalındı.** Gerekçeler:

1. **Asıl kazanç hafta sonu olacaktı** — gerçek cumartesi/pazar ile sentetik veriye gerek
   kalmazdı. Ama Mehmet "hafta sonu verisini gerçek yapmaya gerek yok, böyle kalsın" dedi.
   O kazanç masadan kalkınca geçişin ana gerekçesi kayboldu.
2. **Hafta içi zaten iki sınamadan geçmişti** (Bölüm 6.1: Spearman 0,862 ve %5 mutlak fark).
3. **Zaman farkı büyürdü** — arz 2026'dan. Ekim 2024 ile 2 yıl, Mart 2023 ile 3 yıl fark
   olurdu; Bölüm 11 madde 4'teki metro/nüfus riski artardı.
4. **Tüm boru hattı yeniden kurulurdu**, kazanç azken maliyet yüksekti.

**Rapora yazılacak hali:** "Diğer aylar tarandı, 2023 verisinin tam olduğu içerik seviyesinde
doğrulandı, ancak şu gerekçelerle Ekim 2024'te kalındı." Bu, kontrol edilmemiş bir eksiklik
değil, **beyan edilmiş bir tercih.**

**Portalın kendi dosya adları hatalı olabiliyor:** Şubat linki `202202`, Mart `202203`,
Aralık `202512` (2024 olması gerekirken). URL'yi CKAN metadata'sındaki `name` alanıyla
eşleştirirken dikkat — 5. seansta bu yüzden bir kez yanlış dosya (Şubat 2020) indirildi.

### 4.5. ⭐ YÖN BİLGİLİ KART BASIŞ VERİSİ (7. seans)

Mentor SAP BusinessObjects ("Web Intelligence") üzerinden rapor çıkardı. **Üç sürüm geldi;
üçüncüsü kullanılıyor.** İlk ikisi durak kırılımlı olduğu için sorgu satır sınırına takılmış
ve veri %0,44 dolu gelmişti; durak sütunları çıkarılınca tam veri geldi.

| sürüm | dosya | satır | yolcu (7 gün) | durum |
|---|---|---|---|---|
| v1 | silindi | 2.112 | 84.357 | saat sütunu yok |
| v2 | `yon_verisi_2026.csv` | 2.380 | 84.357 | saat var, hacim %0,44 |
| **v3** | **`yon_verisi_2026_v3.csv`** | **146.259** | **~17,7 M** | ✅ **tam** |

> ⭐ **Ders: doğru sütunu istemek, daha çok veri istemekten etkili.** Durak kırılımı satır
> sayısını ~40 katına çıkarıp sorguyu sınıra tosluyordu. Üç sütun çıkarılınca aynı bilgi
> 61 kat fazla satırla geldi.

**v3 künyesi** — 10 MB · 7 sütun · **9–15 Ağustos 2026** (Pazar'dan Cumartesi'ye, hepsi dolu)

```
Tarih · Güzergah Kodu · Güzergah Yön · Güzergah Hat Kodu
Saat Tekil · Sefer Bazlı Yolculuk Sayısı · Sefer Bazlı Harcanan Kontör
```

**Tanecik:** `Tarih + Güzergah Kodu + Saat Tekil` → 146.259 satırda **6 tekrar**.

| gün | yolcu | hat |
|---|---|---|
| Pazartesi–Cuma | 2,56 – 2,63 M/gün | 778–780 |
| Cumartesi | 2.072.948 | 678 |
| Pazar | 1.513.177 | 615 |

**⭐ GÜZERGAH KODU — üç parça:**

```
TM8_G_D3970
 │   │   └── VARYANT  (D0 ana güzergâh · D#### alt varyant · D0( 64 - 107 ) parçalı)
 │   └────── YÖN      (G = GİDİŞ, D = DÖNÜŞ — `Güzergah Yön` sütunuyla birebir)
 └────────── HAT KODU
```

`sefer_ham`'in 2.729 güzergâh kodunun **2.705'i** (%99) bu dosyada var → iki kaynak
doğrudan birleşiyor. Format `GetIettArsivGorev_json`'daki `SGUZERGAHKODU` ile aynı.

> ⭐ **Bölüm 6.12'nin bağımsız onayı:** "G ve D gidiş/dönüş demek" varsayımı, İETT'nin
> kendi `Güzergah Yön` sütunuyla doğrulandı.

### TEMİZLİK — üç tür bozuk kayıt

| ne | kaç | ne yapıldı |
|---|---|---|
| `ARA+`, `SON+`, `ILK+` önekli kodlar | 10.772 | aktarma/ilk-son biniş kayıtları, güzergâh değil — **hepsi 0 yolcu**, elendi |
| `Güzergah Yön` = `-1` veya boş | 181 | elendi (%0,1) |
| `Yolculuk Sayısı` boş | 16.306 | kontör de aynı satırlarda boş, elendi |

**Filtre:** `Güzergah Kodu` üç parçaya bölünmeli ve orta parça `G` ya da `D` olmalı.
Sonrası: **99.166 temiz hafta içi satır · 773 hat · 13,06 M yolcu (5 gün).**

### DOĞRULAMA

| kontrol | sonuç |
|---|---|
| Saatlik şekil, 2024 gerçek verisiyle | **Pearson 0,964 · Spearman 0,953** |
| Hat × saat kapsaması | 11.800 / 13.899 = **%85** |
| Hafta içi günlük hacim | 2,61 M *(2024: 4,11 M)* |

**Hacim farkının açıklaması — Metrobüs + mevsim:**

```
2024 Metrobüs ailesi : 867.194 yolcu/gün
2026 dosyasında      :      98 yolcu/gün   → Metrobüs bu raporda YOK
────────────────────────────────────────────────────────────────
Metrobüs hariç: 2026 = 2.610.031 · 2024 = 3.245.544 → %80
```
%80, ağustos tatil etkisiyle uyumlu. **Veri eksik değil, mevsim farklı.** Metrobüs'ün
olmaması bizim için kayıp değil — Bölüm 6.7 uyarınca zaten analiz dışı.

### ⭐ HAFTA SONU ÇARPANI ÖLÇÜLDÜ — sentetik varsayımın doğrulaması

```
              varsayım (Bölüm 7)   Mart 2023   ÖLÇÜM (2026 v3)
cumartesi           %72               %77           %79
pazar               %52               %55           %58
```

Üç bağımsız kaynak aynı bölgede ve **varsayımımız muhafazakâr tarafta** — hafta sonu
talebini ~%8 eksik tahmin ediyor, yani azaltma önerilerini olduğundan **fazla** gösteriyor.

**KARAR (7. seans, Mehmet): sentetik hafta sonu KALIYOR.** Gerekçe: doğrusal ve sapması
küçük. Gerçek veriyle değiştirilmedi; ölçüm **doğrulama** olarak duruyor.
> Rapora böyle girmeli: *"Sentetik hafta sonu çarpanları sonradan gerçek ölçümle
> karşılaştırıldı; sapma cumartesi 7, pazar 6 puan ve muhafazakâr yönde."* Bu, varsayımı
> savunmanın en güçlü hâli — kontrol edilmiş ve yönü bilinen bir varsayım.

**Yan bulgu — kontör yolcu bileşimini veriyor** (hacmi değil): 06:00'da yolcu başına
25,36 TL, 23:00'te 18,45 TL. Sabah tam ücret ödeyen çalışan yoğun. Ücretsiz kartlar
0 kontör yazdığı için yoğunluk ölçüsü kontör değil yolcu sayısı olmalı. Rapora **mali
argüman** olarak girebilir: *"zirveye araç koymak en çok gelir getiren yolcuyu taşımak."*

---

## 5. ⚠️ EN KRİTİK BULGU — EKİM 2024 DOSYASI EKSİK

**Dosyada 31 gün değil, 18 tarih var. O 18 tarihten yalnızca 5'inde gerçek veri var.**

| Tarih | Gün | Yolcu (OTOYOL) |
|---|---|---|
| 2024-10-02 | Çarşamba | 4.103.807 |
| 2024-10-04 | Cuma | 4.081.069 |
| 2024-10-16 | Çarşamba | 4.199.850 |
| 2024-10-17 | Perşembe | 4.115.383 |
| 2024-10-18 | Cuma | 4.063.582 |

- **Dosyada görünen ama pratikte boş 13 tarih:** 1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 Ekim
  (her biri 1.400–3.200 yolcu — gürültü seviyesi)
- **Dosyada hiç olmayan 13 gün:** 19–31 Ekim
- **Beş geçerli günün hepsi hafta içi.** Cumartesi/pazar verisi YOK.
- Pazartesi ve salı da yok (Çar, Cum, Çar, Per, Cum)

**Sonuçları:**
1. Günlük ortalama için bölen **5**'tir, 23 değil. (`02_talep_ozeti.py` 23'e bölüyor →
   **4,6 kat hatalı** → o dosya artık kullanılmıyor.)
2. Günler arası fark yalnızca **%3,4** (4,06 M – 4,20 M) → 5 gün, hafta içi ortalaması için
   istatistiksel olarak yeterli. Mehmet bu konuda şüphelendi, ölçüp ikna olduk.
3. Hafta sonu gerçek veriyle analiz edilemez → sentetik üretildi (Bölüm 7).

**Nasıl bulundu:** Doluluk sayıları saçma çıkınca (34 hattı için 7.170 kişi/sefer) geriye doğru
kazıldı. Mehmet "1085 kişi nasıl biner" diye sordu, o soru bulguya götürdü.

**Kural (3. seansta eklendi):** Her yeni veri dosyasında **ilk kontrollerden biri tarih kapsamı**
olacak: `veri["tarih"].nunique()` ve `veri.groupby("tarih").size()`.

**Portalın kendi dosya adları da hatalı:** Şubat linki `202202`, Mart `202203`, Aralık `202512`.

---

## 6. DOĞRULAMALAR — ON DÖRT AYRI SINAMA YAPILDI

Projenin en güçlü tarafı bu bölüm. Rapora aynen girecek.

| # | Sınama | Sonuç |
|---|---|---|
| 6.1 | Talep verisi doğru mu? (API vs CSV) | ✅ doğrulandı, Spearman 0,862 |
| 6.2 | Hangi kalkışlar sefer sayılmalı? | ✅ geniş tanım doğru |
| 6.3 | Tarife eksik mi? (canlı araç konumu) | ✅ tarife doğru, şüphe çürüdü |
| 6.4 | Yön ayrımı yapılabilir mi? | ❌ 5. seansta "yapılamaz"dı → **6.13'te açıldı** |
| 6.5 | Tek yönlü görünen hatlar gerçek mi? | ⚠️ **52 hatta veri eksik** — dışlandı (5. seans) |
| 6.6 | Saat atfı kayıyor mu? | ⚠️ **evet, %8-23** — ölçüldü, düzeltilmedi (5. seans) |
| 6.7 | Metrobüs tam dışlandı mı? | ❌ **hayır, 6 kod kalmış** — düzeltildi (5. seans) |
| 6.8 | Azaltma listesi güvenilir mi? | ⚠️ **kırılgan** — 30 hat korumaya alındı (5. seansta 17'ydi) |
| 6.9 | Sefer süresi doğru mu? | ❌ **planlama değeriymiş** — gerçek süreler arşivden ölçüldü (5. seans) ⭐ |
| 6.10 | Biniş = anlık yolcu mu? | ❌ **hayır** — devir katsayısı eklendi, sonucun işareti değişti (5. seans) ⭐ |
| 6.11 | Arz verisi resmi tarifeyle tutuyor mu? | ✅ **birebir** — iett.istanbul ile karşılaştırıldı (5. seans) |
| 6.12 | Bir kalkış = bir tek yön seferi mi? | ❌ **hayır, 103 hatta tur** — düzeltildi, öneri 178→96 (6. seans) ⭐ |
| 6.13 | Yön kırılımı kurulabilir mi? | ✅ **evet** — hat+saat düzeyinde ÖLÇÜLDÜ, öneri 96→172 (7. seans) ⭐⭐ |
| 6.14 | Hacim de 2026'dan alınabilir mi? | ❌ **hayır** — ağustos zirvesi %71, öneri 8'e düşüyor (7. seans) ⭐⭐ |

### 6.1. API vs CSV — talep verisi doğru mu?

**a) Sıralama korelasyonu.** Ekim 2024 (CSV'den hesaplanan) ile Ekim 2025 (API'den çekilen)
en yoğun 50 hat karşılaştırıldı:

```
Ortak hat        : 34 / 50
Spearman         : 0,862
Ortalama kayma   : 7,7 sıra
```

İlk üç sıra (34, 34A, 500T) her ikisinde de aynı. → *"Talep 2024 seviyesinde sabit"* varsayımı
artık varsayım değil, **ölçülmüş**. (Spearman için `scipy` gerekti, `%pip install scipy` ile kuruldu.
Alternatif: `.rank().corr()` — scipy'siz aynı sonucu verir.)

**b) Mutlak sayı.** 34 (Metrobüs) hattı günlük yolcu:
- CSV, Ekim 2024, 5 geçerli güne bölünmüş: **733.550**
- API, 7 Ekim 2025: **770.713**
→ %5 fark, bir yıl arayla. Beş güne bölme düzeltmesini kanıtladı.
(23'e bölünce 98.731 çıkıyordu — yedide biri. Hatayı yakalatan sayı bu oldu.)

**c) Mevsim etkisi.** 4 Ağustos 2026'da 500T 8. sıraya düşüyor, ekimlerde 3. sırada.
Yaz tatili etkisi — metro açılması değil.

### 6.2. Servis tipi duyarlılığı — hangi kalkışlar sefer sayılmalı?

`SSERVISTIPI` sütununda şüpheli görünen dört kategori vardı (toplam **21.820 kalkış = %17**).
Çıkarılınca sonuç değişiyordu:

| Tanım | Satır | Medyan doluluk | 110 üstü |
|---|---|---|---|
| Geniş (hepsi sefer) | 29.686 | 46,0 | 3.869 |
| Dar (şüpheliler hariç) | 26.546 | 51,3 | 4.740 |

**Karar için saatlik dağılımlarına bakıldı:**

- `Gareli` (5.729) → 6-23 arası **düz dağılmış** (saatte 270-370). Garaj hareketi olsa sadece
  gün başı/sonu yoğunlaşırdı. **Normal sefer.**
- `Ara Dinlen` (6.349) → **iki keskin zirve**: 6-9 ve 15-18. Öğle arası boş.
  Zirve saat takviyesi deseni. **Normal sefer.**
- `Tek Sof S.` (6.125) → gün boyu yayılmış, öğlen tepe. **Normal sefer** (sabah vardiyası).
- `Tek Sof A.` (3.617) → gece 0-5 ve akşam 15-20 yoğun. **Normal sefer** (akşam/gece vardiyası).

**Sonuç: geniş tanım doğru, hepsi sefer sayılıyor.** Dar tanım duyarlılık aralığı olarak
raporlanacak.

### 6.3. Tarife eksik mi? — canlı araç konumuyla sınama

47 hat şüpheli göründü (zirve doluluğu >200, sefer aralığı 12-20 dk). Metrobüs gibi tarifeleri
eksik olabilir miydi?

`GetHatOtoKonum_json` ile o an yolda kaç araç olduğu çekildi. Hat listesindeki `SEFER_SURESI`
ile gerçek sıklık hesaplandı: `saatteki sefer ≈ (araç × 60) ÷ sefer süresi`

Ölçüm: 7 Ağustos 2026 Cuma, 09:27 (SAAT=9 tarifesiyle karşılaştırıldı)

| Hat | Yoldaki araç | Sefer süresi (dk) | Tarife | Tahmin |
|---|---|---|---|---|
| 11ÜS | 9 | 164,3 | 4 | 3,3 |
| 98 | 10 | 162,7 | 3 | 3,7 |
| 98KM | 9 | 148,7 | 3 | 3,6 |
| 15F | 5 | 135,7 | 3 | 2,2 |
| 14B | 15 | 99,1 | 7 | 9,1 |
| 15B | 15 | 66,6 | 15 | 13,5 |
| 78 | 14 | 147,4 | 4 | 5,7 |
| 500T | 27 | 273,4 | 12 | 5,9 |

**Sonuç: tarife doğru, şüphe çürüdü.** Metrobüs dışında eksik tarife yok. 11ÜS gerçekten
saatte 3-4 sefer yapıyor ve 371 kişi/sefer taşıyor. **Öneri listesi geçerli.**

Tek anomali **500T** (tarife tahminden yüksek) — muhtemelen ölçüm saati (zirve geçmiş).
Kısıt: ölçüm tek bir ana ait, farklı saatlerde tekrarlanmalı.

### 6.4. YÖN ANALİZİ — denendi, YAPILAMAZ olduğu kanıtlandı (5. seans)

**Mehmet'in sorusu:** *"76O Avcılar→Otogar yönü ile Otogar→Avcılar yönünün ortalamasını
alıyoruz. Belki gidiş yoğun, dönüş boş. Bunu ayırabilir miyiz?"* — meşru ve önemli bir soru.

**Cevap: HAYIR.** Gerekçe, doluluk formülünün iki tarafına bakınca netleşiyor:

```
doluluk = yolcu sayısı ÷ sefer sayısı
             ↑ PAY            ↑ PAYDA
```

| Taraf | Yön bilgisi var mı? | Kaynak |
|---|---|---|
| **PAYDA** (sefer sayısı) | ✅ **VAR** — `SYON`: G 79.356, D 51.079 | Arz API, `sefer_ham` |
| **PAY** (yolcu sayısı) | ❌ **YOK** | İstanbulkart verisi yön kaydetmiyor |

Payda yönlü, pay yönsüz → kesir tamamlanamaz. **Bu bir ay/yıl seçimi meselesi değil, veri
kaynağının yapısal eksikliği.** Kart okutma sistemi yolcunun hangi yöne gittiğini hiç
toplamıyor; 2020'den 2024'e tüm dosyalar aynı şemada, `direction` sütunu yok.

**Denenen ve çürütülen hipotez:** Talep CSV'sindeki `line` sütunu ("AVCILAR-ZINCIRLIKUYU"
gibi iki uç nokta yazıyor) gizlice yön taşıyor olabilir miydi? Mart 2023 dosyasında test
edildi — her hat için **tek bir sabit değer** çıktı:

```
34    → sadece "AVCILAR-ZINCIRLIKUYU"        (675.072 satırın hepsi)
76O   → sadece "CIHANGIR MAH. - AVCILAR - OTOGAR"
500T  → sadece "TUZLA-TOPKAPI"
```
→ `line` sütunu hattın uçlarını anlatıyor, gidiş/dönüş bilgisi taşımıyor. **Hipotez öldü.**

**Sonuç:** Çıktının çözünürlüğü **hat + gün tipi + saat** olarak kalıyor. Bu artık
"bakılmadı" değil, "bakıldı, veriyle mümkün değil" — rapora böyle yazılmalı.

> ⭐⭐ **GÜNCELLEME (7. seans): BU KISIT KALKTI.** Buradaki teşhis İBB açık veri CSV'si
> için doğru — o dosyada yön yok. Ama mentor İETT'nin kendi sisteminden **yön sütunlu**
> veri verdi (Bölüm 4.5, 146.259 satır). Yani kısıt kaynağın yapısından değil,
> **açık veri portalındaki dosyadan** geliyormuş.
> Yön oranı artık hat + saat düzeyinde ölçülüyor — bkz. **Bölüm 6.13.**
> Bu bölüm rapora **"nasıl kapandığının hikâyesi"** olarak girmeli: bir kısıtın
> yapısal mı yoksa dosyaya özgü mü olduğunu ayırt etmek, projenin öğrettiği şeylerden biri.

### 6.5. ⚠️ YENİ BULGU — 52 HATTIN ARZ VERİSİNDE DÖNÜŞ SEFERLERİ YOK (5. seans)

Yön incelemesi sırasında kazara çıktı, **öneri listesini etkileyen gerçek bir veri hatası.**

**Nasıl bulundu:** `sefer_ham` içinde `SYON` sayılınca 775 hattın dağılımı:

```
dengeli hat (%10'dan az fark) : 457
sadece G (dönüş hiç yok)      : 103   ← şüpheli
sadece D (gidiş hiç yok)      :   1   ← şüpheli
iki yönü var ama dengesiz     : 214
```

103 hattın isimlerine bakınca ("İNKILAP MAHALLESİ - ÜMRANİYE METRO", "KADIKÖY - ÜNALAN
MAHALLESİ") halka hat gibi durmuyorlardı → veri eksikliği şüphesi.

**Nasıl doğrulandı:** 104 şüpheli hattın hepsi için `DurakDetay_GYY` çağrıldı ve durak
ağında kaç yön olduğuna bakıldı. Sonuç **tam ortadan ikiye bölündü:**

| Durum | Hat | Yorum |
|---|---|---|
| Durak ağında **iki yön de var** | **52** | Hat fiziksel olarak çift yönlü ama `PlanlananSeferSaati` sadece gidiş kalkışlarını döndürmüş → **VERİ EKSİK** |
| Durak ağında da **tek yön** | **52** | Gerçekten tek yönlü/halka hat → sorun yok |

**Neden önemli:** O 52 hatta `sefer_sayisi` eksik sayılıyor (sadece gidiş) → payda küçük →
`doluluk = yolcu / sefer` **yapay yüksek** → hat gereksiz yere "sefer artırılmalı" listesine
giriyor. Metrobüs'le aynı hastalık, farklı sebep:

- **Metrobüs (34, 34A):** sefer verisi var ama gerçeği yansıtmıyor (saatte 2-10 kalkış
  listeleniyor, gerçekte 1-2 dakikada bir) → doluluk 667 kişi/sefer gibi imkânsız çıkıyordu
- **Bu 52 hat:** sefer verisinin bir yönü tamamen yok

Ortak nokta: **payda güvenilmez → doluluk hesaplanamaz.** Aynı gerekçeyle aynı muamele.

**Karar: 52 hat da analiz dışı bırakıldı.** Sentetik dönüş seferi üretilmesi tartışıldı ve
**reddedildi** — "dönüş ≈ gidiş" varsayımı hiç test edilmemişti ve etki küçüktü (1.169
öneriden 19'u); doğrulanmamış bir varsayım katmanı eklemek riski kazançtan büyüktü.

**Dışlanan 52 hat** (`05_boru_hatti.py` içinde `ARZ_EKSIK` sabiti):

```
11D, 11K, 11M, 11ST, 12, 130ŞT, 13H, 145M, 16YK, 19D, 22B, 25, 25C, 25S1, 25S2, 29A,
34A, 36, 36Z, 38Z, 46KT, 46T, 48S, 48U, 50A, 54HT, 54HŞ, 54P, 54T, 58S, 66Z, 70FY,
71T, 73B, 73F, 8Y, 90B, 92K, 9A, AND1Ş, AND2K, AND2S, EL2, K3, KM42, KM43, KM44,
MK19, MR42, MR60, PD1, UM13
```
> `34A` hem bu listede hem Metrobüs listesinde — iki ayrı sebepten dışlanıyor, zararsız.

**Etkisi ölçüldü:** Öneri listesinden 19 satır / 5 hat düştü (en çok **50A**: saat 19'da
225 kişi/sefer gösteriyordu). `doluluk.csv`'den 1.125 satır / 42 hat düştü (52'nin 10'u
zaten talep verisiyle eşleşmiyormuş).

**Kritik doğrulama:** Yeni boru hattı çalıştırıldıktan sonra, **kalan tüm hatların her bir
doluluk değeri eskisiyle birebir aynı** çıktı. Yani hesap bozulmadı, sadece güvenilmez
hatlar çıkarıldı.

---

### 6.6. SAAT ATFI KAYMASI — ölçüldü, düzeltilmedi (bilinçli karar, 5. seans)

**Sorun:** Arz tarafında her kalkışı **kalkış saatine** yazıyoruz. Ama 07:45'te kalkan
120 dakikalık bir sefer, asıl işini saat 8 ve 9'da yapıyor. Yani bir saatin arzı şişerken
diğerininki açıkta kalıyor. (Bölüm 11 madde 11'in ölçülmüş hali.)

**Test:** Her kalkışın yolda geçirdiği dakikalar saatlere bölünüp "o saatte yolda kaç araç
var" hesaplandı, kalkış saatine yazan yöntemle karşılaştırıldı (`07_kayma_testi.py`,
hafta içi, 44.676 kalkış):

| saat | eski (kalkış saati) | yeni (yolda geçen süre) | fark |
|---|---|---|---|
| 0 | 484,8 | 128,6 | −73,5% |
| 2 | 125,5 | 213,4 | +70,0% |
| 5 | 1.515,5 | 450,3 | **−70,3%** |
| 6 | 4.809,0 | 2.212,5 | **−54,0%** |
| 7 | 5.651,1 | 4.354,6 | **−22,9%** |
| 8 | 4.595,0 | 4.955,4 | **+7,8%** |
| 9 | 4.185,8 | 4.613,6 | **+10,2%** |

**Yorum:** Sabah 5-7'de otobüsler garajdan çıkıyor; eski yöntem bu kapasiteyi tamamen o
saate yazıyor, oysa araçlar 7-9 arasında çalışıyor. Sonuç: **erken sabah arzı şişmiş,
8-9 arzı eksik.** Gece saatlerinde ters yönde aynı etki (0-1'de kalkanlar 2-3'te yolda).

**Sonuçlara etkisi:**
- Saat 8'in açığı (%21,2) **biraz abartılı** — gerçek arz 4.595 değil 4.955
- Saat 7'nin açığı (%13,7) **olduğundan az görünüyor** — gerçek arz 5.651 değil 4.355
- Zirve saat 8'den 7'ye kayıyor ya da ikisi eşitleniyor

**Neden düzeltilmedi (Mehmet'in kararı, gerekçeler tartışıldı):**
1. Daha büyük bir belirsizlik zaten var: "sefer başına **biniş**" ≠ anlık doluluk
   (Bölüm 11 madde 3). Yanındaki %50+ sapmayı düzeltmeden bu %8-23'ü düzeltmek
   kusursuzluk yanılsaması yaratır.
2. Düzeltme yeni bir varsayım ekler: "yolcular sefer boyunca eşit biniyor" — gerçekte
   hat başında daha yoğun. Bir varsayım atıp yerine başkasını koymak olur.
3. Pratik sonuç değişmiyor: mesaj her hâlükârda *"sabah zirvesinde (7-9) kapasite yetersiz"*.
4. Kalan işler (azaltma listesi, GitHub, rapor) daha kritik.

**Rapora nasıl girecek:** "Fark edildi, ölçüldü, yönü ve büyüklüğü belirlendi; düzeltmenin
maliyeti/getirisi değerlendirilip yapılmadı." Ölçülmüş ve beyan edilmiş bir yanlılık,
gizlenmiş bir hata değil.

**Düzeltmek istenirse yol haritası:** Her kalkışın 1 seferlik kapasitesi, yolda geçirdiği
dakikalara oranla saatlere bölünür (toplam korunur). `05_boru_hatti.py`'nin 1. bölümü
değişir, gerisi zincirleme düzelir. Karar noktaları: (a) süresi eksik 2 hat (`18`, `18M`,
kalkışların %0,12'si) dışlanmalı, (b) gece yarısını aşan 4.503 kalkış (%3,88) döngüsel
yazılmalı, (c) `sefer_sayisi` kesirli olur, anlamı "o saate hizmet eden sefer karşılığı".

### 6.7. METROBÜS AİLESİ EKSİK DIŞLANMIŞTI (5. seans — azaltma listesi yazılırken bulundu)

**Nasıl bulundu:** İlk azaltma listesi çalıştırıldığında en üst 15 satırın **tamamı `34G`** çıktı:
saat 17'de **122 sefer**, **14,8 yolcu**, doluluk **0,1**. 30 saniyede bir otobüs kalkıyor ama
kimse binmiyor — imkânsız.

**Sebep:** Metrobüs ailesi 8 koda bölünmüş ama sadece `34` ve `34A` dışlanmıştı.

```
34G  122 sefer/saat   BEYLİKDÜZÜ-SÖĞÜTLÜÇEŞME
34AS 104              (hat listesinde yok)
34BZ  91              (hat listesinde yok)
34C   58              BEYLİKDÜZÜ-CEVİZLİBAĞ
34Z   44              ZİNCİRLİKUYU-SÖĞÜTLÜÇEŞME
34B   41              BEYLİKDÜZÜ-AVCILAR
34A   27  ·  34  25
```

**Asıl mekanizma — arz ve talep farklı kodlara yazılıyor:** Talep verisinde tüm Metrobüs
binişleri `line_name = "34"` altında toplanıyor (Bölüm 6.4'te görüldü: `line` sütunu hepsi
için "AVCILAR-ZINCIRLIKUYU"). Arz ise 8 ayrı koda bölünmüş. Sonuç: `34` şişiyor,
diğer yedisi boş görünüyor.

Gün ortalaması doluluk: `34B` **0,04** · `34Z` **0,05** · `34C` **0,07** · `34G` **0,19**

**Karar: 34 ailesinin tamamı analiz dışı.** `05_boru_hatti.py` içinde
`METROBUS = ["34","34A","34AS","34B","34BZ","34C","34G","34Z"]`.

**Etkisi:** doluluk 28.561 → **28.391** satır (−170), hat 680 → **676**.
**Artırma listesi hiç değişmedi** (1.150 öneri / 222 hat / 2.873 ek sefer — *5. seans
rakamları, Bölüm 6.12'deki bacak düzeltmesinden önce*) — düşen 170 satırın
tamamı "20 altı" tarafındandı. Yani bu hata **sadece azaltma listesini** kirletiyormuş.
Medyan doluluk 46,0 → 46,3.

### 6.8. AZALTMA LİSTESİ YAPISAL OLARAK DAHA KIRILGAN (5. seans)

**Rapora girecek ilke:** *Sıfıra yakın doluluk çoğu zaman gerçek boşluğu değil, veri atfı
hatasını gösterir.* Bir hattın yolcuları başka kod altında kaydedilmişse doluluk ≈ 0 çıkar
ve liste "burayı boşalt" der — tehlikeli bir yanlış. Artırma listesinde bu risk yok
(veri hatası orada hattı listeden düşürür, listeye sokmaz).

**Uygulanan koruma:** Hafta içi **gün ortalaması** doluluğu **5 kişi/sefer altındaki hatlar**
azaltma listesine alınmıyor; ayrı bir "veri doğrulanmalı" listesine yazılıyor
(`cikti/veri_supheli_hatlar.csv`, **30 hat** — 5. seansta 17'ydi, güncel çıktıda 30).

```
SG-1 0,58 · SG-2 0,64 · KA-2 0,85 · HA-2 0,97 · 76B 1,06 · KA-1 1,10
48C 1,93 · BA-2 2,56 (günde 438 sefer / 1.122 yolcu) · 16D 2,78 · 18D 2,90 ...
```
> Hepsi harf önekli özel/servis hatları. İETT sefer başına 2 yolcu taşıyan bir hattı
> yıllarca işletmez → veri şüphesi, gerçek boşluk değil. **Öneri üretmiyoruz, işaretliyoruz.**

### 6.9. ⭐ EN BÜYÜK BULGU — `SEFER_SURESI` ÖLÇÜM DEĞİL, GERÇEK SÜRELER ARŞİVDE VAR

**Nasıl başladı:** Mehmet "ek araç ve sefer sayısı çok yüksek olanları ayırıp sağlamasını
yapalım" dedi. Uç değerler `500T` (+77 araç) ve `11ÜS` (+27 araç) idi.

**Adım 1 — canlı araç sayımı sapmayı gösterdi.** 26 hat için `GetHatOtoKonum_json` ile o an
yolda kaç araç olduğu sayıldı, tarifenin ima ettiğiyle karşılaştırıldı:

```
oran (canlı ÷ tahmin) medyanı : 0,74
oran ile sefer süresi korelasyonu (Spearman) : −0,587
```
Hat uzadıkça araç sayısını sistematik olarak fazla tahmin ediyorduk. 500T'de oran 0,40.

**Adım 2 — `SEFER_SURESI` bir formül çıktısı.** Tüm hatlarda `HAT_UZUNLUGU ÷ SEFER_SURESI`
hesaplandı:

| | değer |
|---|---|
| Uzunluk–süre korelasyonu | **0,9842** |
| Hatların %63,4'ü | 12,0–13,0 km/sa bandında |
| İkinci küme (51 hat) | ~24,8 km/sa — tam iki katı |

Ölçülmüş süre olsaydı ekspres hatlar yüksek, şehir içi hatlar düşük hız gösterirdi.
Hepsinin tek bir sayıda toplanması **planlama değeri** olduğunu kanıtlıyor.

**Adım 3 — iki kümenin sırrı: tek yönlü hatlar.** Durak ağıyla karşılaştırıldı:

| | ~24,8 km/sa kümesinde |
|---|---|
| Durak ağında **tek yönlü** 52 hat | **46'sı (%88)** |
| Durak ağında **çift yönlü** 52 hat | **0'ı** |

Durak koordinatlarından gerçek uzunluk da ölçüldü (haversine): `HAT_UZUNLUGU` **tek yön**
uzunluğu (500T: API 56,77 km · G yönü 53,07 · D yönü 52,18). Sonuç: çift yönlü hatlarda
`SEFER_SURESI` **gidiş+dönüş** süresi, tek yönlü hatlarda tek tur. Her iki sınıfta da
gerçek hız ~25 km/sa çıkıyor — tutarlı.

**Adım 4 — `÷120` düzeltmesi denendi, canlı ölçüm ONAYLAMADI.**

| formül | oran medyanı | 1'e ort. uzaklık |
|---|---|---|
| planlanan ÷ 60 (ilk hali) | 0,71 | 0,27 |
| planlanan ÷ 120 (düzeltme) | 1,41 | 0,52 |

Uzun hatlarda düzeldi (500T 0,40→0,81), kısa hatlarda bozdu (8A 1,10→2,21). Demek ki
yapısal iddia doğru olsa bile planlama değeriyle çalıştığımız sürece sonuç tutmuyor.

**Adım 5 — ÇÖZÜM: gerçekleşen sefer arşivi.** Devir dosyasında "denenmemiş" diye duran
`GetIettArsivGorev_json` denendi ve **çalıştı**:

```
ibb/ibb360.asmx · GetIettArsivGorev_json · parametre Tarih (yyyyMMdd)
→ SHATKODU, SGUZERGAHKODU (yön içerir!), SKAPINUMARA (araç plakası),
  DTBASLAMAZAMANI, DTBITISZAMANI, DTPLANLANANBASLANGICZAMANI, SGOREVDURUM
```
Bir günde ~56.000 gerçekleşen sefer kaydı. **Arşiv Ekim 2024'e kadar gidiyor** — yani
talep verimizin tam olarak aynı günlerini çekebiliyoruz.

**Adım 6 — üç formül canlı ölçümle yarıştırıldı (24 hat):**

| formül | oran medyanı | 1'e ort. uzaklık |
|---|---|---|
| planlanan ÷ 60 | 0,71 | 0,27 |
| planlanan ÷ 120 | 1,41 | 0,52 |
| **GERÇEK SÜRE ÷ 60** | **1,16** | **0,20** ← kazanan |

Gerçek süre kullanınca **tek yön / gidiş-dönüş tartışması da ortadan kalkıyor**: arşivdeki
her görev zaten "bir kalkışın aracı kaç dakika meşgul ettiği"ni veriyor, doğru birimde.
Kalan %16 fark terminal beklemeleri ve servis dışı araçlarla açıklanıyor.

**Nihai formül:**
```
araç = sefer sayısı × gerçek sefer süresi (hat, saat) ÷ 60
```

**Mevsim tuzağı — fark edildi ve kaçınıldı.** İlk deneme 7 Ağustos 2026 verisiyle yapıldı:

| | medyan sefer süresi |
|---|---|
| Ağustos 2026 (yaz tatili) | 59,8 dk |
| **Ekim 2024 (okul dönemi)** | **66,3 dk** |

Ağustos süreleriyle Ekim talebini birleştirmek araç ihtiyacını **%11 eksik** gösterirdi.
Bu yüzden arşiv, talep verisiyle **aynı 5 günden** çekildi (2, 4, 16, 17, 18 Ekim 2024).

**Saatlik değişim büyük** (Ekim 2024, tüm hatlar medyanı):

```
17:00 → 81,1 dk   ·   16:00 → 76,8   ·   07:00 → 75,3   ·   08:00 → 70,8
23:00 → 48,7 dk   ·   22:00 → 50,5   ·   21:00 → 51,6
```
Zirve/boş oranı **1,67**. Sabit bir süre kullanmak zirvede araç ihtiyacını eksik gösterir.

**Planlanan süre hat bazında iki yöne de sapıyor:**

| hat | planlanan | gerçek | fark |
|---|---|---|---|
| 500T (07:00) | 273 dk | **170 dk** | %38 kısa |
| 14ES (07:00) | 126 dk | **217 dk** | %72 uzun |
| 98 (16:00) | 163 dk | **250 dk** | %53 uzun |

Öneri listesindeki hatlarda gerçek/planlanan medyanı **1,05** — yani ortalamada doğru ama
**tek tek hatlarda ±%70 şaşırıyor.** Ortalamaya bakıp "sorun yok" demek yanıltıcı olurdu.

**Kapsama:** Hafta içi 10.578 hat+saat çiftinin **%95'inde** hat+saat düzeyinde gerçek süre
var, %4'ünde hat geneli medyanı, %1,4'ünde sistem saat medyanına düşülüyor (üç kademeli arama).

### 6.9b. YARIM KALMIŞ GÖREV FİLTRESİ (Mehmet fark etti, eklendi)

İlk sürümde sistem medyanı saat 3'te **32,6 dakikaya** düşüyordu — komşu saatler 58-64 iken.
Kaynağı: 11ÜS gibi ~90 dakikalık bir hatta "7 dakikalık sefer" kayıtları. Bunlar gerçek
sefer değil, yarım kalmış/hatalı kaydedilmiş görevler. `5–400 dk` aralık filtresi bunları
yakalamıyor çünkü 7 dakika teknik olarak aralıkta.

**Çözüm:** Sabit dakika eşiği işe yaramaz (hatlar 10–270 dk arası değişiyor). Her sefer
**kendi hattının medyanıyla** kıyaslanıyor:

```python
hat_medyan = hepsi.groupby("SHATKODU")["sure"].transform("median")
hepsi = hepsi[hepsi["sure"] >= hat_medyan * 0.40]
```

**Etkisi — cerrahi:** 3.410 sefer elendi (%1,5). Genel medyan 66,3 → 66,8 (gerçek seferlere
dokunmadı). Saat 3 sistem medyanı 32,6 → 41,3. Zirve araç 908 → 924.

**Saat 3 hâlâ komşularından düşük — ama bu veri hatası değil.** O saatte İstanbul'da sadece
**3 hat, 14 sefer** var (saat 8'de 704 hat, 13.771 sefer). Üstelik o 3 hat saat 13'te
98,9 dakika sürerken saat 3'te 57,2 dakika sürüyor — gece trafiği olmadığı için gerçekten
hızlılar. Yani düşük değer doğru, sadece çok az örneğe dayanıyor.

### 6.10. ⭐ DEVİR KATSAYISI — modelin en büyük varsayımı sayısallaştırıldı (5. seans)

**Nasıl başladı:** Mehmet "500T için 48 ek araç gerçekçi gelmedi, böyle çok örnek var" dedi.
Sezgisi modelin en kırılgan yerini buldu.

**Sorun:** `gereken_sefer = yolcu ÷ 110` hesabı, **binen herkesin seferin sonuna kadar
oturduğunu** varsayıyor. Oysa talep verisi **biniş** sayıyor (İstanbulkart inişte
okutulmuyor). 500T Tuzla–4.Levent 57 km; Kartal'da binen Bostancı'da iniyor, koltuk
aynı seferde birkaç kez doluyor.

**Devir = sefer boyunca toplam biniş ÷ araçtaki anlık yolcu.** Şimdiye kadar örtük
olarak **1** alınmıştı.

**Duyarlılık — tek varsayım her şeyi belirliyor:**

| devir | öneri satırı | hat | ek sefer | zirve ek araç |
|---|---|---|---|---|
| **1,0** | 1.129 | 216 | 2.812 | **906** |
| 1,5 | 289 | 99 | 490 | 253 |
| 2,0 | 69 | 33 | 95 | 72 |
| 2,5 | 19 | 10 | 21 | 18 |

**Veriden tahmin — yöntem:** 478 hattın zirve doluluğu bantlandı, her bandın
**90. yüzdeliğine** bakıldı (İETT'nin o hat tipinde tolere ettiği pratik tavan).
Kısa hatta devir olamaz → o bandın tavanı doğrudan araç kapasitesidir.

**İlk deneme — SÜREYE göre bantlama:**
```
0-30 dk → 113   45-60 → 143   60-80 → 180   80-100 → 223   100-130 → 254
devir:    1,00         1,27         1,59          1,98           2,25
```
> **Yan bulgu:** 30 dakikanın altındaki hatların tavanı **113**, bizim kapasite
> varsayımımız **110**. İki sayı birbirini bilmeden buluştu — projenin en temel
> varsayımının bağımsız doğrulaması.

**Kontrol istendi, iki sorun çıktı:**

1. **Yöntem duyarlı.** UZUNLUĞA göre bantlayınca devir 8 km'den sonra **düzleşiyor**
   (1,67 · 1,57 · 1,76 · 1,55 · 1,80 · 1,98 — ortalama ~1,7), süreye göre ise sürekli
   artıyor. Aynı veri, iki farklı cevap. Mantık uzunluk lehine: uzun hatta binen yolcu
   da daha uzun gidiyor, oran sabit kalıyor.
2. **Çapa varsayımı tam doğru değil.** "Kısa hatta devir yok" dedik ama kısa hatların
   **%5'i** hâlâ 110 üstü anlık yolcu gösteriyor (en yüksek 256). Demek ki kısa hatlarda
   da devir var → 113'lük tavan zaten bir miktar devir içeriyor.

**⚠️ VE DAİRESELLİK:** Devir mevcut doluluk seviyelerinden türetildi, yani *"İETT bugün
doğru sıklıkta işletiyor"* varsayımı içeri girdi. Projenin iddiası ise tam tersi.
Bu yüzden bu bir **ölçüm değil, çıkarım**.

**Benimsenen model (uzunluk tabanlı, basit ve savunulabilir):**
```python
DEVIR_KISA_ESIK = 8.0    # km
DEVIR_UZUN      = 1.7
devir = 1.0 if uzunluk < 8 else 1.7
```
Gerekçe: veri 8 km üstünde düz bir katsayı gösteriyor · tek sayı mentora bir cümleyle
anlatılıyor · düzeltmesi tek satır · süre bantlarının gizli şekil varsayımını taşımıyor.

**Uygulama:** Kıyas artık biniş üzerinden değil, tahmini anlık yolcu üzerinden:
```
etkin_doluluk  = doluluk / devir          → araçtaki tahmini yolcu
etkin_kapasite = 110 * devir              → sefer başına biniş tavanı
gereken_sefer  = ceil(yolcu / etkin_kapasite)
```
Azaltma eşikleri de (20 ve 40) anlık yolcu cinsinden uygulanıyor — uzun hatta 20 biniş,
20 yolcu demek değil. `doluluk.csv` artık `devir`, `etkin_kapasite`, `etkin_doluluk`
sütunlarını da taşıyor.

**Doğrulama:** Dört hatta elle hesaplanıp kod çıktısıyla karşılaştırıldı, birebir tuttu
(500T 247,4÷2,3=107,6 · 11ÜS 371÷2,0=185,5 · 19F 229÷1,6=143,1 · 41N 363÷1,0=363,0).

### DEVİR = 1,7 KABUL EDİLDİ (Mehmet'in kararı, 5. seans)

**Tanım:** Bir koltuğun tek bir sefer boyunca kaç farklı kişiye hizmet ettiği.
Tuzla'da binen Kartal'da iner, yerine başkası biner → koltuk iki kez dolduysa devir 2.

**⚠️ Uzunluğa göre ama ORANTILI DEĞİL.** Uzunluk sadece iki grubu ayırmak için kullanılıyor:
```
< 8 km  → 1,0    (kısa hat, yolcu neredeyse sonuna kadar gidiyor)
≥ 8 km  → 1,7    (uzun hat, koltuk ortalama 1,7 kez doluyor)
```
"40 km hatta devir 4 olsun" DENMEDİ — ölçüm bunu desteklemiyor. 8 km'den sonra devir
düzleşiyor (bant değerleri 1,55–1,98). Sebebi: uzun hatta binen yolcu da daha uzun
mesafe gidiyor, oran sabit kalıyor.

**DUYARLILIK — 0,1'lik değişim sonucu ~%27 oynatıyor:**

| devir | öneri | hat | ek sefer | zirve araç | 1,7'ye göre |
|---|---|---|---|---|---|
| 1,5 | 299 | 102 | 507 | 259 | **+%60** |
| 1,6 | 225 | 85 | 354 | 204 | +%26 |
| **1,7** | **174** | **68** | **271** | **162** | — |
| 1,8 | 136 | 57 | 201 | 116 | −%28 |
| 2,0 | 81 | 38 | 114 | 78 | −%52 |

Ölçülen bandın uçlarında (1,55–2,0) zirve araç **78 ile 259** arasında geziyor.
Yani zirve araç rakamının **±%50 belirsizliği** var.
*(Buradaki 164 rakamı 5. seansa aittir; bacak düzeltmesinden sonra **97** oldu —
güncel duyarlılık tablosu Bölüm 6.10b'de.)*

**⭐ ÖNEMLİ — belirsizlik sıralamayı BOZMUYOR.** Devir katsayısı tüm hatlara aynı
uygulandığı için 500T, 98, 11ÜS hangi sırayla kritikse öyle kalıyor. Değişen sadece
eşiği geçen hat sayısı ve mutlak rakamlar.
→ *"Hangi hat, hangi saat" cevabı sağlam; "kaç araç" cevabı belirsiz.*

**RAPORDA NASIL SUNULACAK — aralık olarak, tek sayı değil:**
> *"Zirve saatte (08:00) **97** ek araç gerekiyor — koltuk devri 1,7 kabulüyle.
> Katsayının ölçülen makul aralığında bu sayı **23 ile 633** arasında değişiyor.
> Katsayı İETT'nin kendi yolcu sayım (APC) verisiyle netleşir. Buna karşılık
> **hangi hat, hangi saat** sorusunun cevabı katsayıdan bağımsızdır — devir tüm
> hatlara aynı uygulandığı için sıralama değişmez."*
>
> *(Güncellendi: 6. seans. Eski rakamlar 164 / 78-259 / 906 idi, bacak düzeltmesinden
> önceki veriye aitti.)*

**Mentora sorulacak soru:** *"Saatlik biniş sayısını araç ihtiyacına çevirirken hangi
devir/doluluk katsayısını kullanıyorsunuz? Bir seferdeki toplam biniş ile aynı andaki
maksimum yolcu arasındaki tipik oran nedir?"* — Cevap gelirse model çıkarımdan ölçüme
geçer, tıpkı sefer sürelerinde olduğu gibi (Bölüm 6.9).

### 6.10b. ⭐ DEVİR BAĞIMSIZ KAYNAKTAN ÖLÇÜLDÜ (6. seans)

Bölüm 6.10'daki 1,7 bir **çıkarım**tı ve dairesellik taşıyordu (mevcut doluluk
seviyelerinden türetilmişti). 6. seansta **tamamen bağımsız** bir ölçüm bulundu.

**Kaynak:** İBB Açık Veri — *2012 Ulaşım Ana Planı Hanehalkı Anketi*
(`ulasim-ana-plani-hanehalki-anketleri`, 115 MB CSV, **1.179 sütun**).
İçinde `aractur_N.M` (araç türü) ve **`aracicisure_N.M` (araç içinde geçen süre)** var.

**Yöntem:**
```
devir = hattın TEK YÖN sefer süresi ÷ ortalama yolcunun araç içi süresi
```
Sefer 62 dk sürüyor, yolcu ortalama 31 dk biniyorsa koltuk ~2 kez doluyor.

**Ölçüm:** "BELEDİYE OTOBÜSÜ" + "ÖZEL HALK OTOBÜSÜ" süzülünce **8.699 yolculuk bacağı**:

```
araç içi süre : ortalama 31,1 dk · medyan 30 · %25→15 · %75→40 · %90→60
tek yön sefer süresi medyanı (bizim ölçümümüz) : 61,7 dk
→ SİSTEM DEVRİ = 61,7 / 31,1 = 1,98
```

**Süre bandına göre:** <30 dk → 1,00 · 30-50 → 1,31 · 50-70 → 1,92 ·
70-100 → 2,63 · 100+ → 3,65

**ÜÇ YÖNTEMİN KIYASI:**

| yöntem | devir | niteliği |
|---|---|---|
| Projede kullanılan | **1,70** | varsayım |
| Doluluk yüzdeliğinden (temiz hatlarla, 6. seans) | 1,79 – 2,32 | çıkarım (dairesel) |
| **Hanehalkı anketinden** | **1,98** | **ölçüm — bağımsız** |

Üçü de aynı bölgede. Bu, 1,7'nin **dışarıdan doğrulaması** — ve bu yöntemde dairesellik
yok, çünkü doluluk verisine hiç bakmıyor.

**⚠️ Üç kısıt, rapora girmeli:** (a) veri **2012**'den — 14 yıllık, ama ortalama seyahat
süresi hacimden çok daha kararlı; (b) **beyana dayalı** — ham değerler 10/15/20/30/45/60,
insanlar yuvarlıyor (medyanın tam 30 çıkması bunun izi); (c) **hat bazında değil** — anket
"otobüs" diyor, hangi hat demiyor.

**KARAR (6. seans): 1,7'de kalındı.** Gerekçe: 18 Ağustos'ta gelecek yön verisi zaten
her şeyi yeniden hesaplatacak; katsayıyı iki kez değiştirmek yerine bu ölçüm elde tutulup
yeni veriyle birlikte tek seferde karar verilecek.

### DUYARLILIK TABLOSU (6. seans — düzeltilmiş veriyle)

| devir | öneri | hat | ek sefer | zirve ek araç |
|---|---|---|---|---|
| 1,0 | 802 | 183 | 2.039 | **633** |
| 1,3 | 314 | 97 | 633 | 255 |
| 1,5 | 167 | 66 | 305 | 148 |
| **1,7** | **96** | **41** | **162** | **97** |
| 2,0 | 38 | 16 | 60 | 40 |
| 2,3 | 25 | 11 | 32 | 23 |

**⭐ Belirsizlik SIRALAMAYI bozmuyor** — devir tüm hatlara aynı uygulandığı için 500T,
14ES, 11ÜS hangi katsayıyla bakarsan bak en üstte. *"Hangi hat, hangi saat"* cevabı sağlam;
*"kaç araç"* cevabı belirsiz.

> ⚠️ **Yüzdelik yönteminin yapısal sorunu (6. seansta netleşti):** deviri dolulukların
> 90. yüzdeliğinden türetip sonra "90. yüzdeliğin üstündekileri" öneri saymak, liste
> uzunluğunu veriden çok **yüzdelik seçimimizin** belirlemesi demek. Üstelik uzun hatlar
> kalabalık olduğu için "kalabalık"ı "devir yüksek" diye okuyup aradığımız sorunu siliyor.
> Bu yüzden kademeli devire geçilmedi. Hanehalkı anketi yöntemi bu tuzağı taşımıyor.

---
### 6.11. ARZ VERİSİ RESMİ TARİFEYLE KARŞILAŞTIRILDI (5. seans)

Mehmet `iett.istanbul`'daki 500T sayfasına bakıp "sefer sayısı 13'ten kat kat fazla" dedi.
Kontrol edildi — **karışıklık saat/gün ayrımındaydı, veri doğruydu.**

| resmi sayfa (500T) | İş Günleri | Cumartesi | Pazar |
|---|---|---|---|
| ŞİFA SONDURAK KALKIŞ | 117 | 117 | 117 |
| 4.LEVENT METRO KALKIŞ | 117 | 117 | 117 |
| 4.LEVENT (2. varyant) | 1 | 1 | 1 |
| **toplam** | **235** | 235 | 235 |

Bizim veri: iş günleri yön D 117 + yön G 117 = **234**. Fark 1, ikinci varyantın sayım
sınırından. **13 sayısı ise sadece 07:00-07:59 arasıydı** — günün tamamı değil.

Ayrıca 76O için dakika dakika karşılaştırıldı ve **birebir tuttu**:
```
Cihangir kalkış, iş günleri : 05:35 05:55 06:20 06:30 06:40 06:55 07:10 …
bizim veri (SYON=G, SGUNTIPI=I) : aynı
```
→ `SYON` = kalkış yönü · `SGUNTIPI` = gün tipi (I/C/P) · `DT` = dakikası dahil kalkış saati.

**Anlamı:** Kullandığımız tarife verisi İETT'nin halka açık tarifesiyle örtüşüyor.
Ayrıca **dakika seviyesinde tarife üretebileceğimizi** gösteriyor (Bölüm 13, sefer planı).


### 6.12. ⭐⭐ EN BÜYÜK DÜZELTME — 103 HATTA "BİR KALKIŞ" = GİDİŞ+DÖNÜŞ (6. seans)

**Nasıl başladı:** Mehmet canlı haritada 98 hattının bütün araçlarının tek yön göründüğünü
fark etti. "G ve D gidiş dönüş demek, oradan türet" diye ısrar etti. Asistan önce durak
listesine bakıp "halka değil, demek ki tek yön" diyerek kapatmıştı — **yanlış testti**,
çünkü durak listesi tanımı gereği tek yönlüdür; bir *görev* iki listeyi peş peşe kullanabilir.

**Sorun:** 98'in tarifesi **161 G / 15 D**. Bir hat günde 161 gidiş yapıp 15 dönüş yapamaz —
otobüsler bir uçta birikirdi. Aynı desen 103 hatta var.

**ÜÇ BAĞIMSIZ KANIT:**

**(a) Ölçülen hız tam yarısı.** Tek yön uzunluğu ÷ ölçülen sefer süresi:

| sınıf | hat | ima edilen hız |
|---|---|---|
| Dengeli (azınlık yön > %35) | 473 | **17,2 km/sa** |
| Dengesiz (azınlık yön < %15) | 138 | **8,2 km/sa** |

Oran **2,09** — tam iki kat. 98 için: 29,6 km / 197 dk = 9,0 km/sa (bir otobüs için imkânsız);
gidiş+dönüş kabul edilince 18 km/sa — makul.

**(b) Aynı aracın görev dizisi.** Arşivden (16 Ekim 2024):

```
500T (dengeli)   C-305   G(124dk) D(149dk) G(180dk)
                 C-307   G(163dk) D(157dk) G(181dk) D(234dk)
98   (dengesiz)  A-1682  G(251dk) G(160dk)
                 A-1736  G(187dk) G(209dk) G(231dk) G(136dk)
```
> 500T'de araç gidip geliyor. 98'de arka arkaya dört kez "G" — bir otobüs dönmeden
> aynı yöne dört kez gidemez. **Kesin kanıt bu.**

**(c) Düzeltme sonrası dağılımlar çakışıyor.** Dengesiz hatların uzunluğu ×2 alınınca:

| | çeyrekler (km/sa) |
|---|---|
| gidiş+dönüş (×2 düzeltilmiş) | 13,2 / **16,5** / 24,6 |
| tek yön (dokunulmadı) | 13,7 / **16,7** / 20,1 |

Medyanlar 16,5 ve 16,7 — sınıflandırma doğrulanmış oldu.

**SINIFLANDIRMA:** azınlık yön payı **sıfır değil ama %15'in altında** → görev gidiş+dönüş.
**103 hat.** Sıfır olanlar hariç tutuldu: onlar gerçekten tek yönlü/halka hatlar ve
ima edilen hızları zaten normal (13,3 km/sa).

> ⚠️ **Hız tabanlı sınıflandırma denendi ve REDDEDİLDİ.** Hız dağılımı çift tepeli değil,
> 5-30 km/sa arası kesintisiz bir yığın; temiz kesme noktası yok ve dengesizlik listesiyle
> sadece %50-60 örtüşüyor. Dengesizlik **yapısal** sinyal (51 gidiş 6 dönüş olamaz),
> hız ise **doğrulama**. Sıra bu şekilde doğru.

**KODA NASIL GİRDİ** (`05_boru_hatti.py`, 4 yerde):

```python
# Bölüm 2 — sınıf
_yon = sefer_ham.pivot_table(index="SHATKODU", columns="SYON", values="DT", aggfunc="count")
_az  = _yon.min(axis=1) / _yon.sum(axis=1)
GIDIS_DONUS = set(_az[(_az > 0) & (_az < 0.15)].index.astype(str))

# Bölüm 5 — doluluk paydası
son["bacak"] = son["hat"].map(lambda h: 2 if h in GIDIS_DONUS else 1)
son["kapasite_sefer"] = son["sefer_sayisi"] * son["bacak"]
son["doluluk"] = son["yolcu_gunluk"] / son["kapasite_sefer"]

# Bölüm 6a — öneri (bacak → kalkışa çevir)
oneri["gereken_bacak"] = np.ceil(yolcu / etkin_kapasite)
oneri["gereken_sefer"] = np.ceil(gereken_bacak / bacak)
```

> ⚠️ **`sefer_sayisi`'ye DOKUNULMADI, yanına ayrı sütun kondu.** Araç hesabı
> (`araç = sefer × gerçek süre ÷ 60`) `sefer_sayisi` kullanıyor ve **zaten doğru** —
> arşivdeki görev süresi gidiş+dönüşü kapsıyor. Sefer sayısını ikiye katlasaydık
> araç ihtiyacı da ikiye katlanırdı. Bu tuzağa düşülmedi.

**ETKİSİ:**

| | önce | sonra |
|---|---|---|
| Medyan biniş/sefer | 46,3 | **40,4** |
| Medyan anlık yolcu | 28,1 | **24,6** |
| 110 üstü satır | 866 | **578** |
| Artırma önerisi | 178 · 71 hat · +275 sefer | **96 · 41 hat · +162 sefer** |
| Azaltma (hafta içi) | 1.856 sefer | **2.419 sefer** |
| Hafta içi net | −1.581 | **−2.257** |
| Zirve ek araç | 164 (%4,8) | **97 (%2,9)** |

**Listeden tamamen düşen 30 hat:** 98 ailesinin tamamı (98, 98S, 98B, 98H, 98AB, 98KM),
146, 27T, 78, 41E, 62, 63, 29C, 29D, 15K, 22, 43R, 48N, 54K, 559C, 58A, 58N, 65G, 73,
93, 97G, 97GE, TM10, TM11, 27E, 559C.

**Yeni listenin tepesi:** 500T (07:00 +14,1 araç · 08:00 +13,0), 14ES (07:00 +10,8),
11ÜS (17:00 +9,8). **Üçü de dengeli hat** — düzeltmeden etkilenmediler, yani sıralamanın
tepesi sağlam çıktı.

**Manşet mesaj zayıflamadı, güçlendi:** eklenmesi gereken her sefere karşılık artık ~7 değil
**~15** sefer azaltılabiliyor.

---

### 6.13. ⭐⭐ YÖN BOYUTU KURULDU VE ÖLÇÜLDÜ — Bölüm 6.4 kapandı (7. seans)

**Dosya:** `14_yon_duzeltmesi.py` → `cikti/doluluk_yonlu.csv`, `cikti/oneri_sefer_artir_yonlu.csv`
**`05_boru_hatti.py`'ye DOKUNULMADI** — ayrı betik, ayrı çıktı, geri dönüş bedava.

#### Sorun

Doluluk, bir saatteki yolcuyu o saatteki **tüm** seferlere bölüyordu. Ortalama, dolu yönü
boş yönle gizliyor.

#### Tasarım — her soruyu en güvenilir kaynağa sor

```
KAÇ KİŞİ  ← 2024 CSV (doluluk.csv)   hat + saat        dolu, ekim dönemi
NE ORANDA ← 2026 v3 dosyası          hat + saat + yön  ÖLÇÜM
KAÇ SEFER ← tarife (sefer_ham)       hat + saat + yön  tam veri
```

⭐ **2026'dan SAYI değil ORAN alınıyor.** Bu yüzden o dosyanın ağustos (tatil) haftasına
ait olması ve seviyelerinin %20 düşük olması sonucu etkilemiyor — oran mevsimden bağımsız.
**Mehmet'in kararı:** hacim 2024'te kalsın, çünkü daha dolu ve ekim dönemi.

```
yolcu_G(hat,saat) = yolcu_2024(hat,saat) × oran_2026(hat,saat)
yolcu_D(hat,saat) = yolcu_2024(hat,saat) × (1 − oran)
doluluk_G = yolcu_G ÷ bacak_G      doluluk_D = yolcu_D ÷ bacak_D
öneri     = ikisinden KALABALIK olanına göre
```

#### Dört kademeli arama (gerçek sefer sürelerindeki mantığın aynısı)

İnce hücreler bir üst kademeye düşüyor; `MIN_YOLCU = 100` (5 günün toplamı).

```
1. hat + saat   → 5.275 satır (%98)     3. hat geneli →  3
2. hat + blok   →    74                 4. sistem     → 12
```
`oran_kaynak` sütunu hangi kademeden geldiğini yazar. Sistem kademesi (son çare):
SABAH %78,0 · GÜNDÜZ %68,6 · AKŞAM %59,1 · GECE %40,3.

#### ⚠️ TUZAK — Bölüm 6.12'nin kodlama hatası TALEP tarafına da yansıyor

İlk çalıştırmada 98, 98KM, 78, 29C listenin tepesine tırmandı — oysa bacak düzeltmesiyle
**düşmüşlerdi**. Sebep:

```
                     talep verisinde G payı (medyan)
gidiş+dönüş kodlu 103 hat  →  %94,6
normal 671 hat             →  %53,8
```

O hatlarda binişler de neredeyse tamamen `G` koduna yazılıyor — çünkü *görevin kendisi*
`G` diye kaydediliyor. **Ölçüm değil, kodlama izi.**

Hatanın eşiğin üstüne taşıp taşmadığı ölçüldü:

| arz azınlık payı | talep azınlık payı (medyan) | yorum |
|---|---|---|
| %0-5 | %1,1 | taklit |
| %5-15 | %6,4 | taklit |
| %15-25 | %11,2 | **hâlâ taklit** |
| %25-35 | %25,5 | ayrışıyor ✅ |
| %35-50 | %46,0 | bağımsız |

→ **`DENGE_ESIK = 0.25`** kondu. Bacak eşiğinden (%15) daha ihtiyatlı. Altında kalan
hatlarda yön düzeltmesi uygulanmıyor, eski yönsüz hesap devam ediyor.

> ⚠️ **Genel ders:** Bir kaynaktaki kodlama hatası, o kaynaktan beslenen ikinci kaynağa
> da geçer. Arz tarafında bulduğumuz sorunu talep tarafında da aramak gerekti.

#### İKİNCİ TUZAK — `NaN` karşılaştırması sessizce sıfır bacak seçtirir

Bir yönde hiç sefer olmayan saatlerde `etkin_D` `NaN` olur, `>=` sessizce `False` döner ve
kod **sıfır bacak** seçer; öneri listesi şişer. Çözüm: `np.select` ile `yonlu` kapısı
açıkça yazıldı — düzeltme uygulanamayan satırda eski hesap aynen geçerli.

#### SONUÇ

| | ESKİ (yönsüz) | YENİ (yönlü) |
|---|---|---|
| öneri satırı | 96 | **172** |
| hat sayısı | 41 | **66** |
| toplam ek sefer | 162 | **262** |
| zirve ek araç (08:00) | 97 | **120** |

⭐ **Eski 96 önerinin 96'sı listede kaldı, 0 düştü, 77 yeni eklendi.** Düzeltme mevcut
bulguları çürütmedi, üstüne ekledi. Düzeltme satırların **%51'ine** uygulandı.

Kritik yön dağılımı: GİDİŞ 75 · DÖNÜŞ 59 · yönsüz 39.

**En çok ek araç gereken hatlar:** 11ÜS (+56 araç) · 500T (+33) · 14ES (+25) · 15F (+21) ·
146T (+18) · 147 (+16).

#### ⭐ HEDEF CÜMLE KURULDU — 76O

Projenin başından beri hedeflenen çıktı:

```
76O | 17:00 | OTOGAR → CİHANGİR | 131 kişi/sefer | +1 sefer
76O | 18:00 | OTOGAR → CİHANGİR | 123            | +1
76O | 08:00 | CİHANGİR → OTOGAR | 125            | +1
76O | 07:00 | CİHANGİR → OTOGAR | 119            | +1
```
Sabah bir yön, akşam öbür yön. Ders kitabı gibi işe gidiş-geliş deseni, **ölçülmüş**.

#### KALAN KISITLAR

- **Örneklem ağustos tatil haftasından.** Oran mevsimden bağımsız varsayılıyor; okul
  döneminde desen keskinleşebilir. Mentordan ekim haftası istenirse tek dosya değişir.
- **Metrobüs 2026 dosyasında yok** — zaten analiz dışı (Bölüm 6.7), etkisi yok.
- **Hatların %49'unda düzeltme uygulanamıyor** — dengesiz tarifeli hatlar ve tek yön
  çalışan saatler. Bunlar eski yönsüz hesapla duruyor, `yonlu` sütunu ayırt ediyor.
- **Azaltma listesi hâlâ yönsüz.** Akşam ters yönün boş olduğu saatlerde ek fırsat
  çıkabilir; yapılmadı.

> ⛔ **Sentetik yön verisi üretilmesi tartışıldı ve REDDEDİLDİ** (v3 gelmeden önce).
> Hafta sonu verisinde sentetik olan **girdiydi** (talep seviyesi), cevabı model üretmişti.
> Yön sorusunda ise *"hangi yön kalabalık"* **cevabın kendisi** — üretirsek kendi
> varsayımımızı çıktı diye geri okuruz. v3 gelince konu kapandı, gerekçe kayıt için duruyor.


---
---

### 6.14. ⭐⭐ 2026 HACMİNE GEÇİLEBİLİR Mİ? — denendi, ölçüldü, REDDEDİLDİ (7. seans)

**Betik:** `15_boru_hatti_2026.py` (silinmedi — ekim haftası gelirse iki satır
değişip çalışır) · **Çıktı:** `cikti/doluluk_2026.csv`, `oneri_sefer_artir_2026.csv`

#### Neden denendi

2026 talep verisi tam gelince (Bölüm 4.5) hacmi de oradan almak cazip göründü —
**üç kısıt birden** kalkacaktı: talep–arz yıl farkı, sentetik hafta sonu, ve yön
oranının bir dosyadan diğerine taşınması.

#### İlk ölçüm yanlış araca dayandı — DÜZELTİLDİ

Mevsim etkisi önce İBB portalının **aylık dosya boyutlarından** kestirildi
(aynı yılın ağustos/ekim oranı, metro ve nüfus değişimi yok):

```
2020 → 0,95   ·   2022 → 0,93   ·   2023 → 0,94        → "mevsim etkisi ~%6"
```

Üç yıl da uyuştuğu için güvenilir görünüyordu. **Ama yanlış şeyi ölçüyordu:**
dosya boyutu **günlük toplam** hacimle orantılı. Bizim analizimiz ise **zirve saatle**
ilgileniyor — ve zirve, toplamdan çok daha mevsimsel.

#### Gerçek ölçüm — aynı hatlar, aynı paydalar, saat saat

```
                       2026 Ağustos / 2024 Ekim
zirve   07-09                 %71        ← en çok düşen
gündüz  10-15                 %86
akşam   16-19                 %82
GÜN TOPLAMI                   %85

saat 08:00 tek başına: 281.719 → 172.751 = %61
500T saat 07:00      :   3.217 →   1.663 = %52   (payda aynı: 13 sefer)
```

**Sebebi:** ağustosta okul yok, çalışanların çoğu izinde. Sabah 7-9 zirvesini
yaratan iki şey de yok. Gün ortası gezme-alışveriş trafiği ise büyük ölçüde duruyor.

#### Boru hattının verdiği sonuç

| | 2024 Ekim (yönlü) | 2026 Ağustos (yönlü) |
|---|---|---|
| artırma önerisi | 172 | **8** |
| etkilenen hat | 66 | 6 |
| ek sefer | 262 | 9 |
| zirve ek araç | 120 | **7** |
| 110 üstü satır (hafta içi) | 225 | **9** |

> Eşik etkisi tek başına 96 öneriyi ~31'e indirirdi (%20 hacim düşüşü,
> önerilerin medyanı 124). 8'e inmesi **zirvenin ayrıca çökmesinden** kaynaklanıyor.

**Bu "sorun çözülmüş" değil, "o hafta sorun görünmüyor" demektir.** Eylülde
okullar açılınca aynı otobüsler dolacak. Ağustos verisiyle kapasite planlamak,
tam olarak ölçülmek istenen şeyi yok saymaktır.

#### KARAR: hacim 2024'te kalıyor

```
KAÇ KİŞİ   ← 2024 Ekim CSV      okul dönemi, zirve gerçek
NE ORANDA  ← 2026 Ağustos       yön oranı — mevsimden bağımsız
KAÇ SEFER  ← 2026 tarife
```

Yön oranı için ağustos sorun değil: sabah hangi yöne gidiliyorsa ağustosta da
o yöne gidiliyor, sadece **daha az kişi** gidiyor. Oranı bozmuyor, seviyeyi bozuyor.

#### ⚠️ AYIRAMADIĞIMIZ ŞEY — rapora kısıt olarak girmeli

Günlük toplamdaki %15 farkın ne kadarı mevsim, ne kadarı iki yıldaki gerçek
değişim (yeni metro hatları, nüfus hareketi)? Kaba hesap: `0,85 ÷ 0,94 ≈ 0,90`,
yani ~%10 yapısal düşüş. **Ama zirve için bu ayrıştırma yapılamıyor** — elimizde
tek bir ağustos haftası var, kıyaslayacak 2026 ekimi yok.

Eğer düşüşün bir kısmı gerçekse, 2024 hacmiyle çalışmak talebi bir miktar
**yüksek** gösteriyor ve öneri listesi o oranda şişkin olabilir.

**Bunu çözecek tek şey: 2026'nın okul döneminden bir hafta.** Geldiğinde
`15_boru_hatti_2026.py`'de `TALEP_2026`, `GUN_ESLEME` ve `HAFTA_ICI` değişir,
gerisi aynen çalışır.

> ⭐ **Rapora girecek ders:** *"Veri seçimi sonucu belirler."* Aynı yöntem, aynı kod,
> aynı eşikler — sadece hangi haftanın verisiyle çalıştığına göre zirve açığı
> 120 araçtan 7 araca iniyor. Ve ilk mevsim tahminimiz (%6) yanlış araca dayandığı
> için bu farkı öngöremedi: **doğru soruyu yanlış ölçüyle cevaplamak.**

---

## 7. SENTETİK HAFTA SONU VERİSİ

**Neden:** Ekim dosyasında hafta sonu verisi yok. Mehmet'in staj mentoru sentetik veri
üretilmesini istedi. Meşru bir pratik — **şartı açıkça etiketlenmesi.**

**⚠️ Mehmet'e söylenen ve kabul edilen sınır:** Sentetik sayılar asla gerçekmiş gibi
sunulmayacak. Hafta sonu önerileri ayrı bölümde, "sentetik veriye dayanır" ibaresiyle verilecek.

### Yöntem — iki parça

**Seviye (büyüklük): VARSAYIM.**
`CARPAN = {"SATURDAY": 0.72, "SUNDAY": 0.52}` — cumartesi hafta içinin %72'si, pazar %52'si.

**Şekil (saatlik dağılım): GERÇEK HAFTA İÇİ EĞRİSİNDEN TÜRETİLDİ.**

> **İLK DENEME YANLIŞTI, DÜZELTİLDİ.** İlk sürümde şekil **arz** verisinden (saatlik sefer payı)
> alınmıştı. Sonuç: doluluk her saat sabit çıktı, grafikte hafta sonu çizgileri **dümdüz** oldu —
> çünkü pay ve payda birlikte hareket ediyordu. Grafik çizilince fark edildi.
> **Ders:** sentetik veriyi mutlaka görselleştirip kontrol et.

Düzeltilmiş yöntem: gerçek hafta içi talep eğrisi alınıp saatlik düzeltme katsayılarıyla eğiliyor,
sonra hattın toplamı korunacak şekilde normalize ediliyor.

```python
SAAT_DUZELTME = {0:1.30, 1:1.30, 2:1.30, 3:1.20, 4:1.00, 5:0.60,
                 6:0.45, 7:0.40, 8:0.45, 9:0.65, 10:1.10, 11:1.20,
                 12:1.25, 13:1.25, 14:1.20, 15:1.15, 16:1.10, 17:1.05,
                 18:1.00, 19:1.05, 20:1.10, 21:1.15, 22:1.25, 23:1.30}
```
> 1'in altı "hafta sonu bu saatte daha az" (sabah 7-8 işe gidiş yok), üstü "daha çok"
> (gece ve öğleden sonra).

Formül:
```
yolcu = (ham eğri / hattın ham toplamı) × (hattın hafta içi toplamı) × çarpan × gürültü
```

- Gürültü: `np.random.default_rng(42).normal(1.0, 0.07)` → ±%7. **Tohum 42** (tekrarlanabilirlik).
- `.clip(lower=0)` ile negatifler engellendi
- Her satırda `kaynak` sütunu: `gercek` / `sentetik`

**Sonuç:** 27.798 satır. Cumartesi **2.957.868**, pazar **2.147.262** günlük yolcu — hafta içi
4.112.738'in tam %72 ve %52'si.

**Bilinen zayıflık:** Çarpan hat tipine göre değişmiyor. Kampüs hatları (KM41 gibi) hafta sonu
neredeyse boştur ama model onlara da %72 veriyor.

---

## 8. SONUÇLAR (17 Ağustos 2026 — bacak düzeltmesinden sonra)

**Gerçek hafta içi profili** (`cikti/gercek_haftaici_profil.csv`):
798 hat, 13.899 satır, günlük toplam **4.112.738 yolcu** — gerçekçi. *(değişmedi)*

**Sentetik hafta sonu:** 27.798 satır · cumartesi **2.957.868**, pazar **2.147.262** günlük
yolcu. *(değişmedi — tohum 42 ile birebir tekrar üretildi)*

**Doluluk tablosu** (`cikti/doluluk.csv`): **28.391 satır, 676 hat**
- Medyan biniş/bacak: **40,4** → devir düzeltmesiyle medyan **anlık yolcu 24,6**
- 110 üstü: **578** satır · 20 altı: **11.611** satır
- Yeni sütunlar: `bacak`, `kapasite_sefer` (Bölüm 6.12)

**Öneri listesi** (`cikti/oneri_sefer_artir.csv`) — sadece hafta içi, `sefer_sayisi >= 3`:
- **96 hat+saat kombinasyonu**, **41 farklı hat**
- **Toplam 162 ek sefer**, 308 araç-saat
- Zirve: **08:00 → 97 ek araç (%2,9)**

Tepedeki satırlar:
```
500T | 07:00 | 3.217 yolcu | 13 sefer | 145,5 anlık | +5 sefer | +14,1 araç
500T | 08:00 | 3.300       | 13       | 149,3       | +5       | +13,0
14ES | 07:00 | 1.542       |  6       | 151,2       | +3       | +10,8
11ÜS | 17:00 | 1.361       |  4       | 200,1       | +4       | + 9,8
```

### Öncesi/sonrası (dışlamaların etkisi)

| | 4. seans | 5. seans | fark |
|---|---|---|---|
| doluluk satırı | 29.686 | **28.391** | −1.295 |
| hat sayısı | 722 | **676** | −46 |
| öneri sayısı | 1.169 | **1.150** | −19 |
| etkilenen hat | 227 | **222** | −5 |
| toplam ek sefer | 2.916 | **2.873** | −43 |
| 110 üstü | 3.869 | **3.737** | −132 |
| medyan doluluk | 46,0 | **46,3** | +0,3 |

> İki aşamada oldu: önce 52 hat (Bölüm 6.5) → 28.561 satır / 680 hat, sonra Metrobüs
> ailesinin kalan 6 kodu (Bölüm 6.7) → 28.391 satır / 676 hat.

> **⚠️ Devir dosyasının önceki sürümünde bir hata vardı:** "20 altı ≈ 4.200" yazıyordu,
> gerçek değer **6.077** imiş (yeni tabloda 5.847). Rapora bu düzeltilmiş haliyle girmeli.

Örnek satırlar:
```
11ÜS | 16:00 | 1.484 yolcu | mevcut  4 | gereken 14 | +10 sefer | 371,0 kişi/sefer
98   | 16:00 | 1.049 yolcu | mevcut  3 | gereken 10 |  +7 sefer | 349,7
14R  | 08:00 | 1.916 yolcu | mevcut  7 | gereken 18 | +11 sefer | 273,8
```

### AZALTMA LİSTESİ (`cikti/oneri_sefer_azalt.csv`) — 5. seansta üretildi

Eşikler: doluluk **< 20** · en az **4 sefer** · hedef doluluk **40** · hiçbir saatte **2 seferin
altına inme** · gün ortalaması < 5 olan 30 hat hariç (Bölüm 6.8).

**3.107 satır, 332 hat, 11.731 azaltılabilir sefer.** Kırılımı *(17 Ağustos, bacak
düzeltmesinden sonra)*:

| gün tipi | kaynak | satır | hat | azaltılabilir sefer |
|---|---|---|---|---|
| Cumartesi | **sentetik** | 1.098 | 275 | 4.344 |
| Pazar | **sentetik** | 1.310 | 229 | 4.968 |
| **Hafta içi** | **gerçek** | 699 | 233 | **2.419** |

⚠️ **Listenin %79'u sentetik veriye dayanıyor.** Bölüm 7'deki taahhüt gereği hafta sonu
önerileri **ayrı bölümde, "sentetik veriye dayanır" ibaresiyle** verilmeli. Tek liste
halinde sunmak yanıltıcı olur.

**Listenin başında `401` ve `303A` var** (ÇATALCA–AVCILAR ve SİLİVRİ–AVCILAR Metrobüs besleme
hatları), hepsi hafta sonu. Mantıklı — işe gidiş hatları hafta sonu boşalır. Ama sentetik model
tüm hatlara aynı %72/%52'yi uyguluyor; gerçekte bu tip hatlar çok daha fazla boşalır, yani
**gerçek azaltma fırsatı muhtemelen daha büyük** ama ölçemiyoruz (Bölüm 7 "bilinen zayıflık").

### ⚠️ HAFTA SONUNDA NEDEN ÖNERİ ÇIKMIYOR — ölçüldü (8. seans)

Mehmet panoda fark etti: *"hafta sonu saatlerinde çoğu hatta sefer önerisi yok."*
Sebep **tek değil, iki ayrı mekanizma** — karıştırılmamalı.

**(a) Sefer EKLEME önerisi hafta sonu hiç üretilmiyordu — kod kararıydı.**

```python
05_boru_hatti.py:326   hi = son[(son["gun_tipi"] == "WEEKDAYS") & (son["sefer_sayisi"] >= 3)]
14_yon_duzeltmesi.py:221  o = hi[(hi["gun_tipi"] == "WEEKDAYS") & ...]
```
İki betikte de aynı filtre. Gerekçe Bölüm 7'deki taahhüttü: hafta sonu yolcu sayısı
sentetik, sentetik sayıya bakıp "sefer ekleyin" demek kendi varsayımını bulgu diye
geri okumak olur.

⚠️ **Ama model hafta sonu sıkışıklığı GÖRÜYOR ve susuyordu:** sentetik veride bile
**101 hatta, 353 hat+saat diliminde** anlık yolcu 110'un üstünde.

**(b) Sefer AZALTMA önerisi hafta sonu var ama hatların yarısına yakınında yok.**
613 hattın **292'sinde** öneri var, **321'inde yok.** Elenme hunisi:

```
17.813 hafta sonu satırı (613 hat)
   −9.801  etkin_doluluk ≥ 20        → zaten dolu, azaltılacak bir şey yok
    8.012
   −5.290  o saatte 4'ten az sefer   → AZALT_MIN_SEFER = 4 eliyor
    2.722
     −314  şüpheli 30 hat hariç (Bölüm 6.8)
    2.408  nihai öneri (292 hat)
```

**Asıl sebep ikinci satır: hafta sonu tarifesi zaten seyrek.** Hafta sonu satırlarının
**%61'inde saatte 4'ten az kalkış** var, medyan **2 kalkış/saat**. Saatte 2 otobüs kalkan
bir hatta "sefer azalt" denemez — `AZALT_MIN_KALAN = 2` zaten 2'nin altına inmeyi
yasaklıyor. Boşluk çoğu hatta gerçek, ama **kesilecek sefer kalmamış.**

> Panoda görünen tam olarak bu: tarife tablosunun **Cumartesi/Pazar sütunlarında yeşil
> `+` hiç çıkmaz** (artırma hafta içiydi), turuncu üstü çizili kalkış ise yalnızca o
> 292 hatta çıkar.

**⭐ KARAR (8. seans, Mehmet): hafta sonu artırma önerisi AÇILDI.**
*"Sentetik de olsa taşma varsa öneri yapsın, sentetik diye kayırmasın."*
Gerekçe: sentetik olan **seviye**, taşmanın kendisi değil — ve Bölüm 4.5'te ölçüldüğü
gibi çarpanlar (%72/%52) gerçeğin (%79/%58) **altında**, yani hafta sonu talebini
olduğundan **az** gösteriyoruz. Sentetik veriyle susmak, sıkışıklığı gizlemek oluyor.
**Şart, Bölüm 7'deki taahhüdün aynısı:** hafta sonu önerileri `kaynak = sentetik`
etiketiyle ve ayrı sayılarak verilecek, hafta içi manşet rakamına karıştırılmayacak.

**UYGULANDI — dört dosya değişti:**

| dosya | ne değişti |
|---|---|
| `05_boru_hatti.py` | 6a'daki `gun_tipi == "WEEKDAYS"` filtresi kalktı; `_ar_hi` / `_ar_hs` ayrımı eklendi |
| `14_yon_duzeltmesi.py` | aynı filtre kalktı; `ekleme_dakikalari()` artık **gün tipi parametresi** alıyor (eskiden sabit `"I"` tarifesine bakıyordu) |
| `yon.js` | tarife tablosunda her gün sütunu kendi önerisini alıyor; hafta sonu önerileri **kesik çerçeveli yeşil** |
| `cikti/index.html` | gömülü `yon.js` kopyası senkronlandı |

**SONUÇ:**

```
                       HAFTA İÇİ (gerçek)   HAFTA SONU (sentetik)
yönsüz  (05)                96 öneri                55 öneri · 20 hat ·  83 sefer
yönlü   (14)               172 öneri               117 öneri · 40 hat · 173 sefer
```

⭐ **Hafta içi rakamlarının hiçbiri değişmedi** — 96 / 162 sefer / 97 araç ve
yönlü 172 / 262 / 120 araç birebir aynı. Yani düzeltme mevcut sonuçlara dokunmadan
üstüne ekledi. *(Regresyon kontrolü olarak bilerek ölçüldü.)*

⚠️ **Üç yerde manşet hafta içi bırakıldı, bilerek:** (a) `arac_ihtiyaci_saatlik.csv`
ve zirve saat hesabı — `mevcut_saatlik` yalnızca hafta içi araç sayısını tutuyor,
hafta sonu ek araçlarını onun üstüne bölmek artış yüzdesini saçmalatırdı;
(b) `net_hafta_ici_sefer`; (c) Bölüm 7'deki "eski/yeni" kıyas tablosu —
kıyas hafta içi ile hafta içi olmalı.

⚠️ **Panodaki ana "Sefer artır" tablosuna hafta sonu satırları KONMADI.** Paketlenmiş
React tablosunda gün tipi sütunu yok; oraya karıştırsak sentetik ile gerçek ekranda
ayırt edilemezdi. Hafta sonu önerileri `dashboard_veri.json`'da ayrı anahtarda
(`oneri_artir_hs`) ve tarife tablosunun Cumartesi/Pazar sütunlarında görünüyor.

**Doğrulandı (8. seans, tarayıcıda):** `11ÜS` panelinde İş Günleri sütununda 44 düz
yeşil, Cumartesi 27 + Pazar 10 kesik yeşil kalkış; 128 kırmızı (kapasite üstü) hücre
üç sütuna dağılmış; lejantta yeni satır var; konsolda hata yok. Azaltma bölümü
(544 üstü çizili kalkış), şüpheli hat tablosu ve hat incelemesi etkilenmedi.

### ⭐ HAFTA İÇİ NET SONUÇ (sadece gerçek veri — rapora manşet)

| | sefer | hat |
|---|---|---|
| Artırılması gereken | **162** | 41 |
| Azaltılabilecek | **2.419** | 233 |
| Net | **−2.257** | |

> ⚠️ **"Net −2.257" rakamını olduğu gibi kullanma — yanıltıcı.** Eklenmesi gereken 162
> sefer sabah 7-9 ve akşam 15-18'de; azaltılabilecek 2.419 sefer zirve dışı saatlerde.
> Bunlar birbirinin yerine geçmez.

**Doğru cümle:** *"Sistem toplamda yeterli araca sahip; sorun dağılımda. Zirve saatlerde
97 araçlık açık var, zirve dışında ciddi boşluk var."* Bu, toplu taşımanın klasik
**zirve/taban oranı** problemi ve İETT'ye götürülecek çok daha kullanışlı bir mesaj —
çünkü çözümü yeni araç almak değil, vardiya ve sefer dağılımını yeniden kurmak.

> Devir=1 senaryosunda tablo tersine döner (artırma listesi 802 satıra çıkar,
> zirve açığı 633 araç olur) — yani sonucun büyüklüğü devir katsayısına bağlı.
> Rapor duyarlılık tablosunu birlikte vermeli (Bölüm 6.10b).

**Analiz dışı bırakılan hatlar — toplam 59:**
- **Metrobüs ailesi (8 hat):** `34, 34A, 34AS, 34B, 34BZ, 34C, 34G, 34Z`. İki sebep birden:
  arz tarafı gerçek sıklığı yansıtmıyor, talep tarafı tek koda yığılmış. **Bölüm 6.7.**
- **52 hat (`ARZ_EKSIK`):** arz verisinde dönüş seferleri yok, sefer sayısı eksik →
  doluluk yapay yüksek. **Bölüm 6.5.** *(34A iki listede birden, bu yüzden toplam 59.)*
- Ayrıca **30 hat** azaltma listesinden korundu (silinmedi, sadece öneri üretilmedi) — **Bölüm 6.8.**

**Çizilen grafikler (matplotlib, notebook içinde):**
1. Tek hattın 24 saatlik doluluğu — çubuk + kapasite çizgisi
2. Üç gün tipi karşılaştırması — çizgi grafik (sentetik hatanın bulunduğu grafik)
3. En sıkışık 15 hat+saat — yatay çubuk
4. Her hattın en kötü saati (`drop_duplicates("hat")` ile) — aynı hattın listeyi doldurmasını engeller

---

## 9. DASHBOARD

**Dosya:** `cikti/index.html` — **5. seansta yenisiyle değiştirildi** (577 KB, React tabanlı,
paketlenmiş). Mehmet masaüstünde hazırladığı sürümü projeye senkronize etmek istedi; önceki
sürümler `_to_delete/` içinde yedeklenmişti — **7. seansta o klasör silindi**, eski
dashboard sürümleri artık yok.
**Veri:** `cikti/dashboard_veri.json` (**676 hat**, ~1,3 MB)

**Yeni dashboard'un özellikleri:**
- Bölümler: Genel bakış · Sefer artır · Sefer azalt · Hat incelemesi · Değerlendirilemeyen ·
  Yöntem ve kısıtlar
- **Kendi kendine yeter:** React ve yazı tipleri dosyanın içine gömülü (UUID eşlemeli
  `__bundler/ext_resources` mekanizması). İnternet gerekmiyor, sadece yanındaki
  `dashboard_veri.json`'u okuyor. Üç yolu sırayla dener:
  `dashboard_veri.json` → `veri/dashboard_veri.json` → `../veri/dashboard_veri.json`
- Bulunamazsa açık uyarı verir ("Live Server ya da python3 -m http.server ile aç")
- Bugünkü bulguları tanıyor: gerçek sefer süreleri, 59 dışlanan hat, 17 şüpheli hat

**⚠️ Paketlenmiş dosya elle düzenlenemez.** İçerik değişikliği gerekirse Mehmet'in onu
ürettiği ortamda yeniden üretilmeli. Değiştirilebilen tek şey **veri** — `05_boru_hatti.py`
JSON'u üretiyor.

### JSON ŞEMASI — dashboard'un beklediği alanlar

Üst seviyede **beş** anahtar: `ozet`, `hatlar`, `oneri_artir`, `oneri_azalt`, `supheli`.
Öneri dizileri 5. seansta eklendi (önce yoktu, tablolar "0 satır" gösteriyordu).
Kısa anahtarlar dosya boyutunu küçük tutmak için:

| dizi | alanlar |
|---|---|
| `oneri_artir` | `h` hat · `s` saat · `y` yolcu · `sf` sefer · `d` doluluk · `gs` gerçek süre (dk) · `es` ek sefer · `ea` ek araç |
| `oneri_azalt` | `h` · `g` gün tipi · `s` · `y` · `d` · `sf` · `os` önerilen sefer · `az` azaltılacak · `yd` yeni doluluk |
| `supheli` | `h` · `y` yolcu · `sf` sefer · `d` gün ortalaması doluluk |

`ozet` içinde ayrıca `saatlik` dizisi var (24 eleman): `mevcut_arac`, `ek_arac`, `ek_sefer`,
`hat`, `artis` — saatlik filo grafiğinin kaynağı.

**Doğrulandı (5. seans):** Tablolar doldu, sayılar boru hattıyla tutuyor.

### ⚠️ DASHBOARD'DA SABİT KODLANMIŞ / YANLIŞ GÖRÜNEN ÜÇ ŞEY

Paketlenmiş dosya elle düzeltilemez. Yeniden üretilirken bunlar düzeltilmeli:

| görünen | gerçek | sebep |
|---|---|---|
| "Verisi şüpheli **17** hat" | **30** | sayı dosyaya gömülü; `ozet.supheli_hat_sayisi` alanı hiç okunmuyor |
| "**+-1.581** sefer" | −1.581 | negatif sayının önüne koşulsuz "+" ekleniyor |
| Sütun başlığı "**KİŞİ / SEFER**" | devir düzeltmeli **anlık yolcu** | etiket devir öncesi anlamı taşıyor (Bölüm 6.10) |

### 5. SEANSTA EKLENEN DAVRANIŞLAR (ek betikle, paketlenmiş dosyaya dokunmadan)

`index.html`'in sonuna iki `<script>` bloğu eklendi. Paketlenmiş şablon değişmedi —
betikler çalışmasa bile dashboard eskisi gibi çalışır. **Dosya yeniden üretilirse bu
betikler kaybolur, yeni dosyaya tekrar eklenmeli.**
→ Kaynakları saklandı: `notlar/dashboard_ek_betikler/akordeon.js` ve `menu.js`.
→ Yeniden eklemek için: `index.html`'in `</body>` etiketinden hemen önce ikisini
   `<script>` bloğu içinde yapıştır.

**1. Hat detay akordeonu**
- Tabloda bir satıra tıklayınca o hattın detayı **satırın hemen altında** açılır
- Panelde: hat adı, uzunluk, sefer süresi · gün tipi sekmeleri · 4 sayı (günlük yolcu,
  günlük sefer, eklenecek sefer, azaltılabilir sefer) · **"sefer eklenmesi gereken
  saatler" özet cümlesi** · 24 saatlik sütun grafiği (kapasite çizgisi + önerili
  saatlerin üstünde `+N` etiketi) · saat saat öneri tablosu
- Tekrar tıklayınca kapanır, aynı anda tek panel açık kalır
- ⚠️ Otomatik kaydırma bilerek KOYULMADI: sayfa kayınca kullanıcı aynı noktaya tekrar
  tıklayıp başka satıra basıyor, "kapanmıyor" sanıyordu

**1b. Grafik giriş animasyonu**
- Panel açılınca çubuklar taban çizgisinden yukarı yükselerek girer
  (`scaleY(0)→scaleY(1)`, `transform-origin` tabana sabit — yoksa ortadan büyürler)
- Soldan sağa 18 ms kademeli gecikme → sabahtan geceye akan dalga etkisi
- "+N sefer" etiketleri kendi çubukları yükseldikten sonra belirir
- Gün tipi değişince tekrar oynar
- ⚠️ **Tetikleyicide çift güvence var:** `requestAnimationFrame` sekme görünmezken
  durduruluyor ve çubuklar sıfır boyda kalıyordu; yanına `setTimeout(…, 90)` yedeği
  kondu. İkisi de aynı fonksiyonu çağırır, bir kez çalışacak şekilde kilitli.

**2. Tablo sadeleştirme**
- Tablo "hat + saat" listesi olduğu için aynı hat birkaç kez geçiyordu (98 dört kez)
- Artık her hat **bir kez** görünür (en kritik saati), altında "· N saat daha" rozeti
- Detaylar zaten panelde olduğu için tekrar gereksiz

**3. ~~Hamburger menü~~ — ⛔ KALDIRILDI (7. seans)**
`menu.js` `index.html`'den çıkarıldı; Mehmet *"soldaki sandviç kötü duruyor"* dedi.
Sol panel artık her zaman açık (246 px), amblem eski yerinde. Kaynak dosya
`notlar/dashboard_ek_betikler/menu.js` duruyor — geri istenirse `</body>`'den önce
`<script>` içinde yapıştırmak yeter. **Kaybedilenler:** dar ekranda paneli kapatma
(900 px altı için üste binen açılır panel) ve menü öğelerinin hover/aktif vurgusu.
Telefon görünümü için `mobil.html` zaten ayrı (Bölüm 9 madde 10), o yüzden pratik
kayıp küçük.

Aşağıdaki açıklama tarihsel kayıt olarak duruyor:
- Sol panel açılır-kapanır, tercih hatırlanır, dar ekranda varsayılan kapalı
- Kaydırınca aktif bölüm vurgulanır (kırmızı sol çubuk)
- ⚠️ Kayma animasyonu YOK: uygulama `margin`/`opacity`/`transform` özelliklerini inline
  `!important` yazsak bile eziyor. Deneyerek bulundu — güvenilir çalışan tek özellik
  `display`. Aynı sebeple sidebar logosunun padding'i de JS'ten veriliyor.

**4. Manşet bloğuna İETT amblemi** — `cikti/iett-amblem.png`, sağdaki boşlukta,
blok yüksekliğinin %84'ü, %90 opaklık.

**5. ⭐ GÜZERGÂH HARİTASI** — panelin altındaki "🗺 Güzergâhı haritada göster" düğmesi
- **Gerçek harita:** Leaflet + CARTO Voyager karoları (OpenStreetMap tabanlı). Sokaklar,
  mahalle adları, deniz görünüyor.
- **Rota:** hattın gerçek durak koordinatlarıyla çizili. Gidiş düz çizgi, dönüş kesikli.
- **Saat kaydıracı:** rota rengi ve kalınlığı o saatin doluluğuna göre değişir
  (mavi → turuncu → kırmızı). "Günü oynat" 24 saati otomatik geçer.
- **Otobüs kaydıracı:** 🚌 işareti duraktan durağa ilerler; kaydıraçla elle sarılır,
  ◀ ▶ oklarıyla tek tek adımlanır. Elle sarınca otomatik oynatma durur. Otobüs görüş
  alanından çıkarsa harita peşinden kayar.

**Tembel yükleme:** Leaflet ve `guzergahlar.json` (2,3 MB) sayfa açılışında DEĞİL, harita
ilk açıldığında iniyor. Yoksa dashboard her açılışta gereksiz yavaşlardı.

⚠️ **Harita internet ister** — karolar dışarıdan geliyor, çevrimdışı çalışmaz. Dashboard'un
geri kalanı kendi kendine yeter; bu istisna. Bağlantı yoksa panel açık uyarı yazar.

⚠️ **İki dürüstlük notu ekranda yazılı:** (a) renk **hat bazında**, durak bazında değil
(Bölüm 6.5'teki durak verisi yokluğu); (b) otobüsün konumu **gerçek GPS izi değil**,
duraklar arası doğrusal ara değer — gerçek rota yoldan kıvrılır.

**6. ⭐ CANLI ARAÇ KONUMLARI** — haritadaki "🔴 Canlı konumlar" düğmesi

Yeşil noktalar o hattaki **gerçek otobüsler**. Üstlerine gelince plaka, yön ve GPS zaman
damgası çıkar. 15 saniyede bir tazelenir.

**⚠️ CORS ENGELİ — ölçüldü, çözüldü.** Tarayıcı İETT SOAP servisine **doğrudan bağlanamıyor**:
```
POST                 → 200 OK ama Access-Control-Allow-Origin başlığı YOK
OPTIONS (ön kontrol)  → 500 hata
tarayıcıdan fetch     → "Failed to fetch"
```
Python'dan çalışıyor çünkü bu kısıt yalnızca tarayıcıda geçerli. Çözüm: **`11_canli_kopru.py`**
araya girip cevabı tarayıcının kabul edeceği başlıklarla iletiyor.

**Çalıştırma:**
```bash
source venv/bin/activate && python3 11_canli_kopru.py
```
Sonra **`http://localhost:8770`** — köprü hem `cikti/` klasörünü sunar hem
`/canli?hat=500T` ucunu sağlar. (Normal `python3 -m http.server` ile açarsan harita ve
tablolar çalışır ama canlı katman çalışmaz.)

**Köprünün ayrıntıları:**
- 12 saniyelik önbellek — aynı hatta üst üste istek gelirse API yorulmaz
- İstanbul sınırları (40,7–41,7 K / 27,9–29,9 D) dışındaki bozuk GPS kayıtları elenir
- Alan adları serviste değişken olduğu için enlem/boylam olası adlar taranarak bulunur
- Köprü kapalıysa panel sessizce boş kalmaz, ne yapılacağını yazar

⚠️ **Konumlar ŞU ANA aittir, dashboard'da seçili saate değil.** Geçmiş GPS izi yok —
sadece anlık konum servisi var. Ekranda bu cümle yazılı.
⚠️ **GitHub Pages'te çalışmaz** (orada sunucu yoktur). Harita ve geri kalan her şey çalışır,
yalnızca canlı katman devre dışı kalır.

**Sunum değeri:** *"Tarife bu hatta saatte 13 sefer diyor; şu an gerçekte 6 araç yolda"* —
Bölüm 6.3'teki canlı araç doğrulamasının interaktif hali.

#### 6b. YÖN OKLARI VE RENKLERİ — ✅ ÇÖZÜLDÜ (6. seans)

**İstenen:** 76O'da Otogar'a gidenler bir renk, Avcılar'a gidenler başka renk.

**Yapılan yöntem:** API'nin `yon` alanı aracın gideceği **son durağın adını** veriyor
(örn. "ŞİFA SONDURAK"). Bu ad, `guzergahlar.json`'daki G ve D dizilerinin son durağıyla
eşleştirilip yön belirleniyor. Sonra aracın konumuna en yakın durak bulunup bir sonraki
durağa olan açı hesaplanıyor; ok o yöne döndürülüyor.

**Renkler doğrulandı** (OKLab ΔE ×100, `scratchpad/palet_kontrol.py`):

| çift | normal görüş | renk körlüğü | karar |
|---|---|---|---|
| **yeşil #16a34a ↔ mor #7c3aed** | 40,6 | **15,1** | ✅ seçildi |
| yeşil ↔ turkuaz | 17,4 | 4,3 | ✗ kaldı |
| yeşil ↔ macenta | 37,5 | 6,5 | sınırda |

Yeşil ayrıca rota renklerinden (mavi/turuncu/kırmızı) en uzak olan — karışmıyor.
Yön belirlenemezse nokta **gri** kalıyor, uydurma yön gösterilmiyor.
Renk körlüğü yedeği: alttaki yazıda her rengin yanında hedef durağın **adı** yazılı.

**⚠️ ÇÖZÜLMEYEN SORUN:** `11ÜS`'te doğru çalıştı (5 araç Sultanbeyli'ye, 4 araç Üsküdar'a
→ iki renk göründü). Ama `98`'de **11 aracın 11'i de aynı yöne** atandı (hepsi mor,
"→ FENERTEPE PERONLAR"). Sabah 09:19'da bu olası değil.

İki ihtimal, hangisi olduğu **ölçülemedi**:
- (a) O an gerçekten hepsi aynı yöndeydi
- (b) O hatta `yon` alanı beklenen şeyi vermiyor

**Neden ölçülemedi:** İETT canlı konum servisi test sırasında **HTTP 500 vermeye başladı**
(20 sn arayla 3 deneme, üçü de 500). Dakikalar önce çalışıyordu — muhtemelen üst üste çok
istek atıldığı için geçici kısıtlama. Servis açılınca tekrar denenmeli.

**✅ ÇÖZÜLDÜ (6. seans) — üç kademeli öncelik sırasıyla:**

```js
var yon = sonYon[aracAnahtar(a)]   // 1) GERÇEK HAREKET  (en güvenilir)
       || yonKodundan(a)           // 2) guzergahkodu harfi
       || isimdenYon(a);           // 3) durak adı eşleştirme (eski yöntem, yedek)
```

**1) Hareket vektörü.** Aracın iki ölçüm arasındaki yer değiştirmesinin açısı, rotanın
o noktadaki gidiş açısıyla karşılaştırılıyor; hangisine yakınsa yön o.
İki koruma: 60 metreden az yer değiştirmede açı gürültülü → karar verilmiyor;
hareket iki rota yönüne de 60 dereceden uzaksa → susuluyor.
Bulunan yön araç bazında **hatırlanıyor** (`sonYon`), yoksa her turda bir ölçülüp bir kaybolurdu.

**2) `guzergahkodu` harfi.** `98_G_D7742` → ortadaki harf. Köprü bunu `yonkod` olarak
iletiyor (`11_canli_kopru.py` güncellendi).

**SONUÇ — 98 hattı, 12 Ağustos 15:03:**
```
önce (isim eşleştirme) : 11 araç → FENERTEPE PERONLAR   (hepsi tek yön, yanlış)
sonra (hareketten)     :  5 araç → BAKIRKÖY
                          6 araç → FENERTEPE PERONLAR
                         "Yön 9 araçta gerçek hareketten ölçüldü"
```

**Neden iki yöntem de şaşırıyordu:** 98'de kaynak veride yön yok (Bölüm 6.12) —
kalkışların %91'i "G" etiketli. İsim yöntemi ayrıca "FENERTE" ile başlayan iki durak adı
olduğu için yanlış yönü seçiyordu. Hareket vektörü tek güvenilir kaynak.

> **Yan not:** hareket vektörü hesabı trafik katmanı için zaten yapılıyordu — yön çözümü
> bedavaya geldi.

**⚠️ API kırılganlığı — genel not:** `GetHatOtoKonum_json` üst üste istek atılınca 500
vermeye başlıyor. Köprüde 12 saniyelik önbellek var ama test ederken elle yapılan
isteklerde bu devrede değil. Yoğun test yapmadan önce bunu hesaba kat.

#### 7. ⭐ TRAFİK KATMANI — otobüsler hareketli sensör (6. seans)

Haritadaki **🚦 Trafik** düğmesi. Aynı aracı iki ölçümde yakalayınca aradaki mesafeyi geçen
süreye bölüyoruz → hız. Otobüsün geçtiği yol parçası o hıza göre boyanıyor.

```
< 8 km/sa  kırmızı "durma"   ·   8-16 turuncu "ağır"
16-28      sarı    "yavaş"   ·   28+  yeşil    "akıcı"
```
> Bantlar şehir içi otobüsün ölçülmüş ortalaması (~25 km/sa, Bölüm 6.9) etrafına kuruldu.

- Ölçümler **6 dakika** ekranda kalıp soluklaşıyor → rota yavaşça bir trafik resmine dönüşüyor
- **Durakta bekleyen araç trafik sanılmasın** diye: durağa 45 m'den yakın VE yavaş ölçümler eleniyor
- Trafik açıkken **rota çizgisi nötr griye** dönüyor — aynı çizgi hem doluluğu hem trafiği
  anlatamaz, iki anlam üst üste binerse ikisi de okunmaz
- Servis dakikada bir tazelendiği için **ilk renkler 1–1,5 dakika sonra** çıkıyor (ölçüldü: 85 sn)
- Yeni ölçüm gelmeyen turlarda aracın **son ölçülen hızı** korunuyor, yoksa nokta bir sarıp
  bir yön rengine dönerdi

**Örnek ölçüm (98 hattı, 14:53):** 9 parça — 4 yavaş · 2 ağır · 2 akıcı · 1 durma.
500T'de 12 parça akıcıydı. 98 zaten öneri listesinde üst sıradaydı; trafik katmanı bunu
bağımsız olarak doğruluyor.

**⭐ YAN DOĞRULAMA — İBB trafik indeksiyle korelasyon.** Açık veride canlı trafik indeksi var:
```
GET api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex          → {"Result": 45}
GET .../TrafficIndexHistory/{gün}/{periyot}                            → 5M · H · D · M · Y
```
Şehir geneli tek sayı (1-99). Bizim **ölçtüğümüz sefer süreleriyle** karşılaştırıldı:

```
Spearman = 0,759   p = 0,00002   (24 saat)
saat 18 → trafik 68 · sefer süresi 79,2 dk
saat 04 → trafik  1 · sefer süresi 58,5 dk
```
> İki bağımsız kaynak, **iki farklı yıl** (trafik 2026'dan, süreler Ekim 2024'ten),
> birbirini tutuyor. Bölüm 6.9'daki süre ölçümünün dışarıdan doğrulaması.

⚠️ **Yol bazında canlı trafik verisi açık veride YOK.** `TrafficDensity`, `RoadTraffic`,
`Announcement` denendi — hepsi 404. İBB'nin trafik yoğunluk haritası (`uym.ibb.gov.tr`)
bir web sayfası, API değil. Geohash bazlı "Hourly Traffic Density" veri seti var ama
aylık CSV arşivi, canlı değil.

#### 8. ROTALAR YOLA OTURTULDU (6. seans)

Rota duraktan durağa düz çizgiyle çiziliyordu; duraklar sıksa yola benziyor ama otoyolda
araları 5-10 km açılınca çizgi araziyi kesiyordu. `12_rota_yollari.py` durak koordinatlarını
OSRM'e gönderip gerçek yol geometrisini alıyor → `cikti/rota_yollari.json`.

```
676 hat · 0 hata · 2,3 MB · ~25 dakika
500T: düz çizgi 53,1 km → yolda 74,7 km (+41%)
14ES: 24,1 → 34,4 (+43%)
```

**Kalite kontrolü:** çizilen uzunluk / İETT'nin bildirdiği uzunluk oranı **medyan 1,05**
(çeyrekler 1,00–1,15). ⚠️ 33 hatta oran > 1,5 — rota motoru otomobil yolu hesaplıyor,
otobüs şeridini bilmiyor. **Analize etkisi yok, sadece görsel.**

Dashboard dosyayı bulamazsa eski düz çizgiye döner — betik hiç çalıştırılmasa da bozulmaz.

#### 9. OKUNURLUK KATMANI — hem uzmana hem genel okura (6. seans)

`okunurluk.js`. Veriyi değiştirmez, sunumu düzeltir:

1. **Kapasite referansı.** "145,5" tek başına anlamsız → `146 / 110` + altında renkli çubuk
   (kırmızı kapasite üstü, mavi çok boş, yeşil normal)
2. **Ondalık temizliği.** Yarım insan, ondalık otobüs yok — kişi ve araç tam sayıya yuvarlanıyor
3. **Eylem özeti.** Her tablonun başına veriden hesaplanmış tek cümle:
   *"41 hatta toplam 162 sefer eklenmeli. En çok ihtiyaç 08:00'da (57 sefer)."*
4. **Terim baloncukları.** "anlık yolcu", "araç-saat", "devir", "sentetik" terimlerinin altı
   noktalı çizili; üstüne gelince açıklama çıkıyor. Uzmanı rahatsız etmez, yeni okuru kurtarır.

> ⚠️ Bölüm başlıkları paketlenmiş şablonda `h2/h3` değil düz `<div>`. Özet cümleleri
> etiket adına göre değil **metne göre** aranarak yerleştiriliyor.

> **Genel ders:** Bu paketlenmiş dosyada CSS ile stil vermek güvenilmez; uygulama
> kendi stillerini yeniden yazıyor. Çalışan yöntem: JS'ten inline stil, ve `display`
> gibi uygulamanın dokunmadığı özellikler.

**Teknik seçim:** Tek sayfalık HTML + elle yazılmış SVG grafikler. Dışarıdan kütüphane yok.
Streamlit yerine bu seçildi çünkü: (a) GitHub Pages'e doğrudan yüklenir, (b) Streamlit Cloud
ücretsiz planda uykuya geçer ve link tıklandığında 30-60 sn bekletir, (c) görsel kontrol tamamen
bizde, (d) Mehmet zaten GitHub'a yükleyecek.

**Mehmet'in beklentisi: "daha profesyonel bir arayüz."** 2. seanstaki HTML maketi içerik olarak
onayladı ama görsel çıtayı yükseltmek istiyor. Bu henüz tam karşılanmadı — v1 teslim edildi,
geri bildirim bekleniyor.

**Çalıştırma — iki yol:**

1. **Live Server (kolay).** Mehmet 5. seansta VS Code'a bu eklentiyi kurdu. `cikti/index.html`
   dosyasına **sağ tık → "Open with Live Server"**. Varsayılan port 5500, alt çubukta görünür.
   Dosya kaydedilince tarayıcıyı otomatik yeniler.

2. **Terminal:**
```bash
cd Desktop/iett-projesi/cikti && python3 -m http.server 8000
```
Sonra `http://localhost:8000`. Komutu çalıştıran pencere açık kalmalı; `Ctrl+C` ile durur.

Çift tıklayarak açılmaz — `fetch()` `file://` üzerinden JSON okuyamaz (tarayıcı güvenlik
kısıtı). GitHub Pages'te bu adım gerekmez, GitHub sunucu görevini üstlenir.

> **5. seansta Mehmet bunu sordu, anlatıldı:** sunucu = bir klasörü "isteyen olursa dosyayı
> ver" diye dinleyen küçük program; `localhost` = kendi bilgisayarın (dışarıya kapalı);
> port (8000/5500) = kapı numarası, sen seçiyorsun.

**JSON yapısı:**
```json
{
  "ozet": {"hat_sayisi":676, "oneri_sayisi":96, "etkilenen_hat":41,
           "toplam_ek_sefer":162, "kapasite":110, "zirve_saat":8, "zirve_ek_arac":97.0,
           "azalt_sayisi":3107, "azalt_hafta_ici_sefer":2419, "net_hafta_ici_sefer":-2257,
           "supheli_hat_sayisi":30, "talep_kaynagi":"...", "sentetik_not":"..."},
  "hatlar": {
    "11ÜS": {"ad":"...", "sefer_suresi":164.3, "uzunluk":...,
             "WEEKDAYS": {"yolcu":[24 eleman], "sefer":[24], "doluluk":[24]},
             "SATURDAY": {...}, "SUNDAY": {...}}
  }
}
```
Diziler **tam 24 elemanlı** (`reindex(range(24))` ile eksik saatler `null`), böylece
JavaScript'te `doluluk[16]` doğrudan saat 16 demek.

**Dashboard içeriği:** 4 KPI kutusu · hat arama (kod veya güzergâh) · gün tipi sekmeleri ·
kaynak rozeti (yeşil "Gerçek ölçüm" / turuncu "Sentetik veri") · ana doluluk grafiği
(110 üstü çubuklar kırmızı, hover ipucu) · saatlik yolcu ve sefer grafikleri · öncelikli hatlar
tablosu (tıklanabilir) · açılır "Yöntem ve kısıtlar" bölümü · koyu tema düğmesi.

---

### 10. ⭐ TELEFON UYGULAMASI — `mobil.html` (6. seans)

**Neden ayrı sayfa yapıldı — ölçüldü:** Masaüstü dashboard'u 375 px genişlikte açıldığında
tablolar **823 px** ve kapsayıcıları `overflow: hidden`. Yani **EK SEFER ve EK ARAÇ
sütunları** — asıl cevap — ekranın dışında kalıyor ve kaydırılamıyor. Manşet bloğu da tek
başına bir ekranı dolduruyor.

Ayrıca telefonda yapılan iş farklı: masaüstünde 96 satırlık tabloyu tararsın, telefonda
"şu hat şu an ne durumda" diye bakarsın. Sıkıştırılmış masaüstü değil, ayrı bir uygulama gerekti.

**Üç ekran, alt gezinme çubuğuyla (başparmak erişimi):**

| ekran | ne yapar |
|---|---|
| **Şu an** | Telefonun kendi saatine ve gününe bakar; o saatte kapasite üstünde kalan hatları yoğundan sıralı listeler. Sahada açılacak ekran bu. |
| **Ara** | Hat kodu veya güzergâh adı araması |
| **Hat detayı** | 24 saatlik çubuk grafik + kapasite çizgisi + o anki saat vurgulu, altında saat saat öneriler. Gün tipi sekmeleri; hafta sonunda "sentetik" uyarısı |

**Veri kaynağı aynı:** `dashboard_veri.json`. Yeni boru hattı gerekmiyor — `05_boru_hatti.py`
çalıştığında telefon uygulaması da güncellenmiş olur.

> `hatlar[kod][gunTipi].doluluk[saat]` alanının **etkin_doluluk** (anlık yolcu) taşıdığı
> doğrulandı — doğrudan 110 ile kıyaslanabiliyor, ayrıca devire bölmek gerekmiyor.

**PWA — ana ekrana kurulabiliyor:**
```
manifest.json   ad, ikon, tam ekran, koyu tema
sw.js           önce ağ / olmazsa önbellek → internetsiz de açılır
ikon-192.png    amblemden üretildi (Pillow ile kare tuvale ortalandı)
ikon-512.png
```
Telefonda: Paylaş → **Ana Ekrana Ekle**. İkonu ve adı olur, tarayıcı çubuğu olmadan açılır.
⚠️ Servis işçisi **HTTPS** ister — GitHub Pages'te çalışır, yerel ağda çalışmaz (sorun değil,
sayfa yine açılır, sadece çevrimdışı önbellek devre dışı kalır).
⚠️ Veri güncellenince `sw.js` içindeki `SURUM` sabiti artırılmalı, yoksa eski önbellek kalır.

**⚠️ KÖPRÜ AĞA AÇILDI.** Telefondan erişebilmek için `11_canli_kopru.py`'de dinleme adresi
değişti:
```python
ThreadingHTTPServer(("0.0.0.0", PORT), Kopru)   # önce "127.0.0.1" idi
```
> `127.0.0.1` sadece bu bilgisayarı, `0.0.0.0` aynı Wi-Fi'deki tüm cihazları kabul eder.
> Telefondan açmak için: `http://<bilgisayarın-yerel-IP>:8770/mobil.html`
> IP'yi öğrenmek: `ipconfig getifaddr en0`

**⚠️ DURUM: telefonda henüz test EDİLMEDİ.** Tarayıcı önizlemesinde (375×812) çalıştığı
doğrulandı — yatay kaydırma yok, 16 kart listelendi, hat detayı ve arama çalıştı.
Ama Mehmet gerçek telefonda açamadı ve konu **bilinçli olarak ertelendi**. Yeni veri
öncelikli. Devam edilirse ilk adım: köprüyü yeniden başlatıp telefondan IP ile açmak.

### 13. ⭐⭐ GİRİŞ SAYFASI — `giris.js` (7. seans)

**Dosya:** `notlar/dashboard_ek_betikler/giris.js`

**Neden:** Manşet metni (uzun başlık + paragraf + rozetler) panonun içindeyken
ekranın üçte birini kaplıyor, her bölüme inerken göz yoruyordu. Mehmet:
*"sloganlar yazı kalabalığı yapıyor, göz yoruyor."* **Metin yanlış değildi, yeri
yanlıştı** — anlatı girişe taşındı, panoda sayılar kaldı.

**Ne yapıyor:** Pano açılışta tam ekran bir perdeyle karşılıyor —
İETT amblemi · mono etiket · manşet cümlesi (son parça kırmızı vurgulu) ·
paragraf · üç veri künyesi rozeti · altta `SPACE panoya geç` ipucu.
**SPACE / Enter / ↓ / tıklama / aşağı kaydırma / dokunmatik yukarı sürükleme**
ile perde yukarı kayıp (0,8 sn, `cubic-bezier(.76,0,.24,1)`) panoya geçiyor.
Geçiş bitince DOM'dan siliniyor — arkadaki tıklamaları engellemesin.

**Arka plan tamamen SVG — dışarıdan görsel çekilmiyor.** Pano çevrimdışı da
açılabilmeli (Bölüm 9 "kendi kendine yeter" ilkesi). Elle çizilen boğaz silueti:
uzak tepeler · Süleymaniye benzeri camii (kubbe + 4 minare) · Boğaz Köprüsü
(iki kule + askı halatları) · Kız Kulesi · su ve yansımalar. Üstünde amblemden
yayılan kırmızı ışık (radial-gradient).

**Panodaki manşet bloğu gizleniyor** (`display:none`), silinmiyor — `manset.js`
ve `kenar.js` onu arıyor. Pano artık doğrudan `HAFTA İÇİ NET −2.257` kartlarıyla
başlıyor.

> ⛔ **METİN GEÇ DÜZELİYOR — ilk denemede giriş cümlenin TERSİNİ gösterdi.**
> ```
> ham şablon      → "kaynak yanlış dağılmış değil, yetersiz"      ✗
> manset.js sonrası → "kaynak yetersiz değil, yanlış dağılmış"     ✓
> ```
> `manset.js` başlığı ve paragrafı sonradan yeniden yazıyor (paketlenmiş
> şablondaki ham metin kendi rakamlarıyla çelişiyordu — Bölüm 9 madde 8).
> Giriş metni erken okuyunca **projenin bulgusunun tam tersini** ekrana
> basıyordu. Çözüm: metin ~3,2 sn boyunca 200 ms'de bir izleniyor, değiştikçe
> giriş güncelleniyor, manşet ancak metin oturduktan sonra gizleniyor.
> **Ders: başka bir betiğin sonradan düzelttiği metni okuyorsan, ne zaman
> düzeldiğini bil.**

> ⚠️ **SVG tuzağı:** `preserveAspectRatio="xMidYEnd slice"` geçersiz —
> dikey hizada `YMin/YMid/YMax` var, `YEnd` yok. Tarayıcı SVG'yi çizmiyor ve
> konsola hata yazıyordu. Doğrusu `xMidYMax slice`.

---

### 12. ⭐ KENAR ÇUBUĞU + HARİTA YENİDEN TASARIMI (7. seans)

**Dosyalar:** `notlar/dashboard_ek_betikler/kenar.js` (yeni) · `akordeon.js` (harita bölümü)

#### Kenar çubuğu — `kenar.js`

`menu.js` kaldırılınca menü öğelerinin hover/aktif vurgusu da gitmişti ve panel
amatör görünüyordu. Yeni betik:

- **Aktif bölüm** sayfa kaydırıldıkça kendiliğinden değişiyor (sol vurgu çubuğu,
  dolu nokta, kalın yazı). `menu.js` bunu tıklamaya bağlıyordu; kaydırmaya
  bağlamak doğrusu — kullanıcı fareyle de geziyor.
- **Her öğenin altında tek satırlık sade açıklama** — *"Değerlendirilemeyen →
  verisi yetersiz hatlar"*. Dashboard'u ilk kez gören biri için.
- **Uzun teknik kaynak metni katlandı** (`Veri kaynakları ▾`). Silinmedi:
  veri kaynağını beyan etmek raporun parçası, ama menüde slogan gibi duruyordu.
- Logo satırı menü öğeleriyle aynı hizaya çekildi, ayırıcı çizgiler, tema
  düğmesi tam genişlik.
- ⭐ **İETT amblemi geri getirildi** — kodu `menu.js`'in içindeydi, o betik
  kaldırılınca amblem de kaybolmuştu. `kenar.js`'e taşındı.

> ⛔ **Kod taşınırken HATASI DA TAŞINDI.** `menu.js` manşet bloğunu *"genişliği
> 700 px'den büyük ata"* diye arıyordu. Devir dosyası bu kırılganlığı zaten
> uyarmıştı (Bölüm 9 madde 3'ün eski notu) ama taşırken fark edilmedi ve amblem
> yine hiç eklenmedi. Ölçülen zincir: `49x33 → 0x130 → 80x1342` — hiçbiri kurala
> uymuyor, çünkü paketleyicinin ara sarmalayıcıları dejenere kutu üretiyor
> (genişlik 0). **Çözüm `manset.js`'te zaten vardı:** ölçüye değil YAPIYA bak —
> etiketten yukarı çıkarken *içinde `h1` bulunan* ilk ata manşet bloğudur.
> **Ders: bir dosyadan kod taşırken o dosyanın bilinen hatalarını da kontrol et.**

> ⚠️ **TUZAK — açıklama metni DOM'a eleman olarak EKLENMEZ, CSS ile üretilir.**
> İlk sürümde menü metni `<span class="mk-nav-ad">` içine sarılmıştı. `okunurluk.js`
> bölüm özetlerini yerleştirmek için *"metni tam olarak SEFER AZALT olan, çocuğu
> olmayan eleman"* arıyor — sarmalayıcı span o aramaya takıldı ve **azaltma
> bölümünün özet kutusu menünün ortasına yerleşti.** Çözüm: metin `data-mk-alt`
> özniteliğinde, ekrana `a::after{content:attr(data-mk-alt)}` ile çıkıyor.
> Metin düğümüne hiç dokunulmuyor.

#### Harita — `akordeon.js` içinde yeniden tasarlandı

**Kaldırıldı:** haritanın altındaki durak gezgini (`◀ ▶` + kaydırıcı +
"ŞİFA SONDURAK 1 / 64" sayacı). Yerini haritanın kendisi aldı.

**⭐ TEK GÖRSEL DEĞİŞKEN İLKESİ.** Önce hem çizgi hem noktalar doluluğa göre
renkleniyordu; çizgi kalın (4-12 px) ve renkliydi, noktaları eziyordu. Mehmet
haklı olarak *"berbat"* dedi. Yeniden kurulan düzen:

```
ROTA ÇİZGİSİ  →  bilgi TAŞIMAZ. İnce (1.8 px), soluk (%55), noktalı
                 (dashArray "1 9", yuvarlak uç). Sadece "güzergâh buradan geçiyor".
DURAK NOKTASI →  bilgiyi TAŞIR. Rengi o saatteki doluluk.
```

Bir görsel değişken, bir anlam. İki bilgi aynı çizgiye binince ikisi de okunmuyordu.

#### ÜÇÜNCÜ VE SON HALİ — çizgi de renk taşıyor, yönler ayrı

İkinci denemede çizgi bilgi taşımıyordu (ince, soluk, gri). Mehmet: *"çizgiler
hiç belli olmuyor, yoğunluğa göre çizginin de rengi değişsin, gidiş dönüş ayrı
gösterilsin."* Haklıydı — bilgiyi tamamen noktalara yıkmak çizgiyi anlamsız
bırakmıştı. Nihai düzen:

```
ÇİZGİ    → yoğunluğa göre RENKLİ, 3.5 px, altında koyu "kılıf" (casing)
DURAK    → BEYAZ dolu + çizgiyle aynı renkte halka  (metro haritası dili)
GİDİŞ    → düz çizgi      ·  DÖNÜŞ → kesik çizgi
```

- **Kılıf (casing):** çizginin altına koyu, biraz kalın ikinci bir çizgi.
  Açık harita zemininde çizginin kenarı belirsiz kalıyordu; kılıf her zeminde
  okunur yapıyor. Kartografyanın standart yöntemi.
- **Durak beyaz dolu:** önce dolu renkli nokta denendi — çizgiyle aynı renk
  olduğu için çizginin içinde kayboluyordu. Beyaz dolu + renkli halka hem
  çizgiden ayrışıyor hem rengi taşıyor.

**⭐ GİDİŞ VE DÖNÜŞ AYRI RENKLENİYOR.** Bölüm 6.13'te ölçüldüğü gibi iki yönün
doluluğu çoğu hatta belirgin farklı (500T 08:00 → gidiş 113, dönüş 181). Tek
renkli çizgi bunu gizliyordu. Haritanın altında **yön seçici** var:

```
[ İki yön ]  [ — Gidiş ]  [ ‑‑‑ Dönüş ]      — ŞİFA SONDURAK 113   ‑‑‑ 4.LEVENT METRO 181
```

Seçim çizgiyi, durakları ve etiketleri birlikte süzüyor (iki yön 35 nokta →
tek yön 17-18). Sağdaki iki değer o saatteki gidiş/dönüş doluluğu, kapasiteyi
aşınca kırmızıya dönüyor.

**Veri kaynağı:** `akordeon.js` artık `yon_veri.json`'u da okuyor
(`detay[hat][gün][saat]` → `eG`/`eD`). `dashboard_veri.json` yalnızca yönsüz
doluluk taşıyor. Dosya yoksa harita yönsüz değere düşüp sessizce çalışmaya
devam ediyor.

> ⛔ **AYNI İSİM ÇAKIŞMASI HATASI İKİNCİ KEZ YAPILDI.** Yön düğmelerine
> `data-mk-yon` verilmişti — `yon.js` ANLIK YOLCU hücrelerini tam olarak bu
> adla damgalıyor, seçici 40 hücreyi yakaladı. `data-mk-rota` olarak
> değiştirildi. **Beş ek betik aynı isim uzayını paylaşıyor; `mk-` önekli bir
> öznitelik adı seçmeden önce diğerlerinde geçip geçmediğine bakılmalı.**

> ⛔ **HOISTING TUZAĞI.** `yonAd` değişkeni HTML şablonundan SONRA
> tanımlanmıştı. `var` bildirimi yukarı taşır ama değeri taşımaz → şablon
> çalışırken `undefined`, `yonAd.G` patlıyor ve harita
> *"Cannot read properties of undefined (reading 'G')"* ile hiç açılmıyordu.
> Şablonda kullanılan her değişken şablondan ÖNCE tanımlanmalı.

#### ⛔ İKİNCİ DENEMEDE DE KÖTÜYDÜ — YOĞUNLUK SORUNU

Çizgi inceltilip renk noktalara taşındıktan sonra bile harita **kalın turuncu
bir bant** gibi görünüyordu. Sebep nokta boyutu değil **YOĞUNLUK**: 500T'nin
64 durağı, hattın tamamını gösteren uzaklıkta ekranda 2-3 piksel arayla düşüyor.
Noktalar birbirine değince tek bir şerit oluşturuyor ve altındaki ince çizgiyi
tamamen örtüyor. Noktayı küçültmek çözmez — aralık aynı kalır.

**Çözüm — yakınlaştırmaya göre seyreltme** (haritacılıkta standart):
ekranda iki nokta arası en az **16 piksel** kalacak şekilde açgözlü seçim.
Uzakken 64 duraktan **16'sı** görünüyor, yaklaştıkça hepsi açılıyor
(`hrt.on("zoomend", duraklariSeyrelt)`). Uç duraklar her zaman görünür.

> **Ders:** görsel kalabalık sorunu genelde eleman BOYUTUNDA değil
> ARALIĞINDA çözülür.

**Eklendi:**
- **Duraklar harita üstünde nokta** (`L.circleMarker`) — 500T'de 64 nokta,
  uzak görünümde 16'sı çizilir (yukarıdaki seyreltme)
- **İki ayrı görsel dil:** ara durak = küçük dolu daire (r 3.4) + **ince KOYU
  halka**; uç durak = beyaz dolu + kalın renkli halka (r 6.5). Uç duraklar
  büyük değil **farklı** — klasik başlangıç/bitiş işareti.
  ⚠️ Halka rengi **beyaz değil koyu**: harita zemini açık (CARTO voyager),
  beyaz halka zeminde kayboluyordu.
- **Nokta rengi = o saatteki doluluk.** Saat kaydırıcısı oynayınca noktalar
  renk değiştiriyor; saatlik bandı çizgiden değil noktalardan okuyorsun
- **Üstüne gelince durak adı** çıkıyor, nokta büyüyor
- **İlk ve son durağın adı kalıcı etiketle** yazılı (`ŞİFA SONDURAK` →
  `4.LEVENT METRO`) — hattın iki ucu bir bakışta
- **Renk skalası lejantı** (41 parçalı geçiş, `0 · 110 · 220+`) — noktaların
  rengi neye karşılık geliyor, orada yazıyor
- Leaflet'in varsayılan beyaz tooltip/zoom düğmeleri karanlık temaya uyarlandı

#### ⭐ "Hat incelemesi"nde ENTER kısayolu

Arama kutusuna `76O` yazıp Enter'a basınca **üstteki profil kartı** o hatta
geçiyor — tüm grafikler, saatlik yolcu, saatlik sefer, öneri kutusu.

> ⛔ **`stopPropagation` uygulamanın kendi seçimini boğuyordu.** `akordeon.js`
> satır tıklamasını yakalayıp `e.stopPropagation()` çağırıyordu; olay orada
> kesilince React'in satır seçimi hiç çalışmıyor, profil kartı eski hatta
> takılı kalıyordu. **Bu yalnızca Enter kısayolunu değil, ELLE TIKLAMAYI da
> bozuyordu** — fark edilmemiş bir hataydı. `stopPropagation` kaldırıldı;
> akordeon paneli ile kartın güncellenmesi birbirini engellemiyor.

#### ⚠️ OTOBÜS SİMGESİ UÇ DURAĞI ÖRTÜYORDU

Harita açılır açılmaz otobüs simgesi ilk durağın tam üstüne oturuyor, hem
noktayı hem kalıcı etiketini gizliyordu — "bir uç belirgin, diğeri görünmez".
Otobüs artık **yalnızca "Otobüsü izle" açıkken** haritada. Ayrıca kalıcı uç
etiketleri `openTooltip()` ile elle açılıyor: Leaflet bunları katman eklenirken
açıyor, ama tooltip `addTo` sırasında henüz bağlı olmadığı için ikinci uçta
hiç çizilmiyordu.

#### ⛔ BU SIRADA BULUNAN GERÇEK HATA — `kodBul` önbelleği bayat kalıyordu

Enter kısayolu test edilirken `98KM` arandı ama **41N'in paneli açıldı.**

```
hücre metni : 98KM      ← React satırı geri dönüştürmüş
mkKod       : 41N       ← akordeon eski kodu saklamış
```

`akordeon.js`'in `kodBul()` fonksiyonu hat kodunu bir kez okuyup `tr.dataset.mkKod`'a
yazıyor ve sonraki çağrılarda doğrudan onu döndürüyordu. React ise tabloyu
süzerken (arama kutusu, gün tipi düğmeleri) **aynı `<tr>` elemanlarını geri
dönüştürüp içeriğini değiştiriyor** — önbellek eski hatta ait kalıyor.

⚠️ **Bu yalnızca Enter kısayolunu değil, ARAMADAN SONRA ELLE TIKLAMAYI da
bozuyordu.** Var olan ve fark edilmemiş bir hataydı.

**Çözüm:** önbelleğe güvenilmiyor, kod her seferinde hücreden yeniden okunuyor.
`mkKod` yalnızca dışarıya bilgi olarak yazılıyor. Maliyet ihmal edilebilir
(sadeleştirme 20-100 satırda dönüyor).

---

### 11. ⭐⭐ YÖN BOYUTU + SEFER TARİFESİ — `yon.js` (7. seans)

**Dosya:** `notlar/dashboard_ek_betikler/yon.js` · **Veri:** `cikti/yon_veri.json`
(571 KB, `14_yon_duzeltmesi.py` üretir) · Diğer ek betiklerle aynı sözleşme:
**dosya yoksa sessizce hiçbir şey yapmaz.**

Betik iki iş yapıyor. Her ikisi de "Sefer artır" bölümünün içinde — **ayrı bölüm
YOK.** *(İlk sürümde ayrı bir "Yön analizi" bölümü kurulmuştu; Mehmet
"bölümü kaldıralım, Sefer artır'a taşıyalım" dedi ve kaldırıldı.)*

#### (a) ANLIK YOLCU sütunu → çift bar

**Önce:** tek sayı + tek çubuk (`146 / 110`) — `okunurluk.js` kuruyordu.
**Şimdi:** aynı hücrede iki bar, `G` / `D` etiketli, sayı yazısı yok
(kesin değerler `title` ile).

```
G ▓▓▓▓▓▓▓▓▒▒▒▒     ▓ kapasiteye kadar (yeşil / çok boşsa mavi)
D ▓▓▓▓▓▓▒▒          ▒ AŞAN kısım (kırmızı)
          ┊         ┊ kesikli kapasite çizgisi
```

Ölçek tablo genelindeki en büyük değere göre — hiçbir bar kırpılmıyor. Yön verisi
olmayan satırlar tek barla, `—` etiketiyle (eski görünümde bırakmak sütunu
karıştırıyordu).

> ⚠️ **Gün tipi meselesi — ilk teşhis YANLIŞTI, düzeltildi.** Barlar önce yalnızca
> `#artir`'a uygulanmıştı; gerekçe *"azaltma tablosu üç gün tipini birlikte
> listeliyor, satırda gün tipi yazmıyor"* idi. Sonradan görüldü ki **azaltma
> bölümünün kendi gün tipi süzgeci var** (sağ üstte Hafta içi / Cumartesi / Pazar)
> ve seçili olan `background: var(--marka)` ile işaretli. `aktifGun()` bunu okuyup
> doluluğu o gün tipinden alıyor; süzgeç değişince damgalar silinip barlar
> yeniden çiziliyor. Doluluk `detay` bloğundan okunuyor — orada üç gün tipi de var
> (`hatlar` yalnızca hafta içini taşıyor).
>
> ⚠️ **Doğrulanamayan tek yol:** gün tipi düğmesine tıklandığında barların
> yenilenmesi. Önizleme tarayıcısında React'in kendi olay işleyicisi ne `el.click()`
> ne de elle üretilen `PointerEvent` dizisiyle tetiklenebildi. Kod yazılı ama
> **gerçek tarayıcıda test edilmedi** — Cumartesi/Pazar'a geçip barların
> değiştiğini gözle doğrulamak gerekiyor.

#### (b) Akordeon paneline SEFER TARİFESİ TABLOSU eklendi

Mehmet'in isteği: *"İETT'nin kendi tarife sayfasındaki gibi tablo çıksın — birebir,
renkleri ve yazı boyutlarıyla."* Kaynak görsel: `iett.istanbul` 76O tarife sayfası.

> İlk sürümde 24 saatlik grafik **kaldırılıp** yerine tablo konmuştu. Mehmet
> *"grafik de güzel, dursun, tarife ekstrası olsun"* dedi → grafik yerinde kaldı,
> tablo onun **altına** giriyor. Grafik genel görünümü, tarife somut dakikaları
> veriyor.

```
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│      ŞİFA SONDURAK KALKIŞ        │  │     4.LEVENT METRO KALKIŞ        │  sarı #FDD100
├──────────┬──────────┬────────────┤  ├──────────┬──────────┬────────────┤
│İş Günleri│Cumartesi │   Pazar    │  │İş Günleri│Cumartesi │   Pazar    │  gri #F2F2F2
├──────────┼──────────┼────────────┤  ├──────────┼──────────┼────────────┤
│  06:12   │  06:24   │   07:20    │  │ ⬛07:06  │  07:20   │   07:10    │  kırmızı #E4002B
│  06:18   │  06:31   │   07:30    │  │ 🟩+07:10 │  07:30   │   07:20    │  beyaz zemin
```

- Blok başına bir yön, başlık **`<KALKIŞ NOKTASI> KALKIŞ`** — ad
  `guzergahlar.json`'daki o yönün ilk durağından
- Sütunlar **İş Günleri / Cumartesi / Pazar** — üçü de gerçek tarife
- **Renk yalnızca İş Günleri sütununda**, çünkü doluluk yalnızca hafta içi ölçüldü:
  kapasite üstü → kalın kırmızı + pembe zemin · 20 altı → gri · normal → kırmızı
- **Önerilen yeni kalkışlar** `+07:10` biçiminde, yeşil kalın, açık yeşil zeminde,
  hafta içi sütununa sıralı olarak giriyor

> Karanlık temanın içinde **bilerek açık renkli**: resmi tarife belgesi gibi
> görünsün, analizden ayrıştığı belli olsun.

**Bu, "dakika bazlı sefer planı" maddesini kapatıyor.** Öneri artık
*"saat 17'ye +1 sefer"* gibi soyut değil, *"17:20'ye ekle"* gibi somut.

#### Ekleme dakikası nasıl seçiliyor

Veri temeli sağlam: `sefer_ham` her kalkışı dakikasıyla taşıyor. Resmi sayfayla
karşılaştırıldı — 76O pazar sütunu **birebir aynı**
(`06:20 06:50 07:20 07:40 08:00 08:15`).

**İlke: mevcut kalkışlara DOKUNMA, en büyük aralığın ortasına ekle.** İETT
pratiğinde tercih edilen yol; yolcunun alıştığı saatler korunur, araları sıklaşır.
4 dakikadan sık kalkış önerilmiyor.

> ⚠️ **Dakika yerleşimi ÖLÇÜM DEĞİL, KARARDIR.** Talep saatlik olduğu için saat
> içindeki dağılım bilinmiyor. Panelde ve rapora bu ibareyle girmeli.

**İki hata yapıldı ve düzeltildi:**
1. **Eşit boşluklarda `max` sonuncuyu seçiyordu** (demet karşılaştırması).
   76O dönüş saat 17'de kalkışlar `17:10 · 17:30 · 17:50`, üç boşluk da 20 dk →
   sonuncusu seçilip orta nokta `18:00` çıkıyor, saatin dışına düşüp eleniyordu.
   **Sonuç: dönüş yönünde hiç öneri üretilmiyordu.**
   Çözüm: `key=lambda t: (t[0], -t[1])` ile erken olanı seç.
2. **Sınıra düşen öneri siliniyordu.** Çözüm: `min(orta, bit - 1)`.
   → Düzeltmeden sonra **172 önerinin 172'sinde** ekleme dakikası var.

#### ⛔⛔ EN PAHALI HATA — `data-mk-gun` İSİM ÇAKIŞMASI

Barlar azaltma tablosuna da açılınca **"Sefer artır"da hiçbir satır açılmaz oldu.**
Grafik yok, tarife yok, panel yok. Konsolda tek hata bile yok — sessiz.

**Sebep:** gün tipi değişince barları yenilemek için bölüme damga basıyordum:

```js
kapsam.dataset.mkGun = "I";   →  <section id="artir" data-mk-gun="I">
```

`akordeon.js`'in tıklama işleyicisi ise gün tipi düğmesini şöyle arıyor:

```js
var gunBtn = e.target.closest("[data-mk-gun]");
if (gunBtn) { e.preventDefault(); e.stopPropagation(); ...; return; }
```

Satıra tıklandığında olay yukarı çıkarken **bölümün kendisi** gün düğmesi sanılıyor,
`stopPropagation` ile kesiliyor ve panel hiç açılmıyordu. `#supheli` çalışıyordu
çünkü oraya damga basmıyordum — teşhisi veren ipucu bu oldu.

**Çözüm:** damga adı `data-mk-yon-gun`. **`mk-` önekli attribute adı seçerken
diğer ek betiklerin ne aradığına bakılmalı** — hepsi aynı isim uzayını paylaşıyor.

> **Nasıl bulundu (yöntem kayıt için):** betik tamamen çıkarıldı → panel açıldı.
> Sonra parça parça geri kondu: yalnızca CSS → çalıştı; CSS + barlar → bozuldu.
> Böylece suçlu barlara indi, oradan da attribute'a. Exception aramak boşunaydı,
> çünkü hata bir istisna değil **erken `return`**'dü.

#### Üç teknik tuzak (üçü de yaşandı — ileride bu panele dokunacak olan bilsin)

**1. `fetch` önbelleği.** `yon_veri.json` boru hattı her çalıştığında yenileniyor
ama tarayıcı eskisini veriyordu; panel *"tarife dökümü yok"* diyordu.
Çözüm: `fetch(..., {cache: "no-cache"})`.

**2. İç içe tablo seçicisi.** Akordeon paneli dış tablonun `<tbody>`'si içinde.
Bu yüzden `#artir tbody tr` seçicisi **tarife tablosunun satırlarını da yakalıyor.**
Doğrulama sırasında dış tablo satırları gizlenmek istenince tarife başlığı da
gizlendi ve tablo yokmuş gibi göründü. Dış tabloyu hedeflerken
`:scope > tbody > tr` kullanılmalı.

**3. Panel dönüşümü GECİKMESİZ olmalı.** İlk sürümde `tabloBarlari` ile aynı
120 ms'lik gecikmeye bağlıydı ve kullanıcı grafiğin bir an görünüp kaybolduğunu
görüyordu. Ayrıldı: panel dönüşümü gözlemcide anında, bar dönüşümü gecikmeli
(`okunurluk.js` aynı hücreyi kurduğu için önce onun bitmesi gerekiyor).
Ölçüldü: tıklamadan sonra **0 ms**'de tablo hazır, grafik hiç boyanmıyor.

**Grafiği nasıl buluyor:** panel içindeki `<svg>`'den yukarı çıkıp panelin
doğrudan çocuğu olan bloğu buluyor, onu tabloyla değiştiriyor; hemen ardındaki
*"Kırmızı sütunlar…"* açıklama satırını da kaldırıyor. `akordeon.js`'in yapısına
dokunmuyor — o betik yeniden üretilirse bu kanca da gözden geçirilmeli.

#### (c) ÇIKARILABİLECEK KALKIŞLAR — azaltma tarafı da tarifede

Tarife tablosu artık **"Sefer azalt" bölümünde de** açılıyor ve azaltma listesinden
gelen kalkışlar **üstü çizili, turuncu** gösteriliyor.

**Hangi kalkışın çıkarılacağı nasıl seçiliyor — İLK VE SON KALKIŞ KORUNUR,**
aradakiler eşit aralıkla seyreltilir. Böylece hattın çalışma penceresi daralmıyor,
yalnızca sıklık düşüyor. Eklemedeki *"mevcut kalkışlara dokunma"* ilkesinin
karşılığı. Azaltma yönsüz hesaplandığı için iki yöne, satır sayısına orantılı
dağıtılıyor; hiçbir saatte 2 kalkışın altına inilmiyor.

> ⚠️ Ekleme gibi bu da **ölçüm değil, karar** — hangi seferin kaldırılacağını
> talep verisi söylemiyor.

**Tarife kapsamı genişledi:** artırma (66) + azaltma (332) = **347 hat**.
Bu yüzden `yon_veri.json` büyüdü; `detay` bloğu sözlük yerine **dizi** olarak
yazılarak 1,5 MB'tan 0,5 MB'a indirildi (alan sırası `detay_alan`'da).
Nihai boyut **1,78 MB**.

#### (d) "Detaylar" düğmesi — tarifenin sağ altında

Tarife tablosunun altında sağa yaslı **`Detaylar ▾`** düğmesi. Açılınca hattın
tamamı görünüyor: **üç gün tipi sekmesi** (İş Günleri / Cumartesi / Pazar), her
birinde günlük yolcu · günlük sefer · dolu saat özeti ve saat saat tablo —
`SAAT | YOLCU | SEFER | <GİDİŞ ADI> | <DÖNÜŞ ADI>`. Son iki sütun çift renkli
bar + sayı (kapasiteyi aşan kısım kırmızı), en yoğun saatin satırı vurgulu.

> ⚠️ **Hafta sonu sekmelerinde sarı uyarı şeridi çıkıyor:** *"Bu gün tipinin
> YOLCU sayıları sentetik — hafta içi eğrisinden türetildi (cumartesi %72,
> pazar %52). Sefer saatleri ve yön oranı gerçek ölçüm."* Bölüm 7'deki taahhüt
> gereği sentetik rakam etiketsiz gösterilmiyor.

**Bunun için boru hattı üç gün tipine açıldı** (7. seans): yön oranı artık
`hat + GÜN TİPİ + saat` kırılımında ölçülüyor. Hafta sonu deseni hafta içinden
farklı (işe gidiş yok, gün ortası ağırlıklı) — aynı oranı uygulamak yanlış olurdu.
`doluluk_yonlu.csv` 10.578 → **28.391 satır**, öneri sayıları değişmedi.

~~**Neden hafta sonu için sefer ekleme önerisi YOK:**~~ ⭐ **DEĞİŞTİ (8. seans) —
artık VAR.** Gerekçe ve sayılar Bölüm 8'deki *"Hafta sonunda neden öneri çıkmıyor"*
başlığında. Kısaca: sentetik olan **seviye**, taşmanın kendisi değil; üstelik
çarpanlar ölçülen gerçeğin altında, yani susmak sıkışıklığı gizliyordu.
Tarifede hafta sonu önerileri **kesik yeşil çerçeveyle** çıkıyor (`td.yeni.sentetik`),
lejantta ayrı satırı var ve ipucunda "talebi SENTETİK" yazıyor — Bölüm 7'nin
"etiketsiz gösterme" şartı böyle karşılanıyor.

**Doğrulandı (7. seans, tarayıcıda):** 500T · 11ÜS · 14ES panellerinde 2 blok,
3 sütun, svg yok, öneriler ve renkler yerinde. Detaylar: 3 sekme, 21 satır,
cumartesi sekmesinde sentetik uyarısı çıkıyor. Konsolda hata yok. Diğer bölümler
(azalt 20 satır, hat incelemesi 15 satır, harita) etkilenmedi.

---

## 10. ⚠️ NOTEBOOK HÜCRE SIRASI BOZUK — ✅ ÇÖZÜLDÜ (5. seans)

> **BU SORUN ARTIK GEÇERSİZ.** `05_boru_hatti.py` yazıldı; notebook'u sırayla çalıştırmaya
> gerek yok. Aşağıdaki bölüm tarihsel kayıt olarak duruyor — notebook'a dönmek gerekirse
> (örneğin sefer verisini API'den yeniden çekmek için) hâlâ geçerli.
>
> **5. seansta ayrıca keşfedildi — notebook'un bozukluğu sanılandan fazla:**
> - **2. hücre çalışmıyor:** `sefer = pd.DataFrame(veri)` diyor ama `veri` değişkenini
>   tanımlayan hücre yok (eski bir denemeden kalmış). Sadece `import pandas as pd` satırı
>   işe yarıyor.
> - **23. hücre çalışmıyor:** `son` değişkenini kullanıyor ama `son` 26. hücrede üretiliyor.
>   İçindeki `import matplotlib`, `HAT`, `RENK`, `ETIKET` tanımları lazım olduğu için
>   26'dan önce çalıştırılması gerekiyordu → tavuk-yumurta.
> - **20. hücre tehlikeli:** o da `doluluk.csv` yazıyor ama **filtresiz/eski** sürüm.
>   26'dan sonra çalıştırılırsa doğru çıktının üstüne yazar.
> - **26. hücre 5. seansta düzenlendi:** başına `ARZ_EKSIK` listesi eklendi, filtre satırı
>   `isin(["34","34A"] + ARZ_EKSIK)` yapıldı. (Mehmet hücreyi bulamayınca yetki verdi;
>   düzenleme JSON seviyesinde, üç `assert` güvenlik kontrolüyle yapıldı.)


`03_arz_api.ipynb` 34 hücre. **Hücreler mantıksal sırada değil** — düzeltmeler sonradan alta
eklendiği için. Örnek: sentetik veri düzeltmesi 25. hücrede ama onu kullanan birleştirme 19-22.
hücrelerde. **Baştan `Run All` yapılırsa yanlış sonuç üretir** (ve API'ye 783 istek atıp 4 dakika
harcar).

Şu anki bellek durumu doğru; ama notebook yeniden açılırsa **hücreleri doğru sırayla elle
çalıştırmak** gerekir. Doğru sıra:

```
1  importlar + _soap
2  import pandas
4  hat listesi (API) → hatlar
10 783 hat sefer saatleri (API, ~4 dk) → sefer_ham
11 sefer_ham kaydet
12 saat sütunu + tanıma
13 arz tablosu → arz_ozeti.csv
17 GECERLI_GUNLER → gercek (5 gerçek gün)
18 import numpy
25 SAAT_DUZELTME + sentetik üretim   ← DÜZELTİLMİŞ SÜRÜM
26 talep_final + son + doluluk + grafik (birleşik hücre)
34 dashboard_veri.json
```

**✅ Bu iş yapıldı** — `05_boru_hatti.py` (Bölüm 3'e bak). Devir listesindeki 2. madde kapandı.

**Notebook'a dönmek gerekirse kısayol:** 2, 10, 11, 18, 23. hücrelerin yerine tek hücre:

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

sefer_ham = pd.read_csv("cikti/sefer_ham_20260806.csv")

HAT = "11ÜS"
RENK = {"WEEKDAYS": "#2a78d6", "SATURDAY": "#eb6834", "SUNDAY": "#1baf7a"}
ETIKET = {"WEEKDAYS": "Hafta içi (gerçek)", "SATURDAY": "Cumartesi (sentetik)",
          "SUNDAY": "Pazar (sentetik)"}
```
> Sonra sıra: 1 → (bu hücre) → 4 → 12 → 13 → 17 → 25 → 26 → 34.
> API'den sefer çekimi (10-11) atlanıyor, 4 dakika kazanılıyor.

---

## 11. KISITLAR — RAPORA GİRECEK

1. ~~**Yön bazlı analiz yapılamaz**~~ ✅ **KISIT KALKTI (7. seans, Bölüm 6.13).**
   İBB açık veri CSV'si (Ekim 2024) yön kaydetmiyor — bu doğru ve Mart 2023'te test edildi
   (Bölüm 6.4). Ama İETT'nin kendi raporlama sisteminde yön var; mentor verdi (Bölüm 4.5).
   Yön oranı artık **hat + saat düzeyinde ölçülüyor** (satırların %98'i 1. kademeden).
   Öneri listesi 96 → 172, ek sefer 162 → 262, zirve açığı 97 → 120 araç.
   **Kalan sınırlar:** (a) hatların %49'unda düzeltme uygulanamıyor — dengesiz tarifeli
   hatlar (`DENGE_ESIK`) ve tek yön çalışan saatler; (b) oran ağustos tatil haftasından,
   mevsimden bağımsız varsayılıyor; (c) azaltma listesi hâlâ yönsüz.
2. **Durak bazlı analiz yapılamaz.** İniş kaydı yok.
3. **Ölçülen şey "sefer başına biniş", "anlık doluluk" değil.** Güzergâh boyunca inip binenler
   nedeniyle gerçek doluluğun **üst sınırıdır**. **5. seansta sayısallaştırıldı** (Bölüm 6.10):
   devir katsayısı 1 → 1,7 arasında değişince zirve araç ihtiyacı 906'dan 164'e iniyor.
   Katsayı açık veriden kesin ölçülemiyor — **modelin en büyük belirsizliği budur**,
   sonucun işaretini bile değiştiriyor. İETT'nin yolcu sayım verisiyle netleşir.
4. **Talep Ekim 2024, arz güncel (2026).** Mehmet'in çerçevesi benimsendi:
   *"İETT'nin bugünkü tarifesi, 2024'te ölçülmüş talep seviyesini karşılıyor mu?"*
   Bu bir kusur değil, beyan edilmiş **model varsayımı**. Spearman 0,862 ile desteklendi.
   - Talep arttıysa → sıkışıklığı az görürüz (zararsız hata)
   - Talep düştüyse (yeni metro koridorları) → olmayan sıkışıklık uydururuz (tehlikeli)
   - Riskli koridorlar: Ümraniye–Ataşehir–Göztepe, Çekmeköy–Sancaktepe–Sultanbeyli,
     Pendik–Kaynarca–Tuzla, Halkalı–İstanbul Havalimanı (2025-26'da açılan metrolar)
   - Ayrıca İstanbul nüfusu son dönemde **azaldı** (~252 bin), artmadı.
5. **Ekim 2024 dosyası eksik** — 5 gün, hepsi hafta içi, pazartesi/salı yok.
6. **Hafta sonu sentetik.** Seviye katsayıları varsayım.
7. **Kapasite varsayımı ~110** (körüklü). Solo otobüs ~90, midibüs daha az; hangi hatta hangi
   araç çalıştığı açık veride yok. **Modeldeki tek serbest varsayım budur** — sefer sıklığı,
   araç sayısı, hepsi bundan türüyor. Duyarlılık için 90 ve 130 ile de çalıştırılabilir.
7b. **Araç sayıları ölçülmüş sürelere dayanır ama tam değil.** Canlı araç sayımıyla
   karşılaştırıldığında oran medyanı **1,16** — yani gerçekte %16 daha fazla araç yolda.
   Fark terminal beklemeleri ve servis dışı araçlardan (Bölüm 6.9). Araç sayıları
   **büyüklük mertebesi** olarak doğru, ±%20 hassasiyetle okunmalı.
8. **Metrobüs ailesinin tamamı analiz dışı** (8 kod: 34, 34A, 34AS, 34B, 34BZ, 34C, 34G, 34Z).
   Arz gerçek sıklığı yansıtmıyor, talep tek koda yığılmış (Bölüm 6.7).
8b. **Azaltma listesi artırma listesinden daha kırılgan.** Sıfıra yakın doluluk çoğu zaman
   gerçek boşluğu değil veri atfı hatasını gösterir; 30 hat bu yüzden korumaya alındı
   (Bölüm 6.8). Ayrıca azaltma listesinin **%77'si sentetik hafta sonu verisine dayanıyor** —
   ayrı bölümde ve etiketli sunulmalı.
9. **`SSERVISTIPI` duyarlılığı:** geniş tanım kullanıldı; dar tanımda öneri sayısı 3.869 → 4.740.
   *(Bu sayılar 4. seansa ait, 52 hat dışlanmadan önce ölçüldü — dar tanım analizi 5. seansta
   yeniden çalıştırılmadı. Rapora girerken ya güncellenmeli ya da "52 hat dışlanmadan önceki
   ölçüm" notuyla verilmeli.)*
9c. **103 hatta bir kalkış = gidiş+dönüş** (Bölüm 6.12). Doluluk bacak başına hesaplanıyor.
   Sınıflandırma azınlık yön payı %15 eşiğine dayanıyor; eşik civarındaki hatlar
   yanlış sınıflanmış olabilir. Düzeltme öneri listesini 178'den 96'ya indirdi.
9b. **52 hat analiz dışı** — arz verisinde dönüş seferleri eksik (Bölüm 6.5). Toplam
   dışlanan hat sayısı Metrobüs dahil **59**. Bu hatlar için hiçbir öneri üretilmiyor;
   gerçekte sıkışık olabilirler ama mevcut veriyle ölçülemiyor. *(Sessizce kaybolmasınlar
   diye rapora "veri yetersizliğinden değerlendirilemeyen hatlar" başlığıyla girmeli.)*
10. **Planlanan ≠ gerçekleşen.** İptal olan seferler görünmez.
11. **Kalkış saati ≠ biniş saati.** Uzun hatlarda bir saatte kalkan otobüs, sonraki saatte
    binen yolcuyu taşır. **5. seansta ÖLÇÜLDÜ** (Bölüm 6.6): zirve saatlerde arz atfı
    %8-23 sapıyor, erken sabahta %54-70. Saat 8'in açığı abartılı, saat 7'ninki eksik
    görünüyor. Düzeltme yol haritası çıkarıldı ama bilinçli olarak uygulanmadı.
    Sefer süreleri 10-484 dakika arasında (ortanca 90) — kayma uzun hatlarda büyük.
12. **Araç sayısı ölçümü tek bir ana ait** (7 Ağustos 09:27).
13. **Yön oranı ağustos haftasından ölçüldü** *(7. seans, Bölüm 6.13)*. Hat + saat
    düzeyinde gerçek ölçüm, ama kaynak **9-15 Ağustos 2026 tatil haftası**. Oranın
    mevsimden bağımsız olduğu varsayılıyor (hacim 2024'ten alındığı için seviye farkı
    zaten etkisiz). Okul döneminde desen keskinleşebilir — mentordan ekim haftası
    istenirse tek dosya değişikliğiyle test edilir.
14. **`DENGE_ESIK = 0.25` bir seçim** *(Bölüm 6.13)*. Bölüm 6.12'deki kodlama hatası
    talep tarafına da yansıdığı için, tarifesi dengesiz hatlarda yön düzeltmesi
    uygulanmıyor. Eşik ölçümle seçildi (arz/talep dengesizliği %25'ten sonra ayrışıyor)
    ama sınırda kalan hatlar için hâlâ bir karar. Daha düşük eşik listeyi şişirir,
    daha yüksek eşik kapsamı daraltır.
15. **Kritik yön sadeleştirmesi kaldırıldı — ama tek yönlü hatlarda hâlâ tek
    hesap var** *(7. seans, Bölüm 6.13)*. Artık her yön kendi yolcusunu kendi
    bacağıyla karşılıyor. Yön ayrımı uygulanamayan satırlarda (öneri listesinin
    %22'si) eski yönsüz hesap geçerli — o satırlarda gidiş/dönüş dengesizliği
    hâlâ görünmüyor.
16. **Metrobüs 2026 yön verisinde yok** (günde 98 yolcu görünüyor, gerçekte ~867 bin).
    Ayrı sistem, ayrı raporlanıyor. Analize etkisi yok — Metrobüs zaten Bölüm 6.7
    uyarınca dışlanmış durumda, ama rapora not düşülmeli.

---

## 12. ÖĞRENİLEN KAVRAMLAR

**pandas:** DataFrame, Series, NaN, `sep`, boolean indexing, method chaining, `.copy()`,
`groupby().size()`, `.transform("sum")`, `merge(how="inner"/"outer")`, `.map()`, `.isin()`,
`~` (değilleme), `.astype(str)`, `.nunique()`, `.value_counts()`, `.describe()`, `.nlargest()`,
`.drop_duplicates()`, `.reindex()`, `pd.to_numeric(errors="coerce")`, `chunksize`, `nrows`,
`.rank().corr()`, `.duplicated()`

**Python:** `def` ile fonksiyon, `for` döngüsü, `try/except`, sözlük, küme (`&`, `-`),
dilimleme `[:25]`, liste üretimi, `np.ceil`, `np.random.default_rng(seed)`, `time.sleep`

**matplotlib:** `plt.subplots`, `ax.bar`, `ax.barh`, `ax.plot`, `ax.axhline`, `ax.axvline`,
`ax.text`, `set_xticks`, `grid`, `set_axisbelow`, `spines`, `legend(frameon=False)`,
`tight_layout`

**Kavramlar:** API, SOAP, XML, JSON, endpoint, mojibake, chunk okuma, sentetik veri,
tekrarlanabilirlik (seed), Spearman vs Pearson, keşifsel veri analizi, duyarlılık analizi

**Notebook:** hücre çalıştırma sırası, `[ ]` = çalışmamış, kernel, `%pip install`,
her notebook'un kendi hafızası var, son ifade otomatik tablo olarak render edilir

**Web (dashboard anlatımında):** HTML/CSS/JS üç katman, CSS değişkenleri (`--degisken`),
`data-theme` ile tema, SVG `viewBox`, `fetch().then()`, ölçekleme fonksiyonu, `innerHTML`

**6. seansta eklenenler:**
- **Tanecik (grain):** bir tablonun bir satırının neyi temsil ettiği. `duplicated(subset=[...])`
  sıfır dönüyorsa o sütun kombinasyonu tablonun anahtarıdır
- **Join çözünürlüğü:** bir birleştirmenin çözünürlüğü **en kaba ortak anahtarına** eşittir —
  projenin çıktısının neden hat+gün tipi+saat'te kaldığının cevabı
- **WSDL okuma:** `?wsdl` ile servisin tüm metotları ve parametre adları çıkarılır
- **Rate limiting / kota:** API geçidinin istek sınırı; hata gövdesinde sebep yazar
- **TLS sürüm uyuşmazlığı:** eski LibreSSL modern sunucularla el sıkışamaz, `curl` kaçış yolu
- **Yüzen araç verisi (floating car data):** araçların GPS izinden trafik hızı çıkarma —
  ticari trafik servislerinin yöntemi
- **Rota motoru / yola oturtma (map matching):** koordinat dizisini gerçek yol ağına oturtmak
- **Dairesellik (circularity):** bir katsayıyı ölçmek istediğin şeyden türetmek —
  devir katsayısındaki temel sorun
- **Progressive disclosure:** aynı ekranı hem uzmana hem yeni okura açmak; bilgiyi silmeden
  katman eklemek (okunurluk.js)

**5. seansta eklenenler:**
- **Yerel sunucu mantığı:** `file://` vs `http://`, tarayıcının `fetch()` güvenlik kısıtı,
  `localhost` = kendi bilgisayarın, **port** = kapı numarası (8000/5500 keyfî seçilir),
  sunucunun "dinleme döngüsü" yüzünden sürekli açık kalması, VS Code **Live Server** eklentisi
- **CKAN açık veri API'si:** `package_show` ile veri seti metadata'sı, `size` alanından
  dosya boyutunu indirmeden okuma
- **Veri doğrulama katmanları:** boyut kontrolü yeterli değil → içerik (tarih kapsamı)
  kontrolü şart. "Büyük dosya = dolu dosya" yanılgısı
- **Notebook'un `.py`'ye taşınması:** neden script daha sağlam (sıra garantisi, tek komut,
  tekrar edilebilirlik) — notebook'un "hafızası" ile dosyanın içeriği farklı şeyler
- **`.ipynb` = JSON:** hücreler `cells` listesinde, `source` alanında kod satırları;
  `[28]` gibi köşeli parantezli sayı **çalıştırma sayacı**, hücre numarası değil
- **Kod düzenlerken güvenlik kontrolü:** `assert` ile "doğru yerde miyim" doğrulaması,
  değiştirmeden önce yedek alma, sonrasında eski/yeni karşılaştırması
- **Terminal:** `curl` (dosya indirme/HTTP isteği), `awk` (satır satır sayma — 15 milyon
  satırlık dosyayı belleğe almadan işlemek), boru `|` ile araçları zincirleme
- **CORS (kaynaklar arası istek engeli):** tarayıcı, sayfanın geldiği adres dışındaki bir
  sunucuya izin başlığı olmadan istek atamaz. Python'da bu kısıt yok. Çözüm: araya
  **köprü (proxy)** koymak — `11_canli_kopru.py`
- **Tembel yükleme:** büyük dosyayı (2,3 MB güzergâh) sayfa açılışında değil, ilk
  gerektiğinde indirmek
- **Leaflet / harita karosu:** dünya küçük kare görsellere bölünür, yakınlaştırma
  seviyesine göre yüklenir; enlem-boylam ekran koordinatına çevrilir
- **Önbellek (cache):** aynı isteği kısa sürede tekrarlamamak için cevabı saklamak

---

## 13. ŞU AN NEREDEYİZ (26 Ağustos 2026)

> **YENİ ASİSTAN — BURADAN BAŞLA.** Bölüm 0'ı (çalışma tarzı) okuduysan buradan devam et.

### Tek cümleyle durum

**Analiz bitti · yön boyutu kuruldu · dashboard bitti · dört açıklama belgesi hazır ·
rapor hiç başlamadı.**

### ✅ 7. SEANSTA KAPANAN İŞ — TAM YÖN VERİSİ GELDİ

Mentordan istenen filtresiz veri **geldi ve işlendi** (Bölüm 4.5 → v3, 146.259 satır).
İstenen şey "daha çok veri" değil, **doğru sütunlar**dı: durak kırılımı satır sayısını
~40 katına çıkarıp sorguyu sınıra tosluyordu. Üç sütun çıkarılınca 61 kat fazla satır geldi.

**Bunun sonucu:** yön oranı artık hat + saat düzeyinde ölçülüyor, tahmin katmanı kalktı.
Bölüm 6.4 kısıtı kapandı, hedef cümle kuruldu.

**Hâlâ mentordan istenebilecek iki şey** (acil değil, proje onlarsız da tamam):
- **Okul döneminden bir hafta** — eldeki veri ağustos tatil haftası. Aynı sorgu,
  farklı tarih aralığı. Geldiğinde `14_yon_duzeltmesi.py`'de tek dosya adı değişir.
- **Metrobüs verisi** — ayrı sistemde raporlanıyor, bu dosyada yok. Analize etkisi yok
  (zaten dışlı) ama tamlık için.

⚠️ **MEVCUT ANALİZ YEDEK.** `14_yon_duzeltmesi.py` ayrı çıktı yazıyor (`*_yonlu.csv`),
`05_boru_hatti.py`'ye dokunulmadı. Yön yaklaşımı kesinleşince birleştirilebilir.

### Elimizdeki sonuçlar (bacak düzeltmesinden sonra)

| | |
|---|---|
| Değerlendirilen hat | **676** (59'u veri yetersizliğinden dışarıda) |
| Sefer **artırılmalı** (yönsüz) | 96 hat+saat · 41 hat · **+162 sefer** · 308 araç-saat |
| Sefer **artırılmalı** (⭐ yönlü) | **172** hat+saat · **66** hat · **+262 sefer** |
| Sefer artırılmalı — **hafta sonu** (sentetik) | **117** hat+saat · **40** hat · **+173 sefer** (8. seans) |
| Sefer **azaltılabilir** | hafta içi 699 satır · 233 hat · **2.419 sefer** |
| Hafta içi net | **−2.257 sefer** (yönsüz hesap) |
| **Zirve açığı** | yönsüz **97** ek araç → **yönlü 120** (08:00) |
| Doğrulama | **14 ayrı sınama** (Bölüm 6) |

> **Hangi rakam manşet olacak?** ⭐ **Yönlü olan.** Artık tahmin değil ölçüm
> (Bölüm 6.13) ve daha doğru: yönsüz hesap kalabalık yönü boş yönle ortalayıp
> sorunu olduğundan küçük gösteriyor. Yönsüz rakamlar "yön eklenmeden önce böyleydi"
> diye karşılaştırma olarak verilmeli.
>
> ⚠️ Yön düzeltmesi satırların %51'ine uygulanabildi; kalanında eski hesap geçerli.
> `doluluk_yonlu.csv`'deki `yonlu` sütunu hangisinin hangisi olduğunu söyler.

Manşet: *kaynak yetersiz değil, yanlış dağılmış — eklenmesi gereken her sefere karşılık
yaklaşık **on beş** sefer azaltılabiliyor.*

### Çalışan altyapı

```
09_gercek_sureler.py         gerçek sefer süreleri        (bir kez, ~2 dk)
05_boru_hatti.py             tüm analiz çıktıları         (~2 dk)
10_guzergah_koordinatlari.py harita koordinatları         (bir kez, ~10 dk)
12_rota_yollari.py           rotaları yola oturt (OSRM)   (bir kez, ~25 dk)
11_canli_kopru.py            sunucu + canlı köprü         (sürekli)
14_yon_duzeltmesi.py         ★ yön ayrımlı doluluk        (~5 sn, 05'ten sonra)
cikti/index.html             dashboard + 6 ek betik
                             (akordeon·manset·okunurluk·yon·kenar·giris — menu KALDIRILDI)
```
> **Sıra önemli:** `09` → `05` → `14`. `14` hem `doluluk.csv`'yi hem 2026 yön
> verisini okuyor; `05` çalışmadan çıktı üretemez.
> `15_boru_hatti_2026.py` bu zincirin parçası DEĞİL — arşiv (Bölüm 6.14).

### 8. seansta yapılanlar (26 Ağustos)

1. ✅ **Devir dosyası çıktı dosyalarıyla denetlendi** — 23 rakam tek tek kontrol
   edildi, **15'i bayattı, düzeltildi** (üstteki denetim notu). Sebep: yeni
   bulgular yeni bölümlere yazılırken eski bölümler güncellenmiyordu.
   *Ders: devir dosyası da bir çıktıdır, o da doğrulanmalı.*
2. ⭐⭐ **Hafta sonu artırma önerileri AÇILDI** (Bölüm 8'deki yeni başlık).
   İki betikte de duran `gun_tipi == "WEEKDAYS"` filtresi kaldırıldı;
   hafta sonu **117 yönlü öneri / 40 hat / 173 sefer** üretiyor.
   Hafta içi rakamları değişmedi — regresyon kontrolüyle doğrulandı.
3. ⭐ **`ekleme_dakikalari()` gün tipine açıldı** — sabit `"I"` tarifesine
   bakıyordu; cumartesi önerisi için cumartesi tarifesi gerekiyor.
   *Bu atlansaydı hafta sonu önerileri hafta içi kalkışlarının arasına
   yerleşirdi — sessiz ve fark edilmesi zor bir hata.*
4. ⭐ **Hafta sonu neden öneri çıkmadığı ölçüldü** (Bölüm 8): azaltma tarafında
   asıl sebep eşik değil, **hafta sonu tarifesinin zaten seyrek olması** —
   satırların %61'inde saatte 4'ten az kalkış var, medyan 2.
5. ✅ **Panoda tarife tablosu üç sütuna da öneri/renk veriyor** — hafta sonu
   önerileri kesik yeşil çerçeveyle ayrışıyor, lejantta kendi satırı var.

### 7. seansta yapılanlar (20-26 Ağustos)

1. ⭐⭐ **Yön boyutu kuruldu ve ÖLÇÜLDÜ** — `14_yon_duzeltmesi.py` (Bölüm 6.13).
   Öneri 96 → **172**, ek sefer 162 → **262**, zirve 97 → **120 araç**. **Bölüm 6.4 kapandı.**
2. ⭐ **Hedef cümle kuruldu:** *"76O · 17:00 · Otogar→Cihangir · +1 sefer"*
3. ✅ **Üç sürüm veri işlendi** (Bölüm 4.5) — v1/v2 %0,44 doluydu; **durak sütunları
   çıkarılınca v3 tam geldi** (2.380 → 146.259 satır). Ders: doğru sütunu istemek,
   daha çok veri istemekten etkili.
4. ✅ **Güzergâh kodu çözüldü** — `hat_YÖN_VARYANT`. Bölüm 6.12'nin bacak varsayımı
   İETT'nin kendi `Güzergah Yön` sütunuyla onaylandı.
5. ⚠️ **Kodlama hatasının talep tarafına yansıdığı bulundu** — gidiş+dönüş kodlu
   hatlarda binişler de tek yöne yığılmış (%94,6). `DENGE_ESIK = 0.25` ile kapatıldı.
   *Bu bulunmasaydı 98, 78, 29C listenin tepesine yanlışlıkla tırmanacaktı.*
6. ✅ **Hafta sonu çarpanı ölçüldü** — cumartesi %79, pazar %58 (varsayım %72/%52).
   **Karar: sentetik kalıyor**, ölçüm doğrulama olarak duruyor.
7. ✅ **Veri doğrulandı** — saatlik şekil 2024 ile Pearson **0,964**, hat×saat kapsaması %85.
8. ✅ **Kontör bulgusu** — yolcu bileşimi saate göre değişiyor (06:00 25,36 TL →
   23:00 18,45 TL). Mali argüman.
9. ⭐ **Dashboard'a yön boyutu eklendi** — `yon.js` + `yon_veri.json` (Bölüm 9 madde 11).
   İki parça, ikisi de **"Sefer artır" bölümünün içinde** (ayrı bölüm yok):
   (a) `ANLIK YOLCU` sütunu **çift bara** çevrildi — G/D, aşan kısım kırmızı,
   sayı yok; (b) ⭐⭐ satıra tıklayınca açılan grafiğin yerine **İETT düzeninde
   sefer tarifesi tablosu** — sarı başlık, İş Günleri/Cumartesi/Pazar sütunları,
   kırmızı saatler; kapasite üstü saatler tonlu, önerilen yeni kalkışlar
   `+07:10` biçiminde yeşil. **"Dakika bazlı sefer planı" maddesi kapandı.**
10. ⭐⭐ **2026 hacmine geçiş denendi ve REDDEDİLDİ** (Bölüm 6.14). Ağustos zirvesi
    2024 ekiminin %71'i; boru hattı 172 yerine **8** öneri üretti. Karar: hacim
    2024'te, yön 2026'da. *Kendi mevsim tahminim (%6) yanlış araca dayanıyordu —
    dosya boyutu günlük toplamı ölçüyor, zirveyi değil.*
11. ⭐ **Arayüz baştan elden geçirildi** (Bölüm 9 madde 11-13):
    · hamburger menü kaldırıldı, kenar çubuğu yeniden tasarlandı (`kenar.js`) —
      her başlığın altında sade açıklama, kaydırdıkça aktif vurgu
    · harita yeniden kuruldu — duraklar nokta, yakınlaştırmaya göre seyreltme,
      gidiş/dönüş ayrı renk ve ayrı seçim, uç durak etiketleri
    · ⭐⭐ **giriş sayfası** (`giris.js`) — amblem + manşet + boğaz silueti,
      SPACE ile panoya geçiş; panodaki metin kalabalığı böylece kalktı
    · "Hat incelemesi"nde arama + ENTER doğrudan profil kartını açıyor
12. ⭐⭐ **Model eksiği bulundu ve kapatıldı: her yön kendi ihtiyacına göre.**
    Model yalnızca kritik yöne sefer ekliyordu; öneri satırlarının %22'sinde
    iki yön de kapasite üstüydü ve ihmal edilen yönün medyan doluluğu 135,6 idi.
    **Ek sefer 229 → 262.** Bulguyu Mehmet arayüzde fark etti (kırmızı saat,
    yeşil kalkış yok) — *arayüz modelin denetleyicisi oldu.*
13. ⭐ **Manşet cümlesi değişti** — eskisi ("kaynak yetersiz değil, yanlış
    dağılmış") yönetici jargonuydu ve yön boyutunu anlatmıyordu. Yenisi:
    **"Sorun kaç otobüs olduğu değil — hangi saatte, hangi yöne gittiği."**
    Alt paragraf artık `manset.js` içinde VERİDEN hesaplanıyor; eski metindeki
    "yaklaşık on beş sefer" oranı yön düzeltmesinden sonra 10,6'ya düşmüş ve
    manşet kendi verisiyle çelişir hâle gelmişti.
14. ✅ **Klasör temizliği** — 953 MB → 754 MB (Bölüm 3).
15. ⛔ **Sentetik yön verisi reddedildi** (v3 gelmeden önce) — gerekçesi Bölüm 6.13 sonunda.
16. ⛔ **Aynı sınıf hata dört kez tekrarlandı — kayıt için:** `data-mk-gun`,
    `data-mk-yon` (iki kez) ve `stopPropagation`. **Beş ek betik aynı DOM'u ve
    aynı isim uzayını paylaşıyor.** Yeni bir `mk-` önekli öznitelik eklemeden
    ya da olay akışını kesmeden önce diğer betiklerin ne aradığına bakılmalı.

### 6. seansta yapılanlar (12-17 Ağustos)

1. ⭐⭐ **Bacak düzeltmesi** — 103 hatta bir kalkış gidiş+dönüşmüş (Bölüm 6.12).
   Öneri listesi 178 → **96**. Mehmet'in ısrarı buldurdu.
2. ✅ **Yön tespiti çözüldü** — hareket vektörü yöntemi (Bölüm 9 madde 6b kapandı)
3. ✅ **Trafik katmanı** — otobüsler hareketli sensör olarak (Bölüm 9 madde 7)
4. ✅ **Rotalar yola oturtuldu** — 676 hat, OSRM, 0 hata
5. ⭐ **Devir bağımsız ölçüldü** — hanehalkı anketinden **1,98** (Bölüm 6.10b).
   Karar: 1,7'de kalındı, ölçüm doğrulama olarak duruyor
6. ✅ **Kota teşhisi** (`Rate limit exceeded`) + servisin dakikada bir tazelendiği ölçümü
7. ✅ **Okunurluk katmanı** — kapasite referansı, ondalık temizliği, eylem özetleri,
   terim baloncukları (`okunurluk.js`)
8. ✅ **Manşet düzeltildi** (kendi rakamlarıyla çelişiyordu) + "17 hat" → 30
   ⚠️ **7. seansta manşet cümlesi TAMAMEN DEĞİŞTİ** — aşağıdaki nota bak.
9. ✅ **Dört açıklama belgesi** yazıldı (aşağıda)
10. ✅ **Yolcu yönü kapalı olduğu kesinleşti** — üç yol denendi, hepsi kapalı.
    Ama mentor veriyi verdi (yukarı bak)
11. ✅ **Telefon uygulaması** — `mobil.html`, PWA (Bölüm 9 madde 10).
    Tarayıcı önizlemesinde çalışıyor, **gerçek telefonda test edilmedi** — ertelendi
12. ✅ **Köprü ağa açıldı** (`0.0.0.0`) — telefondan erişim için
13. ✅ **Devir dosyası** bu seansta iki kez güncellendi

### Üretilen belgeler (hepsi `notlar/`, Artifact olarak da yayımlandı)

| dosya | ne işe yarar |
|---|---|
| `dashboard_sunum_rehberi.html` | Ekranı bölüm bölüm anlatma + mentorun soracağı 7 soru ve cevapları |
| `veri_modeli.html` | Hangi dosya hangisiyle birleşir, hangileri birleşemez ve neden |
| `veri_sureci.html` | Ham veriden sonuca adım adım; tek bir sayının uçtan uca izi |
| `sutun_kontrolleri.html` | 7 kaynağın 62 sütunu tek tek: ne kontrol edildi, sonuç ne |

> Bu dördü raporun iskeletini oluşturuyor — rapor yazılırken sıfırdan başlanmayacak.

### 🔜 SIRADAKİ İŞ — öncelik sırasıyla

**1. ⭐⭐ RAPOR + README — asıl teslim, hiç yazılmadı. Artık başka öncelik yok.**
İçerik dört belgede hazır; iş onu rapor diline çevirmek. Girecek bölümler:
Bölüm 5 (Ekim 2024 eksikliği) · Bölüm 6 (on üç sınama) · **Bölüm 6.12 (bacak düzeltmesi)** ·
**Bölüm 6.13 (yön boyutu)** · Bölüm 6.10 + 6.10b (devir, aralık olarak) · Bölüm 4.3-4.4 ·
Bölüm 4.5 (yön verisi) · Bölüm 8 · Bölüm 11.

**2. ~~Yönlü sonuçları dashboard'a bağla~~** ✅ **YAPILDI (7. seans)** — `yon.js` +
`yon_veri.json`, "Sefer artır" bölümüne eklendi (Bölüm 9 madde 11).

**3. ~~Dakika bazlı sefer planı~~** ✅ **YAPILDI (7. seans)** — dashboard'daki
"Sefer artır" bölümünde, satıra tıklayınca açılan sefer tarifesi tablosunda
(Bölüm 9 madde 11). 172 önerinin hepsinde ekleme dakikası üretiliyor.
Aşağıdaki notlar hâlâ geçerli — rapora bu ibarelerle girmeli:
```
11ÜS · hafta içi · 08:00 · +5 sefer
  mevcut  : 08:15 08:40                              (2 kalkış, 25 dk aralık)
  önerilen: 08:04 08:13 08:21 08:30 08:39 08:47 08:56 (7 kalkış, 8-9 dk aralık)
```
⚠️ **Dakika yerleşimi ÖLÇÜM DEĞİL KARAR** — talep saatlik olduğu için saat içindeki
dağılım bilinmiyor; eşit aralık ilkesiyle üretiliyor. Raporda böyle beyan edilmeli.
İki seçenek var: **(A)** mevcut kalkışlara dokunmadan aralara ekle (yolcu alışkanlığı
korunur, aralıklar düzensiz kalır) · **(B)** saati baştan tasarla (aralıklar eşit olur
ama tüm saatler değişir). İETT pratiğinde genelde A tercih edilir.

**4. GitHub + Pages.** `.gitignore`: `venv/`, `veri/yolculuk/hourly_transportation_202410.csv`
(262 MB). ⚠️ `veri/yolculuk/yon_verisi_2026_v3.csv` (10 MB) **girmeli** —
`14_yon_duzeltmesi.py` onsuz çalışmaz.
⚠️ `cikti/guzergahlar.json` ve `cikti/rota_yollari.json` (2,3'er MB) **girmeli** —
harita onlarsız çalışmaz. ⚠️ Canlı katman ve trafik Pages'te çalışmaz (sunucu yok),
kendini kapatır.

**5. Mentora üç soru:**
- *"Saatlik biniş sayısını araç ihtiyacına çevirirken hangi devir katsayısını
  kullanıyorsunuz?"* — cevap gelirse devir çıkarımdan ölçüme geçer (Bölüm 6.10)
- ⚡ *"Aynı yön raporunu **okul döneminden** bir hafta için alabilir miyim?"* —
  **artık en değerli istek bu.** Eldeki ağustos haftasıyla denendi: zirve saatler
  tatil yüzünden 2024'ün %71'i çıkıyor ve model neredeyse hiç açık görmüyor
  (Bölüm 6.14). Ekim haftası gelirse talep + yön + arz tek kaynaktan, güncel
  veriyle kurulur ve üç kısıt birden kalkar.
- *"Canlı konum servisinde kota sınırı ne kadar, staj kapsamında artırılabilir mi?"*

### Açık kalan küçük işler / borçlar

- **Devir kararı yeniden gündeme gelecek** — yeni veriyle birlikte 1,7 · 1,98 · kademeli
  seçenekleri tekrar değerlendirilmeli (Bölüm 6.10b)
- **Dashboard yeniden üretilirse ALTI ek betik kaybolur.** Kaynakları
  `notlar/dashboard_ek_betikler/`: `akordeon.js` · `manset.js` · `okunurluk.js` ·
  `yon.js` · `kenar.js` · `giris.js`.
  Yeni `index.html`'in `</body>` etiketinden önce sırayla yapıştır.
  ⚠️ `menu.js` klasörde duruyor ama **ekli DEĞİL** (7. seansta kaldırıldı) — geri
  istenmedikçe yapıştırma.
- **`menu.js`'te ölçüye dayalı kırılganlık var** — manşet bloğunu "genişliği 700px'den
  büyük ata" diye arıyor, dar ekranda bulamıyor ve amblem kaybolyor. `manset.js` bunu
  yapıya göre arayarak çözdü; `menu.js` de aynı yönteme geçirilebilir.
- **OSRM rotalarında 33 hatta sapma var** (oran > 1,5; en kötüsü `11R`: API 18 km,
  çizim 45,8 km). Rota motoru otomobil yolu hesaplıyor, otobüs şeridini bilmiyor.
  **Analize etkisi yok, sadece görsel.**
- **`yakinDurakKodu` alanı kullanılmadı** — trafik katmanındaki durak yakınlığı hesabını
  basitleştirebilir.
- **Dar tanım (`SSERVISTIPI`) duyarlılık analizi** bacak düzeltmesinden sonra
  yeniden çalıştırılmadı — Bölüm 11 madde 9'daki sayılar eski.
- **`03_arz_api.ipynb`'nin 20. hücresi tehlikeli** — filtresiz `doluluk.csv` yazıyor.
- ~~**Yönlü sonuçlar dashboard'a girmedi.**~~ ✅ **GİRDİ (7. seans)** — `yon.js` +
  `cikti/yon_veri.json` ile "Sefer artır" bölümünde görünüyor (Bölüm 9 madde 11).
  `dashboard_veri.json` hâlâ yalnızca yönsüz doluluk taşıyor; yön verisi ayrı dosyadan
  okunuyor — bu bilerek böyle.
- **3 hattın hafta sonu önerisi panoda görünmüyor** — `11A`, `131Y`, `HS2` (toplam
  6 satır, hepsi cumartesi). Hafta içi önerileri ve azaltma satırları olmadığı için
  pano tarifeyi açacak bir yer bulamıyor. Öneriler `oneri_sefer_artir_yonlu.csv`'de
  duruyor. **Mehmet'in kararı (8. seans): boş verildi** — etki küçük, uğraşmaya değmez.
- **Yönlü azaltma listesi yok.** Sadece artırma tarafı yöne ayrıldı; azaltma listesi
  hâlâ yönsüz. Akşam ters yönün boş olduğu saatlerde ek fırsat çıkabilir.
- **`14_yon_duzeltmesi.py` `05_boru_hatti.py`'ye katılmadı** — bilerek ayrı tutuldu.
  Yön yaklaşımı kesinleşince birleştirilebilir.
- **`.claude/launch.json`** 6. seansta oluşturuldu (önizleme aracı için), kullanılmadı.
- **Telefon uygulaması gerçek cihazda test edilmedi.** Köprüyü yeniden başlatıp
  `http://<yerel-IP>:8770/mobil.html` ile açmak kaldı. Ertelendi, yeni veri öncelikli.
- **`sw.js` içindeki `SURUM` sabiti** veri her güncellendiğinde artırılmalı,
  yoksa telefonda eski önbellek kalır.
- **Arayüz alternatifleri konuşuldu, karar verilmedi.** Power BI (belediyelerin fiilen
  kullandığı araç ama Windows'a özel), Streamlit (Python, Mac'te en pratik, GitHub Pages'e
  konmaz), Looker Studio. Mevcut dashboard'u atmak yerine **ikinci bir sunum aracı**
  eklemek önerildi — ikisi de aynı `doluluk.csv`'yi okur.

## 14. KAYNAKLAR

- İBB Açık Veri Portalı — https://data.ibb.gov.tr
- Saatlik Toplu Ulaşım Veri Seti — https://data.ibb.gov.tr/dataset/hourly-public-transport-data-set
- İETT Web Servis Dokümanı v1.5 — https://data.ibb.gov.tr/dataset/53b985b6-24af-4fda-aa59-1b45dde2e665/resource/6efd7520-0fbf-421b-975a-a73cb9137ef2/download/tr_iett-web-servis-kullanm-dokumanv.1.5.pdf
- IETT GTFS Data (artık kullanılmıyor) — https://data.ibb.gov.tr/dataset/iett-gtfs-verisi
- Proje içi: `notlar/01_ilk_bakis_aciklama.md` (CSV keşfinin satır satır anlatımı),
  `notlar/veri_kalitesi_notlari.md` (rapor taslağı)
