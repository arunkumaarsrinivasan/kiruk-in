'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PixelIcon } from '@/components/ui/PixelIcon'
import type { BlogArticleSummary } from '@/types/blog'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: BlogArticleSummary
  index?: number
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={`/blog/${article.slug}`}>
        <motion.div
          className={cn(
            'h-full border-2 p-4 flex flex-col',
            'bg-[var(--bg-card)] border-[var(--border-color)]',
            'hover:border-[var(--accent-color)] transition-colors',
            'group cursor-pointer'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative mb-4 aspect-video overflow-hidden border-2 border-[var(--border-color)]">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              />
            </div>
          )}

          {/* Domain Tags */}
          {article.domain && article.domain.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.domain.map((domain, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2 py-1 border border-[var(--border-color)]"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--accent-color)',
                  }}
                >
                  {domain}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className="text-xl font-mono font-bold mb-2 group-hover:text-[var(--accent-color)] transition-colors"
            style={{ color: 'var(--text-main)' }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              className="text-sm font-mono mb-4 flex-1 line-clamp-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {article.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-[var(--border-color)]">
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDate(article.publishedDate)}
            </span>
            <div className="flex items-center gap-1 text-xs font-mono group-hover:text-[var(--accent-color)] transition-colors">
              <span>READ</span>
              <PixelIcon name="angle-right" size={12} />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
