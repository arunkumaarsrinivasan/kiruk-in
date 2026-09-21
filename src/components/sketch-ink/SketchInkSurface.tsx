'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  layoutPretext,
  stubMeasure,
  createMeasurementCache,
  type MeasurementCache,
  type MeasureFn,
  type MeasuredGlyph,
  type PretextLayout,
  type FlowArrow,
  type ObstacleBox,
} from '@/lib/sketch-ink/pretext'
import { layoutSketchInk, type SketchRun } from '@/lib/sketch-ink'
import { runStyle, dampRunJitter, paintDampForBand } from '@/lib/sketch-ink/jitter'
import { INLINE_INK, LINE, FONT_OPTICAL_SCALE, JITTER, type LineAlign, type SketchAction, type SketchMode } from '@/lib/sketch-ink/config'
import { handFontFamily } from '@/lib/sketch-ink/pools'
import { createRng, hashSeed } from '@/lib/sketch-ink/seed'
import { SketchMarginMarks } from './SketchChrome'
import type { InlineItem } from '@/lib/studio/notebook-blocks'

/* -------------------------------------------------------------------------- */
/* Measurement (client) — DOM meter matches paint calt/liga                   */
/* -------------------------------------------------------------------------- */

let canvasCtx: CanvasRenderingContext2D | null = null
function canvasMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (canvasCtx) return canvasCtx
  const c = document.createElement('canvas')
  canvasCtx = c.getContext('2d')
  return canvasCtx
}

let domMeter: HTMLSpanElement | null = null
function domMeasureEl(): HTMLSpanElement | null {
  if (typeof document === 'undefined') return null
  if (domMeter) return domMeter
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = [
    'position:absolute',
    'visibility:hidden',
    'white-space:pre',
    'top:-9999px',
    'left:0',
    'pointer-events:none',
    'font-feature-settings:"calt" 1, "liga" 1, "kern" 1, "dlig" 1, "rlig" 1',
    'font-variant-ligatures:common-ligatures contextual discretionary-ligatures',
  ].join(';')
  document.body.appendChild(el)
  domMeter = el
  return el
}

/**
 * Word measurement in em. Prefers a DOM meter with the same OpenType features
 * as painted runs (calt/liga) so Kiruk alternates don't blow width-lock.
 * Falls back to canvas, then stub on the server.
 */
export const canvasMeasure: MeasureFn = (text, font, sizeEm): MeasuredGlyph => {
  const optical = FONT_OPTICAL_SCALE[font] ?? 1
  const root = 16 * sizeEm
  const px = sizeEm * optical * 16
  const sample = text || ' '

  const el = domMeasureEl()
  if (el) {
    el.style.font = `${px}px "${font}", cursive`
    el.textContent = sample
    const widthEm = (el.getBoundingClientRect().width || 0) / root
    // Ascent/descent from canvas when available (DOM box is line-box tall).
    const ctx = canvasMeasureCtx()
    if (ctx) {
      ctx.font = `${px}px "${font}", cursive`
      const m = ctx.measureText(sample)
      return {
        widthEm,
        ascentEm: (m.actualBoundingBoxAscent || 0.72 * px) / root,
        descentEm: (m.actualBoundingBoxDescent || 0.22 * px) / root,
      }
    }
    return { widthEm, ascentEm: 0.72 * optical, descentEm: 0.22 * optical }
  }

  const ctx = canvasMeasureCtx()
  if (!ctx) return stubMeasure(text, font, sizeEm)
  ctx.font = `${px}px "${font}", cursive, sans-serif`
  const m = ctx.measureText(sample)
  return {
    widthEm: (m.width || 0) / root,
    ascentEm: (m.actualBoundingBoxAscent || 0.72 * px) / root,
    descentEm: (m.actualBoundingBoxDescent || 0.22 * px) / root,
  }
}

/* -------------------------------------------------------------------------- */
/* Pair pretext text atoms with SketchInk runs (per-word jitter/face)        */
/* -------------------------------------------------------------------------- */

/**
 * Pair layout atoms to SketchInk runs by source character offset.
 * Text-equality pairing fails after soft-breaks / Pretext slots and left
 * every word on SCRIPT_HOME — looking like one flat font.
 */
function pairRunsWithLayout(
  layout: PretextLayout,
  runs: SketchRun[],
  offsetOf: (itemIndex: number, charOffset: number) => number,
): Map<number, SketchRun> {
  const out = new Map<number, SketchRun>()
  if (runs.length === 0) return out

  // Cover each code unit with the run that owns it.
  const byOffset = new Map<number, SketchRun>()
  for (const r of runs) {
    if (r.kind === 'newline') continue
    const end = r.startOffset + r.text.length
    for (let o = r.startOffset; o < end; o++) byOffset.set(o, r)
  }

  for (const line of layout.lines) {
    for (const item of line.items) {
      if (item.kind === 'ink') continue
      const atom = layout.atoms[item.atomIndex]
      if (!atom) continue
      const start = offsetOf(atom.itemIndex, atom.charStart)
      const hit = byOffset.get(start)
      if (hit) {
        out.set(item.atomIndex, hit)
        continue
      }
      // Soft-broken chunks: find any overlapping run.
      const end = offsetOf(atom.itemIndex, atom.charEnd)
      for (let o = start; o < end; o++) {
        const r = byOffset.get(o)
        if (r) {
          out.set(item.atomIndex, r)
          break
        }
      }
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* SketchInkSurface — paints a PretextLayout as line boxes + inline ink     */
/* -------------------------------------------------------------------------- */

export interface SketchInkSurfaceProps {
  items: InlineItem[]
  /** Flat source string the offsets index into (default: joined visible text). */
  sourceText?: string
  /** Available width in em. If <=0, falls back to CSS flow (SketchInk). */
  containerWidthEm: number
  /** Root font-size in CSS px (for Pretext px widths). */
  fontSizePx?: number
  /** Font face used for measurement + word spans. */
  font: string
  sizeEm?: number
  align?: LineAlign
  /** Per-line alignment overrides (by line index). */
  lineAligns?: LineAlign[]
  /** Per-line behavior multipliers (wobble / drift / height). */
  lineBehavior?: Array<{ wobbleMul?: number; driftMul?: number; heightMul?: number }>
  /** Flow arrows between lines. */
  flow?: FlowArrow[]
  /** Soft max measure (em) — fit/spread unlock wider than LINE.pageWidthEm. */
  pageWidthCapEm?: number
  /** Sketch obstacles — text wraps around these (em coords). */
  obstacles?: ObstacleBox[]
  action?: SketchAction
  mode?: SketchMode
  intensity?: number
  seedKey?: string
  fatigue?: number
  className?: string
  style?: CSSProperties
  /**
   * Map an atom (by item index + char offset within that item's text) to a
   * code-unit offset in `sourceText`. Default maps into joined visible text.
   */
  offsetOf?: (itemIndex: number, charOffset: number) => number
  /** Render override for inline ink atoms (defaults to <img>). */
  renderInk?: (
    ink: Extract<InlineItem, { kind: 'ink' }>,
    heightEm: number,
    atomIndex: number,
  ) => React.ReactNode
}

export function SketchInkSurface({
  items,
  sourceText,
  containerWidthEm,
  fontSizePx = 16,
  font,
  sizeEm = 1,
  align,
  lineAligns,
  lineBehavior,
  flow,
  pageWidthCapEm,
  obstacles,
  action = 'type',
  mode = 'auto',
  intensity = 0.85,
  seedKey = '',
  fatigue,
  className,
  style,
  offsetOf,
  renderInk,
}: SketchInkSurfaceProps) {
  // Client components can measure with canvas on first paint (avoids stub→canvas jump).
  const [mounted, setMounted] = useState(() => typeof document !== 'undefined')
  useEffect(() => setMounted(true), [])

  const cacheRef = useRef<MeasurementCache>(
    createMeasurementCache(typeof document !== 'undefined' ? canvasMeasure : stubMeasure),
  )
  if (mounted && cacheRef.current.measure === stubMeasure) {
    cacheRef.current = createMeasurementCache(canvasMeasure)
  }

  // Joined visible text + per-item source base offsets (default mapping).
  const { visibleText, itemBase } = useMemo(() => {
    let vis = ''
    const base: number[] = []
    items.forEach((it) => {
      base.push(vis.length)
      if (it.kind === 'text') vis += it.text
    })
    return { visibleText: vis, itemBase: base }
  }, [items])

  const src = sourceText ?? visibleText
  const resolveOffset = useMemo(
    () => offsetOf ?? ((i: number, c: number) => itemBase[i]! + c),
    [offsetOf, itemBase],
  )

  // Per-word jitter/face runs over the visible text.
  const runs = useMemo(
    () => layoutSketchInk(visibleText, mode, intensity, seedKey, action),
    [visibleText, mode, intensity, seedKey, action],
  )

  // Offset → run for measure=paint (same face/tracking the painter uses).
  const runAtOffset = useMemo(() => {
    const byOff = new Map<number, (typeof runs)[number]>()
    for (const r of runs) {
      if (r.kind === 'newline') continue
      const end = r.startOffset + r.text.length
      for (let o = r.startOffset; o < end; o++) byOff.set(o, r)
    }
    return byOff
  }, [runs])

  // Prefer measured CSS width when available (Fit must not clip to an old column).
  const widthEm =
    containerWidthEm > 0
      ? Math.min(containerWidthEm, pageWidthCapEm ?? LINE.pageWidthMaxEm)
      : (pageWidthCapEm ?? LINE.pageWidthEm)
  // Measure always uses soft damp — page-wide ink must not flatten pack metrics.
  // Paint applies ink damp only on bands that touch doodles.
  const paintMetricsAt = useMemo(() => {
    const damp = JITTER.dampSoft
    return (itemIndex: number, charStart: number, _text: string, _kind: 'word' | 'space') => {
      const off = resolveOffset(itemIndex, charStart)
      const run = runAtOffset.get(off)
      if (!run) return { font, scale: 1, letterSpacing: 0 }
      const j = run.jitter
      return {
        font: run.font,
        scale: 1 + (j.scale - 1) * damp.scale,
        letterSpacing: j.letterSpacing * damp.track,
      }
    }
  }, [runAtOffset, resolveOffset, font])

  const layout = useMemo(() => {
    // Re-run after mount once canvas measure replaces the SSR stub.
    void mounted
    return layoutPretext(items, {
      containerWidthEm: widthEm,
      pageWidthCapEm,
      fontSizePx,
      font,
      sizeEm,
      align: align,
      lineAligns,
      lineBehavior,
      flow,
      obstacles,
      action,
      seedKey,
      fatigue,
      cache: cacheRef.current,
      paintMetricsAt,
    })
  }, [
    items,
    widthEm,
    pageWidthCapEm,
    fontSizePx,
    font,
    sizeEm,
    align,
    lineAligns,
    lineBehavior,
    flow,
    obstacles,
    action,
    seedKey,
    fatigue,
    mounted,
    paintMetricsAt,
  ])

  const runByAtom = useMemo(
    () => pairRunsWithLayout(layout, runs, resolveOffset),
    [layout, runs, resolveOffset],
  )

  // Phase 8: sparse margin ticks near cold paragraph starts (ideation / flow / diagram).
  const marginMarks = useMemo(() => {
    if (action !== 'ideation' && action !== 'flow' && action !== 'diagram') return []
    const out: Array<{ xEm: number; yEm: number; kind: 'tick' | 'dot' | 'curl' }> = []
    let prevEmpty = true
    for (const line of layout.lines) {
      const empty = line.usedWidthEm === 0
      const coldStart = prevEmpty && !empty
      prevEmpty = empty
      if (!coldStart) continue
      const rng = createRng(hashSeed(`margin:${seedKey}:${line.index}:${action}`))
      if (rng() > 0.62) continue
      const kinds = ['tick', 'dot', 'curl'] as const
      const kind = kinds[Math.floor(rng() * kinds.length)]!
      out.push({
        xEm: 0.08 + rng() * 0.35,
        yEm: line.topEm + LINE.height * (0.35 + rng() * 0.35),
        kind,
      })
      if (out.length >= 4) break
    }
    return out
  }, [layout.lines, action, seedKey])

  // CSS-flow fallback: containerWidthEm unknown (SSR pre-measure or reader w/o width).
  if (!containerWidthEm || containerWidthEm <= 0) {
    return (
      <span
        className={`sketch-ink sketch-ink--pretext-fallback ${className ?? ''}`.trim()}
        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.95, ...style }}
      >
        {runs.map((r) => (
          <span
            key={r.key}
            className={`sketch-ink-run sketch-ink-${r.hand}`}
            data-sketch-start={r.startOffset}
            data-sketch-end={r.startOffset + r.text.length}
            data-sketch-state={r.state}
            style={{ fontFamily: handFontFamily(r.font, r.hand), ...runStyle(dampRunJitter(r.jitter, JITTER.dampSoft), r.hand, r.fontScale, { flow: true }) }}
          >
            {r.text}
          </span>
        ))}
      </span>
    )
  }

  return (
    <span
      className={`sketch-ink-surface ${className ?? ''}`.trim()}
      style={{
        display: 'block',
        position: 'relative',
        height: `${Math.max(layout.totalHeightEm, LINE.height)}em`,
        width: `${layout.containerWidthEm}em`,
        maxWidth: '100%',
        overflow: 'hidden',
        ...style,
      }}
      data-sketch-source-len={src.length}
    >
      <SketchMarginMarks
        marks={marginMarks}
        widthEm={layout.containerWidthEm}
        heightEm={Math.max(layout.totalHeightEm, LINE.height)}
      />
      {layout.arrows.length > 0 && (
        <svg
          className="sketch-ink-flow"
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${layout.containerWidthEm}em`,
            height: `${layout.totalHeightEm}em`,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {layout.arrows.map((a, i) => (
            <g key={`flow-${i}`} stroke="currentColor" strokeWidth={1.5} fill="none" opacity={0.7}>
              <line x1={`${a.x1}em`} y1={`${a.y1}em`} x2={`${a.x2}em`} y2={`${a.y2}em`} />
              {/* Arrowhead chevron (em coords so it scales with text). */}
              <line x1={`${a.x2 - 0.18}em`} y1={`${a.y2 - 0.25}em`} x2={`${a.x2}em`} y2={`${a.y2}em`} />
              <line x1={`${a.x2 + 0.18}em`} y1={`${a.y2 - 0.25}em`} x2={`${a.x2}em`} y2={`${a.y2}em`} />
            </g>
          ))}
        </svg>
      )}
      {layout.lines.map((line) => {
        const shift = line.baselineShiftEm || 0
        const rot = line.rotateDeg || 0
        const lineTransform = [
          shift ? `translateY(${shift}em)` : '',
          rot ? `rotate(${rot}deg)` : '',
        ]
          .filter(Boolean)
          .join(' ')
        const lineDamp = paintDampForBand(line.topEm, obstacles)
        return (
          <span
            key={`line-${line.index}`}
            className="sketch-ink-line"
            style={{
              display: 'block',
              position: 'absolute',
              left: 0,
              top: `${line.topEm}em`,
              width: `${line.containerWidthEm}em`,
              height: `${line.heightEm}em`,
              transform: lineTransform || undefined,
              transformOrigin: '0 100%',
            }}
          >
          {line.items.map((item, i) => {
            if (item.kind === 'ink' && item.ink) {
              const h = item.ink.sizeEm ?? INLINE_INK.defaultSizeEm
              return (
                <span
                  key={`ink-${line.index}-${i}`}
                  className="sketch-ink-ink"
                  style={{
                    position: 'absolute',
                    left: `${item.xEm}em`,
                    bottom: 0,
                    height: `${h}em`,
                    width: `${item.measured.widthEm - INLINE_INK.rightPadEm}em`,
                    display: 'inline-block',
                    lineHeight: 0,
                  }}
                >
                  {renderInk
                    ? renderInk(item.ink, h, item.atomIndex)
                    : defaultRenderInk(item.ink, h)}
                </span>
              )
            }
            const text = item.text ?? ''
            const atom = layout.atoms[item.atomIndex]
            const start = atom ? resolveOffset(atom.itemIndex, atom.charStart) : 0
            const end = atom ? resolveOffset(atom.itemIndex, atom.charEnd) : start + text.length
            const run = runByAtom.get(item.atomIndex) ?? runAtOffset.get(start)

            // Spaces: reserve width + caret targets, no jitter (avoids ghost paint).
            if (item.kind === 'space') {
              return (
                <span
                  key={`sp-${line.index}-${i}`}
                  className="sketch-ink-run sketch-ink-space"
                  data-sketch-start={start}
                  data-sketch-end={end}
                  style={{
                    position: 'absolute',
                    left: `${item.xEm}em`,
                    bottom: 0,
                    width: `${item.measured.widthEm + (item.stretchEm ?? 0)}em`,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                  }}
                >
                  {item.text || ' '}
                </span>
              )
            }
            if (!text) return null

            const jitter = run?.jitter
            const hand = run?.hand ?? 'script'
            const fontFace = run?.font ?? font
            const fontScale = run?.fontScale ?? FONT_OPTICAL_SCALE[fontFace] ?? 1
            // Band-local damp + fitScale (widths already fitted in IR).
            const fitScale = item.paintScale ?? 1
            const layoutJitter = jitter
              ? dampRunJitter(jitter, lineDamp, fitScale)
              : fitScale !== 1
                ? {
                    rotate: 0,
                    translateY: 0,
                    letterSpacing: 0,
                    opacity: 1,
                    scale: fitScale,
                    angle: 0,
                    pressure: 1,
                  }
                : null
            const boxW = item.measured.widthEm + (item.stretchEm ?? 0)
            return (
              <span
                key={`w-${line.index}-${i}`}
                className={`sketch-ink-run sketch-ink-${hand}`}
                data-sketch-start={start}
                data-sketch-end={end}
                data-sketch-state={run?.state}
                style={{
                  ...(layoutJitter
                    ? runStyle(layoutJitter, hand, fontScale, { absolute: true })
                    : { fontSize: `${fontScale}em` }),
                  position: 'absolute',
                  left: `${item.xEm}em`,
                  bottom: 0,
                  // Width lock: advance equals pack slot (stops ghost overlaps).
                  width: `${boxW}em`,
                  maxWidth: `${boxW}em`,
                  overflow: 'visible',
                  boxSizing: 'border-box',
                  fontFamily: handFontFamily(fontFace, hand),
                  whiteSpace: 'pre',
                }}
              >
                {text}
              </span>
            )
          })}
        </span>
        )
      })}
    </span>
  )
}

function defaultRenderInk(
  ink: Extract<InlineItem, { kind: 'ink' }>,
  heightEm: number,
): React.ReactNode {
  if (ink.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ink.src}
        alt="inline sketch"
        draggable={false}
        style={{ height: `${heightEm}em`, width: 'auto', display: 'block' }}
      />
    )
  }
  // No src yet (live doc) — placeholder box; Phase 5 wires the mini-canvas.
  return (
    <span
      style={{
        display: 'block',
        height: `${heightEm}em`,
        width: '100%',
        background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 4px, transparent 4px 8px)',
        border: '1px dashed rgba(0,0,0,0.25)',
        borderRadius: 2,
      }}
    />
  )
}


