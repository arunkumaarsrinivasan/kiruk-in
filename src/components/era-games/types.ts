/**
 * Shared palette for era interactive boxes (runner, constellation, …). Each era
 * passes its own colors + font so the same engine re-skins per era.
 */
export interface GamePalette {
  /** canvas background */
  bg: string;
  /** primary stroke/text */
  fg: string;
  /** dim/secondary */
  dim: string;
  /** bright highlight */
  bright: string;
  /** accent (collectibles, score) */
  accent: string;
  /** danger / obstacles / game over */
  danger: string;
  /** monospace/display font stack */
  font: string;
  /** glow blur in px (0 = none) */
  glow?: number;
  /** show CRT scanline overlay */
  scanlines?: boolean;
  /** deep-space backdrop for the telescope (defaults to near-black) */
  space?: string;
}
