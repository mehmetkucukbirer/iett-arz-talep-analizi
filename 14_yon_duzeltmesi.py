"""
14_yon_duzeltmesi.py — YÖN AYRIMLI DOLULUK (7. seans, v2)

Mevcut model bir hattın bir saatteki yolcusunu, o saatteki TÜM seferlere böler.
Oysa yolcular tek yöne yığılabiliyor. Bu betik talebi yöne ayırıp doluluğu
KALABALIK YÖN üzerinden hesaplar.

TASARIM — her soruyu en güvenilir kaynağa sorar:
  KAÇ KİŞİ  ← 2024 CSV (doluluk.csv)   hat + saat        dolu, ekim dönemi
  NE ORANDA ← 2026 yön verisi          hat + saat + yön  ÖLÇÜM (v3 dosyası)
  KAÇ SEFER ← tarife (sefer_ham)       hat + saat + yön  tam veri

2026'dan SAYI değil ORAN alınıyor — bu yüzden o dosyanın ağustos (tatil) haftasına
ait olması sonucu etkilemiyor. Oran mevsimden bağımsız: ağustosta da ekimde de
sabah aynı yöne gidiliyor.

⚠️ v1'den fark: v1'de oran SİSTEM GENELİ dört katsayıydı (%90,6/%58,8/%26,3/%16,8)
çünkü elimizdeki örneklem %0,44 doluydu. v3 dosyası gelince oran HAT BAZINDA
ölçülebilir hale geldi; yönelim tahmini, YON_ESIK ve hizalama mantığı kalktı.

Çıktı: cikti/doluluk_yonlu.csv · cikti/oneri_sefer_artir_yonlu.csv
Mevcut çıktılara DOKUNMAZ — kıyaslanabilsin diye ayrı dosya.
"""

import numpy as np
import pandas as pd

KAPASITE = 110      # araçtaki anlık yolcu kapasitesi (05_boru_hatti.py ile aynı)
MIN_YOLCU = 100     # bir oranı "hat+saat" düzeyinde kabul etmek için gereken en az
                    # yolcu (5 günün toplamı). Altında bir üst kademeye düşülür.

# ⚠️ Yön düzeltmesi için hattın tarifesinde aranan en az denge (azınlık yönün payı).
# Bölüm 6.12'deki kodlama sorunu TALEP tarafına da yansıyor: dönüş kalkışları ayrı
# kaydedilmeyen hatlarda binişler de neredeyse tamamen G koduna yazılıyor.
# Ölçüldü — arz azınlık payına göre talep azınlık payının medyanı:
#     %0-5 → %1,1 · %5-15 → %6,4 · %15-25 → %11,2 · %25-35 → %25,5 · %35-50 → %46,0
# İlk üç bantta talep, arzın çarpıklığını taklit ediyor: ölçüm değil, kodlama izi.
# %25'ten itibaren ikisi ayrışıyor. Bacak eşiği (%15) yerine bu daha ihtiyatlı kapı
# kullanılıyor; altında kalan hatlar eski (yönsüz) hesapla devam ediyor.
DENGE_ESIK = 0.25


def blok(saat):
    """Kademeli aramanın ikinci basamağı. Tek tek saatlerde verisi ince olan
    hatlar için zaman dilimi ortalaması kullanılıyor."""
    if 5 <= saat <= 9:
        return "SABAH"
    if 10 <= saat <= 15:
        return "GUNDUZ"
    if 16 <= saat <= 19:
        return "AKSAM"
    return "GECE"


# ---------------------------------------------------------------------------
# 1. 2026 YÖN VERİSİ — temizle
# ---------------------------------------------------------------------------
print("[1/6] 2026 yön verisi okunuyor...")

ham = pd.read_csv("veri/yolculuk/yon_verisi_2026_v3.csv")
ham["tarih"] = pd.to_datetime(ham["Tarih"]).dt.date
ham["saat"] = ham["Saat Tekil"]
ham["yolcu"] = ham["Sefer Bazlı Yolculuk Sayısı"]

# Geçerli güzergâh kodu: HAT_YÖN_VARYANT, orta harf G veya D.
# Dosyada ayrıca `ARA+...`, `SON+...`, `ILK+...` önekli aktarma kayıtları var —
# bunlar güzergâh değil, hepsi yanlışlıkla "GİDİŞ" etiketli ve 0 yolcu taşıyorlar.
_p = ham["Güzergah Kodu"].astype(str).str.split("_")
gecerli = (_p.str.len() == 3) & _p.str[1].isin(["G", "D"])
ham = ham[gecerli & ham["yolcu"].notna()].copy()
ham["hat"] = _p.str[0][ham.index]
ham["yon"] = _p.str[1][ham.index]          # G / D — sefer_ham'daki SYON ile aynı harf

# 2026 veri haftası: 9-15 Ağustos (Pazar → Cumartesi), üç gün tipi de dolu.
# ⭐ 7. seans: yön oranı artık hafta sonu için de ölçülüyor. Hafta sonu TALEBİ
# hâlâ sentetik (Bölüm 7) ama YÖN ORANI gerçek — ikisi ayrı şeyler.
GUN_ESLEME = {"2026-08-09": "SUNDAY", "2026-08-15": "SATURDAY"}
_t = ham["tarih"].astype(str)
ham["gun_tipi"] = _t.map(GUN_ESLEME)
ham.loc[_t.between("2026-08-10", "2026-08-14"), "gun_tipi"] = "WEEKDAYS"
ham = ham[ham["gun_tipi"].notna()].copy()
ham["blok"] = ham["saat"].map(blok)

for g in ["WEEKDAYS", "SATURDAY", "SUNDAY"]:
    x = ham[ham["gun_tipi"] == g]
    print(f"      {g:9} {len(x):>6,} satır · {x['hat'].nunique()} hat · "
          f"{int(x['yolcu'].sum()):>10,} yolcu")


# ---------------------------------------------------------------------------
# 2. YÖN ORANI — dört kademeli arama
# ---------------------------------------------------------------------------
# Her hat+saat için "yolcuların yüzde kaçı G yönünde" hesaplanıyor. İnce hücreler
# bir üst kademeye düşüyor — gerçek sefer sürelerindeki (Bölüm 6.9) üç kademeli
# aramanın aynısı, bir basamak fazlasıyla.
print("[2/6] yön oranı hesaplanıyor (4 kademe)...")

ham["g"] = np.where(ham["yon"] == "G", ham["yolcu"], 0)


def oran_tablosu(anahtar):
    t = ham.groupby(anahtar).agg(g=("g", "sum"), top=("yolcu", "sum"))
    t = t[t["top"] >= MIN_YOLCU]
    return (t["g"] / t["top"]).to_dict()


# Kademelerin hepsi GÜN TİPİ kırılımlı — hafta sonu deseni hafta içinden farklı
# (işe gidiş yok, gün ortası ağırlıklı), aynı oranı uygulamak yanlış olurdu.
ORAN_HS = oran_tablosu(["hat", "gun_tipi", "saat"])   # 1. kademe
ORAN_HB = oran_tablosu(["hat", "gun_tipi", "blok"])   # 2. kademe
ORAN_H = oran_tablosu(["hat", "gun_tipi"])            # 3. kademe
ORAN_B = oran_tablosu(["gun_tipi", "blok"])           # 4. kademe — son çare


def yon_orani(hat, gun, saat):
    """(oran, hangi kademeden geldiği) döner."""
    b = blok(saat)
    if (hat, gun, saat) in ORAN_HS:
        return ORAN_HS[(hat, gun, saat)], "hat+saat"
    if (hat, gun, b) in ORAN_HB:
        return ORAN_HB[(hat, gun, b)], "hat+blok"
    if (hat, gun) in ORAN_H:
        return ORAN_H[(hat, gun)], "hat"
    return ORAN_B.get((gun, b), ORAN_B.get(("WEEKDAYS", b), 0.5)), "sistem"


print(f"      1. kademe (hat+gün+saat): {len(ORAN_HS):,} · "
      f"2. (hat+gün+blok): {len(ORAN_HB):,} · 3. (hat+gün): {len(ORAN_H):,}")


# ---------------------------------------------------------------------------
# 3. ARZIN YÖN KIRILIMI — hat + saat + yön → kaç bacak
# ---------------------------------------------------------------------------
print("[3/6] arz yöne ayrılıyor...")

sefer = pd.read_csv("cikti/sefer_ham_20260806.csv")
sefer["hat"] = sefer["SHATKODU"].astype(str)
sefer["saat"] = pd.to_numeric(sefer["DT"].astype(str).str[:2], errors="coerce")

# Bölüm 6.12: 103 hatta bir kalkış gidiş+dönüşün tamamını kapsıyor. O hatlarda
# dönüş kalkışları ayrı kaydedilmediği için SYON kırılımı yanıltıcı — her kalkış
# iki yöne de birer bacak üretir.
_y = sefer.pivot_table(index="hat", columns="SYON", values="DT", aggfunc="count")
_az = (_y.min(axis=1) / _y.sum(axis=1)).fillna(0)
GIDIS_DONUS = set(_az[(_az > 0) & (_az < 0.15)].index)
# Yön düzeltmesinin uygulanabileceği hatlar — yukarıdaki DENGE_ESIK açıklamasına bak.
YON_UYGUN = set(_az[_az >= DENGE_ESIK].index)

sefer["gun_tipi"] = sefer["SGUNTIPI"].map(
    {"I": "WEEKDAYS", "C": "SATURDAY", "P": "SUNDAY"})
hi_sefer = sefer[sefer["SGUNTIPI"] == "I"]

arz = (sefer.groupby(["hat", "gun_tipi", "saat", "SYON"]).size()
       .unstack(fill_value=0).reset_index())
for c in ("G", "D"):
    if c not in arz:
        arz[c] = 0
arz["saat"] = arz["saat"].astype(int)

_gd = arz["hat"].isin(GIDIS_DONUS)
_top = arz["G"] + arz["D"]
arz["bacak_G"] = np.where(_gd, _top, arz["G"])
arz["bacak_D"] = np.where(_gd, _top, arz["D"])

print(f"      {len(arz):,} hat+gün+saat · gidiş+dönüş kodlu {len(GIDIS_DONUS)} hat "
      f"her iki yöne de tam bacak sayılıyor")


# ---------------------------------------------------------------------------
# 4. YÖNLÜ DOLULUK — 2024 hacmi × 2026 oranı
# ---------------------------------------------------------------------------
print("[4/6] yönlü doluluk hesaplanıyor...")

dol = pd.read_csv("cikti/doluluk.csv")
dol["hat"] = dol["hat"].astype(str)
# ⭐ Üç gün tipi birden. Öneri listesi yine yalnızca hafta içinden çıkıyor
# (hafta sonu talebi sentetik, Bölüm 7) ama doluluk tablosu hepsini taşıyor —
# "Detaylar" paneli hafta sonunu da gösterebilsin diye.
hi = dol.copy()
hi = hi.merge(arz[["hat", "gun_tipi", "saat", "bacak_G", "bacak_D"]],
              on=["hat", "gun_tipi", "saat"], how="left")

_o = [yon_orani(h, g, s) for h, g, s in zip(hi["hat"], hi["gun_tipi"], hi["saat"])]
hi["oran_G"] = [x[0] for x in _o]
hi["oran_kaynak"] = [x[1] for x in _o]

# Düzeltme iki koşulla uygulanır:
#  (a) hattın tarifesi yeterince dengeli (DENGE_ESIK) — yoksa yön oranı ölçüm değil,
#      Bölüm 6.12'deki kodlama izidir;
#  (b) o saatte iki yönde de sefer var — tek yön çalışan saatte eski hesap zaten
#      doğru (kapasite_sefer o yönün bacak sayısına eşit) ve 0'a bölme olmaz.
uygun = (hi["hat"].isin(YON_UYGUN)) & (hi["bacak_G"] > 0) & (hi["bacak_D"] > 0)

hi["yolcu_G"] = np.where(uygun, hi["yolcu_gunluk"] * hi["oran_G"], np.nan)
hi["yolcu_D"] = np.where(uygun, hi["yolcu_gunluk"] * (1 - hi["oran_G"]), np.nan)
hi["doluluk_G"] = (hi["yolcu_G"] / hi["bacak_G"]).round(1)
hi["doluluk_D"] = (hi["yolcu_D"] / hi["bacak_D"]).round(1)

# Devir hattın yapısal özelliği — iki yöne de aynı uygulanır.
hi["etkin_G"] = (hi["doluluk_G"] / hi["devir"]).round(1)
hi["etkin_D"] = (hi["doluluk_D"] / hi["devir"]).round(1)

hi["etkin_kritik"] = np.where(uygun, hi[["etkin_G", "etkin_D"]].max(axis=1),
                              hi["etkin_doluluk"])
hi["yonlu"] = uygun
hi.to_csv("cikti/doluluk_yonlu.csv", index=False)

print(f"      doluluk_yonlu.csv {len(hi):,} satır · "
      f"yön düzeltmesi uygulanan: {int(uygun.sum()):,} (%{100 * uygun.mean():.0f})")
print("      oran kaynağı:", hi[uygun]["oran_kaynak"].value_counts().to_dict())


# ---------------------------------------------------------------------------
# 5. YÖNLÜ ÖNERİ LİSTESİ
# ---------------------------------------------------------------------------
print("[5/6] öneri listesi çıkarılıyor...")

# 8. seans: HAFTA İÇİ filtresi KALDIRILDI (05_boru_hatti.py ile aynı gerekçe).
# Sentetik olan SEVİYE, taşmanın kendisi değil; üstelik çarpanlar (%72/%52) ölçülen
# gerçeğin (%79/%58) altında — sentetik diye susmak sıkışıklığı gizlemek olurdu.
# Şart: hafta sonu satırları AYRI sayılır, `gun_tipi` etiketiyle sunulur (Bölüm 7).
o = hi[(hi["sefer_sayisi"] >= 3) & (hi["etkin_kritik"] > KAPASITE)].copy()

# --- ARZ-TALEP YÖN ÇELİŞKİSİ FİLTRESİ (7. seans) --------------------------
# Bazı hat+saatlerde tarifede tek yön çalışıyor. Bu tek başına sorun DEĞİL:
# 14ES sabah yalnızca gidiş yapıyor ve talep de %100 gidiş yönünde — arz ve
# talep birbirini doğruluyor, doluluk doğru hesaplanıyor.
#
# SORUN, ikisi ÇELİŞTİĞİNDE: tarifede hiç gidiş seferi yokken yolcuların
# önemli bir kısmı gidiş yönünde görünüyorsa, o yolcuların bacağı paydada yok →
# doluluk yapay yüksek → hat gereksiz yere öneri listesine giriyor.
# Bölüm 6.5'teki "52 hattın dönüş seferleri yok" sorununun SAAT düzeyindeki hâli.
#
# ÖLÇÜM (hafta içi, 3.400 tek yönlü saat): talebin arzın çalıştırdığı yönde
# olma oranı → %81'i >0,95 (uyumlu) · %2'si 0,75-0,95 · %17'si <0,75 (çelişki).
# Eşik 0,75 seçildi: dörtte birden fazla yolcu hiç seferi olmayan yönde
# görünüyorsa payda güvenilmez.
CELISKI_ESIK = 0.75
_bG = o["bacak_G"].fillna(0)
_bD = o["bacak_D"].fillna(0)
_tek = ((_bG == 0) | (_bD == 0)) & (_bG + _bD > 0)
_uyum = np.where(_bD == 0, o["oran_G"], 1 - o["oran_G"])
_celiski = _tek & (_uyum < CELISKI_ESIK)
if _celiski.any():
    print(f"      ⚠️ arz-talep yön çelişkisi → {int(_celiski.sum())} satır elendi: "
          + ", ".join(f"{r.hat}/{int(r.saat)}:00" for r in o[_celiski].itertuples()))
o = o[~_celiski].copy()

# ⚠️ NaN ile karşılaştırma sessizce False döner ve sıfır bacak seçtirir.
# Bu yüzden önce `yonlu` kapısına bakılıyor.
_G = o["yonlu"] & (o["etkin_G"] >= o["etkin_D"])
_D = o["yonlu"] & ~(o["etkin_G"] >= o["etkin_D"])

o["kritik_yon"] = np.select([_G, _D], ["GİDİŞ", "DÖNÜŞ"], default="yönsüz")
o["yolcu_kritik"] = np.select([_G, _D], [o["yolcu_G"], o["yolcu_D"]],
                              default=o["yolcu_gunluk"])
o["bacak_kritik"] = np.select([_G, _D], [o["bacak_G"], o["bacak_D"]],
                              default=o["kapasite_sefer"])

# --- HER YÖN KENDİ İHTİYACINA GÖRE (7. seans düzeltmesi) -------------------
# ⚠️ ÖNCE YALNIZCA KRİTİK YÖNE SEFER EKLENİYORDU. Ölçüldü: yönlü önerilerin
# %22'sinde (134 satırın 30'u) İKİ YÖN DE kapasiteyi aşıyor ve ihmal edilen
# yönün medyan doluluğu 135,6 — yani ikinci yön de sefer istiyor ama hesaba
# girmiyordu. Tarifede o yönün saatleri kırmızı görünüp hiç yeşil ekleme
# çıkmamasının sebebi buydu (Mehmet fark etti).
#
# Doğrusu: her yön kendi yolcusunu kendi bacağıyla karşılamalı.
#   ek_G = ceil(yolcu_G / etkin_kapasite) − bacak_G      (negatifse 0)
#   ek_D = aynısı
#   ek_sefer = ek_G + ek_D
def _ek(yolcu, bacak, kap):
    return np.maximum(np.ceil(yolcu.fillna(0) / kap) - bacak.fillna(0), 0)


o["ek_G"] = np.where(o["yonlu"], _ek(o["yolcu_G"], o["bacak_G"], o["etkin_kapasite"]), 0)
o["ek_D"] = np.where(o["yonlu"], _ek(o["yolcu_D"], o["bacak_D"], o["etkin_kapasite"]), 0)
# Yön ayrımı uygulanamayan satırda eski tek yönlü hesap geçerli.
_yonsuz_ek = _ek(o["yolcu_gunluk"], o["bacak_kritik"], o["etkin_kapasite"])
o["ek_G"] = o["ek_G"].astype(int)
o["ek_D"] = o["ek_D"].astype(int)
o["ek_sefer"] = np.where(o["yonlu"], o["ek_G"] + o["ek_D"], _yonsuz_ek).astype(int)
o["gereken_bacak"] = np.ceil(o["yolcu_kritik"] / o["etkin_kapasite"]).astype(int)

# Araç karşılığı: araç = sefer × gerçek sefer süresi ÷ 60 (Bölüm 6.9).
_hs = pd.read_csv("cikti/gercek_sure_hat_saat.csv")
_hs["hat"] = _hs["hat"].astype(str)
SURE_HS = {(h, s): v for h, s, v in zip(_hs["hat"], _hs["saat"], _hs["sure_dk"])}
_h = pd.read_csv("cikti/gercek_sure_hat.csv")
SURE_H = dict(zip(_h["hat"].astype(str), _h["sure_dk"]))
_s = pd.read_csv("cikti/gercek_sure_sistem_saat.csv")
SURE_S = dict(zip(_s["saat"], _s["sure"]))

o["gercek_sure"] = [SURE_HS.get((h, s)) or SURE_H.get(h) or SURE_S.get(s)
                    for h, s in zip(o["hat"], o["saat"])]
o["ek_arac"] = (o["ek_sefer"] * o["gercek_sure"] / 60).round(2)

o = o[o["ek_sefer"] > 0].sort_values("ek_arac", ascending=False)
o.to_csv("cikti/oneri_sefer_artir_yonlu.csv", index=False)
eski_ref = pd.read_csv("cikti/oneri_sefer_artir.csv")   # kıyas ve JSON için
# 05 artık hafta sonu önerisi de yazıyor; "yönsüz eski liste" kıyası hafta içi
# ile hafta içi karşılaştırması olmalı, yoksa 96 sayısı şişer.
eski_ref = eski_ref[eski_ref["gun_tipi"] == "WEEKDAYS"]


# ---------------------------------------------------------------------------
# 6. DASHBOARD JSON
# ---------------------------------------------------------------------------
# Dashboard paketlenmiş React — elle düzenlenemiyor. Bu yüzden yön verisi ayrı bir
# JSON'a yazılıp ekrana `notlar/dashboard_ek_betikler/yon.js` ile ekleniyor.
# Mevcut `dashboard_veri.json` bozulmuyor.
print("[6/7] dashboard JSON yazılıyor...")

import json
from datetime import datetime

# Yön adları durak listelerinden: "İLK DURAK → SON DURAK"
guz = json.load(open("cikti/guzergahlar.json", encoding="utf-8"))


def yon_adi(hat, yon):
    d = guz.get(hat, {}).get(yon)
    if not d or len(d) < 2:
        return "GİDİŞ" if yon == "G" else "DÖNÜŞ"
    return f"{d[0][2]} → {d[-1][2]}"


ADLAR = {h: {"G": yon_adi(h, "G"), "D": yon_adi(h, "D")} for h in guz}

# Manşet rakamları (zirve saat, zirve ek araç) HAFTA İÇİ sorusudur — gerçek veriye
# dayanır. Hafta sonu önerileri ayrı tutulup ayrı raporlanıyor.
o_hi = o[o["gun_tipi"] == "WEEKDAYS"]
o_hs = o[o["gun_tipi"] != "WEEKDAYS"]
_saatlik = o_hi.groupby("saat")[["ek_sefer", "ek_arac"]].sum()
_zirve = _saatlik["ek_arac"].idxmax()


def _s(v, n=1):
    return None if pd.isna(v) else round(float(v), n)


# --- TARİFE + ÖNERİLEN EKLEME DAKİKALARI ----------------------------------
# `sefer_ham` her kalkışı dakikasıyla taşıyor ve resmi tarifeyle birebir örtüşüyor
# (Bölüm 6.11'de 76O için doğrulandı). Bu sayede öneriyi "saat 17'ye +2 sefer"
# yerine "17:12 ve 17:38'e ekle" diye somutlaştırabiliyoruz.
#
# ⚠️ DAKİKA YERLEŞİMİ ÖLÇÜM DEĞİL, KARAR. Talep saatlik olduğu için saat içindeki
# dağılımı bilmiyoruz. Benimsenen ilke: MEVCUT KALKIŞLARA DOKUNMA, en büyük
# aralıkların ortasına ekle. İETT pratiğinde tercih edilen yol bu — yolcunun
# alıştığı saatler korunuyor, sadece araları sıklaşıyor.
print("      tarife ve ekleme dakikaları hesaplanıyor...")

_sf = sefer.copy()
_sf["dk"] = (pd.to_numeric(_sf["DT"].astype(str).str[:2], errors="coerce") * 60
             + pd.to_numeric(_sf["DT"].astype(str).str[3:5], errors="coerce"))
_sf = _sf.dropna(subset=["dk"])
_hi_sefer = _sf[_sf["SGUNTIPI"] == "I"]

# Tarife üç gün tipini birden taşıyor — dashboard'daki tablo İETT'nin kendi
# sayfasındaki gibi "İş Günleri / Cumartesi / Pazar" sütunlarıyla çiziliyor.
# Tarife hem ARTIRMA hem AZALTMA listesindeki hatlar için üretiliyor — ikisinin
# de panelinde tablo açılıyor. 676 hattın tamamı konsa dosya birkaç MB olurdu.
_az_csv = pd.read_csv("cikti/oneri_sefer_azalt.csv")
_az_csv["hat"] = _az_csv["hat"].astype(str)
ONERI_HAT = set(o["hat"]) | set(_az_csv["hat"])

TARIFE = {}
for (h, y, g), grp in _sf[_sf["hat"].isin(ONERI_HAT)].groupby(["hat", "SYON", "SGUNTIPI"]):
    TARIFE.setdefault(h, {}).setdefault(y, {})[g] = sorted(set(int(v) for v in grp["dk"]))


def dkstr(m):
    return f"{int(m) // 60 % 24:02d}:{int(m) % 60:02d}"


def ekleme_dakikalari(hat, saat, yon, adet, gun="I"):
    """O saatteki en büyük boşlukların ortasına `adet` kadar kalkış yerleştirir.
    `gun`: I/C/P — öneri hangi gün tipindeyse o günün TARİFESİ üzerinde çalışır.
    (8. seansa kadar sabit "I" idi; hafta sonu önerileri açılınca parametre oldu.)"""
    liste = TARIFE.get(hat, {})
    if yon in ("G", "D"):
        kalkis = liste.get(yon, {}).get(gun, [])
    else:
        kalkis = sorted(set(liste.get("G", {}).get(gun, []) +
                            liste.get("D", {}).get(gun, [])))
    if not kalkis:
        return []
    bas, bit = saat * 60, saat * 60 + 60
    ic = [k for k in kalkis if bas <= k < bit]
    if not ic:
        return []
    # Saatin sonunu kapatmak için bir sonraki kalkış (yoksa saat sınırı) sınır alınır.
    sonraki = next((k for k in kalkis if k >= bit), bit)
    sinirlar = ic + [sonraki]
    yeni = []
    for _ in range(int(adet)):
        araliklar = [(sinirlar[i + 1] - sinirlar[i], i) for i in range(len(sinirlar) - 1)]
        # Eşit boşluklarda ERKEN olanı seç. `max` demetleri karşılaştırdığı için
        # düz kullanımda sonuncuyu seçiyordu; o da saat sınırına denk gelip
        # önerinin saatin dışına düşmesine yol açıyordu.
        buyuk, i = max(araliklar, key=lambda t: (t[0], -t[1]))
        if buyuk < 4:                      # 4 dakikadan sık kalkış önerilmiyor
            break
        # Yeni kalkış her hâlükârda o saatin içinde kalmalı.
        orta = min(sinirlar[i] + buyuk // 2, bit - 1)
        if orta in sinirlar:
            break
        yeni.append(orta)
        sinirlar = sorted(sinirlar + [orta])
    return [dkstr(m) for m in sorted(yeni)]


# --- ÇIKARILABİLECEK KALKIŞLAR ---------------------------------------------
# Azaltma listesi "saat 14'te 27 sefer azaltılabilir" diyor. Tarifede bunu
# göstermek için hangi kalkışların çıkarılacağını seçmek gerekiyor.
#
# İLKE: İLK VE SON KALKIŞ KORUNUR, aradakiler eşit aralıkla seyreltilir.
# Böylece hattın çalışma penceresi daralmıyor, sadece sıklık düşüyor —
# eklemedeki "mevcut kalkışlara dokunma" ilkesinin karşılığı.
#
# ⚠️ Ekleme gibi bu da ÖLÇÜM DEĞİL, KARAR. Hangi seferin kaldırılacağını talep
# verisi söylemiyor; saat içindeki dağılımı bilmiyoruz.
print("      çıkarılabilecek kalkışlar hesaplanıyor...")

GUN_KODU = {"WEEKDAYS": "I", "SATURDAY": "C", "SUNDAY": "P"}

CIKAR = {}
for r in _az_csv.itertuples():
    gk = GUN_KODU.get(r.gun_tipi)
    if gk is None:
        continue
    liste = TARIFE.get(r.hat, {})
    # Azaltma yönsüz hesaplandı — iki yönün kalkışları birlikte ele alınıyor.
    for yon in ("G", "D"):
        kalkis = liste.get(yon, {}).get(gk, [])
        ic = [k for k in kalkis if r.saat * 60 <= k < r.saat * 60 + 60]
        if len(ic) < 2:
            continue
        # Bu yöne düşen pay: toplam azaltmanın yön başına oranı
        pay = int(round(int(r.azalt_sefer) * len(ic) /
                        max(sum(len([k for k in liste.get(y, {}).get(gk, [])
                                     if r.saat * 60 <= k < r.saat * 60 + 60])
                                for y in ("G", "D")), 1)))
        kalan = max(len(ic) - pay, 2)          # hiçbir saatte 2'nin altına inme
        if kalan >= len(ic):
            continue
        # Eşit aralıkla `kalan` kadar kalkış seç — ilk ve son daima içeride.
        tut = set()
        for i in range(kalan):
            tut.add(ic[round(i * (len(ic) - 1) / (kalan - 1))] if kalan > 1 else ic[0])
        for k in ic:
            if k not in tut:
                CIKAR.setdefault(r.hat, {}).setdefault(gk, {})[dkstr(k)] = 1

cikti = {
    "ozet": {
        "olusturma": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "oneri": len(o_hi), "hat": int(o_hi["hat"].nunique()),
        "ek_sefer": int(o_hi["ek_sefer"].sum()),
        # Hafta sonu — manşete karıştırılmıyor, kendi alanlarında duruyor.
        "hs_oneri": len(o_hs), "hs_hat": int(o_hs["hat"].nunique()),
        "hs_ek_sefer": int(o_hs["ek_sefer"].sum()),
        "hs_not": ("Hafta sonu önerileri SENTETİK talebe dayanır "
                   "(hafta içinin %72/%52'si). Sefer saatleri ve yön oranı gerçek."),
        "zirve_saat": int(_zirve), "zirve_ek_arac": _s(_saatlik.loc[_zirve, "ek_arac"], 0),
        "eski_oneri": len(eski_ref), "eski_hat": int(eski_ref["hat"].nunique()),
        "eski_ek_sefer": int(eski_ref["ek_sefer"].sum()),
        "eski_zirve_arac": _s(eski_ref.groupby("saat")["ek_arac"].sum().max(), 0),
        "kapsam": _s(100 * uygun.mean(), 0),
        "kaynak": "9-15 Ağustos 2026 · 146.259 satır · hat+saat düzeyinde ölçüm",
        "saatlik": [{"s": int(s), "es": int(r.ek_sefer), "ea": _s(r.ek_arac)}
                    for s, r in _saatlik.iterrows()],
    },
    "oneri": [{
        "h": r.hat, "s": int(r.saat), "yon": r.kritik_yon,
        "ad": ADLAR.get(r.hat, {}).get("G" if r.kritik_yon == "GİDİŞ" else "D", ""),
        "y": _s(r.yolcu_gunluk, 0), "yk": _s(r.yolcu_kritik, 0),
        "bk": int(r.bacak_kritik), "d0": _s(r.etkin_doluluk), "dk": _s(r.etkin_kritik),
        "es": int(r.ek_sefer), "ea": _s(r.ek_arac, 2), "kay": r.oran_kaynak,
        # Ekleme dakikaları HER YÖN İÇİN ayrı üretiliyor; tarifede iki blokta
        # da yeşil kalkışlar çıksın diye yön bilgisiyle birlikte veriliyor.
        # g: I/C/P — yon.js yeşil kalkışları tarifenin DOĞRU sütununa koysun diye.
        "g": GUN_KODU[r.gun_tipi],
        "sentetik": 0 if r.gun_tipi == "WEEKDAYS" else 1,
        "yeniG": (ekleme_dakikalari(r.hat, int(r.saat), "G", r.ek_G,
                                    GUN_KODU[r.gun_tipi]) if r.yonlu else []),
        "yeniD": (ekleme_dakikalari(r.hat, int(r.saat), "D", r.ek_D,
                                    GUN_KODU[r.gun_tipi]) if r.yonlu else []),
        "yeni": (ekleme_dakikalari(r.hat, int(r.saat), "-", r.ek_sefer,
                                   GUN_KODU[r.gun_tipi]) if not r.yonlu else []),
        "eG": int(r.ek_G), "eD": int(r.ek_D),
    } for r in o.itertuples()],
    "hatlar": {},
    # Tarife: hat → yön → gün tipi (I/C/P) → "HH:MM" listesi.
    # Sadece öneri listesindeki hatlar için — tamamı konsa dosya gereksiz şişerdi.
    "tarife": {h: {y: {g: [dkstr(m) for m in v] for g, v in gd.items()}
                   for y, gd in d.items()} for h, d in TARIFE.items()},
    # Yön başlıkları İETT'nin kendi sayfasındaki gibi "<KALKIŞ NOKTASI> KALKIŞ".
    "kalkis_adi": {h: {y: (guz.get(h, {}).get(y) or [[0, 0, "GİDİŞ" if y == "G"
                                                     else "DÖNÜŞ"]])[0][2]
                       for y in ("G", "D")} for h in TARIFE},
    # Çıkarılabilecek kalkışlar: hat → gün tipi → "HH:MM" → 1
    "cikar": {h: {g: sorted(v.keys()) for g, v in d.items()} for h, d in CIKAR.items()},
}

_hi_yonlu = hi[hi["yonlu"] & (hi["gun_tipi"] == "WEEKDAYS")]
for h, grp in _hi_yonlu.groupby("hat"):
    cikti["hatlar"][h] = {
        "G": ADLAR.get(h, {}).get("G", "GİDİŞ"),
        "D": ADLAR.get(h, {}).get("D", "DÖNÜŞ"),
        "saat": [{"s": int(r.saat), "oG": _s(r.oran_G, 3),
                  "bG": int(r.bacak_G), "bD": int(r.bacak_D),
                  "eG": _s(r.etkin_G), "eD": _s(r.etkin_D), "e0": _s(r.etkin_doluluk)}
                 for r in grp.sort_values("saat").itertuples()],
    }

# --- DETAY: üç gün tipinin saatlik dökümü -----------------------------------
# "Detaylar" panelinin kaynağı. Yalnızca öneri listesindeki hatlar için —
# 676 hattın tamamı konsa dosya birkaç MB olurdu ve düğme zaten o panelde.
# ⚠️ Satırlar SÖZLÜK değil DİZİ olarak yazılıyor. Sözlük hâlinde her satır
# anahtar adlarını tekrarlıyordu ve bu blok tek başına 1,5 MB tutuyordu;
# diziye çevrilince ~3'te birine indi. Alan sırası `detay_alan`da yazılı,
# JS tarafı oradan okuyor.
GUN_KISA = {"WEEKDAYS": "I", "SATURDAY": "C", "SUNDAY": "P"}
cikti["detay_alan"] = ["s", "y", "sf", "e0", "eG", "eD", "bG", "bD", "sentetik"]
cikti["detay"] = {}


def _i(v):
    return None if pd.isna(v) else int(v)


for (h, g), grp in hi[hi["hat"].isin(ONERI_HAT)].groupby(["hat", "gun_tipi"]):
    cikti["detay"].setdefault(h, {})[GUN_KISA[g]] = [
        [int(r.saat), _i(round(r.yolcu_gunluk)), int(r.sefer_sayisi),
         _s(r.etkin_doluluk), _s(r.etkin_G), _s(r.etkin_D),
         _i(r.bacak_G), _i(r.bacak_D), 1 if r.kaynak == "sentetik" else 0]
        for r in grp.sort_values("saat").itertuples()]

with open("cikti/yon_veri.json", "w", encoding="utf-8") as f:
    json.dump(cikti, f, ensure_ascii=False, separators=(",", ":"))

import os
print(f"      yon_veri.json {os.path.getsize('cikti/yon_veri.json') / 1024:.0f} KB · "
      f"{len(cikti['hatlar'])} hat · {len(cikti['oneri'])} öneri")


# ---------------------------------------------------------------------------
# 7. KIYAS
# ---------------------------------------------------------------------------
print("[7/7] kıyas...")
eski = eski_ref
print()
print("=" * 64)
print(f"{'':24}{'ESKİ (yönsüz)':>19}{'YENİ (yönlü)':>19}")
print("-" * 64)
# ⚠️ Kıyas HAFTA İÇİ ile HAFTA İÇİ olmalı — `eski` zaten hafta içi süzüldü.
# `o` yerine `o_hi` kullanılmazsa hafta sonu önerileri kıyası şişirir.
print(f"{'öneri satırı':24}{len(eski):>19}{len(o_hi):>19}")
print(f"{'hat sayısı':24}{eski['hat'].nunique():>19}{o_hi['hat'].nunique():>19}")
print(f"{'toplam ek sefer':24}{int(eski['ek_sefer'].sum()):>19}{int(o_hi['ek_sefer'].sum()):>19}")
print(f"{'zirve ek araç':24}{eski.groupby('saat')['ek_arac'].sum().max():>19.0f}"
      f"{o_hi.groupby('saat')['ek_arac'].sum().max():>19.0f}")
print("=" * 64)
print(f"HAFTA SONU (SENTETİK talep — ayrı raporlanır): {len(o_hs)} öneri · "
      f"{o_hs['hat'].nunique()} hat · {int(o_hs['ek_sefer'].sum())} ek sefer")
print()
print("EN KRİTİK 15 SATIR (hafta içi):")
print(o_hi.head(15)[["hat", "saat", "kritik_yon", "yolcu_gunluk", "oran_G",
                     "yolcu_kritik", "bacak_kritik", "etkin_doluluk",
                     "etkin_kritik", "ek_sefer", "ek_arac", "oran_kaynak"]]
      .round(2).to_string(index=False))
if len(o_hs):
    print()
    print("EN KRİTİK 10 SATIR (hafta sonu — SENTETİK):")
    print(o_hs.head(10)[["hat", "gun_tipi", "saat", "kritik_yon", "yolcu_gunluk",
                         "sefer_sayisi", "etkin_kritik", "ek_sefer", "ek_arac"]]
          .round(2).to_string(index=False))
