'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SketchInkSurface } from '@/components/sketch-ink/SketchInkSurface'
import { parseInlineItems, type InlineItem } from '@/lib/studio/notebook-blocks'
import { measureFontForAction, LINE, type LineAlign } from '@/lib/sketch-ink/config'
import type { FlowArrow } from '@/lib/sketch-ink/pretext'
import { usePageWidthCapEm } from '@/components/notebook'

/**
 * Reader component for the MDX `<Pretext align=... lineAligns=... flow=...>`
 * wrapper. Renders the inner text + inline <Ink /> as a measured SketchInkSurface
 * with per-line alignment, line-level behavior, and flow arrows.
 *
 * Seeds width from page column before first paint so we skip the CSS-flow →
 * absolute Surface remount jump (Phase 2 hone).
 */
export function Pretext({
  children,
  align,
  lineAligns,
  flow,
  action = 'type',
  intensity = 0.85,
  seedKey = '',
}: {
  children?: React.ReactNode
  align?: LineAlign
  lineAligns?: LineAlign[]
  flow?: FlowArrow[]
  action?: 'type' | 'ideation' | 'flow' | 'diagram' | 'checklist' | 'title' | 'excerpt'
  intensity?: number
  seedKey?: string
}) {
  const raw = typeof children === 'string' ? children : String(children ?? '')
  const items = useMemo<InlineItem[]>(() => parseInlineItems(raw), [raw])

  const wrapRef = useRef<HTMLSpanElement>(null)
  const pageWidthCap = usePageWidthCapEm()
  // Seed with page column so first client paint uses Surface, not CSS-flow.
  const [containerWidthEm, setContainerWidthEm] = useState<number>(LINE.pageWidthEm)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const px = parseFloat(getComputedStyle(el).fontSize || '16') || 16
      const widthPx = el.clientWidth || el.parentElement?.clientWidth || 0
      if (widthPx <= 0) return
      setContainerWidthEm(widthPx / px)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (el.parentElement) ro.observe(el.parentElement)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pageWidthCap])

  return (
    <span ref={wrapRef} className="pretext-block" style={{ display: 'block', width: '100%' }}>
      <SketchInkSurface
        items={items}
        containerWidthEm={containerWidthEm}
        pageWidthCapEm={pageWidthCap}
        font={measureFontForAction(action)}
        sizeEm={1}
        align={align}
        lineAligns={lineAligns}
        flow={flow}
        action={action}
        intensity={intensity}
        seedKey={seedKey}
      />
    </span>
  )
}
