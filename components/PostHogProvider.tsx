"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Initializes PostHog once on the client. Renders nothing.
 *
 * Set NEXT_PUBLIC_POSTHOG_KEY (and optionally NEXT_PUBLIC_POSTHOG_HOST) in the
 * environment to enable it. Without the key this is a no-op, so local dev and
 * previews don't pollute analytics.
 */
export default function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2025-05-24",
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return null;
}
