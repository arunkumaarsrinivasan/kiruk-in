/**
 * The lid margins, in 3D: angles around the globe's centre, in face space (the
 * lids belong to the face, not to the turning eye).
 *
 * Every point of the eye region is an azimuth φ (0 straight ahead, medial
 * negative, lateral positive) and an elevation θ. The upper and lower margins
 * are curves θ(φ) between the two corners. The lid mesh is built on them, and
 * the shadow the lids lay on the white and the iris is measured from them, so
 * the shadow can never drift off the lid that casts it.
 *
 * What moves the margins, per frame (all uniforms):
 *  · blink — the upper lid sweeps down onto the lower, which rises a little;
 *  · gaze — the upper lid follows the eye's pitch closely, the lower lid a
 *    little; the apex drifts toward where the cornea is (lid–gaze coupling);
 *  · squint — a bright screen narrows both lids;
 *  · the person — aperture, canthal tilt, an epicanthic fold.
 */

import { ANATOMY } from "../anatomy";
import { LAKE_A, LAKE_B, LID_THICKNESS, MARGIN_RADIUS, MEDIAL } from "../twin/margins";
import type { EyeUniforms } from "../uniforms";
import { smoothstepDown, vnoise, type N } from "./common";
import { T } from "./tsl";

const { abs, asin, atan, clamp, cos, exp, float, length, max, min, mix, pow, select, sin, smoothstep, sqrt, vec2 } = T;

// The fissure's constants live with the CPU twin (twin/margins.ts), which
// mirrors `marginsAt` below line for line: change both together.
export { FISSURE_MM, LID_GAZE, LID_THICKNESS, MARGIN_RADIUS, fissureAngles } from "../twin/margins";
import { LID_GAZE, LID_UP_CEILING } from "../twin/margins";

/** Where a point is, as seen from the globe's centre. */
export function faceAngles(P: N) {
  return { phi: atan(P.x, P.z), theta: asin(clamp(P.y.div(max(length(P), 1e-4)), -1, 1)) };
}

/** -1 at the medial corner, 0 at the apex, +1 at the lateral corner (beyond, |s| > 1). */
export function sideOf(phi: N, Ux: EyeUniforms): N {
  const L: N = Ux.lids;
  return select(
    phi.lessThan(L.peak),
    phi.sub(L.peak).div(L.peak.sub(L.phiM)),
    phi.sub(L.peak).div(L.phiL.sub(L.peak)),
  );
}

/** The azimuth at a side position s (inverse of sideOf). */
export function azimuthOf(s: N, Ux: EyeUniforms): N {
  const L: N = Ux.lids;
  return select(s.lessThan(0), L.peak.add(s.mul(L.peak.sub(L.phiM))), L.peak.add(s.mul(L.phiL.sub(L.peak))));
}

/** The tear lake's rounding (marginsAt): 1 until the lake, falling to 0 at the corner like a circle. */
function cap0(a: N): N {
  const t = clamp(a.sub(LAKE_B).div(1 - LAKE_B), 0, 1);
  return sqrt(max(float(1).sub(t.mul(t)), 0));
}
function lake0(a: N, inner: N): N {
  return select(inner, smoothstep(LAKE_A, LAKE_B, a), float(0));
}

/** The medial bows (twin/margins.ts MEDIAL, fitted to the user's eye). */
function bowUm(a: N): N {
  return float(1).sub(pow(a, MEDIAL.pU)).mul(float(1).sub(smoothstep(MEDIAL.taper0, 1, a).mul(MEDIAL.taper)));
}
function bowLm(al: N): N {
  return float(1).sub(smoothstep(MEDIAL.l0, MEDIAL.l1, al));
}
const ssJs = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
/** The bows where the lake begins, for its round-off (constants). */
const BOW_U_LAKE = (1 - Math.pow(LAKE_B, MEDIAL.pU)) * (1 - MEDIAL.taper * ssJs(MEDIAL.taper0, 1, LAKE_B));
const BOW_L_LAKE = 1 - ssJs(MEDIAL.l0, MEDIAL.l1, (LAKE_B + 0.07) / 1.07);

/**
 * The margins' elevation at side position s: open (no blink: the lid's resting
 * line, which the far skin is anchored to) and now.
 */
export function marginsAt(s: N, Ux: EyeUniforms) {
  const U: N = Ux;
  const L = U.lids;
  const inner = s.lessThan(0);
  // The shape is drawn as the eye is seen, across the image. s runs evenly in
  // azimuth, which crowds into the corners as the globe turns away from us
  // (the inner corner's last fifth of s spans about a millimetre), so arcs
  // bowed in s close bluntly there, in a rounded end that reads as a boot.
  // Bowed in the projected x instead, the outer corner tapers to a point and
  // the inner one rounds off round the tear lake (below).
  const sp = sin(L.peak);
  const sx = sin(azimuthOf(s, Ux)).sub(sp);
  const xs = select(inner, sx.div(sp.sub(sin(L.phiM))), sx.div(sin(L.phiL).sub(sp))).toVar();
  const a = clamp(abs(xs), 0, 1);
  // An almond: two near-symmetric arcs that meet in pointed corners. Only a
  // hint of a real eye's asymmetry (strong asymmetry read as a boot once the
  // eye filled the frame): the upper lid's highest point a little toward the
  // nose, the lower lid's lowest a little toward the temple.
  // (medial: the bows fitted to the user's eye, R6: twin/margins.ts MEDIAL)
  const bowU0 = select(inner, bowUm(a), float(1).sub(pow(a, 2.2)));
  const sl = xs.sub(0.07);
  const bowU = mix(bowU0, cap0(a).mul(BOW_U_LAKE), lake0(a, inner)).toVar();
  const innerL = sl.lessThan(0);
  const al = clamp(select(innerL, sl.negate().div(1.07), sl.div(0.93)), 0, 1);
  // (the lateral lower lid shallower, as in the user's eye: exponent 1.6, was 2.3)
  const bowL0 = select(innerL, bowLm(al), float(1).sub(pow(al, 1.6)));
  // The inner corner is not a point like the outer one: the lids part round
  // the tear lake (lacus lacrimalis) that holds the caruncle, so the last
  // millimetre or so closes in a rounded end about 2 mm tall. (Each lid holds
  // the height it had where the lake begins, then rounds off to the corner.)
  const bowL = mix(bowL0, cap0(a).mul(BOW_L_LAKE), lake0(a, inner)).toVar();
  // Toward each corner both lids come down to its canthus as their bows run
  // out: both sit under the globe's centre, the inner one ~3 mm, the outer
  // ~1.9 (the user's eye, R6), so the upper arc is tall and the lower shallow
  // and the inner corner is a low, tight angle (at 0.9 mm it was a tall blunt
  // end the caruncle filled). The person's tilt lifts the outer corner on top.
  const lift = L.tilt.mul(pow(clamp(xs, 0, 1), 2));
  const dropU = select(inner, L.drop, L.dropL).mul(float(1).sub(bowU));
  const dropL = select(innerL, L.drop, L.dropL).mul(float(1).sub(bowL));
  // An epicanthic fold draws the upper lid down toward the inner corner; it
  // lets go at the corner itself, where both margins have to meet.
  const fold = L.epicanthus
    .mul(0.035)
    .mul(smoothstep(0.4, 0.9, s.negate()))
    .mul(float(1).sub(pow(a, 6)));
  // No lid is a drawn curve: a little unevenness along each margin, different
  // on the two lids, so the almond is not a perfect one
  const unevenU = sin(xs.mul(4.1).add(0.6)).mul(0.018).add(sin(xs.mul(9.3).add(2.2)).mul(0.007));
  const unevenL = sin(xs.mul(5.7).add(1.1)).mul(0.012).add(sin(xs.mul(11.1).add(0.3)).mul(0.005));
  // how far each margin rides with the eye's pitch (twin/margins.ts LID_GAZE)
  // (the upward ride held under the lid's ceiling, LID_UP_CEILING: tanh, softly)
  const rideUp = L.pitch.mul(LID_GAZE.upperUp / LID_UP_CEILING).toVar();
  const e2 = exp(rideUp.mul(2).min(20));
  const riseU = e2.sub(1).div(e2.add(1)).mul(LID_UP_CEILING);
  const gazeU = select(L.pitch.lessThan(0), L.pitch.mul(LID_GAZE.upperDown), riseU).mul(bowU).toVar();
  const gazeL = L.pitch.mul(select(L.pitch.lessThan(0), float(LID_GAZE.lowerDown), float(LID_GAZE.lowerUp))).mul(bowL).toVar();
  const upOpen = L.upper
    .mul(bowU)
    .add(unevenU.mul(bowU))
    .mul(float(1).sub(L.squint.mul(0.25)))
    .add(gazeU)
    .add(lift)
    .sub(dropU)
    .sub(fold);
  const loOpen = L.lower
    .mul(bowL)
    .mul(float(1).sub(L.squint.mul(0.2)))
    .negate()
    .add(unevenL.mul(bowL))
    .add(gazeL)
    .add(lift)
    .sub(dropL)
    .toVar();
  // the margins never cross, whatever folds or gazes ask
  const upOpenSafe = max(upOpen, loOpen.add(0.004)).toVar();
  // the blink: the upper lid comes down to the lower, which rises to meet it
  const lo = loOpen.add(U.blink.mul(0.12).mul(L.lower).mul(bowL)).toVar();
  const up = max(mix(upOpenSafe, lo.add(0.012), U.blink), lo.add(0.004)).toVar();
  // a feeling's raise or droop (rig/brow.ts AU5, AU43): the levator moves the
  // margin and the tarsus; the skin past the crease stays (lid-mesh.ts skinAt)
  const feelU = L.upper.sub(L.upperRest).mul(bowU).mul(float(1).sub(L.squint.mul(0.25)));
  return { upOpen: upOpenSafe, loOpen, up, lo, gazeU, gazeL, feelU };
}

/**
 * How much of a margin's inner face shows from the front, 0..1 (the share of
 * its run back to the globe laid across the image rather than along the
 * view). The upper margin is the lash line with the white right under it,
 * barely any face. The lower one faces up, and shows its true projection
 * (R6): the intermarginal strip, ~0.44 mm of tan, wet rim under the iris, as
 * the user's eye shows it (at half that it read as a red line). The two meet
 * at both corners in a point; at the inner one the caruncle lies behind them
 * (canthus.ts).
 */
export function rimShow(s: N, upper: N): N {
  const top = float(0.14).mul(float(1).sub(smoothstep(0.5, 1, s).mul(0.6)));
  return select(upper, top.mul(toCanthus(s)), lowerShow(s));
}

/** `rimShow` for the lower margin. */
function lowerShow(s: N): N {
  const a = clamp(abs(s), 0, 1);
  // (the strip faces up, toward the globe: from a camera at the eye's level it
  // is foreshortened to about half its 1.1 mm. Shown whole, it was a wide flat
  // band under the white, "concrete": the user, 2026-10-28)
  // (and toward the inner corner it turns into the lake with the upper lid:
  // narrowing only past s −0.8 it ran on as a lit ledge beyond where the upper
  // lid came down, the corner "broken", the user 2026-10-29)
  return mix(float(0.55), float(0.35), smoothstep(0.35, 0.95, a)).mul(toCanthus(s)).mul(float(1).sub(smoothstep(0.6, 0.85, s.negate()).mul(0.6)));
}

/** Both faces narrow into the inner canthus, where the lids meet over the lake. */
function toCanthus(s: N): N {
  return float(1).sub(smoothstep(0.8, 0.97, s.negate()).mul(0.85));
}

/**
 * How much of the screen's light the upper lashes take from a point of the
 * globe or cornea, 0..1, given where the point is (side s, elevation θ) and
 * where the upper margin is above it. A lash is a tenth of a millimetre wide,
 * so this is a projected density, not a shadow map. A strand leaves the
 * margin heading at the camera and curls up: h mm in front of the lid it
 * stands about k·h²/2 above the margin (k its curl per mm). Look from the
 * point toward the screen at three such heights and ask how much fringe is
 * there; the margin there is the one above the point, stepped along its
 * slope (one lookup, not three). The fringe gathers into clumps and thins
 * out at the corners, as the lashes do.
 */
export function lashShade(s: N, theta: N, up: N, Ux: EyeUniforms): N {
  const U: N = Ux;
  const LS = U.lashes;
  const L = U.lids;
  const rM = MARGIN_RADIUS;
  const slopeS = marginsAt(s.add(0.04), Ux).up.sub(up).div(0.04).toVar();
  const span = select(s.lessThan(0), L.peak.sub(L.phiM), L.phiL.sub(L.peak));
  const perS = float(1).div(max(cos(theta), 0.3).mul(rM).mul(span)).toVar();
  const len = max(LS.length, 0.3).mul(10).toVar();
  const k = LS.curl.mul(0.9).add(0.45).div(len);
  const toLight = U.light.dir.xy.div(max(U.light.dir.z, 0.25)).toVar();
  // R11: as soft as the device is big (penumbra × the lash's height over the
  // eye): a phone (0.18–0.23) lays distinct strands, a window (0.8) a haze
  const pen = U.light.penumbra;
  const crisp = float(1).sub(smoothstep(0.15, 0.8, pen)).toVar();
  let sum: N = float(0);
  for (const f of [0.25, 0.45, 0.65]) {
    const h = len.mul(f);
    const off = toLight.mul(h);
    const dS = off.x.mul(perS);
    const sQ = s.add(dS);
    const above = theta.add(off.y.div(rM)).sub(up.add(slopeS.mul(dS))).mul(rM);
    const at = k.mul(h).mul(h).mul(0.5);
    const spread = h.mul(pen.mul(0.3).add(0.04)).add(0.25);
    const z = above.sub(at).div(spread);
    const fringe = exp(z.mul(z).negate());
    const along = smoothstep(-0.85, -0.5, sQ).mul(smoothstepDown(0.98, 0.85, sQ));
    const strands = vnoise(vec2(sQ.mul(38), f * 7));
    // (the strands stand out in crisp light, and merge in soft)
    const streak = mix(float(0.65), float(0.85), strands).add(strands.sub(0.5).mul(crisp).mul(1.1));
    sum = sum.add(fringe.mul(along).mul(max(streak, 0.1)));
  }
  // (a touch stronger: with the denser fringe its strands should read on the white)
  return clamp(sum.div(3).mul(LS.upper).mul(LS.mascara.mul(0.4).add(1.3)), 0, 0.8);
}

/**
 * How much of the screen's light the lids leave on the eye at a point of the
 * globe or cornea (face-space position): the upper lid shades a third of what
 * it rests on, the lash line darkens a band right under it, the lashes lay
 * their fringe's shadow below that, the lower lid shades a little, the
 * corners are pockets. Also how near the point is to a margin, for the
 * white's reddening.
 */
export function socketShade3d(P: N, Ux: EyeUniforms) {
  const { phi, theta } = faceAngles(P);
  const s = sideOf(phi, Ux).toVar();
  const m = marginsAt(s, Ux);
  const R = ANATOMY.eyeballRadius;
  // Seen from the front the white shows right up to where each margin's inner
  // face meets the globe (lid-mesh.ts `innerAt`, turned by `rimShow`), so
  // measure from there: the face's back edge lies at r = rM − show·(1.1 − 0.06)
  // across the image, on the line to the margin's front edge.
  const upF = asin(clamp(sin(m.up).mul(1.078), -1, 1)).toVar();
  const loBack = float(MARGIN_RADIUS).sub(lowerShow(s).mul(LID_THICKNESS - 0.06));
  const loF = asin(clamp(sin(m.lo).mul(loBack.div(ANATOMY.eyeballRadius)), -1, 1)).toVar();
  const underUpper = max(upF.sub(theta), 0).mul(R); // mm
  const aboveLower = max(theta.sub(loF), 0).mul(R);
  // R11: the lids' shadow follows the era's screen (C3), not a fixed band.
  // Each lid's edge stands proud of the globe (the upper ~2.4 mm with its hood
  // and lash roots, the lower ~1.6 mm with its lashes), so a screen above casts the upper lid's
  // shadow down the white by that height × the light's slope, and a screen
  // below (1970, 2000, 2009) casts the lower lid's up it instead. The edge is
  // as soft as the device is big: penumbra × the gap. What stays whatever the
  // light is contact: the socket's own occlusion close under each lid.
  // (Before: −66 % over 5.6 mm under the upper lid in every era, so light
  // from below still shaded the top of the white.)
  const L = Ux.light;
  const slope = L.dir.y.div(max(L.dir.z, 0.25)).toVar(); // > 0: the screen is above
  // how far the lids have closed on the globe (a blink, a squint, a lowered lid): the socket deepens
  const closing = clamp((Ux as N).blink.add((Ux as N).lids.squint.mul(0.5)), 0, 1);
  const pen = L.penumbra;
  const castU = max(slope, 0).mul(2.4);
  const softU = pen.mul(2.4).add(0.2);
  const shadowU = float(1).sub(smoothstep(castU.sub(softU.mul(0.5)), castU.add(softU.mul(0.5)), underUpper));
  // (the lower lid with its lashes: ~1.6 mm proud)
  const castL = max(slope.negate(), 0).mul(1.6);
  const softL = pen.add(0.15);
  const shadowL = float(1).sub(smoothstep(castL.sub(softL.mul(0.5)), castL.add(softL.mul(0.5)), aboveLower));
  const shade = float(1)
    // the screen's own shadow from each lid
    .sub(shadowU.mul(0.55))
    .mul(float(1).sub(shadowL.mul(0.4)))
    // contact: the socket close under the upper lid, whatever the light
    // (at 0.26 over 4 mm a white lit from below read flat, a sticker under the lid),
    // deepening as the lids close on the globe (R11: a blink, a squint), and
    // deeper at rest than R11 first had it: the upper lid and its lashes lay a
    // mild shade over the top of the eye in every light (the user's photo)
    .mul(float(1).sub(smoothstepDown(5, 0, underUpper).mul(closing.mul(0.18).add(0.46))))
    .mul(float(1).sub(smoothstepDown(1.1, 0, underUpper).mul(0.4)))
    // (the lower lid shades the white only a little: in the user's photo the
    // white runs light right down to the rim)
    // (and the lower lid its own slight shade on the bottom of the eye)
    .mul(float(1).sub(smoothstepDown(2.5, 0, aboveLower).mul(0.15)))
    .mul(float(1).sub(smoothstepDown(0.7, 0, aboveLower).mul(0.15)))
    .toVar();
  const canthus = smoothstepDown(0.34, 0.02, float(1).sub(abs(s)));
  // (a pocket in shadow, not a hole: the corners stay flesh, never black)
  shade.mulAssign(float(1).sub(canthus.mul(canthus).mul(0.28)));
  shade.mulAssign(float(1).sub(lashShade(s, theta, upF, Ux)));
  const fromMargin = min(underUpper, aboveLower);
  const toRim = smoothstepDown(3.4, 0, fromMargin);
  return { shade, toRim, s };
}
