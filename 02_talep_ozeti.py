import pandas as pd

gun_map = {0: "WEEKDAYS", 1: "WEEKDAYS", 2: "WEEKDAYS", 3: "WEEKDAYS",
           4: "WEEKDAYS", 5: "SATURDAY", 6: "SUNDAY"}

parcalar = []

for parca in pd.read_csv("veri/yolculuk/hourly_transportation_202410.csv", chunksize=500000):
    otobus = parca[parca["road_type"] == "OTOYOL"].copy()
    otobus["gun_tipi"] = pd.to_datetime(otobus["transition_date"]).dt.dayofweek.map(gun_map)
    ozet = otobus.groupby(["line_name", "gun_tipi", "transition_hour"])["number_of_passenger"].sum().reset_index()
    parcalar.append(ozet)

talep = pd.concat(parcalar)
print("birleşmiş ham:", talep.shape)

talep = talep.groupby(["line_name", "gun_tipi", "transition_hour"])["number_of_passenger"].sum().reset_index()
print("son özet:", talep.shape)
print(talep.head(10))
print(talep["gun_tipi"].value_counts())

print(talep)
talep.to_csv("cikti/talep_ozeti.csv", index=False)