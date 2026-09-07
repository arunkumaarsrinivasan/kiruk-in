/**
 * Notebook geometry view — scroll (infinite vertical) vs spread (book flip).
 * Persisted on frontmatter; shared by studio + reader.
 */

export type NotebookLayout = 'scroll' | 'spread'
export type NotebookRuler = 'none' | 'margin' | 'ruled'
export type NotebookPaper = 'clean' | 'rough'

export interface NotebookView {
  layout: NotebookLayout
  ruler: NotebookRuler
  paper: NotebookPaper
  /** Fit sheet/spread to the viewport (full-width rectangle). */
  fit: boolean
}

export const DEFAULT_NOTEBOOK_VIEW: NotebookView = {
  layout: 'scroll',
  ruler: 'none',
  paper: 'clean',
  fit: false,
}

const LAYOUTS = new Set<NotebookLayout>(['scroll', 'spread'])
const RULERS = new Set<NotebookRuler>(['none', 'margin', 'ruled'])
const PAPERS = new Set<NotebookPaper>(['clean', 'rough'])

function asLayout(v: unknown): NotebookLayout | undefined {
  return typeof v === 'string' && LAYOUTS.has(v as NotebookLayout)
    ? (v as NotebookLayout)
    : undefined
}
function asRuler(v: unknown): NotebookRuler | undefined {
  return typeof v === 'string' && RULERS.has(v as NotebookRuler)
    ? (v as NotebookRuler)
    : undefined
}
function asPaper(v: unknown): NotebookPaper | undefined {
  return typeof v === 'string' && PAPERS.has(v as NotebookPaper)
    ? (v as NotebookPaper)
    : undefined
}
function asBool(v: unknown): boolean | undefined {
  if (v === true || v === false) return v
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

/**
 * Resolve notebook view from frontmatter.
 * Accepts nested `notebook: { … }` or flat `notebookLayout` / etc.
 */
export function parseNotebookView(
  fm: Record<string, unknown> | null | undefined,
): NotebookView {
  if (!fm) return { ...DEFAULT_NOTEBOOK_VIEW }
  const nested =
    fm.notebook && typeof fm.notebook === 'object' && !Array.isArray(fm.notebook)
      ? (fm.notebook as Record<string, unknown>)
      : null

  return {
    layout:
      asLayout(nested?.layout) ??
      asLayout(fm.notebookLayout) ??
      DEFAULT_NOTEBOOK_VIEW.layout,
    ruler:
      asRuler(nested?.ruler) ??
      asRuler(fm.notebookRuler) ??
      DEFAULT_NOTEBOOK_VIEW.ruler,
    paper:
      asPaper(nested?.paper) ??
      asPaper(fm.notebookPaper) ??
      DEFAULT_NOTEBOOK_VIEW.paper,
    fit:
      asBool(nested?.fit) ??
      asBool(fm.notebookFit) ??
      DEFAULT_NOTEBOOK_VIEW.fit,
  }
}

/** Nested object for save — keeps MDX frontmatter tidy. */
export function notebookViewToFrontmatter(view: NotebookView): {
  notebook: {
    layout: NotebookLayout
    ruler: NotebookRuler
    paper: NotebookPaper
    fit: boolean
  }
} {
  return {
    notebook: {
      layout: view.layout,
      ruler: view.ruler,
      paper: view.paper,
      fit: view.fit,
    },
  }
}

/** CSS class tokens for skins / layout. */
export function notebookViewClassName(view: NotebookView): string {
  return [
    'notebook-shell',
    `notebook-layout-${view.layout}`,
    `notebook-ruler-${view.ruler}`,
    `notebook-paper-${view.paper}`,
    view.fit ? 'notebook-fit' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Data attributes for CSS hooks. */
export function notebookViewDataAttrs(view: NotebookView): Record<string, string> {
  return {
    'data-notebook-layout': view.layout,
    'data-notebook-ruler': view.ruler,
    'data-notebook-paper': view.paper,
    'data-notebook-fit': view.fit ? 'true' : 'false',
  }
}

/**
 * Soft page-width cap (em). Fit / spread unlock a wider measure so sheets can
 * fill the viewport; scroll default keeps the readable 36em column.
 * When `sheetWidthEm` is measured, that value always wins.
 */
export function pageWidthCapEm(view: NotebookView, sheetWidthEm?: number): number {
  if (sheetWidthEm != null && sheetWidthEm > 0) return sheetWidthEm
  if (view.layout === 'spread') return view.fit ? 28 : 26
  // Fit: high ceiling so layoutPretext Math.min does not clip measured CSS width.
  if (view.fit) return 96
  return 36
}

/** Nominal sheet height in em for spread pagination. */
export const SPREAD_PAGE_HEIGHT_EM = 32

/** Build spreads from a flat list of page slots (L,R,L,R…). */
export function spreadsFromPages<T>(pages: T[]): Array<{ left: T; right: T | null }> {
  const out: Array<{ left: T; right: T | null }> = []
  for (let i = 0; i < pages.length; i += 2) {
    out.push({ left: pages[i]!, right: pages[i + 1] ?? null })
  }
  if (out.length === 0) {
    // Always at least one empty spread for writing.
    out.push({ left: null as unknown as T, right: null })
  }
  return out
}

/**
 * Split an ordered list of items into page buckets by estimated height.
 * `heightOf` returns em height for each item.
 */
export function paginateByHeight<T>(
  items: T[],
  pageHeightEm: number,
  heightOf: (item: T) => number,
): T[][] {
  const pages: T[][] = []
  let current: T[] = []
  let used = 0
  const h = Math.max(4, pageHeightEm)

  for (const item of items) {
    const itemH = Math.max(0.5, heightOf(item))
    if (current.length > 0 && used + itemH > h) {
      pages.push(current)
      current = []
      used = 0
    }
    current.push(item)
    used += itemH
  }
  if (current.length > 0 || pages.length === 0) pages.push(current)
  return pages
}
