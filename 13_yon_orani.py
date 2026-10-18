

# %%
import pandas as pd

d = pd.read_csv("veri/yolculuk/yon_verisi_2026.csv")
d["tarih"] = pd.to_datetime(d["Tarih"]).dt.date
d["saat"] = d["Saat Tekil"]
d["yolcu"] = d["Sefer Bazlı Yolculuk Sayısı"]

hafta_ici = d[d["tarih"].astype(str) < "2026-08-15"]

print("satır:", len(hafta_ici), "| gün:", hafta_ici["tarih"].nunique())
hafta_ici[["tarih", "saat", "Güzergah Hat Kodu", "Güzergah Yön", "yolcu"]].head()

# %%
p = hafta_ici.pivot_table(index="saat", columns=["tarih", "Güzergah Yön"],
                          values="yolcu", aggfunc="sum").fillna(0)

sonuc = pd.DataFrame(index=p.index)
for t in sorted(hafta_ici["tarih"].unique()):
    g, dn = p[(t, "GİDİŞ")], p[(t, "DÖNÜŞ")]
    sonuc[str(t)[5:]] = (100 * g / (g + dn)).round(1)
    sonuc[str(t)[5:] + " n"] = (g + dn).astype(int)

gun = [c for c in sonuc.columns if not c.endswith(" n")]
sonuc["ORTALAMA"] = sonuc[gun].mean(axis=1).round(1)
sonuc["YAYILIM"] = (sonuc[gun].max(axis=1) - sonuc[gun].min(axis=1)).round(1)

sonuc.loc[5:23]
# %%
