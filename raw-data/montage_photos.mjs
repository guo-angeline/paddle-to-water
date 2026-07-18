#!/usr/bin/env node
// Item 31 QA: build labeled contact sheets of the auto-picked photos so they can
// be eyeballed in bulk (the automated title-score cannot tell "bird at X Bay"
// from "photo of X Bay"). Each cell is labeled with the spot id so bad picks can
// be mapped back and dropped/re-picked. Temporary QA artifact, written to the
// scratch dir, not committed.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = process.argv[2] || "/tmp/photo-sheets";
const idsArg = process.argv[3]; // optional comma-list of spot ids to montage instead of all
fs.mkdirSync(OUT, { recursive: true });

const m = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "spot-photos.json"), "utf8")).photos;
let entries = Object.entries(m).map(([id, p]) => ({ id: Number(id), ...p }));
if (idsArg) {
  const want = new Set(idsArg.split(",").map((s) => Number(s.trim())));
  entries = entries.filter((e) => want.has(e.id));
}
entries.sort((a, b) => a.id - b.id);

const COLS = 5, ROWS = 4, CW = 260, CH = 200, PAD = 6, LBL = 26;
const perSheet = COLS * ROWS;
const cellW = CW, cellH = CH + LBL;

async function cell(e) {
  const img = await sharp(path.join(ROOT, "public", e.file))
    .resize({ width: CW, height: CH, fit: "cover" })
    .toBuffer();
  const label = `${e.id}  (score ${e.score})`;
  const svg = Buffer.from(
    `<svg width="${cellW}" height="${cellH}"><rect width="${cellW}" height="${LBL}" y="${CH}" fill="#0B2A47"/><text x="6" y="${CH + 18}" font-family="sans-serif" font-size="15" fill="#fff">${label}</text></svg>`
  );
  return sharp({ create: { width: cellW, height: cellH, channels: 3, background: "#fff" } })
    .composite([{ input: img, top: 0, left: 0 }, { input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

const sheets = Math.ceil(entries.length / perSheet);
for (let s = 0; s < sheets; s++) {
  const slice = entries.slice(s * perSheet, (s + 1) * perSheet);
  const cells = await Promise.all(slice.map(cell));
  const W = COLS * (cellW + PAD) + PAD;
  const H = ROWS * (cellH + PAD) + PAD;
  const comps = cells.map((buf, i) => ({
    input: buf,
    top: PAD + Math.floor(i / COLS) * (cellH + PAD),
    left: PAD + (i % COLS) * (cellW + PAD),
  }));
  const out = path.join(OUT, `sheet-${s + 1}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#DCE7F0" } })
    .composite(comps).png().toFile(out);
  process.stdout.write(`${out}  (spots ${slice.map((e) => e.id).join(", ")})\n`);
}
