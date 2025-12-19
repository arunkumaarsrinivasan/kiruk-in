/**
 * Game Configurations
 *
 * Centralized configuration for all grid games.
 * Each game's visual and gameplay settings are defined here.
 *
 * To add a new game:
 * 1. Add a config object here following the pattern
 * 2. Create a game class extending BaseGridGame
 * 3. Register in game-registry.ts
 */

import type { BaseGameConfig } from './base-grid-game';

// ============ Snake Trail Configuration ============
export interface SnakeGameConfig extends BaseGameConfig {
  initialLength: number;
  minOpacity: number;
  maxHistorySize: number;
  segmentInterval: number;
}

export const SNAKE_CONFIG: SnakeGameConfig = {
  id: 'snake',
  label: 'Snake Trail',
  description: 'Move your cursor to create a snake trail. Collect food to grow!',
  primaryColor: 'var(--text-main)',
  secondaryColor: 'var(--accent-color)',
  scoreLabel: 'Stacks',
  initialLength: 8,
  minOpacity: 0.15,
  maxHistorySize: 200,
  segmentInterval: 50,
};

// ============ Grid Painter Configuration ============
export interface PainterGameConfig extends BaseGameConfig {
  palette: string[];
  fadeTime: number;
  minOpacity: number;
  colorCycleInterval: number;
}

export const PAINTER_CONFIG: PainterGameConfig = {
  id: 'painter',
  label: 'Grid Painter',
  description: 'Paint colorful trails on the grid. Watch them fade away!',
  primaryColor: '#3b82f6',
  secondaryColor: '#ec4899',
  scoreLabel: 'Painted',
  palette: [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  ],
  fadeTime: 5000,
  minOpacity: 0.1,
  colorCycleInterval: 20,
};

// ============ Grid Collector Configuration ============
export interface CollectorGameConfig extends BaseGameConfig {
  maxItems: number;
  baseLifetime: number;
  spawnInterval: number;
  comboTimeout: number;
  itemColors: string[];
  pointsPerItem: number;
}

export const COLLECTOR_CONFIG: CollectorGameConfig = {
  id: 'collector',
  label: 'Grid Collector',
  description: 'Collect items before they vanish! Move fast for combos!',
  primaryColor: '#22c55e',
  secondaryColor: '#3b82f6',
  scoreLabel: 'Collected',
  maxItems: 8,
  baseLifetime: 4000,
  spawnInterval: 800,
  comboTimeout: 1000,
  itemColors: ['#22c55e', '#3b82f6', '#f97316', '#ec4899', '#eab308'],
  pointsPerItem: 10,
};

// ============ Grid Avoider Configuration ============
export interface AvoiderGameConfig extends BaseGameConfig {
  initialSpawnInterval: number;
  minSpawnInterval: number;
  speedIncrease: number;
  baseSpeed: number;
  obstacleColor: string;
  safeColor: string;
  maxObstaclesPerSpawn: number;
}

export const AVOIDER_CONFIG: AvoiderGameConfig = {
  id: 'avoider',
  label: 'Grid Avoider',
  description: 'Dodge falling obstacles! How long can you survive?',
  primaryColor: '#22c55e',
  secondaryColor: '#ef4444',
  scoreLabel: 'Survived',
  initialSpawnInterval: 600,
  minSpawnInterval: 200,
  speedIncrease: 0.01,
  baseSpeed: 0.008,
  obstacleColor: '#ef4444',
  safeColor: '#22c55e',
  maxObstaclesPerSpawn: 3,
};

// ============ Tetris Configuration ============
export interface TetrisGameConfig extends BaseGameConfig {
  dropInterval: number;
  fastDropInterval: number;
  pieceColors: string[];
  ghostOpacity: number;
}

export const TETRIS_CONFIG: TetrisGameConfig = {
  id: 'tetris',
  label: 'Grid Tetris',
  description: 'Move cursor left/right to position, up to rotate, down to drop!',
  primaryColor: 'var(--text-main)',
  secondaryColor: 'var(--accent-color)',
  scoreLabel: 'Lines',
  dropInterval: 800,
  fastDropInterval: 50,
  pieceColors: ['#06b6d4', '#eab308', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316'],
  ghostOpacity: 0.3,
};

// ============ Pipe Dream Configuration ============
export interface PipeGameConfig extends BaseGameConfig {
  startDelay: number;
  flowSpeed: number;
  pipeColor: string;
  filledColor: string;
  flowColor: string;
  placeScore: number;
  flowScore: number;
}

export const PIPE_CONFIG: PipeGameConfig = {
  id: 'pipe',
  label: 'Pipe Dream',
  description: 'Place pipes to guide the flow! Hover to place pipes.',
  primaryColor: '#6b7280',
  secondaryColor: '#3b82f6',
  scoreLabel: 'Pipes',
  startDelay: 5000,
  flowSpeed: 400,
  pipeColor: '#6b7280',
  filledColor: '#3b82f6',
  flowColor: '#06b6d4',
  placeScore: 5,
  flowScore: 10,
};

// ============ Space Shooter Configuration ============
export interface ShooterGameConfig extends BaseGameConfig {
  shootInterval: number;
  enemyMoveInterval: number;
  enemyShootInterval: number;
  bulletColor: string;
  enemyBulletColor: string;
  enemyColors: string[];
  shipColor: string;
  enemyScore: number;
}

export const SHOOTER_CONFIG: ShooterGameConfig = {
  id: 'shooter',
  label: 'Space Shooter',
  description: 'Move cursor to control ship, auto-fire at enemies!',
  primaryColor: '#22c55e',
  secondaryColor: '#ef4444',
  scoreLabel: 'Kills',
  shootInterval: 200,
  enemyMoveInterval: 500,
  enemyShootInterval: 1500,
  bulletColor: '#22c55e',
  enemyBulletColor: '#ef4444',
  enemyColors: ['#ef4444', '#f97316', '#ec4899'],
  shipColor: '#3b82f6',
  enemyScore: 100,
};

// ============ Minesweeper Configuration ============
export interface MinesweeperGameConfig extends BaseGameConfig {
  mineDensity: number;
  mineColor: string;
  hiddenColor: string;
  emptyColor: string;
  borderColor: string;
  numberColors: string[];
  revealScore: number;
  revealCooldown: number;
}

export const MINESWEEPER_CONFIG: MinesweeperGameConfig = {
  id: 'minesweeper',
  label: 'Minesweeper',
  description: 'Hover to reveal cells. Find all safe cells without hitting mines!',
  primaryColor: 'var(--text-main)',
  secondaryColor: '#ef4444',
  scoreLabel: 'Cleared',
  mineDensity: 0.15,
  mineColor: '#ef4444',
  hiddenColor: '#4b5563',
  emptyColor: '#9ca3af',
  borderColor: '#374151',
  numberColors: ['#3b82f6', '#22c55e', '#ef4444', '#7c3aed', '#b91c1c', '#0891b2', '#1f2937', '#6b7280'],
  revealScore: 5,
  revealCooldown: 100,
};

// ============ Flappy Bird Configuration ============
export interface FlappyGameConfig extends BaseGameConfig {
  flapStrength: number;
  gapSize: number;
  scrollSpeed: number;
  pipeSpacing: number;
  pipeInterval: number;
  birdColor: string;
  pipeColor: string;
  groundColor: string;
  pipeScore: number;
}

export const FLAPPY_CONFIG: FlappyGameConfig = {
  id: 'flappy',
  label: 'Flappy Grid',
  description: 'Move cursor up/down to fly through gaps! Don\'t hit the pipes!',
  primaryColor: '#eab308',
  secondaryColor: '#22c55e',
  scoreLabel: 'Pipes',
  flapStrength: 0.5,
  gapSize: 4,
  scrollSpeed: 0.15,
  pipeSpacing: 15,
  pipeInterval: 2000,
  birdColor: '#eab308',
  pipeColor: '#22c55e',
  groundColor: '#78716c',
  pipeScore: 10,
};

// ============ Timeline Explorer Configuration ============
export interface TimelineGameConfig extends BaseGameConfig {
  scrollSpeed: number;
  milestoneSpacing: number;
}

export const TIMELINE_CONFIG: TimelineGameConfig = {
  id: 'timeline',
  label: 'Timeline Trek',
  description: 'Travel through my career timeline! Each milestone reveals a story.',
  primaryColor: 'var(--accent-color)',
  secondaryColor: '#8b5cf6',
  scoreLabel: 'Milestones',
  scrollSpeed: 0.1,
  milestoneSpacing: 15,
};

// ============ Developer Quiz Configuration ============
export interface QuizGameConfig extends BaseGameConfig {
  questionDuration: number;
  answersPerQuestion: number;
}

export const QUIZ_CONFIG: QuizGameConfig = {
  id: 'quiz',
  label: 'Know Me Quiz',
  description: 'How well do you know me? Answer questions to find out!',
  primaryColor: '#8b5cf6',
  secondaryColor: '#06b6d4',
  scoreLabel: 'Correct',
  questionDuration: 15000,
  answersPerQuestion: 4,
};

// ============ Memory Match Configuration ============
export interface MemoryGameConfig extends BaseGameConfig {
  flipDuration: number;
  cardRevealTime: number;
  gridCols: number;
  gridRows: number;
}

export const MEMORY_CONFIG: MemoryGameConfig = {
  id: 'memory',
  label: 'Skill Match',
  description: 'Match my skills! Flip cards to find pairs and learn about each skill.',
  primaryColor: '#ec4899',
  secondaryColor: '#8b5cf6',
  scoreLabel: 'Pairs',
  flipDuration: 1500,
  cardRevealTime: 500,
  gridCols: 4,
  gridRows: 4,
};

// ============ All Game Configs (for reference/iteration) ============
export const ALL_GAME_CONFIGS = {
  snake: SNAKE_CONFIG,
  painter: PAINTER_CONFIG,
  collector: COLLECTOR_CONFIG,
  avoider: AVOIDER_CONFIG,
  tetris: TETRIS_CONFIG,
  pipe: PIPE_CONFIG,
  shooter: SHOOTER_CONFIG,
  minesweeper: MINESWEEPER_CONFIG,
  flappy: FLAPPY_CONFIG,
  // Portfolio-focused games
  timeline: TIMELINE_CONFIG,
  quiz: QUIZ_CONFIG,
  memory: MEMORY_CONFIG,
} as const;

export type GameId = keyof typeof ALL_GAME_CONFIGS;
