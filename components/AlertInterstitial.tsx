"use client";

import { useEffect, useState } from "react";
import type { Spot } from "@/lib/types";
import type { GoodWindow } from "@/lib/alerts/conditions-window";
import { trackIntent } from "@/lib/analytics";
import { getNextWindow, windowDay, windowRange } from "@/lib/nextWindow";
import { buildLaunchReminder } from "@/lib/calendarReminder";

interface Props {
  spot: Spot;
  windowLabel: string;
  onDismiss: () => void;
}

/**
 * Floating card over the deep-linked spot's drawer, shown whenever the app
 * opened from a push alert. It reads as a personal update about the user's
 * saved spot: which spot is good, and exactly when. The alert is about a FUTURE
 * window, so the action is not "get directions" (they aren't going now) but
 * "remind me at launch time", delivered as a calendar reminder. Put-in details
 * are intentionally NOT repeated here; they live in the spot drawer below.
 *
 * Monitored 100% rollout (D2(a), 2026-07-08): not an A/B test. The card fires
 * only on push-opens with a tiny watched set, so an arm comparison could never
 * reach significance; it ships to everyone and we watch the guardrails
 * (`spot_sheet_dismissed`, `alert_interstitial_result`). The mount is gated on
 * the alert context in HomeClient, so this renders unconditionally.
 *
 * Reframe + calendar reminder: ROADMAP item 1 (2026-07-09), per the PM design.
 * A server-sent launch-time PUSH reminder is escalated as D4, not built here.
 */
export default function AlertInterstitial({ spot, windowLabel, onDismiss }: Props) {
  useEffect(() => {
    trackIntent("alert_interstitial_shown", { spot_id: spot.id });
  }, [spot.id]);

  // Same precise window the conditions panel computes, via the shared cached
  // lookup. Null until it resolves, or if conditions shifted since the push was
  // sent and there's no window now (then we fall back to the coarse push label).
  const [nextWindow, setNextWindow] = useState<GoodWindow | null>(null);
  useEffect(() => {
    let alive = true;
    getNextWindow(spot.id, spot.lat, spot.lng).then((r) => {
      if (alive && r.ok && r.window) setNextWindow(r.window);
    });
    return () => {
      alive = false;
    };
  }, [spot.id, spot.lat, spot.lng]);

  const day = nextWindow ? windowDay(nextWindow) : null;
  const range = nextWindow ? windowRange(nextWindow) : null;
  const reminder = nextWindow ? buildLaunchReminder(spot, nextWindow) : null;

  const title = day ? `${spot.water} looks good ${day}` : `${spot.water} has a good window`;
  const subline = range ? `Calm window ${range}.` : `${windowLabel}.`;

  function handleDismiss() {
    trackIntent("alert_interstitial_result", { spot_id: spot.id, outcome: "dismissed" });
    onDismiss();
  }

  function handleReminder() {
    trackIntent("alert_interstitial_result", { spot_id: spot.id, outcome: "reminder" });
    // Let the anchor's default (open/download the .ics) run; then close the card.
    onDismiss();
  }

  return (
    <div
      className="fixed inset-x-0 top-0 flex justify-center px-4"
      // Clear the iOS status bar / notch: the app renders with viewportFit
      // "cover", so top-0 sits UNDER the status bar. Match the header's inset
      // convention (globals.css) so the card and its × are fully tappable.
      style={{ zIndex: 1300, paddingTop: "calc(max(0.75rem, env(safe-area-inset-top)) + 0.5rem)" }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-2xl px-4 py-3.5" style={{ background: "var(--accent)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Your saved spot</p>
            <p className="font-['Newsreader'] text-white text-base font-bold leading-tight mt-0.5">{title}</p>
            <p className="text-white/85 text-sm mt-0.5">{subline}</p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 -mt-1.5 -mr-1.5 flex h-11 w-11 items-center justify-center text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        {reminder && (
          <a
            href={reminder.dataUri}
            download={reminder.filename}
            onClick={handleReminder}
            className="mt-3 flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold bg-white transition-opacity hover:opacity-90"
            style={{ color: "var(--accent)" }}
          >
            Remind me at launch time
          </a>
        )}
      </div>
    </div>
  );
}
