# Troubleshooting

Failure modes met while building the reference site, and their fixes (already applied in the template unless noted).

| Symptom | Cause | Fix |
|---|---|---|
| Crosses, circles, triangles stay **part-drawn** after the entrance | `pathLength="1"` dashes combined with `vector-effect: non-scaling-stroke` resolve inconsistently in some browsers | the template adds `.drawn` on `animationend` and drops the dash trick (`#lines .d.drawn`); keep that listener if you touch `apply()` |
| Mask edges look **blocky / speckled** (cyanotype, melt) | Chrome dithers live canvas gradients each frame; tiny alpha increments pile up into noise | stamp the pre-rendered `dotSprite` with `globalAlpha` (`blob()`), never `createRadialGradient` per frame; the shader's `soft()` 5-tap blur helps too |
| Mask reads as solid white wherever it was touched | canvas → WebGL upload un-premultiplies alpha | `gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)` (set once, harmless for opaque images) |
| A faint permanent stain never fades | 8-bit rounding: `destination-out` with a tiny alpha stops removing below a threshold | fade less often with a larger alpha (`frame % 8 === 0 → 0.05`), not every frame with 0.005 |
| A seam where the picture meets the page | page colour guessed instead of measured | the engine reads each top picture's edge colour at load (`edgeColour`) and feathers the sides; keep backgrounds plain |
| Hidden picture's background is tinted toward the paper / looks washed | the edge-colour correction (`uShift`) applied to a deliberately dark or full-bleed hidden layer | `shift: false` on that look |
| Notes and labels overlap the picture | near-square window: the picture fills almost the full width | already handled by the `max-aspect-ratio: 5/4` media query; don't remove it |
| Loupe view is **soft** | hidden layer too small for the magnification (e.g. a downscaled video) | keep video at native size with a light unsharp mask (`video.mjs`); cap detents at ×4 |
| Video never plays | autoplay refused while loading or while the tab is hidden | the loop retries `play()` every 60 frames while the look is visible; the video must be `muted` |
| Edits don't show up | `python3 -m http.server` lets the browser cache files | hard-reload, or `fetch(file, { cache: "reload" })` each changed file then reload |
| Testing in an embedded / hidden preview: animations look frozen, lens stays blurred, video paused | hidden panes throttle `requestAnimationFrame`, CSS animations and media | verify in a visible browser tab; in a hidden pane, step frames manually or finish animations (`document.getAnimations().forEach(a => a.finish())`) before judging |
| Synthetic `pointermove` on `window` throws `closest is not a function` | the event target is `window`, not an element | the template uses `e.target.closest?.(…)` |
| Text replaced into a shader string lands in the vertex shader | both shaders contain `void main(){` | when patching `FRAG`, anchor on something unique to it |
| Hidden layer misaligned (ghosting in the sheet) | the edit model moved or rescaled the subject | regenerate `--only under` with `--fix "keep the exact same position, scale and outline as the reference"`; simpler subjects and plain backgrounds align best |
