/**
 * Grid Arcade Game Engine Types
 *
 * This file defines the core interfaces and types for grid-based arcade games.
 * Any new game should implement the GridGameEngine interface.
 *
 * To add a new game:
 * 1. Create a new file (e.g., tetris-game.ts) that exports a class implementing GridGameEngine
 * 2. Register the game in the GAME_REGISTRY in game-registry.ts
 * 3. The arcade will automatically pick it up
 */

/** Represents a single cell position in the grid */
export type GridCell = {
  x: number;
  y: number;
};

/** A segment that can be rendered on the grid (e.g., snake body, tetris block) */
export interface GridSegment {
  x: number;
  y: number;
  color: string;
  opacity: number;
}

/** A food/collectible item on the grid */
export interface GridFood {
  x: number;
  y: number;
  color: string;
  /** Optional icon/emoji to display instead of a colored square */
  icon?: string;
  /** Text label to display (spans multiple cells) */
  label?: string;
  /** Number of grid cells the label spans horizontally */
  labelWidth?: number;
  /** Category for styling (skill, project, experience, etc.) */
  category?: string;
  /** Whether this item is interactive/clickable */
  interactive?: boolean;
}

/**
 * The render state returned by a game engine.
 * The UI layer uses this to draw the game visually.
 */
export interface GameRenderState {
  /** Segments to render (snake body, tetris blocks, etc.) */
  segments?: GridSegment[];
  /** Food/collectible items */
  food?: GridFood[];
  /** Text to display in the status area */
  statusText?: string;
  /** Current score */
  score?: number;
  /** Whether the game is paused */
  isPaused?: boolean;
  /** Whether the game is over */
  isGameOver?: boolean;
}

/**
 * Core interface for all grid-based games.
 *
 * Each game must implement these methods to work with the arcade system:
 * - init: Set up the game state for a given grid size
 * - update: Called on each frame/tick to advance game state
 * - onPointerMove: Handle pointer/cursor movement over the grid
 * - onPointerLeave: Handle when pointer leaves the grid
 * - renderState: Return the current visual state for rendering
 * - reset: Reset the game to initial state
 */
export interface GridGameEngine {
  /** Unique identifier for the game (e.g., 'snake', 'tetris') */
  readonly id: string;

  /** Display name shown in the UI */
  readonly label: string;

  /** Short description of the game */
  readonly description: string;

  /**
   * Initialize the game for a given grid size.
   * Called when the game starts or when grid dimensions change.
   */
  init(gridWidth: number, gridHeight: number): void;

  /**
   * Update game state. Called on each animation frame.
   * @param dt - Delta time since last update in milliseconds
   */
  update(dt: number): void;

  /**
   * Handle pointer movement over the grid.
   * @param cell - The grid cell the pointer is currently over
   */
  onPointerMove(cell: GridCell): void;

  /**
   * Handle when the pointer leaves the grid area.
   */
  onPointerLeave(): void;

  /**
   * Handle click/tap on a grid cell.
   * @param cell - The grid cell that was clicked
   */
  onClick(cell: GridCell): void;

  /**
   * Get the current render state for drawing the game.
   * This should be a lightweight operation as it's called every frame.
   */
  renderState(): GameRenderState;

  /**
   * Reset the game to its initial state.
   */
  reset(): void;
}

/** Configuration for a registered game */
export interface GameRegistryEntry {
  id: string;
  label: string;
  description: string;
  /** Factory function to create a new instance of the game engine */
  createEngine: () => GridGameEngine;
}
