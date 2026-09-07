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
import type { SketchAction, SketchMode } from '@/lib/sketch-ink'
import { LINE, measureFontForAction } from '@/lib/sketch-ink/config'
import { usePageWidthCapEm } from '@/components/notebook'
import {
  caretIndexFromPoint,
  caretRectAt,
  rangeRectsInMirror,
} from './fieldDom'
import type { InlineItem } from '@/lib/studio/notebook-blocks'

type SelRect = { left: number; top: number; width: number; height: number }

/**
 * SketchInk field — title / excerpt / short lines.
 * Uses measured SketchInkSurface (same alignment model as the body field).
 */
export function SketchInkField({
  value,
  onChange,
  onFocus,
  placeholder = '',
  mode = 'auto',
  intensity = 0.85,
  seedKey = '',
  action = 'type',
  align,
  className,
  multiline = true,
  'aria-label': ariaLabel,
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
  className?: string
  multiline?: boolean
  'aria-label'?: string
}) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(value)
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(0)
  const [caretStyle, setCaretStyle] = useState<CSSProperties>({})
  const [selRects, setSelRects] = useState<SelRect[]>([])
  const [containerWidthEm, setContainerWidthEm] = useState<number>(LINE.pageWidthEm)
  const [fontSizePx, setFontSizePx] = useState(16)
  const pageWidthCap = usePageWidthCapEm()
  const clickPlacedRef = useRef(false)
  const draggingRef = useRef(false)
  const areaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focused) setDraft(value)
  }, [value, focused])

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

  const show = focused ? draft : value
  const empty = !show
  const collapsed = selStart === selEnd
  // Leave undefined so layoutPretext can use ACTION_PRESETS[action].align (title → center).
  const paintAlign = align === 'justify' ? 'left' : align
  const paintText = empty ? placeholder || '…' : show
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
    if (!field || !mirror || !focused) {
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
  }, [focused, selStart, selEnd])

  const syncHeight = useCallback(() => {
    const el = areaRef.current
    if (!el || !multiline) return
    el.style.height = '0px'
    const mirrorH = mirrorRef.current?.offsetHeight ?? 0
    el.style.height = `${Math.max(mirrorH, 40)}px`
  }, [multiline])

  useLayoutEffect(() => {
    syncHeight()
    syncChrome()
  }, [show, selStart, selEnd, focused, syncHeight, syncChrome])

  useEffect(() => {
    if (!focused) return
    const tick = () => syncChrome()
    window.addEventListener('resize', tick)
    document.addEventListener('scroll', tick, true)
    return () => {
      window.removeEventListener('resize', tick)
      document.removeEventListener('scroll', tick, true)
    }
  }, [focused, syncChrome])

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

  return (
    <div
      ref={fieldRef}
      className={`sketch-ink-field relative ${className ?? ''}`.trim()}
      data-focused={focused ? 'true' : 'false'}
      onPointerDown={onPointerDown}
    >
      {focused &&
        selRects.map((r, i) => (
          <span
            key={`sel-${i}`}
            className="sketch-ink-sel"
            style={{
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
            }}
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
            pageWidthCapEm={pageWidthCap}
          />
        </div>
      </div>

      {focused && collapsed && (
        <span className="sketch-ink-caret z-[2]" style={caretStyle} aria-hidden />
      )}

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
          className="sketch-ink-field-caret-input absolute inset-0 z-10 m-0 w-full resize-none border-0 bg-transparent p-0 outline-none"
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
          className="sketch-ink-field-caret-input absolute inset-0 z-10 m-0 w-full border-0 bg-transparent p-0 outline-none"
        />
      )}
    </div>
  )
}
