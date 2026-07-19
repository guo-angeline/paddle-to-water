import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

import type { DeepLink } from "../../push/deepLink";
import HomeScreen from "../../screens/HomeScreen";

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Path-form deep links (paddletowater:///spot/32, and later the universal
 * link https://paddletowater.com/spot/32?from=share&t=...). The app is one
 * screen, so this route renders it with the link as an initial prop, the
 * native twin of web's /spot/[id]/page.tsx rendering
 * <HomeClient initialSpotId={id}>. No redirect: a redirect unmounted the
 * screen instance that had already consumed the link.
 */
export default function SpotRoute() {
  const params = useLocalSearchParams<{
    id: string;
    from?: string | string[];
    t?: string | string[];
    window?: string | string[];
  }>();

  const link = useMemo<DeepLink | undefined>(() => {
    const id = Number(first(params.id));
    if (!Number.isInteger(id) || id <= 0) return undefined;
    const from = first(params.from);
    return {
      spotId: id,
      from: from === "alert" || from === "share" || from === "email" ? from : "deeplink",
      token: first(params.t) ?? null,
      windowLabel: first(params.window) ?? null,
    };
  // The route mounts once per link; params are stable for its lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <HomeScreen initialLink={link} fromSpotRoute />;
}
