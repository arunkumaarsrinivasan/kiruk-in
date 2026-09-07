/**
 * Dual-hand SketchInk pools.
 *
 * Font constants + helpers live in `config.ts` (single tunable source).
 * Face pick is home-only — variation comes from angle/jitter (and Kiruk `calt`).
 */

import {
  FALLBACK_FONT,
  FONT_OPTICAL_SCALE,
  PRINT_EMPHASIS,
  PRINT_FONTS,
  PRINT_HOME,
  SCRIPT_FONTS,
  SCRIPT_HOME,
  USE_KIRUK_HAND,
  type SketchHand,
} from './config'

export {
  USE_KIRUK_HAND,
  PRINT_HOME,
  PRINT_EMPHASIS,
  SCRIPT_HOME,
  PRINT_FONTS,
  SCRIPT_FONTS,
  FALLBACK_FONT,
  FONT_OPTICAL_SCALE,
}
export type { SketchHand, SketchMode } from './config'

export function homeFont(hand: SketchHand): string {
  return hand === 'print' ? PRINT_HOME : SCRIPT_HOME
}

export function opticalScale(font: string): number {
  return FONT_OPTICAL_SCALE[font] ?? 1
}

/** One face per hand — no mid-page Rock Salt / Reenie roulette. */
export function faceForRun(hand: SketchHand, _word: string, _rng: () => number): string {
  return homeFont(hand)
}

export function poolFor(hand: SketchHand): readonly string[] {
  return hand === 'print' ? PRINT_FONTS : SCRIPT_FONTS
}

/**
 * CSS font-family for a painted run.
 * Named face first; same-hand CSS var fallback (never Playpen).
 */
export function handFontFamily(font: string, hand: SketchHand): string {
  const fallback =
    hand === 'print' ? 'var(--font-print-a), cursive' : 'var(--font-script-a), cursive'
  return `"${font}", ${fallback}`
}
