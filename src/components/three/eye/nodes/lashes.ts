/**
 * The lashes: one instanced ribbon per strand, rooted on the lid's skin in the
 * vertex stage (lid-mesh.ts `skinAt`), so they ride every blink, gaze and
 * squint the lids do, with nothing re-uploaded.
 *
 * What each strand is (its place along the margin, its row, length, lean,
 * fan and clump) is baked once per load from a seed (`bakeLashes`). What the
 * person is (how dense, how long, how curled, how clumped, mascara, colour)
 * are uniforms, so an era change is a few writes: a strand the person
 * doesn't have collapses to nothing.
 *
 * A strand is a circular arc: it leaves the skin leaning forward and outward,
 * fans toward its own end of the lid, and curls a little more along its
 * length, plus however far it lags behind a moving lid. It is drawn as a
 * ribbon facing the camera, never thinner than a pixel; a strand that is
 * truly thinner keeps its coverage as transparency instead, so it neither
 * vanishes nor turns into a picket fence.
 *
 * Shading is Kajiya–Kay: hair has a tangent, not a normal. Diffuse from how
 * square the strand is to the screen's light, and two shifted lobes along it
 * (Marschner's R and TRT): a white, wet highlight toward the root in the
 * screen's colour, and a warm one toward the tip in the hair's.
 *
 * R9, against the user's eye (docs/BATCH_B_LASHES_SKIN_LIDS_CARD.md): no two
 * strands alike. Lengths spread ±30 % with a few short new ones, curls vary,
 * strands wander a little and cross, clumps meet in spikes, every lower lash
 * curls, the lower ones are finer with lighter brown tips, and each strand
 * has a root bulb and a fine tip. (An even comb of straight strands read as
 * drawn, upper and lower.)
 */

import {
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  type RenderTarget,
} from "three/webgpu";
import type { EyeUniforms } from "../uniforms";
import { smoothstepDown, type N } from "./common";
import { screenKey } from "./light";
import { lidColumn, outwardAt, skinAt } from "./lid-mesh";
import { T } from "./tsl";

const {
  Fn,
  abs,
  attribute,
  cameraPosition,
  clamp,
  cos,
  cross,
  dot,
  float,
  max,
  min,
  mix,
  mrt,
  normalize,
  positionWorld,
  pow,
  select,
  sin,
  sqrt,
  uv,
  varyingProperty,
  vec3,
  vec4,
} = T;

/** Segments along a strand. */
const SEGMENTS = 10;
/**
 * Base lengths, mm, before the person's length: upper lashes are 8–12 mm,
 * lower ones 6–8, but the lower ones grow down and away from the camera and
 * show much less of themselves.
 */
// (8 with the visible tips read too tall, abnormal: the user, 2026-10-29)
// (6.4, 2026-10-29: with the brow 1 mm closer, 6.9 reached it on an up-look)
const UPPER_MM = 6.4;
// (5–5.5 mm measured, all curly: the curl shortens what shows)
// (3.6, 2026-10-29: at 4.8 with an even spread the lower row hung like a
// curtain, a doll's fringe; a real lower row is short, uneven, gappy)
const LOWER_MM = 3.6;

/* ---- the bake: what each strand is ------------------------------------- */

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

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Where along a margin the strands grow, -1 (inner corner) to +1 (outer):
 * none by the punctum, densest over the outer third, thinning at the corner.
 */
// (none over the last stretch to the inner canthus, medial of the punctum: lashes
// there ran past the corner's join, 2026-10-29)
const densityUpper = (s: number) => smooth(-0.8, -0.55, s) * (0.6 + 0.4 * smooth(-0.2, 0.5, s)) * (1 - smooth(0.8, 0.95, s));
const densityLower = (s: number) => smooth(-0.78, -0.45, s) * (0.55 + 0.45 * smooth(-0.1, 0.5, s)) * (1 - smooth(0.78, 0.93, s));

/** Stratified positions under a density, so strands never bunch by chance alone. */
function placeAlong(n: number, density: (s: number) => number, rand: () => number) {
  const steps = 512;
  const cdf = [0];
  for (let i = 1; i <= steps; i++) {
    const s = -1 + (2 * (i - 0.5)) / steps;
    cdf.push(cdf[i - 1] + density(s));
  }
  const total = cdf[steps];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const target = ((i + rand()) / n) * total;
    let j = 1;
    while (j < steps && cdf[j] < target) j++;
    const f = (target - cdf[j - 1]) / Math.max(cdf[j] - cdf[j - 1], 1e-6);
    out.push(-1 + (2 * (j - 1 + f)) / steps);
  }
  return out;
}

export interface LashBake {
  count: number;
  /** (s, root mm out from the margin's edge, upper 1 / lower 0, rank for density) */
  root: Float32Array;
  /** (length mm, lean rad, fan rad toward the outer corner, curl jitter) */
  shape: Float32Array;
  /** (the clump's lean, the clump's fan, width mm, a per-strand random) */
  clump: Float32Array;
  /** (wander amplitude, its phase, its waves along the strand, unused) */
  wave: Float32Array;
}

/**
 * Strands for one lid pair: `upper` and `lower` counts come from the tier.
 * Ranks are shuffled, so a person with fewer lashes loses them evenly.
 */
export function bakeLashes(upper: number, lower: number, seed: number): LashBake {
  const rand = rng(seed ^ 0x9e3779b9);
  const count = upper + lower;
  const root = new Float32Array(count * 4);
  const shape = new Float32Array(count * 4);
  const clump = new Float32Array(count * 4);
  const wave = new Float32Array(count * 4);
  let k = 0;
  for (const isUpper of [true, false]) {
    const n = isUpper ? upper : lower;
    if (n === 0) continue;
    const along = placeAlong(n, isUpper ? densityUpper : densityLower, rand);
    // clumps: runs of 3–6 neighbours share a lean and a fan their tips gather to
    let left = 0;
    let cLean = 0;
    let cFan = 0;
    const first = k;
    const clumpOf: number[] = [];
    let clumpId = -1;
    for (const s of along) {
      const row = Math.floor(rand() * (isUpper ? 3 : 2));
      // rows a tenth of a millimetre apart, right at the margin's front edge
      // (the lower ones closer still: they grow from the edge itself)
      const d = isUpper ? 0.05 + row * 0.1 + rand() * 0.04 : 0.16 + row * 0.08 + rand() * 0.05;
      const profile = isUpper
        ? 0.62 + 0.38 * Math.exp(-(((s - 0.35) / 0.55) ** 2))
        : 0.55 + 0.45 * Math.exp(-(((s - 0.4) / 0.5) ** 2));
      // the front row is the longest; no two alike (±30 %), and now and then a
      // short new one growing in (lashes cycle every few months)
      const young = rand() < 0.12 ? 0.35 + rand() * 0.25 : 1;
      // The anomalies a real fringe has (the user, 2026-10-29: "the same kind of
      // thing" everywhere): a few lashes cross their neighbours at odd angles,
      // a few are kinked, a few run long, now and then one droops.
      const odd = rand();
      const crosser = odd < 0.05;
      const kinked = odd >= 0.05 && odd < 0.1;
      const long = odd >= 0.1 && odd < 0.13;
      const droop = isUpper && odd >= 0.13 && odd < 0.16;
      // (the lower row spreads wider: many short, a few long, no even hem)
      const spread = isUpper ? 0.62 + rand() * 0.6 : 0.4 + rand() * rand() * 1.05;
      const len = (isUpper ? UPPER_MM : LOWER_MM) * profile * (1.06 - row * 0.08) * spread * young * (long ? 1.45 : 1);
      // how far from straight at the camera a strand leaves the margin, toward
      // its outward side: upper lashes start a little above level and curl
      // up, lower ones start already leaning down
      // (lower ones lean well down at once, so they read from the lid's edge
      // instead of first heading at the camera and showing only further out)
      const lean = (isUpper ? 0.15 + (rand() - 0.5) * 0.4 : 0.7 + (rand() - 0.5) * 0.7) + (droop ? 0.45 : 0);
      // strands fan toward their own end of the lid, but stay over the eye;
      // the lower row is unruly
      // (and some cross their neighbours)
      const fan = 0.3 * s * Math.sqrt(Math.abs(s)) + (rand() - 0.5) * (isUpper ? 0.42 : 0.9) + (crosser ? (rand() - 0.5) * 1.6 : 0);
      if (left <= 0) {
        left = isUpper ? 3 + Math.floor(rand() * 4) : 2 + Math.floor(rand() * 2);
        cLean = lean + (rand() - 0.5) * 0.12;
        cFan = fan + (rand() - 0.5) * 0.1;
        clumpId++;
      }
      clumpOf.push(clumpId);
      left--;
      root.set([s, d, isUpper ? 1 : 0, rand()], k * 4);
      shape.set([len, lean, fan, isUpper ? 0.55 + rand() * 0.9 : 0.8 + rand() * 0.7], k * 4);
      // the lower lashes are finer (61–72 µm is a lash's middle: Thibaut 2010)
      // (Asian lashes are the thicker, Na 2006; batch B thinned them to 0.07–0.095
      // when the roots read as tufts; with the denser rows they come back)
      // (the user's photos, 2026-10-28: a thick, dense dark fringe above and
      // many dark curly lashes below; at 0.07–0.095 / 0.05–0.07 ours read thin)
      // (lower 0.05–0.07: thicker, the short row read as a painted band)
      const width = (isUpper ? 0.09 : 0.05) + rand() * (isUpper ? 0.03 : 0.02);
      clump.set([cLean, cFan, width, rand()], k * 4);
      // a strand is never quite straight: a slow wander sideways
      wave.set([kinked ? 1.2 + rand() * 0.8 : rand() * rand(), rand() * Math.PI * 2, kinked ? 1.6 + rand() * 1.4 : 0.8 + rand() * 1.2, 0], k * 4);
      k++;
    }
    // A clump's roots bunch a little (a quarter of the way to its middle), which
    // opens gaps between clumps, and its strands meet at their tips: turn each
    // toward its clump's middle by the angle that closes the remaining gap over
    // its length (the lid runs about 13 mm per unit of s). Evenly spaced roots
    // read as a comb whatever the tips did.
    const sums = new Map<number, { s: number; n: number }>();
    clumpOf.forEach((c, i) => {
      const e = sums.get(c) ?? { s: 0, n: 0 };
      e.s += root[(first + i) * 4];
      e.n++;
      sums.set(c, e);
    });
    clumpOf.forEach((c, i) => {
      const e = sums.get(c)!;
      const at = (first + i) * 4;
      // (the lower row's clumps bunch harder: gaps of bare lid between them)
      root[at] += (e.s / e.n - root[at]) * (isUpper ? 0.25 : 0.45);
      const gap = (e.s / e.n - root[at]) * 13;
      // (their tips meet: spikes, as in the user's photos)
      const turn = Math.atan2(gap, shape[at]) * 0.95;
      shape[at + 2] += turn;
      clump[at + 1] += turn;
    });
  }
  return { count, root, shape, clump, wave };
}

/* ---- the strands --------------------------------------------------------- */

export function lashGeometry(bake: LashBake) {
  const g = new PlaneGeometry(1, 1, 1, SEGMENTS);
  g.setAttribute("aRoot", new InstancedBufferAttribute(bake.root, 4));
  g.setAttribute("aShape", new InstancedBufferAttribute(bake.shape, 4));
  g.setAttribute("aClump", new InstancedBufferAttribute(bake.clump, 4));
  g.setAttribute("aWave", new InstancedBufferAttribute(bake.wave, 4));
  return g;
}

export function lashMaterial(Ux: EyeUniforms, screen: RenderTarget, emissive: boolean) {
  const U: N = Ux;
  const LS = U.lashes;
  const material = new MeshBasicNodeMaterial();
  material.name = "Lashes";

  const vTan = varyingProperty("vec3", "vLashTan");
  const vT = varyingProperty("float", "vLashT");
  const vSide = varyingProperty("float", "vLashSide");
  const vCov = varyingProperty("float", "vLashCov");
  const vLower = varyingProperty("float", "vLashLower");

  material.positionNode = Fn(() => {
    const aRoot = attribute("aRoot", "vec4");
    const aShape = attribute("aShape", "vec4");
    const aClump = attribute("aClump", "vec4");
    const aWave = attribute("aWave", "vec4");
    const s = aRoot.x;
    const d0 = aRoot.y;
    const upper = aRoot.z.greaterThan(0.5).toVar();
    const t = uv().y.toVar();
    const side = uv().x.mul(2).sub(1).toVar();

    // the root: on the skin, riding the lid
    const alpha = select(upper, s.add(1).div(4), float(3).sub(s).div(4)).toVar();
    const bisector = outwardAt(select(s.lessThan(0), float(0), float(0.5)), Ux);
    const col = lidColumn(alpha, bisector, Ux);
    // a step toward the outer corner, whichever way α runs on this lid
    const colT = lidColumn(alpha.add(select(upper, float(0.004), float(-0.004))), bisector, Ux);
    const root = skinAt(col, d0, Ux).toVar();
    const along = normalize(skinAt(colT, d0, Ux).sub(root)).toVar();
    const outward0 = normalize(skinAt(col, d0.add(0.4), Ux).sub(root));
    const n0 = normalize(cross(along, outward0));
    const nrm = select(n0.z.lessThan(0), n0.negate(), n0).toVar();
    // Lashes leave the margin heading at the camera, whatever way the skin
    // there faces, then curl outward (up from the upper lid, down from the
    // lower): the frame is the view axis, square to the margin, and outward.
    const ahead0 = normalize(vec3(0, 0, 1).sub(along.mul(along.z)));
    const out0 = normalize(cross(along, ahead0));
    const outward1 = select(dot(out0, outward0).lessThan(0), out0.negate(), out0);
    // A lid turns as it travels over the globe, and its lashes turn with it:
    // shut, the upper ones hang forward and down; looking down, they dip.
    // Rotate the frame by how far this margin is from its neutral open line.
    // (looking up, only the lid's own travel: thetaNow already holds its capped
    // ride, and the extra pitch term rolled the upper fringe back toward the
    // brow, bent far past the lid, the user 2026-10-29)
    const travel0 = col.thetaNow.sub(col.thetaRest).add(select(upper, float(0.85), float(0.35)).mul(min(U.lids.pitch, 0)));
    // (and the upper fringe tips up at most ~2°, however far a feeling lifts
    // the lid: tipped with it, the lashes reached into the brow, the user
    // 2026-10-29, "mingling". A lifted tarsus turns its lashes toward the
    // camera as much as up, so they foreshorten.)
    const travel = select(upper, min(travel0, 0.035), travel0);
    const up = select(upper, float(1), float(-1));
    const ahead = normalize(ahead0.mul(cos(travel)).add(outward1.mul(up).mul(sin(travel)))).toVar();
    const outward = normalize(outward1.mul(cos(travel)).sub(ahead0.mul(up).mul(sin(travel)))).toVar();

    // the person: density, length, curl, clumping (mascara clumps and curls)
    const density = select(upper, LS.upper, LS.lower);
    const here = aRoot.w.lessThan(density);
    const clumping = clamp(LS.clump.add(0.25).add(LS.mascara.mul(0.3)), 0, 1);
    const lean = mix(aShape.y, aClump.x, clumping);
    const fan = mix(aShape.z, aClump.y, clumping);
    const len = aShape.x.mul(LS.length).mul(LS.mascara.mul(select(upper, float(0.1), float(0.03))).add(1)).toVar();
    // (every lower lash curls: the Japanese eyelash study found no straight one)
    const curlAll = select(upper, LS.curl.mul(0.9).add(0.45), LS.curl.mul(1).add(0.55))
      .add(LS.mascara.mul(0.25))
      .mul(aShape.w);
    const lag = select(upper, LS.lagUpper, LS.lagLower);
    // (looking up, the lifted tarsus turns the fringe toward the camera, so it
    // foreshortens: at rest curl the centre stood straight up like a fence,
    // the user 2026-10-29)
    const turn = curlAll.add(lag).add(select(upper, max(U.lids.pitch, 0).mul(2.2), float(0))).toVar();

    // the arc, in the plane of (forward, fanned toward the corner) and outward
    const fwd = normalize(ahead.mul(cos(fan)).add(along.mul(sin(fan)))).toVar();
    const k = max(abs(turn), 1e-3).mul(select(turn.lessThan(0), float(-1), float(1))).div(len).toVar();
    const a1 = lean.add(k.mul(len).mul(t));
    // the slow wander sideways, growing from the root
    const wander = sin(t.mul(aWave.z).mul(Math.PI).add(aWave.y)).mul(aWave.x).mul(len).mul(0.06).mul(t);
    const pos = fwd
      .mul(sin(a1).sub(sin(lean)).div(k))
      .add(outward.mul(cos(lean).sub(cos(a1)).div(k)))
      .add(along.mul(wander))
      .toVar();
    const tan = normalize(fwd.mul(cos(a1)).add(outward.mul(sin(a1)))).toVar();

    // the ribbon: square to the camera, never under a pixel wide
    const P = root.add(nrm.mul(select(upper, float(0.03), float(0.07)))).add(pos).toVar();
    const across = normalize(cross(tan, cameraPosition.sub(P)));
    const halfTrue = aClump.z
      .mul(0.5)
      .mul(LS.mascara.mul(select(upper, float(0.5), float(0.25))).add(1))
      // a bulb at the root, a fine tip that still shows (the user: the upper
      // tips were missing; thinning to nothing they fell under a pixel)
      .mul(mix(select(upper, float(0.2), float(0.14)), float(1), pow(float(1).sub(t), 0.85)).mul(smoothstepDown(0.14, 0, t).mul(0.2).add(1)))
      .mul(select(here, float(1), float(0)))
      .toVar();
    const halfDrawn = max(halfTrue, LS.pxMm.mul(0.6)).toVar();
    vTan.assign(tan);
    vT.assign(t);
    vSide.assign(side);
    vCov.assign(halfTrue.div(halfDrawn));
    vLower.assign(select(upper, float(0), float(1)));
    return select(here, P.add(across.mul(side).mul(halfDrawn)), root);
  })();

  material.colorNode = Fn(() => {
    const T_ = normalize(vTan);
    const V = normalize(cameraPosition.sub(positionWorld));
    const L = screenKey(Ux, screen);
    // (the lower lashes' tips lighter: brown where the hair thins)
    // (the lower lashes dark too, only their very tips browning: the user's photos)
    const tip = vec3(LS.tip).mul(mix(float(1.2), float(1.6), vLower));
    const albedo = mix(vec3(LS.root), tip, pow(vT, 1.3)).toVar();
    albedo.assign(mix(albedo, vec3(0.012, 0.011, 0.011), LS.mascara));
    // Kajiya–Kay: diffuse by how square the strand is to the light …
    const TL = dot(T_, L.dir);
    const kd = mix(float(0.35), float(1), sqrt(max(float(1).sub(TL.mul(TL)), 0)));
    // … and two shifted lobes along it (Marschner): R, white and wet, toward
    // the root, in the screen's colour; TRT, warm, toward the tip, in the hair's
    const H = normalize(L.dir.add(V));
    const TH = dot(T_, H);
    const THr = TH.sub(0.08);
    // (fainter on the fine lower ones, whose tips must stay brown)
    const sheen = pow(sqrt(max(float(1).sub(THr.mul(THr)), 0)), 90).mul(LS.mascara.mul(0.08).add(0.14)).mul(mix(float(1), float(0.35), vLower));
    const TH2 = TH.add(0.12);
    const sheen2 = pow(sqrt(max(float(1).sub(TH2.mul(TH2)), 0)), 28).mul(0.08);
    // a strand is round: its edges turn away
    const round = mix(float(0.65), float(1), float(1).sub(vSide.mul(vSide)));
    return albedo
      .mul(L.amb.add(L.key.mul(kd).mul(0.9)).add(L.fill.mul(0.6)))
      .mul(round)
      .add(L.hue.mul(L.key).mul(sheen))
      .add(albedo.mul(L.key).mul(sheen2).mul(3))
      .mul(U.fade);
  })();
  // coverage, softened across the ribbon and out at the tip
  material.opacityNode = vCov
    .mul(smoothstepDown(1, 0.55, abs(vSide)).mul(0.5).add(0.5))
    .mul(smoothstepDown(1, 0.82, vT))
    .mul(smoothstepDown(0.35, 0, vT).mul(0.15).add(0.85));
  // In front of the reflection they hide its glow, and they write depth so
  // the depth of field sees them where they are (nothing draws after them).
  if (emissive) material.mrtNode = mrt({ emissive: vec4(0, 0, 0, material.opacityNode) });
  material.transparent = true;
  material.depthWrite = true;
  // the ribbons face the camera already; one pass, not three's back-then-front
  material.side = DoubleSide;
  material.forceSinglePass = true;
  return material;
}

/** The lashes as one draw: `upper` and `lower` strands, from the tier. */
export function createLashes(
  Ux: EyeUniforms,
  screen: RenderTarget,
  upper: number,
  lower: number,
  emissive: boolean,
  seed = 0x1a5e5,
) {
  const bake = bakeLashes(upper, lower, seed);
  const mesh = new InstancedMesh(lashGeometry(bake), lashMaterial(Ux, screen, emissive), Math.max(bake.count, 1));
  mesh.count = bake.count;
  mesh.name = "lashes";
  mesh.frustumCulled = false;
  // after the cornea, which they hang in front of
  mesh.renderOrder = 20;
  return mesh;
}
