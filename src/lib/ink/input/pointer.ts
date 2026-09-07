import type { InkPoint } from '../types'

/**
 * Pointer Events → InkPoint samples.
 * Use getCoalescedEvents when available for high-freq stylus data.
 */
export function samplePointer(
  e: PointerEvent,
  rect: DOMRect,
  scaleX: number,
  scaleY: number,
): InkPoint {
  const x = ((e.clientX - rect.left) / rect.width) * scaleX
  const y = ((e.clientY - rect.top) / rect.height) * scaleY
  const p = e.pointerType === 'mouse' ? 0.5 : e.pressure > 0 ? e.pressure : 0.5
  return { x, y, p, t: e.timeStamp }
}

export function samplePointerEvent(
  e: PointerEvent,
  rect: DOMRect,
  size: { width: number; height: number },
): InkPoint[] {
  const coalesced =
    typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e]
  const events = coalesced.length > 0 ? coalesced : [e]
  return events.map((ev) => samplePointer(ev, rect, size.width, size.height))
}

/** Palm rejection: when penOnly, ignore touch/mouse. */
export function shouldAcceptPointer(e: PointerEvent, penOnly: boolean): boolean {
  if (!penOnly) return true
  return e.pointerType === 'pen'
}
