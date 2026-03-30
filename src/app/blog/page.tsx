'use client'

import { useState, useEffect, useMemo } from 'react'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { GridBackground } from '@/components/ui/GridBackground'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { SearchBar } from '@/components/blog/SearchBar'
import { DomainFilter } from '@/components/blog/DomainFilter'
import type { BlogArticleSummary } from '@/types/blog'
import Link from 'next/link'

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/blog')
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Get all unique domains from articles
  const allDomains = useMemo(() => {
    const domains = new Set<string>()
    articles.forEach((article) => {
      article.domain.forEach((domain) => domains.add(domain))
    })
    return Array.from(domains).sort()
  }, [articles])

  // Filter articles based on search and domain
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

      // Domain filter
      const matchesDomain =
        selectedDomains.length === 0 ||
        article.domain.some((domain) => selectedDomains.includes(domain))

      return matchesSearch && matchesDomain
    })
  }, [articles, searchQuery, selectedDomains])

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    )
  }

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <GridBackground opacity={0.1} />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <PixelIcon name="book" size={32} style={{ color: 'var(--accent-color)' }} />
            <h1 className="text-2xl font-mono font-black uppercase" style={{ color: 'var(--accent-color)' }}>
              KNOWLEDGE ARCHIVE
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-mono font-bold uppercase tracking-wider transition-colors hover:underline flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <PixelIcon name="home" size={14} />
            ← Home
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {allDomains.length > 0 && (
            <DomainFilter
              domains={allDomains}
              selectedDomains={selectedDomains}
              onToggleDomain={toggleDomain}
            />
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
            {selectedDomains.length > 0 && ` in ${selectedDomains.join(', ')}`}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <PixelIcon name="spinner" size={48} className="animate-spin mb-4" style={{ color: 'var(--accent-color)' }} />
              <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                Loading articles...
              </p>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredArticles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-[var(--border-color)] p-8 bg-[var(--bg-card)]">
            <PixelIcon name="book" size={64} className="mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-mono font-bold mb-2" style={{ color: 'var(--text-main)' }}>
              No articles found
            </h2>
            <p className="text-sm font-mono text-center" style={{ color: 'var(--text-muted)' }}>
              {searchQuery || selectedDomains.length > 0
                ? 'Try adjusting your search or filters'
                : 'No articles available yet. Check back soon!'}
            </p>
            {(searchQuery || selectedDomains.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDomains([])
                }}
                className="mt-4 px-4 py-2 border-2 border-[var(--border-color)] bg-[var(--bg-main)] font-mono text-sm hover:border-[var(--accent-color)] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
