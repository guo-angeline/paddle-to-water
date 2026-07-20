import Link from "next/link";

// App Router 404. Catches notFound() from app/spot/[id]/page.tsx (hidden or
// unknown spot ids) and any unmatched route, and keeps the real 404 status.
// A shared, stale, or search-cached /spot/<id> link is the acquisition channel
// (growth is ~82% direct/word-of-mouth), so a dead end here bounces a real
// prospective user; a branded page with a home CTA recovers the arrival.
export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        background: "var(--bg)",
        color: "var(--dark)",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding:
          "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
      }}
    >
      {/* Brand masthead (links home) */}
      <Link
        href="/"
        aria-label="Paddle to Water, return home"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "'Newsreader', serif",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--dark)",
          textDecoration: "none",
          padding: "1.25rem 1.5rem",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt=""
          width={28}
          height={28}
          style={{ height: "1.75rem", width: "1.75rem", borderRadius: "22%", flexShrink: 0 }}
        />
        Paddle to Water
      </Link>

      {/* Centered message */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
          maxWidth: "32rem",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            margin: "0 0 0.75rem",
          }}
        >
          404
        </p>
        <h1
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.2,
            color: "var(--dark)",
            margin: "0 0 0.75rem",
          }}
        >
          We couldn&rsquo;t find that spot.
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: "0 0 2rem",
          }}
        >
          The link may be old, or the spot was taken down. The rest of the map is still
          here.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "44px",
            padding: "0.75rem 1.5rem",
            background: "var(--accent)",
            color: "#ffffff",
            fontSize: "0.9375rem",
            fontWeight: 600,
            borderRadius: "0.625rem",
            textDecoration: "none",
          }}
        >
          Browse all spots
        </Link>
      </div>
    </div>
  );
}
