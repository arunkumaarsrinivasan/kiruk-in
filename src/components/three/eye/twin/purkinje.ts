/**
 * The Purkinje images in plain numbers: the CPU twin of the trace in
 * nodes/cornea.ts (R4). The screen is mirrored four times by a living eye:
 * P1 by the cornea's front (the page on the cornea), P2 by its back (lost in
 * P1), P3 by the lens's front and P4 by the lens's back. P3 and P4 are what
 * shows inside the pupil.
 *
 * The lens is Navarro's (1985, unaccommodated): front radius 10.2 mm, back
 * −6.0, 4 mm thick, index 1.42, its front vertex on the pupil's plane. Rays
 * are traced exactly (no paraxial shortcut), in the same order the shader
 * follows them, so the shader can be held to this.
 *
 * Frame: the globe's centre at the origin, +z out of the eye toward the
 * screen, mm.
 */

import { ANATOMY, CORNEA_APEX_Z, CORNEA_CENTER_Z, IRIS_Z_PUPIL } from "../anatomy";

export const LENS = {
  /** Front surface, radius (mm); its vertex sits on the pupil's plane. */
  front: 10.2,
  /** Back surface, radius (mm). */
  back: 6.0,
  thickness: 4.0,
  n: 1.42,
} as const;

/** Where the lens's surfaces are, globe frame: vertex z and centre z. */
export const LENS_FRONT_Z = IRIS_Z_PUPIL;
export const LENS_FRONT_CZ = LENS_FRONT_Z - LENS.front;
export const LENS_BACK_Z = LENS_FRONT_Z - LENS.thickness;
export const LENS_BACK_CZ = LENS_BACK_Z + LENS.back;
/** The cornea's back surface (Navarro, as the shader's): centre z, radius. */
export const CORNEA_BACK_R = ANATOMY.corneaPosteriorRadius;
export const CORNEA_BACK_CZ = CORNEA_APEX_Z - ANATOMY.corneaThickness - CORNEA_BACK_R;

/** How much of the light each surface sends back at normal incidence (Fresnel). */
export function fresnel0(n1: number, n2: number) {
  return ((n2 - n1) / (n2 + n1)) ** 2;
}
/** P3 and P4 against P1: each lens surface reflects this fraction of what the cornea's front does. */
export const PURKINJE_VS_P1 = fresnel0(ANATOMY.iorAqueous, LENS.n) / fresnel0(1, ANATOMY.iorCornea);

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => mul(a, 1 / Math.hypot(...a));

/** GLSL's refract: incident I, normal N facing against I, ratio eta = n1/n2. */
export function refract(I: V3, N: V3, eta: number): V3 | null {
  const c = dot(N, I);
  const k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  return sub(mul(I, eta), mul(N, eta * c + Math.sqrt(k)));
}
export function reflect(I: V3, N: V3): V3 {
  return sub(I, mul(N, 2 * dot(N, I)));
}
/** The ray's hit on a sphere centred on the axis at z = cz: `far` the second root. */
function hitSphere(o: V3, d: V3, cz: number, r: number, far: boolean): V3 | null {
  const oc = sub(o, [0, 0, cz]);
  const b = dot(d, oc);
  const disc = b * b - (dot(oc, oc) - r * r);
  if (disc < 0) return null;
  const t = -b + (far ? 1 : -1) * Math.sqrt(disc);
  return t > 0 ? add(o, mul(d, t)) : null;
}
/** The outward normal (toward +z) of a sphere centred on the axis at cz, at point p (front-facing surfaces). */
const outward = (p: V3, cz: number): V3 => norm(sub(p, [0, 0, cz]));

/**
 * From a point on the pupil's plane, heading into the eye along `d`, follow
 * the ray to the lens, mirror it off its front (3) or back (4), and out
 * through the cornea. Returns the ray leaving the eye (origin on the cornea,
 * direction), or null where it is lost.
 */
export function purkinjeRay(p: V3, d: V3, which: 3 | 4): { o: V3; d: V3 } | null {
  const nA = ANATOMY.iorAqueous, nL = LENS.n, nC = ANATOMY.iorCornea;
  // the lens's front: a convex cap facing the cornea, its centre behind
  const f = hitSphere(p, d, LENS_FRONT_CZ, LENS.front, false);
  if (!f) return null;
  const nf = outward(f, LENS_FRONT_CZ);
  let o: V3, dir: V3;
  if (which === 3) {
    o = f;
    dir = reflect(d, nf);
  } else {
    const inL = refract(d, nf, nA / nL);
    if (!inL) return null;
    // the lens's back: convex toward the vitreous, its centre in front of it
    const b = hitSphere(f, inL, LENS_BACK_CZ, LENS.back, true);
    if (!b) return null;
    const nb = mul(outward(b, LENS_BACK_CZ), -1); // facing the vitreous
    const back = reflect(inL, nb);
    const f2 = hitSphere(b, back, LENS_FRONT_CZ, LENS.front, true);
    if (!f2) return null;
    const out = refract(back, mul(outward(f2, LENS_FRONT_CZ), -1), nL / nA);
    if (!out) return null;
    o = f2;
    dir = out;
  }
  // out through the cornea: its back, then its front (a sphere here; the shader's
  // conic differs by hundredths of a mm this close to the axis)
  const cb = hitSphere(o, dir, CORNEA_BACK_CZ, CORNEA_BACK_R, true);
  if (!cb) return null;
  const d1 = refract(dir, mul(outward(cb, CORNEA_BACK_CZ), -1), nA / nC);
  if (!d1) return null;
  const cf = hitSphere(cb, d1, CORNEA_CENTER_Z, ANATOMY.corneaRadius, true);
  if (!cf) return null;
  const d2 = refract(d1, mul(outward(cf, CORNEA_CENTER_Z), -1), nC / 1);
  if (!d2) return null;
  return { o: cf, d: d2 };
}

/** P1: off the cornea's front, from outside. */
export function p1Ray(o: V3, d: V3): { o: V3; d: V3 } | null {
  const cf = hitSphere(o, d, CORNEA_CENTER_Z, ANATOMY.corneaRadius, false);
  if (!cf) return null;
  return { o: cf, d: reflect(d, outward(cf, CORNEA_CENTER_Z)) };
}

/**
 * Where an image appears, and how big, for a distant point source `deg` off
 * the axis (in y), seen by a camera on the axis far away: the virtual image is
 * where the back-extensions of two nearby rays from the source cross after
 * leaving the eye (y, z).
 */
export function purkinjeImage(which: 1 | 3 | 4, deg = 5): { y: number; z: number } | null {
  const a = (deg * Math.PI) / 180;
  const d: V3 = [0, -Math.sin(a), -Math.cos(a)]; // light heading into the eye, from up the y axis
  const lines: { o: V3; d: V3 }[] = [];
  for (const h of [-0.25, 0.25]) {
    // a ray of the parallel beam, aimed through a point near the axis
    // (aimed at the zone the camera sees: for P1 where the cornea's normal
    // bisects source and camera, for P3 and P4 the pupil's middle)
    const aim = which === 1 ? ANATOMY.corneaRadius * Math.sin(a / 2) : 0;
    const o: V3 = [0, h + aim + 20 * Math.tan(a), CORNEA_APEX_Z + 20];
    let out: { o: V3; d: V3 } | null;
    if (which === 1) out = p1Ray(o, d);
    else {
      // into the eye through the cornea, then the purkinje path from the pupil's plane
      const cf = hitSphere(o, d, CORNEA_CENTER_Z, ANATOMY.corneaRadius, false);
      if (!cf) return null;
      const d1 = refract(d, outward(cf, CORNEA_CENTER_Z), 1 / nCor());
      if (!d1) return null;
      const cb = hitSphere(cf, d1, CORNEA_BACK_CZ, CORNEA_BACK_R, false);
      if (!cb) return null;
      const d2 = refract(d1, outward(cb, CORNEA_BACK_CZ), nCor() / ANATOMY.iorAqueous);
      if (!d2) return null;
      const t = (LENS_FRONT_Z + 0.3 - cb[2]) / d2[2];
      const p = add(cb, mul(d2, t));
      out = purkinjeRay(p, d2, which);
    }
    if (!out) return null;
    lines.push(out);
  }
  // the camera is far up +z: it sees each emergent ray as coming from where the
  // two rays' back-extensions meet (in the y–z plane)
  const [A, B] = lines;
  const den = A.d[1] * B.d[2] - A.d[2] * B.d[1];
  const s = ((B.o[1] - A.o[1]) * B.d[2] - (B.o[2] - A.o[2]) * B.d[1]) / den;
  const hit = add(A.o, mul(A.d, s));
  return { y: hit[1], z: hit[2] };
}
const nCor = () => ANATOMY.iorCornea;
