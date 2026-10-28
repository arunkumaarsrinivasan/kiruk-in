/**
 * The brow's curve, shared by the bake that draws its hairs (bake/brow.ts),
 * the move-net that reshapes the skin under them (nodes/brow-net.ts) and the
 * rig that decides how (rig/brow.ts). u runs 0 at the head to 1 at the tail.
 * Face space, mm: x lateral +, y up, the globe's centre at the origin.
 *
 * No three.js here, so the rig and its tests can use it.
 */

export const BROW_SHAPE = {
  x0: -13.6,
  span: 31.4,
  // (7.2, the user 2026-10-29: the brow a little closer to the eye, so the
  // whole brow fits a frame where the eye is larger)
  // (7.9, later the same day: at 7.2 the brow touched the upper lid's hood)
  lower0: 7.9,
  rise: 1.1,
  riseEnd: 0.66,
  // (1.5, 2026-10-29: a tail 1.5 mm under the head is a drooping, older brow;
  // a young tail ends level with the head or a touch under it)
  fall: 1.5,
  fallPow: 1.5,
  // (R10, the user's call 2026-10-28: ~4.5 mm, between ours at ~3 and theirs
  // at ≥ 7 on their photo; the lower edge stays, the brow grows up. Then a
  // touch narrower, ~4.1 mm, at their second look)
  depth0: 4.4,
  depth1: 3.9,
  depthAt: 0.45,
  tail0: 1,
  tail1: 0.32,
  tailAt0: 0.6,
  tailAt1: 1,
} as const;

/** The bone chain's nodes along the curve: head, inner, arch, outer, tail. The arch sits where the frontalis peaks. */
export const BROW_NODE_U = [0, 0.22, 0.42, 0.7, 1] as const;
export const BROW_NODES = BROW_NODE_U.length;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;

/** The brow along u (0 head … 1 tail): x, its lower edge, and how deep it is, mm. */
export function browAt(u: number) {
  const S = BROW_SHAPE;
  const x = S.x0 + S.span * u;
  const rise = S.rise * Math.sin((Math.PI / 2) * Math.min(u / S.riseEnd, 1));
  const fu = u > S.riseEnd ? (u - S.riseEnd) / (1 - S.riseEnd) : 0;
  const fall = S.fall * Math.pow(fu, S.fallPow);
  const lower = S.lower0 + rise - fall;
  const depth = mixN(S.depth0, S.depth1, smooth(0, S.depthAt, u)) * mixN(S.tail0, S.tail1, smooth(S.tailAt0, S.tailAt1, u));
  return { x, lower, depth };
}
