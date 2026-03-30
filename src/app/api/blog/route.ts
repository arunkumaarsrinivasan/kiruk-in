import { NextResponse } from 'next/server'
import { fetchBlogArticles, notionBlogIntegrationReady } from '@/lib/notion-blog'

export async function GET() {
  if (!notionBlogIntegrationReady) {
    return NextResponse.json(
      { message: 'Notion blog integration is not configured' },
      { status: 503 }
    )
  }

  try {
    const articles = await fetchBlogArticles()

    return NextResponse.json({
      articles,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Notion blog fetch failed', error)
    return NextResponse.json(
      { message: 'Unable to fetch blog articles from Notion' },
      { status: 500 }
    )
  }
}
