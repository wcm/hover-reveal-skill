// The four looks: copy, colours, reveal mode and the line work drawn over each image.
// Line work is in image space: a 800×1000 viewBox laid exactly over the 4:5 picture.

import { svg, line, path, circle, text, arrow, slash, cross, leader } from "./kit.js";

// ——— the site ———
export const SITE = {
  key: "doublure", // localStorage namespace
  engraving: "DOUBLURE · APLANATIC TRIPLET · 10× · Nº 0417 · SAPPHIRE", // runs round the loupe ring
};

// ——— the looks ———
export const LOOKS = [
  {
    id: "parfum",
    no: "I",
    name: "Parfum",
    sub: "The Scent",
    lede: "A bottle is only the door. The garden is inside.",
    spec: [["Outer", "Faceted crystal, lava-stone stopper"], ["Inner", "Iris, bergamot, vetiver, amber"], ["Reveal", "Iridescence. A liquid film that melts the glass"]],
    cursor: "Diffuse",
    mode: 4,
    shift: false, // the garden is meant to be dark: don't colour-match it to the paper
    accent: "#5B3A8C",
    lines: () => svg(() =>
      leader([[340, 300], [214, 236], [176, 236]], ["BOUCHON", "Lava stone, hand-polished"], -1) +
      leader([[300, 560], [214, 600], [176, 600]], ["FLACON", "Cut crystal · 50 ml"], -1) +
      leader([[490, 470], [596, 340], [630, 340]], ["TÊTE", "Calabrian bergamot"], 1) +
      leader([[500, 540], [596, 480], [630, 480]], ["CŒUR", "Iris pallida, aged 3 yrs"], 1) +
      leader([[490, 630], [596, 620], [630, 620]], ["FOND", "Vetiver, amber resin"], 1) +
      line(248, 260, 248, 660) + arrow(248, 260, -90) + arrow(248, 660, 90) +
      line(238, 260, 300, 260, "faint") + line(238, 660, 290, 660, "faint") + text(240, 460, "112 mm", { r: -90, a: "middle" }) +
      path("M690 760 L 724 820 L 656 820 Z") + line(668, 800, 712, 800) + line(679, 780, 701, 780) +
      text(690, 840, "PYRAMIDE", { a: "middle", cls: "small dim" }) +
      text(44, 64, "PARFUM Nº 1 — IRIS NOIR") + text(44, 82, "Extrait · 22 % concentration", { cls: "small dim" }) + line(44, 96, 230, 96) +
      text(400, 940, "ORGUE À PARFUM · FORMULE 07", { a: "middle", cls: "small dim" })
    ),
  },
  {
    id: "watch",
    no: "II",
    name: "Calibre",
    sub: "The Watch",
    lede: "Twenty-one jewels, kept quiet beneath an enamel dial.",
    spec: [["Outer", "Grand-feu enamel, 18k rose gold"], ["Inner", "Skeletonised hand-wound movement"], ["Reveal", "Loupe. Scroll to change magnification"]],
    cursor: "Inspect",
    mode: 1,
    zoom: 2,
    video: "img/watch/under.mp4",
    // what the loupe recognises (image space); keyed ones also light up their callout
    parts: [
      { key: "barrel", x: 465, y: 375, r: 95, name: "Barillet", spec: "MAINSPRING BARREL · 42 H RESERVE" },
      { key: "jewels", x: 290, y: 530, r: 70, name: "Rubis", spec: "21 JEWELS IN GOLD CHATONS" },
      { key: "balance", x: 405, y: 640, r: 72, name: "Balancier", spec: "21 600 A/H · BLUED HAIRSPRING" },
      { key: "crown", x: 705, y: 495, r: 40, name: "Couronne", spec: "HAND-WOUND · FLUTED" },
      { x: 400, y: 495, r: 40, name: "Roue de centre", spec: "DRIVES THE HANDS" },
      { x: 560, y: 570, r: 70, name: "Ponts", spec: "CÔTES DE GENÈVE · BEVELLED BY HAND" },
    ],
    accent: "#9C5B3F",
    lines: () => svg(() =>
      circle(400, 495, 312, "dash faint") + circle(400, 495, 336, "dash faint") +
      line(30, 495, 770, 495, "dashdot faint") + line(400, 140, 400, 850, "dashdot faint") +
      line(110, 480, 110, 510) + line(690, 480, 690, 510) + text(44, 486, "Ø 40,0", { cls: "small" }) +
      leader([[465, 375], [600, 150], [628, 150]], ["BARILLET", "Mainspring barrel · 42 h"], 1, "barrel") +
      leader([[310, 465], [210, 170], [180, 170]], ["RUBIS × 21", "Set in gold chatons"], -1, "jewels") +
      leader([[405, 640], [220, 840], [196, 840]], ["BALANCIER", "21 600 A/h · blued spring"], -1, "balance") +
      leader([[705, 495], [640, 860], [662, 860]], ["COURONNE", "Hand-wound, fluted"], 1, "crown") +
      text(44, 64, "CAL. DBL-01") + text(44, 82, "Manual winding · 3 Hz · 166 parts", { cls: "small dim" }) + line(44, 96, 210, 96) +
      text(756, 960, "PLATE 2 / SKELETON", { a: "end", cls: "small dim" })
    ),
  },
  {
    id: "house",
    no: "III",
    name: "Maison",
    sub: "The House",
    lede: "Every façade is a polite fiction about its rooms.",
    spec: [["Outer", "Limestone elevation, 1:100"], ["Inner", "Section A–A, five storeys of lives"], ["Reveal", "Cyanotype. Linger to develop"]],
    cursor: "Expose",
    mode: 2,
    accent: "#1E3F73",
    line: "accent", // draw the line work in the accent (cyanotype blue) instead of ink
    lines: () => svg(() => {
      const levels = [[903, "±0,00"], [724, "+4,20"], [576, "+7,80"], [429, "+11,40"], [291, "+15,00"], [93, "+18,40"]];
      return (
        line(150, 93, 150, 903) + slash(150, 93) + slash(150, 903) + line(140, 93, 205, 93, "faint") +
        text(140, 498, "18,40", { r: -90, a: "middle" }) +
        line(213, 950, 587, 950) + slash(213, 950) + slash(587, 950) + line(213, 915, 213, 960, "faint") + line(587, 915, 587, 960, "faint") +
        text(400, 942, "9,60", { a: "middle" }) +
        levels.map(([y, s]) => line(598, y, 650, y, "faint") + path(`M654 ${y} l 7 -9 h -14 z`) + text(668, y - 3, s, { cls: "small" })).join("") +
        line(40, 520, 760, 520, "dashdot faint") +
        circle(62, 520, 16) + text(62, 525, "A", { a: "middle" }) + path("M62 504 L 62 490 L 80 497 z") +
        circle(738, 520, 16) + text(738, 525, "A", { a: "middle" }) + path("M738 504 L 738 490 L 720 497 z") +
        text(44, 60, "MAISON — 14 RUE DES ARCHIVES") + text(44, 78, "Élévation & coupe A–A · 1:100", { cls: "small dim" }) + line(44, 92, 250, 92) +
        circle(712, 840, 18) + path("M712 818 L 704 848 L 712 842 L 720 848 Z") + text(712, 812, "N", { a: "middle", cls: "small" }) +
        line(612, 980, 752, 980) + [612, 640, 668, 752].map((x) => line(x, 974, x, 986)).join("") +
        text(612, 970, "0", { a: "middle", cls: "small" }) + text(668, 970, "2", { a: "middle", cls: "small" }) + text(752, 970, "5 m", { a: "middle", cls: "small" })
      );
    }),
  },
  {
    id: "bust",
    no: "IV",
    name: "Galatea",
    sub: "The Bust",
    lede: "Stone, until someone looked at her long enough.",
    spec: [["Outer", "Statuario marble, Carrara"], ["Inner", "Flesh, flush, chestnut hair"], ["Reveal", "Dry brush. Paint her warm"]],
    cursor: "Paint",
    mode: 3,
    accent: "#A3364A",
    lines: () => svg(() => {
      // a sculptor's pointing marks, triangulated, with the machine's plumb line
      const P = [[352, 214, "P·01"], [318, 352, "P·02"], [306, 420, "P·03"], [348, 468, "P·04"], [412, 382, "P·05"],
        [520, 280, "P·06"], [206, 628, "P·07"], [442, 574, "P·08"], [604, 716, "P·09"], [388, 806, "P·10"]];
      const tri = [[0, 1], [1, 2], [2, 3], [0, 4], [3, 4], [0, 5], [4, 5], [3, 7], [6, 7], [7, 8], [6, 9], [8, 9], [7, 9]];
      return (
        tri.map(([a, b]) => line(P[a][0], P[a][1], P[b][0], P[b][1], "faint dash")).join("") +
        P.map(([x, y, s], i) => cross(x, y, s, [1, 2, 6].includes(i) ? -1 : 1)).join("") +
        line(680, 40, 680, 560) + path("M672 560 L 688 560 L 680 584 Z") + text(692, 120, "FIL À PLOMB", { r: 90, cls: "small" }) +
        path("M250 214 A 140 140 0 0 0 250 468", "dash") + line(240, 214, 262, 214) + line(240, 468, 262, 468) +
        text(234, 344, "23,8", { a: "end", cls: "small" }) +
        line(120, 905, 680, 905) + text(400, 932, "STATUARIO · CARRARA — 1:1", { a: "middle", cls: "small" }) +
        text(44, 64, "GALATEA — MISE AUX POINTS") + text(44, 82, "Pointing machine transfer · 10 points", { cls: "small dim" }) + line(44, 96, 250, 96)
      );
    }),
  },
];
