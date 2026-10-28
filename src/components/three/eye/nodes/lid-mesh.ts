/**
 * The lids and the skin around them: one ring mesh, built in the vertex stage
 * on the margin curves (margins.ts), so it blinks, follows the gaze and
 * squints with no geometry ever re-uploaded.
 *
 * Across the mesh (α) runs once around the eye: from the inner corner along
 * the upper margin to the outer corner, and back along the lower margin.
 * Down the mesh (q) runs from where the lid touches the globe, round the
 * margin's rounded edge, then out over the skin:
 *
 *   q 0 ─────────── 0.14 ───────────────────────────────── 1
 *     inner face     │ margin edge   crease   brow / cheek
 *     (conjunctiva,  │  (grey line, lash line)
 *      waterline)    │
 *
 * A lid is a slab ~1.5 mm thick, so its margin has a face you can see: the
 * wet waterline on the inner side, the grey line, the lash line. The skin is
 * anchored far out and stretches near the margin, so a blink pulls the lid
 * down without dragging the brow with it.
 *
 * Skin: the person's Monk tone, warmer and thinner toward the margin, pores
 * and lines from a bake (bake/skin.ts), the screen's light wrapping past the
 * terminator with red bleeding through, a faint sheen and a wet waterline
 * that mirror the screen. Far from the eye it darkens into the room.
 */

import { BackSide, DoubleSide, MeshBasicNodeMaterial, PlaneGeometry, type RenderTarget } from "three/webgpu";
import { ANATOMY, BELL_PITCH, CORNEA_CENTER_Z, GAZE_PITCH, GAZE_YAW, LIMBUS_Z } from "../anatomy";
import { DEBUG_VIEWS, type EyeUniforms } from "../uniforms";
import { BROW_BOUNDS, VELLUS_TILE_MM, type BrowBake } from "../bake/brow";
import { browEdges, browMoveNet } from "./brow-net";
import { BROW_SHAPE } from "../brow-shape";
import { SKIN_MAP, SKIN_TILE_MM, type SkinFaceBake } from "../bake/skin-face";
import { canthusField, flesh } from "./canthus";
import { inPanel, smoothstepDown, vnoise, type N } from "./common";
import { screenKey } from "./light";
import { LID_THICKNESS, azimuthOf, marginsAt, rimShow } from "./margins";
import { sampleScreen, screenLight } from "./screen";
// (a row is either the margin's inner face or skin: each vertex builds only its own)
import { T } from "./tsl";

const {
  Fn,
  If,
  abs,
  cameraPosition,
  clamp,
  cos,
  cross,
  dFdx,
  dFdy,
  dot,
  exp,
  float,
  fract,
  length,
  max,
  min,
  mix,
  normalize,
  positionWorld,
  pow,
  reflect,
  select,
  sin,
  smoothstep,
  sqrt,
  step,
  texture,
  uv,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} = T;

/** How far the skin reaches out from the margin, mm: past a phone's tall frame. */
export const REACH = 36;
/** The share of the mesh's rows given to the margin's inner face. */
export const QI = 0.14;
const R = ANATOMY.eyeballRadius;
const VIEW = (name: (typeof DEBUG_VIEWS)[number]) => DEBUG_VIEWS.indexOf(name);

export function lidGeometry() {
  return new PlaneGeometry(1, 1, 320, 64);
}

/**
 * The face around the eye, as a height field: how far toward the camera the
 * skin sits at (x, y), mm from the globe's centre. It sits behind the lids'
 * curve near the eye, falls away fast toward the temple and slowly toward the
 * nose; the brow stands out above, and a shallow trough runs under the lower
 * lid toward the nose.
 *
 * The bone under it (the user, 2026-10-29: the brow looked stuck on and the
 * face flat; the eye's own bulge was the only depth): the supraorbital rim is
 * a firm ridge ~3 mm proud above the eye, carrying the brow on its curve and
 * shading the hollow under it, and the cheekbone's rim swells below and
 * outside the eye. Together they make the socket the eye sits in.
 */
function faceShell(xy: N, Ux: EyeUniforms): N {
  const x = xy.x;
  const y = xy.y;
  const U: N = Ux;
  const kx = mix(float(0.014), float(0.028), smoothstep(-8, 8, x));
  const ky = mix(float(0.016), float(0.004), smoothstep(-6, 6, y));
  const g = (v: N, c: number, w: number) => exp(v.sub(c).div(w).mul(v.sub(c).div(w)).negate());
  // The ridge stays on this material point. The move-net (brow-net.ts) carries
  // the point; shifting the ridge here as well slid it off the hairs.
  // The brow ridge, a 25-year-old's (the user, 2026-10-29: the old one was a
  // straight shelf ~3.8 mm proud right across the frame, "creepy from end to
  // end", and aged the face): the supraorbital rim follows the brow's own arc,
  // its crest just under the hairs' lower edge, firm below and rounding off
  // over the forehead; ~2 mm proud over the arch, sinking into the glabella
  // by the nose and turning back past the tail toward the temple.
  const be = browEdges(x);
  const crest = y.sub(be.lower.add(0.7));
  // (below the crest a long fall, σ 3.2: at 2.1 the hood dipped under the brow
  // and the middle of the brow read detached from the eye, 2026-10-29)
  const rimW = select(crest.lessThan(0), float(3.2), float(3.6));
  // Along the brow: full from its head out past the arch, turning back toward
  // the temple past the tail. At the head the superciliary arch swells over
  // the rim, the bone's most prominent part in most faces, under the brow's
  // first hairs and fading into the glabella (the user: the brow's start had
  // no bone under it). Standard anatomy (Gray's; the superciliary arch lies
  // medially above the rim, the rim itself sharpest laterally).
  const rimAlong = smoothstep(-19, -12, x).mul(smoothstepDown(21, 12, x)).mul(0.8).add(0.2);
  const arch = g(x, -10.5, 4.5).mul(g(y, 8.6, 2.6)).mul(0.9);
  const brow = exp(crest.div(rimW).mul(crest.div(rimW)).negate()).mul(rimAlong).mul(2.1).add(arch).add(g(y, 14, 5).mul(g(x, 2, 22)).mul(0.6));
  // (the tear trough: shallow and toward the nose in a young face. At 0.9 mm
  // deep across the whole lid it laid a broad dark band under the eye, an
  // eye-bag the user's photos don't have: R7)
  // (and at 0.35 with the cheek's swell under it, a crescent groove, still an
  // older face's: 2026-10-29, a 25-year-old's lid runs into the cheek)
  const trough = g(y, -11.5, 2.2).mul(g(x, -6, 7)).mul(0.12);
  // the roll of skin between the brow and the lid (the brow's fat pad), the
  // nose rising at the inner side, and the cheek's swell under the lower lid.
  // The roll flattens as the arch rises and bunches as it comes down.
  // (on the brow's arc too, and softer: young skin, full but smooth)
  const padY = y.sub(be.lower.sub(1.6));
  const pad = exp(padY.div(1.9).mul(padY.div(1.9)).negate()).mul(g(x, 1, 11)).mul(float(0.7).sub(U.lids.brow.mul(0.1)));
  const nose = smoothstep(-14, -26, x).mul(g(y, 1, 12)).mul(3);
  // the cheek's swell under the lower lid, and the cheekbone's rim below and outside the eye
  // (broad and low: a young cheek is full, so it meets the lid without a ledge)
  const cheek = g(y, -16, 6).mul(g(x, 5, 13)).mul(0.9).add(g(y, -15, 4.5).mul(g(x, 12, 8)).mul(1));
  return float(11).sub(kx.mul(x).mul(x)).sub(ky.mul(y).mul(y)).add(brow).sub(trough).add(pad).add(nose).add(cheek);
}

/**
 * The lids' own curve: the globe plus the lid's thickness, at (x, y), with
 * the cornea's bump riding under it wherever the eye is looking (and rolled
 * up under a closing lid, as the globe is).
 */
function lidCurve(xy: N, Ux: EyeUniforms): N {
  const U: N = Ux;
  const rr = dot(xy, xy);
  const r2 = (R + LID_THICKNESS) ** 2;
  const pitch = U.gaze.y.mul(GAZE_PITCH).add(U.blink.mul(BELL_PITCH));
  const yaw = U.gaze.x.mul(GAZE_YAW);
  const apex = vec2(sin(yaw).mul(cos(pitch)), sin(pitch)).mul(R);
  const off = xy.sub(apex);
  // (a gentle swell: at 0.6 mm over σ ~3 mm the cornea bent the upper lid
  // into a peak looking up and the eye read bulged)
  const bump = exp(dot(off, off).div(-28)).mul(0.38);
  return sqrt(max(float(r2).sub(rr), 0)).sub(max(rr.sub(r2), 0).mul(0.5)).add(bump);
}

/** max(a, b) with the corner rounded over k mm, so lid and face meet in a soft fold. */
function smax(a: N, b: N, k: N | number): N {
  const kk = float(k);
  const h = max(kk.sub(abs(a.sub(b))), 0).div(kk);
  return max(a, b).add(h.mul(h).mul(kk).mul(0.25));
}

/**
 * The skin's depth at (x, y): the lid where it stands in front of the face, else the face.
 * Under the eye the lid runs into the cheek over a wider round (4 mm from
 * ~3 mm below the margin): a young lower lid flows into the cheek, and the
 * 2 mm fold there read as the lid–cheek junction of an older face, an eye-bag
 * line (the user, 2026-10-29: "looks aged"). Nearer the margin it stays 2 mm,
 * so the lid still rests on the eye.
 */
function skinZ(xy: N, Ux: EyeUniforms): N {
  const k = mix(float(2), float(4), smoothstepDown(-6.8, -9, xy.y));
  return smax(faceShell(xy, Ux), lidCurve(xy, Ux), k);
}

/** Side position along the margin for α: upper half medial → lateral, lower half back. */
export function sideFromAlpha(alpha: N): N {
  return select(alpha.lessThan(0.5), alpha.mul(4).sub(1), float(3).sub(alpha.mul(4)));
}

/** Where the margin's line is, at rest, for α, projected onto the shot (mm). */
function restAt(a: N, Ux: EyeUniforms): N {
  const aa = fract(a).toVar();
  const ss = sideFromAlpha(aa).toVar();
  const mm = marginsAt(ss, Ux);
  const th = select(aa.lessThan(0.5), mm.upOpen, mm.loOpen).toVar();
  return vec2(cos(th).mul(sin(azimuthOf(ss, Ux))), sin(th))
    .mul(R + LID_THICKNESS)
    .toVar();
}

/** Outward from the resting margin at α, in the image plane. */
export function outwardAt(a: N, Ux: EyeUniforms): N {
  const tan = restAt(a.add(0.002), Ux).sub(restAt(a.sub(0.002), Ux));
  return normalize(vec2(tan.y.negate(), tan.x)).toVar();
}

/**
 * One column of the lid mesh: where the margin is at α, now and at rest, and
 * which way the skin runs out from it. Near a corner that direction turns
 * smoothly onto the corner's bisector (passed in: it is the same for every
 * column on that side), so the skin fans round the corner over many columns
 * instead of two.
 *
 * Every piece is a var (rule 17): select() compiles to if/else, and a shared
 * piece built first inside one branch would only be assigned there.
 */
export function lidColumn(alphaIn: N, bisector: N, Ux: EyeUniforms) {
  const alpha = fract(alphaIn).toVar();
  const upper = alpha.lessThan(0.5).toVar();
  const s = sideFromAlpha(alpha).toVar();
  const m = marginsAt(s, Ux);
  const thetaNow = select(upper, m.up, m.lo).toVar();
  const thetaRest = select(upper, m.upOpen, m.loOpen).toVar();
  const phi0 = azimuthOf(s, Ux).toVar();
  // Round each corner the skin fans out: from a fixed point before the corner
  // (s0) its direction turns evenly from the margin's outward direction there
  // onto the corner's bisector. Following the margin's own outward direction
  // into the corner instead let the tear lake's rounding (and the outer
  // corner's tilt) swing it, so neighbouring columns crossed and the skin
  // folded over itself in a crease running out of the corner.
  const s0 = select(s.lessThan(0), float(0.62), float(0.72)).toVar();
  const sEdge = select(s.lessThan(0), s0.negate(), s0);
  const alpha0 = select(upper, sEdge.add(1).div(4), float(3).sub(sEdge).div(4));
  const fanT = clamp(abs(s).sub(s0).div(float(1).sub(s0)), 0, 1).toVar();
  const fanDir = normalize(mix(outwardAt(alpha0, Ux), bisector, fanT));
  const n2 = select(fanT.greaterThan(0), fanDir, outwardAt(alpha, Ux)).toVar();
  // how far this margin rode with the eye's pitch: the skin past the crease doesn't
  // (and a feeling's raise the same way: it moved the whole lid, crease and
  // hood, up under the brow, a band sliding over the eye, the user 2026-10-29;
  // the levator pulls the tarsus up and its skin folds into the crease)
  const gazeRide = select(upper, m.gazeU.add(m.feelU), m.gazeL).toVar();
  return { upper, s, thetaNow, thetaRest, phi0, n2, gazeRide };
}

/**
 * A point of the lid mesh, face space (mm): column `c`, row q.
 *
 * The skin is laid out in the image plane, outward from the margin's line,
 * and stands at the depth `skinZ` gives it: the lid's curve over the globe,
 * the face beyond, with a soft fold where they meet. Toward the corners the
 * face is in front of the globe, so the canthi sit forward of it, and the
 * margin's inner face stretches back to the globe as the pocket's wall (the
 * caruncle and the lacrimal lake lie behind it).
 */
export type LidColumn = ReturnType<typeof lidColumn>;

/**
 * The lids' folds, as in any anatomical plate of the eye: relief (mm toward
 * the camera) and how much the fold shades the skin, at side s (−1 inner
 * corner … +1 outer) and d mm out from the margin, on the upper (u = 1) or
 * lower (u = 0) lid. The geometry and the shading read the same numbers.
 *
 *  · Upper: the supratarsal crease hugs the margin near the nose, rises over
 *    the middle and runs on past the outer corner; the skin above it rolls
 *    forward over it (more so for a hood), leaving a shadow under the fold.
 *  · Lower (R7, the user's eye and docs/BATCH_B_LASHES_SKIN_LIDS_CARD.md):
 *    measured down from the margin in two photos, bright 0–2 mm (the
 *    pretarsal roll catching the light), dark 2.5–6.5 mm (the crease and the
 *    lid's fall to the cheek), bright again from ~7 (the cheek). So: a broad
 *    roll under the lashes, a crease ~5 mm down, the lid–cheek junction ~6.5,
 *    the cheek rising after it. (Ours had the dark band at 1.5–4.5 and a lit
 *    bag at 5–7: an eye-bag.)
 */
function lidFolds(u: N, s: N, d: N, Ux: EyeUniforms) {
  const U: N = Ux;
  const S = U.skin;
  const a = clamp(abs(s), 0, 1);
  const bow = float(1).sub(a.mul(a));
  // upper
  const creaseAt = S.creaseD.mul(mix(select(s.lessThan(0), float(0.58), float(0.84)), float(1), bow)).toVar();
  const zU = d.sub(creaseAt).div(1.05);
  const groove = exp(zU.mul(zU).negate()).mul(S.creaseDepth.mul(1.1)).mul(float(1).sub(U.blink.mul(0.7)));
  // (everyone's skin swells a little over the crease: the fat behind it)
  // (up-gaze tucks the lid's skin into the crease, so the fold deepens; down-gaze unfolds it)
  // (the hood a little fuller over the lid: the user's hooded lid, its fold resting near the lashes)
  const foldAmt = S.hood.mul(1.05).add(S.creaseDepth.mul(0.6)).add(0.3).mul(clamp(float(1).add(U.lids.pitch.mul(1.5)), 0.8, 1.25));
  const fold = foldAmt
    .mul(smoothstep(creaseAt.sub(1.2), creaseAt.add(0.7), d))
    .mul(float(1).sub(smoothstep(creaseAt.add(3), creaseAt.add(10), d)));
  const endsU = smoothstepDown(0.97, 0.72, s.negate()).mul(smoothstepDown(1.25, 1.0, s));
  const reliefU = fold.sub(groove).mul(endsU);
  const zS = d.sub(creaseAt.sub(0.55)).div(0.75);
  const shadeU = exp(zU.mul(zU).negate())
    .mul(S.creaseDepth.mul(0.9).add(0.25))
    .add(exp(zS.mul(zS).negate()).mul(foldAmt.mul(0.45)))
    .mul(endsU);
  // lower
  const zR = d.sub(1.5).div(1.5);
  const roll = exp(zR.mul(zR).negate()).mul(0.42);
  const creaseL = mix(float(4.4), float(5.2), bow).toVar();
  const zL = d.sub(creaseL).div(1.1);
  const grooveL = exp(zL.mul(zL).negate()).mul(0.3);
  // (the cheek rising past the lid–cheek junction)
  const zB = d.sub(creaseL.add(4)).div(2.2);
  const bag = exp(zB.mul(zB).negate()).mul(0.22);
  const zL2 = d.sub(creaseL.add(1.6)).div(0.9);
  const grooveL2 = exp(zL2.mul(zL2).negate()).mul(0.1);
  // (fading out before the inner corner: carried into it, the roll was a lip
  // running out of the corner and the joint read as broken, the user 2026-10-29)
  const endsL = smoothstepDown(1, 0.78, a).mul(smoothstepDown(0.92, 0.6, s.negate()));
  const reliefL = roll.sub(grooveL).add(bag).sub(grooveL2).mul(endsL);
  const shadeL = exp(zL.mul(zL).negate()).mul(0.32).add(exp(zL2.mul(zL2).negate()).mul(0.14)).mul(endsL);
  // Toward each corner both lids take the same blend of the two, so where
  // their skin meets (the corners' bisectors) it meets at one height: the
  // hood runs on round the outer corner instead of ending in a step.
  const w = mix(u, float(0.5), smoothstep(0.8, 1, a));
  return { relief: mix(reliefL, reliefU, w), shade: mix(shadeL, shadeU, w) };
}

/** A point of the skin, face space (mm): column `c`, `d` mm out from the margin's edge. */
export function skinAt(c: LidColumn, d: N, Ux: EyeUniforms): N {
  const U: N = Ux;
  const rM = R + LID_THICKNESS;
  // the skin stretches: near the margin it moves with the lid, far out it stays.
  // A blink drags it out to ~14 mm. The gaze moves only the lid's own skin:
  // looking up, the tarsus rides up with the eye and the skin over it folds
  // into the crease; the skin past the crease (the hood, the brow's underside)
  // stays where it is, it never slides down or up with the eye. (Before, every
  // row rode with the margin out to the brow.)
  const anchor = select(c.upper, smoothstep(1, 6.5, d), smoothstep(1.5, 7, d));
  const theta0 = mix(c.thetaNow, c.thetaRest, smoothstep(0, 14, d)).sub(c.gazeRide.mul(anchor)).toVar();

  // the lids' folds: the upper crease and its overhang, the lower roll and creases
  const lift = lidFolds(select(c.upper, float(1), float(0)), c.s, d, Ux).relief.toVar();

  const skinXY = vec2(cos(theta0).mul(sin(c.phi0)), sin(theta0)).mul(rM).add(c.n2.mul(d)).toVar();
  // closing, the upper lid comes down over the lower, a hair in front of it
  // (where they meet, toward the corners, the two would otherwise coincide)
  const over = select(c.upper, U.blink.mul(0.08).mul(smoothstepDown(1.5, 0, d)), float(0));
  return vec3(skinXY, skinZ(skinXY, Ux).add(lift).add(over)).toVar();
}

/**
 * How far the cornea stands proud of the globe's sphere along the unit
 * direction `dir` from the globe's centre, mm (0 past the limbus), with the
 * eye turned as it is now: where a lid resting on the eye actually rests.
 * The cornea is taken as its sphere (radius 7.8, centred CORNEA_CENTER_Z out
 * along the eye's axis), which meets the globe at the limbus.
 */
export function corneaLift(dir: N, Ux: EyeUniforms): N {
  const U: N = Ux;
  const pitch = U.gaze.y.mul(GAZE_PITCH).add(U.blink.mul(BELL_PITCH));
  const yaw = U.gaze.x.mul(GAZE_YAW);
  const c = dot(dir, vec3(sin(yaw).mul(cos(pitch)), sin(pitch), cos(yaw).mul(cos(pitch)))).toVar();
  // where the ray from the globe's centre leaves the cornea's sphere
  const cz = CORNEA_CENTER_Z;
  const rc = ANATOMY.corneaRadius;
  const out = c.mul(cz).add(sqrt(max(c.mul(c).mul(cz * cz).add(rc * rc - cz * cz), 0)));
  return max(out.sub(R), 0).mul(step(LIMBUS_Z / R, c));
}

/**
 * A point of the margin's inner face, face space (mm): column `c`, t from 1
 * where the lid touches the eye to 0 at the margin's front edge. Where the
 * margin crosses the cornea (the lower lid at the iris's foot) its back edge
 * rests on the cornea, not on the globe's sphere inside it: there the cornea
 * hid the face's last strip and the iris showed as a dark line under the
 * meniscus.
 */
export function innerAt(c: LidColumn, t: N, Ux: EyeUniforms): N {
  const rM = R + LID_THICKNESS;
  const toEdge = vec3(cos(c.thetaNow).mul(sin(c.phi0)), sin(c.thetaNow), cos(c.thetaNow).mul(cos(c.phi0))).toVar();
  const edge = toEdge.mul(rM).toVar();
  const rIn = pow(float(1).sub(t), 1.4).toVar();
  // (capped: the cornea's full bulge, up to ~2.5 mm nearer its middle, pushed
  // the margin out into a peak over the iris when the eye looked up and aside;
  // a lid drapes over the cornea in a gentle rise)
  const lift = min(corneaLift(toEdge, Ux), 0.35).mul(float(1).sub(rIn));
  const radial = toEdge
    .mul(rIn.mul(LID_THICKNESS - 0.06).add(R + 0.06).add(lift))
    .add(vec3(c.n2.mul(sin(t.mul(Math.PI / 2)).mul(-0.15)), skinZ(edge.xy, Ux).sub(edge.z).mul(rIn)))
    .toVar();
  // the same depths, turned toward the view so only `rimShow` of it shows
  return vec3(mix(edge.xy, radial.xy, rimShow(c.s, c.upper)), radial.z).toVar();
}

function lidPoint(c: LidColumn, q: N, Ux: EyeUniforms) {
  const inner = q.lessThan(QI).toVar();
  // inner face: 1 where it touches the globe, 0 at the margin's front edge
  const t = clamp(float(1).sub(q.div(QI)), 0, 1).toVar();
  // skin: mm out from the edge, rows closer together near the margin
  const d = pow(clamp(q.sub(QI).div(1 - QI), 0, 1), 1.6).mul(REACH).toVar();
  const P = vec3(0).toVar();
  // where this material point sat before the brow's move-net (the hairs are painted there)
  const rest = vec2(0).toVar();
  If(inner, () => {
    const ip = innerAt(c, t, Ux);
    P.assign(ip);
    rest.assign(ip.xy);
  }).Else(() => {
    const base = skinAt(c, d, Ux);
    rest.assign(base.xy);
    // (z: the corrugator bunching the brow's head toward the camera, and the
    // hood rolling under a lowered brow; the lid's own skin, within ~5 mm of
    // the margin, stays with the lid and its lashes)
    // (the lab's browOn leaves it out, to time it: a uniform If costs nothing
    // when off. Skin the net can't reach is skipped too: the lid's own, within
    // 0.8 mm of the margin, and anything below the brow's band, ~1.5 mm up.)
    const move = vec3(0).toVar();
    If((Ux as N).browOn.mod(2).greaterThan(0.5).and(d.greaterThan(0.8)).and(base.y.greaterThan(1.5)), () => {
      // (fading over 4.2 mm: over 3.2, a wince looking down to the nose with a
      // squint squeezed the hood past the fold test's bound, twin/brow-net.ts)
      move.assign(browMoveNet(rest, Ux).mul(smoothstep(0.8, 5, d)));
    });
    P.assign(vec3(base.xy.add(move.xy), base.z.add(move.z)));
  });
  return { P, rest, d, t, inner };
}

export function lidMaterial(Ux: EyeUniforms, screen: RenderTarget, detail: RenderTarget, hair: BrowBake, face: SkinFaceBake) {
  const U: N = Ux;
  const S = U.skin;
  const material = new MeshBasicNodeMaterial();
  material.name = "Lids";

  // ---- vertex: the surface, and its normal by finite differences ------------
  // All in one function, so each vertex works out its column twice (here and
  // a step along) and its row three times, instead of everything six times.
  const vNormal = varyingProperty("vec3", "vLidNormal");
  const vParams = varyingProperty("vec4", "vLidParams");
  const vSide = varyingProperty("float", "vLidSide");
  const vFold = varyingProperty("float", "vLidFold");
  const vRest = varyingProperty("vec2", "vLidRest");
  /** The skin's tension: how far apart its neighbours are drawn against where they rest, along the margin and out from it (1 at rest, < 1 squeezed). */
  const vTension = varyingProperty("vec2", "vLidTension");
  /** The brow's lower edge and depth above this skin's rest x, mm (brow-net.ts browEdges): per vertex, not per pixel. */
  const vBrowEdge = varyingProperty("vec2", "vLidBrowEdge");
  material.positionNode = Fn(() => {
    const a = uv().x;
    const q = uv().y;
    const side = sideFromAlpha(fract(a)).toVar();
    const bisector = outwardAt(select(side.lessThan(0), float(0), float(0.5)), Ux);
    const col = lidColumn(a, bisector, Ux);
    const colA = lidColumn(a.add(0.0015), bisector, Ux);
    const colB = lidColumn(a.sub(0.0015), bisector, Ux);
    const h = lidPoint(col, q, Ux);
    const A = lidPoint(colA, q, Ux);
    const B = lidPoint(colB, q, Ux);
    const Q = lidPoint(col, q.add(0.004), Ux);
    const pa = A.P;
    const pb = B.P;
    const pq = Q.P;
    const n = normalize(cross(pa.sub(pb), pq.sub(h.P))).toVar();
    // (the same neighbours, against where the brow's move-net found them: the
    // skin folds where an expression squeezes it, and nowhere else)
    vTension.assign(
      vec2(
        length(pa.xy.sub(pb.xy)).div(max(length(A.rest.sub(B.rest)), float(1e-4))),
        length(pq.xy.sub(h.P.xy)).div(max(length(Q.rest.sub(h.rest)), float(1e-4))),
      ),
    );
    // whichever side the camera sees
    vNormal.assign(select(dot(n, cameraPosition.sub(h.P)).lessThan(0), n.negate(), n));
    vParams.assign(vec4(h.d, h.t, select(h.inner, float(1), float(0)), select(col.upper, float(1), float(0))));
    vSide.assign(col.s);
    vFold.assign(lidFolds(select(col.upper, float(1), float(0)), col.s, h.d, Ux).shade);
    vRest.assign(h.rest);
    const be = browEdges(h.rest.x);
    vBrowEdge.assign(vec2(be.lower, be.depth));
    return h.P;
  })();

  // ---- fragment: skin, margin, waterline ------------------------------------
  const shade = () => {
    const d = vParams.x;
    const t = vParams.y;
    const inner = vParams.z;
    const upper = vParams.w;
    const N = normalize(vNormal).toVar();
    const P = positionWorld;
    const V = cameraPosition.sub(P).normalize();
    const det = texture(detail.texture, uv()).toVar();
    // the face-space detail (bake/skin-face.ts): fine tile, broad map
    // pores and the brow are painted on the skin before the move-net, so they
    // ride the nodes instead of sliding across them
    const rest = vRest;
    const tile = texture(face.tile.texture, rest.div(SKIN_TILE_MM)).toVar();
    // The tile repeats every 6 mm, and across a cheek the repeat read as a
    // printed pattern (the user: "camouflage"). A second read, turned ~37° and
    // at another scale, averaged in for the colour, so no repeat lines up.
    const rest2 = vec2(rest.x.mul(0.8).sub(rest.y.mul(0.6)), rest.x.mul(0.6).add(rest.y.mul(0.8))).mul(0.73).add(vec2(2.3, 1.1));
    const tile2 = texture(face.tile.texture, rest2.div(SKIN_TILE_MM)).toVar();
    const tileMix = tile.add(tile2).mul(0.5).toVar();
    // close to the eye the fine detail is the skin's own; far out it fades to
    // an even, fine grain, so the cheek and brow never wear a pattern
    const nearEye = smoothstepDown(16, 5, d).toVar();
    const map = texture(face.map.texture, rest.sub(vec2(SKIN_MAP.x0, SKIN_MAP.y0)).div(vec2(SKIN_MAP.w, SKIN_MAP.h))).toVar();

    // The person's tone, its undertone, and its unevenness. Mottle is laid
    // across the face (mm), not round the mesh, which fans out far from the eye.
    const albedo = vec3(S.tone).toVar();
    // undertone: 0 golden-olive, 1 pink (the user's skin is golden: hue 55–65°)
    albedo.mulAssign(mix(vec3(0.93, 1, 0.86), vec3(1.06, 0.94, 0.92), S.undertone));
    // (gentle: at ±10 % its broad patches read as camouflage)
    const mottle = map.r;
    albedo.mulAssign(mottle.sub(0.45).mul(0.08).add(1));
    // lid skin is the thinnest on the body: warmer and pinker toward the margin
    // (gently: on Monk 8 the old pink turned the lids mahogany, hue 43° against
    // the user's skin at 55–65°)
    albedo.assign(mix(albedo, albedo.mul(vec3(1.07, 0.93, 0.9)), smoothstepDown(5, 0, d).mul(S.translucency).mul(0.6)));
    // (the bake's cells and lines follow the mesh, which fans out far from the
    // eye, so they belong near it)
    albedo.mulAssign(float(1).sub(det.r.mul(S.pores).mul(0.1).mul(smoothstepDown(14, 6, d))));
    // Pores and the skin's fine grain, laid across the face (mm), so the skin
    // away from the eye has texture too and never reads as plastic
    const pore = tileMix.r.mul(float(1).sub(inner));
    const grain = tileMix.g;
    albedo.mulAssign(float(1).sub(pore.mul(0.06)).sub(grain.sub(0.5).mul(0.03)));
    // The micro-relief's furrows are cavities: a little darker, so the skin's
    // fine crossing lines read in its colour too, not only in its sparkle (R8:
    // the user's skin shows its texture at every scale)
    // (a few percent, strongest by the eye: at −16 % the 6 mm tile's furrows printed a pattern)
    // (barely: the relief is grain; in colour it read as scales)
    albedo.mulAssign(mix(mix(float(0.975), float(0.99), float(1).sub(nearEye)), float(1), tileMix.a).mul(float(1).sub(inner)).add(inner));
    // (darker round the eye than further out, as most skin is, and deep-toned
    // skin most. Under the eye the darkening lies 3–7 mm down, below the
    // pretarsal roll, which stays light: R7, measured in the user's photos)
    const periUpper = mix(float(0.8), float(1), smoothstep(2.5, 12, d));
    // (the shade under the eye: a little deeper, −30 % over 3–7.5 mm, and the
    // lid–cheek groove below it; the user's photo, 2026-10-29: "the shadow
    // below the eyes is still missing")
    // (and further down, softly, over the cheek's lit top: lit, it read as a
    // pale band under the eye rather than its shadow; verified 2026-10-29)
    // (then softened, 2026-10-29: at −42 % with a ×0.84 cheek it sat under the
    // pretarsal roll as an eye-bag, and the user, 25, saw a 45-year-old: now a
    // gentle shade that fades into the cheek, no band edge)
    const periLower = float(1)
      .sub(smoothstep(1.5, 4, d).mul(smoothstepDown(12, 6, d)).mul(0.2))
      .mul(mix(float(0.94), float(1), smoothstep(7, 15, d)));
    // (toward each corner the two lids' skin is one skin: their darkening meets
    // half way, or the corner's bisector drew a hard line out of the joint)
    const atCorner = smoothstep(0.8, 1, abs(vSide)).toVar();
    // Anything that differs between the lids must meet half way at the
    // corners too, or the line where the two lids' skin meets out of the corner
    // shows as a hard edge: a moulded shelf out of the inner corner in 1970's
    // low light (the user, 2026-10-29). Broad terms read these, not upper/lower.
    const upperW = mix(upper, float(0.5), atCorner).toVar();
    const lowerW = float(1).sub(upperW);
    albedo.mulAssign(mix(periLower, periUpper, upperW).mul(float(1).sub(inner)).add(inner));
    // freckles: small and clustered, across the face (mm), thinning far out
    const freckle = map.g.mul(S.freckles).mul(smoothstepDown(20, 8, d)).mul(float(1).sub(inner));
    albedo.assign(mix(albedo, albedo.mul(vec3(0.6, 0.4, 0.27)), freckle.mul(0.9)));
    // Crow's feet fan out from the outer corner across the face, so they are
    // drawn there, not on the mesh, which bunches up round the corner.
    const LU = U.lids;
    // (baked: bake/skin-face.ts map B)
    const crows = map.b;
    const lines = det.g
      .mul(S.lines)
      .mul(mix(float(0.06), float(0.12), upperW))
      .mul(smoothstepDown(9, 3, d))
      .add(crows.mul(S.lines.mul(0.4).add(LU.squint.mul(0.6))).mul(0.3));
    albedo.mulAssign(float(1).sub(lines.mul(0.5)));
    // Expression folds (rig/brow.ts, docs/EYE_BROW_EMOTION_PLAN.md §5), only
    // where the brow's move squeezes the skin (the tension above), laid on the
    // skin's rest coordinates so they ride it. Each fold is a dark trough with
    // a lit crest, never a stroke, and never darker than ×0.72. (The lab's
    // browOn leaves them out, to time them.)
    // (only where the skin is squeezed or stretched at all: everywhere else,
    // most of the frame, skips the sums; they cost ~2.5 ms a frame on a weak
    // GPU when every lid pixel ran them)
    If(U.browOn.greaterThan(1.5).and(abs(vTension.x.sub(1)).add(abs(vTension.y.sub(1))).greaterThan(0.008)), () => {
      const squeezeAlong = clamp(float(1).sub(vTension.x), 0, 0.6);
      const squeezeAcross = clamp(float(1).sub(vTension.y), 0, 0.6);
      const stretch = clamp(vTension.y.sub(1), 0, 1);
      const edge = { lower: vBrowEdge.x, depth: vBrowEdge.y };
      const ex = float(0).toVar();
      // (each fold only where it shows: a sine per pixel per fold was most of their cost)
      const fold = (phase: () => N, amount: N) => {
        If(amount.greaterThan(0.002), () => {
          const s = sin(phase().mul(Math.PI * 2)).toVar();
          const tr = max(s.negate(), 0);
          const cr = max(s, 0);
          const cr2 = cr.mul(cr);
          ex.addAssign(amount.mul(tr.mul(tr).mul(tr).mul(0.28).sub(cr2.mul(cr2).mul(cr2).mul(0.1))));
        });
      };
      // the glabella: the corrugator draws the brow's head in, and the skin
      // between the brows rises in two or three slanted vertical folds
      const bx = rest.x.sub(BROW_SHAPE.x0);
      const glabella = smoothstep(-7, -1.5, bx)
        .mul(smoothstepDown(2.5, 0.5, bx))
        .mul(smoothstep(edge.lower.sub(2), edge.lower, rest.y))
        .mul(float(1).sub(smoothstep(edge.lower.add(edge.depth), edge.lower.add(edge.depth).add(3), rest.y)))
        .mul(smoothstep(0.03, 0.18, squeezeAlong));
      const gWob = tile.b.sub(0.5).mul(0.12);
      // the hood: a lowered brow pushes the skin under it into a roll (lit,
      // ~2.2 mm under the brow, the move-net's z), with a crease beneath it
      const below = rest.y.sub(edge.lower);
      // (only once the squeeze is real: at 0.04 the mesh's per-vertex tension
      // breaking the threshold drew short dark streaks on the hood when the eye
      // looked down, 2026-10-29)
      const hood = smoothstep(-4.8, -4, below).mul(smoothstepDown(-1.2, -1.9, below)).mul(smoothstep(0.12, 0.4, squeezeAcross)).mul(0.7);
      // the forehead: the frontalis's lift squeezes it against the hairline,
      // and it furrows across, following the brow's curve, ~8 mm apart from
      // ~7 mm over the brow, broken and strongest over the middle
      const over = rest.y.sub(edge.lower.add(edge.depth));
      const forehead = smoothstep(3, 6, over)
        .mul(smoothstep(BROW_SHAPE.x0 - 4, BROW_SHAPE.x0 + 4, rest.x))
        .mul(smoothstepDown(BROW_SHAPE.x0 + BROW_SHAPE.span + 4, BROW_SHAPE.x0 + BROW_SHAPE.span - 4, rest.x))
        .mul(smoothstep(0.02, 0.1, squeezeAcross))
        .toVar();
      fold(() => rest.x.add(rest.y.sub(9).mul(0.22)).div(2.6).add(gWob), glabella);
      fold(() => below.add(3.4).div(2.4).add(0.75), hood);
      If(forehead.greaterThan(0.002), () => {
        const furrowBreak = smoothstep(0.2, 0.6, vnoise(vec2(rest.x.mul(0.22), rest.y.mul(0.08))));
        forehead.mulAssign(furrowBreak.mul(0.6).add(0.4));
      });
      fold(() => over.sub(7).div(8).add(0.75).add(gWob), forehead);
      albedo.mulAssign(float(1).sub(clamp(ex, -0.1, 0.28)));
      // a lifted brow draws the hood up into the orbit's hollow under the rim:
      // a little deeper in shade, not lighter (lighter, and lit from 1970's
      // screen below, it read as a flat pale patch under the brow with a hard
      // edge at the hairs, the user 2026-10-29)
      albedo.mulAssign(float(1).sub(stretch.mul(0.12).mul(smoothstep(-5.5, -1.5, below)).mul(smoothstepDown(0.8, -0.6, below))));
    });
    // Fine lines that follow the lid, broken and uneven: under the lower
    // lashes, and across the upper lid below the crease. A dark line with a
    // lit edge just above it reads as a crease in the skin, not a stroke.
    // (both baked on the mesh's coordinates: bake/skin.ts B and A)
    const wob = det.b.mul(3);
    const broken = det.a;
    const crease = (o: number) => pow(abs(sin(d.add(o).mul(Math.PI / 0.62).add(wob))), 12);
    const lineBand = mix(
      smoothstep(1.4, 2.6, d).mul(smoothstepDown(9.5, 6, d)),
      smoothstep(0.9, 1.6, d).mul(smoothstepDown(S.creaseD.sub(0.2), S.creaseD.sub(1.2), d)),
      upper,
    )
      .mul(broken)
      .mul(smoothstepDown(1, 0.82, abs(vSide)))
      .mul(S.lines.mul(0.6).add(0.4))
      .mul(float(1).sub(inner))
      .toVar();
    If(lineBand.greaterThan(0.001), () => {
      // Under the eye: a 25-year-old's (the user, 2026-10-29: at ×2.2 with a
      // crêpe between them the lines aged the face ~20 years). Faint at rest,
      // deepening only as the lid squeezes (a smile, a squint): young skin
      // folds when it moves and springs back. Crêpe is an older skin's; gone.
      const boost = mix(LU.squint.mul(0.9).add(0.45), float(1), upper);
      albedo.mulAssign(float(1).sub(crease(0).mul(lineBand).mul(0.22).mul(boost)));
      albedo.mulAssign(float(1).add(crease(0.13).mul(lineBand).mul(0.07).mul(boost)));
    });
    // the crease's own shadow
    // (a fold's shadow, never a black stroke, however deep the crease)
    const creaseShade = min(vFold.mul(0.68), 0.45).mul(float(1).sub(inner));

    albedo.mulAssign(float(1).sub(creaseShade));

    // The upper lid's skin over the crease (2026-10-29: one smooth, evenly lit
    // band from the brow to the lashes, plastic): tone uneven over a few mm,
    // as real lid skin is (thin, veined, a little darker in patches), and the
    // hood rounding away into its crease over its last ~2.5 mm, not a step.
    {
      const hoodBand = smoothstep(S.creaseD.sub(0.5), S.creaseD.add(1), d)
        .mul(smoothstepDown(S.creaseD.add(10), S.creaseD.add(5), d))
        .mul(upper)
        .mul(float(1).sub(atCorner))
        .mul(float(1).sub(inner))
        .toVar();
      // (only on the hood: two noise reads on every lid pixel, most of the frame, cost for nothing)
      If(hoodBand.greaterThan(0.001), () => {
        const blot = vnoise(rest.mul(0.45)).sub(0.5).mul(0.12).add(vnoise(rest.mul(1.4).add(7.1)).sub(0.5).mul(0.06));
        albedo.mulAssign(float(1).add(blot.mul(hoodBand)));
      });
      const roundIn = smoothstepDown(S.creaseD.add(2.8), S.creaseD.add(0.3), d).mul(smoothstep(S.creaseD.sub(0.4), S.creaseD.add(0.3), d));
      albedo.mulAssign(float(1).sub(roundIn.mul(upper).mul(float(1).sub(atCorner)).mul(float(1).sub(inner)).mul(0.1)));
    }

    // the margin: the grey line
    const greyLine = smoothstepDown(0.35, 0.1, d).mul(float(1).sub(inner)).mul(upper);
    albedo.mulAssign(float(1).sub(greyLine.mul(0.45)));
    const lower = float(1).sub(upper);
    // The lower lid's margin, as a close photograph shows it (the user's eye,
    // R6): from the globe out, a thin pink wet junction (0.2–0.3 mm), the
    // intermarginal strip (~1 mm), keratinised, tan-orange and wet, lighter
    // than the skin below it, then the rounded front edge with the lash roots.
    // The strip is the margin's inner face.
    // (strip 1.00 ± 0.23 mm, junction 0.2–0.3 mm: procedural-eye's RESEARCH.md,
    // from its lid sources; not yet checked against them, †)
    const tone = vec3(S.tone);
    const rimTan = flesh(tone, "rim");
    const mucosa = flesh(tone, "mucosa");
    // (tapering into the inner corner, where the lids meet over the lake)
    // (only the inner face: carried round the front edge, the tan caught the
    // light there and drew a pale outline round the rim)
    // (the strip's front edge and the skin just past it are the oiliest: its sheen, below)
    const strip = smoothstepDown(0.4, 0.2, d).mul(lower).mul(float(1).sub(inner));
    // The lash line: the roots' dark mass (lashes.ts draws the strands). The
    // lower lid's lashes are few and fine; its line is a shadow, not a stroke.
    const roots = float(1).toVar();
    If(d.lessThan(1.2), () => {
      roots.assign(vnoise(vec2(vSide.mul(90), 0.5)).mul(0.35).add(0.75));
    });
    const lashLineU = smoothstep(0.0, 0.1, d).mul(smoothstepDown(0.95, 0.4, d)).mul(0.88);
    // (a defined line now the lower lashes are dense and dark, the user's photos;
    // at 0.5, spread over 0.2–0.7 mm, the lid had no edge)
    const lashLineL = smoothstep(0.04, 0.14, d).mul(smoothstepDown(0.62, 0.3, d)).mul(0.78);
    const lashLine = mix(lashLineL, lashLineU, upper).mul(roots).mul(float(1).sub(inner));
    albedo.assign(mix(albedo, vec3(0.02, 0.016, 0.015), lashLine));
    // under the lower lashes, their soft shadow on the skin (0.5–1.5 mm), so the
    // pretarsal roll below reads rounded and lit rather than a flat light band
    albedo.mulAssign(float(1).sub(smoothstep(0.45, 0.8, d).mul(smoothstepDown(1.7, 0.9, d)).mul(lower).mul(float(1).sub(atCorner)).mul(float(1).sub(inner)).mul(0.14)));

    // Inside the margin. The upper lid's inner face looks down and sits behind
    // the lash roots, so it reads as the dark line it is in every photograph
    // (in shadow, not black: mucosa under a lid is still flesh).
    // (lighter into the inner corner, where the lid turns and its inner face
    // shows: near black there it read as a hole at the corner, 2026-10-29)
    const underUpper = mix(mucosa, vec3(0.06, 0.04, 0.035), mix(float(0.85), float(0.4), smoothstep(0.7, 0.95, vSide.negate())));
    // The lower one is the strip: tan over its front three quarters, uneven
    // along its length, and behind it, where it rests on the globe under the
    // tear film, a paler pink-beige junction (the photo: white 90, junction 85,
    // strip 67–77, lash line 49 L*).
    const lowerFace = rimTan.toVar();
    If(inner.greaterThan(0.5).and(upper.lessThan(0.5)), () => {
      // (and broadly: lighter and darker over a few mm, pinker toward the
      // corners, so the strip never runs as one even tan line, an eyeliner)
      lowerFace.mulAssign(vnoise(vec2(vSide.mul(46), t.mul(1.6))).mul(0.16).add(0.92));
      lowerFace.mulAssign(vnoise(vec2(vSide.mul(6), 3.3)).mul(0.24).add(0.88));
      lowerFace.assign(mix(lowerFace, mucosa, smoothstep(0.55, 0.95, abs(vSide)).mul(0.35)));
      // (and into the inner corner it goes into the upper lid's shade, so the
      // strip ends where the lids meet instead of a lit ledge past it)
      lowerFace.mulAssign(float(1).sub(smoothstep(0.6, 0.9, vSide.negate()).mul(0.45)));
      // rounded, not flat: darker at the front edge by the lash roots, lighter
      // and wet at the back, where it meets the globe and the tear bead
      lowerFace.mulAssign(mix(float(0.7), float(1.04), smoothstep(0.05, 0.85, t)));
      lowerFace.assign(mix(lowerFace, mix(mucosa, vec3(0.62, 0.46, 0.4), 0.45), smoothstep(0.68, 0.95, t)));
    });
    // mm from the inner canthus, across the shot: the punctum sits 6–6.5 mm out
    // on its papilla, and medial of it the margin is lacrimal (no lashes, pinker)
    const fromCanthus = sin(azimuthOf(vSide, Ux)).sub(sin(LU.phiM)).mul(R + LID_THICKNESS).toVar();
    If(inner.greaterThan(0.5).and(upper.lessThan(0.5)).and(fromCanthus.lessThan(7.2)), () => {
      lowerFace.assign(mix(lowerFace, mucosa, smoothstepDown(6.6, 5.4, fromCanthus).mul(0.4)));
      const along = fromCanthus.sub(6.3);
      const papilla = smoothstepDown(0.45, 0.12, abs(along)).mul(smoothstep(0.2, 0.45, t));
      lowerFace.mulAssign(papilla.mul(0.16).add(1));
      // (the opening, ~0.3 mm, a shadowed hole, not a black one)
      const hole = smoothstepDown(0.15, 0.07, length(vec2(along, t.sub(0.62).mul(LID_THICKNESS))));
      lowerFace.mulAssign(float(1).sub(hole.mul(0.6)));
    });
    albedo.assign(mix(albedo, mix(lowerFace, underUpper, upper), inner));
    // (the inner corner itself, caruncle and plica, is canthus.ts, behind the lids)

    // ---- light ---------------------------------------------------------------
    const L = screenKey(Ux, screen);
    const NL = dot(N, L.dir);
    // The screen lights the face with its own picture, the way a monitor in
    // a dark room does: its layout falls softly across the skin, as from a
    // projector (blurred, and lifted toward its average so it colours the light
    // rather than replacing it), on whatever faces the screen.
    // ---- the brow and the fine hair (bake/brow.ts), lying on the skin ----------
    // Each hair is coloured as the person's, lit along its length (Kajiya–Kay,
    // a sheen running along it), and lays a thin shadow on the skin away
    // from the screen. The skin under a brow is a little darker.
    const LS = U.lashes;
    const B = BROW_BOUNDS;
    const bUv = rest.sub(vec2(B.x0, B.y0)).div(vec2(B.w, B.h)).toVar();
    const inB = step(0, bUv.x).mul(step(bUv.x, 1)).mul(step(0, bUv.y)).mul(step(bUv.y, 1)).mul(float(1).sub(inner));
    const gx = dFdx(bUv);
    const gy = dFdy(bUv);
    // (brow hairs lie ~0.3–0.5 mm off the skin: their shadow falls that far from them, away from the screen)
    const shadowUv = bUv.add(L.dir.xy.mul(0.4).div(vec2(B.w, B.h)));
    const browTex = vec4(0.5, 0.5, 0.5, 0).toVar();
    const browShadow = float(0).toVar();
    const browUnder = float(0).toVar();
    If(inB.greaterThan(0.5), () => {
      browTex.assign(texture(hair.brow, bUv).grad(gx, gy));
      browShadow.assign(texture(hair.brow, shadowUv).grad(gx, gy).a);
      browUnder.assign(texture(hair.brow, bUv).level(4.5).a);
    });
    const browA = browTex.a.mul(inB).toVar();
    // (R10: black at the root, browning only at the tip: the bake's blue runs root 0 → tip 1;
    // browning the whole length greyed the brow at the loader's framing)
    const hairCol = mix(vec3(LS.root), vec3(LS.tip), browTex.b.mul(browTex.b).mul(0.5).add(0.05));
    albedo.mulAssign(float(1).sub(browUnder.mul(0.14)));
    albedo.mulAssign(float(1).sub(browShadow.mul(0.32).mul(float(1).sub(browA))));
    // The brow ridge (bone, fat pad and the brow on it) stands in front of the
    // hood: a screen above casts its shadow down into the hollow under it; a
    // screen below lights that hollow (1970, 2000, 2009). And whatever the
    // light, the face is deep there and toward the nose: the orbit's own
    // hollow takes some of the light (the skin's depth, the user 2026-10-29).
    {
      const above = L.dir.y.div(max(L.dir.z, 0.25));
      // (the brow rides on a roll of flesh over the bone: under it the hood sits
      // in its shade whatever the light, more with the screen above; at 0.1 it
      // didn't read and the brow looked applied over a flat face, the user's photo)
      // (2026-10-29, later: at −38…68 % in a band with a lit stripe over it the
      // brow floated, cut off from the lid by a dark gap ("separated", "creepy").
      // The rim's form now does most of it (faceShell); this is the soft
      // occlusion under an overhang: strongest just under the hairs, feathered
      // into the hood with no edge, and the same in every era whatever the light,
      // so 1970's screen below still shows the socket)
      const underBrow = smoothstep(vBrowEdge.x.sub(6), vBrowEdge.x.sub(0.8), rest.y).mul(smoothstepDown(vBrowEdge.x.add(1.2), vBrowEdge.x.sub(0.2), rest.y)).mul(float(1).sub(inner));
      // (lighter again, 2026-10-29: with the rim's long fall the form shades it)
      // (and with the screen below, 1970, 2000, 2009: its light reaches under
      // the rim, but the overhang still occludes the room's light there; lit
      // flat it read as a pale patch under the brow, the user 2026-10-29)
      albedo.mulAssign(float(1).sub(underBrow.mul(underBrow).mul(abs(above).mul(0.1).add(0.13))));
      // the orbit's hollow by the nose, under the brow's head, round the inner corner
      const nasal = smoothstepDown(-9, -15.5, rest.x).mul(smoothstep(-5, 0, rest.y)).mul(smoothstepDown(9, 4, rest.y)).mul(smoothstep(1.5, 4, d));
      albedo.mulAssign(float(1).sub(nasal.mul(0.14)));
    }
    // (the skin's own tone shows a little through the hairs, so the brow sits in
    // the skin, not over it: at 0.97 it read as a patch stuck on the face)
    albedo.assign(mix(albedo, hairCol, browA.mul(0.9)));
    const hairT = normalize(vec3(browTex.rg.mul(2).sub(1), 0.18));
    const hairH = normalize(L.dir.add(V));
    const hTH = dot(hairT, hairH);
    // Dark hair on dark skin shows by a sheen along it, never a grey cast or
    // a glint per hair (R10): Marschner's two lobes, as on the lashes. R,
    // white, shifted toward the root and broad enough to run along the curved
    // hairs as a band; TRT, warm, toward the tip. Brightest mid-hair, fading
    // at the root and the tip (the bake's blue). The key is the era's page, so
    // the band takes its colour (the page is the light). (Gentle: at 0.05 /
    // 0.018, and still at 0.028 / 0.01, it laid a grey-blue haze over the whole brow at the loader's framing.)
    // (2026-10-29: still read as grey in the page's white light, and the two
    // flows of the herringbone caught it differently, splitting the brow in
    // two. Black hair's surface lobe is small and narrow; most of what shows
    // is the warm lobe through the hair. R ×0.4 and tighter, TRT warmer.)
    const THr = hTH.sub(0.06);
    const THt = hTH.add(0.12);
    const midHair = sin(browTex.b.mul(Math.PI)).mul(0.6).add(0.4);
    const hairSheen = vec3(0.85, 0.8, 0.74).mul(pow(sqrt(max(float(1).sub(THr.mul(THr)), 0)), 80).mul(0.007))
      // (TRT a dark warm brown, faint: at (1, 0.62, 0.38) × 0.006 it drew orange dashes along the hairs)
      .add(vec3(0.62, 0.46, 0.34).mul(pow(sqrt(max(float(1).sub(THt.mul(THt)), 0)), 24).mul(0.0035)))
      .mul(midHair)
      .mul(browA);
    // how much of the skin the brow covers, its gaps included: no shine from
    // the skin between the hairs either (it greyed the brow)
    const browCover = clamp(max(browA, browUnder.mul(1.6)), 0, 1).toVar();
    // the fine hair: faint, pale, everywhere but the margin, catching the light
    // (from just under the lashes, as in the user's photo: starting at 4 mm it
    // made a pale band of its own)
    const vellus = texture(hair.vellus, rest.div(VELLUS_TILE_MM))
      .a.mul(smoothstep(0.8, 2, d))
      .mul(float(1).sub(inner))
      .mul(float(1).sub(browCover))
      .toVar();
    albedo.assign(mix(albedo, albedo.mul(1.1).add(0.012), vellus.mul(0.2)));

    const Ls = U.light;
    const facesScreen = clamp(dot(N, Ls.normal).negate().mul(2.5), 0, 1);
    const throwUv = vec2(float(0.5).sub(P.x.div(72)), P.y.div(44).add(0.5));
    const picture = sampleScreen(screen, clamp(throwUv, 0.02, 0.98), float(8).add(U.mip));
    const avgLum = max(dot(screenLight(screen), vec3(0.3, 0.55, 0.15)), 0.04);
    const tint = clamp(picture.div(avgLum), 0.45, 2.2);
    const key = L.key.mul(mix(vec3(1), tint, facesScreen.mul(0.22))).toVar();
    // R11 area light: the bigger the device (its real size over its distance),
    // the further its light wraps round the skin's curve: a soft terminator
    // under a window, a firmer one under a phone
    const area = smoothstep(0.15, 0.8, U.light.penumbra);
    // (a little firmer than it was, ×0.8–1.3: the brow ridge and the cheekbone
    // barely showed under so soft a terminator)
    const wrapW = vec3(0.46, 0.34, 0.28).mul(mix(float(0.62), float(1.05), area));
    // R11 skin self-shadow: the fine relief (the tile's height, as the sparkle
    // reads it) shades its own furrows on the side away from the screen, so the
    // texture turns with each era's light rather than sitting painted on
    const eps = 0.02 / SKIN_TILE_MM;
    const tUv = rest.div(SKIN_TILE_MM);
    const hx = texture(face.tile.texture, tUv.add(vec2(eps, 0))).a.sub(tile.a);
    const hy = texture(face.tile.texture, tUv.add(vec2(0, eps))).a.sub(tile.a);
    // (gentle: at ×6 the sparkle traced the net's cells)
    const Nm = normalize(N.sub(vec3(hx, hy, 0).mul(3)));
    // (a few percent, by the eye: at 0.78–1.12 it doubled the tile's pattern across the face)
    const relief = mix(float(1), clamp(dot(Nm, L.dir).sub(NL).mul(mix(float(1.2), float(0.7), area)).add(1), 0.97, 1.02), nearEye);
    const diff = pow(clamp(vec3(NL).add(wrapW).div(wrapW.add(1)), 0, 1), vec3(1.5)).mul(relief);
    // light through thin skin comes back red at the terminator (less on Monk 8:
    // the lighter skin let it redden the whole face)
    const bleed = albedo
      .mul(vec3(0.2, 0.07, 0.035))
      .mul(S.translucency)
      .mul(smoothstep(-0.25, 0.35, NL))
      .mul(float(1).sub(smoothstep(0.35, 0.9, NL)));
    // the screen's light pools around the eye and falls away into the room
    const pool = mix(1, 0.55, smoothstep(10, 30, length(P.xy)));
    // corners are pockets; the inner face sits in its own lid's shadow (the
    // lower one faces up into the light, only its back edge in the globe's)
    // (a soft pocket: at −22 % the joint of the lids was a dark wedge)
    const corner = float(1).sub(smoothstep(0.85, 1, abs(vSide)).mul(smoothstepDown(3, 0, d)).mul(0.1));
    const innerFace = mix(mix(float(0.8), float(1), float(1).sub(t)), mix(float(0.22), float(0.75), float(1).sub(t)), upper);
    const innerShade = mix(float(1), innerFace, inner);
    // (the screen lights the face from the front, which flattens it; the room
    // above adds the modelling: what faces up catches more, undersides less)
    const overhead = mix(0.84, 1.12, smoothstep(-0.25, 0.85, dot(N, normalize(vec3(-0.1, 0.78, 0.62)))));
    const lit = albedo
      .mul(mix(float(1.18), float(1), inner))
      .mul(L.amb.add(key.mul(diff).mul(overhead)).add(L.fill.mul(clamp(dot(N, L.fillDir).add(0.25).div(1.25), 0, 1))))
      .add(bleed.mul(key))
      .mul(pool)
      .mul(corner)
      .mul(innerShade)
      .toVar();

    // ---- the screen, mirrored: a faint sheen on skin, a glint on the waterline -
    const Rr = reflect(V.negate(), N);
    const Nn = U.light.normal;
    const denom = dot(Rr, Nn);
    const tHit = dot(U.light.center.sub(P), Nn).div(min(denom, -0.02));
    const h = P.add(Rr.mul(tHit)).sub(U.light.center);
    const suv = vec2(dot(h, U.light.right).div(U.light.size.x).add(0.5), dot(h, U.light.up).div(U.light.size.y).add(0.5));
    // (the lower margin is wet all across; the upper one's inner face only toward its edge)
    const wet = mix(inner, inner.mul(smoothstep(0.15, 0.55, float(1).sub(t))), upper);
    // Skin's sheen holds a soft image of the interface (its oil is a poor
    // mirror, not none); the waterline is wet enough to hold the panel's shape
    const mirror = screenLight(screen).toVar();
    If(wet.greaterThan(0.01), () => {
      mirror.assign(texture(screen.texture, vec2(suv.x, float(1).sub(suv.y))).level(mix(6.5, 3.5, wet).add(U.mip)).rgb);
    });
    mirror.mulAssign(inPanel(suv, mix(0.2, 0.08, wet)).mul(step(denom, -0.02)));
    const fres = float(0.03).add(pow(float(1).sub(max(dot(N, V), 0)), 5).mul(0.97));
    // The skin's texture breaks the sheen up: pores and lines don't shine,
    // and the lids and the skin by the eye are oilier than the face further out.
    const gloss = clamp(float(1).sub(det.r.mul(S.pores).mul(1.6)).sub(det.g.mul(S.lines).mul(0.8)), 0.15, 1)
      .mul(mix(0.55, 1, smoothstepDown(16, 2, d)))
      .mul(float(1).sub(browCover.mul(0.95)));
    // (the sheen is also what shows the form of the darkest skin)
    const spec = mirror
      .mul(fres.mul(2).add(0.25))
      .mul(mix(float(0.1), float(0.55), wet))
      .mul(mix(float(1), gloss, float(1).sub(wet)))
      .mul(pool)
      .toVar();
    // (The lower margin's sparkle is the skin's own, below: round droplets laid
    // over it read as glitter, not as skin.)

    // far out the face gives way to the dark room (a fade in colour, so the
    // mesh stays opaque)
    // the hairs' sheen, and the fine hair catching the light at a glance
    spec.addAssign(L.key.mul(hairSheen));
    spec.addAssign(L.key.mul(vellus).mul(fres).mul(0.25));
    // (and the lower lid's and the cheek's fine hairs catch the light from above
    // as pale threads, as all over the user's photos)
    spec.addAssign(L.key.mul(vellus).mul(lowerW).mul(smoothstep(0.5, 3, d)).mul(0.035));
    // The skin's sparkle (R6/R8): its micro-relief (bake/skin-face.ts tile A,
    // fine crossing furrows and pores) tips the normal, and the screen's light
    // breaks into many small highlights wherever a facet catches it. Densest
    // where the skin is oiliest (the lower lash line and the lower lid, the
    // lids by the eye), sparse elsewhere, following the skin's lines, as in
    // the user's photos. (Round droplets laid over the rim read as glitter.)
    const H = normalize(L.dir.add(V));
    // (the lids by the eye and the lower lash line are oily; far out, little)
    const oily = smoothstepDown(12, 2, d)
      .mul(0.6)
      .add(0.1)
      .add(strip.mul(1.5))
      .add(smoothstep(0.1, 0.3, d).mul(smoothstepDown(1.4, 0.7, d)).mul(lower).mul(1.6))
      .mul(float(1).sub(inner))
      .mul(float(1).sub(browCover));
    // (a broad source, the screen: the facets' lobe is wide enough to light the
    // relief's plateaus in patches, not single pixels)
    const facet = pow(max(dot(Nm, H), 0), 32);
    // (a broad sheen under it, which the sparkle rides on)
    // (light: stronger, it laid a silvery band on the lower lid, like makeup)
    // (and only near the eye: on the cheek it laid a pale band of its own)
    const sheenLobe = pow(max(dot(N, H), 0), 8).mul(0.14).mul(smoothstepDown(7, 3, d));
    // (the upper lid's skin, under the hood, half as much)
    spec.addAssign(L.key.mul(facet.add(sheenLobe)).mul(oily).mul(tile.a.mul(0.6).add(0.4)).mul(mix(float(0.13), float(0.26), lowerW)));
    // The lash roots are wet with tears and oil: there the facets are sharper
    // mirrors, a dense band of small bright glints (the user's photos: the
    // brightest specks on the face run right along the lower lash line).
    const rootBand = smoothstep(0.08, 0.22, d).mul(smoothstepDown(0.75, 0.45, d)).mul(lower).mul(float(1).sub(inner));
    spec.addAssign(L.key.mul(pow(max(dot(Nm, H), 0), 110)).mul(rootBand).mul(U.tear.wet).mul(0.9));
    // Screen-time oil (the user, 2026-10-29): a face in front of a screen for
    // hours is greasy on its high points, the brow ridge, the side of the nose,
    // the top of the cheek, and less so between. A soft broad lobe, and over it
    // a tighter one the fine relief breaks into an uneven shine (the tile's
    // sheen channel varies it pore by pore), in the page's own light and colour.
    {
      // (the forehead over the brow, not the brow: oil on the skin between the
      // hairs laid a grey sheen through them)
      const ridge = smoothstep(vBrowEdge.x.add(vBrowEdge.y), vBrowEdge.x.add(vBrowEdge.y).add(2), rest.y);
      const noseSide = smoothstepDown(-11, -16, rest.x).mul(smoothstep(-8, -2, rest.y)).mul(smoothstepDown(8, 4, rest.y));
      const cheekTop = smoothstep(-17, -13, rest.y).mul(smoothstepDown(-7, -10, rest.y)).mul(smoothstep(-8, -3, rest.x));
      const oilZone = clamp(max(max(ridge, noseSide), cheekTop).mul(0.65).add(0.3), 0, 1);
      const oilSheen = pow(max(dot(N, H), 0), 12)
        .mul(0.045)
        .add(pow(max(dot(Nm, H), 0), 48).mul(0.085).mul(tileMix.b.mul(0.8).add(0.6)));
      spec.addAssign(key.mul(oilSheen).mul(oilZone).mul(fres.mul(1.5).add(0.75)).mul(float(1).sub(browCover)).mul(float(1).sub(inner)).mul(pool));
    }
    // the lower strip's tear film: a soft broad sheen of the screen's light along it
    const film = pow(max(dot(N, normalize(L.dir.add(V))), 0), 28).mul(inner).mul(lower).mul(smoothstep(0.1, 0.5, t));
    spec.addAssign(L.key.mul(film).mul(U.tear.wet).mul(0.22));
    const final = lit
      .add(spec)
      .mul(smoothstepDown(REACH, REACH - 8, d))
      .mul(U.fade)
      .toVar();
    const view = U.debugView;
    const color = select(
      view.equal(VIEW("normal")),
      N.mul(0.5).add(0.5),
      select(
        view.equal(VIEW("lit")),
        L.amb.add(L.key.mul(diff)).mul(pool),
        select(view.equal(VIEW("masks")), det.rgb, select(view.equal(VIEW("spec")), spec.mul(4), final)),
      ),
    );
    return color;
  };

  material.colorNode = Fn(shade)();
  material.side = DoubleSide;
  return material;
}

/**
 * Behind the globe, the socket: where the aperture runs past the white's
 * silhouette, what shows is the wet pocket of conjunctiva, and at the inner
 * corner the caruncle and the lake's floor (canthus.ts: the same field the
 * white shows there, so the two meet without a seam). A sphere seen from
 * inside, larger than the globe, so it only ever shows round its edge.
 */
export function socketMaterial(Ux: EyeUniforms, screen: RenderTarget) {
  const U: N = Ux;
  const material = new MeshBasicNodeMaterial();
  material.name = "Socket";
  material.colorNode = Fn(() => {
    const L = screenKey(Ux, screen);
    const pocket = vec3(0.05, 0.022, 0.02).mul(L.amb.mul(2).add(L.key.mul(0.55))).mul(U.fade);
    const corner = canthusField(positionWorld, Ux, screen);
    return mix(pocket, corner.rgb, corner.tissue);
  })();
  material.side = BackSide;
  return material;
}
