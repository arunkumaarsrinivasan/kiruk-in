/**
 * Grid Tetris Game (Portfolio Edition)
 *
 * Classic falling blocks with skill-themed pieces!
 * Each block represents a skill - stack them to build your portfolio.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { TETRIS_CONFIG, type TetrisGameConfig } from '../game-configs';
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

interface SkillPiece {
  name: string;
  icon: string;
  color: string;
  category: string;
}

// Build skill pieces from real data
function buildSkillPieces(): SkillPiece[] {
  return portfolioData.skills.map(skill => ({
    name: skill.name,
    icon: SKILL_ICONS[skill.id] || '💡',
    color: CATEGORY_COLORS[skill.category] || '#3b82f6',
    category: skill.category,
  }));
}

const SKILL_PIECES = buildSkillPieces();

// Piece width is based on skill name length
function getSkillWidth(name: string): number {
  return Math.min(Math.max(Math.ceil(name.length / 2) + 1, 3), 8);
}

interface Piece {
  x: number;
  y: number;
  width: number;
  skill: SkillPiece;
}

interface PlacedBlock {
  color: string;
  skill: SkillPiece;
  isStart?: boolean; // marks the leftmost cell of a bar
  barWidth?: number; // width of the bar this cell belongs to
}

export class TetrisGame extends BaseGridGame {
  readonly id = TETRIS_CONFIG.id;
  readonly label = TETRIS_CONFIG.label;
  readonly description = TETRIS_CONFIG.description;

  private config: TetrisGameConfig;
  private board: (PlacedBlock | null)[][] = [];
  private currentPiece: Piece | null = null;
  private dropTimer = 0;
  private lastCursorX = 0;
  private linesCleared = 0;
  private currentSkill: SkillPiece | null = null;
  private skillDisplayTimer = 0;
  private skillIndex = 0;

  constructor(config: Partial<TetrisGameConfig> = {}) {
    super();
    this.config = { ...TETRIS_CONFIG, ...config };
  }

  protected onReset(): void {
    this.board = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(null));
    this.currentPiece = null;
    this.dropTimer = 0;
    this.lastCursorX = Math.floor(this.gridWidth / 2);
    this.linesCleared = 0;
    this.currentSkill = null;
    this.skillDisplayTimer = 0;
    this.skillIndex = 0;
    this.spawnPiece();
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    if (!this.currentPiece) return;

    if (this.skillDisplayTimer > 0) {
      this.skillDisplayTimer -= dt;
    }

    this.dropTimer += dt;
    const dropInterval = this.cursorCell && this.cursorCell.y > this.gridHeight * 0.7
      ? this.config.fastDropInterval
      : this.config.dropInterval;

    if (this.dropTimer >= dropInterval) {
      this.dropTimer = 0;
      if (!this.movePiece(0, 1)) {
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
      }
    }

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    if (!this.currentPiece) return;

    // Move piece towards cursor X position
    const targetX = cell.x - Math.floor(this.currentPiece.width / 2);
    const dx = targetX - this.currentPiece.x;
    
    if (dx !== 0) {
      this.movePiece(Math.sign(dx), 0);
    }

    this.lastCursorX = cell.x;
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];

    // Render placed blocks - only leftmost cell of each bar creates segment
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const block = this.board[y][x];
        if (block) {
          segments.push({
            x, y,
            color: block.color,
            opacity: 1,
          });
        }
      }
    }

    // Render current piece as full bar
    if (this.currentPiece) {
      for (let i = 0; i < this.currentPiece.width; i++) {
        const px = this.currentPiece.x + i;
        if (px >= 0 && px < this.gridWidth) {
          segments.push({
            x: px,
            y: this.currentPiece.y,
            color: this.currentPiece.skill.color,
            opacity: 1,
          });
        }
      }

      // Render ghost piece
      const ghostY = this.getGhostY();
      if (ghostY !== this.currentPiece.y) {
        for (let i = 0; i < this.currentPiece.width; i++) {
          const px = this.currentPiece.x + i;
          if (px >= 0 && px < this.gridWidth) {
            segments.push({
              x: px,
              y: ghostY,
              color: this.currentPiece.skill.color,
              opacity: this.config.ghostOpacity,
            });
          }
        }
      }
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    
    // Show skill label on current piece (positioned at start of bar)
    if (this.currentPiece) {
      food.push({
        x: this.currentPiece.x,
        y: this.currentPiece.y,
        color: this.currentPiece.skill.color,
        icon: this.currentPiece.skill.icon,
        label: this.currentPiece.skill.name,
        labelWidth: this.currentPiece.width,
        category: this.currentPiece.skill.category,
      });
    }

    // Show labels on placed bars (only on start cells)
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const block = this.board[y][x];
        if (block?.isStart && block.barWidth) {
          food.push({
            x, y,
            color: block.color,
            icon: block.skill.icon,
            label: block.skill.name,
            labelWidth: block.barWidth,
            category: block.skill.category,
          });
        }
      }
    }

    return food;
  }

  private spawnPiece(): void {
    const skill = SKILL_PIECES[this.skillIndex % SKILL_PIECES.length];
    this.skillIndex++;
    
    const width = getSkillWidth(skill.name);
    const startX = Math.floor((this.gridWidth - width) / 2);
    
    this.currentPiece = {
      x: startX,
      y: 0,
      width,
      skill,
    };

    this.currentSkill = skill;
    this.skillDisplayTimer = 2000;

    if (!this.isValidPosition(this.currentPiece)) {
      this.endGame();
    }
  }

  private isValidPosition(piece: Piece): boolean {
    for (let i = 0; i < piece.width; i++) {
      const x = piece.x + i;
      const y = piece.y;
      if (x < 0 || x >= this.gridWidth || y >= this.gridHeight) return false;
      if (y >= 0 && this.board[y][x] !== null) return false;
    }
    return true;
  }

  private movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false;
    
    const newPiece = { ...this.currentPiece, x: this.currentPiece.x + dx, y: this.currentPiece.y + dy };
    if (this.isValidPosition(newPiece)) {
      this.currentPiece.x = newPiece.x;
      this.currentPiece.y = newPiece.y;
      return true;
    }
    return false;
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;
    
    for (let i = 0; i < this.currentPiece.width; i++) {
      const x = this.currentPiece.x + i;
      const y = this.currentPiece.y;
      if (y >= 0 && y < this.gridHeight && x >= 0 && x < this.gridWidth) {
        this.board[y][x] = {
          color: this.currentPiece.skill.color,
          skill: this.currentPiece.skill,
          isStart: i === 0,
          barWidth: this.currentPiece.width,
        };
      }
    }
  }

  private clearLines(): void {
    let cleared = 0;
    for (let y = this.gridHeight - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== null)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.gridWidth).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      this.linesCleared += cleared;
      this.addScore(cleared * cleared * 100);
    }
  }

  private getGhostY(): number {
    if (!this.currentPiece) return 0;
    
    let ghostY = this.currentPiece.y;
    const testPiece = { ...this.currentPiece };
    
    while (this.isValidPosition(testPiece)) {
      ghostY = testPiece.y;
      testPiece.y++;
    }
    
    return ghostY;
  }

  // No rotation for horizontal bars

  private updateStatus(): void {
    if (this.state.isGameOver) {
      this.setStatus(`Game Over! Skills Stacked: ${this.linesCleared} lines`);
    } else if (this.currentSkill && this.skillDisplayTimer > 0) {
      this.setStatus(`${this.currentSkill.icon} Placing: ${this.currentSkill.name} | Lines: ${this.linesCleared}`);
    } else {
      this.setStatus(`Lines Cleared: ${this.linesCleared}`);
    }
  }
}

export function createTetrisGame(config?: Partial<TetrisGameConfig>) {
  return new TetrisGame(config);
}
