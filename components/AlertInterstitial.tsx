"use client";

import { useEffect } from "react";
import type { Spot } from "@/lib/types";
import { trackIntent } from "@/lib/analytics";
import { useExperiment } from "@/lib/experiments";

interface Props {
  spot: Spot;
  windowLabel: string;
  onDismiss: () => void;
}

/**
 * Floating card over the deep-linked spot's drawer, shown only when the app
 * opened from a push alert. Repeats the calm-window timing the notification
 * already named, plus the spot's put-in notes, so that context survives the
 * click instead of dropping into a bare drawer (ROADMAP item 1).
 */
export default function AlertInterstitial({ spot, windowLabel, onDismiss }: Props) {
  const { variant, ready, logExposure } = useExperiment("alert_interstitial");
  const isTreatment = ready && variant === "treatment";

  useEffect(() => {
    if (!isTreatment) return;
    logExposure();
    trackIntent("alert_interstitial_shown", { spot_id: spot.id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTreatment, spot.id]);

  if (!isTreatment) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

  function handleDismiss() {
    trackIntent("alert_interstitial_result", { spot_id: spot.id, outcome: "dismissed" });
    onDismiss();
  }

  function handleDirections() {
    trackIntent("alert_interstitial_result", { spot_id: spot.id, outcome: "directions" });
    onDismiss();
  }

  return (
    <div className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4" style={{ zIndex: 1300 }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl px-4 py-3.5" style={{ background: "var(--accent)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-['Libre_Baskerville'] text-white text-base font-bold leading-tight">
              Good window: {windowLabel}
            </p>
            <p className="text-white/80 text-sm mt-0.5">{spot.water}</p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        {spot.notes && (
          <p className="text-white/90 text-sm mt-2 leading-snug line-clamp-3">{spot.notes}</p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirections}
          className="mt-3 flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold bg-white transition-opacity hover:opacity-90"
          style={{ color: "var(--accent)" }}
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
