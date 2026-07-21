// Item 44: validation for the migrate-on-sign-in payload (POST /api/account/link).
// Kept pure + DOM-free so it unit-tests without a running server.

export interface LinkInput {
  anonId: string | null;
  savedSpotIds: number[];
}

const MAX_SAVED = 500; // a generous cap; saves are small integers

export function parseLinkBody(body: unknown): { ok: true; value: LinkInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "body must be an object" };
  const b = body as Record<string, unknown>;

  const anonId =
    typeof b.anonId === "string" && b.anonId.length > 0 && b.anonId.length <= 100 ? b.anonId : null;

  if (!Array.isArray(b.savedSpotIds)) return { ok: false, error: "savedSpotIds must be an array" };
  // Coerce to a clean, deduped, capped set of positive integers.
  const savedSpotIds = Array.from(
    new Set(
      b.savedSpotIds.filter(
        (n): n is number => typeof n === "number" && Number.isInteger(n) && n > 0
      )
    )
  ).slice(0, MAX_SAVED);

  return { ok: true, value: { anonId, savedSpotIds } };
}
