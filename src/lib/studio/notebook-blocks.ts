/**
 * Vertical notebook blocks — OneNote-style infinite scroll model.
 * Serialize ↔ MDX so git stays the CMS.
 *
 * Phase 2: text blocks hold raw MDX (which may include inline <Ink /> tokens).
 * InlineItem helpers parse that MDX into a structured inline model for the
 * pretext layout engine (Phase 3) and the structured editor (Phase 5).
 */

import type { InkDocument } from '@/lib/ink'
import type { LineAlign } from '@/lib/sketch-ink/config'
import type { FlowArrow } from '@/lib/sketch-ink/pretext'

export type InlineItem =
  | { kind: 'text'; text: string }
  | { kind: 'ink'; inkId?: string; src: string; sizeEm?: number; doc?: InkDocument }

export type NotebookBlock =
  | {
      id: string
      type: 'text'
      text: string
      align?: LineAlign
      /** Per-line alignment overrides (by line index). */
      lineAligns?: LineAlign[]
      /** Flow arrows between lines. */
      flow?: FlowArrow[]
      /** Full-block ink overlay (draw on the same surface as text). */
      inkId?: string
      inkSrc?: string
      inkDoc?: InkDocument
    }
  | {
      id: string
      type: 'ink'
      /** ink-01 — maps to public/.../ink-01.{json,svg} */
      inkId?: string
      src?: string
      doc?: InkDocument
    }
  | { id: string; type: 'image'; src: string; alt?: string }

function uid(prefix = 'b'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function newTextBlock(text = ''): NotebookBlock {
  return { id: uid('t'), type: 'text', text }
}

export function newInkBlock(): NotebookBlock {
  return { id: uid('i'), type: 'ink' }
}

export function newImageBlock(src: string, alt = 'Screenshot'): NotebookBlock {
  return { id: uid('img'), type: 'image', src, alt }
}

/** Default empty notebook: write a little, then draw. */
export function emptyNotebook(): NotebookBlock[] {
  return [newTextBlock(''), newInkBlock()]
}

/* -------------------------------------------------------------------------- */
/* Inline item helpers                                                        */
/* -------------------------------------------------------------------------- */

const INLINE_INK_RE = /<Ink\b([^>]*?)\/>/gi

function parseInkAttrs(attrs: string): { src?: string; sizeEm?: number; inkId?: string } {
  const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/)
  const sizeMatch = attrs.match(/\bsize=\{?([0-9.]+)\}?/)
  const src = srcMatch?.[1]
  const inkId = src?.match(/\/(ink-\d+)\.svg$/i)?.[1]
  return {
    src,
    sizeEm: sizeMatch ? Number(sizeMatch[1]) : undefined,
    inkId,
  }
}

/**
 * Parse a text block's raw MDX into structured inline items.
 * Text segments and inline <Ink /> refs alternate.
 */
export function parseInlineItems(text: string): InlineItem[] {
  if (!text) return []
  const items: InlineItem[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(INLINE_INK_RE.source, 'gi')
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index)
    if (before) items.push({ kind: 'text', text: before })
    const { src, sizeEm, inkId } = parseInkAttrs(m[1] ?? '')
    if (src) items.push({ kind: 'ink', src, sizeEm, inkId })
    last = m.index + m[0].length
  }
  const after = text.slice(last)
  if (after) items.push({ kind: 'text', text: after })
  return items
}

/** Serialize inline items back to MDX text (inline <Ink /> tokens preserved). */
export function serializeInlineItems(items: InlineItem[]): string {
  return items
    .map((it) => {
      if (it.kind === 'text') return it.text
      const size = it.sizeEm ? ` size={${it.sizeEm}}` : ''
      return `<Ink src="${it.src}"${size} />`
    })
    .join('')
}

/** True if a text block contains inline ink tokens. */
export function hasInlineInk(text: string): boolean {
  return INLINE_INK_RE.test(text)
}

/** Join only the text segments (drops ink) — used as a plain-string view. */
export function inlineTextOnly(items: InlineItem[]): string {
  return items.filter((it): it is Extract<InlineItem, { kind: 'text' }> => it.kind === 'text').join('')
}

/* -------------------------------------------------------------------------- */
/* MDX ↔ blocks                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse MDX body into vertical blocks.
 * Recognizes <InkPage />, <Figure />, <Pretext>, and <InkLayer />.
 * A following <InkLayer /> attaches to the preceding text block (overlay ink).
 * Inline <Ink /> inside text stays in the text block (not a block boundary).
 */
export function parseMdxToBlocks(body: string): NotebookBlock[] {
  const src = body.trim()
  if (!src) return emptyNotebook()

  const blocks: NotebookBlock[] = []
  const re = /<(InkPage|Figure|Pretext|InkLayer)\b([^>]*?)(?:\/>|>[\s\S]*?<\/\1>)/gi
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(src))) {
    const before = src.slice(last, m.index).trim()
    if (before) blocks.push(newTextBlock(before))

    const tag = m[1]
    const attrs = m[2]
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/)
    const altMatch = attrs.match(/\balt=["']([^"']+)["']/)
    const path = srcMatch?.[1] ?? ''

    if (tag === 'InkLayer' && path) {
      const inkId = path.match(/\/(ink-\d+)\.svg$/i)?.[1]
      // Attach to the last text block; if none, create an empty one.
      const prev = blocks[blocks.length - 1]
      if (prev && prev.type === 'text') {
        blocks[blocks.length - 1] = { ...prev, inkSrc: path, inkId }
      } else {
        blocks.push({ id: uid('t'), type: 'text', text: '', inkSrc: path, inkId })
      }
    } else if (tag === 'Pretext') {
      const inner = m[0].match(/>([\s\S]*?)<\/Pretext>$/)?.[1] ?? ''
      const align = attrs.match(/\balign=["']([^"']+)["']/)?.[1] as LineAlign | undefined
      const lineAligns = parseJsonProp<LineAlign[]>(attrs, 'lineAligns')
      const flow = parseJsonProp<FlowArrow[]>(attrs, 'flow')
      blocks.push({
        id: uid('t'),
        type: 'text',
        text: inner.trim(),
        align,
        lineAligns,
        flow,
      })
    } else if (tag.toLowerCase() === 'inkpage' && path) {
      const inkId = path.match(/\/(ink-\d+)\.svg$/i)?.[1]
      blocks.push({ id: uid('i'), type: 'ink', inkId, src: path })
    } else if (tag.toLowerCase() === 'figure' && path) {
      blocks.push(newImageBlock(path, altMatch?.[1] ?? 'Screenshot'))
    }

    last = m.index + m[0].length
  }

  const after = src.slice(last).trim()
  if (after) blocks.push(newTextBlock(after))

  if (blocks.length === 0) return emptyNotebook()
  // Ensure there's always somewhere to draw if the post was text-only
  if (!blocks.some((b) => b.type === 'ink' || (b.type === 'text' && b.inkSrc))) {
    blocks.push(newInkBlock())
  }
  return blocks
}

/** Extract a `{...}` JSON expression prop from a tag's attribute string. */
function parseJsonProp<T>(attrs: string, name: string): T | undefined {
  const re = new RegExp(`\\b${name}=\\{([\\s\\S]*?)\\}`)
  const raw = attrs.match(re)?.[1]
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

/** Serialize blocks back to MDX body. */
export function blocksToMdx(blocks: NotebookBlock[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.type === 'text') {
      const t = b.text.trim()
      if (t) {
        if (b.align || b.lineAligns || (b.flow && b.flow.length)) {
          parts.push(wrapPretext(t, b.align, b.lineAligns, b.flow))
        } else {
          parts.push(t)
        }
      }
      if (b.inkSrc) {
        parts.push(`<InkLayer src="${b.inkSrc}" />`)
      }
    } else if (b.type === 'ink' && b.src) {
      parts.push(`<InkPage src="${b.src}" alt="Handwritten page" />`)
    } else if (b.type === 'image' && b.src) {
      const alt = b.alt ?? 'Screenshot'
      parts.push(`<Figure\n  src="${b.src}"\n  alt="${alt}"\n/>`)
    }
  }
  return parts.join('\n\n') + (parts.length ? '\n' : '')
}

/** Wrap text in a <Pretext> token carrying alignment + flow props. */
function wrapPretext(
  text: string,
  align?: LineAlign,
  lineAligns?: LineAlign[],
  flow?: FlowArrow[],
): string {
  const props: string[] = []
  if (align) props.push(`align="${align}"`)
  if (lineAligns && lineAligns.length) props.push(`lineAligns={${JSON.stringify(lineAligns)}}`)
  if (flow && flow.length) props.push(`flow={${JSON.stringify(flow)}}`)
  const propStr = props.length ? ' ' + props.join(' ') : ''
  return `<Pretext${propStr}>\n${text}\n</Pretext>`
}
