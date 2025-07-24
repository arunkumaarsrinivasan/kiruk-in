import { NextRequest, NextResponse } from 'next/server';

const REPO_OWNER = 'arunkumaarsrinivasan';
const REPO_NAME = 'kiruk-in';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'commits';
    const perPage = searchParams.get('per_page') || '50';
    const since = searchParams.get('since'); // Optional since parameter for filtering commits

    let githubUrl = '';
    
    switch (endpoint) {
      case 'commits':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${perPage}`;
        if (since) {
          githubUrl += `&since=${since}`;
        }
        break;
      case 'commits-with-stats':
        // Enhanced endpoint to get commits with file change statistics - will be enhanced later in the code
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${Math.min(parseInt(perPage), 10)}`;
        if (since) {
          githubUrl += `&since=${since}`;
        }
        break;
      case 'releases':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=${perPage}`;
        break;
      case 'issues':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=${perPage}`;
        break;
      case 'repo':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
        break;
      case 'contributors':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=${perPage}`;
        break;
      case 'stats':
        githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/stats/participation`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint. Supported: commits, commits-with-stats, releases, issues, repo, contributors, stats' },
          { status: 400 }
        );
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'kiruk-portfolio'
    };

    // Add GitHub token if available (for higher rate limits and private repo access)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(githubUrl, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();

    // For commits-with-stats endpoint, fetch additional details for each commit
    if (endpoint === 'commits-with-stats' && Array.isArray(data)) {
      const enhancedCommits = await Promise.all(
        data.slice(0, 10).map(async (commit: any) => {
          try {
            const commitDetailResponse = await fetch(
              `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commit.sha}`,
              { headers }
            );
            
            if (commitDetailResponse.ok) {
              const commitDetail = await commitDetailResponse.json();
              return {
                ...commit,
                stats: commitDetail.stats,
                files: commitDetail.files
              };
            }
            return commit;
          } catch (error) {
            console.warn(`Failed to fetch details for commit ${commit.sha}:`, error);
            return commit;
          }
        })
      );
      data = enhancedCommits;
    }

    return NextResponse.json({
      data,
      rateLimit: {
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
        used: response.headers.get('x-ratelimit-used')
      },
      repository: `${REPO_OWNER}/${REPO_NAME}`,
      endpoint
    });

  } catch (error) {
    console.error('GitHub API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from GitHub API',
        details: error instanceof Error ? error.message : 'Unknown error',
        repository: `${REPO_OWNER}/${REPO_NAME}`
      },
      { status: 500 }
    );
  }
}

// For development, provide some mock data
export async function POST(request: NextRequest) {
  try {
    const mockData = {
      commits: [
        {
          sha: '1234567890abcdef',
          commit: {
            message: 'Add roadmap page with GitHub API integration',
            author: {
              name: 'Arun Kumaar Srinivasan',
              date: new Date().toISOString()
            }
          },
          html_url: 'https://github.com/arunkumaarsrinivasan/kiruk-in/commit/1234567890abcdef',
          stats: {
            additions: 150,
            deletions: 5
          }
        },
        {
          sha: 'abcdef1234567890',
          commit: {
            message: 'Remove unwanted demo and test files',
            author: {
              name: 'Arun Kumaar Srinivasan',
              date: new Date(Date.now() - 86400000).toISOString()
            }
          },
          html_url: 'https://github.com/arunkumaarsrinivasan/kiruk-in/commit/abcdef1234567890',
          stats: {
            additions: 0,
            deletions: 45
          }
        }
      ]
    };

    return NextResponse.json({ data: mockData.commits });
  } catch (error) {
    console.error('Mock data error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to provide mock data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
