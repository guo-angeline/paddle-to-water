"use client";

import { useAccount } from "@/lib/useAccount";
import { useKillSwitch } from "@/lib/experiments";

// Item 44: header sign-in control. Renders NOTHING unless (a) the `accounts`
// kill switch is on AND (b) auth is configured (env keys present). So with no
// credentials, or a kill-switch disable, the header is byte-identical to today
// and the app stays fully anonymous. Google-only for now (D28 Q2b, Apple
// half deferred until Apple Developer enrollment lands).
export default function AccountButton() {
  const enabledSwitch = useKillSwitch("accounts");
  const { enabled, user, loading, signInWithGoogle, signOut } = useAccount();

  if (!enabledSwitch || !enabled || loading) return null;

  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        className="rounded-full border border-(--border) px-3 py-1.5 text-sm font-medium text-(--dark) hover:bg-(--fill) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        Sign in
      </button>
    );
  }

  const label = user.email?.split("@")[0] ?? "Account";
  return (
    <button
      type="button"
      onClick={signOut}
      title={`Signed in as ${user.email ?? "your account"}. Tap to sign out.`}
      className="rounded-full border border-(--border) px-3 py-1.5 text-sm font-medium text-(--muted) hover:bg-(--fill) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
    >
      <span className="max-w-[8rem] truncate align-middle">{label}</span>
      <span className="ml-1.5 text-(--dark)">Sign out</span>
    </button>
  );
}
