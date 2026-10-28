/**
 * 2026's twelve landmarks (post/measured.ts, L3), worked out once a frame on
 * the CPU: everything about each point that depends on no pixel (where it
 * sits as the lids stand, how far its acquisition has run, its ring, its
 * bracket, its elbow leader and where its label goes). The medium reads them
 * as four vec4s a point (uniforms.ts `medium.marks`):
 *
 *   [i·4 + 0]  q.xy (the point), ring radius, bracket half-side
 *   [i·4 + 1]  e1.xy, e2.xy (the leader's elbow and end)
 *   [i·4 + 2]  label origin xy, on (acquired), near (the pointer inspects it)
 *   [i·4 + 3]  vis (callout shown), flash (the re-measure passing), ti (acquired at), 0
 *
 * All in the medium's device pixels. Every pixel used to work all twelve out
 * for itself: ~6 ms of a weak GPU's frame for numbers that are the same at
 * every pixel. The sums are the shader's own, line for line (medium-kit.ts
 * `px`, readout.ts `after`, `readoutW`).
 */

import type { Vector2, Vector4 } from "three/webgpu";

export const MARK_COUNT = 12;

/** The medium's uniforms the marks are made from (uniforms.ts `medium`), as numbers. */
export interface MarksInput {
  /** The medium's target, device px. */
  w: number;
  h: number;
  /** The globe's centre and the iris's, UV. */
  eye: Vector2;
  pupil: Vector2;
  /** Iris radius and the lids' reach, shares of the height (apX: medial, lateral; apY: upper, lower). */
  irisR: number;
  apX: Vector2;
  apY: Vector2;
  since: number;
  steady: number;
  dep: number;
  arr: number;
  idle: number;
  listen: number;
  track: number;
  hover: number;
  /** The pointer, UV. */
  ptr: Vector2;
  /**
   * The brow's three landmarks where the brow really is this frame (its bone
   * chain, rig/brow.ts), device px, in BROW_MARK_X's order; without them the
   * marks keep their fixed offsets.
   */
  brow?: { x: number; y: number }[];
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const after = (t: number, a: number, d: number) => clamp((t - a) / d, 0, 1);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The twelve points: on a lid (fx across the opening, −1 medial … 1 lateral)
 * or fixed in iris radii from the globe's centre; their confidence radius in
 * R; whether minor (its callout only where the eye is big enough for
 * callouts not to collide); its leader's way.
 */
const MARKS: { lid?: [number, boolean]; fixed?: [number, number]; rc: number; minor: boolean; sx: number; sy: number }[] = [
  { lid: [-1, true], rc: 0.5, minor: false, sx: -1, sy: -1 },
  { lid: [1, true], rc: 0.42, minor: false, sx: 1, sy: -1 },
  { lid: [-0.5, true], rc: 0.3, minor: true, sx: -1, sy: -1 },
  { lid: [0, true], rc: 0.36, minor: false, sx: 1, sy: -1 },
  { lid: [0.5, true], rc: 0.28, minor: true, sx: 1, sy: -1 },
  { lid: [-0.4, false], rc: 0.34, minor: true, sx: -1, sy: 1 },
  { lid: [0.45, false], rc: 0.4, minor: true, sx: 1, sy: 1 },
  { fixed: [0.1, -1.05], rc: 0.55, minor: true, sx: -1, sy: -1 },
  { fixed: [-1.3, -1.72], rc: 0.62, minor: true, sx: -1, sy: 1 },
  { fixed: [0.3, -1.86], rc: 0.7, minor: false, sx: 1, sy: 1 },
  { fixed: [1.9, -1.64], rc: 0.58, minor: true, sx: 1, sy: 1 },
  { fixed: [-0.2, 1.3], rc: 0.66, minor: false, sx: 1, sy: 1 },
];

/** The brow's landmarks (marks 8, 9, 10: inner, arch, tail), and where across the eye each sits, in iris radii. */
const BROW_MARKS = [8, 9, 10];
export const BROW_MARK_X = BROW_MARKS.map((i) => MARKS[i].fixed![0]);

/** Writes the marks into `out` (48 vec4s: uniforms.ts `medium.marks.array`). */
export function measuredMarks(m: MarksInput, out: Vector4[]) {
  const { w, h: H } = m;
  const kc = Math.max((m.irisR * H) / 245, 0.2);
  const px = (n: number) => Math.max(kc * n, 2);
  const th = Math.max(kc * 20, H * 0.0155);
  const R = m.irisR * H;
  const ex = m.eye.x * w;
  const ey = m.eye.y * H;
  const pcx = m.pupil.x * w;
  const pcy = m.pupil.y * H;
  const awM = m.apX.x * H;
  const awL = m.apX.y * H;
  const upY = m.apY.x * H;
  const loY = m.apY.y * H;
  const t = Math.max(m.since, m.steady * 100);
  const gone = (1 - m.dep * m.dep) * smoothstep(0.3, 0.9, m.arr);
  const live = 1 - m.steady;
  // the re-measure: still for 1.5 s, a line sweeps down the frame, then every 6 s
  const ph = Math.max(m.idle - 1.5, 0) % 6;
  const sy = (ph / 1.6) * H;
  const sweeping = (m.idle >= 1.5 ? 1 : 0) * (ph <= 1.6 ? 1 : 0) * live * gone;
  // the trackers are sure when nothing moves, and less sure the more it does
  const doubt = (1 + m.listen * 1.6) * mix(1, 0.75, smoothstep(1.5, 3, m.idle));
  const roomy = smoothstep(5.5, 7, R / th);
  const L1 = Math.max(R * 0.24, px(12));
  const lw = th * (56 / 128) * 16;
  const cm = px(22);
  const ppx = m.ptr.x * w;
  const ppy = m.ptr.y * H;
  MARKS.forEach((k, i) => {
    let qx: number;
    let qy: number;
    if (k.lid) {
      const [fx, upper] = k.lid;
      const sx = Math.pow(Math.max(1 - fx * fx, 0), 0.75);
      qx = ex + (fx < 0 ? awM : awL) * fx;
      qy = upper ? ey - upY * sx : ey + loY * sx;
    } else if (m.brow && BROW_MARKS.includes(i)) {
      // (the brow's own points: they rise, knit and fall with it, C4)
      const b = m.brow[BROW_MARKS.indexOf(i)];
      qx = b.x;
      qy = b.y;
    } else {
      const [x, y] = k.fixed!;
      qx = ex + R * x;
      qy = ey + R * y;
    }
    const ti = 0.35 + Math.hypot(qx - pcx, qy - pcy) / (R * 3.4);
    const on = after(t, ti, 0.12) * gone;
    // pointed at, a point is inspected: acquired again, its circle tight, its callout shown and bright
    const near = (1 - smoothstep(R * 0.12, R * 0.4, Math.hypot(ppx - qx, ppy - qy))) * m.track * (1 - m.hover);
    const sq = mix(mix(px(14), px(4), easeOutCubic(after(t, ti, 0.3))), px(6), near);
    const flash = (1 - smoothstep(0, R * 0.25, Math.abs(qy - sy))) * sweeping;
    const ring = R * k.rc * easeOutCubic(after(t, ti, 0.4)) * doubt * (1 - flash * 0.3 - near * 0.55);
    const vis = Math.max(k.minor ? roomy : 1, near);
    // (a callout that would leave the frame turns back in)
    const run0 = L1 * 0.7071 + lw + px(12);
    const hx = qx + run0 * k.sx < cm || qx + run0 * k.sx > w - cm ? -k.sx : k.sx;
    const reachY = qy + (L1 * 0.7071 + th) * k.sy;
    const vy = reachY < cm || reachY > H - cm ? -k.sy : k.sy;
    const e1x = qx + hx * L1 * 0.7071;
    const e1y = qy + vy * L1 * 0.7071;
    const e2x = e1x + (lw + px(8)) * hx;
    out[i * 4].set(qx, qy, ring, sq);
    out[i * 4 + 1].set(e1x, e1y, e2x, e1y);
    out[i * 4 + 2].set(Math.min(e1x, e2x) + px(4), e1y - th * 0.8, on, near);
    out[i * 4 + 3].set(vis, flash, ti, 0);
  });
}
