# %%
import json
import numpy as np
import pandas as pd

with open("cikti/dashboard_veri.json", encoding="utf-8") as f:
    d = json.load(f)
sure = {h: b["sefer_suresi"] for h, b in d["hatlar"].items()}

ham = pd.read_csv("cikti/sefer_ham_20260806.csv")
ham = ham[ham["SGUNTIPI"] == "I"].copy()
ham["hat"] = ham["SHATKODU"].astype(str)
ham["sefer_suresi"] = ham["hat"].map(sure)
ham = ham.dropna(subset=["sefer_suresi"])

ham["baslangic"] = (pd.to_numeric(ham["DT"].str[:2], errors="coerce") * 60
                    + pd.to_numeric(ham["DT"].str[3:5], errors="coerce"))
ham = ham.dropna(subset=["baslangic"]).copy()
ham["bitis"] = ham["baslangic"] + ham["sefer_suresi"]

print("değerlendirilen kalkış:", len(ham))
ham[["hat", "DT", "sefer_suresi", "baslangic", "bitis"]].head(10)

# %%
bas = ham["baslangic"].to_numpy()[:, None]
bit = ham["bitis"].to_numpy()[:, None]
saat_bas = np.arange(24)[None, :] * 60
saat_bit = saat_bas + 60

ortusme = np.clip(np.minimum(bit, saat_bit) - np.maximum(bas, saat_bas), 0, None)
yeni = ortusme.sum(axis=0) / 60

ham["saat"] = (ham["baslangic"] // 60).astype(int)
eski = (ham.groupby("saat")["sefer_suresi"].sum() / 60).reindex(range(24)).fillna(0)

kars = pd.DataFrame({"eski_yontem": eski.round(1), "yeni_yontem": np.round(yeni, 1)})
kars["fark"] = (kars["yeni_yontem"] - kars["eski_yontem"]).round(1)
kars["fark_yuzde"] = (kars["fark"] / kars["eski_yontem"] * 100).round(1)
kars.index.name = "saat"

kars
# %%
