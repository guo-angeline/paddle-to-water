# Pin + "Get directions" precision audit, 2026-07-22

**Asked by the owner:** audit every spot's map pin and "Get directions" target so each points exactly at the launch (a beach or a ramp), to the standard Go Paddle sets. No production change; report only. **Nothing in `data/spots.json` or any component was modified by this audit.**

**Bottom line: coordinates are the third of three problems, and the smallest one.** Even if all 143 coordinates were perfect to 8 decimals tomorrow, the app could not show that precision and the directions link would still not use it. Fix the surface first: it is a handful of lines, carries no data risk, and it is what actually makes Go Paddle *feel* precise.

---

## Finding 1: the map physically cannot render the precision you are asking for

Go Paddle's screen recording opens on **satellite imagery**, zoomed tight enough to see the dock at Mission Creek Park. Ours cannot do that at any zoom, on either platform.

| | Paddle to Water | Go Paddle (from the video) |
|---|---|---|
| Basemap | CartoDB `light_all`, an abstract vector style | Apple Maps **Satellite** (default), Standard toggle |
| Imagery | **none available** | yes |
| Coordinates shown to user | **never** | "GPS Coordinates" block + copy button |

- Web basemap: [MapView.tsx:136](web/components/MapView.tsx:136). Native basemap: [MapPane.tsx:133](native/src/components/MapPane.tsx:133). Both are the same abstract Carto style. There is no satellite or hybrid layer anywhere in the codebase.
- Initial zoom is **9**; selecting a spot flies to `Math.max(getZoom(), 11)` ([MapView.tsx:28](web/components/MapView.tsx:28)), so a user who has not manually zoomed sits at **zoom 11 or wider**.

Ground resolution at latitude 38:

| Zoom | Metres per pixel | Where it is used |
|---|---|---|
| 9 | 240.9 | initial map view |
| 11 | 60.2 | **zoom floor after selecting a spot** |
| 13 | 15.1 | `flyToBounds` cap |
| 19 | 0.24 | max available |

The spot marker is a `CircleMarker` of radius 10 px, 13 px when selected ([MapView.tsx:179](web/components/MapView.tsx:179)). At the selection zoom of 11, **that dot covers a radius of roughly 780 m on the ground**. At the initial zoom of 9 it covers about 3.1 km.

**So any coordinate error smaller than ~780 m is drawn entirely inside the dot at the app's own selection zoom.** Chasing 8-decimal coordinates while the pin renders as a 780 m blob on a map with no imagery buys nothing a user can see. This is the single biggest gap between us and the video, and it is a rendering change, not a data change.

## Finding 2: "Get directions" is a Google *search* link, not a directions link

Identical in both apps: [SpotDrawer.tsx:270](web/components/SpotDrawer.tsx:270) and [SpotSheet.tsx:60](native/src/components/SpotSheet.tsx:60).

```
https://www.google.com/maps/search/?api=1&query=<lat>,<lng>
```

`maps/search` is Google's documented **Search** action. The **Directions** action is `maps/dir/?api=1&destination=<lat>,<lng>`. Three consequences, the first two verified live in a browser during this audit using spot 15's real link:

1. **It does not start directions.** It opens a place card. The user must find and tap "Directions" again.
2. **The destination has no name.** Because we pass a bare coordinate, the card is titled `39°05'18.8"N 120°03'01.3"W` with the plus code `3WQX+CV6 Tahoma, California`. No launch name, no photo, no hours, and a "Add a missing place" prompt. Go Paddle's flow hands Apple Maps a named place ("Mission Creek Park"). Ours hands Google a number.
3. **Routing to a bare coordinate is undefined when the coordinate is not on a road.** Google routes to whatever road access it picks near the point. For the mid-water pins in Finding 3, that choice is arbitrary.

## Finding 3: the coordinates themselves

### Method, and what each screen is worth

Per `CLAUDE.md` and `reports/data-quality-sweep-2026-07-16.md`, no single screen condemns a record. I ran three and required two to agree:

- **Nominatim reverse geocode** on all 143 stored pins: what is the pin standing on? Known false-positive rate **at least 20%**, because it returns the *nearest mapped object*, not the containing one. A correct pin on an unmapped beach comes back as "the nearest bench".
- **`geocode_display` provenance**, offline: what did the original geocoder match at ingest? Frozen at ingest, so it does not reflect later manual fixes.
- **Targeted forward geocoding** of the spot's real name, to measure an actual offset in metres.
- An Overpass "distance to nearest OSM slipway" pass for all 143 was started and had not returned when this report was written; it is the natural next increment, not a blocker for anything below.

**False positives my own screens produced, disclosed:**
- **Spot 48 (Nagasawa Park)** looked like a city-centroid pin from `geocode_display` ("Santa Rosa, Sonoma County, California"). It is not. The pin lands **on a `leisure/slipway`** and is 116 m from the park. **Correct as stored.**
- **Spot 51 (Horseshoe Cove)** reverse-geocodes to a bar. The bar is the Presidio Yacht Club, which is at Horseshoe Cove. Not a defect.
- **Spot 137 (Petaluma Marina)** reverse-geocodes to a Sheraton. The hotel sits on the marina. Not a defect.

That is 3 false positives in the first handful I checked by hand, which is consistent with the ≥20% rate on record and is exactly why the list below is a **candidate list, not a verdict list**.

### What the 143 pins are standing on

**Only 8 of 143 pins (5.6%) land on an actual boat ramp** (`leisure/slipway`): spots **30, 48, 64, 83, 105, 110, 111, 115**. Adding piers and swimming areas brings it to about 13.

The rest, by nearest mapped object:

| What the pin lands on | Count |
|---|---|
| Roads, paths, cycleways, service roads (incl. **2 motorways**) | ~36 |
| Car parks (`amenity/parking`) | 16 |
| Houses and buildings | 17 |
| Park furniture (benches, toilets, bins, drinking fountains) | 16 |
| Marinas, camp sites, cafes, hotels | ~14 |
| **Nothing at all — only a county boundary returned** | 3 |

### Confirmed defects, measured

| Spot | Water | Stored pin lands on | Measured error | Confidence |
|---|---|---|---|---|
| **15** | Waterman's Landing, Tahoe | nothing; Nominatim falls back to "Placer County" | **~15.5 km**, in open lake water | **high** |
| **2** | Stevens Creek Reservoir | nothing but the reservoir | **0 m from the reservoir polygon centroid**, i.e. mid-water by construction | **high** |
| **33** | Russian River, Johnson's Beach | a house on River Road | **~2.6 km** from OSM's "Johnson's Beach" | **high** |
| **75** | Pacifica State Beach | **Taco Bell Cantina**, Cabrillo Highway | **423 m** from the beach | **high** |
| **37** | Lake Berryessa | nothing; "Napa County" only | mid-lake (same fingerprint as 15 and 2) | medium-high |
| **107** | Union Valley Reservoir | nothing; "El Dorado County" only | mid-lake (same fingerprint) | medium-high |
| **41** | Novato Creek | **CA-37, a motorway** | pin is on a freeway | medium-high |

**The mid-water fingerprint is systematic, not random.** Spots 2, 15, 37 and 107 all share it, and `geocode_display` explains why: those records matched a **whole water body** at ingest (`Lake Tahoe`, `Lake Berryessa`, `Stevens Creek Reservoir`, `Lake Clementine`). A lake polygon's centroid is the middle of the lake. `phase0_geocode.py` accepted it, and nothing downstream ever asked whether a human could stand there.

Nine more records carry that same whole-water-body or city-centroid `geocode_display` and warrant the same check: **2, 9, 15, 22, 33, 36, 37, 54, 65** (65 was already re-pinned by item 40; 54 is the known D26 defect).

### Roads and car parks

Pins whose nearest object is a road: **8, 10, 41, 66, 72, 77, 79, 80, 85, 91, 140, 145**. Pins on car parks: **11, 38, 45, 50, 63, 84, 92, 99, 101, 112, 114, 117, 130, 134, 146, 147**. Spot 11 (Sand Harbor) matches the OSM sweep's finding this morning of a named slipway **582 m north** of our pin.

Neither list is a defect list on its own. Some are correct (a road-end launch legitimately reverse-geocodes to the road), and the car-park cases are mostly *deliberate* under the current standard, which is the next finding.

## Finding 4: your own repo holds two contradictory standards, and this request settles it

- **Item 40 precedent (2026-07-17):** a disclosed SF Bay Water Trail **parking** coordinate is *"treated as correct as stored"*. This governs the 6-decimal block (62, 66, 67, 126, 127, 129-133, 136-138, 140, 141, 144-146). Item 40 explicitly declined to move spot 134 to the OSM dock node for this reason.
- **Item 45 acceptance (2026-07-22, today):** *"Coordinates are the put-in, never the published parking coordinate."*

Those cannot both hold. **Your ask resolves it in favour of the put-in.** The consequence is worth stating plainly: roughly **18 records in that block are not errors, they are policy**, and re-pinning them to the water's edge is a deliberate standard change, not a bug fix. Only 2 of them (130, 146) currently reverse-geocode to parking, so the block is in better shape than the label suggests, but the standard still needs to be chosen once and written down.

## Why this reaches further than the map

The stored coordinate is not only a pin. It is:

- published as schema.org `GeoCoordinates` on every spot page ([structured-data.ts:68](web/lib/structured-data.ts:68)), so a wrong pin is wrong in Google's index too;
- the destination of both alert crons. A "conditions are good" push for spot 15 currently sends someone toward a point 15.5 km out in Lake Tahoe.

## Recommendation, in the order I would do it

1. **Change the directions URL to `maps/dir/?api=1&destination=…`** in both apps. Two lines, no data risk, immediately better than today.
2. **Add a satellite/hybrid basemap** and raise the selection zoom from 11 to ~16. Without this, no coordinate work is visible to a user. This is the change that buys the Go Paddle feel.
3. **Show the coordinate as copyable text** in the spot sheet, as Go Paddle does. It is a trust signal, and it is the user's escape hatch when routing misbehaves.
4. **Fix the 7 confirmed defects** (15, 2, 33, 75, 37, 107, 41) as a first batch, each with two independent sources per the item-40 method. Note the **D19/D23 predeploy gate fires on any change to an existing coordinate**, so a re-pinning programme needs your review per batch by design.
5. **Then decide the standard** (put-in vs published parking) and re-pin the Water Trail block to match.

**Caveat on scope.** This audit measured all 143 records with automated screens and hand-verified about a dozen. It is a ranked candidate list plus 7 confirmed defects, not a certification of the other 136. Given three false positives in the first handful checked, assume the candidate lists above contain more.
