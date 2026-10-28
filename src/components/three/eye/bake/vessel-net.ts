/**
 * The white's vessels, grown once per person (R5), as a photograph of an eye
 * shows them (the user's own, docs/era-pov/ref/user-eye.webp): a few thick,
 * tortuous conjunctival vessels running in from the corners toward the
 * limbus, branching and thinning; deeper episcleral ones, straighter and
 * blurred by the tissue over them; and over the whole white a faint net of
 * capillaries like fine cracks. Densest nasally and toward the fornices,
 * none over the cornea, small loops at the limbus.
 *
 * Why grown and not noise: the noise ridges this replaces made a closed,
 * even net, and at ~14 texels per mm the fine vessels (0.02–0.05 mm) blurred
 * away, so the white read as flat paint. Grown on the CPU and drawn with
 * Canvas 2D into a map of the front hemisphere at ~54 px per mm (T2/T3),
 * each vessel is a line with its own width, taper and tortuosity.
 *
 * The map is azimuthal equidistant about the eye's axis: the angle θ from the
 * axis is the distance from the centre (90° at the edge), α the direction
 * round it (0 temporal on the +x side, π nasal, canvas y down). No seam, and
 * the visible white is nearly undistorted.
 *
 *   R  episcleral (deep, soft)   G  conjunctival (surface, sharp)
 *
 * Widths: the plan's R5 numbers (conjunctival 0.02–0.05 mm, episcleral
 * 0.06–0.12 mm, both still † unverified), with the trunks up to ~0.1 mm as
 * the user's photo shows them; none closer than ~0.5 mm to the limbus but
 * the arcades.
 */

import { ANATOMY } from "../anatomy";

/** The map spans this far from the eye's axis (radians) at its edge. */
export const NET_FOV = Math.PI / 2;

const R = ANATOMY.eyeballRadius;
/** The limbus's angle from the axis on the globe. */
const LIMBUS = Math.asin(ANATOMY.irisRadius / R);

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A small seeded generator (mulberry32): the same person grows the same vessels. */
function rng(seed: number) {
  let a = Math.floor(seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Walker {
  x: number;
  y: number;
  /** heading, radians in the map's plane */
  h: number;
  /** width, mm */
  w: number;
  /**
   * Tortuosity: the heading's curvature (rad/mm) wanders as a mean-reverting
   * random walk, kicked by `kick` and pulled back by `settle` per mm, so a
   * vessel squiggles irregularly. (A sine meander read as a drawn zigzag.)
   */
  bend: number;
  kick: number;
  settle: number;
  /** deep (episcleral) or on the surface */
  deep: boolean;
  /** how often it branches (per step) and how fast it thins (per step) */
  branch: number;
  taper: number;
}

/**
 * Draws one person's vessels into `ctx` (a `size`² canvas), black elsewhere.
 * Cost: a few thousand short strokes, ~10–30 ms once per person.
 */
export function drawVesselNet(ctx: Ctx, size: number, seed: number) {
  const rand = rng(seed + 0.37);
  const c = size / 2;
  const k = c / NET_FOV; // px per radian from the axis
  const mm = k / R; // px per mm on the globe
  const thetaOf = (x: number, y: number) => Math.hypot(x - c, y - c) / k;
  const inward = (x: number, y: number) => Math.atan2(c - y, c - x);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /** A stroke on the deep (R) or surface (G) channel; under a pixel wide, thinner reads as fainter. */
  const stroke = (pts: number[], wMm: number, deep: boolean, gain = 1) => {
    const px = wMm * mm;
    const a = Math.min(1, px) * gain;
    ctx.lineWidth = Math.max(px, 1);
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    if (deep) {
      // soft: a wide faint halo under a narrower core, as tissue blurs it
      ctx.strokeStyle = `rgba(255,0,0,${(a * 0.35).toFixed(3)})`;
      ctx.lineWidth = Math.max(px * 2.2, 1.5);
      ctx.stroke();
      ctx.lineWidth = Math.max(px, 1);
      ctx.strokeStyle = `rgba(255,0,0,${(a * 0.6).toFixed(3)})`;
    } else {
      ctx.strokeStyle = `rgba(0,255,0,${a.toFixed(3)})`;
    }
    ctx.stroke();
  };

  /** Grows one vessel and its branches from the fornix toward the limbus. */
  const grow = (start: Walker) => {
    const stack: Walker[] = [start];
    let budget = 900;
    while (stack.length && budget-- > 0) {
      const v = stack.pop()!;
      const pts: number[] = [v.x, v.y];
      const step = 0.12; // mm
      for (let i = 0; i < 400; i++) {
        // drift toward the limbus, wandering; the deep ones run straighter
        const toward = inward(v.x, v.y);
        let dh = toward - v.h;
        dh = Math.atan2(Math.sin(dh), Math.cos(dh));
        v.bend += (rand() - 0.5) * 2 * v.kick * Math.sqrt(step) - v.bend * v.settle * step;
        v.h += v.bend * step + dh * (v.deep ? 0.08 : 0.03);
        v.x += Math.cos(v.h) * step * mm;
        v.y += Math.sin(v.h) * step * mm;
        pts.push(v.x, v.y);
        v.w *= v.taper;
        const th = thetaOf(v.x, v.y);
        if (th < LIMBUS + (v.deep ? 0.22 : 0.05) || v.w < 0.012 || th > NET_FOV) break;
        // a branch now and then, thinner, turning off to one side
        if (rand() < v.branch && v.w > 0.022) {
          const turn = (rand() < 0.5 ? -1 : 1) * (0.45 + rand() * 0.6);
          stack.push({ ...v, h: v.h + turn, w: v.w * 0.55, bend: 0, kick: v.kick * 0.8, branch: 0.02, taper: 0.993 });
          v.w *= 0.92;
        }
        // draw in pieces as it tapers, so the width follows it
        if (pts.length >= 24) {
          stroke(pts, v.w, v.deep);
          pts.splice(0, pts.length - 2);
        }
      }
      if (pts.length >= 4) stroke(pts, v.w, v.deep);
    }
  };

  // Where the trunks come in from: mostly the corners, nasal most (the white
  // the lids leave open is there, and it is the redder side in every eye).
  const pickAlpha = () => {
    for (;;) {
      const a = rand() * Math.PI * 2;
      const nasal = Math.max(0, -Math.cos(a));
      const temporal = Math.max(0, Math.cos(a));
      const p = 0.18 + 0.82 * Math.pow(nasal, 3) + 0.5 * Math.pow(temporal, 3);
      if (rand() < p) return a;
    }
  };
  const at = (theta: number, alpha: number) => [c + k * theta * Math.cos(alpha), c - k * theta * Math.sin(alpha)];

  // conjunctival trunks: tortuous, ~0.05–0.1 mm, one of them a big squiggle near the plica
  // (11: at 16, branching freely, the nasal white read bloodshot)
  for (let i = 0; i < 11; i++) {
    // (the first is the big squiggle: on the upper nasal white, in view, as in the photo)
    const a = i === 0 ? Math.PI - 0.22 : pickAlpha();
    const [x, y] = at(i === 0 ? 1.0 : 1.18 + rand() * 0.25, a);
    const big = i === 0;
    grow({
      x,
      y,
      h: inward(x, y) + (rand() - 0.5) * 0.9,
      w: big ? 0.12 : 0.045 + rand() * 0.045,
      bend: 0,
      kick: big ? 30 : 7 + rand() * 7,
      settle: big ? 14 : 5,
      deep: false,
      // (the big one holds its width to the limbus, branching rarely)
      branch: big ? 0.006 : 0.018,
      taper: big ? 0.997 : 0.993,
    });
  }
  // episcleral: fewer, straighter, wider, deeper
  for (let i = 0; i < 9; i++) {
    const a = pickAlpha();
    const [x, y] = at(1.25 + rand() * 0.2, a);
    grow({ x, y, h: inward(x, y), w: 0.1 + rand() * 0.06, bend: 0, kick: 1.6, settle: 2, deep: true, branch: 0.012, taper: 0.996 });
  }

  // the capillary net: faint, broken polygons over the white, like fine cracks
  const cell = 1.05; // mm
  const n = Math.ceil((NET_FOV * R) / cell);
  const jit = (i: number, j: number) => {
    const h = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    const g = Math.sin(i * 269.5 + j * 183.3 + seed * 21.3) * 43758.5453;
    return [c + (i + (h - Math.floor(h)) * 0.8 - 0.4) * cell * mm, c + (j + (g - Math.floor(g)) * 0.8 - 0.4) * cell * mm];
  };
  const wiggle = (x0: number, y0: number, x1: number, y1: number) => {
    const pts = [x0, y0];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const amp = (rand() - 0.5) * 0.18 * len;
    for (let t = 1; t <= 4; t++) {
      const f = t / 4;
      const s = Math.sin(f * Math.PI) * amp + (rand() - 0.5) * 0.05 * len;
      pts.push(x0 + dx * f - (dy / len) * s, y0 + dy * f + (dx / len) * s);
    }
    return pts;
  };
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const [x0, y0] = jit(i, j);
      const th = thetaOf(x0, y0);
      if (th < LIMBUS + 0.06 || th > NET_FOV * 0.97) continue;
      // more of it toward the corners and the fornices
      const a = Math.atan2(c - y0, x0 - c);
      const dense = 0.3 + 0.35 * Math.pow(Math.abs(Math.cos(a)), 2) + 0.3 * Math.min(1, (th - LIMBUS) / 0.7);
      for (const [di, dj] of [
        [1, 0],
        [0, 1],
        [1, 1],
      ] as const) {
        if (rand() > dense * (di && dj ? 0.35 : 0.6)) continue;
        const [x1, y1] = jit(i + di, j + dj);
        stroke(wiggle(x0, y0, x1, y1), 0.014 + rand() * 0.01, false, 0.35 + rand() * 0.25);
      }
    }
  }

  // limbal arcades: small loops just outside the limbus, where the vessels turn back
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const th = LIMBUS + 0.035 + rand() * 0.05;
    const span = 0.04 + rand() * 0.05;
    const pts: number[] = [];
    for (let t = 0; t <= 6; t++) {
      const f = t / 6;
      const [x, y] = at(th + Math.sin(f * Math.PI) * 0.03, a + (f - 0.5) * span);
      pts.push(x, y);
    }
    stroke(pts, 0.015, false, 0.5);
  }
  ctx.globalCompositeOperation = "source-over";
}
