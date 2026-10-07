# Design: type, colour, layout, copy

The target is **high-class, delicate, fashionable**: an editorial lookbook, not a tech demo. Calm everywhere except
under the cursor.

## Layout (already built into the template)

- The picture fills the viewport height at 4:5, centred, sides feathered into the paper colour.
- **Top:** brand (spaced caps, top left), tagline (centre), collection + series and the Auto cursor switch (top right).
- **Left, bottom:** "Look Nº 0x / <last>" in mono, the look's **name** huge in italic display serif (letters animate
  in), and a small-caps **sub** line with an accent rule.
- **Right, middle:** the **lede** (italic serif, one sentence) and a three-row spec list (`Outer`, `Inner`, `Reveal`).
- **Bottom:** the look switcher (numeral, name, sub) with an accent underline on the current look; a hint line.
- **Vertical line** on the left edge on wide screens.
- Near-square windows hide the notes and the drawing labels; phones (≤ 760 px) also simplify the header and switcher.

## Type

Default pairing (already linked in `index.html`): **Bodoni Moda** (italic, optical size 96, for titles and the lede)
+ **Geist Mono** (small, tracked caps for labels, readouts and specs). The contrast of couture serif and engineering
mono carries the whole aesthetic. Alternatives that keep the feel, all on Google Fonts:

| Display | Mono | Mood |
|---|---|---|
| Bodoni Moda | Geist Mono | couture, the reference build |
| Instrument Serif | JetBrains Mono | softer, contemporary editorial |
| Playfair Display (italic) | IBM Plex Mono | classic magazine |
| Cormorant Garamond | DM Mono | literary, very light |
| Fraunces (soft, high opsz) | Space Mono | warmer, more playful |

Change the `<link>` in `index.html` and `--serif` / `--mono` in `style.css`.

## Colour

- **Paper:** taken from each top picture automatically (prompt for a warm bone background, `#EEEAE2`).
- **Ink:** `--ink: #1b1815` with `--muted` and `--hair` derived from it.
- **One accent per look** (`accent` in looks.js): it colours the title rule, the current switcher line, the cursor,
  the spec's last row, the reveal rim and the loupe's active callouts. Choose it from the hidden picture's world:
  oxblood for couture, rose gold for a watch case, Prussian blue for cyanotype, rose madder for flesh, iris violet for a
  scent, PCB green for electronics. Keep it deep and slightly greyed, never neon.

## Copy, per look

| Field | What it is | Example |
|---|---|---|
| `name` | one word, often French or Latin, the look's title | Calibre, Maison, Galatea, Parfum, Voilette |
| `sub` | "The <thing>" | The Watch |
| `lede` | one sentence with a turn: what the surface hides | "Every façade is a polite fiction about its rooms." |
| `spec` | Outer / Inner / Reveal; the Reveal row names the mode and how to use it | "Cyanotype. Linger to develop" |
| `cursor` | one verb next to the cursor | Inspect, Expose, Paint, Diffuse, Reveal |

Site-level copy is set by `new_project.py` flags: brand (one word: Doublure, Lining, Envers, Dessous), tagline
("What is sewn inside"), collection ("Collection Nº 01"), series ("Interior Lives"), vertical line ("Move slowly.
Every surface has a lining."). Write fresh lines for each project; these are examples.
