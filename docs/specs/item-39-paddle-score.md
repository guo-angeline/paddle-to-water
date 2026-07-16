# Item 39: Paddle score, rubric + row design

Status: **spec, not built. One BLOCKING conflict unresolved (§0.1).** Read alongside ROADMAP.md items 39, 40, 43, and the legal gate summary in DECISIONS.md.

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

### 0.1 BLOCKING CONFLICT: what the score is allowed to be about

**The lawyer's requirement:** *"Rate the put-in, not the paddle."* Called the single highest-leverage decision in the whole reviews/accounts block. The score should cover parking, ramp, access, cleanliness, crowding. Not whether the water is safe, not conditions, not suitability for a skill level. Wind exposure is permitted as the one safety-adjacent axis **only if kept descriptive** ("exposed to afternoon westerlies") rather than evaluative about safety.

**The design agent's rubric (§1) does not comply.** It weights wind exposure at 0.30 (the highest weight) and water quality at 0.15, so **45% of the score is safety-adjacent**, and wind is the single largest driver of a number labeled "score" rendered near a live conditions widget. The design agent's justification is real and should not be dismissed: wind exposure is the biggest determinant of whether a trip is good, and it is the one axis the app cannot already answer live (a spot can have a calm forecast today and still be a structurally bad pick, e.g. a big-fetch bay that whitecaps by 1pm regardless).

**Why the lawyer's concern is not hypothetical:** an average *you compute* is arguably first-party speech with no Section 230 protection. There is live case law (*Lemmon v. Snap* and progeny) letting negligent-design claims past 230 when they target the platform's own design choice. The plaintiff does not plead "you published a user's false statement," they plead "you designed and displayed a 5-star safety signal."

**Owner decision required. Options:**
- **(a) Put-in only.** Cut wind exposure and water quality; reweight across launch ease, parking, boat traffic, crowding. Safest, and cleanly separates "how good is this launch" (static, editorial) from "is it good right now" (live, the conditions engine). Costs the axis the design agent considers most valuable.
- **(b) Keep wind, reweight down and hard-descriptive.** Wind exposure drops to a low weight, its level words become purely geographic (fetch distance, no "extreme"/"dangerous" language), and the §1.3 safety cap stays. Keeps most of the utility, keeps some risk.
- **(c) Ship §1 as written.** Highest utility, highest exposure, and directly against the gate.

Recommendation: **(b)**, with the §1.3 safety cap retained (it is a genuine mitigation the lawyer would credit: the app can never show 4-5 for a spot under an active advisory) and every wind level word rewritten to describe geography rather than judge risk.

### 0.2 Required additions the design spec is missing

From the legal gate, not yet reflected in §2:

- **Basis disclosure at the point of claim**, in the breakdown card, NOT on a policy page: *"Scored from public sources and maps. We have not visited every spot."* This is what makes the score defensible opinion rather than a naked implied fact. The "3 sources" meta line in §2.4 is good and citable, but it is not this.
- **The rubric must actually be applied.** A published rubric decorating a vibes score is deception, and git history proves it. If the ~1 person-week in §1.7 is not spent, the rubric must not be published as if it were.
- **Never blend user stars into the editorial score.** Two numbers, two labels, structurally separate. §2.3 already does this correctly; keep it that way.
- **No aggregate under 5 reviews.** §2.3's N ≥ 5 threshold already matches the lawyer's independent recommendation.
- **Item 34** (alert copy reframe) is now step zero for this whole block. `"looks good right now. Go while it lasts."` is still live in `app/api/cron/send-reminders/route.ts:68` and every rating surface compounds on top of it.

---

## 1. The rubric (as authored; see §0.1 before implementing)

### 1.1 Axes and weights

| Axis | Weight | Derivable from `spots.json` today? |
|---|---|---|
| Wind exposure | 0.30 | Partial. `difficulty` is a strong prior; final level needs a map check |
| Wake / boat traffic | 0.20 | Mostly. `power_boats` gives a direct signal |
| Launch ease | 0.20 | Partial. `tide_sensitive` + `notes` give a prior; needs an imagery check |
| Water quality | 0.15 | No. Needs per-spot research against a public source |
| Parking | 0.15 | No. No structured field; `has_fee` is a weak proxy at best |

### 1.2 Axis level definitions

Written to be measured, not felt, so two researchers land within one level of each other.

**Wind exposure (0.30).** The spot's geography, not today's forecast. Estimate fetch distance from a map.
- 5: Fully enclosed. Pond, narrow slough, or reservoir cove with breaks on all sides; fetch < 0.3 mi in every direction.
- 4: Mostly sheltered. 0.3-1 mi of open fetch in one or two directions, breaks elsewhere.
- 3: Moderate open water. Bay, wide river, or large reservoir with 1-3 mi of fetch.
- 2: Highly exposed. Large open bay or main channel, 3+ mi unobstructed fetch, no lee shore.
- 1: Extreme exposure. Open coast, harbor entrance, or bay mouth with ocean swell, current, or shipping-channel chop.

*(Per §0.1(b), these level WORDS need rewriting toward pure geography if option (b) is taken.)*

**Wake / boat traffic (0.20).** Start from `power_boats`.
- 5: No motorized craft permitted, enforced by regulation.
- 4: Allowed but rare or low-speed (no-wake zone, small slough, low-traffic weekday lake).
- 3: Mixed use, moderate. Recreational motorboats on summer weekends; launch sits off the main channel.
- 2: Mixed use, heavy. Active marina, water-ski lake, or bay channel with regular traffic near the launch.
- 1: Commercial/high-speed. Shipping channel, ferry route, or a launch in a marina fairway.

`power_boats: false` → 4 or 5 depending on whether the ban is posted/enforced (check notes). `true` → research to place at 3/2/1. `null` → full research, no prior.

**Launch ease (0.20).** Car to water.
- 5: Paved ramp or dock, gentle grade, carry under 50 ft, tide-independent.
- 4: Improved but unpaved. Graded gravel/dirt or beach, carry 50-150 ft; or a paved ramp with a longer carry.
- 3: Natural shoreline. Sand/gravel beach or bank, carry 150-300 ft.
- 2: Difficult footing. Mudflat, reeds, riprap, or steep bank; carry over 300 ft.
- 1: Marginal. No formal access, a long bushwhack, or only usable at a narrow tide window.

`tide_sensitive: true` pushes toward 2-3 unless notes describe a floating dock. Read `notes` first, it is often most of the answer.

**Water quality (0.15).**
- 5: Clean, no known advisories; well-flushed, no bloom or contamination history.
- 4: Generally clean. Minor seasonal turbidity or occasional anecdotal late-summer algae, no official advisory.
- 3: Fair. Slow-moving or stagnant (dead-end slough, small pond) with plausible warm-water risk, no active advisory.
- 2: Known recurring issue. Documented HAB advisory history or listed impaired for a contact-recreation pollutant; nothing active now.
- 1: Active advisory in effect as of the scoring date.

Source of record: California's statewide HAB portal (mywaterquality.ca.gov/habs) for lakes/reservoirs/sloughs, plus county health advisory pages for bay/ocean spots. **Batch by water body, not by spot**: many spots share one lake or bay.

**Parking (0.15).**
- 5: Dedicated free lot at the launch, rarely full.
- 4: Free street or lot within < 0.1 mi, typically available.
- 3: Paid lot/meter; or free but fills on summer weekends; or a 0.1-0.25 mi walk.
- 2: Scarce. A handful of spots, frequently full, or a 0.25-0.5 mi walk.
- 1: Very limited. Informal roadside with tow/ticket risk, or over 0.5 mi with gear.

No structured prior. Research via satellite imagery and recent map reviews mentioning parking.

### 1.3 Aggregation

```
raw = 0.30*wind + 0.20*boat_traffic + 0.20*launch_ease + 0.15*water_quality + 0.15*parking
score = round(raw, 1)

// Safety cap: good parking cannot rescue a genuinely dangerous spot.
if wind_exposure == 1 or water_quality == 1:
    score = min(score, 2.0)
    capped = true
```

Weighted average rather than worst-axis-floors-everything: a weakness in a convenience axis should pull the score down proportionally, not floor it. The cap is reserved for the two axes that are safety/health matters, where no amount of good parking should average real risk away into a decent-looking number. **Keep this cap under any §0.1 option that retains wind or water quality.** It is the mitigation that lets the app never show 4-5 for a spot under an active advisory.

### 1.4 Storage

Rubric doc (source of truth, auditable): `docs/rubrics/paddle-score-rubric.md`, with a version number and changelog. Bump the version on any axis or weight change and note which spots need re-scoring. A rubric that lives only in someone's head is not auditable; this file is what a second researcher, the owner, or the lawyer gate checks a score against.

Score data: a `paddle_score` object per spot in `data/spots.json`. Absent key = unscored, matching the `has_fee` tri-state precedent (no value is not zero value).

```json
"paddle_score": {
  "value": 4.2,
  "capped": false,
  "cap_reason": null,
  "summary": null,
  "axes": {
    "wind_exposure": { "level": 4, "note": "Enclosed cove, ~0.4mi fetch" },
    "boat_traffic":  { "level": 5, "note": "Human-powered only, posted" },
    "launch_ease":   { "level": 3, "note": "Gravel beach, ~120ft carry" },
    "water_quality": { "level": 4, "note": "No HAB history on file" },
    "parking":       { "level": 4, "note": "Free lot, rarely full" }
  },
  "sources": 3,
  "rubric_version": "1.0",
  "scored_at": "2026-07-20",
  "scored_by": "owner"
}
```

`sources` is a count of distinct references consulted, powering the "N sources" credibility line without implying reviewers. Compute the aggregate in one pure function (`lib/paddleScore.ts`, `computePaddleScore(axes)`) reading the same weights as the rubric doc, so the number can never silently drift from the documented formula.

### 1.5 Reproducibility process

Level definitions alone do not guarantee convergence, especially on wind exposure and parking. Before running all 142:
1. **Calibration pass.** Two people independently score the same 5-10 spots. Where they land more than one level apart, tighten that axis's wording. The boundary numbers above are a starting point, not final.
2. **Run by axis, not by spot.** Batching one axis across all spots reuses the same research method and lets water quality batch by water body.
3. **QA.** Spot-check ~10% against the rubric before shipping.

### 1.6 Sequencing against item 40

Launch ease and parking are graded against *where the pin sits*, and item 40 found 11 spots whose coordinates cannot be on the launch (two off by ~11km). **Score the 131 clean spots now; backfill the 11 once item 40 lands.** Do not block the whole pass.

### 1.7 Effort, 142 spots

| Task | Estimate |
|---|---|
| Wind exposure (map fetch check) | ~3.5 hrs |
| Boat traffic (mostly derived) | ~2-3 hrs |
| Launch ease (imagery + notes) | ~5-7 hrs |
| Water quality (batched by ~60-80 water bodies) | ~4-6 hrs |
| Parking (imagery + reviews) | ~5-7 hrs |
| Calibration pass | ~1 hr |
| QA sample | ~2-3 hrs |
| **Total** | **~23-30 hrs, about 1 person-week** |

This is the number that decides whether item 39 is real. Per §0.2, a rubric that is published but not actually applied is worse than no rubric.

---

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
| 5 | Sheltered | No motors allowed | Paved ramp, short carry | Clean, no history of issues | Plenty of free parking |
| 4 | Mostly sheltered | Rare boat traffic | Improved access | Generally clean | Usually easy to find |
| 3 | Moderate exposure | Moderate boat traffic | Natural shoreline | Can get stagnant in late summer | Can fill up on weekends |
| 2 | Very exposed | Heavy boat traffic | Muddy or steep footing | History of algae blooms | Scarce parking |
| 1 | Extreme exposure | Commercial traffic | Marginal put-in | Advisory in effect | Very limited parking |

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
