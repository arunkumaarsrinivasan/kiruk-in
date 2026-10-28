/**
 * The cornea in plain numbers: the CPU twin of the eye's optics, so tests can
 * hold the geometry to published measurements and the media can read the
 * iris and pupil as they appear through the cornea, not as they sit.
 *
 * Since R1 (docs/EYE_REALISM_PLAN.md) the eye (nodes/cornea.ts) refracts
 * twice: into the cornea at its conic front surface, then into the aqueous at
 * its spherical back surface; the pupil's plane sits 3.6 mm behind the apex
 * and the iris is a cone 0.4 mm proud at the pupil. Paraxially only the
 * conic's apex radius counts.
 */

import { ANATOMY, CORNEA_APEX_Z, IRIS_Z_PUPIL, LIMBUS_RADIUS } from "../anatomy";

/** The eye, measured from the globe's centre along the optical axis (mm). */
export const CURRENT_EYE = {
  apexZ: CORNEA_APEX_Z,
  pupilZ: IRIS_Z_PUPIL,
  /** Apex to the pupil's plane. */
  pupilDepth: CORNEA_APEX_Z - IRIS_Z_PUPIL,
  corneaRadius: ANATOMY.corneaRadius,
  posteriorRadius: ANATOMY.corneaPosteriorRadius,
  thickness: ANATOMY.corneaThickness,
} as const;

/**
 * Refraction at one spherical surface, paraxial, light leaving the eye: an
 * object `so` mm behind the surface in a medium of index n1, seen from a
 * medium n2, the surface's centre of curvature on the object's side (radius R).
 * Returns where the image appears (mm behind the surface; virtual) and its
 * lateral magnification.
 */
function surface(so: number, n1: number, n2: number, R: number) {
  // n1/so + n2/si = (n2 − n1)/Rsigned, with Rsigned = −R (centre on the incoming side)
  const si = n2 / ((n2 - n1) / -R - n1 / so);
  return { behind: -si, m: -(n1 * si) / (n2 * so) };
}

/** The entrance pupil through one surface (today's eye): depth behind the apex (mm) and magnification. */
export function entrancePupil1(o: { R: number; n: number; depth: number }) {
  const s = surface(o.depth, o.n, 1, o.R);
  return { depth: s.behind, m: s.m };
}

/**
 * The entrance pupil through a cornea with two surfaces (R1's model): front
 * radius R1, back radius R2, thickness t, indices of cornea and aqueous, the
 * pupil `depth` mm behind the front apex.
 */
export function entrancePupil2(o: { R1: number; R2: number; t: number; nC: number; nA: number; depth: number }) {
  const back = surface(o.depth - o.t, o.nA, o.nC, o.R2);
  const front = surface(back.behind + o.t, o.nC, 1, o.R1);
  return { depth: front.behind, m: back.m * front.m };
}

/** The eye's entrance pupil: how deep and how magnified the pupil looks through the cornea. */
export function currentEntrancePupil() {
  return entrancePupil2({
    R1: CURRENT_EYE.corneaRadius,
    R2: CURRENT_EYE.posteriorRadius,
    t: CURRENT_EYE.thickness,
    nC: ANATOMY.iorCornea,
    nA: ANATOMY.iorAqueous,
    depth: CURRENT_EYE.pupilDepth,
  });
}

/** The visible limbus (mm, full width × height): an ellipse, the sclera overlapping it above and below. */
export function visibleLimbus() {
  return { w: LIMBUS_RADIUS * 2, h: LIMBUS_RADIUS * 2 * ANATOMY.limbusAspect };
}
