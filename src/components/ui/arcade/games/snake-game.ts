/**
 * Snake Trail Game (Portfolio Edition)
 *
 * A cursor-controlled snake that grows by eating portfolio items.
 * Each food item reveals skills, projects, and info about the developer.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { SNAKE_CONFIG, type SnakeGameConfig } from '../game-configs';
import type { GridCell, GridSegment, GridFood } from '../types';
import { portfolioData } from '@/data/portfolio-data';

// Skill icons mapping
const SKILL_ICONS: Record<string, string> = {
  react: '⚛️',
  typescript: '📘',
  nextjs: '▲',
  nodejs: '🟢',
  'ux-design': '🎨',
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#61dafb',
  backend: '#68a063',
  design: '#ec4899',
  tools: '#f97316',
  soft: '#8b5cf6',
  project: '#22c55e',
  experience: '#eab308',
};

interface PortfolioItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  detail: string;
  level?: number;
}

// Build portfolio items from real data
function buildPortfolioItems(): PortfolioItem[] {
  const items: PortfolioItem[] = [];
  
  // Add skills
  portfolioData.skills.forEach(skill => {
    items.push({
      id: skill.id,
      name: skill.name,
      icon: SKILL_ICONS[skill.id] || '💡',
      color: CATEGORY_COLORS[skill.category] || '#3b82f6',
      category: skill.category,
      detail: `${skill.name} - ${skill.level}/10 - ${skill.yearsOfExperience}yrs`,
      level: skill.level,
    });
  });
  
  // Add projects
  portfolioData.projects.forEach(project => {
    items.push({
      id: project.id,
      name: project.title,
      icon: '🚀',
      color: CATEGORY_COLORS.project,
      category: 'project',
      detail: project.description,
    });
  });
  
  // Add experience
  portfolioData.experience.forEach(exp => {
    items.push({
      id: exp.id,
      name: exp.position,
      icon: '💼',
      color: CATEGORY_COLORS.experience,
      category: 'experience',
      detail: `${exp.position} @ ${exp.company}`,
    });
  });
  
  // Add personal info
  items.push({
    id: 'name',
    name: portfolioData.personal.name,
    icon: '👤',
    color: '#a855f7',
    category: 'personal',
    detail: portfolioData.personal.fullName,
  });
  
  items.push({
    id: 'title',
    name: portfolioData.personal.title,
    icon: '🎯',
    color: '#06b6d4',
    category: 'personal',
    detail: portfolioData.personal.title,
  });
  
  items.push({
    id: 'location',
    name: portfolioData.personal.location,
    icon: '📍',
    color: '#f97316',
    category: 'personal',
    detail: portfolioData.personal.location,
  });
  
  return items;
}

const PORTFOLIO_ITEMS = buildPortfolioItems();

interface PortfolioFood extends GridCell {
  item: PortfolioItem;
}

export class SnakeGame extends BaseGridGame {
  readonly id = SNAKE_CONFIG.id;
  readonly label = SNAKE_CONFIG.label;
  readonly description = SNAKE_CONFIG.description;

  private config: SnakeGameConfig;
  private segments: GridCell[] = [];
  private cursorHistory: GridCell[] = [];
  private targetLength: number;
  private food: PortfolioFood | null = null;
  private timeAccumulator = 0;
  private collectedItems: PortfolioItem[] = [];
  private currentItemIndex = 0;
  private lastCollectedItem: PortfolioItem | null = null;
  private itemDisplayTimer = 0;

  constructor(config: Partial<SnakeGameConfig> = {}) {
    super();
    this.config = { ...SNAKE_CONFIG, ...config };
    this.targetLength = this.config.initialLength;
  }

  protected onReset(): void {
    const centerX = Math.floor(this.gridWidth / 2);
    const centerY = Math.floor(this.gridHeight / 2);

    this.segments = [];
    for (let i = 0; i < this.config.initialLength; i++) {
      this.segments.push({ x: centerX, y: centerY + i });
    }

    this.cursorHistory = [];
    this.targetLength = this.config.initialLength;
    this.timeAccumulator = 0;
    this.collectedItems = [];
    this.currentItemIndex = 0;
    this.lastCollectedItem = null;
    this.itemDisplayTimer = 0;
    this.spawnFood();
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    this.timeAccumulator += dt;

    // Decay item display timer
    if (this.itemDisplayTimer > 0) {
      this.itemDisplayTimer -= dt;
    }

    // Add segments from cursor history at regular intervals
    if (this.isPointerActive && this.cursorHistory.length > 0) {
      while (this.timeAccumulator >= this.config.segmentInterval) {
        this.timeAccumulator -= this.config.segmentInterval;
        const nextPos = this.cursorHistory.shift();
        if (nextPos) {
          this.addSegment(nextPos);
        }
      }
    }

    this.checkFoodCollision();
    this.updateStatus();
  }

  protected onCursorPath(cell: GridCell): void {
    this.cursorHistory.push(cell);
    while (this.cursorHistory.length > this.config.maxHistorySize) {
      this.cursorHistory.shift();
    }
  }

  protected onCursorLeave(): void {
    // Continue game, just stop adding to history
  }

  protected getSegments(): GridSegment[] {
    return this.segments.map((seg, index) => {
      const progress = index / Math.max(1, this.segments.length - 1);
      const opacity = 1.0 - progress * (1.0 - this.config.minOpacity);
      // Use the color of the last collected item for the snake head area
      const color = index < 3 && this.lastCollectedItem 
        ? this.lastCollectedItem.color 
        : this.config.primaryColor;
      return {
        x: seg.x,
        y: seg.y,
        color,
        opacity,
      };
    });
  }

  protected getFood(): GridFood[] {
    if (!this.food) return [];
    
    // Calculate label width based on text length (approx 1 cell per 2 chars)
    const labelWidth = Math.min(Math.ceil(this.food.item.name.length / 1.5) + 2, 12);
    
    return [{
      x: this.food.x,
      y: this.food.y,
      color: this.food.item.color,
      icon: this.food.item.icon,
      label: this.food.item.name,
      labelWidth,
      category: this.food.item.category,
      interactive: true,
    }];
  }

  private addSegment(cell: GridCell): void {
    this.segments.unshift(cell);
    while (this.segments.length > this.targetLength) {
      this.segments.pop();
    }
  }

  private checkFoodCollision(): void {
    if (!this.food || this.segments.length === 0) return;
    
    // Check if snake head is within the food label area
    const labelWidth = Math.min(Math.ceil(this.food.item.name.length / 1.5) + 2, 12);
    const headX = this.segments[0].x;
    const headY = this.segments[0].y;
    
    if (headY === this.food.y && headX >= this.food.x && headX < this.food.x + labelWidth) {
      // Collect the portfolio item
      this.lastCollectedItem = this.food.item;
      this.collectedItems.push(this.food.item);
      this.itemDisplayTimer = 3000; // Show item info for 3 seconds
      
      this.addScore(1);
      this.targetLength += 2;
      this.spawnFood();
    }
  }

  private spawnFood(): void {
    const occupied = new Set(this.segments.map(s => this.cellKey(s)));
    
    // Get next portfolio item in rotation
    const item = PORTFOLIO_ITEMS[this.currentItemIndex % PORTFOLIO_ITEMS.length];
    this.currentItemIndex++;
    
    // Calculate required space for label
    const labelWidth = Math.min(Math.ceil(item.name.length / 1.5) + 2, 12);
    
    // Find a position that fits the label
    let attempts = 0;
    let cell: GridCell | null = null;
    
    while (attempts < 50) {
      const x = Math.floor(Math.random() * (this.gridWidth - labelWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
      
      // Check if space is clear
      let clear = true;
      for (let dx = 0; dx < labelWidth; dx++) {
        if (occupied.has(this.cellKey({ x: x + dx, y }))) {
          clear = false;
          break;
        }
      }
      
      if (clear) {
        cell = { x, y };
        break;
      }
      attempts++;
    }
    
    if (!cell) {
      cell = this.getRandomEmptyCell(occupied);
    }
    
    if (cell) {
      this.food = { ...cell, item };
    }
  }

  private updateStatus(): void {
    // Show collected item info or score
    if (this.lastCollectedItem && this.itemDisplayTimer > 0) {
      this.setStatus(`${this.lastCollectedItem.icon} ${this.lastCollectedItem.detail}`);
    } else if (this.food) {
      this.setStatus(`🎯 Collect: ${this.food.item.name} | Collected: ${this.state.score}`);
    } else {
      this.setStatus(`Collected: ${this.state.score}`);
    }
  }
}

export function createSnakeGame(config?: Partial<SnakeGameConfig>) {
  return new SnakeGame(config);
}
