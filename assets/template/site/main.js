// hover-reveal engine: two aligned pictures per look, the lower one revealed around the cursor.
// One WebGL pass composites them; each look cuts the hole differently:
//   0 ink   — liquid metaball trail (mask canvas, redrawn every frame)
//   1 loupe — a sapphire lens in a brushed rose-gold ring: focus pull, depth of field, AR-coated rim (no mask)
//   2 cyan  — cyanotype stain that accumulates while you linger, then recedes
//   3 brush — dry-brush bristle strokes that stay a while
//   4 melt  — a liquid, iridescent hole: warped tendrils, smeared rim, thin-film rainbow
import { LOOKS, SITE } from "./looks.js";

const $ = (s) => document.querySelector(s);
const KEY = SITE.key ?? "hover-reveal"; // localStorage namespace for per-viewer settings
const canvas = $("#gl");
const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
const lines = $("#lines");
const cursor = $("#cursor");
const touch = matchMedia("(hover: none)").matches;
document.body.classList.toggle("touch", touch);

const MASK_SCALE = 0.5; // mask canvas resolution relative to CSS pixels

// ——— shader ———
const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec4 uRect;
uniform sampler2D uTop, uUnder, uMask;
uniform int uMode; uniform vec2 uMouse;
uniform float uRadius, uTime, uFade, uZoom, uDpr, uFocus;
uniform vec3 uBg, uShift, uAccent;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }

// picture at a screen pixel, feathered into the page colour at its sides
vec3 img(sampler2D t, vec2 px, vec3 shift){
  vec2 uv = (px - uRect.xy) / uRect.zw;
  vec3 c = texture2D(t, clamp(uv, 0., 1.)).rgb + shift;
  float f = smoothstep(0., .06, uv.x) * smoothstep(1., .94, uv.x) * smoothstep(0., .015, uv.y) * smoothstep(1., .985, uv.y);
  return mix(uBg, c, f);
}

// one chromatically split sample of the hidden layer, offset from the lens centre
vec3 tap(vec2 off, float ca){
  return vec3(img(uUnder, uMouse + off * (1. + ca), uShift).r, img(uUnder, uMouse + off, uShift).g, img(uUnder, uMouse + off * (1. - ca), uShift).b);
}

// the mask is a half-resolution canvas whose gradients Chrome dithers; a small blur keeps the edges liquid
float soft(vec2 p){
  vec2 o = 2.5 * uDpr / uRes / ${MASK_SCALE.toFixed(2)};
  vec2 uv = p / uRes;
  return (texture2D(uMask, uv) * 2. + texture2D(uMask, uv + vec2(o.x, 0.)) + texture2D(uMask, uv - vec2(o.x, 0.))
        + texture2D(uMask, uv + vec2(0., o.y)) + texture2D(uMask, uv - vec2(0., o.y))).r / 6.;
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float d = uDpr, t = uTime;
  vec3 top = img(uTop, p, vec3(0.)), col = top;

  if (uMode == 0) {            // ink
    float m = soft(p);
    float n = fbm(p / (150. * d) + vec2(t * .14, -t * .09));
    float v = m - .5 + (n - .5) * .32;
    float a = smoothstep(-.012, .012, v);
    col = mix(top, img(uUnder, p, uShift), a);
    col = mix(col, uAccent, smoothstep(.016, 0., abs(v)) * step(.03, m) * .55);

  } else if (uMode == 1) {     // loupe
    vec2 q = p - uMouse; float dist = length(q), R = max(uRadius, 1.), r = dist / R;
    vec2 dir = q / max(dist, 1.);
    float inside = smoothstep(R + d, R - d, dist);
    // magnified view: soft while the lens travels (focus pull), and gently out of focus toward the rim
    vec2 off = q / uZoom * (.84 + .22 * r * r);
    float ca = .022 * r * r * r;
    float b = ((1. - uFocus) * 7. + r * r * 2.4) * d;
    vec3 u = tap(off, ca) * .4;
    for (int k = 0; k < 6; k++) { float a = float(k) * 1.0472 + .5; u += tap(off + vec2(cos(a), sin(a)) * b, ca) * .1; }
    u *= 1. - .14 * smoothstep(.7, 1., r);                                              // vignette
    u = mix(u, u * vec3(.9, .93, 1.06) + vec3(.01, .015, .04), smoothstep(.7, 1., r) * .45); // AR coating
    u += .09 * smoothstep(.6, .95, dot(dir, vec2(-.6, -.8))) * smoothstep(.84, .96, r);    // window reflection
    u += vec3(.1, .07, .03) * smoothstep(.3, .9, dot(dir, vec2(.6, .8))) * smoothstep(.74, .93, r) * (1. - smoothstep(.95, .99, r)); // caustic
    u += .26 * smoothstep(.012, 0., abs(r - .975));                                     // bevel catch-light
    u *= 1. - .12 * smoothstep(.01, 0., abs(r - .94));                                  // inner bevel
    // the ring: brushed rose gold with a rounded profile and darkened edges
    float bw = 11. * d, rr = (dist - R) / bw, ang = atan(q.y, q.x);
    float ring = smoothstep(R - d, R, dist) * smoothstep(R + bw + d, R + bw, dist);
    float brushed = noise(vec2(dist / (.7 * d), ang * 3.));
    vec3 gold = vec3(.8, .58, .47) * (.7 + .3 * cos(ang * 2. + .9) + (brushed - .5) * .14) * (.82 + .3 * sin(clamp(rr, 0., 1.) * 3.1416));
    gold = mix(vec3(.16, .1, .08), gold, smoothstep(0., .14, rr) * smoothstep(1., .84, rr));
    float shadow = step(R + bw, dist) * (1. - smoothstep(R + bw, R + bw + 44. * d, dist)) * .18;
    col = mix(top * (1. - shadow), u, inside);
    col = mix(col, gold, ring);

  } else if (uMode == 2) {     // cyanotype
    float m = soft(p);
    float n = fbm(p / (110. * d) + vec2(0., t * .03));
    float fib = fbm(p / (26. * d) + n * 3.);
    float v = m + (n - .5) * .42 + (fib - .5) * .16;
    vec3 u = img(uUnder, p, uShift);
    float L = dot(u, vec3(.299, .587, .114));
    vec3 cy = mix(vec3(.05, .15, .34), vec3(.92, .91, .87), smoothstep(.18, .92, L));
    col = mix(top, cy, smoothstep(.22, .27, v));
    col = mix(col, u, smoothstep(.66, .8, v));
    col = mix(col, vec3(.04, .11, .27), smoothstep(.022, 0., abs(v - .235)) * .6);

  } else if (uMode == 3) {     // dry brush
    float m = texture2D(uMask, p / uRes).r;
    float g = noise(p / (2.2 * d)), g2 = fbm(p / (36. * d));
    float v = m * (.72 + .38 * g2) + (g - .5) * .1;
    float a = smoothstep(.2, .5, v);
    col = mix(top, img(uUnder, p, uShift), a);
    col = mix(col, uAccent, a * (1. - a) * 4. * .14);

  } else {                     // iridescent melt
    // the mask is read through a slow domain warp, so the hole grows tendrils and its rim smears both pictures
    vec2 w = vec2(fbm(p / (230. * d) + vec2(t * .06, 0.)), fbm(p / (230. * d) + vec2(5.2, 1.3) - t * .05)) - .5;
    float m = texture2D(uMask, (p + w * 260. * d) / uRes).r;
    float n = fbm(p / (60. * d) + w * 3.);
    float e = m + (n - .5) * .4 - .45;
    float hole = smoothstep(-.015, .015, e);
    float band = exp(-e * e / .05);
    vec2 disp = w * 160. * d * band;
    vec3 tp = img(uTop, p + disp, vec3(0.));
    vec3 un = vec3(img(uUnder, p + disp * 1.25, uShift).r, img(uUnder, p + disp, uShift).g, img(uUnder, p + disp * .75, uShift).b);
    vec3 base = mix(tp, un, hole);
    float ph = e * 5. + n * 3.5 + dot(w, vec2(4., 3.)) + t * .25;
    vec3 film = .5 + .5 * cos(6.2831 * (ph + vec3(0., .33, .67)));     // thin-film rainbow
    col = mix(base, 1. - (1. - base) * (1. - film * .9), band * .85);   // screened over the rim
    col += vec3(.95, 1., .9) * smoothstep(.025, 0., abs(e)) * .22;     // wet highlight on the very edge
  }
  gl_FragColor = vec4(mix(col, uBg, uFade), 1.);
}`;

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(prog);
gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
const U = {};
for (const k of ["uRes", "uRect", "uTop", "uUnder", "uMask", "uMode", "uMouse", "uRadius", "uTime", "uFade", "uZoom", "uDpr", "uFocus", "uBg", "uShift", "uAccent"])
  U[k] = gl.getUniformLocation(prog, k);
// the mask canvas is white-on-transparent; premultiplying turns its alpha into the value the shader reads
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
gl.uniform1i(U.uTop, 0);
gl.uniform1i(U.uUnder, 1);
gl.uniform1i(U.uMask, 2);

function texture(src) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([200, 190, 180]));
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  if (src instanceof HTMLCanvasElement) return t;
  t.ready = new Promise((res) => {
    const im = new Image();
    im.onload = () => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); t.bg = edgeColour(im); res(); };
    im.src = src;
  });
  return t;
}
// average of the picture's left and right edge strips: the page colour it should melt into
function edgeColour(im) {
  const c = document.createElement("canvas");
  c.width = 2; c.height = 64;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(im, 0, 0, 24, im.height, 0, 0, 1, 64);
  x.drawImage(im, im.width - 24, 0, 24, im.height, 1, 0, 1, 64);
  const d = x.getImageData(0, 0, 2, 64).data, sum = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) for (let j = 0; j < 3; j++) sum[j] += d[i + j];
  return sum.map((v) => Math.round(v / (d.length / 4)));
}
for (const l of LOOKS) {
  l.tex = [texture(`img/${l.id}/top.webp`), texture(`img/${l.id}/under.webp`)];
  // a look can run its hidden layer as a silent loop; the still stays in place until frames arrive
  if (l.video) {
    const v = Object.assign(document.createElement("video"), { src: l.video, muted: true, loop: true, playsInline: true, preload: "auto" });
    l.vid = v;
  }
}

// ——— mask canvas (screen space, half resolution) ———
const mask = document.createElement("canvas");
const mx = mask.getContext("2d");
const maskTex = texture(mask);

// ——— layout ———
let W, H, dpr, rect; // rect = picture in CSS px {x,y,w,h}
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
  mask.width = Math.round(W * MASK_SCALE); mask.height = Math.round(H * MASK_SCALE);
  // fit the 4:5 picture to the height; on narrow screens its margins fall off the sides
  const h = H, w = h * 0.8;
  rect = { x: (W - w) / 2, y: 0, w, h };
  Object.assign(lines.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` });
  buildHud();
}

// ——— loupe HUD ———
const loupe = $("#loupe");
const hudLines = ["#hx1", "#hx2", "#hy1", "#hy2"].map((s) => $(s));
const ZOOMS = [1.5, 2, 3, 4]; // detents; the video layer is 1200 px wide, so ×4 is as close as it stays crisp
let readout, tag;
const loupeR = () => rect.h * 0.15;
function buildHud() {
  const R = loupeR(), E = R + 5.5; // E: the engraving runs round the middle of the 11 px ring
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, long = i % 10 === 0, r1 = R + 15, r2 = R + (long ? 23 : 18);
    ticks += `M${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2).toFixed(1)}`;
  }
  const tx = R * 0.8 + 36, ty = -R * 0.8 - 30;
  loupe.innerHTML =
    `<defs><path id="engr" d="M ${-E} 0 A ${E} ${E} 0 1 1 ${E} 0 A ${E} ${E} 0 1 1 ${-E} 0"/></defs>` +
    `<text class="engr"><textPath href="#engr" startOffset="0">${`${SITE.engraving} · `.repeat(3)}</textPath></text>` +
    `<path d="${ticks}" stroke-opacity=".55"/>` +
    `<path d="M${-R * 0.42} 0h${R * 0.84}" stroke-opacity=".22"/>` +
    Array.from({ length: 9 }, (_, i) => { const x = (i - 4) * R * 0.1; return `<path d="M${x.toFixed(1)} 0v${i % 4 === 0 ? -7 : -4}" stroke-opacity=".3"/>`; }).join("") +
    `<text x="${tx}" y="${ty}"></text><text x="${tx}" y="${ty + 15}"></text><text class="zoom" x="${tx}" y="${ty + 30}"></text>` +
    `<g class="tag" transform="translate(${tx} ${ty + 58})"><text class="nm"></text><text class="sp" y="15"></text></g>`;
  readout = loupe.querySelectorAll(":scope > text:not(.engr)");
  tag = loupe.querySelector(".tag");
}

// ——— state ———
const state = { i: 0, fade: 1, fadeTo: 0, zoom: 2, zi: 1, radius: 0, focus: 1, part: null };
const pos = { x: innerWidth / 2, y: innerHeight / 2 };
const target = { ...pos };
const prev = { ...pos };
let lastMove = -1e9, pointerIn = false, frame = 0;

// the wandering ghost cursor can be switched off; the choice is remembered per browser
const autoBtn = $(".auto");
let auto = true;
try { auto = localStorage.getItem(`${KEY}-auto`) !== "off"; } catch {}
function setAuto(on) {
  auto = on;
  autoBtn.setAttribute("aria-pressed", on);
  autoBtn.querySelector("b").textContent = on ? "On" : "Off";
  try { localStorage.setItem(`${KEY}-auto`, on ? "on" : "off"); } catch {}
}
setAuto(auto);
autoBtn.addEventListener("click", () => setAuto(!auto));
const trail = [];
let bristles = [], travel = 0;

addEventListener("pointermove", (e) => {
  target.x = e.clientX; target.y = e.clientY;
  lastMove = performance.now(); pointerIn = true;
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  cursor.classList.toggle("over", !!e.target.closest?.("button, a"));
});
addEventListener("pointerdown", (e) => { target.x = e.clientX; target.y = e.clientY; lastMove = performance.now(); pointerIn = true; });
document.addEventListener("pointerleave", () => { pointerIn = false; });
// magnification clicks between detents rather than gliding, like turning a loupe's barrel
let wheelAcc = 0;
addEventListener("wheel", (e) => {
  if (LOOKS[state.i].mode !== 1) return;
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) < 60) return;
  state.zi = Math.min(ZOOMS.length - 1, Math.max(0, state.zi - Math.sign(wheelAcc)));
  wheelAcc = 0;
}, { passive: true });
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") go(state.i + 1);
  else if (e.key === "ArrowLeft") go(state.i - 1);
  else if (/^[1-9]$/.test(e.key) && +e.key <= LOOKS.length) go(+e.key - 1);
  else if (e.key === "a" || e.key === "A") setAuto(!auto);
});

// ——— painting the mask ———
const S = MASK_SCALE;
// one pre-rendered soft dot, stamped with globalAlpha: live gradients get dithered per frame,
// which piles up into speckle once a stain accumulates
const dotSprite = document.createElement("canvas");
dotSprite.width = dotSprite.height = 256;
{
  const c = dotSprite.getContext("2d"), g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "#fff"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
}
function blob(x, y, r, alpha) {
  mx.globalAlpha = alpha;
  mx.drawImage(dotSprite, (x - r) * S, (y - r) * S, 2 * r * S, 2 * r * S);
  mx.globalAlpha = 1;
}
function fadeMask(alpha) {
  mx.globalCompositeOperation = "destination-out";
  mx.fillStyle = `rgba(0,0,0,${alpha})`;
  mx.fillRect(0, 0, mask.width, mask.height);
}
function newBrush() {
  bristles = Array.from({ length: 64 }, () => {
    const o = (Math.random() + Math.random() + Math.random()) / 1.5 - 1; // denser in the middle
    return { o, w: 1.6 + Math.random() * 3.4, a: 0.4 + Math.random() * 0.5, ph: Math.random() * 100, f: 0.008 + Math.random() * 0.025 };
  });
}
newBrush();

function paint(mode, speed, presence) {
  const base = rect.h;
  if (mode === 0) {
    // the whole trail is redrawn each frame from recent positions, so it melts as the head moves on
    mx.globalCompositeOperation = "source-over";
    mx.clearRect(0, 0, mask.width, mask.height);
    mx.globalCompositeOperation = "lighter";
    const r = base * (0.3 + Math.min(speed, 40) * 0.0035) * presence;
    if (r > 1) blob(pos.x, pos.y, r, 1);
    for (let k = 1; k <= 7; k++) {
      const p = trail[k * 3];
      if (p) blob(p.x, p.y, r * (1 - k / 8) * 0.95, 0.85);
    }
  } else if (mode === 4) {
    // pools where you linger, drains slowly behind you
    if (frame % 3 === 0) fadeMask(0.035);
    mx.globalCompositeOperation = "lighter";
    if (presence > 0.5) blob(pos.x, pos.y, base * (0.2 + Math.min(speed, 40) * 0.002), 0.07);
  } else if (mode === 2) {
    if (frame % 8 === 0) fadeMask(0.05);
    mx.globalCompositeOperation = "lighter";
    if (presence > 0.5 && frame % 3 === 0) blob(pos.x, pos.y, base * 0.15, 0.09 + Math.min(speed, 30) * 0.0036);
  } else if (mode === 3) {
    if (frame % 10 === 0) fadeMask(0.03);
    const dx = pos.x - prev.x, dy = pos.y - prev.y, len = Math.hypot(dx, dy);
    if (len < 0.5 || presence < 0.5) return;
    mx.globalCompositeOperation = "lighter";
    const nx = -dy / len, ny = dx / len;
    const width = base * 0.11 * (1 - Math.min(speed / 140, 0.35));
    const dry = 0.08 + Math.min(speed / 110, 0.3);
    travel += len;
    for (const b of bristles) {
      // each bristle skips along the stroke where its ink runs out, which gives the dry-brush streaks
      const wet = 0.5 + 0.5 * Math.sin(travel * b.f + b.ph) * Math.cos(travel * b.f * 0.37 + b.ph * 1.7);
      if (wet < dry) continue;
      mx.strokeStyle = `rgba(255,255,255,${b.a})`;
      mx.lineWidth = b.w;
      mx.lineCap = "round";
      mx.beginPath();
      mx.moveTo((prev.x + nx * b.o * width) * S, (prev.y + ny * b.o * width) * S);
      mx.lineTo((pos.x + nx * b.o * width) * S, (pos.y + ny * b.o * width) * S);
      mx.stroke();
    }
  }
}

// ——— switching looks ———
const titleEl = $(".title"), h1 = $("h1"), notes = $(".notes"), nav = $(".looks");
nav.style.setProperty("--n", LOOKS.length);
$(".no span").textContent = `/ ${LOOKS[LOOKS.length - 1].no}`;
nav.innerHTML = LOOKS.map((l, i) => `<button data-i="${i}"><span class="n">${l.no}</span><span class="nm">${l.name}</span><span class="sb">${l.sub}</span></button>`).join("");
nav.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });

lines.addEventListener("animationend", (e) => e.target.classList.add("drawn"));

let switching = null;
function go(i) {
  i = (i + LOOKS.length) % LOOKS.length;
  if (i === state.i && state.fade === 0) return;
  clearTimeout(switching);
  state.fadeTo = 1;
  titleEl.classList.remove("in"); titleEl.classList.add("out"); notes.classList.add("out");
  lines.style.transition = "opacity .35s"; lines.style.opacity = 0;
  switching = setTimeout(() => apply(i), 420);
}
function apply(i) {
  state.i = i;
  const l = LOOKS[i];
  const root = document.documentElement.style;
  if (l.bg) root.setProperty("--bg", `rgb(${l.bg})`);
  root.setProperty("--accent", l.accent);
  root.setProperty("--line", l.line === "accent" ? l.accent : "var(--ink)");
  document.body.dataset.mode = l.mode;
  $(".no b").textContent = `Nº ${String(i + 1).padStart(2, "0")}`;
  h1.innerHTML = [...l.name].map((c, k) => `<span class="ch" style="--k:${k}">${c}</span>`).join("");
  $(".sub").textContent = l.sub;
  $(".lede").textContent = l.lede;
  $(".notes dl").innerHTML = l.spec.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("");
  cursor.querySelector("span").textContent = l.cursor;
  state.zi = Math.max(0, ZOOMS.indexOf(l.zoom ?? 2));
  setPart(null);
  LOOKS.forEach((o) => o !== l && o.vid?.pause());
  l.vid?.play().catch(() => {});
  nav.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-current", k === i));
  lines.innerHTML = l.lines();
  lines.style.transition = "none"; lines.style.opacity = 1;
  mx.clearRect(0, 0, mask.width, mask.height);
  trail.length = 0; newBrush();
  Promise.all(l.tex.map((t) => t.ready)).then(() => {
    if (state.i !== i) return;
    [l.bg, l.underBg] = l.tex.map((t) => t.bg);
    root.setProperty("--bg", `rgb(${l.bg})`);
    state.fadeTo = 0;
    requestAnimationFrame(() => { titleEl.classList.remove("out"); titleEl.classList.add("in"); notes.classList.remove("out"); });
  });
  try { history.replaceState(null, "", `#${l.id}`); } catch {}
}

// ——— the part under the lens: its callout lights up, the rest dim, and a tag names it ———
function setPart(p) {
  if (p === state.part) return;
  state.part = p;
  lines.classList.toggle("inspect", !!p);
  lines.querySelectorAll(".part").forEach((g) => g.classList.toggle("on", g.dataset.part === p?.key));
  if (tag) {
    tag.classList.toggle("on", !!p);
    if (p) { tag.querySelector(".nm").textContent = p.name; tag.querySelector(".sp").textContent = p.spec; }
  }
}

// ——— loop ———
const t0 = performance.now();
function tick(now) {
  frame++;
  const t = (now - t0) / 1000;
  const l = LOOKS[state.i];
  const idle = now - lastMove > 2600 || !pointerIn;

  // when nobody is moving, a ghost hand wanders over the subject so the page is never still
  // with the ghost off, the reveal rests under a still mouse and vanishes once the pointer leaves
  if (idle && auto) {
    target.x = rect.x + rect.w * (0.5 + 0.3 * Math.sin(t * 0.43) * Math.cos(t * 0.17));
    target.y = rect.y + rect.h * (0.45 + 0.22 * Math.sin(t * 0.31 + 1.3));
  }
  prev.x = pos.x; prev.y = pos.y;
  const k = [0.13, 0.2, 0.3, 0.3, 0.16][l.mode];
  pos.x += (target.x - pos.x) * k; pos.y += (target.y - pos.y) * k;
  const speed = Math.hypot(pos.x - prev.x, pos.y - prev.y);
  trail.unshift({ x: pos.x, y: pos.y }); trail.length = Math.min(trail.length, 24);

  state.fade += (state.fadeTo - state.fade) * 0.12;
  if (Math.abs(state.fade - state.fadeTo) < 0.002) state.fade = state.fadeTo;
  const presence = (1 - state.fade) * (auto || pointerIn ? 1 : 0);
  state.radius += (loupeR() * presence - state.radius) * 0.15;

  if (l.mode !== 1) {
    paint(l.mode, speed, presence);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, mask);
  } else {
    const R = state.radius / loupeR();
    // focus pull: travelling blurs the view at once, settling brings it back over a few hundred ms
    const sharp = speed < 0.6 ? 1 : 0;
    state.focus += (sharp - state.focus) * (sharp ? 0.07 : 0.3);
    state.zoom += (ZOOMS[state.zi] - state.zoom) * 0.2;
    const ix = ((pos.x - rect.x) / rect.w) * 800, iy = ((pos.y - rect.y) / rect.h) * 1000;
    let best = null, bd = Infinity;
    if (R > 0.6) for (const pt of l.parts ?? []) { const dd = Math.hypot(pt.x - ix, pt.y - iy) / pt.r; if (dd < 1 && dd < bd) { bd = dd; best = pt; } }
    setPart(best);
    // browsers may refuse the first play() (not loaded yet, tab hidden): keep asking while the look is up
    if (l.vid?.paused && frame % 60 === 0 && document.visibilityState === "visible") l.vid.play().catch(() => {});
    if (l.vid && l.vid.readyState >= 2 && l.vid.currentTime !== l.vidT) {
      l.vidT = l.vid.currentTime;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, l.tex[1]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, l.vid);
    }
    loupe.setAttribute("transform", `translate(${pos.x} ${pos.y}) scale(${R.toFixed(3)})`);
    hudLines.forEach((ln) => { ln.style.opacity = Math.min(1, R).toFixed(3); });
    const ux = (pos.x - rect.x) / rect.w, uy = (pos.y - rect.y) / rect.h, g = loupeR() + 30;
    [[0, pos.y, pos.x - g, pos.y], [pos.x + g, pos.y, W, pos.y], [pos.x, 0, pos.x, pos.y - g], [pos.x, pos.y + g, pos.x, H]]
      .forEach(([a, b, c, e], j) => { const ln = hudLines[j]; ln.setAttribute("x1", a); ln.setAttribute("y1", b); ln.setAttribute("x2", c); ln.setAttribute("y2", e); });
    readout[0].textContent = `X ${ux.toFixed(3)}`;
    readout[1].textContent = `Y ${uy.toFixed(3)}`;
    readout[2].innerHTML = ZOOMS.map((z, j) => `<tspan${j === state.zi ? ' class="acc"' : ""}>×${z}</tspan>`).join("  ");
  }

  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, l.tex[0]);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, l.tex[1]);
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform4f(U.uRect, rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr);
  gl.uniform1i(U.uMode, l.mode);
  gl.uniform2f(U.uMouse, pos.x * dpr, pos.y * dpr);
  gl.uniform1f(U.uRadius, state.radius * dpr);
  gl.uniform1f(U.uTime, t);
  gl.uniform1f(U.uFade, state.fade);
  gl.uniform1f(U.uZoom, state.zoom);
  gl.uniform1f(U.uDpr, dpr);
  gl.uniform1f(U.uFocus, state.focus);
  const bg = l.bg ?? [215, 205, 195], ubg = l.underBg ?? bg;
  gl.uniform3f(U.uBg, ...bg.map((v) => v / 255));
  gl.uniform3f(U.uShift, ...bg.map((v, j) => (l.shift === false ? 0 : (v - ubg[j]) / 255)));
  const a = parseInt(l.accent.slice(1), 16);
  gl.uniform3f(U.uAccent, (a >> 16) / 255, ((a >> 8) & 255) / 255, (a & 255) / 255);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(tick);
}

if (!LOOKS.length) throw new Error("site/looks.js has no looks yet: add one entry per look (see the commented template)");
addEventListener("resize", resize);
resize();
const start = Math.max(0, LOOKS.findIndex((l) => `#${l.id}` === location.hash));
apply(start);
requestAnimationFrame(tick);
