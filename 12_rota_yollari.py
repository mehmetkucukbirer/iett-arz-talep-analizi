"""
ROTA YOLLARI — durak koordinatlarını gerçek yola oturtur.

SORUN:
  Haritada rota duraktan durağa DÜZ ÇİZGİ çiziliyor. Duraklar sıksa yola benziyor
  ama otoyolda araları 5-10 km açılınca çizgi havada gidiyor. Elimizde sadece durak
  koordinatları var (guzergahlar.json), yolun kendisi yok.

ÇÖZÜM:
  Durak koordinatlarını bir rota motoruna (OSRM) gönderiyoruz; motor bu noktalardan
  geçen gerçek araç yolunu döndürüyor. Sonuç cikti/rota_yollari.json'a yazılıyor.
  Dashboard bu dosya varsa onu kullanır, yoksa eski davranışına döner — yani betik
  hiç çalışmasa da harita çalışmaya devam eder.

ÇALIŞTIRMA:
    cd /Users/mehmetkucukbirer/Desktop/iett-projesi
    source venv/bin/activate
    python3 12_rota_yollari.py

  ~1.350 istek atar, istekler arası 1,1 saniye bekler → yaklaşık 25-30 dakika.
  Yarıda kesersen (Ctrl+C) sorun olmaz: her 20 hatta bir dosyaya yazıyor ve
  tekrar çalıştırdığında kaldığı yerden devam ediyor.

NOT: OSRM'in halka açık sunucusu ücretsiz ama garanti vermiyor. Yoğunsa bazı
     hatlar atlanabilir; o hatlar eski düz çizgiyle çizilmeye devam eder.
"""

import json
import os
import subprocess
import time

GIRDI = "cikti/guzergahlar.json"
CIKTI = "cikti/rota_yollari.json"

# Sırayla denenir; biri çalışmazsa diğerine geçilir.
SUNUCULAR = [
    "https://routing.openstreetmap.de/routed-car/route/v1/driving/",
    "https://router.project-osrm.org/route/v1/driving/",
]

PARCA = 90          # OSRM tek istekte ~100 noktayı kabul ediyor, pay bıraktık
BEKLE = 1.1         # istekler arası saniye — sunucuyu yormamak için
KAYIT_ARALIK = 20   # kaç hatta bir diske yazılsın


def osrm(noktalar, sunucu):
    """Nokta listesini yola oturtur → [[boylam, enlem], ...] ya da None."""
    kord = ";".join(f"{b:.5f},{e:.5f}" for b, e in noktalar)
    # overview=simplified: yol şeklini korur ama nokta sayısını ~10 katı azaltır.
    # "full" ile dosya 40-50 MB olurdu; haritada gözle görülür fark yok.
    url = f"{sunucu}{kord}?overview=simplified&geometries=geojson"

    # ⚠️ requests DEĞİL, curl kullanılıyor. Sebebi ölçüldü: macOS'un Python 3.9'u
    # LibreSSL 2.8.3 ile derlenmiş, OSRM sunucularının istediği modern TLS'i
    # veremiyor ve "sslv3 alert handshake failure" alıyor. curl sistemin kendi
    # TLS kütüphanesini kullandığı için sorunsuz bağlanıyor.
    p = subprocess.run(["curl", "-s", "-m", "60", url],
                       capture_output=True, text=True)
    if p.returncode != 0 or not p.stdout:
        return None
    try:
        j = json.loads(p.stdout)
    except ValueError:
        return None
    if j.get("code") != "Ok" or not j.get("routes"):
        return None
    return j["routes"][0]["geometry"]["coordinates"]


def yola_otur(duraklar, sunucu):
    """Uzun hatları parçalara bölüp birleştirir (OSRM'in nokta sınırı için)."""
    nk = [(d[0], d[1]) for d in duraklar if d and d[0] and d[1]]
    if len(nk) < 2:
        return None

    tum = []
    i = 0
    while i < len(nk) - 1:
        dilim = nk[i:i + PARCA]
        if len(dilim) < 2:
            break
        g = osrm(dilim, sunucu)
        if g is None:
            return None
        # parçalar örtüşüyor; ilk nokta zaten öncekinin sonu
        tum.extend(g if not tum else g[1:])
        i += PARCA - 1
        if i < len(nk) - 1:
            time.sleep(BEKLE)
    return tum


def main():
    guz = json.load(open(GIRDI, encoding="utf-8"))
    sonuc = {}
    if os.path.exists(CIKTI):
        sonuc = json.load(open(CIKTI, encoding="utf-8"))
        print(f"Önceki çalışmadan {len(sonuc)} hat bulundu, üstüne devam ediliyor.\n")

    sunucu = None
    for s in SUNUCULAR:
        try:
            if osrm([(29.0, 41.0), (29.05, 41.02)], s):
                sunucu = s
                print(f"Rota motoru: {s}\n")
                break
        except Exception:
            continue
    if not sunucu:
        print("HATA: Hiçbir rota motoruna erişilemedi. İnternet bağlantını kontrol et.")
        return

    kalan = [h for h in guz if h not in sonuc]
    print(f"{len(kalan)} hat işlenecek (toplam {len(guz)}).\n")

    basarili = atlanan = 0
    for i, hat in enumerate(kalan, 1):
        kayit = {}
        for yon in ("G", "D"):
            duraklar = guz[hat].get(yon)
            if not duraklar:
                continue
            try:
                yol = yola_otur(duraklar, sunucu)
            except Exception:
                yol = None
            if yol:
                # 5 ondalık ≈ 1 metre hassasiyet; dosya boyutunu yarıya indiriyor
                kayit[yon] = [[round(b, 5), round(e, 5)] for b, e in yol]
            time.sleep(BEKLE)

        if kayit:
            sonuc[hat] = kayit
            basarili += 1
        else:
            atlanan += 1

        if i % KAYIT_ARALIK == 0 or i == len(kalan):
            json.dump(sonuc, open(CIKTI, "w", encoding="utf-8"), ensure_ascii=False)
            mb = os.path.getsize(CIKTI) / 1e6
            print(f"  [{i:>3}/{len(kalan)}] {hat:8s} · kaydedildi "
                  f"({len(sonuc)} hat, {mb:.1f} MB)")

    json.dump(sonuc, open(CIKTI, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"\nBİTTİ. {basarili} hat yola oturtuldu, {atlanan} hat atlandı.")
    print(f"{CIKTI} → {os.path.getsize(CIKTI)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
