# San Diego County ingest: candidates and the manual-lookup list

Source: CCC YourCoast full pull, 2026-07-22. Same method as `la-ingest-candidates-2026-07-22.md`.

## What the filter produced

| | LA (for comparison) | **San Diego** |
|---|---|---|
| County records | 230 | **197** |
| `BOATING = Yes` | 37 | **40** |
| Paddle-plausible after filtering | 51 | **65** |
| ...explicit launch type | 11 | **17** |
| ...**paddle-specific** (hand / kayak / small-craft) | 2 | **6** |
| Already within 500 m of an existing spot | 0 | **0** |

**San Diego is the better county, as expected.** It has three times LA's paddle-specific launches, and most of them sit in Mission Bay, which is protected, purpose-built for watersports, and the densest paddle water in the state.

## The 6 paddle-specific candidates, tiered

**Tier 1, protected water and paddle-typed. Strongest in the state so far.**

| Name | Type | CCC fee | Location |
|---|---|---|---|
| **El Carmel Point** | Small-Craft Boat Launch | No | Mission Bay, "Bay beach, kayak launch" |
| **Playa Pacifica** | Kayak Launch | No | Mission Bay, off E. Mission Bay Dr. |
| **Crown Cove** | Hand Launch | Yes | Coronado, Crown Cove Aquatic Center, San Diego Bay access via Silver Strand |

**Tier 2, real but each needs a call.**

| Name | Issue |
|---|---|
| **Agua Hedionda Lagoon**, Carlsbad | Protected lagoon, CCC describes "water-skiing, kayaking, birding". **CCC's `FEE=No` is WRONG**, see below. |
| **La Jolla Shores Beach Park** | The single most iconic kayak launch in San Diego, and genuinely open ocean. CCC's own description is "Swimming, surfing, diving". Needs a surf caveat if listed. |

**Tier 3, recommend excluding.**

| Name | Why |
|---|---|
| **Cardiff State Beach** | Typed `Hand Launch`, but CCC's own description is "Swimming, **surfing**, surf fishing". Open-ocean surf break, the Malibu class from the LA batch. |

## The finding that matters: CCC's fee field is wrong on the first candidate checked

**Agua Hedionda Lagoon: CCC says `FEE = No`. A Carlsbad city permit is REQUIRED to be on the water**, sold at roughly $9/day, plus a $10 launch fee if you launch from the California Watersports beach. There is a free public launch on Bayshore Drive that avoids the launch fee but **not** the permit.

This is exactly the failure the statewide inventory predicted for SoCal: **records fail by staleness and access rules, not by drifting from a good source.** CCC's lineage is a 2014 guidebook, and a permit regime introduced since is invisible to it. Shipping `has_fee: false` here would tell a paddler they can launch free when they would be on the water illegally.

**Consequence for the ingest: `FEE` cannot be carried from CCC unverified for San Diego.** In LA it was safe because the owner confirmed each one. Here it has already been caught lying once.

## The 11 boat ramps

Oceanside Harbor, Santa Clara Point, Dana Landing, Ski Beach, De Anza Cove, South Shores Park (all Mission Bay); Shelter Island, America's Cup Harbor, Glorietta Bay, Pepper Park, Chula Vista Launch Ramp (San Diego Bay).

All are protected water, which is in their favour. But **the owner already set a precedent in LA by excluding the Fiji Way ramp** ("I don't know, exclude this spot") on the grounds that a trailer ramp is not obviously a place a paddler is welcome. That precedent should decide these as a category rather than one at a time.

## Coordinate status

Worse than LA. Two of three Overpass boxes returned 504, and the Mission Bay box that did return shows **no slipway within 400 m of any paddle-specific candidate** (El Carmel Point 456 m, Playa Pacifica 1,322 m). That is consistent rather than alarming: a kayak launch on a bay beach has no slipway to map. **It does mean OSM cannot correct these coordinates, so they need eyes.**

---

# MANUAL LOOKUP LIST

## A. Blocking: put-in coordinate for the tier 1 and tier 2 sites

CCC's coordinate is a site locator, not a put-in, and OSM has nothing to match against here.

| Site | What I need |
|---|---|
| **El Carmel Point**, Mission Bay | Put-in coordinate. |
| **Playa Pacifica**, Mission Bay | Put-in coordinate. |
| **Crown Cove**, Coronado | Put-in coordinate. Also: is access public, or does it run through the Aquatic Center? CCC says entry is via Silver Strand State Beach, which implies a state-beach entry fee on top. |
| **Agua Hedionda Lagoon** | Which launch: the free public one on Bayshore Drive, or California Watersports' beach? They have different fees and probably different coordinates. |
| **La Jolla Shores** | Put-in coordinate, and your call on whether to list an open-ocean launch at all (see B2). |

## B. Blocking: judgment calls

1. **The 11 boat ramps: in or out, as a category?** Your Fiji Way exclusion suggests out. If you want a subset, Mission Bay's (Santa Clara Point, Ski Beach, De Anza Cove, South Shores) are the calmest water in the county.
2. **La Jolla Shores.** It is the standard San Diego kayak launch and it has real surf. Include with a surf caveat in the notes, or exclude on the same grounds as Cardiff and the Malibu beaches?
3. **Cardiff State Beach.** I recommend excluding. Confirm.

## C. Would otherwise be guessed

4. **Fees, for every San Diego record.** CCC has already been caught wrong once here. Do not let me carry `FEE` through unverified; tell me which of the shortlist actually charge, or I will store `null` rather than a value I cannot stand behind.
5. **`tide_sensitive`.** Mission Bay and San Diego Bay are tidal, so `true`. Agua Hedionda is a lagoon with tidal exchange through jetties, so probably `true`. Confirm if you know otherwise.
6. **The other 48** beach carry-in candidates are not listed here. Same reasoning as LA: mostly open-coast beach access, not put-ins. Name any you want and I will check them.
