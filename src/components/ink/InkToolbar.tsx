'use client'

import type { InkTool } from '@/lib/ink'
import { StudioIcon } from '@/components/studio/icons'
import { SketchInk } from '@/components/sketch-ink'

const TOOLS: { id: Exclude<InkTool, 'eraser'> | 'eraser'; label: string; icon: 'ink' | 'pencil' | 'eraser' }[] = [
  { id: 'ink', label: 'ink', icon: 'ink' },
  { id: 'pencil', label: 'pencil', icon: 'pencil' },
  { id: 'eraser', label: 'eraser', icon: 'eraser' },
]

function Label({ children }: { children: string }) {
  return (
    <SketchInk mode="script" intensity={0.45} className="studio-tool-label">
      {children}
    </SketchInk>
  )
}

export function InkToolbar({
  tool,
  onToolChange,
  penOnly,
  onPenOnlyChange,
  canUndo,
  onUndo,
  onClear,
  onSave,
  saving,
}: {
  tool: InkTool
  onToolChange: (t: InkTool) => void
  penOnly: boolean
  onPenOnlyChange: (v: boolean) => void
  canUndo: boolean
  onUndo: () => void
  onClear: () => void
  onSave?: () => void
  saving?: boolean
}) {
  return (
    <div className="studio-toolbar flex flex-wrap items-center gap-2 px-3 py-3">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onToolChange(t.id)}
          className={`studio-btn inline-flex items-center gap-1.5 px-3 py-2 ${tool === t.id ? 'studio-btn-active' : ''}`}
          title={t.label}
          aria-pressed={tool === t.id}
        >
          <StudioIcon name={t.icon} size={18} />
          <Label>{t.label}</Label>
        </button>
      ))}

      <span className="mx-0.5 text-lg" style={{ color: 'var(--border-color)' }} aria-hidden>
        /
      </span>

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="studio-btn inline-flex items-center gap-1.5 px-3 py-2 disabled:opacity-35"
        title="Undo"
      >
        <StudioIcon name="undo" size={18} />
        <Label>undo</Label>
      </button>
      <button
        type="button"
        onClick={onClear}
        className="studio-btn inline-flex items-center gap-1.5 px-3 py-2"
        title="Clear"
      >
        <StudioIcon name="clear" size={18} />
        <Label>clear</Label>
      </button>

      <label
        className="ml-1 inline-flex cursor-pointer items-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        <input
          type="checkbox"
          checked={penOnly}
          onChange={(e) => onPenOnlyChange(e.target.checked)}
        />
        <StudioIcon name="pen" size={16} />
        <Label>pen only</Label>
      </label>

      <span className="flex-1" />

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="studio-btn studio-btn-active inline-flex items-center gap-1.5 px-3.5 py-2 disabled:opacity-40"
        >
          <StudioIcon name="save" size={18} />
          <Label>{saving ? 'saving…' : 'save ink'}</Label>
        </button>
      )}
    </div>
  )
}
