'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { InkCanvas } from '@/components/ink/InkCanvas'
import {
  type InkDocument,
  type InkTool,
  createInkDoc,
  deserialize,
  INK_STRIP_SIZE,
} from '@/lib/ink'
import {
  type NotebookBlock,
  blocksToMdx,
  emptyNotebook,
  newImageBlock,
  newInkBlock,
  newTextBlock,
  parseMdxToBlocks,
} from '@/lib/studio/notebook-blocks'
import { StudioIcon } from '@/components/studio/icons'
import { ScribbleStroke } from '@/components/studio/ScribbleBox'
import {
  SketchInk,
  SketchInkField,
  SketchInkInlineField,
  SketchActionChrome,
  type SketchAction,
} from '@/components/sketch-ink'
import {
  StudioContextMenu,
  type ContextMenuState,
  type SurfaceTool,
} from '@/components/studio/StudioContextMenu'
import { StudioToolDock } from '@/components/studio/StudioToolDock'
import { StudioPagePanel } from '@/components/studio/StudioPagePanel'
import {
  NotebookShell,
  NotebookSpread,
  NotebookViewProvider,
} from '@/components/notebook'
import {
  DEFAULT_NOTEBOOK_VIEW,
  SPREAD_PAGE_HEIGHT_EM,
  notebookViewToFrontmatter,
  paginateByHeight,
  parseNotebookView,
  type NotebookView,
} from '@/lib/notebook'
import type { LineAlign } from '@/lib/sketch-ink/config'

function estimateBlockHeightEm(b: NotebookBlock): number {
  if (b.type === 'ink') return 10
  if (b.type === 'image') return 14
  const newlines = (b.text.match(/\n/g) ?? []).length
  const chars = b.text.length
  const lines = Math.max(1, Math.ceil(chars / 38) + newlines)
  return lines * 1.95 + 0.8
}

function ToolLabel({ children, intensity = 0.4 }: { children: string; intensity?: number }) {
  return (
    <SketchInk mode="script" intensity={intensity} className="studio-tool-label">
      {children}
    </SketchInk>
  )
}

type Collection = 'blog' | 'notes'

/**
 * Notebook surface — quiet chrome, floating tool dock, right-click for style.
 */
export function Editor({ collection, slug }: { collection: Collection; slug: string }) {
  const router = useRouter()
  const originalFm = useRef<Record<string, unknown>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inkDocs = useRef<Map<string, InkDocument>>(new Map())

  const [loaded, setLoaded] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [draft, setDraft] = useState(true)
  const [blocks, setBlocks] = useState<NotebookBlock[]>([])
  const [tool, setTool] = useState<SurfaceTool>('type')
  const [writeAction, setWriteAction] = useState<SketchAction>('type')
  const [penOnly, setPenOnly] = useState(true)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [menu, setMenu] = useState<ContextMenuState>(null)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [notebookView, setNotebookView] = useState<NotebookView>(DEFAULT_NOTEBOOK_VIEW)
  const [spreadIndex, setSpreadIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const doc = await fetch(`/api/studio/posts?collection=${collection}&slug=${slug}`).then((r) =>
        r.json(),
      )
      if (cancelled) return
      if (doc.error) {
        setStatus(doc.error)
        return
      }
      const fm = doc.frontmatter ?? {}
      originalFm.current = fm
      setTitle(String(fm.title ?? ''))
      setExcerpt(String(fm.excerpt ?? ''))
      setDraft(fm.draft === true)
      setNotebookView(parseNotebookView(fm))

      const parsed = parseMdxToBlocks(String(doc.body ?? ''))
      const hydrated: NotebookBlock[] = []

      for (const b of parsed) {
        if (b.type === 'ink' && b.src) {
          const jsonUrl = b.src.replace(/\.svg$/i, '.json')
          try {
            const raw = await fetch(jsonUrl).then((r) => (r.ok ? r.text() : null))
            if (raw) {
              const inkDoc = deserialize(raw)
              inkDocs.current.set(b.id, inkDoc)
              hydrated.push({ ...b, doc: inkDoc })
              continue
            }
          } catch {
            /* start empty strip */
          }
        }
        if (b.type === 'text' && b.inkSrc) {
          const jsonUrl = b.inkSrc.replace(/\.svg$/i, '.json')
          try {
            const raw = await fetch(jsonUrl).then((r) => (r.ok ? r.text() : null))
            if (raw) {
              const inkDoc = deserialize(raw)
              inkDocs.current.set(b.id, inkDoc)
              hydrated.push({ ...b, inkDoc })
              continue
            }
          } catch {
            /* empty overlay */
          }
        }
        if (b.type === 'ink' && !b.doc) {
          const blank = createInkDoc(INK_STRIP_SIZE)
          inkDocs.current.set(b.id, blank)
          hydrated.push({ ...b, doc: blank })
        } else {
          hydrated.push(b)
        }
      }

      if (hydrated.length === 0) {
        const starter = emptyNotebook()
        for (const b of starter) {
          if (b.type === 'ink') {
            const blank = createInkDoc(INK_STRIP_SIZE)
            inkDocs.current.set(b.id, blank)
            hydrated.push({ ...b, doc: blank })
          } else hydrated.push(b)
        }
      }

      setBlocks(hydrated)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [collection, slug])

  // Figma-like tool keys when not typing in a field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'v' || k === 't') {
        e.preventDefault()
        setTool('type')
      } else if (k === 'p') {
        e.preventDefault()
        setTool('ink')
      } else if (k === 'b') {
        e.preventDefault()
        setTool('pencil')
      } else if (k === 'e') {
        e.preventDefault()
        setTool('eraser')
      } else if (k === 'i') {
        e.preventDefault()
        setTool('ink')
        setStatus('Draw on the page')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const updateBlock = useCallback((id: string, patch: Partial<NotebookBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as NotebookBlock) : b)))
  }, [])

  /** Set the focused text block's per-line alignment (block-level). */
  const setBlockAlign = useCallback(
    (id: string, align: LineAlign) => updateBlock(id, { align }),
    [updateBlock],
  )

  /** Toggle flow arrows on the focused text block (simple chain between lines). */
  const toggleBlockFlow = useCallback(
    (id: string) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== id || b.type !== 'text') return b
          const hasFlow = !!(b.flow && b.flow.length)
          // Naive chain: arrow from each line to the next. Line count is unknown
          // until layout; the surface tolerates arrows whose targets exceed
          // the line count (they're just skipped).
          const flow = hasFlow
            ? []
            : Array.from({ length: 8 }, (_, i) => ({ fromLine: i, toLine: i + 1 }))
          return { ...b, flow }
        }),
      )
    },
    [],
  )

  /** Phase 8: choosing flow action turns on line-link arrows for the focused block. */
  useEffect(() => {
    if (writeAction !== 'flow' || !focusedBlockId) return
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== focusedBlockId || b.type !== 'text') return b
        if (b.flow && b.flow.length) return b
        return {
          ...b,
          flow: Array.from({ length: 8 }, (_, i) => ({ fromLine: i, toLine: i + 1 })),
        }
      }),
    )
  }, [writeAction, focusedBlockId])

  const setInkDoc = useCallback((blockId: string, doc: InkDocument) => {
    inkDocs.current.set(blockId, doc)
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b
        if (b.type === 'ink') return { ...b, doc }
        if (b.type === 'text') return { ...b, inkDoc: doc }
        return b
      }),
    )
  }, [])

  function addText() {
    setBlocks((prev) => [...prev, newTextBlock('')])
    setTool('type')
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  function addDraw() {
    const block = newInkBlock()
    const blank = createInkDoc(INK_STRIP_SIZE)
    inkDocs.current.set(block.id, blank)
    setBlocks((prev) => [...prev, { ...block, doc: blank }])
    setTool('ink')
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  async function uploadShot(file: File, afterId?: string) {
    setStatus('uploading…')
    const dataUrl: string = await new Promise((res) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result))
      r.readAsDataURL(file)
    })
    const json = await fetch('/api/studio/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, slug, dataUrl, filename: file.name }),
    }).then((r) => r.json())
    if (!json.src) {
      setStatus(json.error || 'upload failed')
      return
    }
    const img = newImageBlock(json.src)
    setBlocks((prev) => {
      if (!afterId) return [...prev, img]
      const i = prev.findIndex((b) => b.id === afterId)
      if (i < 0) return [...prev, img]
      const next = [...prev]
      next.splice(i + 1, 0, img)
      return next
    })
    setStatus(`shot → ${json.src}`)
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev
      inkDocs.current.delete(id)
      return prev.filter((b) => b.id !== id)
    })
  }

  const saveAll = useCallback(
    async (opts?: { draft?: boolean }) => {
      setSaving(true)
      setStatus('saving page…')
      try {
        const nextBlocks = [...blocks]
        for (let i = 0; i < nextBlocks.length; i++) {
          const b = nextBlocks[i]
          if (b.type === 'ink') {
            const doc = inkDocs.current.get(b.id) ?? b.doc
            if (!doc || doc.strokes.length === 0) continue
            const res = await fetch('/api/studio/ink-save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                collection,
                slug,
                doc,
                id: b.inkId,
              }),
            }).then((r) => r.json())
            if (res.src) {
              nextBlocks[i] = {
                ...b,
                src: res.src,
                inkId: res.id,
                doc,
              }
              inkDocs.current.set(b.id, doc)
            }
            continue
          }

          // Persist full-block ink overlay on text surfaces.
          if (b.type === 'text') {
            const doc = inkDocs.current.get(b.id) ?? b.inkDoc
            if (!doc || doc.strokes.length === 0) continue
            const res = await fetch('/api/studio/ink-save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                collection,
                slug,
                doc,
                id: b.inkId,
              }),
            }).then((r) => r.json())
            if (res.src) {
              nextBlocks[i] = {
                ...b,
                inkSrc: res.src,
                inkId: res.id,
                inkDoc: doc,
              }
              inkDocs.current.set(b.id, doc)
            }
          }
        }

        setBlocks(nextBlocks)
        const body = blocksToMdx(nextBlocks)
        const nextDraft = opts?.draft ?? draft
        const frontmatter = {
          ...originalFm.current,
          title,
          excerpt,
          draft: nextDraft,
          ...notebookViewToFrontmatter(notebookView),
        }
        const res = await fetch('/api/studio/posts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection, slug, frontmatter, body }),
        })
        if (!res.ok) {
          setStatus('save failed')
          return
        }
        setDraft(nextDraft)
        originalFm.current = frontmatter
        setStatus(`saved ${new Date().toLocaleTimeString()}`)
      } finally {
        setSaving(false)
      }
    },
    [blocks, collection, slug, title, excerpt, draft, notebookView],
  )

  const openMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    const pad = 8
    const w = 220
    const h = 420
    const x = Math.min(e.clientX, window.innerWidth - w - pad)
    const y = Math.min(e.clientY, window.innerHeight - h - pad)
    setMenu({ x: Math.max(pad, x), y: Math.max(pad, y) })
  }, [])

  if (!loaded) {
    return (
      <div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading… {status}
      </div>
    )
  }

  const drawMode = tool === 'ink' || tool === 'pencil' || tool === 'eraser'

  const renderStudioBlock = (block: NotebookBlock, index: number) => (
    <div
      key={block.id}
      className="group relative w-full"
      onPointerDown={() => {
        if (block.type === 'ink') setTool((t) => (t === 'type' ? 'ink' : t))
        if (block.type === 'text') {
          setFocusedBlockId(block.id)
          if (!drawMode) setTool('type')
        }
      }}
    >
      <button
        type="button"
        onClick={() => removeBlock(block.id)}
        className="absolute right-2 top-2 z-10 hidden p-1.5 opacity-50 hover:opacity-100 group-hover:block"
        style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
        title="Remove"
      >
        <StudioIcon name="remove" size={14} />
      </button>

      {block.type === 'text' && (
        <>
          <SketchInkInlineField
            value={block.text}
            onChange={(text) => updateBlock(block.id, { text })}
            onFocus={() => setFocusedBlockId(block.id)}
            placeholder={
              index === 0
                ? drawMode
                  ? 'Draw on the page…'
                  : 'Write… ink/pencil draw on this page · V write · P ink'
                : drawMode
                  ? 'Draw here…'
                  : 'Keep writing…'
            }
            mode="auto"
            intensity={0.95}
            action={writeAction}
            align={block.align}
            flow={block.flow}
            seedKey={`${collection}/${slug}/text-${block.id}`}
            drawTool={drawMode ? (tool as InkTool) : null}
            inkDoc={block.inkDoc ?? inkDocs.current.get(block.id)}
            onInkChange={(doc) => {
              inkDocs.current.set(block.id, doc)
            }}
            className="notebook-text px-5 sm:px-8 md:px-12"
            aria-label="Notebook text"
          />
          <div className="px-5 sm:px-8 md:px-12">
            <SketchActionChrome action={writeAction} />
          </div>
        </>
      )}

      {block.type === 'ink' && (
        <div className={`notebook-ink w-full ${drawMode ? 'is-draw' : ''}`}>
          <InkCanvas
            key={block.id}
            initialDoc={inkDocs.current.get(block.id) ?? block.doc}
            strip
            showToolbar={false}
            enabled={drawMode}
            tool={(drawMode ? tool : 'ink') as InkTool}
            penOnly={penOnly}
            onDocChange={(doc) => setInkDoc(block.id, doc)}
            className="w-full"
          />
        </div>
      )}

      {block.type === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.src} alt={block.alt ?? ''} className="notebook-image" />
      )}
    </div>
  )

  return (
    <div className="studio-surface relative flex h-dvh max-h-dvh flex-col">
      {/* Quiet top bar — one sketchnote frame; chips inside keep their own */}
      <header className="studio-toolbar studio-toolbar--slim scribble-box scribble-box--bar relative z-40 flex shrink-0 items-center gap-2 px-3 py-2">
        <ScribbleStroke seed="studio-toolbar" tone="chalk" weight="bar" />
        <div className="flex min-w-0 items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => router.push('/studio')}
            className="studio-btn studio-btn--quiet inline-flex items-center gap-1.5 px-2 py-1.5"
            title="Back to paper desk"
          >
            <StudioIcon name="back" size={16} />
            <ToolLabel intensity={0.35}>paper</ToolLabel>
          </button>

          <span
            className="studio-toolbar-meta hidden max-w-[12rem] truncate sm:inline"
            title={status || `${collection}/${slug}`}
          >
            {status || `${collection}/${slug}`}
          </span>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <StudioToolDock
            tool={tool}
            writeAction={writeAction}
            onTool={setTool}
            onWriteAction={setWriteAction}
            onAddText={addText}
            onAddDraw={addDraw}
            onAddShot={() => fileRef.current?.click()}
            onAddDoodle={() => {
              setTool('ink')
              setStatus('Draw on the page')
            }}
            onOpenMenu={openMenu}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => saveAll()}
            disabled={saving}
            className="studio-btn scribble-box scribble-box--fill inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:opacity-40"
            title="Save"
          >
            <ScribbleStroke seed="toolbar-save" tone="ink" mode="fill" />
            <StudioIcon name="save" size={16} />
            <span className="hidden sm:inline">
              <ToolLabel intensity={0.35}>{saving ? 'saving…' : 'save'}</ToolLabel>
            </span>
          </button>
          <button
            type="button"
            onClick={() => saveAll({ draft: !draft })}
            disabled={saving}
            className="studio-btn studio-btn-active scribble-box scribble-box--fill inline-flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40"
          >
            <ScribbleStroke seed="toolbar-publish" tone="ink" mode="fill" />
            <StudioIcon name="publish" size={16} />
            <ToolLabel intensity={0.4}>{draft ? 'publish' : 'unpublish'}</ToolLabel>
          </button>
        </div>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) uploadShot(f)
        }}
      />

      <NotebookViewProvider view={notebookView}>
      <StudioPagePanel view={notebookView} onChange={setNotebookView} />
      <div
        ref={scrollRef}
        className={`min-h-0 flex-1 overflow-y-auto px-3 md:px-5 ${notebookView.layout === 'spread' ? 'overflow-x-hidden' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const file = [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith('image/'))
          if (!file) return
          e.preventDefault()
          uploadShot(file)
        }}
        onContextMenu={openMenu}
      >
        <NotebookShell
          view={notebookView}
          className={
            notebookView.layout === 'spread'
              ? 'mx-auto w-full px-2 py-3 md:px-4'
              : undefined
          }
        >
        <div
          className={
            notebookView.layout === 'spread'
              ? 'notebook-sheet notebook-sheet--spread mx-auto w-full md:my-2'
              : `notebook-sheet mx-auto w-full md:my-4 md:min-h-[calc(100dvh-4rem)] ${
                  notebookView.fit ? 'max-w-none' : 'max-w-4xl'
                }`
          }
        >
          <div
            className="flex w-full flex-col gap-2 border-b px-5 pb-5 pt-8 sm:px-8 md:px-12"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <SketchInkField
              value={title}
              onChange={setTitle}
              onFocus={() => setTool('type')}
              placeholder="Untitled"
              mode="auto"
              intensity={0.9}
              action="title"
              seedKey={`${collection}/${slug}/title`}
              multiline={false}
              className="studio-title text-3xl md:text-5xl"
              aria-label="Page title"
            />
            <SketchInkField
              value={excerpt}
              onChange={setExcerpt}
              onFocus={() => setTool('type')}
              placeholder="one-line excerpt…"
              mode="script"
              intensity={0.8}
              action="excerpt"
              seedKey={`${collection}/${slug}/excerpt`}
              multiline={false}
              className="text-xl"
              aria-label="Excerpt"
            />
          </div>

          {notebookView.layout === 'spread' ? (
            (() => {
              const pages = paginateByHeight(blocks, SPREAD_PAGE_HEIGHT_EM, estimateBlockHeightEm)
              // Ensure even page count so last spread has a right sheet slot.
              const padded =
                pages.length % 2 === 1 ? [...pages, [] as NotebookBlock[]] : pages
              const pageNodes = padded.map((pageBlocks, pageIdx) => (
                <div key={`sheet-${pageIdx}`} className="notebook-spread-page-stack">
                  {pageBlocks.map((block) => renderStudioBlock(block, blocks.indexOf(block)))}
                  {pageBlocks.length === 0 && (
                    <p className="notebook-spread-empty px-5">
                      <SketchInk mode="script" intensity={0.3}>
                        Blank page
                      </SketchInk>
                    </p>
                  )}
                </div>
              ))
              return (
                <>
                  <NotebookSpread
                    pages={pageNodes}
                    onSpreadChange={setSpreadIndex}
                    emptyLabel="Blank page"
                  />
                  <button
                    type="button"
                    className="notebook-grow"
                    onClick={() => {
                      // New spread: add two empty text blocks to fill next L+R.
                      addText()
                      requestAnimationFrame(() => addText())
                      setStatus(`spread ${spreadIndex + 1} · added pages`)
                    }}
                  >
                    <span>
                      <SketchInk mode="script" intensity={0.35}>
                        {drawMode ? 'Extend draw' : 'Add pages · flip with ← →'}
                      </SketchInk>
                    </span>
                  </button>
                </>
              )
            })()
          ) : (
            <>
              {blocks.map((block, index) => renderStudioBlock(block, index))}
              <button
                type="button"
                className="notebook-grow"
                onClick={() => {
                  if (drawMode) addDraw()
                  else addText()
                }}
              >
                <span>
                  <SketchInk mode="script" intensity={0.35}>
                    {drawMode ? 'Extend draw' : 'Extend page · right-click anywhere'}
                  </SketchInk>
                </span>
              </button>
            </>
          )}
        </div>
        </NotebookShell>
      </div>
      </NotebookViewProvider>

      <StudioContextMenu
        menu={menu}
        onClose={() => setMenu(null)}
        tool={tool}
        writeAction={writeAction}
        penOnly={penOnly}
        onTool={setTool}
        onWriteAction={setWriteAction}
        onPenOnly={setPenOnly}
        onAddText={addText}
        onAddDraw={addDraw}
        onAddShot={() => fileRef.current?.click()}
        onAddDoodle={() => {
          setTool('ink')
          setStatus('Draw on the page')
        }}
        blockAlign={
          focusedBlockId
            ? (blocks.find((b) => b.id === focusedBlockId && b.type === 'text') as
                | Extract<NotebookBlock, { type: 'text' }>
                | undefined)?.align
            : undefined
        }
        onBlockAlign={
          focusedBlockId
            ? (a: LineAlign) => setBlockAlign(focusedBlockId, a)
            : undefined
        }
        blockFlow={
          focusedBlockId
            ? !!(blocks.find((b) => b.id === focusedBlockId && b.type === 'text') as
                | Extract<NotebookBlock, { type: 'text' }>
                | undefined)?.flow?.length
            : false
        }
        onToggleBlockFlow={
          focusedBlockId ? () => toggleBlockFlow(focusedBlockId) : undefined
        }
      />
    </div>
  )
}
