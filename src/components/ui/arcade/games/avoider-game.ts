/**
 * Grid Avoider Game (Portfolio Edition)
 *
 * Dodge falling obstacles to survive and collect portfolio items.
 * Difficulty increases over time.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { AVOIDER_CONFIG, type AvoiderGameConfig } from '../game-configs';
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
};

interface PortfolioItem {
  name: string;
  icon: string;
  color: string;
  category: string;
}

function buildPortfolioItems(): PortfolioItem[] {
  return portfolioData.skills.map(skill => ({
    name: skill.name,
    icon: SKILL_ICONS[skill.id] || '💡',
    color: CATEGORY_COLORS[skill.category] || '#3b82f6',
    category: skill.category,
  }));
}

const PORTFOLIO_ITEMS = buildPortfolioItems();

interface Obstacle {
  x: number;
  y: number;
  speed: number;
}

interface Collectible {
  x: number;
  y: number;
  speed: number;
  item: PortfolioItem;
}

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export class AvoiderGame extends BaseGridGame {
  readonly id = AVOIDER_CONFIG.id;
  readonly label = AVOIDER_CONFIG.label;
  readonly description = AVOIDER_CONFIG.description;

  private config: AvoiderGameConfig;
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private timeAccumulator = 0;
  private spawnAccumulator = 0;
  private collectibleSpawnAccumulator = 0;
  private spawnInterval: number;
  private currentSpeed: number;
  private playerTrail: TrailPoint[] = [];
  private collectedItem: PortfolioItem | null = null;
  private itemDisplayTimer = 0;
  private skillsCollected = 0;
  private itemIndex = 0;

  constructor(config: Partial<AvoiderGameConfig> = {}) {
    super();
    this.config = { ...AVOIDER_CONFIG, ...config };
    this.spawnInterval = this.config.initialSpawnInterval;
    this.currentSpeed = this.config.baseSpeed;
  }

  protected onReset(): void {
    this.obstacles = [];
    this.collectibles = [];
    this.timeAccumulator = 0;
    this.spawnAccumulator = 0;
    this.collectibleSpawnAccumulator = 0;
    this.spawnInterval = this.config.initialSpawnInterval;
    this.currentSpeed = this.config.baseSpeed;
    this.playerTrail = [];
    this.collectedItem = null;
    this.itemDisplayTimer = 0;
    this.skillsCollected = 0;
    this.itemIndex = 0;
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    // Update score (survival time)
    this.timeAccumulator += dt;
    this.setScore(Math.floor(this.timeAccumulator / 100));

    if (this.itemDisplayTimer > 0) {
      this.itemDisplayTimer -= dt;
    }

    // Increase difficulty
    this.currentSpeed += this.config.speedIncrease * (dt / 1000);
    this.spawnInterval = Math.max(
      this.config.minSpawnInterval,
      this.config.initialSpawnInterval - this.state.score * 2
    );

    // Spawn obstacles
    this.spawnAccumulator += dt;
    while (this.spawnAccumulator >= this.spawnInterval) {
      this.spawnAccumulator -= this.spawnInterval;
      this.spawnObstacles();
    }

    // Spawn collectibles (portfolio items)
    this.collectibleSpawnAccumulator += dt;
    if (this.collectibleSpawnAccumulator >= 2000) {
      this.collectibleSpawnAccumulator = 0;
      this.spawnCollectible();
    }

    // Update obstacle positions
    for (const obstacle of this.obstacles) {
      obstacle.y += obstacle.speed * dt;
    }

    // Update collectible positions
    for (const collectible of this.collectibles) {
      collectible.y += collectible.speed * dt;
    }

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(o => o.y < this.gridHeight);
    this.collectibles = this.collectibles.filter(c => c.y < this.gridHeight);

    // Update player trail
    this.playerTrail = this.playerTrail
      .map(t => ({ ...t, opacity: t.opacity - 0.05 }))
      .filter(t => t.opacity > 0);

    // Check collision
    if (this.cursorCell) {
      this.checkCollision(this.cursorCell);
      this.checkCollectibleCollection(this.cursorCell);
    }

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Add to trail
    if (!this.cursorCell || !this.cellsEqual(this.cursorCell, cell)) {
      this.playerTrail.push({ x: cell.x, y: cell.y, opacity: 0.8 });
      if (this.playerTrail.length > 8) {
        this.playerTrail.shift();
      }
    }

    if (!this.state.isGameOver) {
      this.checkCollision(cell);
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = this.playerTrail.map(t => ({
      x: t.x,
      y: t.y,
      color: this.config.safeColor,
      opacity: t.opacity,
    }));

    // Add current cursor position
    if (this.cursorCell && !this.state.isGameOver) {
      segments.push({
        x: this.cursorCell.x,
        y: this.cursorCell.y,
        color: this.config.safeColor,
        opacity: 1,
      });
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    // Obstacles
    for (const o of this.obstacles) {
      food.push({
        x: Math.floor(o.x),
        y: Math.floor(o.y),
        color: this.config.obstacleColor,
        icon: '💥',
      });
    }
    
    // Collectibles with labels
    for (const c of this.collectibles) {
      const labelWidth = Math.min(Math.ceil(c.item.name.length / 1.5) + 2, 6);
      food.push({
        x: Math.floor(c.x),
        y: Math.floor(c.y),
        color: c.item.color,
        icon: c.item.icon,
        label: c.item.name,
        labelWidth,
        category: c.item.category,
        interactive: true,
      });
    }
    
    return food;
  }

  private spawnCollectible(): void {
    const x = Math.floor(Math.random() * this.gridWidth);
    const item = PORTFOLIO_ITEMS[this.itemIndex % PORTFOLIO_ITEMS.length];
    this.itemIndex++;
    
    // Don't spawn where obstacles are
    const hasObstacle = this.obstacles.some(o => Math.abs(o.x - x) < 2 && o.y < 3);
    if (hasObstacle) return;
    
    this.collectibles.push({
      x,
      y: -1,
      speed: this.currentSpeed * 0.5,
      item,
    });
  }

  private checkCollectibleCollection(cell: GridCell): void {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      const cy = Math.floor(c.y);
      if (Math.floor(c.x) === cell.x && cy === cell.y) {
        this.collectedItem = c.item;
        this.itemDisplayTimer = 2000;
        this.skillsCollected++;
        this.addScore(50);
        this.collectibles.splice(i, 1);
      }
    }
  }

  private spawnObstacles(): void {
    const count = 1 + Math.floor(
      Math.random() * Math.min(this.config.maxObstaclesPerSpawn, 1 + this.state.score / 50)
    );

    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * this.gridWidth);

      // Don't spawn directly on cursor
      if (this.cursorCell && Math.abs(x - this.cursorCell.x) < 2 && this.cursorCell.y < 3) {
        continue;
      }

      this.obstacles.push({
        x,
        y: -1,
        speed: this.currentSpeed * (0.8 + Math.random() * 0.4),
      });
    }
  }

  private checkCollision(cell: GridCell): void {
    for (const obstacle of this.obstacles) {
      const obstacleY = Math.floor(obstacle.y);
      if (Math.floor(obstacle.x) === cell.x && obstacleY === cell.y) {
        this.endGame();
        return;
      }
    }
  }

  private updateStatus(): void {
    if (this.state.isGameOver) {
      this.setStatus(`Game Over! ${this.config.scoreLabel}: ${this.state.score} | Skills: ${this.skillsCollected}`);
    } else if (this.collectedItem && this.itemDisplayTimer > 0) {
      this.setStatus(`${this.collectedItem.icon} Collected: ${this.collectedItem.name}! | Skills: ${this.skillsCollected}`);
    } else {
      this.setStatus(`${this.config.scoreLabel}: ${this.state.score} | Skills: ${this.skillsCollected}`);
    }
  }
}

export function createAvoiderGame(config?: Partial<AvoiderGameConfig>) {
  return new AvoiderGame(config);
}
