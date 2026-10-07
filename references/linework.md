# Line work

Each look draws technical marks over its picture that belong to its world: pattern-cutting for a garment, callouts
for a mechanism, levels and section marks for a building, pointing crosses for a sculpture, a note pyramid for a scent.
The line work is what makes the page feel designed rather than a photo filter.

## Coordinates

`#lines` is an SVG with `viewBox="0 0 800 1000"` laid exactly over the 4:5 picture, so every coordinate is in picture
space, whatever the screen size. Measure, don't guess:

```bash
cd <project>/tools && node grid.mjs watch          # out/watch/grid-top.png and grid-under.png, 100-unit grid
node grid.mjs watch under 50                       # finer grid on one layer
```

Open the sheet, read off centres and radii of the parts you want to mark, and note where the **empty margins** are:
labels must sit in empty paper, not on the subject. On wide screens the whole picture shows; on near-square windows
and phones the labels are hidden automatically (CSS), so the strokes alone must still look good.

## Builders (site/kit.js)

Every builder returns an SVG string and takes the next draw-in slot, so marks appear one after another.
Wrap a look's drawing in `svg(() => …)`, which resets the order.

| Builder | Draws |
|---|---|
| `line(x1, y1, x2, y2, cls)` | a stroke |
| `path(d, cls)` | any SVG path (triangles, curves, arcs) |
| `circle(cx, cy, r, cls)` | a circle |
| `text(x, y, s, { a, r, cls })` | mono label; `a` = text-anchor, `r` = rotation in degrees |
| `dot(x, y)` | a filled point on a part |
| `arrow(x, y, deg)` | an open arrowhead at (x, y) pointing along `deg` |
| `slash(x, y)` | an architect's 45° dimension tick |
| `cross(x, y, label, side)` | a sculptor's pointing cross with a small circle and label (`side` ±1) |
| `leader(points, [title, sub], side, key?)` | dot on the part, elbowed line to a two-line label in the margin; a `key` makes it react to the loupe |

Classes: `dash` (5/5 dashes), `dashdot` (centre lines), `faint` (lighter), `heavy` (thicker), and for text `small`
and `dim`. Dashed marks fade in; solid marks draw themselves in and are then set to fully drawn.

Recipes:

```js
// dimension line with arrowheads and extension lines
line(250, 770, 550, 770) + arrow(250, 770, 180) + arrow(550, 770, 0) +
line(250, 640, 250, 790, "faint") + line(550, 640, 550, 790, "faint") + text(400, 762, "Ø 40,0 mm", { a: "middle" })

// level marker (architecture)
line(598, y, 650, y, "faint") + path(`M654 ${y} l 7 -9 h -14 z`) + text(668, y - 3, "+4,20", { cls: "small" })

// title block in the top-left margin
text(44, 64, "CAL. DBL-01") + text(44, 82, "Manual winding · 3 Hz", { cls: "small dim" }) + line(44, 96, 210, 96)

// a callout that lights up under the loupe (needs a matching parts entry with key "barrel")
leader([[465, 375], [600, 150], [628, 150]], ["BARILLET", "Mainspring barrel · 42 h"], 1, "barrel")
```

## What to draw, by world

| World | Marks |
|---|---|
| Garment / costume | centre-front dash-dot line, bust/waist/hip lines with measurements, darts, notched seam line, grain arrow, pattern-piece label ("PIÈCE Nº 1 — … · Couper 2 fois au pli") |
| Mechanism | leaders to 4–6 named parts in the corners, construction circles, centre lines, a diameter, a calibre title block |
| Building | height and width dimensions with slash ticks, level markers per floor, section-cut circles A–A, north arrow, scale bar |
| Sculpture | 8–10 pointing crosses joined by faint triangulation, a plumb line, a caliper arc with a measurement, plinth line |
| Scent / liquid | top/heart/base note leaders, the bottle height, a small note pyramid, formula number |
| Botanical | leaders to organs with Latin names, a scale bar, plate number |

Keep it **delicate**: few heavy marks, mostly hairlines and small mono labels, one title block per look, and words
from the subject's own craft (French couture and horology terms read beautifully). Set `line: "accent"` on a look
when its line work should take the accent colour (cyanotype blue, for instance).

## Loupe parts

For a mode-1 look, list what the lens should recognise:

```js
parts: [
  { key: "barrel", x: 465, y: 375, r: 95, name: "Barillet", spec: "MAINSPRING BARREL · 42 H RESERVE" },
  { x: 560, y: 570, r: 70, name: "Ponts", spec: "CÔTES DE GENÈVE · BEVELLED BY HAND" }, // tag only, no callout
],
```

`x, y, r` are in picture space (measure them on the hidden layer's grid). The nearest part whose circle contains the
lens centre wins. Give 4–6 parts; key the ones that have leaders.
