# Item 137 Disclaimer Treatment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Paddle Now modal’s canonical safety disclaimer 11px and muted while preserving its wording, placement, and readability.

**Architecture:** Keep the existing shared disclaimer element and change only its Tailwind size class plus a scoped text color. Lock the visual contract with the existing source-level component test, then verify the rendered modal at desktop and mobile widths.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Vitest, Playwright, Vercel

---

### Task 1: Restyle and verify the disclaimer

**Files:**
- Modify: `web/components/paddle-now-modal.test.ts`
- Modify: `web/components/PaddleNowModal.tsx`

- [ ] **Step 1: Write the failing style test**

Add this test beside the existing verbatim disclaimer test:

```ts
it("renders the safety caveat as 11px muted secondary copy with its original line height", () => {
  expect(modal).toMatch(
    /<p className="text-\[11px\] leading-5 text-\(--muted\) mt-1\.5">\{CAVEAT\}<\/p>/,
  );
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run:

```bash
cd web && npm test -- components/paddle-now-modal.test.ts
```

Expected: one failure because the component still contains `text-sm text-(--dark)`.

- [ ] **Step 3: Implement the approved treatment**

Change the disclaimer element to:

```tsx
<p className="text-[11px] leading-5 text-(--muted) mt-1.5">{CAVEAT}</p>
```

Update the adjacent comment so it describes the canonical co-rendering requirement without claiming the text is body weight.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
cd web && npm test -- components/paddle-now-modal.test.ts
```

Expected: all tests in the file pass.

- [ ] **Step 5: Run accessibility, legal, and rendered-surface gates**

Verify the color contrast against white, run the project’s legal role gate because this is a safety disclaimer, and render the modal locally at 1280px and 390px. Confirm the full caveat remains visible, readable, unclipped, and immediately follows the calm-conditions claim.

- [ ] **Step 6: Run full project verification**

Run:

```bash
cd web && npm test
cd web && npm run build
rg -n '\x{2014}' web/components/PaddleNowModal.tsx web/components/paddle-now-modal.test.ts
git diff --check
```

Expected: all tests pass, build exits 0, the em-dash scan returns no matches, and the diff check exits 0.

- [ ] **Step 7: Commit, push, deploy, and verify production**

Commit the plan, test, component, and any required project-state updates to `main`; push `main` to `origin`; deploy with the project’s production Vercel command; inspect the deployment; then load the production site with `?internal=1` and confirm the modal treatment at desktop and mobile widths.
