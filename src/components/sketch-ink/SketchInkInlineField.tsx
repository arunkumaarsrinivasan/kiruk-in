'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { SketchInkSurface } from './SketchInkSurface'
import { InkCanvas } from '@/components/ink/InkCanvas'
import type { SketchAction, SketchMode } from '@/lib/sketch-ink'
import { LINE, measureFontForAction } from '@/lib/sketch-ink/config'
import { usePageWidthCapEm } from '@/components/notebook'
import {
  caretIndexFromPoint,
  caretRectAt,
  rangeRectsInMirror,
} from './fieldDom'
import {
  createInkDoc,
  obstaclesFromInkDoc,
  obstaclesEqual,
  type InkDocument,
  type InkTool,
  type ObstacleBox,
} from '@/lib/ink'
import type { InlineItem } from '@/lib/studio/notebook-blocks'

type SelRect = { left: number; top: number; width: number; height: number }

/**
 * Unified page surface — write and draw in the same block.
 *
 * Text paints via measured SketchInkSurface. Freehand ink is an overlay;
 * stroke clusters become layout obstacles so words wrap around sketches
 * within LINE.pageWidthEm.
 */
export function SketchInkInlineField({
  value,
  onChange,
  onFocus,
  placeholder = '',
  mode = 'auto',
  intensity = 0.85,
  seedKey = '',
  action = 'type',
  align,
  flow,
  className,
  multiline = true,
  'aria-label': ariaLabel,
  drawTool = null,
  inkDoc,
  onInkChange,
}: {
  value: string
  onChange: (next: string) => void
  onFocus?: () => void
  placeholder?: string
  mode?: SketchMode
  intensity?: number
  seedKey?: string
  action?: SketchAction
  align?: 'left' | 'center' | 'right' | 'justify'
  flow?: Array<{ fromLine: number; toLine: number }>
  className?: string
  multiline?: boolean
  'aria-label'?: string
  drawTool?: InkTool | null
  inkDoc?: InkDocument
  onInkChange?: (doc: InkDocument) => void
}) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(value)
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(0)
  const [caretStyle, setCaretStyle] = useState<CSSProperties>({})
  const [selRects, setSelRects] = useState<SelRect[]>([])
  const [containerWidthEm, setContainerWidthEm] = useState<number>(LINE.pageWidthEm)
  const [fontSizePx, setFontSizePx] = useState(16)
  const [obstacles, setObstacles] = useState<ObstacleBox[]>([])
  const [inkTick, setInkTick] = useState(0)
  const pageWidthCap = usePageWidthCapEm()

  const clickPlacedRef = useRef(false)
  const draggingRef = useRef(false)
  const areaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const localInkRef = useRef<InkDocument>(
    inkDoc ?? createInkDoc({ width: 800, height: 400 }),
  )
  const rafObstaclesRef = useRef<number | null>(null)
  const fontSizePxRef = useRef(fontSizePx)
  fontSizePxRef.current = fontSizePx

  const drawing = drawTool != null
  // Justify + inline-block word runs blows word gaps — treat as left for paint.
  const paintAlign = align === 'justify' ? 'left' : align

  useEffect(() => {
    if (!focused) setDraft(value)
  }, [value, focused])

  useEffect(() => {
    if (inkDoc) {
      localInkRef.current = inkDoc
      setInkTick((t) => t + 1)
    }
  }, [inkDoc])

  // Measure field width in em + font-size in px (for obstacle mapping).
  // useLayoutEffect: measure before paint to avoid 36em → real-width wrap snap.
  useLayoutEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const measure = () => {
      const px = parseFloat(getComputedStyle(el).fontSize || '16') || 16
      const w = el.clientWidth / px
      setFontSizePx(px)
      setContainerWidthEm(w > 0 ? w : pageWidthCap)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageWidthCap])

  const recomputeObstacles = useCallback(() => {
    const doc = localInkRef.current
    if (!doc.strokes.length) {
      setObstacles((prev) => (prev.length === 0 ? prev : []))
      return
    }
    const next = obstaclesFromInkDoc(doc, fontSizePxRef.current, {
      gapPx: LINE.clusterGapPx,
      padXEm: LINE.obstaclePadEm,
      padYEm: LINE.obstaclePadYEm,
      minAreaEm2: LINE.minObstacleAreaEm2,
      maxUnionAreaRatio: LINE.maxClusterUnionRatio,
      bandHeightEm: LINE.height,
    })
    setObstacles((prev) => (obstaclesEqual(prev, next) ? prev : next))
  }, [])

  useEffect(() => {
    recomputeObstacles()
  }, [recomputeObstacles, inkTick, fontSizePx])

  /** Coalesce obstacle updates to one per animation frame while drawing. */
  const scheduleObstacleFrame = useCallback(() => {
    if (rafObstaclesRef.current != null) return
    rafObstaclesRef.current = requestAnimationFrame(() => {
      rafObstaclesRef.current = null
      recomputeObstacles()
    })
  }, [recomputeObstacles])

  useEffect(() => {
    return () => {
      if (rafObstaclesRef.current != null) {
        cancelAnimationFrame(rafObstaclesRef.current)
        rafObstaclesRef.current = null
      }
    }
  }, [])

  const show = focused ? draft : value
  const empty = !show
  const collapsed = selStart === selEnd
  const paintText = empty
    ? drawing
      ? 'Draw on the page…'
      : placeholder || '…'
    : show

  const items = useMemo<InlineItem[]>(
    () => [{ kind: 'text', text: paintText }],
    [paintText],
  )

  const readSelection = useCallback(() => {
    const el = areaRef.current
    if (!el) return
    setSelStart(el.selectionStart ?? 0)
    setSelEnd(el.selectionEnd ?? el.selectionStart ?? 0)
  }, [])

  const syncChrome = useCallback(() => {
    const field = fieldRef.current
    const mirror = mirrorRef.current
    if (!field || !mirror || !focused || drawing) {
      setSelRects([])
      return
    }

    const fieldBox = field.getBoundingClientRect()
    const a = Math.min(selStart, selEnd)
    const b = Math.max(selStart, selEnd)

    if (a !== b) {
      const rects = rangeRectsInMirror(mirror, a, b)
      setSelRects(
        rects.map((r) => ({
          left: r.left - fieldBox.left,
          top: r.top - fieldBox.top,
          width: Math.max(2, r.width),
          height: Math.max(14, r.height),
        })),
      )
    } else {
      setSelRects([])
    }

    if (a === b) {
      const rect = caretRectAt(mirror, a)
      if (!rect) {
        setCaretStyle({ left: 2, top: 4, height: '1.15em' })
        return
      }
      setCaretStyle({
        left: rect.left - fieldBox.left,
        top: rect.top - fieldBox.top,
        height: Math.max(16, rect.height),
      })
    }
  }, [focused, selStart, selEnd, drawing])

  const syncHeight = useCallback(() => {
    const el = areaRef.current
    if (!el || !multiline) return
    el.style.height = '0px'
    const mirrorH = mirrorRef.current?.offsetHeight ?? 0
    el.style.height = `${Math.max(mirrorH, 72)}px`
  }, [multiline])

  useLayoutEffect(() => {
    syncHeight()
    syncChrome()
  }, [show, selStart, selEnd, focused, syncHeight, syncChrome, drawing, obstacles])

  useEffect(() => {
    if (!focused || drawing) return
    const tick = () => syncChrome()
    window.addEventListener('resize', tick)
    document.addEventListener('scroll', tick, true)
    return () => {
      window.removeEventListener('resize', tick)
      document.removeEventListener('scroll', tick, true)
    }
  }, [focused, drawing, syncChrome])

  const handleChange = (next: string, start: number, end: number) => {
    setDraft(next)
    setSelStart(start)
    setSelEnd(end)
    onChange(next)
  }

  const handleBlur = () => {
    setFocused(false)
    setSelRects([])
    clickPlacedRef.current = false
    draggingRef.current = false
    if (draft !== value) onChange(draft)
  }

  const handleFocus = () => {
    if (drawing) return
    setFocused(true)
    setDraft(value)
    onFocus?.()
    requestAnimationFrame(() => {
      const el = areaRef.current
      if (!el) return
      if (clickPlacedRef.current || draggingRef.current) {
        clickPlacedRef.current = false
        readSelection()
        return
      }
      const end = el.value.length
      el.setSelectionRange(end, end)
      setSelStart(end)
      setSelEnd(end)
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (drawing) {
      onFocus?.()
      return
    }

    draggingRef.current = false
    const startX = e.clientX
    const startY = e.clientY
    const mirror = mirrorRef.current
    const idx = mirror ? caretIndexFromPoint(mirror, e.clientX, e.clientY, show.length) : 0
    clickPlacedRef.current = true

    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) {
        draggingRef.current = true
      }
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const el = areaRef.current
      if (!draggingRef.current) {
        el?.focus()
        el?.setSelectionRange(idx, idx)
        setSelStart(idx)
        setSelEnd(idx)
        setFocused(true)
      } else {
        requestAnimationFrame(readSelection)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    areaRef.current?.focus()
    if (!draggingRef.current) {
      areaRef.current?.setSelectionRange(idx, idx)
    }
  }

  const handleInkChange = (doc: InkDocument) => {
    localInkRef.current = doc
    onInkChange?.(doc)
    scheduleObstacleFrame()
  }

  return (
    <div
      ref={fieldRef}
      className={`sketch-ink-field sketch-ink-unified relative ${className ?? ''}`.trim()}
      data-focused={focused ? 'true' : 'false'}
      data-drawing={drawing ? 'true' : 'false'}
      onPointerDown={onPointerDown}
      style={drawing ? { cursor: 'crosshair', minHeight: empty ? 120 : undefined } : undefined}
    >
      {focused &&
        !drawing &&
        selRects.map((r, i) => (
          <span
            key={`sel-${i}`}
            className="sketch-ink-sel"
            style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
            aria-hidden
          />
        ))}

      <div
        ref={mirrorRef}
        className="sketch-ink-field-mirror pointer-events-none relative z-[1]"
        aria-hidden
      >
        <div
          className={empty ? 'sketch-ink-placeholder' : undefined}
          style={empty ? { color: 'var(--text-muted)', opacity: 0.5 } : undefined}
        >
          <SketchInkSurface
            items={items}
            sourceText={paintText}
            containerWidthEm={containerWidthEm}
            fontSizePx={fontSizePx}
            font={measureFontForAction(action)}
            sizeEm={1}
            align={paintAlign}
            action={action}
            mode={mode}
            intensity={empty ? intensity * 0.55 : intensity}
            seedKey={seedKey}
            flow={flow}
            pageWidthCapEm={pageWidthCap}
            obstacles={obstacles.length > 0 ? obstacles : undefined}
          />
        </div>
      </div>

      {focused && collapsed && !drawing && (
        <span className="sketch-ink-caret z-[2]" style={caretStyle} aria-hidden />
      )}

      <div
        className="sketch-ink-overlay absolute inset-0 z-[5]"
        style={{
          pointerEvents: drawing ? 'auto' : 'none',
          minHeight: '100%',
        }}
        aria-hidden={!drawing}
      >
        <InkCanvas
          key={`overlay-${seedKey}`}
          initialDoc={localInkRef.current}
          onDocChange={handleInkChange}
          showToolbar={false}
          enabled={drawing}
          tool={drawTool ?? 'ink'}
          transparent
          fitParent
          className="h-full w-full"
        />
      </div>

      {multiline ? (
        <textarea
          ref={areaRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) =>
            handleChange(
              e.target.value,
              e.target.selectionStart ?? e.target.value.length,
              e.target.selectionEnd ?? e.target.selectionStart ?? e.target.value.length,
            )
          }
          onSelect={readSelection}
          onKeyUp={readSelection}
          onMouseUp={readSelection}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder=""
          aria-label={ariaLabel ?? placeholder}
          tabIndex={drawing ? -1 : 0}
          className="sketch-ink-field-caret-input absolute inset-0 z-10 m-0 w-full resize-none border-0 bg-transparent p-0 outline-none"
          style={{ pointerEvents: drawing ? 'none' : 'auto' }}
        />
      ) : (
        <input
          ref={areaRef as React.RefObject<HTMLInputElement>}
          value={draft}
          onChange={(e) =>
            handleChange(
              e.target.value,
              e.target.selectionStart ?? e.target.value.length,
              e.target.selectionEnd ?? e.target.selectionStart ?? e.target.value.length,
            )
          }
          onSelect={readSelection}
          onKeyUp={readSelection}
          onMouseUp={readSelection}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder=""
          aria-label={ariaLabel ?? placeholder}
          tabIndex={drawing ? -1 : 0}
          className="sketch-ink-field-caret-input absolute inset-0 z-10 m-0 w-full border-0 bg-transparent p-0 outline-none"
          style={{ pointerEvents: drawing ? 'none' : 'auto' }}
        />
      )}
    </div>
  )
}
