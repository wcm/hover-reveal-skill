# The five reveals

Every look picks one `mode`. One fragment shader in `site/main.js` composites the top picture over the hidden one;
modes 0, 2, 3 and 4 read a half-resolution **mask canvas** that `paint()` draws into every frame, and mode 1 is
analytic (no mask). Give each look on a page a **different** mode: the variety is the point of the series.

| mode | name | feel | best for | cursor word |
|---|---|---|---|---|
| 0 | **Ink** | a liquid blob that trails the cursor and melts behind it, thin accent rim (the landonorris.com feel) | portraits, people in costume, anything where the reveal should follow closely | Reveal |
| 1 | **Loupe** | a sapphire lens in a brushed rose-gold ring: magnification detents, focus pull, depth of field, AR-coated rim, crosshair HUD, callouts that react to the part under the lens | mechanisms, small dense detail: watches, circuit boards, engravings, jewellery | Inspect |
| 2 | **Cyanotype** | a stain that develops while you linger: Prussian-blue duotone at the tide line, the real picture in the core, slow recession | drawings, architecture, botanical plates, anything archival | Expose |
| 3 | **Dry brush** | bristle strokes that streak when fast and stay a while; the edge picks up a little accent pigment | sculpture → flesh, paintings, anything "brought to life" | Paint |
| 4 | **Iridescent melt** | a hole that pools where you linger; domain-warped tendrils, a smeared rim and a thin-film rainbow (oil on water) | perfume, liquids, glass, dreamlike transformations, dramatic light → dark swaps | Diffuse |

## How each one works, and its knobs

All shader code is in the `FRAG` string in `main.js`; all mask painting is in `paint()`. Units in the shader are
device pixels (`d` = devicePixelRatio), so sizes read as `N. * d`.

### 0 · Ink
- `paint()` mode 0 clears the mask every frame and redraws the head blob plus seven tail blobs from `trail[]`
  (recent lerped positions), composited with `lighter` so they merge like metaballs.
- Blob size: `base * (0.3 + speed * 0.0035)`; trail length: the `k <= 7` loop and `trail[k * 3]` spacing.
- Shader: threshold at 0.5, edge wobble `fbm(p / 150d)` × `.32`, rim colour `uAccent` at `.55`.
- Follow lag: `k = 0.13` in the lerp table in `tick()`; lower = laggier, more liquid.

### 1 · Loupe
- No mask: the lens is a circle at the lerped cursor with radius `loupeR() = rect.h * 0.15`.
- Magnification detents `ZOOMS = [1.5, 2, 3, 4]` (wheel accumulates 60 units per click); a look's start is `zoom`.
  Keep the top detent ≤ about ×4 unless the hidden layer is high-resolution.
- Focus pull: `state.focus` drops fast when `speed ≥ 0.6` and recovers at `0.07` per frame; blur radius
  `(1 - uFocus) * 7d + r² * 2.4d` (the second term is the depth of field toward the rim).
- Glass: vignette `.14`, AR tint `.45` from r = .7, window reflection `.09`, caustic, bevel catch-light at r = .975.
- Ring: 11 px brushed gold band (`gold` vec3), engraved `SITE.engraving` on a textPath in `buildHud()`.
- **Reactive callouts:** a look's `parts` are circles in image space (`x, y, r`, plus `name`, `spec`, optional `key`).
  When the lens centre is inside one, the tag in the readout names it; if it has a `key`, the `leader(…, key)` callout
  with that key turns accent and everything else in the line work dims (`#lines.inspect`).
- **Living hidden layer:** set `video` on the look (see pairs.md → video loops). The engine uploads new video frames
  to the hidden texture while the loupe is open and keeps the still until the first frame arrives.

### 2 · Cyanotype
- `paint()` stamps a soft dot every 3rd frame (`alpha 0.09 + speed`), and fades the whole mask every 8th frame (`0.05`),
  so lingering builds exposure and moving leaves a receding trail.
- Shader bands: `smoothstep(.22,.27)` → blue duotone, `smoothstep(.66,.8)` → the real hidden picture, tide line at
  `.235`. Duotone: Prussian `vec3(.05,.15,.34)` → paper `vec3(.92,.91,.87)` by luminance.
- Pairs well with `line: "accent"` so the drawing is in the same blue.

### 3 · Dry brush
- 64 bristles per stroke (`newBrush()`), each with its own offset, width, alpha and "wetness" phase; a bristle skips
  where `wet < dry`, and `dry` rises with speed, which gives the streaks.
- Width `base * 0.11`, fade every 10th frame at `0.03` (strokes linger a few seconds).
- Shader: threshold `smoothstep(.2,.5)` with paper grain; accent pigment at the edge `* .14`.

### 4 · Iridescent melt
- `paint()` stamps a large soft dot every frame (`base * 0.2`, alpha `0.07`) and fades every 3rd frame (`0.035`).
- Shader reads the mask through a slow domain warp `w` (fbm at 230d, × 260d) so the hole grows tendrils;
  `band = exp(-e² / .05)` is the rim width; the rim smears both pictures by `w * 160d` and screens a cosine rainbow
  `film` over them; red and blue split at 1.25× / 0.75× of the smear.
- Use `shift: false` on the look when the hidden picture is dark or full-bleed (see pairs.md).

## Shared behaviour (all modes)
- **Ghost cursor:** after 2.6 s idle a Lissajous path wanders over the subject; the **Auto cursor** switch (top right,
  or the A key) turns it off and is remembered per browser under `SITE.key`.
- **Look switching:** bottom bar, ← →, number keys. The picture fades to the paper colour (`uFade`), the title
  re-animates letter by letter, the line work redraws.
- **Paper colour:** read from each top picture's left/right edge strips at load, so the page always matches it, and
  the picture's sides are feathered into it. Unless `shift: false`, the hidden layer is nudged by the difference
  between the two pictures' edge colours so their backgrounds match.

## Adding a sixth reveal
Add an `else if (uMode == 5)` block before the final `else` in `FRAG`, a `mode === 5` branch in `paint()` if it needs a
mask, and a follow-lag value at index 5 of the `k` table in `tick()`. Keep the mask idea: paint white into `mx`
(stamp `blob()`, never live gradients, see troubleshooting.md), fade with `fadeMask()`, threshold in the shader.
