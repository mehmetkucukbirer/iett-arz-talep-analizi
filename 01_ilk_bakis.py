import pandas as pd

pd.set_option("display.max_columns", None)
pd.set_option("display.width", 200)


routes= pd.read_csv("veri/gtfs/routes.csv",sep=";")

print(routes.shape)
print(routes.columns)
print(routes.head())
print(routes.dtypes)
print(routes.isna().sum())
print(routes["route_type"].value_counts(dropna=False))
routes_temiz = routes[routes["route_type"] == 3].copy()
print(routes_temiz.shape)
print(routes_temiz["route_short_name"].nunique())
print(routes_temiz["route_short_name"].value_counts().head(10))
print(routes_temiz["route_short_name"].str.len().value_counts().sort_index())
bozuklar = routes_temiz[routes_temiz["route_short_name"].str.contains("Ã|Ä|Å", na=False)]
print(bozuklar["route_short_name"].nunique())
print(len(bozuklar))
yolculuk = pd.read_csv("veri/yolculuk/hourly_transportation_202410.csv", nrows=100000)
print(yolculuk.shape)
print(yolculuk.columns)
print(yolculuk.head())
print(yolculuk["line_name"].nunique())
bozuk_talep = yolculuk[yolculuk["line_name"].str.contains("Ã|Ä|Å", na=False)]
print(len(bozuk_talep))
print(sorted(yolculuk["line_name"].dropna().unique())[:25])

def duzelt(metin):
    baytlar = bytearray()
    for k in metin:
        baytlar += k.encode("cp1252") if ord(k) >255 else bytes ([ord(k)])
    return baytlar.decode("utf-8")

routes_temiz["kod"] = routes_temiz["route_short_name"].dropna().apply(duzelt)
print(routes_temiz["kod"].nunique())
print(sorted(routes_temiz["kod"].dropna().unique())[:25])
gtfs_kodlari = set(routes_temiz["kod"].dropna())
talep_kodlari = set(yolculuk["line_name"].dropna())
print(len(gtfs_kodlari & talep_kodlari))
print(len(talep_kodlari - gtfs_kodlari))
print(sorted(talep_kodlari - gtfs_kodlari)[:20])
otobus = yolculuk[yolculuk["road_type"] == "OTOYOL"]
talep_otobus = set(otobus["line_name"].dropna())
print(len(talep_otobus))
print(len(talep_otobus & gtfs_kodlari))
print(sorted(talep_otobus - gtfs_kodlari))