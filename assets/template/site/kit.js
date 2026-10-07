// The line-work vocabulary: tiny SVG builders for drawings laid over a 4:5 picture (800×1000 viewBox).
// Every mark gets a draw-in order (--i); solid strokes draw themselves in, dashed ones fade in.
let n = 0; // draw-in order, so marks appear one after another
const d = () => `style="--i:${n++}"`;
// pathLength=1 lets solid strokes draw in; dashed ones keep real lengths and fade in instead
const pl = (cls) => (/dash/.test(cls) ? "" : 'pathLength="1"');
export const line = (x1, y1, x2, y2, cls = "") => `<line class="d ${cls}" ${d()} ${pl(cls)} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
export const path = (p, cls = "") => `<path class="d ${cls}" ${d()} ${pl(cls)} d="${p}"/>`;
export const circle = (cx, cy, r, cls = "") => `<circle class="d ${cls}" ${d()} ${pl(cls)} cx="${cx}" cy="${cy}" r="${r}"/>`;
export const text = (x, y, s, { a = "start", r = 0, cls = "" } = {}) =>
  `<text class="t ${cls}" ${d()} x="${x}" y="${y}" text-anchor="${a}"${r ? ` transform="rotate(${r} ${x} ${y})"` : ""}>${s}</text>`;
export const dot = (x, y) => `<circle class="dot" ${d()} cx="${x}" cy="${y}" r="2.6"/>`;
export const arrow = (x, y, ang) => { // open arrowhead pointing along ang (deg)
  const r = (a) => [x + 9 * Math.cos(((ang + a) * Math.PI) / 180), y + 9 * Math.sin(((ang + a) * Math.PI) / 180)];
  const [a1, a2] = [r(155), r(-155)];
  return path(`M${a1[0].toFixed(1)} ${a1[1].toFixed(1)} L${x} ${y} L${a2[0].toFixed(1)} ${a2[1].toFixed(1)}`);
};
export const slash = (x, y) => line(x - 5, y + 5, x + 5, y - 5, "heavy"); // architect's dimension tick
export const cross = (x, y, label, side = 1) =>
  line(x - 9, y, x + 9, y) + line(x, y - 9, x, y + 9) + circle(x, y, 4.5) + text(x + 12 * side, y - 8, label, { a: side > 0 ? "start" : "end", cls: "small" });
export const leader = (pts, label, side, key) => { // dot on the part, elbowed line out to a label in the margin
  const [s, ...rest] = pts;
  const end = rest[rest.length - 1];
  const body = dot(...s) + path(`M${pts.map((p) => p.join(" ")).join(" L")}`) +
    text(end[0] + (side > 0 ? 8 : -8), end[1] - 6, label[0], { a: side > 0 ? "start" : "end" }) +
    text(end[0] + (side > 0 ? 8 : -8), end[1] + 10, label[1], { a: side > 0 ? "start" : "end", cls: "small dim" });
  return key ? `<g class="part" data-part="${key}">${body}</g>` : body; // keyed callouts react to the loupe
};
export const svg = (build) => { n = 0; return build(); };
