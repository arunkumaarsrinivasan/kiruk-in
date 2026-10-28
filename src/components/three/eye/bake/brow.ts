/**
 * The brow and the skin's fine hair, drawn once by canvas 2D and laid on the
 * skin by the lid shader (lid-mesh.ts) in face space, mm.
 *
 * A brow is hairs lying almost flat on the skin, so it is drawn on the skin
 * rather than built: it follows every fold the lid mesh makes, costs a
 * texture read, and runs the same on WebGL2. Each hair is a tapered, slightly
 * bent stroke; its direction goes into red and green (for the shader's sheen
 * along it) and its coverage into alpha.
 *
 * The flow is a real brow's: the head's hairs stand up, the body's lower
 * hairs run up and out while its upper ones run out and down, so the two meet
 * along a ridge (the herringbone), and the tail's run out and down. The edges
 * are feathered: hairs thin out toward them rather than stopping on a line.
 *
 * R10, against the user's brow (docs/era-pov/r10): hairs lie almost flat
 * and long (a brow hair grows ~0.15 mm a day for 1–2 months: 5–9 mm), in
 * overlapping layers with skin showing between them, curving along the
 * flow; the head stays short and only a few hairs stand up (a block of
 * uprights reads as a square head). No strays, and the edge hairs are short
 * and lie along the brow (the user, 2026-10-28: remove the extra hair). Each
 * hair's blue channel runs root 0 → tip 1, so the shader can brown its tips.
 *
 * The fine hair (vellus) is a small tile of faint, short hairs, mostly
 * running down and out, repeated across the face.
 */

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping } from "three/webgpu";
import { browAt } from "../brow-shape";
import { eyeEnv } from "../env";

/** Where the brow's map sits on the face, mm (x lateral +, y up). */
export const BROW_BOUNDS = { x0: -15.5, y0: 4.4, w: 38, h: 13.5 } as const;
/** The fine hair's tile, mm on a side. */
export const VELLUS_TILE_MM = 6;

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;

// The hairs are drawn on the brow's curve (brow-shape.ts); the move-net
// moves the same curve, so the two cannot drift apart.
export { BROW_SHAPE } from "../brow-shape";

/** The flow: which way a hair at (u, v across, 0 lower edge … 1 upper) runs, radians from lateral. */
function flowAt(u: number, v: number) {
  const head = mixN(1.35, 0.95, u / 0.16);
  // (the two flows meet gently, over most of the brow's depth: turned 0.6 rad
  // apart across a narrow band they caught the light apart and the brow read
  // as two strips with a parting, the user 2026-10-29: "separated")
  const lower = mixN(0.42, 0.18, u);
  const upper = mixN(0.04, -0.24, u);
  const body = mixN(lower, upper, smooth(0.2, 0.85, v));
  const tail = -0.32 - 0.35 * smooth(0.72, 1, u);
  return mixN(mixN(head, body, smooth(0.08, 0.2, u)), tail, smooth(0.66, 0.84, u));
}

/**
 * One hair as a filled, tapered, bent stroke. With `along`, each segment
 * carries its own direction (red, green) and how far along the hair it is
 * (blue, root 0 → tip 1); without, one fill and blue at 0.5.
 */
function hair(
  ctx: CanvasRenderingContext2D,
  toPx: (x: number, y: number) => [number, number],
  x: number,
  y: number,
  angle: number,
  len: number,
  width: number,
  bend: number,
  alpha: number,
  along = false,
  taper = 0.6,
) {
  const n = 8;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const dirs: number[] = [];
  let px = x;
  let py = y;
  let a = angle;
  const step = len / n;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = (width / 2) * Math.pow(1 - t, taper) + 0.004;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    left.push(toPx(px + nx * w, py + ny * w));
    right.push(toPx(px - nx * w, py - ny * w));
    dirs.push(a);
    px += Math.cos(a) * step;
    py += Math.sin(a) * step;
    a += bend / n;
  }
  const rg = (d: number) => [Math.round((Math.cos(d) * 0.5 + 0.5) * 255), Math.round((Math.sin(d) * 0.5 + 0.5) * 255)];
  if (along) {
    for (let i = 0; i < n; i++) {
      const [r, g] = rg((dirs[i] + dirs[i + 1]) / 2);
      ctx.fillStyle = `rgba(${r},${g},${Math.round(((i + 0.5) / n) * 255)},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(...left[i]);
      ctx.lineTo(...left[i + 1]);
      ctx.lineTo(...right[i + 1]);
      ctx.lineTo(...right[i]);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }
  // direction into red and green, coverage into alpha
  const [r, g] = rg(angle + bend / 2);
  ctx.fillStyle = `rgba(${r},${g},128,${alpha})`;
  ctx.beginPath();
  ctx.moveTo(...left[0]);
  for (const p of left.slice(1)) ctx.lineTo(...p);
  for (const p of right.reverse()) ctx.lineTo(...p);
  ctx.closePath();
  ctx.fill();
}

export interface BrowBake {
  brow: CanvasTexture;
  vellus: CanvasTexture;
  dispose: () => void;
}

/**
 * @param hairs how many brow hairs (the tier's budget)
 * @param res the brow map's width, px (its height follows the bounds)
 */
export function bakeBrow(hairs: number, res: number, seed = 0xb20f): BrowBake {
  const rand = rng(seed);
  const B = BROW_BOUNDS;
  const W = res;
  const H = Math.round((res * B.h) / B.w);
  const pxPerMm = W / B.w;
  const canvas = eyeEnv().canvas(W, H);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, W, H);
  // canvas y runs down; the texture is uploaded flipped, so draw y up
  const toPx = (x: number, y: number): [number, number] => [(x - B.x0) * pxPerMm, H - (y - B.y0) * pxPerMm];

  // (a little lighter, the user 2026-10-29: "too thick"; ×0.86 of the tier's budget)
  const target = Math.round(hairs * 0.86);
  let placed = 0;
  for (let tries = 0; placed < target && tries < hairs * 8; tries++) {
    // more hairs where the brow is deeper, and fewer at its feathered edges
    const u = rand();
    const v = rand();
    const at = browAt(u);
    const keep =
      (at.depth / 4.3) *
      smooth(0, 0.035, u) *
      (1 - smooth(0.93, 1, u)) *
      // a real brow (2026-10-29): the head sparse, skin showing between its
      // hairs; the lower border defined, the densest line; the upper border
      // feathering off over its top third
      // (0.85 at the head, 2026-10-29: at 0.45 with short, thin hairs the
      // brow's start read nearly bare, the user)
      (0.85 + 0.15 * smooth(0.04, 0.2, u)) *
      // (softer than a line: at 0.6 + 0.08 the lower hairs ended on a hard edge over lit skin)
      (0.5 + 0.5 * smooth(0, 0.14, v)) *
      (0.1 + 0.9 * (1 - smooth(0.6, 1, v)));
    if (rand() > keep) continue;
    placed++;
    // (no strays: the user found the hairs wandering off the edges extra)
    const vv = v;
    // the edges: shorter hairs lying along the brow, so none pokes out of it
    const rim = 1 - smooth(0, 0.18, Math.min(v, 1 - v));
    const x = at.x + (rand() - 0.5) * 0.5;
    const y = at.lower + vv * at.depth + (rand() - 0.5) * 0.3;
    // (flatter in the body than before: the hairs lie almost along the skin)
    const angle = (flowAt(u, vv) * mixN(1, 0.8, smooth(0.15, 0.3, u)) + (rand() - 0.5) * 0.3) * (1 - 0.35 * rim * smooth(0.15, 0.3, u));
    // short at the head, long and lying flat in the body, a little shorter in the tail
    // (the head's hairs shorter, 2.3 mm: at 2.6 they fanned up as long pen
    // strokes; at 1.6 the start read bare, 2026-10-29)
    const len = mixN(mixN(2.3, 6.2, smooth(0.04, 0.3, u)), 4.8, smooth(0.72, 1, u)) * (0.7 + rand() * 0.5) * (1 - 0.35 * rim);
    // each hair curves along the flow, toward the brow's ridge
    const bend = (vv < 0.5 ? -1 : 1) * (0.18 + rand() * 0.3) * Math.sign(Math.cos(angle) + 0.01);
    // (~60–90 µm, tapering to a point; at 50–80 the brow averaged away to a
    // haze at the loader's framing)
    // (denser and thicker, as the user's brow: a thick, dark mass of hair)
    const width = (0.07 + rand() * 0.035) * (0.88 + 0.12 * smooth(0.04, 0.22, u));
    // the feathered edges are the finest, palest hairs
    const edge = Math.min(vv, 1 - vv, u * 3, (1 - u) * 4);
    hair(ctx, toPx, x, y, angle, len, width * (0.75 + 0.25 * smooth(0, 0.25, edge)), bend, 0.75 + 0.25 * smooth(0, 0.3, edge), true, 0.9);
  }

  const brow = new CanvasTexture(canvas as HTMLCanvasElement);
  brow.minFilter = LinearMipmapLinearFilter;
  brow.magFilter = LinearFilter;
  brow.generateMipmaps = true;
  brow.anisotropy = 4;

  // the fine hair: a small tile, faint, short, mostly down and out
  const V = 512;
  const vc = eyeEnv().canvas(V, V);
  const vctx = vc.getContext("2d") as CanvasRenderingContext2D;
  const vPx = V / VELLUS_TILE_MM;
  for (let i = 0; i < 900; i++) {
    const x = rand() * VELLUS_TILE_MM;
    const y = rand() * VELLUS_TILE_MM;
    const angle = -1.15 + (rand() - 0.5) * 0.9;
    const len = 0.35 + rand() * 0.9;
    const bend = (rand() - 0.5) * 0.4;
    const alpha = 0.5 + rand() * 0.5;
    // drawn again a tile over, so a hair crossing the tile's edge wraps
    for (const [ox, oy] of [
      [0, 0],
      [-VELLUS_TILE_MM, 0],
      [0, VELLUS_TILE_MM],
      [-VELLUS_TILE_MM, VELLUS_TILE_MM],
    ]) {
      hair(vctx, (hx, hy) => [(hx + ox) * vPx, V - (hy + oy) * vPx], x, y, angle, len, 0.022, bend, alpha);
    }
  }
  const vellus = new CanvasTexture(vc as HTMLCanvasElement);
  vellus.wrapS = RepeatWrapping;
  vellus.wrapT = RepeatWrapping;
  vellus.minFilter = LinearMipmapLinearFilter;
  vellus.magFilter = LinearFilter;
  vellus.generateMipmaps = true;

  return {
    brow,
    vellus,
    dispose() {
      brow.dispose();
      vellus.dispose();
    },
  };
}
