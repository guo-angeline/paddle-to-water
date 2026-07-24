# Remove Today's Shape From the Conditions Panel

## Goal

Remove the visible "Today's shape" section from the web conditions panel without retiring its reusable forecast logic or changing any neighboring conditions features.

## Approved approach

Remove the `TodaysShapePanel` import and render call from `ConditionsPanel`.

Keep:

- `TodaysShapePanel.tsx`
- `lib/todaysShape.ts`
- `getTodaysShape` and the shared hourly forecast cache
- the `todays_shape_viewed` analytics schema
- the `todays-shape` kill switch
- native parity roadmap history

This keeps the change narrow and makes the section easy to restore later without rebuilding its logic.

## User-facing result

The conditions drawer will move directly from the current tide and wind details to nearby alternatives when applicable, then to "Looking ahead" and the canonical safety disclaimer.

"Right now," nearby alternatives, "Looking ahead," tide and wind data, forecast fetching, and safety copy will not change.

## Files

- Modify `web/components/ConditionsPanel.tsx` to remove the import, render call, and obsolete comment that describes the removed section.
- Add or update a focused source-level test under `web/components` to prove `ConditionsPanel` does not import or render `TodaysShapePanel`.

## Verification

- Run the focused regression test first and observe it fail before the implementation.
- Run the full web test suite and production build.
- Render a conditions drawer locally at 1280px and 390px.
- Confirm "Today's shape" and its sparkline are absent.
- Confirm "Right now," nearby alternatives when eligible, "Looking ahead," and the safety disclaimer still render in the intended order.

## Non-goals

- Do not delete the component, forecast logic, analytics event, kill switch, or tests for the retained logic.
- Do not change the hourly forecast request, cache, or next-window calculations.
- Do not change native code.
- Do not redesign any remaining conditions content.
