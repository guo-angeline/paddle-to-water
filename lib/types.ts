export type Difficulty = "flatwater" | "bay" | "river" | "unknown";

export interface Spot {
  id: number;
  region: string;
  city: string | null;
  water: string;
  notes: string | null;
  lat: number;
  lng: number;
  geocode_display: string | null;
  difficulty: Difficulty;
  fee_amount: number | null;
  has_fee: boolean | null;
  power_boats: boolean | null;
  tide_sensitive: boolean;
  dog_friendly: boolean;
  rentals_available: boolean;
  inspection_required: boolean;
  /**
   * Withhold this spot from every surface: list, map, /spot/[id], sitemap,
   * JSON-LD, and BOTH alert crons. Absent/false = visible (the default).
   *
   * Set when a record cannot be trusted, not merely when it needs a fix. The
   * 2026-07-16 coordinate audit found records that describe put-ins which do
   * not appear to exist (see reports/coord-audit-2026-07-16.md). Filtering
   * lives in lib/spots.ts; never read data/spots.json directly.
   */
  hidden?: boolean;
  /** Why this spot is hidden, and what would un-hide it. Required when hidden. */
  hidden_reason?: string;
}

export const REGIONS = [
  "South Bay",
  "Peninsula",
  "East Bay",
  "San Francisco",
  "North Bay",
  "Sacramento",
  "Sierra Nevada",
  "Central Valley",
  "Central Coast",
] as const;

export const DIFFICULTIES: Difficulty[] = ["flatwater", "bay", "river"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  flatwater: "Flatwater",
  bay: "Open water",
  river: "River",
  unknown: "Unknown",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  flatwater: "#12A5B0",
  bay:       "#0E6FD1",
  river:     "#E06636",
  unknown:   "#8AA0B4",
};

export const DIFFICULTY_LEGEND = [
  { color: DIFFICULTY_COLOR.flatwater, label: DIFFICULTY_LABEL.flatwater },
  { color: DIFFICULTY_COLOR.bay,       label: DIFFICULTY_LABEL.bay },
  { color: DIFFICULTY_COLOR.river,     label: DIFFICULTY_LABEL.river },
] as const;
