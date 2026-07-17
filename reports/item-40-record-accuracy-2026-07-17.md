# Item 40 record-accuracy audit

**Date:** 2026-07-17
**Scope:** ROADMAP item 40, split into two phases per the owner's 80/20 direction. This file is appended by the coordinate-correction phase; each phase gets its own heading.

---

## Phase 1: tide_sensitive

**Candidate set (keyword screen fire):** 1, 25, 27, 29, 38, 39, 40, 41, 43, 44, 51, 60, 82, 96.

**Method.** A regex hit on "tide"/"tidal" is not evidence, it cannot tell an assertion from its negation. Each candidate's own `notes` field was read in full and the flag was flipped from `false` to `true` only where the notes unambiguously describe tidal dependence: a required tide window to launch or pass a point, or an explicit statement that the spot is unusable outside one. Where the notes merely label the water "tidal" with no dependency described, or describe a general current characteristic without an action tied to tide state, the flag was held at `false` and logged as ambiguous. Where the notes explicitly negate tidal dependence, the flag was held at `false` as already correct.

**Result: 7 flips, 5 ambiguous holds, 2 negation holds (correctly false, unchanged).**

### Per-spot verdict

| id | difficulty | decision | quoted note |
|---|---|---|---|
| 1 | bay | **FLIP** | "Tidal range runs 9-10 feet, so push off about an hour before low." |
| 25 | bay | **FLIP** | "Stick to mid or high tide or you'll bottom out in the muck before reaching the inner sloughs." |
| 27 | bay | HELD (ambiguous) | "Open San Francisco Bay water with moderate tidal current." |
| 29 | bay | **FLIP** | "paddle upstream past the Bon Air Road bridge at high tide. Tidal, so check the chart and go with the flow." |
| 38 | bay | HELD (ambiguous) | "Watch for afternoon NW winds and opposing tides mid-bay near Hog Island, where chop builds quickly." |
| 39 | bay | **FLIP** | "Unusable at low tide when mudflats extend into the inlet, so check tides before arriving." |
| 40 | river | HELD (ambiguous) | "A mellow tidal stretch through downtown with winery-flanked banks and almost no boat traffic." |
| 41 | bay | **FLIP** | "The creek grows more tidal toward San Pablo Bay, so plan for a mid-to-high tide to keep water under your board." |
| 43 | river | HELD (ambiguous) | "Two put-ins on the same tidal river." |
| 44 | bay | **FLIP** | "Closed March 1 through June 30 for seal pupping; otherwise time mid-to-high tide to avoid stranding on mudflats." |
| 51 | bay | **FLIP** | "Currents at the Gate can hit 6 knots on a strong ebb, so check the tide tables before heading outside the cove." |
| 60 | bay | HELD (negation, correctly false) | "Usable at all tide levels." |
| 82 | flatwater | HELD (ambiguous) | "A rare urban paddle on a tidal lagoon in the heart of Oakland, ringed by parks and grand architecture." |
| 96 | flatwater | HELD (negation, correctly false) | "SF's largest freshwater lake, ringed by a 4.5-mile paved trail and free of tides and currents." |

### Why each ambiguous hold is not a flip

- **27**: "moderate tidal current" describes a characteristic of the open-Bay water at this launch, not a dependency, the notes give no tide window to plan around and no action tied to tide state.
- **38**: "opposing tides" is named as one ingredient of a wind-driven chop hazard on one stretch mid-crossing (paired with "afternoon NW winds"), not a statement that the launch or route depends on tide state.
- **40**: "mellow tidal stretch" labels the water as tidal with no usability constraint attached anywhere in the note.
- **43**: "same tidal river" labels the water as tidal; the rest of the note ("Calm, ideal for mellow out-and-back sessions") describes no dependency.
- **82**: "tidal lagoon" labels the water as tidal with no usability constraint described; the note is otherwise about the launch location and dog policy.

### Why the two negations were held, not flipped

- **60**: "Usable at all tide levels" is an explicit statement that tide state does not gate usability here. Flipping this would contradict the record's own claim.
- **96**: "free of tides and currents" is an explicit statement that the lake has no tidal influence at all. Flipping this would contradict the record's own claim.

### Flipped set (7): 1, 25, 29, 39, 41, 44, 51

All seven notes contain either an explicit tide window instruction ("plan for a mid-to-high tide", "time mid-to-high tide", "push off about an hour before low", "paddle upstream ... at high tide"), an explicit unusable-outside-window statement ("Unusable at low tide when mudflats extend"), or an explicit instruction to check tide state before proceeding tied to a described consequence ("Stick to mid or high tide or you'll bottom out"; "Currents at the Gate can hit 6 knots on a strong ebb, so check the tide tables before heading outside the cove").

**Verification:** `lib/spots.test.ts`, describe block `tide_sensitive corrections (item 40, 2026-07-17)`, asserts the flipped set is `true`, the two negation holds (60, 96) stay `false`, and the five ambiguous holds (27, 38, 40, 43, 82) stay `false`. `git diff data/spots.json | grep '"tide_sensitive"'` shows exactly 7 `false` to `true` line pairs and no other change to the file (no lat/lng lines touched, record count unchanged at 142).
