/**
 * Stroke bounding boxes + clustering for layout obstacles.
 * Used by pretext to carve free space so text wraps around ink.
 *
 * Coordinates: ink canvas fitParent uses CSS-pixel doc.size matching the
 * field's clientWidth/Height. Convert to em with a uniform font-size scale
 * (px / fontSizePx) — never stretch by fieldHeightEm, which warps Y when
 * text reflow changes the field height.
 *
 * Tall / diagonal strokes are sliced into horizontal bands so empty AABB
 * space does not punch page-wide canyons on every line.
 */

import type { InkDocument, InkStroke } from './types'

export interface InkBounds {
  x: number
  y: number
  w: number
  h: number
}

export interface ObstacleBox {
  xEm: number
  yEm: number
  wEm: number
  hEm: number
}

export type BoundsPad =
  | number
  | {
      padXEm?: number
      padYEm?: number
    }

/** Axis-aligned bounds of a stroke (points ± brush size). */
export function strokeBounds(stroke: InkStroke): InkBounds | null {
  if (!stroke.points.length || stroke.tool === 'eraser') return null
  const pad = Math.max(0.75, stroke.size * 0.18)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of stroke.points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  if (!Number.isFinite(minX)) return null
  return {
    x: minX - pad,
    y: minY - pad,
    w: Math.max(1, maxX - minX + pad * 2),
    h: Math.max(1, maxY - minY + pad * 2),
  }
}

function expand(a: InkBounds, b: InkBounds): InkBounds {
  const x0 = Math.min(a.x, b.x)
  const y0 = Math.min(a.y, b.y)
  const x1 = Math.max(a.x + a.w, b.x + b.w)
  const y1 = Math.max(a.y + a.h, b.y + b.h)
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

function gapBetween(a: InkBounds, b: InkBounds): number {
  const ax1 = a.x + a.w
  const ay1 = a.y + a.h
  const bx1 = b.x + b.w
  const by1 = b.y + b.h
  const dx = Math.max(0, Math.max(a.x - bx1, b.x - ax1))
  const dy = Math.max(0, Math.max(a.y - by1, b.y - ay1))
  return Math.hypot(dx, dy)
}

function area(b: InkBounds): number {
  return Math.max(0, b.w) * Math.max(0, b.h)
}

function shouldMerge(
  a: InkBounds,
  b: InkBounds,
  gapPx: number,
  maxUnionAreaRatio: number,
): boolean {
  const gap = gapBetween(a, b)
  if (gap > gapPx) return false
  if (gap === 0) return true
  const union = expand(a, b)
  const sum = area(a) + area(b)
  if (sum <= 0) return true
  if (area(union) > sum * maxUnionAreaRatio) return false
  return true
}

/**
 * Horizontal X-extent of a stroke inside [y0, y1] (doc px).
 * Samples points in-band and segment crossings so diagonals don't claim
 * empty AABB width on every line.
 */
export function strokeBandXExtent(
  stroke: InkStroke,
  y0: number,
  y1: number,
): { x0: number; x1: number } | null {
  if (!stroke.points.length || stroke.tool === 'eraser') return null
  const pad = Math.max(0.75, stroke.size * 0.18)
  let minX = Infinity
  let maxX = -Infinity
  let hit = false

  const addX = (x: number) => {
    hit = true
    if (x < minX) minX = x
    if (x > maxX) maxX = x
  }

  const pts = stroke.points
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    if (p.y >= y0 && p.y <= y1) addX(p.x)

    const q = pts[i + 1]
    if (!q) continue
    // Segment crosses the band — include interpolated X at band edges.
    const crosses =
      (p.y < y0 && q.y > y0) ||
      (p.y > y1 && q.y < y1) ||
      (p.y < y1 && q.y > y1) ||
      (p.y > y0 && q.y < y0) ||
      (p.y < y0 && q.y > y1) ||
      (p.y > y1 && q.y < y0)
    if (!crosses && !(Math.min(p.y, q.y) <= y1 && Math.max(p.y, q.y) >= y0)) continue

    const dy = q.y - p.y
    if (Math.abs(dy) < 1e-6) {
      if (p.y >= y0 && p.y <= y1) {
        addX(p.x)
        addX(q.x)
      }
      continue
    }
    for (const yEdge of [y0, y1]) {
      const t = (yEdge - p.y) / dy
      if (t >= 0 && t <= 1) addX(p.x + t * (q.x - p.x))
    }
    if (p.y >= y0 && p.y <= y1) addX(p.x)
    if (q.y >= y0 && q.y <= y1) addX(q.x)
  }

  if (!hit || !Number.isFinite(minX)) return null
  return { x0: minX - pad, x1: maxX + pad }
}

/**
 * Slice a stroke into per-line-band boxes (doc px). Short strokes stay one box.
 */
export function sliceStrokeIntoBands(
  stroke: InkStroke,
  bandHeightPx: number,
): InkBounds[] {
  const full = strokeBounds(stroke)
  if (!full) return []
  if (bandHeightPx <= 0 || full.h <= bandHeightPx * 1.35) return [full]

  const out: InkBounds[] = []
  const yStart = full.y
  const yEnd = full.y + full.h
  for (let y0 = yStart; y0 < yEnd - 0.5; y0 += bandHeightPx) {
    const y1 = Math.min(yEnd, y0 + bandHeightPx)
    const ext = strokeBandXExtent(stroke, y0, y1)
    if (!ext || ext.x1 <= ext.x0) continue
    out.push({
      x: ext.x0,
      y: y0,
      w: Math.max(1, ext.x1 - ext.x0),
      h: Math.max(1, y1 - y0),
    })
  }
  return out.length > 0 ? out : [full]
}

/**
 * Union nearby stroke AABBs into clusters (pre-slice, for short marks).
 */
export function clusterStrokeBounds(
  doc: InkDocument,
  gapPx = 3,
  maxUnionAreaRatio = 2.35,
): InkBounds[] {
  const boxes: InkBounds[] = []
  for (const s of doc.strokes) {
    const b = strokeBounds(s)
    if (b) boxes.push(b)
  }
  if (boxes.length === 0) return []

  const used = new Array(boxes.length).fill(false)
  const clusters: InkBounds[] = []

  for (let i = 0; i < boxes.length; i++) {
    if (used[i]) continue
    let cluster = boxes[i]!
    used[i] = true
    let grew = true
    while (grew) {
      grew = false
      for (let j = 0; j < boxes.length; j++) {
        if (used[j]) continue
        const other = boxes[j]!
        if (shouldMerge(cluster, other, gapPx, maxUnionAreaRatio)) {
          cluster = expand(cluster, other)
          used[j] = true
          grew = true
        }
      }
    }
    clusters.push(cluster)
  }

  return clusters
}

/**
 * Cluster short strokes, then band-slice tall ones so wrap hugs ink per line.
 */
export function bandSlicedStrokeBounds(
  doc: InkDocument,
  gapPx: number,
  maxUnionAreaRatio: number,
  bandHeightPx: number,
): InkBounds[] {
  // Cluster only short / compact strokes; tall strokes are sliced per-band alone
  // so a diagonal slash does not become one full-height canyon.
  const short: InkBounds[] = []
  const tallSlices: InkBounds[] = []

  for (const s of doc.strokes) {
    const b = strokeBounds(s)
    if (!b) continue
    if (b.h <= bandHeightPx * 1.35) {
      short.push(b)
    } else {
      tallSlices.push(...sliceStrokeIntoBands(s, bandHeightPx))
    }
  }

  // Cluster the short boxes among themselves (reuse cluster logic via fake doc).
  const clusteredShort: InkBounds[] = []
  if (short.length > 0) {
    const used = new Array(short.length).fill(false)
    for (let i = 0; i < short.length; i++) {
      if (used[i]) continue
      let cluster = short[i]!
      used[i] = true
      let grew = true
      while (grew) {
        grew = false
        for (let j = 0; j < short.length; j++) {
          if (used[j]) continue
          const other = short[j]!
          if (shouldMerge(cluster, other, gapPx, maxUnionAreaRatio)) {
            cluster = expand(cluster, other)
            used[j] = true
            grew = true
          }
        }
      }
      clusteredShort.push(cluster)
    }
  }

  return [...clusteredShort, ...tallSlices]
}

function resolvePad(pad: BoundsPad | undefined): { padXEm: number; padYEm: number } {
  if (pad == null) return { padXEm: 0, padYEm: 0 }
  if (typeof pad === 'number') return { padXEm: pad, padYEm: pad * 0.65 }
  return {
    padXEm: pad.padXEm ?? 0,
    padYEm: pad.padYEm ?? (pad.padXEm ?? 0) * 0.65,
  }
}

/**
 * Convert a pixel box (canvas / CSS px) to em using uniform font-size scale.
 * Y pad is intentionally lighter than X so fewer line bands get punched.
 */
export function boundsToEm(box: InkBounds, fontSizePx: number, pad: BoundsPad = 0): ObstacleBox {
  const s = fontSizePx > 0 ? 1 / fontSizePx : 1 / 16
  const { padXEm, padYEm } = resolvePad(pad)
  return {
    xEm: box.x * s - padXEm,
    yEm: box.y * s - padYEm,
    wEm: Math.max(0.2, box.w * s + padXEm * 2),
    hEm: Math.max(0.2, box.h * s + padYEm * 2),
  }
}

/** True when two obstacle lists match within a small em quantum (thrash guard). */
export function obstaclesEqual(a: ObstacleBox[], b: ObstacleBox[], quantum = 0.05): boolean {
  if (a.length !== b.length) return false
  const q = (n: number) => Math.round(n / quantum)
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!
    const y = b[i]!
    if (
      q(x.xEm) !== q(y.xEm) ||
      q(x.yEm) !== q(y.yEm) ||
      q(x.wEm) !== q(y.wEm) ||
      q(x.hEm) !== q(y.hEm)
    ) {
      return false
    }
  }
  return true
}

/** All clusters from a doc as em obstacles. Tiny speck strokes are dropped. */
export function obstaclesFromInkDoc(
  doc: InkDocument,
  fontSizePx: number,
  opts?: {
    gapPx?: number
    padEm?: number
    padXEm?: number
    padYEm?: number
    minAreaEm2?: number
    maxUnionAreaRatio?: number
    /** Line-band height in em — tall strokes are sliced to this. */
    bandHeightEm?: number
  },
): ObstacleBox[] {
  const gapPx = opts?.gapPx ?? 3
  const pad: BoundsPad =
    opts?.padXEm != null || opts?.padYEm != null
      ? { padXEm: opts.padXEm ?? opts.padEm ?? 0.05, padYEm: opts.padYEm ?? 0.03 }
      : (opts?.padEm ?? 0.05)
  const minArea = opts?.minAreaEm2 ?? 0.45
  const maxUnion = opts?.maxUnionAreaRatio ?? 2.35
  const bandHeightEm = opts?.bandHeightEm ?? 1.95
  const bandHeightPx = Math.max(4, bandHeightEm * (fontSizePx > 0 ? fontSizePx : 16))

  return bandSlicedStrokeBounds(doc, gapPx, maxUnion, bandHeightPx)
    .map((b) => boundsToEm(b, fontSizePx, pad))
    .filter((o) => o.wEm * o.hEm >= minArea || (o.wEm >= 0.9 && o.hEm >= 0.55))
}
