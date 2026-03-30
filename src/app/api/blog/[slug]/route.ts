import { NextResponse } from 'next/server'
import { fetchBlogArticleBySlug, notionBlogIntegrationReady } from '@/lib/notion-blog'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!notionBlogIntegrationReady) {
    return NextResponse.json(
      { message: 'Notion blog integration is not configured' },
      { status: 503 }
    )
  }

  try {
    const { slug } = await params
    const article = await fetchBlogArticleBySlug(slug)

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      article,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Notion blog article fetch failed', error)
    return NextResponse.json(
      { message: 'Unable to fetch blog article from Notion' },
      { status: 500 }
    )
  }
}
