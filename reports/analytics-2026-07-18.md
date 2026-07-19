The re-cut is in, and the windowing fix did exactly what it should — it overturned two claims from the first pass. The most important part: **both corrections make the report more honest, and one of them is good news.**

<!-- analytics-report -->

## What changed when we windowed it properly

**1. Retention is worse than the first cut said: ~83% one-and-done, not 79%.** The blended 79% was diluted by long-tenured pre-07-09 users who'd had weeks to return. The properly censored cohort (first-seen ≤07-11, everyone given ≥7 days) is **83.3% one-and-done, 16.7% D7 return** (n=54). Crucially, the bot-contaminated pre-07-09 cohort independently agrees on D7 (~18%), so the headline is **robust across the instrumentation break**: roughly 5 of 6 first-timers never come back within a week.

**2. My earlier "92% conditions is layout-inflated" caveat was wrong — retracted.** When the agent actually segmented across the item-42 break, conditions-viewed-per-open is **flat: 0.86 (pre) → 0.83 (post)**. The full-height sheet did *not* manufacture the engagement. So conditions engagement (~86% per open, 89% unique) is **real — the differentiator is genuinely working.** That's the one piece of good news, and we'd have kept mislabeling it without the re-cut.

## The corrected picture (clean block 07-09→07-17, 9 days)

| | Value | Window |
|---|---|---|
| Persons / openers | 239 / 118 | clean 9-day |
| DAU | avg ~31, peak 54 (Jul 14) | clean |
| **One-and-done (censored)** | **83.3%** | cohort ≤07-11 |
| D7 return | 16.7% (robust vs 18.3% pre-slice) | cohort ≤07-11 |
| Conditions engagement | 89% unique / ~86% per open, **flat across item-42** | clean |
| **Save rate** | **10.2%** (12 savers, the ~90% cliff) | clean |
| Installs / standalone | 6 / 7 persons (**1 person = 59%**) | clean |
| Alert loop | 44 saves → 82 prompts → **1 grant, 3 email submits, 0 confirms**, 2 clicks | clean, raw counts |
| Tides present | 24.9% of loads (floor — mostly pre-07-17 proxy) | clean |

## Honesty flags the agent held the line on

- **The clean window is ~9 days at ~25–31 DAU.** It supports *point estimates only* — the agent explicitly refused week-over-week trend claims. Retention cohort is n=54; treat 83% as "≈4 in 5," not a precise figure.
- **Alert loop reported as raw counts, not rates** — single-digit at every step, no window makes it a rate.
- **Server-side retention (the ITP-proof measure) is still blocked** — it needs Supabase access the agent doesn't have *and* an ex-owner enrolled cohort that doesn't exist yet.

## The conclusions that survive the re-cut

The **strategy is unchanged, and now better-grounded**: retention is the whole game (~83% leak), conditions is a genuinely-working differentiator (not an artifact), and the loser is **view→save (~90% drop, 10.2% save rate)** — the widest, cheapest lever and the input to everything downstream. Ranked actions hold: (1) lift save rate, (2) win cold-open return without install (item-26 strip shipped today, watch it), (3) fix enrollment→return, (4) fix the 0/3 email confirm, (5) close tide completeness. Don't scale acquisition into an 83%-leak bucket.

One escalation worth your call: the standing `phx_` PostHog read key in `.claude/settings.local.json` contradicts our DECISIONS.md/MEMORY note that the loop has no key — confirm whether it's meant to be there.

Want me to spec the view→save intervention (#1), or have someone dig into why email confirm is 0/3 (#4)?
