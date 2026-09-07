'use client'

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { NotebookShell } from './NotebookShell'
import { NotebookSpread } from './NotebookSpread'
import {
  parseNotebookView,
  type NotebookView,
} from '@/lib/notebook'

function flattenReadableChildren(children: ReactNode): ReactNode[] {
  const list: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (child == null || child === false) return
    if (isValidElement(child)) {
      const nested = (child.props as { children?: ReactNode }).children
      if (nested != null) {
        const nestedList: ReactNode[] = []
        Children.forEach(nested, (n) => {
          if (n != null && n !== false) nestedList.push(n)
        })
        // Unwrap a single layout host into block-level children for pagination.
        if (nestedList.length > 1 && typeof child.type === 'string') {
          list.push(...nestedList)
          return
        }
      }
    }
    list.push(child)
  })
  return list.length > 0 ? list : [children]
}

/**
 * Reader-side notebook body: applies skins; in spread mode, buckets block-level
 * children into pages and flips like a book.
 */
export function NotebookReaderBody({
  frontmatter,
  children,
  className = '',
}: {
  frontmatter: Record<string, unknown>
  children: ReactNode
  className?: string
}) {
  const view = useMemo(() => parseNotebookView(frontmatter), [frontmatter])
  const [fitOverride, setFitOverride] = useState<boolean | null>(null)
  const effective: NotebookView = {
    ...view,
    fit: fitOverride ?? view.fit,
  }

  if (effective.layout !== 'spread') {
    return (
      <NotebookShell view={effective} className={`notebook-reader-body ${className}`.trim()}>
        <div className="notebook-scroll-sheet">{children}</div>
        <ReaderFitChip
          fit={effective.fit}
          onToggle={() => setFitOverride(!(fitOverride ?? view.fit))}
        />
      </NotebookShell>
    )
  }

  return (
    <NotebookShell view={effective} className={`notebook-reader-body ${className}`.trim()}>
      <SpreadFromChildren>{children}</SpreadFromChildren>
      <ReaderFitChip
        fit={effective.fit}
        onToggle={() => setFitOverride(!(fitOverride ?? view.fit))}
      />
    </NotebookShell>
  )
}

function ReaderFitChip({ fit, onToggle }: { fit: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`notebook-reader-fit-chip ${fit ? 'is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={fit}
    >
      {fit ? 'Fit · on' : 'Fit · off'}
    </button>
  )
}

/**
 * Measure block children into page-height buckets (client). Falls back to
 * one-child-per-page until measured.
 */
function SpreadFromChildren({ children }: { children: ReactNode }) {
  const probeRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<ReactNode[] | null>(null)

  const childList = useMemo(() => flattenReadableChildren(children), [children])

  useEffect(() => {
    const root = probeRef.current
    if (!root) return

    const measure = () => {
      const nodes = Array.from(root.children) as HTMLElement[]
      if (nodes.length === 0) {
        setPages([null])
        return
      }
      const pageH = Math.max(320, Math.min(720, window.innerHeight * 0.72))
      const buckets: ReactNode[][] = []
      let bucket: ReactNode[] = []
      let used = 0

      nodes.forEach((el, i) => {
        const h = el.getBoundingClientRect().height || 48
        if (bucket.length > 0 && used + h > pageH) {
          buckets.push(bucket)
          bucket = []
          used = 0
        }
        bucket.push(childList[i])
        used += h
      })
      if (bucket.length > 0) buckets.push(bucket)

      setPages(
        buckets.map((b, i) => (
          <div key={`page-${i}`} className="notebook-spread-page-stack">
            {b}
          </div>
        )),
      )
    }

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(root)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [childList])

  return (
    <>
      <div ref={probeRef} className="notebook-spread-probe" aria-hidden>
        {childList.map((c, i) => (
          <div key={isValidElement(c) && c.key != null ? String(c.key) : i}>{c}</div>
        ))}
      </div>
      <NotebookSpread pages={pages ?? childList.map((c, i) => <div key={i}>{c}</div>)} />
    </>
  )
}
