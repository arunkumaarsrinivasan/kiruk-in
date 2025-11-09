import { NextResponse } from 'next/server'
import { fetchNotionProgress, notionIntegrationReady } from '@/lib/notion'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!notionIntegrationReady) {
    return NextResponse.json(
      { message: 'Notion integration is not configured' },
      { status: 503 }
    )
  }

  try {
    const notionData = await fetchNotionProgress()

    if (!notionData) {
      return NextResponse.json({
        source: 'notion',
        lifeGoals: [],
        bucketList: [],
        monthlyGoals: [],
        fetchedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      source: 'notion',
      lifeGoals: notionData.lifeGoals,
      bucketList: notionData.bucketList,
      monthlyGoals: notionData.monthlyGoals,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Notion progress fetch failed', error)
    return NextResponse.json(
      { message: 'Unable to fetch data from Notion' },
      { status: 500 }
    )
  }
}
