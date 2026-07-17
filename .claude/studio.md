# Studio config: paddlePuddleboardBay (sup-spots / paddletowater.com)

backlog: ROADMAP.md
test: npm test
lint: npm run lint
build: npm run build (must pass before every deploy)
deploy: vercel --prod --yes (CLI is the ONLY path to production; there is no git integration, a commit without a deploy changes nothing live). After a verified deploy, move the pointer: git tag -f deployed-prod HEAD. The predeploy-gate.py hook diffs deployed-prod against the tree and stops a deploy that touches gated paths (spot lat/lng per D19, push/cron/subscription code, or any path on a Gates: line of an OPEN decision).
previewDeploy: vercel (non-prod preview URL for verifier checks)
liveUrl: https://paddletowater.com
protectedBranches: [main]
autonomy: standard

notes: |
  - Read CLAUDE.md before any work; it is dense with load-bearing constraints.
  - PROTECTED (always escalate): changes to push-notification/cron send behavior (real users get woken up; the 6am-alert incident is why the cron moved to 7pm), Supabase subscription rows, destructive migrations.
  - Never alter lat/lng in data/spots.json unless explicitly correcting coordinates with a verified source; verify unchanged before deploy.
  - Every material UX change ships with an analytics event (trackIntent/trackSystem discipline per CLAUDE.md) and an analytics/INSTRUMENTATION_CHANGELOG.md entry.
  - BOARD DIRECTIVE (2026-07-02): every major product update (new user-facing surface, changed core flow) ships behind an A/B experiment via lib/experiments.ts, declared in docs/experiments/ before shipping. Never straight to 100%. Low traffic means a longer read window, not a reason to skip the flag. Small fixes and copy tweaks are exempt.
  - This project has its OWN palette (indigo accent #3730A3, Libre Baskerville + Nunito). Do not apply the Moss & Stone house palette here.
  - Deploy timing pollutes analytics windows: deploy promptly after verified merges, and note the deploy time in the briefing.
  - Spot notes stay general and evergreen, never phrased as replies to a specific person.
  - PostHog project 458289; analytics reports live in reports/; read analytics/INSTRUMENTATION_CHANGELOG.md before citing any metric.
  - OWNER DIRECTIVE (2026-07-02): ROADMAP.md is the ONLY vision/strategy/roadmap doc. Never create a new plan/roadmap/strategy file; fold everything into ROADMAP.md. docs/superpowers/ specs are historical execution artifacts for shipped work only.
  - Building in a worktree needs a REAL node_modules: Turbopack rejects a symlink that points outside the project root (npm run build dies with "Symlink node_modules is invalid"). Cross-device (/tmp worktree) so hardlinks fail too: `cp -a <root>/node_modules <worktree>/node_modules` (~12s, 563M) before `npm run build`. Tests + lint work fine over the symlink; only the build needs the copy.
  - Adding ANY new spot trips the D19 predeploy gate (new spots.json lat/lng lines), so a new-spot deploy is always an escalation even when the coordinate is owner-supplied and verified. House pattern (D19): commit + merge to main so the coordinate diff is the review artifact, then escalate the DEPLOY (not the merge) and let the owner say go. Do not try to bypass the gate.
