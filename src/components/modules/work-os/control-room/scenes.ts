/**
 * The moving picture that stands for each work. A scene is drawn in big dots
 * on a small stage inside the tube, runs by the clock, and answers the
 * pointer: the chart reads the price under it, the van follows it, the piano
 * plays the key it is on. Which scene a work plays is data (data/work-show.ts).
 */

import type { SceneKind } from "@/data/work-show";
import { iconRows } from "./pixel-icons";
import { CH, CW, type Surface } from "./surface";

export interface Stage {
  s: Surface;
  /** The stage, in surface pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Seconds. */
  t: number;
  /** The pointer in surface pixels, or null when it is off the glass. */
  pointer: { x: number; y: number } | null;
  /** The work's own colour, a softer and a faint step of it, and the accent. */
  ink: string;
  soft: string;
  faint: string;
  hot: string;
}

/** A stage measured in dots, with the pointer in the same measure. */
interface Dots {
  d: number;
  cols: number;
  rows: number;
  /** Fill a block of dots. */
  D: (x: number, y: number, w: number, h: number, color: string) => void;
  /** A one-bit picture, each of its dots `scale` stage dots square. */
  pic: (x: number, y: number, rows: readonly string[], scale: number, color: string) => void;
  /** A word, its top left at a dot. */
  word: (x: number, y: number, text: string, color: string) => void;
  /** The pointer in dots, when it is over the stage. */
  at: { x: number; y: number } | null;
}

type Scene = (g: Stage, q: Dots) => void;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** A value that runs 0 → 1 → 0. */
const tri = (v: number) => 1 - Math.abs((((v % 2) + 2) % 2) - 1);

const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
const SOFA = [
  "................",
  "................",
  "..############..",
  "..############..",
  "##.##########.##",
  "###..........###",
  "################",
  "################",
  "################",
  ".##..........##.",
  ".##..........##.",
  "................",
];
const TABLE = [
  "................",
  "................",
  "................",
  "################",
  "################",
  "..#..........#..",
  "..#..........#..",
  "..#..........#..",
  "..#..........#..",
  "..#..........#..",
  "..#..........#..",
  "................",
];

const chart: Scene = (g, q) => {
  const n = Math.floor((q.cols - 4) / 4);
  const base = q.rows - 7;
  const span = q.rows - 14;
  const price = (i: number) => 0.5 + 0.26 * Math.sin(i * 0.5) + 0.15 * Math.sin(i * 1.7 + 1) + 0.06 * Math.sin(i * 3.1);
  const run = g.t * 1.4;
  const first = Math.floor(run);
  const y = (p: number) => base - Math.round(clamp(p, 0, 1) * span);
  for (let k = 0; k < n; k += 1) {
    const i = first + k;
    const open = price(i);
    // the newest candle is still forming
    const close = k === n - 1 ? open + (price(i + 1) - open) * (run - first) : price(i + 1);
    const top = y(Math.max(open, close));
    const bottom = y(Math.min(open, close));
    q.D(2 + k * 4 + 1, y(Math.max(open, close) + 0.07), 1, y(Math.min(open, close) - 0.07) - y(Math.max(open, close) + 0.07), g.soft);
    q.D(2 + k * 4, top, 3, Math.max(1, bottom - top), close >= open ? g.ink : g.hot);
  }
  // the backtest running under it
  q.D(2, q.rows - 3, q.cols - 4, 1, g.faint);
  q.D(2, q.rows - 3, Math.round((q.cols - 4) * ((g.t * 0.22) % 1)), 1, g.ink);
  q.word(2, 1, "BTC-USDT 1H", g.soft);
  if (q.at) {
    q.D(clamp(q.at.x, 1, q.cols - 2), 1, 1, q.rows - 5, g.hot);
    q.D(1, clamp(q.at.y, 1, base), q.cols - 2, 1, g.faint);
    const read = Math.round(60000 + (1 - clamp(q.at.y - (base - span), 0, span) / span) * 9000);
    q.word(clamp(q.at.x + 2, 2, q.cols - 14), clamp(q.at.y - 6, 6, base - 6), String(read), g.hot);
  }
};

const printer: Scene = (g, q) => {
  const cx = Math.floor(q.cols / 2);
  const top = Math.max(2, Math.floor(q.rows / 2) - 9);
  // the sheet going in, the body, the sheet coming out
  q.D(cx - 7, top, 14, 5, g.soft);
  q.D(cx - 12, top + 5, 24, 7, g.ink);
  q.D(cx - 10, top + 7, 20, 1, "#000");
  const out = Math.floor((g.t * 5) % 12);
  q.D(cx - 7, top + 12, 14, out, g.ink);
  for (let j = 1; j < out; j += 2) q.D(cx - 5, top + 12 + j, 6 + ((j * 5) % 5), 1, "#000");
  // the head: where the pointer is, or sweeping by itself
  const head = q.at ? clamp(q.at.x, cx - 7, cx + 5) : cx - 7 + Math.floor(tri(g.t * 2.4) * 12);
  q.D(head, top + 12 + out, 2, 1, g.hot);
  // its AI lamp thinking
  if ((g.t * 2) % 1 < 0.6) q.D(cx + 8, top + 9, 2, 2, g.hot);
  const spark = top + 1;
  q.D(cx + 11, spark, 1, 3, g.hot);
  q.D(cx + 10, spark + 1, 3, 1, g.hot);
  q.word(2, q.rows - 6, "PRINT AI", g.soft);
};

const tokens: Scene = (g, q) => {
  const nx = Math.floor((q.cols - 3) / 6);
  const ny = Math.floor((q.rows - 9) / 4);
  const total = nx * ny;
  const shown = Math.floor((g.t * 9) % (total + 14));
  for (let i = 0; i < total; i += 1) {
    const x = 2 + (i % nx) * 6;
    const y = 2 + Math.floor(i / nx) * 4;
    const near = q.at && Math.abs(q.at.x - (x + 2)) < 5 && Math.abs(q.at.y - (y + 1)) < 4;
    if (near) q.D(x, y, 5, 3, g.hot);
    else if (i < shown) q.D(x, y, i % 5 === 0 ? 5 : i % 3 === 0 ? 3 : 4, 3, i % 4 === 0 ? g.ink : g.soft);
    else q.D(x, y + 2, 5, 1, g.faint);
  }
  q.word(2, q.rows - 6, `${Math.min(235, Math.round((Math.min(shown, total) / total) * 235))} TOKENS`, g.ink);
};

const van: Scene = (g, q) => {
  const road = q.rows - 4;
  q.D(1, road, q.cols - 2, 1, g.soft);
  for (let x = 2 - (Math.floor(g.t * 10) % 6); x < q.cols - 2; x += 6) if (x > 0) q.D(x, road + 2, 3, 1, g.faint);
  // the door it is going to
  const door = q.cols - 12;
  q.D(door, road - 14, 10, 14, g.soft);
  q.D(door + 1, road - 13, 8, 13, "#000");
  q.D(door + 3, road - 8, 4, 8, g.soft);
  const lane = q.cols + 18;
  const x = q.at ? clamp(q.at.x - 8, 1, door - 16) : Math.floor((g.t * 8) % lane) - 16;
  q.pic(x, road - 12, iconRows("get-my-prints"), 1, g.ink);
  if (x > door - 22 && x < door) {
    // the printout handed over
    q.D(door + 3, road - 19, 4, 4, g.hot);
    q.word(Math.max(1, door - 20), 1, "DELIVERED", g.hot);
  }
};

const chat: Scene = (g, q) => {
  const step = Math.floor((g.t * 0.9) % 6);
  const widths = [0.62, 0.46, 0.7, 0.4];
  const rowH = Math.max(5, Math.floor((q.rows - 4) / 4));
  for (let i = 0; i < 4; i += 1) {
    const w = Math.floor((q.cols - 6) * widths[i]);
    const left = i % 2 === 0;
    const x = left ? 2 : q.cols - 2 - w;
    const y = 2 + i * rowH;
    const over = q.at && q.at.y >= y && q.at.y < y + rowH - 1;
    if (i > step && !over) continue;
    const color = over ? g.hot : left ? g.ink : g.soft;
    q.D(x, y, w, rowH - 2, color);
    q.D(x + 1, y + 1, w - 2, rowH - 4, "#000");
    for (let l = 0; l < rowH - 5; l += 2) q.D(x + 2, y + 2 + l, Math.max(3, w - 5 - ((l * 7 + i * 3) % 9)), 1, color);
  }
  if (step < 4) {
    // the next one being typed
    const y = 2 + Math.min(3, step + 1) * rowH + 1;
    for (let k = 0; k < 3; k += 1) if (Math.floor(g.t * 4) % 3 >= k) q.D(3 + k * 3, y, 2, 2, g.soft);
  }
};

const steps: Scene = (g, q) => {
  const labels = ["SIGN UP", "VERIFY", "PICK PRINTER", "START"];
  const done = Math.floor((g.t * 0.8) % 6);
  const ph = q.rows - 4;
  // the phone
  q.D(2, 2, 18, ph, g.soft);
  q.D(3, 3, 16, ph - 4, "#000");
  q.D(8, ph, 6, 1, "#000");
  const rowH = Math.max(4, Math.floor((ph - 6) / 4));
  labels.forEach((label, i) => {
    const y = 5 + i * rowH;
    const over = q.at !== null && q.at.y >= y - 1 && q.at.y < y + rowH - 1;
    const on = i < done || over;
    q.D(5, y, 3, 3, on ? g.hot : g.faint);
    if (!on) q.D(6, y + 1, 1, 1, "#000");
    q.D(10, y + 1, on ? 7 : 5, 1, on ? g.ink : g.faint);
    q.word(24, y - 1, label, on ? g.ink : g.faint);
  });
  q.D(24, q.rows - 4, q.cols - 28, 1, g.faint);
  q.D(24, q.rows - 4, Math.round(((q.cols - 28) * Math.min(4, done)) / 4), 1, g.hot);
};

const bridge: Scene = (g, q) => {
  const deck = Math.floor(q.rows * 0.56);
  const names = ["STUDENT", "OFFICER", "RECRUITER"];
  const xs = [5, Math.floor(q.cols / 2), q.cols - 6];
  const at = q.at;
  const nearest = at ? xs.reduce((best, x, i) => (Math.abs(x - at.x) < Math.abs(xs[best] - at.x) ? i : best), 0) : -1;
  q.D(2, deck, q.cols - 4, 2, g.ink);
  // towers and their cables
  for (const tx of [Math.floor(q.cols * 0.3), Math.floor(q.cols * 0.7)]) {
    q.D(tx, deck - 10, 2, 16, g.ink);
    for (let k = 1; k < 9; k += 1) {
      q.D(tx - k * 2, deck - 10 + k, 1, 1, g.soft);
      q.D(tx + 1 + k * 2, deck - 10 + k, 1, 1, g.soft);
    }
  }
  // profiles crossing, both ways
  const len = q.cols - 8;
  for (let k = 0; k < 4; k += 1) {
    q.D(4 + Math.floor((g.t * 11 + k * (len / 4)) % len), deck - 2, 2, 2, g.hot);
    q.D(q.cols - 6 - Math.floor((g.t * 8 + k * (len / 4)) % len), deck + 2, 2, 1, g.soft);
  }
  xs.forEach((x, i) => {
    const on = i === nearest;
    q.D(x - 2, deck - 5, 5, 5, on ? g.hot : g.ink);
    q.D(x - 1, deck - 4, 3, 3, "#000");
    const label = names[i];
    q.word(clamp(x - label.length, 1, q.cols - label.length * 2.6), deck + 6, label, on ? g.hot : g.soft);
  });
};

const game: Scene = (g, q) => {
  const w = q.cols - 4;
  const h = q.rows - 6;
  q.D(1, 1, q.cols - 2, 1, g.soft);
  q.D(1, 1, 1, q.rows - 2, g.soft);
  q.D(q.cols - 2, 1, 1, q.rows - 2, g.soft);
  const bx = 2 + Math.floor(tri(g.t * 0.83) * (w - 2));
  const by = 7 + Math.floor(tri(g.t * 1.27) * (h - 7));
  // bricks, a few knocked out as the score climbs
  const hits = Math.floor(g.t * 0.6);
  for (let i = 0; i < Math.floor(w / 5); i += 1) {
    for (let row = 0; row < 2; row += 1) {
      if ((i * 7 + row * 3 + hits) % 5 === 0) continue;
      q.D(3 + i * 5, 3 + row * 2, 4, 1, row ? g.soft : g.ink);
    }
  }
  q.D(bx, by, 2, 2, g.hot);
  const paddle = clamp((q.at ? q.at.x : bx) - 4, 2, q.cols - 11);
  q.D(paddle, q.rows - 3, 9, 1, g.ink);
  q.word(3, q.rows - 9, `SCORE ${String(hits * 10).padStart(4, "0")}`, g.faint);
};

const match: Scene = (g, q) => {
  const cx = Math.floor(q.cols / 2);
  const cy = Math.floor(q.rows / 2) + 2;
  const gap = q.at ? clamp(Math.abs(q.at.x - cx), 6, cx - 8) : 7 + Math.floor(tri(g.t * 0.5) * (cx - 16));
  for (const side of [-1, 1]) {
    const x = cx + side * gap;
    // a plate, and the fork beside it
    q.D(x - 4, cy - 3, 8, 6, side < 0 ? g.ink : g.soft);
    q.D(x - 5, cy - 2, 10, 4, side < 0 ? g.ink : g.soft);
    q.D(x - 3, cy - 2, 6, 4, "#000");
    q.D(x + side * 7, cy - 4, 1, 8, g.faint);
  }
  if (gap < 10) {
    const beat = (g.t * 2.4) % 1 < 0.5 ? 2 : 1;
    q.pic(cx - Math.floor((7 * beat) / 2), cy - 8 - 6 * beat, HEART, beat, g.hot);
    q.word(cx - 6, q.rows - 6, "MATCH", g.hot);
  }
};

const sofa: Scene = (g, q) => {
  const forms = [
    { rows: iconRows("desirable"), name: "ARMCHAIR", w: "W 90" },
    { rows: SOFA, name: "SOFA", w: "W 210" },
    { rows: TABLE, name: "TABLE", w: "W 160" },
  ];
  const i = q.at ? clamp(Math.floor((q.at.x / q.cols) * forms.length), 0, forms.length - 1) : Math.floor(g.t * 0.45) % forms.length;
  const scale = q.rows >= 34 ? 2 : 1;
  const x = Math.floor(q.cols / 2) - 8 * scale;
  const y = Math.max(2, Math.floor(q.rows / 2) - 7 * scale);
  q.pic(x, y, forms[i].rows, scale, g.ink);
  // its measure, drawn under it
  const my = y + 12 * scale + 1;
  q.D(x, my, 16 * scale, 1, g.hot);
  q.D(x, my - 1, 1, 3, g.hot);
  q.D(x + 16 * scale - 1, my - 1, 1, 3, g.hot);
  q.word(x, my + 2, forms[i].w, g.hot);
  q.word(2, 1, forms[i].name, g.soft);
  forms.forEach((_, k) => q.D(q.cols - 4 - (forms.length - 1 - k) * 3, 2, 2, 2, k === i ? g.hot : g.faint));
};

const keys: Scene = (g, q) => {
  const n = Math.floor((q.cols - 3) / 4);
  const kh = Math.max(7, Math.floor(q.rows * 0.34));
  const ky = q.rows - kh - 1;
  const phrase = [0, 2, 4, 5, 4, 2, 7, 5];
  const over = q.at && q.at.y >= ky - 2 ? clamp(Math.floor((q.at.x - 2) / 4), 0, n - 1) : -1;
  const played = over >= 0 ? over : phrase[Math.floor(g.t * 3.2) % phrase.length] % n;
  for (let k = 0; k < n; k += 1) q.D(2 + k * 4, ky, 3, kh, k === played ? g.hot : g.ink);
  for (let k = 0; k < n - 1; k += 1) if (k % 7 !== 2 && k % 7 !== 6) q.D(4 + k * 4, ky, 2, Math.floor(kh * 0.6), "#000");
  // the wave of the note being played
  const mid = Math.floor(ky / 2);
  for (let x = 1; x < q.cols - 1; x += 1) {
    const amp = Math.max(1, mid - 2) * (0.35 + 0.65 * Math.exp(-((g.t * 3.2) % 1) * 1.6));
    q.D(x, mid + Math.round(Math.sin(x * (0.16 + played * 0.035) + g.t * 9) * amp), 1, 1, g.soft);
  }
};

const eye: Scene = (g, q) => {
  const cx = Math.floor(q.cols / 2);
  const cy = Math.floor(q.rows / 2);
  const rx = Math.min(cx - 3, 26);
  const ry = Math.min(cy - 2, Math.floor(rx * 0.55));
  const shut = (g.t % 4.2) > 4.05;
  // the lids: two arcs of dots
  for (let x = -rx; x <= rx; x += 1) {
    const lid = shut ? 0 : Math.round(ry * Math.sqrt(1 - (x / rx) ** 2));
    q.D(cx + x, cy - lid, 1, 1, g.ink);
    q.D(cx + x, cy + lid, 1, 1, g.ink);
  }
  if (shut) return;
  // the iris looks where the pointer is, or wanders
  const lx = q.at ? clamp((q.at.x - cx) / cx, -1, 1) : Math.sin(g.t * 0.7) * 0.6;
  const ly = q.at ? clamp((q.at.y - cy) / cy, -1, 1) : Math.sin(g.t * 1.1) * 0.3;
  const ix = cx + Math.round(lx * (rx - ry));
  const iy = cy + Math.round(ly * ry * 0.35);
  const r = Math.max(3, ry - 3);
  for (let y = -r; y <= r; y += 1) {
    const half = Math.round(Math.sqrt(r * r - y * y));
    q.D(ix - half, iy + y, half * 2 + 1, 1, g.soft);
  }
  q.D(ix - 2, iy - 2, 5, 5, "#000");
  q.D(ix - 3, iy - 3, 2, 2, g.hot);
};

const SCENES: Record<SceneKind, Scene> = { chart, printer, tokens, van, chat, steps, bridge, game, match, sofa, keys, eye };

/** Play a work's scene on its stage. */
export function drawScene(kind: SceneKind, g: Stage): void {
  const d = g.h >= 84 ? 4 : 2;
  const { s } = g;
  const q: Dots = {
    d,
    cols: Math.floor(g.w / d),
    rows: Math.floor(g.h / d),
    D: (x, y, w, h, color) => {
      if (w > 0 && h > 0) s.px(g.x + Math.round(x) * d, g.y + Math.round(y) * d, Math.round(w) * d, Math.round(h) * d, color);
    },
    pic: (x, y, rows, scale, color) => s.bitmap(g.x + Math.round(x) * d, g.y + Math.round(y) * d, rows, scale * d, color),
    word: (x, y, text, color) => void s.text((g.x + Math.round(x) * d) / CW, (g.y + Math.round(y) * d) / CH, text, color),
    at:
      g.pointer && g.pointer.x >= g.x && g.pointer.y >= g.y && g.pointer.x < g.x + g.w && g.pointer.y < g.y + g.h
        ? { x: (g.pointer.x - g.x) / d, y: (g.pointer.y - g.y) / d }
        : null,
  };
  s.ctx.save();
  s.ctx.beginPath();
  s.ctx.rect(g.x, g.y, g.w, g.h);
  s.ctx.clip();
  SCENES[kind](g, q);
  s.ctx.restore();
}
