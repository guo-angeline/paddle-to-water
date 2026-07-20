"use client";

import { useEffect } from "react";
import {
  BACK_SWIPE_CONFIG,
  decidePhase,
  isEdgeStart,
  shouldTriggerOnMove,
  shouldTriggerOnEnd,
} from "./backGesture";

interface UseBackGestureArgs {
  enabled: boolean;
  onBack: () => void;
}

// Local phase machine: "idle" (no touch in progress or the last one didn't
// start in the edge zone), "tracking" (edge-started, direction not yet
// decided), "committed" (locked in as a horizontal back-swipe), "rejected"
// (locked out, e.g. a mostly-vertical list scroll), "done" (onBack already
// fired for this touch, touchend must not fire it again).
type GesturePhase = "idle" | "tracking" | "committed" | "rejected" | "done";

// Reads env(safe-area-inset-left) via a throwaway probe element's computed
// style, the standard way to read a CSS env() value from JS. Falls back to
// 0 (no widening) if computed style is unavailable, e.g. in a non-DOM test
// environment.
function readSafeAreaLeftPx(): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.paddingLeft = "env(safe-area-inset-left)";
  document.body.appendChild(probe);
  const parsed = parseFloat(getComputedStyle(probe).paddingLeft);
  document.body.removeChild(probe);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Left-edge back-swipe: attaches document touch listeners only while
 * `enabled`, and only to close the currently open spot sheet (or, on
 * /spot/[id], to navigate home). Threshold-triggered dismissal, no
 * drag-follow, so there is no new animation introduced by this hook.
 */
export function useBackGesture({ enabled, onBack }: UseBackGestureArgs): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;

    let phase: GesturePhase = "idle";
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    const safeAreaLeftPx = readSafeAreaLeftPx();

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      if (!isEdgeStart(touch.clientX, safeAreaLeftPx, BACK_SWIPE_CONFIG)) {
        phase = "idle";
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      phase = "tracking";
    }

    function onTouchMove(e: TouchEvent) {
      if (phase !== "tracking" && phase !== "committed") return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (phase === "tracking") {
        phase = decidePhase(dx, dy, BACK_SWIPE_CONFIG);
      }

      if (phase === "committed") {
        // Blocks map pan / scroll chaining for THIS touch only: the browser
        // never sees this as a native scroll/pan gesture once committed.
        e.preventDefault();
        if (shouldTriggerOnMove(dx, BACK_SWIPE_CONFIG)) {
          onBack();
          phase = "done";
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (phase === "committed") {
        const touch = e.changedTouches[0];
        const dx = touch ? touch.clientX - startX : 0;
        const elapsedMs = Date.now() - startTime;
        if (shouldTriggerOnEnd(dx, elapsedMs, BACK_SWIPE_CONFIG)) {
          onBack();
        }
        // Else: silent no-op, no visual state was ever shown for a
        // threshold-triggered gesture, so there is nothing to reset.
      }
      phase = "idle";
    }

    function onTouchCancel() {
      phase = "idle";
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchCancel);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [enabled, onBack]);
}
