// Item 77: the name shown on a published review.
//
// This exists because the byline used to be `email.split("@")[0]`, which
// published a fragment of the contributor's email address on a public page
// they never chose it for. For `firstname.lastname@company.com` that is the
// person's real name. NEVER derive a byline from an address again: the only
// acceptable source is something the person typed on purpose.
//
// Pure and DOM-free so the same rules run in the form and again on the server,
// where they are the ones that actually count.

export const MIN_DISPLAY_NAME = 2;
export const MAX_DISPLAY_NAME = 24;

export type DisplayNameResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Validate a chosen display name.
 * An empty/blank input is VALID and yields "": the field is optional, and
 * skipping it publishes as "A paddler". Callers must treat "" as "no byline",
 * never as a reason to fall back to the email.
 */
export function validateDisplayName(raw: unknown): DisplayNameResult {
  if (raw === null || raw === undefined) return { ok: true, value: "" };
  if (typeof raw !== "string") return { ok: false, error: "Enter a name." };

  // Collapse internal runs of whitespace so "a     b" cannot be used to shove
  // a name across a card, and trim the ends.
  const value = raw.replace(/\s+/g, " ").trim();
  if (value === "") return { ok: true, value: "" };

  if (value.includes("@")) {
    return { ok: false, error: "Leave out the @ sign. This name is public, so don't use your email." };
  }
  if (value.length < MIN_DISPLAY_NAME) {
    return { ok: false, error: `Use at least ${MIN_DISPLAY_NAME} characters.` };
  }
  if (value.length > MAX_DISPLAY_NAME) {
    return { ok: false, error: `Keep it to ${MAX_DISPLAY_NAME} characters or fewer.` };
  }
  // Letters (any script), digits, space, and a few name punctuation marks.
  // Deliberately excludes control characters, emoji, and markup.
  if (!/^[\p{L}\p{N} '’\-_.]+$/u.test(value)) {
    return { ok: false, error: "Use letters, numbers, spaces, hyphens or apostrophes." };
  }
  if (!/[\p{L}\p{N}]/u.test(value)) {
    return { ok: false, error: "Use at least one letter or number." };
  }
  return { ok: true, value };
}
