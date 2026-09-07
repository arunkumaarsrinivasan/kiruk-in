'use client'

/**
 * Sparse sketchnote chrome — Rough.js marks, not per-glyph simulation.
 * Use under ink / beside captions; keep density low for perf.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import rough from 'roughjs/bin/rough'
import type { Options as RoughOptions } from 'roughjs/bin/core'
import { SketchInk } from './SketchInk'
import type { SketchAction } from '@/lib/sketch-ink'

const INK: RoughOptions = {
  roughness: 1.35,
  stroke: '#0a0a0a',
  strokeWidth: 1.4,
  fill: 'transparent',
  bowing: 1.1,
}

function useRoughSvg(
  draw: (svg: SVGSVGElement, seed: number) => void,
  deps: unknown[],
) {
  const ref = useRef<SVGSVGElement>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6))

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    draw(svg, seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes deps
  }, deps)

  return ref
}

export function RoughUnderline({
  className = '',
  width = '100%',
}: {
  className?: string
  width?: number | string
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6))

  useEffect(() => {
    const wrap = wrapRef.current
    const svg = svgRef.current
    if (!wrap || !svg) return
    const paint = () => {
      const w = wrap.clientWidth || 200
      svg.setAttribute('width', String(w))
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      const rc = rough.svg(svg, { options: { ...INK, seed } })
      svg.appendChild(
        rc.line(4, 6, w - 4, 7, { ...INK, seed, strokeWidth: 1.6, roughness: 1.2 }),
      )
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [seed, width])

  return (
    <span ref={wrapRef} className={`sketch-chrome-underline block w-full ${className}`}>
      <svg
        ref={svgRef}
        height={12}
        width="100%"
        aria-hidden
        style={{ overflow: 'visible', display: 'block' }}
      />
    </span>
  )
}

export function RoughStrike({
  className = '',
  width = '100%',
}: {
  className?: string
  width?: number | string
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6))

  useEffect(() => {
    const wrap = wrapRef.current
    const svg = svgRef.current
    if (!wrap || !svg) return
    const paint = () => {
      const w = wrap.clientWidth || 160
      svg.setAttribute('width', String(w))
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      const rc = rough.svg(svg, { options: { ...INK, seed } })
      svg.appendChild(
        rc.line(2, 8, w - 2, 6, { ...INK, seed, strokeWidth: 1.5, roughness: 1.0 }),
      )
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [seed, width])

  return (
    <span ref={wrapRef} className={`sketch-chrome-strike block w-full ${className}`}>
      <svg
        ref={svgRef}
        height={14}
        width="100%"
        aria-hidden
        style={{ overflow: 'visible', display: 'block' }}
      />
    </span>
  )
}

export function RoughDivider({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6))

  useEffect(() => {
    const wrap = wrapRef.current
    const svg = svgRef.current
    if (!wrap || !svg) return
    const paint = () => {
      const w = wrap.clientWidth || 320
      svg.setAttribute('width', String(w))
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      const rc = rough.svg(svg, { options: { ...INK, seed } })
      let x = 8
      let s = seed
      while (x < w - 12) {
        const len = 10 + (s % 7)
        svg.appendChild(
          rc.line(x, 8, Math.min(x + len, w - 8), 9, {
            ...INK,
            seed: s,
            strokeWidth: 1.2,
            roughness: 1.5,
          }),
        )
        x += len + 6 + (s % 4)
        s += 17
      }
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [seed])

  return (
    <div ref={wrapRef} className={`sketch-chrome-divider my-6 w-full ${className}`}>
      <svg
        ref={svgRef}
        height={18}
        width="100%"
        aria-hidden
        style={{ overflow: 'visible', display: 'block' }}
      />
    </div>
  )
}

export function RoughBox({
  children,
  className = '',
  pad = true,
}: {
  children?: ReactNode
  className?: string
  pad?: boolean
}) {
  const id = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6))

  useEffect(() => {
    const box = boxRef.current
    const svg = svgRef.current
    if (!box || !svg) return

    const paint = () => {
      const { width, height } = box.getBoundingClientRect()
      svg.setAttribute('width', String(width))
      svg.setAttribute('height', String(height))
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      const rc = rough.svg(svg, { options: { ...INK, seed } })
      // overshoot corners slightly
      svg.appendChild(
        rc.rectangle(3, 3, Math.max(8, width - 6), Math.max(8, height - 6), {
          ...INK,
          seed,
          strokeWidth: 1.5,
          roughness: 1.4,
          bowing: 1.3,
        }),
      )
    }

    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(box)
    return () => ro.disconnect()
  }, [seed, children])

  return (
    <div
      ref={boxRef}
      className={`sketch-chrome-box relative my-4 ${pad ? 'px-4 py-3' : ''} ${className}`}
    >
      <svg
        ref={svgRef}
        id={id}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
        style={{ overflow: 'visible' }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

/** Caption under an ink / diagram block — print-biased diagram action. */
export function DiagramCaption({
  children,
  className = '',
}: {
  children: string
  className?: string
}) {
  return (
    <p
      className={`sketch-diagram-caption mt-2 text-center text-base ${className}`}
      style={{ color: 'var(--text-muted)', lineHeight: 1.9 }}
    >
      <SketchInk mode="auto" intensity={0.75} action={'diagram' as SketchAction}>
        {children}
      </SketchInk>
    </p>
  )
}

/** Checklist row — print hand + rough checkbox. */
export function SketchChecklist({
  items,
  className = '',
}: {
  items: Array<{ text: string; checked?: boolean }>
  className?: string
}) {
  return (
    <ul className={`sketch-checklist my-4 space-y-2 ${className}`}>
      {items.map((item, i) => (
        <li key={`${i}-${item.text}`} className="flex items-start gap-2 text-lg">
          <RoughCheckbox checked={Boolean(item.checked)} />
          <span style={{ lineHeight: 1.9 }}>
            <SketchInk mode="print" intensity={0.7} action="checklist">
              {item.text}
            </SketchInk>
          </span>
        </li>
      ))}
    </ul>
  )
}

function RoughCheckbox({ checked }: { checked: boolean }) {
  const ref = useRoughSvg((svg, seed) => {
    const rc = rough.svg(svg, { options: { ...INK, seed } })
    svg.appendChild(
      rc.rectangle(2, 2, 16, 16, { ...INK, seed, strokeWidth: 1.4, roughness: 1.2 }),
    )
    if (checked) {
      svg.appendChild(
        rc.path('M5 10 l4 4 l8 -9', {
          ...INK,
          seed: seed + 3,
          strokeWidth: 1.6,
          roughness: 1.0,
        }),
      )
    }
  }, [checked])

  return (
    <svg
      ref={ref}
      width={22}
      height={22}
      className="mt-1 shrink-0"
      aria-hidden
      style={{ overflow: 'visible' }}
    />
  )
}

/**
 * Sparse margin ticks / thought curls — page linking without ink spam.
 * Positions are em coords relative to the text surface.
 */
export function SketchMarginMarks({
  marks,
  widthEm,
  heightEm,
  className = '',
}: {
  marks: Array<{ xEm: number; yEm: number; kind: 'tick' | 'dot' | 'curl' }>
  widthEm: number
  heightEm: number
  className?: string
}) {
  const ref = useRoughSvg(
    (svg, seed) => {
      const rc = rough.svg(svg, { options: { ...INK, seed } })
      // Convert em → px assuming 16px root; actual size set via viewBox.
      const px = 16
      marks.forEach((m, i) => {
        const x = m.xEm * px
        const y = m.yEm * px
        const s = seed + i * 17
        if (m.kind === 'dot') {
          svg.appendChild(
            rc.circle(x, y, 3.2, {
              ...INK,
              seed: s,
              strokeWidth: 1.2,
              roughness: 1.1,
            }),
          )
        } else if (m.kind === 'curl') {
          svg.appendChild(
            rc.path(`M${x} ${y} q 6 -8 10 2`, {
              ...INK,
              seed: s,
              strokeWidth: 1.3,
              roughness: 1.35,
              bowing: 1.4,
            }),
          )
        } else {
          svg.appendChild(
            rc.line(x, y - 4, x + 7, y + 2, {
              ...INK,
              seed: s,
              strokeWidth: 1.35,
              roughness: 1.25,
            }),
          )
        }
      })
    },
    [marks, widthEm, heightEm],
  )

  if (marks.length === 0) return null

  return (
    <svg
      ref={ref}
      className={`sketch-margin-marks pointer-events-none absolute left-0 top-0 ${className}`}
      aria-hidden
      width={`${widthEm}em`}
      height={`${heightEm}em`}
      viewBox={`0 0 ${widthEm * 16} ${heightEm * 16}`}
      style={{ overflow: 'visible' }}
    />
  )
}

/** Short rough underline for ideation / flow block chrome. */
export function SketchActionChrome({
  action,
  className = '',
}: {
  action: SketchAction
  className?: string
}) {
  if (action !== 'ideation' && action !== 'flow' && action !== 'diagram') return null
  return (
    <span className={`sketch-action-chrome mt-1 block opacity-70 ${className}`} aria-hidden>
      {action === 'diagram' ? <RoughDivider /> : <RoughUnderline width="42%" />}
    </span>
  )
}
