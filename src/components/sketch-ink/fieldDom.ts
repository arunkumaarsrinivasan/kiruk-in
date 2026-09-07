/**
 * Shared DOM helpers for SketchInk fields.
 *
 * The mirror paints word spans carrying `data-sketch-start` / `data-sketch-end`
 * (code-unit offsets into the field's flat source string) with real Text
 * nodes inside. These helpers turn caret/selection indices into DOM Ranges
 * so the invisible-textarea engine can render a custom caret + selection wash
 * over the painted glyphs.
 *
 * Used by both `SketchInkField` (plain text) and `SketchInkInlineField`
 * (sentinel-encoded InlineDoc). The contract is identical: offsets index into
 * whatever flat string the field's textarea holds.
 */

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function firstTextNode(el: HTMLElement): Text | null {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  return walk.nextNode() as Text | null
}

/**
 * Find the Text node + local offset inside a `[data-sketch-start]` run that
 * corresponds to the given source index. Returns null if no run covers it.
 */
export function pointInMirror(
  mirror: HTMLElement,
  index: number,
): { node: Text; offset: number } | null {
  const runs = mirror.querySelectorAll<HTMLElement>('[data-sketch-start]')
  for (const el of runs) {
    const start = Number(el.dataset.sketchStart)
    const end = Number(el.dataset.sketchEnd)
    if (index < start || index > end) continue
    const textNode = firstTextNode(el)
    if (!textNode) continue
    const local = clamp(index - start, 0, textNode.length)
    return { node: textNode, offset: local }
  }
  // Clamp to end of last text node.
  for (let i = runs.length - 1; i >= 0; i--) {
    const el = runs[i]
    if (!el) continue
    const textNode = firstTextNode(el)
    if (!textNode) continue
    return { node: textNode, offset: textNode.length }
  }
  return null
}

/** Map a DOM node + offset back to a source index via the enclosing run. */
export function offsetInMirror(mirror: HTMLElement, node: Node, offset: number): number | null {
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE ? (node.parentElement as HTMLElement) : (node as HTMLElement)
  while (el && el !== mirror && !el.dataset.sketchStart) el = el.parentElement
  if (!el?.dataset.sketchStart) return null
  return Number(el.dataset.sketchStart) + offset
}

/** Caret rect (DOMRect) at a source index, or null. */
export function caretRectAt(mirror: HTMLElement, index: number): DOMRect | null {
  const point = pointInMirror(mirror, index)
  if (!point) {
    const last = mirror.querySelectorAll<HTMLElement>('[data-sketch-start]')
    const el = last[last.length - 1]
    if (!el) return null
    const r = el.getBoundingClientRect()
    return new DOMRect(r.right, r.top, 0, r.height || 20)
  }
  try {
    const range = document.createRange()
    range.setStart(point.node, point.offset)
    range.setEnd(point.node, point.offset)
    const rects = range.getClientRects()
    return rects[0] ?? range.getBoundingClientRect()
  } catch {
    return null
  }
}

/** Client rects for the selection range [start, end) inside the mirror. */
export function rangeRectsInMirror(mirror: HTMLElement, start: number, end: number): DOMRect[] {
  const a = pointInMirror(mirror, start)
  const b = pointInMirror(mirror, end)
  if (!a || !b) return []
  try {
    const range = document.createRange()
    range.setStart(a.node, a.offset)
    range.setEnd(b.node, b.offset)
    return Array.from(range.getClientRects())
  } catch {
    return []
  }
}

/**
 * Best-effort caret index from a pointer event. Uses the browser's
 * caret-from-point API when available (and the hit lands inside the mirror),
 * else falls back to nearest `[data-sketch-start]` run by bounding box.
 */
export function caretIndexFromPoint(
  mirror: HTMLElement,
  clientX: number,
  clientY: number,
  sourceLen: number,
): number {
  if (!mirror || sourceLen === 0) return 0

  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  }
  if (typeof doc.caretRangeFromPoint === 'function') {
    const range = doc.caretRangeFromPoint(clientX, clientY)
    if (range && mirror.contains(range.startContainer)) {
      const idx = offsetInMirror(mirror, range.startContainer, range.startOffset)
      if (idx != null) return clamp(idx, 0, sourceLen)
    }
  } else if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(clientX, clientY)
    if (pos && mirror.contains(pos.offsetNode)) {
      const idx = offsetInMirror(mirror, pos.offsetNode, pos.offset)
      if (idx != null) return clamp(idx, 0, sourceLen)
    }
  }

  const runs = mirror.querySelectorAll<HTMLElement>('[data-sketch-start]')
  let best = sourceLen
  let bestDist = Infinity
  runs.forEach((el) => {
    const start = Number(el.dataset.sketchStart)
    const end = Number(el.dataset.sketchEnd)
    const r = el.getBoundingClientRect()
    if (!r.height && !r.width) return
    const cx = clamp(clientX, r.left, r.right)
    const cy = clamp(clientY, r.top, r.bottom)
    const dist = (cx - clientX) ** 2 + (cy - clientY) ** 2
    if (dist < bestDist) {
      bestDist = dist
      const t = r.width > 0 ? (clientX - r.left) / r.width : 1
      best = Math.round(start + clamp(t, 0, 1) * (end - start))
    }
  })
  return clamp(best, 0, sourceLen)
}
