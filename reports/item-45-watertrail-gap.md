# SF Bay Water Trail gap analysis (ROADMAP item 45)

**Date:** 2026-07-16
**Status:** PROPOSAL FOR OWNER REVIEW. **Nothing has been edited.** `data/spots.json` is untouched.
**Scope:** all 47 designated SF Bay Water Trail trailheads, classified against all 142 records.
**Method:** the registry screen the sweep's finding 0 recommended (`reports/data-quality-sweep-2026-07-16.md`), run to completion.

---

## Headline

**The Water Trail is already almost fully ingested. It cannot deliver item 45.**

| Verdict | Count | Share |
|---|---|---|
| **CARRIED** (a record exists) | **34** | 72% |
| **MERGED** (described inside another record, no record of its own) | **10** | 21% |
| **GENUINE GAP** (no record, described nowhere) | **3** | 6% |
| **UNVERIFIABLE** | **0** | 0% |

**All 47 resolved. None guessed.**

Three things follow, and the third is the one that matters.

1. **A naive name-match lies in both directions, exactly as briefed.** Confirmed: McNear's (47), Islais Creek (136), Bay Point (127). Also caught: **spot 18's notes name a "Bayfront Park" that is Pier 52 in Mission Bay, a different park from the Water Trail's Bayfront Park in Marin (spot 39)**. A name-match would have merged them.

2. **10 of the 13 non-carried sites are item 40 work, not item 45 work.** They are already written into another spot's notes. Adding them is a *split*, not an *addition*. **77% of what looks like missing coverage is a data-model problem the app already has.**

3. **The 3 genuine gaps are the whole yield of the Bay's authoritative registry.** Item 45 is "expand coverage to more of Northern California." The Water Trail answers that with **three sites, one of which the registry itself says is not a launch**. The registry that finding 0 correctly identified as the right one for the Bay is, for the purpose of *growing* coverage, **spent**. That is a finding about item 45's premise, not about the Water Trail.

---

## The 47, classified

Distances are computed from stored coordinates; every classification is by coordinate or by an explicit name in the host record's notes, never by name similarity alone.

### CARRIED (34)

| Water Trail site | id | Note |
|---|---|---|
| Encinal Beach | 59 | Distinct from spot 60 (Encinal Boat Ramp), which is **not** a Water Trail site |
| Albany Beach | 61 | |
| Emeryville Marina | 135 | |
| Eden Landing | 134 | Coordinate defect already filed (sweep #4) |
| Crown Beach | 58 | |
| Berkeley Marina (Small Boat Launch) | 63 | Pin is 503m away; see MERGED note on the Ramp |
| Bay Point | 127 | |
| Point Pinole | 69 | |
| Riverview Park | 140 | |
| Pittsburg Marina | 139 | |
| Keller Beach | 68 | |
| Big Break | 62 | |
| Antioch Marina | 86 | |
| China Camp State Park | 45 | |
| Bayfront Park (Marin) | 39 | **Not** the "Bayfront Park" in spot 18's notes |
| Angel Island | 126 | |
| McNears Beach | 47 | Apostrophe defeats name-match; ramp claim defect already filed (sweep #1) |
| Black Point Boat Launch | 129 | |
| Cuttings Wharf | 131 | |
| Downtown Napa Dock | 133 | |
| Crane Cove Park | 17 | |
| San Francisco Marina | 141 | |
| Mission Creek | 18 | |
| Islais Creek Landing | 136 | |
| Westpoint Harbor | 26 | |
| Redwood City Municipal Marina | 24 | Name differs ("Redwood City - Chesapeake boat ramp"); notes name the marina |
| Baywinds Park | 128 | |
| Alviso Marina County Park | 1 | |
| Cullinan Ranch Boat Launch | 130 | |
| West Ninth Street | 124 | Name differs ("Alvarez Ninth Street Park"); `geocode_display` confirms |
| Suisun City Marina | 116 | Pin is **67m** from the WT published coord and **81m** from two OSM slipways (`node/5173949895`, `node/5173949896`). Solid |
| Dickson Ranch Boat Launch | 132 | |
| Petaluma Marina | 137 | |
| Petaluma River Turning Basin | 138 | |

### MERGED (10): this is item 40 work (split the record), NOT item 45 work (add a spot)

| Water Trail site | Host id | Evidence it is already described |
|---|---|---|
| Estuary Park | **65** | 65's notes: *"Estuary Park at the Jack London Aquatic Center is the dedicated small-craft launch on this stretch"*. Sweep #6 already proposes re-pinning 65 here |
| Tidewater | **84** (also named in 66) | 84's notes: *"Tidewater Boating Center on site"*. Sweep #9: the two launches are 2,649m apart |
| Berkeley Marina Ramp | **63** | 63 is a marina-complex pin sitting **between** the two WT trailheads: 476m from the Ramp, 503m from the Small Boat Launch, which are **760m from each other**. Consistent with the item 39 pilot's finding that 63's pin is on the DoubleTree lot |
| Boat Ramp Street | **68** | 68's notes: *"Brickyard Cove's Boat Ramp Street offers a hard concrete ramp"* |
| Ferry Point Beach | **68** | 68's notes: *"Ferry Point, the other beach in Miller/Knox Regional Shoreline"* |
| Shimada Friendship Park | **70** | 70's notes name it. Sweep #2: 626m from 70's pin |
| Vincent Park | **70** | 70's notes name it. Sweep #2: 761m from 70's pin |
| Marina Bay Yacht Harbor | **70** | 70's notes name it. Sweep #2: 759m from 70's pin |
| Pier 52 | **18** | 18's notes: *"Pier 52 at Bayfront Park... is San Francisco's public launch ramp"* |
| Pier 40 | **18** | 18's notes: *"Pier 40 at South Beach Harbor is another nearby put-in"* |

**Four host records carry 10 designated trailheads between them.** Spot 70 alone hosts 3, spot 68 hosts 2, spot 18 hosts 2, spot 63 hosts 2. This is the sweep's "water-body record" class (finding 2) seen from the registry side, and it independently confirms it.

### GENUINE GAP (3)

**Pier 39** (San Francisco) · **Baylands Sailing Station** (Palo Alto) · **Downtown Suisun City** (Suisun City)

Candidate records below.

### UNVERIFIABLE (0)

Every site resolved to a primary page. Two fetches of `/trailheads/` returned the same 47-site enumeration. (The second fetch's stated total of "54" is a summarizer arithmetic error: its own per-county counts sum to 47, and the two enumerations are identical site-for-site.)

---

## Candidate records for the 3 genuine gaps

Per-field provenance. **WT** = the site's own Water Trail trailhead page (primary, linked below). Where there is no source, the field is `null` or flagged, never guessed.

### Candidate A: Pier 39, San Francisco

| Field | Value | Source | Conf |
|---|---|---|---|
| `water` | `Pier 39 East Marina` | WT | high |
| `city` | `San Francisco` | WT | high |
| `region` | `San Francisco` | existing vocabulary, `lib/types.ts` | high |
| `lat`/`lng` | **`37.808729, -122.409051`** | See coordinate note | med-high |
| `difficulty` | `bay` | WT: *"Winds and currents on the Bay can be strong"*; open SF Bay marina | high |
| `has_fee` | `true` | WT: *"paid visitor parking in the Pier 39 Garage"*. Matches the spot 129 convention (paid parking → `true`) | med |
| `fee_amount` | `null` | Garage rate not published on the WT page | high |
| `power_boats` | `true` | WT: *"Motorized boats and sailboats are regularly moving throughout the marina"* | high |
| `tide_sensitive` | `true` | **Inference, flagged.** WT states currents, not tides. Open SF Bay is tidal (sweep finding 3) | **med** |
| `dog_friendly` | `null` | **Not stated. Flagged.** | n/a |
| `rentals_available` | `false` | **Not stated. Flagged** as unsourced-false | low |
| `inspection_required` | `false` | **Not stated. Flagged.** No inspection program applies to tidal Bay sites; every WT Bay spot in the app is `false` | low-med |

**Coordinate.** WT publishes `37.80872885602224, -122.40905148346712`. **The OSM cross-check found no `leisure=slipway`, `canoe=yes`, or beach feature anywhere near** (EZ Launch docks are rarely mapped), so this coordinate is **not** OSM-corroborated as a launch. What corroborates it: it reverse-geocodes to **"A Dock"** (not a car park), and it sits **26m** from OSM `way/288396169` `tourism=aquarium name="Aquarium of the Bay"`, matching WT's *"adjacent to Aquarium of the Bay"*. Unlike spots 127/130/132, **this published coordinate is a dock coordinate, not a parking coordinate.** Nearest existing record is spot 141 (SF Marina), **2.9km** away.

**Notes (proposed):**
> An EZ launch dock inside Pier 39's East Marina, next to Aquarium of the Bay. The Water Trail designates it mainly as a destination for paddlers who start elsewhere, not a place to begin. The gate is locked: press the button and Pier 39 security unlocks it by camera. The low-float has guide rails, launch rollers, and a transfer bench. Paddling underneath Pier 39 is prohibited. Motorized boats and sailboats move through the marina constantly, and wind and current outside are strong. Parking is the paid Pier 39 Garage across from the Entrance Plaza, open 24 hours, with a loading zone near the entrance.

**Record confidence: medium.** The site is real, designated, and publicly reachable (the gate intercom is the sanctioned access). **The caveat is load-bearing and must survive into the notes: WT says it is *"anticipated to serve primarily as a destination site for paddlers starting elsewhere."*** Shipping it as a put-in would be the 47/120 defect committed knowingly. Spot 133 (Downtown Napa Dock) is the in-app precedent for carrying a destination dock honestly.

---

### Candidate B: Baylands Sailing Station, Palo Alto

| Field | Value | Source | Conf |
|---|---|---|---|
| `water` | `Baylands Sailing Station` | WT + OSM `way/28745199` (name matches) | high |
| `city` | `Palo Alto` | WT | high |
| `region` | `South Bay` | existing vocabulary; matches spots 1 and 7 | high |
| `lat`/`lng` | **`37.457676, -122.101083`** | See coordinate note | med-high |
| `difficulty` | `bay` | South Bay tidal sloughs; matches spot 1 (Alviso) and spot 7 | med |
| `has_fee` | `false` | WT: *"Parking is free with no limits during park hours"*; no launch fee stated | high |
| `fee_amount` | `null` | No fee | high |
| `power_boats` | `null` | **Not stated. Flagged.** | n/a |
| `tide_sensitive` | **`true`** | WT: *"plan to return to the dock at least three hours before low tide"*, *"During extreme low tides, the dock is no longer level"* | **high** |
| `dog_friendly` | `null` | **Not stated. Flagged.** | n/a |
| `rentals_available` | `false` | WT mentions City of Palo Alto / Ecocenter *"canoeing programs"*. **A program is not a rental.** Not upgrading it | med |
| `inspection_required` | `false` | Not stated; no program applies to tidal Bay sites | low-med |

**Coordinate. This is the parking-vs-dock trap, caught live.** WT publishes `37.458087082863656, -122.10193797686003`. That coordinate **reverse-geocodes to `amenity/parking`** and sits **60m** from OSM `way/906388279` (`amenity=parking, surface=gravel, fee=no`), matching WT's *"ample parking in a gravel lot"*. **It is the car park, exactly as the sweep's finding 1 predicted.** Ingesting it wholesale would have produced a fourth spot 127/130/132.

Proposed instead: **OSM `way/28745200`, `man_made=pier`, `floating=yes`, `name="Baylands Sailing Station"`** at `37.457676, -122.101083`. It reverse-geocodes to *"Baylands Sailing Station"* and `floating=yes` matches WT's *"a boarding pier that leads via a gangway to a high-freeboard dock"*. **The dock is 88m from the WT published coordinate.** (No `leisure=slipway` or `canoe=yes` exists here; the named floating pier is the strongest available launch feature and I am naming it rather than implying a slipway.)

**Notes (proposed):**
> A boarding pier and gangway lead to a high-freeboard dock on the edge of the Palo Alto Baylands Nature Preserve, opening onto winding South Bay sloughs thick with shorebirds and terns. Tide rules the trip: the main channel is mud or inches of water at low tide, the dock stops sitting level at extreme lows, and the Water Trail says be back at least three hours before low. Afternoons get very windy. Free gravel parking with two accessible spaces, an ADA portable restroom, and park hours of 8am to sunset. Seasonal hunting is allowed on nearby lands in Mountain View and Alviso.

**Record confidence: medium-high on the site and its fields. But do not add it in isolation.** **Spot 7 ("Palo Alto Baylands / Flood Basin") already exists 483m away**, its pin reverse-geocodes to **`Marshfront Trail`** (a path, a screen-1 fire the sweep listed as unverified), and **its notes never mention the pier, the dock, or the sailing station**. So the Sailing Station is genuinely undescribed, and spot 7 is a preserve record with no launch. Adding B while 7 stands creates the 54/33/35 duplicate pattern the sweep flagged. **This candidate is entangled with the water-body-record schema decision and should be resolved with spot 7, not around it.**

---

### Candidate C: Downtown Suisun City

| Field | Value | Source | Conf |
|---|---|---|---|
| `water` | `Downtown Suisun City Dock / Suisun Slough` | WT (page also calls it *"Downtown Dock"*) | high |
| `city` | `Suisun City` | WT | high |
| `region` | `North Bay` | existing vocabulary; matches spots 116 and 117 | high |
| `lat`/`lng` | **`38.238623, -122.039190`** | See coordinate note | high |
| `difficulty` | `bay` | Same slough as spot 116, which is `bay` | med |
| `has_fee` | `false` | WT: *"a large, free North Basin parking lot"*; no launch fee stated | med |
| `fee_amount` | `null` | No fee | high |
| `power_boats` | `null` | **Not stated on this page. Flagged.** (116 says `true` for the marina, but that is a different facility and I am not transferring it) | n/a |
| `tide_sensitive` | **`true`** | WT: *"Mudflats become exposed during low tides which can cause boaters to get stranded"* | **high** |
| `dog_friendly` | `null` | **Not stated. Flagged.** | n/a |
| `rentals_available` | `false` | Not stated | low |
| `inspection_required` | `false` | Not stated; no program applies to tidal sites | low-med |

**Coordinate.** WT publishes `38.23862320493977, -122.03919026494293`. It sits **27m** from OSM `way/1278525393` (`man_made=pier, area=yes`), and the nearest car park is **105m** away. **This published coordinate is the dock, not the parking**, so unlike Candidate B it can be used as-is. (No `leisure=slipway`/`canoe=yes` here; a 300-ft high-freeboard dock is not a slipway, and I am not implying one.) It reverse-geocodes to `highway/pedestrian`, the waterfront promenade the dock is attached to.

**Distinct from spot 116, confirmed by coordinate:** spot 116 sits **67m** from the WT *Suisun City Marina* coordinate and **671m** from this one. Two separate designated trailheads. **116's notes say *"Public boat ramps and floating docks at the downtown waterfront"*, which blurs the two but describes only the marina's ramps.** Not a merge; a genuine gap with an adjacent record whose wording invites confusion.

**Notes (proposed):**
> A 300-foot high-freeboard dock at the end of Solano Street, reached by an ADA gangway, right on the downtown Suisun City waterfront. Free parking in the large North Basin lot on Main Street and on neighboring streets. Mudflats expose at low tide and can strand you, and afternoon wind makes the paddle back harder, so check the tide before you go.

**Record confidence: high.** The best-sourced of the three: dock coordinate corroborated in OSM, tide hazard quoted from the source, fee answered, and cleanly separated from the neighbouring record by coordinate.

---

## Incidental findings (not the brief, reporting anyway)

1. **Spot 116's `has_fee: false` is correct, and worth recording as a rare clean result.** WT: *"$5 parking fee is required for cars with trailers"*, free otherwise. A SUP brings no trailer. The sweep's fee-field pessimism does not apply here.
2. **Spot 7 is resolved as a screen-1 fire.** The sweep listed it as unverified. It is a preserve record pinned on `Marshfront Trail`, 483m from the only launch in the preserve, whose notes describe no launch at all. **It belongs on the water-body-record list (sweep finding 2), which currently omits it.**
3. **`dog_friendly` and `power_boats` are `boolean` (non-nullable) in `lib/types.ts` but hold `null` in 26 and 25 records respectively.** The type and the data disagree. The WT-sourced block (127-141) uses `null` for unknown, which is the honest convention and the one these candidates follow. Worth reconciling the type to match.
4. **`has_fee` has no defined semantics for "free launch, paid parking."** Spot 129 resolves it as `true` ($5 day-use parking → `has_fee: true, fee_amount: 5`), and Candidate A follows that precedent. It is a convention inferred from one record, not a written rule. Given the sweep found `has_fee` among the app's worst fields, defining it is cheap and overdue.

---

## Recommendation: can item 45 proceed independently of item 40?

**Partly, and it is not worth doing on its own.**

**Mechanically, 2 of the 3 gaps are independent of item 40.** Pier 39 and Downtown Suisun City are new records in areas no existing record claims. They could be added tomorrow without touching a single existing spot. **Candidate B (Baylands) cannot**: it collides with spot 7, and adding it without resolving 7 manufactures the duplicate pattern the sweep just spent a report documenting.

**Strategically, item 45 should stay blocked, for a reason the sweep did not have and this analysis produces:**

1. **The yield does not justify the unblock. Item 45 is "expand coverage to more of Northern California." The Bay's authoritative registry yields three records, and one of them is a dock the registry itself says is not a launch.** 34 of 47 are carried; the app is at 72% of the Water Trail already. **You cannot expand NorCal coverage from a source you have already ingested.**

2. **The work that is actually sitting here is item 40's, and it is 3x larger than item 45's.** 10 merged trailheads against 3 gaps. Every one of those 10 is a designated site a paddler could search for and not find, because it is buried in another spot's prose under a pin that is 476m to 2,649m away. **Item 45 opened against the Water Trail resolves to item 40 by a ratio of 10:3.**

3. **Doing 45 first inverts the dependency in a visible way.** Add Downtown Suisun City and the app gains a second Suisun record while spot 70 still hides three Richmond trailheads under a neighbourhood centroid. **Coverage would go up and findability would not.** The split work is what a user experiences as "more spots."

4. **The registry that makes this rigor possible does not extend to item 45's actual target.** Every verification here rests on the Water Trail publishing dock type, parking, fees, and hazards per site. **That corpus stops at the Bay.** Item 45's ambition is the Sierra, the Delta, the Central Valley, the Central Coast, the north coast, and **no equivalent registry has been identified for any of them.** DBW is already disqualified (finding 0). So the honest statement is not "45 is blocked on 40." It is: **for the Bay, 45 is nearly done and mostly misfiled as 40; for the rest of NorCal, 45 has no verified source yet, and finding one is the real first task.** Absent that, expansion falls back to exactly the geocode-and-trust step that produced spot 79.

**Recommended sequencing:**
- **Refile the 10 merged trailheads into item 40** as named split tasks. They are the largest concrete, fully-sourced work this analysis found.
- **Take Candidate C (Downtown Suisun City) now if the owner wants a cheap win.** High confidence, dock coordinate OSM-corroborated, no collision, no dependency.
- **Hold Candidate A (Pier 39)** pending a decision on whether the app carries destination-only docks. Precedent exists (spot 133). The "not a launch" caveat is non-negotiable in the notes.
- **Hold Candidate B (Baylands)** until spot 7 is resolved. It is a schema decision, not a data fix.
- **Rewrite item 45's acceptance to start with "identify an authoritative, field-complete registry for the target region."** Not "run the pipeline." The Water Trail worked precisely because it is that; the pipeline is what the sweep and audit both indicted.

---

## Method

**Enumeration.** `sfbaywatertrail.org/trailheads/` fetched twice with different prompts; identical 47-site enumeration both times.

**Classification.** Every trailhead matched against all 142 records by (a) keyword against `water` + `city` + `notes` + `geocode_display`, then (b) resolved by coordinate distance and by reading the full host record. **No classification rests on name similarity alone**, which is what made McNear's, Islais Creek, Bay Point, and the two Bayfront Parks come out right.

**Verification.** Six trailhead pages fetched individually as primaries (Pier 39, Baylands Sailing Station, Downtown Suisun City, Berkeley Marina Ramp, Berkeley Marina Small Boat Launch, Suisun City Marina). OSM/Overpass geometry (`leisure=slipway`, `canoe=yes`, `waterway=access_point`, `natural=beach`, `man_made=pier`, `amenity=parking`) and Nominatim reverse-geocode at zoom 18 for every proposed and published coordinate.

**No claim, coordinate, or field value in this report is taken from a search-result summary or an AI overview.** Every quoted string comes from the site's own Water Trail page. Where a page does not state a field, the field is `null` or flagged, and no value is proposed.

**Overpass note:** rejects curl's default UA with HTTP 406; a UA header is required. `man_made=pier` is unusable as a launch screen inside a marina (Pier 39 returned 250+ finger docks).

**Coverage: complete.** All 47 trailheads reached and classified. Nothing deferred for budget.

**Sources**

[WT trailhead index](https://sfbaywatertrail.org/trailheads/) · [WT Pier 39](https://sfbaywatertrail.org/trailhead/pier-39/) · [WT Baylands Sailing Station](https://sfbaywatertrail.org/trailhead/palo-alto/) · [WT Downtown Suisun City](https://sfbaywatertrail.org/trailhead/downtown-suisun-city/) · [WT Suisun City Marina](https://sfbaywatertrail.org/trailhead/suisun-city-marina/) · [WT Berkeley Marina Ramp](https://sfbaywatertrail.org/trailhead/berkeley-marina-ramp/) · [WT Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) · OpenStreetMap via [Overpass API](https://overpass-api.de/) (ODbL) · [Nominatim](https://nominatim.openstreetmap.org/)

Internal: `reports/data-quality-sweep-2026-07-16.md` · `reports/coord-audit-2026-07-16.md` · `ROADMAP.md` items 40 and 45 · `lib/types.ts` · `data/spots.json`
</content>
</invoke>
