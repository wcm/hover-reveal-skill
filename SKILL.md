---
name: hover-reveal
description: Build a high-fashion hover-reveal landing page — the landonorris.com effect, taken further — where each picture hides a second, perfectly aligned picture of what is inside it (a watch's running movement, a building's rooms, the person inside a marble bust, the garden inside a perfume), revealed only around the cursor through a different mask per look: liquid ink trail, a sapphire watchmaker's loupe with reactive callouts, a cyanotype stain that develops while you linger, dry-brush strokes, or an iridescent oil-slick melt. Generates the aligned image pairs with fal (nano-banana-pro, edit-from-reference), optionally a looping Kling video for the hidden layer, then designs the page — editorial serif + mono type, one accent per look, technical line work drawn over each picture, look switcher, ghost cursor. Use this whenever someone wants a hover or cursor reveal, a mask / paint-mask / x-ray / "see inside" effect, a two-layer image reveal, a Lando-Norris-style site, a lookbook or product page where hovering shows the interior, or more looks in the same series — even if they only name an object.
---

# Hover reveal

One site, several **looks**. Each look is a pair of pictures that overlay exactly — the **top** (the surface) and the
**hidden** layer (what's inside) — plus a reveal mask, an accent colour, a few lines of copy and technical line work.
The cursor reveals the hidden layer around it; each look reveals it differently.

`assets/examples/doublure/` is the reference build (four looks: Parfum → melt, Calibre → loupe over a running
movement, Maison → cyanotype, Galatea → dry brush): its `looks.js` shows complete look entries with line work and
loupe parts, its `looks.json` the prompts that produced the pairs. Read it before writing looks; design each new look
for its own subject rather than copying one.

## What you need

| Need | Why | How |
|---|---|---|
| Subjects | what each look shows on the surface and inside | ask, or propose pairs (references/pairs.md) |
| `FAL_KEY` | image pairs (and optional video) | env var on each command (`FAL_KEY=… node …`); never echo it or write it to a tracked file. Only if the user asks to store it: the project's gitignored `.env.local` |
| Node 18+, Python 3 (ffmpeg for video) | tools, scaffolder | `node -v`, `python3 -V`, `ffmpeg -version`; macOS `brew install node python ffmpeg` |

Cost: each image is one nano-banana-pro call, so a four-look site is about 8 images plus retries; a Kling loop costs
noticeably more. Check fal's current pricing and say so before the first generation and before any video.

## Step 0 — Agree on intent (one short message, then decide)

- **How many looks** (default 4) and **which pairs.** If the user named subjects, shape each into a pair; otherwise
  propose pairs from `references/pairs.md` that vary in type (object, building, sculpture, scent…). Make the hidden
  picture genuinely different from the top (material, light or world), not a near-copy.
- **Reveal per look.** Assign a different mode to each look (`references/reveals.md`) matched to its subject.
- **Brand and tone.** A one-word brand, tagline, collection/series lines; otherwise invent them (`references/design.md`).
- Real people only with consent; no brand logos (ask for unbranded designs and tell the user if a famous design shows through).

Say what you chose in a few lines and continue unless the user wants changes.

## Step 1 — Scaffold

```bash
python3 <skill>/scripts/new_project.py <project-dir> --brand "Doublure" --tagline "What is sewn inside" \
  --collection "Collection Nº 01" --series "Interior Lives" --vert "Move slowly. Every surface has a lining."
cd <project-dir>/tools && npm install
```

This creates `site/` (engine, kit, styles, empty `looks.js`) and `tools/` (generate, video, grid, `looks.json`).

## Step 2 — Prompts → pairs → review

Fill `tools/looks.json` (`style` and `keep` are shared; one entry per look with `top`, `under`, optional `keep`
override and `video`). `references/pairs.md` has the structure and wording that align well.

```bash
FAL_KEY=… node generate.mjs                       # every look: top, then under as an edit of top
FAL_KEY=… node generate.mjs bust --only under     # redo one hidden layer
```

Look at every `tools/out/sheet-<id>.png` (top | under | 50% overlay) yourself, then show them to the user. Regenerate
misaligned or too-similar hidden layers before building on them.

## Step 3 — Optional: a living hidden layer

For loupe looks especially, a running mechanism is the strongest upgrade. Add a `video` prompt, tell the user the cost,
then `FAL_KEY=… node video.mjs <id>` (run it in the background; it takes minutes). Check that only the intended parts
move (pairs.md → video loops) before setting `video` on the look.

## Step 4 — Measure, then write the looks

```bash
node grid.mjs <id>          # tools/out/<id>/grid-top.png and grid-under.png in line-work coordinates
```

Write one entry per look in `site/looks.js` (the commented template lists every field): copy, `mode`, `accent`,
optional `line: "accent"`, `shift: false`, `zoom`, `video`, `parts`, and `lines: () => svg(() => …)` built from the
kit (`references/linework.md`). Place labels in empty paper, measured from the grid sheets. Also set `SITE.engraving`
if a look uses the loupe.

## Step 5 — Design pass

Fonts and tokens in `site/index.html` / `site/style.css` (`references/design.md`): keep the serif + mono contrast,
one accent per look drawn from the hidden picture's world, copy with a turn in each lede. The layout, switcher,
ghost cursor and Auto cursor switch are already built.

## Step 6 — Preview and verify

```bash
cd <project-dir> && python3 -m http.server 5180 -d site     # http://localhost:5180
```

Verify in a visible browser, not by reading code: console clean; every look loads; each reveal behaves as described
(move, linger, leave); loupe looks: detents, focus pull, callouts lighting up over their parts, video running;
line work fully drawn and labels in empty space; switching with the bar, arrows and number keys; Auto cursor on and
off. Check a wide desktop, a near-square window and a 375 px phone, with no horizontal scroll. Hard-reload after
edits. `references/troubleshooting.md` lists what has gone wrong before (including why embedded/hidden previews look
frozen).

## Step 7 — Hand over

Tell the user what you built (the pairs, each look's reveal, accent and copy), anything that didn't come out right
(misalignment, a design that echoes a real brand), and the knobs they're likely to tweak with where they live: blob
sizes and fade rates in `paint()`, thresholds and rim colours in `FRAG`, loupe radius and detents, line-work positions
in `looks.js`, prompts in `looks.json`. Masters and raw clips stay in `tools/out/` (gitignored).

## Adding a look later

Add its prompts to `looks.json`, run Steps 2–4 for that id, and pick a reveal the existing looks don't use (or the one
used least).
