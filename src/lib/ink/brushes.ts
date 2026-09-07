import type { InkTool } from './types'

/**
 * Owned brush presets — not vendor types.
 * Mapped to perfect-freehand options only inside the geometry adapter.
 */
export interface BrushPreset {
  tool: InkTool
  /** Base stroke diameter. */
  size: number
  opacity: number
  thinning: number
  smoothing: number
  streamline: number
  /** When false and real pressure is present, use pointer pressure. */
  simulatePressure: boolean
}

export const BRUSHES: Record<'ink' | 'pencil', BrushPreset> = {
  ink: {
    tool: 'ink',
    size: 8,
    opacity: 1,
    thinning: 0.6,
    smoothing: 0.45,
    streamline: 0.5,
    simulatePressure: true,
  },
  pencil: {
    tool: 'pencil',
    size: 4,
    opacity: 0.75,
    thinning: 0.35,
    smoothing: 0.55,
    streamline: 0.65,
    simulatePressure: true,
  },
}

/** Eraser hit radius in document coordinates. */
export const ERASER_RADIUS = 18

export function brushFor(tool: InkTool): BrushPreset {
  if (tool === 'eraser') return BRUSHES.ink
  return BRUSHES[tool]
}
