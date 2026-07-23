# Inland SoCal reservoir ingest, tranche 1 (item 138), 2026-07-23

**Scope.** Item 138 (owner-directed) asked to expand SoCal coverage. Per the source inventory (`reports/ca-source-inventory-2026-07-22.md`), the real gap is **inland** SoCal: the CCC coastal corpus is largely spent (items 90/94/95/96), while the population-dense inland reservoirs east and north of LA had **zero** coverage. This tranche picks that one sub-region: inland reservoirs of the Inland Empire (Riverside / San Bernardino) plus the two large north-LA-County DWR lakes.

**Method (the proven way, items 90/94/95/96, not the spot-79 way).**
1. A registry/operator generates the candidate; a search never produces a record.
2. **Every coordinate is an OSM-verified put-in slipway**, not a geocoded address (addresses land on roads/parking, the 127/130/132 and Launch-Pointe trap, see the two deferrals below). Slipways pulled from OSM Overpass (`leisure=slipway` / `waterway=slipway`), several named identically to the operator's own ramp.
3. **Public paddle access confirmed per site against the operating agency** (parks.ca.gov, the county/water-district/municipal operator). Access rules, permits, and inspection requirements are quoted into the notes as evergreen description.
4. Per-field provenance; a guessed boolean is worse than an absent one. `tide_sensitive` is `false` from fact (inland), so the conditions engine's #1 landmine does not apply.

## Classification

CARRIED = already a spot; MERGED = duplicate of an existing record; GENUINE-GAP = new, verified, ingested; EXCLUDED = not ingested, with reason.

| Lake | County | Class | Put-in (OSM slipway) | Access confirmed | Notes |
|---|---|---|---|---|---|
| **Lake Perris** | Riverside | GENUINE-GAP (id 185) | 33.867686, -117.177959 (marina ramp) | parks.ca.gov: non-powered vessels permitted; quagga inspection; day-use fee | Inland Empire |
| **Silverwood Lake** | San Bernardino | GENUINE-GAP (id 186) | 34.282732, -117.332441 (marina ramp; Cleghorn hand launch noted) | parks.ca.gov: commercial kayaks/SUP permitted, no non-commercial inflatables; inspection; day-use + launch fee | Inland Empire |
| **Castaic Lagoon** | Los Angeles | GENUINE-GAP (id 187) | 34.498756, -118.608994 (OSM "Lagoon Launch Ramp") | castaiclake.com / DWR: lower lake reserved for non-powered craft, electric only; dry inspection; day-use + $7 non-motorized launch | LA region; `power_boats:false` (lagoon) |
| **Big Bear Lake** | San Bernardino | GENUINE-GAP (id 188) | 34.261624, -116.888721 (OSM "Carol Morrison East Boat Ramp") | bbmwd.com: SUP/kayak allowed with a Lake Use Permit + quagga inspection; two public north-shore ramps | Inland Empire; 6,750 ft |
| **Pyramid Lake** | Los Angeles | GENUINE-GAP (id 189) | 34.678776, -118.783492 (OSM "Emigrant Landing Boat Ramp") | Angeles NF concessionaire: kayak/SUP allowed, rentals on site; dry inspection; limited entry hours | LA region |
| Lake Elsinore | Riverside | **DEFERRED** | (unverified) | lake-elsinore.org: Launch Pointe 6-lane ramp, kayak/SUP OK | Access confirmed, but the address geocodes to a road point and no OSM slipway could be matched to Launch Pointe with confidence. Not ingested without a verified put-in. |
| Lake Gregory | San Bernardino | **DEFERRED** | (unverified) | lakegregory.com: non-motorized only, SUP allowed with PFD, $13 launch | Access confirmed, but OSM holds no slipway for the boathouse launch. Not ingested without a second-source put-in. |
| Lake Skinner | Riverside | **EXCLUDED** | n/a | rivcoparks.org: no body contact, no sit-on-top kayaks, no inflatables, kayaks 10ft+ only, 7-day quarantine | SUP effectively not viable; the app leads with SUP. Not a hide (DBW-type is never grounds to hide); simply not a paddle-launch this tranche represents. |
| Diamond Valley Lake | Riverside | **EXCLUDED** | n/a | mwdh2o.com: body contact prohibited, sit-on-top kayaks not allowed | Same MWD drinking-water ruleset as Skinner; no SUP. |
| Lake Cahuilla | Riverside | **EXCLUDED** | n/a | conflicting sources (one says kayaking OK, one says shore-fishing only) | Access unconfirmed. Not ingested until the operating agency confirms paddle access. |

## Result

**5 genuine gaps ingested** (ids 185-189), each with an OSM-verified put-in, confirmed public paddle access, facility type per the operator, `tide_sensitive:false` from fact, and per-field provenance. New region **"Inland Empire"** added to `REGIONS` (ADD, never rename). `precompute_gridpoints.py` re-run so all five resolve one-hop NWS wind (verified live: Big Bear's conditions panel loaded real data). No existing coordinate churn (`git diff data/spots.json` shows only added rows).

**Follow-ups for a later tranche:** Lake Elsinore and Lake Gregory (access confirmed, put-in coordinate needs a second source); the San Diego County inland reservoirs (Miramar, Murray, Hodges, Poway, Santee, Jennings, Otay, San Vicente, El Capitan, Dixon) were not touched here and are the obvious next inland sub-region. Item 45 stays open for the un-registried regions.
