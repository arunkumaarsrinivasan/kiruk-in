/**
 * Cheng Lou Pretext adapter — prepare once, layoutNextLine per free slot.
 *
 * Matches the Illuminated Dragon / umbrella pattern:
 *   prepareWithSegments → carve exclusions per line band → layoutNextLine into
 *   each useful stub → continuous cursor.
 *
 * Narrow stubs are dropped (minUsefulStubEm) so text wraps below sketches
 * instead of jumping across huge mid-line gaps.
 */

import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'
import type { ObstacleBox } from '@/lib/ink'
import { FONT_OPTICAL_SCALE, LINE } from './config'
import { usefulFreeSegments, slotsForBand, clampSegment, bandSkipTopEm, type Segment } from './segments'

export { minUsefulStubEm, usefulFreeSegments, freeSegments, slotsForBand, bandSkipTopEm } from './segments'

export function fontCssForPretext(fontFace: string, fontSizePx: number): string {
  const optical = FONT_OPTICAL_SCALE[fontFace] ?? 1
  const px = Math.max(1, fontSizePx * optical)
  // Features match paint / DOM meter (Kiruk calt must measure the same glyphs).
  return `${px}px "${fontFace}", cursive`
}

export function canUseChenglouPretext(): boolean {
  return typeof document !== 'undefined'
}

export interface EngineLineItem {
  text: string
  xEm: number
  widthEm: number
  /** Inclusive start / exclusive end in the source string. */
  charStart: number
  charEnd: number
}

export interface EnginePackedLine {
  topEm: number
  heightEm: number
  items: EngineLineItem[]
  usedWidthEm: number
}

export interface PackAroundObstaclesResult {
  lines: EnginePackedLine[]
  totalHeightEm: number
  containerWidthEm: number
}

const preparedCache = new Map<string, PreparedTextWithSegments>()

function getPrepared(text: string, fontCss: string): PreparedTextWithSegments {
  const key = `${fontCss}\n${text}`
  let hit = preparedCache.get(key)
  if (hit) return hit
  hit = prepareWithSegments(text, fontCss, { whiteSpace: 'pre-wrap' })
  if (preparedCache.size > 24) {
    const first = preparedCache.keys().next().value
    if (first != null) preparedCache.delete(first)
  }
  preparedCache.set(key, hit)
  return hit
}

function cursorToOffset(prepared: PreparedTextWithSegments, cursor: LayoutCursor): number {
  let off = 0
  const segs = prepared.segments
  for (let i = 0; i < cursor.segmentIndex && i < segs.length; i++) {
    off += segs[i]!.length
  }
  const seg = segs[cursor.segmentIndex]
  if (seg && cursor.graphemeIndex > 0) {
    const chars = Array.from(seg)
    off += chars.slice(0, cursor.graphemeIndex).join('').length
  }
  return off
}

/**
 * Pack plain text around obstacles using @chenglou/pretext layoutNextLine.
 * fontSizePx converts em slots ↔ px widths Pretext expects.
 */
export function packTextAroundObstacles(
  text: string,
  opts: {
    containerWidthEm: number
    pageWidthCapEm?: number
    fontSizePx: number
    font: string
    obstacles: ObstacleBox[]
  },
): PackAroundObstaclesResult {
  const containerWidthEm = Math.min(
    opts.containerWidthEm,
    opts.pageWidthCapEm ?? LINE.pageWidthEm,
  )
  const fontSizePx = opts.fontSizePx > 0 ? opts.fontSizePx : 16
  const obstacles = opts.obstacles
  const heightEm = LINE.height

  if (!text) {
    return { lines: [], totalHeightEm: heightEm, containerWidthEm }
  }

  const fontCss = fontCssForPretext(opts.font, fontSizePx)
  const prepared = getPrepared(text, fontCss)
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  const totalSegs = prepared.segments.length
  const optical = FONT_OPTICAL_SCALE[opts.font] ?? 1
  // Slot px must use the same optical scale as prepareWithSegments, or
  // corridors under/over-fill relative to the ink hole.
  const effectivePx = Math.max(1, fontSizePx * optical)

  const lines: EnginePackedLine[] = []
  let topEm = 0
  let guard = 0
  const guardMax = Math.max(64, Math.ceil(text.length / 2) + obstacles.length * 8 + 32)
  let preferStartEm: number | null = null

  while (guard++ < guardMax) {
    if (totalSegs === 0) break

    const peek = layoutNextLine(prepared, cursor, Number.MAX_SAFE_INTEGER)
    if (!peek) break

    const rawSegs = usefulFreeSegments(containerWidthEm, topEm, heightEm, obstacles)
    const segs: Segment[] = slotsForBand(rawSegs, preferStartEm)
      .map((s) => clampSegment(s, containerWidthEm))
      .filter((s): s is NonNullable<typeof s> => s != null)

    if (segs.length === 0) {
      topEm = bandSkipTopEm(topEm, heightEm, containerWidthEm, obstacles)
      continue
    }

    const items: EngineLineItem[] = []
    let used = 0
    let advanced = false

    for (const seg of segs) {
      const slotWEm = seg.end - seg.start
      const slotWPx = Math.max(1, slotWEm * effectivePx)
      const line = layoutNextLine(prepared, cursor, slotWPx)
      if (!line) break

      const charStart = cursorToOffset(prepared, line.start)
      const charEnd = cursorToOffset(prepared, line.end)
      // Never paint past the page / slot edge.
      const widthEm = Math.min(line.width / effectivePx, slotWEm)

      if (line.text.length > 0 && line.text !== '\n') {
        items.push({
          text: line.text.replace(/\n$/, ''),
          xEm: seg.start,
          widthEm,
          charStart,
          charEnd,
        })
        used += widthEm
      }

      cursor = line.end
      advanced = true

      // After a hard break, leave remaining stubs on this band empty.
      if (line.text.includes('\n')) break
    }

    if (!advanced) {
      topEm += heightEm
      continue
    }

    lines.push({
      topEm,
      heightEm,
      items,
      usedWidthEm: used,
    })
    preferStartEm = segs[0]?.start ?? preferStartEm
    topEm += heightEm
  }

  while (lines.length && lines[lines.length - 1]!.items.length === 0) {
    lines.pop()
  }

  const totalHeightEm =
    lines.length === 0
      ? heightEm
      : Math.max(...lines.map((l) => l.topEm + l.heightEm), heightEm)

  return { lines, totalHeightEm, containerWidthEm }
}
