# LA County ingest: candidates and the manual-lookup list

Source: CCC YourCoast full pull (1,575 records), 2026-07-22. LA County = 230 records.

## What the filter produced

| | Count |
|---|---|
| LA County CCC records | 230 |
| `BOATING = Yes` | 37 |
| **Paddle-plausible after filtering** | **51** |
| ...with an **explicit launch type** | **11** |
| ...beach carry-in only | 40 |
| Already within 500 m of an existing spot | **0** |

Field completeness across the 51 is genuinely good, which is why this source is worth using: **FEE 50/51, PARKING 51/51, RESTROOMS 50/51, ADA 51/51.** Weak: `DOG_FRIENDLY` 12/51, `BT_FACIL_TYPE` 11/51, phone 22/51.

## Recommendation before anything is ingested

**Ingest from the 11, not the 51.** The 40 "beach carry-in" candidates are overwhelmingly **Malibu open-ocean surf beaches and cliff-stairway accesses**: El Matador, El Pescador, La Piedra, Leo Carrillo, Point Dume, Dume Cove, Broad Beach, Carbon Beach, Lechuza, and five separate Puerco Beach stairways. Several are stair-only access down a bluff, which is not a place anyone carries a 12-foot board, and all of them are exposed Pacific with shore break.

Listing those as paddle launches on a site that carries drowning-risk exposure would be a **safety-quality problem, not just a data-quality one**. They are legitimate coastal *access* points, which is what CCC catalogues. They are not put-ins. This is the "ingested a good source and lost what it meant" failure in its purest form: CCC never claimed these were launches.

## The 11 real candidates, with coordinate status

Checked against OSM slipways (Overpass; the Marina del Rey box timed out twice, so three rows are unknown rather than negative).

| # | Name | CCC type | Fee | Coordinate status |
|---|---|---|---|---|
| 1 | **Mother's Beach**, Marina del Rey | Hand Launch | Yes | **UNKNOWN** (OSM box timed out) |
| 2 | Boat Launch Ramp, 13477 Fiji Way, MdR | Boat Ramp | Yes | **UNKNOWN** (OSM box timed out) |
| 3 | King Harbor, Redondo Beach | 4 Marinas + Hand Launch | Yes | **UNKNOWN** (OSM box timed out) |
| 4 | Cabrillo Beach, San Pedro | Boat Ramp | Yes | re-pin candidate, slipway **328 m** away |
| 5 | Cabrillo Beach Boat Ramp, San Pedro | Boat Ramp | (blank) | **coord looks GOOD**, slipway 4 m |
| 6 | South Shore Launch Ramp, Long Beach | Boat Ramp | Yes | **coord looks GOOD**, slipway 4 m |
| 7 | Long Beach City Beach | Boat Ramp | Yes | no slipway within 400 m (nearest 2,420 m) |
| 8 | Belmont Shore, Long Beach | Boat Ramp | Yes | no slipway within 400 m (nearest 1,571 m) |
| 9 | Alamitos Bay, Long Beach | Boat Ramp | No | no slipway within 400 m (nearest 940 m) |
| 10 | **Marine Park** (Mother's Beach LB) | Boat Ramp | Yes | re-pin candidate, slipway **277 m** away |
| 11 | **Marine Stadium**, Long Beach | Boat Ramp | Yes | no slipway within 400 m (nearest 630 m) |

**Note that rows 5 and 6 contradict the statewide finding.** The inventory's "20 of 20 coordinates are wrong" test was run on hand/kayak/**beach**-launch types. Boat-ramp-typed records appear to be pinned better. That is a useful refinement: **the coordinate risk is concentrated in the hand/beach launches, which is exactly where this app's best spots are.**

---

# MANUAL LOOKUP LIST

Things I cannot determine from any dataset. Ordered so the top section alone unblocks a first ingest.

## A. Blocking: is it a good SUP launch, and where exactly? (the 11)

For each, I need a **put-in coordinate** and a **yes/no on protected water**. Rows 5 and 6 already have a trustworthy coordinate.

| # | Site | What I need from you |
|---|---|---|
| 1 | **Mother's Beach, Marina del Rey** | Put-in coordinate. This is the best-known LA flatwater SUP spot; I expect protected, no surf. Confirm launch area vs swim area, and whether the hand-launch dock is the put-in or the sand is. |
| 2 | Boat Launch Ramp, 13477 Fiji Way | Put-in coordinate. Is this usable by a SUP at all, or is it a trailer ramp where a paddler is unwelcome? |
| 3 | King Harbor, Redondo | Put-in coordinate for the **hand launch** specifically, not the marina or the hoists. |
| 4 | Cabrillo Beach, San Pedro | Which side? The **inner** (harbour, protected) and **outer** (open ocean, surf) beaches are different launches with the same name. This distinction decides whether it is safe to list. |
| 7 | Long Beach City Beach | Coordinate, and is there an actual launch point or is this a 3-mile beach frontage? |
| 8 | Belmont Shore | Same: coordinate, and whether it is a specific launch or a stretch of sand. |
| 9 | Alamitos Bay | Coordinate. CCC says **fee = No, parking = No, restrooms = No**, which is unusual; worth confirming it is a real public access. |
| 10 | Marine Park / Mother's Beach Long Beach | Put-in coordinate. Protected bay, likely a strong candidate. |
| 11 | **Marine Stadium** | Put-in coordinate. Famous flatwater venue; confirm whether paddling is allowed outside sanctioned events and rowing hours. |

## B. Blocking: access rules no dataset carries

CCC has **no ownership or access field at all**, which is its single biggest gap.

1. **Do any of the 11 require a permit, launch fee, or residency** beyond the parking fee CCC records?
2. **Marine Stadium and Alamitos Bay:** are there posted hours or event closures when paddling is prohibited?
3. **Cabrillo Beach:** any current water-quality closure? The inner beach has a long history of bacteria advisories.
4. **Marina del Rey:** is the Fiji Way ramp restricted to trailered vessels?

## C. Non-blocking, but every record will be wrong without it

5. **`tide_sensitive`.** **No source publishes this**, not CCC, DBW, OSM or RIDB. Every LA candidate is coastal or bay, so the honest default is `true`, but Marine Stadium is a dredged basin and may behave differently. This field feeds the conditions engine and was already wrong on 36 Bay spots, so I would rather ask than infer.
6. **Freshness.** CCC lineage is the 2014 *Coastal Access Guide* and 2005-2009 guidebooks, so **these records are 12 to 20 years old**. Anything with a fee or a facility claim needs an operator check.
7. **The 40 beach candidates.** If you want any of them, name which. My recommendation is none for v1, but **Malibu Lagoon State Beach** is the one plausible exception (lagoon, protected, known paddling) and **Abalone Cove / Royal Palms** are worth a look if you know them.

## D. Things I can do without you, once A is answered

- Re-pin rows 4 and 10 from the OSM slipway, and retry the Marina del Rey Overpass box for 1-3.
- Carry `FEE`, `PARKING`, `RESTROOMS`, `DSABLDACSS` straight from CCC with per-field provenance.
- Use `BT_FACIL_TYPE` verbatim, never upgrading "Hand Launch" into "ramp".
- Cross-check each against DBW for its `Open To` (public / private / club) value, which is the one ownership signal that exists anywhere.
