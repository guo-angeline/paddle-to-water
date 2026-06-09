# Mobile UX Improvement Plan

Derived from `ux-mobile-findings.md` (4 mobile agents) and `analytics-report.md`. Branch: `mobile-ux-fixes`. Each fix below maps to a finding and an analytics number it should move.

## Scope of this pass (high-leverage, low-risk)

| # | Fix | File(s) | Targets |
|---|-----|---------|---------|
| 1 | Install banner: hide while a spot drawer is open; persist dismissal in localStorage (not session); rewrite iOS copy as a clear 2-step | `InstallPrompt.tsx`, `HomeClient.tsx` | 1 Get Directions click, 33 prompts→0 installs |
| 2 | Map: stop the statewide auto-fit on load (only fit bounds when filtered), default to the Bay | `MapView.tsx`, `HomeClient.tsx` | mobile users fleeing map |
| 3 | Map: non-destructive selection (gentle zoom that never overshoots, keeps the user's zoom) + larger transparent tap targets on pins | `MapView.tsx` | unhittable pins |
| 4 | Save heart: ~40px tap target, full visibility, plus a first-run "tap ♥ to save" nudge | `SpotCard.tsx`, `SpotList.tsx` | 0 saves |
| 5 | Fix React #418 hydration: load favorites from localStorage in an effect behind a mounted flag | `HomeClient.tsx` | glitchy first paint for returning savers |
| 6 | Map-tab empty state for zero results (List already has one) | `HomeClient.tsx` | over-filtered users see a blank map |
| 7 | Short-query search: 1-2 char queries match place names only, not notes (no more "Co" → 121/140) | `lib/search.ts` | search looks broken |
| 8 | Partial-height bottom sheet (60vh) + notes truncate 150→220 so launch info survives | `SpotDrawer.tsx` | sheet buries the pin, key info hidden |

## Deferred to a follow-up (bigger or lower-value)
- Marker clustering (needs `leaflet.markercluster` dependency).
- The `next dev` fast-refresh reload loop (dev-only, not user-facing).
- Region-pill scroll affordance, geolocation-denied toast, zoom-control sizing, empty-state copy wording.

## Verification
- `npm run lint` and `npm run build` clean.
- Production smoke test (`next start`) with a mobile Playwright context: open a spot and confirm Get Directions is tappable with the install banner gone; tap pins on a Bay-default map; save a spot and reload (no #418); over-filter and see the map empty state; type "Co" and get a short place-name list.
