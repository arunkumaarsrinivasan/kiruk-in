import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Figure, Compare, FullBleed } from './Sketch'
import { InkSvg } from './InkSvg'
import { InkPage } from './InkPage'
import { InkInline } from './InkInline'
import { Pretext } from './Pretext'
import { InkLayer } from './InkLayer'
import { Mark, Zig, Hit } from './Marks'
import { FIGURES } from '@/components/figures'

/**
 * MDX component scope — Era token type plus ink/figure blocks.
 * SketchInk is the desk writing instrument; it is not used in public MDX.
 */

type ElProps = { children?: React.ReactNode; className?: string }

function Note({ children }: ElProps) {
  return <aside className="era-note">{children}</aside>
}

export const mdxComponents = {
  h1: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1
      {...props}
      className={cn('mt-8 mb-4 text-3xl text-balance', className)}
      style={{ color: 'var(--accent-color)', lineHeight: 1.12 }}
    >
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2
      {...props}
      className={cn('era-h2 scroll-mt-28 text-balance', className)}
    >
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3
      {...props}
      className={cn('mt-6 mb-2 text-xl text-balance', className)}
      style={{ color: 'var(--text-main)', lineHeight: 1.2 }}
    >
      {children}
    </h3>
  ),
  p: ({ children, className }: ElProps) => (
    <p
      className={cn('my-4 text-lg md:text-xl', className)}
      style={{ color: 'var(--text-main)', lineHeight: 1.6 }}
    >
      {children}
    </p>
  ),
  strong: ({ children }: ElProps) => (
    <strong className="font-bold">{children}</strong>
  ),
  em: ({ children }: ElProps) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children, className }: ElProps) => (
    <ul className={cn('my-4 list-none', className)}>{children}</ul>
  ),
  ol: ({ children }: ElProps) => (
    <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }: ElProps) => (
    <li style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
      {children}
    </li>
  ),
  blockquote: ({ children }: ElProps) => (
    <blockquote
      className="my-6 border-l pl-4 italic"
      style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
    >
      {children}
    </blockquote>
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
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href || '#'} className={className} style={style}>
        {children}
      </Link>
    )
  },
  hr: () => (
    <hr className="my-8 border-0 border-t" style={{ borderColor: 'var(--border-color)' }} />
  ),
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
        {alt ? (
          <span className="mt-2 block text-sm" style={{ color: 'var(--text-muted)' }}>
            {alt}
          </span>
        ) : null}
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

  // Text-drawn figures (timeline, table, steps, stat, tree…) for any post.
  ...FIGURES,

  Figure,
  Compare,
  FullBleed,
  InkSvg,
  InkPage,
  Ink: InkInline,
  Pretext,
  InkLayer,
  Note,
  Mark,
  Zig,
  Hit,
} as const
