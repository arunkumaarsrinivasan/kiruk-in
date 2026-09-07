import type { CSSProperties } from 'react'
import { layoutSketchInk, type SketchAction, type SketchMode } from '@/lib/sketch-ink'
import { handFontFamily } from '@/lib/sketch-ink/pools'
import { runStyle, dampRunJitter } from '@/lib/sketch-ink/jitter'
import { JITTER } from '@/lib/sketch-ink/config'

/**
 * Dual-hand SketchInk + Human Behavior (v5).
 * Word runs with angle/face/intensity from writing state + sketchnote action.
 */
export function SketchInk({
  children,
  mode = 'auto',
  intensity = 0.85,
  seedKey = '',
  action = 'type',
  as: Tag = 'span',
  className,
  style,
}: {
  children: string
  mode?: SketchMode
  intensity?: number
  seedKey?: string
  action?: SketchAction
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'label'
  className?: string
  style?: CSSProperties
}) {
  const text = typeof children === 'string' ? children : String(children ?? '')
  const runs = layoutSketchInk(text, mode, intensity, seedKey, action)

  return (
    <Tag
      className={`sketch-ink sketch-ink--v5 ${className ?? ''}`.trim()}
      style={{ whiteSpace: 'pre-wrap', lineHeight: 1.95, ...style }}
      data-sketch-mode={mode}
      data-sketch-action={action}
    >
      {runs.map((run) => {
        if (run.kind === 'newline') {
          return (
            <span
              key={run.key}
              className="sketch-ink-run sketch-ink-nl"
              data-sketch-start={run.startOffset}
              data-sketch-end={run.startOffset + 1}
            >
              {'\n'}
            </span>
          )
        }

        if (run.kind === 'space') {
          return (
            <span
              key={run.key}
              className="sketch-ink-run sketch-ink-space"
              data-sketch-start={run.startOffset}
              data-sketch-end={run.startOffset + 1}
            >
              {' '}
            </span>
          )
        }

        return (
          <span
            key={run.key}
            className={`sketch-ink-run sketch-ink-${run.hand}`}
            data-sketch-start={run.startOffset}
            data-sketch-end={run.startOffset + run.text.length}
            data-sketch-state={run.state}
            style={{
              fontFamily: handFontFamily(run.font, run.hand),
              ...runStyle(dampRunJitter(run.jitter, JITTER.dampSoft), run.hand, run.fontScale, { flow: true }),
            }}
          >
            {run.text}
          </span>
        )
      })}
    </Tag>
  )
}
