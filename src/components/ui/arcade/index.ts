/**
 * Grid Arcade Module
 *
 * A data-driven grid-based arcade system for the portfolio.
 * Games play directly on the full-page grid background.
 *
 * ============ HOW TO ADD A NEW GAME ============
 *
 * 1. Add game config to game-configs.ts:
 *    ```ts
 *    export interface MyGameConfig extends BaseGameConfig {
 *      // game-specific settings
 *    }
 *    export const MY_GAME_CONFIG: MyGameConfig = {
 *      id: 'mygame',
 *      label: 'My Game',
 *      description: 'Description here',
 *      primaryColor: 'var(--text-main)',
 *      secondaryColor: 'var(--accent-color)',
 *      scoreLabel: 'Score',
 *      // ... game-specific settings
 *    };
 *    ```
 *
 * 2. Create game class in games/ folder:
 *    ```ts
 *    import { BaseGridGame } from '../base-grid-game';
 *    import { MY_GAME_CONFIG } from '../game-configs';
 *
 *    export class MyGame extends BaseGridGame {
 *      readonly id = MY_GAME_CONFIG.id;
 *      readonly label = MY_GAME_CONFIG.label;
 *      readonly description = MY_GAME_CONFIG.description;
 *
 *      protected onReset(): void { ... }
 *      protected onUpdate(dt: number): void { ... }
 *      protected onCursorMove(cell: GridCell): void { ... }
 *      protected getSegments(): GridSegment[] { ... }
 *      protected getFood(): GridFood[] { ... }
 *    }
 *    ```
 *
 * 3. Register in game-registry.ts:
 *    ```ts
 *    mygame: {
 *      id: ALL_GAME_CONFIGS.mygame.id,
 *      label: ALL_GAME_CONFIGS.mygame.label,
 *      description: ALL_GAME_CONFIGS.mygame.description,
 *      createEngine: createMyGame,
 *    },
 *    ```
 *
 * ============ AVAILABLE GAMES ============
 * - Snake Trail: Cursor-controlled snake that grows
 * - Grid Painter: Paint colorful fading trails
 * - Grid Collector: Collect items before they vanish
 * - Grid Avoider: Dodge falling obstacles
 *
 * ============ USAGE ============
 * Game registry used by LayoutClientShell for nav. Grid arcade UI removed (unused).
 * import { getGameEntry, getDefaultGameId } from '@/components/ui/arcade/game-registry';
 */

export { ArcadePlayButton } from './ArcadePlayButton';
export { 
  PlayerArchetypeSelector, 
  usePlayerArchetype,
  ARCHETYPES,
  type PlayerArchetype,
  type ArchetypeInfo,
} from './PlayerArchetypeSelector';
export {
  PlayerProgressIndicator,
  usePlayerProgress,
} from './PlayerProgressIndicator';

// Grid tile types and content
export {
  TILE_CONFIGS,
  PROJECT_TILES,
  STORY_TILES,
  SKILL_TILES,
  CHALLENGE_TILES,
  FUNFACT_TILES,
  getRandomTileContent,
  getRandomTileType,
  calculateProgress,
  type TileType,
  type TileConfig,
  type ProjectTileContent,
  type StoryTileContent,
  type SkillTileContent,
  type ChallengeTileContent,
  type FunFactTileContent,
  type PlayerProgress,
} from './grid-tile-types';

// Base class for creating new games
export { BaseGridGame, type BaseGameConfig, type BaseGameState } from './base-grid-game';

// Game configurations (data-driven)
export {
  SNAKE_CONFIG,
  PAINTER_CONFIG,
  COLLECTOR_CONFIG,
  AVOIDER_CONFIG,
  ALL_GAME_CONFIGS,
  type SnakeGameConfig,
  type PainterGameConfig,
  type CollectorGameConfig,
  type AvoiderGameConfig,
  type GameId,
} from './game-configs';

// Types
export type {
  GridCell,
  GridSegment,
  GridFood,
  GameRenderState,
  GridGameEngine,
  GameRegistryEntry,
} from './types';

// Game registry utilities
export {
  GAME_REGISTRY,
  getGameIds,
  getGameEntry,
  getRandomGameId,
  getDefaultGameId,
} from './game-registry';

// Hooks
export { useGridGameLoop } from './use-grid-game-loop';

// Game implementations
export {
  SnakeGame,
  createSnakeGame,
  PainterGame,
  createPainterGame,
  CollectorGame,
  createCollectorGame,
  AvoiderGame,
  createAvoiderGame,
} from './games';
