import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 105. Every PostHog metric query MUST exclude the owner + test devices
// (analytics/EXCLUDED_PERSONS.md: they were ~72% of saves at ~31 DAU). Nine
// queries silently did not; a tenth (experiment_next_good_window) turned up when
// this guard was written by GREPPING THE TREE rather than the item's list, which
// is the whole point of a guard over a checklist.
//
// The rule enforced: any .sql that reads FROM events and references person_id
// must also carry an owner exclusion, i.e. filter person_id against the
// EXCLUDED_PERSONS ids. A new query that forgets it fails here.

const QDIR = path.resolve(__dirname, "../../analytics/queries");

// The four owner/test person_ids that are the consensus exclusion set across the
// queries that already had it (backswipe, enrollment, ...). Kept in sync with
// analytics/EXCLUDED_PERSONS.md.
const OWNER_IDS = [
  "11a83b86-4d73-565f-8b70-2f2847d865be",
  "0faaad14-aa87-5cda-a76c-a3f59e0fa4d1",
  "21e77b69-f479-5130-9696-e386ad7f9aa0",
  "f38f6a31-bb18-525d-9d49-8e7194442d2b",
];

// Documented exemptions. Anything here is exempt ON PURPOSE, with the reason,
// so the exemption is a decision on the record rather than an oversight.
const EXEMPT: Record<string, string> = {
  // A security check that counts token leaks in URLs. Its OWN comment: excluding
  // person_id "would filter out the entire leak and always report zero." It must
  // see all traffic, owner included.
  "token_leak_check.sql": "must see all traffic to detect a leak",
  // alert_ctr's ACTIVE query is Supabase (subscription_id-keyed); its only
  // `FROM events` / `person_id` mentions are in a legacy cross-store comment.
  // It is covered by its own dedicated assertion below, on the subscription
  // exclusion, so it is exempt from the person_id rule here.
  "alert_ctr.sql": "Supabase-keyed; owner filtered by subscription in its own test",
};

const files = fs.readdirSync(QDIR).filter((f) => f.endsWith(".sql"));

describe("analytics owner-exclusion (item 105)", () => {
  it("has queries to check (guards a real directory, not an empty glob)", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const f of files) {
    const src = fs.readFileSync(path.join(QDIR, f), "utf-8");
    const readsEvents = /\bFROM events\b/i.test(src);
    const usesPerson = /\bperson_id\b/.test(src);
    if (!readsEvents || !usesPerson) continue;

    it(`${f} excludes owner/test traffic (or is a documented exemption)`, () => {
      if (EXEMPT[f]) {
        // The exemption is recorded here with its reason; nothing to assert on
        // the file beyond it being intentionally listed. The dedicated
        // alert_ctr assertion below still enforces ITS real exclusion.
        expect(EXEMPT[f].length).toBeGreaterThan(0);
        return;
      }
      // At least one owner id must appear in an exclusion. Checking the ids
      // (not just the phrase "EXCLUDED_PERSONS") means a query that name-drops
      // the doc in a comment but forgets the actual filter still fails.
      const hasExclusion = OWNER_IDS.some((id) => src.includes(id));
      expect(hasExclusion, `${f} reads events + person_id but excludes no owner id`).toBe(true);
    });
  }

  it("the Supabase alert-CTR query excludes the owner's push subscription", () => {
    // alert_ctr is Supabase-keyed (subscription_id), not person_id, so the
    // events-based rule above does not cover it. It must drop the owner's push
    // subscription, identified by the excluded push anon_id.
    const src = fs.readFileSync(path.join(QDIR, "alert_ctr.sql"), "utf-8");
    expect(src).toContain("2f625b9b-4627-483e-b29b-8ab5973e046b");
    expect(src).toMatch(/subscription_id NOT IN/i);
  });
});
