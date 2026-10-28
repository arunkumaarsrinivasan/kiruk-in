/**
 * The brow's move-net on the CPU: the same sums as nodes/brow-net.ts, so a
 * test can sweep every feeling over the face and prove the skin never folds
 * over itself or tears (the Jacobian of the move stays positive and bounded).
 * Change one, change both (C4).
 */

import { BROW_NODES, BROW_NODE_U, BROW_SHAPE, browAt } from "../brow-shape";

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * How far the skin at face point (x, y) moves, mm: (dx, dy, toward the
 * camera), for a bone chain `chain` (rig/brow.ts `out`: 40 floats).
 */
export function browMoveAt(x: number, y: number, chain: ArrayLike<number>): [number, number, number] {
  const S = BROW_SHAPE;
  const u = clamp((x - S.x0) / S.span, 0, 1);
  const { lower, depth } = browAt(u);
  const top = lower + depth;
  const below = smoothstep(-5.6, -0.3, y - lower);
  const above = (1 - 0.85 * smoothstep(0, 22, y - top)) * (1 - smoothstep(22, 30, y - top));
  const ends = smoothstep(-7, -0.4, x - S.x0) * (1 - smoothstep(0.5, 4.2, x - (S.x0 + S.span)));
  const mask = below * above * ends;

  let k = 0;
  while (k < BROW_NODES - 2 && u >= BROW_NODE_U[k + 1]) k++;
  const a = BROW_NODE_U[k];
  const L = BROW_NODE_U[k + 1] - a;
  const t = clamp((u - a) / L, 0, 1);
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const at = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    const p0 = chain[k * 4 + c];
    const p1 = chain[(k + 1) * 4 + c];
    const m0 = chain[(BROW_NODES + k) * 4 + c] * L;
    const m1 = chain[(BROW_NODES + k + 1) * 4 + c] * L;
    at[c] = p0 * h00 + m0 * h10 + p1 * h01 + m1 * h11;
  }
  const hMid = y - (lower + depth / 2);
  const r = (y - lower + 2.2) / 1.6;
  const roll = Math.max(-at[1], 0) * 0.45 * Math.exp(-r * r);
  return [(at[0] - at[2] * hMid) * mask, at[1] * mask, (at[3] + roll) * mask];
}

/** The lid mesh's guard: the lid's own skin, within ~5 mm of the margin (`d`), stays with the lid (lid-mesh.ts). */
export const marginGuard = (d: number) => smoothstep(0.8, 5, d);
