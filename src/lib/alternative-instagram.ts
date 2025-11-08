// Personal Journey Content Integration for @arunum.avan.seyalum
// Simplified approach without categorization or hashtag processing

export interface PersonalPost {
  id: string;
  title: string;
  date: string;
  timestamp: number;
  thumbnailUrl: string;
  videoUrl?: string;
  location?: string;
  excerpt: string;
  isVideo: boolean;
  permalink: string;
  source: 'manual' | 'rss' | 'scraper' | 'webhook' | 'json';
}

// Manual content management for personal journey posts
export class PersonalJourneyContent {
  // Manually curated personal journey posts from @arunum.avan.seyalum
  static getPersonalPosts(): PersonalPost[] {
    return [
      {
        id: 'personal-1',
        title: 'Morning Reflections and Code',
        date: 'Dec 20, 2024',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        thumbnailUrl: '/images/vlogs/thumbnails/daily-1.jpg',
        excerpt: 'Starting the day with coffee and some deep thoughts about life and work balance.',
        isVideo: false,
        permalink: 'https://instagram.com/p/your-post-id',
        source: 'manual'
      },
      {
        id: 'personal-2',
        title: 'Weekend Adventures',
        date: 'Dec 18, 2024',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        thumbnailUrl: '/images/vlogs/thumbnails/travel-1.jpg',
        location: 'Bangalore',
        excerpt: 'Exploring new places around the city and meeting interesting people.',
        isVideo: true,
        permalink: 'https://instagram.com/p/your-post-id',
        source: 'manual'
      },
      {
        id: 'personal-3',
        title: 'Learning Journey Continues',
        date: 'Dec 16, 2024',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        thumbnailUrl: '/images/vlogs/thumbnails/tech-1.jpg',
        excerpt: 'Every day brings new learning opportunities. Today was about understanding myself better.',
        isVideo: false,
        permalink: 'https://instagram.com/p/your-post-id',
        source: 'manual'
      },
      {
        id: 'personal-4',
        title: 'Creating Something Beautiful',
        date: 'Dec 14, 2024',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        thumbnailUrl: '/images/vlogs/thumbnails/creative-1.jpg',
        excerpt: 'Working on this portfolio has been a journey of self-discovery and creative expression.',
        isVideo: true,
        permalink: 'https://instagram.com/p/your-post-id',
        source: 'manual'
      }
    ];
  }

  // Add new personal post
  static addPost(post: Omit<PersonalPost, 'id' | 'timestamp' | 'source'>): PersonalPost {
    return {
      ...post,
      id: `personal-${Date.now()}`,
      timestamp: Date.now(),
      source: 'manual'
    };
  }

  // Update existing post
  static updatePost(id: string, updates: Partial<PersonalPost>): PersonalPost | null {
    const posts = this.getPersonalPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) return null;
    
    return {
      ...posts[postIndex],
      ...updates
    };
  }
}

// Content management with local JSON file approach
export class PersonalContentManager {
  private static readonly CONTENT_FILE = '/data/personal-posts.json';

  static async loadFromJSON(): Promise<PersonalPost[]> {
    try {
      const response = await fetch(this.CONTENT_FILE);
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Failed to load from JSON:', error);
      return PersonalJourneyContent.getPersonalPosts(); // Fallback to manual content
    }
  }

  static async saveToJSON(posts: PersonalPost[]): Promise<boolean> {
    try {
      // This would be implemented as an API route for updating the JSON file
      const response = await fetch('/api/update-personal-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save to JSON:', error);
      return false;
    }
  }
}

// Main content provider for personal journey
export class PersonalJourneyProvider {
  static async getPersonalContent(preferredMethod: 'manual' | 'json' = 'manual'): Promise<PersonalPost[]> {
    switch (preferredMethod) {
      case 'manual':
        return PersonalJourneyContent.getPersonalPosts();
      
      case 'json':
        return await PersonalContentManager.loadFromJSON();
      
      default:
        return PersonalJourneyContent.getPersonalPosts();
    }
  }

  // For future Instagram integration when you're ready
  static async integrateWithInstagram(accountHandle: string = '@arunum.avan.seyalum'): Promise<PersonalPost[]> {
    // This could be expanded later to include actual Instagram integration
    // For now, returns manual content
    console.log(`Future integration with ${accountHandle}`);
    return PersonalJourneyContent.getPersonalPosts();
  }
}