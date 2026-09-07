/**
 * Pretext — measured line-box IR for SketchInk.
 *
 * Lays out an InlineDoc (text + inline ink) into a list of measured LineBoxes.
 * Each LineBox knows its width, height, baseline shift, wobble, alignment, and
 * the slice of inline items it contains. The painter (Phase 4) turns this IR
 * into absolutely-positioned spans inside per-line wrappers so we keep native
 * Range selection while gaining per-line geometry.
 *
 * Measurement is injected (canvas-based on the client, stubbed on the server)
 * so this module is SSR-safe and deterministic per (text, font, size) key.
 */

import type { InlineItem } from '@/lib/studio/notebook-blocks'
import type { ObstacleBox } from '@/lib/ink'
import { INLINE_INK, LINE, FONT_OPTICAL_SCALE, type LineAlign, type SketchAction } from './config'
import { ACTION_PRESETS } from './config'
import { createRng, hashSeed } from './seed'
import { usefulFreeSegments, slotsForBand, clampSegment, bandSkipTopEm, type Segment } from './segments'
import {
  canUseChenglouPretext,
  packTextAroundObstacles,
} from './pretextEngine'

export type { ObstacleBox }
export { freeSegments, usefulFreeSegments, slotsForBand, bandSkipTopEm } from './segments'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MeasuredGlyph {
  /** Width in em. */
  widthEm: number
  /** Ascent above baseline in em. */
  ascentEm: number
  /** Descent below baseline in em. */
  descentEm: number
}

export interface MeasuredAtom {
  /** Index into the source InlineItem[] this atom came from. */
  itemIndex: number
  /** Character offset within the parent text item (text atoms only). */
  charStart: number
  charEnd: number
  kind: 'word' | 'space' | 'newline' | 'ink'
  text?: string
  /** For ink atoms: the inline ink item. */
  ink?: Extract<InlineItem, { kind: 'ink' }>
  measured: MeasuredGlyph
  /** True if a line may break after this atom (spaces, newlines). */
  breakable: boolean
  /** True if this atom collapses to zero width at a line edge. */
  trimmable: boolean
}

export interface LineItem {
  /** Atom index into the laid-out atom list. */
  atomIndex: number
  /** Horizontal offset from the line's left edge, in em. */
  xEm: number
  measured: MeasuredGlyph
  kind: 'word' | 'space' | 'ink'
  text?: string
  ink?: Extract<InlineItem, { kind: 'ink' }>
  /** Extra horizontal stretch (em) applied by justify alignment. */
  stretchEm?: number
  /**
   * Extra paint scale so fit-to-slot compression matches IR widths
   * (Cheng Lou path). Default 1.
   */
  paintScale?: number
}

export interface LineBox {
  index: number
  items: LineItem[]
  /** Used width (sum of item widths + gaps), in em. */
  usedWidthEm: number
  /** Container width we laid out against, in em. */
  containerWidthEm: number
  /** Line height for this line, in em (includes height wobble). */
  heightEm: number
  /** Baseline shift applied to the whole line, in em. */
  baselineShiftEm: number
  /** Per-line rotation in degrees (line wobble). */
  rotateDeg: number
  align: LineAlign
  /** True if this is the last line of the block (no justify stretch). */
  isLast: boolean
  /** Atom index range [start, end) into the atom list. */
  startAtom: number
  endAtom: number
  /** Vertical offset of this line's top from the block top, in em. */
  topEm: number
}

/** Flow arrow between two lines (sketchnote flow). */
export interface FlowArrow {
  fromLine: number
  toLine: number
  /** Which side of the line box the arrow attaches to. */
  side?: 'left' | 'right' | 'center'
}

/** Computed arrow geometry in em, relative to the block top-left. */
export interface PaintedFlowArrow {
  fromLine: number
  toLine: number
  side: 'left' | 'right' | 'center'
  /** Start point (em). */
  x1: number
  y1: number
  /** End point (em). */
  x2: number
  y2: number
}

export interface PretextLayout {
  lines: LineBox[]
  atoms: MeasuredAtom[]
  containerWidthEm: number
  /** Total block height in em. */
  totalHeightEm: number
  /** Computed flow arrows (em coordinates). */
  arrows: PaintedFlowArrow[]
}

/* -------------------------------------------------------------------------- */
/* Measurement cache                                                          */
/* -------------------------------------------------------------------------- */

export type MeasureFn = (text: string, font: string, sizeEm: number) => MeasuredGlyph

export interface MeasurementCache {
  measure: MeasureFn
  /** Opaque store keyed by `text|font|size`. */
  store: Map<string, MeasuredGlyph>
}

const NOOP_GLYPH: MeasuredGlyph = { widthEm: 0, ascentEm: 0.7, descentEm: 0.2 }

/** SSR-safe stub: estimates width as 0.55em per grapheme, ascent/descent fixed. */
export function stubMeasure(text: string, _font: string, _sizeEm: number): MeasuredGlyph {
  if (!text) return { ...NOOP_GLYPH, widthEm: 0 }
  const widthEm = text.length * 0.55
  return { widthEm, ascentEm: 0.72, descentEm: 0.22 }
}

export function createMeasurementCache(measure: MeasureFn = stubMeasure): MeasurementCache {
  return { measure, store: new Map() }
}

function cachedMeasure(cache: MeasurementCache, text: string, font: string, sizeEm: number): MeasuredGlyph {
  const key = `${text}|${font}|${sizeEm.toFixed(3)}`
  const hit = cache.store.get(key)
  if (hit) return hit
  const g = cache.measure(text, font, sizeEm) ?? stubMeasure(text, font, sizeEm)
  cache.store.set(key, g)
  return g
}

/** Paint-time face + advance knobs so pack widths match drawn glyphs. */
export interface WordPaintMetrics {
  font: string
  /** Multiplier on glyph width (jitter.scale). Optical lives in MeasureFn. */
  scale: number
  letterSpacing: number
}

export type PaintMetricsAt = (
  itemIndex: number,
  charStart: number,
  text: string,
  kind: 'word' | 'space',
) => WordPaintMetrics | null | undefined

function graphemeGapCount(text: string): number {
  return Math.max(0, Array.from(text).length - 1)
}

/**
 * Width used for packing — same face / scale / tracking the painter will use.
 *
 * CSS `letter-spacing` is relative to the element's font-size (`optical * scale`
 * em of the parent). Canvas glyph width already includes optical. So tracking
 * contribution in parent-em is: letterSpacing * optical * scale * gaps.
 */
export function measureAdvance(
  cache: MeasurementCache,
  text: string,
  font: string,
  sizeEm: number,
  paint?: Pick<WordPaintMetrics, 'scale' | 'letterSpacing'> | null,
  opts?: { pad?: boolean },
): MeasuredGlyph {
  const g = cachedMeasure(cache, text || ' ', font, sizeEm)
  const scale = paint?.scale ?? 1
  const tracking = paint?.letterSpacing ?? 0
  const optical = FONT_OPTICAL_SCALE[font] ?? 1
  let widthEm = g.widthEm * scale
  if (text && !/^[ \t]+$/.test(text)) {
    widthEm += tracking * optical * scale * graphemeGapCount(text)
  }
  if (opts?.pad !== false && !paint && LINE.measurePad !== 1) {
    widthEm *= LINE.measurePad
  }
  return { ...g, widthEm }
}

/* -------------------------------------------------------------------------- */
/* Inline ink measurement                                                     */
/* -------------------------------------------------------------------------- */

/** Default aspect (w/h) used when the ink doc dimensions are unknown. */
const DEFAULT_INK_ASPECT = 1.4

function inkAspect(ink: Extract<InlineItem, { kind: 'ink' }>): number {
  const doc = ink.doc
  const w = doc?.size?.width
  const h = doc?.size?.height
  if (typeof w === 'number' && typeof h === 'number' && h > 0) {
    return w / h
  }
  return DEFAULT_INK_ASPECT
}

function clampInkSize(sizeEm: number): number {
  return Math.max(INLINE_INK.minSizeEm, Math.min(INLINE_INK.maxSizeEm, sizeEm))
}

/* -------------------------------------------------------------------------- */
/* Atomization — split InlineDoc into measurable atoms                       */
/* -------------------------------------------------------------------------- */

const SPACE_RE = /[ \t]+/g

/**
 * Flatten InlineItems into atoms. Text items are split into words and spaces
 * on whitespace; newlines inside text become newline atoms. Ink items become
 * single ink atoms.
 *
 * When `paintMetricsAt` is provided, each word is measured with the same face
 * / scale / tracking the painter will use (measure = paint).
 */
export function atomize(
  items: InlineItem[],
  cache: MeasurementCache,
  font: string,
  sizeEm: number,
  paintMetricsAt?: PaintMetricsAt,
): MeasuredAtom[] {
  const atoms: MeasuredAtom[] = []

  items.forEach((item, itemIndex) => {
    if (item.kind === 'ink') {
      const h = clampInkSize(item.sizeEm ?? INLINE_INK.defaultSizeEm)
      const w = h * inkAspect(item)
      atoms.push({
        itemIndex,
        charStart: 0,
        charEnd: 0,
        kind: 'ink',
        ink: item,
        measured: { widthEm: w + INLINE_INK.rightPadEm, ascentEm: h, descentEm: 0 },
        breakable: false,
        trimmable: false,
      })
      return
    }

    const text = item.text
    let i = 0
    while (i < text.length) {
      const ch = text[i] ?? ''

      if (ch === '\n') {
        atoms.push({
          itemIndex,
          charStart: i,
          charEnd: i + 1,
          kind: 'newline',
          text: '\n',
          measured: { widthEm: 0, ascentEm: 0, descentEm: 0 },
          breakable: true,
          trimmable: false,
        })
        i++
        continue
      }

      if (/[ \t]/.test(ch)) {
        let j = i
        let run = ''
        while (j < text.length && /[ \t]/.test(text[j] ?? '')) {
          run += text[j]
          j++
        }
        const paint = paintMetricsAt?.(itemIndex, i, run, 'space') ?? null
        const face = paint?.font ?? font
        const g = measureAdvance(cache, ' ', face, sizeEm, paint, { pad: false })
        atoms.push({
          itemIndex,
          charStart: i,
          charEnd: j,
          kind: 'space',
          text: run,
          measured: { ...g, widthEm: g.widthEm * run.length },
          breakable: true,
          trimmable: true,
        })
        i = j
        continue
      }

      let j = i
      let word = ''
      while (j < text.length) {
        const c = text[j] ?? ''
        if (c === '\n' || /[ \t]/.test(c)) break
        word += c
        j++
      }
      const paint = paintMetricsAt?.(itemIndex, i, word, 'word') ?? null
      const face = paint?.font ?? font
      const g = measureAdvance(cache, word, face, sizeEm, paint, {
        pad: !paint,
      })
      atoms.push({
        itemIndex,
        charStart: i,
        charEnd: j,
        kind: 'word',
        text: word,
        measured: g,
        breakable: false,
        trimmable: false,
      })
      i = j
    }
  })

  return atoms
}

/* -------------------------------------------------------------------------- */
/* Greedy line breaking                                                        */
/* -------------------------------------------------------------------------- */

interface LineBuf {
  atoms: MeasuredAtom[]
  widthEm: number
  /** Index of the last breakable atom (for backtracking). */
  lastBreak: number
  /** Width up to and including the last breakable atom. */
  widthAtLastBreak: number
}

function pushAtomToLine(line: LineBuf, atom: MeasuredAtom): void {
  line.atoms.push(atom)
  line.widthEm += atom.measured.widthEm
  if (atom.breakable && atom.kind !== 'newline') {
    line.lastBreak = line.atoms.length - 1
    line.widthAtLastBreak = line.widthEm
  }
}

/**
 * Greedy first-fit line breaking with backtracking. Words/ink are atomic;
 * spaces are breakable; newlines force a break.
 */
export function breakLines(
  atoms: MeasuredAtom[],
  containerWidthEm: number,
): MeasuredAtom[][] {
  const lines: MeasuredAtom[][] = []
  let line: LineBuf = { atoms: [], widthEm: 0, lastBreak: -1, widthAtLastBreak: 0 }

  const flush = () => {
    lines.push(line.atoms)
    line = { atoms: [], widthEm: 0, lastBreak: -1, widthAtLastBreak: 0 }
  }

  for (let k = 0; k < atoms.length; k++) {
    const atom = atoms[k] ?? null
    if (!atom) continue

    if (atom.kind === 'newline') {
      // Trim trailing trimmable space on the line being closed.
      while (line.atoms.length && line.atoms[line.atoms.length - 1]?.trimmable) {
        const dropped = line.atoms.pop()!
        line.widthEm -= dropped.measured.widthEm
      }
      flush()
      continue
    }

    const wouldWidth = line.widthEm + atom.measured.widthEm
    const fits = wouldWidth <= containerWidthEm * (1 + LINE.breakSlack)

    if (fits || line.atoms.length === 0) {
      pushAtomToLine(line, atom)
      continue
    }

    // Doesn't fit and line is non-empty: try to break at last breakable atom.
    if (line.lastBreak >= 0) {
      const kept = line.atoms.slice(0, line.lastBreak + 1)
      const overflow = line.atoms.slice(line.lastBreak + 1)
      // Trim trailing trimmable from kept.
      while (kept.length && kept[kept.length - 1]?.trimmable) kept.pop()
      lines.push(kept)
      // Restart next line with overflow + current atom.
      const carry: MeasuredAtom[] = []
      let carryWidth = 0
      for (const a of overflow) {
        if (a.trimmable && carryWidth === 0) continue // drop leading space
        carry.push(a)
        carryWidth += a.measured.widthEm
      }
      line = {
        atoms: carry,
        widthEm: carryWidth,
        lastBreak: -1,
        widthAtLastBreak: 0,
      }
      pushAtomToLine(line, atom)
    } else {
      // No break point — flush the whole line as-is (overflow tolerated).
      flush()
      line.atoms.push(atom)
      line.widthEm += atom.measured.widthEm
      if (atom.breakable) {
        line.lastBreak = 0
        line.widthAtLastBreak = line.widthEm
      }
    }
  }

  if (line.atoms.length) {
    while (line.atoms.length && line.atoms[line.atoms.length - 1]?.trimmable) {
      const dropped = line.atoms.pop()!
      line.widthEm -= dropped.measured.widthEm
    }
    flush()
  }

  return lines
}

/* -------------------------------------------------------------------------- */
/* Per-line geometry: alignment, wobble, baseline drift                       */
/* -------------------------------------------------------------------------- */

function resolveAlign(blockAlign: LineAlign | undefined, action: SketchAction): LineAlign {
  if (blockAlign) return blockAlign
  return ACTION_PRESETS[action].align
}

function lineLeftInset(align: LineAlign, usedWidthEm: number, containerWidthEm: number): number {
  const slack = Math.max(0, containerWidthEm - usedWidthEm)
  switch (align) {
    case 'center':
      return slack / 2
    case 'right':
      return slack
    default:
      return 0
  }
}

/** Shift packed items inside a single corridor for center/right align. */
function applyCorridorAlign(
  items: LineItem[],
  align: LineAlign,
  seg: { start: number; end: number },
  usedWidthEm: number,
): void {
  if (align !== 'center' && align !== 'right') return
  const inset = lineLeftInset(align, usedWidthEm, seg.end - seg.start)
  if (inset <= 0) return
  for (const it of items) it.xEm += inset
}

function lineTouchesObstacle(
  topEm: number,
  heightEm: number,
  obstacles: ObstacleBox[],
): boolean {
  const bot = topEm + heightEm
  return obstacles.some((o) => o.yEm < bot && o.yEm + o.hEm > topEm)
}

const ZERO_GLYPH = { widthEm: 0, ascentEm: 0.8, descentEm: 0.2 } as const

/** Zero-width caret target so empty / trimmed offsets still hit a run. */
function caretAnchor(atomIndex: number, xEm: number): LineItem {
  return {
    atomIndex,
    xEm,
    measured: { ...ZERO_GLYPH },
    kind: 'space',
    text: '\u200b',
  }
}

/** Count breakable spaces between the first and last non-trimmable atom. */
function countJustifyGaps(lineAtoms: MeasuredAtom[]): number {
  let gaps = 0
  let started = false
  for (const a of lineAtoms) {
    if (a.kind === 'space') {
      if (started) gaps++
    } else if (a.kind === 'word' || a.kind === 'ink') {
      started = true
    }
  }
  return gaps
}

function buildLineItems(
  lineAtoms: MeasuredAtom[],
  align: LineAlign,
  usedWidthEm: number,
  containerWidthEm: number,
  isLast: boolean,
): LineItem[] {
  const items: LineItem[] = []
  const leftInset = lineLeftInset(align, usedWidthEm, containerWidthEm)
  let x = leftInset

  const gaps = !isLast && align === 'justify' ? countJustifyGaps(lineAtoms) : 0
  const extra = !isLast && align === 'justify' ? Math.max(0, containerWidthEm - usedWidthEm) : 0
  const rawPerGap = gaps > 0 ? extra / gaps : 0
  const perGap = Math.min(rawPerGap, LINE.maxJustifyGapEm)

  let seenFirst = false
  for (const a of lineAtoms) {
    if (a.trimmable && !seenFirst) continue
    if (a.kind === 'newline') continue
    seenFirst = true

    const stretch = a.kind === 'space' && gaps > 0 ? perGap : 0
    items.push({
      atomIndex: 0, // patched by caller
      xEm: x,
      measured: a.measured,
      kind: a.kind === 'space' ? 'space' : a.kind === 'ink' ? 'ink' : 'word',
      text: a.text,
      ink: a.ink,
      stretchEm: stretch,
    })
    x += a.measured.widthEm + stretch
  }

  return items
}

/* -------------------------------------------------------------------------- */
/* Obstacle segments — see segments.ts                                        */
/* -------------------------------------------------------------------------- */

interface PackedLine {
  atoms: MeasuredAtom[]
  items: LineItem[]
  usedWidthEm: number
  heightEm: number
  topEm: number
  startAtom: number
  endAtom: number
}

/**
 * Pack atoms into normal-height lines that carve around obstacles.
 * Narrow opposite stubs are dropped (usefulFreeSegments) so text wraps
 * below instead of jumping across a huge mid-line gap.
 */
export function packLinesWithObstacles(
  atoms: MeasuredAtom[],
  containerWidthEm: number,
  obstacles: ObstacleBox[],
  align: LineAlign = 'left',
): PackedLine[] {
  const lines: PackedLine[] = []
  let topEm = 0
  let i = 0
  const edgeEps = 0.02
  let guard = 0
  const guardMax = Math.max(128, atoms.length * 12 + obstacles.length * 8)
  /** Sticky corridor origin (seg.start), not glyph xEm. */
  let preferStartEm: number | null = null

  while (i < atoms.length && guard++ < guardMax) {
    if (atoms[i]?.kind === 'newline') {
      const x = preferStartEm ?? 0
      lines.push({
        atoms: [],
        items: [caretAnchor(i, x)],
        usedWidthEm: 0,
        heightEm: LINE.height,
        topEm,
        startAtom: i,
        endAtom: i + 1,
      })
      topEm += LINE.height
      i++
      // Keep sticky across hard breaks so the next paragraph holds the margin.
      continue
    }

    const heightEm = LINE.height
    const rawSegs = usefulFreeSegments(containerWidthEm, topEm, heightEm, obstacles)
    const segs: Segment[] = slotsForBand(rawSegs, preferStartEm)
      .map((s) => clampSegment(s, containerWidthEm))
      .filter((s): s is NonNullable<typeof s> => s != null)

    if (segs.length === 0) {
      topEm = bandSkipTopEm(topEm, heightEm, containerWidthEm, obstacles)
      continue
    }

    const lineAtoms: MeasuredAtom[] = []
    const items: LineItem[] = []
    let segIdx = 0
    let x = segs[0]!.start
    const startAtom = i
    let used = 0

    while (i < atoms.length) {
      const atom = atoms[i]!
      if (atom.kind === 'newline') break

      if (atom.trimmable && lineAtoms.length === 0) {
        // Keep a caret target for trimmed leading spaces.
        items.push(caretAnchor(i, segs[segIdx]!.start))
        i++
        continue
      }

      const w = atom.measured.widthEm

      let placed = false
      for (let s = segIdx; s < segs.length; s++) {
        const seg = segs[s]!
        const at = s === segIdx ? x : seg.start
        if (at + w <= seg.end + edgeEps) {
          if (s !== segIdx) {
            segIdx = s
            x = seg.start
          }
          if (atom.trimmable && Math.abs(x - segs[segIdx]!.start) < 0.01) {
            items.push(caretAnchor(i, segs[segIdx]!.start))
            i++
            placed = true
            break
          }
          // Clamp so paint never starts past the page edge.
          const xClamped = Math.min(x, containerWidthEm - Math.min(w, containerWidthEm))
          lineAtoms.push(atom)
          items.push({
            atomIndex: i,
            xEm: Math.max(0, xClamped),
            measured: atom.measured,
            kind: atom.kind === 'space' ? 'space' : atom.kind === 'ink' ? 'ink' : 'word',
            text: atom.text,
            ink: atom.ink,
          })
          x += w
          used += w
          i++
          placed = true
          break
        }
      }

      if (!placed) break
    }

    while (lineAtoms.length && lineAtoms[lineAtoms.length - 1]?.trimmable) {
      const dropped = lineAtoms.pop()!
      items.pop()
      used -= dropped.measured.widthEm
    }

    const endAtom = i
    if (atoms[i]?.kind === 'newline') i++

    if (lineAtoms.length === 0 && endAtom === startAtom) {
      const nextTop = topEm + heightEm
      const segsNext = slotsForBand(
        usefulFreeSegments(containerWidthEm, nextTop, heightEm, obstacles),
        preferStartEm,
      )
      const word = atoms[i]
      const w = word?.measured.widthEm ?? 0
      const canFitLater = segsNext.some((s) => s.end - s.start >= w - edgeEps)
      if (!canFitLater && word && w > containerWidthEm) {
        i++
      }
      topEm = nextTop
      continue
    }

    // Single corridor: honor center/right inside the stub (dual stays LTR-in-slot).
    if (segs.length === 1) {
      applyCorridorAlign(items, align, segs[0]!, used)
    }

    lines.push({
      atoms: lineAtoms,
      items,
      usedWidthEm: used,
      heightEm,
      topEm,
      startAtom,
      endAtom,
    })
    // Stick to corridor origin (seg.start), not glyph xEm after align inset.
    preferStartEm = segs[0]?.start ?? preferStartEm
    topEm += heightEm
  }

  return lines
}

/**
 * Split words wider than `maxEm` into measured chunks so URLs / long tokens wrap.
 */
export function softBreakLongAtoms(
  atoms: MeasuredAtom[],
  maxEm: number,
  cache: MeasurementCache,
  font: string,
  sizeEm: number,
  paintMetricsAt?: PaintMetricsAt,
): MeasuredAtom[] {
  if (maxEm <= 0.5) return atoms
  const out: MeasuredAtom[] = []
  for (const atom of atoms) {
    if (atom.kind !== 'word' || !atom.text || atom.measured.widthEm <= maxEm) {
      out.push(atom)
      continue
    }
    const text = atom.text
    const paint = paintMetricsAt?.(atom.itemIndex, atom.charStart, text, 'word') ?? null
    const face = paint?.font ?? font
    let start = 0
    while (start < text.length) {
      let end = start + 1
      let lastFit = end
      while (end <= text.length) {
        const slice = text.slice(start, end)
        // Resolve paint at slice offset so soft-breaks stay measure=paint.
        const slicePaint =
          paintMetricsAt?.(atom.itemIndex, atom.charStart + start, slice, 'word') ?? paint
        const sliceFace = slicePaint?.font ?? face
        const g = measureAdvance(cache, slice, sliceFace, sizeEm, slicePaint, {
          pad: !slicePaint,
        })
        if (g.widthEm > maxEm && end > start + 1) break
        lastFit = end
        end++
      }
      const slice = text.slice(start, lastFit)
      const slicePaint =
        paintMetricsAt?.(atom.itemIndex, atom.charStart + start, slice, 'word') ?? paint
      const sliceFace = slicePaint?.font ?? face
      const g = measureAdvance(cache, slice, sliceFace, sizeEm, slicePaint, {
        pad: !slicePaint,
      })
      out.push({
        ...atom,
        charStart: atom.charStart + start,
        charEnd: atom.charStart + lastFit,
        text: slice,
        measured: g,
        breakable: false,
        trimmable: false,
      })
      start = lastFit
    }
  }
  return out
}

function perLineWobble(
  lineIndex: number,
  totalLines: number,
  seedKey: string,
  fatigue: number,
  mul: { wobbleMul?: number; driftMul?: number; heightMul?: number } | undefined,
): { rotateDeg: number; baselineShiftEm: number; heightEm: number } {
  const wMul = mul?.wobbleMul ?? 1
  const dMul = mul?.driftMul ?? 1
  const hMul = mul?.heightMul ?? 1
  const rng = createRng(hashSeed(`pretext:line:${seedKey}:${lineIndex}:${totalLines}`))
  const rot = (rng() * 2 - 1) * LINE.lineWobbleCap * (0.4 + fatigue) * wMul
  const drift = (rng() * 2 - 1) * LINE.baselineDriftCap * fatigue * dMul
  const heightWobble = (rng() * 2 - 1) * LINE.heightWobbleCap * fatigue * hMul
  return {
    rotateDeg: rot,
    baselineShiftEm: drift,
    heightEm: LINE.height + heightWobble,
  }
}

/** Compute arrow geometry (em) from line midpoints. */
function paintFlowArrows(
  lines: LineBox[],
  flow: FlowArrow[] | undefined,
): PaintedFlowArrow[] {
  if (!flow || flow.length === 0) return []
  const out: PaintedFlowArrow[] = []
  for (const a of flow) {
    const from = lines[a.fromLine]
    const to = lines[a.toLine]
    if (!from || !to) continue
    const side = a.side ?? 'left'
    const x = side === 'left' ? 0 : side === 'right' ? from.containerWidthEm : from.containerWidthEm / 2
    out.push({
      fromLine: a.fromLine,
      toLine: a.toLine,
      side,
      x1: x,
      y1: from.topEm + from.heightEm,
      x2: x,
      y2: to.topEm,
    })
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* layoutPretext — the main entry point                                       */
/* -------------------------------------------------------------------------- */

export interface LayoutPretextOptions {
  /** Available width in em (e.g. containerPx / fontSizePx). */
  containerWidthEm: number
  /**
   * Soft max measure (em). Defaults to LINE.pageWidthEm; fit/spread pass a
   * wider cap so sheets can fill the viewport.
   */
  pageWidthCapEm?: number
  /** Font face used for measurement (should match the script/print home). */
  font: string
  /** Root font-size in CSS px — converts em ↔ Pretext's px widths. */
  fontSizePx?: number
  /** Base font size in em (usually 1). */
  sizeEm?: number
  /** Block-level alignment override. */
  align?: LineAlign
  /** Per-line alignment overrides (by line index); falls back to `align`. */
  lineAligns?: LineAlign[]
  /** Sketchnote action — picks default alignment + fatigue curve. */
  action?: SketchAction
  /** Prefix-stable seed (same one used by layoutSketchInk). */
  seedKey?: string
  /** Fatigue 0..1 — scales wobble + baseline drift. Defaults to a gentle curve. */
  fatigue?: number
  /** Per-line behavior multipliers (by line index). Falls back to 1. */
  lineBehavior?: Array<{ wobbleMul?: number; driftMul?: number; heightMul?: number }>
  /** Flow arrows between lines. */
  flow?: FlowArrow[]
  /** Sketch obstacle boxes (em) — text wraps around these. */
  obstacles?: ObstacleBox[]
  /** Measurement cache (reused across renders). */
  cache?: MeasurementCache
  /** Measure fn (creates a fresh cache if cache omitted). */
  measure?: MeasureFn
  /**
   * Resolve paint face + advance for each word/space so pack widths match
   * SketchInkSurface paint (measure = paint).
   */
  paintMetricsAt?: PaintMetricsAt
}

function pinAlign(a: LineAlign): LineAlign {
  // Justify + absolute word spans / inline-block blows gaps — always left.
  return a === 'justify' ? 'left' : a
}

/** Split a packed slot string into word/space LineItems for SketchInk paint.
 * Words are scaled to stay inside [x0, x0 + slotWidthEm]; paintScale is set so
 * the painter shrinks glyphs to match the compressed IR widths.
 */
function itemsFromSlotText(
  slotText: string,
  charBase: number,
  x0: number,
  slotWidthEm: number,
  atomBase: number,
  itemIndex: number,
  cache: MeasurementCache,
  font: string,
  sizeEm: number,
  containerWidthEm: number,
  paintMetricsAt?: PaintMetricsAt,
): { items: LineItem[]; atoms: MeasuredAtom[]; nextAtom: number } {
  type Piece = {
    kind: 'word' | 'space'
    text: string
    charStart: number
    charEnd: number
    naturalW: number
  }
  const pieces: Piece[] = []
  let i = 0
  while (i < slotText.length) {
    const ch = slotText[i] ?? ''
    if (/[ \t]/.test(ch)) {
      let j = i
      let run = ''
      while (j < slotText.length && /[ \t]/.test(slotText[j] ?? '')) {
        run += slotText[j]
        j++
      }
      const paint = paintMetricsAt?.(itemIndex, charBase + i, run, 'space') ?? null
      const face = paint?.font ?? font
      const g = measureAdvance(cache, ' ', face, sizeEm, paint, { pad: false })
      pieces.push({
        kind: 'space',
        text: run,
        charStart: charBase + i,
        charEnd: charBase + j,
        naturalW: g.widthEm * run.length,
      })
      i = j
      continue
    }
    let j = i
    let word = ''
    while (j < slotText.length) {
      const c = slotText[j] ?? ''
      if (c === '\n' || /[ \t]/.test(c)) break
      word += c
      j++
    }
    const paint = paintMetricsAt?.(itemIndex, charBase + i, word, 'word') ?? null
    const face = paint?.font ?? font
    const g = measureAdvance(cache, word, face, sizeEm, paint, { pad: !paint })
    pieces.push({
      kind: 'word',
      text: word,
      charStart: charBase + i,
      charEnd: charBase + j,
      naturalW: g.widthEm,
    })
    i = j
  }

  const naturalTotal = pieces.reduce((s, p) => s + p.naturalW, 0)
  const maxW = Math.max(0.1, Math.min(slotWidthEm, containerWidthEm - x0))
  const fitScale = naturalTotal > maxW && naturalTotal > 0 ? maxW / naturalTotal : 1

  const items: LineItem[] = []
  const atoms: MeasuredAtom[] = []
  let x = x0
  let atomIdx = atomBase
  for (const p of pieces) {
    const w = p.naturalW * fitScale
    const measured = {
      widthEm: w,
      ascentEm: 0.72,
      descentEm: 0.22,
    }
    atoms.push({
      itemIndex,
      charStart: p.charStart,
      charEnd: p.charEnd,
      kind: p.kind,
      text: p.text,
      measured,
      breakable: p.kind === 'space',
      trimmable: p.kind === 'space',
    })
    items.push({
      atomIndex: atomIdx,
      xEm: Math.max(0, Math.min(x, containerWidthEm - 0.05)),
      measured,
      kind: p.kind,
      text: p.text,
      paintScale: fitScale !== 1 ? fitScale : undefined,
    })
    x += w
    atomIdx++
  }

  return { items, atoms, nextAtom: atomIdx }
}

function layoutObstaclesWithChenglou(
  text: string,
  itemIndex: number,
  opts: LayoutPretextOptions,
  cache: MeasurementCache,
  containerWidthEm: number,
  align: LineAlign,
  seedKey: string,
  fatigue: number,
): PretextLayout {
  const sizeEm = opts.sizeEm ?? 1
  const clampedObstacles = (opts.obstacles ?? []).map((o) => {
    const x0 = Math.max(0, o.xEm)
    const x1 = Math.min(containerWidthEm, o.xEm + o.wEm)
    return {
      xEm: x0,
      yEm: o.yEm,
      wEm: Math.max(0.2, x1 - x0),
      hEm: o.hEm,
    }
  })
  const packed = packTextAroundObstacles(text, {
    containerWidthEm,
    fontSizePx: opts.fontSizePx ?? 16,
    font: opts.font,
    obstacles: clampedObstacles,
  })

  const atoms: MeasuredAtom[] = []
  const lines: LineBox[] = []
  let atomCursor = 0
  let totalHeight = 0

  packed.lines.forEach((pl, lineIndex) => {
    const lineItems: LineItem[] = []
    const startAtom = atomCursor
    for (const slot of pl.items) {
      const built = itemsFromSlotText(
        slot.text,
        slot.charStart,
        slot.xEm,
        slot.widthEm,
        atomCursor,
        itemIndex,
        cache,
        opts.font,
        sizeEm,
        packed.containerWidthEm,
        opts.paintMetricsAt,
      )
      atoms.push(...built.atoms)
      lineItems.push(...built.items)
      atomCursor = built.nextAtom
    }
    lines.push({
      index: lineIndex,
      items: lineItems,
      usedWidthEm: pl.usedWidthEm,
      containerWidthEm: packed.containerWidthEm,
      heightEm: LINE.height,
      baselineShiftEm: 0,
      rotateDeg: 0,
      align: pinAlign(opts.lineAligns?.[lineIndex] ?? align),
      isLast: lineIndex === packed.lines.length - 1,
      startAtom,
      endAtom: atomCursor,
      topEm: pl.topEm,
    })
    totalHeight = Math.max(totalHeight, pl.topEm + LINE.height)
  })

  return {
    lines,
    atoms,
    containerWidthEm: packed.containerWidthEm,
    totalHeightEm: totalHeight || LINE.height,
    arrows: paintFlowArrows(lines, opts.flow),
  }
}

export function layoutPretext(
  items: InlineItem[],
  opts: LayoutPretextOptions,
): PretextLayout {
  const cache = opts.cache ?? createMeasurementCache(opts.measure)
  const sizeEm = opts.sizeEm ?? 1
  const action = opts.action ?? 'type'
  const seedKey = opts.seedKey ?? ''
  const fatigue = opts.fatigue ?? 0.35
  // Justify blows word gaps on absolute spans — always pin left via pinAlign.
  // Center/right stay live for soft path + single-corridor obstacle insets.
  const resolved = pinAlign(resolveAlign(opts.align, action))
  const align: LineAlign = resolved
  const containerWidthEm = Math.min(
    opts.containerWidthEm,
    opts.pageWidthCapEm ?? LINE.pageWidthEm,
  )
  const obstacles = (opts.obstacles ?? []).map((o) => {
    const x0 = Math.max(0, o.xEm)
    const x1 = Math.min(containerWidthEm, o.xEm + o.wEm)
    return {
      xEm: x0,
      yEm: o.yEm,
      wEm: Math.max(0.2, x1 - x0),
      hEm: o.hEm,
    }
  })

  const textOnly =
    items.length > 0 && items.every((it) => it.kind === 'text')
  const flatText = textOnly
    ? items.map((it) => (it.kind === 'text' ? it.text : '')).join('')
    : ''

  // Cheng Lou uses a single home-font meter. When paintMetricsAt is present
  // (measure=paint), stay on the atom packer so one advance system owns wrap.
  if (
    obstacles.length > 0 &&
    textOnly &&
    !opts.paintMetricsAt &&
    canUseChenglouPretext()
  ) {
    try {
      return layoutObstaclesWithChenglou(
        flatText,
        0,
        { ...opts, obstacles },
        cache,
        containerWidthEm,
        align,
        seedKey,
        fatigue,
      )
    } catch {
      // Fall through to atom packer (SSR / missing canvas).
    }
  }

  let atoms = atomize(items, cache, opts.font, sizeEm, opts.paintMetricsAt)
  atoms = softBreakLongAtoms(
    atoms,
    containerWidthEm * 0.92,
    cache,
    opts.font,
    sizeEm,
    opts.paintMetricsAt,
  )

  const lines: LineBox[] = []
  let totalHeight = 0

  if (obstacles.length > 0) {
    const packed = packLinesWithObstacles(atoms, containerWidthEm, obstacles, align)
    packed.forEach((pl, lineIndex) => {
      const isLast = lineIndex === packed.length - 1
      const lineAlign = pinAlign(opts.lineAligns?.[lineIndex] ?? align)
      const touches = lineTouchesObstacle(pl.topEm, LINE.height, obstacles)
      const wobble = perLineWobble(
        lineIndex,
        packed.length,
        seedKey,
        fatigue,
        opts.lineBehavior?.[lineIndex],
      )
      // Soft wobble away from ink; rigid only on intersecting bands.
      lines.push({
        index: lineIndex,
        items: pl.items,
        usedWidthEm: pl.usedWidthEm,
        containerWidthEm,
        heightEm: LINE.height,
        baselineShiftEm: touches ? 0 : wobble.baselineShiftEm * LINE.softWobbleMul,
        rotateDeg: touches ? 0 : wobble.rotateDeg * LINE.softWobbleMul,
        align: lineAlign,
        isLast,
        startAtom: pl.startAtom,
        endAtom: pl.endAtom,
        topEm: pl.topEm,
      })
      totalHeight = Math.max(totalHeight, pl.topEm + LINE.height)
    })
  } else {
    const rawLines = breakLines(atoms, containerWidthEm)
    let atomCursor = 0
    let topEm = 0

    rawLines.forEach((lineAtoms, lineIndex) => {
      const used = lineAtoms.reduce((sum, a) => sum + a.measured.widthEm, 0)
      const isLast = lineIndex === rawLines.length - 1
      const wobble = perLineWobble(lineIndex, rawLines.length, seedKey, fatigue, opts.lineBehavior?.[lineIndex])
      const lineAlign = pinAlign(opts.lineAligns?.[lineIndex] ?? align)

      const lineItems = buildLineItems(lineAtoms, lineAlign, used, containerWidthEm, isLast)
      let consumed = 0
      for (let i = 0; i < lineItems.length; i++) {
        while (consumed < lineAtoms.length) {
          const a = lineAtoms[consumed]
          if (a.trimmable && i === 0) { consumed++; continue }
          if (a.kind === 'newline') { consumed++; continue }
          lineItems[i].atomIndex = atomCursor + consumed
          consumed++
          break
        }
      }
      const startAtom = atomCursor
      const endAtom = atomCursor + lineAtoms.length
      atomCursor = endAtom

      if (lineItems.length === 0) {
        lineItems.push(caretAnchor(startAtom, lineLeftInset(lineAlign, 0, containerWidthEm)))
      }

      // Fixed LINE.height (no cumulative height wobble). Soft rotate/drift only.
      lines.push({
        index: lineIndex,
        items: lineItems,
        usedWidthEm: used,
        containerWidthEm,
        heightEm: LINE.height,
        baselineShiftEm: wobble.baselineShiftEm * LINE.softWobbleMul,
        rotateDeg: wobble.rotateDeg * LINE.softWobbleMul,
        align: lineAlign,
        isLast,
        startAtom,
        endAtom,
        topEm,
      })
      topEm += LINE.height
      totalHeight += LINE.height
    })
  }

  const arrows = paintFlowArrows(lines, opts.flow)

  return {
    lines,
    atoms,
    containerWidthEm,
    totalHeightEm: totalHeight,
    arrows,
  }
}




