'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { SketchInk } from '@/components/sketch-ink'
import { ScribbleStroke } from '@/components/studio/ScribbleBox'
import type { SketchAction } from '@/lib/sketch-ink'
import type { LineAlign } from '@/lib/sketch-ink/config'
import type { InkTool } from '@/lib/ink'

export type SurfaceTool = InkTool | 'type'

export type ContextMenuState = {
  x: number
  y: number
} | null

const HANDS: Array<{ id: SketchAction; label: string; hint: string }> = [
  { id: 'type', label: 'notes', hint: 'everyday body' },
  { id: 'ideation', label: 'ideation', hint: 'loose dump' },
  { id: 'flow', label: 'flow', hint: 'steps / arrows' },
  { id: 'checklist', label: 'list', hint: 'tight print' },
  { id: 'diagram', label: 'diagram', hint: 'captions' },
]

const MODES: Array<{ id: SurfaceTool; label: string; key: string }> = [
  { id: 'type', label: 'write', key: 'V' },
  { id: 'ink', label: 'scribble', key: 'P' },
  { id: 'pencil', label: 'pencil', key: 'B' },
  { id: 'eraser', label: 'eraser', key: 'E' },
]

const ALIGNS: Array<{ id: LineAlign; label: string }> = [
  { id: 'left', label: 'left' },
  { id: 'center', label: 'center' },
  { id: 'right', label: 'right' },
  { id: 'justify', label: 'justify' },
]

/** Right-click page menu — portaled overlay. */
export function StudioContextMenu({
  menu,
  onClose,
  tool,
  writeAction,
  penOnly,
  onTool,
  onWriteAction,
  onPenOnly,
  onAddText,
  onAddDraw,
  onAddShot,
  onAddDoodle,
  blockAlign,
  onBlockAlign,
  blockFlow,
  onToggleBlockFlow,
}: {
  menu: ContextMenuState
  onClose: () => void
  tool: SurfaceTool
  writeAction: SketchAction
  penOnly: boolean
  onTool: (t: SurfaceTool) => void
  onWriteAction: (a: SketchAction) => void
  onPenOnly: (v: boolean) => void
  onAddText: () => void
  onAddDraw: () => void
  onAddShot: () => void
  onAddDoodle?: () => void
  /** Focused text block's alignment (renders the align section when set). */
  blockAlign?: LineAlign
  onBlockAlign?: (a: LineAlign) => void
  /** Focused text block's flow-arrow toggle. */
  blockFlow?: boolean
  onToggleBlockFlow?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [menu, onClose])

  if (!menu || typeof document === 'undefined') return null

  const drawMode = tool !== 'type'

  return createPortal(
    <div
      ref={ref}
      className="studio-ctx scribble-box"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      aria-label="Page options"
    >
      <ScribbleStroke seed="studio-ctx" tone="chalk" />
      <div className="studio-ctx-section">
        <span className="studio-ctx-label">
          <SketchInk mode="script" intensity={0.35}>
            hand
          </SketchInk>
        </span>
        {HANDS.map((h) => (
          <button
            key={h.id}
            type="button"
            role="menuitemradio"
            aria-checked={writeAction === h.id}
            className={`studio-ctx-item ${writeAction === h.id ? 'is-on' : ''}`}
            onClick={() => {
              onWriteAction(h.id)
              onTool('type')
              onClose()
            }}
          >
            <span className="studio-ctx-item-main">
              <SketchInk mode="script" intensity={0.4}>
                {h.label}
              </SketchInk>
            </span>
            <span className="studio-ctx-hint">{h.hint}</span>
          </button>
        ))}
      </div>

      <div className="studio-ctx-rule" aria-hidden />

      <div className="studio-ctx-section">
        <span className="studio-ctx-label">
          <SketchInk mode="script" intensity={0.35}>
            tool
          </SketchInk>
        </span>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="menuitemradio"
            aria-checked={tool === m.id}
            className={`studio-ctx-item ${tool === m.id ? 'is-on' : ''}`}
            onClick={() => {
              onTool(m.id)
              onClose()
            }}
          >
            <span className="studio-ctx-item-main">
              <SketchInk mode="script" intensity={0.4}>
                {m.label}
              </SketchInk>
            </span>
            <kbd className="studio-ctx-kbd">{m.key}</kbd>
          </button>
        ))}
        {drawMode && (
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={penOnly}
            className={`studio-ctx-item ${penOnly ? 'is-on' : ''}`}
            onClick={() => {
              onPenOnly(!penOnly)
              onClose()
            }}
          >
            <span className="studio-ctx-item-main">
              <SketchInk mode="script" intensity={0.4}>
                {penOnly ? 'pen only · on' : 'pen only · off'}
              </SketchInk>
            </span>
            <span className="studio-ctx-hint">
              {penOnly ? 'tablet / stylus' : 'finger / mouse'}
            </span>
          </button>
        )}
      </div>

      <div className="studio-ctx-rule" aria-hidden />

      <div className="studio-ctx-section">
        <span className="studio-ctx-label">
          <SketchInk mode="script" intensity={0.35}>
            insert
          </SketchInk>
        </span>
        <button
          type="button"
          role="menuitem"
          className="studio-ctx-item"
          onClick={() => {
            onAddText()
            onClose()
          }}
        >
          <span className="studio-ctx-item-main">
            <SketchInk mode="script" intensity={0.4}>
              text block
            </SketchInk>
          </span>
        </button>
        <button
          type="button"
          role="menuitem"
          className="studio-ctx-item"
          onClick={() => {
            onAddDraw()
            onClose()
          }}
        >
          <span className="studio-ctx-item-main">
            <SketchInk mode="script" intensity={0.4}>
              scribble strip
            </SketchInk>
          </span>
        </button>
        {onAddDoodle && (
          <button
            type="button"
            role="menuitem"
            className="studio-ctx-item"
            onClick={() => {
              onAddDoodle()
              onClose()
            }}
          >
            <span className="studio-ctx-item-main">
              <SketchInk mode="script" intensity={0.4}>
                draw on page
              </SketchInk>
            </span>
            <kbd className="studio-ctx-kbd">I</kbd>
          </button>
        )}
        <button
          type="button"
          role="menuitem"
          className="studio-ctx-item"
          onClick={() => {
            onAddShot()
            onClose()
          }}
        >
          <span className="studio-ctx-item-main">
            <SketchInk mode="script" intensity={0.4}>
              screenshot
            </SketchInk>
          </span>
        </button>
      </div>

      {onBlockAlign && (
        <>
          <div className="studio-ctx-rule" aria-hidden />
          <div className="studio-ctx-section">
            <span className="studio-ctx-label">
              <SketchInk mode="script" intensity={0.35}>
                align
              </SketchInk>
            </span>
            {ALIGNS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="menuitemradio"
                aria-checked={blockAlign === a.id}
                className={`studio-ctx-item ${blockAlign === a.id ? 'is-on' : ''}`}
                onClick={() => {
                  onBlockAlign(a.id)
                  onClose()
                }}
              >
                <span className="studio-ctx-item-main">
                  <SketchInk mode="script" intensity={0.4}>
                    {a.label}
                  </SketchInk>
                </span>
              </button>
            ))}
            {onToggleBlockFlow && (
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={!!blockFlow}
                className={`studio-ctx-item ${blockFlow ? 'is-on' : ''}`}
                onClick={() => {
                  onToggleBlockFlow()
                  onClose()
                }}
              >
                <span className="studio-ctx-item-main">
                  <SketchInk mode="script" intensity={0.4}>
                    {blockFlow ? 'flow arrows · on' : 'flow arrows · off'}
                  </SketchInk>
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}

export { HANDS, MODES, ALIGNS }
