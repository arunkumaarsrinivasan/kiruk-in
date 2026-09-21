'use client'

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { StudioIcon, type StudioIconName } from '@/components/studio/icons'
import { ScribbleStroke } from '@/components/studio/ScribbleBox'
import { SketchInk } from '@/components/sketch-ink'
import type { SketchAction } from '@/lib/sketch-ink'
import type { SurfaceTool } from '@/components/studio/StudioContextMenu'

const TOOLS: Array<{
  id: SurfaceTool
  icon: StudioIconName
  label: string
  key: string
}> = [
  { id: 'type', icon: 'type', label: 'write', key: 'V' },
  { id: 'ink', icon: 'ink', label: 'scribble', key: 'P' },
  { id: 'pencil', icon: 'pencil', label: 'pencil', key: 'B' },
  { id: 'eraser', icon: 'eraser', label: 'eraser', key: 'E' },
]

const HANDS: Array<{ id: SketchAction; label: string }> = [
  { id: 'type', label: 'notes' },
  { id: 'ideation', label: 'ideation' },
  { id: 'flow', label: 'flow' },
  { id: 'checklist', label: 'list' },
  { id: 'diagram', label: 'diagram' },
]

/**
 * BLOGISM tool strip — write vs scribble on one paper.
 */
export function StudioToolDock({
  tool,
  writeAction,
  onTool,
  onWriteAction,
  onAddText,
  onAddDraw,
  onAddShot,
  onAddDoodle,
  onOpenMenu,
}: {
  tool: SurfaceTool
  writeAction: SketchAction
  onTool: (t: SurfaceTool) => void
  onWriteAction: (a: SketchAction) => void
  onAddText: () => void
  onAddDraw: () => void
  onAddShot: () => void
  /** Switch to ink and hint: click in text to doodle. */
  onAddDoodle?: () => void
  onOpenMenu: (e: ReactMouseEvent) => void
}) {
  const [handOpen, setHandOpen] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!handOpen && !plusOpen) return
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setHandOpen(false)
        setPlusOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHandOpen(false)
        setPlusOpen(false)
      }
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [handOpen, plusOpen])

  return (
    <div
      ref={rootRef}
      className="studio-dock studio-dock--toolbar"
      role="toolbar"
      aria-label="BLOGISM tools"
      onContextMenu={onOpenMenu}
    >
      {handOpen && (
        <div className="studio-dock-pop studio-dock-pop--hand scribble-box" role="menu">
          <ScribbleStroke seed="dock-pop-hand" tone="chalk" />
          {HANDS.map((h) => (
            <button
              key={h.id}
              type="button"
              role="menuitemradio"
              aria-checked={writeAction === h.id}
              className={`studio-dock-pop-item ${writeAction === h.id ? 'is-on' : ''}`}
              onClick={() => {
                onWriteAction(h.id)
                onTool('type')
                setHandOpen(false)
              }}
            >
              <SketchInk mode="script" intensity={0.4}>
                {h.label}
              </SketchInk>
            </button>
          ))}
        </div>
      )}

      {plusOpen && (
        <div className="studio-dock-pop studio-dock-pop--plus scribble-box" role="menu">
          <ScribbleStroke seed="dock-pop-plus" tone="chalk" />
          <button
            type="button"
            role="menuitem"
            className="studio-dock-pop-item"
            onClick={() => {
              onAddText()
              setPlusOpen(false)
            }}
          >
            <StudioIcon name="addText" size={16} />
            <SketchInk mode="script" intensity={0.4}>
              text
            </SketchInk>
          </button>
          <button
            type="button"
            role="menuitem"
            className="studio-dock-pop-item"
            onClick={() => {
              onAddDraw()
              setPlusOpen(false)
            }}
          >
            <StudioIcon name="addDraw" size={16} />
            <SketchInk mode="script" intensity={0.4}>
              scribble
            </SketchInk>
          </button>
          {onAddDoodle && (
            <button
              type="button"
              role="menuitem"
              className="studio-dock-pop-item"
              onClick={() => {
                onAddDoodle()
                setPlusOpen(false)
              }}
            >
              <StudioIcon name="ink" size={16} />
              <SketchInk mode="script" intensity={0.4}>
                on page
              </SketchInk>
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="studio-dock-pop-item"
            onClick={() => {
              onAddShot()
              setPlusOpen(false)
            }}
          >
            <StudioIcon name="addShot" size={16} />
            <SketchInk mode="script" intensity={0.4}>
              shot
            </SketchInk>
          </button>
        </div>
      )}

      <div className="studio-dock-bar scribble-box">
        <ScribbleStroke seed="dock-bar" tone="chalk" />
        {TOOLS.map((t) => {
          const isWrite = t.id === 'type'
          const on = tool === t.id
          return (
            <div
              key={t.id}
              className={`studio-dock-cluster ${on ? 'scribble-box scribble-box--fill' : ''}`}
            >
              {on && <ScribbleStroke seed={`dock-tool-${t.id}`} tone="ink" mode="fill" />}
              <button
                type="button"
                className={`studio-dock-btn ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                title={`${t.label} (${t.key})`}
                onClick={() => {
                  onTool(t.id)
                  setPlusOpen(false)
                  if (!isWrite) setHandOpen(false)
                }}
              >
                <StudioIcon name={t.icon} size={18} />
                <span className="studio-dock-btn-label">
                  <SketchInk mode="script" intensity={0.35}>
                    {t.label}
                  </SketchInk>
                </span>
              </button>
              {isWrite && (
                <button
                  type="button"
                  className={`studio-dock-chevron ${handOpen ? 'is-on' : ''}`}
                  title="Hand style"
                  aria-expanded={handOpen}
                  aria-label="Choose handwriting style"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTool('type')
                    setHandOpen((v) => !v)
                    setPlusOpen(false)
                  }}
                >
                  ▾
                </button>
              )}
            </div>
          )
        })}

        <span className="studio-dock-rule" aria-hidden />

        <button
          type="button"
          className={`studio-dock-btn studio-dock-btn--plus ${plusOpen ? 'is-on scribble-box scribble-box--fill' : ''}`}
          title="Insert"
          aria-expanded={plusOpen}
          onClick={() => {
            setPlusOpen((v) => !v)
            setHandOpen(false)
          }}
        >
          {plusOpen && <ScribbleStroke seed="dock-add" tone="ink" mode="fill" />}
          <span className="studio-dock-plus-mark" aria-hidden>
            +
          </span>
          <span className="studio-dock-btn-label">
            <SketchInk mode="script" intensity={0.35}>
              add
            </SketchInk>
          </span>
        </button>
      </div>
    </div>
  )
}
