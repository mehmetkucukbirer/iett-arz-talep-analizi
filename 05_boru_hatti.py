"""
İETT arz-talep boru hattı — uçtan uca tek dosya.

03_arz_api.ipynb'deki dağınık hücrelerin (sırası bozuk, bkz. devir dosyası Bölüm 10)
doğru sırayla bir araya getirilmiş hali. Çalıştırınca cikti/ klasöründeki tüm
sonuç dosyalarını yeniden üretir.

Çalıştırma:
    source venv/bin/activate
    python3 05_boru_hatti.py
"""

import json
import xml.etree.ElementTree as ET

import numpy as np
import pandas as pd
import requests

# --------------------------------------------------------------------------
# AYARLAR
# --------------------------------------------------------------------------

KAPASITE = 110                      # körüklü otobüs — ARAÇTAKİ ANLIK yolcu kapasitesi
GUN_TIPLERI = ["WEEKDAYS", "SATURDAY", "SUNDAY"]

# --- DEVİR KATSAYISI --------------------------------------------------------
# Talep verisi BİNİŞ sayar (İstanbulkart inişte okutulmuyor). Bir koltuk sefer
# boyunca birkaç kez dolabilir: Tuzla'da binen Kartal'da iner, yerine başkası biner.
# Devir = sefer boyunca toplam biniş ÷ araçtaki anlık yolcu.
#
# ÖLÇÜM (5. seans): 478 hattın zirve doluluğu hat UZUNLUĞUNA göre bantlandı, her
# bandın 90. yüzdeliğine bakıldı (İETT'nin o uzunlukta tolere ettiği pratik tavan):
#   0-8 km → 118 · 8-12 → 197 · 12-16 → 185 · 16-20 → 207 · 20-25 → 182
#   25-30 → 213 · 30+ → 233
# İlk bandı 1 kabul edip oranlarsak devir: 1,00 · 1,67 · 1,57 · 1,76 · 1,55 · 1,80 · 1,98
# → 8 km'den sonra DÜZLEŞİYOR, ortalama ~1,7. Mantığı: uzun hatta binen yolcu da
#   daha uzun gidiyor, oran sabit kalıyor.
#
# Önce süreye göre bantlanmıştı (1,0→2,5 sürekli artan). Kontrolde uzunluk bantlarının
# daha tutarlı olduğu görüldü; ayrıca sabit tek katsayı mentora tek cümleyle anlatılıyor
# ve düzeltmesi tek satır.
#
# ⚠️ Bu bir ÖLÇÜM DEĞİL, ÇIKARIM. Kalibrasyon mevcut doluluk seviyelerinden
# türetildiği için "bugünkü sıklık makul" varsayımını içerir. Duyarlılık (zirve araç):
#   devir 1,0 → 906 · 1,5 → 253 · bu model → 162 · 2,0 → 72
# Gerçek katsayı İETT'nin yolcu sayım verisiyle netleşir.
DEVIR_KISA_ESIK = 8.0    # km — bunun altında devir yok sayılıyor
DEVIR_UZUN = 1.7         # km eşiğinin üstündeki tüm hatlar


def devir_kat(uzunluk_km):
    """Hat uzunluğuna göre devir katsayısı."""
    if uzunluk_km is None or pd.isna(uzunluk_km):
        return 1.0                       # uzunluk bilinmiyorsa temkinli davran
    return 1.0 if uzunluk_km < DEVIR_KISA_ESIK else DEVIR_UZUN

# --- azaltma listesi eşikleri (Bölüm 6.8) ---
AZALT_DOLU_ESIK = 20   # bunun altı "düşük doluluk"
AZALT_MIN_SEFER = 4    # en az bu kadar seferi olan hatlar aday
AZALT_HEDEF     = 40   # azaltma sonrası hedeflenen doluluk
AZALT_MIN_KALAN = 2    # hiçbir saatte bunun altına inme
SUPHE_ESIK      = 5    # hafta içi gün ortalaması bunun altındaysa "veri şüpheli"

SEFER_HAM = "cikti/sefer_ham_20260806.csv"
TALEP_CSV = "veri/yolculuk/hourly_transportation_202410.csv"

# Ekim 2024 dosyasında gerçek veri taşıyan 5 gün (hepsi hafta içi)
GECERLI_GUNLER = ["2024-10-02", "2024-10-04", "2024-10-16", "2024-10-17", "2024-10-18"]

# Metrobüs ailesinin tamamı. İki ayrı sebeple analiz dışı:
#  (a) Arz tarafı: PlanlananSeferSaati gerçek sıklığı yansıtmıyor (34'te saatte 2-10 kalkış
#      listeliyor, gerçekte 1-2 dakikada bir) → doluluk 667 kişi/sefer gibi imkânsız çıkıyordu.
#  (b) Talep tarafı: İstanbulkart binişleri tek kod ("34") altında toplanıyor, arz ise
#      8 ayrı koda bölünmüş. Sonuç: 34G günde 1.436 sefer / 275 yolcu = 0,19 kişi/sefer.
#      Bu hatlar "boş" görünüp azaltma listesini dolduruyordu.
METROBUS = ["34", "34A", "34AS", "34B", "34BZ", "34C", "34G", "34Z"]

# Arz verisinde dönüş (D) seferleri hiç gelmemiş 52 hat.
# DurakDetay_GYY ile doğrulandı: bu hatların durak ağında iki yön de var,
# ama PlanlananSeferSaati sadece gidiş kalkışlarını döndürüyor.
# Sefer sayısı eksik sayıldığı için doluluk yapay yüksek çıkıyor → analiz dışı.
ARZ_EKSIK = ["11D", "11K", "11M", "11ST", "12", "130ŞT", "13H", "145M", "16YK", "19D",
             "22B", "25", "25C", "25S1", "25S2", "29A", "34A", "36", "36Z", "38Z",
             "46KT", "46T", "48S", "48U", "50A", "54HT", "54HŞ", "54P", "54T", "58S",
             "66Z", "70FY", "71T", "73B", "73F", "8Y", "90B", "92K", "9A", "AND1Ş",
             "AND2K", "AND2S", "EL2", "K3", "KM42", "KM43", "KM44", "MK19", "MR42",
             "MR60", "PD1", "UM13"]

DISLANAN = sorted(set(METROBUS + ARZ_EKSIK))

# Sentetik hafta sonu: seviye varsayımı (hafta içinin yüzdesi)
CARPAN = {"SATURDAY": 0.72, "SUNDAY": 0.52}

# Sentetik hafta sonu: şekil düzeltmesi (1'in altı = hafta sonu o saatte daha az)
SAAT_DUZELTME = {0: 1.30, 1: 1.30, 2: 1.30, 3: 1.20, 4: 1.00, 5: 0.60,
                 6: 0.45, 7: 0.40, 8: 0.45, 9: 0.65, 10: 1.10, 11: 1.20,
                 12: 1.25, 13: 1.25, 14: 1.20, 15: 1.15, 16: 1.10, 17: 1.05,
                 18: 1.00, 19: 1.05, 20: 1.10, 21: 1.15, 22: 1.25, 23: 1.30}

TOHUM = 42          # tekrarlanabilirlik: aynı tohum = aynı sentetik sayılar

BASE, NS = "https://api.ibb.gov.tr/iett", "http://tempuri.org/"


def _soap(path, method, params):
    """İETT SOAP servisine istek atar, XML kökünü döndürür."""
    body = "".join(f"<{k}>{v}</{k}>" for k, v in params.items())
    env = ('<?xml version="1.0" encoding="utf-8"?>'
           '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
           f'<soap:Body><{method} xmlns="{NS}">{body}</{method}></soap:Body></soap:Envelope>')
    r = requests.post(f"{BASE}/{path}", data=env.encode("utf-8"),
                      headers={"Content-Type": "text/xml; charset=utf-8",
                               "SOAPAction": f"{NS}{method}"}, timeout=30)
    r.raise_for_status()
    return ET.fromstring(r.content)


# --------------------------------------------------------------------------
# 1. HAT LİSTESİ — API'ye tek istek (hat adı, sefer süresi, uzunluk)
# --------------------------------------------------------------------------
# Başta çekiliyor çünkü SEFER_SURESI hem araç hesabında (adım 6) hem
# dashboard'da (adım 7) gerekiyor.

print("[1/7] hat listesi çekiliyor (API'ye 1 istek)...")

root = _soap("UlasimAnaVeri/HatDurakGuzergah.asmx", "GetHat_json", {"HatKodu": ""})
res = next(el for el in root.iter() if el.tag.endswith("Result"))
hatlar = pd.DataFrame(json.loads(res.text))
hatlar["SEFER_SURESI"] = pd.to_numeric(hatlar["SEFER_SURESI"], errors="coerce")
hatlar["HAT_UZUNLUGU"] = pd.to_numeric(hatlar["HAT_UZUNLUGU"], errors="coerce")

hat_bilgi = hatlar.set_index("SHATKODU")[["SHATADI", "SEFER_SURESI", "HAT_UZUNLUGU"]].to_dict("index")
SURE = hatlar.set_index("SHATKODU")["SEFER_SURESI"].to_dict()
UZUNLUK = hatlar.set_index("SHATKODU")["HAT_UZUNLUGU"].to_dict()

print(f"      {len(hatlar)} hat, planlanan sefer süresi bilinen: "
      f"{hatlar['SEFER_SURESI'].notna().sum()}")


# --------------------------------------------------------------------------
# 1b. GERÇEK SEFER SÜRELERİ (araç hesabının temeli)
# --------------------------------------------------------------------------
# Hat listesindeki SEFER_SURESI bir PLANLAMA değeri: hat uzunluğu sabit ~25 km/sa
# hıza bölünerek üretilmiş (uzunluk-süre korelasyonu 0,984). Gerçeği tutturmuyor.
# Onun yerine İETT arşivinden ölçülmüş gerçek süreleri kullanıyoruz —
# `09_gercek_sureler.py` üretir, talep verisiyle aynı 5 Ekim 2024 gününden.
#
# Canlı araç sayımıyla üç formül yarıştırıldı (24 hat):
#   planlanan/60      → oran medyanı 0,71 · 1'e uzaklık 0,27
#   planlanan/120     → oran medyanı 1,41 · 1'e uzaklık 0,52
#   GERÇEK SÜRE/60    → oran medyanı 1,16 · 1'e uzaklık 0,20  ← en isabetli
#
# Üç kademeli arama: hat+saat → hat geneli → sistem saat medyanı.

try:
    _hs = pd.read_csv("cikti/gercek_sure_hat_saat.csv")
    _hg = pd.read_csv("cikti/gercek_sure_hat.csv")
    _sis = pd.read_csv("cikti/gercek_sure_sistem_saat.csv")
    SURE_HS = {(str(r.hat), int(r.saat)): r.sure_dk for r in _hs.itertuples()}
    SURE_H = {str(r.hat): r.sure_dk for r in _hg.itertuples()}
    SURE_SIS = {int(r.saat): r.sure for r in _sis.itertuples()}
    print(f"      gerçek süre tablosu: {len(SURE_HS)} hat+saat · {len(SURE_H)} hat")
except FileNotFoundError:
    raise SystemExit("HATA: gerçek süre tabloları yok. Önce çalıştır:\n"
                     "      python3 09_gercek_sureler.py")


def gercek_sure(hat, saat):
    """Bir kalkışın aracı kaç dakika meşgul ettiği — ölçülmüş değer."""
    v = SURE_HS.get((hat, saat))
    if v is None:
        v = SURE_H.get(hat)
    if v is None:
        v = SURE_SIS.get(saat)
    return v


# --------------------------------------------------------------------------
# 2. ARZ — planlanan sefer sayısı (hat + gün tipi + saat)
# --------------------------------------------------------------------------

print("[2/7] arz tablosu hazırlanıyor...")

sefer_ham = pd.read_csv(SEFER_HAM)
sefer_ham["saat"] = pd.to_numeric(sefer_ham["DT"].str[:2], errors="coerce")
sefer_ham["gun_tipi"] = sefer_ham["SGUNTIPI"].map({"I": "WEEKDAYS", "C": "SATURDAY", "P": "SUNDAY"})

arz = (sefer_ham
       .groupby(["SHATKODU", "gun_tipi", "saat"])
       .size()
       .reset_index(name="sefer_sayisi")
       .rename(columns={"SHATKODU": "hat"}))
arz["hat"] = arz["hat"].astype(str)
arz["saat"] = arz["saat"].astype(int)

# --- GÖREV GİDİŞ+DÖNÜŞ MÜ? (Bölüm 6.12) -----------------------------------
# Bazı hatlarda tarife neredeyse tek yönlü görünüyor (98: 161 G / 15 D). Bir hat
# günde 161 gidiş yapıp 15 dönüş yapamaz — o hatlarda bir KALKIŞ gidiş+dönüşün
# tamamını kapsıyor. Ölçüldü: tek yön uzunluğu / ölçülen süre bu hatlarda
# 8,2 km/sa, dengeli hatlarda 17,2 km/sa — tam yarısı (oran 2,09).
# Azınlık payı SIFIR olanlar hariç: onlar gerçekten tek yönlü/halka hatlar,
# hızları zaten normal çıkıyor (13,3 km/sa).
_yon = (sefer_ham.pivot_table(index="SHATKODU", columns="SYON",
                              values="DT", aggfunc="count")
        .fillna(0).reindex(columns=["G", "D"], fill_value=0))
_az = _yon.min(axis=1) / _yon.sum(axis=1)
GIDIS_DONUS = set(_az[(_az > 0) & (_az < 0.15)].index.astype(str))
print(f"      görev=gidiş+dönüş olan hat: {len(GIDIS_DONUS)}")

arz.to_csv("cikti/arz_ozeti.csv", index=False)
print(f"      arz_ozeti.csv        {len(arz):>6} satır, {arz['hat'].nunique()} hat")


# --------------------------------------------------------------------------
# 3. TALEP (gerçek) — Ekim 2024, 5 geçerli gün, sadece OTOYOL
# --------------------------------------------------------------------------

print("[3/7] gerçek hafta içi talep okunuyor (262 MB, biraz sürer)...")

parcalar = []
for parca in pd.read_csv(TALEP_CSV, chunksize=500_000):
    o = parca[(parca["road_type"] == "OTOYOL") &
              (parca["transition_date"].isin(GECERLI_GUNLER))]
    if len(o):
        parcalar.append(o.groupby(["line_name", "transition_hour"])["number_of_passenger"]
                        .sum().reset_index())

gercek = (pd.concat(parcalar)
          .groupby(["line_name", "transition_hour"])["number_of_passenger"]
          .sum().reset_index())
gercek["yolcu_gunluk"] = (gercek["number_of_passenger"] / len(GECERLI_GUNLER)).round(1)
gercek = gercek.rename(columns={"line_name": "hat", "transition_hour": "saat"})[
    ["hat", "saat", "yolcu_gunluk"]]
gercek["hat"] = gercek["hat"].astype(str)
gercek["saat"] = gercek["saat"].astype(int)

gercek.to_csv("cikti/gercek_haftaici_profil.csv", index=False)
print(f"      gercek_haftaici_profil.csv  {len(gercek):>6} satır, "
      f"{gercek['hat'].nunique()} hat, günlük {gercek['yolcu_gunluk'].sum():,.0f} yolcu")


# --------------------------------------------------------------------------
# 4. TALEP (sentetik) — hafta sonu
# --------------------------------------------------------------------------

print("[4/7] sentetik hafta sonu üretiliyor...")

rng = np.random.default_rng(TOHUM)
parcalar = []

for gt, carpan in CARPAN.items():
    t = gercek.copy()
    t["ham"] = t["yolcu_gunluk"] * t["saat"].map(SAAT_DUZELTME)
    hafta_toplam = t.groupby("hat")["yolcu_gunluk"].transform("sum")
    ham_toplam = t.groupby("hat")["ham"].transform("sum")
    t["yolcu_gunluk"] = (t["ham"] / ham_toplam * hafta_toplam * carpan *
                         rng.normal(1.0, 0.07, len(t))).clip(lower=0).round(1)
    t["gun_tipi"] = gt
    parcalar.append(t[["hat", "gun_tipi", "saat", "yolcu_gunluk"]])

sentetik = pd.concat(parcalar, ignore_index=True)
sentetik["kaynak"] = "sentetik"
print(f"      sentetik {len(sentetik)} satır, "
      f"günlük {sentetik.groupby('gun_tipi')['yolcu_gunluk'].sum().round(0).to_dict()}")


# --------------------------------------------------------------------------
# 5. BİRLEŞTİR — talep_final + doluluk
# --------------------------------------------------------------------------

print("[5/7] arz ile talep birleştiriliyor...")

gercek_tam = gercek.copy()
gercek_tam["gun_tipi"] = "WEEKDAYS"
gercek_tam["kaynak"] = "gercek"
gercek_tam = gercek_tam[["hat", "gun_tipi", "saat", "yolcu_gunluk", "kaynak"]]

talep_final = pd.concat([gercek_tam, sentetik], ignore_index=True)
talep_final.to_csv("cikti/talep_final.csv", index=False)

son = talep_final.merge(arz, on=["hat", "gun_tipi", "saat"], how="inner")
# bacak = bir kalkışın kaç tek-yön seferi ürettiği. Kapasite kıyası bacak
# başına yapılmalı: 110 kişilik sınır otobüsün O ANKİ yüküdür, gün boyu
# taşıdığı toplam değil.  ⚠️ sefer_sayisi'ye DOKUNULMUYOR — araç hesabı onu
# kullanıyor ve gerçek süre zaten gidiş+dönüşü kapsadığı için doğru.
son["bacak"] = son["hat"].map(lambda h: 2 if h in GIDIS_DONUS else 1)
son["kapasite_sefer"] = son["sefer_sayisi"] * son["bacak"]
son["doluluk"] = (son["yolcu_gunluk"] / son["kapasite_sefer"]).round(1)  # BİNİŞ / bacak

# devir hattın yapısal özelliği → saatlik değil, hattın GENEL süresine bağlı
son["devir"] = son["hat"].map(lambda h: devir_kat(UZUNLUK.get(h)))
son["etkin_kapasite"] = KAPASITE * son["devir"]          # sefer başına biniş tavanı
son["etkin_doluluk"] = (son["doluluk"] / son["devir"]).round(1)  # tahmini ANLIK yolcu

oncesi = len(son)
son = son[~son["hat"].isin(DISLANAN)].copy()
son.to_csv("cikti/doluluk.csv", index=False)

print(f"      doluluk.csv          {len(son):>6} satır, {son['hat'].nunique()} hat "
      f"(dışlanan {oncesi - len(son)} satır / {len(DISLANAN)} hat)")
print(f"      medyan biniş/sefer: {son['doluluk'].median()} → "
      f"devir düzeltmesiyle medyan anlık yolcu: {son['etkin_doluluk'].median()}")
print(f"      {KAPASITE} üstü: {(son['etkin_doluluk'] > KAPASITE).sum()} | "
      f"20 altı: {(son['etkin_doluluk'] < 20).sum()}")


# --------------------------------------------------------------------------
# 6. ÖNERİ LİSTELERİ — artırma + azaltma, ikisi de araç karşılığıyla
# --------------------------------------------------------------------------
# Araç formülü:  araç = sefer sayısı × gerçek sefer süresi ÷ 60
#
# Arşivdeki her "görev" bir kalkışa karşılık gelir ve o kalkışın aracı kaç dakika
# meşgul ettiğini söyler. Dolayısıyla tek yön / gidiş-dönüş ayrımına gerek yok —
# ölçüm zaten doğru birimde. (Planlanan SEFER_SURESI ile uğraşırken bu ayrım
# sorun oluyordu; gerçek ölçüme geçince sorun ortadan kalktı.)

print("[6/7] öneri listeleri çıkarılıyor...")

son["sefer_suresi"] = son["hat"].map(SURE)                       # planlanan (referans)
son["gercek_sure"] = [gercek_sure(h, s) for h, s in zip(son["hat"], son["saat"])]
son["_arac_kat"] = son["gercek_sure"] / 60                       # sefer başına araç

# --- 6a. ARTIRMA (tüm gün tipleri; kaynak sütunu gerçek/sentetik ayrımını taşır) ---
# Kıyas artık BİNİŞ değil, tahmini ANLIK yolcu üzerinden: etkin_doluluk > 110.
# 8. seans: hafta sonu filtresi KALDIRILDI. Sentetik olan SEVİYE, taşmanın kendisi
# değil; üstelik çarpanlar (%72/%52) ölçülen gerçeğin (%79/%58) altında, yani hafta
# sonu talebini az gösteriyoruz. Sentetik diye susmak sıkışıklığı gizlemek olurdu.
# Şart: hafta sonu önerileri AYRI sayılır ve "sentetik" etiketiyle sunulur (Bölüm 7).
hi = son[son["sefer_sayisi"] >= 3].copy()
oneri_artir = hi[hi["etkin_doluluk"] > KAPASITE].copy()
# Önce kaç BACAK gerektiğini bul, sonra onu kalkışa çevir: gidiş+dönüş
# hattında 4 bacak eklemek 2 kalkış demek.
oneri_artir["gereken_bacak"] = np.ceil(
    oneri_artir["yolcu_gunluk"] / oneri_artir["etkin_kapasite"]).astype(int)
oneri_artir["gereken_sefer"] = np.ceil(
    oneri_artir["gereken_bacak"] / oneri_artir["bacak"]).astype(int)
oneri_artir["ek_sefer"] = oneri_artir["gereken_sefer"] - oneri_artir["sefer_sayisi"]

oneri_artir["mevcut_arac"] = (oneri_artir["sefer_sayisi"] * oneri_artir["_arac_kat"]).round(2)
oneri_artir["gereken_arac"] = (oneri_artir["gereken_sefer"] * oneri_artir["_arac_kat"]).round(2)
oneri_artir["ek_arac"] = (oneri_artir["gereken_arac"] - oneri_artir["mevcut_arac"]).round(2)
oneri_artir.to_csv("cikti/oneri_sefer_artir.csv", index=False)

# Gerçek (hafta içi) ile sentetik (hafta sonu) öneriler baştan ayrılıyor —
# bundan sonra hangisinin kullanıldığı her yerde açık olsun diye.
_ar_hi = oneri_artir[oneri_artir["gun_tipi"] == "WEEKDAYS"]
_ar_hs = oneri_artir[oneri_artir["gun_tipi"] != "WEEKDAYS"]

print(f"      oneri_sefer_artir.csv {len(oneri_artir):>5} öneri "
      f"({len(_ar_hi)} hafta içi GERÇEK + {len(_ar_hs)} hafta sonu SENTETİK), "
      f"{oneri_artir['hat'].nunique()} hat")
print(f"      hafta içi: {int(_ar_hi['ek_sefer'].sum())} ek sefer, "
      f"{_ar_hi['ek_arac'].sum():.0f} araç-saat | hafta sonu: "
      f"{int(_ar_hs['ek_sefer'].sum())} ek sefer, {_ar_hs['hat'].nunique()} hat "
      f"(sentetik talep)")

# --- 6b. VERİ ŞÜPHELİ HATLAR (azaltma listesinden korunacaklar) ---
# Gün ortalaması sıfıra yakın bir hat "boş" değil, yolcuları başka kod altında
# kaydedilmiş olabilir. Öneri üretmiyoruz, işaretliyoruz. (Bölüm 6.8)
_hi = son[son["gun_tipi"] == "WEEKDAYS"]
gun_ort = _hi.groupby("hat").agg(yolcu=("yolcu_gunluk", "sum"),
                                 sefer=("kapasite_sefer", "sum"))
gun_ort["gun_ort_doluluk"] = (gun_ort["yolcu"] / gun_ort["sefer"]).round(2)
gun_ort["gun_ort_doluluk"] = (gun_ort["gun_ort_doluluk"]
                              / gun_ort.index.map(lambda h: devir_kat(UZUNLUK.get(h)))).round(2)
supheli_df = gun_ort[gun_ort["gun_ort_doluluk"] < SUPHE_ESIK].sort_values("gun_ort_doluluk")
supheli = set(supheli_df.index)
supheli_df.to_csv("cikti/veri_supheli_hatlar.csv")

# --- 6c. AZALTMA (tüm gün tipleri; kaynak sütunu gerçek/sentetik ayrımını taşır) ---
# Eşikler de anlık yolcu cinsinden — uzun hatta 20 biniş, 20 yolcu demek değil.
azalt = son[(son["etkin_doluluk"] < AZALT_DOLU_ESIK)
            & (son["sefer_sayisi"] >= AZALT_MIN_SEFER)
            & (~son["hat"].isin(supheli))].copy()
azalt["onerilen_bacak"] = np.ceil(azalt["yolcu_gunluk"] / (AZALT_HEDEF * azalt["devir"]))
azalt["onerilen_sefer"] = np.ceil(
    azalt["onerilen_bacak"] / azalt["bacak"]).clip(lower=AZALT_MIN_KALAN)
azalt["azalt_sefer"] = (azalt["sefer_sayisi"] - azalt["onerilen_sefer"]).clip(lower=0).astype(int)
azalt = azalt[azalt["azalt_sefer"] > 0].copy()
azalt["yeni_doluluk"] = (azalt["yolcu_gunluk"]
                         / (azalt["onerilen_sefer"] * azalt["bacak"])
                         / azalt["devir"]).round(1)
azalt["kazanilan_arac"] = (azalt["azalt_sefer"] * azalt["_arac_kat"]).round(2)
azalt = azalt.sort_values("azalt_sefer", ascending=False)
azalt.to_csv("cikti/oneri_sefer_azalt.csv", index=False)

_az_hi = azalt[azalt["gun_tipi"] == "WEEKDAYS"]
print(f"      veri_supheli_hatlar.csv {len(supheli_df):>3} hat (öneri üretilmedi)")
print(f"      oneri_sefer_azalt.csv {len(azalt):>5} öneri, {azalt['hat'].nunique()} hat "
      f"| hafta içi (gerçek): {int(_az_hi['azalt_sefer'].sum())} sefer, "
      f"{_az_hi['kazanilan_arac'].sum():.0f} araç-saat")
print(f"      → hafta içi NET: {int(_ar_hi['ek_sefer'].sum()) - int(_az_hi['azalt_sefer'].sum()):+d} sefer")

# --- 6d. SAATLİK ARAÇ İHTİYACI ÖZETİ ---
mevcut_saatlik = (son[son["gun_tipi"] == "WEEKDAYS"]
                  .assign(arac=lambda d: d["sefer_sayisi"] * d["_arac_kat"])
                  .groupby("saat")["arac"].sum())

# mevcut_saatlik yalnızca hafta içi araç sayısını tutuyor; hafta sonu önerilerini
# onun üstüne bölersek artış yüzdesi ve zirve saat saçmalar. Zirve açığı hafta içi sorusu.
arac_saatlik = (_ar_hi.groupby("saat")
                .agg(hat_sayisi=("hat", "nunique"),
                     ek_sefer=("ek_sefer", "sum"),
                     ek_arac=("ek_arac", "sum"))
                .join(mevcut_saatlik.rename("mevcut_arac")))
arac_saatlik["artis_yuzde"] = (arac_saatlik["ek_arac"] / arac_saatlik["mevcut_arac"] * 100).round(1)
arac_saatlik = arac_saatlik.round(1).sort_values("ek_arac", ascending=False)
arac_saatlik.to_csv("cikti/arac_ihtiyaci_saatlik.csv")

_zirve = arac_saatlik.index[0]
print(f"      arac_ihtiyaci_saatlik.csv — zirve saat {_zirve}:00, "
      f"+{arac_saatlik.loc[_zirve, 'ek_arac']:.0f} araç "
      f"(%{arac_saatlik.loc[_zirve, 'artis_yuzde']})")


# --------------------------------------------------------------------------
# 7. DASHBOARD VERİSİ
# --------------------------------------------------------------------------

print("[7/7] dashboard JSON'u yazılıyor...")


def sayi(v, ondalik=1):
    return None if pd.isna(v) else round(float(v), ondalik)


veri_js = {}
for hat, grup in son.groupby("hat"):
    b = hat_bilgi.get(hat, {})
    kayit = {
        "ad": b.get("SHATADI"),
        "sefer_suresi": sayi(b.get("SEFER_SURESI", float("nan"))),
        "uzunluk": sayi(b.get("HAT_UZUNLUGU", float("nan")), 2),
        # saat saat ÖLÇÜLMÜŞ sefer süresi (dk) — dashboard araç hesabında kullanılır
        "gercek_sure": [sayi(gercek_sure(hat, s)) for s in range(24)],
    }
    for gt in GUN_TIPLERI:
        g = grup[grup["gun_tipi"] == gt].set_index("saat").reindex(range(24))
        kayit[gt] = {
            "yolcu": [sayi(v, 0) for v in g["yolcu_gunluk"]],
            "sefer": [sayi(v, 0) for v in g["sefer_sayisi"]],
            "doluluk": [sayi(v) for v in g["etkin_doluluk"]],   # devir düzeltmeli anlık yolcu
        }
    veri_js[hat] = kayit

ozet = {
    "olusturma": "2026-08-10",
    "kapasite": KAPASITE,
    "hat_sayisi": len(veri_js),
    "oneri_sayisi": int(len(_ar_hi)),
    "etkilenen_hat": int(_ar_hi["hat"].nunique()),
    "toplam_ek_sefer": int(_ar_hi["ek_sefer"].sum()),
    "zirve_saat": int(_zirve),
    "zirve_ek_arac": float(arac_saatlik.loc[_zirve, "ek_arac"]),
    "zirve_artis_yuzde": float(arac_saatlik.loc[_zirve, "artis_yuzde"]),
    "azalt_sayisi": int(len(azalt)),
    "azalt_hafta_ici_sefer": int(_az_hi["azalt_sefer"].sum()),
    "net_hafta_ici_sefer": int(_ar_hi["ek_sefer"].sum()) - int(_az_hi["azalt_sefer"].sum()),
    "supheli_hat_sayisi": int(len(supheli_df)),
    # Hafta sonu artırma önerileri — manşet rakamlarına KARIŞTIRILMIYOR (Bölüm 7).
    "artir_hafta_sonu_sayisi": int(len(_ar_hs)),
    "artir_hafta_sonu_hat": int(_ar_hs["hat"].nunique()),
    "artir_hafta_sonu_sefer": int(_ar_hs["ek_sefer"].sum()),
    "artir_hafta_sonu_not": ("Hafta sonu artırma önerileri SENTETİK talebe dayanır "
                             "(hafta içinin %72/%52'si). Sefer saatleri gerçek."),
    # saatlik açık — dashboard'daki ana grafiğin kaynağı (24 eleman).
    # mevcut_arac tüm saatler için var; ek_arac o saatte öneri yoksa 0.
    "saatlik": [
        {
            "mevcut_arac": round(float(mevcut_saatlik.get(s, 0.0)), 1),
            "ek_arac": (round(float(arac_saatlik.loc[s, "ek_arac"]), 1)
                        if s in arac_saatlik.index else 0.0),
            "ek_sefer": (int(arac_saatlik.loc[s, "ek_sefer"])
                         if s in arac_saatlik.index else 0),
            "hat": (int(arac_saatlik.loc[s, "hat_sayisi"])
                    if s in arac_saatlik.index else 0),
            "artis": (round(float(arac_saatlik.loc[s, "artis_yuzde"]), 1)
                      if s in arac_saatlik.index else 0.0),
        }
        for s in range(24)
    ],
    "talep_kaynagi": "İBB Açık Veri — Ekim 2024, 5 geçerli gün (hafta içi gerçek)",
    "arz_kaynagi": "İETT SOAP API — PlanlananSeferSaati, 6 Ağustos 2026",
    "sentetik_not": "Cumartesi ve pazar verileri sentetiktir (hafta içinin %72 ve %52'si)",
    "dislanan_not": (f"{len(DISLANAN)} hat analiz dışı: Metrobüs ailesinin 8 kodu "
                     f"(arz gerçek sıklığı yansıtmıyor, talep tek koda yığılmış) ve "
                     f"52 hattın arz verisinde dönüş seferleri yok. Ayrıca "
                     f"{len(supheli_df)} hat için azaltma önerisi üretilmedi (verisi şüpheli)."),
}


# --- öneri listeleri: dashboard tablolarının kaynağı --------------------------
# Kısa anahtarlar dosya boyutunu küçük tutuyor (1.150 + 1.049 satır).
# h=hat g=gün tipi s=saat y=yolcu sf=sefer d=doluluk gs=gerçek süre
# es=ek sefer ea=ek araç os=önerilen sefer az=azaltılacak sefer yd=azaltma sonrası doluluk

def _s(v, ondalik=1):
    return None if pd.isna(v) else round(float(v), ondalik)


def _artir_kayit(df):
    return [
        {"h": r.hat, "g": r.gun_tipi, "s": int(r.saat), "y": _s(r.yolcu_gunluk, 0),
         "sf": int(r.sefer_sayisi), "d": _s(r.etkin_doluluk), "gs": _s(r.gercek_sure, 0),
         "es": int(r.ek_sefer), "ea": _s(r.ek_arac, 2)}
        for r in df.sort_values("ek_arac", ascending=False).itertuples()
    ]


# Ana tablo HAFTA İÇİ kalıyor: paketlenmiş panodaki "Sefer artır" tablosunda gün tipi
# sütunu YOK, hafta sonu satırlarını oraya karıştırırsak sentetik ile gerçek ekranda
# ayırt edilemez (Bölüm 7 taahhüdü). Hafta sonu ayrı anahtarda, ek betik oradan okur.
artir_js = _artir_kayit(_ar_hi)
artir_hs_js = _artir_kayit(_ar_hs)

azalt_js = [
    {"h": r.hat, "g": r.gun_tipi, "s": int(r.saat), "y": _s(r.yolcu_gunluk, 0),
     "d": _s(r.etkin_doluluk), "sf": int(r.sefer_sayisi), "os": int(r.onerilen_sefer),
     "az": int(r.azalt_sefer), "yd": _s(r.yeni_doluluk)}
    for r in azalt.itertuples()
]

supheli_js = [
    {"h": str(i), "y": _s(r["yolcu"], 0), "sf": _s(r["sefer"], 0),
     "d": _s(r["gun_ort_doluluk"], 2)}
    for i, r in supheli_df.iterrows()
]

with open("cikti/dashboard_veri.json", "w", encoding="utf-8") as f:
    json.dump({"ozet": ozet, "hatlar": veri_js, "oneri_artir": artir_js,
               "oneri_artir_hs": artir_hs_js,
               "oneri_azalt": azalt_js, "supheli": supheli_js}, f, ensure_ascii=False)

print(f"      öneri dizileri: artır {len(artir_js)} (hafta içi) + {len(artir_hs_js)} "
      f"(hafta sonu, sentetik) · azalt {len(azalt_js)} · şüpheli {len(supheli_js)}")

print(f"      dashboard_veri.json  {len(veri_js)} hat")
print("\nBİTTİ.")
