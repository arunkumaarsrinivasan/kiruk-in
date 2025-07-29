// Life Roadmap CMS Data Types
export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'career' | 'personal' | 'learning' | 'health' | 'relationships' | 'hobbies' | 'achievements';
  status: 'completed' | 'in-progress' | 'planned';
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
  completedDate?: string;
  progress: number; // 0-100
  tags: string[];
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LifeUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'achievement' | 'milestone' | 'experience' | 'learning' | 'reflection';
  mood: 'excited' | 'proud' | 'grateful' | 'contemplative' | 'motivated';
  relatedGoals?: string[];
  images?: string[];
  createdAt: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCost?: number;
  location?: string;
  timeRequired?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'wishlist' | 'planning' | 'booked' | 'completed';
  priority: number; // 1-10
  notes?: string;
  createdAt: string;
}

// Local Storage CMS Functions
class LifeRoadmapCMS {
  private static readonly GOALS_KEY = 'life_roadmap_goals';
  private static readonly UPDATES_KEY = 'life_roadmap_updates';
  private static readonly BUCKET_LIST_KEY = 'life_roadmap_bucket_list';

  // Goals Management
  static getGoals(): LifeGoal[] {
    try {
      const goals = localStorage.getItem(this.GOALS_KEY);
      return goals ? JSON.parse(goals) : this.getDefaultGoals();
    } catch (error) {
      console.error('Error loading goals:', error);
      return this.getDefaultGoals();
    }
  }

  // Save functions removed - read-only access

  // Editing functions removed - read-only access only

  // Life Updates Management
  static getUpdates(): LifeUpdate[] {
    try {
      const updates = localStorage.getItem(this.UPDATES_KEY);
      return updates ? JSON.parse(updates) : this.getDefaultUpdates();
    } catch (error) {
      console.error('Error loading updates:', error);
      return this.getDefaultUpdates();
    }
  }

  // Save functions removed - read-only access

  // Editing functions removed - read-only access only

  // Bucket List Management
  static getBucketList(): BucketListItem[] {
    try {
      const items = localStorage.getItem(this.BUCKET_LIST_KEY);
      return items ? JSON.parse(items) : this.getDefaultBucketList();
    } catch (error) {
      console.error('Error loading bucket list:', error);
      return this.getDefaultBucketList();
    }
  }

  // All editing functions removed - read-only access only

  // Get goals by month for calendar view
  static getGoalsByMonth(year: number, month: number): LifeGoal[] {
    const goals = this.getGoals();
    return goals.filter(goal => {
      if (!goal.targetDate) return false;
      const targetDate = new Date(goal.targetDate);
      return targetDate.getFullYear() === year && targetDate.getMonth() === month;
    });
  }

  // Get current month's focus goals
  static getCurrentMonthGoals(): LifeGoal[] {
    const now = new Date();
    return this.getGoalsByMonth(now.getFullYear(), now.getMonth());
  }

  // Get upcoming goals (next 30 days)
  static getUpcomingGoals(): LifeGoal[] {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return this.getGoals().filter(goal => {
      if (!goal.targetDate || goal.status === 'completed') return false;
      const targetDate = new Date(goal.targetDate);
      return targetDate >= now && targetDate <= thirtyDaysFromNow;
    });
  }
  static getAnalytics() {
    const goals = this.getGoals();
    const updates = this.getUpdates();
    const bucketList = this.getBucketList();

    return {
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        inProgress: goals.filter(g => g.status === 'in-progress').length,
        planned: goals.filter(g => g.status === 'planned').length,
        byCategory: this.groupByCategory(goals),
        averageProgress: goals.reduce((acc, g) => acc + g.progress, 0) / goals.length || 0
      },
      updates: {
        total: updates.length,
        thisMonth: updates.filter(u => {
          const updateDate = new Date(u.date);
          const now = new Date();
          return updateDate.getMonth() === now.getMonth() && 
                 updateDate.getFullYear() === now.getFullYear();
        }).length,
        byCategory: this.groupByCategory(updates),
        byMood: this.groupByMood(updates)
      },
      bucketList: {
        total: bucketList.length,
        completed: bucketList.filter(b => b.status === 'completed').length,
        planned: bucketList.filter(b => b.status === 'planning' || b.status === 'booked').length,
        wishlist: bucketList.filter(b => b.status === 'wishlist').length
      }
    };
  }

  // Import/Export and data modification functions removed - read-only access only

  // Helper methods
  private static groupByCategory(items: { category: string }[]) {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static groupByMood(updates: LifeUpdate[]) {
    return updates.reduce((acc, update) => {
      acc[update.mood] = (acc[update.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Default data for first-time users
  private static getDefaultGoals(): LifeGoal[] {
    return [
      {
        id: 'default_1',
        title: 'Trek to Everest Base Camp',
        description: 'Complete the iconic trek to Everest Base Camp in Nepal',
        category: 'travel',
        status: 'planned',
        priority: 'high',
        targetDate: '2025-10-15',
        progress: 0,
        tags: ['trekking', 'adventure', 'nepal', 'himalayas'],
        notes: 'Need to improve fitness and plan for 2-3 weeks off work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default_2',
        title: 'Master Advanced React Patterns',
        description: 'Learn advanced React patterns, performance optimization, and modern development practices',
        category: 'learning',
        status: 'in-progress',
        priority: 'high',
        targetDate: '2025-08-30',
        progress: 65,
        tags: ['programming', 'react', 'nextjs', 'career'],
        notes: 'Currently working through advanced patterns and performance optimization',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default_3',
        title: 'Visit Japan During Cherry Blossom Season',
        description: 'Experience the beauty of Japan during Sakura season',
        category: 'travel',
        status: 'planned',
        priority: 'medium',
        targetDate: '2026-04-01',
        progress: 0,
        tags: ['japan', 'culture', 'photography', 'sakura'],
        notes: 'Research best locations and plan 2-week itinerary',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private static getDefaultUpdates(): LifeUpdate[] {
    return [
      {
        id: 'default_update_1',
        title: 'Launched Personal Life Roadmap CMS',
        content: 'Created a comprehensive life roadmap and CMS system to track personal goals, bucket list items, and life updates. This will help me stay organized and motivated on my journey.',
        date: new Date().toISOString().split('T')[0],
        category: 'achievement',
        mood: 'excited',
        relatedGoals: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default_update_2',
        title: 'Started Planning Everest Base Camp Trek',
        content: 'Began researching gear, fitness requirements, and best seasons for the Everest Base Camp trek. This is going to be an amazing adventure!',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'milestone',
        mood: 'motivated',
        relatedGoals: ['default_1'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private static getDefaultBucketList(): BucketListItem[] {
    return [
      {
        id: 'default_bucket_1',
        title: 'Learn to Scuba Dive',
        description: 'Get certified for scuba diving and explore underwater worlds',
        category: 'adventure',
        estimatedCost: 500,
        timeRequired: '2 weeks',
        difficulty: 'medium',
        status: 'wishlist',
        priority: 7,
        notes: 'Research good diving locations in Southeast Asia',
        createdAt: new Date().toISOString()
      },
      {
        id: 'default_bucket_2',
        title: 'Write a Book',
        description: 'Write and publish a book about design and technology',
        category: 'creative',
        timeRequired: '1 year',
        difficulty: 'hard',
        status: 'wishlist',
        priority: 6,
        notes: 'Could be about AI-driven design or my journey as a designer-developer',
        createdAt: new Date().toISOString()
      },
      {
        id: 'default_bucket_3',
        title: 'Run a Marathon',
        description: 'Complete a full 42.2km marathon race',
        category: 'fitness',
        timeRequired: '6 months training',
        difficulty: 'hard',
        status: 'planning',
        priority: 8,
        notes: 'Start with half marathons and build up endurance',
        createdAt: new Date().toISOString()
      }
    ];
  }
}

export default LifeRoadmapCMS;
