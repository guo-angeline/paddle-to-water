# California launch-site source inventory, 2026-07-22

**Question:** which authoritative sources publish paddle launch sites across California, with SoCal first? This is item 45's step 1, run statewide after the owner expanded scope from NorCal on 2026-07-22.

**Method:** sources were measured, not taken at their word. Full pulls: CCC access corpus (1,575 records), CA DBW registry (1,499 facilities across 56 counties), federal RIDB export (15,315 facilities), statewide Overpass sweep (1,326 features). The coordinate test below is an actual reverse-geocode run.

---

## Headline: one source clears the field bar, and its coordinates are not launches

**CCC YourCoast is the only statewide source publishing the per-site fields this app needs.** 1,575 records, **713 in the five SoCal coastal counties, 127 paddle-plausible candidates not covered by an existing spot** (LA 37, San Diego 40, Orange 23, Santa Barbara 17, Ventura 10). It publishes FEE, PARKING, RESTROOMS, DSABLDACSS, DOG_FRIENDLY, a boat-facility type, phone, description and photos.

**But 20 of 20 SoCal records typed as `Hand Launch` / `Kayak Launch` / `Small-Craft Boat Launch` / `Beach Launch` reverse-geocode to something that is not a put-in:** parking lots (3), roads and paths (3), private houses and buildings (6), plus a playground, a cafe, a sports pitch, a lifeguard station, a bike path, a beach shelter and a marina polygon.

**That is the 127/130/132 defect pre-loaded at 127x scale.** `LATITUDE`/`LONGITUDE` is a site locator, not a put-in. Any ingest that stores it as `lat`/`lng` reproduces the exact failure the 2026-07-16 sweep documented, on every record.

**Second structural finding: there is no SoCal water trail.** SF Bay, Lake Tahoe and Humboldt Bay have designated trails; nothing south of Santa Barbara does. SoCal cannot reach Bay Area evidence quality from one source. It needs a **pairing**: field source + geometry source + operator confirm.

---

## Inventory

| Source | Coverage | Per-site fields | Sites | Coordinates | Verdict |
|---|---|---|---|---|---|
| **CCC YourCoast** (`api.coastal.ca.gov/access/v1/locations`) | 15 coastal counties | FEE, PARKING, RESTROOMS, ADA, DOG_FRIENDLY, launch type, photos | 1,575 (713 SoCal; 29 explicit hand/kayak launches) | Yes, but **parking/site locator, 50-300 m off. 20/20 failed** | **REGISTRY (fields only).** Coordinates always re-derived |
| **CA DBW** | Statewide, coastal + **inland** | Address, phone, facility type, **Open To (public/private/club)**, trailer parking, services | 1,499 (SoCal 468; 145 launch-typed, 119 public) | **NONE AT ALL** | **CANDIDATE GENERATOR**, promoted (see below) |
| **OSM / Overpass** | Statewide | Almost none (1,058 CA slipways: 136 named, 49 with fee) | 1,326 CA features; **235 SoCal slipways** | Yes, and **it is the actual ramp geometry** | **CANDIDATE GENERATOR + the coordinate-correction layer.** ODbL |
| **Federal RIDB** | All federal land managers | Name, description, fees, activities, lat/lng | 1,957 CA; **only 12 SoCal paddle-tagged** | Reservation record, often kiosk not ramp | **CANDIDATE GENERATOR, thin for SoCal.** Useful Sierra/Shasta |
| **CA State Parks GIS** | State parks | Boundaries, day-use, parking. **No boat-launch layer** | 8 layers, none launch-typed | Entry gates, not put-ins | **NOT USABLE, and the licence is a blocker.** See legal below |
| **CNRA / gis.data.ca.gov** | Aggregator | n/a | "kayak" returns exactly one dataset: the CCC layer | n/a | **NOT USABLE alone**; it is YourCoast's publication channel |
| **LA County Beaches & Harbors** | LA beaches, Marina del Rey | Address, hours, amenity list. No coords, no API | ~25 | No | **Operator page.** Authority for Mother's Beach / Fiji Way |
| **OC Parks / Newport / Dana Point** | Orange County | Nothing structured | n/a | No | **NOT USABLE.** YourCoast already carries 7 official OC hand launches |
| **San Diego city / SanGIS / Port** | San Diego | No launch dataset; 197 city services, none relevant | n/a | No | **NOT USABLE.** Mission Bay's authoritative coverage is YourCoast |
| **Big Bear MWD** | Big Bear Lake | Ramps, **mandatory Lake Use Permit for SUP**, quagga inspection | 2 | No | **Operator page, use as verification tier** |
| **Lake Arrowhead** | Lake Arrowhead | n/a | **0 public launches, private lake** | n/a | **NOT USABLE, and that is the finding** |
| **Salton Sea SRA** | Salton Sea | Operator narrative | 1 | No | **Operator page + live warning:** Varner Harbor closed to vessels |
| **NPS** (Channel Islands, Yosemite, Point Reyes...) | Federal parks | Restrictions, permits. No indexed launches | Few | No | **Operator pages, not a registry** |
| **USACE Corps Lakes** | 23 CA projects | Activity matrix only | 23 lakes | No | **Lake-granularity only.** Says boating allowed, not where to launch |
| **Lake Tahoe Water Trail** | Tahoe | Launch vs landing, parking, restrooms. No fees/hazards | ~20 | Google My Maps embed | **CANDIDATE GENERATOR.** Copyrighted, sold commercially |
| **Humboldt Bay Water Trail** | Humboldt | Launch quality, mudflats, channel depths | ~20 | Map-based | **CANDIDATE GENERATOR to REGISTRY**, far from SoCal |
| **American Whitewater** | National rivers | Class, gradient, gauge, hazards | Hundreds of CA reaches | Reach-level | **Rivers only.** "Put-in" means top of a Class III run, wrong band |
| **visitcadelta.com** *(owner lead)* | Delta | **None.** Gateway pages; the boat-launch URL 404s | n/a | No | **NOT USABLE. A tourism page, not a registry** |

---

## DBW, re-evaluated honestly (owner asked to look again)

**Worse than the sweep said:** DBW publishes **no coordinates at all**, only a street address. Every DBW-sourced spot would need geocoding from an address, which is the precise step that produced the parking-lot pins. Its "Spatial Database" page is a coastal-sediment link list, not a facility geodataset. **DBW can never be a coordinate source.**

**Better than the sweep said, and new:**
1. **It is the only source with an ownership/access field.** `Open To` = Public / Private / Club members / Guests only. **That is the direct control for the spot-92 failure** (a private shop's dock sold as a public put-in). YourCoast has no access or ownership field at all, which is its biggest gap.
2. **It is the only source covering inland SoCal.** YourCoast is coastal by construction: zero records for Castaic, Pyramid, Puddingstone, Perris, Silverwood, Big Bear, the Salton Sea or the Colorado River. DBW has them all.
3. **47 statewide facilities are typed "Aquatic Center" or "Aquatic Center / BISC"** (Boating Instruction and Safety Center), which are DBW-funded **non-motorized paddling centres**. That is the one slice of DBW actually about paddling and nobody has looked at it.

**Unchanged:** the category error stands. DBW registers motorized/trailered facilities; its parking count is literally "spaces for cars with trailers"; it has no hand-launch or carry-in type. A hit is not proof of a paddle launch, a miss is not proof against one, and **a DBW type must never be grounds to hide a spot**.

**Revised verdict: CANDIDATE GENERATOR** (up from "narrow ramp-claim check"), on the strength of `Open To` and inland coverage.

---

## "Just search boat ramp / state park / river / lake / beach"

**Not viable as stated: it is the geocode-and-trust step that produced spot 79, with a search engine standing in for the geocoder.**

1. The proven failure is not missing names, it is losing what a source meant. Search hands you a name with no per-site fields, so `has_fee`, `tide_sensitive` and hazards all get filled by inference. Inference is what wrote "paved ramp" on a beach at spots 47 and 120.
2. **No access or legality signal.** A search returns 101 Surf Sports (spot 92, private dock) and Lake Arrowhead (members only) with the same confidence as Mother's Beach.
3. **No freshness signal.** Varner Harbor is closed to vessel access and is still the top result for "Salton Sea boat launch".

**The defensible version, which inverts it:** generate candidates only from an agency source carrying an ID (CCC record, DBW facility, OSM element). Re-derive the coordinate from imagery or an OSM slipway. *Then* use targeted search to reach **the operating agency's own page** for that named site, to confirm it is open, who may launch, and seasonal closures. Search confirms a record a registry produced; it never produces records.

---

## Recommended sequence for SoCal

1. **CCC YourCoast as the field spine.** 127 uncovered SoCal candidates, and the fields arrive populated: **126 of 127 have FEE answered, 121 have RESTROOMS, 69 carry a launch type, 59 ship a photo.** Guardrails: the coordinate is never the put-in (re-pin every record); use `BT_FACIL_TYPE` verbatim and never upgrade `Hand Launch` into "ramp"; lineage is the 2014 Coastal Access Guide, so these records are **12 to 20 years old** and freshness must come from step 3.
2. **OSM as the coordinate corrector.** 235 SoCal slipways with real ramp geometry; **31 of the 127 candidates sit within 400 m of a mapped slipway** and can be re-pinned semi-mechanically. The 64 with no slipway within 1 km are hand/beach launches, which is consistent, not a failure. Two facts that save a wasted query: **`canoe=put_in` has zero features in California**, and **`canoe=yes` is 242/246 river LINES, not points**.
3. **DBW + the operating agency page**, for inland coverage (119 public launch-typed SoCal facilities) and as the legality/freshness tier.

**Why not the others first:** RIDB yields 12 SoCal facilities, half of them lower-Colorado BLM sites 200 miles from the customer base. Every SoCal city and county portal probed has no launch dataset, and that is the finding: **in SoCal the agency data exists and the Coastal Commission has already aggregated it.** Going to cities directly re-does CCC's work.

---

## Two things that must reach item 45's acceptance criteria

**No source publishes `tide_sensitive`.** Not CCC, DBW, OSM or RIDB. The field the sweep proved is load-bearing for the conditions engine, and was systematically wrong on 36 bay spots, still has to be derived. Expanding into 127 tidal SoCal coastal sites without a rule for it scales the existing defect.

**The failure mode changes shape in SoCal.** Bay records failed by drifting from a good source. SoCal records will fail by **staleness and access rules**, because the best source is a 2014 book and SoCal water is a patchwork of city, county, harbour district, water district and private ownership that no dataset encodes. Lake Arrowhead (private) and Varner Harbor (closed) are the two proofs already in hand. **SoCal acceptance should require an operator confirmation per record, not just a registry ID.**

## Legal gate items

- **CA State Parks GIS licence:** "COPYRIGHT 2026 CALIFORNIA STATE PARKS, ALL RIGHTS RESERVED... may not be sold or altered... Commercial uses must be approved by CSP in advance." A blocker for any paid tier (PaddlePass). Do not use without a gate.
- **OSM ODbL:** attribution required and share-alike attaches to a derived database. If OSM coordinates enter `spots.json`, that is a licensing question, not a footnote.
- **CCC YourCoast:** no copyright bar, but a hold-harmless / indemnification clause accepted by use.
