import manifest from "@/data/spot-photos.json";

/**
 * Item 31: per-spot photos, auto-selected from Wikimedia Commons and
 * vision-curated (owner directive 2026-07-18, no manual curation). Self-hosted
 * sized derivatives under `public/spot-photos/`. Not every spot has one: only
 * spots with a verified free-licensed location photo are in the manifest; the
 * rest render no photo (a wrong photo is worse than none). CC-BY / CC-BY-SA
 * require attribution, so `author` + `license` + `source_page` must be rendered
 * wherever the photo shows.
 */
export interface SpotPhoto {
  /** Absolute path under /public, e.g. "/spot-photos/12.jpg". */
  file: string;
  author: string;
  license: string;
  license_url: string | null;
  source: string;
  source_page: string;
}

const PHOTOS = (manifest as { photos: Record<string, SpotPhoto> }).photos;

export function getSpotPhoto(id: number): SpotPhoto | null {
  return PHOTOS[String(id)] ?? null;
}
