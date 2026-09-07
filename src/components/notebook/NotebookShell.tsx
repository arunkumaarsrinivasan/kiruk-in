'use client'

import {
  notebookViewClassName,
  notebookViewDataAttrs,
  type NotebookView,
} from '@/lib/notebook'

/**
 * Shared paper frame — applies layout / ruler / paper / fit data attrs.
 * Studio and reader both wrap sheet content in this shell.
 */
export function NotebookShell({
  view,
  className = '',
  children,
  style,
}: {
  view: NotebookView
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`${notebookViewClassName(view)} ${className}`.trim()}
      style={style}
      {...notebookViewDataAttrs(view)}
    >
      {children}
    </div>
  )
}
