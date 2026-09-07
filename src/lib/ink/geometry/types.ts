import type { InkPoint } from '../types'

/**
 * Stroke geometry adapter — the only swappable brush-math boundary.
 * Default impl wraps perfect-freehand; alternatives plug in here.
 */
export interface BrushOpts {
  size: number
  thinning: number
  smoothing: number
  streamline: number
  simulatePressure: boolean
  /** true while the stroke is still being drawn (live preview). */
  last?: boolean
}

export interface StrokeGeometryAdapter {
  outline(points: InkPoint[], opts: BrushOpts): Array<[number, number]>
}
