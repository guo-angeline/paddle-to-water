# Remove Today's Shape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visible "Today's shape" section from the web conditions panel while retaining its component, forecast logic, analytics definition, and kill switch.

**Architecture:** Change only the composition boundary in `ConditionsPanel`: remove the `TodaysShapePanel` import and JSX render call. Extend the existing source-level panel test to lock the absence of that section without touching the retained feature implementation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright

---

### Task 1: Remove the section from the conditions composition

**Files:**
- Modify: `web/components/todays-shape-panel.test.ts`
- Modify: `web/components/ConditionsPanel.tsx`

- [ ] **Step 1: Write the failing composition test**

Read `ConditionsPanel.tsx` in the existing test file and add:

```ts
it("does not mount Today's shape in the conditions panel", () => {
  expect(conditionsPanel).not.toContain('import TodaysShapePanel from "@/components/TodaysShapePanel"');
  expect(conditionsPanel).not.toContain("<TodaysShapePanel");
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
cd web && npm test -- components/todays-shape-panel.test.ts
```

Expected: the new test fails because `ConditionsPanel.tsx` still imports and renders `TodaysShapePanel`.

- [ ] **Step 3: Remove the visible composition**

Delete this import:

```ts
import TodaysShapePanel from "@/components/TodaysShapePanel";
```

Delete this comment and render call:

```tsx
{/* Item 100: today's intra-day shape, then the multi-day look-ahead. Both
    draw from the one shared hourly fetch (getTodaysShape / getNextWindow),
    so this pair adds no requests beyond the single hourly call. */}
<TodaysShapePanel spot={spot} />
```

Update the nearby-alternatives comment so it no longer says that the component renders between Today's shape and Looking ahead.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
cd web && npm test -- components/todays-shape-panel.test.ts
```

Expected: all tests in the file pass.

- [ ] **Step 5: Verify retained code remains intact**

Run:

```bash
test -f web/components/TodaysShapePanel.tsx
test -f web/lib/todaysShape.ts
rg -n "todays_shape_viewed|todays-shape" web/lib/analytics-events.ts web/lib/experiments.ts web/components/TodaysShapePanel.tsx
```

Expected: both files exist and the retained analytics and kill-switch references are present.

- [ ] **Step 6: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all tests pass, the production build exits 0, and the diff check exits 0.

- [ ] **Step 7: Verify the rendered conditions drawer**

Start the local web app and use Playwright at 1280px and 390px. Open a spot drawer and confirm:

- "Today's shape" and its sparkline are absent.
- "Right now" is visible.
- "Looking ahead" and the canonical safety disclaimer remain visible.
- No page errors occur.

- [ ] **Step 8: Commit the implementation**

```bash
git add docs/superpowers/plans/2026-07-24-remove-todays-shape.md web/components/todays-shape-panel.test.ts web/components/ConditionsPanel.tsx
git commit -m "style: remove todays shape section"
```
