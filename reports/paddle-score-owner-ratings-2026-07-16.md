# Item 39: owner ratings vs. the weighted score

**Date:** 2026-07-16
**Source:** owner-supplied `Untitled spreadsheet.xlsx`, 119 of 142 spots rated (84%), 0 notes
**Compares against:** `reports/paddle-score-pilot-A.md`, `reports/paddle-score-pilot-B.md` (rubric v2, put-in only, per D15)
**Status:** research only. `data/spots.json` NOT modified.

---

## Headline

**The owner's ratings clear the kill criterion the computed rubric failed, but only in two of nine regions. The pooled spread that clears the bar is mostly between-region variation, and users choose within a region.**

- Pooled spread: **2.0** (3.0 to 5.0) vs. the 1.5 threshold. Rubric got 1.1 (A) and 0.8 (B).
- Within-region spread: **3 of 9 regions pass**, and only one of those has meaningful n.
- **North Bay (n=46): spread 1.9. PASS.** This is the finding worth shipping.
- **East Bay (n=29): spread 0.4. All 29 ratings sit inside the 3.8-4.2 band.** No information.

**Recommendation: ship the owner rating for North Bay only. Do not compute a score. Item 39 as specified (a weighted rubric) stays cut per D16.**

---

## 1. The owner rating measures a different thing than the rubric

On the 6 pilot spots the owner also rated:

| id | Spot | Owner | A | B |
|---|---|---|---|---|
| 45 | China Camp | **5.0** | 3.6 | 3.6 |
| 112 | Morro Bay | **4.6** | 3.8 | 4.1 |
| 38 | Miller Boat Launch | 4.8 | 4.7 | 4.1 |
| 63 | Berkeley Marina | 4.1 | 4.0 | 4.3 |
| 135 | Emeryville Marina | 3.9 | 3.8 | 3.6 |
| 84 | MLK Jr. Shoreline | 4.1 | 4.2 | 4.0 |

- `corr(owner, A) = 0.044`
- `corr(owner, B) = -0.101`
- `corr(A, B) = 0.522`

The two researchers agree with each other and neither agrees with the owner. This is not noise. **D15 scoped the rubric to the put-in** (ramp, parking, launch traffic, facilities). The owner is rating **the paddle**. China Camp is a mediocre carry to a beautiful paddle: 3.6 and 5.0 are both correct answers to different questions.

The owner rating is also **not** a grade of our own copy: `corr(owner rating, length of our notes text) = -0.037`.

**Consequence:** these are not two estimates of one quantity, so they cannot be averaged, blended, or validated against each other. The rubric stays cut. What the owner produced is a different feature: an editorial rating, one paddler's take on where is worth going.

---

## 2. The ratings were entered in regional blocks, not per spot

Sorting the sheet in its original row order and looking for runs of identical consecutive values:

| run length | value | ids | region |
|---|---|---|---|
| 8 | 4.0 | 65, 82, 147, 69, 118, 70, 140, 67 | East Bay |
| 7 | 3.9 | 86, 127, 62, 134, 135, 59, 60 | East Bay |
| 7 | 4.4 | 39, 44, 122, 54, 53, 49, 52 | North Bay |
| 6 | 3.8 | 61, 85, 64, 149, 139, 83 | East Bay |
| 6 | 3.9 | 93, 95, 91, 133, 89, 48 | North Bay |
| 5 | 4.2 | 58, 88, 68, 80, 66 | East Bay |
| 4 | 4.9 | 126, 55, 137, 31 | North Bay |

**Permutation test** (10,000 shuffles of the same 119 values, preserving the value distribution):

- Observed longest identical run = 8. `p(>= 8 by chance) = 0.0000`
- Observed runs of 4+ = 7. `p(>= 7 by chance) = 0.0000`

Under independent per-spot judgment, a run of 8 is essentially impossible. **Every run is confined to East Bay or North Bay** (the two regions carrying 63% of the ratings). The thin regions show no runs at all: their values vary row to row.

Read: for large blocks, the owner applied a regional impression down a range of rows rather than judging each spot. That is a reasonable way to fill a 142-row sheet, and it is fatal to within-region discrimination, which is the only discrimination a user needs.

---

## 3. The real test: spread within a region

The user in Oakland is choosing among East Bay spots. Pooled spread is irrelevant to them.

| region | n | min | max | spread | mean | verdict |
|---|---|---|---|---|---|---|
| North Bay | 46 | 3.1 | 5.0 | **1.9** | 4.15 | **PASS** |
| East Bay | 29 | 3.8 | 4.2 | **0.4** | 3.98 | FAIL |
| Sierra Nevada | 8 | 3.4 | 4.7 | 1.3 | 4.17 | FAIL |
| Peninsula | 7 | 3.1 | 4.6 | 1.5 | 4.00 | FAIL (n too thin) |
| San Francisco | 7 | 3.0 | 3.9 | 0.9 | 3.66 | FAIL |
| Central Valley | 6 | 4.0 | 4.9 | 0.9 | 4.28 | FAIL |
| South Bay | 6 | 3.1 | 4.8 | 1.7 | 3.98 | PASS (n too thin) |
| Central Coast | 5 | 3.9 | 4.8 | 0.9 | 4.36 | FAIL |
| Sacramento | 5 | 3.3 | 5.0 | 1.7 | 4.36 | PASS (n too thin) |
| **pooled** | **119** | **3.0** | **5.0** | **2.0** | **4.09** | PASS |

**The pooled 2.0 is an artifact of averaging regions with different means.** It does not survive decomposition.

North Bay is the exception and it is a real one: 46 of 48 North Bay spots rated (only 2 blank), spread 1.9, multiple distinct blocks. That is the profile of someone rating their home water. It is the one region where the owner's ratings both exist at density and carry information.

---

## 4. Spot 79

The owner rated spot 79 (`Coyote Creek Tidal Launch`) **3.9**. Spot 79 is this project's one confirmed fabrication, hidden earlier today: no public put-in exists, the coordinate reverse-geocodes to the Nimitz Freeway, OSM has no slipway within 6km, and the notes cite the wrong closure months and the wrong species.

The owner's account is that this was a slip. **The row structure supports that.** Spot 79 is not inside any fill-down run; its neighbours in sheet order read 3.6, **3.9**, 4.1, 4.4, 4.8. It was entered individually, next to individually-varying values.

Two process facts follow:

1. **The blank sheet should never have contained 76 and 79.** It was generated over `ALL_SPOTS_INCLUDING_HIDDEN`, which is correct for data tooling per CLAUDE.md, but a rating sheet sent to a human is not an audit: it asks for judgment, and it asked for judgment on a place that does not exist. Any future sheet must be generated from `ALL_SPOTS`.
2. **79 is dropped**, and stays hidden pending D14.

---

## 5. What to ship

**Ship:** an owner rating on **North Bay spots only** (46 spots, minus any the owner withdraws).

- Label it as what it is: one paddler's take on the paddle, not a computed score and not an aggregate. There is no rating population to aggregate.
- Show nothing where there is no rating. A blank is not a gap (per the sheet's own instructions).
- Behind an experiment flag, per the standing owner directive of 2026-07-02.

**Do not ship:**

- The 29 East Bay ratings. A field where 100% of values fall in a 0.4-wide band tells the user nothing while carrying the full risk of an editorial claim. This is exactly what §4.1's kill criterion was written to catch, and it should bite here as readily as it bit the rubric.
- The 6 thin regions (n <= 8). Not enough coverage to be useful, and their pass/fail is n-noise.
- Any computed or blended score. See §1.
- Spot 79.

**Flag for the owner, unrelated to the score:** spot 92 (San Rafael Canal) is rated 4.3 and the 127-spot sweep found it is a private shop's dock where a user may have no right to launch. An owner rating on it would be the app vouching for it. Resolve the sweep finding before any rating on 92 ships. Same order of concern for 47 (rated 4.3, notes claim a paved ramp that is actually a beach) and 134 (rated 3.9, published seasonal closure omitted).

---

## 6. Method note, in the house tradition

Every screen this project has invented has had a false-positive rate its author could not see (decimal-count 36%, DBW 75%, reverse-geocode 20%+). So, against this analysis:

- The run test is strong (p < 0.0001) but it **cannot distinguish "block-filled from an impression" from "these spots genuinely are all the same"**. If East Bay launches really are uniformly ~4.0, the ratings are honest and still not displayable, because a constant carries no information either way. The recommendation is the same under both readings, which is why it is safe to act on. But do not report the run test as proof the owner guessed.
- The within-region spread test inherits the pilot's threshold (1.5) unchanged, deliberately. It was pre-committed in §4.1 before any of this data existed.
- n <= 8 regions are reported but not judged. Their spreads are not meaningful.
