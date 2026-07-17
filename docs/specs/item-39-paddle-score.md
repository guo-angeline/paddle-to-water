# Item 39: Paddle score, rubric + row design

Status: **PILOT RUN 2026-07-16. KILL CRITERION MET BY BOTH RESEARCHERS. Recommendation: CUT item 39 as specified.** See §5 for the result. The rubric below is reproducible; the score it produces is not useful. Both things are true, and §5 explains why that is not a contradiction.

Prior status: **§0.1 RESOLVED by the owner 2026-07-16: option (a), PUT-IN ONLY.** Wind exposure and water quality are CUT. Rubric v2 in §1 reflects that; §1-old is preserved in git if the reasoning is ever needed. Next step is a 10-spot pilot (owner decision, 2026-07-16), not a 142-spot pass. Read alongside ROADMAP.md items 39, 40, 43, and DECISIONS.md D15.

Authored by the design-lead agent 2026-07-16. The legal-gate findings in §0.1 arrived from the lawyer agent in parallel and did **not** reach the design agent before it finished, so §1's rubric is written against the original brief. Where they conflict, §0.1 wins pending an owner decision.

---

## 0. Two independent findings that agree

The design agent and the lawyer agent worked in parallel without seeing each other's output, and converged on the same two conclusions by different routes. That convergence is worth noting: both are now well-supported.

**No star glyph for the editorial score.**
- *Design reason:* the list row already renders a bare number-plus-unit in that exact slot (`0.8 mi`, `SpotCard.tsx:55`), so a bare `4.2` reads ambiguously; and every other badge in this app spells its meaning out in words ("Flatwater", "Free", "Calm", "Watching"). A bare numeral badge would be the one exception, in the one place ambiguity is least affordable.
- *Legal reason:* stars ARE the consumer-aggregate idiom. FTC deception analysis turns on **net impression**, not fine print, so an 11px "our take" next to a star does not cure the "people rated this" read.
- *Shared resolution:* the editorial score is always word-labeled ("4.2 score") and never uses a star. The star glyph is reserved entirely for real human reviews (item 43). This is the mechanism that permanently dissolves the 39/43 collision.

**Not "paddleability".**
- *Design reason:* `lib/conditions.ts` already exports a `Paddleability` type for the live wind-based Calm/Breezy/Windy read. That is today's weather; item 39 is the spot's static researched character. Reusing the word confuses two different concepts on the same page.
- *Legal reason:* "paddleability" reads as "safe to paddle" on a site whose central risk is a wrongful-death claim.
- *Shared resolution:* **"Paddle score"** in copy, code, and data (`paddle_score`).

### 0.1 RESOLVED: the score is about the PUT-IN, not the paddle

**Owner decision 2026-07-16: option (a), put-in only.** Wind exposure and water quality are cut from the rubric entirely. The score covers the launch and its facility: getting the board from the car to the water, parking, the state of the place, and how contested it is.

Why this was the right call, recorded so it is not relitigated:
- The lawyer called "rate the put-in, not the paddle" the single highest-leverage decision in the whole reviews/accounts block. An average **you compute** is arguably first-party speech with no Section 230 protection (*Lemmon v. Snap* and progeny let negligent-design claims past 230 when they target the platform's own design choice). A plaintiff does not plead "you published a user's false statement", they plead "you designed and displayed a 5-star safety signal next to a live conditions widget."
- It also gives the product a clean seam, which is worth more than the legal argument alone: **the score answers "how good is this launch" (static, editorial, researched once). The conditions engine answers "is it good right now" (live, per-spot, already shipped and already the differentiator).** Two questions, two surfaces, no overlap. A score that mixed them would compete with the thing that already works.
- Item 43 (reviews) inherits this boundary: reviews are about the launch and facility too, never about whether the water was safe or suitable for a skill level.

**What this costs, honestly.** The design agent weighted wind exposure highest (0.30) and its argument was real: wind exposure is the one axis the app cannot answer live, because a spot can have a calm forecast today and still be a structurally bad pick (a big-fetch bay whitecaps by 1pm regardless). Cutting it means the score cannot warn about that. If that gap matters later, the honest home for it is **descriptive prose in the spot's `notes`** ("exposed to afternoon westerlies across 3mi of open fetch"), which is a fact about the place, not a rating that implies a safety verdict.

**The open question this raises, which the pilot exists to answer:** does a put-in-only score actually discriminate? If parking and ramp quality are broadly fine across the Bay Area, every spot lands at 3.5-4.5 and the score is decoration. See §4.

### 0.2 Required additions the design spec is missing

From the legal gate, not yet reflected in §2:

- **Basis disclosure at the point of claim**, in the breakdown card, NOT on a policy page: *"Scored from public sources and maps. We have not visited every spot."* This is what makes the score defensible opinion rather than a naked implied fact. The "3 sources" meta line in §2.4 is good and citable, but it is not this.
- **The rubric must actually be applied.** A published rubric decorating a vibes score is deception, and git history proves it. If the ~1 person-week in §1.7 is not spent, the rubric must not be published as if it were.
- **Never blend user stars into the editorial score.** Two numbers, two labels, structurally separate. §2.3 already does this correctly; keep it that way.
- **No aggregate under 5 reviews.** §2.3's N ≥ 5 threshold already matches the lawyer's independent recommendation.
- **Item 34** (alert copy reframe) is now step zero for this whole block. `"looks good right now. Go while it lasts."` is still live in `app/api/cron/send-reminders/route.ts:68` and every rating surface compounds on top of it.

---

## 1. The rubric, v2 (put-in only, per §0.1)

Four axes. All four are about the launch and its facility. None is about the water, conditions, or whether a spot suits a skill level. v1 (wind exposure 0.30, water quality 0.15) is preserved in git history.

### 1.1 Axes and weights

| Axis | Weight | Derivable from `spots.json` today? |
|---|---|---|
| Launch ease | 0.40 | Partial. `tide_sensitive` + `notes` give a strong prior; final level needs an imagery check |
| Parking | 0.30 | No. No structured field; `has_fee` is a weak proxy at best |
| Launch-area traffic | 0.15 | Mostly. `power_boats` gives a direct signal, but the question is narrower (see below) |
| Facility condition | 0.15 | No. Needs per-spot research |

Launch ease carries 0.40 because it is the axis that actually decides whether a paddler can use the place: everything else is friction, but a marginal put-in is a no. Parking is next because in the Bay Area it is the most common real-world blocker on a good day.

### 1.2 Axis level definitions

Written to be measured, not felt, so two researchers land within one level of each other.

**Launch ease (0.40).** Car to water, with a board.
- 5: Paved ramp or dock, gentle grade, carry under 50 ft, tide-independent.
- 4: Improved but unpaved. Graded gravel/dirt or beach, carry 50-150 ft; or a paved ramp with a longer carry.
- 3: Natural shoreline. Sand/gravel beach or bank, carry 150-300 ft.
- 2: Difficult footing. Mudflat, reeds, riprap, or a steep bank; carry over 300 ft.
- 1: Marginal. No formal access, a long bushwhack, or usable only at a narrow tide window.

`tide_sensitive: true` pushes toward 2-3 unless notes describe a floating dock or similar tide-independent access. Read `notes` first, it is often most of the answer.

Note the boundary: tide-dependence counts here as **access** (can you physically launch), not as a water-safety judgment. Describe it, do not warn about it.

**Parking (0.30).**
- 5: Dedicated free lot at the launch, rarely full.
- 4: Free street or lot within < 0.1 mi, typically available.
- 3: Paid lot or meter; or free but fills on summer weekends; or a 0.1-0.25 mi walk.
- 2: Scarce. A handful of spots, frequently full, or a 0.25-0.5 mi walk.
- 1: Very limited. Informal roadside with tow or ticket risk, or over 0.5 mi with gear.

No structured prior. Research via satellite imagery (lot size) and recent map reviews mentioning parking. `has_fee`/`fee_amount` correlates weakly with a maintained lot, which argues against a 1, but does not separate 3 from 5.

**Launch-area traffic (0.15).** Congestion **at the put-in**, not boat traffic out on the water. The question is whether you can get on your board without queuing behind trailers or standing in a fairway.
- 5: Paddler-oriented access, separate from any ramp; no trailer queue.
- 4: Shared ramp, light use; you may wait briefly on a summer weekend.
- 3: Shared ramp, moderate use; a real queue at peak times.
- 2: Busy ramp. Trailer traffic dominates, launching a board means working around it.
- 1: The put-in sits in an active marina fairway or a commercial ramp; hard to launch safely at all.

`power_boats: false` pushes toward 4-5. `true` means research where the paddler actually enters relative to the ramp.

This is deliberately narrower than v1's "wake / boat traffic", which rated the water. Wake out on the water is a conditions question, not a put-in question.

**Facility condition (0.15).** The state of the place. Restrooms, trash, maintenance, lighting, signage.
- 5: Well-maintained. Restrooms, trash service, clear signage, obviously cared for.
- 4: Maintained. Basic amenities present and working.
- 3: Basic. Little or no amenity, but not neglected.
- 2: Neglected. Litter, broken or locked facilities, no signage.
- 1: Degraded or unsafe-feeling. Persistent dumping, vandalism, or an access point in disrepair.

This is facility cleanliness, **not water quality**. Trash in the parking lot is in scope. Algae in the water is not.

### 1.3 Aggregation

```
score = round(0.40*launch_ease + 0.30*parking + 0.15*launch_traffic + 0.15*facility, 1)

// Access floor: a spot you cannot reasonably launch from is not a 3 because
// the parking is nice.
if launch_ease == 1:
    score = min(score, 2.0)
    capped = true
```

The v1 safety cap (which triggered on wind exposure 1 or an active water advisory) is **gone with its axes**. What replaces it is narrower and is not a safety claim: a launch-ease floor, so convenience axes cannot average away a put-in that barely exists. If a spot is under an active health advisory, that belongs in `notes` as a fact, or the spot gets `hidden`. It is not the score's job.

### 1.4 Storage

Rubric doc (auditable source of truth): `docs/rubrics/paddle-score-rubric.md`, versioned, with a changelog. Bump the version on any axis or weight change and record which spots need re-scoring.

Score data: a `paddle_score` object per spot in `data/spots.json`. Absent key = unscored, matching the `has_fee` tri-state precedent. **Insert it as text, never by JSON round-trip** (a reserialization silently reformats coordinates; see CLAUDE.md).

```json
"paddle_score": {
  "value": 4.1,
  "capped": false,
  "axes": {
    "launch_ease":     { "level": 4, "note": "Floating dock, ~80ft carry", "source": "<url>" },
    "parking":         { "level": 4, "note": "Free lot, rarely full", "source": "<url>" },
    "launch_traffic":  { "level": 5, "note": "Human-powered only, posted", "source": "<url>" },
    "facility":        { "level": 3, "note": "Basic, no restroom", "source": "<url>" }
  },
  "sources": 3,
  "rubric_version": "2.0",
  "scored_at": "2026-07-16",
  "scored_by": "agent-pilot"
}
```

**Every axis carries its own `source`.** This is not bookkeeping. Spot 79 reached production because an unsourced claim looked plausible; a per-axis source is what makes the difference between an applied rubric and a decorated guess, and it is what the lawyer's "the rubric must actually be applied" requirement cashes out to.

Compute the aggregate in one pure function (`lib/paddleScore.ts`) reading the same weights as the rubric doc, so the number can never drift from the documented formula.

### 1.5 Effort, revised for v2

v1 priced ~23-30 hrs for 5 axes across 142 spots. v2 cuts the two most research-heavy axes (water quality needed a HAB-portal check per water body; wind needed a fetch estimate per spot), so a full pass is roughly **12-18 hrs**. But per the owner's 2026-07-16 decision, **the next step is a 10-spot pilot, not a full pass.** See §4.

## 2. The row, designed once for items 39 and 43

### 2.1 Where it lives today

- **List card**, `SpotCard.tsx:52-57`: second line is `{city}` then `· {distance}` (near-me active, accent-colored) or `· {region}`. `text-xs text-(--muted)`.
- **Spot sheet**, `SpotDrawer.tsx:216`: `<p className="text-sm text-(--muted) mt-1">{city} · {region}</p>`, under the Newsreader `<h2>`.
- **Card pattern to reuse**, `ConditionsPanel.tsx:138-149`: uppercase tracking-wide muted eyebrow left, small muted meta right, in `rounded-xl border border-gray-200 bg-white p-3.5`.
- **Badge pattern**, `ConditionsBadge.tsx`: `rounded-full px-2 py-0.5 text-[11px] font-semibold`, with `aria-label` carrying the real meaning.

### 2.2 Design rule

**Colored pills = live or derived data** (water type, fee, today's wind). **Neutral ink = editorial voice** (the score, the axis dots, the OUR TAKE card). The score never borrows the teal/azure/rust water-type palette or the calm/breezy/windy status colors: reusing those hues would make an editorial judgment look like another data feed. The one deliberate exception is the capped/advisory line (§2.4), which borrows the warning color because it IS a status flag.

### 2.3 The row, exact copy

Score first, before `{city} · {region}` (it is the differentiator; city/region are already legible from the title above).

**List row** (`text-xs`), always editorial-only, forever, to keep cards scannable:
- Unscored: `Hayward · East Bay`
- Scored: `4.2 score · Hayward · East Bay`
- Scored, near-me active: `4.2 score · Hayward · 0.8 mi`
- Reviews exist, unscored: `★4.6 (12) · Hayward · East Bay`

**Sheet header row** (`text-sm`), has width for both:
- Unscored: `Hayward · East Bay`
- Scored, reviews < 5: `4.2 score · Hayward · East Bay`
- Scored, reviews >= 5: `4.2 score · ★4.6 (12) · Hayward · East Bay`
- Reviews only: `★4.6 (12) · Hayward · East Bay`

The second segment is a conditional branch from day one, so item 43 adds a render condition and tears nothing out. Below 5 reviews nothing shows: too noisy to average, and it matches the lawyer's independent "no aggregate under N>=5" requirement.

### 2.4 Spot-sheet breakdown: the "OUR TAKE" card

Placement: between the Notes block and `ConditionsPanel` in `SpotDrawer.tsx`. Editorial judgment and live weather are different time horizons and should read as distinct adjacent sections. Renders only when `paddle_score` exists; no skeleton, no placeholder (static bundled data, no loading state).

```
┌─────────────────────────────────────────────┐
│ OUR TAKE                    Paddle score ·   │
│                              3 sources        │
│  4.2 / 5                                      │
│                                                │
│  Wind exposure     ●●●●○   Mostly sheltered   │
│  Boat traffic      ●●●●●   No motors allowed  │
│  Launch ease       ●●●○○   Natural shoreline  │
│  Water quality     ●●●●○   Generally clean    │
│  Parking           ●●●●○   Usually easy       │
│                                                │
│  Scored from public sources and maps.         │
│  We have not visited every spot.              │
└─────────────────────────────────────────────┘
```

Chrome matches `ConditionsPanel`. Eyebrow `text-xs font-semibold text-(--muted) uppercase tracking-wide`, string **"OUR TAKE"**. Right meta mirrors "NOAA · weather.gov": **"Paddle score · {sources} sources"**. Headline `4.2/5` in Hanken Grotesk bold (UI data, not a title; Newsreader stays reserved for the spot name).

**The basis-disclosure line is required (§0.2), and belongs here, at the point of claim.** Copy: *"Scored from public sources and maps. We have not visited every spot."* `text-xs text-(--muted)`.

Axis rows: label left (`text-sm text-(--dark)`), five-dot indicator (decorative, `aria-hidden`, filled `--dark`, empty `--border`), level word right (`text-sm text-(--muted)`). One `aria-label` per row carrying the whole fact: `aria-label="Wind exposure: 4 out of 5. Mostly sheltered."`

**Canonical level words:**

| Level | Wind exposure | Boat traffic | Launch ease | Water quality | Parking |
|---|---|---|---|---|---|
| Level | Launch ease | Parking | Launch-area traffic | Facility condition |
|---|---|---|---|---|
| 5 | Paved ramp, short carry | Plenty of free parking | Paddler access, no queue | Well maintained |
| 4 | Improved access | Usually easy to find | Shared ramp, light use | Maintained |
| 3 | Natural shoreline | Can fill up on weekends | Shared ramp, queues at peak | Basic |
| 2 | Muddy or steep footing | Scarce parking | Busy ramp, trailer traffic | Neglected |
| 1 | Marginal put-in | Very limited parking | Active marina fairway | Run down |

A per-spot `note` replaces the generic word when one was authored during research ("Enclosed cove, ~0.4mi fetch" instead of "Mostly sheltered"). The generic word is the fallback, never the override.

**Capped state**, first line in the card when `capped: true`:
> **"Score capped: active water quality advisory (checked {date})."**

Uses the existing warning tokens from the Windy badge: `--wind-alert` (`#CC5528`) on `--wind-alert-fill` (`#FEE9E0`), `rounded-full px-2.5 py-1 text-xs font-semibold`.

**Optional summary sentence: defer to v2.** Adds ~3-5 hrs of authored, fact-checkable prose across 142 spots for a smaller marginal gain than the rubric itself, and every sentence is a specific factual claim that must be sourced.

### 2.5 States

| State | List row | Sheet row | Breakdown card |
|---|---|---|---|
| Unscored (today's default, all 142) | `city · region` | `city · region` | Does not render |
| Scored, no reviews | `4.2 score · city · region` | same | Renders |
| Scored, reviews < 5 | same as above | same as above | Renders |
| Scored, reviews >= 5 | same as above (list stays editorial-only) | `4.2 score · ★4.6 (12) · city · region` | Renders |
| Reviews only | `★4.6 (12) · city · region` | same | Does not render |
| Scored + capped | `2.0 score · city · region` | same | Renders WITH the cap line |
| Loading / Error | N/A. Bundled in `spots.json` at build time; no fetch, nothing to fail | | |
| Map | No popups exist in `MapView.tsx` today; no change needed | | |

### 2.6 Accessibility

Every glyph is `aria-hidden`; every fact it carries lives in an adjacent `aria-label` on real text. This matches the item-29 precedent (no unlabeled glyphs) already set by the heart toggle. Score text reuses `--dark` on white (well above AA); level words reuse `--muted`, the same token already used for city/region and distance, inheriting the existing accepted contrast profile. The cap line reuses the already-shipped `--wind-alert` pairing. No new interactive controls, so no new keyboard path. `globals.css` has no `outline: none` reset, so default focus rings show without extra work; if a future "How we score spots" link lands, keep it a real focusable `<a>`. Ship with zero motion so `prefers-reduced-motion` is moot rather than handled.

Note the open `--muted` body-text contrast question raised by item 38: muted text now renders gray for the first time, so verify these level words against AA before shipping.

---

## 3. Open decisions

1. **BLOCKING, §0.1: what the score is allowed to be about.** Put-in only (a), keep wind reweighted and hard-descriptive (b, recommended), or ship §1 as written (c). Owner + lawyer.
2. **BLOCKING, legal/SEO: never emit `aggregateRating`.** Do not add schema.org rating markup for the editorial score to `spotJsonLd()` in `lib/structured-data.ts`. That field is for crowd-sourced ratings under Google's guidelines and would recreate the exact fake-review problem the fabricated count was cut for; Google issues manual actions for misleading rating markup. If a rich-result star is ever wanted, it needs a `Review` authored by an `Organization` (not `Person`), and that is a lawyer-gate decision, not an implementer's default. **Recommendation: no structured data for the score in v1.** Flagged because an implementer will reach for `aggregateRating` naturally, since it is what makes the star show in search.
3. **Naming: confirm "Paddle score".** Recommended by both agents, for independent reasons (§0).
4. **Scope: defer the per-spot summary sentence to v2.** Recommended.
5. **Sequencing: score the 131 clean spots now, backfill the 11 after item 40.** Recommended.
6. **Process: run the 1-hour two-researcher calibration pass first.** Recommended. Wind exposure and parking are the two axes most exposed to individual judgment; catching divergence on 5-10 spots is cheap insurance against re-scoring 142.

---

## 4. The 10-spot pilot (owner decision, 2026-07-16)

**The pilot is not a warm-up. It is the go/no-go**, and it answers two questions that decide whether item 39 exists at all.

### 4.1 Question 1: does a put-in-only score discriminate?

With wind and water quality cut, the score rests on launch ease, parking, launch-area traffic, and facility condition. **If Bay Area launches are broadly similar on those, every spot lands at 3.5-4.5 and the score is decoration** on a row that currently costs nothing. That is a real possible outcome and the pilot must be allowed to return it.

Kill criterion, set BEFORE seeing results so it cannot be rationalized after: if 10 spots chosen to span the expected range produce a spread narrower than **1.5 points**, or if 7+ of 10 land in a single 1.0-wide band, the score does not discriminate and item 39 should be cut or rethought rather than shipped.

### 4.2 Question 2: is agent-sourced research trustworthy here?

Today's coordinate audit cuts both ways. Agent research found real DBW registry entries and OSM slipways and corrected my own bad heuristic. **And** the reason spot 79 was on the site at all is that an AI search summary laundered a permit-only trip report into a "kayak launch point", stripping its explicit warning. Scoring 142 spots means ~570 axis judgments from web sources, which is a lot of surface for that failure mode.

Mitigations, mandatory in the pilot:
- **Every axis carries a `source` URL.** No source, no level. An unsourced axis is reported as unknown, never guessed.
- **Confidence per axis.** Low-confidence axes surface to the owner rather than shipping.
- **Never infer a level from a search summary.** Cite the primary page (park/marina/agency/OSM/imagery), not an AI overview of it.
- **Two-researcher calibration:** two agents score the same 10 spots independently. Where they diverge by more than one level, the rubric wording is the suspect, not the researcher.

### 4.3 The 10 spots

Chosen to span the expected range, not to flatter it. Excludes the two hidden spots (76, 79) and the three with pending coordinate repairs (88, 96, 102), because launch ease and parking are graded against where the pin sits.

Selection intent: a mix of regions, an intentional spread of `has_fee` (free vs. paid correlates with maintained facilities), both `tide_sensitive` states, and at least two spots expected to score low, so a narrow spread is a real finding and not a selection artifact.

| id | Region | Fee | Tide-sensitive | Water |
|---|---|---|---|---|
| 1 | South Bay | free | no | Alviso Marina / Alviso Slough |
| 38 | North Bay | free | no | Miller Boat Launch |
| 45 | North Bay | unknown | yes | China Camp |
| 48 | North Bay | unknown | no | Santa Rosa Nagasawa Park |
| 63 | East Bay | unknown | no | Berkeley Marina |
| 84 | East Bay | free | yes | MLK Jr. Regional Shoreline |
| 104 | Sierra Nevada | paid | no | Echo Lakes |
| 112 | Central Coast | free | yes | Morro Bay |
| 120 | Sacramento | paid | no | Folsom Lake |
| 135 | East Bay | unknown | yes | Emeryville Marina |

Five of these (38, 45, 84, 104, 112) had their coordinates independently confirmed by the 2026-07-16 audit, which matters: launch ease and parking are graded against where the pin sits, so a verified pin removes one source of error from the pilot.

### 4.4 What ships out of the pilot

Nothing user-facing. The pilot produces: 10 scored spots with per-axis sources and confidence, the inter-researcher agreement rate, the observed spread against the §4.1 kill criterion, and a recommendation to proceed, rethink, or cut. The owner reads it before any UI is built.


---

## 5. Pilot result, 2026-07-16: CUT

Two agents (A and B) independently scored the same 10 spots against rubric v2. Reports: `reports/paddle-score-pilot-A.md`, `reports/paddle-score-pilot-B.md`.

### 5.1 The kill criterion was met by both, on both prongs

| | A | B | Threshold |
|---|---|---|---|
| Spread | **1.1** (3.6 to 4.7) | **0.8** (3.5 to 4.3) | < 1.5 = cut |
| In one 1.0-wide band | 8 of 9 | 9 of 9 | 7+ = cut |

§0.1 predicted the outcome verbatim before the run: *"every spot lands at 3.5-4.5 and the score is decoration."* Observed: 3.5 to 4.7. The 10 spots were chosen in §4.3 to span the range across 6 regions, 3 fee states, and both tide states, so the narrow spread is a finding, not a selection artifact.

### 5.2 The rubric is fine. The score is not. Both are true.

This is the part worth understanding, because "the pilot failed" is the wrong summary.

**Inter-researcher agreement was good:**

| Axis | Exact | Within 1 level |
|---|---|---|
| launch_ease | 6/10 | **10/10** |
| parking | 8/9 | **9/9** |
| launch_traffic | 8/9 | **9/9** |
| facility | 5/10 | **10/10** |

Mean disagreement per spot: **0.26 points**. Max: 0.6. Both researchers independently returned `null` for the same two axes on the same spot (48) rather than guessing. So the rubric is applicable and reproducible: two blind researchers land within one level on every single axis judgment.

**The score still fails**, because a 1.1-point spread across deliberately diverse spots means every Bay Area launch is "about a 4". Signal-to-noise is 4.3x, which sounds acceptable and is not the point: the absolute range is too narrow to tell a user anything. There is no version of `4.1 score` vs `4.3 score` that changes where someone paddles.

### 5.3 The real finding: discriminating and defensible are in direct tension

Researcher A stated it best. **The two axes that would actually separate these places are wind exposure and water quality, and those are exactly the two §0.1 cut for legal reasons.** The put-in-only decision was correct on the law and it is what removes the score's discriminating power. That is not an argument to reverse it: the v1 rubric (wind at 0.30, next to a live conditions widget, with no Section 230 protection on a computed average) is the version the lawyer gate rejected, and rightly.

So item 39 is squeezed from both sides. The legally defensible score is useless; the useful score is legally indefensible. **That is why the answer is cut, not rethink.** A third rubric does not escape the squeeze.

Mechanically, why the axes collapse:
- **Level 5 on launch_ease requires four conditions conjunctively** ("paved ramp or dock" AND "gentle grade" AND "carry under 50 ft" AND "tide-independent"), which almost no real lot achieves, so level 4's catch-all absorbs every developed launch. 6 of 10 spots scored 4.
- **The axes are negatively correlated by construction.** A ramp is simultaneously what makes launching easy (launch_ease up) and what makes the put-in contested (launch_traffic down). The weighted sum cancels.
- **facility used 2 of its 5 levels.** Nothing scored 1 or 2 on launch_ease or parking either.
- **launch_traffic is unsourceable.** Every level is defined by use intensity ("light use", "a real queue at peak") and no agency publishes that; 6 of 9 levels came back low-confidence in both runs. It has ~3 real levels, not 5. Per §0.2, shipping those gradations would be exactly the rubric-decorating-a-vibes-score the lawyer warned about.
- **parking** sources cleanly for cost but not for "rarely full", which 3 of its 5 levels hinge on, degrading it toward a proxy for `has_fee`, which the app already has.

### 5.4 What to salvage

The research is not wasted; the aggregate is.

**Every genuinely useful fact the researchers found is binary, and binary facts belong in filters and `notes`, not in an average:** non-motorized only, trailer ramp vs. beach carry, $12 vs. free, mid-to-high tide only, ramp hours, no ramp at all. Those change where someone paddles. `4.1` does not. This is the same home §0.1 already chose for the cut wind axis: describe the place, do not rate it.

### 5.5 The pilot's most valuable output was not about item 39

**Ten spots chosen for reasons unrelated to data quality yielded a 30-40% material defect rate.** Both researchers independently found the same three, none previously flagged by item 40:

- **120 Folsom / Beals Point: the record's central claim is false.** Notes say "Beals Point has a ramp." DBW types it **"No Facility"** while every other Folsom launch is typed "Launch"; OSM has no slipway within 1.5km. It is a swim beach. Unlike spot 79 the place is real, legal, and paddleable (State Parks confirms SUP rentals there), so this is a notes-accuracy defect, not a fabrication. `rentals_available: false` also looks wrong.
- **63 Berkeley Marina: the pin sits on the DoubleTree hotel parking lot**, ~410m from the nearest slipway and ~700m from the beach its notes describe. Berkeley Marina is also two separate Water Trail sites and the record does not say which.
- **84 MLK Jr. Shoreline: two launches ~2.5km apart merged into one record.** The pin is the Doolittle trailer ramp; the ADA paddle-craft dock and Tidewater Boating Center named in the notes are at Tidewater Ave. The coordinate is fine; the notes are not.

Minor: spot 1's `tide_sensitive: false` contradicts its own notes ("push off about an hour before low"); 112's "easiest entry at any tide" is uncorroborated by any agency source; 38 and 104 carry stale fee prose.

**The audit's DBW facility-type screen caught 120 on the first spot outside its original sample.** That screen and the reverse-geocode screen should be run across all 142 as a data-quality job. That is the highest-value thing in this whole spec, and it is an argument for item 40 and against item 45, not for item 39.

Also worth recording: **3 of 10 official sources are Cloudflare-blocked** (Marin County, sccgov, EBRPD). The path of least resistance around that block is an AI search summary, which is precisely what put spot 79 into production. Any future data job needs a sanctioned path to those sources, not a workaround.

### 5.6 Checked: the fabricated boilerplate did not spread

Researcher B flagged that spot 1 shares spot 79's "9-to-10-foot" tidal figure and suggested grepping all 140. Done: only spot 1 shares it, and both are South Bay tidal-slough spots where a large range is genuinely expected. Spot 79's other distinctive phrases ("tidal velocity runs around", "timing with the flood") appear in **no** other record. **The fabrication is contained to 79, not systemic.** Good instinct, reassuring answer.
