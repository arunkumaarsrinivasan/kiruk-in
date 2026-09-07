import type { StrokeGeometryAdapter } from './types'
import { perfectFreehandAdapter } from './perfect-freehand'

let active: StrokeGeometryAdapter = perfectFreehandAdapter

/** Current geometry adapter (default: perfect-freehand). */
export function getGeometryAdapter(): StrokeGeometryAdapter {
  return active
}

/** Swap brush math without touching document JSON or UI. */
export function setGeometryAdapter(adapter: StrokeGeometryAdapter): void {
  active = adapter
}

export type { StrokeGeometryAdapter, BrushOpts } from './types'
export { perfectFreehandAdapter }
