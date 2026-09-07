import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/content/blog'
import { BlogListClient } from '@/components/blog/BlogListClient'

export const metadata: Metadata = {
  title: 'Notebook',
  description:
    'Handwritten notes, sketches, and screenshots — a warm notebook from the desk.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  const articles = getBlogPosts()
  return <BlogListClient articles={articles} />
}
