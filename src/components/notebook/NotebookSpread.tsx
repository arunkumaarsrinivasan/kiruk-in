'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SketchInk } from '@/components/sketch-ink'

/**
 * Open-book frame: left + right sheets, flip between spreads.
 * Children are already bucketed into pages (one React node tree per page).
 */
export function NotebookSpread({
  pages,
  className = '',
  emptyLabel = 'Blank page',
  onSpreadChange,
}: {
  pages: React.ReactNode[]
  className?: string
  emptyLabel?: string
  onSpreadChange?: (index: number) => void
}) {
  const spreads = useMemo(() => {
    const out: Array<{ left: React.ReactNode; right: React.ReactNode | null }> = []
    const list = pages.length > 0 ? pages : [null]
    for (let i = 0; i < list.length; i += 2) {
      out.push({ left: list[i] ?? null, right: list[i + 1] ?? null })
    }
    return out
  }, [pages])

  const [index, setIndex] = useState(0)
  const safeIndex = Math.min(index, Math.max(0, spreads.length - 1))
  const spread = spreads[safeIndex]!

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(spreads.length - 1, next))
      setIndex(clamped)
      onSpreadChange?.(clamped)
    },
    [spreads.length, onSpreadChange],
  )

  useEffect(() => {
    if (index > spreads.length - 1) setIndex(Math.max(0, spreads.length - 1))
  }, [index, spreads.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) {
        // Allow Alt+Arrow to flip while typing.
        if (!e.altKey) return
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        go(safeIndex + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(safeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, safeIndex])

  return (
    <div className={`notebook-spread ${className}`.trim()}>
      <div className="notebook-spread-stage" key={safeIndex}>
        <div className="notebook-spread-sheet notebook-spread-sheet--left">
          <div className="notebook-spread-sheet-inner">
            {spread.left ?? (
              <p className="notebook-spread-empty">
                <SketchInk mode="script" intensity={0.35}>
                  {emptyLabel}
                </SketchInk>
              </p>
            )}
          </div>
        </div>
        <div className="notebook-spread-spine" aria-hidden />
        <div className="notebook-spread-sheet notebook-spread-sheet--right">
          <div className="notebook-spread-sheet-inner">
            {spread.right ?? (
              <p className="notebook-spread-empty">
                <SketchInk mode="script" intensity={0.3}>
                  {emptyLabel}
                </SketchInk>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="notebook-spread-nav">
        <button
          type="button"
          className="notebook-spread-nav-btn"
          disabled={safeIndex <= 0}
          onClick={() => go(safeIndex - 1)}
          aria-label="Previous spread"
        >
          ←
        </button>
        <span className="notebook-spread-nav-label">
          <SketchInk mode="script" intensity={0.4}>
            {`${safeIndex + 1} / ${spreads.length}`}
          </SketchInk>
        </span>
        <button
          type="button"
          className="notebook-spread-nav-btn"
          disabled={safeIndex >= spreads.length - 1}
          onClick={() => go(safeIndex + 1)}
          aria-label="Next spread"
        >
          →
        </button>
      </div>
    </div>
  )
}
