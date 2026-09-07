/**
 * Kiruk Ink — owned stroke atom types.
 * Raw points are the source of truth; geometry is recomputed on render/export.
 */

export type InkTool = 'ink' | 'pencil' | 'eraser'
export type InkTone = 'ink' | 'accent'

export interface InkPoint {
  x: number
  y: number
  /** Pressure 0–1. Mouse fallback is typically 0.5. */
  p: number
  /** Optional timestamp (ms). */
  t?: number
}

export interface InkStroke {
  id: string
  tool: InkTool
  size: number
  opacity: number
  tone: InkTone
  /** Hex ink color. Default black — color is opt-in. */
  color?: string
  points: InkPoint[]
}

export interface InkSize {
  width: number
  height: number
}

export interface InkDocument {
  version: 1
  size: InkSize
  strokes: InkStroke[]
}

export const INK_DOC_VERSION = 1 as const
export const DEFAULT_INK_SIZE: InkSize = { width: 1920, height: 1080 }
/** Full-bleed strip for infinite vertical notebook (edge-to-edge). */
export const INK_STRIP_SIZE: InkSize = { width: 1920, height: 720 }

