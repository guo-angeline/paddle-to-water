# Paddle score pilot: Researcher A

**Date:** 2026-07-16
**Rubric:** v2 (put-in only), per `docs/specs/item-39-paddle-score.md` §1.2
**Scope:** 10 spots (ids 1, 38, 45, 48, 63, 84, 104, 112, 120, 135), scored independently
**Status:** research only. `data/spots.json` was NOT modified.

---

## Headline

**The kill criterion in §4.1 is met, on both prongs.**

- Observed spread: **1.1 points** (3.6 to 4.7). The threshold to survive was 1.5.
- **8 of the 9 scorable spots** fall inside a single 1.0-wide band (3.6-4.6). The threshold to survive was fewer than 7 of 10.

The spec predicted this outcome almost exactly. §0.1 asked: "does a put-in-only score actually discriminate? If parking and ramp quality are broadly fine across the Bay Area, every spot lands at 3.5-4.5 and the score is decoration." Nine spots, deliberately chosen to span the range, landed between 3.6 and 4.7.

**Recommendation: cut item 39 as specified, or rethink it as something other than a 1-5 score.** Detail in §4.

A second finding, independent of the score: **spot 120's core factual claim is wrong**, in the same way the audit found for 76/79. And **spot 63's pin is not at a launch**. Both in §5.

---

## 1. Scores

| id | Spot | Launch ease | Parking | Traffic | Facility | **Score** | Capped |
|---|---|---|---|---|---|---|---|
| 38 | Miller Boat Launch, Marshall | 5 | 5 | 3 | 5 | **4.7** | no |
| 1 | Alviso Marina, Alviso | 4 | 5 | 4 | 5 | **4.5** | no |
| 84 | MLK Jr. Shoreline, Oakland | 4 | 5 | 3 | 4 | **4.2** | no |
| 104 | Echo Lakes, Echo Lake | 5 | 3 | 3 | 5 | **4.1** | no |
| 63 | Berkeley Marina, Berkeley | 4 | 4 | 4 | 4 | **4.0** | no |
| 112 | Morro Bay, Morro Bay | 3 | 4 | 5 | 4 | **3.8** | no |
| 135 | Emeryville Marina, Emeryville | 5 | 3 | 2 | 4 | **3.8** | no |
| 45 | China Camp, San Rafael | 3 | 3 | 5 | 5 | **3.6** | no |
| 120 | Folsom Lake (Beals Point) | 3 | 3 | 5 | 5 | **3.6** | no |
| 48 | Nagasawa Park, Santa Rosa | 4 | **null** | **null** | 4 | **null** | n/a |

No spot hit the access floor (`launch_ease == 1`), so the cap never fired.

**Spot 48 is unscorable.** Parking and launch-area traffic have no source. That is a reported success under §4.2's rule, not a failure: see §3.

### Confidence summary

| Confidence | Axis count (of 40) |
|---|---|
| high | 8 |
| medium | 19 |
| low | 11 |
| unknown (null) | 2 |

**11 low-confidence axes out of 38 sourced (29%).** Per §4.2, low-confidence axes surface to the owner rather than shipping. At that rate a 142-spot pass produces roughly 160 axes needing owner review, which is most of the way to just doing the research by hand.

---

## 2. Per-spot detail

### Spot 1: Alviso Marina / Alviso Slough, Alviso. Score 4.5

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 4 | medium | "two concrete boat launch ramps and two floating docks"; "The path of travel from the parking lot to the launch is flat and paved" | [SF Bay Water Trail: Alviso Marina](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) |
| Parking | 5 | medium | "two parking lots in the park, including one near the launch facility with boat-trailer-sized parking spaces. Parking is free with no time limits during regular park hours." OSM corroborates 46- and 28-space asphalt lots | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/); [OSM way/306337656](https://www.openstreetmap.org/way/306337656) |
| Launch traffic | 4 | **low** | "Motorized and non-motorized boats both use the launch." Two ramps plus a rigging area. **Use level not sourced** | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) |
| Facility | 5 | high | "The restroom (ADA-accessible) is located near the entrance to the park and has flush toilets"; picnic tables, BBQs, drinking fountain, boat rigging and washing area, "safety and informational signs such as tide charts, and interpretive signs" | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) |

OSM `way/499727799` `leisure=slipway name="Alviso Marina"` sits on the stored coordinate. Pin is good.

**Launch ease held at 4, not 5, because of a rubric conflict I could not resolve.** §1.2's level 5 requires "tide-independent", and a floating dock is the rubric's own named example of tide-independent access, which argues 5. But the record's notes describe a 9-10 ft range and "push off about an hour before low", which describes a tide window. `tide_sensitive` is `false` in the record, contradicting its own notes. See §3.

### Spot 38: Miller Boat Launch, Marshall. Score 4.7

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 5 | medium | Two-lane ramp plus dock; county rules say "For safety, walk only on docks and piers" and "Do not block boat ramp". Paved lot ~70 m from the ramp | [Marin County Parks: Miller Boat Launch (archived 2026-02-07)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch); [OSM node/4878780335](https://www.openstreetmap.org/node/4878780335) |
| Parking | 5 | **medium, conflicted** | Operator states: "There is a large parking lot at the boat launch. **Parking is free.**" **OSM and our own notes say $5/day.** See flag below | [Marin County Parks (archived)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch); conflicting: [OSM node/7348252615](https://www.openstreetmap.org/node/7348252615) `fee=yes charge="5 USD/day"` |
| Launch traffic | 3 | **low** | Shared two-lane ramp; rules address ramp blocking and shoreline-fisher/boat conflict. **Use level not sourced** | [Marin County Parks (archived)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) |
| Facility | 5 | medium | "Keep the boat launch litter-free. Use garbage cans provided"; extensive posted rules; "Open sunrise to sunset"; toilets mapped at the ramp | [Marin County Parks (archived)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch); [OSM node/4878780336](https://www.openstreetmap.org/node/4878780336) |

**Fee conflict, flagged for the owner.** Marin County Parks' own page says parking is free. OSM tags a $5/day fee, and `spots.json` notes say "$5 parking". On the rubric this is a 5-vs-3 swing, i.e. 0.6 points of the final score, decided by which source you trust. I went with the operator. **Note the operator page is only reachable via the Wayback Machine: parks.marincounty.gov is behind Cloudflare and blocks automated fetches.** A 142-spot pass would hit this repeatedly.

Marin's own page also publishes the launch coordinate as `38.20010862841114, -122.92159267930528`, which corroborates the audit's "false positive, leave it alone" verdict on this spot.

### Spot 45: China Camp, San Rafael. Score 3.6

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 3 | high | "a sand and pebble beach that extends 0.25 miles, with a designated boat launch area located in the southern portion of the village area parking lot". But: "Extensive mudflats are exposed at low tides. Boaters need to plan to launch and land only during high to mid tides" | [SF Bay Water Trail: China Camp](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |
| Parking | 3 | medium | "The main village parking lot is compact dirt and gravel, with space for ~30 vehicles. Additional paved parking is located on the hill above the beach and village area... approximately 600 feet from the boat launch area" | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |
| Launch traffic | 5 | high | "China Camp State Park offers an exceptionally scenic setting for **non-motorized boating**"; beach launch, no ramp, no trailers | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |
| Facility | 5 | high | "Restrooms with running water, changing rooms, and a boat wash are at the south end of the parking area"; "Recent ADA enhancements have been made, including parking and restrooms"; "China Camp is staffed by rangers and seasonal volunteers every day"; weekend snack shop | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) |

**Launch ease 3 vs 2 is a live judgment call.** §1.2 level 2 is "Difficult footing. Mudflat..."; level 1 is "usable only at a narrow tide window". China Camp is a clean sand-and-pebble beach with a marked launch area, which reads 3, but it is unusable at low tide, which reads 2 or lower. I read "high to mid tides" as roughly half the cycle, i.e. not narrow, so 3. **I would not be surprised if Researcher B says 2.** That is a rubric-wording problem: see §3.

The Water Trail page corroborates the audit's finding that the notes' tide warning is real and understated ("At low tides, mudflats can extend several hundred yards offshore and make returning to the beach infeasible"). The record's notes mention getting stuck, not being unable to return.

### Spot 48: Nagasawa Park, Santa Rosa. Score **null**

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 4 | medium | City lists "Boat Ramp" among amenities; OSM slipway 15 m from the pin. Non-tidal pond. **Ramp surface, grade, and carry distance not stated anywhere** | [City of Santa Rosa: Nagasawa Community Park](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76); [OSM node/5817093285](https://www.openstreetmap.org/node/5817093285) |
| Parking | **null** | **unknown** | City states only "Parking" and "Parking lot entrance is on Fountaingrove Parkway". No count, no fee, no distance. OSM maps no parking here. **No source, no level.** | none |
| Launch traffic | **null** | **unknown** | No source states motor rules, ramp sharing, or use levels for this pond. Not a DBW facility. Santa Rosa's park rules page has no watercraft provisions. **No source, no level.** | none |
| Facility | 4 | medium | City amenity list: "Boat Ramp, Fishing, Parking, Picnic Tables, Pond / Lake, Restrooms, Trails" | [City of Santa Rosa](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76) |

**Score is null; parking and launch-area traffic blocked it.**

This is the pilot working as designed. Nagasawa is a small municipal park on Fountaingrove Lake. It is not in the DBW registry ([Santa Rosa lists only Howarth Park and Spring Lake](https://dbw.parks.ca.gov/BoatingFacilities/City/Santa%20Rosa)), not an SF Bay Water Trail site, and OSM has one bare `leisure=slipway` node with no tags beyond that. **There is simply no public document that answers two of the four axes.** No amount of searching fixes this; the information does not exist online.

The record's ramp claim itself is corroborated (city + OSM agree), so this is not a spot-79-style fabrication. But it shows the sourcing floor: **the app's 142 spots are not 142 Water Trail trailheads.** The ten pilot spots are unusually well documented and one of them still came back unscorable.

Minor notes flag: the record describes "a small waterway in the Sonoma County creek system." The city calls it "Pond / Lake." It is a reservoir, not a creek.

### Spot 63: Berkeley Marina, Berkeley. Score 4.0. **Pin is not at a launch, see §5**

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 4 | **low** | "three public docks, two small boat hoists, and windsurfing rigging area"; "A beach launch is also available at the adjacent Shorebird Park"; "The gangways to the docks are not currently accessible". Graded against the Small Boat Launch, **not** the stored pin | [SF Bay Water Trail: Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |
| Parking | 4 | medium | "There is a large unpaved parking lot located at the top of the docks. Parking is free from 6AM – 10PM, with no overnight parking allowed." Held at 4 not 5 because the same page calls the area "highly popular" | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |
| Launch traffic | 4 | medium | Paddler-oriented site in the South Sailing Basin, structurally separate from the trailer ramp ([which is a distinct Water Trail site](https://sfbaywatertrail.org/trailhead/berkeley-marina-ramp/), "used primarily by motorized boats and can get crowded on weekends"). Not 5 because: "be aware of student sailors, novice windsurfers, and swimmers in the South Sailing Basin" | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |
| Facility | 4 | medium | "three portable restrooms... at Cal Adventures as well as two accessible restrooms located in Shorebird Park"; "path of travel... appear to be well designed and maintained". Not 5: restrooms at the launch are portable, lot is unpaved, and the ADA gangway is "planned", not built | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) |

**All four axes graded against a launch the pin does not sit on.** See §5.

### Spot 84: MLK Jr. Regional Shoreline, Oakland. Score 4.2

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 4 | **low** | EBRPD: "Continuing on Doolittle Drive will bring you to a boat ramp, reservable picnic areas, and fishing piers." OSM slipway 57 m from a paved staging lot. Not 5: the record's `tide_sensitive: true` is unresolved against any source, and §1.2 says that pushes toward 2-3 absent a tide-independent dock at *this* put-in | [EBRPD: Martin Luther King Jr. Regional Shoreline](https://www.ebparks.org/parks/martin-luther-king); [OSM node/2427025918](https://www.openstreetmap.org/node/2427025918) |
| Parking | 5 | medium | EBRPD, verbatim, "Fees / Parking: No fees*" (*"$40 per vehicle" for Coliseum events). OSM maps "Doolittle Beach Staging Area", asphalt, at the ramp | [EBRPD](https://www.ebparks.org/parks/martin-luther-king); [OSM way/28339066](https://www.openstreetmap.org/way/28339066) |
| Launch traffic | 3 | **low** | Shared boat ramp with adjacent fishing piers. **Use level not sourced.** `power_boats` is `null` in the record and I found no primary page stating motor rules at the Doolittle ramp | [EBRPD](https://www.ebparks.org/parks/martin-luther-king) |
| Facility | 4 | medium | "Wheelchair access in the park includes parking, curb cuts, paved trails, fishing access, restrooms, drinking fountains, and a marsh overlook platform"; posted seasonal hours. Not 5: nearest mapped restroom is ~430 m from the ramp, and there is a live closure at the site | [EBRPD](https://www.ebparks.org/parks/martin-luther-king) |

**Live closure, worth knowing:** EBRPD's page, updated the same day as this pilot, reads: "Right Dock (south side - Doolittle fishing pier) is closed. Pilings are in need of replacement. Updated July 16, 2026." That is the fishing pier, not the launch, so I did not let it drive the facility level. **But it is a good illustration of why a static researched score decays:** this score was computed on a day when part of the site is shut, and nothing in the proposed data model would ever notice.

**Record conflates two launches, see §5.**

### Spot 104: Echo Lakes, Echo Lake. Score 4.1

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 5 | medium | DBW types Echo Chalet "Marina/Launch", access "Public"; chalet: "Marine Services & Pier – boat launching". OSM slipway ~45 m from a mapped 20-space lot. Non-tidal | [DBW facility 726](https://dbw.parks.ca.gov/BoatingFacilities/f/726); [Echo Chalet](https://echochalet.net/); [OSM way/1252551204](https://www.openstreetmap.org/way/1252551204) |
| Parking | 3 | **low** | OSM maps one ~20-space lot at the ramp plus several street-side stretches. **Fee and fullness not sourced** (the record's `fee_amount: 7` is a prior, not an answer) | [OSM way/534039220](https://www.openstreetmap.org/way/534039220) |
| Launch traffic | 3 | **low** | Shared ramp with motorized craft, plus a water-taxi operation off the same pier ("Store, Boat ramp and taxi hours are 9 am to 5 pm daily"). **Use level not sourced** | [Echo Chalet](https://echochalet.net/) |
| Facility | 5 | medium | DBW lists restrooms, showers, snack bar, lodging, oil disposal, sewage/bilge pumpout. Staffed commercial operation | [DBW facility 726](https://dbw.parks.ca.gov/BoatingFacilities/f/726) |

**Unmodelled access constraint:** the ramp is open "9 am to 5 pm daily". The rubric's launch-ease axis models tide windows but has no slot for an operating-hours window, which at Echo is a harder constraint than any tide. Spot 1 has the same shape (gates close at sunset) and spot 38 too (sunrise to sunset).

### Spot 112: Morro Bay (Coleman Park), Morro Bay. Score 3.8

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 3 | **low** | City confirms a beach, "Coleman Beach", described as "Adjacent to Coleman Park at the north end of the Embarcadero." **No agency source describes it as a launch.** Graded as natural shoreline; carry distance not sourced | [City of Morro Bay: Beach Information](https://www.morrobayca.gov/187/Beach-Information); [City of Morro Bay: Coleman Park](https://www.morrobayca.gov/376/Coleman-Park) |
| Parking | 4 | medium | OSM maps a free unpaved lot ~28 m from the pin at Coleman Park, plus additional free lots and 40 free street-side spaces within 0.25 mi. Fullness not sourced | [OSM way/324545790](https://www.openstreetmap.org/way/324545790) |
| Launch traffic | 5 | medium | Beach launch with no ramp. DBW's Morro Bay registry enumerates the bay's launches ("Morro Bay Public Launch Facility" type Launch; "Morro Bay Kayak Ramp - Kayak Shack" type Boating Access; "Morro Bay - Tidelands Park") and **Coleman is not among them**, and no ramp means no trailer queue | [DBW: Morro Bay facilities](https://dbw.parks.ca.gov/BoatingFacilities/City/Morro%20Bay) |
| Facility | 4 | medium | City: "There is also a basketball court, perfect for pick-up games and a children's swing set"; picnic areas, BBQ, ~9-acre developed park. **Restroom at Coleman not confirmed from a primary page** (nearest mapped toilet is ~330 m away, at the Morro Rock lot) | [City of Morro Bay: Coleman Park](https://www.morrobayca.gov/376/Coleman-Park) |

**Notable negative result.** The City of Morro Bay's own Coleman Park page lists the park's amenities in full and **never mentions a boat launch, kayak launch, or water access**. DBW's registry doesn't list Coleman either. OSM maps no beach polygon and no slipway on the bay side of Coleman Park. The record's claim, "Coleman Park's small beach gives the easiest entry at any tide level", is therefore **not corroborated by any primary source I could reach**, only by the tourism site morrobay.org, which the audit already used and which is not an agency.

I did not mark this a fabrication: the beach exists per the city, and the audit independently established that the park's southern edge shares nodes with the bay coastline ~22 m away. But the strongest claim in the record is the one I could not source. **Recommend an owner spot-check.**

### Spot 120: Folsom Lake (Beals Point), Folsom. Score 3.6. **Record claim is wrong, see §5**

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 3 | **low** | **Beals Point is a swim beach, not a ramp.** DBW types it "No Facility"; amenities are "Campsites, Day Use or Picnic Areas, Restrooms, Snack Bar, Swimming Area". No launch. Graded as natural shoreline; carry is unsourced and varies with reservoir drawdown | [DBW facility 1167](https://dbw.parks.ca.gov/BoatingFacilities/f/1167); [Folsom Lake SRA](https://www.parks.ca.gov/?page_id=500) |
| Parking | 3 | high | Operator fee schedule, verbatim: "Beals Point Vehicle Day Use: $12.00". Paid lot at the put-in | [Folsom Lake SRA](https://www.parks.ca.gov/?page_id=500) |
| Launch traffic | 5 | **low** | No ramp at Beals Point, so no trailer queue. But **the rubric has no level for "busy swim beach"**, which is what this actually is; 5 flatters it. See §3 | [DBW facility 1167](https://dbw.parks.ca.gov/BoatingFacilities/f/1167) |
| Facility | 5 | high | DBW amenities: "Campsites, Day Use or Picnic Areas, Restrooms, Snack Bar, Swimming Area"; parks.ca.gov lists "Restrooms / Showers"; staffed entrance kiosk. OSM maps public toilets ~50 m from the pin | [DBW facility 1167](https://dbw.parks.ca.gov/BoatingFacilities/f/1167); [Folsom Lake SRA](https://www.parks.ca.gov/?page_id=500) |

Note that `power_boats: true` and the notes' "wake builds on warm afternoons, and open fetch lets wind kick up quickly" are **out of scope** under §0.1: that is water, not put-in. Under rubric v2 they contribute nothing, which is why a big windy reservoir and a sheltered urban pond can't be told apart by this score.

### Spot 135: Emeryville Marina, Emeryville. Score 3.8

| Axis | Level | Conf | Note | Source |
|---|---|---|---|---|
| Launch ease | 5 | high | "Boat launch facilities consist of a cement boat ramp with a high-freeboard dock"; "Accessible launch facilities include an ADA gangway (with transition plates)". OSM slipway at the pin; paved lot ~50 m | [SF Bay Water Trail: Emeryville Marina](https://sfbaywatertrail.org/trailhead/emeryville-marina/); [OSM node/1376995686](https://www.openstreetmap.org/node/1376995686) |
| Parking | 3 | **medium, conflicted** | "Ample paid parking is available in large lots at the Marina... Free 4-hour parking is provided in the further west parking lots." Paid at the launch, free requires a walk. **The same page contradicts itself**: its Boat Facilities section says "Ample free parking is available" | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/) |
| Launch traffic | 2 | medium | "The site is designed primarily for trailered boats, but is used by many different boat types"; "used by both motorized and non-motorized boaters." Trailer traffic dominates by design; actual busyness not sourced | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/) |
| Facility | 4 | medium | "An ADA portable restroom is located approximately 50 feet from the boat ramp, while full service restrooms are located centrally within the Marina complex, approximately 900 feet west"; "sidewalks, restroom, and parking that all appear to be ADA accessible and well maintained". Not 5: the restroom at the ramp is a portable | [SF Bay Water Trail](https://sfbaywatertrail.org/trailhead/emeryville-marina/) |

**Multiple launches, per the audit's finding #4.** The stored pin is the cement trailer ramp. There is a second, genuinely SUP-relevant access: OSM `way/921786808`, a slipway tagged "Slipway for small kayaks, small rafts, surfboards. Access from foot trail only", `motor_vehicle=no`, ~440 m north, matching the Water Trail's "water access path located just outside the breakwater... designed as a launch for boardsailers". **The record's notes describe both.** Scored against the pin, launch traffic is 2; scored against the boardsailer path it would be 5, and the whole score would move 0.45. One record, two launches, two different answers.

---

## 3. Sourcing difficulty and rubric ambiguity

### Which axes were hardest to source

Ranked worst to best.

**1. Launch-area traffic (0.15). Effectively unsourceable.** 6 of 9 levels are low confidence, and 1 is null. Primary sources reliably state whether a ramp exists and whether motors use it. **No source states how busy a put-in is.** §1.2's levels 2/3/4 are separated entirely by use intensity ("light use" vs "moderate use; a real queue at peak times" vs "trailer traffic dominates"), which is exactly the information nobody publishes. I could only ever source the structural fact (shared ramp vs. dedicated paddler access), which collapses the 5-level axis to a 3-way flag: no ramp / shared ramp / trailer-dominated. **This axis does not have five distinguishable levels in the available evidence.**

**2. Parking (0.30). Sourceable for existence and fee; not for fullness.** §1.2 puts "rarely full" in level 5, "fills on summer weekends" in level 3, and "frequently full" in level 2. That is three of five levels gated on a fact no agency publishes. In practice I graded on fee and distance alone, which is what the spec predicted ("does not separate 3 from 5"). Two spots also gave **contradictory fee sources** (38: operator says free, OSM and our notes say $5; 135: one page says both free and paid), each worth up to 0.6 points.

**3. Launch ease (0.40). Best-sourced axis, worst-defined boundaries.** See below.

**4. Facility (0.15). Easiest.** Restrooms and amenity lists are exactly what park pages publish. But it is only 15% of the score, and it barely varies: **8 of 10 spots scored 4 or 5.** Almost nothing in this app is a neglected facility.

### Where the rubric wording is ambiguous

These are the places where I expect to diverge from Researcher B, and per §4.2 the rubric is the suspect.

**a. "Carry under 50 ft", measured from where?** Every ramp in this set has a parking lot 45-70 m away, but you can drive to the ramp and drop your board. Level 5 says "carry under 50 ft"; level 4 says "a paved ramp with a longer carry". Measured lot-to-water, every ramp here is a 4. Measured from where you actually unload, every ramp is a 5. **This single undefined word moves five of the ten spots by 0.4.** It needs one sentence: measure from the nearest legal parking space.

**b. Tide-dependence vs. the floating-dock carve-out.** §1.2: "`tide_sensitive: true` pushes toward 2-3 unless notes describe a floating dock." At spot 1 the record says `tide_sensitive: false` while its own notes describe a 9-10 ft range and a launch window, and the Water Trail confirms floating docks. Every clause points a different way. I chose 4 as a compromise, which is the tell that the rule is underdetermined.

**c. China Camp: is a mid-to-high-tide-only beach a 3 or a 2?** Level 2 is "mudflat"; level 1 is "usable only at a narrow tide window". China Camp is a clean beach that becomes a several-hundred-yard mudflat. **The rubric grades the surface you walk on, but the thing that decides whether you can launch is the clock.** I said 3. A reasonable researcher says 2. That is a 0.4 swing on the highest-weighted axis, from wording alone.

**d. Launch-area traffic has no level for non-boat congestion.** Beals Point is a swim beach and Berkeley's Small Boat Launch is full of student sailors. §1.2's ladder runs from "paddler access, no queue" to "active marina fairway": every rung is about *boats*. A packed swim beach on a July afternoon scores 5, the best possible, because no trailer is present. **This axis rewards Beals Point for the thing that makes it annoying.**

**e. Operating hours are unmodelled.** Echo's ramp is open 9-5; Alviso's gates close at sunset; Miller is sunrise to sunset. §1.2 models the tide window but not the gate. At Echo the gate binds harder than any tide.

**f. Facility "5" mixes evidence classes.** "Restrooms, trash service, clear signage, obviously cared for" requires four facts, but "obviously cared for" is a vibe and "trash service" is almost never published. I awarded 5 whenever restrooms + signage were confirmed and nothing suggested neglect, which is an absence-of-evidence rule I invented because the rubric doesn't give one.

### One process finding

**Three of the ten official sources are unfetchable by an agent.** `parks.marincounty.gov`, `parks.sccgov.org`, and `ebparks.org` all sit behind Cloudflare and return 403 or a block page to automated fetches. I reached Marin only through the Wayback Machine and EBRPD only through a browser-spoofed request. This matters for §4.2's trust question: **the path of least resistance for an agent scoring 142 spots is exactly the AI-summary shortcut that produced spot 79**, because the primary source is the one that's hard to get and the summary is the one that's free. I refused the summaries here (search results for MLK, Miller, Nagasawa, and Coleman all offered ready-made answers I discarded), but that refusal is a per-agent discipline, not an enforced property of the pipeline.

---

## 4. Spread analysis and the §4.1 kill criterion

Scores, sorted: **3.6, 3.6, 3.8, 3.8, 4.0, 4.1, 4.2, 4.5, 4.7** (n=9; spot 48 unscorable).

| Measure | Observed | §4.1 kill threshold | Verdict |
|---|---|---|---|
| Spread (max − min) | **1.1** | under 1.5 → cut | **KILL** |
| Most spots in one 1.0-wide band | **8 of 9** (3.6–4.6) | 7+ of 10 → cut | **KILL** |

**Both prongs fire. The criterion was set before results per §4.1 and I am not going to rationalize around it.**

The 10 spots were chosen by the spec "to span the expected range, not to flatter it," across five regions, both `tide_sensitive` states, an intentional fee spread, and "at least two spots expected to score low." **The selection did its job and the score still didn't discriminate.** Consider what 1.1 points has to cover here: a two-lane county ramp on Tomales Bay (4.7), a $12 state-park swim beach on a drawn-down reservoir (3.6), a granite alpine lake at 7,414 ft (4.1), and a trailer ramp under the Bay Bridge (3.8). A paddler would not call those four things similar. The score does.

**Why it collapses, mechanically.** Three of the four axes barely move:

| Axis | Weight | Distinct levels used | Range contributed |
|---|---|---|---|
| Launch ease | 0.40 | 3 (3/4/5) | 0.8 |
| Parking | 0.30 | 3 (3/4/5) | 0.6 |
| Launch traffic | 0.15 | 4 (2/3/4/5) | 0.45 |
| Facility | 0.15 | 2 (4/5) | 0.15 |

Nothing scored 1 or 2 on launch ease or parking. **The access floor never fired on any of the 10.** Facility used two of its five levels. And the two axes that would genuinely separate these places, wind exposure and water character, are the two §0.1 deliberately cut. That cut was right for the legal reasons the lawyer gave, and it is also precisely why nothing is left to measure: **what remains is the stuff that's broadly fine everywhere, which is what §0.1 warned would happen.**

The scores also anti-correlate with what a paddler wants. China Camp (3.6) is a designated non-motorized beach with rangers, changing rooms, and a boat wash. Emeryville (3.8) is a trailer ramp. Beals Point (3.6) ties China Camp because its $12 fee and unramped beach cost it exactly what China Camp's small dirt lot and mudflats cost. **The number is not wrong so much as it isn't about anything.**

### Recommendation

**Cut item 39 as specified.** Not "defer", not "score fewer spots". The 1-5 aggregate is the part that doesn't work, and no amount of additional research moves a 1.1-point spread.

Three things worth salvaging, in descending order of value:

1. **Keep the research, drop the number.** The genuinely useful facts this pilot surfaced are all binary and specific: non-motorized only (45, 112), trailer ramp (135, 63-ramp), free lot vs $12 (84 vs 120), mid-to-high tide only (45), ramp open 9-5 (104), no ramp at all (120). **Those are filters and facts, not a score.** §0.1 already identified the honest home for this: descriptive prose in `notes`, plus the structured fields that already exist. A "non-motorized only" filter would do more for a paddler than a 4.1 ever will, and it costs a boolean, not 570 axis judgments.
2. **The axis the pilot proves is real is launch-area traffic, collapsed to a flag.** It never had five levels; it has three, and only the structural one is sourceable. As a `launch_type: paddler | shared | trailer-dominated` field it is honest, cheap, and it separates China Camp from Emeryville, which the score does not.
3. **The score's best output was an audit.** See §5. Scoring 10 spots found one flatly wrong record, one bad pin, and two conflated launches, in spots the coordinate audit had cleared or never looked at. **That suggests the per-spot research pass has real value and the aggregate on top of it does not.** If any part of the ~12-18 hrs in §1.5 gets spent, spend it on item 40's data quality, not on item 39's number.

One caution if the owner is tempted to rescue the score by re-adding wind: **that reopens exactly the §0.1 legal finding that closed it**, and the lawyer called put-in-only "the single highest-leverage decision in the whole reviews/accounts block." A discriminating score and a defensible score appear to be in direct tension. That tension, not the spread, is the real finding here.

---

## 5. Records I suspect are wrong

Three spots, in the same failure classes the audit named. None of these were in the audit's 11.

### 120 (Folsom Lake / Beals Point): the record's central claim is false. **Highest priority.**

The notes say: *"Beals Point has a ramp, beach, and parking."*

- **DBW types "Folsom Lake SRA (Beal's Point)" as "No Facility"** ([facility 1167](https://dbw.parks.ca.gov/BoatingFacilities/f/1167)). Its amenity list is "Campsites, Day Use or Picnic Areas, Restrooms, Snack Bar, Swimming Area". No launch.
- **Every other Folsom launch is typed "Launch"** in the same registry: Brown's Ravine (2 ramps), Peninsula (old and new), Folsom Point, Granite Bay (4 ramps), Rattlesnake. [DBW: Folsom](https://dbw.parks.ca.gov/BoatingFacilities/City/Folsom). The registry knows what a ramp is and says Beals doesn't have one.
- **OSM maps no slipway within 1,500 m** of the stored pin.
- parks.ca.gov lists a "Boat Launch: $10.00" fee for the SRA generally but a "Beals Point Vehicle Day Use: $12.00" entry fee, and refers to a "swim area at Beals Point".

Beals Point is a swim beach and campground. It is a perfectly good carry-in SUP put-in, which is likely why it's in the app, but **"has a ramp" is wrong** and it is the kind of wrong that sends someone with a trailer to the wrong gate.

**This is exactly the DBW facility-type test the audit recommended as a cheap automated screen** (cross-cutting finding #1). It fired on the first spot outside the audit's sample that I pointed it at. **Recommend running that screen across all 142 spots.** It is one HTTP request per city.

### 63 (Berkeley Marina): the pin is on a hotel parking lot, and the record doesn't say which of three launches it means.

- The stored coordinate `37.8678664, -122.3130528` sits ~52 m from OSM `way/1157812923`, "DoubleTree Hotel Self Park Lot". **It is not at any launch.**
- The nearest slipway is ~410 m WNW ([OSM node/87362461](https://www.openstreetmap.org/node/87362461) and neighbors), the Spinnaker Way trailer ramp.
- The gravel beach the notes describe ("Launch from the public beach") is Shorebird Park, ~700 m SSW ([OSM way/203291254](https://www.openstreetmap.org/way/203291254)).
- **Berkeley Marina is two separate Water Trail sites**, not one: [Berkeley Marina Ramp](https://sfbaywatertrail.org/trailhead/berkeley-marina-ramp/) ("used primarily by motorized boats and can get crowded on weekends") and [Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) (docks, hoists, Cal Adventures, Shorebird beach). DBW lists both separately: "Berkeley Marina" (Marina/Launch) and "Berkeley Public Boat Ramp" (Launch).

This is the audit's signature failure mode, **a geocode of a facility name landing on a parcel centroid**, and its own recommended screen catches it: the pin reverse-geocodes to a hotel lot, not a put-in. The notes say "beach", so the intended site is almost certainly the Small Boat Launch at 201 University Ave. **I scored it there and flagged all four axes accordingly, but the score is graded against a launch the pin doesn't sit on, which per §4.3's own logic makes it unreliable.**

Suggested repair (medium confidence, owner review): re-point toward the Small Boat Launch / Shorebird Park beach. I am not proposing a coordinate; per the audit's China Camp lesson, I would be picking between the docks and the beach without a source that resolves them, which is how the Water Trail's own parking-lot coordinate got mistaken for a put-in.

### 84 (MLK Jr. Regional Shoreline): two launches 2.5 km apart merged into one record.

The notes read: *"ADA-accessible paddle craft dock on San Leandro Bay with a free two-lane launch off Doolittle Drive... Tidewater Boating Center on site offers rowing and kayak programs."*

Per [EBRPD](https://www.ebparks.org/parks/martin-luther-king), these are two different places in one 748-acre park:

| | Doolittle ramp | Tidewater Boating Center |
|---|---|---|
| Address | Doolittle Dr. (staging area south) | 4675-A Tidewater Ave. |
| What it is | two-lane boat ramp + fishing piers | "public ADA accessible paddle craft dock... the first official San Francisco Bay Water Trail site in the Park District" |
| Parking | Doolittle Beach Staging Area | "approximately 55 total spaces... free with no limits" |

**The stored pin is at the Doolittle ramp. The "ADA-accessible paddle craft dock" and "Tidewater Boating Center" in the notes are at Tidewater, ~2.5 km away.** "On site" is doing a lot of work. The Water Trail lists only [Tidewater](https://sfbaywatertrail.org/trailhead/tidewater/) as a trailhead; there is no Doolittle trailhead page.

The coordinate is fine (the audit confirmed it, 32 m from `node/2427025918`), so this is a **notes** defect, not a coordinate defect. It is the audit's cross-cutting finding #5 ("note fields need auditing too, independently of coordinates") and #4 ("multiple distinct launches is a live data-model question") landing on the same record. For a SUP app, Tidewater's paddle-craft dock is the more relevant put-in and the pin points at the trailer ramp, the same shape as the audit's Donner / West End Beach problem.

### Lower-confidence flags, for completeness

- **112 (Morro Bay).** The record's strongest claim, *"Coleman Park's small beach gives the easiest entry at any tide level"*, is not supported by the City of Morro Bay's Coleman Park page (which lists amenities in full and mentions no water access), the DBW registry (which enumerates Morro Bay's launches and omits Coleman), or OSM (no bay-side beach polygon, no slipway). The city confirms "Coleman Beach" exists adjacent to the park. **Not calling this fabricated (the audit independently found the park edge shares nodes with the coastline), but "at any tide level" is an unsourced specific of exactly the kind the audit found invented at spot 79.** Worth an owner spot-check.
- **48 (Nagasawa).** Notes describe "a small waterway in the Sonoma County creek system." The city calls it "Pond / Lake". It is a reservoir. Harmless, but wrong, and it is the third record in this batch of ten whose notes don't match the operator's own description.
- **1 (Alviso).** `tide_sensitive: false` contradicts the record's own notes ("Tidal range runs 9-10 feet, so push off about an hour before low"). One of the two is wrong. This one matters beyond the score: `tide_sensitive` is a real field other things may read.

**Rate to note for §4.2:** ten spots, three records with material defects and three more with minor note errors. The audit sampled the spots a heuristic flagged; **this pass sampled spots chosen for a completely unrelated reason and still found a 30% material defect rate.** That is the strongest argument in this report, and it is an argument for item 40, not item 39.

---

## Sources

All levels are sourced from the primary page, registry, or geodata. **No level was taken from a search-result summary or AI overview.** Search was used only to locate primary URLs; where a summary offered a ready answer (MLK's boat launch, Miller's parking, Nagasawa's rules, Coleman's restroom), the summary was discarded and the primary page fetched, or the axis was reported unknown.

[SF Bay Water Trail: Alviso Marina County Park](https://sfbaywatertrail.org/trailhead/alviso-marina-county-park/) · [China Camp State Park](https://sfbaywatertrail.org/trailhead/china-camp-state-park/) · [Emeryville Marina](https://sfbaywatertrail.org/trailhead/emeryville-marina/) · [Berkeley Marina Small Boat Launch](https://sfbaywatertrail.org/trailhead/berkeley-marina-small-boat-launch/) · [Berkeley Marina Ramp](https://sfbaywatertrail.org/trailhead/berkeley-marina-ramp/) · [Tidewater](https://sfbaywatertrail.org/trailhead/tidewater/) · [Trailhead index](https://sfbaywatertrail.org/trailheads/) · [Marin County Parks: Miller Boat Launch (Wayback, 2026-02-07)](http://web.archive.org/web/20260207161901/https://parks.marincounty.gov/parkspreserves/parks/miller-boat-launch) · [EBRPD: Martin Luther King Jr. Regional Shoreline](https://www.ebparks.org/parks/martin-luther-king) · [City of Santa Rosa: Nagasawa Community Park](https://www.srcity.org/facilities/facility/details/Nagasawa-Community-Park-76) · [City of Santa Rosa: Park Rules](https://www.srcity.org/1023/Park-Rules) · [City of Morro Bay: Coleman Park](https://www.morrobayca.gov/376/Coleman-Park) · [City of Morro Bay: Beach Information](https://www.morrobayca.gov/187/Beach-Information) · [Echo Chalet](https://echochalet.net/) · [Folsom Lake State Recreation Area](https://www.parks.ca.gov/?page_id=500) · CA DBW facility registry: [f/726 Echo Chalet](https://dbw.parks.ca.gov/BoatingFacilities/f/726), [f/1167 Folsom Lake SRA (Beal's Point)](https://dbw.parks.ca.gov/BoatingFacilities/f/1167), [Folsom](https://dbw.parks.ca.gov/BoatingFacilities/City/Folsom), [Berkeley](https://dbw.parks.ca.gov/BoatingFacilities/City/Berkeley), [Morro Bay](https://dbw.parks.ca.gov/BoatingFacilities/City/Morro%20Bay), [Santa Rosa](https://dbw.parks.ca.gov/BoatingFacilities/City/Santa%20Rosa), [Marshall](https://dbw.parks.ca.gov/BoatingFacilities/City/Marshall) · OpenStreetMap via [Overpass API](https://overpass-api.de/) (ODbL), 400 m–1,500 m radius queries for `leisure=slipway`, `amenity=parking`, `amenity=toilets`, `leisure=marina`, `natural=beach`, `waterway=access_point` around each stored coordinate.
