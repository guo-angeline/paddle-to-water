import type { DisplayRating } from "@/lib/rating";

/**
 * The star + number, wherever it appears. One component so the list and the
 * sheet can never drift into describing the same number two different ways.
 *
 * Three different things can produce a number here, and they are not
 * interchangeable:
 *
 *  - BLENDED (owner rating + user reviews). Item 84 (owner-directed,
 *    2026-07-21) removed the visible "Paddle score" label, so this number now
 *    carries NO visible provenance. The screen-reader description still says
 *    what it combines, and it must keep doing so: a blended value must never
 *    carry a bare "(N)" or the visible words "paddler reviews", which would
 *    credit contributors with a number they did not produce. The legal gate
 *    returned needs-changes on exactly that (2026-07-21).
 *  - PADDLERS ONLY (spots with no owner rating, past D24's threshold): a plain
 *    arithmetic average, so it keeps D24's count-always-shown display.
 *  - OWNER ONLY (no reviews yet): unchanged from item 39 / D21.
 */
export default function SpotRating({ rating }: { rating: DisplayRating }) {
  const reviewWord = rating.count === 1 ? "review" : "reviews";
  return (
    <>
      <span aria-hidden className="text-(--accent)">
        &#9733;
      </span>{" "}
      {rating.value.toFixed(1)}
      {rating.blended ? (
        <>
          {/* Keeps the sense, drops the brand term: a screen-reader user must
              still learn the number is a blend, not a crowd average. */}
          <span className="sr-only">
            {` out of 5, combining our own rating with ${rating.count} paddler ${reviewWord}`}
          </span>
        </>
      ) : rating.count > 0 ? (
        <>
          <span className="sr-only">{` out of 5 from ${rating.count} paddler ${reviewWord}`}</span>
          <span aria-hidden className="font-normal text-(--muted)">
            {" "}
            ({rating.count})
          </span>
        </>
      ) : (
        <span className="sr-only"> out of 5</span>
      )}
    </>
  );
}
