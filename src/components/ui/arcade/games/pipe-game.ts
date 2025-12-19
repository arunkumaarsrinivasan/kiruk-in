/**
 * Grid Pipe Dream Game
 *
 * Connect pipes before the flow reaches the end. Move cursor
 * to place pipe sections and create a path.
 */

import { BaseGridGame } from '../base-grid-game';
import { PIPE_CONFIG, type PipeGameConfig } from '../game-configs';
import type { GridCell, GridSegment, GridFood } from '../types';

// Pipe types: connections are [top, right, bottom, left]
const PIPE_TYPES = [
  { id: 0, connections: [true, true, false, false], symbol: '╔' },   // top-right elbow
  { id: 1, connections: [true, false, false, true], symbol: '╗' },   // top-left elbow
  { id: 2, connections: [false, true, true, false], symbol: '╚' },   // bottom-right elbow
  { id: 3, connections: [false, false, true, true], symbol: '╝' },   // bottom-left elbow
  { id: 4, connections: [true, false, true, false], symbol: '║' },   // vertical
  { id: 5, connections: [false, true, false, true], symbol: '═' },   // horizontal
  { id: 6, connections: [true, true, true, true], symbol: '╬' },     // cross
];

interface PipeCell {
  type: number;
  filled: boolean;
}

export class PipeGame extends BaseGridGame {
  readonly id = PIPE_CONFIG.id;
  readonly label = PIPE_CONFIG.label;
  readonly description = PIPE_CONFIG.description;

  private config: PipeGameConfig;
  private board: (PipeCell | null)[][] = [];
  private startCell: GridCell = { x: 0, y: 0 };
  private flowHead: GridCell | null = null;
  private flowDirection = 1; // 0=top, 1=right, 2=bottom, 3=left
  private flowTimer = 0;
  private previewPipe = 0;
  private nextPipes: number[] = [];
  private pipesPlaced = 0;
  private flowStarted = false;
  private flowDelay = 0;

  constructor(config: Partial<PipeGameConfig> = {}) {
    super();
    this.config = { ...PIPE_CONFIG, ...config };
  }

  protected onReset(): void {
    this.board = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(null));
    
    // Place start cell on left edge
    this.startCell = { x: 0, y: Math.floor(this.gridHeight / 2) };
    this.board[this.startCell.y][this.startCell.x] = { type: 5, filled: true }; // horizontal pipe
    
    this.flowHead = { ...this.startCell };
    this.flowDirection = 1; // flowing right
    this.flowTimer = 0;
    this.flowDelay = this.config.startDelay;
    this.flowStarted = false;
    
    // Generate preview pipes
    this.nextPipes = Array(5).fill(0).map(() => Math.floor(Math.random() * PIPE_TYPES.length));
    this.previewPipe = this.nextPipes.shift()!;
    this.nextPipes.push(Math.floor(Math.random() * PIPE_TYPES.length));
    
    this.pipesPlaced = 0;
    this.updateStatus();
  }

  protected onUpdate(dt: number): void {
    if (this.state.isGameOver) return;

    // Wait for flow start delay
    if (!this.flowStarted) {
      this.flowDelay -= dt;
      if (this.flowDelay <= 0) {
        this.flowStarted = true;
      }
      this.updateStatus();
      return;
    }

    this.flowTimer += dt;
    if (this.flowTimer >= this.config.flowSpeed) {
      this.flowTimer = 0;
      this.advanceFlow();
    }

    this.updateStatus();
  }

  protected onCursorMove(cell: GridCell): void {
    // Place pipe on cursor position
    if (!this.flowStarted && this.flowDelay > this.config.startDelay * 0.5) {
      // Still in grace period, can place freely
    }
    
    // Check if cell is valid for placement
    if (cell.x >= 0 && cell.x < this.gridWidth && cell.y >= 0 && cell.y < this.gridHeight) {
      if (this.board[cell.y][cell.x] === null) {
        // Place pipe
        this.board[cell.y][cell.x] = { type: this.previewPipe, filled: false };
        this.pipesPlaced++;
        this.addScore(this.config.placeScore);
        
        // Get next pipe
        this.previewPipe = this.nextPipes.shift()!;
        this.nextPipes.push(Math.floor(Math.random() * PIPE_TYPES.length));
      } else if (!this.board[cell.y][cell.x]!.filled) {
        // Replace unfilled pipe (costs points)
        this.board[cell.y][cell.x] = { type: this.previewPipe, filled: false };
        this.previewPipe = this.nextPipes.shift()!;
        this.nextPipes.push(Math.floor(Math.random() * PIPE_TYPES.length));
      }
    }
  }

  protected getSegments(): GridSegment[] {
    const segments: GridSegment[] = [];

    // Render all pipes
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const pipe = this.board[y][x];
        if (pipe) {
          segments.push({
            x, y,
            color: pipe.filled ? this.config.filledColor : this.config.pipeColor,
            opacity: pipe.filled ? 1 : 0.6,
          });
        }
      }
    }

    // Render flow head
    if (this.flowHead && this.flowStarted) {
      segments.push({
        x: this.flowHead.x,
        y: this.flowHead.y,
        color: this.config.flowColor,
        opacity: 1,
      });
    }

    return segments;
  }

  protected getFood(): GridFood[] {
    const food: GridFood[] = [];

    // Show preview pipe indicator near cursor
    if (this.cursorCell) {
      food.push({
        x: Math.min(this.gridWidth - 1, Math.max(0, this.cursorCell.x)),
        y: Math.min(this.gridHeight - 1, Math.max(0, this.cursorCell.y)),
        color: this.config.pipeColor,
      });
    }

    return food;
  }

  private advanceFlow(): void {
    if (!this.flowHead) return;

    // Find next cell based on current direction
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    const nextX = this.flowHead.x + dx[this.flowDirection];
    const nextY = this.flowHead.y + dy[this.flowDirection];

    // Check bounds
    if (nextX < 0 || nextX >= this.gridWidth || nextY < 0 || nextY >= this.gridHeight) {
      this.endGame();
      return;
    }

    // Check if there's a pipe
    const nextPipe = this.board[nextY][nextX];
    if (!nextPipe) {
      this.endGame();
      return;
    }

    // Check if pipe connects from our direction
    const entryDir = (this.flowDirection + 2) % 4; // opposite direction
    const pipeType = PIPE_TYPES[nextPipe.type];
    if (!pipeType.connections[entryDir]) {
      this.endGame();
      return;
    }

    // Find exit direction
    let exitDir = -1;
    for (let d = 0; d < 4; d++) {
      if (d !== entryDir && pipeType.connections[d]) {
        exitDir = d;
        break;
      }
    }

    if (exitDir === -1) {
      this.endGame();
      return;
    }

    // Move flow to next cell
    nextPipe.filled = true;
    this.flowHead = { x: nextX, y: nextY };
    this.flowDirection = exitDir;
    this.addScore(this.config.flowScore);
  }

  private updateStatus(): void {
    if (this.state.isGameOver) {
      this.setStatus(`Game Over! Pipes: ${this.pipesPlaced}`);
    } else if (!this.flowStarted) {
      const countdown = Math.ceil(this.flowDelay / 1000);
      this.setStatus(`Flow starts in ${countdown}s - Place pipes!`);
    } else {
      this.setStatus(`${this.config.scoreLabel}: ${this.pipesPlaced}`);
    }
  }
}

export function createPipeGame(config?: Partial<PipeGameConfig>) {
  return new PipeGame(config);
}
