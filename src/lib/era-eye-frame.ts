/**
 * Where the eye sits, at any viewport shape.
 *
 * The shader, the dial and the hit-testing in the picker all need the same
 * answer to "how much of the eye is on screen, and where is its centre" — so
 * the framing lives here once rather than three times in slightly different
 * numbers.
 *
 * The eye is roughly 2:1. A phone is 1:2. Fitting the whole almond into a
 * portrait viewport leaves it a small lozenge stranded in a lot of black, so
 * on a narrow screen the shot pushes *in* instead: the lid corners run off the
 * sides and what is left is the eyeball — cornea, iris, pupil — at the scale a
 * macro lens would give it. The crop opens back out to the full fissure as the
 * viewport widens.
 */

/** Half the eye's height in eye units, aperture plus the lid band around it. */
export const EYE_HALF_H = 0.545;
/** Iris radius in eye units. Mirrors IRIS_R in the shader. */
export const EYE_IRIS_R = 0.345;

/** Narrowest and widest the visible half-width is allowed to get, in eye units. */
const HALF_W_MIN = 0.66;
const HALF_W_MAX = 0.98;
/** Aspect at which the crop has fully opened out to the whole eye. */
const OPEN_AT = 1.28;
const CROP_AT = 0.46;

/**
 * Eye centre as a fraction of viewport height. A phone lifts it well clear of
 * centre: the crop has made the eyeball nearly as tall as the screen, and the
 * dial, the year and the instruction all need somewhere to live that is not
 * on top of an iris.
 */
const CENTER_Y_TALL = 0.36;
const CENTER_Y_WIDE = 0.47;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1);
}

export interface EyeFrame {
  /** Viewport aspect, width over height. */
  aspect: number;
  /** Eye units spanned by the viewport's height. Larger means further back. */
  span: number;
  /** Eye units either side of centre that are on screen. */
  halfW: number;
  /** Eye centre as a fraction of viewport height, measured from the top. */
  centerY: number;
  /** Vertical shift applied in the shader, in eye units. */
  offsetY: number;
  /** Eye centre in CSS pixels. */
  cx: number;
  cy: number;
  /** Iris radius in CSS pixels — the tap target that means "go in". */
  irisPx: number;
}

/**
 * @param eyeHeight eye height as a share of viewport height, before the
 *                  width term has its say.
 */
export function eyeFrame(w: number, h: number, eyeHeight = 1): EyeFrame {
  const width = Math.max(w, 1);
  const height = Math.max(h, 1);
  const aspect = width / height;

  // How much of the eye's width the shot keeps. Narrow viewports keep the
  // eyeball and throw the corners away; wide ones keep everything.
  const open = (aspect - CROP_AT) / (OPEN_AT - CROP_AT);
  const halfW = clamp(mix(HALF_W_MIN, HALF_W_MAX, open), HALF_W_MIN, HALF_W_MAX);

  // Height frames the shot; width only pulls back once the viewport is
  // narrower than that crop.
  const span = Math.max(
    (EYE_HALF_H * 2) / Math.max(eyeHeight, 0.05),
    (halfW * 2) / Math.max(aspect, 0.01),
  );

  const centerY = mix(CENTER_Y_TALL, CENTER_Y_WIDE, (aspect - CROP_AT) / (1.1 - CROP_AT));

  return {
    aspect,
    span,
    halfW: (aspect * span) / 2,
    centerY,
    offsetY: (0.5 - centerY) * span,
    cx: width / 2,
    cy: centerY * height,
    irisPx: (EYE_IRIS_R / span) * height,
  };
}
