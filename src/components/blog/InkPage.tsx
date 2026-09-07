import { InkSvg, type InkTone } from './InkSvg'

/**
 * Notebook ink page — theme-native handwritten SVG for MDX posts.
 * Sourced from Kiruk Ink export (ink-NN.svg with currentColor fills).
 */
export function InkPage({
  src,
  alt,
  tone,
  caption,
}: {
  src: string
  alt?: string
  tone?: InkTone
  caption?: string
}) {
  return (
    <figure className="notebook-ink my-10">
      <div
        className="border-2 p-3 md:p-5"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <InkSvg src={src} alt={alt || caption || 'Handwritten page'} tone={tone} />
      </div>
      {caption && (
        <figcaption
          className="mt-2 text-center text-sm font-mono italic"
          style={{ color: 'var(--text-muted)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
