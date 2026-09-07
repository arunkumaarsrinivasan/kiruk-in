/**
 * Sentinel encoding for the inline SketchInk field.
 *
 * The textarea owns a flat string. Inline ink items are represented in that
 * string as a single private-use sentinel char (U+E000), so the caret can
 * step over each doodle as one atomic unit. A side-table (the ink items in
 * document order) carries the actual ink metadata (src / doc / sizeEm).
 *
 * Round trip:
 *   items → itemsToSentinelDraft + inksFromItems → textarea
 *   textarea + inks → sentinelDraftToItems → serializeInlineItems → MDX
 *
 * The sentinel is one code unit, so selectionStart/End indices line up 1:1
 * with offsets the mirror paints via `data-sketch-start/end`.
 */

import { INLINE_INK } from './config'
import type { InlineItem } from '@/lib/studio/notebook-blocks'

export type InkInlineItem = Extract<InlineItem, { kind: 'ink' }>

/** One char per inline ink. Lives in the BMP Private Use Area (never typed). */
export const SENTINEL = '\uE000'

/** True if a sentinel char appears anywhere in the draft. */
export function draftHasInk(draft: string): boolean {
  return draft.indexOf(SENTINEL) >= 0
}

/** Encode items as a flat sentinel draft (text + one SENTINEL per ink, in order). */
export function itemsToSentinelDraft(items: InlineItem[]): string {
  let s = ''
  for (const it of items) {
    if (it.kind === 'text') s += it.text
    else s += SENTINEL
  }
  return s
}

/** Extract the ink items in document order (the side-table). */
export function inksFromItems(items: InlineItem[]): InkInlineItem[] {
  return items.filter((it): it is InkInlineItem => it.kind === 'ink')
}

/**
 * Decode a sentinel draft back into items, interleaving the ink side-table.
 * The k-th sentinel maps to inks[k]. Extra sentinels get placeholder inks;
 * deleted sentinels drop their ink.
 */
export function sentinelDraftToItems(draft: string, inks: InkInlineItem[]): InlineItem[] {
  const parts = draft.split(SENTINEL)
  const items: InlineItem[] = []
  let sentinelIdx = 0
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i] ?? ''
    if (t) items.push({ kind: 'text', text: t })
    if (i < parts.length - 1) {
      const ink: InkInlineItem =
        inks[sentinelIdx] ?? { kind: 'ink', src: '', sizeEm: INLINE_INK.defaultSizeEm }
      items.push(ink)
      sentinelIdx++
    }
  }
  return items
}

/**
 * Per-item base offset into the sentinel draft. Text items contribute their
 * text length; ink items contribute one SENTINEL. Used by SketchInkSurface's
 * `offsetOf` so painted word spans carry draft-aligned `data-sketch-start/end`.
 */
export function sentinelBases(items: InlineItem[]): number[] {
  const bases: number[] = []
  let acc = 0
  for (const it of items) {
    bases.push(acc)
    acc += it.kind === 'text' ? it.text.length : 1
  }
  return bases
}

/** Insert a fresh ink item at a sentinel index, returning new items + draft. */
export function insertInkAt(
  items: InlineItem[],
  draft: string,
  caretIndex: number,
  ink: InkInlineItem,
): { items: InlineItem[]; draft: string; caret: number } {
  const nextDraft = draft.slice(0, caretIndex) + SENTINEL + draft.slice(caretIndex)
  // Rebuild items: walk nextDraft, interleave existing inks + the new one.
  const existing = inksFromItems(items)
  const parts = nextDraft.split(SENTINEL)
  const items2: InlineItem[] = []
  let sentinelIdx = 0
  let newCaret = caretIndex
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i] ?? ''
    if (t) items2.push({ kind: 'text', text: t })
    if (i < parts.length - 1) {
      if (sentinelIdx === existing.length) {
        // This is the newly inserted sentinel.
        items2.push(ink)
        newCaret = caretIndex + 1
      } else {
        items2.push(existing[sentinelIdx]!)
      }
      sentinelIdx++
    }
  }
  return { items: items2, draft: nextDraft, caret: newCaret }
}
