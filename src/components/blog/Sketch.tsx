import Image from 'next/image'
import { InkSvg, type InkTone } from './InkSvg'

/**
 * Sketch components for the ideation/sketchbook blog.
 *
 * Server-safe (no 'use client') so they render inside `renderMdx`. Two render
 * paths:
 *   - **Theme ink** (`.svg` src or `ink="theme"`): inline via `<InkSvg>`, no
 *     opaque frame, so the ink recolors with the active era.
 *   - **Raster** (png/jpg/webp): the fluid, never-cropped `next/image` box.
 * Scans have wildly varied aspect ratios, so rasters use the responsive
 * width/height 0 + height:auto pattern inside a framed box — nothing is cropped.
 */

type Medium = 'pen' | 'digital' | 'mixed'

const isSvg = (src: string) => /\.svg($|\?)/i.test(src)

/** A framed, never-cropped raster that keeps its intrinsic aspect ratio. */
function FramedImage({
  src,
  alt,
  sizes = '(max-width: 896px) 100vw, 896px',
}: {
  src: string
  alt: string
  sizes?: string
}) {
  return (
    <span className="block border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-1">
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes={sizes}
        className="h-auto w-full object-contain"
      />
    </span>
  )
}

/** Theme ink in a transparent, era-colored frame (no white box). */
function InkFrame({ src, alt, tone }: { src: string; alt?: string; tone?: InkTone }) {
  return (
    <span className="block border-2 border-[var(--border-color)] p-2">
      <InkSvg src={src} alt={alt} tone={tone} />
    </span>
  )
}

/** One scan/figure: theme ink or raster, chosen by src/ink. */
function Panel({
  src,
  alt,
  ink,
  tone,
  sizes,
}: {
  src: string
  alt?: string
  ink?: 'theme'
  tone?: InkTone
  sizes?: string
}) {
  if (ink === 'theme' || isSvg(src)) {
    return <InkFrame src={src} alt={alt} tone={tone} />
  }
  return <FramedImage src={src} alt={alt || 'Sketch'} sizes={sizes} />
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption
      className="mt-2 text-center text-sm font-mono italic"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </figcaption>
  )
}

function MediumChip({ medium }: { medium: Medium }) {
  const label = medium === 'pen' ? 'PEN & PAPER' : medium === 'digital' ? 'DIGITAL' : 'MIXED'
  return (
    <span
      className="inline-block mb-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 border border-[var(--border-color)]"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent-color)' }}
    >
      {label}
    </span>
  )
}

/** Single scan/image with an optional medium tag and caption. */
export function Figure({
  src,
  medium,
  caption,
  alt,
  ink,
  tone,
}: {
  src: string
  medium?: Medium
  caption?: string
  alt?: string
  /** Force theme-ink rendering (also implied by a `.svg` src). */
  ink?: 'theme'
  /** Ink color source: `ink` = --text-main (default), `accent` = --accent-color. */
  tone?: InkTone
  /** Accepted for authoring symmetry with the ink CLI snippet; raster fallback. */
  srcRaster?: string
}) {
  return (
    <figure className="my-8">
      {medium && (
        <div>
          <MediumChip medium={medium} />
        </div>
      )}
      <Panel src={src} alt={alt || caption} ink={ink} tone={tone} />
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

/** Pen → digital progression: two framed panels side by side (stacks on mobile). */
export function Compare({
  pen,
  digital,
  caption,
  penLabel = 'PEN & PAPER',
  digitalLabel = 'DIGITAL',
  tone,
}: {
  pen: string
  digital: string
  caption?: string
  penLabel?: string
  digitalLabel?: string
  /** Tone for whichever side is theme ink. */
  tone?: InkTone
}) {
  const side = (src: string, label: string) => (
    <div>
      <span
        className="inline-block mb-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 border border-[var(--border-color)]"
        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent-color)' }}
      >
        {label}
      </span>
      <Panel src={src} alt={label} tone={tone} sizes="(max-width: 768px) 100vw, 440px" />
    </div>
  )
  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {side(pen, penLabel)}
        {side(digital, digitalLabel)}
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}

/** Wide edge-to-edge scan that breaks out of the article column. */
export function FullBleed({
  src,
  caption,
  alt,
  ink,
  tone,
}: {
  src: string
  caption?: string
  alt?: string
  ink?: 'theme'
  tone?: InkTone
}) {
  return (
    <figure className="relative left-1/2 my-12 w-screen max-w-none -translate-x-1/2 px-4">
      <Panel src={src} alt={alt || caption} ink={ink} tone={tone} sizes="100vw" />
      {caption && <Caption>{caption}</Caption>}
    </figure>
  )
}
