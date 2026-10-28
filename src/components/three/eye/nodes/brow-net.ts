/**
 * The brow's move-net: a bone chain laid on the skin.
 *
 * The brow is five nodes on the curve the hairs are drawn on (brow-shape.ts):
 * head, inner, arch, outer, tail, joined by four bones. The rig
 * (rig/brow.ts) works out, once a frame on the CPU, where each node goes
 * (its move, its bones' turn, how far it bunches toward the camera) and the
 * curve's tangents there; here a Hermite curve runs through them, so each
 * node's own shape reads instead of being averaged with its neighbours. The
 * lid mesh already rides with the eye; the net does not slide or scale that
 * skin, it reshapes it, and every station moves its whole thickness, so the
 * brow gets a new shape and not a thicker one. A bone's turn shears the
 * hairs above the curve, so a dropping tail tilts them.
 *
 * The hairs are sampled on the curve before this move, so they stay on the
 * nodes. A decal slid across the skin reads as a separate brow zooming.
 */

import { BROW_NODES, BROW_NODE_U, BROW_SHAPE } from "../brow-shape";
import type { EyeUniforms } from "../uniforms";
import type { N } from "./tsl";
import { T } from "./tsl";

const { Fn, clamp, exp, float, max, min, mix, pow, select, sin, smoothstep, vec3, vec4 } = T;

const layout = (name: string, type: string, inputs: [string, string][]) => ({
  name,
  type,
  inputs: inputs.map(([n, t]) => ({ name: n, type: t })),
});

/** Lower edge of the curve at u (0 head … 1 tail), mm. Matches brow-shape.ts. */
function browLower(u: N): N {
  const S = BROW_SHAPE;
  const t = min(u.div(S.riseEnd), float(1));
  const rise = float(S.rise).mul(sin(t.mul(Math.PI / 2)));
  const f = clamp(u.sub(S.riseEnd).div(1 - S.riseEnd), 0, 1);
  // pow(0, 1.5) is NaN on some GPUs; the curve is 0 there anyway
  return float(S.lower0).add(rise).sub(float(S.fall).mul(pow(max(f, float(1e-4)), S.fallPow)));
}

/** How deep the brow is at u, mm. */
function browDepth(u: N): N {
  const S = BROW_SHAPE;
  const head = mix(float(S.depth0), float(S.depth1), smoothstep(0, S.depthAt, u));
  const tail = mix(float(S.tail0), float(S.tail1), smoothstep(S.tailAt0, S.tailAt1, u));
  return head.mul(tail);
}

/** The brow's lower edge and depth at face x (mm), for the skin's expression folds (lid-mesh.ts). */
export function browEdges(x: N): { lower: N; depth: N } {
  const S = BROW_SHAPE;
  const u = clamp(x.sub(S.x0).div(S.span), 0, 1);
  return { lower: browLower(u), depth: browDepth(u) };
}

/** Cubic Hermite between two nodes' (dx, dy, turn, bulge), tangents already scaled by the segment's length. */
function hermite(t: N, p0: N, p1: N, m0: N, m1: N): N {
  const t2 = t.mul(t);
  const t3 = t2.mul(t);
  const h00 = t3.mul(2).sub(t2.mul(3)).add(1);
  const h10 = t3.sub(t2.mul(2)).add(t);
  const h01 = t3.mul(-2).add(t2.mul(3));
  const h11 = t3.sub(t2);
  return p0.mul(h00).add(m0.mul(h10)).add(p1.mul(h01)).add(m1.mul(h11));
}

/** The node and tangent parameters' names: the chain is passed in, not read inside (see browMoveNet). */
const NODE_ARGS = Array.from({ length: BROW_NODES * 2 }, (_, k) => (k < BROW_NODES ? `n${k}` : `t${k - BROW_NODES}`));

const browMoveNetFn = Fn(([xy, ...chain]: N[]) => {
  const S = BROW_SHAPE;
  const x = xy.x;
  const y = xy.y;
  const u = clamp(x.sub(S.x0).div(S.span), 0, 1);
  const lower = browLower(u);
  const depth = browDepth(u);
  const top = lower.add(depth);
  // The whole hair design, an ease into the lid's hood below, and the
  // forehead above. The forehead is anchored at the hairline (the galea), so
  // it follows the brow fully at the brow and less and less toward the top:
  // a lift squeezes it evenly, which is where its furrows form (lid-mesh.ts).
  // (Over 3 mm, a lowered brow squashed the hood's skin into a hard shelf;
  // the lid mesh keeps the margin itself still. Over 4.5 it still squeezed the
  // hood to 0.33 once the brow sat 1 mm closer, 2026-10-29: 5.3 now.)
  const below = smoothstep(-5.6, -0.3, y.sub(lower));
  const above = float(1).sub(smoothstep(0, 22, y.sub(top)).mul(0.85)).mul(float(1).sub(smoothstep(22, 30, y.sub(top))));
  // (toward the nose the glabella goes with the head, as the procerus pulls
  // it; over 3 mm the dropped head sheared against still skin in a hard edge)
  const ends = smoothstep(-7, -0.4, x.sub(S.x0)).mul(float(1).sub(smoothstep(0.5, 4.2, x.sub(S.x0 + S.span))));
  const mask = below.mul(above).mul(ends);

  // the chain at u: one Hermite segment between each pair of nodes
  const at = vec4(0).toVar();
  for (let k = 0; k < BROW_NODES - 1; k++) {
    const a = BROW_NODE_U[k];
    const b = BROW_NODE_U[k + 1];
    const L = b - a;
    const t = clamp(u.sub(a).div(L), 0, 1);
    const inSeg = k === BROW_NODES - 2 ? select(u.greaterThanEqual(a), float(1), float(0)) : select(u.greaterThanEqual(a).and(u.lessThan(b)), float(1), float(0));
    const seg = hermite(t, chain[k], chain[k + 1], chain[BROW_NODES + k].mul(L), chain[BROW_NODES + k + 1].mul(L));
    at.addAssign(seg.mul(inSeg));
  }
  // a bone's turn about the brow's midline shears what stands above and below it
  const h = y.sub(lower.add(depth.mul(0.5)));
  // a lowered brow pushes the hood's skin together, and it rolls forward over the crease
  const r = y.sub(lower).add(2.2).div(1.6);
  const roll = max(at.y.negate(), float(0)).mul(0.45).mul(exp(r.mul(r).negate()));
  return vec3(at.x.sub(at.z.mul(h)), at.y, at.w.add(roll)).mul(mask);
}).setLayout(layout("browMoveNet", "vec3", [["xy", "vec2"], ...NODE_ARGS.map((n): [string, string] => [n, "vec4"])]));

/**
 * The move-net at face point `xy`, mm: (dx, dy, toward the camera). Zero outside the brow.
 * The chain's uniform array is read here, in the caller's scope, and passed
 * in: read inside the function, WebGL2's GLSL never declared its buffer there.
 */
export function browMoveNet(xy: N, Ux: EyeUniforms): N {
  const U: N = Ux;
  const nodes = U.lids.browNodes;
  return browMoveNetFn(xy, ...NODE_ARGS.map((_, k) => nodes.element(k)));
}
