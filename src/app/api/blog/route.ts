import { NextResponse } from 'next/server'
import { getBlogPosts } from '@/lib/content/blog'

/**
 * GET /api/blog — MDX-backed article summaries as JSON.
 *
 * The `/blog` route renders these server-side, but the portfolio module overlay
 * (`BlogExperience`) is a client island that can't touch the filesystem, so it
 * fetches this endpoint. Reads `content/blog/*.mdx` at request time on the
 * server.
 */
export async function GET() {
  const articles = getBlogPosts()
  return NextResponse.json({ articles, fetchedAt: new Date().toISOString() })
}
