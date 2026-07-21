import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Item 44: the accounts feature must be fully inert until the owner provisions
// credentials, and must never call posthog.identify()/reset() (CLAUDE.md rule
// that keeps anon_id the analytics primary key). Source-level guards; the live
// behavior (no sign-in UI with no env) is verified in dev.
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf-8");

describe("accounts are inert without credentials (item 44)", () => {
  it("authEnabled gates on both public env keys", () => {
    const src = read("../lib/supabase/config.ts");
    expect(src).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(src).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(src).toMatch(/return Boolean\(SUPABASE_URL && SUPABASE_ANON_KEY\)/);
  });

  it("the browser client returns null when auth is not configured", () => {
    const src = read("../lib/supabase/browser.ts");
    expect(src).toMatch(/if \(!authEnabled\(\)\) return null/);
  });

  it("AccountButton renders nothing unless the kill switch AND env are on", () => {
    const src = read("./AccountButton.tsx");
    expect(src).toContain('useKillSwitch("accounts")');
    expect(src).toMatch(/if \(!enabledSwitch \|\| !enabled \|\| loading\) return null/);
  });

  it("never calls posthog.identify()/reset() (anon_id stays primary; account is setPersona only)", () => {
    for (const f of ["../lib/useAccount.ts", "./AccountButton.tsx"]) {
      const src = read(f);
      expect(src).not.toMatch(/\.identify\(/);
      expect(src).not.toMatch(/\.reset\(/);
    }
    expect(read("../lib/useAccount.ts")).toContain("setPersona({ signed_in: true })");
  });
});

describe("migrate-on-sign-in link route claims only unclaimed rows (item 44)", () => {
  it("only claims subscriptions where user_id is null (never steals another account's)", () => {
    const src = read("../app/api/account/link/route.ts");
    expect(src).toMatch(/\.is\("user_id", null\)/);
    expect(src).toContain("getRequestUserId");
    expect(src).toMatch(/status: 401/);
  });
});
