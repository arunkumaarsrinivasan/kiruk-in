/**
 * Grid Space Shooter Game (Portfolio Edition)
 *
 * Defend against bugs and collect skill power-ups!
 * Each enemy represents a challenge to overcome.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { SHOOTER_CONFIG, type ShooterGameConfig } from '../game-configs';
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

interface Bullet {
  x: number;
  y: number;
  isEnemy: boolean;
}

interface Enemy {
  x: number;
  y: number;
  type: number;
  health: number;
  skill: PortfolioItem;
}

interface PowerUp {
  x: number;
  y: number;
  item: PortfolioItem;
}

export class ShooterGame extends BaseGridGame {
  readonly id = SHOOTER_CONFIG.id;
  readonly label = SHOOTER_CONFIG.label;
  readonly description = SHOOTER_CONFIG.description;

  private config: ShooterGameConfig;
  private ship: GridCell = { x: 0, y: 0 };
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private powerUps: PowerUp[] = [];
  private shootTimer = 0;
  private enemyMoveTimer = 0;
  private enemyShootTimer = 0;
  private enemyDirection = 1;
  private wave = 1;
  private enemiesKilled = 0;
  private skillIndex = 0;
  private collectedSkill: PortfolioItem | null = null;
  private skillDisplayTimer = 0;
  private skillsCollected = 0;

  constructor(config: Partial<ShooterGameConfig> = {}) {
    super();
    this.config = { ...SHOOTER_CONFIG, ...config };
  }

  protected onReset(): void {
    this.ship = {
      x: Math.floor(this.gridWidth / 2),
      y: this.gridHeight - 2,
    };
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.shootTimer = 0;
    this.enemyMoveTimer = 0;
    this.enemyShootTimer = 0;
    this.enemyDirection = 1;
    this.wave = 1;
    this.enemiesKilled = 0;
    this.skillIndex = 0;
    this.collectedSkill = null;
    this.skillDisplayTimer = 0;
    this.skillsCollected = 0;
    
    this.spawnWave();
    this.updateStatus();
  }

  private spawnWave(): void {
    const rows = Math.min(3 + Math.floor(this.wave / 2), 6);
    const cols = Math.min(5 + this.wave, Math.floor(this.gridWidth * 0.6));
    const startX = Math.floor((this.gridWidth - cols * 2) / 2);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const skill = PORTFOLIO_ITEMS[this.skillIndex % PORTFOLIO_ITEMS.length];
        this.skillIndex++;
        this.enemies.push({
          x: startX + col * 2,
          y: 2 + row * 2,
          type: row % 3,
          health: 1 + Math.floor(row / 2),
          skill,
        });
      }
    }
  }

  protected onUpdate(dt: number): void {
    if (this.skillDisplayTimer > 0) {
      this.skillDisplayTimer -= dt;
    }

    // Auto-shoot
    this.shootTimer += dt;
    if (this.shootTimer >= this.config.shootInterval) {
      this.shootTimer = 0;
      this.bullets.push({
        x: this.ship.x,
        y: this.ship.y - 1,
        isEnemy: false,
      });
    }

    // Move bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.isEnemy ? 1 : -1;
      return bullet.y >= 0 && bullet.y < this.gridHeight;
    });

    // Move power-ups down
    this.powerUps = this.powerUps.filter(p => {
      p.y += 0.1;
      return p.y < this.gridHeight;
    });

    // Move enemies
    this.enemyMoveTimer += dt;
    if (this.enemyMoveTimer >= this.config.enemyMoveInterval) {
      this.enemyMoveTimer = 0;
      this.moveEnemies();
    }

    // Enemy shooting
    this.enemyShootTimer += dt;
    if (this.enemyShootTimer >= this.config.enemyShootInterval && this.enemies.length > 0) {
      this.enemyShootTimer = 0;
      const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
      this.bullets.push({
        x: shooter.x,
        y: shooter.y + 1,
        isEnemy: true,
      });
    }

    // Check collisions
    this.checkCollisions();

    // Check power-up collection
    this.checkPowerUpCollection();

    // Next wave
    if (this.enemies.length === 0) {
      this.wave++;
      this.addScore(this.wave * 100);
      this.spawnWave();
    }

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Move ship horizontally based on cursor
    const targetX = Math.max(1, Math.min(this.gridWidth - 2, cell.x));
    this.ship.x = targetX;
  }

  private moveEnemies(): void {
    // Check if any enemy hit the edge
    let hitEdge = false;
    for (const enemy of this.enemies) {
      if ((this.enemyDirection > 0 && enemy.x >= this.gridWidth - 2) ||
          (this.enemyDirection < 0 && enemy.x <= 1)) {
        hitEdge = true;
        break;
      }
    }

    if (hitEdge) {
      // Move down and reverse direction
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.y += 1;
        // Check if reached player
        if (enemy.y >= this.ship.y - 1) {
          this.endGame();
          return;
        }
      }
    } else {
      // Move sideways
      for (const enemy of this.enemies) {
        enemy.x += this.enemyDirection;
      }
    }
  }

  private checkCollisions(): void {
    // Player bullets hitting enemies
    this.bullets = this.bullets.filter(bullet => {
      if (bullet.isEnemy) return true;
      
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (Math.abs(bullet.x - enemy.x) <= 1 && Math.abs(bullet.y - enemy.y) <= 1) {
          enemy.health--;
          if (enemy.health <= 0) {
            // Drop power-up
            if (Math.random() < 0.3) {
              this.powerUps.push({
                x: enemy.x,
                y: enemy.y,
                item: enemy.skill,
              });
            }
            this.enemies.splice(i, 1);
            this.enemiesKilled++;
            this.addScore(this.config.enemyScore * (enemy.type + 1));
          }
          return false; // Remove bullet
        }
      }
      return true;
    });

    // Enemy bullets hitting player
    for (const bullet of this.bullets) {
      if (bullet.isEnemy) {
        if (Math.abs(bullet.x - this.ship.x) <= 1 && Math.abs(bullet.y - this.ship.y) <= 1) {
          this.endGame();
          return;
        }
      }
    }
  }

  private checkPowerUpCollection(): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      if (Math.abs(p.x - this.ship.x) <= 1 && Math.abs(Math.floor(p.y) - this.ship.y) <= 1) {
        this.collectedSkill = p.item;
        this.skillDisplayTimer = 2000;
        this.skillsCollected++;
        this.addScore(25);
        this.powerUps.splice(i, 1);
      }
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];

    // Render ship
    segments.push({
      x: this.ship.x,
      y: this.ship.y,
      color: this.config.shipColor,
      opacity: 1,
    });
    // Ship wings
    segments.push({
      x: this.ship.x - 1,
      y: this.ship.y,
      color: this.config.shipColor,
      opacity: 0.7,
    });
    segments.push({
      x: this.ship.x + 1,
      y: this.ship.y,
      color: this.config.shipColor,
      opacity: 0.7,
    });

    // Render enemies
    for (const enemy of this.enemies) {
      segments.push({
        x: enemy.x,
        y: enemy.y,
        color: this.config.enemyColors[enemy.type % this.config.enemyColors.length],
        opacity: 1,
      });
    }

    // Render bullets
    for (const bullet of this.bullets) {
      segments.push({
        x: bullet.x,
        y: bullet.y,
        color: bullet.isEnemy ? this.config.enemyBulletColor : this.config.bulletColor,
        opacity: 1,
      });
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    // Ship icon
    food.push({
      x: this.ship.x,
      y: this.ship.y,
      color: this.config.shipColor,
      icon: '🚀',
    });
    
    // Enemies with skill icons
    for (const enemy of this.enemies) {
      food.push({
        x: enemy.x,
        y: enemy.y,
        color: enemy.skill.color,
        icon: '👾',
        label: enemy.skill.name,
        labelWidth: Math.min(Math.ceil(enemy.skill.name.length / 1.5) + 2, 5),
        category: enemy.skill.category,
      });
    }
    
    // Power-ups with skill labels
    for (const p of this.powerUps) {
      const labelWidth = Math.min(Math.ceil(p.item.name.length / 1.5) + 2, 6);
      food.push({
        x: p.x,
        y: Math.floor(p.y),
        color: p.item.color,
        icon: p.item.icon,
        label: p.item.name,
        labelWidth,
        category: p.item.category,
        interactive: true,
      });
    }
    
    return food;
  }

  private updateStatus(): void {
    if (this.state.isGameOver) {
      this.setStatus(`Game Over! Wave ${this.wave} | Kills: ${this.enemiesKilled} | Skills: ${this.skillsCollected}`);
    } else if (this.collectedSkill && this.skillDisplayTimer > 0) {
      this.setStatus(`${this.collectedSkill.icon} Collected: ${this.collectedSkill.name}! | Wave ${this.wave}`);
    } else {
      this.setStatus(`Wave ${this.wave} | Kills: ${this.enemiesKilled} | Skills: ${this.skillsCollected}`);
    }
  }
}

export function createShooterGame(config?: Partial<ShooterGameConfig>) {
  return new ShooterGame(config);
}
