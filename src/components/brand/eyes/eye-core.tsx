"use client";

/**
 * Shared scaffold for the Kiruk "multiverse" eyes.
 *
 * Every era draws the SAME underlying eye — an outer ring, an overlapping iris
 * ring, a right-side semicircle lid, and a pupil — but each renders it in its
 * own display medium (phosphor cells, 1-bit dither, hyperlink, neon GIF, aqua
 * gel, skeuomorph glass, AI orb …). These constants keep the silhouette
 * consistent so the marks read as one identity across universes.
 */

import { MotionValue, useTransform } from "framer-motion";

/** Normalized canvas. ~1.5:1, matching the brand artwork. */
export const EYE_VB = "0 0 120 80";
export const EYE_RATIO = 120 / 80;

/** Canonical anchor geometry (viewBox units). */
export const EYE = {
  outer: { cx: 44, cy: 40, r: 30 }, // outer full ring
  iris: { cx: 64, cy: 40, r: 22 }, // inner iris ring
  pupil: { cx: 72, cy: 40, r: 12 }, // pupil home
  /** right-side semicircle lid (open to the left) */
  arc: "M70 14 A 26 26 0 0 1 70 66",
} as const;

export interface EyeProps {
  gx: MotionValue<number>; // cursor x, -1..1
  gy: MotionValue<number>; // cursor y, -1..1
  reduce: boolean;
  /** gaze enabled and motion allowed */
  live: boolean;
  /** pressed/hovered — used by tactile eras (e.g. skeuomorph). */
  hovered: boolean;
}

/** Tracked pupil center as motion values. `snap` quantizes to a grid. */
export function usePupil(
  gx: MotionValue<number>,
  gy: MotionValue<number>,
  opts: { tx?: number; ty?: number; snap?: boolean } = {},
) {
  const { tx = 10, ty = 7, snap = false } = opts;
  const q = (v: number) => (snap ? Math.round(v * 2) / 2 : v);
  const cx = useTransform(gx, (v) => EYE.pupil.cx + q(v) * tx);
  const cy = useTransform(gy, (v) => EYE.pupil.cy + q(v) * ty);
  return { cx, cy };
}
