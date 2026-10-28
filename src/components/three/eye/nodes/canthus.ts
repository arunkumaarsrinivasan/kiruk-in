/**
 * The inner corner (R6): the caruncle, the plica semilunaris and the floor of
 * the tear lake, drawn as one field over whatever lies behind the lids there
 * (the white, or the socket past the globe's edge). There is no caruncle mesh.
 *
 * Why a field: the caruncle was an egg mesh standing 1.5 mm proud, with
 * see-through edges that banded into an outline: a pink bead stuck in the
 * corner. In the user's own eye (docs/era-pov/ref/user-eye.webp) the corner is
 * flat, wet, salmon tissue that runs into the lower rim on one side and, through
 * the plica's darker fold and a pink blush, into the white on the other. Looked
 * up where each view ray crosses one plane, the white and the socket show the
 * same tissue at the same place, so their seam never shows, and the lighting is
 * the field's own, so it is the same on both.
 *
 * Shape, mm from the canthus (procedural-eye's docs/RESEARCH.md, from its lid
 * sources; not yet checked against them, †): the caruncle about 3 wide and 5
 * high (most of it under the lids), its middle ~1 out, its top under half a
 * millimetre proud; the plica a narrow crescent ~2 mm wide lateral of it, its
 * free edge concave toward the cornea.
 * Colours: the user's photo, as relations (it is graded): the caruncle salmon
 * (hue 45°, darker than the lower rim), the plica a pigmented fold in the upper
 * lid's shadow, a pink blush before the white.
 */

import type { RenderTarget } from "three/webgpu";
import type { EyeUniforms } from "../uniforms";
import { hash21, inPanel, smoothstepDown, vnoise, type N } from "./common";
import { screenKey } from "./light";
import { MARGIN_RADIUS, socketShade3d } from "./margins";
import { T } from "./tsl";

const { If, abs, cameraPosition, clamp, cos, dot, float, floor, fract, length, max, min, mix, normalize, pow, reflect, sin, smoothstep, sqrt, step, texture, vec2, vec3 } = T;

/** Where every surface's view ray is looked up: a plane through the lake, mm in front of the globe's centre. */
const Z_REF = 3;

/**
 * Flesh, as blood and thin skin colour it: what each tissue is mixed toward
 * from the person's tone, so a darker person's corner stays pigmented
 * (`mix(tone, flesh, share)`). Linear RGB. Set against the user's photo as
 * relations: the strip is lighter than the skin below it and about half as
 * light as the white; the caruncle a little darker than the strip, redder.
 */
export const FLESH = {
  /** The lower lid's intermarginal strip: keratinised, tan-orange (the photo's rim, hue ~64°). */
  rim: { rgb: [0.56, 0.36, 0.18], share: 0.32 },
  /** The mucocutaneous junction and the wet conjunctiva behind the strip: pinker. */
  mucosa: { rgb: [0.7, 0.3, 0.24], share: 0.3 },
  /** The caruncle: rose-red (the user's ungraded photo: L* 50, a* 20, b* 15, hue 37°). */
  caruncle: { rgb: [0.75, 0.28, 0.22], share: 0.38 },
  /** The plica: a thin fold of conjunctiva, pale pink, near the white (a strong pink drew an outline). */
  plica: { rgb: [0.7, 0.5, 0.46], share: 0.6 },
} as const;

/** `mix(tone, flesh, share)` for one of FLESH's tissues. */
export function flesh(tone: N, k: keyof typeof FLESH): N {
  const f = FLESH[k];
  return mix(tone, vec3(...f.rgb), f.share);
}

/** The caruncle's half-width, mm: it fills the lake to the canthus itself (with the corner now a tight angle, ~2.3 mm of it shows). */
const CARUNCLE_RU = 1.3;

/** The plica's free edge, mm out from the canthus at height v: a crescent, concave toward the cornea. */
function plicaEdge(v: N): N {
  return v.mul(v).mul(0.22).add(2.5);
}

/** The caruncle's and the plica's relief at (u, v), mm from the canthus: height toward the camera, mm. */
function relief(u: N, v: N, cu: N): N {
  const du = u.sub(cu).div(CARUNCLE_RU);
  const dv = v.div(2.5);
  const e = du.mul(du).add(dv.mul(dv));
  const mound = pow(max(float(1).sub(e), 0), 2).mul(0.28);
  const x = u.sub(plicaEdge(v));
  const fold = smoothstep(-1.5, -0.3, x).mul(smoothstepDown(0.12, -0.15, x)).mul(0.26);
  return mound.add(fold);
}

/**
 * The inner corner at a surface point P (face space, mm):
 *  · `tissue`: how much of the caruncle and the plica covers it (0..1), and
 *    `rgb`, that tissue lit and wet by the field's own light, so the white
 *    and the socket show it alike;
 *  · `blush`: what the white's own albedo is multiplied by lateral of the
 *    plica (pink, a little darker toward its edge), so the white keeps its own
 *    light and vessels there and no band shows where the tissue ends.
 * Everything is computed only near the corner.
 */
export function canthusField(P: N, Ux: EyeUniforms, screen: RenderTarget) {
  const U: N = Ux;
  const tissue = float(0).toVar();
  const rgb = vec3(0).toVar();
  const blush = vec3(1).toVar();
  // the view ray through P, where it crosses the lake's plane
  const ray = P.sub(cameraPosition).toVar();
  const xy = P.xy.add(ray.xy.mul(float(Z_REF).sub(P.z).div(min(ray.z, -1e-3)))).toVar();
  // the canthus: margins.ts `marginsAt` at s = −1, where both lids meet `drop` under the equator
  const tip = vec2(sin(U.lids.phiM).mul(cos(U.lids.drop)), sin(U.lids.drop).negate()).mul(MARGIN_RADIUS);
  const u = xy.x.sub(tip.x).toVar();
  const v = xy.y.sub(tip.y).toVar();
  If(u.greaterThan(-0.8).and(u.lessThan(7.6)).and(abs(v).lessThan(4.6)), () => {
    // the caruncle rides a little with the eye (rule 7: fixed, it looked glued on)
    const cu = U.gaze.x.mul(0.3).add(1.05).toVar();
    const uP = plicaEdge(v).toVar();
    // (everything fades out before the field's own bounds, under the lids)
    const within = smoothstepDown(4.4, 3.6, abs(v));
    // ---- form: the relief's slope, and the lake's floor facing out of the corner
    const e2 = 0.04;
    const h0 = relief(u, v, cu);
    const dhu = relief(u.add(e2), v, cu).sub(h0).div(e2);
    const dhv = relief(u, v.add(e2), cu).sub(h0).div(e2);
    const du = u.sub(cu).div(CARUNCLE_RU);
    const dv = v.div(2.5);
    const lobes = vnoise(xy.mul(1.4).add(2.3)).sub(0.5).mul(0.3);
    const carW = smoothstepDown(1.04, 0.8, du.mul(du).add(dv.mul(dv)).add(lobes)).toVar();
    // papillae on the caruncle: fine bumps that break its wet sheen into specks
    const pp = xy.mul(7.5);
    const b0 = vnoise(pp);
    const bump = vec2(vnoise(pp.add(vec2(0.13, 0))).sub(b0), vnoise(pp.add(vec2(0, 0.13))).sub(b0)).mul(carW.mul(1.8));
    // (the tear film lies smooth over the papillae: it mirrors the macro form;
    // only the light's specks see the bumps)
    const Nm = normalize(vec3(float(0.3).sub(dhu), dhv.negate(), 1)).toVar();
    const N0 = normalize(vec3(float(0.3).sub(dhu).sub(bump.x), dhv.negate().sub(bump.y), 1)).toVar();

    // ---- colour ----------------------------------------------------------------
    const tone = vec3(U.skin.tone);
    // the plica, darker and browner in its valley against the caruncle
    const plica = flesh(tone, "plica");
    const alb = mix(plica.mul(vec3(0.66, 0.58, 0.55)), plica, smoothstep(uP.sub(1.4), uP.sub(0.3), u)).toVar();
    // the caruncle: salmon, mottled with the person's pigment, a few sebaceous dots
    const mottle = vnoise(xy.mul(3.1).add(7.7));
    const car = flesh(tone, "caruncle").mul(mix(vec3(1), vec3(0.9, 0.84, 0.78), smoothstep(0.45, 0.8, mottle))).toVar();
    const cell = floor(xy.mul(3.2)).toVar();
    const jit = vec2(hash21(cell), hash21(cell.add(17.3))).mul(0.6).add(0.2);
    const dot0 = length(fract(xy.mul(3.2)).sub(jit));
    const gland = smoothstepDown(0.11, 0.04, dot0).mul(step(0.72, hash21(cell.add(5.1))));
    car.assign(mix(car, vec3(0.6, 0.46, 0.3), gland.mul(0.18)));
    alb.assign(mix(alb, car, carW));
    // (the plica's horns run on under the lids; seen, it is a short crescent by
    // the canthus, never an arc round the white: the corner is a tight angle now)
    const horns = smoothstepDown(1.9, 1.1, v).mul(smoothstep(-1.4, -0.8, v));
    tissue.assign(max(carW, smoothstepDown(uP.add(0.15), uP.sub(0.45), u).mul(horns)).mul(within));
    // the white lateral of the plica: pink, darker toward the fold's edge
    blush.assign(mix(vec3(1), vec3(0.8, 0.58, 0.54), smoothstepDown(uP.add(1.3), uP.sub(0.2), u).mul(horns).mul(within)));

    // ---- light: the field's own, the same on the white and the socket ---------
    const L = screenKey(Ux, screen);
    const NL = dot(N0, L.dir);
    const wrapW = vec3(0.5, 0.32, 0.26);
    const diff = pow(clamp(vec3(NL).add(wrapW).div(wrapW.add(1)), 0, 1), vec3(1.5));
    // the lids' shadow where they meet over the lake (measured on the margins'
    // sphere, as the white is), and the pocket deepening into the canthus
    const onSphere = vec3(xy, sqrt(max(float(MARGIN_RADIUS * MARGIN_RADIUS).sub(dot(xy, xy)), 0.04)));
    // (the upper lid's shadow falls across its top: dark red there, as in the
    // user's photo, L* 28 against 50)
    const occl = mix(float(1), socketShade3d(onSphere, Ux).shade, 0.9).toVar();
    const pocket = mix(float(0.66), float(1), smoothstep(-0.4, 1.6, u));
    // light through wet tissue comes back red, as through thin skin
    const bleed = alb.mul(vec3(0.22, 0.05, 0.03)).mul(smoothstep(-0.3, 0.4, NL)).mul(float(1).sub(smoothstep(0.4, 0.9, NL)));
    const fill = L.fill.mul(clamp(dot(N0, L.fillDir).add(0.25).div(1.25), 0, 1));
    const lit = alb.mul(L.amb.add(L.key.mul(diff)).add(fill)).add(bleed.mul(L.key)).mul(occl).mul(pocket).toVar();

    // ---- wet: the screen in the tear film, and droplets on the papillae ---------
    const V = cameraPosition.sub(P).normalize().toVar();
    const Rr = reflect(V.negate(), Nm);
    const Nn = U.light.normal;
    const denom = dot(Rr, Nn);
    const tHit = dot(U.light.center.sub(P), Nn).div(min(denom, -0.02));
    const h = P.add(Rr.mul(tHit)).sub(U.light.center);
    const suv = vec2(dot(h, U.light.right).div(U.light.size.x).add(0.5), dot(h, U.light.up).div(U.light.size.y).add(0.5));
    // (explicit level: this runs only near the corner, where derivatives aren't defined)
    const mirror = texture(screen.texture, vec2(suv.x, float(1).sub(suv.y)))
      .level(float(3.6).add(U.mip))
      .rgb.mul(inPanel(suv, 0.2))
      .mul(step(denom, -0.02));
    const fres = float(0.025).add(pow(float(1).sub(max(dot(Nm, V), 0)), 5).mul(0.975));
    const wetAmt = mix(float(0.22), float(0.26), carW).mul(U.tear.wet);
    const spec = mirror.mul(fres.mul(2.4).add(0.3)).mul(wetAmt).mul(U.reflect).mul(occl).toVar();
    // Tear droplets caught on the papillae: a few small sharp specks of the
    // screen's light, ~0.05 mm, about one per square millimetre. (A highlight
    // lobe on the bumps spread into blotches; a droplet is a point.)
    const gc = floor(xy.mul(2.2)).toVar();
    const gj = vec2(hash21(gc.add(3.1)), hash21(gc.add(8.4))).mul(0.6).add(0.2);
    const gr = length(fract(xy.mul(2.2)).sub(gj)).div(2.2);
    const gs = hash21(gc.add(1.7)).mul(0.02).add(0.022);
    const drop = smoothstepDown(gs, gs.mul(0.4), gr).mul(step(0.58, hash21(gc.add(4.4)))).mul(carW);
    spec.addAssign(L.key.mul(drop).mul(hash21(gc.add(6.6)).mul(0.6).add(0.5)).mul(U.tear.wet).mul(occl));

    rgb.assign(lit.add(spec).mul(U.fade));
  });
  return { tissue, rgb, blush };
}
