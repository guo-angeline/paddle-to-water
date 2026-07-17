# Data-quality sweep: the 127 spots outside the prior audits (ROADMAP item 40)

**Date:** 2026-07-16
**Status:** PROPOSAL FOR OWNER REVIEW. **Nothing has been edited.** `data/spots.json` is untouched.
**Scope:** the 127 spots not covered by `reports/coord-audit-2026-07-16.md` (38, 45, 48, 76, 79, 84, 88, 96, 102, 104, 112) or the item 39 pilot (1, 63, 120, 135).
**Method:** the two screens the audit's cross-cutting finding #1 recommended, run at scale, then primary-source verification on the highest-signal subset.

---

## Headline

**Screen 1 was run across all 127 unaudited spots. Screen 2 was run across all 88 cities in the dataset. 15 spots were then carried to primary sources and completed. 14 of the 15 carry a material defect.** A further 5 spots were in flight when the pass ended and are reported as unresolved, not as findings.

A 14-of-15 hit rate is not a dataset-wide defect rate and must not be quoted as one: those 15 were selected *because* the screens fired on them. **The honest dataset-wide statement is narrower and still bad:**

| Measure | Value |
|---|---|
| Spots screened by screen 1 (automated) | **127 of 127** (100%) |
| Screen 1 fired | **56** (44%) |
| ...of which cleared as a known false-positive class (see below) | 11 |
| **Screen 1 fires that stand** | **45** (35% of unaudited) |
| Spots screened by screen 2 (DBW registry) | **38** (those whose notes assert a facility) |
| Screen 2 fired | 4, of which **1 real**, a **75% false-positive rate** |
| Spots carried to primary sources | 20 (**15 completed**, 5 in flight at cutoff) |
| **Material defects confirmed** | **14** (+1 new defect on already-audited spot 84) |
| Fabricated spots found (the 79 pattern) | **0** |

**The good news, and it is genuine: I found no second spot 79.** Every launch I verified exists and is legally sanctioned to paddle, with one exception that is a different problem (**92**, a private business dock sold as a public put-in). The refuge cluster (127, 130, 132, 134) that looked most like 79 on paper turned out to be the *best-sourced* records in the app.

**The bad news is that the defect is broader than coordinates and broader than item 40 assumed.** Four findings below are new and none of them are about precision. **Two of them contradict the audit's own method recommendations**, which is the most important thing in this report.

---

## Four findings that change the method

### 0. Screen 2 (DBW) is the wrong registry for this app, and it is not "zero false positives"

The audit reported screen 2 caught 76 and 88 with zero false positives on 11 spots. **On a 38-spot run it fired 4 times and was right once.** Worse, its three misses are not random. They expose a category error:

| id | Screen 2 said | Truth | Why it fired |
|---|---|---|---|
| **138** Petaluma Turning Basin | DBW types it `Mooring Fields`, notes claim "a public launch" → contradiction | **Notes are correct. Coord is correct. No change.** | Cavanagh Landing is a designated Water Trail launch (site **#163**), *"a large, U-shaped dock"* with two gangways ([WT](https://sfbaywatertrail.org/trailhead/petaluma-river-turning-basin/)). Stored coord is **14 m** from OSM `way/195463211` "Cavanagh Landing". |
| **146** Walnut Grove | notes assert a "ramp" | **No defect** | My regex matched the notes' own words *"There is **no trailer ramp**."* |
| **106** Shaver Lake | matched `No Facility` | **No defect** | My matcher picked "Shaver Lakeside" over the city's "Shaver Lake Public Boat Launch" (`Launch`). Pin is 61 m from an OSM slipway. |

**The root cause: DBW registers motorized/trailered boating facilities. It is not an inventory of places you can put a paddleboard in the water.** DBW lists "Devils Nose **Put-in**" as `NoFacility` ([f/1150](https://dbw.parks.ca.gov/BoatingFacilities/f/1150)). **McNears Beach is `NoFacility` and is simultaneously an official Water Trail launch.** So a DBW hit disproves a **ramp** claim and nothing more. It never disproves a spot, and it must never be grounds to hide one.

**The right registry for a SUP app is the SF Bay Water Trail** (a BCDC / State Coastal Conservancy program). It publishes dock type, gangways, parking counts, fees, and hazards per site: every field this app actually needs. It confirmed 138 where DBW misled, and it is what caught the real defects at 47, 70, 65, and 134.

**Recommendation: demote DBW from "screen 2" to a narrow ramp-claim check, and promote the Water Trail to the primary registry screen for all Bay Area spots.**

*(Checked, since this would be serious: spots 76 and 79 were hidden on grounds that did **not** rest on DBW type alone. 76 rested on a byte-identical unsourced directory coordinate plus four independent negatives, 79 on the refuge/permit finding. Neither hide is undermined by this correction. Spot 120 was never hidden.)*

### 1. Screen 1 has a false-positive class the original audit could not have seen

**The pipeline ingested the SF Bay Water Trail's published trailhead coordinates, and the Water Trail publishes the *parking*, not the *dock*.**

Three spots match a published Water Trail trailhead coordinate **exactly, to 6+ decimals**:

| id | stored | Water Trail published |
|---|---|---|
| 130 | `38.135331, -122.344288` | `38.13533101686539, -122.34428837064775` |
| 132 | `38.128105, -122.470792` | `38.12810459228061, -122.4707917253978` |
| 127 | `38.039643, -121.963406` | `38.03964301652493, -121.96340617632589` |

All three reverse-geocode to a trail or a parking lot, so all three **fired screen 1**. All three are correct as stored, and their notes already disclose the walk ("250 feet", "a quarter mile", "1,000 feet"). This is the same trap the coord audit hit from the other side at China Camp, where it correctly refused the Water Trail's 14-decimal coordinate because *"it is the parking lot, not the put-in."* The audit read that as a one-off. **It is the Water Trail's house convention, and our pipeline inherited it wholesale.**

There is a clean provenance fingerprint for this batch: **exactly 6 decimal places on both lat and lng**, on a contiguous high-id block. 18 spots carry it: **62, 66, 67, 126, 127, 129, 130, 131, 132, 133, 136, 137, 138, 140, 141, 144, 145, 146**. 11 of them fired screen 1. Screen 1's real yield is therefore **45 fires, not 56**, and its false-positive rate is not zero as the audit reported: on this larger sample it is **at least 20%**.

**This does not mean those 18 are correct** (134 is 7dp and *is* corrupted; 138 has a separate registry problem). It means "reverse-geocodes to parking" is not evidence against them, and a coordinate that matches a published Water Trail point exactly is a **strong provenance signal that clears a spot**.

**Recommended, not done (blocked):** cross-check all 142 coordinates against the Water Trail's published trailhead corpus mechanically. I could not: sfbaywatertrail.org has no JSON API (`/wp-json/wp/v2/trailhead` → 404) and Cloudflare blocks scripted fetches, so this needs ~90 individual page fetches or a human with the site's map export.

### 2. The dataset contains "water-body records" that are not put-ins at all

**10 records (7% of the dataset) have notes that enumerate several named launches instead of describing one.** These are not mis-pinned put-ins; they are a different kind of object that the schema has no slot for, and the pin is arbitrary by construction.

ids: **10, 20, 43, 54, 66, 70, 106, 119, 120, 147**

The sharpest case needs no external source at all. **Spot 54 ("Russian River") is pinned 24–33 km from both put-ins its own notes name:**

| From 54's pin (Kelly Road, Cloverdale) | Distance |
|---|---|
| → 33, Johnson's Beach, Guerneville (named in 54's notes) | **30.7 km** |
| → 35, Veterans Memorial Beach, Healdsburg (named in 54's notes) | **24.6 km** |
| → 31, Sunset Beach River Park, Forestville | 32.9 km |

The record contradicts itself geometrically, and it **duplicates spots 33 and 35**, which are the very put-ins it names. This is the audit's finding #4 ("multiple distinct launches is a live data-model question") not as an edge case but as a **record class**.

### 3. `tide_sensitive` is systematically wrong, and it degrades the one thing that works

The coord audit found this on spot 1 and treated it as a one-off. It is not.

- **12 spots have `tide_sensitive: false` while their own notes describe tides, mudflats, or ebb:** ids **1, 25, 27, 29, 39, 40, 41, 43, 44, 51, 60, 82**.
- **36 of the 70 `difficulty: "bay"` spots are `tide_sensitive: false`.** San Francisco Bay is tidal everywhere.

This matters more than a cosmetic field error because **`tide_sensitive` is load-bearing in the conditions engine**, which the roadmap calls the differentiator and the one validated behavior:

```
components/ConditionsPanel.tsx:88   getConditions(spot.id, spot.lat, spot.lng, spot.tide_sensitive)
components/ConditionsPanel.tsx:229  ) : spot.tide_sensitive ? (        // tide display gated on the field
lib/savedConditions.ts:56           const c = await get(s.id, s.lat, s.lng, s.tide_sensitive);
lib/search.ts:49                    if (s.tide_sensitive) t.push("tidal", "tide", "tides");
components/SpotDrawer.tsx:128       if (spot.tide_sensitive) tags.push("Tide sensitive");
```

A wrong `false` means a tidal spot silently shows no tide data, is unfindable by a tide search, and carries no "Tide sensitive" tag. **This is a conditions-engine defect wearing a data costume**, and it is the cheapest high-value fix in this report.

---

## Prioritized defect table (worst first)

Confidence is per-finding. "Proposed action" is a proposal only.

| # | id | Spot | Defect | Evidence | Conf | Proposed action |
|---|---|---|---|---|---|---|
| 0 | **92** | San Rafael Canal | **LOUDEST FLAG. A private business dock presented as a public put-in.** Not a fabrication (the shop and dock are real), but a user who drives there may have **no right to launch**. | Pin is **13 m from 115 Third Street**, the address of **101 Surf Sports** ([their site](https://101surfsports.com/): *"The water is right behind our shop so come on down and go for a paddle!"*, open 10am–5pm). The pin is on the shop, not a launch. **DBW does not list it among San Rafael's 12 facilities** (the public launches there are Buck's Landing and Loch Lomond). **The SF Bay Water Trail lists no San Rafael Canal trailhead at all**. Marin's designated sites are China Camp, Bayfront Park, Angel Island, McNears Beach, Black Point. A public canal launch would be listed. `has_fee: true` + `rentals_available: true` is the signature of a shop, not a put-in. | **high** that it is not a confirmed public launch; **medium** on the exact access policy (storage/contact pages 404'd) | **Owner decision.** Either rewrite the notes to say plainly that this is a private dock usable via rental/storage, or replace with a DBW/Water-Trail-confirmed public launch. **No replacement coordinate proposed**. I will not guess Buck's Landing. |
| 1 | **47** | McNear's Beach, San Rafael | **Notes assert a ramp that does not exist. The 120 pattern, exactly.** Notes: *"Paved ramp right off the parking lot."* | **DBW types "McNears Beach County Park" `NoFacility`/Public** ([f/1185](https://dbw.parks.ca.gov/BoatingFacilities/f/1185)); San Rafael's Launch-typed facility is Buck's Landing, a different site. **SF Bay Water Trail describes it as a beach launch, "not a traditional paved ramp"**, *"a long, narrow sandy shoreline"* ([trailhead](https://sfbaywatertrail.org/trailhead/mcnears-beach/)). **OSM: no slipway within 1,500 m** (Overpass); nearest beach 274 m, fishing pier 334 m. Pin reverse-geocodes to the **Marin County Parks Ranger Station**. | **high** | Rewrite notes to a beach carry-in. Re-pin toward the beach (~`37.9951, -122.4548`, OSM way/895083723, **medium**). **Also `has_fee: false` is wrong**. Water Trail: *"There is an entrance fee"* (**medium-high**). |
| 2 | **70** | Richmond Marina | **Pin is a place-centroid, merges 4 launches, names the wrong water body.** | Stored coord is **0 m from OSM `node/2304998969`, `place=neighbourhood`, `name=Marina Bay`**, a textbook centroid geocode, not an observed put-in. Real launches: Marina Bay Yacht Harbor 759 m, Shimada 626 m, Vincent Park 761 m (three separate [Water Trail](https://sfbaywatertrail.org/trailhead/marina-bay-yacht-harbor/) trailheads, spanning 1,039 m). **Notes say "San Pablo Bay"; the Water Trail says this basin opens onto San Francisco Bay** (views of Bay Bridge, Brooks Island, Angel Island). San Pablo Bay is north of the Richmond–San Rafael Bridge. | **high** | **Split into 3 records** + re-pin each (coords above, high). Fix San Pablo → San Francisco Bay. `has_fee` is per-site and currently unanswerable while merged (MBYH parking $10/24h; Shimada/Vincent free). |
| 3 | **64** | Del Valle, Livermore | **Three boolean fields are wrong, and the notes contradict the operating agency.** | [EBRPD Del Valle](https://www.ebparks.org/parks/del-valle): non-motorized *"$3.00 each for launches and $5.00 each for inspections"* + $5/vehicle → **`has_fee: false` is wrong**; *"mandatory boat inspection for invasive mussels"* → **`inspection_required: false` is wrong**; *"Kayaks and paddleboards can be rented seasonally at the Kayak Center at the east beach"* → **`rentals_available: false` is wrong**. EBRPD says *"a lake **five miles** long"*; **our notes say "Seven-mile reservoir."** Pin sits on Canyon Trail, **1,152 m** from OSM `node/1635821794` "Del Valle Boat Ramp". DBW: "Del Valle Lake" `Launch`/Public. | **high** (fields), **medium** (coord, OSM-sourced) | Set `has_fee`, `inspection_required`, `rentals_available` → `true`. Fix seven→five miles. Re-pin to `37.586294, -121.703796` after an agency confirm. |
| 4 | **134** | Eden Landing, Hayward | **Longitude corrupted (~193 m), and a hard public closure is omitted.** | Stored `-122.1246736` vs Water Trail published `-122.1224849`. **Latitude matches to ~0.5 m; longitude does not**, a corruption signature, not a different reference point. Pin lands on the Bay Trail path. **[CDFW](https://wildlife.ca.gov/Regions/3/Hunts/ELER): on ~10 hunt dates Nov–Jan, *"access to ELER is closed to the public, except registered hunters."*** Our notes say nothing. Also omits a stormwater pipe that *"could create a hazard to paddlers"* and a no-landing rule (Ridgway's rail / snowy plover). | **high** | Re-pin to OSM `way/1053189423` "Eden landing Kayak Launch" `leisure=slipway access=yes` → `37.6187041, -122.1237000` (the dock, per D15 put-in-only). **Add the Nov–Jan closure dates.** Add stormwater + no-landing. Notes also overstate difficulty: visitors *can* drive to a loading zone at the launch in daylight. |
| 5 | **54** | Russian River (Sonoma/Mendocino) | **Water-body record. Pinned 24–33 km from both put-ins its own notes name. Duplicates 33 and 35.** | Self-contained: notes name *"put-ins at Johnson's Beach and Veterans Memorial Beach"* = spots **33** and **35**. Pin reverse-geocodes to **Kelly Road, Cloverdale**, which is neither Guerneville nor Healdsburg. No OSM launch within 5 km. | **high** | **Owner decision: delete as a duplicate of 33+35**, or demote to a region/water-body record with no launch pin. Do not re-pin. |
| 6 | **65** | Jack London Square, Oakland | **Pin is on the square; the launch is 1,148 m away. The record self-documents the bug.** | Notes say the dock is *"about half a mile east of the square"*, **and the pin is on the square**, reverse-geocoding to Jack London Square parking (garage 61 m, cinema 83 m). **No slipway anywhere in the square.** Real launch: [Estuary Park / Jack London Aquatic Center](https://sfbaywatertrail.org/trailhead/estuary-park/) `37.7901745, -122.2659597`. DBW Oakland lists "Lake Merritt Channel - Estuary Channel Park" `Launch`/Public. | **high** | Re-pin to `37.7901745, -122.2659597` (high). Fix "east" → "southeast" (Water Trail says "south"; true bearing ESE, ~0.7 mi). **Drop or source "free"**. oaklandca.gov returns 403, claim unverified. |
| 7 | **66** | San Leandro Bay, Oakland | **Water-body record. Merges 3 launches across 2 cities. Substantially duplicates spot 84.** | Pin on **Doolittle Drive**; nearest slipway `node/2427025918` is 898 m away **and is 32 m from spot 84's pin**. The two records resolve to the same launch, 924 m apart. Notes name Tidewater (`37.7613964, -122.2231739`, its own [Water Trail trailhead](https://sfbaywatertrail.org/trailhead/tidewater/)), the Alameda ramp, and MLK Shoreline. DBW Alameda: **"Alameda Grand *Street* BLF"**, while **our notes say "Grand Avenue."** | **high** | **Owner decision: delete as duplicate of 84**, or demote to a water-body record with no launch pin. Which of the three launches it would become is a product call, not a data fix. |
| 8 | **20** | Folsom Lake | **Water-body record. Near-duplicate of 120 (9.2 km apart, same name, same city). Names launches the operator does not list.** | Notes: *"Launch points at Peninsula Campground, Rattlesnake Bar, Granite Beach, Browns Ravine, and Beeks Bite."* **[CA State Parks' launch-status page](https://www.parks.ca.gov/?page_id=31951) names 14 launches; "Beeks Bite", "Granite Beach", and "Peninsula Campground" are not among them** (the real names are Granite Bay Stages 1–4, Peninsula North/South). Pin reverse-geocodes to **Goose Flat Trail, El Dorado County**, 1,920 m from the nearest slipway. | **high** | **Owner decision: merge with 120** or demote to a water-body record. Correct the launch names against the operator. |
| 9 | **84** | MLK Jr. Shoreline *(already audited; NEW defect)* | **Merges two launches 2,649 m apart.** The coord audit cleared this spot's *coordinate* and never checked its notes. | [EBRPD](https://www.ebparks.org/parks/martin-luther-king): the **ADA paddle-craft dock is at Tidewater Boating Center, 4675-A Tidewater Ave**; *"A two-lane boat launch is located at the south parking lot along Doolittle Drive."* Our pin is at Doolittle, so the notes **misattribute Tidewater's ADA dock to the Doolittle ramp**. | **high** | Split into Doolittle ramp + Tidewater. **This also resolves 66.** (`has_fee: false` is correct.) |
| 10 | **132** | Dickson Ranch, Novato | **`difficulty: "river"` is wrong**, this is San Pablo Bay tidal marsh, not a river. Hunting omitted. | [SCC site report](https://scc.ca.gov/files/2019/06/DicksonRanch_WTSiteDescriptionReport_June2019.pdf): within San Pablo Bay NWR, USFWS-managed. Waterfowl hunting Oct–Jan not in our notes. | **high** (difficulty), medium (hunting) | `difficulty` → `bay`. Add Oct–Jan hunting. **Coordinate is correct, do not touch** (exact Water Trail match). Report is 7 years old and warns access *"may ultimately be limited... or excluded entirely"* by sediment accretion; worth a freshness check. |
| 11 | **127** | Bay Point Regional Shoreline | **Omits a hazard that matters for inflatables.** | [Water Trail site report CC22](https://sfbaywatertrail.org/wp-content/uploads/2021/11/BayPointRS_SiteDescriptionRpts_March2021.pdf): *"several ship wrecks along the J Channel with sharp metal debris that could damage small crafts."* Not in our notes. Also duck hunting Oct–Jan omitted; notes say "restrooms", source says one unisex. `power_boats: true` looks wrong (`Boat/Trailer Ramp: No`, dock-only). | **high** (hazard), low (`power_boats`) | Add the shipwreck/debris hazard and hunting. Fix restroom count. Review `power_boats`. **Coordinate correct, do not touch.** |
| 12 | **130** | Cullinan Ranch, Vallejo | **Hunting understated in a way that misleads.** Notes: *"Seasonal hunting occurs **nearby**."* | [Water Trail So13 report](https://sfbaywatertrail.org/wp-content/uploads/2020/12/CullinanRanch_WTSiteDescriptionReport_June2019.pdf): hunting is allowed **inside the Cullinan Ranch restoration area you paddle through** (Oct–Jan, Wed/Sat/Sun). Report twice flags Dutchmen Slough breach currents as dangerous; our notes omit them. | **high** | Name the restoration area and the Oct–Jan Wed/Sat/Sun schedule. Add breach currents. **Coordinate correct, do not touch.** |
| 12b | **43** | Petaluma River | **Water-body record. Hamlet-centroid pin. A false hours claim. Duplicates 138.** | Pin reverse-geocodes to **`place/hamlet "Lakeville"`**, a settlement centroid. **5,430 m** from Petaluma Marina, **7,292 m** from the Weller St dock; it sits on neither put-in its notes name. **Notes claim a "24-hour public boat ramp"; the Water Trail says *"The high-freeboard dock and boat ramp are open from sunrise to sunset daily"*** ([WT Petaluma Marina](https://sfbaywatertrail.org/trailhead/petaluma-marina/)). **The 24-hour claim is false.** Its second put-in (*"floating dock beside the old River House on Weller Street"*) **is spot 138**. Nearest facility to the pin is Gilardi's Lakeville Marina (DBW `Marina`, no launch), which the notes never mention. | **high** | **Split: remove the Weller St put-in (138 is the better record, keep it), re-pin 43 to Petaluma Marina, delete the 24-hour claim.** Site-level reference `38.23154, -122.61472` (WT) is **not** a ramp point: it reverse-geocodes to a road. Ramp pixel needs placing from imagery. |
| 12c | **28** | Bodega Harbor (Westside Regional Park) | **Pin is on a private house, on the wrong side of the harbor.** Notes are correct. | Pin sits on **Sea Way, the east/town side**; Westside Regional Park is at **2400 Westshore Road**, the **west** side, **2,295 m** away (OSM `node/1438451183` `leisure=slipway`, reverse-geocodes to Westshore Road). **DBW confirms Westside Regional Park = `Launch`/Public.** Both notes claims confirmed by [Sonoma County Parks](https://parks.sonomacounty.ca.gov/visit/find-a-park/westside-regional-park): *"a three-lane boat launch and wheelchair-accessible kayak launch on Bodega Harbor."* | **medium-high** (slipway node is unnamed; corroborated by street + address + DBW) | Re-pin to `38.3229901, -123.0550870`. Optionally add the 5:30 a.m. open. **Leave `has_fee` alone**. The $4 is trailered-boat-specific; whether a SUP pays is unverified. Do not confuse with Doran Beach's ramp 2.5 km away (`access=permit fee=yes`). |
| 13 | **1, 25, 27, 29, 39, 40, 41, 43, 44, 51, 60, 82** | *(12 spots)* | **`tide_sensitive: false` contradicted by the record's own notes.** Degrades the conditions engine. | Field-vs-notes contradiction within each record; see finding 3 above for the code paths that consume it. 36 of 70 `difficulty: bay` spots are `tide_sensitive: false`. | **high** (contradiction), medium (per-spot correct value) | Set `tide_sensitive: true` where the notes describe tides. **Audit the field across all 70 bay spots**. This is a conditions defect, not a cosmetic one. |
| 14 | **127, 130, 132, 134** | refuge cluster | `has_fee: null` where the source states a fee answer. | All four Water Trail site reports state `Fee for Launch or Parking: No`. | **high** | `has_fee` → `false`. Cheap, well-sourced tri-state upgrade. |

### Verified clean, do not touch

- **138** Petaluma River Turning Basin. Coordinate 14 m from Cavanagh Landing; notes confirmed near line-by-line by the Water Trail (U-shaped dock, two gangways, *"Five parking spots in the public Weller Street lot, one of which is an accessible parking spot"*, tidal currents, barge traffic). **The only record I verified that was fully correct.**

---

## What I did NOT cover

This is a partial sweep. Stating the gaps precisely.

**1. 37 spots fired screen 1 and were never verified against a primary source.** They are suspects, not findings. No claim is made about any of them:

> **2, 4, 7, 8, 9, 10, 11, 15, 22, 25, 29, 31, 33, 35, 36, 37, 39, 40, 41, 46, 55, 58, 62, 67, 69, 72, 80, 82, 91, 107, 108, 114, 119, 140, 142, 145, 146**

Highest-signal among them, by the audit's own criteria: **35** (Veterans Memorial Beach, reverse-geocodes to a house, no OSM launch within 5 km), **36** (Heart's Desire Beach), **29** (Corte Madera Creek, place/house centroid, 5.1 km from any launch), **37** (Lake Berryessa, administrative-boundary centroid, 5.1 km), **69** (Point Pinole), **31/33** (Russian River, and note **33 and 35 are the two records spot 54 duplicates**, so they should be resolved together).

Caution on this list: per finding 1, **62, 140, 145, and 146 carry the 6-decimal Water Trail fingerprint**, so their screen-1 fire is weak evidence. Start with the others.

**2. 70 spots passed screen 1 automatically and got no primary-source check at all.** Screen 1 is a coarse filter; it does not certify a spot. By region: North Bay 25, East Bay 12, Sierra Nevada 6, Sacramento 6, San Francisco 5, Peninsula 5, South Bay 4, Central Valley 5, Central Coast 2.

**3. Screen 2 covered only 38 spots**: those whose notes assert a ramp/launch/hoist. Records that assert *no* facility were not registry-checked. My spot→facility name matcher is fuzzy and produced 3 false positives out of 4 fires; **it should not be trusted unsupervised, and per finding 0 the whole screen should be rebuilt on the Water Trail rather than DBW.**

**3b. Five spots were in flight at cutoff and are unresolved**, not findings: **24** (Redwood City Chesapeake ramp, where `geocode_display` claims "601 Chesapeake Dr" but the pin reverse-geocodes to 200 Cardinal Way, 763 m from a slipway), **148** (Lakeshore Park, Newark, pin on a private residence; **whether boating is permitted at all on this municipal lake is the open question**), **136** (Islais Creek, a listed Water Trail trailhead, so likely real; pin on an industrial building), **97** (Crissy Field East Beach), **27** (Seal Point Park).

**4. The Water Trail cross-check (finding 1) was not run.** It is the single highest-value remaining screen and it is blocked on Cloudflare / no API.

**5. Central Coast (5 spots), Central Valley (6), and most of Sierra Nevada (14)** were deprioritized per the traffic instruction and are essentially unscreened beyond the automated pass.

**6. Sources I could not reach**, and did not paper over with a search summary: `marincountyparks.org` (Cloudflare; Wayback fetch also failed from this environment), `oaklandca.gov` (403), `sfbaywatertrail.org` scripted access (Cloudflare; the WebFetch path worked, curl did not).

**7. Method corrections worth recording:** `ebparks.org` is **not** Cloudflare-blocked to a browser UA (contra CLAUDE.md and the pilot), but `/parks/martinlking` 302s, so `-L` is required, and **Wayback has no snapshot of the Del Valle page**, so the documented archive fallback would have failed. Overpass rejects curl's default UA with HTTP 406.

---

## Recommendation on item 45 (expand coverage)

**Item 45 should stay blocked.** Three reasons, in ascending order of force.

1. **The defect rate did not fall when the sample got cleaner.** The coord audit sampled spots a heuristic flagged. The item 39 pilot sampled spots chosen for unrelated reasons and deliberately excluded every flagged spot, and still found 30–40%. This pass sampled a third way and completed 15 primary-source verifications; **14 had something wrong with them. Three independent sampling frames, three bad results.** That is a property of the corpus, not of the sampler.

2. **The defect classes this pass found are ones item 40 does not currently cover, so "finish item 40" is not sufficient to unblock 45.** Item 40 is scoped to *pin correctness*. But the worst findings here are a **wrong `has_fee`/`inspection_required`/`rentals_available` triple** (64), a **missing Nov–Jan public closure** (134), an **omitted sharp-debris hazard** (127), a **wrong water body** (70), and a **conditions-engine field that is wrong on 36 bay spots** (`tide_sensitive`). Fixing every coordinate in the app would leave all of those in production. **Item 40's acceptance criteria need widening from "the pin is on the put-in" to "the record is true," or 45 will unblock against the wrong gate.**

3. **The strongest argument is the one that cuts the other way, and it should be said plainly.** I found **no second spot 79**. The refuge launches that looked most fabricated are the best-sourced records in the app, because they came from a real authoritative corpus. **The pipeline's failure mode is not invention. It is ingesting a good source and then losing what the source meant:** the Water Trail's trailhead point became "the put-in", its site report's hunting closure was dropped, its "beach" became "paved ramp". Spot 79 is the tail of that distribution, not its center.

That is *better* news than the audit's framing, and it still blocks 45. **A pipeline that faithfully ingests a registry and silently drops its safety caveats will scale exactly that behavior.** 134's missing hunt-day closure is the proof: a paddler drives to Hayward on one of ten published dates and is locked out, and no coordinate audit would ever have caught it.

**What would unblock 45,** concretely:
- **Run the Water Trail cross-check** (findings 0 and 1). It is the single highest-value action in this report. It is authoritative for the Bay Area, it carries every field the app needs, and it both **clears** correct records (138, 127, 130, 132) and **exposes** the ones that drifted from their source (47, 70, 65, 134). DBW cannot do this job.
- Fix `tide_sensitive` across the 70 bay spots. It is the highest value-per-edit item here and it repairs the differentiator.
- Resolve the water-body record class (10 spots). This is a **schema decision**, not a data fix, and it should be made before more records are added through the same schema.
- Widen item 40's acceptance to cover notes and boolean fields, not just coordinates.

**Do not fix these by hand one at a time and call it done.** Every defect in this report traces to provenance, and the same pipeline is still pointed at the same sources.

---

## Method

**Screen 1 (reverse-geocode), all 127 unaudited spots.** Nominatim reverse geocode at zoom 18; fired when the coordinate resolves to a road/track/path/footway/cycleway, a building, a parking amenity, a park/pitch/landuse polygon, or a place/boundary centroid **and** sits >300 m from any launch feature. Launch features from one bulk Overpass query over California (`leisure=slipway`, `waterway=access_point`, `canoe=yes`; 1,320 features), nearest computed locally by haversine.

**Screen 2 (registry), all 88 cities in the dataset.** Scraped the CA DBW facility table for every city (422 facilities), matched to spots by fuzzy name against `water` + `geocode_display`, fired where the notes assert a ramp/launch/hoist and the matched facility types as `Marina`, `NoFacility`, `Mooring Fields`, `Yacht Club`, `DryStorage`, or similar.

**Deep verification, 20 spots attempted / 15 completed**, against agency pages, the DBW facility registry, SF Bay Water Trail trailhead pages and site-description reports, CDFW, USFWS, Sonoma County Parks, CA State Parks, and OSM/Overpass geometry.

**No level, claim, or coordinate in this report is taken from a search-result summary or an AI overview.** Where a primary source was unreachable, the finding is marked unverified and no value is proposed.

**Sources**

[DBW facility registry](https://dbw.parks.ca.gov/BoatingFacilities/) · [DBW f/1185 McNears Beach](https://dbw.parks.ca.gov/BoatingFacilities/f/1185) · [DBW f/1150 Devils Nose Put-in](https://dbw.parks.ca.gov/BoatingFacilities/f/1150) · [DBW Richmond](https://dbw.parks.ca.gov/BoatingFacilities/City/Richmond) · [DBW Livermore](https://dbw.parks.ca.gov/BoatingFacilities/City/Livermore) · [DBW Alameda](https://dbw.parks.ca.gov/BoatingFacilities/City/Alameda) · [DBW Petaluma](https://dbw.parks.ca.gov/BoatingFacilities/City/Petaluma) · [DBW San Rafael](https://dbw.parks.ca.gov/BoatingFacilities/City/San%20Rafael) · [DBW Bodega Bay](https://dbw.parks.ca.gov/BoatingFacilities/City/Bodega%20Bay) · [SF Bay Water Trail trailheads](https://sfbaywatertrail.org/trailheads/) · [WT: McNears Beach](https://sfbaywatertrail.org/trailhead/mcnears-beach/) · [WT: Petaluma Marina](https://sfbaywatertrail.org/trailhead/petaluma-marina/) · [WT: Petaluma River Turning Basin](https://sfbaywatertrail.org/trailhead/petaluma-river-turning-basin/) · [Sonoma County Parks: Westside Regional Park](https://parks.sonomacounty.ca.gov/visit/find-a-park/westside-regional-park) · [101 Surf Sports](https://101surfsports.com/) · [WT: Estuary Park](https://sfbaywatertrail.org/trailhead/estuary-park/) · [WT: Marina Bay Yacht Harbor](https://sfbaywatertrail.org/trailhead/marina-bay-yacht-harbor/) · [WT: Shimada Friendship Park](https://sfbaywatertrail.org/trailhead/shimada-friendship-park/) · [WT: Vincent Park](https://sfbaywatertrail.org/trailhead/vincent-park/) · [WT: Tidewater](https://sfbaywatertrail.org/trailhead/tidewater/) · [WT: Cullinan Ranch](https://sfbaywatertrail.org/trailhead/cullinan-ranch-boat-launch/) · [WT: Bay Point](https://sfbaywatertrail.org/trailhead/bay-point/) · [WT: Eden Landing](https://sfbaywatertrail.org/trailhead/eden-landing/) · [WT site report: Cullinan Ranch (PDF)](https://sfbaywatertrail.org/wp-content/uploads/2020/12/CullinanRanch_WTSiteDescriptionReport_June2019.pdf) · [WT site report: Bay Point (PDF)](https://sfbaywatertrail.org/wp-content/uploads/2021/11/BayPointRS_SiteDescriptionRpts_March2021.pdf) · [WT site report: Eden Landing (PDF)](https://sfbaywatertrail.org/wp-content/uploads/2017/04/EdenLanding_WaterTrailReports_Sept2016.pdf) · [SCC site report: Dickson Ranch (PDF)](https://scc.ca.gov/files/2019/06/DicksonRanch_WTSiteDescriptionReport_June2019.pdf) · [CDFW Eden Landing ER](https://wildlife.ca.gov/Lands/Places-to-Visit/Eden-Landing-ER) · [CDFW ELER hunt dates](https://wildlife.ca.gov/Regions/3/Hunts/ELER) · [USFWS San Pablo Bay NWR](https://www.fws.gov/refuge/san-pablo-bay/visit-us/activities/hunting) · [EBRPD Del Valle](https://www.ebparks.org/parks/del-valle) · [EBRPD MLK Jr. Regional Shoreline](https://www.ebparks.org/parks/martin-luther-king) · [CA State Parks: Folsom Lake SRA launch status](https://www.parks.ca.gov/?page_id=31951) · OpenStreetMap via [Overpass API](https://overpass-api.de/) (ODbL) · [Nominatim](https://nominatim.openstreetmap.org/)

Internal: `reports/coord-audit-2026-07-16.md` · `reports/paddle-score-pilot-A.md` · `reports/paddle-score-pilot-B.md` · `ROADMAP.md` item 40 · `data/spots.json`
