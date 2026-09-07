/**
 * Free horizontal segments after subtracting obstacle boxes from a line band.
 */

import type { ObstacleBox } from '@/lib/ink'
import { LINE } from './config'

export type Segment = { start: number; end: number }

function bandOverlapFrac(topEm: number, heightEm: number, o: ObstacleBox): number {
  const bandBottom = topEm + heightEm
  const oBottom = o.yEm + o.hEm
  const overlapTop = Math.max(topEm, o.yEm)
  const overlapBot = Math.min(bandBottom, oBottom)
  const overlapH = overlapBot - overlapTop
  if (overlapH <= 0 || heightEm <= 0) return 0
  return overlapH / heightEm
}

function segWidth(s: Segment): number {
  return s.end - s.start
}

function widestOf(segs: Segment[]): Segment {
  let best = segs[0]!
  for (let i = 1; i < segs.length; i++) {
    const s = segs[i]!
    if (segWidth(s) > segWidth(best) + 0.01) best = s
    else if (Math.abs(segWidth(s) - segWidth(best)) <= 0.01 && s.start < best.start) best = s
  }
  return best
}

/** Free horizontal segments on a line band after subtracting obstacles. */
export function freeSegments(
  containerWidthEm: number,
  topEm: number,
  heightEm: number,
  obstacles: ObstacleBox[],
): Segment[] {
  const bandBottom = topEm + heightEm
  const hug = LINE.obstacleHugEm
  const minHole = LINE.minHoleEm
  const holes: Array<{ x0: number; x1: number }> = []

  for (const o of obstacles) {
    const oBottom = o.yEm + o.hEm
    if (oBottom <= topEm || o.yEm >= bandBottom) continue
    if (bandOverlapFrac(topEm, heightEm, o) < LINE.minBandOverlapFrac) continue

    let x0 = o.xEm + hug
    let x1 = o.xEm + o.wEm - hug

    // Hug collapsed the hole — fall back to raw box, then enforce a min hole
    // so thin ink still displaces text instead of words running through.
    if (x1 - x0 < minHole) {
      x0 = o.xEm
      x1 = o.xEm + o.wEm
    }
    if (x1 - x0 < minHole) {
      const mid = (o.xEm + o.xEm + o.wEm) / 2
      x0 = mid - minHole / 2
      x1 = mid + minHole / 2
    }

    x0 = Math.max(0, x0)
    x1 = Math.min(containerWidthEm, x1)
    if (x1 > x0) holes.push({ x0, x1 })
  }

  if (holes.length === 0) return [{ start: 0, end: containerWidthEm }]

  holes.sort((a, b) => a.x0 - b.x0)
  const merged: Array<{ x0: number; x1: number }> = []
  for (const h of holes) {
    const last = merged[merged.length - 1]
    if (last && h.x0 <= last.x1) {
      last.x1 = Math.max(last.x1, h.x1)
    } else {
      merged.push({ ...h })
    }
  }

  const segs: Segment[] = []
  let cursor = 0
  for (const h of merged) {
    if (h.x0 > cursor) segs.push({ start: cursor, end: h.x0 })
    cursor = Math.max(cursor, h.x1)
  }
  if (cursor < containerWidthEm) segs.push({ start: cursor, end: containerWidthEm })
  return segs.filter((s) => s.end - s.start > 0.05)
}

export function minUsefulStubEm(containerWidthEm: number): number {
  return Math.max(LINE.minStubEm, containerWidthEm * LINE.minStubFrac)
}

export function minDualStubEm(containerWidthEm: number): number {
  return Math.max(LINE.minDualStubEm, containerWidthEm * LINE.minDualStubFrac)
}

/** Free segments wide enough for sketchnote text (drops skinny opposite stubs). */
export function usefulFreeSegments(
  containerWidthEm: number,
  topEm: number,
  heightEm: number,
  obstacles: ObstacleBox[],
): Segment[] {
  const free = freeSegments(containerWidthEm, topEm, heightEm, obstacles)
  const min = minUsefulStubEm(containerWidthEm)
  let useful = free.filter((s) => segWidth(s) >= min)

  if (useful.length === 0) {
    let widest: Segment | null = null
    for (const s of free) {
      if (!widest || segWidth(s) > segWidth(widest)) widest = s
    }
    if (widest && segWidth(widest) >= LINE.minStubFloorEm) useful = [widest]
  }

  // Dual-wrap gate: both stubs must be wide enough or we keep the widest only
  // (avoids orphan 1-word left stub + canyon).
  if (useful.length === 2 && LINE.maxWrapCorridors >= 2) {
    const dualMin = minDualStubEm(containerWidthEm)
    const a = useful[0]!
    const b = useful[1]!
    if (segWidth(a) < dualMin || segWidth(b) < dualMin) {
      return [widestOf(useful)]
    }
  }

  return useful
}

function snapUpToBandGrid(topEm: number, heightEm: number, targetEm: number): number {
  const delta = targetEm - topEm
  if (delta <= heightEm) return topEm + heightEm
  const n = Math.ceil(delta / heightEm - 1e-9)
  return topEm + Math.max(1, n) * heightEm
}

/**
 * Advance past a blocked line band.
 * Prefer the next on-grid band with a useful stub. If none appear while an
 * obstacle still overlaps, snap-jump past its bottom (avoids crawling voids).
 */
export function bandSkipTopEm(
  topEm: number,
  heightEm: number,
  containerWidthEm: number,
  obstacles: ObstacleBox[],
): number {
  const step = heightEm
  const lookAheadBands = 10

  for (let i = 1; i <= lookAheadBands; i++) {
    const t = topEm + step * i
    if (usefulFreeSegments(containerWidthEm, t, heightEm, obstacles).length > 0) {
      return t
    }
  }

  // No useful stub soon — jump past overlapping obstacles on the line grid.
  let skipTo = topEm + step
  for (const o of obstacles) {
    if (o.yEm >= topEm + heightEm || o.yEm + o.hEm <= topEm) continue
    const x0 = Math.max(0, o.xEm)
    const x1 = Math.min(containerWidthEm, o.xEm + o.wEm)
    const cover = Math.max(0, x1 - x0)
    // Jump when near-full width OR when this band has no useful stub at all
    // (side gutters too skinny to write in).
    if (cover >= containerWidthEm * LINE.fullBlockCoverFrac || cover > 0) {
      skipTo = Math.max(skipTo, snapUpToBandGrid(topEm, heightEm, o.yEm + o.hEm + 0.02))
    }
  }
  return skipTo
}

/** Prefer segment containing `preferStartEm`, else nearest start within stickyMatchEm. */
export function findStickySegment(
  segs: Segment[],
  preferStartEm: number,
): Segment | null {
  if (segs.length === 0) return null
  const hit = segs.find(
    (s) => preferStartEm >= s.start - 0.5 && preferStartEm < s.end + 0.5,
  )
  if (hit) return hit
  let best: Segment | null = null
  let bestDist = Infinity
  for (const s of segs) {
    const d = Math.abs(s.start - preferStartEm)
    if (d < bestDist && d <= LINE.stickyMatchEm) {
      best = s
      bestDist = d
    }
  }
  return best
}

/**
 * Choose which free slots to fill on one line band.
 *
 * - Exactly 2 useful stubs → dual LTR only when sticky owns the left (primary)
 *   margin; otherwise keep sticky alone so a new left stub can't thrash the edge.
 * - 3+ stubs → single widest, with sticky preference for prior corridor.
 */
export function slotsForBand(
  segs: Segment[],
  preferStartEm: number | null = null,
): Segment[] {
  if (segs.length <= 1) return segs

  const sorted = [...segs].sort((a, b) => a.start - b.start)

  if (segs.length === 2 && LINE.maxWrapCorridors >= 2) {
    if (preferStartEm == null) return sorted
    const sticky = findStickySegment(segs, preferStartEm)
    if (!sticky || segWidth(sticky) < LINE.minStubFloorEm) return sorted
    const left = sorted[0]!
    // Sticky is left corridor → dual wrap is safe (left margin stable).
    if (Math.abs(sticky.start - left.start) < 0.01) return sorted
    // Sticky is right: opening the left stub flips the page margin.
    // Keep sticky alone unless the left side is clearly dominant.
    if (segWidth(left) <= segWidth(sticky) * 1.4) return [sticky]
    return sorted
  }

  if (preferStartEm != null) {
    const sticky = findStickySegment(segs, preferStartEm)
    if (sticky && segWidth(sticky) >= LINE.minStubFloorEm) {
      const wide = widestOf(segs)
      // Keep sticky unless another corridor is clearly dominant.
      if (segWidth(wide) <= segWidth(sticky) * 1.4) return [sticky]
    }
  }

  return [widestOf(segs)]
}

/** Clamp a segment into the page column. */
export function clampSegment(seg: Segment, containerWidthEm: number): Segment | null {
  const start = Math.max(0, seg.start)
  const end = Math.min(containerWidthEm, seg.end)
  if (end - start < 0.05) return null
  return { start, end }
}
