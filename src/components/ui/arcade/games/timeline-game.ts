/**
 * Timeline Explorer Game
 *
 * Navigate through a timeline of career milestones!
 * Move left/right through time, collecting achievements and learning about the journey.
 * Each milestone reveals a story from the developer's career.
 */

import { BaseGridGame } from '../base-grid-game';
import type { BaseGameConfig } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';

export interface TimelineGameConfig extends BaseGameConfig {
  scrollSpeed: number;
  milestoneSpacing: number;
}

export const TIMELINE_CONFIG: TimelineGameConfig = {
  id: 'timeline',
  label: 'Timeline Trek',
  description: 'Travel through my career timeline! Each milestone reveals a story.',
  primaryColor: 'var(--accent-color)',
  secondaryColor: '#8b5cf6',
  scoreLabel: 'Milestones',
  scrollSpeed: 0.1,
  milestoneSpacing: 15,
};

// Career milestones with detailed stories
const CAREER_MILESTONES = [
  {
    year: '2019',
    title: 'Started College',
    icon: '🎓',
    color: '#3b82f6',
    story: 'Began B.Tech at Sona College of Technology. First exposure to programming!',
    detail: 'Computer Science Engineering',
  },
  {
    year: '2020',
    title: 'Pandemic Lab',
    icon: '🧪',
    color: '#8b5cf6',
    story: 'Lockdown became a learning lab. Self-taught game dev, UI/UX, and motion graphics.',
    detail: 'Self-Learning Era',
  },
  {
    year: '2021',
    title: 'Design Lead',
    icon: '🎨',
    color: '#ec4899',
    story: 'Led design for college cultural fest. 1000+ attendees, countless posters!',
    detail: 'Sona Cultural Committee',
  },
  {
    year: '2022',
    title: 'First Internship',
    icon: '💼',
    color: '#f97316',
    story: 'Joined SNS Square as Product Design Intern. Built Squarebridge Design System.',
    detail: 'SNS Square',
  },
  {
    year: '2022',
    title: 'PeopleGamez',
    icon: '🎮',
    color: '#22c55e',
    story: 'Designed gamified HR platform. Made hiring playful and measurable!',
    detail: 'Gamification Design',
  },
  {
    year: '2023',
    title: 'Graduated',
    icon: '🎉',
    color: '#eab308',
    story: 'Completed B.Tech with distinction. Ready for the industry!',
    detail: 'B.Tech CSE',
  },
  {
    year: '2023',
    title: 'Joined HP',
    icon: '🖨️',
    color: '#06b6d4',
    story: 'Started as SDE-1 at HP Inc. Working on Print AI Observability.',
    detail: 'HP Inc. Bangalore',
  },
  {
    year: '2024',
    title: 'AI & Cloud',
    icon: '☁️',
    color: '#a855f7',
    story: 'Deep dive into Spring Boot, AWS, and AI/ML observability systems.',
    detail: 'Full-Stack Evolution',
  },
  {
    year: '2024',
    title: 'This Portfolio',
    icon: '🚀',
    color: '#ef4444',
    story: 'Built this gamified portfolio to showcase my playful approach to tech!',
    detail: 'You are here!',
  },
];

interface TimelineMilestone {
  x: number;
  year: string;
  title: string;
  icon: string;
  color: string;
  story: string;
  detail: string;
  collected: boolean;
}

export class TimelineGame extends BaseGridGame {
  readonly id = TIMELINE_CONFIG.id;
  readonly label = TIMELINE_CONFIG.label;
  readonly description = TIMELINE_CONFIG.description;

  private config: TimelineGameConfig;
  private playerX = 0;
  private playerY = 0;
  private milestones: TimelineMilestone[] = [];
  private cameraOffset = 0;
  private collectedMilestones: TimelineMilestone[] = [];
  private showingStory: TimelineMilestone | null = null;
  private storyTimer = 0;
  private timelineY = 0;

  constructor(config: Partial<TimelineGameConfig> = {}) {
    super();
    this.config = { ...TIMELINE_CONFIG, ...config };
  }

  protected onReset(): void {
    this.playerX = 5;
    this.timelineY = Math.floor(this.gridHeight / 2);
    this.playerY = this.timelineY;
    this.cameraOffset = 0;
    this.collectedMilestones = [];
    this.showingStory = null;
    this.storyTimer = 0;
    
    // Create milestones along the timeline
    this.milestones = CAREER_MILESTONES.map((m, i) => ({
      x: 10 + i * this.config.milestoneSpacing,
      year: m.year,
      title: m.title,
      icon: m.icon,
      color: m.color,
      story: m.story,
      detail: m.detail,
      collected: false,
    }));
    
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    // Decay story display timer
    if (this.storyTimer > 0) {
      this.storyTimer -= dt;
      if (this.storyTimer <= 0) {
        this.showingStory = null;
      }
    }

    // Check milestone collection
    this.checkMilestoneCollection();
    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Player follows cursor horizontally, stays on timeline vertically
    this.playerX = cell.x + Math.floor(this.cameraOffset);
    this.playerY = this.timelineY;
    
    // Move camera to follow player
    const viewCenter = Math.floor(this.gridWidth / 2);
    if (cell.x > viewCenter + 5) {
      this.cameraOffset += this.config.scrollSpeed * 2;
    } else if (cell.x < viewCenter - 5) {
      this.cameraOffset = Math.max(0, this.cameraOffset - this.config.scrollSpeed * 2);
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];
    
    // Draw timeline track
    const trackY = this.timelineY;
    for (let x = 0; x < this.gridWidth + 20; x++) {
      segments.push({
        x: x,
        y: trackY,
        color: 'var(--border-color)',
        opacity: 0.3,
      });
    }
    
    // Draw year markers
    for (let year = 2019; year <= 2025; year++) {
      const yearX = 10 + (year - 2019) * 20 - Math.floor(this.cameraOffset);
      if (yearX >= 0 && yearX < this.gridWidth) {
        // Vertical line at year
        for (let dy = -2; dy <= 2; dy++) {
          segments.push({
            x: yearX,
            y: trackY + dy,
            color: 'var(--text-muted)',
            opacity: 0.4,
          });
        }
      }
    }
    
    // Draw player
    const playerScreenX = this.playerX - Math.floor(this.cameraOffset);
    if (playerScreenX >= 0 && playerScreenX < this.gridWidth) {
      // Player indicator (arrow shape)
      segments.push({
        x: playerScreenX,
        y: this.playerY,
        color: this.config.primaryColor,
        opacity: 1,
      });
      segments.push({
        x: playerScreenX,
        y: this.playerY - 1,
        color: this.config.primaryColor,
        opacity: 0.8,
      });
      segments.push({
        x: playerScreenX - 1,
        y: this.playerY,
        color: this.config.primaryColor,
        opacity: 0.6,
      });
      segments.push({
        x: playerScreenX + 1,
        y: this.playerY,
        color: this.config.primaryColor,
        opacity: 0.6,
      });
    }
    
    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    // Draw milestones
    for (const milestone of this.milestones) {
      const screenX = milestone.x - Math.floor(this.cameraOffset);
      
      // Only show if on screen
      if (screenX >= -5 && screenX < this.gridWidth + 5) {
        if (!milestone.collected) {
          // Uncollected milestone
          food.push({
            x: screenX,
            y: this.timelineY - 3,
            color: milestone.color,
            icon: milestone.icon,
            label: milestone.year,
            labelWidth: 4,
            interactive: true,
          });
          // Title below
          food.push({
            x: screenX,
            y: this.timelineY + 2,
            color: milestone.color,
            label: milestone.title,
            labelWidth: Math.ceil(milestone.title.length / 1.5) + 1,
            interactive: false,
          });
        } else {
          // Collected - show checkmark
          food.push({
            x: screenX,
            y: this.timelineY - 2,
            color: '#22c55e',
            icon: '✓',
            label: milestone.year,
            labelWidth: 4,
            interactive: false,
          });
        }
      }
    }
    
    // Show current story if any
    if (this.showingStory) {
      const storyWidth = Math.min(Math.ceil(this.showingStory.story.length / 2), 30);
      food.push({
        x: Math.floor(this.gridWidth / 2) - Math.floor(storyWidth / 2),
        y: 5,
        color: this.showingStory.color,
        icon: this.showingStory.icon,
        label: this.showingStory.story,
        labelWidth: storyWidth,
        interactive: false,
      });
    }
    
    // Progress indicator
    const progress = `${this.collectedMilestones.length}/${this.milestones.length}`;
    food.push({
      x: this.gridWidth - 8,
      y: 2,
      color: 'var(--accent-color)',
      icon: '📅',
      label: progress,
      labelWidth: 5,
      interactive: false,
    });
    
    return food;
  }

  private checkMilestoneCollection(): void {
    for (const milestone of this.milestones) {
      if (milestone.collected) continue;
      
      // Check if player is near this milestone
      const distance = Math.abs(this.playerX - milestone.x);
      if (distance < 2) {
        milestone.collected = true;
        this.collectedMilestones.push(milestone);
        this.showingStory = milestone;
        this.storyTimer = 4000; // Show story for 4 seconds
        this.addScore(1);
      }
    }
  }

  private updateStatus(): void {
    if (this.showingStory) {
      this.setStatus(`${this.showingStory.icon} ${this.showingStory.year}: ${this.showingStory.detail}`);
    } else {
      const remaining = this.milestones.filter(m => !m.collected).length;
      if (remaining === 0) {
        this.setStatus('🎉 Journey Complete! You know my whole story!');
      } else {
        this.setStatus(`📅 ${remaining} milestones to discover | Move → to explore`);
      }
    }
  }
}

export function createTimelineGame(config?: Partial<TimelineGameConfig>) {
  return new TimelineGame(config);
}
