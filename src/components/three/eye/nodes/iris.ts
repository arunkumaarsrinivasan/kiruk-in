/**
 * The iris, as seen through the cornea (called from cornea.ts, which has
 * already refracted the view ray and found where it lands on the iris).
 *
 *  · Dilation is muscle, not scale. The baked map is laid out at the
 *    person's resting pupil. For the pupil the eye has now, a point is moved
 *    back to where that tissue sits at rest: the pupillary zone keeps its
 *    area (the collarette follows the pupil) and the ciliary zone stretches
 *    linearly to the root, which never moves; the ciliary zone thickens as
 *    it is squeezed (Pamplona et al. 2009).
 *  · Seamless polar sampling: the angle wraps, so mip levels come from
 *    explicit gradients taken off whichever of two angle measures has no seam
 *    under this pixel (Tarini's trick); the map itself repeats around.
 *  · Relief (R2): two layers, a stroma floor and a fibre shell over it. The
 *    ray is followed down through them (linear steps, then a secant refine
 *    of each layer's crossing); where the shell has fibres they cover the
 *    floor, so threads bridge the crypts and the depth under them shifts
 *    with the view. Light is followed back up toward the screen: the floor
 *    and the crypts' walls block it, thin bridges let some through. T1 takes
 *    one parallax step.
 *  · Light comes in through the cornea too. It is focused onto the far side
 *    of the iris in a bright crescent (the caustic, reference R2), and the
 *    near side sits in the shadow of the limbus. The light is the era's page
 *    (R3): the crescent is that page focused through the cornea, blurred and
 *    upside down, so a navy page with neon lays navy and neon there, and a
 *    terminal's green lines lay green.
 *  · Wobble: after a saccade the membrane lags the turn and settles.
 */

import { ANATOMY, IRIS_Z_PUPIL, IRIS_Z_ROOT } from "../anatomy";
import type { IrisBake } from "../bake/iris";
import type { EyeUniforms } from "../uniforms";
import { smoothstepDown, type N } from "./common";
import { sampleScreen } from "./screen";
import type { RenderTarget } from "three/webgpu";
import { T } from "./tsl";

const {
  Break,
  If,
  Loop,
  TWO_PI,
  abs,
  atan,
  clamp,
  dFdx,
  dFdy,
  dot,
  exp,
  float,
  fract,
  fwidth,
  length,
  max,
  min,
  mix,
  pow,
  saturate,
  select,
  sin,
  smoothstep,
  sqrt,
  texture,
  vec2,
  vec3,
  vec4,
} = T;

const RI = ANATOMY.irisRadius;

/**
 * Where a point sits in a set's layers (twin/iris-space.ts `shaderRestRho`).
 * `rp` is the pupil here (its uneven margin included), `layout` the set's
 * resting pupil and collarette. The pupillary zone keeps its area; past ~0.9
 * open it can't, and is squeezed with the rest toward the root.
 */
function restSpace(xy: N, rp: N, layout: N) {
  const rho = length(xy).div(RI);
  const rp0 = layout.x;
  const rc0 = layout.y;
  const rc = min(sqrt(max(rp.mul(rp).add(rc0.mul(rc0)).sub(rp0.mul(rp0)), 0)), mix(rp, float(1), 0.55));
  const share = rho.mul(rho).sub(rp.mul(rp)).div(max(rc.mul(rc).sub(rp.mul(rp)), 1e-5));
  const inner = sqrt(max(rp0.mul(rp0).add(share.mul(rc0.mul(rc0).sub(rp0.mul(rp0)))), 0));
  const outer = rc0.add(rho.sub(rc).mul(float(1).sub(rc0)).div(max(float(1).sub(rc), 1e-3)));
  const r0 = select(rho.lessThanEqual(rc), inner, outer);
  return { uv: vec2(atan(xy.y, xy.x).div(TWO_PI), r0), rho, rc, r0 };
}

/** Mip gradients with no seam: take the angle's from whichever measure is smooth here. */
function polarGrads(uv: N) {
  const u2 = fract(uv.x); // seam at 0 instead of ±π
  const ux = dFdx(uv.x);
  const ux2 = dFdx(u2);
  const uy = dFdy(uv.x);
  const uy2 = dFdy(u2);
  const gx = vec2(select(abs(ux).lessThanEqual(abs(ux2)), ux, ux2), dFdx(uv.y));
  const gy = vec2(select(abs(uy).lessThanEqual(abs(uy2)), uy, uy2), dFdy(uv.y));
  return { gx, gy };
}

/** No pupil is a drawn circle: its margin is a little uneven, a few percent. */
function uneven(ang: N) {
  return float(1)
    .add(sin(ang.mul(2).add(0.7)).mul(0.024))
    .add(sin(ang.mul(3).add(2.1)).mul(0.015))
    .add(sin(ang.mul(5).add(0.4)).mul(0.008));
}

export interface IrisInput {
  /** Where the refracted view ray meets the iris, globe-local mm. */
  hit: N;
  /** The refracted ray, globe-local. */
  ray: N;
  /** Direction to the screen's light, globe-local. */
  light: N;
  key: N;
  amb: N;
  /** The lids' shade at this point of the shot (lid-shape.ts socketShade). */
  socket: N;
  /** The page's average luminance (≥ 0.04), to read its picture as a tint. */
  avgLum: N;
}

export function irisShade(Ux: EyeUniforms, bake: IrisBake, screen: RenderTarget, inp: IrisInput) {
  const U: N = Ux;
  const I = U.iris;
  const pupil = U.pupil;
  const M = bake.march;

  // ---- wobble: the membrane lags the turn, most in the middle of the iris --
  const rhoHit = length(inp.hit.xy).div(RI);
  const mid = clamp(rhoHit.sub(pupil).div(float(1).sub(pupil)), 0, 1);
  const wob = I.wobble.mul(mid.mul(float(1).sub(mid)).mul(4)).toVar();
  const xy0 = inp.hit.xy.add(wob).toVar();

  // derivatives are taken here, before any branch, on the unparallaxed
  // point, in each set's map (laid to the pupil's uneven margin)
  const rpHit = pupil.mul(uneven(atan(xy0.y, xy0.x))).toVar();
  const qa = restSpace(xy0, rpHit, I.layoutA);
  const qb = restSpace(xy0, rpHit, I.layoutB);
  const ha = polarGrads(qa.uv);
  const hb = polarGrads(qb.uv);

  const wB = I.weightB;
  const L2 = inp.light.xy.div(max(length(inp.light.xy), 1e-4)).toVar();

  // what the layers hand on: where the ray ends on the tissue, the albedo
  // times its light, the albedo, and a lab view
  const xy = xy0.toVar();
  const shaded = vec3(0).toVar();
  const alb = vec3(0).toVar();
  const dbg = vec4(0).toVar();

  // ---- two layers, a stroma floor and a fibre shell -------------------------
  const lay = select(wB.lessThan(0.5), I.layoutA, I.layoutB);
  const q = restSpace(xy0, rpHit, lay);
  // the ciliary zone thickens as the open pupil squeezes it, thins as it
  // stretches (thickness ∝ area^-½); the pupillary zone keeps its area
  const area = q.rho.div(max(q.r0, 1e-3)).mul(float(1).sub(q.rc)).div(max(float(1).sub(lay.y), 1e-3));
  const thick = mix(float(1), clamp(pow(max(area, 0.05), -0.5), 0.75, 1.6), smoothstep(q.rc.sub(0.03), q.rc.add(0.03), q.rho));
  const D = I.relief.mul(thick).toVar();

  // The march is shorter than a millimetre, so along it each set's map is
  // linear: its rest-space coordinates at the hit, and how they change per
  // mm (the map's Jacobian). A step is then a multiply-add, not an atan and
  // two square roots.
  const linear = (layout: N, at: { uv: N; rho: N; rc: N; r0: N }) => {
    const r = max(length(xy0), 1e-3);
    const rp0 = layout.x;
    const rc0 = layout.y;
    // ρ0 against ρ: the pupillary zone keeps its area, the ciliary zone is linear
    const k = select(
      at.rho.lessThanEqual(at.rc),
      rc0.mul(rc0).sub(rp0.mul(rp0)).div(max(at.rc.mul(at.rc).sub(rpHit.mul(rpHit)), 1e-5)).mul(at.rho).div(max(at.r0, 1e-3)),
      float(1).sub(rc0).div(max(float(1).sub(at.rc), 1e-3)),
    );
    const ju = vec2(xy0.y.negate(), xy0.x).div(r.mul(r).mul(Math.PI * 2));
    const jv = xy0.mul(k).div(r.mul(RI));
    return { uv: at.uv, ju, jv };
  };
  const LA = linear(I.layoutA, qa);
  const LB = linear(I.layoutB, qb);
  const mapAt = (L: { uv: N; ju: N; jv: N }, d: N) => L.uv.add(vec2(dot(L.ju, d), dot(L.jv, d)));
  /** The layers at an offset (mm) from the hit, crossfaded between the two people. */
  const layersOff = (d: N) => {
    const s = vec4(0).toVar();
    If(wB.lessThan(0.999), () => {
      s.addAssign(texture(bake.sets[0].relief.texture, mapAt(LA, d)).grad(ha.gx, ha.gy).mul(float(1).sub(wB)));
    });
    If(wB.greaterThan(0.001), () => {
      s.addAssign(texture(bake.sets[1].relief.texture, mapAt(LB, d)).grad(hb.gx, hb.gy).mul(wB));
    });
    return s;
  };
  const colourOff = (d: N) => {
    const c = vec4(0).toVar();
    If(wB.lessThan(0.999), () => {
      c.addAssign(texture(bake.sets[0].colour.texture, mapAt(LA, d)).grad(ha.gx, ha.gy).mul(float(1).sub(wB)));
    });
    If(wB.greaterThan(0.001), () => {
      c.addAssign(texture(bake.sets[1].colour.texture, mapAt(LB, d)).grad(hb.gx, hb.gy).mul(wB));
    });
    return c;
  };
  /** A layer's height above the iris's mean surface, mm. */
  const H = (h: N) => h.sub(0.5).mul(D);

  const ray = inp.ray;
  // the ray's height above that surface is linear along it too (the cone is
  // linear in ρ): z0 at the hit, dz per unit of ray, always going down
  const hr = max(length(inp.hit.xy), 1e-3);
  const coneSlope = (IRIS_Z_PUPIL - IRIS_Z_ROOT) / RI;
  const z0 = inp.hit.z.sub(irisZ(hr.div(RI), IRIS_Z_ROOT, IRIS_Z_PUPIL)).toVar();
  const dz = min(ray.z.add(dot(inp.hit.xy, ray.xy).div(hr).mul(coneSlope)), -0.05).toVar();
  const tauAt = (z: N) => z.sub(z0).div(dz);

  const cov = float(0).toVar();
  const tS = float(0).toVar();
  const tF = float(0).toVar();
  const sS = vec4(0).toVar();
  const sF = vec4(0).toVar();
  const cS = vec4(0).toVar();
  const cF = vec4(0).toVar();
  const keyLit = float(1).toVar(); // how much of the key reaches the floor
  const steps = float(1).toVar();
  const deep = float(0).toVar(); // the ray went on down to the floor

  if (M.linear === 0) {
    // T1: one parallax step on the two layers' blend
    const s0 = layersOff(vec2(0));
    const slide = ray.xy.div(max(abs(ray.z), 0.3));
    const d = slide.mul(mix(s0.r, s0.g, s0.b).sub(0.5)).mul(D).toVar();
    sS.assign(layersOff(d));
    sF.assign(sS);
    cS.assign(colourOff(d));
    cF.assign(cS);
    cov.assign(sS.b);
    tS.assign(dot(d, ray.xy).div(max(dot(ray.xy, ray.xy), 1e-6)));
    tF.assign(tS);
  } else {
    // follow the ray down from just above the highest fibre to below the
    // deepest crypt; the shell first. Each sample keeps how far the ray is
    // above the layer, so a crossing is interpolated between the two
    // samples either side of it (and refined by the secant from there).
    const t0 = tauAt(D.mul(0.42)).toVar();
    const t1 = tauAt(D.mul(-0.52)).toVar();
    const dt = t1.sub(t0).div(M.linear).toVar();
    const above = (tau: N, s: N, layer: "r" | "g") => z0.add(dz.mul(tau)).sub(H(s[layer]));
    const prev = t0.toVar();
    const prevD = D.toVar();
    const sA = t0.toVar();
    const sB = t1.toVar();
    const dA = D.toVar();
    const dB = float(-1e-4).toVar();
    steps.assign(0);
    Loop(M.linear + 1, ({ i }: { i: N }) => {
      const tau = t0.add(dt.mul(float(i))).toVar();
      const d = above(tau, layersOff(ray.xy.mul(tau)), "g").toVar();
      steps.addAssign(1);
      If(d.lessThanEqual(0), () => {
        sA.assign(prev);
        sB.assign(tau);
        dA.assign(prevD);
        dB.assign(d);
        Break();
      });
      prev.assign(tau);
      prevD.assign(d);
    });
    /** Where the ray crosses a layer between a (above it by da) and b (below it by db). */
    const refine = (a0: N, b0: N, da0: N, db0: N, layer: "r" | "g") => {
      const a = a0.toVar();
      const b = b0.toVar();
      const da = max(da0, 0).toVar();
      const db = min(db0, 0).toVar();
      const cross = () => a.add(b.sub(a).mul(da.div(max(da.sub(db), 1e-6))));
      Loop(M.refine, () => {
        const m = cross().toVar();
        const d = above(m, layersOff(ray.xy.mul(m)), layer).toVar();
        If(d.lessThanEqual(0), () => {
          b.assign(m);
          db.assign(d);
        }).Else(() => {
          a.assign(m);
          da.assign(d);
        });
      });
      return cross();
    };
    tS.assign(refine(sA, sB, dA, dB, "g"));
    sS.assign(layersOff(ray.xy.mul(tS)));
    cS.assign(colourOff(ray.xy.mul(tS)));
    cov.assign(sS.b);
    tF.assign(tS);
    sF.assign(sS);
    cF.assign(cS);

    // Most of a brown iris is the border layer, with the floor just under
    // it: the floor only matters where the layer opens (the crypts and the
    // threads over them). Elsewhere the shell's point stands in for it.
    If(cov.lessThan(0.8), () => {
      deep.assign(1);
      // (from the shell's crossing: the floor is never above it)
      const fA = tS.toVar();
      const fB = t1.toVar();
      const fdA = above(tS, sS, "r").toVar();
      const fdB = float(-1e-4).toVar();
      const at = tS.toVar();
      const atD = fdA.toVar();
      Loop(M.linear, () => {
        const tau = at.add(dt).toVar();
        const d = above(tau, layersOff(ray.xy.mul(tau)), "r").toVar();
        steps.addAssign(1);
        If(d.lessThanEqual(0), () => {
          fA.assign(at);
          fB.assign(tau);
          fdA.assign(atD);
          fdB.assign(d);
          Break();
        });
        at.assign(tau);
        atD.assign(d);
      });
      tF.assign(refine(fA, fB, fdA, fdB, "r"));
      sF.assign(layersOff(ray.xy.mul(tF)));
      cF.assign(colourOff(ray.xy.mul(tF)));

      // follow the light back up from the floor: the floor and the crypts'
      // walls block it; thin bridging fibres let some through
      if (M.shadow > 0) {
        const L = inp.light;
        const dzL = max(L.z.add(dot(inp.hit.xy, L.xy).div(hr).mul(coneSlope)), 0.2);
        const zF = z0.add(dz.mul(tF)).toVar();
        const reach = D.mul(0.45).sub(zF).div(dzL).toVar();
        const soft = D.mul(0.12);
        const base = ray.xy.mul(tF).toVar();
        Loop(M.shadow, ({ i }: { i: N }) => {
          const sg = reach.mul(float(i).add(1).div(M.shadow));
          const s = layersOff(base.add(L.xy.mul(sg)));
          const z = zF.add(dzL.mul(sg));
          keyLit.mulAssign(float(1).sub(saturate(H(s.r).sub(z).div(soft))));
          keyLit.mulAssign(float(1).sub(s.b.mul(0.8).mul(saturate(H(s.g).sub(z).div(soft)))));
        });
      }
    });
  }
  const xyF = xy0.add(ray.xy.mul(tF));

  // the shell's own relief: is it climbing toward the light here?
  const sL = layersOff(ray.xy.mul(tS).add(L2.mul(0.07)));
  const reliefS = clamp(float(0.62).sub(sL.g.sub(sS.g).mul(4.5).mul(thick)), 0.25, 1.15).toVar();
  const clay = I.view.equal(1);
  const shellCol = select(clay, vec3(0.5), cS.rgb);
  const floorCol = select(clay, vec3(0.5), cF.rgb.mul(sF.a));
  const ao = cF.a;
  const diffF = inp.amb.mul(1.4).mul(ao).add(inp.key.mul(0.62).mul(keyLit));
  const diffS = inp.amb.mul(1.4).mul(mix(float(1), ao, 0.3)).add(inp.key.mul(reliefS));
  // a dark iris shows its structure by relief and a soft sheen on the
  // flanks facing the light, never by pale threads
  // (R3: faint and only on the crests. At 0.1 the fibres read as pale radial
  // lines, most of all through the page's reflection; in the user's dark iris
  // the structure is shade, with no shine along the fibres)
  const sheen = inp.key.mul(cov).mul(smoothstep(0.8, 1.15, reliefS)).mul(0.035);
  shaded.assign(mix(floorCol.mul(diffF), shellCol.mul(diffS).add(sheen), cov));
  alb.assign(mix(floorCol, shellCol, cov));
  xy.assign(xyF);

  // the lab's views of the relief
  const occlusion = mix(ao, float(1), cov);
  If(I.view.equal(2), () => {
    dbg.assign(vec4(occlusion, occlusion.mul(mix(float(0.5), float(1), keyLit)), occlusion.mul(keyLit), 1).mul(vec4(0.8, 0.8, 0.8, 1)));
  });
  If(I.view.equal(3), () => {
    dbg.assign(vec4(steps.div(M.linear * 2 + 1), deep.mul(0.5), 0, 1));
  });
  If(I.view.equal(4), () => {
    dbg.assign(vec4(cov.mul(0.8), saturate(sS.g.sub(sF.r).mul(3)), saturate(float(1).sub(sF.a.mul(2))), 1));
  });

  const rho = length(xy).div(RI).toVar();
  const radial = xy.div(max(length(xy), 1e-4)).toVar();

  // ---- light through the cornea --------------------------------------------
  const oblique = clamp(length(inp.light.xy), 0, 1);
  const across = dot(radial, L2);
  // focused onto the far side, in a crescent near the root: the page itself,
  // inverted by the cornea (top of the page at the bottom), soft
  const focusUv = vec2(float(0.5).add(xy.x.div(RI * 2.3)), float(0.5).sub(xy.y.div(RI * 2.3)));
  const focused = clamp(sampleScreen(screen, clamp(focusUv, 0.02, 0.98), float(6).add(U.mip)).div(inp.avgLum), 0.3, 2.6);
  const caustic = smoothstep(0.15, 0.85, across.negate())
    .mul(exp(rho.sub(0.78).div(0.15).pow(2).negate()))
    .mul(oblique)
    .mul(1.4);
  // the near side sits in the shadow of the limbus
  const limbShadow = smoothstep(0.1, 0.85, across).mul(smoothstep(0.62, 1, rho)).mul(oblique);

  const lit = shaded
    .mul(float(1).sub(limbShadow.mul(0.55)))
    .add(alb.mul(inp.key).mul(focused).mul(caustic))
    .mul(inp.socket)
    .toVar();
  If(dbg.a.greaterThan(0.5), () => {
    lit.assign(dbg.rgb);
  });

  // ---- the pupil: a hole with depth, a faint red fundus, P3 and P4 -------------
  const ang = atan(xy.y, xy.x);
  const pupilHere = pupil.mul(uneven(ang)).toVar();
  const into = rho.div(max(pupilHere, 1e-3)).toVar();
  const edge = fwidth(rho).add(0.003);
  const inPupil = float(1).sub(smoothstep(pupilHere.sub(edge), pupilHere.add(edge), rho)).toVar();
  const hole = mix(vec3(0.012, 0.009, 0.01), vec3(0.002), smoothstep(0.2, 1, into)).toVar();
  hole.addAssign(vec3(0.09, 0.02, 0.02).mul(smoothstepDown(1, 0.25, into)).mul(0.3));
  // (the lens's own mirrors, P3 and P4, are traced in cornea.ts: R4)
  // the red reflex: a light on the camera's axis lights the fundus through the
  // pupil, brightest in the middle
  hole.addAssign(vec3(0.85, 0.16, 0.07).mul(U.redReflex).mul(smoothstepDown(1.02, 0.4, into).mul(0.6).add(0.4)));
  // The margin has thickness. Seen at an angle, a sliver of its inner wall
  // shows on the far side of the hole, the side the view ray is heading to.
  const slant = length(inp.ray.xy).div(max(abs(inp.ray.z), 0.2));
  const wallW = slant.mul(0.3 / RI).mul(max(dot(radial, inp.ray.xy.normalize()), 0));
  // (edges kept apart: equal smoothstep edges are undefined, NaN on some GPUs)
  const wall = smoothstep(pupilHere.sub(wallW).sub(2e-4), pupilHere.sub(wallW.mul(0.4)), rho).mul(inPupil);
  hole.assign(mix(hole, vec3(0.07, 0.04, 0.03).mul(inp.key.mul(0.5).add(inp.amb)).mul(inp.socket), wall.mul(0.9)));

  // past the root, under the rim of the cornea: tissue in shadow
  const beyond = smoothstep(0.98, 1.04, rho);
  const color = mix(mix(lit, hole, inPupil), vec3(0.022, 0.02, 0.022), beyond);
  const flat = mix(mix(alb, vec3(0), inPupil), vec3(0.03), beyond);
  // where the lens shows through the hole, for P3 and P4 (cornea.ts): the
  // iris's margin cuts them off softly
  const throughPupil = inPupil.mul(smoothstepDown(1, 0.8, into));
  return { color, albedo: flat, rho, throughPupil };
}

/** The iris cone's height at a distance from the axis (anatomy.ts IRIS_Z_*). */
export function irisZ(rho: N, zRoot: number, zPupil: number): N {
  return float(zRoot).add(float(zPupil - zRoot).mul(float(1).sub(clamp(rho, 0, 1))));
}

/** Where a refracted ray from the cornea meets the iris cone: two iterations. */
export function hitIris(origin: N, ray: N, zRoot: number, zPupil: number): N {
  const dz = min0(ray.z);
  const t0 = float((zRoot + zPupil) / 2).sub(origin.z).div(dz);
  const h0 = origin.add(ray.mul(t0));
  const t1 = irisZ(length(h0.xy).div(RI), zRoot, zPupil).sub(origin.z).div(dz);
  return origin.add(ray.mul(t1));
}

/** Keeps a ray heading into the eye from dividing by ~0 at grazing angles. */
function min0(z: N): N {
  return select(z.lessThan(-0.05), z, float(-0.05));
}
