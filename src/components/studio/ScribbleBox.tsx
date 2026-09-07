'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

/** Light chalk stroke on black chrome */
export type ScribbleTone = 'chalk' | 'ink'

export type ScribbleMode = 'stroke' | 'fill'

/** `bar` = full nav strip — long edges need different treatment than chips. */
export type ScribbleWeight = 'chip' | 'bar'

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % 2147483647 || 11
}

/** Deterministic unit noise in [-1, 1] from seed + lane. */
function noise(seed: number, lane: number): number {
  let x = Math.imul(seed ^ Math.imul(lane + 1, 374761393), 1103515245)
  x = (x ^ (x >>> 13)) >>> 0
  return (x % 2001) / 1000 - 1
}

/**
 * Continuous sketchnote frame — one smooth bezier per edge with corner
 * overshoots. Avoids Rough.js line subdivision (reads as broken sticks
 * on a wide nav bar).
 */
function drawSketchFrame(
  width: number,
  height: number,
  seed: number,
  tone: ScribbleTone,
  _mode: ScribbleMode,
  emphasize: boolean,
  weight: ScribbleWeight = 'chip',
): string {
  if (width < 2 || height < 2) return ''

  const bar = weight === 'bar'
  const pad = bar ? 5 : 3
  const x = pad
  const y = pad
  const w = Math.max(2, width - pad * 2)
  const h = Math.max(2, height - pad * 2)

  const stroke =
    tone === 'ink'
      ? 'var(--studio-chrome, #0a0a0a)'
      : 'var(--studio-chrome-fg, #f2f2f0)'

  const strokeWidth = bar
    ? emphasize
      ? 1.85
      : 1.5
    : emphasize
      ? 1.75
      : 1.35
  const overshoot = bar
    ? 7 + Math.abs(noise(seed, 0)) * 3
    : 4 + Math.abs(noise(seed, 0)) * 2.5
  // Soft bow mid-edge (px). Keep low on long bars so it stays a strip, not a banana.
  const bow = bar ? (emphasize ? 2.2 : 1.6) : emphasize ? 2.8 : 2.1

  const j = (lane: number, amp = 1) => noise(seed, lane) * amp

  /** One continuous quadratic stroke from A→B with a bowed control point. */
  const edgePath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lane: number,
  ): string => {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    // Control sits near mid, offset perpendicular + slight along-edge drift.
    const t = 0.48 + j(lane * 3, 0.06)
    const cx = x1 + dx * t + nx * (bow * (0.7 + j(lane, 0.35))) + j(lane + 1, 0.8)
    const cy = y1 + dy * t + ny * (bow * (0.7 + j(lane + 2, 0.35))) + j(lane + 3, 0.8)
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }

  const ox = overshoot
  const oy = overshoot * (0.92 + j(9, 0.08))

  const paths = [
    // top
    edgePath(x - ox, y + j(1, 0.6), x + w + ox, y + j(2, 0.6), 10),
    // right
    edgePath(x + w + j(3, 0.6), y - oy, x + w + j(4, 0.6), y + h + oy, 20),
    // bottom
    edgePath(x + w + ox, y + h + j(5, 0.6), x - ox, y + h + j(6, 0.6), 30),
    // left
    edgePath(x + j(7, 0.6), y + h + oy, x + j(8, 0.6), y - oy, 40),
  ]

  // Optional soft double-pass on short chips only (re-traced feel).
  if (!bar && emphasize) {
    paths.push(
      edgePath(
        x - ox * 0.55,
        y + j(50, 0.4),
        x + w * 0.35,
        y + j(51, 0.4),
        50,
      ),
    )
  }

  return paths
    .map(
      (d, i) =>
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${i > 3 ? strokeWidth * 0.7 : strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('')
}

export interface ScribbleBoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Stable Rough.js seed source. */
  seed?: string | number
  tone?: ScribbleTone
  /** `fill` = white/solid chip (host bg); SVG only strokes. Same draw either way. */
  mode?: ScribbleMode
  weight?: ScribbleWeight
}

/**
 * Sketchnote scribble frame for studio chrome.
 * Does not set position:fixed/absolute — callers keep layout CSS.
 * Host should keep its own background; this only draws the wobbly outline.
 */
export const ScribbleBox = forwardRef<HTMLDivElement, ScribbleBoxProps>(
  function ScribbleBox(
    {
      children,
      className = '',
      seed: seedProp,
      tone = 'chalk',
      mode = 'stroke',
      weight = 'chip',
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = useId()
    const seed =
      typeof seedProp === 'number'
        ? seedProp
        : hashSeed(seedProp ?? reactId)

    const localRef = useRef<HTMLDivElement | null>(null)
    const [markup, setMarkup] = useState('')
    const [size, setSize] = useState({ w: 0, h: 0 })
    const [emphasize, setEmphasize] = useState(false)

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    useEffect(() => {
      const el = localRef.current
      if (!el) return

      const measure = () => {
        const r = el.getBoundingClientRect()
        const w = Math.round(r.width)
        const h = Math.round(r.height)
        setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
      }

      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      return () => ro.disconnect()
    }, [])

    useEffect(() => {
      if (size.w < 2 || size.h < 2) {
        setMarkup('')
        return
      }
      try {
        setMarkup(
          drawSketchFrame(size.w, size.h, seed, tone, mode, emphasize, weight),
        )
      } catch {
        setMarkup('')
      }
    }, [size.w, size.h, seed, tone, mode, emphasize, weight])

    return (
      <div
        ref={setRefs}
        className={`scribble-box ${mode === 'fill' ? 'scribble-box--fill' : ''} ${weight === 'bar' ? 'scribble-box--bar' : ''} ${className}`.trim()}
        data-scribble-tone={tone}
        data-scribble-weight={weight}
        style={{ borderRadius: 0, ...style }}
        onMouseEnter={(e) => {
          setEmphasize(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setEmphasize(false)
          onMouseLeave?.(e)
        }}
        {...rest}
      >
        {children}
        {markup ? (
          <svg
            className="scribble-box-stroke"
            width={size.w}
            height={size.h}
            viewBox={`0 0 ${size.w} ${size.h}`}
            aria-hidden
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        ) : null}
      </div>
    )
  },
)

/**
 * Overlay-only scribble stroke for hosts that must remain a native
 * `<button>` / positioned element. Parent needs `position: relative`
 * and class `scribble-box`.
 */
export function ScribbleStroke({
  seed: seedProp,
  tone = 'chalk',
  mode = 'stroke',
  weight = 'chip',
  emphasize: emphasizeProp,
}: {
  seed?: string | number
  tone?: ScribbleTone
  mode?: ScribbleMode
  weight?: ScribbleWeight
  emphasize?: boolean
}) {
  const reactId = useId()
  const seed =
    typeof seedProp === 'number' ? seedProp : hashSeed(seedProp ?? reactId)
  const hostRef = useRef<SVGSVGElement | null>(null)
  const [markup, setMarkup] = useState('')
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState(false)
  const emphasize = emphasizeProp ?? hover

  useEffect(() => {
    const svgHost = hostRef.current
    const el = svgHost?.parentElement
    if (!el) return

    const measure = () => {
      const r = el.getBoundingClientRect()
      const w = Math.round(r.width)
      const h = Math.round(r.height)
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }

    const onEnter = () => setHover(true)
    const onLeave = () => setHover(false)

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      ro.disconnect()
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    if (size.w < 2 || size.h < 2) {
      setMarkup('')
      return
    }
    try {
      setMarkup(
        drawSketchFrame(size.w, size.h, seed, tone, mode, emphasize, weight),
      )
    } catch {
      setMarkup('')
    }
  }, [size.w, size.h, seed, tone, mode, emphasize, weight])

  return (
    <svg
      ref={hostRef}
      className="scribble-box-stroke"
      width={size.w || undefined}
      height={size.h || undefined}
      viewBox={size.w > 0 ? `0 0 ${size.w} ${size.h}` : undefined}
      aria-hidden
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  )
}

export default ScribbleBox
