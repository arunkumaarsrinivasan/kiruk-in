/**
 * Game Registry
 *
 * Central registry for all available grid arcade games.
 * Uses data-driven approach with configs and game classes.
 *
 * To add a new game:
 * 1. Add game config to game-configs.ts
 * 2. Create game class in games/ folder extending BaseGridGame
 * 3. Add entry to GAME_REGISTRY below
 */

import type { GameRegistryEntry } from './types';
import { ALL_GAME_CONFIGS } from './game-configs';
import {
  createSnakeGame,
  createPainterGame,
  createCollectorGame,
  createAvoiderGame,
  createTetrisGame,
  createPipeGame,
  createShooterGame,
  createMinesweeperGame,
  createFlappyGame,
  createTimelineGame,
  createQuizGame,
  createMemoryGame,
} from './games';

/**
 * Registry of all available games.
 * Built from configs + factory functions.
 */
export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  // Original games
  snake: {
    id: ALL_GAME_CONFIGS.snake.id,
    label: ALL_GAME_CONFIGS.snake.label,
    description: ALL_GAME_CONFIGS.snake.description,
    createEngine: createSnakeGame,
  },
  painter: {
    id: ALL_GAME_CONFIGS.painter.id,
    label: ALL_GAME_CONFIGS.painter.label,
    description: ALL_GAME_CONFIGS.painter.description,
    createEngine: createPainterGame,
  },
  collector: {
    id: ALL_GAME_CONFIGS.collector.id,
    label: ALL_GAME_CONFIGS.collector.label,
    description: ALL_GAME_CONFIGS.collector.description,
    createEngine: createCollectorGame,
  },
  avoider: {
    id: ALL_GAME_CONFIGS.avoider.id,
    label: ALL_GAME_CONFIGS.avoider.label,
    description: ALL_GAME_CONFIGS.avoider.description,
    createEngine: createAvoiderGame,
  },
  // New games
  tetris: {
    id: ALL_GAME_CONFIGS.tetris.id,
    label: ALL_GAME_CONFIGS.tetris.label,
    description: ALL_GAME_CONFIGS.tetris.description,
    createEngine: createTetrisGame,
  },
  pipe: {
    id: ALL_GAME_CONFIGS.pipe.id,
    label: ALL_GAME_CONFIGS.pipe.label,
    description: ALL_GAME_CONFIGS.pipe.description,
    createEngine: createPipeGame,
  },
  shooter: {
    id: ALL_GAME_CONFIGS.shooter.id,
    label: ALL_GAME_CONFIGS.shooter.label,
    description: ALL_GAME_CONFIGS.shooter.description,
    createEngine: createShooterGame,
  },
  minesweeper: {
    id: ALL_GAME_CONFIGS.minesweeper.id,
    label: ALL_GAME_CONFIGS.minesweeper.label,
    description: ALL_GAME_CONFIGS.minesweeper.description,
    createEngine: createMinesweeperGame,
  },
  flappy: {
    id: ALL_GAME_CONFIGS.flappy.id,
    label: ALL_GAME_CONFIGS.flappy.label,
    description: ALL_GAME_CONFIGS.flappy.description,
    createEngine: createFlappyGame,
  },
  // Portfolio-focused games
  timeline: {
    id: ALL_GAME_CONFIGS.timeline.id,
    label: ALL_GAME_CONFIGS.timeline.label,
    description: ALL_GAME_CONFIGS.timeline.description,
    createEngine: createTimelineGame,
  },
  quiz: {
    id: ALL_GAME_CONFIGS.quiz.id,
    label: ALL_GAME_CONFIGS.quiz.label,
    description: ALL_GAME_CONFIGS.quiz.description,
    createEngine: createQuizGame,
  },
  memory: {
    id: ALL_GAME_CONFIGS.memory.id,
    label: ALL_GAME_CONFIGS.memory.label,
    description: ALL_GAME_CONFIGS.memory.description,
    createEngine: createMemoryGame,
  },
};

/** Get all registered game IDs */
export function getGameIds(): string[] {
  return Object.keys(GAME_REGISTRY);
}

/** Get a specific game entry by ID */
export function getGameEntry(id: string): GameRegistryEntry | undefined {
  return GAME_REGISTRY[id];
}

/** Get a random game ID from the registry */
export function getRandomGameId(): string {
  const ids = getGameIds();
  return ids[Math.floor(Math.random() * ids.length)];
}

/** Get the default game ID */
export function getDefaultGameId(): string {
  return 'snake';
}
