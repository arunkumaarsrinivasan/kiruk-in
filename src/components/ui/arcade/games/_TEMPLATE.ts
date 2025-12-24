/**
 * ============================================================
 * GAME TEMPLATE - Copy this file to create a new grid game
 * ============================================================
 *
 * Steps to add a new game:
 *
 * 1. Copy this file to: games/my-game.ts
 *
 * 2. Add config to game-configs.ts:
 *    ```ts
 *    export interface MyGameConfig extends BaseGameConfig {
 *      mySetting: number;
 *    }
 *    export const MY_GAME_CONFIG: MyGameConfig = {
 *      id: 'mygame',
 *      label: 'My Game',
 *      description: 'A fun game!',
 *      primaryColor: 'var(--text-main)',
 *      secondaryColor: 'var(--accent-color)',
 *      scoreLabel: 'Score',
 *      mySetting: 10,
 *    };
 *    ```
 *
 * 3. Update games/index.ts to export your game
 *
 * 4. Register in game-registry.ts
 *
 * ============================================================
 */

import { BaseGridGame } from '../base-grid-game';
import type { BaseGameConfig } from '../base-grid-game';
import type { GridCell, GridSegment, GridFood } from '../types';

// ============ STEP 1: Define your game config interface ============
interface TemplateGameConfig extends BaseGameConfig {
  // Add game-specific settings here
  exampleSetting: number;
}

// ============ STEP 2: Define default config values ============
const TEMPLATE_CONFIG: TemplateGameConfig = {
  id: 'template',
  label: 'Template Game',
  description: 'A template for creating new games',
  primaryColor: 'var(--text-main)',
  secondaryColor: 'var(--accent-color)',
  scoreLabel: 'Score',
  exampleSetting: 10,
};

// ============ STEP 3: Create your game class ============
export class TemplateGame extends BaseGridGame {
  // Required: Define game identity from config
  readonly id = TEMPLATE_CONFIG.id;
  readonly label = TEMPLATE_CONFIG.label;
  readonly description = TEMPLATE_CONFIG.description;

  // Store config and game-specific state
  private config: TemplateGameConfig;
  private myGameData: GridCell[] = [];

  constructor(config: Partial<TemplateGameConfig> = {}) {
    super();
    this.config = { ...TEMPLATE_CONFIG, ...config };
  }

  /**
   * Called when game starts or resets.
   * Initialize your game state here.
   */
  protected onReset(): void {
    this.myGameData = [];
    this.setScore(0);
    this.setStatus(`${this.config.scoreLabel}: 0`);

    // Example: spawn initial items
    // this.spawnItem();
  }

  /**
   * Called every frame with delta time (ms).
   * Update game logic, physics, spawning, etc.
   */
  protected onUpdate(dt: number): void {
    // Example: Update game state
    // this.moveThings(dt);
    // this.checkCollisions();

    // Update status text
    this.setStatus(`${this.config.scoreLabel}: ${this.state.score}`);
  }

  /**
   * Called when cursor moves to a new cell.
   * Handle cursor-based interactions here.
   */
  protected onCursorMove(cell: GridCell): void {
    // Example: Check if cursor hits something
    // if (this.cellsEqual(cell, this.target)) {
    //   this.addScore(10);
    // }
  }

  /**
   * Called for each cell along cursor path (interpolated).
   * Useful for drawing/painting mechanics.
   */
  protected onCursorPath(cell: GridCell): void {
    // Example: Paint cells as cursor moves
    // this.paintedCells.add(this.cellKey(cell));
  }

  /**
   * Called when cursor leaves the grid area.
   */
  protected onCursorLeave(): void {
    // Example: Pause spawning, change state
  }

  /**
   * Return segments (snake body, trails, player, etc.)
   * These render as filled squares with opacity.
   */
  protected getSegments(): GridSegment[] {
    // Example: render game data as segments
    return this.myGameData.map((cell, i) => ({
      x: cell.x,
      y: cell.y,
      color: this.config.primaryColor,
      opacity: 1 - i * 0.1, // Fade out
    }));
  }

  /**
   * Return food/items/targets to collect.
   * These render as distinct squares.
   */
  protected getFood(): GridFood[] {
    // Example: render collectible items
    return [];
  }

  // ============ Add game-specific helper methods below ============

  // private spawnItem(): void {
  //   const cell = this.getRandomCell();
  //   this.myGameData.push(cell);
  // }
}

// ============ STEP 4: Export factory function ============
export function createTemplateGame(config?: Partial<TemplateGameConfig>) {
  return new TemplateGame(config);
}
