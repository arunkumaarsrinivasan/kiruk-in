'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { GridBackground } from '@/components/ui/GridBackground'
import { NotionRenderer } from '@/components/blog/NotionRenderer'
import type { BlogArticle } from '@/types/blog'

export default function BlogArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [article, setArticle] = useState<BlogArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return

      try {
        const response = await fetch(`/api/blog/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setArticle(data.article)
        } else if (response.status === 404) {
          router.push('/blog')
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <GridBackground opacity={0.1} />
        <div className="text-center relative z-10">
          <PixelIcon name="spinner" size={48} className="animate-spin mb-4" style={{ color: 'var(--accent-color)' }} />
          <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            Loading article...
          </p>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <GridBackground opacity={0.1} />
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-mono font-bold mb-4" style={{ color: 'var(--text-main)' }}>
            Article not found
          </h1>
          <Link
            href="/blog"
            className="text-sm font-mono underline"
            style={{ color: 'var(--accent-color)' }}
          >
            ← Back to Blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <GridBackground opacity={0.1} />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-mono mb-4 hover:underline transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <PixelIcon name="angle-left" size={14} />
            Back to Blog
          </Link>

          {/* Domain Tags */}
          {article.domain && article.domain.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.domain.map((domain, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2 py-1 border border-[var(--border-color)]"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--accent-color)',
                  }}
                >
                  {domain}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-mono font-black mb-4" style={{ color: 'var(--accent-color)' }}>
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm font-mono mb-6" style={{ color: 'var(--text-muted)' }}>
            <span>{formatDate(article.publishedDate)}</span>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8 border-2 border-[var(--border-color)] overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className="text-lg font-mono mb-8 italic border-l-4 pl-4"
              style={{
                borderColor: 'var(--accent-color)',
                color: 'var(--text-muted)',
              }}
            >
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <NotionRenderer blocks={article.content} />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-[var(--border-color)]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-mono hover:underline transition-colors"
            style={{ color: 'var(--accent-color)' }}
          >
            <PixelIcon name="angle-left" size={14} />
            Back to Blog
          </Link>
        </div>
      </div>
    </main>
  )
}
