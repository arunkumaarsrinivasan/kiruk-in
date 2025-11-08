import { NextRequest, NextResponse } from 'next/server';
import { portfolioData } from '@/data/portfolio-data';
import type { PortfolioData } from '@/data/portfolio-data';

// This is a placeholder API route for portfolio data
// In the future, this will fetch from your database

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const category = searchParams.get('category');

    let data: Partial<PortfolioData> = portfolioData;

    // Filter by section if specified
    if (section) {
      switch (section) {
        case 'personal':
          data = { personal: portfolioData.personal };
          break;
        case 'skills':
          const skills = category 
            ? portfolioData.skills.filter(s => s.category === category)
            : portfolioData.skills;
          data = { skills };
          break;
        case 'projects':
          const projects = category 
            ? portfolioData.projects.filter(p => p.category === category)
            : portfolioData.projects;
          data = { projects };
          break;
        case 'experience':
          data = { experience: portfolioData.experience };
          break;
        case 'education':
          data = { education: portfolioData.education };
          break;
        case 'testimonials':
          data = { testimonials: portfolioData.testimonials };
          break;
        case 'blog':
          const featured = searchParams.get('featured') === 'true';
          const blog = featured 
            ? portfolioData.blog.filter(post => post.featured && post.status === 'published')
            : portfolioData.blog.filter(post => post.status === 'published');
          data = { blog };
          break;
        case 'contact':
          data = { contact: portfolioData.contact };
          break;
        case 'social':
          data = { social: portfolioData.social };
          break;
        default:
          break;
      }
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Portfolio data API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await request.json();
    
    // TODO: In the future, this would update the database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio data updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Portfolio data update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update portfolio data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
