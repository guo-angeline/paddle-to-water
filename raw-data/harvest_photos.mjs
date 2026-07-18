#!/usr/bin/env node
// Item 31 (a picture for each spot), harvest slice. D10 option (a): tiered
// hybrid, self-hosted CC photos with attribution. This is the CANDIDATE
// harvester, NOT the populator: it queries Wikimedia Commons geosearch for
// free-licensed, geo-tagged photos near each spot and writes a curation file.
// A human then picks/rejects per spot (rights-clean sourcing is the hard part,
// see ROADMAP item 31 acceptance); only after curation do URLs land in
// spots.json and get self-hosted as sized derivatives.
//
// Flickr CC geosearch (the second D10 source) needs an API key and is NOT run
// here; this pass establishes the Commons coverage baseline the probe estimated
// at ~78% of spots within 500m.
//
// Usage:  node raw-data/harvest_photos.mjs [radiusMeters]
// Output: raw-data/photo-candidates.json  (structured, for the curation UI/step)
//         stdout coverage summary
//
// No app code, no deploy: this only reads data/spots.json and writes a
// candidate file for review.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SPOTS = path.join(ROOT, "data", "spots.json");
const OUT = path.join(__dirname, "photo-candidates.json");

const RADIUS = Number(process.argv[2] || 500); // metres; D10 probe used 500m
const PER_SPOT = 12; // geosearch cap per spot before curation
const UA = "PaddleToWater-photo-harvest/1.0 (https://paddletowater.com; studio loop, item 31)";
const API = "https://commons.wikimedia.org/w/api.php";

// Wikimedia asks for serial, polite access from a bot; keep a small gap.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free-to-reuse licenses we accept. Anything else (fair use, "all rights
// reserved", non-commercial, no-derivatives) is dropped: the app self-hosts, so
// the license must permit redistribution + our derivative resizing.
const FREE = [
  /^cc0/i,
  /^cc[ -]?by(?:[ -]?sa)?(?:[ -]?\d(?:\.\d)?)?$/i,
  /^public domain/i,
  /^pd/i,
];
function licenseIsFree(short, machine) {
  const s = (short || "").trim();
  const m = (machine || "").trim();
  if (/fair use|non[- ]?free|all rights reserved|\bnc\b|noncommercial|\bnd\b|no derivativ/i.test(s + " " + m)) {
    return false;
  }
  return FREE.some((re) => re.test(s) || re.test(m));
}

// extmetadata values arrive as HTML; strip to a plain attribution string.
function plain(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function apiGet(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ ...params, format: "json", origin: "*" }).toString();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt === 2) throw e;
      await sleep(800 * (attempt + 1));
    }
  }
}

async function geosearch(lat, lng) {
  const data = await apiGet({
    action: "query",
    list: "geosearch",
    gscoord: `${lat}|${lng}`,
    gsradius: String(RADIUS),
    gslimit: String(PER_SPOT),
    gsnamespace: "6", // File:
  });
  return data?.query?.geosearch || [];
}

async function imageinfo(titles) {
  if (!titles.length) return {};
  const data = await apiGet({
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1024",
  });
  const pages = data?.query?.pages || {};
  const byTitle = {};
  for (const p of Object.values(pages)) {
    const ii = p.imageinfo?.[0];
    if (ii) byTitle[p.title] = ii;
  }
  return byTitle;
}

function loadSpots() {
  const raw = JSON.parse(fs.readFileSync(SPOTS, "utf-8"));
  const arr = Array.isArray(raw) ? raw : raw.spots;
  // Skip delisted/withheld records: no point curating a photo for a spot no
  // surface will render (D14). `hidden` may be absent on most records.
  return arr.filter((s) => !s.hidden && s.lat != null && s.lng != null);
}

async function main() {
  const spots = loadSpots();
  const results = [];
  let withCandidates = 0;

  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    const name = s.water || s.city || `spot ${s.id}`;
    let candidates = [];
    try {
      const hits = await geosearch(s.lat, s.lng);
      const titles = hits.map((h) => h.title);
      const info = await imageinfo(titles);
      for (const h of hits) {
        const ii = info[h.title];
        if (!ii || !(ii.mime || "").startsWith("image/")) continue;
        const em = ii.extmetadata || {};
        const short = em.LicenseShortName?.value;
        const machine = em.License?.value;
        if (!licenseIsFree(short, machine)) continue;
        candidates.push({
          title: h.title,
          distance_m: Math.round(h.dist),
          thumb: ii.thumburl || null,
          full: ii.url,
          width: ii.width,
          height: ii.height,
          license: plain(short) || plain(machine),
          license_url: em.LicenseUrl?.value || null,
          author: plain(em.Artist?.value) || "Unknown",
          credit: plain(em.Credit?.value) || null,
          attribution_required: /true|1/i.test(em.AttributionRequired?.value || "true"),
          source_page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(h.title)}`,
        });
      }
    } catch (e) {
      process.stderr.write(`spot ${s.id} (${name}): ${e.message}\n`);
    }
    candidates.sort((a, b) => a.distance_m - b.distance_m);
    if (candidates.length) withCandidates++;
    results.push({
      spot_id: s.id,
      name,
      region: s.region,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
      candidate_count: candidates.length,
      chosen: null, // curation fills this: a title from candidates, or an owner-photo path
      candidates,
    });
    process.stdout.write(
      `[${String(i + 1).padStart(3)}/${spots.length}] spot ${String(s.id).padStart(3)} ${name.slice(0, 40).padEnd(40)} ${candidates.length} free candidate(s)\n`
    );
    await sleep(120);
  }

  const summary = {
    generated_for: "ROADMAP item 31 (a picture for each spot), Commons harvest slice",
    radius_m: RADIUS,
    source: "Wikimedia Commons geosearch (free licenses only)",
    total_spots: spots.length,
    spots_with_free_candidate: withCandidates,
    coverage_pct: Math.round((withCandidates / spots.length) * 1000) / 10,
    note: "CANDIDATES for human curation, not confirmed spot photos. Flickr CC (needs API key) not yet run. After curation, chosen photos get self-hosted as sized derivatives and written to spots.json.",
  };
  fs.writeFileSync(OUT, JSON.stringify({ summary, spots: results }, null, 2));
  process.stdout.write(
    `\nCoverage: ${withCandidates}/${spots.length} spots have >=1 free Commons candidate (${summary.coverage_pct}%)\n` +
    `Wrote ${path.relative(ROOT, OUT)}\n`
  );
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e) + "\n");
  process.exit(1);
});
