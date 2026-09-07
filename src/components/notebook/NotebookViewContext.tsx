'use client'

import { createContext, useContext } from 'react'
import {
  DEFAULT_NOTEBOOK_VIEW,
  pageWidthCapEm,
  type NotebookView,
} from '@/lib/notebook'

const NotebookViewContext = createContext<NotebookView>(DEFAULT_NOTEBOOK_VIEW)

export function NotebookViewProvider({
  view,
  children,
}: {
  view: NotebookView
  children: React.ReactNode
}) {
  return (
    <NotebookViewContext.Provider value={view}>{children}</NotebookViewContext.Provider>
  )
}

export function useNotebookView(): NotebookView {
  return useContext(NotebookViewContext)
}

/** Soft measure cap for SketchInk — respects fit / spread. */
export function usePageWidthCapEm(sheetWidthEm?: number): number {
  const view = useNotebookView()
  return pageWidthCapEm(view, sheetWidthEm)
}
