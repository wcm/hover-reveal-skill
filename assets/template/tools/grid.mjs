// Measuring sheet: a look's picture at 800×1000 (the line-work coordinate space) with a labelled 100-unit grid,
// so positions for leaders, crosses and loupe parts can be read straight off it.
//
//   node grid.mjs watch            → out/watch/grid-top.png and out/watch/grid-under.png
//   node grid.mjs watch under 50   just the hidden layer, finer 50-unit grid

import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const [id, which, stepArg] = process.argv.slice(2);
if (!id) throw new Error("usage: node grid.mjs <look> [top|under] [step]");
const step = Number(stepArg) || 100;
const W = 800, H = 1000;
mkdirSync(join(ROOT, "out", id), { recursive: true });

let g = "";
for (let x = 0; x <= W; x += step) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#00e5ff" stroke-opacity="${x % 100 ? 0.45 : 0.9}"/><text x="${x + 3}" y="14" fill="#00e5ff" font-family="monospace" font-size="13">${x}</text>`;
for (let y = 0; y <= H; y += step) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#00e5ff" stroke-opacity="${y % 100 ? 0.45 : 0.9}"/><text x="3" y="${y - 3}" fill="#00e5ff" font-family="monospace" font-size="13">${y}</text>`;
const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`);

for (const layer of which ? [which] : ["top", "under"]) {
  const src = join(ROOT, "..", "site", "img", id, `${layer}.webp`);
  if (!existsSync(src)) { console.log(`skip ${src} (missing)`); continue; }
  const dest = join(ROOT, "out", id, `grid-${layer}.png`);
  await sharp(src).resize(W, H, { fit: "cover" }).composite([{ input: overlay }]).png().toFile(dest);
  console.log(`→ ${dest}`);
}
