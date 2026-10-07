# hover-reveal — a Claude skill

![Four looks from the reference build: each picture split down the middle, surface on the left, what the cursor reveals on the right](assets/preview.jpg)

Build a **hover-reveal landing page**: every picture hides a second, perfectly aligned picture of what's inside it,
and the cursor reveals it. It's the landonorris.com effect, with a different reveal for every look:

- **Iridescent melt:** the surface melts like oil on water (a perfume bottle → the garden of its notes).
- **Loupe:** a sapphire watchmaker's lens with magnification steps, focus pull, and callouts that light up for the
  part under the glass (a watch dial → its movement, running as a video loop).
- **Cyanotype:** a blue stain that develops while you linger (a façade → its rooms).
- **Dry brush:** paint strokes that bring the hidden picture through (a marble bust → a living person).
- **Ink:** a liquid blob that trails the cursor (a portrait → the same face in couture).

Claude generates the aligned image pairs with fal, designs the page (editorial serif and mono type, one accent per
look, technical line work drawn over each picture), and builds it as a static site with a WebGL shader. No framework.

The reference build, *Doublure*, is in `assets/examples/doublure/`.

---

## Quick start (for humans)

Paste this into **Claude Code** (or the Claude desktop app's Code tab):

> Install and use the skill from https://github.com/wcm/hover-reveal-skill — make me a hover-reveal page with four looks.

…or name your own subjects:

> Install and use the skill from https://github.com/wcm/hover-reveal-skill — make a hover-reveal lookbook: a vintage camera that reveals its shutter, a violin that reveals its insides, and a greenhouse that reveals its plants.

Claude installs the skill, checks your setup, asks for your fal API key, proposes the image pairs and reveals, shows
you the generated pairs before building, then designs the page and checks it in a browser.

**What you need**

| | |
|---|---|
| A **fal.ai API key** | create one at https://fal.ai/dashboard/keys. A four-look site is about 8 images plus retries; an optional video loop costs more. Check fal's current pricing |
| Node.js 18+, Python 3 | on macOS: `brew install node python` |
| ffmpeg (only for video loops) | `brew install ffmpeg` |

---

## For Claude: what to do when a user gives you this repo URL

You are reading the README of a Claude skill. Install it, then use it for the user's request.

### 1. Install the skill

**Claude Code / desktop Code tab (has a terminal):**

```bash
git clone https://github.com/wcm/hover-reveal-skill ~/.claude/skills/hover-reveal
```

If that folder already exists, update it instead: `git -C ~/.claude/skills/hover-reveal pull`.
A newly installed skill is picked up in the next session. For this session, read
`~/.claude/skills/hover-reveal/SKILL.md` and follow it directly; there's no need to restart.

**Claude.ai / Claude app chat (no terminal):** tell the user to download this repo as a ZIP (green **Code** button →
**Download ZIP**) and upload it under **Settings → Capabilities → Skills** (code execution must be on). The pipeline
needs Node, network access to fal.ai and a browser preview, which works best in Claude Code; recommend it if they
have it.

### 2. Check prerequisites

Run `node -v` (needs 18+) and `python3 -V` (and `ffmpeg -version` if they want a video loop). If something is
missing, give the user the one-line install (macOS: `brew install node python ffmpeg`; Windows:
`winget install OpenJS.NodeJS Python.Python.3.12 Gyan.FFmpeg`) and wait.

### 3. Collect inputs

Ask in one short message:
- **The subjects**, or the theme, if they have one in mind (otherwise you'll propose pairs).
- **A fal API key.** Use it only as an environment variable on each command (`FAL_KEY=… node tools/generate.mjs …`).
  Never write it to a tracked file and never repeat it back.
- **Optional:** brand name, mood, colours, how many looks.

### 4. Run the skill

Follow `SKILL.md` from Step 0. Show the image-pair sheets before building, and verify the finished page in a visible
browser at desktop, near-square and phone sizes.

---

## What's inside

```
SKILL.md                          the workflow Claude follows (start here)
references/
  reveals.md                      the five reveal modes: how each works and its knobs
  pairs.md                        choosing image pairs, prompts that align, review, video loops
  linework.md                     the SVG kit, measuring coordinates, what to draw per world, loupe parts
  design.md                       layout, type pairings, colour, copy per look
  troubleshooting.md              failure modes met so far and their fixes
scripts/new_project.py            scaffolds a project
assets/template/site/             index.html, style.css, main.js (WebGL engine), kit.js (line work), looks.js (to fill)
assets/template/tools/            generate.mjs (fal pairs), video.mjs (Kling loops), grid.mjs (measuring), looks.json
assets/examples/doublure/         the reference build's looks.js, looks.json and index.html (no images)
assets/preview.jpg                the four reference pairs, split surface | inside
```

### How a generated project is laid out

```
my-site/
  site/                           serve this folder (python3 -m http.server -d site)
    index.html, style.css, main.js, kit.js
    looks.js                      SITE config + one entry per look
    img/<look>/top.webp, under.webp (+ under.mp4 for a living hidden layer)
  tools/
    looks.json                    prompts
    generate.mjs, video.mjs, grid.mjs
    out/                          2K masters, review sheets, grids, raw clips (gitignored)
```

## License

MIT
