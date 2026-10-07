// The looks: copy, colours, reveal mode, line work and (for the loupe) the parts it recognises.
// Line work is in image space: an 800×1000 viewBox laid exactly over the 4:5 picture.
// Measure positions with `node tools/grid.mjs <id>` and read them off tools/out/<id>/grid-*.png.
// references/linework.md documents every builder; assets/examples/doublure/looks.js is a complete worked example.
import { svg, line, path, circle, text, arrow, slash, cross, leader } from "./kit.js";

// ——— the site ———
export const SITE = {
  key: "{{ID}}", // localStorage namespace for per-viewer settings
  engraving: "{{BRAND_UPPER}} · APLANATIC TRIPLET · 10× · SAPPHIRE", // runs round the loupe ring (mode 1)
};

// ——— the looks ———
// mode: 0 ink trail · 1 loupe · 2 cyanotype · 3 dry brush · 4 iridescent melt (references/reveals.md)
export const LOOKS = [
  // EDIT: one object per look, in page order. Copy this one and fill every field.
  // {
  //   id: "watch",                 // folder under site/img/ and the URL hash
  //   no: "I",                     // shown in the switcher
  //   name: "Calibre",             // the big italic title
  //   sub: "The Watch",            // small caps line under it
  //   lede: "Twenty-one jewels, kept quiet beneath an enamel dial.",
  //   spec: [["Outer", "…"], ["Inner", "…"], ["Reveal", "Loupe. Scroll to change magnification"]],
  //   cursor: "Inspect",           // the word next to the cursor
  //   mode: 1,
  //   accent: "#9C5B3F",
  //   line: "accent",              // optional: line work in the accent instead of ink
  //   shift: false,                // optional: keep the hidden layer's own colours (dark or full-bleed under layers)
  //   zoom: 2,                     // loupe only: starting detent (1.5 / 2 / 3 / 4)
  //   video: "img/watch/under.mp4",// optional: a looping hidden layer (tools/video.mjs)
  //   parts: [ { key: "barrel", x: 465, y: 375, r: 95, name: "Barillet", spec: "MAINSPRING BARREL" } ],
  //   lines: () => svg(() => leader([[465, 375], [600, 150], [628, 150]], ["BARILLET", "Mainspring barrel"], 1, "barrel")),
  // },
];
