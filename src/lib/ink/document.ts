import {
  DEFAULT_INK_SIZE,
  INK_DOC_VERSION,
  type InkDocument,
  type InkPoint,
  type InkSize,
  type InkStroke,
  type InkTone,
  type InkTool,
} from './types'
import { brushFor, ERASER_RADIUS } from './brushes'

function uid(): string {
  return `s_${Math.random().toString(36).slice(2, 10)}`
}

export function createInkDoc(size: InkSize = DEFAULT_INK_SIZE): InkDocument {
  return { version: INK_DOC_VERSION, size: { ...size }, strokes: [] }
}

export function serialize(doc: InkDocument): string {
  return `${JSON.stringify(doc, null, 2)}\n`
}

export function deserialize(raw: string): InkDocument {
  const parsed = JSON.parse(raw) as InkDocument
  if (parsed.version !== 1 || !parsed.size || !Array.isArray(parsed.strokes)) {
    throw new Error('Invalid InkDocument')
  }
  return parsed
}

export function appendStroke(
  doc: InkDocument,
  stroke: Omit<InkStroke, 'id'> & { id?: string },
): InkDocument {
  if (stroke.points.length === 0) return doc
  return {
    ...doc,
    strokes: [
      ...doc.strokes,
      {
        id: stroke.id ?? uid(),
        tool: stroke.tool,
        size: stroke.size,
        opacity: stroke.opacity,
        tone: stroke.tone,
        color: stroke.color ?? '#000000',
        points: stroke.points,
      },
    ],
  }
}

/** Build a draw stroke from live points using the brush preset for that tool. */
export function makeDrawStroke(
  tool: Exclude<InkTool, 'eraser'>,
  points: InkPoint[],
  tone: InkTone = 'ink',
  color = '#000000',
): Omit<InkStroke, 'id'> {
  const brush = brushFor(tool)
  return {
    tool,
    size: brush.size,
    opacity: brush.opacity,
    tone,
    color,
    points,
  }
}

/**
 * Vector eraser: remove strokes whose points fall within radius of the erase path.
 * Keeps SVG export correct (no canvas-only destination-out).
 */
export function eraseAlongPath(doc: InkDocument, path: InkPoint[], radius = ERASER_RADIUS): InkDocument {
  if (path.length === 0) return doc
  const r2 = radius * radius
  const hits = (stroke: InkStroke) =>
    stroke.points.some((sp) =>
      path.some((ep) => {
        const dx = sp.x - ep.x
        const dy = sp.y - ep.y
        return dx * dx + dy * dy <= r2
      }),
    )
  return { ...doc, strokes: doc.strokes.filter((s) => !hits(s)) }
}

export function undoStroke(doc: InkDocument): InkDocument {
  if (doc.strokes.length === 0) return doc
  return { ...doc, strokes: doc.strokes.slice(0, -1) }
}

export function clearStrokes(doc: InkDocument): InkDocument {
  return { ...doc, strokes: [] }
}
