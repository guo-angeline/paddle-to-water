# Mobile UX Findings — Paddle to Water

*Method: 4 agents drove a real mobile Chromium (iPhone 390x844 / Pixel 412x915, touch context) through the running app, screenshotting every step. Each played a persona from the analytics: beginner browser, budget planner, would-be regular, map explorer. Findings below are evidence-backed (screenshots in `/tmp/mob-*/`) and de-duplicated. "Confirmed by N agents" means independent runs hit the same issue.*

These results explain the numbers in `analytics-report.md`. The three biggest mysteries (0 saves, 1 directions click, mobile users fleeing the map) each have a concrete UI cause below.

---

## The through-line

The product browses well and converts terribly, and the mobile UI is why. An install banner buries the one action people want, the map is unusable on a phone the moment you tap anything, and the save button is too small and faint to find. None of these are deep, all are fixable.

---

## Blockers (fix first)

### 1. The iOS install banner covers the primary actions
**Confirmed by 3 of 4 agents (beginner, regular, map).** `InstallPrompt.tsx` renders `position:fixed; bottom:0; z-index:1500`, above the spot drawer (z-1200) and the map legend. It auto-appears 3s after load and sits on top of **Get Directions**, the drawer action row, and the legend. It has `pointerEvents:auto`, so it literally intercepts the tap. An agent's tap on Get Directions **timed out** until the banner was dismissed.
- This directly explains analytics: **1 Get Directions click, 33 iOS prompts → 0 installs.** The CTA is hidden behind a banner nobody wanted.
- It is also per-session naggy: dismissal is stored in `sessionStorage`, so it returns every visit.
- **Fix:** suppress the install prompt while a drawer is open (and/or raise the drawer above it), and persist dismissal in `localStorage` so "not now" means not again. Also fix the `"Sharethen"` run-together copy in the iOS instructions (`InstallPrompt.tsx:151`).

### 2. The map auto-zooms to the whole state; pins are an unhittable blob
**Confirmed by 2 agents (beginner, map).** `MapView.tsx` `FitBounds` runs `flyToBounds` over all 140 spots on load, overriding the configured Bay center/zoom. The data spans Tahoe to Bakersfield (45 spots sit outside the core Bay box), forcing **zoom 6 / a statewide view**. Measured: **67 markers within a 24px radius**, stacked. Tapping "a spot" hits a random neighbor. There's no clustering.
- **Fix:** on mobile, default to the Bay (center ~37.55,-122.25, zoom ~10) and don't fit-bounds across all spots on load. Fit to the **filtered** set instead, and add marker clustering so dense areas collapse to a tappable count.

### 3. Selecting a pin flies to zoom 13 and never comes back
**Map agent, measured.** Tap a pin → `FlyTo` hardcodes zoom 13. Close the drawer → it stays at zoom 13 on that spot, no return to overview. Every tap is a one-way 7-level zoom-in; to see a second spot you must manually pinch back out across the state.
- This is why **mobile users flee to the List (8 switches to list vs 2 to map** in analytics). The map fights the core tap-glance-tap loop.
- **Fix:** make selection non-destructive. Open the sheet and gently pan the pin into view at the current zoom; restore prior center/zoom on close. At minimum fly to zoom ~10-11, not 13.

---

## Major

### 4. The Save heart is invisible, so nobody saves
**Regical investigation by the "would-be regular" agent. The feature works end to end** (verified: tap writes to `localStorage["ptw-favorites"]`, heart fills, "Your saved spots" section appears, survives reload). It's just undiscoverable:
- The list-card heart is **15x16px** (iOS minimum touch target is 44x44, this is ~1/10 the area).
- It's **40% opacity, muted gray, glyph-only (♡), no label**, parked bottom-right under the difficulty pill. It reads as decoration.
- **No reason-to-save anywhere.** The "Your saved spots" section only appears *after* you save, so it can't pull in a first-timer.
- This is the full explanation for **0 saves across 48 users.**
- **Fix:** make the heart a real control: ≥44px tap target, full opacity, a "Save"/"Saved" microlabel (at least on first use), stronger saved-state contrast. Add a one-line first-run nudge ("Tap ♥ to save spots for later").

### 5. React #418 hydration error for returning users who have saved spots
**Regular agent, reproduced deterministically** (0 errors with no favorites, 1 error with favorites seeded). `HomeClient.tsx:45-51` initializes `favorites` from `localStorage` in a `useState` initializer, so the client renders the "Your saved spots" section the static HTML never had → server/client mismatch. React recovers but can flash, and it hits exactly the retention cohort the feature targets. (Separate from the already-fixed SpotCard nested-button hydration issue.)
- **Fix:** read localStorage in a `useEffect` behind a mounted flag; render empty on first paint.

### 6. The bottom sheet covers the pin you just tapped
**Map agent, measured.** The sheet is `max-h-[70vh]` and occupies ~55% of the screen; the selected pin sits behind it. Zero spatial confirmation of what you picked, and you can't see what's nearby while reading. The drag handle is decorative (no drag-to-resize wired up).
- **Fix:** open as a partial-height sheet (~40vh) with a real draggable handle and a peek state; pan the pin into the strip above the sheet.

### 7. No empty state on the Map tab for zero results
**Budget agent.** The List has a good empty state ("No spots match your filters" + Clear button). The Map tab, which is the **default on mobile**, shows a blank, arbitrarily-zoomed map with no pins and no message when filters/search return nothing. Looks frozen.
- **Fix:** overlay the same "No spots match, Clear filters" card on the Map tab.

### 8. Short search queries behave as if broken
**Budget agent.** `lib/search.ts` prefix-matches across name+city+region+**notes**, with no minimum token length:
- A 1-char query ("C") shows in the box but has **zero effect** on results, with no hint why.
- A 2-char query ("Co", typing toward "Coyote") returns **121 of 140** because short prefixes hit common note words (Cove, Coast, County, conditions).
- Reads as "search is broken" exactly when a planner starts typing.
- **Fix:** never display a query that isn't applied; for short queries, match place names (name/city) first and defer notes matching until the query is longer.

---

## Minor / polish

- **Notes truncate at 150 chars on mobile**, often clipping the launch/put-in detail a beginner needs, forcing a "Read more" tap on nearly every spot. Raise the threshold or front-load access info. *(beginner)*
- **"Flatwater" ≠ "beginner-friendly".** Several flatwater spots' notes mention wind/fetch/power boats. Add an explicit beginner-friendly signal distinct from water type. *(beginner)*
- **Region pills scroll horizontally with no affordance.** Only ~4.5 of 9 fit; Sacramento/Sierra/Central are off-screen with only a clipped pill as the hint. Add an edge-fade or chevron. (Note: the difficulty row is a fixed 5-col grid, always fully visible, that part is fine.) *(budget)*
- **Geolocation-denied recovery is invisible on touch.** The "enable location" guidance lives in a `title` tooltip that never shows on a phone; the pill just flashes red 4s. Show an inline toast. *(regular)*
- **Empty-state copy says "filters" even when search caused it**, and "Clear filters" silently also clears search. Say "No spots match 'zzzz'" + "Clear search". *(budget)*
- **Map zoom controls are 30px** (HIG min 44) and top-left, far from the thumb, yet heavily used to undo the fly-to. Enlarge / relocate. *(map)*

---

## Confirmed working (don't touch)
- Drawer action hierarchy is actually correct: once the banner is gone, **Get Directions is a full-width primary button** above the outline Share/Save/Photos row.
- Filtering math is correct and live (Free only = 49, combos update counter + map + list in agreement).
- "Near me" when **granted** is the best flow in the app: auto-switches to List, shows distances, re-sorts nearest-first. Obvious that it worked.
- Save persistence, "Your saved spots" section, Clear all, and the List empty state all work correctly.

---

## Dev-environment note (not user-facing, but it blocks your QA)
All four agents had to test against a production build (`npm run build && next start`) because **`npm run dev` is stuck in a fast-refresh reload loop** (~1 reload/sec, 2000+ reloads logged) that prevents the Leaflet map from ever mounting, with an `Invalid LatLng (NaN,NaN)` error. It vanishes in production. Worth fixing so local development isn't broken.

---

## Priority order (impact / effort)

1. **Stop the install banner from covering the drawer + persist its dismissal** (#1). Small change, unblocks the #1 conversion action and the install flow. *(S)*
2. **Fix the mobile map: Bay default zoom, non-destructive selection, clustering** (#2, #3). The single biggest reason mobile users abandon the map. *(M)*
3. **Make Save discoverable: 44px tap target, full opacity, label, first-run nudge** (#4). Directly attacks 0 saves; the feature already works. *(S)*
4. **Partial-height bottom sheet that doesn't bury the pin** (#6). *(S/M)*
5. **Map-tab empty state** (#7) and **short-query search fix** (#8). *(S each)*
6. **Fix the #418 hydration bug** (#5) and the **dev reload loop**. *(S each)*
