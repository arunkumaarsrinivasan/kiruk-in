import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Figure, Compare, FullBleed } from './Sketch'
import { InkSvg } from './InkSvg'
import { InkPage } from './InkPage'
import { InkInline } from './InkInline'
import { Pretext } from './Pretext'
import { InkLayer } from './InkLayer'
import { sketchTextNodes } from '@/components/sketch-ink/mapText'
import {
  RoughBox,
  RoughDivider,
  RoughUnderline,
  RoughStrike,
  DiagramCaption,
  SketchChecklist,
  SketchActionChrome,
} from '@/components/sketch-ink/SketchChrome'

/**
 * MDX component scope — notebook dual-hand SketchInk for prose,
 * sketch components for images/ink + sketchnote chrome.
 */

type ElProps = { children?: React.ReactNode; className?: string }

export const mdxComponents = {
  h1: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1
      {...props}
      className={cn('text-3xl mt-8 mb-4', className)}
      style={{ color: 'var(--accent-color)' }}
    >
      {sketchTextNodes(children, 'auto', 0.85, 'title')}
    </h1>
  ),
  h2: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2
      {...props}
      className={cn('text-2xl mt-8 mb-3', className)}
      style={{ color: 'var(--accent-color)' }}
    >
      {sketchTextNodes(children, 'auto', 0.8, 'title')}
      <RoughUnderline className="mt-1 max-w-[12rem] opacity-70" width="40%" />
    </h2>
  ),
  h3: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3
      {...props}
      className={cn('text-xl mt-6 mb-2', className)}
      style={{ color: 'var(--text-main)' }}
    >
      {sketchTextNodes(children, 'auto', 0.78, 'title')}
    </h3>
  ),
  p: ({ children }: ElProps) => (
    <p className="my-4 text-lg" style={{ color: 'var(--text-main)', lineHeight: 1.95 }}>
      {sketchTextNodes(children, 'script', 0.88, 'type')}
    </p>
  ),
  strong: ({ children }: ElProps) => (
    <strong className="font-bold">{sketchTextNodes(children, 'script', 0.85, 'type')}</strong>
  ),
  em: ({ children }: ElProps) => (
    <em className="italic">{sketchTextNodes(children, 'script', 0.85, 'type')}</em>
  ),
  ul: ({ children }: ElProps) => (
    <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }: ElProps) => (
    <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }: ElProps) => (
    <li className="text-lg" style={{ color: 'var(--text-main)', lineHeight: 1.9 }}>
      {sketchTextNodes(children, 'auto', 0.85, 'checklist')}
    </li>
  ),
  blockquote: ({ children }: ElProps) => (
    <RoughBox className="my-6 italic" pad>
      <div style={{ color: 'var(--text-muted)' }}>
        {sketchTextNodes(children, 'script', 0.82, 'ideation')}
      </div>
      <SketchActionChrome action="ideation" />
    </RoughBox>
  ),
  code: ({ children, className, ...rest }: React.ComponentPropsWithoutRef<'code'>) => {
    const isBlock = Boolean(className)
    if (isBlock)
      return (
        <code {...rest} className={cn('font-mono', className)}>
          {children}
        </code>
      )
    return (
      <code
        className="border px-1 py-0.5 font-mono text-sm"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {children}
      </code>
    )
  },
  pre: ({ className, style, ...rest }: React.ComponentPropsWithoutRef<'pre'>) => (
    <pre
      {...rest}
      className={cn(
        'my-6 overflow-x-auto border-2 border-[var(--border-color)] p-4 font-mono text-sm',
        className,
      )}
      style={style}
    />
  ),
  a: ({ children, href, ...rest }: React.ComponentPropsWithoutRef<'a'>) => {
    if ('data-heading-anchor' in rest) {
      return (
        <a href={href} {...rest} className="text-inherit no-underline hover:opacity-70">
          {children}
        </a>
      )
    }
    const external = Boolean(href && /^https?:\/\//.test(href))
    const className = 'underline underline-offset-2 transition-opacity hover:opacity-80'
    const style = { color: 'var(--accent-color)' }
    const label = sketchTextNodes(children, 'script', 0.7, 'type')
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
          {label}
        </a>
      )
    }
    return (
      <Link href={href || '#'} className={className} style={style}>
        {label}
      </Link>
    )
  },
  hr: () => <RoughDivider />,
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null
    return (
      <span className="my-6 block">
        <span className="block border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-1">
          <Image
            src={src}
            alt={alt || ''}
            width={0}
            height={0}
            sizes="(max-width: 896px) 100vw, 896px"
            className="h-auto w-full object-contain"
          />
        </span>
        {alt ? <DiagramCaption>{alt}</DiagramCaption> : null}
      </span>
    )
  },
  table: ({ children }: ElProps) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: ElProps) => (
    <th
      className="border p-2 text-left font-bold"
      style={{ borderColor: 'var(--border-color)', color: 'var(--accent-color)' }}
    >
      {children}
    </th>
  ),
  td: ({ children }: ElProps) => (
    <td className="border p-2" style={{ borderColor: 'var(--border-color)' }}>
      {children}
    </td>
  ),

  Figure,
  Compare,
  FullBleed,
  InkSvg,
  InkPage,
  Ink: InkInline,
  Pretext,
  InkLayer,
  RoughBox,
  RoughDivider,
  RoughUnderline,
  RoughStrike,
  DiagramCaption,
  SketchChecklist,
  SketchActionChrome,
} as const
