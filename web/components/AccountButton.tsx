"use client";

import { useState } from "react";
import { useAccount } from "@/lib/useAccount";
import { useKillSwitch } from "@/lib/experiments";
import SignInSheet from "@/components/SignInSheet";

// Item 44: header account control. Renders NOTHING unless (a) the `accounts`
// kill switch is on AND (b) auth is configured (env keys present), so with no
// credentials the header is byte-identical to the anonymous app.
//
// Signed out: opens the sign-in sheet (email code first, Google secondary).
// Signed in: shows who you are, with Sign out as its own labelled control
// rather than one ambiguous pill that read "name Sign out".
export default function AccountButton() {
  const enabledSwitch = useKillSwitch("accounts");
  const { enabled, user, loading, signOut } = useAccount();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!enabledSwitch || !enabled || loading) return null;

  if (!user) {
    return (
      <>
        {/* Icon-only on small screens: adding a text button to the header made
            the wordmark and the button itself wrap to two lines at 375px. */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Sign in"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1.5 text-sm font-medium text-(--dark) hover:bg-(--fill) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) sm:px-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="hidden sm:inline">Sign in</span>
        </button>
        {sheetOpen && <SignInSheet onClose={() => setSheetOpen(false)} />}
      </>
    );
  }

  const label = user.email?.split("@")[0] ?? "Account";
  return (
    <span className="flex shrink-0 items-center gap-2">
      {/* Identity is hidden on small screens for the same wrap reason; the
          Sign out button carries the account email in its title/aria-label. */}
      <span
        className="hidden max-w-[7rem] truncate text-sm text-(--muted) sm:inline"
        title={user.email ?? undefined}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={signOut}
        title={user.email ?? undefined}
        aria-label={user.email ? `Sign out of ${user.email}` : "Sign out"}
        className="shrink-0 whitespace-nowrap rounded-full border border-(--border) px-2.5 py-1.5 text-sm font-medium text-(--dark) hover:bg-(--fill) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) sm:px-3"
      >
        Sign out
      </button>
    </span>
  );
}
