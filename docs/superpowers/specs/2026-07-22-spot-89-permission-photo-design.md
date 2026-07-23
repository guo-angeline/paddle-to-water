# Spot 89 permission photo replacement

## Goal

Replace spot 89's current Creative Commons image with the supplied photo from `/Users/qg/Downloads/89.jpg`, used with the owner's stated permission from Kaety Jensen.

## Asset processing

- Preserve the supplied photograph without generative editing, reframing, object removal, or color alteration.
- Create a deterministic web derivative matching the existing spot-photo pipeline: JPEG, 800 pixels wide, proportional height, progressive encoding where the available project tooling supports it.
- Replace `web/public/spot-photos/89.jpg`; do not add a second versioned asset.

## Provenance and attribution

- Replace spot 89's manifest entry with `source: "permission"` and `author: "Kaety Jensen"`.
- Do not invent a source URL, license URL, or Creative Commons license.
- Render the caption exactly as plain text: `Photo: Kaety Jensen`.
- Keep every existing Creative Commons, public-domain, and owner-photo attribution path unchanged.

## Rendering

- Extend the spot-photo attribution renderer only enough to recognize permission-sourced photos.
- Permission-sourced photos render the exact plain-text caption and no attribution links.
- Other third-party photos retain linked author, license, and source attribution.
- Owner photos continue to suppress attribution.

## Verification

- Add a manifest/renderer regression test for the permission-source contract and exact caption.
- Run the full web test suite, lint, and production build.
- Render spot 89 at desktop and 390px mobile; confirm the new photo, exact caption, proportional crop behavior, and absence of broken links.
- Deploy as a reversible content change and verify the live spot page.

## Scope

No changes to spot data, coordinates, photo analytics, kill-switch behavior, other photos, or user-facing copy outside spot 89's attribution.
