'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { BlogArticleSummary } from '@/types/blog'
import { SketchInk } from '@/components/sketch-ink'

interface BlogListClientProps {
  articles: BlogArticleSummary[]
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Notebook index — dual-hand SketchInk titles + excerpts.
 */
export function BlogListClient({ articles }: BlogListClientProps) {
  return (
    <main
      className="min-h-screen px-4 py-10 md:py-14"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="mb-12">
          <p className="mb-2 text-lg" style={{ color: 'var(--text-muted)' }}>
            <SketchInk mode="script" intensity={0.4}>
              paper
            </SketchInk>
          </p>
          <h1 className="mb-3 text-4xl md:text-5xl" style={{ color: 'var(--text-main)' }}>
            <SketchInk mode="print" intensity={0.55}>
              NOTEBOOK
            </SketchInk>
          </h1>
          <p className="max-w-md text-xl leading-snug" style={{ color: 'var(--text-muted)' }}>
            <SketchInk mode="script" intensity={0.7}>
              handwritten notes, sketches, and screenshots — black ink on white paper.
            </SketchInk>
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No pages yet. Run <code>npm run newpost</code> or open /studio.
          </p>
        ) : (
          <ul className="space-y-8">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="group block border-b pb-8 transition-opacity hover:opacity-70"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {article.coverImage && (
                    <div
                      className="relative mb-4 aspect-[2/1] w-full overflow-hidden border"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                      }}
                    >
                      <Image
                        src={article.coverImage}
                        alt=""
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 672px) 100vw, 672px"
                      />
                    </div>
                  )}
                  <h2 className="mb-2 text-xl md:text-2xl group-hover:underline" style={{ color: 'var(--text-main)' }}>
                    <SketchInk mode="auto" intensity={0.65}>
                      {article.title}
                    </SketchInk>
                  </h2>
                  {article.publishedDate && (
                    <time className="mb-2 block text-base" style={{ color: 'var(--text-muted)' }}>
                      <SketchInk mode="script" intensity={0.35}>
                        {formatDate(article.publishedDate)}
                      </SketchInk>
                    </time>
                  )}
                  {article.excerpt && (
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <SketchInk mode="script" intensity={0.7}>
                        {article.excerpt}
                      </SketchInk>
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <Link
            href="/"
            className="text-base opacity-55 transition-opacity hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <SketchInk mode="script" intensity={0.35}>
              ← Home
            </SketchInk>
          </Link>
        </div>
      </div>
    </main>
  )
}
