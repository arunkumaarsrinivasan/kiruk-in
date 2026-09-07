/**
 * Kiruk Ink — public API for the owned handwritten engine.
 */

export type {
  InkDocument,
  InkPoint,
  InkStroke,
  InkSize,
  InkTool,
  InkTone,
} from './types'
export { INK_DOC_VERSION, DEFAULT_INK_SIZE, INK_STRIP_SIZE } from './types'

export {
  createInkDoc,
  serialize,
  deserialize,
  appendStroke,
  makeDrawStroke,
  eraseAlongPath,
  undoStroke,
  clearStrokes,
} from './document'

export { BRUSHES, ERASER_RADIUS, brushFor } from './brushes'
export type { BrushPreset } from './brushes'

export {
  getGeometryAdapter,
  setGeometryAdapter,
  perfectFreehandAdapter,
} from './geometry'
export type { StrokeGeometryAdapter, BrushOpts } from './geometry'

export { samplePointer, samplePointerEvent, shouldAcceptPointer } from './input/pointer'
export { exportSvg, outlineToPath, strokeOutlinePath } from './export/svg'
export {
  strokeBounds,
  clusterStrokeBounds,
  bandSlicedStrokeBounds,
  sliceStrokeIntoBands,
  strokeBandXExtent,
  boundsToEm,
  obstaclesFromInkDoc,
  obstaclesEqual,
  type InkBounds,
  type ObstacleBox,
} from './bounds'

/** Legacy scan theme-pass — only for old foreign SVGs, not new Kiruk Ink. */
export { themePassSvg } from './theme-pass'
