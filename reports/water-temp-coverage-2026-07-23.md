# Water-temperature source hunt: NOAA CO-OPS coverage across the 177 spots

**Item 104. Date: 2026-07-23. Deliverable: measure real `water_temperature` coverage before any feature is scoped. No feature built; the finding is the value.**

## Verdict

**NOAA CO-OPS alone is NOT a viable statewide water-temperature source, and it is absent for exactly the spots where the safety case is strongest.** Do not scope a water-temp feature on CO-OPS. Only 8 California stations return live water temperature, all on the open coast or outer bay; every inland lake and the freshwater Delta have zero valid coverage.

## Method

1. Pulled every CO-OPS station with a water-temp sensor from the metadata API (`mdapi .../stations.json?type=watertemp`): 239 nationwide, **16 in CA**.
2. Computed the nearest such station (haversine) for all 177 records in `web/data/spots.json`.
3. **Confirmed each nearest station against the datagetter** (`product=water_temperature&date=latest`) rather than trusting the sensor listing, per the standing rule that a listed sensor is a claim, not data (the same trap that shipped `tide_sensitive` spots with no live tide station).

## The measurement, and why the first number was a lie

The metadata list said 46% of spots have a water-temp station within 10 mi. That number is false. **7 of the 15 nearest stations return no data** from the datagetter ("No data was found. This product may not be offered"), including the San Francisco, Alameda, Redwood City, Martinez-Amorco, Los Angeles, Port San Luis and North Spit stations. Only these **8 are datagetter-live** (2026-07-23): San Diego, La Jolla, Santa Monica, Monterey, Richmond, Point Reyes, Port Chicago, Arena Cove.

Recomputed against the 8 live stations:

| nearest LIVE station within | spots |
|---|---|
| 5 mi | 14 (8%) |
| 10 mi | 50 (28%) |
| 20 mi | 82 (46%) |
| 40 mi | 129 (73%) |
| 60 mi | 149 (84%) |

Median nearest-live-station distance: **23.9 mi**. The metadata-vs-live gap (46% -> 28% within 10 mi) is the false-positive rate of screening on the sensor listing instead of the datagetter.

## Even 28% overstates it: water temperature is water-body-specific

Distance is the wrong axis. An ocean station 5 mi from an inland reservoir reports the wrong water: the Pacific runs ~57-68F while a summer Central Valley reservoir runs 75F+ and a spring Sierra snowmelt lake runs dangerously cold. All 8 live stations are open-coast or bay/estuary; **there is not one inland-lake or freshwater-Delta water-temp sensor in CO-OPS.** So the only *valid* coverage is a coastal/bay spot matched to a same-water-body station.

Per region (nearest LIVE station):

| region | n | <=10mi | <=20mi | median mi | valid? |
|---|---|---|---|---|---|
| San Diego | 16 | 14 | 15 | 5.4 | yes (coastal) |
| San Francisco | 8 | 3 | 8 | 11.5 | yes (bay) |
| East Bay | 29 | 11 | 24 | 12.1 | partial (bay estuary) |
| North Bay | 49 | 20 | 29 | 14.3 | partial (bay/estuary; upper sloughs no) |
| Central Coast | 7 | 1 | 2 | 25.6 | thin (Monterey only) |
| Los Angeles | 6 | 1 | 2 | 27.5 | thin (LA station DEAD; Santa Monica far) |
| Peninsula | 10 | 0 | 1 | 26.4 | no (Redwood City DEAD) |
| Orange County | 7 | 0 | 0 | 44.1 | no |
| South Bay | 11 | 0 | 0 | 40.4 | no (Alameda/Redwood City DEAD) |
| Ventura | 1 | 0 | 0 | 47.1 | no |
| North Coast | 2 | 0 | 0 | 161.4 | no |
| Sacramento | 11 | 0 | 1 | 59.8 | **no (freshwater Delta)** |
| Central Valley | 6 | 0 | 0 | 68.1 | **no (freshwater reservoirs)** |
| Sierra Nevada | 14 | 0 | 0 | 121.0 | **no (snowmelt lakes)** |

## The part that matters for the product

The item's own motive is cold-shock safety, not air comfort. The spots where that bites hardest are the **Sierra Nevada snowmelt lakes** (Tahoe, Donner, Fallen Leaf, Echo, Huntington, Shaver) and cold reservoirs. Those are the 14 records with the *worst* coverage: nearest live station 120-161 mi away, in the ocean or the bay. CO-OPS cannot serve the one use case that would justify the dependency.

Coastal ocean and outer-bay spots (San Diego, SF, parts of East/North Bay) could get a genuine same-water-body reading. That is a coastal feature, not a statewide one.

## Recommendation

1. **Close the CO-OPS hunt: not viable statewide.** Do not build a water-temp feature on CO-OPS. If a coastal-only pilot is ever wanted, it must gate per spot on a same-water-body live station within ~10 mi (roughly the SF Bay + SoCal coast subset) and never render a number for inland lakes.
2. **The inland gap needs a different source, and it is unmeasured, so do not assume it.** The candidate for freshwater lakes/reservoirs/rivers is **USGS NWIS** (parameter 00010, water temperature) and for the coast **NDBC** buoys; whether either actually covers the Sierra and Delta spots is a separate source hunt, its own item, held to the same datagetter-confirmation bar this one used. Naming them is not measuring them.
3. Keep water temperature out of the conditions engine until a source is confirmed for the cold-shock spots, because a wrong or absent water temp on a snowmelt lake is worse than none.

## Live station reference (datagetter-confirmed 2026-07-23, product=water_temperature)

`9410170` San Diego 75.9F · `9410230` La Jolla 67.3F · `9410840` Santa Monica 73.0F · `9413450` Monterey 57.9F · `9414863` Richmond 64.8F · `9415020` Point Reyes 61.7F · `9415144` Port Chicago 70.9F · `9416841` Arena Cove 56.3F. Dead (listed, no data): `9410660` Los Angeles, `9412110` Port San Luis, `9414290` San Francisco, `9414523` Redwood City, `9414750` Alameda, `9415102` Martinez-Amorco, `9418767` North Spit.
