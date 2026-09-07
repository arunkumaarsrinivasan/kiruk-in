import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cn } from '@/lib/utils'

export type InkTone = 'ink' | 'accent'

/**
 * Theme-native inline SVG (server component).
 *
 * Reads a first-party SVG from `/public` at render time and injects it inline
 * so its `currentColor` fills inherit the active era color — green in 1970,
 * purple in 2023 — instead of a pasted, fixed-color image. Assets produced by
 * `npm run ink` are already `currentColor`, so this recolors them exactly.
 *
 * Inline (not `<img src=*.svg>` / mask) is deliberate: an external SVG image
 * cannot inherit `currentColor`; inlining is what makes theme ink actually
 * work, and it keeps the paths accessible. Content is first-party + generated,
 * so injecting it is safe; we still strip any `<script>` defensively.
 */
export async function InkSvg({
  src,
  alt,
  tone = 'ink',
  className,
}: {
  src: string
  alt?: string
  tone?: InkTone
  className?: string
}) {
  const file = join(process.cwd(), 'public', src.replace(/^\/+/, ''))
  let raw: string
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return null
  }

  const svg = raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Fluid: fill the container width, keep aspect via the viewBox.
    .replace(/<svg\b/, '<svg style="width:100%;height:auto;display:block"')

  const color = tone === 'accent' ? 'var(--accent-color)' : 'var(--text-main)'

  return (
    <span
      role="img"
      aria-label={alt || 'Sketch'}
      className={cn('block', className)}
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
