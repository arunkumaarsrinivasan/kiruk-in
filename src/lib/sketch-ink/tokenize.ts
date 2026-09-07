/** Grapheme-aware split + hand detection for SketchInk v4. */

export function tokenize(text: string): string[] {
  if (!text) return []
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      return [...seg.segment(text)].map((s) => s.segment)
    }
  } catch {
    /* fall through */
  }
  return Array.from(text)
}

/** Code-unit offsets for each grapheme boundary (length = graphemes + 1). */
export function graphemeOffsets(text: string): number[] {
  const chars = tokenize(text)
  const offsets = [0]
  let acc = 0
  for (const g of chars) {
    acc += g.length
    offsets.push(acc)
  }
  return offsets
}

/** Heuristic: mostly uppercase letters → print hand. */
export function detectHand(text: string): 'print' | 'script' {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  if (letters.length < 2) return 'script'
  let upper = 0
  for (const ch of letters) {
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upper++
  }
  return upper / letters.length >= 0.62 ? 'print' : 'script'
}

/** Word-aware hand: CAPS words use print, mixed use script. */
export function handForWord(
  word: string,
  mode: 'auto' | 'print' | 'script',
): 'print' | 'script' {
  if (mode === 'print' || mode === 'script') return mode
  const letters = word.replace(/[^a-zA-Z]/g, '')
  if (!letters) return 'script'
  return detectHand(letters)
}

/** Map a UTF-16 code-unit index to a grapheme index. */
export function codeUnitToGrapheme(text: string, codeUnit: number): number {
  const offsets = graphemeOffsets(text)
  const clamped = Math.max(0, Math.min(codeUnit, text.length))
  for (let i = 0; i < offsets.length - 1; i++) {
    if (clamped < (offsets[i + 1] ?? 0)) return i
  }
  return Math.max(0, offsets.length - 1)
}

/** Map a grapheme index to a UTF-16 code-unit index. */
export function graphemeToCodeUnit(text: string, graphemeIndex: number): number {
  const offsets = graphemeOffsets(text)
  const i = Math.max(0, Math.min(graphemeIndex, offsets.length - 1))
  return offsets[i] ?? 0
}
