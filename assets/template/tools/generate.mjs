// hover-reveal image pairs: a top layer from a prompt, then the hidden layer as an edit of it, so the two overlay.
//
//   node generate.mjs portrait watch          top + under for those looks (all looks if none given)
//   node generate.mjs bust --only under       redo just the hidden layer from the existing top
//   node generate.mjs bust --only under --fix "make the hair the same shape"   extra note for this run
//
// Prompts live in looks.json. FAL_KEY comes from the environment (or a gitignored .env.local at the project root).
// Outputs: ./out/<look>/{top,under}.png (2K masters, earlier versions kept as *.bak-N.png)
//          ../site/img/<look>/{top,under}.webp (what the page loads) and ./out/sheet-<look>.png (top | under | 50% overlay)

import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const envFile = join(ROOT, "../.env.local");
if (!process.env.FAL_KEY && existsSync(envFile)) process.env.FAL_KEY = readFileSync(envFile, "utf8").match(/^FAL_KEY=(.*)$/m)?.[1].trim();
if (!process.env.FAL_KEY) throw new Error("set FAL_KEY (FAL_KEY=… node generate.mjs …)");

const MODEL = "fal-ai/nano-banana-pro";
const EDIT_MODEL = "fal-ai/nano-banana-pro/edit";
const WIDTH = 1600; // web size, 4:5 → 1600×2000

const spec = JSON.parse(readFileSync(join(ROOT, "looks.json"), "utf8"));
const argv = process.argv.slice(2);
const flag = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
const only = flag("--only");
const fix = flag("--fix");
const ids = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
const looks = ids.length ? ids : Object.keys(spec.looks);

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  if (existsSync(dest)) {
    let n = 1;
    while (existsSync(dest.replace(".png", `.bak-${n}.png`))) n++;
    renameSync(dest, dest.replace(".png", `.bak-${n}.png`));
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function run(model, input, dest, tag) {
  console.log(`[${tag}] generating…`);
  const { data } = await fal.subscribe(model, { input: { aspect_ratio: "4:5", resolution: "2K", output_format: "png", ...input } });
  await download(data.images[0].url, dest);
  console.log(`[${tag}] → ${dest}`);
}

async function publish(src, dest) {
  await sharp(src).resize(WIDTH, WIDTH * 1.25, { fit: "cover" }).webp({ quality: 86 }).toFile(dest);
}

async function look(id) {
  const l = spec.looks[id];
  const out = join(ROOT, "out", id);
  const site = join(ROOT, "..", "site", "img", id);
  mkdirSync(out, { recursive: true });
  mkdirSync(site, { recursive: true });
  const top = join(out, "top.png");
  const under = join(out, "under.png");
  const note = fix ? ` ${fix}` : "";

  if (only !== "under") await run(MODEL, { prompt: `${l.top} ${spec.style}${only === "top" ? note : ""}` }, top, `${id}/top`);
  if (only !== "top") {
    const url = await fal.storage.upload(new Blob([readFileSync(top)], { type: "image/png" }));
    await run(EDIT_MODEL, { prompt: `${l.under} ${l.keep ?? spec.keep}${note}`, image_urls: [url] }, under, `${id}/under`);
  }
  await publish(top, join(site, "top.webp"));
  if (existsSync(under)) {
    await publish(under, join(site, "under.webp"));
    // Review: top | under | 50% overlay (ghosting = misalignment)
    const w = 600, h = 750;
    const [a, b] = await Promise.all([top, under].map((f) => sharp(f).resize(w, h, { fit: "cover" }).toBuffer()));
    const mix = await sharp(a).composite([{ input: await sharp(b).removeAlpha().ensureAlpha(0.5).toBuffer(), blend: "over" }]).toBuffer();
    await sharp({ create: { width: w * 3, height: h, channels: 3, background: "#fff" } })
      .composite([{ input: a, left: 0, top: 0 }, { input: b, left: w, top: 0 }, { input: mix, left: w * 2, top: 0 }])
      .png().toFile(join(ROOT, "out", `sheet-${id}.png`));
  }
}

await Promise.all(looks.map((id) => look(id).catch((e) => console.error(`[${id}] failed:`, e.message, e.body ?? ""))));
