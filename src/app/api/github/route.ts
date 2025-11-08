import { NextRequest, NextResponse } from 'next/server';
import { ajApi } from '@/lib/arcjet';

type ArcjetDecisionReason = {
  isRateLimit(): boolean;
  isBot(): boolean;
};

type ArcjetDecision = {
  isDenied(): boolean;
  reason: ArcjetDecisionReason;
};

type GitHubCommit = {
  sha: string;
  [key: string]: unknown;
};

type GitHubCommitDetail = {
  stats?: {
    additions?: number;
    deletions?: number;
    total?: number;
  };
  files?: unknown;
};

function isArcjetDecision(decision: unknown): decision is ArcjetDecision {
  if (!decision || typeof decision !== 'object') {
    return false;
  }

  const candidate = decision as Partial<ArcjetDecision>;
  return (
    typeof candidate.isDenied === 'function' &&
    typeof candidate.reason?.isBot === 'function' &&
    typeof candidate.reason?.isRateLimit === 'function'
  );
}

const REPO_OWNER = 'arunkumaarsrinivasan';
const REPO_NAME = 'kiruk-in';

// Helper function to handle Arcjet protection responses
function handleArcjetDenial(decision: ArcjetDecision): NextResponse {
  if (decision.reason.isRateLimit()) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  } else if (decision.reason.isBot()) {
    return NextResponse.json(
      { error: 'Bot traffic detected. Access denied.' },
      { status: 403 }
    );
  } else {
    return NextResponse.json(
      { error: 'Access denied.' },
      { status: 403 }
    );
  }
}

// Helper function to build GitHub API URLs
function buildGitHubUrl(endpoint: string, perPage: string, since: string | null): string {
  const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const sinceParam = since ? `&since=${since}` : '';
  
  switch (endpoint) {
    case 'commits':
      return `${baseUrl}/commits?per_page=${perPage}${sinceParam}`;
    case 'commits-with-stats':
      return `${baseUrl}/commits?per_page=${Math.min(parseInt(perPage), 10)}${sinceParam}`;
    case 'releases':
      return `${baseUrl}/releases?per_page=${perPage}`;
    case 'issues':
      return `${baseUrl}/issues?state=all&per_page=${perPage}`;
    case 'repo':
      return baseUrl;
    case 'contributors':
      return `${baseUrl}/contributors?per_page=${perPage}`;
    case 'stats':
      return `${baseUrl}/stats/participation`;
    default:
      throw new Error('Invalid endpoint. Supported: commits, commits-with-stats, releases, issues, repo, contributors, stats');
  }
}

// Helper function to enhance commits with stats
async function enhanceCommitsWithStats(
  commits: GitHubCommit[],
  headers: Record<string, string>
): Promise<GitHubCommit[]> {
  return Promise.all(
    commits.slice(0, 10).map(async (commit) => {
      try {
        const commitDetailResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commit.sha}`,
          { headers }
        );
        
        if (commitDetailResponse.ok) {
          const commitDetail = await commitDetailResponse.json() as GitHubCommitDetail;
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
}

export async function GET(request: NextRequest) {
  try {
    // Apply Arcjet protection (skip if not configured)
    if (ajApi) {
      const decision = await ajApi.protect(request, { requested: 1 });

      if (isArcjetDecision(decision) && decision.isDenied()) {
        return handleArcjetDenial(decision);
      }
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'commits';
    const perPage = searchParams.get('per_page') || '50';
    const since = searchParams.get('since');

    let githubUrl: string;
    try {
      githubUrl = buildGitHubUrl(endpoint, perPage, since);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid endpoint' },
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

    let data: unknown = await response.json();

    // For commits-with-stats endpoint, fetch additional details for each commit
    if (endpoint === 'commits-with-stats' && Array.isArray(data)) {
      const commits = data.filter((item): item is GitHubCommit => (
        Boolean(item && typeof item === 'object' && 'sha' in item && typeof (item as { sha?: unknown }).sha === 'string')
      ));

      data = await enhanceCommitsWithStats(commits, headers);
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
export async function POST() {
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
