/**
 * Top spacing under the eye nav.
 *
 * The upper lid is a parabola: `--simple-game-nav-bottom` deep at the screen
 * edges, only `--eye-mid` deep in the middle (both published by Navbar, with
 * `--eye-vw`). Padding every page by the edge depth leaves an empty lens
 * between the curve and the content. Instead, a centred column `col` px wide
 * starts just under the lid at its own corners, so narrow columns tuck up into
 * the eye's opening and full-width ones still clear the edges.
 */

const u = (col: number) => `min(1, ${col} / var(--eye-vw, 1440))`;

/** Upper-lid depth at the corners of a centred column `col` px wide. */
export const eyeDepth = (col: number) =>
  `calc(var(--eye-mid, 12px) + (var(--simple-game-nav-bottom, 72px) - var(--eye-mid, 12px)) * ${u(col)} * ${u(col)})`;

/** `eyeDepth` plus breathing room: where a column's first row should start. */
export const eyeClear = (col: number, gap = 24) => `calc(${eyeDepth(col)} + ${gap}px)`;

/** Gap between the lid and a page bar tucked into the eye. */
export const EYE_BAR_GAP = 8;
