/**
 * The macro shot at any viewport shape: which millimetres round the globe's
 * centre are on screen, and where that puts the iris in CSS pixels.
 *
 * Three-free, so the loader's poster is placed by the same numbers the live
 * eye's camera uses, and the tap that means "go in" lands on the same iris.
 *
 * Every screen holds a box round the eye: the whole almond with the brow over
 * it, as tall as the box or as wide, whichever the window needs. A phone used
 * to push in to the eyeball and throw the corners away (era-eye-frame's crop);
 * on a phone that read as a blur of iris rather than an eye, so a phone now
 * fits the box's width and shows the face above and below the eye instead.
 */

import { EYE_IRIS_R } from "@/lib/era-eye-frame";
import { MM_PER_UNIT } from "./anatomy";

/** A shot, mm round the globe's centre. */
export interface FrameBox {
  halfW: number;
  top: number;
  bottom: number;
}

/**
 * What a wide screen frames: the eye large, the brow along the top edge, the
 * lower lid's bulge and lashes below, and the corners with some face to each
 * side. The shot fits this box whatever the window's shape; on a wide screen
 * its height sets the zoom. (The user, 2026-10-28: the eye looked too small,
 * with too much skin round it, against the old full-frame eye: 21.5 mm tall,
 * where 25 left the eye ~16 % smaller. Then centred (the user): the
 * almond's middle (~0.5 mm under the globe's centre) on the frame's middle;
 * at −8.5..13 it sat ~60 % down the screen. 22.5 mm tall, the eye still ~11 %
 * larger than at 25; the brow's upper part runs off the frame's top. The top
 * was 15 for a lifted brow's headroom, and 12 before that.)
 */
// (2026-10-29, the user: too much room at the sides and below, the brow
// cropped. With the brow 1 mm closer (brow-shape.ts) the box runs from the
// brow's top to the lower lashes' tips: 21.3 mm, the eye ~6 % larger, the
// whole brow in frame; the eye sits a little under the middle, under its brow.)
// (top 13.5 with the brow back up 0.7 mm, so it stays whole in frame)
export const FRAME_BOX: FrameBox = { halfW: 15, top: 13.5, bottom: -8.3 };

/**
 * A phone: the same width, so the whole almond spans the screen with a little
 * skin past each corner. The box reaches further down, which lifts the eye a
 * little above the middle of a tall screen, where a portrait's eye rests.
 */
const PHONE_BOX: FrameBox = { halfW: 15.5, top: 13.5, bottom: -15 };

/** Aspects over which the phone's box hands over to the wide screen's. */
const PHONE_UNTIL = 0.75;
const WIDE_FROM = 1.1;

function boxFor(aspect: number): FrameBox {
  const t = Math.min(1, Math.max(0, (aspect - PHONE_UNTIL) / (WIDE_FROM - PHONE_UNTIL)));
  const s = t * t * (3 - 2 * t);
  return {
    halfW: PHONE_BOX.halfW + (FRAME_BOX.halfW - PHONE_BOX.halfW) * s,
    top: PHONE_BOX.top + (FRAME_BOX.top - PHONE_BOX.top) * s,
    bottom: PHONE_BOX.bottom + (FRAME_BOX.bottom - PHONE_BOX.bottom) * s,
  };
}

export interface EyeShot {
  /** Viewport aspect, width over height. */
  aspect: number;
  /** Eye units spanned by the viewport's height. */
  span: number;
  /** How far above the eye the camera looks, eye units. */
  offsetY: number;
  /** Eye centre as a fraction of viewport height, from the top. */
  centerY: number;
  /** Eye centre, CSS px. */
  cx: number;
  cy: number;
  /** Iris radius, CSS px. */
  irisPx: number;
}

/**
 * @param box a shot of the caller's own (the lab's); by default a phone's or
 *            a wide screen's, blended by the window's shape.
 */
export function eyeShot(w: number, h: number, box?: FrameBox): EyeShot {
  const width = Math.max(w, 1);
  const height = Math.max(h, 1);
  const aspect = width / height;
  const B = box ?? boxFor(aspect);
  const span = Math.max(B.top - B.bottom, (B.halfW * 2) / aspect) / MM_PER_UNIT;
  // the frame's middle on the box's middle
  const offsetY = -((B.top + B.bottom) / 2) / MM_PER_UNIT;
  const centerY = 0.5 - offsetY / span;
  return {
    aspect,
    span,
    offsetY,
    centerY,
    cx: width / 2,
    cy: centerY * height,
    irisPx: (EYE_IRIS_R / span) * height,
  };
}
