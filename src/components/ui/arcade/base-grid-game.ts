/**
 * Grid Game Base Class & Configuration System
 *
 * This file provides the foundation for all grid-based games.
 * To add a new game:
 * 
 * 1. Define your game config in game-configs.ts
 * 2. Create a game class extending BaseGridGame
 * 3. Register in game-registry.ts
 *
 * The base class handles:
 * - Grid initialization and bounds checking
 * - Pointer event handling with interpolation
 * - Common rendering utilities
 * - Score and state management
 */

import type { GridGameEngine, GridCell, GameRenderState, GridSegment, GridFood } from './types';

/**
 * Common configuration all games share
 */
export interface BaseGameConfig {
  /** Unique game identifier */
  id: string;
  /** Display name */
  label: string;
  /** Short description */
  description: string;
  /** Primary color for game elements */
  primaryColor: string;
  /** Secondary color for accents */
  secondaryColor: string;
  /** Score label (e.g., "Score", "Stacks", "Painted") */
  scoreLabel: string;
}

/**
 * Game state that all games maintain
 */
export interface BaseGameState {
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  statusText: string;
}

/**
 * Abstract base class for grid games.
 * Provides common functionality and enforces consistent patterns.
 */
export abstract class BaseGridGame implements GridGameEngine {
  abstract readonly id: string;
  abstract readonly label: string;
  abstract readonly description: string;

  protected gridWidth = 0;
  protected gridHeight = 0;
  protected cursorCell: GridCell | null = null;
  protected lastCursorCell: GridCell | null = null;
  protected isPointerActive = false;

  protected state: BaseGameState = {
    score: 0,
    isGameOver: false,
    isPaused: false,
    statusText: '',
  };

  /**
   * Initialize game for given grid dimensions.
   * Override onInit() for game-specific initialization.
   */
  init(gridWidth: number, gridHeight: number): void {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.reset();
  }

  /**
   * Reset game to initial state.
   * Override onReset() for game-specific reset logic.
   */
  reset(): void {
    this.cursorCell = null;
    this.lastCursorCell = null;
    this.isPointerActive = false;
    this.state = {
      score: 0,
      isGameOver: false,
      isPaused: false,
      statusText: '',
    };
    this.onReset();
  }

  /**
   * Update game state each frame.
   * Override onUpdate() for game-specific update logic.
   */
  update(dt: number): void {
    if (this.state.isGameOver || this.state.isPaused) return;
    this.onUpdate(dt);
  }

  /**
   * Handle pointer movement.
   * Automatically handles bounds clamping and path interpolation.
   */
  onPointerMove(cell: GridCell): void {
    this.isPointerActive = true;

    // Clamp to grid bounds
    const clampedCell = this.clampToGrid(cell);

    // Interpolate path if cursor jumped
    if (this.lastCursorCell) {
      const path = this.interpolatePath(this.lastCursorCell, clampedCell);
      // Skip first cell (it's the previous position)
      for (let i = 1; i < path.length; i++) {
        this.onCursorPath(path[i]);
      }
    } else {
      this.onCursorPath(clampedCell);
    }

    this.lastCursorCell = clampedCell;
    this.cursorCell = clampedCell;
    this.onCursorMove(clampedCell);
  }

  /**
   * Handle pointer leaving the grid.
   */
  onPointerLeave(): void {
    this.isPointerActive = false;
    this.lastCursorCell = null;
    this.onCursorLeave();
  }

  /**
   * Handle click/tap on a cell.
   */
  onClick(cell: GridCell): void {
    if (this.state.isGameOver || this.state.isPaused) return;
    const clampedCell = this.clampToGrid(cell);
    this.onCellClick(clampedCell);
  }

  /**
   * Get current render state.
   * Override getSegments() and getFood() for game-specific rendering.
   */
  renderState(): GameRenderState {
    return {
      segments: this.getSegments(),
      food: this.getFood(),
      score: this.state.score,
      statusText: this.state.statusText,
      isPaused: this.state.isPaused,
      isGameOver: this.state.isGameOver,
    };
  }

  // ============ Protected methods for subclasses to override ============

  /** Called when game is reset. Override for game-specific reset. */
  protected onReset(): void {}

  /** Called each frame with delta time. Override for game logic. */
  protected onUpdate(_dt: number): void {}

  /** Called when cursor moves to a new cell. */
  protected onCursorMove(_cell: GridCell): void {}

  /** Called for each cell in the cursor's path (for interpolation). */
  protected onCursorPath(_cell: GridCell): void {}

  /** Called when cursor leaves the grid. */
  protected onCursorLeave(): void {}

  /** Called when user clicks on a cell. Override for click-based games. */
  protected onCellClick(_cell: GridCell): void {}

  /** Return segments to render. Override for game-specific segments. */
  protected getSegments(): GridSegment[] {
    return [];
  }

  /** Return food/items to render. Override for game-specific items. */
  protected getFood(): GridFood[] {
    return [];
  }

  // ============ Utility methods available to all games ============

  /** Clamp a cell to grid bounds */
  protected clampToGrid(cell: GridCell): GridCell {
    return {
      x: Math.max(0, Math.min(this.gridWidth - 1, cell.x)),
      y: Math.max(0, Math.min(this.gridHeight - 1, cell.y)),
    };
  }

  /** Check if a cell is within grid bounds */
  protected isInBounds(cell: GridCell): boolean {
    return cell.x >= 0 && cell.x < this.gridWidth && cell.y >= 0 && cell.y < this.gridHeight;
  }

  /** Get a random cell within the grid */
  protected getRandomCell(): GridCell {
    return {
      x: Math.floor(Math.random() * this.gridWidth),
      y: Math.floor(Math.random() * this.gridHeight),
    };
  }

  /** Get a random empty cell (not in occupied set) */
  protected getRandomEmptyCell(occupied: Set<string>): GridCell | null {
    const emptyCells: GridCell[] = [];
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (!occupied.has(`${x},${y}`)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /** Convert cell to string key for Set/Map */
  protected cellKey(cell: GridCell): string {
    return `${cell.x},${cell.y}`;
  }

  /** Check if two cells are the same position */
  protected cellsEqual(a: GridCell, b: GridCell): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /** Interpolate path between two cells using Bresenham's algorithm */
  protected interpolatePath(from: GridCell, to: GridCell): GridCell[] {
    const path: GridCell[] = [];
    let x0 = from.x, y0 = from.y;
    const x1 = to.x, y1 = to.y;
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      path.push({ x: x0, y: y0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return path;
  }

  /** Update score */
  protected setScore(score: number): void {
    this.state.score = score;
  }

  /** Add to score */
  protected addScore(points: number): void {
    this.state.score += points;
  }

  /** Set status text */
  protected setStatus(text: string): void {
    this.state.statusText = text;
  }

  /** End the game */
  protected endGame(): void {
    this.state.isGameOver = true;
  }
}
