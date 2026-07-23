import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { ALL_SPOTS } from "@/lib/spots";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { getSpotPhoto } from "@/lib/spotPhotos";


export const alt = "Paddleboard and kayak launch spot details on Paddle to Water";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const markSrc =
  "data:image/png;base64," +
  readFileSync(join(process.cwd(), "public/og-mark.png")).toString("base64");

// Item 112: read the spot's self-hosted photo as a data URI for next/og, or null
// if the spot has none or the file cannot be read (a missing file must fall back
// to the text card, never break the build). getSpotPhoto is the single source of
// truth for which spots have a photo and what credit they owe.
function loadSpotPhoto(
  id: number
): { src: string; author?: string; license?: string; creditRequired: boolean } | null {
  const photo = getSpotPhoto(id);
  if (!photo) return null;
  try {
    const ext = photo.file.toLowerCase().endsWith(".png") ? "png" : "jpeg";
    const bytes = readFileSync(join(process.cwd(), "public", photo.file));
    return {
      src: `data:image/${ext};base64,` + bytes.toString("base64"),
      author: photo.author,
      license: photo.license,
      // Same gate as the SpotDrawer figcaption: a credit renders only when an
      // author is named AND attribution is not explicitly waived. Owner photos
      // (no author) and CC0 (attribution_required: false) render no credit.
      creditRequired: !!photo.author && photo.attribution_required !== false,
    };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return ALL_SPOTS.map((s) => ({ id: String(s.id) }));
}

export default async function OGImage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const spot = ALL_SPOTS.find((s) => s.id === Number(id));

  if (!spot) {
    return new ImageResponse(
      (
        <div style={{ background: "#0B2A47", width: "100%", height: "100%", display: "flex" }} />
      ),
      { ...size }
    );
  }

  const feeLine =
    spot.has_fee === false
      ? "Free launch"
      : spot.has_fee === true && spot.fee_amount
      ? `$${spot.fee_amount} launch fee`
      : "";

  const meta = [spot.city, DIFFICULTY_LABEL[spot.difficulty], feeLine]
    .filter(Boolean)
    .join("  ·  ");

  const photo = loadSpotPhoto(spot.id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          // Navy stays the base so a photo that fails to cover, or its absence,
          // still reads as the brand card rather than a blank.
          background: "#0B2A47",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        {/* Photo background (item 112). Full-bleed cover; the text sits on top via
            the gradient below. Painted first so later elements layer over it. */}
        {photo && (
          <img
            src={photo.src}
            width={size.width}
            height={size.height}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "flex",
            }}
          />
        )}
        {/* Legibility gradient: transparent at top, deep navy at the bottom where
            the wordmark, title and meta sit. Only over a photo; the plain navy
            card needs no overlay. */}
        {photo && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background:
                "linear-gradient(to bottom, rgba(11,42,71,0.15) 0%, rgba(11,42,71,0.4) 55%, rgba(11,42,71,0.92) 100%)",
            }}
          />
        )}
        {/* Attribution, when the licence requires it. Same author/licence gate as
            the on-page figcaption. Top-left, out of the title block's way. */}
        {photo && photo.creditRequired && (
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 28,
              display: "flex",
              fontSize: 18,
              color: "rgba(255,255,255,0.72)",
              fontFamily: "sans-serif",
              background: "rgba(11,42,71,0.5)",
              padding: "4px 12px",
              borderRadius: 6,
            }}
          >
            {`Photo: ${photo.author}${photo.license ? " / " + photo.license : ""}`}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: "sans-serif",
          }}
        >
          <img src={markSrc} width={44} height={44} alt="" style={{ display: "flex" }} />
          {`Paddle to Water  ·  ${spot.region}`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: "bold",
            color: "#fff",
            lineHeight: 1.05,
            marginBottom: 28,
            fontFamily: "serif",
          }}
        >
          {spot.water}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "sans-serif",
          }}
        >
          {meta || " "}
        </div>
      </div>
    ),
    { ...size }
  );
}
