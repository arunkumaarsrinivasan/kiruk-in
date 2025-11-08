import { NextRequest, NextResponse } from 'next/server';
import { PortfolioAnalytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const { action, data, sessionId } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Track the interaction
    await PortfolioAnalytics.trackInteraction(
      action,
      data,
      sessionId,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') || 'unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const analyticsData = await PortfolioAnalytics.getAnalyticsData(days);
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
