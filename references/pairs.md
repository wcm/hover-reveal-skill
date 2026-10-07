# Image pairs

The whole effect depends on two pictures that **overlay exactly** but tell different stories. The top one is generated
from a prompt; the hidden one is an **edit of the top one** (nano-banana-pro/edit with the top as reference), which is
what keeps the camera, scale and outline identical.

## Choosing pairs

A good pair is **the same thing, seen from inside**. Strong patterns:

| Pattern | Top | Hidden | Good reveal |
|---|---|---|---|
| Object → mechanism | enamel dress watch | skeleton movement (optionally running, as video) | loupe |
| Object → its essence | perfume bottle on paper | the same bottle in a dark garden of its notes | iridescent melt |
| Façade → section | building elevation drawing | cutaway with rooms and little lives | cyanotype |
| Stone → flesh | marble bust | the same person alive | dry brush |
| Person → costume | bare portrait, eyes closed | the same face in couture (veil, headpiece, ruff) | ink |
| Garment → construction | gown on a dress form | muslin toile, boning, pins, chalk lines | ink or melt |
| Device → teardown | phone back, laptop lid, camera | the boards, cells and hinges inside | loupe |
| Flower → section | a full bloom | a botanical cross-section plate | cyanotype |
| Landscape → season / time | a tree in summer | the same tree at night or in winter | melt |

Rules of thumb from the reference build:
- **Make the two images different enough.** If the hidden picture is the same palette and outline with small changes
  (a gown vs its toile), the reveal reads as a filter, not a discovery. Change material, light, or world.
- **Within a series, vary the subject type:** an object, a building, a sculpture, a scent. Two portraits in four looks
  feel repetitive.
- **Avoid brands and real people.** Ask for "unbranded", "no logo, no text"; the model may still echo a famous design
  (a phone's camera block) — say so to the user. Don't make pairs of real, identifiable people without their consent.
- **Mind the frame.** The page fits the 4:5 picture to the viewport height, so on wide screens the margins left and
  right are page, not picture. Small subjects look lost; for detailed mechanisms ask for a close-up ("the case fills
  about 85% of the frame width").

## Prompt structure (tools/looks.json)

```json
{
  "style": "shared top-layer style: 4:5, subject centred, plain seamless paper background (#EEEAE2), light, mood, no text",
  "keep":  "shared edit instruction: keep the exact same composition, camera, crop, scale, outline, light and background…",
  "looks": {
    "watch": {
      "top":   "what the top picture shows (subject, materials, pose, framing)",
      "under": "what changes in the hidden picture, phrased as 'The same <subject> in the identical position…, but…'",
      "keep":  "optional per-look override, e.g. when the background must change completely",
      "video": "optional Kling prompt for a living hidden layer"
    }
  }
}
```

- `top` + `style` go to nano-banana-pro (4:5, 2K). `under` + (`keep` or the look's own `keep`) go to
  nano-banana-pro/edit with the top image as the only reference.
- Start `under` with **"The same … in the identical position, scale and outline"**, then describe only the change.
- For a dramatic world change (bone paper → dark garden), override `keep` per look:
  *"Keep the exact same camera, crop and framing, and keep the bottle in exactly the same position, size and outline
  so the two images overlay. Everything else changes as described; the background must change completely."*
  Then set `shift: false` on that look in `site/looks.js`.
- Plain backgrounds help everything: the page colour is read from the picture's edges and the sides are feathered.

## Generate and review

```bash
cd <project>/tools
FAL_KEY=… node generate.mjs watch parfum         # top + under for these looks (all looks if none given)
FAL_KEY=… node generate.mjs watch --only under   # redo just the hidden layer from the existing top
FAL_KEY=… node generate.mjs watch --only under --fix "keep the hinge centred on the spine"
```

Each run writes `tools/out/sheet-<id>.png`: **top | under | 50% overlay**. Read the overlay: ghosting (double
outlines) means misalignment. Small drift is hidden by soft reveals (ink, melt, brush); the loupe and cyanotype
show it more. Regenerate `--only under` with a firmer `--fix` if the outline moved. Show the sheet to the user before
building on it. Earlier versions are kept as `*.bak-N.png`.

Cost: each image is one nano-banana-pro call (check fal's current pricing); a four-look site is 8 images plus retries.

## Video loops (optional, loupe looks especially)

A running mechanism under a loupe is the most convincing single upgrade.

```bash
FAL_KEY=… node video.mjs watch          # Kling v3 pro, 5 s, first frame = last frame = out/watch/under.png
node video.mjs watch --encode           # re-encode the raw clip only
```

- Put the motion prompt in `looks.json` → `video`. Describe small, physical motion of specific parts and say what
  stays still: *"the balance wheel swings back and forth quickly with its blued hairspring breathing … the gear train
  turns very slowly. The hands, the case, the bridges and the strap stay perfectly still."* The script adds a
  locked-camera clause and a negative prompt.
- Check it before using it: diff a middle frame against the still (`ffmpeg … blend=all_mode=difference`) — only the
  moving parts should light up. If the case or outline drifts, regenerate.
- The encode keeps Kling's native size (≈1296×1620) with a light unsharp mask, because the loupe magnifies it.
- Then set `video: "img/<id>/under.mp4"` on the look. Kling clips cost noticeably more than stills; tell the user
  before generating.
