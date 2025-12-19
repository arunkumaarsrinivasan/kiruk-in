/**
 * Games Index
 *
 * Export all game implementations from this folder.
 * Each game extends BaseGridGame and uses configs from game-configs.ts.
 */

// Original games
export { SnakeGame, createSnakeGame } from './snake-game';
export { PainterGame, createPainterGame } from './painter-game';
export { CollectorGame, createCollectorGame } from './collector-game';
export { AvoiderGame, createAvoiderGame } from './avoider-game';

// New games
export { TetrisGame, createTetrisGame } from './tetris-game';
export { PipeGame, createPipeGame } from './pipe-game';
export { ShooterGame, createShooterGame } from './shooter-game';
export { MinesweeperGame, createMinesweeperGame } from './minesweeper-game';
export { FlappyGame, createFlappyGame } from './flappy-game';

// Portfolio-focused games
export { TimelineGame, createTimelineGame } from './timeline-game';
export { QuizGame, createQuizGame } from './quiz-game';
export { MemoryGame, createMemoryGame } from './memory-game';
