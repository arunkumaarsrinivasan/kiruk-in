/**
 * The eye, measured. Every layer of the TSL eye reads its sizes from here, in
 * millimetres, so a cornea and the iris under it can never disagree about how
 * far apart they are. Adult averages; see docs/EYE_TSL_PLAN.md §3.
 */

import { EYE_IRIS_R } from "@/lib/era-eye-frame";

export const ANATOMY = {
  /** Eyeball radius. Axial length is about 24 mm. */
  eyeballRadius: 12,
  /** Front surface of the cornea at its apex. Steeper than the ball, so it bulges. */
  corneaRadius: 7.8,
  /**
   * The front surface is a conic, flattening toward its edge (Q ≈ −0.25, the
   * published mean): the page bends in it as in a real cornea, not a ball.
   */
  corneaAsphericity: -0.25,
  /** Back surface of the cornea, a sphere (Navarro's schematic eye). */
  corneaPosteriorRadius: 6.5,
  corneaDiameter: 11.8,
  corneaThickness: 0.55,
  /**
   * Apex to the pupil's plane: the cornea plus the anterior chamber (~3.05
   * mm). Through the cornea the pupil then appears 3.05 mm deep at ×1.13,
   * Gullstrand's entrance pupil (twin/optics.test.ts).
   */
  pupilDepth: 3.6,
  /**
   * The visible iris is wider than tall: the sclera overlaps the cornea more
   * above and below (HVID ~11.7 mm, VVID ~10.6 mm).
   */
  limbusAspect: 10.6 / 11.7,
  /** Cornea apex to the iris, across the aqueous humour. */
  chamberDepth: 3,
  iorCornea: 1.376,
  iorAqueous: 1.336,
  irisRadius: 6,
  /** Pupil diameter in bright light and in the dark. */
  pupilMin: 2,
  pupilMax: 8,
  fissureWidth: 29,
  fissureHeight: 9.5,
} as const;

/**
 * The 2D picker measures the eye in "eye units": 1 is half the eye's width and
 * the iris radius is EYE_IRIS_R. The 3D eye keeps that scale, so the dial and
 * the tap target that means "go in" stay over the same iris.
 */
export const MM_PER_UNIT = ANATOMY.irisRadius / EYE_IRIS_R;

/**
 * The plane the framing is measured on: the iris, a little behind the cornea's
 * apex. eyeFrame's span is a height on this plane.
 */
export const FRAME_PLANE_Z =
  Math.sqrt(ANATOMY.eyeballRadius ** 2 - ANATOMY.irisRadius ** 2);

/** Where the cornea meets the white: half the corneal diameter. */
export const LIMBUS_RADIUS = ANATOMY.corneaDiameter / 2;

/**
 * The cornea's mesh is a cap of its own sphere, seated on the globe at the
 * limbus: its centre of curvature sits on the visual axis, CORNEA_CENTER_Z mm
 * in front of the globe's centre, and the cap spans CORNEA_CAP radians from
 * its apex. The vertex stage then lays each point onto the conic
 * (`corneaSag`), which meets the globe at the same limbus.
 */
export const LIMBUS_Z = Math.sqrt(ANATOMY.eyeballRadius ** 2 - LIMBUS_RADIUS ** 2);
export const CORNEA_CENTER_Z =
  LIMBUS_Z - Math.sqrt(ANATOMY.corneaRadius ** 2 - LIMBUS_RADIUS ** 2);
export const CORNEA_CAP = Math.asin(LIMBUS_RADIUS / ANATOMY.corneaRadius);

/** The front surface's sag at a distance r from the axis: how far it falls back from its apex (mm). */
export function corneaSag(r: number) {
  const R = ANATOMY.corneaRadius;
  const k = 1 + ANATOMY.corneaAsphericity;
  return (r * r) / (R * (1 + Math.sqrt(Math.max(1 - (k * r * r) / (R * R), 0))));
}

/** The cornea's apex, mm in front of the globe's centre (the conic meets the globe at the limbus). */
export const CORNEA_APEX_Z = LIMBUS_Z + corneaSag(LIMBUS_RADIUS);

/**
 * The iris is not flat: the lens pushes its pupil margin forward, so it is a
 * shallow cone, ~0.4 mm higher at the pupil than at the root. The pupil's
 * plane sits `pupilDepth` (3.6 mm) behind the cornea's apex.
 */
export const IRIS_Z_PUPIL = CORNEA_APEX_Z - ANATOMY.pupilDepth;
export const IRIS_Z_ROOT = IRIS_Z_PUPIL - 0.4;

/**
 * A macro lens: long and narrow, so the eye is not stretched by perspective
 * the way a wide lens at this distance would stretch it.
 */
export const CAMERA_FOV = 12;

/**
 * How far the globe turns at the ends of the gaze range, in radians. Matched
 * to how far the live eye's iris travels; a real eye goes further, but this
 * one is wandering a room, not reading a wall.
 */
export const GAZE_YAW = (24 * Math.PI) / 180;
export const GAZE_PITCH = (10 * Math.PI) / 180;

/**
 * The eye's vertical range is lopsided, as a real eye's is (the user,
 * 2026-10-28: looking up went too far, looking down not far enough). Up, the
 * brow's bony rim and the tightening lid resist it: a soft stop at ~8.5°,
 * flattening as it nears it. Down there is room (a real eye goes about half
 * again as far down as up), and the upper lid follows it, so the eye half
 * closes: 16° at the screen's foot. Takes the gaze rig's y (±1 the screen's
 * edges) and returns it in GAZE_PITCH units, which the globe's turn, the lids
 * and the cornea all read (U.gaze.y).
 */
export function gazePitchUnits(y: number): number {
  // (0.7, 2026-10-29: at 0.85 the hovering cursor up top still showed a bulged,
  // staring eye; ~7° keeps the iris under the lid)
  return y > 0 ? (0.7 * Math.tanh(1.4 * y)) / Math.tanh(1.4) : 1.6 * y;
}
/**
 * Bell's phenomenon: under a closing lid the eye rolls up. The live eye
 * nudges its iris up a tenth of a unit on a blink; this is that, as a turn.
 */
export const BELL_PITCH = (9 * Math.PI) / 180;

