import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.resolve(__dirname, "AlertInterstitial.tsx"), "utf-8");

describe("AlertInterstitial light card style contract", () => {
  it("uses the shared light surface, border, and InstallPrompt shadow", () => {
    expect(src).toContain('background: "var(--white)"');
    expect(src).toContain('border: "1px solid var(--border)"');
    expect(src).toContain('boxShadow: "0 8px 30px rgba(11,42,71,0.14)"');
  });

  it("uses dark and secondary ink for card copy", () => {
    expect(src).toContain("text-(--dark) text-base");
    expect(src).toContain("text-(--ink-2) text-sm");
    expect(src).toContain("text-(--muted) text-xs");
  });

  it("keeps both controls touch-sized with visible focus rings", () => {
    expect(src).toMatch(/aria-label="Dismiss"[\s\S]*?h-11 w-11[\s\S]*?focus-visible:ring-2 focus-visible:ring-\(--accent\)/);
    expect(src).toMatch(/disabled=\{status === "setting"\}[\s\S]*?min-h-11[\s\S]*?focus-visible:ring-2 focus-visible:ring-\(--accent\)/);
  });

  it("uses an accent CTA and an announced light-surface done state", () => {
    expect(src).toMatch(/role="status"\s+aria-live="polite"[\s\S]*?Reminder set/);
    expect(src).toContain("bg-(--accent) text-white");
    expect(src).toContain("bg-(--free-fill) text-(--free)");
  });

  it("removes the inverse dark-card treatment", () => {
    expect(src).not.toContain('background: "var(--accent)"');
    expect(src).not.toMatch(/text-white\/(?:70|85|90)/);
    expect(src).not.toContain("bg-white transition-opacity");
  });
});
