'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type InkDocument,
  type InkPoint,
  type InkStroke,
  type InkTool,
  appendStroke,
  brushFor,
  clearStrokes,
  createInkDoc,
  eraseAlongPath,
  makeDrawStroke,
  samplePointerEvent,
  shouldAcceptPointer,
  strokeOutlinePath,
  undoStroke,
  DEFAULT_INK_SIZE,
  INK_STRIP_SIZE,
} from '@/lib/ink'
import { InkToolbar } from './InkToolbar'

/**
 * Author canvas for Kiruk Ink.
 * Can run standalone (own toolbar) or embedded in the vertical notebook
 * (controlled tool from parent, showToolbar=false).
 */
export function InkCanvas({
  initialDoc,
  onDocChange,
  onSave,
  className,
  showToolbar = true,
  tool: toolProp,
  onToolChange,
  penOnly: penOnlyProp,
  onPenOnlyChange,
  enabled = true,
  strip = false,
  color = '#000000',
  transparent = false,
  fitParent = false,
}: {
  initialDoc?: InkDocument
  onDocChange?: (doc: InkDocument) => void
  onSave?: (doc: InkDocument) => void | Promise<void>
  className?: string
  showToolbar?: boolean
  tool?: InkTool
  onToolChange?: (t: InkTool) => void
  penOnly?: boolean
  onPenOnlyChange?: (v: boolean) => void
  /** When false, canvas ignores pointers (e.g. Type mode). */
  enabled?: boolean
  /** Use shorter strip size for vertical notebook. */
  strip?: boolean
  /** Active ink color (default black). */
  color?: string
  /** Skip paper fill so text underneath shows through. */
  transparent?: boolean
  /** Size the ink doc to the parent CSS box (overlay mode). */
  fitParent?: boolean
}) {
  const defaultSize = strip ? INK_STRIP_SIZE : DEFAULT_INK_SIZE
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const docRef = useRef<InkDocument>(initialDoc ?? createInkDoc(defaultSize))
  const [doc, setDoc] = useState<InkDocument>(docRef.current)
  const [innerTool, setInnerTool] = useState<InkTool>('ink')
  const [innerPenOnly, setInnerPenOnly] = useState(true)
  const [saving, setSaving] = useState(false)

  const tool = toolProp ?? innerTool
  const setTool = onToolChange ?? setInnerTool
  const penOnly = penOnlyProp ?? innerPenOnly
  const setPenOnly = onPenOnlyChange ?? setInnerPenOnly

  const drawing = useRef(false)
  const livePoints = useRef<InkPoint[]>([])
  const pointerId = useRef<number | null>(null)

  const commitDoc = useCallback(
    (next: InkDocument) => {
      docRef.current = next
      setDoc(next)
      onDocChange?.(next)
    },
    [onDocChange],
  )

  const paint = useCallback((current: InkDocument, live?: InkPoint[], liveTool?: InkTool, liveColor?: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const { width, height } = current.size
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    if (!transparent) {
      ctx.fillStyle =
        getComputedStyle(canvas).getPropertyValue('--bg-paper').trim() || '#f4f4f0'
      ctx.fillRect(0, 0, width, height)
    }

    const drawStroke = (stroke: InkStroke, last: boolean) => {
      if (stroke.tool === 'eraser' || stroke.points.length === 0) return
      const d = strokeOutlinePath(stroke, last)
      if (!d) return
      const path = new Path2D(d)
      ctx.globalAlpha = stroke.opacity
      ctx.fillStyle = stroke.color || '#000000'
      ctx.fill(path)
      ctx.globalAlpha = 1
    }

    for (const stroke of current.strokes) {
      drawStroke(stroke, true)
    }

    if (live && live.length > 0 && liveTool && liveTool !== 'eraser') {
      const preview = {
        id: 'live',
        ...makeDrawStroke(liveTool, live, 'ink', liveColor || '#000000'),
      }
      drawStroke(preview, false)
    }

    if (live && live.length > 0 && liveTool === 'eraser') {
      const last = live[live.length - 1]
      ctx.beginPath()
      ctx.arc(last.x, last.y, 18, 0, Math.PI * 2)
      ctx.strokeStyle = '#000000'
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }, [transparent])

  useEffect(() => {
    paint(doc)
  }, [doc, paint])

  useEffect(() => {
    if (initialDoc) {
      docRef.current = initialDoc
      setDoc(initialDoc)
      paint(initialDoc)
    }
  }, [initialDoc, paint])

  // Overlay mode: grow the ink doc to match the parent CSS box.
  useEffect(() => {
    if (!fitParent) return
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!parent) return
    const sync = () => {
      const w = Math.max(1, Math.round(parent.clientWidth))
      const h = Math.max(1, Math.round(parent.clientHeight))
      const cur = docRef.current
      if (cur.size.width === w && cur.size.height === h) {
        paint(cur)
        return
      }
      const next = { ...cur, size: { width: w, height: h } }
      docRef.current = next
      setDoc(next)
      // Quiet size update — don't bounce through parent initialDoc sync.
      paint(next)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [fitParent, paint])

  function getRect() {
    return canvasRef.current!.getBoundingClientRect()
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!enabled) return
    if (!shouldAcceptPointer(e.nativeEvent, penOnly)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerId.current = e.pointerId
    drawing.current = true
    livePoints.current = samplePointerEvent(e.nativeEvent, getRect(), docRef.current.size)
    paint(docRef.current, livePoints.current, tool, color)
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!enabled || !drawing.current || pointerId.current !== e.pointerId) return
    if (!shouldAcceptPointer(e.nativeEvent, penOnly)) return
    const pts = samplePointerEvent(e.nativeEvent, getRect(), docRef.current.size)
    livePoints.current = [...livePoints.current, ...pts]
    paint(docRef.current, livePoints.current, tool, color)
  }

  function finishStroke() {
    if (!drawing.current) return
    drawing.current = false
    pointerId.current = null
    const pts = livePoints.current
    livePoints.current = []

    if (pts.length === 0) {
      paint(docRef.current)
      return
    }

    let next = docRef.current
    if (tool === 'eraser') {
      next = eraseAlongPath(next, pts)
    } else {
      next = appendStroke(next, makeDrawStroke(tool, pts, 'ink', color))
    }
    commitDoc(next)
    paint(next)
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (pointerId.current !== e.pointerId) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    finishStroke()
  }

  function onUndo() {
    commitDoc(undoStroke(docRef.current))
  }

  function onClear() {
    if (!confirm('Clear this ink strip?')) return
    commitDoc(clearStrokes(docRef.current))
  }

  async function handleSave() {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(docRef.current)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (tool !== 'eraser') brushFor(tool)
  }, [tool])

  const { width, height } = doc.size

  return (
    <div
      className={className}
      style={{
        color: 'var(--text-main)',
        ...(fitParent ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
      }}
    >
      {showToolbar && (
        <InkToolbar
          tool={tool}
          onToolChange={setTool}
          penOnly={penOnly}
          onPenOnlyChange={setPenOnly}
          canUndo={doc.strokes.length > 0}
          onUndo={onUndo}
          onClear={onClear}
          onSave={onSave ? handleSave : undefined}
          saving={saving}
        />
      )}
      <div
        className={fitParent ? 'absolute inset-0 overflow-hidden' : 'relative w-full overflow-hidden'}
        style={{ touchAction: enabled ? 'none' : 'auto', height: fitParent ? '100%' : undefined }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={fitParent ? 'absolute inset-0 block h-full w-full' : 'block h-auto w-full'}
          style={{
            aspectRatio: fitParent ? undefined : `${width} / ${height}`,
            backgroundColor: 'transparent',
            cursor: enabled ? 'crosshair' : 'default',
            pointerEvents: enabled ? 'auto' : 'none',
            display: 'block',
            width: '100%',
            height: fitParent ? '100%' : undefined,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
    </div>
  )
}
