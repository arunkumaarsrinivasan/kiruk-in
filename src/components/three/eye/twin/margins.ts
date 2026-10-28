/**
 * The lid margins in plain numbers: the CPU twin of nodes/margins.ts
 * (`marginsAt`, `sideOf`, `azimuthOf`), and the single home of the fissure's
 * constants, which the shader side re-exports.
 *
 * The twin and the shader are one contract: change both together. The
 * shader draws the lids, the lid shadow on the white and (from R6) the media's
 * masks; the twin lets the lab draw the same curve over the render and lets
 * tests hold it to the numbers (twin/margins.test.ts).
 *
 * Angles are radians around the globe's centre, in face space (the lids
 * belong to the face, not the turning eye): azimuth φ (0 straight ahead,
 * medial negative), elevation θ.
 */

import { ANATOMY, GAZE_PITCH, GAZE_YAW, gazePitchUnits } from "../anatomy";

/** The margin's front edge stands this far off the globe: the lid's thickness. */
export const LID_THICKNESS = 1.1;
export const MARGIN_RADIUS = ANATOMY.eyeballRadius + LID_THICKNESS;

/**
 * The fissure, as the margin's front edge projects onto the shot (mm): medial
 * and lateral half-width, then the upper margin and the lower one. Taken from
 * the reference close-up (docs/EYE_TSL_PLAN.md, "Benchmark plan"): about
 * 26 × 9.9, the upper lid over the iris's top ~1.6 mm (radius 6), the lower
 * one at its foot. Converted to angles on the margin's sphere by
 * `fissureAngles`.
 *
 * `canthus` / `canthusL`: how far the medial and the lateral canthus sit
 * under the globe's centre (R6, the user's eye: the medial 2.9–3.4 mm under
 * the iris's centre in two photos, the lateral ~1.9). Both corners are low, so
 * the upper lid's arc is tall and the lower one shallow, and the lids taper
 * into the inner corner in a low, tight angle. With the medial canthus at
 * 0.9 mm it was a tall blunt end the caruncle filled. (The person's tilt still
 * lifts the outer corner a little on top: identity `lids.tilt`.)
 */
// (2026-10-28, the user: the opening a little taller, the shape unchanged:
// upper 4.4 → 4.8, lower 5.5 → 5.8, the corners where they were)
/**
 * How far each margin follows the eye's pitch (rad of lid per rad of eye), up
 * and down. The upper lid rides with the eye about one to one in vertical
 * saccades; the lower lid's are about four times smaller (Leite et al., IOVS:
 * lid saccades with 20° and 40° of vertical eye rotation), and it is drawn
 * down a little more in downgaze (the capsulopalpebral fascia). (Was upper
 * 0.85 up / 0.7 down and lower 0.35 both ways: looking up, the lid lagged the
 * iris and covered its top, which read as the lid coming down.)
 */
// (upper up 1 → 0.88: with the brow's lift on top, a full up-look opened the
// eye past its natural opening; the user saw it balloon upward. Then the
// ceiling below, and the lower lid rising a little more, 0.22 → 0.3.)
export const LID_GAZE = { upperUp: 0.88, upperDown: 0.92, lowerUp: 0.3, lowerDown: 0.3 } as const;

/**
 * The upper lid's ceiling when the eye looks up, rad at the margin's apex
 * (~0.9 mm): the levator is at the end of its pull and the brow's bony rim
 * holds the lid's skin, so past a degree or two the lid stops and the iris
 * slides up under it, while the lower lid rises a little. The opening stays
 * nearly as tall as at rest. (Following the eye, the upper lid kept rising
 * and the opening grew ~25 % taller looking up: the user asked three times.)
 * The ride saturates softly: `cap · tanh(ride / cap)`.
 */
export const LID_UP_CEILING = 0.07;

/** The upper lid's ride with the eye's pitch (rad), its upward part held under the ceiling. */
export function upperRide(pitch: number): number {
  if (pitch < 0) return pitch * LID_GAZE.upperDown;
  return LID_UP_CEILING * Math.tanh((pitch * LID_GAZE.upperUp) / LID_UP_CEILING);
}

export const FISSURE_MM = { medial: 14, lateral: 11.8, upper: 4.8, lower: 5.8, canthus: 3, canthusL: 1.9 } as const;

export function fissureAngles(aperture = 1) {
  const r = MARGIN_RADIUS;
  const a = (mm: number) => Math.asin(Math.min(0.99, mm / r));
  return {
    phiM: -a(FISSURE_MM.medial),
    phiL: a(FISSURE_MM.lateral),
    upper: a(FISSURE_MM.upper * aperture),
    lower: a(FISSURE_MM.lower * aperture),
    drop: a(FISSURE_MM.canthus),
    dropL: a(FISSURE_MM.canthusL),
  };
}

/**
 * Where the two canthi are, mm from the globe's centre across the shot (x
 * lateral +, y up): the media's `almond` meets the lids there (C4). The
 * medial one lands at ~12.6 mm, not FISSURE_MM.medial, because the margins
 * live on a 13.1 mm sphere (the twin's R6 todo).
 */
export function canthi(tiltDeg: number, aperture = 1) {
  const fa = fissureAngles(aperture);
  const thL = (tiltDeg * Math.PI) / 180 - fa.dropL;
  const r = MARGIN_RADIUS;
  return {
    medial: { x: r * Math.cos(fa.drop) * Math.sin(fa.phiM), y: -r * Math.sin(fa.drop) },
    lateral: { x: r * Math.cos(thL) * Math.sin(fa.phiL), y: r * Math.sin(thL) },
  };
}

/** The lids' uniforms as numbers (uniforms.ts `lids`), all radians but `squint` and `epicanthus`. */
export interface LidState {
  phiM: number;
  phiL: number;
  upper: number;
  lower: number;
  tilt: number;
  squint: number;
  pitch: number;
  peak: number;
  epicanthus: number;
  /** The medial and lateral canthi's elevation under the equator, rad (FISSURE_MM.canthus, canthusL). */
  drop: number;
  dropL: number;
}

/**
 * The lids as EyeStage sets them each frame: the person's aperture and tilt,
 * coupled to the gaze (−1..1 units), squinting by `squint`.
 */
export function lidState(o: {
  aperture?: number;
  tiltDeg?: number;
  epicanthus?: number;
  squint?: number;
  gaze?: { x: number; y: number };
}): LidState {
  const fa = fissureAngles(o.aperture ?? 1);
  const g = o.gaze ?? { x: 0, y: 0 };
  return {
    ...fa,
    tilt: ((o.tiltDeg ?? 0) * Math.PI) / 180,
    squint: o.squint ?? 0,
    pitch: gazePitchUnits(g.y) * GAZE_PITCH,
    peak: -0.04 + 0.25 * g.x * GAZE_YAW,
    epicanthus: o.epicanthus ?? 0,
  };
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** -1 at the medial corner, 0 at the apex, +1 at the lateral corner (beyond, |s| > 1). */
export function sideOf(phi: number, L: LidState): number {
  return phi < L.peak ? (phi - L.peak) / (L.peak - L.phiM) : (phi - L.peak) / (L.phiL - L.peak);
}

/** The azimuth at a side position s (inverse of sideOf). */
export function azimuthOf(s: number, L: LidState): number {
  return s < 0 ? L.peak + s * (L.peak - L.phiM) : L.peak + s * (L.phiL - L.peak);
}

/**
 * The side position measured across the image instead of in azimuth: −1 at
 * the medial corner, +1 at the lateral one, as the arcs are bowed.
 */
export function projectedSide(s: number, L: LidState): number {
  const sp = Math.sin(L.peak);
  const sx = Math.sin(azimuthOf(s, L)) - sp;
  return s < 0 ? sx / (sp - Math.sin(L.phiM)) : sx / (Math.sin(L.phiL) - sp);
}

/** The tear lake's rounding: 1 until the lake, falling to 0 at the corner like a circle. */
function cap0(a: number) {
  const t = clamp((a - LAKE_B) / (1 - LAKE_B), 0, 1);
  return Math.sqrt(Math.max(1 - t * t, 0));
}
function lake0(a: number, inner: boolean) {
  return inner ? smoothstep(LAKE_A, LAKE_B, a) : 0;
}

/**
 * The medial bows (R6), fitted to the user's eye (photo 4, rms 0.26 mm over
 * five points as shares of the canthus-to-apex rise): the upper lid tapers
 * into the canthus a little faster than an arc, the lower one stays nearly
 * level nasally and falls to its apex under the iris.
 */
export const MEDIAL = { pU: 2.2, taper: 0.4, taper0: 0.45, l0: 0.15, l1: 0.95 } as const;
/** The tear lake: blends in over a LAKE_A..LAKE_B, then closes round (~0.9 mm tall). */
export const LAKE_A = 0.86;
export const LAKE_B = 0.91;
function bowUm(a: number) {
  return (1 - Math.pow(a, MEDIAL.pU)) * (1 - MEDIAL.taper * smoothstep(MEDIAL.taper0, 1, a));
}
function bowLm(al: number) {
  return 1 - smoothstep(MEDIAL.l0, MEDIAL.l1, al);
}

/**
 * The margins' elevation at side position s: open (no blink) and now. The
 * same arithmetic as nodes/margins.ts `marginsAt`, line for line.
 */
export function marginsAt(s: number, L: LidState, blink = 0) {
  const inner = s < 0;
  const xs = projectedSide(s, L);
  const a = clamp(Math.abs(xs), 0, 1);
  const bowU0 = inner ? bowUm(a) : 1 - Math.pow(a, 2.2);
  const sl = xs - 0.07;
  const bowU = mix(bowU0, cap0(a) * bowUm(LAKE_B), lake0(a, inner));
  const innerL = sl < 0;
  const al = clamp(innerL ? -sl / 1.07 : sl / 0.93, 0, 1);
  const bowL0 = innerL ? bowLm(al) : 1 - Math.pow(al, 1.6);
  const bowL = mix(bowL0, cap0(a) * bowLm((LAKE_B + 0.07) / 1.07), lake0(a, inner));
  // the outer corner lifts by the canthal tilt; toward the inner one both lids
  // come down to the canthus as their bows run out
  const lift = L.tilt * Math.pow(clamp(xs, 0, 1), 2);
  const dropU = (inner ? L.drop : L.dropL) * (1 - bowU);
  const dropL = (innerL ? L.drop : L.dropL) * (1 - bowL);
  const fold = L.epicanthus * 0.035 * smoothstep(0.4, 0.9, -s) * (1 - Math.pow(a, 6));
  const unevenU = Math.sin(xs * 4.1 + 0.6) * 0.018 + Math.sin(xs * 9.3 + 2.2) * 0.007;
  const unevenL = Math.sin(xs * 5.7 + 1.1) * 0.012 + Math.sin(xs * 11.1 + 0.3) * 0.005;
  const upOpen =
    (L.upper * bowU + unevenU * bowU) * (1 - L.squint * 0.25) +
    upperRide(L.pitch) * bowU +
    lift -
    dropU -
    fold;
  const loOpen = -(L.lower * bowL * (1 - L.squint * 0.2)) + unevenL * bowL + L.pitch * (L.pitch < 0 ? LID_GAZE.lowerDown : LID_GAZE.lowerUp) * bowL + lift - dropL;
  const upOpenSafe = Math.max(upOpen, loOpen + 0.004);
  const lo = loOpen + blink * 0.12 * L.lower * bowL;
  const up = Math.max(mix(upOpenSafe, lo + 0.012, blink), lo + 0.004);
  return { upOpen: upOpenSafe, loOpen, up, lo };
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** A point on the margins' sphere at azimuth φ and elevation θ, face space (mm, globe at the origin). */
export function marginPoint(phi: number, theta: number, r = MARGIN_RADIUS): [number, number, number] {
  return [r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta), r * Math.cos(theta) * Math.cos(phi)];
}

/**
 * Both margins as polylines of n points each from the medial corner to the
 * lateral one, face space (mm): what the lab's overlay draws and, from R6,
 * what the media sample instead of their guessed almond.
 */
export function marginCurves(L: LidState, blink = 0, n = 64) {
  const upper: [number, number, number][] = [];
  const lower: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const s = -1 + (2 * i) / (n - 1);
    const m = marginsAt(s, L, blink);
    const phi = azimuthOf(s, L);
    upper.push(marginPoint(phi, m.up));
    lower.push(marginPoint(phi, m.lo));
  }
  return { upper, lower };
}
