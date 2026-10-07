// A living hidden layer: a seamless loop of the look's `under` still, made with Kling (same first and last frame).
//
//   node video.mjs watch            → out/watch/run.mp4 (raw) and ../site/img/watch/under.mp4 (what the page plays)
//   node video.mjs watch --encode   re-encode the existing raw clip only (no fal call)
//
// The prompt lives in looks.json as `video` on the look.

import { fal } from "@fal-ai/client";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const envFile = join(ROOT, "../.env.local");
if (!process.env.FAL_KEY && existsSync(envFile)) process.env.FAL_KEY = readFileSync(envFile, "utf8").match(/^FAL_KEY=(.*)$/m)?.[1].trim();

const VIDEO_MODEL = "fal-ai/kling-video/v3/pro/image-to-video";
const id = process.argv[2];
const spec = JSON.parse(readFileSync(join(ROOT, "looks.json"), "utf8")).looks[id];
if (!spec?.video) throw new Error(`looks.json has no video prompt for "${id}"`);
const still = join(ROOT, "out", id, "under.png");
const raw = join(ROOT, "out", id, "run.mp4");
const dest = join(ROOT, "..", "site", "img", id, "under.mp4");

if (!process.argv.includes("--encode")) {
  if (!process.env.FAL_KEY) throw new Error("set FAL_KEY (FAL_KEY=… node video.mjs …)");
  const url = await fal.storage.upload(new Blob([readFileSync(still)], { type: "image/png" }));
  console.log(`[${id}] video…`);
  const { data } = await fal.subscribe(VIDEO_MODEL, {
    input: {
      start_image_url: url,
      end_image_url: url,
      prompt: `${spec.video} Locked-off static camera, no zoom, no cuts, no lighting change.`,
      duration: "5",
      generate_audio: false,
      negative_prompt: "camera movement, zoom, pan, the whole watch rotating, morphing, melting, text, blur, flicker, fast-moving hands",
    },
    logs: true,
  });
  const res = await fetch(data.video.url);
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  console.log(`[${id}] → ${raw}`);
}
if (!existsSync(raw)) throw new Error(`${raw} missing`);

// 4:5 at Kling's native size (the loupe magnifies it, so no downscale) with a light unsharp mask;
// H.264 for every browser, no audio, moov up front so it starts at once
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw,
  "-vf", "scale=1296:1620:force_original_aspect_ratio=increase,crop=1296:1620,unsharp=5:5:0.7,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-an", "-movflags", "+faststart", dest]);
console.log(`[${id}] → ${dest}`);
