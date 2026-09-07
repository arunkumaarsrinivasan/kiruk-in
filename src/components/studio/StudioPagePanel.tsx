'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ScribbleStroke } from '@/components/studio/ScribbleBox'
import type {
  NotebookLayout,
  NotebookPaper,
  NotebookRuler,
  NotebookView,
} from '@/lib/notebook'

/**
 * Bottom-right Page control — compact geometry / paper / fit.
 * Quiet tool chrome (not SketchInk) so it stays out of the notebook.
 */
export function StudioPagePanel({
  view,
  onChange,
}: {
  view: NotebookView
  onChange: (next: NotebookView) => void
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const patch = (partial: Partial<NotebookView>) => onChange({ ...view, ...partial })

  if (!mounted) return null as ReactNode

  return createPortal(
    <div className="studio-page-panel" data-open={open ? 'true' : 'false'}>
      {open && (
        <div
          className="studio-page-panel-sheet scribble-box"
          role="dialog"
          aria-label="Page view"
          style={{ transformOrigin: 'bottom right' }}
        >
          <ScribbleStroke seed="page-panel" tone="chalk" />
          <header className="studio-page-panel-head">
            <span className="studio-page-panel-title">Page · Paper</span>
            <button
              type="button"
              className="studio-page-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="studio-page-panel-body">
            <Row label="Layout">
              <Seg
                ariaLabel="Layout"
                value={view.layout}
                options={[
                  { id: 'scroll' as NotebookLayout, label: 'Scroll', icon: <IconScroll /> },
                  { id: 'spread' as NotebookLayout, label: 'Spread', icon: <IconSpread /> },
                ]}
                onChange={(layout) =>
                  patch({ layout, fit: layout === 'spread' ? true : view.fit })
                }
              />
            </Row>

            <Row label="Fit">
              <button
                type="button"
                role="switch"
                aria-checked={view.fit}
                aria-label="Fit to screen"
                className={`studio-page-switch ${view.fit ? 'is-on' : ''}`}
                onClick={() => patch({ fit: !view.fit })}
              >
                <span className="studio-page-switch-knob" aria-hidden />
              </button>
            </Row>

            <Row label="Ruler">
              <Seg
                ariaLabel="Ruler"
                value={view.ruler}
                options={[
                  { id: 'none' as NotebookRuler, label: 'None', icon: <IconRulerNone /> },
                  { id: 'margin' as NotebookRuler, label: 'Margin', icon: <IconRulerMargin /> },
                  { id: 'ruled' as NotebookRuler, label: 'Ruled', icon: <IconRulerRuled /> },
                ]}
                onChange={(ruler) => patch({ ruler })}
              />
            </Row>

            <Row label="Paper">
              <Seg
                ariaLabel="Paper"
                value={view.paper}
                options={[
                  { id: 'clean' as NotebookPaper, label: 'Clean', icon: <IconPaperClean /> },
                  { id: 'rough' as NotebookPaper, label: 'Rough', icon: <IconPaperRough /> },
                ]}
                onChange={(paper) => patch({ paper })}
              />
            </Row>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`studio-page-fab scribble-box ${open ? 'is-open scribble-box--fill' : ''}`}
        aria-expanded={open}
        aria-label="Page view options"
        onClick={() => setOpen((v) => !v)}
      >
        <ScribbleStroke
          seed="page-fab"
          tone={open ? 'ink' : 'chalk'}
          mode={open ? 'fill' : 'stroke'}
        />
        <IconPage />
        <span className="studio-page-fab-label">Page</span>
      </button>
    </div>,
    document.body,
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="studio-page-row">
      <span className="studio-page-row-label">{label}</span>
      <div className="studio-page-row-ctrl">{children}</div>
    </div>
  )
}

function Seg<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: Array<{ id: T; label: string; icon: ReactNode }>
  onChange: (next: T) => void
  ariaLabel: string
}) {
  return (
    <div className="studio-page-seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          aria-label={opt.label}
          title={opt.label}
          className={`studio-page-seg-btn ${value === opt.id ? 'is-on' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          <span className="studio-page-seg-icon">{opt.icon}</span>
          <span className="studio-page-seg-text">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Tiny line icons (1.5px stroke, currentColor) ── */

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconPage() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="1.5" width="9" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 4.5h4M5 7h4M5 9.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconScroll() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="4" y="1.5" width="6" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconSpread() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="5" height="9" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="7.5" y="2.5" width="5" height="9" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconRulerNone() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconRulerMargin() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 2.5v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

function IconRulerRuled() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 5.5h6M4 7.5h6M4 9.5h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
    </svg>
  )
}

function IconPaperClean() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.06" />
    </svg>
  )
}

function IconPaperRough() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="5.5" r="0.6" fill="currentColor" opacity="0.45" />
      <circle cx="7.5" cy="7" r="0.55" fill="currentColor" opacity="0.4" />
      <circle cx="9.2" cy="5.2" r="0.5" fill="currentColor" opacity="0.35" />
      <circle cx="5.8" cy="9" r="0.55" fill="currentColor" opacity="0.4" />
      <circle cx="8.5" cy="8.8" r="0.5" fill="currentColor" opacity="0.35" />
    </svg>
  )
}
