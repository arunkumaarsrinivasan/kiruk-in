/**
 * Grid Collector Game (Portfolio Edition)
 *
 * Collect spawning portfolio items before they disappear!
 * Each item reveals skills, projects, and info about the developer.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { COLLECTOR_CONFIG, type CollectorGameConfig } from '../game-configs';
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
  personal: '#a855f7',
  education: '#3b82f6',
};

interface PortfolioItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  detail: string;
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
      detail: `${skill.name} ${skill.level}/10`,
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
      name: exp.company,
      icon: '💼',
      color: CATEGORY_COLORS.experience,
      category: 'experience',
      detail: exp.position,
    });
  });
  
  // Add education
  portfolioData.education.forEach(edu => {
    items.push({
      id: edu.id,
      name: edu.degree,
      icon: '🎓',
      color: CATEGORY_COLORS.education,
      category: 'education',
      detail: edu.field,
    });
  });
  
  // Add personal info
  items.push({
    id: 'tagline',
    name: 'Tagline',
    icon: '✨',
    color: CATEGORY_COLORS.personal,
    category: 'personal',
    detail: portfolioData.personal.tagline,
  });
  
  items.push({
    id: 'email',
    name: 'Contact',
    icon: '✉️',
    color: '#ef4444',
    category: 'contact',
    detail: portfolioData.personal.email,
  });
  
  return items;
}

const PORTFOLIO_ITEMS = buildPortfolioItems();

interface CollectibleItem {
  x: number;
  y: number;
  portfolioItem: PortfolioItem;
  spawnTime: number;
  lifetime: number;
  points: number;
  labelWidth: number;
}

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  timestamp: number;
}

export class CollectorGame extends BaseGridGame {
  readonly id = COLLECTOR_CONFIG.id;
  readonly label = COLLECTOR_CONFIG.label;
  readonly description = COLLECTOR_CONFIG.description;

  private config: CollectorGameConfig;
  private items: CollectibleItem[] = [];
  private combo = 0;
  private lastCollectTime = 0;
  private spawnAccumulator = 0;
  private trail: TrailPoint[] = [];
  private itemIndex = 0;
  private lastCollectedItem: PortfolioItem | null = null;
  private itemDisplayTimer = 0;

  constructor(config: Partial<CollectorGameConfig> = {}) {
    super();
    this.config = { ...COLLECTOR_CONFIG, ...config };
  }

  protected onReset(): void {
    this.items = [];
    this.combo = 0;
    this.lastCollectTime = 0;
    this.spawnAccumulator = 0;
    this.trail = [];
    this.itemIndex = 0;
    this.lastCollectedItem = null;
    this.itemDisplayTimer = 0;

    // Spawn initial items
    for (let i = 0; i < 3; i++) {
      this.spawnItem();
    }
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    const now = Date.now();

    // Decay item display timer
    if (this.itemDisplayTimer > 0) {
      this.itemDisplayTimer -= dt;
    }

    // Spawn new items
    this.spawnAccumulator += dt;
    while (this.spawnAccumulator >= this.config.spawnInterval) {
      this.spawnAccumulator -= this.config.spawnInterval;
      if (this.items.length < this.config.maxItems) {
        this.spawnItem();
      }
    }

    // Remove expired items
    this.items = this.items.filter(item => {
      const age = now - item.spawnTime;
      return age < item.lifetime;
    });

    // Decay combo
    if (now - this.lastCollectTime > this.config.comboTimeout * 1.5) {
      this.combo = 0;
    }

    // Update trail
    this.trail = this.trail
      .map(t => ({ ...t, opacity: Math.max(0, 1 - (now - t.timestamp) / 300) }))
      .filter(t => t.opacity > 0);

    // Check collection
    if (this.cursorCell) {
      this.checkCollection(this.cursorCell);
    }

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Add to trail
    this.trail.push({
      x: cell.x,
      y: cell.y,
      opacity: 1,
      timestamp: Date.now(),
    });
    if (this.trail.length > 10) {
      this.trail.shift();
    }

    this.checkCollection(cell);
  }

  protected getSegments(): GridSegment[] {
    return this.trail.map(t => ({
      x: t.x,
      y: t.y,
      color: this.config.primaryColor,
      opacity: t.opacity * 0.5,
    }));
  }

  protected getFood(): GridFood[] {
    return this.items.map(item => ({
      x: item.x,
      y: item.y,
      color: item.portfolioItem.color,
      icon: item.portfolioItem.icon,
      label: item.portfolioItem.name,
      labelWidth: item.labelWidth,
      category: item.portfolioItem.category,
      interactive: true,
    }));
  }

  private spawnItem(): void {
    // Get occupied cells including label widths
    const occupied = new Set<string>();
    this.items.forEach(item => {
      for (let dx = 0; dx < item.labelWidth; dx++) {
        occupied.add(this.cellKey({ x: item.x + dx, y: item.y }));
      }
    });
    if (this.cursorCell) {
      occupied.add(this.cellKey(this.cursorCell));
    }

    // Get next portfolio item in rotation
    const portfolioItem = PORTFOLIO_ITEMS[this.itemIndex % PORTFOLIO_ITEMS.length];
    this.itemIndex++;
    
    // Calculate label width
    const labelWidth = Math.min(Math.ceil(portfolioItem.name.length / 1.5) + 2, 10);
    
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
    
    if (!cell) return;

    const lifetime = this.config.baseLifetime * (0.8 + Math.random() * 0.4);

    this.items.push({
      x: cell.x,
      y: cell.y,
      portfolioItem,
      spawnTime: Date.now(),
      lifetime,
      points: this.config.pointsPerItem,
      labelWidth,
    });
  }

  private checkCollection(cell: GridCell): void {
    const now = Date.now();
    
    // Find items that the cursor is touching (considering label width)
    const collected = this.items.filter(item => 
      cell.y === item.y && cell.x >= item.x && cell.x < item.x + item.labelWidth
    );

    if (collected.length > 0) {
      // Update combo
      if (now - this.lastCollectTime < this.config.comboTimeout) {
        this.combo++;
      } else {
        this.combo = 1;
      }
      this.lastCollectTime = now;

      // Store last collected item and show info
      this.lastCollectedItem = collected[0].portfolioItem;
      this.itemDisplayTimer = 2000;

      // Add score with combo multiplier
      for (const item of collected) {
        this.addScore(item.points * this.combo);
      }

      // Remove collected items
      this.items = this.items.filter(item => 
        !(cell.y === item.y && cell.x >= item.x && cell.x < item.x + item.labelWidth)
      );
    }
  }

  private updateStatus(): void {
    const comboText = this.combo > 1 ? ` 🔥x${this.combo}` : '';
    
    if (this.lastCollectedItem && this.itemDisplayTimer > 0) {
      this.setStatus(`${this.lastCollectedItem.icon} ${this.lastCollectedItem.detail}${comboText}`);
    } else {
      this.setStatus(`${this.config.scoreLabel}: ${this.state.score}${comboText}`);
    }
  }
}

export function createCollectorGame(config?: Partial<CollectorGameConfig>) {
  return new CollectorGame(config);
}
