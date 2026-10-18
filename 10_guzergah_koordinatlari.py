"""
GÜZERGÂH KOORDİNATLARI — her hattın sıralı durakları.

`DurakDetay_GYY` her hat için durakları YON + SIRANO sırasıyla, enlem/boylamıyla
veriyor. Harita görselleştirmesinin (dashboard'daki hat detayı) kaynağı bu.

Çalıştırma:  python3 10_guzergah_koordinatlari.py
Üretir:      cikti/guzergahlar.json
             { "11ÜS": {"G": [[boylam, enlem, "DURAK ADI"], ...], "D": [...]}, ... }

Not: ~10-15 dakika sürer (analizdeki her hat için bir API isteği, aralarda 0,12 sn
bekleme). Sonuç dosyaya yazıldığı için bir kez çalıştırmak yeterli.
"""

import json
import time
import xml.etree.ElementTree as ET

import pandas as pd
import requests

BASE, NS = "https://api.ibb.gov.tr/iett", "http://tempuri.org/"
BEKLE = 0.12          # saniye — API'yi yormamak için
ONDALIK = 5           # koordinat basamağı (~1 metre); dosya boyutunu küçültür


def _soap(path, method, params):
    body = "".join(f"<{k}>{v}</{k}>" for k, v in params.items())
    env = ('<?xml version="1.0" encoding="utf-8"?>'
           '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
           f'<soap:Body><{method} xmlns="{NS}">{body}</{method}></soap:Body></soap:Envelope>')
    r = requests.post(f"{BASE}/{path}", data=env.encode("utf-8"),
                      headers={"Content-Type": "text/xml; charset=utf-8",
                               "SOAPAction": f"{NS}{method}"}, timeout=40)
    r.raise_for_status()
    return ET.fromstring(r.content)


def duraklar(hat):
    root = _soap("ibb/ibb.asmx", "DurakDetay_GYY", {"hat_kodu": hat})
    nds = next((el for el in root.iter() if el.tag.endswith("NewDataSet")), None)
    if nds is None:
        return None
    rows = [{c.tag.split("}")[-1]: c.text for c in row} for row in nds]
    if not rows:
        return None

    df = pd.DataFrame(rows)
    for c in ("SIRANO", "XKOORDINATI", "YKOORDINATI"):
        if c not in df:
            return None
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna(subset=["XKOORDINATI", "YKOORDINATI", "SIRANO"])
    if df.empty:
        return None

    cikti = {}
    for yon, g in df.sort_values("SIRANO").groupby("YON"):
        cikti[str(yon)] = [[round(float(r.XKOORDINATI), ONDALIK),
                            round(float(r.YKOORDINATI), ONDALIK),
                            (r.DURAKADI or "").strip()]
                           for r in g.itertuples()]
    return cikti or None


# analizde yer alan hatlar — doluluk tablosundan
dol = pd.read_csv("cikti/doluluk.csv")
hatlar = sorted(dol["hat"].astype(str).unique())
print(f"{len(hatlar)} hat için durak koordinatları çekilecek "
      f"(~{len(hatlar) * (BEKLE + 0.8) / 60:.0f} dakika)\n")

sonuc, bos, hata = {}, [], []
for i, h in enumerate(hatlar, 1):
    try:
        d = duraklar(h)
        if d:
            sonuc[h] = d
        else:
            bos.append(h)
    except Exception as e:
        hata.append((h, str(e)[:60]))
    time.sleep(BEKLE)
    if i % 50 == 0 or i == len(hatlar):
        print(f"  {i}/{len(hatlar)} · alınan {len(sonuc)} · boş {len(bos)} · hata {len(hata)}")

with open("cikti/guzergahlar.json", "w", encoding="utf-8") as f:
    json.dump(sonuc, f, ensure_ascii=False, separators=(",", ":"))

import os
mb = os.path.getsize("cikti/guzergahlar.json") / 1e6
toplam = sum(len(v) for d in sonuc.values() for v in d.values())
print(f"\nguzergahlar.json yazıldı · {len(sonuc)} hat · {toplam:,} durak · {mb:.1f} MB")
if bos:
    print(f"durak dönmeyen {len(bos)} hat: {', '.join(bos[:15])}{' …' if len(bos) > 15 else ''}")
if hata:
    print(f"hata alan {len(hata)} hat: {', '.join(h for h, _ in hata[:10])}")
