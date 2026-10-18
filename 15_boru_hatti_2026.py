"""
15_boru_hatti_2026.py — YÖN AYRIMLI BORU HATTI, TAMAMI 2026 VERİSİYLE (7. seans)

`05_boru_hatti.py`'nin yerine geçmek üzere yazıldı ama ONU DEĞİŞTİRMEZ — ayrı
çıktı dosyalarına yazar, karşılaştırılabilsin ve geri dönülebilsin diye.

NEDEN 2026'YA GEÇİLDİ (7. seans kararı)
---------------------------------------
Talep 2024'ten, arz 2026'dandı. Aradaki 2 yıllık fark Bölüm 11'de kısıt olarak
duruyordu. 2026 talep verisi tam gelince (Bölüm 4.5, 146.259 satır) fark ölçüldü:

    2024 Ekim (Metrobüs hariç) : 3,25 M/gün
    2026 Ağustos               : 2,61 M/gün        → %20 düşük

Bu %20'nin ne kadarı mevsim? İBB portalının metadatasından ÜÇ YIL üzerinden
ölçüldü (aynı yılın ağustos/ekim oranı — metro ve nüfus değişimi yok):

    2020 → 0,95 · 2022 → 0,93 · 2023 → 0,94        → mevsim etkisi ~%6

Yani farkın üçte ikisi mevsim DEĞİL, gerçek düşüş (~%14): yeni metro hatları,
hat değişiklikleri, nüfus hareketi. Demek ki 2024 verisiyle çalışmak bugünkü
talebi ~%14 YÜKSEK gösteriyordu.

⚠️ Bu ölçüm dosya BOYUTUNDAN geliyor (satır sayısıyla orantılı), doğrudan yolcu
sayısından değil. Üç yılın 0,93-0,95'te buluşması güçlü sinyal ama kesin değil.

2026'ya geçmenin kaldırdığı üç kısıt:
  1. Talep–arz yıl farkı        → ikisi de 2026
  2. Sentetik hafta sonu        → gerçek cumartesi ve pazar var
  3. Yön oranının taşınması     → yön aynı veriden geliyor, aktarma yok

Kalan tek dezavantaj: hafta ağustos, yani okul dönemine göre ~%6 düşük.
ÇARPANLA DÜZELTİLMEDİ — yeni bir varsayım katmanı olurdu. Ölçüldü ve beyan edildi:
öneri listesi bu yönde muhafazakârdır.

Çalıştırma:
    source venv/bin/activate
    python3 15_boru_hatti_2026.py
"""

import json
import xml.etree.ElementTree as ET

import numpy as np
import pandas as pd
import requests

# --------------------------------------------------------------------------
# AYARLAR — 05_boru_hatti.py ile birebir aynı (gerekçeler orada)
# --------------------------------------------------------------------------

KAPASITE = 110
GUN_TIPLERI = ["WEEKDAYS", "SATURDAY", "SUNDAY"]

DEVIR_KISA_ESIK = 8.0
DEVIR_UZUN = 1.7

AZALT_DOLU_ESIK = 20
AZALT_MIN_SEFER = 4
AZALT_HEDEF = 40
AZALT_MIN_KALAN = 2
SUPHE_ESIK = 5

SEFER_HAM = "cikti/sefer_ham_20260806.csv"
TALEP_2026 = "veri/yolculuk/yon_verisi_2026_v3.csv"

# 2026 veri haftası: 9-15 Ağustos (Pazar → Cumartesi), hepsi dolu
GUN_ESLEME = {"2026-08-09": "SUNDAY", "2026-08-15": "SATURDAY"}
HAFTA_ICI = ("2026-08-10", "2026-08-14")     # Pazartesi–Cuma
HAFTA_ICI_GUN = 5

# ⚠️ Yön düzeltmesinin uygulanabilmesi için tarifede aranan en az denge.
# Bölüm 6.12'deki kodlama sorunu TALEP tarafına da yansıyor: dönüş kalkışları
# ayrı kaydedilmeyen hatlarda binişler de neredeyse tamamen G koduna yazılıyor.
# Ölçüldü — arz azınlık payına göre talep azınlık payının medyanı:
#   %0-5 → %1,1 · %5-15 → %6,4 · %15-25 → %11,2 · %25-35 → %25,5 · %35-50 → %46,0
# İlk üç bantta talep, arzın çarpıklığını taklit ediyor. %25'ten sonra ayrışıyor.
DENGE_ESIK = 0.25

METROBUS = ["34", "34A", "34AS", "34B", "34BZ", "34C", "34G", "34Z"]

ARZ_EKSIK = ["11D", "11K", "11M", "11ST", "12", "130ŞT", "13H", "145M", "16YK", "19D",
             "22B", "25", "25C", "25S1", "25S2", "29A", "34A", "36", "36Z", "38Z",
             "46KT", "46T", "48S", "48U", "50A", "54HT", "54HŞ", "54P", "54T", "58S",
             "66Z", "70FY", "71T", "73B", "73F", "8Y", "90B", "92K", "9A", "AND1Ş",
             "AND2K", "AND2S", "EL2", "K3", "KM42", "KM43", "KM44", "MK19", "MR42",
             "MR60", "PD1", "UM13"]

DISLANAN = sorted(set(METROBUS + ARZ_EKSIK))

BASE, NS = "https://api.ibb.gov.tr/iett", "http://tempuri.org/"


def devir_kat(uzunluk_km):
    if uzunluk_km is None or pd.isna(uzunluk_km):
        return 1.0
    return 1.0 if uzunluk_km < DEVIR_KISA_ESIK else DEVIR_UZUN


def _soap(path, method, params):
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
# 1. HAT LİSTESİ + GERÇEK SÜRELER
# --------------------------------------------------------------------------
print("[1/7] hat listesi çekiliyor (API'ye 1 istek)...")

root = _soap("UlasimAnaVeri/HatDurakGuzergah.asmx", "GetHat_json", {"HatKodu": ""})
res = next(el for el in root.iter() if el.tag.endswith("Result"))
hatlar = pd.DataFrame(json.loads(res.text))
hatlar["SEFER_SURESI"] = pd.to_numeric(hatlar["SEFER_SURESI"], errors="coerce")
hatlar["HAT_UZUNLUGU"] = pd.to_numeric(hatlar["HAT_UZUNLUGU"], errors="coerce")

HAT_ADI = hatlar.set_index("SHATKODU")["SHATADI"].to_dict()
SURE = hatlar.set_index("SHATKODU")["SEFER_SURESI"].to_dict()
UZUNLUK = hatlar.set_index("SHATKODU")["HAT_UZUNLUGU"].to_dict()
print(f"      {len(hatlar)} hat")

# Gerçek sefer süreleri — araç hesabının temeli (Bölüm 6.9).
# ⚠️ Bu tablolar Ekim 2024'ten ölçüldü, talep ise Ağustos 2026'dan. Süre tarafı
# bilerek değiştirilmedi: ekim süreleri okul dönemini (yoğun trafik) temsil ediyor
# ve araç ihtiyacını bu yönde muhafazakâr tutuyor. Ağustos süreleri ~%11 kısa
# olduğu için onlarla hesap araç ihtiyacını eksik gösterirdi.
try:
    _hs = pd.read_csv("cikti/gercek_sure_hat_saat.csv")
    _hg = pd.read_csv("cikti/gercek_sure_hat.csv")
    _sis = pd.read_csv("cikti/gercek_sure_sistem_saat.csv")
    SURE_HS = {(str(r.hat), int(r.saat)): r.sure_dk for r in _hs.itertuples()}
    SURE_H = {str(r.hat): r.sure_dk for r in _hg.itertuples()}
    SURE_SIS = {int(r.saat): r.sure for r in _sis.itertuples()}
except FileNotFoundError:
    raise SystemExit("HATA: gerçek süre tabloları yok → python3 09_gercek_sureler.py")


def gercek_sure(hat, saat):
    v = SURE_HS.get((hat, saat))
    if v is None:
        v = SURE_H.get(hat)
    if v is None:
        v = SURE_SIS.get(saat)
    return v


# --------------------------------------------------------------------------
# 2. ARZ — hat + gün tipi + saat + YÖN
# --------------------------------------------------------------------------
print("[2/7] arz yöne ayrılıyor...")

sefer_ham = pd.read_csv(SEFER_HAM)
sefer_ham["hat"] = sefer_ham["SHATKODU"].astype(str)
sefer_ham["saat"] = pd.to_numeric(sefer_ham["DT"].astype(str).str[:2], errors="coerce")
sefer_ham["gun_tipi"] = sefer_ham["SGUNTIPI"].map(
    {"I": "WEEKDAYS", "C": "SATURDAY", "P": "SUNDAY"})

# Bölüm 6.12 — bir kalkış gidiş+dönüşün tamamını kapsayan hatlar
_y = sefer_ham.pivot_table(index="hat", columns="SYON", values="DT", aggfunc="count")
_az = (_y.min(axis=1) / _y.sum(axis=1)).fillna(0)
GIDIS_DONUS = set(_az[(_az > 0) & (_az < 0.15)].index)
YON_UYGUN = set(_az[_az >= DENGE_ESIK].index)

arz = (sefer_ham.groupby(["hat", "gun_tipi", "saat", "SYON"]).size()
       .unstack(fill_value=0).reset_index())
for c in ("G", "D"):
    if c not in arz:
        arz[c] = 0
arz["saat"] = arz["saat"].astype(int)
arz["sefer_sayisi"] = arz["G"] + arz["D"]

# Gidiş+dönüş kodlu hatta bir kalkış her iki yöne de birer bacak üretir.
_gd = arz["hat"].isin(GIDIS_DONUS)
arz["bacak_G"] = np.where(_gd, arz["sefer_sayisi"], arz["G"])
arz["bacak_D"] = np.where(_gd, arz["sefer_sayisi"], arz["D"])
arz["bacak_toplam"] = arz["bacak_G"] + arz["bacak_D"]

print(f"      {len(arz):,} hat+gün+saat · gidiş+dönüş kodlu {len(GIDIS_DONUS)} hat · "
      f"yön ayrımına uygun {len(YON_UYGUN)} hat")


# --------------------------------------------------------------------------
# 3. TALEP — 2026, hat + gün tipi + saat + YÖN
# --------------------------------------------------------------------------
print("[3/7] talep okunuyor (2026, gerçek yön)...")

ham = pd.read_csv(TALEP_2026)
ham["tarih"] = pd.to_datetime(ham["Tarih"]).dt.date.astype(str)
ham["saat"] = ham["Saat Tekil"]
ham["yolcu"] = ham["Sefer Bazlı Yolculuk Sayısı"]

# Geçerli güzergâh kodu: HAT_YÖN_VARYANT, orta harf G ya da D. Dosyada ayrıca
# `ARA+`, `SON+`, `ILK+` önekli aktarma kayıtları var — güzergâh değil, 0 yolcu.
_p = ham["Güzergah Kodu"].astype(str).str.split("_")
ham = ham[(_p.str.len() == 3) & _p.str[1].isin(["G", "D"]) & ham["yolcu"].notna()].copy()
ham["hat"] = _p.str[0][ham.index]
ham["yon"] = _p.str[1][ham.index]

ham["gun_tipi"] = ham["tarih"].map(GUN_ESLEME)
_hi = ham["tarih"].between(*HAFTA_ICI)
ham.loc[_hi, "gun_tipi"] = "WEEKDAYS"
ham = ham[ham["gun_tipi"].notna()]

# Hafta içi 5 güne bölünür (gün ORTALAMASI), hafta sonu tek gün — bölme yok.
_bolen = ham["gun_tipi"].map({"WEEKDAYS": HAFTA_ICI_GUN, "SATURDAY": 1, "SUNDAY": 1})
ham["yolcu_gunluk"] = ham["yolcu"] / _bolen

talep = (ham.groupby(["hat", "gun_tipi", "saat", "yon"])["yolcu_gunluk"].sum()
         .unstack(fill_value=0).reset_index())
for c in ("G", "D"):
    if c not in talep:
        talep[c] = 0.0
talep = talep.rename(columns={"G": "yolcu_G", "D": "yolcu_D"})
talep["yolcu_gunluk"] = talep["yolcu_G"] + talep["yolcu_D"]

for g in GUN_TIPLERI:
    x = ham[ham["gun_tipi"] == g]
    print(f"      {g:9} {int(x['yolcu_gunluk'].sum()):>10,} yolcu/gün · "
          f"{x['hat'].nunique()} hat")


# --------------------------------------------------------------------------
# 4. DOLULUK — yön ayrımlı
# --------------------------------------------------------------------------
print("[4/7] doluluk hesaplanıyor...")

son = talep.merge(arz, on=["hat", "gun_tipi", "saat"], how="inner")
son = son[~son["hat"].isin(DISLANAN)].copy()

son["devir"] = son["hat"].map(lambda h: devir_kat(UZUNLUK.get(h)))
son["etkin_kapasite"] = KAPASITE * son["devir"]

# YÖNSÜZ değer — eski modelle karşılaştırma için hep hesaplanıyor
son["doluluk"] = son["yolcu_gunluk"] / son["bacak_toplam"].replace(0, np.nan)
son["etkin_doluluk"] = (son["doluluk"] / son["devir"]).round(1)

# YÖNLÜ değer — yalnızca tarifesi dengeli hatlarda ve iki yönde de sefer olan saatte
son["yonlu"] = (son["hat"].isin(YON_UYGUN)
                & (son["bacak_G"] > 0) & (son["bacak_D"] > 0))

son["doluluk_G"] = np.where(son["yonlu"], son["yolcu_G"] / son["bacak_G"], np.nan)
son["doluluk_D"] = np.where(son["yonlu"], son["yolcu_D"] / son["bacak_D"], np.nan)
son["etkin_G"] = (son["doluluk_G"] / son["devir"]).round(1)
son["etkin_D"] = (son["doluluk_D"] / son["devir"]).round(1)

son["etkin_kritik"] = np.where(son["yonlu"],
                               son[["etkin_G", "etkin_D"]].max(axis=1),
                               son["etkin_doluluk"])
son["kritik_yon"] = np.select(
    [son["yonlu"] & (son["etkin_G"] >= son["etkin_D"]),
     son["yonlu"] & ~(son["etkin_G"] >= son["etkin_D"])],
    ["G", "D"], default="-")

son["doluluk"] = son["doluluk"].round(1)
son["yolcu_gunluk"] = son["yolcu_gunluk"].round(1)
son["yolcu_G"] = son["yolcu_G"].round(1)
son["yolcu_D"] = son["yolcu_D"].round(1)
son = son.sort_values(["hat", "gun_tipi", "saat"])
son.to_csv("cikti/doluluk_2026.csv", index=False)

_hi_s = son[son["gun_tipi"] == "WEEKDAYS"]
print(f"      doluluk_2026.csv {len(son):,} satır · {son['hat'].nunique()} hat")
print(f"      yön ayrımı uygulanan: {int(son['yonlu'].sum()):,} "
      f"(%{100 * son['yonlu'].mean():.0f})")
print(f"      hafta içi medyan — yönsüz {_hi_s['etkin_doluluk'].median()} · "
      f"kritik yön {_hi_s['etkin_kritik'].median()}")


# --------------------------------------------------------------------------
# 5. ÖNERİ — SEFER ARTIR (kalabalık yöne göre)
# --------------------------------------------------------------------------
print("[5/7] artırma listesi...")

hi = son[(son["gun_tipi"] == "WEEKDAYS") & (son["sefer_sayisi"] >= 3)].copy()
art = hi[hi["etkin_kritik"] > KAPASITE].copy()

# Kritik yönün kendi yolcusu ve kendi bacağı üzerinden. NaN ile karşılaştırma
# sessizce False döndüğü için önce `yonlu` kapısına bakılıyor.
_G = art["yonlu"] & (art["etkin_G"] >= art["etkin_D"])
_D = art["yonlu"] & ~(art["etkin_G"] >= art["etkin_D"])
art["yolcu_kritik"] = np.select([_G, _D], [art["yolcu_G"], art["yolcu_D"]],
                                default=art["yolcu_gunluk"])
art["bacak_kritik"] = np.select([_G, _D], [art["bacak_G"], art["bacak_D"]],
                                default=art["bacak_toplam"])

art["gereken_bacak"] = np.ceil(art["yolcu_kritik"] / art["etkin_kapasite"]).astype(int)
art["ek_sefer"] = (art["gereken_bacak"] - art["bacak_kritik"]).clip(lower=0).astype(int)
art = art[art["ek_sefer"] > 0].copy()

art["gercek_sure"] = [gercek_sure(h, s) for h, s in zip(art["hat"], art["saat"])]
art["_arac_kat"] = art["gercek_sure"] / 60
art["mevcut_arac"] = (art["sefer_sayisi"] * art["_arac_kat"]).round(2)
art["ek_arac"] = (art["ek_sefer"] * art["_arac_kat"]).round(2)
art = art.sort_values("ek_arac", ascending=False)
art.to_csv("cikti/oneri_sefer_artir_2026.csv", index=False)

_zirve = art.groupby("saat")["ek_arac"].sum()
print(f"      {len(art)} öneri · {art['hat'].nunique()} hat · "
      f"{int(art['ek_sefer'].sum())} ek sefer")
print(f"      zirve: {int(_zirve.idxmax()):02d}:00 → {_zirve.max():.0f} ek araç")


# --------------------------------------------------------------------------
# 6. ÖNERİ — SEFER AZALT + şüpheli hatlar
# --------------------------------------------------------------------------
# ⭐ Artık YÖN FARKINDA: bir saatte ortalama boş görünse bile yönlerden biri
# doluysa azaltma önerilmiyor. Eski modelde bu ayrım yoktu ve akşam ters yönü
# dolu olan hatlarda sefer kısmak önerilebiliyordu.
print("[6/7] azaltma listesi...")

gun_ort = (son[son["gun_tipi"] == "WEEKDAYS"].groupby("hat")
           .apply(lambda g: pd.Series({
               "yolcu": g["yolcu_gunluk"].sum(),
               "sefer": g["sefer_sayisi"].sum(),
               "gun_ort_doluluk": g["yolcu_gunluk"].sum() /
                                  max(g["bacak_toplam"].sum(), 1)}))
           .reset_index())
gun_ort["gun_ort_doluluk"] = (gun_ort["gun_ort_doluluk"] / gun_ort["hat"]
                              .map(lambda h: devir_kat(UZUNLUK.get(h)))).round(2)
supheli = gun_ort[gun_ort["gun_ort_doluluk"] < SUPHE_ESIK].sort_values("gun_ort_doluluk")
supheli.to_csv("cikti/veri_supheli_hatlar_2026.csv", index=False)
KORUNAN = set(supheli["hat"])

azalt = son[(son["etkin_kritik"] < AZALT_DOLU_ESIK)
            & (son["sefer_sayisi"] >= AZALT_MIN_SEFER)
            & (~son["hat"].isin(KORUNAN))].copy()

# Hedef doluluğa göre gereken sefer — kritik yön üzerinden, iki yön de boş olmalı
azalt["onerilen_sefer"] = np.maximum(
    np.ceil(azalt["yolcu_gunluk"] / (AZALT_HEDEF * azalt["devir"])),
    AZALT_MIN_KALAN).astype(int)
azalt["azalt_sefer"] = (azalt["sefer_sayisi"] - azalt["onerilen_sefer"]).clip(lower=0).astype(int)
azalt = azalt[azalt["azalt_sefer"] > 0].copy()
azalt["yeni_doluluk"] = (azalt["yolcu_gunluk"] /
                         (azalt["onerilen_sefer"] * azalt["bacak_toplam"] /
                          azalt["sefer_sayisi"]).replace(0, np.nan) /
                         azalt["devir"]).round(1)
azalt["gercek_sure"] = [gercek_sure(h, s) for h, s in zip(azalt["hat"], azalt["saat"])]
azalt["kazanilan_arac"] = (azalt["azalt_sefer"] * azalt["gercek_sure"] / 60).round(2)
azalt = azalt.sort_values("azalt_sefer", ascending=False)
azalt.to_csv("cikti/oneri_sefer_azalt_2026.csv", index=False)

_az_hi = azalt[azalt["gun_tipi"] == "WEEKDAYS"]
print(f"      {len(azalt)} satır · {azalt['hat'].nunique()} hat · "
      f"{int(azalt['azalt_sefer'].sum())} azaltılabilir sefer")
for g in GUN_TIPLERI:
    x = azalt[azalt["gun_tipi"] == g]
    print(f"        {g:9} {len(x):>5} satır · {int(x['azalt_sefer'].sum()):>6} sefer"
          f"{'   ← GERÇEK VERİ (sentetik değil)' if g != 'WEEKDAYS' else ''}")
print(f"      şüpheli hat (öneri üretilmedi): {len(supheli)}")
print(f"      hafta içi NET: "
      f"{int(art['ek_sefer'].sum()) - int(_az_hi['azalt_sefer'].sum()):+d} sefer")


# --------------------------------------------------------------------------
# 7. KIYAS — eski model (2024 talep, yönsüz) ile
# --------------------------------------------------------------------------
print("[7/7] eski modelle kıyas...")

try:
    e_art = pd.read_csv("cikti/oneri_sefer_artir.csv")
    e_az = pd.read_csv("cikti/oneri_sefer_azalt.csv")
    e_dol = pd.read_csv("cikti/doluluk.csv")
    _e_az_hi = e_az[e_az["gun_tipi"] == "WEEKDAYS"]
    print()
    print("=" * 70)
    print(f"{'':30}{'ESKİ (2024, yönsüz)':>20}{'YENİ (2026, yönlü)':>20}")
    print("-" * 70)
    satirlar = [
        ("doluluk satırı", len(e_dol), len(son)),
        ("hat sayısı", e_dol["hat"].nunique(), son["hat"].nunique()),
        ("artırma önerisi", len(e_art), len(art)),
        ("  etkilenen hat", e_art["hat"].nunique(), art["hat"].nunique()),
        ("  toplam ek sefer", int(e_art["ek_sefer"].sum()), int(art["ek_sefer"].sum())),
        ("  zirve ek araç", round(e_art.groupby("saat")["ek_arac"].sum().max()),
         round(_zirve.max())),
        ("azaltma (hafta içi) sefer", int(_e_az_hi["azalt_sefer"].sum()),
         int(_az_hi["azalt_sefer"].sum())),
        ("hafta sonu verisi", "SENTETİK", "GERÇEK"),
    ]
    for ad, a, b in satirlar:
        print(f"{ad:30}{str(a):>20}{str(b):>20}")
    print("=" * 70)
except FileNotFoundError:
    print("      (eski çıktılar yok, kıyas atlandı)")

print()
print("EN KRİTİK 12 SATIR:")
_g = art.head(12).copy()
_g["yon_ad"] = _g["kritik_yon"].map({"G": "GİDİŞ", "D": "DÖNÜŞ", "-": "yönsüz"})
print(_g[["hat", "saat", "yon_ad", "yolcu_gunluk", "yolcu_kritik", "bacak_kritik",
          "etkin_doluluk", "etkin_kritik", "ek_sefer", "ek_arac"]]
      .round(1).to_string(index=False))
