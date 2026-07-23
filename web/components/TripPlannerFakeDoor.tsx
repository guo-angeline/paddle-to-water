"use client";

import { useEffect, useRef, useState } from "react";
import type { Spot } from "@/lib/types";
import { trackIntent } from "@/lib/analytics";
import { useGenuineView } from "@/lib/useGenuineView";
import { useKillSwitch } from "@/lib/experiments";

/**
 * Item 93: a fake door measuring interest in a future trip planner (a suggested
 * launch time + out-and-back direction from wind and tide). It is a fake door,
 * so it stays honest:
 *  - Labelled "coming soon" BEFORE the tap, never a button that silently does
 *    nothing.
 *  - The tap opens a sheet that says plainly it does not exist yet, describes
 *    what it would do, and offers only a close. No spinner, no fake result.
 *  - It makes no safety claim: the last sheet line states nothing checked
 *    today's conditions, because the eventual feature is safety advice and a
 *    placeholder must not let anyone believe a route was checked for them.
 *  - Pure count (D33): no email capture, so no new data collection. The signal
 *    is the click, and repeat clicks by the same person on different days
 *    (read from person_id in PostHog), which is the honest interest read.
 *  - The word "AI" is deliberately absent: it describes the capability, not the
 *    technology, which sidesteps the FTC AI-claims area and avoids overpromising.
 *
 * Self-terminating: hidden by the `trip-planner-demand` kill switch (manual
 * early-off, e.g. if the ~400-impression target is hit first) OR automatically
 * after EXPIRES_AT, whichever comes first, so a fake door never becomes a
 * permanent piece of dishonesty. D33 waived a pre-registered build/kill rule;
 * the owner reads the numbers and decides by eye, but the expiry still bounds it.
 */
const EXPIRES_AT = Date.parse("2026-08-12T00:00:00-07:00"); // 21 days from ship (item 93 / D33)

export default function TripPlannerFakeDoor({ spot }: { spot: Spot }) {
  const on = useKillSwitch("trip-planner-demand");
  const [open, setOpen] = useState(false);
  const [expired, setExpired] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Read the clock in an effect (not render) so SSR and the first client render
  // agree; if the window has passed, the door hides itself.
  useEffect(() => {
    if (Date.now() >= EXPIRES_AT) setExpired(true);
  }, []);

  // Dwell-gated impression, per the house rule (not on mount). One per spot.
  const viewRef = useGenuineView({
    key: spot.id,
    enabled: on && !expired,
    onView: () => trackIntent("trip_planner_prompt_shown", { spot_id: spot.id, region: spot.region }),
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!on || expired) return null;

  return (
    <div ref={viewRef} className="mt-3">
      <button
        onClick={() => {
          trackIntent("trip_planner_clicked", { spot_id: spot.id, region: spot.region });
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border)", color: "var(--dark)" }}
      >
        <span>Plan my trip</span>
        {/* Status is visible BEFORE the tap: this is a preview of an idea, not a
            working control. "Not built yet" matches the sheet exactly, so the
            badge never reads as a firmer promise than the sheet corrects to
            (the one thing the item-93 copy gate flagged, optional). */}
        <span className="rounded-full bg-(--fill) px-2 py-0.5 text-[11px] font-medium text-(--muted)">
          Not built yet
        </span>
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "rgba(11,42,71,0.35)", backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-['Newsreader'] text-lg font-bold text-(--dark)">Trip planner, not built yet</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-xl leading-none text-(--muted) transition-colors hover:text-(--dark)"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-(--dark)">
                The idea: pick a spot and a day, and see a suggested launch time and an out-and-back
                direction that works with the wind and tide, so the way home is the easier leg.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                It does not exist yet. Tapping it just told us you would want it, which is how we decide
                what to build next. Nothing here has checked today&apos;s conditions for you.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: "var(--accent)" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
