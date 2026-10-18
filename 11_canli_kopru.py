"""
CANLI KÖPRÜ — dashboard ile İETT API'si arasında yerel aracı.

NEDEN GEREKLİ:
  Tarayıcı, İETT SOAP servisine doğrudan bağlanamıyor. Ölçüldü (5. seans):
    POST                → 200 OK ama Access-Control-Allow-Origin başlığı yok
    OPTIONS (ön kontrol) → 500 hata
    tarayıcıdan fetch    → "Failed to fetch"
  Python'dan çalışıyor çünkü bu kısıt yalnızca tarayıcıda var. Bu köprü araya
  girip cevabı tarayıcının kabul edeceği başlıklarla iletiyor.

NE YAPAR:
  1) cikti/ klasörünü sunar (dashboard buradan açılır)
  2) /canli?hat=500T  →  o hattaki araçların ANLIK konumu (JSON)

ÇALIŞTIRMA:
    source venv/bin/activate
    python3 11_canli_kopru.py
  Sonra tarayıcıda:  http://localhost:8770

⚠️ Konumlar ŞU ANA aittir — dashboard'da seçili saate değil. Geçmiş GPS izi yok.
⚠️ GitHub Pages'te çalışmaz (orada sunucu yoktur). Canlı katman orada kendini kapatır.
"""

import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

import requests

PORT = 8770
KLASOR = "cikti"
BASE, NS = "https://api.ibb.gov.tr/iett", "http://tempuri.org/"

_onbellek = {}          # hat -> (zaman, veri) · aynı hatta üst üste istek gelirse API yorulmasın
ONBELLEK_SN = 12


def _soap(path, method, params):
    body = "".join(f"<{k}>{v}</{k}>" for k, v in params.items())
    env = ('<?xml version="1.0" encoding="utf-8"?>'
           '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
           f'<soap:Body><{method} xmlns="{NS}">{body}</{method}></soap:Body></soap:Envelope>')
    r = requests.post(f"{BASE}/{path}", data=env.encode("utf-8"),
                      headers={"Content-Type": "text/xml; charset=utf-8",
                               "SOAPAction": f"{NS}{method}"}, timeout=25)
    r.raise_for_status()
    return ET.fromstring(r.content)


def canli_konum(hat):
    """O hattaki araçların anlık konumu → [{plaka, enlem, boylam, yon, yonkod, saat}]

    `yonkod`: G/D harfi. Servisin `guzergahkodu` alanı "98_G_D7742" biçiminde —
    hat _ YÖN _ güzergâh varyantı. Ortadaki harf, `guzergahlar.json`'daki YON
    alanıyla aynı harf, yani haritadaki rota çizgisiyle birebir tutuyor.
    Dashboard aracın rengini buradan seçiyor; `yon` alanı (son durak adı)
    sadece ekrandaki yazı için kullanılıyor.
    """
    simdi = datetime.now().timestamp()
    if hat in _onbellek and simdi - _onbellek[hat][0] < ONBELLEK_SN:
        return _onbellek[hat][1]

    root = _soap("FiloDurum/SeferGerceklesme.asmx", "GetHatOtoKonum_json", {"HatKodu": hat})
    res = next((el for el in root.iter() if el.tag.endswith("Result")), None)
    ham = json.loads(res.text) if (res is not None and res.text) else []

    def sayi(v):
        try:
            return float(str(v).replace(",", "."))
        except (TypeError, ValueError):
            return None

    araclar = []
    for a in ham:
        # alan adları serviste değişkenlik gösteriyor; olası adları tarıyoruz
        enlem = boylam = None
        for k, v in a.items():
            ku = k.upper()
            if enlem is None and ("ENLEM" in ku or ku in ("LAT", "YKOORDINATI")):
                enlem = sayi(v)
            if boylam is None and ("BOYLAM" in ku or ku in ("LNG", "LON", "XKOORDINATI")):
                boylam = sayi(v)
        if enlem is None or boylam is None:
            continue
        # İstanbul sınırları dışındaki bozuk kayıtları ele
        if not (40.7 < enlem < 41.7 and 27.9 < boylam < 29.9):
            continue
        # "98_G_D7742" → ["98", "G", "D7742"]; ortadaki parça yön harfi
        parca = str(a.get("guzergahkodu") or a.get("SGUZERGAHKODU") or "").split("_")
        araclar.append({
            "plaka": a.get("kapino") or a.get("KAPINO") or a.get("SKAPINUMARA") or "",
            "enlem": round(enlem, 5),
            "boylam": round(boylam, 5),
            "yon": a.get("yon") or a.get("YON") or "",
            "yonkod": parca[1].upper() if len(parca) > 2 else "",
            "saat": a.get("son_konum_zamani") or a.get("SAAT") or "",
        })

    veri = {"hat": hat, "adet": len(araclar), "araclar": araclar,
            "olcum": datetime.now().strftime("%H:%M:%S")}
    _onbellek[hat] = (simdi, veri)
    return veri


class Kopru(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=KLASOR, **kw)

    def _json(self, kod, govde):
        ham = json.dumps(govde, ensure_ascii=False).encode("utf-8")
        self.send_response(kod)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")   # tarayıcının istediği izin
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(ham)))
        self.end_headers()
        self.wfile.write(ham)

    def do_GET(self):
        yol = urlparse(self.path)
        if yol.path == "/canli":
            hat = (parse_qs(yol.query).get("hat") or [""])[0]
            if not re.fullmatch(r"[0-9A-Za-zÇĞİÖŞÜçğıöşü\-]{1,10}", hat or ""):
                return self._json(400, {"hata": "geçersiz hat kodu"})
            try:
                return self._json(200, canli_konum(hat))
            except Exception as e:
                return self._json(502, {"hata": str(e)[:120]})
        return super().do_GET()

    def log_message(self, *a):
        pass          # sunucu günlüğünü sustur


if __name__ == "__main__":
    print(f"Canlı köprü çalışıyor →  http://localhost:{PORT}")
    print(f"  dashboard : http://localhost:{PORT}/index.html")
    print(f"  canlı uç  : http://localhost:{PORT}/canli?hat=500T")
    print("  durdurmak için Ctrl+C\n")
    # "0.0.0.0" = aynı Wi-Fi ağındaki diğer cihazlar da bağlanabilsin (telefon).
    # "127.0.0.1" olsaydı yalnızca bu bilgisayar erişebilirdi.
    ThreadingHTTPServer(("0.0.0.0", PORT), Kopru).serve_forever()
