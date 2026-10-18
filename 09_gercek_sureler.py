"""
GERÇEK SEFER SÜRELERİ — İETT arşivinden ölçüm.

`GetIettArsivGorev_json` metodu gerçekleşen seferlerin başlangıç/bitiş saatlerini
veriyor. Buradan her hattın her saatteki GERÇEK sefer süresini ölçüyoruz.

Neden gerekli:
  Hat listesindeki `SEFER_SURESI` bir ÖLÇÜM DEĞİL, PLANLAMA değeri — hat uzunluğu
  sabit ~25 km/sa hıza bölünerek üretilmiş (uzunluk-süre korelasyonu 0,984).
  Gerçek süre trafiğe göre değişiyor: Ekim 2024'te 17:00'de 81 dk, 23:00'te 49 dk.
  Sabit değer kullanmak araç ihtiyacını zirvede eksik, gece fazla gösteriyor.

Neden Ekim 2024:
  Talep verimiz o 5 güne ait. Aynı günleri kullanınca arz süreleri ile talep
  aynı trafik koşullarından geliyor. (Ağustos 2026 medyanı 59,8 dk, Ekim 2024
  medyanı 66,3 dk — yaz tatili seferleri %11 kısaltıyor.)

Çalıştırma:  python3 09_gercek_sureler.py
Üretir:      cikti/gercek_sure_hat_saat.csv   (hat + saat → medyan dk)
             cikti/gercek_sure_hat.csv        (hat → medyan dk, yedek)
             cikti/gercek_sure_sistem_saat.csv (saat → medyan dk, son çare)
"""

import json
import re
import xml.etree.ElementTree as ET

import numpy as np
import pandas as pd
import requests

BASE, NS = "https://api.ibb.gov.tr/iett", "http://tempuri.org/"

# Talep verisiyle aynı 5 gün (Bölüm 5 — Ekim 2024'ün geçerli günleri)
GUNLER = ["20241002", "20241004", "20241016", "20241017", "20241018"]

MIN_SEFER = 3        # bu sayının altında kayıt varsa medyan güvenilmez
SURE_ALT, SURE_UST = 5, 400   # dakika; dışı bozuk kayıt (negatif / milyonlarca dk var)

# Kaba aralık filtresi yarım kalmış görevleri yakalamıyor: 11ÜS (medyan ~90 dk)
# saat 3'te "7 dakikalık sefer" gösteriyordu, sistem medyanı da o saatte 63,6 → 32,6'ya
# düşüyordu. Sabit dakika eşiği işe yaramaz (hatlar 10-270 dk arası). Onun yerine her
# seferi KENDİ HATTININ medyanıyla kıyaslıyoruz.
ORAN_ALT = 0.40      # hattın kendi medyanının %40'ından kısa sefer = yarım kalmış


def _soap(path, method, params):
    body = "".join(f"<{k}>{v}</{k}>" for k, v in params.items())
    env = ('<?xml version="1.0" encoding="utf-8"?>'
           '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
           f'<soap:Body><{method} xmlns="{NS}">{body}</{method}></soap:Body></soap:Envelope>')
    r = requests.post(f"{BASE}/{path}", data=env.encode("utf-8"),
                      headers={"Content-Type": "text/xml; charset=utf-8",
                               "SOAPAction": f"{NS}{method}"}, timeout=120)
    r.raise_for_status()
    return ET.fromstring(r.content)


def _ms(s):
    """/Date(1786096228000)/ → 1786096228000"""
    m = re.search(r"(-?\d+)", str(s))
    return int(m.group(1)) if m else np.nan


parcalar = []
for gun in GUNLER:
    root = _soap("ibb/ibb360.asmx", "GetIettArsivGorev_json", {"Tarih": gun})
    res = next(el for el in root.iter() if el.tag.endswith("Result"))
    df = pd.DataFrame(json.loads(res.text))

    df["bas"] = df["DTBASLAMAZAMANI"].map(_ms)
    df["bit"] = df["DTBITISZAMANI"].map(_ms)
    df["sure"] = (df["bit"] - df["bas"]) / 60000

    # SGOREVDURUM: T = tamamlandı. I/YK/A/B iptal veya yarım kalmış görevler.
    t = df[(df["SGOREVDURUM"] == "T") & df["sure"].between(SURE_ALT, SURE_UST)].copy()
    t["saat"] = (pd.to_datetime(t["bas"], unit="ms").dt.tz_localize("UTC")
                 .dt.tz_convert("Europe/Istanbul").dt.hour)
    parcalar.append(t[["SHATKODU", "saat", "sure"]])
    print(f"  {gun}: {len(df):>6} kayıt → {len(t):>6} geçerli sefer, "
          f"medyan {t['sure'].median():.1f} dk")

hepsi = pd.concat(parcalar, ignore_index=True)
hepsi["SHATKODU"] = hepsi["SHATKODU"].astype(str)
print(f"\nham toplam {len(hepsi):,} sefer · {hepsi['SHATKODU'].nunique()} hat · "
      f"medyan {hepsi['sure'].median():.1f} dk")

# --- yarım kalmış görevleri ele: hattın kendi medyanının ORAN_ALT katından kısa ---
hat_medyan = hepsi.groupby("SHATKODU")["sure"].transform("median")
yarim = hepsi["sure"] < hat_medyan * ORAN_ALT
print(f"yarım kalmış sayılıp elenen: {yarim.sum():,} sefer (%{100 * yarim.mean():.1f})")
hepsi = hepsi[~yarim].copy()
print(f"temiz toplam {len(hepsi):,} sefer · {hepsi['SHATKODU'].nunique()} hat · "
      f"medyan {hepsi['sure'].median():.1f} dk")

# --- üç kademeli tablo: hat+saat → hat → sistem ---------------------------
hs = (hepsi.groupby(["SHATKODU", "saat"])["sure"].agg(["median", "size"]).reset_index()
      .rename(columns={"SHATKODU": "hat", "median": "sure_dk", "size": "n"}))
hg = (hepsi.groupby("SHATKODU")["sure"].agg(["median", "size"]).reset_index()
      .rename(columns={"SHATKODU": "hat", "median": "sure_dk", "size": "n"}))
sis = hepsi.groupby("saat")["sure"].median().round(1)

hs[hs["n"] >= MIN_SEFER].to_csv("cikti/gercek_sure_hat_saat.csv", index=False)
hg[hg["n"] >= MIN_SEFER].to_csv("cikti/gercek_sure_hat.csv", index=False)
sis.to_csv("cikti/gercek_sure_sistem_saat.csv")

print(f"\nyazıldı:")
print(f"  gercek_sure_hat_saat.csv    {(hs['n'] >= MIN_SEFER).sum():>6} satır")
print(f"  gercek_sure_hat.csv         {(hg['n'] >= MIN_SEFER).sum():>6} satır")
print(f"  gercek_sure_sistem_saat.csv {len(sis):>6} satır")
print("\nsaatlik medyan süre (dk):")
print(sis.to_string())
