'use client'

import { useMemo } from 'react'
import { layoutSketchInk, summarizeRuns, type SketchAction, type SketchMode } from '@/lib/sketch-ink'

/**
 * Dev-only chip — proves SketchInk behavior is firing (fonts / skew / hands).
 * Renders when NODE_ENV=development.
 */
export function SketchInkDebug({
  text,
  mode = 'auto',
  intensity = 0.9,
  seedKey = '',
  action = 'type',
}: {
  text: string
  mode?: SketchMode
  intensity?: number
  seedKey?: string
  action?: SketchAction
}) {
  const stats = useMemo(() => {
    if (!text.trim()) return null
    const runs = layoutSketchInk(text, mode, intensity, seedKey, action)
    return summarizeRuns(runs)
  }, [text, mode, intensity, seedKey, action])

  if (process.env.NODE_ENV === 'production' || !stats) return null

  return (
    <div
      className="sketch-ink-debug pointer-events-none fixed bottom-3 right-3 z-[80] rounded border px-2 py-1 font-mono text-[10px] leading-tight"
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-muted)',
        maxWidth: '16rem',
      }}
      aria-hidden
    >
      <div>
        ink {stats.wordCount}w · print {stats.printPct}% · script {stats.scriptPct}%
      </div>
      <div>
        skew {stats.meanSkew}° · {stats.fonts.join(' · ')}
      </div>
      <div>action {action}</div>
    </div>
  )
}
