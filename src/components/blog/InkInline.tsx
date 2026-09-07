import { InkSvg, type InkTone } from './InkSvg'
import { INLINE_INK } from '@/lib/sketch-ink/config'

/**
 * Inline ink — a small doodle that sits inside a line of text, on the baseline.
 * Reader component for the MDX `<Ink src=... size={1.6} />` token.
 *
 * Size is in em (relative to surrounding text). The SVG keeps its aspect
 * ratio; height is fixed to `sizeEm em`, width auto.
 */
export function InkInline({
  src,
  alt,
  size,
  tone,
}: {
  src: string
  alt?: string
  /** Height in em (defaults to INLINE_INK.defaultSizeEm). */
  size?: number
  tone?: InkTone
}) {
  const sizeEm = size ?? INLINE_INK.defaultSizeEm
  return (
    <span
      className="ink-inline"
      role="img"
      aria-label={alt || 'inline sketch'}
      style={{
        display: 'inline-block',
        verticalAlign: INLINE_INK.verticalAlign,
        height: `${sizeEm}em`,
        width: 'auto',
        margin: `0 ${INLINE_INK.rightPadEm}em 0 0`,
        position: 'relative',
        lineHeight: 0,
      }}
    >
      {/* InkSvg renders a block span; we override to inline-block, fill height */}
      <span style={{ display: 'inline-block', height: '100%', width: 'auto' }}>
        <InkSvg src={src} alt={alt || 'inline sketch'} tone={tone} className="ink-inline-svg" />
      </span>
    </span>
  )
}
