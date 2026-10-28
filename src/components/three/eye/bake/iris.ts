/**
 * The iris, baked once per person into a polar map: across is the angle
 * around the pupil, down is the distance from the centre (0) to the root (1),
 * laid out at the person's own resting pupil. The shader's area-preserving
 * rest space (nodes/iris.ts) reads it at any pupil, so neither a pupil nor an
 * era change re-bakes it; only another person does.
 *
 * What is in it, from the pupil out (docs/EYE_TSL_PLAN.md §3.4, R2 in
 * docs/EYE_REALISM_PLAN.md):
 *  · the pupillary ruff: a dark, crenellated rim at the pupil margin;
 *  · the pupillary zone, in the inner colour;
 *  · the collarette: a raised zigzag ring a third of the way out, where the
 *    colour changes (central heterochromia lives here);
 *  · the ciliary zone, in the outer colour;
 *  · radial vessels that wander and wave, faint collagen arcs both ways;
 *  · crypts of Fuchs: Voronoi cells, densest by the collarette's ciliary side;
 *  · contraction furrows: broad folds in the outer ciliary zone;
 *  · freckles; the limbal ring; with age, an arcus.
 *
 * Colour (R3, docs/R3_IRIS_COLOUR_CARD.md) comes from the layers, by
 * Kubelka–Munk, not from painted zones: the anterior border layer, thin and
 * dense with melanin, over the paler stroma (with its blood), over the
 * epithelium, black in every iris. So in a dark iris the fibres are no paler
 * than the border layer between them (pale threads read as drawn), a crypt's
 * walls show the warmer stroma, and its floor, where little stroma is left over
 * the epithelium, goes dark. The person's two zones tint it.
 *
 * As two layers: a stroma floor and a fibre shell over it. In a brown iris
 * the shell (the anterior border layer) covers everything but the crypts,
 * where only the trabeculae bridge the hole.
 *  · relief: r the floor, g the shell, b the shell's cover, a the floor's tone;
 *  · colour: rgb the surface's colour, a the floor's ambient occlusion.
 * Heights are shares of the relief depth (U.iris.relief), 0.5 the mean
 * surface; inside the pupil both are 0. Two sets, A and B, so a new person
 * can be crossfaded in.
 *
 * MaterialX noise in polar space is seamless: the angle enters the noise as
 * a point on a circle, never as a number that wraps.
 */

import {
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  NodeMaterial,
  QuadMesh,
  RenderTarget,
  RepeatWrapping,
  Vector3,
  type WebGPURenderer,
} from "three/webgpu";
import { ANATOMY } from "../anatomy";
import type { EyeIdentity } from "../identity";
import { smoothstepDown } from "../nodes/common";
import { T, type N } from "../nodes/tsl";
import { seedOffset } from "./vessels";

const {
  Fn,
  TWO_PI,
  abs,
  clamp,
  cos,
  exp,
  float,
  max,
  min,
  mix,
  mx_noise_float,
  mx_worley_noise_float,
  mx_worley_noise_vec2,
  pow,
  saturate,
  sin,
  smoothstep,
  sqrt,
  step,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} = T;

/**
 * Kubelka–Munk: a layer's reflectance and transmittance, per channel, from its
 * absorption-to-scattering ratio K/S and its scattering thickness S·x (the
 * hyperbolic solution, Kubelka 1948). Layers stack as R = R₁ + T₁²R₂ / (1 − R₁R₂).
 */
function kmLayer(ks: N, sx: N) {
  const a = ks.add(1);
  const b = sqrt(a.mul(a).sub(1));
  const e = exp(min(b.mul(sx), 30));
  const sh = e.sub(float(1).div(e)).mul(0.5);
  const ch = e.add(float(1).div(e)).mul(0.5);
  const den = a.mul(sh).add(b.mul(ch));
  return { R: sh.div(den), T: b.div(den) };
}

/** Melanin's absorption against red (650 nm): green (550) ×1.79, blue (450) ×3.60, from λ^−3.48 (OMLC, Jacques). */
const MELANIN_K = [1, 1.79, 3.6] as const;
/** Oxy-haemoglobin's, against green (550 nm): the stroma's blood, which pulls the brown toward red. */
const BLOOD_K = [0.07, 1, 1.4] as const;

export interface IrisSet {
  /** r floor, g shell, b the shell's cover, a the floor's tone */
  relief: RenderTarget;
  /** rgb the surface's colour, a the floor's ambient occlusion */
  colour: RenderTarget;
}

/**
 * How far the shader follows a ray into the relief (tiers.ts irisMarch):
 * linear steps, then a secant refine of each layer's crossing, then steps
 * toward the light. 0 linear steps is T1's single parallax step.
 */
export interface IrisMarch {
  linear: number;
  refine: number;
  shadow: number;
}

export interface IrisBake {
  sets: [IrisSet, IrisSet];
  march: IrisMarch;
  /** Bakes this person into a set on the next `render`. */
  request: (set: 0 | 1, identity: EyeIdentity) => void;
  /** Renders an owed bake; returns the set it baked, or -1. */
  render: (renderer: WebGPURenderer) => number;
  /** Bakes the last request again, into the same set, on the next `render` (see VesselBake.redo). */
  redo: () => void;
  quads: QuadMesh[];
  dispose: () => void;
}

function makeTarget(w: number, h: number, name: string) {
  const t = new RenderTarget(w, h, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  t.texture.wrapS = RepeatWrapping;
  t.texture.name = name;
  return t;
}

/** The iris's radius, mm: the bake measures its occlusion in mm. */
const RI = ANATOMY.irisRadius;
/** The relief depth the occlusion is baked for, mm (U.iris.relief's default). */
const DEPTH_REF = 0.22;

/**
 * @param width angular resolution (tier.irisBake); radial is a quarter of it.
 * @param march how far the shader follows rays into the relief (tiers.ts irisMarch).
 */
export function createIrisBake(width: number, march: IrisMarch): IrisBake {
  const height = Math.max(64, width / 4);
  const set = (k: string): IrisSet => ({
    relief: makeTarget(width, height, `IrisRelief${k}`),
    colour: makeTarget(width, height, `IrisColour${k}`),
  });
  const sets: [IrisSet, IrisSet] = [set("A"), set("B")];

  // the person being baked
  const P = {
    seed: uniform(new Vector3()),
    inner: uniform(new Color()),
    outer: uniform(new Color()),
    melanin: uniform(0.7),
    scatter: uniform(0.2),
    collarette: uniform(0.34),
    crypts: uniform(0.5),
    furrows: uniform(0.4),
    wave: uniform(0.5),
    freckles: uniform(0.1),
    limbal: uniform(0.7),
    arcus: uniform(0),
    /** The person's own resting pupil, where the layers are laid out. */
    rest: uniform(0.34),
  };
  const Pn: N = P;

  /** The iris as two layers at one texel, laid out at the person's own resting pupil. */
  const layers = () => {
    const th = uv().x.mul(TWO_PI);
    const rho = uv().y;
    const seed = Pn.seed;
    const p0 = Pn.rest;
    // no tissue inside the pupil: rays that cross the margin fall through
    const tissue = smoothstep(p0.sub(0.004), p0.add(0.002), rho).toVar();
    const t = clamp(rho.sub(p0).div(float(1).sub(p0)), 0, 1).toVar();
    const cs = vec2(cos(th), sin(th)).toVar();

    // the collarette: a zigzag ring a third of the way out
    const colR = Pn.collarette
      .add(mx_noise_float(vec3(cs.mul(3), 7).add(seed)).mul(0.05))
      .add(sin(th.mul(14).add(mx_noise_float(vec3(cs.mul(5), 3).add(seed)).mul(3))).mul(0.022))
      .toVar();
    const inner = float(1).sub(smoothstep(colR.sub(0.025), colR.add(0.025), t)).toVar();
    const ridge = smoothstepDown(0.055, 0, abs(t.sub(colR))).toVar();

    // the stroma is thickest at the collarette and thins toward the root
    const prof = float(0.55)
      .add(exp(t.sub(colR).div(0.22).pow(2).negate()).mul(0.1))
      .add(ridge.mul(0.12))
      .sub(smoothstep(0.75, 1, t).mul(0.1))
      .toVar();

    // radial vessels: they wander, and wave 1.5–5 times across the width
    const bend = mx_noise_float(vec3(cs.mul(2.5), t.mul(3)).add(seed)).mul(Pn.wave).mul(0.09);
    const waves = sin(t.mul(Math.PI * 2 * 3.2).add(mx_noise_float(vec3(cs.mul(9), 2).add(seed)).mul(6)))
      .mul(Pn.wave)
      .mul(0.012);
    const a2 = th.add(bend).add(waves);
    const cs2 = vec2(cos(a2), sin(a2)).toVar();
    const fine = pow(float(1).sub(abs(mx_noise_float(vec3(cs2.mul(52), t.mul(2.4)).add(seed)))), 5);
    const coarse = pow(float(1).sub(abs(mx_noise_float(vec3(cs2.mul(17), t.mul(1.5)).add(seed.mul(1.3))))), 7);
    // collagen arcs, spiralling both ways round
    const aP = th.add(t.mul(1.7));
    const aM = th.sub(t.mul(1.7));
    const arcP = pow(float(1).sub(abs(mx_noise_float(vec3(vec2(cos(aP), sin(aP)).mul(28), t.mul(0.9).add(11)).add(seed)))), 9);
    const arcM = pow(float(1).sub(abs(mx_noise_float(vec3(vec2(cos(aM), sin(aM)).mul(28), t.mul(0.9).add(23)).add(seed)))), 9);
    // (faint: drawn as strongly as the vessels they read as a lattice)
    const arcs = max(arcP, arcM).mul(smoothstep(0.05, 0.3, t));
    const tube = clamp(max(coarse, fine.mul(0.75)).add(arcs.mul(0.22)), 0, 1).toVar();

    // crypts: Voronoi cells stretched along the radius, open where the
    // cell's middle is; in a band hugging the collarette's ciliary side, and a
    // sparse one near the root. They come in clusters, not one per cell.
    const w = mx_worley_noise_vec2(vec3(cs.mul(10), t.mul(4.5)).add(seed.mul(1.7)));
    const hole = smoothstep(0.04, 0.16, w.y.sub(w.x)).mul(smoothstepDown(0.42, 0.2, w.x));
    const band = exp(t.sub(colR.add(0.09)).div(0.11).pow(2).negate())
      .mul(0.9)
      .add(exp(t.sub(0.8).div(0.07).pow(2).negate()).mul(0.4));
    const cluster = smoothstep(0.42, 0.62, mx_noise_float(vec3(cs.mul(7), t.mul(3)).add(seed.mul(2.3))).mul(0.5).add(0.5));
    const crypt = saturate(hole.mul(band).mul(cluster).mul(Pn.crypts.mul(2.2)))
      .mul(smoothstep(0.04, 0.12, t))
      .mul(smoothstepDown(0.95, 0.85, t))
      .toVar();

    // contraction furrows: broad folds of the whole stroma in the outer
    // ciliary zone, so both layers dip; they fade in and out round the iris
    // (narrow, hard-ended rings read as scratches)
    const ringPhase = t.mul(5.5).add(mx_noise_float(vec3(cs.mul(4), 1).add(seed)).mul(0.35));
    const ring = smoothstepDown(0.4, 0, abs(sin(ringPhase.mul(Math.PI))))
      .mul(smoothstep(0.58, 0.7, t))
      .mul(smoothstepDown(0.97, 0.88, t))
      .mul(smoothstep(-0.15, 0.25, mx_noise_float(vec3(cs.mul(6), 9).add(seed))))
      .mul(Pn.furrows)
      .toVar();

    // the ruff: the dark epithelium curling over the margin, a crenellated rim
    const ruff = smoothstepDown(0.06, 0, t)
      .mul(sin(th.mul(64)).mul(0.25).add(0.75))
      .toVar();
    const limb = smoothstep(0.84, 1, t).mul(Pn.limbal).toVar();
    const freckle = smoothstepDown(0.07, 0.02, mx_worley_noise_float(vec3(cs.mul(15), t.mul(8)).add(seed.mul(2.1))))
      .mul(step(mx_noise_float(vec3(cs.mul(3), 5).add(seed)).mul(0.5).add(0.5), Pn.freckles))
      .toVar();

    // In a brown iris the anterior border layer, thick with melanin, covers
    // the stroma everywhere but the crypts: there only the trabeculae bridge
    // the hole, and the floor shows between them. The shell keeps the
    // stroma's envelope over a crypt, so its fibres pass over it.
    const border = float(1).sub(crypt).mul(mx_noise_float(vec3(cs.mul(24), t.mul(7)).add(seed.mul(3.1))).mul(0.04).add(0.92));
    const cover = max(max(smoothstep(0.22, 0.55, tube), border), ruff).toVar();
    const floor = prof
      .sub(float(1).sub(cover).mul(0.07))
      .sub(crypt.mul(0.36))
      .sub(ring.mul(0.14))
      .add(ruff.mul(0.12))
      .toVar();
    const shell = max(prof.add(tube.mul(0.1)).sub(ring.mul(0.12)).add(ruff.mul(0.12)), floor.add(0.01));
    // the floor's colour against the surface's: the depth between the threads
    // is darker the more melanin covers the fibres, and darker still in a
    // crypt and a furrow, where thinner stroma lets the epithelium show
    const tone = mix(float(0.32), float(0.62), Pn.melanin)
      .div(mix(float(1.45), float(0.7), Pn.melanin))
      .mul(mix(float(1), float(0.6), crypt))
      .mul(float(1).sub(ring.mul(0.3)));

    return {
      t,
      cs,
      tube,
      inner,
      ridge,
      ruff,
      limb,
      freckle,
      crypt,
      ring,
      border,
      relief: vec4(clamp(floor, 0, 1).mul(tissue), clamp(shell, 0, 1).mul(tissue), cover.mul(tissue), clamp(tone, 0, 1)),
    };
  };

  const reliefMaterial = new NodeMaterial();
  reliefMaterial.name = "IrisBakeRelief";
  reliefMaterial.fragmentNode = Fn(() => layers().relief)();
  reliefMaterial.depthTest = false;
  reliefMaterial.depthWrite = false;

  // the colour pass reads the relief it follows (whichever set was just baked)
  const reliefIn = texture(sets[0].relief.texture);
  const colourMaterial = new NodeMaterial();
  colourMaterial.name = "IrisBakeColour";
  colourMaterial.fragmentNode = Fn(() => {
    const f = layers();
    // The layers, by Kubelka–Munk (kmLayer), fitted offline for this person
    // (melanin 0.85: the body L* ~18, hue ~62°, against measured brown irides'
    // L* ~22, hue 45–55° at their most saturated; R3 card §3):
    //  · the border layer: K/S 15.3·melanin per channel, S·x 0.065, a little
    //    thicker along the fibres, gone in a crypt;
    //  · the stroma: K/S 6.5·melanin, plus its blood, S·x 1.6 at full
    //    thickness (~0.37 mm), thinner in a furrow and almost gone in a crypt;
    //  · the epithelium under both: black.
    const mel = Pn.melanin;
    const abl = kmLayer(vec3(...MELANIN_K).mul(mel.mul(15.3)), f.border.mul(0.065).mul(f.tube.mul(0.3).add(1)));
    const thick = float(1).sub(f.crypt.mul(0.96)).sub(f.ring.mul(0.25));
    const stroma = kmLayer(vec3(...MELANIN_K).mul(mel.mul(6.5)).add(vec3(...BLOOD_K).mul(8)), thick.mul(1.6));
    const km = abl.R.add(abl.T.mul(abl.T).mul(stroma.R).div(float(1).sub(abl.R.mul(stroma.R))));
    // the person's zones as a tint: the pupillary zone lighter than the ciliary
    const tint = mix(vec3(1), Pn.inner.div(max(Pn.outer, vec3(0.002))), f.inner.mul(0.5)).toVar();
    tint.mulAssign(mx_noise_float(vec3(f.cs.mul(2), f.t.mul(2)).add(Pn.seed.mul(0.7))).mul(0.15).add(1));
    // a light iris scatters (Tyndall): grey-blue over a thin border layer;
    // in a dark one the melanin hides it (its grey over a dark zone read as grey hair)
    const col = mix(km.mul(tint), vec3(0.72, 0.75, 0.8), Pn.scatter.mul(float(1).sub(mel))).toVar();
    col.assign(mix(col, mix(Pn.inner, vec3(0.8, 0.72, 0.6), 0.2).mul(1.15), f.ridge.mul(0.12)));
    col.assign(mix(col, vec3(0.07, 0.04, 0.03), f.ruff.mul(0.85)));
    col.assign(mix(col, vec3(0.13, 0.07, 0.04), f.freckle.mul(0.85)));
    // (a dark iris shows almost no limbal ring: in the user's photo the iris
    // runs flat to its edge, then softly into the white)
    col.assign(mix(col, vec3(0.03, 0.03, 0.036), f.limb.mul(0.3)));
    col.assign(mix(col, vec3(0.62, 0.62, 0.6), smoothstep(0.88, 0.95, f.t).mul(smoothstepDown(1, 0.97, f.t)).mul(Pn.arcus)));

    // the floor's ambient occlusion: how far the surface round it rises
    // above it, on two rings of eight (0.05 and 0.14 mm), measured in mm
    const here = reliefIn.sample(uv()).level(0).toVar();
    const perMmU = float(1).div(max(uv().y, 0.25).mul(Math.PI * 2 * RI));
    const perMmV = 1 / RI;
    const occ = float(0).toVar();
    for (const r of [0.05, 0.14]) {
      for (let k = 0; k < 8; k++) {
        const a = (k + (r > 0.1 ? 0.5 : 0)) * (Math.PI / 4);
        const o = vec2(perMmU.mul(Math.cos(a) * r), Math.sin(a) * r * perMmV);
        const n = reliefIn.sample(uv().add(o)).level(0);
        const top = mix(n.r, n.g, n.b);
        occ.addAssign(saturate(top.sub(here.r).mul(DEPTH_REF / r).sub(0.05)));
      }
    }
    const ao = float(1).sub(occ.div(16).mul(0.9)).toVar();
    // a fibre over this point keeps the sky off the floor under it
    ao.mulAssign(float(1).sub(here.b.mul(0.45).mul(saturate(here.g.sub(here.r).mul(DEPTH_REF / 0.03)))));
    return vec4(clamp(col, 0, 1), clamp(ao, 0, 1));
  })();
  colourMaterial.depthTest = false;
  colourMaterial.depthWrite = false;

  const reliefQuad = new QuadMesh(reliefMaterial);
  const colourQuad = new QuadMesh(colourMaterial);

  let owed: { set: 0 | 1; identity: EyeIdentity } | null = null;
  let last: { set: 0 | 1; identity: EyeIdentity } | null = null;

  return {
    sets,
    march,
    quads: [reliefQuad, colourQuad],
    request(set, identity) {
      owed = { set, identity };
      last = owed;
    },
    redo() {
      if (!owed && last) owed = last;
    },
    render(renderer) {
      if (!owed) return -1;
      const { set, identity } = owed;
      owed = null;
      const i = identity.iris;
      seedOffset(identity.seed, P.seed.value as Vector3);
      (P.inner.value as Color).set(i.inner);
      (P.outer.value as Color).set(i.outer);
      P.melanin.value = i.melanin;
      P.scatter.value = i.scatter;
      P.collarette.value = i.collaretteR;
      P.crypts.value = i.crypts;
      P.furrows.value = i.furrows;
      P.wave.value = i.fibreWave;
      P.freckles.value = i.freckles;
      P.limbal.value = i.limbal;
      P.arcus.value = i.arcus;
      P.rest.value = identity.pupil.rest;
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(sets[set].relief);
      reliefQuad.render(renderer);
      reliefIn.value = sets[set].relief.texture;
      renderer.setRenderTarget(sets[set].colour);
      colourQuad.render(renderer);
      renderer.setRenderTarget(prev);
      return set;
    },
    dispose() {
      for (const s of sets) {
        s.relief.dispose();
        s.colour.dispose();
      }
      reliefMaterial.dispose();
      colourMaterial.dispose();
    },
  };
}
