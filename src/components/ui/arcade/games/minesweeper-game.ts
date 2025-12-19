/**
 * Grid Minesweeper Game (Portfolio Edition)
 *
 * Click to reveal skills and portfolio info! Avoid the mines.
 * Each safe cell reveals a skill, project, or achievement.
 * Uses real portfolio data from @/data/portfolio-data.
 */

import { BaseGridGame } from '../base-grid-game';
import { MINESWEEPER_CONFIG, type MinesweeperGameConfig } from '../game-configs';
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
  
  // Add skills with details
  portfolioData.skills.forEach(skill => {
    items.push({
      id: skill.id,
      name: skill.name,
      icon: SKILL_ICONS[skill.id] || '💡',
      color: CATEGORY_COLORS[skill.category] || '#3b82f6',
      category: skill.category,
      detail: `${skill.level}/10`,
    });
  });
  
  // Add technologies from projects
  portfolioData.projects.forEach(project => {
    project.technologies.slice(0, 3).forEach(tech => {
      if (!items.find(i => i.name === tech)) {
        items.push({
          id: `tech-${tech.toLowerCase()}`,
          name: tech,
          icon: '⚡',
          color: CATEGORY_COLORS.project,
          category: 'tech',
          detail: 'Tech',
        });
      }
    });
  });
  
  // Add achievements from experience
  portfolioData.experience.forEach(exp => {
    exp.achievements.forEach((achievement, i) => {
      items.push({
        id: `ach-${exp.id}-${i}`,
        name: achievement.split(' ').slice(0, 3).join(' '),
        icon: '🏆',
        color: CATEGORY_COLORS.experience,
        category: 'achievement',
        detail: 'Achievement',
      });
    });
  });
  
  // Add personal traits
  const traits = ['Creative', 'Problem Solver', 'Team Player', 'Fast Learner', 'Detail Oriented'];
  traits.forEach(trait => {
    items.push({
      id: `trait-${trait.toLowerCase()}`,
      name: trait,
      icon: '⭐',
      color: CATEGORY_COLORS.personal,
      category: 'trait',
      detail: 'Trait',
    });
  });
  
  return items;
}

const PORTFOLIO_ITEMS = buildPortfolioItems();

interface MineCell {
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
  portfolioItem: PortfolioItem | null;
}

export class MinesweeperGame extends BaseGridGame {
  readonly id = MINESWEEPER_CONFIG.id;
  readonly label = MINESWEEPER_CONFIG.label;
  readonly description = MINESWEEPER_CONFIG.description;

  private config: MinesweeperGameConfig;
  private board: MineCell[][] = [];
  private firstMove = true;
  private cellsRevealed = 0;
  private totalSafeCells = 0;
  private hoverCell: GridCell | null = null;
  private lastRevealedItem: PortfolioItem | null = null;
  private itemDisplayTimer = 0;
  private portfolioItemIndex = 0;

  constructor(config: Partial<MinesweeperGameConfig> = {}) {
    super();
    this.config = { ...MINESWEEPER_CONFIG, ...config };
  }

  protected onReset(): void {
    const boardWidth = this.gridWidth;
    const boardHeight = this.gridHeight;

    this.portfolioItemIndex = 0;

    // Initialize empty board
    this.board = Array(boardHeight).fill(null).map(() =>
      Array(boardWidth).fill(null).map(() => ({
        hasMine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0,
        portfolioItem: null,
      }))
    );

    this.firstMove = true;
    this.cellsRevealed = 0;
    this.hoverCell = null;
    this.lastRevealedItem = null;
    this.itemDisplayTimer = 0;

    const mineCount = Math.floor(boardWidth * boardHeight * this.config.mineDensity);
    this.totalSafeCells = boardWidth * boardHeight - mineCount;

    this.updateStatus();
  }

  private placeMines(safeX: number, safeY: number): void {
    const boardWidth = this.gridWidth;
    const boardHeight = this.gridHeight;
    const mineCount = Math.floor(boardWidth * boardHeight * this.config.mineDensity);
    
    let placed = 0;
    while (placed < mineCount) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      
      if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
      if (this.board[y][x].hasMine) continue;
      
      this.board[y][x].hasMine = true;
      placed++;
    }

    // Calculate adjacent mines and assign portfolio items
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        if (!this.board[y][x].hasMine) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < boardHeight && nx >= 0 && nx < boardWidth) {
                if (this.board[ny][nx].hasMine) count++;
              }
            }
          }
          this.board[y][x].adjacentMines = count;
          
          // Assign portfolio item to cells with adjacent mines
          if (count > 0 || Math.random() < 0.3) {
            this.board[y][x].portfolioItem = PORTFOLIO_ITEMS[this.portfolioItemIndex % PORTFOLIO_ITEMS.length];
            this.portfolioItemIndex++;
          }
        }
      }
    }
  }

  protected onUpdate(dt: number): void {
    if (this.itemDisplayTimer > 0) {
      this.itemDisplayTimer -= dt;
    }
    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    this.hoverCell = cell;
  }

  protected onCursorLeave(): void {
    this.hoverCell = null;
  }

  protected onCellClick(cell: GridCell): void {
    if (this.state.isGameOver) return;

    const x = cell.x;
    const y = cell.y;

    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;

    if (this.firstMove) {
      this.firstMove = false;
      this.placeMines(x, y);
    }

    this.revealCell(x, y);
  }

  private revealCell(x: number, y: number): void {
    const boardWidth = this.gridWidth;
    const boardHeight = this.gridHeight;

    if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return;
    
    const cell = this.board[y][x];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.hasMine) {
      this.endGame();
      for (let ry = 0; ry < boardHeight; ry++) {
        for (let rx = 0; rx < boardWidth; rx++) {
          if (this.board[ry][rx].hasMine) {
            this.board[ry][rx].revealed = true;
          }
        }
      }
      return;
    }

    this.cellsRevealed++;
    this.addScore(this.config.revealScore);

    if (cell.portfolioItem) {
      this.lastRevealedItem = cell.portfolioItem;
      this.itemDisplayTimer = 2000;
    }

    if (this.cellsRevealed >= this.totalSafeCells) {
      this.addScore(500);
      this.endGame();
      return;
    }

    if (cell.adjacentMines === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx !== 0 || dy !== 0) {
            this.revealCell(x + dx, y + dy);
          }
        }
      }
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];
    const boardWidth = this.gridWidth;
    const boardHeight = this.gridHeight;

    // Only show segments for mines and hover - not every cell
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const cell = this.board[y][x];
        const isHovered = this.hoverCell && this.hoverCell.x === x && this.hoverCell.y === y;

        if (cell.revealed && cell.hasMine) {
          segments.push({
            x, y,
            color: this.config.mineColor,
            opacity: 0.8,
          });
        } else if (isHovered && !cell.revealed) {
          segments.push({
            x, y,
            color: this.config.numberColors[0],
            opacity: 0.4,
          });
        }
        // Skip showing segments for hidden cells - cleaner look
      }
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];
    const boardWidth = this.gridWidth;
    const boardHeight = this.gridHeight;
    
    // Track used rows and columns to prevent overlap
    const usedRows = new Set<number>();
    let labelCount = 0;
    const maxLabels = 6; // Limit visible labels

    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const cell = this.board[y][x];
        
        if (cell.revealed && cell.hasMine) {
          food.push({
            x, y,
            color: this.config.mineColor,
            icon: '💥',
          });
        } else if (cell.revealed && cell.portfolioItem) {
          // Only show label if row not used and under limit
          const canShowLabel = !usedRows.has(y) && labelCount < maxLabels;
          
          if (canShowLabel) {
            const labelWidth = Math.min(Math.ceil(cell.portfolioItem.name.length / 2) + 2, 5);
            usedRows.add(y);
            usedRows.add(y - 1); // Reserve adjacent rows
            usedRows.add(y + 1);
            labelCount++;
            
            food.push({
              x, y,
              color: cell.portfolioItem.color,
              icon: cell.portfolioItem.icon,
              label: cell.portfolioItem.name,
              labelWidth,
              category: cell.portfolioItem.category,
            });
          } else {
            // Just show icon
            food.push({
              x, y,
              color: cell.portfolioItem.color,
              icon: cell.portfolioItem.icon,
            });
          }
        }
      }
    }

    return food;
  }

  private updateStatus(): void {
    const won = this.cellsRevealed >= this.totalSafeCells;
    if (this.state.isGameOver) {
      this.setStatus(won ? `🎉 All Skills Discovered! Found: ${this.cellsRevealed}` : `💥 Mine! Skills Found: ${this.cellsRevealed}`);
    } else if (this.lastRevealedItem && this.itemDisplayTimer > 0) {
      this.setStatus(`${this.lastRevealedItem.icon} ${this.lastRevealedItem.name} - ${this.lastRevealedItem.detail}`);
    } else if (this.firstMove) {
      this.setStatus('Click to discover skills! Avoid mines 💣');
    } else {
      this.setStatus(`Skills Found: ${this.cellsRevealed}/${this.totalSafeCells}`);
    }
  }
}

export function createMinesweeperGame(config?: Partial<MinesweeperGameConfig>) {
  return new MinesweeperGame(config);
}
