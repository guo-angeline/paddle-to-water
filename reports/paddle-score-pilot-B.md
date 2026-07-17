# Paddle score pilot, Researcher B

**Date:** 2026-07-16
**Rubric:** v2 (put-in only), `docs/specs/item-39-paddle-score.md` §1.2
**Scope:** 10 spots (1, 38, 45, 48, 63, 84, 104, 112, 120, 135), four axes: launch_ease (0.40), parking (0.30), launch_traffic (0.15), facility (0.15)
**Researcher:** B (independent; did not see Researcher A's output)
**Nothing in `data/spots.json` or any other repo file was modified.**

---

## Headline

**The kill criterion in §4.1 is met, on both tests, decisively.**

- Observed spread: **0.80 points** (min 3.5, max 4.3). The threshold is 1.5.
- **9 of 9 scored spots fall inside a single 1.0-wide band** (3.3–4.3). The threshold is 7 of 10.

§4.1 predicted this exact failure in its own words: *"every spot lands at 3.5-4.5 and the score is decoration."* The observed range is 3.5–4.3. The prediction was correct.

The mechanical cause is visible in the axis table: **launch_ease, which carries 0.40 of the weight, came back `4` for seven of the nine scored spots.** The heaviest axis is nearly constant, so it cannot separate anything. Detail in §"Why the spread collapsed".

One spot (48, Nagasawa) is unscorable: two axes had no source. Per the pilot rules that is a reported unknown, not a guess.

**Recommendation: cut item 39 as specified.** See §"Recommendation".

---

## Scores

| id | Spot | launch_ease (.40) | parking (.30) | launch_traffic (.15) | facility (.15) | **Score** |
|---|---|---|---|---|---|---|
| 1 | Alviso Marina | 4 | 5 | 4 | 4 | **4.3** |
| 38 | Miller Boat Launch | 4 | 5 | 3 | 4 | **4.1** |
| 45 | China Camp | 3 | 3 | 5 | 5 | **3.6** |
| 48 | Nagasawa Park | 4 | **null** | **null** | 4 | **null** |
| 63 | Berkeley Marina | 4 | 5 | 4 | 4 | **4.3** |
| 84 | MLK Jr. Shoreline | 4 | 5 | 3 | 3 | **4.0** |
| 104 | Echo Lakes | 4 | 3 | 3 | 4 | **3.6** |
| 112 | Morro Bay / Coleman | 4 | 4 | 5 | 4 | **4.1** |
| 120 | Folsom / Beals Point | 3 | 3 | 5 | 4 | **3.5** |
| 135 | Emeryville Marina | 4 | 3 | 3 | 4 | **3.6** |

No spot triggered the access floor (`launch_ease == 1`); `capped=false` throughout. Spot 48's score is blocked by **parking** and **launch_traffic**.

Rounding note: computed with `ROUND_HALF_UP`. Spot 38 (raw 4.15) and 112 (raw 4.15) round to 4.2 under half-up on the decimal, but Python's `round(4.15, 1)` returns `4.1` because 4.15 is not exactly representable in binary. **The spec's `round(..., 1)` in §1.3 is underspecified at the .x5 boundary and two of ten spots land exactly on it.** I report the Python-`round` values (4.1) since §1.3 specifies `round`. This does not affect the spread conclusion.

---

## Spread analysis (§4.1)

| Metric | Value | §4.1 kill threshold | Verdict |
|---|---|---|---|
| Min score | 3.5 | | |
| Max score | 4.3 | | |
| **Spread** | **0.80** | spread < 1.5 | **KILL MET** |
| **Max in one 1.0-wide band** | **9 of 9** (3.3–4.3) | 7+ of 10 | **KILL MET** |

Scores sorted: `3.5, 3.6, 3.6, 3.6, 4.0, 4.1, 4.1, 4.3, 4.3`

Even the unscorable spot (48) would not rescue this: its two known axes are `launch_ease 4` and `facility 4`, so any values for the missing two would place it between 3.1 and 4.6, overwhelmingly likely inside the same band.

Note the selection defense: §4.3 chose these spots "to span the expected range, not to flatter it," across 5 regions, 3 `has_fee` states, both `tide_sensitive` states, and "at least two spots expected to score low." **The narrow spread is therefore a finding, not a selection artifact.** The spec built in that control and the control held.

### Why the spread collapsed

**1. The 0.40 axis is a constant.** launch_ease came back `4` for 7 of 9 scored spots and `3` for the other 2. It never returned 1, 2, or 5. Every put-in in the sample is either a paved ramp/dock with a carry over 50 ft (→ 4) or a natural beach (→ 3 or 4). The axis with the most weight has an observed range of one level.

**2. Level 5 on launch_ease is nearly unreachable.** It requires *"carry under 50 ft"* **and** tide-independence **and** a paved ramp/dock **and** gentle grade, conjunctively. A 50 ft carry is shorter than a single parking stall row; essentially no real lot achieves it. Meanwhile level 4's catch-all, *"or a paved ramp with a longer carry"*, absorbs every developed launch regardless of quality. **Alviso (two concrete ramps, two floating docks, ADA path, 110 ft) and Emeryville (one cement ramp, high-freeboard dock, ~90 m carry) both score 4.** Those are not equivalent put-ins for a paddleboard, and the rubric cannot tell them apart.

**3. The two low-weight axes are the only ones that moved,** and they moved in opposite directions from the high-weight ones, actively compressing the range. Spots with no ramp (45, 112, 120) score *worse* on launch_ease/parking but *best* on launch_traffic (5, because "separate from any ramp"). Spots with good ramps score better on launch_ease and worse on traffic. The axes are negatively correlated by construction, so the weighted sum cancels. This is structural, not sample noise: **a ramp is simultaneously what makes launching easy and what makes the put-in contested.**

**4. Bay Area launches really are broadly similar on these axes.** Free-or-cheap lot, paved ramp or beach, a restroom somewhere, some motorized boats. That was §0.1's stated risk and it is what the data shows.

---

## Per-spot detail with sources

### Spot 1: Alviso Marina / Alviso Slough (South Bay)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | high | "two concrete boat launch ramps and two floating docks. One of the docks is high-freeboard and the other is low-freeboard"; flat paved path, "approximately 110 feet" from nearest ADA parking. Paved ramp + carry over 50 ft → 4, not 5. Floating docks satisfy §1.2's tide-independence escape. | [SF Bay Water Trail: Alviso Marina](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) |
| parking | 5 | medium | "Parking is free with no time limits during regular park hours"; two lots, one at the launch with trailer-sized spaces. OSM `way/23011090` capacity 46, `way/306337656` capacity 28 (~40 m from ramp). "Rarely full" not sourced (see §Ambiguity A2). | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/); [OSM way/306337656](https://www.openstreetmap.org/way/306337656) |
| launch_traffic | 4 | **low** | "Motorized and non-motorized boats both use the launch." A low-freeboard dock exists (paddler-suitable) alongside the ramps. **Use intensity is not published anywhere**, the "light use" clause of level 4 is unsourced inference. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) |
| facility | 4 | high | ADA restroom with flush toilets near park entrance. OSM `way/306337657`: `toilets:disposal=flush`, `wheelchair=yes`, `changing_table=yes`. Not 5: "trash service, clear signage" unsourced. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/); [OSM way/306337657](https://www.openstreetmap.org/way/306337657) |

Pin check: reverse-geocodes to `highway/service` "Alviso Marina" and sits **on** OSM slipway `way/499727799`. Coordinate is on the ramp. Good.

### Spot 38: Miller Boat Launch, Marshall (North Bay)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | high | "Launch your motorized or non-motorized craft from a two-lane ramp or dock." "Dock, path, and restrooms are ADA accessible." Carry from lot to slipway ~25 m (~80 ft) → over the 50 ft level-5 bar. | [Marin County Parks: Miller Boat Launch](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) (archived 2026-02-07; live site is Cloudflare-blocked); [DBW: Tomales Bay facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Tomales%20Bay), "Miller Park BLF", Type **Launch**, Access **Public** |
| parking | 5 | high | "There is a large parking lot at the boat launch. **Parking is free.** Overnight parking requires a permit." | [Marin County Parks](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) |
| launch_traffic | 3 | **low** | "A popular 4-acre boat launch and fishing spot"; motorized + non-motorized share a two-lane ramp. "Popular" is the only primary signal on intensity; mapping it to a level is judgment. | [Marin County Parks](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) |
| facility | 4 | high | Amenities: "Parking, Picnic Tables, Restroom"; restrooms ADA accessible. OSM `node/4878780336` `wheelchair=yes`, `check_date=2024-05-17`. Posted park rules. | [Marin County Parks](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch); [OSM node/4878780336](https://www.openstreetmap.org/node/4878780336) |

Pin check: Marin's own page publishes `38.20010862841114, -122.92159267930528`; stored pin `38.2, -122.9215` is ~13 m away. **Confirms the audit's false-positive verdict.** Good.

### Spot 45: China Camp, San Rafael (North Bay)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 3 | medium | Launch from a gravel/sand beach beside the pier; no dock. `tide_sensitive: true` and mud at low tide → §1.2 says push toward 2-3; no floating-dock escape. Carry is contested (see §Ambiguity A3): Water Trail says ~600 ft from hilltop paved parking, but the ~30-vehicle village lot is adjacent. | [SF Bay Water Trail: China Camp](https://sfbaywatertrail.org/trailhead/china-camp-state-park/); [Friends of China Camp: Activities](https://friendsofchinacamp.org/visit-the-park/activities/) |
| parking | 3 | high | "Fee for parking is $5 per vehicle and can be paid onsite with cash or credit card." Paid lot → level 3 by definition, regardless of ampleness. | [Friends of China Camp](https://friendsofchinacamp.org/visit-the-park/activities/) |
| launch_traffic | 5 | medium | "China Camp State Park has two designated launch sites: China Camp Village and Bullhead Flat", both beaches. "Boaters can launch from a scenic beach located next to the pier." No ramp is mentioned by any source → paddler access separate from any ramp. | [Friends of China Camp](https://friendsofchinacamp.org/visit-the-park/activities/); [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |
| facility | 5 | high | Restrooms with "flush toilets", "running water, and picnic tables"; "private changing rooms, as well as cold outdoor showers for rinsing"; boat wash station. Staffed state park. | [Friends of China Camp](https://friendsofchinacamp.org/visit-the-park/activities/); [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |

Note: `has_fee: null` in the record, but Friends of China Camp states $5/vehicle. Not an error (null = unknown), but it is fillable from a primary source.

### Spot 48: Nagasawa Park, Santa Rosa (North Bay), **UNSCORABLE**

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | **low** | City's own facility record lists "Boat Ramp" among features; OSM `node/5817093285` `leisure=slipway` is 15 m from the pin. **Ramp existence is sourced; surface, grade, and carry distance are not.** Level assigned on the developed-ramp default. | [City of Santa Rosa: Nagasawa Community Park](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76); [OSM node/5817093285](https://www.openstreetmap.org/node/5817093285) |
| parking | **null** | **unknown** | City lists "Parking" and "Parking lot entrance is on Fountaingrove Parkway", no cost, no capacity, no walk distance, no fullness. **OSM maps no parking within 648 m of the slipway.** Nothing supports choosing among levels 1–5. |, (no source found) |
| launch_traffic | **null** | **unknown** | No source states whether motors are permitted, nor any use intensity. `power_boats: null` in the record is a prior, not an answer (§1.2). |, (no source found) |
| facility | 4 | medium | City facility record lists "Restrooms", "Picnic Tables", "Trails". Presence sourced; working condition not. | [City of Santa Rosa](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76) |

**Score: null**, blocked by parking and launch_traffic. Per §4.2 this is the correct output, not a failure.

### Spot 63: Berkeley Marina (East Bay)

Scored against the SF Bay Water Trail's designated **"Berkeley Marina Small Boat Launch"** (201 University Ave). See the record flag below, the stored pin is not at this site.

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | medium | "Three public docks, two small boat hoists"; "a large unpaved parking lot located at the top of the docks"; beach launch also available at adjacent Shorebird Park. Docks are tide-independent; exact carry not published → 4 by the "longer carry" clause. | [SF Bay Water Trail: Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |
| parking | 5 | medium | "Parking is free from 6AM – 10PM, with no overnight parking allowed"; "a large unpaved parking lot located at the top of the docks". OSM `way/1157813821` "Launch Ramp Public Parking" capacity 37. **Conflict:** OSM `way/67395840` ("Launch Ramp Trailers Only") tags `fee=yes`; I take the Water Trail (agency) over OSM. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/); [OSM way/1157813821](https://www.openstreetmap.org/way/1157813821) |
| launch_traffic | 4 | **low** | Small-boat docks/hoists are physically separate from the trailer launch ramp (~400 m north, with its own "Trailers Only" lot). But "be aware of student sailors, novice windsurfers, and swimmers in the South Sailing Basin", Cal Adventures operates from these docks, so the put-in is genuinely contested. 5 vs 4 is a coin flip here. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |
| facility | 4 | medium | "Three portable restrooms are located at Cal Adventures" plus "two accessible restrooms located in Shorebird Park"; windsurfing rigging area with wash-down facilities. Portable restrooms → maintained, not "well-maintained". | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |

### Spot 84: MLK Jr. Regional Shoreline, Oakland (East Bay)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | high | "A two-lane boat launch is located at the south parking lot along Doolittle Drive." Project page: "renovated ADA-accessible boat, kayak and paddleboard launch area" and "repaved staging area parking lot". OSM slipway `node/2427025918` 32 m from pin; "Doolittle Beach Staging Area" lot ~25 m from the slipway → carry over 50 ft. | [EBRPD: MLK Jr. Regional Shoreline](https://www.ebparks.org/parks/martin-luther-king); [EBRPD: Doolittle Bay Trail expansion](https://www.ebparks.org/about-us/whats-new/news/new-doolittle-bay-trail-expansion-brings-improved-safety-and-access-martin); [OSM node/2427025918](https://www.openstreetmap.org/node/2427025918) |
| parking | 5 | high | "Parking: No fees*" (*$40/vehicle for Coliseum events only). Launch is at the south parking lot; dedicated free lot at the launch. | [EBRPD](https://www.ebparks.org/parks/martin-luther-king) |
| launch_traffic | 3 | **low** | "There is no boat launch fee. Motorized boats and hovercraft are not allowed in marshland areas. Jet Skis and hydrofoils are prohibited from November 1 – March 31" → motorized present at the ramp. Two-lane shared ramp. Intensity unsourced. | [EBRPD](https://www.ebparks.org/parks/martin-luther-king) |
| facility | 3 | medium | **Live closure on EBRPD's page: "Right Dock (south side - Doolittle fishing pier) is closed. Pilings are in need of replacement. Updated July 16, 2026."** OSM maps no toilets within ~330 m of the Doolittle launch (park-wide restrooms exist, but not at this put-in). Basic, not neglected → 3. | [EBRPD](https://www.ebparks.org/parks/martin-luther-king); OSM (nearest toilets `node/1918199105`, ~330 m) |

### Spot 104: Echo Lakes (Sierra Nevada)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | medium | "Marine Services & Pier – boat launching"; "Store, Boat ramp and taxi hours are 9 am to 5 pm daily." OSM `way/1252551204` `leisure=slipway` + `highway=service` (paved service slipway), 45 m from pin. Nearest lot (`way/534039220`, capacity 20) ~60 m → carry over 50 ft. Tide-independent (lake). | [Echo Chalet](https://www.echochalet.com/); [DBW facility f/726](https://dbw.parks.ca.gov/BoatingFacilities/f/726) (Type **Marina/Launch**, Access **Public**); [OSM way/1252551204](https://www.openstreetmap.org/way/1252551204) |
| parking | 3 | medium | USFS: "This area can be **extremely crowded on weekends**. Please consider visiting in the early morning or late afternoon"; "Seasonal parking". OSM lot capacity 20 plus several `parking=street_side` ways. Both branches of level 3 ("paid lot" / "free but fills on summer weekends") converge on 3, which makes the level robust even though cost is unsourced. | [USFS LTBMU: Echo Chalet](https://www.fs.usda.gov/r05/laketahoebasin/recreation/echo-chalet); [OSM way/534039220](https://www.openstreetmap.org/way/534039220) |
| launch_traffic | 3 | **low** | Shared ramp: "$40.00 – any Trailered or Motorized (Gasoline or Electric) vessel"; "$10.00 For non-motorized watercraft utilizing the boat ramp or harbor". Boat-taxi service also operates from the pier. USFS "extremely crowded on weekends". Intensity *at the put-in* still inferred. | [Echo Chalet Services](https://echochalet.net/echo-chalet-services/); [USFS LTBMU](https://www.fs.usda.gov/r05/laketahoebasin/recreation/echo-chalet) |
| facility | 4 | medium | USFS: "Restrooms are available when the Chalet is open"; "Restrooms and trash service are available only when the trailhead is open"; "Vault toilet(s)". OSM `way/288412938` `toilets:disposal=pitlatrine`. DBW f/726 lists Restrooms, Showers, Convenience Store. Vault toilets → maintained, not 5. | [USFS LTBMU: Echo Lakes Trailhead](https://www.fs.usda.gov/r05/laketahoebasin/recreation/echo-lakes-trailhead-pct-access); [DBW f/726](https://dbw.parks.ca.gov/BoatingFacilities/f/726) |

### Spot 112: Morro Bay / Coleman Park (Central Coast)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | medium | "Located on the bay and a calm spot for launching kayaks and paddle boards right into the harbor." Beach entry; waterline ~22 m (~72 ft) south of the pin per OSM coastline geometry (corroborates the 2026-07-16 audit's finding). Beach + 50–150 ft carry → level 4 by its explicit "beach, carry 50-150 ft" clause. | [Morro Bay: Coleman Park & Beach](https://www.morrobay.org/directory/coleman-park-beach/); OSM coastline `way/479827627` (per `reports/coord-audit-2026-07-16.md`) |
| parking | 4 | **low** | OSM `way/324545790` (`fee=no`, unpaved) ~30 m from pin; `way/1311344793` street-side capacity 40 `fee=no`. **No published source for cost or fullness**; Morro Rock-area lots are heavily used. Free lot within 0.1 mi → 4; would be 5 if "rarely full" could be sourced. | [OSM way/324545790](https://www.openstreetmap.org/way/324545790); [OSM way/1311344793](https://www.openstreetmap.org/way/1311344793) |
| launch_traffic | 5 | medium | Beach launch straight into the harbor; **no slipway of any kind within 500 m** in OSM. The nearest ramp (Tidelands) is 1.9 km away per the audit. Paddler access, separate from any ramp, no trailer queue. | OSM Overpass (`leisure=slipway`, 500 m radius: zero results); [Morro Bay](https://www.morrobay.org/directory/coleman-park-beach/) |
| facility | 4 | medium | "There are public restrooms, basketball court, swing set for the kids"; park is "located along the Harbor Walk and bike path". OSM toilets `way/324545788` ~60 m. | [Morro Bay](https://www.morrobay.org/directory/coleman-park-beach/); [OSM way/324545788](https://www.openstreetmap.org/way/324545788) |

### Spot 120: Folsom Lake / Beals Point (Sacramento)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 3 | **low** | **There is no boat ramp at Beals Point** (see record flag R1). It is a swim beach; State Parks confirms "The Beals Point Snack Bar also rents beach equipment. The beach equipment includes kayaks, standup paddleboards, shade canopies, and rafts of all sizes" → a real, sanctioned hand-carry beach put-in. Natural shoreline → 3. **Carry distance is unsourced and varies with reservoir level** (State Parks, low water: "it is a long walk to the water's edge"). | [CA State Parks: Granite Bay and Beals Point](https://www.parks.ca.gov/?page_id=10916); [CA State Parks: Folsom Lake SRA Boat Launch Status](https://www.parks.ca.gov/?page_id=31951); [DBW: Folsom facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Folsom) |
| parking | 3 | high | "Beals Point Vehicle Day Use: $12.00". Paid entry → level 3 by definition. | [CA State Parks: Folsom Lake SRA](https://www.parks.ca.gov/?page_id=500) |
| launch_traffic | 5 | medium | No ramp at Beals Point, so no trailer queue at this put-in. The record's `power_boats: true` describes the main lake body, §1.2 is explicit that launch_traffic is "congestion **at the put-in**, not boat traffic out on the water." Folsom's actual ramps (Browns Ravine, Folsom Point, Granite Bay, Peninsula) are all elsewhere. | [CA State Parks: Boat Launch Status](https://www.parks.ca.gov/?page_id=31951); [DBW: Folsom facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Folsom) |
| facility | 4 | medium | OSM `way/1052614931` (`access=yes`, building) and `node/2448195623` (`toilets:disposal=flush`, `shower=yes`) ~50 m. State Parks: snack bar, "Barbecue pits, shade areas and large grassy areas", campground. | [CA State Parks](https://www.parks.ca.gov/?page_id=10916); [OSM node/2448195623](https://www.openstreetmap.org/node/2448195623) |

### Spot 135: Emeryville Marina (East Bay)

| Axis | Level | Confidence | Note | Source |
|---|---|---|---|---|
| launch_ease | 4 | medium | "a cement boat ramp with a high-freeboard dock". OSM slipway `node/1376995686`; nearest lot ~90 m → paved ramp with a longer carry. (A high-freeboard dock is poor for a board, but the rubric has no lever for that, see §Ambiguity A1.) | [SF Bay Water Trail: Emeryville Marina](https://sfbaywatertrail.org/trailhead/emeryville-marina/); [OSM node/1376995686](https://www.openstreetmap.org/node/1376995686) |
| parking | 3 | high | "Ample **paid** parking is available in large lots at the Marina. Parking is allowed for up to 24 hours. Free 4-hour parking is provided in the further west parking lots, along the shoreline park, between 7AM and 10PM." Paid at the ramp → 3. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/) |
| launch_traffic | 3 | **low** | "used by both motorized and non-motorized boaters"; shared cement ramp inside an active marina complex (Safe Harbor Emeryville + Emery Cove Yacht Harbor). Intensity unsourced. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/) |
| facility | 4 | high | "An ADA portable restroom is located approximately 50 feet from the boat ramp, while full service restrooms are located centrally within the Marina complex, approximately 900 feet west from the boat ramp." OSM `way/304638421` `operator=City of Emeryville`, `access=yes`, flush. | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/); [OSM way/304638421](https://www.openstreetmap.org/way/304638421) |

Also relevant: OSM `way/921786808` is a second, paddler-specific slipway ~400 m north, *"Slipway for small kayaks, small rafts, surfboards. Access from foot trail only. May get 4' deep at hightide"*, `motor_vehicle=no`, `incline=4%`. This is the "boardsailer water-access path" in our notes. It would score launch_traffic 5 and launch_ease 3 (foot-trail-only carry), **a different score for the same spot record**, which is the multiple-launches problem the audit raised as cross-cutting finding #4.

---

## Which axes were hardest to source

Ranked worst to best.

**1. launch_traffic (0.15), effectively unsourceable. This is the pilot's most reproducible finding.**
Every level in §1.2 is defined by *use intensity*: "light use", "moderate use", "a real queue at peak times", "trailer traffic dominates". **No agency publishes how busy its ramp is.** I got a level for 9 of 10 spots, but **6 of those 9 are `low` confidence**, and in each the sourced fact was only *"motorized and non-motorized both use this launch"*, which by itself spans levels 2, 3, and 4. I could source the *structure* (is there a ramp? is the paddler entry separate from it?) but never the *congestion*.

The three `medium`-confidence launch_traffic levels (45, 112, 120) are precisely the ones where the answer is structural, **no ramp exists**, therefore no queue. That is the only launch_traffic question this rubric can actually answer from public sources. Per §0.2 ("The rubric must actually be applied. A published rubric decorating a vibes score is deception"), **the intensity gradations of launch_traffic are not appliable at all** and would be decoration if shipped.

**2. parking (0.30), sourceable for cost, not for availability.**
Cost is usually published and is reliable (Miller free, China Camp $5, Beals Point $12, Emeryville paid). But levels 4 and 5 both require an availability judgment, *"rarely full"*, *"typically available"*, and levels 2 and 3 require *"fills on summer weekends"* / *"frequently full"*. **No source states this for any of the 10 spots.** §1.2 admits it ("`has_fee` correlates weakly... does not separate 3 from 5") but the level definitions still demand exactly that separation. In practice the axis degrades to a proxy for "is it paid?", which is already `has_fee` in `spots.json`, a field the app has for free.

**3. launch_ease (0.40), sourceable but non-discriminating.** See §"Why the spread collapsed". Ramp/dock/beach existence is well sourced (agency pages + OSM `leisure=slipway` + DBW type). Carry distance is rarely published: only Alviso (110 ft), China Camp (~600 ft) and Emeryville (~50 ft to a restroom, not to water) gave figures. Everything else came from OSM geometry, fine at `medium`, but the *level boundaries are drawn on exactly the quantity that isn't published*.

**4. facility (0.15), the best-sourced axis, and the most compressed.** Restroom presence is nearly always published. But 7 of 10 came back `4` and none came back 1 or 2. Nothing in the sample was neglected. The axis is real but has no variance.

---

## Where the rubric wording was ambiguous

**A1. launch_ease level 5 is a four-part conjunction, and "carry under 50 ft" makes it unreachable.**
> "5: Paved ramp or dock, gentle grade, carry under 50 ft, tide-independent."
> "4: Improved but unpaved... or a paved ramp with a longer carry."

Nothing in the sample scored 5. 50 ft is about three car lengths; no real parking lot reaches the water that closely. Combined with level 4's unbounded catch-all ("a paved ramp with a longer carry", 80 ft and 800 ft are both "longer"), **every developed launch in the Bay Area collapses onto 4.** The heaviest axis has one value. This single wording choice is most of why the spread died.

**A2. parking levels 4 and 5 mix an objective fact with an unpublished one.**
> "5: Dedicated free lot at the launch, rarely full."
> "4: Free street or lot within < 0.1 mi, typically available."

"Dedicated free lot at the launch" is checkable. "Rarely full" is not. When both conditions must hold and only one is sourceable, is the answer 5, 4, or null? I chose 5 with `medium` confidence where the lot was free and at the launch (1, 38, 63, 84), and 4 for Morro Bay only because I had OSM geometry rather than an agency statement. **Researcher A could reasonably have called all of those 4 or all of them null.** I expect this to be our largest divergence, and it is a wording problem, not a researcher problem.

**A3. "beach" appears in both level 3 and level 4 of launch_ease, split only by the unpublished quantity.**
> "4: Improved but unpaved. Graded gravel/dirt or **beach, carry 50-150 ft**"
> "3: Natural shoreline. **Sand/gravel beach** or bank, carry 150-300 ft"

The same physical descriptor sits in two levels, differentiated purely by carry distance, the thing sources don't publish. Morro Bay (beach, ~72 ft) → 4; China Camp (beach, 600 ft from the hilltop lot but adjacent to the village lot) → 3. **Those two calls are barely more principled than a coin flip**, and they differ by a full level on the 0.40 axis.

**A4. China Camp exposes a "which parking lot" hole.** The Water Trail measures ~600 ft from the *hilltop paved* lot; the ~30-vehicle *village* lot is adjacent to the beach. §1.2 says "Car to water, with a board" but never says *which* car park when a site has several, or whether to use the nearest, the largest, or the one you'll actually get on a Saturday. This changes China Camp's launch_ease between 2 and 4.

**A5. Tide-dependence has no stated aggregation rule.** §1.2 says `tide_sensitive: true` "pushes toward 2-3 unless notes describe a floating dock." But China Camp is a **gravel beach (3) at mid-to-high tide and a mudflat (2) at low tide**, the same put-in, two levels, depending on when you arrive. The rubric never says whether to score the best case, the median, or the worst. §1.2 also says "tide-dependence counts here as access... Describe it, do not warn about it," which settles the *tone* but not the *number*.

**A6. `round(..., 1)` is underspecified at the .x5 boundary, and it bit 2 of 10 spots.** Spots 38 and 112 both compute to raw 4.15. Python's `round(4.15, 1)` → `4.1` (binary float), a decimal half-up → `4.2`. §1.4 mandates a single pure function (`lib/paddleScore.ts`) reading the same weights as the rubric doc; TypeScript's `Math.round(4.15*10)/10` → `4.2`, **so the spec's own reference formula and its mandated implementation would disagree on 20% of this sample.** Worth fixing if item 39 survives in any form.

**A7. launch_traffic level 5 rewards the absence of infrastructure.** "Paddler-oriented access, separate from any ramp" is satisfied by a site that has *no ramp at all* (120, 112, 45) just as much as by a purpose-built paddler dock. Beals Point scores 5 on launch_traffic because State Parks never built a ramp there. That is defensible on the literal wording, but it means the axis rewards under-development, and it is the mechanism behind the negative correlation in §"Why the spread collapsed" point 3.

---

## Records I suspect are wrong

The audit's cross-cutting finding #1 recommended two cheap screens: (a) does the coordinate reverse-geocode to a road/trail/centroid, and (b) does an authoritative registry confirm the facility type. **I ran both against all 10 pilot spots. Both fired, on spots that were never flagged by item 40.**

Reverse-geocode of all 10 stored pins:

| id | Reverse-geocodes to | Read |
|---|---|---|
| 1 | `highway/service`, Alviso Marina | on the ramp, good |
| 38 | `amenity/parking`, Miller Boat Launch | at the launch, good |
| 45 | `amenity/parking`, North San Pedro Road | near village, acceptable |
| 48 | `leisure/slipway`, Fountaingrove Parkway | on the ramp, good |
| **63** | `amenity/parking`, **"F G H I lots"**, Marina Blvd | **marina centroid, not a put-in** |
| 84 | `amenity/parking`, Doolittle Beach Staging Area | at the launch, good |
| 104 | `amenity/boat_storage`, near Echo Chalet | on the chalet apron, good |
| 112 | `amenity/parking`, Coleman Drive | park centroid, water 22 m, acceptable |
| **120** | `amenity/drinking_water`, **American River Bike Trail** | **on a bike trail** |
| **135** | `building/yes`, **"3310;3320 Powell Street"** | **on a building** |

### R1. Spot 120 (Folsom / Beals Point): the notes assert a ramp that does not exist. Highest-severity finding.

Our notes: *"Beals Point has a ramp, beach, and parking."*

Three independent primary sources say there is no ramp at Beals Point:
1. **DBW types "Folsom Lake SRA (Beal's Point)" as `No Facility`**, while listing "Folsom Lake SRA (Brown's Ravine - 2 Ramps)", "(Peninsula - New Ramp)", "(Peninsula - Old Ramp)" as `Launch`. This is exactly the registry test that independently flagged spots 76 and 88.
2. **CA State Parks' own Folsom Lake SRA Boat Launch Status page names 14 launches. Beals Point is not among them.** (Open motorized: Browns Ravine, Folsom Point, Granite Bay Stage 3, Granite Bay Stage 4. Open hand-launch: Black Miners Bar, Browns Ravine-Hobie Cove, Nimbus Flat, Peninsula North, Rattlesnake Bar, Willow Creek. Closed: Granite Bay Stages 1/2, Granite Bay Low Water, Peninsula South.)
3. **OSM maps no `leisure=slipway` within 2,500 m of the pin.** Within 2.5 km the only named features are "Beals Point Campground" (15 m from the pin) and "Beals Point Kiosk" (151 m).

The stored pin sits **15 m from the campground**, reverse-geocodes to a drinking fountain on the American River Bike Trail, and is not at any launch.

**This is not a fabricated spot.** Beals Point is a real, sanctioned SUP put-in: State Parks says the snack bar rents "kayaks, standup paddleboards, shade canopies, and rafts." So unlike spot 79, the place exists and paddling there is legal. **But the specific factual claim in our notes, "has a ramp", is false**, and it is the same failure class the audit named: a plausible-sounding specific that no source supports. Recommend correcting the notes to describe a beach hand-carry, and re-pinning to the beach.

Also on 120: `rentals_available: false`, but State Parks says the Beals Point Snack Bar rents kayaks and SUPs. Likely wrong, and it is the mirror image of the spot-96 `rentals_available` defect the audit found.

### R2. Spot 1 (Alviso): `tide_sensitive: false` contradicts both the notes and the agency, and the tide numbers echo spot 79's fabricated pattern.

- The record says `tide_sensitive: false`, but its **own notes** say *"Tidal range runs 9-10 feet."* The SF Bay Water Trail states *"Mudflats become exposed during low tides which can cause boaters to get stranded."* **The field contradicts the notes on the same record.** `tide_sensitive` should be `true`.
- The notes say *"push off about an hour before low."* **Launching an hour before low tide on a South Bay slough is close to the worst possible advice**, it maximizes the chance of returning to exposed mudflat, which is the specific hazard the Water Trail warns about. The Water Trail publishes no tidal window and no tidal range; neither claim is corroborated.
- **The audit found spot 79's notes claimed "1.5 mph / 9-to-10-foot tidal figures" that "could not be corroborated."** Spot 1's notes carry the **same uncorroborated "9-10 feet" figure**. Spot 79 was the fabricated record. **That phrasing appearing on a second spot suggests the generator emitted a house tidal boilerplate rather than a researched fact**, worth grepping `spots.json` for across all 140.

### R3. Spot 84 (MLK): the notes merge two sites ~4 km apart.

Notes: *"ADA-accessible paddle craft dock on San Leandro Bay with a free two-lane launch off Doolittle Drive... Tidewater Boating Center **on site** offers rowing and kayak programs."*

EBRPD's page places these separately: the two-lane launch is at **7250 Doolittle Dr** (our pin), while the **ADA-accessible paddle craft dock** and Tidewater Boating Center are at **4675-A Tidewater Ave**, described as "located off Tidewater Avenue... on the shore of the Oakland Estuary." Tidewater is *not* "on site" at Doolittle. The Doolittle launch did get a *"renovated ADA-accessible boat, kayak and paddleboard launch area"*, so an ADA claim at the pin is defensible, but the paddle craft **dock** and the boating center belong to a different location. Another instance of the audit's cross-cutting finding #4 (one record, several distinct launches).

Also live as of the scoring date: **"Right Dock (south side - Doolittle fishing pier) is closed. Pilings are in need of replacement. Updated July 16, 2026."**

### R4. Spot 63 (Berkeley Marina): pin is a marina centroid; the described put-in is 400–700 m away.

The stored pin reverse-geocodes to **"F G H I lots"** (OSM `access=customers`), a hotel-adjacent parking area. Distances from the pin: nearest slipway **405 m**; "Launch Ramp Public Parking" **477 m**; the nearest mapped `natural=beach` **707 m**. The notes say *"Launch from the public beach"*, and the SF Bay Water Trail's designated site is the **Berkeley Marina Small Boat Launch** at 201 University Ave, in the South Sailing Basin.

**The pin is not at any of them.** Same provenance signature the audit identified: an automated geocode of a facility name, never an observed put-in. I scored 63 against the Water Trail site and flag that **the levels are graded against a location the pin does not point to**, which §4.3 explicitly says matters ("launch ease and parking are graded against where the pin sits").

### R5. Spot 135 (Emeryville): pin sits on a building; marina has been renamed.

Pin reverse-geocodes to **building "3310;3320, Powell Street"**. The cement ramp is ~180 m SE; the paddler slipway is ~400 m N. Separately, OSM `way/1528658663` names the facility **"Safe Harbor Emeryville"** with `old_name=Emeryville Marina`, our record still uses the old name. Not urgent, but it is the same "record named for the wrong/stale facility" class as spot 88.

### R6. Spot 38 (Miller): `$5 parking` in the notes is stale.

Notes: *"two-lane ramp, $5 parking."* **Marin County Parks' own page: "There is a large parking lot at the boat launch. Parking is free."** OSM `node/7348252615` still carries `charge=5 USD/day` (stale too). `has_fee: false` is already correct, so the structured field is right and only the prose is wrong. Worth noting that **OSM agreed with our stale value**, a caution for any pipeline that treats OSM tags as authoritative on fees.

### R7. Spot 48 (Nagasawa): wrong water-body description.

Notes: *"small waterway in the **Sonoma County creek system**... Water can run low in late summer."* OSM puts **Fountaingrove Lake** (`natural=water`, `water=reservoir`, `wikidata=Q5474836`) 255 m from the pin, and the City of Santa Rosa's facility record lists the feature as **"Pond / Lake"**, not a creek. It is a reservoir in an urban park, not a creek. Low confidence on severity, but the description does not match the water body.

### R8. Spot 104 (Echo Lakes): `fee_amount: 7` looks wrong.

Record: `has_fee: true, fee_amount: 7`. **Echo Chalet publishes "$10.00 For non-motorized watercraft utilizing the boat ramp or harbor"** (and $40 for trailered/motorized). $7 matches neither. Also `inspection_required: true`, but the chalet's wording is *"all **motorized** watercraft must be either inspected at the Meyers Boat Inspection station or have an intact Echo Lake seal"*, inspection may not apply to a paddleboard at all. Both are user-facing claims on a spot page.

---

## Process note (§4.2): where a search summary would have laundered a falsehood

Two live examples from this pilot, both caught only by insisting on the primary page:

1. **Spot 38's fee.** A search summary returned: *"Parking is free... However, there is conflicting information... An older source from 2023 states that parking costs $5."* Had I scored from that, I'd have hedged or kept the $5. The archived Marin County Parks page states plainly: *"Parking is free."* **Primary source resolved what the summary muddled.**
2. **Spot 120's ramp.** A search summary about Folsom said *"Camping is available year-round at Beals Point Campground"* and listed ramp closures generally, it never says Beals Point has no ramp, and our notes assert one. Only DBW's `No Facility` type and State Parks' actual launch list disproved it.

This is the §4.2 failure mode in miniature, and the mitigation worked. **But note the cost: it took ~40 primary-source fetches, several agency sites blocked by Cloudflare (Marin, requiring the Wayback Machine) or returning 403/404 to a plain fetch (EBRPD, Emeryville), and two Overpass timeouts, to produce 38 sourced levels and 2 honest nulls.** §1.5 prices a full pass at 12–18 hrs for 142 spots. Extrapolating this pilot's actual effort, that estimate looks low by a wide margin, and it buys a number with a 0.8-point range.

---

## Recommendation

**Cut item 39 as currently specified.** The §4.1 kill criterion was set before results specifically so it could not be rationalized afterward, and it is met on both tests with room to spare (spread 0.80 vs 1.5; 9 of 9 in one band vs 7 of 10). The pilot did its job: it returned "this doesn't work," which §4.1 named as a real possible outcome.

Three findings compound beyond the raw spread, and each is independently sufficient:

1. **The score does not discriminate.** 3.5 to 4.3, with 4 of 9 spots at 3.6. A user cannot act on that. §0.1 predicted "every spot lands at 3.5-4.5 and the score is decoration," and that is precisely what happened.
2. **The rubric cannot be applied as written on the axis it most depends on.** launch_traffic's levels are defined by congestion nobody publishes; 6 of 9 came back `low` confidence. §0.2 is explicit: *"The rubric must actually be applied. A published rubric decorating a vibes score is deception, and git history proves it."* Shipping launch_traffic's intensity gradations would violate that requirement directly. Parking has the same problem at the 4/5 boundary (§Ambiguity A2).
3. **Per §0.2, low-confidence axes surface to the owner rather than shipping.** 8 of 38 sourced levels are `low`, spread across 7 of the 10 spots. At that rate most spots would be escalations, not ships.

**What I would keep instead**, all of which the pilot produced for free:

- **The audit's two screens, run over all 142 spots as a data-quality job.** Reverse-geocode + DBW facility type took minutes per spot and found four record defects (R1, R3, R4, R5) in a 10-spot sample that was *deliberately chosen to exclude* the known-bad records. **That hit rate on a supposedly clean sample is the most actionable thing in this report**, and it strengthens the audit's cross-cutting finding #3 (item 45 should stay blocked) considerably.
- **Facts, not ratings, in `notes`.** "Free lot at the launch, two-lane ramp, ADA restroom" is more useful to a paddler than "4.1 score", is a checkable claim rather than an implied verdict, is cheaper to research, and carries none of the §0.1 legal exposure. This is the same home §0.1 already chose for the cut wind axis: *"descriptive prose in the spot's notes... a fact about the place, not a rating that implies a safety verdict."*
- **`has_fee` already carries most of the parking signal** the score would add, and the app has it today at zero cost.

If the owner still wants a score, the only version I'd expect to discriminate is one built on the axis that actually varied and was well-sourced: **launch type** (paddler dock / paved ramp / beach / no formal access), sourced from DBW type + OSM `leisure=slipway` + the agency page. That is one axis, three sources, no congestion guessing, and it is close to what `difficulty` already encodes. I'd want a fresh kill criterion set on it before any research spend.

---

## Sources

Agency and primary pages: [SF Bay Water Trail: Alviso Marina](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) · [SF Bay Water Trail: China Camp](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) · [SF Bay Water Trail: Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) · [SF Bay Water Trail: Emeryville Marina](https://sfbaywatertrail.org/trailhead/emeryville-marina/) · [Marin County Parks: Miller Boat Launch (Wayback 2026-02-07)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) · [Friends of China Camp: Activities](https://friendsofchinacamp.org/visit-the-park/activities/) · [City of Santa Rosa: Nagasawa Community Park](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76) · [EBRPD: MLK Jr. Regional Shoreline](https://www.ebparks.org/parks/martin-luther-king) · [EBRPD: Doolittle Bay Trail expansion](https://www.ebparks.org/about-us/whats-new/news/new-doolittle-bay-trail-expansion-brings-improved-safety-and-access-martin) · [Echo Chalet](https://www.echochalet.com/) · [Echo Chalet Services](https://echochalet.net/echo-chalet-services/) · [USFS LTBMU: Echo Chalet](https://www.fs.usda.gov/r05/laketahoebasin/recreation/echo-chalet) · [USFS LTBMU: Echo Lakes Trailhead](https://www.fs.usda.gov/r05/laketahoebasin/recreation/echo-lakes-trailhead-pct-access) · [Morro Bay: Coleman Park & Beach](https://www.morrobay.org/directory/coleman-park-beach/) · [CA State Parks: Folsom Lake SRA](https://www.parks.ca.gov/?page_id=500) · [CA State Parks: Granite Bay and Beals Point](https://www.parks.ca.gov/?page_id=10916) · [CA State Parks: Folsom Lake SRA Boat Launch Status](https://www.parks.ca.gov/?page_id=31951)

Registries and geodata: [DBW: Tomales Bay facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Tomales%20Bay) · [DBW: Folsom facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Folsom) · [DBW: Echo Chalet f/726](https://dbw.parks.ca.gov/BoatingFacilities/f/726) · OpenStreetMap via [Overpass API](https://overpass-api.de/) (ODbL) · [Nominatim](https://nominatim.openstreetmap.org/) reverse geocoding

Internal: `docs/specs/item-39-paddle-score.md` · `reports/coord-audit-2026-07-16.md` · `data/spots.json`
