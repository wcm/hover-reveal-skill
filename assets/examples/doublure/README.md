# Doublure — the reference build

*Doublure* is the couture word for a garment's lining. Four looks, four reveals:

| Look | Top → hidden | Reveal | Line work |
|---|---|---|---|
| I Parfum | crystal flacon on bone paper → the same bottle in a dark garden of its notes (`keep` override, `shift: false`) | 4 iridescent melt | note callouts (tête / cœur / fond), bottle height, note pyramid |
| II Calibre | close-up enamel dress watch → skeleton movement, running as a Kling loop (`video`) | 1 loupe, with six `parts` | four keyed corner callouts, construction circles, centre lines, Ø 40 |
| III Maison | Parisian façade elevation → cutaway section with rooms | 2 cyanotype (`line: "accent"`) | dimensions, levels, section A–A, north arrow, scale bar |
| IV Galatea | Carrara marble bust → the same woman alive | 3 dry brush | ten pointing crosses with triangulation, plumb line, caliper arc |

- `looks.js` — the complete `SITE` and `LOOKS` (copy, accents, modes, line work, loupe parts).
- `looks.json` — the prompts that generated the pairs and the video loop.
- `index.html` — the page with Doublure's brand lines filled in.

The images are not included. To rebuild it: scaffold a project, copy these three files over the template's, then run
`generate.mjs` (and `video.mjs watch`) with your own fal key. Generated pairs differ run to run, so re-measure the
line-work positions with `grid.mjs`.
