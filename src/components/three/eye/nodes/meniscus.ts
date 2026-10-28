/**
 * The tear meniscus: the bead of fluid, a quarter of a millimetre, that lies
 * in the corner where each lid meets the globe, all along both margins.
 *
 * One strip, built in the vertex stage on the lid mesh's own columns
 * (lid-mesh.ts), so it rides every blink, gaze and squint. Across the strip,
 * v runs from the globe a bead's width into the aperture, through the corner
 * where the lid touches the globe, up the margin's inner face: a quadratic
 * curve with its control point in that corner, so the surface is concave,
 * the way fluid fills a corner.
 *
 * It draws only what fluid adds: the screen, mirrored in a surface whose
 * normal sweeps from the globe's to the lid's, so somewhere across it the
 * bead catches the screen as a thin bright line. The lower one faces up into
 * the light and shines; the upper one faces down and mostly doesn't, as in
 * every photograph. Added over what is beneath.
 *
 * The bead is wider at the inner corner (the lacrimal lake), swells and
 * brightens just after a blink, and more with reflex tears.
 *
 * R12: the lower bead is ~0.36 mm, the upper thinner (~0.2), and each tapers
 * out where the margin leaves the globe at the outer corner. Its normal comes
 * from the curve itself (the quadratic's tangent across, the margin's along),
 * so the line sits where the fluid's surface truly faces the screen. That line
 * is brightest when the screen is below (1970, 2000, 2009): the lower bead
 * faces up into it. A few still glints ride the bead where the film is uneven,
 * never moving (the calm rule).
 */

import { AdditiveBlending, DoubleSide, MeshBasicNodeMaterial, PlaneGeometry, type RenderTarget } from "three/webgpu";
import { ANATOMY } from "../anatomy";
import type { EyeUniforms } from "../uniforms";
import { hash21, inPanel, smoothstepDown, vnoise, type N } from "./common";
import { corneaLift, innerAt, lidColumn, outwardAt, sideFromAlpha, type LidColumn } from "./lid-mesh";
import { sampleScreen } from "./screen";
import { T } from "./tsl";

const {
  Fn,
  abs,
  cameraPosition,
  cross,
  dot,
  float,
  fract,
  max,
  min,
  mix,
  mrt,
  normalize,
  positionWorld,
  pow,
  reflect,
  select,
  smoothstep,
  sqrt,
  step,
  uv,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} = T;

const R = ANATOMY.eyeballRadius;

export function meniscusGeometry() {
  return new PlaneGeometry(1, 1, 320, 6);
}

/** The bead's three control points, face space (mm): on the globe, in the corner, up the lid's inner face. */
function beadFrame(c: LidColumn, Ux: EyeUniforms) {
  const U: N = Ux;
  // wider by the inner corner, where tears pool in the lacrimal lake; the
  // lower bead fuller than the upper (R12: ~0.36 and ~0.2 mm, from the
  // stage's 0.3 at rest); tapering out where the margin leaves the globe at
  // the outer corner
  const lake = smoothstep(0.6, 1, c.s.negate()).mul(1.6).add(1);
  const lid = select(c.upper, float(0.65), float(1.2));
  const taper = mix(float(1), smoothstepDown(1, 0.78, c.s), step(0, c.s));
  const w = U.tear.meniscus.mul(lake).mul(lid).mul(taper).toVar();
  // where the lid touches the globe, and a little way up its inner face
  const corner = innerAt(c, float(1), Ux).toVar();
  // (a short way up: the lower lid's inner face is wide now, and the bead is a thread)
  const onLid = innerAt(c, float(0.9), Ux);
  // on the globe, a bead's width into the aperture
  const gxy = corner.xy.sub(c.n2.mul(w));
  // (on the cornea where it stands proud, as the lid's back edge is: innerAt)
  const g0 = vec3(gxy, sqrt(max(float(R * R).sub(dot(gxy, gxy)), 0))).toVar();
  const onGlobe = g0.add(normalize(g0).mul(corneaLift(normalize(g0), Ux).add(0.04)));
  // lift the corner off the surfaces a hair, so the fluid stands in front of both
  const k = corner.add(normalize(corner).mul(0.03));
  return { g: onGlobe, k, l: onLid };
}

/** A point of the bead, face space (mm): column `c`, v across (globe → corner → lid). */
function beadPoint(c: LidColumn, v: N, Ux: EyeUniforms): N {
  const f = beadFrame(c, Ux);
  const a = float(1).sub(v);
  return f.g.mul(a.mul(a)).add(f.k.mul(v.mul(a).mul(2))).add(f.l.mul(v.mul(v))).toVar();
}

/** The bead's tangent across, exactly: the quadratic's derivative. */
function beadAcross(c: LidColumn, v: N, Ux: EyeUniforms): N {
  const f = beadFrame(c, Ux);
  return f.k.sub(f.g).mul(float(1).sub(v)).add(f.l.sub(f.k).mul(v)).mul(2);
}

export function meniscusMaterial(Ux: EyeUniforms, screen: RenderTarget, emissive: boolean) {
  const U: N = Ux;
  const material = new MeshBasicNodeMaterial();
  material.name = "Meniscus";

  const vNormal = varyingProperty("vec3", "vBeadNormal");
  const vV = varyingProperty("float", "vBeadV");
  const vLower = varyingProperty("float", "vBeadLower");
  const vSide = varyingProperty("float", "vBeadSide");

  material.positionNode = Fn(() => {
    const a = uv().x;
    const v = uv().y;
    const side = sideFromAlpha(fract(a)).toVar();
    const bisector = outwardAt(select(side.lessThan(0), float(0), float(0.5)), Ux);
    const col = lidColumn(a, bisector, Ux);
    const colA = lidColumn(a.add(0.002), bisector, Ux);
    const P = beadPoint(col, v, Ux);
    const along = beadPoint(colA, v, Ux).sub(P);
    const across = beadAcross(col, v, Ux);
    const n0 = normalize(cross(along, across)).toVar();
    // out of the fluid: away from the corner it fills
    const corner = innerAt(col, float(1), Ux);
    const away = beadPoint(col, float(0.5), Ux).sub(corner);
    vNormal.assign(select(dot(n0, away).lessThan(0), n0.negate(), n0));
    vV.assign(v);
    vLower.assign(select(col.upper, float(0), float(1)));
    vSide.assign(col.s);
    return P;
  })();

  const bead = Fn(() => {
    const N_ = normalize(vNormal);
    const V = cameraPosition.sub(positionWorld).normalize();
    // the screen, mirrored in the bead
    const Rr = reflect(V.negate(), N_);
    const Nn = U.light.normal;
    const denom = dot(Rr, Nn);
    const tHit = dot(U.light.center.sub(positionWorld), Nn).div(min(denom, -0.02));
    const h = positionWorld.add(Rr.mul(tHit)).sub(U.light.center);
    const suv = vec2(dot(h, U.light.right).div(U.light.size.x).add(0.5), dot(h, U.light.up).div(U.light.size.y).add(0.5));
    const mirror = sampleScreen(screen, suv, float(1.5).add(U.mip)).mul(inPanel(suv, 0.06)).mul(step(denom, -0.02));
    const fres = float(0.02).add(pow(float(1).sub(max(dot(N_, V), 0)), 5).mul(0.98));
    // where across the bead the screen lands is the normal's business; only its edges feather
    const core = smoothstep(0, 0.12, vV).mul(smoothstepDown(1, 0.85, vV));
    // it runs out into the corners
    // (over the last quarter, and the film itself breaks along the lid: brighter
    // where it pools, thin and dull between. Even end to end, it drew the rim
    // as an eyeliner outline, the user 2026-10-29)
    const ends = smoothstepDown(1, 0.72, abs(vSide));
    const pools = vnoise(vec2(vSide.mul(5), vLower.mul(3.1))).mul(0.55).add(vnoise(vec2(vSide.mul(13), vLower.mul(5.7).add(2))).mul(0.3)).add(0.3);
    // (the lower bead faces up into the light: in the user's photo it is the
    // brightest line on the eye, ~20 L* over the rim under it; brighter again
    // when the screen is below and looks straight into it, the upper one when
    // it is above)
    const slope = U.light.dir.y.div(max(U.light.dir.z, 0.25));
    const facing = mix(max(slope, 0).mul(0.6), max(slope.negate(), 0).mul(0.8), vLower).add(1);
    const strength = mix(0.5, 1.3, vLower).mul(U.tear.wet).mul(facing);
    // still glints where the film is uneven along the bead (fixed in place:
    // nothing at rest shimmers)
    const glint = pow(hash21(vec2(vSide.mul(160).floor(), vLower.mul(7))), 6).mul(1.4).add(0.85);
    // the screen is far brighter than the eye it lights: weighted as the cornea's mirror is
    return mirror
      .mul(fres.mul(3.6).add(0.7).mul(0.5))
      .mul(core)
      .mul(ends)
      .mul(pools)
      .mul(strength)
      .mul(glint)
      .mul(U.reflect)
      .mul(U.fade);
  })();
  material.colorNode = bead;
  // what the bead adds is light: it blooms (where there is an emissive target)
  if (emissive) material.mrtNode = mrt({ emissive: vec4(bead, 1) });
  material.transparent = true;
  material.blending = AdditiveBlending;
  material.depthWrite = false;
  material.side = DoubleSide;
  material.forceSinglePass = true;
  return material;
}
