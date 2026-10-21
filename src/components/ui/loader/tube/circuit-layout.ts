/**
 * The opening's circuit, laid out for a screen: a chip at the pupil and the
 * iris fanned out of its pins, the limbus, bundles of traces along the lids,
 * the brow, lash traces to pads, then a board spreading from the eye to the
 * edges (buses, chips, vias), routed the way a board is (straight runs,
 * 45-degree bends, a ring pad at each end). Every trace carries when current
 * starts laying it and how fast, so the tube can draw it growing.
 *
 * The eye's part is placed in mm round the globe (eye-lines.ts), so it lands
 * on the real eye; the board is in CSS px from a fixed seed, so it is the
 * same board every time.
 */

import type { TubeFrame, Vec } from "./eye-lines";
import { BROW, IRIS, OPEN_LOWER, OPEN_UPPER, resample, through } from "./eye-lines";

/** How fast current lays a trace, CSS px/s (the board is laid faster, to reach the edges in time). */
const LAY_SPEED = 900;

export interface Trace {
  pts: Vec[]; // CSS px
  cum: number[];
  len: number;
  /** When current starts laying it, s. */
  start: number;
  speed: number;
  eye: boolean;
  width: number;
  padEnd: boolean;
  /** Where a pulse is along it, as a phase; some traces carry none. */
  phase: number;
  pulse: boolean;
}

export interface Chip {
  x: number;
  y: number;
  w: number;
  h: number;
  pins: number;
  start: number;
  eye: boolean;
}

/** A plated hole on the board, lit when the board reaches it. */
export interface Via {
  x: number;
  y: number;
  start: number;
}

/* ---- maths --------------------------------------------------------------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function measure(pts: Vec[]) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { cum, len: cum[cum.length - 1] };
}

/**
 * Route through the points the way a board is routed: from each point to the
 * next, a 45-degree run then a straight one (or the other way round, which
 * ever keeps closer to the curve).
 */
function route(pts: Vec[]): Vec[] {
  const out: Vec[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = out[out.length - 1];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const diag = Math.min(Math.abs(dx), Math.abs(dy));
    const corner: Vec =
      i % 2 === 0
        ? [ax + Math.sign(dx) * diag, ay + Math.sign(dy) * diag]
        : [bx - Math.sign(dx) * diag, by - Math.sign(dy) * diag];
    if (Math.hypot(corner[0] - ax, corner[1] - ay) > 0.5 && Math.hypot(bx - corner[0], by - corner[1]) > 0.5) out.push(corner);
    out.push([bx, by]);
  }
  return out;
}

/** A curve moved `d` along its normal (positive: to the left of travel). */
function offset(pts: Vec[], d: number): Vec[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    return [p[0] - (ty / l) * d, p[1] + (tx / l) * d] as Vec;
  });
}

/**
 * The board for a frame: the eye's traces placed in mm round the globe (so
 * they land on the real eye), the board around it in CSS px from a fixed seed.
 * Drawn once into a texture by the tube (tube-scene.ts).
 */
export function layoutCircuit(fr: TubeFrame): { traces: Trace[]; chips: Chip[]; vias: Via[] } {
  let traces: Trace[] = [];
  let chips: Chip[] = [];
  let vias: Via[] = [];
  /** mm round the globe → CSS px. */
  const P = ([x, y]: Vec): Vec => [fr.cx + x * fr.pxPerMm, fr.cy - y * fr.pxPerMm];
  const mmPx = (v: number) => v * fr.pxPerMm;

  function add(pts: Vec[], start: number, eye: boolean, width: number, padEnd = true, rand = Math.random) {
    if (pts.length < 2) return;
    const { cum, len } = measure(pts);
    if (len < 2) return;
    traces.push({
      pts,
      cum,
      len,
      start,
      // the board is laid faster, so it reaches the edges by FORMED
      speed: LAY_SPEED * (eye ? 0.9 : 1.7),
      eye,
      width,
      padEnd,
      phase: rand(),
      pulse: rand() < (eye ? 0.55 : 0.4),
    });
  }

  function build() {
    traces = [];
    chips = [];
    vias = [];
    const r = rng(1970);
    const pupil = P(IRIS.c);

    /* the chip in the pupil, and the iris fanned out of its pins */
    const half = mmPx(1.25);
    chips.push({ x: pupil[0] - half, y: pupil[1] - half, w: half * 2, h: half * 2, pins: 5, start: 0.15, eye: true });
    const fan = 36;
    for (let k = 0; k < fan; k++) {
      const a = (k / fan) * Math.PI * 2 + 0.04;
      const dir: Vec = [Math.cos(a), -Math.sin(a)];
      // leave the chip square at the pin nearest this direction, straight out from its side
      const s = Math.max(Math.abs(dir[0]), Math.abs(dir[1]));
      const onEdge: Vec = [pupil[0] + (dir[0] / s) * half, pupil[1] + (dir[1] / s) * half];
      const side: Vec = Math.abs(dir[0]) > Math.abs(dir[1]) ? [Math.sign(dir[0]), 0] : [0, Math.sign(dir[1])];
      const out1: Vec = [onEdge[0] + side[0] * mmPx(0.45), onEdge[1] + side[1] * mmPx(0.45)];
      const rEnd = mmPx(k % 3 === 0 ? 5.3 : k % 3 === 1 ? 4.5 : 3.7);
      const end: Vec = [pupil[0] + dir[0] * rEnd, pupil[1] + dir[1] * rEnd];
      add(route([onEdge, out1, end]), 0.45 + (k % 6) * 0.02, true, 1.1, true, r);
    }
    /* the limbus: the iris's edge, a round trace closing on itself, twice */
    for (const [rr, st] of [
      [IRIS.r, 1.0],
      [IRIS.r + 0.32, 1.12],
    ] as const) {
      const ring: Vec[] = [];
      for (let i = 0; i <= 72; i++) {
        const a = Math.PI / 2 - (i / 72) * Math.PI * 2;
        ring.push(P([IRIS.c[0] + rr * Math.cos(a), IRIS.c[1] + rr * Math.sin(a)]));
      }
      add(ring, st, true, 1.3, false, r);
    }

    /* the lids: bundles of traces along the upper and lower margins, routed */
    const upper = resample(through(OPEN_UPPER), 18);
    const lower = resample(through(OPEN_LOWER), 18).reverse();
    for (let b = 0; b < 4; b++) {
      const dUp = 0.15 + b * 0.5;
      add(route(offset(upper, dUp).map(P)), 1.25 + b * 0.09, true, 1.25 - b * 0.15, true, r);
      add(route(offset(lower, -dUp).map(P)), 1.35 + b * 0.09, true, 1.25 - b * 0.15, true, r);
    }
    /* the brow: a wider bundle arching over */
    const brow = resample(through(BROW), 16);
    for (let b = 0; b < 5; b++) add(route(offset(brow, 0.1 + b * 0.42).map(P)), 1.8 + b * 0.07, true, 1.1, true, r);
    /* lashes: short traces off the upper lid, each to a pad */
    const lashRoot = resample(through(OPEN_UPPER), 14);
    for (let i = 2; i < 12; i++) {
      const [x, y] = lashRoot[i];
      const lean = (i - 6.5) * 0.12;
      add(route([P([x, y + 2.2]), P([x + lean * 1.2, y + 3.4]), P([x + lean * 2.2, y + 4.1])]), 2.05 + i * 0.015, true, 0.9, true, r);
    }
    /* the ties: from the limbus out to the lids and the brow, so it reads as one circuit */
    for (const [a, to] of [
      [Math.PI * 0.62, 2.6],
      [Math.PI * 0.38, 2.6],
      [-Math.PI * 0.6, -2.4],
      [-Math.PI * 0.4, -2.4],
    ] as const) {
      const s0: Vec = [IRIS.c[0] + (IRIS.r + 0.32) * Math.cos(a), IRIS.c[1] + (IRIS.r + 0.32) * Math.sin(a)];
      add(route([P(s0), P([s0[0], s0[1] + to])]), 1.15, true, 1.0, true, r);
    }

    /* the board: from the eye out to the edges of the screen */
    const W = fr.w;
    const H = fr.h;
    const eyeC = P([0, 0]);
    const rx = mmPx(16.5);
    const ry = mmPx(11.5);
    const inEye = (x: number, y: number) => ((x - eyeC[0]) / rx) ** 2 + ((y - eyeC[1]) / ry) ** 2 < 1;
    const margin = 10;
    const pitch = Math.max(16, Math.min(28, Math.min(W, H) / 32));
    const DIRS: Vec[] = [
      [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
    ].map(([x, y]) => [x / Math.hypot(x, y), y / Math.hypot(x, y)] as Vec);
    const dirToward = (x: number, y: number) => {
      const a = Math.atan2(y, x);
      return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    };

    /** A walk outward from p: straight runs, 45-degree turns, bundled `lanes` wide. */
    const walk = (p: Vec, d0: number, lanes: number, start: number) => {
      let d = d0;
      let cur: Vec = p;
      const path: Vec[] = [cur];
      for (let s = 0; s < 14; s++) {
        const len = pitch * (2 + Math.floor(r() * 5));
        let next: Vec = [cur[0] + DIRS[d][0] * len, cur[1] + DIRS[d][1] * len];
        if (next[0] < margin || next[0] > W - margin || next[1] < margin || next[1] > H - margin) {
          next = [Math.min(W - margin, Math.max(margin, next[0])), Math.min(H - margin, Math.max(margin, next[1]))];
          path.push(next);
          break;
        }
        if (inEye(next[0], next[1])) {
          d = (d + (r() < 0.5 ? 2 : 6)) % 8;
          continue;
        }
        path.push(next);
        cur = next;
        if (r() < 0.55) d = (d + (r() < 0.5 ? 1 : 7)) % 8;
        // keep heading outward
        const out = dirToward(cur[0] - eyeC[0], cur[1] - eyeC[1]);
        const diff = ((d - out + 12) % 8) - 4;
        if (Math.abs(diff) > 2) d = (d + (diff > 0 ? 7 : 1)) % 8;
      }
      // the bundle: parallel copies on either side
      const dist = Math.hypot(p[0] - eyeC[0], p[1] - eyeC[1]);
      for (let l = 0; l < lanes; l++) {
        const o = (l - (lanes - 1) / 2) * 6;
        add(lanes > 1 ? offset(path, o) : path, start + dist / 1800 + l * 0.03, false, 1, true, r);
      }
    };

    // from points round the eye's outline (lids, brow ends, corners), outward
    const seeds = 44;
    for (let i = 0; i < seeds; i++) {
      const a = (i / seeds) * Math.PI * 2 + r() * 0.2;
      const sx = eyeC[0] + Math.cos(a) * rx * 1.02;
      const sy = eyeC[1] + Math.sin(a) * ry * 1.02;
      if (sx < margin || sx > W - margin || sy < margin || sy > H - margin) continue;
      const lanes = r() < 0.5 ? 3 + Math.floor(r() * 4) : 1 + Math.floor(r() * 2);
      walk([sx, sy], dirToward(Math.cos(a), Math.sin(a)), lanes, 2.2 + r() * 0.3);
    }
    // chips out on the board, each with traces of its own
    const nChips = Math.round((W * H) / 90000) + 4;
    for (let i = 0; i < nChips * 4 && chips.length < nChips + 1; i++) {
      const w = pitch * (2 + Math.floor(r() * 4));
      const h = pitch * (1 + Math.floor(r() * 3));
      const x = margin + r() * (W - w - margin * 2);
      const y = margin + r() * (H - h - margin * 2);
      if (inEye(x, y) || inEye(x + w, y + h) || inEye(x + w, y) || inEye(x, y + h) || inEye(x + w / 2, y + h / 2)) continue;
      if (chips.some((c) => x < c.x + c.w + pitch && x + w + pitch > c.x && y < c.y + c.h + pitch && y + h + pitch > c.y)) continue;
      const dist = Math.hypot(x + w / 2 - eyeC[0], y + h / 2 - eyeC[1]);
      chips.push({ x, y, w, h, pins: Math.max(3, Math.round(w / 8)), start: 2.4 + dist / 1500, eye: false });
      for (let k = 0; k < 5; k++) {
        const side = Math.floor(r() * 4);
        const p: Vec =
          side === 0 ? [x + r() * w, y] : side === 1 ? [x + w, y + r() * h] : side === 2 ? [x + r() * w, y + h] : [x, y + r() * h];
        walk(p, [6, 0, 2, 4][side], r() < 0.45 ? 2 + Math.floor(r() * 3) : 1, 2.6 + dist / 1500);
      }
    }
    for (let i = 0; i < Math.round((W * H) / 9000); i++) {
      const x = margin + r() * (W - margin * 2);
      const y = margin + r() * (H - margin * 2);
      if (inEye(x, y)) continue;
      vias.push({ x, y, start: 2.3 + Math.hypot(x - eyeC[0], y - eyeC[1]) / 1400 });
    }
    // the eye's corners and brow ends join the board
    for (const m of [OPEN_UPPER[0], OPEN_UPPER[OPEN_UPPER.length - 1], BROW[0], BROW[BROW.length - 1]]) {
      const p = P(m);
      walk(p, dirToward(p[0] - eyeC[0], p[1] - eyeC[1]), 3, 2.1);
    }
  }
  build();
  return { traces, chips, vias };
}
