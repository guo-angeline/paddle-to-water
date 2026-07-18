#!/usr/bin/env node
// Item 31, AUTOMATED selection slice (owner directive 2026-07-18: no human
// curation, pick by best judgement and deploy). Reads the Commons candidate
// file from harvest_photos.mjs, scores each spot's candidates, picks the best
// one over a quality bar, downloads a self-hosted sized derivative into
// public/spot-photos/, and writes data/spot-photos.json (the manifest the app
// reads). Spots whose best candidate does not clear the bar get NO photo (a
// wrong photo is worse than none).
//
// Selection is heuristic, not curation: geo-tagged within 500m + relevance
// keywords + spot-name-token match + orientation/resolution, minus obvious
// non-photo junk (maps, diagrams, logos, signs, single-species nature shots).
//
// Usage:  node raw-data/select_photos.mjs
// Writes: public/spot-photos/<id>.<ext>  and  data/spot-photos.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CANDIDATES = path.join(__dirname, "photo-candidates.json");
const OUT_DIR = path.join(ROOT, "public", "spot-photos");
const MANIFEST = path.join(ROOT, "data", "spot-photos.json");
const UA = "PaddleToWater-photo-harvest/1.0 (https://paddletowater.com; studio loop, item 31)";

const REL = /\b(launch|boat|ramp|kayak|canoe|paddle|sup|dock|pier|beach|marina|harbou?r|slough|lagoon|estuary|waterfront|shoreline|shore|cove|wharf|lake|reservoir|river|creek|bay|park|water|put[- ]?in|jetty|pond|inlet|channel|delta|bridge|sunset|sunrise)\b/gi;
// Titles that are almost never a usable location photo.
const JUNK = /\b(map|diagram|chart|logo|icon|plaque|signage|street ?sign|road ?sign|portrait|selfie|gravestone|headstone|coat of arms|flag of|blazon|scan|document|leaflet|brochure|schematic|floor ?plan|bird|duck|goose|heron|egret|gull|flower|blossom|mushroom|fungus|insect|butterfly|spider|beetle|snail|license plate|number plate)\b/gi;

function countMatches(str, re) {
  const m = String(str || "").match(re);
  return m ? m.length : 0;
}
function tokens(s) {
  return String(s || "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 4 && !["park","lake","boat","area","point","creek","river","marina","beach","state"].includes(t));
}

function score(cand, spot) {
  const title = cand.title.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "");
  let s = 0;
  s += countMatches(title, REL) * 3;
  s -= countMatches(title, JUNK) * 6;
  // spot-name token match (distinctive words like "Alviso", "Berkeley")
  const spotToks = new Set([...tokens(spot.name), ...tokens(spot.city)]);
  for (const t of spotToks) if (title.toLowerCase().includes(t)) s += 4;
  // proximity
  s += cand.distance_m < 120 ? 3 : cand.distance_m < 250 ? 2 : cand.distance_m < 400 ? 1 : 0;
  // orientation + resolution (landscape reads better in the drawer strip)
  if (cand.width && cand.height && cand.width > cand.height) s += 2;
  if (cand.width >= 1200) s += 2; else if (cand.width >= 800) s += 1;
  // small penalty for very distant
  if (cand.distance_m > 450) s -= 1;
  return s;
}

function extFromUrl(u) {
  const clean = u.split("?")[0];
  const m = clean.match(/\.([a-z0-9]{3,4})$/i);
  const e = (m ? m[1] : "jpg").toLowerCase();
  return e === "jpeg" ? "jpg" : e;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, dest) {
  // Resume: skip anything already on disk (a prior partial run), so a rate-limit
  // retry does not re-fetch the whole set.
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status === 503) {
      const wait = 2000 * (attempt + 1);
      process.stderr.write(`  ${res.status}, backing off ${wait}ms\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return buf.length;
  }
  throw new Error("rate-limited after retries");
}

async function main() {
  const data = JSON.parse(fs.readFileSync(CANDIDATES, "utf-8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const MIN_SCORE = 3; // must show at least some positive signal
  const manifest = {};
  let picked = 0, skipped = 0, bytes = 0;

  for (const spot of data.spots) {
    if (!spot.candidates.length) { skipped++; continue; }
    const ranked = spot.candidates
      .map((c) => ({ c, s: score(c, spot) }))
      .sort((a, b) => b.s - a.s || a.c.distance_m - b.c.distance_m);
    const best = ranked[0];
    if (!best || best.s < MIN_SCORE || !best.c.thumb) { skipped++; continue; }
    const c = best.c;
    const ext = extFromUrl(c.thumb);
    const file = `${spot.spot_id}.${ext}`;
    try {
      bytes += await download(c.thumb, path.join(OUT_DIR, file));
    } catch (e) {
      process.stderr.write(`spot ${spot.spot_id} download failed: ${e.message}\n`);
      skipped++;
      continue;
    }
    manifest[spot.spot_id] = {
      file: `/spot-photos/${file}`,
      author: c.author || "Unknown",
      license: c.license,
      license_url: c.license_url || null,
      source: "Wikimedia Commons",
      source_page: c.source_page,
      title: c.title,
      distance_m: c.distance_m,
      score: best.s,
    };
    picked++;
    process.stdout.write(`spot ${String(spot.spot_id).padStart(3)} [score ${String(best.s).padStart(2)}] ${c.title.replace(/^File:/, "").slice(0, 55)}\n`);
    await sleep(400); // be polite to Wikimedia; 429 hit at full speed
  }

  const out = {
    generated: "raw-data/select_photos.mjs (automated pick, owner directive 2026-07-18, no manual curation)",
    source: "Wikimedia Commons, free licenses only, self-hosted sized derivatives",
    total_with_photo: picked,
    total_skipped: skipped,
    min_score: MIN_SCORE,
    photos: manifest,
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2));
  process.stdout.write(
    `\nPicked ${picked} photos (${(bytes / 1e6).toFixed(1)} MB), skipped ${skipped}.\n` +
    `Wrote ${path.relative(ROOT, MANIFEST)} and ${path.relative(ROOT, OUT_DIR)}/\n`
  );
}

main().catch((e) => { process.stderr.write(String(e?.stack || e) + "\n"); process.exit(1); });
