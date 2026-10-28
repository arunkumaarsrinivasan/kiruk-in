/**
 * Where a point of the iris was at rest, as the pupil moves: the CPU twin of
 * nodes/iris.ts `restSpace`.
 *
 * Radii are shares of the iris radius unless named in mm.
 */

/**
 * The rest space (after Pamplona et al. 2009): the pupillary zone, between
 * the pupil and the collarette, keeps its area (the sphincter does not
 * stretch, and the collarette follows the pupil); the ciliary zone stretches
 * linearly to the root, which never moves.
 *
 * r: radius now; rp: pupil radius now; rp0: pupil at rest; rc0: the
 * collarette at rest; R: the root. All mm (or all shares). Returns r0.
 */
export function areaPreservingRest(r: number, rp: number, rp0: number, rc0: number, R: number) {
  const rc = Math.sqrt(Math.max(rp * rp + rc0 * rc0 - rp0 * rp0, 0));
  if (r <= rc) return Math.sqrt(Math.max(r * r - rp * rp + rp0 * rp0, 0));
  return rc0 + ((r - rc) * (R - rc0)) / (R - rc);
}

/** Where the collarette is now, for a pupil rp (same units). */
export function collaretteNow(rp: number, rp0: number, rc0: number) {
  return Math.sqrt(Math.max(rp * rp + rc0 * rc0 - rp0 * rp0, 0));
}

/**
 * As the shader runs it (nodes/iris.ts `restSpace`): the area-preserving
 * rest space, with the collarette held short of the root. Past ~0.9 open the
 * pupillary zone can't keep its area (the collarette would leave the iris),
 * so it is squeezed by the same share instead. Shares of the iris radius.
 */
export function shaderRestRho(rho: number, rp: number, rp0: number, rc0: number) {
  const rc = Math.min(Math.sqrt(Math.max(rp * rp + rc0 * rc0 - rp0 * rp0, 0)), rp + (1 - rp) * 0.55);
  if (rho <= rc) {
    const share = (rho * rho - rp * rp) / Math.max(rc * rc - rp * rp, 1e-5);
    return Math.sqrt(Math.max(rp0 * rp0 + share * (rc0 * rc0 - rp0 * rp0), 0));
  }
  return rc0 + ((rho - rc) * (1 - rc0)) / Math.max(1 - rc, 1e-3);
}
