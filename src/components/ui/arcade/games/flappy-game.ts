/**
 * Grid Flappy Bird Game (Portfolio Edition)
 *
 * Navigate through skill gates and collect portfolio items!
 * Each gate represents a skill milestone.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { FLAPPY_CONFIG, type FlappyGameConfig } from '../game-configs';
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

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
  skill: PortfolioItem;
}

export class FlappyGame extends BaseGridGame {
  readonly id = FLAPPY_CONFIG.id;
  readonly label = FLAPPY_CONFIG.label;
  readonly description = FLAPPY_CONFIG.description;

  private config: FlappyGameConfig;
  private bird: { x: number; y: number; velocity: number } = { x: 0, y: 0, velocity: 0 };
  private pipes: Pipe[] = [];
  private pipeTimer = 0;
  private pipesPassed = 0;
  private targetY = 0;
  private lastPassedSkill: PortfolioItem | null = null;
  private skillDisplayTimer = 0;
  private skillIndex = 0;

  constructor(config: Partial<FlappyGameConfig> = {}) {
    super();
    this.config = { ...FLAPPY_CONFIG, ...config };
  }

  protected onReset(): void {
    this.bird = {
      x: Math.floor(this.gridWidth * 0.25),
      y: Math.floor(this.gridHeight / 2),
      velocity: 0,
    };
    this.pipes = [];
    this.pipeTimer = 0;
    this.pipesPassed = 0;
    this.targetY = this.bird.y;
    this.lastPassedSkill = null;
    this.skillDisplayTimer = 0;
    this.skillIndex = 0;

    // Spawn initial pipes
    for (let i = 0; i < 3; i++) {
      this.spawnPipe(this.gridWidth * 0.5 + i * this.config.pipeSpacing);
    }

    this.updateStatus();
  }

  private spawnPipe(x: number): void {
    const minGapY = this.config.gapSize + 2;
    const maxGapY = this.gridHeight - this.config.gapSize - 2;
    const gapY = Math.floor(Math.random() * (maxGapY - minGapY)) + minGapY;
    const skill = PORTFOLIO_ITEMS[this.skillIndex % PORTFOLIO_ITEMS.length];
    this.skillIndex++;
    
    this.pipes.push({
      x,
      gapY,
      passed: false,
      skill,
    });
  }

  protected onUpdate(dt: number): void {
    if (this.skillDisplayTimer > 0) {
      this.skillDisplayTimer -= dt;
    }

    // Move bird towards target Y (controlled by cursor)
    const targetDiff = this.targetY - this.bird.y;
    this.bird.velocity = Math.sign(targetDiff) * Math.min(Math.abs(targetDiff) * 0.15, this.config.flapStrength);
    this.bird.y += this.bird.velocity;

    // Clamp bird position
    this.bird.y = Math.max(0, Math.min(this.gridHeight - 1, this.bird.y));

    // Move pipes
    for (const pipe of this.pipes) {
      pipe.x -= this.config.scrollSpeed;
      
      // Check if passed
      if (!pipe.passed && pipe.x < this.bird.x) {
        pipe.passed = true;
        this.pipesPassed++;
        this.lastPassedSkill = pipe.skill;
        this.skillDisplayTimer = 1500;
        this.addScore(this.config.pipeScore);
      }
    }

    // Remove off-screen pipes and spawn new ones
    this.pipes = this.pipes.filter(pipe => pipe.x > -2);
    
    this.pipeTimer += dt;
    if (this.pipes.length < 5 && this.pipeTimer >= this.config.pipeInterval) {
      this.pipeTimer = 0;
      const lastPipe = this.pipes[this.pipes.length - 1];
      if (lastPipe) {
        this.spawnPipe(lastPipe.x + this.config.pipeSpacing);
      }
    }

    // Check collisions
    this.checkCollisions();

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Bird follows cursor Y position
    this.targetY = cell.y;
  }

  private checkCollisions(): void {
    const birdY = Math.round(this.bird.y);
    
    // Check floor/ceiling
    if (birdY <= 0 || birdY >= this.gridHeight - 1) {
      this.endGame();
      return;
    }

    // Check pipe collisions
    for (const pipe of this.pipes) {
      const pipeX = Math.round(pipe.x);
      
      // Check if bird is at pipe X position
      if (Math.abs(pipeX - this.bird.x) <= 1) {
        // Check if bird is in the gap
        const gapTop = pipe.gapY - this.config.gapSize;
        const gapBottom = pipe.gapY + this.config.gapSize;
        
        if (birdY <= gapTop || birdY >= gapBottom) {
          this.endGame();
          return;
        }
      }
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];

    // Render pipes - simplified to just edges
    for (const pipe of this.pipes) {
      const pipeX = Math.round(pipe.x);
      if (pipeX < 0 || pipeX >= this.gridWidth) continue;
      
      const gapTop = pipe.gapY - this.config.gapSize;
      const gapBottom = pipe.gapY + this.config.gapSize;
      
      // Top pipe - just top and bottom edge
      segments.push({ x: pipeX, y: 0, color: pipe.skill.color, opacity: 0.6 });
      segments.push({ x: pipeX, y: gapTop - 1, color: pipe.skill.color, opacity: 0.9 });
      
      // Bottom pipe - just top and bottom edge  
      segments.push({ x: pipeX, y: gapBottom, color: pipe.skill.color, opacity: 0.9 });
      segments.push({ x: pipeX, y: this.gridHeight - 1, color: pipe.skill.color, opacity: 0.6 });
    }

    // Render bird
    const birdY = Math.round(this.bird.y);
    segments.push({
      x: this.bird.x,
      y: birdY,
      color: this.config.birdColor,
      opacity: 1,
    });

    // Render floor and ceiling - sparse markers
    for (let x = 0; x < this.gridWidth; x += 8) {
      segments.push({ x, y: 0, color: this.config.groundColor, opacity: 0.3 });
      segments.push({ x, y: this.gridHeight - 1, color: this.config.groundColor, opacity: 0.3 });
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    // Only show label on the NEXT upcoming pipe (closest one ahead of bird)
    const upcomingPipe = this.pipes
      .filter(p => Math.round(p.x) >= this.bird.x)
      .sort((a, b) => a.x - b.x)[0];
    
    if (upcomingPipe) {
      const pipeX = Math.round(upcomingPipe.x);
      if (pipeX >= 0 && pipeX < this.gridWidth) {
        const labelWidth = Math.min(Math.ceil(upcomingPipe.skill.name.length / 2) + 2, 5);
        food.push({
          x: pipeX,
          y: upcomingPipe.gapY,
          color: upcomingPipe.skill.color,
          icon: upcomingPipe.skill.icon,
          label: upcomingPipe.skill.name,
          labelWidth,
          category: upcomingPipe.skill.category,
        });
      }
    }
    
    // Bird icon
    const birdY = Math.round(this.bird.y);
    food.push({
      x: this.bird.x,
      y: birdY,
      color: this.config.birdColor,
      icon: '🐦',
    });
    
    return food;
  }

  private updateStatus(): void {
    if (this.state.isGameOver) {
      this.setStatus(`Game Over! Skills Mastered: ${this.pipesPassed}`);
    } else if (this.lastPassedSkill && this.skillDisplayTimer > 0) {
      this.setStatus(`${this.lastPassedSkill.icon} Mastered: ${this.lastPassedSkill.name}! | Skills: ${this.pipesPassed}`);
    } else {
      this.setStatus(`Skills Mastered: ${this.pipesPassed}`);
    }
  }
}

export function createFlappyGame(config?: Partial<FlappyGameConfig>) {
  return new FlappyGame(config);
}
