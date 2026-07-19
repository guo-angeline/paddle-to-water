/**
 * Meltwater design tokens, transcribed 1:1 from web/app/globals.css :root.
 * That file is the source of truth; if a token changes there, change it here.
 * Component-level tint maps (difficulty pills, conditions badge colors) come
 * from the shared web modules or are ported alongside each component, same as
 * the web keeps them inline (see CLAUDE.md "Theme").
 */
export const colors = {
  /* base */
  bg: "#EEF5FB",
  white: "#FFFFFF",
  surfaceMuted: "#F8FBFE",
  fill: "#F2F7FC",
  fillAlt: "#EEF3F9",
  border: "#DCE7F0",
  borderSoft: "#E4EBF2",
  /* ink */
  dark: "#0B2A47",
  ink2: "#42607A",
  muted: "#556A7E",
  inkMuted: "#8AA0B4",
  inkFaint: "#9DAEBD",
  /* brand */
  accent: "#0E6FD1",
  accentInk: "#0B4E96",
  accentLight: "#E3EEFA",
  accentFillHi: "#EAF2FC",
  /* water types */
  flatwater: "#12A5B0",
  flatwaterInk: "#0E7F78",
  flatwaterFill: "#DBF3F0",
  ocean: "#0E6FD1",
  oceanInk: "#0B4E96",
  oceanFill: "#E3EEFA",
  river: "#E06636",
  riverInk: "#CC5528",
  riverFill: "#FDEAE0",
  /* status */
  calm: "#0E7F78",
  calmFill: "#DBF3F0",
  free: "#2E9E5B",
  freeFill: "#E4F5EA",
  windAlert: "#CC5528",
  windAlertFill: "#FEE9E0",
  /* breezy is intentionally distinct from windAlert (see design spec) */
  breezy: "#B4671F",
  breezyFill: "#FEF3E8",
  saved: "#E23B54",
} as const;

/**
 * Font families as registered in _layout.tsx via @expo-google-fonts packages.
 * Newsreader = display serif (wordmark, sheet titles); Hanken Grotesk = body.
 */
export const fonts = {
  display: "Newsreader_500Medium",
  displaySemibold: "Newsreader_600SemiBold",
  displayRegular: "Newsreader_400Regular",
  body: "HankenGrotesk_400Regular",
  bodyMedium: "HankenGrotesk_500Medium",
  bodySemibold: "HankenGrotesk_600SemiBold",
  bodyBold: "HankenGrotesk_700Bold",
  bodyExtraBold: "HankenGrotesk_800ExtraBold",
} as const;

export const radius = {
  /** cards, buttons (web rounded-xl) */
  xl: 12,
  /** inputs, small buttons (web rounded-lg) */
  lg: 8,
  /** bottom sheet top corners (web rounded-t-2xl) */
  sheet: 16,
  /** pills and badges (web rounded-full) */
  full: 999,
} as const;
